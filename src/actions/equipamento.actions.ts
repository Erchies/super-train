"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { equipamentoSchema } from "@/domain/equipment/validations";
import * as repo from "@/repositories/equipamento.repository";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

function normalizeEquipamentoInput(data: unknown) {
  if (data instanceof FormData) {
    const posicoesPossiveisIds = data
      .getAll("posicoesPossiveisIds")
      .map((v) => String(v))
      .filter(Boolean);

    return {
      numeroSerie: String(data.get("numeroSerie") ?? ""),
      codigoTrensurb: String(data.get("codigoTrensurb") ?? ""),
      descricao: String(data.get("descricao") ?? ""),
      sistema: String(data.get("sistema") ?? "OUTROS").trim().toUpperCase() || "OUTROS",
      compatibilidade: String(data.get("compatibilidade") ?? ""),
      localizacaoId: data.get("localizacaoId") ? String(data.get("localizacaoId")) : null,
      posicoesPossiveisIds,
      observacao: data.get("observacao") ? String(data.get("observacao")) : null,
    };
  }

  const obj = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;
  const rawPos = obj.posicoesPossiveisIds;
  const posicoesPossiveisIds = Array.isArray(rawPos)
    ? rawPos.map((v) => String(v)).filter(Boolean)
    : typeof rawPos === "string" && rawPos.trim().length > 0
    ? [rawPos]
    : [];

  return {
    ...obj,
    ...(Object.prototype.hasOwnProperty.call(obj, "sistema")
      ? { sistema: String(obj.sistema ?? "OUTROS").trim().toUpperCase() || "OUTROS" }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(obj, "localizacaoId")
      ? { localizacaoId: obj.localizacaoId ? String(obj.localizacaoId) : null }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(obj, "posicoesPossiveisIds") ? { posicoesPossiveisIds } : {}),
    ...(Object.prototype.hasOwnProperty.call(obj, "observacao")
      ? { observacao: obj.observacao ? String(obj.observacao) : null }
      : {}),
  };
}

export async function criarEquipamentoAction(data: unknown): Promise<ActionResult<{ id: string }>> {
  await requireSession();

  const parsed = equipamentoSchema.safeParse(normalizeEquipamentoInput(data));
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const existente = await repo.buscarEquipamentoPorSerie(parsed.data.numeroSerie);
    if (existente) return { success: false, error: "Número de série já cadastrado" };

    const equip = await repo.criarEquipamento(parsed.data);
    revalidatePath("/equipamentos");
    return { success: true, data: { id: equip.id } };
  } catch (e) {
    console.error("[Equipamento] Erro ao criar:", e);
    return { success: false, error: "Erro interno do servidor. Tente novamente." };
  }
}

export async function atualizarEquipamentoAction(id: string, data: unknown): Promise<ActionResult> {
  await requireSession();

  const parsed = equipamentoSchema.partial().omit({ numeroSerie: true }).safeParse(normalizeEquipamentoInput(data));
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await repo.atualizarEquipamento(id, parsed.data);
    revalidatePath("/equipamentos");
    revalidatePath(`/equipamentos/${id}`);
    return { success: true, data: undefined };
  } catch (e) {
    console.error("[Equipamento] Erro ao atualizar:", e);
    return { success: false, error: "Erro interno do servidor. Tente novamente." };
  }
}

export async function inativarEquipamentoAction(id: string): Promise<ActionResult> {
  const session = await requireSession();
  if (session.perfil === "OPERADOR") return { success: false, error: "Sem permissão" };

  await repo.atualizarEquipamento(id, { ativo: false });
  revalidatePath("/equipamentos");
  return { success: true, data: undefined };
}
