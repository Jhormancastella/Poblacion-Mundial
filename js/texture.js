// Textura inline como data URL para evitar problemas CORS
// Mapa mundial simplificado en formato SVG
export const EARTH_TEXTURE_DATA_URL = 'data:image/svg+xml;base64,' + btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 500" width="1000" height="500">
  <!-- Océano -->
  <rect width="1000" height="500" fill="#1a4d6e"/>
  
  <!-- América del Norte -->
  <path d="M 50,80 Q 150,60 200,100 T 180,180 Q 120,200 80,160 T 50,80" fill="#2d5016"/>
  <path d="M 180,100 Q 250,80 300,120 T 280,200 Q 220,220 180,180" fill="#2d5016"/>
  
  <!-- América del Sur -->
  <path d="M 220,220 Q 280,240 300,300 T 280,400 Q 220,420 200,350 T 220,220" fill="#2d5016"/>
  
  <!-- Europa/África -->
  <path d="M 420,80 Q 480,60 520,100 T 500,200 Q 460,220 440,180 T 420,80" fill="#2d5016"/>
  <path d="M 450,200 Q 500,180 550,220 T 530,350 Q 480,380 460,320 T 450,200" fill="#2d5016"/>
  <path d="M 460,320 Q 500,340 520,380 T 480,420 Q 450,400 460,320" fill="#2d5016"/>
  
  <!-- Asia -->
  <path d="M 520,60 Q 650,40 750,80 T 700,180 Q 600,200 550,150 T 520,60" fill="#2d5016"/>
  <path d="M 550,150 Q 650,130 720,170 T 680,250 Q 600,280 550,220" fill="#2d5016"/>
  
  <!-- Australia -->
  <path d="M 750,320 Q 820,300 880,340 T 850,400 Q 780,420 750,380" fill="#2d5016"/>
  
  <!-- Antártida -->
  <path d="M 0,450 Q 500,430 1000,450 L 1000,500 L 0,500" fill="#e8e8e8"/>
  
  <!-- Groenlandia -->
  <path d="M 320,40 Q 380,30 400,60 T 380,100 Q 340,110 320,80" fill="#e8e8e8"/>
  
  <!-- Nubes sutiles -->
  <ellipse cx="200" cy="120" rx="80" ry="30" fill="white" opacity="0.1"/>
  <ellipse cx="600" cy="150" rx="100" ry="40" fill="white" opacity="0.1"/>
  <ellipse cx="800" cy="350" rx="60" ry="25" fill="white" opacity="0.1"/>
</svg>
`);
