import { useEffect, useRef } from 'react';
import { useQueue } from '../context/QueueContext';
import { usePrevious } from './usePrevious'; // Will create if needed

// Custom hook for audio alerts (new current token or emergency)
export function useAudioAlert(audioEnabled = true) {
  const audioContextRef = useRef(null);
  const previousCurrent = usePrevious();

  const playBeep = () => {
    if (!audioEnabled) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.value = 800; // Beep pitch
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.2);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.2);
    } catch (error) {
      console.warn('Audio play failed:', error);
    }
  };

  // Play on new current token change
  useEffect(() => {
    const currentToken = useQueue().currentToken;
    if (currentToken && currentToken !== previousCurrent) {
      playBeep();
      if (currentToken.priority === 'emergency') {
        // Double beep for emergency
        setTimeout(playBeep, 300);
      }
    }
  }, [useQueue().currentToken]);

  return { playBeep };
}

