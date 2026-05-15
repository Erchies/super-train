"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { materialSchema } from "@/domain/consumable/validations";
import * as repo from "@/repositories/material.repository";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

function normalizeMaterialInput(data: unknown) {
  if (data instanceof FormData) {
    const posicoesPossiveisIds = data
      .getAll("posicoesPossiveisIds")
      .map((v) => String(v))
      .filter(Boolean);

    return {
      codigoTrensurb: String(data.get("codigoTrensurb") ?? ""),
      descricao: String(data.get("descricao") ?? ""),
      unidade: String(data.get("unidade") ?? "").trim().toUpperCase(),
      estoqueMinimo: data.get("estoqueMinimo") ? String(data.get("estoqueMinimo")) : "0",
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
    ...(Object.prototype.hasOwnProperty.call(obj, "unidade")
      ? { unidade: String(obj.unidade ?? "").trim().toUpperCase() }
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

export async function criarMaterialAction(data: unknown): Promise<ActionResult<{ id: string }>> {
  await requireSession();

  const parsed = materialSchema.safeParse(normalizeMaterialInput(data));
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existente = await repo.buscarMaterialPorCodigo(parsed.data.codigoTrensurb);
  if (existente) return { success: false, error: "Código Trensurb já cadastrado" };

  const material = await repo.criarMaterial(parsed.data);
  revalidatePath("/materiais");
  return { success: true, data: { id: material.id } };
}

export async function atualizarMaterialAction(id: string, data: unknown): Promise<ActionResult> {
  await requireSession();

  const parsed = materialSchema.partial().safeParse(normalizeMaterialInput(data));
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await repo.atualizarMaterial(id, parsed.data);
  revalidatePath("/materiais");
  revalidatePath(`/materiais/${id}`);
  return { success: true, data: undefined };
}

export async function inativarMaterialAction(id: string): Promise<ActionResult> {
  await requireSession();
  await repo.atualizarMaterial(id, { ativo: false });
  revalidatePath("/materiais");
  return { success: true, data: undefined };
}
