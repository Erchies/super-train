"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { criarUsuarioAction } from "@/actions/usuario.actions";
import { criarUsuarioSchema, PERFIS_USUARIO, type CriarUsuarioInput } from "@/domain/user/validations";

const defaultValues: CriarUsuarioInput = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  perfil: "OPERADOR",
  ativo: true,
};

const perfilLabels: Record<CriarUsuarioInput["perfil"], string> = {
  OPERADOR: "Operador",
  SUPERVISOR: "Supervisor",
  ADMIN: "Admin",
};

export function UsuarioForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<CriarUsuarioInput>({
    resolver: zodResolver(criarUsuarioSchema),
    defaultValues,
  });

  function submit(values: CriarUsuarioInput) {
    startTransition(async () => {
      const result = await criarUsuarioAction(values);

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            if (messages?.[0]) {
              form.setError(field as keyof CriarUsuarioInput, { message: messages[0] });
            }
          }
        }
        toast.error(result.error);
        return;
      }

      toast.success("Usuario cadastrado com sucesso");
      form.reset(defaultValues);
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Novo usuario</h2>
        <p className="mt-1 text-sm text-gray-500">Cadastre acessos internos para operacao, supervisao e administracao.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-sm font-medium text-gray-700">Nome *</span>
          <input
            {...form.register("nome")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nome completo"
          />
          {form.formState.errors.nome && <p className="text-xs text-red-600">{form.formState.errors.nome.message}</p>}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-gray-700">E-mail *</span>
          <input
            type="email"
            {...form.register("email")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="usuario@trensurb.com"
          />
          {form.formState.errors.email && <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-gray-700">Senha *</span>
          <input
            type="password"
            {...form.register("senha")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Minimo 6 caracteres"
          />
          {form.formState.errors.senha && <p className="text-xs text-red-600">{form.formState.errors.senha.message}</p>}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-gray-700">Confirmar senha *</span>
          <input
            type="password"
            {...form.register("confirmarSenha")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Repita a senha"
          />
          {form.formState.errors.confirmarSenha && <p className="text-xs text-red-600">{form.formState.errors.confirmarSenha.message}</p>}
        </label>

        <label className="space-y-1">
          <span className="text-sm font-medium text-gray-700">Perfil *</span>
          <select
            {...form.register("perfil")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PERFIS_USUARIO.map((perfil) => (
              <option key={perfil} value={perfil}>
                {perfilLabels[perfil]}
              </option>
            ))}
          </select>
          {form.formState.errors.perfil && <p className="text-xs text-red-600">{form.formState.errors.perfil.message}</p>}
        </label>

        <label className="flex items-center gap-2 pt-7 text-sm text-gray-700">
          <input type="checkbox" {...form.register("ativo")} className="h-4 w-4 rounded border-gray-300" />
          Ativo
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
