"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { criarUsuarioSchema } from "@/domain/user/validations";
import { prisma } from "@/lib/prisma";
import { requireSession, type SessionUser } from "@/lib/session";

export type UsuarioActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

function fromFormData(data: unknown) {
  if (!(data instanceof FormData)) return data;
  const ativo = data.get("ativo");

  return {
    nome: data.get("nome"),
    email: data.get("email"),
    senha: data.get("senha"),
    confirmarSenha: data.get("confirmarSenha"),
    perfil: data.get("perfil"),
    ativo: ativo === "true" || ativo === "on" || ativo === "1",
  };
}

export async function criarUsuarioAction(data: unknown): Promise<UsuarioActionResult<{ id: string }>> {
  let session: SessionUser;
  try {
    session = await requireSession();
  } catch {
    return { success: false, error: "Nao autenticado" };
  }

  if (session.perfil !== "ADMIN") {
    return { success: false, error: "Apenas administradores podem cadastrar usuarios" };
  }

  const parsed = criarUsuarioSchema.safeParse(fromFormData(data));
  if (!parsed.success) {
    return {
      success: false,
      error: "Dados invalidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const input = parsed.data;
  const email = input.email.trim().toLowerCase();
  const nome = input.nome.trim();

  const existente = await prisma.usuario.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existente) {
    return {
      success: false,
      error: "Ja existe um usuario cadastrado com este e-mail",
      fieldErrors: { email: ["Ja existe um usuario cadastrado com este e-mail"] },
    };
  }

  try {
    const senhaHash = await bcrypt.hash(input.senha, 10);
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash,
        perfil: input.perfil,
        ativo: input.ativo,
      },
      select: { id: true },
    });

    revalidatePath("/cadastros/usuarios");
    return { success: true, data: { id: usuario.id } };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        error: "Ja existe um usuario cadastrado com este e-mail",
        fieldErrors: { email: ["Ja existe um usuario cadastrado com este e-mail"] },
      };
    }
    return { success: false, error: "Erro ao cadastrar usuario" };
  }
}
