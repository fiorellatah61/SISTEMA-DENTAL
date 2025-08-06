// // app/api/generate-pdf/[fichaId]/route.js
// import { PrismaClient } from '../../../../generated/prisma'
// import jsPDF from 'jspdf';
// import { createClient } from '@supabase/supabase-js';
// import { NextResponse } from 'next/server';

// // Inicialización mejorada de Prisma
// let prisma;

// // Función para inicializar Prisma de forma lazy
// function getPrismaClient() {
//   if (!prisma) {
//     try {
//       prisma = new PrismaClient();
//       console.log('Prisma Client inicializado correctamente');
//     } catch (error) {
//       console.error('Error inicializando Prisma:', error);
//       throw new Error('No se pudo conectar a la base de datos');
//     }
//   }
//   return prisma;
// }

// // Configuración de Supabase
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// );

// export async function GET(request, { params }) {
//   try {
//     console.log('Params recibidos:', params);
    
//     // Corregido: awaitar params como requiere Next.js 15
//     const { fichaId } = await params;
    
//     console.log('FichaId extraído:', fichaId);

//     // Obtener cliente de Prisma de forma segura
//     const prismaClient = getPrismaClient();

//     if (!fichaId) {
//       console.error('FichaId no proporcionado');
//       return NextResponse.json(
//         { error: 'ID de ficha requerido' }, 
//         { status: 400 }
//       );
//     }

//     console.log('Buscando ficha con ID:', fichaId);

//     // Obtener todos los datos de la ficha con sus relaciones
//     const ficha = await prismaClient.fichaOdontologica.findUnique({
//       where: { id: fichaId },
//       include: {
//         paciente: true,
//         odontologo: true,
//         antecedentesMedicos: true,
//         examenClinicoEstomatologico: true,
//         examenesOdontologicos: {
//           include: {
//             planTratamiento: true
//           }
//         },
//         evolucionPacientes: {
//           include: {
//             planTratamiento: true
//           },
//           orderBy: {
//             fecha: 'asc'
//           }
//         },
//         odontogramas: {
//           include: {
//             piezasOdontograma: true
//           },
//           orderBy: {
//             fechaActualizacion: 'desc'
//           },
//           take: 1
//         }
//       }
//     });

//     console.log('Ficha encontrada:', !!ficha);

//     if (!ficha) {
//       console.error('Ficha no encontrada para ID:', fichaId);
//       return NextResponse.json(
//         { error: 'Ficha no encontrada' }, 
//         { status: 404 }
//       );
//     }

//     console.log('Generando PDF...');

//     // Generar el PDF
//     const pdfBuffer = await generateFichaOdontologicaPDF(ficha);

//     console.log('PDF generado, tamaño:', pdfBuffer.length);

//     // Subir PDF a Supabase Storage (opcional)
//     try {
//       const fileName = `ficha-${ficha.numeroFicha}-${Date.now()}.pdf`;
//       const { data: uploadData, error: uploadError } = await supabase.storage
//         .from('fichas-odontologicas')
//         .upload(fileName, pdfBuffer, {
//           contentType: 'application/pdf',
//           upsert: true
//         });

//       if (!uploadError) {
//         // Obtener URL pública del archivo
//         const { data: urlData } = supabase.storage
//           .from('fichas-odontologicas')
//           .getPublicUrl(fileName);

//         // Actualizar la ficha con la URL del PDF
//         await prismaClient.fichaOdontologica.update({
//           where: { id: fichaId },
//           data: {
//             archivoFichaPdf: urlData.publicUrl,
//             fechaUltimoPdf: new Date()
//           }
//         });

//         console.log('PDF subido a Supabase:', urlData.publicUrl);
//       } else {
//         console.warn('Error al subir PDF a Supabase:', uploadError);
//       }
//     } catch (supabaseError) {
//       console.warn('Error con Supabase Storage:', supabaseError);
//       // Continuar sin subir a Supabase
//     }

//     console.log('Enviando respuesta PDF...');

//     // Devolver el PDF como respuesta
//     return new NextResponse(pdfBuffer, {
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `inline; filename="ficha-${ficha.numeroFicha}.pdf"`
//       }
//     });

//   } catch (error) {
//     console.error('Error completo generando PDF:', error);
//     return NextResponse.json(
//       { 
//         error: 'Error interno del servidor',
//         details: error.message 
//       }, 
//       { status: 500 }
//     );
//   }
// }

// async function generateFichaOdontologicaPDF(ficha) {
//   console.log('Iniciando generación de PDF para ficha:', ficha.numeroFicha);
  
//   const doc = new jsPDF('p', 'mm', 'a4');
//   const pageWidth = doc.internal.pageSize.getWidth();
//   const pageHeight = doc.internal.pageSize.getHeight();

//   // Configuración de colores
//   const greenColor = [34, 139, 34]; // Verde de la clínica
//   const lightGreen = [144, 238, 144];

//   // **ENCABEZADO**
//   // Logo y título de la clínica (simulado con texto)
//   doc.setFillColor(...greenColor);
//   doc.rect(10, 10, pageWidth - 20, 25, 'F');
  
//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(20);
//   doc.setFont('helvetica', 'bold');
//   doc.text('CLÍNICA DENTAL', 15, 25);
//   doc.setFontSize(24);
//   doc.text('Sonríe', 15, 32);
  
//   // Cuadro "FICHA ODONTOLÓGICA"
//   doc.setFillColor(...lightGreen);
//   doc.rect(pageWidth - 70, 10, 60, 25, 'F');
//   doc.setTextColor(0, 0, 0);
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.text('FICHA ODONTOLÓGICA', pageWidth - 67, 18);
  
//   // Campos de número y fecha
//   doc.setFontSize(10);
//   doc.text('N° de Ficha:', pageWidth - 67, 25);
//   doc.rect(pageWidth - 35, 21, 30, 6);
//   doc.text(ficha.numeroFicha || '', pageWidth - 33, 26);
  
//   doc.text('Fecha de Ingreso:', pageWidth - 67, 32);
//   doc.rect(pageWidth - 35, 28, 30, 6);
//   const fechaIngreso = ficha.fechaRegistro ? 
//     new Date(ficha.fechaRegistro).toLocaleDateString('es-PE') : '';
//   doc.text(fechaIngreso, pageWidth - 33, 33);

//   let yPosition = 45;

//   // **1. DATOS DE FILIACIÓN**
//   doc.setFillColor(...greenColor);
//   doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.text('1. DATOS DE FILIACIÓN', 15, yPosition + 6);

//   yPosition += 12;
//   doc.setTextColor(0, 0, 0);
//   doc.setFontSize(10);
//   doc.setFont('helvetica', 'normal');

//   // Apellidos y nombres
//   doc.text('APELLIDOS Y NOMBRES:', 15, yPosition);
//   const nombreCompleto = `${ficha.paciente?.apellidos || ''}, ${ficha.paciente?.nombres || ''}`;
//   doc.text(nombreCompleto, 70, yPosition);
//   doc.text(`EDAD: ${ficha.paciente?.edad || ''}`, pageWidth - 40, yPosition);

//   yPosition += 6;
//   doc.text('SEXO: (M) (F)', 15, yPosition);
//   const sexo = ficha.paciente?.sexo || '';
//   if (sexo === 'M') doc.text('X', 43, yPosition);
//   if (sexo === 'F') doc.text('X', 54, yPosition);
  
