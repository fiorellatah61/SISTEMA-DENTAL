
// // ========================================
// // 2. src/app/api/dashboard/stats/route.ts
// // ========================================
// import { NextResponse } from 'next/server'
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient()

// export async function GET() {
//   try {
//     // Obtener fecha actual para filtros
//     const hoy = new Date()
//     const inicioHoy = new Date(hoy)
//     inicioHoy.setHours(0, 0, 0, 0)
//     const finHoy = new Date(hoy)
//     finHoy.setHours(23, 59, 59, 999)
    
//     // Obtener primer y último día del mes actual
//     const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
//     const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999)

//     // 1. Total de pacientes registrados
//     const totalPacientes = await prisma.paciente.count({
//       where: {
//         estado: 'ACTIVO'
//       }
//     })

//     // 2. Pacientes nuevos hoy (basado en fecha de registro de ficha)
//     const pacientesNuevosHoy = await prisma.fichaOdontologica.count({
//       where: {
//         fechaRegistro: {
//           gte: inicioHoy,
//           lte: finHoy
//         }
//       }
//     })

//     // 3. Citas programadas para hoy
//     const citasHoy = await prisma.cita.count({
//       where: {
//         fechaHora: {
//           gte: inicioHoy,
//           lte: finHoy
//         },
//         estado: {
//           in: ['CONFIRMADA', 'SOLICITADA']
//         }
//       }
//     })

//     // 4. Citas pendientes (todas las futuras no confirmadas)
//     const citasPendientes = await prisma.cita.count({
//       where: {
//         fechaHora: {
//           gte: new Date()
//         },
//         estado: 'SOLICITADA'
//       }
//     })

//     // 5. Ingresos mensuales (suma de facturas completadas este mes)
//     const ingresosMensualesResult = await prisma.factura.aggregate({
//       _sum: {
//         monto: true
//       },
//       where: {
//         fechaEmision: {
//           gte: inicioMes,
//           lte: finMes
//         },
//         estado: 'COMPLETADO'
//       }
//     })

//     // 6. Fichas activas
//     const fichasActivas = await prisma.fichaOdontologica.count({
//       where: {
//         estado: 'ACTIVA'
//       }
//     })

//     // 7. Distribución de citas por estado (últimos 30 días)
//     const hace30Dias = new Date()
//     hace30Dias.setDate(hace30Dias.getDate() - 30)

//     const citasPorEstado = await prisma.cita.groupBy({
//       by: ['estado'],
//       _count: {
//         estado: true
//       },
//       where: {
//         fechaHora: {
//           gte: hace30Dias
//         }
//       }
//     })

//     // Formatear datos de citas por estado
//     const citasEstadoFormateado = {
//       confirmadas: citasPorEstado.find(c => c.estado === 'CONFIRMADA')?._count.estado || 0,
//       pendientes: citasPorEstado.find(c => c.estado === 'SOLICITADA')?._count.estado || 0,
//       canceladas: citasPorEstado.find(c => c.estado === 'CANCELADA')?._count.estado || 0
//     }

//     // Respuesta final
//     const stats = {
//       totalPacientes,
//       pacientesNuevosHoy,
//       citasHoy,
//       citasPendientes,
//       ingresosMensuales: Number(ingresosMensualesResult._sum.monto) || 0,
//       fichasActivas,
//       citasPorEstado: citasEstadoFormateado
//     }

//     return NextResponse.json(stats)

//   } catch (error) {
//     console.error('Error al obtener estadísticas del dashboard:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }
// // NUEVO----------------------- CON SINGLETON PERO USA 8 CONSULTAS---------
// // src/app/api/dashboard/stats/route.ts
// import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function GET() {
//   try {
//     // Obtener fecha actual para filtros
//     const hoy = new Date()
//     const inicioHoy = new Date(hoy)
//     inicioHoy.setHours(0, 0, 0, 0)
//     const finHoy = new Date(hoy)
//     finHoy.setHours(23, 59, 59, 999)

