"use client";
import { useEffect, useState } from "react";

export function Countdown({ endsAt }: { endsAt: Date }) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const calc = () =>
      Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
    setSecs(calc());
    const t = setInterval(() => setSecs(calc()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  const timeUp = secs === 0;

  return (
    <div className="countdown-container">
      <div className="countdown-label">
        {timeUp ? "TIME EXPIRED" : "TIME REMAINING"}
      </div>
      <div className="countdown-timer">
        <div className="countdown-segment">
          <span className="countdown-number">
            {String(h).padStart(2, "0")}
          </span>
          <span className="countdown-unit">HRS</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-segment">
          <span className="countdown-number">
            {String(m).padStart(2, "0")}
          </span>
          <span className="countdown-unit">MIN</span>
        </div>
        <span className="countdown-separator">:</span>
        <div className="countdown-segment">
          <span className={`countdown-number ${secs <= 3600 ? "urgent" : ""}`}>
            {String(s).padStart(2, "0")}
          </span>
          <span className="countdown-unit">SEC</span>
        </div>
      </div>
    </div>
  );
}
