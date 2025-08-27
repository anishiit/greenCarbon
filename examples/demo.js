const GreenCarbon = require('../index');


// CPU-intensive functions for testing
function fibonacciRecursive(n) {
    if (n <= 1) return n;
    return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

function matrixOperations() {
    console.log('  → Creating large matrices...');
    const size = 500; // Smaller than Python version for Node.js performance
    
    // Create matrices
    const matrixA = Array(size).fill(0).map(() => 
        Array(size).fill(0).map(() => Math.random())
    );
    const matrixB = Array(size).fill(0).map(() => 
        Array(size).fill(0).map(() => Math.random())
    );
    
    console.log('  → Performing matrix multiplication...');
    // Simple matrix multiplication
    const result = Array(size).fill(0).map(() => Array(size).fill(0));
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            for (let k = 0; k < size; k++) {
                result[i][j] += matrixA[i][k] * matrixB[k][j];
            }
        }
    }
    
    // Calculate sum
    let sum = 0;
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            sum += result[i][j];
        }
    }
    
    return sum;
}

function cpuIntensiveTask() {
    console.log('  → Computing prime numbers...');
    const primes = [];
    for (let num = 2; num < 10000; num++) {
        let isPrime = true;
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            primes.push(num);
        }
    }
    return primes.length;
}

// Sorting algorithms for comparison
function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

function quickSort(arr) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    
    return [...quickSort(left), ...middle, ...quickSort(right)];
}

async function runDemos() {
    console.log('🚀 GreenCarbon Node.js Demo - Comprehensive Testing');
    console.log('='.repeat(60));
    
    // Demo 1: Basic Usage
    console.log('\n🎯 Demo 1: Basic EmissionsTracker Usage');
    console.log('='.repeat(50));
    
    const tracker1 = new GreenCarbon.EmissionsTracker({
        projectName: 'basic_demo_nodejs',
        measurePowerSecs: 5,
        logLevel: 'INFO'
    });
    
    await tracker1.start();
    console.log('Started tracking emissions...');
    
    const primeCount = cpuIntensiveTask();
    console.log(`Found ${primeCount} prime numbers`);
    
    const emissions1 = await tracker1.stop();
    console.log(`💚 Emissions from prime calculation: ${emissions1.toFixed(6)} kg CO₂`);
    
    // Demo 2: Using Utility Wrapper
    console.log('\n🔄 Demo 2: Using withTracking Utility');
    console.log('='.repeat(50));
    
    const { result: matrixResult, emissions: emissions2 } = await GreenCarbon.utils.withTracking(
        () => {
            console.log('Running matrix operations...');
            return matrixOperations();
        },
        { projectName: 'matrix_demo_nodejs' }
    );
    
    console.log(`Matrix sum: ${matrixResult.toFixed(2)}`);
    console.log(`💚 Emissions from matrix operations: ${emissions2.toFixed(6)} kg CO₂`);
    
    // Demo 3: Algorithm Comparison
    console.log('\n⚡ Demo 3: Comparing Algorithm Efficiency');
    console.log('='.repeat(50));
    
    const algorithms = {
        'bubble_sort': (arr) => bubbleSort([...arr]),
        'quick_sort': (arr) => quickSort([...arr]),
        'native_sort': (arr) => [...arr].sort((a, b) => a - b)
    };
    
    // Create test data (smaller than Python version)
    const testData = Array(1000).fill(0).map(() => Math.floor(Math.random() * 1000));
    const results = {};
    
    for (const [name, algorithm] of Object.entries(algorithms)) {
        console.log(`Testing ${name}...`);
        
        const tracker = new GreenCarbon.EmissionsTracker({
            projectName: `sort_${name}_nodejs`
        });
        
        const startTime = Date.now();
        await tracker.start();
        
        const sortedResult = algorithm(testData);
        
        const endTime = Date.now();
        const emissions = await tracker.stop();
        const duration = (endTime - startTime) / 1000;
        
        results[name] = {
            time: duration,
            emissions: emissions,
            efficiency: emissions / duration
        };
        
        console.log(`  ⏱️  Time: ${results[name].time.toFixed(3)}s`);
        console.log(`  🌱 Emissions: ${results[name].emissions.toFixed(6)} kg CO₂`);
        console.log(`  ⚡ Efficiency: ${results[name].efficiency.toFixed(8)} kg CO₂/s`);
        console.log();
    }
    
    // Display comparison
    console.log('📊 Algorithm Comparison Summary:');
    console.log('-'.repeat(50));
    const sortedByEmissions = Object.entries(results)
        .sort(([,a], [,b]) => a.emissions - b.emissions);
    
    const medals = ['🥇', '🥈', '🥉'];
    sortedByEmissions.forEach(([name, data], i) => {
        const medal = medals[i] || '🏅';
        console.log(`${medal} ${name.toUpperCase().padEnd(12)} | ${data.emissions.toFixed(6)} kg CO₂ | ${data.time.toFixed(3)}s`);
    });
    
    // Demo 4: Continuous Monitoring
    console.log('\n⏰ Demo 4: Continuous Monitoring');
    console.log('='.repeat(50));
    
    const continuousTracker = new GreenCarbon.EmissionsTracker({
        projectName: 'continuous_monitoring_nodejs',
        measurePowerSecs: 2,
        logLevel: 'INFO'
    });
    
    await continuousTracker.start();
    console.log('Starting 10-second continuous monitoring...');
    
    // Simulate varying workload
    for (let i = 0; i < 5; i++) {
        console.log(`Work iteration ${i + 1}/5...`);
        
        // Simulate work with varying intensity
        const intensity = (i + 1) * 0.5;
        const iterations = Math.floor(100000 * intensity);
        
        // CPU-intensive work
        let sum = 0;
        for (let j = 0; j < iterations; j++) {
            sum += Math.sqrt(j) * Math.sin(j);
        }
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const continuousEmissions = await continuousTracker.stop();
    console.log(`💚 Total emissions from continuous work: ${continuousEmissions.toFixed(6)} kg CO₂`);
    
    // Demo 5: System Information
    console.log('\n🖥️  Demo 5: System Information');
    console.log('='.repeat(50));
    
    const systemInfo = await GreenCarbon.utils.getSystemInfo();
    console.log('System Details:');
    console.log(`OS: ${systemInfo.os}`);
    console.log(`CPU: ${systemInfo.cpu.model}`);
    console.log(`CPU Cores: ${systemInfo.cpu.cores}`);
    console.log(`RAM: ${systemInfo.ram.totalGB} GB`);
    console.log(`GPU: ${systemInfo.gpu.count > 0 ? systemInfo.gpu.models.join(', ') : 'None detected'}`);
    console.log(`Node.js: ${systemInfo.nodeVersion}`);
    
    console.log('\n✅ All demonstrations completed!');
    console.log('📄 Check emissions.csv for detailed data');
    console.log('🔍 You can analyze the data to understand:');
    console.log('   • Which algorithms are most carbon-efficient');
    console.log('   • How workload intensity affects emissions');
    console.log('   • Power consumption patterns over time');
    console.log('   • Node.js vs Python performance comparison');
}

// Run the demo
if (require.main === module) {
    runDemos().catch(console.error);
}

module.exports = { runDemos };
