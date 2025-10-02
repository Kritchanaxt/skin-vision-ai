/**
 * Acne Detection Component
 * Allows users to upload images for acne detection and view results with LLM analysis
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Detection {
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  class: number;
  class_name: string;
}

interface DetectionResult {
  success: boolean;
  image_size: {
    width: number;
    height: number;
  };
  detections_count: number;
  detections: Detection[];
  model_info: {
    name: string;
    version: string;
    classes: string[];
  };
  confidence_threshold: number;
}

interface AnalysisResult {
  success: boolean;
  analysis: string;
  detection_summary: {
    total_detections: number;
    detections: any[];
    severity: string;
  };
  model_used: string;
}

export default function AcneDetection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('กรุณาเลือกไฟล์รูปภาพ');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setDetectionResult(null);
      setAnalysisResult(null);
    }
  };

  const handleDetect = async () => {
    if (!selectedFile) {
      setError('กรุณาเลือกรูปภาพก่อน');
      return;
    }

    setIsDetecting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('confidence_threshold', confidenceThreshold.toString());

      const response = await fetch('/api/detect-acne', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('การตรวจจับล้มเหลว');
      }

      const result: DetectionResult = await response.json();
      setDetectionResult(result);

      // Auto-analyze with LLM
      await handleAnalyze(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAnalyze = async (result: DetectionResult) => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-acne', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          detections: result.detections,
          detections_count: result.detections_count,
          image_size: result.image_size,
          model: 'gemini-pro',
        }),
      });

      if (!response.ok) {
        throw new Error('การวิเคราะห์ล้มเหลว');
      }

      const analysis: AnalysisResult = await response.json();
      setAnalysisResult(analysis);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการวิเคราะห์');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'none': return 'text-green-600';
      case 'mild': return 'text-yellow-600';
      case 'moderate': return 'text-orange-600';
      case 'severe': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'none': return 'ไม่พบสิว';
      case 'mild': return 'เล็กน้อย';
      case 'moderate': return 'ปานกลาง';
      case 'severe': return 'มาก';
      default: return 'ไม่ทราบ';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">ระบบตรวจจับสิวด้วย AI</h1>
        <p className="text-muted-foreground">
          อัพโหลดภาพใบหน้าเพื่อให้ระบบ YOLOv7 ตรวจจับสิวและรับคำแนะนำจาก AI
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>อัพโหลดรูปภาพ</CardTitle>
            <CardDescription>เลือกรูปภาพใบหน้าเพื่อตรวจจับสิว</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">รูปภาพ</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={isDetecting}
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence">
                ความมั่นใจขั้นต่ำ: {(confidenceThreshold * 100).toFixed(0)}%
              </Label>
              <Input
                id="confidence"
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                disabled={isDetecting}
              />
            </div>

            {previewUrl && (
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto"
                />
              </div>
            )}

            <Button
              onClick={handleDetect}
              disabled={!selectedFile || isDetecting}
              className="w-full"
              size="lg"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  กำลังตรวจจับ...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-5 w-5" />
                  ตรวจจับสิว
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>ผลการตรวจจับ</CardTitle>
            <CardDescription>รายละเอียดและสถิติการตรวจจับสิว</CardDescription>
          </CardHeader>
          <CardContent>
            {isDetecting ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : detectionResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">จำนวนสิว</p>
                    <p className="text-3xl font-bold">{detectionResult.detections_count}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">ความรุนแรง</p>
                    <p className={`text-3xl font-bold ${
                      analysisResult 
                        ? getSeverityColor(analysisResult.detection_summary.severity)
                        : 'text-gray-600'
                    }`}>
                      {analysisResult 
                        ? getSeverityText(analysisResult.detection_summary.severity)
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">โมเดล</p>
                  <p className="font-medium">{detectionResult.model_info.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {detectionResult.model_info.version}
                  </p>
                </div>

                {detectionResult.detections.length > 0 && (
                  <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                    <p className="text-sm font-medium mb-2">รายละเอียดการตรวจจับ:</p>
                    <div className="space-y-2">
                      {detectionResult.detections.map((det, idx) => (
                        <div key={idx} className="text-sm p-2 bg-background rounded">
                          <div className="flex justify-between">
                            <span className="font-medium">#{idx + 1} {det.class_name}</span>
                            <span className="text-muted-foreground">
                              {(det.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ตำแหน่ง: ({det.bbox.x.toFixed(0)}, {det.bbox.y.toFixed(0)})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>อัพโหลดและตรวจจับรูปภาพเพื่อดูผลลัพธ์</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Section */}
      {(isAnalyzing || analysisResult) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isAnalyzing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              การวิเคราะห์จาก AI
            </CardTitle>
            <CardDescription>
              คำแนะนำและข้อเสนอแนะในการดูแลผิวจากระบบ AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : analysisResult ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{analysisResult.analysis}</ReactMarkdown>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
