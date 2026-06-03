import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const response = NextResponse.next();

    // Injeta o pathname no header para uso pelo layout (RBAC server-side)
    response.headers.set("x-next-pathname", request.nextUrl.pathname);

    // RBAC no middleware: bloqueia rotas restritas antes do rendering
    const perfil = request.nextauth.token?.perfil as string | undefined;
    const pathname = request.nextUrl.pathname;

    // Cadastro de usuários: somente ADMIN
    if (pathname.startsWith("/cadastros/usuarios") && perfil !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Auditoria: somente SUPERVISOR ou ADMIN
    if (pathname.startsWith("/auditoria") && perfil !== "SUPERVISOR" && perfil !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!login|api/auth|api/admin/bootstrap-admin|api/dev/reset-admin|_next/static|_next/image|favicon.ico).*)",
  ],
};
