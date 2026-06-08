import { useState, useRef, useCallback } from "react";
import { useToast } from "./useToast";

export default function useVoiceRecorder({ minDuration = 3 } = {}) {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const resolvePromiseRef = useRef(null);

  const toast = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      const promise = new Promise((resolve) => {
        resolvePromiseRef.current = resolve;
      });

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // The duration check is done using a snapshot of duration at stop time, but state might be stale
        // Let's rely on the caller to handle minDuration checks if they want, or we can check it.
        // Actually, let's just resolve the blob and let the caller decide.
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        if (resolvePromiseRef.current) resolvePromiseRef.current(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      setAudioUrl(null);
      setAudioBlob(null);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      return promise;
    } catch (err) {
      toast.setError("Microphone access denied or not available.");
      return null;
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    clearInterval(timerRef.current);
  }, []);

  return {
    startRecording,
    stopRecording,
    recording,
    duration,
    audioUrl,
    setAudioUrl,
    audioBlob,
    setAudioBlob,
  };
}
