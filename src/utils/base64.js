function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob); // → dataURL string
  });
}

function base64ToBlob(base64) {
  const [meta, data] = base64.split(",");
  const mime = meta.match(/:(.*?);/)[1];
  const binary = atob(data);

  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return new Blob([buffer], { type: mime });
}

export {blobToBase64, base64ToBlob};