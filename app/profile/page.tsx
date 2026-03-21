"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payoutAccount, setPayoutAccount] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (session?.user) {
      const fetchProfile = async () => {
        const userId = (session.user as any).id;
        const pRef = doc(db, "users", userId);
        const pDoc = await getDoc(pRef);
        
        if (pDoc.exists()) {
          setProfile(pDoc.data());
          setPayoutAccount(pDoc.data().payoutAccount || "");
        } else {
          // Initialize empty profile
          const newProfile = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalPrizeMoney: 0,
            badges: [],
            payoutAccount: "",
          };
          await setDoc(pRef, newProfile);
          setProfile(newProfile);
        }
        setLoading(false);
      };
      
      fetchProfile();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 text-center" style={{ fontFamily: "var(--font-mono)" }}>
        <div>
          <h1 className="text-xl text-[var(--pink)] tracking-[0.2em] mb-4">ACCESS DENIED</h1>
          <p className="text-gray-400">Please sign in to view your operator profile.</p>
        </div>
      </div>
    );
  }

  if (loading || !profile) {
    return <div className="min-h-screen bg-black text-[var(--muted)] flex items-center justify-center font-mono">LOADING PROFILE...</div>;
  }

  const savePayoutInfo = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const userId = (session.user as any).id;
      const pRef = doc(db, "users", userId);
      await setDoc(pRef, { payoutAccount }, { merge: true });
      setSaveMsg("Payout info saved successfully.");
    } catch (e: any) {
      setSaveMsg("Error: " + e.message);
    }
    setSaving(false);
  };

  const winRatio = profile.gamesPlayed > 0 
    ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8 md:p-16">
      <Link href="/" className="text-[var(--muted)] hover:text-white transition tracking-[0.2em] text-xs">
        ← RETURN TO LOBBY
      </Link>

      <div className="line-break" style={{ height: "40px" }} />

      <h1 className="text-3xl mb-2 tracking-[0.1em]">OPERATOR PROFILE</h1>
      <p className="text-[var(--pink)] tracking-[0.2em] text-sm mb-12">PLAYER {(session.user as any).id.slice(0,3).toUpperCase()}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl">
        {/* STATS */}
        <div className="space-y-8">
          <div className="border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-6">
            <h2 className="text-[var(--muted)] tracking-[0.2em] text-xs mb-6">LIFETIME STATS</h2>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-500 mb-1">GAMES PLAYED</p>
                <p className="text-3xl">{profile.gamesPlayed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">GAMES WON</p>
                <p className="text-3xl">{profile.gamesWon}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">WIN RATIO</p>
                <p className="text-3xl">{winRatio}%</p>
              </div>
              <div>
                <p className="text-sm pb-1" style={{ color: "var(--green)" }}>PRIZE EARNED</p>
                <p className="text-3xl pb-1" style={{ color: "var(--green)", textShadow: "0 0 10px rgba(0,255,0,0.3)" }}>
                  ${profile.totalPrizeMoney}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-6">
            <h2 className="text-[var(--muted)] tracking-[0.2em] text-xs mb-4">BADGES</h2>
            <div className="flex flex-wrap gap-4">
              {profile.badges.length > 0 ? profile.badges.map((b: string, i: number) => (
                <div key={i} className="px-3 py-1 border border-[var(--pink)] bg-[rgba(255,45,107,0.1)] text-xs tracking-widest text-[var(--pink)]">
                  {b}
                </div>
              )) : (
                <p className="text-sm text-gray-500 italic">No badges earned yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* PAYOUT SETTINGS */}
        <div className="space-y-8">
          <div className="border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-6">
            <h2 className="text-[var(--muted)] tracking-[0.2em] text-xs mb-6">AUTOMATED PAYOUT ACCOUNT</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              To receive automated payouts via Razorpay Route when you win a room, enter your UPI ID or Bank Account Number. 
              Leave blank if you prefer manual contact.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">RAZORPAY LINKED ACCOUNT / UPI ID</label>
                <input 
                  type="text" 
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  placeholder="e.g. yourname@ybl, acct_XXXXXXXXX"
                  className="w-full bg-black border border-[rgba(255,255,255,0.2)] p-3 text-white font-mono text-sm focus:border-[var(--pink)] outline-none transition"
                />
              </div>

              <button 
                onClick={savePayoutInfo} 
                disabled={saving}
                className="w-full py-3 border border-white hover:bg-white hover:text-black transition tracking-[0.2em] text-xs disabled:opacity-50"
              >
                {saving ? "SAVING..." : "SAVE PAYOUT INFO"}
              </button>

              {saveMsg && (
                <p className={`text-xs mt-2 ${saveMsg.startsWith("Error") ? "text-[var(--pink)]" : "text-[var(--green)]"}`}>
                  {saveMsg}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
