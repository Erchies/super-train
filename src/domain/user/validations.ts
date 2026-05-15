import { z } from "zod";

export const PERFIS_USUARIO = ["OPERADOR", "SUPERVISOR", "ADMIN"] as const;

export const criarUsuarioSchema = z
  .object({
    nome: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().trim().email("E-mail invalido"),
    senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme a senha"),
    perfil: z.enum(PERFIS_USUARIO, {
      errorMap: () => ({ message: "Perfil invalido" }),
    }),
    ativo: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.senha !== data.confirmarSenha) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmarSenha"],
        message: "As senhas devem ser iguais",
      });
    }
  });

export type CriarUsuarioInput = z.infer<typeof criarUsuarioSchema>;
export type PerfilUsuario = (typeof PERFIS_USUARIO)[number];
