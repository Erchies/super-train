import { NextResponse } from "next/server";
import { listarTUEs } from "@/repositories/cadastros.repository";

export async function GET() {
  const data = await listarTUEs();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const fd = await req.formData();
  const { criarTUEAction } = await import("@/actions/cadastros.actions");
  const result = await criarTUEAction(fd);
  return NextResponse.json(result);
}
