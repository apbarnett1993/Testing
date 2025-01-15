import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFile(file: Blob, bucket: string = 'message-attachments') {
  // Get file metadata
  const filename = 'name' in file ? (file as any).name : 'unnamed';
  const mimeType = file.type || 'application/octet-stream';
  const fileExt = filename.split('.').pop() || 'bin';
  
  // Generate unique file path
  const uniqueId = Math.random().toString(36).substring(2);
  const filePath = `${Date.now()}_${uniqueId}.${fileExt}`;

  // Convert Blob to Buffer for Supabase
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType: mimeType
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
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