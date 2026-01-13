'use client';

import { useState } from 'react';
import { servicesAPI } from '@/lib/api';

export default function ServiceProviderDashboard() {
  const [activeTab, setActiveTab] = useState('add-service');
  const serviceType = 'canteen';
  const serviceTypes = [{ value: 'canteen', label: 'Canteen/Restaurant', placeholder: 'e.g., Veg Burger' }];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'veg',
    available: true,
    serviceType: serviceType,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleServiceTypeChange = () => {};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      const response = await servicesAPI.createService({
        ...itemData,
        service_type: serviceType,
      });
      setMessage('Service item added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'veg',
        available: true,
        serviceType: serviceType,
      });
    } catch (error: any) {
      console.error('Error adding service item:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add service item';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Canteen Owner Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Dashboard Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('add-service')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'add-service'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Add Service
              </button>
              <button
                onClick={() => setActiveTab('manage-services')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'manage-services'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Manage Services
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'orders'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Orders
              </button>
            </nav>
          </div>
        </div>

        <div className="py-6">
          {/* Add Service Tab */}
          {activeTab === 'add-service' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Add New Service Item</h2>
              </div>
              <div className="p-6">
                {message && (
                  <div className={`mb-4 p-4 rounded-md ${
                    message.includes('successfully') 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}>
                    {message}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Service Type
                    </label>
                    <div className="mt-1 text-sm font-semibold text-gray-900">Canteen/Restaurant</div>
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Service Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder={serviceTypes.find(t => t.value === serviceType)?.placeholder || 'Enter service name'}
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Describe the service item"
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="e.g., 80"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="veg">Veg</option>
                        <option value="non-veg">Non-Veg</option>
                        <option value="service">Service</option>
                      </select>
                    </div>

                    <div className="flex items-center h-10">
                      <input
                        id="available"
                        name="available"
                        type="checkbox"
                        checked={formData.available}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                        Available Today
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Service Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Manage Services Tab */}
          {activeTab === 'manage-services' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Manage Services</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-500">Manage your services here. (Functionality to be implemented)</p>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-500">View and manage orders here. (Functionality to be implemented)</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
