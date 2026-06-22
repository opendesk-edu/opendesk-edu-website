---
title: "ttyd"
date: "2026-05-29"
description: "基于浏览器的 Linux 终端，从任何设备提供完整的命令行访问。"
categories: ["基础设施", "科学计算"]
tags: ["ttyd", "terminal", "ssh", "cli", "scientific-computing"]
version: "1.7"
---

# ttyd

ttyd 是一个轻量级工具，可通过 Web 浏览器共享完整的 Linux 终端。它让学生和研究人员能够从任何设备访问服务器环境的命令行，实现 SSH 访问、脚本执行和系统管理，而无需安装终端模拟器。

## 核心功能

- **基于浏览器的终端**：在任何现代 Web 浏览器中运行完整的 xterm 兼容终端。
- **无需客户端安装**：在 Chromebook、平板电脑和受限设备上仅需浏览器即可使用。
- **文件访问**：完整的文件系统访问权限，可访问用户存储和共享研究数据。
- **剪贴板支持**：在本地机器和浏览器终端之间复制和粘贴。
- **会话持久化**：通过 tmux 集成，终端会话在页面刷新后保持连接。

## 与 openDesk Edu 的集成

ttyd 属于协作服务套件，通过自定义本地 Helm Chart（`helmfile/charts/ttyd`）部署。它通过 oauth2-proxy sidecar 使用 Keycloak 进行身份验证，可通过机构通配符 DNS 下的 `term.*` 访问。

## 了解更多

- [官方文档](https://github.com/tsl0922/ttyd) — ttyd 文档和资源
