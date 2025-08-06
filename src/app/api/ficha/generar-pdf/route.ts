// app/api/ficha/generar-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jsPDF from 'jspdf'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { fichaId } = await request.json()

    // Buscar la ficha odontológica con todos los datos relacionados
    const ficha = await prisma.fichaOdontologica.findUnique({
      where: { id: fichaId },
      include: {
        paciente: true,
        antecedentesMedicos: true,
        examenClinicoEstomatologico: true,
        examenesOdontologicos: {
          include: {
            planTratamiento: true
          }
        },
        evolucionPacientes: {
          include: {
            planTratamiento: true
          }
        },
        odontogramas: {
          include: {
            piezasOdontograma: true
          }
        }
      }
    })

    if (!ficha) {
      return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 })
    }

    // Crear el PDF
    const doc = new jsPDF('p', 'mm', 'a4') // Formato A4 vertical
    let yPosition = 20 // Posición Y inicial

    // **ENCABEZADO**
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('CLÍNICA DENTAL SONRÍE', 20, yPosition)
    
    // Información de la ficha en el encabezado
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`N° de Ficha: ${ficha.numeroFicha}`, 150, yPosition)
    doc.text(`Fecha de Ingreso: ${ficha.fechaRegistro.toLocaleDateString()}`, 150, yPosition + 5)
    
    yPosition += 20

    // **TÍTULO FICHA ODONTOLÓGICA**
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setFillColor(46, 204, 113) // Verde como en la imagen
    doc.rect(130, yPosition - 5, 60, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.text('FICHA ODONTOLÓGICA', 135, yPosition + 2)
    doc.setTextColor(0, 0, 0)
    
    yPosition += 20

    // **1. DATOS DE FILIACIÓN**
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('1. DATOS DE FILIACIÓN', 20, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    // Datos del paciente en dos columnas
    const leftColumn = 20
    const rightColumn = 110
    
    doc.text(`APELLIDOS Y NOMBRES: ${ficha.paciente.apellidos}, ${ficha.paciente.nombres}`, leftColumn, yPosition)
    doc.text(`EDAD: ${ficha.paciente.edad || 'N/A'}`, rightColumn, yPosition)
    yPosition += 7
    
    doc.text(`SEXO: ${ficha.paciente.sexo === 'M' ? 'Masculino' : ficha.paciente.sexo === 'F' ? 'Femenino' : 'Otro'}`, leftColumn, yPosition)
    doc.text(`L. DE NACIMIENTO: ${ficha.paciente.lugarNacimiento || 'N/A'}`, rightColumn, yPosition)
    yPosition += 7
    
    doc.text(`DNI: ${ficha.paciente.dni}`, leftColumn, yPosition)
    doc.text(`F. DE NACIMIENTO: ${ficha.paciente.fechaNacimiento ? ficha.paciente.fechaNacimiento.toLocaleDateString() : 'N/A'}`, rightColumn, yPosition)
    yPosition += 7
    
    doc.text(`DOMICILIO ACTUAL: ${ficha.paciente.direccionActual || 'N/A'}`, leftColumn, yPosition)
    doc.text(`CELULAR: ${ficha.paciente.telefono || 'N/A'}`, rightColumn, yPosition)
    yPosition += 7
    
    doc.text(`PERSONA QUE LO ACOMPAÑA: ${ficha.paciente.acompanante || 'N/A'}`, leftColumn, yPosition)
    yPosition += 15

    // **2. MOTIVO DE CONSULTA**
    doc.setFont('helvetica', 'bold')
    doc.text('2. MOTIVO DE CONSULTA', 20, yPosition)
    yPosition += 7
    
    doc.setFont('helvetica', 'normal')
    const motivoTexto = ficha.motivoConsulta || 'No especificado'
    const motivoLines = doc.splitTextToSize(motivoTexto, 170)
    doc.text(motivoLines, 20, yPosition)
    yPosition += motivoLines.length * 5 + 10

    // **3. ANTECEDENTES MÉDICOS**
    doc.setFont('helvetica', 'bold')
    doc.text('3. ANTECEDENTES', 20, yPosition)
    yPosition += 7

    if (ficha.antecedentesMedicos) {
      doc.setFont('helvetica', 'normal')
      const antecedentes = ficha.antecedentesMedicos
      
      doc.text(`ALERGIAS: ${antecedentes.alergias || 'Ninguna'}`, leftColumn, yPosition)
      doc.text(`HIPERTENSIÓN: ${antecedentes.hipertension ? 'Sí' : 'No'}`, rightColumn, yPosition)
      yPosition += 5
      
      doc.text(`TBC: ${antecedentes.tuberculosis ? 'Sí' : 'No'}`, leftColumn, yPosition)
      doc.text(`HEMORRAGIAS: ${antecedentes.hemorragias ? 'Sí' : 'No'}`, rightColumn, yPosition)
      yPosition += 5
      
      doc.text(`DIABETES: ${antecedentes.diabetes ? 'Sí' : 'No'}`, leftColumn, yPosition)
      doc.text(`HEPATITIS: ${antecedentes.hepatitis ? 'Sí' : 'No'}`, rightColumn, yPosition)
      yPosition += 5
      
      doc.text(`ENFERMEDADES DEL CORAZÓN: ${antecedentes.enfermedadesCorazon ? 'Sí' : 'No'}`, leftColumn, yPosition)
      yPosition += 5
      
      doc.text(`ESTÁ TOMANDO ALGÚN MEDICAMENTO: ${antecedentes.medicamentosActuales || 'Ninguno'}`, leftColumn, yPosition)
      yPosition += 5
      
      if (antecedentes.otros) {
        doc.text(`OTROS: ${antecedentes.otros}`, leftColumn, yPosition)
        yPosition += 5
      }
    }
    yPosition += 10

    // **4. EXAMEN CLÍNICO GENERAL**
    doc.setFont('helvetica', 'bold')
    doc.text('4. EXAMEN CLÍNICO GENERAL', 20, yPosition)
    yPosition += 7

    // Si hay exámenes odontológicos, mostrar el más reciente
    if (ficha.examenesOdontologicos.length > 0) {
      const ultimoExamen = ficha.examenesOdontologicos[ficha.examenesOdontologicos.length - 1]
      doc.setFont('helvetica', 'normal')
      if (ultimoExamen.examenClinicoGeneral) {
        const examenLines = doc.splitTextToSize(ultimoExamen.examenClinicoGeneral, 170)
        doc.text(examenLines, 20, yPosition)
        yPosition += examenLines.length * 5
      }
    }
    yPosition += 10

    // **5. EXAMEN CLÍNICO ESTOMATOLÓGICO**
    doc.setFont('helvetica', 'bold')
    doc.text('5. EXAMEN CLÍNICO ESTOMATOLÓGICO', 20, yPosition)
    yPosition += 7

    if (ficha.examenClinicoEstomatologico) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const examen = ficha.examenClinicoEstomatologico
      
      // Crear una tabla con los datos del examen
      const examFields = [
        ['ATM:', examen.ATM || ''],
        ['LABIOS:', ''],
        ['GANGLIOS:', examen.ganglios || ''],
        ['PIEL:', examen.piel || ''],
        ['SIMETRÍA:', examen.simetriaFacial || ''],
        ['GLAND. SALIV.:', examen.glandulasSalivales || ''],
        ['ENCÍA:', examen.encia || ''],
        ['VESTÍBULO:', examen.vestibulo || ''],
        ['CARRILLO:', examen.carrillo || ''],
        ['PALADAR:', examen.paladar || ''],
        ['OROFARINGE:', examen.orofaringe || ''],
        ['LENGUA:', examen.lengua || ''],
        ['PISO DE BOCA:', examen.pisoBoca || ''],
        ['OCLUSIÓN:', examen.oclusion || '']
      ]
      
      examFields.forEach(([label, value]) => {
        doc.text(label, leftColumn, yPosition)
        doc.text(value, leftColumn + 30, yPosition)
        yPosition += 4
      })
      
      if (examen.observaciones) {
        yPosition += 3
        doc.text('OBSERVACIONES:', leftColumn, yPosition)
        yPosition += 4
        const obsLines = doc.splitTextToSize(examen.observaciones, 150)
        doc.text(obsLines, leftColumn, yPosition)
        yPosition += obsLines.length * 4
      }
    }

    // Nueva página si es necesario
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    // **6. EXÁMENES COMPLEMENTARIOS**
    yPosition += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('6. EXÁMENES COMPLEMENTARIOS:', 20, yPosition)
    yPosition += 10

    // Crear tabla de exámenes
    if (ficha.examenesOdontologicos.length > 0) {
      // Encabezados de tabla
      doc.setFillColor(46, 204, 113)
      doc.rect(20, yPosition, 170, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.text('FECHA', 25, yPosition + 5)
      doc.text('DIAGNÓSTICO', 65, yPosition + 5)
      doc.text('PLAN DE TRATAMIENTO', 120, yPosition + 5)
      doc.text('PRESUPUESTO', 160, yPosition + 5)
      doc.setTextColor(0, 0, 0)
      yPosition += 8

      ficha.examenesOdontologicos.forEach((examen) => {
        doc.setFontSize(8)
        doc.text(examen.fecha.toLocaleDateString(), 25, yPosition + 3)
        
        const diagnostico = examen.diagnostico || 'N/A'
        const diagLines = doc.splitTextToSize(diagnostico, 50)
        doc.text(diagLines, 65, yPosition + 3)
        
        const planTratamiento = examen.planTratamiento?.descripcion || 'N/A'
        const planLines = doc.splitTextToSize(planTratamiento, 35)
        doc.text(planLines, 120, yPosition + 3)
        
        doc.text(`S/ ${examen.presupuesto?.toString() || '0.00'}`, 160, yPosition + 3)
        
        yPosition += Math.max(diagLines.length, planLines.length) * 3 + 2
        
        // Línea separadora
        doc.line(20, yPosition, 190, yPosition)
        yPosition += 2
      })
    }

    // **EVOLUCIÓN**
    if (yPosition > 200) {
      doc.addPage()
      yPosition = 20
    }

    yPosition += 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('EVOLUCIÓN:', 20, yPosition)
    yPosition += 10

    if (ficha.evolucionPacientes.length > 0) {
      // Encabezados de tabla evolución
      doc.setFillColor(46, 204, 113)
      doc.rect(20, yPosition, 170, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(9)
      doc.text('FECHA', 25, yPosition + 5)
      doc.text('TRATAMIENTO REALIZADO', 65, yPosition + 5)
      doc.text('A CUENTA', 140, yPosition + 5)
      doc.text('SALDO', 165, yPosition + 5)
      doc.setTextColor(0, 0, 0)
      yPosition += 8

      ficha.evolucionPacientes.forEach((evolucion) => {
        doc.setFontSize(8)
        doc.text(evolucion.fecha.toLocaleDateString(), 25, yPosition + 3)
        
        const tratamiento = evolucion.tratamientoRealizado
        const tratLines = doc.splitTextToSize(tratamiento, 70)
        doc.text(tratLines, 65, yPosition + 3)
        
        doc.text(`S/ ${evolucion.aCuenta.toString()}`, 140, yPosition + 3)
        doc.text(`S/ ${evolucion.saldo.toString()}`, 165, yPosition + 3)
        
        yPosition += Math.max(tratLines.length * 3, 6)
        
        // Línea separadora
        doc.line(20, yPosition, 190, yPosition)
        yPosition += 2
      })
    }

    // Convertir PDF a buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    
    // Generar nombre único para el archivo
    const fileName = `ficha-${ficha.numeroFicha}-${Date.now()}.pdf`
    
    // Subir a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fichas-odontologicas')
      .upload(`pdfs/${fileName}`, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('Error al subir PDF:', uploadError)
      return NextResponse.json({ error: 'Error al subir PDF' }, { status: 500 })
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('fichas-odontologicas')
      .getPublicUrl(`pdfs/${fileName}`)

    // Actualizar la ficha con la URL del PDF
    await prisma.fichaOdontologica.update({
      where: { id: fichaId },
      data: {
        archivoFichaPdf: urlData.publicUrl,
        fechaUltimoPdf: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'PDF generado correctamente',
      pdfUrl: urlData.publicUrl,
      fileName: fileName
    })

  } catch (error) {
    console.error('Error al generar PDF:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}