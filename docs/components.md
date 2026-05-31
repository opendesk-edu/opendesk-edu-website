# Component Reference

This document catalogs all reusable React components in `src/components/`. Components are listed alphabetically with their props, description, and usage patterns.

---

## ArticlePage

Displays a full article (blog post, component page, architecture doc) with breadcrumbs, hero image, metadata, content, and related posts.

**Props:** None (reads post data from parent page via `getPostBySlug`)

**Sub-components integrated:**
- BreadcrumbList structured data (JSON-LD)
- Hero image with `next/image`
- Reading time + date + version badge + author byline
- ShareButtons component
- RelatedPosts component
- BlogPosting structured data (JSON-LD)
- Article meta tags (article:published_time, article:section, article:tag)

**Location:** `src/components/ArticlePage.tsx`

---

## Badges

Renders service status badges (Stable, Beta, Planned) with color-coded styling.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `status` | `"stable" \| "beta" \| "planned"` | Yes | Service maturity level |

**Usage:**
```tsx
<Badges status="stable" />
<Badges status="beta" />
<Badges status="planned" />
```

**Location:** `src/components/Badges.tsx`

---

## ComponentGrid

Displays a categorized grid of component/service cards grouped by category (Communication, Content, Identity, etc.).

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `components` | `ComponentCard[]` | Yes | Array of component data with title, description, category, slug, icon |
| `t` | `(key: string) => string` | Yes | Translation function for category labels |

**Usage:** Used on section listing pages for the `components` section.

**Location:** `src/components/ComponentGrid.tsx`

---

## ContactForm

Modal dialog with contact form fields (name, email, subject, message).

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onClose` | `() => void` | Yes | Callback to close the modal |
| `t` | `(key: string) => string` | Yes | Translation function for form labels |

**States:** idle → submitting → success / error

**Behavior:**
- Validates required fields client-side
- POSTs to `/api/contact`
- Shows success state on 200
- Shows error message on failure

**Location:** `src/components/ContactForm.tsx`

---

## CookieConsent

Privacy-friendly analytics consent banner.

**Props:** None (uses `next-intl` for i18n)

**Behavior:**
- Stores consent state in `localStorage`
- Respects `analytics-auth` middleware
- Conditionally loads analytics scripts after consent

**Location:** `src/components/CookieConsent.tsx`

---

## EmailLink

Renders an email link that's obfuscated from spam bots using ROT13.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | Link text |
| `className` | `string` | No | Additional classes |

**Usage:**
```tsx
<EmailLink className="text-sm">Contact</EmailLink>
```

**Location:** `src/components/EmailLink.tsx`

---

## ErrorBoundary

React error boundary with fallback UI.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | Child components to wrap |

**Location:** `src/components/ErrorBoundary.tsx`

---

## Footer

Site footer with subscribe section, navigation links, RSS/Matrix/Contact icons, and copyright.

**Props:** None (reads i18n via `useTranslations` + `useLocale`)

**Sub-components integrated:**
- Newsletter email input (POSTs to `/api/subscribe`)
- ContactForm modal (triggered by "Contact Us" button)
- RSS feed link (locale-aware)
- Matrix room link (matrix.to/#opendesk-edu:matrix.org)
- Imprint, Privacy, Source Code links
- Copyright notice

**Location:** `src/components/Footer.tsx`

---

## Header

Site navigation header with logo, section links, search trigger, language switcher, theme toggle, and mobile menu.

**Props:** None (reads i18n + locale + pathname)

**Features:**
- Responsive (collapses to hamburger menu on mobile)
- Active link highlighting
- Search dialog trigger
- Language switcher dropdown
- Dark/light mode toggle

**Location:** `src/components/Header.tsx`

---

## Icons

SVG icon components for brand assets and service logos.

**Location:** `src/components/Icons.tsx`

---

## LanguageSwitcher

Dropdown to switch between available locales.

**Props:** None

**Behavior:**
- Uses `usePathname()` from `next/navigation` (not `next-intl/navigation`) to get actual URL
- Strips locale prefix and navigates to same path in target locale
- Prevents switching to the current locale

**Location:** `src/components/LanguageSwitcher.tsx`

---

## PostCard

Card component for displaying a post preview in listing pages.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `post` | `Post` | Yes | Post data |
| `locale` | `string` | Yes | Current locale for link generation |

**Displayed fields:**
- Thumbnail image (via `next/image`)
- Title (linked to article)
- Description
- Date + reading time
- Categories as badges
- Version badge (if present)

**Location:** `src/components/PostCard.tsx`

---

## PostList

Paginated, filterable grid of PostCards.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `posts` | `Post[]` | Yes | All posts for the section |
| `locale` | `string` | Yes | Current locale |
| `section` | `string` | Yes | Section slug |

**Features:**
- Tag/category filter chips (clickable pills)
- 10 posts per page
- Previous/Next pagination
- Resets to page 1 on filter change

**Location:** `src/components/PostList.tsx`

---

## RelatedPosts

Displays up to 3 related posts based on shared tags or section.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentPost` | `Post` | Yes | Current article |
| `locale` | `string` | Yes | Current locale |
| `section` | `string` | Yes | Section for fallback matching |

