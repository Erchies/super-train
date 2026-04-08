-- CreateTable
CREATE TABLE "materiais_posicoes_possiveis" (
    "materialId" TEXT NOT NULL,
    "posicaoId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("materialId", "posicaoId"),
    CONSTRAINT "materiais_posicoes_possiveis_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "materiais_posicoes_possiveis_posicaoId_fkey" FOREIGN KEY ("posicaoId") REFERENCES "posicoes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "equipamentos_posicoes_possiveis" (
    "equipamentoId" TEXT NOT NULL,
    "posicaoId" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("equipamentoId", "posicaoId"),
    CONSTRAINT "equipamentos_posicoes_possiveis_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "equipamentos_posicoes_possiveis_posicaoId_fkey" FOREIGN KEY ("posicaoId") REFERENCES "posicoes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
