/**
 * openDesk Edu Service Landscape Configuration
 * 
 * This file contains all configuration data for the landscape page.
 * Update this file to add, remove, or modify services.
 */

// ============================================================================
// CATEGORIES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'platform',
    name: 'Core Platform',
    color: '#571EFA',
    icon: '🏗️',
    description: 'Foundation services for authentication, file storage, email, and groupware'
  },
  {
    id: 'education',
    name: 'Education & Research',
    color: '#A78BFA',
    icon: '🎓',
    description: 'Purpose-built tools for teaching, learning, and computational research'
  },
  {
    id: 'collaboration',
    name: 'Collaboration & Productivity',
    color: '#DDD6FE',
    icon: '🤝',
    description: 'Real-time collaboration, communication, and productivity tools'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure & Operations',
    color: '#8B5CF6',
    icon: '⚙️',
    description: 'Container orchestration, storage, networking, and observability'
  },
  {
    id: 'security',
    name: 'Security & Compliance',
    color: '#EC4899',
    icon: '🛡️',
    description: 'Protection, compliance, and governance for digital sovereignty'
  },
];

// ============================================================================
// SERVICE STATUS
// ============================================================================

export interface StatusConfig {
  id: string;
  label: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
  priority: number;
}

export const STATUS_CONFIGS: StatusConfig[] = [
  {
    id: 'Production',
    label: 'Production',
    color: {
      bg: 'rgba(34, 197, 94, 0.2)',
      text: '#22c55e',
      border: 'rgba(34, 197, 94, 0.3)',
    },
    priority: 1,
  },
  {
    id: 'Beta',
    label: 'Beta',
    color: {
      bg: 'rgba(245, 158, 11, 0.2)',
      text: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.3)',
    },
    priority: 2,
  },
  {
    id: 'Development',
    label: 'Development',
    color: {
      bg: 'rgba(168, 85, 247, 0.2)',
      text: '#a855f7',
      border: 'rgba(168, 85, 247, 0.3)',
    },
    priority: 3,
  },
  {
    id: 'Deprecated',
    label: 'Deprecated',
    color: {
      bg: 'rgba(239, 68, 68, 0.2)',
      text: '#ef4444',
      border: 'rgba(239, 68, 68, 0.3)',
    },
    priority: 4,
  },
];

// ============================================================================
// SERVICES
// ============================================================================

export interface Service {
  id: string;
  name: string;
  category: string;
  status: string;
  version?: string;
  description: string;
  shortDescription?: string;
  tags: string[];
  icon?: string;
  logo?: string; // URL to service logo
  links?: {
    homepage?: string;
    documentation?: string;
    repository?: string;
    demo?: string;
  };
  dependsOn?: string[]; // IDs of services this service depends on
  relatedServices?: string[]; // IDs of related services
  maturity?: number; // 0-100 representing maturity level
  popularity?: number; // 0-100 representing popularity
  lastUpdated?: string; // ISO date string
  documentationUrl?: string;
  isNew?: boolean; // Mark as new (for highlighting)
  isFeatured?: boolean; // Featured service
}

