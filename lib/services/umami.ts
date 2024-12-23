import { config } from '@/lib/config/env';
import { UmamiMetrics, UmamiStats } from '@/lib/types/umami';

export async function fetchUmamiData() {
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
        // Calculate exactly 24 hours from now
        const now = new Date();
        const past24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));

        // For previous 24 hour period comparison
        const previous24Hours = new Date(past24Hours.getTime() - (24 * 60 * 60 * 1000));


        // Fetch current period data
        const [currentStats, pageviews, browsers, devices, cities, events] = await Promise.all([
            fetchWithValidation<UmamiStats>(`${baseUrl}/stats?startAt=${past24Hours.getTime()}&endAt=${now.getTime()}`),
            fetchWithValidation<UmamiMetrics[]>(`${baseUrl}/metrics?type=url&startAt=${past24Hours.getTime()}&endAt=${now.getTime()}&limit=10`),
            fetchWithValidation<UmamiMetrics[]>(`${baseUrl}/metrics?type=browser&startAt=${past24Hours.getTime()}&endAt=${now.getTime()}&limit=5`),
            fetchWithValidation<UmamiMetrics[]>(`${baseUrl}/metrics?type=device&startAt=${past24Hours.getTime()}&endAt=${now.getTime()}&limit=5`),
            fetchWithValidation<UmamiMetrics[]>(`${baseUrl}/metrics?type=city&startAt=${past24Hours.getTime()}&endAt=${now.getTime()}&limit=5`),
            fetchWithValidation<{ count: number }>(`${baseUrl}/events?startAt=${past24Hours.getTime()}&endAt=${now.getTime()}`)
        ]);

        // Fetch previous period data for comparison
        const previousStats = await fetchWithValidation<UmamiStats>(
            `${baseUrl}/stats?startAt=${previous24Hours.getTime()}&endAt=${past24Hours.getTime()}`
        );

        return {
            stats: {
                pageviews: {
                    value: currentStats.pageviews.value,
                    prev: previousStats.pageviews.value
                },
                visitors: {
                    value: currentStats.visitors.value,
                    prev: previousStats.visitors.value
                },
                visits: {
                    value: currentStats.visits.value,
                    prev: previousStats.visits.value
                },
                bounces: {
                    value: currentStats.bounces.value,
                    prev: previousStats.bounces.value
                },
                totaltime: {
                    value: currentStats.totaltime.value,
                    prev: previousStats.totaltime.value
                },
                eventCount: events.count
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