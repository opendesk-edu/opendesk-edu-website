---
title: "Architektur-Deep-Dive: So funktioniert openDesk Edu"
date: "2026-04-17"
description: "Ein technischer Deep-Dive in die openDesk Edu-Architektur — Kubernetes-Orchestrierung, SAML-Föderation, Keycloak-SSO und modulares Service-Design."
categories: ["technik", "architektur"]
tags: ["architektur", "kubernetes", "saml", "keycloak", "deep-dive"]
---

# Architektur-Deep-Dive: So funktioniert openDesk Edu

Dieser Beitrag wirft einen detaillierten Blick auf die technische Architektur hinter openDesk Edu. Wenn Sie die Plattform für Ihre Einrichtung evaluieren oder einen Beitrag leisten möchten, erhalten Sie hier einen klaren Überblick, wie die einzelnen Komponenten zusammenwirken.

## Das Fundament: openDesk CE

openDesk Edu ist eine Obermenge von openDesk Community Edition v1.13.x. Es erbt die Kern-Arbeitsplatzdienste, die openDesk CE bereitstellt: Nextcloud für Dateifreigabe, Jitsi Meet für Videoanrufe, eine Wahl zwischen Open-Xchange, SOGo oder Grommunio für Groupware, Collabora Online für Dokumentbearbeitung und Keycloak für Identitätsmanagement. Diese Dienste sind in Produktionsumgebungen bei Behörden und Unternehmen im Einsatz erprobt.

Auf diesem Fundament fügt openDesk Edu 15 bildungsspezifische Dienste hinzu: ILIAS, Moodle, BigBlueButton, OpenCloud, Etherpad, CryptPad, BookStack, Planka, Zammad, LimeSurvey, LTB SSP, Draw.io, Excalidraw und TYPO3. Alle 25 Dienste teilen sich die gleiche Authentifizierungs-, Netzwerk- und Speicherinfrastruktur.

## Kubernetes-native Bereitstellung

Alles in openDesk Edu läuft auf Kubernetes. Jeder Dienst ist als Helm-Chart verpackt, und der gesamte Stack wird über helmfile orchestriert. Ein einzelner `helmfile apply`-Befehl rendert die Charts mit Ihrer Konfiguration und stellt sie auf Ihrem Cluster bereit.

Das Konfigurationssystem verwendet `global.yaml.gotmpl`, eine Go-Template-Datei, die alle Bereitstellungsparameter zentralisiert. Sie setzen Ihre Domain, E-Mail-Einstellungen, Storage-Klassen und Feature-Flags an einem Ort, und die Werte werden an jeden Chart weitergegeben. So konfigurieren Sie die gesamte Plattform, ohne individuelle Chart-Werte-Dateien bearbeiten zu müssen.

Helmfile übernimmt auch die Abhängigkeitsreihenfolge. Dienste, die von Keycloak oder dem Ingress-Controller abhängen, werden erst bereitgestellt, wenn ihre Abhängigkeiten bereit sind. Wenn Sie nur eine Teilmenge der Dienste aktivieren, überspringt helmfile die deaktivierten und stellt nur das bereit, was Sie benötigen.

## Einheitliche Authentifizierung

Keycloak steht im Zentrum der Authentifizierungsschicht. Jeder Dienst in openDesk Edu delegiert die Authentifizierung an Keycloak, sei es über OpenID Connect, SAML 2.0 oder dienstspezifische Protokolle. Benutzer melden sich einmal am Nubus-Portal an und können zu jeder Anwendung navigieren, ohne erneut nach Anmeldedaten gefragt zu werden.

Nubus fungiert sowohl als Benutzerportal als auch als Identity-and-Access-Management-Schicht (IAM). Es bietet einen Startbildschirm für alle aktivierten Dienste, zeigt Benutzerprofilinformationen an und verwaltet Sitzungen. Wenn sich ein Benutzer über Nubus anmeldet, gibt Keycloak ein Sitzungstoken aus, das von jedem nachgelagerten Dienst erkannt wird.

Die Benutzerbereitstellung erfolgt automatisch. Wenn sich ein neuer Benutzer zum ersten Mal über die SAML-Föderation oder einen lokalen Identitätsanbieter authentifiziert, erstellt Keycloak das Benutzerkonto und stellt es in allen aktivierten Diensten bereit. Es ist keine separate Kontenerstellung in ILIAS, Moodle, Nextcloud oder einer anderen Anwendung erforderlich.

## SAML-Föderation für Bildung

Ein zentrales Unterscheidungsmerkmal von openDesk Edu ist die Unterstützung der SAML-Föderation über DFN-AAI und eduGAIN. In einem föderierten Setup übernimmt der Identitätsanbieter (IdP) der Einrichtung die Authentifizierung, und openDesk Edu agiert als Service Provider (SP) in der Föderation.

