'use client';

import { useState, useEffect } from 'react';
import { laundryAPI } from '@/lib/supabaseAPI'; // Using new API directly

interface PricingItem {
    item: string;
    price: number;
}

interface LaundryShop {
    id: string;
    name: string;
    description: string;
    price: number; // Base price or min price
    image_url?: string;
    image?: string; // Legacy
    available: boolean;
    pricing_details?: Array<{item: string; price: number}>; // JSONB
    phone?: string;
    address?: string;
}

export default function LaundryPage() {
    const [shops, setShops] = useState<LaundryShop[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedShop, setSelectedShop] = useState<LaundryShop | null>(null);

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            const response = await laundryAPI.getAllShops();
            setShops(response.data.data);
        } catch (error) {
            console.error('Error fetching laundry shops:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20 lg:pb-0">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                        🧺 Laundry Services
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Professional pickup & delivery. Schedule a wash in seconds.
                    </p>
                </div>

                {shops.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-dashed border-gray-300">
                        <p className="text-gray-500 text-xl font-medium">No laundry shops available nearby.</p>
                        <p className="text-gray-400 mt-2">Please check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {shops.map((shop) => (
                            <div key={shop.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group border border-gray-100">
                                <div className="h-48 overflow-hidden relative bg-blue-50">
                                    {(shop.image_url || shop.image) ? (
                                        <img src={shop.image_url || shop.image} alt={shop.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl">👕</div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{shop.name}</h3>
                                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{shop.description}</p>

                                    <div className="flex flex-col space-y-3">
                                        <button
                                            onClick={() => setSelectedShop(shop)}
                                            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            View Price List
                                        </button>

                                        <button className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors active:scale-95">
                                            Book Pickup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Pricing Modal */}
            {selectedShop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-slideUp">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-900">{selectedShop.name} Pricing</h3>
                            <button
                                onClick={() => setSelectedShop(null)}
                                className="p-2 bg-white rounded-full hover:bg-gray-200 shadow-sm transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {selectedShop.pricing_details && selectedShop.pricing_details.length > 0 ? (
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                                        <tr>
                                            <th className="px-4 py-2 text-left rounded-l-lg">Service / Item</th>
                                            <th className="px-4 py-2 text-right rounded-r-lg">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedShop.pricing_details.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3 text-gray-800 font-medium">{item.item}</td>
                                                <td className="px-4 py-3 text-right text-primary-600 font-bold">₹{item.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Pricing details not available online.</p>
                                    <p className="text-sm mt-2">Please call {selectedShop.phone || 'us'} for rates.</p>
                                </div>
                            )}

                            {selectedShop.address && (
                                <div className="mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500">
                                    <span className="font-semibold block mb-1 text-gray-700">Address:</span>
                                    {selectedShop.address}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => setSelectedShop(null)}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold shadow hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
