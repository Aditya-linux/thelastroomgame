# 마지막 방 — THE LAST ROOM

![The Last Room](https://github.com/Aditya-linux/thelastroomgame/raw/main/public/banner.png) <!-- Placeholder for banner if exists, or just title -->

> **"Three games. Three suits. One survivor. 48 hours. Winner takes the pot."**

**The Last Room** is a high-stakes, survival-themed puzzle contest inspired by the intense atmosphere of *Alice in Borderland*. Set in a mysterious "Facility," players must solve logic, spatial, and psychological puzzles to survive and claim their share of the prize pool.

## 🌌 The Concept

In Season 01 of **The Facility**, participants are assigned a player number and granted access to four distinct game tiers, each represented by a playing card suit. Survival depends on your ability to decode hidden messages, recognize complex patterns, and outthink the system.

### 🃏 Game Tiers

| Suit | Name | Difficulty | Category | Description |
| :--- | :--- | :--- | :--- | :--- |
| **♥ HEARTS** | The First Beat | ★☆☆☆☆ | Tutorial | A free entry to learn the systems. Straightforward logic. |
| **♣ CLUBS** | The Watcher's Grid | ★★★☆☆ | Spatial | Visual perception and pattern recognition. |
| **♦ DIAMONDS** | Shift of the Dead | ★★★★★★★ | Cerebral | Logic, cryptography, and complex ciphers. |
| **♠ SPADES** | The Signal | ★★★★★★★★★★ | Meta | External research and multi-layered decoding. |

## 🛠️ Tech Stack

Built with a modern, high-performance stack for a seamless and secure gaming experience:

- **Frontend:** [Next.js 15+](https://nextjs.org/) (App Router) with [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) with custom Glassmorphism effects
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Google Integration)
- **Database:** [Firebase Firestore](https://firebase.google.com/products/firestore)
- **Payments:** [Razorpay](https://razorpay.com/) for secure entry fees
- **Communications:** [Resend](https://resend.com/) for transactional emails

## ✨ Key Features

- **Immersive UI:** A dark, premium aesthetic featuring bento-grid layouts, HSL-tailored colors, and smooth micro-animations.
- **Dynamic Countdown:** A high-pressure timer system that tracks the remaining time in the current volume.
- **Secure Puzzles:** Answers are validated using SHA-256 hashing to prevent client-side leaks.
- **Skill-Based Rewards:** A transparent reward system where winners take 20–80% of the pool.
- **Mobile Responsive:** Fully optimized for survival on any device.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Firebase Project credentials
- Razorpay API keys
- Resend API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Aditya-linux/thelastroomgame.git
   cd thelastroom
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with your credentials (see `.env.example` if available).

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to enter the facility.

## ⚖️ Terms & Conditions

*The Last Room is a skill contest. One-time entry fees apply. No purchase necessary for the Hearts tier. Winner takes a percentage of the pool based on the game tier difficulty.*

---

**Will you survive the last room?**
