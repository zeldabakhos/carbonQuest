import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CelebrationData {
  newPlant?: {
    stage: number;
    emoji: string;
    name: string;
  };
  newAnimals?: Array<{
    animal: string;
    name: string;
  }>;
  gardenLevel?: {
    level: number;
    name: string;
    emoji: string;
  };
}

interface Props {
  visible: boolean;
  data: CelebrationData | null;
  onClose: () => void;
}

export default function CelebrationModal({ visible, data, onClose }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      bounceAnim.setValue(0);

      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Bounce animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  if (!data) return null;

  const hasNewPlant = !!data.newPlant;
  const hasNewAnimals = data.newAnimals && data.newAnimals.length > 0;
  const hasLevelUp = !!data.gardenLevel;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Celebration Header */}
          <View style={styles.header}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.title}>Amazing!</Text>
          </View>

          {/* New Plant */}
          {hasNewPlant && (
            <Animated.View
              style={[
                styles.section,
                { transform: [{ translateY: bounceAnim }] },
              ]}
            >
              <Text style={styles.sectionIcon}>{data.newPlant.emoji}</Text>
              <Text style={styles.sectionTitle}>New Plant!</Text>
              <Text style={styles.sectionText}>{data.newPlant.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>+10 Growth Points</Text>
              </View>
            </Animated.View>
          )}

          {/* New Animals */}
          {hasNewAnimals && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎊 New Animals Unlocked!</Text>
              <View style={styles.animalsList}>
                {data.newAnimals!.map((animal, index) => (
                  <Animated.View
                    key={animal.name}
                    style={[
                      styles.animalItem,
                      {
                        transform: [
                          {
                            translateY: bounceAnim.interpolate({
                              inputRange: [-10, 0],
                              outputRange: [-10 - index * 5, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.animalEmoji}>{animal.animal}</Text>
                    <Text style={styles.animalName}>{animal.name}</Text>
                  </Animated.View>
                ))}
              </View>
            </View>
          )}

          {/* Garden Level Up */}
          {hasLevelUp && (
            <View style={styles.section}>
              <Text style={styles.levelUpEmoji}>{data.gardenLevel.emoji}</Text>
              <Text style={styles.levelUpTitle}>Garden Level Up!</Text>
              <Text style={styles.levelUpText}>{data.gardenLevel.name}</Text>
            </View>
          )}

          {/* Close Button */}
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>

          {/* Confetti Effect */}
          <Text style={styles.confetti}>✨</Text>
          <Text style={[styles.confetti, styles.confettiRight]}>✨</Text>
          <Text style={[styles.confetti, styles.confettiBottom]}>🌟</Text>
          <Text style={[styles.confetti, styles.confettiBottomRight]}>🌟</Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: SCREEN_WIDTH - 60,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  section: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  sectionIcon: {
    fontSize: 72,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
  },
  animalsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  animalItem: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  animalEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  animalName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  levelUpEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  levelUpTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#22c55e',
    marginBottom: 8,
  },
  levelUpText: {
    fontSize: 18,
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confetti: {
    position: 'absolute',
    fontSize: 32,
    top: 20,
    left: 20,
  },
  confettiRight: {
    left: undefined,
    right: 20,
  },
  confettiBottom: {
    top: undefined,
    bottom: 20,
  },
  confettiBottomRight: {
    top: undefined,
    bottom: 20,
    left: undefined,
    right: 20,
  },
});
