// api/dashboard/citas-chart/route.ts
// Propósito: API para obtener datos de citas por día (últimos 7 días) para el gráfico LineChart.
// Usa cache para evitar consultas repetidas y maneja errores con datos por defecto.
// src/app/api/dashboard/citas-chart/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeDashboardQuery, dashboardCache } from '@/lib/db-utils';

export async function GET() {
  try {
    const CACHE_KEY = 'dashboard-citas-chart';
    
    const cachedData = dashboardCache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Pre-calcular fechas una sola vez
    const today = new Date();
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return date;
    });

    // Consulta única optimizada con WHERE IN
    const startDate = dates[0];
    const endDate = new Date(dates[6].getTime() + 24 * 60 * 60 * 1000);

    const citasRaw = await executeDashboardQuery(
      async () => {
        // Usar DATE() para agrupar por día en una sola consulta
        const result = await prisma.$queryRaw<Array<{fecha: Date, count: bigint}>>`
          SELECT DATE(fechaHora) as fecha, COUNT(*) as count
          FROM Cita 
          WHERE fechaHora >= ${startDate} AND fechaHora < ${endDate}
          GROUP BY DATE(fechaHora)
          ORDER BY fecha ASC
        `;
        return result;
      },
      []
    );

    // Mapear resultados con fechas faltantes
    const citasMap = new Map<string, number>();
    citasRaw.forEach(item => {
      const dateKey = new Date(item.fecha).toDateString();
      citasMap.set(dateKey, Number(item.count));
    });

    const citasData = dates.map(date => ({
      fecha: date.toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      citas: citasMap.get(date.toDateString()) ?? 0
    }));

    // Cache por 5 minutos
    dashboardCache.set(CACHE_KEY, citasData, 5);

    return NextResponse.json(citasData);

  } catch (error) {
    console.error('Error en citas chart:', error);
    
    // Datos por defecto
    const defaultData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        fecha: date.toLocaleDateString('es-PE', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        citas: 0
      };
    });

    return NextResponse.json(defaultData);
  }
}