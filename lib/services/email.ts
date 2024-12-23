// lib/services/email.ts
import { Resend } from 'resend';
import { DailyEmail } from '@/lib/templates/daily';
import { config } from '@/lib/config/env';
import { AnalyticsData } from '@/lib/types/umami';
import React from 'react';

const resend = new Resend(config.RESEND_API_KEY);

export async function sendAnalyticsEmail(
    data: AnalyticsData,
    startDate: Date
): Promise<void> {
    // Validate required email configurations
    if (!config.FROM_EMAIL || !config.RECIPIENT_EMAIL) {
        throw new Error('Missing required email configuration');
    }

    try {
        // Create the email component
        const emailComponent = DailyEmail({
            data,
            startDate
        }) as React.ReactElement;

        // Send the email
        const result = await resend.emails.send({
            from: config.FROM_EMAIL,
            to: config.RECIPIENT_EMAIL,
            subject: `Daily Analytics Report: ${startDate.toLocaleDateString()}`,
            react: emailComponent,
        });

        // Optional: Log the email send result
        console.log('Email sent successfully:', result);
    } catch (error) {
        // Enhanced error handling
        console.error('Failed to send analytics email:', error);
        throw error;
    }
}