CREATE TABLE "equipamentos_referencias_serie" (
    "id" TEXT NOT NULL,
    "nomeEquipamento" TEXT NOT NULL,
    "imagemUrl" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "storageKey" TEXT NOT NULL,
    "nomeOriginal" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamanhoBytes" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipamentos_referencias_serie_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "equipamentos_referencias_serie_nomeEquipamento_key" ON "equipamentos_referencias_serie"("nomeEquipamento");