//     // Obtener primer y último día del mes actual
//     const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
//     const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999)

//     // Usar Promise.all para optimizar consultas paralelas
//     const [
//       totalPacientes,
//       pacientesNuevosHoy,
//       citasHoy,
//       citasPendientes,
//       ingresosMensualesResult,
//       fichasActivas,
//       citasPorEstado,
//       serviciosActivos
//     ] = await Promise.all([
//       // 1. Total de pacientes activos
//       prisma.paciente.count({
//         where: {
//           estado: 'ACTIVO'
//         }
//       }),

//       // 2. Pacientes nuevos hoy
//       prisma.fichaOdontologica.count({
//         where: {
//           fechaRegistro: {
//             gte: inicioHoy,
//             lte: finHoy
//           }
//         }
//       }),

//       // 3. Citas programadas para hoy
//       prisma.cita.count({
//         where: {
//           fechaHora: {
//             gte: inicioHoy,
//             lte: finHoy
//           },
//           estado: {
//             in: ['CONFIRMADA', 'SOLICITADA', 'MODIFICADA']
//           }
//         }
//       }),

//       // 4. Citas pendientes
//       prisma.cita.count({
//         where: {
//           fechaHora: {
//             gte: new Date()
//           },
//           estado: 'SOLICITADA'
//         }
//       }),

//       // 5. Ingresos mensuales
//       prisma.factura.aggregate({
//         _sum: {
//           monto: true
//         },
//         where: {
//           fechaEmision: {
//             gte: inicioMes,
//             lte: finMes
//           },
//           estado: 'COMPLETADO'
//         }
//       }),

//       // 6. Fichas activas
//       prisma.fichaOdontologica.count({
//         where: {
//           estado: 'ACTIVA'
//         }
//       }),

//       // 7. Distribución de citas por estado (últimos 30 días)
//       prisma.cita.groupBy({
//         by: ['estado'],
//         _count: {
//           estado: true
//         },
//         where: {
//           fechaHora: {
//             gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
//           }
//         }
//       }),

//       // 8. Servicios activos
//       prisma.servicio.count({
//         where: {
//           estado: 'Activo'
//         }
//       })
//     ])

//     // Formatear datos de citas por estado
//     const citasEstadoFormateado = {
//       confirmadas: citasPorEstado.find(c => c.estado === 'CONFIRMADA')?._count.estado || 0,
//       pendientes: citasPorEstado.find(c => c.estado === 'SOLICITADA')?._count.estado || 0,
//       canceladas: citasPorEstado.find(c => c.estado === 'CANCELADA')?._count.estado || 0,
//       modificadas: citasPorEstado.find(c => c.estado === 'MODIFICADA')?._count.estado || 0
//     }

//     // Respuesta final
//     const stats = {
//       totalPacientes,
//       pacientesNuevosHoy,
//       citasHoy,
//       citasPendientes,
//       ingresosMensuales: Number(ingresosMensualesResult._sum.monto) || 0,
//       fichasActivas,
//       serviciosActivos,
//       citasPorEstado: citasEstadoFormateado
//     }

//     return NextResponse.json(stats)

//   } catch (error) {
//     console.error('Error al obtener estadísticas del dashboard:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor' },
//       { status: 500 }
//     )
//   }
// }


// NUEVO  CON SINGLETON Y MEJORANDO LAS CONSULTAS------------------------------------------
// src/app/api/dashboard/stats/route.ts
// import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

// export async function GET() {
//   try {
//     // Obtener fecha actual para filtros
//     const hoy = new Date()
//     const inicioHoy = new Date(hoy)
//     inicioHoy.setHours(0, 0, 0, 0)
//     const finHoy = new Date(hoy)
//     finHoy.setHours(23, 59, 59, 999)

//     // Obtener primer y último día del mes actual
//     const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
//     const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999)

