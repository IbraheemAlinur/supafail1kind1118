import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useMemoizedCallback } from './useMemoizedCallback';
import { supabase } from '../lib/supabase/client';
import type { Database } from '../lib/supabase/types';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageThread = Database['public']['Tables']['message_threads']['Row'];

export function useMessages(threadId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const user = useStore(state => state.user);

  const fetchMessages = useMemoizedCallback(async () => {
    if (!threadId || !user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(
            id,
            name,
            avatar_url
          ),
          recipient:users!messages_recipient_id_fkey(
            id,
            name,
            avatar_url
          )
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setMessages(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch messages';
      setError(message);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [threadId, user]);

  const fetchThreads = useMemoizedCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: threadsError } = await supabase
        .from('message_threads')
        .select(`
          *,
          participants:users!message_threads_participant_ids_fkey(
            id,
            name,
            avatar_url
          )
        `)
        .contains('participant_ids', [user.id])
        .order('updated_at', { ascending: false });

      if (threadsError) throw threadsError;

      setThreads(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch threads';
      setError(message);
      console.error('Error fetching threads:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const sendMessage = useMemoizedCallback(async (content: string, recipientId: string, threadId?: string) => {
    if (!user) throw new Error('Must be logged in to send messages');

    try {
      setError(null);

      let messageThreadId = threadId;

      // Create new thread if none exists
      if (!messageThreadId) {
        const { data: threadData, error: threadError } = await supabase
          .from('message_threads')
          .insert([{
            participant_ids: [user.id, recipientId]
          }])
          .select()
          .single();

        if (threadError) throw threadError;
        messageThreadId = threadData.id;
      }

      // Send message
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{
          thread_id: messageThreadId,
          content,
          sender_id: user.id,
          recipient_id: recipientId
        }]);

      if (messageError) throw messageError;

      await Promise.all([fetchMessages(), fetchThreads()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send message';
      setError(message);
      console.error('Error sending message:', err);
      throw err;
    }
  }, [user, fetchMessages, fetchThreads]);

  return {
    messages,
    threads,
    loading,
    error,
    fetchMessages,
    fetchThreads,
    sendMessage
  };
}