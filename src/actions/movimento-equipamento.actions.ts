"use server";

import { revalidatePath } from "next/cache";
import { requireSession, canAuthorizeExcecao } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  instalacaoTueSchema,
  retiradaTueEstoqueSchema,
  retiradaTueReparoSchema,
  transferenciaTueSchema,
  envioReparoSchema,
  retornoReparoEstoqueSchema,
  retornoReparoInstalacaoSchema,
  baixaSucataSchema,
  entradaEstoqueEquipSchema,
} from "@/domain/equipment/validations";
import {
  validarOrigem,
  isCompativel,
  isEstadoTerminal,
} from "@/domain/equipment/state-machine";
import { DomainError, isPrismaUniqueError } from "@/domain/shared/errors";
import {
  verificarSlotOcupado,
  listarPosicoesDisponiveisPorContexto,
} from "@/repositories/equipamento.repository";

// Re-exporta para uso nos formulários de movimentação
export { listarPosicoesDisponiveisPorContexto };

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

function revalidateEquipPages(equipId: string) {
  revalidatePath("/equipamentos");
  revalidatePath(`/equipamentos/${equipId}`);
  revalidatePath("/movimentacoes/equipamentos");
  revalidatePath("/dashboard");
}

// ── Entrada no Estoque ────────────────────────────────────────────────────────

export async function entradaEstoqueEquipAction(data: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const parsed = entradaEstoqueEquipSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors };

  const input = parsed.data;
  try {
    const equip = await prisma.equipamento.findUniqueOrThrow({ where: { id: input.equipamentoId } });
    if (isEstadoTerminal(equip.status)) throw new DomainError({ code: "ESTADO_TERMINAL", status: equip.status });

    await prisma.equipamento.update({
      where: { id: input.equipamentoId },
      data: { status: "EM_ESTOQUE", localizacaoId: input.localizacaoId, tueId: null, carro: null, posicaoInstalada: null },
    });
    const mov = await prisma.movimentacaoEquipamento.create({
      data: {
        equipamentoId: input.equipamentoId,
        tipo: "ENTRADA_ESTOQUE",
        statusAnterior: equip.status,
        statusNovo: "EM_ESTOQUE",
        localizacaoId: input.localizacaoId,
        observacao: input.observacao,
        realizadoPor: session.id,
        realizadoEm: input.realizadoEm,
      },
    });
    revalidateEquipPages(input.equipamentoId);
    return { success: true, data: { id: mov.id } };
  } catch (e) {
    if (e instanceof DomainError) return { success: false, error: e.message };
    throw e;
  }
}

// ── Instalação em TUE ─────────────────────────────────────────────────────────

