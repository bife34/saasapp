'use client';

import {
  AnalyzePoolPictureOutput,
  AnalyzeTestStripOutput,
} from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  TestTubeDiagonal,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useRef, useState } from 'react';

type AIAnalysisCardProps = {
  title: string;
  description: string;
  action: (input: any) => Promise<any>;
  inputKey: 'testStripDataUri' | 'poolPictureDataUri';
};

export function AIAnalysisCard({
  title,
  description,
  action,
  inputKey,
}: AIAnalysisCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<
    AnalyzeTestStripOutput | AnalyzePoolPictureOutput | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !preview) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await action({ [inputKey]: preview });
      setResult(analysisResult);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div
          className={cn(
            'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg h-full',
            { 'border-primary': !preview }
          )}
        >
          {preview ? (
            <div className="relative w-full h-48">
              <Image
                src={preview}
                alt="Preview"
                layout="fill"
                objectFit="contain"
                className="rounded-md"
              />
            </div>
          ) : (
            <div className="text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Drag & drop or click to upload an image
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                Select Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>
        {result && (
          <div className="mt-4 space-y-4 text-sm">
            {'chemicalLevels' in result ? (
              // Test Strip Result
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-green-500" />
                  Analysis Complete
                </h3>
                <ul className="mt-2 space-y-1 list-disc list-inside bg-muted/50 p-3 rounded-md">
                  <li>Chlorine: {result.chemicalLevels.chlorine}</li>
                  <li>pH: {result.chemicalLevels.ph}</li>
                  <li>Alkalinity: {result.chemicalLevels.alkalinity}</li>
                  <li>Cyanuric Acid: {result.chemicalLevels.cyanuricAcid}</li>
                </ul>
                <p className="mt-3 text-sm">{result.suggestions}</p>
              </div>
            ) : (
              // Pool Picture Result
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-green-500" />
                  Analysis Complete
                </h3>
                <div className="mt-2 space-y-2 bg-muted/50 p-3 rounded-md">
                  <p><strong>Water Clarity:</strong> {result.waterClarity}</p>
                  <p><strong>Surface Condition:</strong> {result.surfaceCondition}</p>
                </div>
                <p className="mt-3 text-sm">{result.recommendedActions}</p>
              </div>
            )}
          </div>
        )}
        {error && (
           <div className="mt-4 text-sm text-destructive flex items-start gap-2 bg-destructive/10 p-3 rounded-md">
            <AlertTriangle className="size-5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Analysis Failed</h3>
              <p>{error}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {preview && (
          <Button variant="outline" onClick={handleRemoveImage}>
            <XCircle className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
        <Button onClick={handleAnalyze} disabled={!file || isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <TestTubeDiagonal className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </CardFooter>
    </Card>
  );
}
