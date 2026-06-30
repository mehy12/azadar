-- Create the reminders table
CREATE TABLE public.reminders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id text NOT NULL,
  fcm_token text NOT NULL,
  event_id text NOT NULL,
  venue_name text,
  starts_in text,
  venue_maps_link text,
  reminder_time timestamp with time zone NOT NULL,
  event_time timestamp with time zone NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_reminder UNIQUE (device_id, event_id, reminder_time)
);

-- Index for querying pending reminders efficiently
CREATE INDEX idx_reminders_status_time ON public.reminders(status, reminder_time);
CREATE INDEX idx_reminders_device_event ON public.reminders(device_id, event_id);

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Only allow insert if device_id matches the header
CREATE POLICY "Allow users to insert their own reminders" ON public.reminders
  FOR INSERT WITH CHECK (device_id = current_setting('request.headers', true)::json->>'x-device-id');

-- Only allow select if device_id matches the header
CREATE POLICY "Allow users to view their own reminders" ON public.reminders
  FOR SELECT USING (device_id = current_setting('request.headers', true)::json->>'x-device-id'); 

-- Only allow update if device_id matches the header
CREATE POLICY "Allow users to update their own reminders" ON public.reminders 
  FOR UPDATE USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');
