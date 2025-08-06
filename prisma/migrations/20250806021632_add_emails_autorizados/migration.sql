-- CreateTable
CREATE TABLE "emails_autorizados" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emails_autorizados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "emails_autorizados_email_key" ON "emails_autorizados"("email");

-- CreateIndex
CREATE INDEX "emails_autorizados_email_idx" ON "emails_autorizados"("email");

-- CreateIndex
CREATE INDEX "emails_autorizados_activo_idx" ON "emails_autorizados"("activo");
