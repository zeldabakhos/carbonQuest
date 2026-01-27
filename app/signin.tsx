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

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState("");

  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleSignIn = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
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

    const success = await signIn(email, password);
    if (success) {
      router.replace("/(tabs)/scan");
    } else {
      setError("Invalid email or password");
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
                <Text style={styles.icon}>🌱</Text>
              </LinearGradient>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue your eco journey
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
                  autoComplete="email"
                  textContentType="emailAddress"
                  importantForAutofill="yes"
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput("")}
                  editable
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
                  placeholder="Enter your password"
                  placeholderTextColor={colors.neutral.gray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  importantForAutofill="yes"
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput("")}
                  editable
                />
                </View>
              </View>

              {/* Forgot Password */}
              <Pressable style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </Pressable>

              {/* Sign In Button */}
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable onPress={handleSignIn}>
                  <LinearGradient
                    colors={[colors.primary.blue, colors.primary.purple]}
                    style={styles.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.buttonText}>Sign In ✨</Text>
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
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Pressable onPress={() => router.push("/signup")}>
                <LinearGradient
                  colors={[colors.accent.electric, colors.accent.lavender]}
                  style={styles.signupButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.footerLink}>Sign Up Free 🚀</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: fonts.sizes.sm,
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
