# Technology Documentation

## Technologies Used

### Core Framework

- **Babylon.js 7.0+**: 3D game engine and rendering library
  - Provides complete game engine with scene management, input handling, physics, GUI
  - Built-in camera controllers (ArcRotateCamera for tower defense)
  - Excellent mobile optimization and touch support
  - First-class TypeScript support

- **TypeScript 5.x**: Type-safe JavaScript superset
  - Static typing for better code quality
  - Enhanced IDE support with IntelliSense
  - Catch errors at compile time

### Build Tools

- **Vite 5.x**: Build tool and development server
  - Fast HMR (Hot Module Replacement) for rapid development
  - Optimized production builds with Rollup
  - Native TypeScript support
  - Excellent PWA integration

- **vite-plugin-pwa**: PWA support for Vite
  - Automatic service worker generation using Workbox
  - Asset precaching and runtime caching
  - Offline support

### State Management

- **Zustand** (Primary choice): Lightweight state management
  - Simple API with minimal boilerplate
  - TypeScript support
  - DevTools integration
  - No context provider needed

- **Pinia** (Alternative): Vue ecosystem state management
  - Consider if using Vue components alongside Babylon.js

### Testing

- **Vitest**: Unit testing framework (Vite-native)
  - Fast test execution
  - Jest-compatible API
  - TypeScript support

- **Playwright**: End-to-end testing
  - Cross-browser testing
  - Mobile device testing
  - PWA testing support

### Code Quality

- **ESLint**: JavaScript/TypeScript linting
  - Enforce code style
  - Catch common errors
  - TypeScript-specific rules

- **Prettier**: Code formatting
  - Consistent code style
  - Automatic formatting on save

## Development Setup

### Prerequisites

- **Node.js**: 18.x or higher (LTS recommended)
- **npm**: 9.x or higher (comes with Node.js)
- **Git**: For version control

### Installation Commands

```bash
# Initialize project (when ready to start development)
npm create vite@latest . -- --template vanilla-ts

# Install Babylon.js and dependencies
npm install @babylonjs/core @babylonjs/gui @babylonjs/loaders

# Install PWA plugin
npm install vite-plugin-pwa workbox-window

# Install state management
npm install zustand

# Install development dependencies
npm install -D @types/node

# Install testing tools
npm install -D vitest @vitest/ui
npm install -D @playwright/test

# Install code quality tools
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

### Project Structure Initialization

```bash
# Create directory structure
mkdir -p src/{config,scenes,systems,entities,ui,managers,utils,types}
mkdir -p public/assets
mkdir -p tests/{unit,integration}
```

### Configuration Files

#### package.json
```json
{
  "name": "server-survival",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "dependencies": {
    "@babylonjs/core": "^7.0.0",
    "@babylonjs/gui": "^7.0.0",
    "@babylonjs/loaders": "^7.0.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@playwright/test": "^1.40.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/parser": "^6.15.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "prettier": "^3.1.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.0.0"
  }
}
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Server Survival',
        short_name: 'ServerSurvival',
        description: 'Tower defense game that teaches cloud architecture',
        theme_color: '#1e2327',
        background_color: '#1e2327',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    open: true
  }
});
```

#### .eslintrc.json
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

#### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## Technical Constraints

### Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **WebGL2**: Required for 3D rendering
- **WebGPU**: Optional (future support)

### Performance Targets

- **Frame Rate**: 60 FPS on most devices
- **Initial Load**: < 3 seconds on 4G connection
- **Bundle Size**: < 2MB (gzipped)
- **Memory Usage**: < 200MB on mobile devices

### Device Constraints

- **Minimum Screen**: 320px width (mobile portrait)
- **Touch Support**: Required for mobile devices
- **Storage**: 50MB+ for IndexedDB (game saves, cached assets)

## Dependencies

### Runtime Dependencies

```json
{
  "@babylonjs/core": "^7.0.0",
  "@babylonjs/gui": "^7.0.0",
  "@babylonjs/loaders": "^7.0.0",
  "zustand": "^4.4.0"
}
```

### Development Dependencies

```json
{
  "vite": "^5.0.0",
  "vite-plugin-pwa": "^0.17.0",
  "typescript": "^5.3.0",
  "vitest": "^1.0.0",
  "@vitest/ui": "^1.0.0",
  "@playwright/test": "^1.40.0",
  "eslint": "^8.55.0",
  "@typescript-eslint/eslint-plugin": "^6.15.0",
  "@typescript-eslint/parser": "^6.15.0",
  "prettier": "^3.1.0",
  "eslint-config-prettier": "^9.1.0",
  "eslint-plugin-prettier": "^5.0.0",
  "@types/node": "^20.10.0",
  "@types/estree": "^1.0.8"
}
```

## Implemented Systems

### EventBus (Type-Safe Event System)

**Location**: [`src/utils/EventBus.ts`](src/utils/EventBus.ts)

The EventBus provides decoupled communication between all game systems using a type-safe event emitter pattern.

**Supported Events**:
- `traffic-processed`: Emitted when traffic is successfully processed
- `traffic-leaked`: Emitted when traffic reaches the destination (failure)
- `service-selected`: Emitted when a service is selected
- `service-placed`: Emitted when a new service is placed
- `service-upgraded`: Emitted when a service is upgraded
- `service-failed`: Emitted when a service fails (health reaches 0)
- `wave-started`: Emitted when a new wave begins
- `wave-completed`: Emitted when a wave completes
- `game-over`: Emitted when game ends
- `budget-changed`: Emitted when budget changes
- `reputation-changed`: Emitted when reputation changes
- `event-triggered`: Emitted when a random event occurs
- `event-ended`: Emitted when a random event ends

**Usage Pattern**:
```typescript
// Subscribe to events
eventBus.on('traffic-processed', ({ type, reward }) => {
  console.log(`Processed ${type}, earned $${reward}`);
});

