import { baseApiUrl } from '@openimis/fe-core';

export function isBase64Encoded(str) {
  // Base64 encoded strings can only contain characters from [A-Za-z0-9+/=]
  const base64RegExp = /^[A-Za-z0-9+/=]+$/;
  return base64RegExp.test(str);
}

export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

function downloadFile(url, filename) {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Download failed, reason: ', error);
    });
}

export function downloadInvalidItems(uploadId) {
  const baseUrl = new URL(`${window.location.origin}${baseApiUrl}/individual/download_invalid_items/`);
  const queryParams = new URLSearchParams({ upload_id: uploadId });
  const url = `${baseUrl}?${queryParams.toString()}`;
  downloadFile(url, 'individuals_invalid_items.csv');
}

export function downloadIndividualUploadFile(filename) {
  const baseUrl = `${window.location.origin}${baseApiUrl}/individual/download_individual_upload_file/`;
  const queryParams = new URLSearchParams({ filename });
  const url = `${baseUrl}?${queryParams.toString()}`;
  downloadFile(url, filename);
}