export async function instalarEquipamentoAction(data: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const parsed = instalacaoTueSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors };

  const input = parsed.data;
  if (input.ehExcecao && !canAuthorizeExcecao(session.perfil)) {
    return { success: false, error: "Movimentações de exceção requerem perfil Supervisor ou Admin" };
  }

  try {
    const [equip, tue] = await Promise.all([
      prisma.equipamento.findUniqueOrThrow({ where: { id: input.equipamentoId } }),
      prisma.tUE.findUniqueOrThrow({ where: { id: input.tueId } }),
    ]);

    if (isEstadoTerminal(equip.status)) throw new DomainError({ code: "ESTADO_TERMINAL", status: equip.status });

    const origemOk = validarOrigem("INSTALACAO_TUE", equip.status);
    if (!origemOk.valido && !input.ehExcecao) {
      throw new DomainError({ code: "ORIGEM_INVALIDA", esperado: origemOk.esperado!.join(" ou "), atual: equip.status });
    }

    if (!isCompativel(equip.compatibilidade, tue.serie)) {
      throw new DomainError({ code: "INCOMPATIBILIDADE_SERIE", equipSerie: equip.compatibilidade, tueSerie: tue.serie });
    }

    // Validar que posição existe no cadastro de posições possíveis.
    // Busca por SÉRIE do TUE + Carro + Nome (tipo) do equipamento — não por TUE individual.
    if (!input.ehExcecao) {
      const posicoesCadastradas = await listarPosicoesDisponiveisPorContexto(
        equip.descricao,
        tue.serie,
        input.carro
      );
      if (posicoesCadastradas.length > 0) {
        const posicaoValida = posicoesCadastradas.some((p) => p.posicao === input.posicaoInstalada);
        if (!posicaoValida) {
          throw new DomainError({ code: "POSICAO_NAO_CADASTRADA", posicao: input.posicaoInstalada });
        }
      }
    }

    // Verificar se slot já está ocupado
    const slotOcupado = await verificarSlotOcupado(input.tueId, input.carro, input.posicaoInstalada, input.equipamentoId);
    if (slotOcupado) {
      throw new DomainError({
        code: "SLOT_OCUPADO",
        tueNumero: tue.numero,
        posicaoCodigo: input.posicaoInstalada,
        funcaoCodigo: input.carro,
      });
    }

    await prisma.equipamento.update({
      where: { id: input.equipamentoId },
      data: {
        status: "INSTALADO_TUE",
        tueId: input.tueId,
        carro: input.carro,
        posicaoInstalada: input.posicaoInstalada,
        localizacaoId: null,
      },
    });

    const mov = await prisma.movimentacaoEquipamento.create({
      data: {
        equipamentoId: input.equipamentoId,
        tipo: "INSTALACAO_TUE",
        statusAnterior: equip.status,
        statusNovo: "INSTALADO_TUE",
        tueId: input.tueId,
        carro: input.carro,
        posicaoInstalada: input.posicaoInstalada,
        numeroOS: input.numeroOS,
        ehExcecao: input.ehExcecao,
        justificativa: input.justificativa,
        autorizadoPor: input.ehExcecao ? session.id : null,
        observacao: input.observacao,
        realizadoPor: session.id,
        realizadoEm: input.realizadoEm,
      },
    });

    revalidateEquipPages(input.equipamentoId);
    return { success: true, data: { id: mov.id } };
  } catch (e) {
    if (e instanceof DomainError) return { success: false, error: e.message };
    if (isPrismaUniqueError(e)) return { success: false, error: "Posição já ocupada neste TUE/Carro" };
    throw e;
  }
}

// ── Retirada TUE → Estoque ────────────────────────────────────────────────────

export async function retiradaTueEstoqueAction(data: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const parsed = retiradaTueEstoqueSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors };

  const input = parsed.data;
  if (input.ehExcecao && !canAuthorizeExcecao(session.perfil)) {
    return { success: false, error: "Movimentações de exceção requerem perfil Supervisor ou Admin" };
  }

  try {
    const equip = await prisma.equipamento.findUniqueOrThrow({ where: { id: input.equipamentoId } });
    if (isEstadoTerminal(equip.status)) throw new DomainError({ code: "ESTADO_TERMINAL", status: equip.status });

    const origemOk = validarOrigem("RETIRADA_TUE_ESTOQUE", equip.status);
    if (!origemOk.valido && !input.ehExcecao) {
      throw new DomainError({ code: "ORIGEM_INVALIDA", esperado: "INSTALADO_TUE", atual: equip.status });
    }

    const tueAnterior = equip.tueId;
    const carroAnterior = equip.carro;
    const posicaoAnterior = equip.posicaoInstalada;

    await prisma.equipamento.update({
      where: { id: input.equipamentoId },
      data: { status: "EM_ESTOQUE", localizacaoId: input.localizacaoId, tueId: null, carro: null, posicaoInstalada: null },
    });

    const mov = await prisma.movimentacaoEquipamento.create({
      data: {
        equipamentoId: input.equipamentoId,
        tipo: "RETIRADA_TUE_ESTOQUE",
        statusAnterior: equip.status,
        statusNovo: "EM_ESTOQUE",
        tueId: tueAnterior,
        carro: carroAnterior,
        posicaoInstalada: posicaoAnterior,
        localizacaoId: input.localizacaoId,
        numeroOS: input.numeroOS,
        ehExcecao: input.ehExcecao,
        justificativa: input.justificativa,
        autorizadoPor: input.ehExcecao ? session.id : null,
        observacao: input.observacao,
        realizadoPor: session.id,
        realizadoEm: input.realizadoEm,
      },
    });

    revalidateEquipPages(input.equipamentoId);
    return { success: true, data: { id: mov.id } };
  } catch (e) {
    if (e instanceof DomainError) return { success: false, error: e.message };
    throw e;
  }
}