// Emit events
eventBus.emit('traffic-processed', {
  type: TrafficType.STATIC,
  reward: 5
});
```

### GridSystem (Grid Management & Pathfinding)

**Location**: [`src/utils/GridSystem.ts`](src/utils/GridSystem.ts)

The GridSystem manages the game grid for service placement and traffic pathfinding.

**Key Features**:
- Grid-based world coordinate conversion
- Service placement validation
- A* pathfinding algorithm for traffic movement
- Entity range detection
- Cell occupation management

**Configuration**:
- Cell size: 2 units
- Default grid: 10x10 cells (20x20 world units)
- 4-directional movement (up, down, left, right)

### Core Game Systems

All systems follow a consistent pattern with:
- Constructor taking dependencies (Scene, GridSystem, etc.)
- `update(deltaTime: number)` method called each frame
- Event subscriptions via EventBus
- `dispose()` method for cleanup

**TrafficSystem** ([`src/systems/TrafficSystem.ts`](src/systems/TrafficSystem.ts)):
- Spawns traffic entities based on RPS (requests per second)
- Manages traffic mix ratios (static, read, write, upload, search, malicious)
- Moves traffic along A* paths
- Handles traffic leaks (reaching destination)
- Responds to wave and random events

**ServiceSystem** ([`src/systems/ServiceSystem.ts`](src/systems/ServiceSystem.ts)):
- Places services on the grid
- Manages service upgrades (3 levels per service type)
- Attacks traffic in range
- Creates range indicator meshes
- Handles service selection

**EconomySystem** ([`src/systems/EconomySystem.ts`](src/systems/EconomySystem.ts)):
- Manages budget and reputation
- Processes rewards from traffic
- Handles game over conditions
- Tracks game statistics
- Processes upkeep costs

**WaveSystem** ([`src/systems/WaveSystem.ts`](src/systems/WaveSystem.ts)):
- Manages wave progression
- Calculates RPS acceleration (×1.3 at 1min → ×4.0 at 10min)
- Triggers random events
- Tracks game time

**HealthSystem** ([`src/systems/HealthSystem.ts`](src/systems/HealthSystem.ts)):
- Manages service health
- Applies degradation over time
- Handles service repairs
- Triggers service failures

**EventSystem** ([`src/systems/EventSystem.ts`](src/systems/EventSystem.ts)):
- Manages random event timing
- Triggers events (traffic surge, DDoS, degradation, budget bonus)
- Manages event durations

### Configuration Files

**Game Config** ([`src/config/game.config.ts`](src/config/game.config.ts)):
- Game mode configurations (Survival, Sandbox)
- Wave progression formulas
- Random event definitions

**Services Config** ([`src/config/services.config.ts`](src/config/services.config.ts)):
- 6 service types: Firewall, CDN, Load Balancer, Cache, Database, Auto Scaler
- 3 upgrade levels per service
- Cost, range, damage, attack speed, health, upkeep values

**Traffic Config** ([`src/config/traffic.config.ts`](src/config/traffic.config.ts)):
- 6 traffic types: Static, Read, Write, Upload, Search, Malicious
- Health, speed, reward, damage values
- Default traffic mix ratios

## Tool Usage Patterns

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```
   - Opens browser at http://localhost:3000
   - Enables HMR for rapid iteration
   - TypeScript errors shown in terminal

