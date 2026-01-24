import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  // Parallax values
  const headerScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.5, 1],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const navbarOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0.95, 1],
    extrapolate: "clamp",
  });

  const navbarShadow = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 4],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Animated Navigation Bar */}
      <Animated.View
        style={[
          styles.navbar,
          {
            opacity: navbarOpacity,
            shadowOpacity: navbarShadow.interpolate({
              inputRange: [0, 4],
              outputRange: [0, 0.1],
            }),
          },
        ]}
      >
        <Text style={styles.logo}>🌱 CarbonQuest</Text>
        <View style={styles.navButtons}>
          <Pressable
            style={styles.navButton}
            onPress={() => router.push("/signin")}
          >
            <Text style={styles.navButtonText}>Sign In</Text>
          </Pressable>
          <Pressable
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.navButtonTextPrimary}>Sign Up</Text>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Section with Parallax */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              transform: [{ scale: headerScale }],
              opacity: headerOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={["#ecfdf5", "#d1fae5", "#a7f3d0"]}
            style={styles.heroGradient}
          >
            <Text style={styles.heroEmoji}>🌍</Text>
            <Text style={styles.heroTitle}>Our Planet Needs You</Text>
            <Text style={styles.heroSubtitle}>
              Every product you buy has a carbon footprint. Make informed choices
              to protect our future.
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Stats Section */}
        <LinearGradient
          colors={["#065f46", "#047857", "#059669"]}
          style={styles.statsSection}
        >
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>36B</Text>
            <Text style={styles.statLabel}>Tons of CO₂ emitted yearly</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1.5°C</Text>
            <Text style={styles.statLabel}>Critical warming threshold</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>70%</Text>
            <Text style={styles.statLabel}>Emissions from consumption</Text>
          </View>
        </LinearGradient>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why Carbon Footprint Matters</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardEmoji}>🏭</Text>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Hidden Impact</Text>
              <Text style={styles.infoCardText}>
                From production to packaging to transport, every product
                contributes to greenhouse gas emissions. Most of this impact is
                invisible to consumers.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardEmoji}>🛒</Text>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Consumer Power</Text>
              <Text style={styles.infoCardText}>
                Your purchasing decisions matter. By choosing lower-carbon
                alternatives, you can reduce your personal footprint by up to
                30%.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardEmoji}>📊</Text>
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Knowledge is Power</Text>
              <Text style={styles.infoCardText}>
                CarbonQuest helps you see the environmental impact of products
                before you buy. Scan any barcode to reveal its carbon footprint.
              </Text>
            </View>
          </View>
        </View>

        {/* Impact Section */}
        <View style={styles.impactSection}>
          <Text style={styles.impactTitle}>Small Changes, Big Impact</Text>
          <Text style={styles.impactText}>
            If every person reduced their carbon footprint by just 10%, we could
            prevent over 3 billion tons of CO₂ emissions annually. That's
            equivalent to taking 650 million cars off the road.
          </Text>
          <Text style={styles.impactText}>
            Together, we can make a difference. Start by understanding the
            impact of the products you use every day.
          </Text>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Make a Difference?</Text>
          <Text style={styles.ctaText}>
            Scan products, discover their environmental impact, and make choices
            that help protect our planet for future generations.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
            onPress={() => router.push("/signup")}
          >
            <LinearGradient
              colors={["#22c55e", "#16a34a", "#15803d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaButtonGradient}
            >
              <Text style={styles.ctaButtonText}>🌱 Help Save the Planet</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 CarbonQuest • Making sustainability simple
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  navbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    fontSize: 22,
    fontWeight: "800",
    color: "#22c55e",
    letterSpacing: -0.5,
  },
  navButtons: {
    flexDirection: "row",
    gap: 10,
  },
  navButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  navButtonPrimary: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonTextPrimary: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 80,
  },
  heroSection: {
    marginBottom: 0,
    overflow: "hidden",
  },
  heroGradient: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 50,
  },
  heroEmoji: {
    fontSize: 80,
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: "900",
    color: "#065f46",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "#047857",
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 340,
    fontWeight: "500",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#a7f3d0",
    textAlign: "center",
    maxWidth: 100,
  },
  infoSection: {
    padding: 24,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  infoCardEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 21,
  },
  impactSection: {
    padding: 28,
    backgroundColor: "#fef3c7",
    marginHorizontal: 20,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  impactTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 12,
    textAlign: "center",
  },
  impactText: {
    fontSize: 15,
    color: "#78350f",
    lineHeight: 23,
    marginBottom: 12,
    textAlign: "center",
  },
  ctaSection: {
    padding: 24,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  ctaText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 24,
    maxWidth: 320,
  },
  ctaButton: {
    borderRadius: 16,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
  },
  ctaButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  footer: {
    padding: 24,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: "#9ca3af",
  },
});
