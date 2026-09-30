import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

// fe-core's barrel imports itself, so the real helpers come from their defining modules.
vi.mock('@openimis/fe-core', () => ({ baseApiUrl: '/api' }));

const utils = await import('./utils');

const BASE = `${window.location.origin}/api/individual`;

let clicks;

const stubFetch = (impl) => {
  const fetch = vi.fn(impl ?? (() => Promise.resolve({ blob: () => Promise.resolve(new Blob(['a,b'])) })));
  vi.stubGlobal('fetch', fetch);
  return fetch;
};

const flush = () => new Promise((resolve) => { setTimeout(resolve, 0); });

beforeEach(() => {
  clicks = [];
  // jsdom has no object URLs and cannot navigate — record the anchor, don't click it.
  URL.createObjectURL = vi.fn(() => 'blob:generated');
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function record() {
    clicks.push({ href: this.href, download: this.download, attached: document.body.contains(this) });
  });
});

describe('isBase64Encoded', () => {
  it.each([
    ['a global id', btoa('IndividualType:ind-1')],
    ['a numeric id', '12345'],
  ])('accepts %s', (_label, value) => {
    expect(utils.isBase64Encoded(value)).toBe(true);
  });

  it.each([
    ['a dashed uuid', '35f1cd0c-4a5f-4b7b-9b8f-8a0d0f1b2c3d'],
    ['an empty string', ''],
    ['a name with spaces', 'Ada Lovelace'],
  ])('rejects %s', (_label, value) => {
    expect(utils.isBase64Encoded(value)).toBe(false);
  });

  it('only checks the alphabet, so any word made of base64 characters passes', () => {
    expect(utils.isBase64Encoded('notEncoded')).toBe(true);
  });
});

describe('isEmptyObject', () => {
  it.each([
    ['an object literal', {}, true],
    ['an object with a key', { a: 1 }, false],
    ['an object whose only value is undefined', { a: undefined }, false],
    ['an empty array', [], true],
    ['a string', '', true],
  ])('reports %s', (_label, value, expected) => {
    expect(utils.isEmptyObject(value)).toBe(expected);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
  ])('throws on %s rather than reporting it as empty', (_label, value) => {
    expect(() => utils.isEmptyObject(value)).toThrow(TypeError);
  });
});

describe('downloadInvalidItems', () => {
  it('asks for the invalid rows of one upload', async () => {
    const fetch = stubFetch();

    utils.downloadInvalidItems('upload-1');
    await flush();

    expect(String(fetch.mock.calls[0][0])).toBe(`${BASE}/download_invalid_items/?upload_id=upload-1`);
  });

  it('offers the response as a csv named for individuals', async () => {
    stubFetch();

    utils.downloadInvalidItems('upload-1');
    await flush();

    expect(clicks).toEqual([{ href: 'blob:generated', download: 'individuals_invalid_items.csv', attached: true }]);
  });

  it('reports the reason and offers no file when the download fails', async () => {
    stubFetch(() => Promise.reject(new Error('offline')));
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    utils.downloadInvalidItems('upload-1');
    await flush();

    expect(error).toHaveBeenCalledWith('Download failed, reason: ', new Error('offline'));
    expect(clicks).toEqual([]);
  });
});

describe('downloadIndividualUploadFile', () => {
  it('identifies the file by name', async () => {
    const fetch = stubFetch();

    utils.downloadIndividualUploadFile('individuals.csv');
    await flush();

    expect(String(fetch.mock.calls[0][0]))
      .toBe(`${BASE}/download_individual_upload_file/?filename=individuals.csv`);
  });

  it('keeps the original filename on the download', async () => {
    stubFetch();

    utils.downloadIndividualUploadFile('individuals.csv');
    await flush();

    expect(clicks[0].download).toBe('individuals.csv');
  });

  it('escapes a filename containing characters a query string reserves', async () => {
    const fetch = stubFetch();

    utils.downloadIndividualUploadFile('rows &more.csv');
    await flush();

    expect(String(fetch.mock.calls[0][0])).toContain('filename=rows+%26more.csv');
  });
});

describe('the temporary link', () => {
  it('is removed from the document once the download has started', async () => {
    stubFetch();

    utils.downloadInvalidItems('upload-1');
    await flush();

    expect(clicks[0].attached).toBe(true);
    expect(document.querySelector('a')).toBeNull();
  });
});
