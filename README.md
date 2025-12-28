<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 唯她命 (Vita-Me) - AI命理解读应用

![Deploy Status](https://github.com/[用户名]/[仓库名]/workflows/Build%20and%20Deploy%20to%20GitHub%20Pages/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)

一个结合AI技术与传统东方智慧的现代命理解读应用，致力于去除性别偏见，提供积极正面的人生指导。

## ✨ 特性

- 🎯 **AI赋能**: 使用Gemini AI提供个性化命理分析
- 🌸 **去性别化**: 净化传统命理中的性别偏见
- 🎨 **现代设计**: Glassmorphism风格，Morandi色彩主题
- 📱 **响应式**: 完美适配桌面端和移动端
- ⚡ **快速部署**: 自动化CI/CD流程

## 🚀 在线访问

**生产环境**: https://[你的用户名].github.io/[仓库名]/

## 🛠️ 本地开发

### 环境要求
- Node.js 18+
- npm 或 yarn

### 快速开始

1. **克隆仓库**
   ```bash
   git clone https://github.com/[用户名]/[仓库名].git
   cd [仓库名]
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   复制 `.env.local` 文件并设置你的Gemini API密钥：
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   
   打开浏览器访问 `http://localhost:3000`

### 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览构建结果
- `npm run check:deployment` - 检查部署状态

## 📦 自动部署

本项目配置了GitHub Actions自动部署流程：

### 部署触发条件
- 推送代码到 `main` 或 `master` 分支
- 创建Pull Request到主分支

### 部署流程
1. 自动安装依赖
2. 构建项目
3. 部署到GitHub Pages
4. 更新在线版本

详细部署说明请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

## 🏗️ 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **路由**: React Router DOM
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **图标**: Lucide React
- **AI服务**: Google Gemini API
- **部署**: GitHub Pages + GitHub Actions

## 📁 项目结构

```
├── .github/workflows/    # GitHub Actions工作流
├── components/          # React组件
├── pages/              # 页面组件
├── services/           # API服务
├── utils/              # 工具函数
├── scripts/            # 部署脚本
├── public/             # 静态资源
└── dist/               # 构建输出
```

## 🎨 设计理念

- **重塑东方智慧，去芜存菁**: 保留传统命理的精华，去除性别偏见
- **现代化体验**: 使用现代Web技术提供流畅的用户体验
- **包容性设计**: 为所有用户提供积极正面的人生指导

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- Google Gemini AI 提供AI能力支持
- React团队提供优秀的前端框架
- 所有贡献者的辛勤付出

---

**唯妳定义，天生旺己** ✨
