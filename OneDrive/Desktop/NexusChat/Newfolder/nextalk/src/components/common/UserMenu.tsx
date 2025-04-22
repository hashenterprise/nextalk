'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, User, Settings, ChevronUp, Move, Eye, Palette } from 'lucide-react'; // Removed 'EyeOff'
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export type UserMenuProps = {
  isEmbedded?: boolean;
  onClose?: () => void;
};

export type UserMenuSettings = {
  isDraggable: boolean;
  isVisible: boolean;
  theme: 'default' | 'minimal' | 'expanded';
  position?: { x: number; y: number };
};

export default function UserMenu({ isEmbedded = false, onClose }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [settings, setSettings] = useState<UserMenuSettings>({
    isDraggable: true,
    isVisible: true,
    theme: 'default',
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    uid: ''
  });
  
  // Get current user information when the component mounts
  useEffect(() => {
    // Handle Firebase auth state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserInfo({
          displayName: user.displayName || 'User',
          email: user.email || 'No email',
          photoURL: user.photoURL || '',
          uid: user.uid
        });
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Load saved settings and position on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userMenuSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    const savedPosition = localStorage.getItem('userMenuPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    } else if (!isEmbedded) {
      // Default position (bottom-right)
      setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    }
  }, [isEmbedded]);

  // Save settings and position to localStorage when they change
  useEffect(() => {
    localStorage.setItem('userMenuSettings', JSON.stringify(settings));
    
    if ((position.x !== 0 || position.y !== 0) && !isEmbedded) {
      localStorage.setItem('userMenuPosition', JSON.stringify(position));
    }
  }, [settings, position, isEmbedded]);

  // Handle click outside to close the menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSettingsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get the first letter for the avatar fallback
  const getInitial = () => {
    if (userInfo.displayName && userInfo.displayName.length > 0) {
      return userInfo.displayName[0].toUpperCase();
    } else if (userInfo.email && userInfo.email.length > 0) {
      return userInfo.email[0].toUpperCase();
    }
    return '?';
  };

  // Handle drag end to update position state
  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    
    // Update position
    setPosition({
      x: info.point.x,
      y: info.point.y
    });
  };

  const toggleSetting = (setting: keyof UserMenuSettings, value?: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value !== undefined ? value : !prev[setting as keyof UserMenuSettings]
    }));
  };

  // If embedded in sidebar and not visible, return null
  if (isEmbedded && !settings.isVisible) {
    return null;
  }

  // If not embedded and not visible, return null
  if (!isEmbedded && !settings.isVisible) {
    return null;
  }

  const menuContent = (
    <div className={`${isEmbedded ? '' : 'absolute bottom-16 right-0'} w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden`}>
      {/* User info section */}
      {!isSettingsOpen ? (
        <>
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500">
                {userInfo.photoURL ? (
                  <Image 
                    src={userInfo.photoURL} 
                    alt="Profile" 
                    width={40} 
                    height={40} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white">
                    {getInitial()}
                  </div>
                )}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">
                  {userInfo.displayName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {userInfo.email}
                </p>
              </div>
            </div>
          </div>
          
          {/* Menu options */}
          <div className="py-2">
            <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800" onClick={() => { setIsOpen(false); onClose?.(); }}>
              <User size={16} className="mr-3 text-gray-400" />
              Profile
            </Link>
            <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800" onClick={() => { setIsOpen(false); onClose?.(); }}>
              <Settings size={16} className="mr-3 text-gray-400" />
              Settings
            </Link>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              <Palette size={16} className="mr-3 text-gray-400" />
              Menu Options
            </button>
            <button 
              onClick={handleLogout}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
            >
              <LogOut size={16} className="mr-3" />
              Sign out
            </button>
          </div>
        </>
      ) : (
        // Settings panel
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-white">Menu Settings</h3>
            <button 
              onClick={() => setIsSettingsOpen(false)} 
              className="text-gray-400 hover:text-white text-xs"
            >
              Back
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-300 flex items-center">
                <Eye size={16} className="mr-2" />
                Show User Menu
              </label>
              <button 
                onClick={() => toggleSetting('isVisible')} 
                className={`w-10 h-5 rounded-full relative ${settings.isVisible ? 'bg-purple-600' : 'bg-gray-700'}`}
              >
                <span 
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transform transition-transform ${settings.isVisible ? 'translate-x-5' : ''}`} 
                />
              </button>
            </div>

            {!isEmbedded && (
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300 flex items-center">
                  <Move size={16} className="mr-2" />
                  Draggable Menu
                </label>
                <button 
                  onClick={() => toggleSetting('isDraggable')} 
                  className={`w-10 h-5 rounded-full relative ${settings.isDraggable ? 'bg-purple-600' : 'bg-gray-700'}`}
                >
                  <span 
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transform transition-transform ${settings.isDraggable ? 'translate-x-5' : ''}`} 
                  />
                </button>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-gray-300 flex items-center">
                <Palette size={16} className="mr-2" />
                Appearance
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => toggleSetting('theme', 'default')}
                  className={`p-2 text-xs rounded ${settings.theme === 'default' ? 'bg-purple-600' : 'bg-gray-700'}`}
                >
                  Default
                </button>
                <button
                  onClick={() => toggleSetting('theme', 'minimal')}
                  className={`p-2 text-xs rounded ${settings.theme === 'minimal' ? 'bg-purple-600' : 'bg-gray-700'}`}
                >
                  Minimal
                </button>
                <button
                  onClick={() => toggleSetting('theme', 'expanded')}
                  className={`p-2 text-xs rounded ${settings.theme === 'expanded' ? 'bg-purple-600' : 'bg-gray-700'}`}
                >
                  Expanded
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // For embedded menu (in sidebar)
  if (isEmbedded) {
    return (
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center p-4 hover:bg-white/5 transition-colors"
        >
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500">
            {userInfo.photoURL ? (
              <Image 
                src={userInfo.photoURL} 
                alt="Profile" 
                width={40} 
                height={40} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white">
                {getInitial()}
              </div>
            )}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              {userInfo.displayName || 'My Profile'}
            </p>
            <p className="text-xs text-white/60 truncate">
              {settings.theme === 'expanded' ? userInfo.email : 'Manage your account'}
            </p>
          </div>
        </button>
        
        {isOpen && menuContent}
      </div>
    );
  }

  // For floating menu
  return (
    <motion.div 
      className="fixed z-50"
      ref={menuRef}
      drag={settings.isDraggable}
      dragMomentum={false}
      dragElastic={0}
      dragTransition={{ power: 0, timeConstant: 0 }}
      onDragStart={() => settings.isDraggable && setIsDragging(true)}
      onDragEnd={handleDragEnd}
      initial={position}
      animate={position}
    >
      {/* User menu dropdown */}
      {isOpen && !isDragging && menuContent}
      
      {/* User avatar button with drag indicator */}
      <button
        onClick={() => !isDragging && setIsOpen(!isOpen)}
        className={`relative h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-0.5 shadow-lg hover:shadow-purple-500/20 transition-shadow ${settings.isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      >
        <div className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden">
          {userInfo.photoURL ? (
            <Image 
              src={userInfo.photoURL} 
              alt="Profile" 
              width={48} 
              height={48} 
              className="h-full w-full object-cover" 
            />
          ) : (
            <div className="h-full w-full bg-gray-800 flex items-center justify-center text-white">
              {getInitial()}
            </div>
          )}
        </div>
        
        {isOpen && !isDragging && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center bg-gray-800 rounded-full h-5 w-5 border border-gray-700">
            <ChevronUp size={12} />
          </div>
        )}

        {/* Drag indicator */}
        {settings.isDraggable && (
          <div className="absolute -top-1 -left-1 flex items-center justify-center bg-gray-800 rounded-full h-5 w-5 border border-gray-700">
            <Move size={12} />
          </div>
        )}
      </button>
    </motion.div>
  );
}