/**
 * Acne Detection Page
 * Main page for acne detection feature
 */

import AcneDetection from '@/components/acne-detection';

export const metadata = {
  title: 'ตรวจจับสิว | Skin Vision AI',
  description: 'ตรวจจับและวิเคราะห์สิวด้วย AI YOLOv7 และรับคำแนะนำจาก LLM',
};

export default function AcneDetectionPage() {
  return <AcneDetection />;
}
