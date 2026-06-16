import { useEffect, useRef, useState, useMemo } from 'react';
import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';
import { storage } from '@/lib/storage';
import { UserProfile } from '@/types/extension';
import { getTheme, resolveTheme } from '@/lib/theme';
import {
  aggregateWeekly, getCurrentWeekRange, getLastWeekRange,
  getDailyDetails, dailyDetailsToSheetData,
  WeeklyReport, TASK_LABELS, WEEKDAY_LABELS, DayDetail,
} from '@/lib/weeklyReport';
import { NOTIFICATION_STYLE_LABELS } from '@/lib/notificationStyles';
import {
  Leaf, Download, Share2, ChevronLeft, ChevronRight,
  Droplets, Eye, PersonStanding, TrendingUp, TrendingDown, Minus,
  FileSpreadsheet, CalendarDays, BarChart3,
} from 'lucide-react';
import ShareablePoster from '@/components/report/ShareablePoster';

type RangeKey = 'this' | 'last';
type TabKey = 'weekly' | 'daily';
type DayRange = 7 | 14 | 30 | 60;

export default function ReportPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [dailyDetails, setDailyDetails] = useState<DayDetail[]>([]);
  const [rangeKey, setRangeKey] = useState<RangeKey>('last');
  const [activeTab, setActiveTab] = useState<TabKey>('weekly');
  const [dayRange, setDayRange] = useState<DayRange>(30);
  const [showPoster, setShowPoster] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [exportingXLSX, setExportingXLSX] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const p = await storage.getUserProfile();
      setProfile(p);
      const logs = await storage.getInteractionLog();

      // Weekly report
      const range = rangeKey === 'this' ? getCurrentWeekRange() : getLastWeekRange();
      const prevAnchor = new Date(range.start - 24 * 3600 * 1000);
      const prev = getCurrentWeekRange(prevAnchor);
      setReport(aggregateWeekly(logs, range, prev));

      // Daily details
      setDailyDetails(getDailyDetails(logs, 60));
    })();
  }, [rangeKey]);

  const visibleDays = useMemo(() => dailyDetails.slice(0, dayRange), [dailyDetails, dayRange]);

  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(posterRef.current, { pixelRatio: 2, cacheBust: true, backgroundColor: '#0a1e2e' });
      const link = document.createElement('a');
      link.download = `greenbreathe-week-${report?.range.year}-${report?.range.weekNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('海报生成失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportXLSX = () => {
    setExportingXLSX(true);
    try {
      const sheetData = dailyDetailsToSheetData(visibleDays);
      const ws = XLSX.utils.aoa_to_sheet(sheetData);

      // Column widths
      ws['!cols'] = [
        { wch: 12 }, { wch: 8 },
        { wch: 8 }, { wch: 8 }, { wch: 6 }, { wch: 8 }, { wch: 10 },
        { wch: 8 }, { wch: 8 }, { wch: 6 }, { wch: 10 },
        { wch: 8 }, { wch: 8 }, { wch: 6 }, { wch: 10 },
        { wch: 8 }, { wch: 8 }, { wch: 6 }, { wch: 10 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '每日明细');

      // Also add a weekly summary tab if available
      if (report) {
        const wsSummary = XLSX.utils.aoa_to_sheet([
          ['统计维度', '数值'],
          ['周期', report.range.label],
          ['收到提醒', report.totals.triggered],
          ['完成', report.totals.completed],
          ['稍后', report.totals.snoozed],
          ['未响应', report.totals.ignored],
          ['完成率', `${Math.round(report.completionRate * 100)}%`],
          ['活跃天数', report.activeDays],
          ['最长连击', `${report.longestStreak} 天`],
        ]);
        XLSX.utils.book_append_sheet(wb, wsSummary, '本周汇总');
      }

      XLSX.writeFile(wb, `greenbreathe-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e) {
      console.error('[Report] XLSX export failed:', e);
      alert('导出失败，请重试');
    } finally {
      setExportingXLSX(false);
    }
  };

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a1e2e', color: 'rgba(255,255,255,0.5)' }}>
        加载中...
      </div>
    );
  }

  const t = getTheme(profile.themeMode);
  const isDay = resolveTheme(profile.themeMode) === 'day';

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif", color: t.text, position: 'relative', overflow: 'hidden' }}>
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: -160, right: -120, width: 480, height: 480, borderRadius: '50%', background: t.glowOrb1, filter: 'blur(70px)' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -80, width: 360, height: 360, borderRadius: '50%', background: t.glowOrb2, filter: 'blur(70px)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '56px 32px 80px' }}>
        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <Leaf size={28} style={{ color: t.accent }} />
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: 6, color: t.text }}>青植回顾</h1>
          </div>
          <p style={{ margin: 0, color: t.textMuted, fontSize: 13, letterSpacing: 2 }}>诚实记录你的每一次健康尝试</p>
        </div>

        {/* ── Top-level Tab: 本周回顾 / 每日明细 ── */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          <TabButton active={activeTab === 'weekly'} onClick={() => setActiveTab('weekly')} t={t} icon={<BarChart3 size={15} />}>本周回顾</TabButton>
          <TabButton active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} t={t} icon={<CalendarDays size={15} />}>每日明细</TabButton>
        </div>

        {/* ════ WEEKLY REPORT ════ */}
        {activeTab === 'weekly' && (
          <>
            {/* Week range switcher */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ display: 'inline-flex', padding: 4, borderRadius: 12, background: t.card, border: `1px solid ${t.cardBorder}` }}>
                <button onClick={() => setRangeKey('last')} style={smallTabBtn(rangeKey === 'last', t)}>
                  <ChevronLeft size={13} /> 上一周
                </button>
                <button onClick={() => setRangeKey('this')} style={smallTabBtn(rangeKey === 'this', t)}>
                  本周 <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {report ? (
              <>
                <WeeklySectionMessage report={report} t={t} isDay={isDay} />
                <WeeklySectionDaily report={report} t={t} />
                <WeeklySectionTasks report={report} t={t} />
                <WeeklySectionHourly report={report} t={t} />
                <WeeklySectionAction report={report} t={t} onShare={() => setShowPoster(true)} />
              </>
            ) : (
              <div style={{ textAlign: 'center', color: t.textMuted, padding: 40 }}>加载中...</div>
            )}
          </>
        )}

        {/* ════ DAILY DETAIL ════ */}
        {activeTab === 'daily' && (
          <DailyView
            details={visibleDays}
            dayRange={dayRange}
            onChangeDayRange={setDayRange}
            onExport={handleExportXLSX}
            exportingXLSX={exportingXLSX}
            t={t}
            isDay={isDay}
          />
        )}
      </div>

      {/* ── Share poster modal ── */}
      {showPoster && report && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}
          onClick={() => setShowPoster(false)}
        >
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxHeight: '95vh' }}>
            <div style={{ transform: 'scale(0.52)', transformOrigin: 'top center', marginBottom: -500, boxShadow: '0 30px 80px rgba(0,0,0,0.5)', borderRadius: 12 }}>
              <ShareablePoster ref={posterRef} report={report} isDay={isDay} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleDownloadPoster} disabled={downloading} style={primaryBtn(t)}>
                <Download size={16} /> {downloading ? '生成中...' : '下载海报'}
              </button>
              <button onClick={() => setShowPoster(false)} style={ghostBtn(t)}>关闭</button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>720×1280 (9:16) · 适合社交平台分享</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Daily View Component
