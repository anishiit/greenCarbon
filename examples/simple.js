const GreenCarbon = require('../index');

/**
 * Simple usage example
 * Node.js equivalent of simple_demo.py
 */

async function simpleCpuIntensiveTask() {
    console.log('Starting CPU intensive task...');
    
    // Simple computation that uses CPU
    let total = 0;
    for (let i = 0; i < 1000000; i++) {
        total += i ** 2;
    }
    console.log(`Computation result: ${total}`);
    
    // Sleep for a bit to see the tracking
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('Task completed!');
}

async function main() {
    // Initialize the emissions tracker
    const tracker = new GreenCarbon.EmissionsTracker({
        projectName: 'simple_demo_nodejs',
        logLevel: 'INFO'
    });
    
    // Start tracking
    await tracker.start();
    console.log('📊 GreenCarbon emissions tracking started!');
    
    try {
        // Run our CPU intensive task
        await simpleCpuIntensiveTask();
    } finally {
        // Stop tracking and get emissions data
        const emissions = await tracker.stop();
        console.log(`\n🌱 Carbon emissions for this task: ${emissions.toFixed(6)} kg CO2`);
        console.log('📄 Detailed emissions data saved to emissions.csv');
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, simpleCpuIntensiveTask };
