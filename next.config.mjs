/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // ✅ Force dynamic rendering (prevents SSR build-time errors)
  output: 'standalone',
  
  // Skip static generation for pages with client-side dependencies
  trailingSlash: false,
  experimental: {
    forceSwcTransforms: true,
  },
}

export default nextConfig
