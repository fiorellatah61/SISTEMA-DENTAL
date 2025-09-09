// // src/app/api/dashboard/ingresos-mensuales/route.ts
// // Propósito: API para calcular ingresos mensuales de los últimos 6 meses para el BarChart.
// // Optimiza con cache y consultas paralelas, maneja errores.
// // ========== API: Ingresos Mensuales ==========
// // src/app/api/dashboard/ingresos-mensuales/route.ts

// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { executeDashboardQuery, dashboardCache } from '@/lib/db-utils';

// export async function GET() {
//   try {
//     const CACHE_KEY = 'dashboard-ingresos-mensuales';
    
//     const cachedData = dashboardCache.get(CACHE_KEY);
//     if (cachedData) {
//       return NextResponse.json(cachedData);
//     }

//     // Calcular fechas de los últimos 6 meses
//     const currentDate = new Date();
//     const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);
//     const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

//     // Consulta única optimizada
//     const ingresosRaw = await executeDashboardQuery(
//       async () => {
//         const result = await prisma.$queryRaw<Array<{mes: number, anio: number, total: number}>>`
//           SELECT 
//             MONTH(fechaEmision) as mes,
//             YEAR(fechaEmision) as anio,
//             SUM(monto) as total
//           FROM facturas
//           WHERE estado = 'COMPLETADO' 
//             AND fechaEmision >= ${startDate} 
//             AND fechaEmision <= ${endDate}
//           GROUP BY YEAR(fechaEmision), MONTH(fechaEmision)
//           ORDER BY anio ASC, mes ASC
//         `;
//         return result;
//       },
//       []
//     );

//     // Crear map de resultados
//     const ingresosMap = new Map<string, number>();
//     ingresosRaw.forEach(item => {
//       const key = `${item.anio}-${item.mes}`;
//       ingresosMap.set(key, Number(item.total));
//     });

//     // Generar datos con meses faltantes
//     const ingresosData = Array.from({ length: 6 }, (_, i) => {
//       const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1);
//       const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
//       return {
//         mes: date.toLocaleDateString('es-PE', { 
//           month: 'short',
//           year: '2-digit'
//         }),
//         ingresos: ingresosMap.get(key) ?? 0
//       };
//     });

//     // Cache por 10 minutos
//     dashboardCache.set(CACHE_KEY, ingresosData, 10);

//     return NextResponse.json(ingresosData);

//   } catch (error) {
//     console.error('Error en ingresos mensuales:', error);
    
//     // Datos por defecto
//     const currentDate = new Date();
//     const defaultData = Array.from({ length: 6 }, (_, i) => {
//       const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1);
//       return {
//         mes: date.toLocaleDateString('es-PE', { 
//           month: 'short',
//           year: '2-digit'
//         }),
//         ingresos: 0
//       };
//     });

//     return NextResponse.json(defaultData);
//   }
// }


//=================0nuevo

// // src/app/api/dashboard/ingresos-mensuales/route.ts
// // Propósito: API para calcular ingresos mensuales de los últimos 6 meses para el BarChart.
// // Optimiza con cache y consultas paralelas, maneja errores.
// // ========== API: Ingresos Mensuales ==========

// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { executeDashboardQuery, dashboardCache } from '@/lib/db-utils';

// export async function GET() {
//   try {
//     const CACHE_KEY = 'dashboard-ingresos-mensuales';
    
//     const cachedData = dashboardCache.get(CACHE_KEY);
//     if (cachedData) {
//       return NextResponse.json(cachedData);
//     }

//     // Calcular fechas de los últimos 6 meses
//     const currentDate = new Date();
//     const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);
//     const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

//     // Consulta única optimizada - CORREGIDO: usar nombres correctos de tabla y columnas
//     const ingresosRaw = await executeDashboardQuery(
//       async () => {
//         const result = await prisma.$queryRaw<Array<{mes: number, anio: number, total: number}>>`
//           SELECT 
//             MONTH(fecha_emision) as mes,
//             YEAR(fecha_emision) as anio,
//             SUM(monto) as total
//           FROM facturas
//           WHERE estado = 'COMPLETADO' 
//             AND fecha_emision >= ${startDate} 
//             AND fecha_emision <= ${endDate}
//           GROUP BY YEAR(fecha_emision), MONTH(fecha_emision)
//           ORDER BY anio ASC, mes ASC
//         `;
//         return result;
//       },
//       []
//     );

