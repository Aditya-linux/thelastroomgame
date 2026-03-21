import crypto from "crypto";

export interface Clue {
  hour: number;
  text: string;
  isRedHerring: boolean;
}

export interface GameTier {
  id: string;
  suit: string;
  suitName: string;
  difficulty: string;
  diffNum: number;
  name: string;
  cost: number;
  minCap: number;
  cap: number;
  winPercent: number;
  color: string;
  colorDim: string;
  colorBorder: string;
  shape: string;
  shapeLabel: string;
  category: string;
  description: string;
  flavor: string;
  puzzle: any;
  clues: Clue[];
}

export const GAME_TIERS: GameTier[] = [
  {
    id: "hearts",
    suit: "♥",
    suitName: "HEARTS",
    difficulty: "ONE",
    diffNum: 1,
    name: "The First Beat",
    cost: 0,
    minCap: 10,
    cap: 1000000,
    winPercent: 0,
    color: "#ff2d2d",
    colorDim: "rgba(255, 45, 45, 0.12)",
    colorBorder: "rgba(255, 45, 45, 0.35)",
    shape: "♡",
    shapeLabel: "HEART",
    category: "TUTORIAL",
    description: "A free room to learn the systems. The puzzle is straightforward.",
    flavor: "The arena doors are open. Enter freely to learn the rules of survival.",
    puzzle: {
      type: "cipher",
      title: "GAME 00 — THE AWAKENING",
      body: "Reverse Encryption. The message is encrypted in reverse. Decrypt the sentence to find the single-word answer.",
      encoded: "ESIR NUS EHT SEOD EREHW",
      subtext: "Reverse the string to reveal the question.",
      hint1: "Read the string from right to left.",
      hint2: "The question is 'WHERE DOES THE SUN RISE'.",
      answer: "EAST",
    },
    clues: [
      { hour: 8, text: "The message is written backwards. Flip it to read the question.", isRedHerring: false },
      { hour: 16, text: "The sentence asks where the sun rises.", isRedHerring: false },
      { hour: 24, text: "The answer is EAST.", isRedHerring: false },
    ],
  },
  {
    id: "clubs",
    suit: "♣",
    suitName: "CLUBS",
    difficulty: "THREE",
    diffNum: 3,
    name: "The Watcher's Grid",
    cost: 50,
    minCap: 10,
    cap: 100,
    winPercent: 20,
    color: "#00f5c4",
    colorDim: "rgba(0,245,196,0.12)",
    colorBorder: "rgba(0,245,196,0.35)",
    shape: "○",
    shapeLabel: "CIRCLE",
    category: "SPATIAL",
    description: "Visual perception. Pattern recognition. The simplest game is never simple.",
    flavor: "In the abandoned arena, 500 players stare at the same grid. Only one sees the truth.",
    puzzle: {
      type: "grid",
      title: "GAME 01 — THE GRID",
      body: "A word hides inside the static. Read the correct diagonal and you survive.",
      grid: [
        ["S","X","K","Z","P","Q","R","W"],
        ["I","I","D","B","N","V","O","S"],
        ["R","N","L","L","O","C","K","E"],
        ["R","C","H","E","G","J","B","D"],
        ["O","H","Q","W","N","P","T","L"],
        ["R","O","O","M","S","C","X","F"],
        ["T","E","M","P","L","E","E","R"],
      ],
      hint1: "The first letter is 'S' located at the top-left (0,0).",
      hint2: "Read diagonally from top-left to bottom-right.",
      answer: "SILENCE",
    },
    clues: [
      { hour: 8,  text: "The path cuts through the grid diagonally.", isRedHerring: false },
      { hour: 16, text: "Start at the top-left corner and move down-right one cell at a time.", isRedHerring: false },
      { hour: 24, text: "S-I-L-E-N-C-E.", isRedHerring: false },
    ],
  },
  {
    id: "diamonds",
    suit: "♦",
    suitName: "DIAMONDS",
    difficulty: "SEVEN",
    diffNum: 7,
    name: "Shift of the Dead",
    cost: 200,
    minCap: 10,
    cap: 100,
    winPercent: 50,
    color: "#ff2d6b",
    colorDim: "rgba(255,45,107,0.12)",
    colorBorder: "rgba(255,45,107,0.35)",
    shape: "△",
    shapeLabel: "TRIANGLE",
    category: "CEREBRAL",
    description: "Logic and cryptography. Ciphers. The game master sends messages. Decode them.",
    flavor: "The message was broadcast before anyone could escape. No one decoded it in time.",
    puzzle: {
      type: "cipher",
      title: "GAME 02 — THE BROADCAST",
      body: "An encoded transmission. Flip the reflection to find the truth.",
      encoded: "GSV GIFGS RH SRAWVM",
      subtext: "Atbash cipher · A=Z, B=Y, C=X",
      hint1: "Atbash cipher mapping: replacing A with Z, B with Y...",
      hint2: "GSV translates to THE.",
      answer: "THE TRUTH IS HIDDEN",
    },
    clues: [
      { hour: 8,  text: "Atbash cipher. The alphabet is mirrored.", isRedHerring: false },
      { hour: 16, text: "G -> T, S -> H, V -> E. The first word is THE.", isRedHerring: false },
      { hour: 24, text: "⚠ CAUTION: It's a Caesar cipher with shift 13. (Intentional misdirection — this clue is false.)", isRedHerring: true },
    ],
  },
  {
    id: "spades",
    suit: "♠",
    suitName: "SPADES",
    difficulty: "TEN",
    diffNum: 10,
    name: "The Signal",
    cost: 500,
    minCap: 10,
    cap: 100,
    winPercent: 80,
    color: "#f0e040",
    colorDim: "rgba(240,224,64,0.08)",
    colorBorder: "rgba(240,224,64,0.3)",
    shape: "□",
    shapeLabel: "SQUARE",
    category: "META",
    description: "External research required. You must leave this arena to survive it.",
    flavor: "Three frequencies. Three keys. One door. The game master is watching you search.",
    puzzle: {
      type: "multi",
      title: "GAME 03 — THE FREQUENCY",
      body: "Decode in sequence. Each answer unlocks the next. The final key opens the door.",
      steps: [
        {
          label: "FREQUENCY 01",
          text: "Decode this Morse code:",
          morse: "·-- ·- -·- ·",
          subtext: "What word does this spell?",
        },
        {
          label: "FREQUENCY 02",
          text: "The word from Step 1 is the first word of a famous prompt given to Neo. Find the movie release year.",
          subtext: "Search the prompt '____ up, Neo'.",
        },
        {
          label: "FREQUENCY 03",
          text: "Combine: [year] + [decoded word, lowercase]. No spaces.",
          subtext: "Format: 1999word → Submit this as your answer.",
        },
      ],
      hint1: "Morse: ·-- = W, ·- = A, -·- = K, · = E.",
      hint2: "The movie: The Matrix (1999). Answer format: 1999 + wake.",
      answer: "1999wake",
    },
    clues: [
      { hour: 8,  text: "Decode the Morse. It spells 'WAKE'.", isRedHerring: false },
      { hour: 16, text: "The Matrix was released in 1999. WAKE UP, NEO.", isRedHerring: false },
      { hour: 24, text: "⚠ CAUTION: The answer requires capital letters. (False clue.)", isRedHerring: true },
    ],
  },
];

// Answers stored as SHA256 hashes — never in plaintext
export const ANSWER_HASHES: Record<string, string> = {
  hearts: "03825024559394f1da8bcc3743ca996165add12b3f6fa9665e441044ae4e3e110",
  clubs: "6a9e32e9be79bb5de28f9da2f0c65586b30a1fe2f445e3e2379e0f8b727f5704",
  diamonds: "22bf47e66237c6d90a9350243362522d5f0b7070e3311bfa34a8f59c449f9e0f",
  spades: "577f72782895a15520d0403a04662f496dce68a91b0b5d641f4f61e04f06d0c1",
};
