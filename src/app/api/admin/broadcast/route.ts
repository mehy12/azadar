import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin safely
function initFirebaseAdmin() {
  if (getApps().length > 0) return true;

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    
    if (serviceAccountJson) {
      initializeApp({
        credential: cert(JSON.parse(serviceAccountJson)),
      });
      return true;
    } 

    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (privateKey && clientEmail && projectId) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return true;
    }
  } catch (error) {
    console.error('Firebase Admin init error:', error);
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const { title, body, url, pin } = await req.json();

    // Verify Admin PIN
    const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || '7860';
    if (pin !== correctPin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const isInitialized = initFirebaseAdmin();
    if (!isInitialized) {
      return NextResponse.json({ error: 'Firebase Admin not initialized. Check server environment variables (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).' }, { status: 500 });
    }

    // Connect to Supabase using Admin Key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all unique FCM tokens from reminders table
    const { data, error } = await supabase.from('reminders').select('fcm_token');
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ message: 'No devices found to send broadcast.' }, { status: 200 });
    }

    // Extract unique tokens
    const uniqueTokens = [...new Set(data.map(r => r.fcm_token).filter(Boolean))];

    if (uniqueTokens.length === 0) {
      return NextResponse.json({ message: 'No valid tokens found.' }, { status: 200 });
    }

    // Prepare message payload
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        url: url || '/',
      },
    };

    // Firebase Admin sendEachForMulticast accepts max 500 tokens at a time
    const CHUNK_SIZE = 500;
    let successCount = 0;
    let failureCount = 0;
    const failedTokens: string[] = [];
    const messaging = getMessaging();

    for (let i = 0; i < uniqueTokens.length; i += CHUNK_SIZE) {
      const chunk = uniqueTokens.slice(i, i + CHUNK_SIZE);
      const chunkMessage = {
        ...message,
        tokens: chunk,
      };

      const response = await messaging.sendEachForMulticast(chunkMessage);
      successCount += response.successCount;
      failureCount += response.failureCount;

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(chunk[idx]);
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully sent to ${successCount} devices. Failed: ${failureCount}`,
      metrics: {
        totalTargeted: uniqueTokens.length,
        successCount,
        failureCount
      }
    });

  } catch (error: any) {
    console.error('Broadcast Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
