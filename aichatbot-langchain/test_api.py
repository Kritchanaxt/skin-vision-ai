"""
Test Script for Acne Detection API
Run this to verify the inference server is working correctly
"""

import requests
import json
from pathlib import Path

# Configuration
API_URL = "http://localhost:8000"
TEST_IMAGE = "test_image.jpg"  # Replace with your test image path

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{API_URL}/health")
        data = response.json()
        print(f"✅ Health check: {json.dumps(data, indent=2)}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_info():
    """Test model info endpoint"""
    print("\n🔍 Testing model info endpoint...")
    try:
        response = requests.get(f"{API_URL}/info")
        data = response.json()
        print(f"✅ Model info: {json.dumps(data, indent=2)}")
        return True
    except Exception as e:
        print(f"❌ Model info failed: {e}")
        return False

def test_detect(image_path):
    """Test detection endpoint"""
    print(f"\n🔍 Testing detection with image: {image_path}...")
    
    if not Path(image_path).exists():
        print(f"❌ Image not found: {image_path}")
        print("💡 Please provide a test image or update TEST_IMAGE variable")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            data = {'confidence_threshold': 0.25}
            response = requests.post(f"{API_URL}/detect", files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Detection successful!")
            print(f"   - Detections: {result['detections_count']}")
            print(f"   - Image size: {result['image_size']}")
            print(f"   - Model: {result['model_info']['name']}")
            
            if result['detections_count'] > 0:
                print(f"\n📊 Detection details:")
                for i, det in enumerate(result['detections'][:3]):  # Show first 3
                    print(f"   {i+1}. {det['class_name']} - "
                          f"Confidence: {det['confidence']:.2%} - "
                          f"Position: ({det['bbox']['x']:.0f}, {det['bbox']['y']:.0f})")
            return True
        else:
            print(f"❌ Detection failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Detection test failed: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 Acne Detection API Test Suite")
    print("=" * 60)
    
    results = {
        'health': test_health(),
        'info': test_info(),
        'detect': test_detect(TEST_IMAGE)
    }
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    all_passed = all(results.values())
    print("\n" + ("🎉 All tests passed!" if all_passed else "⚠️  Some tests failed"))
    print("=" * 60)
    
    return all_passed

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
