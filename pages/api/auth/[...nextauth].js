import NextAuth from "next-auth";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
const prisma = new PrismaClient();
export default NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(req, res) {
        const admin = await prisma.admin.findUnique({
          where: {
            username: req.username,
          },
        });
        if (admin) {
          if (
            req.username == admin.username &&
            req.password == admin.password
          ) {
            return admin;
          } else {
            return null;
          }
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.name = user.username;
        // token.email = user.req;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.admin = {
          adminName: token.name,
        };
        // session.req = {
        //   req: token.email,
        // };
      }
      return session;
    },
  },
  jwt: {
    maxAge: 100000,
  },
  session: {
    jwt: true,
  },
  secret: "no-secret",
  jwt: {
    secret: "no-secret",
    encryption: true,
  },

  pages: {
    signIn: "/Login/Admin",
  },
});
