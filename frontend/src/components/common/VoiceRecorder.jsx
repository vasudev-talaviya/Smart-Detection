import React, { useRef } from "react";
import { Mic, Square, Upload } from "lucide-react";
import { useToast, useVoiceRecorder } from "../../hooks";
import { Button } from "./index";

export default function VoiceRecorder({
  onAudioReady,
  disabled = false,
  minDuration = 45,
  isOptional = false,
}) {
  const {
    startRecording,
    stopRecording,
    recording,
    duration,
    audioUrl,
    setAudioUrl,
  } = useVoiceRecorder();
  const fileRef = useRef(null);
  const toast = useToast();

  const handleStart = () => {
    startRecording().then((blob) => {
      if (blob) {
        // Here we can check duration if we stored it or passed it
        // Actually, the hook resolves with blob. We should check duration inside the component or pass it.
        // The duration state in the component might not be completely synced at the exact ms of resolution.
      }
    });
    // Wait, since we are doing custom duration checks in VoiceRecorder, we can do it when audioUrl changes.
  };

  // Since useVoiceRecorder doesn't enforce minDuration the exact same way, let's just rewrite the VoiceRecorder slightly.
  // Actually, wait, useVoiceRecorder returns a promise that resolves with the blob.
  const handleStartRecording = () => {
    startRecording().then((blob) => {
      if (blob) {
        // For simplicity, we just pass the blob. minDuration validation can be done before calling stopRecording.
        onAudioReady(blob);
      }
    });
  };

  const handleStopRecording = () => {
    if (duration < minDuration) {
      toast.setError(
        `Voice must be at least ${minDuration} seconds. You recorded ${duration}s.`,
      );
    } else {
      stopRecording();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check duration before accepting
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration < minDuration) {
        toast.setError(
          `Audio is too short (${Math.round(audio.duration)}s). Minimum ${minDuration} seconds required.`,
        );
      } else {
        setAudioUrl(objectUrl);
        onAudioReady(file);
      }
    });
    audio.src = objectUrl;
  };

  return (
    <div className="glass-card p-4 my-4 flex flex-col gap-3">
      <h3 className="font-semibold text-sm flex items-center justify-between">
        <span>Voice Authentication (Min {minDuration}s)</span>
        {isOptional && (
          <span className="text-xs opacity-50 font-normal italic">
            (Optional Update)
          </span>
        )}
      </h3>
      <div className="flex items-center gap-3">
        {!recording ? (
          <Button
            variant="primary"
            size="sm"
            className="gap-2"
            onClick={handleStartRecording}
            disabled={disabled}
          >
            <Mic className="w-4 h-4" /> Start Recording
          </Button>
        ) : (
          <Button
            variant="error"
            size="sm"
            className="gap-2 animate-pulse"
            onClick={handleStopRecording}
          >
            <Square className="w-4 h-4" /> Stop ({duration}s)
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => fileRef.current?.click()}
          disabled={disabled || recording}
        >
          <Upload className="w-4 h-4" /> Upload Audio
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {recording && duration < minDuration && (
        <p className="text-xs text-warning">
          Please record for at least {minDuration - duration} more seconds...
        </p>
      )}

      {audioUrl && (
        <audio src={audioUrl} controls className="h-8 mt-2 w-full" />
      )}
    </div>
  );
}
