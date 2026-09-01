import QRCode from 'qrcode';

// Synchronous fallback SVG renderer using standard qrcode library matrix
export const generateQRCodeSVGString = (text, size = 180) => {
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const modules = qr.modules;
    const count = modules.size;
    const cellSize = (size / count).toFixed(3);

    let rects = '';
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (modules.get(row, col)) {
          const x = (col * cellSize).toFixed(3);
          const y = (row * cellSize).toFixed(3);
          rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#000000" />`;
        }
      }
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
        <rect width="${size}" height="${size}" fill="#ffffff" />
        ${rects}
      </svg>
    `;
  } catch (err) {
    console.error('QR Generator Error:', err);
    return `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#eee"/><text x="10" y="50">QR Error</text></svg>`;
  }
};

// Asynchronous DataURL generator (for img src)
export const generateQRCodeDataURL = async (text, size = 200) => {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('DataURL QR Error:', err);
    return '';
  }
};

export const renderQRCodeSVG = (text, size = 180) => {
  return generateQRCodeSVGString(text, size);
};
