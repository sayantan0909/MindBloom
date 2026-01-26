
// src/ai/inference/stressInference.ts

import { FeatureVector } from '../features/extractFeatures';
import { StressModel } from '../models/stress-model';

export type InferenceResult = {
    stressLevel: number; // 0-1
    confidence: number; // 0-1
    trend: 'increasing' | 'decreasing' | 'stable';
    bufferHealth: number; // 0-1
};

export type SignalStatus = 'Stable' | 'Minimal' | 'Active';

export type LiveSignals = {
    eye: SignalStatus;
    brow: SignalStatus;
    jaw: SignalStatus;
    head: SignalStatus;
};

export class StressInference {
    private model: StressModel;
    private featureBuffer: FeatureVector[] = [];
    private predictionBuffer: number[] = [];

    private readonly FEATURE_WINDOW = 30; // ~1 second at 30fps
    private readonly PREDICTION_WINDOW = 5; // Smooth over 5 predictions
    private readonly MIN_SAMPLES = 5; // Minimum before making predictions

    constructor(model: StressModel) {
        this.model = model;
    }

    /**
     * Add new features and get stress prediction
     */
    addFeatures(features: FeatureVector): InferenceResult {
        // Add to buffer
        this.featureBuffer.push(features);
        if (this.featureBuffer.length > this.FEATURE_WINDOW) {
            this.featureBuffer.shift();
        }

        // Need minimum samples for reliable prediction
        if (this.featureBuffer.length < this.MIN_SAMPLES) {
            return {
                stressLevel: 0.5,
                confidence: 0,
                trend: 'stable',
                bufferHealth: this.featureBuffer.length / this.MIN_SAMPLES,
            };
        }

        // Aggregate features over time window
        const aggregated = this.aggregateFeatures();

        // Get ML prediction
        const prediction = this.model.predict(aggregated);

        // Add to prediction buffer
        this.predictionBuffer.push(prediction);
        if (this.predictionBuffer.length > this.PREDICTION_WINDOW) {
            this.predictionBuffer.shift();
        }

        // Get smoothed prediction
        const smoothedPrediction = this.getSmoothedPrediction();

        // Calculate confidence based on buffer size and prediction stability
        const confidence = this.calculateConfidence();

        // Determine trend
        const trend = this.determineTrend();

        return {
            stressLevel: smoothedPrediction,
            confidence,
            trend,
            bufferHealth: 1.0,
        };
    }

    /**
     * Aggregate features over time window
     * Returns: [eyeAR_mean, blinkRate_sum, browTension_mean, jaw_mean, 
     *          mouth_mean, headStability_mean, microMovements_std]
     */
    private aggregateFeatures(): number[] {
        const features = this.featureBuffer;

        return [
            this.mean(features.map((f) => f.eyeAspectRatio)),
            this.sum(features.map((f) => f.blinkRate)), // Total blinks in window
            this.mean(features.map((f) => f.browTension)),
            this.mean(features.map((f) => f.jawOpenness)),
            this.mean(features.map((f) => f.mouthCornerDrop)),
            this.mean(features.map((f) => f.headStability)),
            this.std(features.map((f) => f.microMovements)), // Variability matters
        ];
    }

    /**
     * Get temporally smoothed prediction
     */
    private getSmoothedPrediction(): number {
        if (this.predictionBuffer.length === 0) return 0.5;

        // Weighted average: recent predictions matter more
        const weights = this.predictionBuffer.map((_, i) =>
            Math.exp(i / this.predictionBuffer.length)
        );
        const weightSum = weights.reduce((a, b) => a + b, 0);

        const smoothed = this.predictionBuffer.reduce(
            (sum, pred, i) => sum + (pred * weights[i]) / weightSum,
            0
        );

        return Math.max(0, Math.min(1, smoothed));
    }

