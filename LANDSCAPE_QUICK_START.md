# 🚀 Landscape Page - Quick Start Guide

Get your professional openDesk Edu Service Landscape page up and running in minutes!

---

## ⚡ Quick Setup

### 1. Copy the Files

Copy these files to your opendesk-edu-website project:

```bash
# Components
cp /path/to/LandscapeVisualization.tsx src/components/Landscape/

# Pages
cp /path/to/page.tsx src/app/[locale]/landscape/
cp /path/to/landscape.css src/app/[locale]/landscape/

# Configuration
cp /path/to/landscape-config.ts src/lib/

# Documentation
cp /path/to/LANDSCAPE_PAGE_GUIDE.md docs/
cp /path/to/LANDSCAPE_PAGE_SUMMARY.md .
```

### 2. Install Dependencies

```bash
npm install framer-motion@^11.0.0
```

### 3. Add Navigation Link

Update your navigation configuration to include the Landscape page:

```typescript
// In your navigation config
export const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Landscape', href: '/landscape' },
  { name: 'Blog', href: '/blog' },
  // ... other links
];
```

### 4. Add Translations

Add the Landscape translations to your message files:

```json
// In messages/en.json (and de.json, fr.json, zh.json)
{
  "Landscape": {
    "title": "Service Landscape - openDesk Edu",
    "description": "Explore the complete openDesk Edu service landscape",
    "pageTitle": "Service Landscape"
  }
}
```

### 5. Test It Out

```bash
npm run dev
# Visit: http://localhost:3000/en/landscape
```

✅ **Done!** Your landscape page is now live!

---

## 🎨 Customization Quick Reference

### Add a New Service

```typescript
// In src/lib/landscape-config.ts
// Add to the SERVICES array:
{
  id: 'my-service',
  name: 'My Service',
  category: 'platform',  // or: education, collaboration, infrastructure, security
  status: 'Production',  // or: Beta, Development, Deprecated
  version: '1.0.0',
  description: 'Full description of my service',
  shortDescription: 'Brief description',
  tags: ['tag1', 'tag2'],
  icon: '🎯',
  logo: '/icons/my-service.svg',
  links: {
    homepage: 'https://my-service.com',
    documentation: 'https://docs.my-service.com',
    repository: 'https://github.com/my-org/my-service'
  },
  maturity: 80,        // 0-100
  popularity: 70,      // 0-100
  lastUpdated: '2026-07-25',
  isNew: true,         // Shows "NEW" badge
  isFeatured: true     // Highlighted in the UI
}
```

### Add a New Category

```typescript
// In src/lib/landscape-config.ts
// Add to the CATEGORIES array:
{
  id: 'analytics',
  name: 'Analytics & BI',
  color: '#06B6D4',    // Teal color
  icon: '📊',
  description: 'Business intelligence and analytics tools'
}
```

### Change Colors

```typescript
// In src/lib/landscape-config.ts
// Update an existing category color:
{
  id: 'platform',
  name: 'Core Platform',
  color: '#NEW_HEX_COLOR',  // Change to your preferred color
  // ...
}
```

---

## 📋 Common Tasks

### Update a Service Version

```typescript
// Find the service in SERVICES array and update:
{
  id: 'moodle',
  name: 'Moodle',
  version: '4.5.0',  // Update version here
  // ...
}
```

### Mark Service as Featured

```typescript
{
  id: 'keycloak',
  name: 'Keycloak',
  isFeatured: true,  // This will highlight the service
  // ...
}
```

### Mark Service as New

```typescript
{
  id: 'new-service',
  name: 'New Service',
  isNew: true,  // This will show "NEW" badge
  // ...
}
```

### Change Service Status

```typescript
{
  id: 'jupyterhub',
  name: 'JupyterHub',
  status: 'Production',  // Change from Beta to Production
  // ...
}
```

### Update Last Updated Date

```typescript
{
  id: 'stalwart',
  name: 'Stalwart',
  lastUpdated: '2026-07-25',  // ISO date string
  // ...
}
```

---

## 🎯 Configuration Reference

