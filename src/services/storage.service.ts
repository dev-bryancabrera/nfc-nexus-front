import { supabase } from '../lib/supabase';

export const storageService = {
  async uploadImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
      .from('card-assets')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`No se pudo subir la imagen: ${error.message}`);
    }

    const { data } = supabase.storage
      .from('card-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
