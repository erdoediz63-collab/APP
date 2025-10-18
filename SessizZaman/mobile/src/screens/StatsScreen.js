import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import api from '../utils/api';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}s ${minutes}d`;
    }
    return `${minutes}d`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 İstatistikler</Text>

      {/* Bugün */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌞 Bugün</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatDuration(stats?.today?.total_focus_time || 0)}
            </Text>
            <Text style={styles.statLabel}>Toplam Süre</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats?.today?.sessions_count || 0}
            </Text>
            <Text style={styles.statLabel}>Seans</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats?.today?.trees_planted || 0}
            </Text>
            <Text style={styles.statLabel}>Ağaç</Text>
          </View>
        </View>
      </View>

      {/* Bu Hafta */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Bu Hafta</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatDuration(stats?.this_week?.total_focus_time || 0)}
            </Text>
            <Text style={styles.statLabel}>Toplam Süre</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats?.this_week?.sessions_count || 0}
            </Text>
            <Text style={styles.statLabel}>Seans</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats?.this_week?.trees_planted || 0}
            </Text>
            <Text style={styles.statLabel}>Ağaç</Text>
          </View>
        </View>

        {/* Haftalık Grafik */}
        <View style={styles.weeklyChart}>
          {stats?.this_week?.daily_breakdown?.map((day, index) => {
            const maxHeight = 100;
            const maxTime = Math.max(
              ...stats.this_week.daily_breakdown.map((d) => d.total_focus_time),
              1
            );
            const height = (day.total_focus_time / maxTime) * maxHeight;
            const dayName = ['Pzt', 'Şal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][
              index
            ];

            return (
              <View key={index} style={styles.chartBar}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: height || 5,
                      backgroundColor:
                        height > 0 ? '#22c55e' : '#dcfce7',
                    },
                  ]}
                />
                <Text style={styles.chartLabel}>{dayName}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Tüm Zamanlar */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Tüm Zamanlar</Text>
        <View style={styles.allTimeStats}>
          <View style={styles.allTimeItem}>
            <Text style={styles.allTimeEmoji}>⏱️</Text>
            <Text style={styles.allTimeValue}>
              {formatDuration(stats?.all_time?.total_focus_time || 0)}
            </Text>
            <Text style={styles.allTimeLabel}>Toplam Odaklanma</Text>
          </View>

          <View style={styles.allTimeItem}>
            <Text style={styles.allTimeEmoji}>🌳</Text>
            <Text style={styles.allTimeValue}>
              {stats?.all_time?.trees_planted || 0}
            </Text>
            <Text style={styles.allTimeLabel}>Ağaç Yetiştirdin</Text>
          </View>

          <View style={styles.allTimeItem}>
            <Text style={styles.allTimeEmoji}>🔥</Text>
            <Text style={styles.allTimeValue}>
              {stats?.all_time?.current_streak || 0}
            </Text>
            <Text style={styles.allTimeLabel}>Günlük Seri</Text>
          </View>

          <View style={styles.allTimeItem}>
            <Text style={styles.allTimeEmoji}>🌟</Text>
            <Text style={styles.allTimeValue}>
              {stats?.all_time?.level || 1}
            </Text>
            <Text style={styles.allTimeLabel}>Seviye</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  statLabel: {
    fontSize: 12,
    color: '#4ade80',
    marginTop: 4,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 20,
  },
  chartBar: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  bar: {
    width: 30,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: '#4ade80',
  },
  allTimeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  allTimeItem: {
    width: '48%',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  allTimeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  allTimeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
  },
  allTimeLabel: {
    fontSize: 12,
    color: '#4ade80',
    textAlign: 'center',
    marginTop: 4,
  },
});
