import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Microscope, ShieldCheck, Clock } from "lucide-react";

interface LoadingPageProps {
  onComplete: () => void;
  key?: string | number;
}

export default function LoadingPage({ onComplete }: LoadingPageProps) {
  // Simulate loading
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col justify-center items-center overflow-hidden p-4"
    >
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary-container/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-xl flex flex-col items-center">
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)]">
            <Microscope className="text-on-primary-container w-8 h-8 fill-current" />
          </div>
          <span className="text-2xl font-bold text-primary tracking-tight">Stratos Office</span>
        </div>

        {/* Glass Loading Card */}
        <div className="glass-panel w-full rounded-2xl p-10 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-on-surface mb-8 text-center">Preparing Stratos Office</h1>
          
          {/* Progress Section */}
          <div className="w-full mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-primary-fixed-dim uppercase tracking-widest">System Initialization</span>
              <span className="text-2xl font-semibold text-primary-fixed-dim">{progress}%</span>
            </div>
            {/* Main Progress Bar */}
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-primary-container shadow-[0_0_15px_rgba(0,212,255,0.5)] rounded-full"
                style={{ width: `${progress}%` }}
              ></motion.div>
              <div className="absolute top-0 left-0 h-full w-full shimmer opacity-50"></div>
            </div>
          </div>

          {/* Status Info */}
          <div className="text-center space-y-2">
            <p className="text-on-surface-variant">Downloading model files... This happens once and is cached.</p>
            <div className="flex items-center justify-center gap-2 text-outline">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Estimated time remaining: 1m 24s</span>
            </div>
          </div>

          {/* AI Spinner Indicator */}
          <div className="mt-10 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-secondary-container/60 animate-pulse delay-75"></div>
            <div className="w-2 h-2 rounded-full bg-secondary-container/30 animate-pulse delay-150"></div>
            <span className="text-[10px] font-bold text-secondary ml-2 uppercase tracking-tighter">Connecting to Gemma 4 Cluster</span>
          </div>
        </div>

        {/* System Branding / Security Note */}
        <div className="mt-12 flex flex-col items-center opacity-60">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-outline" />
            <span className="text-[10px] text-outline font-medium tracking-wide">End-to-End Encrypted Environment</span>
          </div>
          <p className="text-[10px] text-outline">© 2024 Stratos Office. Private & Secure AI.</p>
        </div>
      </div>

      {/* Aesthetic Ornaments */}
      <div className="absolute top-10 right-10 opacity-20 hidden md:block">
        <div className="w-32 h-32 border-t-2 border-r-2 border-primary-container rounded-tr-3xl"></div>
      </div>
      <div className="absolute bottom-10 left-10 opacity-20 hidden md:block">
        <div className="w-32 h-32 border-b-2 border-l-2 border-primary-container rounded-bl-3xl"></div>
      </div>
    </motion.main>
  );
}
