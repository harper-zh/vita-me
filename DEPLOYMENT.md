# 自动部署说明

本项目已配置GitHub Actions自动部署到GitHub Pages。

## 🚀 自动部署流程

### 触发条件
- 推送代码到 `main` 或 `master` 分支
- 创建针对 `main` 或 `master` 分支的Pull Request

### 部署步骤
1. **代码检出**: 获取最新代码
2. **环境设置**: 安装Node.js 18
3. **依赖安装**: 运行 `npm ci` 安装依赖
4. **项目构建**: 运行 `npm run build` 构建项目
5. **部署发布**: 自动部署到GitHub Pages

## ⚙️ 配置要求

### 1. GitHub仓库设置
确保在GitHub仓库中启用以下设置：

1. 进入仓库 **Settings** → **Pages**
2. **Source** 选择 "GitHub Actions"
3. 确保仓库是公开的，或者有GitHub Pro/Team账户

### 2. 环境变量（可选）
如果项目需要API密钥等环境变量：

1. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
2. 添加需要的环境变量，例如：
   - `GEMINI_API_KEY`: Gemini API密钥
   - `VITE_API_URL`: API地址

### 3. 分支保护（推荐）
为了确保代码质量，建议设置分支保护：

1. 进入仓库 **Settings** → **Branches**
2. 为 `main` 分支添加保护规则
3. 启用 "Require status checks to pass before merging"

## 📦 本地构建测试

在推送代码前，可以本地测试构建：

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 🌐 访问部署的网站

部署成功后，网站将在以下地址可用：
```
https://[你的用户名].github.io/[仓库名]/
```

## 🔧 故障排除

### 构建失败
1. 检查代码是否有语法错误
2. 确保所有依赖都在 `package.json` 中声明
3. 查看GitHub Actions日志获取详细错误信息

### 部署失败
1. 确保GitHub Pages已启用
2. 检查仓库权限设置
3. 确认分支名称正确（main/master）

### 页面无法访问
1. 等待几分钟，GitHub Pages部署可能需要时间
2. 检查浏览器缓存
3. 确认URL路径正确

## 📝 自定义配置

### 修改构建配置
编辑 `vite.config.ts` 文件来自定义构建设置。

### 修改部署工作流
编辑 `.github/workflows/deploy.yml` 文件来自定义部署流程。

### 添加构建步骤
在工作流中添加额外的步骤，如：
- 代码检查 (ESLint)
- 类型检查 (TypeScript)
- 单元测试
- 性能测试

## 🎯 最佳实践

1. **代码质量**: 推送前确保代码通过本地测试
2. **提交信息**: 使用清晰的提交信息
3. **分支管理**: 使用feature分支开发，通过PR合并
4. **版本标签**: 为重要版本创建Git标签
5. **监控部署**: 关注GitHub Actions的执行状态

## 📊 部署状态

可以在README中添加部署状态徽章：

```markdown
![Deploy Status](https://github.com/[用户名]/[仓库名]/workflows/Build%20and%20Deploy%20to%20GitHub%20Pages/badge.svg)
```

---

现在你只需要：
1. 提交代码到仓库
2. 推送到main分支
3. 等待自动部署完成！ 🎉