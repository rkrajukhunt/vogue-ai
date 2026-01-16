
export interface ImageFile {
  id: string;
  data: string; // base64
  mimeType: string;
  name: string;
}

export interface TryOnResult {
  clothingId: string;
  clothingName: string;
  imageUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}
