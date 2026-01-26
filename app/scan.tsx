import React, { useRef, useState, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Platform,
  Pressable,
  Animated,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useAuth } from "./context/AuthContext";

export default function ScanScreen() {
  const router = useRouter();
  const { isSignedIn, loading } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState<{ data: string; type: string } | null>(null);
  const lastScanAtRef = useRef(0);
  const [mirror, setMirror] = useState(Platform.OS === "web");
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/signin");
    }
  }, [isSignedIn, loading]);

  // Animate scan line
  useEffect(() => {
    if (!scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.setValue(0);
    }
  }, [scanned]);

  // Still loading permission status
  if (permission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ marginTop: 12, marginBottom: 20 }}>Loading camera...</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Request Permission</Text>
        </Pressable>
      </View>
    );
  }

  // Permission not granted - show button to request
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan product barcodes.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </Pressable>
        {permission.canAskAgain === false && (
          <Text style={styles.permissionHint}>
            Please enable camera access in your device settings.
          </Text>
        )}
      </View>
    );
  }

  const onBarcodeScanned = ({ data, type }: { data: string; type: string }) => {
    const now = Date.now();
    if (now - lastScanAtRef.current < 1200) return;
    lastScanAtRef.current = now;

    if (scanned) return;

    console.log('Barcode scanned:', data, type);
    setScanned(true);
    setBarcode({ data, type });

    // Navigate to product page with the barcode after a brief delay
    setTimeout(() => {
      router.push({
        pathname: "/product",
        params: { barcode: data },
      });
    }, 500);
  };

  const resetScanner = () => {
    setScanned(false);
    setBarcode(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Product Barcode</Text>
      <Text style={styles.subtitle}>
        {scanned ? "✓ Barcode detected!" : "📷 Align barcode within the frame"}
      </Text>

      <View style={styles.cameraWrap}>
        <CameraView
          style={[
            StyleSheet.absoluteFill,
            mirror ? { transform: [{ scaleX: -1 }] } : null,
          ]}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
          }}
          onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
        />

        {/* Scanning overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Animated scan line */}
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 150],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}

            {/* Success indicator */}
            {scanned && (
              <View style={styles.successOverlay}>
                <Text style={styles.successText}>✓ Scanned!</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>Last Scan:</Text>
        <Text style={styles.resultText}>
          {barcode ? `${barcode.data} (${barcode.type})` : "No scan yet"}
        </Text>

        <Pressable
          style={[styles.button, !scanned && styles.buttonDisabled]}
          onPress={resetScanner}
          disabled={!scanned}
        >
          <Text style={styles.buttonText}>
            {scanned ? "Scan Another" : "Ready to Scan"}
          </Text>
        </Pressable>

        <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={() =>
                router.push({
                pathname: "/product",
                params: { barcode: "" }, // triggers manual entry mode
                })
            }
            >
            <Text style={styles.buttonTextSecondary}>Manual search (enter barcode)</Text>
        </Pressable>


        {Platform.OS === "web" && (
          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setMirror((m) => !m)}
          >
            <Text style={styles.buttonTextSecondary}>
              {mirror ? "Un-mirror camera" : "Mirror camera"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
  },
  cameraWrap: {
    height: 400,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 150,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#22c55e",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#22c55e",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderRadius: 8,
  },
  successText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#22c55e",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  panel: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f4f4f5",
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#374151",
  },
  resultText: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 16,
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionHint: {
    marginTop: 16,
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});
