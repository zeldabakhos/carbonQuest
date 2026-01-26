import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { scanAPI } from '../lib/api';
import { colors, fonts, shadows, spacing, borderRadius } from '../styles/theme';
import {
  Garden,
  Plant,
  getPlantStageInfo,
  getGardenLevelInfo,
  getNextAnimal,
  getAnimalProgress,
  getGardenStats,
  ANIMAL_UNLOCKS,
} from '../utils/gardenUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated Plant Component
const AnimatedPlant: React.FC<{ plant: Plant; index: number }> = ({ plant, index }) => {
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const stageInfo = getPlantStageInfo(plant.growthPoints);

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1000 + index * 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000 + index * 200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, bounceAnim, index]);

  return (
    <Animated.View
      style={[
        styles.plant,
        {
          transform: [{ translateY: bounceAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.plantEmoji}>{stageInfo.emoji}</Text>
      <View style={styles.progressBarSmall}>
        <View
          style={[
            styles.progressFillSmall,
            {
              width: `${Math.min(
                ((plant.growthPoints - stageInfo.minPoints) /
                  (stageInfo.maxPoints - stageInfo.minPoints)) *
                  100,
                100
              )}%`,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

// Animated Animal Component
const AnimatedAnimal: React.FC<{ animal: string; index: number }> = ({ animal, index }) => {
  const floatAnim = React.useRef(new Animated.Value(0)).current;
  const positionAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 2000 + index * 300,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000 + index * 300,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(positionAnim, {
          toValue: 30,
          duration: 3000 + index * 500,
          useNativeDriver: true,
        }),
        Animated.timing(positionAnim, {
          toValue: -30,
          duration: 3000 + index * 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim, positionAnim, index]);

  return (
    <Animated.View
      style={[
        styles.animal,
        {
          left: `${(index * 25) % 80}%`,
          transform: [{ translateY: floatAnim }, { translateX: positionAnim }],
        },
      ]}
    >
      <Text style={styles.animalEmoji}>{animal}</Text>
    </Animated.View>
  );
};

export default function GardenScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [garden, setGarden] = React.useState<Garden | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadGardenData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('🌱 Loading garden data for user:', user.id);
      const profile = await scanAPI.getUserProfile(user.id);

      const gardenData: Garden = profile.garden || {
        plants: [],
        animals: [],
        gardenLevel: 0,
      };

      console.log('✅ Garden loaded - Plants:', gardenData.plants.length);
      setGarden(gardenData);
    } catch (error) {
      console.error('❌ Failed to load garden:', error);
      // Set empty garden on error so user can still see the garden screen
      setGarden({
        plants: [],
        animals: [],
        gardenLevel: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    if (!authLoading) {
      if (user?.id) {
        loadGardenData();
      } else {
        setLoading(false);
      }
    }
  }, [user?.id, authLoading]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        loadGardenData();
      }
    }, [user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadGardenData();
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
        <Text style={styles.errorText}>Please sign in to view your garden</Text>
        <Pressable style={styles.button} onPress={() => router.push('/signin')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (!garden) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Unable to load garden</Text>
      </View>
    );
  }

  const levelInfo = getGardenLevelInfo(garden.gardenLevel);
  const stats = getGardenStats(garden);
  const animalProgress = getAnimalProgress(garden.plants.length);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.backgrounds.main as any}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent.lime]} />
          }
        >
          <View style={styles.header}>
            <LinearGradient
              colors={[colors.primary.emerald, colors.garden.earth[0]]}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.title}>Impact Garden 🌱</Text>
              <Text style={styles.subtitle}>{levelInfo.name}</Text>
              <Text style={styles.description}>{levelInfo.description}</Text>
            </LinearGradient>
          </View>

          <LinearGradient
            colors={(garden.gardenLevel >= 3 ? colors.garden.forest : colors.garden.earth) as any}
            style={styles.gardenContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {garden.gardenLevel >= 2 && (
              <LinearGradient
                colors={['rgba(135, 206, 250, 0.5)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.sky}
              >
                <Text style={styles.skyIcon}>☀️</Text>
                <Text style={styles.skyIcon}>☁️</Text>
                <Text style={styles.skyIcon}>☁️</Text>
              </LinearGradient>
            )}

        {garden.animals.map((animal, index) => (
          <AnimatedAnimal key={`animal-${animal}-${index}`} animal={animal} index={index} />
        ))}

        <View style={styles.plantsGrid}>
          {garden.plants.length === 0 ? (
            <View style={styles.emptyGarden}>
              <Text style={styles.emptyGardenText}>🟫</Text>
              <Text style={styles.emptyText}>Your garden is empty</Text>
              <Text style={styles.emptySubtext}>Scan products to plant seeds!</Text>
            </View>
          ) : (
            garden.plants.map((plant, index) => (
              <AnimatedPlant key={plant.id} plant={plant} index={index} />
            ))
          )}
        </View>

            <View style={styles.ground} />
          </LinearGradient>

          <LinearGradient
            colors={['#ffffff', '#f0fdf4']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.cardTitle}>Garden Statistics ✨</Text>
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={[colors.garden.earth[0], colors.garden.earth[1]]}
                style={styles.statBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.statEmoji}>🌱</Text>
                <Text style={styles.statValue}>{stats.totalPlants}</Text>
                <Text style={styles.statLabel}>Total Plants</Text>
              </LinearGradient>
              <LinearGradient
                colors={[colors.primary.blue, colors.primary.purple]}
                style={styles.statBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.statEmoji}>{levelInfo.emoji}</Text>
                <Text style={styles.statValue}>{levelInfo.name}</Text>
                <Text style={styles.statLabel}>Garden Level</Text>
              </LinearGradient>
              <LinearGradient
                colors={[colors.garden.sky[0], colors.garden.sky[1]]}
                style={styles.statBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.statEmoji}>🦋</Text>
                <Text style={styles.statValue}>{stats.animalsUnlocked}</Text>
                <Text style={styles.statLabel}>Animals</Text>
              </LinearGradient>
            </View>
          </LinearGradient>

          {animalProgress.nextAnimal && (
            <LinearGradient
              colors={['#ffffff', '#fef3c7']}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.cardTitle}>Next Animal 🎯</Text>
              <View style={styles.animalProgressContainer}>
                <Text style={styles.nextAnimalEmoji}>{animalProgress.nextAnimal.animal}</Text>
                <Text style={styles.nextAnimalName}>{animalProgress.nextAnimal.name}</Text>
                <View style={styles.progressBarContainer}>
                  <LinearGradient
                    colors={[colors.accent.gold, colors.accent.coral]}
                    style={[
                      styles.progressFill,
                      { width: `${animalProgress.progress}%` },
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.progressText}>
                  {animalProgress.remaining} more plants to unlock
                </Text>
              </View>
            </LinearGradient>
          )}

          <LinearGradient
            colors={['#ffffff', '#e0e7ff']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.cardTitle}>Animal Collection 🦋</Text>
            <View style={styles.animalCollection}>
              {ANIMAL_UNLOCKS.map((unlock) => {
                const isUnlocked = garden.animals.includes(unlock.animal);
                return (
                  <LinearGradient
                    key={unlock.animal}
                    colors={isUnlocked
                      ? [colors.accent.lavender, colors.primary.pink]
                      : ['#f3f4f6', '#d1d5db']}
                    style={[
                      styles.animalCard,
                      !isUnlocked && styles.animalCardLocked,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={[styles.collectionAnimal, !isUnlocked && styles.lockedAnimal]}>
                      {isUnlocked ? unlock.animal : '❓'}
                    </Text>
                    <Text style={styles.animalCardName}>{unlock.name}</Text>
                    <Text style={styles.animalCardThreshold}>{unlock.threshold} plants</Text>
                  </LinearGradient>
                );
              })}
            </View>
          </LinearGradient>

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  header: {
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  headerGradient: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    ...shadows.lg,
  },
  title: {
    fontSize: fonts.sizes['4xl'],
    fontWeight: fonts.weights.extrabold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: fonts.sizes.sm,
    color: 'rgba(255, 255, 255, 0.95)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gardenContainer: {
    height: 400,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.xl,
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
  },
  skyIcon: {
    fontSize: 32,
  },
  plantsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-end',
    paddingBottom: 60,
    paddingHorizontal: 10,
    gap: 10,
  },
  plant: {
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 10,
  },
  plantEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  progressBarSmall: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  animal: {
    position: 'absolute',
    top: '20%',
    zIndex: 10,
  },
  animalEmoji: {
    fontSize: 36,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(101, 67, 33, 0.8)',
    borderTopWidth: 3,
    borderTopColor: 'rgba(139, 115, 85, 0.9)',
  },
  emptyGarden: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyGardenText: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.xl,
  },
  cardTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.extrabold,
    color: colors.neutral.dark,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  statEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.extrabold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.neutral.white,
    textAlign: 'center',
    fontWeight: fonts.weights.semibold,
  },
  animalProgressContainer: {
    alignItems: 'center',
  },
  nextAnimalEmoji: {
    fontSize: 72,
    marginBottom: spacing.sm,
  },
  nextAnimalName: {
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
    color: colors.neutral.dark,
    marginBottom: spacing.md,
  },
  progressBarContainer: {
    width: '100%',
    height: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.lg,
  },
  progressText: {
    fontSize: fonts.sizes.sm,
    color: colors.neutral.gray,
    fontWeight: fonts.weights.semibold,
  },
  animalCollection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  animalCard: {
    width: (SCREEN_WIDTH - 80) / 3,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  animalCardLocked: {
    opacity: 0.6,
  },
  collectionAnimal: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  lockedAnimal: {
    opacity: 0.3,
  },
  animalCardName: {
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
    color: colors.neutral.white,
    marginBottom: 2,
    textAlign: 'center',
  },
  animalCardThreshold: {
    fontSize: 10,
    color: colors.neutral.white,
    opacity: 0.9,
  },
  errorText: {
    fontSize: fonts.sizes.base,
    color: colors.neutral.white,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary.emerald,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    ...shadows.colored.green,
  },
  buttonText: {
    color: colors.neutral.white,
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.bold,
  },
});
