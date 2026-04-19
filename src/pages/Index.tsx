import { useState, useCallback } from 'react';
import { Droplets, Eye, PersonStanding, Play, Leaf, X, Clock, Sparkles, Shield, Palette, ChevronDown, Brain, Heart } from 'lucide-react';

// ─── 数据 ─────────────────────────────────────────────────────────────────────

const MBTI_MESSAGES: Record<string, Record<string, string>> = {
  INTJ: { hydration: '系统检测到逻辑引擎冷却液不足，建议补充200ml', eyeCare: '视觉系统过载，建议执行20秒校准程序', movement: '静态时间过长，系统性能开始下降' },
  INTP: { hydration: '大脑运算需要燃料，补充水分提升处理效率', eyeCare: '长时间专注已影响视觉精度，需要重新校准', movement: '理论证明：运动能提升认知能力27%' },
  ENTJ: { hydration: '高效领导者懂得战略性补给，现在就喝', eyeCare: '目标达成需要清晰视野，执行眼部维护', movement: '优秀的指挥官也要保持战斗力，起身活动' },
  ENTP: { hydration: '新想法：水分摄入与创意产出的相关性实验', eyeCare: '换个视角看世界，从休息眼睛开始', movement: '头脑风暴时站起来走走，灵感会加倍' },
  INFJ: { hydration: '照顾好自己，才能更好地关怀他人', eyeCare: '让眼睛看看远方，让心灵也休息一下', movement: '与身体对话，感受此刻的存在' },
  INFP: { hydration: '你滋润了那么多心灵，也记得滋润自己呀', eyeCare: '让眼睛休息，也是对自己的温柔', movement: '身体想和你一起跳支小小的舞呢' },
  ENFJ: { hydration: '给予者也需要被滋养，来喝杯水吧', eyeCare: '你关心那么多人，也该关心自己的眼睛了', movement: '带着温暖的心，让身体也感受关怀' },
  ENFP: { hydration: '喝杯水，让灵感继续冒泡吧', eyeCare: '让眼睛看看外面的精彩世界', movement: '动起来，让快乐细胞活跃起来' },
  ISTJ: { hydration: '按照健康计划：现在是补水时间', eyeCare: '遵循20-20-20法则，保护视力资产', movement: '规律运动是长期健康的基石' },
  ISFJ: { hydration: '你照顾了那么多人，现在照顾一下自己', eyeCare: '温柔地对待自己的眼睛，它们很辛苦', movement: '身体也需要你的细心呵护' },
  ESTJ: { hydration: '执行补水任务：200ml，5秒完成', eyeCare: '定时眼保健操，执行20-20-20法则', movement: '久坐警报：立即执行2分钟运动' },
  ESFJ: { hydration: '一起喝杯水吧，健康是最好的社交资本', eyeCare: '照顾好眼睛，才能看清你关心的每一个人', movement: '动起来，让自己充满活力去帮助他人' },
  ISTP: { hydration: '工具需要保养，身体也是', eyeCare: '实测有效：20-20-20法则', movement: '久坐伤身，这是事实' },
  ISFP: { hydration: '像呵护艺术品一样呵护身体，从喝水开始', eyeCare: '让眼睛休息，美好的事物还在等着你欣赏', movement: '用身体感受当下这一刻的流动' },
  ESTP: { hydration: '行动派也要补给，快速喝一杯', eyeCare: '眼睛是你的雷达，保持最佳状态', movement: '该活动筋骨了，别让身体生锈' },
  ESFP: { hydration: '来杯水，让今天的精彩继续', eyeCare: '眼睛累了就休息，生活的美景不会跑', movement: '跟着感觉动起来，享受身体的律动' },
};

const TASK_INFO = {
  hydration: { label: '喝水提醒', icon: Droplets, color: '#3b9ede', instruction: '饮用200ml温水（约1杯）', science: '轻度脱水导致注意力下降17%', source: 'Nutrients, 2019' },
  eyeCare: { label: '眼睛休息', icon: Eye, color: '#7c5cbf', instruction: '20-20-20法则：看20英尺外20秒', science: '定时远眺减少眼疲劳52%', source: 'Optometry, 2018' },
  movement: { label: '身体活动', icon: PersonStanding, color: '#3aaa6e', instruction: '深蹲x10 + 肩颈放松', science: '久坐增加心血管疾病风险34%', source: 'Circulation, 2020' },
};

