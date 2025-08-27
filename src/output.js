const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

/**
 * Output handler for emissions data - equivalent to codecarbon.output
 */
class OutputHandler {
    constructor(options = {}) {
        this.saveToFile = options.saveToFile !== false;
        this.filePath = options.filePath || 'emissions.csv';
        this.projectName = options.projectName || 'green-carbon';
        this.csvWriter = null;
        this.initializeCSVWriter();
    }

    /**
     * Initialize CSV writer with headers matching CodeCarbon format
     */
    initializeCSVWriter() {
        if (!this.saveToFile) return;

        this.csvWriter = createObjectCsvWriter({
            path: this.filePath,
            header: [
                { id: 'timestamp', title: 'timestamp' },
                { id: 'project_name', title: 'project_name' },
                { id: 'run_id', title: 'run_id' },
                { id: 'experiment_id', title: 'experiment_id' },
                { id: 'duration', title: 'duration' },
                { id: 'emissions', title: 'emissions' },
                { id: 'emissions_rate', title: 'emissions_rate' },
                { id: 'cpu_power', title: 'cpu_power' },
                { id: 'gpu_power', title: 'gpu_power' },
                { id: 'ram_power', title: 'ram_power' },
                { id: 'cpu_energy', title: 'cpu_energy' },
                { id: 'gpu_energy', title: 'gpu_energy' },
                { id: 'ram_energy', title: 'ram_energy' },
                { id: 'energy_consumed', title: 'energy_consumed' },
                { id: 'country_name', title: 'country_name' },
                { id: 'country_iso_code', title: 'country_iso_code' },
                { id: 'region', title: 'region' },
                { id: 'cloud_provider', title: 'cloud_provider' },
                { id: 'cloud_region', title: 'cloud_region' },
                { id: 'os', title: 'os' },
                { id: 'python_version', title: 'python_version' },
                { id: 'codecarbon_version', title: 'codecarbon_version' },
                { id: 'cpu_count', title: 'cpu_count' },
                { id: 'cpu_model', title: 'cpu_model' },
                { id: 'gpu_count', title: 'gpu_count' },
                { id: 'gpu_model', title: 'gpu_model' },
                { id: 'longitude', title: 'longitude' },
                { id: 'latitude', title: 'latitude' },
                { id: 'ram_total_size', title: 'ram_total_size' },
                { id: 'tracking_mode', title: 'tracking_mode' },
                { id: 'on_cloud', title: 'on_cloud' },
                { id: 'pue', title: 'pue' }
            ],
            append: fs.existsSync(this.filePath)
        });
    }

    /**
     * Save emissions data to CSV file
     * @param {Object} data - Emissions data object
     */
    async saveData(data) {
        if (!this.saveToFile || !this.csvWriter) return;

        try {
            const record = this.formatDataForCSV(data);
            await this.csvWriter.writeRecords([record]);
            console.log(`📄 Emissions data saved to ${this.filePath}`);
        } catch (error) {
            console.error('Failed to save emissions data:', error);
        }
    }

    /**
     * Format data to match CodeCarbon CSV structure
     */
    formatDataForCSV(data) {
        return {
            timestamp: new Date().toISOString(),
            project_name: data.projectName || this.projectName,
            run_id: data.runId || this.generateUUID(),
            experiment_id: data.experimentId || this.generateUUID(),
            duration: data.duration || 0,
            emissions: data.emissions || 0,
            emissions_rate: data.emissionsRate || 0,
            cpu_power: data.cpuPower || 0,
            gpu_power: data.gpuPower || 0,
            ram_power: data.ramPower || 0,
            cpu_energy: data.cpuEnergy || 0,
            gpu_energy: data.gpuEnergy || 0,
            ram_energy: data.ramEnergy || 0,
            energy_consumed: data.energyConsumed || 0,
            country_name: data.countryName || 'Unknown',
            country_iso_code: data.countryCode || 'USA',
            region: data.region || '',
            cloud_provider: data.cloudProvider || '',
            cloud_region: data.cloudRegion || '',
            os: data.os || 'Unknown',
            python_version: '', // N/A for Node.js
            codecarbon_version: data.version || '1.0.0-nodejs',
            cpu_count: data.cpuCount || 1,
            cpu_model: data.cpuModel || 'Unknown',
            gpu_count: data.gpuCount || 0,
            gpu_model: data.gpuModel || '',
            longitude: data.longitude || '',
            latitude: data.latitude || '',
            ram_total_size: data.ramTotalSize || 0,
            tracking_mode: data.trackingMode || 'machine',
            on_cloud: data.onCloud || 'N',
            pue: data.pue || 1.0
        };
    }

    /**
     * Generate UUID for run and experiment IDs
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Log emissions data to console
     */
    logData(data) {
        console.log('\n🌱 Emissions Tracking Results:');
        console.log('═'.repeat(50));
        console.log(`💚 CO₂ Emissions: ${data.emissions.toFixed(6)} kg`);
        console.log(`⚡ Energy Consumed: ${data.energyConsumed.toFixed(6)} kWh`);
        console.log(`⏱️  Duration: ${data.duration.toFixed(2)} seconds`);
        console.log(`🔥 Average Power: ${((data.energyConsumed * 1000) / (data.duration / 3600)).toFixed(1)} W`);
        console.log(`🖥️  CPU Power: ${data.cpuPower.toFixed(1)} W`);
        console.log(`💾 RAM Power: ${data.ramPower.toFixed(1)} W`);
        console.log(`🎮 GPU Power: ${data.gpuPower.toFixed(1)} W`);
        console.log(`🌍 Location: ${data.countryName} (${data.countryCode})`);
        console.log(`🏭 Carbon Intensity: ${((data.emissions / data.energyConsumed) * 1000).toFixed(0)} g CO₂/kWh`);
        
        // Real-world equivalents
        const carKm = (data.emissions / 0.00012) / 1000; // Convert to km
        const tvMinutes = (data.emissions / 0.000084) * 60; // Convert to minutes
        
        console.log('\n🌎 Real-world equivalents:');
        console.log(`🚗 Car driving: ${carKm.toFixed(1)} meters`);
        console.log(`📺 TV watching: ${tvMinutes.toFixed(1)} minutes`);
        console.log('═'.repeat(50));
    }

    /**
     * Create summary report
     */
    createSummaryReport(allData) {
        const totalEmissions = allData.reduce((sum, d) => sum + d.emissions, 0);
        const totalEnergy = allData.reduce((sum, d) => sum + d.energyConsumed, 0);
        const totalDuration = allData.reduce((sum, d) => sum + d.duration, 0);
        
        console.log('\n📊 Session Summary Report:');
        console.log('═'.repeat(50));
        console.log(`Total runs: ${allData.length}`);
        console.log(`Total emissions: ${totalEmissions.toFixed(6)} kg CO₂`);
        console.log(`Total energy: ${totalEnergy.toFixed(6)} kWh`);
        console.log(`Total duration: ${totalDuration.toFixed(1)} seconds`);
        console.log(`Average emissions rate: ${(totalEmissions / totalDuration).toFixed(8)} kg CO₂/s`);
        console.log('═'.repeat(50));
    }
}

module.exports = OutputHandler;
