import { NextRequest, NextResponse } from 'next/server';
import { listarMateriais } from '@/repositories/material.repository';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') ?? '';
    const materiais = await listarMateriais({ busca: q || undefined });

    return NextResponse.json(materiais);
  } catch (error) {
    console.error('Erro ao listar materiais:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar materiais' },
      { status: 500 }
    );
  }
}

