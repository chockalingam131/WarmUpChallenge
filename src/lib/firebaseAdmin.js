import admin from 'firebase-admin';

let initError = null;

if (!admin.apps.length) {
    try {
        const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

        if (!base64) {
            initError = 'FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set. Please add it in Vercel → Settings → Environment Variables.';
            console.error(initError);
        } else {
            const serviceAccountStr = Buffer.from(base64, 'base64').toString('utf8');
            const serviceAccount = JSON.parse(serviceAccountStr);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin initialized successfully.');
        }
    } catch (error) {
        initError = `Firebase Admin initialization failed: ${error.message}`;
        console.error(initError, error.stack);
    }
}

/** Firestore db instance, or null if initialization failed */
export const db = admin.apps.length ? admin.firestore() : null;

/** Human-readable initialization error, if any */
export const firebaseInitError = initError;
