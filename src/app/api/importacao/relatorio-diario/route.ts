import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validarOrigem } from "@/domain/equipment/state-machine";

type RowResult = { linha: number; status: "ok" | "erro"; mensagem?: string; dados?: string };

const TIPOS_CONSUMIVEL = ["ENTRADA", "SAIDA", "AJUSTE_POSITIVO", "AJUSTE_NEGATIVO"];
const TIPOS_EQUIPAMENTO = [
  "ENTRADA_ESTOQUE", "INSTALACAO_TUE", "RETIRADA_TUE_ESTOQUE", "RETIRADA_TUE_REPARO",
  "ENVIO_REPARO", "RETORNO_REPARO_ESTOQUE", "RETORNO_REPARO_INSTALACAO",
  "TRANSFERENCIA_TUE", "TRANSFERENCIA_LOCALIZACAO", "BAIXA_SUCATA", "REGULARIZACAO",
];

function parseDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "number") {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return new Date(d.y, d.m - 1, d.d);
  }
  if (typeof val === "string") {
    // DD/MM/AAAA
    const m = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function str(val: unknown): string {
  return val == null ? "" : String(val).trim();
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "NÃ£o autenticado" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Arquivo nÃ£o enviado" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer", cellDates: true });

  const resultadosConsumiveis: RowResult[] = [];
  const resultadosEquipamentos: RowResult[] = [];

  // â”€â”€ Aba ConsumÃ­veis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const wsC = wb.Sheets["ConsumÃ­veis"] ?? wb.Sheets["Consumiveis"];
  if (wsC) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wsC, { defval: "" });
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const linha = i + 2;
      const data = parseDate(r["Data (DD/MM/AAAA)"] ?? r["Data"]);
      const codigoMaterial = str(r["CÃ³digo Material"]);
      const tipo = str(r["Tipo"]).toUpperCase();
      const qtd = parseFloat(str(r["Quantidade"]) || "0");
      const numeroOS = str(r["NÂº OS"]) || null;
      const numeroChamado = str(r["NÂº Chamado"]) || null;
      const codigoAtividade = str(r["CÃ³digo Atividade"]) || null;
      const observacao = str(r["ObservaÃ§Ã£o"]) || null;

      if (!codigoMaterial && !tipo) continue; // linha em branco

      if (!data) { resultadosConsumiveis.push({ linha, status: "erro", mensagem: "Data invÃ¡lida", dados: codigoMaterial }); continue; }
      if (!codigoMaterial) { resultadosConsumiveis.push({ linha, status: "erro", mensagem: "CÃ³digo do material obrigatÃ³rio", dados: "" }); continue; }
      if (!TIPOS_CONSUMIVEL.includes(tipo)) { resultadosConsumiveis.push({ linha, status: "erro", mensagem: `Tipo invÃ¡lido: ${tipo}`, dados: codigoMaterial }); continue; }
      if (isNaN(qtd) || qtd <= 0) { resultadosConsumiveis.push({ linha, status: "erro", mensagem: "Quantidade invÃ¡lida", dados: codigoMaterial }); continue; }

      const material = await prisma.material.findUnique({ where: { codigoTrensurb: codigoMaterial } });
      if (!material) { resultadosConsumiveis.push({ linha, status: "erro", mensagem: `Material nÃ£o encontrado: ${codigoMaterial}`, dados: codigoMaterial }); continue; }

      const atividade = codigoAtividade ? await prisma.atividade.findUnique({ where: { codigo: codigoAtividade } }) : null;

      // Verificar estoque negativo para saÃ­das
      if (tipo === "SAIDA" || tipo === "AJUSTE_NEGATIVO") {
        const novaQtd = material.quantidadeAtual - qtd;
        if (novaQtd < 0) {
          resultadosConsumiveis.push({ linha, status: "erro", mensagem: `Estoque insuficiente: atual=${material.quantidadeAtual}, solicitado=${qtd}`, dados: codigoMaterial });
          continue;
        }
      }

      try {
        await prisma.$transaction(async (tx) => {
          const delta = (tipo === "ENTRADA" || tipo === "AJUSTE_POSITIVO") ? qtd : -qtd;
          await tx.material.update({ where: { id: material.id }, data: { quantidadeAtual: { increment: delta } } });
          await tx.movimentacaoConsumivel.create({
            data: {
              materialId: material.id,
              tipo,
              quantidade: qtd,
              numeroOS,
              numeroChamado,
              atividadeId: atividade?.id ?? null,
              observacao,
              ehExcecao: false,
              realizadoPor: userId,
              realizadoEm: data,
            },
          });
        });
        resultadosConsumiveis.push({ linha, status: "ok", dados: codigoMaterial });
      } catch {
        resultadosConsumiveis.push({ linha, status: "erro", mensagem: "Erro ao salvar", dados: codigoMaterial });
      }
    }
  }

  // â”€â”€ Aba Equipamentos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const wsE = wb.Sheets["Equipamentos"];
  if (wsE) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wsE, { defval: "" });
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const linha = i + 2;
      const data = parseDate(r["Data (DD/MM/AAAA)"] ?? r["Data"]);
      const numeroSerie = str(r["NÂº SÃ©rie"]);
      const tipo = str(r["MovimentaÃ§Ã£o"]).toUpperCase();
      const tueNumero = str(r["TUE Destino"]) || null;
      const posicaoCodigo = str(r["PosiÃ§Ã£o"]) || null;
      const funcaoCodigo = str(r["FunÃ§Ã£o"]) || null;
      const localizacaoCodigo = str(r["LocalizaÃ§Ã£o"]) || null;
      const numeroOS = str(r["NÂº OS"]) || null;
      const motivoReparo = str(r["Motivo Reparo"]) || null;
      const observacao = str(r["ObservaÃ§Ã£o"]) || null;

      if (!numeroSerie && !tipo) continue;

      if (!data) { resultadosEquipamentos.push({ linha, status: "erro", mensagem: "Data invÃ¡lida", dados: numeroSerie }); continue; }
      if (!numeroSerie) { resultadosEquipamentos.push({ linha, status: "erro", mensagem: "NÂº de sÃ©rie obrigatÃ³rio", dados: "" }); continue; }
      if (!TIPOS_EQUIPAMENTO.includes(tipo)) { resultadosEquipamentos.push({ linha, status: "erro", mensagem: `Tipo invÃ¡lido: ${tipo}`, dados: numeroSerie }); continue; }

      const equip = await prisma.equipamento.findUnique({ where: { numeroSerie } });
      if (!equip) { resultadosEquipamentos.push({ linha, status: "erro", mensagem: `Equipamento nÃ£o encontrado: ${numeroSerie}`, dados: numeroSerie }); continue; }

      const validacao = validarOrigem(tipo as never, equip.status as never);
      if (!validacao.valido) {
        resultadosEquipamentos.push({ linha, status: "erro", mensagem: `Status atual (${equip.status}) invÃ¡lido para ${tipo}`, dados: numeroSerie });
        continue;
      }

      const tue = tueNumero ? await prisma.tUE.findUnique({ where: { numero: tueNumero } }) : null;
      const posicao = posicaoCodigo ? await prisma.posicao.findUnique({ where: { codigo: posicaoCodigo } }) : null;
      const funcao = funcaoCodigo ? await prisma.funcao.findUnique({ where: { codigo: funcaoCodigo } }) : null;
      const localizacao = localizacaoCodigo ? await prisma.localizacao.findUnique({ where: { codigo: localizacaoCodigo } }) : null;

      // Determine new status
      const STATUS_MAP: Record<string, string> = {
        ENTRADA_ESTOQUE: "EM_ESTOQUE",
        INSTALACAO_TUE: "INSTALADO_TUE",
        RETIRADA_TUE_ESTOQUE: "EM_ESTOQUE",
        RETIRADA_TUE_REPARO: "AGUARDANDO_REPARO",
        ENVIO_REPARO: "EM_REPARO",
        RETORNO_REPARO_ESTOQUE: "EM_ESTOQUE",
        RETORNO_REPARO_INSTALACAO: "INSTALADO_TUE",
        TRANSFERENCIA_TUE: "INSTALADO_TUE",
        TRANSFERENCIA_LOCALIZACAO: "EM_ESTOQUE",
        BAIXA_SUCATA: "SUCATA",
        REGULARIZACAO: equip.status,
      };
      const novoStatus = STATUS_MAP[tipo] ?? equip.status;

      const updateData: Record<string, unknown> = { status: novoStatus };
      if (tipo === "INSTALACAO_TUE" || tipo === "TRANSFERENCIA_TUE" || tipo === "RETORNO_REPARO_INSTALACAO") {
        updateData.tueId = tue?.id ?? null;
        updateData.posicaoId = posicao?.id ?? null;
        updateData.funcaoId = funcao?.id ?? null;
        updateData.localizacaoId = null;
      } else if (tipo === "RETIRADA_TUE_ESTOQUE" || tipo === "RETORNO_REPARO_ESTOQUE" || tipo === "ENTRADA_ESTOQUE" || tipo === "TRANSFERENCIA_LOCALIZACAO") {
        updateData.tueId = null;
        updateData.posicaoId = null;
        updateData.funcaoId = null;
        updateData.localizacaoId = localizacao?.id ?? null;
      } else if (tipo === "RETIRADA_TUE_REPARO" || tipo === "ENVIO_REPARO") {
        updateData.tueId = null;
        updateData.posicaoId = null;
        updateData.funcaoId = null;
        updateData.localizacaoId = null;
      } else if (tipo === "BAIXA_SUCATA") {
        updateData.tueId = null;
        updateData.posicaoId = null;
        updateData.funcaoId = null;
        updateData.localizacaoId = null;
      }

      try {
        await prisma.$transaction(async (tx) => {
          await tx.equipamento.update({ where: { id: equip.id }, data: updateData });
          await tx.movimentacaoEquipamento.create({
            data: {
              equipamentoId: equip.id,
              tipo,
              statusAnterior: equip.status,
              statusNovo: novoStatus,
              tueId: tue?.id ?? null,
              posicaoId: posicao?.id ?? null,
              funcaoId: funcao?.id ?? null,
              localizacaoId: localizacao?.id ?? null,
              numeroOS,
              motivoReparo,
              observacao,
              ehExcecao: false,
              realizadoPor: userId,
              realizadoEm: data,
            },
          });
        });
        resultadosEquipamentos.push({ linha, status: "ok", dados: numeroSerie });
      } catch {
        resultadosEquipamentos.push({ linha, status: "erro", mensagem: "Erro ao salvar", dados: numeroSerie });
      }
    }
  }

  return NextResponse.json({ consumiveis: resultadosConsumiveis, equipamentos: resultadosEquipamentos });
}