//   doc.text('L. DE NACIMIENTO:', 70, yPosition);
//   doc.text(ficha.paciente?.lugarNacimiento || '', 120, yPosition);
//   doc.text('F. DE NACIMIENTO:', 150, yPosition);
//   const fechaNac = ficha.paciente?.fechaNacimiento ? 
//     new Date(ficha.paciente.fechaNacimiento).toLocaleDateString('es-PE') : '';
//   doc.text(fechaNac, 180, yPosition);

//   yPosition += 6;
//   doc.text('DNI:', 15, yPosition);
//   doc.text(ficha.paciente?.dni || '', 30, yPosition);
//   doc.text('CELULAR:', 80, yPosition);
//   doc.text(ficha.paciente?.telefono || '', 105, yPosition);

//   yPosition += 6;
//   doc.text('DOMICILIO ACTUAL:', 15, yPosition);
//   doc.text(ficha.paciente?.direccionActual || '', 60, yPosition);

//   yPosition += 6;
//   doc.text('PERSONA QUE LO ACOMPAÑA:', 15, yPosition);
//   doc.text(ficha.paciente?.acompanante || '', 80, yPosition);

//   yPosition += 10;

//   // **2. MOTIVO DE CONSULTA**
//   doc.setFillColor(...greenColor);
//   doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.text('2. MOTIVO DE CONSULTA', 15, yPosition + 6);

//   yPosition += 12;
//   doc.setTextColor(0, 0, 0);
//   doc.setFontSize(10);
//   doc.setFont('helvetica', 'normal');
  
//   // Caja para motivo de consulta
//   doc.rect(10, yPosition, pageWidth - 20, 15);
//   if (ficha.motivoConsulta) {
//     const motivoLines = doc.splitTextToSize(ficha.motivoConsulta, pageWidth - 25);
//     doc.text(motivoLines, 15, yPosition + 5);
//   }

//   yPosition += 20;

//   // **3. ANTECEDENTES**
//   doc.setFillColor(...greenColor);
//   doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.text('3. ANTECEDENTES', 15, yPosition + 6);

//   yPosition += 12;
//   doc.setTextColor(0, 0, 0);
//   doc.setFontSize(10);
//   doc.setFont('helvetica', 'normal');

//   const antecedentes = ficha.antecedentesMedicos;
  
//   // Primera fila de antecedentes
//   doc.text('ALERGIAS:', 15, yPosition);
//   doc.text(antecedentes?.alergias || '', 40, yPosition);
//   doc.text('TBC:', 100, yPosition);
//   doc.text(antecedentes?.tuberculosis ? 'Sí' : 'No', 115, yPosition);
//   doc.text('HIPERTENSIÓN:', 140, yPosition);
//   doc.text(antecedentes?.hipertension ? 'Sí' : 'No', 170, yPosition);

//   yPosition += 6;
//   doc.text('DIABETES:', 15, yPosition);
//   doc.text(antecedentes?.diabetes ? 'Sí' : 'No', 40, yPosition);
//   doc.text('HEPATITIS:', 70, yPosition);
//   doc.text(antecedentes?.hepatitis ? 'Sí' : 'No', 95, yPosition);
//   doc.text('HEMORRAGIAS:', 120, yPosition);
//   doc.text(antecedentes?.hemorragias ? 'Sí' : 'No', 155, yPosition);

//   yPosition += 6;
//   doc.text('ENFERMEDADES DEL CORAZÓN:', 15, yPosition);
//   doc.text(antecedentes?.enfermedadesCorazon ? 'Sí' : 'No', 80, yPosition);
//   doc.text('OTROS:', 120, yPosition);
//   doc.text(antecedentes?.otros || '', 140, yPosition);

//   yPosition += 6;
//   doc.text('ESTÁ TOMANDO ALGÚN MEDICAMENTO:', 15, yPosition);
//   if (antecedentes?.medicamentosActuales) {
//     const medicamentosLines = doc.splitTextToSize(antecedentes.medicamentosActuales, pageWidth - 25);
//     doc.text(medicamentosLines, 15, yPosition + 4);
//     yPosition += (medicamentosLines.length * 4);
//   }

//   yPosition += 10;

//   // **4. EXAMEN CLÍNICO GENERAL**
//   doc.setFillColor(...greenColor);
//   doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.text('4. EXAMEN CLÍNICO GENERAL', 15, yPosition + 6);

//   yPosition += 12;
//   doc.setTextColor(0, 0, 0);
//   doc.setFontSize(10);

//   // Buscar examen clínico general en ExamenOdontologico
//   const examenGeneral = ficha.examenesOdontologicos?.[0]?.examenClinicoGeneral;
//   doc.rect(10, yPosition, pageWidth - 20, 15);
//   if (examenGeneral) {
//     const examenLines = doc.splitTextToSize(examenGeneral, pageWidth - 25);
//     doc.text(examenLines, 15, yPosition + 5);
//   }

//   // Verificar si necesitamos una nueva página
//   if (yPosition > pageHeight - 100) {
//     doc.addPage();
//     yPosition = 20;
//   } else {
//     yPosition += 20;
//   }

//   // **5. EXAMEN CLÍNICO ESTOMATOLÓGICO**
//   doc.setFillColor(...greenColor);
//   doc.rect(10, yPosition, (pageWidth - 30) / 2, 8, 'F');
//   doc.setTextColor(255, 255, 255);
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.text('5. EXAMEN CLÍNICO ESTOMATOLÓGICO', 15, yPosition + 6);

//   // **ODONTOGRAMA**
//   doc.setFillColor(...greenColor);
//   doc.rect((pageWidth - 30) / 2 + 20, yPosition, (pageWidth - 30) / 2, 8, 'F');
//   doc.text('ODONTOGRAMA', (pageWidth - 30) / 2 + 25, yPosition + 6);

//   yPosition += 12;
//   doc.setTextColor(0, 0, 0);
//   doc.setFontSize(9);
//   doc.setFont('helvetica', 'normal');

//   const examenEstomato = ficha.examenClinicoEstomatologico;
  
//   // Lista de campos del examen estomatológico
//   const camposExamen = [
//     { label: 'ATM:', valor: examenEstomato?.ATM },
//     { label: 'LABIOS:', valor: examenEstomato?.vestibulo },
//     { label: 'GANGLIOS:', valor: examenEstomato?.ganglios },
//     { label: 'PIEL:', valor: examenEstomato?.piel },
//     { label: 'SIMETRÍA:', valor: examenEstomato?.simetriaFacial },
//     { label: 'GLAND. SALIV.:', valor: examenEstomato?.glandulasSalivales },
//     { label: 'ENCÍA:', valor: examenEstomato?.encia },
//     { label: 'VESTÍBULO:', valor: examenEstomato?.vestibulo },
//     { label: 'CARRILLO:', valor: examenEstomato?.carrillo },
//     { label: 'PALADAR:', valor: examenEstomato?.paladar },
//     { label: 'OROFARINGE:', valor: examenEstomato?.orofaringe },
//     { label: 'LENGUA:', valor: examenEstomato?.lengua },
//     { label: 'PISO DE BOCA:', valor: examenEstomato?.pisoBoca },
//     { label: 'OCLUSIÓN:', valor: examenEstomato?.oclusion },
//     { label: 'OBSERVACIONES:', valor: examenEstomato?.observaciones }
//   ];

//   // Dibujar campos del examen (lado izquierdo)
//   let tempY = yPosition;
//   for (let i = 0; i < camposExamen.length; i++) {
//     if (tempY > pageHeight - 30) break;
//     doc.text(camposExamen[i].label, 15, tempY);
//     doc.text(camposExamen[i].valor || '', 50, tempY);
//     tempY += 6;
//   }

