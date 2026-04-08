"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { FormError, AlertError, AlertSuccess } from "@/components/shared/form-error";
import { criarEquipamentoAction } from "@/actions/equipamento.actions";
import { LABELS_COMPATIBILIDADE } from "@/lib/utils";

type FieldErrors = Record<string, string[]>;

interface FormState {
  errors: FieldErrors;
  globalError: string | null;
  success: boolean;
}

export default function NovoEquipamentoPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    errors: {},
    globalError: null,
    success: false,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setFormState({ errors: {}, globalError: null, success: false });

    const formData = new FormData(event.currentTarget);

    try {
      const result = await criarEquipamentoAction(formData);

      if (!result.success) {
        setFormState({
          errors: result.fieldErrors ?? {},
          globalError: result.error,
          success: false,
        });
        return;
      }

      setFormState({ errors: {}, globalError: null, success: true });
      setTimeout(() => router.push(`/equipamentos/${result.data.id}`), 800);
    } catch {
      setFormState({
        errors: {},
        globalError: "Erro ao criar equipamento. Tente novamente.",
        success: false,
      });
    } finally {
      setIsPending(false);
    }
  }

  const compatibilidadeOptions = Object.entries(LABELS_COMPATIBILIDADE);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Novo Equipamento"
        description="Cadastre um novo equipamento no sistema de estoque"
        breadcrumbs={[{ label: "Equipamentos", href: "/equipamentos" }, { label: "Novo" }]}
        action={
          <Link
            href="/equipamentos"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Voltar para Equipamentos
          </Link>
        }
      />

      {formState.globalError && <AlertError message={formState.globalError} />}
      {formState.success && (
        <AlertSuccess message="Equipamento criado com sucesso! Redirecionando..." />
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="numeroSerie" className="mb-1 block text-sm font-medium text-gray-700">
              Número de Série <span className="text-red-500">*</span>
            </label>
            <input
              id="numeroSerie"
              name="numeroSerie"
              type="text"
              required
              placeholder="Ex: ABC-123456"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FormError message={formState.errors.numeroSerie?.[0]} />
          </div>

          <div>
            <label htmlFor="codigoTrensurb" className="mb-1 block text-sm font-medium text-gray-700">
              Código Trensurb
            </label>
            <input
              id="codigoTrensurb"
              name="codigoTrensurb"
              type="text"
              placeholder="Ex: TRE-001"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FormError message={formState.errors.codigoTrensurb?.[0]} />
          </div>

          <div>
            <label htmlFor="descricao" className="mb-1 block text-sm font-medium text-gray-700">
              Descrição <span className="text-red-500">*</span>
            </label>
            <input
              id="descricao"
              name="descricao"
              type="text"
              required
              placeholder="Descrição do equipamento"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FormError message={formState.errors.descricao?.[0]} />
          </div>

          <div>
            <label htmlFor="compatibilidade" className="mb-1 block text-sm font-medium text-gray-700">
              Compatibilidade <span className="text-red-500">*</span>
            </label>
            <select
              id="compatibilidade"
              name="compatibilidade"
              required
              defaultValue=""
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Selecione a compatibilidade
              </option>
              {compatibilidadeOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <FormError message={formState.errors.compatibilidade?.[0]} />
          </div>

          <div>
            <label htmlFor="observacao" className="mb-1 block text-sm font-medium text-gray-700">
              Observação
            </label>
            <textarea
              id="observacao"
              name="observacao"
              rows={3}
              placeholder="Observações adicionais sobre o equipamento..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FormError message={formState.errors.observacao?.[0]} />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending || formState.success}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Criar Equipamento"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/equipamentos")}
              className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
