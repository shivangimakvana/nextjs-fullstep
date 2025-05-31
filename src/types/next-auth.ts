// types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      _id: string; // 🔑 Add MongoDB user ID
    };
  }

  interface User {
    _id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id: string;
  }
}
