# 婚礼邀请函 Wedding Invitation

一套完整的婚礼邀请函 Web 系统，包含精美的前台展示页面和功能丰富的后台管理系统。

基于 Next.js 15 + SQLite 构建，支持一键部署到自有服务器，所有内容均可通过后台动态配置。

## 功能特性

### 前台展示

- 婚礼倒计时 & 日期展示
- 自定义 Logo 及品牌展示
- 恋爱时间线（里程碑）
- 婚礼照片轮播
- 婚礼视频播放
- 婚礼仪式信息 & 地图导航
- RSVP 出席确认（含人数、饮食偏好）
- 祝福留言墙
- 微信收款码（随礼红包）
- 全国宾客点亮地图
- 分享功能（支持微信引导）
- 全站移动端适配

### 后台管理

- 登录鉴权（Cookie + 密码验证）
- 婚礼信息配置（新人姓名、日期、地点、坐标）
- Logo / 网站配置
- 恋爱时间线管理（增删改排序、上传配图）
- 婚礼照片管理（多图上传、排序）
- 婚礼视频管理（上传视频 + 封面图）
- 收款码配置
- RSVP 回复列表查看
- 祝福留言审核
- 宾客点亮地图数据
- 更新日志 & 使用说明

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Next.js 15 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 |
| 数据库 | SQLite (better-sqlite3) |
| 部署 | Node.js + PM2 + Nginx |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/lilianchen1991/wedding-invitation.git
cd wedding-invitation
```

### 2. 安装依赖

```bash
npm install
```

### 3. 初始化数据库

```bash
npx tsx scripts/seed-config.ts
```

这会创建 `data.db` 并写入默认配置数据（示例姓名、地点等），后续可在后台修改。

### 4. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000 查看前台，访问 http://localhost:3000/admin 进入后台。

> 默认管理密码在 `.env` 文件中设置：`ADMIN_PASSWORD=你的密码`

### 5. 创建 .env 文件

```bash
cp .env.example .env
```

```env
ADMIN_PASSWORD=your_password_here
AMAP_WEB_KEY=your_amap_key  # 高德地图 Web 服务 Key（点亮地图功能）
```

## 部署指南

### 服务器要求

- Node.js 18+
- Nginx（反向代理）
- PM2（进程管理）

### 部署步骤

1. **创建部署脚本** `deploy.sh`：

```bash
#!/bin/bash
npm run build
rsync -avz --exclude='node_modules' --exclude='.git' --exclude='data.db' \
  ./ user@your-server:/path/to/wedding/

ssh user@your-server "cd /path/to/wedding && npm install --production && pm2 restart wedding"
```

2. **Nginx 配置参考**：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **PM2 启动**：

```bash
pm2 start npm --name wedding -- start
pm2 save
```

## 项目结构

```
├── src/
│   ├── app/
│   │   ├── page.tsx            # 前台首页
│   │   ├── admin/              # 后台管理页面
│   │   │   ├── layout.tsx      # 后台布局 & 鉴权
│   │   │   ├── login/          # 登录页
│   │   │   ├── wedding-info/   # 婚礼信息配置
│   │   │   ├── site-config/    # 网站配置
│   │   │   ├── milestones/     # 时间线管理
│   │   │   ├── photos/         # 照片管理
│   │   │   ├── invitation-video/ # 视频管理
│   │   │   ├── qrcode/         # 收款码配置
│   │   │   ├── rsvp/           # RSVP 列表
│   │   │   ├── wishes/         # 留言管理
│   │   │   └── map/            # 地图数据
│   │   ├── api/                # API 路由
│   │   └── changelog/          # 更新日志
│   └── components/             # 前台组件
├── public/uploads/             # 上传文件目录（不入 git）
├── scripts/
│   └── seed-config.ts          # 数据库初始化脚本
├── data.db                     # SQLite 数据库（不入 git）
├── GUIDE.md                    # 使用说明文档
└── deploy.sh                   # 部署脚本（不入 git）
```

## 数据存储

- 所有配置和业务数据存储在 `data.db`（SQLite）
- 上传的图片/视频存储在 `public/uploads/` 目录
- 两者均不纳入 git 版本管理，部署时保留在服务器

### 数据备份

```bash
# 备份数据库
scp user@server:/path/to/wedding/data.db ./backup/

# 备份上传文件
rsync -avz user@server:/path/to/wedding/public/uploads/ ./backup/uploads/
```

## 注意事项

- 域名需自行完成 ICP 备案（国内服务器要求）
- 婚礼视频建议压缩到 30MB 以内，推荐使用 H.264 编码
- 高德地图 Key 需在[高德开放平台](https://lbs.amap.com/)申请 Web 服务类型
- `data.db` 和 `public/uploads/` 是核心数据，务必定期备份

## 开发者

李连宸 ([@lilianchen1991](https://github.com/lilianchen1991))

## License

MIT
