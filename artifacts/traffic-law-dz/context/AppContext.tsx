import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppContextType {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (c: string | null) => void;
}

const AppContext = createContext<AppContextType>({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  isDarkMode: false,
  toggleDarkMode: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  selectedCategory: null,
  setSelectedCategory: () => {},
});

const FAVORITES_KEY = "@traffic_law_favorites";
const DARK_MODE_KEY = "@traffic_law_dark_mode";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === "dark");
  const [darkModeSet, setDarkModeSet] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const storedFavs = await AsyncStorage.getItem(FAVORITES_KEY);
        if (storedFavs) setFavorites(JSON.parse(storedFavs));
        const storedDark = await AsyncStorage.getItem(DARK_MODE_KEY);
        if (storedDark !== null) {
          setIsDarkMode(JSON.parse(storedDark));
          setDarkModeSet(true);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!darkModeSet) {
      setIsDarkMode(systemScheme === "dark");
    }
  }, [systemScheme, darkModeSet]);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const next = favorites.includes(id)
        ? favorites.filter((f) => f !== id)
        : [...favorites, id];
      setFavorites(next);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    },
    [favorites]
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const toggleDarkMode = useCallback(async () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    setDarkModeSet(true);
    await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(next));
  }, [isDarkMode]);

  return (
    <AppContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        isDarkMode,
        toggleDarkMode,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
