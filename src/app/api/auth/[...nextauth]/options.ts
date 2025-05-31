import { NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

// Extend the Session type to include username and _id
declare module 'next-auth' {
  interface Session {
    user: {
      _id: string;
      email: string;
      username: string;
    };
  }
}


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
        credentials: Record<"identifier" | "password", string> | undefined
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
            id: user._id.toString(),
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
        token._id = (user as unknown as AuthorizedUser)._id;
        token.email = (user as unknown as AuthorizedUser).email;
        token.username = (user as unknown as AuthorizedUser).username;
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
