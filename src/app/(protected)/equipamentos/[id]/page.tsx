import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftRight, Pencil } from "lucide-react";
import { buscarEquipamentoPorId } from "@/repositories/equipamento.repository";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  formatDate,
  formatDateTime,
  LABELS_COMPATIBILIDADE,
  LABELS_TIPO_MOV_EQUIPAMENTO,
} from "@/lib/utils";

export default async function EquipamentoDetailPage({ params }: { params: { id: string } }) {
  const equip = await buscarEquipamentoPorId(params.id);
  if (!equip) notFound();

  const acoes: { href: string; label: string; color: string }[] = [];

  if (equip.status === "EM_ESTOQUE") {
    acoes.push(
      {
        href: `/movimentacoes/equipamentos/instalacao?equipamentoId=${equip.id}`,
        label: "Instalar em TUE",
        color: "bg-blue-600 hover:bg-blue-700",
      },
      {
        href: `/movimentacoes/equipamentos/envio-reparo?equipamentoId=${equip.id}`,
        label: "Enviar p/ Reparo",
        color: "bg-orange-500 hover:bg-orange-600",
      },
      {
        href: `/movimentacoes/equipamentos/sucata?equipamentoId=${equip.id}`,
        label: "Baixa Sucata",
        color: "bg-red-600 hover:bg-red-700",
      }
    );
  } else if (equip.status === "INSTALADO_TUE") {
    acoes.push(
      {
        href: `/movimentacoes/equipamentos/retirada?equipamentoId=${equip.id}`,
        label: "Retirar de TUE",
        color: "bg-yellow-500 hover:bg-yellow-600",
      },
      {
        href: `/movimentacoes/equipamentos/transferencia-tue?equipamentoId=${equip.id}`,
        label: "Transferir TUE",
        color: "bg-blue-500 hover:bg-blue-600",
      }
    );
  } else if (equip.status === "AGUARDANDO_REPARO") {
    acoes.push(
      {
        href: `/movimentacoes/equipamentos/envio-reparo?equipamentoId=${equip.id}`,
        label: "Enviar p/ Reparo",
        color: "bg-orange-500 hover:bg-orange-600",
      },
      {
        href: `/movimentacoes/equipamentos/sucata?equipamentoId=${equip.id}`,
        label: "Baixa Sucata",
        color: "bg-red-600 hover:bg-red-700",
      }
    );
  } else if (equip.status === "EM_REPARO") {
    acoes.push(
      {
        href: `/movimentacoes/equipamentos/retorno-reparo?equipamentoId=${equip.id}`,
        label: "Retorno de Reparo",
        color: "bg-green-600 hover:bg-green-700",
      },
      {
        href: `/movimentacoes/equipamentos/sucata?equipamentoId=${equip.id}`,
        label: "Baixa Sucata",
        color: "bg-red-600 hover:bg-red-700",
      }
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={equip.numeroSerie}
        description={equip.descricao}
        breadcrumbs={[
          { label: "Equipamentos", href: "/equipamentos" },
          { label: equip.numeroSerie },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/equipamentos/${equip.id}/editar`}
              className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" /> Editar
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:col-span-1">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
            <div className="mt-1">
              <StatusBadge status={equip.status} />
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Código Trensurb</p>
            <p className="mt-0.5 font-mono font-medium text-gray-900">{equip.codigoTrensurb}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Compatibilidade</p>
            <p className="mt-0.5 font-medium text-gray-900">
              {LABELS_COMPATIBILIDADE[equip.compatibilidade] ?? equip.compatibilidade}
            </p>
          </div>

          {equip.status === "EM_ESTOQUE" && equip.localizacao && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Localização</p>
              <p className="mt-0.5 font-mono font-medium text-green-700">{equip.localizacao.codigo}</p>
              <p className="text-xs text-gray-500">{equip.localizacao.descricao}</p>
            </div>
          )}

          {equip.status === "INSTALADO_TUE" && equip.tue && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Instalado em</p>
              <p className="mt-0.5 text-lg font-bold text-blue-700">TUE {equip.tue.numero}</p>
              {(equip as any).carro && (
                <p className="text-sm text-gray-700">
                  Carro: <span className="font-mono font-semibold">{(equip as any).carro}</span>
                </p>
              )}
              {(equip as any).posicaoInstalada && (
                <p className="text-sm text-gray-700">
                  Posição: <span className="font-mono">{(equip as any).posicaoInstalada}</span>
                </p>
              )}
            </div>
          )}

          {equip.observacao && (
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Observação</p>
              <p className="mt-0.5 text-sm text-gray-700">{equip.observacao}</p>
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Cadastrado em</p>
            <p className="mt-0.5 text-sm text-gray-700">{formatDate(equip.criadoEm)}</p>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {acoes.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">Movimentações Disponíveis</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {acoes.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className={`${a.color} rounded-md px-4 py-2 text-sm font-medium text-white transition-colors`}
                  >
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {equip.status === "SUCATA" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                Equipamento baixado para sucata. Nenhuma movimentação permitida.
              </p>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Histórico de Movimentações</h3>
            </div>

            {equip.movimentacoes.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">Nenhuma movimentação registrada.</p>
            ) : (
              <div className="max-h-96 divide-y divide-gray-100 overflow-y-auto">
                {equip.movimentacoes.map((m) => (
                  <div key={m.id} className={`px-4 py-3 ${m.ehExcecao ? "bg-orange-50" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-medium text-gray-700">
                          {LABELS_TIPO_MOV_EQUIPAMENTO[m.tipo] ?? m.tipo}
                        </span>
                        {m.statusAnterior && (
                          <span className="ml-2 text-xs text-gray-500">
                            <StatusBadge status={m.statusAnterior} /> {" -> "} <StatusBadge status={m.statusNovo} />
                          </span>
                        )}
                      </div>
                      <span className="whitespace-nowrap text-xs text-gray-400">{formatDateTime(m.realizadoEm)}</span>
                    </div>

                    <div className="mt-1 space-y-0.5 text-xs text-gray-600">
                      {m.tue && <span className="mr-2">TUE: <strong>{m.tue.numero}</strong></span>}
                      {(m as any).carro && <span className="mr-2">Carro: <strong>{(m as any).carro}</strong></span>}
                      {(m as any).posicaoInstalada && <span className="mr-2">Posição: <strong>{(m as any).posicaoInstalada}</strong></span>}
                      {m.oficina && <span className="mr-2">Oficina: <strong>{m.oficina.nome}</strong></span>}
                      {m.motivoReparo && <span className="mr-2 text-orange-600">Motivo: {m.motivoReparo}</span>}
                      {m.motivoSucata && <span className="mr-2 text-red-600">Sucata: {m.motivoSucata}</span>}
                      {m.numeroOS && <span className="mr-2">OS: {m.numeroOS}</span>}
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-gray-400">por {m.usuario.nome}</span>
                      {m.ehExcecao && (
                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">
                          EXCEÇÃO
                        </span>
                      )}
                    </div>

                    {m.observacao && <p className="mt-0.5 text-xs italic text-gray-500">{m.observacao}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

