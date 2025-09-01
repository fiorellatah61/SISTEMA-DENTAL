// src/app/api/dashboard/ingresos-mensuales/route.ts
// Propósito: API para calcular ingresos mensuales de los últimos 6 meses para el BarChart.
// Optimiza con cache y consultas paralelas, maneja errores.
// ========== API: Ingresos Mensuales ==========
// src/app/api/dashboard/ingresos-mensuales/route.ts

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

    // Consulta única optimizada
    const ingresosRaw = await executeDashboardQuery(
      async () => {
        const result = await prisma.$queryRaw<Array<{mes: number, anio: number, total: number}>>`
          SELECT 
            MONTH(fechaEmision) as mes,
            YEAR(fechaEmision) as anio,
            SUM(monto) as total
          FROM Factura 
          WHERE estado = 'COMPLETADO' 
            AND fechaEmision >= ${startDate} 
            AND fechaEmision <= ${endDate}
          GROUP BY YEAR(fechaEmision), MONTH(fechaEmision)
          ORDER BY anio ASC, mes ASC
        `;
        return result;
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
