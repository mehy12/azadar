import { supabase } from '@/lib/supabase';
import configJson from '@/data/config.json';

export interface AppConfig {
  moharram1: string;
}

export async function getConfig(): Promise<AppConfig> {
  if (!supabase) {
    return configJson as AppConfig;
  }

  try {
    // Attempt to load from 'config' key
    const { data: configRecord, error: configError } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'config')
      .single();

    if (!configError && configRecord && configRecord.value) {
      return configRecord.value as AppConfig;
    }

    // Try individual key 'moharram1' fallback
    const { data: keyRecord, error: keyError } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'moharram1')
      .single();

    if (!keyError && keyRecord && keyRecord.value) {
      if (typeof keyRecord.value === 'string') {
        return { moharram1: keyRecord.value };
      }
      if (typeof keyRecord.value === 'object' && 'moharram1' in keyRecord.value) {
        return keyRecord.value as AppConfig;
      }
    }

    return configJson as AppConfig;
  } catch (error) {
    console.error('Error fetching config from Supabase, using local fallback:', error);
    return configJson as AppConfig;
  }
}
