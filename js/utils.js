export const formatNumber = (num, locale = 'es-ES', decimals = 0) => {
    return num.toLocaleString(locale, { 
        maximumFractionDigits: decimals 
    });
};

export const formatTime = (date = new Date(), locale = 'es-ES') => {
    return date.toLocaleTimeString(locale);
};

export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

export const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

export const throttle = (fn, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

export const generateHSL = (hueMin, hueMax, saturation, lightness) => {
    const hue = hueMin + Math.random() * (hueMax - hueMin);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const rotatePoint = (point, rotX, rotY) => {
    let x = point.x * Math.cos(rotY) - point.z * Math.sin(rotY);
    let z = point.x * Math.sin(rotY) + point.z * Math.cos(rotY);
    
    let y = point.y * Math.cos(rotX) - z * Math.sin(rotX);
    z = point.y * Math.sin(rotX) + z * Math.cos(rotX);
    
    return { x, y, z };
};

export const project3D = (point, canvasWidth, canvasHeight, focalLength) => {
    const scale = focalLength / (focalLength + point.z);
    return {
        x: canvasWidth / 2 + point.x * scale,
        y: canvasHeight / 2 + point.y * scale,
        scale
    };
};
