import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/yield/:path*",
    "/loans/:path*",
    "/trading/:path*",
    "/analytics/:path*",
    "/settings/:path*",
  ],
};
