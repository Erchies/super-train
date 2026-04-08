// Re-exports de tipos Prisma para uso na UI
export type {
  Material,
  Equipamento,
  Localizacao,
  TUE,
  Posicao,
  Funcao,
  Oficina,
  Atividade,
  Usuario,
  MovimentacaoConsumivel,
  MovimentacaoEquipamento,
} from "@prisma/client";

// Domínio atual usa campos string no schema em vez de enums Prisma
export type CompatibilidadeSerie = string;
export type StatusEquipamento = string;
export type TipoMovConsumivel = string;
export type TipoMovEquipamento = string;
export type PerfilUsuario = string;