════════════════════════════════════════ */

function DailyView({ details, dayRange, onChangeDayRange, onExport, exportingXLSX, t, isDay }: {
  details: DayDetail[];
  dayRange: DayRange;
  onChangeDayRange: (d: DayRange) => void;
  onExport: () => void;
  exportingXLSX: boolean;
  t: ReturnType<typeof getTheme>;
  isDay: boolean;
}) {
  const colors = { hydration: t.hydration, eyeCare: t.eyeCare, movement: t.movement };

  // Summary stats from visible days
  const totalCompleted = details.reduce((s, d) => s + d.totalCompleted, 0);
  const totalTriggered = details.reduce((s, d) => s + d.totalTriggered, 0);
  const activeDays = details.filter(d => d.totalTriggered > 0).length;
  const overallRate = totalTriggered > 0 ? Math.round((totalCompleted / totalTriggered) * 100) : 0;

  return (
    <div>
      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        {/* Range selector */}
        <div style={{ display: 'flex', gap: 8 }}>
          {([7, 14, 30, 60] as DayRange[]).map(d => (
            <button key={d} onClick={() => onChangeDayRange(d)} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
              background: dayRange === d ? t.accent : t.card,
              color: dayRange === d ? t.textOnAccent : t.textSecondary,
              border: `1px solid ${dayRange === d ? t.accent : t.cardBorder}`,
              transition: 'all 0.2s',
            }}>
              {d === 7 ? '近 7 天' : d === 14 ? '近 14 天' : d === 30 ? '近 30 天' : '近 60 天'}
            </button>
          ))}
        </div>

        {/* Export button */}
        <button onClick={onExport} disabled={exportingXLSX} style={{
          ...primaryBtn(t),
          padding: '8px 18px', fontSize: 13,
        }}>
          <FileSpreadsheet size={14} />
          {exportingXLSX ? '导出中...' : '导出 XLSX'}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <MiniStat label="完成总次数" value={totalCompleted} color={t.accent} t={t} />
        <MiniStat label="收到提醒" value={totalTriggered} color={t.textSecondary} t={t} />
        <MiniStat label="活跃天数" value={`${activeDays} 天`} color={t.eyeCare} t={t} />
        <MiniStat label="总完成率" value={`${overallRate}%`} color={t.hydration} t={t} />
      </div>

      {/* Daily table */}
      <div style={{ ...cardStyle(t), padding: 0, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '130px 70px 70px 70px  1fr 1fr 1fr',
          padding: '14px 20px',
          background: isDay ? 'rgba(16,185,129,0.08)' : 'rgba(56,201,163,0.06)',
          borderBottom: `1px solid ${t.cardBorder}`,
          gap: 8,
        }}>
          <div style={thStyle(t)}>日期</div>
          <div style={{ ...thStyle(t), textAlign: 'center' }}>完成</div>
          <div style={{ ...thStyle(t), textAlign: 'center' }}>稍后</div>
          <div style={{ ...thStyle(t), textAlign: 'center' }}>未响应</div>
          <TaskHeader color={colors.hydration} label="喝水" t={t} />
          <TaskHeader color={colors.eyeCare} label="眼睛" t={t} />
          <TaskHeader color={colors.movement} label="活动" t={t} />
        </div>

        {/* Rows */}
        <div style={{ overflowY: 'auto', maxHeight: 520 }}>
          {details.map((d, i) => (
            <div
              key={d.date}
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 70px 70px 70px  1fr 1fr 1fr',
                padding: '12px 20px',
                borderBottom: i < details.length - 1 ? `1px solid ${t.cardBorder}` : 'none',
                background: i % 2 === 0 ? 'transparent' : isDay ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                gap: 8,
                alignItems: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = isDay ? 'rgba(16,185,129,0.05)' : 'rgba(56,201,163,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : isDay ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'; }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{d.dateLabel}</div>
                {d.totalTriggered === 0 && <div style={{ fontSize: 11, color: t.textMuted }}>无记录</div>}
              </div>
              <NumCell value={d.totalCompleted} total={d.totalTriggered} color={t.accent} t={t} />
              <NumCell value={d.totalSnoozed} total={d.totalTriggered} color={isDay ? '#f59e0b' : '#fbbf24'} t={t} />
              <NumCell value={d.totalIgnored} total={d.totalTriggered} color={t.textMuted} t={t} />
              <TaskCell data={d.byTask.hydration} color={colors.hydration} t={t} />
              <TaskCell data={d.byTask.eyeCare} color={colors.eyeCare} t={t} />
              <TaskCell data={d.byTask.movement} color={colors.movement} t={t} />
            </div>
          ))}

          {details.length === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: t.textMuted, fontSize: 14 }}>
              暂无记录
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${t.cardBorder}`, fontSize: 12, color: t.textMuted, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <span>每个任务格：<strong style={{ color: t.text }}>完成 / 稍后 / 未响应</strong></span>
          <span>导出 XLSX 包含全部明细数据</span>
        </div>
      </div>
    </div>
  );
}

function TaskHeader({ color, label, t }: { color: string; label: string; t: ReturnType<typeof getTheme> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color }}>{label}</div>
      <div style={{ fontSize: 10, color: t.textMuted }}>完成 / 稍后 / 未响应</div>
    </div>
  );
}

function TaskCell({ data, color, t }: { data: { completed: number; snoozed: number; ignored: number; triggered: number }; color: string; t: ReturnType<typeof getTheme> }) {
  if (data.triggered === 0) {
    return <div style={{ textAlign: 'center', fontSize: 13, color: t.textMuted }}>—</div>;
  }
  return (
    <div style={{ textAlign: 'center', fontSize: 13 }}>
      <span style={{ color, fontWeight: 600 }}>{data.completed}</span>
      <span style={{ color: t.textMuted }}> / </span>
      <span style={{ color: '#f59e0b' }}>{data.snoozed}</span>
      <span style={{ color: t.textMuted }}> / </span>
      <span style={{ color: t.textMuted }}>{data.ignored}</span>
    </div>
  );
}

function NumCell({ value, total, color, t }: { value: number; total: number; color: string; t: ReturnType<typeof getTheme> }) {
  if (total === 0) return <div style={{ textAlign: 'center', fontSize: 13, color: t.textMuted }}>—</div>;
  return <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color }}>{value}</div>;
}

function MiniStat({ label, value, color, t }: { label: string; value: string | number; color: string; t: ReturnType<typeof getTheme> }) {
  return (
    <div style={{ padding: '16px 18px', borderRadius: 14, background: t.card, border: `1px solid ${t.cardBorder}`, backdropFilter: 'blur(12px)' }}>
      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

/* ════════════════════════════════════════
   Weekly Report Sections
════════════════════════════════════════ */

function WeeklySectionMessage({ report, t, isDay }: { report: WeeklyReport; t: ReturnType<typeof getTheme>; isDay: boolean }) {
  const ratePercent = Math.round(report.completionRate * 100);
  const delta = report.weekOverWeekDelta;
  return (
    <div style={cardStyle(t)}>
      <div style={{ fontSize: 12, color: t.textMuted, letterSpacing: 4, marginBottom: 8 }}>本周寄语</div>
      <p style={{ fontSize: 20, lineHeight: 1.7, margin: '0 0 24px', color: t.text, fontWeight: 500 }}>{report.message}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <BigStat label="完成" value={report.totals.completed} accent={t.accent} t={t} />
        <BigStat label="完成率" value={`${ratePercent}%`} accent={t.accent} t={t} />
        <BigStat label="活跃天数" value={`${report.activeDays}/7`} accent={t.eyeCare} t={t} />
        <BigStat
          label="较上周"
          value={delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta}`}
          accent={delta === null ? t.textMuted : delta > 0 ? t.accent : delta < 0 ? '#ef4444' : t.textMuted}
          t={t}
          icon={delta === null ? <Minus size={13} /> : delta > 0 ? <TrendingUp size={13} /> : delta < 0 ? <TrendingDown size={13} /> : <Minus size={13} />}
        />
      </div>

      <div style={{ marginTop: 22, padding: '14px 18px', borderRadius: 12, background: t.accentSoft, border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 2, marginBottom: 10 }}>真实状态分布</div>
        <HonestBar completed={report.totals.completed} snoozed={report.totals.snoozed} ignored={report.totals.ignored} accent={t.accent} isDay={isDay} t={t} />
        <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 13, color: t.textSecondary, flexWrap: 'wrap' }}>
          <Legend dot={t.accent} label={`完成 ${report.totals.completed}`} />
          <Legend dot={isDay ? '#f59e0b' : '#fbbf24'} label={`稍后 ${report.totals.snoozed}`} />
          <Legend dot={t.textMuted} label={`未响应 ${report.totals.ignored}`} />
        </div>
      </div>
    </div>
  );
}

