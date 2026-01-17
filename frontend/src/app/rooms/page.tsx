'use client';

import { useState, useEffect } from 'react';
import { roomsAPI, roommatesAPI } from '@/lib/api';

interface Room {
  id: string;
  title: string;
  description: string;
  rent: number;
  distance_km: string;
  room_type: string;
  furnishing: string;
  amenities: string | string[]; // Can be string or array based on DB
  contact: string;
  image_url?: string;
  images?: string[]; // Multiple photos support
  map_link: string;
  available: boolean;
  owner_id: string;
}

interface Roommate {
  id: string;
  name: string;
  gender: string;
  budget: number;
  preferences: string;
  contact: string;
  location: string;
  image_url: string;
  available: boolean;
}

// Room Card Component with Slider
function RoomCard({ room }: { room: Room }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const images = (room.images && room.images.length > 0) ? room.images : (room.image_url ? [room.image_url] : []);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Parse amenities if it's a string (legacy)
  const amenitiesList = Array.isArray(room.amenities)
    ? room.amenities
    : (typeof room.amenities === 'string' ? room.amenities.split(',').map(s => s.trim()) : []);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="h-56 bg-gradient-to-br from-blue-100 to-blue-200 w-full relative overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[currentImgIndex]}
            alt={`${room.title} - View ${currentImgIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500 font-medium">📷 No Images</span>
          </div>
        )}

        {/* Slider Controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {currentImgIndex + 1} / {images.length}
            </div>
          </>
        )}

        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-lg text-xs font-semibold shadow-sm ${room.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {room.available ? 'Available' : 'Taken'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 pr-2 flex-1">{room.title}</h3>
          <span className="text-2xl font-bold text-primary-600 flex-shrink-0">
            ₹{room.rent}<span className="text-sm text-gray-500 font-normal">/mo</span>
          </span>
        </div>

        <p className="mt-2 text-gray-600 line-clamp-2 mb-4 text-sm">{room.description}</p>

        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600 mb-4">
          {room.distance_km && (
            <div className="flex items-center" title="Distance from College">
              <span className="mr-1">🚶</span> {room.distance_km} km
            </div>
          )}
          {room.room_type && (
            <div className="flex items-center capitalize">
              <span className="mr-1">🏠</span> {room.room_type}
            </div>
          )}
          {room.furnishing && (
            <div className="flex items-center capitalize">
              <span className="mr-1">🪑</span> {room.furnishing}
            </div>
          )}
        </div>

        {amenitiesList.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {amenitiesList.slice(0, 4).map((amenity, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {amenity}
              </span>
            ))}
            {amenitiesList.length > 4 && (
              <span className="text-xs text-gray-500 self-center">+{amenitiesList.length - 4} more</span>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
          <a
            href={`tel:${room.contact}`}
            className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors shadow"
          >
            📞 Call Now
          </a>
          {room.map_link && (
            <a
              href={room.map_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              📍 Location
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'roommates'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    maxRent: '',
    location: '',
    amenities: [] as string[],
  });
  // Kept for future use, though currently unused in UI
  const [roommateFilters, setRoommateFilters] = useState({
    maxBudget: '',
    gender: '',
    course: '',
    foodHabit: '',
  });

  useEffect(() => {
    fetchRooms();
    fetchRoommates();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getRooms();
      setRooms(response.data.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoommates = async () => {
    try {
      const response = await roommatesAPI.getRoommates();
      setRoommates(response.data.data);
    } catch (error) {
      console.error('Error fetching roommates:', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleRoommateFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRoommateFilters({ ...roommateFilters, [name]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Accommodation</h1>
            <p className="mt-1 text-gray-500">Find the perfect room or roommate.</p>
          </div>

          <div className="mt-4 md:mt-0 flex p-1 bg-white rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'rooms' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              🏠 Find Rooms
            </button>
            <button
              onClick={() => setActiveTab('roommates')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'roommates' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              👥 Find Roommates
            </button>
          </div>
        </div>

        {activeTab === 'rooms' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  name="maxRent"
                  placeholder="Max Rent (₹)"
                  value={filters.maxRent}
                  onChange={handleFilterChange}
                  className="border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full"
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location / Area"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 w-full"
                />
                {/* Simplified amenities for now */}
                <div className="flex items-center text-sm text-gray-500">
                  More filters coming soon...
                </div>
              </div>
            </div>

            {rooms.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No rooms listed yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map(room => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'roommates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roommates.map((roommate) => (
              <div key={roommate.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col items-center text-center">
                <img src={roommate.image_url || 'https://via.placeholder.com/150'} alt={roommate.name} className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-primary-50" />
                <h3 className="text-xl font-bold text-gray-900">{roommate.name}</h3>
                <p className="text-gray-500 text-sm">{roommate.location}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">₹{roommate.budget}</span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium capitalize">{roommate.gender}</span>
                </div>
                <p className="mt-4 text-sm text-gray-600 line-clamp-2">&ldquo;{roommate.preferences}&rdquo;</p>
                <button className="mt-6 w-full bg-primary-600 text-white py-2 rounded-xl font-semibold shadow hover:bg-primary-700 transition-colors">
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
