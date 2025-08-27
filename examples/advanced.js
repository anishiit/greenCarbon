const GreenCarbon = require('../index');

/**
 * Advanced usage examples and patterns
 */

// Example 1: Decorator pattern simulation
function trackEmissions(options = {}) {
    return function(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(...args) {
            const tracker = new GreenCarbon.EmissionsTracker({
                projectName: options.projectName || `${target.constructor.name}_${propertyKey}`,
                ...options
            });
            
            await tracker.start();
            
            try {
                const result = await originalMethod.apply(this, args);
                await tracker.stop();
                return result;
            } catch (error) {
                await tracker.stop();
                throw error;
            }
        };
        
        return descriptor;
    };
}

// Example 2: Class-based usage
class MLModel {
    constructor() {
        this.data = [];
    }
    
    // Simulated training method with emissions tracking
    async train(epochs = 10) {
        const tracker = new GreenCarbon.EmissionsTracker({
            projectName: 'ml_model_training',
            logLevel: 'INFO'
        });
        
        await tracker.start();
        
        try {
            for (let epoch = 0; epoch < epochs; epoch++) {
                console.log(`Training epoch ${epoch + 1}/${epochs}`);
                
                // Simulate training work
                for (let i = 0; i < 100000; i++) {
                    const value = Math.random() * Math.sin(i) + Math.cos(i);
                    this.data.push(value);
                }
                
                // Simulate epoch delay
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            const emissions = await tracker.stop();
            console.log(`🌱 Model training emissions: ${emissions.toFixed(6)} kg CO₂`);
            
            return {
                model: 'trained_model',
                epochs: epochs,
                emissions: emissions
            };
            
        } catch (error) {
            await tracker.stop();
            throw error;
        }
    }
    
    // Simulated inference method
    async predict(inputData) {
        const tracker = new GreenCarbon.EmissionsTracker({
            projectName: 'ml_model_inference',
            measurePowerSecs: 1 // More frequent measurements for short inference
        });
        
        await tracker.start();
        
        try {
            // Simulate inference computation
            const results = inputData.map(x => {
                return Math.tanh(x * 0.5 + Math.random() * 0.1);
            });
            
            const emissions = await tracker.stop();
            
            return {
                predictions: results,
                emissions: emissions
            };
            
        } catch (error) {
            await tracker.stop();
            throw error;
        }
    }
}

// Example 3: API endpoint simulation
class APIServer {
    constructor() {
        this.requestCount = 0;
        this.totalEmissions = 0;
    }
    
    async handleExpensiveRequest(requestData) {
        const tracker = new GreenCarbon.EmissionsTracker({
            projectName: 'api_expensive_endpoint',
            measurePowerSecs: 1
        });
        
        await tracker.start();
        
        try {
            // Simulate expensive computation
            let result = 0;
            for (let i = 0; i < 500000; i++) {
                result += Math.sqrt(i) * Math.log(i + 1);
            }
            
            // Simulate database operations
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const emissions = await tracker.stop();
            this.requestCount++;
            this.totalEmissions += emissions;
            
            console.log(`API request ${this.requestCount} - Emissions: ${emissions.toFixed(6)} kg CO₂`);
            
            return {
                success: true,
                result: result,
                emissions: emissions,
                requestId: this.requestCount
            };
            
        } catch (error) {
            await tracker.stop();
            throw error;
        }
    }
    
    getStats() {
        return {
            totalRequests: this.requestCount,
            totalEmissions: this.totalEmissions,
            averageEmissionsPerRequest: this.requestCount > 0 ? this.totalEmissions / this.requestCount : 0
        };
    }
}

// Example 4: Batch processing
class BatchProcessor {
    constructor() {
        this.tracker = null;
    }
    
    async startBatch(batchName) {
        this.tracker = new GreenCarbon.EmissionsTracker({
            projectName: `batch_${batchName}`,
            logLevel: 'INFO'
        });
        
        await this.tracker.start();
        console.log(`🚀 Started batch processing: ${batchName}`);
    }
    
