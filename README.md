# 💸 MoneyMind

MoneyMind is a premium personal finance dashboard built with **Angular 20** and **Tailwind CSS v4**. It helps users track financial goals, manage recurring reminders, and maintain a "Health Score" through gamified elements like streaks and achievements.

## ✨ Core Features

- **📊 Financial Health Dashboard**: Real-time health score calculation based on your habits.
- **🔔 Smart Reminders**: Track one-off and recurring payments (daily, weekly, monthly, yearly).
- **🎯 Goal Tracking**: Visual progress bars for your long-term savings and financial goals.
- **⚡ Gamification**: 
  - **Streaks**: Keep your financial consistency alive.
  - **Achievements**: Unlock badges as you hit milestones.
  - **XP & Levels**: Gain experience points by completing tasks.
- **🛒 Reward Shop**: Use your earned XP to buy "Streak Freezes" and other items.
- **⚙️ Integrated Settings**: Manage your application state and reset data easily.
- **📱 Responsive & Premium UI**: Built with modern design principles (Glassmorphism, HSL-tailored colors, and smooth micro-animations).

## 🛠 Tech Stack

- **Framework**: [Angular 20](https://angular.dev/) (Standalone Components, Signals)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first configuration)
- **Icons**: [Lucide Angular](https://lucide.dev/)
- **State Management**: Reactive signals-based `StoreService` with LocalStorage persistence.
- **SSR**: Server-Side Rendering enabled for improved performance and SEO.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm

### Installation

```bash
git clone https://github.com/femisowems/moneymind-angular20-webapp.git
cd moneymind-angular20-webapp
npm install
```

### Development Server

The development environment uses `concurrently` to run the Tailwind v4 compiler in parallel with the Angular dev server.

To start the local development server, run:

```bash
npm start
```

Once the server is running, navigate to `http://localhost:4200/`.

### Building

To create a production build with pre-compiled CSS:

```bash
npm run build
```

The artifacts will be stored in the `dist/moneymind-angular20-webapp` directory.

## 🏛 Architecture

- **Standalone Components**: All UI components are standalone for maximum modularity.
- **Signal-based Store**: Centralized state management using Angular Signals for efficient, fine-grained reactivity.
- **Tailwind CLI Integration**: Custom build pipeline to ensure Tailwind v4 expansion in the absence of native Angular builder support.
- **Platform-Aware**: Components are SSR-safe with platform guards for browser-specific APIs (Document, LocalStorage).

---
Built with ❤️ by the MoneyMind Team.
