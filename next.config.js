/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["flowbite-react", "@tremor/react"],
    serverComponentsExternalPackages: [
      "@react-email/render",
      "@react-email/components",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
};

module.exports = nextConfig;
