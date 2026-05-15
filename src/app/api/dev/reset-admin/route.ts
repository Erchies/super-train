import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Disponivel apenas em desenvolvimento" }, { status: 404 });
  }

  const senhaHash = await bcrypt.hash("ADMIN", 10);
  await prisma.usuario.upsert({
    where: { email: "admin@trensurb.com" },
    update: {
      nome: "Administrador",
      senhaHash,
      perfil: "ADMIN",
      ativo: true,
    },
    create: {
      nome: "Administrador",
      email: "admin@trensurb.com",
      senhaHash,
      perfil: "ADMIN",
      ativo: true,
    },
  });

  return NextResponse.json({
    success: true,
    credentials: {
      email: "admin@trensurb.com",
      password: "ADMIN",
    },
  });
}
