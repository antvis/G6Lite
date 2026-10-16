import Script from 'next/script';

const DEV_RELOAD_GUARD = `(function(){
  var proto = Performance.prototype;
  var original = proto.getEntriesByType;
  proto.getEntriesByType = function(type){
    var entries = original.call(this, type);
    var entry = entries && entries[0];
    if (type !== 'navigation' || !entry || entry.transferSize !== 0) return entries;
    return [new Proxy(entry, {
      get: function(target, prop, receiver){
        if (prop === 'transferSize') return target.decodedBodySize || 1;
        var value = Reflect.get(target, prop, receiver);
        return typeof value === 'function' ? value.bind(target) : value;
      }
    })];
  };
})();`;

/**
 * Next.js dev reloads the document when navigation timing reports
 * `transferSize === 0`, treating it as a cache restore. Some embedded
 * browsers always report 0 for a live response, so the page reloads forever.
 * This runs before the framework reads that value. Production builds omit it.
 */
export function DevReloadGuard() {
  if (process.env.NODE_ENV !== 'development') return null;
  return (
    <Script id="g6lite-dev-reload-guard" strategy="beforeInteractive">
      {DEV_RELOAD_GUARD}
    </Script>
  );
}
