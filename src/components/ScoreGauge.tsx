import React, { useEffect, useState } from 'react';
import type { RiskLevel } from '../types';
import { getScoreTheme } from '../utils/visualHelpers';

interface ScoreGaugeProps {
  score: number;
  level: RiskLevel;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, level, size = 160 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const duration = 600; // ms
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = score / totalSteps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const theme = getScoreTheme(score);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90 overflow-visible">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Dynamic Progress Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          style={{
            filter: `drop-shadow(0 0 8px ${theme.glowColor})`,
            transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.4s ease',
          }}
        />
      </svg>

      {/* Center Label HUD */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-mono tracking-widest text-slate-400">INDEX RISIKO</span>
        <span className={`text-4xl font-mono font-bold tracking-tight ${theme.textColor}`}>
          {animatedScore}
        </span>
        <span className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border ${theme.levelBg}`}>
          {level.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
