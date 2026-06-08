export default function Loader3D({ text = "Processing on backend..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12 fade-in">
      <div className="cube-loader-wrapper">
        <div className="cube-loader">
          <div className="cube-face front"></div>
          <div className="cube-face back"></div>
          <div className="cube-face right"></div>
          <div className="cube-face left"></div>
          <div className="cube-face top"></div>
          <div className="cube-face bottom"></div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
          {text}
        </span>
        <span className="text-xs font-mono opacity-50 flex items-center gap-1">
          <span className="pulse-dot w-1.5 h-1.5"></span>
          Backend ML Model Running
        </span>
      </div>
    </div>
  );
}
