'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Camera, Image as ImageIcon, Edit } from 'lucide-react';

// Mock status data
const myStatus = {
  hasActive: true,
  last: {
    id: 'mystatus1',
    timestamp: '22 minutes ago',
    image: '/status/my-status.jpg',
    views: 12,
  }
};

const recentStatuses = [
  {
    userId: 'user1',
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    timestamp: '15 minutes ago',
    viewed: false,
  },
  {
    userId: 'user2',
    name: 'Alex Chen',
    avatar: '/avatars/alex.jpg',
    timestamp: '25 minutes ago',
    viewed: true,
  },
  {
    userId: 'user3',
    name: 'Jordan Taylor',
    avatar: '/avatars/jordan.jpg',
    timestamp: '45 minutes ago',
    viewed: false,
  },
];

export default function StatusPage() {
  const router = useRouter();
  const [showCreateOptions, setShowCreateOptions] = useState(false);

  const handleStatusClick = (userId: string) => {
    router.push(`/status/${userId}`);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
          Status
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {/* My Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-400">My Status</h2>
            {myStatus.hasActive && (
              <button className="text-sm text-cyan-400">
                View
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              {myStatus.hasActive ? (
                <div 
                  className="w-16 h-16 rounded-full ring-2 ring-cyan-500 p-0.5 cursor-pointer"
                  onClick={() => handleStatusClick('me')}
                >
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={myStatus.last.image || '/default-avatar.png'}
                      alt="My Status"
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10">
                    <Image
                      src="/default-avatar.png"
                      alt="My Avatar"
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <button 
                    className="absolute bottom-0 right-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center"
                    onClick={() => setShowCreateOptions(!showCreateOptions)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
              
              {/* Create status options popup */}
              {showCreateOptions && (
                <motion.div 
                  className="absolute top-0 left-20 glass-effect p-3 rounded-xl z-10"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex flex-col space-y-3">
                    <button className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-all">
                      <Camera size={20} className="text-purple-400" />
                      <span>Take Photo</span>
                    </button>
                    <button className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-all">
                      <ImageIcon size={20} className="text-purple-400" />
                      <span>Upload Image</span>
                    </button>
                    <button className="flex items-center space-x-2 p-2 hover:bg-white/10 rounded-lg transition-all">
                      <Edit size={20} className="text-purple-400" />
                      <span>Text Status</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div>
              <h3 className="font-medium">My Status</h3>
              {myStatus.hasActive ? (
                <p className="text-sm text-gray-400">{myStatus.last.timestamp} · {myStatus.last.views} views</p>
              ) : (
                <p className="text-sm text-gray-400">Tap to add status update</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Recent Updates */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-2">Recent Updates</h2>
          
          <ul className="space-y-4">
            {recentStatuses.map((status) => (
              <motion.li
                key={status.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ x: 5 }}
                onClick={() => handleStatusClick(status.userId)}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <div className="relative">
                  <div className={`w-14 h-14 rounded-full ${status.viewed ? 'ring-1 ring-gray-500' : 'ring-2 ring-cyan-500'} p-0.5`}>
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Image
                        src={status.avatar || '/default-avatar.png'}
                        alt={status.name}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">{status.name}</h3>
                  <p className="text-sm text-gray-400">{status.timestamp}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}