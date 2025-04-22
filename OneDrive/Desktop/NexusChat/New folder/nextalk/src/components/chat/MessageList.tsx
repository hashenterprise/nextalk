'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isUser: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Group messages by day
  const groupedMessages: { [key: string]: Message[] } = {};
  
  messages.forEach(message => {
    // In a real app, you'd properly parse the timestamp
    // For now, we'll just use what we have
    const day = message.timestamp.includes('Yesterday') 
      ? 'Yesterday' 
      : message.timestamp.includes('AM') || message.timestamp.includes('PM')
        ? 'Today'
        : message.timestamp.split(',')[0];
    
    if (!groupedMessages[day]) {
      groupedMessages[day] = [];
    }
    
    groupedMessages[day].push(message);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([day, dayMessages]) => (
        <div key={day} className="space-y-3">
          <div className="flex justify-center">
            <div className="bg-white/10 rounded-full px-4 py-1 text-xs text-gray-400">
              {day}
            </div>
          </div>
          
          {dayMessages.map((message, index) => {
            // Check if this message is part of a consecutive group from the same sender
            const prevMessage = index > 0 ? dayMessages[index - 1] : null;
            const nextMessage = index < dayMessages.length - 1 ? dayMessages[index + 1] : null;
            
            const isFirstInGroup = !prevMessage || prevMessage.isUser !== message.isUser;
            const isLastInGroup = !nextMessage || nextMessage.isUser !== message.isUser;
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] ${
                    message.isUser 
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' 
                      : 'bg-white/10 backdrop-blur-sm'
                  } ${
                    isFirstInGroup && isLastInGroup
                      ? message.isUser ? 'rounded-2xl' : 'rounded-2xl'
                      : isFirstInGroup
                        ? message.isUser ? 'rounded-t-2xl rounded-bl-2xl rounded-br-md' : 'rounded-t-2xl rounded-br-2xl rounded-bl-md'
                        : isLastInGroup
                          ? message.isUser ? 'rounded-b-2xl rounded-tl-2xl rounded-tr-md' : 'rounded-b-2xl rounded-tr-2xl rounded-tl-md'
                          : message.isUser ? 'rounded-l-2xl rounded-tr-md rounded-br-md' : 'rounded-r-2xl rounded-tl-md rounded-bl-md'
                  } px-4 py-2 ${!isLastInGroup ? 'mb-1' : ''}`}
                >
                  {!message.isUser && isFirstInGroup && (
                    <div className="text-xs font-medium mb-1 text-purple-400">
                      {message.sender}
                    </div>
                  )}
                  
                  <div className="break-words">{message.text}</div>
                  
                  <div className="flex justify-end items-center mt-1 space-x-1">
                    <span className="text-xs opacity-70">{message.timestamp.includes(',') ? message.timestamp.split(',')[1].trim() : message.timestamp}</span>
                    
                    {message.isUser && (
                      <CheckCheck size={14} className="text-cyan-300" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}