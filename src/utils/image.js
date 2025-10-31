const defaultCropSettings = { top: 320, right: 25, bottom: 227, left: 1257 };

const applyCropToImage = (base64Image, settings) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const totalWidth = image.naturalWidth;
      const totalHeight = image.naturalHeight;
      const cropTop = Math.max(0, settings.top);
      const cropBottom = Math.max(0, settings.bottom);
      const cropLeft = Math.max(0, settings.left);
      const cropRight = Math.max(0, settings.right);
      const croppedWidth = totalWidth - cropLeft - cropRight;
      const croppedHeight = totalHeight - cropTop - cropBottom;
      if (croppedWidth <= 0 || croppedHeight <= 0) return resolve(base64Image);
      canvas.width = croppedWidth;
      canvas.height = croppedHeight;
      ctx.drawImage(image, cropLeft, cropTop, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);
      // blob resolve
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/webp');
    };
    image.onerror = reject;
    image.src = base64Image;
  });
};


export { defaultCropSettings, applyCropToImage };