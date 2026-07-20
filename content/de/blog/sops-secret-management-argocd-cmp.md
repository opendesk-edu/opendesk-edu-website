---
title: "GitOps-natives Secret-Management mit SOPS und ArgoCD-CMP-Sidecar"
date: "2026-07-10"
description: "Wie openDesk Edu 126 Secrets in Git mit SOPS und age-Verschlüsselung verschlüsselt und sie zur Bereitstellungszeit über einen ArgoCD-Config-Management-Plugin-Sidecar entschlüsselt — kein Vault, kein External Secrets Operator, keine proprietäre Infrastruktur erforderlich."
categories: ["technik", "sicherheit", "devops"]
tags: ["sops", "secret-management", "argocd", "gitops", "kubernetes", "sicherheit", "age-verschlüsselung", "helmfile"]
image: "/static/blog/sops-secret-management-argocd-cmp-teaser.svg"
---

# GitOps-natives Secret-Management mit SOPS und ArgoCD-CMP-Sidecar

> **Die Herausforderung:** Wie verwalten Sie Datenbankpasswörter, API-Tokens und OIDC-Client-Secrets in einem GitOps-Workflow, in dem *alles* — einschließlich der Bereitstellungskonfiguration — in einem öffentlichen Git-Repository lebt?
>
> **Die Antwort:** Secrets mit SOPS und age-Keys verschlüsseln, als `.enc.yaml`-Dateien neben Ihren Klartextwerten committen und zur Bereitstellungszeit mit einem ArgoCD-Config-Management-Plugin-Sidecar entschlüsseln. Kein Vault-Cluster. Kein External Secrets Operator. Keine proprietäre Infrastruktur — nur `sops`, `age` und ein 10-zeiliges Shell-Skript.

## Das Problem: Secrets in GitOps

Bei openDesk Edu betreiben wir 25+ integrierte Dienste über mehrere Kubernetes-Cluster mit einem GitOps-Workflow, der ArgoCD und Helmfile verwendet. Jede Konfiguration — Helm-Werte, Umgebungsüberschreibungen, Dienstdefinitionen — lebt in einem Git-Repository und wird automatisch mit dem Cluster synchronisiert.

Das ist großartig für alles *außer Secrets*.

Eine Standardbereitstellung von openDesk Edu erfordert ~126 verschiedene Secret-Werte:

- **P0 (Kritisch):** Keycloak-Admin-Anmeldedaten, Datenbank-Root-Passwörter, Mail-Relay-Authentifizierung
- **P1 (Hoch):** OIDC-Client-Secrets, LDAP-Bind-Anmeldedaten, SMTP-Passwörter
- **P2 (Mittel):** Redis-Authentifizierungstokens, MariaDB-Replica-Passwörter
- **P3 (Niedrig):** Ceph-Speicherschlüssel, Dienst-API-Tokens

Mit GitOps können Sie nicht einfach `kubectl create secret` ausführen — das verletzt das Prinzip von Git als einziger Quelle der Wahrheit. Aber Sie können auch keine Klartext-Secrets in ein Git-Repository committen.

Das Open-Source-Ökosystem bietet mehrere Lösungen. Hier ist, warum wir unseren Ansatz gewählt haben.

## Warum SOPS (+ age) gegenüber den Alternativen

### Abgelehnte Option: Sealed Secrets

[Bitnami Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) verschlüsselt Secrets mit einem cluster-lokalen Schlüssel. Das Problem: Die SealedSecret-CRD ist cluster-weit gültig. Wenn Ihr Cluster ausfällt, verlieren Sie Ihren Versiegelungsschlüssel, es sei denn, Sie haben ihn separat gesichert. Für eine Multi-Cluster-Bereitstellung (Dev, Staging, Prod) bräuchten Sie separate versiegelte Secrets pro Cluster, was doppelte Arbeit und Driftrisiko verursacht.

### Abgelehnte Option: External Secrets Operator

