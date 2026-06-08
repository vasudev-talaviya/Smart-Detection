import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function DetectionResult({ rawImage, faces, corrections = {}, registeredUsers = [] }) {
  const [imgSize, setImgSize] = useState({ width: 1, height: 1 });

  if (!rawImage || !faces || faces.length === 0) return null;

  return (
    <div className="glass-card p-4 fade-in">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-success" />
        Detection Result
      </h3>
      <div className="relative inline-block w-full max-w-full overflow-hidden rounded-xl border border-base-content/10">
        <img
          src={rawImage}
          alt="Detection"
          className="w-full h-auto block"
          onLoad={(e) => {
            setImgSize({
              width: e.target.naturalWidth || 1,
              height: e.target.naturalHeight || 1,
            });
          }}
        />
        
        {faces.map((face, i) => {
          if (!face.box) return null;
          
          const [x1, y1, x2, y2] = face.box;
          
          const left = (x1 / imgSize.width) * 100;
          const top = (y1 / imgSize.height) * 100;
          const width = ((x2 - x1) / imgSize.width) * 100;
          const height = ((y2 - y1) / imgSize.height) * 100;
          
          const correction = corrections[i];
          const corrected = correction?.user_id && correction.user_id !== (face.user_id || "");
          const selectedUser = registeredUsers.find((u) => u.id === correction?.user_id);
          
          const finalName = corrected ? (selectedUser?.name || "Unknown") : (face.name || "Unknown");
          const confidence = (face.confidence || 0) * 100;
          
          const isUnknown = !corrected && face.is_new_face !== undefined ? face.is_new_face : (!face.user_id);
          const colorClass = isUnknown ? "border-error text-error bg-error/20" : "border-success text-success bg-success/20";
          
          return (
            <div
              key={i}
              className={`absolute border-2 ${colorClass}`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
            >
              <div 
                className={`absolute bottom-full left-[-2px] mb-1 whitespace-nowrap px-2 py-0.5 text-xs font-bold bg-base-100 rounded shadow-md border ${colorClass.split(" ")[0]}`}
              >
                <span className={colorClass.split(" ")[1]}>{finalName} ({confidence.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
