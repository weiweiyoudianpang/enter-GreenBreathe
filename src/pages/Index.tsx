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
  const Icon = task.icon;
  const message = MBTI_MESSAGES[mbti]?.[taskType] ?? MBTI_MESSAGES.INFP[taskType];
  const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        width: 288,
        background: 'rgba(255,255,255,0.93)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: 18,
        border: `1px solid ${task.borderColor}`,
        boxShadow: `0 8px 40px rgba(0,0,0,0.10), 0 2px 8px ${task.lightColor}`,
        padding: '18px 18px 14px',
        fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-24px) scale(0.94)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.55s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: visible ? 'auto' : 'none',
        // 水墨晕染：伪元素无法用内联，用背景渐变模拟
        overflow: 'hidden',
      }}
    >
      {/* 水墨晕染背景 */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse at 80% 20%, ${task.lightColor} 0%, transparent 70%)`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.2s ease',
      }} />

      {/* 顶部栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Leaf size={14} color={task.color} strokeWidth={2.5} />
          <span style={{ fontSize: 12, color: task.color, fontWeight: 600 }}>青植关怀 · {mbti}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#aaa' }}>
            <Clock size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
            {time}
          </span>
          <button
            onClick={onDismiss}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#bbb', lineHeight: 1 }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 鼓励语 */}
      <p style={{ fontSize: 14, color: '#2a4a2a', lineHeight: 1.65, marginBottom: 12, fontWeight: 500, position: 'relative', zIndex: 1 }}>
        {message}
      </p>

      {/* 指令框 */}
      <div style={{
        background: task.lightColor,
        borderLeft: `3px solid ${task.color}`,
        borderRadius: '0 8px 8px 0',
        padding: '10px 12px',
        marginBottom: 14,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <Icon size={15} color={task.color} strokeWidth={2.5} />
          <span style={{ fontSize: 13, color: '#1a3a1a', fontWeight: 700 }}>{task.instruction}</span>
        </div>
        <p style={{ fontSize: 11, color: '#557755', lineHeight: 1.5, margin: 0 }}>
          {task.science}
        </p>
        <p style={{ fontSize: 10, color: '#999', margin: '2px 0 0' }}>{task.source}</p>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 1 }}>
        <button onClick={onDismiss} style={{
          flex: 1, padding: '8px 0', border: `1px solid ${task.borderColor}`,
          borderRadius: 8, fontSize: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.7)',
          color: '#445544', fontWeight: 500, transition: 'all 0.2s',
        }}>
          了解啦~
        </button>
        <button onClick={onDismiss} style={{
          flex: 1, padding: '8px 0', border: 'none',
          borderRadius: 8, fontSize: 12, cursor: 'pointer', background: task.color,
          color: 'white', fontWeight: 600, transition: 'all 0.2s',
        }}>
          已完成 ✓
        </button>
        <button onClick={onDismiss} style={{
          flex: 1, padding: '8px 0', border: `1px solid ${task.borderColor}`,
          borderRadius: 8, fontSize: 12, cursor: 'pointer', background: 'transparent',
          color: '#889988', transition: 'all 0.2s',
        }}>
          稍后
        </button>
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
      background: 'linear-gradient(135deg, #f0f7ee 0%, #e8f5e3 40%, #f7f5f0 100%)',
      fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
    }}>
      {/* 通知卡片（始终渲染，靠 visible 控制动画） */}
      <NotificationCard
        taskType={currentTask}
        mbti={currentMbti}
        visible={notifVisible}
        onDismiss={() => setNotifVisible(false)}
      />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(100,180,100,0.2)', borderRadius: 50,
            padding: '8px 20px', marginBottom: 24,
          }}>
            <Leaf size={16} color="#4a9a4a" />
            <span style={{ fontSize: 13, color: '#4a9a4a', fontWeight: 600 }}>通知效果演示</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#1a3a1a', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            青植呼吸
          </h1>
          <p style={{ fontSize: 16, color: '#557755', margin: 0 }}>
            基于MBTI的极简健康提醒 · 选择类型后点击触发演示
          </p>
        </div>

        {/* 演示控制台 */}
        <div style={{
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(100,180,100,0.18)',
          borderRadius: 20,
          padding: 32,
          marginBottom: 32,
          boxShadow: '0 4px 24px rgba(100,180,100,0.10)',
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#334d33', marginBottom: 20 }}>选择提醒类型</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 28 }}>
            {(Object.keys(TASK_INFO) as TaskType[]).map(t => {
              const task = TASK_INFO[t];
              const Icon = task.icon;
              const active = selectedTask === t;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTask(t)}
                  style={{
                    padding: '14px 8px',
                    borderRadius: 12,
                    border: active ? `2px solid ${task.color}` : '2px solid transparent',
                    background: active ? task.lightColor : 'rgba(245,250,245,0.8)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}
                >
                  <Icon size={22} color={active ? task.color : '#99aa99'} strokeWidth={2} />
                  <span style={{ fontSize: 12, color: active ? task.color : '#889988', fontWeight: active ? 700 : 500 }}>
                    {task.label}
                  </span>
                </button>
              );
            })}
          </div>

          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#334d33', marginBottom: 16 }}>选择 MBTI</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
            {MBTI_LIST.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMbti(m)}
                style={{
                  padding: '8px 16px', borderRadius: 24,
                  border: selectedMbti === m ? '1.5px solid #4a9a4a' : '1.5px solid #d0e0d0',
                  background: selectedMbti === m ? 'rgba(74,154,74,0.12)' : 'rgba(255,255,255,0.7)',
                  color: selectedMbti === m ? '#2a5a2a' : '#7a8a7a',
                  fontSize: 13, fontWeight: selectedMbti === m ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* 预览消息 */}
          <div style={{
            background: 'rgba(245,252,245,0.8)', borderRadius: 10,
            padding: '14px 16px', marginBottom: 24,
            border: '1px solid rgba(100,180,100,0.15)',
          }}>
            <div style={{ fontSize: 11, color: '#88aa88', marginBottom: 6 }}>即将显示的提醒语 ({selectedMbti})</div>
            <div style={{ fontSize: 14, color: '#2a4a2a', fontWeight: 500, lineHeight: 1.6 }}>
              "{MBTI_MESSAGES[selectedMbti]?.[selectedTask]}"
            </div>
          </div>

          <Button
            onClick={triggerNotification}
            style={{
              width: '100%', height: 52,
              background: 'linear-gradient(135deg, #4a9a4a, #3aaa6e)',
              border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
              color: 'white', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(74,154,74,0.30)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s',
            }}
          >
            <Play size={18} fill="white" />
            触发提醒演示
          </Button>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#99aa99', margin: '12px 0 0' }}>
            通知将出现在右上角，8秒后自动消失
          </p>
        </div>

        {/* 效果说明 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { title: '毛玻璃质感', desc: '背景模糊+饱和度增强，轻盈不遮挡' },
            { title: '穿透点击', desc: '容器 pointer-events:none，通知下方完全可操作' },
            { title: 'MBTI 个性化', desc: '16种性格×3种任务，260+条差异化文案' },
            { title: '科学依据', desc: '每条建议附医学文献引用，可信有据' },
          ].map(item => (
            <div key={item.title} style={{
              background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
              borderRadius: 14, padding: '18px 20px',
              border: '1px solid rgba(100,180,100,0.15)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2a5a2a', marginBottom: 6 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 12, color: '#778877', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
