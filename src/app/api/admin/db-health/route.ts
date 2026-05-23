import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

export const runtime = "nodejs";

type TableRow = { table_name: string };
type ColumnRow = { table_name: string; column_name: string };
type MigrationRow = {
  migration_name: string;
  finished_at: Date | null;
  rolled_back_at: Date | null;
};

const REQUIRED_TABLES = [
  "usuarios",
  "equipamentos",
  "equipamentos_referencias_serie",
];

const REQUIRED_COLUMNS = [
  { key: "usuarios.perfil", table: "usuarios", column: "perfil" },
  { key: "usuarios.senhaHash", table: "usuarios", column: "senhaHash" },
  { key: "usuarios.ativo", table: "usuarios", column: "ativo" },
  { key: "equipamentos.sistema", table: "equipamentos", column: "sistema" },
];

const REQUIRED_MIGRATIONS = [
  "20260515120000_add_sistema_equipamento",
  "20260515130000_add_equipamento_referencia_serie",
];

function booleanEnv(name: string) {
  return Boolean(process.env[name]);
}

async function getMigrationRows() {
  try {
    return await prisma.$queryRaw<MigrationRow[]>`
      SELECT migration_name, finished_at, rolled_back_at
      FROM "_prisma_migrations"
      ORDER BY started_at DESC
      LIMIT 20
    `;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Nao autenticado" },
      { status: 401 }
    );
  }

  if (session.perfil !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Acesso negado" },
      { status: 403 }
    );
  }

  try {
    const [tables, columns, migrations] = await Promise.all([
      prisma.$queryRaw<TableRow[]>`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('usuarios', 'equipamentos', 'equipamentos_referencias_serie')
      `,
      prisma.$queryRaw<ColumnRow[]>`
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN ('usuarios', 'equipamentos')
          AND column_name IN ('perfil', 'senhaHash', 'ativo', 'sistema')
      `,
      getMigrationRows(),
    ]);

    const existingTables = new Set(tables.map((row) => row.table_name));
    const existingColumns = new Set(
      columns.map((row) => `${row.table_name}.${row.column_name}`)
    );
    const appliedMigrations = new Set(
      (migrations ?? [])
        .filter((row) => row.finished_at && !row.rolled_back_at)
        .map((row) => row.migration_name)
    );

    const checks = {
      tables: Object.fromEntries(
        REQUIRED_TABLES.map((table) => [table, existingTables.has(table)])
      ),
      columns: Object.fromEntries(
        REQUIRED_COLUMNS.map(({ key, table, column }) => [
          key,
          existingColumns.has(`${table}.${column}`),
        ])
      ),
      migrations: Object.fromEntries(
        REQUIRED_MIGRATIONS.map((migration) => [
          migration,
          appliedMigrations.has(migration),
        ])
      ),
      env: {
        DATABASE_URL: booleanEnv("DATABASE_URL"),
        DIRECT_URL: booleanEnv("DIRECT_URL"),
        SUPABASE_URL: booleanEnv("SUPABASE_URL"),
        SUPABASE_SERVICE_ROLE_KEY: booleanEnv("SUPABASE_SERVICE_ROLE_KEY"),
        SUPABASE_REFERENCIAS_BUCKET: booleanEnv("SUPABASE_REFERENCIAS_BUCKET"),
      },
    };

    const missingTables = Object.entries(checks.tables)
      .filter(([, ok]) => !ok)
      .map(([key]) => key);
    const missingColumns = Object.entries(checks.columns)
      .filter(([, ok]) => !ok)
      .map(([key]) => key);
    const missingMigrations = Object.entries(checks.migrations)
      .filter(([, ok]) => !ok)
      .map(([key]) => key);

    const success =
      missingTables.length === 0 &&
      missingColumns.length === 0 &&
      missingMigrations.length === 0;

    return NextResponse.json({
      success,
      checks,
      missing: {
        tables: missingTables,
        columns: missingColumns,
        migrations: missingMigrations,
      },
      latestMigrations: migrations?.slice(0, 5) ?? null,
      hint: success
        ? "Banco compatível com o código atual."
        : "Rode npx prisma migrate deploy apontando para o banco de producao.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao verificar banco",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
