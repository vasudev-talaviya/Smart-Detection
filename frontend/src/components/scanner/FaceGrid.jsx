/**
 * FaceGrid — Grid of detected FaceCards with Submit/Reset actions.
 *
 * @param {Array} faces - Array of face detection objects
 * @param {object} corrections - Corrections state object { [index]: { user_id } }
 * @param {function} onCorrection - Correction callback (index, field, value)
 * @param {Array} registeredUsers - Registered users for dropdown
 * @param {boolean} submitting - Whether submission is in progress
 * @param {function} onSubmit - Submit attendance callback
 * @param {function} onReset - Reset results callback
 */
import { User, Send, RefreshCw, Loader2 } from "lucide-react";
import FaceCard from "./FaceCard";

export default function FaceGrid({
  faces,
  corrections,
  onCorrection,
  registeredUsers,
  submitting,
  onSubmit,
  onReset,
}) {
  if (!faces.length) return null;

  return (
    <div className="glass-card p-6 fade-in">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-secondary" />
        Detected Faces
        <span className="badge badge-primary badge-sm">{faces.length}</span>
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {faces.map((face, i) => (
          <FaceCard
            key={i}
            face={face}
            index={i}
            correction={corrections[i]}
            onCorrection={onCorrection}
            registeredUsers={registeredUsers}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button className="btn btn-ghost btn-sm gap-2" onClick={onReset}>
          <RefreshCw className="w-4 h-4" /> Reset
        </button>
      </div>
    </div>
  );
}
