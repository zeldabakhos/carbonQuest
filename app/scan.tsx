import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, StyleSheet, Text, View, ActivityIndicator, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState<{ data: string; type: string } | null>(null);
  const lastScanAtRef = useRef(0);
  const [mirror, setMirror] = useState(Platform.OS === "web"); 


  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading camera permissions…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12 }}>Camera permission is needed.</Text>
        <Button title="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  const onBarcodeScanned = ({ data, type }: { data: string; type: string }) => {
    const now = Date.now();
    if (now - lastScanAtRef.current < 1200) return;
    lastScanAtRef.current = now;

    if (scanned) return;
    setScanned(true);
    setBarcode({ data, type });
    Alert.alert("Scanned!", `Type: ${type}\nCode: ${data}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CarbonQuest — Scan</Text>

      <View style={styles.cameraWrap}>
        <CameraView
            style={[
                StyleSheet.absoluteFill,
                mirror ? { transform: [{ scaleX: -1 }] } : null
            ]}
            facing="back"
            barcodeScannerSettings={{
                barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "code39"],
            }}
            onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
            />
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>Result:</Text>
        <Text>{barcode ? `${barcode.data} (${barcode.type})` : "No scan yet"}</Text>

        <View style={{ height: 12 }} />

        <View style={{ gap: 10 }}>
          <Button
            title={scanned ? "Scan again" : "Ready to scan"}
            onPress={() => {
              setScanned(false);
              setBarcode(null);
            }}
          />
        </View>

        {Platform.OS === "web" && (
            <Button
                title={mirror ? "Un-mirror camera" : "Mirror camera"}
                onPress={() => setMirror((m) => !m)}
            />
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  cameraWrap: { height: 420, borderRadius: 16, overflow: "hidden", backgroundColor: "#000" },
  panel: { marginTop: 16, padding: 12, borderRadius: 12, backgroundColor: "#f4f4f5" },
  label: { fontWeight: "700", marginBottom: 6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
});
