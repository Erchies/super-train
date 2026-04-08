"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import * as repo from "@/repositories/cadastros.repository";
import { CARROS_VALIDOS } from "@/domain/equipment/validations";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ── Localizações ──────────────────────────────────────────────────────────────

export async function criarLocalizacaoAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireSession();
  const codigo = formData.get("codigo") as string;
  const descricao = formData.get("descricao") as string;
  if (!codigo?.trim() || !descricao?.trim()) return { success: false, error: "Código e descrição obrigatórios" };
  try {
    const loc = await repo.criarLocalizacao({ codigo: codigo.trim().toUpperCase(), descricao: descricao.trim() });
    revalidatePath("/cadastros/localizacoes");
    return { success: true, data: { id: loc.id } };
  } catch {
    return { success: false, error: "Código já existe" };
  }
}

export async function atualizarLocalizacaoAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const codigo = formData.get("codigo") as string;
  const descricao = formData.get("descricao") as string;
  const ativo = formData.get("ativo") === "true";
  try {
    await repo.atualizarLocalizacao(id, { codigo: codigo?.trim().toUpperCase(), descricao: descricao?.trim(), ativo });
    revalidatePath("/cadastros/localizacoes");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao atualizar localização" };
  }
}

export async function excluirLocalizacaoAction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  if (session.perfil !== "ADMIN") return { success: false, error: "Apenas administradores podem excluir" };
  try {
    await repo.excluirLocalizacao(id);
    revalidatePath("/cadastros/localizacoes");
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erro ao excluir localização" };
  }
}

// ── TUEs ──────────────────────────────────────────────────────────────────────

export async function criarTUEAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireSession();
  const numero = formData.get("numero") as string;
  const serie = formData.get("serie") as "SERIE_100" | "SERIE_200";
  const descricao = formData.get("descricao") as string;
  if (!numero?.trim() || !serie) return { success: false, error: "Número e série obrigatórios" };
  try {
    const tue = await repo.criarTUE({ numero: numero.trim(), serie, descricao: descricao?.trim() });
    revalidatePath("/cadastros/tues");
    return { success: true, data: { id: tue.id } };
  } catch {
    return { success: false, error: "Número de TUE já existe" };
  }
}

export async function atualizarTUEAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const numero = formData.get("numero") as string;
  const serie = formData.get("serie") as "SERIE_100" | "SERIE_200";
  const descricao = formData.get("descricao") as string;
  const ativo = formData.get("ativo") === "true";
  try {
    await repo.atualizarTUE(id, { numero: numero?.trim(), serie, descricao: descricao?.trim(), ativo });
    revalidatePath("/cadastros/tues");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao atualizar TUE" };
  }
}

export async function excluirTUEAction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  if (session.perfil !== "ADMIN") return { success: false, error: "Apenas administradores podem excluir" };
  try {
    await repo.excluirTUE(id);
    revalidatePath("/cadastros/tues");
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erro ao excluir TUE" };
  }
}

// ── Carros ────────────────────────────────────────────────────────────────────

export async function criarCarroAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireSession();
  const codigo = (formData.get("codigo") as string)?.trim().toUpperCase();
  const descricao = (formData.get("descricao") as string)?.trim();
  if (!codigo || !descricao) return { success: false, error: "Código e descrição obrigatórios" };
  if (!(CARROS_VALIDOS as readonly string[]).includes(codigo)) {
    return { success: false, error: `Código inválido. Carros válidos: ${CARROS_VALIDOS.join(", ")}` };
  }
  try {
    const carro = await repo.criarCarro({ codigo, descricao });
    revalidatePath("/cadastros/carros");
    return { success: true, data: { id: carro.id } };
  } catch {
    return { success: false, error: "Código já existe" };
  }
}

export async function atualizarCarroAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const codigo = (formData.get("codigo") as string)?.trim().toUpperCase();
  const descricao = (formData.get("descricao") as string)?.trim();
  const ativo = formData.get("ativo") === "true";
  if (codigo && !(CARROS_VALIDOS as readonly string[]).includes(codigo)) {
    return { success: false, error: `Código inválido. Válidos: ${CARROS_VALIDOS.join(", ")}` };
  }
  try {
    await repo.atualizarCarro(id, { codigo, descricao, ativo });
    revalidatePath("/cadastros/carros");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao atualizar carro" };
  }
}

export async function excluirCarroAction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  if (session.perfil !== "ADMIN") return { success: false, error: "Apenas administradores podem excluir" };
  try {
    await repo.excluirCarro(id);
    revalidatePath("/cadastros/carros");
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erro ao excluir carro" };
  }
}

// ── Posições Possíveis ────────────────────────────────────────────────────────
// Vinculadas à SÉRIE (não ao TUE individual) + Carro + Nome do Equipamento.
// O formulário aceita múltiplos carros (vírgula) e múltiplas posições (ponto-e-vírgula),
// criando uma linha por combinação carro × posição.

