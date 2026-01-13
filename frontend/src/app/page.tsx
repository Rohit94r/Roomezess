'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      {/* Hero Section - Mobile Optimized */}
      <main>
        <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-primary-50 via-white to-primary-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center max-w-6xl mx-auto">
              <div className="w-full text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                  Your Campus{' '}
                  <span className="text-primary-600">Living</span> &{' '}
                  <span className="text-primary-600">Services</span> Hub
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  Connect with fellow students, find rooms, order food, discover events, and access all campus services in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                  <Link
                    href="/auth"
                    className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold py-3.5 px-6 sm:px-8 rounded-xl text-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/services"
                    className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 font-semibold py-3.5 px-6 sm:px-8 rounded-xl text-center transition-all duration-200"
                  >
                    Explore Services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section - Mobile Optimized Grid */}
        <section className="py-10 sm:py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
              Our Services
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
              {/* Canteen Card */}
              <Link href="/canteen" className="bg-white rounded-2xl shadow-md hover:shadow-xl p-5 sm:p-6 border border-gray-100 hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.032 2.032 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"></path>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Canteen</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">Order food from campus canteen with real-time tracking.</p>
                <span className="text-primary-600 font-semibold text-sm sm:text-base inline-flex items-center">
                  Order Now <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </Link>

              {/* Rooms Card */}
              <Link href="/rooms" className="bg-white rounded-2xl shadow-md hover:shadow-xl p-5 sm:p-6 border border-gray-100 hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Rooms & PG</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">Find rooms, PGs, and connect with roommates near campus.</p>
                <span className="text-primary-600 font-semibold text-sm sm:text-base inline-flex items-center">
                  Find Rooms <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </Link>

              {/* Mess Card */}
              <Link href="/mess" className="bg-white rounded-2xl shadow-md hover:shadow-xl p-5 sm:p-6 border border-gray-100 hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                <div className="bg-gradient-to-br from-green-100 to-green-200 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Mess Services</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">Subscribe to mess services with flexible meal plans.</p>
                <span className="text-primary-600 font-semibold text-sm sm:text-base inline-flex items-center">
                  View Plans <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </Link>

              {/* Laundry Card */}
              <Link href="/laundry" className="bg-white rounded-2xl shadow-md hover:shadow-xl p-5 sm:p-6 border border-gray-100 hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.874-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Laundry</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">Schedule laundry pickup and delivery at your convenience.</p>
                <span className="text-primary-600 font-semibold text-sm sm:text-base inline-flex items-center">
                  Book Service <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </Link>

              {/* Printing Card */}
              <Link href="/printing" className="bg-white rounded-2xl shadow-md hover:shadow-xl p-5 sm:p-6 border border-gray-100 hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Printing</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">Print documents online and collect from campus locations.</p>
                <span className="text-primary-600 font-semibold text-sm sm:text-base inline-flex items-center">
                  Print Now <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </Link>

              {/* Events Card */}
              <Link href="/events" className="bg-white rounded-2xl shadow-md hover:shadow-xl p-5 sm:p-6 border border-gray-100 hover:border-primary-200 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
                <div className="bg-gradient-to-br from-pink-100 to-pink-200 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Events</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">Discover upcoming events, hackathons, and workshops.</p>
                <span className="text-primary-600 font-semibold text-sm sm:text-base inline-flex items-center">
                  View Events <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Community Section - Mobile Optimized */}
        <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-br from-primary-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Campus Community
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed px-2">
                Connect with fellow students, share experiences, and stay updated with campus life.
                Only verified students can access the community features.
              </p>
              <Link
                href="/community"
                className="inline-block bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold py-3.5 px-8 sm:px-10 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Join Community
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-primary-600 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm sm:text-base">R</span>
                </div>
                <h3 className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold">Roomezes</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Your one-stop platform for campus living and daily services.
              </p>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Services</h4>
              <ul className="space-y-2">
                <li><Link href="/services/canteen" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors active:text-primary-400">Canteen</Link></li>
                <li><Link href="/rooms" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors active:text-primary-400">Rooms & PG</Link></li>
                <li><Link href="/mess" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors active:text-primary-400">Mess</Link></li>
                <li><Link href="/services/laundry" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors active:text-primary-400">Laundry</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Community</h4>
              <ul className="space-y-2">
                <li><Link href="/community" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors active:text-primary-400">Discussions</Link></li>
                <li><Link href="/community" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors active:text-primary-400">Lost & Found</Link></li>
                <li><Link href="/community" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors active:text-primary-400">Buy & Sell</Link></li>
                <li><Link href="/events" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors active:text-primary-400">Events</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center">
            <p className="text-sm sm:text-base text-gray-400">
              &copy; {new Date().getFullYear()} Roomezes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
