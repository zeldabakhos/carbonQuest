import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, shadows, spacing, borderRadius } from "./styles/theme";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState("");

  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleSignUp = async () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please create a password");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Sign up using auth context
    const success = await signUp(name, email, password);
    if (success) {
      // Redirect to signin page after successful signup
      router.replace("/signin");
    } else {
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.backgrounds.main as any}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Animated Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#ffffff', '#f0f9ff']}
                style={styles.iconContainer}
              >
                <Text style={styles.icon}>🌍</Text>
              </LinearGradient>
              <Text style={styles.title}>Join the Movement</Text>
              <Text style={styles.subtitle}>
                Start your eco journey today
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              {error ? (
                <LinearGradient
                  colors={['#fee2e2', '#fecaca']}
                  style={styles.errorBox}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </LinearGradient>
              ) : null}

              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "name" && styles.inputContainerFocused,
                  ]}
                >
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor={colors.neutral.gray}
                    value={name}
                    onChangeText={setName}
                    autoCorrect={false}
                    onFocus={() => setFocusedInput("name")}
                    onBlur={() => setFocusedInput("")}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "email" && styles.inputContainerFocused,
                  ]}
                >
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={colors.neutral.gray}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput("")}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "password" && styles.inputContainerFocused,
                  ]}
                >
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="At least 8 characters"
                    placeholderTextColor={colors.neutral.gray}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput("")}
                  />
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusedInput === "confirmPassword" && styles.inputContainerFocused,
                  ]}
                >
                  <Text style={styles.inputIcon}>🔐</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    placeholderTextColor={colors.neutral.gray}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    onFocus={() => setFocusedInput("confirmPassword")}
                    onBlur={() => setFocusedInput("")}
                  />
                </View>
              </View>

              {/* Terms Text */}
              <Text style={styles.termsText}>
                By creating an account, you agree to our{" "}
                <Text style={styles.termsLink}>Terms</Text> &{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>

              {/* Sign Up Button */}
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable onPress={handleSignUp}>
                  <LinearGradient
                    colors={[colors.primary.blue, colors.primary.purple]}
                    style={styles.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>Create Account 🚀</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Buttons */}
              <View style={styles.socialContainer}>
                <Pressable style={styles.socialButton}>
                  <LinearGradient
                    colors={['#ffffff', '#f3f4f6']}
                    style={styles.socialGradient}
                  >
                    <Text style={styles.socialButtonText}>🍎 Apple</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable style={styles.socialButton}>
                  <LinearGradient
                    colors={['#ffffff', '#f3f4f6']}
                    style={styles.socialGradient}
                  >
                    <Text style={styles.socialButtonText}>📧 Google</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => router.push("/signin")}>
                <LinearGradient
                  colors={[colors.accent.electric, colors.accent.lavender]}
                  style={styles.signupButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.footerLink}>Sign In ✨</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.xl,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: fonts.sizes['4xl'],
    fontWeight: fonts.weights.extrabold,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: fonts.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.xl,
  },
  errorBox: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#dc2626',
    fontSize: fonts.sizes.sm,
    textAlign: 'center',
    fontWeight: fonts.weights.semibold,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.neutral.dark,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.primary.blue,
    backgroundColor: colors.neutral.white,
    ...shadows.colored.blue,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fonts.sizes.base,
    color: colors.neutral.dark,
  },
  termsText: {
    fontSize: fonts.sizes.xs,
    color: colors.neutral.gray,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  termsLink: {
    color: colors.primary.purple,
    fontWeight: fonts.weights.semibold,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.colored.purple,
  },
  buttonText: {
    color: colors.neutral.white,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: fonts.sizes.sm,
    color: colors.neutral.gray,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
  },
  socialGradient: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  socialButtonText: {
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semibold,
    color: colors.neutral.dark,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: fonts.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  signupButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  footerLink: {
    fontSize: fonts.sizes.base,
    color: colors.neutral.white,
    fontWeight: fonts.weights.bold,
  },
});
