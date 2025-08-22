import withPWA from "@ducanh2912/next-pwa";

const nextConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true
})({
  experimental: { appDir: true },
  reactStrictMode: true
});

export default nextConfig;
