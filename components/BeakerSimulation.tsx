
import React, { useEffect, useRef } from 'react';
import { Salt, CalculationResult } from '../types';

interface Props {
  salt: Salt;
  result: CalculationResult;
}

const BeakerSimulation: React.FC<Props> = ({ salt, result }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: any[] = [];
    const particleCount = Math.min(Math.floor(result.cationConc * 20000000) + 5, 100);

    // Initial particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.7),
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 2 + 2,
        color: i % 2 === 0 ? '#3b82f6' : '#ef4444', // Blue for cation, Red for anion
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Beaker
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(40, 20);
      ctx.lineTo(40, 250);
      ctx.lineTo(260, 250);
      ctx.lineTo(260, 20);
      ctx.stroke();

      // Draw Water
      ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
      ctx.fillRect(42, 60, 216, 188);

      // Draw Precipitate
      if (result.precipitatedMoles > 0) {
        const height = Math.min(result.precipitatedMoles * 50000, 30);
        ctx.fillStyle = salt.color;
        ctx.fillRect(42, 248 - height, 216, height);
        
        // Add texture to precipitate
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for(let j=0; j < 20; j++) {
           ctx.beginPath();
           ctx.arc(42 + Math.random() * 216, 248 - Math.random() * height, 1, 0, Math.PI * 2);
           ctx.fill();
        }
      }

      // Draw Ions
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        // Boundaries
        if (p.x < 42 || p.x > 258) p.vx *= -1;
        if (p.y < 60 || p.y > 248) p.vy *= -1;
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [result, salt]);

  return (
    <div className="flex flex-col items-center">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={300} 
        className="rounded-lg"
      />
      <div className="flex gap-4 mt-2 text-xs font-medium">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>{salt.cations}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>{salt.anions}</span>
        </div>
        {result.precipitatedMoles > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-300 border border-gray-400"></div>
            <span>Precipitate ({salt.formula})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeakerSimulation;
