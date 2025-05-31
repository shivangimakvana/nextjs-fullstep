import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { NextAuth } from 'next-auth';

// Extend Session/User/JWT types
declare module 'next-auth' {
  interface Session {
    user: {
      _id: string;
      email: string;
      username: string;
    };
  }

  interface User {
    _id: string;
    email: string;
    username: string;
  }

  interface JWT {
    _id: string;
    email: string;
    username: string;
  }
}

type AuthorizedUser = {
  _id: string;
  email: string;
  username: string;
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email/Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await UserModel.findOne({
          $or: [
            { email: credentials.identifier },
            { username: credentials.identifier },
          ],
        });

        if (!user) return null;

        const isPasswordCorrect =
          user.password && (await bcrypt.compare(credentials.password, user.password));

        if (!isPasswordCorrect) return null;

        return {
          _id: user._id.toString(),
          email: user.email,
          username: user.username,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = (user as AuthorizedUser)._id;
        token.email = user.email;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user._id = token._id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
} satisfies Parameters<typeof NextAuth>[0]; // ✅ correct type assertion
