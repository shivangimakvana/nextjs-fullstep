import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, SessionStrategy } from "next-auth";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();
        if (!credentials?.email || !credentials?.password) return null;

        // Find user by email
        const user = await UserModel.findOne({ email: credentials.email });
        if (!user) return null;

        // Check password (replace with your password check logic)
        const isValid = credentials.password === user.password; // Use hashing in production!
        if (!isValid) return null;

        // Return user object (must include _id for session)
        return {
          _id: user._id.toString(),
          email: user.email,
          name: user.name || "",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user _id to token on login
      if (user) {
        token._id = user._id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add _id from token to session.user
      if (session.user && token._id) {
        session.user._id = token._id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // Optional: custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET,
};