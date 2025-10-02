/**
 * TypeScript Types for Acne Detection System
 */

// Detection Types
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Detection {
  bbox: BoundingBox;
  confidence: number;
  class: number;
  class_name: string;
}

export interface ImageSize {
  width: number;
  height: number;
}

export interface ModelInfo {
  name: string;
  version: string;
  classes: string[];
}

export interface DetectionResult {
  success: boolean;
  image_size: ImageSize;
  detections_count: number;
  detections: Detection[];
  model_info: ModelInfo;
  confidence_threshold: number;
}

// Analysis Types
export interface DetectionSummaryItem {
  id: number;
  type: string;
  confidence: string;
  location: string;
  size: string;
}

export interface DetectionSummary {
  total_detections: number;
  detections: DetectionSummaryItem[];
  severity: 'none' | 'mild' | 'moderate' | 'severe';
}

export interface AnalysisResult {
  success: boolean;
  analysis: string;
  detection_summary: DetectionSummary;
  model_used: string;
}

export interface AnalysisRequest {
  detections: Detection[];
  detections_count: number;
  image_size: ImageSize;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro';
}

// API Response Types
export interface ApiError {
  error: string;
  detail?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  model_loaded: boolean;
  device: string;
  error?: string;
}

export interface ModelInfoResponse {
  model_info: {
    classes: string[];
    created: string;
    framework: string;
    input_size: string;
    model_name: string;
    performance: string;
    size_mb: number;
    trained_on: string;
    type: string;
    usage: {
      input: string;
      load: string;
      output: string;
    };
    version: string;
  };
  device: string;
}

// UI State Types
export interface UploadState {
  file: File | null;
  previewUrl: string;
  isUploading: boolean;
}

export interface DetectionState {
  isDetecting: boolean;
  result: DetectionResult | null;
  error: string | null;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  result: AnalysisResult | null;
  error: string | null;
}
