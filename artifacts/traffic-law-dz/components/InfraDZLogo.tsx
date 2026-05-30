import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface Props {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon" | "text";
  light?: boolean;
}

const LOGO = require("@/assets/images/infradz-logo.png");

export function InfraDZLogo({ size = "md", variant = "full", light = true }: Props) {
  const iconSize = size === "sm" ? 32 : size === "md" ? 44 : 64;
  const titleSize = size === "sm" ? 16 : size === "md" ? 22 : 30;
  const subtitleSize = size === "sm" ? 9 : size === "md" ? 11 : 13;
  const tagSize = size === "sm" ? 8 : size === "md" ? 10 : 12;

  const textColor = light ? "#FFFFFF" : "#0D0D0D";
  const accentColor = "#DC143C";
  const greenColor = "#006233";

  if (variant === "icon") {
    return (
      <Image
        source={LOGO}
        style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.22 }}
        resizeMode="cover"
      />
    );
  }

  if (variant === "text") {
    return (
      <View>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 0 }}>
          <Text style={{ fontSize: titleSize, fontWeight: "900", color: textColor, letterSpacing: -0.5 }}>
            Infra
          </Text>
          <Text style={{ fontSize: titleSize, fontWeight: "900", color: accentColor, letterSpacing: -0.5 }}>
            DZ
          </Text>
        </View>
        <Text style={{ fontSize: subtitleSize, color: light ? "#FFFFFF99" : "#6B6B6B", letterSpacing: 0.5, marginTop: -2 }}>
          Code de route Algérien
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Image
        source={LOGO}
        style={{ width: iconSize, height: iconSize, borderRadius: iconSize * 0.22 }}
        resizeMode="cover"
      />
      <View style={{ marginRight: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={{ fontSize: titleSize, fontWeight: "900", color: textColor, letterSpacing: -0.5 }}>
            Infra
          </Text>
          <Text style={{ fontSize: titleSize, fontWeight: "900", color: accentColor, letterSpacing: -0.5 }}>
            DZ
          </Text>
        </View>
        <Text style={{ fontSize: subtitleSize, color: light ? "#FFFFFF99" : "#6B6B6B", marginTop: -2 }}>
          Code de route Algérien
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
          <View style={{ width: 12, height: 2, backgroundColor: accentColor, borderRadius: 1 }} />
          <Text style={{ fontSize: tagSize, color: accentColor, fontWeight: "700" }}>2026</Text>
          <View style={{ width: 12, height: 2, backgroundColor: greenColor, borderRadius: 1 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
});