//     // Inicializar stats con valores por defecto
//     const stats = {
//       totalPacientes: 0,
//       pacientesNuevosHoy: 0,
//       citasHoy: 0,
//       citasPendientes: 0,
//       ingresosMensuales: 0,
//       fichasActivas: 0,
//       serviciosActivos: 0,
//       citasPorEstado: {
//         confirmadas: 0,
//         pendientes: 0,
//         canceladas: 0,
//         modificadas: 0
//       }
//     }

//     // 1. Total de pacientes activos
//     try {
//       stats.totalPacientes = await prisma.paciente.count({
//         where: {
//           estado: 'ACTIVO'
//         }
//       })
//     } catch (error) {
//       console.error('Error al obtener total de pacientes:', error)
//     }

//     // 2. Pacientes nuevos hoy (basado en fichas registradas hoy)
//     try {
//       stats.pacientesNuevosHoy = await prisma.fichaOdontologica.count({
//         where: {
//           fechaRegistro: {
//             gte: inicioHoy,
//             lte: finHoy
//           }
//         }
//       })
//     } catch (error) {
//       console.error('Error al obtener pacientes nuevos hoy:', error)
//     }

//     // 3. Citas programadas para hoy
//     try {
//       stats.citasHoy = await prisma.cita.count({
//         where: {
//           fechaHora: {
//             gte: inicioHoy,
//             lte: finHoy
//           },
//           estado: {
//             in: ['CONFIRMADA', 'SOLICITADA', 'MODIFICADA']
//           }
//         }
//       })
//     } catch (error) {
//       console.error('Error al obtener citas de hoy:', error)
//     }

//     // 4. Citas pendientes
//     try {
//       stats.citasPendientes = await prisma.cita.count({
//         where: {
//           fechaHora: {
//             gte: new Date()
//           },
//           estado: 'SOLICITADA'
//         }
//       })
//     } catch (error) {
//       console.error('Error al obtener citas pendientes:', error)
//     }

//     // 5. Ingresos mensuales
//     try {
//       const ingresosMensualesResult = await prisma.factura.aggregate({
//         _sum: {
//           monto: true
//         },
//         where: {
//           fechaEmision: {
//             gte: inicioMes,
//             lte: finMes
//           },
//           estado: 'COMPLETADO'
//         }
//       })
//       stats.ingresosMensuales = Number(ingresosMensualesResult._sum.monto) || 0
//     } catch (error) {
//       console.error('Error al obtener ingresos mensuales:', error)
//     }

//     // 6. Fichas activas
//     try {
//       stats.fichasActivas = await prisma.fichaOdontologica.count({
//         where: {
//           estado: 'ACTIVA'
//         }
//       })
//     } catch (error) {
//       console.error('Error al obtener fichas activas:', error)
//     }

//     // 7. Servicios activos
//     try {
//       stats.serviciosActivos = await prisma.servicio.count({
//         where: {
//           estado: 'Activo'
//         }
//       })
//     } catch (error) {
//       console.error('Error al obtener servicios activos:', error)
//     }

//     // 8. Distribución de citas por estado (últimos 30 días)
//     try {
//       const citasPorEstado = await prisma.cita.groupBy({
//         by: ['estado'],
//         _count: {
//           estado: true
//         },
//         where: {
//           fechaHora: {
//             gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
//           }
//         }
//       })

//       // Formatear datos de citas por estado
//       stats.citasPorEstado = {
//         confirmadas: citasPorEstado.find(c => c.estado === 'CONFIRMADA')?._count.estado || 0,
//         pendientes: citasPorEstado.find(c => c.estado === 'SOLICITADA')?._count.estado || 0,
//         canceladas: citasPorEstado.find(c => c.estado === 'CANCELADA')?._count.estado || 0,
//         modificadas: citasPorEstado.find(c => c.estado === 'MODIFICADA')?._count.estado || 0
//       }
//     } catch (error) {
//       console.error('Error al obtener distribución de citas por estado:', error)
//     }

