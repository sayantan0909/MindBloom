
// src/ai/features/extractFeatures.ts

export type FeatureVector = {
    eyeAspectRatio: number;
    blinkRate: number;
    browTension: number;
    jawOpenness: number;
    mouthCornerDrop: number;
    headStability: number;
    microMovements: number;
    timestamp: number;
};

export type Baseline = {
    ear: number;
    brow: number;
    jaw: number;
    mouthCorner: number;
    head: { x: number; y: number };
};

export class FeatureExtractor {
    private recentBlinks: number[] = [];
    private recentHeadPos: Array<{ x: number; y: number; timestamp: number }> = [];
    private previousLandmarks: any[] | null = null;
    private readonly BLINK_THRESHOLD = 0.2;
    private readonly BLINK_HISTORY_FRAMES = 60; // ~2 seconds at 30fps
    private readonly HEAD_HISTORY_FRAMES = 30; // ~1 second

    /**
     * Extract comprehensive facial features from MediaPipe landmarks
     */
    extract(landmarks: any[], baseline: Baseline): FeatureVector {
        const timestamp = Date.now();

        // 1. Eye Aspect Ratio (EAR) - Blink detection
        const earLeft = this.computeEAR(
            landmarks[386],
            landmarks[374],
            landmarks[362],
            landmarks[263]
        );
        const earRight = this.computeEAR(
            landmarks[159],
            landmarks[145],
            landmarks[33],
            landmarks[133]
        );
        const avgEAR = (earLeft + earRight) / 2;

        // 2. Blink Rate - Stress indicator
        this.recentBlinks.push(avgEAR < this.BLINK_THRESHOLD ? 1 : 0);
        if (this.recentBlinks.length > this.BLINK_HISTORY_FRAMES) {
            this.recentBlinks.shift();
        }
        const blinkRate = this.recentBlinks.reduce((a, b) => a + b, 0);

        // 3. Brow Tension - Forehead muscle tension
        const browDistLeft = Math.abs(landmarks[70].y - landmarks[159].y);
        const browDistRight = Math.abs(landmarks[300].y - landmarks[386].y);
        const avgBrowDist = (browDistLeft + browDistRight) / 2;
        const browTension = baseline.brow > 0.001
            ? Math.abs(avgBrowDist - baseline.brow) / baseline.brow
            : 0;

        // 4. Jaw Openness - Jaw clenching detection
        const jawOpen = Math.hypot(
            landmarks[13].x - landmarks[14].x,
            landmarks[13].y - landmarks[14].y
        );
        const jawOpenness = baseline.jaw > 0.001
            ? Math.abs(jawOpen - baseline.jaw) / baseline.jaw
            : 0;

        // 5. Mouth Corner Drop - Subtle stress indicator
        const leftCorner = landmarks[61];
        const rightCorner = landmarks[291];
        const mouthCenter = landmarks[13];
        const avgCornerY = (leftCorner.y + rightCorner.y) / 2;
        const cornerDrop = avgCornerY - mouthCenter.y;
        const mouthCornerDrop = baseline.mouthCorner !== 0
            ? (cornerDrop - baseline.mouthCorner) / Math.abs(baseline.mouthCorner)
            : 0;

        // 6. Head Stability - Rapid movements indicate stress
        const currentHead = { x: landmarks[1].x, y: landmarks[1].y, timestamp };
        this.recentHeadPos.push(currentHead);
        if (this.recentHeadPos.length > this.HEAD_HISTORY_FRAMES) {
            this.recentHeadPos.shift();
        }

        const headMovements = this.recentHeadPos.map((pos) =>
            Math.hypot(pos.x - baseline.head.x, pos.y - baseline.head.y)
        );
        const headVariance = this.computeVariance(headMovements);
        const headStability = 1 - Math.min(headVariance * 100, 1);

        // 7. Micro-movements - Small rapid changes
        const microMovements = this.computeMicroMovements(landmarks);

        // Update previous landmarks
        this.previousLandmarks = landmarks;

        return {
            eyeAspectRatio: avgEAR,
            blinkRate,
            browTension,
            jawOpenness,
            mouthCornerDrop,
            headStability,
            microMovements,
            timestamp,
        };
    }

    /**
     * Compute Eye Aspect Ratio for blink detection
     */
    private computeEAR(
        p1: { x: number; y: number },
        p2: { x: number; y: number },
        p3: { x: number; y: number },
        p4: { x: number; y: number }
    ): number {
        const vertical = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const horizontal = Math.hypot(p3.x - p4.x, p3.y - p4.y);
        return horizontal > 0.001 ? vertical / horizontal : 0;
    }

    /**
     * Compute variance of an array
     */
    private computeVariance(values: number[]): number {
        if (values.length === 0) return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }

    /**
     * Detect small rapid movements in key facial points
     */
    private computeMicroMovements(landmarks: any[]): number {
        if (!this.previousLandmarks) return 0;

        const keyPoints = [70, 300, 13, 14, 1]; // brows, jaw, nose
        let totalMovement = 0;

        for (const idx of keyPoints) {
            const current = landmarks[idx];
            const previous = this.previousLandmarks[idx];
            const movement = Math.hypot(
                current.x - previous.x,
                current.y - previous.y
            );
            totalMovement += movement;
        }

        return totalMovement / keyPoints.length;
    }

    /**
     * Reset all temporal buffers
     */
    reset(): void {
        this.recentBlinks = [];
        this.recentHeadPos = [];
        this.previousLandmarks = null;
    }

    /**
     * Get current buffer status (for debugging)
     */
    getBufferStatus() {
        return {
            blinkBufferSize: this.recentBlinks.length,
            headBufferSize: this.recentHeadPos.length,
            hasPreviousFrame: !!this.previousLandmarks,
        };
    }
}
