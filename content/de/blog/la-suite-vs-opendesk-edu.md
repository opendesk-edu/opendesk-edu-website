---
title: "La Suite vs. openDesk Edu: Was Frankreich und Deutschland gemeinsam haben — und was nicht"
date: "2026-08-02"
description: "Frankreich hat La Suite numérique, Deutschland hat openDesk Edu. Beide verfolgen digitale Souveränität durch Open Source — aber ihre Architekturen, Zielgruppen und Bereitstellungsmodelle weichen stark voneinander ab. Eine vergleichende Analyse der beiden führenden souveränen Arbeitsplatz-Initiativen Europas."
categories: ["Digitale Souveränität", "Vergleich", "Europäische Zusammenarbeit"]
tags: ["la-suite", "frankreich", "deutschland", "digitale-souveränität", "open-source", "dinum", "europäische-zusammenarbeit", "öffentlicher-sektor", "hochschule"]
author: "Tobias Weiß und openDesk Edu Mitwirkende"
image: "/static/blog/la-suite-vs-opendesk-edu-teaser.svg"
---

# La Suite vs. openDesk Edu: Was Frankreich und Deutschland gemeinsam haben — und was nicht

> **Der Kontext:** Zwei europäische Nationen, zwei souveräne digitale Arbeitsplatz-Initiativen — beide auf Open Source aufgebaut, beide gegen GAFAM-Abhängigkeit, beide mit dem Anspruch, öffentliche Daten zu schützen.
>
> **Die Frage:** Konvergieren La Suite numérique und openDesk Edu zu einem gemeinsamen europäischen Modell oder sind es grundlegend verschiedene Projekte, die zufällig eine Philosophie teilen?
>
> **Die Antwort:** Sie haben mehr gemeinsam, als beide Seiten zugeben — und die Unterschiede sind genau dort, wo europäische Zusammenarbeit beginnen sollte.

## Zwei Projekte, eine Überzeugung

2023 startete die französische Regierung **La Suite numérique** — einen souveränen digitalen Arbeitsplatz für die öffentliche Verwaltung, geleitet von der DINUM (Direction interministérielle du numérique). Das Versprechen: Google Workspace und Microsoft 365 durch eine kuratierte Auswahl Open-Source-Werkzeuge auf französischer Souveräns-Infrastruktur ersetzen.

In Deutschland entstand **openDesk Edu** in einem anderen Kontext — der Hochschulbildung. Gehostet vom HRZ Marburg und aufgebaut auf der openDesk-CE-Plattform, integriert es über 25 Open-Source-Dienste für Universitäten: nicht nur Kollaborationswerkzeuge, sondern auch Learning-Management-Systeme, wissenschaftliches Rechnen und Forschungsinfrastruktur.

Beide Projekte entstehen aus derselben Überzeugung: **Europäische öffentliche Einrichtungen sollten für ihre Kern-IT-Infrastruktur nicht von US-Cloud-Anbietern abhängen.** Beide lehnen die CLOUD-Act-Exposition, den Vendor-Lock-in und die steigenden Lizenzkosten des GAFAM-Stacks ab. Beide setzen auf Open Source als Weg zur Souveränität.

Aber wie sie dorthin gelangt sind — und wohin sie gehen — offenbart eine faszinierende Divergenz.

## Die Gemeinsamkeiten

### 1. Open Source als Fundament

Sowohl La Suite als auch openDesk Edu basieren auf denselben Open-Source-Bausteinen:

| Komponente | La Suite | openDesk Edu |
|-----------|----------|--------------|
| Dateisynchronisierung & Sharing | Nextcloud (über Wimi) | Nextcloud (OpenCloud) |
| Dokumentbearbeitung | LibreOffice / Collabora | Collabora Online |
| Videokonferenzen | Jitsi Meet (über Visio) | BigBlueButton + Jitsi |
| Messaging | Tchap (Matrix-basiert) | Matrix (Element) |
| E-Mail | Calypso (Beta) | Dovecot + Postfix |
| Identität | AgentConnect / ProConnect | Keycloak + DFN-AAI |

