'use client';

type Message = {
  _id: string;
  text: string;
  name: string;
  content: string;
};

type Props = {
  message: Message;
  onMessageDelete: (id: string) => void;
};

const MessageCard = ({ message, onMessageDelete }: Props) => {
  return (
    <div className="p-4 border rounded shadow">
      <p>{message.text}</p>
      <h3 className="text-lg font-semibold">{message.name || 'Anonymous'}</h3>
          <p className="text-gray-700 mt-1">{message.content}</p>
          <p className="text-gray-700 mt-1">{message._id}</p>
      <button
        onClick={() => onMessageDelete(message._id)}
        className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
      >
        Delete
      </button>
    </div>
  );
};

export default MessageCard;