export const SERVICES: Service[] = [
  // ========================================================================
  // CORE PLATFORM
  // ========================================================================
  {
    id: 'keycloak',
    name: 'Keycloak',
    category: 'platform',
    status: 'Production',
    version: '24.0.0',
    description: 'Centralized identity and access management with support for SAML 2.0, OpenID Connect, and LDAP integrations.',
    shortDescription: 'Unified SSO & Identity Provider',
    tags: ['SAML 2.0', 'OIDC', 'LDAP', 'IAM', 'Federation'],
    icon: '🔐',
    logo: '/static/icons/keycloak.svg',
    links: {
      homepage: 'https://www.keycloak.org',
      documentation: 'https://docs.opendesk-edu.org/keycloak',
      repository: 'https://github.com/keycloak/keycloak',
    },
    maturity: 100,
    popularity: 100,
    lastUpdated: '2026-07-01',
    isFeatured: true,
  },
  {
    id: 'opencloud',
    name: 'OpenCloud',
    category: 'platform',
    status: 'Production',
    version: '4.0.3',
    description: 'Nextcloud fork with enhanced OIDC integration, optimized for educational environments with automatic user provisioning.',
    shortDescription: 'Nextcloud with OIDC integration',
    tags: ['File Sync', 'Share', 'WebDAV', 'OIDC', 'LDAP'],
    icon: '☁️',
    logo: '/static/icons/opencloud.svg',
    links: {
      homepage: 'https://opencloud.hrz.uni-marburg.de',
      documentation: 'https://docs.opendesk-edu.org/opencloud',
    },
    dependsOn: ['keycloak'],
    maturity: 95,
    popularity: 95,
    lastUpdated: '2026-06-15',
    isFeatured: true,
  },
  {
    id: 'stalwart',
    name: 'Stalwart',
    category: 'platform',
    status: 'Production',
    version: 'latest',
    description: 'Modern, secure mail server with support for IMAP, SMTP, POP3, JMAP, and advanced features like OIDC authentication.',
    shortDescription: 'Modern Mail Server',
    tags: ['IMAP', 'SMTP', 'POP3', 'JMAP', 'OIDC', 'LDAP'],
    icon: '📧',
    logo: '/static/icons/stalwart.svg',
    links: {
      homepage: 'https://stalwartlabs.com',
      documentation: 'https://docs.opendesk-edu.org/stalwart',
      repository: 'https://github.com/stalwartlabs/mail-server',
    },
    dependsOn: ['keycloak'],
    maturity: 85,
    popularity: 80,
    lastUpdated: '2026-07-20',
    isNew: true,
    isFeatured: true,
  },
  {
    id: 'sogo',
    name: 'SOGo',
    category: 'platform',
    status: 'Production',
    version: '5.11.0',
    description: 'Groupware solution with calendar, contacts, and email management. Fully integrated with Keycloak SSO.',
    shortDescription: 'Groupware Solution',
    tags: ['Calendar', 'Contacts', 'Email', 'GroupDAV', 'CalDAV', 'CardDAV'],
    icon: '📅',
    logo: '/static/icons/sogo.svg',
    links: {
      homepage: 'https://sogo.nu',
      documentation: 'https://docs.opendesk-edu.org/sogo',
      repository: 'https://salsa.debian.org/sogo-team/sogo',
    },
    dependsOn: ['keycloak'],
    maturity: 90,
    popularity: 85,
    lastUpdated: '2026-05-20',
  },
  {
    id: 'matrix',
    name: 'Matrix + Element',
    category: 'platform',
    status: 'Production',
    version: '1.12.6',
    description: 'Decentralized messaging platform with end-to-end encryption, VoIP, and bridging capabilities.',
    shortDescription: 'Encrypted Messaging Platform',
    tags: ['E2EE', 'VoIP', 'Bridges', 'Decentralized', 'Messaging'],
    icon: '💬',
    logo: '/static/icons/matrix.svg',
    links: {
      homepage: 'https://matrix.org',
      documentation: 'https://docs.opendesk-edu.org/matrix',
      repository: 'https://github.com/matrix-org/synapse',
    },
    dependsOn: ['keycloak'],
    maturity: 90,
    popularity: 75,
    lastUpdated: '2026-04-10',
  },
  {
    id: 'etherpad',
    name: 'Etherpad',
    category: 'platform',
    status: 'Production',
    version: '1.9.9',
    description: 'Real-time collaborative text editing with rich formatting, plugins, and API access.',
    shortDescription: 'Real-time Collaborative Editing',
    tags: ['Rich Text', 'Pad API', 'Plugins', 'Collaboration'],
    icon: '✏️',
    logo: '/static/icons/etherpad.svg',
    links: {
      homepage: 'https://etherpad.org',
      documentation: 'https://docs.opendesk-edu.org/etherpad',
      repository: 'https://github.com/ether/etherpad-lite',
    },
    maturity: 95,
    popularity: 70,
    lastUpdated: '2026-03-01',
  },
  {
    id: 'nubus',
    name: 'Nubus Portal',
    category: 'platform',
    status: 'Production',
    version: '1.18.1',
    description: 'Self-service portal for identity and access management. Allows users to manage profiles, groups, and application access.',
    shortDescription: 'IAM Self-Service Portal',
    tags: ['User Mgmt', 'Group Mgmt', 'SSO', 'Portal'],
    icon: '🌐',
    logo: '/static/icons/nubus.svg',
    links: {
      homepage: 'https://nubus.io',
      documentation: 'https://docs.opendesk-edu.org/nubus',
    },
    dependsOn: ['keycloak'],
    maturity: 85,
    popularity: 85,
    lastUpdated: '2026-05-01',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'platform',
    status: 'Production',
    version: '16.0',
    description: 'Relational database management system with high availability and automatic failover.',
    shortDescription: 'Relational Database',
    tags: ['Managed', 'HA', 'SQL', 'Replication'],
    icon: '🐘',
    logo: '/static/icons/postgresql.svg',
    links: {
      homepage: 'https://www.postgresql.org',
      documentation: 'https://docs.opendesk-edu.org/database',
    },
    maturity: 100,
    popularity: 80,
    lastUpdated: '2026-02-15',
  },
  {
    id: 'minio',
    name: 'MinIO',
    category: 'platform',
    status: 'Production',
    version: 'latest',
    description: 'S3-compatible object storage with distributed deployment, encryption, and versioning.',
    shortDescription: 'S3-Compatible Object Storage',
    tags: ['Distributed', 'Encrypted', 'S3', 'Versioning'],
    icon: '🗃️',
    logo: '/static/icons/minio.svg',
    links: {
      homepage: 'https://min.io',
      documentation: 'https://docs.opendesk-edu.org/minio',
      repository: 'https://github.com/minio/minio',
    },
    maturity: 90,
    popularity: 75,
    lastUpdated: '2026-01-20',
  },

  // ========================================================================
  // EDUCATION & RESEARCH
  // ========================================================================
  {
    id: 'moodle',
    name: 'Moodle',
    category: 'education',
    status: 'Production',
    version: '4.4.0',
    description: 'World-leading open-source learning management system with comprehensive course management, assessments, and reporting.',
    shortDescription: 'Learning Management System',
    tags: ['Courses', 'Quizzes', 'SCORM', 'LMS', 'Assessments'],
    icon: '📚',
    logo: '/static/icons/moodle.svg',
    links: {
      homepage: 'https://moodle.org',
      documentation: 'https://docs.opendesk-edu.org/moodle',
      repository: 'https://github.com/moodle/moodle',
    },
    dependsOn: ['keycloak'],
    maturity: 95,
    popularity: 95,
    lastUpdated: '2026-06-01',
    isFeatured: true,
  },
  {
    id: 'ilias',
    name: 'ILIAS',
    category: 'education',
    status: 'Production',
    version: '7.28',
    description: 'Integrated Learning Management System and Learning Record Store with support for learning paths, assessments, and certifications.',
    shortDescription: 'Integrated LMS & LRS',
    tags: ['Learning Paths', 'Assessments', 'Certifications', 'xAPI', 'LRS'],
    icon: '🎓',
    logo: '/static/icons/ilias.svg',
    links: {
      homepage: 'https://www.ilias.de',
      documentation: 'https://docs.opendesk-edu.org/ilias',
      repository: 'https://github.com/ILIAS-eLearning/ILIAS',
    },
    dependsOn: ['keycloak'],
    maturity: 90,
    popularity: 85,
    lastUpdated: '2026-05-15',
    isFeatured: true,
  },
  {
    id: 'jupyterhub',
    name: 'JupyterHub',
    category: 'education',
    status: 'Production',
    version: '4.0.0',
    description: 'Multi-user Jupyter notebook server for computational research, data analysis, and interactive programming.',
    shortDescription: 'Computational Research Platform',
    tags: ['Python', 'R', 'Notebooks', 'Data Science', 'ML'],
    icon: '📊',
    logo: '/static/icons/jupyterhub.svg',
    links: {
      homepage: 'https://jupyter.org/hub',
      documentation: 'https://docs.opendesk-edu.org/jupyterhub',
      repository: 'https://github.com/jupyterhub/jupyterhub',
    },
    dependsOn: ['keycloak'],
    maturity: 85,
    popularity: 80,
    lastUpdated: '2026-04-20',
    isFeatured: true,
  },
  {
    id: 'xwiki',
    name: 'XWiki',
    category: 'education',
    status: 'Production',
    version: '17.10.4',
    description: 'Knowledge management platform with wiki functionality, structured data, applications, and macros.',
    shortDescription: 'Knowledge Management & Wiki',
    tags: ['Structured', 'Apps', 'Macros', 'Wiki', 'Collaboration'],
    icon: '📝',
    logo: '/static/icons/xwiki.svg',
    links: {
      homepage: 'https://www.xwiki.org',
      documentation: 'https://docs.opendesk-edu.org/xwiki',
      repository: 'https://github.com/xwiki/xwiki-platform',
    },
    dependsOn: ['keycloak'],
    maturity: 85,
    popularity: 75,
    lastUpdated: '2026-03-10',
  },
  {
    id: 'openproject',
    name: 'OpenProject',
    category: 'education',
    status: 'Production',
    version: '17.2.1',
    description: 'Project management software for agile and classic project management with work packages, Gantt charts, and boards.',
    shortDescription: 'Project Management for Research',
    tags: ['Agile', 'Gantt', 'Work Packages', 'Boards', 'Scrum'],
    icon: '📋',
    logo: '/static/icons/openproject.svg',
    links: {
      homepage: 'https://www.openproject.org',
      documentation: 'https://docs.opendesk-edu.org/openproject',
      repository: 'https://github.com/opf/openproject',
    },
    dependsOn: ['keycloak'],
    maturity: 80,
    popularity: 70,
    lastUpdated: '2026-02-28',
  },

  // ========================================================================
  // COLLABORATION & PRODUCTIVITY
  // ========================================================================
  {
    id: 'collabora',
    name: 'Collabora Online',
    category: 'collaboration',
    status: 'Production',
    version: '25.04.8',
    description: 'Online office suite based on LibreOffice with real-time collaborative editing for documents, spreadsheets, and presentations.',
    shortDescription: 'Real-time Document Editing',
    tags: ['LibreOffice', 'ODT', 'DOCX', 'XLSX', 'PPTX'],
    icon: '📄',
    logo: '/static/icons/collabora.svg',
    links: {
      homepage: 'https://www.collaboraoffice.com',
      documentation: 'https://docs.opendesk-edu.org/collabora',
      repository: 'https://github.com/CollaboraOnline/online',
    },
    dependsOn: ['opencloud'],
    maturity: 90,
    popularity: 85,
    lastUpdated: '2026-05-10',
  },
  {
    id: 'jitsi',
    name: 'Jitsi Meet',
    category: 'collaboration',
    status: 'Production',
    version: '2.0.10590',
    description: 'Secure, fully featured video conferencing solution with WebRTC, screen sharing, and recording capabilities.',
    shortDescription: 'Video Conferencing',
    tags: ['WebRTC', 'Screenshare', 'Recording', 'Encrypted'],
    icon: '🎥',
    logo: '/static/icons/jitsi.svg',
    links: {
      homepage: 'https://jitsi.org',
      documentation: 'https://docs.opendesk-edu.org/jitsi',
      repository: 'https://github.com/jitsi/jitsi-meet',
    },
    dependsOn: ['keycloak'],
    maturity: 95,
    popularity: 90,
    lastUpdated: '2026-04-01',
  },
  {
    id: 'planka',
    name: 'Planka',
    category: 'collaboration',
    status: 'Production',
    version: '2.1.0',
    description: 'Open-source Kanban board for task management with lists, cards, and drag-and-drop functionality.',
    shortDescription: 'Kanban Task Management',
    tags: ['Boards', 'Lists', 'Cards', 'Agile', 'Kanban'],
    icon: '📑',
    logo: '/static/icons/planka.svg',
    links: {
      homepage: 'https://planka.app',
      documentation: 'https://docs.opendesk-edu.org/planka',
      repository: 'https://github.com/plankanban/planka',
    },
    dependsOn: ['keycloak'],
    maturity: 85,
    popularity: 70,
    lastUpdated: '2026-03-20',
  },
  {
    id: 'n8n',
    name: 'n8n',
    category: 'collaboration',
    status: 'Production',
    version: '1.0.0',
    description: 'Extendable workflow automation tool with low-code interface and 300+ app integrations.',
    shortDescription: 'Workflow Automation',
    tags: ['Low-Code', 'Integrations', 'AI', 'Automation', 'Workflows'],
    icon: '🔄',
    logo: '/static/icons/n8n.svg',
    links: {
      homepage: 'https://n8n.io',
      documentation: 'https://docs.opendesk-edu.org/n8n',
      repository: 'https://github.com/n8n-io/n8n',
    },
    maturity: 80,
    popularity: 75,
    lastUpdated: '2026-02-10',
  },
  {
    id: 'dify',
    name: 'Dify',
    category: 'collaboration',
    status: 'Production',
    version: 'latest',
    description: 'AI agent platform for building, deploying, and managing AI applications with LLM support and RAG capabilities.',
    shortDescription: 'AI Agent Platform',
    tags: ['LLMs', 'RAG', 'Workflows', 'AI', 'Agents'],
    icon: '🤖',
    logo: '/static/icons/dify.svg',
    links: {
      homepage: 'https://dify.ai',
      documentation: 'https://docs.opendesk-edu.org/dify',
      repository: 'https://github.com/langgenius/dify',
    },
    maturity: 75,
    popularity: 65,
    lastUpdated: '2026-01-15',
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    category: 'collaboration',
    status: 'Production',
    version: '6.6.0',
    description: 'Popular content management system for building websites, blogs, and online publications.',
    shortDescription: 'Content Management System',
    tags: ['Blogs', 'Websites', 'Plugins', 'Themes', 'CMS'],
    icon: '🌐',
    logo: '/static/icons/wordpress.svg',
    links: {
      homepage: 'https://wordpress.org',
      documentation: 'https://docs.opendesk-edu.org/wordpress',
      repository: 'https://github.com/WordPress/WordPress',
    },
    dependsOn: ['keycloak'],
    maturity: 95,
    popularity: 80,
    lastUpdated: '2026-04-05',
  },

  // ========================================================================
  // INFRASTRUCTURE & OPERATIONS
  // ========================================================================
  {
    id: 'k3s',
    name: 'K3s',
    category: 'infrastructure',
    status: 'Production',
    version: '1.32.3',
    description: 'Lightweight Kubernetes distribution optimized for production workloads with simplified installation and management.',
    shortDescription: 'Lightweight Kubernetes Distribution',
    tags: ['CNCF', 'Edge', 'IoT', 'Production', 'Kubernetes'],
    icon: '⎈',
    logo: '/static/icons/k3s.svg',
    links: {
      homepage: 'https://k3s.io',
      documentation: 'https://docs.opendesk-edu.org/k3s',
      repository: 'https://github.com/k3s-io/k3s',
    },
    maturity: 100,
    popularity: 100,
    lastUpdated: '2026-07-01',
    isFeatured: true,
  },
  {
    id: 'argocd',
    name: 'ArgoCD',
    category: 'infrastructure',
    status: 'Production',
    version: '2.12.0',
    description: 'Declarative GitOps continuous delivery tool for Kubernetes with automated application deployment and lifecycle management.',
    shortDescription: 'GitOps Continuous Delivery',
    tags: ['Declarative', 'Sync', 'Rollback', 'GitOps', 'CD'],
    icon: '🔄',
    logo: '/static/icons/argocd.svg',
    links: {
      homepage: 'https://argoproj.github.io/cd',
      documentation: 'https://docs.opendesk-edu.org/argocd',
      repository: 'https://github.com/argoproj/argo-cd',
    },
    maturity: 95,
    popularity: 90,
    lastUpdated: '2026-06-15',
    isFeatured: true,
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    category: 'infrastructure',
    status: 'Production',
    version: '2.50.0',
    description: 'Time-series monitoring system with powerful querying, alerting, and metrics collection for Kubernetes and applications.',
    shortDescription: 'Monitoring & Alerting',
    tags: ['Metrics', 'TSDB', 'Alertmanager', 'Monitoring', 'Observability'],
    icon: '📈',
    logo: '/static/icons/prometheus.svg',
    links: {
      homepage: 'https://prometheus.io',
      documentation: 'https://docs.opendesk-edu.org/prometheus',
      repository: 'https://github.com/prometheus/prometheus',
    },
    maturity: 95,
    popularity: 85,
    lastUpdated: '2026-05-01',
  },
  {
    id: 'grafana',
    name: 'Grafana',
    category: 'infrastructure',
    status: 'Production',
    version: '10.0.0',
    description: 'Observability platform for visualization, alerting, and log correlation with support for Prometheus and other data sources.',
    shortDescription: 'Observability & Dashboards',
    tags: ['Visualization', 'Alerts', 'Log Correlation', 'Dashboards', 'Observability'],
    icon: '📊',
    logo: '/static/icons/grafana.svg',
    links: {
      homepage: 'https://grafana.com',
      documentation: 'https://docs.opendesk-edu.org/grafana',
      repository: 'https://github.com/grafana/grafana',
    },
    maturity: 95,
    popularity: 85,
    lastUpdated: '2026-04-15',
  },
  {
    id: 'k8up',
    name: 'k8up',
    category: 'infrastructure',
    status: 'Production',
    version: 'latest',
    description: 'Kubernetes backup operator using restic for automated, encrypted, and efficient backup of persistent volumes and application data.',
    shortDescription: 'Kubernetes Backup Operator',
    tags: ['Restic', 'Schedules', 'Restore', 'Backup', 'Encrypted'],
    icon: '🛡️',
    logo: '/static/icons/k8up.svg',
    links: {
      homepage: 'https://k8up.io',
      documentation: 'https://docs.opendesk-edu.org/k8up',
      repository: 'https://github.com/k8up-io/k8up',
    },
    maturity: 90,
    popularity: 80,
    lastUpdated: '2026-03-01',
    isFeatured: true,
  },
  {
    id: 'traefik',
    name: 'Traefik',
    category: 'infrastructure',
    status: 'Production',
    version: '2.10.0',
    description: 'Cloud-native edge router and reverse proxy with automatic SSL certificate management, load balancing, and middleware support.',
    shortDescription: 'Cloud Native Edge Router',
    tags: ['Ingress', 'LB', 'Middleware', 'SSL', 'Reverse Proxy'],
    icon: '🌐',
    logo: '/static/icons/traefik.svg',
    links: {
      homepage: 'https://traefik.io',
      documentation: 'https://docs.opendesk-edu.org/traefik',
      repository: 'https://github.com/traefik/traefik',
    },
    maturity: 90,
    popularity: 85,
    lastUpdated: '2026-02-20',
  },
  {
    id: 'haproxy',
    name: 'HAProxy',
    category: 'infrastructure',
    status: 'Production',
    version: '2.8.0',
    description: 'Highly performant TCP/HTTP load balancer with SSL termination, health checks, and advanced routing capabilities.',
    shortDescription: 'High Availability Load Balancer',
    tags: ['TCP/HTTP', 'SSL', 'Health Checks', 'LB', 'HA'],
    icon: '⚖️',
    logo: '/static/icons/haproxy.svg',
    links: {
      homepage: 'https://www.haproxy.org',
      documentation: 'https://docs.opendesk-edu.org/haproxy',
      repository: 'https://github.com/haproxy/haproxy',
    },
    maturity: 95,
    popularity: 80,
    lastUpdated: '2026-01-01',
  },
  {
    id: 'ceph',
    name: 'Ceph CSI',
    category: 'infrastructure',
    status: 'Production',
    description: 'Container Storage Interface for Ceph, providing RBD and CephFS storage to Kubernetes with dynamic provisioning.',
    shortDescription: 'Software-Defined Storage',
    tags: ['RBD', 'CephFS', 'EC Pool', 'Storage', 'CSI'],
    icon: '💾',
    logo: '/static/icons/ceph.svg',
    links: {
      homepage: 'https://ceph.io',
      documentation: 'https://docs.opendesk-edu.org/ceph',
      repository: 'https://github.com/ceph/ceph-csi',
    },
    maturity: 90,
    popularity: 75,
    lastUpdated: '2026-02-10',
  },

  // ========================================================================
  // SECURITY & COMPLIANCE
  // ========================================================================
  {
    id: 'clamav',
    name: 'ClamAV',
    category: 'security',
    status: 'Production',
    version: '1.0.0',
    description: 'Open-source antivirus engine with signature-based detection, automatic updates, and scanning capabilities.',
    shortDescription: 'Antivirus Engine',
    tags: ['Signatures', 'Scanning', 'Updates', 'Malware', 'Protection'],
    icon: '🛡️',
    logo: '/static/icons/clamav.svg',
    links: {
      homepage: 'https://www.clamav.net',
      documentation: 'https://docs.opendesk-edu.org/clamav',
      repository: 'https://github.com/Cisco-Talos/clamav',
    },
    maturity: 90,
    popularity: 75,
    lastUpdated: '2026-04-01',
  },
  {
    id: 'cert-manager',
    name: 'cert-manager',
    category: 'security',
    status: 'Production',
    version: '1.14.0',
    description: 'Automated TLS certificate management for Kubernetes with support for Let\'s Encrypt, ACME, and custom CAs.',
    shortDescription: 'Automated TLS Certificate Management',
    tags: ["Let's Encrypt", 'ACME', 'Bundesdruckerei', 'TLS', 'Certificates'],
    icon: '🔐',
    logo: '/static/icons/cert-manager.svg',
    links: {
      homepage: 'https://cert-manager.io',
      documentation: 'https://docs.opendesk-edu.org/cert-manager',
      repository: 'https://github.com/cert-manager/cert-manager',
    },
    maturity: 95,
    popularity: 90,
    lastUpdated: '2026-05-15',
    isFeatured: true,
  },
  {
    id: 'kubescape',
    name: 'Kubescape',
    category: 'security',
    status: 'Production',
    version: '3.0.0',
    description: 'Kubernetes-native security platform for scanning resources against security policies, detecting CVEs, and ensuring compliance.',
    shortDescription: 'Kubernetes Security Scanning',
    tags: ['CVE', 'Misconfig', 'Compliance', 'Security', 'Scanning'],
    icon: '🔍',
    logo: '/static/icons/kubescape.svg',
    links: {
      homepage: 'https://kubescape.io',
      documentation: 'https://docs.opendesk-edu.org/kubescape',
      repository: 'https://github.com/kubescape/kubescape',
    },
    maturity: 85,
    popularity: 70,
    lastUpdated: '2026-03-20',
  },
  {
    id: 'pentest',
    name: 'Pentest Reports',
    category: 'security',
    status: 'Production',
    description: 'Comprehensive security assessments with OWASP-based testing, CVSS scoring, and remediation tracking for the entire platform.',
    shortDescription: 'Security Assessment & Remediation',
    tags: ['OWASP', 'CVSS', 'OCAP', 'Assessment', 'Security'],
    icon: '📊',
    logo: '/static/icons/pentest.svg',
    links: {
      documentation: 'https://docs.opendesk-edu.org/security',
    },
    maturity: 90,
    popularity: 80,
    lastUpdated: '2026-06-01',
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get services by category
 */
export function getServicesByCategory(categoryId: string): Service[] {
  return SERVICES.filter(service => service.category === categoryId);
}

/**
 * Get all services matching a search query
 */
export function searchServices(query: string): Service[] {
  const lowerQuery = query.toLowerCase();
  return SERVICES.filter(service => 
    service.name.toLowerCase().includes(lowerQuery) ||
    service.description.toLowerCase().includes(lowerQuery) ||
    service.shortDescription?.toLowerCase().includes(lowerQuery) ||
    service.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get services by status
 */
export function getServicesByStatus(status: string): Service[] {
  return SERVICES.filter(service => service.status === status);
}

/**
 * Get services by tag
 */
export function getServicesByTag(tag: string): Service[] {
  return SERVICES.filter(service => service.tags.includes(tag));
}

/**
 * Get featured services
 */
export function getFeaturedServices(): Service[] {
  return SERVICES.filter(service => service.isFeatured);
}

/**
 * Get new services
 */
export function getNewServices(): Service[] {
  return SERVICES.filter(service => service.isNew);
}

/**
 * Get services with dependencies on a specific service
 */
export function getDependentServices(serviceId: string): Service[] {
  return SERVICES.filter(service => 
    service.dependsOn?.includes(serviceId) || 
    service.relatedServices?.includes(serviceId)
  );
}

/**
 * Get category by ID
 */
export function getCategoryById(categoryId: string): Category | undefined {
  return CATEGORIES.find(cat => cat.id === categoryId);
}

/**
 * Get status config by ID
 */
export function getStatusConfig(statusId: string): StatusConfig | undefined {
  return STATUS_CONFIGS.find(config => config.id === statusId);
}

/**
 * Get statistics about the landscape
 */
export function getLandscapeStats() {
  const totalServices = SERVICES.length;
  const servicesByStatus = STATUS_CONFIGS.map(status => ({
    status: status.id,
    count: SERVICES.filter(s => s.status === status.id).length,
  }));
  const servicesByCategory = CATEGORIES.map(category => ({
    category: category.id,
    count: SERVICES.filter(s => s.category === category.id).length,
  }));

  return {
    totalServices,
    servicesByStatus,
    servicesByCategory,
    featuredCount: SERVICES.filter(s => s.isFeatured).length,
    newCount: SERVICES.filter(s => s.isNew).length,
    lastUpdated: new Date(Math.max(...SERVICES
      .filter(s => s.lastUpdated)
      .map(s => new Date(s.lastUpdated!).getTime()))).toISOString(),
  };
}

/**
 * Get all available tags
 */
export function getAllTags(): string[] {
  const tags = SERVICES.flatMap(service => service.tags);
  return [...new Set(tags)].sort();
}

/**
 * Sort services by priority (status, then alphabetically)
 */
export function sortServices(services: Service[]): Service[] {
  return [...services].sort((a, b) => {
    const statusAPriority = STATUS_CONFIGS.find(s => s.id === a.status)?.priority ?? 999;
    const statusBPriority = STATUS_CONFIGS.find(s => s.id === b.status)?.priority ?? 999;
    
    if (statusAPriority !== statusBPriority) {
      return statusAPriority - statusBPriority;
    }
    
    return a.name.localeCompare(b.name);
  });
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export {
  CATEGORIES,
  STATUS_CONFIGS,
  SERVICES,
};
