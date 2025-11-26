import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performans optimizasyonları
  reactStrictMode: true,
  
  // Sayfa geçişlerini hızlandır
  poweredByHeader: false,
  
  // Görüntü optimizasyonu
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compiler optimizasyonları
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Experimental özellikler (opsiyonel, performans için)
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
