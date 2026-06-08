import { useState, useRef, useEffect } from "react";
import { ScanLine, Upload, Mic } from "lucide-react";
import { useCamera, useVoiceRecorder } from "../../hooks";
import { CameraPreview, CameraControls } from "../camera";
import { VoiceRecorder, Button } from "../common";

export default function BiometricCapture({
  mode = "face", // "face", "voice", "both", "stepwise"
  onCapture, // function({ image, voiceBlob })
  loading = false,
  autoScan = false,
  onAutoScanChange,
  toast, // function with .setError(), .clearToast()
}) {
  const camera = useCamera({ facingMode: "user", width: 640, height: 480 });
  const voiceRecorder = useVoiceRecorder({ minDuration: 3 });

  const [rawVoice, setRawVoice] = useState(null);
  const [capturedFrame, setCapturedFrame] = useState(null);
  const fileRef = useRef(null);

  // Auto scan logic
  useEffect(() => {
    let timeoutId;
    if (autoScan && camera.streaming && !loading && mode === "face") {
      timeoutId = setTimeout(() => {
        const frame = camera.captureFrame();
        if (frame) {
          setCapturedFrame(frame);
          onCapture({ image: frame, voiceBlob: null });
        }
      }, 1500);
    }
    return () => clearTimeout(timeoutId);
  }, [autoScan, camera.streaming, loading, mode, onCapture, camera]);

  const handleStartCamera = () => {
    camera.startCamera();
    setCapturedFrame(null);
    if (toast) toast.clearToast();
  };

  const handleUpload = (e, setFrame) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFrame(reader.result);
      setCapturedFrame(reader.result);
      if (mode === "face") {
        onCapture({ image: reader.result, voiceBlob: null });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  const handleStart2in1 = () => {
    if (toast) toast.clearToast();
    setRawVoice(null);
    setCapturedFrame(null);
    if (!camera.streaming) camera.startCamera();

    voiceRecorder.startRecording().then((blob) => {
      if (blob) {
        setRawVoice(blob);
        setTimeout(() => {
          const frame = camera.captureFrame();
          camera.stopCamera();
          if (frame) {
            setCapturedFrame(frame);
            onCapture({ image: frame, voiceBlob: blob });
          } else if (toast) {
            toast.setError("Failed to capture image from camera.");
          }
        }, 100);
      }
    });
  };

  const handleStop2in1 = () => {
    if (voiceRecorder.duration < 3) {
      if (toast)
        toast.setError(
          `Please record for at least 3 seconds. (${voiceRecorder.duration}s)`,
        );
    } else {
      voiceRecorder.stopRecording();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* --- VOICE ONLY --- */}
      {mode === "voice" && (
        <>
          <VoiceRecorder
            onAudioReady={setRawVoice}
            disabled={loading}
            minDuration={3}
          />
          <Button
            variant="primary"
            className="sm:w-fit"
            onClick={() => onCapture({ image: null, voiceBlob: rawVoice })}
            disabled={loading || !rawVoice}
          >
            Scan Voice
          </Button>
        </>
      )}

      {/* --- FACE ONLY --- */}
      {mode === "face" && (
        <>
          <div className="flex flex-wrap gap-3">
            <CameraControls
              streaming={camera.streaming}
              loading={loading}
              onStart={handleStartCamera}
              onStop={camera.stopCamera}
              onCapture={() => {
                const frame = camera.captureFrame();
                if (frame) {
                  setCapturedFrame(frame);
                  onCapture({ image: frame, voiceBlob: null });
                }
              }}
              autoScan={onAutoScanChange ? { enabled: autoScan, onChange: onAutoScanChange } : undefined}
              startLabel="Start Camera"
              captureLabel="Capture & Scan"
            />
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
            >
              <Upload className="w-4 h-4" /> Upload Image
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e, () => {})}
            />
          </div>
          {capturedFrame ? (
            <div className="relative inline-block mt-2">
              <img
                src={capturedFrame}
                className="rounded-lg max-h-48 border border-primary shadow-sm"
                alt="Captured Face"
              />
              <Button
                variant="error"
                size="sm"
                className="btn-circle absolute -top-2 -right-2 shadow-lg"
                onClick={() => setCapturedFrame(null)}
              >
                ✕
              </Button>
            </div>
          ) : (
            <CameraPreview
              webcamRef={camera.webcamRef}
              streaming={camera.streaming}
              videoConstraints={camera.videoConstraints}
              error={camera.error}
              onUserMediaError={camera.onUserMediaError}
              showAutoScanIndicator={loading && autoScan}
            />
          )}
        </>
      )}

      {/* --- 2-IN-1 SIMULTANEOUS --- */}
      {mode === "both" && (
        <>
          <div className="flex flex-wrap gap-3 items-center w-full bg-base-200/30 p-3 rounded-xl border border-base-content/5">
            {!voiceRecorder.recording ? (
              <Button
                variant="primary"
                size="sm"
                className="gap-2 shadow-lg shadow-primary/30"
                onClick={handleStart2in1}
                disabled={loading}
              >
                <Mic className="w-4 h-4" /> Start 2-in-1 Scan
              </Button>
            ) : (
              <Button
                variant="error"
                size="sm"
                className="gap-2 animate-pulse"
                onClick={handleStop2in1}
              >
                <Mic className="w-4 h-4" /> Stop & Scan (
                {voiceRecorder.duration}s)
              </Button>
            )}
            {camera.streaming && !voiceRecorder.recording && (
              <Button
                variant="ghost"
                size="sm"
                onClick={camera.stopCamera}
                disabled={loading}
              >
                Stop Camera
              </Button>
            )}
          </div>
          {capturedFrame ? (
            <div className="relative inline-block mt-2">
              <img
                src={capturedFrame}
                className="rounded-lg max-h-48 border border-primary shadow-sm"
                alt="Captured Face"
              />
              <Button
                variant="error"
                size="sm"
                className="btn-circle absolute -top-2 -right-2 shadow-lg"
                onClick={() => setCapturedFrame(null)}
              >
                ✕
              </Button>
            </div>
          ) : (
            <CameraPreview
              webcamRef={camera.webcamRef}
              streaming={camera.streaming}
              videoConstraints={camera.videoConstraints}
              error={camera.error}
              onUserMediaError={camera.onUserMediaError}
            />
          )}
        </>
      )}

      {/* --- 2-IN-1 STEP-WISE --- */}
      {mode === "stepwise" && (
        <div className="flex flex-col gap-6">
          <div className="glass-card p-4 border border-base-content/10 bg-base-100/50">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-primary" /> Step 1: Capture Face
            </h3>
            {capturedFrame ? (
              <div className="relative inline-block mt-2">
                <img
                  src={capturedFrame}
                  className="rounded-lg max-h-48 border border-primary shadow-sm"
                  alt="Captured Face"
                />
                <Button
                  variant="error"
                  size="sm"
                  className="btn-circle absolute -top-2 -right-2 shadow-lg"
                  onClick={() => setCapturedFrame(null)}
                >
                  ✕
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-3">
                  <CameraControls
                    streaming={camera.streaming}
                    loading={loading}
                    onStart={handleStartCamera}
                    onStop={camera.stopCamera}
                    onCapture={() => setCapturedFrame(camera.captureFrame())}
                    startLabel="Start Camera"
                    captureLabel="Capture Face"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileRef.current?.click()}
                    disabled={loading}
                  >
                    <Upload className="w-4 h-4" /> Upload Image
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e, setCapturedFrame)}
                  />
                </div>
                <CameraPreview
                  webcamRef={camera.webcamRef}
                  streaming={camera.streaming}
                  videoConstraints={camera.videoConstraints}
                  error={camera.error}
                  onUserMediaError={camera.onUserMediaError}
                />
              </div>
            )}
          </div>

          <div
            className={`glass-card p-4 border border-base-content/10 transition-opacity bg-base-100/50 ${!capturedFrame ? "opacity-40 pointer-events-none" : ""}`}
          >
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Mic className="w-4 h-4 text-secondary" /> Step 2: Record Voice
            </h3>
            <VoiceRecorder
              onAudioReady={setRawVoice}
              disabled={loading || !capturedFrame}
              minDuration={3}
            />
          </div>

          <div className="flex justify-end mt-2">
            <Button
              variant="primary"
              className="shadow-lg shadow-primary/30 gap-2 w-full sm:w-auto"
              disabled={!capturedFrame || !rawVoice || loading}
              onClick={() =>
                onCapture({ image: capturedFrame, voiceBlob: rawVoice })
              }
            >
              <ScanLine className="w-5 h-5" /> Run Verification
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
