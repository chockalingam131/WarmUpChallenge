# Vercel Deployment & Secret Management

Since you cannot (and should not) commit your `credentials.json` to GitHub for security reasons, you must use Vercel's Environment Variables to inject your Service Account securely.

## Step 1: Base64 Encode Your Service Account
Vercel environment variables do not handle multi-line JSON files well. The safest and most robust way to inject a JSON file is to encode it into a single Base64 string.

**On Mac/Linux:**
```bash
base64 -i credentials.json | pbcopy
```
*(This copies the encoded string to your clipboard)*

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("credentials.json")) | clip
```

## Step 2: Configure Vercel Environment Variables
1. Go to your project on the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on **Settings** > **Environment Variables**.
3. Add the following keys:
   - `FIREBASE_SERVICE_ACCOUNT_BASE64` : *(Paste your copied Base64 string here)*
   - `NEXTAUTH_URL` : `https://your-deployment-url.vercel.app`
   - `NEXTAUTH_SECRET` : *(Generate a random string, e.g., using `openssl rand -base64 32`)*
   - `GOOGLE_CLIENT_ID` : *(From your Google Cloud Setup)*
   - `GOOGLE_CLIENT_SECRET` : *(From your Google Cloud Setup)*

## Step 3: Deployment
1. Connect your GitHub repository to Vercel.
2. Vercel will automatically detect that it is a Next.js project.
3. Click **Deploy**. Vercel will build the app and start using your secure environment variables!

---

*Note on how the code reads this:*
In the backend code, we decode this variable on the fly during server initialization:
```javascript
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('ascii'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
```
