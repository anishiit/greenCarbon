const HardwareTracker = require('./hardware');
const Emissions = require('./emissions');
const Geography = require('./geography');
const OutputHandler = require('./output');

/**
 * Main GreenCarbon EmissionsTracker class
 * Node.js equivalent of Python's CodeCarbon EmissionsTracker
 */
class EmissionsTracker {
    constructor(options = {}) {
        // Configuration options
        this.projectName = options.projectName || 'green-carbon-project';
        this.measurePowerInterval = (options.measurePowerSecs || 15) * 1000; // Convert to ms
        this.countryCode = options.countryCode || null;
        this.region = options.region || null;
        this.saveToFile = options.saveToFile !== false;
        this.outputFile = options.outputFile || 'emissions.csv';
        this.logLevel = options.logLevel || 'INFO';
        this.pue = options.pue || 1.0; // Power Usage Effectiveness
        
        // Force power overrides (for testing/debugging)
        this.forceCpuPower = options.forceCpuPower || null;
        this.forceRamPower = options.forceRamPower || null;
        this.forceGpuPower = options.forceGpuPower || null;
        
        // Internal state
        this.isTracking = false;
        this.startTime = null;
        this.endTime = null;
        this.measurementInterval = null;
        this.runId = this.generateUUID();
        this.experimentId = this.generateUUID();
        
        // Cumulative tracking
        this.totalCpuEnergy = 0;
        this.totalRamEnergy = 0;
        this.totalGpuEnergy = 0;
        this.totalEnergy = 0;
        this.measurements = [];
        
        // Initialize components
        this.hardwareTracker = new HardwareTracker();
        this.emissions = new Emissions();
        this.geography = new Geography();
        this.outputHandler = new OutputHandler({
            saveToFile: this.saveToFile,
            filePath: this.outputFile,
            projectName: this.projectName
        });
        
        // System info (will be populated on start)
        this.systemInfo = null;
        this.locationInfo = null;
    }

    /**
     * Start emissions tracking
     */
    async start() {
        if (this.isTracking) {
            console.warn('⚠️  Emissions tracking is already running');
            return;
        }

        try {
            console.log('🚀 Starting GreenCarbon emissions tracking...');
            
            // Initialize system information
            await this.initializeSystemInfo();
            
            // Set tracking state
            this.isTracking = true;
            this.startTime = Date.now();
            this.totalCpuEnergy = 0;
            this.totalRamEnergy = 0;
            this.totalGpuEnergy = 0;
            this.totalEnergy = 0;
            this.measurements = [];
            
            // Start periodic measurements
            this.measurementInterval = setInterval(
                () => this.measurePowerAndEnergy(),
                this.measurePowerInterval
            );
            
            // Take initial measurement
            await this.measurePowerAndEnergy();
            
            if (this.logLevel === 'INFO') {
                this.logSystemInfo();
            }
            
            console.log(`📊 Tracking started. Measuring every ${this.measurePowerInterval/1000}s`);
            
        } catch (error) {
            console.error('❌ Failed to start emissions tracking:', error);
            this.isTracking = false;
        }
    }

    /**
     * Stop emissions tracking and return results
     */
    async stop() {
        if (!this.isTracking) {
            console.warn('⚠️  Emissions tracking is not running');
            return 0;
        }

        try {
            // Stop periodic measurements
            if (this.measurementInterval) {
                clearInterval(this.measurementInterval);
                this.measurementInterval = null;
            }
            
            // Take final measurement
            await this.measurePowerAndEnergy();
            
            this.endTime = Date.now();
            this.isTracking = false;
            
            // Calculate final results
            const results = this.calculateFinalEmissions();
            
            // Output results
            if (this.logLevel === 'INFO') {
                this.outputHandler.logData(results);
            }
            
            // Save to file
            await this.outputHandler.saveData(results);
            
            console.log('🛑 Emissions tracking stopped');
            
            return results.emissions;
            
        } catch (error) {
            console.error('❌ Failed to stop emissions tracking:', error);
            this.isTracking = false;
            return 0;
        }
    }

    /**
     * Initialize system and location information
     */
    async initializeSystemInfo() {
        // Get system information
        this.systemInfo = await this.hardwareTracker.getSystemInfo();
        
        // Get or set location
        if (this.countryCode) {
            this.locationInfo = {
                countryCode: this.countryCode,
                countryName: this.geography.getCountryName(this.countryCode),
                region: this.region
            };
        } else {
            this.locationInfo = await this.geography.detectLocation();
        }
        
        console.log(`📍 Location detected: ${this.locationInfo.countryName} (${this.locationInfo.countryCode})`);
    }

