/**
 * API Module - Fetches real-world population data from external sources
 * Uses multiple APIs with fallback chain for reliability
 */

import { CONFIG } from './config.js';
import { store } from './store.js';

class PopulationAPI {
    constructor() {
        this.cache = {
            worldPopulation: null,
            countries: null,
            lastFetch: null
        };
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        this.updateInterval = null;
    }

    /**
     * Fetch country rankings by birth rate and death rate
     * Uses CIA World Factbook data via REST Countries extended fields
     */
    async fetchCountryRankings() {
        try {
            // Fetch detailed country data including birth/death rates
            const response = await fetch(
                'https://restcountries.com/v3.1/all?fields=name,population,cca3,region,birthRate,deathRate'
            );
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const countries = await response.json();
            
            // Filter countries with valid birth/death rates
            const withRates = countries.filter(c => 
                c.birthRate && c.deathRate && c.population > 1000000 // Only countries > 1M
            );

            // Sort by birth rate (descending)
            const highestBirthRates = [...withRates]
                .sort((a, b) => (b.birthRate || 0) - (a.birthRate || 0))
                .slice(0, 10)
                .map(c => ({
                    name: c.name.common,
                    code: c.cca3,
                    rate: c.birthRate,
                    population: c.population,
                    region: c.region
                }));

            // Sort by death rate (descending)
            const highestDeathRates = [...withRates]
                .sort((a, b) => (b.deathRate || 0) - (a.deathRate || 0))
                .slice(0, 10)
                .map(c => ({
                    name: c.name.common,
                    code: c.cca3,
                    rate: c.deathRate,
                    population: c.population,
                    region: c.region
                }));

            // Sort by total population
            const mostPopulous = [...countries]
                .sort((a, b) => b.population - a.population)
                .slice(0, 10)
                .map(c => ({
                    name: c.name.common,
                    code: c.cca3,
                    population: c.population,
                    region: c.region
                }));

            return {
                highestBirthRates,
                highestDeathRates,
                mostPopulous,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.warn('Failed to fetch country rankings:', error);
            return null;
        }
    }

    /**
     * Initialize and fetch all data including rankings
     */
    init() {
        this.fetchRealTimeData();
        this.fetchCountryRankings().then(rankings => {
            if (rankings) {
                store.setState({ rankings });
            }
        });
        
        // Update every 30 seconds for "real-time" feel
        this.updateInterval = setInterval(() => {
            this.updateRealTimeStats();
        }, 30000);
    }

    /**
     * Check if cache is still valid
     */
    isCacheValid() {
        if (!this.cache.lastFetch) return false;
        return (Date.now() - this.cache.lastFetch) < this.CACHE_DURATION;
    }

    /**
     * Main fetch method - tries multiple APIs in sequence
     */
    async fetchRealTimeData() {
        try {
            // Try REST Countries API first (free, no key needed)
            const data = await this.fetchFromRESTCountries();
            if (data) {
                this.cache.worldPopulation = data.worldPopulation;
                this.cache.countries = data.countries;
                this.cache.lastFetch = Date.now();
                this.updateStoreWithRealData(data);
                return data;
            }
        } catch (error) {
            console.warn('REST Countries API failed:', error);
        }

        try {
            // Fallback: World Bank API
            const data = await this.fetchFromWorldBank();
            if (data) {
                this.cache.worldPopulation = data.worldPopulation;
                this.cache.lastFetch = Date.now();
                this.updateStoreWithRealData(data);
                return data;
            }
        } catch (error) {
            console.warn('World Bank API failed:', error);
        }

        // If all APIs fail, use estimated calculation
        console.log('Using estimated population data (APIs unavailable)');
        return null;
    }

    /**
     * Fetch from REST Countries API (free, no authentication)
     */
    async fetchFromRESTCountries() {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,population,cca3,region');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const countries = await response.json();
        
        // Calculate world population from country data
        const worldPopulation = countries.reduce((sum, country) => {
            return sum + (country.population || 0);
        }, 0);

        // Group by continent/region
        const byRegion = countries.reduce((acc, country) => {
            const region = country.region || 'Unknown';
            if (!acc[region]) acc[region] = 0;
            acc[region] += country.population || 0;
            return acc;
        }, {});

        return {
            worldPopulation,
            countries: countries.slice(0, 20).sort((a, b) => b.population - a.population), // Top 20
            byRegion,
            source: 'REST Countries API',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Fetch from World Bank API
     */
    async fetchFromWorldBank() {
        // World Bank indicator SP.POP.TOTL = Total population
        const response = await fetch(
            'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?date=2023:2024&format=json&per_page=300'
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // World Bank returns [metadata, results]
        const results = Array.isArray(data) ? data[1] : data;
        
        if (!results || !Array.isArray(results)) {
            throw new Error('Invalid World Bank response');
        }

        // Find world total (country code 1W or WLD)
        const worldEntry = results.find(r => 
            r.country && (r.country.id === '1W' || r.country.id === 'WLD')
        );

        const worldPopulation = worldEntry ? worldEntry.value : null;

        if (!worldPopulation) {
            throw new Error('World population data not found');
        }

        return {
            worldPopulation,
            countries: [], // World Bank doesn't give all countries in one call easily
            byRegion: {},
            source: 'World Bank API',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Update store with real API data
     */
    updateStoreWithRealData(data) {
        if (!data || !data.worldPopulation) return;

        const currentState = store.getState();
        const currentStats = currentState.stats;

        // Calculate rates based on real population
        // Global average: ~140M births/year, ~60M deaths/year
        const birthsPerYear = 140000000;
        const deathsPerYear = 60000000;
        
        const birthsPerSecond = birthsPerYear / (365.25 * 24 * 60 * 60);
        const deathsPerSecond = deathsPerYear / (365.25 * 24 * 60 * 60);

        store.setState({
            stats: {
                ...currentStats,
                population: data.worldPopulation,
                birthsPerSecond,
                deathsPerSecond,
                source: data.source,
                lastUpdated: data.timestamp,
                byRegion: data.byRegion || {}
            }
        });

        console.log(`✓ Real data loaded: ${data.worldPopulation.toLocaleString()} from ${data.source}`);
    }

    /**
     * Update real-time statistics (called every 30s)
     */
    updateRealTimeStats() {
        const state = store.getState();
        const stats = state.stats;

        if (!stats.birthsPerSecond || !stats.deathsPerSecond) return;

        // Calculate changes in the last 30 seconds
        const birthsThisInterval = Math.floor(stats.birthsPerSecond * 30);
        const deathsThisInterval = Math.floor(stats.deathsPerSecond * 30);

        store.setState({
            stats: {
                ...stats,
                population: stats.population + birthsThisInterval - deathsThisInterval,
                birthsToday: (stats.birthsToday || 0) + birthsThisInterval,
                deathsToday: (stats.deathsToday || 0) + deathsThisInterval
            }
        });
    }

    /**
     * Get population data for a specific country
     */
    async getCountryData(countryCode) {
        if (this.isCacheValid() && this.cache.countries) {
            const country = this.cache.countries.find(c => 
                c.cca3 === countryCode || c.cca2 === countryCode
            );
            if (country) return country;
        }

        // Fetch specific country
        try {
            const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
            if (response.ok) {
                const data = await response.json();
                return Array.isArray(data) ? data[0] : data;
            }
        } catch (error) {
            console.warn(`Failed to fetch country ${countryCode}:`, error);
        }

        return null;
    }

    /**
     * Get top populated countries
     */
    getTopCountries(limit = 10) {
        if (!this.cache.countries) return [];
        return this.cache.countries
            .sort((a, b) => b.population - a.population)
            .slice(0, limit);
    }

    /**
     * Get population by region
     */
    getPopulationByRegion() {
        return this.cache.byRegion || {};
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

export const populationAPI = new PopulationAPI();
