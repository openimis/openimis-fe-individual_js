/* eslint-disable import/no-extraneous-dependencies -- Vitest runs from the frontend assembly */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  renderWithProviders, screen, userEvent,
} from '@openimis/fe-core/testing';

// The fe-core barrel cannot be loaded from a test: stub only what this dialog reaches.
vi.mock('@openimis/fe-core', () => ({
  useModulesManager: () => ({}),
  useTranslations: () => ({ formatMessage: (key) => key }),
}));

const { default: PreviewEnrollmentDialog } = await import('./PreviewEnrollmentDialog');

function Searcher({ benefitPlanToEnroll }) {
  return <div data-testid="searcher">{benefitPlanToEnroll.id}</div>;
}

const renderDialog = (props) => renderWithProviders(
  <PreviewEnrollmentDialog
    Searcher={Searcher}
    previewLabelKey="individual.enrollment.previewGroups"
    benefitPlanToEnroll={{ id: 'plan-uuid' }}
    rights={[]}
    {...props}
  />,
);

describe('PreviewEnrollmentDialog', () => {
  it('opens a dialog listing the records through the given searcher', async () => {
    renderDialog({});

    await userEvent.setup().click(screen.getByRole('button', { name: 'individual.enrollment.previewGroups' }));

    expect(screen.getByTestId('searcher').textContent).toBe('plan-uuid');
    expect(screen.getByRole('button', { name: 'individual.enrollment.close' })).toBeTruthy();
  });

  it('cannot be opened when nothing would be enrolled', () => {
    renderDialog({ nothingToEnroll: true });

    expect(screen.getByRole('button', { name: 'individual.enrollment.previewGroups' }).disabled).toBe(true);
  });

  it('cannot be opened once the enrollment is confirmed or without a benefit plan', () => {
    const { unmount } = renderDialog({ enrollmentConfirmed: true });
    expect(screen.getByRole('button', { name: 'individual.enrollment.previewGroups' }).disabled).toBe(true);
    unmount();

    renderDialog({ benefitPlanToEnroll: null });
    expect(screen.getByRole('button', { name: 'individual.enrollment.previewGroups' }).disabled).toBe(true);
  });
});
