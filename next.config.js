/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker deployment
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com', // Clerk user avatars
      },
    ],
  },
}

module.exports = nextConfig
