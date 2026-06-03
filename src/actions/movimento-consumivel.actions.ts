"use server";

import { revalidatePath } from "next/cache";
import { movimentacaoConsumivelSchema } from "@/domain/consumable/validations";
import { DomainError } from "@/domain/shared/errors";
import { prisma } from "@/lib/prisma";
import { canAuthorizeExcecao, requireSession } from "@/lib/session";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function registrarMovimentacaoConsumivelAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();

  const parsed = movimentacaoConsumivelSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;

  if (input.ehExcecao && !canAuthorizeExcecao(session.perfil)) {
    return {
      success: false,
      error: "Movimentações de exceção requerem perfil Supervisor ou Admin",
    };
  }

  try {
    const mov = await prisma.$transaction(async (tx) => {
      const material = await tx.material.findUniqueOrThrow({
        where: { id: input.materialId },
      });

      if (!material.ativo) {
        throw new DomainError({ code: "SEM_PERMISSAO" });
      }

      const delta =
        input.tipo === "ENTRADA" || input.tipo === "AJUSTE_POSITIVO"
          ? input.quantidade
          : -input.quantidade;

      const novaQtd = material.quantidadeAtual + delta;
      if (novaQtd < 0) {
        throw new DomainError({
          code: "ESTOQUE_INSUFICIENTE",
          disponivel: material.quantidadeAtual,
          solicitado: input.quantidade,
        });
      }

      await tx.material.update({
        where: { id: input.materialId },
        data: { quantidadeAtual: novaQtd },
      });

      return tx.movimentacaoConsumivel.create({
        data: {
          materialId: input.materialId,
          tipo: input.tipo,
          quantidade: input.quantidade,
          numeroOS: input.numeroOS || null,
          numeroChamado: input.numeroChamado || null,
          atividadeId: input.atividadeId || null,
          observacao: input.observacao || null,
          ehExcecao: input.ehExcecao,
          justificativa: input.justificativa || null,
          autorizadoPor: input.ehExcecao ? session.id : null,
          realizadoPor: session.id,
          realizadoEm: input.realizadoEm,
        },
      });
    });

    revalidatePath("/materiais");
    revalidatePath(`/materiais/${input.materialId}`);
    revalidatePath("/movimentacoes/consumiveis");

    return { success: true, data: { id: mov.id } };
  } catch (e) {
    if (e instanceof DomainError) {
      return { success: false, error: e.message };
    }
    console.error("[MovConsum] Erro inesperado:", e);
    return { success: false, error: "Erro interno do servidor. Tente novamente." };
  }
}
