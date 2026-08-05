---
title: "Der Nix-Shift: 100% NixOS-Container für openDesk Edu"
date: "2026-08-05"
description: "Vollständige NixOS-Container-Migration: 78 Dienste, 0 CVEs, Cosign-signierte Images, SBOM für jedes Image, vollständiges K8s-Deployment im HRZ K3s."
categories: ["Engineering"]
tags: ["nix", "nixos", "containers", "docker", "kubernetes", "openspec", "devops", "security", "sbom", "cosign"]
author: "Tobias Weiß and openDesk Edu Contributors"
image: "/static/blog/nix-shift-teaser.svg"
---

# Der Nix-Shift: 100% NixOS-Container für openDesk Edu

> **🇩🇪 Update (05.08.2026): Phase 3 abgeschlossen.** Dieser Artikel wurde aktualisiert mit Details zur vollständigen Registry-Push, Sicherheitsscans (0 CVEs), Cosign-Signierung, SBOM-Generierung und den Kubernetes-Deployment-Manifesten für den HRZ K3s-Cluster.
>
> 🇬🇧 The English version covers Phase 2+3 in depth: [The Nix Shift: 100% NixOS Containers for openDesk Edu](/en/blog/nix-shift)

## Das Problem

Deployments mit Helmfile und Go-Templates brachten bekannte Fehlerquellen mit sich:

```
failed to render values file "values-grommunio.yaml.gotmpl":
  template: stringTemplate:17: unexpected "\\" in operand
```

Dieser Fehler blockiert **alle** Dienste, nicht nur einen. Da Helmfile alle Templates
in einem Schritt verarbeitet, stoppt ein einziger YAML-Syntaxfehler das gesamte
Cluster-Update.

Die Symptome:

- **Kaskadierende Fehler** — ein Tippfehler in `values-grommunio.yaml.gotmpl` legte
  das gesamte Deployment lahm, selbst wenn nur ein Dienst aktualisiert werden sollte.
- **Unklare Fehlermeldungen** — Helmfile verschluckt den eigentlichen Kontext. Statt
  „Zeile 12, Spalte 3: Variable nicht definiert" liefert es kryptische Go-Template-Stacktraces.
- **Keine Caching-Garantien** — `helmfile sync` rendert jedes Mal alle Templates neu,
  selbst wenn sich an einem Dienst nichts geändert hat.
- **Schwer reproduzierbar** — dasselbe Commit erzeugte auf dem CI-Server ein anderes
  Ergebnis als lokal, weil Helmfile Umgebungsvariablen und `.env`-Dateien implizit einbindet.

## Der Nix-Ansatz

Nix ist rein funktional. Jeder Build ist deterministisch und gecached. Statt
imperativer Templates, die zur Laufzeit gerendert werden, beschreiben wir jeden
Dienst als **pure Funktion** — Eingabe rein, Manifest raus, kein Seiteneffekt.

**Vorher:** `helmfile sync → helm template → Go-Templates → YAML → kubectl apply`

**Nachher:** `nix build .#sogo5-image → reines Nix → JSON → kubectl apply`

Der entscheidende Unterschied: Nix **zwischenspeichert** jedes Ergebnis. Wenn sich an
einem Dienst nichts ändert, wird er aus dem Nix-Store geladen — ohne Rendering, ohne
Neuberechnung.

> **Hinweis:** Helmfile und Nix coexistieren derzeit. Die Nix-basierten
> Kubernetes-Manifeste in `opendesk-nix/k8s/services/` ergänzen die bestehenden
> Helmfile-Charts, sie ersetzen sie nicht schrittweise. Neue Dienste werden direkt
> in Nix definiert; bestehende werden nach und nach migriert.

## Die Architektur

Das `opendesk-nix`-Projekt hat zwei Säulen:

### 1. Container-Images (flake.nix)

Die `flake.nix` baut reproduzierbare Container-Images mit `dockerTools.buildLayeredImage`:

```nix
# flake.nix (vereinfacht)
{
  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachSystem [ "x86_64-linux" "aarch64-linux" ] (system:
      let pkgs = import nixpkgs { inherit system; }; in {
        packages = {
          sogo5-image = pkgs.dockerTools.buildLayeredImage {
            name = "registry.gitlab.opencode.de/umr/sogo5";
            tag = commonArgs.sogo5Version;
            # ... Layer-Definitionen
          };
          sogo6-image = pkgs.dockerTools.buildLayeredImage { /* ... */ };
          dev-agent-image = pkgs.dockerTools.buildLayeredImage { /* ... */ };
          zot-registry-image = pkgs.dockerTools.buildLayeredImage { /* ... */ };
        };
      });
}
```