//   // **DIBUJAR ODONTOGRAMA BÁSICO (lado derecho)**
//   drawBasicOdontograma(doc, (pageWidth - 30) / 2 + 20, yPosition, ficha.odontogramas?.[0]);

//   console.log('PDF generado exitosamente');
//   return Buffer.from(doc.output('arraybuffer'));
// }

// function drawBasicOdontograma(doc, startX, startY, odontograma) {
//   const cellSize = 6;
//   const spacing = 2;
  
//   // Dibujar dientes superiores (18-11, 21-28)
//   let currentX = startX;
//   let currentY = startY;
  
//   // Dientes superiores derechos (18-11)
//   for (let diente = 18; diente >= 11; diente--) {
//     doc.rect(currentX, currentY, cellSize, cellSize);
//     doc.setFontSize(6);
//     doc.text(diente.toString(), currentX + 1, currentY + 4);
//     currentX += cellSize + spacing;
//   }
  
//   // Espacio entre cuadrantes
//   currentX += spacing * 2;
  
//   // Dientes superiores izquierdos (21-28)
//   for (let diente = 21; diente <= 28; diente++) {
//     doc.rect(currentX, currentY, cellSize, cellSize);
//     doc.setFontSize(6);
//     doc.text(diente.toString(), currentX + 1, currentY + 4);
//     currentX += cellSize + spacing;
//   }
  
//   // Nueva fila para dientes inferiores
//   currentX = startX;
//   currentY += cellSize + spacing * 3;
  
//   // Dientes inferiores derechos (48-41)
//   for (let diente = 48; diente >= 41; diente--) {
//     doc.rect(currentX, currentY, cellSize, cellSize);
//     doc.setFontSize(6);
//     doc.text(diente.toString(), currentX + 1, currentY + 4);
//     currentX += cellSize + spacing;
//   }
  
//   // Espacio entre cuadrantes
//   currentX += spacing * 2;
  
//   // Dientes inferiores izquierdos (31-38)
//   for (let diente = 31; diente <= 38; diente++) {
//     doc.rect(currentX, currentY, cellSize, cellSize);
//     doc.setFontSize(6);
//     doc.text(diente.toString(), currentX + 1, currentY + 4);
//     currentX += cellSize + spacing;
//   }
// }

//----------------------NUEVO2 ----------------------------------------------------------

// import { PrismaClient } from '../../../../generated/prisma'
// import jsPDF from 'jspdf'
// import { createClient } from '@supabase/supabase-js'
// import { NextResponse } from 'next/server'

// // Inicialización mejorada de Prisma
// let prisma

// function getPrismaClient() {
//   if (!prisma) {
//     try {
//       prisma = new PrismaClient()
//       console.log('Prisma Client inicializado correctamente')
//     } catch (error) {
//       console.error('Error inicializando Prisma:', error)
//       throw new Error('No se pudo conectar a la base de datos')
//     }
//   }
//   return prisma
// }

// // Configuración de Supabase
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// )

// export async function GET(request, { params }) {
//   try {
//     console.log('Params recibidos:', params)
//     const { fichaId } = await params
//     console.log('FichaId extraído:', fichaId)

//     const prismaClient = getPrismaClient()

//     if (!fichaId) {
//       console.error('FichaId no proporcionado')
//       return NextResponse.json({ error: 'ID de ficha requerido' }, { status: 400 })
//     }

//     console.log('Buscando ficha con ID:', fichaId)

//     const ficha = await prismaClient.fichaOdontologica.findUnique({
//       where: { id: fichaId },
//       include: {
//         paciente: true,
//         odontologo: true,
//         antecedentesMedicos: true,
//         examenClinicoEstomatologico: true,
//         examenesOdontologicos: {
//           include: { planTratamiento: true }
//         },
//         evolucionPacientes: {
//           include: { planTratamiento: true },
//           orderBy: { fecha: 'asc' }
//         },
//         odontogramas: {
//           include: { piezasOdontograma: true },
//           orderBy: { fechaActualizacion: 'desc' },
//           take: 1
//         }
//       }
//     })

//     console.log('Ficha encontrada:', !!ficha)

//     if (!ficha) {
//       console.error('Ficha no encontrada para ID:', fichaId)
//       return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 })
//     }

//     console.log('Generando PDF...')

//     const pdfBuffer = await generateFichaOdontologicaPDF(ficha)

//     console.log('PDF generado, tamaño:', pdfBuffer.length)

//     try {
//       const fileName = `ficha-${ficha.numeroFicha}-${Date.now()}.pdf`
//       const { data: uploadData, error: uploadError } = await supabase.storage
//         .from('fichas-odontologicas')
//         .upload(fileName, pdfBuffer, {
//           contentType: 'application/pdf',
//           upsert: true
//         })

//       if (!uploadError) {
//         const { data: urlData } = supabase.storage
//           .from('fichas-odontologicas')
//           .getPublicUrl(fileName)
//         await prismaClient.fichaOdontologica.update({
//           where: { id: fichaId },
//           data: {
//             archivoFichaPdf: urlData.publicUrl,
//             fechaUltimoPdf: new Date()
//           }
//         })
//         console.log('PDF subido a Supabase:', urlData.publicUrl)
//       } else {
//         console.warn('Error al subir PDF a Supabase:', uploadError)
//       }
//     } catch (supabaseError) {
//       console.warn('Error con Supabase Storage:', supabaseError)
//     }

//     console.log('Enviando respuesta PDF...')

//     return new NextResponse(pdfBuffer, {
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `inline; filename="ficha-${ficha.numeroFicha}.pdf"`
//       }
//     })
//   } catch (error) {
//     console.error('Error completo generando PDF:', error)
//     return NextResponse.json(
//       { error: 'Error interno del servidor', details: error.message },
//       { status: 500 }
//     )
//   }
// }

// async function generateFichaOdontologicaPDF(ficha) {
//   console.log('Iniciando generación de PDF para ficha:', ficha.numeroFicha)
  
//   const doc = new jsPDF('p', 'mm', 'a4')
//   const pageWidth = doc.internal.pageSize.getWidth()
//   const pageHeight = doc.internal.pageSize.getHeight()

//   // Colores especificados
//   const primaryTeal = [64, 178, 157]  // #40B29D
//   const darkBlue = [28, 50, 91]       // #1C325B
//   const lightTeal = [144, 213, 198]   // Derivado claro
//   const black = [0, 0, 0]
//   const white = [255, 255, 255]

//   // **ENCABEZADO**
//   doc.setFillColor(...darkBlue)
//   doc.rect(10, 10, pageWidth - 20, 25, 'F')
  
//   doc.setTextColor(...white)
//   doc.setFontSize(20)
//   doc.setFont('helvetica', 'bold')
//   doc.text('CLÍNICA DENTAL', 15, 20)
  
//   doc.setFontSize(24)
//   doc.setTextColor(...primaryTeal)
//   doc.text('Sonríe', 15, 28)
  
//   doc.setFillColor(...primaryTeal)
//   doc.rect(pageWidth - 70, 10, 60, 25, 'F')
//   doc.setTextColor(...white)
//   doc.setFontSize(12)
//   doc.setFont('helvetica', 'bold')
//   doc.text('FICHA ODONTOLÓGICA', pageWidth - 65, 20)
  
//   // Campos de número y fecha
//   doc.setTextColor(...black)
//   doc.setFontSize(10)
//   doc.text('N° de Ficha:', pageWidth - 65, 30)
//   doc.rect(pageWidth - 35, 27, 30, 6)
//   doc.text(ficha.numeroFicha || '', pageWidth - 33, 31)
  
