import { baseApiUrl } from '@openimis/fe-core';

export default function downloadTemplate() {
  const url = new URL(
    `${window.location.origin}${baseApiUrl}/individual/download_template_file/`,
  );

  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'individual_upload_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Export failed, reason: ', error);
    });
}
