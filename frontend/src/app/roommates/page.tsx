'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { roommatesAPI } from '../../lib/api';

interface Roommate {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'any';
  budget: number;
  location: string;
  preferences: string;
  contact: string;
  image_url?: string;
  available: boolean;
  owner_id: string;
  created_at: string;
}

export default function RoommatesPage() {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female' | 'any'>('all');

  useEffect(() => {
    fetchRoommates();
  }, []);

  const fetchRoommates = async () => {
    try {
      const response = await roommatesAPI.getRoommates();
      const roommateData = response.data.data || response.data || [];
      setRoommates(roommateData);
    } catch (error) {
      console.error('Error fetching roommates:', error);
      setRoommates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoommates = filterGender === 'all' 
    ? roommates 
    : roommates.filter(rm => rm.gender === filterGender);

  const genderEmoji = (gender: string) => {
    switch (gender) {
      case 'male': return '👨';
      case 'female': return '👩';
      default: return '👤';
    }
  };

  const genderColor = (gender: string) => {
    switch (gender) {
      case 'male': return 'bg-blue-100 text-blue-700';
      case 'female': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading roommates...</div>
      </div>
    );
  }

  return (
    <div className="pb-20 lg:pb-0">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Find Your Roommate
          </h1>
          <p className="text-gray-600 mt-2">Browse available roommates and connect with them.</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'male', 'female', 'any'].map((gender) => (
            <button
              key={gender}
              onClick={() => setFilterGender(gender as any)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                filterGender === gender
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {gender === 'any' ? '👤 Any' : gender === 'male' ? '👨 Male' : gender === 'female' ? '👩 Female' : '🔄 All'}
            </button>
          ))}
        </div>

        <div className="w-full">
          {filteredRoommates.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z"
                ></path>
              </svg>
              <h3 className="mt-4 text-base sm:text-lg font-semibold text-gray-900">
                No roommates available
              </h3>
              <p className="mt-2 text-sm sm:text-base text-gray-500">
                Check back later for new roommate listings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {filteredRoommates.map((roommate) => (
                <div
                  key={roommate.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 active:scale-[0.98]"
                >
                  {/* Profile Image */}
                  {roommate.image_url ? (
                    <Image
                      src={roommate.image_url}
                      alt={roommate.name}
                      width={800}
                      height={480}
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-full h-40 sm:h-48 flex items-center justify-center">
                      <span className="text-gray-400 text-3xl">👤</span>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 md:p-6">
                    {/* Name and Gender */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 pr-2">
                        {roommate.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${genderColor(
                          roommate.gender
                        )}`}
                      >
                        {genderEmoji(roommate.gender)} {roommate.gender}
                      </span>
                    </div>

                    {/* Budget */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="text-lg sm:text-xl font-bold text-primary-600">₹{roommate.budget}/month</p>
                    </div>

                    {/* Location */}
                    {roommate.location && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">📍 Location</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900">{roommate.location}</p>
                      </div>
                    )}

                    {/* Preferences */}
                    {roommate.preferences && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">Preferences</p>
                        <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">
                          {roommate.preferences}
                        </p>
                      </div>
                    )}

                    {/* Contact Button */}
                    <button
                      onClick={() => {
                        // Copy contact to clipboard or open messaging
                        const message = `Hi ${roommate.name}, I'm interested in being your roommate. Contact: ${roommate.contact}`;
                        window.location.href = `mailto:?subject=Roommate Inquiry&body=${encodeURIComponent(message)}`;
                      }}
                      className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white py-2.5 px-4 rounded-xl font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                      📞 {roommate.contact}
                    </button>
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
