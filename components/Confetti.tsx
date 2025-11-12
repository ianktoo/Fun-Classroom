
import React, { useEffect, useState } from 'react';

const ConfettiPiece: React.FC<{ id: number }> = ({ id }) => {
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
  const style: React.CSSProperties = {
    position: 'absolute',
    width: `${Math.random() * 8 + 6}px`,
    height: `${Math.random() * 8 + 6}px`,
    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    top: `${-10}%`,
    left: `${Math.random() * 100}%`,
    opacity: 1,
    transform: `rotate(${Math.random() * 360}deg)`,
    animation: `fall-${id} 5s linear forwards`,
  };

  const keyframes = `
    @keyframes fall-${id} {
      to {
        top: 110%;
        transform: rotate(${Math.random() * 360 + 360}deg);
        opacity: 0;
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={style}></div>
    </>
  );
};

const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<number[]>([]);

  useEffect(() => {
    setPieces(Array.from({ length: 150 }, (_, i) => i));
    const timer = setTimeout(() => setPieces([]), 5000); // Clean up after animation
    return () => clearTimeout(timer);
  }, []);
  
  if (pieces.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {pieces.map(i => <ConfettiPiece key={i} id={i} />)}
    </div>
  );
};

export default Confetti;