'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformPlayerProps {
  audioUrl: string;
  title?: string;
}

export default function WaveformPlayer({ audioUrl, title }: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [useNativePlayer, setUseNativePlayer] = useState(false);
  const [playerMessage, setPlayerMessage] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const initWaveSurfer = useCallback(() => {
    if (!containerRef.current || wavesurferRef.current || useNativePlayer) return;

    let isCleaningUp = false;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#d1d5db',
      progressColor: '#111111',
      cursorColor: '#111111',
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 60,
      normalize: true,
    });

    const enableNativeFallback = (message: string) => {
      if (isCleaningUp) {
        return;
      }

      setUseNativePlayer(true);
      setIsReady(true);
      setPlayerMessage(message);

      try {
        ws.destroy();
      } catch {
        // Ignore teardown issues while switching player modes.
      } finally {
        if (wavesurferRef.current === ws) {
          wavesurferRef.current = null;
        }
      }
    };

    ws.on('ready', () => {
      setDuration(ws.getDuration());
      setIsReady(true);
      setPlayerMessage(null);
    });

    ws.on('timeupdate', (time) => setCurrentTime(time));

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));
    ws.on('error', (error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('AbortError') || isCleaningUp) {
        return;
      }

      enableNativeFallback('Waveform preview is unavailable for this audio. Using the standard player instead.');
    });

    wavesurferRef.current = ws;

    ws.load(audioUrl).catch((error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('AbortError') || isCleaningUp) {
        return;
      }

      enableNativeFallback('Waveform preview is unavailable for this audio. Using the standard player instead.');
    });

    return () => {
      isCleaningUp = true;
    };
  }, [audioUrl, useNativePlayer]);

  useEffect(() => {
    const cleanup = initWaveSurfer();

    return () => {
      cleanup?.();

      try {
        wavesurferRef.current?.destroy();
      } catch {
        // WaveSurfer may abort an in-flight fetch while unmounting.
      }

      wavesurferRef.current = null;
    };
  }, [initWaveSurfer]);

  const togglePlay = () => {
    if (useNativePlayer) {
      const audio = audioRef.current;
      if (!audio) return;

      if (audio.paused) {
        void audio.play();
      } else {
        audio.pause();
      }

      return;
    }

    wavesurferRef.current?.playPause();
  };

  const handleNativeTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime);
  };

  const handleNativeMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setDuration(audio.duration || 0);
    setIsReady(true);
  };

  const handleNativePlay = () => setIsPlaying(true);
  const handleNativePause = () => setIsPlaying(false);

  return (
    <div className="bg-gray-50 rounded-xl p-5">
      {title && (
        <p className="text-sm font-semibold text-gray-700 mb-3">{title}</p>
      )}

      <div className="flex items-center gap-4">
        {/* Play/Pause button */}
        <button
          onClick={togglePlay}
          disabled={!isReady}
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
            isReady
              ? 'bg-[#111111] text-white hover:bg-[#333]'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Waveform */}
        <div className="flex-1 min-w-0">
          {useNativePlayer ? (
            <div className="space-y-3">
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                preload="metadata"
                onLoadedMetadata={handleNativeMetadata}
                onTimeUpdate={handleNativeTimeUpdate}
                onPlay={handleNativePlay}
                onPause={handleNativePause}
                className="w-full"
              />
              {playerMessage && (
                <p className="text-xs text-gray-400">{playerMessage}</p>
              )}
            </div>
          ) : (
            <div ref={containerRef} className="w-full" />
          )}
        </div>
      </div>

      {/* Time display */}
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
