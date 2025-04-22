'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, 
  Users, Volume2, VolumeX, RotateCcw 
} from 'lucide-react';

// Mock contacts data for the call
const contacts = {
  'call1': {
    id: 'call1',
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
  },
  'call2': {
    id: 'call2',
    name: 'Michael Torres',
    avatar: '/avatars/michael.jpg',
  },
  'call3': {
    id: 'call3',
    name: 'Alex Chen',
    avatar: '/avatars/alex.jpg',
  },
  'call4': {
    id: 'call4',
    name: 'Dev Team Group',
    avatar: '/avatars/group1.jpg',
    isGroup: true,
    members: ['Sarah Johnson', 'Michael Torres', 'Alex Chen', 'You'],
  },
  'call5': {
    id: 'call5',
    name: 'Jamie Wilson',
    avatar: '/avatars/jamie.jpg',
  },
};

export default function ActiveCallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contactId = searchParams.get('id') as keyof typeof contacts; // Explicitly type contactId
  const isVideoCall = searchParams.get('video') === 'true';
  
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(isVideoCall);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    // Start call timer
    const timer = setInterval(() => {
      setCallTimer(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    router.push('/calls');
  };

  if (!contactId || !contacts[contactId]) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p>Invalid call</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 rounded-lg"
            onClick={() => router.push('/calls')}
          >
            Return to Calls
          </button>
        </div>
      </div>
    );
  }

  const contact = contacts[contactId];

  return (
    <div className="h-full relative bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      {/* Video container */}
      {isVideoCall && (
        <div className="absolute inset-0 flex items-center justify-center">
          {isVideoOn ? (
            <div className="h-full w-full relative overflow-hidden">
              <Image
                src="/call-background.jpg"
                alt="Video call"
                fill
                className="object-cover"
              />
              
              {/* Self view (small picture-in-picture) */}
              <div className="absolute bottom-24 right-4 w-32 h-48 rounded-xl overflow-hidden border-2 border-white/20">
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Image
                    src="/avatars/me.jpg"
                    alt="You"
                    width={128}
                    height={192}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-gradient-to-r from-purple-500 to-cyan-400 p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                    <Image
                      src={contact.avatar || '/default-avatar.png'}
                      alt={contact.name}
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                </div>
                <h2 className="text-2xl font-bold">{contact.name}</h2>
                <p className="text-gray-400">{formatCallTime(callTimer)}</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Audio call UI (shown when it's not a video call or video is off) */}
      {!isVideoCall && (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-gradient-to-r from-purple-500 to-cyan-400 p-0.5"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                <Image
                  src={contact.avatar || '/default-avatar.png'}
                  alt={contact.name}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold">{contact.name}</h2>
            <p className="text-gray-400">{formatCallTime(callTimer)}</p>
          </div>
        </div>
      )}
      
      {/* Call controls */}
      <div className="absolute bottom-0 left-0 right-0 mb-8">
        <div className="flex justify-center space-x-4">
          <button 
            className={`p-4 rounded-full ${isMuted ? 'bg-red-600' : 'bg-white/10'}`}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          {isVideoCall && (
            <button 
              className={`p-4 rounded-full ${!isVideoOn ? 'bg-red-600' : 'bg-white/10'}`}
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
          )}
          
          <button 
            className={`p-4 rounded-full ${!isSpeakerOn ? 'bg-white/20' : 'bg-white/10'}`}
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          >
            {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
          
          <button 
            className="p-4 rounded-full bg-white/10"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare size={24} />
          </button>
          
          {'isGroup' in contact && contact.isGroup && (
            <button 
              className="p-4 rounded-full bg-white/10"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users size={24} />
            </button>
          )}
          
          <button 
            className="p-4 rounded-full bg-red-600"
            onClick={endCall}
          >
            <PhoneOff size={24} />
          </button>
        </div>
        
        {/* Call duration */}
        <div className="text-center mt-6">
          <p className="text-gray-400">{formatCallTime(callTimer)}</p>
        </div>
      </div>
      
      {/* Participants sidebar (for group calls) */}
     
  {showParticipants && 'isGroup' in contact && contact.isGroup && (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="absolute top-0 right-0 bottom-0 w-80 bg-black/80 backdrop-blur-lg border-l border-white/10 p-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Participants</h3>
        <button onClick={() => setShowParticipants(false)}>
          <RotateCcw size={18} />
        </button>
      </div>
      
      <div className="space-y-4">
        {contact.members?.map((member, index) => (
          <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5">
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
              <Image 
                src={`/avatars/person${index + 1}.jpg`} 
                alt={member}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{member}</p>
              {member === 'You' && <p className="text-xs text-gray-400">You</p>}
              {member !== 'You' && index % 2 === 0 && <p className="text-xs text-green-500">Speaking</p>}
              {member !== 'You' && index % 2 !== 0 && <p className="text-xs text-gray-400">Listening</p>}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )}
      
  {/* Chat sidebar during call */}
  {showChat && (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="absolute top-0 right-0 bottom-0 w-80 bg-black/80 backdrop-blur-lg border-l border-white/10 p-4"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Chat</h3>
        <button onClick={() => setShowChat(false)}>
          <RotateCcw size={18} />
        </button>
      </div>
      
      <div className="h-[calc(100%-160px)] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex flex-col items-start">
            <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">Hey, can you hear me clearly?</p>
            </div>
            <span className="text-xs text-gray-500 mt-1">Sarah • 2 min ago</span>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="bg-blue-800 rounded-lg p-3 max-w-[80%]">
              <p className="text-sm">Yes, the connection is good!</p>
            </div>
            <span className="text-xs text-gray-500 mt-1">You • 1 min ago</span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center space-x-2 bg-gray-800 rounded-full px-4 py-2">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="bg-transparent flex-1 focus:outline-none text-sm"
          />
          <button className="text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )}
</div>
);
}