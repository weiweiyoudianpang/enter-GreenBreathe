import { createRoot } from 'react-dom/client';
import { useEffect, useState, useCallback } from 'react';
import '@/index.css';
import { storage } from '@/lib/storage';
import { UserProfile, PlantGrowth } from '@/types/extension';
import { Droplets, Eye, PersonStanding, Leaf, Sun, Moon, Settings, Zap } from 'lucide-react';
import { getTheme, resolveTheme } from '@/lib/theme';

/** Breathing phase names and durations (ms) */
const BREATH_PHASES = [
  { label: '吸气', duration: 4000 },
  { label: '屏息', duration: 4000 },
  { label: '呼气', duration: 6000 },
  { label: '放松', duration: 2000 },
] as const;

const TOTAL_CYCLE = BREATH_PHASES.reduce((s, p) => s + p.duration, 0); // 16s

function BreathingLight({ accent, accentGlow, accentHover, text, textMuted, card, cardBorder, isDay }: {
  accent: string; accentGlow: string; accentHover: string;
  text: string; textMuted: string; card: string; cardBorder: string; isDay: boolean;
}) {
  const [phase, setPhase] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const startTime = Date.now();
    const tick = () => {
      const now = Date.now();
      const cycleTime = (now - startTime) % TOTAL_CYCLE;
      setElapsed(cycleTime);
      let acc = 0;
      for (let i = 0; i < BREATH_PHASES.length; i++) {
        acc += BREATH_PHASES[i].duration;
        if (cycleTime < acc) { setPhase(i); break; }
      }
    };
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, [active]);

  // Compute the scale and opacity based on phase & elapsed
  const getProgress = useCallback(() => {
    let acc = 0;
    for (let i = 0; i < phase; i++) acc += BREATH_PHASES[i].duration;
    const phaseElapsed = elapsed - acc;
    const phaseDuration = BREATH_PHASES[phase].duration;
    return Math.min(phaseElapsed / phaseDuration, 1);
  }, [phase, elapsed]);

  const progress = active ? getProgress() : 0;

  // Scale: inhale 0.6→1, hold 1, exhale 1→0.6, rest 0.6
  let scale = 0.6;
  let glowIntensity = 0.15;
  if (active) {
    if (phase === 0) { scale = 0.6 + 0.4 * progress; glowIntensity = 0.15 + 0.35 * progress; }
    else if (phase === 1) { scale = 1; glowIntensity = 0.5; }
    else if (phase === 2) { scale = 1 - 0.4 * progress; glowIntensity = 0.5 - 0.35 * progress; }
    else { scale = 0.6; glowIntensity = 0.15; }
  }

  const ringColor = isDay ? 'rgba(16,185,129,' : 'rgba(56,201,163,';

  return (
    <div style={{
      background: card,
      border: `1px solid ${cardBorder}`,
      borderRadius: 16,
      padding: '20px',
      marginBottom: 12,
      textAlign: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: active ? accent : textMuted,
            boxShadow: active ? `0 0 8px ${accentGlow}` : 'none',
            transition: 'all 0.5s',
          }} />
          <span style={{ fontSize: 14, color: text, fontWeight: 500 }}>深呼吸放松</span>
        </div>
        <button
          onClick={() => setActive(!active)}
          style={{
            fontSize: 12, padding: '4px 14px', borderRadius: 8, cursor: 'pointer',
            border: `1px solid ${cardBorder}`,
            background: active ? accent : 'transparent',
            color: active ? '#fff' : textMuted,
            fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
            transition: 'all 0.3s',
          }}
        >
          {active ? '停止' : '开始'}
        </button>
      </div>

      {/* Breathing circle */}
      <div style={{
        position: 'relative',
        width: 120, height: 120,
        margin: '0 auto 12px',
      }}>
        {/* Glow ring */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${ringColor}${(glowIntensity * 0.4).toFixed(2)}) 0%, transparent 70%)`,
          transform: `scale(${scale * 1.4})`,
          transition: active ? 'transform 0.3s ease-out' : 'transform 0.6s ease',
        }} />
        {/* Main orb */}
        <div style={{
          position: 'absolute',
          inset: '15%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, ${accent}, ${accentHover})`,
          opacity: 0.3 + glowIntensity * 0.7,
          transform: `scale(${scale})`,
          transition: active ? 'transform 0.3s ease-out, opacity 0.3s' : 'transform 0.6s ease, opacity 0.6s',
          boxShadow: `0 0 ${Math.round(glowIntensity * 40)}px ${ringColor}${glowIntensity.toFixed(2)})`,
        }} />
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 600, color: text,
          letterSpacing: 4,
        }}>
          {active ? BREATH_PHASES[phase].label : '---'}
        </div>
      </div>

      {!active && (
        <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>
          4-4-6-2 节奏呼吸，缓解压力
        </p>
      )}
    </div>
  );
}

function PopupPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ today: 0, week: 0, total: 0 });
  const [growth, setGrowth] = useState<PlantGrowth | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const profileData = await storage.getUserProfile();
    setProfile(profileData);
    const logs = await storage.getInteractionLog();
    const completedLogs = logs.filter(log => log.action === 'completed');
    const now = Date.now();
    setStats({
      today: completedLogs.filter(log => log.timestamp > now - 86400000).length,
      week: completedLogs.filter(log => log.timestamp > now - 604800000).length,
      total: completedLogs.length,
    });
    setGrowth(await storage.getPlantGrowth());
  };

  const openOptions = () => chrome.runtime.openOptionsPage();
  const triggerTest = async () => {
    await chrome.runtime.sendMessage({ type: 'TRIGGER_TEST_NOTIFICATION' });
    window.close();
  };

  if (!profile || !growth) {
    return <div className="w-80 h-96 flex items-center justify-center" style={{ background: '#0a1e2e' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>加载中...</p>
    </div>;
  }

  const t = getTheme(profile.themeMode);
  const effectiveTheme = resolveTheme(profile.themeMode);
  const isDay = effectiveTheme === 'day';
  const progressPercent = ((growth.totalCompletions % 10) / 10) * 100;
  const remainToLevelUp = 10 - (growth.totalCompletions % 10);

  return (
    <div className="w-80" style={{ background: t.bg, fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif", position: 'relative', overflow: 'hidden' }}>
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: -80, right: -60, width: 200, height: 200, borderRadius: '50%', background: t.glowOrb1, filter: 'blur(30px)' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: t.glowOrb2, filter: 'blur(30px)' }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '24px 20px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <Leaf size={22} style={{ color: t.accent }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: 2 }}>青植呼吸</span>
          </div>
          <p style={{ fontSize: 13, color: t.textMuted, margin: 0 }}>
            {isDay ? <Sun size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} /> : <Moon size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />}
            你好, {profile.nickname}
          </p>
        </div>

        {/* Stats */}
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: t.textMuted }}>今日完成</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: t.accent }}>{stats.today}</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 10, background: t.accentSoft }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: t.text }}>{stats.week}</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>本周</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 10, background: t.accentSoft }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: t.text }}>{stats.total}</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>累计</div>
            </div>
          </div>
        </div>

        {/* Plant growth */}
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Leaf size={16} style={{ color: t.accent }} />
              <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>植物成长</span>
            </div>
            <span style={{ fontSize: 12, color: t.accent, fontWeight: 600, background: t.accentSoft, padding: '3px 10px', borderRadius: 8 }}>Lv.{growth.level}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: t.progressTrack, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercent}%`, borderRadius: 3, background: `linear-gradient(90deg, ${t.accent}, ${t.accentHover})`, transition: 'width 0.5s' }} />
          </div>
          <p style={{ fontSize: 12, color: t.textMuted, textAlign: 'center', marginTop: 8 }}>
            还需 {remainToLevelUp} 次升级
          </p>
        </div>

        {/* Breathing Light */}
        <BreathingLight
          accent={t.accent}
          accentGlow={t.accentGlow}
          accentHover={t.accentHover}
          text={t.text}
          textMuted={t.textMuted}
          card={t.card}
          cardBorder={t.cardBorder}
          isDay={isDay}
        />

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <button onClick={triggerTest} style={{
            width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 15, fontWeight: 600, letterSpacing: 2, cursor: 'pointer',
            background: `linear-gradient(135deg, ${t.accent}, ${t.accentHover})`, border: 'none', color: t.textOnAccent,
            fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
            boxShadow: `0 4px 16px ${t.accentGlow}`, transition: 'all 0.3s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Zap size={16} /> 立即测试提醒
          </button>
          <button onClick={openOptions} style={{
            width: '100%', padding: '12px 0', borderRadius: 14, fontSize: 14, fontWeight: 500, letterSpacing: 1, cursor: 'pointer',
            background: t.card, border: `1px solid ${t.cardBorder}`, color: t.textSecondary,
            fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif", transition: 'all 0.3s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <Settings size={14} /> 打开设置
          </button>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', borderTop: `1px solid ${t.border}`, paddingTop: 12 }}>
          <p style={{ fontSize: 12, color: t.textMuted, margin: '0 0 6px' }}>MBTI: {profile.mbtiType}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 12, color: t.textMuted }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Droplets size={12} style={{ color: t.hydration }} /> {profile.hydrationInterval}分</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} style={{ color: t.eyeCare }} /> {profile.eyeCareInterval}分</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PersonStanding size={12} style={{ color: t.movement }} /> {profile.movementInterval}分</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('popup-root');
if (container) {
  createRoot(container).render(<PopupPage />);
}
