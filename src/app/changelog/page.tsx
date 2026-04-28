import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "更新日志 | 李连宸 & 韩丹",
  description: "婚礼邀请函网站的开发与更新记录",
};

interface ChangelogEntry {
  date: string;
  title: string;
  items: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-04-28",
    title: "管理后台数据看板",
    items: [
      "仪表盘新增数据统计模块，实时展示页面访问数据",
      "统计指标：累计 PV/UV、今日 PV/UV、平均停留时长、人均访问次数",
      "最近 14 天 PV/UV 趋势柱状图（纯 SVG，零依赖）",
      "Top 10 访问城市排行 + 设备分布（手机/电脑/平板）",
      "最近 20 条访问记录表格（时间、IP 掩码、城市、设备、停留时长）",
      "轻量客户端埋点：visibilitychange + sendBeacon 精准记录停留时长",
      "IP 自动定位城市，全量存储、掩码展示保护隐私",
    ],
  },
  {
    date: "2026-04-27",
    title: "祝福地图点亮功能",
    items: [
      "「送上祝福」区块新增中国地图可视化，基于阿里 DataV 合规地图数据",
      "四色光点系统：粉红-婚礼地点、绿色-出席宾客、金色-祝福发送者、蓝色-页面访客",
      "通过 IP 自动定位城市，同城市越多光点越亮",
      "RSVP 出席宾客到婚礼地点之间绘制弧线动画",
      "婚礼地点（海林）粉红脉冲光点始终最高优先级展示",
      "地图左下角四色图例标注",
      "南海诸岛标准插图框 + 九段线虚线",
    ],
  },
  {
    date: "2026-04-27",
    title: "甜蜜瞬间 & 交互体验升级",
    items: [
      "「甜蜜瞬间」改为横向瀑布流自动滚动，照片大小错落拼接成画布",
      "照片大图查看支持左右滑动切换、键盘操作和关闭按钮",
      "「送上祝福」留言区改为纵向自动滚动弹幕，避免页面过长",
      "「婚礼详情」新增交通指引卡片，嵌入 Leaflet 地图展示婚礼地点",
      "地图下方提供高德、腾讯、百度三种导航入口",
      "「我们的故事」时间线新增「我们更多的故事」节点，可跳转抖音",
      "页面来回翻页时入场动画重新播放",
      "调整页面模块顺序，婚礼照片移至关于 Logo 之后",
    ],
  },
  {
    date: "2026-04-27",
    title: "页脚入口 & 更新日志",
    items: [
      "页脚新增「页面更新日志」入口",
      "新增「页面更新日志」页面，记录网站迭代历程",
    ],
  },
  {
    date: "2026-04-27",
    title: "故事照片 & 滚动体验优化",
    items: [
      "「我们的故事」时间线中新增出生节点的圆形照片展示",
      "后台新增「故事照片」管理页面，可上传/更换两人小时候的照片",
      "照片采用左右交替排列：连宸照片在文字右侧，韩丹照片在文字左侧",
      "全站启用全屏翻页滚动效果（Scroll Snap）",
      "减缓所有入场动画速度，提升优雅感",
      "短内容页面（婚礼照片、敬请回复、送上祝福、关于 Logo）自动垂直居中",
    ],
  },
  {
    date: "2026-04-26",
    title: "分享功能 & 时间线丰富",
    items: [
      "新增分享按钮，支持系统分享、复制链接、微信分享引导",
      "「我们的故事」时间线新增订婚节点和两人出生节点",
      "优化时间线文案，让每个节点都更有温度",
    ],
  },
  {
    date: "2026-04-25",
    title: "移动端视频优化",
    items: [
      "使用 ffmpeg 压缩首页背景视频（H.264 编码，目标码率 1.5Mbps）",
      "自动生成视频封面图作为加载占位",
      "修复 iOS / 微信浏览器视频自动播放兼容性",
      "视频加载前显示封面图，提升首屏体验",
    ],
  },
  {
    date: "2026-04-24",
    title: "微信兼容 & 音乐播放",
    items: [
      "完成微信公众号域名验证，支持微信内打开",
      "修复微信浏览器中视频自动播放问题",
      "新增背景音乐播放器（悬浮黑胶唱片样式）",
      "首次进入显示播放提示，点击后自动播放",
      "后台支持上传和切换背景音乐",
    ],
  },
  {
    date: "2026-04-23",
    title: "首页视频 & 后台管理",
    items: [
      "首页 Hero 区域支持全屏背景视频",
      "后台新增「首页视频」管理页面，支持上传和预览",
      "视频自动循环播放、静音、适配不同屏幕比例",
    ],
  },
  {
    date: "2026-04-22",
    title: "服务器部署 & HTTPS",
    items: [
      "完成阿里云服务器部署（PM2 + Nginx 反向代理）",
      "配置 Let's Encrypt SSL 证书，启用 HTTPS",
      "绑定域名 lilianchen-handan.love",
      "配置 Nginx 静态资源缓存与文件上传代理",
    ],
  },
  {
    date: "2026-04-21",
    title: "后台管理系统",
    items: [
      "搭建管理员认证系统（JWT + Cookie）",
      "新增 SQLite 数据库，存储照片、音乐、RSVP、祝福留言",
      "实现完整的 API 路由：照片上传/排序/删除、音乐管理、RSVP 查看、留言审核",
      "管理后台 UI：侧边栏导航、仪表盘、各功能管理页面",
      "从静态导出切换为 Node.js 服务端渲染（standalone 模式）",
    ],
  },
  {
    date: "2026-04-20",
    title: "婚礼邀请函网站上线",
    items: [
      "基于 Next.js + Tailwind CSS 搭建婚礼邀请函网站",
      "设计整体视觉风格：米白暖色调、衬线字体、优雅动效",
      "完成全部页面模块：首页、我们的故事、甜蜜瞬间、婚礼照片、婚礼详情、敬请回复、送上祝福、关于 Logo",
      "响应式设计，适配手机和桌面端",
      "滚动入场动画系统（Intersection Observer）",
      "导航栏平滑滚动定位",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="py-12 px-6 text-center border-b border-border">
        <Link
          href="/"
          className="inline-block text-sm text-accent hover:text-accent/80 transition-colors mb-6"
        >
          ← 返回邀请函
        </Link>
        <h1 className="font-serif text-3xl md:text-4xl text-primary mb-2">
          更新日志
        </h1>
        <p className="text-sm text-text-light">
          记录这份邀请函从无到有的每一步
        </p>
        <p className="text-xs text-text-light mt-2">
          开发者：李连宸
        </p>
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

      <footer className="py-8 px-6 text-center border-t border-border">
        <p className="text-xs text-text-light">
          李连宸 & 韩丹 · 2026.06.05
        </p>
      </footer>
    </div>
  );
}
