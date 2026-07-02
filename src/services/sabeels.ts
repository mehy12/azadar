import { supabase } from '@/lib/supabase';
import sabeelsJson from '@/data/doddaballapur_sabeels.json';
import { Sabeel } from '@/app/sabeels/doddaballapur/ClientSabeelPage';

export async function getSabeels(): Promise<Sabeel[]> {
  if (!supabase) {
    return sabeelsJson as any as Sabeel[];
  }

  try {
    const { data, error } = await supabase
      .from('sabeels')
      .select('*')
      .gte('sl_num', 0)
      .order('sl_num', { ascending: true });

    if (error) {
      console.error('Error fetching sabeels from Supabase, using local fallback:', error);
      return sabeelsJson as any as Sabeel[];
    }

    return (data || []) as Sabeel[];
  } catch (error) {
    console.error('Exception fetching sabeels from Supabase, using local fallback:', error);
    return sabeelsJson as any as Sabeel[];
  }
}

// Write helper for local fallback (runs server-side only)
async function readLocalSabeels(): Promise<Sabeel[]> {
  if (typeof window !== 'undefined') {
    return sabeelsJson as any as Sabeel[];
  }
  try {
    const fs = require('fs/promises');
    const path = require('path');
    const dataPath = path.join(process.cwd(), 'src', 'data', 'doddaballapur_sabeels.json');
    const raw = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return sabeelsJson as any as Sabeel[];
  }
}

async function writeLocalSabeels(sabeels: Sabeel[]): Promise<void> {
  if (typeof window !== 'undefined') return;
  try {
    const fs = require('fs/promises');
    const path = require('path');
    const dataPath = path.join(process.cwd(), 'src', 'data', 'doddaballapur_sabeels.json');
    await fs.writeFile(dataPath, JSON.stringify(sabeels, null, 2), 'utf-8');
  } catch (err: any) {
    console.error('Failed to write to local doddaballapur_sabeels.json:', err);
    if (err.code === 'EROFS' || err.message?.includes('read-only')) {
      throw new Error('Local database fallback is read-only in this hosting environment (e.g. Vercel). Please configure your Supabase environment variables.');
    }
    throw err;
  }
}

export async function createSabeel(sabeel: Sabeel): Promise<Sabeel[]> {
  if (!supabase) {
    const list = await readLocalSabeels();
    sabeel.id = crypto.randomUUID();
    list.push(sabeel);
    await writeLocalSabeels(list);
    return list;
  }

  const { error } = await supabase
    .from('sabeels')
    .insert([sabeel]);

  if (error) {
    throw new Error(error.message);
  }

  return getSabeels();
}

export async function updateSabeel(sabeel: Sabeel): Promise<Sabeel[]> {
  if (!supabase) {
    const list = await readLocalSabeels();
    const idx = list.findIndex(s => s.id === sabeel.id || s.sl_num === sabeel.sl_num);
    if (idx === -1) {
      throw new Error('Sabeel not found.');
    }
    list[idx] = sabeel;
    await writeLocalSabeels(list);
    return list;
  }

  const { error } = await supabase
    .from('sabeels')
    .update(sabeel)
    .eq(sabeel.id ? 'id' : 'sl_num', sabeel.id || sabeel.sl_num);

  if (error) {
    throw new Error(error.message);
  }

  return getSabeels();
}

export async function deleteSabeel(idOrSlNum: string | number): Promise<Sabeel[]> {
  if (!supabase) {
    const list = await readLocalSabeels();
    const filtered = list.filter(s => s.id !== idOrSlNum && s.sl_num !== idOrSlNum);
    if (filtered.length === list.length) {
      throw new Error('Sabeel not found.');
    }
    await writeLocalSabeels(filtered);
    return filtered;
  }

  const query = supabase.from('sabeels').delete();
  if (typeof idOrSlNum === 'number') {
    query.eq('sl_num', idOrSlNum);
  } else {
    query.eq('id', idOrSlNum);
  }

  const { error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return getSabeels();
}
