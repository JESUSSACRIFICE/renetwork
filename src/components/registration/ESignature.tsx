"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Pen, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ESignatureProps {
  onSignatureComplete?: (signature: {
    signatureData: string;
    namePrinted: string;
    nameSigned: string;
    signedAt: Date;
  }) => void;
  documentType: string;
  documentTitle: string;
  required?: boolean;
  className?: string;
}

export function ESignature({
  onSignatureComplete,
  documentType,
  documentTitle,
  required = true,
  className,
}: ESignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [namePrinted, setNamePrinted] = useState("");
  const [nameSigned, setNameSigned] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 200;

    // Set drawing style
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSignature(canvas.toDataURL());
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const handleSubmit = () => {
    if (!signature || !namePrinted || !nameSigned) {
      return;
    }

    onSignatureComplete?.({
      signatureData: signature,
      namePrinted,
      nameSigned,
      signedAt: new Date(),
    });
  };

  return (
    <Card className={cn("p-6 space-y-4", className)}>
      <div>
        <h3 className="font-semibold mb-2">{documentTitle}</h3>
        <p className="text-sm text-muted-foreground">
          Please read the document carefully, then sign below.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor={`name-printed-${documentType}`}>
            Name (Print) <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`name-printed-${documentType}`}
            value={namePrinted}
            onChange={(e) => setNamePrinted(e.target.value)}
            placeholder="Type your full name"
            className="mt-1"
            required={required}
          />
        </div>

        <div>
          <Label htmlFor={`name-signed-${documentType}`}>
            Name (Signature) <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`name-signed-${documentType}`}
            value={nameSigned}
            onChange={(e) => setNameSigned(e.target.value)}
            placeholder="Type your name as you would sign it"
            className="mt-1"
            required={required}
          />
        </div>

        <div>
          <Label>
            Signature <span className="text-destructive">*</span>
          </Label>
          <div className="mt-2 border-2 border-dashed rounded-lg p-4 bg-muted/30">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="border border-muted-foreground/20 rounded bg-white cursor-crosshair w-full"
              style={{ maxWidth: "100%", touchAction: "none" }}
            />
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSignature}
                disabled={!signature}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div>
            <strong>Time:</strong> {new Date().toLocaleTimeString()}
          </div>
          <div>
            <strong>Date:</strong> {new Date().toLocaleDateString()}
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!signature || !namePrinted || !nameSigned}
          className="w-full"
        >
          <Pen className="h-4 w-4 mr-2" />
          Sign Document
        </Button>
      </div>
    </Card>
  );
}