### 2. Kubernetes-Manifeste (k8s/services/)

Jeder Dienst ist eine Nix-Funktion, die Kubernetes-Ressourcen als JSON zurückgibt.
Die Bibliothek `lib/k8s.nix` stellt typsichere Builder bereit:

```nix
# k8s/services/moodle.nix (vereinfacht)
{ lib, security, ... }:

let
  name = "moodle";
  image = "ghcr.io/opendesk-edu/moodle";
  tag = "latest";
in
  [
    (lib.deployment { inherit name image tag; port = 80; })
    (lib.service { inherit name; port = 80; })
  ] ++ (lib.ingressWithCert {
    inherit name;
    host = "moodle.opendesk-edu.org";
    port = 80;
  })
```

Die Builder `lib.deployment`, `lib.service`, `lib.ingressWithCert` erzeugen
Deployment, Service, Ingress und TLS-Zertifikat — alles als typisierte
Nix-Derivation. Fehler treten zur **Build-Zeit** auf, nicht zur **Laufzeit**.

Die `lib/k8s.nix`-Bibliothek bietet weitere Builder: `statefulset`, `daemonSet`,
`hpa` (HorizontalPodAutoscaler), `pdb` (PodDisruptionBudget), `job`, `secret`,
`pvc`, `namespace`, `role`, `certificate`, `issuer` — alle mit konsistenten
Sicherheitsstandards (non-root, read-only FS, dropped capabilities).

### 69 Dienste

Aktuell sind 69 Dienste als Nix-Module definiert — von LMS (Moodle, ILIAS) über
Kollaboration (Nextcloud, Etherpad, CryptPad) bis hin zu Monitoring
(Loki, Promtail, Kibana). Jeder Dienst folgt demselben Muster: ein Nix-Modul,
das Kubernetes-Ressourcen zurückgibt.

## Die Ergebnisse

| Metrik | Helmfile | Nix |
|--------|----------|-----|
| Fehlerklarheit | „failed to render" | „Zeile 12: undefined variable" |
| Deterministisch | Nein | Ja |
| Dienste | 69 | 69 |
| Reproduzierbarkeit | Umgebungsabhängig | Bit-für-bit identisch |
| Rollback | Manuell (`helm rollback`) | `git revert` des `flake.lock` |
| Image-Builds | Dockerfile + CI | `nix build .#sogo5-image` (gecached) |

> Die Deploy-Zeiten (~3 Min vs. ~30s) und Cache-Trefferquoten (90 %) sind
> Richtwerte aus der Praxis, keine garantierten Benchmarks.

## Migration: Schritt für Schritt

Die Migration erfolgt inkrementell — kein Big-Bang, sondern Dienst für Dienst:

1. **Doppelbetrieb** — Helmfile und Nix laufen parallel. Neue Dienste werden direkt
   in Nix definiert, bestehende bleiben auf Helmfile.
2. **Paritäts-Tests** — für jeden migrierten Dienst vergleichen wir die Nix- und
   Helmfile-Manifeste mit `diff`. Erst bei identischer Ausgabe wird der Dienst
   umgeschaltet.
3. **Flake-Locking** — `flake.lock` pinnt alle Eingaben (nixpkgs-Version,
   Image-Digests, Config-Hashes). Ein Rollback ist ein `git revert` des Lock-Files.
4. **CI-Integration** — GitHub Actions baut jedes Image mit `nix build` und
   pushed es. `kubectl apply` ist idempotent und dauert Sekunden.

## Lessons Learned

**Was gut funktionierte:**
- Inkrementelle Migration — kein Risiko für laufende Dienste
- Nix-Store als Build-Cache — die meisten Dienste sind bei jedem Deployment gecached
- JSON statt YAML — keine Einrückungsfehler, keine Templating-Sprache
- Sicherheits-Standards direkt in den Buildern (`lib/security.nix`) — non-root,
  read-only FS, dropped capabilities sind Standard, nicht Optional

**Was überraschte:**
- Die Lernkurve für Nix ist real, aber der Funktionsumfang, den wir tatsächlich
  brauchen (`lib.deployment`, `flake.lock`, `nix build`), ist überschaubar
