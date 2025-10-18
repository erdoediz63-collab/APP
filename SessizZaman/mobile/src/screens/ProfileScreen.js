import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}s ${minutes}d`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>🧑</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv {user?.level || 1}</Text>
          </View>
        </View>
        <Text style={styles.username}>{user?.username || 'Kullanıcı'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>⏱️</Text>
          <Text style={styles.statValue}>
            {formatTime(user?.total_focus_time || 0)}
          </Text>
          <Text style={styles.statLabel}>Toplam Odaklanma</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🌳</Text>
          <Text style={styles.statValue}>{user?.trees_planted || 0}</Text>
          <Text style={styles.statLabel}>Ağaç Diktin</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🪙</Text>
          <Text style={styles.statValue}>{user?.coins || 0}</Text>
          <Text style={styles.statLabel}>Coin</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValue}>{user?.current_streak || 0}</Text>
          <Text style={styles.statLabel}>Günlük Seri</Text>
        </View>
      </View>

      {/* Achievements Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Başarılar</Text>
        <View style={styles.achievementsGrid}>
          <View style={styles.achievementBadge}>
            <Text style={styles.achievementEmoji}>🌟</Text>
            <Text style={styles.achievementName}>İlk Seans</Text>
          </View>
          <View style={styles.achievementBadge}>
            <Text style={styles.achievementEmoji}>⭐</Text>
            <Text style={styles.achievementName}>10 Saat</Text>
          </View>
          <View style={[styles.achievementBadge, styles.locked]}>
            <Text style={styles.achievementEmoji}>🔒</Text>
            <Text style={styles.achievementName}>50 Saat</Text>
          </View>
          <View style={[styles.achievementBadge, styles.locked]}>
            <Text style={styles.achievementEmoji}>🔒</Text>
            <Text style={styles.achievementName}>100 Saat</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Ayarlar</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>🔔 Bildirimler</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>🎵 Sesler</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>⏱️ Pomodoro Ayarları</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Çıkış Yap</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Sessiz Zaman v1.0</Text>
        <Text style={styles.footerText}>Made with ❤️</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 80,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: -10,
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
  },
  email: {
    fontSize: 14,
    color: '#4ade80',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
  },
  statLabel: {
    fontSize: 12,
    color: '#4ade80',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementBadge: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  locked: {
    borderColor: '#e5e7eb',
    opacity: 0.5,
  },
  achievementEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 10,
    color: '#166534',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  settingText: {
    fontSize: 16,
    color: '#166534',
  },
  settingArrow: {
    fontSize: 24,
    color: '#4ade80',
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#4ade80',
    marginBottom: 4,
  },
});
