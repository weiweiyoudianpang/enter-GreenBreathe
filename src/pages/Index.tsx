import { useState, useCallback } from 'react';
import { Droplets, Eye, PersonStanding, Play, Leaf, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── 数据 ─────────────────────────────────────────────────────────────────────

const MBTI_MESSAGES: Record<string, Record<string, string>> = {
  // 分析师组 (NT)
  INTJ: {
    hydration: '系统检测到逻辑引擎冷却液不足，建议补充200ml',
    eyeCare: '视觉系统过载，建议执行20秒校准程序',
    movement: '静态时间过长，系统性能开始下降',
  },
  INTP: {
    hydration: '大脑运算需要燃料，补充水分提升处理效率',
    eyeCare: '长时间专注已影响视觉精度，需要重新校准',
    movement: '理论证明：运动能提升认知能力27%',
  },
  ENTJ: {
    hydration: '高效领导者懂得战略性补给，现在就喝',
    eyeCare: '目标达成需要清晰视野，执行眼部维护',
    movement: '优秀的指挥官也要保持战斗力，起身活动',
  },
  ENTP: {
    hydration: '新想法：水分摄入与创意产出的相关性实验',
    eyeCare: '换个视角看世界，从休息眼睛开始',
    movement: '头脑风暴时站起来走走，灵感会加倍',
  },
  
  // 外交官组 (NF)
  INFJ: {
    hydration: '照顾好自己，才能更好地关怀他人',
    eyeCare: '让眼睛看看远方，让心灵也休息一下',
    movement: '与身体对话，感受此刻的存在',
  },
  INFP: {
    hydration: '你滋润了那么多心灵，也记得滋润自己呀',
    eyeCare: '让眼睛休息，也是对自己的温柔',
    movement: '身体想和你一起跳支小小的舞呢',
  },
  ENFJ: {
    hydration: '给予者也需要被滋养，来喝杯水吧',
    eyeCare: '你关心那么多人，也该关心自己的眼睛了',
    movement: '带着温暖的心，让身体也感受关怀',
  },
  ENFP: {
    hydration: '喝杯水，让灵感继续冒泡吧',
    eyeCare: '让眼睛看看外面的精彩世界',
    movement: '动起来，让快乐细胞活跃起来',
  },
  
  // 守护者组 (SJ)
  ISTJ: {
    hydration: '按照健康计划：现在是补水时间',
    eyeCare: '遵循20-20-20法则，保护视力资产',
    movement: '规律运动是长期健康的基石',
  },
  ISFJ: {
    hydration: '你照顾了那么多人，现在照顾一下自己',
    eyeCare: '温柔地对待自己的眼睛，它们很辛苦',
    movement: '身体也需要你的细心呵护',
  },
  ESTJ: {
    hydration: '执行补水任务：200ml，5秒完成',
    eyeCare: '定时眼保健操，执行20-20-20法则',
    movement: '久坐警报：立即执行2分钟运动',
  },
  ESFJ: {
    hydration: '一起喝杯水吧，健康是最好的社交资本',
    eyeCare: '照顾好眼睛，才能看清你关心的每一个人',
    movement: '动起来，让自己充满活力去帮助他人',
  },
  
  // 探险家组 (SP)
  ISTP: {
    hydration: '工具需要保养，身体也是',
    eyeCare: '实测有效：20-20-20法则',
    movement: '久坐伤身，这是事实',
  },
  ISFP: {
    hydration: '像呵护艺术品一样呵护身体，从喝水开始',
    eyeCare: '让眼睛休息，美好的事物还在等着你欣赏',
    movement: '用身体感受当下这一刻的流动',
  },
  ESTP: {
    hydration: '行动派也要补给，快速喝一杯',
    eyeCare: '眼睛是你的雷达，保持最佳状态',
    movement: '该活动筋骨了，别让身体生锈',
  },
  ESFP: {
    hydration: '来杯水，让今天的精彩继续',
    eyeCare: '眼睛累了就休息，生活的美景不会跑',
    movement: '跟着感觉动起来，享受身体的律动',
  },
};

const TASK_INFO = {
  hydration: {
    label: '喝水提醒',
    icon: Droplets,
    color: '#3b9ede',
    lightColor: 'rgba(59,158,222,0.10)',
    borderColor: 'rgba(59,158,222,0.30)',
    instruction: '饮用200ml温水（约1杯）',
    science: '轻度脱水导致注意力下降17%',
    source: 'Nutrients, 2019',
  },
  eyeCare: {
    label: '眼睛休息',
    icon: Eye,
    color: '#7c5cbf',
    lightColor: 'rgba(124,92,191,0.10)',
    borderColor: 'rgba(124,92,191,0.30)',
    instruction: '20-20-20法则：看20英尺外20秒',
    science: '定时远眺减少眼疲劳52%',
    source: 'Optometry, 2018',
  },
  movement: {
    label: '身体活动',
    icon: PersonStanding,
    color: '#3aaa6e',
    lightColor: 'rgba(58,170,110,0.10)',
    borderColor: 'rgba(58,170,110,0.30)',
    instruction: '深蹲×10 + 肩颈放松',
    science: '久坐增加心血管疾病风险34%',
    source: 'Circulation, 2020',
  },
};

type TaskType = keyof typeof TASK_INFO;
type MbtiType = keyof typeof MBTI_MESSAGES;

// ─── 通知卡片组件 ─────────────────────────────────────────────────────────────

function NotificationCard({
  taskType,
  mbti,
  visible,
  onDismiss,
  cardSize = 'medium',
}: {
  taskType: TaskType;
  mbti: MbtiType;
  visible: boolean;
  onDismiss: () => void;
  cardSize?: 'small' | 'medium' | 'large';
}) {
  const task = TASK_INFO[taskType];
  const message = MBTI_MESSAGES[mbti]?.[taskType] ?? MBTI_MESSAGES.INFP[taskType];
  
  const actionTexts = ['了解啦', '谢谢关心', 'OK', '收到', '这就去'];
  const randomAction = actionTexts[Math.floor(Math.random() * actionTexts.length)];

  // Card size dimensions
  const sizeMap = {
    small: { width: 960, height: 570 },
    medium: { width: 1280, height: 760 },
    large: { width: 1600, height: 950 }
  };
  const { width, height } = sizeMap[cardSize];

  // High-quality background images (user provided 2K images) - Using local public resources
  const bgImageFiles = [
    '/copper-grass-goldfish.png',  // 铜钱草金鱼
    '/mint-photography.png',        // 薄荷摄影
    '/office-zen-green-cat.png'     // 办公室禅意绿猫
  ];
  // Random background image
  const bgImage = bgImageFiles[Math.floor(Math.random() * bgImageFiles.length)];

  return (
    <div
      style={{
        position: 'fixed',
        top: 32,
        right: 32,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <style>
        {`
          @keyframes inkWashSpread {
            0% {
              opacity: 0;
              filter: blur(30px) contrast(1.2) brightness(1.2);
              transform: scale(1.05);
            }
            40% {
              opacity: 0.6;
              filter: blur(15px) contrast(1.1) brightness(1.1);
            }
            100% {
              opacity: 1;
              filter: blur(0px) contrast(1) brightness(1);
              transform: scale(1);
            }
          }

          @keyframes inkWashText {
            0% {
              opacity: 0;
              filter: blur(12px);
              transform: translateY(10px);
            }
            40% {
              opacity: 0;
              filter: blur(12px);
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              filter: blur(0px);
              transform: translateY(0);
            }
          }

          .ink-wash-card {
            animation: inkWashSpread 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }

          .ink-wash-content {
            animation: inkWashText 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
        `}
      </style>
      <div
        className={visible ? 'ink-wash-card' : ''}
        style={{
          width,
          height,
          borderRadius: 24,
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.15)',
          fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', sans-serif",
          opacity: visible ? 1 : 0,
          filter: visible ? 'blur(0px)' : 'blur(10px)',
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          pointerEvents: 'none',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // 隐藏时的状态，避免动画结束前闪烁
          visibility: visible ? 'visible' : 'hidden',
          transition: 'visibility 2.5s, opacity 1.5s cubic-bezier(0.22, 1, 0.36, 1), filter 1.5s cubic-bezier(0.22, 1, 0.36, 1), transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* 文本框区域：毛玻璃质感，只占整个窗口的 30% */}
        <div 
          className={visible ? 'ink-wash-content' : ''}
          style={{ 
            position: 'relative', 
            zIndex: 1, 
            width: '100%', 
            height: '30%',
            padding: '40px 60px',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(20px) saturate(120%)',
            WebkitBackdropFilter: 'blur(20px) saturate(120%)',
            borderTop: '1px solid rgba(255, 255, 255, 0.4)',
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {/* 鼓励语 */}
          <p style={{ 
            fontSize: 32, lineHeight: 1.5, marginBottom: 16, 
            fontWeight: 600, letterSpacing: 1,
            color: '#1a331a',
          }}>
            {message}
          </p>

          {/* 指令框 */}
          <p style={{ 
            fontSize: 20, color: '#3a5a3a', marginBottom: 24, 
            lineHeight: 1.5, fontWeight: 400,
          }}>
            {task.instruction}
          </p>

          {/* 操作按钮 */}
          <div style={{ pointerEvents: 'auto', alignSelf: 'flex-end', marginTop: 'auto' }}>
            <button 
              onClick={onDismiss} 
              style={{
                padding: '12px 40px', background: 'rgba(255, 255, 255, 0.9)', 
                border: '1px solid rgba(150, 200, 150, 0.4)',
                borderRadius: 100, fontSize: 18, cursor: 'pointer', color: '#2c4c2c',
                fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif", 
                transition: 'all 0.3s ease', fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#8fbc8f';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.borderColor = 'rgba(150, 200, 150, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
              }}
            >
              {randomAction}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

const MBTI_LIST: MbtiType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',  // 分析师组 (NT)
  'INFJ', 'INFP', 'ENFJ', 'ENFP',  // 外交官组 (NF)
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',  // 守护者组 (SJ)
  'ISTP', 'ISFP', 'ESTP', 'ESFP',  // 探险家组 (SP)
];

type CardSize = 'small' | 'medium' | 'large';

export default function Index() {
  const [selectedTask, setSelectedTask] = useState<TaskType>('hydration');
  const [selectedMbti, setSelectedMbti] = useState<MbtiType>('INFP');
  const [selectedCardSize, setSelectedCardSize] = useState<CardSize>('medium');
  const [notifVisible, setNotifVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskType>('hydration');
  const [currentMbti, setCurrentMbti] = useState<MbtiType>('INFP');
  const [currentCardSize, setCurrentCardSize] = useState<CardSize>('medium');

  const triggerNotification = useCallback(() => {
    setCurrentTask(selectedTask);
    setCurrentMbti(selectedMbti);
    setCurrentCardSize(selectedCardSize);
    setNotifVisible(false);
    setTimeout(() => setNotifVisible(true), 80);
    setTimeout(() => setNotifVisible(false), 8000);
  }, [selectedTask, selectedMbti, selectedCardSize]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f5f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'STKaiti', 'KaiTi', '楷体', 'Source Han Serif CN', 'Noto Serif SC', serif",
    }}>
      {/* 通知卡片（始终渲染，靠 visible 控制动画） */}
      <NotificationCard
        taskType={currentTask}
        mbti={currentMbti}
        visible={notifVisible}
        onDismiss={() => setNotifVisible(false)}
        cardSize={currentCardSize}
      />

      <div style={{ 
        width: 1280, 
        height: 720, 
        background: "url('/images/glass-plant-1.png') center/cover",
        position: 'relative',
        boxShadow: '0 30px 80px rgba(0,0,0,0.1)',
        borderRadius: 24,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* 遮罩层让背景变淡 */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 40, 20, 0.65)', backdropFilter: 'blur(8px)' }} />

        <div style={{ position: 'relative', zIndex: 1, width: 800, textAlign: 'center' }}>
          {/* 标题 */}
          <div style={{ marginBottom: 60 }}>
            <h1 style={{ 
              fontSize: 48, fontWeight: 600, margin: '0 0 16px', letterSpacing: 4,
              color: '#ffffff',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}>
              青植呼吸
            </h1>
            <p style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.8)', margin: 0, letterSpacing: 2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              基于MBTI的极简健康提醒 · 沉浸式森林体验
            </p>
          </div>

          {/* 演示控制台 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(24px) saturate(150%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 24,
            padding: 40,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
          }}>
            <div style={{ display: 'flex', gap: 40, marginBottom: 40 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 18, color: '#fff', marginBottom: 20, fontWeight: 600, letterSpacing: 2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>选择提醒类型</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(Object.keys(TASK_INFO) as TaskType[]).map(t => {
                    const task = TASK_INFO[t];
                    const active = selectedTask === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setSelectedTask(t)}
                        style={{
                          padding: '12px 20px',
                          borderRadius: 12,
                          border: active ? '1px solid rgba(255, 255, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                          background: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          fontSize: 16,
                          color: active ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                          fontFamily: 'inherit',
                          letterSpacing: 2,
                          textShadow: active ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                        }}
                      >
                        {task.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ width: 1, background: 'rgba(255, 255, 255, 0.2)' }} />

              <div style={{ flex: 2 }}>
                <h2 style={{ fontSize: 18, color: '#fff', marginBottom: 20, fontWeight: 600, letterSpacing: 2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>选择 MBTI</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {MBTI_LIST.map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedMbti(m)}
                      style={{
                        padding: '10px 24px', borderRadius: 100,
                        border: selectedMbti === m ? '1px solid rgba(255, 255, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                        background: selectedMbti === m ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        color: selectedMbti === m ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                        fontSize: 16, fontFamily: 'inherit', letterSpacing: 1,
                        cursor: 'pointer', transition: 'all 0.3s',
                        textShadow: selectedMbti === m ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                
                <h2 style={{ fontSize: 18, color: '#fff', marginTop: 24, marginBottom: 20, fontWeight: 600, letterSpacing: 2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>卡片尺寸</h2>
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['small', 'medium', 'large'] as CardSize[]).map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedCardSize(size)}
                      style={{
                        padding: '10px 24px', borderRadius: 100,
                        border: selectedCardSize === size ? '1px solid rgba(255, 255, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                        background: selectedCardSize === size ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                        color: selectedCardSize === size ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                        fontSize: 16, fontFamily: 'inherit', letterSpacing: 1,
                        cursor: 'pointer', transition: 'all 0.3s',
                        textShadow: selectedCardSize === size ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                      }}
                    >
                      {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={triggerNotification}
              style={{
                width: '100%', height: 60,
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: 100, fontSize: 20,
                color: '#fff', cursor: 'pointer',
                fontFamily: 'inherit', letterSpacing: 4,
                transition: 'all 0.5s',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15), 0 0 12px rgba(150, 255, 150, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
            >
              触发森林提醒
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