function WeeklySectionDaily({ report, t }: { report: WeeklyReport; t: ReturnType<typeof getTheme> }) {
  const max = Math.max(1, ...report.daily.map(d => d.total));
  return (
    <div style={cardStyle(t)}>
      <div style={cardTitle(t)}>每日节奏</div>
      <p style={cardDesc(t)}>绿色=完成，黄色=稍后，灰色=未响应。</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200, marginTop: 20 }}>
        {report.daily.map((d, i) => {
          const cH = (d.completed / max) * 180;
          const sH = (d.snoozed / max) * 180;
          const iH = (d.ignored / max) * 180;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 11, color: t.textMuted, height: 14 }}>{d.total || ''}</div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 180 }}>
                {iH > 0 && <div style={{ height: iH, background: t.textMuted, opacity: 0.45, borderRadius: '4px 4px 0 0' }} />}
                {sH > 0 && <div style={{ height: sH, background: '#f59e0b', opacity: 0.85 }} />}
                {cH > 0 && <div style={{ height: cH, background: t.accent, borderRadius: iH === 0 && sH === 0 ? '4px 4px 0 0' : 0 }} />}
              </div>
              <div style={{ fontSize: 12, color: t.textSecondary, fontWeight: 500 }}>{WEEKDAY_LABELS[i]}</div>
              <div style={{ fontSize: 10, color: t.textMuted }}>{d.date.slice(5)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklySectionTasks({ report, t }: { report: WeeklyReport; t: ReturnType<typeof getTheme> }) {
  const colors = { hydration: t.hydration, eyeCare: t.eyeCare, movement: t.movement };
  const icons = { hydration: <Droplets size={18} />, eyeCare: <Eye size={18} />, movement: <PersonStanding size={18} /> };
  return (
    <div style={cardStyle(t)}>
      <div style={cardTitle(t)}>三类提醒</div>
      <p style={cardDesc(t)}>哪类最容易完成、哪类最常被忽略。</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
        {report.byTask.map(task => {
          const rate = Math.round(task.completionRate * 100);
          return (
            <div key={task.taskType}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: colors[task.taskType] }}>{icons[task.taskType]}</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: t.text }}>{TASK_LABELS[task.taskType]}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 13, color: t.textSecondary }}>
                  <span>完成 {task.completed}/{task.total}</span>
                  <span style={{ color: colors[task.taskType], fontWeight: 600 }}>{rate}%</span>
                </div>
              </div>
              <div style={{ height: 7, borderRadius: 4, background: t.progressTrack, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${rate}%`, background: colors[task.taskType], borderRadius: 4, transition: 'width 0.5s' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklySectionHourly({ report, t }: { report: WeeklyReport; t: ReturnType<typeof getTheme> }) {
  const maxH = Math.max(1, ...report.hourly.map(h => h.total));
  const has24 = Array.from({ length: 24 }, (_, h) => report.hourly.find(x => x.hour === h) || { hour: h, total: 0, completed: 0 });
  return (
    <div style={cardStyle(t)}>
      <div style={cardTitle(t)}>时段 & 风格</div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 8 }}>
          {report.bestHour !== null ? `黄金时段：${report.bestHour}:00 - ${report.bestHour + 1}:00` : '暂无明显高效时段'}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 70 }}>
          {has24.map(h => (
            <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ height: `${(h.total / maxH) * 100}%`, background: h.completed > 0 ? t.accent : t.textMuted, opacity: h.total > 0 ? 0.85 : 0.15, borderRadius: 2, minHeight: h.total > 0 ? 3 : 1 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.textMuted, marginTop: 4 }}>
          <span>0</span><span>6</span><span>12</span><span>18</span><span>24</span>
        </div>
      </div>
      {report.byStyle.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 10 }}>本周视觉风格</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {report.byStyle.map(s => (
              <div key={s.style} style={{ padding: '6px 12px', borderRadius: 8, background: t.accentSoft, border: `1px solid ${t.border}`, fontSize: 12, color: t.textSecondary }}>
                {NOTIFICATION_STYLE_LABELS[s.style]} · {s.count} 次
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklySectionAction({ report, t, onShare }: { report: WeeklyReport; t: ReturnType<typeof getTheme>; onShare: () => void }) {
  return (
    <div style={cardStyle(t)}>
      <div style={cardTitle(t)}>下一步</div>
      <p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.7, margin: '0 0 20px' }}>
        {report.totals.completed === 0
          ? '可以试着降低提醒间隔，从「容易完成」的频率开始建立节奏。'
          : report.completionRate >= 0.7
          ? '继续保持现在的节奏，习惯已在稳固中。'
          : `本周有 ${report.totals.ignored} 次未响应，可以在设置里调整勿扰时段，避开专注时间。`}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={onShare} style={primaryBtn(t)}>
          <Share2 size={15} /> 生成分享海报
        </button>
        <button onClick={() => chrome.runtime.openOptionsPage()} style={ghostBtn(t)}>
          打开设置
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Shared helpers
════════════════════════════════════════ */

function TabButton({ active, onClick, t, icon, children }: { active: boolean; onClick: () => void; t: ReturnType<typeof getTheme>; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '11px 24px', borderRadius: 12, cursor: 'pointer',
      background: active ? t.accent : t.card,
      color: active ? t.textOnAccent : t.textSecondary,
      border: `1px solid ${active ? t.accent : t.cardBorder}`,
      fontSize: 15, fontWeight: 600, letterSpacing: 1,
      fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
      display: 'inline-flex', alignItems: 'center', gap: 6,
      transition: 'all 0.25s', boxShadow: active ? `0 4px 16px ${t.accentGlow}` : 'none',
    }}>
      {icon}{children}
    </button>
  );
}

function BigStat({ label, value, accent, t, icon }: { label: string; value: string | number; accent: string; t: ReturnType<typeof getTheme>; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: '18px 14px', borderRadius: 12, background: t.accentSoft, border: `1px solid ${t.border}`, textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: 2, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        {icon}{value}
      </div>
    </div>
  );
}

function HonestBar({ completed, snoozed, ignored, accent, isDay, t }: { completed: number; snoozed: number; ignored: number; accent: string; isDay: boolean; t: ReturnType<typeof getTheme> }) {
  const total = completed + snoozed + ignored;
  if (total === 0) return <div style={{ height: 12, borderRadius: 6, background: t.progressTrack }} />;
  const cP = (completed / total) * 100;
  const sP = (snoozed / total) * 100;
  return (
    <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', background: t.progressTrack }}>
      <div style={{ width: `${cP}%`, background: accent }} />
      <div style={{ width: `${sP}%`, background: isDay ? '#f59e0b' : '#fbbf24' }} />
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />{label}
    </span>
  );
}

function thStyle(t: ReturnType<typeof getTheme>) {
  return { fontSize: 12, fontWeight: 600, color: t.textMuted, letterSpacing: 1 } as const;
}
function cardStyle(t: ReturnType<typeof getTheme>) {
  return { background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 18, padding: '28px 32px', marginBottom: 16, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as const;
}
function cardTitle(t: ReturnType<typeof getTheme>) { return { fontSize: 18, fontWeight: 600, color: t.text, marginBottom: 6 } as const; }
function cardDesc(t: ReturnType<typeof getTheme>) { return { fontSize: 13, color: t.textMuted, lineHeight: 1.6, margin: '0 0 2px' } as const; }
function smallTabBtn(active: boolean, t: ReturnType<typeof getTheme>) {
  return {
    padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: active ? t.accent : 'transparent',
    color: active ? t.textOnAccent : t.textSecondary,
    fontSize: 12, fontWeight: 500, letterSpacing: 1,
    fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
    display: 'inline-flex', alignItems: 'center', gap: 3, transition: 'all 0.2s',
  } as const;
}
function primaryBtn(t: ReturnType<typeof getTheme>) {
  return {
    padding: '11px 22px', borderRadius: 11, border: 'none', cursor: 'pointer',
    background: `linear-gradient(135deg, ${t.accent}, ${t.accentHover})`,
    color: t.textOnAccent, fontSize: 14, fontWeight: 600, letterSpacing: 1,
    fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
    boxShadow: `0 4px 16px ${t.accentGlow}`,
    display: 'inline-flex', alignItems: 'center', gap: 7, transition: 'all 0.3s',
  } as const;
}
function ghostBtn(t: ReturnType<typeof getTheme>) {
  return {
    padding: '11px 22px', borderRadius: 11, cursor: 'pointer',
    background: t.card, border: `1px solid ${t.cardBorder}`, color: t.textSecondary,
    fontSize: 14, fontWeight: 500, letterSpacing: 1,
    fontFamily: "'Microsoft YaHei','PingFang SC',sans-serif",
    display: 'inline-flex', alignItems: 'center', gap: 7, transition: 'all 0.3s',
  } as const;
}
