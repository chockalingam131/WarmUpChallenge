# Google Cloud & Firebase Setup Guide

To run Antigravity Pro with meaningful Google Service integrations, you need a Google Cloud Project with Firebase and OAuth 2.0 configured.

## 1. Firebase Project Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and create a new project.
3. Once created, go to **Build > Firestore Database** from the left menu and click **Create database**.
   - Choose **Start in test mode** for now.
   - Choose a location close to you.
4. Go to **Project Overview** (top left gear icon) > **Project settings** > **Service accounts**.
5. Click **Generate new private key** and download the JSON file. 
6. **IMPORTANT**: Keep this `credentials.json` file safe. Do NOT commit it to GitHub. We will use it for Vercel deployment.

## 2. Google OAuth 2.0 Setup (For Sign-In)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your newly created Firebase project from the top dropdown.
3. Navigate to **APIs & Services > OAuth consent screen**.
   - Choose **External** (or Internal if you have a Google Workspace) and click **Create**.
   - Fill in the required fields (App name, User support email, Developer contact email).
   - Click **Save and Continue** through the Scopes and Test users screens.
4. Navigate to **APIs & Services > Credentials**.
5. Click **+ Create Credentials > OAuth client ID**.
6. Application type: **Web application**.
7. Name: Antigravity Pro Web.
8. Authorized JavaScript origins:
   - `http://localhost:3000` (for local testing)
   - `https://your-vercel-domain.vercel.app` (you will add this later after deployment)
9. Authorized redirect URIs:
   - Leave empty for now, or add `http://localhost:3000/api/auth/callback/google` if using NextAuth.
10. Click **Create**. You will get a **Client ID** and **Client Secret**. Save these!

## 3. Enable Google Calendar API (Optional)
To use the calendar integration:
1. In the Google Cloud Console, go to **APIs & Services > Library**.
2. Search for **Google Calendar API** and click **Enable**.