Die Überschneidung ist bemerkenswert. Beide haben sich für Nextcloud entschieden, beide Matrix-basiertes Messaging übernommen, beide Open-Source-Videokonferenzen genutzt. Das europäische Open-Source-Ökosystem ist klein genug, dass dieselben Projekte immer wieder auftauchen — und das ist eine Stärke, keine Schwäche.

### 2. Digitale Souveränität als treibendes Prinzip

Beide Initiativen existieren wegen derselben rechtlichen und politischen Zwänge:

- **DSGVO-Konformität** — EU-Datenschutzrecht macht US-gehostete Dienste für öffentliche Daten rechtlich riskant
- **CLOUD-Act-Exposition** — US-Anbieter können zur Herausgabe von Daten an US-Behörden gezwungen werden, auch wenn diese in Europa gespeichert sind
- **Schrems-II-Urteil** — hat den Privacy Shield ungültig gemacht und transatlantische Datenübertragungen rechtlich unsicher gemacht
- **Nationale Souveränitätsstrategien** — sowohl Frankreich als auch Deutschland haben Strategien zur digitalen Souveränität veröffentlicht, die souveräne Lösungen bevorzugen

Der BSI (Deutschland) und die ANSSI (Frankreich) haben beide Leitlinien veröffentlicht, die Microsoft 365 für die öffentliche Verwaltung kritisch bewerten. Der BSI veröffentlichte 2023 eine detaillierte Bewertung, die die Eignung von M365 für die Regierungsverwendung in Frage stellte; die ANSSI war noch expliziter und empfahl souveräne Alternativen.

### 3. Staatliche Unterstützung

Keines der Projekte ist eine Graswurzel-Initiative. Beide haben institutionelles Gewicht:

- **La Suite** wird von der DINUM betrieben, der digitalen Transformationseinheit der französischen Regierung, mit Finanzierung aus dem französischen Staatshaushalt und einem Mandat für alle französischen Beamten (~5,7 Millionen potentielle Nutzer)
- **openDesk Edu** wird vom HRZ Marburg (IT-Zentrum der Universität Marburg) betrieben, mit Unterstützung des hessischen Ministeriums für Wissenschaft und Kunst, und richtet sich an deutsche Universitäten (~3 Millionen Studierende + Personal)

### 4. Der gemeinsame Gegner

Beide Projekte definieren sich in Abgrenzung zu derselben Sache: **GAFAM-Abhängigkeit**. Die Erzählung ist auf beiden Seiten des Rheins identisch:

- US-Anbieter bieten aggressive Rabatte, um öffentliche Konten zu gewinnen
- Einmal eingesperrt, steigen die Kosten und der Ausstieg wird unmöglich
- Die Datensouveränität ist durch US-Rechtsprechung kompromittiert
- Öffentliche Gelder fließen an ausländische Konzerne statt in die lokale Wirtschaft

## Wo sie sich unterscheiden

### 1. Bereitstellungsmodell: Zentralisiertes SaaS vs. Föderiertes Self-Hosting

Das ist der wichtigste Unterschied.

**La Suite** ist eine **zentralisierte SaaS-Plattform**. Die DINUM hostet die Dienste auf französischer Souveräns-Infrastruktur (aktuell auf Bleu, dem französischen Souveräns-Cloud-Joint-Venture zwischen Thales und OVHcloud, oder auf Outscale). Französische Beamte verbinden sich mit einer einzigen, von der DINUM verwalteten Instanz. Es gibt kein lokales Deployment — man nutzt die Regierungsinstanz oder man nutzt La Suite nicht.

**openDesk Edu** ist eine **föderierte Self-Hosting-Plattform**. Jede Universität betreibt ihre eigene Instanz auf ihrem eigenen Kubernetes-Cluster. Der HRZ Marburg betreibt die Referenzinstallation, aber jede Einrichtung kann — und soll — ihre eigene betreiben. Die GitOps-Pipeline (ArgoCD + Helmfile) macht das reproduzierbar, aber das Deployment liegt bei der Einrichtung.

