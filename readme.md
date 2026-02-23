115Share 是一个集成了 Telegram 机器人、115 网盘自动化操作、媒体整理与发布的工具。只需向机器人发送 115 分享链接，即可自动完成：转存到指定目录 → 按 TMDB 元数据智能整理 → 生成新分享（可选有效期）→ 发布到 Telegram 频道或指定网站。所有配置均可通过 Web 界面轻松管理。

✨ 功能特点

· 🤖 Telegram 机器人：接收分享链接，支持 /set_days 设置有效期
· 📥 自动转存：将文件保存到 115 网盘指定目录
· 🗂️ 智能整理：基于 TMDB 元数据和自定义规则（如分类、重命名）自动整理文件
· 🔗 生成新分享：可设置 1天/7天/永久 有效期
· 📢 多端发布：支持发布到 Telegram 频道或自定义网站（如 https://push.shutu.pro:8443/publish）
· 🌐 Web 管理界面：可视化配置参数、查看任务日志
· 🐳 一键部署：提供 Docker 单容器镜像，无需复杂依赖

🚀 快速开始

使用 Docker 单容器运行（推荐）

确保已安装 Docker。

1. 创建配置目录

```bash
mkdir -p ./config ./data
```

· ./config：存放环境变量配置文件 .env 和可选的整理规则文件 tmdb_config.json
· ./data：存放 SQLite 数据库和日志文件（持久化）

2. 准备配置文件

在 ./config 目录下创建 .env 文件，填入必要信息：

```bash
# Telegram Bot Token（从 @BotFather 获取）
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# 115 Cookie（登录网页版后从浏览器复制，格式如 "UID=...; CID=...; SEID=..."）
115_COOKIE="UID=123; CID=456; SEID=789"

# TMDB API Key（申请地址：https://www.themoviedb.org/settings/api）
TMDB_API_KEY=your_tmdb_api_key_here

# 可选配置
DEFAULT_SAVE_PATH=/我的接收          # 115 中转存根目录，默认 /我的接收
DEFAULT_SHARE_DAYS=7                 # 默认分享有效期（1~永久），默认 7
TELEGRAM_CHANNEL_ID=@your_channel    # 发布到的 Telegram 频道 ID（以 @ 开头）
PUBLISH_WEBSITE_URL=https://push.shutu.pro:8443/publish  # 发布到的网站 URL
PUBLISH_WEBSITE_TOKEN=optional_token # 网站认证 Token（如果需要）
```

注意：115_COOKIE 必须包含 UID、CID、SEID 等关键字段，建议从浏览器开发者工具中复制完整 Cookie 字符串。

如果你需要自定义媒体整理规则（可选），可以将 tmdb_config.example.json 复制为 tmdb_config.json 并编辑，放在 ./config 目录下。若不提供，则使用默认配置。

3. 运行容器

```bash
docker run -d \
  --name 115share \
  --restart always \
  -p 8000:8000 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/data:/app/data \
  cats798/115share:latest
```

· -p 8000:8000：将容器的 8000 端口映射到宿主机，用于访问 Web 管理界面
· -v $(pwd)/config:/app/config：挂载配置目录（.env 和可选的 tmdb_config.json）
· -v $(pwd)/data:/app/data：挂载数据目录（数据库和日志）

如果宿主机 8000 端口已被占用，可以修改为其他端口，例如 -p 8080:8000。

4. 验证运行

· 查看容器日志：docker logs -f 115share
· 访问 Web 界面：浏览器打开 http://你的服务器IP:8000，应该看到配置面板
· 向你的 Telegram 机器人发送 /start，收到欢迎消息即表示机器人正常

🛠️ 使用方法

Telegram 机器人命令

命令 说明
/start 获取帮助信息
/set_days <数字> 设置本次会话的分享有效期（例如 /set_days 3）
直接发送 115 分享链接 自动触发转存→整理→分享→发布流程

Web 管理界面

· 配置：可以修改机器人 Token、115 Cookie、TMDB Key 等参数
· 任务列表：查看历史任务状态（处理中、成功、失败）及生成的新分享链接
· 日志：实时查看后台任务日志

🔧 高级配置

自定义整理规则

编辑挂载目录中的 tmdb_config.json 文件（格式参考示例）。规则基于 TMDB 元数据（类型、国家、类型 ID 等）匹配分类，并指定目标路径和重命名模板。修改后无需重启容器，系统会自动加载新配置（每分钟检查一次）。

更新镜像

拉取最新镜像并重启容器：

```bash
docker pull cats798/115share:latest
docker stop 115share
docker rm 115share
# 重新运行上述 docker run 命令
```

数据备份

· 配置文件：备份 ./config 目录即可
· 数据库和日志：备份 ./data 目录

❓ 常见问题

Q：机器人没有响应我的消息？
A：检查 .env 中的 BOT_TOKEN 是否正确，并确保容器日志中没有错误（如网络问题）。可以尝试在 Telegram 中重新发送 /start。

Q：115 转存失败怎么办？
A：通常是因为 Cookie 过期。重新登录 115 网页版，获取新的 Cookie 并更新到 .env 文件中，然后重启容器。另外，确保 DEFAULT_SAVE_PATH 目录在 115 网盘中存在。

Q：整理规则不生效？
A：确认 tmdb_config.json 格式正确，且媒体信息能被 TMDB 识别（可查看日志中的识别结果）。如果文件较多，整理可能耗时较长，请耐心等待。

Q：如何修改 Web 界面端口？
A：修改 docker run 命令中的 -p 参数，例如 -p 8080:8000，然后重启容器。

Q：能否在同一台机器上运行多个实例？
A：可以，但需要修改容器名称、端口映射和挂载目录，确保不冲突。

🤝 贡献

欢迎提交 Issue 或 Pull Request！请确保代码风格符合 PEP8，并添加必要的测试。

📄 许可证

本项目采用 MIT 许可证。

---

Enjoy automating your 115 cloud sharing! 🎉