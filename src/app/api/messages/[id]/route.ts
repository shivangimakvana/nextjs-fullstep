import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Ensure DB is connected
    await dbConnect();

    // Validate ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid message ID' },
        { status: 400 }
      );
    }

    const result = await mongoose.connection.db.collection('users').updateOne(
      { "messages._id": new ObjectId(id) },
      { $pull: { messages: { _id: new ObjectId(id) } } }
    );

    if (result.modifiedCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Message deleted successfully.',
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Message not found' },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Server error', error: message },
      { status: 500 }
    );
  }
}