//   doc.text('Fecha de Ingreso:', pageWidth - 65, 37)
//   doc.rect(pageWidth - 35, 34, 30, 6)
//   const fechaIngreso = ficha.fechaRegistro ? 
//     new Date(ficha.fechaRegistro).toLocaleDateString('es-PE') : ''
//   doc.text(fechaIngreso, pageWidth - 33, 38)

//   let yPosition = 45

//   // **1. DATOS DE FILIACIÓN**
//   doc.setFillColor(...primaryTeal)
//   doc.rect(10, yPosition, pageWidth - 20, 8, 'F')
//   doc.setTextColor(...white)
//   doc.setFontSize(12)
//   doc.setFont('helvetica', 'bold')
//   doc.text('1. DATOS DE FILIACIÓN', 15, yPosition + 6)

//   yPosition += 12
//   doc.setTextColor(...black)
//   doc.setFontSize(10)
//   doc.setFont('helvetica', 'normal')

//   // Apellidos y nombres
//   doc.text('APELLIDOS Y NOMBRES:', 15, yPosition)
//   const nombreCompleto = `${ficha.paciente?.apellidos || ''}, ${ficha.paciente?.nombres || ''}`
//   doc.text(nombreCompleto, 70, yPosition)
//   doc.text(`EDAD: ${ficha.paciente?.edad || ''}`, pageWidth - 40, yPosition)

//   yPosition += 6
//   doc.text('SEXO: (M) (F)', 15, yPosition)
//   const sexo = ficha.paciente?.sexo || ''
//   if (sexo === 'M') doc.text('X', 43, yPosition)
//   if (sexo === 'F') doc.text('X', 54, yPosition)
  
//   doc.text('L. DE NACIMIENTO:', 70, yPosition)
//   doc.text(ficha.paciente?.lugarNacimiento || '', 120, yPosition)
//   doc.text('F. DE NACIMIENTO:', 150, yPosition)
//   const fechaNac = ficha.paciente?.fechaNacimiento ? 
//     new Date(ficha.paciente.fechaNacimiento).toLocaleDateString('es-PE') : ''
//   doc.text(fechaNac, 180, yPosition)

//   yPosition += 6
//   doc.text('DNI:', 15, yPosition)
//   doc.text(ficha.paciente?.dni || '', 30, yPosition)
//   doc.text('CELULAR:', 80, yPosition)
//   doc.text(ficha.paciente?.telefono || '', 105, yPosition)

//   yPosition += 6
//   doc.text('DOMICILIO ACTUAL:', 15, yPosition)
//   doc.text(ficha.paciente?.direccionActual || '', 60, yPosition)

//   yPosition += 6
//   doc.text('PERSONA QUE LO ACOMPAÑA:', 15, yPosition)
//   doc.text(ficha.paciente?.acompanante || '', 80, yPosition)

//   yPosition += 10

//   // **2. MOTIVO DE CONSULTA**
//   doc.setFillColor(...primaryTeal)
//   doc.rect(10, yPosition, pageWidth - 20, 8, 'F')
//   doc.setTextColor(...white)
//   doc.setFontSize(12)
//   doc.setFont('helvetica', 'bold')
//   doc.text('2. MOTIVO DE CONSULTA', 15, yPosition + 6)

//   yPosition += 12
//   doc.setTextColor(...black)
//   doc.setFontSize(10)
//   doc.setFont('helvetica', 'normal')
  
//   // Caja para motivo de consulta
//   doc.rect(10, yPosition, pageWidth - 20, 15)
//   if (ficha.motivoConsulta) {
//     const motivoLines = doc.splitTextToSize(ficha.motivoConsulta, pageWidth - 25)
//     doc.text(motivoLines, 15, yPosition + 5)
//   }

//   yPosition += 20

//   // **3. ANTECEDENTES**
//   doc.setFillColor(...primaryTeal)
//   doc.rect(10, yPosition, pageWidth - 20, 8, 'F')
//   doc.setTextColor(...white)
//   doc.setFontSize(12)
//   doc.setFont('helvetica', 'bold')
//   doc.text('3. ANTECEDENTES', 15, yPosition + 6)

//   yPosition += 12
//   doc.setTextColor(...black)
//   doc.setFontSize(10)
//   doc.setFont('helvetica', 'normal')

//   const antecedentes = ficha.antecedentesMedicos || {}
  
//   // Primera fila de antecedentes
//   doc.text('ALERGIAS:', 15, yPosition)
//   doc.text(antecedentes.alergias ? 'X' : '', 40, yPosition)
//   doc.text('TBC:', 100, yPosition)
//   doc.text(antecedentes.tuberculosis ? 'X' : '', 115, yPosition)
//   doc.text('HIPERTENSIÓN:', 140, yPosition)
//   doc.text(antecedentes.hipertension ? 'X' : '', 170, yPosition)

//   yPosition += 6
//   doc.text('DIABETES:', 15, yPosition)
//   doc.text(antecedentes.diabetes ? 'X' : '', 40, yPosition)
//   doc.text('HEPATITIS:', 70, yPosition)
//   doc.text(antecedentes.hepatitis ? 'X' : '', 95, yPosition)
//   doc.text('HEMORRAGIAS:', 120, yPosition)
//   doc.text(antecedentes.hemorragias ? 'X' : '', 155, yPosition)

//   yPosition += 6
//   doc.text('ENFERMEDADES DEL CORAZÓN:', 15, yPosition)
//   doc.text(antecedentes.enfermedadesCorazon ? 'X' : '', 80, yPosition)
//   doc.text('OTROS:', 120, yPosition)
//   doc.text(antecedentes.otros || '', 140, yPosition)

//   yPosition += 6
//   doc.text('ESTÁ TOMANDO ALGÚN MEDICAMENTO:', 15, yPosition)
//   if (antecedentes.medicamentosActuales) {
//     const medicamentosLines = doc.splitTextToSize(antecedentes.medicamentosActuales, pageWidth - 25)
//     doc.text(medicamentosLines, 15, yPosition + 4)
//     yPosition += (medicamentosLines.length * 4)
//   }

//   yPosition += 10

//   // **4. EXAMEN CLÍNICO GENERAL**
//   doc.setFillColor(...primaryTeal)
//   doc.rect(10, yPosition, pageWidth - 20, 8, 'F')
//   doc.setTextColor(...white)
//   doc.setFontSize(12)
//   doc.setFont('helvetica', 'bold')
//   doc.text('4. EXAMEN CLÍNICO GENERAL', 15, yPosition + 6)

//   yPosition += 12
//   doc.setTextColor(...black)
//   doc.setFontSize(10)

//   const examenGeneral = ficha.examenesOdontologicos?.[0]?.examenClinicoGeneral
//   doc.rect(10, yPosition, pageWidth - 20, 15)
//   if (examenGeneral) {
//     const examenLines = doc.splitTextToSize(examenGeneral, pageWidth - 25)
//     doc.text(examenLines, 15, yPosition + 5)
//   }

//   yPosition += 20

//   // **5. EXAMEN CLÍNICO ESTOMATOLÓGICO**
//   doc.setFillColor(...primaryTeal)
//   doc.rect(10, yPosition, (pageWidth - 30) / 2, 8, 'F')
//   doc.setTextColor(...white)
//   doc.setFontSize(12)
//   doc.setFont('helvetica', 'bold')
//   doc.text('5. EXAMEN CLÍNICO ESTOMATOLÓGICO', 15, yPosition + 6)

