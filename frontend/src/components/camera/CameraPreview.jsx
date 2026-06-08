/**
 * CameraPreview — Video feed powered by react-webcam with scanner overlay.
 * Shared by Scanner and UsersList pages.
 *
 * @param {React.RefObject} webcamRef - Ref for the Webcam element
 * @param {boolean} streaming - Whether camera is currently active
 * @param {object} videoConstraints - Constraints for webcam resolution/facingMode
 * @param {string} error - Camera permission error message if any
 * @param {function} onUserMediaError - Callback for camera access errors
 * @param {boolean} [showAutoScanIndicator=false] - Show "Live Scan..." overlay
 */
import Webcam from "react-webcam";
import { Loader2, CameraOff } from "lucide-react";

export default function CameraPreview({
  webcamRef,
  streaming,
  videoConstraints,
  error,
  onUserMediaError,
  showAutoScanIndicator = false,
}) {
  if (!streaming) return null;

  return (
    <div className="relative rounded-xl overflow-hidden bg-base-300 laser-scanner glow-border min-h-[300px] flex items-center justify-center">
      {error ? (
        <div className="text-center p-8 text-error flex flex-col items-center gap-3">
          <CameraOff className="w-12 h-12 text-error/60 animate-bounce" />
          <p className="font-semibold text-sm max-w-xs">{error}</p>
        </div>
      ) : (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.85}
          videoConstraints={videoConstraints}
          onUserMediaError={onUserMediaError}
          className="w-full max-h-[400px] object-contain"
        />
      )}
      
      {!error && (
        <div className="absolute inset-0 pointer-events-none border-2 border-primary/30 rounded-xl">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
        </div>
      )}

      {showAutoScanIndicator && !error && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-base-100/90 p-2 px-3 rounded-xl backdrop-blur-md shadow-2xl fade-in border border-primary/20">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs font-bold text-primary animate-pulse tracking-widest uppercase">
            Live Scan...
          </span>
        </div>
      )}
    </div>
  );
}
