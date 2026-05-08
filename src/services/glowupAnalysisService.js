import { AI_FEEDBACK_RESPONSES } from '../data/dummyData';
import { analyzeGlowupImage } from './aiApiClient';
import { analyzeGlowupWithFirebaseAi, shouldUseFirebaseAiLogic } from './firebaseAiLogicClient';

export async function analyzeGlowupScan({ imageUri } = {}) {
  if (!imageUri) {
    return {
      mode: 'mock',
      analyzedAt: new Date().toISOString(),
      result: AI_FEEDBACK_RESPONSES,
    };
  }

  try {
    if (shouldUseFirebaseAiLogic()) {
      return await analyzeGlowupWithFirebaseAi(imageUri);
    }

    return await analyzeGlowupImage(imageUri);
  } catch (_) {
    return {
      mode: 'mock-fallback',
      analyzedAt: new Date().toISOString(),
      result: AI_FEEDBACK_RESPONSES,
    };
  }
}