//   // **ODONTOGRAMA**
//   doc.setFillColor(...primaryTeal)
//   doc.rect((pageWidth - 30) / 2 + 20, yPosition, (pageWidth - 30) / 2, 8, 'F')
//   doc.text('ODONTOGRAMA', (pageWidth - 30) / 2 + 25, yPosition + 6)

//   yPosition += 12
//   doc.setTextColor(...black)
//   doc.setFontSize(9)
//   doc.setFont('helvetica', 'normal')

//   const examenEstomato = ficha.examenClinicoEstomatologico || {}
  
//   const camposExamen = [
//     { label: 'ATM:', valor: examenEstomato.ATM || '' },
//     { label: 'LABIOS:', valor: examenEstomato.vestibulo || '' },
//     { label: 'GANGLIOS:', valor: examenEstomato.ganglios || '' },
//     { label: 'PIEL:', valor: examenEstomato.piel || '' },
//     { label: 'SIMETRÍA:', valor: examenEstomato.simetriaFacial || '' },
//     { label: 'GLAND. SALIV.:', valor: examenEstomato.glandulasSalivales || '' },
//     { label: 'ENCÍA:', valor: examenEstomato.encia || '' },
//     { label: 'VESTÍBULO:', valor: examenEstomato.vestibulo || '' },
//     { label: 'CARRILLO:', valor: examenEstomato.carrillo || '' },
//     { label: 'PALADAR:', valor: examenEstomato.paladar || '' },
//     { label: 'OROFARINGE:', valor: examenEstomato.orofaringe || '' },
//     { label: 'LENGUA:', valor: examenEstomato.lengua || '' },
//     { label: 'PISO DE BOCA:', valor: examenEstomato.pisoBoca || '' },
//     { label: 'OCLUSIÓN:', valor: examenEstomato.oclusion || '' },
//     { label: 'OBSERVACIONES:', valor: examenEstomato.observaciones || '' }
//   ]

//   let tempY = yPosition
//   for (let i = 0; i < camposExamen.length; i++) {
//     if (tempY > pageHeight - 30) break
//     doc.text(camposExamen[i].label, 15, tempY)
//     doc.text(camposExamen[i].valor, 50, tempY)
//     tempY += 6
//   }

//   // **DIBUJAR ODONTOGRAMA BÁSICO (lado derecho)**
//   drawBasicOdontograma(doc, (pageWidth - 30) / 2 + 20, yPosition, ficha.odontogramas?.[0])

//   console.log('PDF generado exitosamente')
//   return Buffer.from(doc.output('arraybuffer'))
// }

// function drawBasicOdontograma(doc, startX, startY, odontograma) {
//   const cellSize = 6
//   const spacing = 2
  
//   let currentX = startX
//   let currentY = startY
  
//   // Dientes superiores derechos (18-11)
//   for (let diente = 18; diente >= 11; diente--) {
//     doc.rect(currentX, currentY, cellSize, cellSize)
//     doc.setFontSize(6)
//     doc.text(diente.toString(), currentX + 1, currentY + 4)
//     currentX += cellSize + spacing
//   }
  
//   currentX += spacing * 2
  
//   // Dientes superiores izquierdos (21-28)
//   for (let diente = 21; diente <= 28; diente++) {
//     doc.rect(currentX, currentY, cellSize, cellSize)
//     doc.setFontSize(6)
//     doc.text(diente.toString(), currentX + 1, currentY + 4)
//     currentX += cellSize + spacing
//   }
  
//   currentX = startX
//   currentY += cellSize + spacing * 3
  
//   // Dientes inferiores derechos (48-41)
//   for (let diente = 48; diente >= 41; diente--) {
//     doc.rect(currentX, currentY, cellSize, cellSize)
//     doc.setFontSize(6)
//     doc.text(diente.toString(), currentX + 1, currentY + 4)
//     currentX += cellSize + spacing
//   }
  
//   currentX += spacing * 2
  
//   // Dientes inferiores izquierdos (31-38)
//   for (let diente = 31; diente <= 38; diente++) {
//     doc.rect(currentX, currentY, cellSize, cellSize)
//     doc.setFontSize(6)
//     doc.text(diente.toString(), currentX + 1, currentY + 4)
//     currentX += cellSize + spacing
//   }
// }

//ACTUALIZADO
// app/api/generate-pdf/[fichaId]/route.js
import { PrismaClient } from "@prisma/client"
import jsPDF from 'jspdf'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Inicialización mejorada de Prisma
let prisma

function getPrismaClient() {
  if (!prisma) {
    try {
      prisma = new PrismaClient()
      console.log('Prisma Client inicializado correctamente')
    } catch (error) {
      console.error('Error inicializando Prisma:', error)
      throw new Error('No se pudo conectar a la base de datos')
    }
  }
  return prisma
}

// Configuración de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function GET(request, { params }) {
  try {
    console.log('Params recibidos:', params)
    const { fichaId } = await params
    console.log('FichaId extraído:', fichaId)

    const prismaClient = getPrismaClient()

    if (!fichaId) {
      console.error('FichaId no proporcionado')
      return NextResponse.json({ error: 'ID de ficha requerido' }, { status: 400 })
    }

    console.log('Buscando ficha con ID:', fichaId)

    const ficha = await prismaClient.fichaOdontologica.findUnique({
      where: { id: fichaId },
      include: {
        paciente: true,
        odontologo: true,
        antecedentesMedicos: true,
        examenClinicoEstomatologico: true,
        examenesOdontologicos: {
          include: { planTratamiento: true }
        },
        evolucionPacientes: {
          include: { planTratamiento: true },
          orderBy: { fecha: 'asc' }
        },
        odontogramas: {
          include: { piezasOdontograma: true },
          orderBy: { fechaActualizacion: 'desc' },
          take: 1
        }
      }
    })

    console.log('Ficha encontrada:', !!ficha)

    if (!ficha) {
      console.error('Ficha no encontrada para ID:', fichaId)
      return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 })
    }

    console.log('Generando PDF...')

    const pdfBuffer = await generateFichaOdontologicaPDF(ficha)

    console.log('PDF generado, tamaño:', pdfBuffer.length)

    try {
      const fileName = `ficha-${ficha.numeroFicha}-${Date.now()}.pdf`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fichas-odontologicas')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('fichas-odontologicas')
          .getPublicUrl(fileName)
        await prismaClient.fichaOdontologica.update({
          where: { id: fichaId },
          data: {
            archivoFichaPdf: urlData.publicUrl,
            fechaUltimoPdf: new Date()
          }
        })
        console.log('PDF subido a Supabase:', urlData.publicUrl)
      } else {
        console.warn('Error al subir PDF a Supabase:', uploadError)
      }
    } catch (supabaseError) {
      console.warn('Error con Supabase Storage:', supabaseError)
    }

    console.log('Enviando respuesta PDF...')

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="ficha-${ficha.numeroFicha}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error completo generando PDF:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}

// Función para convertir imagen a base64
function getImageAsBase64(imagePath) {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    if (fs.existsSync(fullPath)) {
      const imageBuffer = fs.readFileSync(fullPath)
      return `data:image/png;base64,${imageBuffer.toString('base64')}`
    }
    return null
  } catch (error) {
    console.warn(`Error cargando imagen ${imagePath}:`, error)
    return null
  }
}

