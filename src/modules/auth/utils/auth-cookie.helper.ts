import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

@Injectable()
export class AuthCookieHelper {
    setCookies(res: Response, accessToken: string, refreshToken: string, userId?: string) {
        const isProduction = process.env.NODE_ENV === 'production';
        const sevenDays = 7 * 24 * 60 * 60 * 1000;

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: sevenDays,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: sevenDays,
        });

        if (userId) {
            res.cookie('userId', userId, {
                httpOnly: true,
                secure: isProduction,
                sameSite: 'lax',
                maxAge: sevenDays,
            });
        }
    }

    clearCookies(res: Response) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.clearCookie('userId');
    }
}
