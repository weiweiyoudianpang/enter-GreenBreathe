import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="text-6xl mb-4">🌿</div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            青植呼吸 GreenBreathe
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            基于MBTI性格的极简主义浏览器健康关怀插件
          </p>
          <p className="text-lg text-primary">
            用温柔的方式，提醒你关爱自己
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="glass-effect border-primary/20 shadow-medium hover:shadow-elegant transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🎭</span> MBTI个性化
              </CardTitle>
              <CardDescription>根据你的性格定制关怀语</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                支持16种MBTI类型，260+条定制鼓励语。INTJ听到的是系统分析，INFP感受到的是温柔共情。
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/20 shadow-medium hover:shadow-elegant transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🎨</span> 水墨美学
              </CardTitle>
              <CardDescription>东方极简设计，不干扰工作</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                毛玻璃质感，水墨晕染动画，0.8秒优雅渐显。四角定位，穿透点击，专注你的工作。
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/20 shadow-medium hover:shadow-elegant transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔬</span> 科学依据
              </CardTitle>
              <CardDescription>每条建议都有医学文献支撑</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                轻度脱水致注意力下降17%，20-20-20法则减少眼疲劳52%，久坐增加心血管风险34%。
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/20 shadow-medium hover:shadow-elegant transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🧠</span> 智能避让
              </CardTitle>
              <CardDescription>在合适的时机提醒你</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                全屏、视频、输入时自动延迟。检测快速滚动和鼠标移动，永远不打断你的灵感时刻。
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/20 shadow-medium hover:shadow-elegant transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔒</span> 隐私优先
              </CardTitle>
              <CardDescription>所有数据本地存储</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                零云端同步，无需注册登录。你的MBTI、习惯、统计数据，只存在你的浏览器里。
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/20 shadow-medium hover:shadow-elegant transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🌱</span> 游戏化成长
              </CardTitle>
              <CardDescription>每次完成，植物生长一片叶子</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                累计完成任务，解锁不同植物形态。竹、兰、菊、梅，陪你一起成长。
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <Card className="glass-effect border-primary/20 shadow-elegant">
            <CardHeader>
              <CardTitle>MBTI鼓励语示例</CardTitle>
              <CardDescription>不同性格，不同表达</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm font-semibold text-primary mb-1">INTJ - 战略家</div>
                <p className="text-sm">"系统检测到逻辑引擎冷却液不足，建议补充200ml"</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm font-semibold text-primary mb-1">INFP - 调停者</div>
                <p className="text-sm">"你滋润了那么多心灵，也记得滋润自己呀"</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm font-semibold text-primary mb-1">ESTJ - 总经理</div>
                <p className="text-sm">"执行补水任务：200ml，5秒完成"</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm font-semibold text-primary mb-1">ENFP - 竞选者</div>
                <p className="text-sm">"喝杯水，让灵感继续冒泡吧"</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm font-semibold text-primary mb-1">ISTP - 鉴赏家</div>
                <p className="text-sm">"工具需要保养，身体也是"</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-primary/20 shadow-elegant">
            <CardHeader>
              <CardTitle>如何使用</CardTitle>
              <CardDescription>三步开始你的健康关怀之旅</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">构建扩展</h4>
                  <p className="text-sm text-muted-foreground">
                    运行 <code className="px-2 py-1 bg-muted rounded">pnpm build:extension</code> 构建Chrome扩展
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">加载到Chrome</h4>
                  <p className="text-sm text-muted-foreground">
                    访问 chrome://extensions/，开启开发者模式，加载 dist 文件夹
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">设置你的MBTI</h4>
                  <p className="text-sm text-muted-foreground">
                    点击工具栏的🌿图标，打开设置页面，输入昵称和MBTI类型
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-dark"
                onClick={() => window.open('/BUILD_INSTRUCTIONS.md')}
              >
                查看构建指南
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open('/README_EXTENSION.md')}
              >
                开发者文档
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              v1.0.0 · MIT License · Made with ❤️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
