# Super Train

Aplicacao Next.js 14 com Prisma, NextAuth e PostgreSQL.

## Deploy gratuito na Vercel + Supabase

### 1. Criar o banco no Supabase

1. Crie uma conta ou acesse https://supabase.com.
2. Crie um novo projeto no plano Free.
3. Guarde a senha do banco definida na criacao do projeto.
4. Em **Project Settings > Database > Connection string**, copie a connection string PostgreSQL.
5. Copie duas strings:
   - `DATABASE_URL`: connection string com pooler para a aplicacao em runtime.
   - `DIRECT_URL`: connection string direta para migrations do Prisma.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/DATABASE?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

Para um projeto novo no Supabase, considere o banco vazio e aplique as migrations antes do seed.

### 2. Configurar variaveis na Vercel

No projeto da Vercel, configure em **Settings > Environment Variables**:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/DATABASE?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
NEXTAUTH_URL="https://seu-projeto.vercel.app"
NEXTAUTH_SECRET="uma_chave_forte"
ADMIN_PASSWORD="senha_forte_para_admin"
SUPERVISOR_PASSWORD="senha_forte_para_supervisor"
OPERADOR_PASSWORD="senha_forte_para_operador"
```

`DATABASE_URL` vem do pooler do Supabase e e usada pela aplicacao na Vercel. `DIRECT_URL` deve apontar para a conexao direta e e usada pelo Prisma para migrations. `NEXTAUTH_URL` deve ser `http://localhost:3000` em desenvolvimento local e a URL publica da Vercel em producao.

Gere o `NEXTAUTH_SECRET` com uma chave forte:

```bash
openssl rand -base64 32
```

Tambem e possivel gerar com Node:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Rodar localmente

Crie um arquivo `.env` local baseado em `.env.example`. Para rodar localmente, use uma `DATABASE_URL` PostgreSQL, que pode ser de um projeto Supabase de desenvolvimento ou de um PostgreSQL local. Se usar PostgreSQL local sem pooler, `DATABASE_URL` e `DIRECT_URL` podem apontar para o mesmo banco.

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Em desenvolvimento, se `ADMIN_PASSWORD`, `SUPERVISOR_PASSWORD` e `OPERADOR_PASSWORD` nao forem definidas, o seed usa senhas padrao e exibe avisos no console. Nao use essas senhas em producao.

### 4. Publicar na Vercel

1. Suba o repositorio para o GitHub.
2. Na Vercel, importe o repositorio.
3. Configure as variaveis de ambiente listadas acima.
4. Faca o deploy.

O script `postinstall` executa `prisma generate` automaticamente durante a instalacao na Vercel.

### 5. Rodar migrations em producao

Depois de configurar `DATABASE_URL` e `DIRECT_URL` com as connection strings do Supabase:

```bash
npx prisma migrate deploy
```

O projeto tambem inclui o script:

```bash
npm run db:deploy
```

### 6. Seed inicial

O seed cria dados basicos:

- usuarios iniciais;
- localizacoes;
- TUEs serie 100 e serie 200;
- carros MA, MB, RA e RB;
- funcoes;
- oficinas;
- atividades.

Antes de executar seed em producao, defina:

```env
ADMIN_PASSWORD="..."
SUPERVISOR_PASSWORD="..."
OPERADOR_PASSWORD="..."
```

Em producao, o seed falha se essas variaveis nao estiverem configuradas.

### 7. Aviso sobre migracao de SQLite para PostgreSQL

As migrations antigas de SQLite foram substituidas por uma migration inicial limpa para PostgreSQL, adequada para um banco novo no Supabase.

Se voce tiver dados reais em um arquivo SQLite local, nao rode comandos destrutivos antes de exportar esses dados. A migracao de dados entre SQLite e PostgreSQL precisa ser feita separadamente, por exportacao/importacao ou script dedicado.