**Matching strategy:** Tag overlap score, with section-based fallback.

**Location:** `src/components/RelatedPosts.tsx`

---

## ScrollToTop

Floating button that appears on scroll to return to top of page.

**Props:** None

**Behavior:**
- Appears after scrolling down 300px
- Smooth scroll to top on click
- Respects `prefers-reduced-motion`

**Location:** `src/components/ScrollToTop.tsx`

---

## SearchContext

React context providing search dialog trigger functionality.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | Child components |

**Exports:** `SearchProvider`, `useSearch` hook

**Location:** `src/components/SearchContext.tsx`

---

## SearchDialog

Full-screen search overlay with live results.

**Props:** None (uses `SearchContext` + `useDebounce`)

**Features:**
- Keyboard shortcut: `⌘K` / `Ctrl+K`
- Keyboard navigation (Arrow keys, Enter, Escape)
- Debounced input (200ms)
- Results grouped by section
- Thumbnail images in results
- "Show all" when more than 5 results per section

**Location:** `src/components/SearchDialog.tsx`

---

## SearchDialogWrapper

Thin wrapper around SearchDialog for conditional rendering.

**Location:** `src/components/SearchDialogWrapper.tsx`

---

## ShareButtons

Article sharing buttons for Copy Link, X (Twitter), LinkedIn, and Matrix.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `url` | `string` | Yes | Full URL of the article |
| `title` | `string` | Yes | Article title |

**Behavior:**
- Copy Link: Copies URL to clipboard with feedback toast
- X, LinkedIn, Matrix: Opens share URL in new tab

**Location:** `src/components/ShareButtons.tsx`

---

## TableOfContents

Renders a sidebar navigation from article heading structure.

**Props:** None (reads content from page context)

**Features:**
- Extracts h2/h3 from rendered article content
- Active heading tracking via IntersectionObserver
- Smooth scroll to heading on click

**Location:** `src/components/TableOfContents.tsx`

---

## ThemeProvider

Manages dark/light theme state with `next-themes`.

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | Child components |

**Location:** `src/components/ThemeProvider.tsx`

---

## Custom Hooks

### useDebounce

**Location:** `src/hooks/useDebounce.ts`

```typescript
function useDebounce<T>(value: T, delayMs: number): T
```

Returns a debounced version of the input value, updating only after `delayMs` of inactivity. Used by `SearchDialog` to avoid excessive API calls.

## Component Dependencies

```
Header → LanguageSwitcher, SearchDialogWrapper, ThemeProvider
Footer → ContactForm
ArticlePage → ShareButtons, RelatedPosts, Badges
PostList → PostCard
SearchDialog → useDebounce hook
```
