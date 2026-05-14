import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { storage } from '@/lib/storage';
import { UserProfile } from '@/types/extension';
import { getTheme, resolveTheme } from '@/lib/theme';
import { aggregateWeekly, getCurrentWeekRange, getLastWeekRange, WeeklyReport, TASK_LABELS, WEEKDAY_LABELS } from '@/lib/weeklyReport';
import { NOTIFICATION_STYLE_LABELS } from '@/lib/notificationStyles';
import { Leaf, Download, Share2, ChevronLeft, ChevronRight, Droplets, Eye, PersonStanding, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import ShareablePoster from '@/components/report/ShareablePoster';

type RangeKey = 'this' | 'last';

export default function ReportPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [rangeKey, setRangeKey] = useState<RangeKey>('last');
  const [showPoster, setShowPoster] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const p = await storage.getUserProfile();
      setProfile(p);
      const logs = await storage.getInteractionLog();
      const range = rangeKey === 'this' ? getCurrentWeekRange() : getLastWeekRange();
      // prev = 上一周（用于环比对比）
      const prevAnchor = new Date(range.start - 24 * 3600 * 1000); // 取 range 开始前 24 小时（即上周日）
      const prev = getCurrentWeekRange(prevAnchor);
      setReport(aggregateWeekly(logs, range, prev));
    })();
  }, [rangeKey]);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#0a1e2e',
      });
      const link = document.createElement('a');
      link.download = `greenbreathe-week-${report?.range.year}-${report?.range.weekNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('[Report] poster export failed:', e);
      alert('海报生成失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  if (!profile || !report) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a1e2e', color: 'rgba(255,255,255,0.5)',
      }}>
        加载中...
      </div>
    );
  }

  const t = getTheme(profile.themeMode);
  const isDay = resolveTheme(profile.themeMode) === 'day';

  return (
    <div style={{
      minHeight: '100vh',
      background: t.bg,
      fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
      color: t.text,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: -160, right: -120, width: 480, height: 480, borderRadius: '50%', background: t.glowOrb1, filter: 'blur(70px)' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -80, width: 360, height: 360, borderRadius: '50%', background: t.glowOrb2, filter: 'blur(70px)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1080, margin: '0 auto', padding: '60px 32px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
            <Leaf size={28} style={{ color: t.accent }} />
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 6, color: t.text }}>本周回顾</h1>
          </div>
          <p style={{ margin: 0, color: t.textMuted, fontSize: 14, letterSpacing: 2 }}>{report.range.label} · 第 {report.range.weekNumber} 周</p>

          {/* Range switcher */}
          <div style={{ display: 'inline-flex', marginTop: 20, padding: 4, borderRadius: 12, background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <button onClick={() => setRangeKey('last')} style={tabBtn(rangeKey === 'last', t)}>
              <ChevronLeft size={14} /> 上一周
            </button>
            <button onClick={() => setRangeKey('this')} style={tabBtn(rangeKey === 'this', t)}>
              本周 <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Section 1: 一句话寄语 + 关键数字 */}
        <Section1 report={report} t={t} isDay={isDay} />

        {/* Section 2: 每日柱状图 */}
        <Section2 report={report} t={t} />

        {/* Section 3: 三类任务对比 */}
        <Section3 report={report} t={t} />

        {/* Section 4: 时段 + 风格 */}
        <Section4 report={report} t={t} />

        {/* Section 5: 行动入口 */}
        <Section5
          report={report}
          t={t}
          onShare={() => setShowPoster(true)}
        />
      </div>

      {/* Share modal */}
      {showPoster && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.78)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
          overflowY: 'auto',
        }} onClick={() => setShowPoster(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
            maxHeight: '95vh',
          }}>
            <div style={{
              transform: 'scale(0.55)', transformOrigin: 'top center',
              marginBottom: -480,  // compensate scale
              boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
              borderRadius: 12,
            }}>
              <ShareablePoster ref={posterRef} report={report} isDay={isDay} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleDownload} disabled={downloading} style={primaryBtn(t)}>
                <Download size={16} />
                {downloading ? '生成中...' : '下载海报'}
              </button>
              <button onClick={() => setShowPoster(false)} style={ghostBtn(t)}>
                关闭
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>海报尺寸 720×1280 (9:16)，适合社交平台分享</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Sections ───────────────────────── */

function Section1({ report, t, isDay }: { report: WeeklyReport; t: ReturnType<typeof getTheme>; isDay: boolean }) {
  const ratePercent = Math.round(report.completionRate * 100);
  const delta = report.weekOverWeekDelta;

  return (
    <div style={cardStyle(t)}>
      <div style={{ fontSize: 13, color: t.textMuted, letterSpacing: 4, marginBottom: 8 }}>本周寄语</div>
      <p style={{ fontSize: 22, lineHeight: 1.6, margin: '0 0 28px', color: t.text, fontWeight: 500 }}>
        {report.message}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <BigStat label="完成" value={report.totals.completed} accent={t.accent} t={t} />
        <BigStat label="完成率" value={`${ratePercent}%`} accent={t.accent} t={t} />
        <BigStat label="活跃天数" value={`${report.activeDays}/7`} accent={t.eyeCare} t={t} />
        <BigStat
          label="较上周"
          value={delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta}`}
          accent={delta === null ? t.textMuted : delta > 0 ? t.accent : delta < 0 ? '#ef4444' : t.textMuted}
          t={t}
          icon={delta === null ? <Minus size={14} /> : delta > 0 ? <TrendingUp size={14} /> : delta < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
        />
      </div>

      {/* Honest breakdown */}
      <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 14, background: t.accentSoft, border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 12, color: t.textMuted, letterSpacing: 2, marginBottom: 10 }}>真实状态分布</div>
        <HonestBar
          completed={report.totals.completed}
          snoozed={report.totals.snoozed}
          ignored={report.totals.ignored}
          accent={t.accent}
          isDay={isDay}
          t={t}
        />
        <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 13, color: t.textSecondary, flexWrap: 'wrap' }}>
          <Legend dot={t.accent} label={`完成 ${report.totals.completed}`} />
          <Legend dot={isDay ? '#f59e0b' : '#fbbf24'} label={`稍后 ${report.totals.snoozed}`} />
          <Legend dot={t.textMuted} label={`未响应 ${report.totals.ignored}`} />
        </div>
      </div>
    </div>
  );
}

