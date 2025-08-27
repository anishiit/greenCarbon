# GreenCarbon 🌱

Node.js library for tracking carbon emissions from code execution

[![npm version](https://badge.fury.io/js/green-carbon.svg)](https://badge.fury.io/js/green-carbon)

## 🎯 What is GreenCarbon?

GreenCarbon is a Node.js library that **estimates and tracks the carbon emissions** from your JavaScript/Node.js code while it's running. It provides the same functionality as Python's CodeCarbon but natively for the Node.js ecosystem.

**Core Question: "How much CO₂ does my Node.js code produce?"** 🤔

## 🧮 The Science Behind It

Carbon emissions are calculated using this formula:

```
CO₂ Emissions = Carbon Intensity × Energy Consumed
```

Where:
- **Carbon Intensity (C)**: grams of CO₂ per kWh of electricity (location-specific)
- **Energy Consumed (E)**: kWh used by your hardware (CPU + GPU + RAM)

## 🚀 Quick Start

### Installation

```bash
npm install green-carbon
```

### Basic Usage

```javascript
const { EmissionsTracker } = require('green-carbon');

async function main() {
    // Initialize tracker
    const tracker = new EmissionsTracker({
        projectName: 'my-awesome-app'
    });
    
    // Start tracking
    await tracker.start();
    console.log('📊 Carbon tracking started!');
    
    try {
        // Your code here
        await myExpensiveFunction();
        
    } finally {
        // Stop tracking and get results
        const emissions = await tracker.stop();
        console.log(`🌱 Carbon emissions: ${emissions.toFixed(6)} kg CO₂`);
    }
}

main().catch(console.error);
```

### Using the Utility Wrapper

```javascript
const GreenCarbon = require('green-carbon');

const { result, emissions } = await GreenCarbon.utils.withTracking(
    async () => {
        // Your computation here
        return await performComplexCalculation();
    },
    { projectName: 'complex-calculation' }
);

console.log(`Result: ${result}`);
console.log(`Emissions: ${emissions.toFixed(6)} kg CO₂`);
```

## 📊 Features

### ✅ **Hardware Tracking**
- **CPU**: TDP-based power estimation with load monitoring
- **RAM**: Slot-based power calculation (5W per slot)
- **GPU**: Automatic detection and power estimation
- **Cross-platform**: Windows, macOS, Linux support

### ✅ **Location Intelligence**
- **Auto-detection**: Based on system locale
- **Regional data**: Country and state-specific carbon intensity
- **Manual override**: Set custom location and carbon intensity
- **Real-time data**: Uses the same data sources as CodeCarbon

### ✅ **Output Compatibility**
- **CSV format**: Identical to CodeCarbon's output structure
- **Real-time logging**: Console output with detailed metrics
- **Data analysis**: Compatible with existing CodeCarbon tools

### ✅ **Advanced Usage Patterns**
- **Decorators**: Track function emissions automatically
- **Batch processing**: Long-running job monitoring
- **API integration**: Per-request emission tracking
- **ML workflows**: Training and inference monitoring

## 🔧 Configuration Options

```javascript
const tracker = new EmissionsTracker({
    projectName: 'my-project',           // Project identifier
    measurePowerSecs: 15,                // Measurement interval (seconds)
    countryCode: 'USA',                  // Manual location override
    region: 'CA',                        // State/province (for US/Canada)
    saveToFile: true,                    // Save to CSV file
    outputFile: 'emissions.csv',         // CSV output filename
    logLevel: 'INFO',                    // 'DEBUG', 'INFO', 'WARN', 'ERROR'
    pue: 1.0,                           // Power Usage Effectiveness
    
    // Manual power overrides (for testing/calibration)
    forceCpuPower: 65,                  // Override CPU power (Watts)
    forceRamPower: 10,                  // Override RAM power (Watts)
    forceGpuPower: 250                  // Override GPU power (Watts)
});
```

## 📈 Usage Examples

### ML Model Training

```javascript
const { EmissionsTracker } = require('green-carbon');

class MLModel {
    async train(epochs = 10) {
        const tracker = new EmissionsTracker({
            projectName: 'ml-model-training'
        });
        
        await tracker.start();
        
        try {
            for (let epoch = 0; epoch < epochs; epoch++) {
                await this.trainEpoch(epoch);
            }
            
            const emissions = await tracker.stop();
            console.log(`🌱 Training emissions: ${emissions.toFixed(6)} kg CO₂`);
            
            return { model: 'trained', emissions };
        } catch (error) {
            await tracker.stop();
            throw error;
        }
    }
}
```

### API Endpoint Monitoring

```javascript
const express = require('express');
const { EmissionsTracker } = require('green-carbon');

const app = express();

app.post('/expensive-computation', async (req, res) => {
    const tracker = new EmissionsTracker({
        projectName: 'api-expensive-endpoint'
    });
    
    await tracker.start();
    
    try {
        const result = await performExpensiveComputation(req.body);
        const emissions = await tracker.stop();
        
        res.json({
            result,
            emissions: `${emissions.toFixed(6)} kg CO₂`,
            sustainability_score: calculateSustainabilityScore(emissions)
        });
    } catch (error) {
        await tracker.stop();
        res.status(500).json({ error: error.message });
    }
});
```

### Batch Processing

```javascript
const { EmissionsTracker } = require('green-carbon');

async function processBatch(items) {
    const tracker = new EmissionsTracker({
        projectName: 'batch-processing',
        measurePowerSecs: 10 // More frequent for long-running jobs
    });
    
    await tracker.start();
    
    try {
        const results = [];
        for (const item of items) {
            const processed = await processItem(item);
            results.push(processed);
            
            // Check progress
            const status = tracker.getStatus();
            console.log(`Processed ${results.length}/${items.length} items`);
            console.log(`Current energy: ${status.totalEnergy.toFixed(6)} kWh`);
        }
        
        const emissions = await tracker.stop();
        
        return {
            results,
            totalEmissions: emissions,
            emissionsPerItem: emissions / items.length
        };
    } catch (error) {
        await tracker.stop();
        throw error;
    }
}
```

## 📊 Output Format

GreenCarbon generates CSV files compatible with CodeCarbon's format:

```csv
timestamp,project_name,run_id,experiment_id,duration,emissions,emissions_rate,cpu_power,gpu_power,ram_power,cpu_energy,gpu_energy,ram_energy,energy_consumed,country_name,country_iso_code,region,cloud_provider,cloud_region,os,python_version,codecarbon_version,cpu_count,cpu_model,gpu_count,gpu_model,longitude,latitude,ram_total_size,tracking_mode,on_cloud,pue
2025-08-16T10:30:00.000Z,my-app,abc123,def456,10.5,0.000123,0.0000117,65.0,0.0,10.0,0.000189,0.0,0.000029,0.000218,United States,USA,CA,,,Windows-11,,"1.0.0-nodejs",8,Intel i7-12700K,0,,,,16.0,machine,N,1.0
```

## 🌍 Real-World Context

Understanding your emissions in perspective:

```javascript
// After tracking
const emissions = await tracker.stop();

// Real-world equivalents
const carMeters = (emissions / 0.00012) / 1000;
const tvMinutes = (emissions / 0.000084) * 60;

console.log(`🚗 Equivalent to ${carMeters.toFixed(1)} meters of car driving`);
console.log(`📺 Equivalent to ${tvMinutes.toFixed(1)} minutes of TV watching`);
```

## 🔍 Comparison with CodeCarbon (Python)

| Feature | CodeCarbon (Python) | GreenCarbon (Node.js) | Status |
|---------|-------------------|---------------------|---------|
| CPU Tracking | ✅ RAPL, TDP fallback | ✅ TDP with load monitoring | ✅ Equivalent |
| RAM Tracking | ✅ Slot-based (5W/slot) | ✅ Slot-based (5W/slot) | ✅ Identical |
| GPU Tracking | ✅ NVIDIA (pynvml) | ✅ Multi-vendor detection | ✅ Enhanced |
| Carbon Intensity | ✅ Global database | ✅ Same database | ✅ Identical |
| Output Format | ✅ CSV compatible | ✅ CSV compatible | ✅ Compatible |
| Real-time Monitoring | ✅ Configurable intervals | ✅ Configurable intervals | ✅ Equivalent |
| Cloud Support | ✅ AWS, GCP, Azure | 🚧 Planned | 🔄 In Progress |

## 🛠️ System Requirements

- **Node.js**: 14.x or higher
- **Operating Systems**: Windows, macOS, Linux
- **Memory**: Minimal overhead (~5MB)
- **Permissions**: No special permissions required (unlike some Python tools)

## 📚 Advanced Documentation

### Hardware Detection

GreenCarbon automatically detects your system hardware:

```javascript
const GreenCarbon = require('green-carbon');

const systemInfo = await GreenCarbon.utils.getSystemInfo();
console.log(JSON.stringify(systemInfo, null, 2));

// Output:
// {
//   "platform": "win32",
//   "os": "Windows-11-10.0.26100",
//   "cpu": {
//     "model": "Intel(R) Core(TM) i7-12700K",
//     "cores": 16,
//     "physicalCores": 8,
//     "threads": 16
//   },
//   "ram": {
//     "totalGB": 32,
//     "estimatedSlots": 4,
//     "power": 20
//   },
//   "gpu": {
//     "count": 1,
//     "power": 350,
//     "models": ["NVIDIA GeForce RTX 3080"]
//   },
//   "nodeVersion": "v18.17.0"
// }
```

### Custom Carbon Intensity

```javascript
// Override location detection
const tracker = new EmissionsTracker({
    countryCode: 'FRA',  // France
    region: null,        // Use country-level data
    projectName: 'french-project'
});

// The tracker will use France's carbon intensity: ~60g CO₂/kWh
```

### Power Estimation Details

GreenCarbon uses the same methodologies as CodeCarbon:

1. **CPU Power**: TDP-based with load factor
   ```javascript
   // Formula: actualPower = TDP * (0.5 + (cpuLoad * 0.5))
   // Example: 65W TDP at 80% load = 65 * (0.5 + 0.4) = 58.5W
   ```

2. **RAM Power**: 5 Watts per estimated RAM slot
   ```javascript
   // Heuristic: estimatedSlots = Math.ceil(totalGB / 8)
   // Example: 32GB RAM = 4 slots = 20W
   ```

3. **GPU Power**: Model-based estimation or NVIDIA real-time data

## 🤝 Contributing

We welcome contributions! GreenCarbon aims to be the definitive Node.js carbon tracking solution.

### Development Setup

```bash
git clone https://github.com/yourusername/green-carbon.git
cd green-carbon
npm install
npm test
```

### Running Examples

```bash
# Simple demo
npm run demo

# Advanced examples
node examples/advanced.js

# System information
node -e "const GC = require('./index'); GC.utils.getSystemInfo().then(console.log)"
```



## 🌟 Acknowledgments

- **CodeCarbon Team**: For the original Python implementation and methodology
- **Our World in Data**: For carbon intensity data
- **Open Source Community**: For the tools and libraries that make this possible

---

**Ready to make your Node.js applications more sustainable?** 🌱

Start tracking your carbon footprint today with GreenCarbon!
