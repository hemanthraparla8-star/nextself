import { SKINCARE_ANALYSIS } from '../data/dummyData';
import { analyzeSkincareImage } from './aiApiClient';
import { analyzeSkincareWithFirebaseAi, shouldUseFirebaseAiLogic } from './firebaseAiLogicClient';

export async function analyzeSkincareScan({ imageUri } = {}) {
  if (imageUri) {
    try {
      if (shouldUseFirebaseAiLogic()) {
        return await analyzeSkincareWithFirebaseAi(imageUri);
      }

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
