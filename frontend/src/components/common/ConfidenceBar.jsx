/**
 * ConfidenceBar — Reusable confidence progress bar with percentage label.
 * Dynamically colors green (>70%), yellow (>40%), or red based on value.
 * 
 * @param {number} value - Confidence percentage (0–100)
 * @param {string} [width="w-16"] - Tailwind width class for the progress bar
 */
export default function ConfidenceBar({ value = 0, width = "w-16" }) {
  const colorClass =
    value > 70
      ? "progress-success"
      : value > 40
      ? "progress-warning"
      : "progress-error";

  return (
    <div className="flex items-center gap-2">
      <progress
        className={`progress ${width} ${colorClass}`}
        value={value}
        max="100"
      />
      <span className="text-xs font-mono whitespace-nowrap">
        {value.toFixed(1)}%
      </span>
    </div>
  );
}
