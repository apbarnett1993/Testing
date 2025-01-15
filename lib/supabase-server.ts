import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server operations');
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export async function uploadFileServer(file: Blob, bucket: string = 'message-attachments') {
  const filename = 'name' in file ? (file as any).name : 'unnamed';
  const mimeType = file.type || 'application/octet-stream';
  const fileExt = filename.split('.').pop() || 'bin';
  
  const uniqueId = Math.random().toString(36).substring(2);
  const filePath = `${Date.now()}_${uniqueId}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabaseServer.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: mimeType
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabaseServer.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
    size: file.size,
    mimeType,
    filename
  };
} 