import arithmeticSequence from './arithmetic-sequence.js';
import derivativeExtrema from './derivative-extrema.js';
import sineCosineLaw from './sine-cosine-law.js';

export const LESSONS = [arithmeticSequence, derivativeExtrema, sineCosineLaw];
export const LESSON_BY_ID = Object.fromEntries(LESSONS.map(l => [l.id, l]));
