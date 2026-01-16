'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI, servicesAPI, eventsAPI, authAPI, roomsAPI, roommatesAPI } from '@/lib/api';

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
  const [activeTab, setActiveTab] = useState<'users' | 'services' | 'events' | 'rooms' | 'roommates'>('services');
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
    image_url: '',
    map_link: '',
    imageFile: null as File | null,
  });

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    map_link: '',
    register_link: '',
    image_url: '',
    imageFile: null as File | null,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Rooms state
  const [newRoom, setNewRoom] = useState({
    title: '',
    description: '',
    rent: '',
    distance_km: '',
    amenities: '',
    contact: '',
    image_url: '',
    map_link: '',
    room_type: 'single' as 'single' | 'double' | 'triple' | 'shared',
    furnishing: 'semi-furnished' as 'unfurnished' | 'semi-furnished' | 'fully-furnished',
    available: true,
    imageFile: null as File | null,
  });
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Roommates state
  const [newRoommate, setNewRoommate] = useState({
    name: '',
    gender: 'any' as 'male' | 'female' | 'any',
    budget: '',
    location: '',
    preferences: '',
    contact: '',
    image_url: '',
    available: true,
    imageFile: null as File | null,
  });
  const [roommates, setRoommates] = useState<any[]>([]);
  const [loadingRoommates, setLoadingRoommates] = useState(false);

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
          loadRooms();
          loadRoommates();
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
      
      // Handle image upload if file exists
      let imageUrl = newService.image_url;
      if (newService.imageFile) {
        const formData = new FormData();
        formData.append('file', newService.imageFile);
        formData.append('bucket', 'service-images');
        
        const uploadRes = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => ({}));
          throw new Error(uploadErr?.error || 'Failed to upload image');
        }
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }
      
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
          image_url: imageUrl,
          map_link: newService.map_link,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || 'Failed to add service');
      }
      setMessage('Service added successfully!');
      setNewService({ name: '', description: '', price: '', category: 'veg', available: true, image_url: '', map_link: '', imageFile: null });
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

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await roomsAPI.getRoomsByOwner();
      setRooms(res.data.data || []);
    } catch (_) {
      // ignore
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadRoommates = async () => {
    setLoadingRoommates(true);
    try {
      const res = await roommatesAPI.getRoommatesByOwner();
      setRoommates(res.data.data || []);
    } catch (_) {
      // ignore
    } finally {
      setLoadingRoommates(false);
    }
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      // Validate registration link if provided
      if (newEvent.register_link && !isValidUrl(newEvent.register_link)) {
        throw new Error('Please enter a valid registration link URL');
      }
      
      // Handle image upload if file exists
      let imageUrl = newEvent.image_url;
      if (newEvent.imageFile) {
        const formData = new FormData();
        formData.append('file', newEvent.imageFile);
        formData.append('bucket', 'event-images');
        
        const uploadRes = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => ({}));
          throw new Error(uploadErr?.error || 'Failed to upload image');
        }
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }
      
      await eventsAPI.createEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        location: newEvent.location,
        map_link: newEvent.map_link,
        register_link: newEvent.register_link,
        image_url: imageUrl,
      });
      setMessage('Event added successfully!');
      setNewEvent({ title: '', description: '', date: '', location: '', map_link: '', register_link: '', image_url: '', imageFile: null });
      loadEvents();
    } catch (e: any) {
      setMessage(e?.message || 'Failed to add event');
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const rentNum = parseFloat(newRoom.rent || '0');
      const distanceNum = newRoom.distance_km ? parseFloat(newRoom.distance_km) : null;
      const amenitiesArray = newRoom.amenities.split(',').map(a => a.trim()).filter(a => a);

      // Handle image upload if file exists
      let imageUrl = newRoom.image_url;
      if (newRoom.imageFile) {
        const formData = new FormData();
        formData.append('file', newRoom.imageFile);
        formData.append('bucket', 'room-images');
        
        const uploadRes = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => ({}));
          throw new Error(uploadErr?.error || 'Failed to upload image');
        }
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      await fetch('/api/admin/add-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newRoom.title,
          description: newRoom.description,
          rent: rentNum,
          distance_km: distanceNum,
          amenities: amenitiesArray,
          contact: newRoom.contact,
          image_url: imageUrl,
          map_link: newRoom.map_link,
          room_type: newRoom.room_type,
          furnishing: newRoom.furnishing,
          available: newRoom.available,
          owner_id: adminId,
        }),
      });
      setMessage('Room added successfully!');
      setNewRoom({ title: '', description: '', rent: '', distance_km: '', amenities: '', contact: '', image_url: '', map_link: '', room_type: 'single', furnishing: 'semi-furnished', available: true, imageFile: null });
      loadRooms();
    } catch (e: any) {
      setMessage(e?.message || 'Failed to add room');
    }
  };

  const toggleRoomAvailability = async (room: any) => {
    try {
      await roomsAPI.updateRoom(room.id, { available: !room.available });
      loadRooms();
    } catch (e) {
      // ignore
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      await roomsAPI.deleteRoom(id);
      loadRooms();
    } catch (e) {
      // ignore
    }
  };

  const addRoommate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const budgetNum = newRoommate.budget ? parseFloat(newRoommate.budget) : null;

      // Handle image upload if file exists
      let imageUrl = newRoommate.image_url;
      if (newRoommate.imageFile) {
        const formData = new FormData();
        formData.append('file', newRoommate.imageFile);
        formData.append('bucket', 'roommate-images');
        
        const uploadRes = await fetch('/api/admin/upload-image', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => ({}));
          throw new Error(uploadErr?.error || 'Failed to upload image');
        }
        
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      await fetch('/api/admin/add-roommate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoommate.name,
          gender: newRoommate.gender,
          budget: budgetNum,
          location: newRoommate.location,
          preferences: newRoommate.preferences,
          contact: newRoommate.contact,
          image_url: imageUrl,
          available: newRoommate.available,
          owner_id: adminId,
        }),
      });
      setMessage('Roommate listing added successfully!');
      setNewRoommate({ name: '', gender: 'any', budget: '', location: '', preferences: '', contact: '', image_url: '', available: true, imageFile: null });
      loadRoommates();
    } catch (e: any) {
      setMessage(e?.message || 'Failed to add roommate');
    }
  };

  const toggleRoommateAvailability = async (roommate: any) => {
    try {
      await roommatesAPI.updateRoommate(roommate.id, { available: !roommate.available });
      loadRoommates();
    } catch (e) {
      // ignore
    }
  };

  const deleteRoommate = async (id: string) => {
    try {
      await roommatesAPI.deleteRoommate(id);
      loadRoommates();
    } catch (e) {
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
                onClick={() => setActiveTab('rooms')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'rooms' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Rooms
              </button>
              <button
                onClick={() => setActiveTab('roommates')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'roommates' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Roommates
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
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-sm text-gray-900 mb-2">Service Image</h3>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewService({ ...newService, imageFile: e.target.files?.[0] || null })}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                      {newService.imageFile && (
                        <p className="text-xs text-gray-600 mt-1">Selected: {newService.imageFile.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Google Map Link</label>
                      <input
                        type="url"
                        placeholder="https://maps.google.com/..."
                        value={newService.map_link}
                        onChange={(e) => setNewService({ ...newService, map_link: e.target.value })}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                    </div>
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
                  {message && (
                    <div className={`mb-4 p-3 rounded-md ${message.includes('successfully') || message.includes('added') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {message}
                    </div>
                  )}
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
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-sm text-gray-900 mb-2">Event Image</h3>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewEvent({ ...newEvent, imageFile: e.target.files?.[0] || null })}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                      {newEvent.imageFile && (
                        <p className="text-xs text-gray-600 mt-1">Selected: {newEvent.imageFile.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Google Map Link</label>
                      <input
                        type="url"
                        placeholder="https://maps.google.com/..."
                        value={newEvent.map_link}
                        onChange={(e) => setNewEvent({ ...newEvent, map_link: e.target.value })}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Registration Link *</label>
                      <input
                        type="url"
                        placeholder="https://forms.google.com/... or event registration URL"
                        value={newEvent.register_link}
                        onChange={(e) => setNewEvent({ ...newEvent, register_link: e.target.value })}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                      <p className="text-xs text-gray-600 mt-1">Users will click "Register Now" to open this link</p>
                    </div>
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

          {activeTab === 'rooms' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Manage Rooms</h2>
                </div>
                <div className="p-6">
                  {loadingRooms ? (
                    <div>Loading rooms…</div>
                  ) : rooms.length === 0 ? (
                    <div className="text-gray-600">No rooms found</div>
                  ) : (
                    <div className="space-y-3">
                      {rooms.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex-1">
                            <div className="font-semibold">{r.title}</div>
                            <div className="text-sm text-gray-600">₹{r.rent}/mo · {r.room_type} · {r.distance_km ? `${r.distance_km}km` : 'N/A'}</div>
                            {r.image_url && <div className="text-xs text-blue-600">📷 Image: Yes</div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRoomAvailability(r)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${r.available ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}
                            >
                              {r.available ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => deleteRoom(r.id)}
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
                  <h2 className="text-lg font-medium text-gray-900">Add New Room</h2>
                </div>
                <div className="p-6">
                  {message && (
                    <div className={`mb-4 p-3 rounded-md text-sm ${message.includes('added') || message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {message}
                    </div>
                  )}
                  <form onSubmit={addRoom} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Room Title"
                      value={newRoom.title}
                      onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={newRoom.description}
                      onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      rows={2}
                    />
                    <input
                      type="number"
                      placeholder="Rent (₹/month)"
                      value={newRoom.rent}
                      onChange={(e) => setNewRoom({ ...newRoom, rent: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      required
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Distance (km)"
                      value={newRoom.distance_km}
                      onChange={(e) => setNewRoom({ ...newRoom, distance_km: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      step="0.1"
                    />
                    <select
                      value={newRoom.room_type}
                      onChange={(e) => setNewRoom({ ...newRoom, room_type: e.target.value as any })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                      <option value="shared">Shared</option>
                    </select>
                    <select
                      value={newRoom.furnishing}
                      onChange={(e) => setNewRoom({ ...newRoom, furnishing: e.target.value as any })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi-furnished">Semi-Furnished</option>
                      <option value="fully-furnished">Fully-Furnished</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Amenities (comma-separated)"
                      value={newRoom.amenities}
                      onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Contact Number"
                      value={newRoom.contact}
                      onChange={(e) => setNewRoom({ ...newRoom, contact: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      required
                    />
                    <input
                      type="url"
                      placeholder="Map Link (Google Maps)"
                      value={newRoom.map_link}
                      onChange={(e) => setNewRoom({ ...newRoom, map_link: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                    <div className="border-2 border-dashed rounded-lg p-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewRoom({ ...newRoom, imageFile: e.target.files?.[0] || null })}
                        className="w-full text-sm"
                      />
                      {newRoom.imageFile && <p className="text-xs text-green-600 mt-1">✓ {newRoom.imageFile.name}</p>}
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary-600 text-white py-2 rounded-md font-semibold text-sm hover:bg-primary-700"
                    >
                      Add Room
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roommates' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Manage Roommate Listings</h2>
                </div>
                <div className="p-6">
                  {loadingRoommates ? (
                    <div>Loading roommate listings…</div>
                  ) : roommates.length === 0 ? (
                    <div className="text-gray-600">No roommate listings found</div>
                  ) : (
                    <div className="space-y-3">
                      {roommates.map((rm: any) => (
                        <div key={rm.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex-1">
                            <div className="font-semibold">{rm.name}</div>
                            <div className="text-sm text-gray-600">{rm.gender} · Budget: ₹{rm.budget || 'N/A'} · {rm.location || 'N/A'}</div>
                            {rm.image_url && <div className="text-xs text-blue-600">📷 Image: Yes</div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRoommateAvailability(rm)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${rm.available ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}
                            >
                              {rm.available ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => deleteRoommate(rm.id)}
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
                  <h2 className="text-lg font-medium text-gray-900">Add Roommate Listing</h2>
                </div>
                <div className="p-6 max-h-[600px] overflow-y-auto">
                  {message && (
                    <div className={`mb-4 p-3 rounded-md text-sm ${message.includes('added') || message.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      {message}
                    </div>
                  )}
                  <form onSubmit={addRoommate} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newRoommate.name}
                      onChange={(e) => setNewRoommate({ ...newRoommate, name: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      required
                    />
                    <select
                      value={newRoommate.gender}
                      onChange={(e) => setNewRoommate({ ...newRoommate, gender: e.target.value as any })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="any">Any</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Budget (₹/month)"
                      value={newRoommate.budget}
                      onChange={(e) => setNewRoommate({ ...newRoommate, budget: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      min="0"
                    />
                    <input
                      type="text"
                      placeholder="Location/Area"
                      value={newRoommate.location}
                      onChange={(e) => setNewRoommate({ ...newRoommate, location: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                    <textarea
                      placeholder="Preferences"
                      value={newRoommate.preferences}
                      onChange={(e) => setNewRoommate({ ...newRoommate, preferences: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      rows={2}
                    />
                    <input
                      type="tel"
                      placeholder="Contact Number"
                      value={newRoommate.contact}
                      onChange={(e) => setNewRoommate({ ...newRoommate, contact: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      required
                    />
                    <div className="border-2 border-dashed rounded-lg p-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setNewRoommate({ ...newRoommate, imageFile: e.target.files?.[0] || null })}
                        className="w-full text-sm"
                      />
                      {newRoommate.imageFile && <p className="text-xs text-green-600 mt-1">✓ {newRoommate.imageFile.name}</p>}
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary-600 text-white py-2 rounded-md font-semibold text-sm hover:bg-primary-700"
                    >
                      Add Roommate
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
