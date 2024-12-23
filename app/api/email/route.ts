// app/api/email/route.ts
import { NextResponse } from 'next/server';
import { fetchUmamiData } from '@/lib/services/umami';
import { sendAnalyticsEmail } from '@/lib/services/email';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Set up date range for today
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = now;

        // Fetch analytics data
        const analyticsData = await fetchUmamiData(startOfDay, endOfDay);

        // Send email with analytics data
        await sendAnalyticsEmail(analyticsData, startOfDay);

        return NextResponse.json({
            success: true,
            message: 'Analytics email sent successfully',
        });
    } catch (error) {
        // Enhanced error logging
        console.error('Error in analytics email route:', error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        return NextResponse.json({
            success: false,
            error: errorMessage,
        }, { status: 500 });
    }
}