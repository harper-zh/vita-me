# 🚀 部署指南

## 📋 部署前准备

### 1. 环境要求
- Node.js 16+ 
- npm 或 yarn

### 2. 智谱AI配置（新功能）
本项目现已集成智谱AI，需要配置API Key：

1. **获取API Key**
   - 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
   - 注册并创建API Key

2. **本地开发配置**
   ```bash
   # 复制环境变量模板
   cp .env.example .env
   
   # 编辑 .env 文件，填入你的API Key
   ZHIPU_API_KEY=你的智谱AI密钥
   ```

3. **启动项目**
   ```bash
   npm install
   npm run dev
   ```

## 🔧 功能说明

### 智能降级机制
- ✅ **有API Key**：使用智谱AI生成个性化内容
- ⚠️ **无API Key**：自动降级到随机数据库（内容带"r"前缀）

### 数据源指示器
- 🟢 绿色 = 智谱AI生成
- 🔵 蓝色 = 随机数据库

### 调试工具
- 开发环境下点击右下角🔧查看API调用日志

## 🌐 GitHub Pages 自动部署

### 第一步：启用GitHub Pages
1. 进入你的GitHub仓库
2. 点击 **Settings** 标签
3. 在左侧菜单找到 **Pages**
4. 在 **Source** 部分选择 **GitHub Actions**
5. 点击 **Save**

### 第二步：推送代码触发部署
```bash
git add .
git commit -m "集成智谱AI功能"
git push origin main
```

### 第三步：等待部署完成
- 进入仓库的 **Actions** 标签
- 等待 "Deploy to GitHub Pages" 工作流完成
- 看到绿色✅表示部署成功

### 第四步：访问网站
部署成功后，你的网站将在以下地址可用：
```
https://harper-zh.github.io/vita-me/
```

## 📝 重要注意事项

### API Key安全
1. **不要将 `.env` 文件提交到Git**（已在.gitignore中排除）
2. **生产环境配置**：GitHub Pages部署时不包含API Key，会自动使用随机数据库
3. **如需在生产环境使用AI**：需要在GitHub仓库设置中配置环境变量

### 成本控制
- 智谱AI按Token计费
- 每次解读约消耗800-1200 Token
- 可在 `services/zhipuService.ts` 中调整参数

## 🛠️ 故障排除

### 显示"随机数据库"但已配置API Key
1. 检查 `.env` 文件位置和格式
2. 重启开发服务器
3. 查看调试面板的错误信息

### 构建失败
- 检查代码语法错误
- 确保 `npm run build` 在本地能成功运行
- 查看GitHub Actions日志获取详细错误

### 网站无法访问
- 等待5-10分钟（GitHub Pages需要时间生效）
- 清除浏览器缓存
- 确认仓库是公开的

## 📊 监控部署

- **GitHub Actions**: 查看详细构建日志
- **Pages设置**: 查看部署状态和网站地址
- **仓库首页**: 查看最新提交的部署状态

---

更多详细信息请查看：
- `API_GUIDE.md` - 智谱AI使用指南
- `INTEGRATION_COMPLETE.md` - 集成完成说明

现在你只需要推送代码，就能自动部署到GitHub Pages！ 🎉