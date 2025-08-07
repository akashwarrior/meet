import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare, hash } from 'bcrypt';
import prisma from '@/lib/db';

const SALT_ROUND = 10;

export const NEXT_AUTH = {
  providers: [
    CredentialsProvider({
      id: 'Login',
      name: 'Login',
      credentials: {
        email: { label: 'email', type: 'text', placeholder: '', required: true },
        password: { label: 'password', type: 'password', placeholder: '', required: true },
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined) {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }
        try {
          const user = await prisma.user.findFirstOrThrow({
            where: {
              email: credentials.email.trim(),
            },
          });

          const res = await compare(credentials.password.trim(), user.password);
          if (!res) {
            throw new Error('Invalid password');
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        }
        catch (error) {
          if (error instanceof Error && error.message.includes('No User found')) {
            throw new Error('User not found');
          }
          throw new Error('Error logging in user');
        }
      },
    }),

    CredentialsProvider({
      id: 'newUser',
      name: 'SignUp',
      credentials: {
        name: { label: 'name', type: 'text', placeholder: '', required: true },
        email: { label: 'email', type: 'text', placeholder: '', required: true },
        password: { label: 'password', type: 'password', placeholder: '', required: true },
      },
      async authorize(credentials: Record<"name" | "email" | "password", string> | undefined) {
        if (!credentials || !credentials.name || !credentials.email || !credentials.password) {
          console.error("Invalid credentials:", credentials);
          return null;
        }
        const hashedPassword = await hash(credentials.password.trim(), SALT_ROUND);
        try {
          const user = await prisma.user.create({
            data: {
              name: credentials.name.trim(),
              email: credentials.email.trim(),
              password: hashedPassword,
              image: null,
            },
          })

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error("Error creating user:", error);
          if (error instanceof Error && error.message.includes('Unique constraint failed')) {
            throw new Error('User already exists with this email');
          }
          throw new Error('Error creating user');
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/signup',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        domain: process.env.BASE_URL,
        path: '/',
        httpOnly: true,
        sameSite: "Lax",
        secure: true,
      },
    },
  },

} satisfies NextAuthOptions;
