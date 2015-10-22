require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function HistoryApiAdapter(mount) {
  var adapter = {
    //renderData is a hash of data, params, and component
    // per resolved part of url
    renderer: function renderer(renderData) {
      var renderArr = Object.keys(renderData).map(function (mask) {
        return {
          mask: mask,
          component: renderData[mask].component,
          params: renderData[mask].params,
          data: renderData[mask].data
        };
      });
      function renderComp(renderArr) {
        var partial = renderArr.shift();

        if (renderArr.length > 0) partial.params.children = [renderComp(renderArr)];
        partial.params.mask = partial.mask;
        partial.params.data = partial.data;

        if (!partial.component) {
          var result = partial.data || '';
          if (partial.params.children && partial.params.children[0]) result += partial.params.children[0];
          return result;
        }

        return partial.component(partial.params);
      }
      return renderComp(renderArr);
    }
  };

  var currentRenderData;

  adapter.handleTransition = function (data) {

    var renderData = Object.keys(data.handler.resolvedModels).reduce(function (result, key) {
      result[key] = data.renderData[key] ? data.renderData[key] : currentRenderData[key];
      return result;
    }, {});
    currentRenderData = renderData;
    mount(adapter.renderer(renderData));
  };

  function handle() {
    var localUrl = document.location.pathname + document.location.search;
    adapter.handleURL(localUrl).then(function (data) {
      return adapter.renderer(data.renderData);
    }).then(mount);
  }

  adapter.updateURL = function (url) {
    history.pushState(null, null, url);
  };

  window.onpopstate = handle;
  return adapter;
}

module.exports = HistoryApiAdapter;

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _index = require("../../index");

var _index2 = _interopRequireDefault(_index);

var Router = (0, _index2['default'])();

Router(function (Router) {
  Router('/items', function (Router) {
    Router('/:id').component(itemComp).then(getItem);
  }).component(itemsComp).then(getItems);
}).component(rootComp).then(count);

function itemComp(params) {
  return '<div>\n    <label>ID: ' + params.data.id + '</label>\n    <h5>name: ' + params.data.name + '</h5>\n    <p>' + params.data.description + '</p>\n    ' + (params.children || '') + '\n  </div>';
}

function itemsComp(params) {
  var items = params.data.map(function (item) {
    return '<li><a href="/items/' + item.id + '">' + item.name + '</a></li>';
  }).join("");
  return '<div>\n    <ul>' + items + '</ul>\n    ' + (params.children || '') + '\n  </div>';
}

function rootComp(params) {
  return '<div>\n    <h1><a href="/">Router Example APP</a> (' + (params.data || 0) + ')</h1>\n    <a href="/items">Items</a>\n    ' + (params.children || '') + '\n  </div>';
}

function getItems() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(Items);
    }, 100);
  });
}

function getItem(data, context) {
  return Items.reduce(function (result, item) {
    if (result) return result;
    if (item.id == context.params.id) return item;
  }, null);
}

function count() {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(Items.length);
    }, 100);
  });
}

var Items = [{
  id: 1,
  name: "Item1",
  description: "The Item Description"
}, {
  id: 2,
  name: "Item2",
  description: "The Item2 Description"
}, {
  id: 3,
  name: "Item3",
  description: "The Item3 Description"
}];

