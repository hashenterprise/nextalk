import Image from 'next/image';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center">
        <Image src="/logo.svg" alt="NextTalk Logo" width={32} height={32} />
        <span className="ml-2 text-xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
          NextTalk
        </span>
      </Link>
      
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h1>
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                headerTitle: "text-white",
                headerSubtitle: "text-white/70",
                formButtonPrimary: "bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-90",
                formFieldInput: "bg-white/20 border-white/30 text-white placeholder:text-white/50",
                formFieldLabel: "text-white",
                footerActionLink: "text-cyan-300 hover:text-cyan-200",
                formFieldAction: "text-cyan-300 hover:text-cyan-200",
              }
            }}
            redirectUrl="/chat" // Ensure this route exists in your app
          />
        </div>
      </div>
    </div>
  );
}