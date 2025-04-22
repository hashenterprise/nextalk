'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Phone, Video, ArrowLeft, MoreVertical } from 'lucide-react';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';

// Mock data for a specific chat - In a real app, you'd fetch this from your database
const mockChats = {
  '1': {
    id: '1',
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    online: true,
    messages: [
      { id: '101', sender: 'Sarah Johnson', text: 'Hey there! How are you doing today?', timestamp: '10:00 AM', isUser: false },
      { id: '102', sender: 'You', text: 'I\'m good, thanks! Working on that project we discussed.', timestamp: '10:05 AM', isUser: true },
      { id: '103', sender: 'Sarah Johnson', text: 'Great! How\'s it coming along?', timestamp: '10:10 AM', isUser: false },
      { id: '104', sender: 'You', text: 'Making progress! I should have something to show you by tomorrow.', timestamp: '10:15 AM', isUser: true },
      { id: '105', sender: 'Sarah Johnson', text: 'Awesome! Looking forward to it. Are we still meeting today?', timestamp: '10:24 AM', isUser: false },
    ]
  },
  '2': {
    id: '2',
    name: 'Dev Team Group',
    avatar: '/avatars/group1.jpg',
    isGroup: true,
    participants: [
      { id: 'u1', name: 'Alex', avatar: '/avatars/alex.jpg' },
      { id: 'u2', name: 'Jamie', avatar: '/avatars/jamie.jpg' },
      { id: 'u3', name: 'You', avatar: '/avatars/you.jpg' },
    ],
    messages: [
      { id: '201', sender: 'Alex', text: 'I pushed the new updates to the repo', timestamp: 'Yesterday, 3:30 PM', isUser: false },
      { id: '202', sender: 'Jamie', text: 'Great work! I\'ll review it shortly', timestamp: 'Yesterday, 4:15 PM', isUser: false },
      { id: '203', sender: 'You', text: 'Thanks for the quick turnaround, Alex!', timestamp: 'Yesterday, 4:30 PM', isUser: true },
    ]
  },
};

export default function ChatRoom() {
  const { chatId } = useParams();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [chat, setChat] = useState<{
    id: string;
    name: string;
    avatar: string;
    online?: boolean;
    messages: { id: string; sender: string; text: string; timestamp: string; isUser: boolean }[];
  } | null>(null);
  const [messages, setMessages] = useState<
    { id: string; sender: string; text: string; timestamp: string; isUser: boolean }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // In a real app, you'd fetch chat data from your API
    if (chatId && typeof chatId === 'string' && mockChats[chatId]) {
      setChat(mockChats[chatId]);
      setMessages(mockChats[chatId].messages);
    } else {
      router.push('/chat');
    }
  }, [chatId, router]);

  useEffect(() => {
    // Scroll to bottom when messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: `new-${Date.now()}`,
      sender: 'You',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUser: true,
    };
    
    setMessages([...messages, newMessage]);
    
    // Simulate response in 1-2 seconds
    setIsTyping(true);
    
    setTimeout(() => {
      const responseMessage = {
        id: `new-${Date.now() + 1}`,
        sender: chat?.name || 'Unknown',
        text: getRandomResponse(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: false,
      };
      
      setMessages(prev => [...prev, responseMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const getRandomResponse = () => {
    const responses = [
      "That sounds great!",
      "I'll let you know what I think about that.",
      "Could you provide more details?",
      "Let's discuss this further when we meet.",
      "Thanks for sharing that with me!",
      "I appreciate your input on this matter.",
      "I'll get back to you on this soon.",
      "Interesting perspective!",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const goBack = () => {
    router.push('/chat');
  };

  function someFunction(param: string) { // Replace `any` with `string` or appropriate type
    // Function implementation
  }

  if (!chat) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-black to-gray-900">
      {/* Chat header */}
      <div className="flex items-center p-3 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <button 
          onClick={goBack}
          className="p-2 rounded-full hover:bg-white/10 transition-all mr-2 md:hidden"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center flex-1">
          <div className="relative mr-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-cyan-400 p-0.5">
              <div className="w-full h-full rounded-full overflow-hidden bg-black">
                <Image
                  src={chat.avatar || '/default-avatar.png'}
                  alt={chat.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            </div>
            
            {chat.online && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></div>
            )}
          </div>
          
          <div>
            <h2 className="font-semibold">{chat.name}</h2>
            {isTyping ? (
              <p className="text-xs text-cyan-400">typing...</p>
            ) : chat.online ? (
              <p className="text-xs text-gray-400">online</p>
            ) : (
              <p className="text-xs text-gray-400">last seen today at 11:30 AM</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-white/10 transition-all">
            <Phone size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-all">
            <Video size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <MessageList messages={messages} />
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start mt-3"
          >
            <div className="flex items-center space-x-1 bg-white/10 rounded-2xl py-2 px-4 max-w-xs">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-75">.</span>
              <span className="animate-bounce delay-150">.</span>
            </div>
          </motion.div>
        )}
        
        <div ref={bottomRef} />
      </div>
      
      {/* Chat input */}
      <ChatInput onSendMessage={handleSendMessage} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-black to-gray-900">
      {/* Add your main chat UI here */}
    </div>
  );
}