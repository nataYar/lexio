import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ✅ This allows production builds to complete even with TS errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // (Optional) This allows production builds even if you have ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
