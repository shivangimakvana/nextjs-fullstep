import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email/Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
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
      
          console.log('User:', user); 
      
          if (!user) {
            return null;
          }
      
          const isPasswordCorrect = user.password && await bcrypt.compare(credentials.password, user.password);
      
          console.log('Password correct:', isPasswordCorrect); 
      
          if (!isPasswordCorrect) {
            return null;
          }
      
          return {
            _id: user._id.toString(),
            email: user.email,
            username: user.username,
          };
        } catch (error: any) {
          console.error('Authorize error:', error); // ✅ See exact error
          throw new Error('Internal server error');
        }
      }
      
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.email = user.email;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          _id: token._id,
          email: token.email,
          username: token.username,
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