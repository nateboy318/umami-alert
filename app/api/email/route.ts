import { NextResponse } from 'next/server';
import { fetchUmamiData } from '@/lib/services/umami';
import { sendAnalyticsEmail } from '@/lib/services/email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        console.log('Request headers:', Object.fromEntries(request.headers));

        const isCronJob = request.headers.get('user-agent')?.includes('vercel-cron');
        console.log('Is cron job:', isCronJob);

        // Calculate exactly 24 hours ago from current time
        const now = new Date();
        const past24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));

        console.log('Date range:', {
            start: past24Hours.toISOString(),
            end: now.toISOString()
        });

        const analyticsData = await fetchUmamiData();
        console.log('Analytics data fetched successfully');

        const emailResult = await sendAnalyticsEmail(analyticsData, past24Hours);
        console.log('Email send result:', emailResult);

        return NextResponse.json({
            success: true,
            message: 'Analytics email sent successfully',
            period: {
                start: past24Hours.toISOString(),
                end: now.toISOString()
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