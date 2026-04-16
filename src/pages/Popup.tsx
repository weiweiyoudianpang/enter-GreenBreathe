import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import '@/index.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { UserProfile, InteractionLog, PlantGrowth } from '@/types/extension';

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

    const logs = await storage.getInteractionLogs();
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
      <div className="w-80 h-96 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gradient-to-br from-background to-muted">
      <div className="p-6 space-y-4">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🌿</div>
          <h2 className="text-xl font-bold text-foreground">青植呼吸</h2>
          <p className="text-sm text-muted-foreground">你好，{profile.nickname}</p>
        </div>

        <Card className="glass-effect border-primary/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">今日完成</span>
              <span className="text-2xl font-bold text-primary">{stats.today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">本周完成</span>
              <span className="text-lg font-semibold text-foreground">{stats.week}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">累计完成</span>
              <span className="text-lg font-semibold text-foreground">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-primary/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">植物成长</span>
              <span className="text-xs text-muted-foreground">Lv.{growth.level}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${((growth.totalCompletions % 10) / 10) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {10 - (growth.totalCompletions % 10)} 次后升级
            </p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Button onClick={triggerTest} className="w-full bg-primary hover:bg-primary-dark">
            立即测试提醒
          </Button>
          <Button onClick={openOptions} variant="outline" className="w-full">
            打开设置
          </Button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            MBTI: {profile.mbtiType} · 间隔: {profile.customInterval}分钟
          </p>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('popup-root');
if (container) {
  createRoot(container).render(<PopupPage />);
}
