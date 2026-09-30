import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock('@openimis/fe-core', () => ({ baseApiUrl: '/api' }));

const { default: downloadTemplate } = await import('./export');

let clicks;

const stubFetch = (impl) => {
  const fetch = vi.fn(impl ?? (() => Promise.resolve({ blob: () => Promise.resolve(new Blob(['a,b'])) })));
  vi.stubGlobal('fetch', fetch);
  return fetch;
};

const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

beforeEach(() => {
  clicks = [];
  URL.createObjectURL = vi.fn(() => 'blob:generated');
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function record() {
    clicks.push({ href: this.href, download: this.download });
  });
});

describe('downloadTemplate', () => {
  it('asks for the individual upload template', async () => {
    const fetch = stubFetch();

    downloadTemplate();
    await flush();

    expect(String(fetch.mock.calls[0][0]))
      .toBe(`${window.location.origin}/api/individual/download_template_file/`);
  });

  it('names the download after the individual template', async () => {
    stubFetch();

    downloadTemplate();
    await flush();

    expect(clicks).toEqual([{ href: 'blob:generated', download: 'individual_upload_template.csv' }]);
  });

  it('reports the reason and offers no file when the export fails', async () => {
    stubFetch(() => Promise.reject(new Error('offline')));
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    downloadTemplate();
    await flush();

    expect(error).toHaveBeenCalledWith('Export failed, reason: ', new Error('offline'));
    expect(clicks).toEqual([]);
  });
});