//     console.log('Estadísticas del dashboard obtenidas:', stats)
//     return NextResponse.json(stats)

//   } catch (error) {
//     console.error('Error general al obtener estadísticas del dashboard:', error)
    
//     // Devolver valores por defecto en caso de error general
//     const statsDefecto = {
//       totalPacientes: 0,
//       pacientesNuevosHoy: 0,
//       citasHoy: 0,
//       citasPendientes: 0,
//       ingresosMensuales: 0,
//       fichasActivas: 0,
//       serviciosActivos: 0,
//       citasPorEstado: {
//         confirmadas: 0,
//         pendientes: 0,
//         canceladas: 0,
//         modificadas: 0
//       }
//     }
    
//     return NextResponse.json(statsDefecto)
//   }
// }


//NUEVO--------------------------
// src/app/api/dashboard/stats/route.ts
// src/app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { executeWithRetry } from '@/lib/db-utils'

export async function GET() {
  try {
    console.log('Iniciando obtención de estadísticas del dashboard...');
    
    const hoy = new Date()
    const inicioHoy = new Date(hoy)
    inicioHoy.setHours(0, 0, 0, 0)
    const finHoy = new Date(hoy)
    finHoy.setHours(23, 59, 59, 999)

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59, 999)

    const stats = {
      totalPacientes: 0,
      pacientesNuevosHoy: 0,
      citasHoy: 0,
      citasPendientes: 0,
      ingresosMensuales: 0,
      fichasActivas: 0,
      serviciosActivos: 0,
      serviciosPendientes: 0,
      serviciosVencidos: 0,
      serviciosPagados: 0,
      totalTratamientos: 0,
      planesTratamiento: 0,
      facturasPendientes: 0,
      citasPorEstado: {
        confirmadas: 0,
        pendientes: 0,
        canceladas: 0,
        modificadas: 0
      }
    }

    // 1. Total de pacientes activos
    const totalPacientes = await executeWithRetry(() => 
      prisma.paciente.count({
        where: { estado: 'ACTIVO' }
      })
    );
    if (totalPacientes !== null) {
      stats.totalPacientes = totalPacientes;
    }

    // 2. Pacientes nuevos hoy
    const pacientesNuevos = await executeWithRetry(() =>
      prisma.fichaOdontologica.count({
        where: {
          fechaRegistro: {
            gte: inicioHoy,
            lte: finHoy
          }
        }
      })
    );
    if (pacientesNuevos !== null) {
      stats.pacientesNuevosHoy = pacientesNuevos;
    }

    // 3. Fichas activas
    const fichasActivas = await executeWithRetry(() =>
      prisma.fichaOdontologica.count({
        where: { estado: 'ACTIVA' }
      })
    );
    if (fichasActivas !== null) {
      stats.fichasActivas = fichasActivas;
    }

    // 4. Citas programadas para hoy
    const citasHoy = await executeWithRetry(() =>
      prisma.cita.count({
        where: {
          fechaHora: {
            gte: inicioHoy,
            lte: finHoy
          },
          estado: {
            in: ['CONFIRMADA', 'SOLICITADA', 'MODIFICADA']
          }
        }
      })
    );
    if (citasHoy !== null) {
      stats.citasHoy = citasHoy;
    }

    // 5. Citas pendientes
    const citasPendientes = await executeWithRetry(() =>
      prisma.cita.count({
        where: {
          fechaHora: { gte: new Date() },
          estado: 'SOLICITADA'
        }
      })
    );
    if (citasPendientes !== null) {
      stats.citasPendientes = citasPendientes;
    }

    // 6. Ingresos mensuales
    const ingresosMensuales = await executeWithRetry(() =>
      prisma.factura.aggregate({
        _sum: { monto: true },
        where: {
          fechaEmision: {
            gte: inicioMes,
            lte: finMes
          },
          estado: 'COMPLETADO'
        }
      })
    );
    if (ingresosMensuales !== null) {
      stats.ingresosMensuales = Number(ingresosMensuales._sum.monto) || 0;
    }

    // 7. Servicios activos
    const serviciosActivos = await executeWithRetry(() =>
      prisma.servicio.count({
        where: { estado: 'Activo' }
      })
    );
    if (serviciosActivos !== null) {
      stats.serviciosActivos = serviciosActivos;
    }

    // 8. Distribución de citas por estado
    const citasPorEstado = await executeWithRetry(() =>
      prisma.cita.groupBy({
        by: ['estado'],
        _count: { estado: true },
        where: {
          fechaHora: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    );

    if (citasPorEstado !== null) {
      stats.citasPorEstado = {
        confirmadas: citasPorEstado.find((c: any) => c.estado === 'CONFIRMADA')?._count.estado || 0,
        pendientes: citasPorEstado.find((c: any) => c.estado === 'SOLICITADA')?._count.estado || 0,
        canceladas: citasPorEstado.find((c: any) => c.estado === 'CANCELADA')?._count.estado || 0,
        modificadas: citasPorEstado.find((c: any) => c.estado === 'MODIFICADA')?._count.estado || 0
      };
    }

    // 9. Servicios por estado
    const fechaHoy = new Date();
    
    const serviciosPendientes = await executeWithRetry(() =>
      prisma.servicio.count({
        where: {
          fechaPago: null,
          estado: { not: 'Cancelado' }
        }
      })
    );
    if (serviciosPendientes !== null) {
      stats.serviciosPendientes = serviciosPendientes;
    }

    const serviciosVencidos = await executeWithRetry(() =>
      prisma.servicio.count({
        where: {
          fechaVencimiento: { lt: fechaHoy },
          fechaPago: null,
          estado: { not: 'Cancelado' }
        }
      })
    );
    if (serviciosVencidos !== null) {
      stats.serviciosVencidos = serviciosVencidos;
    }

    const serviciosPagados = await executeWithRetry(() =>
      prisma.servicio.count({
        where: {
          fechaPago: { not: null },
          estado: 'Activo'
        }
      })
    );
    if (serviciosPagados !== null) {
      stats.serviciosPagados = serviciosPagados;
    }

    // 10. Total de tratamientos
    const totalTratamientos = await executeWithRetry(() =>
      prisma.evolucionPaciente.count()
    );
    if (totalTratamientos !== null) {
      stats.totalTratamientos = totalTratamientos;
    }

    // 11. Planes de tratamiento
    const planesTratamiento = await executeWithRetry(() =>
      prisma.planTratamiento.count()
    );
    if (planesTratamiento !== null) {
      stats.planesTratamiento = planesTratamiento;
    }

    // 12. Facturas pendientes
    const facturasPendientes = await executeWithRetry(() =>
      prisma.factura.count({
        where: { estado: 'PENDIENTE' }
      })
    );
    if (facturasPendientes !== null) {
      stats.facturasPendientes = facturasPendientes;
    }

    console.log('Estadísticas del dashboard obtenidas exitosamente:', stats);
    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error general al obtener estadísticas del dashboard:', error);
    
    const statsDefecto = {
      totalPacientes: 0,
      pacientesNuevosHoy: 0,
      citasHoy: 0,
      citasPendientes: 0,
      ingresosMensuales: 0,
      fichasActivas: 0,
      serviciosActivos: 0,
      serviciosPendientes: 0,
      serviciosVencidos: 0,
      serviciosPagados: 0,
      totalTratamientos: 0,
      planesTratamiento: 0,
      facturasPendientes: 0,
      citasPorEstado: {
        confirmadas: 0,
        pendientes: 0,
        canceladas: 0,
        modificadas: 0
      }
    };
    
    return NextResponse.json(statsDefecto);
  }
}