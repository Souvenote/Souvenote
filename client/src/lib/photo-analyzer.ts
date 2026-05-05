export interface PhotoAnalysis {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  faceCount: number;
}

export async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

export async function analyzePhoto(file: File): Promise<PhotoAnalysis> {
  const dims = await getImageDimensions(file);
  const orientation: 'portrait' | 'landscape' =
    dims.width > dims.height ? 'landscape' : 'portrait';

  return {
    width: dims.width,
    height: dims.height,
    orientation,
    faceCount: 0,
  };
}

export function aspectRatioFromOrientation(
  orientation: 'portrait' | 'landscape',
): string {
  return orientation === 'landscape' ? '7:5' : '5:7';
}