//     // Crear map de resultados
//     const ingresosMap = new Map<string, number>();
//     ingresosRaw.forEach(item => {
//       const key = `${item.anio}-${item.mes}`;
//       ingresosMap.set(key, Number(item.total));
//     });

//     // Generar datos con meses faltantes
//     const ingresosData = Array.from({ length: 6 }, (_, i) => {
//       const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1);
//       const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
//       return {
//         mes: date.toLocaleDateString('es-PE', { 
//           month: 'short',
//           year: '2-digit'
//         }),
//         ingresos: ingresosMap.get(key) ?? 0
//       };
//     });

//     // Cache por 10 minutos
//     dashboardCache.set(CACHE_KEY, ingresosData, 10);

//     return NextResponse.json(ingresosData);

//   } catch (error) {
//     console.error('Error en ingresos mensuales:', error);
    
//     // Datos por defecto
//     const currentDate = new Date();
//     const defaultData = Array.from({ length: 6 }, (_, i) => {
//       const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1);
//       return {
//         mes: date.toLocaleDateString('es-PE', { 
//           month: 'short',
//           year: '2-digit'
//         }),
//         ingresos: 0
//       };
//     });

//     return NextResponse.json(defaultData);
//   }
// }

// ===NUEVOOOOOOOOOOO======================

// src/app/api/dashboard/ingresos-mensuales/route.ts
// Propósito: API para calcular ingresos mensuales de los últimos 6 meses para el BarChart.
// Optimiza con cache y consultas paralelas, maneja errores.
// ========== API: Ingresos Mensuales ==========
// src/app/api/dashboard/ingresos-mensuales/route.ts
// Propósito: API para calcular ingresos mensuales de los últimos 6 meses para el BarChart.
// Optimiza con cache y consultas paralelas, maneja errores.
// ========== API: Ingresos Mensuales ==========
// src/app/api/dashboard/ingresos-mensuales/route.ts
// Propósito: API para calcular ingresos mensuales de los últimos 6 meses para el BarChart.
// Optimiza con cache y consultas paralelas, maneja errores.
// ========== API: Ingresos Mensuales ==========

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeDashboardQuery, dashboardCache } from '@/lib/db-utils';

export async function GET() {
  try {
    const CACHE_KEY = 'dashboard-ingresos-mensuales';
    
    const cachedData = dashboardCache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Calcular fechas de los últimos 6 meses
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Consulta usando ORM de Prisma (más seguro que SQL raw)
    const ingresosRaw = await executeDashboardQuery(
      async () => {
        const result = await prisma.factura.findMany({
          where: {
            estado: 'COMPLETADO', // Usa el enum del modelo, Prisma se encarga del mapeo
            fechaEmision: {
              gte: startDate,
              lte: endDate
            }
          },
          select: {
            monto: true,
            fechaEmision: true
          }
        });
        
        // Procesar agrupación en JavaScript
        const groupedData = new Map<string, number>();
        result.forEach(factura => {
          const date = factura.fechaEmision;
          const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          const current = groupedData.get(key) || 0;
          groupedData.set(key, current + Number(factura.monto));
        });
        
        return Array.from(groupedData.entries()).map(([key, total]) => {
          const [anio, mes] = key.split('-');
          return { mes: parseInt(mes), anio: parseInt(anio), total };
        });
      },
      []
    );

    // Crear map de resultados
    const ingresosMap = new Map<string, number>();
    ingresosRaw.forEach(item => {
      const key = `${item.anio}-${item.mes}`;
      ingresosMap.set(key, Number(item.total));
    });

    // Generar datos con meses faltantes
    const ingresosData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      return {
        mes: date.toLocaleDateString('es-PE', { 
          month: 'short',
          year: '2-digit'
        }),
        ingresos: ingresosMap.get(key) ?? 0
      };
    });

    // Cache por 10 minutos
    dashboardCache.set(CACHE_KEY, ingresosData, 10);

    return NextResponse.json(ingresosData);

  } catch (error) {
    console.error('Error en ingresos mensuales:', error);
    
    // Datos por defecto
    const currentDate = new Date();
    const defaultData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1);
      return {
        mes: date.toLocaleDateString('es-PE', { 
          month: 'short',
          year: '2-digit'
        }),
        ingresos: 0
      };
    });

    return NextResponse.json(defaultData);
  }
}