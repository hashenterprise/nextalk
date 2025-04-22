'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, UserPlus } from 'lucide-react';

export default function AddContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactMethod] = useState<'phone' | 'email' | 'qr'>('phone');
  const [contactInfo, setContactInfo] = useState('');
  const [contactName, setContactName] = useState('');
  const [error, setError] = useState('');
  const [contactAdded, setContactAdded] = useState(false);

  const validateContact = () => {
    setError('');
    if (!contactName.trim()) {
      setError('Please enter a contact name');
      return false;
    }
    if (!contactInfo.trim()) {
      setError('Please enter contact information');
      return false;
    }
    if (contactMethod === 'phone' && !/^\+?\d{10,15}$/.test(contactInfo.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (contactMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleAddContact = async () => {
    if (!validateContact()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // Simulate API call to add contact
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Contact added:', { name: contactName, [contactMethod]: contactInfo });
      setContactAdded(true);
      setTimeout(() => {
        router.push('/chat');
      }, 2000);
    } catch (error) {
      console.error('Error adding contact:', error);
      setError('Failed to add contact. Please try again.');
    } finally {
      setIsSubmitting(false);
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
            <ArrowLeft size={20} />
          </button>
          <h1 className="ml-4 text-xl font-bold">Add Contact</h1>
        </div>
      </div>

      <AnimatePresence>
        {contactAdded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-50"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20"
            >
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check size={40} />
              </motion.div>
              <h3 className="text-2xl font-medium mb-2">Contact Added!</h3>
              <p className="text-gray-300 mb-3">
                <span className="font-medium text-white">{contactName}</span> has been added to your contacts
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-lg mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-medium mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Add to Your Network</h2>
            <p className="text-gray-400">Add a new contact to your NextTalk network</p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact Name"
              className="w-full bg-gray-800 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">
              {contactMethod === 'phone' ? 'Phone Number' : 'Email Address'}
            </label>
            <input
              type={contactMethod === 'phone' ? 'tel' : 'email'}
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder={contactMethod === 'phone' ? '+1 234 567 8901' : 'contact@example.com'}
              className="w-full bg-gray-800 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleAddContact}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 font-medium flex items-center justify-center ${isSubmitting ? 'opacity-70' : 'hover:opacity-90'}`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Adding Contact...
              </>
            ) : (
              <>
                <UserPlus size={20} className="mr-2" />
                Add Contact
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}