async function generateFichaOdontologicaPDF(ficha) {
  console.log('Iniciando generación de PDF para ficha:', ficha.numeroFicha)
  
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Paleta de colores profesional
  const primaryTeal = [64, 178, 157]    // #40B29D
  const darkBlue = [28, 50, 91]         // #1C325B
  const lightTeal = [144, 213, 198]     // #90D5C6 - Teal claro
  const accentGold = [73,80,87]     // #FFC107 - Dorado elegante se cambio a un gris verde clarito #495057
  const softGray = [255, 255, 255]      // #F8F9FA - Gris suave se cambió a blancorgb(255, 255, 255) 
  const darkGray = [0,0,0]         // #495057 - Gris oscuro se cambio a  negro rgb(0,0,0)
  const white = [255, 255, 255]
  const black = [0, 0, 0]

  // **DISEÑO MODERNO DEL ENCABEZADO**
  // Fondo principal con degradado simulado
  doc.setFillColor(...darkBlue)
  doc.rect(0, 0, pageWidth, 38, 'F')
  
  // Línea decorativa superior
  doc.setFillColor(...accentGold)
  doc.rect(0, 0, pageWidth, 2, 'F')
  
  // Logo con marco elegante
  const logoBase64 = getImageAsBase64('Logo.png')
  if (logoBase64) {
    try {
      // Marco para el logo
      doc.setFillColor(...white)
      doc.circle(25, 19, 12, 'F')
      doc.setDrawColor(...lightTeal)
      doc.setLineWidth(0.5)
      doc.circle(25, 19, 12, 'S')
      
      doc.addImage(logoBase64, 'PNG', 17, 11, 16, 16)
    } catch (error) {
      console.warn('Error agregando logo:', error)
    }
  }
  
  // Título principal con tipografía elegante
  doc.setTextColor(...white)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('CLÍNICA DENTAL', 45, 18)
  
  doc.setFontSize(28)
  doc.setTextColor(...primaryTeal)
  doc.text('Sonríe', 45, 28)
  
  // Subtítulo profesional
  doc.setTextColor(...white)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Centro Especializado en Salud Oral', 45, 33)
  
  // Panel de información elegante (lado derecho)
  doc.setFillColor(...primaryTeal)
  doc.roundedRect(pageWidth - 85, 5, 75, 28, 3, 3, 'F')
  
  // Sombra sutil
  doc.setFillColor(0, 0, 0, 0.1)
  doc.roundedRect(pageWidth - 84, 6, 75, 28, 3, 3, 'F')
  
  doc.setTextColor(...black)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('FICHA ODONTOLÓGICA', pageWidth - 80, 13)
  
  // Campos con diseño moderno
  doc.setTextColor(...black)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('N° FICHA', pageWidth - 80, 19)
  
  // Caja elegante para número
  doc.setFillColor(...white)
  doc.roundedRect(pageWidth - 50, 16, 35, 6, 2, 2, 'F')
  doc.setDrawColor(...darkBlue)
  doc.setLineWidth(0.3)
  doc.roundedRect(pageWidth - 50, 16, 35, 6, 2, 2, 'S')
  
  doc.setTextColor(...darkBlue)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(ficha.numeroFicha || 'N/A', pageWidth - 48, 20.5)
  
  doc.setTextColor(...black)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('FECHA REGISTRO', pageWidth - 80, 27)
  
  // Caja elegante para fecha
  doc.setFillColor(...white)
  doc.roundedRect(pageWidth - 50, 24, 35, 6, 2, 2, 'F')
  doc.setDrawColor(...darkBlue)
  doc.roundedRect(pageWidth - 50, 24, 35, 6, 2, 2, 'S')
  
  doc.setTextColor(...darkBlue)
  doc.setFontSize(9)
  const fechaIngreso = ficha.fechaRegistro ? 
    new Date(ficha.fechaRegistro).toLocaleDateString('es-PE') : 'N/A'
  doc.text(fechaIngreso, pageWidth - 48, 28.5)

  let yPos = 45

  // **SECCIONES CON DISEÑO PROFESIONAL**
  
  // 1. DATOS DE FILIACIÓN
  yPos = drawElegantSection(doc, '1. DATOS DE FILIACIÓN', yPos, primaryTeal, accentGold)
  
  doc.setTextColor(...black)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')

  // Tabla profesional de datos personales
  const personalData = [
    ['APELLIDOS Y NOMBRES', `${ficha.paciente?.apellidos || ''}, ${ficha.paciente?.nombres || ''}`, 'EDAD', `${ficha.paciente?.edad || 'N/A'} años`],
    ['DNI', ficha.paciente?.dni || 'N/A', 'TELÉFONO', ficha.paciente?.telefono || 'N/A'],
    ['SEXO', ficha.paciente?.sexo || 'N/A', 'F. NACIMIENTO', ficha.paciente?.fechaNacimiento ? new Date(ficha.paciente.fechaNacimiento).toLocaleDateString('es-PE') : 'N/A'],
    ['LUGAR DE NACIMIENTO', ficha.paciente?.lugarNacimiento || 'N/A', '', ''],
    ['DOMICILIO ACTUAL', ficha.paciente?.direccionActual || 'N/A', '', ''],
    ['ACOMPAÑANTE', ficha.paciente?.acompanante || 'N/A', '', '']
  ]

  yPos = drawProfessionalTable(doc, personalData, 10, yPos, pageWidth - 20)

  // 2. MOTIVO DE CONSULTA
  yPos += 4
  yPos = drawElegantSection(doc, '2. MOTIVO DE CONSULTA', yPos, primaryTeal, accentGold)
  yPos = drawElegantTextBox(doc, ficha.motivoConsulta || 'No especificado', yPos, pageWidth - 20, 15)

  // 3. ANTECEDENTES MÉDICOS
  yPos += 4
  yPos = drawElegantSection(doc, '3. ANTECEDENTES MÉDICOS', yPos, primaryTeal, accentGold)
  
  const antecedentes = ficha.antecedentesMedicos || {}
  
  // Grid de antecedentes con diseño moderno
  const antecedentesGrid = [
    ['ALERGIAS', antecedentes.alergias ? '✓' : '✗', 'TBC', antecedentes.tuberculosis ? '✓' : '✗', 'HIPERTENSIÓN', antecedentes.hipertension ? '✓' : '✗'],
    ['DIABETES', antecedentes.diabetes ? '✓' : '✗', 'HEPATITIS', antecedentes.hepatitis ? '✓' : '✗', 'HEMORRAGIAS', antecedentes.hemorragias ? '✓' : '✗'],
    ['ENF. CORAZÓN', antecedentes.enfermedadesCorazon ? '✓' : '✗', 'OTROS', antecedentes.otros || 'Ninguno', '', '']
  ]
  
  yPos = drawMedicalGrid(doc, antecedentesGrid, 10, yPos, pageWidth - 20)
  
  // Medicamentos con diseño especial
  if (antecedentes.medicamentosActuales) {
    yPos += 3
    doc.setTextColor(...darkGray)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(' MEDICAMENTOS ACTUALES', 12, yPos)
    yPos += 1
    yPos = drawElegantTextBox(doc, antecedentes.medicamentosActuales, yPos, pageWidth - 20, 10)
  }

  // 4. EXAMEN CLÍNICO GENERAL
  yPos += 4
  yPos = drawElegantSection(doc, '4. EXAMEN CLÍNICO GENERAL', yPos, primaryTeal, accentGold)
  const examenGeneral = ficha.examenesOdontologicos?.[0]?.examenClinicoGeneral || 'Pendiente de evaluación'
  yPos = drawElegantTextBox(doc, examenGeneral, yPos, pageWidth - 20, 12)

  // 5. DIVISIÓN ELEGANTE PARA EXAMEN Y ODONTOGRAMA
  yPos += 4
  
  // Línea divisoria decorativa
  doc.setDrawColor(...lightTeal)
  doc.setLineWidth(0.5)
  doc.line(10, yPos, pageWidth - 10, yPos)
  yPos += 2
  
  // Secciones paralelas con diseño profesional
  const leftWidth = (pageWidth - 30) / 2
  const rightWidth = (pageWidth - 30) / 2
  const rightStartX = leftWidth + 20

  // EXAMEN CLÍNICO ESTOMATOLÓGICO (Izquierda)
  drawElegantSectionSmall(doc, '5. EXAMEN CLÍNICO ESTOMATOLÓGICO', 10, yPos, leftWidth, primaryTeal)
  
  // ODONTOGRAMA (Derecha)
  drawElegantSectionSmall(doc, 'ODONTOGRAMA DIGITAL', rightStartX, yPos, rightWidth, primaryTeal)

  yPos += 8
  
  // Contenido del examen estomatológico
  const examenEstomato = ficha.examenClinicoEstomatologico || {}
  
  const examFields = [
    ['ATM', examenEstomato.ATM || 'Normal'],
    ['LABIOS', examenEstomato.vestibulo || 'Normal'],
    ['GANGLIOS', examenEstomato.ganglios || 'Normal'],
    ['PIEL', examenEstomato.piel || 'Normal'],
    ['SIMETRÍA', examenEstomato.simetriaFacial || 'Normal'],
    ['GLAND. SALIVAL', examenEstomato.glandulasSalivales || 'Normal'],
    ['ENCÍA', examenEstomato.encia || 'Normal'],
    ['VESTÍBULO', examenEstomato.vestibulo || 'Normal'],
    ['CARRILLO', examenEstomato.carrillo || 'Normal'],
    ['PALADAR', examenEstomato.paladar || 'Normal'],
    ['OROFARINGE', examenEstomato.orofaringe || 'Normal'],
    ['LENGUA', examenEstomato.lengua || 'Normal'],
    ['PISO DE BOCA', examenEstomato.pisoBoca || 'Normal'],
    ['OCLUSIÓN', examenEstomato.oclusion || 'Normal']
  ]

  drawExamFieldsElegant(doc, examFields, 12, yPos, leftWidth - 4)
  
  // Odontograma profesional (Derecha)
  drawProfessionalOdontograma(doc, rightStartX, yPos, ficha.odontogramas?.[0])
  
  // Observaciones al final
  if (examenEstomato.observaciones) {
    const obsY = yPos + 66
    doc.setFillColor(...softGray)
    doc.roundedRect(10, obsY, pageWidth - 20, 12, 2, 2, 'F')
    doc.setTextColor(...darkGray)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(' OBSERVACIONES CLÍNICAS:', 12, obsY + 4)
    doc.setFont('helvetica', 'normal')
    const obsLines = doc.splitTextToSize(examenEstomato.observaciones, pageWidth - 25)
    doc.text(obsLines, 12, obsY + 7)
  }

  // **PIE DE PÁGINA PROFESIONAL**
  drawProfessionalFooter(doc, ficha.odontologo)

  console.log('PDF generado exitosamente')
  return Buffer.from(doc.output('arraybuffer'))
}

