import { baseApiUrl } from '@openimis/fe-core';

export function isBase64Encoded(str) {
  // Base64 encoded strings can only contain characters from [A-Za-z0-9+/=]
  const base64RegExp = /^[A-Za-z0-9+/=]+$/;
  return base64RegExp.test(str);
}

export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

export function downloadInvalidItems(uploadId) {
  const url = new URL(
    `${window.location.origin}${baseApiUrl}/individual/download_invalid_items/?upload_id=${uploadId}`,
  );
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'individuals_invalid_items.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => {
      console.error('Export failed, reason: ', error);
    });
}
