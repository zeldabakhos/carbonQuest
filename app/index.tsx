import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Navigation Bar */}
      <View style={styles.navbar}>
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
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🌍</Text>
          <Text style={styles.heroTitle}>Our Planet Needs You</Text>
          <Text style={styles.heroSubtitle}>
            Every product you buy has a carbon footprint. Make informed choices
            to protect our future.
          </Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
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
        </View>

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
            style={styles.ctaButton}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.ctaButtonText}>🌱 Help Save the Planet</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 CarbonQuest • Making sustainability simple
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logo: {
    fontSize: 20,
    fontWeight: "700",
    color: "#22c55e",
  },
  navButtons: {
    flexDirection: "row",
    gap: 10,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  navButtonPrimary: {
    backgroundColor: "#22c55e",
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
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    backgroundColor: "#ecfdf5",
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#065f46",
    textAlign: "center",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 17,
    color: "#047857",
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 320,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "#065f46",
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
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
    padding: 24,
    backgroundColor: "#fef3c7",
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
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
    backgroundColor: "#22c55e",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 14,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
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
