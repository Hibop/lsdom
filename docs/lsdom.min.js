/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseDom = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _expressionParser = __webpack_require__(6);

var _bindNode = __webpack_require__(4);

var _component2 = __webpack_require__(2);

var _component3 = _interopRequireDefault(_component2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * traverse a dom, parse the attribute/text {expressions}
 */
var parseDom = exports.parseDom = function parseDom($dom, component, parentWatcher) {
    var hasForAttr = false;
    // if textNode then
    if ($dom.attributes) {
        Array.prototype.forEach.call($dom.attributes, function (attr) {
            var name = attr.nodeName;
            var str = attr.nodeValue;

            // for style, if it is object expression
            if (name === 'style') {
                if (str[0] === '{') {
                    var parsed = (0, _expressionParser.parse)(str);
                    if (typeof parsed.update === 'undefined') {
                        $dom.setStyle($dom, parsed);
                    } else {
                        (0, _bindNode.bindNode)($dom, 'style', component, parsed, {
                            parentWatcher: parentWatcher
                        });
                    }
                }
            } else if (name === 'for') {
                // add comment anchor
                var forAnchorStart = document.createComment('for');
                $dom.parentNode.insertBefore(forAnchorStart, $dom);

                var forAnchorEnd = document.createComment('end');
                if ($dom.nextSibling) {
                    $dom.parentNode.insertBefore(forAnchorEnd, $dom.nextSibling);
                } else {
                    $dom.parentNode.appendChild(forAnchorEnd);
                }

                var tmpl = $dom.parentNode.removeChild($dom);
                tmpl.removeAttribute('for');
                var match = /(.*)(\s+)in(\s+)(.*)/.exec(str);
                var itemExpression = match[1];
                var listExpression = match[4];

                var parseListExpression = (0, _expressionParser.parse)(listExpression);
                (0, _bindNode.bindNode)(forAnchorStart, 'for', component, parseListExpression, {
                    itemExpression: itemExpression,
                    forAnchorStart: forAnchorStart,
                    forAnchorEnd: forAnchorEnd,
                    tmpl: tmpl,
                    parentWatcher: parentWatcher
                });
                hasForAttr = true;
            } else if (['click', 'keypress'].includes(name)) {
                (function () {
                    var parsed = (0, _expressionParser.parse)(str);
                    // suppose event handler expression are all closure functions
                    $dom.addEventListener(name, function (e) {
                        parsed.update.call(component)(e);
                    }, false);
                })();
            } else if (name === 'model') {
                (function () {
                    var parsed = (0, _expressionParser.parse)(str);
                    $dom.addEventListener('input', function () {
                        // suppose only can set `scope.xxx` to model
                        component.scope[parsed.expression.replace('scope.', '')] = $dom.value;
                    });
                    (0, _bindNode.bindNode)($dom, 'value', component, parsed, { parentWatcher: parentWatcher });
                })();
            } else {
                var _parsed = (0, _expressionParser.parseInterpolation)(str);
                if ((typeof _parsed === 'undefined' ? 'undefined' : _typeof(_parsed)) !== 'object') {
                    $dom.setAttribute(name, _parsed);
                } else {
                    (0, _bindNode.bindNode)($dom, 'attr', component, _parsed, { parentWatcher: parentWatcher });
                }
            }
        });
    }

    // if it is text node
    if ($dom.nodeType === 3) {
        var text = $dom.nodeValue.trim();
        if (text.length) {
            var parsed = (0, _expressionParser.parseInterpolation)($dom.nodeValue);
            if ((typeof parsed === 'undefined' ? 'undefined' : _typeof(parsed)) !== 'object') {
                $dom.textContent = parsed;
            } else {
                (0, _bindNode.bindNode)($dom, 'text', component, parsed, { parentWatcher: parentWatcher });
            }
        }
    }

    // if there are custom directives
    if ($dom.nodeType === 1) {
        var _component = _component3.default.list[$dom.tagName.toLowerCase()];
        if (_component) {
            if (_component.tmpl) {
                $dom.innerHTML = _component.tmpl;
            }
        }
    }

    // only traverse childnodes when not under for
    if (!hasForAttr) {
        var nextComponent = component;
        // if there are custom directives
        if ($dom.nodeType === 1) {
            var nextComponentFactory = _component3.default.list[$dom.tagName.toLowerCase()];
            if (nextComponentFactory) {
                nextComponent = nextComponentFactory.create();
                if (nextComponent.tmpl) {
                    $dom.innerHTML = nextComponent.tmpl;
                }

                if (nextComponent.props) {
                    (function () {
                        // have to bridge props
                        var props = {};

                        nextComponent.props.forEach(function (key) {
                            Object.defineProperty(props, key, {
                                get: function get() {
                                    var val = component[$dom.getAttribute(key)];
                                    if (typeof val === 'function') {
                                        return val.bind(component);
                                    } else {
                                        return component[$dom.getAttribute(key)];
                                    }
                                },
                                set: function set(newValue) {
                                    console.error('direct modify parents\' data');
                                },

                                enumerable: true,
                                configurable: true });
                        });

                        nextComponent.props = props;
                        // if component is intermediate component, pass down the index
                        if (component.isIntermediate) {
                            nextComponent.__parent = component;
                        }
                    })();
                }
            }
        }

        var start = $dom.childNodes[0];
        while (start) {
            parseDom(start, nextComponent, parentWatcher);
            start = start.nextSibling;
        }
    }
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.unwatch = exports.bindWatcherOnSetter = exports.triggerWatcher = exports.Watchers = exports.setStyle = undefined;

var _diff = __webpack_require__(5);

/**
 * update style attribute of a node, by an obj
 */
var setStyle = exports.setStyle = function setStyle(node, styleObj) {
    Object.assign(node.style, styleObj);
};

/**
 * all watchers, to be dirty-checked every time
 */
var Watchers = exports.Watchers = {
    root: {},
    currentWatcherStack: []
};

/**
 * check watcher value change and update
 */
var triggerWatcher = exports.triggerWatcher = function triggerWatcher(watcher) {
    console.group('triggerWatcher', watcher.expression);
    var newV = watcher.val();
    if (watcher.isModel) {
        watcher.update(undefined, newV || '');
        watcher.oldV = newV;
    } else if (!watcher.isArray && 0 !== newV) {
        watcher.update(0, newV);
        watcher.oldV = newV;
    } else if (watcher.isArray) {
        var oldV = watcher.oldV || [];
        (0, _diff.diff)(oldV, newV).forEach(function (patch) {
            (patch[0] === 1 ? watcher.update.add : watcher.update.remove)(patch[1], patch[2], patch[3]);
        });
        watcher.oldV = newV.slice(0);
    }
    console.groupEnd();
};

/**
 * add setter watchers
 * @param {Watcher} watcher - watcher to bind
 * @param {Array} location - watchers array in setter
 */
var bindWatcherOnSetter = exports.bindWatcherOnSetter = function bindWatcherOnSetter(watcher, setterLocation) {
    watcher.locations = watcher.locations || new Set();
    if (!watcher.locations.has(setterLocation)) {
        watcher.locations.add(setterLocation);
    }

    if (!setterLocation.has(watcher)) {
        setterLocation.add(watcher);
    }
};

/**
 * remove setter watchers
 * @param {Watcher} watcher - watcher to bind
 */
var unwatch = exports.unwatch = function unwatch(watcher) {
    var list = watcher.parent.childs;
    list.splice(list.indexOf(watcher), 1);

    watcher.locations.forEach(function (loc) {
        loc.delete(watcher);
    });
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _domParser = __webpack_require__(0);

var _getterSetter = __webpack_require__(7);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * component class
 */
var Component = function () {
    function Component() {
        _classCallCheck(this, Component);
    }

    _createClass(Component, null, [{
        key: 'create',
        value: function create(name, options) {

            Component.list[name] = {
                create: function create() {
                    var instance = Object.create(options);
                    if (instance.scope) {
                        instance.scope = instance.scope();
                        (0, _getterSetter.defineGetterSetter)(instance.scope);
                    }
                    Component.instances.push(instance);
                    return instance;
                }
            };
            return options;
        }

        /**
         * render to a dom node
         * @param {String} name - component name
         * @param {DOMNode} target - target dom node
         */

    }, {
        key: 'render',
        value: function render(compnentName, target) {
            var component = Component.list[compnentName].create();
            target.innerHTML = component.tmpl;
            (0, _domParser.parseDom)(target, component);
        }
    }]);

    return Component;
}();

Component.instances = [];
Component.list = {};

exports.default = Component;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout() {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
})();
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch (e) {
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }
}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e) {
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
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
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
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
        runTimeout(drainQueue);
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

process.cwd = function () {
    return '/';
};
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function () {
    return 0;
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.bindNode = undefined;

var _watcher = __webpack_require__(1);

var _domParser = __webpack_require__(0);

/**
 * bind update function to a node & component
 * @param {Node} node - target node
 * @param {String} type - text, attr, style, for
 * @param {Object} component - component
 * @param {Object} parsed - parsed expression: expression & update
 * @param {extra} extra - any other info
 */
var bindNode = exports.bindNode = function bindNode(node, type, component, parsed, extra) {
    var parentWatcher = extra.parentWatcher || _watcher.Watchers.root;
    var closestArrayWatcher = extra.parentWatcher && extra.parentWatcher.isArray ? extra.parentWatcher : extra.closestArrayWatcher;
    var newWatcher = null;
    switch (type) {
        case 'text':
            newWatcher = {
                node: node,
                component: component,
                closestArrayWatcher: closestArrayWatcher,
                expression: parsed.expression,
                val: parsed.update.bind(component),
                update: function update(oldV, newV) {
                    this.node.textContent = newV;
                }
            };
            break;
        case 'attr':
            newWatcher = {
                node: node,
                component: component,
                closestArrayWatcher: closestArrayWatcher,
                expression: parsed.expression,
                val: parsed.update.bind(component),
                update: function update(oldV, newV) {
                    this.node.setAttribute(extra.name, newV);
                }
            };
            break;
        case 'style':
            newWatcher = {
                node: node,
                component: component,
                closestArrayWatcher: closestArrayWatcher,
                expression: parsed.expression,
                val: parsed.update.bind(component),
                update: function update(oldV, newV) {
                    (0, _watcher.setStyle)(this.node, newV);
                }
            };
            break;
        case 'value':
            newWatcher = {
                node: node,
                component: component,
                closestArrayWatcher: closestArrayWatcher,
                expression: parsed.expression,
                val: parsed.update.bind(component),
                update: function update(oldV, newV) {
                    this.node.value = newV;
                },

                isModel: true
            };
            break;
        case 'for':
            newWatcher = {
                expression: parsed.expression,
                closestArrayWatcher: closestArrayWatcher,
                isArray: true,
                component: component,
                val: parsed.update.bind(component),
                update: {
                    add: function add(arr, from, to) {
                        console.log('for:add ' + from + ' to ' + to);
                        var endAnchor = extra.forAnchorEnd;
                        var startAnchor = extra.forAnchorStart;
                        var parentNode = endAnchor.parentNode;
                        var tmpl = extra.tmpl;

                        var i = 0;
                        var start = startAnchor;
                        while (i <= to) {
                            if (i >= from) {
                                var newNode = tmpl.cloneNode('deep');
                                var intermediate = Object.create(component);
                                intermediate.__index = i;
                                Object.defineProperty(intermediate, 'item', {
                                    get: function get() {
                                        var result = parsed.update.call(component)[this.__index];
                                        return result;
                                    },
                                    set: function set(newValue) {
                                        console.error('direct modify parents\' data');
                                    },

                                    enumerable: true,
                                    configurable: true });
                                intermediate.isIntermediate = true;

                                (0, _domParser.parseDom)(newNode, intermediate, newWatcher);
                                parentNode.insertBefore(newNode, start.nextSibling || endAnchor);
                            }
                            start = start.nextSibling;
                            i++;
                        }
                    },

                    remove: function remove(arr, from, to) {
                        console.group('for:remove ' + from + ' to ' + to);
                        var endAnchor = extra.forAnchorEnd;
                        var parentNode = endAnchor.parentNode;
                        var i = from;
                        var target = endAnchor.parentNode.childNodes[i];
                        var total = newWatcher.childs.length;

                        // update child watchers
                        while (i < total - to + from - 1) {
                            console.log('set index', i + to - from + 1, 'to', i);
                            newWatcher.childs[i + to - from + 1].component.__parent.__index = i;
                            i++;
                        }

                        // delete dom & unwatch
                        i = arr.length;
                        var start = endAnchor;
                        while (i >= from - 1) {
                            if (i <= to - 1) {
                                console.log('remove dom', i);
                                parentNode.removeChild(start.nextSibling);
                                console.log('unwatch', i);
                                (0, _watcher.unwatch)(newWatcher.childs[i + 1]);
                            }
                            start = start.previousSibling;
                            i--;
                        }
                        console.groupEnd();
                    }
                }
            };
            break;
        default:
            break;
    }

    if (!parentWatcher.childs) {
        parentWatcher.childs = [];
    }

    newWatcher.parent = parentWatcher;
    parentWatcher.childs.push(newWatcher);

    // run watcher the first time
    _watcher.Watchers.currentWatcherStack.unshift(newWatcher);

    (0, _watcher.triggerWatcher)(newWatcher);

    _watcher.Watchers.currentWatcherStack.shift();
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.diff = undefined;

var _logger = __webpack_require__(8);

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * diff array
 * @param {Array} from
 * @param {Array} to
 * @return {Array} diff with [type, arr, start, end],
 *      type:1 -- add, type: -1 remove
 */
var diff = exports.diff = function diff(from, to) {
    _logger2.default.group('diff', from, to);
    var i = 0;
    var totalFrom = from.length;
    var j = 0;
    var totalTo = to.length;

    var result = [];

    while (i < totalFrom && j < totalTo) {
        if (from[i] === to[j]) {
            i++;
            j++;
        } else {
            var k = from.indexOf(to[j]);
            if (k > i) {
                result.push([-1, from, i, k - 1]);
                i = k + 1;
                j++;
            } else {
                var l = to.indexOf(from[i]);
                if (l > j) {
                    result.push([+1, to, j, l - 1]);
                    i++;
                    j = l + 1;
                } else {
                    break;
                }
            }
        }
    }

    if (i < totalFrom) {
        result.push([-1, from, i, totalFrom - 1]);
    }

    if (j < totalTo) {
        result.push([1, to, j, totalTo - 1]);
    }
    _logger2.default.groupEnd();
    return result;
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * parse an expression to function
 * @param {expression} expression - expression
 */
var parse = exports.parse = function parse(expression) {
    // [TODO] handle unchanged expressions
    return {
        expression: expression,
        update: new Function('', 'with(this){ return ' + expression + '}')
    };
};

/**
 * parse string with {expression}
 */
var parseInterpolation = exports.parseInterpolation = function parseInterpolation(str) {
    var i = 0;
    var j = 0;
    var segs = [];
    var hasInterpolation = false;

    while (j < str.length) {
        if (str[j] === '{') {
            hasInterpolation = true;
            if (j > i) {
                segs.push(str.slice(i, j));
            }
            i = j + 1;
        } else if (str[j] === '}') {
            if (j > i) {
                segs.push(parse(str.slice(i, j)));
            }
            i = j + 1;
        }
        j++;
    }

    if (j > i) {
        segs.push(str.slice(i, j));
    }

    if (hasInterpolation) {
        var keys = new Set();

        return {
            expression: segs.reduce(function (pre, curr) {
                if (typeof curr !== 'string') {
                    return pre + ' ' + curr.expression;
                }
                return pre + ' ' + curr;
            }, ''),

            update: function update() {
                var _this = this;

                return segs.reduce(function (pre, curr) {
                    if (typeof curr !== 'string') {
                        return pre + curr.update.call(_this);
                    }
                    return pre + curr;
                }, '');
            }
        };
    } else {
        return str;
    }
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defineGetterSetter = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _watcher = __webpack_require__(1);

//override Array.prototype.push
['push', 'pop', 'shift', 'unshift', 'splice'].forEach(function (method) {
    var originalMethod = Array.prototype[method];
    Array.prototype[method] = function () {
        if (this.__parent) {
            defineGetterSetter(arguments, this.__parent, this.__key);
            originalMethod.apply(this, arguments);
            // trigger watchers
            this.__parent[this.__key] = this;
        } else {
            originalMethod.apply(this, arguments);
        }
    };
});

// change all properties to getter/setter
var defineGetterSetter = exports.defineGetterSetter = function defineGetterSetter(data, __parent, __key) {
    var val = data;
    var type = typeof data === 'undefined' ? 'undefined' : _typeof(data);
    var watchersToBind = new Set();

    if (['object'].includes(type) && data !== null && !data.__isGetterSetter) {
        if (Array.isArray(data)) {
            data.forEach(function (item, i) {
                defineGetterSetter(item);
            });
        } else {
            Object.keys(data).forEach(function (key) {
                var val = data[key];
                Object.defineProperty(data, key, {
                    get: function get() {
                        if (_watcher.Watchers.currentWatcherStack.length) {
                            var currWatcher = _watcher.Watchers.currentWatcherStack[0];
                            var closestArrayWatcher = currWatcher.closestArrayWatcher;

                            // if data is array, then closestArrayWatcher must be the For
                            // and prevent gettersetter under For
                            if (Array.isArray(val) && closestArrayWatcher && closestArrayWatcher !== currWatcher) {} else {
                                console.log('bind ' + currWatcher.expression + ' to ' + key);
                                (0, _watcher.bindWatcherOnSetter)(currWatcher, watchersToBind);
                            }
                        }

                        return val;
                    },
                    set: function set(newV) {
                        // when setting new value, have to transform & pass __parent & __key
                        defineGetterSetter(newV, val.__parent, val.__key);
                        val = newV;
                        var iter = watchersToBind[Symbol.iterator]();
                        var watcher = null;
                        while (watcher = iter.next().value) {
                            (0, _watcher.triggerWatcher)(watcher);
                        }
                    },

                    enumerable: true,
                    configurable: true
                });

                if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && data !== null) {
                    defineGetterSetter(val, data, key);
                }
            });
        }

        if (__parent) {
            data.__parent = __parent;
            data.__key = __key;
        }

        Object.defineProperty(data, '__isGetterSetter', { value: true, writable: false, enumerable: false });
    }
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

Object.defineProperty(exports, "__esModule", {
    value: true
});
function noop() {}

var logger = console;
if (typeof process !== 'undefined') {
    logger = {
        group: noop,
        groupEnd: noop,
        log: noop
    };
}

exports.default = logger;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _component = __webpack_require__(2);

var _component2 = _interopRequireDefault(_component);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.LSDom = {
	Component: _component2.default
};

/***/ })
/******/ ]);