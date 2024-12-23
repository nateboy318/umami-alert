// lib/services/email.ts
import { Resend, CreateEmailResponse } from 'resend';
import { DailyEmail } from '@/lib/templates/daily';
import { config } from '@/lib/config/env';
import { AnalyticsData } from '@/lib/types/umami';
import React from 'react';

const resend = new Resend(config.RESEND_API_KEY);

export async function sendAnalyticsEmail(
    data: AnalyticsData,
    startDate: Date
): Promise<CreateEmailResponse> {
    if (!config.FROM_EMAIL || !config.RECIPIENT_EMAIL) {
        throw new Error('Missing required email configuration');
    }

    try {
        console.log('Preparing email with data:', {
            date: startDate.toISOString(),
            stats: data.stats
        });

        const emailComponent = DailyEmail({
            data,
            startDate
        }) as React.ReactElement;

        const result = await resend.emails.send({
            from: config.FROM_EMAIL,
            to: config.RECIPIENT_EMAIL,
            subject: `Daily Analytics Report: ${startDate.toLocaleDateString()}`,
            react: emailComponent,
        });

        console.log('Email sent successfully:', result);
        return result;
    } catch (error) {
        console.error('Failed to send analytics email:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
    }
}