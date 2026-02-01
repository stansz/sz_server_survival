# Architecture Documentation

## System Architecture

### High-Level Architecture

The application follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────┐
│                   Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   UI Layer   │  │  Game Layer  │  │ State Layer  │  │
│  │  Babylon.GUI │  │  Babylon.js  │  │  Zustand/    │  │
│  │              │  │              │  │  Pinia       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                 3D Rendering Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Scene Manager│  │Camera System │  │Lighting Sys  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Game Systems Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Traffic Sys  │  │ Service Sys  │  │ Economy Sys  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Wave System │  │Health System │  │ Event System │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                     PWA Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │Service Worker│  │Web Manifest  │  │Cache Storage │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                           │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │Local Storage │  │  IndexedDB   │                    │
│  │(Game Saves)  │  │ (Large Data) │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

```
Game Scenes:
├── BootScene (Initial loading)
├── MenuScene (Main menu)
├── GameScene (Main gameplay)
├── PauseScene (Pause menu)
├── GameOverScene (Game over screen)
└── SandboxScene (Sandbox mode)

3D Systems:
├── CameraController (Orbit camera with touch support)
├── LightingManager (3D lighting setup)
├── MeshManager (3D mesh management)
├── MaterialManager (Material system)
└── AnimationManager (Animation system)

Game Systems:
├── TrafficSystem (Enemy spawning and movement)
├── ServiceSystem (Tower/service management)
├── EconomySystem (Budget, reputation, scoring)
├── WaveSystem (Wave management and escalation)
├── HealthSystem (Service health and repairs)
└── EventSystem (Random events)

UI Components:
├── HUD (Heads-up display)
├── BuildMenu (Service selection)
├── StatsPanel (Statistics display)
└── Controls (Touch controls overlay)
```

## Source Code Paths

### Current Directory Structure

```
sz_server_survival/
├── public/
│   ├── index.html          # Main HTML entry point
│   ├── vite.svg          # Vite logo
│   └── assets/           # Static assets (images, models)
├── src/
│   ├── main.ts           # Application entry point (test scene)
│   ├── config/
│   │   ├── game.config.ts      # Game configuration ✅
│   │   ├── services.config.ts  # Service definitions ✅
│   │   └── traffic.config.ts   # Traffic definitions ✅
│   ├── scenes/           # Empty - planned
│   ├── systems/
│   │   ├── TrafficSystem.ts    ✅
│   │   ├── ServiceSystem.ts   ✅
│   │   ├── EconomySystem.ts   ✅
│   │   ├── WaveSystem.ts      ✅
│   │   ├── HealthSystem.ts    ✅
│   │   └── EventSystem.ts    ✅
│   ├── entities/         # Empty - planned
│   ├── ui/              # Empty - planned
│   ├── managers/         # Empty - planned
│   ├── utils/
│   │   ├── EventBus.ts   ✅
│   │   └── GridSystem.ts ✅
│   └── types/
│       ├── game.types.ts     ✅
│       ├── traffic.types.ts  ✅
│       └── service.types.ts ✅
├── tests/
│   ├── unit/            # Empty - planned
│   └── integration/     # Empty - planned
├── .eslintrc.json      # ESLint configuration ✅
├── .gitignore          # Git ignore rules ✅
├── .prettierrc         # Prettier configuration ✅
├── index.html          # HTML entry point ✅
├── package.json        # NPM configuration ✅
├── tsconfig.json       # TypeScript configuration ✅
├── vite.config.ts     # Vite configuration ✅
└── README.md          # Project documentation ✅
```

## Key Technical Decisions

### 1. Framework: Babylon.js 7.0+

**Rationale**:
- Complete 3D game engine with built-in systems (scene, input, physics, GUI)
- Superior mobile optimization and touch support
- Rich documentation and active community
- First-class TypeScript support
- Built-in camera controllers perfect for tower defense

**Trade-off**: Larger bundle size (~800KB) compared to Three.js (~600KB), but offset by reduced development time and built-in features.

### 2. Build Tool: Vite

**Rationale**:
- Fast development server with HMR
- Optimized production builds
- Native TypeScript support
- Excellent PWA integration via vite-plugin-pwa

### 3. State Management: Zustand or Pinia

**Rationale**:
- Lightweight and performant
- Simple API
- TypeScript support
- DevTools integration

### 4. Camera: ArcRotateCamera

**Rationale**:
- Perfect for tower defense games (orbit around center)
- Built-in touch support (pinch zoom, pan)
- Configurable limits (min/max zoom, rotation angles)
- Responsive to screen size changes

### 5. PWA Strategy: Workbox + vite-plugin-pwa

**Rationale**:
- Automatic service worker generation
- Precaching of critical assets
- Runtime caching for dynamic content
- Offline-first approach

## Design Patterns

### 1. Scene-Based Architecture

Each game state is a separate scene (Boot, Menu, Game, Pause, GameOver, Sandbox). This provides:
- Clear separation of concerns
- Easy state management
- Reusable scene components

### 2. Entity-Component-System (ECS) Pattern

Game entities (Traffic, Services, Particles) use ECS for:
- Flexible composition
- Efficient updates
- Easy serialization

