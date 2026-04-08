import { NextRequest, NextResponse } from "next/server";
import { buscarMaterialPorId } from "@/repositories/material.repository";
import { atualizarMaterialAction } from "@/actions/material.actions";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const mat = await buscarMaterialPorId(params.id);
  if (!mat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mat);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const result = await atualizarMaterialAction(params.id, data);
  return NextResponse.json(result);
}
