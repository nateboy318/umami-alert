// lib/types/umami.ts
export interface UmamiMetrics {
    type: string;
    x: string;
    y: number;
}

export interface UmamiStats {
    pageviews: { value: number };
    visitors: { value: number };
    visits: { value: number };
    bounces: { value: number };
    totaltime: { value: number };
}

export interface AnalyticsData {
    stats: {
        pageviews: { value: number; prev: number };
        visitors: { value: number; prev: number };
        visits: { value: number; prev: number };
        bounces: { value: number; prev: number };
        totaltime: { value: number; prev: number };
        dueCount: number;
    };
    topPages: UmamiMetrics[];
    topReferrers: UmamiMetrics[];
    browsers: UmamiMetrics[];
    devices: UmamiMetrics[];
    cities: UmamiMetrics[];  // Changed from countries to cities
}