'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI, servicesAPI, eventsAPI, authAPI } from '@/lib/api';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  service_type: 'canteen' | 'printing' | 'laundry' | 'mess';
  available: boolean;
  image?: string;
  owner_id: string;
  category?: string;
  created_at: string;
}

interface UserRow {
  id: string;
  email: string;
  name?: string;
  role?: string;
  is_verified?: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [adminId, setAdminId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'users' | 'services' | 'events'>('services');
  const [serviceType, setServiceType] = useState<'canteen' | 'printing' | 'laundry' | 'mess'>('mess');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [message, setMessage] = useState('');

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    category: 'veg',
    available: true,
  });

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.getProfile();
        const email = res?.data?.user?.email;
        if (email === 'rjdhav67@gmail.com') {
          setAuthorized(true);
          setAdminId(res?.data?.user?.id || '');
          loadServices();
          loadUsers();
          loadEvents();
        } else {
          setAuthorized(false);
          router.push('/');
        }
      } catch (_) {
        setAuthorized(false);
        router.push('/');
      } finally {
        setAuthChecking(false);
      }
    })();
  }, []);

  useEffect(() => {
    loadServices();
  }, [serviceType]);

  const loadServices = async () => {
    setLoadingServices(true);
    setMessage('');
    try {
      const res = await servicesAPI.getServicesByType(serviceType);
      const data = res.data.data || [];
      setServices(data as ServiceItem[]);
    } catch (e: any) {
      setMessage(e?.message || 'Failed to load services');
    } finally {
      setLoadingServices(false);
    }
  };

  const addService = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const priceNum = parseFloat(newService.price || '0');
      const res = await fetch('/api/admin/add-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newService.name,
          description: newService.description,
          price: priceNum,
          category: newService.category,
          service_type: serviceType,
          available: newService.available,
          owner_id: adminId,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed to add service');
      }
      setMessage('Service added');
      setNewService({ name: '', description: '', price: '', category: 'veg', available: true });
      loadServices();
    } catch (e: any) {
      setMessage(e?.message || 'Failed to add service');
    }
  };

  const toggleServiceAvailability = async (item: ServiceItem) => {
    try {
      await servicesAPI.updateService(item.id, { available: !item.available });
      loadServices();
    } catch (e) {
      // ignore
    }
  };

  const deleteService = async (id: string) => {
    try {
      await servicesAPI.deleteService(id);
      loadServices();
    } catch (e) {
      // ignore
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.data || []);
    } catch (_) {
      // ignore
    } finally {
      setLoadingUsers(false);
    }
  };

  const verifyUser = async (id: string, isVerified: boolean) => {
    try {
      await adminAPI.verifyStudent(id, isVerified);
      loadUsers();
    } catch (_) {
      // ignore
    }
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await eventsAPI.getEvents();
      setEvents(res.data.data || []);
    } catch (_) {
      // ignore
    } finally {
      setLoadingEvents(false);
    }
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventsAPI.createEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        location: newEvent.location,
      });
      setNewEvent({ title: '', description: '', date: '', location: '' });
      loadEvents();
    } catch (_) {
      // ignore
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Checking admin access…</div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('services')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'services' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Services
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'events' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Events
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'users' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Users
              </button>
            </nav>
          </div>
        </div>

        <div className="py-6">
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Manage Services</h2>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="border rounded-md px-3 py-2"
                  >
                    <option value="mess">Mess</option>
                    <option value="canteen">Canteen</option>
                    <option value="printing">Printing</option>
                    <option value="laundry">Laundry</option>
                  </select>
                </div>
                <div className="p-6">
                  {loadingServices ? (
                    <div>Loading services…</div>
                  ) : services.length === 0 ? (
                    <div className="text-gray-600">No services found</div>
                  ) : (
                    <div className="space-y-3">
                      {services.map((s) => (
                        <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <div className="font-semibold">{s.name}</div>
                            <div className="text-sm text-gray-600">₹{s.price} · {s.category || 'general'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleServiceAvailability(s)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${s.available ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}
                            >
                              {s.available ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => deleteService(s.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Add New Service</h2>
                </div>
                <div className="p-6">
                  {message && (
                    <div className={`mb-4 p-3 rounded-md ${message.includes('added') || message.includes('Service added') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {message}
                    </div>
                  )}
                  <form onSubmit={addService} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      rows={3}
                    />
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required
                      min="0"
                      step="0.01"
                    />
                    <select
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                      <option value="service">Service</option>
                    </select>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newService.available}
                        onChange={(e) => setNewService({ ...newService, available: e.target.checked })}
                      />
                      Available Today
                    </label>
                    <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg">
                      Add Service
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Existing Events</h2>
                </div>
                <div className="p-6">
                  {loadingEvents ? (
                    <div>Loading events…</div>
                  ) : events.length === 0 ? (
                    <div className="text-gray-600">No events found</div>
                  ) : (
                    <div className="space-y-3">
                      {events.map((ev: any) => (
                        <div key={ev.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <div className="font-semibold">{ev.title}</div>
                            <div className="text-sm text-gray-600">{ev.date} · {ev.location}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Add New Event</h2>
                </div>
                <div className="p-6">
                  <form onSubmit={addEvent} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      rows={3}
                    />
                    <input
                      type="date"
                      placeholder="Date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                    <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg">
                      Add Event
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Users</h2>
              </div>
              <div className="p-6">
                {loadingUsers ? (
                  <div>Loading users…</div>
                ) : users.length === 0 ? (
                  <div className="text-gray-600">No users found</div>
                ) : (
                  <div className="space-y-3">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <div className="font-semibold">{u.name || u.email}</div>
                          <div className="text-sm text-gray-600">{u.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${u.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {u.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                          <button
                            onClick={() => verifyUser(u.id, !u.is_verified)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${u.is_verified ? 'bg-gray-100 text-gray-800' : 'bg-primary-100 text-primary-700'}`}
                          >
                            {u.is_verified ? 'Unverify' : 'Verify'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
