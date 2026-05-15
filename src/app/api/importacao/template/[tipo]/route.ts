import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { LABELS_SISTEMA_EQUIPAMENTO, SISTEMAS_EQUIPAMENTO, UNIDADES_MEDIDA } from "@/lib/catalogos";

export async function GET(
  _req: NextRequest,
  { params }: { params: { tipo: string } }
) {
  const { tipo } = params;

  if (tipo === "relatorio-diario") {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Consumíveis
    const consumiveis = [
      ["Data (DD/MM/AAAA)", "Código Material", "Tipo", "Quantidade", "Nº OS", "Nº Chamado", "Código Atividade", "Observação"],
      ["15/04/2024", "MT-0001", "SAIDA", "5", "OS-2024-001", "", "MANUT-PREV", ""],
      ["15/04/2024", "MT-0002", "ENTRADA", "10", "", "", "", "Recebimento NF 123"],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(consumiveis);
    ws1["!cols"] = [{ wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Consumíveis");

    // Sheet 2: Equipamentos
    const equipamentos = [
      ["Data (DD/MM/AAAA)", "Nº Série", "Movimentação", "TUE Destino", "Posição", "Função", "Localização", "Nº OS", "Motivo Reparo", "Observação"],
      ["15/04/2024", "SN-001-2024", "INSTALACAO_TUE", "101", "CAR-A", "COMP-TRAC", "", "OS-2024-001", "", ""],
      ["15/04/2024", "SN-002-2024", "RETIRADA_TUE_REPARO", "", "", "", "", "", "Falha no inversor", ""],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(equipamentos);
    ws2["!cols"] = [{ wch: 18 }, { wch: 14 }, { wch: 24 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 24 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Equipamentos");

    // Sheet 3: Tipos válidos
    const tipos = [
      ["Tipos válidos para Consumíveis", "", "Tipos válidos para Equipamentos"],
      ["ENTRADA", "", "ENTRADA_ESTOQUE"],
      ["SAIDA", "", "INSTALACAO_TUE"],
      ["AJUSTE_POSITIVO", "", "RETIRADA_TUE_ESTOQUE"],
      ["AJUSTE_NEGATIVO", "", "RETIRADA_TUE_REPARO"],
      ["", "", "ENVIO_REPARO"],
      ["", "", "RETORNO_REPARO_ESTOQUE"],
      ["", "", "TRANSFERENCIA_TUE"],
      ["", "", "BAIXA_SUCATA"],
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(tipos);
    ws3["!cols"] = [{ wch: 28 }, { wch: 4 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Referência");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="template_relatorio_diario.xlsx"',
      },
    });
  }

  if (tipo === "levantamento") {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Materiais
    const materiais = [
      ["Código Trensurb", "Descrição", "Unidade", "Qtd Atual", "Estoque Mínimo", "Código Localização", "Observação"],
      ["MT-0001", "Parafuso M8x20 Inox", "UN", "150", "50", "PRAT-01", ""],
      ["MT-0002", "Fusível 10A", "UN", "30", "10", "PRAT-02", ""],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(materiais);
    ws1["!cols"] = [{ wch: 16 }, { wch: 32 }, { wch: 8 }, { wch: 10 }, { wch: 14 }, { wch: 18 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Materiais");

    // Sheet 2: Equipamentos
    const equipamentos = [
      ["Nº Série", "Código Trensurb", "Descrição", "Sistema", "Compatibilidade", "Status", "Código Localização", "Nº TUE", "Posição", "Função", "Observação"],
      ["SN-001-2024", "EQ-COMP-001", "Compressor de Tração", "TRACAO", "SERIE_100", "EM_ESTOQUE", "DEP-01", "", "", "", ""],
      ["SN-002-2024", "EQ-INV-001", "Inversor de Frequência", "TRACAO", "SERIE_200", "INSTALADO_TUE", "", "201", "CAR-A", "INV-TRAC", ""],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(equipamentos);
    ws2["!cols"] = [{ wch: 14 }, { wch: 16 }, { wch: 30 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Equipamentos");

    // Sheet 3: Referência
    const ref = [
      ["Unidades", "", "Sistemas", "", "Compatibilidade", "", "Status Equipamento"],
      ...Array.from({ length: Math.max(UNIDADES_MEDIDA.length, SISTEMAS_EQUIPAMENTO.length, 5) }).map((_, index) => [
        UNIDADES_MEDIDA[index] ?? "",
        "",
        SISTEMAS_EQUIPAMENTO[index] ? `${SISTEMAS_EQUIPAMENTO[index]} - ${LABELS_SISTEMA_EQUIPAMENTO[SISTEMAS_EQUIPAMENTO[index]]}` : "",
        "",
        ["SERIE_100", "SERIE_200", "AMBAS"][index] ?? "",
        "",
        ["EM_ESTOQUE", "INSTALADO_TUE", "AGUARDANDO_REPARO", "EM_REPARO", "SUCATA"][index] ?? "",
      ]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(ref);
    ws3["!cols"] = [{ wch: 16 }, { wch: 4 }, { wch: 28 }, { wch: 4 }, { wch: 16 }, { wch: 4 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Referência");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="template_levantamento.xlsx"',
      },
    });
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
}
