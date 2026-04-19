import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import '@/index.css';
import { UserProfile } from '@/types/extension';
import { loadUserProfile, saveUserProfile } from '@/lib/storage';
import { Droplets, Eye, PersonStanding, User, Clock, Palette, Save, Play, ChevronDown, Plus, X, Volume2, Minimize2, MonitorSmartphone, ImagePlus, Lightbulb, Lock, Leaf } from 'lucide-react';

const defaultProfile: UserProfile = {
  nickname: '朋友',
  mbtiType: 'INFP',
  hydrationInterval: 45,
  eyeCareInterval: 20,
  movementInterval: 60,
  quietHours: [],
  notificationPosition: 'top_right',
  minimalMode: false,
  soundEnabled: false,
};

const mbtiTypes = [
  { value: 'INTJ', label: 'INTJ - 建筑师' },
  { value: 'INTP', label: 'INTP - 逻辑学家' },
  { value: 'ENTJ', label: 'ENTJ - 指挥官' },
  { value: 'ENTP', label: 'ENTP - 辩论家' },
  { value: 'INFJ', label: 'INFJ - 提倡者' },
  { value: 'INFP', label: 'INFP - 调停者' },
  { value: 'ENFJ', label: 'ENFJ - 主人公' },
  { value: 'ENFP', label: 'ENFP - 竞选者' },
  { value: 'ISTJ', label: 'ISTJ - 物流师' },
  { value: 'ISFJ', label: 'ISFJ - 守卫者' },
  { value: 'ESTJ', label: 'ESTJ - 总经理' },
  { value: 'ESFJ', label: 'ESFJ - 执政官' },
  { value: 'ISTP', label: 'ISTP - 鉴赏家' },
  { value: 'ISFP', label: 'ISFP - 探险家' },
  { value: 'ESTP', label: 'ESTP - 企业家' },
  { value: 'ESFP', label: 'ESFP - 表演者' },
];

const positionOptions = [
  { value: 'top_right', label: '右上角' },
  { value: 'top_left', label: '左上角' },
  { value: 'bottom_right', label: '右下角' },
  { value: 'bottom_left', label: '左下角' },
];

const cardSizeOptions = [
  { value: 'small', label: '小 (960x570)' },
  { value: 'medium', label: '中 (1280x760)' },
  { value: 'large', label: '大 (1600x950)' },
];

/* ---- Reusable styled components ---- */

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a1e2e',
    fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  bgImage: {
    position: 'absolute' as const,
    inset: 0,
    backgroundImage: "url('/images/bg-options.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    opacity: 0.15,
  },
  overlay: {
    position: 'absolute' as const,
    inset: 0,
    background: 'linear-gradient(180deg, rgba(10,30,46,0.6) 0%, rgba(10,30,46,0.9) 100%)',
  },
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '48px 24px 64px',
    position: 'relative' as const,
    zIndex: 1,
  },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '32px 28px',
    marginBottom: 24,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 20,
    fontWeight: 600,
    color: '#fff',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 28,
    lineHeight: 1.6,
  },
  label: {
    fontSize: 15,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    display: 'block' as const,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 16,
    padding: '0 16px',
    outline: 'none',
    fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
    transition: 'all 0.3s',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 16,
    padding: '0 16px',
    outline: 'none',
    fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
    cursor: 'pointer',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    boxSizing: 'border-box' as const,
  },
  hint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 8,
    lineHeight: 1.6,
  },
  intervalBlock: {
    padding: '24px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: 20,
  },
  intervalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  intervalLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 16,
    fontWeight: 500,
    color: '#fff',
  },
  badge: (color: string) => ({
    fontSize: 14,
    fontWeight: 600,
    color: color,
    background: `${color}18`,
    padding: '4px 14px',
    borderRadius: 20,
    border: `1px solid ${color}30`,
  }),
  slider: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    background: 'rgba(255,255,255,0.08)',
    outline: 'none',
    cursor: 'pointer',
  },
  switchRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 20px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    marginBottom: 12,
  },
};

