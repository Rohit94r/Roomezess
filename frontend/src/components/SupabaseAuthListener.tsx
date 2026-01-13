'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SupabaseAuthListener() {

  useEffect(() => {
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        if (session) {
          localStorage.setItem('token', session.access_token || '');
          const user = {
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'student',
            serviceType: session.user.user_metadata?.serviceType,
            isVerified: session.user.user_metadata?.is_verified || false
          };
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          console.error(e);
        }
      }
    })();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        try {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session) {
              localStorage.setItem('token', session.access_token || '');
              const user = {
                id: session.user.id,
                email: session.user.email,
                role: session.user.user_metadata?.role || 'student',
                serviceType: session.user.user_metadata?.serviceType,
                isVerified: session.user.user_metadata?.is_verified || false
              };
              localStorage.setItem('user', JSON.stringify(user));
            }
          } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (e: any) {
          if (e?.name !== 'AbortError') {
            console.error(e);
          }
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null; // This component doesn't render anything
}
