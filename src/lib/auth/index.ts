import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { type Adapter } from "next-auth/adapters";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      id: "siwe",
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature) {
          return null;
        }

        try {
          const siwe = new SiweMessage(JSON.parse(credentials.message));

          const result = await siwe.verify({
            signature: credentials.signature,
            nonce: siwe.nonce,
          });

          if (!result.success) return null;

          const address = siwe.address.toLowerCase();

          // Find or create user
          let user = await prisma.user.findUnique({
            where: { address },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                address,
                subscription: {
                  create: { tier: "FREE", status: "ACTIVE" },
                },
                preferences: {
                  create: {},
                },
              },
            });
          }

          return {
            id: user.id,
            name: user.name ?? address,
            address,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.address = (user as { address?: string }).address;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.address = token.address as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
