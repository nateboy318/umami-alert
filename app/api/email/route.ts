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

        // Create dates in EST timezone
        const estOffset = -5; // EST offset from UTC (adjust for daylight savings if needed)
        const now = new Date();
        now.setHours(now.getHours() + estOffset); // Convert to EST

        let startOfDay: Date;
        let endOfDay: Date;

        if (isCronJob) {
            // For cron job at midnight EST, get the previous day's data
            startOfDay = new Date(now);
            startOfDay.setDate(startOfDay.getDate() - 1);
            startOfDay.setHours(0, 0, 0, 0);

            endOfDay = new Date(startOfDay);
            endOfDay.setHours(23, 59, 59, 999);
        } else {
            // For manual testing, get current day's data
            startOfDay = new Date(now);
            startOfDay.setHours(0, 0, 0, 0);
            endOfDay = now;
        }

        // Convert back to UTC for API calls
        startOfDay.setHours(startOfDay.getHours() - estOffset);
        endOfDay.setHours(endOfDay.getHours() - estOffset);

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