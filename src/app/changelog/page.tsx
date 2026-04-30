import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "更新日志",
  description: "婚礼邀请函网站的开发与更新记录",
};

interface ChangelogEntry {
  date: string;
  title: string;
  items: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-04-30",
    title: "iOS 微信体验优化 & 发红包功能",
    items: [
      "【修复】iOS 微信滚动动画卡顿：检测 UA 自动禁用 scroll-snap",
      "【新增】婚礼邀约视频支持封面图配置，解决 iOS 微信首帧黑屏问题",
      "【优化】封面图自适应：手机填满屏幕高度，PC 保持比例不裁切高度",
      "【新增】视频播放新增全屏按钮（左下角常驻）",
      "【优化】移除视频背景模糊效果，解决卡顿和不同步问题",
      "【优化】甜蜜瞬间移除页面切换淡入动画，提升滑动流畅度",
      "【修复】交通地图禁用触摸交互，避免与页面滚动冲突",
      "【修复】图片放大后下滑关闭动画方向异常",
      "【新增】「发个红包」功能：祝福区展示红包按钮，弹窗显示微信收款码",
      "【新增】后台「收款码配置」页面，支持上传收款码和自定义弹窗文案",
    ],
  },
  {
    date: "2026-04-29",
    title: "地图点亮后台管理",
    items: [
      "【新增】「地图点亮」管理页面，查看所有点亮城市记录",
      "【新增】支持按类型筛选（到访来客/送上祝福/出席宾客）",
      "【新增】支持删除单条点亮记录",
      "【新增】统计概览：总城市数及各类型数量",
    ],
  },
  {
    date: "2026-04-29",
    title: "后台体验优化与功能完善",
    items: [
      "【优化】后台侧边栏菜单重构：分为仪表盘、页面配置、收集信息三大分类",
      "【新增】「婚礼信息」管理页面，整合新人信息、婚礼日期、仪式地点、交通指引",
      "【优化】婚礼日期简化为单一日期输入，首页显示文字和倒计时自动计算生成",
      "【新增】RSVP 回复截止日期配置，前台动态展示",
      "【优化】RSVP 表单精简，移除「是否出席」选项",
      "【优化】Logo 配置独立为单独页面",
      "【优化】导航栏 Logo 在深色背景下自动反色处理",
      "【优化】移除默认兜底 Logo SVG，未配置时不展示",
      "【优化】浏览器页面标题改为动态读取（新郎 & 新娘 | 婚礼邀请）",
      "【新增】后台「查看前台」快捷入口",
      "【新增】RSVP 和音乐管理新增删除功能",
      "【修复】时间轴图片上传失败问题（Web Stream 兼容）",
      "【修复】链接缺少协议前缀导致的跳转错误",
    ],
  },
  {
    date: "2026-04-28",
    title: "管理后台数据看板",
    items: [
      "【新增】仪表盘数据统计模块，实时展示页面访问数据",
      "【新增】统计指标：累计 PV/UV、今日 PV/UV、平均停留时长、人均访问次数",
      "【新增】最近 14 天 PV/UV 趋势柱状图（纯 SVG，零依赖）",
      "【新增】Top 10 访问城市排行 + 设备分布（手机/电脑/平板）",
      "【新增】最近 20 条访问记录表格（时间、IP 掩码、城市、设备、停留时长）",
      "【新增】轻量客户端埋点：visibilitychange + sendBeacon 精准记录停留时长",
      "【新增】IP 自动定位城市，全量存储、掩码展示保护隐私",
    ],
  },
  {
    date: "2026-04-27",
    title: "祝福地图点亮功能",
    items: [
      "【新增】「送上祝福」区块新增中国地图可视化，基于阿里 DataV 合规地图数据",
      "【新增】四色光点系统：粉红-婚礼地点、绿色-出席宾客、金色-祝福发送者、蓝色-页面访客",
      "【新增】通过 IP 自动定位城市，同城市越多光点越亮",
      "【新增】RSVP 出席宾客到婚礼地点之间绘制弧线动画",
      "【新增】婚礼地点粉红脉冲光点始终最高优先级展示",
      "【新增】地图左下角四色图例标注",
      "【新增】南海诸岛标准插图框 + 九段线虚线",
    ],
  },
  {
    date: "2026-04-27",
    title: "甜蜜瞬间 & 交互体验升级",
    items: [
      "【优化】「甜蜜瞬间」改为横向瀑布流自动滚动，照片大小错落拼接成画布",
      "【新增】照片大图查看支持左右滑动切换、键盘操作和关闭按钮",
      "【优化】「送上祝福」留言区改为纵向自动滚动弹幕，避免页面过长",
      "【新增】「婚礼详情」新增交通指引卡片，嵌入 Leaflet 地图展示婚礼地点",
      "【新增】地图下方提供高德、腾讯、百度三种导航入口",
      "【新增】「我们的故事」时间线新增「我们更多的故事」节点，可跳转抖音",
      "【优化】页面来回翻页时入场动画重新播放",
      "【优化】调整页面模块顺序，婚礼照片移至关于 Logo 之后",
    ],
  },
  {
    date: "2026-04-27",
    title: "页脚入口 & 更新日志",
    items: [
      "【新增】页脚新增「页面更新日志」入口",
      "【新增】「页面更新日志」页面，记录网站迭代历程",
    ],
  },
  {
    date: "2026-04-27",
    title: "故事照片 & 滚动体验优化",
    items: [
      "【新增】「我们的故事」时间线中新增出生节点的圆形照片展示",
      "【新增】后台「故事照片」管理页面，可上传/更换两人小时候的照片",
      "【优化】照片采用左右交替排列：新郎照片在文字右侧，新娘照片在文字左侧",
      "【新增】全站启用全屏翻页滚动效果（Scroll Snap）",
      "【优化】减缓所有入场动画速度，提升优雅感",
      "【优化】短内容页面（婚礼照片、敬请回复、送上祝福、关于 Logo）自动垂直居中",
    ],
  },
  {
    date: "2026-04-26",
    title: "分享功能 & 时间线丰富",
    items: [
      "【新增】分享按钮，支持系统分享、复制链接、微信分享引导",
      "【新增】「我们的故事」时间线新增订婚节点和两人出生节点",
      "【优化】时间线文案，让每个节点都更有温度",
    ],
  },
  {
    date: "2026-04-25",
    title: "移动端视频优化",
    items: [
      "【优化】使用 ffmpeg 压缩首页背景视频（H.264 编码，目标码率 1.5Mbps）",
      "【新增】自动生成视频封面图作为加载占位",
      "【修复】iOS / 微信浏览器视频自动播放兼容性",
      "【优化】视频加载前显示封面图，提升首屏体验",
    ],
  },
  {
    date: "2026-04-24",
    title: "微信兼容 & 音乐播放",
    items: [
      "【新增】完成微信公众号域名验证，支持微信内打开",
      "【修复】微信浏览器中视频自动播放问题",
      "【新增】背景音乐播放器（悬浮黑胶唱片样式）",
      "【新增】首次进入显示播放提示，点击后自动播放",
      "【新增】后台支持上传和切换背景音乐",
    ],
  },
  {
    date: "2026-04-23",
    title: "首页视频 & 后台管理",
    items: [
      "【新增】首页 Hero 区域支持全屏背景视频",
      "【新增】后台「首页视频」管理页面，支持上传和预览",
      "【新增】视频自动循环播放、静音、适配不同屏幕比例",
    ],
  },
  {
    date: "2026-04-22",
    title: "服务器部署 & HTTPS",
    items: [
      "【新增】完成阿里云服务器部署（PM2 + Nginx 反向代理）",
      "【新增】配置 Let's Encrypt SSL 证书，启用 HTTPS",
      "【新增】绑定自定义域名并配置 DNS 解析",
      "【新增】配置 Nginx 静态资源缓存与文件上传代理",
    ],
  },
  {
    date: "2026-04-21",
    title: "后台管理系统",
    items: [
      "【新增】搭建管理员认证系统（JWT + Cookie）",
      "【新增】SQLite 数据库，存储照片、音乐、RSVP、祝福留言",
      "【新增】完整的 API 路由：照片上传/排序/删除、音乐管理、RSVP 查看、留言审核",
      "【新增】管理后台 UI：侧边栏导航、仪表盘、各功能管理页面",
      "【优化】从静态导出切换为 Node.js 服务端渲染（standalone 模式）",
    ],
  },
  {
    date: "2026-04-20",
    title: "婚礼邀请函网站上线",
    items: [
      "【新增】基于 Next.js + Tailwind CSS 搭建婚礼邀请函网站",
      "【新增】设计整体视觉风格：米白暖色调、衬线字体、优雅动效",
      "【新增】完成全部页面模块：首页、我们的故事、甜蜜瞬间、婚礼照片、婚礼详情、敬请回复、送上祝福、关于 Logo",
      "【新增】响应式设计，适配手机和桌面端",
      "【新增】滚动入场动画系统（Intersection Observer）",
      "【新增】导航栏平滑滚动定位",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="py-12 px-6 text-center border-b border-border">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Link
            href="/"
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            ← 返回邀请函
          </Link>
          <span className="text-border">|</span>
          <Link
            href="/admin/guide"
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            使用说明
          </Link>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-primary mb-2">
          更新日志
        </h1>
        <p className="text-sm text-text-light">
          记录这份邀请函从无到有的每一步
        </p>
        <p className="text-xs text-text-light mt-2">
          开发者：李连宸
        </p>
        <p className="text-xs text-text-light/70 mt-4">
          开发不易，若对你有帮助，随缘打赏鼓励
        </p>
        <img
          src="/wechat-dev.jpg"
          alt="开发者微信"
          className="w-56 mx-auto mt-3 rounded-lg"
        />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

          {CHANGELOG.map((entry, i) => (
            <div key={i} className="relative pl-8 pb-12 last:pb-0">
              <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-accent bg-bg" />

              <time className="text-xs tracking-widest text-accent uppercase">
                {entry.date}
              </time>
              <h2 className="font-serif text-xl text-primary mt-1 mb-3">
                {entry.title}
              </h2>
              <ul className="space-y-1.5">
                {entry.items.map((item, j) => (
                  <li
                    key={j}
                    className="text-sm text-text-light leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-accent"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-8 px-6 text-center border-t border-border" />
    </div>
  );
}
