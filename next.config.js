/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Esto omite los errores de ESLint durante el build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig