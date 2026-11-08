// Copia a biblioteca de PDF para dentro do app, para funcionar sem internet.
const fs = require('fs');
fs.copyFileSync('node_modules/jspdf/dist/jspdf.umd.min.js', 'www/jspdf.umd.min.js');
console.log('jsPDF copiado para www/');
