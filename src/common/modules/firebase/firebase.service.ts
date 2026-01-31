import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private readonly logger = new Logger(FirebaseService.name);
    private authorized = false;

    constructor(private readonly configService: ConfigService) { }

    onModuleInit() {
        try {
            const projectId = this.configService.get<string>('firebase.projectId');
            const privateKey = this.configService.get<string>('firebase.privateKey');
            const clientEmail = this.configService.get<string>('firebase.clientEmail');

            if (projectId && privateKey && clientEmail) {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        privateKey,
                        clientEmail,
                    }),
                });
                this.authorized = true;
                this.logger.log('Firebase Admin initialized successfully');
            } else {
                this.logger.warn('Firebase credentials not found. FCM will be disabled.');
            }
        } catch (error) {
            this.logger.error(`Failed to initialize Firebase: ${error.message}`);
        }
    }

    async sendToDevice(token: string, title: string, body: string, data?: any) {
        if (!this.authorized) return;

        try {
            await admin.messaging().send({
                token,
                notification: {
                    title,
                    body,
                },
                data: this.flattenData(data),
            });
        } catch (error) {
            this.logger.error(`FCM Send Error: ${error.message}`);
        }
    }

    async sendToMultipleDevices(tokens: string[], title: string, body: string, data?: any) {
        if (!this.authorized || tokens.length === 0) return;

        try {
            const response = await admin.messaging().sendEachForMulticast({
                tokens,
                notification: {
                    title,
                    body,
                },
                data: this.flattenData(data),
            });

            if (response.failureCount > 0) {
                const failedTokens: string[] = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx]);
                    }
                });
            }
        } catch (error) {
            this.logger.error(`FCM Multicast Error: ${error.message}`);
        }
    }

    private flattenData(data: any): Record<string, string> {
        if (!data) return {};
        const result = {};
        for (const key in data) {
            if (typeof data[key] === 'object') {
                result[key] = JSON.stringify(data[key]);
            } else {
                result[key] = String(data[key]);
            }
        }
        return result;
    }
}
