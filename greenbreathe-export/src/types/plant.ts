// 🌱 植物成长系统类型定义
export type PlantType = 'bamboo' | 'orchid' | 'chrysanthemum' | 'plum';

export interface PlantGrowth {
  type: PlantType;
  level: number; // 1-10
  totalCompletions: number;
  unlockedForms: PlantType[];
  lastWatered: number; // timestamp
}

export interface PlantAnimation {
  duration: number; // ms
  stages: number;
  easing: string;
}

// SVG 植物路径数据
export const PLANT_PATHS: Record<PlantType, string[]> = {
  bamboo: [
    // 竹芽 level 1-3
    'M 12 20 Q 12 15 12 10',
    'M 12 20 Q 12 13 12 6 M 8 8 L 16 8',
    'M 12 24 Q 12 15 12 6 M 8 8 L 16 8 M 7 13 L 17 13 M 9 18 L 15 18',
  ],
  orchid: [
    // 兰花 level 1-3
    'M 12 20 C 12 16 10 12 8 10',
    'M 12 22 C 12 16 10 12 8 10 M 12 22 C 12 16 14 12 16 10',
    'M 12 24 C 12 17 9 12 6 8 M 12 24 C 12 17 15 12 18 8 M 12 18 C 11 16 9 14 7 12',
  ],
  chrysanthemum: [
    // 菊花 level 1-3
    'M 12 16 L 12 8',
    'M 12 18 L 12 8 M 8 12 L 16 12',
    'M 12 20 L 12 6 M 6 13 L 18 13 M 9 9 L 15 9 M 9 17 L 15 17',
  ],
  plum: [
    // 梅花 level 1-3
    'M 10 20 Q 10 14 12 10',
    'M 8 22 Q 8 14 12 8 M 12 12 Q 14 10 16 10',
    'M 6 24 Q 6 15 12 6 M 12 14 Q 15 11 18 10 M 10 18 Q 12 16 14 16',
  ],
};
