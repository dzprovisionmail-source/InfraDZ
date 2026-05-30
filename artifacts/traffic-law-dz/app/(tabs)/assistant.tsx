import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Image,
  ScrollView,
  Share,
  Clipboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import {
  searchLegalKnowledge,
  getNoMatchResponse,
  QUICK_QUESTIONS,
} from "@/data/legalKnowledge";

const LOGO = require("@/assets/images/infradz-logo.png");

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  articles?: string[];
}

const WELCOME_MSG: Message = {
  id: "welcome",
  text: getNoMatchResponse(),
  isUser: false,
  timestamp: new Date(),
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function buildResponse(userMsg: string): { text: string; articles: string[] } {
  const results = searchLegalKnowledge(userMsg);
  if (results.length === 0) {
    return { text: getNoMatchResponse(), articles: [] };
  }
  const top = results[0];
  const articles = top.articles;
  return { text: top.answer, articles };
}

export default function AssistantScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = (text ?? input).trim();
      if (!msg || isTyping) return;
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setInput("");
      const userMsg: Message = {
        id: uid() + "u",
        text: msg,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [userMsg, ...prev]);
      setIsTyping(true);

      const delay = 700 + Math.random() * 600;
      setTimeout(() => {
        const { text: responseText, articles } = buildResponse(msg);
        const botMsg: Message = {
          id: uid() + "b",
          text: responseText,
          isUser: false,
          timestamp: new Date(),
          articles,
        };
        setMessages((prev) => [botMsg, ...prev]);
        setIsTyping(false);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, delay);
    },
    [input, isTyping]
  );

  const copyText = useCallback((text: string) => {
    if (Clipboard && Clipboard.setString) {
      Clipboard.setString(text);
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const shareText = useCallback(async (text: string) => {
    try {
      await Share.share({
        message: `InfraDZ — Code de route Algérien 2026\n\n${text}`,
      });
    } catch {}
  }, []);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MSG]);
    setInput("");
    setIsTyping(false);
  }, []);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: "#0D0D0D",
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
      paddingHorizontal: 16,
      paddingBottom: 14,
    },
    headerRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 12,
    },
    logoImg: { width: 38, height: 38, borderRadius: 10 },
    headerText: { flex: 1, alignItems: "flex-end" },
    headerTitleRow: { flexDirection: "row", alignItems: "baseline" },
    titleInfra: { fontSize: 17, fontWeight: "900" as const, color: "#FFFFFF" },
    titleDZ: { fontSize: 17, fontWeight: "900" as const, color: "#DC143C" },
    headerSub: { fontSize: 11, color: "#FFFFFF66", marginTop: 1 },
    onlineBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "#006233" + "25",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#30D158" },
    onlineText: { fontSize: 10, color: "#30D158", fontWeight: "700" as const },
    clearBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#FFFFFF12",
      alignItems: "center",
      justifyContent: "center",
    },

    /* Chat list */
    flatList: { flex: 1 },
    listContent: {
      paddingHorizontal: 14,
      paddingBottom: 16,
      paddingTop: 10,
      flexDirection: "column-reverse",
    },

    /* Typing indicator */
    typingRow: {
      flexDirection: "row-reverse",
      alignItems: "center",
      paddingVertical: 8,
      gap: 8,
    },
    typingAvatar: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: "#0D0D0D",
      alignItems: "center",
      justifyContent: "center",
    },
    typingBubble: {
      flexDirection: "row",
      gap: 5,
      backgroundColor: colors.card,
      borderRadius: 14,
      borderBottomRightRadius: 4,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    typingDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: colors.primary,
    },

    /* Message bubble */
    msgRow: {
      flexDirection: "row-reverse",
      marginBottom: 10,
      alignItems: "flex-end",
      gap: 8,
    },
    userMsgRow: { flexDirection: "row", marginBottom: 10 },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: "#0D0D0D",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    botBubble: {
      maxWidth: "82%",
      backgroundColor: colors.card,
      borderRadius: 16,
      borderBottomRightRadius: 4,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userBubble: {
      maxWidth: "82%",
      backgroundColor: "#DC143C",
      borderRadius: 16,
      borderBottomLeftRadius: 4,
      padding: 14,
    },
    botText: {
      fontSize: 14,
      color: colors.foreground,
      textAlign: "right",
      lineHeight: 22,
      writingDirection: "rtl",
    },
    userText: {
      fontSize: 14,
      color: "#FFFFFF",
      textAlign: "right",
      lineHeight: 22,
      writingDirection: "rtl",
    },
    timestamp: {
      fontSize: 10,
      color: colors.mutedForeground,
      marginTop: 6,
      textAlign: "right",
    },
    articleTags: {
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 8,
    },
    articleTag: {
      backgroundColor: "#DC143C15",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderWidth: 1,
      borderColor: "#DC143C30",
    },
    articleTagText: {
      fontSize: 10,
      color: "#DC143C",
      fontWeight: "700" as const,
    },
    actionRow: {
      flexDirection: "row-reverse",
      gap: 8,
      marginTop: 8,
    },
    actionBtn: {
      flexDirection: "row-reverse",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.muted,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    actionBtnText: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontWeight: "600" as const,
    },

    /* Quick questions */
    quickWrap: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    quickScroll: { paddingVertical: 10, paddingHorizontal: 14 },
    quickChip: {
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginLeft: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    quickChipText: {
      fontSize: 12,
      color: colors.foreground,
      fontWeight: "600" as const,
      writingDirection: "rtl",
    },

    /* Input bar */
    inputBar: {
      flexDirection: "row-reverse",
      alignItems: "flex-end",
      gap: 10,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: insets.bottom > 0 ? insets.bottom + 6 : 16,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    input: {
      flex: 1,
      minHeight: 42,
      maxHeight: 100,
      backgroundColor: colors.muted,
      borderRadius: 21,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.foreground,
      textAlign: "right",
      writingDirection: "rtl",
      borderWidth: 1,
      borderColor: colors.border,
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "#DC143C",
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: { backgroundColor: colors.muted },
  });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" });

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.isUser) {
      return (
        <View style={s.userMsgRow}>
          <View style={s.userBubble}>
            <Text style={s.userText}>{item.text}</Text>
            <Text style={[s.timestamp, { color: "#FFFFFF66" }]}>
              {formatTime(item.timestamp)}
            </Text>
          </View>
        </View>
      );
    }
    return (
      <View style={s.msgRow}>
        <View style={s.avatar}>
          <Image source={LOGO} style={{ width: 28, height: 28, borderRadius: 6 }} resizeMode="cover" />
        </View>
        <View style={s.botBubble}>
          <Text style={s.botText}>{item.text}</Text>
          {item.articles && item.articles.length > 0 && (
            <View style={s.articleTags}>
              {item.articles.map((art) => (
                <View key={art} style={s.articleTag}>
                  <Text style={s.articleTagText}>📖 {art}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={s.actionRow}>
            <TouchableOpacity style={s.actionBtn} onPress={() => shareText(item.text)}>
              <Text style={s.actionBtnText}>مشاركة</Text>
              <Feather name="share-2" size={11} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} onPress={() => copyText(item.text)}>
              <Text style={s.actionBtnText}>نسخ</Text>
              <Feather name="copy" size={11} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={s.timestamp}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  const renderTyping = () => (
    <View style={s.typingRow}>
      <View style={s.typingAvatar}>
        <Image source={LOGO} style={{ width: 28, height: 28, borderRadius: 6 }} resizeMode="cover" />
      </View>
      <View style={s.typingBubble}>
        <View style={[s.typingDot, { opacity: 0.4 }]} />
        <View style={[s.typingDot, { opacity: 0.7 }]} />
        <View style={s.typingDot} />
      </View>
    </View>
  );

  const data: Message[] = isTyping
    ? [{ id: "__typing__", text: "", isUser: false, timestamp: new Date() }, ...messages]
    : messages;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <View style={s.clearBtn}>
            <TouchableOpacity onPress={clearChat}>
              <Feather name="trash-2" size={15} color="#FFFFFF66" />
            </TouchableOpacity>
          </View>

          <View style={s.onlineBadge}>
            <View style={s.onlineDot} />
            <Text style={s.onlineText}>يعمل بدون إنترنت</Text>
          </View>

          <View style={s.headerText}>
            <View style={s.headerTitleRow}>
              <Text style={s.titleDZ}>DZ</Text>
              <Text style={s.titleInfra}>Infra</Text>
            </View>
            <Text style={s.headerSub}>المساعد القانوني — قانون 09-26</Text>
          </View>

          <Image source={LOGO} style={s.logoImg} resizeMode="cover" />
        </View>
      </View>

      {/* Chat */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={flatRef}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            item.id === "__typing__" ? renderTyping() : renderMessage({ item })
          }
          inverted
          contentContainerStyle={s.listContent}
          style={s.flatList}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        />

        {/* Quick questions */}
        <View style={s.quickWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.quickScroll}
          >
            {QUICK_QUESTIONS.map((q) => (
              <TouchableOpacity
                key={q}
                style={s.quickChip}
                onPress={() => sendMessage(q)}
              >
                <Text style={s.quickChipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input bar */}
        <View style={s.inputBar}>
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || isTyping) && s.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || isTyping}
          >
            <Feather name="send" size={18} color={!input.trim() || isTyping ? colors.mutedForeground : "#FFFFFF"} />
          </TouchableOpacity>

          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="اسأل عن أي مخالفة أو قانون..."
            placeholderTextColor={colors.mutedForeground}
            textAlign="right"
            multiline
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
