'use client';

import { useState, useEffect } from 'react';
import { eventsAPI } from '@/lib/api';

interface Event {
  _id: string;
  title: string;
  description: string;
  eventType: 'event' | 'hackathon' | 'workshop';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  registrationLink?: string;
  maxParticipants?: number;
  registeredUsers: string[];
  isPublic: boolean;
  image?: string;
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getEvents();
      const data = (response?.data?.data ?? []) as any[];
      const normalized: Event[] = data.map((ev: any) => ({
        _id: ev.id || String(ev.id || ''),
        title: ev.title || 'Untitled Event',
        description: ev.description || '',
        eventType: (ev.eventType || 'event'),
        date: ev.date,
        startTime: ev.startTime || '',
        endTime: ev.endTime || '',
        location: ev.location || '',
        organizer: ev.organizer || '',
        registeredUsers: [],
        isPublic: true,
        createdAt: ev.created_at || new Date().toISOString(),
      }));
      setEvents(normalized);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = eventTypeFilter === 'all'
    ? events
    : events.filter(event => event.eventType === eventTypeFilter);

  const registerForEvent = async (_eventId: string) => {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading events...</div>
      </div>
    );
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-2">📅</span> Upcoming Events
        </h1>
        {/* Filters - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter Events
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {['all', 'event', 'hackathon', 'workshop'].map((type) => (
              <button
                key={type}
                onClick={() => setEventTypeFilter(type)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-sm ${eventTypeFilter === type
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 active:scale-95'
                  }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Events List - Mobile Optimized */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 sm:p-12 text-center">
            <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <h3 className="mt-4 text-base sm:text-lg font-semibold text-gray-900">No events found</h3>
            <p className="mt-2 text-sm sm:text-base text-gray-500">There are no events matching your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {filteredEvents.map((event) => (
              <div key={event._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 active:scale-[0.98]">
                <div className="h-40 sm:h-48 bg-gradient-to-br from-pink-100 to-pink-200 border-b border-gray-200 w-full flex items-center justify-center relative">
                  <span className="text-gray-600 text-sm font-medium">📅 Event Image</span>
                </div>
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex justify-between items-start">
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${event.eventType === 'event'
                        ? 'bg-purple-100 text-purple-800'
                        : event.eventType === 'hackathon'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                      {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-semibold text-gray-900">{event.title}</h3>
                  <p className="mt-2 text-gray-600">{event.description}</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <span>{event.organizer}</span>
                    </div>
                  </div>

                  {event.maxParticipants && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${(event.registeredUsers.length / event.maxParticipants) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>{event.registeredUsers.length} registered</span>
                        <span>{event.maxParticipants} max</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-between items-center">
                    <button className="text-primary-500 hover:text-primary-700 font-medium">
                      View Details
                    </button>
                    <span className="text-sm text-gray-500">{event.organizer || 'Organized by campus'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
