import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/((?!login|api/auth|api/admin/bootstrap-admin|api/dev/reset-admin|_next/static|_next/image|favicon.ico).*)",
  ],
};
