-- CreateTable
CREATE TABLE "localizacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tues" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "posicoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "funcoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "oficinas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "contato" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "atividades" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" TEXT NOT NULL DEFAULT 'OPERADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "materiais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigoTrensurb" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "estoqueMinimo" REAL NOT NULL DEFAULT 0,
    "quantidadeAtual" REAL NOT NULL DEFAULT 0,
    "localizacaoId" TEXT,
    "observacao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "materiais_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "localizacoes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "equipamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroSerie" TEXT NOT NULL,
    "codigoTrensurb" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "compatibilidade" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EM_ESTOQUE',
    "localizacaoId" TEXT,
    "tueId" TEXT,
    "posicaoId" TEXT,
    "funcaoId" TEXT,
    "observacao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "equipamentos_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "localizacoes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "equipamentos_tueId_fkey" FOREIGN KEY ("tueId") REFERENCES "tues" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "equipamentos_posicaoId_fkey" FOREIGN KEY ("posicaoId") REFERENCES "posicoes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "equipamentos_funcaoId_fkey" FOREIGN KEY ("funcaoId") REFERENCES "funcoes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "movimentacoes_consumiveis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "materialId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" REAL NOT NULL,
    "numeroOS" TEXT,
    "numeroChamado" TEXT,
    "atividadeId" TEXT,
    "observacao" TEXT,
    "ehExcecao" BOOLEAN NOT NULL DEFAULT false,
    "justificativa" TEXT,
    "autorizadoPor" TEXT,
    "realizadoPor" TEXT NOT NULL,
    "realizadoEm" DATETIME NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movimentacoes_consumiveis_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "movimentacoes_consumiveis_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "atividades" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimentacoes_consumiveis_realizadoPor_fkey" FOREIGN KEY ("realizadoPor") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "movimentacoes_consumiveis_autorizadoPor_fkey" FOREIGN KEY ("autorizadoPor") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "movimentacoes_equipamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "equipamentoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "statusAnterior" TEXT,
    "statusNovo" TEXT NOT NULL,
    "localizacaoId" TEXT,
    "tueId" TEXT,
    "posicaoId" TEXT,
    "funcaoId" TEXT,
    "oficinaId" TEXT,
    "motivoReparo" TEXT,
    "motivoSucata" TEXT,
    "numeroOS" TEXT,
    "numeroChamado" TEXT,
    "observacao" TEXT,
    "ehExcecao" BOOLEAN NOT NULL DEFAULT false,
    "justificativa" TEXT,
    "autorizadoPor" TEXT,
    "realizadoPor" TEXT NOT NULL,
    "realizadoEm" DATETIME NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "movimentacoes_equipamentos_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "movimentacoes_equipamentos_tueId_fkey" FOREIGN KEY ("tueId") REFERENCES "tues" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimentacoes_equipamentos_posicaoId_fkey" FOREIGN KEY ("posicaoId") REFERENCES "posicoes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimentacoes_equipamentos_funcaoId_fkey" FOREIGN KEY ("funcaoId") REFERENCES "funcoes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimentacoes_equipamentos_oficinaId_fkey" FOREIGN KEY ("oficinaId") REFERENCES "oficinas" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "movimentacoes_equipamentos_realizadoPor_fkey" FOREIGN KEY ("realizadoPor") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "movimentacoes_equipamentos_autorizadoPor_fkey" FOREIGN KEY ("autorizadoPor") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "localizacoes_codigo_key" ON "localizacoes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tues_numero_key" ON "tues"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "posicoes_codigo_key" ON "posicoes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "funcoes_codigo_key" ON "funcoes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "atividades_codigo_key" ON "atividades"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "materiais_codigoTrensurb_key" ON "materiais"("codigoTrensurb");

-- CreateIndex
CREATE UNIQUE INDEX "equipamentos_numeroSerie_key" ON "equipamentos"("numeroSerie");
