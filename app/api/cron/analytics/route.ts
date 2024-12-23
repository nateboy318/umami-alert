import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Interfaces for type safety
interface UmamiStats {
    pageviews: { value: number };
    visitors: { value: number };
    visits: { value: number };
    bounces: { value: number };
    totaltime: { value: number };
}

interface UmamiSession {
    city?: string;
    visits: number;
}

interface UmamiEvent {
    eventName?: string;
}

interface TopEvent {
    event: string;
    count: number;
}

interface TopCity {
    city: string;
    visits: number;
}

export async function GET() {
    try {
        const headers = new Headers({
            'x-umami-api-key': process.env.UMAMI_API_KEY || '',
            'Accept': 'application/json'
        });

        const websiteId = process.env.UMAMI_WEBSITE_ID || '';
        const baseUrl = `https://api.umami.is/v1/websites/${websiteId}`;

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = now;

        console.log('Request Parameters:');
        console.log('Start Time:', startOfDay.toISOString());
        console.log('End Time:', endOfDay.toISOString());

        const [stats, sessions, dueDateEvents] = await Promise.all([
            fetch(`${baseUrl}/stats?startAt=${startOfDay.getTime()}&endAt=${endOfDay.getTime()}`, {
                headers
            }).then(res => res.json() as Promise<UmamiStats>),
            fetch(`${baseUrl}/sessions?startAt=${startOfDay.getTime()}&endAt=${endOfDay.getTime()}&pageSize=100`, {
                headers
            }).then(res => res.json() as Promise<{ data: UmamiSession[] }>),
            fetch(`${baseUrl}/events?startAt=${startOfDay.getTime()}&endAt=${endOfDay.getTime()}&query=due-date-added`, {
                headers
            }).then(res => res.json() as Promise<{ data?: UmamiEvent[]; count?: number }>)
        ]);

        console.log('Raw Stats:', JSON.stringify(stats, null, 2));
        console.log('Raw Sessions:', JSON.stringify(sessions, null, 2));
        console.log('Parsed Events Response:', JSON.stringify(dueDateEvents, null, 2));

        // Ensure events is an array
        const events = Array.isArray(dueDateEvents.data)
            ? dueDateEvents.data
            : (dueDateEvents.data || []);

        console.log('Processed Events:', JSON.stringify(events, null, 2));

        // Debug event counting
        const dueCount = dueDateEvents.count || 0;

        console.log('Total due-date-added count:', dueCount);

        const eventCounts: Record<string, number> = events.reduce((acc, event) => {
            if (event.eventName) {
                acc[event.eventName] = (acc[event.eventName] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const topEvents: TopEvent[] = Object.entries(eventCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, count]) => ({ event: name, count }));

        const cityCounts: Record<string, number> = sessions.data.reduce((acc, session) => {
            if (session.city) {
                acc[session.city] = (acc[session.city] || 0) + session.visits;
            }
            return acc;
        }, {} as Record<string, number>);

        const topCities: TopCity[] = Object.entries(cityCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([city, visits]) => ({ city, visits }));

        const formatTime = (seconds: number) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        };


        // Calculate bounce rate safely
        const bounceRate = stats.visits.value > 0
            ? ((stats.bounces.value / stats.visits.value) * 100).toFixed(1)
            : '0.0';

        // Return the data without sending email
        return NextResponse.json({
            success: true,
            analytics: {
                general: {
                    pageViews: stats.pageviews.value,
                    uniqueVisitors: stats.visitors.value,
                    totalVisits: stats.visits.value,
                    bounceRate: `${bounceRate}%`,
                    timeOnSite: formatTime(stats.totaltime.value),
                    dueCount: dueCount,
                    eventCounts: eventCounts
                },
                topLocations: topCities,
                popularEvents: topEvents,
                period: {
                    start: startOfDay.toLocaleString(),
                    end: endOfDay.toLocaleString()
                }
            }
        });

    } catch (error: unknown) {
        const errorName = error instanceof Error ? error.name : 'Unknown Error';
        const errorMessage = error instanceof Error
            ? error.message
            : 'An unknown error occurred';
        const errorStack = error instanceof Error ? error.stack : undefined;

        console.error('Comprehensive Error Logging:');
        console.error('Error Name:', errorName);
        console.error('Error Message:', errorMessage);
        console.error('Error Stack:', errorStack);

        return NextResponse.json({
            success: false,
            error: {
                name: errorName,
                message: errorMessage,
                stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
            }
        }, { status: 500 });
    }
}