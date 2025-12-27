
// Since we are in a browser environment, we'll assume the library is loaded or mock core parts
// In a real project, we'd import { Solar, Lunar } from 'lunar-javascript'
// For this MVP, we provide a simulation of the Bazi extraction.

import { Solar, Lunar } from 'lunar-javascript';

export const calculateBazi = (dateStr: string, timeStr: string) => {
  try {
    const date = new Date(`${dateStr}T${timeStr}`);
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const eightChars = lunar.getEightChar();

    return {
      year: eightChars.getYear(),
      month: eightChars.getMonth(),
      day: eightChars.getDay(),
      hour: eightChars.getTime(),
      dayMaster: eightChars.getDay().substring(0, 1), // The Heavenly Stem of the day
      wuxing: [
        eightChars.getYearWuXing(),
        eightChars.getMonthWuXing(),
        eightChars.getDayWuXing(),
        eightChars.getTimeWuXing()
      ]
    };
  } catch (error) {
    console.error('Error calculating bazi:', error);
    // 返回默认值以防止崩溃
    return {
      year: '甲子',
      month: '甲子',
      day: '甲子',
      hour: '甲子',
      dayMaster: '甲',
      wuxing: ['木', '木', '木', '木']
    };
  }
};

export const getElementColor = (element: string) => {
  const map: Record<string, string> = {
    '木': 'text-green-600',
    '火': 'text-red-500',
    '土': 'text-yellow-700',
    '金': 'text-slate-400',
    '水': 'text-blue-600',
  };
  return map[element] || 'text-gray-500';
};
