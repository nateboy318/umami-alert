// app/api/email/route.ts
import { NextResponse } from 'next/server';
import { fetchUmamiData } from '@/lib/services/umami';
import { sendAnalyticsEmail } from '@/lib/services/email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        console.log('Request headers:', Object.fromEntries(request.headers));

        const isCronJob = request.headers.get('user-agent')?.includes('vercel-cron');
        console.log('Is cron job:', isCronJob);

        const now = new Date();
        let startOfDay: Date;
        let endOfDay: Date;

        if (isCronJob) {
            const yesterday = new Date(now);
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            startOfDay = new Date(Date.UTC(
                yesterday.getUTCFullYear(),
                yesterday.getUTCMonth(),
                yesterday.getUTCDate()
            ));
            endOfDay = new Date(Date.UTC(
                yesterday.getUTCFullYear(),
                yesterday.getUTCMonth(),
                yesterday.getUTCDate(),
                23, 59, 59
            ));
        } else {
            startOfDay = new Date(Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ));
            endOfDay = now;
        }

        console.log('Date range:', {
            startOfDay: startOfDay.toISOString(),
            endOfDay: endOfDay.toISOString()
        });

        const analyticsData = await fetchUmamiData(startOfDay, endOfDay);
        console.log('Analytics data fetched successfully');

        const emailResult = await sendAnalyticsEmail(analyticsData, startOfDay);
        console.log('Email send result:', emailResult);

        return NextResponse.json({
            success: true,
            message: 'Analytics email sent successfully',
            period: {
                start: startOfDay.toISOString(),
                end: endOfDay.toISOString()
            }
        });
    } catch (error) {
        console.error('Detailed error:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            response: error instanceof Response ? await error.text() : undefined
        });

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            details: error instanceof Response ? await error.text() : undefined
        }, { status: 500 });
    }
}