import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const ref = doc(db, "players", user.id!);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const num = String(Math.floor(Math.random() * 999)).padStart(3, "0");
        await setDoc(ref, {
          email: user.email,
          playerNumber: num,
          joinedAt: new Date(),
        });
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub!;
        const snap = await getDoc(doc(db, "players", token.sub!));
        if (snap.exists()) {
          (session.user as any).playerNumber = snap.data().playerNumber;
        }
      }
      return session;
    },
  },
};
