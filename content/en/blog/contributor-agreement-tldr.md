---
title: "TL;DR: openDesk Contributor Agreement"
date: "2026-07-12"
description: "A quick guide to signing the CLA and starting your first contribution to openDesk."
categories: ["Community"]
tags: ["contributing", "CLA", "open-source"]
---

# TL;DR: openDesk Contributor Agreement

So you want to contribute to openDesk. Great. openDesk is a community-driven platform, and every contribution starts with one thing: signing the Contributor License Agreement (CLA). This guide explains what it is, why it exists, and how to get through the process in under ten minutes.

## Why a CLA?

openDesk is published under the Apache License 2.0, a permissive open-source license that gives everyone the freedom to use, modify, and distribute the software. But openDesk is also developed by multiple organizations. Universities, service providers, and individual contributors all submit code. The CLA ensures that every contribution comes with a clear grant of rights.

Without a CLA, the project could face legal uncertainty. Did the contributor have the right to submit that code? Does their employer have a claim to it? The CLA answers those questions before the code enters the repository. It protects both the contributor (nobody can claim they didn't authorize their contribution) and the project (the codebase stays cleanly licensed).

## The Two-Step Process

Contributing is a two-step workflow:

1.  **Submit an access request.** You ask for access to the project on GitLab.
2.  **Make a signed commit.** Your first merge request must include at least one commit signed with your GPG or SSH key.

That is it. Once you complete both steps, the CLA bot takes over.

## How the Bot Works

The CLA bot runs every 15 minutes. It checks for new access requests on GitLab, verifies the signed commits, and grants access automatically. You do not need to wait for a human reviewer. If your commit is properly signed and your access request is submitted, the bot handles the rest.

Under the hood, the bot checks:

-   That your commit is cryptographically signed (GPG or SSH).
-   That the signature's associated email matches your GitLab profile.
-   That the commit message includes the `userid:username` marker (more on that below).

Everything passes? Access is granted within the next bot cycle. No manual approval needed.

## What a Signed Commit Looks Like

A signed commit looks like this in the Git log:

```
commit a1b2c3d4e5f6...
Author: Your Name <your.email@example.com>
Date:   Mon Jul 7 14:23:00 2026 +0200

    Initial implementation of the widget module

    userid:your-gitlab-username
```

The critical part is the last line of the commit message body. It must contain `userid:` followed by your GitLab username. This is how the bot maps the signed commit to your access request.

## Setting Up Commit Signing

If you have never signed a commit before, here is the short version.

**GPG signing:**

1.  Generate a GPG key: `gpg --full-generate-key`
2.  Find the key ID: `gpg --list-secret-keys --keyid-format=long`
3.  Configure Git: `git config --global user.signingkey <KEY-ID>`
4.  Enable signing globally: `git config --global commit.gpgsign true`
5.  Add the public key to your GitLab profile (Settings > GPG Keys).

**SSH signing:**

1.  Use your existing SSH key or generate a new one.
2.  Configure Git: `git config --global gpg.format ssh`
3.  Set the signing key: `git config --global user.signingkey ~/.ssh/id_ed25519.pub`
4.  Add the public key to your GitLab profile (Settings > SSH Keys).

Then sign your commit: `git commit -S -m "Your message"` (the `-S` flag triggers signing).

## After Your Merge Request Is Merged

Once your first merge request is accepted and the bot has processed it, you get a personal fork namespace on GitLab. This is your own workspace under the openDesk project, named after your GitLab username. You can use it to create merge requests, collaborate on features, and manage your contributions without affecting the main repository.

## Where to Find the Repositories

The openDesk project spans several repositories, each with a specific focus:

-   **Deployment:** The main helmfile-based deployment configuration for openDesk CE.
-   **Education variant:** openDesk Edu with 25 integrated services for universities.
-   **Tooling:** Import scripts, backup operators (k8up), and utility tools.
-   **Documentation:** Architecture docs, developer guides, and operational runbooks.
-   **Charts:** Local Helm chart overrides and community-maintained chart packages.
-   **Compose variant:** A Docker Compose alternative for smaller deployments.

All repositories live under the [openDesk GitLab group](https://gitlab.opencode.de/bmi/opendesk). Browse the project list, find something that interests you, and start contributing.

## The CLA Repository

The CLA infrastructure is open source too. You can inspect the bot code, review the agreement text, and even contribute improvements to the CLA tooling itself. Everything is in the [cla-signer repository](https://gitlab.opencode.de/bmi/opendesk/contributing/cla-signer).

---

Ready to contribute? Submit your access request on GitLab, sign your first commit, and join the openDesk community.
