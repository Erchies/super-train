import { z } from "zod";

export const materialSchema = z.object({
  codigoTrensurb: z.string().min(1, "Código Trensurb obrigatório").max(50).trim(),
  descricao: z.string().min(1, "Descrição obrigatória").max(255).trim(),
  unidade: z.string().min(1, "Unidade de medida obrigatória").max(20).trim(),
  estoqueMinimo: z.coerce.number().min(0, "Estoque mínimo não pode ser negativo"),
  localizacaoId: z.string().cuid("ID de localização inválido").optional().nullable(),
  posicoesPossiveisIds: z.array(z.string().cuid("ID de posição inválido")).optional(),
  observacao: z.string().max(500).optional().nullable(),
});

export const movimentacaoConsumivelSchema = z
  .object({
    materialId: z.string().cuid(),
    tipo: z.enum(["ENTRADA", "SAIDA", "AJUSTE_POSITIVO", "AJUSTE_NEGATIVO"]),
    quantidade: z.coerce.number().positive("Quantidade deve ser positiva"),
    numeroOS: z.string().optional().nullable(),
    numeroChamado: z.string().optional().nullable(),
    atividadeId: z.string().cuid().optional().nullable(),
    observacao: z.string().optional().nullable(),
    realizadoEm: z.coerce.date(),
    ehExcecao: z.boolean().default(false),
    justificativa: z.string().optional().nullable(),
  })
  .superRefine((d, ctx) => {
    if (d.tipo === "SAIDA") {
      const temRastreio =
        (d.numeroOS && d.numeroOS.trim().length > 0) ||
        (d.numeroChamado && d.numeroChamado.trim().length > 0) ||
        d.atividadeId;
      if (!temRastreio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["numeroOS"],
          message: "Saída exige OS, chamado ou atividade",
        });
      }
    }

    if ((d.tipo === "AJUSTE_POSITIVO" || d.tipo === "AJUSTE_NEGATIVO") && !d.ehExcecao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ehExcecao"],
        message: "Ajustes de inventário são sempre movimentações de exceção",
      });
    }

    if (d.ehExcecao && !d.justificativa?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["justificativa"],
        message: "Justificativa obrigatória para exceção",
      });
    }
  });
