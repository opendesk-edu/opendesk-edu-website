---
title: "KasmVNC"
date: "2026-05-29"
description: "在浏览器中提供完整的 Linux 桌面环境，性能接近原生体验。"
categories: ["基础设施", "科学计算", "测试版"]
tags: ["kasmvnc", "desktop", "vnc", "remote-access", "scientific-computing"]
version: "1.16"
---

# KasmVNC

KasmVNC 通过基于 WebAssembly 的流式技术，在浏览器中直接提供完整的 Linux 桌面环境。它让学生和研究人员能够访问 GUI 应用程序、开发工具以及需要桌面环境的科学软件，而无需在客户端设备上安装任何软件。

## 核心功能

- **浏览器中的完整桌面**：以接近原生的性能流式传输完整的 Linux 桌面（XFCE）。
- **GPU 加速**：支持 WebGL 的 3D 可视化和 GPU 加速应用程序。
- **预配置工作区**：预装科学工具和 IDE 的桌面镜像。
- **剪贴板和文件传输**：客户端与桌面之间的双向剪贴板及文件上传/下载。
- **音频支持**：将远程桌面的音频流传输到浏览器。

## 与 openDesk Edu 的集成

KasmVNC 属于协作服务套件，通过其上游 Helm Chart（`registry.kasmweb.com`）部署。它通过 oauth2-proxy sidecar 使用 Keycloak 进行身份验证，可通过机构通配符 DNS 下的 `desktop.*` 访问。

## 了解更多

- [官方文档](https://kasmweb.com/) — KasmVNC 文档和资源
