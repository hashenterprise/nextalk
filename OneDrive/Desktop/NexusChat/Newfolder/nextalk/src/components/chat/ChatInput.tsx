'use client';

import { useState, useRef } from 'react';
import { 
  Smile, 
  Paperclip, 
  Mic, 
  Camera, 
  Image as ImageIcon, 
  File, 
  Send, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInput({ onSendMessage }: { onSendMessage: (message: string) => void }) {
  const [message, setMessage] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Sample emoji list
  const emojis = ['😊', '😂', '😍', '👍', '🎉', '❤️', '🔥', '👋', '🤔', '😎', '🙏', '💯', '🌟', '🥳'];
  
  // Sample attachment options
  const attachmentOptions = [
    { icon: Camera, label: 'Camera' },
    { icon: ImageIcon, label: 'Photos' },
    { icon: File, label: 'Document' },
    { icon: Mic, label: 'Audio' },
  ];

  return (
    <div className="relative border-t border-white/10 bg-white/5 rounded-b-2xl p-3">
      {/* Attachment popup */}
      <AnimatePresence>
        {showAttachments && (
          <motion.div 
            className="absolute bottom-full mb-2 left-4 glass-effect p-3 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex space-x-4 px-2">
              {attachmentOptions.map((option) => (
                <button 
                  key={option.label}
                  className="flex flex-col items-center justify-center p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <option.icon size={24} className="text-purple-300 mb-1" />
                  <span className="text-xs">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Emoji picker */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div 
            className="absolute bottom-full mb-2 right-4 glass-effect p-3 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="grid grid-cols-7 gap-2">
              {emojis.map((emoji) => (
                <button 
                  key={emoji}
                  className="text-xl p-2 hover:bg-white/10 rounded-lg transition-all"
                  onClick={() => {
                    setMessage(prev => prev + emoji);
                    inputRef.current?.focus();
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <button 
          type="button"
          className="p-2 rounded-full hover:bg-white/10 transition-all relative"
          onClick={() => {
            setShowAttachments(!showAttachments);
            setShowEmojis(false);
          }}
        >
          {showAttachments ? <X size={20} /> : <Paperclip size={20} />}
        </button>
        
        <div className="flex-1 bg-white/10 rounded-2xl overflow-hidden">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-transparent border-none resize-none px-4 py-3 max-h-32 focus:outline-none"
            rows={1}
            style={{ 
              height: 'auto', 
              minHeight: '44px',
              maxHeight: '120px',
            }}
          />
        </div>
        
        <button 
          type="button"
          className="p-2 rounded-full hover:bg-white/10 transition-all"
          onClick={() => {
            setShowEmojis(!showEmojis);
            setShowAttachments(false);
          }}
        >
          {showEmojis ? <X size={20} /> : <Smile size={20} />}
        </button>
        
        <button 
          type="submit"
          className={`p-3 rounded-full ${
            message.trim() 
              ? 'bg-gradient-to-r from-cyan-400 to-purple-500' 
              : 'bg-white/10'
          } transition-all`}
          disabled={!message.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}