var Router = Router;
exports.Router = Router;

},{"../../index":4}],4:[function(require,module,exports){
'use strict';

var Router = require('./router.js');
var PromisePipe = require('../../src/PromisePipe')();
var Promise = require('es6-promise').Promise;

module.exports = function PPRouterFactory() {
  var router = new Router();
  var renderer = null;
  var stateConfig = {};
  var initContext = function initContext() {
    return {};
  };

  function PPRouter() {
    var args = Array.prototype.slice.call(arguments);
    var options = typeof args[0] == 'object' ? args.shift() : {};
    var stateId = typeof args[0] == 'string' ? args.shift() : '/';
    var handler = typeof args[0] == 'function' ? args.shift() : undefined;

    var RoutePipe = PromisePipe();

    var prepareParents = options.parents ? [].concat(options.parents, [stateId]) : [stateId];

    var uniquePath = prepareParents.join("");

    stateConfig[uniquePath] = {
      model: function model(params, transition) {
        transition._context = transition._context || {};
        var handlerContext = Object.keys(transition._context).reduce(function (context, propName) {
          context[propName] = transition._context[propName];
          return context;
        }, {});

        handlerContext.__proto__ = {
          router: router,
          params: params,
          transition: transition,
          id: prepareParents.join(''),
          config: stateConfig[uniquePath],
          parents: options.parents
        };
        handlerContext.transition._context = undefined;

        return RoutePipe(null, handlerContext).then(function (data) {
          if (!transition.renderData) transition.renderData = {};
          transition.renderData[uniquePath || "/"] = {
            data: data,
            params: params,
            component: stateConfig[uniquePath].component
          };
        });
      },
      enter: function enter(PP) {
        return PP;
      },
      //debugging
      events: {
        error: function error(err) {
          console.log(arguments, "ERROR WHEN TRANSITION");
          console.log(err.message);
        }
      }
    };

    function augmentContext(context, property, value) {
      Object.defineProperty(context, property, {
        value: value,
        writable: false,
        enumerable: false,
        configurable: true
      });
    }
    if (!options.match) {
      if (!!handler) {
        router.map(function (match) {
          match('/').to('/', function (nmatch) {
            handler(PPRouter.bind(PPRouter, {
              match: nmatch,
              parents: prepareParents
            }));
            PPRouter.call(PPRouter, {
              match: nmatch,
              parents: prepareParents
            }, "/");
          });
        });
      } else {
        router.map(function (match) {
          match('/').to('/');
        });
      }
    } else {
      if (!!handler) {
        options.match(stateId).to(uniquePath, function (match) {
          handler(PPRouter.bind(PPRouter, {
            match: match,
            parents: prepareParents
          }));
          if (!stateConfig[uniquePath + "/"]) {
            PPRouter.call(PPRouter, {
              match: match,
              parents: prepareParents
            }, "/");
          }
        });
      } else {
        options.match(stateId).to(uniquePath);
      }
    }
    RoutePipe.component = function (comp) {
      stateConfig[uniquePath].component = comp;
      return RoutePipe;
    };

    return RoutePipe;
  }

  PPRouter.prepareRenderData = function (state) {
    return Object.keys(state).reduce(function (result, key) {
      result[key].component = stateConfig[key].component;
      return result;
    }, state);
  };

  PPRouter.use = function (adapter) {
    if (!adapter) throw new Error("Adapter required");
    if (adapter.renderer) renderer = adapter.renderer;
    if (adapter.updateURL) router.updateURL = adapter.updateURL;
    if (router.reset) adapter.routerReset = router.reset;
    if (adapter.initContext) initContext = adapter.initContext;
    adapter.handleURL = function (url, context) {
      var handler = router.handleURL.call(router, url);

      if (context) handler._context = context;
      return new Promise(function (resolve, reject) {
        handler.then(function () {
          resolve({
            renderData: handler.renderData,
            handler: handler
          });
        });
        handler['catch'](function (err) {
          reject(err);
        });
      });
    };

    if (adapter.handleTransition) {
      var transitionTo = router.transitionTo;
      router.transitionTo = function (to, context) {
        var handler = transitionTo.call(router, to);

        if (context) handler._context = context;
        return new Promise(function (resolve, reject) {
          handler.then(function () {
            resolve({
              renderData: handler.renderData,
              handler: handler
            });
          });
          handler['catch'](function (err) {
            reject(err);
          });
        }).then(adapter.handleTransition)['catch'](function (e) {
          console.log("Failed Handling", e);
        });
      };
    }
  };

  router.getHandler = function (name) {
    return stateConfig[name];
  };

  PPRouter.router = router;

  PPRouter.PromisePipe = PromisePipe;

  return PPRouter;
};

},{"../../src/PromisePipe":10,"./router.js":6,"es6-promise":5}],5:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.3.0
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      var nextTick = process.nextTick;
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // setImmediate should be used instead instead
      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
        nextTick = setImmediate;
      }
      return function() {
        nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertex() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertex();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFullfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFullfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$asap(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":2}],6:[function(require,module,exports){
(function (process){
'use strict';var commonObj={};var realRequire=require;var define,requireModule,require,requirejs; /*!
 * @overview RSVP - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
 * @version   3.0.18
 */(function(){"use strict";function lib$rsvp$utils$$objectOrFunction(x){return typeof x === 'function' || typeof x === 'object' && x !== null;}function lib$rsvp$utils$$isFunction(x){return typeof x === 'function';}function lib$rsvp$utils$$isMaybeThenable(x){return typeof x === 'object' && x !== null;}var lib$rsvp$utils$$_isArray;if(!Array.isArray){lib$rsvp$utils$$_isArray = function(x){return Object.prototype.toString.call(x) === '[object Array]';};}else {lib$rsvp$utils$$_isArray = Array.isArray;}var lib$rsvp$utils$$isArray=lib$rsvp$utils$$_isArray;var lib$rsvp$utils$$now=Date.now || function(){return new Date().getTime();};function lib$rsvp$utils$$F(){}var lib$rsvp$utils$$o_create=Object.create || function(o){if(arguments.length > 1){throw new Error('Second argument not supported');}if(typeof o !== 'object'){throw new TypeError('Argument must be an object');}lib$rsvp$utils$$F.prototype = o;return new lib$rsvp$utils$$F();};function lib$rsvp$events$$indexOf(callbacks,callback){for(var i=0,l=callbacks.length;i < l;i++) {if(callbacks[i] === callback){return i;}}return -1;}function lib$rsvp$events$$callbacksFor(object){var callbacks=object._promiseCallbacks;if(!callbacks){callbacks = object._promiseCallbacks = {};}return callbacks;}var lib$rsvp$events$$default={ /**
        `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For
        Example:

        ```javascript
        var object = {};

        RSVP.EventTarget.mixin(object);

        object.on('finished', function(event) {
          // handle event
        });

        object.trigger('finished', { detail: value });
        ```

        `EventTarget.mixin` also works with prototypes:

        ```javascript
        var Person = function() {};
        RSVP.EventTarget.mixin(Person.prototype);

        var yehuda = new Person();
        var tom = new Person();

        yehuda.on('poke', function(event) {
          console.log('Yehuda says OW');
        });

        tom.on('poke', function(event) {
          console.log('Tom says OW');
        });

        yehuda.trigger('poke');
        tom.trigger('poke');
        ```

        @method mixin
        @for RSVP.EventTarget
        @private
        @param {Object} object object to extend with EventTarget methods
      */'mixin':function mixin(object){object['on'] = this['on'];object['off'] = this['off'];object['trigger'] = this['trigger'];object._promiseCallbacks = undefined;return object;}, /**
        Registers a callback to be executed when `eventName` is triggered

        ```javascript
        object.on('event', function(eventInfo){
          // handle the event
        });

        object.trigger('event');
        ```

        @method on
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to listen for
        @param {Function} callback function to be called when the event is triggered.
      */'on':function on(eventName,callback){var allCallbacks=lib$rsvp$events$$callbacksFor(this),callbacks;callbacks = allCallbacks[eventName];if(!callbacks){callbacks = allCallbacks[eventName] = [];}if(lib$rsvp$events$$indexOf(callbacks,callback) === -1){callbacks.push(callback);}}, /**
        You can use `off` to stop firing a particular callback for an event:

        ```javascript
        function doStuff() { // do stuff! }
        object.on('stuff', doStuff);

        object.trigger('stuff'); // doStuff will be called

        // Unregister ONLY the doStuff callback
        object.off('stuff', doStuff);
        object.trigger('stuff'); // doStuff will NOT be called
        ```

        If you don't pass a `callback` argument to `off`, ALL callbacks for the
        event will not be executed when the event fires. For example:

        ```javascript
        var callback1 = function(){};
        var callback2 = function(){};

        object.on('stuff', callback1);
        object.on('stuff', callback2);

        object.trigger('stuff'); // callback1 and callback2 will be executed.

        object.off('stuff');
        object.trigger('stuff'); // callback1 and callback2 will not be executed!
        ```

        @method off
        @for RSVP.EventTarget
        @private
        @param {String} eventName event to stop listening to
        @param {Function} callback optional argument. If given, only the function
        given will be removed from the event's callback queue. If no `callback`
        argument is given, all callbacks will be removed from the event's callback
        queue.
      */'off':function off(eventName,callback){var allCallbacks=lib$rsvp$events$$callbacksFor(this),callbacks,index;if(!callback){allCallbacks[eventName] = [];return;}callbacks = allCallbacks[eventName];index = lib$rsvp$events$$indexOf(callbacks,callback);if(index !== -1){callbacks.splice(index,1);}}, /**
        Use `trigger` to fire custom events. For example:

        ```javascript
        object.on('foo', function(){
          console.log('foo event happened!');
        });
        object.trigger('foo');
        // 'foo event happened!' logged to the console
        ```

        You can also pass a value as a second argument to `trigger` that will be
        passed as an argument to all event listeners for the event:

        ```javascript
        object.on('foo', function(value){
          console.log(value.name);
        });

        object.trigger('foo', { name: 'bar' });
        // 'bar' logged to the console
        ```

        @method trigger
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to be triggered
        @param {Any} options optional value to be passed to any event handlers for
        the given `eventName`
      */'trigger':function trigger(eventName,options){var allCallbacks=lib$rsvp$events$$callbacksFor(this),callbacks,callback;if(callbacks = allCallbacks[eventName]){ // Don't cache the callbacks.length since it may grow
for(var i=0;i < callbacks.length;i++) {callback = callbacks[i];callback(options);}}}};var lib$rsvp$config$$config={instrument:false};lib$rsvp$events$$default['mixin'](lib$rsvp$config$$config);function lib$rsvp$config$$configure(name,value){if(name === 'onerror'){ // handle for legacy users that expect the actual
// error to be passed to their function added via
// `RSVP.configure('onerror', someFunctionHere);`
lib$rsvp$config$$config['on']('error',value);return;}if(arguments.length === 2){lib$rsvp$config$$config[name] = value;}else {return lib$rsvp$config$$config[name];}}var lib$rsvp$instrument$$queue=[];function lib$rsvp$instrument$$scheduleFlush(){setTimeout(function(){var entry;for(var i=0;i < lib$rsvp$instrument$$queue.length;i++) {entry = lib$rsvp$instrument$$queue[i];var payload=entry.payload;payload.guid = payload.key + payload.id;payload.childGuid = payload.key + payload.childId;if(payload.error){payload.stack = payload.error.stack;}lib$rsvp$config$$config['trigger'](entry.name,entry.payload);}lib$rsvp$instrument$$queue.length = 0;},50);}function lib$rsvp$instrument$$instrument(eventName,promise,child){if(1 === lib$rsvp$instrument$$queue.push({name:eventName,payload:{key:promise._guidKey,id:promise._id,eventName:eventName,detail:promise._result,childId:child && child._id,label:promise._label,timeStamp:lib$rsvp$utils$$now(),error:lib$rsvp$config$$config["instrument-with-stack"]?new Error(promise._label):null}})){lib$rsvp$instrument$$scheduleFlush();}}var lib$rsvp$instrument$$default=lib$rsvp$instrument$$instrument;function lib$rsvp$$internal$$withOwnPromise(){return new TypeError('A promises callback cannot return that same promise.');}function lib$rsvp$$internal$$noop(){}var lib$rsvp$$internal$$PENDING=void 0;var lib$rsvp$$internal$$FULFILLED=1;var lib$rsvp$$internal$$REJECTED=2;var lib$rsvp$$internal$$GET_THEN_ERROR=new lib$rsvp$$internal$$ErrorObject();function lib$rsvp$$internal$$getThen(promise){try{return promise.then;}catch(error) {lib$rsvp$$internal$$GET_THEN_ERROR.error = error;return lib$rsvp$$internal$$GET_THEN_ERROR;}}function lib$rsvp$$internal$$tryThen(then,value,fulfillmentHandler,rejectionHandler){try{then.call(value,fulfillmentHandler,rejectionHandler);}catch(e) {return e;}}function lib$rsvp$$internal$$handleForeignThenable(promise,thenable,then){lib$rsvp$config$$config.async(function(promise){var sealed=false;var error=lib$rsvp$$internal$$tryThen(then,thenable,function(value){if(sealed){return;}sealed = true;if(thenable !== value){lib$rsvp$$internal$$resolve(promise,value);}else {lib$rsvp$$internal$$fulfill(promise,value);}},function(reason){if(sealed){return;}sealed = true;lib$rsvp$$internal$$reject(promise,reason);},'Settle: ' + (promise._label || ' unknown promise'));if(!sealed && error){sealed = true;lib$rsvp$$internal$$reject(promise,error);}},promise);}function lib$rsvp$$internal$$handleOwnThenable(promise,thenable){if(thenable._state === lib$rsvp$$internal$$FULFILLED){lib$rsvp$$internal$$fulfill(promise,thenable._result);}else if(thenable._state === lib$rsvp$$internal$$REJECTED){thenable._onError = null;lib$rsvp$$internal$$reject(promise,thenable._result);}else {lib$rsvp$$internal$$subscribe(thenable,undefined,function(value){if(thenable !== value){lib$rsvp$$internal$$resolve(promise,value);}else {lib$rsvp$$internal$$fulfill(promise,value);}},function(reason){lib$rsvp$$internal$$reject(promise,reason);});}}function lib$rsvp$$internal$$handleMaybeThenable(promise,maybeThenable){if(maybeThenable.constructor === promise.constructor){lib$rsvp$$internal$$handleOwnThenable(promise,maybeThenable);}else {var then=lib$rsvp$$internal$$getThen(maybeThenable);if(then === lib$rsvp$$internal$$GET_THEN_ERROR){lib$rsvp$$internal$$reject(promise,lib$rsvp$$internal$$GET_THEN_ERROR.error);}else if(then === undefined){lib$rsvp$$internal$$fulfill(promise,maybeThenable);}else if(lib$rsvp$utils$$isFunction(then)){lib$rsvp$$internal$$handleForeignThenable(promise,maybeThenable,then);}else {lib$rsvp$$internal$$fulfill(promise,maybeThenable);}}}function lib$rsvp$$internal$$resolve(promise,value){if(promise === value){lib$rsvp$$internal$$fulfill(promise,value);}else if(lib$rsvp$utils$$objectOrFunction(value)){lib$rsvp$$internal$$handleMaybeThenable(promise,value);}else {lib$rsvp$$internal$$fulfill(promise,value);}}function lib$rsvp$$internal$$publishRejection(promise){if(promise._onError){promise._onError(promise._result);}lib$rsvp$$internal$$publish(promise);}function lib$rsvp$$internal$$fulfill(promise,value){if(promise._state !== lib$rsvp$$internal$$PENDING){return;}promise._result = value;promise._state = lib$rsvp$$internal$$FULFILLED;if(promise._subscribers.length === 0){if(lib$rsvp$config$$config.instrument){lib$rsvp$instrument$$default('fulfilled',promise);}}else {lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish,promise);}}function lib$rsvp$$internal$$reject(promise,reason){if(promise._state !== lib$rsvp$$internal$$PENDING){return;}promise._state = lib$rsvp$$internal$$REJECTED;promise._result = reason;lib$rsvp$config$$config.async(lib$rsvp$$internal$$publishRejection,promise);}function lib$rsvp$$internal$$subscribe(parent,child,onFulfillment,onRejection){var subscribers=parent._subscribers;var length=subscribers.length;parent._onError = null;subscribers[length] = child;subscribers[length + lib$rsvp$$internal$$FULFILLED] = onFulfillment;subscribers[length + lib$rsvp$$internal$$REJECTED] = onRejection;if(length === 0 && parent._state){lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish,parent);}}function lib$rsvp$$internal$$publish(promise){var subscribers=promise._subscribers;var settled=promise._state;if(lib$rsvp$config$$config.instrument){lib$rsvp$instrument$$default(settled === lib$rsvp$$internal$$FULFILLED?'fulfilled':'rejected',promise);}if(subscribers.length === 0){return;}var child,callback,detail=promise._result;for(var i=0;i < subscribers.length;i += 3) {child = subscribers[i];callback = subscribers[i + settled];if(child){lib$rsvp$$internal$$invokeCallback(settled,child,callback,detail);}else {callback(detail);}}promise._subscribers.length = 0;}function lib$rsvp$$internal$$ErrorObject(){this.error = null;}var lib$rsvp$$internal$$TRY_CATCH_ERROR=new lib$rsvp$$internal$$ErrorObject();function lib$rsvp$$internal$$tryCatch(callback,detail){try{return callback(detail);}catch(e) {lib$rsvp$$internal$$TRY_CATCH_ERROR.error = e;return lib$rsvp$$internal$$TRY_CATCH_ERROR;}}function lib$rsvp$$internal$$invokeCallback(settled,promise,callback,detail){var hasCallback=lib$rsvp$utils$$isFunction(callback),value,error,succeeded,failed;if(hasCallback){value = lib$rsvp$$internal$$tryCatch(callback,detail);if(value === lib$rsvp$$internal$$TRY_CATCH_ERROR){failed = true;error = value.error;value = null;}else {succeeded = true;}if(promise === value){lib$rsvp$$internal$$reject(promise,lib$rsvp$$internal$$withOwnPromise());return;}}else {value = detail;succeeded = true;}if(promise._state !== lib$rsvp$$internal$$PENDING){ // noop
}else if(hasCallback && succeeded){lib$rsvp$$internal$$resolve(promise,value);}else if(failed){lib$rsvp$$internal$$reject(promise,error);}else if(settled === lib$rsvp$$internal$$FULFILLED){lib$rsvp$$internal$$fulfill(promise,value);}else if(settled === lib$rsvp$$internal$$REJECTED){lib$rsvp$$internal$$reject(promise,value);}}function lib$rsvp$$internal$$initializePromise(promise,resolver){var resolved=false;try{resolver(function resolvePromise(value){if(resolved){return;}resolved = true;lib$rsvp$$internal$$resolve(promise,value);},function rejectPromise(reason){if(resolved){return;}resolved = true;lib$rsvp$$internal$$reject(promise,reason);});}catch(e) {lib$rsvp$$internal$$reject(promise,e);}}function lib$rsvp$enumerator$$makeSettledResult(state,position,value){if(state === lib$rsvp$$internal$$FULFILLED){return {state:'fulfilled',value:value};}else {return {state:'rejected',reason:value};}}function lib$rsvp$enumerator$$Enumerator(Constructor,input,abortOnReject,label){this._instanceConstructor = Constructor;this.promise = new Constructor(lib$rsvp$$internal$$noop,label);this._abortOnReject = abortOnReject;if(this._validateInput(input)){this._input = input;this.length = input.length;this._remaining = input.length;this._init();if(this.length === 0){lib$rsvp$$internal$$fulfill(this.promise,this._result);}else {this.length = this.length || 0;this._enumerate();if(this._remaining === 0){lib$rsvp$$internal$$fulfill(this.promise,this._result);}}}else {lib$rsvp$$internal$$reject(this.promise,this._validationError());}}var lib$rsvp$enumerator$$default=lib$rsvp$enumerator$$Enumerator;lib$rsvp$enumerator$$Enumerator.prototype._validateInput = function(input){return lib$rsvp$utils$$isArray(input);};lib$rsvp$enumerator$$Enumerator.prototype._validationError = function(){return new Error('Array Methods must be provided an Array');};lib$rsvp$enumerator$$Enumerator.prototype._init = function(){this._result = new Array(this.length);};lib$rsvp$enumerator$$Enumerator.prototype._enumerate = function(){var length=this.length;var promise=this.promise;var input=this._input;for(var i=0;promise._state === lib$rsvp$$internal$$PENDING && i < length;i++) {this._eachEntry(input[i],i);}};lib$rsvp$enumerator$$Enumerator.prototype._eachEntry = function(entry,i){var c=this._instanceConstructor;if(lib$rsvp$utils$$isMaybeThenable(entry)){if(entry.constructor === c && entry._state !== lib$rsvp$$internal$$PENDING){entry._onError = null;this._settledAt(entry._state,i,entry._result);}else {this._willSettleAt(c.resolve(entry),i);}}else {this._remaining--;this._result[i] = this._makeResult(lib$rsvp$$internal$$FULFILLED,i,entry);}};lib$rsvp$enumerator$$Enumerator.prototype._settledAt = function(state,i,value){var promise=this.promise;if(promise._state === lib$rsvp$$internal$$PENDING){this._remaining--;if(this._abortOnReject && state === lib$rsvp$$internal$$REJECTED){lib$rsvp$$internal$$reject(promise,value);}else {this._result[i] = this._makeResult(state,i,value);}}if(this._remaining === 0){lib$rsvp$$internal$$fulfill(promise,this._result);}};lib$rsvp$enumerator$$Enumerator.prototype._makeResult = function(state,i,value){return value;};lib$rsvp$enumerator$$Enumerator.prototype._willSettleAt = function(promise,i){var enumerator=this;lib$rsvp$$internal$$subscribe(promise,undefined,function(value){enumerator._settledAt(lib$rsvp$$internal$$FULFILLED,i,value);},function(reason){enumerator._settledAt(lib$rsvp$$internal$$REJECTED,i,reason);});};function lib$rsvp$promise$all$$all(entries,label){return new lib$rsvp$enumerator$$default(this,entries,true, /* abort on reject */label).promise;}var lib$rsvp$promise$all$$default=lib$rsvp$promise$all$$all;function lib$rsvp$promise$race$$race(entries,label){ /*jshint validthis:true */var Constructor=this;var promise=new Constructor(lib$rsvp$$internal$$noop,label);if(!lib$rsvp$utils$$isArray(entries)){lib$rsvp$$internal$$reject(promise,new TypeError('You must pass an array to race.'));return promise;}var length=entries.length;function onFulfillment(value){lib$rsvp$$internal$$resolve(promise,value);}function onRejection(reason){lib$rsvp$$internal$$reject(promise,reason);}for(var i=0;promise._state === lib$rsvp$$internal$$PENDING && i < length;i++) {lib$rsvp$$internal$$subscribe(Constructor.resolve(entries[i]),undefined,onFulfillment,onRejection);}return promise;}var lib$rsvp$promise$race$$default=lib$rsvp$promise$race$$race;function lib$rsvp$promise$resolve$$resolve(object,label){ /*jshint validthis:true */var Constructor=this;if(object && typeof object === 'object' && object.constructor === Constructor){return object;}var promise=new Constructor(lib$rsvp$$internal$$noop,label);lib$rsvp$$internal$$resolve(promise,object);return promise;}var lib$rsvp$promise$resolve$$default=lib$rsvp$promise$resolve$$resolve;function lib$rsvp$promise$reject$$reject(reason,label){ /*jshint validthis:true */var Constructor=this;var promise=new Constructor(lib$rsvp$$internal$$noop,label);lib$rsvp$$internal$$reject(promise,reason);return promise;}var lib$rsvp$promise$reject$$default=lib$rsvp$promise$reject$$reject;var lib$rsvp$promise$$guidKey='rsvp_' + lib$rsvp$utils$$now() + '-';var lib$rsvp$promise$$counter=0;function lib$rsvp$promise$$needsResolver(){throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');}function lib$rsvp$promise$$needsNew(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");} /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise’s eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class RSVP.Promise
      @param {function} resolver
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @constructor
    */function lib$rsvp$promise$$Promise(resolver,label){this._id = lib$rsvp$promise$$counter++;this._label = label;this._state = undefined;this._result = undefined;this._subscribers = [];if(lib$rsvp$config$$config.instrument){lib$rsvp$instrument$$default('created',this);}if(lib$rsvp$$internal$$noop !== resolver){if(!lib$rsvp$utils$$isFunction(resolver)){lib$rsvp$promise$$needsResolver();}if(!(this instanceof lib$rsvp$promise$$Promise)){lib$rsvp$promise$$needsNew();}lib$rsvp$$internal$$initializePromise(this,resolver);}}var lib$rsvp$promise$$default=lib$rsvp$promise$$Promise; // deprecated
lib$rsvp$promise$$Promise.cast = lib$rsvp$promise$resolve$$default;lib$rsvp$promise$$Promise.all = lib$rsvp$promise$all$$default;lib$rsvp$promise$$Promise.race = lib$rsvp$promise$race$$default;lib$rsvp$promise$$Promise.resolve = lib$rsvp$promise$resolve$$default;lib$rsvp$promise$$Promise.reject = lib$rsvp$promise$reject$$default;lib$rsvp$promise$$Promise.prototype = {constructor:lib$rsvp$promise$$Promise,_guidKey:lib$rsvp$promise$$guidKey,_onError:function _onError(reason){lib$rsvp$config$$config.async(function(promise){setTimeout(function(){if(promise._onError){lib$rsvp$config$$config['trigger']('error',reason);}},0);},this);}, /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */then:function then(onFulfillment,onRejection,label){var parent=this;var state=parent._state;if(state === lib$rsvp$$internal$$FULFILLED && !onFulfillment || state === lib$rsvp$$internal$$REJECTED && !onRejection){if(lib$rsvp$config$$config.instrument){lib$rsvp$instrument$$default('chained',this,this);}return this;}parent._onError = null;var child=new this.constructor(lib$rsvp$$internal$$noop,label);var result=parent._result;if(lib$rsvp$config$$config.instrument){lib$rsvp$instrument$$default('chained',parent,child);}if(state){var callback=arguments[state - 1];lib$rsvp$config$$config.async(function(){lib$rsvp$$internal$$invokeCallback(state,child,callback,result);});}else {lib$rsvp$$internal$$subscribe(parent,child,onFulfillment,onRejection);}return child;}, /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */'catch':function _catch(onRejection,label){return this.then(null,onRejection,label);}, /**
      `finally` will be invoked regardless of the promise's fate just as native
      try/catch/finally behaves

      Synchronous example:

      ```js
      findAuthor() {
        if (Math.random() > 0.5) {
          throw new Error();
        }
        return new Author();
      }

      try {
        return findAuthor(); // succeed or fail
      } catch(error) {
        return findOtherAuther();
      } finally {
        // always runs
        // doesn't affect the return value
      }
      ```

      Asynchronous example:

      ```js
      findAuthor().catch(function(reason){
        return findOtherAuther();
      }).finally(function(){
        // author was either found, or not
      });
      ```

      @method finally
      @param {Function} callback
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */'finally':function _finally(callback,label){var constructor=this.constructor;return this.then(function(value){return constructor.resolve(callback()).then(function(){return value;});},function(reason){return constructor.resolve(callback()).then(function(){throw reason;});},label);}};function lib$rsvp$all$settled$$AllSettled(Constructor,entries,label){this._superConstructor(Constructor,entries,false, /* don't abort on reject */label);}lib$rsvp$all$settled$$AllSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);lib$rsvp$all$settled$$AllSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;lib$rsvp$all$settled$$AllSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;lib$rsvp$all$settled$$AllSettled.prototype._validationError = function(){return new Error('allSettled must be called with an array');};function lib$rsvp$all$settled$$allSettled(entries,label){return new lib$rsvp$all$settled$$AllSettled(lib$rsvp$promise$$default,entries,label).promise;}var lib$rsvp$all$settled$$default=lib$rsvp$all$settled$$allSettled;function lib$rsvp$all$$all(array,label){return lib$rsvp$promise$$default.all(array,label);}var lib$rsvp$all$$default=lib$rsvp$all$$all;var lib$rsvp$asap$$len=0;var lib$rsvp$asap$$toString=({}).toString;var lib$rsvp$asap$$vertxNext;function lib$rsvp$asap$$asap(callback,arg){lib$rsvp$asap$$queue[lib$rsvp$asap$$len] = callback;lib$rsvp$asap$$queue[lib$rsvp$asap$$len + 1] = arg;lib$rsvp$asap$$len += 2;if(lib$rsvp$asap$$len === 2){ // If len is 1, that means that we need to schedule an async flush.
// If additional callbacks are queued before the queue is flushed, they
// will be processed by this flush that we are scheduling.
lib$rsvp$asap$$scheduleFlush();}}var lib$rsvp$asap$$default=lib$rsvp$asap$$asap;var lib$rsvp$asap$$browserWindow=typeof window !== 'undefined'?window:undefined;var lib$rsvp$asap$$browserGlobal=lib$rsvp$asap$$browserWindow || {};var lib$rsvp$asap$$BrowserMutationObserver=lib$rsvp$asap$$browserGlobal.MutationObserver || lib$rsvp$asap$$browserGlobal.WebKitMutationObserver;var lib$rsvp$asap$$isNode=typeof process !== 'undefined' && ({}).toString.call(process) === '[object process]'; // test for web worker but not in IE10
var lib$rsvp$asap$$isWorker=typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined'; // node
function lib$rsvp$asap$$useNextTick(){var nextTick=process.nextTick; // node version 0.10.x displays a deprecation warning when nextTick is used recursively
// setImmediate should be used instead instead
var version=process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);if(Array.isArray(version) && version[1] === '0' && version[2] === '10'){nextTick = setImmediate;}return function(){nextTick(lib$rsvp$asap$$flush);};} // vertx
function lib$rsvp$asap$$useVertxTimer(){return function(){lib$rsvp$asap$$vertxNext(lib$rsvp$asap$$flush);};}function lib$rsvp$asap$$useMutationObserver(){var iterations=0;var observer=new lib$rsvp$asap$$BrowserMutationObserver(lib$rsvp$asap$$flush);var node=document.createTextNode('');observer.observe(node,{characterData:true});return function(){node.data = iterations = ++iterations % 2;};} // web worker
function lib$rsvp$asap$$useMessageChannel(){var channel=new MessageChannel();channel.port1.onmessage = lib$rsvp$asap$$flush;return function(){channel.port2.postMessage(0);};}function lib$rsvp$asap$$useSetTimeout(){return function(){setTimeout(lib$rsvp$asap$$flush,1);};}var lib$rsvp$asap$$queue=new Array(1000);function lib$rsvp$asap$$flush(){for(var i=0;i < lib$rsvp$asap$$len;i += 2) {var callback=lib$rsvp$asap$$queue[i];var arg=lib$rsvp$asap$$queue[i + 1];callback(arg);lib$rsvp$asap$$queue[i] = undefined;lib$rsvp$asap$$queue[i + 1] = undefined;}lib$rsvp$asap$$len = 0;}function lib$rsvp$asap$$attemptVertex(){try{var r=require;var vertx=r('vertx');lib$rsvp$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;return lib$rsvp$asap$$useVertxTimer();}catch(e) {return lib$rsvp$asap$$useSetTimeout();}}var lib$rsvp$asap$$scheduleFlush; // Decide what async method to use to triggering processing of queued callbacks:
if(lib$rsvp$asap$$isNode){lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useNextTick();}else if(lib$rsvp$asap$$BrowserMutationObserver){lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMutationObserver();}else if(lib$rsvp$asap$$isWorker){lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMessageChannel();}else if(lib$rsvp$asap$$browserWindow === undefined && typeof require === 'function'){lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$attemptVertex();}else {lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useSetTimeout();}function lib$rsvp$defer$$defer(label){var deferred={};deferred['promise'] = new lib$rsvp$promise$$default(function(resolve,reject){deferred['resolve'] = resolve;deferred['reject'] = reject;},label);return deferred;}var lib$rsvp$defer$$default=lib$rsvp$defer$$defer;function lib$rsvp$filter$$filter(promises,filterFn,label){return lib$rsvp$promise$$default.all(promises,label).then(function(values){if(!lib$rsvp$utils$$isFunction(filterFn)){throw new TypeError("You must pass a function as filter's second argument.");}var length=values.length;var filtered=new Array(length);for(var i=0;i < length;i++) {filtered[i] = filterFn(values[i]);}return lib$rsvp$promise$$default.all(filtered,label).then(function(filtered){var results=new Array(length);var newLength=0;for(var i=0;i < length;i++) {if(filtered[i]){results[newLength] = values[i];newLength++;}}results.length = newLength;return results;});});}var lib$rsvp$filter$$default=lib$rsvp$filter$$filter;function lib$rsvp$promise$hash$$PromiseHash(Constructor,object,label){this._superConstructor(Constructor,object,true,label);}var lib$rsvp$promise$hash$$default=lib$rsvp$promise$hash$$PromiseHash;lib$rsvp$promise$hash$$PromiseHash.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);lib$rsvp$promise$hash$$PromiseHash.prototype._superConstructor = lib$rsvp$enumerator$$default;lib$rsvp$promise$hash$$PromiseHash.prototype._init = function(){this._result = {};};lib$rsvp$promise$hash$$PromiseHash.prototype._validateInput = function(input){return input && typeof input === 'object';};lib$rsvp$promise$hash$$PromiseHash.prototype._validationError = function(){return new Error('Promise.hash must be called with an object');};lib$rsvp$promise$hash$$PromiseHash.prototype._enumerate = function(){var promise=this.promise;var input=this._input;var results=[];for(var key in input) {if(promise._state === lib$rsvp$$internal$$PENDING && Object.prototype.hasOwnProperty.call(input,key)){results.push({position:key,entry:input[key]});}}var length=results.length;this._remaining = length;var result;for(var i=0;promise._state === lib$rsvp$$internal$$PENDING && i < length;i++) {result = results[i];this._eachEntry(result.entry,result.position);}};function lib$rsvp$hash$settled$$HashSettled(Constructor,object,label){this._superConstructor(Constructor,object,false,label);}lib$rsvp$hash$settled$$HashSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$promise$hash$$default.prototype);lib$rsvp$hash$settled$$HashSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;lib$rsvp$hash$settled$$HashSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;lib$rsvp$hash$settled$$HashSettled.prototype._validationError = function(){return new Error('hashSettled must be called with an object');};function lib$rsvp$hash$settled$$hashSettled(object,label){return new lib$rsvp$hash$settled$$HashSettled(lib$rsvp$promise$$default,object,label).promise;}var lib$rsvp$hash$settled$$default=lib$rsvp$hash$settled$$hashSettled;function lib$rsvp$hash$$hash(object,label){return new lib$rsvp$promise$hash$$default(lib$rsvp$promise$$default,object,label).promise;}var lib$rsvp$hash$$default=lib$rsvp$hash$$hash;function lib$rsvp$map$$map(promises,mapFn,label){return lib$rsvp$promise$$default.all(promises,label).then(function(values){if(!lib$rsvp$utils$$isFunction(mapFn)){throw new TypeError("You must pass a function as map's second argument.");}var length=values.length;var results=new Array(length);for(var i=0;i < length;i++) {results[i] = mapFn(values[i]);}return lib$rsvp$promise$$default.all(results,label);});}var lib$rsvp$map$$default=lib$rsvp$map$$map;function lib$rsvp$node$$Result(){this.value = undefined;}var lib$rsvp$node$$ERROR=new lib$rsvp$node$$Result();var lib$rsvp$node$$GET_THEN_ERROR=new lib$rsvp$node$$Result();function lib$rsvp$node$$getThen(obj){try{return obj.then;}catch(error) {lib$rsvp$node$$ERROR.value = error;return lib$rsvp$node$$ERROR;}}function lib$rsvp$node$$tryApply(f,s,a){try{f.apply(s,a);}catch(error) {lib$rsvp$node$$ERROR.value = error;return lib$rsvp$node$$ERROR;}}function lib$rsvp$node$$makeObject(_,argumentNames){var obj={};var name;var i;var length=_.length;var args=new Array(length);for(var x=0;x < length;x++) {args[x] = _[x];}for(i = 0;i < argumentNames.length;i++) {name = argumentNames[i];obj[name] = args[i + 1];}return obj;}function lib$rsvp$node$$arrayResult(_){var length=_.length;var args=new Array(length - 1);for(var i=1;i < length;i++) {args[i - 1] = _[i];}return args;}function lib$rsvp$node$$wrapThenable(_then,promise){return {then:function then(onFulFillment,onRejection){return _then.call(promise,onFulFillment,onRejection);}};}function lib$rsvp$node$$denodeify(nodeFunc,options){var fn=function fn(){var self=this;var l=arguments.length;var args=new Array(l + 1);var arg;var promiseInput=false;for(var i=0;i < l;++i) {arg = arguments[i];if(!promiseInput){ // TODO: clean this up
promiseInput = lib$rsvp$node$$needsPromiseInput(arg);if(promiseInput === lib$rsvp$node$$GET_THEN_ERROR){var p=new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);lib$rsvp$$internal$$reject(p,lib$rsvp$node$$GET_THEN_ERROR.value);return p;}else if(promiseInput && promiseInput !== true){arg = lib$rsvp$node$$wrapThenable(promiseInput,arg);}}args[i] = arg;}var promise=new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);args[l] = function(err,val){if(err)lib$rsvp$$internal$$reject(promise,err);else if(options === undefined)lib$rsvp$$internal$$resolve(promise,val);else if(options === true)lib$rsvp$$internal$$resolve(promise,lib$rsvp$node$$arrayResult(arguments));else if(lib$rsvp$utils$$isArray(options))lib$rsvp$$internal$$resolve(promise,lib$rsvp$node$$makeObject(arguments,options));else lib$rsvp$$internal$$resolve(promise,val);};if(promiseInput){return lib$rsvp$node$$handlePromiseInput(promise,args,nodeFunc,self);}else {return lib$rsvp$node$$handleValueInput(promise,args,nodeFunc,self);}};fn.__proto__ = nodeFunc;return fn;}var lib$rsvp$node$$default=lib$rsvp$node$$denodeify;function lib$rsvp$node$$handleValueInput(promise,args,nodeFunc,self){var result=lib$rsvp$node$$tryApply(nodeFunc,self,args);if(result === lib$rsvp$node$$ERROR){lib$rsvp$$internal$$reject(promise,result.value);}return promise;}function lib$rsvp$node$$handlePromiseInput(promise,args,nodeFunc,self){return lib$rsvp$promise$$default.all(args).then(function(args){var result=lib$rsvp$node$$tryApply(nodeFunc,self,args);if(result === lib$rsvp$node$$ERROR){lib$rsvp$$internal$$reject(promise,result.value);}return promise;});}function lib$rsvp$node$$needsPromiseInput(arg){if(arg && typeof arg === 'object'){if(arg.constructor === lib$rsvp$promise$$default){return true;}else {return lib$rsvp$node$$getThen(arg);}}else {return false;}}function lib$rsvp$race$$race(array,label){return lib$rsvp$promise$$default.race(array,label);}var lib$rsvp$race$$default=lib$rsvp$race$$race;function lib$rsvp$reject$$reject(reason,label){return lib$rsvp$promise$$default.reject(reason,label);}var lib$rsvp$reject$$default=lib$rsvp$reject$$reject;function lib$rsvp$resolve$$resolve(value,label){return lib$rsvp$promise$$default.resolve(value,label);}var lib$rsvp$resolve$$default=lib$rsvp$resolve$$resolve;function lib$rsvp$rethrow$$rethrow(reason){setTimeout(function(){throw reason;});throw reason;}var lib$rsvp$rethrow$$default=lib$rsvp$rethrow$$rethrow; // default async is asap;
lib$rsvp$config$$config.async = lib$rsvp$asap$$default;var lib$rsvp$$cast=lib$rsvp$resolve$$default;function lib$rsvp$$async(callback,arg){lib$rsvp$config$$config.async(callback,arg);}function lib$rsvp$$on(){lib$rsvp$config$$config['on'].apply(lib$rsvp$config$$config,arguments);}function lib$rsvp$$off(){lib$rsvp$config$$config['off'].apply(lib$rsvp$config$$config,arguments);} // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
if(typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object'){var lib$rsvp$$callbacks=window['__PROMISE_INSTRUMENTATION__'];lib$rsvp$config$$configure('instrument',true);for(var lib$rsvp$$eventName in lib$rsvp$$callbacks) {if(lib$rsvp$$callbacks.hasOwnProperty(lib$rsvp$$eventName)){lib$rsvp$$on(lib$rsvp$$eventName,lib$rsvp$$callbacks[lib$rsvp$$eventName]);}}}var lib$rsvp$umd$$RSVP={'race':lib$rsvp$race$$default,'Promise':lib$rsvp$promise$$default,'allSettled':lib$rsvp$all$settled$$default,'hash':lib$rsvp$hash$$default,'hashSettled':lib$rsvp$hash$settled$$default,'denodeify':lib$rsvp$node$$default,'on':lib$rsvp$$on,'off':lib$rsvp$$off,'map':lib$rsvp$map$$default,'filter':lib$rsvp$filter$$default,'resolve':lib$rsvp$resolve$$default,'reject':lib$rsvp$reject$$default,'all':lib$rsvp$all$$default,'rethrow':lib$rsvp$rethrow$$default,'defer':lib$rsvp$defer$$default,'EventTarget':lib$rsvp$events$$default,'configure':lib$rsvp$config$$configure,'async':lib$rsvp$$async};this['RSVP'] = lib$rsvp$umd$$RSVP;}).call(commonObj);(function(){"use strict";function $$route$recognizer$dsl$$Target(path,matcher,delegate){this.path = path;this.matcher = matcher;this.delegate = delegate;}$$route$recognizer$dsl$$Target.prototype = {to:function to(target,callback){var delegate=this.delegate;if(delegate && delegate.willAddRoute){target = delegate.willAddRoute(this.matcher.target,target);}this.matcher.add(this.path,target);if(callback){if(callback.length === 0){throw new Error("You must have an argument in the function passed to `to`");}this.matcher.addChild(this.path,target,callback,this.delegate);}return this;}};function $$route$recognizer$dsl$$Matcher(target){this.routes = {};this.children = {};this.target = target;}$$route$recognizer$dsl$$Matcher.prototype = {add:function add(path,handler){this.routes[path] = handler;},addChild:function addChild(path,target,callback,delegate){var matcher=new $$route$recognizer$dsl$$Matcher(target);this.children[path] = matcher;var match=$$route$recognizer$dsl$$generateMatch(path,matcher,delegate);if(delegate && delegate.contextEntered){delegate.contextEntered(target,match);}callback(match);}};function $$route$recognizer$dsl$$generateMatch(startingPath,matcher,delegate){return function(path,nestedCallback){var fullPath=startingPath + path;if(nestedCallback){nestedCallback($$route$recognizer$dsl$$generateMatch(fullPath,matcher,delegate));}else {return new $$route$recognizer$dsl$$Target(startingPath + path,matcher,delegate);}};}function $$route$recognizer$dsl$$addRoute(routeArray,path,handler){var len=0;for(var i=0,l=routeArray.length;i < l;i++) {len += routeArray[i].path.length;}path = path.substr(len);var route={path:path,handler:handler};routeArray.push(route);}function $$route$recognizer$dsl$$eachRoute(baseRoute,matcher,callback,binding){var routes=matcher.routes;for(var path in routes) {if(routes.hasOwnProperty(path)){var routeArray=baseRoute.slice();$$route$recognizer$dsl$$addRoute(routeArray,path,routes[path]);if(matcher.children[path]){$$route$recognizer$dsl$$eachRoute(routeArray,matcher.children[path],callback,binding);}else {callback.call(binding,routeArray);}}}}var $$route$recognizer$dsl$$default=function $$route$recognizer$dsl$$default(callback,addRouteCallback){var matcher=new $$route$recognizer$dsl$$Matcher();callback($$route$recognizer$dsl$$generateMatch("",matcher,this.delegate));$$route$recognizer$dsl$$eachRoute([],matcher,function(route){if(addRouteCallback){addRouteCallback(this,route);}else {this.add(route);}},this);};var $$route$recognizer$$specials=['/','.','*','+','?','|','(',')','[',']','{','}','\\'];var $$route$recognizer$$escapeRegex=new RegExp('(\\' + $$route$recognizer$$specials.join('|\\') + ')','g');function $$route$recognizer$$isArray(test){return Object.prototype.toString.call(test) === "[object Array]";} // A Segment represents a segment in the original route description.
// Each Segment type provides an `eachChar` and `regex` method.
//
// The `eachChar` method invokes the callback with one or more character
// specifications. A character specification consumes one or more input
// characters.
//
// The `regex` method returns a regex fragment for the segment. If the
// segment is a dynamic of star segment, the regex fragment also includes
// a capture.
//
// A character specification contains:
//
// * `validChars`: a String with a list of all valid characters, or
// * `invalidChars`: a String with a list of all invalid characters
// * `repeat`: true if the character specification can repeat
function $$route$recognizer$$StaticSegment(string){this.string = string;}$$route$recognizer$$StaticSegment.prototype = {eachChar:function eachChar(callback){var string=this.string,ch;for(var i=0,l=string.length;i < l;i++) {ch = string.charAt(i);callback({validChars:ch});}},regex:function regex(){return this.string.replace($$route$recognizer$$escapeRegex,'\\$1');},generate:function generate(){return this.string;}};function $$route$recognizer$$DynamicSegment(name){this.name = name;}$$route$recognizer$$DynamicSegment.prototype = {eachChar:function eachChar(callback){callback({invalidChars:"/",repeat:true});},regex:function regex(){return "([^/]+)";},generate:function generate(params){return params[this.name];}};function $$route$recognizer$$StarSegment(name){this.name = name;}$$route$recognizer$$StarSegment.prototype = {eachChar:function eachChar(callback){callback({invalidChars:"",repeat:true});},regex:function regex(){return "(.+)";},generate:function generate(params){return params[this.name];}};function $$route$recognizer$$EpsilonSegment(){}$$route$recognizer$$EpsilonSegment.prototype = {eachChar:function eachChar(){},regex:function regex(){return "";},generate:function generate(){return "";}};function $$route$recognizer$$parse(route,names,specificity){ // normalize route as not starting with a "/". Recognition will
// also normalize.
if(route.charAt(0) === "/"){route = route.substr(1);}var segments=route.split("/"),results=[]; // A routes has specificity determined by the order that its different segments
// appear in. This system mirrors how the magnitude of numbers written as strings
// works.
// Consider a number written as: "abc". An example would be "200". Any other number written
// "xyz" will be smaller than "abc" so long as `a > z`. For instance, "199" is smaller
// then "200", even though "y" and "z" (which are both 9) are larger than "0" (the value
// of (`b` and `c`). This is because the leading symbol, "2", is larger than the other
// leading symbol, "1".
// The rule is that symbols to the left carry more weight than symbols to the right
// when a number is written out as a string. In the above strings, the leading digit
// represents how many 100's are in the number, and it carries more weight than the middle
// number which represents how many 10's are in the number.
// This system of number magnitude works well for route specificity, too. A route written as
// `a/b/c` will be more specific than `x/y/z` as long as `a` is more specific than
// `x`, irrespective of the other parts.
// Because of this similarity, we assign each type of segment a number value written as a
// string. We can find the specificity of compound routes by concatenating these strings
// together, from left to right. After we have looped through all of the segments,
// we convert the string to a number.
specificity.val = '';for(var i=0,l=segments.length;i < l;i++) {var segment=segments[i],match;if(match = segment.match(/^:([^\/]+)$/)){results.push(new $$route$recognizer$$DynamicSegment(match[1]));names.push(match[1]);specificity.val += '3';}else if(match = segment.match(/^\*([^\/]+)$/)){results.push(new $$route$recognizer$$StarSegment(match[1]));specificity.val += '2';names.push(match[1]);}else if(segment === ""){results.push(new $$route$recognizer$$EpsilonSegment());specificity.val += '1';}else {results.push(new $$route$recognizer$$StaticSegment(segment));specificity.val += '4';}}specificity.val = +specificity.val;return results;} // A State has a character specification and (`charSpec`) and a list of possible
// subsequent states (`nextStates`).
//
// If a State is an accepting state, it will also have several additional
// properties:
//
// * `regex`: A regular expression that is used to extract parameters from paths
//   that reached this accepting state.
// * `handlers`: Information on how to convert the list of captures into calls
//   to registered handlers with the specified parameters
// * `types`: How many static, dynamic or star segments in this route. Used to
//   decide which route to use if multiple registered routes match a path.
//
// Currently, State is implemented naively by looping over `nextStates` and
// comparing a character specification against a character. A more efficient
// implementation would use a hash of keys pointing at one or more next states.
function $$route$recognizer$$State(charSpec){this.charSpec = charSpec;this.nextStates = [];}$$route$recognizer$$State.prototype = {get:function get(charSpec){var nextStates=this.nextStates;for(var i=0,l=nextStates.length;i < l;i++) {var child=nextStates[i];var isEqual=child.charSpec.validChars === charSpec.validChars;isEqual = isEqual && child.charSpec.invalidChars === charSpec.invalidChars;if(isEqual){return child;}}},put:function put(charSpec){var state; // If the character specification already exists in a child of the current
// state, just return that state.
if(state = this.get(charSpec)){return state;} // Make a new state for the character spec
state = new $$route$recognizer$$State(charSpec); // Insert the new state as a child of the current state
this.nextStates.push(state); // If this character specification repeats, insert the new state as a child
// of itself. Note that this will not trigger an infinite loop because each
// transition during recognition consumes a character.
if(charSpec.repeat){state.nextStates.push(state);} // Return the new state
return state;}, // Find a list of child states matching the next character
match:function match(ch){ // DEBUG "Processing `" + ch + "`:"
var nextStates=this.nextStates,child,charSpec,chars; // DEBUG "  " + debugState(this)
var returned=[];for(var i=0,l=nextStates.length;i < l;i++) {child = nextStates[i];charSpec = child.charSpec;if(typeof (chars = charSpec.validChars) !== 'undefined'){if(chars.indexOf(ch) !== -1){returned.push(child);}}else if(typeof (chars = charSpec.invalidChars) !== 'undefined'){if(chars.indexOf(ch) === -1){returned.push(child);}}}return returned;} /** IF DEBUG
      , debug: function() {
        var charSpec = this.charSpec,
            debug = "[",
            chars = charSpec.validChars || charSpec.invalidChars;

        if (charSpec.invalidChars) { debug += "^"; }
        debug += chars;
        debug += "]";

        if (charSpec.repeat) { debug += "+"; }

        return debug;
      }
      END IF **/}; /** IF DEBUG
    function debug(log) {
      console.log(log);
    }

    function debugState(state) {
      return state.nextStates.map(function(n) {
        if (n.nextStates.length === 0) { return "( " + n.debug() + " [accepting] )"; }
        return "( " + n.debug() + " <then> " + n.nextStates.map(function(s) { return s.debug() }).join(" or ") + " )";
      }).join(", ")
    }
    END IF **/ // Sort the routes by specificity
function $$route$recognizer$$sortSolutions(states){return states.sort(function(a,b){return b.specificity.val - a.specificity.val;});}function $$route$recognizer$$recognizeChar(states,ch){var nextStates=[];for(var i=0,l=states.length;i < l;i++) {var state=states[i];nextStates = nextStates.concat(state.match(ch));}return nextStates;}var $$route$recognizer$$oCreate=Object.create || function(proto){function F(){}F.prototype = proto;return new F();};function $$route$recognizer$$RecognizeResults(queryParams){this.queryParams = queryParams || {};}$$route$recognizer$$RecognizeResults.prototype = $$route$recognizer$$oCreate({splice:Array.prototype.splice,slice:Array.prototype.slice,push:Array.prototype.push,length:0,queryParams:null});function $$route$recognizer$$findHandler(state,path,queryParams){var handlers=state.handlers,regex=state.regex;var captures=path.match(regex),currentCapture=1;var result=new $$route$recognizer$$RecognizeResults(queryParams);for(var i=0,l=handlers.length;i < l;i++) {var handler=handlers[i],names=handler.names,params={};for(var j=0,m=names.length;j < m;j++) {params[names[j]] = captures[currentCapture++];}result.push({handler:handler.handler,params:params,isDynamic:!!names.length});}return result;}function $$route$recognizer$$addSegment(currentState,segment){segment.eachChar(function(ch){var state;currentState = currentState.put(ch);});return currentState;}function $$route$recognizer$$decodeQueryParamPart(part){ // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
part = part.replace(/\+/gm,'%20');return decodeURIComponent(part);} // The main interface
var $$route$recognizer$$RouteRecognizer=function $$route$recognizer$$RouteRecognizer(){this.rootState = new $$route$recognizer$$State();this.names = {};};$$route$recognizer$$RouteRecognizer.prototype = {add:function add(routes,options){var currentState=this.rootState,regex="^",specificity={},handlers=[],allSegments=[],name;var isEmpty=true;for(var i=0,l=routes.length;i < l;i++) {var route=routes[i],names=[];var segments=$$route$recognizer$$parse(route.path,names,specificity);allSegments = allSegments.concat(segments);for(var j=0,m=segments.length;j < m;j++) {var segment=segments[j];if(segment instanceof $$route$recognizer$$EpsilonSegment){continue;}isEmpty = false; // Add a "/" for the new segment
currentState = currentState.put({validChars:"/"});regex += "/"; // Add a representation of the segment to the NFA and regex
currentState = $$route$recognizer$$addSegment(currentState,segment);regex += segment.regex();}var handler={handler:route.handler,names:names};handlers.push(handler);}if(isEmpty){currentState = currentState.put({validChars:"/"});regex += "/";}currentState.handlers = handlers;currentState.regex = new RegExp(regex + "$");currentState.specificity = specificity;if(name = options && options.as){this.names[name] = {segments:allSegments,handlers:handlers};}},handlersFor:function handlersFor(name){var route=this.names[name],result=[];if(!route){throw new Error("There is no route named " + name);}for(var i=0,l=route.handlers.length;i < l;i++) {result.push(route.handlers[i]);}return result;},hasRoute:function hasRoute(name){return !!this.names[name];},generate:function generate(name,params){var route=this.names[name],output="";if(!route){throw new Error("There is no route named " + name);}var segments=route.segments;for(var i=0,l=segments.length;i < l;i++) {var segment=segments[i];if(segment instanceof $$route$recognizer$$EpsilonSegment){continue;}output += "/";output += segment.generate(params);}if(output.charAt(0) !== '/'){output = '/' + output;}if(params && params.queryParams){output += this.generateQueryString(params.queryParams,route.handlers);}return output;},generateQueryString:function generateQueryString(params,handlers){var pairs=[];var keys=[];for(var key in params) {if(params.hasOwnProperty(key)){keys.push(key);}}keys.sort();for(var i=0,len=keys.length;i < len;i++) {key = keys[i];var value=params[key];if(value == null){continue;}var pair=encodeURIComponent(key);if($$route$recognizer$$isArray(value)){for(var j=0,l=value.length;j < l;j++) {var arrayPair=key + '[]' + '=' + encodeURIComponent(value[j]);pairs.push(arrayPair);}}else {pair += "=" + encodeURIComponent(value);pairs.push(pair);}}if(pairs.length === 0){return '';}return "?" + pairs.join("&");},parseQueryString:function parseQueryString(queryString){var pairs=queryString.split("&"),queryParams={};for(var i=0;i < pairs.length;i++) {var pair=pairs[i].split('='),key=$$route$recognizer$$decodeQueryParamPart(pair[0]),keyLength=key.length,isArray=false,value;if(pair.length === 1){value = 'true';}else { //Handle arrays
if(keyLength > 2 && key.slice(keyLength - 2) === '[]'){isArray = true;key = key.slice(0,keyLength - 2);if(!queryParams[key]){queryParams[key] = [];}}value = pair[1]?$$route$recognizer$$decodeQueryParamPart(pair[1]):'';}if(isArray){queryParams[key].push(value);}else {queryParams[key] = value;}}return queryParams;},recognize:function recognize(path){var states=[this.rootState],pathLen,i,l,queryStart,queryParams={},isSlashDropped=false;queryStart = path.indexOf('?');if(queryStart !== -1){var queryString=path.substr(queryStart + 1,path.length);path = path.substr(0,queryStart);queryParams = this.parseQueryString(queryString);}path = decodeURI(path); // DEBUG GROUP path
if(path.charAt(0) !== "/"){path = "/" + path;}pathLen = path.length;if(pathLen > 1 && path.charAt(pathLen - 1) === "/"){path = path.substr(0,pathLen - 1);isSlashDropped = true;}for(i = 0,l = path.length;i < l;i++) {states = $$route$recognizer$$recognizeChar(states,path.charAt(i));if(!states.length){break;}} // END DEBUG GROUP
var solutions=[];for(i = 0,l = states.length;i < l;i++) {if(states[i].handlers){solutions.push(states[i]);}}states = $$route$recognizer$$sortSolutions(solutions);var state=solutions[0];if(state && state.handlers){ // if a trailing slash was dropped and a star segment is the last segment
// specified, put the trailing slash back
if(isSlashDropped && state.regex.source.slice(-5) === "(.+)$"){path = path + "/";}return $$route$recognizer$$findHandler(state,path,queryParams);}}};$$route$recognizer$$RouteRecognizer.prototype.map = $$route$recognizer$dsl$$default;$$route$recognizer$$RouteRecognizer.VERSION = '0.1.7';var $$route$recognizer$$default=$$route$recognizer$$RouteRecognizer;this['RouteRecognizer'] = $$route$recognizer$$default;}).call(commonObj);(function(){var registry={},seen={};define = function(name,deps,callback){registry[name] = {deps:deps,callback:callback};};requirejs = require = requireModule = function(name){if(seen[name]){return seen[name];}seen[name] = {};if(!registry[name]){throw new Error("Could not find module " + name);}var mod=registry[name],deps=mod.deps,callback=mod.callback,reified=[],exports;for(var i=0,l=deps.length;i < l;i++) {if(deps[i] === 'exports'){reified.push(exports = {});}else {reified.push(requireModule(resolve(deps[i])));}}var value=callback.apply(this,reified);return seen[name] = exports || value;function resolve(child){if(child.charAt(0) !== '.'){return child;}var parts=child.split("/");var parentBase=name.split("/").slice(0,-1);for(var i=0,l=parts.length;i < l;i++) {var part=parts[i];if(part === '..'){parentBase.pop();}else if(part === '.'){continue;}else {parentBase.push(part);}}return parentBase.join("/");}};})();define("router/handler-info",["./utils","rsvp/promise","exports"],function(__dependency1__,__dependency2__,__exports__){"use strict";var bind=__dependency1__.bind;var merge=__dependency1__.merge;var serialize=__dependency1__.serialize;var _promiseLabel=__dependency1__.promiseLabel;var applyHook=__dependency1__.applyHook;var Promise=__dependency2__["default"];function HandlerInfo(_props){var props=_props || {};merge(this,props);this.initialize(props);}HandlerInfo.prototype = {name:null,handler:null,params:null,context:null, // Injected by the handler info factory.
factory:null,initialize:function initialize(){},log:function log(payload,message){if(payload.log){payload.log(this.name + ': ' + message);}},promiseLabel:function promiseLabel(label){return _promiseLabel("'" + this.name + "' " + label);},getUnresolved:function getUnresolved(){return this;},serialize:function serialize(){return this.params || {};},resolve:function resolve(shouldContinue,payload){var checkForAbort=bind(this,this.checkForAbort,shouldContinue),beforeModel=bind(this,this.runBeforeModelHook,payload),model=bind(this,this.getModel,payload),afterModel=bind(this,this.runAfterModelHook,payload),becomeResolved=bind(this,this.becomeResolved,payload);return Promise.resolve(undefined,this.promiseLabel("Start handler")).then(checkForAbort,null,this.promiseLabel("Check for abort")).then(beforeModel,null,this.promiseLabel("Before model")).then(checkForAbort,null,this.promiseLabel("Check if aborted during 'beforeModel' hook")).then(model,null,this.promiseLabel("Model")).then(checkForAbort,null,this.promiseLabel("Check if aborted in 'model' hook")).then(afterModel,null,this.promiseLabel("After model")).then(checkForAbort,null,this.promiseLabel("Check if aborted in 'afterModel' hook")).then(becomeResolved,null,this.promiseLabel("Become resolved"));},runBeforeModelHook:function runBeforeModelHook(payload){if(payload.trigger){payload.trigger(true,'willResolveModel',payload,this.handler);}return this.runSharedModelHook(payload,'beforeModel',[]);},runAfterModelHook:function runAfterModelHook(payload,resolvedModel){ // Stash the resolved model on the payload.
// This makes it possible for users to swap out
// the resolved model in afterModel.
var name=this.name;this.stashResolvedModel(payload,resolvedModel);return this.runSharedModelHook(payload,'afterModel',[resolvedModel]).then(function(){ // Ignore the fulfilled value returned from afterModel.
// Return the value stashed in resolvedModels, which
// might have been swapped out in afterModel.
return payload.resolvedModels[name];},null,this.promiseLabel("Ignore fulfillment value and return model value"));},runSharedModelHook:function runSharedModelHook(payload,hookName,args){this.log(payload,"calling " + hookName + " hook");if(this.queryParams){args.push(this.queryParams);}args.push(payload);var result=applyHook(this.handler,hookName,args);if(result && result.isTransition){result = null;}return Promise.resolve(result,this.promiseLabel("Resolve value returned from one of the model hooks"));}, // overridden by subclasses
getModel:null,checkForAbort:function checkForAbort(shouldContinue,promiseValue){return Promise.resolve(shouldContinue(),this.promiseLabel("Check for abort")).then(function(){ // We don't care about shouldContinue's resolve value;
// pass along the original value passed to this fn.
return promiseValue;},null,this.promiseLabel("Ignore fulfillment value and continue"));},stashResolvedModel:function stashResolvedModel(payload,resolvedModel){payload.resolvedModels = payload.resolvedModels || {};payload.resolvedModels[this.name] = resolvedModel;},becomeResolved:function becomeResolved(payload,resolvedContext){var params=this.serialize(resolvedContext);if(payload){this.stashResolvedModel(payload,resolvedContext);payload.params = payload.params || {};payload.params[this.name] = params;}return this.factory('resolved',{context:resolvedContext,name:this.name,handler:this.handler,params:params});},shouldSupercede:function shouldSupercede(other){ // Prefer this newer handlerInfo over `other` if:
// 1) The other one doesn't exist
// 2) The names don't match
// 3) This handler has a context that doesn't match
//    the other one (or the other one doesn't have one).
// 4) This handler has parameters that don't match the other.
if(!other){return true;}var contextsMatch=other.context === this.context;return other.name !== this.name || this.hasOwnProperty('context') && !contextsMatch || this.hasOwnProperty('params') && !paramsMatch(this.params,other.params);}};function paramsMatch(a,b){if(!a ^ !b){ // Only one is null.
return false;}if(!a){ // Both must be null.
return true;} // Note: this assumes that both params have the same
// number of keys, but since we're comparing the
// same handlers, they should.
for(var k in a) {if(a.hasOwnProperty(k) && a[k] !== b[k]){return false;}}return true;}__exports__["default"] = HandlerInfo;});define("router/handler-info/factory",["router/handler-info/resolved-handler-info","router/handler-info/unresolved-handler-info-by-object","router/handler-info/unresolved-handler-info-by-param","exports"],function(__dependency1__,__dependency2__,__dependency3__,__exports__){"use strict";var ResolvedHandlerInfo=__dependency1__["default"];var UnresolvedHandlerInfoByObject=__dependency2__["default"];var UnresolvedHandlerInfoByParam=__dependency3__["default"];handlerInfoFactory.klasses = {resolved:ResolvedHandlerInfo,param:UnresolvedHandlerInfoByParam,object:UnresolvedHandlerInfoByObject};function handlerInfoFactory(name,props){var Ctor=handlerInfoFactory.klasses[name],handlerInfo=new Ctor(props || {});handlerInfo.factory = handlerInfoFactory;return handlerInfo;}__exports__["default"] = handlerInfoFactory;});define("router/handler-info/resolved-handler-info",["../handler-info","router/utils","rsvp/promise","exports"],function(__dependency1__,__dependency2__,__dependency3__,__exports__){"use strict";var HandlerInfo=__dependency1__["default"];var subclass=__dependency2__.subclass;var promiseLabel=__dependency2__.promiseLabel;var Promise=__dependency3__["default"];var ResolvedHandlerInfo=subclass(HandlerInfo,{resolve:function resolve(shouldContinue,payload){ // A ResolvedHandlerInfo just resolved with itself.
if(payload && payload.resolvedModels){payload.resolvedModels[this.name] = this.context;}return Promise.resolve(this,this.promiseLabel("Resolve"));},getUnresolved:function getUnresolved(){return this.factory('param',{name:this.name,handler:this.handler,params:this.params});},isResolved:true});__exports__["default"] = ResolvedHandlerInfo;});define("router/handler-info/unresolved-handler-info-by-object",["../handler-info","router/utils","rsvp/promise","exports"],function(__dependency1__,__dependency2__,__dependency3__,__exports__){"use strict";var HandlerInfo=__dependency1__["default"];var merge=__dependency2__.merge;var subclass=__dependency2__.subclass;var promiseLabel=__dependency2__.promiseLabel;var isParam=__dependency2__.isParam;var Promise=__dependency3__["default"];var UnresolvedHandlerInfoByObject=subclass(HandlerInfo,{getModel:function getModel(payload){this.log(payload,this.name + ": resolving provided model");return Promise.resolve(this.context);},initialize:function initialize(props){this.names = props.names || [];this.context = props.context;}, /**
        @private

        Serializes a handler using its custom `serialize` method or
        by a default that looks up the expected property name from
        the dynamic segment.

        @param {Object} model the model to be serialized for this handler
      */serialize:function serialize(_model){var model=_model || this.context,names=this.names,handler=this.handler;var object={};if(isParam(model)){object[names[0]] = model;return object;} // Use custom serialize if it exists.
if(handler.serialize){return handler.serialize(model,names);}if(names.length !== 1){return;}var name=names[0];if(/_id$/.test(name)){object[name] = model.id;}else {object[name] = model;}return object;}});__exports__["default"] = UnresolvedHandlerInfoByObject;});define("router/handler-info/unresolved-handler-info-by-param",["../handler-info","router/utils","exports"],function(__dependency1__,__dependency2__,__exports__){"use strict";var HandlerInfo=__dependency1__["default"];var resolveHook=__dependency2__.resolveHook;var merge=__dependency2__.merge;var subclass=__dependency2__.subclass;var promiseLabel=__dependency2__.promiseLabel; // Generated by URL transitions and non-dynamic route segments in named Transitions.
var UnresolvedHandlerInfoByParam=subclass(HandlerInfo,{initialize:function initialize(props){this.params = props.params || {};},getModel:function getModel(payload){var fullParams=this.params;if(payload && payload.queryParams){fullParams = {};merge(fullParams,this.params);fullParams.queryParams = payload.queryParams;}var handler=this.handler;var hookName=resolveHook(handler,'deserialize') || resolveHook(handler,'model');return this.runSharedModelHook(payload,hookName,[fullParams]);}});__exports__["default"] = UnresolvedHandlerInfoByParam;});define("router/router",["route-recognizer","rsvp/promise","./utils","./transition-state","./transition","./transition-intent/named-transition-intent","./transition-intent/url-transition-intent","./handler-info","exports"],function(__dependency1__,__dependency2__,__dependency3__,__dependency4__,__dependency5__,__dependency6__,__dependency7__,__dependency8__,__exports__){"use strict";var RouteRecognizer=__dependency1__["default"];var Promise=__dependency2__["default"];var _trigger=__dependency3__.trigger;var log=__dependency3__.log;var slice=__dependency3__.slice;var forEach=__dependency3__.forEach;var merge=__dependency3__.merge;var serialize=__dependency3__.serialize;var extractQueryParams=__dependency3__.extractQueryParams;var getChangelist=__dependency3__.getChangelist;var promiseLabel=__dependency3__.promiseLabel;var callHook=__dependency3__.callHook;var TransitionState=__dependency4__["default"];var logAbort=__dependency5__.logAbort;var Transition=__dependency5__.Transition;var TransitionAborted=__dependency5__.TransitionAborted;var NamedTransitionIntent=__dependency6__["default"];var URLTransitionIntent=__dependency7__["default"];var ResolvedHandlerInfo=__dependency8__.ResolvedHandlerInfo;var pop=Array.prototype.pop;function Router(_options){var options=_options || {};this.getHandler = options.getHandler || this.getHandler;this.updateURL = options.updateURL || this.updateURL;this.replaceURL = options.replaceURL || this.replaceURL;this.didTransition = options.didTransition || this.didTransition;this.willTransition = options.willTransition || this.willTransition;this.delegate = options.delegate || this.delegate;this.triggerEvent = options.triggerEvent || this.triggerEvent;this.log = options.log || this.log;this.recognizer = new RouteRecognizer();this.reset();}function getTransitionByIntent(intent,isIntermediate){var wasTransitioning=!!this.activeTransition;var oldState=wasTransitioning?this.activeTransition.state:this.state;var newTransition;var newState=intent.applyToState(oldState,this.recognizer,this.getHandler,isIntermediate);var queryParamChangelist=getChangelist(oldState.queryParams,newState.queryParams);if(handlerInfosEqual(newState.handlerInfos,oldState.handlerInfos)){ // This is a no-op transition. See if query params changed.
if(queryParamChangelist){newTransition = this.queryParamsTransition(queryParamChangelist,wasTransitioning,oldState,newState);if(newTransition){return newTransition;}} // No-op. No need to create a new transition.
return new Transition(this);}if(isIntermediate){setupContexts(this,newState);return;} // Create a new transition to the destination route.
newTransition = new Transition(this,intent,newState); // Abort and usurp any previously active transition.
if(this.activeTransition){this.activeTransition.abort();}this.activeTransition = newTransition; // Transition promises by default resolve with resolved state.
// For our purposes, swap out the promise to resolve
// after the transition has been finalized.
newTransition.promise = newTransition.promise.then(function(result){return finalizeTransition(newTransition,result.state);},null,promiseLabel("Settle transition promise when transition is finalized"));if(!wasTransitioning){notifyExistingHandlers(this,newState,newTransition);}fireQueryParamDidChange(this,newState,queryParamChangelist);return newTransition;}Router.prototype = { /**
        The main entry point into the router. The API is essentially
        the same as the `map` method in `route-recognizer`.

        This method extracts the String handler at the last `.to()`
        call and uses it as the name of the whole route.

        @param {Function} callback
      */map:function map(callback){this.recognizer.delegate = this.delegate;this.recognizer.map(callback,function(recognizer,routes){for(var i=routes.length - 1,proceed=true;i >= 0 && proceed;--i) {var route=routes[i];recognizer.add(routes,{as:route.handler});proceed = route.path === '/' || route.path === '' || route.handler.slice(-6) === '.index';}});},hasRoute:function hasRoute(route){return this.recognizer.hasRoute(route);},getHandler:function getHandler(){},queryParamsTransition:function queryParamsTransition(changelist,wasTransitioning,oldState,newState){var router=this;fireQueryParamDidChange(this,newState,changelist);if(!wasTransitioning && this.activeTransition){ // One of the handlers in queryParamsDidChange
// caused a transition. Just return that transition.
return this.activeTransition;}else { // Running queryParamsDidChange didn't change anything.
// Just update query params and be on our way.
// We have to return a noop transition that will
// perform a URL update at the end. This gives
// the user the ability to set the url update
// method (default is replaceState).
var newTransition=new Transition(this);newTransition.queryParamsOnly = true;oldState.queryParams = finalizeQueryParamChange(this,newState.handlerInfos,newState.queryParams,newTransition);newTransition.promise = newTransition.promise.then(function(result){updateURL(newTransition,oldState,true);if(router.didTransition){router.didTransition(router.currentHandlerInfos);}return result;},null,promiseLabel("Transition complete"));return newTransition;}}, // NOTE: this doesn't really belong here, but here
// it shall remain until our ES6 transpiler can
// handle cyclical deps.
transitionByIntent:function transitionByIntent(intent,isIntermediate){try{return getTransitionByIntent.apply(this,arguments);}catch(e) {return new Transition(this,intent,null,e);}}, /**
        Clears the current and target route handlers and triggers exit
        on each of them starting at the leaf and traversing up through
        its ancestors.
      */reset:function reset(){if(this.state){forEach(this.state.handlerInfos.slice().reverse(),function(handlerInfo){var handler=handlerInfo.handler;callHook(handler,'exit');});}this.state = new TransitionState();this.currentHandlerInfos = null;},activeTransition:null, /**
        var handler = handlerInfo.handler;
        The entry point for handling a change to the URL (usually
        via the back and forward button).

        Returns an Array of handlers and the parameters associated
        with those parameters.

        @param {String} url a URL to process

        @return {Array} an Array of `[handler, parameter]` tuples
      */handleURL:function handleURL(url){ // Perform a URL-based transition, but don't change
// the URL afterward, since it already happened.
var args=slice.call(arguments);if(url.charAt(0) !== '/'){args[0] = '/' + url;}return doTransition(this,args).method(null);}, /**
        Hook point for updating the URL.

        @param {String} url a URL to update to
      */updateURL:function updateURL(){throw new Error("updateURL is not implemented");}, /**
        Hook point for replacing the current URL, i.e. with replaceState

        By default this behaves the same as `updateURL`

        @param {String} url a URL to update to
      */replaceURL:function replaceURL(url){this.updateURL(url);}, /**
        Transition into the specified named route.

        If necessary, trigger the exit callback on any handlers
        that are no longer represented by the target route.

        @param {String} name the name of the route
      */transitionTo:function transitionTo(name){return doTransition(this,arguments);},intermediateTransitionTo:function intermediateTransitionTo(name){return doTransition(this,arguments,true);},refresh:function refresh(pivotHandler){var state=this.activeTransition?this.activeTransition.state:this.state;var handlerInfos=state.handlerInfos;var params={};for(var i=0,len=handlerInfos.length;i < len;++i) {var handlerInfo=handlerInfos[i];params[handlerInfo.name] = handlerInfo.params || {};}log(this,"Starting a refresh transition");var intent=new NamedTransitionIntent({name:handlerInfos[handlerInfos.length - 1].name,pivotHandler:pivotHandler || handlerInfos[0].handler,contexts:[], // TODO collect contexts...?
queryParams:this._changedQueryParams || state.queryParams || {}});return this.transitionByIntent(intent,false);}, /**
        Identical to `transitionTo` except that the current URL will be replaced
        if possible.

        This method is intended primarily for use with `replaceState`.

        @param {String} name the name of the route
      */replaceWith:function replaceWith(name){return doTransition(this,arguments).method('replace');}, /**
        Take a named route and context objects and generate a
        URL.

        @param {String} name the name of the route to generate
          a URL for
        @param {...Object} objects a list of objects to serialize

        @return {String} a URL
      */generate:function generate(handlerName){var partitionedArgs=extractQueryParams(slice.call(arguments,1)),suppliedParams=partitionedArgs[0],queryParams=partitionedArgs[1]; // Construct a TransitionIntent with the provided params
// and apply it to the present state of the router.
var intent=new NamedTransitionIntent({name:handlerName,contexts:suppliedParams});var state=intent.applyToState(this.state,this.recognizer,this.getHandler);var params={};for(var i=0,len=state.handlerInfos.length;i < len;++i) {var handlerInfo=state.handlerInfos[i];var handlerParams=handlerInfo.serialize();merge(params,handlerParams);}params.queryParams = queryParams;return this.recognizer.generate(handlerName,params);},applyIntent:function applyIntent(handlerName,contexts){var intent=new NamedTransitionIntent({name:handlerName,contexts:contexts});var state=this.activeTransition && this.activeTransition.state || this.state;return intent.applyToState(state,this.recognizer,this.getHandler);},isActiveIntent:function isActiveIntent(handlerName,contexts,queryParams,_state){var state=_state || this.state,targetHandlerInfos=state.handlerInfos,found=false,names,object,handlerInfo,handlerObj,i,len;if(!targetHandlerInfos.length){return false;}var targetHandler=targetHandlerInfos[targetHandlerInfos.length - 1].name;var recogHandlers=this.recognizer.handlersFor(targetHandler);var index=0;for(len = recogHandlers.length;index < len;++index) {handlerInfo = targetHandlerInfos[index];if(handlerInfo.name === handlerName){break;}}if(index === recogHandlers.length){ // The provided route name isn't even in the route hierarchy.
return false;}var testState=new TransitionState();testState.handlerInfos = targetHandlerInfos.slice(0,index + 1);recogHandlers = recogHandlers.slice(0,index + 1);var intent=new NamedTransitionIntent({name:targetHandler,contexts:contexts});var newState=intent.applyToHandlers(testState,recogHandlers,this.getHandler,targetHandler,true,true);var handlersEqual=handlerInfosEqual(newState.handlerInfos,testState.handlerInfos);if(!queryParams || !handlersEqual){return handlersEqual;} // Get a hash of QPs that will still be active on new route
var activeQPsOnNewHandler={};merge(activeQPsOnNewHandler,queryParams);var activeQueryParams=state.queryParams;for(var key in activeQueryParams) {if(activeQueryParams.hasOwnProperty(key) && activeQPsOnNewHandler.hasOwnProperty(key)){activeQPsOnNewHandler[key] = activeQueryParams[key];}}return handlersEqual && !getChangelist(activeQPsOnNewHandler,queryParams);},isActive:function isActive(handlerName){var partitionedArgs=extractQueryParams(slice.call(arguments,1));return this.isActiveIntent(handlerName,partitionedArgs[0],partitionedArgs[1]);},trigger:function trigger(name){var args=slice.call(arguments);_trigger(this,this.currentHandlerInfos,false,args);}, /**
        Hook point for logging transition status updates.

        @param {String} message The message to log.
      */log:null}; /**
      @private

      Fires queryParamsDidChange event
    */function fireQueryParamDidChange(router,newState,queryParamChangelist){ // If queryParams changed trigger event
if(queryParamChangelist){ // This is a little hacky but we need some way of storing
// changed query params given that no activeTransition
// is guaranteed to have occurred.
router._changedQueryParams = queryParamChangelist.all;_trigger(router,newState.handlerInfos,true,['queryParamsDidChange',queryParamChangelist.changed,queryParamChangelist.all,queryParamChangelist.removed]);router._changedQueryParams = null;}} /**
      @private

      Takes an Array of `HandlerInfo`s, figures out which ones are
      exiting, entering, or changing contexts, and calls the
      proper handler hooks.

      For example, consider the following tree of handlers. Each handler is
      followed by the URL segment it handles.

      ```
      |~index ("/")
      | |~posts ("/posts")
      | | |-showPost ("/:id")
      | | |-newPost ("/new")
      | | |-editPost ("/edit")
      | |~about ("/about/:id")
      ```

      Consider the following transitions:

      1. A URL transition to `/posts/1`.
         1. Triggers the `*model` callbacks on the
            `index`, `posts`, and `showPost` handlers
         2. Triggers the `enter` callback on the same
         3. Triggers the `setup` callback on the same
      2. A direct transition to `newPost`
         1. Triggers the `exit` callback on `showPost`
         2. Triggers the `enter` callback on `newPost`
         3. Triggers the `setup` callback on `newPost`
      3. A direct transition to `about` with a specified
         context object
         1. Triggers the `exit` callback on `newPost`
            and `posts`
         2. Triggers the `serialize` callback on `about`
         3. Triggers the `enter` callback on `about`
         4. Triggers the `setup` callback on `about`

      @param {Router} transition
      @param {TransitionState} newState
    */function setupContexts(router,newState,transition){var partition=partitionHandlers(router.state,newState);var i,l,handler;for(i = 0,l = partition.exited.length;i < l;i++) {handler = partition.exited[i].handler;delete handler.context;callHook(handler,'reset',true,transition);callHook(handler,'exit',transition);}var oldState=router.oldState = router.state;router.state = newState;var currentHandlerInfos=router.currentHandlerInfos = partition.unchanged.slice();try{for(i = 0,l = partition.reset.length;i < l;i++) {handler = partition.reset[i].handler;callHook(handler,'reset',false,transition);}for(i = 0,l = partition.updatedContext.length;i < l;i++) {handlerEnteredOrUpdated(currentHandlerInfos,partition.updatedContext[i],false,transition);}for(i = 0,l = partition.entered.length;i < l;i++) {handlerEnteredOrUpdated(currentHandlerInfos,partition.entered[i],true,transition);}}catch(e) {router.state = oldState;router.currentHandlerInfos = oldState.handlerInfos;throw e;}router.state.queryParams = finalizeQueryParamChange(router,currentHandlerInfos,newState.queryParams,transition);} /**
      @private

      Helper method used by setupContexts. Handles errors or redirects
      that may happen in enter/setup.
    */function handlerEnteredOrUpdated(currentHandlerInfos,handlerInfo,enter,transition){var handler=handlerInfo.handler,context=handlerInfo.context;if(enter){callHook(handler,'enter',transition);}if(transition && transition.isAborted){throw new TransitionAborted();}handler.context = context;callHook(handler,'contextDidChange');callHook(handler,'setup',context,transition);if(transition && transition.isAborted){throw new TransitionAborted();}currentHandlerInfos.push(handlerInfo);return true;} /**
      @private

      This function is called when transitioning from one URL to
      another to determine which handlers are no longer active,
      which handlers are newly active, and which handlers remain
      active but have their context changed.

      Take a list of old handlers and new handlers and partition
      them into four buckets:

      * unchanged: the handler was active in both the old and
        new URL, and its context remains the same
      * updated context: the handler was active in both the
        old and new URL, but its context changed. The handler's
        `setup` method, if any, will be called with the new
        context.
      * exited: the handler was active in the old URL, but is
        no longer active.
      * entered: the handler was not active in the old URL, but
        is now active.

      The PartitionedHandlers structure has four fields:

      * `updatedContext`: a list of `HandlerInfo` objects that
        represent handlers that remain active but have a changed
        context
      * `entered`: a list of `HandlerInfo` objects that represent
        handlers that are newly active
      * `exited`: a list of `HandlerInfo` objects that are no
        longer active.
      * `unchanged`: a list of `HanderInfo` objects that remain active.

      @param {Array[HandlerInfo]} oldHandlers a list of the handler
        information for the previous URL (or `[]` if this is the
        first handled transition)
      @param {Array[HandlerInfo]} newHandlers a list of the handler
        information for the new URL

      @return {Partition}
    */function partitionHandlers(oldState,newState){var oldHandlers=oldState.handlerInfos;var newHandlers=newState.handlerInfos;var handlers={updatedContext:[],exited:[],entered:[],unchanged:[]};var handlerChanged,contextChanged=false,i,l;for(i = 0,l = newHandlers.length;i < l;i++) {var oldHandler=oldHandlers[i],newHandler=newHandlers[i];if(!oldHandler || oldHandler.handler !== newHandler.handler){handlerChanged = true;}if(handlerChanged){handlers.entered.push(newHandler);if(oldHandler){handlers.exited.unshift(oldHandler);}}else if(contextChanged || oldHandler.context !== newHandler.context){contextChanged = true;handlers.updatedContext.push(newHandler);}else {handlers.unchanged.push(oldHandler);}}for(i = newHandlers.length,l = oldHandlers.length;i < l;i++) {handlers.exited.unshift(oldHandlers[i]);}handlers.reset = handlers.updatedContext.slice();handlers.reset.reverse();return handlers;}function updateURL(transition,state,inputUrl){var urlMethod=transition.urlMethod;if(!urlMethod){return;}var router=transition.router,handlerInfos=state.handlerInfos,handlerName=handlerInfos[handlerInfos.length - 1].name,params={};for(var i=handlerInfos.length - 1;i >= 0;--i) {var handlerInfo=handlerInfos[i];merge(params,handlerInfo.params);if(handlerInfo.handler.inaccessibleByURL){urlMethod = null;}}if(urlMethod){params.queryParams = transition._visibleQueryParams || state.queryParams;var url=router.recognizer.generate(handlerName,params);if(urlMethod === 'replace'){router.replaceURL(url);}else {router.updateURL(url);}}} /**
      @private

      Updates the URL (if necessary) and calls `setupContexts`
      to update the router's array of `currentHandlerInfos`.
     */function finalizeTransition(transition,newState){try{log(transition.router,transition.sequence,"Resolved all models on destination route; finalizing transition.");var router=transition.router,handlerInfos=newState.handlerInfos,seq=transition.sequence; // Run all the necessary enter/setup/exit hooks
setupContexts(router,newState,transition); // Check if a redirect occurred in enter/setup
if(transition.isAborted){ // TODO: cleaner way? distinguish b/w targetHandlerInfos?
router.state.handlerInfos = router.currentHandlerInfos;return Promise.reject(logAbort(transition));}updateURL(transition,newState,transition.intent.url);transition.isActive = false;router.activeTransition = null;_trigger(router,router.currentHandlerInfos,true,['didTransition']);if(router.didTransition){router.didTransition(router.currentHandlerInfos);}log(router,transition.sequence,"TRANSITION COMPLETE."); // Resolve with the final handler.
return handlerInfos[handlerInfos.length - 1].handler;}catch(e) {if(!(e instanceof TransitionAborted)){ //var erroneousHandler = handlerInfos.pop();
var infos=transition.state.handlerInfos;transition.trigger(true,'error',e,transition,infos[infos.length - 1].handler);transition.abort();}throw e;}} /**
      @private

      Begins and returns a Transition based on the provided
      arguments. Accepts arguments in the form of both URL
      transitions and named transitions.

      @param {Router} router
      @param {Array[Object]} args arguments passed to transitionTo,
        replaceWith, or handleURL
    */function doTransition(router,args,isIntermediate){ // Normalize blank transitions to root URL transitions.
var name=args[0] || '/';var lastArg=args[args.length - 1];var queryParams={};if(lastArg && lastArg.hasOwnProperty('queryParams')){queryParams = pop.call(args).queryParams;}var intent;if(args.length === 0){log(router,"Updating query params"); // A query param update is really just a transition
// into the route you're already on.
var handlerInfos=router.state.handlerInfos;intent = new NamedTransitionIntent({name:handlerInfos[handlerInfos.length - 1].name,contexts:[],queryParams:queryParams});}else if(name.charAt(0) === '/'){log(router,"Attempting URL transition to " + name);intent = new URLTransitionIntent({url:name});}else {log(router,"Attempting transition to " + name);intent = new NamedTransitionIntent({name:args[0],contexts:slice.call(args,1),queryParams:queryParams});}return router.transitionByIntent(intent,isIntermediate);}function handlerInfosEqual(handlerInfos,otherHandlerInfos){if(handlerInfos.length !== otherHandlerInfos.length){return false;}for(var i=0,len=handlerInfos.length;i < len;++i) {if(handlerInfos[i] !== otherHandlerInfos[i]){return false;}}return true;}function finalizeQueryParamChange(router,resolvedHandlers,newQueryParams,transition){ // We fire a finalizeQueryParamChange event which
// gives the new route hierarchy a chance to tell
// us which query params it's consuming and what
// their final values are. If a query param is
// no longer consumed in the final route hierarchy,
// its serialized segment will be removed
// from the URL.
for(var k in newQueryParams) {if(newQueryParams.hasOwnProperty(k) && newQueryParams[k] === null){delete newQueryParams[k];}}var finalQueryParamsArray=[];_trigger(router,resolvedHandlers,true,['finalizeQueryParamChange',newQueryParams,finalQueryParamsArray,transition]);if(transition){transition._visibleQueryParams = {};}var finalQueryParams={};for(var i=0,len=finalQueryParamsArray.length;i < len;++i) {var qp=finalQueryParamsArray[i];finalQueryParams[qp.key] = qp.value;if(transition && qp.visible !== false){transition._visibleQueryParams[qp.key] = qp.value;}}return finalQueryParams;}function notifyExistingHandlers(router,newState,newTransition){var oldHandlers=router.state.handlerInfos,changing=[],leavingIndex=null,leaving,leavingChecker,i,oldHandlerLen,oldHandler,newHandler;oldHandlerLen = oldHandlers.length;for(i = 0;i < oldHandlerLen;i++) {oldHandler = oldHandlers[i];newHandler = newState.handlerInfos[i];if(!newHandler || oldHandler.name !== newHandler.name){leavingIndex = i;break;}if(!newHandler.isResolved){changing.push(oldHandler);}}if(leavingIndex !== null){leaving = oldHandlers.slice(leavingIndex,oldHandlerLen);leavingChecker = function(name){for(var h=0,len=leaving.length;h < len;h++) {if(leaving[h].name === name){return true;}}return false;};}_trigger(router,oldHandlers,true,['willTransition',newTransition]);if(router.willTransition){router.willTransition(oldHandlers,newState.handlerInfos,newTransition);}}__exports__["default"] = Router;});define("router/transition-intent",["./utils","exports"],function(__dependency1__,__exports__){"use strict";var merge=__dependency1__.merge;function TransitionIntent(props){this.initialize(props); // TODO: wat
this.data = this.data || {};}TransitionIntent.prototype = {initialize:null,applyToState:null};__exports__["default"] = TransitionIntent;});define("router/transition-intent/named-transition-intent",["../transition-intent","../transition-state","../handler-info/factory","../utils","exports"],function(__dependency1__,__dependency2__,__dependency3__,__dependency4__,__exports__){"use strict";var TransitionIntent=__dependency1__["default"];var TransitionState=__dependency2__["default"];var handlerInfoFactory=__dependency3__["default"];var isParam=__dependency4__.isParam;var extractQueryParams=__dependency4__.extractQueryParams;var merge=__dependency4__.merge;var subclass=__dependency4__.subclass;__exports__["default"] = subclass(TransitionIntent,{name:null,pivotHandler:null,contexts:null,queryParams:null,initialize:function initialize(props){this.name = props.name;this.pivotHandler = props.pivotHandler;this.contexts = props.contexts || [];this.queryParams = props.queryParams;},applyToState:function applyToState(oldState,recognizer,getHandler,isIntermediate){var partitionedArgs=extractQueryParams([this.name].concat(this.contexts)),pureArgs=partitionedArgs[0],queryParams=partitionedArgs[1],handlers=recognizer.handlersFor(pureArgs[0]);var targetRouteName=handlers[handlers.length - 1].handler;return this.applyToHandlers(oldState,handlers,getHandler,targetRouteName,isIntermediate);},applyToHandlers:function applyToHandlers(oldState,handlers,getHandler,targetRouteName,isIntermediate,checkingIfActive){var i,len;var newState=new TransitionState();var objects=this.contexts.slice(0);var invalidateIndex=handlers.length; // Pivot handlers are provided for refresh transitions
if(this.pivotHandler){for(i = 0,len = handlers.length;i < len;++i) {if(getHandler(handlers[i].handler) === this.pivotHandler){invalidateIndex = i;break;}}}var pivotHandlerFound=!this.pivotHandler;for(i = handlers.length - 1;i >= 0;--i) {var result=handlers[i];var name=result.handler;var handler=getHandler(name);var oldHandlerInfo=oldState.handlerInfos[i];var newHandlerInfo=null;if(result.names.length > 0){if(i >= invalidateIndex){newHandlerInfo = this.createParamHandlerInfo(name,handler,result.names,objects,oldHandlerInfo);}else {newHandlerInfo = this.getHandlerInfoForDynamicSegment(name,handler,result.names,objects,oldHandlerInfo,targetRouteName,i);}}else { // This route has no dynamic segment.
// Therefore treat as a param-based handlerInfo
// with empty params. This will cause the `model`
// hook to be called with empty params, which is desirable.
newHandlerInfo = this.createParamHandlerInfo(name,handler,result.names,objects,oldHandlerInfo);}if(checkingIfActive){ // If we're performing an isActive check, we want to
// serialize URL params with the provided context, but
// ignore mismatches between old and new context.
newHandlerInfo = newHandlerInfo.becomeResolved(null,newHandlerInfo.context);var oldContext=oldHandlerInfo && oldHandlerInfo.context;if(result.names.length > 0 && newHandlerInfo.context === oldContext){ // If contexts match in isActive test, assume params also match.
// This allows for flexibility in not requiring that every last
// handler provide a `serialize` method
newHandlerInfo.params = oldHandlerInfo && oldHandlerInfo.params;}newHandlerInfo.context = oldContext;}var handlerToUse=oldHandlerInfo;if(i >= invalidateIndex || newHandlerInfo.shouldSupercede(oldHandlerInfo)){invalidateIndex = Math.min(i,invalidateIndex);handlerToUse = newHandlerInfo;}if(isIntermediate && !checkingIfActive){handlerToUse = handlerToUse.becomeResolved(null,handlerToUse.context);}newState.handlerInfos.unshift(handlerToUse);}if(objects.length > 0){throw new Error("More context objects were passed than there are dynamic segments for the route: " + targetRouteName);}if(!isIntermediate){this.invalidateChildren(newState.handlerInfos,invalidateIndex);}merge(newState.queryParams,this.queryParams || {});return newState;},invalidateChildren:function invalidateChildren(handlerInfos,invalidateIndex){for(var i=invalidateIndex,l=handlerInfos.length;i < l;++i) {var handlerInfo=handlerInfos[i];handlerInfos[i] = handlerInfos[i].getUnresolved();}},getHandlerInfoForDynamicSegment:function getHandlerInfoForDynamicSegment(name,handler,names,objects,oldHandlerInfo,targetRouteName,i){var numNames=names.length;var objectToUse;if(objects.length > 0){ // Use the objects provided for this transition.
objectToUse = objects[objects.length - 1];if(isParam(objectToUse)){return this.createParamHandlerInfo(name,handler,names,objects,oldHandlerInfo);}else {objects.pop();}}else if(oldHandlerInfo && oldHandlerInfo.name === name){ // Reuse the matching oldHandlerInfo
return oldHandlerInfo;}else {if(this.preTransitionState){var preTransitionHandlerInfo=this.preTransitionState.handlerInfos[i];objectToUse = preTransitionHandlerInfo && preTransitionHandlerInfo.context;}else { // Ideally we should throw this error to provide maximal
// information to the user that not enough context objects
// were provided, but this proves too cumbersome in Ember
// in cases where inner template helpers are evaluated
// before parent helpers un-render, in which cases this
// error somewhat prematurely fires.
//throw new Error("Not enough context objects were provided to complete a transition to " + targetRouteName + ". Specifically, the " + name + " route needs an object that can be serialized into its dynamic URL segments [" + names.join(', ') + "]");
return oldHandlerInfo;}}return handlerInfoFactory('object',{name:name,handler:handler,context:objectToUse,names:names});},createParamHandlerInfo:function createParamHandlerInfo(name,handler,names,objects,oldHandlerInfo){var params={}; // Soak up all the provided string/numbers
var numNames=names.length;while(numNames--) { // Only use old params if the names match with the new handler
var oldParams=oldHandlerInfo && name === oldHandlerInfo.name && oldHandlerInfo.params || {};var peek=objects[objects.length - 1];var paramName=names[numNames];if(isParam(peek)){params[paramName] = "" + objects.pop();}else { // If we're here, this means only some of the params
// were string/number params, so try and use a param
// value from a previous handler.
if(oldParams.hasOwnProperty(paramName)){params[paramName] = oldParams[paramName];}else {throw new Error("You didn't provide enough string/numeric parameters to satisfy all of the dynamic segments for route " + name);}}}return handlerInfoFactory('param',{name:name,handler:handler,params:params});}});});define("router/transition-intent/url-transition-intent",["../transition-intent","../transition-state","../handler-info/factory","../utils","./../unrecognized-url-error","exports"],function(__dependency1__,__dependency2__,__dependency3__,__dependency4__,__dependency5__,__exports__){"use strict";var TransitionIntent=__dependency1__["default"];var TransitionState=__dependency2__["default"];var handlerInfoFactory=__dependency3__["default"];var oCreate=__dependency4__.oCreate;var merge=__dependency4__.merge;var subclass=__dependency4__.subclass;var UnrecognizedURLError=__dependency5__["default"];__exports__["default"] = subclass(TransitionIntent,{url:null,initialize:function initialize(props){this.url = props.url;},applyToState:function applyToState(oldState,recognizer,getHandler){var newState=new TransitionState();var results=recognizer.recognize(this.url),queryParams={},i,len;if(!results){throw new UnrecognizedURLError(this.url);}var statesDiffer=false;for(i = 0,len = results.length;i < len;++i) {var result=results[i];var name=result.handler;var handler=getHandler(name);if(handler.inaccessibleByURL){throw new UnrecognizedURLError(this.url);}var newHandlerInfo=handlerInfoFactory('param',{name:name,handler:handler,params:result.params});var oldHandlerInfo=oldState.handlerInfos[i];if(statesDiffer || newHandlerInfo.shouldSupercede(oldHandlerInfo)){statesDiffer = true;newState.handlerInfos[i] = newHandlerInfo;}else {newState.handlerInfos[i] = oldHandlerInfo;}}merge(newState.queryParams,results.queryParams);return newState;}});});define("router/transition-state",["./handler-info","./utils","rsvp/promise","exports"],function(__dependency1__,__dependency2__,__dependency3__,__exports__){"use strict";var ResolvedHandlerInfo=__dependency1__.ResolvedHandlerInfo;var forEach=__dependency2__.forEach;var _promiseLabel2=__dependency2__.promiseLabel;var callHook=__dependency2__.callHook;var Promise=__dependency3__["default"];function TransitionState(other){this.handlerInfos = [];this.queryParams = {};this.params = {};}TransitionState.prototype = {handlerInfos:null,queryParams:null,params:null,promiseLabel:function promiseLabel(label){var targetName='';forEach(this.handlerInfos,function(handlerInfo){if(targetName !== ''){targetName += '.';}targetName += handlerInfo.name;});return _promiseLabel2("'" + targetName + "': " + label);},resolve:function resolve(shouldContinue,payload){var self=this; // First, calculate params for this state. This is useful
// information to provide to the various route hooks.
var params=this.params;forEach(this.handlerInfos,function(handlerInfo){params[handlerInfo.name] = handlerInfo.params || {};});payload = payload || {};payload.resolveIndex = 0;var currentState=this;var wasAborted=false; // The prelude RSVP.resolve() asyncs us into the promise land.
return Promise.resolve(null,this.promiseLabel("Start transition")).then(resolveOneHandlerInfo,null,this.promiseLabel('Resolve handler'))['catch'](handleError,this.promiseLabel('Handle error'));function innerShouldContinue(){return Promise.resolve(shouldContinue(),currentState.promiseLabel("Check if should continue"))['catch'](function(reason){ // We distinguish between errors that occurred
// during resolution (e.g. beforeModel/model/afterModel),
// and aborts due to a rejecting promise from shouldContinue().
wasAborted = true;return Promise.reject(reason);},currentState.promiseLabel("Handle abort"));}function handleError(error){ // This is the only possible
// reject value of TransitionState#resolve
var handlerInfos=currentState.handlerInfos;var errorHandlerIndex=payload.resolveIndex >= handlerInfos.length?handlerInfos.length - 1:payload.resolveIndex;return Promise.reject({error:error,handlerWithError:currentState.handlerInfos[errorHandlerIndex].handler,wasAborted:wasAborted,state:currentState});}function proceed(resolvedHandlerInfo){var wasAlreadyResolved=currentState.handlerInfos[payload.resolveIndex].isResolved; // Swap the previously unresolved handlerInfo with
// the resolved handlerInfo
currentState.handlerInfos[payload.resolveIndex++] = resolvedHandlerInfo;if(!wasAlreadyResolved){ // Call the redirect hook. The reason we call it here
// vs. afterModel is so that redirects into child
// routes don't re-run the model hooks for this
// already-resolved route.
var handler=resolvedHandlerInfo.handler;callHook(handler,'redirect',resolvedHandlerInfo.context,payload);} // Proceed after ensuring that the redirect hook
// didn't abort this transition by transitioning elsewhere.
return innerShouldContinue().then(resolveOneHandlerInfo,null,currentState.promiseLabel('Resolve handler'));}function resolveOneHandlerInfo(){if(payload.resolveIndex === currentState.handlerInfos.length){ // This is is the only possible
// fulfill value of TransitionState#resolve
return {error:null,state:currentState};}var handlerInfo=currentState.handlerInfos[payload.resolveIndex];return handlerInfo.resolve(innerShouldContinue,payload).then(proceed,null,currentState.promiseLabel('Proceed'));}}};__exports__["default"] = TransitionState;});define("router/transition",["rsvp/promise","./handler-info","./utils","exports"],function(__dependency1__,__dependency2__,__dependency3__,__exports__){"use strict";var Promise=__dependency1__["default"];var ResolvedHandlerInfo=__dependency2__.ResolvedHandlerInfo;var _trigger2=__dependency3__.trigger;var slice=__dependency3__.slice;var _log=__dependency3__.log;var promiseLabel=__dependency3__.promiseLabel; /**
      @private

      A Transition is a thennable (a promise-like object) that represents
      an attempt to transition to another route. It can be aborted, either
      explicitly via `abort` or by attempting another transition while a
      previous one is still underway. An aborted transition can also
      be `retry()`d later.
     */function Transition(router,intent,state,error){var transition=this;this.state = state || router.state;this.intent = intent;this.router = router;this.data = this.intent && this.intent.data || {};this.resolvedModels = {};this.queryParams = {};if(error){this.promise = Promise.reject(error);this.error = error;return;}if(state){this.params = state.params;this.queryParams = state.queryParams;this.handlerInfos = state.handlerInfos;var len=state.handlerInfos.length;if(len){this.targetName = state.handlerInfos[len - 1].name;}for(var i=0;i < len;++i) {var handlerInfo=state.handlerInfos[i]; // TODO: this all seems hacky
if(!handlerInfo.isResolved){break;}this.pivotHandler = handlerInfo.handler;}this.sequence = Transition.currentSequence++;this.promise = state.resolve(checkForAbort,this)['catch'](function(result){if(result.wasAborted || transition.isAborted){return Promise.reject(logAbort(transition));}else {transition.trigger('error',result.error,transition,result.handlerWithError);transition.abort();return Promise.reject(result.error);}},promiseLabel('Handle Abort'));}else {this.promise = Promise.resolve(this.state);this.params = {};}function checkForAbort(){if(transition.isAborted){return Promise.reject(undefined,promiseLabel("Transition aborted - reject"));}}}Transition.currentSequence = 0;Transition.prototype = {targetName:null,urlMethod:'update',intent:null,params:null,pivotHandler:null,resolveIndex:0,handlerInfos:null,resolvedModels:null,isActive:true,state:null,queryParamsOnly:false,isTransition:true,isExiting:function isExiting(handler){var handlerInfos=this.handlerInfos;for(var i=0,len=handlerInfos.length;i < len;++i) {var handlerInfo=handlerInfos[i];if(handlerInfo.name === handler || handlerInfo.handler === handler){return false;}}return true;}, /**
        @public

        The Transition's internal promise. Calling `.then` on this property
        is that same as calling `.then` on the Transition object itself, but
        this property is exposed for when you want to pass around a
        Transition's promise, but not the Transition object itself, since
        Transition object can be externally `abort`ed, while the promise
        cannot.
       */promise:null, /**
        @public

        Custom state can be stored on a Transition's `data` object.
        This can be useful for decorating a Transition within an earlier
        hook and shared with a later hook. Properties set on `data` will
        be copied to new transitions generated by calling `retry` on this
        transition.
       */data:null, /**
        @public

        A standard promise hook that resolves if the transition
        succeeds and rejects if it fails/redirects/aborts.

        Forwards to the internal `promise` property which you can
        use in situations where you want to pass around a thennable,
        but not the Transition itself.

        @param {Function} onFulfilled
        @param {Function} onRejected
        @param {String} label optional string for labeling the promise.
        Useful for tooling.
        @return {Promise}
       */then:function then(onFulfilled,onRejected,label){return this.promise.then(onFulfilled,onRejected,label);}, /**
        @public

        Forwards to the internal `promise` property which you can
        use in situations where you want to pass around a thennable,
        but not the Transition itself.

        @method catch
        @param {Function} onRejection
        @param {String} label optional string for labeling the promise.
        Useful for tooling.
        @return {Promise}
       */"catch":function _catch(onRejection,label){return this.promise["catch"](onRejection,label);}, /**
        @public

        Forwards to the internal `promise` property which you can
        use in situations where you want to pass around a thennable,
        but not the Transition itself.

        @method finally
        @param {Function} callback
        @param {String} label optional string for labeling the promise.
        Useful for tooling.
        @return {Promise}
       */"finally":function _finally(callback,label){return this.promise["finally"](callback,label);}, /**
        @public

        Aborts the Transition. Note you can also implicitly abort a transition
        by initiating another transition while a previous one is underway.
       */abort:function abort(){if(this.isAborted){return this;}_log(this.router,this.sequence,this.targetName + ": transition was aborted");this.intent.preTransitionState = this.router.state;this.isAborted = true;this.isActive = false;this.router.activeTransition = null;return this;}, /**
        @public

        Retries a previously-aborted transition (making sure to abort the
        transition if it's still active). Returns a new transition that
        represents the new attempt to transition.
       */retry:function retry(){ // TODO: add tests for merged state retry()s
this.abort();return this.router.transitionByIntent(this.intent,false);}, /**
        @public

        Sets the URL-changing method to be employed at the end of a
        successful transition. By default, a new Transition will just
        use `updateURL`, but passing 'replace' to this method will
        cause the URL to update using 'replaceWith' instead. Omitting
        a parameter will disable the URL change, allowing for transitions
        that don't update the URL at completion (this is also used for
        handleURL, since the URL has already changed before the
        transition took place).

        @param {String} method the type of URL-changing method to use
          at the end of a transition. Accepted values are 'replace',
          falsy values, or any other non-falsy value (which is
          interpreted as an updateURL transition).

        @return {Transition} this transition
       */method:function method(_method){this.urlMethod = _method;return this;}, /**
        @public

        Fires an event on the current list of resolved/resolving
        handlers within this transition. Useful for firing events
        on route hierarchies that haven't fully been entered yet.

        Note: This method is also aliased as `send`

        @param {Boolean} [ignoreFailure=false] a boolean specifying whether unhandled events throw an error
        @param {String} name the name of the event to fire
       */trigger:function trigger(ignoreFailure){var args=slice.call(arguments);if(typeof ignoreFailure === 'boolean'){args.shift();}else { // Throw errors on unhandled trigger events by default
ignoreFailure = false;}_trigger2(this.router,this.state.handlerInfos.slice(0,this.resolveIndex + 1),ignoreFailure,args);}, /**
        @public

        Transitions are aborted and their promises rejected
        when redirects occur; this method returns a promise
        that will follow any redirects that occur and fulfill
        with the value fulfilled by any redirecting transitions
        that occur.

        @return {Promise} a promise that fulfills with the same
          value that the final redirecting transition fulfills with
       */followRedirects:function followRedirects(){var router=this.router;return this.promise['catch'](function(reason){if(router.activeTransition){return router.activeTransition.followRedirects();}return Promise.reject(reason);});},toString:function toString(){return "Transition (sequence " + this.sequence + ")";}, /**
        @private
       */log:function log(message){_log(this.router,this.sequence,message);}}; // Alias 'trigger' as 'send'
Transition.prototype.send = Transition.prototype.trigger; /**
      @private

      Logs and returns a TransitionAborted error.
     */function logAbort(transition){_log(transition.router,transition.sequence,"detected abort.");return new TransitionAborted();}function TransitionAborted(message){this.message = message || "TransitionAborted";this.name = "TransitionAborted";}__exports__.Transition = Transition;__exports__.logAbort = logAbort;__exports__.TransitionAborted = TransitionAborted;});define("router/unrecognized-url-error",["./utils","exports"],function(__dependency1__,__exports__){"use strict";var oCreate=__dependency1__.oCreate; /**
      Promise reject reasons passed to promise rejection
      handlers for failed transitions.
     */function UnrecognizedURLError(message){this.message = message || "UnrecognizedURLError";this.name = "UnrecognizedURLError";Error.call(this);}UnrecognizedURLError.prototype = oCreate(Error.prototype);__exports__["default"] = UnrecognizedURLError;});define("router/utils",["exports"],function(__exports__){"use strict";var slice=Array.prototype.slice;var _isArray;if(!Array.isArray){_isArray = function(x){return Object.prototype.toString.call(x) === "[object Array]";};}else {_isArray = Array.isArray;}var isArray=_isArray;__exports__.isArray = isArray;function merge(hash,other){for(var prop in other) {if(other.hasOwnProperty(prop)){hash[prop] = other[prop];}}}var oCreate=Object.create || function(proto){function F(){}F.prototype = proto;return new F();};__exports__.oCreate = oCreate; /**
      @private

      Extracts query params from the end of an array
    **/function extractQueryParams(array){var len=array && array.length,head,queryParams;if(len && len > 0 && array[len - 1] && array[len - 1].hasOwnProperty('queryParams')){queryParams = array[len - 1].queryParams;head = slice.call(array,0,len - 1);return [head,queryParams];}else {return [array,null];}}__exports__.extractQueryParams = extractQueryParams; /**
      @private

      Coerces query param properties and array elements into strings.
    **/function coerceQueryParamsToString(queryParams){for(var key in queryParams) {if(typeof queryParams[key] === 'number'){queryParams[key] = '' + queryParams[key];}else if(isArray(queryParams[key])){for(var i=0,l=queryParams[key].length;i < l;i++) {queryParams[key][i] = '' + queryParams[key][i];}}}} /**
      @private
     */function log(router,sequence,msg){if(!router.log){return;}if(arguments.length === 3){router.log("Transition #" + sequence + ": " + msg);}else {msg = sequence;router.log(msg);}}__exports__.log = log;function bind(context,fn){var boundArgs=arguments;return function(value){var args=slice.call(boundArgs,2);args.push(value);return fn.apply(context,args);};}__exports__.bind = bind;function isParam(object){return typeof object === "string" || object instanceof String || typeof object === "number" || object instanceof Number;}function forEach(array,callback){for(var i=0,l=array.length;i < l && false !== callback(array[i]);i++) {}}__exports__.forEach = forEach;function trigger(router,handlerInfos,ignoreFailure,args){if(router.triggerEvent){router.triggerEvent(handlerInfos,ignoreFailure,args);return;}var name=args.shift();if(!handlerInfos){if(ignoreFailure){return;}throw new Error("Could not trigger event '" + name + "'. There are no active handlers");}var eventWasHandled=false;for(var i=handlerInfos.length - 1;i >= 0;i--) {var handlerInfo=handlerInfos[i],handler=handlerInfo.handler;if(handler.events && handler.events[name]){if(handler.events[name].apply(handler,args) === true){eventWasHandled = true;}else {return;}}}if(!eventWasHandled && !ignoreFailure){throw new Error("Nothing handled the event '" + name + "'.");}}__exports__.trigger = trigger;function getChangelist(oldObject,newObject){var key;var results={all:{},changed:{},removed:{}};merge(results.all,newObject);var didChange=false;coerceQueryParamsToString(oldObject);coerceQueryParamsToString(newObject); // Calculate removals
for(key in oldObject) {if(oldObject.hasOwnProperty(key)){if(!newObject.hasOwnProperty(key)){didChange = true;results.removed[key] = oldObject[key];}}} // Calculate changes
for(key in newObject) {if(newObject.hasOwnProperty(key)){if(isArray(oldObject[key]) && isArray(newObject[key])){if(oldObject[key].length !== newObject[key].length){results.changed[key] = newObject[key];didChange = true;}else {for(var i=0,l=oldObject[key].length;i < l;i++) {if(oldObject[key][i] !== newObject[key][i]){results.changed[key] = newObject[key];didChange = true;}}}}else {if(oldObject[key] !== newObject[key]){results.changed[key] = newObject[key];didChange = true;}}}}return didChange && results;}__exports__.getChangelist = getChangelist;function promiseLabel(label){return 'Router: ' + label;}__exports__.promiseLabel = promiseLabel;function subclass(parentConstructor,proto){function C(props){parentConstructor.call(this,props || {});}C.prototype = oCreate(parentConstructor.prototype);merge(C.prototype,proto);return C;}__exports__.subclass = subclass;function resolveHook(obj,hookName){if(!obj){return;}var underscored="_" + hookName;return obj[underscored] && underscored || obj[hookName] && hookName;}function callHook(obj,_hookName,arg1,arg2){var hookName=resolveHook(obj,_hookName);return hookName && obj[hookName].call(obj,arg1,arg2);}function applyHook(obj,_hookName,args){var hookName=resolveHook(obj,_hookName);if(hookName){if(args.length === 0){return obj[hookName].call(obj);}else if(args.length === 1){return obj[hookName].call(obj,args[0]);}else if(args.length === 2){return obj[hookName].call(obj,args[0],args[1]);}else {return obj[hookName].apply(obj,args);}}}__exports__.merge = merge;__exports__.slice = slice;__exports__.isParam = isParam;__exports__.coerceQueryParamsToString = coerceQueryParamsToString;__exports__.callHook = callHook;__exports__.resolveHook = resolveHook;__exports__.applyHook = applyHook;});define("router",["./router/router","exports"],function(__dependency1__,__exports__){"use strict";var Router=__dependency1__["default"];__exports__["default"] = Router;});define("route-recognizer",[],function(){return {"default":commonObj.RouteRecognizer};});define("rsvp",[],function(){return commonObj.RSVP;});define("rsvp/promise",[],function(){return {"default":commonObj.RSVP.Promise};});module.exports = requireModule('router')['default'];

}).call(this,require('_process'))
},{"_process":2}],7:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.0.1
 */

