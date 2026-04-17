import { useState, useCallback } from 'react';
import { Droplets, Eye, PersonStanding, Play, Leaf, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── 数据 ─────────────────────────────────────────────────────────────────────

const MBTI_MESSAGES: Record<string, Record<string, string>> = {
  INTJ: {
    hydration: '系统检测到逻辑引擎冷却液不足，建议补充200ml',
    eyeCare: '视觉系统过载，建议执行20秒校准程序',
    movement: '静态时间过长，系统性能开始下降',
  },
  INFP: {
    hydration: '你滋润了那么多心灵，也记得滋润自己呀',
    eyeCare: '让眼睛休息，也是对自己的温柔',
    movement: '身体想和你一起跳支小小的舞呢',
  },
  ESTJ: {
    hydration: '执行补水任务：200ml，5秒完成',
    eyeCare: '定时眼保健操，执行20-20-20法则',
    movement: '久坐警报：立即执行2分钟运动',
  },
  ENFP: {
    hydration: '喝杯水，让灵感继续冒泡吧',
    eyeCare: '让眼睛看看外面的精彩世界',
    movement: '动起来，让快乐细胞活跃起来',
  },
  ISTP: {
    hydration: '工具需要保养，身体也是',
    eyeCare: '实测有效：20-20-20法则',
    movement: '久坐伤身，这是事实',
  },
  INFJ: {
    hydration: '照顾好自己，才能更好地关怀他人',
    eyeCare: '让眼睛看看远方，让心灵也休息一下',
    movement: '与身体对话，感受此刻的存在',
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
}: {
  taskType: TaskType;
  mbti: MbtiType;
  visible: boolean;
  onDismiss: () => void;
}) {
  const task = TASK_INFO[taskType];
  const message = MBTI_MESSAGES[mbti]?.[taskType] ?? MBTI_MESSAGES.INFP[taskType];
  
  const actionTexts = ['了解啦', '谢谢关心', 'OK', '收到', '这就去'];
  const randomAction = actionTexts[Math.floor(Math.random() * actionTexts.length)];

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
      <div
        style={{
          width: 420,
          minHeight: 240,
          background: 'rgba(15, 40, 20, 0.45)',
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          borderRadius: 20,
          padding: '40px 32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.15), inset 0 0 20px rgba(100, 200, 100, 0.05)',
          border: '1px solid rgba(150, 220, 150, 0.15)',
          fontFamily: "'STKaiti', 'KaiTi', '楷体', 'Source Han Serif CN', 'Noto Serif SC', serif",
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          opacity: visible ? 1 : 0,
          filter: visible ? 'blur(0)' : 'blur(10px)',
          transition: 'all 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
          pointerEvents: 'none',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        {/* 森林风景画背景 */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: "url('https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/9c20.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
          mixBlendMode: 'overlay',
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* 鼓励语 - 文字透出背景效果 */}
          <p style={{ 
            fontSize: 26, lineHeight: 1.5, marginBottom: 24, 
            fontWeight: 600, letterSpacing: 2,
            backgroundImage: "url('https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/9c20.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            color: 'transparent',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))',
          }}>
            {message}
          </p>

          {/* 指令框 */}
          <p style={{ 
            fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', marginBottom: 32, 
            letterSpacing: 1.5, textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            fontFamily: "'Source Han Sans CN', 'Noto Sans SC', sans-serif",
            fontWeight: 300,
          }}>
            {task.instruction}
          </p>

          {/* 操作按钮 */}
          <div style={{ pointerEvents: 'auto', alignSelf: 'flex-end' }}>
            <button 
              onClick={onDismiss} 
              style={{
                padding: '10px 32px', background: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 100, fontSize: 15, cursor: 'pointer', color: '#fff',
                fontFamily: "'Source Han Sans CN', 'Noto Sans SC', sans-serif", 
                letterSpacing: 2, transition: 'all 0.4s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15), 0 0 12px rgba(150, 255, 150, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
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

const MBTI_LIST: MbtiType[] = ['INTJ', 'INFP', 'ESTJ', 'ENFP', 'ISTP', 'INFJ'];

export default function Index() {
  const [selectedTask, setSelectedTask] = useState<TaskType>('hydration');
  const [selectedMbti, setSelectedMbti] = useState<MbtiType>('INFP');
  const [notifVisible, setNotifVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskType>('hydration');
  const [currentMbti, setCurrentMbti] = useState<MbtiType>('INFP');

  const triggerNotification = useCallback(() => {
    setCurrentTask(selectedTask);
    setCurrentMbti(selectedMbti);
    setNotifVisible(false);
    setTimeout(() => setNotifVisible(true), 80);
    setTimeout(() => setNotifVisible(false), 8000);
  }, [selectedTask, selectedMbti]);

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
      />

      <div style={{ 
        width: 1280, 
        height: 720, 
        background: "url('https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/9c20.png') center/cover",
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
              backgroundImage: "url('https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/9c20.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              color: 'transparent',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.9))',
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
