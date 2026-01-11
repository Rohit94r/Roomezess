'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authAPI } from '@/lib/api';

interface User {
  role: string;
  serviceType?: string;
  isVerified: boolean;
}

interface NavHeaderProps {
  currentPage?: string;
}

export default function NavHeader({ currentPage: propCurrentPage }: NavHeaderProps) {
  const pathname = usePathname();

  // Determine current page based on pathname if not provided
  const currentPage = propCurrentPage || pathname?.split('/')[1] || 'home';

  // Normalize the current page for comparison
  const normalizedCurrentPage = currentPage.toLowerCase();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Rooms', href: '/rooms' },
    { name: 'Laundry', href: '/laundry' },
    { name: 'Printing', href: '/printing' },
    { name: 'Mess', href: '/mess' },
    { name: 'Community', href: '/community' },
    { name: 'Events', href: '/events' },
  ];

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-500 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center flex-1">
            <Link href="/" className="flex-shrink-0 flex items-center active:opacity-80">
              <div className="bg-white w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md">
                <span className="text-primary-600 font-bold text-lg sm:text-xl">R</span>
              </div>
              <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-white">Roomezes</span>
            </Link>
            <nav className="hidden md:ml-8 md:flex md:space-x-1 lg:space-x-4">
              {navItems.map((item) => {
                // Only show community link if user is verified
                if (item.name === 'Community' && user && !user.isVerified) {
                  return null;
                }
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${normalizedCurrentPage === item.name.toLowerCase()
                      ? 'bg-white text-primary-600 shadow-md'
                      : 'text-white/90 hover:bg-white/20 hover:text-white'
                      }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center md:space-x-3">
              {user ? (
                <>
                  {user.role === 'owner' && (
                    <Link
                      href={
                        user.serviceType === 'printing' ? '/printing-owner' :
                          user.serviceType === 'laundry' ? '/laundry-owner' :
                            '/canteen-owner'
                      }
                      className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition shadow-sm"
                    >
                      {user.serviceType === 'printing' ? 'Printing Dashboard' :
                        user.serviceType === 'laundry' ? 'Laundry Dashboard' :
                          'Canteen Dashboard'}
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/owner-dashboard" className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition shadow-sm">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        await authAPI.logout();
                      } catch (e) {
                        // ignore and proceed with local cleanup
                      }
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/';
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition shadow-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/auth" className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition shadow-sm">
                  Login
                </Link>
              )}
            </div>
            <button
              className="md:hidden ml-2 rounded-lg p-2.5 inline-flex items-center justify-center text-white hover:bg-white/20 focus:outline-none active:bg-white/30"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-primary-100 shadow-xl">
          <div className="pt-2 pb-2">
            {navItems.map((item) => {
              // Only show community link if user is verified
              if (item.name === 'Community' && user && !user.isVerified) {
                return null;
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`${normalizedCurrentPage === item.name.toLowerCase()
                    ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500 block pl-4 pr-4 py-3.5 text-base font-medium active:bg-gray-100 transition-colors'
                    : 'text-gray-700 hover:bg-gray-50 block pl-4 pr-4 py-3.5 text-base font-medium active:bg-gray-100 transition-colors'}`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-3 pb-3 border-t border-gray-200 px-4">
            {user ? (
              <div className="space-y-2">
                {user.role === 'owner' && (
                  <Link
                    href={
                      user.serviceType === 'printing' ? '/printing-owner' :
                        user.serviceType === 'laundry' ? '/laundry-owner' :
                          '/canteen-owner'
                    }
                    className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {user.serviceType === 'printing' ? 'Printing Dashboard' :
                      user.serviceType === 'laundry' ? 'Laundry Dashboard' :
                        'Canteen Dashboard'}
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    href="/owner-dashboard"
                    className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={async () => {
                    try {
                      await authAPI.logout();
                    } catch (e) {
                      // ignore and proceed with local cleanup
                    }
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-red-500 text-white text-center py-3 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
