/**
 * ToastContainer — Reusable floating toast alert display.
 * Renders error and success toasts with click-to-dismiss.
 *
 * @param {string} error - Error message (red alert)
 * @param {string} msg - Success message (green alert)
 * @param {function} onClearError - Callback to clear error
 * @param {function} onClearMsg - Callback to clear success message
 */
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ToastContainer({ error, msg, onClearError, onClearMsg }) {
  if (!error && !msg) return null;

  return (
    <div className="toast toast-top toast-end z-50">
      {error && (
        <div
          role="alert"
          className="alert alert-error shadow-lg fade-in cursor-pointer"
          onClick={onClearError}
        >
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      {msg && (
        <div
          role="alert"
          className="alert alert-success shadow-lg fade-in cursor-pointer text-success-content"
          onClick={onClearMsg}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{msg}</span>
        </div>
      )}
    </div>
  );
}