### 3. Observer Pattern

Systems observe and react to events:
- TrafficSystem spawns enemies
- EconomySystem processes rewards
- HealthSystem manages service degradation

### 4. Singleton Pattern

Managers use singleton pattern:
- CameraController (single camera)
- AudioManager (single audio context)
- SaveManager (single save interface)

### 5. Factory Pattern

Entity creation uses factory pattern:
- TrafficEntityFactory creates traffic instances
- ServiceEntityFactory creates service instances

## Component Relationships

### Core Game Loop

```
main.ts
  └─> GameScene (planned)
      ├─> CameraController (planned)
      ├─> InputManager (planned)
      ├─> TrafficSystem ✅
      │   └─> TrafficEntity[] (planned)
      ├─> ServiceSystem ✅
      │   └─> ServiceEntity[] (planned)
      ├─> EconomySystem ✅
      ├─> WaveSystem ✅
      ├─> HealthSystem ✅
      └─> EventSystem ✅
```

### Data Flow

```
Input (Touch/Mouse/Keyboard) - planned
  └─> InputManager (planned)
      └─> CameraController (camera movement) - planned
      └─> ServiceSystem (placement, selection) ✅
      └─> HUD (UI updates) - planned

Game Loop (60 FPS) - planned
  ├─> TrafficSystem.update(deltaTime) ✅
  │   └─> TrafficEntity.update(deltaTime) (planned)
  ├─> ServiceSystem.update(deltaTime) ✅
  │   └─> ServiceEntity.update(deltaTime) (planned)
  ├─> EconomySystem.update(deltaTime) ✅
  ├─> WaveSystem.update(deltaTime) ✅
  ├─> HealthSystem.update(deltaTime) ✅
  └─> EventSystem.update(deltaTime) ✅

State Changes
  └─> EventBus (✅) - Type-safe event system
      ├─> traffic-processed → EconomySystem.addFunds()
      ├─> traffic-leaked → EconomySystem.loseReputation()
      ├─> service-placed → EconomySystem.stats.servicesBuilt++
      ├─> service-failed → HealthSystem.unregisterService()
      ├─> wave-started → TrafficSystem.setRps()
      ├─> event-triggered → All systems handle event
      └─> game-over → Transition to GameOverScene (planned)
```

## Critical Implementation Paths

### 1. Scene Initialization Path

```
BootScene
  └─> Load assets (textures, models, sounds)
  └─> Initialize managers (Audio, PWA)
  └─> Load saved game state (if exists)
  └─> Transition to MenuScene

MenuScene
  └─> Display main menu
  └─> Handle mode selection (Survival/Sandbox)
  └─> Transition to GameScene/SandboxScene
```

### 2. Game Loop Path

```
GameScene
  └─> Initialize systems (Traffic, Service, Economy, Wave, Health, Event)
  └─> Start game loop
      └─> Update all systems with deltaTime
      └─> Render scene
      └─> Update UI
      └─> Check game over conditions
```

### 3. PWA Installation Path

```
PWAInstaller
  └─> Detect installability
  └─> Show install prompt
  └─> Handle install event
  └─> Register service worker
      └─> Cache critical assets
      └─> Enable offline mode
```

### 4. Save/Load Path

```
SaveManager
  ├─> Save Game
  │   └─> Serialize game state
  │   └─> Store in IndexedDB
  └─> Load Game
      └─> Retrieve from IndexedDB
      └─> Deserialize game state
      └─> Restore scene
```

## Performance Considerations

### 3D Rendering Optimizations

- **Object Pooling**: Reuse traffic and particle entities
- **Instanced Mesh**: Use instancing for multiple identical services
- **LOD (Level of Detail)**: Reduce mesh detail when zoomed out
- **Frustum Culling**: Only render visible objects
- **Texture Atlases**: Combine small textures into single atlas

### Game Loop Optimizations

- **Delta Time**: Use deltaTime for frame-rate independent updates
- **Spatial Partitioning**: Use grid-based collision detection
- **Event Batching**: Batch UI updates to reduce DOM manipulation
- **RequestAnimationFrame**: Use browser's animation frame

### Memory Management

- **Asset Unloading**: Unload unused assets when switching scenes
- **Garbage Collection**: Minimize object creation in game loop
- **Texture Compression**: Use compressed texture formats (WebP, etc.)
- **Lazy Loading**: Load assets on demand

## Responsive Design Strategy

### Breakpoints

- **Mobile Portrait**: 320-428px width
- **Mobile Landscape**: 480-896px width
- **Tablet**: 768-1024px width
- **Desktop**: 1024px+ width

### Adaptive Camera

- **Mobile Portrait**: More top-down view (beta = π/4)
- **Mobile Landscape**: Isometric view (beta = π/3)
- **Desktop/Tablet**: Standard isometric view (beta = π/3)

### Touch Controls

- **Single Tap**: Select service/traffic
- **Double Tap**: Quick action (upgrade)
- **Pinch**: Zoom in/out
- **Two-Finger Pan**: Move camera
- **Swipe**: Rotate camera (optional)
