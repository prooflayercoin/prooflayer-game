/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@prooflayer/shared", "@prooflayer/config"],
  reactStrictMode: true,
};

export default nextConfig;
