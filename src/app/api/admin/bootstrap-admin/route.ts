import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "admin@trensurb.com";
const ADMIN_PASSWORD = "ADMIN";

export async function POST(request: NextRequest) {
  const token = process.env.ADMIN_BOOTSTRAP_TOKEN;
  const providedToken = request.headers.get("x-bootstrap-token");

  if (!token || providedToken !== token) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const senhaHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.usuario.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      nome: "Administrador",
      senhaHash,
      perfil: "ADMIN",
      ativo: true,
    },
    create: {
      nome: "Administrador",
      email: ADMIN_EMAIL,
      senhaHash,
      perfil: "ADMIN",
      ativo: true,
    },
  });

  return NextResponse.json({
    success: true,
    credentials: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });
}
