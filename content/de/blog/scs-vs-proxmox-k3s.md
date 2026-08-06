---
title: "SCS vs. Proxmox + K3s: Die Basis für openDesk Edu wählen"
date: "2026-08-06"
description: "openDesk Edu ist Kubernetes-nativ — die Plattformentscheidung kommt also zuerst. Eine neutrale Betrachtung von SCS und Proxmox VE mit K3s für Hochschulen: Governance, Zertifizierung, Portabilität und Betrieb."
categories: ["Architektur"]
tags: ["scs", "sovereign-cloud-stack", "proxmox", "k3s", "kubernetes", "architektur", "beschaffung", "souveränität"]
author: "Tobias Weiß und openDesk Edu Mitwirkende"
image: "/static/blog/scs-vs-proxmox-k3s-teaser.svg"
---

# SCS vs. Proxmox + K3s: Die Basis für openDesk Edu wählen

Die Entscheidung über die Basisplattform kommt vor der Entscheidung über die Dienste. openDesk Edu ist Kubernetes-nativ — die Dienste werden als Helm-Charts, GitOps-Manifeste und Container-Images ausgeliefert. Die praktische Frage für eine Einrichtung ist daher nicht, welche Anwendungen betrieben werden, sondern wie eine Kubernetes-Plattform entsteht, die ein kleines Team nachhaltig betreiben kann. Dieser Artikel vergleicht zwei in der deutschen Hochschullandschaft verbreitete Ansätze: den Standard des Sovereign Cloud Stack (SCS) und einen selbst betriebenen Stack aus Proxmox VE mit K3s. Beide werden sachlich beschrieben, und es werden die Faktoren aufgezeigt, die üblicherweise zwischen ihnen entscheiden.

## Zwei Ansätze für dieselbe Anforderung

### SCS: Ein Standard, kein Produkt

Der Sovereign Cloud Stack (SCS) ist ein Standard für souveräne Cloud-Infrastruktur, entwickelt von einer Community unter der Schirmherrschaft der Open Source Business Alliance (OSBA). Er definiert interoperable Schichten für Infrastructure-as-a-Service (auf OpenStack-Basis) und Container-Plattformen (Kubernetes) sowie Referenzimplementierungen, die Provider und Betreiber übernehmen können.

SCS ist deshalb bedeutsam, weil es auf der Ebene der **Zertifizierung** wirkt. Betreiber können den Status SCS-kompatibel oder SCS-sovereign erreichen, was signalisiert, dass ihre Cloud standardisierte, portable Schnittstellen bietet. Für öffentliche Einrichtungen ist diese Zertifizierung bei der Beschaffung relevant: Sie liefert eine dokumentierte Grundlage für den Vergleich von Providern und fügt sich in Compliance-Frameworks ein, etwa die Container-Anforderungen der Bundesverwaltung.

Das entscheidende Merkmal von SCS ist die **Portabilität durch Standardisierung** — eine Workload, die auf einer SCS-zertifizierten Plattform läuft, sollte auf jeder anderen laufen, und die Schnittstellen sind offen spezifiziert, nicht von einem einzelnen Anbieter festgelegt.

### Proxmox VE + K3s: Ein selbst betriebener Stack

Proxmox VE ist eine quelloffene Virtualisierungsplattform (basierend auf KVM und LXC), gepflegt von Proxmox Server Solutions GmbH, mit einer großen Community an europäischen Hochschulen. K3s ist eine leichtgewichtige, CNCF-zertifizierte Kubernetes-Distribution, gepflegt von SUSE/Rancher und ausgelegt für ressourcenbeschränkte und Edge-Umgebungen.

Zusammen ergeben sie eine pragmatische, vollständig selbst betriebene Plattform: Proxmox VE übernimmt Virtualisierung und Speicherverwaltung, K3s stellt darüber die Kubernetes-Kontrollfläche bereit. Diese Kombination ist an Universitäten beliebt, weil sie von einem kleinen Team betrieben werden kann, gut dokumentiert ist und in ihrer Grundform ohne Abonnementverpflichtungen auskommt.

Das entscheidende Merkmal dieses Ansatzes ist die **betriebliche Einfachheit**: zwei gut verstandene Open-Source-Komponenten, kein Zertifizierungsprozess und vollständige Kontrolle über jede Schicht.

## Vergleich

| Dimension | SCS | Proxmox VE + K3s |
|-----------|-----|------------------|
| **Was es ist** | Ein Standard mit Referenzimplementierungen | Ein konkreter Virtualisierungs- und Container-Stack |
| **Governance** | Community-getrieben unter OSBA, Kontext öffentlicher Förderung | Hersteller-gepflegt (Open Source), Community-Ökosystem |
| **Zertifizierung** | Ebenen SCS-kompatibel / SCS-sovereign | Keine |
| **Portabilität** | Standardisierte Schnittstellen zwischen zertifizierten Plattformen | Spezifisch für die gewählten Komponenten |
| **Betrieb** | Erfordert Verständnis des vollständigen SCS-Referenzstacks | Zwei Komponenten, gut dokumentiert, für kleine Teams geeignet |
| **Eignung für Beschaffung** | Direkt in der souveränen Cloud-Beschaffung nutzbar | Indirekt — Bewertung anhand technischer Kriterien |
| **Ausrichtung auf Souveränität** | Explizites Ziel des Standards | Erreicht durch Selbstbetrieb von Open Source |
| **Typischer Betreiber** | Cloud-Provider, größere Einrichtungen, Konsortien | Einzelne Einrichtungen, kleine IT-Teams |