### Service Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `name` | string | ✅ | Display name |
| `category` | string | ✅ | Category ID (platform, education, etc.) |
| `status` | string | ✅ | Production, Beta, Development, or Deprecated |
| `version` | string | ❌ | Current version |
| `description` | string | ✅ | Full description |
| `shortDescription` | string | ❌ | Brief description for cards |
| `tags` | string[] | ✅ | Technology tags |
| `icon` | string | ❌ | Emoji icon |
| `logo` | string | ❌ | Path to logo SVG |
| `links` | object | ❌ | External links (homepage, docs, repo) |
| `dependsOn` | string[] | ❌ | IDs of required services |
| `maturity` | number | ❌ | 0-100 maturity level |
| `popularity` | number | ❌ | 0-100 popularity score |
| `lastUpdated` | string | ❌ | ISO date string |
| `isNew` | boolean | ❌ | Show "NEW" badge |
| `isFeatured` | boolean | ❌ | Highlight in UI |

### Category Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✅ | Unique identifier |
| `name` | string | ✅ | Display name |
| `color` | string | ✅ | Hex color code |
| `icon` | string | ✅ | Emoji icon |
| `description` | string | ✅ | Category description |

---

## 🔧 Troubleshooting

### Services Not Appearng

**Problem**: New services aren't showing up in the landscape.

**Solution**:
1. Check that the service is in the `SERVICES` array
2. Verify the `category` matches an existing category ID
3. Ensure the `status` matches an existing status ID
4. Check for JavaScript errors in browser console
5. Restart the development server

### Colors Not Updating

**Problem**: Category colors aren't changing after update.

