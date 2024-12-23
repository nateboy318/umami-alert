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

        // Check if response is JSON
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
        // Fetch all required data with error handling
        const [stats, pageviews, browsers, devices, cities] = await Promise.all([
            // Get stats
            fetchWithValidation<UmamiStats>(`${baseUrl}/stats?startAt=${startDate.getTime()}&endAt=${endDate.getTime()}`),
            // Get pageviews
            fetchWithValidation<UmamiMetrics[]>(`${baseUrl}/metrics?type=url&startAt=${startDate.getTime()}&endAt=${endDate.getTime()}&limit=10`),
            // Get browsers
            fetchWithValidation<UmamiMetrics[]>(`${baseUrl}/metrics?type=browser&startAt=${startDate.getTime()}&endAt=${endDate.getTime()}&limit=5`),
            // Get devices
            fetchWithValidation<UmamiMetrics[]>(`${baseUrl}/metrics?type=device&startAt=${startDate.getTime()}&endAt=${endDate.getTime()}&limit=5`),
            // Get cities
            fetchWithValidation<UmamiMetrics[]>(`${baseUrl}/metrics?type=city&startAt=${startDate.getTime()}&endAt=${endDate.getTime()}&limit=5`)
        ]);

        return {
            stats: {
                pageviews: { value: stats.pageviews.value, prev: 0 },
                visitors: { value: stats.visitors.value, prev: 0 },
                visits: { value: stats.visits.value, prev: 0 },
                bounces: { value: stats.bounces.value, prev: 0 },
                totaltime: { value: stats.totaltime.value, prev: 0 },
                dueCount: 0
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