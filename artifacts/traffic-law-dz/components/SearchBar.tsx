import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = "ابحث عن مخالفة..." }: SearchBarProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row-reverse",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === "ios" ? 12 : 8,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
      textAlign: "right",
      writingDirection: "rtl",
      padding: 0,
    },
    clearBtn: {
      padding: 2,
    },
  });

  return (
    <View style={styles.container}>
      <Feather name="search" size={18} color={colors.mutedForeground} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        returnKeyType="search"
        clearButtonMode="never"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")} style={styles.clearBtn}>
          <Feather name="x-circle" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}
    </View>
  );
}
