import { CONFIG } from './config.js';
import { statsManager } from './stats.js';

class GoogleSheetsAPI {
    constructor() {
        this.apiKey = CONFIG.googleSheets.apiKey;
        this.spreadsheetId = CONFIG.googleSheets.spreadsheetId;
        this.range = CONFIG.googleSheets.range;
        this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    }
    
    setCredentials(apiKey, spreadsheetId) {
        this.apiKey = apiKey;
        this.spreadsheetId = spreadsheetId;
    }
    
    async fetchData() {
        if (!this.apiKey || !this.spreadsheetId) {
            console.warn('Google Sheets API: Credenciales no configuradas');
            return null;
        }
        
        try {
            const url = `${this.baseUrl}/${this.spreadsheetId}/values/${this.range}?key=${this.apiKey}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.values && data.values.length > 0) {
                this.processData(data.values);
                return data.values;
            }
            
            return null;
        } catch (error) {
            console.error('Error al obtener datos de Google Sheets:', error);
            return null;
        }
    }
    
    processData(values) {
        const headers = values[0];
        const data = values.slice(1);
        
        const processedData = data.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            return obj;
        });
        
        const statsRow = data[0];
        if (statsRow) {
            statsManager.updateFromSheet(statsRow);
        }
        
        return processedData;
    }
    
    async updateCell(range, value) {
        if (!this.apiKey || !this.spreadsheetId) {
            console.warn('Google Sheets API: Credenciales no configuradas');
            return null;
        }
        
        try {
            const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}?valueInputOption=RAW&key=${this.apiKey}`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: [[value]]
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al actualizar celda:', error);
            return null;
        }
    }
    
    startAutoRefresh(intervalMinutes = 5) {
        this.fetchData();
        
        setInterval(() => {
            this.fetchData();
        }, intervalMinutes * 60 * 1000);
    }
}

export const sheetsAPI = new GoogleSheetsAPI();
