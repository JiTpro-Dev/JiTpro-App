# JiTpro App — Layout & Styling Consistency Guide

Instructions for matching the JiTpro marketing website layout and styling.

## 1. Scaffold with the same stack

```
npm create vite@latest . -- --template react-ts
npm install react-router-dom lucide-react
npm install -D tailwindcss@^3.4.1 postcss autoprefixer
npx tailwindcss init -p
```

## 2. Tailwind config

`tailwind.config.js` — defaults only, no custom theme extensions:

```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

## 3. Global CSS

Replace `src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  body {
    @apply antialiased;
    font-feature-settings: "kern" 1, "liga" 1;
    text-rendering: optimizeLegibility;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold;
    letter-spacing: -0.02em;
  }
  p { @apply leading-relaxed; }
}
```

## 4. Logo

Copy `jitpro-logo_(1).svg` from the website repo's `public/` folder into this project's `public/` folder. Reference it as:

```tsx
<img src={`${import.meta.env.BASE_URL}jitpro-logo.svg`} alt="JITpro" className="h-12" />
```

## 5. Page shell

Every page should live inside this wrapper:

```tsx
<div className="min-h-screen flex flex-col bg-white">
  <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
      {/* Logo left, nav items right */}
    </div>
  </nav>
  <main className="flex-1">
    {/* Page content */}
  </main>
  <footer className="border-t border-slate-200 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Footer content */}
    </div>
  </footer>
</div>
```

## 6. Design tokens

| Element | Classes |
|---|---|
| Container | `max-w-7xl mx-auto px-6` |
| Primary text | `text-slate-900` |
| Secondary text | `text-slate-600` |
| Borders | `border-slate-200` |
| Page bg | `bg-white` |
| Footer bg | `bg-slate-50` |
| Accent highlights | `text-amber-600 bg-amber-50` |
| CTA buttons | `bg-slate-900 text-white px-6 py-2.5 hover:bg-slate-800` |
| Link hover | `text-slate-600 hover:text-slate-900 transition-colors` |
| Nav text | `text-sm font-medium` |
| Section padding | `py-16` |

## 7. Breakpoints

- `lg:` (1024px) — desktop/mobile nav switch
- `md:` (768px) — grid column layouts

## 8. Fonts

No custom fonts — uses system/browser defaults via Tailwind.
