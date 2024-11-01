import QRCode from 'qrcode';

export const generateQRCode = async (url) => {
    try {
      const qrCodeImage = QRCode.toBuffer(url, { type: 'image/png' });
      return qrCodeImage;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('QR code generation failed');
    }
  };