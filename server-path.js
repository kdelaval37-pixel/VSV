import path from 'node:path';

// Le chemin relatif utilise les séparateurs du système, y compris sous Windows.
export function resolvePublicFile(root, pathname, paths = path) {
  const requested = decodeURIComponent(pathname);
  if (requested.includes('\\') || requested.includes('\0')) return null;
  const target = paths.resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
  const relative = paths.relative(root, target);
  if (relative === 'index.html') return target;
  if (paths.isAbsolute(relative) || relative.startsWith('..' + paths.sep)) return null;
  const parts = relative.split(paths.sep);
  if (parts[0] !== 'src' || parts.some(part => part.startsWith('.'))) return null;
  return target;
}
