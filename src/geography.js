const fs = require('fs');
const path = require('path');

/**
 * Geography utilities for location detection and carbon intensity mapping
 */
class Geography {
    constructor() {
        this.defaultCountry = 'USA'; // Default fallback
        this.defaultRegion = null;
    }

    /**
     * Detect country from system locale or IP (simplified)
     * In production, you might use IP geolocation services
     */
    async detectLocation() {
        try {
            // Try to get country from system locale
            const locale = Intl.DateTimeFormat().resolvedOptions().locale;
            const countryCode = this.extractCountryFromLocale(locale);
            
            if (countryCode) {
                return {
                    countryCode: countryCode,
                    countryName: this.getCountryName(countryCode),
                    region: null,
                    latitude: null,
                    longitude: null
                };
            }
        } catch (error) {
            console.warn('Could not detect location from locale:', error);
        }
        
        // Fallback to default
        return {
            countryCode: this.defaultCountry,
            countryName: 'United States',
            region: null,
            latitude: null,
            longitude: null
        };
    }

    /**
     * Extract country code from locale string
     */
    extractCountryFromLocale(locale) {
        const parts = locale.split('-');
        if (parts.length >= 2) {
            return parts[1].toUpperCase();
        }
        
        // Map some common locales
        const localeMap = {
            'en': 'USA',
            'de': 'DEU',
            'fr': 'FRA',
            'es': 'ESP',
            'it': 'ITA',
            'ja': 'JPN',
            'ko': 'KOR',
            'zh': 'CHN',
            'hi': 'IND',
            'pt': 'BRA',
            'ru': 'RUS'
        };
        
        return localeMap[parts[0]] || null;
    }

    /**
     * Get country name from country code
     */
    getCountryName(countryCode) {
        const countryNames = {
            'USA': 'United States',
            'CAN': 'Canada',
            'GBR': 'United Kingdom',
            'DEU': 'Germany',
            'FRA': 'France',
            'ESP': 'Spain',
            'ITA': 'Italy',
            'JPN': 'Japan',
            'KOR': 'South Korea',
            'CHN': 'China',
            'IND': 'India',
            'BRA': 'Brazil',
            'RUS': 'Russia',
            'AUS': 'Australia',
            'NLD': 'Netherlands',
            'SWE': 'Sweden',
            'NOR': 'Norway',
            'DNK': 'Denmark',
            'FIN': 'Finland'
        };
        
        return countryNames[countryCode] || 'Unknown';
    }

    /**
     * Set manual location override
     */
    setLocation(countryCode, region = null) {
        this.defaultCountry = countryCode;
        this.defaultRegion = region;
    }

    /**
     * Get region-specific carbon intensity for US/Canada
     * Simplified implementation - in production, use detailed regional data
     */
    getRegionalCarbonIntensity(countryCode, region) {
        // US state-specific data (simplified)
        const usStates = {
            'CA': 300,  // California (lots of renewables)
            'WA': 250,  // Washington (hydro)
            'NY': 350,  // New York
            'TX': 450,  // Texas (mix of renewables and fossil)
            'WV': 850,  // West Virginia (coal heavy)
            'WY': 900,  // Wyoming (coal heavy)
            'FL': 500,  // Florida
        };
        
        // Canadian provinces (simplified)
        const canadianProvinces = {
            'QC': 50,   // Quebec (hydro)
            'ON': 150,  // Ontario (nuclear + hydro)
            'BC': 100,  // British Columbia (hydro)
            'AB': 600,  // Alberta (oil sands)
            'SK': 700,  // Saskatchewan (coal)
        };
        
        if (countryCode === 'USA' && region && usStates[region]) {
            return usStates[region];
        }
        
        if (countryCode === 'CAN' && region && canadianProvinces[region]) {
            return canadianProvinces[region];
        }
        
        return null; // Use country-level data
    }
}

module.exports = Geography;
