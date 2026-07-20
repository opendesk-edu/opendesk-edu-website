---
title: "TL;DR：openDesk 贡献者协议"
date: "2026-07-12"
description: "签署 CLA 并开始您对 openDesk 的首次贡献的快速指南。"
categories: ["社区"]
tags: ["贡献", "cla", "开源"]
image: "/static/blog/contributor-agreement-tldr-teaser.svg"
---

# TL;DR：openDesk 贡献者协议

您想为 openDesk 做出贡献。太好了。openDesk 是一个社区驱动的平台，每个贡献都始于一件事：签署贡献者许可协议（CLA）。本指南解释它是什么、为什么存在以及如何在十分钟内完成流程。

## 为什么需要 CLA？

openDesk 基于 Apache 2.0 许可证发布，这是一个宽松的开源许可证，赋予每个人使用、修改和分发软件的自由。但 openDesk 也由多个组织开发。大学、服务提供商和个人贡献者都提交代码。CLA 确保每个贡献都附带明确的授权。

如果没有 CLA，项目可能面临法律不确定性。贡献者是否有权提交该代码？其雇主是否对其拥有权利？CLA 在代码进入仓库之前回答了这些问题。它既保护贡献者（没有人可以声称他们没有授权其贡献），也保护项目（代码库保持干净授权）。

## 两步流程

贡献是一个两步工作流：

1.  **提交访问请求。** 您在 GitLab 上请求访问项目。
2.  **进行签名提交。** 您的第一个合并请求必须包含至少一个用您的 GPG 或 SSH 密钥签名的提交。

就是这样。完成这两个步骤后，CLA 机器人就会接管。

## 机器人如何工作

CLA 机器人每 15 分钟运行一次。它检查 GitLab 上的新访问请求，验证签名提交，并自动授予访问权限。您无需等待人工审核。如果您的提交已正确签名并且访问请求已提交，机器人会处理其余部分。

在幕后，机器人检查：

-   您的提交是否经过加密签名（GPG 或 SSH）。
-   签名关联的电子邮件是否与您的 GitLab 个人资料匹配。
-   提交消息是否包含 `userid:username` 标记（详见下文）。

一切通过？访问权限将在下一个机器人周期内授予。无需手动批准。

## 签名提交的样子

签名提交在 Git 日志中看起来像这样：

```
commit a1b2c3d4e5f6...
Author: 您的姓名 <your.email@example.com>
Date:   Mon Jul 7 14:23:00 2026 +0200

    小部件模块的初始实现

    userid:您的-gitlab-用户名
```

关键部分是提交消息正文的最后一行。它必须包含 `userid:` 后跟您的 GitLab 用户名。这就是机器人将签名提交与您的访问请求关联起来的方式。

## 设置提交签名

如果您从未签名过提交，以下是简要版本。

**GPG 签名：**

1.  生成 GPG 密钥：`gpg --full-generate-key`
2.  找到密钥 ID：`gpg --list-secret-keys --keyid-format=long`
3.  配置 Git：`git config --global user.signingkey <密钥-ID>`
4.  全局启用签名：`git config --global commit.gpgsign true`
5.  将公钥添加到您的 GitLab 个人资料（设置 > GPG 密钥）。

**SSH 签名：**

1.  使用您现有的 SSH 密钥或生成新密钥。
2.  配置 Git：`git config --global gpg.format ssh`
3.  设置签名密钥：`git config --global user.signingkey ~/.ssh/id_ed25519.pub`
4.  将公钥添加到您的 GitLab 个人资料（设置 > SSH 密钥）。

然后签署您的提交：`git commit -S -m "您的消息"`（`-S` 标志触发签名）。

## 合并请求合并后

一旦您的第一个合并请求被接受并由机器人处理后，您将在 GitLab 上获得一个个人 fork 命名空间。这是您在 openDesk 项目下的工作区，以您的 GitLab 用户名命名。您可以用它来创建合并请求、协作开发功能和管理您的贡献，而不影响主仓库。

## 在哪里找到仓库

openDesk 项目涵盖多个仓库，每个仓库都有特定的关注点：

-   **部署：** openDesk CE 的主要基于 helmfile 的部署配置。
-   **教育变体：** 包含 25 个集成服务的 openDesk Edu，面向大学。
-   **工具：** 导入脚本、备份运算符（k8up）和实用工具。
-   **文档：** 架构文档、开发者指南和运维手册。
-   **Charts：** 本地 Helm chart 覆盖和社区维护的 chart 包。
-   **Compose 变体：** 适用于较小部署的 Docker Compose 替代方案。

所有仓库都位于 [openDesk GitLab 组](https://gitlab.opencode.de/bmi/opendesk) 下。浏览项目列表，找到您感兴趣的内容，开始贡献。

## CLA 仓库

CLA 基础设施也是开源的。您可以检查机器人代码、审查协议文本，甚至为 CLA 工具本身贡献改进。一切都在 [cla-signer 仓库](https://gitlab.opencode.de/bmi/opendesk/contributing/cla-signer) 中。

---

准备好贡献了吗？在 GitLab 上提交您的访问请求，签署您的第一个提交，加入 openDesk 社区。
