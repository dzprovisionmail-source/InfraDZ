import colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

export function useColors() {
  const { isDarkMode } = useApp();
  if (isDarkMode) {
    return { ...colors.dark, radius: colors.radius };
  }
  return { ...colors.light, radius: colors.radius };
}