Keycloak verbindet sich als SAML-SP mit der Föderation und übersetzt eingehende Assertions in interne Benutzerattribute. Attribute wie `eduPersonPrincipalName`, `eduPersonAffiliation` und `eduPersonEntitlement` werden auf Keycloak-Rollen und Gruppenmitgliedschaften abgebildet, die dann an die einzelnen Dienste weitergegeben werden.

Für ILIAS, Moodle und BigBlueButton, die jeweils ihre eigenen SAML-SP-Schnittstellen implementieren, setzt openDesk Edu Shibboleth als SAML-Proxy ein. Shibboleth empfängt die Assertion von Keycloak, wendet Attribut-Filterregeln an und gibt das Ergebnis an die Anwendung weiter. Dieser Zwei-Sprünge-Ansatz hält die Föderationsmetadaten sauber und ermöglicht dienstspezifische Attributrichtlinien.

## Backup & Ausfallsicherheit

Der Datenschutz in openDesk Edu wird von k8up gehandhabt, einem Kubernetes-Operator auf Basis von restic. k8up überwacht `Backup`-Custom-Ressourcen und erstellt automatisch Snapshots aller persistenten Volumes nach einem konfigurierbaren Zeitplan.

Der Backup-Prozess umfasst Datenbanken, Dateispeicher und Konfiguration. Der Helm-Chart jedes Dienstes enthält Backup-Annotationen, die k8up mitteilen, welche Volumes einbezogen und welche ausgeschlossen werden sollen. Backups werden in einem S3-kompatiblen Bucket oder einem anderen von restic unterstützten Backend gespeichert.

Für die Disaster Recovery unterstützt das restic-Backup-Format inkrementelle Snapshots mit Deduplizierung. Die Wiederherstellung eines Dienstes bedeutet, dass k8up auf einen bestimmten Snapshot verwiesen wird und die Volumes neu erstellt. Der Prozess ist dokumentiert und kann als Teil eines Incident-Response-Playbooks automatisiert werden.

## Zertifikatsverwaltung

openDesk Edu integriert openDesk Certificates der Bundesdruckerei für die automatische TLS-Zertifikatsbereitstellung. Der Zertifikatsoperator läuft innerhalb des Clusters und fordert Zertifikate bei der Bundesdruckerei-CA an, wobei Verlängerung und Verteilung ohne manuelle Eingriffe abgewickelt werden.

Wenn Ihre Einrichtung eine andere Zertifizierungsstelle verwendet oder eine eigene interne CA betreibt, funktioniert das System auch mit cert-manager und Standard-ACME-Anbietern wie Let's Encrypt. Die Helm-Charts akzeptieren benutzerdefinierte Zertifikatskonfigurationen über das globale Template.

## Auswahl Ihres Stacks

openDesk Edu bietet absichtlich Alternativen innerhalb mehrerer Dienstkategorien an. Die Idee ist, dass Einrichtungen das wählen sollten, was zu ihren bestehenden Arbeitsabläufen und ihrer Expertise passt, nicht das, was ein Anbieter vorgibt.

Für E-Mail und Groupware können Sie zwischen Open-Xchange, SOGo und Grommunio wählen. Jeder hat unterschiedliche Stärken in Bezug auf Funktionsumfang, Ressourcenanforderungen und Administratorenkenntnisse. Für Videokonferenzen eignet sich Jitsi Meet gut für kleine bis mittlere Besprechungen, während BigBlueButton für strukturierte virtuelle Klassenzimmersitzungen mit bis zu Hunderten von Teilnehmern konzipiert ist. Für Dateifreigabe ist Nextcloud die Standardeinstellung, und OpenCloud bietet eine auf Bildungsszenarien zugeschnittene Variante.

Die Kategorie Whiteboard und Dokumentkollaboration umfasst Excalidraw für leichtgewichtiges Skizzieren, CryptPad für verschlüsselte Zusammenarbeit und Etherpad für strukturiertes gemeinsames Schreiben. Alle drei können bei Bedarf gleichzeitig aktiviert werden.

## Ausblick

Die Architektur entwickelt sich weiter. Kurzfristige Prioritäten umfassen die Stabilisierung der Beta-Dienste auf Basis von Produktionsfeedback, die Erweiterung der Föderationsoptionen über DFN-AAI hinaus und den Aufbau von Monitoring-Dashboards, die Administratoren Einblick in den Dienstegesundheitszustand über den gesamten Stack geben. Das modulare Design bedeutet, dass neue Dienste als zusätzliche Helm-Charts hinzugefügt werden können, ohne die Kern-Orchestrierungsschicht zu ändern.

Wenn Sie den Code, die Charts und die Konfiguration selbst ansehen möchten, ist alles auf Codeberg verfügbar:

[https://codeberg.org/opendesk-edu/opendesk-edu](https://codeberg.org/opendesk-edu/opendesk-edu)
