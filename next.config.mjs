/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Force dynamic rendering (prevents SSR build-time errors)
  output: 'standalone',
};

export default nextConfig;
