import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import '@/index.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { UserProfile, MBTIType, NotificationPosition } from '@/types/extension';

function OptionsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    nickname: '朋友',
    mbtiType: 'INFP',
    customInterval: 60,
    quietHours: ['22:00-06:00'],
    notificationPosition: 'top_right',
    minimalMode: false,
  });
  
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await storage.getUserProfile();
    setProfile(data);
  };

  const handleSave = async () => {
    await storage.setUserProfile(profile);
    
    // Update alarm
    await chrome.runtime.sendMessage({ type: 'UPDATE_ALARM' });
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    await chrome.runtime.sendMessage({ type: 'TRIGGER_TEST_NOTIFICATION' });
  };

  const mbtiTypes: MBTIType[] = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">青植呼吸 GreenBreathe</h1>
          <p className="text-muted-foreground">用温柔的方式，提醒你关爱自己</p>
        </div>

        <div className="space-y-6">
          <Card className="glass-effect border-primary/20 shadow-medium">
            <CardHeader>
              <CardTitle>基础设置</CardTitle>
              <CardDescription>个性化你的健康关怀体验</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nickname">昵称</Label>
                <Input
                  id="nickname"
                  placeholder="你希望我怎么称呼你？"
                  value={profile.nickname}
                  onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mbti">MBTI类型</Label>
                <Select
                  value={profile.mbtiType}
                  onValueChange={(value) => setProfile({ ...profile, mbtiType: value as MBTIType })}
                >
                  <SelectTrigger id="mbti">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mbtiTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  不同性格类型会收到不同风格的关怀语
                </p>
              </div>

              <div className="space-y-2">
                <Label>提醒间隔：{profile.customInterval} 分钟</Label>
                <Slider
                  value={[profile.customInterval]}
                  onValueChange={([value]) => setProfile({ ...profile, customInterval: value })}
                  min={30}
                  max={120}
                  step={15}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>30分钟</span>
                  <span>120分钟</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">弹窗位置</Label>
                <Select
                  value={profile.notificationPosition}
                  onValueChange={(value) => 
                    setProfile({ ...profile, notificationPosition: value as NotificationPosition })
                  }
                >
                  <SelectTrigger id="position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top_right">右上角</SelectItem>
                    <SelectItem value="top_left">左上角</SelectItem>
                    <SelectItem value="bottom_right">右下角</SelectItem>
                    <SelectItem value="bottom_left">左下角</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>极简模式</Label>
                  <p className="text-xs text-muted-foreground">关闭所有弹窗提醒</p>
                </div>
                <Switch
                  checked={profile.minimalMode}
                  onCheckedChange={(checked) => setProfile({ ...profile, minimalMode: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary-dark">
              {saved ? '✓ 已保存' : '保存设置'}
            </Button>
            <Button onClick={handleTest} variant="outline">
              测试提醒
            </Button>
          </div>

          <Card className="glass-effect border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">关于</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>青植呼吸 v1.0.0</p>
              <p>所有数据本地存储，零云端同步，完全保护你的隐私</p>
              <p>每条健康指令都基于真实科学文献，但表达方式因性格而异</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('options-root');
if (container) {
  createRoot(container).render(<OptionsPage />);
}
