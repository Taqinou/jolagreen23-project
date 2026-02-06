import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scontent-*.cdninstagram.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i-p.rmcdn.net",
        pathname: "/**",
      },
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
