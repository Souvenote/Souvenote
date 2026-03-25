'use client';

import { useEffect, useState } from 'react';
import InviteFriendPlaceholder from './InviteFriendPlaceholder';

export default function GeneratingOverlay() {
  const [dots, setDots] = useState('');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const timeInterval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(dotInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
        {/* Animated music visualization */}
        <div className="flex items-end justify-center gap-1 h-16 mb-6">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-[#111111] rounded-full animate-pulse"
              style={{
                height: `${20 + Math.random() * 80}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.8 + Math.random() * 0.6}s`,
              }}
            />
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-2">
          Creating your song{dots}
        </h2>
        <p className="text-gray-500 mb-2">
          Our AI is composing a unique song just for you.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          This usually takes 30-120 seconds. Elapsed: {formatTime(elapsed)}
        </p>

        {/* Invite friend placeholder (Rayan's task) */}
        <InviteFriendPlaceholder />
      </div>
    </div>
  );
}
