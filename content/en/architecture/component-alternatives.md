---
title: "Component Alternatives"
date: "2026-04-15"
description: "Compare the alternative components available in openDesk Edu, including email, video conferencing, file storage, and whiteboard solutions."
categories: ["architecture", "components"]
tags: ["comparison", "alternatives", "email", "video", "files", "whiteboard"]
---

# Component Alternatives

openDesk Edu offers choices for some service categories. Instead of locking you into a single implementation, it lets you pick the component that fits your institution's size, workflow, and compliance requirements.

There are four categories where alternatives exist: email and groupware, video conferencing, files and cloud storage, and whiteboards. In most categories only one option can be active at a time. The exceptions are noted below.

All component choices are configured in a single file: `helmfile/environments/default/global.yaml.gotmpl`.

---

## Email & Groupware

Three groupware suites are available. You can run exactly one of them at any given time.

| Feature | OX App Suite | SOGo | Grommunio |
|---|---|---|---|
| Scope | Full enterprise groupware suite | Lightweight webmail with calendar | Groupware with native mobile sync |
| License | GPL-2.0 / AGPL-3.0 | LGPL-2.1 | AGPL-3.0 |
| Version | 8.46 | 5.11 | 2025.01 |
| Calendar | Yes | Yes | Yes |
| Contacts | Yes | Yes | Yes |
| Tasks | Yes | Yes | Yes |
| ActiveSync support | Yes | No | Yes (ActiveSync 16.1) |
| Mobile push | Yes | No | Yes |
| Resource management | Yes | Limited | Yes |
| Shared mailboxes | Yes | Yes | Yes |

**OX App Suite** is the most full-featured option. It ships a complete groupware platform with email, calendar, contacts, tasks, document editing, and resource management. Its enterprise heritage shows in features like shared mailboxes, delegation, and granular permission controls. The tradeoff is complexity: OX demands more server resources and has a steeper learning curve for administrators.

**SOGo** keeps things simple. It delivers reliable webmail alongside calendar and contact management in a lightweight package. If your institution primarily needs email with basic scheduling, SOGo gets the job done with fewer hardware requirements. The main limitation is the lack of native mobile push through ActiveSync, which means mobile users rely on IMAP and CalDAV.

**Grommunio** fills the middle ground. Its standout feature is ActiveSync 16.1 support, giving users native Outlook and mobile device integration out of the box. This matters for institutions that need tight mobile sync without a third-party app. Grommunio also provides a modern web client and full groupware features.

Only one of these three can be active at a time. Switching between them requires updating the configuration and re-applying your Helmfile, plus planning for data migration if users already have mailboxes.

---

## Video Conferencing

Two video conferencing tools are available. Unlike the groupware category, both can run at the same time.

| Feature | Jitsi | BigBlueButton |
|---|---|---|
| Scope | Quick ad-hoc meetings | Full lectures with interactive tools |
| License | Apache-2.0 | LGPL-3.0 |
| Version | 2.0.10590 | 2.7 (Beta) |
| Screen sharing | Yes | Yes |
| Recording | Yes | Yes |
| Whiteboard | No | Yes |
| Breakout rooms | No | Yes |
| Polls | No | Yes |
| Presentation mode | No | Yes |
| Max participants | ~50 (depends on server) | ~200+ |
| Integration with Moodle | Limited | Yes |

**Jitsi** excels at quick, informal meetings. Create a room, share a link, and start talking. It works well for one-on-one office hours, small team calls, and spontaneous discussions. Setup is straightforward and resource usage is moderate. Jitsi does not provide breakout rooms, built-in polling, or an integrated whiteboard, so it is less suited for structured teaching sessions.

**BigBlueButton** is built for education. It includes a virtual whiteboard, presentation slides, breakout rooms, polls, and session recording, all in a single interface. These features make it a strong fit for full lectures, seminars, and workshops where the instructor needs to manage a large group. BigBlueButton is marked as Beta in openDesk Edu, meaning the integration is functional but still being refined based on real-world feedback.

Because both tools can coexist, institutions can use Jitsi for day-to-day quick calls and reserve BigBlueButton for scheduled lectures that need its advanced features.

---

## Files & Cloud Storage

Two file-sharing platforms are available. Only one can be active at a time.

