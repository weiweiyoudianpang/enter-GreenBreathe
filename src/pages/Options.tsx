import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import '@/index.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { UserProfile } from '@/types/extension';
import { loadUserProfile, saveUserProfile } from '@/lib/storage';

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
  // 分析师组 (NT)
  { value: 'INTJ', label: 'INTJ - 建筑师' },
  { value: 'INTP', label: 'INTP - 逻辑学家' },
  { value: 'ENTJ', label: 'ENTJ - 指挥官' },
  { value: 'ENTP', label: 'ENTP - 辩论家' },
  // 外交官组 (NF)
  { value: 'INFJ', label: 'INFJ - 提倡者' },
  { value: 'INFP', label: 'INFP - 调停者' },
  { value: 'ENFJ', label: 'ENFJ - 主人公' },
  { value: 'ENFP', label: 'ENFP - 竞选者' },
  // 守护者组 (SJ)
  { value: 'ISTJ', label: 'ISTJ - 物流师' },
  { value: 'ISFJ', label: 'ISFJ - 守卫者' },
  { value: 'ESTJ', label: 'ESTJ - 总经理' },
  { value: 'ESFJ', label: 'ESFJ - 执政官' },
  // 探险家组 (SP)
  { value: 'ISTP', label: 'ISTP - 鉴赏家' },
  { value: 'ISFP', label: 'ISFP - 探险家' },
  { value: 'ESTP', label: 'ESTP - 企业家' },
  { value: 'ESFP', label: 'ESFP - 表演者' },
];

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
    // 通知 background 更新 alarms
    chrome.runtime.sendMessage({ type: 'UPDATE_ALARM' });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleTest = () => {
    // 通过 background service worker 触发测试通知
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
    <div className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('/images/bg-options.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed',
        backgroundColor: '#f0f7f2',
      }}
    >
      {/* 轻微白色遮罩，保证内容可读性 */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
      
      <div className="container max-w-4xl mx-auto py-12 px-4 relative z-10">
        {/* 顶部 Logo + 标题 */}
        <div className="text-center mb-12">
          <img
            src="/images/logo-greenbreathe.png"
            alt="青植呼吸 GreenBreathe"
            className="w-64 mx-auto mb-4 drop-shadow-lg"
          />
          <p className="text-muted-foreground text-lg">用温柔的方式，提醒你关爱自己</p>
        </div>

        <div className="space-y-8">
          {/* 基础设置 */}
          <Card className="glass-card border-t-4 border-t-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                <span className="text-2xl">👤</span>
                基础设置
              </CardTitle>
              <CardDescription className="text-base">个性化你的健康提醒体验</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="nickname" className="text-base font-medium">昵称</Label>
                <Input
                  id="nickname"
                  value={profile.nickname}
                  onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  placeholder="输入你的昵称"
                  className="glass-input h-12 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="mbti" className="text-base font-medium">MBTI性格类型</Label>
                <Select
                  value={profile.mbtiType}
                  onValueChange={(value) => setProfile({ ...profile, mbtiType: value as UserProfile['mbtiType'] })}
                >
                  <SelectTrigger className="glass-input h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 backdrop-blur-xl border-primary/20">
                    {mbtiTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-base hover:bg-primary/10 focus:bg-primary/10">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  根据你的性格类型定制鼓励语表达方式
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 提醒间隔设置 */}
          <Card className="glass-card border-t-4 border-t-secondary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                <span className="text-2xl">⏰</span>
                提醒间隔
              </CardTitle>
              <CardDescription className="text-base">
                为每种健康提醒设置不同的间隔时间，0分钟表示不提醒
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* 喝水提醒 */}
              <div className="space-y-5 p-6 rounded-2xl bg-white/40 border border-white/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-3 text-lg font-medium text-primary">
                    <span className="text-2xl">💧</span>
                    喝水提醒
                  </Label>
                  <span className="text-base font-semibold text-primary px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                    {formatIntervalLabel(profile.hydrationInterval)}
                  </span>
                </div>
                <Slider
                  value={[profile.hydrationInterval]}
                  onValueChange={(value) => setProfile({ ...profile, hydrationInterval: value[0] })}
                  min={0}
                  max={120}
                  step={5}
                  className="slider-plant py-4"
                />
                <p className="text-sm text-muted-foreground">
                  科学建议：每30-60分钟补充150-200ml水分，保持身体水分平衡
                </p>
              </div>

              <Separator className="bg-border/50" />

              {/* 眼睛休息提醒 */}
              <div className="space-y-5 p-6 rounded-2xl bg-white/40 border border-white/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-3 text-lg font-medium text-primary">
                    <span className="text-2xl">👁️</span>
                    眼睛休息提醒
                  </Label>
                  <span className="text-base font-semibold text-primary px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                    {formatIntervalLabel(profile.eyeCareInterval)}
                  </span>
                </div>
                <Slider
                  value={[profile.eyeCareInterval]}
                  onValueChange={(value) => setProfile({ ...profile, eyeCareInterval: value[0] })}
                  min={0}
                  max={120}
                  step={5}
                  className="slider-plant py-4"
                />
                <p className="text-sm text-muted-foreground">
                  科学建议：每20分钟执行20-20-20法则（看20英尺外20秒），有效缓解视疲劳
                </p>
              </div>

              <Separator className="bg-border/50" />

              {/* 身体活动提醒 */}
              <div className="space-y-5 p-6 rounded-2xl bg-white/40 border border-white/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-3 text-lg font-medium text-primary">
                    <span className="text-2xl">🏃</span>
                    身体活动提醒
                  </Label>
                  <span className="text-base font-semibold text-primary px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                    {formatIntervalLabel(profile.movementInterval)}
                  </span>
                </div>
                <Slider
                  value={[profile.movementInterval]}
                  onValueChange={(value) => setProfile({ ...profile, movementInterval: value[0] })}
                  min={0}
                  max={120}
                  step={5}
                  className="slider-plant py-4"
                />
                <p className="text-sm text-muted-foreground">
                  科学建议：每60分钟站立活动2-5分钟，促进血液循环，改善久坐伤害
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 外观设置 */}
          <Card className="glass-card border-t-4 border-t-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                <span className="text-2xl">🎨</span>
                外观设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="position" className="text-base font-medium">弹窗位置</Label>
                <Select
                  value={profile.notificationPosition}
                  onValueChange={(value) => setProfile({ ...profile, notificationPosition: value as UserProfile['notificationPosition'] })}
                >
                  <SelectTrigger className="glass-input h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 backdrop-blur-xl border-primary/20">
                    <SelectItem value="top_right" className="text-base hover:bg-primary/10">右上角</SelectItem>
                    <SelectItem value="top_left" className="text-base hover:bg-primary/10">左上角</SelectItem>
                    <SelectItem value="bottom_right" className="text-base hover:bg-primary/10">右下角</SelectItem>
                    <SelectItem value="bottom_left" className="text-base hover:bg-primary/10">左下角</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="cardSize" className="text-base font-medium">卡片尺寸</Label>
                <Select
                  value={profile.cardSize || 'medium'}
                  onValueChange={(value) => setProfile({ ...profile, cardSize: value as UserProfile['cardSize'] })}
                >
                  <SelectTrigger className="glass-input h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 backdrop-blur-xl border-primary/20">
                    <SelectItem value="small" className="text-base hover:bg-primary/10">小 (960x570)</SelectItem>
                    <SelectItem value="medium" className="text-base hover:bg-primary/10">中 (1280x760)</SelectItem>
                    <SelectItem value="large" className="text-base hover:bg-primary/10">大 (1600x950)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  根据你的屏幕大小选择合适的卡片尺寸
                </p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/40 border border-white/60">
                <div className="space-y-1">
                  <Label className="text-base font-medium">提示音</Label>
                  <p className="text-sm text-muted-foreground">播放柔和的提示音</p>
                </div>
                <Switch
                  checked={profile.soundEnabled ?? false}
                  onCheckedChange={(checked) => setProfile({ ...profile, soundEnabled: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/40 border border-white/60">
                <div className="space-y-1">
                  <Label className="text-base font-medium">极简模式</Label>
                  <p className="text-sm text-muted-foreground">仅显示状态栏图标</p>
                </div>
                <Switch
                  checked={profile.minimalMode}
                  onCheckedChange={(checked) => setProfile({ ...profile, minimalMode: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <Separator className="bg-border/50" />

              {/* 背景图片管理 */}
              <div className="space-y-5">
                <div>
                  <Label className="text-base font-medium">自定义背景图片</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    自定义提醒卡片的背景图片，建议尺寸 1920x1080 或更高，格式 PNG/JPG
                  </p>
                </div>

                {/* 当前背景图片预览 */}
                {profile.customBackgrounds && profile.customBackgrounds.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {profile.customBackgrounds.map((bg, index) => (
                      <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border-2 border-white/60 shadow-sm hover:shadow-md transition-all">
                        <img
                          src={bg}
                          alt={`背景图 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => {
                              const newBackgrounds = profile.customBackgrounds!.filter((_, i) => i !== index);
                              setProfile({ ...profile, customBackgrounds: newBackgrounds });
                            }}
                            className="bg-destructive/90 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-destructive hover:scale-110 transition-all shadow-lg"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 添加图片按钮 */}
                <div>
                  <input
                    type="file"
                    id="bg-upload"
                    accept="image/png,image/jpeg,image/jpg"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;

                      // 检查总数限制
                      const currentCount = profile.customBackgrounds?.length || 0;
                      if (currentCount + files.length > 6) {
                        alert('最多只能添加6张背景图片');
                        return;
                      }

                      // 转换为 base64
                      const newBackgrounds: string[] = [];
                      for (const file of files) {
                        // 检查文件大小 (建议 < 2MB)
                        if (file.size > 2 * 1024 * 1024) {
                          alert(`图片 ${file.name} 超过 2MB，请选择更小的图片`);
                          continue;
                        }

                        const base64 = await new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = (e) => resolve(e.target?.result as string);
                          reader.readAsDataURL(file);
                        });
                        newBackgrounds.push(base64);
                      }

                      setProfile({
                        ...profile,
                        customBackgrounds: [...(profile.customBackgrounds || []), ...newBackgrounds],
                      });
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => document.getElementById('bg-upload')?.click()}
                    className="w-full glass-button-outline border-dashed border-2 h-16 text-base"
                  >
                    + 添加背景图片 ({(profile.customBackgrounds?.length || 0)}/6)
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                    <span>💡</span> 如果不添加自定义图片，将使用内置的3张默认背景
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 保存按钮 */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 glass-button h-14 text-lg rounded-xl"
              size="lg"
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'saving' && '保存中...'}
              {saveStatus === 'saved' && '✓ 已保存'}
              {saveStatus === 'idle' && '保存设置'}
            </Button>
            <Button onClick={handleTest} variant="outline" size="lg" className="glass-button-outline h-14 text-lg rounded-xl px-8">
              立即测试
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground pt-4 pb-8">
            所有数据仅保存在本地，绝不上传云端 🔒
          </p>
        </div>
      </div>
    </div>
  );
}

// 挂载 React 到 options-root
const container = document.getElementById('options-root');
if (container) {
  createRoot(container).render(<OptionsPage />);
}
