'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { 
  Bell, Lock, Shield, MessageSquare, Phone, Moon, 
  Sun, HelpCircle, Info, ChevronRight, User, Smartphone,
  Database, Globe, Key, EyeOff, ToggleLeft, ToggleRight,
  LogOut, AlertCircle, Loader2
} from 'lucide-react';

type Section = 'account' | 'privacy' | 'notifications' | 'chats' | 'calls' | 'appearance' | 'help';

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>('account');
  const [darkMode, setDarkMode] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    status: 'Available',
    profileImage: null as string | null
  });
  
  const userId = auth.currentUser?.uid;
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'user_profiles', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            name: data.display_name || '',
            status: 'Available',
            profileImage: data.profile_image || null,
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId]);
  
  const navigateToProfile = () => {
    router.push('/profile');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
      alert('Failed to log out');
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="p-2 hover:bg-gray-800 rounded-full"
            onClick={() => router.back()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="ml-4 text-xl font-bold">Settings</h1>
        </div>
        
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center text-red-400 hover:text-red-300 p-2 hover:bg-gray-800 rounded-full"
        >
          <LogOut size={20} />
        </button>
      </div>
      
      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl border border-gray-700 animate-fade-in">
            <div className="flex items-center mb-4">
              <AlertCircle className="text-red-400 mr-3" size={24} />
              <h3 className="text-lg font-semibold">Confirm Logout</h3>
            </div>
            <p className="text-gray-300 mb-6">Are you sure you want to terminate your neural connection? You will need to login again to access NextTalk.</p>
            <div className="flex space-x-3 justify-end">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <LogOut size={16} className="mr-2" /> Disconnect
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Settings navigation */}
        <div className="w-64 border-r border-gray-800 overflow-y-auto">
          <div 
            className={`px-4 py-3 flex items-center space-x-3 cursor-pointer ${activeSection === 'account' ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
            onClick={() => setActiveSection('account')}
          >
            <User size={20} />
            <span>Account</span>
          </div>
          
          <div 
            className={`px-4 py-3 flex items-center space-x-3 cursor-pointer ${activeSection === 'privacy' ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
            onClick={() => setActiveSection('privacy')}
          >
            <Lock size={20} />
            <span>Privacy</span>
          </div>
          
          <div 
            className={`px-4 py-3 flex items-center space-x-3 cursor-pointer ${activeSection === 'notifications' ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
            onClick={() => setActiveSection('notifications')}
          >
            <Bell size={20} />
            <span>Notifications</span>
          </div>
          
          <div 
            className={`px-4 py-3 flex items-center space-x-3 cursor-pointer ${activeSection === 'chats' ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
            onClick={() => setActiveSection('chats')}
          >
            <MessageSquare size={20} />
            <span>Chats</span>
          </div>
          
          <div 
            className={`px-4 py-3 flex items-center space-x-3 cursor-pointer ${activeSection === 'calls' ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
            onClick={() => setActiveSection('calls')}
          >
            <Phone size={20} />
            <span>Calls</span>
          </div>
          
          <div 
            className={`px-4 py-3 flex items-center space-x-3 cursor-pointer ${activeSection === 'appearance' ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
            onClick={() => setActiveSection('appearance')}
          >
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            <span>Appearance</span>
          </div>
          
          <div 
            className={`px-4 py-3 flex items-center space-x-3 cursor-pointer ${activeSection === 'help' ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
            onClick={() => setActiveSection('help')}
          >
            <HelpCircle size={20} />
            <span>Help</span>
          </div>
          
          <div className="border-t border-gray-800 mt-2 pt-2">
            <div 
              className="px-4 py-3 flex items-center space-x-3 cursor-pointer text-red-400 hover:bg-gray-800/50"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut size={20} />
              <span>Disconnect</span>
            </div>
          </div>
        </div>
        
        {/* Settings content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Account</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin" size={28} />
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer" onClick={navigateToProfile}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500">
                      {profileData.profileImage ? (
                        <Image 
                          src={profileData.profileImage} 
                          alt="Your profile" 
                          width={48} 
                          height={48}
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center">
                          <User size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{profileData.name || 'Set up your profile'}</p>
                      <p className="text-sm text-gray-400">{profileData.name ? profileData.status : 'Tap to create profile'}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              )}
              
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Smartphone size={20} className="text-gray-400" />
                    <span>Linked Devices</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                  <Key size={20} className="text-gray-400" />
                    <span>Account Security</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Database size={20} className="text-gray-400" />
                    <span>Data and Storage</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Globe size={20} className="text-gray-400" />
                    <span>Language</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <span className="mr-2">English (US)</span>
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Privacy</h2>
              
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <EyeOff size={20} className="text-gray-400" />
                      <span>Profile Visibility</span>
                    </div>
                    <div>
                      <select className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-sm">
                        <option>Everyone</option>
                        <option>Contacts Only</option>
                        <option>Nobody</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield size={20} className="text-gray-400" />
                      <span>End-to-End Encryption</span>
                    </div>
                    <div className="flex items-center">
                      <button 
                        className="w-12 h-6 bg-blue-600 rounded-full p-1 flex items-center"
                      >
                        <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 ml-8">All personal messages are secured with end-to-end encryption.</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lock size={20} className="text-gray-400" />
                      <span>Two-Factor Authentication</span>
                    </div>
                    <div className="flex items-center">
                      <button 
                        className="w-12 h-6 bg-gray-700 rounded-full p-1 flex items-center"
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 ml-8">Secure your account with a second verification step.</p>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare size={20} className="text-gray-400" />
                      <span>Message Notifications</span>
                    </div>
                    <div className="flex items-center">
                      <button 
                        className="w-12 h-6 bg-blue-600 rounded-full p-1 flex items-center"
                      >
                        <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Phone size={20} className="text-gray-400" />
                      <span>Call Notifications</span>
                    </div>
                    <div className="flex items-center">
                      <button 
                        className="w-12 h-6 bg-blue-600 rounded-full p-1 flex items-center"
                      >
                        <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User size={20} className="text-gray-400" />
                      <span>Group Notifications</span>
                    </div>
                    <div className="flex items-center">
                      <button 
                        className="w-12 h-6 bg-blue-600 rounded-full p-1 flex items-center"
                      >
                        <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'chats' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Chats</h2>
              
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ToggleLeft size={20} className="text-gray-400" />
                      <span>Chat Backup</span>
                    </div>
                    <div className="flex items-center">
                      <button 
                        className="w-12 h-6 bg-blue-600 rounded-full p-1 flex items-center"
                      >
                        <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 ml-8">Automatically backup your chat history</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MessageSquare size={20} className="text-gray-400" />
                      <span>Chat Font Size</span>
                    </div>
                    <div>
                      <select className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-sm">
                        <option>Small</option>
                        <option>Medium</option>
                        <option>Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'calls' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Calls</h2>
              
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ToggleRight size={20} className="text-gray-400" />
                      <span>Low Data Mode</span>
                    </div>
                    <div className="flex items-center">
                      <button 
                        className="w-12 h-6 bg-gray-700 rounded-full p-1 flex items-center"
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 ml-8">Reduce data usage during calls</p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Phone size={20} className="text-gray-400" />
                      <span>Call Forwarding</span>
                    </div>
                    <div className="flex items-center">
                      <button 
                        className="w-12 h-6 bg-gray-700 rounded-full p-1 flex items-center"
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Appearance</h2>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium mb-4">Theme</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className={`p-4 rounded-lg flex items-center justify-center ${!darkMode ? 'border-2 border-blue-500' : 'border border-gray-700'}`}
                    onClick={() => setDarkMode(false)}
                  >
                    <div className="w-full h-24 bg-white rounded-md flex flex-col items-center justify-center">
                      <Sun size={24} className="text-black mb-2" />
                      <span className="text-black text-sm font-medium">Light</span>
                    </div>
                  </button>
                  
                  <button 
                    className={`p-4 rounded-lg flex items-center justify-center ${darkMode ? 'border-2 border-blue-500' : 'border border-gray-700'}`}
                    onClick={() => setDarkMode(true)}
                  >
                    <div className="w-full h-24 bg-gray-900 rounded-md flex flex-col items-center justify-center">
                      <Moon size={24} className="text-white mb-2" />
                      <span className="text-white text-sm font-medium">Dark</span>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium mb-4">Chat Background</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((item) => (
                    <button 
                      key={item}
                      className="aspect-square rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors"
                    >
                      <div className={`w-full h-full bg-gradient-to-br ${item === 1 ? 'from-purple-500 to-blue-500' : item === 2 ? 'from-green-400 to-blue-400' : item === 3 ? 'from-red-400 to-yellow-400' : 'from-gray-700 to-gray-900'}`}></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'help' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Help & Support</h2>
              
              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Info size={20} className="text-gray-400" />
                    <span>FAQ</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <MessageSquare size={20} className="text-gray-400" />
                    <span>Contact Support</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <HelpCircle size={20} className="text-gray-400" />
                    <span>Report a Problem</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">NextTalk v1.0.2</p>
                    <p className="text-gray-500 text-xs mt-1">© 2025 NextTalk Inc.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}