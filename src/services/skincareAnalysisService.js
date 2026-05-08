import { SKINCARE_ANALYSIS } from '../data/dummyData';
import { analyzeSkincareImage } from './aiApiClient';

export async function analyzeSkincareScan({ imageUri } = {}) {
  if (imageUri) {
    try {
      return await analyzeSkincareImage(imageUri);
    } catch (_) {
      return {
        mode: 'mock-fallback',
        analyzedAt: new Date().toISOString(),
        result: SKINCARE_ANALYSIS,
      };
    }
  }

  return {
    mode: 'mock',
    analyzedAt: new Date().toISOString(),
    result: SKINCARE_ANALYSIS,
  };
}