Keiner der beiden Ansätze ist grundsätzlich besser; sie adressieren unterschiedliche institutionelle Kontexte.

## Entscheidungsfaktoren

### Teamgröße und Fachwissen

SCS setzt die Fähigkeit voraus, einen vollständigen Cloud-Stack zu betreiben — auch mit Referenzimplementierungen ist die Betriebsfläche groß. Proxmox VE + K3s passt zu Einrichtungen, in denen zwei bis drei Personen die gesamte Plattform betreiben. Kann das Team bereits OpenStack oder eine zertifizierte SCS-Plattform betreiben, sind die Grenzkosten von SCS niedriger; liegt die Stärke des Teams in Virtualisierung und Linux-Administration, ist der Weg über Proxmox + K3s direkter.

### Beschaffungs- und Compliance-Kontext

Für Einrichtungen, die Interoperabilität nachweisen oder an souveräner Cloud-Beschaffung teilnehmen müssen, ist die SCS-Zertifizierung ein dokumentierter, prüfbarer Vermögenswert. Für Einrichtungen, die Hardware und Software direkt beschaffen, kann der selbst betriebene Stack allein anhand technischer Kriterien spezifiziert werden.

### Portabilitätsanforderungen

Wenn Workloads zwischen Providern verschiebbar sein müssen — etwa im Rahmen eines Konsortiums oder einer Cloud-Strategie mit mehreren Providern — senken die standardisierten SCS-Schnittstellen die Kosten dieser Migration. Wenn Workloads dauerhaft auf der Hardware der Einrichtung verbleiben, wird Portabilität zwischen Providern selten genutzt, und der einfachere Stack genügt.

### Was openDesk Edu von jeder Basis verlangt

Unabhängig von der Wahl stellt openDesk Edu dieselben Basisanforderungen:

- Kubernetes 1.28 oder neuer, mit funktionierendem Ingress-Controller und persistenten Storage-Klassen
- Identitätsföderation über SAML oder OIDC (openDesk Edu liefert Keycloak, das mit DFN-AAI / eduGAIN föderieren kann)
- GitOps-Werkzeuge (ArgoCD) oder Deployment über Helm/Helmfile
- Monitoring und Logging (die Plattform umfasst Prometheus, Grafana und Loki)
- Container-Images aus einer Registry, die der Cluster erreichen kann

Sowohl SCS-zertifizierte Plattformen als auch K3s-Cluster erfüllen diese Anforderungen. SCS ergänzt standardisierte Schnittstellen für Speicher und Netzwerk; Proxmox + K3s stellt sie über die gewählten Komponenten direkt bereit.

## Praktische Beobachtungen

- **Beginnen Sie mit der kleinsten Plattform, die Sie nachhaltig betreiben können.** Kubernetes selbst ist auf beiden Basen identisch; die Unterschiede liegen in der umgebenden Infrastruktur.
- **Speicher ist der entscheidende Betriebsfaktor.** Beide Ansätze benötigen zuverlässige persistente Storage-Klassen; Proxmox VEs native Speicherverwaltung und SCS' standardisierte Speicherschnittstellen funktionieren beide, das Betriebsmodell unterscheidet sich jedoch.
- **Upgrades unterscheiden sich im Umfang.** K3s-Upgrades sind klein und häufig; Upgrades des SCS-Referenzstacks betreffen mehr Komponenten. Einrichtungen mit begrenzten Wartungsfenstern sollten dies einplanen.
- **Kein Ansatz schließt den anderen aus.** Ein Proxmox- + K3s-Deployment kann später mit Standard-Kubernetes-Werkzeugen auf eine SCS-zertifizierte Plattform migriert werden, da die Workload-Manifeste von Natur aus portabel sind.

## Zusammenfassung

| Überlegung | Tendenz zu |
|------------|------------|
| Kleines Team, Selbstbetrieb, direkte Kontrolle | Proxmox VE + K3s |
| Beschaffungszertifizierung, Provider-Portabilität | SCS |
| Vorhandene OpenStack-/SCS-Kenntnisse | SCS |
| Vorhandene Virtualisierungs-/Linux-Kenntnisse | Proxmox VE + K3s |
| Workloads bleiben auf der Hardware der Einrichtung | Proxmox VE + K3s |
| Konsortium oder Multi-Provider-Cloud-Strategie | SCS |

openDesk Edu läuft auf Kubernetes; es schreibt die Basis nicht vor. Die Wahl zwischen SCS und Proxmox + K3s ist eine Entscheidung über Governance, Portabilität und die betriebliche Kapazität der Einrichtung — nicht über die Anwendungen selbst.

---

## Erste Schritte

1. **Anforderungen prüfen**: Der [Deployment-Leitfaden](/de/blog/deploying-opendesk-edu) beschreibt, was jede Basisplattform bieten muss.
2. **Beide Basen bewerten**: Setzen Sie die oben genannten Entscheidungsfaktoren mit dem Team-, Beschaffungs- und Portabilitätskontext Ihrer Einrichtung in Beziehung.
3. **Mitdiskutieren**: Die openDesk-Edu-Community freut sich über Berichte von Einrichtungen, die eine der beiden Basen betreiben. Teilen Sie Ihre Erfahrungen in der [Community of Practice](/de/blog/community-of-practice-juni-2026).

---

*openDesk Edu ist die Bildungsvariante von [openDesk](https://opendesk.eu), erweitert um eine umfassende Auswahl an Diensten für Forschung und Lehre. Der Quellcode ist auf [GitHub](https://github.com/tobias-weiss-ai-xr/opendesk-nix) und [opencode.de](https://gitlab.opencode.de/umr) verfügbar.*
