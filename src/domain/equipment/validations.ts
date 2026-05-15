import { z } from "zod";
import { SISTEMAS_EQUIPAMENTO } from "@/lib/catalogos";

// Carros válidos
export const CARROS_VALIDOS = ["MA", "MB", "RA", "RB"] as const;
export type CarroEnum = (typeof CARROS_VALIDOS)[number];

// TUEs válidos: 101–125 (Série 100) e 226–240 (Série 200)
function isTUENumeroValido(numero: string): boolean {
  const n = parseInt(numero, 10);
  return (!isNaN(n) && ((n >= 101 && n <= 125) || (n >= 226 && n <= 240)));
}

export const equipamentoSchema = z.object({
  numeroSerie: z.string().min(1, "Número de série obrigatório").max(100).trim(),
  codigoTrensurb: z.string().min(1, "Código Trensurb obrigatório").max(50).trim(),
  descricao: z.string().min(1, "Descrição obrigatória").max(255).trim(),
  sistema: z.enum(SISTEMAS_EQUIPAMENTO, {
    errorMap: () => ({ message: "Sistema obrigatório" }),
  }).default("OUTROS"),
  compatibilidade: z.enum(["SERIE_100", "SERIE_200", "AMBAS"], {
    errorMap: () => ({ message: "Compatibilidade obrigatória" }),
  }),
  localizacaoId: z.string().cuid("ID de localização inválido").optional().nullable(),
  observacao: z.string().max(500).optional().nullable(),
});

export const entradaEstoqueEquipSchema = z.object({
  equipamentoId: z.string().cuid(),
  localizacaoId: z.string().cuid("Localização obrigatória"),
  observacao: z.string().optional(),
  realizadoEm: z.coerce.date(),
});

const excecaoRefine = (d: { ehExcecao: boolean; justificativa?: string }, ctx: z.RefinementCtx) => {
  if (d.ehExcecao && !d.justificativa?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["justificativa"], message: "Justificativa obrigatória para exceção" });
  }
};

export const instalacaoTueSchema = z.object({
  equipamentoId: z.string().cuid(),
  tueId: z.string().cuid("TUE obrigatório"),
  carro: z.enum(CARROS_VALIDOS, { errorMap: () => ({ message: "Carro obrigatório (MA, MB, RA ou RB)" }) }),
  posicaoInstalada: z.string().min(1, "Posição obrigatória").max(100).trim(),
  numeroOS: z.string().min(1, "OS obrigatória para instalação").trim(),
  observacao: z.string().optional(),
  realizadoEm: z.coerce.date(),
  ehExcecao: z.boolean().default(false),
  justificativa: z.string().optional(),
}).superRefine(excecaoRefine);

export const retiradaTueEstoqueSchema = z.object({
  equipamentoId: z.string().cuid(),
  localizacaoId: z.string().cuid("Localização de destino obrigatória"),
  numeroOS: z.string().min(1, "OS obrigatória").trim(),
  observacao: z.string().optional(),
  realizadoEm: z.coerce.date(),
  ehExcecao: z.boolean().default(false),
  justificativa: z.string().optional(),
}).superRefine(excecaoRefine);

export const retiradaTueReparoSchema = z.object({
  equipamentoId: z.string().cuid(),
  numeroOS: z.string().min(1, "OS obrigatória").trim(),
  motivoReparo: z.string().min(1, "Motivo do reparo obrigatório").trim(),
  observacao: z.string().optional(),
  realizadoEm: z.coerce.date(),
  ehExcecao: z.boolean().default(false),
  justificativa: z.string().optional(),
}).superRefine(excecaoRefine);

export const transferenciaTueSchema = z.object({
  equipamentoId: z.string().cuid(),
  tueDestinoId: z.string().cuid("TUE destino obrigatório"),
  carro: z.enum(CARROS_VALIDOS, { errorMap: () => ({ message: "Carro obrigatório (MA, MB, RA ou RB)" }) }),
  posicaoInstalada: z.string().min(1, "Posição obrigatória").max(100).trim(),
  numeroOS: z.string().min(1, "OS obrigatória").trim(),
  observacao: z.string().optional(),
  realizadoEm: z.coerce.date(),
  ehExcecao: z.boolean().default(false),
  justificativa: z.string().optional(),
}).superRefine(excecaoRefine);

export const envioReparoSchema = z.object({
  equipamentoId: z.string().cuid(),
  oficinaId: z.string().cuid("Oficina obrigatória"),
  motivoReparo: z.string().min(1, "Motivo do reparo obrigatório").trim(),
  observacao: z.string().optional(),
  realizadoEm: z.coerce.date(),
  ehExcecao: z.boolean().default(false),
  justificativa: z.string().optional(),
}).superRefine(excecaoRefine);

export const retornoReparoEstoqueSchema = z.object({
  equipamentoId: z.string().cuid(),
  localizacaoId: z.string().cuid("Localização de destino obrigatória"),
  observacao: z.string().optional(),
  realizadoEm: z.coerce.date(),
  ehExcecao: z.boolean().default(false),
  justificativa: z.string().optional(),
}).superRefine(excecaoRefine);

export const retornoReparoInstalacaoSchema = z.object({
  equipamentoId: z.string().cuid(),
  tueId: z.string().cuid("TUE obrigatório"),
  carro: z.enum(CARROS_VALIDOS, { errorMap: () => ({ message: "Carro obrigatório (MA, MB, RA ou RB)" }) }),
  posicaoInstalada: z.string().min(1, "Posição obrigatória").max(100).trim(),
  observacao: z.string().optional(),
  realizadoEm: z.coerce.date(),
  ehExcecao: z.boolean().default(false),
  justificativa: z.string().optional(),
}).superRefine(excecaoRefine);

export const baixaSucataSchema = z.object({
  equipamentoId: z.string().cuid(),
  motivoSucata: z.string().min(1, "Motivo da baixa obrigatório").trim(),
  observacao: z.string().optional(),
  realizadoEm: z.coerce.date(),
  ehExcecao: z.boolean().default(false),
  justificativa: z.string().optional(),
}).superRefine(excecaoRefine);

export { isTUENumeroValido };