// ── Retirada TUE → Aguardando Reparo ─────────────────────────────────────────

export async function retiradaTueReparoAction(data: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const parsed = retiradaTueReparoSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors };

  const input = parsed.data;
  if (input.ehExcecao && !canAuthorizeExcecao(session.perfil)) {
    return { success: false, error: "Movimentações de exceção requerem perfil Supervisor ou Admin" };
  }

  try {
    const equip = await prisma.equipamento.findUniqueOrThrow({ where: { id: input.equipamentoId } });
    if (isEstadoTerminal(equip.status)) throw new DomainError({ code: "ESTADO_TERMINAL", status: equip.status });

    const origemOk = validarOrigem("RETIRADA_TUE_REPARO", equip.status);
    if (!origemOk.valido && !input.ehExcecao) {
      throw new DomainError({ code: "ORIGEM_INVALIDA", esperado: "INSTALADO_TUE", atual: equip.status });
    }

    const tueAnterior = equip.tueId;
    const carroAnterior = equip.carro;
    const posicaoAnterior = equip.posicaoInstalada;

    await prisma.equipamento.update({
      where: { id: input.equipamentoId },
      data: { status: "AGUARDANDO_REPARO", tueId: null, carro: null, posicaoInstalada: null, localizacaoId: null },
    });

    const mov = await prisma.movimentacaoEquipamento.create({
      data: {
        equipamentoId: input.equipamentoId,
        tipo: "RETIRADA_TUE_REPARO",
        statusAnterior: equip.status,
        statusNovo: "AGUARDANDO_REPARO",
        tueId: tueAnterior,
        carro: carroAnterior,
        posicaoInstalada: posicaoAnterior,
        motivoReparo: input.motivoReparo,
        numeroOS: input.numeroOS,
        ehExcecao: input.ehExcecao,
        justificativa: input.justificativa,
        autorizadoPor: input.ehExcecao ? session.id : null,
        observacao: input.observacao,
        realizadoPor: session.id,
        realizadoEm: input.realizadoEm,
      },
    });

    revalidateEquipPages(input.equipamentoId);
    return { success: true, data: { id: mov.id } };
  } catch (e) {
    if (e instanceof DomainError) return { success: false, error: e.message };
    throw e;
  }
}

// ── Transferência entre TUEs ──────────────────────────────────────────────────

