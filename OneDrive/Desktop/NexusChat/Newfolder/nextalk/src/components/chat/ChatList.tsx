'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCheck } from 'lucide-react';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online?: boolean;
  isGroup?: boolean;
}

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chatId: string) => void;
}

export default function ChatList({ chats, onChatSelect }: ChatListProps) {
  return (
    <ul className="space-y-1 px-2">
      {chats.map((chat, index) => (
        <motion.li
          key={chat.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onChatSelect(chat.id)}
          className="relative cursor-pointer rounded-xl hover:bg-white/10 transition-all p-2"
        >
          <div className="flex items-center space-x-3 p-2">
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-cyan-400 p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden bg-black">
                  {chat.avatar ? (
                    <Image
                      src={chat.avatar}
                      alt={chat.name}
                      width={48}
                      height={48}
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-semibold">
                      {chat.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              
              {chat.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium truncate">{chat.name}</h3>
                <span className="text-xs text-gray-400">{chat.timestamp}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400 truncate max-w-[180px]">
                  {chat.unread === 0 && (
                    <span className="inline-flex items-center mr-1">
                      <CheckCheck size={14} className="text-cyan-400" />
                    </span>
                  )}
                  {chat.lastMessage}
                </p>
                
                {chat.unread > 0 && (
                  <div className="min-w-[20px] h-5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-xs flex items-center justify-center">
                    {chat.unread}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}