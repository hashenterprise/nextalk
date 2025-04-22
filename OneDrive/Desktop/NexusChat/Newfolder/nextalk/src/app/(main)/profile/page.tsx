'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, Edit2, Save, X, Loader2 } from 'lucide-react';
import { db, storage, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export default function ProfilePage() {
  const router = useRouter();
  const userId = auth.currentUser?.uid;
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    status: 'Available',
    about: '',
    phone: '',
    email: '',
    profileImage: null as string | null
  });
  
  const [tempData, setTempData] = useState({ ...profileData });
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        const docRef = doc(db, 'user_profiles', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            name: data.display_name || '',
            status: 'Available',
            about: data.bio || '',
            phone: data.phone_number || '',
            email: data.email || '',
            profileImage: data.profile_image || null,
          });

          setTempData({
            name: data.display_name || '',
            status: 'Available',
            about: data.bio || '',
            phone: data.phone_number || '',
            email: data.email || '',
            profileImage: data.profile_image || null,
          });

          if (data.profile_image) {
            setProfileImagePreview(data.profile_image);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleCancel = () => {
    setTempData({ ...profileData });
    setNewProfileImage(null);
    setProfileImagePreview(profileData.profileImage);
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    if (!userId) return;

    setIsSaving(true);

    try {
      let profileImagePath = profileData.profileImage;
      if (newProfileImage) {
        const fileName = newProfileImage.name;
        const filePath = `profile-images/${userId}/${fileName}`;
        const storageRef = ref(storage, filePath);

        try {
          const snapshot = await uploadBytes(storageRef, newProfileImage);
          profileImagePath = await getDownloadURL(snapshot.ref);

          if (profileData.profileImage) {
            const oldImageRef = ref(storage, profileData.profileImage);
            await deleteObject(oldImageRef);
          }
        } catch (uploadError) {
          console.error('Upload failed:', uploadError);
          throw new Error('Failed to upload profile image. Please try again.');
        }
      }

      const updatedData = {
        display_name: tempData.name,
        email: tempData.email,
        phone_number: tempData.phone,
        bio: tempData.about,
        profile_image: profileImagePath,
        updated_at: new Date().toISOString(),
      };

      await setDoc(doc(db, 'user_profiles', userId), updatedData);

      setProfileData({
        ...tempData,
        profileImage: profileImagePath,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="p-2 hover:bg-gray-800 rounded-full"
            onClick={() => router.back()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="ml-4 text-xl font-bold">Profile</h1>
        </div>
        
        {isLoading ? (
          <div className="w-8 h-8 flex items-center justify-center">
            <Loader2 className="animate-spin" size={20} />
          </div>
        ) : !isEditing ? (
          <button 
            className="p-2 hover:bg-gray-800 rounded-full"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 size={20} />
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 hover:bg-gray-800 rounded-full text-red-500"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X size={20} />
            </button>
            <button 
              className="p-2 hover:bg-gray-800 rounded-full text-green-500"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            </button>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="relative">
            {/* Cover photo */}
            <div className="h-48 bg-gradient-to-r from-blue-800 to-purple-800 relative">
              {isEditing && (
                <label className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full cursor-pointer">
                  <Camera size={20} />
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              )}
            </div>
            
            {/* Profile picture */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
              <div className="w-32 h-32 rounded-full bg-gray-900 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 p-0.5 relative">
                  {profileImagePreview ? (
                    <Image 
                      src={profileImagePreview} 
                      alt="Profile picture" 
                      width={128} 
                      height={128}
                      className="rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-2 bg-black/50 rounded-full cursor-pointer">
                      <Camera size={16} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-20 px-6">
            <div className="text-center mb-8">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={tempData.name}
                  onChange={handleChange}
                  className="text-2xl font-bold bg-transparent border-b border-gray-700 text-center focus:outline-none focus:border-blue-500 pb-1"
                  placeholder="Your name"
                />
              ) : (
                <h2 className="text-2xl font-bold">{profileData.name || 'Your Name'}</h2>
              )}
              
              {isEditing ? (
                <select 
                  className="mt-2 bg-gray-800 rounded-md px-3 py-1 text-sm text-center" 
                  value={tempData.status}
                  onChange={(e) => setTempData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option>Available</option>
                  <option>Busy</option>
                  <option>Away</option>
                  <option>Do Not Disturb</option>
                </select>
              ) : (
                <p className="text-sm text-gray-400 mt-1">{profileData.status}</p>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">About</h3>
                {isEditing ? (<textarea
                    name="about"
                    value={tempData.about}
                    onChange={handleChange}
                    className="w-full bg-gray-700 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                    placeholder="Tell us about yourself"
                  ></textarea>
                ) : (
                  <p>{profileData.about || 'No information provided'}</p>
                )}
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        value={tempData.phone}
                        onChange={handleChange}
                        className="w-full bg-gray-700 rounded-md p-2 mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p>{profileData.phone || 'No phone number provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={tempData.email}
                        onChange={handleChange}
                        className="w-full bg-gray-700 rounded-md p-2 mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <p>{profileData.email || 'No email provided'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-gray-400 text-sm mb-2">Privacy</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Last Seen</p>
                      <p className="text-sm text-gray-400">Who can see when you were last online</p>
                    </div>
                    <select className="bg-gray-700 rounded-md px-2 py-1 text-sm">
                      <option>Everyone</option>
                      <option>Contacts Only</option>
                      <option>Nobody</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Profile Photo</p>
                      <p className="text-sm text-gray-400">Who can see your profile photo</p>
                    </div>
                    <select className="bg-gray-700 rounded-md px-2 py-1 text-sm">
                      <option>Everyone</option>
                      <option>Contacts Only</option>
                      <option>Nobody</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Status</p>
                      <p className="text-sm text-gray-400">Who can see your status updates</p>
                    </div>
                    <select className="bg-gray-700 rounded-md px-2 py-1 text-sm">
                      <option>Everyone</option>
                      <option>Contacts Only</option>
                      <option>Nobody</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Media and Links section */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm">Shared Media</h3>
                  <button className="text-blue-500 text-sm">See All</button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="aspect-square bg-gray-700 rounded-md overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Connected accounts */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-gray-400 text-sm mb-3">Connected Accounts</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                        </svg>
                      </div>
                      <span>Facebook</span>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 rounded-md text-sm">Connect</button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                        </svg>
                      </div>
                      <span>Twitter</span>
                    </div>
                    <button className="px-3 py-1 bg-gray-700 rounded-md text-sm">Connected</button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                        </svg>
                      </div>
                      <span>Instagram</span>
                    </div>
                    <button className="px-3 py-1 bg-gray-700 rounded-md text-sm">Connected</button>
                  </div>
                </div>
              </div>
              
              {/* Logout button at the bottom */}
              <div className="mb-10">
                <button className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg text-center font-medium">
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}