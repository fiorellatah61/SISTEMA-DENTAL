
// src/app/api/dashboard/stats/route.ts
// Propósito: API principal para estadísticas generales del dashboard.
// Optimiza con consultas paralelas (Promise.all), cache y manejo de errores con fallbacks.
// src/app/api/dashboard/stats/route.ts
// OPTIMIZADO para Railway: consultas paralelas más eficientes y cache agresivo

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeDashboardQuery, dashboardCache, executeBatchQueries } from '@/lib/db-utils';

export async function GET() {
  try {
    const CACHE_KEY = 'dashboard-stats';
    
    // Cache más agresivo (2 minutos)
    const cachedData = dashboardCache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Fechas precalculadas una sola vez
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const next7Days = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    // Consultas optimizadas en lotes para Railway
    const queries = [
      // Lote 1: Conteos simples de pacientes
      () => prisma.paciente.count(),
      () => prisma.paciente.count({ where: { estado: 'ACTIVO' } }),
      
      // Lote 2: Citas por período
      () => prisma.cita.count({
        where: {
          fechaHora: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }),
      () => prisma.cita.count({
        where: {
          fechaHora: { gte: weekStart, lte: now }
        }
      }),
      () => prisma.cita.count({
        where: {
          estado: 'CONFIRMADA',
          fechaHora: { gte: now, lte: next7Days }
        }
      }),
      
      // Lote 3: Fichas
      () => prisma.fichaOdontologica.count({ where: { estado: 'ACTIVA' } }),
      () => prisma.fichaOdontologica.count({
        where: {
          fechaRegistro: { gte: monthStart, lte: now }
        }
      }),
      
      // Lote 4: Servicios y facturas
      () => prisma.servicio.count({ where: { estado: 'Pendiente' } }),
      () => prisma.factura.count({ where: { estado: 'PENDIENTE' } })
    ];

    // Ejecutar consultas en lotes con concurrencia limitada
    const results = await executeBatchQueries(queries, 3);
    
    // Consultas de agregación separadas (más pesadas)
    const [montoFacturasPendientes, ingresosMesActual, ingresosMesAnterior] = await Promise.allSettled([
      executeDashboardQuery(
        async () => {
          const result = await prisma.factura.aggregate({
            where: { estado: 'PENDIENTE' },
            _sum: { monto: true }
          });
          return Number(result._sum.monto ?? 0);
        },
        0
      ),
      
      executeDashboardQuery(
        async () => {
          const result = await prisma.factura.aggregate({
            where: {
              estado: 'COMPLETADO',
              fechaEmision: { gte: monthStart, lte: now }
            },
            _sum: { monto: true }
          });
          return Number(result._sum.monto ?? 0);
        },
        0
      ),
      
      executeDashboardQuery(
        async () => {
          const result = await prisma.factura.aggregate({
            where: {
              estado: 'COMPLETADO',
              fechaEmision: { gte: lastMonthStart, lte: lastMonthEnd }
            },
            _sum: { monto: true }
          });
          return Number(result._sum.monto ?? 0);
        },
        0
      )
    ]);

    // Estados de citas optimizado
    const citasPorEstadoRaw = await executeDashboardQuery(
      async () => {
        const result = await prisma.cita.groupBy({
          by: ['estado'],
          _count: { estado: true },
          where: {
            fechaHora: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        });
        return result;
      },
      []
    );

    // Extraer valores con fallbacks
    const [
      totalPacientes = 0,
      pacientesActivos = 0,
      citasHoy = 0,
      citasSemana = 0,
      citasConfirmadas = 0,
      fichasActivas = 0,
      fichasMes = 0,
      serviciosPendientes = 0,
      facturasPendientes = 0
    ] = results;

    const montoFacturas = montoFacturasPendientes.status === 'fulfilled' ? montoFacturasPendientes.value : 0;
    const ingresosActual = ingresosMesActual.status === 'fulfilled' ? ingresosMesActual.value : 0;
    const ingresosAnterior = ingresosMesAnterior.status === 'fulfilled' ? ingresosMesAnterior.value : 0;

    // Calcular crecimiento
    const crecimientoIngresos = ingresosAnterior > 0 
      ? Math.round(((ingresosActual - ingresosAnterior) / ingresosAnterior) * 100)
      : 0;

    // Formatear estados de citas
    const citasPorEstado = {
      confirmadas: citasPorEstadoRaw.find((c: any) => c.estado === 'CONFIRMADA')?._count?.estado ?? 0,
      pendientes: citasPorEstadoRaw.find((c: any) => c.estado === 'SOLICITADA')?._count?.estado ?? 0,
      modificadas: citasPorEstadoRaw.find((c: any) => c.estado === 'MODIFICADA')?._count?.estado ?? 0,
      canceladas: citasPorEstadoRaw.find((c: any) => c.estado === 'CANCELADA')?._count?.estado ?? 0
    };

    const stats = {
      totalPacientes,
      pacientesActivos,
      citasHoy,
      citasSemana,
      citasConfirmadas,
      fichasActivas,
      fichasMes,
      serviciosPendientes,
      facturasPendientes,
      montoFacturasPendientes: montoFacturas,
      ingresosMes: ingresosActual,
      crecimientoIngresos,
      citasPorEstado
    };

    // Cache por 2 minutos (más agresivo)
    dashboardCache.set(CACHE_KEY, stats, 2);

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error en dashboard stats:', error);
    
    // Fallback completo
    const fallbackStats = {
      totalPacientes: 0,
      pacientesActivos: 0,
      citasHoy: 0,
      citasSemana: 0,
      citasConfirmadas: 0,
      fichasActivas: 0,
      fichasMes: 0,
      serviciosPendientes: 0,
      facturasPendientes: 0,
      montoFacturasPendientes: 0,
      ingresosMes: 0,
      crecimientoIngresos: 0,
      citasPorEstado: {
        confirmadas: 0,
        pendientes: 0,
        modificadas: 0,
        canceladas: 0
      }
    };

    return NextResponse.json(fallbackStats);
  }
}