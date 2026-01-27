import { useEffect, useRef } from 'react';
import CountdownTimer from './components/CountdownTimer';

const COLORS = {
  midnight: "#02060f",
  border: "#0f1b2f",
  mint: "#2fffe1",
  deepBlue: "#06122a",
};

function Manu() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = 256;
    const height = 512;

    // Create gradient background matching homepage theme
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, COLORS.midnight);
    gradient.addColorStop(0.55, COLORS.deepBlue);
    gradient.addColorStop(1, COLORS.midnight);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw subtle decorative elements
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    
    // Subtle wave pattern at bottom
    ctx.beginPath();
    ctx.moveTo(0, height - 60);
    ctx.bezierCurveTo(width * 0.25, height - 80, width * 0.75, height - 40, width, height - 60);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, height - 30);
    ctx.bezierCurveTo(width * 0.3, height - 50, width * 0.7, height - 10, width, height - 30);
    ctx.stroke();
  }, []);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-4 py-8" style={{ backgroundColor: COLORS.midnight }}>
      {/* Container for canvas and overlay */}
      <div 
        className="relative rounded-[28px] overflow-hidden"
        style={{ 
          border: `3px solid ${COLORS.border}`,
          boxShadow: `0 0 40px rgba(47, 255, 225, 0.1), inset 0 0 60px rgba(6, 18, 42, 0.5)`
        }}
      >
        {/* Themed Canvas */}
        <canvas
          ref={canvasRef}
          width={256}
          height={512}
        />

        {/* Countdown Timer Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CountdownTimer />
        </div>
      </div>
      
      {/* Subtle branding */}
      <p 
        className="mt-4 text-[11px] font-semibold tracking-[0.3em] uppercase"
        style={{ color: '#8fb1d4' }}
      >
        Manu Splash Station
      </p>
    </div>
  );
}

export default Manu;