    /**
     * Measure current power consumption and update energy totals
     */
    async measurePowerAndEnergy() {
        if (!this.isTracking) return;

        try {
            const measurementTime = Date.now();
            const timeSinceLastMeasurement = this.measurements.length > 0 
                ? (measurementTime - this.measurements[this.measurements.length - 1].timestamp) / 1000
                : this.measurePowerInterval / 1000;
            
            // Get power measurements
            const cpuInfo = await this.hardwareTracker.estimateCPUPower();
            const ramInfo = await this.hardwareTracker.getRAMInfo();
            const gpuInfo = await this.hardwareTracker.getGPUInfo();
            
            // Apply force overrides if specified
            const cpuPower = this.forceCpuPower || cpuInfo.power;
            const ramPower = this.forceRamPower || ramInfo.power;
            const gpuPower = this.forceGpuPower || gpuInfo.power;
            
            // Calculate energy consumed since last measurement (kWh)
            const cpuEnergy = (cpuPower * timeSinceLastMeasurement) / (1000 * 3600); // W*s to kWh
            const ramEnergy = (ramPower * timeSinceLastMeasurement) / (1000 * 3600);
            const gpuEnergy = (gpuPower * timeSinceLastMeasurement) / (1000 * 3600);
            
            // Apply PUE (Power Usage Effectiveness)
            const adjustedCpuEnergy = cpuEnergy * this.pue;
            const adjustedRamEnergy = ramEnergy * this.pue;
            const adjustedGpuEnergy = gpuEnergy * this.pue;
            
            // Update totals
            this.totalCpuEnergy += adjustedCpuEnergy;
            this.totalRamEnergy += adjustedRamEnergy;
            this.totalGpuEnergy += adjustedGpuEnergy;
            this.totalEnergy = this.totalCpuEnergy + this.totalRamEnergy + this.totalGpuEnergy;
            
            // Store measurement
            const measurement = {
                timestamp: measurementTime,
                duration: timeSinceLastMeasurement,
                cpuPower: cpuPower,
                ramPower: ramPower,
                gpuPower: gpuPower,
                cpuEnergy: adjustedCpuEnergy,
                ramEnergy: adjustedRamEnergy,
                gpuEnergy: adjustedGpuEnergy,
                totalEnergy: this.totalEnergy,
                cpuUsage: cpuInfo.usage
            };
            
            this.measurements.push(measurement);
            
            // Log progress if verbose
            if (this.logLevel === 'DEBUG') {
                console.log(`📊 Measurement: ${cpuPower.toFixed(1)}W CPU, ${ramPower.toFixed(1)}W RAM, ${gpuPower.toFixed(1)}W GPU`);
                console.log(`⚡ Total energy: ${this.totalEnergy.toFixed(6)} kWh`);
            }
            
        } catch (error) {
            console.error('❌ Failed to measure power consumption:', error);
        }
    }

    /**
     * Calculate final emissions and create results object
     */
    calculateFinalEmissions() {
        const duration = (this.endTime - this.startTime) / 1000; // seconds
        const emissions = this.emissions.calculateEmissions(this.totalEnergy, this.locationInfo.countryCode);
        const emissionsRate = duration > 0 ? emissions / duration : 0;
        
        // Get latest power readings
        const latestMeasurement = this.measurements[this.measurements.length - 1] || {};
        
        return {
            // Emissions data
            emissions: emissions,
            emissionsRate: emissionsRate,
            energyConsumed: this.totalEnergy,
            duration: duration,
            
            // Power data
            cpuPower: latestMeasurement.cpuPower || 0,
            ramPower: latestMeasurement.ramPower || 0,
            gpuPower: latestMeasurement.gpuPower || 0,
            
            // Energy breakdown
            cpuEnergy: this.totalCpuEnergy,
            ramEnergy: this.totalRamEnergy,
            gpuEnergy: this.totalGpuEnergy,
            
            // System information
            projectName: this.projectName,
            runId: this.runId,
            experimentId: this.experimentId,
            countryName: this.locationInfo.countryName,
            countryCode: this.locationInfo.countryCode,
            region: this.locationInfo.region,
            os: this.systemInfo.os,
            cpuModel: this.systemInfo.cpu.model,
            cpuCount: this.systemInfo.cpu.threads,
            gpuCount: this.systemInfo.gpu.count,
            gpuModel: this.systemInfo.gpu.models.join(', '),
            ramTotalSize: this.systemInfo.ram.totalGB,
            version: '1.0.0-nodejs',
            trackingMode: 'machine',
            onCloud: 'N',
            pue: this.pue,
            
            // Additional metadata
            measurements: this.measurements.length,
            averageCpuUsage: this.calculateAverageCpuUsage()
        };
    }

    /**
     * Calculate average CPU usage across all measurements
     */
    calculateAverageCpuUsage() {
        if (this.measurements.length === 0) return 0;
        
        const totalUsage = this.measurements.reduce((sum, m) => sum + (m.cpuUsage || 0), 0);
        return totalUsage / this.measurements.length;
    }

    /**
     * Log system information
     */
    logSystemInfo() {
        console.log('\n🖥️  System Information:');
        console.log('─'.repeat(40));
        console.log(`OS: ${this.systemInfo.os}`);
        console.log(`CPU: ${this.systemInfo.cpu.model}`);
        console.log(`CPU Cores: ${this.systemInfo.cpu.cores} threads`);
        console.log(`RAM: ${this.systemInfo.ram.totalGB} GB`);
        console.log(`GPU: ${this.systemInfo.gpu.count > 0 ? this.systemInfo.gpu.models.join(', ') : 'None detected'}`);
        console.log(`Node.js: ${this.systemInfo.nodeVersion}`);
        console.log(`Location: ${this.locationInfo.countryName} (${this.locationInfo.countryCode})`);
        console.log('─'.repeat(40));
    }

    /**
     * Generate UUID for tracking IDs
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Get current tracking status
     */
    getStatus() {
        return {
            isTracking: this.isTracking,
            duration: this.isTracking ? (Date.now() - this.startTime) / 1000 : 0,
            measurements: this.measurements.length,
            totalEnergy: this.totalEnergy,
            projectName: this.projectName
        };
    }
}

module.exports = EmissionsTracker;