| Feature | Nextcloud | OpenCloud |
|---|---|---|
| Scope | Full-featured cloud suite | Lightweight CS3-based sharing |
| License | AGPL-3.0 | Apache-2.0 |
| Version | 32.0.6 | 4.0.3 (Beta) |
| File sync client | Yes | Yes |
| Web interface | Yes | Yes |
| Collaborative editing | Yes (via Nextcloud Office) | Limited |
| Per-course shares | Via sharing API | Native support |
| Calendar | Yes | No |
| Contacts | Yes | No |
| Talk (chat) | Yes | No |
| External storage mounts | Yes | Limited |
| App ecosystem | Large | Minimal |

**Nextcloud** is a comprehensive self-hosted cloud platform. Beyond file storage, it bundles calendar, contacts, real-time chat (Nextcloud Talk), collaborative document editing, and a large app ecosystem. It integrates well with existing tools and can mount external storage backends. The breadth of features comes at a cost in complexity and resource usage, but for institutions that want a single platform to handle many collaboration tasks, Nextcloud is the obvious choice.

**OpenCloud** takes a more focused approach. Built on the Collabora Spaces 3 (CS3) protocol, it provides lightweight file sharing with native per-course sharing capabilities. This makes it particularly interesting for educational setups where files need to be tied to specific courses rather than individual users. OpenCloud is marked as Beta, indicating the integration is still evolving.

Only one file storage solution can be active. Choose Nextcloud if you need the full platform, or OpenCloud if you want a leaner, course-oriented file sharing experience.

---

## Whiteboard

Two whiteboard tools are available. Both can run at the same time.

| Feature | Excalidraw | CryptPad Diagrams |
|---|---|---|
| Scope | Freeform sketching and diagrams | Privacy-first collaborative diagrams |
| License | MIT | AGPL-3.0 |
| Version | Latest | 2025.9.0 |
| Freeform drawing | Yes | Limited |
| Shapes and arrows | Yes | Yes |
| Real-time collaboration | Yes | Yes |
| End-to-end encryption | No | Yes |
| Templates | No | Yes |
| Export formats | SVG, PNG, JSON | SVG, PNG |
| Privacy by design | No | Yes |

**Excalidraw** is a virtual whiteboard that feels like sketching on paper. Its hand-drawn style makes it approachable for brainstorming, quick diagrams, and informal explanations. Collaboration works in real time, and the export options cover the common formats. Because the license is MIT, it integrates cleanly into openDesk Edu without licensing concerns.

**CryptPad Diagrams** takes a privacy-first approach. All diagrams are end-to-end encrypted, meaning not even the server administrator can see the content. This makes it a good fit for institutions with strict data protection requirements. It also offers templates and a more structured diagramming experience compared to Excalidraw's freeform canvas.

Both whiteboards can coexist, so users get to pick the tool that matches their task: Excalidraw for quick brainstorming, CryptPad for sensitive diagrams that need encryption.

---

## Choosing the Right Components

There is no single "best" combination. The right choice depends on your institution's priorities.

**Small institutions** (schools, small departments) tend to prefer simplicity. SOGo for email, Jitsi for video, and either file storage option keeps the infrastructure manageable. The lower resource footprint means it runs on modest hardware.

**Large universities** usually need the full feature set. OX App Suite handles complex mail setups, BigBlueButton runs large lectures with breakout rooms, and Nextcloud provides the broad collaboration platform. This combination demands more server resources and administrative capacity, but it covers nearly every use case.

**Research-focused institutions** might prioritize flexibility and privacy. Nextcloud gives researchers space to share large datasets, Excalidraw supports quick visual explanations, and CryptPad handles diagrams involving sensitive data. Pairing Grommunio for email ensures researchers get solid mobile sync without leaving the self-hosted stack.

---

## Switching Components

Changing a component is a configuration change, not a reinstall.

1. Open `helmfile/environments/default/global.yaml.gotmpl` in your deployment repository.
2. Find the section for the category you want to change (email, video, files, or whiteboard).
3. Set the active component and comment out or remove the alternative.
4. Run `helmfile apply` to update the deployment.

**Data migration** is the part that needs attention. When you switch between mutually exclusive components (email or file storage), existing user data does not automatically transfer. Plan for:

- Exporting mailboxes from the old groupware and importing them into the new one.
- Migrating files from one storage backend to the other.
- Updating user bookmarks and shared links.
- Communicating the change to users ahead of time.

For categories where both tools coexist (video conferencing and whiteboards), no migration is needed. Users simply start using the new tool alongside the existing one.
