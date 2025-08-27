const fs = require('fs');
const path = require('path');

/**
 * Core emissions calculation class - equivalent to codecarbon.core.emissions.Emissions
 */
class Emissions {
    constructor() {
        this.dataPath = path.join(__dirname, 'data');
        this.carbonIntensityData = this.loadCarbonIntensityData();
        this.worldAverageCarbonIntensity = 475; // gCO2/kWh
    }

    /**
     * Load carbon intensity data from JSON file
     */
    loadCarbonIntensityData() {
        try {
            const dataFile = path.join(this.dataPath, 'global_energy_mix.json');
            const data = fs.readFileSync(dataFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.warn('Could not load carbon intensity data, using defaults');
            return {};
        }
    }

    /**
     * Get carbon intensity for a country (g CO2/kWh)
     * @param {string} countryCode - ISO country code (e.g., 'IND', 'USA')
     * @returns {number} Carbon intensity in g CO2/kWh
     */
    getCarbonIntensity(countryCode) {
        if (this.carbonIntensityData[countryCode]) {
            return this.carbonIntensityData[countryCode].carbon_intensity;
        }
        console.warn(`No carbon intensity data for ${countryCode}, using world average`);
        return this.worldAverageCarbonIntensity;
    }

    /**
     * Calculate emissions from energy consumption
     * @param {number} energyKWh - Energy consumed in kWh
     * @param {string} countryCode - ISO country code
     * @returns {number} CO2 emissions in kg
     */
    calculateEmissions(energyKWh, countryCode) {
        const carbonIntensity = this.getCarbonIntensity(countryCode);
        // Convert g CO2/kWh to kg CO2/kWh and multiply by energy
        return (carbonIntensity / 1000) * energyKWh;
    }

    /**
     * Get country name from country code
     * @param {string} countryCode - ISO country code
     * @returns {string} Country name
     */
    getCountryName(countryCode) {
        if (this.carbonIntensityData[countryCode]) {
            return this.carbonIntensityData[countryCode].country_name;
        }
        return 'Unknown';
    }
}

module.exports = Emissions;
