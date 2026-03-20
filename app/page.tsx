"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function useTimer(startHours = 47) {
  const [secs, setSecs] = useState(startHours * 3600 + 3 * 60 + 27);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return {
    h: Math.floor(secs / 3600),
    m: Math.floor((secs % 3600) / 60),
    s: secs % 60,
    total: secs,
    urgent: secs < 14400,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Home() {
  const { data: session } = useSession();
  const timer = useTimer(47);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleEnter = () => {
    if (!session) {
      signIn("google", { callbackUrl: "/games" });
    } else {
      router.push("/games");
    }
  };

  const playerNum = (session?.user as any)?.playerNumber || "???";

  if (!mounted) return null;

  return (
    <div className="landing">
      <div className="geo-bg">
        <div className="geo-circle" />
        <div className="geo-triangle" />
        <div className="geo-square" />
      </div>

      <div className="landing-inner">
        <div className="facility-tag">THE FACILITY · SEASON 01</div>
        <div className="player-badge">PLAYER {playerNum} · CONNECTED</div>

        <div className="suit-row">
          <span className="suit-icon">♣</span>
          <span className="suit-icon">♦</span>
          <span className="suit-icon">♠</span>
        </div>

        <h1 className="main-title">
          <span className="main-title-accent">마지막 방</span>
          THE LAST<br />ROOM
        </h1>

        <p className="title-sub">
          Three games. Three suits. One survivor.<br />
          48 hours. Winner takes the pot.
        </p>

        <div className="countdown-outer">
          {[
            { k: "h", l: "Hours" },
            { k: "m", l: "Min" },
            { k: "s", l: "Sec" },
          ].map(({ k, l }) => (
            <div key={k} className="cd-unit">
              <span className={`cd-num ${timer.urgent ? "urgent" : ""}`}>
                {pad((timer as any)[k])}
              </span>
              <span className="cd-label">{l}</span>
            </div>
          ))}
        </div>

        <div className="status-line">
          <span className="pulse-dot" />
          GAME ACTIVE · VOL 01 · {timer.h}H REMAINING
        </div>

        <button className="enter-btn" onClick={handleEnter}>
          {session ? "ENTER THE ROOMS" : "SIGN IN TO ENTER"}
        </button>

        <div className="landing-disclaimer">
          Skill contest · One-time entry fee · No subscription<br />
          Winner takes 20–80% of pool depending on game tier<br />
          <span style={{ color: "var(--dim)" }}>No purchase necessary · See Terms & Conditions</span>
        </div>
      </div>
    </div>
  );
}
