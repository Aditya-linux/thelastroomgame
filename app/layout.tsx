import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "The Last Room — 48-Hour Puzzle Contest",
  description:
    "Skill-based timed puzzle contest. Pick your tier. Pay to enter. Solve to survive. Winner takes 70% of the prize pool. 48 hours. One winner.",
  keywords: [
    "puzzle contest",
    "skill game",
    "prize pool",
    "timed challenge",
    "The Last Room",
  ],
  openGraph: {
    title: "The Last Room",
    description: "48 hours. One puzzle. One winner. Do you dare enter?",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
