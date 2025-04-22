'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Phone, 
  CircleUser, 
  Settings, 
  Image as ImageIcon,
  Search,
  Menu,
  X,
  Video // Import the Video icon
} from 'lucide-react';
import UserMenu from '@/components/common/UserMenu';

const navItems = [
  { name: 'Chats', path: '/chat', icon: MessageSquare },
  { name: 'Calls', path: '/calls', icon: Phone },
  { name: 'Status', path: '/status', icon: ImageIcon },
  { name: 'Meetings', path: '/meetings', icon: Video }, // Added Meetings navigation item
  { name: 'Profile', path: '/profile', icon: CircleUser },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-md rounded-full"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div 
        className={`fixed left-0 top-0 bottom-0 z-50 lg:z-30 flex flex-col glass-effect border-r border-white/10 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        animate={{ 
          width: isCollapsed ? 80 : 288,
          translateX: isMobileOpen || window.innerWidth >= 1024 ? 0 : -320
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {!isCollapsed && (
            <Link href="/chat" className="flex items-center">
              <Image src="/logo.svg" alt="NextTalk Logo" width={32} height={32} />
              <span className="ml-2 text-xl font-bold gradient-text">NextTalk</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/chat" className="mx-auto">
              <Image src="/logo.svg" alt="NextTalk Logo" width={32} height={32} />
            </Link>
          )}
          <button 
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all hidden lg:block"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="p-4 relative">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              const Icon = item.icon;
              
              return (
                <li key={item.name} onClick={() => setIsMobileOpen(false)}>
                  <Link 
                    href={item.path} 
                    className={`flex items-center rounded-xl py-3 px-4 transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white' 
                        : 'hover:bg-white/5 text-white/70'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-purple-300' : ''} />
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                    {!isCollapsed && isActive && (
                      <motion.div 
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
                        layoutId="navIndicator"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Replace the old profile section with the embedded UserMenu */}
        <div className="border-t border-white/10">
          {isCollapsed ? (
            <div 
              className="p-4 flex justify-center" 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <CircleUser size={24} className="text-white/70 hover:text-white cursor-pointer" />
            </div>
          ) : (
            <UserMenu isEmbedded={true} onClose={() => setIsUserMenuOpen(false)} />
          )}
        </div>
      </motion.div>
    </>
  );
}