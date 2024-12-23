// lib/services/umami.ts
import { config } from '@/lib/config/env';
import { AnalyticsData, UmamiMetrics, UmamiStats } from '@/lib/types/umami';

export async function fetchUmamiData(startDate: Date, endDate: Date): Promise<AnalyticsData> {
    const apiKey = config.UMAMI_API_KEY;
    const websiteId = config.WEBSITE_ID;

    if (!apiKey) {
        throw new Error('Missing required environment variable: UMAMI_API_KEY');
    }

    if (!websiteId) {
        throw new Error('Missing required environment variable: WEBSITE_ID');
    }

    const headers = new Headers({
        'x-umami-api-key': apiKey,
        'Accept': 'application/json'
    });

    const baseUrl = `${config.UMAMI_API_URL}/v1/websites/${websiteId}`;

    // Fetch all required data
    const [stats, pageviews, browsers, devices, countries] = await Promise.all([
        // Get stats
        fetch(`${baseUrl}/stats?startAt=${startDate.getTime()}&endAt=${endDate.getTime()}`, {
            headers
        }).then(res => res.json()) as Promise<UmamiStats>,

        // Get pageviews
        fetch(`${baseUrl}/metrics?type=url&startAt=${startDate.getTime()}&endAt=${endDate.getTime()}&limit=10`, {
            headers
        }).then(res => res.json()) as Promise<UmamiMetrics[]>,

        // Get browsers
        fetch(`${baseUrl}/metrics?type=browser&startAt=${startDate.getTime()}&endAt=${endDate.getTime()}&limit=5`, {
            headers
        }).then(res => res.json()) as Promise<UmamiMetrics[]>,

        // Get devices
        fetch(`${baseUrl}/metrics?type=device&startAt=${startDate.getTime()}&endAt=${endDate.getTime()}&limit=5`, {
            headers
        }).then(res => res.json()) as Promise<UmamiMetrics[]>,

        // Get countries
        fetch(`${baseUrl}/metrics?type=city&startAt=${startDate.getTime()}&endAt=${endOfDay.getTime()}&limit=5`, {
            headers
        }).then(res => res.json()) as Promise<UmamiMetrics[]>,
    ]);

    return {
        stats: {
            pageviews: { value: stats.pageviews.value, prev: 0 },
            visitors: { value: stats.visitors.value, prev: 0 },
            visits: { value: stats.visits.value, prev: 0 },
            bounces: { value: stats.bounces.value, prev: 0 },
            totaltime: { value: stats.totaltime.value, prev: 0 },
            dueCount: 0 // You might want to fetch this separately or calculate it
        },
        topPages: pageviews,
        topReferrers: [],
        browsers,
        devices,
        countries
    };
}