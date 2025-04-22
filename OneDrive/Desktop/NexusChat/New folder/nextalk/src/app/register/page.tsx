'use client'
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Page entrance animation
    setPageLoaded(true);
  }, []);

  const signup = async () => {
    // Basic validation
    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Start exit animation
      setPageLoaded(false);
      
      // Delay navigation to allow animation to complete
      setTimeout(() => {
        router.push('/user-info');
      }, 500);
    } catch (err) {
      console.error(err);
      
      if (err.code === 'auth/email-already-in-use') {
        alert('This email is already registered');
      } else {
        alert('Failed to create account');
      }
      
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      signup();
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen bg-black text-blue-400 p-4 transition-opacity duration-500 ease-in-out ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="w-full max-w-md relative">
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg blur opacity-75 animate-pulse"></div>
        
        <div className="relative bg-gray-900 p-8 rounded-lg shadow-2xl border border-blue-400 backdrop-blur">
          <h1 className="text-3xl font-bold mb-8 text-center text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-400">
              NextTalk signup
            </span>
          </h1>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-300">User Identifier</label>
              <div className="relative">
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-300">NextTalk Id</label>
              <div className="relative">
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-300">Security Key</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type="password"
                  placeholder="Min 6 characters"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-300">Confirm Security Key</label>
              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  type="password"
                  placeholder="Re-enter your password"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>
            
            <button
              onClick={signup}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : "Establish Neural Link"}
            </button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-400">
                Already connected?{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Access your account
                </Link>
              </p>
            </div>
          </div>
          
          {/* Decorative futuristic elements */}
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-500"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 blur-xl opacity-20"></div>
        </div>
      </div>
    </div>
  );
}