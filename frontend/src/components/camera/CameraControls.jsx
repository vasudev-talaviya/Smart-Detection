/**
 * CameraControls — Start/Stop/Capture camera buttons.
 * Shared by Scanner and UsersList pages.
 *
 * @param {boolean} streaming - Whether camera is currently active
 * @param {boolean} loading - Whether a scan/process is in progress
 * @param {function} onStart - Start camera callback
 * @param {function} onStop - Stop camera callback
 * @param {function} onCapture - Capture frame callback
 * @param {object} [autoScan] - Optional auto-scan config { enabled, onChange }
 * @param {string} [startLabel="Start Camera"] - Label for start button
 * @param {string} [captureLabel="Capture & Scan"] - Label for capture button
 */
import { Camera, StopCircle, Focus, Video } from "lucide-react";
import { Button } from "../common";

export default function CameraControls({
  streaming,
  loading,
  onStart,
  onStop,
  onCapture,
  autoScan,
  startLabel = "Start Camera",
  captureLabel = "Capture & Scan",
}) {
  if (!streaming) {
    return (
      <Button variant="accent" size="sm" className="gap-2" onClick={onStart} disabled={loading}>
        <Video className="w-4 h-4" /> {startLabel}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        className="gap-2"
        onClick={onCapture}
        disabled={loading}
      >
        <Camera className="w-4 h-4" /> {captureLabel}
      </Button>
      <Button variant="ghost" size="sm" className="gap-2" onClick={onStop}>
        <StopCircle className="w-4 h-4 text-error" /> Stop
      </Button>
      {autoScan && (
        <label className="label cursor-pointer gap-2 ml-2 bg-base-200 px-3 py-1 rounded-lg hover:bg-base-300 transition-colors">
          <span className="label-text font-medium text-xs">Auto Scan</span>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            checked={autoScan.enabled}
            onChange={(e) => autoScan.onChange(e.target.checked)}
          />
        </label>
      )}
    </div>
  );
}
