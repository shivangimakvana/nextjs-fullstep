import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  console.log('Session:', session);

  if (!session || !session.user) {
    return new Response(
      JSON.stringify({ success: false, message: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const userId = new mongoose.Types.ObjectId(session.user._id);

  try {
    const user = await UserModel.findOne({ _id: userId });
    console.log('User:', user);

    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found', success: false }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ messages: user.messages }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error', success: false }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}