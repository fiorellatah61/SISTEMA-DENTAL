const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Crear alias para que las rutas de Prisma funcionen
    config.resolve.alias['../../../../generated/prisma'] = path.resolve(__dirname, 'src/generated/prisma')
    config.resolve.alias['../../../generated/prisma'] = path.resolve(__dirname, 'src/generated/prisma')
    
    return config
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./src/generated/prisma/**/*'],
    },
  },
}

module.exports = nextConfig