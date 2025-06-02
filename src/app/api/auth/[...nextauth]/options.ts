import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

// Extend Session/User/JWT types
declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      _id: string;
    };
  }

  interface User {
    _id: string;
    email: string;
    username: string;
  }
}

declare module 'next-auth/jwt' {
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
          id: user._id.toString(),
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
    async jwt({ token, user }: { token: import('next-auth/jwt').JWT; user?: AuthorizedUser }) {
      if (user) {
      token._id = (user as AuthorizedUser)._id;
      token.email = user.email;
      token.username = user.username;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: import("next-auth").Session;
      token: import("next-auth/jwt").JWT;
    }): Promise<import("next-auth").Session> {
      if (token && session.user) {
      session.user._id = token._id as string;
      session.user.email = token.email as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
} 
