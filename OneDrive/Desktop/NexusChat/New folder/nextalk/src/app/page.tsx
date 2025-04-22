'use client'
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 text-white">
      <div className="container mx-auto px-4 py-16 h-full flex flex-col">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center">
            <Image src="/logo.svg" alt="NextTalk Logo" width={40} height={40} />
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              NextTalk
            </span>
          </div>
          <div className="space-x-4">
            <Link href="/login" className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
              Login
            </Link>
            <Link href="/register" className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition-all">
              Sign Up
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Connect with friends in a <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">whole new way</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              NextTalk brings your conversations to life with real-time messaging, voice calls, status updates, and more—all in one beautiful app.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/register" 
                className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Get Started
              </Link>
              <Link 
                href="#features" 
                className="px-8 py-3 rounded-full border border-white/30 hover:bg-white/10 transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative h-[600px] w-[300px] mx-auto">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-3xl backdrop-blur-md border border-white/20"></div>
              <div className="absolute top-4 left-4 right-4 bottom-4 bg-black/60 rounded-2xl overflow-hidden">
                <div className="p-4 bg-gradient-to-b from-indigo-700/80 to-indigo-900/80">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500"></div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold">Sarah Johnson</div>
                      <div className="text-xs text-gray-300">Online</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 h-[450px] overflow-y-auto">
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-700/80 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Hey! How <i></i>s your day going?</p>
                      <p className="text-xs text-gray-400 text-right">10:12 AM</p>
                    </div>
                  </div>
                  <div className="flex justify-end mb-4">
                    <div className="bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Pretty good! Just checking out this new chat app called NextTalk&#39;.</p>
                      <p className="text-xs text-gray-200 text-right">10:15 AM</p>
                    </div>
                  </div>
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-700/80 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Oh nice! I heard it has all the features from WhatsApp plus more&#39;!</p>
                      <p className="text-xs text-gray-400 text-right">10:16 AM</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                      <p className="text-sm">Yeah! The UI is gorgeous and it has all these cool social features.</p>
                      <p className="text-xs text-gray-200 text-right">10:17 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        <section id="features" className="py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Features you will love
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Real-time Messaging",
                description: "Send and receive messages instantly with read receipts and typing indicators."
              },
              {
                title: "Voice & Video Calls",
                description: "Crystal clear voice and video calls with individuals or groups."
              },
              {
                title: "Status Updates",
                description: "Share moments with friends that disappear after 24 hours."
              },
              {
                title: "Enhanced Privacy",
                description: "Lock and hide chats, end-to-end encryption, and customizable privacy settings."
              },
              {
                title: "Social Feed",
                description: "Stay updated with a personalized feed of posts from your contacts."
              },
              {
                title: "Cross-Platform",
                description: "Seamlessly use NextTalk across all your devices."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                  <span className="text-xl">✨</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="mt-12 py-8 border-t border-white/10 text-center text-gray-400">
          <p>© 2025 NextTalk. All rights reserved.</p>
          <p>Do not  forget to check your messages.</p>
        </footer>
      </div>
    </div>
  );
}