function Section2({ report, t }: { report: WeeklyReport; t: ReturnType<typeof getTheme> }) {
  const max = Math.max(1, ...report.daily.map(d => d.total));
  return (
    <div style={cardStyle(t)}>
      <div style={cardTitle(t)}>每日节奏</div>
      <p style={cardDesc(t)}>从颜色看出每天的真实状态：绿色=完成，黄色=稍后，灰色=未响应。</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 220, marginTop: 24 }}>
        {report.daily.map((d, i) => {
          const total = d.total;
          const cH = (d.completed / max) * 200;
          const sH = (d.snoozed / max) * 200;
          const iH = (d.ignored / max) * 200;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 12, color: t.textMuted, height: 16 }}>{total || ''}</div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 200 }}>
                {iH > 0 && <div style={{ height: iH, background: t.textMuted, opacity: 0.5, borderRadius: '6px 6px 0 0' }} />}
                {sH > 0 && <div style={{ height: sH, background: '#f59e0b', opacity: 0.85 }} />}
                {cH > 0 && <div style={{ height: cH, background: t.accent, borderRadius: total === 0 ? 0 : (iH === 0 && sH === 0 ? '6px 6px 0 0' : 0) }} />}
              </div>
              <div style={{ fontSize: 13, color: t.textSecondary, fontWeight: 500 }}>{WEEKDAY_LABELS[i]}</div>
              <div style={{ fontSize: 10, color: t.textMuted }}>{d.date.slice(5)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Section3({ report, t }: { report: WeeklyReport; t: ReturnType<typeof getTheme> }) {
  const colors = { hydration: t.hydration, eyeCare: t.eyeCare, movement: t.movement };
  const icons = {
    hydration: <Droplets size={20} />,
    eyeCare: <Eye size={20} />,
    movement: <PersonStanding size={20} />,
  };
  return (
    <div style={cardStyle(t)}>
      <div style={cardTitle(t)}>三类提醒</div>
      <p style={cardDesc(t)}>看看哪类提醒最容易完成、哪类最常被忽略。</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 20 }}>
        {report.byTask.map(task => {
          const rate = Math.round(task.completionRate * 100);
          return (
            <div key={task.taskType}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: colors[task.taskType] }}>{icons[task.taskType]}</span>
                  <span style={{ fontSize: 16, fontWeight: 500, color: t.text }}>{TASK_LABELS[task.taskType]}</span>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 13, color: t.textSecondary }}>
                  <span>完成 {task.completed}/{task.total}</span>
                  <span style={{ color: colors[task.taskType], fontWeight: 600 }}>{rate}%</span>
                </div>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: t.progressTrack, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${rate}%`, background: `linear-gradient(90deg, ${colors[task.taskType]}, ${colors[task.taskType]}cc)`, borderRadius: 4, transition: 'width 0.5s' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Section4({ report, t }: { report: WeeklyReport; t: ReturnType<typeof getTheme> }) {
  const maxHourCount = Math.max(1, ...report.hourly.map(h => h.total));
  const has24 = Array.from({ length: 24 }, (_, h) => report.hourly.find(x => x.hour === h) || { hour: h, total: 0, completed: 0 });

  return (
    <div style={cardStyle(t)}>
      <div style={cardTitle(t)}>时段分布 & 视觉风格</div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 10 }}>
          {report.bestHour !== null ? `黄金时段：${report.bestHour}:00 - ${report.bestHour + 1}:00` : '本周还没有明显的高效时段'}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
          {has24.map(h => (
            <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div title={`${h.hour}:00 - 完成${h.completed}/总${h.total}`} style={{
                height: `${(h.total / maxHourCount) * 100}%`,
                background: h.completed > 0 ? t.accent : t.textMuted,
                opacity: h.total > 0 ? 0.85 : 0.15,
                borderRadius: 2,
                minHeight: h.total > 0 ? 3 : 1,
              }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: t.textMuted, marginTop: 4 }}>
          <span>0</span><span>6</span><span>12</span><span>18</span><span>24</span>
        </div>
      </div>

      {report.byStyle.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 12 }}>本周看到的视觉风格</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {report.byStyle.map(s => (
              <div key={s.style} style={{
                padding: '8px 14px', borderRadius: 10, background: t.accentSoft, border: `1px solid ${t.border}`,
                fontSize: 13, color: t.textSecondary,
              }}>
                {NOTIFICATION_STYLE_LABELS[s.style]} · {s.count} 次
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section5({ report, t, onShare }: { report: WeeklyReport; t: ReturnType<typeof getTheme>; onShare: () => void }) {
  return (
    <div style={cardStyle(t)}>
      <div style={cardTitle(t)}>下一步</div>
      <p style={{ fontSize: 15, color: t.textSecondary, lineHeight: 1.7, margin: '0 0 24px' }}>
        {report.totals.completed === 0
          ? '可以试着调整提醒间隔，把频率降低一些，从「容易完成」开始。'
          : report.completionRate >= 0.7
          ? '继续保持现在的节奏。如果想挑战，可以把某一类的间隔再缩短 5-10 分钟。'
          : `本周有 ${report.totals.ignored} 次未响应。可以在设置里调整间隔时间，或者在勿扰时段里加上你的专注时间。`}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={onShare} style={primaryBtn(t)}>
          <Share2 size={16} /> 生成分享海报
        </button>
        <button onClick={() => chrome.runtime.openOptionsPage()} style={ghostBtn(t)}>
          打开设置
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Helpers ───────────────────────── */

function BigStat({ label, value, accent, t, icon }: { label: string; value: string | number; accent: string; t: ReturnType<typeof getTheme>; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: '20px 16px', borderRadius: 14, background: t.accentSoft, border: `1px solid ${t.border}`, textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: t.textMuted, letterSpacing: 2, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {icon}{value}
      </div>
    </div>
  );
}

function HonestBar({ completed, snoozed, ignored, accent, isDay, t }: { completed: number; snoozed: number; ignored: number; accent: string; isDay: boolean; t: ReturnType<typeof getTheme> }) {
  const total = completed + snoozed + ignored;
  if (total === 0) {
    return <div style={{ height: 14, borderRadius: 7, background: t.progressTrack }} />;
  }
  const cP = (completed / total) * 100;
  const sP = (snoozed / total) * 100;
  return (
    <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', background: t.progressTrack }}>
      <div style={{ width: `${cP}%`, background: accent }} />
      <div style={{ width: `${sP}%`, background: isDay ? '#f59e0b' : '#fbbf24' }} />
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />
      {label}
    </span>
  );
}

function cardStyle(t: ReturnType<typeof getTheme>) {
  return {
    background: t.card,
    border: `1px solid ${t.cardBorder}`,
    borderRadius: 20,
    padding: '32px 36px',
    marginBottom: 20,
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  } as const;
}
function cardTitle(t: ReturnType<typeof getTheme>) {
  return { fontSize: 20, fontWeight: 600, color: t.text, marginBottom: 8 } as const;
}
function cardDesc(t: ReturnType<typeof getTheme>) {
  return { fontSize: 14, color: t.textMuted, lineHeight: 1.6, margin: '0 0 4px' } as const;
}
function tabBtn(active: boolean, t: ReturnType<typeof getTheme>) {
  return {
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: active ? t.accent : 'transparent',
    color: active ? t.textOnAccent : t.textSecondary,
    fontSize: 13, fontWeight: 500, letterSpacing: 1,
    fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
    display: 'inline-flex', alignItems: 'center', gap: 4,
    transition: 'all 0.3s',
  } as const;
}
function primaryBtn(t: ReturnType<typeof getTheme>) {
  return {
    padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
    background: `linear-gradient(135deg, ${t.accent}, ${t.accentHover})`,
    color: t.textOnAccent, fontSize: 14, fontWeight: 600, letterSpacing: 1,
    fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
    boxShadow: `0 4px 16px ${t.accentGlow}`,
    display: 'inline-flex', alignItems: 'center', gap: 8,
    transition: 'all 0.3s',
  } as const;
}
function ghostBtn(t: ReturnType<typeof getTheme>) {
  return {
    padding: '12px 24px', borderRadius: 12, cursor: 'pointer',
    background: t.card, border: `1px solid ${t.cardBorder}`, color: t.textSecondary,
    fontSize: 14, fontWeight: 500, letterSpacing: 1,
    fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
    display: 'inline-flex', alignItems: 'center', gap: 8,
    transition: 'all 0.3s',
  } as const;
}
