"use client";
import { Suspense } from "react";
import { WinScreen } from "@/components/WinScreen";

export default function WinPage() {
  return (
    <main className="win-page">
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="scanline" />
      <Suspense fallback={<div className="loading">Loading...</div>}>
        <WinScreen />
      </Suspense>
    </main>
  );
}
