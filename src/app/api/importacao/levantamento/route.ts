import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SISTEMAS_EQUIPAMENTO } from "@/lib/catalogos";

type RowResult = { linha: number; status: "criado" | "atualizado" | "erro"; mensagem?: string; dados?: string };

const COMPATIBILIDADES = ["SERIE_100", "SERIE_200", "AMBAS"];
const STATUS_VALIDOS = ["EM_ESTOQUE", "INSTALADO_TUE", "AGUARDANDO_REPARO", "EM_REPARO", "SUCATA"];
const SISTEMAS_VALIDOS = [...SISTEMAS_EQUIPAMENTO];

function str(val: unknown): string {
  return val == null ? "" : String(val).trim();
}

// Converte nÃºmero brasileiro (vÃ­rgula decimal) ou nÃºmero normal para float
function parseNum(val: unknown): number {
  if (val == null || val === "") return 0;
  if (typeof val === "number") return val;
  const s = String(val).trim().replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// Tenta mÃºltiplas variaÃ§Ãµes do nome da coluna (case-insensitive)
function col(r: Record<string, unknown>, ...nomes: string[]): unknown {
  // Exact match first
  for (const nome of nomes) {
    if (r[nome] !== undefined && r[nome] !== "" && r[nome] !== null) return r[nome];
  }
  // Case-insensitive fallback
  const keys = Object.keys(r);
  for (const nome of nomes) {
    const key = keys.find((k) => k.trim().toLowerCase() === nome.toLowerCase());
    if (key && r[key] !== undefined && r[key] !== "" && r[key] !== null) return r[key];
  }
  return undefined;
}

function gerarCodigoPendente(prefixo: string, linha: number): string {
  const ts = Date.now().toString(36).toUpperCase();
  return `${prefixo}-PEND-${ts}-L${linha}`;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "NÃ£o autenticado" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const perfil = (session.user as { perfil?: string }).perfil ?? "OPERADOR";
  const isAdmin = perfil === "ADMIN";

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Arquivo nÃ£o enviado" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer" });

  const resultadosMateriais: RowResult[] = [];
  const resultadosEquipamentos: RowResult[] = [];

  // â”€â”€ Aba Materiais â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const wsM = wb.Sheets["Materiais"];
  if (wsM) {
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(wsM, { defval: "" });
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const linha = i + 2;
      let codigo = str(col(r, "CÃ³digo Trensurb", "Codigo Trensurb", "CÃ³digo", "Codigo", "codigo_trensurb", "cod_trensurb", "COD"));
      const descricao = str(col(r, "DescriÃ§Ã£o", "Descricao", "DESCRIÃ‡ÃƒO", "DESCRICAO", "descricao", "Nome", "NOME"));
      const unidade = str(col(r, "Unidade", "UNIDADE", "Un", "UN", "unidade", "Unid"));
      const qtdAtualRaw = col(r, "Qtd Atual", "Quantidade", "Qtd", "QTD", "Qtd. Atual", "Quantidade Atual", "quantidade_atual", "qtd_atual", "QUANTIDADE", "Estoque Atual", "Saldo");
      const qtdAtual = parseNum(qtdAtualRaw);
      const estoqueMinimo = parseNum(col(r, "Estoque MÃ­nimo", "Estoque Minimo", "Est. MÃ­nimo", "Est Minimo", "Min", "MÃ­nimo", "estoque_minimo"));
      const locCodigo = str(col(r, "CÃ³digo LocalizaÃ§Ã£o", "Codigo Localizacao", "LocalizaÃ§Ã£o", "Localizacao", "Local", "LOCAL", "localizacao")) || null;
      const observacao = str(col(r, "ObservaÃ§Ã£o", "Observacao", "Obs", "OBS", "observacao")) || null;

      if (!codigo && !descricao) continue;

      if (!descricao) { resultadosMateriais.push({ linha, status: "erro", mensagem: "DescriÃ§Ã£o obrigatÃ³ria", dados: codigo || "(sem cÃ³digo)" }); continue; }
      if (!unidade) { resultadosMateriais.push({ linha, status: "erro", mensagem: "Unidade obrigatÃ³ria", dados: codigo || descricao }); continue; }

      const localizacao = locCodigo ? await prisma.localizacao.findUnique({ where: { codigo: locCodigo } }) : null;

      if (locCodigo && !localizacao) {
        resultadosMateriais.push({ linha, status: "erro", mensagem: `LocalizaÃ§Ã£o nÃ£o encontrada: ${locCodigo}`, dados: codigo || descricao });
        continue;
      }

      // Busca existente: primeiro por cÃ³digo, depois por descriÃ§Ã£o (quando cÃ³digo estÃ¡ vazio)
      let existente = codigo ? await prisma.material.findFirst({ where: { codigoTrensurb: codigo } }) : null;

      if (!existente && descricao) {
        existente = await prisma.material.findFirst({ where: { descricao } });
      }

      // Se ainda nÃ£o existe e nÃ£o tem cÃ³digo, gera provisÃ³rio (sÃ³ admin)
      if (!existente && !codigo) {
        if (!isAdmin) {
          resultadosMateriais.push({ linha, status: "erro", mensagem: "CÃ³digo Trensurb obrigatÃ³rio (somente ADMIN pode importar sem cÃ³digo)" });
          continue;
        }
        codigo = gerarCodigoPendente("MAT", linha);
      }

      try {
        if (existente) {
          const delta = qtdAtual - existente.quantidadeAtual;
          await prisma.$transaction(async (tx) => {
            await tx.material.update({
              where: { id: existente.id },
              data: { descricao, unidade, estoqueMinimo, quantidadeAtual: qtdAtual, localizacaoId: localizacao?.id ?? existente.localizacaoId, observacao },
            });
            if (delta !== 0) {
              await tx.movimentacaoConsumivel.create({
                data: {
                  materialId: existente.id,
                  tipo: delta > 0 ? "AJUSTE_POSITIVO" : "AJUSTE_NEGATIVO",
                  quantidade: Math.abs(delta),
                  observacao: "Ajuste via levantamento de estoque",
                  ehExcecao: false,
                  realizadoPor: userId,
                  realizadoEm: new Date(),
                },
              });
            }
          });
          resultadosMateriais.push({ linha, status: "atualizado", dados: `${existente.codigoTrensurb} qtd:${qtdAtual}` });
        } else {
          await prisma.$transaction(async (tx) => {
            const mat = await tx.material.create({
              data: { codigoTrensurb: codigo, descricao, unidade, estoqueMinimo, quantidadeAtual: qtdAtual, localizacaoId: localizacao?.id ?? null, observacao },
            });
            if (qtdAtual > 0) {
              await tx.movimentacaoConsumivel.create({
                data: {
                  materialId: mat.id,
                  tipo: "ENTRADA",
                  quantidade: qtdAtual,
                  observacao: "Entrada via levantamento inicial",
                  ehExcecao: false,
                  realizadoPor: userId,
                  realizadoEm: new Date(),
                },
              });
            }
          });
          resultadosMateriais.push({ linha, status: "criado", dados: `${codigo} qtd:${qtdAtual}` });
        }
      } catch (e) {
        resultadosMateriais.push({ linha, status: "erro", mensagem: String(e), dados: codigo });
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
      const numeroSerie = str(col(r, "NÂº SÃ©rie", "Numero Serie", "NÂº Serie", "N Serie", "numero_serie", "NÂ° SÃ©rie", "NÂ°Serie", "NS", "Serial"));
      let codigoTrensurb = str(col(r, "CÃ³digo Trensurb", "Codigo Trensurb", "CÃ³digo", "Codigo", "cod_trensurb", "COD"));
      const descricao = str(col(r, "DescriÃ§Ã£o", "Descricao", "DESCRIÃ‡ÃƒO", "DESCRICAO", "Nome", "NOME"));
      const sistema = (str(col(r, "Sistema", "SISTEMA", "sistema")) || "OUTROS").toUpperCase();
      const compatibilidade = str(col(r, "Compatibilidade", "COMPATIBILIDADE", "Serie", "SÃ©rie", "serie")).toUpperCase();
      const status = str(col(r, "Status", "STATUS", "Estado", "ESTADO", "SituaÃ§Ã£o", "Situacao")).toUpperCase();
      const locCodigo = str(col(r, "CÃ³digo LocalizaÃ§Ã£o", "Codigo Localizacao", "LocalizaÃ§Ã£o", "Localizacao", "Local", "LOCAL")) || null;
      const tueNumero = str(col(r, "NÂº TUE", "TUE", "Numero TUE", "N TUE", "tue")) || null;
      const posicaoCodigo = str(col(r, "PosiÃ§Ã£o", "Posicao", "POSIÃ‡ÃƒO", "Pos", "POS")) || null;
      const funcaoCodigo = str(col(r, "FunÃ§Ã£o", "Funcao", "FUNÃ‡ÃƒO", "Func", "FUNC")) || null;
      const observacao = str(col(r, "ObservaÃ§Ã£o", "Observacao", "Obs", "OBS")) || null;

      if (!numeroSerie && !codigoTrensurb) continue;

      if (!numeroSerie) { resultadosEquipamentos.push({ linha, status: "erro", mensagem: "NÂº SÃ©rie obrigatÃ³rio" }); continue; }

      if (!descricao) { resultadosEquipamentos.push({ linha, status: "erro", mensagem: "DescriÃ§Ã£o obrigatÃ³ria", dados: numeroSerie }); continue; }
      if (!(SISTEMAS_VALIDOS as readonly string[]).includes(sistema)) { resultadosEquipamentos.push({ linha, status: "erro", mensagem: `Sistema invÃ¡lido: ${sistema}`, dados: numeroSerie }); continue; }
      if (!COMPATIBILIDADES.includes(compatibilidade)) { resultadosEquipamentos.push({ linha, status: "erro", mensagem: `Compatibilidade invÃ¡lida: ${compatibilidade}`, dados: numeroSerie }); continue; }
      if (!STATUS_VALIDOS.includes(status)) { resultadosEquipamentos.push({ linha, status: "erro", mensagem: `Status invÃ¡lido: ${status}`, dados: numeroSerie }); continue; }

      const localizacao = locCodigo ? await prisma.localizacao.findUnique({ where: { codigo: locCodigo } }) : null;
      const tue = tueNumero ? await prisma.tUE.findUnique({ where: { numero: tueNumero } }) : null;
      const posicao = posicaoCodigo ? await prisma.posicao.findUnique({ where: { codigo: posicaoCodigo } }) : null;
      const funcao = funcaoCodigo ? await prisma.funcao.findUnique({ where: { codigo: funcaoCodigo } }) : null;

      if (locCodigo && !localizacao) { resultadosEquipamentos.push({ linha, status: "erro", mensagem: `LocalizaÃ§Ã£o nÃ£o encontrada: ${locCodigo}`, dados: numeroSerie }); continue; }
      if (tueNumero && !tue) { resultadosEquipamentos.push({ linha, status: "erro", mensagem: `TUE nÃ£o encontrado: ${tueNumero}`, dados: numeroSerie }); continue; }

      // Busca existente por nÃºmero de sÃ©rie
      const existente = await prisma.equipamento.findFirst({ where: { numeroSerie } });

      // Se nÃ£o tem cÃ³digo, gera provisÃ³rio (sÃ³ admin)
      if (!codigoTrensurb) {
        if (!isAdmin) {
          resultadosEquipamentos.push({ linha, status: "erro", mensagem: "CÃ³digo Trensurb obrigatÃ³rio (somente ADMIN pode importar sem cÃ³digo)", dados: numeroSerie });
          continue;
        }
        codigoTrensurb = existente?.codigoTrensurb || gerarCodigoPendente("EQ", linha);
      }

      try {
        if (existente) {
          await prisma.$transaction(async (tx) => {
            await tx.equipamento.update({
              where: { id: existente.id },
              data: { codigoTrensurb, descricao, sistema, compatibilidade, status, localizacaoId: localizacao?.id ?? null, tueId: tue?.id ?? null, posicaoId: posicao?.id ?? null, funcaoId: funcao?.id ?? null, observacao },
            });
            await tx.movimentacaoEquipamento.create({
              data: {
                equipamentoId: existente.id,
                tipo: "REGULARIZACAO",
                statusAnterior: existente.status,
                statusNovo: status,
                localizacaoId: localizacao?.id ?? null,
                tueId: tue?.id ?? null,
                posicaoId: posicao?.id ?? null,
                funcaoId: funcao?.id ?? null,
                observacao: "AtualizaÃ§Ã£o via levantamento de estoque",
                ehExcecao: false,
                realizadoPor: userId,
                realizadoEm: new Date(),
              },
            });
          });
          resultadosEquipamentos.push({ linha, status: "atualizado", dados: numeroSerie });
        } else {
          await prisma.$transaction(async (tx) => {
            const eq = await tx.equipamento.create({
              data: { numeroSerie, codigoTrensurb, descricao, sistema, compatibilidade, status, localizacaoId: localizacao?.id ?? null, tueId: tue?.id ?? null, posicaoId: posicao?.id ?? null, funcaoId: funcao?.id ?? null, observacao },
            });
            await tx.movimentacaoEquipamento.create({
              data: {
                equipamentoId: eq.id,
                tipo: "ENTRADA_ESTOQUE",
                statusAnterior: null,
                statusNovo: status,
                localizacaoId: localizacao?.id ?? null,
                tueId: tue?.id ?? null,
                posicaoId: posicao?.id ?? null,
                funcaoId: funcao?.id ?? null,
                observacao: "Cadastro via levantamento inicial",
                ehExcecao: false,
                realizadoPor: userId,
                realizadoEm: new Date(),
              },
            });
          });
          resultadosEquipamentos.push({ linha, status: "criado", dados: codigoTrensurb });
        }
      } catch (e) {
        resultadosEquipamentos.push({ linha, status: "erro", mensagem: String(e), dados: numeroSerie });
      }
    }
  }

  return NextResponse.json({ materiais: resultadosMateriais, equipamentos: resultadosEquipamentos });
}



