// src/ai/models/stress-model.ts
// TensorFlow REMOVED.
// Compatibility stub for future OpenCV backend.

export type StressPrediction = {
    stressLevel: "low" | "medium" | "high";
    confidence: number;
};

export class StressModel {
    constructor() {
        // no-op
    }

    async initialize(): Promise<void> {
        // Placeholder for OpenCV backend init
        return;
    }

    async predict(_features: unknown): Promise<StressPrediction> {
        // Safe fallback so UI keeps working
        return {
            stressLevel: "low",
            confidence: 0,
        };
    }

    dispose() {
        // no-op
    }
}
