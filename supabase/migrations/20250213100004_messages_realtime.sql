-- Enable Realtime for the messages table
-- Required for real-time chat updates

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
