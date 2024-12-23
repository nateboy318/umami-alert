import React from 'react';
import { Html, Head, Body, Container, Text } from '@react-email/components';

// Refined interfaces with more explicit typing
interface StatValue {
  value: number;
  prev: number;
}

interface TopLocation {
  x: string;
  y: number;
}

interface DailyEmailStats {
  pageviews: StatValue;
  visitors: StatValue;
  visits: StatValue;
  bounces: StatValue;
  totaltime: StatValue;
  eventCount: number;
}

interface DailyEmailData {
  stats: DailyEmailStats;
  topPages: TopLocation[];
  cities: TopLocation[];
}

interface DailyEmailProps {
  data: DailyEmailData;
  startDate: Date;
  mode?: 'dark' | 'light';
}

// Explicitly define style types to avoid 'as const' assertions
interface EmailStyles {
  body: React.CSSProperties;
  container: React.CSSProperties;
  title: React.CSSProperties;
  date: React.CSSProperties;
  statsTable: React.CSSProperties;
  statCell: React.CSSProperties;
  cardTitle: React.CSSProperties;
  cardValue: React.CSSProperties;
  sectionTitle: React.CSSProperties;
  locationTable: React.CSSProperties;
  locationRow: React.CSSProperties;
  locationName: React.CSSProperties;
  locationValue: React.CSSProperties;
  badge: React.CSSProperties;
  dueCountCell: React.CSSProperties;
}

const createStyles = (mode: 'dark' | 'light'): EmailStyles => {
  const isDark = mode === 'dark';
  return {
    body: {
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      margin: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    container: {
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: isDark ? '#1e293b' : '#f4f4f4',
      padding: '20px 0'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      margin: '0',
      padding: '20px 0 8px',
      color: isDark ? '#ffffff' : '#000000'
    },
    date: {
      fontSize: '14px',
      textAlign: 'center',
      color: isDark ? '#94a3b8' : '#666666',
      margin: '0',
      paddingBottom: '24px'
    },
    statsTable: {
      width: '100%',
      borderSpacing: '8px',
      borderCollapse: 'separate',
      padding: '0 8px',
      marginBottom: '16px'
    },
    statCell: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: '8px',
      padding: '12px',
      textAlign: 'center',
      width: '50%'
    },
    cardTitle: {
      fontSize: '12px',
      color: isDark ? '#94a3b8' : '#666666',
      margin: '0 0 4px 0',
      fontWeight: '500',
      textTransform: 'uppercase'
    },
    cardValue: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
      margin: '0'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
      padding: '24px 16px 12px',
      margin: '0'
    },
    locationTable: {
      width: 'calc(100% - 32px)',
      margin: '0 16px 16px',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: '8px',
      borderSpacing: '0',
      borderCollapse: 'separate'
    },
    locationRow: {
      borderBottom: isDark 
        ? '1px solid rgba(255, 255, 255, 0.1)' 
        : '1px solid rgba(0, 0, 0, 0.1)'
    },
    locationName: {
      fontSize: '13px',
      color: isDark ? '#ffffff' : '#000000',
      padding: '12px 16px'
    },
    locationValue: {
      fontSize: '13px',
      color: isDark ? '#10172A' : '#000000',
      padding: '8px 16px',
      textAlign: 'right'
    },
    badge: {
      backgroundColor: isDark ? '#ffffff' : '#e0e0e0',
      borderRadius: '6px',
      padding: '4px 8px',
      display: 'inline-block'
    },
    dueCountCell: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
      gridColumn: 'span 2',
      marginTop: '8px'
    }
  };
};

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const DailyEmail: React.FC<DailyEmailProps> = ({ 
  data, 
  startDate, 
  mode = 'light' 
}) => {
  const styles = createStyles(mode as 'dark' | 'light');
  const { stats, cities } = data;
  
  console.log('Email Template Data:', {
    stats,
    eventCount: stats.eventCount,
    fullData: data
  });
  
  const limitedCities = cities.slice(0, 5);

  return (
    <Html>
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.title}>🍥 Umami Alert</Text>
          <Text style={styles.date}>{startDate.toLocaleDateString()}</Text>

          <table style={styles.statsTable}>
            <tbody>
              <tr>
                <td style={styles.statCell}>
                  <Text style={styles.cardTitle}>Views</Text>
                  <Text style={styles.cardValue}>
                    {stats.pageviews.value.toLocaleString()} 👁️
                  </Text>
                </td>
                <td style={styles.statCell}>
                  <Text style={styles.cardTitle}>Visitors</Text>
                  <Text style={styles.cardValue}>
                    {stats.visitors.value.toLocaleString()} 👤
                  </Text>
                </td>
              </tr>
              <tr>
                <td style={styles.statCell}>
                  <Text style={styles.cardTitle}>Time</Text>
                  <Text style={styles.cardValue}>
                    ⌛ {formatTime(stats.totaltime.value)}
                  </Text>
                </td>
                <td style={styles.statCell}>
                  <Text style={styles.cardTitle}>Events</Text>
                  <Text style={styles.cardValue}>
                    {stats.eventCount} 📊
                  </Text>
                </td>
              </tr>
            </tbody>
          </table>

          <Text style={styles.sectionTitle}>📍 Top Locations</Text>
          <table style={styles.locationTable}>
            <tbody>
            {limitedCities.map((country, index) => (
                <tr 
                    key={`${country.x || 'unknown'}-${index}`} 
                    style={index < limitedCities.length - 1 ? styles.locationRow : {}}
                >
                    <td style={styles.locationName}>{country.x || 'Unknown'}</td>
                    <td style={styles.locationValue}>
                    <span style={styles.badge}>{country.y}</span>
                    </td>
                </tr>
                ))}
            </tbody>
          </table>
        </Container>
      </Body>
    </Html>
  );
};