(function() {
    "use strict";

    function $$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function $$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function $$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var $$utils$$_isArray;

    if (!Array.isArray) {
      $$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      $$utils$$_isArray = Array.isArray;
    }

    var $$utils$$isArray = $$utils$$_isArray;
    var $$utils$$now = Date.now || function() { return new Date().getTime(); };
    function $$utils$$F() { }

    var $$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      $$utils$$F.prototype = o;
      return new $$utils$$F();
    });

    var $$asap$$len = 0;

    var $$asap$$default = function asap(callback, arg) {
      $$asap$$queue[$$asap$$len] = callback;
      $$asap$$queue[$$asap$$len + 1] = arg;
      $$asap$$len += 2;
      if ($$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        $$asap$$scheduleFlush();
      }
    };

    var $$asap$$browserGlobal = (typeof window !== 'undefined') ? window : {};
    var $$asap$$BrowserMutationObserver = $$asap$$browserGlobal.MutationObserver || $$asap$$browserGlobal.WebKitMutationObserver;

    // test for web worker but not in IE10
    var $$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function $$asap$$useNextTick() {
      return function() {
        process.nextTick($$asap$$flush);
      };
    }

    function $$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new $$asap$$BrowserMutationObserver($$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function $$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = $$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function $$asap$$useSetTimeout() {
      return function() {
        setTimeout($$asap$$flush, 1);
      };
    }

    var $$asap$$queue = new Array(1000);

    function $$asap$$flush() {
      for (var i = 0; i < $$asap$$len; i+=2) {
        var callback = $$asap$$queue[i];
        var arg = $$asap$$queue[i+1];

        callback(arg);

        $$asap$$queue[i] = undefined;
        $$asap$$queue[i+1] = undefined;
      }

      $$asap$$len = 0;
    }

    var $$asap$$scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      $$asap$$scheduleFlush = $$asap$$useNextTick();
    } else if ($$asap$$BrowserMutationObserver) {
      $$asap$$scheduleFlush = $$asap$$useMutationObserver();
    } else if ($$asap$$isWorker) {
      $$asap$$scheduleFlush = $$asap$$useMessageChannel();
    } else {
      $$asap$$scheduleFlush = $$asap$$useSetTimeout();
    }

    function $$$internal$$noop() {}
    var $$$internal$$PENDING   = void 0;
    var $$$internal$$FULFILLED = 1;
    var $$$internal$$REJECTED  = 2;
    var $$$internal$$GET_THEN_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$selfFullfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function $$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.')
    }

    function $$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        $$$internal$$GET_THEN_ERROR.error = error;
        return $$$internal$$GET_THEN_ERROR;
      }
    }

    function $$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function $$$internal$$handleForeignThenable(promise, thenable, then) {
       $$asap$$default(function(promise) {
        var sealed = false;
        var error = $$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          $$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          $$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function $$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, thenable._result);
      } else if (promise._state === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, thenable._result);
      } else {
        $$$internal$$subscribe(thenable, undefined, function(value) {
          $$$internal$$resolve(promise, value);
        }, function(reason) {
          $$$internal$$reject(promise, reason);
        });
      }
    }

    function $$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        $$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = $$$internal$$getThen(maybeThenable);

        if (then === $$$internal$$GET_THEN_ERROR) {
          $$$internal$$reject(promise, $$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          $$$internal$$fulfill(promise, maybeThenable);
        } else if ($$utils$$isFunction(then)) {
          $$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          $$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function $$$internal$$resolve(promise, value) {
      if (promise === value) {
        $$$internal$$reject(promise, $$$internal$$selfFullfillment());
      } else if ($$utils$$objectOrFunction(value)) {
        $$$internal$$handleMaybeThenable(promise, value);
      } else {
        $$$internal$$fulfill(promise, value);
      }
    }

    function $$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      $$$internal$$publish(promise);
    }

    function $$$internal$$fulfill(promise, value) {
      if (promise._state !== $$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = $$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
      } else {
        $$asap$$default($$$internal$$publish, promise);
      }
    }

    function $$$internal$$reject(promise, reason) {
      if (promise._state !== $$$internal$$PENDING) { return; }
      promise._state = $$$internal$$REJECTED;
      promise._result = reason;

      $$asap$$default($$$internal$$publishRejection, promise);
    }

    function $$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + $$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + $$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        $$asap$$default($$$internal$$publish, parent);
      }
    }

    function $$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          $$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function $$$internal$$ErrorObject() {
      this.error = null;
    }

    var $$$internal$$TRY_CATCH_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        $$$internal$$TRY_CATCH_ERROR.error = e;
        return $$$internal$$TRY_CATCH_ERROR;
      }
    }

    function $$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = $$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = $$$internal$$tryCatch(callback, detail);

        if (value === $$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          $$$internal$$reject(promise, $$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== $$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        $$$internal$$resolve(promise, value);
      } else if (failed) {
        $$$internal$$reject(promise, error);
      } else if (settled === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, value);
      } else if (settled === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, value);
      }
    }

    function $$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          $$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          $$$internal$$reject(promise, reason);
        });
      } catch(e) {
        $$$internal$$reject(promise, e);
      }
    }

    function $$$enumerator$$makeSettledResult(state, position, value) {
      if (state === $$$internal$$FULFILLED) {
        return {
          state: 'fulfilled',
          value: value
        };
      } else {
        return {
          state: 'rejected',
          reason: value
        };
      }
    }

    function $$$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor($$$internal$$noop, label);
      this._abortOnReject = abortOnReject;

      if (this._validateInput(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._init();

        if (this.length === 0) {
          $$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            $$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        $$$internal$$reject(this.promise, this._validationError());
      }
    }

    $$$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return $$utils$$isArray(input);
    };

    $$$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    $$$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var $$$enumerator$$default = $$$enumerator$$Enumerator;

    $$$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var promise = this.promise;
      var input   = this._input;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    $$$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      if ($$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== $$$internal$$PENDING) {
          entry._onerror = null;
          this._settledAt(entry._state, i, entry._result);
        } else {
          this._willSettleAt(c.resolve(entry), i);
        }
      } else {
        this._remaining--;
        this._result[i] = this._makeResult($$$internal$$FULFILLED, i, entry);
      }
    };

    $$$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === $$$internal$$PENDING) {
        this._remaining--;

        if (this._abortOnReject && state === $$$internal$$REJECTED) {
          $$$internal$$reject(promise, value);
        } else {
          this._result[i] = this._makeResult(state, i, value);
        }
      }

      if (this._remaining === 0) {
        $$$internal$$fulfill(promise, this._result);
      }
    };

    $$$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    $$$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      $$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt($$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt($$$internal$$REJECTED, i, reason);
      });
    };

    var $$promise$all$$default = function all(entries, label) {
      return new $$$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    };

    var $$promise$race$$default = function race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor($$$internal$$noop, label);

      if (!$$utils$$isArray(entries)) {
        $$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        $$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        $$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        $$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    };

    var $$promise$resolve$$default = function resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$resolve(promise, object);
      return promise;
    };

    var $$promise$reject$$default = function reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$reject(promise, reason);
      return promise;
    };

    var $$es6$promise$promise$$counter = 0;

    function $$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function $$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var $$es6$promise$promise$$default = $$es6$promise$promise$$Promise;

    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise’s eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function $$es6$promise$promise$$Promise(resolver) {
      this._id = $$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if ($$$internal$$noop !== resolver) {
        if (!$$utils$$isFunction(resolver)) {
          $$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof $$es6$promise$promise$$Promise)) {
          $$es6$promise$promise$$needsNew();
        }

        $$$internal$$initializePromise(this, resolver);
      }
    }

    $$es6$promise$promise$$Promise.all = $$promise$all$$default;
    $$es6$promise$promise$$Promise.race = $$promise$race$$default;
    $$es6$promise$promise$$Promise.resolve = $$promise$resolve$$default;
    $$es6$promise$promise$$Promise.reject = $$promise$reject$$default;

    $$es6$promise$promise$$Promise.prototype = {
      constructor: $$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === $$$internal$$FULFILLED && !onFulfillment || state === $$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor($$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          $$asap$$default(function(){
            $$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          $$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };

    var $$es6$promise$polyfill$$default = function polyfill() {
      var local;

      if (typeof global !== 'undefined') {
        local = global;
      } else if (typeof window !== 'undefined' && window.document) {
        local = window;
      } else {
        local = self;
      }

      var es6PromiseSupport =
        "Promise" in local &&
        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        "resolve" in local.Promise &&
        "reject" in local.Promise &&
        "all" in local.Promise &&
        "race" in local.Promise &&
        // Older version of the spec had a resolver object
        // as the arg rather than a function
        (function() {
          var resolve;
          new local.Promise(function(r) { resolve = r; });
          return $$utils$$isFunction(resolve);
        }());

      if (!es6PromiseSupport) {
        local.Promise = $$es6$promise$promise$$default;
      }
    };

    var es6$promise$umd$$ES6Promise = {
      'Promise': $$es6$promise$promise$$default,
      'polyfill': $$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = es6$promise$umd$$ES6Promise;
    }
}).call(this);
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":2}],8:[function(require,module,exports){
exports = module.exports = stringify
exports.getSerialize = serializer

function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}

function serializer(replacer, cycleReplacer) {
  var stack = [], keys = []

  if (cycleReplacer == null) cycleReplacer = function(key, value) {
    if (stack[0] === value) return "[Circular ~]"
    return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
  }

  return function(key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this)
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
    }
    else stack.push(value)

    return replacer == null ? value : replacer.call(this, key, value)
  }
}

},{}],9:[function(require,module,exports){
// Domain Public by Eric Wendelin http://www.eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)
/*global module, exports, define, ActiveXObject*/
(function(global, factory) {
    if (typeof exports === 'object') {
        // Node
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals
        global.printStackTrace = factory();
    }
}(this, function() {
    /**
     * Main function giving a function stack trace with a forced or passed in Error
     *
     * @cfg {Error} e The error to create a stacktrace from (optional)
     * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
     * @return {Array} of Strings with functions, lines, files, and arguments where possible
     */
    function printStackTrace(options) {
        options = options || {guess: true};
        var ex = options.e || null, guess = !!options.guess, mode = options.mode || null;
        var p = new printStackTrace.implementation(), result = p.run(ex, mode);
        return (guess) ? p.guessAnonymousFunctions(result) : result;
    }

    printStackTrace.implementation = function() {
    };

    printStackTrace.implementation.prototype = {
        /**
         * @param {Error} [ex] The error to create a stacktrace from (optional)
         * @param {String} [mode] Forced mode (optional, mostly for unit tests)
         */
        run: function(ex, mode) {
            ex = ex || this.createException();
            mode = mode || this.mode(ex);
            if (mode === 'other') {
                return this.other(arguments.callee);
            } else {
                return this[mode](ex);
            }
        },

        createException: function() {
            try {
                this.undef();
            } catch (e) {
                return e;
            }
        },

        /**
         * Mode could differ for different exception, e.g.
         * exceptions in Chrome may or may not have arguments or stack.
         *
         * @return {String} mode of operation for the exception
         */
        mode: function(e) {
            if (typeof window !== 'undefined' && window.navigator.userAgent.indexOf('PhantomJS') > -1) {
                return 'phantomjs';
            }

            if (e['arguments'] && e.stack) {
                return 'chrome';
            }

            if (e.stack && e.sourceURL) {
                return 'safari';
            }

            if (e.stack && e.number) {
                return 'ie';
            }

            if (e.stack && e.fileName) {
                return 'firefox';
            }

            if (e.message && e['opera#sourceloc']) {
                // e.message.indexOf("Backtrace:") > -1 -> opera9
                // 'opera#sourceloc' in e -> opera9, opera10a
                // !e.stacktrace -> opera9
                if (!e.stacktrace) {
                    return 'opera9'; // use e.message
                }
                if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                    // e.message may have more stack entries than e.stacktrace
                    return 'opera9'; // use e.message
                }
                return 'opera10a'; // use e.stacktrace
            }

            if (e.message && e.stack && e.stacktrace) {
                // e.stacktrace && e.stack -> opera10b
                if (e.stacktrace.indexOf("called from line") < 0) {
                    return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
                }
                // e.stacktrace && e.stack -> opera11
                return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
            }

            if (e.stack && !e.fileName) {
                // Chrome 27 does not have e.arguments as earlier versions,
                // but still does not have e.fileName as Firefox
                return 'chrome';
            }

            return 'other';
        },

        /**
         * Given a context, function name, and callback function, overwrite it so that it calls
         * printStackTrace() first with a callback and then runs the rest of the body.
         *
         * @param {Object} context of execution (e.g. window)
         * @param {String} functionName to instrument
         * @param {Function} callback function to call with a stack trace on invocation
         */
        instrumentFunction: function(context, functionName, callback) {
            context = context || window;
            var original = context[functionName];
            context[functionName] = function instrumented() {
                callback.call(this, printStackTrace().slice(4));
                return context[functionName]._instrumented.apply(this, arguments);
            };
            context[functionName]._instrumented = original;
        },

        /**
         * Given a context and function name of a function that has been
         * instrumented, revert the function to it's original (non-instrumented)
         * state.
         *
         * @param {Object} context of execution (e.g. window)
         * @param {String} functionName to de-instrument
         */
        deinstrumentFunction: function(context, functionName) {
            if (context[functionName].constructor === Function &&
                context[functionName]._instrumented &&
                context[functionName]._instrumented.constructor === Function) {
                context[functionName] = context[functionName]._instrumented;
            }
        },

        /**
         * Given an Error object, return a formatted Array based on Chrome's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        chrome: function(e) {
            return (e.stack + '\n')
                .replace(/^[\s\S]+?\s+at\s+/, ' at ') // remove message
                .replace(/^\s+(at eval )?at\s+/gm, '') // remove 'at' and indentation
                .replace(/^([^\(]+?)([\n$])/gm, '{anonymous}() ($1)$2')
                .replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}() ($1)')
                .replace(/^(.+) \((.+)\)$/gm, '$1@$2')
                .split('\n')
                .slice(0, -1);
        },

        /**
         * Given an Error object, return a formatted Array based on Safari's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        safari: function(e) {
            return e.stack.replace(/\[native code\]\n/m, '')
                .replace(/^(?=\w+Error\:).*$\n/m, '')
                .replace(/^@/gm, '{anonymous}()@')
                .split('\n');
        },

        /**
         * Given an Error object, return a formatted Array based on IE's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        ie: function(e) {
            return e.stack
                .replace(/^\s*at\s+(.*)$/gm, '$1')
                .replace(/^Anonymous function\s+/gm, '{anonymous}() ')
                .replace(/^(.+)\s+\((.+)\)$/gm, '$1@$2')
                .split('\n')
                .slice(1);
        },

        /**
         * Given an Error object, return a formatted Array based on Firefox's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        firefox: function(e) {
            return e.stack.replace(/(?:\n@:0)?\s+$/m, '')
                .replace(/^(?:\((\S*)\))?@/gm, '{anonymous}($1)@')
                .split('\n');
        },

        opera11: function(e) {
            var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var location = match[4] + ':' + match[1] + ':' + match[2];
                    var fnName = match[3] || "global code";
                    fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                    result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        opera10b: function(e) {
            // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
            // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
            // "@file://localhost/G:/js/test/functional/testcase1.html:15"
            var lineRE = /^(.*)@(.+):(\d+)$/;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i++) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var fnName = match[1] ? (match[1] + '()') : "global code";
                    result.push(fnName + '@' + match[2] + ':' + match[3]);
                }
            }

            return result;
        },

        /**
         * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        opera10a: function(e) {
            // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
            // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
            var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var fnName = match[3] || ANON;
                    result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        // Opera 7.x-9.2x only!
        opera9: function(e) {
            // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
            // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
            var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n'), result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        phantomjs: function(e) {
            var ANON = '{anonymous}', lineRE = /(\S+) \((\S+)\)/i;
            var lines = e.stack.split('\n'), result = [];

            for (var i = 1, len = lines.length; i < len; i++) {
                lines[i] = lines[i].replace(/^\s+at\s+/gm, '');
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(match[1] + '()@' + match[2]);
                }
                else {
                    result.push(ANON + '()@' + lines[i]);
                }
            }

            return result;
        },

        // Safari 5-, IE 9-, and others
        other: function(curr) {
            var ANON = '{anonymous}', fnRE = /function(?:\s+([\w$]+))?\s*\(/, stack = [], fn, args, maxStackSize = 10;
            var slice = Array.prototype.slice;
            while (curr && stack.length < maxStackSize) {
                fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
                try {
                    args = slice.call(curr['arguments'] || []);
                } catch (e) {
                    args = ['Cannot access arguments: ' + e];
                }
                stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
                try {
                    curr = curr.caller;
                } catch (e) {
                    stack[stack.length] = 'Cannot access caller: ' + e;
                    break;
                }
            }
            return stack;
        },

        /**
         * Given arguments array as a String, substituting type names for non-string types.
         *
         * @param {Arguments,Array} args
         * @return {String} stringified arguments
         */
        stringifyArguments: function(args) {
            var result = [];
            var slice = Array.prototype.slice;
            for (var i = 0; i < args.length; ++i) {
                var arg = args[i];
                if (arg === undefined) {
                    result[i] = 'undefined';
                } else if (arg === null) {
                    result[i] = 'null';
                } else if (arg.constructor) {
                    // TODO constructor comparison does not work for iframes
                    if (arg.constructor === Array) {
                        if (arg.length < 3) {
                            result[i] = '[' + this.stringifyArguments(arg) + ']';
                        } else {
                            result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
                        }
                    } else if (arg.constructor === Object) {
                        result[i] = '#object';
                    } else if (arg.constructor === Function) {
                        result[i] = '#function';
                    } else if (arg.constructor === String) {
                        result[i] = '"' + arg + '"';
                    } else if (arg.constructor === Number) {
                        result[i] = arg;
                    } else {
                        result[i] = '?';
                    }
                }
            }
            return result.join(',');
        },

        sourceCache: {},

        /**
         * @return {String} the text from a given URL
         */
        ajax: function(url) {
            var req = this.createXMLHTTPObject();
            if (req) {
                try {
                    req.open('GET', url, false);
                    //req.overrideMimeType('text/plain');
                    //req.overrideMimeType('text/javascript');
                    req.send(null);
                    //return req.status == 200 ? req.responseText : '';
                    return req.responseText;
                } catch (e) {
                }
            }
            return '';
        },

        /**
         * Try XHR methods in order and store XHR factory.
         *
         * @return {XMLHttpRequest} XHR function or equivalent
         */
        createXMLHTTPObject: function() {
            var xmlhttp, XMLHttpFactories = [
                function() {
                    return new XMLHttpRequest();
                }, function() {
                    return new ActiveXObject('Msxml2.XMLHTTP');
                }, function() {
                    return new ActiveXObject('Msxml3.XMLHTTP');
                }, function() {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                }
            ];
            for (var i = 0; i < XMLHttpFactories.length; i++) {
                try {
                    xmlhttp = XMLHttpFactories[i]();
                    // Use memoization to cache the factory
                    this.createXMLHTTPObject = XMLHttpFactories[i];
                    return xmlhttp;
                } catch (e) {
                }
            }
        },

        /**
         * Given a URL, check if it is in the same domain (so we can get the source
         * via Ajax).
         *
         * @param url {String} source url
         * @return {Boolean} False if we need a cross-domain request
         */
        isSameDomain: function(url) {
            return typeof location !== "undefined" && url.indexOf(location.hostname) !== -1; // location may not be defined, e.g. when running from nodejs.
        },

        /**
         * Get source code from given URL if in the same domain.
         *
         * @param url {String} JS source URL
         * @return {Array} Array of source code lines
         */
        getSource: function(url) {
            // TODO reuse source from script tags?
            if (!(url in this.sourceCache)) {
                this.sourceCache[url] = this.ajax(url).split('\n');
            }
            return this.sourceCache[url];
        },

        guessAnonymousFunctions: function(stack) {
            for (var i = 0; i < stack.length; ++i) {
                var reStack = /\{anonymous\}\(.*\)@(.*)/,
                    reRef = /^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,
                    frame = stack[i], ref = reStack.exec(frame);

                if (ref) {
                    var m = reRef.exec(ref[1]);
                    if (m) { // If falsey, we did not get any file/line information
                        var file = m[1], lineno = m[2], charno = m[3] || 0;
                        if (file && this.isSameDomain(file) && lineno) {
                            var functionName = this.guessAnonymousFunction(file, lineno, charno);
                            stack[i] = frame.replace('{anonymous}', functionName);
                        }
                    }
                }
            }
            return stack;
        },

        guessAnonymousFunction: function(url, lineNo, charNo) {
            var ret;
            try {
                ret = this.findFunctionName(this.getSource(url), lineNo);
            } catch (e) {
                ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
            }
            return ret;
        },

        findFunctionName: function(source, lineNo) {
            // FIXME findFunctionName fails for compressed source
            // (more than one function on the same line)
            // function {name}({args}) m[1]=name m[2]=args
            var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
            // {name} = function ({args}) TODO args capture
            // /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
            var reFunctionExpression = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/;
            // {name} = eval()
            var reFunctionEvaluation = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
            // Walk backwards in the source lines until we find
            // the line which matches one of the patterns above
            var code = "", line, maxLines = Math.min(lineNo, 20), m, commentPos;
            for (var i = 0; i < maxLines; ++i) {
                // lineNo is 1-based, source[] is 0-based
                line = source[lineNo - i - 1];
                commentPos = line.indexOf('//');
                if (commentPos >= 0) {
                    line = line.substr(0, commentPos);
                }
                // TODO check other types of comments? Commented code may lead to false positive
                if (line) {
                    code = line + code;
                    m = reFunctionExpression.exec(code);
                    if (m && m[1]) {
                        return m[1];
                    }
                    m = reFunctionDeclaration.exec(code);
                    if (m && m[1]) {
                        //return m[1] + "(" + (m[2] || "") + ")";
                        return m[1];
                    }
                    m = reFunctionEvaluation.exec(code);
                    if (m && m[1]) {
                        return m[1];
                    }
                }
            }
            return '(?)';
        }
    };

    return printStackTrace;
}));

},{}],10:[function(require,module,exports){
'use strict';

var Promise = Promise || require('es6-promise').Promise;
var stackTrace = require('stacktrace-js');
var serialize = require('json-stringify-safe');
var TransactionController = require('./TransactionController');

function augmentContext(context, property, value) {
  Object.defineProperty(context, property, {
    value: value,
    writable: false,
    enumerable: false,
    configurable: true
  });
}

function PromisePipeFactory() {

  /**
   * cleanup PromisePipe call ID/and env at the Pipe end
   */
  function cleanup(data, context) {
    delete context._pipecallId;
    delete context._env;
    return data;
  }

  /**
   * PromisePipe chain constructor
   * @param {Array} sequence  Sequence of chain functions
   */
  function PromisePipe(options, sequence) {
    if (Array.isArray(options)) {
      sequence = options;
    }
    sequence || (sequence = []);

    function result(data, context) {
      context || (context = {});
      // set Random PromisePipe call ID
      augmentContext(context, '_pipecallId', Math.ceil(Math.random() * Math.pow(10, 16)));
      // set current PromisePipe env
      augmentContext(context, '_env', PromisePipe.env);
      var _trace = {};
      _trace[context._pipecallId] = [];
      augmentContext(context, '_trace', _trace);

      var toConcat = [sequence];

      if (PromisePipe._mode === 'DEBUG') {
        var debugChain = {
          func: printDebug,
          _id: ID(),
          _env: PromisePipe.env
        };
        toConcat.push(debugChain);
      }
      var cleanupChain = {
        func: cleanup,
        _id: ID(),
        _env: PromisePipe.env
      };
      toConcat.push(cleanupChain);

      var chain = [].concat.apply([], toConcat);

      chain = chain.map(bindTo(context).bindIt.bind(result)).map(function (fn) {
        if (!fn._env) {
          fn._env = PromisePipe.env;
        }

        return fn;
      });
      // run the chain
      return doit(chain, data, result, context);
    }

    function printDebug(data, context) {
      var ln = context._trace[context._pipecallId].length;
      printDebugChain(context._trace[context._pipecallId].slice(0, ln - 1));
      return data;
    }

    function printDebugChain(traceLog) {
      var seqIds = sequence.map(function (fn) {
        return fn._id;
      });

      function showLevel(i, traceLog) {
        var item = traceLog[i];
        var fnId = seqIds.indexOf(item.chainId);
        var name = '';
        if (!! ~fnId) {
          name = sequence[fnId].name || sequence[fnId]._name;
        }
        console.group('.then(' + name + ')[' + item.env + ']');
        console.log('data', item.data && JSON.parse(item.data));
        console.log('context', JSON.parse(item.context));
        if (traceLog[i + 1]) {
          showLevel(i + 1, traceLog);
        }
        console.groupEnd('.then(' + name + ')');
      }

      if (console.group) {
        showLevel(0, traceLog);
      } else {
        traceLog.forEach(function (item, i) {
          var shift = new Array(i * 4 + 1).join('');
          var fnId = seqIds.indexOf(item.chainId);
          var name = '';
          if (!! ~fnId) {
            name = sequence[fnId].name;
          }

          console.log(shift + ".then(" + name + ")[" + item.env + "]");
          console.log(shift + "    data    : " + JSON.stringify(item.data));
          console.log(shift + "    context : " + item.context);
          return result;
        });
      }
    }

    //promise pipe ID
    result._id = ID();
    PromisePipe.pipes[result._id] = {
      id: result._id,
      seq: sequence,
      name: options && options.name,
      description: options && options.description,
      Pipe: result
    };

    // add function to the chain of a pipe
    result.then = function (fn) {
      var chain = {
        func: fn,
        _id: ID(),
        name: fn.name,
        _env: fn._env
      };
      sequence.push(chain);
      return result;
    };
    // add catch to the chain of a pipe
    result['catch'] = function (fn) {
      var chain = {
        func: fn,
        _id: ID(),
        isCatch: true,
        name: fn.name,
        _env: fn._env
      };
      sequence.push(chain);
      return result;
    };

    // join pipes
    result.join = function () {
      var sequences = [].map.call(arguments, function (pipe) {
        return pipe._getSequence();
      });

      var newSequence = sequence.concat.apply(sequence, sequences);
      return PromisePipe(newSequence);
    };
    // get an array of pipes
    result._getSequence = function () {
      return sequence;
    };

    // add API extensions for the promisepipe
    result = Object.keys(PromisePipe.transformations).reduce(function (thePipe, name) {
      var customApi = PromisePipe.transformations[name];
      customApi._name = name;
      if (typeof customApi === 'object') {
        thePipe[name] = wrapObjectPromise(customApi, sequence, result);
      } else {
        thePipe[name] = wrapPromise(customApi, sequence, result);
      }
      return thePipe;
    }, result);

    return result;
  }

  function wrapObjectPromise(customApi, sequence, result) {
    return Object.keys(customApi).reduce(function (api, apiname) {
      if (apiname.charAt(0) === "_") return api;
      customApi[apiname]._env = customApi._env;
      customApi[apiname]._name = customApi._name + "." + apiname;
      if (typeof customApi[apiname] === 'object') {
        api[apiname] = wrapObjectPromise(customApi[apiname], sequence, result);
      } else {
        api[apiname] = wrapPromise(customApi[apiname], sequence, result);
      }
      return api;
    }, {});
  }

  function wrapPromise(transObject, sequence, result) {
    return function () {
      var args = [].slice.call(arguments);
      //TODO: try to use .bind here
      var wrappedFunction = function wrappedFunction(data, context) {
        var argumentsToPassInside = [data, context].concat(args);
        return transObject.apply(result, argumentsToPassInside);
      };
      var chain = {
        func: wrappedFunction,
        _id: ID(),
        name: transObject._name,
        _env: transObject._env,
        isCatch: transObject.isCatch
      };
      sequence.push(chain);
      return result;
    };
  }

  // PromisePipe is a singleton
  // that knows about all pipes and you can get a pipe by ID's
  PromisePipe.pipes = {};

  PromisePipe._mode = 'PROD';
  /**
  * DEBUG/TEST/PROD
  *
  */
  PromisePipe.setMode = function (mode) {
    PromisePipe._mode = mode;
  };

  /*
  * setting up env for pipe
  */
  PromisePipe.setEnv = function (env) {
    PromisePipe.env = env;
  };

  // the ENV is a client by default
  PromisePipe.setEnv('client');

  /*
  * Is setting up function to be executed inside specific ENV
  * usage:
  * var doOnServer = PromisePipe.in('server');
  * PromisePipe().then(doOnServer(fn));
  * or
  * PromisePipe().then(PromisePipe.in('worker').do(fn));
  */
  PromisePipe['in'] = function (env) {
    if (!env) throw new Error('You should explicitly specify env');
    var result = function makeEnv(fn) {
      var ret = fn.bind(null);
      ret._env = env;
      return ret;
    };
    result['do'] = function doIn(fn) {
      var ret = fn.bind(null);
      ret._env = env;
      return ret;
    };

    return result;
  };

  PromisePipe.envTransitions = {};

  // Inside transition you describe how to send message from one
  // env to another within a Pipe call
  PromisePipe.envTransition = function (from, to, transition) {
    if (!PromisePipe.envTransitions[from]) {
      PromisePipe.envTransitions[from] = {};
    }

    PromisePipe.envTransitions[from][to] = transition;
  };

  //env transformations
  PromisePipe.envContextTransformations = function (from, to, transformation) {
    if (!PromisePipe.contextTransformations[from]) {
      PromisePipe.contextTransformations[from] = {};
    }
    PromisePipe.contextTransformations[from][to] = transformation;
  };

  PromisePipe.transformations = {};

  // You can extend PromisePipe API with extensions
  PromisePipe.use = function (name, transformation, options) {
    options || (options = {});
    transformation = transformation || function () {};

    if (!options._env) {
      options._env = PromisePipe.env;
    }

    PromisePipe.transformations[name] = transformation;

    Object.keys(options).forEach(function (optname) {
      PromisePipe.transformations[name][optname] = options[optname];
    });
  };
  // when you pass Message to another env, you have to wait
  // until it will come back
  // messageResolvers save the call and resoves it when message came back
  PromisePipe.messageResolvers = {};

  //TODO: cover by tests
  PromisePipe.stream = function (from, to, processor) {
    return {
      connector: function connector(strm) {
        //set transition
        PromisePipe.envTransition(from, to, function (message) {
          strm.send(message);
          return PromisePipe.promiseMessage(message);
        });

        strm.listen(function (message) {
          var context = message.context;
          var data = message.data;
          function end(data) {
            message.context = context;
            message.data = data;
            strm.send(message);
          }
          if (processor) {
            var executor = function executor(data, context) {
              message.data = data;
              message.context = context;
              return PromisePipe.execTransitionMessage(message);
            };

            var localContext = {};
            localContext.__proto__ = context;
            return processor(data, localContext, executor, end);
          }
          return PromisePipe.execTransitionMessage(message).then(end);
        });
      }
    };
  };

  var TransactionHandler = TransactionController();

  PromisePipe.promiseMessage = function (message) {
    return new Promise(function (resolve, reject) {
      PromisePipe.messageResolvers[message.call] = {
        resolve: resolve,
        reject: reject,
        context: message.context
      };
    });
  };

  // when you pass a message within a pipe to other env
  // you should
  PromisePipe.execTransitionMessage = function execTransitionMessage(message) {
    if (TransactionHandler.processTransaction(message)) return { then: function then() {} };

    var context = message.context;
    context._env = PromisePipe.env;
    delete context._passChains;

    //get back contexts non enumerables
    augmentContext(context, '_pipecallId', message.call);
    augmentContext(context, '_trace', message._trace);

    var sequence = PromisePipe.pipes[message.pipe].seq;
    var chain = [].concat(sequence);

    var ids = chain.map(function (el) {
      return el._id;
    });

    //Check that this is bounded chain nothing is passed through
    var firstChainIndex = ids.indexOf(message.chains[0]);

    //someone is trying to hack the Pipe
    if (firstChainIndex > 0 && sequence[firstChainIndex]._env === sequence[firstChainIndex - 1]._env) {
      console.error("Non-consistent pipe call, message is trying to omit chains");
      return Promise.reject({ error: "Non-consistent pipe call, message is trying to omit chains" })['catch'](unhandledCatch);
    }

    var newChain = chain.slice(firstChainIndex, ids.indexOf(message.chains[1]) + 1);

    newChain = newChain.map(bindTo(context).bindIt);

    //catch inside env
    function unhandledCatch(data) {
      message.unhandledFail = data;
      return data;
    }

    return doit(newChain, message.data, { _id: message.pipe }, context)['catch'](unhandledCatch);
  };

  PromisePipe.createTransitionMessage = function createTransitionMessage(data, context, pipeId, chainId, envBackChainId, callId) {
    return {
      data: data,
      context: context,
      pipe: pipeId,
      chains: [chainId, envBackChainId],
      call: callId,
      _trace: context._trace
    };
  };
  /*
    experimental
  */
  PromisePipe.localContext = function (context) {
    return {
      execTransitionMessage: function execTransitionMessage(message) {
        var origContext = message.context;
        context.__proto__ = origContext;
        message.context = context;
        return PromisePipe.execTransitionMessage(message).then(function (data) {
          message.context = origContext;
          return data;
        });
      },
      //TODO:cover with Tests
      wrap: function wrap(fn) {
        return function (data, origContext) {
          context.__proto__ = origContext;
          return fn(data, context);
        };
      }
    };
  };

  //PromisePipe.api = require('./RemoteAPIHandlers')();

  // build a chain of promises
  function doit(sequence, data, pipe, ctx) {
    return sequence.reduce(function (doWork, funcArr, funcIndex) {
      var systemEnvs = {
        both: {
          predicate: function predicate() {
            return funcArr._env === 'both';
          },
          handler: function handler() {
            var toNextEnv = getNameNextEnv(PromisePipe.env);

            if (!toNextEnv) {
              return function (data) {
                return funcArr(data);
              };
            }

            return function () {
              return doWork.then(funcArr).then(function () {
                var msg = PromisePipe.createTransitionMessage(data, ctx, pipe._id, funcArr._id, funcArr._id, ctx._pipecallId);

                var range = rangeChain(funcArr._id, sequence);

                ctx._passChains = passChains(range[0] - 1, range[0] - 1);
                return TransactionHandler.createTransaction(msg).send(PromisePipe.envTransitions[ctx._env][toNextEnv]).then(updateContextAfterTransition).then(handleRejectAfterTransition);
              });
            };
          }
        },
        inherit: {
          predicate: function predicate() {
            return funcArr._env === 'inherit';
          },
          handler: function handler() {
            funcArr._env = sequence[funcIndex]._env;

            return funcArr;
          }
        }
      };

      function getNameNextEnv(env) {
        if (!PromisePipe.envTransitions[ctx._env]) {
          return null;
        }

        return Object.keys(PromisePipe.envTransitions[ctx._env]).reduce(function (nextEnv, name) {
          if (nextEnv) {
            return nextEnv;
          }

          if (name === env) {
            return nextEnv;
          }

          if (name !== env) {
            return name;
          }
        }, null);
      }

      /**
       * Get index of next env appearance
       * @param   {Number}  fromIndex
       * @param   {String}  env
       * @return  {Number}
       */
      function getIndexOfNextEnvAppearance(fromIndex, env) {
        return sequence.map(function (el) {
          return el._env;
        }).indexOf(env, fromIndex);
      }

      /**
       * Check env of system behavoir
       * @param   {String}  env Env for checking
       * @return  {Boolean}
       */
      function isSystemTransition(env) {
        return !!systemEnvs[env];
      }

      /**
       * Check valid is transition
       */
      function isValidTransition(funcArr, ctx) {
        var isValid = true;

        if (!(PromisePipe.envTransitions[ctx._env] && PromisePipe.envTransitions[ctx._env][funcArr._env])) {
          if (!isSystemTransition(funcArr._env)) {
            isValid = false;
          }
        }

        return isValid;
      }

      /**
       * Return filtered list for passing functions
       * @param   {Number}    first
       * @param   {Number}    last
       * @return  {Array}
       */
      function passChains(first, last) {
        return sequence.map(function (el) {
          return el._id;
        }).slice(first, last + 1);
      }

      /**
       * Return lastChain index
       * @param   {Number}  first
       * @return  {Number}
       */
      function lastChain(first) {
        var index = getIndexOfNextEnvAppearance(first, PromisePipe.env, sequence);

        return index === -1 ? sequence.length - 1 : index - 1;
      }

      /**
       * Return tuple of chained indexes
       * @param   {Number}  id
       * @return  {Tuple}
       */
      function rangeChain(id) {
        var first = getChainIndexById(id, sequence);

        return [first, lastChain(first, sequence)];
      }

      /**
       * Get chain by index
       * @param {String}  id
       * @param {Array}   sequence
       */
      function getChainIndexById(id) {
        return sequence.map(function (el) {
          return el._id;
        }).indexOf(id);
      }

      //transition returns context in another object.
      //we must preserve existing object and make changes accordingly
      function updateContextAfterTransition(message) {
        //inherit from coming message context
        Object.keys(message.context).reduce(function (context, name) {
          context[name] = message.context[name];
          return context;
        }, ctx);
        return message;
      }
      function handleRejectAfterTransition(message) {
        return new Promise(function (resolve, reject) {
          if (message.unhandledFail) return reject(message.data);
          resolve(message.data);
        });
      }

      function jump(range) {
        return function (data) {
          var msg = PromisePipe.createTransitionMessage(data, ctx, pipe._id, funcArr._id, sequence[range[1]]._id, ctx._pipecallId);
          return TransactionHandler.createTransaction(msg).send(PromisePipe.envTransitions[ctx._env][funcArr._env]).then(updateContextAfterTransition).then(handleRejectAfterTransition);
        };
      }

      /**
       * Jump to next env
       * @return  {Function}
       */
      function toNextEnv() {
        var range = rangeChain(funcArr._id, sequence);

        ctx._passChains = passChains(range[0], range[1]);

        if (!isValidTransition(funcArr, ctx)) {
          throw Error('there is no transition ' + ctx._env + ' to ' + funcArr._env);
        }

        return jump(range);
      }

      /**
       * Will we go to the next env
       */
      function goToNextEnv() {
        return ctx._env !== funcArr._env;
      }

      //it shows error in console and passes it down
      function errorEnhancer(data) {
        //is plain Error and was not yet caught
        if (data instanceof Error && !data.caughtOnChainId) {
          data.caughtOnChainId = funcArr._id;

          var trace = stackTrace({ e: data });
          if (funcArr._name) {
            console.log('Failed inside ' + funcArr._name);
          }
          console.log(data.toString());
          console.log(trace.join('\n'));
        }
        return Promise.reject(data);
      }

      /**
       * Skip this chain
       * @return  {Function}
       */
      function toNextChain() {
        return function (data) {
          return data;
        };
      }

      /**
       * Check is skip chain
       * @return  {Boolean}
       */
      function skipChain() {
        if (!ctx._passChains) {
          return false;
        }

        if (!! ~ctx._passChains.indexOf(funcArr._id)) {
          return true;
        }

        return false;
      }

      /**
       * Execute handler on correct env
       * @return  {Function}
       */
      function doOnPropEnv() {
        return Object.keys(systemEnvs).reduce(function (chain, name) {

          if (chain !== funcArr) {
            // fixed handler for current chain
            return chain;
          }

          if (systemEnvs[name].predicate(sequence, funcArr)) {
            return systemEnvs[name].handler(sequence, funcArr, funcIndex, ctx);
          }

          if (goToNextEnv() && !skipChain()) {
            return toNextEnv();
          }

          if (goToNextEnv() && skipChain()) {
            return toNextChain();
          }

          return chain;
        }, funcArr);
      }

      if (funcArr && funcArr.isCatch) {
        return doWork['catch'](funcArr);
      }

      return doWork.then(doOnPropEnv())['catch'](errorEnhancer);
    }, Promise.resolve(data));
  }

  function bindTo(that) {
    return {
      bindIt: function bindIt(chain) {
        var handler = chain.func;
        var newArgFunc = function newArgFunc(data) {
          // advanced debugging

          if (PromisePipe._mode === 'DEBUG') {
            if (that._pipecallId && that._trace) {
              var joinedContext = getProtoChain(that).reverse().reduce(join, {});
              var cleanContext = JSON.parse(serialize(joinedContext));
              //should be hidden
              delete cleanContext._passChains;
              that._trace[that._pipecallId].push({
                chainId: chain._id,
                data: serialize(data),
                context: JSON.stringify(cleanContext),
                timestamp: Date.now(),
                env: that._env
              });
            }
          }

          return handler.call(that, data, that);
        };

        newArgFunc._name = chain.name;
        Object.keys(chain).reduce(function (funObj, key) {
          if (key !== 'name') funObj[key] = chain[key];
          return funObj;
        }, newArgFunc);
        return newArgFunc;
      }
    };
  }

  function join(result, obj) {
    Object.keys(obj).forEach(function (key) {
      result[key] = obj[key];
    });
    return result;
  }

  function getProtoChain(_x, _x2) {
    var _again = true;

    _function: while (_again) {
      var obj = _x,
          result = _x2;
      _again = false;

      if (!result) result = [];
      result.push(obj);
      if (obj.__proto__) {
        _x = obj.__proto__;
        _x2 = result;
        _again = true;
        continue _function;
      }
      return result;
    }
  }

  var counter = 1234567890987;
  function ID() {
    counter++;
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return counter.toString(36).substr(-8);
  }

  PromisePipe.api = require('./RemoteAPIHandlers')(PromisePipe);

  return PromisePipe;
}

module.exports = PromisePipeFactory;

},{"./RemoteAPIHandlers":11,"./TransactionController":12,"es6-promise":7,"json-stringify-safe":8,"stacktrace-js":9}],11:[function(require,module,exports){
"use strict";

module.exports = function (PromisePipe) {
  return {
    provide: function provide(connector, apiName) {
      connector.listen(function (message) {
        function end(data) {
          message.data = data;
          connector.send(message);
        }

        PromisePipe.pipes[message.id].Pipe(message.data, message.context || {})["catch"](unhandledCatch).then(end);

        //catch inside env
        function unhandledCatch(data) {
          message.unhandledFail = data;
          return data;
        }
      });
      return generateClientAPI(apiName, PromisePipe);
    }
  };
};

var TransactionController = require('./TransactionController');

function generateClientAPI(apiName, PromisePipe) {
  var result = [TransactionController.toString(), "var TransactionHandler = TransactionController();\n", "connector.listen(TransactionHandler.processTransaction);\n", handleRejectAfterTransition.toString(), apiCall.toString()].join("\n");

  var theApiHash = Object.keys(PromisePipe.pipes).map(function (item) {
    return PromisePipe.pipes[item];
  }).reduce(oneChain, []);
  result += "\nreturn {" + theApiHash.join(",\n") + "}\n";

  return "function " + (apiName || 'initApi') + "(connector){\n" + result + "}";
}

function apiCall(id) {
  return function (data, context) {
    var message = {
      data: data,
      id: id
    };
    return TransactionHandler.createTransaction(message).send(connector.send).then(handleRejectAfterTransition);
  };
}

function handleRejectAfterTransition(message) {
  return new Promise(function (resolve, reject) {
    if (message.unhandledFail) return reject(message.data);
    resolve(message.data);
  });
}

function oneChain(result, item) {
  result.push(item.name + ": apiCall('" + item.id + "')");
  return result;
}

/**
//EXPOSING
PP({name: 'getItems', description: 'Get Items from collection'}).then().then();
PP({name: 'saveItems', description: 'Save Items from collection'}).then().then();

PP.api.provide(connector);


//USAGE
<script src="http://api.url.com/v0.1"></script>....
or
var mySerivceApi = PP.api.get(apiPath);

PP.use('api', mySerivceApi);

PP().api.getItems().then();
PP().api.saveItems().then();
*/

},{"./TransactionController":12}],12:[function(require,module,exports){
'use strict';

var Promise = Promise || require('es6-promise').Promise;
module.exports = function TransactionController() {
  var transactions = {};
  return {
    createTransaction: function createTransaction(message) {
      message._transactionId = Math.ceil(Math.random() * Math.pow(10, 16));

      return {
        send: function sendTransaction(handler) {
          return new Promise(function (resolve, reject) {
            //save transaction Resolvers
            transactions[message._transactionId] = {
              resolve: resolve
            };
            handler(message);
          });
        }
      };
    },
    processTransaction: function processTransaction(transactionMessage) {
      if (transactions[transactionMessage._transactionId]) {
        var id = transactionMessage._transactionId;
        delete transactionMessage._transactionId;
        transactions[id].resolve(transactionMessage);
        delete transactions[transactionMessage._transactionId];
        return true;
      }
      return false;
    }
  };
};

//createTransaction(message).send(messageSender).then(responseHandler);

},{"es6-promise":7}],"app":[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _router = require("./router");

var _adaptersHistoryApiAdapter = require("../../adapters/HistoryApiAdapter");

var _adaptersHistoryApiAdapter2 = _interopRequireDefault(_adaptersHistoryApiAdapter);

function mount(data) {
  document.getElementById('content').innerHTML = data;
}
var FrontendAdapter = (0, _adaptersHistoryApiAdapter2["default"])(mount);
_router.Router.use(FrontendAdapter);

document.getElementById('content').onclick = function (e) {
  e.preventDefault();
  e.stopPropagation();
  if (e.target.nodeType == 1 && e.target.href && e.target.href.indexOf(document.location.origin) == 0) {
    //is a link
    _router.Router.router.transitionTo(e.target.pathname);
  }
};

module.exports = function (state) {
  mount(FrontendAdapter.renderer(_router.Router.prepareRenderData(state)));
};

},{"../../adapters/HistoryApiAdapter":1,"./router":3}]},{},[]);
