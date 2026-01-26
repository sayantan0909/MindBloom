
// src/ai/models/stress-model.ts

import * as tf from '@tensorflow/tfjs';

export type ModelMetrics = {
    accuracy: number;
    loss: number;
    predictions: number;
};

export class StressModel {
    private model: tf.LayersModel | null = null;
    private isInitialized = false;
    private scaler = {
        mean: [0.3, 5, 0.1, 0.1, 0, 0.8, 0.01], // Initial estimates
        std: [0.1, 3, 0.15, 0.15, 0.2, 0.2, 0.02],
    };
    private predictionCount = 0;

    /**
     * Initialize the model - load pre-trained or create new
     */
    async initialize(): Promise<void> {
        try {
            // Try loading pre-trained model from public folder
            this.model = await tf.loadLayersModel('/models/stress-model/model.json');
            console.log('✓ Loaded pre-trained stress model');
            this.isInitialized = true;
        } catch (error) {
            console.log('→ Pre-trained model not found, creating new model');
            this.model = this.createModel();
            this.isInitialized = true;
            console.log('✓ Created new stress detection model');
        }
    }

    /**
     * Create a new neural network model
     */
    private createModel(): tf.LayersModel {
        const model = tf.sequential();

        // Input layer: 7 features
        // [eyeAspectRatio, blinkRate, browTension, jawOpenness, 
        //  mouthCornerDrop, headStability, microMovements]
        model.add(
            tf.layers.dense({
                inputShape: [7],
                units: 16,
                activation: 'relu',
                kernelInitializer: 'glorotUniform',
                name: 'dense_input',
            })
        );

        // Dropout to prevent overfitting
        model.add(tf.layers.dropout({ rate: 0.3, name: 'dropout_1' }));

        // Hidden layer
        model.add(
            tf.layers.dense({
                units: 8,
                activation: 'relu',
                kernelInitializer: 'glorotUniform',
                name: 'dense_hidden',
            })
        );

        model.add(tf.layers.dropout({ rate: 0.2, name: 'dropout_2' }));

        // Output layer: single stress probability [0-1]
        model.add(
            tf.layers.dense({
                units: 1,
                activation: 'sigmoid',
                name: 'dense_output',
            })
        );

        // Compile model
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy'],
        });

        return model;
    }

    /**
     * Predict stress level from feature vector
     */
    /**
     * Predict stress level from feature vector
     */
    predict(features: number[]): number {
        if (!this.model || !this.isInitialized) {
            console.error('⚠️ Model not initialized, returning neutral value');
            return 0.5;
        }

        if (features.length !== 7) {
            console.error(`❌ Expected 7 features, got ${features.length}`, features);
            return 0.5;
        }

        return tf.tidy(() => {
            // Normalize features using z-score normalization
            const normalized = features.map(
                (f, i) => (f - this.scaler.mean[i]) / this.scaler.std[i]
            );

            // DEBUG: Log normalized features
            console.log('🔢 Normalized features:', normalized.map(n => n.toFixed(2)));

            // Create input tensor
            const input = tf.tensor2d([normalized], [1, 7]);

            // Get prediction
            const prediction = this.model!.predict(input) as tf.Tensor;
            const value = prediction.dataSync()[0];

            // DEBUG: Log raw prediction
            console.log('🎯 Raw model output:', value.toFixed(3));

            this.predictionCount++;

            // Clamp to [0, 1] range
            return Math.max(0, Math.min(1, value));
        });
    }

    /**
     * Batch prediction for multiple feature vectors
     */
    predictBatch(featuresArray: number[][]): number[] {
        if (!this.model || !this.isInitialized) {
            return featuresArray.map(() => 0.5);
        }

        return tf.tidy(() => {
            const normalized = featuresArray.map((features) =>
                features.map((f, i) => (f - this.scaler.mean[i]) / this.scaler.std[i])
            );

            const input = tf.tensor2d(normalized);
            const predictions = this.model!.predict(input) as tf.Tensor;
            const values = Array.from(predictions.dataSync());

            this.predictionCount += values.length;

            return values.map((v) => Math.max(0, Math.min(1, v)));
        });
    }

    /**
     * Train model on user feedback (for future improvement)
     */
    async trainOnFeedback(
        features: number[],
        label: number,
        epochs: number = 1
    ): Promise<void> {
        if (!this.model || !this.isInitialized) {
            console.warn('Cannot train: model not initialized');
            return;
        }

        const normalized = features.map(
            (f, i) => (f - this.scaler.mean[i]) / this.scaler.std[i]
        );

        const x = tf.tensor2d([normalized], [1, 7]);
        const y = tf.tensor2d([[label]], [1, 1]);

        try {
            await this.model.fit(x, y, {
                epochs,
                verbose: 0,
                shuffle: true,
            });
            console.log('✓ Model updated with feedback');
        } catch (error) {
            console.error('Training error:', error);
        } finally {
            x.dispose();
            y.dispose();
        }
    }

    /**
     * Update feature scaler from observed data (adaptive normalization)
     */
    updateScaler(featuresArray: number[][]): void {
        if (featuresArray.length === 0) return;

        // Calculate new mean and std for each feature
        for (let i = 0; i < 7; i++) {
            const values = featuresArray.map((f) => f[i]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance =
                values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
                values.length;
            const std = Math.sqrt(variance);

            // Exponential moving average for stability
            const alpha = 0.1;
            this.scaler.mean[i] = alpha * mean + (1 - alpha) * this.scaler.mean[i];
            this.scaler.std[i] = alpha * std + (1 - alpha) * this.scaler.std[i];

            // Prevent division by zero
            if (this.scaler.std[i] < 0.001) {
                this.scaler.std[i] = 1.0;
            }
        }
    }

    /**
     * Save model to browser storage or server
     */
    async saveModel(path: string = 'localstorage://stress-model'): Promise<void> {
        if (!this.model || !this.isInitialized) {
            console.warn('Cannot save: model not initialized');
            return;
        }

        try {
            await this.model.save(path);
            console.log(`✓ Model saved to ${path}`);
        } catch (error) {
            console.error('Save error:', error);
        }
    }

    /**
     * Load model from storage
     */
    async loadModel(path: string = 'localstorage://stress-model'): Promise<void> {
        try {
            this.model = await tf.loadLayersModel(path);
            this.isInitialized = true;
            console.log(`✓ Model loaded from ${path}`);
        } catch (error) {
            console.error('Load error:', error);
            throw error;
        }
    }

    /**
     * Get model metrics
     */
    getMetrics(): ModelMetrics {
        return {
            accuracy: 0, // Would need validation set
            loss: 0, // Would need validation set
            predictions: this.predictionCount,
        };
    }

    /**
     * Dispose of model and free memory
     */
    dispose(): void {
        if (this.model) {
            this.model.dispose();
            this.model = null;
            this.isInitialized = false;
            console.log('✓ Model disposed');
        }
    }

    /**
     * Check if model is ready
     */
    isReady(): boolean {
        return this.isInitialized && this.model !== null;
    }

    /**
     * Get model summary (for debugging)
     */
    getSummary(): string {
        if (!this.model) return 'Model not initialized';

        let summary = '';
        this.model.summary(undefined, undefined, (line: string) => {
            summary += line + '\n';
        });
        return summary;
    }
}
