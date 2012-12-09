function e(a) {
  throw a;
}
var aa = void 0, g = !0, l = null, m = !1;
function ba() {
  return function(a) {
    return a
  }
}
function n(a) {
  return function() {
    return this[a]
  }
}
function o(a) {
  return function() {
    return a
  }
}
var p, da = this;
function r(a) {
  var b = typeof a;
  if("object" == b) {
    if(a) {
      if(a instanceof Array) {
        return"array"
      }
      if(a instanceof Object) {
        return b
      }
      var c = Object.prototype.toString.call(a);
      if("[object Window]" == c) {
        return"object"
      }
      if("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) {
        return"array"
      }
      if("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if("function" == b && "undefined" == typeof a.call) {
      return"object"
    }
  }
  return b
}
function t(a) {
  return a !== aa
}
function ea(a) {
  return"string" == typeof a
}
var fa = "closure_uid_" + Math.floor(2147483648 * Math.random()).toString(36), ga = 0;
var ha = {"\x00":"\\0", "\u0008":"\\b", "\u000c":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"}, ja = {"'":"\\'"};
function ka(a) {
  a = "" + a;
  if(a.quote) {
    return a.quote()
  }
  for(var b = ['"'], c = 0;c < a.length;c++) {
    var d = a.charAt(c), f = d.charCodeAt(0), h = b, i = c + 1, j;
    if(!(j = ha[d])) {
      if(!(31 < f && 127 > f)) {
        if(d in ja) {
          d = ja[d]
        }else {
          if(d in ha) {
            d = ja[d] = ha[d]
          }else {
            f = d;
            j = d.charCodeAt(0);
            if(31 < j && 127 > j) {
              f = d
            }else {
              if(256 > j) {
                if(f = "\\x", 16 > j || 256 < j) {
                  f += "0"
                }
              }else {
                f = "\\u", 4096 > j && (f += "0")
              }
              f += j.toString(16).toUpperCase()
            }
            d = ja[d] = f
          }
        }
      }
      j = d
    }
    h[i] = j
  }
  b.push('"');
  return b.join("")
}
function la(a) {
  for(var b = 0, c = ("" + ma).replace(/^[\s\xa0]+|[\s\xa0]+$/g, "").split("."), a = ("" + a).replace(/^[\s\xa0]+|[\s\xa0]+$/g, "").split("."), d = Math.max(c.length, a.length), f = 0;0 == b && f < d;f++) {
    var h = c[f] || "", i = a[f] || "", j = RegExp("(\\d*)(\\D*)", "g"), k = RegExp("(\\d*)(\\D*)", "g");
    do {
      var q = j.exec(h) || ["", "", ""], s = k.exec(i) || ["", "", ""];
      if(0 == q[0].length && 0 == s[0].length) {
        break
      }
      b = ((0 == q[1].length ? 0 : parseInt(q[1], 10)) < (0 == s[1].length ? 0 : parseInt(s[1], 10)) ? -1 : (0 == q[1].length ? 0 : parseInt(q[1], 10)) > (0 == s[1].length ? 0 : parseInt(s[1], 10)) ? 1 : 0) || ((0 == q[2].length) < (0 == s[2].length) ? -1 : (0 == q[2].length) > (0 == s[2].length) ? 1 : 0) || (q[2] < s[2] ? -1 : q[2] > s[2] ? 1 : 0)
    }while(0 == b)
  }
  return b
}
function na(a) {
  for(var b = 0, c = 0;c < a.length;++c) {
    b = 31 * b + a.charCodeAt(c), b %= 4294967296
  }
  return b
}
var oa = {};
function pa(a) {
  return oa[a] || (oa[a] = ("" + a).replace(/\-([a-z])/g, function(a, c) {
    return c.toUpperCase()
  }))
}
;var qa = Array.prototype;
function sa(a, b) {
  qa.sort.call(a, b || ta)
}
function ua(a, b) {
  for(var c = 0;c < a.length;c++) {
    a[c] = {index:c, value:a[c]}
  }
  var d = b || ta;
  sa(a, function(a, b) {
    return d(a.value, b.value) || a.index - b.index
  });
  for(c = 0;c < a.length;c++) {
    a[c] = a[c].value
  }
}
function ta(a, b) {
  return a > b ? 1 : a < b ? -1 : 0
}
;function va(a, b) {
  for(var c in a) {
    b.call(aa, a[c], c, a)
  }
}
function wa(a) {
  var b = {}, c;
  for(c in a) {
    b[c] = a[c]
  }
  return b
}
;function xa(a, b) {
  var c = Array.prototype.slice.call(arguments), d = c.shift();
  "undefined" == typeof d && e(Error("[goog.string.format] Template required"));
  return d.replace(/%([0\-\ \+]*)(\d+)?(\.(\d+))?([%sfdiu])/g, function(a, b, d, j, k, q, s, w) {
    if("%" == q) {
      return"%"
    }
    var C = c.shift();
    "undefined" == typeof C && e(Error("[goog.string.format] Not enough arguments"));
    arguments[0] = C;
    return xa.za[q].apply(l, arguments)
  })
}
xa.za = {};
xa.za.s = function(a, b, c) {
  return isNaN(c) || "" == c || a.length >= c ? a : a = -1 < b.indexOf("-", 0) ? a + Array(c - a.length + 1).join(" ") : Array(c - a.length + 1).join(" ") + a
};
xa.za.f = function(a, b, c, d, f) {
  d = a.toString();
  isNaN(f) || "" == f || (d = a.toFixed(f));
  var h;
  h = 0 > a ? "-" : 0 <= b.indexOf("+") ? "+" : 0 <= b.indexOf(" ") ? " " : "";
  0 <= a && (d = h + d);
  if(isNaN(c) || d.length >= c) {
    return d
  }
  d = isNaN(f) ? Math.abs(a).toString() : Math.abs(a).toFixed(f);
  a = c - d.length - h.length;
  return d = 0 <= b.indexOf("-", 0) ? h + d + Array(a + 1).join(" ") : h + Array(a + 1).join(0 <= b.indexOf("0", 0) ? "0" : " ") + d
};
xa.za.d = function(a, b, c, d, f, h, i, j) {
  return xa.za.f(parseInt(a, 10), b, c, d, 0, h, i, j)
};
xa.za.i = xa.za.d;
xa.za.u = xa.za.d;
var ya, za, Aa, Ba, Ca;
(Ca = "ScriptEngine" in da && "JScript" == da.ScriptEngine()) && (da.ScriptEngineMajorVersion(), da.ScriptEngineMinorVersion(), da.ScriptEngineBuildVersion());
function Ea(a, b) {
  this.ma = Ca ? [] : "";
  a != l && this.append.apply(this, arguments)
}
Ca ? (Ea.prototype.ob = 0, Ea.prototype.append = function(a, b, c) {
  b == l ? this.ma[this.ob++] = a : (this.ma.push.apply(this.ma, arguments), this.ob = this.ma.length);
  return this
}) : Ea.prototype.append = function(a, b, c) {
  this.ma += a;
  if(b != l) {
    for(var d = 1;d < arguments.length;d++) {
      this.ma += arguments[d]
    }
  }
  return this
};
Ea.prototype.clear = function() {
  if(Ca) {
    this.ob = this.ma.length = 0
  }else {
    this.ma = ""
  }
};
Ea.prototype.toString = function() {
  if(Ca) {
    var a = this.ma.join("");
    this.clear();
    a && this.append(a);
    return a
  }
  return this.ma
};
function u(a) {
  return a != l && a !== m
}
function v(a, b) {
  return a[r(b == l ? l : b)] ? g : a._ ? g : m
}
function x(a, b) {
  return Error(["No protocol method ", a, " defined for type ", r(b), ": ", b].join(""))
}
var Fa = function() {
  var a = l, a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return Array(b);
      case 2:
        return a.h(c)
    }
    e("Invalid arity: " + arguments.length)
  };
  a.h = function(a) {
    return Array(a)
  };
  a.g = function(b, c) {
    return a.h(c)
  };
  return a
}(), Ga = {};
function Ha(a) {
  if(a ? a.L : a) {
    return a.L(a)
  }
  var b;
  var c = Ha[r(a == l ? l : a)];
  c ? b = c : (c = Ha._) ? b = c : e(x("ICounted.-count", a));
  return b.call(l, a)
}
var Ia = {};
function Ja(a, b) {
  if(a ? a.N : a) {
    return a.N(a, b)
  }
  var c;
  var d = Ja[r(a == l ? l : a)];
  d ? c = d : (d = Ja._) ? c = d : e(x("ICollection.-conj", a));
  return c.call(l, a, b)
}
var Ka = {}, y = function() {
  function a(a, b, c) {
    if(a ? a.W : a) {
      return a.W(a, b, c)
    }
    var i;
    var j = y[r(a == l ? l : a)];
    j ? i = j : (j = y._) ? i = j : e(x("IIndexed.-nth", a));
    return i.call(l, a, b, c)
  }
  function b(a, b) {
    if(a ? a.ea : a) {
      return a.ea(a, b)
    }
    var c;
    var i = y[r(a == l ? l : a)];
    i ? c = i : (i = y._) ? c = i : e(x("IIndexed.-nth", a));
    return c.call(l, a, b)
  }
  var c = l, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.j = a;
  return c
}(), La = {}, Ma = {};
function z(a) {
  if(a ? a.fa : a) {
    return a.fa(a)
  }
  var b;
  var c = z[r(a == l ? l : a)];
  c ? b = c : (c = z._) ? b = c : e(x("ISeq.-first", a));
  return b.call(l, a)
}
function A(a) {
  if(a ? a.$ : a) {
    return a.$(a)
  }
  var b;
  var c = A[r(a == l ? l : a)];
  c ? b = c : (c = A._) ? b = c : e(x("ISeq.-rest", a));
  return b.call(l, a)
}
var Na = {};
function Oa(a) {
  if(a ? a.Da : a) {
    return a.Da(a)
  }
  var b;
  var c = Oa[r(a == l ? l : a)];
  c ? b = c : (c = Oa._) ? b = c : e(x("INext.-next", a));
  return b.call(l, a)
}
var B = function() {
  function a(a, b, c) {
    if(a ? a.B : a) {
      return a.B(a, b, c)
    }
    var i;
    var j = B[r(a == l ? l : a)];
    j ? i = j : (j = B._) ? i = j : e(x("ILookup.-lookup", a));
    return i.call(l, a, b, c)
  }
  function b(a, b) {
    if(a ? a.I : a) {
      return a.I(a, b)
    }
    var c;
    var i = B[r(a == l ? l : a)];
    i ? c = i : (i = B._) ? c = i : e(x("ILookup.-lookup", a));
    return c.call(l, a, b)
  }
  var c = l, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.j = a;
  return c
}();
function Pa(a, b) {
  if(a ? a.Pa : a) {
    return a.Pa(a, b)
  }
  var c;
  var d = Pa[r(a == l ? l : a)];
  d ? c = d : (d = Pa._) ? c = d : e(x("IAssociative.-contains-key?", a));
  return c.call(l, a, b)
}
function Qa(a, b, c) {
  if(a ? a.R : a) {
    return a.R(a, b, c)
  }
  var d;
  var f = Qa[r(a == l ? l : a)];
  f ? d = f : (f = Qa._) ? d = f : e(x("IAssociative.-assoc", a));
  return d.call(l, a, b, c)
}
var Ra = {};
function Sa(a, b) {
  if(a ? a.pa : a) {
    return a.pa(a, b)
  }
  var c;
  var d = Sa[r(a == l ? l : a)];
  d ? c = d : (d = Sa._) ? c = d : e(x("IMap.-dissoc", a));
  return c.call(l, a, b)
}
var Ta = {};
function Ua(a) {
  if(a ? a.kb : a) {
    return a.kb(a)
  }
  var b;
  var c = Ua[r(a == l ? l : a)];
  c ? b = c : (c = Ua._) ? b = c : e(x("IMapEntry.-key", a));
  return b.call(l, a)
}
function Va(a) {
  if(a ? a.lb : a) {
    return a.lb(a)
  }
  var b;
  var c = Va[r(a == l ? l : a)];
  c ? b = c : (c = Va._) ? b = c : e(x("IMapEntry.-val", a));
  return b.call(l, a)
}
var Wa = {};
function Xa(a) {
  if(a ? a.xa : a) {
    return a.xa(a)
  }
  var b;
  var c = Xa[r(a == l ? l : a)];
  c ? b = c : (c = Xa._) ? b = c : e(x("IStack.-peek", a));
  return b.call(l, a)
}
var Ya = {};
function $a(a, b, c) {
  if(a ? a.Ua : a) {
    return a.Ua(a, b, c)
  }
  var d;
  var f = $a[r(a == l ? l : a)];
  f ? d = f : (f = $a._) ? d = f : e(x("IVector.-assoc-n", a));
  return d.call(l, a, b, c)
}
function D(a) {
  if(a ? a.Qa : a) {
    return a.Qa(a)
  }
  var b;
  var c = D[r(a == l ? l : a)];
  c ? b = c : (c = D._) ? b = c : e(x("IDeref.-deref", a));
  return b.call(l, a)
}
var ab = {};
function bb(a) {
  if(a ? a.P : a) {
    return a.P(a)
  }
  var b;
  var c = bb[r(a == l ? l : a)];
  c ? b = c : (c = bb._) ? b = c : e(x("IMeta.-meta", a));
  return b.call(l, a)
}
function cb(a, b) {
  if(a ? a.Q : a) {
    return a.Q(a, b)
  }
  var c;
  var d = cb[r(a == l ? l : a)];
  d ? c = d : (d = cb._) ? c = d : e(x("IWithMeta.-with-meta", a));
  return c.call(l, a, b)
}
var db = {}, eb = function() {
  function a(a, b, c) {
    if(a ? a.wa : a) {
      return a.wa(a, b, c)
    }
    var i;
    var j = eb[r(a == l ? l : a)];
    j ? i = j : (j = eb._) ? i = j : e(x("IReduce.-reduce", a));
    return i.call(l, a, b, c)
  }
  function b(a, b) {
    if(a ? a.va : a) {
      return a.va(a, b)
    }
    var c;
    var i = eb[r(a == l ? l : a)];
    i ? c = i : (i = eb._) ? c = i : e(x("IReduce.-reduce", a));
    return c.call(l, a, b)
  }
  var c = l, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.j = a;
  return c
}();
function fb(a, b) {
  if(a ? a.F : a) {
    return a.F(a, b)
  }
  var c;
  var d = fb[r(a == l ? l : a)];
  d ? c = d : (d = fb._) ? c = d : e(x("IEquiv.-equiv", a));
  return c.call(l, a, b)
}
function gb(a) {
  if(a ? a.H : a) {
    return a.H(a)
  }
  var b;
  var c = gb[r(a == l ? l : a)];
  c ? b = c : (c = gb._) ? b = c : e(x("IHash.-hash", a));
  return b.call(l, a)
}
function hb(a) {
  if(a ? a.G : a) {
    return a.G(a)
  }
  var b;
  var c = hb[r(a == l ? l : a)];
  c ? b = c : (c = hb._) ? b = c : e(x("ISeqable.-seq", a));
  return b.call(l, a)
}
var ib = {}, jb = {};
function kb(a) {
  if(a ? a.$a : a) {
    return a.$a(a)
  }
  var b;
  var c = kb[r(a == l ? l : a)];
  c ? b = c : (c = kb._) ? b = c : e(x("IReversible.-rseq", a));
  return b.call(l, a)
}
var lb = {};
function mb(a, b) {
  if(a ? a.M : a) {
    return a.M(a, b)
  }
  var c;
  var d = mb[r(a == l ? l : a)];
  d ? c = d : (d = mb._) ? c = d : e(x("IPrintable.-pr-seq", a));
  return c.call(l, a, b)
}
function nb(a, b, c) {
  if(a ? a.mb : a) {
    return a.mb(a, b, c)
  }
  var d;
  var f = nb[r(a == l ? l : a)];
  f ? d = f : (f = nb._) ? d = f : e(x("IWatchable.-notify-watches", a));
  return d.call(l, a, b, c)
}
function ob(a, b, c) {
  if(a ? a.ub : a) {
    return a.ub(a, b, c)
  }
  var d;
  var f = ob[r(a == l ? l : a)];
  f ? d = f : (f = ob._) ? d = f : e(x("IWatchable.-add-watch", a));
  return d.call(l, a, b, c)
}
function pb(a, b) {
  if(a ? a.vb : a) {
    return a.vb(a, b)
  }
  var c;
  var d = pb[r(a == l ? l : a)];
  d ? c = d : (d = pb._) ? c = d : e(x("IWatchable.-remove-watch", a));
  return c.call(l, a, b)
}
var qb = {};
function rb(a) {
  if(a ? a.Ra : a) {
    return a.Ra(a)
  }
  var b;
  var c = rb[r(a == l ? l : a)];
  c ? b = c : (c = rb._) ? b = c : e(x("IEditableCollection.-as-transient", a));
  return b.call(l, a)
}
function sb(a, b) {
  if(a ? a.Ta : a) {
    return a.Ta(a, b)
  }
  var c;
  var d = sb[r(a == l ? l : a)];
  d ? c = d : (d = sb._) ? c = d : e(x("ITransientCollection.-conj!", a));
  return c.call(l, a, b)
}
function tb(a) {
  if(a ? a.ab : a) {
    return a.ab(a)
  }
  var b;
  var c = tb[r(a == l ? l : a)];
  c ? b = c : (c = tb._) ? b = c : e(x("ITransientCollection.-persistent!", a));
  return b.call(l, a)
}
function ub(a, b, c) {
  if(a ? a.Sa : a) {
    return a.Sa(a, b, c)
  }
  var d;
  var f = ub[r(a == l ? l : a)];
  f ? d = f : (f = ub._) ? d = f : e(x("ITransientAssociative.-assoc!", a));
  return d.call(l, a, b, c)
}
var vb = {};
function wb(a, b) {
  if(a ? a.Xb : a) {
    return a.Xb(a, b)
  }
  var c;
  var d = wb[r(a == l ? l : a)];
  d ? c = d : (d = wb._) ? c = d : e(x("IComparable.-compare", a));
  return c.call(l, a, b)
}
function xb(a) {
  if(a ? a.Ub : a) {
    return a.Ub()
  }
  var b;
  var c = xb[r(a == l ? l : a)];
  c ? b = c : (c = xb._) ? b = c : e(x("IChunk.-drop-first", a));
  return b.call(l, a)
}
var yb = {};
function zb(a) {
  if(a ? a.sb : a) {
    return a.sb(a)
  }
  var b;
  var c = zb[r(a == l ? l : a)];
  c ? b = c : (c = zb._) ? b = c : e(x("IChunkedSeq.-chunked-first", a));
  return b.call(l, a)
}
function Ab(a) {
  if(a ? a.jb : a) {
    return a.jb(a)
  }
  var b;
  var c = Ab[r(a == l ? l : a)];
  c ? b = c : (c = Ab._) ? b = c : e(x("IChunkedSeq.-chunked-rest", a));
  return b.call(l, a)
}
function E(a, b) {
  return a === b
}
var Bb = function() {
  function a(a, b) {
    var c = a === b;
    return c ? c : fb(a, b)
  }
  var b = l, c = function() {
    function a(b, d, j) {
      var k = l;
      t(j) && (k = F(Array.prototype.slice.call(arguments, 2), 0));
      return c.call(this, b, d, k)
    }
    function c(a, d, f) {
      for(;;) {
        if(u(b.g(a, d))) {
          if(G(f)) {
            a = d, d = H(f), f = G(f)
          }else {
            return b.g(d, H(f))
          }
        }else {
          return m
        }
      }
    }
    a.A = 2;
    a.t = function(a) {
      var b = H(a), d = H(G(a)), a = I(G(a));
      return c(b, d, a)
    };
    a.k = c;
    return a
  }(), b = function(b, f, h) {
    switch(arguments.length) {
      case 1:
        return g;
      case 2:
        return a.call(this, b, f);
      default:
        return c.k(b, f, F(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.A = 2;
  b.t = c.t;
  b.h = o(g);
  b.g = a;
  b.k = c.k;
  return b
}();
function J(a, b) {
  return b instanceof a
}
gb["null"] = o(0);
B["null"] = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return l;
      case 3:
        return d
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Qa["null"] = function(a, b, c) {
  return Cb.k(F([b, c], 0))
};
Na["null"] = g;
Oa["null"] = o(l);
Ia["null"] = g;
Ja["null"] = function(a, b) {
  return Db.h(b)
};
db["null"] = g;
eb["null"] = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return c.J ? c.J() : c.call(l);
      case 3:
        return d
    }
    e("Invalid arity: " + arguments.length)
  }
}();
lb["null"] = g;
mb["null"] = function() {
  return Db.h("nil")
};
Wa["null"] = g;
Ga["null"] = g;
Ha["null"] = o(0);
Xa["null"] = o(l);
Ma["null"] = g;
z["null"] = o(l);
A["null"] = function() {
  return Db.J()
};
fb["null"] = function(a, b) {
  return b == l
};
cb["null"] = o(l);
ab["null"] = g;
bb["null"] = o(l);
Ka["null"] = g;
y["null"] = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return l;
      case 3:
        return d
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Ra["null"] = g;
Sa["null"] = o(l);
Date.prototype.F = function(a, b) {
  var c = J(Date, b);
  return c ? a.toString() === b.toString() : c
};
gb.number = ba();
fb.number = function(a, b) {
  return a === b
};
gb["boolean"] = function(a) {
  return a === g ? 1 : 0
};
gb._ = function(a) {
  return a[fa] || (a[fa] = ++ga)
};
function Eb(a) {
  return a + 1
}
var K = function() {
  function a(a, b, c, d) {
    for(var k = Ha(a);;) {
      if(d < k) {
        c = b.g ? b.g(c, y.g(a, d)) : b.call(l, c, y.g(a, d));
        if(J(Fb, c)) {
          return D(c)
        }
        d += 1
      }else {
        return c
      }
    }
  }
  function b(a, b, c) {
    for(var d = Ha(a), k = 0;;) {
      if(k < d) {
        c = b.g ? b.g(c, y.g(a, k)) : b.call(l, c, y.g(a, k));
        if(J(Fb, c)) {
          return D(c)
        }
        k += 1
      }else {
        return c
      }
    }
  }
  function c(a, b) {
    var c = Ha(a);
    if(0 === c) {
      return b.J ? b.J() : b.call(l)
    }
    for(var d = y.g(a, 0), k = 1;;) {
      if(k < c) {
        d = b.g ? b.g(d, y.g(a, k)) : b.call(l, d, y.g(a, k));
        if(J(Fb, d)) {
          return D(d)
        }
        k += 1
      }else {
        return d
      }
    }
  }
  var d = l, d = function(d, h, i, j) {
    switch(arguments.length) {
      case 2:
        return c.call(this, d, h);
      case 3:
        return b.call(this, d, h, i);
      case 4:
        return a.call(this, d, h, i, j)
    }
    e("Invalid arity: " + arguments.length)
  };
  d.g = c;
  d.j = b;
  d.D = a;
  return d
}();
function Gb(a, b) {
  this.a = a;
  this.K = b;
  this.C = 0;
  this.p = 166199546
}
p = Gb.prototype;
p.H = function(a) {
  return Hb(a)
};
p.Da = function() {
  return this.K + 1 < this.a.length ? new Gb(this.a, this.K + 1) : l
};
p.N = function(a, b) {
  return L(b, a)
};
p.$a = function(a) {
  var b = a.L(a);
  return 0 < b ? new Ib(a, b - 1, l) : M
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.va = function(a, b) {
  return Jb(this.a) ? K.D(this.a, b, this.a[this.K], this.K + 1) : K.D(a, b, this.a[this.K], 0)
};
p.wa = function(a, b, c) {
  return Jb(this.a) ? K.D(this.a, b, c, this.K) : K.D(a, b, c, 0)
};
p.G = ba();
p.L = function() {
  return this.a.length - this.K
};
p.fa = function() {
  return this.a[this.K]
};
p.$ = function() {
  return this.K + 1 < this.a.length ? new Gb(this.a, this.K + 1) : Db.J()
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.ea = function(a, b) {
  var c = b + this.K;
  return c < this.a.length ? this.a[c] : l
};
p.W = function(a, b, c) {
  a = b + this.K;
  return a < this.a.length ? this.a[a] : c
};
Gb;
var Lb = function() {
  function a(a, b) {
    return 0 === a.length ? l : new Gb(a, b)
  }
  function b(a) {
    return c.g(a, 0)
  }
  var c = l, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.g = a;
  return c
}(), F = function() {
  function a(a, b) {
    return Lb.g(a, b)
  }
  function b(a) {
    return Lb.g(a, 0)
  }
  var c = l, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.g = a;
  return c
}();
db.array = g;
eb.array = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return K.g(a, c);
      case 3:
        return K.j(a, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
B.array = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return a[c];
      case 3:
        return y.j(a, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Ka.array = g;
y.array = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return c < a.length ? a[c] : l;
      case 3:
        return c < a.length ? a[c] : d
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Ga.array = g;
Ha.array = function(a) {
  return a.length
};
hb.array = function(a) {
  return F.g(a, 0)
};
function Ib(a, b, c) {
  this.rb = a;
  this.K = b;
  this.m = c;
  this.C = 0;
  this.p = 31850570
}
p = Ib.prototype;
p.H = function(a) {
  return Hb(a)
};
p.N = function(a, b) {
  return L(b, a)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = ba();
p.L = function() {
  return this.K + 1
};
p.fa = function() {
  return y.g(this.rb, this.K)
};
p.$ = function() {
  return 0 < this.K ? new Ib(this.rb, this.K - 1, l) : M
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new Ib(this.rb, this.K, b)
};
p.P = n("m");
Ib;
function Q(a) {
  if(a == l) {
    a = l
  }else {
    var b;
    b = a ? ((b = a.p & 32) ? b : a.oc) ? g : a.p ? m : v(La, a) : v(La, a);
    a = b ? a : hb(a)
  }
  return a
}
function H(a) {
  if(a == l) {
    return l
  }
  var b;
  b = a ? ((b = a.p & 64) ? b : a.tb) ? g : a.p ? m : v(Ma, a) : v(Ma, a);
  if(b) {
    return z(a)
  }
  a = Q(a);
  return a == l ? l : z(a)
}
function I(a) {
  if(a != l) {
    var b;
    b = a ? ((b = a.p & 64) ? b : a.tb) ? g : a.p ? m : v(Ma, a) : v(Ma, a);
    if(b) {
      return A(a)
    }
    a = Q(a);
    return a != l ? A(a) : M
  }
  return M
}
function G(a) {
  if(a == l) {
    a = l
  }else {
    var b;
    b = a ? ((b = a.p & 128) ? b : a.tc) ? g : a.p ? m : v(Na, a) : v(Na, a);
    a = b ? Oa(a) : Q(I(a))
  }
  return a
}
function Mb(a) {
  for(;;) {
    var b = G(a);
    if(b != l) {
      a = b
    }else {
      return H(a)
    }
  }
}
fb._ = function(a, b) {
  return a === b
};
function Nb(a) {
  return u(a) ? m : g
}
var Ob = function() {
  var a = l, b = function() {
    function b(a, c, i) {
      var j = l;
      t(i) && (j = F(Array.prototype.slice.call(arguments, 2), 0));
      return d.call(this, a, c, j)
    }
    function d(b, c, d) {
      for(;;) {
        if(u(d)) {
          b = a.g(b, c), c = H(d), d = G(d)
        }else {
          return a.g(b, c)
        }
      }
    }
    b.A = 2;
    b.t = function(a) {
      var b = H(a), c = H(G(a)), a = I(G(a));
      return d(b, c, a)
    };
    b.k = d;
    return b
  }(), a = function(a, d, f) {
    switch(arguments.length) {
      case 2:
        return Ja(a, d);
      default:
        return b.k(a, d, F(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  a.A = 2;
  a.t = b.t;
  a.g = function(a, b) {
    return Ja(a, b)
  };
  a.k = b.k;
  return a
}();
function R(a) {
  if(Jb(a)) {
    a = Ha(a)
  }else {
    a: {
      for(var a = Q(a), b = 0;;) {
        if(Jb(a)) {
          a = b + Ha(a);
          break a
        }
        a = G(a);
        b += 1
      }
      a = aa
    }
  }
  return a
}
var Qb = function() {
  function a(a, b, h) {
    return a == l ? h : 0 === b ? Q(a) ? H(a) : h : Pb(a) ? y.j(a, b, h) : Q(a) ? c.j(G(a), b - 1, h) : h
  }
  function b(a, b) {
    a == l && e(Error("Index out of bounds"));
    if(0 === b) {
      if(Q(a)) {
        return H(a)
      }
      e(Error("Index out of bounds"))
    }
    if(Pb(a)) {
      return y.g(a, b)
    }
    if(Q(a)) {
      return c.g(G(a), b - 1)
    }
    e(Error("Index out of bounds"))
  }
  var c = l, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.j = a;
  return c
}(), Rb = function() {
  function a(a, b, c) {
    if(a != l) {
      var i;
      i = a ? ((i = a.p & 16) ? i : a.Yb) ? g : a.p ? m : v(Ka, a) : v(Ka, a);
      a = i ? y.j(a, Math.floor(b), c) : Qb.j(a, Math.floor(b), c)
    }else {
      a = c
    }
    return a
  }
  function b(a, b) {
    var c;
    a == l ? c = l : (c = a ? ((c = a.p & 16) ? c : a.Yb) ? g : a.p ? m : v(Ka, a) : v(Ka, a), c = c ? y.g(a, Math.floor(b)) : Qb.g(a, Math.floor(b)));
    return c
  }
  var c = l, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.j = a;
  return c
}(), Sb = function() {
  var a = l, b = function() {
    function b(a, c, i, j) {
      var k = l;
      t(j) && (k = F(Array.prototype.slice.call(arguments, 3), 0));
      return d.call(this, a, c, i, k)
    }
    function d(b, c, d, j) {
      for(;;) {
        if(b = a.j(b, c, d), u(j)) {
          c = H(j), d = H(G(j)), j = G(G(j))
        }else {
          return b
        }
      }
    }
    b.A = 3;
    b.t = function(a) {
      var b = H(a), c = H(G(a)), j = H(G(G(a))), a = I(G(G(a)));
      return d(b, c, j, a)
    };
    b.k = d;
    return b
  }(), a = function(a, d, f, h) {
    switch(arguments.length) {
      case 3:
        return Qa(a, d, f);
      default:
        return b.k(a, d, f, F(arguments, 3))
    }
    e("Invalid arity: " + arguments.length)
  };
  a.A = 3;
  a.t = b.t;
  a.j = function(a, b, f) {
    return Qa(a, b, f)
  };
  a.k = b.k;
  return a
}(), Tb = function() {
  var a = l, b = function() {
    function b(a, c, i) {
      var j = l;
      t(i) && (j = F(Array.prototype.slice.call(arguments, 2), 0));
      return d.call(this, a, c, j)
    }
    function d(b, c, d) {
      for(;;) {
        if(b = a.g(b, c), u(d)) {
          c = H(d), d = G(d)
        }else {
          return b
        }
      }
    }
    b.A = 2;
    b.t = function(a) {
      var b = H(a), c = H(G(a)), a = I(G(a));
      return d(b, c, a)
    };
    b.k = d;
    return b
  }(), a = function(a, d, f) {
    switch(arguments.length) {
      case 1:
        return a;
      case 2:
        return Sa(a, d);
      default:
        return b.k(a, d, F(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  a.A = 2;
  a.t = b.t;
  a.h = ba();
  a.g = function(a, b) {
    return Sa(a, b)
  };
  a.k = b.k;
  return a
}();
function Ub(a, b) {
  return cb(a, b)
}
function Vb(a) {
  var b;
  b = a ? ((b = a.p & 131072) ? b : a.dc) ? g : a.p ? m : v(ab, a) : v(ab, a);
  return b ? bb(a) : l
}
var Wb = {}, Xb = 0, S = function() {
  function a(a, b) {
    var c = ea(a);
    if(c ? b : c) {
      if(255 < Xb && (Wb = {}, Xb = 0), c = Wb[a], c == l) {
        c = na(a), Wb[a] = c, Xb += 1
      }
    }else {
      c = gb(a)
    }
    return c
  }
  function b(a) {
    return c.g(a, g)
  }
  var c = l, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.g = a;
  return c
}();
function Yb(a) {
  if(a == l) {
    a = m
  }else {
    if(a) {
      var b = a.p & 8, a = (b ? b : a.pc) ? g : a.p ? m : v(Ia, a)
    }else {
      a = v(Ia, a)
    }
  }
  return a
}
function Zb(a) {
  if(a == l) {
    a = m
  }else {
    if(a) {
      var b = a.p & 4096, a = (b ? b : a.wc) ? g : a.p ? m : v(Wa, a)
    }else {
      a = v(Wa, a)
    }
  }
  return a
}
function Jb(a) {
  if(a) {
    var b = a.p & 2, a = (b ? b : a.qc) ? g : a.p ? m : v(Ga, a)
  }else {
    a = v(Ga, a)
  }
  return a
}
function Pb(a) {
  if(a) {
    var b = a.p & 16, a = (b ? b : a.Yb) ? g : a.p ? m : v(Ka, a)
  }else {
    a = v(Ka, a)
  }
  return a
}
function $b(a) {
  if(a == l) {
    a = m
  }else {
    if(a) {
      var b = a.p & 1024, a = (b ? b : a.sc) ? g : a.p ? m : v(Ra, a)
    }else {
      a = v(Ra, a)
    }
  }
  return a
}
function ac(a) {
  if(a) {
    var b = a.p & 16384, a = (b ? b : a.xc) ? g : a.p ? m : v(Ya, a)
  }else {
    a = v(Ya, a)
  }
  return a
}
function bc(a) {
  return a ? u(u(l) ? l : a.Wb) ? g : a.fc ? m : v(yb, a) : v(yb, a)
}
function cc(a) {
  var b = [];
  va(a, function(a, d) {
    return b.push(d)
  });
  return b
}
function dc(a, b, c, d, f) {
  for(;0 !== f;) {
    c[d] = a[b], d += 1, f -= 1, b += 1
  }
}
var ec = {};
function fc(a) {
  if(a == l) {
    a = m
  }else {
    if(a) {
      var b = a.p & 64, a = (b ? b : a.tb) ? g : a.p ? m : v(Ma, a)
    }else {
      a = v(Ma, a)
    }
  }
  return a
}
function gc(a) {
  return u(a) ? g : m
}
function hc(a) {
  var b = ea(a);
  b ? (b = "\ufdd0" === a.charAt(0), a = !(b ? b : "\ufdd1" === a.charAt(0))) : a = b;
  return a
}
function ic(a) {
  var b = ea(a);
  return b ? "\ufdd0" === a.charAt(0) : b
}
function jc(a) {
  var b = ea(a);
  return b ? "\ufdd1" === a.charAt(0) : b
}
function kc(a, b) {
  return B.j(a, b, ec) === ec ? m : g
}
function lc(a, b) {
  if(a === b) {
    return 0
  }
  if(a == l) {
    return-1
  }
  if(b == l) {
    return 1
  }
  if((a == l ? l : a.constructor) === (b == l ? l : b.constructor)) {
    return(a ? u(u(l) ? l : a.bc) || (a.fc ? 0 : v(vb, a)) : v(vb, a)) ? wb(a, b) : ta(a, b)
  }
  e(Error("compare on non-nil objects of different types"))
}
var mc = function() {
  function a(a, b, c, i) {
    for(;;) {
      var j = lc(Rb.g(a, i), Rb.g(b, i)), k = 0 === j;
      if(k ? i + 1 < c : k) {
        i += 1
      }else {
        return j
      }
    }
  }
  function b(a, b) {
    var h = R(a), i = R(b);
    return h < i ? -1 : h > i ? 1 : c.D(a, b, h, 0)
  }
  var c = l, c = function(c, f, h, i) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 4:
        return a.call(this, c, f, h, i)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.D = a;
  return c
}();
function nc(a) {
  return Bb.g(a, lc) ? lc : function(b, c) {
    var d = a.g ? a.g(b, c) : a.call(l, b, c);
    return"number" == typeof d ? d : u(d) ? -1 : u(a.g ? a.g(c, b) : a.call(l, c, b)) ? 1 : 0
  }
}
var pc = function() {
  function a(a, b) {
    if(Q(b)) {
      var c = oc(b);
      ua(c, nc(a));
      return Q(c)
    }
    return M
  }
  function b(a) {
    return c.g(lc, a)
  }
  var c = l, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.g = a;
  return c
}(), rc = function() {
  function a(a, b, c) {
    for(c = Q(c);;) {
      if(c) {
        b = a.g ? a.g(b, H(c)) : a.call(l, b, H(c));
        if(J(Fb, b)) {
          return D(b)
        }
        c = G(c)
      }else {
        return b
      }
    }
  }
  function b(a, b) {
    var c = Q(b);
    return c ? qc.j(a, H(c), G(c)) : a.J ? a.J() : a.call(l)
  }
  var c = l, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.j = a;
  return c
}(), qc = function() {
  function a(a, b, c) {
    var i;
    i = c ? ((i = c.p & 524288) ? i : c.ec) ? g : c.p ? m : v(db, c) : v(db, c);
    return i ? eb.j(c, a, b) : rc.j(a, b, c)
  }
  function b(a, b) {
    var c;
    c = b ? ((c = b.p & 524288) ? c : b.ec) ? g : b.p ? m : v(db, b) : v(db, b);
    return c ? eb.g(b, a) : rc.g(a, b)
  }
  var c = l, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.j = a;
  return c
}();
function Fb(a) {
  this.q = a;
  this.C = 0;
  this.p = 32768
}
Fb.prototype.Qa = n("q");
Fb;
function sc(a, b) {
  return 0 <= (a - a % b) / b ? Math.floor.h ? Math.floor.h((a - a % b) / b) : Math.floor.call(l, (a - a % b) / b) : Math.ceil.h ? Math.ceil.h((a - a % b) / b) : Math.ceil.call(l, (a - a % b) / b)
}
function tc(a) {
  a -= a >> 1 & 1431655765;
  a = (a & 858993459) + (a >> 2 & 858993459);
  return 16843009 * (a + (a >> 4) & 252645135) >> 24
}
var uc = function() {
  function a(a) {
    return a == l ? "" : a.toString()
  }
  var b = l, c = function() {
    function a(b, d) {
      var j = l;
      t(d) && (j = F(Array.prototype.slice.call(arguments, 1), 0));
      return c.call(this, b, j)
    }
    function c(a, d) {
      return function(a, c) {
        for(;;) {
          if(u(c)) {
            var d = a.append(b.h(H(c))), f = G(c), a = d, c = f
          }else {
            return b.h(a)
          }
        }
      }.call(l, new Ea(b.h(a)), d)
    }
    a.A = 1;
    a.t = function(a) {
      var b = H(a), a = I(a);
      return c(b, a)
    };
    a.k = c;
    return a
  }(), b = function(b, f) {
    switch(arguments.length) {
      case 0:
        return"";
      case 1:
        return a.call(this, b);
      default:
        return c.k(b, F(arguments, 1))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.A = 1;
  b.t = c.t;
  b.J = o("");
  b.h = a;
  b.k = c.k;
  return b
}(), T = function() {
  function a(a) {
    return jc(a) ? a.substring(2, a.length) : ic(a) ? uc.k(":", F([a.substring(2, a.length)], 0)) : a == l ? "" : a.toString()
  }
  var b = l, c = function() {
    function a(b, d) {
      var j = l;
      t(d) && (j = F(Array.prototype.slice.call(arguments, 1), 0));
      return c.call(this, b, j)
    }
    function c(a, d) {
      return function(a, c) {
        for(;;) {
          if(u(c)) {
            var d = a.append(b.h(H(c))), f = G(c), a = d, c = f
          }else {
            return uc.h(a)
          }
        }
      }.call(l, new Ea(b.h(a)), d)
    }
    a.A = 1;
    a.t = function(a) {
      var b = H(a), a = I(a);
      return c(b, a)
    };
    a.k = c;
    return a
  }(), b = function(b, f) {
    switch(arguments.length) {
      case 0:
        return"";
      case 1:
        return a.call(this, b);
      default:
        return c.k(b, F(arguments, 1))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.A = 1;
  b.t = c.t;
  b.J = o("");
  b.h = a;
  b.k = c.k;
  return b
}(), vc = function() {
  var a = l, a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return a.substring(c);
      case 3:
        return a.substring(c, d)
    }
    e("Invalid arity: " + arguments.length)
  };
  a.g = function(a, c) {
    return a.substring(c)
  };
  a.j = function(a, c, d) {
    return a.substring(c, d)
  };
  return a
}(), wc = function() {
  function a(a, b) {
    return c.h(uc.k(a, F(["/", b], 0)))
  }
  function b(a) {
    jc(a) ? a : ic(a) && uc.k("\ufdd1", F(["'", vc.g(a, 2)], 0));
    return uc.k("\ufdd1", F(["'", a], 0))
  }
  var c = l, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.g = a;
  return c
}();
function Kb(a, b) {
  var c;
  c = b ? ((c = b.p & 16777216) ? c : b.vc) ? g : b.p ? m : v(ib, b) : v(ib, b);
  if(c) {
    a: {
      c = Q(a);
      for(var d = Q(b);;) {
        if(c == l) {
          c = d == l;
          break a
        }
        if(d != l && Bb.g(H(c), H(d))) {
          c = G(c), d = G(d)
        }else {
          c = m;
          break a
        }
      }
      c = aa
    }
  }else {
    c = l
  }
  return gc(c)
}
function Hb(a) {
  return qc.j(function(a, c) {
    var d = S.g(c, m);
    return a ^ d + 2654435769 + (a << 6) + (a >> 2)
  }, S.g(H(a), m), G(a))
}
function xc(a) {
  for(var b = 0, a = Q(a);;) {
    if(a) {
      var c = H(a), b = (b + (S.h(Ua(c)) ^ S.h(Va(c)))) % 4503599627370496, a = G(a)
    }else {
      return b
    }
  }
}
function yc(a) {
  for(var b = 0, a = Q(a);;) {
    if(a) {
      var c = H(a), b = (b + S.h(c)) % 4503599627370496, a = G(a)
    }else {
      return b
    }
  }
}
function zc(a, b, c, d, f) {
  this.m = a;
  this.Xa = b;
  this.Ba = c;
  this.count = d;
  this.o = f;
  this.C = 0;
  this.p = 65413358
}
p = zc.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.Da = function() {
  return 1 === this.count ? l : this.Ba
};
p.N = function(a, b) {
  return new zc(this.m, b, a, this.count + 1, l)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = ba();
p.L = n("count");
p.xa = n("Xa");
p.fa = n("Xa");
p.$ = function() {
  return 1 === this.count ? M : this.Ba
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new zc(b, this.Xa, this.Ba, this.count, this.o)
};
p.P = n("m");
p.V = function() {
  return M
};
zc;
function Ac(a) {
  this.m = a;
  this.C = 0;
  this.p = 65413326
}
p = Ac.prototype;
p.H = o(0);
p.Da = o(l);
p.N = function(a, b) {
  return new zc(this.m, b, l, 1, l)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = o(l);
p.L = o(0);
p.xa = o(l);
p.fa = o(l);
p.$ = function() {
  return M
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new Ac(b)
};
p.P = n("m");
p.V = ba();
Ac;
var M = new Ac(l);
function Cc(a) {
  var b;
  b = a ? ((b = a.p & 134217728) ? b : a.uc) ? g : a.p ? m : v(jb, a) : v(jb, a);
  return b ? kb(a) : qc.j(Ob, M, a)
}
var Db = function() {
  function a(a, b, c) {
    return Ob.g(d.g(b, c), a)
  }
  function b(a, b) {
    return Ob.g(d.h(b), a)
  }
  function c(a) {
    return Ob.g(M, a)
  }
  var d = l, f = function() {
    function a(c, d, f, h) {
      var w = l;
      t(h) && (w = F(Array.prototype.slice.call(arguments, 3), 0));
      return b.call(this, c, d, f, w)
    }
    function b(a, c, d, f) {
      return Ob.g(Ob.g(Ob.g(qc.j(Ob, M, Cc(f)), d), c), a)
    }
    a.A = 3;
    a.t = function(a) {
      var c = H(a), d = H(G(a)), f = H(G(G(a))), a = I(G(G(a)));
      return b(c, d, f, a)
    };
    a.k = b;
    return a
  }(), d = function(d, i, j, k) {
    switch(arguments.length) {
      case 0:
        return M;
      case 1:
        return c.call(this, d);
      case 2:
        return b.call(this, d, i);
      case 3:
        return a.call(this, d, i, j);
      default:
        return f.k(d, i, j, F(arguments, 3))
    }
    e("Invalid arity: " + arguments.length)
  };
  d.A = 3;
  d.t = f.t;
  d.J = function() {
    return M
  };
  d.h = c;
  d.g = b;
  d.j = a;
  d.k = f.k;
  return d
}();
function Dc(a, b, c, d) {
  this.m = a;
  this.Xa = b;
  this.Ba = c;
  this.o = d;
  this.C = 0;
  this.p = 65405164
}
p = Dc.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.Da = function() {
  return this.Ba == l ? l : hb(this.Ba)
};
p.N = function(a, b) {
  return new Dc(l, b, a, this.o)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = ba();
p.fa = n("Xa");
p.$ = function() {
  return this.Ba == l ? M : this.Ba
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new Dc(b, this.Xa, this.Ba, this.o)
};
p.P = n("m");
p.V = function() {
  return cb(M, this.m)
};
Dc;
function L(a, b) {
  var c = b == l;
  c || (c = b ? ((c = b.p & 64) ? c : b.tb) ? g : b.p ? m : v(Ma, b) : v(Ma, b));
  return c ? new Dc(l, a, b, l) : new Dc(l, a, Q(b), l)
}
db.string = g;
eb.string = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return K.g(a, c);
      case 3:
        return K.j(a, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
B.string = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return y.g(a, c);
      case 3:
        return y.j(a, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Ka.string = g;
y.string = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return c < Ha(a) ? a.charAt(c) : l;
      case 3:
        return c < Ha(a) ? a.charAt(c) : d
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Ga.string = g;
Ha.string = function(a) {
  return a.length
};
hb.string = function(a) {
  return Lb.g(a, 0)
};
gb.string = function(a) {
  return na(a)
};
function Ec(a) {
  this.Kb = a;
  this.C = 0;
  this.p = 1
}
Ec.prototype.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        var f;
        c == l ? f = l : (f = c.Ja, f = f == l ? B.j(c, this.Kb, l) : f[this.Kb]);
        return f;
      case 3:
        return c == l ? d : B.j(c, this.Kb, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Ec.prototype.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
Ec;
String.prototype.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return B.j(c, this.toString(), l);
      case 3:
        return B.j(c, this.toString(), d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
String.prototype.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
String.prototype.apply = function(a, b) {
  return 2 > R(b) ? B.j(b[0], a, l) : B.j(b[0], a, b[1])
};
function Fc(a) {
  var b = a.x;
  if(a.Nb) {
    return b
  }
  a.x = b.J ? b.J() : b.call(l);
  a.Nb = g;
  return a.x
}
function U(a, b, c, d) {
  this.m = a;
  this.Nb = b;
  this.x = c;
  this.o = d;
  this.C = 0;
  this.p = 31850700
}
p = U.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.Da = function(a) {
  return hb(a.$(a))
};
p.N = function(a, b) {
  return L(b, a)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = function(a) {
  return Q(Fc(a))
};
p.fa = function(a) {
  return H(Fc(a))
};
p.$ = function(a) {
  return I(Fc(a))
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new U(b, this.Nb, this.x, this.o)
};
p.P = n("m");
p.V = function() {
  return cb(M, this.m)
};
U;
function Gc(a, b) {
  this.nb = a;
  this.end = b;
  this.C = 0;
  this.p = 2
}
Gc.prototype.L = n("end");
Gc.prototype.add = function(a) {
  this.nb[this.end] = a;
  return this.end += 1
};
Gc.prototype.Ka = function() {
  var a = new Hc(this.nb, 0, this.end);
  this.nb = l;
  return a
};
Gc;
function Hc(a, b, c) {
  this.l = a;
  this.Z = b;
  this.end = c;
  this.C = 0;
  this.p = 524306
}
p = Hc.prototype;
p.va = function(a, b) {
  return K.D(a, b, this.l[this.Z], this.Z + 1)
};
p.wa = function(a, b, c) {
  return K.D(a, b, c, this.Z)
};
p.Ub = function() {
  this.Z === this.end && e(Error("-drop-first of empty chunk"));
  return new Hc(this.l, this.Z + 1, this.end)
};
p.ea = function(a, b) {
  return this.l[this.Z + b]
};
p.W = function(a, b, c) {
  return((a = 0 <= b) ? b < this.end - this.Z : a) ? this.l[this.Z + b] : c
};
p.L = function() {
  return this.end - this.Z
};
Hc;
var Ic = function() {
  function a(a, b, c) {
    return new Hc(a, b, c)
  }
  function b(a, b) {
    return d.j(a, b, a.length)
  }
  function c(a) {
    return d.j(a, 0, a.length)
  }
  var d = l, d = function(d, h, i) {
    switch(arguments.length) {
      case 1:
        return c.call(this, d);
      case 2:
        return b.call(this, d, h);
      case 3:
        return a.call(this, d, h, i)
    }
    e("Invalid arity: " + arguments.length)
  };
  d.h = c;
  d.g = b;
  d.j = a;
  return d
}();
function Jc(a, b, c) {
  this.Ka = a;
  this.Ga = b;
  this.m = c;
  this.C = 0;
  this.p = 27656296
}
p = Jc.prototype;
p.N = function(a, b) {
  return L(b, a)
};
p.G = ba();
p.fa = function() {
  return y.g(this.Ka, 0)
};
p.$ = function() {
  return 1 < Ha(this.Ka) ? new Jc(xb(this.Ka), this.Ga, this.m) : this.Ga == l ? M : this.Ga
};
p.Vb = function() {
  return this.Ga == l ? l : this.Ga
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new Jc(this.Ka, this.Ga, b)
};
p.P = n("m");
p.Wb = g;
p.sb = n("Ka");
p.jb = function() {
  return this.Ga == l ? M : this.Ga
};
Jc;
function Kc(a, b) {
  return 0 === Ha(a) ? b : new Jc(a, b, l)
}
function oc(a) {
  for(var b = [];;) {
    if(Q(a)) {
      b.push(H(a)), a = G(a)
    }else {
      return b
    }
  }
}
function Lc(a, b) {
  if(Jb(a)) {
    return R(a)
  }
  for(var c = a, d = b, f = 0;;) {
    var h;
    h = (h = 0 < d) ? Q(c) : h;
    if(u(h)) {
      c = G(c), d -= 1, f += 1
    }else {
      return f
    }
  }
}
var Nc = function Mc(b) {
  return b == l ? l : G(b) == l ? Q(H(b)) : L(H(b), Mc(G(b)))
}, Oc = function() {
  function a(a, b) {
    return new U(l, m, function() {
      var c = Q(a);
      return c ? bc(c) ? Kc(zb(c), d.g(Ab(c), b)) : L(H(c), d.g(I(c), b)) : b
    }, l)
  }
  function b(a) {
    return new U(l, m, function() {
      return a
    }, l)
  }
  function c() {
    return new U(l, m, o(l), l)
  }
  var d = l, f = function() {
    function a(c, d, f) {
      var h = l;
      t(f) && (h = F(Array.prototype.slice.call(arguments, 2), 0));
      return b.call(this, c, d, h)
    }
    function b(a, c, f) {
      var h = function C(a, b) {
        return new U(l, m, function() {
          var c = Q(a);
          return c ? bc(c) ? Kc(zb(c), C(Ab(c), b)) : L(H(c), C(I(c), b)) : u(b) ? C(H(b), G(b)) : l
        }, l)
      };
      return h.g ? h.g(d.g(a, c), f) : h.call(l, d.g(a, c), f)
    }
    a.A = 2;
    a.t = function(a) {
      var c = H(a), d = H(G(a)), a = I(G(a));
      return b(c, d, a)
    };
    a.k = b;
    return a
  }(), d = function(d, i, j) {
    switch(arguments.length) {
      case 0:
        return c.call(this);
      case 1:
        return b.call(this, d);
      case 2:
        return a.call(this, d, i);
      default:
        return f.k(d, i, F(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  d.A = 2;
  d.t = f.t;
  d.J = c;
  d.h = b;
  d.g = a;
  d.k = f.k;
  return d
}(), Pc = function() {
  function a(a, b, c, d) {
    return L(a, L(b, L(c, d)))
  }
  function b(a, b, c) {
    return L(a, L(b, c))
  }
  var c = l, d = function() {
    function a(c, d, f, q, s) {
      var w = l;
      t(s) && (w = F(Array.prototype.slice.call(arguments, 4), 0));
      return b.call(this, c, d, f, q, w)
    }
    function b(a, c, d, f, h) {
      return L(a, L(c, L(d, L(f, Nc(h)))))
    }
    a.A = 4;
    a.t = function(a) {
      var c = H(a), d = H(G(a)), f = H(G(G(a))), s = H(G(G(G(a)))), a = I(G(G(G(a))));
      return b(c, d, f, s, a)
    };
    a.k = b;
    return a
  }(), c = function(c, h, i, j, k) {
    switch(arguments.length) {
      case 1:
        return Q(c);
      case 2:
        return L(c, h);
      case 3:
        return b.call(this, c, h, i);
      case 4:
        return a.call(this, c, h, i, j);
      default:
        return d.k(c, h, i, j, F(arguments, 4))
    }
    e("Invalid arity: " + arguments.length)
  };
  c.A = 4;
  c.t = d.t;
  c.h = function(a) {
    return Q(a)
  };
  c.g = function(a, b) {
    return L(a, b)
  };
  c.j = b;
  c.D = a;
  c.k = d.k;
  return c
}();
function Qc(a) {
  return rb(a)
}
function Rc(a) {
  return tb(a)
}
function Sc(a, b, c) {
  return ub(a, b, c)
}
function Tc(a, b, c) {
  var d = Q(c);
  if(0 === b) {
    return a.J ? a.J() : a.call(l)
  }
  var c = z(d), f = A(d);
  if(1 === b) {
    return a.h ? a.h(c) : a.h ? a.h(c) : a.call(l, c)
  }
  var d = z(f), h = A(f);
  if(2 === b) {
    return a.g ? a.g(c, d) : a.g ? a.g(c, d) : a.call(l, c, d)
  }
  var f = z(h), i = A(h);
  if(3 === b) {
    return a.j ? a.j(c, d, f) : a.j ? a.j(c, d, f) : a.call(l, c, d, f)
  }
  var h = z(i), j = A(i);
  if(4 === b) {
    return a.D ? a.D(c, d, f, h) : a.D ? a.D(c, d, f, h) : a.call(l, c, d, f, h)
  }
  i = z(j);
  j = A(j);
  if(5 === b) {
    return a.Y ? a.Y(c, d, f, h, i) : a.Y ? a.Y(c, d, f, h, i) : a.call(l, c, d, f, h, i)
  }
  var a = z(j), k = A(j);
  if(6 === b) {
    return a.Ea ? a.Ea(c, d, f, h, i, a) : a.Ea ? a.Ea(c, d, f, h, i, a) : a.call(l, c, d, f, h, i, a)
  }
  var j = z(k), q = A(k);
  if(7 === b) {
    return a.bb ? a.bb(c, d, f, h, i, a, j) : a.bb ? a.bb(c, d, f, h, i, a, j) : a.call(l, c, d, f, h, i, a, j)
  }
  var k = z(q), s = A(q);
  if(8 === b) {
    return a.Hb ? a.Hb(c, d, f, h, i, a, j, k) : a.Hb ? a.Hb(c, d, f, h, i, a, j, k) : a.call(l, c, d, f, h, i, a, j, k)
  }
  var q = z(s), w = A(s);
  if(9 === b) {
    return a.Ib ? a.Ib(c, d, f, h, i, a, j, k, q) : a.Ib ? a.Ib(c, d, f, h, i, a, j, k, q) : a.call(l, c, d, f, h, i, a, j, k, q)
  }
  var s = z(w), C = A(w);
  if(10 === b) {
    return a.wb ? a.wb(c, d, f, h, i, a, j, k, q, s) : a.wb ? a.wb(c, d, f, h, i, a, j, k, q, s) : a.call(l, c, d, f, h, i, a, j, k, q, s)
  }
  var w = z(C), P = A(C);
  if(11 === b) {
    return a.xb ? a.xb(c, d, f, h, i, a, j, k, q, s, w) : a.xb ? a.xb(c, d, f, h, i, a, j, k, q, s, w) : a.call(l, c, d, f, h, i, a, j, k, q, s, w)
  }
  var C = z(P), N = A(P);
  if(12 === b) {
    return a.yb ? a.yb(c, d, f, h, i, a, j, k, q, s, w, C) : a.yb ? a.yb(c, d, f, h, i, a, j, k, q, s, w, C) : a.call(l, c, d, f, h, i, a, j, k, q, s, w, C)
  }
  var P = z(N), ca = A(N);
  if(13 === b) {
    return a.zb ? a.zb(c, d, f, h, i, a, j, k, q, s, w, C, P) : a.zb ? a.zb(c, d, f, h, i, a, j, k, q, s, w, C, P) : a.call(l, c, d, f, h, i, a, j, k, q, s, w, C, P)
  }
  var N = z(ca), ia = A(ca);
  if(14 === b) {
    return a.Ab ? a.Ab(c, d, f, h, i, a, j, k, q, s, w, C, P, N) : a.Ab ? a.Ab(c, d, f, h, i, a, j, k, q, s, w, C, P, N) : a.call(l, c, d, f, h, i, a, j, k, q, s, w, C, P, N)
  }
  var ca = z(ia), ra = A(ia);
  if(15 === b) {
    return a.Bb ? a.Bb(c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca) : a.Bb ? a.Bb(c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca) : a.call(l, c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca)
  }
  var ia = z(ra), Da = A(ra);
  if(16 === b) {
    return a.Cb ? a.Cb(c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia) : a.Cb ? a.Cb(c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia) : a.call(l, c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia)
  }
  var ra = z(Da), Za = A(Da);
  if(17 === b) {
    return a.Db ? a.Db(c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia, ra) : a.Db ? a.Db(c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia, ra) : a.call(l, c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia, ra)
  }
  var Da = z(Za), Bc = A(Za);
  if(18 === b) {
    return a.Eb ? a.Eb(c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia, ra, Da) : a.Eb ? a.Eb(c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia, ra, Da) : a.call(l, c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia, ra, Da)
  }
  Za = z(Bc);
  Bc = A(Bc);
  if(19 === b) {
    return a.Fb ? a.Fb(c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia, ra, Da, Za) : a.Fb ? a.Fb(c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia, ra, Da, Za) : a.call(l, c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia, ra, Da, Za)
  }
  var Id = z(Bc);
  A(Bc);
  if(20 === b) {
    return a.Gb ? a.Gb(c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia, ra, Da, Za, Id) : a.Gb ? a.Gb(c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia, ra, Da, Za, Id) : a.call(l, c, d, f, h, i, a, j, k, q, s, w, C, P, N, ca, ia, ra, Da, Za, Id)
  }
  e(Error("Only up to 20 arguments supported on functions"))
}
var Uc = function() {
  function a(a, b, c, d, f) {
    b = Pc.D(b, c, d, f);
    c = a.A;
    return u(a.t) ? (d = Lc(b, c + 1), d <= c ? Tc(a, d, b) : a.t(b)) : a.apply(a, oc(b))
  }
  function b(a, b, c, d) {
    b = Pc.j(b, c, d);
    c = a.A;
    return u(a.t) ? (d = Lc(b, c + 1), d <= c ? Tc(a, d, b) : a.t(b)) : a.apply(a, oc(b))
  }
  function c(a, b, c) {
    b = Pc.g(b, c);
    c = a.A;
    if(u(a.t)) {
      var d = Lc(b, c + 1);
      return d <= c ? Tc(a, d, b) : a.t(b)
    }
    return a.apply(a, oc(b))
  }
  function d(a, b) {
    var c = a.A;
    if(u(a.t)) {
      var d = Lc(b, c + 1);
      return d <= c ? Tc(a, d, b) : a.t(b)
    }
    return a.apply(a, oc(b))
  }
  var f = l, h = function() {
    function a(c, d, f, h, i, P) {
      var N = l;
      t(P) && (N = F(Array.prototype.slice.call(arguments, 5), 0));
      return b.call(this, c, d, f, h, i, N)
    }
    function b(a, c, d, f, h, i) {
      c = L(c, L(d, L(f, L(h, Nc(i)))));
      d = a.A;
      return u(a.t) ? (f = Lc(c, d + 1), f <= d ? Tc(a, f, c) : a.t(c)) : a.apply(a, oc(c))
    }
    a.A = 5;
    a.t = function(a) {
      var c = H(a), d = H(G(a)), f = H(G(G(a))), h = H(G(G(G(a)))), i = H(G(G(G(G(a))))), a = I(G(G(G(G(a)))));
      return b(c, d, f, h, i, a)
    };
    a.k = b;
    return a
  }(), f = function(f, j, k, q, s, w) {
    switch(arguments.length) {
      case 2:
        return d.call(this, f, j);
      case 3:
        return c.call(this, f, j, k);
      case 4:
        return b.call(this, f, j, k, q);
      case 5:
        return a.call(this, f, j, k, q, s);
      default:
        return h.k(f, j, k, q, s, F(arguments, 5))
    }
    e("Invalid arity: " + arguments.length)
  };
  f.A = 5;
  f.t = h.t;
  f.g = d;
  f.j = c;
  f.D = b;
  f.Y = a;
  f.k = h.k;
  return f
}(), Vc = function() {
  function a(a, b) {
    return!Bb.g(a, b)
  }
  function b() {
    return m
  }
  var c = l, d = function() {
    function a(c, d, f) {
      var q = l;
      t(f) && (q = F(Array.prototype.slice.call(arguments, 2), 0));
      return b.call(this, c, d, q)
    }
    function b(a, c, d) {
      return Nb(Uc.D(Bb, a, c, d))
    }
    a.A = 2;
    a.t = function(a) {
      var c = H(a), d = H(G(a)), a = I(G(a));
      return b(c, d, a)
    };
    a.k = b;
    return a
  }(), c = function(c, h, i) {
    switch(arguments.length) {
      case 1:
        return b.call(this);
      case 2:
        return a.call(this, c, h);
      default:
        return d.k(c, h, F(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  c.A = 2;
  c.t = d.t;
  c.h = b;
  c.g = a;
  c.k = d.k;
  return c
}();
function Wc(a) {
  return Q(a) ? a : l
}
function Xc(a, b) {
  for(;;) {
    if(Q(b) == l) {
      return g
    }
    if(u(a.h ? a.h(H(b)) : a.call(l, H(b)))) {
      var c = a, d = G(b), a = c, b = d
    }else {
      return m
    }
  }
}
function Yc(a) {
  for(var b = Zc;;) {
    if(Q(a)) {
      var c = b.h ? b.h(H(a)) : b.call(l, H(a));
      if(u(c)) {
        return c
      }
      a = G(a)
    }else {
      return l
    }
  }
}
function Zc(a) {
  return a
}
var $c = function() {
  function a(a, b, c) {
    return function() {
      var d = l, k = function() {
        function d(a, b, c, f) {
          var h = l;
          t(f) && (h = F(Array.prototype.slice.call(arguments, 3), 0));
          return j.call(this, a, b, c, h)
        }
        function j(d, k, q, s) {
          return a.h ? a.h(b.h ? b.h(Uc.Y(c, d, k, q, s)) : b.call(l, Uc.Y(c, d, k, q, s))) : a.call(l, b.h ? b.h(Uc.Y(c, d, k, q, s)) : b.call(l, Uc.Y(c, d, k, q, s)))
        }
        d.A = 3;
        d.t = function(a) {
          var b = H(a), c = H(G(a)), d = H(G(G(a))), a = I(G(G(a)));
          return j(b, c, d, a)
        };
        d.k = j;
        return d
      }(), d = function(d, j, w, C) {
        switch(arguments.length) {
          case 0:
            return a.h ? a.h(b.h ? b.h(c.J ? c.J() : c.call(l)) : b.call(l, c.J ? c.J() : c.call(l))) : a.call(l, b.h ? b.h(c.J ? c.J() : c.call(l)) : b.call(l, c.J ? c.J() : c.call(l)));
          case 1:
            return a.h ? a.h(b.h ? b.h(c.h ? c.h(d) : c.call(l, d)) : b.call(l, c.h ? c.h(d) : c.call(l, d))) : a.call(l, b.h ? b.h(c.h ? c.h(d) : c.call(l, d)) : b.call(l, c.h ? c.h(d) : c.call(l, d)));
          case 2:
            return a.h ? a.h(b.h ? b.h(c.g ? c.g(d, j) : c.call(l, d, j)) : b.call(l, c.g ? c.g(d, j) : c.call(l, d, j))) : a.call(l, b.h ? b.h(c.g ? c.g(d, j) : c.call(l, d, j)) : b.call(l, c.g ? c.g(d, j) : c.call(l, d, j)));
          case 3:
            return a.h ? a.h(b.h ? b.h(c.j ? c.j(d, j, w) : c.call(l, d, j, w)) : b.call(l, c.j ? c.j(d, j, w) : c.call(l, d, j, w))) : a.call(l, b.h ? b.h(c.j ? c.j(d, j, w) : c.call(l, d, j, w)) : b.call(l, c.j ? c.j(d, j, w) : c.call(l, d, j, w)));
          default:
            return k.k(d, j, w, F(arguments, 3))
        }
        e("Invalid arity: " + arguments.length)
      };
      d.A = 3;
      d.t = k.t;
      return d
    }()
  }
  function b(a, b) {
    return function() {
      var c = l, d = function() {
        function c(a, b, f, h) {
          var i = l;
          t(h) && (i = F(Array.prototype.slice.call(arguments, 3), 0));
          return d.call(this, a, b, f, i)
        }
        function d(c, i, j, k) {
          return a.h ? a.h(Uc.Y(b, c, i, j, k)) : a.call(l, Uc.Y(b, c, i, j, k))
        }
        c.A = 3;
        c.t = function(a) {
          var b = H(a), c = H(G(a)), f = H(G(G(a))), a = I(G(G(a)));
          return d(b, c, f, a)
        };
        c.k = d;
        return c
      }(), c = function(c, i, s, w) {
        switch(arguments.length) {
          case 0:
            return a.h ? a.h(b.J ? b.J() : b.call(l)) : a.call(l, b.J ? b.J() : b.call(l));
          case 1:
            return a.h ? a.h(b.h ? b.h(c) : b.call(l, c)) : a.call(l, b.h ? b.h(c) : b.call(l, c));
          case 2:
            return a.h ? a.h(b.g ? b.g(c, i) : b.call(l, c, i)) : a.call(l, b.g ? b.g(c, i) : b.call(l, c, i));
          case 3:
            return a.h ? a.h(b.j ? b.j(c, i, s) : b.call(l, c, i, s)) : a.call(l, b.j ? b.j(c, i, s) : b.call(l, c, i, s));
          default:
            return d.k(c, i, s, F(arguments, 3))
        }
        e("Invalid arity: " + arguments.length)
      };
      c.A = 3;
      c.t = d.t;
      return c
    }()
  }
  var c = l, d = function() {
    function a(c, d, f, q) {
      var s = l;
      t(q) && (s = F(Array.prototype.slice.call(arguments, 3), 0));
      return b.call(this, c, d, f, s)
    }
    function b(a, c, d, f) {
      var h = Cc(Pc.D(a, c, d, f));
      return function() {
        function a(c) {
          var d = l;
          t(c) && (d = F(Array.prototype.slice.call(arguments, 0), 0));
          return b.call(this, d)
        }
        function b(a) {
          for(var a = Uc.g(H(h), a), c = G(h);;) {
            if(c) {
              a = H(c).call(l, a), c = G(c)
            }else {
              return a
            }
          }
        }
        a.A = 0;
        a.t = function(a) {
          a = Q(a);
          return b(a)
        };
        a.k = b;
        return a
      }()
    }
    a.A = 3;
    a.t = function(a) {
      var c = H(a), d = H(G(a)), f = H(G(G(a))), a = I(G(G(a)));
      return b(c, d, f, a)
    };
    a.k = b;
    return a
  }(), c = function(c, h, i, j) {
    switch(arguments.length) {
      case 0:
        return Zc;
      case 1:
        return c;
      case 2:
        return b.call(this, c, h);
      case 3:
        return a.call(this, c, h, i);
      default:
        return d.k(c, h, i, F(arguments, 3))
    }
    e("Invalid arity: " + arguments.length)
  };
  c.A = 3;
  c.t = d.t;
  c.J = function() {
    return Zc
  };
  c.h = ba();
  c.g = b;
  c.j = a;
  c.k = d.k;
  return c
}(), ad = function() {
  function a(a, b, c, f) {
    return new U(l, m, function() {
      var q = Q(b), s = Q(c), w = Q(f);
      return(q ? s ? w : s : q) ? L(a.j ? a.j(H(q), H(s), H(w)) : a.call(l, H(q), H(s), H(w)), d.D(a, I(q), I(s), I(w))) : l
    }, l)
  }
  function b(a, b, c) {
    return new U(l, m, function() {
      var f = Q(b), q = Q(c);
      return(f ? q : f) ? L(a.g ? a.g(H(f), H(q)) : a.call(l, H(f), H(q)), d.j(a, I(f), I(q))) : l
    }, l)
  }
  function c(a, b) {
    return new U(l, m, function() {
      var c = Q(b);
      if(c) {
        if(bc(c)) {
          for(var f = zb(c), q = R(f), s = new Gc(Fa.h(q), 0), w = 0;;) {
            if(w < q) {
              var C = a.h ? a.h(y.g(f, w)) : a.call(l, y.g(f, w));
              s.add(C);
              w += 1
            }else {
              break
            }
          }
          return Kc(s.Ka(), d.g(a, Ab(c)))
        }
        return L(a.h ? a.h(H(c)) : a.call(l, H(c)), d.g(a, I(c)))
      }
      return l
    }, l)
  }
  var d = l, f = function() {
    function a(c, d, f, h, w) {
      var C = l;
      t(w) && (C = F(Array.prototype.slice.call(arguments, 4), 0));
      return b.call(this, c, d, f, h, C)
    }
    function b(a, c, f, h, i) {
      var C = function N(a) {
        return new U(l, m, function() {
          var b = d.g(Q, a);
          return Xc(Zc, b) ? L(d.g(H, b), N(d.g(I, b))) : l
        }, l)
      };
      return d.g(function(b) {
        return Uc.g(a, b)
      }, C.h ? C.h(Ob.k(i, h, F([f, c], 0))) : C.call(l, Ob.k(i, h, F([f, c], 0))))
    }
    a.A = 4;
    a.t = function(a) {
      var c = H(a), d = H(G(a)), f = H(G(G(a))), h = H(G(G(G(a)))), a = I(G(G(G(a))));
      return b(c, d, f, h, a)
    };
    a.k = b;
    return a
  }(), d = function(d, i, j, k, q) {
    switch(arguments.length) {
      case 2:
        return c.call(this, d, i);
      case 3:
        return b.call(this, d, i, j);
      case 4:
        return a.call(this, d, i, j, k);
      default:
        return f.k(d, i, j, k, F(arguments, 4))
    }
    e("Invalid arity: " + arguments.length)
  };
  d.A = 4;
  d.t = f.t;
  d.g = c;
  d.j = b;
  d.D = a;
  d.k = f.k;
  return d
}(), cd = function bd(b, c) {
  return new U(l, m, function() {
    if(0 < b) {
      var d = Q(c);
      return d ? L(H(d), bd(b - 1, I(d))) : l
    }
    return l
  }, l)
};
function dd(a, b) {
  function c(a, b) {
    for(;;) {
      var c = Q(b), i = 0 < a;
      if(u(i ? c : i)) {
        i = a - 1, c = I(c), a = i, b = c
      }else {
        return c
      }
    }
  }
  return new U(l, m, function() {
    return c.g ? c.g(a, b) : c.call(l, a, b)
  }, l)
}
var ed = function() {
  function a(a, b) {
    return cd(a, c.h(b))
  }
  function b(a) {
    return new U(l, m, function() {
      return L(a, c.h(a))
    }, l)
  }
  var c = l, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.g = a;
  return c
}(), fd = function() {
  function a(a, c) {
    return new U(l, m, function() {
      var h = Q(a), i = Q(c);
      return(h ? i : h) ? L(H(h), L(H(i), b.g(I(h), I(i)))) : l
    }, l)
  }
  var b = l, c = function() {
    function a(b, d, j) {
      var k = l;
      t(j) && (k = F(Array.prototype.slice.call(arguments, 2), 0));
      return c.call(this, b, d, k)
    }
    function c(a, d, f) {
      return new U(l, m, function() {
        var c = ad.g(Q, Ob.k(f, d, F([a], 0)));
        return Xc(Zc, c) ? Oc.g(ad.g(H, c), Uc.g(b, ad.g(I, c))) : l
      }, l)
    }
    a.A = 2;
    a.t = function(a) {
      var b = H(a), d = H(G(a)), a = I(G(a));
      return c(b, d, a)
    };
    a.k = c;
    return a
  }(), b = function(b, f, h) {
    switch(arguments.length) {
      case 2:
        return a.call(this, b, f);
      default:
        return c.k(b, f, F(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.A = 2;
  b.t = c.t;
  b.g = a;
  b.k = c.k;
  return b
}();
function gd(a, b) {
  return dd(1, fd.g(ed.h(a), b))
}
function hd(a) {
  var b = function d(a, b) {
    return new U(l, m, function() {
      var i = Q(a);
      return i ? L(H(i), d(I(i), b)) : Q(b) ? d(H(b), I(b)) : l
    }, l)
  };
  return b.g ? b.g(l, a) : b.call(l, l, a)
}
var id = function() {
  function a(a, b) {
    return hd(ad.g(a, b))
  }
  var b = l, c = function() {
    function a(c, d, j) {
      var k = l;
      t(j) && (k = F(Array.prototype.slice.call(arguments, 2), 0));
      return b.call(this, c, d, k)
    }
    function b(a, c, d) {
      return hd(Uc.D(ad, a, c, d))
    }
    a.A = 2;
    a.t = function(a) {
      var c = H(a), d = H(G(a)), a = I(G(a));
      return b(c, d, a)
    };
    a.k = b;
    return a
  }(), b = function(b, f, h) {
    switch(arguments.length) {
      case 2:
        return a.call(this, b, f);
      default:
        return c.k(b, f, F(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.A = 2;
  b.t = c.t;
  b.g = a;
  b.k = c.k;
  return b
}();
function jd(a, b) {
  var c;
  c = a ? ((c = a.C & 1) ? c : a.rc) ? g : a.C ? m : v(qb, a) : v(qb, a);
  return c ? Rc(qc.j(sb, rb(a), b)) : qc.j(Ja, a, b)
}
var kd = function() {
  function a(a, b, c, j) {
    return new U(l, m, function() {
      var k = Q(j);
      if(k) {
        var q = cd(a, k);
        return a === R(q) ? L(q, d.D(a, b, c, dd(b, k))) : Db.h(cd(a, Oc.g(q, c)))
      }
      return l
    }, l)
  }
  function b(a, b, c) {
    return new U(l, m, function() {
      var j = Q(c);
      if(j) {
        var k = cd(a, j);
        return a === R(k) ? L(k, d.j(a, b, dd(b, j))) : l
      }
      return l
    }, l)
  }
  function c(a, b) {
    return d.j(a, a, b)
  }
  var d = l, d = function(d, h, i, j) {
    switch(arguments.length) {
      case 2:
        return c.call(this, d, h);
      case 3:
        return b.call(this, d, h, i);
      case 4:
        return a.call(this, d, h, i, j)
    }
    e("Invalid arity: " + arguments.length)
  };
  d.g = c;
  d.j = b;
  d.D = a;
  return d
}();
function ld(a, b, c) {
  this.m = a;
  this.da = b;
  this.o = c;
  this.C = 0;
  this.p = 32400159
}
p = ld.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.I = function(a, b) {
  return a.W(a, b, l)
};
p.B = function(a, b, c) {
  return a.W(a, b, c)
};
p.R = function(a, b, c) {
  a = this.da.slice();
  a[b] = c;
  return new ld(this.m, a, l)
};
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  var c = this.da.slice();
  c.push(b);
  return new ld(this.m, c, l)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.va = function(a, b) {
  return K.g(this.da, b)
};
p.wa = function(a, b, c) {
  return K.j(this.da, b, c)
};
p.G = function() {
  var a = this;
  if(0 < a.da.length) {
    var b = function d(b) {
      return new U(l, m, function() {
        return b < a.da.length ? L(a.da[b], d(b + 1)) : l
      }, l)
    };
    return b.h ? b.h(0) : b.call(l, 0)
  }
  return l
};
p.L = function() {
  return this.da.length
};
p.xa = function() {
  var a = this.da.length;
  return 0 < a ? this.da[a - 1] : l
};
p.Ua = function(a, b, c) {
  return a.R(a, b, c)
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new ld(b, this.da, this.o)
};
p.P = n("m");
p.ea = function(a, b) {
  var c = 0 <= b;
  return(c ? b < this.da.length : c) ? this.da[b] : l
};
p.W = function(a, b, c) {
  return((a = 0 <= b) ? b < this.da.length : a) ? this.da[b] : c
};
p.V = function() {
  return cb(md, this.m)
};
ld;
var md = new ld(l, [], 0);
function nd(a, b) {
  this.O = a;
  this.l = b
}
nd;
function od(a) {
  a = a.n;
  return 32 > a ? 0 : a - 1 >>> 5 << 5
}
function pd(a, b, c) {
  for(;;) {
    if(0 === b) {
      return c
    }
    var d = new nd(a, Fa.h(32));
    d.l[0] = c;
    c = d;
    b -= 5
  }
}
var rd = function qd(b, c, d, f) {
  var h = new nd(d.O, d.l.slice()), i = b.n - 1 >>> c & 31;
  5 === c ? h.l[i] = f : (d = d.l[i], b = d != l ? qd(b, c - 5, d, f) : pd(l, c - 5, f), h.l[i] = b);
  return h
};
function sd(a, b) {
  var c = 0 <= b;
  if(c ? b < a.n : c) {
    if(b >= od(a)) {
      return a.ja
    }
    for(var c = a.root, d = a.shift;;) {
      if(0 < d) {
        var f = d - 5, c = c.l[b >>> d & 31], d = f
      }else {
        return c.l
      }
    }
  }else {
    e(Error([T("No item "), T(b), T(" in vector of length "), T(a.n)].join("")))
  }
}
var ud = function td(b, c, d, f, h) {
  var i = new nd(d.O, d.l.slice());
  if(0 === c) {
    i.l[f & 31] = h
  }else {
    var j = f >>> c & 31, b = td(b, c - 5, d.l[j], f, h);
    i.l[j] = b
  }
  return i
};
function vd(a, b, c, d, f, h) {
  this.m = a;
  this.n = b;
  this.shift = c;
  this.root = d;
  this.ja = f;
  this.o = h;
  this.C = 1;
  this.p = 167668511
}
p = vd.prototype;
p.Ra = function() {
  var a = this.n, b = this.shift, c = new nd({}, this.root.l.slice()), d = this.ja, f = Fa.h(32);
  dc(d, 0, f, 0, d.length);
  return new wd(a, b, c, f)
};
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.I = function(a, b) {
  return a.W(a, b, l)
};
p.B = function(a, b, c) {
  return a.W(a, b, c)
};
p.R = function(a, b, c) {
  var d = 0 <= b;
  if(d ? b < this.n : d) {
    return od(a) <= b ? (a = this.ja.slice(), a[b & 31] = c, new vd(this.m, this.n, this.shift, this.root, a, l)) : new vd(this.m, this.n, this.shift, ud(a, this.shift, this.root, b, c), this.ja, l)
  }
  if(b === this.n) {
    return a.N(a, c)
  }
  e(Error([T("Index "), T(b), T(" out of bounds  [0,"), T(this.n), T("]")].join("")))
};
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  if(32 > this.n - od(a)) {
    var c = this.ja.slice();
    c.push(b);
    return new vd(this.m, this.n + 1, this.shift, this.root, c, l)
  }
  var d = this.n >>> 5 > 1 << this.shift, c = d ? this.shift + 5 : this.shift;
  if(d) {
    d = new nd(l, Fa.h(32));
    d.l[0] = this.root;
    var f = pd(l, this.shift, new nd(l, this.ja));
    d.l[1] = f
  }else {
    d = rd(a, this.shift, this.root, new nd(l, this.ja))
  }
  return new vd(this.m, this.n + 1, c, d, [b], l)
};
p.$a = function(a) {
  return 0 < this.n ? new Ib(a, this.n - 1, l) : M
};
p.kb = function(a) {
  return a.ea(a, 0)
};
p.lb = function(a) {
  return a.ea(a, 1)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.va = function(a, b) {
  return K.g(a, b)
};
p.wa = function(a, b, c) {
  return K.j(a, b, c)
};
p.G = function(a) {
  return 0 === this.n ? l : xd.j(a, 0, 0)
};
p.L = n("n");
p.xa = function(a) {
  return 0 < this.n ? a.ea(a, this.n - 1) : l
};
p.Ua = function(a, b, c) {
  return a.R(a, b, c)
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new vd(b, this.n, this.shift, this.root, this.ja, this.o)
};
p.P = n("m");
p.ea = function(a, b) {
  return sd(a, b)[b & 31]
};
p.W = function(a, b, c) {
  var d = 0 <= b;
  return(d ? b < this.n : d) ? a.ea(a, b) : c
};
p.V = function() {
  return cb(yd, this.m)
};
vd;
var zd = new nd(l, Fa.h(32)), yd = new vd(l, 0, 5, zd, [], 0);
function V(a) {
  var b = a.length;
  if(32 > b) {
    return new vd(l, b, 5, zd, a, l)
  }
  for(var c = a.slice(0, 32), d = 32, f = rb(new vd(l, 32, 5, zd, c, l));;) {
    if(d < b) {
      c = d + 1, f = sb(f, a[d]), d = c
    }else {
      return tb(f)
    }
  }
}
function Ad(a) {
  return tb(qc.j(sb, rb(yd), a))
}
var W = function() {
  function a(a) {
    var c = l;
    t(a) && (c = F(Array.prototype.slice.call(arguments, 0), 0));
    return Ad(c)
  }
  a.A = 0;
  a.t = function(a) {
    a = Q(a);
    return Ad(a)
  };
  a.k = function(a) {
    return Ad(a)
  };
  return a
}();
function Bd(a, b, c, d, f) {
  this.Oa = a;
  this.Aa = b;
  this.K = c;
  this.Z = d;
  this.m = f;
  this.C = 0;
  this.p = 27525356
}
p = Bd.prototype;
p.Da = function(a) {
  return this.Z + 1 < this.Aa.length ? (a = xd.D(this.Oa, this.Aa, this.K, this.Z + 1), a == l ? l : a) : a.Vb(a)
};
p.N = function(a, b) {
  return L(b, a)
};
p.G = ba();
p.fa = function() {
  return this.Aa[this.Z]
};
p.$ = function(a) {
  return this.Z + 1 < this.Aa.length ? (a = xd.D(this.Oa, this.Aa, this.K, this.Z + 1), a == l ? M : a) : a.jb(a)
};
p.Vb = function() {
  var a = this.Aa.length, a = this.K + a < Ha(this.Oa) ? xd.j(this.Oa, this.K + a, 0) : l;
  return a == l ? l : a
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return xd.Y(this.Oa, this.Aa, this.K, this.Z, b)
};
p.V = function() {
  return cb(yd, this.m)
};
p.Wb = g;
p.sb = function() {
  return Ic.g(this.Aa, this.Z)
};
p.jb = function() {
  var a = this.Aa.length, a = this.K + a < Ha(this.Oa) ? xd.j(this.Oa, this.K + a, 0) : l;
  return a == l ? M : a
};
Bd;
var xd = function() {
  function a(a, b, c, d, k) {
    return new Bd(a, b, c, d, k)
  }
  function b(a, b, c, j) {
    return d.Y(a, b, c, j, l)
  }
  function c(a, b, c) {
    return d.Y(a, sd(a, b), b, c, l)
  }
  var d = l, d = function(d, h, i, j, k) {
    switch(arguments.length) {
      case 3:
        return c.call(this, d, h, i);
      case 4:
        return b.call(this, d, h, i, j);
      case 5:
        return a.call(this, d, h, i, j, k)
    }
    e("Invalid arity: " + arguments.length)
  };
  d.j = c;
  d.D = b;
  d.Y = a;
  return d
}();
function Cd(a, b, c, d, f) {
  this.m = a;
  this.Na = b;
  this.start = c;
  this.end = d;
  this.o = f;
  this.C = 0;
  this.p = 32400159
}
p = Cd.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.I = function(a, b) {
  return a.W(a, b, l)
};
p.B = function(a, b, c) {
  return a.W(a, b, c)
};
p.R = function(a, b, c) {
  a = this.start + b;
  return new Cd(this.m, Qa(this.Na, a, c), this.start, this.end > a + 1 ? this.end : a + 1, l)
};
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return new Cd(this.m, $a(this.Na, this.end, b), this.start, this.end + 1, l)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.va = function(a, b) {
  return K.g(a, b)
};
p.wa = function(a, b, c) {
  return K.j(a, b, c)
};
p.G = function() {
  var a = this, b = function d(b) {
    return b === a.end ? l : L(y.g(a.Na, b), new U(l, m, function() {
      return d(b + 1)
    }, l))
  };
  return b.h ? b.h(a.start) : b.call(l, a.start)
};
p.L = function() {
  return this.end - this.start
};
p.xa = function() {
  return y.g(this.Na, this.end - 1)
};
p.Ua = function(a, b, c) {
  return a.R(a, b, c)
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new Cd(b, this.Na, this.start, this.end, this.o)
};
p.P = n("m");
p.ea = function(a, b) {
  return y.g(this.Na, this.start + b)
};
p.W = function(a, b, c) {
  return y.j(this.Na, this.start + b, c)
};
p.V = function() {
  return cb(md, this.m)
};
Cd;
var Ed = function Dd(b, c, d, f) {
  var d = b.root.O === d.O ? d : new nd(b.root.O, d.l.slice()), h = b.n - 1 >>> c & 31;
  if(5 === c) {
    b = f
  }else {
    var i = d.l[h], b = i != l ? Dd(b, c - 5, i, f) : pd(b.root.O, c - 5, f)
  }
  d.l[h] = b;
  return d
};
function wd(a, b, c, d) {
  this.n = a;
  this.shift = b;
  this.root = c;
  this.ja = d;
  this.p = 275;
  this.C = 22
}
p = wd.prototype;
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.I = function(a, b) {
  return a.W(a, b, l)
};
p.B = function(a, b, c) {
  return a.W(a, b, c)
};
p.ea = function(a, b) {
  if(this.root.O) {
    return sd(a, b)[b & 31]
  }
  e(Error("nth after persistent!"))
};
p.W = function(a, b, c) {
  var d = 0 <= b;
  return(d ? b < this.n : d) ? a.ea(a, b) : c
};
p.L = function() {
  if(this.root.O) {
    return this.n
  }
  e(Error("count after persistent!"))
};
function Fd(a, b, c, d) {
  if(a.root.O) {
    if(function() {
      var b = 0 <= c;
      return b ? c < a.n : b
    }()) {
      if(od(b) <= c) {
        a.ja[c & 31] = d
      }else {
        var f = function i(b, f) {
          var q = a.root.O === f.O ? f : new nd(a.root.O, f.l.slice());
          if(0 === b) {
            q.l[c & 31] = d
          }else {
            var s = c >>> b & 31, w = i(b - 5, q.l[s]);
            q.l[s] = w
          }
          return q
        }.call(l, a.shift, a.root);
        a.root = f
      }
      return b
    }
    if(c === a.n) {
      return b.Ta(b, d)
    }
    e(Error([T("Index "), T(c), T(" out of bounds for TransientVector of length"), T(a.n)].join("")))
  }
  e(Error("assoc! after persistent!"))
}
p.Sa = function(a, b, c) {
  return Fd(a, a, b, c)
};
p.Ta = function(a, b) {
  if(this.root.O) {
    if(32 > this.n - od(a)) {
      this.ja[this.n & 31] = b
    }else {
      var c = new nd(this.root.O, this.ja), d = Fa.h(32);
      d[0] = b;
      this.ja = d;
      if(this.n >>> 5 > 1 << this.shift) {
        var d = Fa.h(32), f = this.shift + 5;
        d[0] = this.root;
        d[1] = pd(this.root.O, this.shift, c);
        this.root = new nd(this.root.O, d);
        this.shift = f
      }else {
        this.root = Ed(a, this.shift, this.root, c)
      }
    }
    this.n += 1;
    return a
  }
  e(Error("conj! after persistent!"))
};
p.ab = function(a) {
  if(this.root.O) {
    this.root.O = l;
    var a = this.n - od(a), b = Fa.h(a);
    dc(this.ja, 0, b, 0, a);
    return new vd(l, this.n, this.shift, this.root, b, l)
  }
  e(Error("persistent! called twice"))
};
wd;
function Gd(a, b, c, d) {
  this.m = a;
  this.oa = b;
  this.Ia = c;
  this.o = d;
  this.C = 0;
  this.p = 31850572
}
p = Gd.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.N = function(a, b) {
  return L(b, a)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = ba();
p.fa = function() {
  return z(this.oa)
};
p.$ = function(a) {
  var b = G(this.oa);
  return b ? new Gd(this.m, b, this.Ia, l) : this.Ia == l ? a.V(a) : new Gd(this.m, this.Ia, l, l)
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new Gd(b, this.oa, this.Ia, this.o)
};
p.P = n("m");
p.V = function() {
  return cb(M, this.m)
};
Gd;
function Hd(a, b, c, d, f) {
  this.m = a;
  this.count = b;
  this.oa = c;
  this.Ia = d;
  this.o = f;
  this.C = 0;
  this.p = 31858766
}
p = Hd.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.N = function(a, b) {
  var c;
  u(this.oa) ? (c = this.Ia, c = new Hd(this.m, this.count + 1, this.oa, Ob.g(u(c) ? c : yd, b), l)) : c = new Hd(this.m, this.count + 1, Ob.g(this.oa, b), yd, l);
  return c
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = function() {
  var a = Q(this.Ia), b = this.oa;
  return u(u(b) ? b : a) ? new Gd(l, this.oa, Q(a), l) : l
};
p.L = n("count");
p.xa = function() {
  return z(this.oa)
};
p.fa = function() {
  return H(this.oa)
};
p.$ = function(a) {
  return I(Q(a))
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new Hd(b, this.count, this.oa, this.Ia, this.o)
};
p.P = n("m");
p.V = function() {
  return Jd
};
Hd;
var Jd = new Hd(l, 0, l, yd, 0);
function Kd() {
  this.C = 0;
  this.p = 2097152
}
Kd.prototype.F = o(m);
Kd;
var Ld = new Kd;
function Md(a, b) {
  return gc($b(b) ? R(a) === R(b) ? Xc(Zc, ad.g(function(a) {
    return Bb.g(B.j(b, H(a), Ld), H(G(a)))
  }, a)) : l : l)
}
function Nd(a, b, c) {
  for(var d = c.length, f = 0;;) {
    if(f < d) {
      if(b === c[f]) {
        return f
      }
      f += a
    }else {
      return l
    }
  }
}
function Od(a, b) {
  var c = S.h(a), d = S.h(b);
  return c < d ? -1 : c > d ? 1 : 0
}
function Pd(a, b, c) {
  for(var d = a.keys, f = d.length, h = a.Ja, i = Ub(Qd, Vb(a)), a = 0, i = rb(i);;) {
    if(a < f) {
      var j = d[a], a = a + 1, i = ub(i, j, h[j])
    }else {
      return Rc(ub(i, b, c))
    }
  }
}
function Rd(a, b) {
  for(var c = {}, d = b.length, f = 0;;) {
    if(f < d) {
      var h = b[f];
      c[h] = a[h];
      f += 1
    }else {
      break
    }
  }
  return c
}
function Sd(a, b, c, d, f) {
  this.m = a;
  this.keys = b;
  this.Ja = c;
  this.hb = d;
  this.o = f;
  this.C = 1;
  this.p = 15075087
}
p = Sd.prototype;
p.Ra = function(a) {
  return Qc(jd(Cb(), a))
};
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = xc(a)
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  return((a = ea(b)) ? Nd(1, b, this.keys) != l : a) ? this.Ja[b] : c
};
p.R = function(a, b, c) {
  if(ea(b)) {
    var d = this.hb > Td;
    if(d ? d : this.keys.length >= Td) {
      return Pd(a, b, c)
    }
    if(Nd(1, b, this.keys) != l) {
      return a = Rd(this.Ja, this.keys), a[b] = c, new Sd(this.m, this.keys, a, this.hb + 1, l)
    }
    a = Rd(this.Ja, this.keys);
    d = this.keys.slice();
    a[b] = c;
    d.push(b);
    return new Sd(this.m, d, a, this.hb + 1, l)
  }
  return Pd(a, b, c)
};
p.Pa = function(a, b) {
  var c = ea(b);
  return(c ? Nd(1, b, this.keys) != l : c) ? g : m
};
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return ac(b) ? a.R(a, y.g(b, 0), y.g(b, 1)) : qc.j(Ja, a, b)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = function() {
  var a = this;
  return 0 < a.keys.length ? ad.g(function(b) {
    return W.k(F([b, a.Ja[b]], 0))
  }, a.keys.sort(Od)) : l
};
p.L = function() {
  return this.keys.length
};
p.F = function(a, b) {
  return Md(a, b)
};
p.Q = function(a, b) {
  return new Sd(b, this.keys, this.Ja, this.hb, this.o)
};
p.P = n("m");
p.V = function() {
  return cb(Ud, this.m)
};
p.pa = function(a, b) {
  var c = ea(b);
  if(c ? Nd(1, b, this.keys) != l : c) {
    var c = this.keys.slice(), d = Rd(this.Ja, this.keys);
    c.splice(Nd(1, b, c), 1);
    delete d[b];
    return new Sd(this.m, c, d, this.hb + 1, l)
  }
  return a
};
Sd;
var Ud = new Sd(l, [], {}, 0, 0), Td = 32;
function Vd(a, b) {
  return new Sd(l, a, b, 0, l)
}
function Wd(a, b, c, d) {
  this.m = a;
  this.count = b;
  this.ta = c;
  this.o = d;
  this.C = 0;
  this.p = 15075087
}
p = Wd.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = xc(a)
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  a = this.ta[S.h(b)];
  b = u(a) ? Nd(2, b, a) : l;
  return u(b) ? a[b + 1] : c
};
p.R = function(a, b, c) {
  var a = S.h(b), d = this.ta[a];
  if(u(d)) {
    var d = d.slice(), f = wa(this.ta);
    f[a] = d;
    a = Nd(2, b, d);
    if(u(a)) {
      return d[a + 1] = c, new Wd(this.m, this.count, f, l)
    }
    d.push(b, c);
    return new Wd(this.m, this.count + 1, f, l)
  }
  d = wa(this.ta);
  d[a] = [b, c];
  return new Wd(this.m, this.count + 1, d, l)
};
p.Pa = function(a, b) {
  var c = this.ta[S.h(b)];
  return u(u(c) ? Nd(2, b, c) : l) ? g : m
};
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return ac(b) ? a.R(a, y.g(b, 0), y.g(b, 1)) : qc.j(Ja, a, b)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = function() {
  var a = this;
  if(0 < a.count) {
    var b = cc(a.ta).sort();
    return id.g(function(b) {
      return ad.g(Ad, kd.g(2, a.ta[b]))
    }, b)
  }
  return l
};
p.L = n("count");
p.F = function(a, b) {
  return Md(a, b)
};
p.Q = function(a, b) {
  return new Wd(b, this.count, this.ta, this.o)
};
p.P = n("m");
p.V = function() {
  return cb(Xd, this.m)
};
p.pa = function(a, b) {
  var c = S.h(b), d = this.ta[c], f = u(d) ? Nd(2, b, d) : l;
  if(Nb(f)) {
    return a
  }
  var h = wa(this.ta);
  3 > d.length ? delete h[c] : (d = d.slice(), d.splice(f, 2), h[c] = d);
  return new Wd(this.m, this.count - 1, h, l)
};
Wd;
var Xd = new Wd(l, 0, {}, 0);
function Yd(a, b) {
  for(var c = a.l, d = c.length, f = 0;;) {
    if(d <= f) {
      return-1
    }
    if(Bb.g(c[f], b)) {
      return f
    }
    f += 2
  }
}
function Zd(a, b, c, d) {
  this.m = a;
  this.n = b;
  this.l = c;
  this.o = d;
  this.C = 1;
  this.p = 16123663
}
p = Zd.prototype;
p.Ra = function() {
  return new $d({}, this.l.length, this.l.slice())
};
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = xc(a)
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  a = Yd(a, b);
  return-1 === a ? c : this.l[a + 1]
};
p.R = function(a, b, c) {
  var d = this, f = Yd(a, b);
  return-1 === f ? d.n < ae ? new Zd(d.m, d.n + 1, function() {
    var a = d.l.slice();
    a.push(b);
    a.push(c);
    return a
  }(), l) : Rc(Sc(Qc(jd(Qd, a)), b, c)) : c === d.l[f + 1] ? a : new Zd(d.m, d.n, function() {
    var a = d.l.slice();
    a[f + 1] = c;
    return a
  }(), l)
};
p.Pa = function(a, b) {
  return-1 !== Yd(a, b)
};
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return ac(b) ? a.R(a, y.g(b, 0), y.g(b, 1)) : qc.j(Ja, a, b)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = function() {
  var a = this;
  if(0 < a.n) {
    var b = a.l.length, c = function f(c) {
      return new U(l, m, function() {
        return c < b ? L(V([a.l[c], a.l[c + 1]]), f(c + 2)) : l
      }, l)
    };
    return c.h ? c.h(0) : c.call(l, 0)
  }
  return l
};
p.L = n("n");
p.F = function(a, b) {
  return Md(a, b)
};
p.Q = function(a, b) {
  return new Zd(b, this.n, this.l, this.o)
};
p.P = n("m");
p.V = function() {
  return cb(be, this.m)
};
p.pa = function(a, b) {
  if(0 <= Yd(a, b)) {
    var c = this.l.length, d = c - 2;
    if(0 === d) {
      return a.V(a)
    }
    for(var d = Fa.h(d), f = 0, h = 0;;) {
      if(f >= c) {
        return new Zd(this.m, this.n - 1, d, l)
      }
      Bb.g(b, this.l[f]) || (d[h] = this.l[f], d[h + 1] = this.l[f + 1], h += 2);
      f += 2
    }
  }else {
    return a
  }
};
Zd;
var be = new Zd(l, 0, [], l), ae = 16;
function $d(a, b, c) {
  this.Va = a;
  this.Ya = b;
  this.l = c;
  this.C = 14;
  this.p = 258
}
p = $d.prototype;
p.Sa = function(a, b, c) {
  if(u(this.Va)) {
    var d = Yd(a, b);
    if(-1 === d) {
      if(this.Ya + 2 <= 2 * ae) {
        return this.Ya += 2, this.l.push(b), this.l.push(c), a
      }
      var f;
      a: {
        for(var a = this.Ya, d = this.l, h = rb(Ud), i = 0;;) {
          if(i < a) {
            h = ub(h, d[i], d[i + 1]), i += 2
          }else {
            f = h;
            break a
          }
        }
      }
      return ub(f, b, c)
    }
    c !== this.l[d + 1] && (this.l[d + 1] = c);
    return a
  }
  e(Error("assoc! after persistent!"))
};
p.Ta = function(a, b) {
  if(u(this.Va)) {
    var c;
    c = b ? ((c = b.p & 2048) ? c : b.cc) ? g : b.p ? m : v(Ta, b) : v(Ta, b);
    if(c) {
      return a.Sa(a, Ua(b), Va(b))
    }
    c = Q(b);
    for(var d = a;;) {
      var f = H(c);
      if(u(f)) {
        c = G(c), d = d.Sa(d, Ua(f), Va(f))
      }else {
        return d
      }
    }
  }else {
    e(Error("conj! after persistent!"))
  }
};
p.ab = function() {
  if(u(this.Va)) {
    return this.Va = m, new Zd(l, sc(this.Ya, 2), this.l, l)
  }
  e(Error("persistent! called twice"))
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  if(u(this.Va)) {
    return a = Yd(a, b), -1 === a ? c : this.l[a + 1]
  }
  e(Error("lookup after persistent!"))
};
p.L = function() {
  if(u(this.Va)) {
    return sc(this.Ya, 2)
  }
  e(Error("count after persistent!"))
};
$d;
function ce(a) {
  this.q = a
}
ce;
function de(a, b) {
  return ea(a) ? a === b : Bb.g(a, b)
}
var ee = function() {
  function a(a, b, c, i, j) {
    a = a.slice();
    a[b] = c;
    a[i] = j;
    return a
  }
  function b(a, b, c) {
    a = a.slice();
    a[b] = c;
    return a
  }
  var c = l, c = function(c, f, h, i, j) {
    switch(arguments.length) {
      case 3:
        return b.call(this, c, f, h);
      case 5:
        return a.call(this, c, f, h, i, j)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.j = b;
  c.Y = a;
  return c
}();
function fe(a, b) {
  var c = Fa.h(a.length - 2);
  dc(a, 0, c, 0, 2 * b);
  dc(a, 2 * (b + 1), c, 2 * b, c.length - 2 * b);
  return c
}
var ge = function() {
  function a(a, b, c, i, j, k) {
    a = a.Wa(b);
    a.l[c] = i;
    a.l[j] = k;
    return a
  }
  function b(a, b, c, i) {
    a = a.Wa(b);
    a.l[c] = i;
    return a
  }
  var c = l, c = function(c, f, h, i, j, k) {
    switch(arguments.length) {
      case 4:
        return b.call(this, c, f, h, i);
      case 6:
        return a.call(this, c, f, h, i, j, k)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.D = b;
  c.Ea = a;
  return c
}();
function he(a, b, c) {
  this.O = a;
  this.T = b;
  this.l = c
}
p = he.prototype;
p.sa = function(a, b, c, d, f, h) {
  var i = 1 << (c >>> b & 31), j = tc(this.T & i - 1);
  if(0 === (this.T & i)) {
    var k = tc(this.T);
    if(2 * k < this.l.length) {
      a = this.Wa(a);
      b = a.l;
      h.q = g;
      a: {
        c = 2 * (k - j);
        h = 2 * j + (c - 1);
        for(k = 2 * (j + 1) + (c - 1);;) {
          if(0 === c) {
            break a
          }
          b[k] = b[h];
          k -= 1;
          c -= 1;
          h -= 1
        }
      }
      b[2 * j] = d;
      b[2 * j + 1] = f;
      a.T |= i;
      return a
    }
    if(16 <= k) {
      j = Fa.h(32);
      j[c >>> b & 31] = ie.sa(a, b + 5, c, d, f, h);
      for(f = d = 0;;) {
        if(32 > d) {
          0 !== (this.T >>> d & 1) && (j[d] = this.l[f] != l ? ie.sa(a, b + 5, S.h(this.l[f]), this.l[f], this.l[f + 1], h) : this.l[f + 1], f += 2), d += 1
        }else {
          break
        }
      }
      return new je(a, k + 1, j)
    }
    b = Fa.h(2 * (k + 4));
    dc(this.l, 0, b, 0, 2 * j);
    b[2 * j] = d;
    b[2 * j + 1] = f;
    dc(this.l, 2 * j, b, 2 * (j + 1), 2 * (k - j));
    h.q = g;
    d = this.Wa(a);
    d.l = b;
    d.T |= i;
    return d
  }
  k = this.l[2 * j];
  i = this.l[2 * j + 1];
  if(k == l) {
    return d = i.sa(a, b + 5, c, d, f, h), d === i ? this : ge.D(this, a, 2 * j + 1, d)
  }
  if(de(d, k)) {
    return f === i ? this : ge.D(this, a, 2 * j + 1, f)
  }
  h.q = g;
  return ge.Ea(this, a, 2 * j, l, 2 * j + 1, ke.bb(a, b + 5, k, i, c, d, f))
};
p.eb = function() {
  return le.h(this.l)
};
p.Wa = function(a) {
  if(a === this.O) {
    return this
  }
  var b = tc(this.T), c = Fa.h(0 > b ? 4 : 2 * (b + 1));
  dc(this.l, 0, c, 0, 2 * b);
  return new he(a, this.T, c)
};
p.fb = function(a, b, c) {
  var d = 1 << (b >>> a & 31);
  if(0 === (this.T & d)) {
    return this
  }
  var f = tc(this.T & d - 1), h = this.l[2 * f], i = this.l[2 * f + 1];
  return h == l ? (a = i.fb(a + 5, b, c), a === i ? this : a != l ? new he(l, this.T, ee.j(this.l, 2 * f + 1, a)) : this.T === d ? l : new he(l, this.T ^ d, fe(this.l, f))) : de(c, h) ? new he(l, this.T ^ d, fe(this.l, f)) : this
};
p.ra = function(a, b, c, d, f) {
  var h = 1 << (b >>> a & 31), i = tc(this.T & h - 1);
  if(0 === (this.T & h)) {
    var j = tc(this.T);
    if(16 <= j) {
      i = Fa.h(32);
      i[b >>> a & 31] = ie.ra(a + 5, b, c, d, f);
      for(d = c = 0;;) {
        if(32 > c) {
          0 !== (this.T >>> c & 1) && (i[c] = this.l[d] != l ? ie.ra(a + 5, S.h(this.l[d]), this.l[d], this.l[d + 1], f) : this.l[d + 1], d += 2), c += 1
        }else {
          break
        }
      }
      return new je(l, j + 1, i)
    }
    a = Fa.h(2 * (j + 1));
    dc(this.l, 0, a, 0, 2 * i);
    a[2 * i] = c;
    a[2 * i + 1] = d;
    dc(this.l, 2 * i, a, 2 * (i + 1), 2 * (j - i));
    f.q = g;
    return new he(l, this.T | h, a)
  }
  h = this.l[2 * i];
  j = this.l[2 * i + 1];
  if(h == l) {
    return f = j.ra(a + 5, b, c, d, f), f === j ? this : new he(l, this.T, ee.j(this.l, 2 * i + 1, f))
  }
  if(de(c, h)) {
    return d === j ? this : new he(l, this.T, ee.j(this.l, 2 * i + 1, d))
  }
  f.q = g;
  return new he(l, this.T, ee.Y(this.l, 2 * i, l, 2 * i + 1, ke.Ea(a + 5, h, j, b, c, d)))
};
p.Fa = function(a, b, c, d) {
  var f = 1 << (b >>> a & 31);
  if(0 === (this.T & f)) {
    return d
  }
  var h = tc(this.T & f - 1), f = this.l[2 * h], h = this.l[2 * h + 1];
  return f == l ? h.Fa(a + 5, b, c, d) : de(c, f) ? h : d
};
he;
var ie = new he(l, 0, Fa.h(0));
function je(a, b, c) {
  this.O = a;
  this.n = b;
  this.l = c
}
p = je.prototype;
p.sa = function(a, b, c, d, f, h) {
  var i = c >>> b & 31, j = this.l[i];
  if(j == l) {
    return a = ge.D(this, a, i, ie.sa(a, b + 5, c, d, f, h)), a.n += 1, a
  }
  b = j.sa(a, b + 5, c, d, f, h);
  return b === j ? this : ge.D(this, a, i, b)
};
p.eb = function() {
  return me.h(this.l)
};
p.Wa = function(a) {
  return a === this.O ? this : new je(a, this.n, this.l.slice())
};
p.fb = function(a, b, c) {
  var d = b >>> a & 31, f = this.l[d];
  if(f != l) {
    a = f.fb(a + 5, b, c);
    if(a === f) {
      d = this
    }else {
      if(a == l) {
        if(8 >= this.n) {
          a: {
            for(var f = this.l, a = 2 * (this.n - 1), b = Fa.h(a), c = 0, h = 1, i = 0;;) {
              if(c < a) {
                var j = c !== d;
                if(j ? f[c] != l : j) {
                  b[h] = f[c], h += 2, i |= 1 << c
                }
                c += 1
              }else {
                d = new he(l, i, b);
                break a
              }
            }
            d = aa
          }
        }else {
          d = new je(l, this.n - 1, ee.j(this.l, d, a))
        }
      }else {
        d = new je(l, this.n, ee.j(this.l, d, a))
      }
    }
    return d
  }
  return this
};
p.ra = function(a, b, c, d, f) {
  var h = b >>> a & 31, i = this.l[h];
  if(i == l) {
    return new je(l, this.n + 1, ee.j(this.l, h, ie.ra(a + 5, b, c, d, f)))
  }
  a = i.ra(a + 5, b, c, d, f);
  return a === i ? this : new je(l, this.n, ee.j(this.l, h, a))
};
p.Fa = function(a, b, c, d) {
  var f = this.l[b >>> a & 31];
  return f != l ? f.Fa(a + 5, b, c, d) : d
};
je;
function ne(a, b, c) {
  for(var b = 2 * b, d = 0;;) {
    if(d < b) {
      if(de(c, a[d])) {
        return d
      }
      d += 2
    }else {
      return-1
    }
  }
}
function oe(a, b, c, d) {
  this.O = a;
  this.ya = b;
  this.n = c;
  this.l = d
}
p = oe.prototype;
p.sa = function(a, b, c, d, f, h) {
  if(c === this.ya) {
    b = ne(this.l, this.n, d);
    if(-1 === b) {
      if(this.l.length > 2 * this.n) {
        return a = ge.Ea(this, a, 2 * this.n, d, 2 * this.n + 1, f), h.q = g, a.n += 1, a
      }
      c = this.l.length;
      b = Fa.h(c + 2);
      dc(this.l, 0, b, 0, c);
      b[c] = d;
      b[c + 1] = f;
      h.q = g;
      h = this.n + 1;
      a === this.O ? (this.l = b, this.n = h, a = this) : a = new oe(this.O, this.ya, h, b);
      return a
    }
    return this.l[b + 1] === f ? this : ge.D(this, a, b + 1, f)
  }
  return(new he(a, 1 << (this.ya >>> b & 31), [l, this, l, l])).sa(a, b, c, d, f, h)
};
p.eb = function() {
  return le.h(this.l)
};
p.Wa = function(a) {
  if(a === this.O) {
    return this
  }
  var b = Fa.h(2 * (this.n + 1));
  dc(this.l, 0, b, 0, 2 * this.n);
  return new oe(a, this.ya, this.n, b)
};
p.fb = function(a, b, c) {
  a = ne(this.l, this.n, c);
  return-1 === a ? this : 1 === this.n ? l : new oe(l, this.ya, this.n - 1, fe(this.l, sc(a, 2)))
};
p.ra = function(a, b, c, d, f) {
  return b === this.ya ? (a = ne(this.l, this.n, c), -1 === a ? (a = this.l.length, b = Fa.h(a + 2), dc(this.l, 0, b, 0, a), b[a] = c, b[a + 1] = d, f.q = g, new oe(l, this.ya, this.n + 1, b)) : Bb.g(this.l[a], d) ? this : new oe(l, this.ya, this.n, ee.j(this.l, a + 1, d))) : (new he(l, 1 << (this.ya >>> a & 31), [l, this])).ra(a, b, c, d, f)
};
p.Fa = function(a, b, c, d) {
  a = ne(this.l, this.n, c);
  return 0 > a ? d : de(c, this.l[a]) ? this.l[a + 1] : d
};
oe;
var ke = function() {
  function a(a, b, c, i, j, k, q) {
    var s = S.h(c);
    if(s === j) {
      return new oe(l, s, 2, [c, i, k, q])
    }
    var w = new ce(m);
    return ie.sa(a, b, s, c, i, w).sa(a, b, j, k, q, w)
  }
  function b(a, b, c, i, j, k) {
    var q = S.h(b);
    if(q === i) {
      return new oe(l, q, 2, [b, c, j, k])
    }
    var s = new ce(m);
    return ie.ra(a, q, b, c, s).ra(a, i, j, k, s)
  }
  var c = l, c = function(c, f, h, i, j, k, q) {
    switch(arguments.length) {
      case 6:
        return b.call(this, c, f, h, i, j, k);
      case 7:
        return a.call(this, c, f, h, i, j, k, q)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.Ea = b;
  c.bb = a;
  return c
}();
function pe(a, b, c, d, f) {
  this.m = a;
  this.Ha = b;
  this.K = c;
  this.Ca = d;
  this.o = f;
  this.C = 0;
  this.p = 31850572
}
p = pe.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.N = function(a, b) {
  return L(b, a)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = ba();
p.fa = function() {
  return this.Ca == l ? V([this.Ha[this.K], this.Ha[this.K + 1]]) : H(this.Ca)
};
p.$ = function() {
  return this.Ca == l ? le.j(this.Ha, this.K + 2, l) : le.j(this.Ha, this.K, G(this.Ca))
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new pe(b, this.Ha, this.K, this.Ca, this.o)
};
p.P = n("m");
p.V = function() {
  return cb(M, this.m)
};
pe;
var le = function() {
  function a(a, b, c) {
    if(c == l) {
      for(c = a.length;;) {
        if(b < c) {
          if(a[b] != l) {
            return new pe(l, a, b, l, l)
          }
          var i = a[b + 1];
          if(u(i) && (i = i.eb(), u(i))) {
            return new pe(l, a, b + 2, i, l)
          }
          b += 2
        }else {
          return l
        }
      }
    }else {
      return new pe(l, a, b, c, l)
    }
  }
  function b(a) {
    return c.j(a, 0, l)
  }
  var c = l, c = function(c, f, h) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.j = a;
  return c
}();
function qe(a, b, c, d, f) {
  this.m = a;
  this.Ha = b;
  this.K = c;
  this.Ca = d;
  this.o = f;
  this.C = 0;
  this.p = 31850572
}
p = qe.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.N = function(a, b) {
  return L(b, a)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = ba();
p.fa = function() {
  return H(this.Ca)
};
p.$ = function() {
  return me.D(l, this.Ha, this.K, G(this.Ca))
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new qe(b, this.Ha, this.K, this.Ca, this.o)
};
p.P = n("m");
p.V = function() {
  return cb(M, this.m)
};
qe;
var me = function() {
  function a(a, b, c, i) {
    if(i == l) {
      for(i = b.length;;) {
        if(c < i) {
          var j = b[c];
          if(u(j) && (j = j.eb(), u(j))) {
            return new qe(a, b, c + 1, j, l)
          }
          c += 1
        }else {
          return l
        }
      }
    }else {
      return new qe(a, b, c, i, l)
    }
  }
  function b(a) {
    return c.D(l, a, 0, l)
  }
  var c = l, c = function(c, f, h, i) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 4:
        return a.call(this, c, f, h, i)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.D = a;
  return c
}();
function re(a, b, c, d, f, h) {
  this.m = a;
  this.n = b;
  this.root = c;
  this.ba = d;
  this.ka = f;
  this.o = h;
  this.C = 1;
  this.p = 16123663
}
p = re.prototype;
p.Ra = function() {
  return new se({}, this.root, this.n, this.ba, this.ka)
};
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = xc(a)
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  return b == l ? this.ba ? this.ka : c : this.root == l ? c : this.root.Fa(0, S.h(b), b, c)
};
p.R = function(a, b, c) {
  if(b == l) {
    var d = this.ba;
    return(d ? c === this.ka : d) ? a : new re(this.m, this.ba ? this.n : this.n + 1, this.root, g, c, l)
  }
  d = new ce(m);
  c = (this.root == l ? ie : this.root).ra(0, S.h(b), b, c, d);
  return c === this.root ? a : new re(this.m, d.q ? this.n + 1 : this.n, c, this.ba, this.ka, l)
};
p.Pa = function(a, b) {
  return b == l ? this.ba : this.root == l ? m : this.root.Fa(0, S.h(b), b, ec) !== ec
};
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return ac(b) ? a.R(a, y.g(b, 0), y.g(b, 1)) : qc.j(Ja, a, b)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = function() {
  if(0 < this.n) {
    var a = this.root != l ? this.root.eb() : l;
    return this.ba ? L(V([l, this.ka]), a) : a
  }
  return l
};
p.L = n("n");
p.F = function(a, b) {
  return Md(a, b)
};
p.Q = function(a, b) {
  return new re(b, this.n, this.root, this.ba, this.ka, this.o)
};
p.P = n("m");
p.V = function() {
  return cb(Qd, this.m)
};
p.pa = function(a, b) {
  if(b == l) {
    return this.ba ? new re(this.m, this.n - 1, this.root, m, l, l) : a
  }
  if(this.root == l) {
    return a
  }
  var c = this.root.fb(0, S.h(b), b);
  return c === this.root ? a : new re(this.m, this.n - 1, c, this.ba, this.ka, l)
};
re;
var Qd = new re(l, 0, l, m, l, 0);
function se(a, b, c, d, f) {
  this.O = a;
  this.root = b;
  this.count = c;
  this.ba = d;
  this.ka = f;
  this.C = 14;
  this.p = 258
}
p = se.prototype;
p.Sa = function(a, b, c) {
  return te(a, b, c)
};
p.Ta = function(a, b) {
  var c;
  a: {
    if(a.O) {
      var d;
      d = b ? ((d = b.p & 2048) ? d : b.cc) ? g : b.p ? m : v(Ta, b) : v(Ta, b);
      if(d) {
        c = te(a, Ua(b), Va(b))
      }else {
        d = Q(b);
        for(var f = a;;) {
          var h = H(d);
          if(u(h)) {
            d = G(d), f = te(f, Ua(h), Va(h))
          }else {
            c = f;
            break a
          }
        }
      }
    }else {
      e(Error("conj! after persistent"))
    }
  }
  return c
};
p.ab = function(a) {
  var b;
  a.O ? (a.O = l, b = new re(l, a.count, a.root, a.ba, a.ka, l)) : e(Error("persistent! called twice"));
  return b
};
p.I = function(a, b) {
  return b == l ? this.ba ? this.ka : l : this.root == l ? l : this.root.Fa(0, S.h(b), b)
};
p.B = function(a, b, c) {
  return b == l ? this.ba ? this.ka : c : this.root == l ? c : this.root.Fa(0, S.h(b), b, c)
};
p.L = function() {
  if(this.O) {
    return this.count
  }
  e(Error("count after persistent!"))
};
function te(a, b, c) {
  if(a.O) {
    if(b == l) {
      if(a.ka !== c && (a.ka = c), !a.ba) {
        a.count += 1, a.ba = g
      }
    }else {
      var d = new ce(m), b = (a.root == l ? ie : a.root).sa(a.O, 0, S.h(b), b, c, d);
      b !== a.root && (a.root = b);
      d.q && (a.count += 1)
    }
    return a
  }
  e(Error("assoc! after persistent!"))
}
se;
function ue(a, b, c) {
  for(var d = b;;) {
    if(a != l) {
      b = c ? a.left : a.right, d = Ob.g(d, a), a = b
    }else {
      return d
    }
  }
}
function ve(a, b, c, d, f) {
  this.m = a;
  this.stack = b;
  this.ib = c;
  this.n = d;
  this.o = f;
  this.C = 0;
  this.p = 31850570
}
p = ve.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.N = function(a, b) {
  return L(b, a)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = ba();
p.L = function(a) {
  return 0 > this.n ? R(G(a)) + 1 : this.n
};
p.fa = function() {
  return Xa(this.stack)
};
p.$ = function() {
  var a = H(this.stack), a = ue(this.ib ? a.right : a.left, G(this.stack), this.ib);
  return a != l ? new ve(l, a, this.ib, this.n - 1, l) : M
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new ve(b, this.stack, this.ib, this.n, this.o)
};
p.P = n("m");
ve;
function we(a, b, c, d) {
  return J(X, c) ? J(X, c.left) ? new X(c.key, c.q, c.left.ua(), new Y(a, b, c.right, d, l), l) : J(X, c.right) ? new X(c.right.key, c.right.q, new Y(c.key, c.q, c.left, c.right.left, l), new Y(a, b, c.right.right, d, l), l) : new Y(a, b, c, d, l) : new Y(a, b, c, d, l)
}
function xe(a, b, c, d) {
  return J(X, d) ? J(X, d.right) ? new X(d.key, d.q, new Y(a, b, c, d.left, l), d.right.ua(), l) : J(X, d.left) ? new X(d.left.key, d.left.q, new Y(a, b, c, d.left.left, l), new Y(d.key, d.q, d.left.right, d.right, l), l) : new Y(a, b, c, d, l) : new Y(a, b, c, d, l)
}
function ye(a, b, c, d) {
  if(J(X, c)) {
    return new X(a, b, c.ua(), d, l)
  }
  if(J(Y, d)) {
    return xe(a, b, c, d.gb())
  }
  var f = J(X, d);
  if(f ? J(Y, d.left) : f) {
    return new X(d.left.key, d.left.q, new Y(a, b, c, d.left.left, l), xe(d.key, d.q, d.left.right, d.right.gb()), l)
  }
  e(Error("red-black tree invariant violation"))
}
function ze(a, b, c, d) {
  if(J(X, d)) {
    return new X(a, b, c, d.ua(), l)
  }
  if(J(Y, c)) {
    return we(a, b, c.gb(), d)
  }
  var f = J(X, c);
  if(f ? J(Y, c.right) : f) {
    return new X(c.right.key, c.right.q, we(c.key, c.q, c.left.gb(), c.right.left), new Y(a, b, c.right.right, d, l), l)
  }
  e(Error("red-black tree invariant violation"))
}
function Y(a, b, c, d, f) {
  this.key = a;
  this.q = b;
  this.left = c;
  this.right = d;
  this.o = f;
  this.C = 0;
  this.p = 32402207
}
p = Y.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.I = function(a, b) {
  return a.W(a, b, l)
};
p.B = function(a, b, c) {
  return a.W(a, b, c)
};
p.R = function(a, b, c) {
  return Sb.j(V([this.key, this.q]), b, c)
};
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return V([this.key, this.q, b])
};
p.kb = n("key");
p.lb = n("q");
p.Qb = function(a) {
  return a.Tb(this)
};
p.gb = function() {
  return new X(this.key, this.q, this.left, this.right, l)
};
p.replace = function(a, b, c, d) {
  return new Y(a, b, c, d, l)
};
p.Pb = function(a) {
  return a.Sb(this)
};
p.Sb = function(a) {
  return new Y(a.key, a.q, this, a.right, l)
};
p.toString = function() {
  return function() {
    switch(arguments.length) {
      case 0:
        return O.k(F([this], 0))
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.Tb = function(a) {
  return new Y(a.key, a.q, a.left, this, l)
};
p.ua = function() {
  return this
};
p.va = function(a, b) {
  return K.g(a, b)
};
p.wa = function(a, b, c) {
  return K.j(a, b, c)
};
p.G = function() {
  return Db.g(this.key, this.q)
};
p.L = o(2);
p.xa = n("q");
p.Ua = function(a, b, c) {
  return $a(V([this.key, this.q]), b, c)
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return Ub(V([this.key, this.q]), b)
};
p.P = o(l);
p.ea = function(a, b) {
  return 0 === b ? this.key : 1 === b ? this.q : l
};
p.W = function(a, b, c) {
  return 0 === b ? this.key : 1 === b ? this.q : c
};
p.V = function() {
  return yd
};
Y;
function X(a, b, c, d, f) {
  this.key = a;
  this.q = b;
  this.left = c;
  this.right = d;
  this.o = f;
  this.C = 0;
  this.p = 32402207
}
p = X.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.I = function(a, b) {
  return a.W(a, b, l)
};
p.B = function(a, b, c) {
  return a.W(a, b, c)
};
p.R = function(a, b, c) {
  return Sb.j(V([this.key, this.q]), b, c)
};
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return V([this.key, this.q, b])
};
p.kb = n("key");
p.lb = n("q");
p.Qb = function(a) {
  return new X(this.key, this.q, this.left, a, l)
};
p.gb = function() {
  e(Error("red-black tree invariant violation"))
};
p.replace = function(a, b, c, d) {
  return new X(a, b, c, d, l)
};
p.Pb = function(a) {
  return new X(this.key, this.q, a, this.right, l)
};
p.Sb = function(a) {
  return J(X, this.left) ? new X(this.key, this.q, this.left.ua(), new Y(a.key, a.q, this.right, a.right, l), l) : J(X, this.right) ? new X(this.right.key, this.right.q, new Y(this.key, this.q, this.left, this.right.left, l), new Y(a.key, a.q, this.right.right, a.right, l), l) : new Y(a.key, a.q, this, a.right, l)
};
p.toString = function() {
  return function() {
    switch(arguments.length) {
      case 0:
        return O.k(F([this], 0))
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.Tb = function(a) {
  return J(X, this.right) ? new X(this.key, this.q, new Y(a.key, a.q, a.left, this.left, l), this.right.ua(), l) : J(X, this.left) ? new X(this.left.key, this.left.q, new Y(a.key, a.q, a.left, this.left.left, l), new Y(this.key, this.q, this.left.right, this.right, l), l) : new Y(a.key, a.q, a.left, this, l)
};
p.ua = function() {
  return new Y(this.key, this.q, this.left, this.right, l)
};
p.va = function(a, b) {
  return K.g(a, b)
};
p.wa = function(a, b, c) {
  return K.j(a, b, c)
};
p.G = function() {
  return Db.g(this.key, this.q)
};
p.L = o(2);
p.xa = n("q");
p.Ua = function(a, b, c) {
  return $a(V([this.key, this.q]), b, c)
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return Ub(V([this.key, this.q]), b)
};
p.P = o(l);
p.ea = function(a, b) {
  return 0 === b ? this.key : 1 === b ? this.q : l
};
p.W = function(a, b, c) {
  return 0 === b ? this.key : 1 === b ? this.q : c
};
p.V = function() {
  return yd
};
X;
var Be = function Ae(b, c, d, f, h) {
  if(c == l) {
    return new X(d, f, l, l, l)
  }
  var i = b.g ? b.g(d, c.key) : b.call(l, d, c.key);
  if(0 === i) {
    return h[0] = c, l
  }
  if(0 > i) {
    return b = Ae(b, c.left, d, f, h), b != l ? c.Pb(b) : l
  }
  b = Ae(b, c.right, d, f, h);
  return b != l ? c.Qb(b) : l
}, De = function Ce(b, c) {
  if(b == l) {
    return c
  }
  if(c == l) {
    return b
  }
  if(J(X, b)) {
    if(J(X, c)) {
      var d = Ce(b.right, c.left);
      return J(X, d) ? new X(d.key, d.q, new X(b.key, b.q, b.left, d.left, l), new X(c.key, c.q, d.right, c.right, l), l) : new X(b.key, b.q, b.left, new X(c.key, c.q, d, c.right, l), l)
    }
    return new X(b.key, b.q, b.left, Ce(b.right, c), l)
  }
  if(J(X, c)) {
    return new X(c.key, c.q, Ce(b, c.left), c.right, l)
  }
  d = Ce(b.right, c.left);
  return J(X, d) ? new X(d.key, d.q, new Y(b.key, b.q, b.left, d.left, l), new Y(c.key, c.q, d.right, c.right, l), l) : ye(b.key, b.q, b.left, new Y(c.key, c.q, d, c.right, l))
}, Fe = function Ee(b, c, d, f) {
  if(c != l) {
    var h = b.g ? b.g(d, c.key) : b.call(l, d, c.key);
    if(0 === h) {
      return f[0] = c, De(c.left, c.right)
    }
    if(0 > h) {
      var i = Ee(b, c.left, d, f);
      return function() {
        var b = i != l;
        return b ? b : f[0] != l
      }() ? J(Y, c.left) ? ye(c.key, c.q, i, c.right) : new X(c.key, c.q, i, c.right, l) : l
    }
    var j = Ee(b, c.right, d, f);
    return function() {
      var b = j != l;
      return b ? b : f[0] != l
    }() ? J(Y, c.right) ? ze(c.key, c.q, c.left, j) : new X(c.key, c.q, c.left, j, l) : l
  }
  return l
}, He = function Ge(b, c, d, f) {
  var h = c.key, i = b.g ? b.g(d, h) : b.call(l, d, h);
  return 0 === i ? c.replace(h, f, c.left, c.right) : 0 > i ? c.replace(h, c.q, Ge(b, c.left, d, f), c.right) : c.replace(h, c.q, c.left, Ge(b, c.right, d, f))
};
function Ie(a, b, c, d, f) {
  this.qa = a;
  this.Ma = b;
  this.n = c;
  this.m = d;
  this.o = f;
  this.C = 0;
  this.p = 418776847
}
p = Ie.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = xc(a)
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  a = Je(a, b);
  return a != l ? a.q : c
};
p.R = function(a, b, c) {
  var d = [l], f = Be(this.qa, this.Ma, b, c, d);
  return f == l ? (d = Rb.g(d, 0), Bb.g(c, d.q) ? a : new Ie(this.qa, He(this.qa, this.Ma, b, c), this.n, this.m, l)) : new Ie(this.qa, f.ua(), this.n + 1, this.m, l)
};
p.Pa = function(a, b) {
  return Je(a, b) != l
};
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return ac(b) ? a.R(a, y.g(b, 0), y.g(b, 1)) : qc.j(Ja, a, b)
};
p.$a = function() {
  return 0 < this.n ? new ve(l, ue(this.Ma, l, m), m, this.n, l) : l
};
p.toString = function() {
  return O.k(F([this], 0))
};
function Je(a, b) {
  for(var c = a.Ma;;) {
    if(c != l) {
      var d = a.qa.g ? a.qa.g(b, c.key) : a.qa.call(l, b, c.key);
      if(0 === d) {
        return c
      }
      c = 0 > d ? c.left : c.right
    }else {
      return l
    }
  }
}
p.G = function() {
  return 0 < this.n ? new ve(l, ue(this.Ma, l, g), g, this.n, l) : l
};
p.L = n("n");
p.F = function(a, b) {
  return Md(a, b)
};
p.Q = function(a, b) {
  return new Ie(this.qa, this.Ma, this.n, b, this.o)
};
p.P = n("m");
p.V = function() {
  return cb(Ke, this.m)
};
p.pa = function(a, b) {
  var c = [l], d = Fe(this.qa, this.Ma, b, c);
  return d == l ? Rb.g(c, 0) == l ? a : new Ie(this.qa, l, 0, this.m, l) : new Ie(this.qa, d.ua(), this.n - 1, this.m, l)
};
Ie;
var Ke = new Ie(lc, l, 0, l, 0), Cb = function() {
  function a(a) {
    var d = l;
    t(a) && (d = F(Array.prototype.slice.call(arguments, 0), 0));
    return b.call(this, d)
  }
  function b(a) {
    for(var a = Q(a), b = rb(Qd);;) {
      if(a) {
        var f = G(G(a)), b = Sc(b, H(a), H(G(a))), a = f
      }else {
        return tb(b)
      }
    }
  }
  a.A = 0;
  a.t = function(a) {
    a = Q(a);
    return b(a)
  };
  a.k = b;
  return a
}(), Le = function() {
  function a(a) {
    var d = l;
    t(a) && (d = F(Array.prototype.slice.call(arguments, 0), 0));
    return b.call(this, d)
  }
  function b(a) {
    for(var a = Q(a), b = Ke;;) {
      if(a) {
        var f = G(G(a)), b = Sb.j(b, H(a), H(G(a))), a = f
      }else {
        return b
      }
    }
  }
  a.A = 0;
  a.t = function(a) {
    a = Q(a);
    return b(a)
  };
  a.k = b;
  return a
}();
function Me(a) {
  return Ua(a)
}
var Ne = function() {
  function a(a) {
    var d = l;
    t(a) && (d = F(Array.prototype.slice.call(arguments, 0), 0));
    return b.call(this, d)
  }
  function b(a) {
    return u(Yc(a)) ? qc.g(function(a, b) {
      return Ob.g(u(a) ? a : Ud, b)
    }, a) : l
  }
  a.A = 0;
  a.t = function(a) {
    a = Q(a);
    return b(a)
  };
  a.k = b;
  return a
}();
function Oe(a, b, c) {
  this.m = a;
  this.cb = b;
  this.o = c;
  this.C = 1;
  this.p = 15077647
}
p = Oe.prototype;
p.Ra = function() {
  return new Pe(rb(this.cb))
};
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = yc(a)
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  return u(Pa(this.cb, b)) ? b : c
};
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return new Oe(this.m, Sb.j(this.cb, b, l), l)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = function() {
  return Q(ad.g(H, this.cb))
};
p.L = function(a) {
  return R(Q(a))
};
p.F = function(a, b) {
  var c = Zb(b);
  return c ? (c = R(a) === R(b)) ? Xc(function(b) {
    return kc(a, b)
  }, b) : c : c
};
p.Q = function(a, b) {
  return new Oe(b, this.cb, this.o)
};
p.P = n("m");
p.V = function() {
  return cb(Qe, this.m)
};
Oe;
var Qe = new Oe(l, Cb(), 0);
function Re(a) {
  for(var b = R(a), c = 0, d = rb(Qe);;) {
    if(c < b) {
      var f = c + 1, d = sb(d, a[c]), c = f
    }else {
      return tb(d)
    }
  }
}
function Pe(a) {
  this.La = a;
  this.p = 259;
  this.C = 34
}
p = Pe.prototype;
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return B.j(this.La, c, ec) === ec ? l : c;
      case 3:
        return B.j(this.La, c, ec) === ec ? d : c
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  return B.j(this.La, b, ec) === ec ? c : b
};
p.L = function() {
  return R(this.La)
};
p.Ta = function(a, b) {
  this.La = ub(this.La, b, l);
  return a
};
p.ab = function() {
  return new Oe(l, tb(this.La), l)
};
Pe;
function Se(a, b, c) {
  this.m = a;
  this.Za = b;
  this.o = c;
  this.C = 0;
  this.p = 417730831
}
p = Se.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = yc(a)
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  return u(Pa(this.Za, b)) ? b : c
};
p.call = function() {
  var a = l;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.I(this, c);
      case 3:
        return this.B(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return new Se(this.m, Sb.j(this.Za, b, l), l)
};
p.$a = function() {
  return ad.g(Me, kb(this.Za))
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.G = function() {
  return Q(ad.g(H, this.Za))
};
p.L = function() {
  return R(this.Za)
};
p.F = function(a, b) {
  var c = Zb(b);
  return c ? (c = R(a) === R(b)) ? Xc(function(b) {
    return kc(a, b)
  }, b) : c : c
};
p.Q = function(a, b) {
  return new Se(b, this.Za, this.o)
};
p.P = n("m");
p.V = function() {
  return cb(Te, this.m)
};
Se;
var Te = new Se(l, Le(), 0);
function Ue(a) {
  if(hc(a)) {
    return a
  }
  var b = ic(a);
  if(b ? b : jc(a)) {
    return b = a.lastIndexOf("/"), 0 > b ? vc.g(a, 2) : vc.g(a, b + 1)
  }
  e(Error([T("Doesn't support name: "), T(a)].join("")))
}
function Ve(a) {
  var b = ic(a);
  if(b ? b : jc(a)) {
    return b = a.lastIndexOf("/"), -1 < b ? vc.j(a, 2, b) : l
  }
  e(Error([T("Doesn't support namespace: "), T(a)].join("")))
}
function We(a, b, c, d, f) {
  this.m = a;
  this.start = b;
  this.end = c;
  this.step = d;
  this.o = f;
  this.C = 0;
  this.p = 32375006
}
p = We.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = Hb(a)
};
p.Da = function() {
  return 0 < this.step ? this.start + this.step < this.end ? new We(this.m, this.start + this.step, this.end, this.step, l) : l : this.start + this.step > this.end ? new We(this.m, this.start + this.step, this.end, this.step, l) : l
};
p.N = function(a, b) {
  return L(b, a)
};
p.toString = function() {
  return O.k(F([this], 0))
};
p.va = function(a, b) {
  return K.g(a, b)
};
p.wa = function(a, b, c) {
  return K.j(a, b, c)
};
p.G = function(a) {
  return 0 < this.step ? this.start < this.end ? a : l : this.start > this.end ? a : l
};
p.L = function(a) {
  return Nb(a.G(a)) ? 0 : Math.ceil((this.end - this.start) / this.step)
};
p.fa = n("start");
p.$ = function(a) {
  return a.G(a) != l ? new We(this.m, this.start + this.step, this.end, this.step, l) : M
};
p.F = function(a, b) {
  return Kb(a, b)
};
p.Q = function(a, b) {
  return new We(b, this.start, this.end, this.step, this.o)
};
p.P = n("m");
p.ea = function(a, b) {
  if(b < a.L(a)) {
    return this.start + b * this.step
  }
  var c = this.start > this.end;
  if(c ? 0 === this.step : c) {
    return this.start
  }
  e(Error("Index out of bounds"))
};
p.W = function(a, b, c) {
  c = b < a.L(a) ? this.start + b * this.step : ((a = this.start > this.end) ? 0 === this.step : a) ? this.start : c;
  return c
};
p.V = function() {
  return cb(M, this.m)
};
We;
var Xe = function() {
  function a(a, b) {
    for(;;) {
      var c = Q(b);
      if(u(c ? 0 < a : c)) {
        var c = a - 1, i = G(b), a = c, b = i
      }else {
        return l
      }
    }
  }
  function b(a) {
    for(;;) {
      if(Q(a)) {
        a = G(a)
      }else {
        return l
      }
    }
  }
  var c = l, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.g = a;
  return c
}(), Ye = function() {
  function a(a, b) {
    Xe.g(a, b);
    return b
  }
  function b(a) {
    Xe.h(a);
    return a
  }
  var c = l, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.g = a;
  return c
}();
function Z(a, b, c, d, f, h) {
  return Oc.k(V([b]), hd(gd(V([c]), ad.g(function(b) {
    return a.g ? a.g(b, f) : a.call(l, b, f)
  }, h))), F([V([d])], 0))
}
var $ = function Ze(b, c) {
  return b == l ? Db.h("nil") : aa === b ? Db.h("#<undefined>") : Oc.g(u(function() {
    var d = B.j(c, "\ufdd0'meta", l);
    return u(d) ? (d = b ? ((d = b.p & 131072) ? d : b.dc) ? g : b.p ? m : v(ab, b) : v(ab, b), u(d) ? Vb(b) : d) : d
  }()) ? Oc.k(V(["^"]), Ze(Vb(b), c), F([V([" "])], 0)) : l, function() {
    var c = b != l;
    return c ? b.zc : c
  }() ? b.yc(b) : function() {
    var c;
    c = b ? ((c = b.p & 536870912) ? c : b.U) ? g : b.p ? m : v(lb, b) : v(lb, b);
    return c
  }() ? mb(b, c) : u(b instanceof RegExp) ? Db.j('#"', b.source, '"') : Db.j("#<", "" + T(b), ">"))
}, O = function() {
  function a(a) {
    var d = l;
    t(a) && (d = F(Array.prototype.slice.call(arguments, 0), 0));
    return b.call(this, d)
  }
  function b(a) {
    var b = Vd(["\ufdd0'flush-on-newline", "\ufdd0'readably", "\ufdd0'meta", "\ufdd0'dup"], {"\ufdd0'flush-on-newline":g, "\ufdd0'readably":g, "\ufdd0'meta":m, "\ufdd0'dup":m}), f = new Ea, h = Q($(H(a), b));
    if(h) {
      for(var i = H(h);;) {
        if(f.append(i), i = G(h)) {
          h = i, i = H(h)
        }else {
          break
        }
      }
    }
    if(a = Q(G(a))) {
      for(i = H(a);;) {
        f.append(" ");
        if(h = Q($(i, b))) {
          for(i = H(h);;) {
            if(f.append(i), i = G(h)) {
              h = i, i = H(h)
            }else {
              break
            }
          }
        }
        if(a = G(a)) {
          i = a, a = H(i), h = i, i = a, a = h
        }else {
          break
        }
      }
    }
    return"" + T(f)
  }
  a.A = 0;
  a.t = function(a) {
    a = Q(a);
    return b(a)
  };
  a.k = b;
  return a
}();
Wd.prototype.U = g;
Wd.prototype.M = function(a, b) {
  return Z(function(a) {
    return Z($, "", " ", "", b, a)
  }, "{", ", ", "}", b, a)
};
lb.number = g;
mb.number = function(a) {
  return Db.h("" + T(a))
};
Gb.prototype.U = g;
Gb.prototype.M = function(a, b) {
  return Z($, "(", " ", ")", b, a)
};
Cd.prototype.U = g;
Cd.prototype.M = function(a, b) {
  return Z($, "[", " ", "]", b, a)
};
Jc.prototype.U = g;
Jc.prototype.M = function(a, b) {
  return Z($, "(", " ", ")", b, a)
};
Ie.prototype.U = g;
Ie.prototype.M = function(a, b) {
  return Z(function(a) {
    return Z($, "", " ", "", b, a)
  }, "{", ", ", "}", b, a)
};
Zd.prototype.U = g;
Zd.prototype.M = function(a, b) {
  return Z(function(a) {
    return Z($, "", " ", "", b, a)
  }, "{", ", ", "}", b, a)
};
Hd.prototype.U = g;
Hd.prototype.M = function(a, b) {
  return Z($, "#queue [", " ", "]", b, Q(a))
};
U.prototype.U = g;
U.prototype.M = function(a, b) {
  return Z($, "(", " ", ")", b, a)
};
Ib.prototype.U = g;
Ib.prototype.M = function(a, b) {
  return Z($, "(", " ", ")", b, a)
};
Se.prototype.U = g;
Se.prototype.M = function(a, b) {
  return Z($, "#{", " ", "}", b, a)
};
lb["boolean"] = g;
mb["boolean"] = function(a) {
  return Db.h("" + T(a))
};
lb.string = g;
mb.string = function(a, b) {
  return ic(a) ? Db.h([T(":"), T(function() {
    var b = Ve(a);
    return u(b) ? [T(b), T("/")].join("") : l
  }()), T(Ue(a))].join("")) : jc(a) ? Db.h([T(function() {
    var b = Ve(a);
    return u(b) ? [T(b), T("/")].join("") : l
  }()), T(Ue(a))].join("")) : Db.h(u((new Ec("\ufdd0'readably")).call(l, b)) ? ka(a) : a)
};
pe.prototype.U = g;
pe.prototype.M = function(a, b) {
  return Z($, "(", " ", ")", b, a)
};
X.prototype.U = g;
X.prototype.M = function(a, b) {
  return Z($, "[", " ", "]", b, a)
};
Bd.prototype.U = g;
Bd.prototype.M = function(a, b) {
  return Z($, "(", " ", ")", b, a)
};
re.prototype.U = g;
re.prototype.M = function(a, b) {
  return Z(function(a) {
    return Z($, "", " ", "", b, a)
  }, "{", ", ", "}", b, a)
};
ld.prototype.U = g;
ld.prototype.M = function(a, b) {
  return Z($, "[", " ", "]", b, a)
};
Oe.prototype.U = g;
Oe.prototype.M = function(a, b) {
  return Z($, "#{", " ", "}", b, a)
};
vd.prototype.U = g;
vd.prototype.M = function(a, b) {
  return Z($, "[", " ", "]", b, a)
};
zc.prototype.U = g;
zc.prototype.M = function(a, b) {
  return Z($, "(", " ", ")", b, a)
};
lb.array = g;
mb.array = function(a, b) {
  return Z($, "#<Array [", ", ", "]>", b, a)
};
lb["function"] = g;
mb["function"] = function(a) {
  return Db.j("#<", "" + T(a), ">")
};
Ac.prototype.U = g;
Ac.prototype.M = function() {
  return Db.h("()")
};
Y.prototype.U = g;
Y.prototype.M = function(a, b) {
  return Z($, "[", " ", "]", b, a)
};
Date.prototype.U = g;
Date.prototype.M = function(a) {
  function b(a, b) {
    for(var f = "" + T(a);;) {
      if(R(f) < b) {
        f = [T("0"), T(f)].join("")
      }else {
        return f
      }
    }
  }
  return Db.h([T('#inst "'), T(a.getUTCFullYear()), T("-"), T(b.g ? b.g(a.getUTCMonth() + 1, 2) : b.call(l, a.getUTCMonth() + 1, 2)), T("-"), T(b.g ? b.g(a.getUTCDate(), 2) : b.call(l, a.getUTCDate(), 2)), T("T"), T(b.g ? b.g(a.getUTCHours(), 2) : b.call(l, a.getUTCHours(), 2)), T(":"), T(b.g ? b.g(a.getUTCMinutes(), 2) : b.call(l, a.getUTCMinutes(), 2)), T(":"), T(b.g ? b.g(a.getUTCSeconds(), 2) : b.call(l, a.getUTCSeconds(), 2)), T("."), T(b.g ? b.g(a.getUTCMilliseconds(), 3) : b.call(l, a.getUTCMilliseconds(), 
  3)), T("-"), T('00:00"')].join(""))
};
Dc.prototype.U = g;
Dc.prototype.M = function(a, b) {
  return Z($, "(", " ", ")", b, a)
};
We.prototype.U = g;
We.prototype.M = function(a, b) {
  return Z($, "(", " ", ")", b, a)
};
qe.prototype.U = g;
qe.prototype.M = function(a, b) {
  return Z($, "(", " ", ")", b, a)
};
Sd.prototype.U = g;
Sd.prototype.M = function(a, b) {
  return Z(function(a) {
    return Z($, "", " ", "", b, a)
  }, "{", ", ", "}", b, a)
};
ve.prototype.U = g;
ve.prototype.M = function(a, b) {
  return Z($, "(", " ", ")", b, a)
};
vd.prototype.bc = g;
vd.prototype.Xb = function(a, b) {
  return mc.g(a, b)
};
function $e(a, b, c, d) {
  this.state = a;
  this.m = b;
  this.mc = c;
  this.X = d;
  this.C = 0;
  this.p = 2690809856
}
p = $e.prototype;
p.H = function(a) {
  return a[fa] || (a[fa] = ++ga)
};
p.mb = function(a, b, c) {
  var d = Q(this.X);
  if(d) {
    var f = H(d);
    Rb.j(f, 0, l);
    for(Rb.j(f, 1, l);;) {
      var h = f, f = Rb.j(h, 0, l), h = Rb.j(h, 1, l);
      h.D ? h.D(f, a, b, c) : h.call(l, f, a, b, c);
      if(d = G(d)) {
        f = d, d = H(f), h = f, f = d, d = h
      }else {
        return l
      }
    }
  }else {
    return l
  }
};
p.ub = function(a, b, c) {
  return a.X = Sb.j(this.X, b, c)
};
p.vb = function(a, b) {
  return a.X = Tb.g(this.X, b)
};
p.M = function(a, b) {
  return Oc.k(V(["#<Atom: "]), mb(this.state, b), F([">"], 0))
};
p.P = n("m");
p.Qa = n("state");
p.F = function(a, b) {
  return a === b
};
$e;
var af = function() {
  function a(a) {
    return new $e(a, l, l, l)
  }
  var b = l, c = function() {
    function a(c, d) {
      var j = l;
      t(d) && (j = F(Array.prototype.slice.call(arguments, 1), 0));
      return b.call(this, c, j)
    }
    function b(a, c) {
      var d = fc(c) ? Uc.g(Cb, c) : c, f = B.j(d, "\ufdd0'validator", l), d = B.j(d, "\ufdd0'meta", l);
      return new $e(a, d, f, l)
    }
    a.A = 1;
    a.t = function(a) {
      var c = H(a), a = I(a);
      return b(c, a)
    };
    a.k = b;
    return a
  }(), b = function(b, f) {
    switch(arguments.length) {
      case 1:
        return a.call(this, b);
      default:
        return c.k(b, F(arguments, 1))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.A = 1;
  b.t = c.t;
  b.h = a;
  b.k = c.k;
  return b
}();
function bf(a, b) {
  var c = a.mc;
  u(c) && !u(c.h ? c.h(b) : c.call(l, b)) && e(Error([T("Assert failed: "), T("Validator rejected reference state"), T("\n"), T(O.k(F([Ub(Db("\ufdd1'validate", "\ufdd1'new-value"), Cb("\ufdd0'line", 6440))], 0)))].join("")));
  c = a.state;
  a.state = b;
  nb(a, c, b);
  return b
}
var cf = function() {
  function a(a, b, c, d, f) {
    return bf(a, b.D ? b.D(a.state, c, d, f) : b.call(l, a.state, c, d, f))
  }
  function b(a, b, c, d) {
    return bf(a, b.j ? b.j(a.state, c, d) : b.call(l, a.state, c, d))
  }
  function c(a, b, c) {
    return bf(a, b.g ? b.g(a.state, c) : b.call(l, a.state, c))
  }
  function d(a, b) {
    return bf(a, b.h ? b.h(a.state) : b.call(l, a.state))
  }
  var f = l, h = function() {
    function a(c, d, f, h, i, P) {
      var N = l;
      t(P) && (N = F(Array.prototype.slice.call(arguments, 5), 0));
      return b.call(this, c, d, f, h, i, N)
    }
    function b(a, c, d, f, h, i) {
      return bf(a, Uc.k(c, a.state, d, f, h, F([i], 0)))
    }
    a.A = 5;
    a.t = function(a) {
      var c = H(a), d = H(G(a)), f = H(G(G(a))), h = H(G(G(G(a)))), i = H(G(G(G(G(a))))), a = I(G(G(G(G(a)))));
      return b(c, d, f, h, i, a)
    };
    a.k = b;
    return a
  }(), f = function(f, j, k, q, s, w) {
    switch(arguments.length) {
      case 2:
        return d.call(this, f, j);
      case 3:
        return c.call(this, f, j, k);
      case 4:
        return b.call(this, f, j, k, q);
      case 5:
        return a.call(this, f, j, k, q, s);
      default:
        return h.k(f, j, k, q, s, F(arguments, 5))
    }
    e("Invalid arity: " + arguments.length)
  };
  f.A = 5;
  f.t = h.t;
  f.g = d;
  f.j = c;
  f.D = b;
  f.Y = a;
  f.k = h.k;
  return f
}(), df = l, ef = function() {
  function a(a) {
    df == l && (df = af.h(0));
    return wc.h([T(a), T(cf.g(df, Eb))].join(""))
  }
  function b() {
    return c.h("G__")
  }
  var c = l, c = function(c) {
    switch(arguments.length) {
      case 0:
        return b.call(this);
      case 1:
        return a.call(this, c)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.J = b;
  c.h = a;
  return c
}();
function ff(a, b) {
  this.state = a;
  this.f = b;
  this.C = 0;
  this.p = 1073774592
}
ff.prototype.Qa = function() {
  var a = this;
  return(new Ec("\ufdd0'value")).call(l, cf.g(a.state, function(b) {
    var b = fc(b) ? Uc.g(Cb, b) : b, c = B.j(b, "\ufdd0'done", l);
    return u(c) ? b : Vd(["\ufdd0'done", "\ufdd0'value"], {"\ufdd0'done":g, "\ufdd0'value":a.f.J ? a.f.J() : a.f.call(l)})
  }))
};
ff;
var gf = af.h(Vd(["\ufdd0'parents", "\ufdd0'descendants", "\ufdd0'ancestors"], {"\ufdd0'parents":Ud, "\ufdd0'descendants":Ud, "\ufdd0'ancestors":Ud})), hf = function() {
  function a(a, b, h) {
    var i = Bb.g(b, h);
    if(!i && !(i = kc((new Ec("\ufdd0'ancestors")).call(l, a).call(l, b), h)) && (i = ac(h))) {
      if(i = ac(b)) {
        if(i = R(h) === R(b)) {
          for(var i = g, j = 0;;) {
            var k = Nb(i);
            if(k ? k : j === R(h)) {
              return i
            }
            i = c.j(a, b.h ? b.h(j) : b.call(l, j), h.h ? h.h(j) : h.call(l, j));
            j += 1
          }
        }else {
          return i
        }
      }else {
        return i
      }
    }else {
      return i
    }
  }
  function b(a, b) {
    return c.j(D(gf), a, b)
  }
  var c = l, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.j = a;
  return c
}(), jf = function() {
  function a(a, b) {
    return Wc(B.j((new Ec("\ufdd0'parents")).call(l, a), b, l))
  }
  function b(a) {
    return c.g(D(gf), a)
  }
  var c = l, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.g = a;
  return c
}();
function kf(a, b, c, d) {
  cf.g(a, function() {
    return D(b)
  });
  cf.g(c, function() {
    return D(d)
  })
}
var mf = function lf(b, c, d) {
  var f = D(d).call(l, b), f = u(u(f) ? f.h ? f.h(c) : f.call(l, c) : f) ? g : l;
  if(u(f)) {
    return f
  }
  f = function() {
    for(var f = jf.h(c);;) {
      if(0 < R(f)) {
        lf(b, H(f), d), f = I(f)
      }else {
        return l
      }
    }
  }();
  if(u(f)) {
    return f
  }
  f = function() {
    for(var f = jf.h(b);;) {
      if(0 < R(f)) {
        lf(H(f), c, d), f = I(f)
      }else {
        return l
      }
    }
  }();
  return u(f) ? f : m
};
function nf(a, b, c) {
  c = mf(a, b, c);
  return u(c) ? c : hf.g(a, b)
}
var pf = function of(b, c, d, f, h, i, j) {
  var k = qc.j(function(d, f) {
    var i = Rb.j(f, 0, l);
    Rb.j(f, 1, l);
    if(hf.g(c, i)) {
      var j;
      j = (j = d == l) ? j : nf(i, H(d), h);
      j = u(j) ? f : d;
      u(nf(H(j), i, h)) || e(Error([T("Multiple methods in multimethod '"), T(b), T("' match dispatch value: "), T(c), T(" -> "), T(i), T(" and "), T(H(j)), T(", and neither is preferred")].join("")));
      return j
    }
    return d
  }, l, D(f));
  if(u(k)) {
    if(Bb.g(D(j), D(d))) {
      return cf.D(i, Sb, c, H(G(k))), H(G(k))
    }
    kf(i, f, j, d);
    return of(b, c, d, f, h, i, j)
  }
  return l
};
function qf(a, b) {
  if(a ? a.$b : a) {
    return a.$b(0, b)
  }
  var c;
  var d = qf[r(a == l ? l : a)];
  d ? c = d : (d = qf._) ? c = d : e(x("IMultiFn.-get-method", a));
  return c.call(l, a, b)
}
function rf(a, b) {
  if(a ? a.Zb : a) {
    return a.Zb(a, b)
  }
  var c;
  var d = rf[r(a == l ? l : a)];
  d ? c = d : (d = rf._) ? c = d : e(x("IMultiFn.-dispatch", a));
  return c.call(l, a, b)
}
function sf(a, b, c, d, f, h, i, j) {
  this.name = a;
  this.hc = b;
  this.gc = c;
  this.Jb = d;
  this.Mb = f;
  this.kc = h;
  this.Lb = i;
  this.qb = j;
  this.p = 4194304;
  this.C = 64
}
sf.prototype.H = function(a) {
  return a[fa] || (a[fa] = ++ga)
};
sf.prototype.$b = function(a, b) {
  Bb.g(D(this.qb), D(this.Jb)) || kf(this.Lb, this.Mb, this.qb, this.Jb);
  var c = D(this.Lb).call(l, b);
  if(u(c)) {
    return c
  }
  c = pf(this.name, b, this.Jb, this.Mb, this.kc, this.Lb, this.qb);
  return u(c) ? c : D(this.Mb).call(l, this.gc)
};
sf.prototype.Zb = function(a, b) {
  var c = Uc.g(this.hc, b), d = qf(a, c);
  u(d) || e(Error([T("No method in multimethod '"), T(Ue), T("' for dispatch value: "), T(c)].join("")));
  return Uc.g(d, b)
};
sf;
sf.prototype.call = function() {
  function a(a, b) {
    var f = l;
    t(b) && (f = F(Array.prototype.slice.call(arguments, 1), 0));
    return rf(this, f)
  }
  function b(a, b) {
    return rf(this, b)
  }
  a.A = 1;
  a.t = function(a) {
    H(a);
    a = I(a);
    return b(0, a)
  };
  a.k = b;
  return a
}();
sf.prototype.apply = function(a, b) {
  return rf(this, b)
};
function tf(a) {
  this.Ob = a;
  this.C = 0;
  this.p = 543162368
}
tf.prototype.H = function(a) {
  return na(O.k(F([a], 0)))
};
tf.prototype.M = function() {
  return Db.h([T('#uuid "'), T(this.Ob), T('"')].join(""))
};
tf.prototype.F = function(a, b) {
  var c = J(tf, b);
  return c ? this.Ob === b.Ob : c
};
tf.prototype.toString = function() {
  return O.k(F([this], 0))
};
tf;
var uf = Math.PI, vf = 2 * uf;
function wf(a) {
  return Math.sin.h ? Math.sin.h(a) : Math.sin.call(l, a)
}
function xf(a) {
  return Math.cos.h ? Math.cos.h(a) : Math.cos.call(l, a)
}
var yf = function() {
  function a(a, b) {
    return Math.pow.g ? Math.pow.g(a, b) : Math.pow.call(l, a, b)
  }
  function b(a) {
    return Math.exp.h ? Math.exp.h(a) : Math.exp.call(l, a)
  }
  var c = l, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.g = a;
  return c
}(), zf = function() {
  function a(a, b) {
    return(Math.log.h ? Math.log.h(b) : Math.log.call(l, b)) / (Math.log.h ? Math.log.h(a) : Math.log.call(l, a))
  }
  function b(a) {
    return Math.log.h ? Math.log.h(a) : Math.log.call(l, a)
  }
  var c = l, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.g = a;
  return c
}();
function Af(a, b, c, d) {
  this.domain = a;
  this.S = b;
  this.w = c;
  this.v = d;
  this.C = 0;
  this.p = 619054859;
  2 < arguments.length ? (this.w = c, this.v = d) : this.v = this.w = l
}
p = Af.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = xc(a)
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  return"\ufdd0'domain" === b ? this.domain : "\ufdd0'range" === b ? this.S : B.j(this.v, b, c)
};
p.R = function(a, b, c) {
  return(E.g ? E.g("\ufdd0'domain", b) : E.call(l, "\ufdd0'domain", b)) ? new Af(c, this.S, this.w, this.v, l) : (E.g ? E.g("\ufdd0'range", b) : E.call(l, "\ufdd0'range", b)) ? new Af(this.domain, c, this.w, this.v, l) : new Af(this.domain, this.S, this.w, Sb.j(this.v, b, c), l)
};
p.call = function(a, b) {
  var c = Mb(this.domain) - H(this.domain), d = Mb(this.S) - H(this.S);
  return H(this.S) + d * ((b - H(this.domain)) / c)
};
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return ac(b) ? a.R(a, y.g(b, 0), y.g(b, 1)) : qc.j(Ja, a, b)
};
p.G = function() {
  return Q(Oc.g(V([W.k(F(["\ufdd0'domain", this.domain], 0)), W.k(F(["\ufdd0'range", this.S], 0))]), this.v))
};
p.M = function(a, b) {
  return Z(function(a) {
    return Z($, "", " ", "", b, a)
  }, [T("#"), T("_linear"), T("{")].join(""), ", ", "}", b, Oc.g(V([W.k(F(["\ufdd0'domain", this.domain], 0)), W.k(F(["\ufdd0'range", this.S], 0))]), this.v))
};
p.L = function() {
  return 2 + R(this.v)
};
p.F = function(a, b) {
  var c;
  c = u(b) ? (c = a.constructor === b.constructor) ? Md(a, b) : c : b;
  return u(c) ? g : m
};
p.Q = function(a, b) {
  return new Af(this.domain, this.S, b, this.v, this.o)
};
p.P = n("w");
p.pa = function(a, b) {
  return kc(Re(["\ufdd0'domain", "\ufdd0'range"]), b) ? Tb.g(Ub(jd(Ud, a), this.w), b) : new Af(this.domain, this.S, this.w, Wc(Tb.g(this.v, b)), l)
};
Af;
var Bf = function() {
  function a(a) {
    var d = l;
    t(a) && (d = F(Array.prototype.slice.call(arguments, 0), 0));
    return b.call(this, d)
  }
  function b(a) {
    a = Ne.k(F([Vd(["\ufdd0'domain", "\ufdd0'range"], {"\ufdd0'domain":V([0, 1]), "\ufdd0'range":V([0, 1])}), Uc.g(Cb, a)], 0));
    return new Af((new Ec("\ufdd0'domain")).call(l, a), (new Ec("\ufdd0'range")).call(l, a), l, Tb.k(a, "\ufdd0'domain", F(["\ufdd0'range"], 0)))
  }
  a.A = 0;
  a.t = function(a) {
    a = Q(a);
    return b(a)
  };
  a.k = b;
  return a
}();
function Cf(a, b, c, d) {
  this.domain = a;
  this.S = b;
  this.w = c;
  this.v = d;
  this.C = 0;
  this.p = 619054859;
  2 < arguments.length ? (this.w = c, this.v = d) : this.v = this.w = l
}
p = Cf.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = xc(a)
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  return"\ufdd0'domain" === b ? this.domain : "\ufdd0'range" === b ? this.S : B.j(this.v, b, c)
};
p.R = function(a, b, c) {
  return(E.g ? E.g("\ufdd0'domain", b) : E.call(l, "\ufdd0'domain", b)) ? new Cf(c, this.S, this.w, this.v, l) : (E.g ? E.g("\ufdd0'range", b) : E.call(l, "\ufdd0'range", b)) ? new Cf(this.domain, c, this.w, this.v, l) : new Cf(this.domain, this.S, this.w, Sb.j(this.v, b, c), l)
};
p.call = function(a, b) {
  return $c.g(Bf.k(F(["\ufdd0'domain", ad.g(yf, this.domain), "\ufdd0'range", this.S], 0)), yf).call(l, b)
};
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return ac(b) ? a.R(a, y.g(b, 0), y.g(b, 1)) : qc.j(Ja, a, b)
};
p.G = function() {
  return Q(Oc.g(V([W.k(F(["\ufdd0'domain", this.domain], 0)), W.k(F(["\ufdd0'range", this.S], 0))]), this.v))
};
p.M = function(a, b) {
  return Z(function(a) {
    return Z($, "", " ", "", b, a)
  }, [T("#"), T("_power"), T("{")].join(""), ", ", "}", b, Oc.g(V([W.k(F(["\ufdd0'domain", this.domain], 0)), W.k(F(["\ufdd0'range", this.S], 0))]), this.v))
};
p.L = function() {
  return 2 + R(this.v)
};
p.F = function(a, b) {
  var c;
  c = u(b) ? (c = a.constructor === b.constructor) ? Md(a, b) : c : b;
  return u(c) ? g : m
};
p.Q = function(a, b) {
  return new Cf(this.domain, this.S, b, this.v, this.o)
};
p.P = n("w");
p.pa = function(a, b) {
  return kc(Re(["\ufdd0'domain", "\ufdd0'range"]), b) ? Tb.g(Ub(jd(Ud, a), this.w), b) : new Cf(this.domain, this.S, this.w, Wc(Tb.g(this.v, b)), l)
};
Cf;
function Df(a, b, c, d) {
  this.domain = a;
  this.S = b;
  this.w = c;
  this.v = d;
  this.C = 0;
  this.p = 619054859;
  2 < arguments.length ? (this.w = c, this.v = d) : this.v = this.w = l
}
p = Df.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = xc(a)
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  return"\ufdd0'domain" === b ? this.domain : "\ufdd0'range" === b ? this.S : B.j(this.v, b, c)
};
p.R = function(a, b, c) {
  return(E.g ? E.g("\ufdd0'domain", b) : E.call(l, "\ufdd0'domain", b)) ? new Df(c, this.S, this.w, this.v, l) : (E.g ? E.g("\ufdd0'range", b) : E.call(l, "\ufdd0'range", b)) ? new Df(this.domain, c, this.w, this.v, l) : new Df(this.domain, this.S, this.w, Sb.j(this.v, b, c), l)
};
p.call = function(a, b) {
  return $c.g(Bf.k(F(["\ufdd0'domain", ad.g(zf, this.domain), "\ufdd0'range", this.S], 0)), zf).call(l, b)
};
p.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
p.N = function(a, b) {
  return ac(b) ? a.R(a, y.g(b, 0), y.g(b, 1)) : qc.j(Ja, a, b)
};
p.G = function() {
  return Q(Oc.g(V([W.k(F(["\ufdd0'domain", this.domain], 0)), W.k(F(["\ufdd0'range", this.S], 0))]), this.v))
};
p.M = function(a, b) {
  return Z(function(a) {
    return Z($, "", " ", "", b, a)
  }, [T("#"), T("_log"), T("{")].join(""), ", ", "}", b, Oc.g(V([W.k(F(["\ufdd0'domain", this.domain], 0)), W.k(F(["\ufdd0'range", this.S], 0))]), this.v))
};
p.L = function() {
  return 2 + R(this.v)
};
p.F = function(a, b) {
  var c;
  c = u(b) ? (c = a.constructor === b.constructor) ? Md(a, b) : c : b;
  return u(c) ? g : m
};
p.Q = function(a, b) {
  return new Df(this.domain, this.S, b, this.v, this.o)
};
p.P = n("w");
p.pa = function(a, b) {
  return kc(Re(["\ufdd0'domain", "\ufdd0'range"]), b) ? Tb.g(Ub(jd(Ud, a), this.w), b) : new Df(this.domain, this.S, this.w, Wc(Tb.g(this.v, b)), l)
};
Df;
var Ef;
function Ff(a) {
  var b = Ef;
  try {
    Ef = af.k(Qe, F(["\ufdd0'meta", Vd(["\ufdd0'no-deref-monitor"], {"\ufdd0'no-deref-monitor":g})], 0));
    var c = a.J ? a.J() : a.call(l);
    return Vd(["\ufdd0'res", "\ufdd0'derefed"], {"\ufdd0'res":c, "\ufdd0'derefed":D(Ef)})
  }finally {
    Ef = b
  }
}
function Gf(a) {
  u(function() {
    var b = Ef;
    return u(b) ? Nb((new Ec("\ufdd0'no-deref-monitor")).call(l, Vb(a))) : b
  }()) && cf.g(Ef, function(b) {
    return Ob.g(b, a)
  })
}
$e.prototype.Qa = function(a) {
  Gf(a);
  return a.state
};
function Hf(a, b, c, d, f, h, i, j) {
  this.state = a;
  this.ga = b;
  this.f = c;
  this.key = d;
  this.la = f;
  this.X = h;
  this.w = i;
  this.v = j;
  this.C = 0;
  this.p = 2766571274;
  6 < arguments.length ? (this.w = i, this.v = j) : this.v = this.w = l
}
p = Hf.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = xc(a)
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  return"\ufdd0'state" === b ? this.state : "\ufdd0'dirty?" === b ? this.ga : "\ufdd0'f" === b ? this.f : "\ufdd0'key" === b ? this.key : "\ufdd0'parent-watchables" === b ? this.la : "\ufdd0'watches" === b ? this.X : B.j(this.v, b, c)
};
p.R = function(a, b, c) {
  return(E.g ? E.g("\ufdd0'state", b) : E.call(l, "\ufdd0'state", b)) ? new Hf(c, this.ga, this.f, this.key, this.la, this.X, this.w, this.v, l) : (E.g ? E.g("\ufdd0'dirty?", b) : E.call(l, "\ufdd0'dirty?", b)) ? new Hf(this.state, c, this.f, this.key, this.la, this.X, this.w, this.v, l) : (E.g ? E.g("\ufdd0'f", b) : E.call(l, "\ufdd0'f", b)) ? new Hf(this.state, this.ga, c, this.key, this.la, this.X, this.w, this.v, l) : (E.g ? E.g("\ufdd0'key", b) : E.call(l, "\ufdd0'key", b)) ? new Hf(this.state, 
  this.ga, this.f, c, this.la, this.X, this.w, this.v, l) : (E.g ? E.g("\ufdd0'parent-watchables", b) : E.call(l, "\ufdd0'parent-watchables", b)) ? new Hf(this.state, this.ga, this.f, this.key, c, this.X, this.w, this.v, l) : (E.g ? E.g("\ufdd0'watches", b) : E.call(l, "\ufdd0'watches", b)) ? new Hf(this.state, this.ga, this.f, this.key, this.la, c, this.w, this.v, l) : new Hf(this.state, this.ga, this.f, this.key, this.la, this.X, this.w, Sb.j(this.v, b, c), l)
};
p.Qa = function(a) {
  Gf(a);
  if(Nb(this.ga)) {
    return a.state
  }
  var b = Ff(this.f), b = fc(b) ? Uc.g(Cb, b) : b, c = B.j(b, "\ufdd0'derefed", l), b = B.j(b, "\ufdd0'res", l), d = Q(this.la);
  if(d) {
    for(var f = H(d);;) {
      if(pb(f, this.key), f = G(d)) {
        d = f, f = H(d)
      }else {
        break
      }
    }
  }
  a.la = c;
  if(f = Q(c)) {
    for(c = H(f);;) {
      if(ob(c, this.key, function() {
        return function() {
          a.ga = g;
          return a.mb(a, l, l)
        }
      }(c, f)), c = G(f)) {
        f = c, c = H(f)
      }else {
        break
      }
    }
  }
  a.state = b;
  a.ga = m;
  return b
};
p.N = function(a, b) {
  return ac(b) ? a.R(a, y.g(b, 0), y.g(b, 1)) : qc.j(Ja, a, b)
};
p.mb = function() {
  var a = Q(this.X);
  if(a) {
    var b = H(a);
    Rb.j(b, 0, l);
    for(Rb.j(b, 1, l);;) {
      if(Rb.j(b, 0, l), b = Rb.j(b, 1, l), b.J ? b.J() : b.call(l), b = G(a)) {
        a = b, b = H(a)
      }else {
        return l
      }
    }
  }else {
    return l
  }
};
p.ub = function(a, b, c) {
  return a.X = Sb.j(this.X, b, c)
};
p.vb = function(a, b) {
  return a.X = Tb.g(this.X, b)
};
p.G = function() {
  return Q(Oc.g(V([W.k(F(["\ufdd0'state", this.state], 0)), W.k(F(["\ufdd0'dirty?", this.ga], 0)), W.k(F(["\ufdd0'f", this.f], 0)), W.k(F(["\ufdd0'key", this.key], 0)), W.k(F(["\ufdd0'parent-watchables", this.la], 0)), W.k(F(["\ufdd0'watches", this.X], 0))]), this.v))
};
p.M = function(a, b) {
  return Z(function(a) {
    return Z($, "", " ", "", b, a)
  }, [T("#"), T("ComputedObservable"), T("{")].join(""), ", ", "}", b, Oc.g(V([W.k(F(["\ufdd0'state", this.state], 0)), W.k(F(["\ufdd0'dirty?", this.ga], 0)), W.k(F(["\ufdd0'f", this.f], 0)), W.k(F(["\ufdd0'key", this.key], 0)), W.k(F(["\ufdd0'parent-watchables", this.la], 0)), W.k(F(["\ufdd0'watches", this.X], 0))]), this.v))
};
p.L = function() {
  return 6 + R(this.v)
};
p.F = function(a, b) {
  var c;
  c = u(b) ? (c = a.constructor === b.constructor) ? Md(a, b) : c : b;
  return u(c) ? g : m
};
p.Q = function(a, b) {
  return new Hf(this.state, this.ga, this.f, this.key, this.la, this.X, b, this.v, this.o)
};
p.P = n("w");
p.pa = function(a, b) {
  return kc(Re("\ufdd0'dirty? \ufdd0'state \ufdd0'key \ufdd0'f \ufdd0'watches \ufdd0'parent-watchables".split(" ")), b) ? Tb.g(Ub(jd(Ud, a), this.w), b) : new Hf(this.state, this.ga, this.f, this.key, this.la, this.X, this.w, Wc(Tb.g(this.v, b)), l)
};
Hf;
Hf.prototype.H = function(a) {
  return a.key
};
var If, Jf, Kf, Lf, Mf, Nf, Of, Pf, Qf, Rf, Sf, Tf, Uf, Vf = {}.hasOwnProperty;
Nf = function(a) {
  console.log(a)
};
Pf = /([^\s\.#]+)(?:#([^\s\.#]+))?(?:\.([^\s#]+))?/;
Of = /^(svg|g|rect|circle|clipPath|path|line|polygon|polyline|text|textPath)$/;
Qf = /^\s+$/;
Uf = {nc:"http://www.w3.org/1999/xhtml", lc:"http://www.w3.org/2000/svg"};
Lf = function(a) {
  var b, c;
  c = a.split(":");
  b = c[0];
  c = c[1];
  return c != l ? [Uf[b] || b, c] : a.match(Of) ? [Uf.lc, a] : [Uf.nc, a]
};
Jf = function(a) {
  return":*:" === a[0]
};
Sf = function(a) {
  return a != l && a instanceof Wf
};
If = function(a) {
  return a != l && a.forEach != l
};
Kf = function(a) {
  return a != l && !If(a) && !Sf(a) && a instanceof Object
};
Rf = function(a) {
  return a != l && a.substring != l
};
Mf = function(a) {
  return a != l && a.toFixed != l
};
Tf = function(a) {
  return 8 === a.nodeType || 3 === a.nodeType && a.textContent.match(Qf)
};
function Xf(a, b) {
  var c, d, f;
  if(b.style != l) {
    f = b.style;
    var h, i, j;
    j = [];
    for(h in f) {
      Vf.call(f, h) && (i = f[h], j.push(a.style[pa(h)] = i))
    }
    delete b.style
  }
  if(b.properties != l) {
    f = b.properties;
    i = [];
    for(d in f) {
      Vf.call(f, d) && (h = f[d], i.push(a[d] = h))
    }
    delete b.properties
  }
  f = [];
  for(c in b) {
    Vf.call(b, c) && (d = b[c], d != l ? f.push(a.setAttribute(c, d)) : f.push(a.removeAttribute(c)))
  }
}
function Yf(a, b) {
  return b != l ? a.__singult_data__ = b : a.__singult_data__
}
function Zf(a) {
  return Mf(a) ? a.toString() : If(a) ? $f(a) : a
}
function $f(a) {
  var b, c, d, f, h;
  f = a[0];
  c = Kf(a[1]) ? [a[1], a.slice(2)] : [{}, a.slice(1)];
  a = c[0];
  c = c[1];
  d = f.match(Pf);
  h = d[1];
  f = d[2];
  d = d[3];
  f != l && (a.id = f);
  d != l && (a["class"] = d.replace(/\./g, " ") + (a["class"] != l ? " " + a["class"] : ""));
  f = Lf(h);
  h = f[0];
  f = f[1];
  b = [];
  c.forEach(function(a) {
    if(a != l) {
      return Jf(a) ? a.slice(1).forEach(function(a) {
        return b.push(Zf(a))
      }) : b.push(Zf(a))
    }
  });
  return{jc:h, ac:f, Rb:a, children:b}
}
function ag(a) {
  var b, c;
  Sf(a) && e(Error("Unify must be the first and only child of its parent."));
  if(Rf(a)) {
    return document.createTextNode(a)
  }
  b = document.createElementNS(a.jc, a.ac);
  Xf(b, a.Rb);
  Sf(c = a.children[0]) ? c.aa != l ? c.data.forEach(function(a) {
    var f;
    f = c.aa(a);
    Yf(f, a);
    return b.appendChild(f)
  }) : c.data.forEach(function(a) {
    var f;
    f = ag(Zf(c.ca(a)));
    Yf(f, a);
    return b.appendChild(f)
  }) : a.children.forEach(function(a) {
    return b.appendChild(ag(a))
  });
  return b
}
function Wf(a, b, c, d, f, h, i) {
  this.data = a;
  this.ca = b;
  this.ia = c;
  this.aa = d;
  this.update = f;
  this.ha = h;
  this.ic = i;
  return this
}
function bg(a, b) {
  var c, d, f, h, i, j, k, q, s;
  d = b.aa || function(c) {
    c = ag(Zf(b.ca(c)));
    a.appendChild(c);
    return c
  };
  q = b.update || function(a, c) {
    return cg(a, Zf(b.ca(c)))
  };
  f = b.ha || function(b) {
    return a.removeChild(b)
  };
  j = b.ia || function(a, b) {
    return b
  };
  c = a.childNodes;
  k = {};
  for(h = 0;h < c.length;) {
    i = "\x00" + j(Yf(c[h]), h), k[i] = c[h], h += 1
  }
  b.data.forEach(function(a, c) {
    var f, h;
    i = "\x00" + j(a, c);
    if(f = k[i]) {
      return b.ic ? (f = q(f, a), Yf(f, a)) : (h = Yf(f), h = h.F != l ? h.F(h, a) : h === a, h || (f = q(f, a), Yf(f, a))), delete k[i]
    }
    f = d(a);
    return Yf(f, a)
  });
  for(s in k) {
    c = k[s], f(c)
  }
}
function cg(a, b) {
  var c, d, f, h;
  if(Sf(b)) {
    bg(a, b)
  }else {
    a.nodeName.toLowerCase() !== b.ac.toLowerCase() && (Nf(a), Nf(b), e("Cannot merge $e into node of different type"));
    Xf(a, b.Rb);
    if(a.hasChildNodes()) {
      for(f = d = h = a.childNodes.length - 1;0 >= h ? 0 >= d : 0 <= d;f = 0 >= h ? ++d : --d) {
        c = a.childNodes[f], Tf(c) && a.removeChild(c)
      }
    }
    if(Sf(b.children[0])) {
      cg(a, b.children[0])
    }else {
      if(a.childNodes.length > b.children.length) {
        for(f = c = d = a.childNodes.length - 1;0 >= d ? 0 >= c : 0 <= c;f = 0 >= d ? ++c : --c) {
          a.removeChild(a.childNodes[f])
        }
      }
      for(f = 0;f < b.children.length;) {
        d = b.children[f] || "", c = a.childNodes[f], Rf(d) ? c != l ? c.textContent = d : a.appendChild(document.createTextNode(d)) : Kf(d) ? c != l ? cg(c, d) : a.appendChild(ag(d)) : (Nf(c), Nf(d), e("Cannot merge children")), f += 1
      }
    }
  }
  return a
}
;function dg(a, b, c, d, f, h, i, j, k) {
  this.data = a;
  this.ca = b;
  this.ia = c;
  this.aa = d;
  this.update = f;
  this.ha = h;
  this.na = i;
  this.w = j;
  this.v = k;
  this.C = 0;
  this.p = 619054858;
  7 < arguments.length ? (this.w = j, this.v = k) : this.v = this.w = l
}
p = dg.prototype;
p.H = function(a) {
  var b = this.o;
  return b != l ? b : this.o = a = xc(a)
};
p.I = function(a, b) {
  return a.B(a, b, l)
};
p.B = function(a, b, c) {
  return"\ufdd0'data" === b ? this.data : "\ufdd0'mapping" === b ? this.ca : "\ufdd0'key-fn" === b ? this.ia : "\ufdd0'enter" === b ? this.aa : "\ufdd0'update" === b ? this.update : "\ufdd0'exit" === b ? this.ha : "\ufdd0'force-update?" === b ? this.na : B.j(this.v, b, c)
};
p.R = function(a, b, c) {
  return(E.g ? E.g("\ufdd0'data", b) : E.call(l, "\ufdd0'data", b)) ? new dg(c, this.ca, this.ia, this.aa, this.update, this.ha, this.na, this.w, this.v, l) : (E.g ? E.g("\ufdd0'mapping", b) : E.call(l, "\ufdd0'mapping", b)) ? new dg(this.data, c, this.ia, this.aa, this.update, this.ha, this.na, this.w, this.v, l) : (E.g ? E.g("\ufdd0'key-fn", b) : E.call(l, "\ufdd0'key-fn", b)) ? new dg(this.data, this.ca, c, this.aa, this.update, this.ha, this.na, this.w, this.v, l) : (E.g ? E.g("\ufdd0'enter", 
  b) : E.call(l, "\ufdd0'enter", b)) ? new dg(this.data, this.ca, this.ia, c, this.update, this.ha, this.na, this.w, this.v, l) : (E.g ? E.g("\ufdd0'update", b) : E.call(l, "\ufdd0'update", b)) ? new dg(this.data, this.ca, this.ia, this.aa, c, this.ha, this.na, this.w, this.v, l) : (E.g ? E.g("\ufdd0'exit", b) : E.call(l, "\ufdd0'exit", b)) ? new dg(this.data, this.ca, this.ia, this.aa, this.update, c, this.na, this.w, this.v, l) : (E.g ? E.g("\ufdd0'force-update?", b) : E.call(l, "\ufdd0'force-update?", 
  b)) ? new dg(this.data, this.ca, this.ia, this.aa, this.update, this.ha, c, this.w, this.v, l) : new dg(this.data, this.ca, this.ia, this.aa, this.update, this.ha, this.na, this.w, Sb.j(this.v, b, c), l)
};
p.N = function(a, b) {
  return ac(b) ? a.R(a, y.g(b, 0), y.g(b, 1)) : qc.j(Ja, a, b)
};
p.G = function() {
  return Q(Oc.g(V([W.k(F(["\ufdd0'data", this.data], 0)), W.k(F(["\ufdd0'mapping", this.ca], 0)), W.k(F(["\ufdd0'key-fn", this.ia], 0)), W.k(F(["\ufdd0'enter", this.aa], 0)), W.k(F(["\ufdd0'update", this.update], 0)), W.k(F(["\ufdd0'exit", this.ha], 0)), W.k(F(["\ufdd0'force-update?", this.na], 0))]), this.v))
};
p.M = function(a, b) {
  return Z(function(a) {
    return Z($, "", " ", "", b, a)
  }, [T("#"), T("Unify"), T("{")].join(""), ", ", "}", b, Oc.g(V([W.k(F(["\ufdd0'data", this.data], 0)), W.k(F(["\ufdd0'mapping", this.ca], 0)), W.k(F(["\ufdd0'key-fn", this.ia], 0)), W.k(F(["\ufdd0'enter", this.aa], 0)), W.k(F(["\ufdd0'update", this.update], 0)), W.k(F(["\ufdd0'exit", this.ha], 0)), W.k(F(["\ufdd0'force-update?", this.na], 0))]), this.v))
};
p.L = function() {
  return 7 + R(this.v)
};
p.F = function(a, b) {
  var c;
  c = u(b) ? (c = a.constructor === b.constructor) ? Md(a, b) : c : b;
  return u(c) ? g : m
};
p.Q = function(a, b) {
  return new dg(this.data, this.ca, this.ia, this.aa, this.update, this.ha, this.na, b, this.v, this.o)
};
p.P = n("w");
p.pa = function(a, b) {
  return kc(Re("\ufdd0'data \ufdd0'force-update? \ufdd0'enter \ufdd0'exit \ufdd0'key-fn \ufdd0'update \ufdd0'mapping".split(" ")), b) ? Tb.g(Ub(jd(Ud, a), this.w), b) : new dg(this.data, this.ca, this.ia, this.aa, this.update, this.ha, this.na, this.w, Wc(Tb.g(this.v, b)), l)
};
dg;
var fg = function eg(b) {
  if(J(dg, b)) {
    var c = fc(b) ? Uc.g(Cb, b) : b, d = B.j(c, "\ufdd0'force-update?", l), b = B.j(c, "\ufdd0'exit", l), f = B.j(c, "\ufdd0'update", l), h = B.j(c, "\ufdd0'enter", l), i = B.j(c, "\ufdd0'key-fn", l), j = B.j(c, "\ufdd0'mapping", l), k = B.j(c, "\ufdd0'data", l), c = function() {
      var b = [], c = Q(k);
      if(c) {
        for(var d = H(c);;) {
          if(b.push(d), d = G(c)) {
            c = d, d = H(c)
          }else {
            break
          }
        }
      }
      return b
    }();
    return new Wf(c, function(b) {
      return eg(j.h ? j.h(b) : j.call(l, b))
    }, i, h, f, b, d)
  }
  if(ic(b)) {
    return Ue(b)
  }
  if($b(b)) {
    d = {};
    if(b = Q(b)) {
      f = H(b);
      Rb.j(f, 0, l);
      for(Rb.j(f, 1, l);;) {
        if(h = f, f = Rb.j(h, 0, l), h = Rb.j(h, 1, l), f = eg(f), hc(f) || e("Cannot convert; JavaScript map keys must be strings"), d[f] = eg(h), b = G(b)) {
          f = b, b = H(f), h = f, f = b, b = h
        }else {
          break
        }
      }
    }
    return d
  }
  if(fc(b)) {
    d = [];
    d.push(":*:");
    if(f = Q(b)) {
      for(b = H(f);;) {
        if(d.push(eg(b)), b = G(f)) {
          f = b, b = H(f)
        }else {
          break
        }
      }
    }
    return d
  }
  if(Yb(b)) {
    d = [];
    if(f = Q(b)) {
      for(b = H(f);;) {
        if(d.push(eg(b)), b = G(f)) {
          f = b, b = H(f)
        }else {
          break
        }
      }
    }
    return d
  }
  return b
};
function gg() {
  var a = hg, b = D(ig);
  return b == l ? l : cg.g ? cg.g(a, Zf.h ? Zf.h(fg(b)) : Zf.call(l, fg(b))) : cg.call(l, a, Zf.h ? Zf.h(fg(b)) : Zf.call(l, fg(b)))
}
;function jg() {
  return da.navigator ? da.navigator.userAgent : l
}
Ba = Aa = za = ya = m;
var kg;
if(kg = jg()) {
  var lg = da.navigator;
  ya = 0 == kg.indexOf("Opera");
  za = !ya && -1 != kg.indexOf("MSIE");
  Aa = !ya && -1 != kg.indexOf("WebKit");
  Ba = !ya && !Aa && "Gecko" == lg.product
}
var mg = za, ng = Ba, og = Aa, ma;
a: {
  var pg = "", qg;
  if(ya && da.opera) {
    var rg = da.opera.version, pg = "function" == typeof rg ? rg() : rg
  }else {
    if(ng ? qg = /rv\:([^\);]+)(\)|;)/ : mg ? qg = /MSIE\s+([^\);]+)(\)|;)/ : og && (qg = /WebKit\/(\S+)/), qg) {
      var sg = qg.exec(jg()), pg = sg ? sg[1] : ""
    }
  }
  if(mg) {
    var tg, ug = da.document;
    tg = ug ? ug.documentMode : aa;
    if(tg > parseFloat(pg)) {
      ma = "" + tg;
      break a
    }
  }
  ma = pg
}
var vg = {}, wg = {};
function xg() {
  return wg[9] || (wg[9] = mg && document.documentMode && 9 <= document.documentMode)
}
;!mg || xg();
!ng && !mg || mg && xg() || ng && (vg["1.9.1"] || (vg["1.9.1"] = 0 <= la("1.9.1")));
mg && !vg["9"] && (vg["9"] = 0 <= la("9"));
NodeList.prototype.G = function(a) {
  return F.g(a, 0)
};
HTMLCollection.prototype.G = function(a) {
  return F.g(a, 0)
};
Node.prototype.H = ba();
function yg(a) {
  if(a ? a.pb : a) {
    return a.pb(a)
  }
  var b;
  var c = yg[r(a == l ? l : a)];
  c ? b = c : (c = yg._) ? b = c : e(x("IDom.->dom", a));
  return b.call(l, a)
}
vd.prototype.pb = function(a) {
  return ag.h ? ag.h(Zf.h ? Zf.h(fg(a)) : Zf.call(l, fg(a))) : ag.call(l, Zf.h ? Zf.h(fg(a)) : Zf.call(l, fg(a)))
};
Node.prototype.pb = ba();
yg.string = function(a) {
  return zg.h(a)
};
var zg = function() {
  function a(a, b) {
    return yg(b).querySelector(a)
  }
  function b(a) {
    return document.querySelector(a)
  }
  var c = l, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.g = a;
  return c
}();
var Ag = vf - 1.0E-7, Bg = function() {
  function a(a) {
    var d = l;
    t(a) && (d = F(Array.prototype.slice.call(arguments, 0), 0));
    return b.call(this, d)
  }
  function b(a) {
    var b = fc(a) ? Uc.g(Cb, a) : a, f = B.j(b, "\ufdd0'angle-offset", 0), h = B.j(b, "\ufdd0'end-angle", uf), i = B.j(b, "\ufdd0'start-angle", 0), a = B.j(b, "\ufdd0'outer-radius", 1), b = B.j(b, "\ufdd0'inner-radius", 0), f = pc.h(V([f + i, f + h])), j = Rb.j(f, 0, l), k = Rb.j(f, 1, l), f = k - j, h = f < uf ? "0" : "1", i = wf(j), j = xf(j), q = wf(k), k = xf(k);
    return f >= Ag ? [T("M0,"), T(a), T("A"), T(a), T(","), T(a), T(" 0 1,1 0,"), T(-a), T("A"), T(a), T(","), T(a), T(" 0 1,1 0,"), T(a), T(Vc.g(0, b) ? [T("M0,"), T(b), T("A"), T(b), T(","), T(b), T(" 0 1,0 0,"), T(-b), T("A"), T(b), T(","), T(b), T(" 0 1,0 0,"), T(b)].join("") : l), T("Z")].join("") : [T("M"), T(a * j), T(","), T(a * i), T("A"), T(a), T(","), T(a), T(" 0 "), T(h), T(",1 "), T(a * k), T(","), T(a * q), T(Vc.g(0, b) ? [T("L"), T(b * k), T(","), T(b * q), T("A"), T(b), T(","), T(b), 
    T(" 0 "), T(h), T(",0 "), T(b * j), T(","), T(b * i)].join("") : "L0,0"), T("Z")].join("")
  }
  a.A = 0;
  a.t = function(a) {
    a = Q(a);
    return b(a)
  };
  a.k = b;
  return a
}();
var Cg = af.h(Vd(["\ufdd0'hours", "\ufdd0'minutes", "\ufdd0'seconds", "\ufdd0'millis"], {"\ufdd0'hours":50, "\ufdd0'minutes":60, "\ufdd0'seconds":70, "\ufdd0'millis":80})), Dg = Vd(["\ufdd0'hours", "\ufdd0'minutes", "\ufdd0'seconds", "\ufdd0'millis"], {"\ufdd0'hours":275, "\ufdd0'minutes":200, "\ufdd0'seconds":110, "\ufdd0'millis":30}), ig = function() {
  var a = new Hf(l, g, function() {
    return V(["\ufdd0'svg", V(["\ufdd0'g", Vd(["\ufdd0'transform"], {"\ufdd0'transform":"translate(300,300)rotate(-90)"}), Ye.h(function() {
      var a = function d(a) {
        return new U(l, m, function() {
          for(;;) {
            if(Q(a)) {
              var b = H(a), i = L, j = B.j(D(Cg), b, l), j = vf * j / 100, k = j + uf, q = k + uf, s = B.j(Dg, b, l), b = V(["\ufdd0'g.slice", V(["\ufdd0'path", Vd(["\ufdd0'class", "\ufdd0'd"], {"\ufdd0'class":[T(Ue(b)), T("1")].join(""), "\ufdd0'd":Bg.k(F(["\ufdd0'outer-radius", s, "\ufdd0'start-angle", j, "\ufdd0'end-angle", k], 0))})]), V(["\ufdd0'path", Vd(["\ufdd0'class", "\ufdd0'd"], {"\ufdd0'class":[T(Ue(b)), T("2")].join(""), "\ufdd0'd":Bg.k(F(["\ufdd0'outer-radius", s, "\ufdd0'start-angle", 
              k, "\ufdd0'end-angle", q], 0))})])]);
              return i(b, d(I(a)))
            }
            return l
          }
        }, l)
      };
      return a.h ? a.h(V(["\ufdd0'hours", "\ufdd0'minutes", "\ufdd0'seconds", "\ufdd0'millis"])) : a.call(l, V(["\ufdd0'hours", "\ufdd0'minutes", "\ufdd0'seconds", "\ufdd0'millis"]))
    }())])])
  }, ef.h("computed-observable"), Ud, Ud);
  D(a);
  return a
}(), hg = yg("#clocky");
gg();
ob(ig, "\ufdd0'update-dom", function() {
  return gg()
});
ig;
(function Eg() {
  window.requestAnimationFrame(Eg);
  var b = new Date, c = b.getHours(), d = sc(c, 12);
  return bf(Cg, Vd(["\ufdd0'hours", "\ufdd0'minutes", "\ufdd0'seconds", "\ufdd0'millis"], {"\ufdd0'hours":100 * (c - 12 * d) / 12, "\ufdd0'minutes":100 * b.getMinutes() / 60, "\ufdd0'seconds":100 * b.getSeconds() / 60, "\ufdd0'millis":100 * b.getMilliseconds() / 1E3}))
})();
