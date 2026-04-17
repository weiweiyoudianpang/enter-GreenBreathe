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
      <div className="w-80 h-96 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden min-h-[500px]">
      {/* 装饰性背景元素 */}
      <div className="bg-blob-1 opacity-50"></div>
      <div className="bg-blob-2 opacity-50"></div>
      
      <div className="p-6 space-y-5 relative z-10">
        <div className="text-center mb-6">
          <img
            src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/5d5a.png"
            alt="青植呼吸"
            className="w-32 mx-auto mb-2 drop-shadow"
            crossOrigin="anonymous"
          />
          <p className="text-base text-muted-foreground mt-1">你好，{profile.nickname}</p>
        </div>

        <Card className="glass-card border-t-4 border-t-primary/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-muted-foreground">今日完成</span>
              <span className="text-3xl font-bold text-primary">{stats.today}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-muted-foreground">本周完成</span>
              <span className="text-xl font-semibold text-foreground">{stats.week}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-muted-foreground">累计完成</span>
              <span className="text-xl font-semibold text-foreground">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-t-4 border-t-secondary/50">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-medium text-foreground">植物成长</span>
              <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">Lv.{growth.level}</span>
            </div>
            <div className="h-3 bg-muted/50 rounded-full overflow-hidden border border-border/50">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${((growth.totalCompletions % 10) / 10) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              {10 - (growth.totalCompletions % 10)} 次后升级
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3 pt-2">
          <Button onClick={triggerTest} className="w-full glass-button h-12 text-base rounded-xl">
            立即测试提醒
          </Button>
          <Button onClick={openOptions} variant="outline" className="w-full glass-button-outline h-12 text-base rounded-xl">
            打开设置
          </Button>
        </div>

        <div className="text-center pt-2">
          <p className="text-sm font-medium text-muted-foreground mb-2">MBTI: {profile.mbtiType}</p>
          <div className="flex justify-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><span className="text-primary">💧</span> {profile.hydrationInterval}分</span>
            <span>•</span>
            <span className="flex items-center gap-1"><span className="text-primary">👁️</span> {profile.eyeCareInterval}分</span>
            <span>•</span>
            <span className="flex items-center gap-1"><span className="text-primary">🏃</span> {profile.movementInterval}分</span>
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
