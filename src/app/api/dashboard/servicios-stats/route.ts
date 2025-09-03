// // api/dashboard/servicios-stats/route.ts
// // Propósito: API para estadísticas de servicios agrupados por estado, para el PieChart.
// // Usa groupBy de Prisma y cache para optimización.
// // src/app/api/dashboard/servicios-stats/route.ts

// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { executeDashboardQuery, dashboardCache } from '@/lib/db-utils';

// export async function GET() {
//   try {
//     const CACHE_KEY = 'dashboard-servicios-stats';
    
//     const cachedData = dashboardCache.get(CACHE_KEY);
//     if (cachedData) {
//       return NextResponse.json(cachedData);
//     }

//     // Consulta optimizada con groupBy
//     const serviciosStats = await executeDashboardQuery(
//       async () => {
//         const result = await prisma.servicio.groupBy({
//           by: ['estado'],
//           _count: { id: true },
//           orderBy: { _count: { id: 'desc' } }
//         });
//         return result;
//       },
//       []
//     );

//     // Formatear datos
//     const formattedData = serviciosStats.length > 0 
//       ? serviciosStats.map((item: any) => ({
//           name: item.estado,
//           cantidad: item._count.id
//         }))
//       : [
//           { name: 'Pendiente', cantidad: 0 },
//           { name: 'Completado', cantidad: 0 },
//           { name: 'Cancelado', cantidad: 0 }
//         ];

//     // Cache por 8 minutos
//     dashboardCache.set(CACHE_KEY, formattedData, 8);

//     return NextResponse.json(formattedData);

//   } catch (error) {
//     console.error('Error en servicios stats:', error);
    
//     const defaultData = [
//       { name: 'Pendiente', cantidad: 0 },
//       { name: 'Completado', cantidad: 0 },
//       { name: 'Cancelado', cantidad: 0 }
//     ];

//     return NextResponse.json(defaultData);
//   }
// }