# Product Documentation

## Why This Project Exists

**Server Survival** is an educational tower defense game that teaches cloud architecture concepts through interactive gameplay. The original game (https://github.com/stansz/server-survival) successfully demonstrated that complex infrastructure concepts can be made accessible through gamification.

### Problem Statement

- **Complexity Barrier**: Cloud infrastructure concepts are abstract and difficult for beginners to grasp
- **Limited Accessibility**: The original game is desktop-focused and not optimized for mobile devices
- **No Offline Support**: Requires internet connection to play
- **Limited Reach**: Not installable as a native app on mobile devices

### Solution

Rebuild Server Survival as a modern Progressive Web App (PWA) that:
- Works seamlessly on mobile and desktop browsers
- Can be installed as a native-like app
- Supports offline gameplay
- Maintains the 3D visual style and core mechanics
- Optimizes performance for touch-first mobile interactions

## How It Works

### Core Gameplay Loop

1. **Build Phase**: Players place defensive services (Firewall, CDN, Load Balancer, etc.) on a 3D grid
2. **Traffic Phase**: Different traffic types (Static, Read, Write, Upload, Search, Malicious) flow through the infrastructure
3. **Defense Phase**: Services process legitimate traffic and block attacks
4. **Survival Phase**: Players manage resources (Budget, Reputation, Service Health) while traffic escalates

### Resources

- **Budget ($)**: Earned by processing requests, spent on building/upgrading services
- **Reputation (%)**: Lost when requests fail or attacks leak through
- **Service Health**: Services degrade under load and require repairs

### Game Over Conditions

- Reputation hits 0%
- Budget drops below -$1000 (bankruptcy)

## User Experience Goals

### Primary Goals

1. **Educational Value**: Players should understand cloud infrastructure concepts after playing
2. **Engaging Gameplay**: Balance strategy, resource management, and real-time decision making
3. **Accessibility**: Easy to learn, difficult to master
4. **Cross-Platform**: Consistent experience across mobile, tablet, and desktop

### Secondary Goals

1. **Performance**: 60 FPS on most mobile devices
2. **Offline Play**: Full gameplay without internet connection
3. **Installable**: Native app-like installation on supported devices
4. **Responsive UI**: Touch-optimized controls with keyboard shortcuts for desktop

### Target Audience

- **Beginners**: Developers new to cloud infrastructure
- **Students**: Learning distributed systems concepts
- **Professionals**: Refreshing knowledge or teaching others
- **Gamers**: Enjoy tower defense games with educational value

## Game Modes

### Survival Mode

The core experience - survive as long as possible against escalating traffic:
- RPS acceleration (×1.3 at 1min → ×4.0 at 10min)
- Random events every 15-45 seconds
- Traffic pattern shifts every 40 seconds
- DDoS spikes every 45 seconds
- Service degradation requiring repairs

### Sandbox Mode

A customizable testing environment:
- Set any starting budget
- Control traffic rate (0-100+ RPS)
- Adjust traffic mix percentages
- Spawn instant bursts
- Enable/disable upkeep costs
- No game over - experiment freely

## Key Differentiators from Original

1. **Mobile-First Design**: Touch-optimized controls and responsive UI
2. **PWA Capabilities**: Offline support and installability
3. **Modern Tech Stack**: Babylon.js 7.0+, TypeScript, Vite
4. **Enhanced Performance**: Optimized for mobile devices
5. **Better Asset Management**: Efficient loading and caching for offline play
