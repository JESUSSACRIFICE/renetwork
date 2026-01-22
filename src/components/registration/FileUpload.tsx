"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { Upload, X, File, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
// Removed mock storage - always use Supabase

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

  // Notify parent component when files are uploaded (only files with URLs)
  useEffect(() => {
    const completedFiles = uploadedFiles.filter((f) => f.url && !f.uploading);
    if (completedFiles.length > 0 || uploadedFiles.length === 0) {
      onFilesChange?.(completedFiles);
    }
  }, [uploadedFiles, onFilesChange]);

  const uploadFile = async (file: File): Promise<string> => {
    // Always use Supabase Storage - no mock mode fallback
    const supabaseUrl = typeof window !== "undefined" 
      ? (window as any).__ENV__?.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (!supabaseUrl || supabaseUrl === '') {
      throw new Error("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your environment variables.");
    }

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      
      if (authError || !user) {
        const errorMsg = authError?.message || "Not authenticated. Please sign in to upload files.";
        console.error("[SUPABASE] Authentication error:", errorMsg);
        throw new Error(errorMsg);
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${folder ? `${folder}/` : ""}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Check if bucket exists by trying to list it (this will fail if bucket doesn't exist)
      const { data: bucketData, error: bucketError } = await supabase.storage.from(bucket).list('', {
        limit: 1,
      });

      if (bucketError) {
        // Check if it's a "not found" error
        const errorMessage = bucketError.message || "";
        const isNotFound = errorMessage.includes("not found") || 
                          errorMessage.includes("Bucket not found") ||
                          errorMessage.toLowerCase().includes("does not exist");
        
        if (isNotFound) {
          const errorMsg = `Storage bucket "${bucket}" does not exist. Please create it in your Supabase dashboard:\n\n1. Go to Supabase Dashboard > Storage\n2. Click "New bucket"\n3. Name it "${bucket}"\n4. Set it as private\n5. Create the bucket\n\nOr run this SQL in Supabase SQL Editor:\n\nINSERT INTO storage.buckets (id, name, public)\nVALUES ('${bucket}', '${bucket}', false)\nON CONFLICT (id) DO NOTHING;`;
          console.error(`[SUPABASE] Bucket "${bucket}" does not exist.`, errorMsg);
          throw new Error(`Storage bucket "${bucket}" not found. Please create it in Supabase dashboard (Storage > New bucket).`);
        }
        // If it's a different error, let it fall through to the upload attempt
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // Provide more detailed error messages
        const errorMsg = uploadError.message || "";
        let errorMessage = errorMsg;
        if (errorMsg.includes("new row violates row-level security") || 
            errorMsg.includes("permission denied") ||
            errorMsg.includes("Row Level Security")) {
          errorMessage = "Permission denied. Please check your storage bucket RLS policies. Users need INSERT permission on the 'documents' bucket.";
        } else if (errorMsg.includes("Bucket not found") || 
                   errorMsg.includes("not found") ||
                   errorMsg.toLowerCase().includes("does not exist")) {
          errorMessage = `Storage bucket "${bucket}" not found. Please create it in Supabase dashboard:\n\n1. Go to Supabase Dashboard > Storage\n2. Click "New bucket"\n3. Name it "${bucket}"\n4. Set it as private\n5. Create the bucket`;
        } else if (errorMsg.includes("The resource already exists")) {
          errorMessage = "A file with this name already exists. Please try again.";
        } else if (errorMsg.includes("File size exceeds")) {
          errorMessage = `File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`;
        }
        console.error("[SUPABASE] Upload error:", uploadError);
        throw new Error(errorMessage);
      }

      if (!uploadData) {
        throw new Error("Upload failed: No data returned from storage");
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error("Failed to get public URL for uploaded file");
      }

      console.log("[SUPABASE] File uploaded successfully:", publicUrl);
      return publicUrl;
    } catch (error: any) {
      console.error("[SUPABASE] Upload error:", error);
      throw error;
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
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
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

