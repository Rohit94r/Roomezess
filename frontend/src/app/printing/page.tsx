'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { servicesAPI, ordersAPI } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface ServiceItem {
    id: string;
    name: string;
    description: string;
    price: number;
    service_type: string;
    available: boolean;
    image_url?: string;
    image?: string;
    owner_id: string;
    created_at: string;
}

export default function PrintingPage() {
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedPath, setUploadedPath] = useState<string | null>(null);
    const [publicUrl, setPublicUrl] = useState<string | null>(null);
    const [copies, setCopies] = useState<number>(1);
    const [pages, setPages] = useState<number>(1);
    const [pageSize, setPageSize] = useState<'A4' | 'A3'>('A4');
    const [colorMode, setColorMode] = useState<'color' | 'bw'>('bw');
    const [sides, setSides] = useState<'single' | 'double'>('single');
    const [placingOrder, setPlacingOrder] = useState(false);
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await servicesAPI.getServicesByType('printing');
            const serviceData = response.data.data || response.data || [];
            setItems(serviceData);
        } catch (error) {
            console.error('Error fetching printing services:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };
    
    const calcPricePerPage = () => {
        const base = colorMode === 'color' ? 5 : 2;
        const sizeMultiplier = pageSize === 'A3' ? 1.5 : 1.0;
        const duplexDiscount = sides === 'double' ? 0.9 : 1.0;
        return Math.round(base * sizeMultiplier * duplexDiscount);
    };
    
    const totalPrice = () => {
        const perPage = calcPricePerPage();
        const total = perPage * pages * copies;
        return total;
    };
    
    const ensureRazorpayScript = async () => {
        if (window.Razorpay) return;
        await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Razorpay'));
            document.body.appendChild(script);
        });
    };
    
    const handleUpload = async () => {
        if (!file) {
            setMessage('Please select a document to upload');
            return;
        }
        setUploading(true);
        setMessage('');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const uid = user?.id || 'anonymous';
            const timestamp = Date.now();
            const path = `${uid}/${timestamp}-${file.name}`;
            const { error: uploadError } = await supabase.storage.from('printing').upload(path, file, {
                upsert: false
            });
            if (uploadError) {
                setMessage(uploadError.message || 'Upload failed. Ensure the printing bucket exists.');
                setUploading(false);
                return;
            }
            setUploadedPath(path);
            const { data: pub } = supabase.storage.from('printing').getPublicUrl(path);
            setPublicUrl(pub.publicUrl);
            setMessage('Document uploaded successfully');
        } catch (e: any) {
            setMessage(e.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };
    
  const placeOrder = async () => {
    setPlacingOrder(true);
    setMessage('');
    try {
      const price = totalPrice();
      const orderItem = {
        item: 'printing',
        name: `Printing ${pageSize} ${colorMode} ${sides}`,
        quantity: copies,
        price: price,
        fileUrl: publicUrl,
        pages
      };
      await ordersAPI.createOrder({
        items: [orderItem],
        totalPrice: price,
        notes: `Printing job: ${pageSize}, ${colorMode}, ${sides}, ${pages} pages, ${copies} copies`
      });
      setMessage('Order placed successfully. Emailing service provider…');
      if (publicUrl) {
        const subject = encodeURIComponent('New Print Job Request');
        const body = encodeURIComponent(
          `Hello,\n\nA new print job has been placed.\n\nDetails:\n- Page Size: ${pageSize}\n- Color: ${colorMode}\n- Sides: ${sides}\n- Pages: ${pages}\n- Copies: ${copies}\n- Estimated Total: ₹${totalPrice()}\n\nDocument URL:\n${publicUrl}\n\nPlease process this order.\n\nRoomezes`
        );
        const mailto = `mailto:rjdhav67@gmail.com?subject=${subject}&body=${body}`;
        window.open(mailto, '_blank');
      }
    } catch (e: any) {
      setMessage(e.data?.message || e.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };
    
    const payOnline = async () => {
      try {
        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!key) {
          setMessage('Online payment key not configured. Proceeding without payment.');
          await placeOrder();
          return;
        }
        await ensureRazorpayScript();
        const amountPaise = totalPrice() * 100;
        const options = {
          key,
          amount: amountPaise,
          currency: 'INR',
          name: 'Roomezes Printing',
          description: 'Document printing',
          handler: async () => {
            await placeOrder();
          },
          prefill: {},
          theme: { color: '#4F46E5' }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        } catch (e: any) {
            setMessage(e.message || 'Payment initialization failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl font-semibold text-gray-700">Loading printing services...</div>
            </div>
        );
    }

    return (
        <div className="pb-20 lg:pb-0">
            <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                        🖨️ Printing Services
                    </h1>
                    <p className="text-gray-600 mt-2">Print and collect your documents online from campus hubs.</p>
                </div>
                
                <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-700 mb-4"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(e.target.value as 'A4' | 'A3')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="A4">A4</option>
                                <option value="A3">A3</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
                            <select
                                value={colorMode}
                                onChange={(e) => setColorMode(e.target.value as 'color' | 'bw')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="bw">Black & White</option>
                                <option value="color">Colour</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sides</label>
                            <select
                                value={sides}
                                onChange={(e) => setSides(e.target.value as 'single' | 'double')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="single">Single-sided</option>
                                <option value="double">Double-sided</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Copies</label>
                            <input
                                type="number"
                                min={1}
                                value={copies}
                                onChange={(e) => setCopies(parseInt(e.target.value || '1', 10))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                            <input
                                type="number"
                                min={1}
                                value={pages}
                                onChange={(e) => setPages(parseInt(e.target.value || '1', 10))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-gray-700">
                            <div className="text-sm">Estimated price per page: ₹{calcPricePerPage()}</div>
                            <div className="text-lg font-semibold">Total: ₹{totalPrice()}</div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleUpload}
                                disabled={uploading || !file}
                                className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-60"
                            >
                                {uploading ? 'Uploading...' : uploadedPath ? 'Re-upload' : 'Upload'}
                            </button>
                            <button
                                onClick={payOnline}
                                disabled={placingOrder || !uploadedPath}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-60"
                            >
                                Pay Online & Order
                            </button>
                            <button
                                onClick={placeOrder}
                                disabled={placingOrder || !uploadedPath}
                                className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-60"
                            >
                                Confirm Order
                            </button>
                        </div>
                    </div>
                    {message && (
                        <div className="mt-3 text-sm text-gray-700">
                            {message}
                        </div>
                    )}
                    {publicUrl && (
                        <div className="mt-3 text-sm">
                            File URL: <a className="text-primary-600 underline" href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a>
                        </div>
                    )}
                </div>

                <div className="w-full">
                    {items.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center border border-gray-100">
                            <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                            </svg>
                            <h3 className="mt-4 text-base sm:text-lg font-semibold text-gray-900">No printing services available</h3>
                            <p className="mt-2 text-sm sm:text-base text-gray-500">Online printing services will be available soon.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 active:scale-[0.98]">
                                    {item.image_url || item.image ? (
                                        <Image src={item.image_url || item.image} alt={item.name} width={800} height={480} className="w-full h-40 sm:h-48 object-cover" />
                                    ) : (
                                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 w-full h-40 sm:h-48 flex items-center justify-center">
                                            <span className="text-indigo-400 text-3xl">🖨️</span>
                                        </div>
                                    )}
                                    <div className="p-4 sm:p-5 md:p-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                                        <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg sm:text-xl font-bold text-primary-600">₹{item.price}</span>
                                            <button className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white py-2 px-4 rounded-xl font-semibold shadow-md transition-all active:scale-95">
                                                Print Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
