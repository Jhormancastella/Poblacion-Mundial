export const CONFIG = {
    canvas: {
        maxWidth: 500,
        aspectRatio: 1,
        radiusFactor: 0.4,
        focalLength: 300
    },
    particles: {
        count: 3000,
        baseSize: 1.2,
        landProbability: 0.3
    },
    animation: {
        autoRotateSpeed: 0.003,
        frameThrottle: 16
    },
    population: {
        initial: 8045311447,
        birthsPerMinute: 267,
        deathsPerMinute: 107,
        updateInterval: 1000,
        uiUpdateInterval: 10000
    },
    colors: {
        landHue: { min: 30, max: 60 },
        waterHue: { min: 200, max: 240 },
        default: '#ffffff'
    },
    googleSheets: {
        apiKey: '',
        spreadsheetId: '',
        range: 'Sheet1!A1:D10'
    },
    earthTexture: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/WorldMap-A_non-mobile.png/1280px-WorldMap-A_non-mobile.png',
        fallbackUrl: 'assets/earth-texture.jpg',
        width: 1280,
        height: 640
    }
};
