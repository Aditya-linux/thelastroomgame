export interface Clue {
  id: number;
  text: string;
  dropAtHour: number;
}

export const GAME_CLUES: Record<string, Clue[]> = {
  clubs: [
    { id: 1, text: "The answer is hidden in plain sight. Look vertically.", dropAtHour: 0 },
    { id: 2, text: "Focus on the first column of the grid.", dropAtHour: 8 },
    { id: 3, text: "Read downward. Six letters. Something you look into.", dropAtHour: 16 },
    { id: 4, text: "Snow White's enemy asked one every day.", dropAtHour: 24 },
  ],
  diamonds: [
    { id: 1, text: "Julius would know. Each letter is shifted.", dropAtHour: 0 },
    { id: 2, text: "The shift value is 3. A → D, B → E, C → F...", dropAtHour: 8 },
    { id: 3, text: "Decode: WKH URRP QHYHU FORVHV", dropAtHour: 16 },
    { id: 4, text: "The room is eternal. It never stops.", dropAtHour: 24 },
  ],
  spades: [
    { id: 1, text: "Listen closely. Dots and dashes carry meaning.", dropAtHour: 0 },
    { id: 2, text: "The morse decodes to a hotel name. Think cinema.", dropAtHour: 8 },
    { id: 3, text: "Stanley checked in, but he never left.", dropAtHour: 16 },
    { id: 4, text: "Combine the year it was released with the title. No spaces. Lowercase.", dropAtHour: 24 },
  ],
};

export function getVisibleClues(gameStartedAt: Date, clues: Clue[]): Clue[] {
  const elapsedHours = (Date.now() - gameStartedAt.getTime()) / (1000 * 60 * 60);
  return clues.filter((c) => c.dropAtHour <= elapsedHours);
}
