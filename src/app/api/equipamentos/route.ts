import { NextRequest, NextResponse } from 'next/server';
import { listarEquipamentos } from '@/repositories/equipamento.repository';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const equipamentos = await listarEquipamentos({ status: status ?? undefined });

    return NextResponse.json(equipamentos);
  } catch (error) {
    console.error('Erro ao listar equipamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar equipamentos' },
      { status: 500 }
    );
  }
}

