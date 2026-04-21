import { useState, useCallback, useMemo, useEffect } from 'react';
import { Droplets, Eye, PersonStanding, Play, Leaf, Sparkles, Shield, Palette, ChevronDown, Brain, Heart, Sun, Moon, SunMoon, Github, MessageCircle, Pen } from 'lucide-react';
import { getTheme, resolveTheme, defaultBackgrounds, ThemeColors } from '@/lib/theme';
import { ThemeMode } from '@/types/extension';
import InkWashCanvas from '@/components/InkWashCanvas';

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

// ─── Theme-aware style helpers ──────────────────────────────────────────────

function getPageStyles(t: ThemeColors, isDay: boolean) {
  const textPrimary = isDay ? '#064e3b' : '#ffffff';
  const textSecondary = isDay ? 'rgba(6,78,59,0.6)' : 'rgba(255,255,255,0.5)';
  const textTertiary = isDay ? 'rgba(6,78,59,0.4)' : 'rgba(255,255,255,0.35)';
  const cardBg = isDay ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.04)';
  const cardBorder = isDay ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.08)';
  const controlBg = isDay ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.04)';
  const controlBorder = isDay ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)';
  const accentColor = isDay ? '#059669' : '#38c9a3';
  const activeBg = isDay ? 'rgba(16,185,129,0.12)' : 'rgba(56,201,163,0.12)';
  const activeBorder = isDay ? 'rgba(16,185,129,0.5)' : 'rgba(56,201,163,0.6)';
  const inactiveText = isDay ? 'rgba(6,78,59,0.5)' : 'rgba(255,255,255,0.45)';
  const sectionBg1 = isDay ? 'linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%)' : 'linear-gradient(180deg, #0a1e2e 0%, #0d2a3d 100%)';
  const sectionBg2 = isDay ? '#ecfdf5' : '#0d2a3d';
  const sectionBg3 = isDay ? 'linear-gradient(180deg, #ecfdf5 0%, #f0fdf4 100%)' : 'linear-gradient(180deg, #0d2a3d 0%, #0a1e2e 100%)';
  const pageBg = isDay ? '#f0fdf4' : '#0a1e2e';
  const footerBg = isDay ? '#e6f7ed' : '#081620';
  const heroOverlay = isDay
    ? 'linear-gradient(180deg, rgba(240,253,244,0.88) 0%, rgba(240,253,244,0.65) 50%, rgba(240,253,244,0.95) 100%)'
    : 'linear-gradient(180deg, rgba(10,30,46,0.85) 0%, rgba(10,30,46,0.6) 50%, rgba(10,30,46,0.95) 100%)';
  const ctaBtnBg = isDay
    ? 'linear-gradient(135deg, #10b981, #059669)'
    : 'linear-gradient(135deg, #38c9a3, #2eb391)';
  const ctaBtnShadow = isDay ? '0 8px 32px rgba(16,185,129,0.3)' : '0 8px 32px rgba(56,201,163,0.4)';
  const ghostBtnBg = isDay ? 'rgba(6,78,59,0.06)' : 'rgba(255,255,255,0.08)';
  const ghostBtnBorder = isDay ? 'rgba(6,78,59,0.15)' : 'rgba(255,255,255,0.2)';
  const ghostBtnColor = isDay ? 'rgba(6,78,59,0.8)' : 'rgba(255,255,255,0.9)';
  const glowOrb1 = isDay ? 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(56,201,163,0.15) 0%, transparent 70%)';
  const glowOrb2 = isDay ? 'radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59,158,222,0.12) 0%, transparent 70%)';
  const topLine = isDay ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.08)';
  const decorLine = isDay ? `linear-gradient(90deg, transparent, ${accentColor}50, transparent)` : 'linear-gradient(90deg, transparent, rgba(56,201,163,0.3), transparent)';
  const mbtiGroupColors = isDay
    ? { NT: '#6d49b0', NF: '#059669', SJ: '#2b7fc2', SP: '#c07f20' }
    : { NT: '#7c5cbf', NF: '#38c9a3', SJ: '#3b9ede', SP: '#e8a838' };

  return {
    textPrimary, textSecondary, textTertiary, cardBg, cardBorder, controlBg, controlBorder,
    accentColor, activeBg, activeBorder, inactiveText,
    sectionBg1, sectionBg2, sectionBg3, pageBg, footerBg,
    heroOverlay, ctaBtnBg, ctaBtnShadow,
    ghostBtnBg, ghostBtnBorder, ghostBtnColor,
    glowOrb1, glowOrb2, topLine, decorLine, mbtiGroupColors,
  };
}

