
// // lib/prisma.ts
// import { PrismaClient } from '@prisma/client'

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined
// }

// export const prisma = globalForPrisma.prisma ?? new PrismaClient({
//   log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
//   errorFormat: 'minimal',
// })

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma
// }


// lib/prisma.ts - Configuración optimizada para Railway

//----NUEVO------------------------------------------------------------------
// import { PrismaClient } from '@prisma/client';

// declare global {
//   var prisma: PrismaClient | undefined;
// }

// const createPrismaClient = () => {
//   return new PrismaClient({
//     log: ['error', 'warn'], // Solo errores y warnings en producción
//     datasources: {
//       db: {
//         url: process.env.DATABASE_URL,
//       },
//     },
//     // Configuraciones optimizadas para Railway
//     ...(process.env.NODE_ENV === 'production' && {
//       datasources: {
//         db: {
//           url: process.env.DATABASE_URL + '?connection_limit=5&pool_timeout=10&socket_timeout=10',
//         },
//       },
//     })
//   });
// };

// export const prisma = globalThis.prisma ?? createPrismaClient();

// if (process.env.NODE_ENV !== 'production') {
//   globalThis.prisma = prisma;
// }

//========================================NUEVO=====================================
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = 
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma