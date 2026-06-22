/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-f0c192c2'], (function (workbox) { 'use strict';

  self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "index.html",
    "revision": "35364fb0c436ae3bebec477758fdfede"
  }, {
    "url": "icon.svg",
    "revision": "e2fe4afcf21764918890a35426d742a6"
  }, {
    "url": "icon-512.png",
    "revision": "1dce541c4ecdfab82093f28896f079bd"
  }, {
    "url": "icon-192.png",
    "revision": "5861abb6a005549d3e4bf8cdd2f664d1"
  }, {
    "url": "assets/web-DkJAQUGi.js",
    "revision": null
  }, {
    "url": "assets/vendor-Cv_jTwbH.js",
    "revision": null
  }, {
    "url": "assets/motion-DCO5Q8Rr.js",
    "revision": null
  }, {
    "url": "assets/index-vDAF709y.js",
    "revision": null
  }, {
    "url": "assets/index-DTptFk3p.css",
    "revision": null
  }, {
    "url": "icon-192.png",
    "revision": "5861abb6a005549d3e4bf8cdd2f664d1"
  }, {
    "url": "icon-512.png",
    "revision": "1dce541c4ecdfab82093f28896f079bd"
  }, {
    "url": "manifest.webmanifest",
    "revision": "72e687f8231cd12999f669359f8ec4b8"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("/index.html")));

}));
