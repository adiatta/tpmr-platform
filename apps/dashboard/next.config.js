/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Nécessaire depuis Next.js 16 : le serveur de dev bloque par défaut les
  // requêtes HMR (webpack-hmr) venant d'une origine différente de
  // localhost — ce qui inclut l'accès via l'IP réseau locale (utile pour
  // tester sur un autre appareil du même Wi-Fi, ou si le dashboard doit
  // être joignable par l'app mobile). Sans ça, la page se charge mais reste
  // bloquée indéfiniment car le HMR ne peut jamais se connecter.
  allowedDevOrigins: ["172.20.10.2"],
};

module.exports = nextConfig;