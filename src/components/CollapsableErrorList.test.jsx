import React from 'react';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock('@openimis/fe-core', async () => {
  const i18n = await vi.importActual('@openimis/fe-core/helpers/i18n');
  const icons = await vi.importActual('@openimis/fe-core/helpers/icons');
  return { formatMessage: i18n.formatMessage, GetIconComponent: icons.default };
});

const { default: CollapsableErrorList } = await import('./CollapsableErrorList');
const { renderWithProviders, screen, userEvent } = await import('@openimis/fe-core/testing');

const messages = {
  'socialProtection.benefitPlan.benefitPlanBeneficiaries.uploadHistoryTable.error': 'Errors',
  'socialProtection.benefitPlan.benefitPlanBeneficiaries.uploadHistoryTable.errorNone': 'None',
  'individual.upload.uploadHistoryTable.error': 'Workflow Errors',
};

const ERRORS = { 'row 2': 'missing first name' };

const renderList = (props = {}) => renderWithProviders(<CollapsableErrorList {...props} />, { messages });

const header = () => screen.getByText('Errors').closest('li');

beforeEach(() => {
  // The header passes ListItem a `button` prop MUI v7 dropped, so React warns.
  // Captured, not printed; the pinned test below states the intended behaviour.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('CollapsableErrorList', () => {
  describe('when the upload had no errors', () => {
    it.each([
      ['the errors are missing', undefined],
      ['the errors are null', null],
      ['the error object is empty', {}],
    ])('says so when %s', (_label, errors) => {
      renderList({ errors });

      expect(screen.getByText('None')).toBeInTheDocument();
      expect(screen.queryByText('Errors')).not.toBeInTheDocument();
    });
  });

  describe('when the upload had errors', () => {
    it('offers them behind a header rather than showing them', () => {
      renderList({ errors: ERRORS });

      expect(screen.getByText('Errors')).toBeInTheDocument();
      expect(screen.queryByText(JSON.stringify(ERRORS))).not.toBeInTheDocument();
    });

    it('reveals the errors when the header is clicked', async () => {
      renderList({ errors: ERRORS });

      await userEvent.click(header());

      expect(screen.getByText(JSON.stringify(ERRORS))).toBeInTheDocument();
    });

    it('hides them again on a second click', async () => {
      renderList({ errors: ERRORS });

      await userEvent.click(header());
      await userEvent.click(header());

      expect(screen.queryByText(JSON.stringify(ERRORS))).not.toBeInTheDocument();
    });

    it('shows every error, not only the first', async () => {
      const errors = { 'row 2': 'missing first name', 'row 7': 'unknown location' };
      renderList({ errors });

      await userEvent.click(header());

      expect(screen.getByText(JSON.stringify(errors))).toBeInTheDocument();
    });

    it('turns the chevron over when opened', async () => {
      renderList({ errors: ERRORS });
      expect(screen.getByText('expand_more')).toBeInTheDocument();

      await userEvent.click(header());

      expect(screen.getByText('expand_less')).toBeInTheDocument();
    });
  });

  // Currently fails: ListItem lost its `button` prop in MUI v7, so the header renders as a
  // plain <li> — no role, no tab stop, no Enter key. It can only be opened with a
  // mouse, and React warns about the unknown DOM attribute on every render.
  it.fails('offers the errors through a control that can be operated by keyboard', async () => {
    renderList({ errors: ERRORS });

    const control = screen.getByRole('button', { name: /Errors/ });
    await userEvent.type(control, '{Enter}');

    expect(screen.getByText(JSON.stringify(ERRORS))).toBeInTheDocument();
  });

  // Currently fails: this module asks for socialProtection's translations, although it
  // ships its own individual.upload.uploadHistoryTable.error — which nothing
  // reads. Without social_protection installed the raw key is displayed.
  it.fails('labels itself from its own module translations', () => {
    renderList({ errors: ERRORS });

    expect(screen.getByText('Workflow Errors')).toBeInTheDocument();
  });
});
