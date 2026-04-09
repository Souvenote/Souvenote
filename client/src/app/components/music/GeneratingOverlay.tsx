'use client';

import { useEffect, useState } from 'react';
import InviteFriendPlaceholder from './InviteFriendPlaceholder';

const BAR_STYLES = [
  { height: '24%', animationDelay: '0s', animationDuration: '0.95s' },
  { height: '48%', animationDelay: '0.1s', animationDuration: '1.1s' },
  { height: '36%', animationDelay: '0.2s', animationDuration: '0.9s' },
  { height: '68%', animationDelay: '0.3s', animationDuration: '1.2s' },
  { height: '22%', animationDelay: '0.4s', animationDuration: '0.85s' },
  { height: '57%', animationDelay: '0.5s', animationDuration: '1.05s' },
  { height: '31%', animationDelay: '0.6s', animationDuration: '0.92s' },
  { height: '74%', animationDelay: '0.7s', animationDuration: '1.18s' },
  { height: '44%', animationDelay: '0.8s', animationDuration: '0.98s' },
  { height: '28%', animationDelay: '0.9s', animationDuration: '0.88s' },
  { height: '62%', animationDelay: '1s', animationDuration: '1.08s' },
  { height: '39%', animationDelay: '1.1s', animationDuration: '0.94s' },
] as const;

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
          {BAR_STYLES.map((barStyle, i) => (
            <div
              key={i}
              className="w-1.5 bg-[#111111] rounded-full animate-pulse"
              style={barStyle}
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
