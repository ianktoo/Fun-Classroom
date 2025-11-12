
import React, { useState, useEffect } from 'react';
import Confetti from './Confetti';

interface Props {
  duration: number; // in seconds
  onComplete: () => void;
}

const Timer: React.FC<Props> = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsComplete(true);
      const timer = setTimeout(onComplete, 3000); // Wait for confetti
      return () => clearTimeout(timer);
    }

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onComplete]);
  
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / duration) * circumference;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md flex flex-col items-center justify-center relative">
      {isComplete && <Confetti />}
      <h3 className="font-display text-2xl text-orange-700 mb-4">Time's Up!</h3>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="10"
            className="stroke-orange-200"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            strokeWidth="10"
            className="stroke-orange-500 transition-all duration-1000 ease-linear"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform="rotate(-90 60 60)"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-display text-4xl text-orange-800">
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
      </div>
    </div>
  );
};

export default Timer;