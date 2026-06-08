/**
 * StatusBadge — Reusable badge for attendance record status.
 * Shows "AI Match" (success) or "Corrected" (warning).
 *
 * @param {boolean} wasCorrected - Whether the record was manually corrected
 */
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function StatusBadge({ wasCorrected }) {
  if (wasCorrected) {
    return (
      <span className="badge badge-warning badge-xs gap-1 shadow-sm">
        <AlertTriangle className="w-3 h-3" /> Corrected
      </span>
    );
  }

  return (
    <span className="badge badge-success badge-xs gap-1 shadow-sm">
      <CheckCircle2 className="w-3 h-3" /> AI Match
    </span>
  );
}
