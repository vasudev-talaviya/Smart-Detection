/**
 * HealthStatus — API & Database health indicator bar.
 * Extracted from App.jsx for cleaner composition.
 *
 * @param {object|null} health - Health state { api, db, dbStatus }
 */
import { Database, Wifi, WifiOff } from "lucide-react";

export default function HealthStatus({ health }) {
  if (!health) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 mb-5 text-xs">
      {/* API status */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
          health.api
            ? "border-success/30 bg-success/10 text-success"
            : "border-error/30 bg-error/10 text-error"
        }`}
      >
        {health.api ? (
          <Wifi className="w-3.5 h-3.5" />
        ) : (
          <WifiOff className="w-3.5 h-3.5" />
        )}
        <span className="font-medium">
          API: {health.api ? "Connected" : "Disconnected"}
        </span>
        {health.api && <span className="pulse-dot" />}
      </div>

      {/* Database status */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
          health.db
            ? "border-success/30 bg-success/10 text-success"
            : "border-warning/30 bg-warning/10 text-warning"
        }`}
      >
        <Database className="w-3.5 h-3.5" />
        <span className="font-medium">
          DB: {health.db ? "Connected" : health.dbStatus}
        </span>
      </div>

      {!health.api && (
        <p className="text-error/80 text-xs">
          Start the FastAPI server:{" "}
          <code className="bg-base-300 px-2 py-0.5 rounded text-xs font-mono">
            uvicorn main:app --reload
          </code>
        </p>
      )}

      {health.api && !health.db && (
        <p className="text-warning/80 text-xs">
          Start MongoDB:{" "}
          <code className="bg-base-300 px-2 py-0.5 rounded text-xs font-mono">
            mongod
          </code>
        </p>
      )}
    </div>
  );
}