export async function criarPosicaoPossivelAction(formData: FormData): Promise<ActionResult<{ criados: number }>> {
  await requireSession();
  const serie = (formData.get("serie") as string)?.trim();
  const nomeEquipamento = (formData.get("nomeEquipamento") as string)?.trim();
  const carrosRaw = (formData.get("carros") as string) ?? "";
  const posicoesRaw = (formData.get("posicoes") as string) ?? "";

  if (!serie || !nomeEquipamento) {
    return { success: false, error: "Série e Nome do Equipamento são obrigatórios" };
  }
  if (!["SERIE_100", "SERIE_200"].includes(serie)) {
    return { success: false, error: "Série inválida" };
  }

  const carros = carrosRaw
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
  const posicoes = posicoesRaw
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);

  if (carros.length === 0) return { success: false, error: "Selecione ao menos um Carro" };
  if (posicoes.length === 0) return { success: false, error: "Informe ao menos uma Posição" };

  const invalidos = carros.filter((c) => !(CARROS_VALIDOS as readonly string[]).includes(c));
  if (invalidos.length > 0) {
    return { success: false, error: `Carro(s) inválido(s): ${invalidos.join(", ")}` };
  }

  let criados = 0;
  for (const carro of carros) {
    for (const posicao of posicoes) {
      try {
        await repo.criarPosicaoPossivel({ nomeEquipamento, serie, carro, posicao });
        criados++;
      } catch (e: any) {
        if (e?.code !== "P2002") throw e; // ignorar duplicatas
      }
    }
  }

  revalidatePath("/cadastros/posicoes");
  return { success: true, data: { criados } };
}

export async function atualizarPosicaoPossivelAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const posicao = (formData.get("posicao") as string)?.trim();
  const ativo = formData.get("ativo") === "true";

  try {
    await repo.atualizarPosicaoPossivel(id, { posicao: posicao || undefined, ativo });
    revalidatePath("/cadastros/posicoes");
    return { success: true, data: undefined };
  } catch (e: any) {
    if (e?.code === "P2002") return { success: false, error: "Posição já existe para essa combinação" };
    return { success: false, error: "Erro ao atualizar posição" };
  }
}

export async function excluirPosicaoPossivelAction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  if (session.perfil !== "ADMIN") return { success: false, error: "Apenas administradores podem excluir" };
  try {
    await repo.excluirPosicaoPossivel(id);
    revalidatePath("/cadastros/posicoes");
    return { success: true, data: undefined };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erro ao excluir posição" };
  }
}

// ── Funções ───────────────────────────────────────────────────────────────────

export async function criarFuncaoAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireSession();
  const codigo = formData.get("codigo") as string;
  const descricao = formData.get("descricao") as string;
  if (!codigo?.trim() || !descricao?.trim()) return { success: false, error: "Código e descrição obrigatórios" };
  try {
    const func = await repo.criarFuncao({ codigo: codigo.trim().toUpperCase(), descricao: descricao.trim() });
    revalidatePath("/cadastros/funcoes");
    return { success: true, data: { id: func.id } };
  } catch {
    return { success: false, error: "Código já existe" };
  }
}

export async function atualizarFuncaoAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const codigo = formData.get("codigo") as string;
  const descricao = formData.get("descricao") as string;
  const ativo = formData.get("ativo") === "true";
  try {
    await repo.atualizarFuncao(id, { codigo: codigo?.trim().toUpperCase(), descricao: descricao?.trim(), ativo });
    revalidatePath("/cadastros/funcoes");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao atualizar função" };
  }
}

// ── Oficinas ──────────────────────────────────────────────────────────────────

export async function criarOficinaAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireSession();
  const nome = formData.get("nome") as string;
  const tipo = formData.get("tipo") as string;
  const contato = formData.get("contato") as string;
  if (!nome?.trim() || !tipo?.trim()) return { success: false, error: "Nome e tipo obrigatórios" };
  try {
    const of = await repo.criarOficina({ nome: nome.trim(), tipo: tipo.trim(), contato: contato?.trim() });
    revalidatePath("/cadastros/oficinas");
    return { success: true, data: { id: of.id } };
  } catch {
    return { success: false, error: "Erro ao criar oficina" };
  }
}

export async function atualizarOficinaAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const nome = formData.get("nome") as string;
  const tipo = formData.get("tipo") as string;
  const contato = formData.get("contato") as string;
  const ativo = formData.get("ativo") === "true";
  try {
    await repo.atualizarOficina(id, { nome: nome?.trim(), tipo: tipo?.trim(), contato: contato?.trim(), ativo });
    revalidatePath("/cadastros/oficinas");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao atualizar oficina" };
  }
}

// ── Atividades ────────────────────────────────────────────────────────────────

export async function criarAtividadeAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  await requireSession();
  const codigo = formData.get("codigo") as string;
  const descricao = formData.get("descricao") as string;
  if (!codigo?.trim() || !descricao?.trim()) return { success: false, error: "Código e descrição obrigatórios" };
  try {
    const ativ = await repo.criarAtividade({ codigo: codigo.trim().toUpperCase(), descricao: descricao.trim() });
    revalidatePath("/cadastros/atividades");
    return { success: true, data: { id: ativ.id } };
  } catch {
    return { success: false, error: "Código já existe" };
  }
}

export async function atualizarAtividadeAction(id: string, formData: FormData): Promise<ActionResult> {
  await requireSession();
  const codigo = formData.get("codigo") as string;
  const descricao = formData.get("descricao") as string;
  const ativo = formData.get("ativo") === "true";
  try {
    await repo.atualizarAtividade(id, { codigo: codigo?.trim().toUpperCase(), descricao: descricao?.trim(), ativo });
    revalidatePath("/cadastros/atividades");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Erro ao atualizar atividade" };
  }
}

// Aliases legados para compatibilidade
export const criarPosicaoAction = criarCarroAction;
export const atualizarPosicaoAction = atualizarCarroAction;
