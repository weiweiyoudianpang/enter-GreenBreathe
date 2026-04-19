import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import '@/index.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { UserProfile, InteractionLog, PlantGrowth } from '@/types/extension';
import { Droplets, Eye, PersonStanding, Leaf, Sun, Moon } from 'lucide-react';
import { getTheme, resolveTheme, ThemeColors } from '@/lib/theme';

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
        <div style={{ background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16, padding: '16px 20px', marginBottom: 16 }}>
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

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <button onClick={triggerTest} style={{
            width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 15, fontWeight: 600, letterSpacing: 2, cursor: 'pointer',
            background: `linear-gradient(135deg, ${t.accent}, ${t.accentHover})`, border: 'none', color: t.textOnAccent,
            fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
            boxShadow: `0 4px 16px ${t.accentGlow}`, transition: 'all 0.3s',
          }}>
            立即测试提醒
          </button>
          <button onClick={openOptions} style={{
            width: '100%', padding: '12px 0', borderRadius: 14, fontSize: 14, fontWeight: 500, letterSpacing: 1, cursor: 'pointer',
            background: t.card, border: `1px solid ${t.cardBorder}`, color: t.textSecondary,
            fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif", transition: 'all 0.3s',
          }}>
            打开设置
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
