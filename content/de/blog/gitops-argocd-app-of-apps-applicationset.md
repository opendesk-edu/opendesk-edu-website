---
title: "GitOps in großem Maßstab: App of Apps vs. ApplicationSet für openDesk"
date: "2026-06-19"
description: "Da openDesk Edu auf über 30 Dienste anwächst, stößt unsere einzelne monolithische ArgoCD-Application an ihre Grenzen. Dieser Beitrag vergleicht die Muster App of Apps und ApplicationSet und wägt Vor- und Nachteile für eine Bildungsbereitstellung ab, die mehrere Cluster und Umgebungen ansteuert."
image: "/static/blog/gitops-argocd-app-of-apps-applicationset-teaser.svg"
categories: ["technik", "architektur", "devops"]
tags: ["gitops", "argocd", "kubernetes", "app-of-apps", "applicationset", "helmfile", "architecture"]
---

# GitOps in großem Maßstab: App of Apps vs. ApplicationSet für openDesk

> **Aktueller Stand:** Eine ArgoCD-Application, ein Helmfile, 30+ Dienste, 8 Sync-Phasen.
> **Zielzustand:** Eine Multi-Cluster-, Multi-Umgebungs-GitOps-Architektur, die skaliert.

Dieser Beitrag untersucht, wo wir stehen, wohin wir wollen und die beiden wichtigsten ArgoCD-Muster — App of Apps und ApplicationSet — die uns dorthin bringen können.

## Wo Wir Heute Stehen

