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
    id: "clubs",
    suit: "♣",
    suitName: "CLUBS",
    difficulty: "THREE",
    diffNum: 3,
    name: "The Watcher's Grid",
    cost: 5,
    cap: 500,
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
      body: "A word hides inside the static. Read the correct direction and you survive.",
      grid: [
        ["M","X","K","Z","P","Q","R","W"],
        ["I","A","D","B","N","V","O","S"],
        ["R","N","F","L","O","C","K","E"],
        ["R","C","H","Y","G","J","B","D"],
        ["O","H","Q","W","M","P","T","L"],
        ["R","O","O","M","S","I","X","F"],
      ],
      hint1: "The first letter is M. Read the leftmost column vertically.",
      hint2: "Six letters. Top to bottom. First column only.",
      answer: "MIRROR",
    },
    clues: [
      { hour: 8,  text: "The answer begins with M.", isRedHerring: false },
      { hour: 16, text: "Six letters. The leftmost column holds the truth.", isRedHerring: false },
      { hour: 24, text: "It's not in any row. Look vertical.", isRedHerring: false },
    ],
  },
  {
    id: "diamonds",
    suit: "♦",
    suitName: "DIAMONDS",
    difficulty: "SEVEN",
    diffNum: 7,
    name: "Shift of the Dead",
    cost: 10,
    cap: 200,
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
      body: "An encoded transmission. Shift it back to find the truth.",
      encoded: "WKH URRP QHYHU FORVHV",
      subtext: "Caesar cipher · Shift 3 · What does the room do — or not do?",
      hint1: "Caesar cipher: each letter moved back 3 positions. W→T, K→H...",
      hint2: "Decode each word: WKH = THE, URRP = ROOM, QHYHU = NEVER...",
      answer: "THE ROOM NEVER CLOSES",
    },
    clues: [
      { hour: 8,  text: "Caesar cipher. Standard alphabet shift.", isRedHerring: false },
      { hour: 16, text: "The shift is 3. Each letter moves back 3.", isRedHerring: false },
      { hour: 24, text: "⚠ CAUTION: The shift is 7. (Intentional misdirection — this clue is false.)", isRedHerring: true },
    ],
  },
  {
    id: "spades",
    suit: "♠",
    suitName: "SPADES",
    difficulty: "TEN",
    diffNum: 10,
    name: "The Signal",
    cost: 20,
    cap: 50,
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
          morse: "·-·· ·· · ···",
          subtext: "What two-word phrase do you get?",
        },
        {
          label: "FREQUENCY 02",
          text: "The words from Step 1 name a film. Find the year of its theatrical release.",
          subtext: "Search the title — the director is Stanley Kubrick.",
        },
        {
          label: "FREQUENCY 03",
          text: "Combine: [year] + [first decoded word, lowercase]. No spaces.",
          subtext: "Format: 1980word → Submit this as your answer.",
        },
      ],
      hint1: "Morse: ·-·· = L, ·· = I, · = E, ··· = S → LIES? Try again with full chart.",
      hint2: "The film: THE SHINING (1980). Answer format: year + first word lowercase.",
      answer: "1980shining",
    },
    clues: [
      { hour: 8,  text: "Decode the Morse. It spells two words.", isRedHerring: false },
      { hour: 16, text: "Stanley Kubrick. Horror. 1980.", isRedHerring: false },
      { hour: 24, text: "⚠ CAUTION: The year is 1979 and the answer needs a capital. (False clue.)", isRedHerring: true },
    ],
  },
];

// Answers stored as SHA256 hashes — never in plaintext
export const ANSWER_HASHES: Record<string, string> = {
  clubs: crypto.createHash("sha256").update("MIRROR").digest("hex"),
  diamonds: crypto.createHash("sha256").update("THE ROOM NEVER CLOSES").digest("hex"),
  spades: crypto.createHash("sha256").update("1980SHINING").digest("hex"),
};