function CustomSlider({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div style={{ position: 'relative', height: 32, display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'absolute', left: 0, width: `${(value / 120) * 100}%`, height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
      <input
        type="range"
        min={0}
        max={120}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          ...styles.slider,
          position: 'relative',
          zIndex: 1,
          background: 'transparent',
          WebkitAppearance: 'none',
        }}
      />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: ${color}; border: 3px solid #0a1e2e;
          box-shadow: 0 0 10px ${color}60;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function CustomSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 48, height: 26, borderRadius: 13, padding: 3,
        background: checked ? '#38c9a3' : 'rgba(255,255,255,0.12)',
        border: 'none', cursor: 'pointer', transition: 'all 0.3s',
        position: 'relative', flexShrink: 0,
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transition: 'all 0.3s', transform: checked ? 'translateX(22px)' : 'translateX(0)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

function OptionsPage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    loadUserProfile().then((loaded) => {
      if (loaded) setProfile(loaded);
    });
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    await saveUserProfile(profile);
    chrome.runtime.sendMessage({ type: 'UPDATE_ALARM' });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleTest = () => {
    chrome.runtime.sendMessage({ type: 'TRIGGER_TEST_NOTIFICATION' });
  };

  const formatIntervalLabel = (minutes: number) => {
    if (minutes === 0) return '不提醒';
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  return (
    <div style={styles.page}>
      {/* Background image layer */}
      <div style={styles.bgImage} />
      <div style={styles.overlay} />

      {/* Decorative glows */}
      <div style={{ position: 'absolute', top: -120, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,201,163,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,158,222,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <img
            src="/images/logo-greenbreathe.png"
            alt="青植呼吸 GreenBreathe"
            style={{ width: 280, margin: '0 auto 12px', display: 'block', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }}
          />
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>用温柔的方式，提醒你关爱自己</p>
        </div>

        {/* === Card 1: 基础设置 === */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <User size={22} style={{ color: '#38c9a3' }} />
            基础设置
          </div>
          <p style={styles.cardDesc}>个性化你的健康提醒体验</p>

          <div style={{ marginBottom: 24 }}>
            <label style={styles.label}>昵称</label>
            <input
              value={profile.nickname}
              onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
              placeholder="输入你的昵称"
              style={styles.input}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(56,201,163,0.4)'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)'; }}
            />
          </div>

          <div>
            <label style={styles.label}>MBTI 性格类型</label>
            <div style={{ position: 'relative' }}>
              <select
                value={profile.mbtiType}
                onChange={(e) => setProfile({ ...profile, mbtiType: e.target.value as UserProfile['mbtiType'] })}
                style={styles.select}
              >
                {mbtiTypes.map((type) => (
                  <option key={type.value} value={type.value} style={{ background: '#0f2a3e', color: '#fff' }}>
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
            </div>
            <p style={styles.hint}>根据你的性格类型定制鼓励语表达方式</p>
          </div>
        </div>

        {/* === Card 2: 提醒间隔 === */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <Clock size={22} style={{ color: '#3b9ede' }} />
            提醒间隔
          </div>
          <p style={styles.cardDesc}>为每种健康提醒设置不同的间隔时间，0分钟表示不提醒</p>

          {/* 喝水提醒 */}
          <div style={styles.intervalBlock}>
            <div style={styles.intervalHeader}>
              <div style={styles.intervalLabel}>
                <Droplets size={20} style={{ color: '#3b9ede' }} />
                喝水提醒
              </div>
              <span style={styles.badge('#3b9ede')}>{formatIntervalLabel(profile.hydrationInterval)}</span>
            </div>
            <CustomSlider value={profile.hydrationInterval} onChange={(v) => setProfile({ ...profile, hydrationInterval: v })} color="#3b9ede" />
            <p style={styles.hint}>科学建议：每30-60分钟补充150-200ml水分</p>
          </div>

          {/* 眼睛休息提醒 */}
          <div style={styles.intervalBlock}>
            <div style={styles.intervalHeader}>
              <div style={styles.intervalLabel}>
                <Eye size={20} style={{ color: '#7c5cbf' }} />
                眼睛休息提醒
              </div>
              <span style={styles.badge('#7c5cbf')}>{formatIntervalLabel(profile.eyeCareInterval)}</span>
            </div>
            <CustomSlider value={profile.eyeCareInterval} onChange={(v) => setProfile({ ...profile, eyeCareInterval: v })} color="#7c5cbf" />
            <p style={styles.hint}>科学建议：每20分钟执行20-20-20法则，有效缓解视疲劳</p>
          </div>

          {/* 身体活动提醒 */}
          <div style={styles.intervalBlock}>
            <div style={styles.intervalHeader}>
              <div style={styles.intervalLabel}>
                <PersonStanding size={20} style={{ color: '#3aaa6e' }} />
                身体活动提醒
              </div>
              <span style={styles.badge('#3aaa6e')}>{formatIntervalLabel(profile.movementInterval)}</span>
            </div>
            <CustomSlider value={profile.movementInterval} onChange={(v) => setProfile({ ...profile, movementInterval: v })} color="#3aaa6e" />
            <p style={styles.hint}>科学建议：每60分钟站立活动2-5分钟，促进血液循环</p>
          </div>
        </div>

        {/* === Card 3: 外观设置 === */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <Palette size={22} style={{ color: '#d4a054' }} />
            外观设置
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={styles.label}>弹窗位置</label>
            <div style={{ position: 'relative' }}>
              <select
                value={profile.notificationPosition}
                onChange={(e) => setProfile({ ...profile, notificationPosition: e.target.value as UserProfile['notificationPosition'] })}
                style={styles.select}
              >
                {positionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} style={{ background: '#0f2a3e', color: '#fff' }}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={styles.label}>卡片尺寸</label>
            <div style={{ position: 'relative' }}>
              <select
                value={profile.cardSize || 'medium'}
                onChange={(e) => setProfile({ ...profile, cardSize: e.target.value as UserProfile['cardSize'] })}
                style={styles.select}
              >
                {cardSizeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} style={{ background: '#0f2a3e', color: '#fff' }}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
            </div>
            <p style={styles.hint}>根据你的屏幕大小选择合适的卡片尺寸</p>
          </div>

          {/* Switches */}
          <div style={styles.switchRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Volume2 size={16} style={{ color: '#d4a054' }} />
                <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>提示音</span>
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>播放柔和的提示音</span>
            </div>
            <CustomSwitch checked={profile.soundEnabled ?? false} onChange={(v) => setProfile({ ...profile, soundEnabled: v })} />
          </div>

          <div style={styles.switchRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Minimize2 size={16} style={{ color: '#d4a054' }} />
                <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>极简模式</span>
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>仅显示状态栏图标</span>
            </div>
            <CustomSwitch checked={profile.minimalMode} onChange={(v) => setProfile({ ...profile, minimalMode: v })} />
          </div>

          {/* 分隔线 */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '28px 0' }} />

          {/* 背景图片管理 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ImagePlus size={18} style={{ color: '#d4a054' }} />
              <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>自定义背景图片</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 20, lineHeight: 1.6 }}>
              自定义提醒卡片的背景图片，建议尺寸 1920x1080 或更高，格式 PNG/JPG
            </p>

            {/* 当前背景图片预览 */}
            {profile.customBackgrounds && profile.customBackgrounds.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                {profile.customBackgrounds.map((bg, index) => (
                  <div key={index} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={bg} alt={`背景图 ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => {
                        const newBgs = profile.customBackgrounds!.filter((_, i) => i !== index);
                        setProfile({ ...profile, customBackgrounds: newBgs });
                      }}
                      style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'rgba(220,50,50,0.85)', border: 'none',
                        color: '#fff', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        opacity: 0.7, transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 添加图片按钮 */}
            <input
              type="file"
              id="bg-upload"
              accept="image/png,image/jpeg,image/jpg"
              multiple
              style={{ display: 'none' }}
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                const currentCount = profile.customBackgrounds?.length || 0;
                if (currentCount + files.length > 6) {
                  alert('最多只能添加6张背景图片');
                  return;
                }
                const newBackgrounds: string[] = [];
                for (const file of files) {
                  if (file.size > 2 * 1024 * 1024) {
                    alert(`图片 ${file.name} 超过 2MB，请选择更小的图片`);
                    continue;
                  }
                  const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => resolve(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  });
                  newBackgrounds.push(base64);
                }
                setProfile({ ...profile, customBackgrounds: [...(profile.customBackgrounds || []), ...newBackgrounds] });
              }}
            />
            <button
              onClick={() => document.getElementById('bg-upload')?.click()}
              style={{
                width: '100%', height: 56, borderRadius: 14,
                border: '2px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.5)', fontSize: 15, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(56,201,163,0.4)'; e.currentTarget.style.color = '#38c9a3'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              <Plus size={18} />
              添加背景图片 ({(profile.customBackgrounds?.length || 0)}/6)
            </button>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lightbulb size={14} style={{ color: '#d4a054' }} />
              如果不添加自定义图片，将使用内置的3张默认背景
            </p>
          </div>
        </div>

        {/* === 保存按钮 === */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            style={{
              flex: 1, height: 56, borderRadius: 16,
              background: saveStatus === 'saved' ? '#2eb391' : 'linear-gradient(135deg, #38c9a3, #2eb391)',
              border: 'none', color: '#fff', fontSize: 17, fontWeight: 600, letterSpacing: 2,
              cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
              fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
              boxShadow: '0 4px 20px rgba(56,201,163,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.3s',
            }}
          >
            <Save size={18} />
            {saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '已保存' : '保存设置'}
          </button>
          <button
            onClick={handleTest}
            style={{
              padding: '0 32px', height: 56, borderRadius: 16,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: 500, letterSpacing: 1,
              cursor: 'pointer',
              fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(56,201,163,0.4)'; e.currentTarget.style.color = '#38c9a3'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            <Play size={16} />
            立即测试
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.2)', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Lock size={13} />
          所有数据仅保存在本地，绝不上传云端
        </p>
      </div>
    </div>
  );
}

// 挂载 React 到 options-root
const container = document.getElementById('options-root');
if (container) {
  createRoot(container).render(<OptionsPage />);
}
