'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/common/Sidebar';
import dynamic from 'next/dynamic';

// Dynamically import the UserMenu component with no SSR
const UserMenu = dynamic(() => import('@/components/common/UserMenu'), { ssr: false });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFloatingMenu, setShowFloatingMenu] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push('/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Check if we should show the floating menu
  useEffect(() => {
    const savedSettings = localStorage.getItem('userMenuSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setShowFloatingMenu(settings.isVisible && !settings.isEmbeddedOnly);
      } catch (error) {
        console.error("Error parsing user menu settings:", error);
      }
    }
  }, []);

  // Show loading state while Firebase is checking the auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800">
        <div className="glass-effect p-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-t-transparent border-purple-500 animate-spin mb-4"></div>
          <p className="text-white/70">Loading your account...</p>
        </div>
      </div>
    );
  }

  // If loaded and authenticated, show the app layout
  return isAuthenticated ? (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col glass-effect"
          >
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-t-transparent border-purple-500 animate-spin"></div>
              </div>
            }>
              {children}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Add the draggable UserMenu component conditionally */}
      {showFloatingMenu && <UserMenu />}
    </div>
  ) : null;
}