| Aspekt | La Suite | openDesk Edu |
|--------|----------|--------------|
| Hosting | Zentralisiert (DINUM) | Föderiert (pro Einrichtung) |
| Infrastruktur | Französischer Souveräns-Cloud | On-Premise Kubernetes |
| Upgrade-Zyklus | DINUM-kontrolliert | Einrichtungskontrolliert |
| Anpassung | Begrenzt (Multi-Tenant) | Vollständig (pro Instanz) |
| Datenresidenz | Frankreich (Bleu/Outscale) | Rechenzentrum jeder Einrichtung |

Das ist kein kleines architektonisches Detail. Es spiegelt grundlegend verschiedene Philosophien wider:

- **Frankreich** vertraut dem Staat, einen zentralen Dienst für alle Beamten zu betreiben. Der Staat hat die Ressourcen, das Mandat und den politischen Willen, im nationalen Maßstab zu operieren.
- **Deutschland** vertraut jeder Einrichtung, ihre eigene zu betreiben. Die föderale Struktur des deutschen Hochschulwesens — jede Universität ist autonom — macht ein zentralisiertes Modell politisch unmöglich. Der HRZ Marburg kann eine Referenz aufbauen, aber keine Adoption verordnen.

### 2. Zielgruppe: Beamte vs. Wissenschaft

**La Suite** richtet sich an **französische Beamte** — Ministerien, Behörden, Landesregierungen, Krankenhäuser. Die Anwendungsfälle sind administrativ: E-Mail, Dokumentbearbeitung, Videokonferenzen, Dateifreigabe, Messaging. Es gibt kein Konzept einer „Veranstaltung" oder einer „Vorlesung" oder eines „Forschungsprojekts".

**openDesk Edu** richtet sich an **deutsche Hochschulbildung** — Universitäten, Forschungsinstitute, Studierendenwerke. Die Plattform umfasst:

- **ILIAS und Moodle** — Learning-Management-Systeme, die von Millionen Studierenden genutzt werden
- **JupyterHub** — wissenschaftliches Rechnen und Datenanalyse
- **BigBlueButton** — speziell für Online-Lehre entwickelt
- **XWiki** — kollaboratives Wissensmanagement für Forschungsgruppen
- **OpenProject** — Projektmanagement für Forschungsprojekte

Das sind keine Produktivitätswerkzeuge — das sind **Bildungs- und Forschungswerkzeuge**. openDesk Edus Umfang ist breiter und spezialisierter als der von La Suite. Eine Universität braucht LMS, Lab-Notebooks und Forschungsdatenmanagement. Ein Ministerium nicht.

### 3. Identität und Föderation

**La Suite** verwendet **AgentConnect** (jetzt Übergang zu **ProConnect**) — die nationale Identitätsföderation Frankreichs für Beamte. Sie verbindet französische Ministeriums-Identitätsanbieter über SAML/OIDC. Die Föderation ist inländisch und zentralisiert.

**openDesk Edu** verwendet **DFN-AAI** — die deutsche nationale Forschungs- und Bildungs-Föderation — die an **eduGAIN** angeschlossen ist, die globale Inter-Föderation. Ein Studierender an jeder deutschen Universität (oder jeder eduGAIN-Teilnehmereinrichtung weltweit) kann sich über den IdP seiner Heimateinrichtung bei openDesk Edu authentifizieren.

Der Unterschied in der Reichweite ist bedeutend: DFN-AAI/eduGAIN gibt openDesk Edu Zugang zu Tausenden von Einrichtungen weltweit. AgentConnect/ProConnect konzentriert sich auf die französische öffentliche Verwaltung und nimmt nicht an eduGAIN teil.

### 4. Reife und Umfang

