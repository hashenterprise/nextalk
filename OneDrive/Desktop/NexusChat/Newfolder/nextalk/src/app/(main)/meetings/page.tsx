'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Users, 
  MessageSquare, 
  Share2, 
  MoreHorizontal,
  Plus,
  Calendar,
  Clock,
  Copy,
  Settings,
  Loader2,
  CircleDot, // Use this as an alternative to 'Record'
  StopCircle
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import AgoraRTC, { IAgoraRTCRemoteUser, IMicrophoneAudioTrack, ICameraVideoTrack } from 'agora-rtc-sdk-ng';

// Generate a random meeting ID
const generateMeetingId = () => {
  return Math.random().toString(36).substring(2, 10);
};

// Initialize Agora client
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

// Update the interface to match Next.js 13+ types
interface PageProps {
  meetingId?: string;
}

export default function MeetingsPage({ meetingId }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMeetingId = meetingId || searchParams.get('id');
  const userId = auth.currentUser?.uid;
  const [userName, setUserName] = useState('');
  
  // Meeting states
  const [isJoined, setIsJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [meetingData, setMeetingData] = useState<{
    title?: string;
    hostId?: string;
    participants?: string[];
    agoraAppId?: string;
    channelName?: string;
    isRecording?: boolean;
    recordingResourceId?: string | null;
    recordingSid?: string | null;
  } | null>(null);
  const [newMeetingId, setNewMeetingId] = useState('');
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMeetingId, setJoinMeetingId] = useState('');
  
  // Media controls
  const [localTracks, setLocalTracks] = useState<{
    videoTrack: ICameraVideoTrack | null;
    audioTrack: IMicrophoneAudioTrack | null;
  }>({
    videoTrack: null,
    audioTrack: null,
  });
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  
  // Meeting UI states
  const [activeTab, setActiveTab] = useState('participants');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Chat states
  const [chatMessages, setChatMessages] = useState<{
    userId: string,
    userName: string,
    message: string,
    timestamp: Date
  }[]>([]);
  const [messageInput, setMessageInput] = useState('');
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingResourceId, setRecordingResourceId] = useState<string | null>(null);
  const [recordingSid, setRecordingSid] = useState<string | null>(null);
  
  // Refs for video containers
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  useEffect(() => {
    const getUserProfile = async () => {
      if (!userId) return;
      
      try {
        const docRef = doc(db, 'user_profiles', userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.display_name || 'Anonymous');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    getUserProfile();
    
    if (currentMeetingId) {
      fetchMeetingDetails();
    } else {
      setIsLoading(false);
    }
    
    // Initialize Agora event listeners
    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserLeft);
    
    return () => {
      // Clean up Agora event listeners
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-left', handleUserLeft);
      
      // Leave the meeting and clean up tracks if joined
      if (isJoined) {
        leaveCall();
      }
    };
  }, [userId, currentMeetingId, fetchMeetingDetails, isJoined, leaveCall]);

  // Redirect if query parameter `id` is used instead of dynamic route
  useEffect(() => {
    const queryId = searchParams.get('id');
    if (queryId && queryId !== currentMeetingId) {
      router.replace(`/meetings/${queryId}`);
    }
  }, [searchParams, currentMeetingId, router]);
  
  const fetchMeetingDetails = useCallback(async () => {
    if (!currentMeetingId) return;

    try {
      const meetingRef = doc(db, 'meetings', currentMeetingId);
      const meetingSnap = await getDoc(meetingRef);
      
      if (meetingSnap.exists()) {
        const data = meetingSnap.data();
        setMeetingData(data);
        setIsHost(data.hostId === userId);
        
        // Set recording state
        if (data.isRecording) {
          setIsRecording(data.isRecording);
          setRecordingResourceId(data.recordingResourceId);
          setRecordingSid(data.recordingSid);
        }
        
        setIsLoading(false);
      } else {
        console.error('Meeting not found');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching meeting details:', error);
      setIsLoading(false);
    }
  }, [currentMeetingId, userId]);
  
  const createMeeting = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    const id = newMeetingId || generateMeetingId();
    
    try {
      // Generate a random Agora token for demo purposes
      // In production, you would use your server to generate secure tokens
      const agoraAppId = '2af010588bab409290e471bac71b509a'; // Replace with your Agora app ID
      
      const meetingData = {
        title: newMeetingTitle || 'Quick Meeting',
        hostId: userId,
        hostName: userName,
        createdAt: serverTimestamp(),
        status: 'active',
        participants: [userId],
        agoraAppId,
        channelName: id,
        isRecording: false,
        recordingResourceId: null,
        recordingSid: null,
        recordings: [], // Array of recording URLs
      };
      
      await setDoc(doc(db, 'meetings', id), meetingData);
      
      // Navigate to the meeting room
      router.push(`/meetings/${id}`);
      setShowCreateModal(false);
      
      // Reset form fields
      setNewMeetingId('');
      setNewMeetingTitle('');
    } catch (error) {
      console.error('Error creating meeting:', error);
      setIsLoading(false);
    }
  };
  
  const joinMeeting = () => {
    if (joinMeetingId) {
      router.push(`/meetings/${joinMeetingId}`);
      setShowJoinModal(false);
      setJoinMeetingId('');
    }
  };
  
  const joinCall = async () => {
    if (!currentMeetingId || !meetingData) return;
    
    try {
      setIsLoading(true);

      // Fetch token from the token server
      const tokenRes = await fetch(
        `http://localhost:5000/rtc-token?channelName=${meetingData.channelName}`
      );

      if (!tokenRes.ok) {
        throw new Error(`Token server error: ${tokenRes.statusText}`);
      }

      const { token } = await tokenRes.json();

      // Join the channel with the token
      await client.join(meetingData.agoraAppId, meetingData.channelName, token, null);

      // Create and publish local audio and video tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      
      // Play video in local container
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }
      
      // Publish tracks
      await client.publish([audioTrack, videoTrack]);
      
      setLocalTracks({
        audioTrack,
        videoTrack,
      });
      
      setIsJoined(true);
      setIsLoading(false);
      
      // Update meeting participants in Firestore
      if (!meetingData.participants?.includes(userId)) {
        const meetingRef = doc(db, 'meetings', currentMeetingId);
        await setDoc(meetingRef, {
          participants: [...meetingData.participants, userId]
        }, { merge: true });
      }
      
    } catch (error) {
      console.error('Error joining call:', error);
      alert('Failed to join the call. Please try again.');
      setIsLoading(false);
    }
  };
  
  const leaveCall = useCallback(async () => {
    try {
      // Stop recording if it's still active
      if (isRecording) {
        await stopRecording();
      }
      
      // Destroy local tracks
      if (localTracks.audioTrack) {
        localTracks.audioTrack.close();
      }
      
      if (localTracks.videoTrack) {
        localTracks.videoTrack.close();
      }
      
      // Leave the channel
      await client.leave();
      
      setLocalTracks({
        audioTrack: null,
        videoTrack: null,
      });
      
      setRemoteUsers([]);
      setIsJoined(false);
      
      // Navigate back to meetings list
      router.push('/meetings');
    } catch (error) {
      console.error('Error leaving call:', error);
    }
  }, [isRecording, localTracks, router, stopRecording]);
  
  const toggleVideo = async () => {
    if (localTracks.videoTrack) {
      if (isVideoOn) {
        await localTracks.videoTrack.setEnabled(false);
      } else {
        await localTracks.videoTrack.setEnabled(true);
      }
      setIsVideoOn(!isVideoOn);
    }
  };
  
  const toggleAudio = async () => {
    if (localTracks.audioTrack) {
      if (isAudioOn) {
        await localTracks.audioTrack.setEnabled(false);
      } else {
        await localTracks.audioTrack.setEnabled(true);
      }
      setIsAudioOn(!isAudioOn);
    }
  };
  
  const startRecording = async () => {
    try {
      setIsLoading(true);
      
      // Call backend API endpoint for starting recording
      const response = await fetch('/api/recording/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appId: meetingData?.agoraAppId,
          channelName: meetingData?.channelName,
          uid: userId
        })
      });
      
      const data = await response.json();
      
      // Update state
      setIsRecording(true);
      setRecordingResourceId(data.resourceId);
      setRecordingSid(data.sid);
      
      // Update in Firestore
      const meetingRef = doc(db, 'meetings', currentMeetingId);
      await setDoc(meetingRef, {
        isRecording: true,
        recordingResourceId: data.resourceId,
        recordingSid: data.sid
      }, { merge: true });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsLoading(false);
    }
  };
  
  const stopRecording = async () => {
    try {
      setIsLoading(true);
      
      // Call backend API endpoint for stopping recording
      await fetch('/api/recording/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appId: meetingData?.agoraAppId,
          channelName: meetingData?.channelName,
          resourceId: recordingResourceId,
          sid: recordingSid,
          uid: userId
        })
      });
      
      // Get recording URL from backend
      const response = await fetch(`/api/recording/${currentMeetingId}/info`);
      const recordingData = await response.json();
      
      // Update in Firestore
      const meetingRef = doc(db, 'meetings', currentMeetingId);
      await setDoc(meetingRef, {
        isRecording: false,
        recordingResourceId: null,
        recordingSid: null,
        recordings: arrayUnion({
          url: recordingData.url,
          timestamp: serverTimestamp(),
          duration: recordingData.duration
        })
      }, { merge: true });
      
      // Update state
      setIsRecording(false);
      setRecordingResourceId(null);
      setRecordingSid(null);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsLoading(false);
    }
  };
  
  const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    await client.subscribe(user, mediaType);
    
    if (mediaType === 'video') {
      setRemoteUsers(prevUsers => {
        if (prevUsers.find(u => u.uid === user.uid)) {
          return prevUsers;
        }
        return [...prevUsers, user];
      });
    }
    
    if (mediaType === 'video' && user.videoTrack) {
      // Find the div for this user or wait for it to be created
      setTimeout(() => {
        const userNode = remoteVideoRefs.current.get(user.uid.toString());
        if (userNode && user.videoTrack) {
          user.videoTrack.play(userNode);
        }
      }, 100);
    }
    
    if (mediaType === 'audio' && user.audioTrack) {
      user.audioTrack.play();
    }
  };
  
  const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    if (mediaType === 'video') {
      setRemoteUsers(prevUsers => {
        return prevUsers.filter(u => u.uid !== user.uid);
      });
    }
  };
  
  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setRemoteUsers(prevUsers => {
      return prevUsers.filter(u => u.uid !== user.uid);
    });
  };
  
  const sendChatMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMessage = {
      userId: userId || 'anonymous',
      userName: userName || 'Anonymous',
      message: messageInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    
    // In a production app, you'd store messages in Firestore
  };
  
  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meetings/${currentMeetingId}`;
    navigator.clipboard.writeText(link);
    // You could add a toast notification here
  };
  
  // Helpers for UI display
  const getLayout = () => {
    const count = remoteUsers.length;
    if (count === 0) return 'single';
    if (count === 1) return 'split';
    if (count <= 3) return 'grid-3';
    return 'grid-many';
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin w-12 h-12 text-cyan-500 mb-4" />
          <p className="text-lg">Preparing your meeting space...</p>
        </div>
      </div>
    );
  }
  
  if (currentMeetingId && !isJoined) {
    return (
      <div className="h-full flex flex-col bg-gray-900">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <button 
            className="p-2 hover:bg-gray-800 rounded-full"
            onClick={() => router.push('/meetings')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">Join Meeting</h1>
          <div className="w-8 h-8"></div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-cyan-400 p-1 mb-6">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
              <Video className="w-12 h-12 text-white/50" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">{meetingData?.title || 'Join Meeting'}</h2>
          <p className="text-gray-400 mb-6">Meeting ID: {currentMeetingId}</p>
          
          <button 
            onClick={joinCall}
            className="py-3 px-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-medium transition-all hover:opacity-90 flex items-center"
          >
            <Video className="mr-2" size={20} />
            Join Now
          </button>
        </div>
      </div>
    );
  }
  
  if (!currentMeetingId) {
    return (
      <div className="h-full flex flex-col bg-gray-900">
        <div className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
            Meetings
          </h1>
          <div className="flex space-x-2">
            <button 
              className="p-2 rounded-full hover:bg-white/10 transition-all"
              onClick={() => setShowJoinModal(true)}
            >
              <Video size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition-all">
              <Settings size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-8">
            <motion.button
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-purple-700 rounded-xl flex items-center justify-center space-x-3 shadow-lg"
            >
              <Plus size={24} />
              <span className="text-lg font-medium">New Meeting</span>
            </motion.button>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">Quick Join</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter meeting code"
                value={joinMeetingId}
                onChange={(e) => setJoinMeetingId(e.target.value)}
                className="w-full bg-white/10 border-none rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => joinMeetingId && router.push(`/meetings?id=${joinMeetingId}`)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 p-2 rounded-lg"
                disabled={!joinMeetingId}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-bold mb-4">Scheduled Meetings</h2>
            <div className="space-y-4">
              {/* This would be populated from your Firestore database */}
              <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Weekly Team Sync</h3>
                  <span className="text-sm text-cyan-400">In 1 hour</span>
                </div>
                <div className="flex items-center text-sm text-gray-400 mb-3">
                  <Calendar size={14} className="mr-1" />
                  <span>Every Monday, 10:00 AM</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 border border-gray-800">
                      <Image src="/avatars/sarah.jpg" alt="Participant" width={24} height={24} />
                    </div>
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 border border-gray-800">
                      <Image src="/avatars/michael.jpg" alt="Participant" width={24} height={24} />
                    </div>
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 border border-gray-800">
                      <Image src="/avatars/alex.jpg" alt="Participant" width={24} height={24} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">+2 more</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Product Review</h3>
                  <span className="text-sm text-gray-400">Tomorrow</span>
                </div>
                <div className="flex items-center text-sm text-gray-400 mb-3">
                  <Clock size={14} className="mr-1" />
                  <span>2:30 PM - 3:30 PM</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 border border-gray-800">
                      <Image src="/avatars/jamie.jpg" alt="Participant" width={24} height={24} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">+5 more</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Create Meeting Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">Create New Meeting</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Meeting Title</label>
                  <input
                    type="text"
                    value={newMeetingTitle}
                    onChange={(e) => setNewMeetingTitle(e.target.value)}
                    placeholder="Quick Meeting"
                    className="w-full bg-gray-700 border-none rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Custom Meeting ID (optional)</label>
                  <input
                    type="text"
                    value={newMeetingId}
                    onChange={(e) => setNewMeetingId(e.target.value)}
                    placeholder="Leave empty for random ID"
                    className="w-full bg-gray-700 border-none rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={createMeeting}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-medium"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* Join Meeting Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">Join Meeting</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Meeting ID</label>
                  <input
                    type="text"
                    value={joinMeetingId}
                    onChange={(e) => setJoinMeetingId(e.target.value)}
                    placeholder="Enter meeting ID"
                    className="w-full bg-gray-700 border-none rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={joinMeeting}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-medium"
                  disabled={!joinMeetingId}
                >
                  Join
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }
  
  // In-call meeting view
  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="p-2 hover:bg-gray-800 rounded-full"
            onClick={leaveCall}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="ml-4 text-xl font-bold truncate">{meetingData?.title || 'Meeting'}</h1>
          {isRecording && (
          <div className="ml-3 flex items-center text-red-500">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-1 animate-pulse"></div>
          <span className="text-xs">Recording</span>
        </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <button 
                    className="p-2 hover:bg-gray-800 rounded-full"
                    onClick={copyMeetingLink}
                  >
                    <Copy size={18} />
                  </button>
                  <button className="ml-2 p-2 hover:bg-gray-800 rounded-full">
                    <Settings size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 flex overflow-hidden">
                {/* Main video area */}
                <div className={`flex-1 p-3 ${isChatOpen ? 'pr-[320px]' : ''}`}>
                  <div className={`h-full grid gap-3 relative ${
                    getLayout() === 'single' ? 'grid-cols-1' :
                    getLayout() === 'split' ? 'grid-cols-2' :
                    getLayout() === 'grid-3' ? 'grid-cols-2 grid-rows-2' :
                    'grid-cols-3 grid-rows-2'
                  }`}>
                    {/* Local video */}
                    <div 
                      ref={localVideoRef}
                      className={`bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center relative ${
                        getLayout() === 'single' ? 'col-span-1 row-span-1' :
                        getLayout() === 'split' ? 'col-span-1 row-span-1' :
                        'col-span-1 row-span-1'
                      }`}
                    >
                      {!isVideoOn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                            <span className="text-2xl font-bold">{userName?.charAt(0).toUpperCase()}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 rounded-lg text-sm">
                        {userName} (You)
                      </div>
                    </div>
                    
                    {/* Remote videos */}
                    {remoteUsers.map(user => (
                      <div 
                        key={user.uid}
                        ref={node => {
                          if (node) {
                            remoteVideoRefs.current.set(user.uid.toString(), node);
                            // Play video if track is available
                            if (user.videoTrack) {
                              user.videoTrack.play(node);
                            }
                          }
                        }}
                        className="bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center relative"
                      >
                        {/* If video is turned off, show avatar placeholder */}
                        {!user.videoTrack && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="text-2xl font-bold">U</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 rounded-lg text-sm">
                          User {user.uid}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Chat sidebar */}
                {isChatOpen && (
                  <div className="fixed right-0 top-[59px] bottom-[72px] w-[320px] bg-gray-800 border-l border-gray-700 flex flex-col">
                    <div className="p-3 border-b border-gray-700">
                      <div className="flex items-center space-x-4">
                        <button 
                          className={`flex-1 py-2 text-center rounded-lg ${activeTab === 'participants' ? 'bg-white/10' : ''}`}
                          onClick={() => setActiveTab('participants')}
                        >
                          <Users size={18} className="mx-auto mb-1" />
                          <span className="text-xs">Participants</span>
                        </button>
                        <button 
                          className={`flex-1 py-2 text-center rounded-lg ${activeTab === 'chat' ? 'bg-white/10' : ''}`}
                          onClick={() => setActiveTab('chat')}
                        >
                          <MessageSquare size={18} className="mx-auto mb-1" />
                          <span className="text-xs">Chat</span>
                        </button>
                      </div>
                    </div>
                    
                    {activeTab === 'participants' && (
                      <div className="flex-1 overflow-y-auto p-3">
                        <div className="space-y-3">
                          {/* Host */}
                          <div className="flex items-center p-2 rounded-lg hover:bg-white/5">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                              <span className="text-sm font-bold">
                                {userName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{userName} (You)</p>
                              <span className="text-xs text-gray-400">Host</span>
                            </div>
                          </div>
                          
                          {/* Remote participants would be mapped here */}
                          {remoteUsers.map(user => (
                            <div key={user.uid} className="flex items-center p-2 rounded-lg hover:bg-white/5">
                              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                                <span className="text-sm font-bold">U</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">User {user.uid}</p>
                              </div>
                              {user.audioTrack?.isPlaying && (
                                <Mic size={16} className="text-green-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'chat' && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-y-auto p-3">
                          <div className="space-y-3">
                            {chatMessages.map((msg, idx) => (
                              <div key={idx} className={`flex ${msg.userId === userId ? 'justify-end' : ''}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 ${
                                  msg.userId === userId ? 'bg-purple-600' : 'bg-gray-700'
                                }`}>
                                  {msg.userId !== userId && (
                                    <p className="text-xs font-medium text-gray-300 mb-1">{msg.userName}</p>
                                  )}
                                  <p className="text-sm">{msg.message}</p>
                                  <p className="text-xs text-right mt-1 opacity-70">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            ))}
                            
                            {chatMessages.length === 0 && (
                              <div className="h-full flex items-center justify-center text-center p-6">
                                <div>
                                  <MessageSquare size={32} className="mx-auto mb-3 text-gray-500" />
                                  <p className="text-gray-500">No messages yet</p>
                                  <p className="text-xs text-gray-500 mt-1">Be the first to say something!</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-3 border-t border-gray-700">
                          <div className="relative">
                            <input
                              type="text"
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                              placeholder="Type a message..."
                              className="w-full bg-gray-700 border-none rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                              onClick={sendChatMessage}
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-purple-600 p-2 rounded-full"
                              disabled={!messageInput.trim()}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Bottom controls */}
              <div className="bg-gray-800 border-t border-gray-700 p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={toggleAudio}
                    className={`p-3 rounded-full ${isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
                  </button>
                  
                  <button 
                    onClick={toggleVideo}
                    className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
                  >
                    {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isHost && (
                    <button 
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-3 rounded-full ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                      {isRecording ? <StopCircle size={20} /> : <CircleDot size={20} />}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`p-3 rounded-full ${isChatOpen ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    <MessageSquare size={20} />
                  </button>
                  
                  <button 
                    className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"
                    onClick={copyMeetingLink}
                  >
                    <Share2 size={20} />
                  </button>
                  
                  <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <button 
                  className="p-3 rounded-full bg-red-600 hover:bg-red-700"
                  onClick={leaveCall}
                >
                  <PhoneOff size={20} />
                </button>
              </div>
            </div>
          );
        }