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

    async function fetchWithValidation<T>(url: string): Promise<T> {
        const response = await fetch(url, { headers });

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            const text = await response.text();
            console.error('Unexpected response type:', contentType);
            console.error('Response body:', text);
            throw new Error(`Unexpected response type: ${contentType}. Body: ${text.substring(0, 200)}...`);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    try {
        // Get the start of the year for due date events
        const startOfYear = new Date(startDate.getFullYear(), 0, 1);

        const [stats, pageviews, browsers, devices, cities, dueEvents] = await Promise.all([
            // Previous API calls remain the same
            fetchWithValidation<UmamiStats>(`${baseUrl}/stats?startAt=${startDate.getTime()}&endAt=${endDate.getTime()}`),
            fetchWithValidation<UmamiMetrics[]>(`${baseUrl}/metrics?type=url&startAt=${startDate.getTime()}&endAt=${endDate.getTime()}&limit=10`),
            fetchWithValidation<UmamiMetrics[]>(`${baseUrl}/metrics?type=browser&startAt=${startDate.getTime()}&endAt=${endDate.getTime()}&limit=5`),
            fetchWithValidation<UmamiMetrics[]>(`${baseUrl}/metrics?type=device&startAt=${startDate.getTime()}&endAt=${endDate.getTime()}&limit=5`),
            fetchWithValidation<UmamiMetrics[]>(`${baseUrl}/metrics?type=city&startAt=${startDate.getTime()}&endAt=${endDate.getTime()}&limit=5`),
            // New API call for due-date-added events
            fetchWithValidation<{ count: number }>(`${baseUrl}/events?startAt=${startOfYear.getTime()}&endAt=${endDate.getTime()}&query=due-date-added`)
        ]);

        return {
            stats: {
                pageviews: { value: stats.pageviews.value, prev: 0 },
                visitors: { value: stats.visitors.value, prev: 0 },
                visits: { value: stats.visits.value, prev: 0 },
                bounces: { value: stats.bounces.value, prev: 0 },
                totaltime: { value: stats.totaltime.value, prev: 0 },
                dueCount: dueEvents.count
            },
            topPages: pageviews,
            topReferrers: [],
            browsers,
            devices,
            cities
        };
    } catch (error) {
        console.error('Error fetching Umami data:', error);
        throw error;
    }
}