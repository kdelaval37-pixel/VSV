import {test} from 'node:test';
import assert from 'node:assert/strict';
import {posix, win32} from 'node:path';
import {resolvePublicFile} from '../server-path.js';
for (const [name, paths, root] of [['Linux', posix, '/workspace/VSV'], ['Windows', win32, 'C:\\Users\\Bénévole\\VSV']]) {
  test(`HTML, styles et modules servis sous ${name}`, () => {
    for (const url of ['/', '/index.html', '/src/style.css', '/src/app.js', '/src/model.js', '/src/storage.js', '/src/document.js']) {
      assert.equal(resolvePublicFile(root, url, paths), paths.join(root, url === '/' ? 'index.html' : url.slice(1)));
    }
  });
  test(`fichiers privés et traversées refusés sous ${name}`, () => {
    for (const url of ['/.git/config', '/server.js', '/src/../../secret', '/src/%2e%2e/%2e%2e/secret', '/src/..%5c..%5csecret', '/src/.hidden']) {
      assert.equal(resolvePublicFile(root, url, paths), null);
    }
  });
}