// Función para sección elegante
function drawElegantSection(doc, title, yPos, primaryColor, accentColor) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 10
  
  // Fondo con gradiente simulado
  doc.setFillColor(...primaryColor)
  doc.roundedRect(margin, yPos, pageWidth - 20, 7, 2, 2, 'F')
  
  // Línea de acento dorada
  doc.setFillColor(...accentColor)
  doc.rect(margin, yPos, 4, 7, 'F')
  
  // Texto del título
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(title, margin + 8, yPos + 5)
  
  return yPos + 10
}

// Función para sección pequeña elegante
function drawElegantSectionSmall(doc, title, x, y, width, color) {
  doc.setFillColor(...color)
  doc.roundedRect(x, y, width, 6, 2, 2, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(title, x + 3, y + 4)
}

// Función para tabla profesional
function drawProfessionalTable(doc, data, x, y, width) {
  const darkGray = [73, 80, 87]
  const lightGray = [248, 249, 250]
  const rowHeight = 6
  let currentY = y
  
  data.forEach((row, index) => {
    // Alternar colores de fondo
    if (index % 2 === 0) {
      doc.setFillColor(...lightGray)
      doc.rect(x, currentY, width, rowHeight, 'F')
    }
    
    doc.setTextColor(...darkGray)
    doc.setFontSize(7)
    
    if (row.length >= 4) {
      const col1Width = width * 0.25
      const col2Width = width * 0.35
      const col3Width = width * 0.15
      const col4Width = width * 0.25
      
      doc.setFont('helvetica', 'bold')
      doc.text(row[0], x + 2, currentY + 4)
      doc.setFont('helvetica', 'normal')
      doc.text(row[1], x + col1Width + 2, currentY + 4)
      
      if (row[2]) {
        doc.setFont('helvetica', 'bold')
        doc.text(row[2], x + col1Width + col2Width + 2, currentY + 4)
        doc.setFont('helvetica', 'normal')
        doc.text(row[3], x + col1Width + col2Width + col3Width + 2, currentY + 4)
      }
    } else {
      doc.setFont('helvetica', 'bold')
      doc.text(row[0], x + 2, currentY + 4)
      if (row[1]) {
        doc.setFont('helvetica', 'normal')
        doc.text(row[1], x + width * 0.3 + 2, currentY + 4)
      }
    }
    
    currentY += rowHeight
  })
  
  // Borde exterior elegante
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.rect(x, y, width, currentY - y, 'S')
  
  return currentY
}

// Función para caja de texto elegante
function drawElegantTextBox(doc, text, yPos, width, height) {
  const margin = 10
  const softGray = [248, 249, 250]
  const darkGray = [73, 80, 87]
  
  // Fondo suave
  doc.setFillColor(...softGray)
  doc.roundedRect(margin, yPos, width, height, 2, 2, 'F')
  
  // Borde sutil
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, yPos, width, height, 2, 2, 'S')
  
  // Texto
  doc.setTextColor(...darkGray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  
  if (text && text.trim()) {
    const lines = doc.splitTextToSize(text, width - 6)
    doc.text(lines, margin + 3, yPos + 5)
  }
  
  return yPos + height + 2
}

// Función para grid médico
function drawMedicalGrid(doc, data, x, y, width) {
  const darkGray = [73, 80, 87]
  const lightGray = [248, 249, 250]
  const greenColor = [40, 167, 69]
  const redColor = [220, 53, 69]
  const rowHeight = 5
  let currentY = y
  
  data.forEach((row) => {
    doc.setFillColor(...lightGray)
    doc.rect(x, currentY, width, rowHeight, 'F')
    
    const colWidth = width / 6
    
    for (let i = 0; i < row.length; i += 2) {
      if (row[i]) {
        // Etiqueta
        doc.setTextColor(...darkGray)
        doc.setFontSize(7)
        doc.setFont('helvetica', 'bold')
        doc.text(row[i], x + (i * colWidth / 2) + 2, currentY + 3.5)
        
        // Valor con color
        if (row[i + 1]) {
          if (row[i + 1] === '✓') {
            doc.setTextColor(...greenColor)
          } else if (row[i + 1] === '✗') {
            doc.setTextColor(...redColor)
          } else {
            doc.setTextColor(...darkGray)
          }
          doc.setFont('helvetica', 'normal')
          doc.text(row[i + 1], x + (i * colWidth / 2) + colWidth + 2, currentY + 3.5)
        }
      }
    }
    
    currentY += rowHeight
  })
  
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.rect(x, y, width, currentY - y, 'S')
  
  return currentY
}

// Función para campos de examen elegante
function drawExamFieldsElegant(doc, fields, x, y, width) {
  const darkGray = [73, 80, 87]
  const lightGray = [248, 249, 250]
  let currentY = y
  
  fields.forEach((field, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(...lightGray)
      doc.rect(x, currentY, width, 4, 'F')
    }
    
    doc.setTextColor(...darkGray)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'bold')
    doc.text(field[0] + ':', x + 1, currentY + 2.5)
    
    doc.setFont('helvetica', 'normal')
    doc.text(field[1], x + 25, currentY + 2.5)
    
    currentY += 4
  })
  
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  doc.rect(x, y, width, currentY - y, 'S')
}

