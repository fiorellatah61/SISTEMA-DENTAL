

// ====================================================================
// 2. src/app/api/dashboard/pacientes-por-edad/route.ts
// ====================================================================
// ========================================
// 1. src/app/api/dashboard/pacientes-por-edad/route.ts
// ========================================
import { NextResponse } from 'next/server'
import { PrismaClient } from "../../../../generated/prisma"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Obtener todos los pacientes activos con fechas de nacimiento
    const pacientes = await prisma.paciente.findMany({
      where: {
        estado: 'ACTIVO',
        fechaNacimiento: {
          not: null
        }
      },
      select: {
        fechaNacimiento: true,
        edad: true
      }
    })

    // Función para calcular edad si no está guardada
    const calcularEdad = (fechaNacimiento: Date): number => {
      const hoy = new Date()
      const nacimiento = new Date(fechaNacimiento)
      let edad = hoy.getFullYear() - nacimiento.getFullYear()
      const mes = hoy.getMonth() - nacimiento.getMonth()
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--
      }
      
      return edad
    }

    // Definir rangos de edad
    const rangosEdad = {
      '0-12': { min: 0, max: 12, cantidad: 0 },
      '13-18': { min: 13, max: 18, cantidad: 0 },
      '19-35': { min: 19, max: 35, cantidad: 0 },
      '36-50': { min: 36, max: 50, cantidad: 0 },
      '51-65': { min: 51, max: 65, cantidad: 0 },
      '65+': { min: 66, max: 150, cantidad: 0 }
    }

    // Clasificar pacientes por rango de edad
    pacientes.forEach(paciente => {
      let edad: number
      
      // Usar edad guardada o calcular desde fecha de nacimiento
      if (paciente.edad) {
        edad = paciente.edad
      } else if (paciente.fechaNacimiento) {
        edad = calcularEdad(paciente.fechaNacimiento)
      } else {
        return // Saltar si no hay datos de edad
      }

      // Asignar a rango correspondiente
      for (const [rango, datos] of Object.entries(rangosEdad)) {
        if (edad >= datos.min && edad <= datos.max) {
          datos.cantidad++
          break
        }
      }
    })

    // Calcular total para porcentajes
    const totalPacientes = pacientes.length

    // Formatear respuesta con porcentajes
    const pacientesPorEdad = Object.entries(rangosEdad).map(([rango, datos]) => ({
      rango,
      cantidad: datos.cantidad,
      porcentaje: totalPacientes > 0 ? 
        Number(((datos.cantidad / totalPacientes) * 100).toFixed(1)) : 0
    }))

    // Filtrar rangos con 0 pacientes para limpiar el gráfico
    const pacientesFiltrados = pacientesPorEdad.filter(p => p.cantidad > 0)

    return NextResponse.json(pacientesFiltrados)

  } catch (error) {
    console.error('Error al obtener pacientes por edad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
