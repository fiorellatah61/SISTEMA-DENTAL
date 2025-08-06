-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DOCTOR', 'RECEPCIONISTA');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('M', 'F', 'Otro');

-- CreateEnum
CREATE TYPE "EstadoPaciente" AS ENUM ('Activo', 'Inactivo');

-- CreateEnum
CREATE TYPE "EstadoFicha" AS ENUM ('Activa', 'Archivada', 'Cancelada');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('Solicitada', 'Confirmada', 'Modificada', 'Cancelada');

-- CreateEnum
CREATE TYPE "MedioRecordatorio" AS ENUM ('Whatsapp', 'Email');

-- CreateEnum
CREATE TYPE "EstadoRecordatorio" AS ENUM ('Enviado', 'Fallido');

-- CreateEnum
CREATE TYPE "AccionHistorial" AS ENUM ('Creación', 'Modificación', 'Cancelación');

-- CreateEnum
CREATE TYPE "TipoUsuarioResponsable" AS ENUM ('Chatbot', 'Recepcionista', 'Odontologo', 'Sistema');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('Completado', 'Pendiente', 'Cancelado');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'DOCTOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "dni" VARCHAR(20) NOT NULL,
    "fecha_nacimiento" DATE,
    "edad" INTEGER,
    "sexo" "Sexo",
    "telefono" VARCHAR(20),
    "email" VARCHAR(100),
    "lugar_nacimiento" VARCHAR(100),
    "direccion_actual" VARCHAR(255),
    "acompanante" VARCHAR(100),
    "estado" "EstadoPaciente" NOT NULL DEFAULT 'Activo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ficha_odontologicas" (
    "id" TEXT NOT NULL,
    "numero_ficha" VARCHAR(20) NOT NULL,
    "id_paciente" TEXT NOT NULL,
    "motivo_consulta" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoFicha" NOT NULL DEFAULT 'Activa',
    "id_odontologo" TEXT,
    "archivo_ficha_pdf" TEXT,
    "archivo_odontograma_pdf" TEXT,
    "fecha_ultimo_pdf" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ficha_odontologicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "antecedentes_medicos" (
    "id" TEXT NOT NULL,
    "id_ficha" TEXT NOT NULL,
    "alergias" TEXT,
    "tuberculosis" BOOLEAN NOT NULL DEFAULT false,
    "hipertension" BOOLEAN NOT NULL DEFAULT false,
    "diabetes" BOOLEAN NOT NULL DEFAULT false,
    "hepatitis" BOOLEAN NOT NULL DEFAULT false,
    "hemorragias" BOOLEAN NOT NULL DEFAULT false,
    "enfermedades_corazon" BOOLEAN NOT NULL DEFAULT false,
    "medicamentos_actuales" TEXT,
    "otros" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "antecedentes_medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examen_clinico_estomatologicos" (
    "id" TEXT NOT NULL,
    "id_ficha" TEXT NOT NULL,
    "ATM" VARCHAR(255),
    "ganglios" VARCHAR(255),
    "piel" VARCHAR(255),
    "simetria_facial" VARCHAR(255),
    "glandulas_salivales" VARCHAR(255),
    "encia" VARCHAR(255),
    "vestibulo" VARCHAR(255),
    "carrillo" VARCHAR(255),
    "paladar" VARCHAR(255),
    "orofaringe" VARCHAR(255),
    "lengua" VARCHAR(255),
    "piso_boca" VARCHAR(255),
    "oclusion" VARCHAR(255),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "examen_clinico_estomatologicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_tratamientos" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "costo_total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_tratamientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examen_odontologicos" (
    "id" TEXT NOT NULL,
    "id_ficha" TEXT NOT NULL,
    "id_planes_tratamiento" TEXT,
    "fecha" DATE NOT NULL,
    "examen_clinico_general" TEXT,
    "diagnostico" TEXT,
    "presupuesto" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "examen_odontologicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evolucion_pacientes" (
    "id" TEXT NOT NULL,
    "id_ficha" TEXT NOT NULL,
    "id_planes_tratamiento" TEXT,
    "fecha" DATE NOT NULL,
    "tratamiento_realizado" TEXT NOT NULL,
    "a_cuenta" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "saldo" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evolucion_pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "odontogramas" (
    "id" TEXT NOT NULL,
    "id_ficha" TEXT NOT NULL,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imagen_odontograma" TEXT,
    "archivo_json" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "odontogramas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pieza_odontogramas" (
    "id" TEXT NOT NULL,
    "id_odontograma" TEXT NOT NULL,
    "diente" VARCHAR(10) NOT NULL,
    "cara_dental" VARCHAR(20),
    "procedimiento" VARCHAR(100) NOT NULL,
    "subtipo" VARCHAR(100),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "condiciones" VARCHAR(255),
    "especificaciones" TEXT,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'Saludable',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pieza_odontogramas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedimiento_dentals" (
    "id" TEXT NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "color" VARCHAR(20) NOT NULL DEFAULT 'blue',
    "simbolo" VARCHAR(255),
    "es_condicion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedimiento_dentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_dientes" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "color" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estado_dientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citas" (
    "id" TEXT NOT NULL,
    "id_paciente" TEXT NOT NULL,
    "id_ficha" TEXT,
    "id_usuario" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'Solicitada',
    "motivo" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recordatorios" (
    "id" TEXT NOT NULL,
    "id_cita" TEXT NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL,
    "medio" "MedioRecordatorio" NOT NULL,
    "estado" "EstadoRecordatorio" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recordatorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_citas" (
    "id" TEXT NOT NULL,
    "id_cita" TEXT NOT NULL,
    "accion" "AccionHistorial" NOT NULL,
    "fecha_accion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_usuario_responsable" "TipoUsuarioResponsable" NOT NULL,
    "detalle_cambio" TEXT,
    "id_usuario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historial_citas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbots" (
    "id" TEXT NOT NULL,
    "mensaje_entrada" TEXT NOT NULL,
    "respuesta_salida" TEXT NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_paciente" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3),
    "estado" VARCHAR(50) NOT NULL,
    "fecha_pago" TIMESTAMP(3),
    "metodo_pago" VARCHAR(50),
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" TEXT NOT NULL,
    "id_paciente" TEXT NOT NULL,
    "id_examenes_odontologico" TEXT,
    "id_evolucion_paciente" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodo_pago" VARCHAR(50),
    "referencia" VARCHAR(100),
    "estado" "EstadoFactura" NOT NULL DEFAULT 'Pendiente',
    "archivo_factura_pdf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkUserId_key" ON "users"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_dni_key" ON "pacientes"("dni");

-- CreateIndex
CREATE INDEX "pacientes_dni_idx" ON "pacientes"("dni");

-- CreateIndex
CREATE INDEX "pacientes_nombres_apellidos_idx" ON "pacientes"("nombres", "apellidos");

-- CreateIndex
CREATE INDEX "pacientes_estado_idx" ON "pacientes"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "ficha_odontologicas_numero_ficha_key" ON "ficha_odontologicas"("numero_ficha");

-- CreateIndex
CREATE INDEX "ficha_odontologicas_numero_ficha_idx" ON "ficha_odontologicas"("numero_ficha");

-- CreateIndex
CREATE INDEX "ficha_odontologicas_id_paciente_idx" ON "ficha_odontologicas"("id_paciente");

-- CreateIndex
CREATE INDEX "ficha_odontologicas_fecha_registro_idx" ON "ficha_odontologicas"("fecha_registro");

-- CreateIndex
CREATE INDEX "ficha_odontologicas_estado_idx" ON "ficha_odontologicas"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "antecedentes_medicos_id_ficha_key" ON "antecedentes_medicos"("id_ficha");

-- CreateIndex
CREATE UNIQUE INDEX "examen_clinico_estomatologicos_id_ficha_key" ON "examen_clinico_estomatologicos"("id_ficha");

-- CreateIndex
CREATE INDEX "citas_fecha_hora_estado_idx" ON "citas"("fecha_hora", "estado");

-- CreateIndex
CREATE INDEX "citas_id_paciente_idx" ON "citas"("id_paciente");

-- CreateIndex
CREATE INDEX "citas_id_ficha_idx" ON "citas"("id_ficha");

-- AddForeignKey
ALTER TABLE "ficha_odontologicas" ADD CONSTRAINT "ficha_odontologicas_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ficha_odontologicas" ADD CONSTRAINT "ficha_odontologicas_id_odontologo_fkey" FOREIGN KEY ("id_odontologo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "antecedentes_medicos" ADD CONSTRAINT "antecedentes_medicos_id_ficha_fkey" FOREIGN KEY ("id_ficha") REFERENCES "ficha_odontologicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examen_clinico_estomatologicos" ADD CONSTRAINT "examen_clinico_estomatologicos_id_ficha_fkey" FOREIGN KEY ("id_ficha") REFERENCES "ficha_odontologicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examen_odontologicos" ADD CONSTRAINT "examen_odontologicos_id_ficha_fkey" FOREIGN KEY ("id_ficha") REFERENCES "ficha_odontologicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examen_odontologicos" ADD CONSTRAINT "examen_odontologicos_id_planes_tratamiento_fkey" FOREIGN KEY ("id_planes_tratamiento") REFERENCES "plan_tratamientos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolucion_pacientes" ADD CONSTRAINT "evolucion_pacientes_id_ficha_fkey" FOREIGN KEY ("id_ficha") REFERENCES "ficha_odontologicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolucion_pacientes" ADD CONSTRAINT "evolucion_pacientes_id_planes_tratamiento_fkey" FOREIGN KEY ("id_planes_tratamiento") REFERENCES "plan_tratamientos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odontogramas" ADD CONSTRAINT "odontogramas_id_ficha_fkey" FOREIGN KEY ("id_ficha") REFERENCES "ficha_odontologicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pieza_odontogramas" ADD CONSTRAINT "pieza_odontogramas_id_odontograma_fkey" FOREIGN KEY ("id_odontograma") REFERENCES "odontogramas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_ficha_fkey" FOREIGN KEY ("id_ficha") REFERENCES "ficha_odontologicas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citas" ADD CONSTRAINT "citas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorios" ADD CONSTRAINT "recordatorios_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "citas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_citas" ADD CONSTRAINT "historial_citas_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "citas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_citas" ADD CONSTRAINT "historial_citas_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbots" ADD CONSTRAINT "chatbots_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "pacientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_examenes_odontologico_fkey" FOREIGN KEY ("id_examenes_odontologico") REFERENCES "examen_odontologicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_id_evolucion_paciente_fkey" FOREIGN KEY ("id_evolucion_paciente") REFERENCES "evolucion_pacientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
