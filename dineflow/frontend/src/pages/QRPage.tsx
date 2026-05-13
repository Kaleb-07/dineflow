import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

const QRPage = () => {
  const [tableId, setTableId] = useState('');
  const [qrValue, setQrValue] = useState('');

  const generateQR = () => {
    const url = `${window.location.origin}/guest/${tableId}`;
    setQrValue(url);
  };

  const downloadQR = () => {
    const svg = document.querySelector('#qr-canvas') as SVGSVGElement | null;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 256;
      canvas.height = 256;
      
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `table-${tableId}-qr.png`;
        link.href = url;
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">QR Code Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Generate QR Code</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table ID
              </label>
              <input
                type="text"
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                placeholder="e.g., table-1"
                className="input-field"
              />
            </div>

            <button onClick={generateQR} className="btn-primary w-full">
              Generate QR Code
            </button>
          </div>
        </div>

        {qrValue && (
          <div className="card text-center">
            <h2 className="text-xl font-semibold mb-4">QR Code Preview</h2>
            
            <div className="flex justify-center mb-4">
              <QRCodeSVG
                id="qr-canvas"
                value={qrValue}
                size={256}
                level="H"
                includeMargin
              />
            </div>

            <p className="text-sm text-gray-600 mb-4">{qrValue}</p>

            <button onClick={downloadQR} className="btn-primary flex items-center gap-2 mx-auto">
              <Download size={20} />
              Download QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPage;
