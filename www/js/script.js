(function() {
    (function() {
    if (!Array.prototype.map) {
    Array.prototype.map = function(func) {
    var len = (this.length - 0);
    if (typeof(func) != "function") throw new TypeError();
    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
    if (i in this) res[i] = func.call(thisp, this[i], i, this);
    }
    return res;
    };
    }
    if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(func) {
    var len = (this.length - 0);
    if (typeof(func) != "function") throw new TypeError();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
    if (i in this) func.call(thisp, this[i], i, this);
    }
    };
    }
    if (!Array.prototype.filter) {
    Array.prototype.filter = function(func) {
    var len = (this.length - 0);
    if (typeof(func) != "function") throw new TypeError();
    var res = new Array();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
    if (i in this) {
    var val = this[i];
    if (func.call(thisp, val, i, this)) res.push(val);
    }
    }
    return res;
    };
    }
    if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(o, l) {
    if (!(l = l - 0)) l = 0;
    l = (l < 0) ? Math.max(0, this.length + l) : l;
    for(var i = l; i < this.length; i++)
    if (this[i] == o) return i;
    return -1;
    }
    }
    if (!Array.prototype.every) {
    Array.prototype.every = function(f) {
    if (this === void 0 || this === null) throw new TypeError();
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof f !== 'function') throw new TypeError();
    var thisArg = arguments.length >= 2 ? arguments[1] : 0;
    for (var i = 0; i < len; i++) {
    if (i in t && !f.call(thisArg, t[i], i, t)) return false;
    }
    return true;
    };
    }
    if (!Array.prototype.some) {
    Array.prototype.some = function(fun ) {
    if (this == null) throw new TypeError();
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun != "function") throw new TypeError();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
    if (i in t && fun.call(thisp, t[i], i, t)) return true;
    }
    return false;
    };
    }
    if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(callback ) {
    if (this == null)
    throw new TypeError
    ('Array.prototype.reduce called on null or undefined');
    if (typeof(callback) !== 'function')
    throw new TypeError(callback + ' is not a function');
    var t = Object(this);
    var len = t.length >>> 0;
    var k = 0;
    var value;
    if (arguments.length == 2) {
    value = arguments[1];
    } else {
    while (k < len && !(k in t)) {
    k++;
    }
    if (k >= len) {
    throw new TypeError
    ('Reduce of empty array with no initial value');
    }
    value = t[k++];
    }
    for (; k < len; k++)
    if (k in t) value = callback(value, t[k], k, t);
    return value;
    };
    }
    function math_adjust(type, value, exp) {
    if (typeof exp === 'undefined' || +exp === 0)
    return Math[type](value);
    value = +value;
    exp = +exp;
    if (isNaN(value) ||
    !(typeof exp === 'number' && exp % 1 === 0)) return NaN;
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' +
    (value[1] ? (+value[1] - exp) : -exp)));
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }
    if (!Math.round10) {
    Math.round10 = function(value, exp) {
    return math_adjust('round', value, exp);
    };
    }
    if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
    return math_adjust('floor', value, exp);
    };
    }
    if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
    return math_adjust('ceil', value, exp);
    };
    }
    if (!Math.deg2rad) {
    Math.deg2rad = function(n) {
    return n * (Math.PI / 180);
    };
    }
    if (!Math.rad2deg) {
    Math.rad2deg = function(n) {
    return n * (180 / Math.PI);
    };
    }
    if (!Object.keys) {
    Object.keys = (function() {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
    hasDontEnumBug =
    !({ toString: null }).propertyIsEnumerable('toString'),
    dontEnums = [
    'toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'constructor'
    ],
    dontEnumsLength = dontEnums.length;
    return function(obj) {
    if (typeof obj !== 'object' &&
    (typeof obj !== 'function' || obj === null)) {
    throw new TypeError('Object.keys called on non-object');
    }
    var result = [], prop, i;
    for (prop in obj) {
    if (hasOwnProperty.call(obj, prop)) {
    result.push(prop);
    }
    }
    if (hasDontEnumBug) {
    for (i = 0; i < dontEnumsLength; i++) {
    if (hasOwnProperty.call(obj, dontEnums[i])) {
    result.push(dontEnums[i]);
    }
    }
    }
    return result;
    };
    }());
    }
    if (!String.prototype.trim) {
    String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
    };
    }
    if (!Event.prototype.preventDefault) {
    Event.prototype.preventDefault = function() {
    this.returnValue = false;
    };
    }
    if (!Event.prototype.stopPropagation) {
    Event.prototype.stopPropagation = function() {
    this.cancelBubble = true;
    };
    }
    })();
    (function() {
    if (window.console === undefined)
    window.console = {};
    if (window.console.log === undefined) {
    if (opera.postError)  {
    window.console.log = opera.postError;
    } else {
    window.console.log = function() {};
    }
    }
    [ 'dir', 'error', 'info', 'warn' ].forEach(function(k) {
    if (window.console[k] === undefined)
    window.console[k] = window.console.log;
    });
    [ 'group', 'groupEnd', 'time', 'timeEnd', 'trace' ].forEach(function(k) {
    if (window.console[k] === undefined)
    window.console[k] = function() {};
    });
    })();
    (function() {
    if (window.JSON &&
    window.JSON.stringify &&
    window.JSON.parse) return;
    window.JSON = {
    parse: function (s) { return eval('(' + s + ')'); },
    stringify: function (c) {
    if (c instanceof Object) {
    var o = '';
    if (c.constructor === Array) {
    for (var n = 0; n < c.length;
    o += this.stringify(c[n]) + ",", n++);
    return '[' + o.substr(0, o.length - 1) + ']';
    }
    if (c.toString !== Object.prototype.toString) {
    return '"' + c.toString().replace(/"/g, '\\$&') + '"';
    }
    for (var p in c) {
    o += '"'
    + p.replace(/"/g, '\\$&')
    + '":'
    + this.stringify(c[p]) + ',';
    }
    return '{' + o.substr(0, o.length - 1) + '}';
    }
    return typeof c === 'string' ?
    '"' + c.replace(/"/g, '\\$&') + '"' : String(c);
    }
    };
    })();
    function is_string(v) { return (typeof(v) == 'string'); }
    function is_num(v) { return (typeof(v) == 'number'); }
    function is_defined(v) { return (typeof(v) != 'undefined'); }
    function is_function(v) { return (typeof(v) == 'function'); }
    function is_element(v) { return (v && (v.setAttribute !== undefined)); }
    function is_array(v) {
    return ((v !== null) && (v !== undefined) &&
    (typeof(v) == 'object') &&
    (v.length !== undefined));
    }
    function is_object(v) {
    return ((v !== null) && (v !== undefined) &&
    (typeof(v) == 'object') &&
    (v.length === undefined));
    }
    function I(v) { return (v = (v - 0)) ? v : 0; }
    function S(v) { return (v ? ('' + v) : ''); }
    function translate(event) {
    if (window.event) {
    event = window.event;
    event.localTarget = event.srcElement;
    } else {
    event.localTarget = event.target;
    }
    if (!event.stopPropagation && event.cancelBubble)
    event.stopPropagation = event.cancelBubble;
    if (!event.preventDefault) {
    event.preventDefault = function() {
    event.returnValue = false;
    };
    }
    return event;
    }
    function el(v, tag, quiet) {
    if (v.setAttribute) { return v; }
    var e = document.getElementById(v);
    if (!e) {
    if (quiet !== true) {
    if (!tag) { tag = 'el'; }
    console.trace('el(' + v + ') not found (' + tag + ')');
    }
    return false;
    }
    return e;
    }
    function elq(v, tag) { return el(v, tag, true); }
    function byc(v, c) {
    var r, l;
    while(v) {
    if (v.firstChild && ((r = byc(v.firstChild, c)))) return r;
    if ((v.getAttribute != undefined) &&
    ((l = v.getAttribute('class')) ||
    (l = v.getAttribute('className'))) &&
    (l == c)) return v;
    v = v.nextSibling;
    }
    }
    function byt(v, c) {
    var r;
    c = c.toUpperCase();
    while(v) {
    if (v.firstChild && ((r = byt(v.firstChild, c)))) return r;
    if (v.nodeName == c) return v;
    v = v.nextSibling;
    }
    }
    function sh(e, neg) {
    if (!(e = el(e, 'sh'))) return false;
    if (neg) return hi(e);
    var changeto = 'block';
    switch(e.tagName.toLowerCase()) {
    case 'a':
    case 'span':
    case 'img':
    case 'input':
    changeto = '';
    break;
    case 'td':
    changeto = 'table-cell';
    if (window.IE && (window.IE < 8)) {
    changeto = 'block';
    }
    break;
    case 'tbody':
    case 'tr':
    changeto = 'table-row';
    if (window.IE && (window.IE < 8)) {
    changeto = 'block';
    }
    break;
    }
    if (e.style['display'] !== changeto)
    e.style['display'] = changeto;
    return e;
    }
    function hi(e, neg) {
    if (!(e = el(e, 'hi'))) return false;
    if (neg) return sh(e);
    if (e.style['display'].toLowerCase() != 'none')
    e.style['display'] = 'none';
    return e;
    }
    function iv(e) {
    if (!(e = el(e, 'iv'))) return false;
    if (e.style && e.style['display'] &&
    e.style['display'].toLowerCase() == 'none') return false;
    return true;
    }
    function vt(e) {
    return iv(e) ? hi(e) : sh(e);
    }
    function at(e, a, v) {
    if (!(e = el(e, 'at'))) return false;
    e.setAttribute(a, v);
    return e;
    }
    function ac(e, a) {
    if (!(e = el(e, 'ac'))) return false;
    e.removeAttribute(a);
    return e;
    }
    function cl(e, v) {
    if (!(e = el(e, 'cl'))) return false;
    return is_string(v) ?
    at(at(e, 'class', v), 'className', v) :
    ac(ac(e, 'class'), 'className');
    }
    function gc(e, v) {
    if (!(e = el(e, 'gc', v))) return false;
    var r = e.getAttribute('class');
    if (!r) r = e.getAttribute('className');
    return r ? r : '';
    }
    function gcq(e) { return gc(e, true); }
    function clt(e, v) { 
    if (!(e = el(e, 'clt'))) return false;
    return gc(e).match(new RegExp('\\b' + v + '\\b')) ? e : false;
    }
    function cls(e, v) { 
    if (!clt(e, v)) {
    var c = gc(e);
    return cl(e, c ? c + ' ' + v : v);
    }
    }
    function clr(e, v, n) { 
    if (!(e = el(e, 'clr'))) return false;
    return cl(e, gc(e).replace(new RegExp('\\b' + v + '\\b', 'g'), n).trim());
    }
    function clc(e, v) { 
    return clr(e, v, '');
    }
    function clx(e, v) { 
    if (clt(e, v)) clc(e,v);
    else cls(e, v);
    return el(e);
    }
    function st(e, v) {
    if (!(e = el(e, 'st'))) return false;
    while(e.firstChild) e.removeChild(e.firstChild);
    if (v) e.appendChild(tn(v));
    return e;
    }
    function gv(e) {
    if (!(e = el(e, 'gv'))) return false;
    return e.value.trim();
    }
    function sv(e, v) {
    if (!(e = el(e))) return false;
    e.value = v ? v : '';
    return e;
    }
    function tn(txt) {
    return document.createTextNode((txt ? ('' + txt) : ''));
    }
    function ct(tag) { return document.createElement(tag); }
    function rc(e) {
    e = el(e, 'rc');
    while(e.firstChild) e.removeChild(e.firstChild);
    return e;
    }
    function ci(type) {
    var e = ct('input');
    e.type = type;
    if (!is_function(e.focus)) 
    e.focus = onnull;
    if (!is_function(e.blur)) 
    e.blur = onnull;
    return e;
    }
    function offsetof(e) {
    e = el(e, 'offsetof');
    var l = 0;
    var t = 0;
    var w = e.offsetWidth;
    var h = e.offsetHeight;
    do {
    l += e.offsetLeft;
    t += e.offsetTop;
    } while((e = e.offsetParent));
    return {'l' : l, 't' : t, 'w' : w, 'h': h,
    'r' : l + w, 'b' : t + h};
    }
    function setpos(e, off) {
    e = el(e, 'setpos');
    if (off.l) e.style['left'] = off.l + 'px';
    if (off.t) e.style['top'] = off.t + 'px';
    if (off.w) e.style['width'] = off.w + 'px';
    else if (off.r) e.style['right'] = off.r + 'px';
    if (off.h) e.style['height'] = off.h + 'px';
    else if (off.b) e.style['bottom'] = off.b + 'px';
    return e;
    }
    function getcssrule(rule) {
    if (!document.styleSheets) return;
    for(var i = 0; i < document.styleSheets.length; i++) {
    try {
    var sheet = document.styleSheets[i].cssRules ?
    document.styleSheets[i].cssRules :
    document.styleSheets[i].rules;
    if (!sheet) continue;
    var length = (sheet.length - 0);
    for(var n = 0; n < length; n++) {
    if (sheet[n].selectorText == rule) return sheet[n];
    }
    } catch (ex) {
    }
    }
    }
    function getvportsize() {
    if (window.innerWidth) {
    return { 'w' : window.innerWidth, 'h' : window.innerHeight };
    } else if (document.documentElement.clientWidth) {
    return { 'w' : document.documentElement.clientWidth,
    'h' : document.documentElement.clientHeight }
    } else if (document.body.clientWidth) {
    return { 'w' : document.body.clientWidth,
    'h' : document.body.clientHeight }
    } else {
    alert('Broken browser: getvportsize()');
    }
    }
    function scrolloffset() {
    if (window.pageYOffset != undefined) {
    return { 'x' : window.pageXOffset, 'y' : window.pageYOffset };
    } else if (document.documentElement &&
    is_defined(document.documentElement.scrollTop)) {
    return { 'x' : document.documentElement.scrollLeft,
    'y' : document.documentElement.scrollTop };
    } else {
    return { 'x' : 0, 'y' : 0 };
    }
    }
    function documentheight() {
    var d = document;
    return Math.max
    (Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
    Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
    Math.max(d.body.clientHeight, d.documentElement.clientHeight));
    }
    if (document.all) {
    ci = function(type) {
    var e = ct('input');
    e.type = type;
    if ((e.type == 'text') || (e.type == 'password')) {
    e.onkeyup = function() {
    if (window.event.keyCode == 13)
    if (e.onchange != undefined)
    e.onchange(e);
    }
    }
    return e;
    }
    }
    function parentof(node, parent) {
    while(node) {
    if (node == parent) return true;
    node = node.parentNode;
    }
    }
    function pack(cont, cld, asfirst) {
    if (typeof(cld) == typeof("")) {
    cld = tn(cld);
    if (typeof(cont) == typeof("")) cont = ct(cont);
    if (asfirst === true) {
    cont.insertBefore(cld, cont.firstChild);
    } else {
    cont.appendChild(cld);
    }
    return cont;
    } else if (!cld) {
    console.trace('pack(): cld is null');
    }
    if (typeof(cont) == typeof("")) {
    cont = ct(cont);
    if (asfirst === true) {
    cont.insertBefore(cld, cont.firstChild);
    } else {
    cont.appendChild(cld);
    }
    return cont;
    } else {
    if (asfirst === true) {
    cont.insertBefore(cld, cont.firstChild);
    } else {
    cont.appendChild(cld);
    }
    return cld;
    }
    }
    function packp(cont, cld, asfirst) {
    pack(cont, cld, asfirst);
    return cont;
    }
    function packbefore(cont, cld) {
    if ((cont = el(cont)))
    cont.parentNode.insertBefore(cld, cont);
    return cld;
    }
    function unlink(e, n) {
    if ((e = el(e)) && (!is_element(n) || (e !== n)) && e.parentNode)
    e.parentNode.removeChild(e);
    return e;
    }
    function onnull() {}
    function ccl() {
    var f = arguments[0], a = Array.prototype.slice.call(arguments, 1);
    return function() {
    return f.apply(this, a.concat(Array.prototype.slice.call(arguments)));
    };
    };
    function ccl0(func) {
    return function(b1) { return func(b1); };
    }
    function ccl1(func, a1) {
    return function(b1) { return func(a1, b1); };
    }
    function ccl2(func, a1, a2) {
    return function(b1) { return func(a1, a2, b1); };
    }
    function ccl3(func, a1, a2, a3) {
    return function(b1) { return func(a1, a2, a3, b1); };
    }
    function ccl4(func, a1, a2, a3, a4) {
    return function(b1) { return func(a1, a2, a3, a4, b1); };
    }
    function ccl5(func, a1, a2, a3, a4, a5) {
    return function(b1) { return func(a1, a2, a3, a4, a5, b1); };
    }
    function ccl6(func, a1, a2, a3, a4, a5, a6) {
    return function(b1) { return func(a1, a2, a3, a4, a5, a6, b1); };
    }
    function suppress(elem, events, cb) {
    var skipped = {};
    if (is_string(events)) 
    events = [ events ];
    events.forEach(function(k) {
    if (elem[k]) {
    skipped[k] = elem[k];
    elem[k] = onnull;
    }
    });
    if (is_function(cb)) cb();
    events.forEach(function(k) {
    if (skipped[k])
    elem[k]= skipped[k];
    });
    }
    function strpad_left(str, chr, len) {
    str = '' + str;
    if (len > str.length)
    for(len = len - str.length; len > 0; len--)
    str = chr.charAt(0) + str;
    return str;
    }
    function strpad_right(str, chr, len) {
    str = '' + str;
    if (len > str.length)
    for(len = len - str.length; len > 0; len--)
    str += chr.charAt(0);
    return str;
    }
    function strftime(format, date) { 
    if (!date) {
    date = new Date();
    } else if (!date.getFullYear) {
    date = new Date(date * 1000);
    }
    var c, res = '';
    for(var i = 0; i < format.length; i++) {
    switch((c = format.charAt(i))) {
    case 'Y':
    res += strpad_left(date.getFullYear(), '0', 4);
    break;
    case 'm':
    res += strpad_left(date.getMonth() + 1, '0', 2);
    break;
    case 'd':
    res += strpad_left(date.getDate(), '0', 2);
    break;
    case 'H':
    res += strpad_left(date.getHours(), '0', 2);
    break;
    case 'i':
    res += strpad_left(date.getMinutes(), '0', 2);
    break;
    case 's':
    res += strpad_left(date.getSeconds(), '0', 2);
    break;
    default:
    res += c;
    }
    }
    return res;
    }
    function randomstring(templ, len) {
    for(var rv = '', tlen = (templ.length - 1), i = 0; i < len; i++)
    rv += templ[Math.round(Math.random() * tlen)];
    return rv;
    }
    function sp_utf8_encode(str) {
    var i, c, rv = '';
    for(i = 0; i < str.length; i++) {
    c = str.charCodeAt(i);
    if (c < 128) {
    rv += String.fromCharCode(c);
    } else if((c > 127) && (c < 2048)) {
    rv += String.fromCharCode((c >> 6) | 192);
    rv += String.fromCharCode((c & 63) | 128);
    } else {
    rv += String.fromCharCode((c >> 12) | 224);
    rv += String.fromCharCode(((c >> 6) & 63) | 128);
    rv += String.fromCharCode((c & 63) | 128);
    }
    }
    return rv;
    }
    function sp_utf8_decode(str) {
    var i, c0, c1, c2, rv = '';
    for(i = c0 = c1 = c2 = 0; i < str.length; ) {
    c0 = str.charCodeAt(i);
    if (c0 < 128) {
    rv += String.fromCharCode(c0);
    i++;
    } else if ((c0 > 191) && (c0 < 224)) {
    c1 = str.charCodeAt(i + 1);
    rv += String.fromCharCode(((c0 & 31) << 6) | (c1 & 63));
    i += 2;
    } else {
    c1 = str.charCodeAt(i + 1);
    c2 = str.charCodeAt(i + 2);
    rv += String.fromCharCode(((c & 15) << 12) |
    ((c1 & 63) << 6) | (c2 & 63));
    i += 3;
    }
    }
    return rv;
    }
    function sp_b64enc(str) {
    var o = '';
    var c1, c2, c3, e1, e2, e3, e4;
    var i = 0;
    var k = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk" +
    "lmnopqrstuvwxyz0123456789+/=";
    while (i < str.length) {
    c1 = str.charCodeAt(i++);
    c2 = str.charCodeAt(i++);
    c3 = str.charCodeAt(i++);
    e1 = c1 >> 2;
    e2 = ((c1 & 3) << 4) | (c2 >> 4);
    e3 = ((c2 & 15) << 2) | (c3 >> 6);
    e4 = c3 & 63;
    if (isNaN(c2)) {
    e3 = e4 = 64;
    } else if (isNaN(c3)) {
    e4 = 64;
    }
    o = o +
    k.charAt(e1) + k.charAt(e2) +
    k.charAt(e3) + k.charAt(e4);
    }
    return o;
    }
    function sp_b64dec(str) {
    var o = '';
    var c1, c2, c3, e2, e3, e4;
    var i = 0;
    var k = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk" +
    "lmnopqrstuvwxyz0123456789+/=";
    while (i < str.length) {
    e1 = k.indexOf(str.charAt(i++));
    e2 = k.indexOf(str.charAt(i++));
    e3 = k.indexOf(str.charAt(i++));
    e4 = k.indexOf(str.charAt(i++));
    c1 = (e1 << 2) | (e2 >> 4);
    c2 = ((e2 & 15) << 4) | (e3 >> 2);
    c3 = ((e3 & 3) << 6) | e4;
    o = o + String.fromCharCode(c1);
    if (e3 != 64) {
    o = o + String.fromCharCode(c2);
    }
    if (e4 != 64) {
    o = o + String.fromCharCode(c3);
    }
    }
    return o;
    }
    function sp_encode(arg) {
    return sp_b64enc(sp_utf8_encode(sp_jsonify(arg)));
    }
    function sp_decode(arg) {
    eval('var response = ' + sp_b64dec(arg));
    return response;
    }
    function sp_md5raw(s) {
    function RL(v, b) { return (v << b) | (v >>> (32-b)); }
    function AU(x, y) {
    var x4, y4, x8, y8, r;
    x8 = (x & 0x80000000);
    y8 = (y & 0x80000000);
    x4 = (x & 0x40000000);
    y4 = (y & 0x40000000);
    r = (x & 0x3fffffff) + (y & 0x3fffffff);
    if (x4 & y4) { return (r ^ 0x80000000 ^ x8 ^ y8); }
    if (x4 | y4) {
    if (r & 0x40000000) return (r ^ 0xC0000000 ^ x8 ^ y8);
    else return (r ^ 0x40000000 ^ x8 ^ y8);
    } else return (r ^ x8 ^ y8);
    };
    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }
    function FF(a, b, c, d, x, s, ac) {
    a = AU(a, AU(AU(F(b, c, d), x), ac));
    return AU(RL(a, s), b);
    };
    function GG(a, b, c, d, x, s, ac) {
    a = AU(a, AU(AU(G(b, c, d), x), ac));
    return AU(RL(a, s), b);
    };
    function HH(a, b, c, d, x, s, ac) {
    a = AU(a, AU(AU(H(b, c, d), x), ac));
    return AU(RL(a, s), b);
    };
    function II(a, b, c, d, x, s, ac) {
    a = AU(a, AU(AU(I(b, c, d), x), ac));
    return AU(RL(a, s), b);
    };
    function WA(string) {
    var wc, p = 0, c = 0;
    var ml = string.length;
    var nw = ((((ml + 8) - ((ml + 8) % 64)) / 64) + 1) * 16;
    var wa = Array(nw - 1);
    var p = 0;
    for(c = 0; c < ml; c++) {
    wc = (c - (c % 4)) / 4;
    p = (c % 4) * 8;
    wa[wc] = (wa[wc] | (string.charCodeAt(c)<<p));
    }
    wc = (c - (c % 4)) / 4;
    wa[wc] = wa[wc] | (0x80 << ((c % 4) * 8));
    wa[nw - 2] = ml << 3;
    wa[nw - 1] = ml >>> 29;
    return wa;
    };
    function WH(v) {
    function pad(i) {
    return (i < 16 ? '0' : '') + i.toString(16); }
    return pad(v & 0xff) +
    pad((v >> 8) & 0xff) +
    pad((v >> 16) & 0xff) +
    pad((v >> 24) & 0xff);
    }
    var x = Array();
    var k, AA, BB, CC, DD, a, b, c, d;
    var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
    var S21 = 5, S22 = 9 , S23 = 14, S24 = 20;
    var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
    var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
    s = WA(s);
    a = 0x67452301;
    b = 0xefcdab89;
    c = 0x98badcfe;
    d = 0x10325476;
    for (n = 0; n < s.length; n += 16) {
    AA=a; BB=b; CC=c; DD=d;
    a=FF(a, b, c, d, s[n + 0],  S11, 0xd76aa478);
    d=FF(d, a, b, c, s[n + 1],  S12, 0xe8c7b756);
    c=FF(c, d, a, b, s[n + 2],  S13, 0x242070db);
    b=FF(b, c, d, a, s[n + 3],  S14, 0xc1bdceee);
    a=FF(a, b, c, d, s[n + 4],  S11, 0xf57c0faf);
    d=FF(d, a, b, c, s[n + 5],  S12, 0x4787c62a);
    c=FF(c, d, a, b, s[n + 6],  S13, 0xa8304613);
    b=FF(b, c, d, a, s[n + 7],  S14, 0xfd469501);
    a=FF(a, b, c, d, s[n + 8],  S11, 0x698098d8);
    d=FF(d, a, b, c, s[n + 9],  S12, 0x8b44f7af);
    c=FF(c, d, a, b, s[n + 10], S13, 0xffff5bb1);
    b=FF(b, c, d, a, s[n + 11], S14, 0x895cd7be);
    a=FF(a, b, c, d, s[n + 12], S11, 0x6b901122);
    d=FF(d, a, b, c, s[n + 13], S12, 0xfd987193);
    c=FF(c, d, a, b, s[n + 14], S13, 0xa679438e);
    b=FF(b, c, d, a, s[n + 15], S14, 0x49b40821);
    a=GG(a, b, c, d, s[n + 1],  S21, 0xf61e2562);
    d=GG(d, a, b, c, s[n + 6],  S22, 0xc040b340);
    c=GG(c, d, a, b, s[n + 11], S23, 0x265e5a51);
    b=GG(b, c, d, a, s[n + 0],  S24, 0xe9b6c7aa);
    a=GG(a, b, c, d, s[n + 5],  S21, 0xd62f105d);
    d=GG(d, a, b, c, s[n + 10], S22, 0x2441453);
    c=GG(c, d, a, b, s[n + 15], S23, 0xd8a1e681);
    b=GG(b, c, d, a, s[n + 4],  S24, 0xe7d3fbc8);
    a=GG(a, b, c, d, s[n + 9],  S21, 0x21e1cde6);
    d=GG(d, a, b, c, s[n + 14], S22, 0xc33707d6);
    c=GG(c, d, a, b, s[n + 3],  S23, 0xf4d50d87);
    b=GG(b, c, d, a, s[n + 8],  S24, 0x455a14ed);
    a=GG(a, b, c, d, s[n + 13], S21, 0xa9e3e905);
    d=GG(d, a, b, c, s[n + 2],  S22, 0xfcefa3f8);
    c=GG(c, d, a, b, s[n + 7],  S23, 0x676f02d9);
    b=GG(b, c, d, a, s[n + 12], S24, 0x8d2a4c8a);
    a=HH(a, b, c, d, s[n + 5],  S31, 0xfffa3942);
    d=HH(d, a, b, c, s[n + 8],  S32, 0x8771f681);
    c=HH(c, d, a, b, s[n + 11], S33, 0x6d9d6122);
    b=HH(b, c, d, a, s[n + 14], S34, 0xfde5380c);
    a=HH(a, b, c, d, s[n + 1],  S31, 0xa4beea44);
    d=HH(d, a, b, c, s[n + 4],  S32, 0x4bdecfa9);
    c=HH(c, d, a, b, s[n + 7],  S33, 0xf6bb4b60);
    b=HH(b, c, d, a, s[n + 10], S34, 0xbebfbc70);
    a=HH(a, b, c, d, s[n + 13], S31, 0x289b7ec6);
    d=HH(d, a, b, c, s[n + 0],  S32, 0xeaa127fa);
    c=HH(c, d, a, b, s[n + 3],  S33, 0xd4ef3085);
    b=HH(b, c, d, a, s[n + 6],  S34, 0x4881d05);
    a=HH(a, b, c, d, s[n + 9],  S31, 0xd9d4d039);
    d=HH(d, a, b, c, s[n + 12], S32, 0xe6db99e5);
    c=HH(c, d, a, b, s[n + 15], S33, 0x1fa27cf8);
    b=HH(b, c, d, a, s[n + 2],  S34, 0xc4ac5665);
    a=II(a, b, c, d, s[n + 0],  S41, 0xf4292244);
    d=II(d, a, b, c, s[n + 7],  S42, 0x432aff97);
    c=II(c, d, a, b, s[n + 14], S43, 0xab9423a7);
    b=II(b, c, d, a, s[n + 5],  S44, 0xfc93a039);
    a=II(a, b, c, d, s[n + 12], S41, 0x655b59c3);
    d=II(d, a, b, c, s[n + 3],  S42, 0x8f0ccc92);
    c=II(c, d, a, b, s[n + 10], S43, 0xffeff47d);
    b=II(b, c, d, a, s[n + 1],  S44, 0x85845dd1);
    a=II(a, b, c, d, s[n + 8],  S41, 0x6fa87e4f);
    d=II(d, a, b, c, s[n + 15], S42, 0xfe2ce6e0);
    c=II(c, d, a, b, s[n + 6],  S43, 0xa3014314);
    b=II(b, c, d, a, s[n + 13], S44, 0x4e0811a1);
    a=II(a, b, c, d, s[n + 4],  S41, 0xf7537e82);
    d=II(d, a, b, c, s[n + 11], S42, 0xbd3af235);
    c=II(c, d, a, b, s[n + 2],  S43, 0x2ad7d2bb);
    b=II(b, c, d, a, s[n + 9],  S44, 0xeb86d391);
    a=AU(a, AA);
    b=AU(b, BB);
    c=AU(c, CC);
    d=AU(d, DD);
    }
    return (WH(a) + WH(b) + WH(c) + WH(d)).toLowerCase();
    }
    function sp_md5(s) {
    return sp_md5raw(sp_utf8_encode(s));
    }
    function sp_sha256raw(s) {
    function R(n, x) { return (x >>> n) | (x << (32-n)); }
    function Si0(x) { return R(2,  x) ^ R(13, x) ^ R(22, x); }
    function Si1(x) { return R(6,  x) ^ R(11, x) ^ R(25, x); }
    function si0(x) { return R(7,  x) ^ R(18, x) ^ (x>>>3); }
    function si1(x) { return R(17, x) ^ R(19, x) ^ (x>>>10); }
    function Ch(x, y, z)  { return (x & y) ^ (~x & z); }
    function Maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); }
    function HX(n) {
    var v, r = '';
    for (var i = 7; i >= 0; i--) {
    v = (n >>> (i * 4)) & 0xf;
    r += v.toString(16);
    }
    return r;
    };
    var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    s += String.fromCharCode(0x80);
    var l = (s.length / 4) + 2;
    var N = Math.ceil(l / 16);
    var M = new Array(N);
    for (var i = 0; i < N; i++) {
    M[i] = new Array(16);
    for (var j = 0; j < 16; j++) {
    M[i][j] =
    (s.charCodeAt(i*64+j*4)<<24) |
    (s.charCodeAt(i*64+j*4+1)<<16) |
    (s.charCodeAt(i*64+j*4+2)<<8) |
    (s.charCodeAt(i*64+j*4+3));
    }
    }
    M[N - 1][14] = ((s.length - 1)*8) / Math.pow(2, 32);
    M[N - 1][14] = Math.floor(M[N - 1][14]);
    M[N - 1][15] = ((s.length-1)*8) & 0xffffffff;
    var W = new Array(64);
    var a, b, c, d, e, f, g, h;
    for (var i = 0; i < N; i++) {
    for (var t = 0;  t < 16; t++) W[t] = M[i][t];
    for (var t = 16; t < 64; t++) W[t] =
    (si1(W[t-2]) + W[t-7] +
    si0(W[t-15]) + W[t-16]) & 0xffffffff;
    a = H[0]; b = H[1]; c = H[2]; d = H[3];
    e = H[4]; f = H[5]; g = H[6]; h = H[7];
    for (var t = 0; t < 64; t++) {
    var T1 = h + Si1(e) + Ch(e, f, g) + K[t] + W[t];
    var T2 = Si0(a) + Maj(a, b, c);
    h = g;
    g = f;
    f = e;
    e = (d + T1) & 0xffffffff;
    d = c;
    c = b;
    b = a;
    a = (T1 + T2) & 0xffffffff;
    }
    H[0] = (H[0] + a) & 0xffffffff;
    H[1] = (H[1] + b) & 0xffffffff;
    H[2] = (H[2] + c) & 0xffffffff;
    H[3] = (H[3] + d) & 0xffffffff;
    H[4] = (H[4] + e) & 0xffffffff;
    H[5] = (H[5] + f) & 0xffffffff;
    H[6] = (H[6] + g) & 0xffffffff;
    H[7] = (H[7] + h) & 0xffffffff;
    }
    return HX(H[0]) + HX(H[1]) + HX(H[2]) + HX(H[3]) +
    HX(H[4]) + HX(H[5]) + HX(H[6]) + HX(H[7]);
    }
    function sp_sha256(s) {
    return sp_sha256raw(sp_utf8_encode(s));
    }
    function sp_stag() {
    var rand =
    Math.random() + ':' +
    Math.random() + ':' +
    Math.random() + ':' +
    Math.random() + ':' +
    Math.random() + ':' +
    Math.random() + ':' +
    Math.random() + ':' +
    Math.random() + ':' +
    Math.random() + ':' +
    Math.random() + ':' +
    Math.random() + ':' +
    Math.random() + ':' +
    Math.random();
    return sp_sha256(rand);
    }
    function sp_mtag() {
    return sp_md5(sp_stag());
    }
    function sp_get(tag) {
    if (!sp_get.local) {
    sp_get.local = {};
    sp_get.guests = {};
    sp_get.local.listeners = {};
    }
    if (is_string(tag)) {
    if (!sp_get.guests[tag])
    sp_get.guests[tag] = {};
    return sp_get.guests[tag];
    } else {
    return sp_get.local;
    }
    }
    function sp_listen(type, listener) {
    var s = sp_get();
    if (!s.listeners[type]) s.listeners[type] = [];
    s.listeners[type].push(listener);
    return listener;
    }
    function sp_unlisten(type, listener) {
    alert('TODO: sp_unlisten');
    }
    function sp_dispatch(type, args) {
    var s = sp_get();
    var list = s.listeners[type];
    if (list) list.forEach(function(x) { x(type, args); });
    }
    function sp_env() {
    if (sp_env.env)
    return sp_env.env;
    var s = sp_get();
    var o = sp_env.env = {};
    [ 'relpath', 'scripturl', 'pageurl',
    'scripthost', 'script', 'pagepath', 'pagequery',
    'pagefrag' ].forEach(function(k) {
    o[k] = s[k];
    });
    o.pageparm = {};
    for(var n in s.pageparm)
    o.pageparm[n] = s.pageparm[n];
    return o;
    }
    function sp_self() {
    var s = sp_get();
    return s.script;
    }
    function sp_uilib_getbody() {
    if (!sp_uilib_getbody.body) {
    var body = document.getElementsByTagName('body');
    if (!body || !(body = body[0]))
    throw 'sp_uilib_getbody: No-Body (NEVER!)';
    sp_uilib_getbody.body = body;
    }
    return sp_uilib_getbody.body;
    }
    var sp_netio = function(url, content, func, withcred) {
    // paskaiewrapperi
    var req = new XMLHttpRequest();
    if (content) {
    req.open('POST', url, true);
    if (withcred) req.withCredentials = 'true';
    req.setRequestHeader('Content-Type',
    'application/x-www-form-urlencoded; ' +
    'charset=utf-8');
    } else {
    req.open('GET', url, true);
    if (withcred) req.withCredentials = 'true';
    }
    req.onreadystatechange = function() { func(req); };
    if (content) req.send(content);
    else req.send();
    }
    function sp_load_absolute(target, func) {
    function onreq(req) {
    if (req.readyState != 4)
    return; 
    if (req.status == 200) {
    var response;
    try {
    eval('response = ' + req.responseText);
    } catch (e) {
    console.error('sp_load: fail while parsing: %o', e);
    response = false;
    }
    if ((response) &&
    (response !== null) &&
    (response !== undefined)) {
    func(response, req);
    } else {
    func(false, req);
    }
    } else {
    func(null, req);
    }
    }
    return sp_netio(target, null, onreq, false);
    }
    function sp_call(target, parm, func, withcred) {
    var s = sp_get();
    withcred = (withcred === true) ? true : false;
    function onreq(req) {
    if (req.readyState != 4) return;
    if (req.status == 200) {
    var response;
    try {
    eval('response = ' + req.responseText);
    } catch (e) {
    console.error('sp_call: fail while parsing: %o: content %s',
    e, req.responseText);
    response = false;
    }
    if ((response) &&
    (response !== null) &&
    (response !== undefined)) {
    func(response, req);
    } else {
    func(false, req);
    }
    } else {
    func(null, req);
    }
    }
    var parm = 'json=' + encodeURIComponent(JSON.stringify(parm));
    if ((target.charAt(0) == '/') ||
    (target.match(/https?:\/\//))) {
    return sp_netio(target, parm, onreq, withcred);
    } else {
    return sp_netio(s.relpath + '/' + target, parm, onreq, withcred);
    }
    }
    function sp_load(target, func) {
    var s = sp_get();
    if (target.charAt(0) == '/') {
    return sp_load_absolute(target, func);
    } else {
    //return sp_load_absolute(s.relpath + '/' + target, func);
    return sp_load_absolute(target, func);
    }
    }
    function sp_load_css(url, pos) {
    var s = sp_get();
    if (!is_num(pos)) {
    pos = -1;
    }
    if (url.match(/^[a-z]+:\/\//) ||
    url.match(/^\//)) {
    } else {
    url = s.relpath + '/' + url;
    }
    if (document.createStyleSheet) {
    return document.createStyleSheet(url, pos);
    }
    var sheets = document.styleSheets;
    for(var i = 0; i < sheets.length; i++) {
    if (sheets[i].href == url) return;
    }
    var head = document.getElementsByTagName('head');
    if (!head) {
    var body = document.getElementsByTagName('body');
    body[0].parentNode.insertBefore((head = ct('head')), body[0]);
    } else {
    head = head[0];
    }
    var link = ct('link');
    var csses = [];
    var links = document.getElementsByTagName('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    for(var i = 0; i < links.length; i++) {
    if (links[i].rel && links[i].rel == 'stylesheet') {
    csses.push(links[i]);
    }
    }
    if ((pos >= 0) && (pos < csses.length) && csses[pos]) {
    head.insertBefore(link, csses[pos]);
    } else {
    pack(head, link);
    }
    }
    function sp_get_relpath(suffix) {
    var s = sp_get();
    if (is_string(suffix)) {
    return s.relpath + '/' + suffix;
    } else {
    return s.relpath;
    }
    }
    function sp_url(append) {
    if (!sp_url.prefix) {
    var self = sp_self();
    var href = ct('a');
    href.href = self.src;
    var prefix = '';
    if (href.username || href.password) {
    prefix += href.username;
    if (href.password)
    prefix += ':' + href.password;
    prefix += '@';
    }
    prefix = (href.protocol) ?
    (href.protocol.toLowerCase() + '//') : '//';
    if (href.host) prefix += href.host.toLowerCase();
    sp_url.prefix = prefix;
    }
    return sp_url.prefix + append;
    }
    function sp_url_normalize(url) {
    var a = ct('a');
    a.href = url;
    var href = '';
    href = (a.protocol) ? (a.protocol.toLowerCase() + '://') : '//';
    if (a.username || a.password) {
    href += a.username;
    if (a.password) href += ':' + a.password;
    href += '@';
    }
    if (a.host)	href += a.host.toLowerCase();
    href += a.pathname;
    href += a.search;
    href += a.hash;
    return url;
    }
    function sp_install_ieproxy(cb) {
    if (!window.XDomainRequest) {
    return cb();
    }
    var reqs = {};
    var reqserial = 1;
    var iframe = ct('iframe');
    function netio(url, content, func, withcred) {
    var message = {
    'type' : 'REQUEST',
    'serial' : 'req' + reqserial++,
    'url' : url,
    'content' : content,
    'withcred' : withcred
    };
    reqs[message.serial] = func;
    iframe.contentWindow.postMessage(JSON.stringify(message), '*');
    }
    function onmessage(event) {
    event = translate(event); 
    eval('var response = ' + event.data);
    if (false) { 
    console.log(event.data);
    console.dir(response);
    }
    if (response.type == 'RCALL') {
    response = response.response;
    var func = reqs[response.serial];
    delete(reqs[response.serial]);
    func(response);
    } else {
    throw "Invalid message: " + response.type;
    }
    }
    function onhandshake(event) {
    event = translate(event); 
    eval('var response = ' + event.data);
    if (response.type != 'HANDSHAKE') {
    throw "No handshake from proxy: " + response.type;
    } else {
    if (window.attachEvent) {
    window.detachEvent('onmessage', onhandshake);
    window.attachEvent('onmessage', onmessage);
    } else {
    window.onmessage = onmessage;
    }
    sp_netio = netio; 
    cb(); 
    }
    }
    if (window.attachEvent) {
    window.attachEvent('onmessage', onhandshake);
    } else {
    window.onmessage = onhandshake;
    }
    iframe.style.display = 'none';
    iframe.src = sp_get_relpath('ieproxy');
    var self = sp_self();
    self.parentNode.insertBefore(iframe, self);
    }
    (function() {
    (function() {
    window.IE = null;
    if (navigator.appName == 'Microsoft Internet Explorer') {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
    window.IE = parseFloat(RegExp.$1);
    }
    })();
    var s = sp_get();
    var script = document.getElementsByTagName('script');
    if (!script || (script.length < 1)) {
    throw 'BrokenBrowser(tm): No script';
    }
    s.script = script = script[script.length - 1];
    var href = ct('a');
    href.href = s.script.src;
    s.scripturl = s.script.src;
    s.scripthost = href.protocol + '//' + href.host;
    var path = href.pathname.split('/');
    if (!path[0].trim()) // IE-PASKAA
    path.shift(); 
    path.pop();
    path.pop();
    if (path.length) {
    s.relpath = s.scripthost + '/' + path.join('/');
    } else {
    s.relpath = s.scripthost;
    }
    href.href = s.pageurl = '' + window.location;
    s.pagehost = href.protocol + '//' + href.host;
    s.pagepath = href.pathname;
    s.pagequery = href.search;
    s.pagefrag = href.hash;
    s.pageparm = {};
    if (s.pagequery) {
    decodeURI(s.pagequery)
    .replace(/^\??/, '')
    .split('&')
    .forEach(function(k) {
    var pair = k.split('=');
    if (pair.length == 2) {
    s.pageparm[pair[0]] = pair[1];
    }
    });
    }
    })();
    function sp_genhook_localstorage(s, hooks, prefix) {
    if (!is_object(s))
    throw '1st-param-is-not-s';
    if (!is_string(prefix))
    prefix = '__v1_';
    function rekey(key) {
    if (!is_string(key))
    throw 'non-string key'
    return prefix + key;
    }
    function get(sge, key) {
    var val = sge.getItem(rekey(key));
    return is_string(val) ?
    JSON.parse(val) : undefined;
    }
    function set(sge, key, val) {
    return sge.setItem(rekey(key), JSON.stringify(val));
    }
    function del(sge, key) {
    var old = sge.getItem(rekey(key));
    sge.removeItem(rekey(key));
    return is_string(old) ?	JSON.parse(old) : false;
    }
    function keys(sge, prefix) {
    var keys = {}
    var rex = new RegExp('^' + (prefix = rekey(prefix)));
    for(var i = 0; i < sge.length; i++) {
    var key = sge.key(i);
    var val = sge.getItem(key);
    if (key.match(rex) !== null) {
    keys[key.replace(rex, '')] =
    is_string(val) ? JSON.parse(val) : undefined;
    }
    }
    return keys;
    }
    var lsge = window.localStorage;
    var ssge = window.sessionStorage;
    hooks.s_get = function(k) { return get(ssge, k); }
    hooks.s_del = function(k) { return del(ssge, k); }
    hooks.s_set = function(k,v) { return set(ssge, k,v); }
    hooks.s_keys = function(k) { return keys(ssge, k); }
    hooks.s_getd = function(k, d) {
    var rv = hooks.s_get(k);
    return (rv === undefined) ? d : k;
    };
    hooks.l_get = function(k) { return get(lsge, k); }
    hooks.l_getd = function(k, d) { return get(lsge, k, d); }
    hooks.l_del = function(k) { return del(lsge, k); }
    hooks.l_set = function(k,v) { return set(lsge, k,v); }
    hooks.l_keys = function(k) { return keys(lsge, k); }
    hooks.l_getd = function(k, d) {
    var rv = hooks.l_get(k);
    return (rv === undefined) ? d : k;
    };
    }
    function sp_google(cb) {
    function sendevent(e, v) {
    var eventstruct = {
    'event' : e,
    'value' : v
    };
    if (cb) return cb(eventstruct);
    }
    if (window.google) {
    sendevent('onload', window.google);
    } else {
    var timer = false;
    var script = ct('script');
    script.type = 'text/javascript';
    script.src = 'https://www.google.com/jsapi';
    function ontimer() {
    if (window.google) {
    window.clearInterval(timer);
    sendevent('onload', window.google);
    }
    }
    timer = window.setInterval(ontimer, 200);
    if (!sp_google.loading) {
    sp_google.loading = true; 
    var refscript = sp_self();
    refscript.parentNode.insertBefore(script, refscript);
    }
    }
    }
    function sp_google_maps(cb, opts) {
    function sendevent(e, v) {
    var eventstruct = {
    'event' : e,
    'value' : v
    };
    if (cb) return cb(eventstruct);
    }
    var timer = false;
    var arr = [];
    if (!is_object(opts)) opts = {};
    if (opts.apikey) arr.push('key=' + opts.apikey);
    if (opts.language) arr.push('language=' + opts.language);
    if (opts.libraries) {
    arr.push('libraries=' + opts.libraries);
    } else {
    arr.push('libraries=places,drawing,geometry');
    }
    if (opts.sensor) {
    arr.push('sensor=true');
    }
    var funcname = 'sp_google_maps_' + sp_stag();
    window[funcname] = function() {
    delete(window[funcname]);
    sendevent('onload', window.google);
    }
    arr.push('callback=' + funcname);
    var src = opts.nonssl ? 'http://' : 'https://';
    var script = ct('script');
    src += 'maps.googleapis.com/maps/api/js?';
    src += arr.join('&');
    script.type = 'text/javascript';
    script.src = src;
    (function() {
    var refscript = sp_self();
    refscript.parentNode.insertBefore(script, refscript);
    })();
    }
    function sp_openlayers(cb) {
    function sendevent(e, v) {
    var eventstruct = {
    'event' : e,
    'value' : v
    };
    if (cb) return cb(eventstruct);
    }
    if (window.ol) {
    console.log('already: %o', window.ol);
    sendevent('onload', window.ol);
    } else {
    var timer = false;
    var script = ct('script');
    var version = sendevent('onversion');
    if (!version) version = '2.12';
    script.type = 'text/javascript';
    script.src = sp_url('/ol3/ol.js');
    function ontimer() {
    if (window.ol) {
    window.clearInterval(timer);
    console.log('Todo: Openlayers');
    sendevent('onload', window.ol);
    }
    }
    timer = window.setInterval(ontimer, 200);
    if (!sp_openlayers.loading) {
    sp_openlayers.loading = true; 
    var refscript = sp_self();
    refscript.parentNode.insertBefore(script, refscript);
    }
    }
    }
    function sp_uihook_menu00(s, hooks, defaultcont) {
    if (!is_object(s) || !is_function(s.l))
    throw new '1st-param-is-not-s';
    if (!is_element(defaultcont))
    throw new '3rd-param-is-not-element';
    var __menumap = {};
    var __menutree = [];
    function recreate(cont) {
    function build(paths, item, node) {
    var entry = paths.shift();
    if (entry) {
    var title = 'menu_' + entry.replace(/[0-9]+[-_]/, '');
    var subnode = node[title];
    if (!subnode) {
    subnode = node[title] = {}
    subnode.s = item.s;
    }
    build(paths, item, subnode);
    node.isbranch = true;
    } else {
    node.callback = item.callback;
    node.classes = item.classes;
    }
    }
    __menutree = __menutree.sort(function(a, b) {
    if (a.path > b.path) return 1;
    if (a.path < b.path) return -1;
    return 0;
    });
    var __root = {};
    __menutree.forEach(function(k) {
    build(k.path.split('/'), k, __root);
    });
    function construct(parent, nodes, title, level) {
    for(var k in nodes) {
    if (!k.match(/menu_/))
    continue;
    var node = nodes[k];
    var title = pack(parent, ct('div'));
    var childs = pack(parent, ct('div'));
    pack(title, tn(node.s.l(k)));
    cl(title, 'menu-title menu-title' + level);
    if (node.classes) {
    cl(childs, node.classes);
    } else {
    cl(childs, 'menu-sub menu-sub' + level);
    }
    if (node.isbranch) {
    pack(parent, hi(childs));
    title.onclick = ccl(vt, childs, false);
    construct(childs, node, k, level + 1);
    } else {
    title.onclick = node.callback;
    }
    }
    }
    construct(rc(cont), __root, false, 0);
    __menutree = [];
    __menumap = {};
    }
    hooks.menu_clear = function() {
    __menutree = [];
    __menumap = {};
    };
    hooks.menu_add = function(cs, path, callback, classes) {
    var menuitem = __menumap[path];
    if (!menuitem) {
    menuitem = __menumap[path] = {};
    }
    menuitem.s = (cs && cs.l) ? cs : s;
    menuitem.path = path;
    menuitem.classes = classes;
    menuitem.callback = is_function(callback) ? callback : onnull;
    __menutree.push(menuitem);
    };
    hooks.menu_update = function(menucont) {
    if (!is_element(menucont))
    menucont = defaultcont;
    recreate(rc(menucont));
    };
    }
    function sp_uihook_notify00(s, hooks, status) {
    if (!is_object(s) || !is_function(s.l))
    throw new '1st-param-is-not-s';
    if (!is_element(status))
    throw new '2nd-param-is-not-element';
    var msgstack = [];
    var defmsg = s.l('notify_default');
    function redisplay() {
    rc(status);
    if (msgstack[0]) {
    pack(status, tn(msgstack[0]));
    } else {
    pack(status, tn(defmsg));
    }
    };
    function stack(msg) {
    if (false && msg.match(/^Localize:/))
    console.log('TODO-LOCALIZE: %s', msg);
    msgstack.unshift(msg);
    };
    function unstack(msg) {
    var success = 0;
    msgstack = msgstack.filter(function(k) {
    return (success |= (k != msg));
    });
    return success;
    };
    redisplay();
    hooks.notify_purge = function() {
    msgstack = [];
    redisplay();
    };
    hooks.notify_pop = function() {
    redisplay(msgstack.shift());
    };
    hooks.notify_unpush = function(msg) {
    return unstack(msg);
    };
    hooks.notify_push = function(s, msg, timeout) {
    if (is_string(s)) { 
    timeout = msg;
    msg = s;
    } else { 
    msg = s.l(msg);
    }
    redisplay(stack(msg));
    if (is_num(timeout)) {
    window.setTimeout(function() {
    redisplay(unstack(msg));
    }, timeout);
    }
    return msg;
    };
    hooks.notify_set = function(s, msg, timeout) {
    hooks.notify_purge();
    return hooks.notify_push(s, msg, timeout);
    };
    hooks.notify_target = function(elem) {
    hooks.notify_purge();
    status = is_element(elem) ? elem : ct('div');
    };
    }
    function sp_uihook_pane00(s, hooks, panecont) {
    if (!is_object(s) || !is_function(s.l))
    throw new '1st-param-is-not-s';
    if (!is_element(panecont))
    throw new '3rd-param-is-not-element';
    var __panestack = [];
    function sendevent(e, k, v) {
    if (is_function(k.callback)) {
    var eventstruct = {
    'event' : e,
    'pane' : k.pane,
    'value' : v
    };
    k.callback(eventstruct);
    }
    }
    function undisplay(entry) {
    if (entry.pane && entry.pane.parentNode)
    entry.pane.parentNode.removeChild(entry.pane);
    if (is_function(entry.callback))
    callback('onhide', entry);
    }
    function pane_push(pane, callback) {
    var prev = __panestack.pop();
    if (prev) { 
    undisplay(prev);
    __panestack.push(prev);
    }
    var entry = {
    'pane' : pane,
    'callback' : callback
    };
    if (entry.pane) {
    pack(panecont, entry.pane);
    sendevent('onshow', entry);
    __panestack.push(entry)
    }
    }
    function pane_pop(pane) {
    var prev = __panestack.pop();
    if (prev) {
    undisplay(prev);
    }
    var next = __panestack.pop();
    if (next) {
    if (next.pane) pack(panecont, next.pane); 
    __panestack.push(next);
    }
    }
    function pane_set(pane, callback) {
    var entry;
    while((entry = __panestack.pop())) {
    undisplay(entry);
    }
    pane_push(pane, callback);
    }
    hooks.pane_pop = pane_pop;
    hooks.pane_push = pane_push;
    hooks.pane_set = pane_set;
    }
    function sp_uihook_dialog00(s, hooks, prefix) {
    if (!is_object(s) || !is_function(s.l))
    throw new '1st-param-is-not-s';
    if (!is_string(prefix))
    prefix = 'isp_uihooks_dialog_';
    var __COMMON_FAULT_HEADER = s.l('fault_header');
    var __COMMON_FAULT_CLOSE  = s.l('fault_close');
    var __flag_display_fault_backtrace = true;
    var o = {};
    var template = [ 
    'modalframe, div, ui-modalframe',
    'modaldialog, div, ui-modaldialog',
    'dialog, div, dialog-pane',
    'header, div, dialog-header',
    'content, div, dialog-content',
    '!title, div',
    '!close, span',
    '!fault, div',
    'fault_error, div',
    'fault_backtrace, div',
    'fault_trace, pre',
    '+fault_close, submit'
    ];
    sp_util_construct(prefix, o, template, {});
    with(o) {
    pack(hi(modalframe), modaldialog);
    hi(dialog);
    pack(fault_backtrace, fault_trace);
    pack(fault, fault_error);
    pack(fault, fault_backtrace);
    pack(fault, fault_close);
    pack(close, tn('\u2716'));
    pack(header, close);
    pack(header, title);
    pack(dialog, header);
    pack(dialog, content);
    }
    modalframe = cl(ct('div'), 'ui-modalframe');
    modaldialog = pack(modalframe, cl(ct('div'), 'ui-modalframe'));
    with(modalframe.style) {
    position = 'fixed';
    left = '0px';
    right = '0px';
    top = '0px',
    width = '100%';
    heigth = '100%';
    overflow = 'auto';
    backgroundColor = 'rgb(0, 0, 0)';
    backgroundColor = 'rgba(0, 0, 0, 0.2)';
    }
    hooks.ui_modal_show = function(div) {
    if (o.modalframe.parentNode)
    history.go(-1);
    pack(rc(o.modaldialog), div);
    if (!o.modalframe.parentNode)
    pack(document.body, sh(o.modalframe));
    };
    hooks.ui_modal_clear = function() {
    if (o.modalframe.parentNode)
    o.modalframe.parentNode.removeChild(o.modalframe);
    rc(o.modaldialog);
    };
    o.modalframe.onclick = function() {
    history.go(-1);
    };
    o.dialog.onclick = function(e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
    };
    o.fault_close.onclick =
    o.close.onclick = function() {
    history.go(-1);
    };
    hooks.dialog_clear = function() {
    history.go(-1);
    };
    hooks.dialog_isvisible = function(elem) {
    return (elem && (elem.parentNode == o.content));
    };
    hooks.dialog_show = function(title, content, callback) {
    if (is_string(content))
    content = pack('div', tn(content));
    pack(rc(o.title), tn(title));
    pack(rc(o.content), content);
    hooks.ui_modal_show(sh(o.dialog));
    var oldpopstate = window.onpopstate;
    window.onpopstate = function() {
    hooks.ui_modal_clear();
    rc(o.content);
    hi(o.dialog);
    window.onpopstate = oldpopstate;
    if (is_function(callback)) {
    callback();
    }
    };
    history.pushState(true, '', '');
    };
    hooks.dialog_fault = function(s, prefix, resp, callback) {
    if (!resp || !resp.errno)
    throw 'non-resp-with-error';
    rc(o.fault_error);
    rc(o.fault_trace);
    if (!is_function(callback))
    callback = onnull;
    var header = s.ee(prefix + resp.tag.toLowerCase() + '_header') ||
    s.ee(prefix + resp.errno.toLowerCase() + '_header') ||
    s.ee(prefix + '_header') ||
    __COMMON_FAULT_HEADER;
    var content = s.ee(prefix + resp.tag.toLowerCase() + '_content') ||
    s.ee(prefix + resp.errno.toLowerCase() + '_content');
    if (!content) {
    content = packp(ct('div'), s.e(prefix + '_content'));
    pack(content,
    packp(ct('div'), tn(resp.errno +
    ' (' + resp.tag + ')')))
    .style.marginTop = '3mm';
    } else {
    content = packp(ct('div'), tn(content));
    }
    pack(o.fault_error, content);
    if (__flag_display_fault_backtrace && resp.backtrace) {
    var pre = '';
    for(var i = 0; i < resp.backtrace.length; i++) {
    if (i > 2) break;
    pre += resp.backtrace[i].file + ':' +
    resp.backtrace[i].line + ':' +
    resp.backtrace[i]['function'] + "\n";
    }
    pack(sh(o.fault_trace), tn(pre));
    } else {
    hi(o.fault_trace);
    }
    return hooks.dialog_show(header, o.fault, callback);
    }
    hooks.dialog_fatal = function(title, message) {
    };
    hooks.dialog_waiting = function(title, message) {
    };
    }
    function sp_uihook_misc00(s, hooks) {
    function endis(o, state) {
    if (!is_object(o))
    return;
    for(var k in o) {
    try {
    var e = o[k];
    if (!is_element(e)) continue;
    switch(e.tagName) {
    case 'INPUT':
    case 'TEXTAREA':
    case 'SELECT':
    e.disabled = !!state;
    break;
    }
    } catch (ex) {  }
    }
    }
    hooks.ui_endis = endis;
    }
    function sp_util_initlocalize(pfx, lang, s) {
    if (!s) s = sp_get(pfx);
    var l = lang[1];
    s.lang = lang[1];
    s.errors = l[pfx].errors;
    s.prefix = pfx;
    function geterror(prefix, path, def, xtra, empty) {
    path = prefix + path;
    if (!empty) def = def ? def : 'Localize: ' + path;
    return l.s(path, def, xtra);
    }
    s.l = function(path, def, xtra) {
    return geterror(pfx + '.texts.', path, def, xtra);
    };
    s.le = function (path, xtra) {
    return geterror(pfx + '.texts.', path, false, xtra, true);
    };
    s.e = function(path, def, xtra) {
    if (is_object(path) && (path.error)) path = path.error;
    return geterror(pfx + '.errors.', path, def, xtra);
    };
    s.ee = function(path, def, xtra) {
    if (is_object(path) && (path.error)) path = path.error;
    return geterror(pfx + '.errors.', path, def, xtra, true);
    };
    return s;
    }
    function sp_util_staticlocalize(pfx, lang, s) {
    if (!s) s = sp_get(pfx);
    if (s.lang && is_function(s.lang.s)) {
    return;
    }
    lang = lang[1];
    s.lang = lang;
    s.errors = lang[pfx].errors;
    s.prefix = pfx;
    function gettext(o, path, def, xtra) {
    var pos, sub;
    if (typeof(o) == 'string') {
    return o; 
    } else if (typeof(o) == 'function') {
    } else if (typeof(o) != 'object') {
    return def;
    }
    if ((pos = path.indexOf('.')) < 0) {
    return gettext(o[path], '', def, xtra);
    } else {
    return gettext(o[path.substring(0, pos)],
    path.substring(pos + 1), def, xtra);
    }
    }
    function recurse(l, o, x) {
    if (!l || !o) return;
    if (is_string(l)) {
    if (!o.tagName) return;
    switch(o.tagName.toUpperCase()) {
    case 'INPUT':
    o.value = l;
    break;
    default:
    o.innerHTML = l;
    break;
    }
    } else if (is_function(l)) {
    } else if (is_object(l)) {
    for(var i in l) {
    recurse(l[i], o[i], (x ? x[i] : false));
    }
    }
    }
    lang.s = function(path, def, xtra) {
    return gettext(lang, path, def, xtra);
    }
    lang.r = recurse;
    function geterror(prefix, path, def, xtra, empty) {
    path = prefix + path;
    if (!empty) def = def ? def : 'Localize: ' + path;
    return lang.s(path, def, xtra);
    }
    s.l = function(path, def, xtra) {
    return geterror(pfx + '.texts.', path, def, xtra);
    };
    s.le = function (path, xtra) {
    return geterror(pfx + '.texts.', path, false, xtra, true);
    };
    s.e = function(path, def, xtra) {
    if (is_object(path) && (path.error)) path = path.error;
    return geterror(pfx + '.errors.', path, def, xtra);
    };
    s.ee = function(path, def, xtra) {
    if (is_object(path) && (path.error)) path = path.error;
    return geterror(pfx + '.errors.', path, def, xtra, true);
    };
    return s;
    }
    function sp_util_treequery(s, event, tag, call, parm) {
    function derror(err) {
    if (s && s.e) err = s.e(err);
    else err = 'Localize-err:' + err;
    return cl(pack('div', tn(err)), 'sperror');
    }
    function dnotify(err) {
    if (s && s.l) err = s.l(err);
    else err = 'Localize-txt:' + err;
    return cl(pack('div', tn(err)), 'spnotice');
    }
    function onresp(resp) {
    event.node.setwaiting(false);
    if (resp.error) {
    pack(rc(event.node), derror(resp.error));
    } else if (!resp.length) {
    event.node.relist([]); 
    } else {
    event.node.relist(resp);
    }
    }
    event.node.setwaiting(true);
    sp_call(call, [ parm ], onresp);
    }
    function sp_util_construct(p, o, a, x, z) {
    if (!is_object(x)) x = {};
    if (!is_string(z)) z = '';
    a.forEach(function(r) {
    r = r.split(/\s*,\s*/);
    var i = r[0].trim();
    var t = r[1].trim();
    var c = r[2];
    switch(t) {
    case 'submit':
    case 'password':
    case 'checkbox':
    case 'radio':
    case 'text':
    case 'file':
    case 'number':
    case 'tel':
    case 'hidden':
    case 'datetime-local':
    case 'date':
    case 'time':
    t = ci(t);
    break;
    default:
    t = ct(t);
    }
    if (c && (c = c.trim())) cl(t, c);
    var add_id = false;
    var add_extra = false;
    while(i) {
    if (i[0] == '!') add_id = true;
    else if (i[0] == '+') add_extra = true;
    else break;
    i = i.substring(1);
    }
    if (add_id) t.id = (p + i);
    if (add_extra) x[z + i] = t;
    o[i] = t;
    });
    }
    function sp_util_tablize(p, o, a, x, z) {
    if (!is_object(x)) x = {};
    if (!is_string(z)) z = '';
    var rows = [];
    var maxcols = 0;
    a.forEach(function(r) {
    r = r.split(/\s*,\s*/);
    var i = r[0].trim().split(/\s+/);
    var t = r[1].trim().split(/\s+/);
    var c = is_string(r[2]) ?
    r[2].trim().split(/\s+/) : [];
    if (t.length > maxcols) maxcols = t.length;
    while(c.length < t.length) c.push('');
    var row = { 'cells' : t, 'cellclasses' : c };
    if (i.length == 1) {
    row.trid = i[0];
    } else if (i.length > 1) {
    row.trid = i[0];
    row.trcls = i[1];
    }
    rows.push(row);
    });
    var table = ct('table');
    var tbody = pack(table, ct('tbody'));
    var add_id = false; 
    var add_extra = false;
    var add_as_div = false;
    var add_as_span = false;
    rows.forEach(function(r) { 
    var id = r.trid;
    var tr = pack(tbody, ct('tr'));
    add_id = add_extra = false; 
    while(id) { 
    if (id[0] == '!') add_id = true;
    else if (id[0] == '+') add_extra = true;
    else break;
    id = id.substring(1);
    }
    if (r.trcls) cl(tr, r.trcls);
    if (add_id) tr.id = (p + id);
    if (add_extra) x[z + id] = tr;
    o[id] = tr;
    for(var i = 0; i < r.cells.length; i++) { 
    var nm = r.cells[i];
    var td = pack(tr, ct('td'));
    add_id = add_extra =
    add_as_div = add_as_span = false; 
    if (r.cellclasses[i])
    cl(td, r.cellclasses[i]);
    while(nm) { 
    if (nm[0] == '!') add_id = true;
    else if (nm[0] == '+') add_extra = true;
    else if (nm[0] == ';') add_as_div = true;
    else if (nm[0] == ':') add_as_span = true;
    else if ((nm[0] >= '0') && nm[0] <= '9') {
    var colspan = 0;
    var rowspan = 0;
    do {
    colspan *= 10;
    colspan += I(nm[0]);
    nm = nm.substring(1);
    if (nm[0] >= '0' && nm[0] <= '9')
    continue;
    if (nm[0] == '.') {
    nm = nm.substring(1);
    while(nm) {
    if (nm[0] >= '0' && nm[0] <= '9') {
    rowspan *= 10;
    rowspan += I(nm[0]);
    } else break;
    nm = nm.substring(1);
    }
    }
    break; 
    } while(nm);
    if (colspan) at(td, 'colspan', colspan);
    if (rowspan) at(td, 'rowspan', rowspan);
    continue;
    } else break; 
    nm = nm.substring(1);
    }
    if (nm) {
    nm = id + nm;
    if (add_as_div && !add_as_span)
    td = pack(td, ct('div'));
    if (add_as_span && !add_as_div)
    td = pack(td, ct('span'));
    if (add_id) td.id = p + nm;
    if (add_extra) x[z + nm] = td;
    o[nm] = td;
    } else {
    console.log('sp_util_tablify: No nm (%o)', rows);
    }
    }
    });
    return table;
    }
    function sp_util_endis() {
    var args = [];
    for(var i = 0; i < arguments.length; i++)
    args.push(arguments[i]);
    function endis(state) {
    args.forEach(function(k) {
    if (is_element(k)) {
    if (k.disabled !== undefined)
    k.disabled = state;
    }
    });
    }
    return {
    'enable' : function() { endis(false); },
    'disable' : function() { endis(true); }
    };
    }
    function sp_util_hookinput(input, cb) {
    if (!input || !input.style)
    throw 'input-hook-target-not-element';
    if (!is_function(cb))
    throw new 'input-hook-callback-not-function';
    function sendevent(e, v) {
    var eventstruct = {
    'event' : e,
    'target' : input,
    'value' : v
    };
    return cb(eventstruct);
    }
    var __previous_value = false;
    input.onblur = function() {
    var val = gv(input);
    val = (val && (val !== __previous_value)) ? val : false;
    sendevent('onblur', val);
    };
    input.onfocus = function() {
    __previous_value = gv(input);
    sendevent('onfocus', false);
    };
    input.onkeyup = function(e) {
    e = translate(e);
    if (!sendevent('onkeyup', e.keyCode)) {
    switch(e.keyCode) {
    case 27: 
    sv(input, S(__previous_value));
    input.blur();
    break;
    case 13:
    if (!sendevent('onchange', gv(input))) {
    __previous_value = false;
    input.blur();
    }
    break;
    };
    };
    };
    }
    function sp_util_hookinput_change(input, callback) {
    sp_util_hookinput(input, function(event) {
    if (event.event == 'onchange')
    callback(event.value, event);
    });
    }
    function bus_lemap_base_bind_ui(s, hooks) {
    function ui_clear() {
    sp_dispatch('__UI_CLEAR', hooks);
    }
    function ui_handness_get() {
    switch(hooks.l_get('handness')) {
    case 'right-handed':
    return 'right-handed';
    default:
    return 'left-handed';
    }
    }
    function ui_handness_set(mode) {
    switch(mode) {
    case 'right-handed': break;
    default:
    mode = 'left-handed';
    }
    hooks.l_set('handness', mode);
    try {
    cl(document.body, mode);
    } catch (ex) {  }
    }
    try {
    cl(document.body, ui_handness_get());
    } catch (ex) {
    }
    hooks.ui_clear = ui_clear;
    hooks.ui_handness_get = ui_handness_get;
    hooks.ui_handness_set = ui_handness_set;
    }
    function bus_lemap_base_bind_persistence(s, hooks) {
    var __lines_enabled = false;
    var __favs_enabled = false;
    function lines_store() {
    if (is_object(__lines_enabled))
    hooks.l_set('lines_enabled', __lines_enabled);
    }
    function lines_load() {
    try {
    __lines_enabled = hooks.l_get('lines_enabled');
    } catch (ex) {  };
    if (!is_object(__lines_enabled))
    __lines_enabled = {};
    }
    function lines_setstate(line, state) {
    if (!is_string(line))
    throw 'assert-not-string';
    if (state) {
    __lines_enabled[line] = true;
    } else {
    delete __lines_enabled[line];
    }
    lines_store();
    hooks.lines_dispatch();
    }
    function favs_store() {
    if (is_object(__favs_enabled))
    hooks.l_set('favs_enabled', __favs_enabled);
    }
    function favs_load() {
    try {
    __favs_enabled = hooks.l_get('favs_enabled');
    } catch (ex) {  }
    if (!is_object(__favs_enabled))
    __favs_enabled = {};
    }
    function favs_setstate(stop, state) {
    if (!is_string(stop))
    throw 'assert-not-string';
    if (state) {
    __favs_enabled[stop] = true;
    } else {
    delete __favs_enabled[stop];
    }
    favs_store(); 
    }
    lines_load();
    favs_load();
    hooks.lines_setstate = lines_setstate;
    hooks.lines_isenabled = function(l) {
    return !!__lines_enabled[l]; };
    hooks.lines_reset = function() {
    lines_store((__lines_enabled = {})); };
    hooks.lines_active = function() {
    return __lines_enabled;
    };
    hooks.lines_dispatch = function() {
    sp_dispatch('__UPDATE_LINES_STATE', __lines_enabled);
    hooks.poller_dispatch();
    };
    hooks.favs_setstate = favs_setstate;
    hooks.favs_isenabled = function(l) {
    return !!__favs_enabled[l]; };
    hooks.favs_reset = function() {
    favs_store((__favs_enabled = {})); };
    hooks.favs_active = function() {
    return __favs_enabled;
    };
    }
    function bus_lemap_base_prepare(event, hooks) {
    var s = sp_get('bus_lemap_base');
    s.elements = {};
    sp_util_initlocalize('bus_lemap_base', hooks.get_lang(), s);
    sp_genhook_localstorage(s, hooks);
    bus_lemap_base_bind_ui(s, hooks);
    bus_lemap_base_bind_persistence(s, hooks);
    }
    sp_listen('__REGISTER', function(hooks) {
    sp_listen('__PREPARE', bus_lemap_base_prepare);
    });
    function bus_lemap_siri_bind_gtfs(event, hooks) {
    var s = sp_get('bus_lemap_siri');
    function gtfs_shape_bytrip(trip, callback) {
    function get_shape(shape) {
    hooks.gtfs_shape_load(shape, function(resp) {
    if (resp && resp.length) {
    callback(resp);
    } else {
    callback(null);
    }
    });
    }
    hooks.gtfs_trip_load(trip, function(resp) {
    if (resp && (resp = resp[0]) && resp.shape_id) {
    get_shape(resp.shape_id);
    } else {
    callback(null);
    }
    });
    }
    function gtfs_trip_load(trip, callback) {
    if (!trip || !is_string(trip))
    callback(false);
    hooks.gtfs_load_url('trips/trip/' + trip, function(resp) {
    if (resp) {
    return callback(resp);
    } else {
    callback(false);
    }
    });
    }
    function gtfs_stops_load(callback) {
    if (is_function(hooks.gtfs_stop_get))
    callback(hooks);
    hooks.gtfs_load_url('/stops', function(resp) {
    var __stops_list = [];
    if (resp) {
    for(var k in resp) {
    resp[k].stop_id = k;
    resp[k].stop_descr =
    '' + k + ' ' + resp[k].stop_name;
    __stops_list.push(resp[k]);
    }
    hooks.gtfs_stops_list = function() {
    return __stops_list;
    };
    hooks.gtfs_stops_map = function() {
    return resp;
    };
    hooks.gtfs_stops_get = function(k) {
    return resp[k];
    };
    callback(hooks);
    } else {
    throw 'todo-gtfs-load-stops-failed';
    }
    });
    }
    function gtfs_init(callback) {
    function bind_loadfunc(dataset) {
    var url = 'https://data.foli.fi' +
    dataset.gtfspath + '/' + dataset.latest;
    hooks.gtfs_load_url = function(dataset, callback) {
    sp_load_absolute(url + '/' + dataset, function(resp) {
    if (resp) {
    callback(resp);
    } else {
    throw 'todo-gtfs-load-url-failed';
    }
    });
    };
    callback(dataset);
    }
    var url = 'https://data.foli.fi/gtfs/';
    sp_load_absolute(url, function(resp) {
    if (resp.datasets) {
    bind_loadfunc(resp);
    } else {
    throw 'todo-gtfs-init-fault';
    }
    });
    }
    function gtfs_stoptimes_load(stop, callback) {
    if (!stop || !is_string(stop))
    callback(false);
    hooks.gtfs_load_url('stop_times/stop/' + stop, function(resp) {
    if (resp) {
    return callback(resp);
    } else {
    callback(false);
    }
    });
    };
    function gtfs_shape_load(shape, callback) {
    if (!shape || !is_string(shape))
    callback(false);
    hooks.gtfs_load_url('shapes/' + shape, function(resp) {
    if (resp) {
    return callback(resp);
    } else {
    callback(false);
    }
    });
    };
    hooks.gtfs_init = gtfs_init;
    hooks.gtfs_trip_load = gtfs_trip_load;
    hooks.gtfs_stops_load = gtfs_stops_load;
    hooks.gtfs_stoptimes_load = gtfs_stoptimes_load;
    hooks.gtfs_shape_load = gtfs_shape_load;
    hooks.gtfs_shape_bytrip = gtfs_shape_bytrip;
    }
    function bus_lemap_siri_bind_siri(s, hooks) {
    var __prefix = 'https://data.foli.fi/siri';
    function siri_stoptimes_load(stop, callback) {
    sp_load_absolute(__prefix + '/sm/' + stop, function(resp) {
    if (resp &&
    resp.sys &&
    resp.result) {
    callback(resp.result);
    } else {
    callback(null);
    }
    });
    }
    hooks.siri_stoptimes_load = siri_stoptimes_load;
    }
    function bus_lemap_siri_bind_poller(s, hooks) {
    var __vehicles = {};
    var __lines = [];
    var __lines_map = {};
    var __mutex = false;
    var __suspend = false;
    function poller_poll() {
    if (__mutex || __suspend)
    return;
    __mutex = true;
    sp_load_absolute('https://data.foli.fi/siri/vm', function(resp) {
    __mutex = false; 
    var servertime = 0;
    try {
    servertime = resp.servertime;
    if (!is_object((resp = resp.result.vehicles)))
    return;
    } catch (ex) {
    return;
    }
    __vehicles = resp;
    var lines_resort = false;
    for(var i in __vehicles) {
    var v = __vehicles[i];
    if (v.validuntiltime < servertime) {
    continue;
    }
    var lref = v.lineref;
    if (lref && !__lines_map[lref]) {
    __lines_map[lref] =
    lines_resort = true;
    }
    }
    if (lines_resort) {
    var tmp = Object.keys(__lines_map);
    tmp = tmp.sort(function(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
    });
    sp_dispatch('__UPDATE_LINES', (__lines = tmp));
    }
    sp_dispatch('__UPDATE_VEHICLES', __vehicles);
    });
    }
    function poller_vehicle_map() {
    return __vehicles;
    }
    function poller_vehicle_get(id) {
    if (__vehicles[id])
    return __vehicles[id];
    }
    function poller_dispatch() {
    if (is_object(__vehicles))
    sp_dispatch('__UPDATE_VEHICLES', __vehicles);
    }
    hooks.poller_poll = poller_poll;
    hooks.poller_dispatch = poller_dispatch;
    hooks.poller_vehicle_map = poller_vehicle_map;
    hooks.poller_vehicle_get = poller_vehicle_get;
    hooks.poller_suspend = function() {	__suspend = true; };
    hooks.poller_resume = function() { __suspend = false; };
    hooks.poller_lines_get = function() { return __lines; };
    }
    function bus_lemap_siri_prestage(event, hooks) {
    var s = sp_get('bus_lemap_siri');
    s.elements = {};
    bus_lemap_siri_bind_gtfs(s, hooks);
    bus_lemap_siri_bind_siri(s, hooks);
    bus_lemap_siri_bind_poller(s, hooks);
    sp_util_initlocalize('bus_lemap_siri', hooks.get_lang(), s);
    }
    function bus_lemap_siri_start(event, hooks) {
    hooks.poller_poll();
    window.setInterval(hooks.poller_poll, 2000);
    }
    sp_listen('__REGISTER', function(hooks) {
    sp_listen('__PRESTAGE', bus_lemap_siri_prestage);
    sp_listen('__START', bus_lemap_siri_start);
    });
    function bus_lemap_window_prepare_ui(s, hooks) {
    var __default_action = onnull;
    var __close_callback = onnull;
    var o = s.window = {};
    var template = [ 
    '!toggle, div, shadow',
    '!pane, div, shadow'
    ];
    sp_util_construct('ipane_', o, template, s.elements, 'pane');
    with(o) {
    hi(pane);
    packbefore(sp_self(), toggle);
    packbefore(sp_self(), pane);
    }
    function pane_display(pane, callback) {
    __close_callback =
    is_function(callback) ? callback : onnull;
    hooks.ui_clear();
    hooks.history_push(function() {
    hi(rc(o.pane));
    clc(o.toggle, 'open');
    __close_callback();
    });
    cls(o.toggle, 'open');
    pack(sh(o.pane), pane);
    }
    function pane_close() {
    if (o.pane.firstChild)
    hooks.history_revert();
    }
    function toggle_onclick() {
    if (o.pane.firstChild) {
    pane_close();
    } else if (is_function(__default_action)) {
    __default_action();
    } else {
    console.warn('no-default-pane');
    }
    }
    function reset_state() {
    }
    o.toggle.onclick = toggle_onclick;
    sp_listen('__UI_CLEAR', pane_close);
    hooks.pane_display = pane_display;
    hooks.pane_close = pane_close;
    hooks.pane_set_default_action = function(callback) {
    if (is_function(callback))
    __default_action = callback;
    };
    }
    function bus_lemap_window_prepare_timetable(s, hooks) {
    var o = s.timetable = {};
    var template = [ 
    '!pane, div',
    '+header, div, header',
    'table, table',
    'tbody, tbody'
    ];
    sp_util_construct('itimetable_', o, template, s.elements, 'timetable_');
    with(o) {
    pack(table, tbody);
    pack(pane, header);
    pack(pane, table);
    }
    function genrow(parent, row) {
    var tr = ct('tr');
    var num = pack(tr, ct('td'));
    var name = pack(tr, ct('td'));
    var time = pack(tr, ct('td'));
    var view = pack(tr, ct('td'));
    if (is_function(row.callback)) {
    cl(tr, 'clickable').onclick = function() {
    row.callback(row);
    };
    }
    pack(num, tn(row.num));
    pack(name, tn(row.name));
    pack(time, tn(strftime('H:i:s', row.time)));
    pack(parent, tr);
    }
    function layout(parent, rows) {
    var count = 10; 
    rows.forEach(function(k) {
    if (--count < 0) return; 
    genrow(parent, k);
    });
    }
    function timetable_display(ns, header, rows) {
    pack(rc(o.header), tn(header));
    layout(rc(o.tbody), rows);
    hooks.pane_display(o.pane);
    }
    hooks.timetable_display = timetable_display;
    }
    function bus_lemap_window_bind_color(s, hooks) {
    var __colorptr = 0;
    var __colors = [ 'green', 'blue', 'black', 'red' ];
    hooks.color_reset = function() {
    __colorptr = 0;
    };
    hooks.color_next = function() {
    __colorptr = ++__colorptr % __colors.length;
    return __colors[__colorptr];
    };
    }
    function bus_lemap_window_bind_svgtest(s, hooks) {
    var __svg_template = '<svg width="44" height="44">'
    + '<text x="50%" y="25px" text-anchor="middle"'
    + '   font-size="11px" font-family="Helvetica"'
    + '   fill="white" transform="translate(0,1)">ok</text>'
    + '</svg>';
    hooks.svg_isavailable = function() {
    return false;
    };
    try {
    if (SVGRect !== undefined) {
    var svg = ct('svg');
    svg.innerHTML = __svg_template;
    svg = svg.firstChild;
    if (svg.childNodes[0].textContent == 'ok') {
    hooks.svg_isavailable = function() {
    return true; 
    };
    }
    }
    } catch (ex) {
    console.warn('svgtest: %o', ex);
    }
    }
    function bus_lemap_window_bind_stopicon(s, hooks) {
    function __stopicon_static() {
    var img = ct('img');
    img.src = 'https://live.foli.fi/lemap/stopicon-gen';
    at(img, 'alt', '');
    at(img, 'border', '');
    return {
    'get_anchor' : function() { return [ 25, 32 ]; },
    'get_element' : function() { return img; }
    }
    }
    var __svg_template = '<svg width="28" height="34">'
    + '<circle cx="14" cy="14" r="13"'
    + '    stroke="black" fill="#dea200"'
    + '    stroke-width="2" />'
    + '<polygon points="14,33 26,18 2,18"'
    + '    stroke="black" fill="#dea200"'
    + '    stroke-width="2" />'
    + '<circle cx="14" cy="14" r="13"'
    + '    stroke="black" fill="#dea200"'
    + '    stroke-width="2" />'
    + '<circle cx="14" cy="14" r="10"'
    + '    stroke="white" fill="white"'
    + '    stroke-width="1" />'
    + '<rect x="8" y="9" rx="2" width="12" height="8"'
    + '    stroke="grey" fill="white"'
    + '    stroke-width="2" />'
    + '<rect x="10" y="16" width="3" height="4" fill="grey" />'
    + '<rect x="15" y="16" width="3" height="4" fill="grey" />'
    + '</svg>';
    function __stopicon_svg() {
    var svg = ct('div');
    svg.innerHTML = __svg_template;
    svg = svg.firstChild;
    return {
    'get_anchor' : function() { return [ 21, 37 ]; },
    'get_element' : function() { return svg; }
    }
    }
    if (hooks.svg_isavailable()) {
    hooks.stopicon_create = __stopicon_svg;
    } else {
    hooks.stopicon_create = __stopicon_static;
    }
    }
    function bus_lemap_window_bind_vehicleicon(s, hooks) {
    var __static_prefix = 'https://tsjl-icons.nanona.fi/';
    function __vehicleicon_static() {
    var img = ct('img');
    at(img, 'border', '0');
    at(img, 'alt', '');
    var text = '--';
    var degree = false;
    var cururl = false;
    function update() {
    var newurl = __static_prefix + text;
    if (is_num(degree)) {
    newurl += '/' + degree;
    }
    if (cururl !== newurl) { 
    img.src = (cururl = newurl);
    }
    }
    function get_element() { return img; }
    function set_text(t) {
    text = t;
    update();
    }
    function set_direction(d) {
    if (is_num(d)) {
    degree = d - (d % 5); 
    } else {
    degree = false;
    }
    update();
    }
    return {
    'get_element' : get_element,
    'set_text' : set_text,
    'set_direction' : set_direction
    };
    }
    var __svg_template = '<svg width="44" height="44">'
    + '<circle cx="22" cy="22" r="13"'
    + '   stroke="white" fill="blue"'
    + '   stroke-width="2" />'
    + '<polygon points="22,1 10,22 32,22" style="display: none"'
    + '   stroke="white" fill="blue"'
    + '   stroke-width="2"'
    + '   transform="rotate(0 22 22)" />'
    + '<circle cx="22" cy="22" r="12"'
    + '   fill="blue" />'
    + '<text x="50%" y="25px" text-anchor="middle"'
    + '   font-size="11px" font-family="Helvetica"'
    + '   fill="white" transform="translate(0,1)">--</text>'
    + '</svg>';
    function __vehicleicon_svg(txt, color) {
    var svg = ct('div');
    svg.innerHTML = __svg_template;
    svg = svg.firstChild;
    var circle1 = svg.childNodes[0];
    var polygon = svg.childNodes[1];
    var circle2 = svg.childNodes[2];
    var text = svg.childNodes[3];
    if (is_string(color)) {
    at(circle1, 'fill', color);
    at(circle2, 'fill', color);
    at(polygon, 'fill', color);
    }
    function get_element() { return svg; }
    function set_text(t) {
    text.textContent = t;
    }
    function set_direction(d) {
    if (is_num(d)) {
    polygon.style.display = 'inherit';
    at(polygon, 'transform', 'rotate(' + d + ' 22 22)');
    } else {
    polygon.style.display = 'none';
    }
    }
    return {
    'get_element' : get_element,
    'set_text' : set_text,
    'set_direction' : set_direction
    };
    }
    if (hooks.svg_isavailable()) {
    hooks.vehicleicon_create = __vehicleicon_svg;
    } else {
    hooks.vehicleicon_create = __vehicleicon_static;
    }
    }
    function bus_lemap_window_bind_staricon(s, hooks) {
    function __staricon_filled_static() {
    return false; 
    }
    function __staricon_unfilled_static() {
    return false; 
    }
    var __svg_template_filled = '<svg width="30" height="28">'
    + '<polygon transform="scale(0.7 0.7)" fill="#dea200"'
    + '         stroke="black" stroke-width="2"'
    + '         points="15,3  18,11 27,11 20,17'
    + '                 22,25 15,20 8,25  10,17'
    + '                 3,11  12,11" />'
    + '</svg>';
    var __svg_template_unfilled = '<svg width="30" height="28">'
    + '<polygon transform="scale(0.7 0.7)" fill="white"'
    + '         stroke="black" stroke-width="2"'
    + '         points="15,3  18,11 27,11 20,17'
    + '                 22,25 15,20 8,25  10,17'
    + '                 3,11  12,11" />'
    + '</svg>';
    function __staricon_filled_svg() {
    var svg = ct('div');
    svg.innerHTML = __svg_template_filled;
    svg = svg.firstChild;
    return svg;
    }
    function __staricon_unfilled_svg() {
    var svg = ct('div');
    svg.innerHTML = __svg_template_unfilled;
    svg = svg.firstChild;
    return svg;
    }
    if (hooks.svg_isavailable()) {
    hooks.staricon_filled  = __staricon_filled_svg;
    hooks.staricon_unfilled  = __staricon_unfilled_svg;
    } else {
    hooks.staricon_filled = __staricon_filled_static;
    hooks.staricon_unfilled  = __staricon_unfilled_svg;
    }
    }
    function bus_lemap_window_bind_history(s, hooks) {
    var __backtrace = [];
    function reset_initial() {
    hooks.ui_clear();
    hooks.map_defview();
    hooks.lines_dispatch();
    }
    function history_revert() {
    try {
    if (__backtrace.length < 1) {
    __backtrace.push(reset_initial);
    }
    var __backward = __backtrace.pop();
    if (is_function(__backward))
    __backward();
    } catch (ex) {  }
    }
    function onpopstate() {
    if (history.pushState) {
    history.pushState(true, '', '');
    }
    history_revert();
    }
    function history_pop() {
    return __backtrace.pop();
    }
    function history_push(callback) {
    if (is_function(callback)) {
    __backtrace.push(callback);
    return true;
    }
    }
    function history_purge() {
    __backtrace = [];
    }
    window.onpopstate = onpopstate;
    if (history.pushState) {
    history.pushState(true, '', '');
    }
    hooks.history_pop = history_pop;
    hooks.history_push = history_push;
    hooks.history_purge = history_purge;
    hooks.history_revert = history_revert;
    }
    function bus_lemap_window_prepare(event, hooks) {
    var s = sp_get('bus_lemap_window');
    s.elements = {};
    sp_util_initlocalize('bus_lemap_window', hooks.get_lang(), s);
    bus_lemap_window_prepare_ui(s, hooks);
    bus_lemap_window_prepare_timetable(s, hooks);
    bus_lemap_window_bind_color(s, hooks);
    bus_lemap_window_bind_svgtest(s, hooks);
    bus_lemap_window_bind_stopicon(s, hooks);
    bus_lemap_window_bind_vehicleicon(s, hooks);
    bus_lemap_window_bind_staricon(s, hooks);
    bus_lemap_window_bind_history(s, hooks);
    }
    function bus_lemap_window_localize(event, hooks) {
    var s = sp_get('bus_lemap_window');
    var lang = hooks.get_lang()[1];
    s.lang.r(lang.bus_lemap_window.fields, s.elements);
    }
    function bus_lemap_window_start(event, hooks) {
    var s = sp_get('bus_lemap_window');
    var toggle = s.window.toggle;
    function df(angle, base) {
    var scope = Math.round((0xff - base) * 0.6);
    var diff = Math.round((scope * Math.sin((angle * (Math.PI / 180)))));
    var rval = base + diff;
    return strpad_left(rval.toString(16), '0', 2);
    }
    var index = 0;
    var stage = 0;
    function ontick() {
    index++;
    var color = df(index, 0xde) + df(index, 0xa2) + df(index, 0x00);
    toggle.style.backgroundColor = '#' + color;
    if (index < 180) {
    window.setTimeout(ontick, 1);
    } else {
    index = 0;
    if (stage++ < 1)
    window.setTimeout(ontick, 100);
    }
    }
    var dont_hint = 
    !!hooks.l_get('handness') ||
    !!hooks.l_get('lines_enabled') ||
    !!hooks.l_get('favs_enabled');
    if (!dont_hint) {
    window.setTimeout(ontick, 800);
    }
    }
    sp_listen('__REGISTER', function() {
    sp_listen('__PREPARE', bus_lemap_window_prepare);
    sp_listen('__LOCALIZE', bus_lemap_window_localize);
    sp_listen('__START', bus_lemap_window_start);
    });
    function bus_lemap_map_prepare_map(s, hooks) {
    var o = s.map = {};
    var __turku = [ 60.4517, 22.278 ];
    var __copyright = 'Map data &copy; '
    + '<a href="http://openstreetmap.org">OpenStreetMap</a> '
    + 'contributors, <a href="http://creativecommons.org/'
    + 'licenses/by-sa/2.0/">CC-BY-SA</a>, '
    + '<a href="https://www.foli.fi/fi/saavutettavuusseloste">'
    + 'Saavutettavuusseloste</a>';
    var __map = L.map(el('imap'), {
    'center' : __turku,
    'zoom' : 12,
    'zoomControl' : false
    });
    var __tiles = L.tileLayer('https://cdn.digitransit.fi/map/v2/hsl-map'
    + '/{z}/{x}/{y}.png'
    + '?digitransit-subscription-key='
    + '8a5cd63ad7984f58bb8cdefc125489ff',
    {
    'tileSize' : 512,
    'zoomOffset' : -1,
    'attribution' : __copyright,
    'maxZoom' : 18
    });
    __tiles.addTo(__map);
    var __delay_timer = false;
    var __move_flying = false;
    function ondelay() {
    if (__delay_timer !== false)
    window.clearTimeout(__delay_timer);
    __delay_timer = window.setTimeout(function() {
    try {
    sp_dispatch('__MAP_MOVED', __move_flying);
    } catch (ex) { console.warn(ex); };
    __delay_timer = false;
    }, 100);
    }
    __map.on('moveend', ondelay);
    __map.doubleClickZoom.disable();
    __map.on('dblclick', function(e) {
    try {
    __map.flyTo([ e.latlng.lat, e.latlng.lng ], 16);
    } catch (ex) { console.log('dblclick-zoom: %o', ex); }
    });
    function map_get() {
    return __map;
    };
    function map_defpos() {
    return __turku;
    };
    function map_defview() {
    var center = __map.getCenter();
    var defpos = map_defpos();
    if ((__map.getZoom() == 12) &&
    (Math.abs((center.lat - defpos[0])) < 0.01) &&
    (Math.abs((center.lng - defpos[1])) < 0.01)) {
    hooks.ui_clear();
    hooks.lines_dispatch();
    } else {
    __map.flyTo(map_defpos(), 12);
    }
    }
    var __map_bounds =
    L.latLngBounds(L.latLng(60.8529, 23.0383),
    L.latLng(60.0360, 21.5442));
    function map_location_sane(arg1, arg2) {
    if (is_num(arg1))
    arg1 = L.latLng(arg1, arg2);
    return __map_bounds.contains(arg1);
    }
    function map_flyto(lat, lon, zoom) {
    if (!is_num(zoom))
    zoom = 16;
    __map.flyTo([ lat, lon ], zoom);
    };
    hooks.map_get = map_get;
    hooks.map_flyto = map_flyto;
    hooks.map_defpos = map_defpos;
    hooks.map_defview = map_defview;
    hooks.map_location_sane = map_location_sane;
    }
    function bus_lemap_map_prepare_zoom(s, hooks) {
    var o = s.actions = {};
    var template = [ 
    '!zoomin, div, map-zoom shadow',
    '!zoomout, div, map-zoom shadow',
    '!zoomhome, div, map-zoom shadow',
    '!zoomlocate, div, map-zoom shadow'
    ];
    sp_util_construct('imap_', o, template, s.elements, 'map_');
    var cont = sp_self();
    with(o) {
    packbefore(cont, zoomin);
    packbefore(cont, zoomout);
    packbefore(cont, zoomhome);
    if (navigator.geolocation)
    packbefore(cont, zoomlocate);
    }
    var __map = hooks.map_get();
    o.zoomin.onclick = function() { __map.zoomIn(); };
    o.zoomout.onclick = function() { __map.zoomOut(); };
    o.zoomhome.onclick = function() {
    hooks.map_defview();
    };
    o.zoomlocate.onclick = function() {
    hooks.location_panto();
    };
    var __zooms = [];
    for(var i = 0; i < 17; i++) {
    __zooms.push(getcssrule('.zoom-hide' + i));
    }
    __map.on('zoomend', function() { 
    var level = __map.getZoom();
    for(var i = 0; i < 17; i++) {
    if (!__zooms[i]) continue;
    __zooms[i].style.display =	(i < level) ? '' : 'none';
    }
    });
    }
    function bus_lemap_map_bind_draw(s, hooks) {
    function draw_shape(points, color) {
    if (!points || !points.length)
    return false;
    points = points.map(function(k) {
    return [ k.lat, k.lon ];
    });
    if (points.length) {
    if (!is_string(color)) color = 'blue';
    return L.polyline(points, {
    'color' : color,
    'opacity' : 0.6,
    'smoothFactor' : 2,
    'interactive' : false
    });
    }
    }
    hooks.map_draw_shape = draw_shape;
    }
    function bus_lemap_map_prepare(event, hooks) {
    var s = sp_get('bus_lemap_map');
    s.elements = {};
    sp_util_initlocalize('bus_lemap_map', hooks.get_lang(), s);
    bus_lemap_map_prepare_map(s, hooks);
    bus_lemap_map_prepare_zoom(s, hooks);
    bus_lemap_map_bind_draw(s, hooks);
    }
    function bus_lemap_map_localize(event, hooks) {
    var s = sp_get('bus_lemap_map');
    var lang = hooks.get_lang()[1];
    s.lang.r(lang.bus_lemap_map.fields, s.elements);
    }
    sp_listen('__REGISTER', function() {
    sp_listen('__PREPARE', bus_lemap_map_prepare);
    sp_listen('__LOCALIZE', bus_lemap_map_localize);
    });
    function bus_lemap_geolocate_bind_locate(s, hooks) {
    var __map = hooks.map_get();
    var __marker = false;
    var __radius = false;
    var __poller = false;
    var __following = false;
    var __displaystate = false;
    var __watchedposition = false;
    var locate_opts = {
    'enableHighAccuracy' : true,
    'timeout' : 10000,
    'maximumAge' : Infinity
    };
    __marker = L.marker(hooks.map_defpos(), {
    'icon' : L.icon({
    'iconUrl' : 'https://live.foli.fi/lemap/marker-icon',
    'iconSize' : [ 25, 41 ],
    'iconAnchor' : [ 12, 40 ],
    'shadowUrl' : 'https://live.foli.fi/lemap/marker-shadow',
    'shadowSize' : [ 41, 41 ]
    })
    });
    __radius = L.circle(hooks.map_defpos(), {
    'stroke' : 'black',
    'weight' : 2
    });
    function clean() {
    if (__marker) __marker.removeFrom(__map);
    if (__radius) __radius.removeFrom(__map);
    __displaystate = 0;
    }
    function reposition(pos) {
    if (!pos || !pos.coords)
    return;
    if (!hooks.map_location_sane(pos.coords.latitude,
    pos.coords.longitude)) {
    return hooks.notify_set(s.l('outofbounds'), 2000);
    }
    if (!__watchedposition) {
    hooks.notify_clear();
    }
    __watchedposition = pos;
    var location = L.latLng(pos.coords.latitude,
    pos.coords.longitude);
    __marker.setLatLng(location);
    __radius.setLatLng(location);
    __radius.setRadius(Math.round(pos.coords.accuracy / 2));
    if (__displaystate == 1) {
    hooks.notify_clear();
    __radius.addTo(__map);
    __marker.addTo(__map);
    __displaystate = 2;
    }
    if ((__displaystate == 2) && __following) {
    hooks.map_flyto(pos.coords.latitude,
    pos.coords.longitude);
    }
    }
    function onerror(err) {
    switch(err.code) {
    case 1:
    hooks.notify_set(s.l('noaccess'));
    break;
    case 2: 
    hooks.notify_set(s.l('noposition'));
    break;
    case 3: 
    hooks.notify_set(s.l('timeout'), 2000);
    break;
    default:
    hooks.notify_set(s.l('failed'), 1000);
    }
    }
    function location_panto() {
    clean();
    __following = true;
    if (!__poller) {
    __poller = navigator.geolocation
    .watchPosition(reposition, onerror, locate_opts);
    }
    if (!__displaystate)
    __displaystate = 1;
    if (__watchedposition) {
    reposition(__watchedposition);
    } else {
    hooks.notify_set(s.l('geolocating'));
    navigator.geolocation
    .getCurrentPosition(reposition, onerror, locate_opts);
    }
    };
    __map.on('movestart', function() {
    __following = false;
    });
    sp_listen('__UI_CLEAR', clean);
    hooks.location_panto = location_panto;
    }
    function bus_lemap_geolocate_prepare(event, hooks) {
    var s = sp_get('bus_lemap_geolocate');
    s.elements = {};
    sp_util_initlocalize('bus_lemap_geolocate', hooks.get_lang(), s);
    bus_lemap_geolocate_bind_locate(s, hooks);
    }
    function bus_lemap_geolocate_localize(event, hooks) {
    var s = sp_get('bus_lemap_geolocate');
    var lang = hooks.get_lang()[1];
    s.lang.r(lang.bus_lemap_geolocate.fields, s.elements);
    }
    sp_listen('__REGISTER', function() {
    sp_listen('__PREPARE', bus_lemap_geolocate_prepare);
    sp_listen('__LOCALIZE', bus_lemap_filter_localize);
    });
    function bus_lemap_vehicle_bind_helpers(s, hooks) {
    var __vehicles = {};
    var __marker_template = '<table>'
    + ' <tbody>'
    + '   <tr>'
    + '     <td class="c1">'
    + '     </td>'
    + '   </tr>'
    + '   <tr>'
    + '     <td class="c2 zoom-hide13">'
    + '       <div class="title"></div>'
    + '       <div class="stop"></div>'
    + '       <div class="time"></div>'
    + '     </td>'
    + '   </tr>'
    + ' </tbody>'
    + '</table>';
    function vehicles_add(vehicle) {
    if (!vehicle ||
    !vehicle.vehicleref ||
    !vehicle.latitude ||
    !vehicle.longitude) {
    throw 'map-add-data-invalid';
    }
    var map = hooks.map_get();
    var deg = 0;
    var line = '';
    var title = '';
    var time = '';
    var stop = '';
    var iconurl = ''
    var lat = vehicle.latitude;
    var lon = vehicle.longitude;
    var id = vehicle.vehicleref;
    if (__vehicles[id]) {
    return hooks.map_flyto(vehicle.latitude,
    vehicle.longitude);
    }
    var divicon = L.divIcon({
    'className' : 'bus-entry',
    'html' : __marker_template,
    'iconAnchor' : [ 50, 22 ]
    });
    var marker = L.marker([ lat, lon ], {
    'icon' : divicon,
    'zIndexOffset' : 200
    }).addTo(map);
    var enode = marker._icon;
    var eicon = byc(enode, 'c1');
    var etitle = byc(enode, 'title');
    var estop = byc(enode, 'stop');
    var etime = byc(enode, 'time');
    var image = (id == '180132_DISABLED') ?
    hooks.vehicleicon_create(id, 'red') :
    hooks.vehicleicon_create(id);
    pack(eicon, image.get_element());
    pack(etitle, tn(id));
    function update(v) {
    if (!v) throw 'map-update-data-missing';
    var c = {
    'lineref' : v.lineref,
    'stop' : v.next_stoppointname,
    'time' : v.next_expectedarrivaltime,
    'title' : v.destinationname,
    'latitude' : v.latitude,
    'longitude' : v.longitude
    };
    if (c.latitude && c.longitude) {
    var sumdiff =
    Math.abs(c.latitude - lat) +
    Math.abs(c.longitude - lon);
    if (sumdiff > 0.0004) {
    var slat = Math.deg2rad(lat);
    var slon = Math.deg2rad(lon);
    var elat = Math.deg2rad(v.latitude);
    var elon = Math.deg2rad(v.longitude);
    var dlon = elon - slon;
    var dp =
    Math.log(Math.tan((elat / 2) + (Math.PI / 4)) /
    Math.tan((slat / 2) + (Math.PI / 4)));
    if (Math.abs(dlon) > Math.PI) {
    if (dlon > 0) dlon = -((2 * Math.PI) - dlon);
    else dlon = (2 * Math.PI) + dlon;
    }
    c.deg = (Math.rad2deg(Math.atan2(dlon, dp)) + 360) % 360;
    c.deg = c.deg - (c.deg % 1);
    lat = c.latitude;
    lon = c.longitude;
    marker.setLatLng([ lat, lon ]);
    }
    } else {
    c.lineref = '??';
    c.destinationname = 'Ei sijaintia';
    }
    if (line !== c.lineref) {
    image.set_text((line = c.lineref));
    }
    if ((c.deg !== undefined) && (deg !== c.deg)) {
    image.set_direction((deg = c.deg));
    }
    if (title !== c.title) {
    title = c.title;
    pack(rc(etitle), tn('' + title));
    }
    if (stop !== c.stop) {
    stop = c.stop;
    pack(rc(estop), tn('' + stop));
    }
    if (time != c.time) {
    time = c.time;
    pack(rc(etime), tn(strftime('H:i:s', time)));
    }
    }
    function destroy() {
    marker.removeFrom(map);
    delete(__vehicles[id]);
    }
    image.get_element().onclick = function() {
    hooks.vehicles_select(id);
    };
    update(vehicle);
    return (__vehicles[id] = {
    'destroy' : destroy,
    'update' : update
    });
    }
    function vehicles_del(id) {
    var v = __vehicles[id];
    if (v) v.destroy();
    }
    function vehicles_update(vm) {
    for(var k in __vehicles) {
    try {
    __vehicles[k].update(vm[k]);
    } catch (e) { console.warn(e); }
    }
    }
    function vehicles_purge() {
    for(var k in __vehicles) {
    __vehicles[k].destroy();
    }
    }
    hooks.vehicles_add = vehicles_add;
    hooks.vehicles_del = vehicles_del;
    hooks.vehicles_purge = vehicles_purge;
    hooks.vehicles_update = vehicles_update;
    }
    function bus_lemap_vehicle_bind_filter(s, hooks) {
    var __filterfunc = onnull;
    var __filtersource = false;
    var __filtermap = {};
    var __filtercounter = 100;
    sp_listen('__UPDATE_VEHICLES', function(event, vms) {
    var vehicles = [];
    for(var k in vms) {
    if (__filterfunc(vms[k]))
    vehicles.push(k);
    }
    __filtercounter++;
    vehicles.forEach(function(k) {
    if (!__filtermap[k])
    hooks.vehicles_add(vms[k]);
    __filtermap[k] = __filtercounter;
    });
    __filtercounter -= 4;
    for(var k in __filtermap) {
    if (__filtermap[k] < __filtercounter - 4) {
    hooks.vehicles_del(k);
    delete(__filtermap[k]);
    }
    }
    __filtercounter += 4;
    });
    hooks.vehicles_filter_purge = function() {
    hooks.vehicles_purge();
    __filtermap = {};
    __filtercounter = 100;
    };
    hooks.vehicles_filter_set = function(source, func) {
    if (!is_function(func))
    throw 'param-is-not-function';
    if (source !== __filtersource) {
    hooks.vehicles_purge();
    source = __filtersource;
    }
    __filterfunc = func;
    };
    }
    function bus_lemap_vehicle_bind_lineview(s, hooks) {
    var __lines_active = {};
    function filter_lines(v) {
    try { return !!__lines_active[v.lineref]; }
    catch (ex) {  }
    }
    sp_listen('__UPDATE_LINES_STATE', function(event, lines) {
    __lines_active = lines;
    hooks.vehicles_filter_purge();
    });
    hooks.vehicles_lineview_enable = function() {
    hooks.vehicles_filter_set('lineview', filter_lines);
    };
    }
    function bus_lemap_vehicle_bind_vehicleselect(s, hooks) {
    var __shape = false;
    var __vehicle = false;
    var __map = hooks.map_get();
    function shapes_clear() {
    if (__shape) {
    __shape.removeFrom(__map);
    __shape = __vehicle = false;
    }
    }
    function vehicles_timetable(id) {
    hooks.ui_clear();
    var v = hooks.poller_vehicle_get(id);
    if (!v && v.lineref) return;
    var stops = [
    {
    'num' : v.next_stoppointref,
    'name' : v.next_stoppointname,
    'time' : v.next_expectedarrivaltime,
    'clickable' : true
    }
    ];
    if (v.onwardcalls) {
    v.onwardcalls.forEach(function(k) {
    stops.push({ 'num' : k.stoppointref,
    'name' : k.stoppointname,
    'time' : k.expectedarrivaltime,
    'clickable' : true });
    });
    }
    var header = v.lineref + ' ' + v.destinationname;
    hooks.timetable_display(s, header, stops);
    }
    function vehicles_select(id) {
    var reclicked = (__vehicle == id);
    hooks.ui_clear();
    var vehicle = hooks.poller_vehicle_get(id);
    if (!vehicle ||
    !vehicle.blockref ||
    !vehicle.next_stoppointref) {
    return console.warn('Vehicle not found: %o', id);
    }
    if (vehicle.latitude &&
    vehicle.longitude) {
    var zoom = (reclicked && (__map.getZoom() == 14)) ? 12 : 14;
    hooks.map_flyto(vehicle.latitude, vehicle.longitude, zoom);
    };
    function drawroute(points) {
    __shape = hooks.map_draw_shape(points);
    if (__shape) __shape.addTo(__map);
    __vehicle = id;
    }
    function get_next_stop(stop) {
    var seek = '_' + vehicle.blockref;
    hooks.gtfs_stoptimes_load(stop, function(resp) {
    if (!resp) return;
    var times = resp.filter(function(k) {
    try {
    return k.trip_id.indexOf(seek) > 0;
    } catch (ex) {};
    });
    if (times && (times = times[0]))
    hooks.gtfs_shape_bytrip(times.trip_id, drawroute);
    });
    }
    get_next_stop(vehicle.next_stoppointref);
    }
    sp_listen('__UI_CLEAR', shapes_clear);
    hooks.vehicles_select = vehicles_select;
    };
    function bus_lemap_vehicle_prepare(event, hooks) {
    var s = sp_get('bus_lemap_vehicle');
    s.elements = {};
    sp_util_initlocalize('bus_lemap_vehicle', hooks.get_lang(), s);
    bus_lemap_vehicle_bind_helpers(s, hooks);
    bus_lemap_vehicle_bind_lineview(s, hooks);
    bus_lemap_vehicle_bind_vehicleselect(s, hooks);
    bus_lemap_vehicle_bind_filter(s, hooks);
    function update(event, vms) {
    hooks.vehicles_update(vms);
    }
    sp_listen('__UPDATE_VEHICLES', update);
    }
    function bus_lemap_vehicle_localize(event, hooks) {
    var s = sp_get('bus_lemap_vehicle');
    var lang = hooks.get_lang()[1];
    s.lang.r(lang.bus_lemap_vehicle.fields, s.elements);
    }
    sp_listen('__REGISTER', function() {
    sp_listen('__PREPARE', bus_lemap_vehicle_prepare);
    sp_listen('__LOCALIZE', bus_lemap_vehicle_localize);
    });
    function bus_lemap_stop_bind_stops(s, hooks) {
    var __map = hooks.map_get();
    var __stops_map = {}; 
    var __stops_shapes = []; 
    var __stops_selected = ''; 
    var __stop_template = '<table>'
    + ' <tbody>'
    + '   <tr>'
    + '     <td class="c1">'
    + '     </td>'
    + '   </tr>'
    + '   <tr>'
    + '     <td class="c2 zoom-hide15">'
    + '       <div class="num"></div>'
    + '     </td>'
    + '   </tr>'
    + ' </tbody>'
    + '</table>';
    function stopmarker_add(stop) {
    var icon = hooks.stopicon_create();
    var divicon = L.divIcon({
    'className' : 'stop-entry',
    'html' : __stop_template,
    'iconAnchor' : icon.get_anchor()
    });
    var marker = L.marker([ stop.stop_lat, stop.stop_lon ], {
    'icon' : divicon,
    'zIndexOffset' : 100
    }).addTo(__map);
    var enode = marker._icon;
    var eicon = byc(enode, 'c1');
    var estop = byt(enode, 'div');
    var eimg = pack(eicon, icon.get_element());
    pack(estop, tn(stop.stop_id)); 
    eimg.onclick = estop.onclick = function() {
    hooks.stops_panto(stop);
    };
    return marker;
    }
    function shapes_clear() {
    __stops_shapes.forEach(function(s) {
    try {
    s.removeFrom(__map);
    } catch (ex) {
    console.warn('shapes_clear: %o', ex);
    }
    });
    __stops_shapes = [];
    __stops_selected = '';
    }
    var __colors = [ 'red', 'green', 'blue', 'black', 'brown',
    'cyan', 'magenta', 'yellow' ];
    function shapes_draw(displace, points) {
    var color = __colors[displace % __colors.length];
    displace /= 100000;
    points.forEach(function(k) {
    k.lat += displace;
    k.lon += displace;
    });
    var shape = hooks.map_draw_shape(points, color);
    if (shape) {
    shape.addTo(__map);
    }
    __stops_shapes.push(shape);
    }
    var __popup_template = '<tbody>'
    + '   <tr>'
    + '     <td class="c1" valign="top">'
    + '       <div class="id"></div>'
    + '     </td>'
    + '   </tr><tr>'
    + '     <td class="c2" valign="top">'
    + '       <div class="title"></div>'
    + '       <div class="timetable"></div>'
    + '       <div class="vehicles"></div>'
    + '     </td>'
    + '   </tr>'
    + ' </tbody>';
    function add_bookmarker(before, stopid) {
    var star = hooks.favs_isenabled(stopid) ?
    hooks.staricon_filled() : hooks.staricon_unfilled();
    if (!star) return; 
    var span = packbefore(before, pack('span', star));
    span.onclick = function() {
    if (hooks.favs_isenabled(stopid)) {
    hooks.favs_setstate(stopid, false);
    } else {
    hooks.favs_setstate(stopid, true);
    }
    pack(rc(span), hooks.favs_isenabled(stopid) ?
    hooks.staricon_filled() : hooks.staricon_unfilled());
    }
    }
    function stops_popup(stop) {
    var popup = cl(ct('table'), 'stop-popup');
    popup.innerHTML = __popup_template;
    var id = byc(popup, 'id');
    var title = byc(popup, 'title');
    var time = byc(popup, 'timetable');
    var lines = byc(popup, 'vehicles');
    add_bookmarker(id, stop.stop_id);
    pack(id, tn(stop.stop_id));
    pack(title, tn(stop.stop_name));
    pack(time, tn(s.l('stop_timetable_open')));
    time.onclick = function() {
    hooks.stoptimes_display(stop);
    };
    window.setTimeout(function() {
    L.popup({
    'closeButton' : false,
    'offset' : L.point(0, -30)
    }).setLatLng([stop.stop_lat, stop.stop_lon])
    .setContent(popup)
    .openOn(__map);
    }, 100);
    }
    function stops_panto(stop) {
    hooks.map_flyto(stop.stop_lat, stop.stop_lon);
    shapes_clear();
    stops_popup(stop);
    hooks.siri_stoptimes_load(stop.stop_id, function(resp) {
    if (!resp) return;
    var lines = {};
    resp.forEach(function(l) {
    if (l && l.lineref && l.blockref)
    lines[l.lineref] = l.blockref;
    });
    sp_dispatch('__UPDATE_LINES_STATE', lines);
    hooks.gtfs_stoptimes_load(stop.stop_id, function(resp) {
    if (!resp) return;
    var displace = 0;
    for(var k in lines) {
    var seek = lines[k];
    var times = resp.filter(function(l) {
    try {
    return l.trip_id.indexOf(seek) > 0;
    } catch (ex) { throw ex};
    });
    displace++;
    if (times && (times = times[0])) {
    hooks.gtfs_shape_bytrip(times.trip_id,
    ccl1(shapes_draw,
    displace));
    }
    }
    });
    });
    }
    function stops_draw() {
    if (!hooks.gtfs_stops_list) {
    return; 
    }
    var bounds = __map.getBounds();
    var stops = hooks.gtfs_stops_list();
    stops = stops.filter(function(k) {
    var latlng = L.latLng(k.stop_lat, k.stop_lon);
    if (__stops_map[k.stop_id]) {
    return false;
    }
    return bounds.contains(latlng);
    });
    stops.forEach(function(k) {
    __stops_map[k.stop_id] =
    stopmarker_add(k);
    });
    }
    function stops_clear() {
    for(var k in __stops_map) {
    try {
    __stops_map[k].removeFrom(__map);
    delete(__stops_map[k]);
    } catch (ex) { console.warn('stops_clear: %o', k); }
    }
    }
    function map_moved() {
    if (__map.getZoom() > 14) {
    stops_draw();
    } else {
    //__map.closePopup();
    stops_clear();
    }
    }
    var zoomcss = getcssrule('.stop-entry');
    __map.on('zoomstart', function() {
    if (zoomcss) zoomcss.style.display = 'none';
    });
    __map.on('zoomend', function() {
    if (zoomcss) {
    if (__map.getZoom() > 14)
    zoomcss.style.display = '';
    }
    });
    sp_listen('__MAP_MOVED', map_moved);
    sp_listen('__UI_CLEAR', function() {
    shapes_clear();
    __map.closePopup();
    });
    hooks.stops_panto = stops_panto;
    }
    function bus_lemap_stop_bind_stoptimes(s, hooks) {
    var __stop_id = false;
    function repoll(stop) {
    function onrowclick(vehicleid, row) {
    var vehicle = hooks.poller_vehicle_get(vehicleid);
    if (vehicle &&
    vehicle.latitude &&
    vehicle.longitude ) {
    hooks.pane_close();
    hooks.vehicles_select(vehicleid);
    } else {
    hooks.notify_set(s.e('vehicle_not_found'), 1000);
    }
    }
    hooks.notify_set(s.l('stop_querying_sm'), 4000);
    var url = 'https://data.foli.fi/siri/sm/' +  stop.stop_id;
    sp_load_absolute(url, function(resp) {
    if (__stop_id !== stop.stop_id) {
    return; 
    }
    hooks.notify_clear();
    if (resp && is_array(resp.result)) {
    var servertime = resp.servertime;
    var header =
    stop.stop_id + ' ' + stop.stop_name;
    resp = resp.result.map(function(k) {
    var rv = {
    'num' : k.lineref,
    'name' : k.destinationdisplay,
    'time' : k.expecteddeparturetime
    };
    if (k.latitude && k.longitude && k.vehicleref) {
    rv.callback = ccl1(onrowclick, k.vehicleref);
    };
    return rv;
    });
    resp = resp.filter(function(k) {
    if (k.time > servertime)
    return true;
    });
    hooks.timetable_display(s, header, resp);
    }
    });
    };
    function stoptimes_display(stop) {
    if (!stop || !stop.stop_id)
    return;
    __stop_id = stop.stop_id;
    repoll(stop);
    };
    hooks.stoptimes_display = stoptimes_display;
    }
    function bus_lemap_stop_prepare(event, hooks) {
    var s = sp_get('bus_lemap_stop');
    s.elements = {};
    sp_util_initlocalize('bus_lemap_stop', hooks.get_lang(), s);
    bus_lemap_stop_bind_stops(s, hooks);
    bus_lemap_stop_bind_stoptimes(s, hooks);
    }
    function bus_lemap_stop_localize(event, hooks) {
    var s = sp_get('bus_lemap_stop');
    var lang = hooks.get_lang()[1];
    s.lang.r(lang.bus_lemap_stop.fields, s.elements);
    }
    sp_listen('__REGISTER', function() {
    sp_listen('__PREPARE', bus_lemap_stop_prepare);
    sp_listen('__LOCALIZE', bus_lemap_stop_localize);
    });
    function bus_lemap_actions_prepare_actions(s, hooks) {
    var o = s.actions = {};
    var template = [ 
    '!pane, div',
    '+favsheader, div, header',
    '+linesheader, div, header',
    '+settingsheader, div, header',
    '!+debugbutton, span, button button-wide',
    '!+selectbutton, span, button button-mini',
    '!+showbutton, span, button button-mini',
    '!+resetbutton, span, button button-mini',
    '!favs, div',
    '!lines, div',
    '!linesactive, div',
    '!linescurrent, div',
    '!lineslist, div, list',
    '!+handnesstext, div',
    '!+handnessleft, span, button button-wide',
    '!+handnessright, span, button button-wide',
    '!+languagetext, div',
    '!+language, select, button button-verywide'
    ];
    var stable = [ 
    'handness, +2help, txt-center',
    'handnessbuttons, left right, txt-right txt-left',
    'langhelp, 2center',
    'langselect, 2center',
    'debug, 2center'
    ];
    sp_util_construct('iactions_', o, template, s.elements, 'actions_');
    stable = o.settingstable =
    sp_util_tablize('iactions_', o, stable, 'actions_');
    stable.id = 'iactions_settingstable';
    var cont = sp_self();
    with(o) {
    at(handnessbuttonsleft, 'width', '50%');
    at(handnessbuttonsright, 'width', '50%');
    pack(handnesshelp, handnesstext);
    pack(handnessbuttonsleft, handnessleft);
    pack(handnessbuttonsright, handnessright);
    pack(langhelpcenter, languagetext);
    pack(langselectcenter, language);
    if (hooks.is_devel())
    pack(debugcenter, debugbutton);
    pack(linescurrent, linesactive);
    pack(linescurrent, selectbutton);
    pack(pane, favsheader); 
    pack(pane, favs);
    pack(pane, linesheader); 
    pack(pane, lines);
    pack(pane, settingsheader); 
    pack(pane, stable);
    }
    [ 'fi_FI', 'sv_FI', 'en_GB' ].forEach(function(k) {
    var option = pack(o.language, ct('option'));
    option.value = k;
    pack(option, tn(s.l('lang_' + k.toLowerCase())));
    if (k == hooks.get_langid()) { 
    at(option, 'selected', 'selected');
    }
    });
    o.language.onchange = function() {
    sp_load('https://live.foli.fi/lemap/load/lang/' + o.language.value,
    function(lang, status) {
    try { 
    localStorage.setItem('LANGUAGE', lang[0]);
    } catch(ex) { console.warn('Storelang: %o', ex); }
    hooks.get_langid = function() { return lang[0]; }
    hooks.get_lang = function() { return lang; }
    sp_dispatch('__LOCALIZE', hooks);
    })
    };
    function actions_linestate(line, span) {
    if (gc(span).match(/\bselected\b/)) {
    clc(span, 'selected');
    hooks.lines_setstate(line, false);
    } else {
    cls(span, 'selected');
    hooks.lines_setstate(line, true);
    }
    }
    function update_lines(event, lines) {
    var textprefix = s.l('line_prefix');
    var alllines = {};
    for(var k in hooks.lines_active()) 
    alllines[k] = true;
    lines.forEach(function(k) { 
    alllines[k] = true;
    });
    var mergedlines = Object.keys(alllines);
    mergedlines = mergedlines.sort(function(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
    });
    rc(o.lineslist);
    mergedlines.forEach(function(k) {
    var span = pack('span', tn(textprefix + k));
    var state = hooks.lines_isenabled(k);
    if (state) cl(span, 'selected');
    span.onclick = ccl2(actions_linestate, k, span);
    pack(o.lineslist, span);
    });
    }
    function actions_relayout_lines() {
    rc(o.linesactive);
    var selected = hooks.lines_active();
    for(var line in selected) {
    pack(o.linesactive, cl(pack('span', line), 'shadow'));
    }
    if (!o.linesactive.firstChild) {
    pack(o.linesactive, tn(s.l('actives_empty')));
    hi(o.resetbutton);
    hi(o.resetbutton);
    } else {
    sh(o.resetbutton);
    sh(o.showbutton);
    }
    pack(rc(o.lines), o.linescurrent);
    hooks.pane_display(o.pane, function() {
    });
    }
    function actions_relayout_favs() {
    rc(o.favs);
    function onclick(stop) {
    hooks.ui_clear();
    hooks.stops_panto(stop);
    }
    var favs = hooks.favs_active();
    for(var stop in favs) {
    if (!(stop = hooks.gtfs_stops_get(stop)))
    continue;
    var span = pack('span', tn(stop.stop_id + ' ' + stop.stop_name));
    pack(o.favs, cl(span, 'shadow')).onclick = ccl1(onclick, stop);
    }
    if (!o.favs.firstChild) {
    pack(o.favs, tn(s.l('favs_empty')));
    }
    }
    function actions_relayout_settings() {
    return;
    }
    function actions_open() {
    actions_relayout_lines();
    actions_relayout_favs();
    actions_relayout_settings();
    }
    function toggle_handness() {
    if (hooks.ui_handness_get() == 'right-handed') {
    hooks.ui_handness_set('left-handed');
    } else {
    hooks.ui_handness_set('right-handed');
    }
    }
    o.handnessleft.onclick =
    o.handnessright.onclick = toggle_handness;
    o.debugbutton.onclick = function() {
    window.location = 'https://live.foli.fi/lemap';
    };
    o.selectbutton.onclick = function() {
    pack(rc(o.lines), o.lineslist);
    };
    o.resetbutton.onclick = function() {
    hooks.lines_reset();
    update_lines('__FAKE_EVENT', hooks.poller_lines());
    actions_open(); 
    };
    o.showbutton.onclick = function() {
    hooks.pane_close();
    hooks.lines_dispatch(); 
    hooks.map_defview();
    };
    sp_listen('__UPDATE_LINES', update_lines);
    hooks.pane_set_default_action(actions_open);
    }
    function bus_lemap_actions_prepare(event, hooks) {
    var s = sp_get('bus_lemap_actions');
    s.elements = {};
    sp_util_initlocalize('bus_lemap_actions', hooks.get_lang(), s);
    bus_lemap_actions_prepare_actions(s, hooks);
    }
    function bus_lemap_actions_localize(event, hooks) {
    var s = sp_get('bus_lemap_actions');
    var lang = hooks.get_lang()[1];
    s.lang.r(lang.bus_lemap_actions.fields, s.elements);
    }
    function bus_lemap_actions_start(event, hooks) {
    hooks.vehicles_lineview_enable();
    hooks.lines_dispatch();
    }
    sp_listen('__REGISTER', function(hooks) {
    sp_listen('__PREPARE', bus_lemap_actions_prepare);
    sp_listen('__LOCALIZE', bus_lemap_actions_localize);
    sp_listen('__START', bus_lemap_actions_start);
    });
    function bus_lemap_filter_prepare_filter(s, hooks) {
    var __suggest_pos = 0;
    var __suggest_cpos = -1;
    var __suggest_maxrows = 8;
    var __suggest_rows = [];
    var o = s.filter = {};
    var template = [ 
    '!field, div, shadow',
    '!input, text',
    '!suggest, div, shadow'
    ];
    sp_util_construct('ifilter_', o, template, s.elements, 'filter');
    var cont = sp_self();
    with(o) {
    input.disabled = true; 
    pack(field, input);
    packbefore(cont, field);
    packbefore(cont, suggest);
    };
    function __reset() {
    sv(o.input);
    hi(rc(o.suggest));
    }
    function __select(row) {
    __reset();
    if (row.poi.stop_id) {
    hooks.stops_panto(row.poi);
    } else {
    hooks.map_flyto(row.poi.lon, row.poi.lat);
    }
    }
    function __highlight(diff) {
    var l = __suggest_rows.length;
    __suggest_pos += diff;
    if (__suggest_pos < 0) {
    __suggest_pos = l - 1;
    } else if (__suggest_pos >= l) {
    __suggest_pos = 0;
    }
    __suggest_rows.forEach(function(k) { cl(k.div);	});
    cl(__suggest_rows[__suggest_pos].div, 'highlight');
    }
    function __relayout(filtered, replex) {
    var repl = '<em>$1</em>';
    rc(o.suggest);
    var maxrows = __suggest_maxrows;
    __suggest_rows = [];
    __suggest_cpos = -1;
    filtered.forEach(function(k) {
    if (--maxrows > 0) {
    var name, line;
    if (k.stop_id) {
    name = k.stop_id + ' ' + k.stop_name;
    } else if (k.name) {
    name = k.name;
    }
    try {
    name = name.replace(rex, repl);
    } catch (ex) {
    name = name ? name : '??';
    }
    var idspan = cl(ct('id'), 'id');
    var namespan = cl(ct('span'), 'name');
    namespan.innerHTML = name;
    var row = {
    'div' : ct('div'),
    'poi' : k
    };
    pack(row.div, idspan);
    pack(row.div, namespan);
    __suggest_rows.push(row);
    pack(o.suggest, row.div).onclick =
    ccl1(__select, row);
    }
    });
    sh(o.suggest, !filtered.length);
    }
    var __last_expect = false;
    function __refilter(search) {
    if (!(search = search.trim())) { 
    return __reset();
    }
    __last_expect = search;
    var ret = false;
    var repl = '<em>$1</em>';
    var timer = false;
    try {
    ret = new RegExp(search, 'i');
    rex = new RegExp('(' + search + ')', 'ig');
    } catch (ex) {
    ret = null;
    rex = null;
    }
    var stops = hooks.gtfs_stops_list();
    var counter = 0;
    var filtered = stops.filter(function(k) {
    try {
    if (counter > __suggest_maxrows)
    return; 
    if (ret.test(k.stop_id) ||
    ret.test(k.stop_name)) {
    counter++;
    return true;
    }
    } catch (ex) {
    console.warn(ex);
    }
    });
    var __timeout_timer = false;
    function layout_filtered() {
    if (__last_expect === search) {
    __last_expect = false;
    __timeout_timer = false;
    __relayout(filtered, ret);
    }
    }
    function filternet() {
    var parm = {
    'search' : search.toLowerCase()
    .replace(/[^\w\såäö']/gi, '')
    .replace(/\s+/g, ' ')
    };
    var path = 'https://live.foli.fi/lemap/search/' + sp_md5(JSON.stringify(parm));
    sp_call(path, parm, function(resp) {
    if (!(resp) ||
    !(resp = resp.result) ||
    !(resp.length)) {
    return layout_filtered();
    }
    if (__last_expect == search) {
    if (__timeout_timer === false) {
    windows.cancelTimeout(__timeout_timer);
    __timeout_timer = false;
    }
    __last_layed_out = false;
    resp.forEach(function(k) {
    if (k.type !== 'STOP')
    filtered.push(k);
    });
    layout_filtered();
    }
    });
    }
    if (filtered.length < __suggest_maxrows) {
    __timeout_timer =
    window.setTimeout(layout_filtered, 1500);
    filternet();
    } else {
    layout_filtered();
    }
    }
    var __delay_timer = false;
    function __delay(val) {
    if (__delay_timer !== false) {
    window.clearTimeout(__delay_timer);
    }
    __delay_timer = window.setTimeout(function() {
    __delay_timer = false;
    __refilter(val);
    }, 300);
    }
    function onkeyup(e) {
    switch((e = translate(e)).keyCode) {
    case 38: 
    __highlight(-1);
    break;
    case 40: 
    __highlight(+1);
    break;
    case 27:
    __reset();
    break;
    case 13:
    __select(__suggest_rows[__suggest_pos]);
    return;
    default:
    return __delay(gv(o.input));
    //return __refilter(gv(o.input));
    }
    if (e.stopPropagation) {
    e.stopPropagation();
    } else if (e.cancelBubble) {
    e.cancelBubble();
    }
    }
    function filter_reset() {
    rc(hi(o.suggest));
    sv(o.input);
    }
    function filter_setstate(t) {
    if (t) {
    o.input.disabled = true;
    o.input.placeholder = s.l(t);
    } else {
    o.input.disabled = false;
    o.input.placeholder = s.l('searchtip');
    }
    };
    var __notify_timeout = false;
    function notify_clear(msg) {
    if (__notify_timeout !== false) {
    window.clearTimeout(__notify_timeout);
    __notify_timeout = false;
    }
    o.input.placeholder = s.l('searchtip');
    };
    function notify_set(msg, timeout) {
    if (is_string(msg)) {
    notify_clear();
    o.input.placeholder = msg;
    if (is_num(timeout)) {
    __notify_timeout = window.setTimeout(function() {
    notify_clear();
    }, timeout);
    };
    };
    };
    o.input.onkeyup = onkeyup;
    o.input.onfocus = function() {
    hooks.ui_clear();
    };
    sp_listen('__UI_CLEAR', filter_reset);
    hooks.filter_reset = filter_reset;
    hooks.filter_setstate = filter_setstate;
    hooks.notify_set = notify_set;
    hooks.notify_clear = notify_clear;
    }
    function bus_lemap_filter_prepare(event, hooks) {
    var s = sp_get('bus_lemap_filter');
    s.elements = {};
    sp_util_initlocalize('bus_lemap_filter', hooks.get_lang(), s);
    bus_lemap_filter_prepare_filter(s, hooks);
    }
    function bus_lemap_filter_localize(event, hooks) {
    var s = sp_get('bus_lemap_filter');
    var lang = hooks.get_lang()[1];
    s.lang.r(lang.bus_lemap_filter.fields, s.elements);
    s.filter.input.placeholder = s.l('searchtip');
    }
    function bus_lemap_filter_start(s, hooks) {
    function isready(parm) {
    hooks.filter_setstate();
    }
    hooks.filter_setstate('initializing');
    hooks.gtfs_stops_load(isready);
    }
    sp_listen('__REGISTER', function() {
    sp_listen('__PREPARE', bus_lemap_filter_prepare);
    sp_listen('__LOCALIZE', bus_lemap_filter_localize);
    sp_listen('__START', bus_lemap_filter_start);
    });
    function bus_lemap_boot_bootstrap(event, hooks) {
    sp_load('https://live.foli.fi/lemap/load/lang/' + hooks.get_langid(),
    function(lang, status) {
    if (lang.length != 2) {
    console.log('Invalid language data: %o', lang);
    throw 'Invalid language data';
    }
    hooks.get_langid = function() { return lang[0]; }
    hooks.get_lang = function() { return lang; }
    sp_dispatch('__PRESTAGE', hooks);
    hooks.gtfs_init(function(resp) {
    if (resp) {
    sp_dispatch('__PREPARE', hooks);
    sp_dispatch('__LOCALIZE', hooks);
    sp_dispatch('__START', hooks);
    }
    });
    });
    }
    function bus_lemap_boot_start(event, hooks) {
    }
    function bus_lemap_boot_register(event, hooks) {
    sp_listen('__BOOTSTRAP', bus_lemap_boot_bootstrap);
    sp_listen('__START', bus_lemap_boot_start);
    }
    sp_listen('__REGISTER', bus_lemap_boot_register);
    (function() {
    var hooks = {};
    (function() {
    try {
    var lang = localStorage.getItem('LANGUAGE');
    switch(lang) {
    case 'fi_FI':
    case 'en_GB':
    case 'sv_FI':
    hooks.get_langid = function() {
    return lang;
    };
    return;
    default:
    lang = false;
    }
    var nlang = window.navigator.languages;
    var ulang = window.navigator.userLanguage ||
    window.navigator.language;
    if (is_array(nlang)) {
    nlang.forEach(function(k) {
    if (lang !== false)
    return; 
    if (k.match(/^fi/)) lang = 'fi_FI';
    else if (k.match(/^sv/)) lang = 'sv_FI';
    else if (k.match(/^en/)) lang = 'en_GB';
    });
    if (lang == 'en_GB') {
    if (ulang.match(/^fi/)) lang = 'fi_FI';
    if (ulang.match(/^sv/)) lang = 'sv_FI';
    }
    }
    if (!lang) {
    if (ulang.match(/^en/)) lang = 'en_GB';
    if (ulang.match(/^sv/)) lang = 'sv_FI';
    else lang = 'fi_FI';
    }
    hooks.get_langid = function() {
    return lang;
    };
    } catch(ex) {
    hooks.get_langid = function() {
    return 'fi_FI';
    };
    }
    })();
    hooks.is_devel = function() { return false;  };
    try {
    var host = sp_env().scripthost;
    if (host.match(/foli-pi/) || host.match(/foli-dev/)) {
    hooks.is_devel = function() { return true; };
    }
    } catch (ex) {  }
    sp_dispatch('__REGISTER', hooks);
    sp_install_ieproxy(function() {
    sp_dispatch('__BOOTSTRAP', hooks);
    });
    return;
    })();
    
    })();
    