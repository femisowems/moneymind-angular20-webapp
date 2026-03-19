# MoneyMind (PingMyPocket) 💸

**MoneyMind** is a lightweight, quirky, and dynamic financial reminder and habit-tracking web application. The core philosophy behind MoneyMind is to transform boring administrative financial tasks (like paying bills or transferring to savings) into an engaging, behavior-driven experience full of personality.

No accounts, no bank linking, no backends. Everything is instantly available and securely stored directly in your browser.

## ✨ Core Features

*   **⚡ Frictionless Task Management:** Quickly add, manage, and toggle financial reminders. Track amounts, recurring schedules, custom payment URLs, and due dates.
*   **🎉 Dynamic Nudge Engine:** A personalized banner that reacts to your actions based on your current financial health—with customizable tone settings spanning from *Calm* to *Savage*.
*   **🏆 Gamification & Badges:** Keep your motivation high by tracking your consecutive completion streaks, calculating your integrated **Financial Health Score (0-100)**, and unlocking achievement badges for milestones.
*   **📉 Missed Impact Calculator:** Visually tracks the real cost of procrastination by highlighting potential or actual late fees incurred from overdue tasks.
*   **📅 Calendar & List Views:** Seamlessly toggle between a dense list view and an expansive monthly calendar view (powered by `react-day-picker`) to see the bigger picture.
*   **🎨 Custom Categories & Emojis:** Build out personalized categories for your reminders alongside completely customizable color palettes.
*   **🔒 100% Local & Private:** Powered by `localStorage` and Zustand. Your financial data never leaves your device. Includes a robust JSON **Data Backup & Restore** system so you never lose your progress.
*   **🔔 Browser Push Notifications:** Intelligent tab-level notifications alert you to overdue tasks when the app is open.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (with persist middleware)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Dates & Calendar:** `date-fns` & `react-day-picker`

## 📦 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/moneymind-webapp.git
   cd moneymind-webapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the App:** Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```text
src/
├── app/
│   ├── globals.css      # Tailwind v4 configuration and global styles
│   ├── layout.tsx       # Root layout and font configurations
│   └── page.tsx         # Main interactive Dashboard 
├── components/          # React components
│   ├── ui/              # Reusable base elements (Buttons, Cards, Modals, Inputs)
│   ├── AddReminderModal.tsx
│   ├── ReminderDetailsModal.tsx
│   ├── CalendarView.tsx
│   ├── NudgeMessage.tsx
│   └── ...
├── hooks/
│   └── useNotifications.ts # Push notification logic
├── lib/
│   ├── achievements.ts  # Badge definitions and requirements
│   └── utils.ts         # Tailwind merger (`cn`)
├── store/
│   └── useStore.ts      # Global Zustand state and action reducers (Persistence)
└── types/
    └── index.ts         # Core TypeScript interfaces (Reminders, Streaks, Categories)
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/your-username/moneymind-webapp/issues).

## 📄 License
This project is typically open source and available under the [MIT License](LICENSE).
