/**
 * 周报可分享海报（9:16 portrait, 720x1280px）
 * Spotify Wrapped 风格：渐变 + 大字 + 关键数字
 */
import { forwardRef } from 'react';
import { WeeklyReport, TASK_LABELS, WEEKDAY_LABELS } from '@/lib/weeklyReport';

interface Props {
  report: WeeklyReport;
  isDay: boolean;
}

const ShareablePoster = forwardRef<HTMLDivElement, Props>(({ report, isDay }, ref) => {
  const palette = isDay
    ? {
        bg1: '#10b981', bg2: '#34d399', bg3: '#a7f3d0',
        text: '#04231a', textSoft: 'rgba(4,35,26,0.72)',
        accent: '#064e3b', card: 'rgba(255,255,255,0.32)', cardBorder: 'rgba(4,35,26,0.18)',
      }
    : {
        bg1: '#0a1e2e', bg2: '#1a3a4f', bg3: '#38c9a3',
        text: '#e8f4f0', textSoft: 'rgba(232,244,240,0.72)',
        accent: '#80ffd0', card: 'rgba(255,255,255,0.08)', cardBorder: 'rgba(255,255,255,0.18)',
      };

  const ratePercent = Math.round(report.completionRate * 100);
  const topTask = [...report.byTask].sort((a, b) => b.completed - a.completed)[0];

  return (
    <div
      ref={ref}
      style={{
        width: 720,
        height: 1280,
        background: `linear-gradient(160deg, ${palette.bg1} 0%, ${palette.bg2} 55%, ${palette.bg3} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
        color: palette.text,
        padding: '60px 50px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: -120, right: -100, width: 360, height: 360, borderRadius: '50%',
        background: palette.bg3, opacity: 0.35, filter: 'blur(50px)',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, left: -80, width: 320, height: 320, borderRadius: '50%',
        background: palette.bg1, opacity: 0.45, filter: 'blur(60px)',
      }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 18, letterSpacing: 8, opacity: 0.78, marginBottom: 8 }}>青植呼吸</div>
        <div style={{ fontSize: 22, letterSpacing: 4, opacity: 0.85 }}>本周回顾</div>
        <div style={{ fontSize: 16, opacity: 0.65, marginTop: 6 }}>{report.range.label}</div>
      </div>

      {/* Big number */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 60, textAlign: 'center' }}>
        <div style={{ fontSize: 22, opacity: 0.78, marginBottom: 12 }}>本周完成</div>
        <div style={{
          fontSize: 200, fontWeight: 800, lineHeight: 0.9, letterSpacing: -6,
          textShadow: `0 8px 40px ${palette.accent}40`,
        }}>{report.totals.completed}</div>
        <div style={{ fontSize: 22, opacity: 0.78, marginTop: 12 }}>次健康提醒</div>
      </div>

      {/* Stats grid */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 50, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <StatCard label="完成率" value={`${ratePercent}%`} palette={palette} />
        <StatCard label="活跃天数" value={`${report.activeDays} 天`} palette={palette} />
        <StatCard label="最长连击" value={`${report.longestStreak} 天`} palette={palette} />
        <StatCard label="收到提醒" value={`${report.totals.triggered} 次`} palette={palette} />
      </div>

      {/* Daily bars */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 36 }}>
        <div style={{ fontSize: 16, opacity: 0.78, marginBottom: 14, letterSpacing: 2 }}>每日完成</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
          {report.daily.map((d, i) => {
            const max = Math.max(1, ...report.daily.map(x => x.completed));
            const h = (d.completed / max) * 100;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 12, opacity: 0.72 }}>{d.completed || ''}</div>
                <div style={{
                  width: '100%', height: `${h}%`, minHeight: d.completed > 0 ? 4 : 0,
                  background: palette.accent, borderRadius: 6, opacity: 0.85,
                  transition: 'all 0.3s',
                }} />
                <div style={{ fontSize: 13, opacity: 0.7 }}>{WEEKDAY_LABELS[i]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top task */}
      {topTask && topTask.completed > 0 && (
        <div style={{ position: 'relative', zIndex: 1, marginTop: 28 }}>
          <div style={{ fontSize: 14, opacity: 0.78, marginBottom: 6, letterSpacing: 2 }}>最常完成</div>
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            {TASK_LABELS[topTask.taskType]} · {topTask.completed} 次
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center', zIndex: 1,
      }}>
        <div style={{ fontSize: 13, opacity: 0.6, letterSpacing: 4 }}>GreenBreathe · 用温柔的方式关爱自己</div>
      </div>
    </div>
  );
});

ShareablePoster.displayName = 'ShareablePoster';

function StatCard({ label, value, palette }: { label: string; value: string; palette: { card: string; cardBorder: string; textSoft: string } }) {
  return (
    <div style={{
      padding: '18px 20px', borderRadius: 18,
      background: palette.card, border: `1px solid ${palette.cardBorder}`,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{ fontSize: 13, color: palette.textSoft, letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default ShareablePoster;
