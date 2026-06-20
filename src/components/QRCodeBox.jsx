import { QRCodeCanvas } from "qrcode.react";

function QRCodeBox({ url, size = 180 }) {
  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "business-card-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl2 shadow-card">
      <QRCodeCanvas id="qr-canvas" value={url} size={size} />
      <button
        onClick={downloadQR}
        className="text-sm font-medium text-navy hover:underline"
      >
        Download QR Code
      </button>
    </div>
  );
}

export default QRCodeBox;
