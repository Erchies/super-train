-- CreateTable
CREATE TABLE "localizacoes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "localizacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tues" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posicoes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posicoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posicoes_possiveis" (
    "id" TEXT NOT NULL,
    "nomeEquipamento" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "carro" TEXT NOT NULL,
    "posicao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posicoes_possiveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcoes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oficinas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "contato" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oficinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividades" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" TEXT NOT NULL DEFAULT 'OPERADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiais" (
    "id" TEXT NOT NULL,
    "codigoTrensurb" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "estoqueMinimo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantidadeAtual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "localizacaoId" TEXT,
    "observacao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipamentos" (
    "id" TEXT NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "codigoTrensurb" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "compatibilidade" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EM_ESTOQUE',
    "localizacaoId" TEXT,
    "tueId" TEXT,
    "posicaoId" TEXT,
    "funcaoId" TEXT,
    "carro" TEXT,
    "posicaoInstalada" TEXT,
    "observacao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiais_posicoes_possiveis" (
    "materialId" TEXT NOT NULL,
    "posicaoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materiais_posicoes_possiveis_pkey" PRIMARY KEY ("materialId","posicaoId")
);

-- CreateTable
CREATE TABLE "movimentacoes_consumiveis" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "numeroOS" TEXT,
    "numeroChamado" TEXT,
    "atividadeId" TEXT,
    "observacao" TEXT,
    "ehExcecao" BOOLEAN NOT NULL DEFAULT false,
    "justificativa" TEXT,
    "autorizadoPor" TEXT,
    "realizadoPor" TEXT NOT NULL,
    "realizadoEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_consumiveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_equipamentos" (
    "id" TEXT NOT NULL,
    "equipamentoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "statusAnterior" TEXT,
    "statusNovo" TEXT NOT NULL,
    "localizacaoId" TEXT,
    "tueId" TEXT,
    "carro" TEXT,
    "posicaoInstalada" TEXT,
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
    "realizadoEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_equipamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorios_turno" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "turno" TEXT NOT NULL,
    "responsavelId" TEXT,
    "responsavelNome" TEXT NOT NULL,
    "equipeTrensurb" TEXT,
    "equipeTerceirizada" TEXT,
    "condicoesGeraisTurno" TEXT,
    "observacoesGerais" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "fechadoEm" TIMESTAMP(3),
    "canceladoEm" TIMESTAMP(3),

    CONSTRAINT "relatorios_turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorio_turno_vias" (
    "id" TEXT NOT NULL,
    "relatorioTurnoId" TEXT NOT NULL,
    "via" TEXT NOT NULL,
    "tueId" TEXT,
    "tueNumero" TEXT,
    "horarioEntrada" TIMESTAMP(3),
    "horarioSaida" TIMESTAMP(3),
    "motivoPermanencia" TEXT,
    "numeroOS" TEXT,
    "numeroPI" TEXT,
    "numeroTicket" TEXT,
    "statusVia" TEXT NOT NULL DEFAULT 'LIVRE',
    "equipeResponsavel" TEXT,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relatorio_turno_vias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atendimentos_turno" (
    "id" TEXT NOT NULL,
    "relatorioTurnoId" TEXT NOT NULL,
    "tipoRegistro" TEXT NOT NULL,
    "numeroRegistro" TEXT NOT NULL,
    "tueId" TEXT,
    "tueNumero" TEXT,
    "carro" TEXT,
    "sistema" TEXT,
    "equipamento" TEXT,
    "sintomaInformado" TEXT NOT NULL,
    "diagnosticoEncontrado" TEXT,
    "servicoExecutado" TEXT,
    "materialUtilizado" TEXT,
    "equipeExecutante" TEXT,
    "situacaoFinal" TEXT NOT NULL,
    "observacaoProximoTurno" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "atendimentos_turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "falhas_nivel_c" (
    "id" TEXT NOT NULL,
    "relatorioTurnoId" TEXT,
    "numeroOS" TEXT,
    "numeroPI" TEXT,
    "numeroTicket" TEXT,
    "tueId" TEXT,
    "tueNumero" TEXT,
    "origemFalha" TEXT NOT NULL,
    "descricaoFalha" TEXT NOT NULL,
    "dataAbertura" TIMESTAMP(3) NOT NULL,
    "prioridade" TEXT NOT NULL,
    "acaoNecessaria" TEXT,
    "necessitaRecolhimento" BOOLEAN NOT NULL DEFAULT false,
    "recolhimentoSolicitado" BOOLEAN NOT NULL DEFAULT false,
    "horarioSolicitacaoTorre" TIMESTAMP(3),
    "retornoTorre" TEXT NOT NULL DEFAULT 'NAO_SOLICITADO',
    "motivoNaoExecucao" TEXT,
    "responsavelAcompanhamento" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "dataConclusao" TIMESTAMP(3),
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "falhas_nivel_c_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_torre_cco" (
    "id" TEXT NOT NULL,
    "relatorioTurnoId" TEXT NOT NULL,
    "horarioSolicitacao" TIMESTAMP(3) NOT NULL,
    "tueId" TEXT,
    "tueNumero" TEXT,
    "motivoSolicitacao" TEXT NOT NULL,
    "solicitadoPara" TEXT,
    "retorno" TEXT NOT NULL,
    "resultado" TEXT NOT NULL,
    "relacionadoFalhaNivelCId" TEXT,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_torre_cco_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orientacoes_contratada" (
    "id" TEXT NOT NULL,
    "relatorioTurnoId" TEXT NOT NULL,
    "horario" TIMESTAMP(3) NOT NULL,
    "tecnicoOuEquipeOrientada" TEXT NOT NULL,
    "empresa" TEXT,
    "orientacaoRepassada" TEXT NOT NULL,
    "motivoOrientacao" TEXT,
    "responsavelOrientacao" TEXT NOT NULL,
    "tueId" TEXT,
    "tueNumero" TEXT,
    "numeroOS" TEXT,
    "retornoContratada" TEXT NOT NULL,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orientacoes_contratada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendencias_turno" (
    "id" TEXT NOT NULL,
    "relatorioTurnoId" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "tueId" TEXT,
    "tueNumero" TEXT,
    "numeroOS" TEXT,
    "numeroPI" TEXT,
    "numeroTicket" TEXT,
    "pendencia" TEXT NOT NULL,
    "motivoPendencia" TEXT NOT NULL,
    "acaoRecomendada" TEXT,
    "responsavel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pendencias_turno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "localizacoes_codigo_key" ON "localizacoes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tues_numero_key" ON "tues"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "posicoes_codigo_key" ON "posicoes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "posicoes_possiveis_nomeEquipamento_serie_carro_posicao_key" ON "posicoes_possiveis"("nomeEquipamento", "serie", "carro", "posicao");

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

-- CreateIndex
CREATE INDEX "relatorios_turno_data_turno_status_idx" ON "relatorios_turno"("data", "turno", "status");

-- CreateIndex
CREATE INDEX "relatorio_turno_vias_statusVia_idx" ON "relatorio_turno_vias"("statusVia");

-- CreateIndex
CREATE UNIQUE INDEX "relatorio_turno_vias_relatorioTurnoId_via_key" ON "relatorio_turno_vias"("relatorioTurnoId", "via");

-- CreateIndex
CREATE INDEX "atendimentos_turno_relatorioTurnoId_situacaoFinal_idx" ON "atendimentos_turno"("relatorioTurnoId", "situacaoFinal");

-- CreateIndex
CREATE INDEX "atendimentos_turno_numeroRegistro_idx" ON "atendimentos_turno"("numeroRegistro");

-- CreateIndex
CREATE INDEX "falhas_nivel_c_status_prioridade_idx" ON "falhas_nivel_c"("status", "prioridade");

-- CreateIndex
CREATE INDEX "falhas_nivel_c_tueId_idx" ON "falhas_nivel_c"("tueId");

-- CreateIndex
CREATE INDEX "solicitacoes_torre_cco_retorno_resultado_idx" ON "solicitacoes_torre_cco"("retorno", "resultado");

-- CreateIndex
CREATE INDEX "orientacoes_contratada_retornoContratada_idx" ON "orientacoes_contratada"("retornoContratada");

-- CreateIndex
CREATE INDEX "pendencias_turno_status_prioridade_idx" ON "pendencias_turno"("status", "prioridade");

-- AddForeignKey
ALTER TABLE "materiais" ADD CONSTRAINT "materiais_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "localizacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamentos" ADD CONSTRAINT "equipamentos_localizacaoId_fkey" FOREIGN KEY ("localizacaoId") REFERENCES "localizacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamentos" ADD CONSTRAINT "equipamentos_tueId_fkey" FOREIGN KEY ("tueId") REFERENCES "tues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamentos" ADD CONSTRAINT "equipamentos_posicaoId_fkey" FOREIGN KEY ("posicaoId") REFERENCES "posicoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipamentos" ADD CONSTRAINT "equipamentos_funcaoId_fkey" FOREIGN KEY ("funcaoId") REFERENCES "funcoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_posicoes_possiveis" ADD CONSTRAINT "materiais_posicoes_possiveis_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_posicoes_possiveis" ADD CONSTRAINT "materiais_posicoes_possiveis_posicaoId_fkey" FOREIGN KEY ("posicaoId") REFERENCES "posicoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_consumiveis" ADD CONSTRAINT "movimentacoes_consumiveis_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_consumiveis" ADD CONSTRAINT "movimentacoes_consumiveis_atividadeId_fkey" FOREIGN KEY ("atividadeId") REFERENCES "atividades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_consumiveis" ADD CONSTRAINT "movimentacoes_consumiveis_realizadoPor_fkey" FOREIGN KEY ("realizadoPor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_consumiveis" ADD CONSTRAINT "movimentacoes_consumiveis_autorizadoPor_fkey" FOREIGN KEY ("autorizadoPor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_equipamentos" ADD CONSTRAINT "movimentacoes_equipamentos_equipamentoId_fkey" FOREIGN KEY ("equipamentoId") REFERENCES "equipamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_equipamentos" ADD CONSTRAINT "movimentacoes_equipamentos_tueId_fkey" FOREIGN KEY ("tueId") REFERENCES "tues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_equipamentos" ADD CONSTRAINT "movimentacoes_equipamentos_posicaoId_fkey" FOREIGN KEY ("posicaoId") REFERENCES "posicoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_equipamentos" ADD CONSTRAINT "movimentacoes_equipamentos_funcaoId_fkey" FOREIGN KEY ("funcaoId") REFERENCES "funcoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_equipamentos" ADD CONSTRAINT "movimentacoes_equipamentos_oficinaId_fkey" FOREIGN KEY ("oficinaId") REFERENCES "oficinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_equipamentos" ADD CONSTRAINT "movimentacoes_equipamentos_realizadoPor_fkey" FOREIGN KEY ("realizadoPor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_equipamentos" ADD CONSTRAINT "movimentacoes_equipamentos_autorizadoPor_fkey" FOREIGN KEY ("autorizadoPor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorios_turno" ADD CONSTRAINT "relatorios_turno_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio_turno_vias" ADD CONSTRAINT "relatorio_turno_vias_relatorioTurnoId_fkey" FOREIGN KEY ("relatorioTurnoId") REFERENCES "relatorios_turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio_turno_vias" ADD CONSTRAINT "relatorio_turno_vias_tueId_fkey" FOREIGN KEY ("tueId") REFERENCES "tues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos_turno" ADD CONSTRAINT "atendimentos_turno_relatorioTurnoId_fkey" FOREIGN KEY ("relatorioTurnoId") REFERENCES "relatorios_turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atendimentos_turno" ADD CONSTRAINT "atendimentos_turno_tueId_fkey" FOREIGN KEY ("tueId") REFERENCES "tues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "falhas_nivel_c" ADD CONSTRAINT "falhas_nivel_c_relatorioTurnoId_fkey" FOREIGN KEY ("relatorioTurnoId") REFERENCES "relatorios_turno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "falhas_nivel_c" ADD CONSTRAINT "falhas_nivel_c_tueId_fkey" FOREIGN KEY ("tueId") REFERENCES "tues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_torre_cco" ADD CONSTRAINT "solicitacoes_torre_cco_relatorioTurnoId_fkey" FOREIGN KEY ("relatorioTurnoId") REFERENCES "relatorios_turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_torre_cco" ADD CONSTRAINT "solicitacoes_torre_cco_tueId_fkey" FOREIGN KEY ("tueId") REFERENCES "tues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_torre_cco" ADD CONSTRAINT "solicitacoes_torre_cco_relacionadoFalhaNivelCId_fkey" FOREIGN KEY ("relacionadoFalhaNivelCId") REFERENCES "falhas_nivel_c"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientacoes_contratada" ADD CONSTRAINT "orientacoes_contratada_relatorioTurnoId_fkey" FOREIGN KEY ("relatorioTurnoId") REFERENCES "relatorios_turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orientacoes_contratada" ADD CONSTRAINT "orientacoes_contratada_tueId_fkey" FOREIGN KEY ("tueId") REFERENCES "tues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendencias_turno" ADD CONSTRAINT "pendencias_turno_relatorioTurnoId_fkey" FOREIGN KEY ("relatorioTurnoId") REFERENCES "relatorios_turno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendencias_turno" ADD CONSTRAINT "pendencias_turno_tueId_fkey" FOREIGN KEY ("tueId") REFERENCES "tues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