**La Suite** startete 2023 mit ersten Diensten und befindet sich noch im schrittweisen Rollout. Stand 2026 umfasst der Kern-Dienstkatalog:

- **Visio** — Videokonferenzen (Jitsi-basiert, GA)
- **Messagerie** — E-Mail (Calypso, in Beta)
- **Wimi** — kollaborativer Arbeitsplatz (Nextcloud-basiert, GA)
- **Tchap** — Messaging (Matrix-basiert, GA)
- **Drive** — Dateifreigabe (Nextcloud-basiert, GA)

Der Dienstkatalog ist bewusst schlank — die DINUM priorisiert Qualität und Adoption über Breite.

**openDesk Edu** integriert über 25 Dienste und befindet sich in Produktion am HRZ Marburg. Die Plattform umfasst:

- Vollständige Kollaborations-Suite (Nextcloud, Collabora, Matrix, E-Mail)
- Bildungswerkzeuge (ILIAS, Moodle, BigBlueButton, XWiki)
- Wissenschaftliches Rechnen (JupyterHub)
- Projektmanagement (OpenProject, Planka, BookStack)
- Infrastruktur (Keycloak, Kubernetes, ArgoCD, k8up-Backups)
- Sicherheit (Kyverno-Policies, ZKI-IT-Grundschutz-Compliance)

Der Unterschied im Umfang spiegelt das Ziel wider: Universitäten brauchen ein breiteres Werkzeugspektrum als Regierungsbehörden.

### 5. Governance und Community

**La Suite** ist ein **Top-Down-Regierungsprojekt**. Die DINUM bestimmt die Roadmap, wählt die Werkzeuge und kontrolliert das Deployment. Nutzer-Feedback fließt über formale Kanäle. Der Code ist Open Source, aber die Governance ist zentralisiert.

**openDesk Edu** ist ein **Community-getriebenes Projekt**. Während der HRZ Marburg die Entwicklung leitet, ist das Projekt auf GitHub und Codeberg offen, nimmt Beiträge entgegen und veröffentlicht seine Roadmap öffentlich. Das Contributor Agreement, die Community-of-Practice-Treffen und die transparente Gap-Analyse (die ZKI-Compliance-Arbeit) spiegeln ein anderes Governance-Modell wider — eines, in dem Einrichtungen zusammenarbeiten statt einen Dienst zu empfangen.

### 6. Sicherheit und Compliance-Rahmenwerke

Beide Projekte nehmen Sicherheit ernst, richten sich aber nach verschiedenen nationalen Rahmenwerken:

| Rahmenwerk | La Suite | openDesk Edu |
|-----------|----------|--------------|
| Nationale Sicherheitsnorm | ANSSI-Leitlinien (Frankreich) | BSI IT-Grundschutz / ZKI (Deutschland) |
| Datenschutz | RGPD (Französische DS: CNIL) | DSGVO (Deutscher DS: BfDI) |
| Cloud-Zertifizierung | SecNumCloud (französischer Souveräns-Cloud) | Keine Entsprechung — Self-Hosting |
| Audit-Modell | ANSSI auditiert DINUM | Hochschul-ISMS + ZKI-Profil |
| Policy-Durchsetzung | DINUM-interne Kontrollen | Kyverno ClusterPolicies (GitOps) |

openDesk Edus Ansatz zur Compliance — über 20 durchsetzbare Kyverno-Policies, eine 111-Punkte-ZKI/BSI-Checkliste, eine öffentliche Gap-Analyse — ist transparenter als der von La Suite. Die DINUM veröffentlicht Sicherheitsleitlinien, aber die Durchsetzungsmechanismen sind intern. openDesk Edu macht seinen Policy-Code öffentlich.

## Was Frankreich und Deutschland voneinander lernen könnten

### Was openDesk Edu von La Suite lernen könnte

