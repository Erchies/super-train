import { buscarMaterialPorId } from "@/repositories/material.repository";
import { PageHeader } from "@/components/shared/page-header";
import { StockBadge } from "@/components/shared/status-badge";
import { formatDateTime, formatQuantidade, LABELS_TIPO_MOV_CONSUMIVEL } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowLeftRight, Pencil, AlertTriangle, MapPin, Tag, Layers, FileText, AlertCircle } from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default async function MaterialDetailPage({ params }: PageProps) {
  const material = await buscarMaterialPorId(params.id);
  if (!material) notFound();

  const abaixoMinimo = material.quantidadeAtual < material.estoqueMinimo;

  return (
    <div className="space-y-6">
      <PageHeader title={material.codigoTrensurb} description={material.descricao}>
        <Link href="/materiais" className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <Link href={`/materiais/${params.id}/editar`} className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Pencil className="h-4 w-4" />
          Editar
        </Link>
        <Link href={`/movimentacoes/consumiveis/nova?materialId=${params.id}`} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          <ArrowLeftRight className="h-4 w-4" />
          Registrar Movimentação
        </Link>
      </PageHeader>

      {abaixoMinimo && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Estoque abaixo do mínimo</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Saldo atual ({material.quantidadeAtual} {material.unidade}) está abaixo do mínimo configurado ({material.estoqueMinimo} {material.unidade}).
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Informações do Material</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-gray-100 p-2 flex-shrink-0"><Tag className="h-4 w-4 text-gray-500" /></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Código Trensurb</p>
              <p className="mt-1 text-sm font-mono font-medium text-gray-900">{material.codigoTrensurb}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="rounded-md bg-gray-100 p-2 flex-shrink-0"><FileText className="h-4 w-4 text-gray-500" /></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descrição</p>
              <p className="mt-1 text-sm text-gray-900">{material.descricao}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-md bg-gray-100 p-2 flex-shrink-0"><Layers className="h-4 w-4 text-gray-500" /></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unidade</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{material.unidade}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-md bg-gray-100 p-2 flex-shrink-0"><Layers className="h-4 w-4 text-gray-500" /></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Saldo Atual</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{formatQuantidade(material.quantidadeAtual)} {material.unidade}</span>
                <StockBadge atual={material.quantidadeAtual} estoqueMinimo={material.estoqueMinimo} />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-md bg-gray-100 p-2 flex-shrink-0"><AlertCircle className="h-4 w-4 text-gray-500" /></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estoque Mínimo</p>
              <p className="mt-1 text-sm text-gray-900">{formatQuantidade(material.estoqueMinimo)} {material.unidade}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-md bg-gray-100 p-2 flex-shrink-0"><MapPin className="h-4 w-4 text-gray-500" /></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Localização</p>
              <p className="mt-1 text-sm text-gray-900">
                {material.localizacao ? `${material.localizacao.codigo} - ${material.localizacao.descricao}` : <span className="text-gray-400 italic">Não definida</span>}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:col-span-2 lg:col-span-3">
            <div className="rounded-md bg-gray-100 p-2 flex-shrink-0"><MapPin className="h-4 w-4 text-gray-500" /></div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Posições Possíveis</p>
              <p className="mt-1 text-sm text-gray-900">
                {material.posicoesPossiveis.length > 0 ? material.posicoesPossiveis.map((p) => p.posicao.codigo).join(", ") : <span className="text-gray-400 italic">Não definidas</span>}
              </p>
            </div>
          </div>

          {material.observacao && (
            <div className="flex items-start gap-3 sm:col-span-2 lg:col-span-3">
              <div className="rounded-md bg-gray-100 p-2 flex-shrink-0"><FileText className="h-4 w-4 text-gray-500" /></div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Observação</p>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{material.observacao}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Histórico de Movimentações</h2>
          <span className="text-xs text-gray-400">{material.movimentacoes.length} registro{material.movimentacoes.length !== 1 ? "s" : ""}</span>
        </div>

        {material.movimentacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-gray-500">Nenhuma movimentação registrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tipo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Quantidade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">OS / Chamado / Atividade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Responsável</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Observação</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Exceção</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {material.movimentacoes.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">{formatDateTime(mov.realizadoEm)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700">
                        {LABELS_TIPO_MOV_CONSUMIVEL[mov.tipo] ?? mov.tipo}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-right font-medium text-gray-900">{formatQuantidade(mov.quantidade)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {mov.numeroOS || mov.numeroChamado || mov.atividade?.descricao ? (
                        <div className="space-y-0.5">
                          {mov.numeroOS && <p><span className="font-medium">OS:</span> {mov.numeroOS}</p>}
                          {mov.numeroChamado && <p><span className="font-medium">Chamado:</span> {mov.numeroChamado}</p>}
                          {mov.atividade?.descricao && <p><span className="font-medium">Atividade:</span> {mov.atividade.descricao}</p>}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">{mov.usuario?.nome ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-xs"><span className="line-clamp-2">{mov.observacao ?? "—"}</span></td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      {mov.ehExcecao ? <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Exceção</span> : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
