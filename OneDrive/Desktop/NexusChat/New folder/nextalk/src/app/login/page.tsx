'use client'
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  GithubAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Page entrance animation
    setPageLoaded(true);
    
    // Setup recaptcha when showing phone auth
    if (showPhoneAuth) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'normal',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
    
    return () => {
      // Cleanup recaptcha
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, [showPhoneAuth]);

  const loginWithEmail = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Start exit animation
      setPageLoaded(false);
      
      // Delay navigation to allow animation to complete
      setTimeout(() => {
        router.push('/user-info');
      }, 500);
    } catch (err) {
      console.error(err);
      alert('Invalid email or password');
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Start exit animation
      setPageLoaded(false);
      
      // Delay navigation to allow animation to complete
      setTimeout(() => {
        router.push('/user-info');
      }, 500);
    } catch (err) {
      console.error(err);
      alert('Google sign-in failed');
      setIsLoading(false);
    }
  };

  const loginWithGithub = async () => {
    setIsLoading(true);
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      // Start exit animation
      setPageLoaded(false);
      
      // Delay navigation to allow animation to complete
      setTimeout(() => {
        router.push('/user-info');
      }, 500);
    } catch (err) {
      console.error(err);
      alert('GitHub sign-in failed');
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      alert('Please enter your phone number');
      return;
    }
    
    setIsLoading(true);
    try {
      const formatPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formatPhoneNumber, window.recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
      alert('Verification code sent!');
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      alert('Failed to send verification code');
      setIsLoading(false);
    }
  };

  const verifyPhoneNumber = async () => {
    if (!verificationCode) {
      alert('Please enter verification code');
      return;
    }
    
    setIsLoading(true);
    try {
      // Sign in with the verification code
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId, 
        verificationCode
      );
      await auth.signInWithCredential(credential);
      
      // Start exit animation
      setPageLoaded(false);
      
      // Delay navigation to allow animation to complete
      setTimeout(() => {
        router.push('/user-info');
      }, 500);
    } catch (err) {
      console.error(err);
      alert('Invalid verification code');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      loginWithEmail();
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen bg-black text-blue-400 p-4 transition-opacity duration-500 ease-in-out ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="w-full max-w-md relative">
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75 animate-pulse"></div>
        
        <div className="relative bg-gray-900 p-8 rounded-lg shadow-2xl border border-blue-400 backdrop-blur">
          <h1 className="text-3xl font-bold mb-8 text-center text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              NextTalk
            </span>
          </h1>
          
          {!showPhoneAuth ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-300">Neural ID</label>
                <div className="relative">
                  <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="your@email.com"
                    className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-300">Access Key</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              
              <button
                onClick={loginWithEmail}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : "Initialize Connection"}
              </button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={loginWithGoogle}
                  disabled={isLoading}
                  className="flex items-center justify-center py-3 px-4 border border-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                  </svg>
                  Google
                </button>
                <button
                  onClick={loginWithGithub}
                  disabled={isLoading}
                  className="flex items-center justify-center py-3 px-4 border border-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  GitHub
                </button>
              </div>
              
              <button
                onClick={() => setShowPhoneAuth(true)}
                className="w-full text-center text-blue-400 hover:text-blue-300 py-2"
              >
                Login with phone number
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => setShowPhoneAuth(false)}
                className="text-blue-400 hover:text-blue-300 flex items-center mb-4"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to email login
              </button>
              
              {!verificationId ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-300">Phone Number</label>
                    <div className="relative">
                      <input
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="+1234567890"
                        className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div id="recaptcha-container" className="flex justify-center"></div>
                  
                  <button
                    onClick={sendVerificationCode}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : "Send Verification Code"}
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-blue-300">Verification Code</label>
                    <div className="relative">
                      <input
                        value={verificationCode}
                        onChange={e => setVerificationCode(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={verifyPhoneNumber}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : "Verify & Login"}
                  </button>
                </>
              )}
            </div>
          )}
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              No access yet?{" "}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                Signup for NextTalk
              </Link>
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-xl opacity-20"></div>
        </div>
      </div>
    </div>
  );
}