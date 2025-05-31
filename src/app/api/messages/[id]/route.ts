import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; // Mongoose version
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
 
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
 
  try {
    await dbConnect(); // 👈 establish the DB connection
 
    const result = await mongoose.connection.db.collection('users').updateOne(
      { "messages._id": new ObjectId(id) },
      { $pull: { messages: { _id: new ObjectId(id) } } }
    );
 
    if (result.modifiedCount > 0) {
      return NextResponse.json({ success: true, message: 'Message deleted successfully.' });
    } else {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: 'Server error', error: error.message },
        { status: 500 }
      );
    }
  }
}
 