    /**
     * Calculate confidence in prediction
     */
    private calculateConfidence(): number {
        // Confidence increases with buffer size
        const bufferConfidence =
            Math.min(this.featureBuffer.length / this.FEATURE_WINDOW, 1.0) * 0.5;

        // Confidence increases with prediction stability
        const predictionStability = this.predictionBuffer.length > 1
            ? 1 - this.std(this.predictionBuffer) * 2 // Low std = high confidence
            : 0;
        const stabilityConfidence = Math.max(0, Math.min(1, predictionStability)) * 0.5;

        return bufferConfidence + stabilityConfidence;
    }

    /**
     * Determine stress trend
     */
    private determineTrend(): 'increasing' | 'decreasing' | 'stable' {
        if (this.predictionBuffer.length < 3) return 'stable';

        const recent = this.predictionBuffer.slice(-3);
        const older = this.predictionBuffer.slice(-6, -3);

        if (older.length === 0) return 'stable';

        const recentAvg = this.mean(recent);
        const olderAvg = this.mean(older);

        const diff = recentAvg - olderAvg;

        if (diff > 0.1) return 'increasing';
        if (diff < -0.1) return 'decreasing';
        return 'stable';
    }

    /**
     * Get live signal statuses for UI
     */
    getLiveSignals(features: FeatureVector): LiveSignals {
        return {
            eye: this.getSignalStatus(features.browTension, 0.1, 0.25),
            brow: this.getSignalStatus(features.browTension, 0.08, 0.2),
            jaw: this.getSignalStatus(features.jawOpenness, 0.08, 0.2),
            head: this.getSignalStatus(1 - features.headStability, 0.05, 0.15),
        };
    }

    /**
     * Convert numeric value to signal status
     */
    private getSignalStatus(
        value: number,
        minimalThreshold: number,
        activeThreshold: number
    ): SignalStatus {
        if (value > activeThreshold) return 'Active';
        if (value > minimalThreshold) return 'Minimal';
        return 'Stable';
    }

    /**
     * Get metric breakdown for detailed display
     */
    getMetricBreakdown(): {
        eye: number;
        brow: number;
        jaw: number;
        head: number;
    } {
        if (this.featureBuffer.length === 0) {
            return { eye: 0, brow: 0, jaw: 0, head: 0 };
        }

        // Get recent features (last 10 frames)
        const recent = this.featureBuffer.slice(-10);

        return {
            eye: this.mean(recent.map((f) => f.eyeAspectRatio)) * 0.5 +
                this.mean(recent.map((f) => f.blinkRate)) / 60 * 0.5,
            brow: this.mean(recent.map((f) => f.browTension)),
            jaw: this.mean(recent.map((f) => f.jawOpenness)),
            head: 1 - this.mean(recent.map((f) => f.headStability)),
        };
    }

    /**
     * Reset all buffers
     */
    reset(): void {
        this.featureBuffer = [];
        this.predictionBuffer = [];
    }

    /**
     * Get buffer status for debugging
     */
    getBufferStatus() {
        return {
            featureBufferSize: this.featureBuffer.length,
            predictionBufferSize: this.predictionBuffer.length,
            isReady: this.featureBuffer.length >= this.MIN_SAMPLES,
        };
    }

    // ===== Utility Functions =====

    private mean(arr: number[]): number {
        if (arr.length === 0) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    private sum(arr: number[]): number {
        return arr.reduce((a, b) => a + b, 0);
    }

    private std(arr: number[]): number {
        if (arr.length === 0) return 0;
        const m = this.mean(arr);
        const variance =
            arr.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / arr.length;
        return Math.sqrt(variance);
    }

    /**
     * Get all recent features (for model training/calibration)
     */
    getRecentFeatures(): number[][] {
        return this.featureBuffer.map((f) => [
            f.eyeAspectRatio,
            f.blinkRate,
            f.browTension,
            f.jawOpenness,
            f.mouthCornerDrop,
            f.headStability,
            f.microMovements,
        ]);
    }
}
