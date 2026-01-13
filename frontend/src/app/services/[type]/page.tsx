'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { servicesAPI } from '../../../lib/api';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  service_type: 'canteen' | 'printing' | 'laundry' | 'stationery' | 'electronics' | 'tution' | 'mess';
  available: boolean;
  image?: string;
  owner_id: string;
  created_at: string;
  category?: string;
}

export default function ServiceTypePage() {
  const params = useParams();
  const serviceType = params.type as string;
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchServices();
  }, [serviceType]);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getServicesByType(serviceType);
      // Handle the response structure from Supabase API
      const serviceData = response.data.data || response.data || [];
      setItems(serviceData);
    } catch (error) {
      console.error(`Error fetching ${serviceType} services:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading {serviceType} services...</div>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-0">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 capitalize">
            {serviceType} Services
          </h1>
          <p className="text-gray-600 mt-2">Find and book the best {serviceType} services near campus.</p>
        </div>
        <div className="w-full">
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center">
              <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.032 2.032 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path>
              </svg>
              <h3 className="mt-4 text-base sm:text-lg font-semibold text-gray-900">No {serviceType} services available</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-500">Check back later for new {serviceType} services.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 active:scale-[0.98]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={800}
                      height={480}
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-full h-40 sm:h-48 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">📷 No Image</span>
                    </div>
                  )}
                  <div className="p-4 sm:p-5 md:p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 pr-2">{item.name}</h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${item.service_type === 'canteen' || item.service_type === 'mess'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                        }`}>
                        {item.service_type === 'canteen' || item.service_type === 'mess' ? '🍽️' : '🔧'} {item.service_type}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600">₹{item.price}</span>
                    <button
                      className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white py-2.5 px-4 sm:px-5 rounded-xl font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-95"
                      onClick={() => {
                        const target =
                          item.service_type === 'printing' ? '/printing' :
                          item.service_type === 'laundry' ? '/laundry' :
                          item.service_type === 'mess' || item.service_type === 'canteen' ? '/canteen' :
                          '/';
                        router.push(target);
                      }}
                    >
                      Book +
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
