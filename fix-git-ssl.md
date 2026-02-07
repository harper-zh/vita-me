# Git SSL/TLS 连接问题修复指南

## 已执行的修复（方案1）
已设置以下 Git 配置：
- `http.sslBackend=schannel` - 使用 Windows 的 schannel
- `http.sslVerify=true` - 启用 SSL 验证
- `http.version=HTTP/1.1` - 使用 HTTP/1.1 协议

## 如果问题仍然存在，尝试以下方案：

### 方案2：切换到 SSH（推荐）
如果 HTTPS 连接有问题，使用 SSH 更稳定：

```bash
# 1. 检查是否已有 SSH 密钥
ls ~/.ssh/id_rsa.pub

# 2. 如果没有，生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 3. 复制公钥内容
cat ~/.ssh/id_ed25519.pub

# 4. 在 GitHub 上添加 SSH 密钥：
#    Settings > SSH and GPG keys > New SSH key

# 5. 将远程仓库 URL 改为 SSH
git remote set-url origin git@github.com:harper-zh/vita-me.git

# 6. 测试连接
ssh -T git@github.com

# 7. 再次尝试 push
git push
```

### 方案3：检查代理设置
如果你使用代理：

```bash
# 设置代理（替换为你的代理地址和端口）
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080

# 或者如果使用 SOCKS5
git config --global http.proxy socks5://127.0.0.1:1080

# 取消代理设置
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 方案4：临时禁用 SSL 验证（不推荐，仅用于测试）
```bash
git config --global http.sslVerify false
# 测试后记得改回来
git config --global http.sslVerify true
```

### 方案5：更新 Git
确保使用最新版本的 Git：
```bash
# 下载最新版 Git for Windows
# https://git-scm.com/download/win
```

### 方案6：使用 GitHub CLI
```bash
# 安装 GitHub CLI
# https://cli.github.com/

# 使用 gh 命令进行认证
gh auth login
```

## 当前错误分析
错误信息显示：`Failed to connect to github.com port 443`
这通常表示：
1. 网络连接问题（防火墙/代理）
2. GitHub 服务器暂时不可达
3. 需要使用 VPN 或代理

## 推荐操作顺序
1. ✅ 已执行：配置 SSL backend
2. 尝试方案2（切换到 SSH）- 最稳定
3. 检查网络/代理设置
4. 如果在中国大陆，可能需要使用代理或 VPN


