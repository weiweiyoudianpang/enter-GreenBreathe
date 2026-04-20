import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import '@/index.css';
import { UserProfile, ThemeMode } from '@/types/extension';
import { loadUserProfile, saveUserProfile } from '@/lib/storage';
import { getTheme, resolveTheme, ThemeColors } from '@/lib/theme';
import { Droplets, Eye, PersonStanding, User, Clock, Palette, Save, Play, ChevronDown, Plus, X, Volume2, Minimize2, ImagePlus, Lightbulb, Lock, Leaf, Sun, Moon, SunMoon, Timer, Paintbrush } from 'lucide-react';

const defaultProfile: UserProfile = {
  nickname: '朋友', mbtiType: 'INFP', hydrationInterval: 45, eyeCareInterval: 20,
  movementInterval: 60, quietHours: [], notificationPosition: 'top_right',
  minimalMode: false, soundEnabled: false, themeMode: 'auto',
};

const mbtiTypes = [
  { value: 'INTJ', label: 'INTJ - 建筑师' }, { value: 'INTP', label: 'INTP - 逻辑学家' },
  { value: 'ENTJ', label: 'ENTJ - 指挥官' }, { value: 'ENTP', label: 'ENTP - 辩论家' },
  { value: 'INFJ', label: 'INFJ - 提倡者' }, { value: 'INFP', label: 'INFP - 调停者' },
  { value: 'ENFJ', label: 'ENFJ - 主人公' }, { value: 'ENFP', label: 'ENFP - 竞选者' },
  { value: 'ISTJ', label: 'ISTJ - 物流师' }, { value: 'ISFJ', label: 'ISFJ - 守卫者' },
  { value: 'ESTJ', label: 'ESTJ - 总经理' }, { value: 'ESFJ', label: 'ESFJ - 执政官' },
  { value: 'ISTP', label: 'ISTP - 鉴赏家' }, { value: 'ISFP', label: 'ISFP - 探险家' },
  { value: 'ESTP', label: 'ESTP - 企业家' }, { value: 'ESFP', label: 'ESFP - 表演者' },
];

const positionOptions = [
  { value: 'top_right', label: '右上角' }, { value: 'top_left', label: '左上角' },
  { value: 'bottom_right', label: '右下角' }, { value: 'bottom_left', label: '左下角' },
];

const cardSizeOptions = [
  { value: 'small', label: '小 (960x570)' },
  { value: 'medium', label: '中 (1280x760)' },
  { value: 'large', label: '大 (1600x950)' },
];

