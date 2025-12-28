# GitHub Pages 自动部署指南

## 🚀 快速部署

### 第一步：启用GitHub Pages
1. 进入你的GitHub仓库
2. 点击 **Settings** 标签
3. 在左侧菜单找到 **Pages**
4. 在 **Source** 部分选择 **GitHub Actions**
5. 点击 **Save**

### 第二步：推送代码触发部署
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 第三步：等待部署完成
- 进入仓库的 **Actions** 标签
- 等待 "Deploy to GitHub Pages" 工作流完成
- 看到绿色✅表示部署成功

### 第四步：访问网站
部署成功后，你的网站将在以下地址可用：
```
https://[你的GitHub用户名].github.io/[仓库名]/
```

## 📋 部署要求

- ✅ 仓库必须是公开的（或有GitHub Pro账户）
- ✅ 代码推送到 `main` 或 `master` 分支
- ✅ 项目能够正常构建（`npm run build` 成功）

## 🔧 本地测试

在推送前，建议先本地测试：

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 🎯 自动化流程

每次推送到main分支时，系统会自动：
1. 检出代码
2. 安装Node.js和依赖
3. 构建项目
4. 部署到GitHub Pages
5. 更新在线网站

## 🛠️ 故障排除

### 构建失败
- 检查代码语法错误
- 确保 `npm run build` 在本地能成功运行
- 查看GitHub Actions日志获取详细错误

### 网站无法访问
- 等待5-10分钟（GitHub Pages需要时间生效）
- 清除浏览器缓存
- 确认仓库是公开的

### 页面显示空白
- 检查浏览器控制台是否有错误
- 确认所有资源路径正确
- 检查API密钥等环境变量

## 📊 监控部署

- **GitHub Actions**: 查看详细构建日志
- **Pages设置**: 查看部署状态和网站地址
- **仓库首页**: 查看最新提交的部署状态

---

现在你只需要推送代码，就能自动部署到GitHub Pages！ 🎉