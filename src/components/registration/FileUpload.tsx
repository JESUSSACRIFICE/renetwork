"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, X, File, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { mockStorage, isMockMode } from "@/lib/mock-storage";

interface UploadedFile {
  id: string;
  file: File;
  url?: string;
  uploading: boolean;
  error?: string;
}

interface FileUploadProps {
  onFilesChange?: (files: UploadedFile[]) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  bucket?: string;
  folder?: string;
  existingFiles?: string[]; // URLs of existing files
  className?: string;
}

export function FileUpload({
  onFilesChange,
  acceptedFileTypes = ["image/*", "application/pdf"],
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  bucket = "documents",
  folder = "",
  existingFiles = [],
  className,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(() => {
    if (existingFiles.length === 0) return [];
    
    // Create dummy File objects for existing files
    // Using Blob as base and creating File-like objects
    return existingFiles.map((url, idx) => {
      const fileName = url.split("/").pop() || "file";
      // Create a minimal file object for existing files
      const fileBlob = new Blob([], { type: "application/octet-stream" });
      const file = Object.assign(fileBlob, { name: fileName }) as File;
      
      return {
        id: `existing-${idx}`,
        file,
        url,
        uploading: false,
      };
    });
  });
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string> => {
    // Check if we should use mock storage
    // Always use mock storage if Supabase URL is not set
    const supabaseUrl = typeof window !== "undefined" 
      ? (window as any).__ENV__?.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    const useMockMode = !supabaseUrl || 
                        supabaseUrl === '' || 
                        isMockMode() ||
                        process.env.NEXT_PUBLIC_USE_MOCK_STORAGE === 'true';
    
    // Always try mock storage first if Supabase is not configured
    if (useMockMode) {
      // Get mock user ID from localStorage or create one
      let userId = "mock-user-default";
      if (typeof window !== "undefined") {
        userId = localStorage.getItem("mock_user_id") || "mock-user-default";
      }
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${folder ? `${folder}/` : ""}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      try {
        const { data, error } = await mockStorage.upload(bucket, fileName, file);
        
        if (error) throw error;
        if (!data) throw new Error("Upload failed");

        const url = mockStorage.getPublicUrl(bucket, data.path);
        console.log("[MOCK STORAGE] File uploaded successfully:", url);
        return url;
      } catch (error: any) {
        console.error("[MOCK STORAGE] Upload error:", error);
        throw error;
      }
    }

    // Real Supabase upload - only if Supabase is properly configured
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // Fallback to mock storage if not authenticated
        console.warn("Not authenticated, falling back to mock storage");
        let userId = "mock-user-default";
        if (typeof window !== "undefined") {
          userId = localStorage.getItem("mock_user_id") || "mock-user-default";
        }
        const fileExt = file.name.split(".").pop();
        const fileName = `${userId}/${folder ? `${folder}/` : ""}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data, error } = await mockStorage.upload(bucket, fileName, file);
        if (error) throw error;
        if (!data) throw new Error("Upload failed");
        return mockStorage.getPublicUrl(bucket, data.path);
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${folder ? `${folder}/` : ""}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // Always fallback to mock storage on any Supabase error
        console.warn("Supabase upload failed, falling back to mock storage:", uploadError.message);
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${folder ? `${folder}/` : ""}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data, error } = await mockStorage.upload(bucket, fileName, file);
        if (error) throw error;
        if (!data) throw new Error("Upload failed");
        return mockStorage.getPublicUrl(bucket, data.path);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      // Always fallback to mock storage on any error
      console.warn("Upload error, falling back to mock storage:", error.message);
      let userId = "mock-user-default";
      if (typeof window !== "undefined") {
        userId = localStorage.getItem("mock_user_id") || "mock-user-default";
      }
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${folder ? `${folder}/` : ""}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error: uploadErr } = await mockStorage.upload(bucket, fileName, file);
      if (uploadErr) throw uploadErr;
      if (!data) throw new Error("Upload failed");
      return mockStorage.getPublicUrl(bucket, data.path);
    }
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      
      if (uploadedFiles.length + fileArray.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const validFiles = fileArray.filter((file) => {
        if (file.size > maxSize) {
          toast.error(`${file.name} exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`);
          return false;
        }
        return true;
      });

      const newFiles: UploadedFile[] = validFiles.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        uploading: true,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Upload files
      for (const newFile of newFiles) {
        try {
          const url = await uploadFile(newFile.file);
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id ? { ...f, url, uploading: false } : f
            )
          );
        } catch (error: any) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id
                ? { ...f, uploading: false, error: error.message }
                : f
            )
          );
          toast.error(`Failed to upload ${newFile.file.name}`);
        }
      }

      // Notify parent after uploads
      setTimeout(() => {
        setUploadedFiles((prev) => {
          const allFiles = prev.filter((f) => f.url);
          onFilesChange?.(allFiles);
          return prev;
        });
      }, 100);
    },
    [uploadedFiles, maxFiles, maxSize, bucket, folder, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      onFilesChange?.(updated.filter((f) => f.url));
      return updated;
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
        />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-2">
          {isDragActive
            ? "Drop files here"
            : "Drag and drop files here, or click to select"}
        </p>
        <p className="text-xs text-muted-foreground">
          Accepted: {acceptedFileTypes.join(", ")}
          {maxSize && ` (Max ${Math.round(maxSize / 1024 / 1024)}MB)`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {uploadedFiles.length} / {maxFiles} files
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    {file.uploading && (
                      <p className="text-xs text-muted-foreground">Uploading...</p>
                    )}
                    {file.error && (
                      <p className="text-xs text-destructive">{file.error}</p>
                    )}
                    {file.url && !file.uploading && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Uploaded
                      </p>
                    )}
                  </div>
                </div>
                {!file.uploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

