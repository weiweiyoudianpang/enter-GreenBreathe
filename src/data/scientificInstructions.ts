import { ScientificInstruction } from '@/types/extension';

// 科学指令库 - 含真实文献依据和MBTI适配表达
export const scientificInstructions: ScientificInstruction[] = [
  {
    id: 'hydration_1',
    taskType: 'hydration',
    instruction: '饮用200ml温水（约1杯）',
    scienceBasis: '轻度脱水致注意力下降17%',
    source: 'Nutrients, 2019',
    duration: 5,
    mbtiAdaptation: {
      T: '脱水1-2%导致认知效率下降，执行补水',
      F: '给身体一份温柔的滋养',
      S: '感受水流入喉的清凉',
      N: '让水成为灵感的源泉',
    },
  },
  {
    id: 'hydration_2',
    taskType: 'hydration',
    instruction: '补充水分，保持身体水平衡',
    scienceBasis: '每日需水2000-2500ml',
    source: 'WHO指南, 2021',
    duration: 5,
    mbtiAdaptation: {
      T: '维持水电解质平衡，优化身体机能',
      F: '像照顾花朵一样，给自己浇水',
      S: '此刻，你的身体正在渴望',
      N: '水是生命之流，连接过去与未来',
    },
  },
  
  {
    id: 'eyeCare_1',
    taskType: 'eyeCare',
    instruction: '20-20-20法则：看20英尺外20秒',
    scienceBasis: '减少眼疲劳52%',
    source: 'Optometry, 2018',
    duration: 20,
    mbtiAdaptation: {
      T: '定时远眺降低眼部肌肉疲劳指数',
      F: '让眼睛休息，就像给它一个拥抱',
      S: '观察窗外一片叶子的脉络',
      N: '让目光穿越屏幕，捕捉现实中的灵感',
    },
  },
  {
    id: 'eyeCare_2',
    taskType: 'eyeCare',
    instruction: '闭眼休息20秒，放松眼部肌肉',
    scienceBasis: '持续近距离用眼导致假性近视',
    source: 'Ophthalmology, 2020',
    duration: 20,
    mbtiAdaptation: {
      T: '预防睫状肌痉挛，降低近视风险',
      F: '给眼睛一个温柔的假期',
      S: '感受眼皮下的黑暗与宁静',
      N: '黑暗中，内心的画面更清晰',
    },
  },
  {
    id: 'eyeCare_3',
    taskType: 'eyeCare',
    instruction: '眨眼10次，润滑眼球表面',
    scienceBasis: '屏幕使用减少眨眼频率66%',
    source: 'J Ophthalmology, 2019',
    duration: 10,
    mbtiAdaptation: {
      T: '增加泪液分泌，预防干眼症',
      F: '让眼睛喝上一口甘露',
      S: '慢慢眨眼，感受眼睑的柔软',
      N: '每一次眨眼，都是微小的重启',
    },
  },
  
  {
    id: 'movement_1',
    taskType: 'movement',
    instruction: '深蹲×10 + 肩颈放松',
    scienceBasis: '久坐增加心血管疾病风险34%',
    source: 'Circulation, 2020',
    duration: 120,
    mbtiAdaptation: {
      T: '激活循环系统，提升大脑供氧',
      F: '给身体一个舒展的机会',
      S: '感受肌肉收缩与舒张的力量',
      N: '运动是身体与意识的对话',
    },
  },
  {
    id: 'movement_2',
    taskType: 'movement',
    instruction: '站立伸展，双臂上举30秒',
    scienceBasis: '每小时站立5分钟改善代谢',
    source: 'Diabetes Care, 2019',
    duration: 30,
    mbtiAdaptation: {
      T: '打断久坐模式，优化血糖控制',
      F: '像向天空问好一样伸展',
      S: '感受脊椎一节节拉伸',
      N: '伸展身体，也伸展思维的边界',
    },
  },
  {
    id: 'movement_3',
    taskType: 'movement',
    instruction: '原地踏步100步 + 肩部绕环',
    scienceBasis: '轻度活动提升工作效率23%',
    source: 'Br J Sports Med, 2021',
    duration: 90,
    mbtiAdaptation: {
      T: '短期运动投入，长期效率收益',
      F: '让身体跳支轻快的舞',
      S: '脚踏实地，一步一步',
      N: '每一步都在通往更好的自己',
    },
  },
];

// 随机获取科学指令
export function getRandomInstruction(taskType: 'hydration' | 'eyeCare' | 'movement'): ScientificInstruction {
  const instructions = scientificInstructions.filter(inst => inst.taskType === taskType);
  const randomIndex = Math.floor(Math.random() * instructions.length);
  return instructions[randomIndex];
}

// 根据MBTI适配科学表达
export function adaptInstructionToMBTI(instruction: ScientificInstruction, mbtiType: string): string {
  // 根据MBTI的T/F维度选择表达
  const isThinker = mbtiType.includes('T');
  const isIntuitive = mbtiType.includes('N');
  
  if (isThinker && isIntuitive) return instruction.mbtiAdaptation.T;
  if (isThinker && !isIntuitive) return instruction.mbtiAdaptation.T;
  if (!isThinker && isIntuitive) return instruction.mbtiAdaptation.N;
  return instruction.mbtiAdaptation.F;
}
