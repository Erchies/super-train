import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // ── Usuários ──────────────────────────────────────────────────────────────
  const senhaAdmin = await bcrypt.hash("admin123", 10);
  const senhaSupervisor = await bcrypt.hash("sup123", 10);
  const senhaOperador = await bcrypt.hash("op123", 10);

  await prisma.usuario.upsert({
    where: { email: "admin@trensurb.com" },
    update: {},
    create: { nome: "Administrador", email: "admin@trensurb.com", senhaHash: senhaAdmin, perfil: "ADMIN" },
  });
  await prisma.usuario.upsert({
    where: { email: "supervisor@trensurb.com" },
    update: {},
    create: { nome: "Supervisor Manutenção", email: "supervisor@trensurb.com", senhaHash: senhaSupervisor, perfil: "SUPERVISOR" },
  });
  await prisma.usuario.upsert({
    where: { email: "operador@trensurb.com" },
    update: {},
    create: { nome: "Operador Estoque", email: "operador@trensurb.com", senhaHash: senhaOperador, perfil: "OPERADOR" },
  });

  // ── Localizações ──────────────────────────────────────────────────────────
  const localizacoes = [
    { codigo: "PRAT-01", descricao: "Prateleira 01" },
    { codigo: "PRAT-02", descricao: "Prateleira 02" },
    { codigo: "PRAT-03", descricao: "Prateleira 03" },
    { codigo: "ARM-01", descricao: "Armário 01" },
    { codigo: "ARM-02", descricao: "Armário 02" },
    { codigo: "BANC-01", descricao: "Bancada 01" },
    { codigo: "BANC-02", descricao: "Bancada 02" },
    { codigo: "DEP-01", descricao: "Depósito 01" },
  ];
  for (const loc of localizacoes) {
    await prisma.localizacao.upsert({
      where: { codigo: loc.codigo },
      update: {},
      create: loc,
    });
  }

  // ── TUEs ──────────────────────────────────────────────────────────────────
  // Série 100: TUE 101–125 | Série 200: TUE 226–240
  // A centena define a série: 1xx = SERIE_100, 2xx = SERIE_200
  const tues: { numero: string; serie: "SERIE_100" | "SERIE_200"; descricao: string }[] = [];
  for (let n = 101; n <= 125; n++) {
    tues.push({ numero: String(n), serie: "SERIE_100", descricao: `TUE ${n} - Série 100` });
  }
  for (let n = 226; n <= 240; n++) {
    tues.push({ numero: String(n), serie: "SERIE_200", descricao: `TUE ${n} - Série 200` });
  }
  for (const tue of tues) {
    await prisma.tUE.upsert({
      where: { numero: tue.numero },
      update: { serie: tue.serie, descricao: tue.descricao },
      create: tue,
    });
  }

  // ── Carros ────────────────────────────────────────────────────────────────
  // A tabela "posicoes" agora representa os CARROS: MA | MB | RA | RB
  const carros = [
    { codigo: "MA", descricao: "Carro MA" },
    { codigo: "MB", descricao: "Carro MB" },
    { codigo: "RA", descricao: "Carro RA" },
    { codigo: "RB", descricao: "Carro RB" },
  ];
  for (const carro of carros) {
    await prisma.posicao.upsert({
      where: { codigo: carro.codigo },
      update: { descricao: carro.descricao, ativo: true },
      create: carro,
    });
  }
  // Inativar registros antigos que não são carros válidos
  await prisma.posicao.updateMany({
    where: { codigo: { notIn: ["MA", "MB", "RA", "RB"] } },
    data: { ativo: false },
  });

  // ── Funções ───────────────────────────────────────────────────────────────
  const funcoes = [
    { codigo: "COMP-TRAC", descricao: "Computador de Tração" },
    { codigo: "INV-TRAC", descricao: "Inversor de Tração" },
    { codigo: "MOTOR-TRAC", descricao: "Motor de Tração" },
    { codigo: "COMP-AUX", descricao: "Computador Auxiliar" },
    { codigo: "BCU", descricao: "Brake Control Unit" },
    { codigo: "HVAC", descricao: "Sistema de Climatização" },
    { codigo: "PORTA-E", descricao: "Porta Esquerda" },
    { codigo: "PORTA-D", descricao: "Porta Direita" },
    { codigo: "PANTOG", descricao: "Pantógrafo" },
    { codigo: "DISJUNTOR", descricao: "Disjuntor Principal" },
  ];
  for (const func of funcoes) {
    await prisma.funcao.upsert({
      where: { codigo: func.codigo },
      update: {},
      create: func,
    });
  }

  // ── Oficinas ──────────────────────────────────────────────────────────────
  const oficinas = [
    { nome: "Oficina Interna Trensurb", tipo: "INTERNA", contato: "manutencao@trensurb.com.br" },
    { nome: "Alstom Brasil", tipo: "FABRICANTE", contato: "servicos@alstom.com" },
    { nome: "Bombardier Transportation", tipo: "FABRICANTE", contato: "" },
    { nome: "Eletro-Tren Reparos", tipo: "EXTERNA", contato: "(51) 3333-0001" },
    { nome: "TechRail Manutenção", tipo: "EXTERNA", contato: "(51) 3333-0002" },
  ];
  for (const oficina of oficinas) {
    await prisma.oficina.create({ data: oficina }).catch(() => {});
  }

  // ── Atividades ────────────────────────────────────────────────────────────
  const atividades = [
    { codigo: "MANUT-PREV", descricao: "Manutenção Preventiva" },
    { codigo: "MANUT-CORR", descricao: "Manutenção Corretiva" },
    { codigo: "VISTORIA", descricao: "Vistoria Programada" },
    { codigo: "REVISAO-GERAL", descricao: "Revisão Geral" },
    { codigo: "INSPECAO-DIARIA", descricao: "Inspeção Diária" },
    { codigo: "REPARO-EMERGENCIAL", descricao: "Reparo Emergencial" },
    { codigo: "TESTE-RODAGEM", descricao: "Teste de Rodagem" },
    { codigo: "INSTALACAO", descricao: "Instalação de Componente" },
    { codigo: "SUBSTITUICAO", descricao: "Substituição de Componente" },
  ];
  for (const ativ of atividades) {
    await prisma.atividade.upsert({
      where: { codigo: ativ.codigo },
      update: {},
      create: ativ,
    });
  }

  console.log("✅ Seed concluído com sucesso!");
  console.log("\n📋 Usuários criados:");
  console.log("  Admin:      admin@trensurb.com     / admin123");
  console.log("  Supervisor: supervisor@trensurb.com / sup123");
  console.log("  Operador:   operador@trensurb.com   / op123");
  console.log("\n🚃 TUEs:");
  console.log("  Série 100: 101–125 (25 TUEs)");
  console.log("  Série 200: 226–240 (15 TUEs)");
  console.log("\n🚋 Carros: MA, MB, RA, RB");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
