/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_BUILD_DIR || ".next",
  images: {
    domains: [],
  },
  // Enable transpilation for three.js packages
  transpilePackages: ['three'],
};

module.exports = nextConfig;
