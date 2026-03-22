/**
 * Chrome API Mock for Playwright tests
 * Inject this script into pages to mock chrome.* APIs
 */

export const chromeMockScript = `
// Mock storage
const mockStorage = {
  data: {},
  listeners: [],

  get: function(keys, callback) {
    const result = {};
    if (typeof keys === 'string') {
      result[keys] = this.data[keys];
    } else if (Array.isArray(keys)) {
      keys.forEach(key => {
        result[key] = this.data[key];
      });
    } else if (typeof keys === 'object') {
      Object.assign(result, keys);
      Object.keys(keys).forEach(key => {
        if (this.data[key] !== undefined) {
          result[key] = this.data[key];
        }
      });
    }
    if (callback) callback(result);
    return Promise.resolve(result);
  },

  set: function(items, callback) {
    Object.assign(this.data, items);
    this.listeners.forEach(listener => {
      const changes = {};
      Object.keys(items).forEach(key => {
        changes[key] = { newValue: items[key] };
      });
      listener(changes, 'sync');
    });
    if (callback) callback();
    return Promise.resolve();
  },

  remove: function(keys, callback) {
    if (Array.isArray(keys)) {
      keys.forEach(key => delete this.data[key]);
    } else {
      delete this.data[keys];
    }
    if (callback) callback();
    return Promise.resolve();
  },

  clear: function(callback) {
    this.data = {};
    if (callback) callback();
    return Promise.resolve();
  },

  onChanged: {
    addListener: function(callback) {
      mockStorage.listeners.push(callback);
    },
    removeListener: function(callback) {
      const index = mockStorage.listeners.indexOf(callback);
      if (index > -1) mockStorage.listeners.splice(index, 1);
    },
  },
};

// Default settings
mockStorage.data = {
  enableSearchPanel: true,
  showTabCount: false,
  theme: 'system',
  language: 'en',
  searchCurrentWindow: false,
  urlDisplayStyle: 'domain',
};

// Global chrome mock
window.chrome = {
  storage: {
    sync: mockStorage,
    local: mockStorage,
    onChanged: mockStorage.onChanged,
  },
  runtime: {
    getManifest: () => ({ version: '1.0.0' }),
    getURL: (path) => path,
  },
  tabs: {
    query: () => Promise.resolve([]),
  },
};

console.log('[Chrome Mock] Initialized');
`

/**
 * 在页面中注入 Chrome API Mock
 */
export async function injectChromeMock(page: any): Promise<void> {
  await page.addInitScript(chromeMockScript)
}

/**
 * 更新 mock storage 中的数据
 */
export async function setMockStorage(page: any, data: Record<string, any>): Promise<void> {
  await page.evaluate((newData) => {
    if ((window as any).chrome?.storage?.sync) {
      (window as any).chrome.storage.sync.data = {
        ...(window as any).chrome.storage.sync.data,
        ...newData,
      };
    }
  }, data)
}

/**
 * 获取 mock storage 中的数据
 */
export async function getMockStorage(page: any): Promise<Record<string, any>> {
  return await page.evaluate(() => {
    return (window as any).chrome?.storage?.sync?.data || {}
  })
}
