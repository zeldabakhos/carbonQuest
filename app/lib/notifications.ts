import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

let handlerConfigured = false;

// Configure how notifications are handled when app is in foreground
function configureNotificationHandler() {
  if (handlerConfigured) return;
  handlerConfigured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Initialize notifications (call this on app start)
export async function initializeNotifications(): Promise<boolean> {
  configureNotificationHandler();
  if (Platform.OS === 'web') {
    console.log('📱 Notifications: Using console.log for web platform');
    return true;
  }

  if (!Device.isDevice) {
    console.log('⚠️ Push notifications only work on physical devices');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('⚠️ Push notification permission not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'CarbonQuest',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#22c55e',
      });
    }

    console.log('✅ Push notifications initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize notifications:', error);
    return false;
  }
}

// Show a notification (local push on mobile, console.log on web)
export async function showNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  configureNotificationHandler();

  if (Platform.OS === 'web') {
    // Web: Log to console with styling
    console.log(
      `%c🔔 ${title}`,
      'color: #22c55e; font-weight: bold; font-size: 14px;'
    );
    console.log(`   ${body}`);
    if (data) {
      console.log('   Data:', data);
    }
    return;
  }

  // Mobile: Show local push notification
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('❌ Failed to show notification:', error);
    // Fallback to console
    console.log(`🔔 ${title}: ${body}`);
  }
}

// Notification types for the app
export const NotificationTypes = {
  // Scan completed notification
  scanComplete: (productName: string, carbonRating: string, pointsEarned: number) => {
    const ratingEmoji = {
      A: '🌟',
      B: '👍',
      C: '👌',
      D: '⚠️',
      E: '😬',
      F: '❌',
    }[carbonRating] || '📊';

    showNotification(
      `${ratingEmoji} Scan Complete!`,
      `${productName} - Carbon Rating: ${carbonRating}. You earned ${pointsEarned} points!`,
      { type: 'scan', carbonRating, pointsEarned }
    );
  },

  // Garden milestone notification
  gardenMilestone: (milestone: string, details: string) => {
    showNotification(
      `🌱 Garden Update!`,
      `${milestone}: ${details}`,
      { type: 'garden', milestone }
    );
  },

  // New animal unlocked
  animalUnlocked: (animal: string) => {
    showNotification(
      `🎉 New Friend!`,
      `You unlocked ${animal} for your garden!`,
      { type: 'animal', animal }
    );
  },

  // Points milestone
  pointsMilestone: (points: number) => {
    showNotification(
      `🏆 Points Milestone!`,
      `You've reached ${points} points! Keep going!`,
      { type: 'points', points }
    );
  },

  // General info notification
  info: (title: string, message: string) => {
    showNotification(title, message, { type: 'info' });
  },
};

export default {
  initialize: initializeNotifications,
  show: showNotification,
  types: NotificationTypes,
};