[External Secrets Operator](https://external-secrets.io/) zieht Secrets aus einem externen Tresor (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault). Das ist ein großartiges Muster für Cloud-native Bereitstellungen, führt aber eine externe Abhängigkeit und eine zweite Quelle der Wahrheit ein. Für eine lokale Bereitstellung an deutschen Universitäten, bei der Sie Infrastrukturabhängigkeiten minimieren möchten, fühlte sich das Hinzufügen eines HashiCorp-Vault-Clusters nur zur Verwaltung von Secrets an, als würde man ein Problem durch ein anderes ersetzen.

### Abgelehnte Option: Helm Secrets / Helm S3

Diese erfordern Entschlüsselungswerkzeuge auf jedem Entwicklerrechner und integrieren sich nicht sauber in ArgoCDs deklaratives Synchronisationsmodell.

### Gewählt: SOPS mit age und ArgoCD-CMP-Sidecar

[SOPS (Secrets OPerationS)](https://github.com/getsops/sops) ist ein ausgereiftes, kampferprobtes Werkzeug zur Verschlüsselung einzelner Werte oder ganzer Dateien. Wir haben es gewählt, weil:

- **Zustandslose Verschlüsselung** — Entschlüsselung erfordert nur den age-privaten Schlüssel, keinen laufenden Dienst
- **Git-nativ** — verschlüsselte Dateien liegen neben ihren Klartext-Gegenstücken im Repository
- **ArgoCD-nativ** — das Config-Management-Plugin-Sidecar-Muster integriert sich nahtlos
- **Keine Cluster-Abhängigkeit** — der Entschlüsselungsschlüssel ist eine einzelne Datei, unabhängig von jedem Cluster gesichert
- **Prüfpfad** — jede Secret-Änderung ist ein Git-Commit mit Autor, Zeitstempel und Diff

## Die Architektur

Unsere Secret-Management-Architektur besteht aus vier Komponenten:

```
┌─────────────────────────────────────────────────────────┐
│                    Git-Repository                         │
│                                                          │
│  .sops.yaml          helmfile/secrets/                   │
│  ──────────          ───────────────────                 │
│  creation_rules:     secrets.enc.yaml (P0 kritisch)      │
│    age: <public_key> secrets.prod.enc.yaml (P1-P3)       │
│                                                          │
└──────────────────────┬──────────────────────────────────┘
                        │ git push
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    ArgoCD                                 │
│                                                          │
│  ┌─────────────────┐    ┌────────────────────────────┐  │
│  │  repo-server     │    │  CMP-Sidecar (sops)        │  │
│  │  (Hauptprozess)  │◄───│                            │  │
│  │                  │    │  sops --decrypt *.enc.yaml │  │
│  │  Empfängt        │    │  age-key: /sops-age-key/   │  │
│  │  entschlüsseltes │    └────────────────────────────┘  │
│  │  YAML            │                                     │
│  └─────────────────┘                                     │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
                     ┌─────────────────────┐
                     │  Kubernetes-Cluster  │
                     │  Secrets + ConfigMaps│
                     └─────────────────────┘
```

### 1. SOPS-Konfiguration (`.sops.yaml`)

Das Repository-Root enthält eine `.sops.yaml`-Datei, die die Verschlüsselungsregeln definiert:

```yaml
creation_rules:
  - path_regex: \.enc\.yaml$
    age: <age-public-key>
```

Dies teilt SOPS mit: *Jede Datei, die auf `.enc.yaml` endet, sollte mit diesem öffentlichen age-Schlüssel verschlüsselt werden.* Das Besondere ist, dass SOPS einen eindeutigen Datenverschlüsselungsschlüssel pro Datei generiert, der dann mit dem öffentlichen age-Schlüssel umhüllt wird. Das bedeutet, Sie können den age-Schlüssel rotieren, ohne jede Datei neu zu verschlüsseln — wickeln Sie einfach die Datenverschlüsselungsschlüssel neu ein.

### 2. Verschlüsselte Secret-Dateien

Wir organisieren Secrets nach Umgebung und Kritikalität:

| Datei | Inhalt | Priorität |
|------|----------|----------|
| `helmfile/environments/default/secrets.enc.yaml` | P0-kritische Secrets (97 Werte) | 🔴 Kritisch |
| `helmfile/environments/default/secrets.prod.enc.yaml` | P1-P3-Secrets pro Umgebung (29 Werte) | 🟠 Hoch |

Die `.enc.yaml`-Erweiterung ist unser Signal sowohl an SOPS als auch an ArgoCD, dass die Datei entschlüsselt werden muss. Wenn Sie eine dieser Dateien öffnen, sehen Sie:

```yaml
keycloak_admin_password: ENC[AES256_GCM,data:...,iv:...,tag:...,type:str]
mariadb_root_password: ENC[AES256_GCM,data:...,iv:...,tag:...,type:str]
sops:
    kms: null
    gcp_kms: null
    azure_kv: null
    hc_vault: null
    age:
        - recipient: age1...
          enc: |
            ---
            ...
    lastmodified: '2026-07-09T12:00:00Z'
```

Jeder Wert wird einzeln mit AES-256-GCM verschlüsselt, und die Datei trägt Metadaten über die Verschlüsselungsschlüssel, Version und den letzten Änderungszeitpunkt.

### 3. ArgoCD-CMP-Sidecar

Der zentrale Integrationspunkt ist der ArgoCD-Config-Management-Plugin-(CMP)-Sidecar. Dieser Sidecar läuft neben dem Haupt-ArgoCD-repo-server-Container und fängt `.enc.yaml`-Dateien ab, bevor sie die Ressourcenerkennung erreichen.

**Die Sidecar-Konfiguration ist ein einzelnes ConfigMap:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmp-sops-plugin
  namespace: argocd
data:
  plugin.yaml: |
    apiVersion: argoproj.io/v1alpha1
    kind: ConfigManagementPlugin
    metadata:
      name: sops
    spec:
      sidecar: true
      generate:
        command:
          - /bin/sh
          - -c
          - |
            for f in $(find . -name '*.enc.yaml' -type f); do
              /custom-tools/sops --decrypt \
                --input-type yaml --output-type yaml "$f" 2>/dev/null
            done
      discover:
        find:
          glob: "**/*.enc.yaml"
```

Wenn ArgoCD eine Datei findet, die auf `*.enc.yaml` passt, ruft es den generate-Befehl des Sidecars auf, der `sops --decrypt` auf jede verschlüsselte Datei anwendet. Das entschlüsselte YAML wird dann an ArgoCDs Standard-Ressourcenerkennung übergeben.

**Der Sidecar benötigt zwei Dinge zum Funktionieren:**

1. Die `sops`-Binärdatei im Sidecar-Container
2. Den privaten age-Schlüssel, der als Kubernetes-Secret eingebunden ist

Beide werden über einen strategischen Merge-Patch auf das ArgoCD-repo-server-Deployment injiziert:

```yaml
# Strategic merge patch (gekürzt)
spec:
  template:
    spec:
      initContainers:
        - name: install-sops
          image: alpine:3.20
          command: ["/bin/sh", "-c"]
          args:
            - |
              wget -q https://github.com/getsops/sops/releases/...
              mv sops /custom-tools/sops
          volumeMounts:
            - name: extra-tools
              mountPath: /custom-tools
      containers:
        - name: sops
          image: alpine:3.20
          command: [/var/run/argocd/argocd-cmp-server]
          volumeMounts:
            - name: extra-tools
              mountPath: /custom-tools
            - name: argocd-sops-age-key
              mountPath: /sops-age-key
              readOnly: true
      volumes:
        - name: extra-tools
          emptyDir: {}
        - name: argocd-sops-age-key
          secret:
            secretName: argocd-sops-age-key
```

### 4. ArgoCD-Anwendungen annotieren

Jede ArgoCD-Anwendung, die SOPS-verschlüsselte Dateien verwendet, muss das Plugin deklarieren:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: opendesk-edu
spec:
  source:
    repoURL: https://github.com/opendesk-edu/opendesk-edu.git
    path: .
  plugin:
    name: sops
```

Das war's. Die Anwendung entschlüsselt Secrets jetzt transparent während der Synchronisation.

## Ende-zu-Ende verifiziert

Der CMP-Sidecar wurde im Juli 2026 auf dem Produktions-HRZ-Cluster (K3s v1.32.3, ArgoCD v3.0.12) bereitgestellt und getestet. Wir haben verifiziert:

1. **Verschlüsseltes Secret committed** — Ein `test-secret.enc.yaml` wurde in das Repository committed
2. **ArgoCD erkannte die Änderung** — Der Synchronisationsstatus der Anwendung zeigte einen Diff
3. **Sidecar entschlüsselte das Secret** — `kubectl -n argocd logs deployment/argocd-repo-server sops` bestätigte die Entschlüsselung
4. **Ressource wurde angewendet** — Das Klartext-Secret wurde im Ziel-Namespace erstellt
5. **Kein Klartext ausgetreten** — Verifiziert, dass die verschlüsselte Datei in Git verschlüsselt blieb

Die gesamte Einrichtung — von der Repository-Konfiguration bis zur funktionierenden Bereitstellung — dauerte etwa 4 Stunden, einschließlich der Fehlersuche bei den Sidecar-Volume-Mounts.

## Was das für Betreiber bedeutet

### Täglicher Betrieb

Für die meisten Betreiber ist die SOPS-Integration unsichtbar. Sie:

1. Bearbeiten Helm-Werte in den üblichen `.yaml`- und `.gotmpl`-Dateien
2. Committen und pushen nach Git
3. ArgoCD synchronisiert automatisch

Der einzige Unterschied ist, dass Secrets als verschlüsselte Dateien gespeichert werden. Wenn ein Betreiber ein Secret hinzufügen oder aktualisieren muss:

```bash
# Secret-Datei entschlüsseln
sops helmfile/environments/default/secrets.enc.yaml

# Datei bearbeiten (öffnet in $EDITOR)
# Beim Speichern verschlüsselt SOPS automatisch neu

# Committen
git add helmfile/environments/default/secrets.enc.yaml
git commit -m "feat(secrets): update Keycloak admin password"
git push
```

Die `sops`-CLI übernimmt Entschlüsselung und Neuverschlüsselung transparent. Betreiber sehen oder handhaben niemals Klartext-Secrets, es sei denn, sie haben den privaten age-Schlüssel.

### Secret-Rotation

Das Rotieren eines Secrets ist so einfach wie:

```bash
sops helmfile/environments/default/secrets.enc.yaml
# Wert direkt bearbeiten
# Speichern → automatisch verschlüsselt

# Oder alle Datenverschlüsselungsschlüssel rotieren:
sops --rotate helmfile/environments/default/secrets.enc.yaml
```

### Notfallwiederherstellung

Die wichtigste betriebliche Sorge: **Sichern Sie den privaten age-Schlüssel.** Diese einzelne Datei (`~/.age/opendesk-edu.txt`) kontrolliert den Zugriff auf alle verschlüsselten Secrets. Ohne sie können Sie keine `.enc.yaml`-Datei entschlüsseln.

Unser Leitfaden zur Notfallwiederherstellung enthält jetzt die SOPS-Schlüsselwiederherstellung als ersten Schritt in der Wiederherstellungsreihenfolge (P0-Priorität, vor Speicher und Datenbanken).

## Die 126 verschlüsselten Secrets: In Zahlen

| Priorität | Anzahl | Kategorien |
|----------|-------|------------|
| P0 (Kritisch) | 97 | Keycloak-Admin, DB-Roots, Mail-Relay-Auth, LDAP-Admin |
| P1 (Hoch) | 16 | OIDC-Client-Secrets, SMTP-Anmeldedaten, API-Tokens |
| P2 (Mittel) | 8 | Redis-Auth, Replica-DB-Passwörter, Cache-Schlüssel |
| P3 (Niedrig) | 5 | Ceph-Schlüssel, Dienst-Tokens, Überwachungs-Anmeldedaten |
| **Gesamt** | **126** | |

Jeder Wert wird einzeln mit AES-256-GCM verschlüsselt. Keine zwei Werte teilen sich eine Nonce. Der dateiweite Datenverschlüsselungsschlüssel ist pro Datei eindeutig und mit dem öffentlichen age-Schlüssel umhüllt.

## Warum das für GitOps wichtig ist

Dieser Ansatz bewahrt die Kernprinzipien von GitOps:

- **Git ist die einzige Quelle der Wahrheit** — jeder Secret-Wert hat einen Git-Commit
- **Deklarative Bereitstellung** — ArgoCD erledigt alles autonom
- **Keine Infrastrukturabhängigkeiten** — kein Vault, kein Cloud-Anbieter, kein externer Dienst
- **Prüfpfad** — `git log` zeigt genau, wer welches Secret wann geändert hat
- **Reproduzierbar** — ein neuer Cluster kann allein aus Git bootstrappt werden (mit dem age-Schlüssel)

## Lessons Learned

1. **Volume-Mounts sind der kniffligste Teil** — Der CMP-Sidecar benötigt Zugriff auf denselben Repository-Checkout wie der Haupt-repo-server. Der gemeinsame `tmp`-Volume-Mount ist essentiell.

2. **Proxy-Konfiguration ist wichtig** — Auf dem HRZ-Cluster benötigte der `install-sops`-InitContainer die Umgebungsvariablen `HTTP_PROXY` und `HTTPS_PROXY`, um die sops-Binärdatei herunterzuladen.

3. **Plugin-Caching kann veraltete Secrets verursachen** — Wenn eine vorherige Synchronisation in Redis gecacht wurde, führt ArgoCD das Plugin nach einer Secret-Aktualisierung möglicherweise nicht erneut aus. Das Erzwingen eines Cache-Leers (`redis-cli FLUSHALL`) oder das Erhöhen des Commit-Hashs behebt dies.

4. **Zuerst mit einem Dummy-Secret testen** — Wir haben ein harmloses `test-secret.enc.yaml` committed und Ende-zu-Ende verifiziert, bevor wir echte Produktions-Anmeldedaten verschlüsselt haben.

5. **Den age-Schlüssel an mehreren Orten sichern** — Diese einzelne Datei ist die Vertrauenswurzel für alle Secrets. Ihr Verlust bedeutet den Verlust des Zugriffs auf jeden verschlüsselten Wert.

## Was als Nächstes kommt

Die SOPS-Integration ist grundlegend für unser v1.1-Release. Nachdem die Secret-Verwaltung gelöst ist, können wir jetzt:

- **Secret-Anforderungen für jeden Dienst definieren** — jedes Helm-Chart deklariert genau, welche Secrets es benötigt
- **Secret-Abdeckung prüfen** — automatisierte Checks stellen sicher, dass kein Dienst ein undefiniertes Secret referenziert
- **Secrets planmäßig rotieren** — unter Verwendung der SOPS-Metadaten (Verschlüsselungszeitstempel) zur Verfolgung von Rotationsfenstern
- **Auf CI/CD-Pipelines ausweiten** — GitLab-CI-Jobs können Secrets für Integrationstests entschlüsseln

Der vollständige Integrationsleitfaden ist in unserem Repository unter [`docs/developer/sops-argocd-integration.md`](https://github.com/opendesk-edu/opendesk-edu/blob/main/docs/developer/sops-argocd-integration.md) verfügbar, und die verschlüsselten Secrets befinden sich in `helmfile/environments/*/secrets*.enc.yaml`.

---

*SOPS-basiertes Secret-Management ist Teil des openDesk-Edu-v1.1-Releases. Für den vollständigen v1.1-Fahrplan siehe unseren [Release-Plan](https://github.com/opendesk-edu/opendesk-edu/blob/main/docs/v1.1-release-checklist.md).*

**openDesk Edu: Souveräne, integrierte, produktionsreife Open-Source-Bildungstechnologie.**
