import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "referencias-serie");
const LOCAL_PUBLIC_BASE = "/uploads/referencias-serie";
const SUPABASE_BUCKET = process.env.SUPABASE_REFERENCIAS_BUCKET || "referencias-serie";

type StoredFile = {
  imagemUrl: string;
  storageProvider: "local" | "supabase";
  storageKey: string;
};

function canManage(perfil: string) {
  return perfil === "ADMIN" || perfil === "SUPERVISOR";
}

function sanitizeNomeEquipamento(value: string | null) {
  return String(value ?? "").trim();
}

function extensionFromFile(file: File) {
  return path.extname(file.name).toLowerCase();
}

function validateImage(file: File) {
  const ext = extensionFromFile(file);
  if (!ALLOWED_MIME_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.has(ext)) {
    return "Formato inválido. Envie uma imagem JPG, JPEG, PNG ou WEBP.";
  }
  if (file.size <= 0) return "Arquivo vazio.";
  if (file.size > MAX_FILE_SIZE) return "Imagem muito grande. O limite é 5 MB.";
  return null;
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

async function storeLocal(file: File, storageKey: string): Promise<StoredFile> {
  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(LOCAL_UPLOAD_DIR, storageKey), bytes, { flag: "wx" });
  return {
    imagemUrl: `${LOCAL_PUBLIC_BASE}/${storageKey}`,
    storageProvider: "local",
    storageKey,
  };
}

async function storeSupabase(file: File, storageKey: string, config: { url: string; key: string }): Promise<StoredFile> {
  const body = Buffer.from(await file.arrayBuffer());
  const uploadUrl = `${config.url}/storage/v1/object/${SUPABASE_BUCKET}/${storageKey}`;
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": file.type,
      "x-upsert": "false",
    },
    body,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Erro ao enviar imagem para o Supabase Storage. ${detail}`);
  }

  return {
    imagemUrl: `${config.url}/storage/v1/object/public/${SUPABASE_BUCKET}/${storageKey}`,
    storageProvider: "supabase",
    storageKey,
  };
}

async function deleteStoredFile(provider: string, storageKey: string) {
  if (!storageKey) return;

  if (provider === "supabase") {
    const config = getSupabaseConfig();
    if (!config) return;
    await fetch(`${config.url}/storage/v1/object/${SUPABASE_BUCKET}`, {
      method: "DELETE",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: [storageKey] }),
    }).catch(() => {});
    return;
  }

  const basename = path.basename(storageKey);
  await unlink(path.join(LOCAL_UPLOAD_DIR, basename)).catch(() => {});
}

async function resolveNomeEquipamento(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const nome = sanitizeNomeEquipamento(searchParams.get("nomeEquipamento"));
  if (nome) return nome;

  const equipamentoId = searchParams.get("equipamentoId");
  if (!equipamentoId) return "";
  const equipamento = await prisma.equipamento.findUnique({
    where: { id: equipamentoId },
    select: { descricao: true },
  });
  return sanitizeNomeEquipamento(equipamento?.descricao ?? "");
}

export async function GET(request: NextRequest) {
  await requireSession();
  const nomeEquipamento = await resolveNomeEquipamento(request);
  if (!nomeEquipamento) return NextResponse.json({ referencia: null });

  const referencia = await prisma.equipamentoReferenciaSerie.findUnique({
    where: { nomeEquipamento },
  });

  return NextResponse.json({ referencia });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!canManage(session.perfil)) {
    return NextResponse.json({ success: false, error: "Sem permissão" }, { status: 403 });
  }

  const formData = await request.formData();
  const nomeEquipamento = sanitizeNomeEquipamento(String(formData.get("nomeEquipamento") ?? ""));
  const file = formData.get("file");

  if (!nomeEquipamento) {
    return NextResponse.json({ success: false, error: "Nome do equipamento é obrigatório" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "Imagem não enviada" }, { status: 400 });
  }

  const validationError = validateImage(file);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 400 });
  }

  const ext = extensionFromFile(file);
  const storageKey = `${randomUUID()}${ext}`;
  const old = await prisma.equipamentoReferenciaSerie.findUnique({ where: { nomeEquipamento } });
  const config = getSupabaseConfig();
  const stored = config ? await storeSupabase(file, storageKey, config) : await storeLocal(file, storageKey);

  const referencia = await prisma.equipamentoReferenciaSerie.upsert({
    where: { nomeEquipamento },
    update: {
      imagemUrl: stored.imagemUrl,
      storageProvider: stored.storageProvider,
      storageKey: stored.storageKey,
      nomeOriginal: file.name,
      mimeType: file.type,
      tamanhoBytes: file.size,
    },
    create: {
      nomeEquipamento,
      imagemUrl: stored.imagemUrl,
      storageProvider: stored.storageProvider,
      storageKey: stored.storageKey,
      nomeOriginal: file.name,
      mimeType: file.type,
      tamanhoBytes: file.size,
    },
  });

  if (old) await deleteStoredFile(old.storageProvider, old.storageKey);
  return NextResponse.json({ success: true, referencia });
}

export async function DELETE(request: NextRequest) {
  const session = await requireSession();
  if (!canManage(session.perfil)) {
    return NextResponse.json({ success: false, error: "Sem permissão" }, { status: 403 });
  }

  const nomeEquipamento = await resolveNomeEquipamento(request);
  if (!nomeEquipamento) {
    return NextResponse.json({ success: false, error: "Nome do equipamento é obrigatório" }, { status: 400 });
  }

  const referencia = await prisma.equipamentoReferenciaSerie.findUnique({ where: { nomeEquipamento } });
  if (!referencia) return NextResponse.json({ success: true });

  await prisma.equipamentoReferenciaSerie.delete({ where: { nomeEquipamento } });
  await deleteStoredFile(referencia.storageProvider, referencia.storageKey);

  return NextResponse.json({ success: true });
}
