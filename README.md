<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 唯她命 (Vita-Me) - AI命理解读应用

![Deploy Status](https://github.com/[用户名]/[仓库名]/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)

一个结合AI技术与传统东方智慧的现代命理解读应用。

## 🌐 在线访问

**网站地址**: https://[你的用户名].github.io/[仓库名]/

## 🚀 自动部署

本项目支持GitHub Pages自动部署：
- 推送代码到 `main` 分支即可自动部署
- 详细部署说明请查看 [DEPLOY.md](DEPLOY.md)

## 💻 本地开发

**环境要求**: Node.js 18+

### 快速开始

1. **安装依赖**:
   ```bash
   npm install
   ```

2. **配置API密钥**:
   在 [.env.local](.env.local) 中设置你的 Gemini API 密钥
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **启动开发服务器**:
   ```bash
   npm run dev
   ```

4. **访问应用**:
   打开浏览器访问 `http://localhost:3000`

### 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本  
- `npm run preview` - 预览构建结果
- `npm run build:prod` - 生产环境构建
- `npm run deploy:local` - 本地构建并预览

## 📦 技术栈

- **前端**: React 19 + TypeScript + Vite
- **样式**: Tailwind CSS + Framer Motion
- **AI服务**: Google Gemini API
- **部署**: GitHub Pages + GitHub Actions

## 🎯 功能特色

- 🤖 AI驱动的个性化命理分析
- 🎨 现代化Glassmorphism设计
- 📱 完全响应式设计
- ⚡ 自动化部署流程

---

**唯妳定义，天生旺己** ✨
