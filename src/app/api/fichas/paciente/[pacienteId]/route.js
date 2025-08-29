// // app/api/fichas/paciente/[pacienteId]/route.js
// import { NextResponse } from 'next/server';
// import { PrismaClient } from "@prisma/client"

// const prisma = new PrismaClient();

// export async function GET(request, { params }) {
//   try {
//     const { pacienteId } = await params;

//     console.log('Buscando ficha para paciente ID:', pacienteId);

//     // Buscar la ficha odontológica del paciente
//     const ficha = await prisma.fichaOdontologica.findFirst({
//       where: { 
//         idPaciente: pacienteId,
//         estado: 'ACTIVA' // Solo fichas activas
//       },
//       orderBy: {
//         fechaRegistro: 'desc' // La más reciente
//       }
//     });

//     if (!ficha) {
//       console.log('No se encontró ficha para el paciente:', pacienteId);
//       return NextResponse.json(
//         { error: 'No se encontró ficha odontológica para este paciente' }, 
//         { status: 404 }
//       );
//     }

//     console.log('Ficha encontrada:', ficha.id, 'Número:', ficha.numeroFicha);

//     return NextResponse.json({ 
//       ficha: ficha 
//     });

//   } catch (error) {
//     console.error('Error al buscar ficha del paciente:', error);
//     return NextResponse.json(
//       { error: 'Error interno del servidor' }, 
//       { status: 500 }
//     );
//   }
// }

//  NUEVO------------------CON SINGLETON---  import { prisma } from '@/lib/prisma'
// app/api/fichas/paciente/[pacienteId]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'
export async function GET(request, { params }) {
  try {
    const { pacienteId } = await params;

    console.log('Buscando ficha para paciente ID:', pacienteId);

    // Buscar la ficha odontológica del paciente
    const ficha = await prisma.fichaOdontologica.findFirst({
      where: { 
        idPaciente: pacienteId,
        estado: 'ACTIVA' // Solo fichas activas
      },
      orderBy: {
        fechaRegistro: 'desc' // La más reciente
      }
    });

    if (!ficha) {
      console.log('No se encontró ficha para el paciente:', pacienteId);
      return NextResponse.json(
        { error: 'No se encontró ficha odontológica para este paciente' }, 
        { status: 404 }
      );
    }

    console.log('Ficha encontrada:', ficha.id, 'Número:', ficha.numeroFicha);

    return NextResponse.json({ 
      ficha: ficha 
    });

  } catch (error) {
    console.error('Error al buscar ficha del paciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}
