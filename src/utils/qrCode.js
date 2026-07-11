import QRCode from 'qrcode';

/**
 * Tujuan function ini untuk membuat QR code lokal dari URI TOTP Clerk
 * tanpa mengirim secret authenticator ke layanan pihak ketiga.
 */
export const createQrCodeSvgDataUri = async value => {
    const normalizedValue = String(value || '').trim();

    if(normalizedValue === '')
        return '';

    const svg = await QRCode.toString(normalizedValue, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 4,
        color: {
            dark: '#0f172a',
            light: '#ffffff',
        },
    });

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};
