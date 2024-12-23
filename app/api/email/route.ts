// app/api/email/route.ts
import { NextResponse } from 'next/server';
import { fetchUmamiData } from '@/lib/services/umami';
import { sendAnalyticsEmail } from '@/lib/services/email';

export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
    try {
        // Check if this is a cron job request from Vercel
        const isCronJob = request.headers.get('user-agent')?.includes('vercel-cron');

        const now = new Date();
        let startOfDay: Date;
        let endOfDay: Date;

        if (isCronJob) {
            // For cron jobs, get previous day's data
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
            endOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
        } else {
            // For manual runs, get current day's data
            startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endOfDay = now;
        }

        // Fetch analytics data
        const analyticsData = await fetchUmamiData(startOfDay, endOfDay);

        // Send email with analytics data
        await sendAnalyticsEmail(analyticsData, startOfDay);

        return NextResponse.json({
            success: true,
            message: 'Analytics email sent successfully',
            period: {
                start: startOfDay.toISOString(),
                end: endOfDay.toISOString()
            }
        });
    } catch (error) {
        console.error('Error in analytics email route:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({
            success: false,
            error: errorMessage,
        }, { status: 500 });
    }
}