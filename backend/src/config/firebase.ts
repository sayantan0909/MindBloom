import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

let serviceAccount: any;

try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (serviceAccountJson) {
        serviceAccount = JSON.parse(serviceAccountJson);
    } else if (serviceAccountPath) {
        const resolvedPath = path.isAbsolute(serviceAccountPath)
            ? serviceAccountPath
            : path.join(__dirname, '../../', serviceAccountPath);

        if (fs.existsSync(resolvedPath)) {
            serviceAccount = require(resolvedPath);
        } else {
            console.warn(`Firebase Service Account file not found at: ${resolvedPath}`);
        }
    }
} catch (error) {
    console.error('Error loading Firebase Service Account:', error);
}

if (!admin.apps.length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin initialized successfully');
    } else {
        console.warn('Firebase Admin NOT initialized. Missing service account credentials.');
    }
}

export const firebaseAdmin = admin;
