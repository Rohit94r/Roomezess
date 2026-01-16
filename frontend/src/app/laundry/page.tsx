'use client';

import { useState, useEffect } from 'react';
import { servicesAPI } from '@/lib/api';

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

export default function LaundryPage() {
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await servicesAPI.getServicesByType('laundry');
            const serviceData = response.data.data || response.data || [];
            setItems(serviceData);
        } catch (error) {
            console.error('Error fetching laundry services:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl font-semibold text-gray-700">Loading laundry services...</div>
            </div>
        );
    }

    return (
        <div className="pb-20 lg:pb-0">
            <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                        🧺 Laundry Services
                    </h1>
                    <p className="text-gray-600 mt-2">Professional laundry pickup and delivery for students.</p>
                </div>

                <div className="w-full">
                    {items.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center border border-gray-100">
                            <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.874-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                            </svg>
                            <h3 className="mt-4 text-base sm:text-lg font-semibold text-gray-900">No laundry services available</h3>
                            <p className="mt-2 text-sm sm:text-base text-gray-500">Check back later for new laundry providers.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 active:scale-[0.98]">
                                    {item.image_url || item.image ? (
                                        <img src={item.image_url || item.image} alt={item.name} className="w-full h-40 sm:h-48 object-cover" />
                                    ) : (
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 w-full h-40 sm:h-48 flex items-center justify-center">
                                            <span className="text-purple-400 text-3xl">🧺</span>
                                        </div>
                                    )}
                                    <div className="p-4 sm:p-5 md:p-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                                        <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg sm:text-xl font-bold text-primary-600">₹{item.price}</span>
                                            <button className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white py-2 px-4 rounded-xl font-semibold shadow-md transition-all active:scale-95">
                                                Book Now
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