openDesk Edu wird derzeit mit einer **monolithischen ArgoCD-Application** bereitgestellt, die auf dem [Helmfile-Plugin](https://github.com/travisghansen/argo-cd-helmfile) basiert. Eine einzelne Application-Ressource in ArgoCD verweist auf ein Helmfile, das alle 30+ Dienste über 8 Sync-Phasen orchestriert:

| Phase | Was bereitgestellt wird |
|-------|------------------------|
| 0 | Pre-Deployment-Migrationsjobs |
| 1 | Kerndienste (Home, Zertifikate, Alarme) |
| 2 | Datenbanken, Caches, S3, Mail-Relay |
| 3 | Nubus IAM, Keycloak, Portal |
| 4–5 | Groupware, Apps (Nextcloud, Jitsi, OX, usw.) |
| 6–7 | Bootstrap-Jobs und Post-Migrationen |

Das funktioniert. Der Cluster läuft, die Dienste sind gesund und Backups werden durchgeführt. Aber während wir skalieren — mehr Umgebungen (Dev/Staging/Prod), mehr Cluster (HRZ, zukünftige Standorte) und mehr Dienste (6 fehlen noch) — werden die Grenzen einer einzelnen Application deutlich.

### Was im Großen Bricht

- **Einzelner Blast Radius:** Eine fehlerhafte Helmfile-Änderung betrifft jeden Dienst. Es gibt kein schrittweises Rollout.
- **Kein Self-Service:** Einen Dienst hinzufügen bedeutet, das zentrale Helmfile zu bearbeiten und auf die Freigabe durch die Betreiber zu warten.
- **Langsame Syncs:** Die Root-App gleicht alle 30+ Dienste auf einmal ab. Sync-Timeouts und Ressourcenkonflikte sind real.
- **Keine dienstspezifische Sync-Richtlinie:** Sie können nicht einen Dienst automatisch synchronisieren, während Sie einen anderen manuell promoten. Es ist alles oder nichts.
- **Keine Umgebungsdifferenzierung:** Umgebungsüberschreibungen leben in einer einzigen `global.yaml.gotmpl`. Sie können Bedingungen formulieren, aber die Struktur skaliert nicht auf N Umgebungen.

Die Community hat sich auf zwei Muster geeinigt, um diese Probleme zu lösen: **App of Apps** und **ApplicationSets**. Sie schließen sich nicht gegenseitig aus, sondern bedienen unterschiedliche Anforderungen.

## Muster 1: App of Apps

Das App-of-Apps-Muster verwendet eine Root-ArgoCD-Application, die ein Verzeichnis mit anderen Application-Manifesten synchronisiert. Die Root-App entdeckt untergeordnete Applications, erstellt sie und überwacht ihre Gesundheit. Das Löschen eines untergeordneten Manifests aus Git führt dazu, dass ArgoCD es entfernt.

```yaml
# Root Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-opendesk
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/opendesk-edu/gitops-config.git
    path: apps/
  destination:
    server: https://kubernetes.default.svc
  syncPolicy:
    automated:
      prune: true
```

```yaml
# apps/keycloak.yaml — untergeordnete Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: keycloak
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/opendesk-edu/gitops-config.git
    path: charts/keycloak/
  destination:
    server: https://kubernetes.default.svc
    namespace: opendesk
  syncPolicy:
    automated:
      selfHeal: true
```

### Vorteile

- **Volle Kontrolle pro App.** Jede untergeordnete Application erhält eine eigene Sync-Richtlinie, Sync-Wellen, Ignorierunterschiede und ein eigenes Projekt. Sie können Keycloak automatisch synchronisieren, während Sie Nextcloud manuell promoten.
- **Helm/Kustomize-Templating.** Das Apps-Verzeichnis kann selbst ein Helm-Chart sein, sodass Sie Application-Manifeste mit `values.yaml` templaten. Eine Werteänderung propagiert sich auf alle generierten Apps.
- **Einfaches mentales Modell.** Es sind nur Applications, die Applications verwalten. Keine neuen CRDs, keine Generatoren, keine Templating-Sprache. Jeder ArgoCD-Benutzer versteht es.
- **Abhängigkeitsreihenfolge.** Sync-Wellen funktionieren auf Application-Ebene. Sie setzen `sync-wave: 1` auf Datenbanken, `sync-wave: 5` auf Apps, die von ihnen abhängen.
- **Erprobt.** Das Muster ist seit ArgoCD v1.x im Produktionseinsatz. Die Maintainer haben ausdrücklich erklärt, dass es **nicht veraltet** ist ([Diskussion #11892](https://github.com/argoproj/argo-cd/discussions/11892)).

### Nachteile

- **Ein YAML pro App pro Umgebung.** Bei 30 Diensten × 3 Umgebungen = 90 Application-Manifeste. Selbst mit Helm-Templating ist das eine Menge zu pflegender Dateien.
- **Keine dynamische Erkennung.** Einen Dienst hinzufügen bedeutet, ein neues Application-YAML zu committen. Es gibt kein „Dieses Verzeichnis scannen und automatisch Apps erstellen".
- **Nur für Administratoren geeignet.** Das Erstellen von Applications über Projekte hinweg erfordert Admin-Rechte. Teams Self-Service zu geben bedeutet, ihnen Application-Manifeste anzuvertrauen, einschließlich sensibler Felder wie `project`, `cluster` und `namespace`.
- **Root-App kann zum Engpass werden.** Die übergeordnete Application synchronisiert alle untergeordneten. Wenn eine untergeordnete App falsch konfiguriert ist, kann die Root-App als beeinträchtigt angezeigt werden, auch wenn der Rest gesund ist.

### Wann es Glänzt

- Einzelner Cluster mit einer festen Anzahl von Diensten
- Teams, die feingranulare Kontrolle pro App benötigen
- Komplexe Abhängigkeitsketten mit strenger Reihenfolge
- Migration von einer monolithischen App — die Struktur spiegelt das wider, was bereits vorhanden ist

## Muster 2: ApplicationSet

ApplicationSets sind ArgoCDs nativer generatorbasierter Ansatz. Statt N Application-Manifeste zu schreiben, definieren Sie einen ApplicationSet mit einer **Vorlage** und einem **Generator**, der die Parameter erzeugt. Der Controller erstellt, aktualisiert und löscht Applications automatisch.

### Relevante Generatortypen für openDesk

**Git Directory Generator** — entdeckt Dienste automatisch durch Scannen von Repository-Verzeichnissen:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: opendesk-services
  namespace: argocd
spec:
  goTemplate: true
  generators:
    - git:
        repoURL: https://github.com/opendesk-edu/gitops-config.git
        revision: main
        directories:
          - path: services/*
  template:
    metadata:
      name: '{{.path.basename}}'
    spec:
      project: opendesk
      source:
        repoURL: https://github.com/opendesk-edu/gitops-config.git
        path: '{{.path.path}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{.path.basename}}'
      syncPolicy:
        automated:
          selfHeal: true
```

Neuer Dienst? Erstellen Sie ein `services/nextcloud/`-Verzeichnis mit Ihrem Kustomize-Overlay. ArgoCD erkennt es. Keine Konfigurationsänderungen, kein PR-Review für den ApplicationSet selbst.

**Matrix Generator** — kombiniert Cluster und Dienste für Multi-Umgebungs-Bereitstellungen:

```yaml
generators:
  - matrix:
      generators:
        - git:
            repoURL: https://github.com/opendesk-edu/gitops-config.git
            directories:
              - path: services/*
        - clusters:
            selector:
              matchLabels:
                env: prod
```

Dies erzeugt jede Kombination aus Dienst × Cluster. Drei Cluster × 30 Dienste = 90 Applications aus einem Manifest.

**Cluster Generator** — stellt die gleichen Dienste in jedem Cluster bereit, der auf einen Label-Selektor passt. Fügen Sie einen Cluster hinzu, labeln Sie ihn mit `env: staging`, und jeder Dienst wird automatisch bereitgestellt.

**List Generator** — explizite Kontrolle, wenn Verzeichnisstrukturen nicht ausreichen. Definieren Sie eine einfache YAML-Liste von Parametersätzen.

### Vorteile

- **Dynamische Erkennung.** Dienste erscheinen und verschwinden basierend auf der Git-Repository-Struktur. Kein manuelles Application-Management.
- **Multi-Cluster-nativ.** Ein ApplicationSet kann 10 Cluster ansteuern. Der Cluster-Generator erkennt automatisch in ArgoCD registrierte Cluster.
- **Self-Service-sicher.** Administratoren sperren sensible Felder (`project`, `cluster`, `namespace`) in der Vorlage. Entwickler kontrollieren nur, was in das Quell-Repository geht. Dies ist das offizielle, von der ArgoCD-Dokumentation empfohlene Self-Service-Muster.
- **DRY im großen Maßstab.** Eine Vorlage ersetzt 30+ Application-Manifeste. Mit Matrix-Generatoren ersetzt ein Manifest 90+.
- **Ressourcen beim Löschen erhalten.** Die Option `preserveResourcesOnDeletion` verhindert das kaskadenförmige Löschen von Live-Workloads, wenn ein ApplicationSet entfernt wird.

### Nachteile

- **Schwerer zu debuggen.** ApplicationSet-Fehler erscheinen in den Controller-Logs, nicht in der ArgoCD-Benutzeroberfläche. Wenn die Generierung stillschweigend fehlschlägt, bemerken Sie es möglicherweise erst, wenn Dienste fehlen. Wie ein Community-Mitglied anmerkte: *„Wenn nichts generiert wird, merken Sie es erst, wenn Sie in den Logs graben"* ([Diskussion #11892](https://github.com/argoproj/argo-cd/discussions/11892)).
- **Eingeschränkte Anpassung pro App.** Die Vorlage wird einheitlich auf alle generierten Applications angewendet. Keycloak mit einer anderen Sync-Richtlinie als Nextcloud? Sie benötigen separate ApplicationSets oder Selektorbasierte Workarounds.
- **Templating-Komplexität.** Go-Vorlagen mit verschachtelten Generatoren können schwer zu lesen und zu warten sein. Die Option `missingkey=error` hilft, aber das Debuggen der Vorlagen-Renderings ist eine eigene Fähigkeit.
- **Sync-Wellen gelten pro ApplicationSet, nicht pro App.** Sie können keine unterschiedlichen Sync-Wellen für verschiedene Dienste innerhalb desselben ApplicationSets festlegen, ohne sie auf mehrere ApplicationSets aufzuteilen.
- **Blast Radius.** Ein falsch konfiguriertes ApplicationSet-Template kann Dutzende oder Hunderte von Applications gleichzeitig beeinträchtigen. Gründliches CI-Linting ist unerlässlich.

### Wann es Glänzt

- Multi-Cluster-Bereitstellungen (5+ Cluster)
- Dienste, die einem konsistenten Muster folgen (gleiches Repo-Layout, gleiche Sync-Richtlinie)
- Self-Service-Workflows, bei denen Teams Dienste unabhängig hinzufügen
- Vorschau-Umgebungen pro Pull-Request (PR Generator)
- Jedes Szenario, in dem sich die Cluster- oder Dienstinventur häufig ändert

## Muster 3: Hybrid (Der Community-Konsens)

Wenn man die GitHub-Diskussionen liest und mit Teams spricht, die ArgoCD in Produktion betreiben, ist die häufigste Empfehlung **keines der reinen Muster** — es ist ein geschichteter Hybrid:

> *„Ich verwende App-of-Apps und ApplicationSet gleichzeitig: App-of-Apps für das allererste Bootstrapping, mit eigentlich zwei Ebenen von App-of-Apps, und dann AppSet für Self-Service durch die Teams."* — Community-Mitglied, Diskussion #11892

> *„Ich verwende typischerweise AppSets auf der obersten Ebene und App-of-Apps als zweite Ebene. Die oberste Ebene stellt sicher, dass alle Regionen das Produkt haben. Die zweite Ebene stellt sicher, dass das Produkt innerhalb der Region konsistent bereitgestellt wird."* — @nastacio, Diskussion #11892

Eine praktische geschichtete Architektur:

```
ApplicationSet (Cluster Generator)
  └── pro Cluster: Root Application (App of Apps)
        └── pro Dienst: Child Application
              └── Helm/Kustomize-Bereitstellung
```

Oder umgekehrt, je nachdem, wo die Dynamik benötigt wird:

```
Root Application (App of Apps)
  └── ApplicationSet (Git Directory Generator)
        └── Anwendung pro Dienst
              └── Helm/Kustomize-Bereitstellung
```

## Entscheidungsmatrix

| Faktor | App of Apps | ApplicationSet |
|--------|-------------|----------------|
| **Lernkurve** | Niedrig | Mittel |
| **Anpassung pro App** | Vollständig | Eingeschränkt (erfordert Aufteilung) |
| **Multi-Cluster** | Manuelle Duplikation | Nativ (Cluster Generator) |
| **Self-Service-Sicherheit** | Niedrig (nur Admin-Rechte) | Hoch (Vorlage sperrt Felder) |
| **Debugging** | Einfach (UI zeigt alles) | Schwer (Controller-Logs) |
| **Skalierung auf 100+ Apps** | Mühsam (Dateianzahl) | Natürlich (ein Manifest) |
| **Sync-Wellen-Unterstützung** | Pro Application | Pro ApplicationSet |
| **Dynamische Erkennung** | Nein (manuelles YAML) | Ja (Git-Verzeichnisscan) |
| **Reifegrad** | Seit ArgoCD v1.x | Seit ArgoCD v2.x |

## Unsere Empfehlung für openDesk

Für den spezifischen Kontext von openDesk Edu — 30+ Dienste, auf 1–3 Cluster ausgerichtet, mit Bedarf an Umgebungsdifferenzierung und späterem Self-Service — sehen wir **zwei natürliche Phasen**:

### Phase 1: App of Apps (jetzt)

Migration von der monolithischen Helmfile-Application zu einer App-of-Apps-Struktur. Dies ist die Migration mit dem geringsten Risiko:

- Jede Helmfile-Release eines Dienstes als separate ArgoCD-Application kapseln
- Gemeinsame Infrastruktur (Datenbanken, Caches) in einer gemeinsamen Sync-Phase gruppieren
- Die Helmfile-Orchestrierung beibehalten, aber in untergeordnete Applications zerlegen
- Kontrolle über die Sync-Reihenfolge und dienstspezifische Richtlinien behalten

### Phase 2: ApplicationSet (als Nächstes)

Sobald die App-of-Apps-Struktur läuft und stabil ist, ApplicationSets für sich wiederholende Muster einführen:

- Einen Git Directory Generator verwenden, um Dienste automatisch zu erkennen, die einem Standardlayout folgen
- Einen Matrix Generator (Git × Cluster) für Multi-Umgebungs-Promotion (Dev → Staging → Prod) verwenden
- Self-Service für bildungsspezifische Dienste an Teams über eingeschränkte ApplicationSets mit gesperrten Vorlagen auslagern

### Was Wir Nicht Tun

- **Helmfile nicht vollständig entfernen.** Das Helmfile-Plugin handhabt die Abhängigkeitsreihenfolge und das Wertetemplating bereits gut. Die Application-Ebene (App of Apps oder ApplicationSet) sollte Helmfile-Releases orchestrieren, nicht ersetzen.
- **Nicht von Tag eins an vollständig auf ApplicationSet umstellen.** Die Debugging- und Templating-Komplexität ist es für eine Bereitstellung mit einem einzelnen Cluster und einer festen Anzahl von Diensten nicht wert. ApplicationSet zahlt sich aus, wenn Sie 10+ Cluster oder 50+ Dienste erreichen.

## Referenzen

- [ArgoCD Diskussion #11892 — ApplicationSets vs App-of-apps vs Kustomize](https://github.com/argoproj/argo-cd/discussions/11892)
- [ArgoCD Dokumentation — ApplicationSet](https://argo-cd.readthedocs.io/en/stable/user-guide/application-set/)
- [ArgoCD Dokumentation — Cluster Bootstrapping](https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/cluster-bootstrapping.md)
- [ArgoCD Application Patterns: App of Apps, ApplicationSets, and Beyond — DevOpsil](https://devopsil.com/articles/2026-03-21-gitops-argocd-application-patterns)
- [ArgoCD ApplicationSet Multi-Cluster Guide — Opsio](https://opsiocloud.com/blogs/argocd-applicationset-multi-cluster/)
- [How to Implement the App-of-Apps Pattern at Scale — OneUptime](https://oneuptime.com/blog/post/2026-02-26-argocd-app-of-apps-pattern-at-scale/view)
- [One Manifest, Hundreds of Apps: How Argo CD ApplicationSets Work — Burrell Tech](https://burrell.tech/blog/argo-cd-applicationsets/)
- [Getting Started with ApplicationSets — Red Hat](https://www.redhat.com/en/blog/getting-started-with-applicationsets)
- [openDesk Edu — Aktuelle ArgoCD-Bereitstellung](https://codeberg.org/opendesk-edu/argocd-opendesk)