type TaskType = keyof typeof TASK_INFO;
type MbtiType = keyof typeof MBTI_MESSAGES;
type CardSize = 'small' | 'medium' | 'large';

const MBTI_LIST: MbtiType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const FONT = "'Microsoft YaHei', 'PingFang SC', sans-serif";

// ─── 提醒卡片预览（缩小版） ───────────────────────────────────────────────────

function MiniNotificationCard({ taskType, mbti, visible, onDismiss, cardSize = 'medium' }: {
  taskType: TaskType; mbti: MbtiType; visible: boolean; onDismiss: () => void; cardSize?: CardSize;
}) {
  const task = TASK_INFO[taskType];
  const message = MBTI_MESSAGES[mbti]?.[taskType] ?? MBTI_MESSAGES.INFP[taskType];
  const actionTexts = ['了解啦', '谢谢关心', 'OK', '收到', '这就去'];
  const randomAction = actionTexts[Math.floor(Math.random() * actionTexts.length)];
  const sizeMap = { small: { width: 960, height: 570 }, medium: { width: 1280, height: 760 }, large: { width: 1600, height: 950 } };
  const { width, height } = sizeMap[cardSize];
  const builtInBgImages = ['/images/copper-grass-goldfish.png', '/images/mint-photography.png', '/images/office-zen-green-cat.png'];
  const bgImage = builtInBgImages[Math.floor(Math.random() * builtInBgImages.length)];

  return (
    <div style={{ position: 'fixed', top: 32, right: 32, zIndex: 9999, pointerEvents: 'none' }}>
      <style>{`
        @keyframes inkWashSpread { 0% { opacity:0; filter:blur(30px) contrast(1.2) brightness(1.2); transform:scale(1.05); } 40% { opacity:0.6; filter:blur(15px) contrast(1.1) brightness(1.1); } 100% { opacity:1; filter:blur(0) contrast(1) brightness(1); transform:scale(1); } }
        @keyframes inkWashText { 0% { opacity:0; filter:blur(12px); transform:translateY(10px); } 40% { opacity:0; filter:blur(12px); transform:translateY(10px); } 100% { opacity:1; filter:blur(0); transform:translateY(0); } }
        .ink-wash-card { animation: inkWashSpread 2.5s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ink-wash-content { animation: inkWashText 2.5s cubic-bezier(0.22,1,0.36,1) forwards; }
      `}</style>
      <div className={visible ? 'ink-wash-card' : ''} style={{
        width, height, borderRadius: 24, boxShadow: '0 30px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.15)', fontFamily: FONT,
        opacity: visible ? 1 : 0, filter: visible ? 'blur(0)' : 'blur(10px)', transform: visible ? 'scale(1)' : 'scale(0.95)',
        pointerEvents: 'none', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        backgroundImage: `url('${bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center',
        visibility: visible ? 'visible' : 'hidden', transition: 'visibility 2.5s, opacity 1.5s cubic-bezier(0.22,1,0.36,1), filter 1.5s, transform 1.5s',
      }}>
        <div className={visible ? 'ink-wash-content' : ''} style={{
          position: 'relative', zIndex: 1, width: '100%', height: '30%', padding: '40px 60px',
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(120%)', WebkitBackdropFilter: 'blur(24px) saturate(120%)',
          borderTop: '1px solid rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <p style={{ fontSize: 32, lineHeight: 1.5, marginBottom: 16, fontWeight: 600, letterSpacing: 1, color: '#134e6f' }}>{message}</p>
          <p style={{ fontSize: 20, color: '#38c9a3', marginBottom: 24, lineHeight: 1.5, fontWeight: 500 }}>{task.instruction}</p>
          <div style={{ pointerEvents: 'auto', alignSelf: 'flex-end', marginTop: 'auto' }}>
            <button onClick={onDismiss} style={{
              padding: '12px 40px', background: '#38c9a3', border: 'none', borderRadius: 100, fontSize: 18, cursor: 'pointer', color: '#fff',
              fontFamily: FONT, transition: 'all 0.3s', fontWeight: 600, boxShadow: '0 4px 12px rgba(56,201,163,0.3)',
            }}>{randomAction}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

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

  const features = [
    { icon: Droplets, title: '智能饮水', desc: '根据你的工作节奏，温柔提醒补充水分。每次200ml，保持全天最佳状态。', color: '#3b9ede' },
    { icon: Eye, title: '视力守护', desc: '遵循科学的20-20-20法则，每20分钟看20英尺外20秒，有效缓解眼疲劳。', color: '#7c5cbf' },
    { icon: PersonStanding, title: '活力唤醒', desc: '久坐提醒，配合简单的拉伸动作，让身体在工作间隙重获能量。', color: '#3aaa6e' },
  ];

  const highlights = [
    { icon: Brain, title: '16种MBTI性格', desc: '专属的鼓励文案，用你最能接受的方式传递关怀' },
    { icon: Palette, title: '水墨晕开动画', desc: '独创的CSS水墨渐显特效，每次提醒都是一次视觉享受' },
    { icon: Shield, title: '完全隐私', desc: '零数据上传，所有配置和记录仅存储在本地浏览器中' },
    { icon: Sparkles, title: '沉浸式美学', desc: '精选高清背景图，毛玻璃文字区域，深海森林设计语言' },
  ];

  return (
    <div style={{ fontFamily: FONT, background: '#0a1e2e', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* 通知卡片 */}
      <MiniNotificationCard taskType={currentTask} mbti={currentMbti} visible={notifVisible} onDismiss={() => setNotifVisible(false)} cardSize={currentCardSize} />

      {/* ───── Hero Section ───── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* 背景图 + 遮罩 */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/images/bg-options.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,30,46,0.85) 0%, rgba(10,30,46,0.6) 50%, rgba(10,30,46,0.95) 100%)' }} />

        {/* 装饰光晕 */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,201,163,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,158,222,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800, padding: '0 24px' }}>
          {/* Logo */}
          <img src="/images/logo-greenbreathe.png" alt="GreenBreathe" style={{ width: 200, margin: '0 auto 32px', display: 'block', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }} />

          <h1 style={{ fontSize: 64, fontWeight: 800, margin: '0 0 20px', letterSpacing: 6, lineHeight: 1.2, background: 'linear-gradient(135deg, #ffffff 0%, #38c9a3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            青植呼吸
          </h1>
          <p style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)', margin: '0 0 12px', letterSpacing: 3, fontWeight: 300 }}>
            GreenBreathe
          </p>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', margin: '0 0 48px', lineHeight: 1.8, maxWidth: 560, marginInline: 'auto' }}>
            在快节奏的数字生活中，为你提供片刻的宁静。基于 MBTI 性格的极简健康提醒，通过水墨晕开动画与专属文案，温柔地陪伴你的每一天。
          </p>

          {/* CTA 按钮 */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#demo" style={{
              padding: '16px 48px', background: 'linear-gradient(135deg, #38c9a3, #2eb391)', borderRadius: 100, fontSize: 18, color: '#fff',
              textDecoration: 'none', fontWeight: 600, letterSpacing: 2, boxShadow: '0 8px 32px rgba(56,201,163,0.4)', transition: 'all 0.3s',
            }}>
              体验演示
            </a>
            <a href="#features" style={{
              padding: '16px 48px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 100, fontSize: 18, color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontWeight: 500, letterSpacing: 2, transition: 'all 0.3s',
            }}>
              了解更多
            </a>
          </div>
        </div>

        {/* 向下滚动指示 */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', opacity: 0.4, animation: 'bounce 2s infinite' }}>
          <ChevronDown size={32} />
        </div>
        <style>{`@keyframes bounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(10px); } }`}</style>
      </section>

      {/* ───── Features Section ───── */}
      <section id="features" style={{ padding: '120px 24px', background: 'linear-gradient(180deg, #0a1e2e 0%, #0d2a3d 100%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p style={{ fontSize: 14, color: '#38c9a3', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Core Features</p>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 20px', letterSpacing: 2 }}>三大核心关怀</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', maxWidth: 500, margin: '0 auto', lineHeight: 1.8 }}>
              科学研究表明，定时休息能显著提升工作效率和身心健康
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{
                  padding: '48px 36px', borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.4s', cursor: 'default', position: 'relative', overflow: 'hidden',
                }}>
                  {/* 顶部装饰线 */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`, opacity: 0.6 }} />
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
                    <Icon size={32} style={{ color: f.color }} />
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 16px', letterSpacing: 1 }}>{f.title}</h3>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: 0 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Highlights Section ───── */}
      <section style={{ padding: '120px 24px', background: '#0d2a3d', position: 'relative' }}>
        {/* 装饰 */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,201,163,0.04) 0%, transparent 70%)' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p style={{ fontSize: 14, color: '#38c9a3', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Why GreenBreathe</p>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 20px', letterSpacing: 2 }}>为什么选择青植呼吸</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} style={{
                  padding: '36px 40px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', gap: 24, alignItems: 'flex-start', transition: 'all 0.3s',
                }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(56,201,163,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={24} style={{ color: '#38c9a3' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px', letterSpacing: 1 }}>{h.title}</h3>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── MBTI Preview Section ───── */}
      <section style={{ padding: '120px 24px', background: 'linear-gradient(180deg, #0d2a3d 0%, #0a1e2e 100%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 14, color: '#38c9a3', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Personality Driven</p>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 20px', letterSpacing: 2 }}>MBTI 性格驱动</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto', lineHeight: 1.8 }}>
              16种性格类型，每种都有独特的鼓励方式。不再是千篇一律的提醒，而是真正懂你的温柔关怀。
            </p>
          </div>

          {/* MBTI 性格卡片网格 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {MBTI_LIST.map(m => {
              const groups: Record<string, { label: string; color: string }> = {
                NT: { label: '分析师', color: '#7c5cbf' }, NF: { label: '外交官', color: '#38c9a3' },
                SJ: { label: '守护者', color: '#3b9ede' }, SP: { label: '探险家', color: '#e8a838' },
              };
              const groupKey = (m.includes('N') ? 'N' : 'S') + (m.includes('T') ? 'T' : (m.includes('F') ? (m.includes('N') ? 'F' : 'J') : 'J'));
              // Simplify: NT, NF, SJ, SP
              const gk = m[1] === 'N' ? (m[2] === 'T' ? 'NT' : 'NF') : (m[3] === 'J' ? 'SJ' : 'SP');
              const group = groups[gk];
              return (
                <div key={m} style={{
                  padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'center', transition: 'all 0.3s', cursor: 'default',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>{m}</div>
                  <div style={{ fontSize: 12, color: group.color, fontWeight: 600, letterSpacing: 1 }}>{group.label}</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 12, lineHeight: 1.6, margin: '12px 0 0' }}>
                    {MBTI_MESSAGES[m].hydration.length > 18 ? MBTI_MESSAGES[m].hydration.slice(0, 18) + '...' : MBTI_MESSAGES[m].hydration}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Interactive Demo Section ───── */}
      <section id="demo" style={{ padding: '120px 24px', background: '#0a1e2e', position: 'relative' }}>
        {/* 背景装饰 */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(56,201,163,0.3), transparent)' }} />

        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 14, color: '#38c9a3', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Live Demo</p>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 20px', letterSpacing: 2 }}>在线体验</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
              选择你的 MBTI 性格和提醒类型，点击按钮即可预览真实的通知卡片效果
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: 48,
            backdropFilter: 'blur(20px)',
          }}>
            {/* 提醒类型 */}
            <div style={{ marginBottom: 36 }}>
              <h3 style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontWeight: 500, letterSpacing: 2 }}>提醒类型</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                {(Object.keys(TASK_INFO) as TaskType[]).map(t => {
                  const task = TASK_INFO[t];
                  const active = selectedTask === t;
                  const Icon = task.icon;
                  return (
                    <button key={t} onClick={() => setSelectedTask(t)} style={{
                      flex: 1, padding: '16px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center',
                      border: active ? '1px solid rgba(56,201,163,0.6)' : '1px solid rgba(255,255,255,0.1)',
                      background: active ? 'rgba(56,201,163,0.12)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer', transition: 'all 0.3s', fontSize: 16, fontFamily: FONT,
                      color: active ? '#38c9a3' : 'rgba(255,255,255,0.5)', fontWeight: active ? 600 : 400,
                    }}>
                      <Icon size={20} />
                      {task.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MBTI 选择 */}
            <div style={{ marginBottom: 36 }}>
              <h3 style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontWeight: 500, letterSpacing: 2 }}>MBTI 性格</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {MBTI_LIST.map(m => (
                  <button key={m} onClick={() => setSelectedMbti(m)} style={{
                    padding: '10px 22px', borderRadius: 100,
                    border: selectedMbti === m ? '1px solid rgba(56,201,163,0.6)' : '1px solid rgba(255,255,255,0.08)',
                    background: selectedMbti === m ? 'rgba(56,201,163,0.12)' : 'transparent',
                    color: selectedMbti === m ? '#38c9a3' : 'rgba(255,255,255,0.45)',
                    fontSize: 14, fontFamily: FONT, letterSpacing: 1, cursor: 'pointer', transition: 'all 0.3s',
                    fontWeight: selectedMbti === m ? 600 : 400,
                  }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* 卡片尺寸 */}
            <div style={{ marginBottom: 40 }}>
              <h3 style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontWeight: 500, letterSpacing: 2 }}>卡片尺寸</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['small', 'medium', 'large'] as CardSize[]).map(size => (
                  <button key={size} onClick={() => setSelectedCardSize(size)} style={{
                    padding: '10px 28px', borderRadius: 100,
                    border: selectedCardSize === size ? '1px solid rgba(56,201,163,0.6)' : '1px solid rgba(255,255,255,0.08)',
                    background: selectedCardSize === size ? 'rgba(56,201,163,0.12)' : 'transparent',
                    color: selectedCardSize === size ? '#38c9a3' : 'rgba(255,255,255,0.45)',
                    fontSize: 14, fontFamily: FONT, cursor: 'pointer', transition: 'all 0.3s',
                    fontWeight: selectedCardSize === size ? 600 : 400,
                  }}>
                    {size === 'small' ? '小 800x450' : size === 'medium' ? '中 1024x576' : '大 1280x720'}
                  </button>
                ))}
              </div>
            </div>

            {/* 预览文案 */}
            <div style={{ padding: '24px 28px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 32 }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 8, letterSpacing: 1 }}>当前文案预览</p>
              <p style={{ fontSize: 18, color: '#fff', fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
                "{MBTI_MESSAGES[selectedMbti]?.[selectedTask]}"
              </p>
            </div>

            {/* 触发按钮 */}
            <button onClick={triggerNotification} style={{
              width: '100%', padding: '18px 0', borderRadius: 100, fontSize: 18, fontWeight: 600, letterSpacing: 4, cursor: 'pointer',
              background: 'linear-gradient(135deg, #38c9a3, #2eb391)', border: 'none', color: '#fff', fontFamily: FONT,
              boxShadow: '0 8px 32px rgba(56,201,163,0.35)', transition: 'all 0.3s',
            }}>
              <Play size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
              触发提醒演示
            </button>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer style={{ padding: '60px 24px', background: '#081620', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          <Leaf size={20} style={{ color: '#38c9a3' }} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: 2 }}>青植呼吸 GreenBreathe</span>
        </div>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.8 }}>
          一款关注身心健康的 Chrome 扩展 · 基于 MBTI 的个性化提醒体验
        </p>
        <div style={{ marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>
          Made with <Heart size={14} style={{ display: 'inline', verticalAlign: 'middle', color: '#38c9a3' }} /> by GreenBreathe Team
        </div>
      </footer>
    </div>
  );
}
