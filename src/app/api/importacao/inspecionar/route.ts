import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer" });

  const resultado: Record<string, unknown> = {};

  for (const nomAba of wb.SheetNames) {
    const ws = wb.Sheets[nomAba];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
    if (rows.length === 0) { resultado[nomAba] = { colunas: [], linhas: [] }; continue; }

    // Mostra colunas com tipo e valor das 2 primeiras linhas
    const linhas = rows.slice(0, 2).map((r) =>
      Object.fromEntries(
        Object.entries(r).map(([k, v]) => [k, { valor: v, tipo: typeof v }])
      )
    );
    resultado[nomAba] = { colunas: Object.keys(rows[0]), linhas };
  }

  return NextResponse.json(resultado);
}
