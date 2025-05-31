import { NextResponse } from 'next/server';
import UserModel from '@/model/User';

export async function GET() {
  try {
    const users = await UserModel.find().populate('messages').exec();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error || 'Failed to fetch users' }, { status: 500 });
  }
}