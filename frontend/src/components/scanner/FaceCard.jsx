/**
 * FaceCard — Single detected face card with thumbnail, confidence, and correction dropdown.
 *
 * @param {object} face - Face data { name, is_new_face, thumbnail, confidence, already_marked, user_id, box }
 * @param {number} index - Face index in the list
 * @param {object} correction - Current correction state for this face
 * @param {function} onCorrection - Callback (index, field, value)
 * @param {Array} registeredUsers - List of registered users for correction dropdown
 */
import { CheckCircle2, AlertTriangle } from "lucide-react";
import ConfidenceBar from "../common/ConfidenceBar";

export default function FaceCard({ face, index, correction, onCorrection, registeredUsers }) {
  return (
    <div className="card bg-base-200/50 backdrop-blur-lg border border-base-content/5 shadow-lg hover-lift glow-border">
      {face.thumbnail && (
        <figure className="px-4 pt-4">
          <img
            src={face.thumbnail}
            alt={face.name || "Unknown"}
            className="rounded-xl h-28 w-28 object-cover ring-2 ring-primary/30"
          />
        </figure>
      )}
      <div className="card-body p-4 gap-2">
        <h4 className="card-title text-sm">
          {face.is_new_face ? (
            <span className="badge badge-warning badge-sm gap-1">
              <AlertTriangle className="w-3 h-3" /> Unknown
            </span>
          ) : (
            <span className="badge badge-success badge-sm gap-1">
              <CheckCircle2 className="w-3 h-3" /> {face.name}
            </span>
          )}
        </h4>

        <ConfidenceBar value={(face.confidence || 0) * 100} width="w-full" />

        {face.already_marked && (
          <p className="text-xs text-info font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Already marked today
          </p>
        )}

        {/* Correction dropdown */}
        <select
          className="select select-bordered select-xs w-full mt-1"
          value={correction?.user_id ?? face.user_id ?? ""}
          onChange={(e) => onCorrection(index, "user_id", e.target.value)}
        >
          <option value="">— Correct identity —</option>
          {registeredUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
