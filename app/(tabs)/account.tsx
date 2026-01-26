import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { scanAPI, ScanHistory } from '../lib/api';

export default function AccountScreen() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      console.log('📊 Loading account data for user:', user.id);
      const [profile, scans] = await Promise.all([
        scanAPI.getUserProfile(user.id),
        scanAPI.getUserScans(user.id),
      ]);

      console.log('✅ Account data loaded - Points:', profile.points, 'Scans:', profile.scanCount);
      setUserProfile(profile);
      setScanHistory(scans);
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.id) {
      loadUserData();
    }
  }, [user?.id, authLoading]);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadUserData();
      }
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/signin');
  };

  const getPointsLevel = (points: number) => {
    if (points >= 500) return { level: 'Eco Champion', emoji: '🏆', color: '#fbbf24' };
    if (points >= 200) return { level: 'Green Hero', emoji: '🌟', color: '#22c55e' };
    if (points >= 50) return { level: 'Eco Warrior', emoji: '⚡', color: '#3b82f6' };
    return { level: 'Beginner', emoji: '🌱', color: '#6b7280' };
  };

  if (authLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Please sign in to view your account</Text>
        <Pressable style={styles.button} onPress={() => router.push('/signin')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  const level = getPointsLevel(userProfile?.points || 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#22c55e']} />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      {/* Points & Level Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Impact</Text>
        <View style={styles.levelContainer}>
          <Text style={[styles.levelEmoji, { fontSize: 48 }]}>{level.emoji}</Text>
          <Text style={[styles.levelText, { color: level.color }]}>{level.level}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userProfile?.points || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userProfile?.scanCount || 0}</Text>
            <Text style={styles.statLabel}>Scans</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Next Level Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(((userProfile?.points || 0) % 100) * 2, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {100 - ((userProfile?.points || 0) % 100)} points to next milestone
          </Text>
        </View>
      </View>

      {/* Scan History */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Scans</Text>
        {scanHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>No scans yet</Text>
            <Text style={styles.emptySubtext}>Start scanning products to track your impact!</Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {scanHistory.slice(0, 10).map((scan) => (
              <Pressable
                key={scan._id}
                style={styles.historyItem}
                onPress={() => router.push(`/product?barcode=${scan.barcode}`)}
              >
                <View style={styles.historyInfo}>
                  <Text style={styles.historyName} numberOfLines={1}>
                    {scan.name}
                  </Text>
                  {scan.brand && (
                    <Text style={styles.historyBrand} numberOfLines={1}>
                      {scan.brand}
                    </Text>
                  )}
                  <Text style={styles.historyDate}>
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.historyRating}>
                  <View
                    style={[
                      styles.ratingBadge,
                      {
                        backgroundColor:
                          scan.carbonRating === 'A' || scan.carbonRating === 'B'
                            ? '#dcfce7'
                            : scan.carbonRating === 'C' || scan.carbonRating === 'D'
                            ? '#fef3c7'
                            : '#fee2e2',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ratingText,
                        {
                          color:
                            scan.carbonRating === 'A' || scan.carbonRating === 'B'
                              ? '#15803d'
                              : scan.carbonRating === 'C' || scan.carbonRating === 'D'
                              ? '#ca8a04'
                              : '#dc2626',
                        },
                      ]}
                    >
                      {scan.carbonRating}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Sign Out Button */}
      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  levelEmoji: {
    marginBottom: 8,
  },
  levelText: {
    fontSize: 20,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#22c55e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  historyInfo: {
    flex: 1,
    marginRight: 12,
  },
  historyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  historyBrand: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  historyRating: {
    alignItems: 'flex-end',
  },
  ratingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
  },
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dc2626',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
