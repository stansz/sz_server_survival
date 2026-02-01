# 🖥️ Server Survival

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Babylon.js](https://img.shields.io/badge/Babylon.js-7.x-red.svg)](https://www.babylonjs.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)

> An educational tower defense game that teaches cloud architecture concepts through interactive 3D gameplay

[🎮 Play Now](#installation) • [📖 Documentation](#documentation) • [🐛 Report Bug](../../issues) • [✨ Request Feature](../../issues)

---

## 🤖 AI/Vibe Coded Project

> **Note**: This project is primarily developed using AI-assisted coding tools for educational purposes. It serves as a demonstration of how modern agentic coding can help build applications. 


## 🎯 Overview

**Server Survival** is a modern Progressive Web App (PWA) tower defense game that teaches cloud architecture concepts through interactive 3D gameplay.

### 🎮 Original Game

This project is a modern rebuild inspired by the original **Server Survival** created by [Pavlo Shenok](https://github.com/pshenok):
- 📎 Original Repository: [pshenok/server-survival](https://github.com/pshenok/server-survival)
- 🙏 Special thanks to the original author for creating the concept and gameplay mechanics

### Why This Rebuild?

The original game successfully demonstrated that complex infrastructure concepts can be made accessible through gamification. This rebuild focuses on:

- 🎓 **Educational**: Learn cloud architecture concepts while playing
- 📱 **Mobile-First**: Optimized for touch devices with responsive design
- 🔌 **Offline Ready**: Full PWA support - play anywhere, anytime
- ⚡ **High Performance**: 60 FPS gameplay on most devices
- 🎮 **Cross-Platform**: Consistent experience across mobile, tablet, and desktop

---

## 🚀 Features

### Core Gameplay
- **🏗️ Build Phase**: Place defensive services (Firewall, CDN, Load Balancer, etc.) on a 3D grid
- **🌊 Traffic Phase**: Handle various traffic types (Static, Read, Write, Upload, Search, Malicious)
- **⚔️ Defense Phase**: Process legitimate traffic and block attacks
- **📊 Survival Phase**: Manage resources while traffic escalates

### Game Modes

#### 🏃 Survival Mode
The ultimate challenge - survive as long as possible:
- Traffic acceleration (×1.3 at 1min → ×4.0 at 10min)
- Random events every 15-45 seconds
- Traffic pattern shifts every 40 seconds
- DDoS spikes every 45 seconds
- Service degradation requiring repairs

#### 🧪 Sandbox Mode
Experiment and learn at your own pace:
- Set custom starting budget
- Control traffic rate (0-100+ RPS)
- Adjust traffic mix percentages
- Spawn instant traffic bursts
- Enable/disable upkeep costs
- No game over - experiment freely

### Resources & Mechanics

| Resource | Description |
|----------|-------------|
| 💰 **Budget ($)** | Earned by processing requests, spent on building/upgrading |
| ⭐ **Reputation (%)** | Lost when requests fail or attacks leak through |
| 🔧 **Service Health** | Services degrade under load and require repairs |

### Game Over Conditions
- ❌ Reputation hits 0%
- 💸 Budget drops below -$1000 (bankruptcy)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Babylon.js 7.0+](https://www.babylonjs.com/) | 3D game engine and rendering |
| [TypeScript 5.x](https://www.typescriptlang.org/) | Type-safe development |
| [Vite 5.x](https://vitejs.dev/) | Build tool and dev server |
| [Zustand](https://github.com/pmndrs/zustand) | State management |
| [Vitest](https://vitest.dev/) | Unit testing |
| [Playwright](https://playwright.dev/) | E2E testing |

---

## 📦 Installation

### Prerequisites
- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **npm**: 9.x or higher (included with Node.js)
- **Git**: For version control

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/sz_server_survival.git
cd sz_server_survival

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000`

### Available Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Lint code with ESLint
npm run format       # Format code with Prettier
```

---

## 🎮 How to Play

### Basic Controls

| Action | Desktop | Mobile |
|--------|---------|--------|
| Select Service | Click | Tap |
| Build/Place | Left Click | Tap |
| Rotate Camera | Right Click + Drag | Two-finger Rotate |
| Zoom | Scroll | Pinch |
| Pan | Middle Click + Drag | Two-finger Pan |
| Quick Upgrade | Double Click | Double Tap |

### Getting Started

1. **Start a Game**: Choose Survival or Sandbox mode from the main menu
2. **Build Defenses**: Select a service from the build menu and place it on the grid
3. **Manage Resources**: Keep an eye on your budget and reputation
4. **Survive Waves**: Handle increasing traffic and random events
5. **Upgrade & Repair**: Maintain your services to keep them effective

### Traffic Types

| Type | Description | Strategy |
|------|-------------|----------|
| 📄 Static | Standard web requests | Basic defense |
| 📖 Read | Database read operations | Fast processing |
| ✍️ Write | Database write operations | Secure storage |
| 📤 Upload | File upload requests | Bandwidth management |
| 🔍 Search | Search queries | Query optimization |
| 🦠 Malicious | Attacks and threats | Firewall protection |

---

## 📊 Project Status

| Phase | Status |
|-------|--------|
| Planning | ✅ Complete |
| Development Setup | ⏳ Not Started |
| Core 3D Systems | ⏳ Not Started |
| Game Mechanics | ⏳ Not Started |
| UI/HUD | ⏳ Not Started |
| PWA Features | ⏳ Not Started |
| Testing | ⏳ Not Started |
| Deployment | ⏳ Not Started |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   UI Layer   │  │  Game Layer  │  │ State Layer  │  │
│  │  Babylon.GUI │  │  Babylon.js  │  │   Zustand    │  │
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
│  │  Wave System │  │Health System │  │ Event System │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

For detailed architecture documentation, see:
- [3D Architecture Plan](plans/architecture-plan-3d.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (enforced by ESLint and Prettier)
- Write tests for new features
- Update documentation for API changes
- Ensure PWA functionality remains intact

---

## 📝 Documentation

- [Product Documentation](.kilocode/rules/memory-bank/product.md) - Project goals and user experience
- [Architecture Documentation](.kilocode/rules/memory-bank/architecture.md) - System design and patterns
- [Technology Stack](.kilocode/rules/memory-bank/tech.md) - Tech details and setup

---

## 🙏 Acknowledgments

### Original Game
This project is inspired by and based on the original **Server Survival** concept:
- **Pavlo Shenok** ([@pshenok](https://github.com/pshenok)) - Original game creator
- Original Repository: [github.com/pshenok/server-survival](https://github.com/pshenok/server-survival)
- All credit for the original gameplay mechanics, cloud infrastructure concepts, and game design goes to the original author

### AI Development Tools
This project was developed with the assistance of modern AI coding tools:
- **Kilo Code** - AI-powered development environment and code generation platform that provided intelligent code completion, refactoring suggestions, and architectural guidance throughout the development process
- **zAI's GLM 4.7** - Large language model used for code generation, documentation, problem-solving, and implementation guidance across all aspects of the project

These tools helped accelerate development while maintaining code quality, following best practices, and ensuring comprehensive documentation. The human developer provided creative direction, architectural decisions, and oversight throughout the process.

### Tools & Technologies
- [Babylon.js](https://www.babylonjs.com/) team for the amazing 3D engine
- [Vite](https://vitejs.dev/) team for the lightning-fast build tool
- [Zustand](https://github.com/pmndrs/zustand) team for simple state management

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🚧 Disclaimer

This project is currently in the planning phase. The game is not yet playable. Star ⭐ and watch 👀 this repository to stay updated on development progress!

---

<p align="center">
  Made with ❤️ for cloud education
</p>
