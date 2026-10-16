const DEV_RELOAD_GUARD = `
(function () {
  var proto = Performance.prototype;
  var original = proto.getEntriesByType;
  proto.getEntriesByType = function (type) {
    var entries = original.call(this, type);
    if (type !== 'navigation' && type !== 'resource') return entries;
    return entries.map(function (entry) {
      if (!entry || entry.transferSize !== 0) return entry;
      return new Proxy(entry, {
        get: function (target, key) {
          if (key === 'transferSize') return target.decodedBodySize || 1;
          var value = target[key];
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
    });
  };
})();
`;

/**
 * Embedded browsers report `transferSize === 0` for every navigation. Next.js
 * treats that as a cache restore and reloads until the dev server gives up.
 * A native `<script>` in the root layout `<head>` runs while the document is
 * parsed, before the framework reads `performance`. `next/script` with
 * `beforeInteractive` is only valid in `pages/_document`.
 */
export function DevReloadGuard() {
  if (process.env.NODE_ENV !== 'development') return null;
  return <script dangerouslySetInnerHTML={{ __html: DEV_RELOAD_GUARD }} />;
}
