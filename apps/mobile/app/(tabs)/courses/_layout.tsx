import { Stack } from "expo-router";

/** Nécessaire dès qu'un dossier sous (tabs)/ contient plusieurs écrans
 * (ici index.tsx + [id].tsx) : sans ce _layout.tsx, Expo Router ne
 * l'expose pas correctement comme une seule route "courses" au Tabs
 * parent, d'où l'avertissement "No route named courses exists in
 * nested children". */
export default function CoursesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