// Función para odontograma compacto con mejor espaciado

function drawProfessionalOdontograma(doc, startX, startY, odontograma) {
  const toothSize = 4
  const spacing = 1.2
  const textSize = 4
  const sectionSpacing = 8

  // Obtener datos de las piezas
  const piezasData = {}
  if (odontograma?.piezasOdontograma) {
    odontograma.piezasOdontograma.forEach(pieza => {
      piezasData[pieza.diente] = {
        procedimiento: pieza.procedimiento,
        estado: pieza.estado
      }
    })
  }

  function drawMiniTooth(x, y, toothNumber, isPermanent = true) {
    // Cargar imagen del diente
    const toothImagePath = `images/dientes/${toothNumber}.png`
    const toothImage = getImageAsBase64(toothImagePath)
    
    // Dibujar borde
    doc.setDrawColor(100, 100, 100)
    doc.setLineWidth(0.1)
    doc.rect(x, y, toothSize, toothSize, 'S')
    
    if (toothImage) {
      try {
        doc.addImage(toothImage, 'PNG', x + 0.2, y + 0.2, toothSize - 0.4, toothSize - 0.4)
      } catch (error) {
        // Fallback con color
        doc.setFillColor(isPermanent ? 240 : 220, isPermanent ? 240 : 220, isPermanent ? 240 : 200)
        doc.rect(x + 0.2, y + 0.2, toothSize - 0.4, toothSize - 0.4, 'F')
      }
    } else {
      doc.setFillColor(isPermanent ? 240 : 220, isPermanent ? 240 : 220, isPermanent ? 240 : 200)
      doc.rect(x + 0.2, y + 0.2, toothSize - 0.4, toothSize - 0.4, 'F')
    }
    
    // Número del diente con mejor espaciado
    doc.setFontSize(textSize)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    const numText = toothNumber.toString()
    const textWidth = doc.getTextWidth(numText)
    doc.text(numText, x + (toothSize - textWidth) / 2, y + toothSize + 2.5)
    
    // Indicador de tratamiento
    if (piezasData[toothNumber.toString()]) {
      doc.setFillColor(255, 0, 0)
      doc.circle(x + toothSize - 0.5, y + 0.5, 0.8, 'F')
    }
  }

  let currentY = startY
  

  
  
  // DIENTES PERMANENTES
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(64, 178, 157) // Color primario
  doc.text('PERMANENTES', startX, currentY)
  currentY += 3
  
  // Superior derecho (18-11)
  let currentX = startX
  for (let tooth = 18; tooth >= 11; tooth--) {
    drawMiniTooth(currentX, currentY, tooth, true)
    currentX += toothSize + spacing
  }
  
  // Superior izquierdo (21-28)
  currentX += spacing * 2
  for (let tooth = 21; tooth <= 28; tooth++) {
    drawMiniTooth(currentX, currentY, tooth, true)
    currentX += toothSize + spacing
  }
  
  currentY += toothSize + sectionSpacing
  
  // Inferior derecho (48-41)
  currentX = startX
  for (let tooth = 48; tooth >= 41; tooth--) {
    drawMiniTooth(currentX, currentY, tooth, true)
    currentX += toothSize + spacing
  }
  
  // Inferior izquierdo (31-38)
  currentX += spacing * 2
  for (let tooth = 31; tooth <= 38; tooth++) {
    drawMiniTooth(currentX, currentY, tooth, true)
    currentX += toothSize + spacing
  }
  
  currentY += toothSize + sectionSpacing + 2
  
  // DIENTES TEMPORALES
  doc.setTextColor(64, 178, 157) // Color primario
  doc.text('TEMPORALES', startX, currentY)
  currentY += 3
  
  // Superior derecho temporal (55-51)
  currentX = startX + (toothSize + spacing) * 3 // Ajuste para centrar
  for (let tooth = 55; tooth >= 51; tooth--) {
    drawMiniTooth(currentX, currentY, tooth, false)
    currentX += toothSize + spacing
  }
  
  // Superior izquierdo temporal (61-65)
  currentX += spacing * 2
  for (let tooth = 61; tooth <= 65; tooth++) {
    drawMiniTooth(currentX, currentY, tooth, false)
    currentX += toothSize + spacing
  }
  
  currentY += toothSize + sectionSpacing
  
  // Inferior derecho temporal (85-81)
  currentX = startX + (toothSize + spacing) * 3
  for (let tooth = 85; tooth >= 81; tooth--) {
    drawMiniTooth(currentX, currentY, tooth, false)
    currentX += toothSize + spacing
  }
  
  // Inferior izquierdo temporal (71-75)
  currentX += spacing * 2
  for (let tooth = 71; tooth <= 75; tooth++) {
    drawMiniTooth(currentX, currentY, tooth, false)
    currentX += toothSize + spacing
  }
}

// Función para pie de página profesional
function drawProfessionalFooter(doc, odontologo) {
  const pageHeight = doc.internal.pageSize.getHeight()
  const pageWidth = doc.internal.pageSize.getWidth()
  const footerY = pageHeight - 25
  const primaryTeal = [64, 178, 157]
  const darkGray = [0,0,0]    // se camnio a  negro  estaba asi [73, 80, 87]
  const lightGray = [248, 249, 250]
  
  // Fondo del pie de página
  doc.setFillColor(...lightGray)
  doc.rect(0, footerY, pageWidth, 25, 'F')
  
  // Línea decorativa superior
  doc.setFillColor(...primaryTeal)
  doc.rect(0, footerY, pageWidth, 2, 'F')
  
  // Información del documento
  doc.setTextColor(...darkGray)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  
  const fechaGeneracion = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(` Documento generado: ${fechaGeneracion}`, 15, footerY + 8)
  
  // Información del profesional
  if (odontologo) {
    const doctorInfo = `👨‍⚕️ Dr(a). ${odontologo.firstName || ''} ${odontologo.lastName || ''}`
    doc.text(doctorInfo, 15, footerY + 13)
    doc.text('Odontólogo Responsable', 15, footerY + 18)
  }
  
  // Información de la clínica (lado derecho)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryTeal)
  doc.text('CLÍNICA DENTAL SONRÍE', pageWidth - 70, footerY + 8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...darkGray)
  doc.text('Sistema de Gestión Odontológica', pageWidth - 70, footerY + 13)
  doc.text('Tecnología al Servicio de tu Sonrisa', pageWidth - 70, footerY + 18)
  
  // Número de página
  doc.setFillColor(...primaryTeal)
  doc.circle(pageWidth - 15, footerY + 12, 5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('1', pageWidth - 16, footerY + 14)
}