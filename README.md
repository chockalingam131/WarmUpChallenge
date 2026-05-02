# Team Collaborator 🤝

Team Collaborator is a real-time coordination platform designed for modern teams. Built with **Next.js** and **Firebase**, it provides a zero-friction workspace where team members can manage tasks, discuss projects in-place, and publish cross-team announcements through a public notice board.

## 🚀 Features

- **Real-Time Task Management**: Shared task board with live updates (polling) for immediate visibility.
- **Dynamic Task Assignment**: Delegate tasks to any team member via email directly from the dashboard.
- **In-Context Discussion**: Integrated comment threads on every task for context-rich collaboration.
- **Public Notice Board**: Publish and view team-wide announcements and updates.
- **Secure Cloud Storage**: Powered by Google Firebase Firestore for reliable, global data persistence.
- **Premium Design**: Modern Glassmorphism UI built with Vanilla CSS for high performance and premium aesthetics.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: JavaScript / React
- **Database**: Google Firebase Firestore
- **Styling**: Vanilla CSS (Premium Aesthetics)
- **Deployment**: Vercel

## ⚙️ Setup & Deployment

### Environment Variables
The following environment variables are required for deployment (e.g., in Vercel):

- `FIREBASE_SERVICE_ACCOUNT_BASE64`: Your Firebase Service Account JSON, encoded in Base64 for security.

### Local Development
1. Clone the repository.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access the app at `http://localhost:3000`

---
*Created as part of the Antigravity Pro Coordination Platform challenge.*