1. **Zentralisierte Evaluation senkt die Hürde.** La Suites einzelne Instanz bedeutet, dass ein französisches Ministerium die Plattform ausprobieren kann, ohne etwas bereitzustellen. openDesk Edus Self-Hosting-Modell erfordert Kubernetes-Expertise — eine hohe Hürde für kleinere Einrichtungen. Eine gemeinsame Evaluationsinstanz (wie im DFN-AAI-Artikel vorgeschlagen) würde das adressieren.

2. **Schlanker Dienstkatalog.** La Suite konzentriert sich auf 5 Kern-Dienste und macht diese gut. openDesk Edus 25+ Dienste sind eine Stärke, aber auch eine Wartungslast. Nicht jede Universität braucht alle — ein gestaffeltes Bereitstellungsmodell (Kern, Erweitert, Forschung) könnte helfen.

3. **Regierungsauftrag als Adoptions-Treiber.** La Suite profitiert von einem ausdrücklichen Regierungsauftrag für souveräne digitale Werkzeuge. openDesk Edu verlässt sich auf individuelle Hochschul-Adoption — langsamer, aber nachhaltiger.

### Was La Suite von openDesk Edu lernen könnte

1. **Bildungsspezifische Werkzeuge.** La Suite hat kein LMS, kein wissenschaftliches Rechnen, kein Forschungsdatenmanagement. Französische Universitäten, die diese Werkzeuge brauchen, müssen woanders suchen. openDesk Edus Integration von ILIAS, Moodle und JupyterHub ist ein Modell, das es zu studieren gilt.

2. **Föderiertes Self-Hosting für Forschungsdaten.** Forschungsdaten dürfen oft die Einrichtung nicht verlassen (ethische, rechtliche oder technische Zwänge). La Suites zentralisiertes Modell erschwert das. openDesk Edus Deployment pro Einrichtung gibt jeder Universität volle Kontrolle über sensible Forschungsdaten.

3. **Transparente Compliance.** openDesk Edu veröffentlicht seine ZKI-Gap-Analyse, seine Kyverno-Policies und seine Compliance-Roadmap. La Suites Sicherheitsstatus ist weniger öffentlich dokumentiert. Transparenz schafft Vertrauen — besonders in der Wissenschaft.

4. **eduGAIN-Integration.** La Suites AgentConnect/ProConnect ist inländisch. Wenn es sich mit eduGAIN föderieren würde, könnten französische Forscher nahtlos mit internationalen Partnern zusammenarbeiten. openDesk Edus DFN-AAI/eduGAIN-Integration ist ein erprobtes Modell.

## Das größere Bild: Ein europäischer souveräner Digital-Stack?

Die Unterschiede zwischen La Suite und openDesk Edu sind keine Fehler — sie spiegeln echte Unterschiede zwischen französischer und deutscher Verwaltungskultur wider. Aber sie repräsentieren auch eine verpasste Chance.

Stellen Sie sich einen **europäischen souveränen Digital-Stack** vor, in dem:

- La Suite und openDesk Edu dieselben Open-Source-Komponenten teilen (Nextcloud, Collabora, Matrix, Jitsi/BigBlueButton)
- Ein französischer Forscher, der eine deutsche Universität besucht, sich über eduGAIN authentifiziert — kein neues Konto nötig
- Beide Plattformen dieselbe Compliance-Sprache übernehmen (ANSSI-Leitlinien auf BSI IT-Grundschutz abbilden)
- Eine gemeinsame Evaluationsinfrastruktur Einrichtungen ermöglicht, beide zu testen, bevor sie sich entscheiden
- Die Förderprogramme der Europäischen Kommission (Digital Europe Programme, Horizon Europe) die grenzüberschreitende Zusammenarbeit zwischen den beiden Initiativen unterstützen

Das ist nicht utopisch. Die Komponenten werden bereits geteilt. Die Open-Source-Projekte (Nextcloud, Matrix, Collabora) sind dieselben. Der politische Wille existiert in Paris und Berlin. Was fehlt, ist das **Verbindungsstück**: eine gemeinsame Identitätsschicht, ein gemeinsamer Compliance-Rahmen und eine gemeinsame Verpflichtung zu Interoperabilität.

