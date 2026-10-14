import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UploadProgress from './UploadProgress';

vi.mock('@openimis/fe-core', () => ({
  useModulesManager: () => ({}),
  useTranslations: () => ({
    formatMessageWithValues: (key, values) => `${key} ${values.done ?? ''}/${values.total ?? ''}`,
  }),
}));

describe('UploadProgress', () => {
  it('shows a determinate bar once the number of chunks is known', () => {
    render(<UploadProgress status="IN_PROGRESS" progress={{ stage: 'import', done: 3, total: 4 }} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    expect(screen.getByText('upload.progress.import 3/4')).toBeInTheDocument();
  });

  it('shows an indeterminate bar while the file is still being read', () => {
    render(<UploadProgress status="IN_PROGRESS" progress={{ stage: 'validation', done: 0, total: null }} />);

    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
    expect(screen.getByText('upload.progress.validationStarting /')).toBeInTheDocument();
  });

  it('shows nothing once the upload is no longer running', () => {
    const { container } = render(
      <UploadProgress status="PARTIAL_SUCCESS" progress={{ stage: 'import', done: 4, total: 4 }} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
