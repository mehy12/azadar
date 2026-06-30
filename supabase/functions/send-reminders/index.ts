import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";
// Import googleapis for FCM v1
import { JWT } from "https://esm.sh/google-auth-library@8.7.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FIREBASE_CLIENT_EMAIL = Deno.env.get("FIREBASE_CLIENT_EMAIL")!;
const FIREBASE_PRIVATE_KEY = Deno.env.get("FIREBASE_PRIVATE_KEY")!.replace(/\\n/g, '\n');
const FIREBASE_PROJECT_ID = Deno.env.get("FIREBASE_PROJECT_ID")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const getAccessToken = async () => {
  const jwtClient = new JWT({
    email: FIREBASE_CLIENT_EMAIL,
    key: FIREBASE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const tokens = await jwtClient.authorize();
  return tokens.access_token;
};

serve(async (req) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Join with events to get slug if we have one in the future, fallback to event_id
    const { data: reminders, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("status", "pending")
      .lte("reminder_time", now.toISOString())
      .gte("reminder_time", oneHourAgo.toISOString());

    if (error) throw error;

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: "No pending reminders." }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken();

    // Process in chunks of 50 to avoid connection limits and FCM rate limits
    const CHUNK_SIZE = 50;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < reminders.length; i += CHUNK_SIZE) {
      const chunk = reminders.slice(i, i + CHUNK_SIZE);
      
      const chunkPromises = chunk.map(async (reminder) => {
        const message = {
          message: {
            token: reminder.fcm_token,
            notification: {
              title: "Majlis Starting Soon",
              body: reminder.venue_name && reminder.starts_in ? 
                `${reminder.venue_name}\nStarts in ${reminder.starts_in}` : 
                `Your scheduled Majlis is starting soon.`,
            },
            data: {
              eventId: reminder.event_id,
              url: `/events/${reminder.event_id}`, 
              venueMapsLink: reminder.venue_maps_link || '',
            },
          },
        };

        try {
          const response = await fetch(
            `https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify(message),
            }
          );

          if (response.ok) {
            await supabase.from("reminders").update({ status: "sent" }).eq("id", reminder.id);
            successCount++;
          } else {
            const resText = await response.text();
            console.error(`Failed to send to ${reminder.fcm_token}:`, resText);
            
            if (response.status >= 500 || response.status === 429) {
              console.log("Will retry later for", reminder.id);
            } else {
              await supabase.from("reminders").update({ status: "cancelled" }).eq("id", reminder.id);
            }
            failureCount++;
          }
        } catch (err) {
          console.error("Network error sending push:", err);
          failureCount++;
        }
      });

      // Wait for the chunk to finish before proceeding to the next
      await Promise.all(chunkPromises);
      
      // Optional: add a small delay between chunks if necessary
      // await new Promise(r => setTimeout(r, 100));
    }

    return new Response(JSON.stringify({ 
      message: `Processed ${reminders.length} reminders.`, 
      success: successCount, 
      failures: failureCount 
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