2. **Build for Production**
   ```bash
   npm run build
   ```
   - Compiles TypeScript
   - Bundles with Vite
   - Generates PWA assets
   - Outputs to `dist/` directory

3. **Preview Production Build**
   ```bash
   npm run preview
   ```
   - Serves production build locally
   - Tests PWA functionality

4. **Run Tests**
   ```bash
   npm run test           # Run unit tests
   npm run test:ui        # Run tests with UI
   npm run test:e2e       # Run E2E tests
   ```

5. **Code Quality**
   ```bash
   npm run lint           # Check for linting errors
   npm run format         # Format code with Prettier
   ```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Stage and commit changes
git add .
git commit -m "feat: add feature description"

# Push to remote
git push origin feature/feature-name

# Create pull request
```

### PWA Testing

1. **Test Service Worker**
   - Open DevTools → Application → Service Workers
   - Verify service worker is registered
   - Test offline mode (Network tab → Offline)

2. **Test Installability**
   - Open DevTools → Application → Manifest
   - Verify manifest is valid
   - Check install prompt appears

3. **Test Caching**
   - Load app once to cache assets
   - Go offline
   - Reload page and verify functionality

### Performance Profiling

1. **Frame Rate**
   - Open DevTools → Performance
   - Record gameplay session
   - Check FPS and frame times

2. **Memory**
   - Open DevTools → Memory
   - Take heap snapshots
   - Check for memory leaks

3. **Network**
   - Open DevTools → Network
   - Monitor asset loading
   - Check cache hits/misses

## Asset Management

### Asset Types

- **3D Models**: glTF/GLB format (preferred for Babylon.js)
- **Textures**: PNG/JPG/WebP (WebP for compression)
- **Audio**: MP3/OGG (OGG for better compression)
- **Fonts**: WOFF2 (modern browsers)

### Asset Loading Strategy

1. **Critical Assets**: Load immediately on boot
   - UI textures
   - Basic meshes
   - Core sounds

2. **Lazy Loading**: Load on demand
   - Game-specific models
   - Background music
   - Particle textures

3. **Caching**: Use service worker for offline
   - Precache all critical assets
   - Runtime cache for dynamic content

### Asset Compression

- **Textures**: Use WebP format (25-35% smaller than PNG)
- **Models**: Use glTF with Draco compression
- **Audio**: Use OGG format (better compression than MP3)
- **Fonts**: Use WOFF2 format (30% smaller than WOFF)

## Environment Variables

Create `.env` file for development:

```env
# API endpoints (if needed)
VITE_API_URL=https://api.example.com

# Feature flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true

# Performance settings
VITE_MAX_ENTITIES=100
VITE_TARGET_FPS=60
```

Create `.env.production` for production:

```env
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
VITE_MAX_ENTITIES=50
VITE_TARGET_FPS=60
```

## Deployment

### Build for Production

```bash
npm run build
```

Output in `dist/` directory:
- `index.html` - Main HTML
- `assets/` - Bundled JavaScript and CSS
- `sw.js` - Service worker
- `manifest.webmanifest` - PWA manifest

### Deployment Platforms

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **GitHub Pages**
   ```bash
   # In package.json
   "homepage": "https://username.github.io/repo-name"
   
   # Build and deploy
   npm run build
   gh-pages -d dist
   ```

### Deployment Checklist

- [ ] Build production bundle
- [ ] Test PWA installability
- [ ] Verify offline functionality
- [ ] Test on mobile devices
- [ ] Check performance metrics
- [ ] Validate service worker
- [ ] Test cross-browser compatibility