// ─── 提醒卡片预览（缩小版） ───────────────────────────────────────────────────

function MiniNotificationCard({ taskType, mbti, visible, onDismiss, cardSize = 'medium', themeMode = 'auto' }: {
  taskType: TaskType; mbti: MbtiType; visible: boolean; onDismiss: () => void; cardSize?: CardSize; themeMode?: ThemeMode;
}) {
  const task = TASK_INFO[taskType];
  const message = MBTI_MESSAGES[mbti]?.[taskType] ?? MBTI_MESSAGES.INFP[taskType];
  const actionTexts = ['了解啦', '谢谢关心', 'OK', '收到', '这就去'];
  const randomAction = useMemo(() => actionTexts[Math.floor(Math.random() * actionTexts.length)], [visible]);
  const sizeMap = { small: { width: 960, height: 570 }, medium: { width: 1280, height: 760 }, large: { width: 1600, height: 950 } };
  const { width, height } = sizeMap[cardSize];
  const effectiveTheme = resolveTheme(themeMode);
  const t = getTheme(themeMode);
  const bgFiles = defaultBackgrounds[effectiveTheme];
  const bgImage = useMemo(() => `/images/${effectiveTheme}/${bgFiles[Math.floor(Math.random() * bgFiles.length)]}`, [visible, effectiveTheme]);
  const [inkDone, setInkDone] = useState(false);

  // Reset ink state when card becomes visible
  useEffect(() => {
    if (visible) setInkDone(false);
  }, [visible]);

  const handleInkComplete = useCallback(() => setInkDone(true), []);

  return (
    <div style={{ position: 'fixed', top: 32, right: 32, zIndex: 9999, pointerEvents: 'none' }}>
      <div style={{
        width, height, borderRadius: 24,
        fontFamily: FONT,
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
        position: 'relative',
        overflow: 'hidden',
        visibility: visible ? 'visible' : 'hidden',
        transition: 'visibility 0.3s, opacity 0.3s',
        transform: visible ? 'scale(1)' : 'scale(0.96)',
        mixBlendMode: 'multiply',
      }}>
        {/* Canvas ink wash: paint mode - transparent background, image painted in */}
        {visible && (
          <InkWashCanvas
            mode="paint"
            imageSrc={bgImage}
            speed={1.2}
            onComplete={handleInkComplete}
            style={{ zIndex: 1, borderRadius: 24 }}
          />
        )}
        {/* Content */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', padding: '40px 60px',
          background: t.notifContentBg, backdropFilter: 'blur(28px) saturate(150%)', WebkitBackdropFilter: 'blur(28px) saturate(150%)',
          borderTop: t.notifContentBorder, display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 3,
          opacity: inkDone ? 1 : 0,
          transform: inkDone ? 'translateY(0)' : 'translateY(16px)',
          filter: inkDone ? 'blur(0)' : 'blur(6px)',
          transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)',
          borderRadius: '0 0 24px 24px',
        }}>
          <p style={{ fontSize: 32, lineHeight: 1.5, marginBottom: 16, fontWeight: 600, letterSpacing: 1, color: t.notifTitle }}>{message}</p>
          <p style={{ fontSize: 20, color: t.notifSubtitle, marginBottom: 24, lineHeight: 1.5, fontWeight: 500 }}>{task.instruction}</p>
          <div style={{ pointerEvents: 'auto', alignSelf: 'flex-end', marginTop: 'auto' }}>
            <button onClick={onDismiss} style={{
              padding: '12px 40px', background: t.notifBtnBg, border: 'none', borderRadius: 100, fontSize: 18, cursor: 'pointer', color: t.notifBtnColor,
              fontFamily: FONT, transition: 'all 0.3s', fontWeight: 600, boxShadow: `0 4px 12px ${t.accentGlow}`,
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
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [notifVisible, setNotifVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskType>('hydration');
  const [currentMbti, setCurrentMbti] = useState<MbtiType>('INFP');
  const [currentCardSize, setCurrentCardSize] = useState<CardSize>('medium');
  const [currentThemeMode, setCurrentThemeMode] = useState<ThemeMode>('auto');

  const effectiveTheme = resolveTheme(themeMode);
  const isDay = effectiveTheme === 'day';
  const t = getTheme(themeMode);
  const s = getPageStyles(t, isDay);

  const triggerNotification = useCallback(() => {
    setCurrentTask(selectedTask);
    setCurrentMbti(selectedMbti);
    setCurrentCardSize(selectedCardSize);
    setCurrentThemeMode(themeMode);
    setNotifVisible(false);
    setTimeout(() => setNotifVisible(true), 80);
    setTimeout(() => setNotifVisible(false), 8000);
  }, [selectedTask, selectedMbti, selectedCardSize, themeMode]);

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
    <div style={{ fontFamily: FONT, background: s.pageBg, color: s.textPrimary, minHeight: '100vh', overflowX: 'hidden', transition: 'background 0.6s, color 0.6s' }}>
      {/* 通知卡片 */}
      <MiniNotificationCard taskType={currentTask} mbti={currentMbti} visible={notifVisible} onDismiss={() => setNotifVisible(false)} cardSize={currentCardSize} themeMode={currentThemeMode} />

      {/* ── 全局主题切换浮动按钮 ── */}
      <div style={{
        position: 'fixed', top: 20, right: 20, zIndex: 100, display: 'flex', gap: 4,
        background: isDay ? 'rgba(255,255,255,0.85)' : 'rgba(10,30,46,0.85)',
        backdropFilter: 'blur(16px)', borderRadius: 100, padding: 4,
        border: `1px solid ${s.cardBorder}`, boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        transition: 'all 0.4s',
      }}>
        {([
          { mode: 'day' as ThemeMode, icon: <Sun size={16} /> },
          { mode: 'auto' as ThemeMode, icon: <SunMoon size={16} /> },
          { mode: 'night' as ThemeMode, icon: <Moon size={16} /> },
        ]).map(item => (
          <button key={item.mode} onClick={() => setThemeMode(item.mode)} style={{
            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            background: themeMode === item.mode ? s.activeBg : 'transparent',
            color: themeMode === item.mode ? s.accentColor : s.inactiveText,
          }}>
            {item.icon}
          </button>
        ))}
      </div>

      {/* ───── Hero Section ───── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/images/bg-options.png')", backgroundSize: 'cover', backgroundPosition: 'center', transition: 'opacity 0.6s', opacity: isDay ? 0.3 : 1 }} />
        <div style={{ position: 'absolute', inset: 0, background: s.heroOverlay, transition: 'background 0.6s' }} />

        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: s.glowOrb1, filter: 'blur(60px)', transition: 'background 0.6s' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: s.glowOrb2, filter: 'blur(60px)', transition: 'background 0.6s' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800, padding: '0 24px' }}>
          <h1 style={{ fontSize: 64, fontWeight: 800, margin: '0 0 20px', letterSpacing: 6, lineHeight: 1.2, color: isDay ? '#064e3b' : '#ffffff', transition: 'color 0.6s' }}>
            青植呼吸
          </h1>
          <p style={{ fontSize: 22, color: s.textSecondary, margin: '0 0 12px', letterSpacing: 3, fontWeight: 300, transition: 'color 0.6s' }}>
            GreenBreathe
          </p>
          <a href="https://github.com/weiweiyoudianpang/enter-GreenBreathe" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, color: s.accentColor,
            textDecoration: 'none', marginBottom: 20, fontWeight: 500, letterSpacing: 1, transition: 'color 0.3s',
          }}>
            <Github size={18} />
            插件地址
          </a>
          <p style={{ fontSize: 18, color: s.textTertiary, margin: '0 0 48px', lineHeight: 1.8, maxWidth: 560, marginInline: 'auto', transition: 'color 0.6s' }}>
            在快节奏的数字生活中，为你提供片刻的宁静。基于 MBTI 性格的极简健康提醒，通过水墨晕开动画与专属文案，温柔地陪伴你的每一天。
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#demo" style={{
              padding: '16px 48px', background: s.ctaBtnBg, borderRadius: 100, fontSize: 18, color: '#fff',
              textDecoration: 'none', fontWeight: 600, letterSpacing: 2, boxShadow: s.ctaBtnShadow, transition: 'all 0.3s',
            }}>
              体验演示
            </a>
            <a href="#features" style={{
              padding: '16px 48px', background: s.ghostBtnBg, border: `1px solid ${s.ghostBtnBorder}`,
              borderRadius: 100, fontSize: 18, color: s.ghostBtnColor, textDecoration: 'none', fontWeight: 500, letterSpacing: 2, transition: 'all 0.3s',
            }}>
              了解更多
            </a>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', opacity: 0.4, animation: 'bounce 2s infinite', color: s.textPrimary }}>
          <ChevronDown size={32} />
        </div>
        <style>{`@keyframes bounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(10px); } }`}</style>
      </section>

      {/* ───── Features Section ───── */}
      <section id="features" style={{ padding: '120px 24px', background: s.sectionBg1, transition: 'background 0.6s' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p style={{ fontSize: 14, color: s.accentColor, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Core Features</p>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 20px', letterSpacing: 2, color: s.textPrimary, transition: 'color 0.6s' }}>三大核心关怀</h2>
            <p style={{ fontSize: 17, color: s.textSecondary, maxWidth: 500, margin: '0 auto', lineHeight: 1.8 }}>
              科学研究表明，定时休息能显著提升工作效率和身心健康
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{
                  padding: '48px 36px', borderRadius: 24, background: s.cardBg, border: `1px solid ${s.cardBorder}`,
                  transition: 'all 0.4s', cursor: 'default', position: 'relative', overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`, opacity: 0.6 }} />
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
                    <Icon size={32} style={{ color: f.color }} />
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 16px', letterSpacing: 1, color: s.textPrimary }}>{f.title}</h3>
                  <p style={{ fontSize: 15, color: s.textSecondary, lineHeight: 1.8, margin: 0 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Highlights Section ───── */}
      <section style={{ padding: '120px 24px', background: s.sectionBg2, position: 'relative', transition: 'background 0.6s' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: s.glowOrb1 }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <p style={{ fontSize: 14, color: s.accentColor, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Key Features</p>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 20px', letterSpacing: 2, color: s.textPrimary }}>主要特色</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {highlights.map((h, i) => {
              const Icon = h.icon;
              return (
                <div key={i} style={{
                  padding: '36px 40px', borderRadius: 20, background: s.cardBg, border: `1px solid ${s.cardBorder}`,
                  display: 'flex', gap: 24, alignItems: 'flex-start', transition: 'all 0.3s', backdropFilter: 'blur(10px)',
                }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: `${s.accentColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={24} style={{ color: s.accentColor }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px', letterSpacing: 1, color: s.textPrimary }}>{h.title}</h3>
                    <p style={{ fontSize: 15, color: s.textSecondary, lineHeight: 1.7, margin: 0 }}>{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── MBTI Preview Section ───── */}
      <section style={{ padding: '120px 24px', background: s.sectionBg3, transition: 'background 0.6s' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 14, color: s.accentColor, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Personality Driven</p>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 20px', letterSpacing: 2, color: s.textPrimary }}>MBTI 性格驱动</h2>
            <p style={{ fontSize: 17, color: s.textSecondary, maxWidth: 540, margin: '0 auto', lineHeight: 1.8 }}>
              16种性格类型，每种都有独特的鼓励方式。不再是千篇一律的提醒，而是真正懂你的温柔关怀。
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {MBTI_LIST.map(m => {
              const gk = m[1] === 'N' ? (m[2] === 'T' ? 'NT' : 'NF') : (m[3] === 'J' ? 'SJ' : 'SP');
              const typeLabels: Record<string, string> = {
                INTJ: '策略家', INTP: '逻辑学家', ENTJ: '指挥官', ENTP: '辩论家',
                INFJ: '提倡者', INFP: '调停者', ENFJ: '主人公', ENFP: '竞选者',
                ISTJ: '物流师', ISFJ: '守卫者', ESTJ: '总经理', ESFJ: '执政官',
                ISTP: '鉴赏家', ISFP: '探险家', ESTP: '企业家', ESFP: '表演者',
              };
              const gc = s.mbtiGroupColors[gk as keyof typeof s.mbtiGroupColors];
              return (
                <div key={m} style={{
                  padding: '20px 24px', borderRadius: 16, background: s.cardBg, border: `1px solid ${s.cardBorder}`,
                  textAlign: 'center', transition: 'all 0.3s', cursor: 'default', backdropFilter: 'blur(10px)',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, marginBottom: 8, color: s.textPrimary }}>{m}</div>
                  <div style={{ fontSize: 12, color: gc, fontWeight: 600, letterSpacing: 1 }}>{typeLabels[m]}</div>
                  <p style={{ fontSize: 13, color: s.textTertiary, marginTop: 12, lineHeight: 1.6, margin: '12px 0 0' }}>
                    {MBTI_MESSAGES[m].hydration.length > 18 ? MBTI_MESSAGES[m].hydration.slice(0, 18) + '...' : MBTI_MESSAGES[m].hydration}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Interactive Demo Section ───── */}
      <section id="demo" style={{ padding: '120px 24px', background: s.pageBg, position: 'relative', transition: 'background 0.6s' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: s.decorLine }} />

        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 14, color: s.accentColor, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Live Demo</p>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 20px', letterSpacing: 2, color: s.textPrimary }}>在线体验</h2>
            <p style={{ fontSize: 17, color: s.textSecondary, maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
              选择你的 MBTI 性格和提醒类型，点击按钮即可预览真实的通知卡片效果
            </p>
          </div>

          <div style={{
            background: s.controlBg, border: `1px solid ${s.controlBorder}`, borderRadius: 28, padding: 48,
            backdropFilter: 'blur(20px)', transition: 'all 0.4s',
          }}>
            {/* 提醒类型 */}
            <div style={{ marginBottom: 36 }}>
              <h3 style={{ fontSize: 16, color: s.textSecondary, marginBottom: 16, fontWeight: 500, letterSpacing: 2 }}>提醒类型</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                {(Object.keys(TASK_INFO) as TaskType[]).map(tk => {
                  const task = TASK_INFO[tk];
                  const active = selectedTask === tk;
                  const Icon = task.icon;
                  return (
                    <button key={tk} onClick={() => setSelectedTask(tk)} style={{
                      flex: 1, padding: '16px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center',
                      border: active ? `1px solid ${s.activeBorder}` : `1px solid ${s.controlBorder}`,
                      background: active ? s.activeBg : isDay ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer', transition: 'all 0.3s', fontSize: 16, fontFamily: FONT,
                      color: active ? s.accentColor : s.inactiveText, fontWeight: active ? 600 : 400,
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
              <h3 style={{ fontSize: 16, color: s.textSecondary, marginBottom: 16, fontWeight: 500, letterSpacing: 2 }}>MBTI 性格</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {MBTI_LIST.map(m => (
                  <button key={m} onClick={() => setSelectedMbti(m)} style={{
                    padding: '10px 22px', borderRadius: 100,
                    border: selectedMbti === m ? `1px solid ${s.activeBorder}` : `1px solid ${s.controlBorder}`,
                    background: selectedMbti === m ? s.activeBg : 'transparent',
                    color: selectedMbti === m ? s.accentColor : s.inactiveText,
                    fontSize: 14, fontFamily: FONT, letterSpacing: 1, cursor: 'pointer', transition: 'all 0.3s',
                    fontWeight: selectedMbti === m ? 600 : 400,
                  }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* 卡片尺寸 */}
            <div style={{ marginBottom: 36 }}>
              <h3 style={{ fontSize: 16, color: s.textSecondary, marginBottom: 16, fontWeight: 500, letterSpacing: 2 }}>卡片尺寸</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['small', 'medium', 'large'] as CardSize[]).map(size => (
                  <button key={size} onClick={() => setSelectedCardSize(size)} style={{
                    padding: '10px 28px', borderRadius: 100,
                    border: selectedCardSize === size ? `1px solid ${s.activeBorder}` : `1px solid ${s.controlBorder}`,
                    background: selectedCardSize === size ? s.activeBg : 'transparent',
                    color: selectedCardSize === size ? s.accentColor : s.inactiveText,
                    fontSize: 14, fontFamily: FONT, cursor: 'pointer', transition: 'all 0.3s',
                    fontWeight: selectedCardSize === size ? 600 : 400,
                  }}>
                    {size === 'small' ? '小 960x570' : size === 'medium' ? '中 1280x760' : '大 1600x950'}
                  </button>
                ))}
              </div>
            </div>

            {/* 预览文案 */}
            <div style={{
              padding: '24px 28px', borderRadius: 16,
              background: isDay ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${s.controlBorder}`, marginBottom: 32, transition: 'all 0.4s',
            }}>
              <p style={{ fontSize: 13, color: s.textTertiary, marginBottom: 8, letterSpacing: 1 }}>当前文案预览</p>
              <p style={{ fontSize: 18, color: s.textPrimary, fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
                "{MBTI_MESSAGES[selectedMbti]?.[selectedTask]}"
              </p>
            </div>

            {/* 触发按钮 */}
            <button onClick={triggerNotification} style={{
              width: '100%', padding: '18px 0', borderRadius: 100, fontSize: 18, fontWeight: 600, letterSpacing: 4, cursor: 'pointer',
              background: s.ctaBtnBg, border: 'none', color: '#fff', fontFamily: FONT,
              boxShadow: s.ctaBtnShadow, transition: 'all 0.3s',
            }}>
              <Play size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
              触发提醒演示
            </button>
          </div>
        </div>
      </section>

      {/* ───── Screenshots Section ───── */}
      <section style={{ padding: '120px 24px', background: s.sectionBg2, position: 'relative', transition: 'background 0.6s' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: s.decorLine }} />
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 14, color: s.accentColor, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Screenshots</p>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 20px', letterSpacing: 2, color: s.textPrimary }}>实际画面</h2>
            <p style={{ fontSize: 17, color: s.textSecondary, maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
              插件在真实浏览器环境中的运行效果
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              { src: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/0930.png', alt: '浏览器内嵌入式通知效果' },
              { src: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/8b5b.png', alt: '水墨晕开动画渐显效果' },
              { src: 'https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/23c1.png', alt: '通知卡片与页面融合效果' },
            ].map((img, i) => (
              <div key={i} style={{
                borderRadius: 20, overflow: 'hidden', border: `1px solid ${s.cardBorder}`,
                boxShadow: isDay ? '0 8px 40px rgba(0,0,0,0.08)' : '0 8px 40px rgba(0,0,0,0.3)',
                transition: 'all 0.4s',
              }}>
                <img crossOrigin="anonymous" src={img.src} alt={img.alt} style={{ width: '100%', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Author's Words Section ───── */}
      <section style={{ padding: '120px 24px', background: s.sectionBg3, position: 'relative', transition: 'background 0.6s' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 14, color: s.accentColor, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>From the Author</p>
            <h2 style={{ fontSize: 42, fontWeight: 700, margin: '0 0 20px', letterSpacing: 2, color: s.textPrimary }}>作者的话</h2>
          </div>

          <div style={{
            padding: '48px 44px', borderRadius: 24, background: s.cardBg, border: `1px solid ${s.cardBorder}`,
            backdropFilter: 'blur(10px)', transition: 'all 0.4s', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 24, left: 36, opacity: 0.08, color: s.accentColor }}>
              <Pen size={48} />
            </div>

            <p style={{ fontSize: 16, color: s.textPrimary, lineHeight: 2, margin: '0 0 28px', textIndent: '2em' }}>
              AI的学习和工作经常让我忘记久坐和长时间用眼的肌肉疲劳，设计这个插件的主要原因是想提醒自己和各位在日常忙碌的工作当中，也要记得平时注意自己的身体健康，保持一个良好的身体状态，才会有一个好的心理状态，而保持良好的身体状态，需要的是日积月累的好习惯，不仅是偶尔的健身锻炼。
            </p>
            <p style={{ fontSize: 16, color: s.textPrimary, lineHeight: 2, margin: '0 0 36px', textIndent: '2em' }}>
              你自己、你的家人朋友、你的宠物或者你追求的美好事物都可以成为你对自己身体负责的理由，有的时候可能只是需要小小的提醒和关心。
            </p>

            <div style={{ borderTop: `1px solid ${s.cardBorder}`, paddingTop: 28 }}>
              <h4 style={{ fontSize: 18, fontWeight: 600, color: s.textPrimary, margin: '0 0 20px', letterSpacing: 1 }}>插件目前状态</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  '基础功能已经实现，我是希望设计越简单越好',
                  '预留了音效接口暂未制作（感觉用不太上），所以也没有留语音API接口',
                  'AI功能：更定制化的用户画像描写和更好的关切语（后续可能更新，还在交互的简单性和全面性方面考量）',
                  '按时提醒吃药功能：目前我没有这个需要，后续可能会加上，方便不同人使用',
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: 15, color: s.textSecondary, lineHeight: 1.8, paddingLeft: 20, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: 2, width: 8, height: 8, borderRadius: '50%', background: s.accentColor, opacity: 0.5 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ borderTop: `1px solid ${s.cardBorder}`, paddingTop: 28, marginTop: 28, textAlign: 'center' }}>
              <p style={{ fontSize: 16, color: s.textPrimary, margin: '0 0 20px', lineHeight: 1.8 }}>
                大家有任何疑问和需求可以微信联系我
              </p>
              <a href="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/a33b.jpg" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 36px',
                background: s.activeBg, border: `1px solid ${s.activeBorder}`, borderRadius: 100,
                color: s.accentColor, textDecoration: 'none', fontSize: 16, fontWeight: 600, letterSpacing: 1,
                transition: 'all 0.3s', fontFamily: FONT,
              }}>
                <MessageCircle size={20} />
                查看微信二维码
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer style={{ padding: '60px 24px', background: s.footerBg, textAlign: 'center', transition: 'background 0.6s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          <Leaf size={20} style={{ color: s.accentColor }} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: 2, color: s.textPrimary }}>青植呼吸 GreenBreathe</span>
        </div>
        <p style={{ fontSize: 14, color: s.textTertiary, margin: 0, lineHeight: 1.8 }}>
          一款关注身心健康的 Chrome 扩展 · 基于 MBTI 的个性化提醒体验
        </p>
        <div style={{ marginTop: 20, fontSize: 13, color: s.textTertiary }}>
          Made with <Heart size={14} style={{ display: 'inline', verticalAlign: 'middle', color: s.accentColor }} /> by GreenBreathe Team
        </div>
      </footer>
    </div>
  );
}
