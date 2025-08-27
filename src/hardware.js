const si = require('systeminformation');
const os = require('os');

/**
 * Hardware tracking class - equivalent to codecarbon.external.hardware
 */
class HardwareTracker {
    constructor() {
        this.cpuInfo = null;
        this.memInfo = null;
        this.gpuInfo = null;
        this.isInitialized = false;
    }

    /**
     * Initialize hardware detection
     */
    async initialize() {
        try {
            this.cpuInfo = await si.cpu();
            this.memInfo = await si.mem();
            this.gpuInfo = await si.graphics();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize hardware detection:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Get CPU information
     */
    async getCPUInfo() {
        if (!this.isInitialized) await this.initialize();
        
        const cpuCount = os.cpus().length;
        const cpuModel = this.cpuInfo ? this.cpuInfo.brand : 'Unknown CPU';
        
        return {
            model: cpuModel,
            cores: cpuCount,
            physicalCores: this.cpuInfo ? this.cpuInfo.physicalCores : cpuCount,
            threads: cpuCount
        };
    }

    /**
     * Get current CPU usage percentage
     */
    async getCPUUsage() {
        try {
            const load = await si.currentLoad();
            return load.currentLoad;
        } catch (error) {
            console.warn('Could not get CPU usage:', error);
            return 50; // Default fallback
        }
    }

    /**
     * Estimate CPU power consumption
     * Uses TDP estimation similar to CodeCarbon's fallback mode
     */
    async estimateCPUPower() {
        const cpuInfo = await this.getCPUInfo();
        const cpuUsage = await this.getCPUUsage();
        
        // CPU TDP estimation based on model
        let tdp = this.estimateTDPFromModel(cpuInfo.model);
        
        // Apply CPU load factor (similar to CodeCarbon)
        const loadFactor = cpuUsage / 100;
        const basePowerRatio = 0.5; // 50% of TDP as base consumption
        const actualPower = tdp * (basePowerRatio + (loadFactor * 0.5));
        
        return {
            power: actualPower, // Watts
            tdp: tdp,
            usage: cpuUsage,
            model: cpuInfo.model,
            cores: cpuInfo.cores
        };
    }

    /**
     * Estimate TDP from CPU model name
     * Simplified heuristic - in real implementation, use a lookup table
     */
    estimateTDPFromModel(model) {
        const modelLower = model.toLowerCase();
        
        // Intel processors
        if (modelLower.includes('i3')) return 35;
        if (modelLower.includes('i5')) return 65;
        if (modelLower.includes('i7')) return 95;
        if (modelLower.includes('i9')) return 125;
        if (modelLower.includes('xeon')) return 150;
        
        // AMD processors
        if (modelLower.includes('ryzen 3')) return 65;
        if (modelLower.includes('ryzen 5')) return 95;
        if (modelLower.includes('ryzen 7')) return 105;
        if (modelLower.includes('ryzen 9')) return 125;
        if (modelLower.includes('threadripper')) return 280;
        
        // Mobile/Low power indicators
        if (modelLower.includes('u') || modelLower.includes('y')) return 15;
        if (modelLower.includes('h')) return 45;
        
        // Default fallback (CodeCarbon uses 85W)
        return 85;
    }

    /**
     * Get RAM information and estimate power consumption
     */
    async getRAMInfo() {
        if (!this.isInitialized) await this.initialize();
        
        const totalGB = Math.round(this.memInfo.total / (1024 * 1024 * 1024));
        
        // CodeCarbon v3 uses 5W per RAM slot
        // Estimate slots based on RAM size (heuristic)
        const estimatedSlots = Math.max(1, Math.ceil(totalGB / 8)); // Assume 8GB per slot average
        const ramPower = estimatedSlots * 5; // 5W per slot
        
        return {
            totalGB: totalGB,
            estimatedSlots: estimatedSlots,
            power: ramPower // Watts
        };
    }

    /**
     * Get GPU information and power consumption
     */
    async getGPUInfo() {
        if (!this.isInitialized) await this.initialize();
        
        if (!this.gpuInfo || !this.gpuInfo.controllers || this.gpuInfo.controllers.length === 0) {
            return {
                count: 0,
                power: 0,
                models: []
            };
        }
        
        const gpus = this.gpuInfo.controllers.filter(gpu => 
            gpu.vendor && !gpu.vendor.toLowerCase().includes('intel')
        );
        
        if (gpus.length === 0) {
            return {
                count: 0,
                power: 0,
                models: []
            };
        }
        
        // Estimate GPU power (simplified)
        const totalGPUPower = gpus.reduce((total, gpu) => {
            return total + this.estimateGPUPower(gpu.model || 'Unknown GPU');
        }, 0);
        
        return {
            count: gpus.length,
            power: totalGPUPower,
            models: gpus.map(gpu => gpu.model || 'Unknown GPU')
        };
    }

    /**
     * Estimate GPU power consumption from model
     */
    estimateGPUPower(model) {
        const modelLower = model.toLowerCase();
        
        // NVIDIA RTX series
        if (modelLower.includes('rtx 4090')) return 450;
        if (modelLower.includes('rtx 4080')) return 320;
        if (modelLower.includes('rtx 4070')) return 200;
        if (modelLower.includes('rtx 3090')) return 350;
        if (modelLower.includes('rtx 3080')) return 320;
        if (modelLower.includes('rtx 3070')) return 220;
        if (modelLower.includes('rtx 3060')) return 170;
        
        // AMD Radeon series
        if (modelLower.includes('rx 7900')) return 300;
        if (modelLower.includes('rx 6900')) return 300;
        if (modelLower.includes('rx 6800')) return 250;
        if (modelLower.includes('rx 6700')) return 180;
        
        // Default for unknown GPUs
        return 150;
    }

    /**
     * Get system information summary
     */
    async getSystemInfo() {
        const cpu = await this.getCPUInfo();
        const ram = await this.getRAMInfo();
        const gpu = await this.getGPUInfo();
        const platform = os.platform();
        const osInfo = await si.osInfo();
        
        return {
            platform: platform,
            os: `${osInfo.distro}-${osInfo.release}`,
            cpu: cpu,
            ram: ram,
            gpu: gpu,
            nodeVersion: process.version
        };
    }
}

module.exports = HardwareTracker;