### Die GAIA-X-Verbindung

Beide Projekte alignieren sich mit der GAIA-X-Vision europäischer Datensouveränität — aber aus verschiedenen Winkeln:

- **La Suite** operiert auf Bleu, einer GAIA-X-kompatiblen Souveräns-Cloud
- **openDesk Edu** läuft auf On-Premise-Kubernetes am HRZ Marburg, der sich mit GAIA-X-Infrastruktur föderieren ließe

Eine GAIA-X-Föderation, die La Suites zentralisierte Dienste mit openDesk Edus föderierten Deployments verbindet, könnte einen genuin europäischen digitalen Arbeitsplatz schaffen — einen, bei dem Souveränität nicht nur national, sondern kontinental ist.

## Ein praktischer Handlungsaufruf

Das openDesk-Edu-Team hat sich informell mit DINUM-Gegenstücken in Verbindung gesetzt. Die Resonanz war positiv — es gibt echtes Interesse an Zusammenarbeit. Folgendes schlagen wir vor:

1. **Ein gemeinsamer Workshop** zu souveränen digitalen Arbeitsplätzen in der europäischen öffentlichen Verwaltung, co-hosted von DINUM und HRZ Marburg
2. **Eine gemeinsame Komponenten-Matrix** — welche Open-Source-Dienste jede Plattform nutzt, mit Identifikation von Möglichkeiten für gemeinsame Entwicklung
3. **eduGAIN-Integration für La Suite** — Erweiterung von AgentConnect/ProConnect zur Teilnahme an der globalen Forschungs-Föderation
4. **Eine grenzüberschreitende Evaluation** — eine französische Universität pilotiert openDesk Edu und eine deutsche Behörde pilotiert La Suite, um aus beiden Modellen zu lernen
5. **Ein gemeinsames Compliance-Mapping** — Abbildung von ANSSI-Leitlinien auf BSI IT-Grundschutz, Schaffung einer europäischen Sicherheits-Baseline für souveräne digitale Arbeitsplätze

Die Zeit ist reif. Die politischen Winde favorisieren Souveränität. Die Technologie ist erwiesen. Die Communities sind willig. Was fehlt, ist institutionelles Engagement — und ein paar mutige Menschen auf beiden Seiten des Rheins, die bereit sind, die Brücke zu bauen.

## Fazit

La Suite und openDesk Edu sind keine Konkurrenten. Sie sind **komplementäre Ausdrücke derselben europäischen Idee**: dass öffentliche Einrichtungen digitale Infrastruktur verdienen, die sie kontrollieren, dass Open Source der Weg zur Souveränität ist, und dass grenzüberschreitende Zusammenarbeit uns alle stärker macht.

Frankreich wählte Zentralisierung; Deutschland wählte Föderation. Frankreich wählte einen schlanken Dienstkatalog; Deutschland wählte Breite. Frankreich wählte einen Regierungsauftrag; Deutschland wählte Community-Adoption. Beide Entscheidungen sind legitim — und beide haben sich gegenseitig etwas zu lehren.

Der echte Wettbewerb ist nicht La Suite gegen openDesk Edu. Es ist **europäische Souveränität gegen GAFAM-Abhängigkeit**. Und auf diesem Feld sind wir auf derselben Seite.

---

*openDesk Edu ist ein Open-Source-Projekt. Wir begrüßen Beiträge aus ganz Europa — nicht nur aus Deutschland. Wenn Sie an souveräner digitaler Infrastruktur in Frankreich, Belgien, den Niederlanden oder anderswo arbeiten, würden wir uns freuen, von Ihnen zu hören.*

[Erkunden Sie die openDesk-Edu-Architektur und Bereitstellungsleitfäden](https://opendesk-edu.org)

[Mehr über La Suite numérique (auf Französisch)](https://www.numerique.gouv.fr/services/la-suite-numerique/)
