const EmissionsTracker = require('./src/tracker');

/**
 * GreenCarbon - Node.js Carbon Emissions Tracking Library
 * 
 * A Node.js equivalent of Python's CodeCarbon library for tracking
 * carbon emissions from code execution.
 * 
 * Features:
 * - Hardware power consumption tracking (CPU, RAM, GPU)
 * - Location-based carbon intensity calculation
 * - CSV output compatible with CodeCarbon format
 * - Real-time monitoring with configurable intervals
 * - Support for manual overrides and configuration
 */

/**
 * Main EmissionsTracker class export
 */
module.exports = {
    EmissionsTracker,
    
    // Convenience factory function
    createTracker: (options = {}) => new EmissionsTracker(options),
    
    // Version info
    version: '1.0.0',
    
    // Utility functions
    utils: {
        /**
         * Decorator function for tracking emissions of async functions
         * @param {Object} options - Tracker options
         * @returns {Function} Decorator function
         */
        trackEmissions: (options = {}) => {
            return function(target, propertyKey, descriptor) {
                const originalMethod = descriptor.value;
                
                descriptor.value = async function(...args) {
                    const tracker = new EmissionsTracker({
                        projectName: options.projectName || `${target.constructor.name}_${propertyKey}`,
                        ...options
                    });
                    
                    await tracker.start();
                    
                    try {
                        const result = await originalMethod.apply(this, args);
                        const emissions = await tracker.stop();
                        
                        if (options.returnEmissions) {
                            return { result, emissions };
                        }
                        
                        return result;
                    } catch (error) {
                        await tracker.stop();
                        throw error;
                    }
                };
                
                return descriptor;
            };
        },
        
        /**
         * Wrapper function for tracking emissions of any function
         * @param {Function} fn - Function to track
         * @param {Object} options - Tracker options
         * @returns {Promise} Function result and emissions
         */
        withTracking: async (fn, options = {}) => {
            const tracker = new EmissionsTracker(options);
            
            await tracker.start();
            
            try {
                const result = await fn();
                const emissions = await tracker.stop();
                
                return { result, emissions };
            } catch (error) {
                await tracker.stop();
                throw error;
            }
        },
        
        /**
         * Get system hardware information without starting tracking
         * @returns {Promise<Object>} System information
         */
        getSystemInfo: async () => {
            const tracker = new EmissionsTracker();
            await tracker.initializeSystemInfo();
            return tracker.systemInfo;
        }
    }
};

// For CommonJS default export compatibility
module.exports.default = module.exports;
