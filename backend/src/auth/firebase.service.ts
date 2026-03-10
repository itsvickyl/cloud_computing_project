import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private firebaseApp: admin.app.App;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');

        try {
            if (!admin.apps.length) {
                let credential;
                if (serviceAccountPath) {
                    credential = admin.credential.cert(serviceAccountPath);
                } else {
                    credential = admin.credential.applicationDefault();
                }

                this.firebaseApp = admin.initializeApp({
                    credential,
                    projectId,
                });
                console.log(`Firebase initialized ${serviceAccountPath ? 'with service account certificate' : 'with applicationDefault'}`);
            } else {
                this.firebaseApp = admin.app();
            }
        } catch (error) {
            console.error('Firebase initialization failed.', error.message);
        }
    }


    async verifyIdToken(idToken: string) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            return decodedToken;
        } catch (error) {
            console.error('Error verifying Firebase ID token:', error);
            throw error;
        }
    }
}
