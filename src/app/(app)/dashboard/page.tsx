'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { Loader2, RefreshCcw } from 'lucide-react';

import MessageCard from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import type { Message } from '@/model/User';
import type { ApiResponse } from '@/types/ApiResponse';
import type { User } from 'next-auth';

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');

  const { toast } = useToast();
  const { data: session } = useSession();

  const form = useForm<{ acceptMessages: boolean }>({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      acceptMessages: false,
    },
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  // Fetch user's "accept messages" setting
  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const { data } = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', data.isAccesptingMessages ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message || 'Failed to fetch setting',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  // Fetch user messages
  const fetchMessages = useCallback(
    async (refresh = false) => {
      setIsLoading(true);
      try {
        const { data } = await axios.get<ApiResponse>('/api/get-messages');
        setMessages(data.messages || []);
        if (refresh) {
          toast({
            title: 'Refreshed',
            description: 'Showing latest messages.',
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: 'Error',
          description:
            axiosError.response?.data.message || 'Failed to load messages',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Toggle message acceptance
  const handleSwitchChange = async () => {
    const newValue = !acceptMessages;
    setIsSwitchLoading(true);
    try {
      const { data } = await axios.post<ApiResponse>(
        '/api/accept-messages',
        { acceptMessages: newValue }
      );
      setValue('acceptMessages', newValue);
      toast({
        title: data.message,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message || 'Failed to update setting',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        toast({
          title: 'Deleted',
          description: data.message || 'Message removed.',
        });
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to delete message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error)?.message || 'Unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Set profile URL
  useEffect(() => {
    if (session?.user) {
      const { username } = session.user as User;
      const baseUrl =
        typeof window !== 'undefined'
          ? `${window.location.protocol}//${window.location.host}`
          : '';
      setProfileUrl(`${baseUrl}/u/${username}`);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetchMessages();
      fetchAcceptMessages();
    }
  }, [session, fetchMessages, fetchAcceptMessages]);

  if (!session?.user) return null;

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      {/* Profile URL Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(profileUrl);
              toast({
                title: 'Copied!',
                description: 'Your profile URL has been copied.',
              });
            }}
          >
            Copy
          </Button>
        </div>
      </div>

      {/* Accept Messages Toggle */}
      <div className="mb-4 flex items-center">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2 text-sm font-medium">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
      </div>

      <Separator />

      {/* Refresh Button */}
      <Button
        className="mt-4"
        variant="outline"
        onClick={() => fetchMessages(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      {/* Messages List */}
  

    </div>
  );
}

export default UserDashboard;
