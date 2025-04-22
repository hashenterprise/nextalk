'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PhoneOutgoing, PhoneIncoming, PhoneMissed, Video, Phone, Search, Plus } from 'lucide-react';

// Mock call data
const callHistory = [
  {
    id: 'call1',
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    timestamp: '10 minutes ago',
    type: 'incoming',
    isVideo: false,
    missed: false,
    duration: '5:32',
  },
  {
    id: 'call2',
    name: 'Michael Torres',
    avatar: '/avatars/michael.jpg',
    timestamp: 'Yesterday, 15:45',
    type: 'outgoing',
    isVideo: true,
    missed: false,
    duration: '18:21',
  },
  {
    id: 'call3',
    name: 'Alex Chen',
    avatar: '/avatars/alex.jpg',
    timestamp: 'Yesterday, 10:23',
    type: 'incoming',
    isVideo: false,
    missed: true,
  },
  {
    id: 'call4',
    name: 'Dev Team Group',
    avatar: '/avatars/group1.jpg',
    isGroup: true,
    timestamp: 'Monday, 14:15',
    type: 'outgoing',
    isVideo: true,
    missed: false,
    duration: '32:18',
  },
  {
    id: 'call5',
    name: 'Jamie Wilson',
    avatar: '/avatars/jamie.jpg',
    timestamp: 'Monday, 09:45',
    type: 'incoming',
    isVideo: false,
    missed: true,
  },
];

export default function CallsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCalls, setFilteredCalls] = useState(callHistory);
  const router = useRouter();
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query) {
      setFilteredCalls(
        callHistory.filter(call => 
          call.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      setFilteredCalls(callHistory);
    }
  };
  
  const getCallIcon = (call: { missed: boolean; type: string }) => {
    if (call.missed) {
      return <PhoneMissed size={16} className="text-red-500" />;
    } else if (call.type === 'incoming') {
      return <PhoneIncoming size={16} className="text-green-500" />;
    } else {
      return <PhoneOutgoing size={16} className="text-cyan-500" />;
    }
  };
  
  const initiateCall = (contactId: string, isVideoCall: boolean) => {
    // In a real app, you would start a call here
    console.log(`Initiating ${isVideoCall ? 'video' : 'audio'} call with ${contactId}`);
    // For demo purposes, we'll navigate to a dummy call interface
    router.push(`/calls/active?id=${contactId}&video=${isVideoCall}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
          Calls
        </h1>
        <button className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600">
          <Plus size={20} />
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 bg-white/10 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search calls..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <ul className="divide-y divide-white/10">
          {filteredCalls.map((call) => (
            <motion.li
              key={call.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ x: 5 }}
              className="p-4 hover:bg-white/5 transition-all"
            >
              <div className="flex items-center">
                <div className="relative mr-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-cyan-400 p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-black">
                      <Image
                        src={call.avatar || '/default-avatar.png'}
                        alt={call.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{call.name}</h3>
                    {call.isGroup && (
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded">Group</span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="flex items-center mr-2">
                      {getCallIcon(call)}
                    </span>
                    <span>{call.timestamp}</span>
                    {!call.missed && call.duration && (
                      <span className="ml-2">· {call.duration}</span>
                    )}
                    {call.isVideo && (
                      <span className="ml-2 flex items-center">
                        <Video size={14} className="mr-1" />
                        Video
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className="p-2 rounded-full bg-white/10 hover:bg-green-600/40 transition-all"
                    onClick={() => initiateCall(call.id, false)}
                  >
                    <Phone size={18} />
                  </button>
                  <button 
                    className="p-2 rounded-full bg-white/10 hover:bg-cyan-600/40 transition-all"
                    onClick={() => initiateCall(call.id, true)}
                  >
                    <Video size={18} />
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
        
        {filteredCalls.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <div className="rounded-full bg-white/5 p-4 mb-4">
              <Phone size={32} />
            </div>
            <p>No calls found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}