import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function ForestScreen() {
  const [trees, setTrees] = useState([]);
  const [userTrees, setUserTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [treesRes, userTreesRes] = await Promise.all([
        api.get('/trees'),
        api.get('/trees/user'),
      ]);
      setTrees(treesRes.data);
      setUserTrees(userTreesRes.data);
    } catch (error) {
      console.error('Load trees error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isTreeUnlocked = (treeId) => {
    const userTree = userTrees.find((ut) => ut.tree_id === treeId);
    return userTree?.unlocked || false;
  };

  const unlockTree = async (tree) => {
    if (user.coins < tree.cost) {
      Alert.alert('⚠️ Yetersiz Bakiye', `Bu ağacı kilidini açmak için ${tree.cost} coin gerekli. Şu an ${user.coins} coin\'iniz var.`);
      return;
    }

    Alert.alert(
      `${tree.image_url} ${tree.name}`,
      `Bu ağacı ${tree.cost} coin karşılığında kilidini açmak ister misin?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kilidi Aç',
          onPress: async () => {
            try {
              await api.post(`/trees/unlock/${tree.id}`);
              await refreshUser();
              await loadData();
              Alert.alert('✨ Başarılı!', `${tree.name} kilidini açtın!`);
            } catch (error) {
              Alert.alert('Hata', error.response?.data?.detail || 'Bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return '#9ca3af';
      case 'rare':
        return '#3b82f6';
      case 'epic':
        return '#a855f7';
      case 'legendary':
        return '#f59e0b';
      default:
        return '#9ca3af';
    }
  };

  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'Yaygın';
      case 'rare':
        return 'Nadir';
      case 'epic':
        return 'Epik';
      case 'legendary':
        return 'Efsanevi';
      default:
        return rarity;
    }
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
      <View style={styles.header}>
        <Text style={styles.title}>🌳 Ağaç Koleksiyonu</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>🪙 {user?.coins || 0}</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
Odaklanıp coin kazan, yeni ağaçların kilidini aç!
      </Text>

      <View style={styles.grid}>
        {trees.map((tree) => {
          const unlocked = isTreeUnlocked(tree.id);
          return (
            <TouchableOpacity
              key={tree.id}
              style={[
                styles.treeCard,
                unlocked && styles.treeCardUnlocked,
              ]}
              onPress={() => !unlocked && unlockTree(tree)}
              disabled={unlocked}
            >
              <View
                style={[
                  styles.rarityBadge,
                  { backgroundColor: getRarityColor(tree.rarity) },
                ]}
              >
                <Text style={styles.rarityText}>
                  {getRarityLabel(tree.rarity)}
                </Text>
              </View>

              <Text style={[styles.treeEmoji, !unlocked && styles.locked]}>
                {unlocked ? tree.image_url : '🔒'}
              </Text>
              <Text style={styles.treeName}>{tree.name}</Text>
              <Text style={styles.treeDescription}>{tree.description}</Text>

              {!unlocked && (
                <View style={styles.costBadge}>
                  <Text style={styles.costText}>🪙 {tree.cost}</Text>
                </View>
              )}

              {unlocked && (
                <View style={styles.unlockedBadge}>
                  <Text style={styles.unlockedText}>✔️ Kilidi Açık</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#166534',
  },
  coinsContainer: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  coinsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
  },
  subtitle: {
    fontSize: 14,
    color: '#4ade80',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  treeCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  treeCardUnlocked: {
    borderColor: '#22c55e',
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  treeEmoji: {
    fontSize: 48,
    marginVertical: 12,
  },
  locked: {
    opacity: 0.3,
  },
  treeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    textAlign: 'center',
  },
  treeDescription: {
    fontSize: 12,
    color: '#4ade80',
    textAlign: 'center',
    marginTop: 4,
  },
  costBadge: {
    marginTop: 12,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  costText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
  },
  unlockedBadge: {
    marginTop: 12,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
  },
});