export async function transferenciaTueAction(data: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const parsed = transferenciaTueSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors };

  const input = parsed.data;
  if (input.ehExcecao && !canAuthorizeExcecao(session.perfil)) {
    return { success: false, error: "Movimentações de exceção requerem perfil Supervisor ou Admin" };
  }

  try {
    const [equip, tueDest] = await Promise.all([
      prisma.equipamento.findUniqueOrThrow({ where: { id: input.equipamentoId } }),
      prisma.tUE.findUniqueOrThrow({ where: { id: input.tueDestinoId } }),
    ]);

    if (isEstadoTerminal(equip.status)) throw new DomainError({ code: "ESTADO_TERMINAL", status: equip.status });

    const origemOk = validarOrigem("TRANSFERENCIA_TUE", equip.status);
    if (!origemOk.valido && !input.ehExcecao) {
      throw new DomainError({ code: "ORIGEM_INVALIDA", esperado: "INSTALADO_TUE", atual: equip.status });
    }

    if (!isCompativel(equip.compatibilidade, tueDest.serie)) {
      throw new DomainError({ code: "INCOMPATIBILIDADE_SERIE", equipSerie: equip.compatibilidade, tueSerie: tueDest.serie });
    }

    // Validar posição cadastrada por SÉRIE do TUE destino + Carro + Nome do equipamento
    if (!input.ehExcecao) {
      const posicoesCadastradas = await listarPosicoesDisponiveisPorContexto(
        equip.descricao,
        tueDest.serie,
        input.carro
      );
      if (posicoesCadastradas.length > 0) {
        const posicaoValida = posicoesCadastradas.some((p) => p.posicao === input.posicaoInstalada);
        if (!posicaoValida) {
          throw new DomainError({ code: "POSICAO_NAO_CADASTRADA", posicao: input.posicaoInstalada });
        }
      }
    }

    const slotOcupado = await verificarSlotOcupado(input.tueDestinoId, input.carro, input.posicaoInstalada, input.equipamentoId);
    if (slotOcupado) {
      throw new DomainError({
        code: "SLOT_OCUPADO",
        tueNumero: tueDest.numero,
        posicaoCodigo: input.posicaoInstalada,
        funcaoCodigo: input.carro,
      });
    }

    const tueAnterior = equip.tueId;
    const carroAnterior = equip.carro;
    const posicaoAnterior = equip.posicaoInstalada;

    await prisma.equipamento.update({
      where: { id: input.equipamentoId },
      data: { tueId: input.tueDestinoId, carro: input.carro, posicaoInstalada: input.posicaoInstalada },
    });

    const mov = await prisma.movimentacaoEquipamento.create({
      data: {
        equipamentoId: input.equipamentoId,
        tipo: "TRANSFERENCIA_TUE",
        statusAnterior: equip.status,
        statusNovo: "INSTALADO_TUE",
        tueId: tueAnterior,
        carro: carroAnterior,
        posicaoInstalada: posicaoAnterior,
        numeroOS: input.numeroOS,
        ehExcecao: input.ehExcecao,
        justificativa: input.justificativa,
        autorizadoPor: input.ehExcecao ? session.id : null,
        observacao: input.observacao,
        realizadoPor: session.id,
        realizadoEm: input.realizadoEm,
      },
    });

    revalidateEquipPages(input.equipamentoId);
    return { success: true, data: { id: mov.id } };
  } catch (e) {
    if (e instanceof DomainError) return { success: false, error: e.message };
    throw e;
  }
}

// ── Envio para Reparo ─────────────────────────────────────────────────────────

export async function envioReparoAction(data: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const parsed = envioReparoSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors };

  const input = parsed.data;
  if (input.ehExcecao && !canAuthorizeExcecao(session.perfil)) {
    return { success: false, error: "Movimentações de exceção requerem perfil Supervisor ou Admin" };
  }

  try {
    const equip = await prisma.equipamento.findUniqueOrThrow({ where: { id: input.equipamentoId } });
    if (isEstadoTerminal(equip.status)) throw new DomainError({ code: "ESTADO_TERMINAL", status: equip.status });

    const origemOk = validarOrigem("ENVIO_REPARO", equip.status);
    if (!origemOk.valido && !input.ehExcecao) {
      throw new DomainError({ code: "ORIGEM_INVALIDA", esperado: "AGUARDANDO_REPARO", atual: equip.status });
    }

    await prisma.equipamento.update({
      where: { id: input.equipamentoId },
      data: { status: "EM_REPARO", localizacaoId: null },
    });

    const mov = await prisma.movimentacaoEquipamento.create({
      data: {
        equipamentoId: input.equipamentoId,
        tipo: "ENVIO_REPARO",
        statusAnterior: equip.status,
        statusNovo: "EM_REPARO",
        oficinaId: input.oficinaId,
        motivoReparo: input.motivoReparo,
        ehExcecao: input.ehExcecao,
        justificativa: input.justificativa,
        autorizadoPor: input.ehExcecao ? session.id : null,
        observacao: input.observacao,
        realizadoPor: session.id,
        realizadoEm: input.realizadoEm,
      },
    });

    revalidateEquipPages(input.equipamentoId);
    return { success: true, data: { id: mov.id } };
  } catch (e) {
    if (e instanceof DomainError) return { success: false, error: e.message };
    throw e;
  }
}

