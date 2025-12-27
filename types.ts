
export interface BaziData {
  year: string;
  month: string;
  day: string;
  hour: string;
  wuxing: string[];
  dayMaster: string;
}

export interface DailyFortune {
  date: string;
  score: number;
  vitamin: string;
  advice: string;
}

export interface Interpretation {
  personality: string;
  career: string;
  health: string;
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
}
