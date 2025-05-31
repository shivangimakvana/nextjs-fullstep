import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

// Define the shape of credentials
type CredentialsType = {
  identifier: string;
  password: string;
};

// Define the shape of the returned user
type AuthorizedUser = {
  _id: string;
  email: string;
  username: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email/Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(
        credentials: CredentialsType
      ): Promise<AuthorizedUser | null> {
        await dbConnect();
        try {
          if (!credentials?.identifier || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            return null;
          }

          const isPasswordCorrect =
            user.password &&
            (await bcrypt.compare(credentials.password, user.password));

          if (!isPasswordCorrect) {
            return null;
          }

          return {
            _id: user._id.toString(),
            email: user.email,
            username: user.username,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          throw new Error('Internal server error');
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = (user as AuthorizedUser)._id;
        token.email = (user as AuthorizedUser).email;
        token.username = (user as AuthorizedUser).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          _id: token._id as string,
          email: token.email as string,
          username: token.username as string,
        };
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/sign-in',
  },
};
