import { NextResponse } from "next/server";
import { listarOficinas } from "@/repositories/cadastros.repository";

export async function GET() {
  const data = await listarOficinas();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const fd = await req.formData();
  const { criarOficinaAction } = await import("@/actions/cadastros.actions");
  const result = await criarOficinaAction(fd);
  return NextResponse.json(result);
}