    async processItem(item) {
        // Simulate item processing
        const complexity = item.complexity || 1;
        for (let i = 0; i < 10000 * complexity; i++) {
            Math.sqrt(i) * Math.sin(i);
        }
        
        return `processed_${item.id}`;
    }
    
    async endBatch() {
        if (!this.tracker) {
            throw new Error('No batch started');
        }
        
        const emissions = await this.tracker.stop();
        this.tracker = null;
        
        console.log(`🛑 Batch processing completed. Emissions: ${emissions.toFixed(6)} kg CO₂`);
        return emissions;
    }
}

// Demo function to run all examples
async function runAdvancedExamples() {
    console.log('🚀 GreenCarbon Advanced Usage Examples');
    console.log('='.repeat(50));
    
    // Example 1: ML Model Training
    console.log('\n🤖 Example 1: ML Model Training');
    console.log('-'.repeat(30));
    
    const model = new MLModel();
    const trainingResult = await model.train(5);
    console.log(`Training completed with ${trainingResult.emissions.toFixed(6)} kg CO₂`);
    
    // Example 2: ML Model Inference
    console.log('\n🔮 Example 2: ML Model Inference');
    console.log('-'.repeat(30));
    
    const testData = Array(100).fill(0).map(() => Math.random());
    const predictionResult = await model.predict(testData);
    console.log(`Inference completed with ${predictionResult.emissions.toFixed(6)} kg CO₂`);
    console.log(`Predictions: ${predictionResult.predictions.slice(0, 5).map(x => x.toFixed(3)).join(', ')}...`);
    
    // Example 3: API Server Simulation
    console.log('\n🌐 Example 3: API Server Simulation');
    console.log('-'.repeat(30));
    
    const apiServer = new APIServer();
    
    // Simulate multiple API requests
    for (let i = 0; i < 3; i++) {
        const response = await apiServer.handleExpensiveRequest({
            query: `test_query_${i}`,
            complexity: Math.random() * 2
        });
        console.log(`Request ${i + 1} result: ${response.result.toFixed(2)}`);
    }
    
    const apiStats = apiServer.getStats();
    console.log(`API Stats: ${apiStats.totalRequests} requests, ${apiStats.totalEmissions.toFixed(6)} kg CO₂ total`);
    console.log(`Average per request: ${apiStats.averageEmissionsPerRequest.toFixed(6)} kg CO₂`);
    
    // Example 4: Batch Processing
    console.log('\n📦 Example 4: Batch Processing');
    console.log('-'.repeat(30));
    
    const batchProcessor = new BatchProcessor();
    await batchProcessor.startBatch('data_processing_job');
    
    const batchItems = [
        { id: 1, complexity: 1 },
        { id: 2, complexity: 2 },
        { id: 3, complexity: 1.5 },
        { id: 4, complexity: 0.8 },
        { id: 5, complexity: 2.2 }
    ];
    
    const processedItems = [];
    for (const item of batchItems) {
        const result = await batchProcessor.processItem(item);
        processedItems.push(result);
        console.log(`Processed item ${item.id} (complexity: ${item.complexity})`);
    }
    
    const batchEmissions = await batchProcessor.endBatch();
    console.log(`Batch processing emissions: ${batchEmissions.toFixed(6)} kg CO₂`);
    
    // Example 5: Using utility wrapper
    console.log('\n🔧 Example 5: Utility Wrapper');
    console.log('-'.repeat(30));
    
    const { result, emissions } = await GreenCarbon.utils.withTracking(
        async () => {
            // Simulate some computation
            let sum = 0;
            for (let i = 0; i < 1000000; i++) {
                sum += Math.random();
            }
            return sum;
        },
        { projectName: 'utility_wrapper_demo' }
    );
    
    console.log(`Computation result: ${result.toFixed(2)}`);
    console.log(`Emissions: ${emissions.toFixed(6)} kg CO₂`);
    
    console.log('\n✅ All advanced examples completed!');
    console.log('📄 Check emissions.csv for comprehensive tracking data');
}

// Run if called directly
if (require.main === module) {
    runAdvancedExamples().catch(console.error);
}

module.exports = {
    MLModel,
    APIServer,
    BatchProcessor,
    runAdvancedExamples
};
