'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Send, ChevronLeft, ChevronRight, Heart, MessageCircle } from 'lucide-react';

interface Story {
  id: string;
  image?: string;
  text?: string;
  timestamp: string;
  seen: boolean;
}

interface StatusViewerProps {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  stories: Story[];
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function StatusViewer({ user, stories, onClose, onPrev, onNext }: StatusViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const storyDuration = 5000; // 5 seconds per story
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const goToNextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (onNext) {
      onNext();
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onNext, onClose]);

  const startProgress = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    const startTime = Date.now();
    const updateProgress = () => {
      if (paused) return;

      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / storyDuration) * 100;

      if (newProgress >= 100) {
        setProgress(100);
        goToNextStory();
      } else {
        setProgress(newProgress);
      }
    };

    progressInterval.current = setInterval(updateProgress, 50);
  }, [paused, storyDuration, goToNextStory]);

  useEffect(() => {
    setProgress(0);
    startProgress();

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, paused, startProgress]);

  const goToPrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (onPrev) {
      onPrev();
    }
  };

  const handleReply = () => {
    if (replyText.trim()) {
      // In a real app, you would send this reply to your backend
      console.log('Reply to', user.name, ':', replyText);
      setReplyText('');
      setShowReply(false);
    }
  };

  const currentStory = stories[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close button */}
      <button 
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50"
        onClick={onClose}
      >
        <X size={24} />
      </button>
      
      {/* Story progress bars */}
      <div className="absolute top-0 left-0 right-0 flex space-x-1 p-4 z-10">
        {stories.map((story, index) => (
          <div 
            key={story.id}
            className="h-1 rounded-full bg-white/30 flex-1"
          >
            {index === currentIndex ? (
              <motion.div 
                className="h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
            ) : (
              <div 
                className={`h-full rounded-full ${
                  index < currentIndex ? 'bg-white' : 'bg-white/30'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* User info */}
      <div className="absolute top-8 left-0 right-0 flex items-center px-4 z-10">
        <Image
          src={user.avatar || '/default-avatar.png'}
          alt={user.name}
          width={40}
          height={40}
          className="rounded-full mr-3"
        />
        <div>
          <h3 className="font-medium">{user.name}</h3>
          <p className="text-xs text-gray-400">{currentStory.timestamp}</p>
        </div>
      </div>
      
      {/* Left/Right navigation areas */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          goToPrevStory();
        }}
      >
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50">
          <ChevronLeft size={20} />
        </div>
      </div>
      
      <div 
        className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          goToNextStory();
        }}
      >
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50">
          <ChevronRight size={20} />
        </div>
      </div>
      
      {/* Story content */}
      <div 
        className="w-full h-full flex items-center justify-center"
        onClick={() => setPaused(!paused)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStory.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-full max-h-full"
          >
            {currentStory.image ? (
              <Image
                src={currentStory.image}
                alt=""
                width={500}
                height={800}
                className="max-h-[90vh] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
            ) : currentStory.text ? (
              <div className="max-w-md p-8 rounded-xl glass-effect">
                <p className="text-xl text-center font-medium">{currentStory.text}</p>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Reply and reaction area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        {showReply ? (
          <div className="flex items-center space-x-2 glass-effect rounded-full p-1 pl-4">
            <input
              ref={inputRef}
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${user.name}...`}
              className="bg-transparent flex-1 border-none focus:outline-none"
              autoFocus
            />
            <button 
              className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600"
              onClick={handleReply}
            >
              <Send size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <button className="p-3 rounded-full glass-effect">
                <Heart size={20} className="text-red-400" />
              </button>
            </div>
            
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-full glass-effect"
              onClick={() => {
                setShowReply(true);
                setPaused(true);
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 100);
              }}
            >
              <MessageCircle size={20} />
              <span>Reply</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}