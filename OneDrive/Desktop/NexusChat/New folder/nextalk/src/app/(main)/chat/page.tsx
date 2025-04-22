'use client';

import { useState, useEffect } from 'react';
import ChatList from '@/components/chat/ChatList';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, Search, Settings } from 'lucide-react';

// Mock data for recent chats - In a real app, you'd fetch this from your database
const recentChats = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    lastMessage: 'Are we still meeting today?',
    timestamp: '10:24 AM',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Dev Team Group',
    avatar: '/avatars/group1.jpg',
    lastMessage: 'Alex: I pushed the new updates',
    timestamp: 'Yesterday',
    unread: 0,
    isGroup: true,
    online: false,
  },
  {
    id: '3',
    name: 'Michael Torres',
    avatar: '/avatars/michael.jpg',
    lastMessage: 'Thanks for the help!',
    timestamp: 'Yesterday',
    unread: 0,
    online: true,
  },
  {
    id: '4',
    name: 'Family Group',
    avatar: '/avatars/family.jpg',
    lastMessage: 'Mom: Don\'t forget Sunday dinner',
    timestamp: 'Monday',
    unread: 5,
    isGroup: true,
    online: false,
  },
  {
    id: '5',
    name: 'Jamie Wilson',
    avatar: '/avatars/jamie.jpg',
    lastMessage: 'Check out this link',
    timestamp: 'Monday',
    unread: 0,
    online: false,
  },
];

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState(recentChats);
  const router = useRouter();

  useEffect(() => {
    // Filter chats based on search query
    if (searchQuery) {
      setFilteredChats(
        recentChats.filter(chat => 
          chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredChats(recentChats);
    }
  }, [searchQuery]);

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleAddContact = () => {
    router.push('/add-contact'); // Navigate to the Add Contact page
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
          Messages
        </h1>
        <div className="flex space-x-2">
          <button 
            className="p-2 rounded-full hover:bg-white/10 transition-all"
            onClick={handleAddContact} // Add this click handler
          >
            <UserPlus size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 bg-white/10 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-2 sticky top-0 bg-black/20 backdrop-blur-sm z-10">
          <h2 className="text-sm font-medium text-gray-400 px-2 py-1">Recent Chats</h2>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ChatList chats={filteredChats} onChatSelect={handleChatSelect} />
        </motion.div>
        
        {filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <div className="rounded-full bg-white/5 p-4 mb-4">
              <Search size={32} />
            </div>
            <p>No conversations found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}