---
title: "Der Nix-Shift: Warum wir Helmfile durch pure Funktionen ersetzt haben"
date: "2026-07-29"
description: "Wie wir Helmfile durch Nix ersetzt haben — für deterministische, gecachte und komponierbare Kubernetes-Deployments mit 28 Diensten."
categories: ["Engineering"]
tags: ["nix", "kubernetes", "helmfile", "devops"]
image: "/static/blog/nix-shift-teaser.svg"
---

# Der Nix-Shift: Warum wir Helmfile durch pure Funktionen ersetzt haben

## Das Problem

Wir betrieben openDesk Edu — 28 Dienste auf 9 K3s-Knoten — mit Helmfile und Go-Templates. Jedes Deployment kam mit vertrauter Angst:

```
failed to render values file "values-grommunio.yaml.gotmpl":
  template: stringTemplate:17: unexpected "\\" in operand
```

Dieser Fehler blockiert **alle** 28 Dienste, nicht nur einen. Da Helmfile alle Templates in einem Schritt verarbeitet, stoppt ein einziger YAML-Syntaxfehler das gesamte Cluster-Update.

Die Symptome waren immer die gleichen:

- **Kaskadierende Fehler** — ein Tippfehler in `values-grommunio.yaml.gotmpl` legte das gesamte Deployment lahm, selbst wenn nur Moodle aktualisiert werden sollte.
- **Unklare Fehlermeldungen** — Helmfile verschluckt den eigentlichen Kontext. Statt „Zeile 12, Spalte 3: Variable nicht definiert" erhielten wir kryptische Go-Template-Stacktraces.
- **Keine Caching-Garantien** — `helmfile sync` rendert jedes Mal alle Templates neu, selbst wenn sich an einem Dienst nichts geändert hat. Bei 28 Diensten bedeutet das ~3 Minuten reine Render-Zeit.
- **Schwer reproduzierbar** — dasselbe Commit erzeugte auf dem CI-Server ein anderes Ergebnis als lokal, weil Helmfile Umgebungsvariablen und `.env`-Dateien implizit einbindet.

## Warum Nix?

Nix ist rein funktional. Jeder Build ist deterministisch und gecached. Statt imperativer Templates, die zur Laufzeit gerendert werden, beschreiben wir jeden Dienst als **pure Funktion** — Eingabe rein, Manifest raus, kein Seiteneffekt.

**Vorher:** `helmfile sync → helm template → Go-Templates → YAML → kubectl apply`
**Nachher:** `nix build .#dienstname → reines Nix → JSON → kubectl apply`

Der entscheidende Unterschied: Nix **zwischenspeichert** jedes Ergebnis. Wenn sich an einem Dienst nichts ändert, wird er in ~2 Sekunden aus dem Nix-Store geladen — ohne Rendering, ohne Neuberechnung.

## Die Architektur

Jeder Dienst ist eine Nix-Funktion, die ein Kubernetes-Manifest (als JSON) zurückgibt:

```nix
# flake.nix (vereinfacht)
{
  outputs = { self, nixpkgs, ... }: {
    apps.moodle = mkK8sApp {
      name = "moodle";
      image = "ghcr.io/opendesk-edu/moodle-shib:v1.4.0";
      port = 8080;
      replicas = 2;
      env = {
        MOODLE_DB_HOST = "mariadb";
        MOODLE_DB_NAME = "moodle";
      };
      ingress = {
        host = "moodle.opendesk-edu.org";
        tls = true;
      };
    };

    apps.ilias = mkK8sApp {
      name = "ilias";
      image = "ghcr.io/opendesk-edu/ilias-shibboleth:9-php8.2-apache";
      # ...
    };

    # 26 weitere Dienste ...
  };
}
```

Die Hilfsfunktion `mkK8sApp` erzeugt ein Deployment, einen Service, einen Ingress und optionale ConfigMaps — alles als typisierte Nix-Derivation. Fehler treten zur **Build-Zeit** auf, nicht zur **Laufzeit**.

## Die Ergebnisse

| Metrik | Helmfile | Nix |
|--------|----------|-----|
| Volles Deployment | ~3 Min | ~30s (erstes) / ~2s (gecached) |
| Fehlerklarheit | „failed to render" | „Zeile 12: undefined variable" |
| Deterministisch | Nein | Ja |
| Dienste | 28 | 28 |
| Zeilen pro Dienst | ~80 | ~5 |
| Reproduzierbarkeit | Umgebungsabhängig | Bit-für-bit identisch |
| Rollback | Manuell (helm rollback) | `nix flake lock --revision` |

## Migration: Schritt für Schritt

Die Migration erfolgte inkrementell — kein Big-Bang, sondern Dienst für Dienst:

1. **Doppelbetrieb** — zunächst liefen Helmfile und Nix parallel. Neue Dienste wurden direkt in Nix definiert, bestehende blieben auf Helmfile.
2. **Paritäts-Tests** — für jeden migrierten Dienst verglichen wir die Nix- und Helmfile-Manifeste mit `diff`. Erst bei identischer Ausgabe wurde der Dienst umgeschaltet.
3. **Flake-Locking** — `flake.lock` pinnt alle Eingaben (nixpkgs-Version, Image-Digests, Config-Hashes). Ein Rollback ist ein `git revert` des Lock-Files.
4. **CI-Integration** — GitHub Actions baut jeden Dienst mit `nix build` und pushed die JSON-Manifeste. `kubectl apply` ist idempotent und dauert Sekunden.

## Lessons Learned

**Was gut funktionierte:**
- Inkrementelle Migration — kein Risiko für laufende Dienste
- Nix-Store als Build-Cache — 90 % der Dienste sind bei jedem Deployment gecached
- JSON statt YAML — keine Einrückungsfehler, keine Templating-Sprache

**Was überraschte:**
- Die Lernkurve für Nix ist real, aber der Funktionsumfang, den wir tatsächlich brauchen (`mkK8sApp`, `flake.lock`, `nix build`), ist überschaubar
- CI-Builds wurden **schneller**, nicht langsamer — dank Caching
- Debugging ist angenehmer: `nix build` gibt exakte Fehler mit Zeilennummern, Helmfile gibt Go-Stacktraces

**Was wir vermeiden würden:**
- Keine `if`-Bedingungen in Nix-Ausdrücken für Umgebungsunterschiede — stattdessen separate Flakes pro Umgebung (`flake.prod.nix`, `flake.staging.nix`)
- Keine Inline-Secrets — Secrets bleiben in Kubernetes-Secrets, nicht im Nix-Store

## Ausblick

Nix hat unsere Deployment-Pipeline von einer fehleranfälligen Template-Kette in eine deterministische Build-Pipeline verwandelt. Die 28 Dienste von openDesk Edu lassen sich nun in Sekunden statt Minuten ausrollen — und jeder Build ist reproduzierbar bis ins letzte Byte.

Der nächste Schritt: **NixOS als Basis-Image** für die Dienste selbst, nicht nur für die Manifeste. Dann ist nicht nur das Deployment deterministisch, sondern auch die Laufzeitumgebung.

---

*openDesk Edu ist die Bildungs-Variante von [openDesk](https://opendesk.eu), erweitert um 25 Dienste für Forschung und Lehre. Charts und Community-Plattform finden sich auf [opencode.de](https://opencode.de).*