**Solution**:
1. Verify the color is in hex format (#RRGGBB)
2. Check that the category ID is spelled correctly
3. Clear browser cache or use incognito mode
4. Restart the development server

### Search Not Working

**Problem**: Search function isn't finding services.

**Solution**:
1. Check for JavaScript errors in console
2. Verify search query is being passed to `searchQuery` state
3. Ensure services have proper names and descriptions
4. Check that `useMemo` dependencies are correct

### Animations Not Working

**Problem**: No animations on the page.

**Solution**:
1. Check if Framer Motion is installed (`npm list framer-motion`)
2. Verify user doesn't have `prefers-reduced-motion: reduce` enabled
3. Check DevTools for CSS issues
4. Ensure components are properly imported

---

## 📊 Quick Stats

### Total Services by Default
- **Platform**: 9 services
- **Education**: 5 services
- **Collaboration**: 6 services
- **Infrastructure**: 9 services
- **Security**: 4 services
- **Total**: 38 services

### Status Distribution
- **Production**: 28 services
- **Beta**: 10 services
- **Development**: 0 services (in initial config)
- **Deprecated**: 0 services (in initial config)

---

## 🎨 Design Tokens

### Colors
```css
/* Primary */
--accent: #571EFA;
--accent-button: #341291;

/* Categories */
--category-platform: #571EFA;
--category-education: #A78BFA;
--category-collaboration: #DDD6FE;
--category-infrastructure: #8B5CF6;
--category-security: #EC4899;

/* Status */
--status-production: #22c55e;
--status-beta: #f59e0b;
--status-development: #a855f7;
--status-deprecated: #ef4444;
```

### Spacing
| Token | Value | Usage |
|-------|-------|-------|
| xs | 0.25rem | Small spacing |
| sm | 0.5rem | Padding |
| md | 1rem | Medium spacing |
| lg | 1.5rem | Large spacing |
| xl | 2rem | Extra large |
| 2xl | 3rem | Section spacing |

### Typography
| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| h1 | 3rem | 800 | Page titles |
| h2 | 2.25rem | 700 | Section titles |
| h3 | 1.5rem | 600 | Card titles |
| body | 1rem | 400 | Body text |
| small | 0.875rem | 400 | Secondary text |
| xs | 0.75rem | 500 | Badges, tags |

---

## 💡 Pro Tips

### 1. Use Short Service IDs
Use kebab-case for IDs (e.g., `jupyter-hub` instead of `jupyterhub123`)

### 2. Keep Descriptions Concise
- `description`: 1-2 sentences for modal
- `shortDescription`: 5-8 words for card

### 3. Limit Tags
Aim for 2-4 relevant tags per service. Too many tags clutter the UI.

### 4. Use Emoji for Icons
Choose emoji that are:
- Recognizable at small sizes
- Semantically appropriate
- Consistent across platforms

### 5. Set Maturity Appropriately
- 80-100: Production-ready
- 60-79: Beta/stable
- 40-59: Development
- 0-39: Early/experimental

### 6. Feature Key Services
Mark 5-10 most important services as `isFeatured: true`

### 7. Update Regularly
- Update versions when new releases come out
- Mark new integrations as `isNew: true`
- Change status from Beta to Production when stable

---

## 🌍 Language Support

The landscape page supports all languages configured in your site:

```bash
# Check available languages
ls messages/*.json

# en.json - English ✅
# de.json - German ⬜ Needs translation
# fr.json - French ⬜ Needs translation
# zh.json - Chinese ⬜ Needs translation
```

To add translations, copy the English translations and translate:

```json
{
  "Landscape": {
    "title": "Service Landscape - openDesk Edu",
    "description": "Explore the complete openDesk Edu service landscape",
    "pageTitle": "Service Landscape",
    // ... translate all other keys
  }
}
```

---

## 📈 Performance Tips

### 1. Use useMemo
Memoize expensive calculations:

```typescript
const filteredServices = useMemo(() => {
  return services.filter(...);
}, [services, filter]);
```

### 2. Lazy Load Components
Use Next.js dynamic imports:

```typescript
const LandscapeVisualization = dynamic(
  () => import('@/components/Landscape/LandscapeVisualization'),
  { loading: () => <p>Loading...</p> }
);
```

### 3. Optimize Images
Use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src={service.logo}
  alt={service.name}
  width={40}
  height={40}
  className="rounded"
/>
```

### 4. Reduce Bundle Size
- Use only necessary Framer Motion features
- Tree-shake unused code
- Optimize SVG logos

---

## 🎓 Best Practices

### 1. Semantic HTML
```typescript
// ✅ Good
<article className="service-card">
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</article>

// ❌ Avoid
<div className="service-card">
  <div>...</div>
  <div>...</div>
  <div>...</div>
</div>
```

### 2. Accessibility
```typescript
// ✅ Good
<button
  onClick={handleClick}
  aria-label="Close modal"
  className="close-button"
>
  ×
</button>

// ❌ Avoid
<button onClick={handleClick}>×</button>
```

### 3. Error Handling
```typescript
// ✅ Good
const category = CATEGORIES.find(c => c.id === service.category) || 
                 CATEGORIES[0]; // Fallback

// ❌ Avoid
const category = CATEGORIES.find(c => c.id === service.category);
// category might be undefined!
```

### 4. Type Safety
```typescript
// ✅ Good
interface Service {
  id: string;
  name: string;
  // ...
}

// ❌ Avoid
const service = { id: '1', name: 'Service' }; // No type!
```

---

## 📚 Additional Resources

### Documentation
- [Implementation Guide](./docs/LANDSCAPE_PAGE_GUIDE.md) - Detailed technical documentation
- [Full Summary](./LANDSCAPE_PAGE_SUMMARY.md) - Complete feature overview

### External Resources
- [Framer Motion Docs](https://www.framer.com/motion/) - Animation library
- [Next.js Docs](https://nextjs.org/docs) - React framework
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Styling
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility

### Inspiration
- [CNCF Landscape](https://landscape.cncf.io) - Original concept inspiration
- [Awesome Selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) - Service categorization ideas

---

## ✅ Checklist

Before going to production:

- [ ] All services configured in `landscape-config.ts`
- [ ] Categories properly defined with colors and icons
- [ ] Translations added for all supported languages
- [ ] Navigation link added to main menu
- [ ] Tested on mobile, tablet, and desktop
- [ ] Tested with screen reader (NVDA, VoiceOver)
- [ ] Tested with keyboard navigation
- [ ] Verified reduced motion support
- [ ] Performance tested (Lighthouse score > 90)
- [ ] SEO metadata verified
- [ ] Analytics integration confirmed

---

## 🚀 Ready to Launch?

Once everything is configured and tested:

```bash
# Build production version
npm run build

# Start production server
npm run start

# Or deploy to Vercel/Netlify
npm run deploy
```

Your professional, interactive openDesk Edu Service Landscape will be available at:

**`https://opendesk-edu.org/landscape`**

---

## 🙌 Need Help?

1. **Check the docs**: Review this file and the implementation guide
2. **Browser console**: Look for JavaScript errors
3. **GitHub Issues**: Open an issue with details about your problem
4. **Community**: Ask in the openDesk discussions

---

**Last Updated**: July 25, 2026  
**Version**: 1.0.0  
**Maintainer**: openDesk Edu Team
