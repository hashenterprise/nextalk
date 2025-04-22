'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, ChevronRight, Mail, Phone, User } from 'lucide-react';
import { db, storage, auth } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function UserInfoPage() {
  const router = useRouter();
  const userId = auth.currentUser?.uid;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError('Authentication error. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Handle profile image upload if provided
      let profileImagePath = null;
      if (profileImage) {
        const fileName = `${Date.now()}-${profileImage.name}`;
        const filePath = `profile-images/${userId}/${fileName}`;
        const storageRef = ref(storage, filePath);

        try {
          const snapshot = await uploadBytes(storageRef, profileImage);
          profileImagePath = await getDownloadURL(snapshot.ref);
        } catch (error) {
          console.error('Caught upload error:', error);
          setError(error instanceof Error ? error.message : 'File upload failed');
          setIsLoading(false);
          return;
        }
      }

      // Prepare user data for database
      const userData = {
        display_name: profileData.displayName,
        email: profileData.email,
        phone_number: profileData.phoneNumber,
        bio: profileData.bio,
        profile_image: profileImagePath,
        time_zone: profileData.timeZone,
        language: profileData.language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save user data to Firestore
      await setDoc(doc(db, 'user_profiles', userId), userData);

      // Redirect to chat page on success
      router.push('/chat');
    } catch (error) {
      console.error('Error saving user data:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-violet-900">
      <div className="max-w-3xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center">
            <Image src="/logo.svg" alt="NextTalk Logo" width={28} height={28} />
            <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              NextTalk
            </h1>
          </div>
          
          <button 
            onClick={handleSkip}
            className="text-gray-400 hover:text-white flex items-center text-sm"
          >
            Skip for now
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-auto px-6 py-8">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
              <p className="text-gray-300">
                Let us set up your profile so others can connect with you
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white">
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Profile picture section */}
              <div className="mb-8 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                      {profileImageUrl ? (
                        <Image 
                          src={profileImageUrl} 
                          alt="Profile preview" 
                          width={112} 
                          height={112}
                          className="object-cover w-full h-full" 
                        />
                      ) : (
                        <User size={48} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={16} />
                  </button>
                  
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </div>
                
                <p className="text-gray-400 text-sm mt-3">Upload a profile picture</p>
              </div>
              
              {/* Form fields */}
              <div className="space-y-6">
                {/* Display Name */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <label className="block text-sm text-gray-300 mb-2">Display Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                
                {/* Email */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <label className="block text-sm text-gray-300 mb-2">Backup Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-500" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                {/* Phone Number */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <label className="block text-sm text-gray-300 mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={16} className="text-gray-500" />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500"
                      placeholder="+1 (123) 456-7890"
                    />
                  </div>
                </div>
                
                {/* Bio */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <label className="block text-sm text-gray-300 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    className="block w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="Tell us a bit about yourself&#39;..."
                    rows={3}
                  />
                </div>
                
                {/* Time Zone and Language in the same row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Time Zone */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <label className="block text-sm text-gray-300 mb-2">Time Zone</label>
                    <select
                      name="timeZone"
                      value={profileData.timeZone}
                      onChange={handleChange}
                      className="block w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">GMT/BST (UK)</option>
                      <option value="Europe/Paris">Central European Time (CET)</option>
                      <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                      <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                    </select>
                  </div>
                  
                  {/* Language */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <label className="block text-sm text-gray-300 mb-2">Language</label>
                    <select
                      name="language"
                      value={profileData.language}
                      onChange={handleChange}
                      className="block w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="fr-FR">French</option>
                      <option value="de-DE">German</option>
                      <option value="ja-JP">Japanese</option>
                      <option value="zh-CN">Chinese (Simplified)</option>
                      <option value="pt-BR">Portuguese (Brazil)</option>
                      <option value="ru-RU">Russian</option>
                      <option value="ar-SA">Arabic</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Submit button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-xl text-white font-medium shadow-lg shadow-purple-700/30 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    'Continue to NextTalk'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 text-center text-gray-500 text-sm border-t border-white/10">
          © {new Date().getFullYear()} NextTalk. All rights reserved.
        </div>
      </div>
    </div>
  );
}