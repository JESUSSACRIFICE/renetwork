// Mock storage implementation for testing without Supabase
// This allows testing the registration flows locally

export class MockStorage {
  private storage: Map<string, File[]> = new Map();

  async upload(
    bucket: string,
    path: string,
    file: File
  ): Promise<{ data: { path: string } | null; error: Error | null }> {
    try {
      if (!this.storage.has(bucket)) {
        this.storage.set(bucket, []);
      }

      const bucketFiles = this.storage.get(bucket)!;
      
      // Create a mock file entry
      const mockFile = file;
      bucketFiles.push(mockFile);

      // Store in localStorage for persistence
      const key = `mock_storage_${bucket}_${path}`;
      const fileData = await this.fileToBase64(file);
      localStorage.setItem(key, JSON.stringify({
        name: file.name,
        type: file.type,
        size: file.size,
        data: fileData,
        path,
        uploadedAt: new Date().toISOString(),
      }));

      return {
        data: { path },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    // Return a mock URL that can be used for display
    const key = `mock_storage_${bucket}_${path}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      return data.data; // Return base64 data URL
    }
    return `mock://${bucket}/${path}`;
  }

  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}

export const mockStorage = new MockStorage();

// Check if we're in mock mode (no Supabase configured)
export function isMockMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || 
         process.env.NEXT_PUBLIC_SUPABASE_URL === '' ||
         process.env.NEXT_PUBLIC_USE_MOCK_STORAGE === 'true';
}

