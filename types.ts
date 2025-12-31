
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

// 用户监控相关类型
export interface UserSession {
  userId?: string;
  vitaMeId?: string; // 添加 Vita-Me ID 字段
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalDuration: number;
  pages: PageVisit[];
}

export interface PageVisit {
  path: string;
  pageName: string;
  startTime: number;
  endTime?: number;
  duration: number;
  interactions: number;
}

export interface MonitoringData {
  sessions: UserSession[];
  currentSession?: UserSession;
}
