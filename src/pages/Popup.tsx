import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import '@/index.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { UserProfile, InteractionLog, PlantGrowth } from '@/types/extension';
import { Droplets, Eye, PersonStanding, Leaf } from 'lucide-react';

function PopupPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    total: 0,
  });
  const [growth, setGrowth] = useState<PlantGrowth | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const profileData = await storage.getUserProfile();
    setProfile(profileData);

    const logs = await storage.getInteractionLog();
    const completedLogs = logs.filter(log => log.action === 'completed');
    
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    setStats({
      today: completedLogs.filter(log => log.timestamp > oneDayAgo).length,
      week: completedLogs.filter(log => log.timestamp > oneWeekAgo).length,
      total: completedLogs.length,
    });

    const growthData = await storage.getPlantGrowth();
    setGrowth(growthData);
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const triggerTest = async () => {
    await chrome.runtime.sendMessage({ type: 'TRIGGER_TEST_NOTIFICATION' });
    window.close();
  };

  if (!profile || !growth) {
    return (
      <div className="w-80 h-96 flex items-center justify-center" style={{ background: '#0a1e2e' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p>
      </div>
    );
  }

  const progressPercent = ((growth.totalCompletions % 10) / 10) * 100;
  const remainToLevelUp = 10 - (growth.totalCompletions % 10);

  return (
    <div className="w-80" style={{ background: '#0a1e2e', fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif", position: 'relative', overflow: 'hidden' }}>
      {/* 装饰光晕 */}
      <div style={{ position: 'absolute', top: -80, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,201,163,0.12) 0%, transparent 70%)', filter: 'blur(30px)' }} />
      <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,158,222,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '24px 20px 20px' }}>
        {/* Header: Logo + 名字 */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src="/images/logo-greenbreathe.png" alt="GreenBreathe" style={{ width: 100, margin: '0 auto 8px', display: 'block', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }} />
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Hello, {profile.nickname}
          </p>
        </div>

        {/* 统计卡片 */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Today</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#38c9a3' }}>{stats.today}</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{stats.week}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>This Week</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{stats.total}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Total</div>
            </div>
          </div>
        </div>

        {/* 植物成长 */}
        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Leaf size={16} style={{ color: '#38c9a3' }} />
              <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>Plant Growth</span>
            </div>
            <span style={{ fontSize: 12, color: '#38c9a3', fontWeight: 600, background: 'rgba(56,201,163,0.12)', padding: '3px 10px', borderRadius: 8 }}>Lv.{growth.level}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercent}%`, borderRadius: 3, background: 'linear-gradient(90deg, #38c9a3, #2eb391)', transition: 'width 0.5s' }} />
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 8 }}>
            {remainToLevelUp} more to level up
          </p>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <button onClick={triggerTest} style={{
            width: '100%', padding: '14px 0', borderRadius: 14, fontSize: 15, fontWeight: 600, letterSpacing: 2, cursor: 'pointer',
            background: 'linear-gradient(135deg, #38c9a3, #2eb391)', border: 'none', color: '#fff',
            fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
            boxShadow: '0 4px 16px rgba(56,201,163,0.3)', transition: 'all 0.3s',
          }}>
            Test Notification
          </button>
          <button onClick={openOptions} style={{
            width: '100%', padding: '12px 0', borderRadius: 14, fontSize: 14, fontWeight: 500, letterSpacing: 1, cursor: 'pointer',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)',
            fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif", transition: 'all 0.3s',
          }}>
            Settings
          </button>
        </div>

        {/* 底部信息 */}
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 6px' }}>MBTI: {profile.mbtiType}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Droplets size={12} style={{ color: '#3b9ede' }} /> {profile.hydrationInterval}m</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} style={{ color: '#7c5cbf' }} /> {profile.eyeCareInterval}m</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PersonStanding size={12} style={{ color: '#3aaa6e' }} /> {profile.movementInterval}m</span>
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
