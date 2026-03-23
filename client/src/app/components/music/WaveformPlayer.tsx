'use client';

import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { musicApi } from '@/lib/api';

interface WaveformPlayerProps {
  songId: string;
  title?: string;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function WaveformPlayer({ songId, title }: WaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const isCleaningUpRef = useRef(false);
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState<string | null>(null);
  const [isLoadingSource, setIsLoadingSource] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerMessage, setPlayerMessage] = useState<string | null>(null);

  const detachAudioElement = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    try {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    } catch {
      // Ignore cleanup issues while tearing down the player.
    }
  }, []);

  const revokeObjectUrl = useCallback(() => {
    const currentUrl = objectUrlRef.current;

    if (!currentUrl) {
      return;
    }

    objectUrlRef.current = null;
    window.setTimeout(() => {
      URL.revokeObjectURL(currentUrl);
    }, 0);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    isCleaningUpRef.current = false;

    detachAudioElement();
    revokeObjectUrl();
    setResolvedAudioUrl(null);
    setIsLoadingSource(true);
    setCurrentTime(0);
    setDuration(0);
    setPlayerMessage(null);

    const loadAudio = async () => {
      try {
        const audioBlob = await musicApi.getSongAudio(songId);

        if (isCancelled) {
          return;
        }

        const nextObjectUrl = URL.createObjectURL(audioBlob);
        objectUrlRef.current = nextObjectUrl;
        setResolvedAudioUrl(nextObjectUrl);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setPlayerMessage(
          error instanceof Error
            ? error.message
            : 'We could not load this song right now. Please try again.',
        );
      } finally {
        if (!isCancelled) {
          setIsLoadingSource(false);
        }
      }
    };

    void loadAudio();

    return () => {
      isCancelled = true;
      isCleaningUpRef.current = true;
      detachAudioElement();
      revokeObjectUrl();
    };
  }, [detachAudioElement, revokeObjectUrl, songId]);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setDuration(audio.duration || 0);
    setPlayerMessage(null);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setCurrentTime(audio.currentTime);
  };

  const handleError = (event: SyntheticEvent<HTMLAudioElement, Event>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isCleaningUpRef.current) {
      return;
    }

    setPlayerMessage('This audio source is unavailable or unsupported in your browser.');
  };

  return (
    <div className="rounded-xl bg-gray-50 p-5">
      {title && <p className="mb-3 text-sm font-semibold text-gray-700">{title}</p>}

      <div className="min-w-0">
        <audio
          ref={audioRef}
          src={resolvedAudioUrl || undefined}
          controls
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onErrorCapture={handleError}
          onError={handleError}
          className="w-full"
        />

        {isLoadingSource && <p className="mt-2 text-xs text-gray-400">Loading song...</p>}
        {!isLoadingSource && playerMessage && (
          <p className="mt-2 text-xs text-gray-400">{playerMessage}</p>
        )}
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
