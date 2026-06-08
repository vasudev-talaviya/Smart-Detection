import { useState, useCallback, useRef, useMemo } from 'react';

/**
 * useCamera — A custom hook wrapper around react-webcam state and refs.
 * Provides functions to start/stop the camera and capture frame screenshots.
 *
 * @param {object} options - Webcam configuration options (video constraints)
 */
export function useCamera(options = { facingMode: "user", width: 640, height: 480 }) {
  const webcamRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  const stableConstraints = useMemo(
    () => options,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(options)]
  );

  const startCamera = useCallback(() => {
    setStreaming(true);
    setError("");
  }, []);

  const stopCamera = useCallback(() => {
    setStreaming(false);
  }, []);

  const captureFrame = useCallback(() => {
    if (webcamRef.current) {
      return webcamRef.current.getScreenshot();
    }
    return null;
  }, []);

  const onUserMediaError = useCallback((err) => {
    setError("Camera access denied. Please allow camera permissions.");
  }, []);

  return {
    webcamRef,
    streaming,
    error,
    startCamera,
    stopCamera,
    captureFrame,
    videoConstraints: stableConstraints,
    onUserMediaError
  };
}
