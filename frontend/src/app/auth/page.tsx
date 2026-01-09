'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'student',
    serviceType: 'canteen', // Default service type for owners
    college: 'Atharva College of Engineering',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      console.log('Initiating Google sign-in...');
      setLoading(true);
      setError('');
      
      // Import the authAPI here to avoid potential circular dependencies
      const { authAPI } = await import('@/lib/api');
      
      // This will redirect to Google's OAuth page
      await authAPI.signInWithGoogle();
      
      console.log('Google sign-in initiated successfully');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      let errorMessage = 'An error occurred during Google sign-in';
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.error_description) {
        errorMessage = err.error_description;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.data && err.data.message) {
        errorMessage = err.data.message;
      } else if (err.error) {
        errorMessage = err.error;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
        
        if (response.data.success) {
          // Update user data to include serviceType if it's stored in localStorage
          let userData = response.data.user;
          const storedUser = localStorage.getItem('user');
          
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              // If the user already exists in storage and has a serviceType, preserve it
              if (parsedUser.serviceType) {
                userData.serviceType = parsedUser.serviceType;
              }
            } catch (e) {
              console.error('Error parsing stored user data', e);
            }
          }
          
          localStorage.setItem('token', userData.token);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Redirect based on user role
          if (userData.role === 'owner') {
            // If the user data contains serviceType, redirect to appropriate dashboard
            if (userData.serviceType === 'printing') {
              router.push('/printing-owner');
            } else if (userData.serviceType === 'laundry') {
              router.push('/laundry-owner');
            } else {
              // Default to canteen owner dashboard
              router.push('/canteen-owner');
            }
          } else if (userData.role === 'admin') {
            router.push('/owner-dashboard');
          } else {
            router.push('/');
          }
        }
      } else {
        // Register
        const response = await authAPI.register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          college: formData.college,
        });
        
        if (response.data.success) {
          // Store the selected service type in localStorage for redirection after login
          if (formData.role === 'owner') {
            localStorage.setItem('tempServiceType', formData.serviceType);
          }
          
          // Automatically log in after registration
          const loginResponse = await authAPI.login({
            email: formData.email,
            password: formData.password,
          });
          
          if (loginResponse.data.success) {
            localStorage.setItem('token', loginResponse.data.user.token);
            localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
            
            // Redirect based on user role
            if (loginResponse.data.user.role === 'owner') {
              // Use the temporarily stored service type from registration
              const tempServiceType = localStorage.getItem('tempServiceType');
              if (tempServiceType === 'printing') {
                router.push('/printing-owner');
              } else if (tempServiceType === 'laundry') {
                router.push('/laundry-owner');
              } else {
                // Default to canteen owner dashboard
                router.push('/canteen-owner');
              }
              // Clean up the temporary storage
              localStorage.removeItem('tempServiceType');
            } else if (loginResponse.data.user.role === 'admin') {
              router.push('/owner-dashboard');
            } else {
              router.push('/');
            }
          }
        }
      }
    } catch (err: any) {
      // Handle Supabase errors which have different structure than Axios
      let errorMessage = 'An error occurred';
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.error_description) {
        // Supabase auth error
        errorMessage = err.error_description;
      } else if (err.message) {
        // General error message
        errorMessage = err.message;
      } else if (err.status) {
        // Error with status code
        errorMessage = `Error ${err.status}: ${err.statusText || 'An error occurred'}`;
      } else if (err.data && err.data.message) {
        // Supabase API error response
        errorMessage = err.data.message;
      } else if (err.error) {
        // Supabase error object
        errorMessage = err.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-primary-500 w-12 h-12 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-primary-500 hover:text-primary-600"
          >
            {isLogin ? 'Register here' : 'Sign in here'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required={!isLogin}
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            )}

            {!isLogin && formData.role === 'owner' && (
              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                  Service Type
                </label>
                <div className="mt-1">
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="canteen">Canteen/Restaurant</option>
                    <option value="printing">Printing</option>
                    <option value="laundry">Laundry</option>
                    <option value="stationery">Stationery</option>
                    <option value="electronics">Electronics Repair</option>
                    <option value="tution">Tution Classes</option>
                  </select>
                </div>
              </div>
            )}

            {!isLogin && (
              <div>
                <label htmlFor="college" className="block text-sm font-medium text-gray-700">
                  College
                </label>
                <div className="mt-1">
                  <input
                    id="college"
                    name="college"
                    type="text"
                    required={!isLogin}
                    value={formData.college}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign in' : 'Register'}
              </button>
            </div>
          </form>
          
          {/* Google Sign-In Button */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}