function getStyles(t: ThemeColors, isDay: boolean) {
  const selectDropdownBg = isDay ? '#ffffff' : '#0f2a3e';
  const selectDropdownColor = isDay ? '#064e3b' : '#fff';
  return {
    page: { minHeight: '100vh' as const, background: t.bg, fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif", position: 'relative' as const, overflow: 'hidden' as const },
    bgLayer: { position: 'absolute' as const, inset: 0, background: t.bgGradient },
    container: { maxWidth: 800, margin: '0 auto', padding: '48px 24px 64px', position: 'relative' as const, zIndex: 1 },
    card: { background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 20, padding: '32px 28px', marginBottom: 24, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' },
    cardTitle: { display: 'flex' as const, alignItems: 'center' as const, gap: 12, fontSize: 20, fontWeight: 600, color: t.text, marginBottom: 8 },
    cardDesc: { fontSize: 14, color: t.textMuted, marginBottom: 28, lineHeight: 1.6 },
    label: { fontSize: 15, fontWeight: 500, color: t.textSecondary, marginBottom: 8, display: 'block' as const },
    input: { width: '100%', height: 48, borderRadius: 14, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 16, padding: '0 16px', outline: 'none', fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif", transition: 'all 0.3s', boxSizing: 'border-box' as const },
    select: { width: '100%', height: 48, borderRadius: 14, border: `1px solid ${t.inputBorder}`, background: t.inputBg, color: t.text, fontSize: 16, padding: '0 16px', outline: 'none', fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif", cursor: 'pointer', appearance: 'none' as const, WebkitAppearance: 'none' as const, boxSizing: 'border-box' as const },
    hint: { fontSize: 13, color: t.textMuted, marginTop: 8, lineHeight: 1.6 },
    intervalBlock: { padding: 24, borderRadius: 16, background: t.accentSoft, border: `1px solid ${t.border}`, marginBottom: 20 },
    intervalHeader: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 16 },
    intervalLabel: { display: 'flex' as const, alignItems: 'center' as const, gap: 10, fontSize: 16, fontWeight: 500, color: t.text },
    badge: (color: string) => ({ fontSize: 14, fontWeight: 600, color, background: `${color}18`, padding: '4px 14px', borderRadius: 20, border: `1px solid ${color}30` }),
    switchRow: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, padding: '18px 20px', borderRadius: 14, background: t.accentSoft, border: `1px solid ${t.border}`, marginBottom: 12 },
    selectDropdownBg,
    selectDropdownColor,
  };
}

function CustomSlider({ value, onChange, color, t, isDay, min = 0, max = 120, step = 5 }: { value: number; onChange: (v: number) => void; color: string; t: ThemeColors; isDay: boolean; min?: number; max?: number; step?: number }) {
  const id = `slider-${color.replace('#', '')}`;
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div style={{ position: 'relative', height: 32, display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, height: 6, borderRadius: 3, background: t.progressTrack }} />
      <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className={id}
        style={{ width: '100%', height: 6, borderRadius: 3, appearance: 'none', WebkitAppearance: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', position: 'relative', zIndex: 1 }}
      />
      <style>{`
        .${id}::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
          background: ${color}; border: 3px solid ${isDay ? '#fff' : '#0a1e2e'};
          box-shadow: 0 0 10px ${color}60; cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function CustomSwitch({ checked, onChange, t }: { checked: boolean; onChange: (v: boolean) => void; t: ThemeColors }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: 48, height: 26, borderRadius: 13, padding: 3,
      background: checked ? t.accent : t.progressTrack,
      border: 'none', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', flexShrink: 0,
    }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'all 0.3s', transform: checked ? 'translateX(22px)' : 'translateX(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

/* Background image gallery for a specific mode */
function BackgroundGallery({ images, onRemove, onAdd, label, icon, t, isDay }: {
  images: string[]; onRemove: (i: number) => void; onAdd: (files: File[]) => void;
  label: string; icon: React.ReactNode; t: ThemeColors; isDay: boolean;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {icon}
        <span style={{ fontSize: 15, fontWeight: 500, color: t.text }}>{label}</span>
        <span style={{ fontSize: 12, color: t.textMuted, marginLeft: 'auto' }}>{images.length}/6</span>
      </div>
      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
          {images.map((bg, i) => (
            <div key={i} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', border: `1px solid ${t.cardBorder}` }}>
              <img src={bg} alt={`背景图 ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => onRemove(i)} style={{
                position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(220,50,50,0.85)', border: 'none', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7, transition: 'opacity 0.2s',
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
      <input type="file" id={`bg-upload-${label}`} accept="image/png,image/jpeg,image/jpg" multiple style={{ display: 'none' }}
        onChange={async (e) => {
          const files = Array.from(e.target.files || []);
          if (files.length === 0) return;
          if (images.length + files.length > 6) { alert('每个模式最多只能添加6张背景图片'); return; }
          const valid: File[] = [];
          for (const f of files) {
            if (f.size > 10 * 1024 * 1024) { alert(`图片 ${f.name} 超过 10MB，请选择更小的图片`); continue; }
            valid.push(f);
          }
          onAdd(valid);
        }}
      />
      <button onClick={() => document.getElementById(`bg-upload-${label}`)?.click()} style={{
        width: '100%', height: 48, borderRadius: 14,
        border: `2px dashed ${t.cardBorder}`, background: t.accentSoft,
        color: t.textMuted, fontSize: 14, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif", transition: 'all 0.3s',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.color = t.textMuted; }}
      >
        <Plus size={16} />
        添加背景图片
      </button>
    </div>
  );
}

function OptionsPage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => { loadUserProfile().then((loaded) => { if (loaded) setProfile(loaded); }); }, []);

  const effectiveTheme = resolveTheme(profile.themeMode);
  const isDay = effectiveTheme === 'day';
  const t = getTheme(profile.themeMode);
  const s = getStyles(t, isDay);

  const handleSave = async () => {
    setSaveStatus('saving');
    await saveUserProfile(profile);
    chrome.runtime.sendMessage({ type: 'UPDATE_ALARM' });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };
  const handleTest = () => { chrome.runtime.sendMessage({ type: 'TRIGGER_TEST_NOTIFICATION' }); };

  const formatIntervalLabel = (m: number) => {
    if (m === 0) return '不提醒';
    if (m < 60) return `${m}分钟`;
    const h = Math.floor(m / 60); const r = m % 60;
    return r > 0 ? `${h}小时${r}分钟` : `${h}小时`;
  };

  const readFileAsBase64 = (file: File): Promise<string> => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });

  const addDayBgs = async (files: File[]) => {
    const bgs: string[] = [];
    for (const f of files) bgs.push(await readFileAsBase64(f));
    setProfile({ ...profile, customBackgroundsDay: [...(profile.customBackgroundsDay || []), ...bgs] });
  };
  const addNightBgs = async (files: File[]) => {
    const bgs: string[] = [];
    for (const f of files) bgs.push(await readFileAsBase64(f));
    setProfile({ ...profile, customBackgroundsNight: [...(profile.customBackgroundsNight || []), ...bgs] });
  };
  const removeDayBg = (i: number) => setProfile({ ...profile, customBackgroundsDay: (profile.customBackgroundsDay || []).filter((_, idx) => idx !== i) });
  const removeNightBg = (i: number) => setProfile({ ...profile, customBackgroundsNight: (profile.customBackgroundsNight || []).filter((_, idx) => idx !== i) });

  const themeModeLabel = profile.themeMode === 'day' ? '白天模式' : profile.themeMode === 'night' ? '夜间模式' : '自动切换';

  return (
    <div style={s.page}>
      <div style={s.bgLayer} />
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: -120, right: -100, width: 400, height: 400, borderRadius: '50%', background: t.glowOrb1, filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -60, width: 300, height: 300, borderRadius: '50%', background: t.glowOrb2, filter: 'blur(60px)' }} />

      <div style={s.container}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <Leaf size={28} style={{ color: t.accent }} />
            <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: 4, margin: 0, color: t.text }}>
              青植呼吸
            </h1>
          </div>
          <p style={{ fontSize: 16, color: t.textMuted, letterSpacing: 2, margin: 0 }}>用温柔的方式，提醒你关爱自己</p>
        </div>

        {/* Card 1: 主题模式 */}
        <div style={s.card}>
          <div style={s.cardTitle}>
            <SunMoon size={22} style={{ color: t.accent }} />
            主题模式
          </div>
          <p style={s.cardDesc}>选择白天或夜间模式，或者让系统根据时间自动切换（6:00-18:00 为白天）</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { mode: 'day' as ThemeMode, icon: <Sun size={18} />, label: '白天', desc: '翠绿 · 清新 · 朝气' },
              { mode: 'auto' as ThemeMode, icon: <SunMoon size={18} />, label: '自动', desc: '随时间自动切换' },
              { mode: 'night' as ThemeMode, icon: <Moon size={18} />, label: '夜间', desc: '深蓝 · 沉静 · 治愈' },
            ].map((item) => {
              const active = profile.themeMode === item.mode;
              return (
                <button key={item.mode} onClick={() => setProfile({ ...profile, themeMode: item.mode })} style={{
                  flex: 1, padding: '16px 12px', borderRadius: 14, cursor: 'pointer',
                  background: active ? t.accentGlow : t.accentSoft,
                  border: active ? `2px solid ${t.accent}` : `1px solid ${t.border}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  transition: 'all 0.3s', fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
                }}>
                  <div style={{ color: active ? t.accent : t.textMuted }}>{item.icon}</div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: active ? t.accent : t.text }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: t.textMuted }}>{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: 基础设置 */}
        <div style={s.card}>
          <div style={s.cardTitle}><User size={22} style={{ color: t.accent }} />基础设置</div>
          <p style={s.cardDesc}>个性化你的健康提醒体验</p>
          <div style={{ marginBottom: 24 }}>
            <label style={s.label}>昵称</label>
            <input value={profile.nickname} onChange={(e) => setProfile({ ...profile, nickname: e.target.value })} placeholder="输入你的昵称" style={s.input}
              onFocus={(e) => { e.target.style.borderColor = t.accent; e.target.style.background = isDay ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.08)'; }}
              onBlur={(e) => { e.target.style.borderColor = t.inputBorder; e.target.style.background = t.inputBg; }}
            />
          </div>
          <div>
            <label style={s.label}>MBTI 性格类型</label>
            <div style={{ position: 'relative' }}>
              <select value={profile.mbtiType} onChange={(e) => setProfile({ ...profile, mbtiType: e.target.value as UserProfile['mbtiType'] })} style={s.select}>
                {mbtiTypes.map((type) => <option key={type.value} value={type.value} style={{ background: s.selectDropdownBg, color: s.selectDropdownColor }}>{type.label}</option>)}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: t.textMuted, pointerEvents: 'none' }} />
            </div>
            <p style={s.hint}>根据你的性格类型定制鼓励语表达方式</p>
          </div>
        </div>

        {/* Card 3: 提醒间隔 */}
        <div style={s.card}>
          <div style={s.cardTitle}><Clock size={22} style={{ color: t.hydration }} />提醒间隔</div>
          <p style={s.cardDesc}>为每种健康提醒设置不同的间隔时间，0分钟表示不提醒</p>
          <div style={s.intervalBlock}>
            <div style={s.intervalHeader}>
              <div style={s.intervalLabel}><Droplets size={20} style={{ color: t.hydration }} />喝水提醒</div>
              <span style={s.badge(t.hydration)}>{formatIntervalLabel(profile.hydrationInterval)}</span>
            </div>
            <CustomSlider value={profile.hydrationInterval} onChange={(v) => setProfile({ ...profile, hydrationInterval: v })} color={t.hydration} t={t} isDay={isDay} />
            <p style={s.hint}>科学建议：每30-60分钟补充150-200ml水分</p>
          </div>
          <div style={s.intervalBlock}>
            <div style={s.intervalHeader}>
              <div style={s.intervalLabel}><Eye size={20} style={{ color: t.eyeCare }} />眼睛休息提醒</div>
              <span style={s.badge(t.eyeCare)}>{formatIntervalLabel(profile.eyeCareInterval)}</span>
            </div>
            <CustomSlider value={profile.eyeCareInterval} onChange={(v) => setProfile({ ...profile, eyeCareInterval: v })} color={t.eyeCare} t={t} isDay={isDay} />
            <p style={s.hint}>科学建议：每20分钟执行20-20-20法则，有效缓解视疲劳</p>
          </div>
          <div style={s.intervalBlock}>
            <div style={s.intervalHeader}>
              <div style={s.intervalLabel}><PersonStanding size={20} style={{ color: t.movement }} />身体活动提醒</div>
              <span style={s.badge(t.movement)}>{formatIntervalLabel(profile.movementInterval)}</span>
            </div>
            <CustomSlider value={profile.movementInterval} onChange={(v) => setProfile({ ...profile, movementInterval: v })} color={t.movement} t={t} isDay={isDay} />
            <p style={s.hint}>科学建议：每60分钟站立活动2-5分钟，促进血液循环</p>
          </div>
        </div>

        {/* Card 4: 外观设置 */}
        <div style={s.card}>
          <div style={s.cardTitle}><Palette size={22} style={{ color: isDay ? '#f59e0b' : '#d4a054' }} />外观设置</div>
          <div style={{ marginBottom: 24 }}>
            <label style={s.label}>弹窗位置</label>
            <div style={{ position: 'relative' }}>
              <select value={profile.notificationPosition} onChange={(e) => setProfile({ ...profile, notificationPosition: e.target.value as UserProfile['notificationPosition'] })} style={s.select}>
                {positionOptions.map((o) => <option key={o.value} value={o.value} style={{ background: s.selectDropdownBg, color: s.selectDropdownColor }}>{o.label}</option>)}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: t.textMuted, pointerEvents: 'none' }} />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={s.label}>卡片尺寸</label>
            <div style={{ position: 'relative' }}>
              <select value={profile.cardSize || 'medium'} onChange={(e) => setProfile({ ...profile, cardSize: e.target.value as UserProfile['cardSize'] })} style={s.select}>
                {cardSizeOptions.map((o) => <option key={o.value} value={o.value} style={{ background: s.selectDropdownBg, color: s.selectDropdownColor }}>{o.label}</option>)}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: t.textMuted, pointerEvents: 'none' }} />
            </div>
            <p style={s.hint}>根据你的屏幕大小选择合适的卡片尺寸</p>
          </div>
          {/* 水墨动画时长 */}
          <div style={s.intervalBlock}>
            <div style={s.intervalHeader}>
              <div style={s.intervalLabel}><Paintbrush size={20} style={{ color: isDay ? '#8b5cf6' : '#a78bfa' }} />水墨晕开时长</div>
              <span style={s.badge(isDay ? '#8b5cf6' : '#a78bfa')}>{profile.inkDuration ?? 3}秒{(profile.inkDuration ?? 3) === 0 ? '（关闭动画）' : ''}</span>
            </div>
            <CustomSlider value={profile.inkDuration ?? 3} onChange={(v) => setProfile({ ...profile, inkDuration: v })} color={isDay ? '#8b5cf6' : '#a78bfa'} t={t} isDay={isDay} min={0} max={10} />
            <p style={s.hint}>控制背景图水墨晕开动画的时长，0秒表示关闭动画直接显示</p>
          </div>
          {/* 卡片存留时长 */}
          <div style={s.intervalBlock}>
            <div style={s.intervalHeader}>
              <div style={s.intervalLabel}><Timer size={20} style={{ color: isDay ? '#ec4899' : '#f472b6' }} />卡片存留时长</div>
              <span style={s.badge(isDay ? '#ec4899' : '#f472b6')}>{profile.cardDisplayDuration ?? 20}秒</span>
            </div>
            <CustomSlider value={profile.cardDisplayDuration ?? 20} onChange={(v) => setProfile({ ...profile, cardDisplayDuration: v })} color={isDay ? '#ec4899' : '#f472b6'} t={t} isDay={isDay} min={10} max={60} />
            <p style={s.hint}>提醒卡片在屏幕上停留的时间，超时后自动关闭</p>
          </div>
          <div style={s.switchRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Volume2 size={16} style={{ color: isDay ? '#f59e0b' : '#d4a054' }} />
                <span style={{ fontSize: 15, fontWeight: 500, color: t.text }}>提示音</span>
              </div>
              <span style={{ fontSize: 13, color: t.textMuted }}>播放柔和的提示音</span>
            </div>
            <CustomSwitch checked={profile.soundEnabled ?? false} onChange={(v) => setProfile({ ...profile, soundEnabled: v })} t={t} />
          </div>
          <div style={s.switchRow}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Minimize2 size={16} style={{ color: isDay ? '#f59e0b' : '#d4a054' }} />
                <span style={{ fontSize: 15, fontWeight: 500, color: t.text }}>极简模式</span>
              </div>
              <span style={{ fontSize: 13, color: t.textMuted }}>仅显示状态栏图标</span>
            </div>
            <CustomSwitch checked={profile.minimalMode} onChange={(v) => setProfile({ ...profile, minimalMode: v })} t={t} />
          </div>
        </div>

        {/* Card 5: 背景图片管理 */}
        <div style={s.card}>
          <div style={s.cardTitle}><ImagePlus size={22} style={{ color: isDay ? '#f59e0b' : '#d4a054' }} />自定义背景图片</div>
          <p style={s.cardDesc}>分别为白天和夜间模式设置不同风格的背景图片，建议尺寸 1920x1080 或更高，单张不超过 10MB</p>

          <BackgroundGallery
            images={profile.customBackgroundsDay || []}
            onRemove={removeDayBg}
            onAdd={addDayBgs}
            label="白天模式背景"
            icon={<Sun size={18} style={{ color: '#f59e0b' }} />}
            t={t} isDay={isDay}
          />
          <BackgroundGallery
            images={profile.customBackgroundsNight || []}
            onRemove={removeNightBg}
            onAdd={addNightBgs}
            label="夜间模式背景"
            icon={<Moon size={18} style={{ color: '#7c5cbf' }} />}
            t={t} isDay={isDay}
          />

          <p style={{ fontSize: 13, color: t.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lightbulb size={14} style={{ color: isDay ? '#f59e0b' : '#d4a054' }} />
            如果不添加自定义图片，将使用对应模式的内置默认背景
          </p>
        </div>

        {/* Save / Test buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={handleSave} disabled={saveStatus === 'saving'} style={{
            flex: 1, height: 56, borderRadius: 16,
            background: saveStatus === 'saved' ? t.accentHover : `linear-gradient(135deg, ${t.accent}, ${t.accentHover})`,
            border: 'none', color: t.textOnAccent, fontSize: 17, fontWeight: 600, letterSpacing: 2,
            cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
            fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
            boxShadow: `0 4px 20px ${t.accentGlow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.3s',
          }}>
            <Save size={18} />
            {saveStatus === 'saving' ? '保存中...' : saveStatus === 'saved' ? '已保存' : '保存设置'}
          </button>
          <button onClick={handleTest} style={{
            padding: '0 32px', height: 56, borderRadius: 16,
            background: t.card, border: `1px solid ${t.cardBorder}`,
            color: t.textSecondary, fontSize: 16, fontWeight: 500, letterSpacing: 1, cursor: 'pointer',
            fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.3s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.cardBorder; e.currentTarget.style.color = t.textSecondary; }}
          >
            <Play size={16} />
            立即测试
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: t.textMuted, marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Lock size={13} />
          所有数据仅保存在本地，绝不上传云端
        </p>
      </div>
    </div>
  );
}

const container = document.getElementById('options-root');
if (container) { createRoot(container).render(<OptionsPage />); }