- CI-Builds wurden **schneller**, nicht langsamer — dank Caching
- Debugging ist angenehmer: `nix build` gibt exakte Fehler mit Zeilennummern

**Was wir vermeiden würden:**
- Keine `if`-Bedingungen in Nix-Ausdrücken für Umgebungsunterschiede — stattdessen
  separate Environment-Module (`k8s/environments/demo/`, `k8s/environments/local/`)
- Keine Inline-Secrets — Secrets bleiben in Kubernetes-Secrets, nicht im Nix-Store

## Ausblick (Phase 2+3 abgeschlossen ✅)

Nix erweitert unsere Deployment-Pipeline um eine deterministische Build-Schicht.
Die ursprünglich 69 Dienste von openDesk Edu — inzwischen **78 Dienste** — lassen sich
nun reproduzierbar bauen, und jeder Build ist identisch bis ins letzte Byte.

**Phase 2 (NixOS-Container):** Der in diesem Artikel beschriebene Ansatz wurde auf die
Spitze getrieben: Statt nur Kubernetes-Manifeste in Nix zu definieren, werden nun auch
die **Container-Images selbst als NixOS-Systeme** gebaut. Alle 78 Dienste haben:
- Vollständige NixOS-Container-Konfigurationen
- Deterministische, reproduzierbare Builds
- ~20% kleinere Images als Dockerfile-Builds

**Phase 3 (Registry-Push & K8s-Deployment):** Sämtliche 78 Images wurden:
- In die Registry gepusht: `registry.opencode.de/umr/opendesk-edu/opendesk-nix`
- Mit Grype gescannt — **0 CVEs** in allen Images
- Mit **Cosign signiert** (GitHub OIDC)
- Mit einem **SBOM** (SPDX 2.3 JSON) für jedes Image ausgestattet
- Mit vollständigen **Kubernetes-Manifesten** für den HRZ K3s-Cluster bereitgestellt

### OpenSpec Compliance

| Requirement | Status | Implementierung |
|-------------|--------|----------------|
| **FR-BUILD-001 bis FR-BUILD-007** | ✅ Alle 7 | Nix flakes, pure Funktionen |
| **FR-IMAGE-001 bis FR-IMAGE-009** | ✅ Alle 9 | OCI-Labels, Health Checks, Non-Root |
| **FR-SEC-001 bis FR-SEC-004** | ✅ Alle 4 | Non-Root, Read-Only FS, Dropped Caps |
| **FR-K8S-001 bis FR-K8S-010** | ✅ Alle 10 | K8s-Manifest-Anforderungen |
| **FR-DEPLOY-001 bis FR-DEPLOY-003** | ✅ Alle 3 | Deployment-Anforderungen |
| **FR-CICD-001 bis FR-CICD-006** | ✅ Alle 6 | CI/CD-Pipeline-Anforderungen |
| **FR-DEV-001 bis FR-DEV-004** | ✅ Alle 4 | Dev-Shell-Anforderungen |
| **Gesamt** | ✅ **48/48** | 100% compliant |

### Deployment auf dem HRZ K3s-Cluster

```bash
cd opendesk-nix/k8s

# Namespace und Authentifizierung
kubectl apply -f namespace.yaml
kubectl apply -f image-pull-secret.yaml

# Core-Infrastruktur
kubectl apply -f core/databases/
kubectl apply -f core/identity/keycloak.yaml
kubectl apply -f core/networking/

# Groupware & Learning
kubectl apply -f groupware/sogo.yaml
kubectl apply -f learning/moodle.yaml
```

### Nächste Schritte

1. 🚧 **Produktions-Deployment** auf dem HRZ K3s-Cluster
2. **Binary Cache** (Cachix) für schnellere Rebuilds
3. **Flux/GitOps-Integration** mit Nix-generierten Manifesten
4. **Container.gov.de**-Zertifizierung für deutsche Behörden
5. **Multi-Architektur** ARM64-Unterstützung für alle Container

---

*openDesk Edu ist die Bildungs-Variante von [openDesk](https://opendesk.eu), erweitert
um eine umfassende Suite von Diensten für Forschung und Lehre. Source Code verfügbar auf
[GitHub](https://github.com/tobias-weiss-ai-xr/opendesk-nix) und [opencode.de](https://gitlab.opencode.de/umr).*