// ── Retorno de Reparo → Estoque ───────────────────────────────────────────────

export async function retornoReparoEstoqueAction(data: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  const parsed = retornoReparoEstoqueSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors };

  const input = parsed.data;
  if (input.ehExcecao && !canAuthorizeExcecao(session.perfil)) {
    return { success: false, error: "Movimentações de exceção requerem perfil Supervisor ou Admin" };
  }

  try {
    const equip = await prisma.equipamento.findUniqueOrThrow({ where: { id: input.equipamentoId } });
    if (isEstadoTerminal(equip.status)) throw new DomainError({ code: "ESTADO_TERMINAL", status: equip.status });

    const origemOk = validarOrigem("RETORNO_REPARO_ESTOQUE", equip.status);
    if (!origemOk.valido && !input.ehExcecao) {
      throw new DomainError({ code: "ORIGEM_INVALIDA", esperado: "EM_REPARO", atual: equip.status });
    }

    await prisma.equipamento.update({
      where: { id: input.equipamentoId },
      data: { status: "EM_ESTOQUE", localizacaoId: input.localizacaoId },
    });

    const mov = await prisma.movimentacaoEquipamento.create({
      data: {
        equipamentoId: input.equipamentoId,
        tipo: "RETORNO_REPARO_ESTOQUE",
        statusAnterior: equip.status,
        statusNovo: "EM_ESTOQUE",
        localizacaoId: input.localizacaoId,
        ehExcecao: input.ehExcecao,
        justificativa: input.justificativa,
        autorizadoPor: input.ehExcecao ? session.id : null,
        observacao: input.observacao,
        realizadoPor: session.id,
        realizadoEm: input.realizadoEm,
      },
    });

    revalidateEquipPages(input.equipamentoId);
    return { success: true, data: { id: mov.id } };
  } catch (e) {
    if (e instanceof DomainError) return { success: false, error: e.message };
    throw e;
  }
}

// ── Baixa para Sucata ─────────────────────────────────────────────────────────

export async function baixaSucataAction(data: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();
  if (session.perfil === "OPERADOR") return { success: false, error: "Baixa para sucata requer perfil Supervisor ou Admin" };

  const parsed = baixaSucataSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors };

  const input = parsed.data;

  try {
    const equip = await prisma.equipamento.findUniqueOrThrow({ where: { id: input.equipamentoId } });
    if (isEstadoTerminal(equip.status)) throw new DomainError({ code: "ESTADO_TERMINAL", status: equip.status });

    await prisma.equipamento.update({
      where: { id: input.equipamentoId },
      data: { status: "SUCATA", tueId: null, carro: null, posicaoInstalada: null, localizacaoId: null },
    });

    const mov = await prisma.movimentacaoEquipamento.create({
      data: {
        equipamentoId: input.equipamentoId,
        tipo: "BAIXA_SUCATA",
        statusAnterior: equip.status,
        statusNovo: "SUCATA",
        motivoSucata: input.motivoSucata,
        ehExcecao: input.ehExcecao,
        justificativa: input.justificativa,
        autorizadoPor: input.ehExcecao ? session.id : null,
        observacao: input.observacao,
        realizadoPor: session.id,
        realizadoEm: input.realizadoEm,
      },
    });

    revalidateEquipPages(input.equipamentoId);
    return { success: true, data: { id: mov.id } };
  } catch (e) {
    if (e instanceof DomainError) return { success: false, error: e.message };
    throw e;
  }
}
