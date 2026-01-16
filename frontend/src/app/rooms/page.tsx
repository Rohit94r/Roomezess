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
  amenities: string;
  contact: string;
  image_url: string;
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
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleRoommateFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRoommateFilters({
      ...roommateFilters,
      [name]: value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-2">🏠</span> Rooms & Roommates
        </h1>
        {/* Tabs - Mobile Optimized */}
        <div className="bg-white rounded-2xl shadow-md p-1 mb-4 sm:mb-6 md:mb-8 border border-gray-100">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all ${activeTab === 'rooms'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              🏠 Find Rooms
            </button>
            <button
              onClick={() => setActiveTab('roommates')}
              className={`py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all ${activeTab === 'roommates'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              👥 Find Roommates
            </button>
          </div>
        </div>

        {/* Rooms Tab Content */}
        {activeTab === 'rooms' && (
          <>
            {/* Filters - Mobile Optimized */}
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8 border border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter Rooms
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="maxRent" className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Rent (₹)
                  </label>
                  <input
                    type="number"
                    id="maxRent"
                    name="maxRent"
                    value={filters.maxRent}
                    onChange={handleFilterChange}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 text-base py-2.5 px-4"
                    placeholder="Enter max rent"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 text-base py-2.5 px-4"
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Amenities
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['WiFi', 'AC', 'Furnished', 'Attached Bathroom'].map((amenity) => (
                      <label
                        key={amenity}
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${filters.amenities.includes(amenity)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                      >
                        <input
                          id={amenity.toLowerCase()}
                          name="amenities"
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({
                                ...filters,
                                amenities: [...filters.amenities, amenity],
                              });
                            } else {
                              setFilters({
                                ...filters,
                                amenities: filters.amenities.filter(a => a !== amenity),
                              });
                            }
                          }}
                          className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms List - Mobile Optimized */}
            {rooms.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center">
                <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <h3 className="mt-4 text-base sm:text-lg font-semibold text-gray-900">No rooms available</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-500">Get started by adding a new room listing.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {rooms.map((room) => (
                  <div key={room.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 active:scale-[0.98]">
                    <div className="h-40 sm:h-48 bg-gradient-to-br from-blue-100 to-blue-200 border-b border-gray-200 w-full flex items-center justify-center relative overflow-hidden">
                      {room.image_url ? (
                        <img src={room.image_url} alt={room.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-600 text-sm font-medium">🏠 Room Image</span>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${room.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {room.available ? 'Available' : 'Taken'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 md:p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 pr-2 flex-1">{room.title}</h3>
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600 flex-shrink-0">₹{room.rent}<span className="text-xs text-gray-500">/mo</span></span>
                      </div>
                      <p className="mt-2 text-sm sm:text-base text-gray-600 line-clamp-2 mb-4">{room.description}</p>

                      <div className="mt-4 space-y-2 mb-4">
                        {room.distance_km && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span className="truncate">{room.distance_km} km from college</span>
                          </div>
                        )}
                        {room.room_type && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                            </svg>
                            <span className="capitalize">{room.room_type}</span>
                          </div>
                        )}
                        {room.furnishing && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4m0 0L4 7m16 0l-8 4m0 0l8 4m-8-4v5m0 0l-8-4m0 0v5"></path>
                            </svg>
                            <span className="capitalize">{room.furnishing}</span>
                          </div>
                        )}
                      </div>

                      {room.amenities && (
                        <div className="mt-4 mb-4">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">Amenities:</h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                              {room.amenities}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <a
                          href={`tel:${room.contact}`}
                          className="block w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white py-2.5 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-95 text-center"
                        >
                          📞 {room.contact}
                        </a>
                        {room.map_link && (
                          <a
                            href={room.map_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-95 text-center"
                          >
                            📍 View Location
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Roommates Tab Content */}
        {activeTab === 'roommates' && (
          <>
            {/* Roommate Filters */}
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8 border border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter Roommates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="maxBudget" className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Budget (₹)
                  </label>
                  <input
                    type="number"
                    id="maxBudget"
                    name="maxBudget"
                    value={roommateFilters.maxBudget}
                    onChange={handleRoommateFilterChange}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 text-base py-2.5 px-4"
                    placeholder="Enter max budget"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={roommateFilters.gender}
                    onChange={handleRoommateFilterChange}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 text-base py-2.5 px-4"
                  >
                    <option value="">Any</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="course" className="block text-sm font-semibold text-gray-700 mb-2">
                    Course
                  </label>
                  <input
                    type="text"
                    id="course"
                    name="course"
                    value={roommateFilters.course}
                    onChange={handleRoommateFilterChange}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 text-base py-2.5 px-4"
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <label htmlFor="foodHabit" className="block text-sm font-semibold text-gray-700 mb-2">
                    Food Habit
                  </label>
                  <select
                    id="foodHabit"
                    name="foodHabit"
                    value={roommateFilters.foodHabit}
                    onChange={handleRoommateFilterChange}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 text-base py-2.5 px-4"
                  >
                    <option value="">Any</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Roommates List */}
            {roommates.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center">
                <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <h3 className="mt-4 text-base sm:text-lg font-semibold text-gray-900">No roommates available</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-500">Check back later for new roommate listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {roommates.map((roommate) => (
                  <div key={roommate.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 active:scale-[0.98]">
                    <div className="h-40 sm:h-48 bg-gradient-to-br from-purple-100 to-purple-200 border-b border-gray-200 w-full flex items-center justify-center relative overflow-hidden">
                      {roommate.image_url ? (
                        <img src={roommate.image_url} alt={roommate.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">👤</span>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${roommate.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {roommate.available ? 'Available' : 'Taken'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 md:p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex-1">{roommate.name}</h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ml-2 ${
                          roommate.gender === 'male' ? 'bg-blue-100 text-blue-700' :
                          roommate.gender === 'female' ? 'bg-pink-100 text-pink-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {roommate.gender ? roommate.gender.charAt(0).toUpperCase() + roommate.gender.slice(1) : 'Any'}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <span className="font-semibold text-primary-600">₹{roommate.budget}/mo</span>
                        </div>
                        {roommate.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span>{roommate.location}</span>
                          </div>
                        )}
                        {roommate.preferences && (
                          <div className="flex items-start text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>{roommate.preferences}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <a
                          href={`mailto:${roommate.contact}`}
                          className="block w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white py-2.5 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-95 text-center"
                        >
                          📧 Contact
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
