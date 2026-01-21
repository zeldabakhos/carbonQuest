import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { lookupProduct, Product } from "./utils/productApi";

export default function ProductScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!barcode) {
      setError("No barcode provided");
      setLoading(false);
      return;
    }

    lookupProduct(barcode).then((result) => {
      if (result.success && result.product) {
        setProduct(result.product);
      } else {
        setError(result.error || "Product not found");
      }
      setLoading(false);
    });
  }, [barcode]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Looking up product...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>😕</Text>
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.barcodeText}>Barcode: {barcode}</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Scan Another</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with image */}
      <View style={styles.header}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.content}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name}>{product.name}</Text>

        {product.quantity && (
          <Text style={styles.quantity}>{product.quantity}</Text>
        )}

        {/* Source Badge */}
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceText}>
            {product.source === "openfoodfacts" ? "🍎 Food" : "💄 Beauty"}
          </Text>
        </View>

        {/* Scores Section */}
        <View style={styles.scoresRow}>
          {product.nutriscore_grade && (
            <ScoreBadge
              label="Nutri-Score"
              value={product.nutriscore_grade.toUpperCase()}
              color={nutriscoreColor(product.nutriscore_grade)}
            />
          )}
          {product.ecoscore_grade && (
            <ScoreBadge
              label="Eco-Score"
              value={product.ecoscore_grade.toUpperCase()}
              color={ecoscoreColor(product.ecoscore_grade)}
            />
          )}
          {product.nova_group && (
            <ScoreBadge
              label="NOVA"
              value={String(product.nova_group)}
              color={novaColor(product.nova_group)}
            />
          )}
        </View>

        {/* Carbon Footprint Placeholder */}
        <View style={styles.carbonCard}>
          <Text style={styles.carbonTitle}>🌍 Carbon Footprint</Text>
          <Text style={styles.carbonValue}>Coming Soon</Text>
          <Text style={styles.carbonSubtext}>
            We're working on calculating the environmental impact of this
            product.
          </Text>
        </View>

        {/* Categories */}
        {product.categories && (
          <InfoSection title="Categories" content={product.categories} />
        )}

        {/* Ingredients */}
        {product.ingredients_text && (
          <InfoSection title="Ingredients" content={product.ingredients_text} />
        )}

        {/* Packaging */}
        {product.packaging && (
          <InfoSection title="Packaging" content={product.packaging} />
        )}

        {/* Barcode */}
        <View style={styles.barcodeSection}>
          <Text style={styles.barcodeLabel}>Barcode</Text>
          <Text style={styles.barcodeValue}>{product.barcode}</Text>
        </View>

        {/* Scan Another Button */}
        <Pressable
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Scan Another Product</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// Helper Components
function ScoreBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.scoreBadge}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={[styles.scoreValue, { backgroundColor: color }]}>
        <Text style={styles.scoreValueText}>{value}</Text>
      </View>
    </View>
  );
}

function InfoSection({ title, content }: { title: string; content: string }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoContent}>{content}</Text>
    </View>
  );
}

// Color helpers for scores
function nutriscoreColor(grade: string): string {
  const colors: Record<string, string> = {
    a: "#038141",
    b: "#85BB2F",
    c: "#FECB02",
    d: "#EE8100",
    e: "#E63E11",
  };
  return colors[grade.toLowerCase()] || "#888";
}

function ecoscoreColor(grade: string): string {
  return nutriscoreColor(grade); // Same color scheme
}

function novaColor(group: number): string {
  const colors: Record<number, string> = {
    1: "#038141",
    2: "#85BB2F",
    3: "#EE8100",
    4: "#E63E11",
  };
  return colors[group] || "#888";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  barcodeText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 24,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#f9fafb",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#9ca3af",
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  brand: {
    fontSize: 14,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 4,
  },
  quantity: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 12,
  },
  sourceBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  sourceText: {
    fontSize: 14,
    color: "#374151",
  },
  scoresRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  scoreBadge: {
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  scoreValue: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValueText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  carbonCard: {
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  carbonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065f46",
    marginBottom: 4,
  },
  carbonValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#047857",
    marginBottom: 4,
  },
  carbonSubtext: {
    fontSize: 14,
    color: "#047857",
  },
  infoSection: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  infoContent: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  barcodeSection: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  barcodeLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  barcodeValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
