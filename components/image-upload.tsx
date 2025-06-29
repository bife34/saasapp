'use client';

import { Camera, UploadCloud, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useRef, ChangeEvent, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      if (isCameraOpen && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          videoRef.current.srcObject = stream;
        } catch (err) {
          console.error('Error accessing camera: ', err);
          toast({
            variant: 'destructive',
            title: 'Camera Error',
            description:
              'Could not access camera. Please check permissions.',
          });
          setIsCameraOpen(false);
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOpen, toast]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(
          videoRef.current,
          0,
          0,
          canvas.width,
          canvas.height
        );
        const dataUri = canvas.toDataURL('image/jpeg');
        onChange(dataUri);
      }
      setIsCameraOpen(false);
    }
  };

  return (
    <>
      <div
        onClick={() => !value && fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg h-48 cursor-pointer text-muted-foreground hover:border-primary transition-colors',
          className
        )}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Upload preview"
              fill
              className="object-contain rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 z-10"
              onClick={handleRemoveImage}
            >
              <XCircle className="h-4 w-4" />
              <span className="sr-only">Remove image</span>
            </Button>
          </>
        ) : (
          <div className="text-center">
            <UploadCloud className="mx-auto h-12 w-12" />
            <p className="mt-2 text-sm">Click to upload or take a picture</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <UploadCloud className="mr-2 h-4 w-4" /> Select File
              </Button>
              {isMobile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCameraOpen(true);
                  }}
                >
                  <Camera className="mr-2 h-4 w-4" /> Take Picture
                </Button>
              )}
            </div>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take a Picture</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full aspect-video rounded-md bg-muted"
              autoPlay
              muted
              playsInline
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCameraOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCapture}>Capture Photo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
