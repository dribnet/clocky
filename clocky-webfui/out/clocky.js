function e(a) {
  throw a;
}
var aa = void 0, g = !0, k = null, m = !1;
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
function ca(a) {
  return function() {
    return a
  }
}
var o, da = this;
function p(a) {
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
function q(a) {
  return a !== aa
}
function ea(a) {
  return"string" == typeof a
}
function fa(a) {
  return"number" == typeof a
}
var ga = "closure_uid_" + Math.floor(2147483648 * Math.random()).toString(36), ha = 0;
var ia = {"\x00":"\\0", "\u0008":"\\b", "\u000c":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"}, ja = {"'":"\\'"};
function ka(a) {
  a = "" + a;
  if(a.quote) {
    return a.quote()
  }
  for(var b = ['"'], c = 0;c < a.length;c++) {
    var d = a.charAt(c), f = d.charCodeAt(0), h = b, i = c + 1, j;
    if(!(j = ia[d])) {
      if(!(31 < f && 127 > f)) {
        if(d in ja) {
          d = ja[d]
        }else {
          if(d in ia) {
            d = ja[d] = ia[d]
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
function na(a) {
  for(var b = 0, c = ("" + oa).replace(/^[\s\xa0]+|[\s\xa0]+$/g, "").split("."), a = ("" + a).replace(/^[\s\xa0]+|[\s\xa0]+$/g, "").split("."), d = Math.max(c.length, a.length), f = 0;0 == b && f < d;f++) {
    var h = c[f] || "", i = a[f] || "", j = RegExp("(\\d*)(\\D*)", "g"), l = RegExp("(\\d*)(\\D*)", "g");
    do {
      var r = j.exec(h) || ["", "", ""], t = l.exec(i) || ["", "", ""];
      if(0 == r[0].length && 0 == t[0].length) {
        break
      }
      b = ((0 == r[1].length ? 0 : parseInt(r[1], 10)) < (0 == t[1].length ? 0 : parseInt(t[1], 10)) ? -1 : (0 == r[1].length ? 0 : parseInt(r[1], 10)) > (0 == t[1].length ? 0 : parseInt(t[1], 10)) ? 1 : 0) || ((0 == r[2].length) < (0 == t[2].length) ? -1 : (0 == r[2].length) > (0 == t[2].length) ? 1 : 0) || (r[2] < t[2] ? -1 : r[2] > t[2] ? 1 : 0)
    }while(0 == b)
  }
  return b
}
function pa(a) {
  for(var b = 0, c = 0;c < a.length;++c) {
    b = 31 * b + a.charCodeAt(c), b %= 4294967296
  }
  return b
}
;var qa = Array.prototype;
function ra(a, b) {
  qa.sort.call(a, b || sa)
}
function ta(a, b) {
  for(var c = 0;c < a.length;c++) {
    a[c] = {index:c, value:a[c]}
  }
  var d = b || sa;
  ra(a, function(a, b) {
    return d(a.value, b.value) || a.index - b.index
  });
  for(c = 0;c < a.length;c++) {
    a[c] = a[c].value
  }
}
function sa(a, b) {
  return a > b ? 1 : a < b ? -1 : 0
}
;function ua(a, b) {
  for(var c in a) {
    b.call(aa, a[c], c, a)
  }
}
function va(a) {
  var b = {}, c;
  for(c in a) {
    b[c] = a[c]
  }
  return b
}
;function wa(a, b) {
  var c = Array.prototype.slice.call(arguments), d = c.shift();
  "undefined" == typeof d && e(Error("[goog.string.format] Template required"));
  return d.replace(/%([0\-\ \+]*)(\d+)?(\.(\d+))?([%sfdiu])/g, function(a, b, d, j, l, r, t, x) {
    if("%" == r) {
      return"%"
    }
    var y = c.shift();
    "undefined" == typeof y && e(Error("[goog.string.format] Not enough arguments"));
    arguments[0] = y;
    return wa.za[r].apply(k, arguments)
  })
}
wa.za = {};
wa.za.s = function(a, b, c) {
  return isNaN(c) || "" == c || a.length >= c ? a : a = -1 < b.indexOf("-", 0) ? a + Array(c - a.length + 1).join(" ") : Array(c - a.length + 1).join(" ") + a
};
wa.za.f = function(a, b, c, d, f) {
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
wa.za.d = function(a, b, c, d, f, h, i, j) {
  return wa.za.f(parseInt(a, 10), b, c, d, 0, h, i, j)
};
wa.za.i = wa.za.d;
wa.za.u = wa.za.d;
var xa, ya, Aa, Ba, Ca;
(Ca = "ScriptEngine" in da && "JScript" == da.ScriptEngine()) && (da.ScriptEngineMajorVersion(), da.ScriptEngineMinorVersion(), da.ScriptEngineBuildVersion());
function Da(a, b) {
  this.ha = Ca ? [] : "";
  a != k && this.append.apply(this, arguments)
}
Ca ? (Da.prototype.pb = 0, Da.prototype.append = function(a, b, c) {
  b == k ? this.ha[this.pb++] = a : (this.ha.push.apply(this.ha, arguments), this.pb = this.ha.length);
  return this
}) : Da.prototype.append = function(a, b, c) {
  this.ha += a;
  if(b != k) {
    for(var d = 1;d < arguments.length;d++) {
      this.ha += arguments[d]
    }
  }
  return this
};
Da.prototype.clear = function() {
  if(Ca) {
    this.pb = this.ha.length = 0
  }else {
    this.ha = ""
  }
};
Da.prototype.toString = function() {
  if(Ca) {
    var a = this.ha.join("");
    this.clear();
    a && this.append(a);
    return a
  }
  return this.ha
};
function s(a) {
  return a != k && a !== m
}
function u(a, b) {
  return a[p(b == k ? k : b)] ? g : a._ ? g : m
}
function v(a, b) {
  return Error(["No protocol method ", a, " defined for type ", p(b), ": ", b].join(""))
}
var Ea = function() {
  var a = k, a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return Array(b);
      case 2:
        return a.k(c)
    }
    e("Invalid arity: " + arguments.length)
  };
  a.k = function(a) {
    return Array(a)
  };
  a.g = function(b, c) {
    return a.k(c)
  };
  return a
}(), Fa = {};
function Ga(a) {
  if(a ? a.K : a) {
    return a.K(a)
  }
  var b;
  var c = Ga[p(a == k ? k : a)];
  c ? b = c : (c = Ga._) ? b = c : e(v("ICounted.-count", a));
  return b.call(k, a)
}
var Ha = {};
function Ia(a, b) {
  if(a ? a.M : a) {
    return a.M(a, b)
  }
  var c;
  var d = Ia[p(a == k ? k : a)];
  d ? c = d : (d = Ia._) ? c = d : e(v("ICollection.-conj", a));
  return c.call(k, a, b)
}
var Ja = {}, w = function() {
  function a(a, b, c) {
    if(a ? a.V : a) {
      return a.V(a, b, c)
    }
    var i;
    var j = w[p(a == k ? k : a)];
    j ? i = j : (j = w._) ? i = j : e(v("IIndexed.-nth", a));
    return i.call(k, a, b, c)
  }
  function b(a, b) {
    if(a ? a.aa : a) {
      return a.aa(a, b)
    }
    var c;
    var i = w[p(a == k ? k : a)];
    i ? c = i : (i = w._) ? c = i : e(v("IIndexed.-nth", a));
    return c.call(k, a, b)
  }
  var c = k, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.h = a;
  return c
}(), Ka = {}, La = {};
function z(a) {
  if(a ? a.ba : a) {
    return a.ba(a)
  }
  var b;
  var c = z[p(a == k ? k : a)];
  c ? b = c : (c = z._) ? b = c : e(v("ISeq.-first", a));
  return b.call(k, a)
}
function Ma(a) {
  if(a ? a.Y : a) {
    return a.Y(a)
  }
  var b;
  var c = Ma[p(a == k ? k : a)];
  c ? b = c : (c = Ma._) ? b = c : e(v("ISeq.-rest", a));
  return b.call(k, a)
}
var Na = {};
function Oa(a) {
  if(a ? a.Da : a) {
    return a.Da(a)
  }
  var b;
  var c = Oa[p(a == k ? k : a)];
  c ? b = c : (c = Oa._) ? b = c : e(v("INext.-next", a));
  return b.call(k, a)
}
var A = function() {
  function a(a, b, c) {
    if(a ? a.A : a) {
      return a.A(a, b, c)
    }
    var i;
    var j = A[p(a == k ? k : a)];
    j ? i = j : (j = A._) ? i = j : e(v("ILookup.-lookup", a));
    return i.call(k, a, b, c)
  }
  function b(a, b) {
    if(a ? a.J : a) {
      return a.J(a, b)
    }
    var c;
    var i = A[p(a == k ? k : a)];
    i ? c = i : (i = A._) ? c = i : e(v("ILookup.-lookup", a));
    return c.call(k, a, b)
  }
  var c = k, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.h = a;
  return c
}();
function Pa(a, b) {
  if(a ? a.Oa : a) {
    return a.Oa(a, b)
  }
  var c;
  var d = Pa[p(a == k ? k : a)];
  d ? c = d : (d = Pa._) ? c = d : e(v("IAssociative.-contains-key?", a));
  return c.call(k, a, b)
}
function Qa(a, b, c) {
  if(a ? a.T : a) {
    return a.T(a, b, c)
  }
  var d;
  var f = Qa[p(a == k ? k : a)];
  f ? d = f : (f = Qa._) ? d = f : e(v("IAssociative.-assoc", a));
  return d.call(k, a, b, c)
}
var Ra = {};
function Sa(a, b) {
  if(a ? a.Ca : a) {
    return a.Ca(a, b)
  }
  var c;
  var d = Sa[p(a == k ? k : a)];
  d ? c = d : (d = Sa._) ? c = d : e(v("IMap.-dissoc", a));
  return c.call(k, a, b)
}
var Ta = {};
function Ua(a) {
  if(a ? a.lb : a) {
    return a.lb(a)
  }
  var b;
  var c = Ua[p(a == k ? k : a)];
  c ? b = c : (c = Ua._) ? b = c : e(v("IMapEntry.-key", a));
  return b.call(k, a)
}
function Va(a) {
  if(a ? a.mb : a) {
    return a.mb(a)
  }
  var b;
  var c = Va[p(a == k ? k : a)];
  c ? b = c : (c = Va._) ? b = c : e(v("IMapEntry.-val", a));
  return b.call(k, a)
}
var Wa = {};
function Xa(a) {
  if(a ? a.xa : a) {
    return a.xa(a)
  }
  var b;
  var c = Xa[p(a == k ? k : a)];
  c ? b = c : (c = Xa._) ? b = c : e(v("IStack.-peek", a));
  return b.call(k, a)
}
var Ya = {};
function Za(a, b, c) {
  if(a ? a.Ta : a) {
    return a.Ta(a, b, c)
  }
  var d;
  var f = Za[p(a == k ? k : a)];
  f ? d = f : (f = Za._) ? d = f : e(v("IVector.-assoc-n", a));
  return d.call(k, a, b, c)
}
function B(a) {
  if(a ? a.Pa : a) {
    return a.Pa(a)
  }
  var b;
  var c = B[p(a == k ? k : a)];
  c ? b = c : (c = B._) ? b = c : e(v("IDeref.-deref", a));
  return b.call(k, a)
}
var $a = {};
function ab(a) {
  if(a ? a.N : a) {
    return a.N(a)
  }
  var b;
  var c = ab[p(a == k ? k : a)];
  c ? b = c : (c = ab._) ? b = c : e(v("IMeta.-meta", a));
  return b.call(k, a)
}
var bb = {};
function cb(a, b) {
  if(a ? a.O : a) {
    return a.O(a, b)
  }
  var c;
  var d = cb[p(a == k ? k : a)];
  d ? c = d : (d = cb._) ? c = d : e(v("IWithMeta.-with-meta", a));
  return c.call(k, a, b)
}
var db = {}, eb = function() {
  function a(a, b, c) {
    if(a ? a.wa : a) {
      return a.wa(a, b, c)
    }
    var i;
    var j = eb[p(a == k ? k : a)];
    j ? i = j : (j = eb._) ? i = j : e(v("IReduce.-reduce", a));
    return i.call(k, a, b, c)
  }
  function b(a, b) {
    if(a ? a.va : a) {
      return a.va(a, b)
    }
    var c;
    var i = eb[p(a == k ? k : a)];
    i ? c = i : (i = eb._) ? c = i : e(v("IReduce.-reduce", a));
    return c.call(k, a, b)
  }
  var c = k, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.h = a;
  return c
}();
function fb(a, b) {
  if(a ? a.D : a) {
    return a.D(a, b)
  }
  var c;
  var d = fb[p(a == k ? k : a)];
  d ? c = d : (d = fb._) ? c = d : e(v("IEquiv.-equiv", a));
  return c.call(k, a, b)
}
function gb(a) {
  if(a ? a.I : a) {
    return a.I(a)
  }
  var b;
  var c = gb[p(a == k ? k : a)];
  c ? b = c : (c = gb._) ? b = c : e(v("IHash.-hash", a));
  return b.call(k, a)
}
function hb(a) {
  if(a ? a.F : a) {
    return a.F(a)
  }
  var b;
  var c = hb[p(a == k ? k : a)];
  c ? b = c : (c = hb._) ? b = c : e(v("ISeqable.-seq", a));
  return b.call(k, a)
}
var jb = {}, kb = {}, lb = {};
function mb(a) {
  if(a ? a.$a : a) {
    return a.$a(a)
  }
  var b;
  var c = mb[p(a == k ? k : a)];
  c ? b = c : (c = mb._) ? b = c : e(v("IReversible.-rseq", a));
  return b.call(k, a)
}
var nb = {};
function ob(a, b) {
  if(a ? a.L : a) {
    return a.L(a, b)
  }
  var c;
  var d = ob[p(a == k ? k : a)];
  d ? c = d : (d = ob._) ? c = d : e(v("IPrintable.-pr-seq", a));
  return c.call(k, a, b)
}
function pb(a, b, c) {
  if(a ? a.nb : a) {
    return a.nb(a, b, c)
  }
  var d;
  var f = pb[p(a == k ? k : a)];
  f ? d = f : (f = pb._) ? d = f : e(v("IWatchable.-notify-watches", a));
  return d.call(k, a, b, c)
}
function qb(a, b, c) {
  if(a ? a.ub : a) {
    return a.ub(a, b, c)
  }
  var d;
  var f = qb[p(a == k ? k : a)];
  f ? d = f : (f = qb._) ? d = f : e(v("IWatchable.-add-watch", a));
  return d.call(k, a, b, c)
}
function rb(a, b) {
  if(a ? a.vb : a) {
    return a.vb(a, b)
  }
  var c;
  var d = rb[p(a == k ? k : a)];
  d ? c = d : (d = rb._) ? c = d : e(v("IWatchable.-remove-watch", a));
  return c.call(k, a, b)
}
var sb = {};
function tb(a) {
  if(a ? a.Qa : a) {
    return a.Qa(a)
  }
  var b;
  var c = tb[p(a == k ? k : a)];
  c ? b = c : (c = tb._) ? b = c : e(v("IEditableCollection.-as-transient", a));
  return b.call(k, a)
}
function ub(a, b) {
  if(a ? a.Sa : a) {
    return a.Sa(a, b)
  }
  var c;
  var d = ub[p(a == k ? k : a)];
  d ? c = d : (d = ub._) ? c = d : e(v("ITransientCollection.-conj!", a));
  return c.call(k, a, b)
}
function vb(a) {
  if(a ? a.ab : a) {
    return a.ab(a)
  }
  var b;
  var c = vb[p(a == k ? k : a)];
  c ? b = c : (c = vb._) ? b = c : e(v("ITransientCollection.-persistent!", a));
  return b.call(k, a)
}
function wb(a, b, c) {
  if(a ? a.Ra : a) {
    return a.Ra(a, b, c)
  }
  var d;
  var f = wb[p(a == k ? k : a)];
  f ? d = f : (f = wb._) ? d = f : e(v("ITransientAssociative.-assoc!", a));
  return d.call(k, a, b, c)
}
var xb = {};
function yb(a, b) {
  if(a ? a.Xb : a) {
    return a.Xb(a, b)
  }
  var c;
  var d = yb[p(a == k ? k : a)];
  d ? c = d : (d = yb._) ? c = d : e(v("IComparable.-compare", a));
  return c.call(k, a, b)
}
function zb(a) {
  if(a ? a.Ub : a) {
    return a.Ub()
  }
  var b;
  var c = zb[p(a == k ? k : a)];
  c ? b = c : (c = zb._) ? b = c : e(v("IChunk.-drop-first", a));
  return b.call(k, a)
}
var Ab = {};
function Bb(a) {
  if(a ? a.sb : a) {
    return a.sb(a)
  }
  var b;
  var c = Bb[p(a == k ? k : a)];
  c ? b = c : (c = Bb._) ? b = c : e(v("IChunkedSeq.-chunked-first", a));
  return b.call(k, a)
}
function Cb(a) {
  if(a ? a.kb : a) {
    return a.kb(a)
  }
  var b;
  var c = Cb[p(a == k ? k : a)];
  c ? b = c : (c = Cb._) ? b = c : e(v("IChunkedSeq.-chunked-rest", a));
  return b.call(k, a)
}
function C(a, b) {
  return a === b
}
var H = function() {
  function a(a, b) {
    var c = a === b;
    return c ? c : fb(a, b)
  }
  var b = k, c = function() {
    function a(b, d, j) {
      var l = k;
      q(j) && (l = D(Array.prototype.slice.call(arguments, 2), 0));
      return c.call(this, b, d, l)
    }
    function c(a, d, f) {
      for(;;) {
        if(s(b.g(a, d))) {
          if(E(f)) {
            a = d, d = F(f), f = E(f)
          }else {
            return b.g(d, F(f))
          }
        }else {
          return m
        }
      }
    }
    a.v = 2;
    a.q = function(a) {
      var b = F(a), d = F(E(a)), a = G(E(a));
      return c(b, d, a)
    };
    a.j = c;
    return a
  }(), b = function(b, f, h) {
    switch(arguments.length) {
      case 1:
        return g;
      case 2:
        return a.call(this, b, f);
      default:
        return c.j(b, f, D(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.v = 2;
  b.q = c.q;
  b.k = ca(g);
  b.g = a;
  b.j = c.j;
  return b
}();
function I(a, b) {
  return b instanceof a
}
gb["null"] = ca(0);
A["null"] = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return k;
      case 3:
        return d
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Qa["null"] = function(a, b, c) {
  return Db.j(D([b, c], 0))
};
Na["null"] = g;
Oa["null"] = ca(k);
Ha["null"] = g;
Ia["null"] = function(a, b) {
  return Eb.k(b)
};
db["null"] = g;
eb["null"] = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return c.S ? c.S() : c.call(k);
      case 3:
        return d
    }
    e("Invalid arity: " + arguments.length)
  }
}();
nb["null"] = g;
ob["null"] = function() {
  return Eb.k("nil")
};
Wa["null"] = g;
Fa["null"] = g;
Ga["null"] = ca(0);
Xa["null"] = ca(k);
La["null"] = g;
z["null"] = ca(k);
Ma["null"] = function() {
  return Eb.S()
};
fb["null"] = function(a, b) {
  return b == k
};
bb["null"] = g;
cb["null"] = ca(k);
$a["null"] = g;
ab["null"] = ca(k);
Ja["null"] = g;
w["null"] = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return k;
      case 3:
        return d
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Ra["null"] = g;
Sa["null"] = ca(k);
Date.prototype.D = function(a, b) {
  var c = I(Date, b);
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
  return a[ga] || (a[ga] = ++ha)
};
function Fb(a) {
  return a + 1
}
var Hb = function() {
  function a(a, b, c, d) {
    for(var l = Ga(a);;) {
      if(d < l) {
        c = b.g ? b.g(c, w.g(a, d)) : b.call(k, c, w.g(a, d));
        if(I(Gb, c)) {
          return B(c)
        }
        d += 1
      }else {
        return c
      }
    }
  }
  function b(a, b, c) {
    for(var d = Ga(a), l = 0;;) {
      if(l < d) {
        c = b.g ? b.g(c, w.g(a, l)) : b.call(k, c, w.g(a, l));
        if(I(Gb, c)) {
          return B(c)
        }
        l += 1
      }else {
        return c
      }
    }
  }
  function c(a, b) {
    var c = Ga(a);
    if(0 === c) {
      return b.S ? b.S() : b.call(k)
    }
    for(var d = w.g(a, 0), l = 1;;) {
      if(l < c) {
        d = b.g ? b.g(d, w.g(a, l)) : b.call(k, d, w.g(a, l));
        if(I(Gb, d)) {
          return B(d)
        }
        l += 1
      }else {
        return d
      }
    }
  }
  var d = k, d = function(d, h, i, j) {
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
  d.h = b;
  d.w = a;
  return d
}();
function Ib(a, b) {
  this.a = a;
  this.C = b;
  this.B = 0;
  this.o = 166199546
}
o = Ib.prototype;
o.I = function(a) {
  return Jb(a)
};
o.Da = function() {
  return this.C + 1 < this.a.length ? new Ib(this.a, this.C + 1) : k
};
o.M = function(a, b) {
  return J(b, a)
};
o.$a = function(a) {
  var b = a.K(a);
  return 0 < b ? new Kb(a, b - 1, k) : K
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.va = function(a, b) {
  return Lb(this.a) ? Hb.w(this.a, b, this.a[this.C], this.C + 1) : Hb.w(a, b, this.a[this.C], 0)
};
o.wa = function(a, b, c) {
  return Lb(this.a) ? Hb.w(this.a, b, c, this.C) : Hb.w(a, b, c, 0)
};
o.F = ba();
o.K = function() {
  return this.a.length - this.C
};
o.ba = function() {
  return this.a[this.C]
};
o.Y = function() {
  return this.C + 1 < this.a.length ? new Ib(this.a, this.C + 1) : Eb.S()
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.aa = function(a, b) {
  var c = b + this.C;
  return c < this.a.length ? this.a[c] : k
};
o.V = function(a, b, c) {
  a = b + this.C;
  return a < this.a.length ? this.a[a] : c
};
Ib;
var Nb = function() {
  function a(a, b) {
    return 0 === a.length ? k : new Ib(a, b)
  }
  function b(a) {
    return c.g(a, 0)
  }
  var c = k, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.k = b;
  c.g = a;
  return c
}(), D = function() {
  function a(a, b) {
    return Nb.g(a, b)
  }
  function b(a) {
    return Nb.g(a, 0)
  }
  var c = k, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.k = b;
  c.g = a;
  return c
}();
db.array = g;
eb.array = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return Hb.g(a, c);
      case 3:
        return Hb.h(a, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
A.array = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return a[c];
      case 3:
        return w.h(a, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Ja.array = g;
w.array = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return c < a.length ? a[c] : k;
      case 3:
        return c < a.length ? a[c] : d
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Fa.array = g;
Ga.array = function(a) {
  return a.length
};
hb.array = function(a) {
  return D.g(a, 0)
};
function Kb(a, b, c) {
  this.rb = a;
  this.C = b;
  this.m = c;
  this.B = 0;
  this.o = 31850570
}
o = Kb.prototype;
o.I = function(a) {
  return Jb(a)
};
o.M = function(a, b) {
  return J(b, a)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = ba();
o.K = function() {
  return this.C + 1
};
o.ba = function() {
  return w.g(this.rb, this.C)
};
o.Y = function() {
  return 0 < this.C ? new Kb(this.rb, this.C - 1, k) : K
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Kb(this.rb, this.C, b)
};
o.N = n("m");
Kb;
function M(a) {
  if(a == k) {
    a = k
  }else {
    var b;
    b = a ? ((b = a.o & 32) ? b : a.oc) ? g : a.o ? m : u(Ka, a) : u(Ka, a);
    a = b ? a : hb(a)
  }
  return a
}
function F(a) {
  if(a == k) {
    return k
  }
  var b;
  b = a ? ((b = a.o & 64) ? b : a.tb) ? g : a.o ? m : u(La, a) : u(La, a);
  if(b) {
    return z(a)
  }
  a = M(a);
  return a == k ? k : z(a)
}
function G(a) {
  if(a != k) {
    var b;
    b = a ? ((b = a.o & 64) ? b : a.tb) ? g : a.o ? m : u(La, a) : u(La, a);
    if(b) {
      return Ma(a)
    }
    a = M(a);
    return a != k ? Ma(a) : K
  }
  return K
}
function E(a) {
  if(a == k) {
    a = k
  }else {
    var b;
    b = a ? ((b = a.o & 128) ? b : a.uc) ? g : a.o ? m : u(Na, a) : u(Na, a);
    a = b ? Oa(a) : M(G(a))
  }
  return a
}
function Ob(a) {
  return F(E(a))
}
fb._ = function(a, b) {
  return a === b
};
function Pb(a) {
  return s(a) ? m : g
}
var Qb = function() {
  var a = k, b = function() {
    function b(a, c, i) {
      var j = k;
      q(i) && (j = D(Array.prototype.slice.call(arguments, 2), 0));
      return d.call(this, a, c, j)
    }
    function d(b, c, d) {
      for(;;) {
        if(s(d)) {
          b = a.g(b, c), c = F(d), d = E(d)
        }else {
          return a.g(b, c)
        }
      }
    }
    b.v = 2;
    b.q = function(a) {
      var b = F(a), c = F(E(a)), a = G(E(a));
      return d(b, c, a)
    };
    b.j = d;
    return b
  }(), a = function(a, d, f) {
    switch(arguments.length) {
      case 2:
        return Ia(a, d);
      default:
        return b.j(a, d, D(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  a.v = 2;
  a.q = b.q;
  a.g = function(a, b) {
    return Ia(a, b)
  };
  a.j = b.j;
  return a
}();
function N(a) {
  if(Lb(a)) {
    a = Ga(a)
  }else {
    a: {
      for(var a = M(a), b = 0;;) {
        if(Lb(a)) {
          a = b + Ga(a);
          break a
        }
        a = E(a);
        b += 1
      }
      a = aa
    }
  }
  return a
}
var Sb = function() {
  function a(a, b, h) {
    return a == k ? h : 0 === b ? M(a) ? F(a) : h : Rb(a) ? w.h(a, b, h) : M(a) ? c.h(E(a), b - 1, h) : h
  }
  function b(a, b) {
    a == k && e(Error("Index out of bounds"));
    if(0 === b) {
      if(M(a)) {
        return F(a)
      }
      e(Error("Index out of bounds"))
    }
    if(Rb(a)) {
      return w.g(a, b)
    }
    if(M(a)) {
      return c.g(E(a), b - 1)
    }
    e(Error("Index out of bounds"))
  }
  var c = k, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.h = a;
  return c
}(), P = function() {
  function a(a, b, c) {
    if(a != k) {
      var i;
      i = a ? ((i = a.o & 16) ? i : a.Yb) ? g : a.o ? m : u(Ja, a) : u(Ja, a);
      a = i ? w.h(a, Math.floor(b), c) : Sb.h(a, Math.floor(b), c)
    }else {
      a = c
    }
    return a
  }
  function b(a, b) {
    var c;
    a == k ? c = k : (c = a ? ((c = a.o & 16) ? c : a.Yb) ? g : a.o ? m : u(Ja, a) : u(Ja, a), c = c ? w.g(a, Math.floor(b)) : Sb.g(a, Math.floor(b)));
    return c
  }
  var c = k, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.h = a;
  return c
}(), Tb = function() {
  function a(a, b, c) {
    return A.h(a, b, c)
  }
  function b(a, b) {
    return A.g(a, b)
  }
  var c = k, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.h = a;
  return c
}(), Ub = function() {
  var a = k, b = function() {
    function b(a, c, i, j) {
      var l = k;
      q(j) && (l = D(Array.prototype.slice.call(arguments, 3), 0));
      return d.call(this, a, c, i, l)
    }
    function d(b, c, d, j) {
      for(;;) {
        if(b = a.h(b, c, d), s(j)) {
          c = F(j), d = Ob(j), j = E(E(j))
        }else {
          return b
        }
      }
    }
    b.v = 3;
    b.q = function(a) {
      var b = F(a), c = F(E(a)), j = F(E(E(a))), a = G(E(E(a)));
      return d(b, c, j, a)
    };
    b.j = d;
    return b
  }(), a = function(a, d, f, h) {
    switch(arguments.length) {
      case 3:
        return Qa(a, d, f);
      default:
        return b.j(a, d, f, D(arguments, 3))
    }
    e("Invalid arity: " + arguments.length)
  };
  a.v = 3;
  a.q = b.q;
  a.h = function(a, b, f) {
    return Qa(a, b, f)
  };
  a.j = b.j;
  return a
}(), Vb = function() {
  var a = k, b = function() {
    function b(a, c, i) {
      var j = k;
      q(i) && (j = D(Array.prototype.slice.call(arguments, 2), 0));
      return d.call(this, a, c, j)
    }
    function d(b, c, d) {
      for(;;) {
        if(b = a.g(b, c), s(d)) {
          c = F(d), d = E(d)
        }else {
          return b
        }
      }
    }
    b.v = 2;
    b.q = function(a) {
      var b = F(a), c = F(E(a)), a = G(E(a));
      return d(b, c, a)
    };
    b.j = d;
    return b
  }(), a = function(a, d, f) {
    switch(arguments.length) {
      case 1:
        return a;
      case 2:
        return Sa(a, d);
      default:
        return b.j(a, d, D(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  a.v = 2;
  a.q = b.q;
  a.k = ba();
  a.g = function(a, b) {
    return Sa(a, b)
  };
  a.j = b.j;
  return a
}();
function Wb(a, b) {
  return cb(a, b)
}
function Xb(a) {
  var b;
  b = a ? ((b = a.o & 131072) ? b : a.hc) ? g : a.o ? m : u($a, a) : u($a, a);
  return b ? ab(a) : k
}
var Yb = {}, Zb = 0, $b = function() {
  function a(a, b) {
    var c = ea(a);
    if(c ? b : c) {
      if(255 < Zb && (Yb = {}, Zb = 0), c = Yb[a], c == k) {
        c = pa(a), Yb[a] = c, Zb += 1
      }
    }else {
      c = gb(a)
    }
    return c
  }
  function b(a) {
    return c.g(a, g)
  }
  var c = k, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.k = b;
  c.g = a;
  return c
}();
function ac(a) {
  if(a == k) {
    a = m
  }else {
    if(a) {
      var b = a.o & 8, a = (b ? b : a.pc) ? g : a.o ? m : u(Ha, a)
    }else {
      a = u(Ha, a)
    }
  }
  return a
}
function bc(a) {
  if(a == k) {
    a = m
  }else {
    if(a) {
      var b = a.o & 4096, a = (b ? b : a.xc) ? g : a.o ? m : u(Wa, a)
    }else {
      a = u(Wa, a)
    }
  }
  return a
}
function Lb(a) {
  if(a) {
    var b = a.o & 2, a = (b ? b : a.qc) ? g : a.o ? m : u(Fa, a)
  }else {
    a = u(Fa, a)
  }
  return a
}
function Rb(a) {
  if(a) {
    var b = a.o & 16, a = (b ? b : a.Yb) ? g : a.o ? m : u(Ja, a)
  }else {
    a = u(Ja, a)
  }
  return a
}
function cc(a) {
  if(a == k) {
    a = m
  }else {
    if(a) {
      var b = a.o & 1024, a = (b ? b : a.tc) ? g : a.o ? m : u(Ra, a)
    }else {
      a = u(Ra, a)
    }
  }
  return a
}
function dc(a) {
  if(a) {
    var b = a.o & 16384, a = (b ? b : a.yc) ? g : a.o ? m : u(Ya, a)
  }else {
    a = u(Ya, a)
  }
  return a
}
function ec(a) {
  return a ? s(s(k) ? k : a.Wb) ? g : a.jc ? m : u(Ab, a) : u(Ab, a)
}
function fc(a) {
  var b = [];
  ua(a, function(a, d) {
    return b.push(d)
  });
  return b
}
function gc(a, b, c, d, f) {
  for(;0 !== f;) {
    c[d] = a[b], d += 1, f -= 1, b += 1
  }
}
var hc = {};
function ic(a) {
  if(a == k) {
    a = m
  }else {
    if(a) {
      var b = a.o & 64, a = (b ? b : a.tb) ? g : a.o ? m : u(La, a)
    }else {
      a = u(La, a)
    }
  }
  return a
}
function jc(a) {
  return s(a) ? g : m
}
function kc(a) {
  var b = ea(a);
  b ? (b = "\ufdd0" === a.charAt(0), a = !(b ? b : "\ufdd1" === a.charAt(0))) : a = b;
  return a
}
function lc(a) {
  var b = ea(a);
  return b ? "\ufdd0" === a.charAt(0) : b
}
function mc(a) {
  var b = ea(a);
  return b ? "\ufdd1" === a.charAt(0) : b
}
function nc(a, b) {
  return A.h(a, b, hc) === hc ? m : g
}
function oc(a, b) {
  if(a === b) {
    return 0
  }
  if(a == k) {
    return-1
  }
  if(b == k) {
    return 1
  }
  if((a == k ? k : a.constructor) === (b == k ? k : b.constructor)) {
    return(a ? s(s(k) ? k : a.fc) || (a.jc ? 0 : u(xb, a)) : u(xb, a)) ? yb(a, b) : sa(a, b)
  }
  e(Error("compare on non-nil objects of different types"))
}
var pc = function() {
  function a(a, b, c, i) {
    for(;;) {
      var j = oc(P.g(a, i), P.g(b, i)), l = 0 === j;
      if(l ? i + 1 < c : l) {
        i += 1
      }else {
        return j
      }
    }
  }
  function b(a, b) {
    var h = N(a), i = N(b);
    return h < i ? -1 : h > i ? 1 : c.w(a, b, h, 0)
  }
  var c = k, c = function(c, f, h, i) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 4:
        return a.call(this, c, f, h, i)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.w = a;
  return c
}();
function qc(a) {
  return H.g(a, oc) ? oc : function(b, c) {
    var d = a.g ? a.g(b, c) : a.call(k, b, c);
    return fa(d) ? d : s(d) ? -1 : s(a.g ? a.g(c, b) : a.call(k, c, b)) ? 1 : 0
  }
}
var sc = function() {
  function a(a, b) {
    if(M(b)) {
      var c = rc(b);
      ta(c, qc(a));
      return M(c)
    }
    return K
  }
  function b(a) {
    return c.g(oc, a)
  }
  var c = k, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.k = b;
  c.g = a;
  return c
}(), uc = function() {
  function a(a, b, c) {
    for(c = M(c);;) {
      if(c) {
        b = a.g ? a.g(b, F(c)) : a.call(k, b, F(c));
        if(I(Gb, b)) {
          return B(b)
        }
        c = E(c)
      }else {
        return b
      }
    }
  }
  function b(a, b) {
    var c = M(b);
    return c ? tc.h(a, F(c), E(c)) : a.S ? a.S() : a.call(k)
  }
  var c = k, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.h = a;
  return c
}(), tc = function() {
  function a(a, b, c) {
    var i;
    i = c ? ((i = c.o & 524288) ? i : c.ic) ? g : c.o ? m : u(db, c) : u(db, c);
    return i ? eb.h(c, a, b) : uc.h(a, b, c)
  }
  function b(a, b) {
    var c;
    c = b ? ((c = b.o & 524288) ? c : b.ic) ? g : b.o ? m : u(db, b) : u(db, b);
    return c ? eb.g(b, a) : uc.g(a, b)
  }
  var c = k, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.h = a;
  return c
}();
function Gb(a) {
  this.t = a;
  this.B = 0;
  this.o = 32768
}
Gb.prototype.Pa = n("t");
Gb;
function vc(a, b) {
  return 0 <= (a - a % b) / b ? Math.floor.k ? Math.floor.k((a - a % b) / b) : Math.floor.call(k, (a - a % b) / b) : Math.ceil.k ? Math.ceil.k((a - a % b) / b) : Math.ceil.call(k, (a - a % b) / b)
}
function wc(a) {
  a -= a >> 1 & 1431655765;
  a = (a & 858993459) + (a >> 2 & 858993459);
  return 16843009 * (a + (a >> 4) & 252645135) >> 24
}
function xc(a) {
  for(var b = 1, a = M(a);;) {
    var c = a;
    if(s(c ? 0 < b : c)) {
      b -= 1, a = E(a)
    }else {
      return a
    }
  }
}
var yc = function() {
  function a(a) {
    return a == k ? "" : a.toString()
  }
  var b = k, c = function() {
    function a(b, d) {
      var j = k;
      q(d) && (j = D(Array.prototype.slice.call(arguments, 1), 0));
      return c.call(this, b, j)
    }
    function c(a, d) {
      return function(a, c) {
        for(;;) {
          if(s(c)) {
            var d = a.append(b.k(F(c))), f = E(c), a = d, c = f
          }else {
            return b.k(a)
          }
        }
      }.call(k, new Da(b.k(a)), d)
    }
    a.v = 1;
    a.q = function(a) {
      var b = F(a), a = G(a);
      return c(b, a)
    };
    a.j = c;
    return a
  }(), b = function(b, f) {
    switch(arguments.length) {
      case 0:
        return"";
      case 1:
        return a.call(this, b);
      default:
        return c.j(b, D(arguments, 1))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.v = 1;
  b.q = c.q;
  b.S = ca("");
  b.k = a;
  b.j = c.j;
  return b
}(), R = function() {
  function a(a) {
    return mc(a) ? a.substring(2, a.length) : lc(a) ? yc.j(":", D([a.substring(2, a.length)], 0)) : a == k ? "" : a.toString()
  }
  var b = k, c = function() {
    function a(b, d) {
      var j = k;
      q(d) && (j = D(Array.prototype.slice.call(arguments, 1), 0));
      return c.call(this, b, j)
    }
    function c(a, d) {
      return function(a, c) {
        for(;;) {
          if(s(c)) {
            var d = a.append(b.k(F(c))), f = E(c), a = d, c = f
          }else {
            return yc.k(a)
          }
        }
      }.call(k, new Da(b.k(a)), d)
    }
    a.v = 1;
    a.q = function(a) {
      var b = F(a), a = G(a);
      return c(b, a)
    };
    a.j = c;
    return a
  }(), b = function(b, f) {
    switch(arguments.length) {
      case 0:
        return"";
      case 1:
        return a.call(this, b);
      default:
        return c.j(b, D(arguments, 1))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.v = 1;
  b.q = c.q;
  b.S = ca("");
  b.k = a;
  b.j = c.j;
  return b
}(), zc = function() {
  var a = k, a = function(a, c, d) {
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
  a.h = function(a, c, d) {
    return a.substring(c, d)
  };
  return a
}(), Ac = function() {
  function a(a, b) {
    return c.k(yc.j(a, D(["/", b], 0)))
  }
  function b(a) {
    mc(a) ? a : lc(a) && yc.j("\ufdd1", D(["'", zc.g(a, 2)], 0));
    return yc.j("\ufdd1", D(["'", a], 0))
  }
  var c = k, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.k = b;
  c.g = a;
  return c
}(), Bc = function() {
  function a(a, b) {
    return c.k(yc.j(a, D(["/", b], 0)))
  }
  function b(a) {
    return lc(a) ? a : mc(a) ? yc.j("\ufdd0", D(["'", zc.g(a, 2)], 0)) : yc.j("\ufdd0", D(["'", a], 0))
  }
  var c = k, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.k = b;
  c.g = a;
  return c
}();
function Mb(a, b) {
  var c;
  c = b ? ((c = b.o & 16777216) ? c : b.wc) ? g : b.o ? m : u(jb, b) : u(jb, b);
  if(c) {
    a: {
      c = M(a);
      for(var d = M(b);;) {
        if(c == k) {
          c = d == k;
          break a
        }
        if(d != k && H.g(F(c), F(d))) {
          c = E(c), d = E(d)
        }else {
          c = m;
          break a
        }
      }
      c = aa
    }
  }else {
    c = k
  }
  return jc(c)
}
function Jb(a) {
  return tc.h(function(a, c) {
    var d = $b.g(c, m);
    return a ^ d + 2654435769 + (a << 6) + (a >> 2)
  }, $b.g(F(a), m), E(a))
}
function Cc(a) {
  for(var b = 0, a = M(a);;) {
    if(a) {
      var c = F(a), b = (b + ($b.k(Ua(c)) ^ $b.k(Va(c)))) % 4503599627370496, a = E(a)
    }else {
      return b
    }
  }
}
function Dc(a) {
  for(var b = 0, a = M(a);;) {
    if(a) {
      var c = F(a), b = (b + $b.k(c)) % 4503599627370496, a = E(a)
    }else {
      return b
    }
  }
}
function Ec(a, b, c, d, f) {
  this.m = a;
  this.Wa = b;
  this.Ba = c;
  this.count = d;
  this.p = f;
  this.B = 0;
  this.o = 65413358
}
o = Ec.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.Da = function() {
  return 1 === this.count ? k : this.Ba
};
o.M = function(a, b) {
  return new Ec(this.m, b, a, this.count + 1, k)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = ba();
o.K = n("count");
o.xa = n("Wa");
o.ba = n("Wa");
o.Y = function() {
  return 1 === this.count ? K : this.Ba
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Ec(b, this.Wa, this.Ba, this.count, this.p)
};
o.N = n("m");
o.U = function() {
  return K
};
Ec;
function Fc(a) {
  this.m = a;
  this.B = 0;
  this.o = 65413326
}
o = Fc.prototype;
o.I = ca(0);
o.Da = ca(k);
o.M = function(a, b) {
  return new Ec(this.m, b, k, 1, k)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = ca(k);
o.K = ca(0);
o.xa = ca(k);
o.ba = ca(k);
o.Y = function() {
  return K
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Fc(b)
};
o.N = n("m");
o.U = ba();
Fc;
var K = new Fc(k);
function Gc(a) {
  var b;
  b = a ? ((b = a.o & 134217728) ? b : a.vc) ? g : a.o ? m : u(lb, a) : u(lb, a);
  return b ? mb(a) : tc.h(Qb, K, a)
}
var Eb = function() {
  function a(a, b, c) {
    return Qb.g(d.g(b, c), a)
  }
  function b(a, b) {
    return Qb.g(d.k(b), a)
  }
  function c(a) {
    return Qb.g(K, a)
  }
  var d = k, f = function() {
    function a(c, d, f, h) {
      var x = k;
      q(h) && (x = D(Array.prototype.slice.call(arguments, 3), 0));
      return b.call(this, c, d, f, x)
    }
    function b(a, c, d, f) {
      return Qb.g(Qb.g(Qb.g(tc.h(Qb, K, Gc(f)), d), c), a)
    }
    a.v = 3;
    a.q = function(a) {
      var c = F(a), d = F(E(a)), f = F(E(E(a))), a = G(E(E(a)));
      return b(c, d, f, a)
    };
    a.j = b;
    return a
  }(), d = function(d, i, j, l) {
    switch(arguments.length) {
      case 0:
        return K;
      case 1:
        return c.call(this, d);
      case 2:
        return b.call(this, d, i);
      case 3:
        return a.call(this, d, i, j);
      default:
        return f.j(d, i, j, D(arguments, 3))
    }
    e("Invalid arity: " + arguments.length)
  };
  d.v = 3;
  d.q = f.q;
  d.S = function() {
    return K
  };
  d.k = c;
  d.g = b;
  d.h = a;
  d.j = f.j;
  return d
}();
function Hc(a, b, c, d) {
  this.m = a;
  this.Wa = b;
  this.Ba = c;
  this.p = d;
  this.B = 0;
  this.o = 65405164
}
o = Hc.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.Da = function() {
  return this.Ba == k ? k : hb(this.Ba)
};
o.M = function(a, b) {
  return new Hc(k, b, a, this.p)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = ba();
o.ba = n("Wa");
o.Y = function() {
  return this.Ba == k ? K : this.Ba
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Hc(b, this.Wa, this.Ba, this.p)
};
o.N = n("m");
o.U = function() {
  return cb(K, this.m)
};
Hc;
function J(a, b) {
  var c = b == k;
  c || (c = b ? ((c = b.o & 64) ? c : b.tb) ? g : b.o ? m : u(La, b) : u(La, b));
  return c ? new Hc(k, a, b, k) : new Hc(k, a, M(b), k)
}
db.string = g;
eb.string = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return Hb.g(a, c);
      case 3:
        return Hb.h(a, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
A.string = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return w.g(a, c);
      case 3:
        return w.h(a, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Ja.string = g;
w.string = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return c < Ga(a) ? a.charAt(c) : k;
      case 3:
        return c < Ga(a) ? a.charAt(c) : d
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Fa.string = g;
Ga.string = function(a) {
  return a.length
};
hb.string = function(a) {
  return Nb.g(a, 0)
};
gb.string = function(a) {
  return pa(a)
};
function Ic(a) {
  this.Kb = a;
  this.B = 0;
  this.o = 1
}
Ic.prototype.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        var f;
        c == k ? f = k : (f = c.Ja, f = f == k ? A.h(c, this.Kb, k) : f[this.Kb]);
        return f;
      case 3:
        return c == k ? d : A.h(c, this.Kb, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
Ic.prototype.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
Ic;
String.prototype.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return A.h(c, this.toString(), k);
      case 3:
        return A.h(c, this.toString(), d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
String.prototype.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
String.prototype.apply = function(a, b) {
  return 2 > N(b) ? A.h(b[0], a, k) : A.h(b[0], a, b[1])
};
function Jc(a) {
  var b = a.x;
  if(a.Nb) {
    return b
  }
  a.x = b.S ? b.S() : b.call(k);
  a.Nb = g;
  return a.x
}
function S(a, b, c, d) {
  this.m = a;
  this.Nb = b;
  this.x = c;
  this.p = d;
  this.B = 0;
  this.o = 31850700
}
o = S.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.Da = function(a) {
  return hb(a.Y(a))
};
o.M = function(a, b) {
  return J(b, a)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = function(a) {
  return M(Jc(a))
};
o.ba = function(a) {
  return F(Jc(a))
};
o.Y = function(a) {
  return G(Jc(a))
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new S(b, this.Nb, this.x, this.p)
};
o.N = n("m");
o.U = function() {
  return cb(K, this.m)
};
S;
function Kc(a, b) {
  this.ob = a;
  this.end = b;
  this.B = 0;
  this.o = 2
}
Kc.prototype.K = n("end");
Kc.prototype.add = function(a) {
  this.ob[this.end] = a;
  return this.end += 1
};
Kc.prototype.ua = function() {
  var a = new Lc(this.ob, 0, this.end);
  this.ob = k;
  return a
};
Kc;
function Lc(a, b, c) {
  this.l = a;
  this.X = b;
  this.end = c;
  this.B = 0;
  this.o = 524306
}
o = Lc.prototype;
o.va = function(a, b) {
  return Hb.w(a, b, this.l[this.X], this.X + 1)
};
o.wa = function(a, b, c) {
  return Hb.w(a, b, c, this.X)
};
o.Ub = function() {
  this.X === this.end && e(Error("-drop-first of empty chunk"));
  return new Lc(this.l, this.X + 1, this.end)
};
o.aa = function(a, b) {
  return this.l[this.X + b]
};
o.V = function(a, b, c) {
  return((a = 0 <= b) ? b < this.end - this.X : a) ? this.l[this.X + b] : c
};
o.K = function() {
  return this.end - this.X
};
Lc;
var Mc = function() {
  function a(a, b, c) {
    return new Lc(a, b, c)
  }
  function b(a, b) {
    return d.h(a, b, a.length)
  }
  function c(a) {
    return d.h(a, 0, a.length)
  }
  var d = k, d = function(d, h, i) {
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
  d.k = c;
  d.g = b;
  d.h = a;
  return d
}();
function Nc(a, b, c) {
  this.ua = a;
  this.Ga = b;
  this.m = c;
  this.B = 0;
  this.o = 27656296
}
o = Nc.prototype;
o.M = function(a, b) {
  return J(b, a)
};
o.F = ba();
o.ba = function() {
  return w.g(this.ua, 0)
};
o.Y = function() {
  return 1 < Ga(this.ua) ? new Nc(zb(this.ua), this.Ga, this.m) : this.Ga == k ? K : this.Ga
};
o.Vb = function() {
  return this.Ga == k ? k : this.Ga
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Nc(this.ua, this.Ga, b)
};
o.N = n("m");
o.Wb = g;
o.sb = n("ua");
o.kb = function() {
  return this.Ga == k ? K : this.Ga
};
Nc;
function Oc(a, b) {
  return 0 === Ga(a) ? b : new Nc(a, b, k)
}
function rc(a) {
  for(var b = [];;) {
    if(M(a)) {
      b.push(F(a)), a = E(a)
    }else {
      return b
    }
  }
}
function Pc(a, b) {
  if(Lb(a)) {
    return N(a)
  }
  for(var c = a, d = b, f = 0;;) {
    var h;
    h = (h = 0 < d) ? M(c) : h;
    if(s(h)) {
      c = E(c), d -= 1, f += 1
    }else {
      return f
    }
  }
}
var Sc = function Rc(b) {
  return b == k ? k : E(b) == k ? M(F(b)) : J(F(b), Rc(E(b)))
}, Tc = function() {
  function a(a, b) {
    return new S(k, m, function() {
      var c = M(a);
      return c ? ec(c) ? Oc(Bb(c), d.g(Cb(c), b)) : J(F(c), d.g(G(c), b)) : b
    }, k)
  }
  function b(a) {
    return new S(k, m, function() {
      return a
    }, k)
  }
  function c() {
    return new S(k, m, ca(k), k)
  }
  var d = k, f = function() {
    function a(c, d, f) {
      var h = k;
      q(f) && (h = D(Array.prototype.slice.call(arguments, 2), 0));
      return b.call(this, c, d, h)
    }
    function b(a, c, f) {
      var h = function y(a, b) {
        return new S(k, m, function() {
          var c = M(a);
          return c ? ec(c) ? Oc(Bb(c), y(Cb(c), b)) : J(F(c), y(G(c), b)) : s(b) ? y(F(b), E(b)) : k
        }, k)
      };
      return h.g ? h.g(d.g(a, c), f) : h.call(k, d.g(a, c), f)
    }
    a.v = 2;
    a.q = function(a) {
      var c = F(a), d = F(E(a)), a = G(E(a));
      return b(c, d, a)
    };
    a.j = b;
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
        return f.j(d, i, D(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  d.v = 2;
  d.q = f.q;
  d.S = c;
  d.k = b;
  d.g = a;
  d.j = f.j;
  return d
}(), Uc = function() {
  function a(a, b, c, d) {
    return J(a, J(b, J(c, d)))
  }
  function b(a, b, c) {
    return J(a, J(b, c))
  }
  var c = k, d = function() {
    function a(c, d, f, r, t) {
      var x = k;
      q(t) && (x = D(Array.prototype.slice.call(arguments, 4), 0));
      return b.call(this, c, d, f, r, x)
    }
    function b(a, c, d, f, h) {
      return J(a, J(c, J(d, J(f, Sc(h)))))
    }
    a.v = 4;
    a.q = function(a) {
      var c = F(a), d = F(E(a)), f = F(E(E(a))), t = F(E(E(E(a)))), a = G(E(E(E(a))));
      return b(c, d, f, t, a)
    };
    a.j = b;
    return a
  }(), c = function(c, h, i, j, l) {
    switch(arguments.length) {
      case 1:
        return M(c);
      case 2:
        return J(c, h);
      case 3:
        return b.call(this, c, h, i);
      case 4:
        return a.call(this, c, h, i, j);
      default:
        return d.j(c, h, i, j, D(arguments, 4))
    }
    e("Invalid arity: " + arguments.length)
  };
  c.v = 4;
  c.q = d.q;
  c.k = function(a) {
    return M(a)
  };
  c.g = function(a, b) {
    return J(a, b)
  };
  c.h = b;
  c.w = a;
  c.j = d.j;
  return c
}();
function Vc(a) {
  return tb(a)
}
function Wc(a) {
  return vb(a)
}
function Xc(a, b, c) {
  return wb(a, b, c)
}
function Yc(a, b, c) {
  var d = M(c);
  if(0 === b) {
    return a.S ? a.S() : a.call(k)
  }
  var c = z(d), f = Ma(d);
  if(1 === b) {
    return a.k ? a.k(c) : a.k ? a.k(c) : a.call(k, c)
  }
  var d = z(f), h = Ma(f);
  if(2 === b) {
    return a.g ? a.g(c, d) : a.g ? a.g(c, d) : a.call(k, c, d)
  }
  var f = z(h), i = Ma(h);
  if(3 === b) {
    return a.h ? a.h(c, d, f) : a.h ? a.h(c, d, f) : a.call(k, c, d, f)
  }
  var h = z(i), j = Ma(i);
  if(4 === b) {
    return a.w ? a.w(c, d, f, h) : a.w ? a.w(c, d, f, h) : a.call(k, c, d, f, h)
  }
  i = z(j);
  j = Ma(j);
  if(5 === b) {
    return a.ca ? a.ca(c, d, f, h, i) : a.ca ? a.ca(c, d, f, h, i) : a.call(k, c, d, f, h, i)
  }
  var a = z(j), l = Ma(j);
  if(6 === b) {
    return a.Ea ? a.Ea(c, d, f, h, i, a) : a.Ea ? a.Ea(c, d, f, h, i, a) : a.call(k, c, d, f, h, i, a)
  }
  var j = z(l), r = Ma(l);
  if(7 === b) {
    return a.bb ? a.bb(c, d, f, h, i, a, j) : a.bb ? a.bb(c, d, f, h, i, a, j) : a.call(k, c, d, f, h, i, a, j)
  }
  var l = z(r), t = Ma(r);
  if(8 === b) {
    return a.Hb ? a.Hb(c, d, f, h, i, a, j, l) : a.Hb ? a.Hb(c, d, f, h, i, a, j, l) : a.call(k, c, d, f, h, i, a, j, l)
  }
  var r = z(t), x = Ma(t);
  if(9 === b) {
    return a.Ib ? a.Ib(c, d, f, h, i, a, j, l, r) : a.Ib ? a.Ib(c, d, f, h, i, a, j, l, r) : a.call(k, c, d, f, h, i, a, j, l, r)
  }
  var t = z(x), y = Ma(x);
  if(10 === b) {
    return a.wb ? a.wb(c, d, f, h, i, a, j, l, r, t) : a.wb ? a.wb(c, d, f, h, i, a, j, l, r, t) : a.call(k, c, d, f, h, i, a, j, l, r, t)
  }
  var x = z(y), Q = Ma(y);
  if(11 === b) {
    return a.xb ? a.xb(c, d, f, h, i, a, j, l, r, t, x) : a.xb ? a.xb(c, d, f, h, i, a, j, l, r, t, x) : a.call(k, c, d, f, h, i, a, j, l, r, t, x)
  }
  var y = z(Q), O = Ma(Q);
  if(12 === b) {
    return a.yb ? a.yb(c, d, f, h, i, a, j, l, r, t, x, y) : a.yb ? a.yb(c, d, f, h, i, a, j, l, r, t, x, y) : a.call(k, c, d, f, h, i, a, j, l, r, t, x, y)
  }
  var Q = z(O), $ = Ma(O);
  if(13 === b) {
    return a.zb ? a.zb(c, d, f, h, i, a, j, l, r, t, x, y, Q) : a.zb ? a.zb(c, d, f, h, i, a, j, l, r, t, x, y, Q) : a.call(k, c, d, f, h, i, a, j, l, r, t, x, y, Q)
  }
  var O = z($), la = Ma($);
  if(14 === b) {
    return a.Ab ? a.Ab(c, d, f, h, i, a, j, l, r, t, x, y, Q, O) : a.Ab ? a.Ab(c, d, f, h, i, a, j, l, r, t, x, y, Q, O) : a.call(k, c, d, f, h, i, a, j, l, r, t, x, y, Q, O)
  }
  var $ = z(la), ma = Ma(la);
  if(15 === b) {
    return a.Bb ? a.Bb(c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $) : a.Bb ? a.Bb(c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $) : a.call(k, c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $)
  }
  var la = z(ma), za = Ma(ma);
  if(16 === b) {
    return a.Cb ? a.Cb(c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la) : a.Cb ? a.Cb(c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la) : a.call(k, c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la)
  }
  var ma = z(za), ib = Ma(za);
  if(17 === b) {
    return a.Db ? a.Db(c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la, ma) : a.Db ? a.Db(c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la, ma) : a.call(k, c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la, ma)
  }
  var za = z(ib), Qc = Ma(ib);
  if(18 === b) {
    return a.Eb ? a.Eb(c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la, ma, za) : a.Eb ? a.Eb(c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la, ma, za) : a.call(k, c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la, ma, za)
  }
  ib = z(Qc);
  Qc = Ma(Qc);
  if(19 === b) {
    return a.Fb ? a.Fb(c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la, ma, za, ib) : a.Fb ? a.Fb(c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la, ma, za, ib) : a.call(k, c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la, ma, za, ib)
  }
  var ee = z(Qc);
  Ma(Qc);
  if(20 === b) {
    return a.Gb ? a.Gb(c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la, ma, za, ib, ee) : a.Gb ? a.Gb(c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la, ma, za, ib, ee) : a.call(k, c, d, f, h, i, a, j, l, r, t, x, y, Q, O, $, la, ma, za, ib, ee)
  }
  e(Error("Only up to 20 arguments supported on functions"))
}
var T = function() {
  function a(a, b, c, d, f) {
    b = Uc.w(b, c, d, f);
    c = a.v;
    return s(a.q) ? (d = Pc(b, c + 1), d <= c ? Yc(a, d, b) : a.q(b)) : a.apply(a, rc(b))
  }
  function b(a, b, c, d) {
    b = Uc.h(b, c, d);
    c = a.v;
    return s(a.q) ? (d = Pc(b, c + 1), d <= c ? Yc(a, d, b) : a.q(b)) : a.apply(a, rc(b))
  }
  function c(a, b, c) {
    b = Uc.g(b, c);
    c = a.v;
    if(s(a.q)) {
      var d = Pc(b, c + 1);
      return d <= c ? Yc(a, d, b) : a.q(b)
    }
    return a.apply(a, rc(b))
  }
  function d(a, b) {
    var c = a.v;
    if(s(a.q)) {
      var d = Pc(b, c + 1);
      return d <= c ? Yc(a, d, b) : a.q(b)
    }
    return a.apply(a, rc(b))
  }
  var f = k, h = function() {
    function a(c, d, f, h, i, Q) {
      var O = k;
      q(Q) && (O = D(Array.prototype.slice.call(arguments, 5), 0));
      return b.call(this, c, d, f, h, i, O)
    }
    function b(a, c, d, f, h, i) {
      c = J(c, J(d, J(f, J(h, Sc(i)))));
      d = a.v;
      return s(a.q) ? (f = Pc(c, d + 1), f <= d ? Yc(a, f, c) : a.q(c)) : a.apply(a, rc(c))
    }
    a.v = 5;
    a.q = function(a) {
      var c = F(a), d = F(E(a)), f = F(E(E(a))), h = F(E(E(E(a)))), i = F(E(E(E(E(a))))), a = G(E(E(E(E(a)))));
      return b(c, d, f, h, i, a)
    };
    a.j = b;
    return a
  }(), f = function(f, j, l, r, t, x) {
    switch(arguments.length) {
      case 2:
        return d.call(this, f, j);
      case 3:
        return c.call(this, f, j, l);
      case 4:
        return b.call(this, f, j, l, r);
      case 5:
        return a.call(this, f, j, l, r, t);
      default:
        return h.j(f, j, l, r, t, D(arguments, 5))
    }
    e("Invalid arity: " + arguments.length)
  };
  f.v = 5;
  f.q = h.q;
  f.g = d;
  f.h = c;
  f.w = b;
  f.ca = a;
  f.j = h.j;
  return f
}(), Zc = function() {
  function a(a, b) {
    return!H.g(a, b)
  }
  function b() {
    return m
  }
  var c = k, d = function() {
    function a(c, d, f) {
      var r = k;
      q(f) && (r = D(Array.prototype.slice.call(arguments, 2), 0));
      return b.call(this, c, d, r)
    }
    function b(a, c, d) {
      return Pb(T.w(H, a, c, d))
    }
    a.v = 2;
    a.q = function(a) {
      var c = F(a), d = F(E(a)), a = G(E(a));
      return b(c, d, a)
    };
    a.j = b;
    return a
  }(), c = function(c, h, i) {
    switch(arguments.length) {
      case 1:
        return b.call(this);
      case 2:
        return a.call(this, c, h);
      default:
        return d.j(c, h, D(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  c.v = 2;
  c.q = d.q;
  c.k = b;
  c.g = a;
  c.j = d.j;
  return c
}();
function $c(a) {
  return M(a) ? a : k
}
function ad(a, b) {
  for(;;) {
    if(M(b) == k) {
      return g
    }
    if(s(a.k ? a.k(F(b)) : a.call(k, F(b)))) {
      var c = a, d = E(b), a = c, b = d
    }else {
      return m
    }
  }
}
function bd(a) {
  for(var b = cd;;) {
    if(M(a)) {
      var c = b.k ? b.k(F(a)) : b.call(k, F(a));
      if(s(c)) {
        return c
      }
      a = E(a)
    }else {
      return k
    }
  }
}
function cd(a) {
  return a
}
function dd(a) {
  return function() {
    var b = k, c = function() {
      function b(a, d, j) {
        var l = k;
        q(j) && (l = D(Array.prototype.slice.call(arguments, 2), 0));
        return c.call(this, a, d, l)
      }
      function c(b, d, f) {
        return Pb(T.w(a, b, d, f))
      }
      b.v = 2;
      b.q = function(a) {
        var b = F(a), d = F(E(a)), a = G(E(a));
        return c(b, d, a)
      };
      b.j = c;
      return b
    }(), b = function(b, f, h) {
      switch(arguments.length) {
        case 0:
          return Pb(a.S ? a.S() : a.call(k));
        case 1:
          return Pb(a.k ? a.k(b) : a.call(k, b));
        case 2:
          return Pb(a.g ? a.g(b, f) : a.call(k, b, f));
        default:
          return c.j(b, f, D(arguments, 2))
      }
      e("Invalid arity: " + arguments.length)
    };
    b.v = 2;
    b.q = c.q;
    return b
  }()
}
function ed(a) {
  return function() {
    function b(b) {
      q(b) && D(Array.prototype.slice.call(arguments, 0), 0);
      return a
    }
    b.v = 0;
    b.q = function(b) {
      M(b);
      return a
    };
    b.j = function() {
      return a
    };
    return b
  }()
}
var fd = function() {
  function a(a, b, c, d) {
    return function() {
      function f(a) {
        var b = k;
        q(a) && (b = D(Array.prototype.slice.call(arguments, 0), 0));
        return t.call(this, b)
      }
      function t(f) {
        return T.ca(a, b, c, d, f)
      }
      f.v = 0;
      f.q = function(a) {
        a = M(a);
        return t(a)
      };
      f.j = t;
      return f
    }()
  }
  function b(a, b, c) {
    return function() {
      function d(a) {
        var b = k;
        q(a) && (b = D(Array.prototype.slice.call(arguments, 0), 0));
        return f.call(this, b)
      }
      function f(d) {
        return T.w(a, b, c, d)
      }
      d.v = 0;
      d.q = function(a) {
        a = M(a);
        return f(a)
      };
      d.j = f;
      return d
    }()
  }
  function c(a, b) {
    return function() {
      function c(a) {
        var b = k;
        q(a) && (b = D(Array.prototype.slice.call(arguments, 0), 0));
        return d.call(this, b)
      }
      function d(c) {
        return T.h(a, b, c)
      }
      c.v = 0;
      c.q = function(a) {
        a = M(a);
        return d(a)
      };
      c.j = d;
      return c
    }()
  }
  var d = k, f = function() {
    function a(c, d, f, h, x) {
      var y = k;
      q(x) && (y = D(Array.prototype.slice.call(arguments, 4), 0));
      return b.call(this, c, d, f, h, y)
    }
    function b(a, c, d, f, h) {
      return function() {
        function b(a) {
          var c = k;
          q(a) && (c = D(Array.prototype.slice.call(arguments, 0), 0));
          return i.call(this, c)
        }
        function i(b) {
          return T.ca(a, c, d, f, Tc.g(h, b))
        }
        b.v = 0;
        b.q = function(a) {
          a = M(a);
          return i(a)
        };
        b.j = i;
        return b
      }()
    }
    a.v = 4;
    a.q = function(a) {
      var c = F(a), d = F(E(a)), f = F(E(E(a))), h = F(E(E(E(a)))), a = G(E(E(E(a))));
      return b(c, d, f, h, a)
    };
    a.j = b;
    return a
  }(), d = function(d, i, j, l, r) {
    switch(arguments.length) {
      case 2:
        return c.call(this, d, i);
      case 3:
        return b.call(this, d, i, j);
      case 4:
        return a.call(this, d, i, j, l);
      default:
        return f.j(d, i, j, l, D(arguments, 4))
    }
    e("Invalid arity: " + arguments.length)
  };
  d.v = 4;
  d.q = f.q;
  d.g = c;
  d.h = b;
  d.w = a;
  d.j = f.j;
  return d
}();
function gd(a, b) {
  var c = function f(b, c) {
    return new S(k, m, function() {
      var j = M(c);
      if(j) {
        if(ec(j)) {
          for(var l = Bb(j), r = N(l), t = new Kc(Ea.k(r), 0), x = 0;;) {
            if(x < r) {
              var y = a.g ? a.g(b + x, w.g(l, x)) : a.call(k, b + x, w.g(l, x));
              t.add(y);
              x += 1
            }else {
              break
            }
          }
          return Oc(t.ua(), f(b + r, Cb(j)))
        }
        return J(a.g ? a.g(b, F(j)) : a.call(k, b, F(j)), f(b + 1, G(j)))
      }
      return k
    }, k)
  };
  return c.g ? c.g(0, b) : c.call(k, 0, b)
}
var hd = function() {
  function a(a, b, c, f) {
    return new S(k, m, function() {
      var r = M(b), t = M(c), x = M(f);
      return(r ? t ? x : t : r) ? J(a.h ? a.h(F(r), F(t), F(x)) : a.call(k, F(r), F(t), F(x)), d.w(a, G(r), G(t), G(x))) : k
    }, k)
  }
  function b(a, b, c) {
    return new S(k, m, function() {
      var f = M(b), r = M(c);
      return(f ? r : f) ? J(a.g ? a.g(F(f), F(r)) : a.call(k, F(f), F(r)), d.h(a, G(f), G(r))) : k
    }, k)
  }
  function c(a, b) {
    return new S(k, m, function() {
      var c = M(b);
      if(c) {
        if(ec(c)) {
          for(var f = Bb(c), r = N(f), t = new Kc(Ea.k(r), 0), x = 0;;) {
            if(x < r) {
              var y = a.k ? a.k(w.g(f, x)) : a.call(k, w.g(f, x));
              t.add(y);
              x += 1
            }else {
              break
            }
          }
          return Oc(t.ua(), d.g(a, Cb(c)))
        }
        return J(a.k ? a.k(F(c)) : a.call(k, F(c)), d.g(a, G(c)))
      }
      return k
    }, k)
  }
  var d = k, f = function() {
    function a(c, d, f, h, x) {
      var y = k;
      q(x) && (y = D(Array.prototype.slice.call(arguments, 4), 0));
      return b.call(this, c, d, f, h, y)
    }
    function b(a, c, f, h, i) {
      var y = function O(a) {
        return new S(k, m, function() {
          var b = d.g(M, a);
          return ad(cd, b) ? J(d.g(F, b), O(d.g(G, b))) : k
        }, k)
      };
      return d.g(function(b) {
        return T.g(a, b)
      }, y.k ? y.k(Qb.j(i, h, D([f, c], 0))) : y.call(k, Qb.j(i, h, D([f, c], 0))))
    }
    a.v = 4;
    a.q = function(a) {
      var c = F(a), d = F(E(a)), f = F(E(E(a))), h = F(E(E(E(a)))), a = G(E(E(E(a))));
      return b(c, d, f, h, a)
    };
    a.j = b;
    return a
  }(), d = function(d, i, j, l, r) {
    switch(arguments.length) {
      case 2:
        return c.call(this, d, i);
      case 3:
        return b.call(this, d, i, j);
      case 4:
        return a.call(this, d, i, j, l);
      default:
        return f.j(d, i, j, l, D(arguments, 4))
    }
    e("Invalid arity: " + arguments.length)
  };
  d.v = 4;
  d.q = f.q;
  d.g = c;
  d.h = b;
  d.w = a;
  d.j = f.j;
  return d
}(), jd = function id(b, c) {
  return new S(k, m, function() {
    if(0 < b) {
      var d = M(c);
      return d ? J(F(d), id(b - 1, G(d))) : k
    }
    return k
  }, k)
};
function kd(a, b) {
  function c(a, b) {
    for(;;) {
      var c = M(b), i = 0 < a;
      if(s(i ? c : i)) {
        i = a - 1, c = G(c), a = i, b = c
      }else {
        return c
      }
    }
  }
  return new S(k, m, function() {
    return c.g ? c.g(a, b) : c.call(k, a, b)
  }, k)
}
function ld(a) {
  return U([jd(8, a), kd(8, a)])
}
var md = function() {
  function a(a, b) {
    return jd(a, c.k(b))
  }
  function b(a) {
    return new S(k, m, function() {
      return J(a, c.k(a))
    }, k)
  }
  var c = k, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.k = b;
  c.g = a;
  return c
}(), od = function nd(b, c) {
  return J(c, new S(k, m, function() {
    return nd(b, b.k ? b.k(c) : b.call(k, c))
  }, k))
}, pd = function() {
  function a(a, c) {
    return new S(k, m, function() {
      var h = M(a), i = M(c);
      return(h ? i : h) ? J(F(h), J(F(i), b.g(G(h), G(i)))) : k
    }, k)
  }
  var b = k, c = function() {
    function a(b, d, j) {
      var l = k;
      q(j) && (l = D(Array.prototype.slice.call(arguments, 2), 0));
      return c.call(this, b, d, l)
    }
    function c(a, d, f) {
      return new S(k, m, function() {
        var c = hd.g(M, Qb.j(f, d, D([a], 0)));
        return ad(cd, c) ? Tc.g(hd.g(F, c), T.g(b, hd.g(G, c))) : k
      }, k)
    }
    a.v = 2;
    a.q = function(a) {
      var b = F(a), d = F(E(a)), a = G(E(a));
      return c(b, d, a)
    };
    a.j = c;
    return a
  }(), b = function(b, f, h) {
    switch(arguments.length) {
      case 2:
        return a.call(this, b, f);
      default:
        return c.j(b, f, D(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.v = 2;
  b.q = c.q;
  b.g = a;
  b.j = c.j;
  return b
}();
function qd(a, b) {
  return kd(1, pd.g(md.k(a), b))
}
function rd(a) {
  var b = function d(a, b) {
    return new S(k, m, function() {
      var i = M(a);
      return i ? J(F(i), d(G(i), b)) : M(b) ? d(F(b), G(b)) : k
    }, k)
  };
  return b.g ? b.g(k, a) : b.call(k, k, a)
}
var sd = function() {
  function a(a, b) {
    return rd(hd.g(a, b))
  }
  var b = k, c = function() {
    function a(c, d, j) {
      var l = k;
      q(j) && (l = D(Array.prototype.slice.call(arguments, 2), 0));
      return b.call(this, c, d, l)
    }
    function b(a, c, d) {
      return rd(T.w(hd, a, c, d))
    }
    a.v = 2;
    a.q = function(a) {
      var c = F(a), d = F(E(a)), a = G(E(a));
      return b(c, d, a)
    };
    a.j = b;
    return a
  }(), b = function(b, f, h) {
    switch(arguments.length) {
      case 2:
        return a.call(this, b, f);
      default:
        return c.j(b, f, D(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.v = 2;
  b.q = c.q;
  b.g = a;
  b.j = c.j;
  return b
}(), ud = function td(b, c) {
  return new S(k, m, function() {
    var d = M(c);
    if(d) {
      if(ec(d)) {
        for(var f = Bb(d), h = N(f), i = new Kc(Ea.k(h), 0), j = 0;;) {
          if(j < h) {
            if(s(b.k ? b.k(w.g(f, j)) : b.call(k, w.g(f, j)))) {
              var l = w.g(f, j);
              i.add(l)
            }
            j += 1
          }else {
            break
          }
        }
        return Oc(i.ua(), td(b, Cb(d)))
      }
      f = F(d);
      d = G(d);
      return s(b.k ? b.k(f) : b.call(k, f)) ? J(f, td(b, d)) : td(b, d)
    }
    return k
  }, k)
};
function vd(a, b) {
  var c;
  c = a ? ((c = a.B & 1) ? c : a.rc) ? g : a.B ? m : u(sb, a) : u(sb, a);
  return c ? Wc(tc.h(ub, tb(a), b)) : tc.h(Ia, a, b)
}
var wd = function() {
  function a(a, b, c, j) {
    return new S(k, m, function() {
      var l = M(j);
      if(l) {
        var r = jd(a, l);
        return a === N(r) ? J(r, d.w(a, b, c, kd(b, l))) : Eb.k(jd(a, Tc.g(r, c)))
      }
      return k
    }, k)
  }
  function b(a, b, c) {
    return new S(k, m, function() {
      var j = M(c);
      if(j) {
        var l = jd(a, j);
        return a === N(l) ? J(l, d.h(a, b, kd(b, j))) : k
      }
      return k
    }, k)
  }
  function c(a, b) {
    return d.h(a, a, b)
  }
  var d = k, d = function(d, h, i, j) {
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
  d.h = b;
  d.w = a;
  return d
}(), xd = function() {
  function a(a, b, c) {
    for(var i = hc, b = M(b);;) {
      if(b) {
        a = A.h(a, F(b), i);
        if(i === a) {
          return c
        }
        b = E(b)
      }else {
        return a
      }
    }
  }
  function b(a, b) {
    return tc.h(Tb, a, b)
  }
  var c = k, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.h = a;
  return c
}(), zd = function yd(b, c, d) {
  var f = P.h(c, 0, k), c = xc(c);
  return s(c) ? Ub.h(b, f, yd(A.h(b, f, k), c, d)) : Ub.h(b, f, d)
}, Ad = function() {
  function a(a, d, f, h) {
    var i = k;
    q(h) && (i = D(Array.prototype.slice.call(arguments, 3), 0));
    return b.call(this, a, d, f, i)
  }
  function b(b, d, f, h) {
    var i = P.h(d, 0, k), d = xc(d);
    return s(d) ? Ub.h(b, i, T.ca(a, A.h(b, i, k), d, f, h)) : Ub.h(b, i, T.h(f, A.h(b, i, k), h))
  }
  a.v = 3;
  a.q = function(a) {
    var d = F(a), f = F(E(a)), h = F(E(E(a))), a = G(E(E(a)));
    return b(d, f, h, a)
  };
  a.j = b;
  return a
}();
function Bd(a, b, c) {
  this.m = a;
  this.$ = b;
  this.p = c;
  this.B = 0;
  this.o = 32400159
}
o = Bd.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.J = function(a, b) {
  return a.V(a, b, k)
};
o.A = function(a, b, c) {
  return a.V(a, b, c)
};
o.T = function(a, b, c) {
  a = this.$.slice();
  a[b] = c;
  return new Bd(this.m, a, k)
};
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.M = function(a, b) {
  var c = this.$.slice();
  c.push(b);
  return new Bd(this.m, c, k)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.va = function(a, b) {
  return Hb.g(this.$, b)
};
o.wa = function(a, b, c) {
  return Hb.h(this.$, b, c)
};
o.F = function() {
  var a = this;
  if(0 < a.$.length) {
    var b = function d(b) {
      return new S(k, m, function() {
        return b < a.$.length ? J(a.$[b], d(b + 1)) : k
      }, k)
    };
    return b.k ? b.k(0) : b.call(k, 0)
  }
  return k
};
o.K = function() {
  return this.$.length
};
o.xa = function() {
  var a = this.$.length;
  return 0 < a ? this.$[a - 1] : k
};
o.Ta = function(a, b, c) {
  return a.T(a, b, c)
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Bd(b, this.$, this.p)
};
o.N = n("m");
o.aa = function(a, b) {
  var c = 0 <= b;
  return(c ? b < this.$.length : c) ? this.$[b] : k
};
o.V = function(a, b, c) {
  return((a = 0 <= b) ? b < this.$.length : a) ? this.$[b] : c
};
o.U = function() {
  return cb(Cd, this.m)
};
Bd;
var Cd = new Bd(k, [], 0);
function Dd(a, b) {
  this.G = a;
  this.l = b
}
Dd;
function Ed(a) {
  a = a.n;
  return 32 > a ? 0 : a - 1 >>> 5 << 5
}
function Fd(a, b, c) {
  for(;;) {
    if(0 === b) {
      return c
    }
    var d = new Dd(a, Ea.k(32));
    d.l[0] = c;
    c = d;
    b -= 5
  }
}
var Hd = function Gd(b, c, d, f) {
  var h = new Dd(d.G, d.l.slice()), i = b.n - 1 >>> c & 31;
  5 === c ? h.l[i] = f : (d = d.l[i], b = d != k ? Gd(b, c - 5, d, f) : Fd(k, c - 5, f), h.l[i] = b);
  return h
};
function Id(a, b) {
  var c = 0 <= b;
  if(c ? b < a.n : c) {
    if(b >= Ed(a)) {
      return a.ea
    }
    for(var c = a.root, d = a.shift;;) {
      if(0 < d) {
        var f = d - 5, c = c.l[b >>> d & 31], d = f
      }else {
        return c.l
      }
    }
  }else {
    e(Error([R("No item "), R(b), R(" in vector of length "), R(a.n)].join("")))
  }
}
var Kd = function Jd(b, c, d, f, h) {
  var i = new Dd(d.G, d.l.slice());
  if(0 === c) {
    i.l[f & 31] = h
  }else {
    var j = f >>> c & 31, b = Jd(b, c - 5, d.l[j], f, h);
    i.l[j] = b
  }
  return i
};
function Ld(a, b, c, d, f, h) {
  this.m = a;
  this.n = b;
  this.shift = c;
  this.root = d;
  this.ea = f;
  this.p = h;
  this.B = 1;
  this.o = 167668511
}
o = Ld.prototype;
o.Qa = function() {
  var a = this.n, b = this.shift, c = new Dd({}, this.root.l.slice()), d = this.ea, f = Ea.k(32);
  gc(d, 0, f, 0, d.length);
  return new Md(a, b, c, f)
};
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.J = function(a, b) {
  return a.V(a, b, k)
};
o.A = function(a, b, c) {
  return a.V(a, b, c)
};
o.T = function(a, b, c) {
  var d = 0 <= b;
  if(d ? b < this.n : d) {
    return Ed(a) <= b ? (a = this.ea.slice(), a[b & 31] = c, new Ld(this.m, this.n, this.shift, this.root, a, k)) : new Ld(this.m, this.n, this.shift, Kd(a, this.shift, this.root, b, c), this.ea, k)
  }
  if(b === this.n) {
    return a.M(a, c)
  }
  e(Error([R("Index "), R(b), R(" out of bounds  [0,"), R(this.n), R("]")].join("")))
};
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.M = function(a, b) {
  if(32 > this.n - Ed(a)) {
    var c = this.ea.slice();
    c.push(b);
    return new Ld(this.m, this.n + 1, this.shift, this.root, c, k)
  }
  var d = this.n >>> 5 > 1 << this.shift, c = d ? this.shift + 5 : this.shift;
  if(d) {
    d = new Dd(k, Ea.k(32));
    d.l[0] = this.root;
    var f = Fd(k, this.shift, new Dd(k, this.ea));
    d.l[1] = f
  }else {
    d = Hd(a, this.shift, this.root, new Dd(k, this.ea))
  }
  return new Ld(this.m, this.n + 1, c, d, [b], k)
};
o.$a = function(a) {
  return 0 < this.n ? new Kb(a, this.n - 1, k) : K
};
o.lb = function(a) {
  return a.aa(a, 0)
};
o.mb = function(a) {
  return a.aa(a, 1)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.va = function(a, b) {
  return Hb.g(a, b)
};
o.wa = function(a, b, c) {
  return Hb.h(a, b, c)
};
o.F = function(a) {
  return 0 === this.n ? k : Nd.h(a, 0, 0)
};
o.K = n("n");
o.xa = function(a) {
  return 0 < this.n ? a.aa(a, this.n - 1) : k
};
o.Ta = function(a, b, c) {
  return a.T(a, b, c)
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Ld(b, this.n, this.shift, this.root, this.ea, this.p)
};
o.N = n("m");
o.aa = function(a, b) {
  return Id(a, b)[b & 31]
};
o.V = function(a, b, c) {
  var d = 0 <= b;
  return(d ? b < this.n : d) ? a.aa(a, b) : c
};
o.U = function() {
  return cb(Od, this.m)
};
Ld;
var Pd = new Dd(k, Ea.k(32)), Od = new Ld(k, 0, 5, Pd, [], 0);
function U(a) {
  var b = a.length;
  if(32 > b) {
    return new Ld(k, b, 5, Pd, a, k)
  }
  for(var c = a.slice(0, 32), d = 32, f = tb(new Ld(k, 32, 5, Pd, c, k));;) {
    if(d < b) {
      c = d + 1, f = ub(f, a[d]), d = c
    }else {
      return vb(f)
    }
  }
}
function Qd(a) {
  return vb(tc.h(ub, tb(Od), a))
}
var V = function() {
  function a(a) {
    var c = k;
    q(a) && (c = D(Array.prototype.slice.call(arguments, 0), 0));
    return Qd(c)
  }
  a.v = 0;
  a.q = function(a) {
    a = M(a);
    return Qd(a)
  };
  a.j = function(a) {
    return Qd(a)
  };
  return a
}();
function Rd(a, b, c, d, f) {
  this.Na = a;
  this.Aa = b;
  this.C = c;
  this.X = d;
  this.m = f;
  this.B = 0;
  this.o = 27525356
}
o = Rd.prototype;
o.Da = function(a) {
  return this.X + 1 < this.Aa.length ? (a = Nd.w(this.Na, this.Aa, this.C, this.X + 1), a == k ? k : a) : a.Vb(a)
};
o.M = function(a, b) {
  return J(b, a)
};
o.F = ba();
o.ba = function() {
  return this.Aa[this.X]
};
o.Y = function(a) {
  return this.X + 1 < this.Aa.length ? (a = Nd.w(this.Na, this.Aa, this.C, this.X + 1), a == k ? K : a) : a.kb(a)
};
o.Vb = function() {
  var a = this.Aa.length, a = this.C + a < Ga(this.Na) ? Nd.h(this.Na, this.C + a, 0) : k;
  return a == k ? k : a
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return Nd.ca(this.Na, this.Aa, this.C, this.X, b)
};
o.U = function() {
  return cb(Od, this.m)
};
o.Wb = g;
o.sb = function() {
  return Mc.g(this.Aa, this.X)
};
o.kb = function() {
  var a = this.Aa.length, a = this.C + a < Ga(this.Na) ? Nd.h(this.Na, this.C + a, 0) : k;
  return a == k ? K : a
};
Rd;
var Nd = function() {
  function a(a, b, c, d, l) {
    return new Rd(a, b, c, d, l)
  }
  function b(a, b, c, j) {
    return d.ca(a, b, c, j, k)
  }
  function c(a, b, c) {
    return d.ca(a, Id(a, b), b, c, k)
  }
  var d = k, d = function(d, h, i, j, l) {
    switch(arguments.length) {
      case 3:
        return c.call(this, d, h, i);
      case 4:
        return b.call(this, d, h, i, j);
      case 5:
        return a.call(this, d, h, i, j, l)
    }
    e("Invalid arity: " + arguments.length)
  };
  d.h = c;
  d.w = b;
  d.ca = a;
  return d
}();
function Sd(a, b, c, d, f) {
  this.m = a;
  this.Ma = b;
  this.start = c;
  this.end = d;
  this.p = f;
  this.B = 0;
  this.o = 32400159
}
o = Sd.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.J = function(a, b) {
  return a.V(a, b, k)
};
o.A = function(a, b, c) {
  return a.V(a, b, c)
};
o.T = function(a, b, c) {
  a = this.start + b;
  return new Sd(this.m, Qa(this.Ma, a, c), this.start, this.end > a + 1 ? this.end : a + 1, k)
};
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.M = function(a, b) {
  return new Sd(this.m, Za(this.Ma, this.end, b), this.start, this.end + 1, k)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.va = function(a, b) {
  return Hb.g(a, b)
};
o.wa = function(a, b, c) {
  return Hb.h(a, b, c)
};
o.F = function() {
  var a = this, b = function d(b) {
    return b === a.end ? k : J(w.g(a.Ma, b), new S(k, m, function() {
      return d(b + 1)
    }, k))
  };
  return b.k ? b.k(a.start) : b.call(k, a.start)
};
o.K = function() {
  return this.end - this.start
};
o.xa = function() {
  return w.g(this.Ma, this.end - 1)
};
o.Ta = function(a, b, c) {
  return a.T(a, b, c)
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Sd(b, this.Ma, this.start, this.end, this.p)
};
o.N = n("m");
o.aa = function(a, b) {
  return w.g(this.Ma, this.start + b)
};
o.V = function(a, b, c) {
  return w.h(this.Ma, this.start + b, c)
};
o.U = function() {
  return cb(Cd, this.m)
};
Sd;
var Ud = function Td(b, c, d, f) {
  var d = b.root.G === d.G ? d : new Dd(b.root.G, d.l.slice()), h = b.n - 1 >>> c & 31;
  if(5 === c) {
    b = f
  }else {
    var i = d.l[h], b = i != k ? Td(b, c - 5, i, f) : Fd(b.root.G, c - 5, f)
  }
  d.l[h] = b;
  return d
};
function Md(a, b, c, d) {
  this.n = a;
  this.shift = b;
  this.root = c;
  this.ea = d;
  this.o = 275;
  this.B = 22
}
o = Md.prototype;
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.J = function(a, b) {
  return a.V(a, b, k)
};
o.A = function(a, b, c) {
  return a.V(a, b, c)
};
o.aa = function(a, b) {
  if(this.root.G) {
    return Id(a, b)[b & 31]
  }
  e(Error("nth after persistent!"))
};
o.V = function(a, b, c) {
  var d = 0 <= b;
  return(d ? b < this.n : d) ? a.aa(a, b) : c
};
o.K = function() {
  if(this.root.G) {
    return this.n
  }
  e(Error("count after persistent!"))
};
function Vd(a, b, c, d) {
  if(a.root.G) {
    if(function() {
      var b = 0 <= c;
      return b ? c < a.n : b
    }()) {
      if(Ed(b) <= c) {
        a.ea[c & 31] = d
      }else {
        var f = function i(b, f) {
          var r = a.root.G === f.G ? f : new Dd(a.root.G, f.l.slice());
          if(0 === b) {
            r.l[c & 31] = d
          }else {
            var t = c >>> b & 31, x = i(b - 5, r.l[t]);
            r.l[t] = x
          }
          return r
        }.call(k, a.shift, a.root);
        a.root = f
      }
      return b
    }
    if(c === a.n) {
      return b.Sa(b, d)
    }
    e(Error([R("Index "), R(c), R(" out of bounds for TransientVector of length"), R(a.n)].join("")))
  }
  e(Error("assoc! after persistent!"))
}
o.Ra = function(a, b, c) {
  return Vd(a, a, b, c)
};
o.Sa = function(a, b) {
  if(this.root.G) {
    if(32 > this.n - Ed(a)) {
      this.ea[this.n & 31] = b
    }else {
      var c = new Dd(this.root.G, this.ea), d = Ea.k(32);
      d[0] = b;
      this.ea = d;
      if(this.n >>> 5 > 1 << this.shift) {
        var d = Ea.k(32), f = this.shift + 5;
        d[0] = this.root;
        d[1] = Fd(this.root.G, this.shift, c);
        this.root = new Dd(this.root.G, d);
        this.shift = f
      }else {
        this.root = Ud(a, this.shift, this.root, c)
      }
    }
    this.n += 1;
    return a
  }
  e(Error("conj! after persistent!"))
};
o.ab = function(a) {
  if(this.root.G) {
    this.root.G = k;
    var a = this.n - Ed(a), b = Ea.k(a);
    gc(this.ea, 0, b, 0, a);
    return new Ld(k, this.n, this.shift, this.root, b, k)
  }
  e(Error("persistent! called twice"))
};
Md;
function Wd(a, b, c, d) {
  this.m = a;
  this.la = b;
  this.Ia = c;
  this.p = d;
  this.B = 0;
  this.o = 31850572
}
o = Wd.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.M = function(a, b) {
  return J(b, a)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = ba();
o.ba = function() {
  return z(this.la)
};
o.Y = function(a) {
  var b = E(this.la);
  return b ? new Wd(this.m, b, this.Ia, k) : this.Ia == k ? a.U(a) : new Wd(this.m, this.Ia, k, k)
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Wd(b, this.la, this.Ia, this.p)
};
o.N = n("m");
o.U = function() {
  return cb(K, this.m)
};
Wd;
function Xd(a, b, c, d, f) {
  this.m = a;
  this.count = b;
  this.la = c;
  this.Ia = d;
  this.p = f;
  this.B = 0;
  this.o = 31858766
}
o = Xd.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.M = function(a, b) {
  var c;
  s(this.la) ? (c = this.Ia, c = new Xd(this.m, this.count + 1, this.la, Qb.g(s(c) ? c : Od, b), k)) : c = new Xd(this.m, this.count + 1, Qb.g(this.la, b), Od, k);
  return c
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = function() {
  var a = M(this.Ia), b = this.la;
  return s(s(b) ? b : a) ? new Wd(k, this.la, M(a), k) : k
};
o.K = n("count");
o.xa = function() {
  return z(this.la)
};
o.ba = function() {
  return F(this.la)
};
o.Y = function(a) {
  return G(M(a))
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Xd(b, this.count, this.la, this.Ia, this.p)
};
o.N = n("m");
o.U = function() {
  return Yd
};
Xd;
var Yd = new Xd(k, 0, k, Od, 0);
function Zd() {
  this.B = 0;
  this.o = 2097152
}
Zd.prototype.D = ca(m);
Zd;
var $d = new Zd;
function ae(a, b) {
  return jc(cc(b) ? N(a) === N(b) ? ad(cd, hd.g(function(a) {
    return H.g(A.h(b, F(a), $d), Ob(a))
  }, a)) : k : k)
}
function be(a, b, c) {
  for(var d = c.length, f = 0;;) {
    if(f < d) {
      if(b === c[f]) {
        return f
      }
      f += a
    }else {
      return k
    }
  }
}
function ce(a, b) {
  var c = $b.k(a), d = $b.k(b);
  return c < d ? -1 : c > d ? 1 : 0
}
function de(a, b, c) {
  for(var d = a.keys, f = d.length, h = a.Ja, i = Wb(fe, Xb(a)), a = 0, i = tb(i);;) {
    if(a < f) {
      var j = d[a], a = a + 1, i = wb(i, j, h[j])
    }else {
      return Wc(wb(i, b, c))
    }
  }
}
function ge(a, b) {
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
function he(a, b, c, d, f) {
  this.m = a;
  this.keys = b;
  this.Ja = c;
  this.hb = d;
  this.p = f;
  this.B = 1;
  this.o = 15075087
}
o = he.prototype;
o.Qa = function(a) {
  return Vc(vd(Db(), a))
};
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Cc(a)
};
o.J = function(a, b) {
  return a.A(a, b, k)
};
o.A = function(a, b, c) {
  return((a = ea(b)) ? be(1, b, this.keys) != k : a) ? this.Ja[b] : c
};
o.T = function(a, b, c) {
  if(ea(b)) {
    var d = this.hb > ie;
    if(d ? d : this.keys.length >= ie) {
      return de(a, b, c)
    }
    if(be(1, b, this.keys) != k) {
      return a = ge(this.Ja, this.keys), a[b] = c, new he(this.m, this.keys, a, this.hb + 1, k)
    }
    a = ge(this.Ja, this.keys);
    d = this.keys.slice();
    a[b] = c;
    d.push(b);
    return new he(this.m, d, a, this.hb + 1, k)
  }
  return de(a, b, c)
};
o.Oa = function(a, b) {
  var c = ea(b);
  return(c ? be(1, b, this.keys) != k : c) ? g : m
};
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.M = function(a, b) {
  return dc(b) ? a.T(a, w.g(b, 0), w.g(b, 1)) : tc.h(Ia, a, b)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = function() {
  var a = this;
  return 0 < a.keys.length ? hd.g(function(b) {
    return V.j(D([b, a.Ja[b]], 0))
  }, a.keys.sort(ce)) : k
};
o.K = function() {
  return this.keys.length
};
o.D = function(a, b) {
  return ae(a, b)
};
o.O = function(a, b) {
  return new he(b, this.keys, this.Ja, this.hb, this.p)
};
o.N = n("m");
o.U = function() {
  return cb(je, this.m)
};
o.Ca = function(a, b) {
  var c = ea(b);
  if(c ? be(1, b, this.keys) != k : c) {
    var c = this.keys.slice(), d = ge(this.Ja, this.keys);
    c.splice(be(1, b, c), 1);
    delete d[b];
    return new he(this.m, c, d, this.hb + 1, k)
  }
  return a
};
he;
var je = new he(k, [], {}, 0, 0), ie = 32;
function ke(a, b) {
  return new he(k, a, b, 0, k)
}
function le(a, b, c, d) {
  this.m = a;
  this.count = b;
  this.sa = c;
  this.p = d;
  this.B = 0;
  this.o = 15075087
}
o = le.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Cc(a)
};
o.J = function(a, b) {
  return a.A(a, b, k)
};
o.A = function(a, b, c) {
  a = this.sa[$b.k(b)];
  b = s(a) ? be(2, b, a) : k;
  return s(b) ? a[b + 1] : c
};
o.T = function(a, b, c) {
  var a = $b.k(b), d = this.sa[a];
  if(s(d)) {
    var d = d.slice(), f = va(this.sa);
    f[a] = d;
    a = be(2, b, d);
    if(s(a)) {
      return d[a + 1] = c, new le(this.m, this.count, f, k)
    }
    d.push(b, c);
    return new le(this.m, this.count + 1, f, k)
  }
  d = va(this.sa);
  d[a] = [b, c];
  return new le(this.m, this.count + 1, d, k)
};
o.Oa = function(a, b) {
  var c = this.sa[$b.k(b)];
  return s(s(c) ? be(2, b, c) : k) ? g : m
};
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.M = function(a, b) {
  return dc(b) ? a.T(a, w.g(b, 0), w.g(b, 1)) : tc.h(Ia, a, b)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = function() {
  var a = this;
  if(0 < a.count) {
    var b = fc(a.sa).sort();
    return sd.g(function(b) {
      return hd.g(Qd, wd.g(2, a.sa[b]))
    }, b)
  }
  return k
};
o.K = n("count");
o.D = function(a, b) {
  return ae(a, b)
};
o.O = function(a, b) {
  return new le(b, this.count, this.sa, this.p)
};
o.N = n("m");
o.U = function() {
  return cb(me, this.m)
};
o.Ca = function(a, b) {
  var c = $b.k(b), d = this.sa[c], f = s(d) ? be(2, b, d) : k;
  if(Pb(f)) {
    return a
  }
  var h = va(this.sa);
  3 > d.length ? delete h[c] : (d = d.slice(), d.splice(f, 2), h[c] = d);
  return new le(this.m, this.count - 1, h, k)
};
le;
var me = new le(k, 0, {}, 0);
function ne(a, b) {
  for(var c = a.l, d = c.length, f = 0;;) {
    if(d <= f) {
      return-1
    }
    if(H.g(c[f], b)) {
      return f
    }
    f += 2
  }
}
function oe(a, b, c, d) {
  this.m = a;
  this.n = b;
  this.l = c;
  this.p = d;
  this.B = 1;
  this.o = 16123663
}
o = oe.prototype;
o.Qa = function() {
  return new pe({}, this.l.length, this.l.slice())
};
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Cc(a)
};
o.J = function(a, b) {
  return a.A(a, b, k)
};
o.A = function(a, b, c) {
  a = ne(a, b);
  return-1 === a ? c : this.l[a + 1]
};
o.T = function(a, b, c) {
  var d = this, f = ne(a, b);
  return-1 === f ? d.n < qe ? new oe(d.m, d.n + 1, function() {
    var a = d.l.slice();
    a.push(b);
    a.push(c);
    return a
  }(), k) : Wc(Xc(Vc(vd(fe, a)), b, c)) : c === d.l[f + 1] ? a : new oe(d.m, d.n, function() {
    var a = d.l.slice();
    a[f + 1] = c;
    return a
  }(), k)
};
o.Oa = function(a, b) {
  return-1 !== ne(a, b)
};
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.M = function(a, b) {
  return dc(b) ? a.T(a, w.g(b, 0), w.g(b, 1)) : tc.h(Ia, a, b)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = function() {
  var a = this;
  if(0 < a.n) {
    var b = a.l.length, c = function f(c) {
      return new S(k, m, function() {
        return c < b ? J(U([a.l[c], a.l[c + 1]]), f(c + 2)) : k
      }, k)
    };
    return c.k ? c.k(0) : c.call(k, 0)
  }
  return k
};
o.K = n("n");
o.D = function(a, b) {
  return ae(a, b)
};
o.O = function(a, b) {
  return new oe(b, this.n, this.l, this.p)
};
o.N = n("m");
o.U = function() {
  return cb(re, this.m)
};
o.Ca = function(a, b) {
  if(0 <= ne(a, b)) {
    var c = this.l.length, d = c - 2;
    if(0 === d) {
      return a.U(a)
    }
    for(var d = Ea.k(d), f = 0, h = 0;;) {
      if(f >= c) {
        return new oe(this.m, this.n - 1, d, k)
      }
      H.g(b, this.l[f]) || (d[h] = this.l[f], d[h + 1] = this.l[f + 1], h += 2);
      f += 2
    }
  }else {
    return a
  }
};
oe;
var re = new oe(k, 0, [], k), qe = 16;
function pe(a, b, c) {
  this.Ua = a;
  this.Xa = b;
  this.l = c;
  this.B = 14;
  this.o = 258
}
o = pe.prototype;
o.Ra = function(a, b, c) {
  if(s(this.Ua)) {
    var d = ne(a, b);
    if(-1 === d) {
      if(this.Xa + 2 <= 2 * qe) {
        return this.Xa += 2, this.l.push(b), this.l.push(c), a
      }
      var f;
      a: {
        for(var a = this.Xa, d = this.l, h = tb(je), i = 0;;) {
          if(i < a) {
            h = wb(h, d[i], d[i + 1]), i += 2
          }else {
            f = h;
            break a
          }
        }
      }
      return wb(f, b, c)
    }
    c !== this.l[d + 1] && (this.l[d + 1] = c);
    return a
  }
  e(Error("assoc! after persistent!"))
};
o.Sa = function(a, b) {
  if(s(this.Ua)) {
    var c;
    c = b ? ((c = b.o & 2048) ? c : b.gc) ? g : b.o ? m : u(Ta, b) : u(Ta, b);
    if(c) {
      return a.Ra(a, Ua(b), Va(b))
    }
    c = M(b);
    for(var d = a;;) {
      var f = F(c);
      if(s(f)) {
        c = E(c), d = d.Ra(d, Ua(f), Va(f))
      }else {
        return d
      }
    }
  }else {
    e(Error("conj! after persistent!"))
  }
};
o.ab = function() {
  if(s(this.Ua)) {
    return this.Ua = m, new oe(k, vc(this.Xa, 2), this.l, k)
  }
  e(Error("persistent! called twice"))
};
o.J = function(a, b) {
  return a.A(a, b, k)
};
o.A = function(a, b, c) {
  if(s(this.Ua)) {
    return a = ne(a, b), -1 === a ? c : this.l[a + 1]
  }
  e(Error("lookup after persistent!"))
};
o.K = function() {
  if(s(this.Ua)) {
    return vc(this.Xa, 2)
  }
  e(Error("count after persistent!"))
};
pe;
function se(a) {
  this.t = a
}
se;
function te(a, b) {
  return ea(a) ? a === b : H.g(a, b)
}
var ue = function() {
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
  var c = k, c = function(c, f, h, i, j) {
    switch(arguments.length) {
      case 3:
        return b.call(this, c, f, h);
      case 5:
        return a.call(this, c, f, h, i, j)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.h = b;
  c.ca = a;
  return c
}();
function ve(a, b) {
  var c = Ea.k(a.length - 2);
  gc(a, 0, c, 0, 2 * b);
  gc(a, 2 * (b + 1), c, 2 * b, c.length - 2 * b);
  return c
}
var we = function() {
  function a(a, b, c, i, j, l) {
    a = a.Va(b);
    a.l[c] = i;
    a.l[j] = l;
    return a
  }
  function b(a, b, c, i) {
    a = a.Va(b);
    a.l[c] = i;
    return a
  }
  var c = k, c = function(c, f, h, i, j, l) {
    switch(arguments.length) {
      case 4:
        return b.call(this, c, f, h, i);
      case 6:
        return a.call(this, c, f, h, i, j, l)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.w = b;
  c.Ea = a;
  return c
}();
function xe(a, b, c) {
  this.G = a;
  this.Q = b;
  this.l = c
}
o = xe.prototype;
o.qa = function(a, b, c, d, f, h) {
  var i = 1 << (c >>> b & 31), j = wc(this.Q & i - 1);
  if(0 === (this.Q & i)) {
    var l = wc(this.Q);
    if(2 * l < this.l.length) {
      a = this.Va(a);
      b = a.l;
      h.t = g;
      a: {
        c = 2 * (l - j);
        h = 2 * j + (c - 1);
        for(l = 2 * (j + 1) + (c - 1);;) {
          if(0 === c) {
            break a
          }
          b[l] = b[h];
          l -= 1;
          c -= 1;
          h -= 1
        }
      }
      b[2 * j] = d;
      b[2 * j + 1] = f;
      a.Q |= i;
      return a
    }
    if(16 <= l) {
      j = Ea.k(32);
      j[c >>> b & 31] = ye.qa(a, b + 5, c, d, f, h);
      for(f = d = 0;;) {
        if(32 > d) {
          0 !== (this.Q >>> d & 1) && (j[d] = this.l[f] != k ? ye.qa(a, b + 5, $b.k(this.l[f]), this.l[f], this.l[f + 1], h) : this.l[f + 1], f += 2), d += 1
        }else {
          break
        }
      }
      return new ze(a, l + 1, j)
    }
    b = Ea.k(2 * (l + 4));
    gc(this.l, 0, b, 0, 2 * j);
    b[2 * j] = d;
    b[2 * j + 1] = f;
    gc(this.l, 2 * j, b, 2 * (j + 1), 2 * (l - j));
    h.t = g;
    d = this.Va(a);
    d.l = b;
    d.Q |= i;
    return d
  }
  l = this.l[2 * j];
  i = this.l[2 * j + 1];
  if(l == k) {
    return d = i.qa(a, b + 5, c, d, f, h), d === i ? this : we.w(this, a, 2 * j + 1, d)
  }
  if(te(d, l)) {
    return f === i ? this : we.w(this, a, 2 * j + 1, f)
  }
  h.t = g;
  return we.Ea(this, a, 2 * j, k, 2 * j + 1, Ae.bb(a, b + 5, l, i, c, d, f))
};
o.eb = function() {
  return Be.k(this.l)
};
o.Va = function(a) {
  if(a === this.G) {
    return this
  }
  var b = wc(this.Q), c = Ea.k(0 > b ? 4 : 2 * (b + 1));
  gc(this.l, 0, c, 0, 2 * b);
  return new xe(a, this.Q, c)
};
o.fb = function(a, b, c) {
  var d = 1 << (b >>> a & 31);
  if(0 === (this.Q & d)) {
    return this
  }
  var f = wc(this.Q & d - 1), h = this.l[2 * f], i = this.l[2 * f + 1];
  return h == k ? (a = i.fb(a + 5, b, c), a === i ? this : a != k ? new xe(k, this.Q, ue.h(this.l, 2 * f + 1, a)) : this.Q === d ? k : new xe(k, this.Q ^ d, ve(this.l, f))) : te(c, h) ? new xe(k, this.Q ^ d, ve(this.l, f)) : this
};
o.pa = function(a, b, c, d, f) {
  var h = 1 << (b >>> a & 31), i = wc(this.Q & h - 1);
  if(0 === (this.Q & h)) {
    var j = wc(this.Q);
    if(16 <= j) {
      i = Ea.k(32);
      i[b >>> a & 31] = ye.pa(a + 5, b, c, d, f);
      for(d = c = 0;;) {
        if(32 > c) {
          0 !== (this.Q >>> c & 1) && (i[c] = this.l[d] != k ? ye.pa(a + 5, $b.k(this.l[d]), this.l[d], this.l[d + 1], f) : this.l[d + 1], d += 2), c += 1
        }else {
          break
        }
      }
      return new ze(k, j + 1, i)
    }
    a = Ea.k(2 * (j + 1));
    gc(this.l, 0, a, 0, 2 * i);
    a[2 * i] = c;
    a[2 * i + 1] = d;
    gc(this.l, 2 * i, a, 2 * (i + 1), 2 * (j - i));
    f.t = g;
    return new xe(k, this.Q | h, a)
  }
  h = this.l[2 * i];
  j = this.l[2 * i + 1];
  if(h == k) {
    return f = j.pa(a + 5, b, c, d, f), f === j ? this : new xe(k, this.Q, ue.h(this.l, 2 * i + 1, f))
  }
  if(te(c, h)) {
    return d === j ? this : new xe(k, this.Q, ue.h(this.l, 2 * i + 1, d))
  }
  f.t = g;
  return new xe(k, this.Q, ue.ca(this.l, 2 * i, k, 2 * i + 1, Ae.Ea(a + 5, h, j, b, c, d)))
};
o.Fa = function(a, b, c, d) {
  var f = 1 << (b >>> a & 31);
  if(0 === (this.Q & f)) {
    return d
  }
  var h = wc(this.Q & f - 1), f = this.l[2 * h], h = this.l[2 * h + 1];
  return f == k ? h.Fa(a + 5, b, c, d) : te(c, f) ? h : d
};
xe;
var ye = new xe(k, 0, Ea.k(0));
function ze(a, b, c) {
  this.G = a;
  this.n = b;
  this.l = c
}
o = ze.prototype;
o.qa = function(a, b, c, d, f, h) {
  var i = c >>> b & 31, j = this.l[i];
  if(j == k) {
    return a = we.w(this, a, i, ye.qa(a, b + 5, c, d, f, h)), a.n += 1, a
  }
  b = j.qa(a, b + 5, c, d, f, h);
  return b === j ? this : we.w(this, a, i, b)
};
o.eb = function() {
  return Ce.k(this.l)
};
o.Va = function(a) {
  return a === this.G ? this : new ze(a, this.n, this.l.slice())
};
o.fb = function(a, b, c) {
  var d = b >>> a & 31, f = this.l[d];
  if(f != k) {
    a = f.fb(a + 5, b, c);
    if(a === f) {
      d = this
    }else {
      if(a == k) {
        if(8 >= this.n) {
          a: {
            for(var f = this.l, a = 2 * (this.n - 1), b = Ea.k(a), c = 0, h = 1, i = 0;;) {
              if(c < a) {
                var j = c !== d;
                if(j ? f[c] != k : j) {
                  b[h] = f[c], h += 2, i |= 1 << c
                }
                c += 1
              }else {
                d = new xe(k, i, b);
                break a
              }
            }
            d = aa
          }
        }else {
          d = new ze(k, this.n - 1, ue.h(this.l, d, a))
        }
      }else {
        d = new ze(k, this.n, ue.h(this.l, d, a))
      }
    }
    return d
  }
  return this
};
o.pa = function(a, b, c, d, f) {
  var h = b >>> a & 31, i = this.l[h];
  if(i == k) {
    return new ze(k, this.n + 1, ue.h(this.l, h, ye.pa(a + 5, b, c, d, f)))
  }
  a = i.pa(a + 5, b, c, d, f);
  return a === i ? this : new ze(k, this.n, ue.h(this.l, h, a))
};
o.Fa = function(a, b, c, d) {
  var f = this.l[b >>> a & 31];
  return f != k ? f.Fa(a + 5, b, c, d) : d
};
ze;
function De(a, b, c) {
  for(var b = 2 * b, d = 0;;) {
    if(d < b) {
      if(te(c, a[d])) {
        return d
      }
      d += 2
    }else {
      return-1
    }
  }
}
function Ee(a, b, c, d) {
  this.G = a;
  this.ya = b;
  this.n = c;
  this.l = d
}
o = Ee.prototype;
o.qa = function(a, b, c, d, f, h) {
  if(c === this.ya) {
    b = De(this.l, this.n, d);
    if(-1 === b) {
      if(this.l.length > 2 * this.n) {
        return a = we.Ea(this, a, 2 * this.n, d, 2 * this.n + 1, f), h.t = g, a.n += 1, a
      }
      c = this.l.length;
      b = Ea.k(c + 2);
      gc(this.l, 0, b, 0, c);
      b[c] = d;
      b[c + 1] = f;
      h.t = g;
      h = this.n + 1;
      a === this.G ? (this.l = b, this.n = h, a = this) : a = new Ee(this.G, this.ya, h, b);
      return a
    }
    return this.l[b + 1] === f ? this : we.w(this, a, b + 1, f)
  }
  return(new xe(a, 1 << (this.ya >>> b & 31), [k, this, k, k])).qa(a, b, c, d, f, h)
};
o.eb = function() {
  return Be.k(this.l)
};
o.Va = function(a) {
  if(a === this.G) {
    return this
  }
  var b = Ea.k(2 * (this.n + 1));
  gc(this.l, 0, b, 0, 2 * this.n);
  return new Ee(a, this.ya, this.n, b)
};
o.fb = function(a, b, c) {
  a = De(this.l, this.n, c);
  return-1 === a ? this : 1 === this.n ? k : new Ee(k, this.ya, this.n - 1, ve(this.l, vc(a, 2)))
};
o.pa = function(a, b, c, d, f) {
  return b === this.ya ? (a = De(this.l, this.n, c), -1 === a ? (a = this.l.length, b = Ea.k(a + 2), gc(this.l, 0, b, 0, a), b[a] = c, b[a + 1] = d, f.t = g, new Ee(k, this.ya, this.n + 1, b)) : H.g(this.l[a], d) ? this : new Ee(k, this.ya, this.n, ue.h(this.l, a + 1, d))) : (new xe(k, 1 << (this.ya >>> a & 31), [k, this])).pa(a, b, c, d, f)
};
o.Fa = function(a, b, c, d) {
  a = De(this.l, this.n, c);
  return 0 > a ? d : te(c, this.l[a]) ? this.l[a + 1] : d
};
Ee;
var Ae = function() {
  function a(a, b, c, i, j, l, r) {
    var t = $b.k(c);
    if(t === j) {
      return new Ee(k, t, 2, [c, i, l, r])
    }
    var x = new se(m);
    return ye.qa(a, b, t, c, i, x).qa(a, b, j, l, r, x)
  }
  function b(a, b, c, i, j, l) {
    var r = $b.k(b);
    if(r === i) {
      return new Ee(k, r, 2, [b, c, j, l])
    }
    var t = new se(m);
    return ye.pa(a, r, b, c, t).pa(a, i, j, l, t)
  }
  var c = k, c = function(c, f, h, i, j, l, r) {
    switch(arguments.length) {
      case 6:
        return b.call(this, c, f, h, i, j, l);
      case 7:
        return a.call(this, c, f, h, i, j, l, r)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.Ea = b;
  c.bb = a;
  return c
}();
function Fe(a, b, c, d, f) {
  this.m = a;
  this.Ha = b;
  this.C = c;
  this.ra = d;
  this.p = f;
  this.B = 0;
  this.o = 31850572
}
o = Fe.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.M = function(a, b) {
  return J(b, a)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = ba();
o.ba = function() {
  return this.ra == k ? U([this.Ha[this.C], this.Ha[this.C + 1]]) : F(this.ra)
};
o.Y = function() {
  return this.ra == k ? Be.h(this.Ha, this.C + 2, k) : Be.h(this.Ha, this.C, E(this.ra))
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Fe(b, this.Ha, this.C, this.ra, this.p)
};
o.N = n("m");
o.U = function() {
  return cb(K, this.m)
};
Fe;
var Be = function() {
  function a(a, b, c) {
    if(c == k) {
      for(c = a.length;;) {
        if(b < c) {
          if(a[b] != k) {
            return new Fe(k, a, b, k, k)
          }
          var i = a[b + 1];
          if(s(i) && (i = i.eb(), s(i))) {
            return new Fe(k, a, b + 2, i, k)
          }
          b += 2
        }else {
          return k
        }
      }
    }else {
      return new Fe(k, a, b, c, k)
    }
  }
  function b(a) {
    return c.h(a, 0, k)
  }
  var c = k, c = function(c, f, h) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.k = b;
  c.h = a;
  return c
}();
function Ge(a, b, c, d, f) {
  this.m = a;
  this.Ha = b;
  this.C = c;
  this.ra = d;
  this.p = f;
  this.B = 0;
  this.o = 31850572
}
o = Ge.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.M = function(a, b) {
  return J(b, a)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = ba();
o.ba = function() {
  return F(this.ra)
};
o.Y = function() {
  return Ce.w(k, this.Ha, this.C, E(this.ra))
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Ge(b, this.Ha, this.C, this.ra, this.p)
};
o.N = n("m");
o.U = function() {
  return cb(K, this.m)
};
Ge;
var Ce = function() {
  function a(a, b, c, i) {
    if(i == k) {
      for(i = b.length;;) {
        if(c < i) {
          var j = b[c];
          if(s(j) && (j = j.eb(), s(j))) {
            return new Ge(a, b, c + 1, j, k)
          }
          c += 1
        }else {
          return k
        }
      }
    }else {
      return new Ge(a, b, c, i, k)
    }
  }
  function b(a) {
    return c.w(k, a, 0, k)
  }
  var c = k, c = function(c, f, h, i) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 4:
        return a.call(this, c, f, h, i)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.k = b;
  c.w = a;
  return c
}();
function He(a, b, c, d, f, h) {
  this.m = a;
  this.n = b;
  this.root = c;
  this.Z = d;
  this.fa = f;
  this.p = h;
  this.B = 1;
  this.o = 16123663
}
o = He.prototype;
o.Qa = function() {
  return new Ie({}, this.root, this.n, this.Z, this.fa)
};
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Cc(a)
};
o.J = function(a, b) {
  return a.A(a, b, k)
};
o.A = function(a, b, c) {
  return b == k ? this.Z ? this.fa : c : this.root == k ? c : this.root.Fa(0, $b.k(b), b, c)
};
o.T = function(a, b, c) {
  if(b == k) {
    var d = this.Z;
    return(d ? c === this.fa : d) ? a : new He(this.m, this.Z ? this.n : this.n + 1, this.root, g, c, k)
  }
  d = new se(m);
  c = (this.root == k ? ye : this.root).pa(0, $b.k(b), b, c, d);
  return c === this.root ? a : new He(this.m, d.t ? this.n + 1 : this.n, c, this.Z, this.fa, k)
};
o.Oa = function(a, b) {
  return b == k ? this.Z : this.root == k ? m : this.root.Fa(0, $b.k(b), b, hc) !== hc
};
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.M = function(a, b) {
  return dc(b) ? a.T(a, w.g(b, 0), w.g(b, 1)) : tc.h(Ia, a, b)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = function() {
  if(0 < this.n) {
    var a = this.root != k ? this.root.eb() : k;
    return this.Z ? J(U([k, this.fa]), a) : a
  }
  return k
};
o.K = n("n");
o.D = function(a, b) {
  return ae(a, b)
};
o.O = function(a, b) {
  return new He(b, this.n, this.root, this.Z, this.fa, this.p)
};
o.N = n("m");
o.U = function() {
  return cb(fe, this.m)
};
o.Ca = function(a, b) {
  if(b == k) {
    return this.Z ? new He(this.m, this.n - 1, this.root, m, k, k) : a
  }
  if(this.root == k) {
    return a
  }
  var c = this.root.fb(0, $b.k(b), b);
  return c === this.root ? a : new He(this.m, this.n - 1, c, this.Z, this.fa, k)
};
He;
var fe = new He(k, 0, k, m, k, 0);
function Ie(a, b, c, d, f) {
  this.G = a;
  this.root = b;
  this.count = c;
  this.Z = d;
  this.fa = f;
  this.B = 14;
  this.o = 258
}
o = Ie.prototype;
o.Ra = function(a, b, c) {
  return Je(a, b, c)
};
o.Sa = function(a, b) {
  var c;
  a: {
    if(a.G) {
      var d;
      d = b ? ((d = b.o & 2048) ? d : b.gc) ? g : b.o ? m : u(Ta, b) : u(Ta, b);
      if(d) {
        c = Je(a, Ua(b), Va(b))
      }else {
        d = M(b);
        for(var f = a;;) {
          var h = F(d);
          if(s(h)) {
            d = E(d), f = Je(f, Ua(h), Va(h))
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
o.ab = function(a) {
  var b;
  a.G ? (a.G = k, b = new He(k, a.count, a.root, a.Z, a.fa, k)) : e(Error("persistent! called twice"));
  return b
};
o.J = function(a, b) {
  return b == k ? this.Z ? this.fa : k : this.root == k ? k : this.root.Fa(0, $b.k(b), b)
};
o.A = function(a, b, c) {
  return b == k ? this.Z ? this.fa : c : this.root == k ? c : this.root.Fa(0, $b.k(b), b, c)
};
o.K = function() {
  if(this.G) {
    return this.count
  }
  e(Error("count after persistent!"))
};
function Je(a, b, c) {
  if(a.G) {
    if(b == k) {
      if(a.fa !== c && (a.fa = c), !a.Z) {
        a.count += 1, a.Z = g
      }
    }else {
      var d = new se(m), b = (a.root == k ? ye : a.root).qa(a.G, 0, $b.k(b), b, c, d);
      b !== a.root && (a.root = b);
      d.t && (a.count += 1)
    }
    return a
  }
  e(Error("assoc! after persistent!"))
}
Ie;
function Ke(a, b, c) {
  for(var d = b;;) {
    if(a != k) {
      b = c ? a.left : a.right, d = Qb.g(d, a), a = b
    }else {
      return d
    }
  }
}
function Le(a, b, c, d, f) {
  this.m = a;
  this.stack = b;
  this.ib = c;
  this.n = d;
  this.p = f;
  this.B = 0;
  this.o = 31850570
}
o = Le.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.M = function(a, b) {
  return J(b, a)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = ba();
o.K = function(a) {
  return 0 > this.n ? N(E(a)) + 1 : this.n
};
o.ba = function() {
  return Xa(this.stack)
};
o.Y = function() {
  var a = F(this.stack), a = Ke(this.ib ? a.right : a.left, E(this.stack), this.ib);
  return a != k ? new Le(k, a, this.ib, this.n - 1, k) : K
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new Le(b, this.stack, this.ib, this.n, this.p)
};
o.N = n("m");
Le;
function Me(a, b, c, d) {
  return I(W, c) ? I(W, c.left) ? new W(c.key, c.t, c.left.ta(), new X(a, b, c.right, d, k), k) : I(W, c.right) ? new W(c.right.key, c.right.t, new X(c.key, c.t, c.left, c.right.left, k), new X(a, b, c.right.right, d, k), k) : new X(a, b, c, d, k) : new X(a, b, c, d, k)
}
function Ne(a, b, c, d) {
  return I(W, d) ? I(W, d.right) ? new W(d.key, d.t, new X(a, b, c, d.left, k), d.right.ta(), k) : I(W, d.left) ? new W(d.left.key, d.left.t, new X(a, b, c, d.left.left, k), new X(d.key, d.t, d.left.right, d.right, k), k) : new X(a, b, c, d, k) : new X(a, b, c, d, k)
}
function Oe(a, b, c, d) {
  if(I(W, c)) {
    return new W(a, b, c.ta(), d, k)
  }
  if(I(X, d)) {
    return Ne(a, b, c, d.gb())
  }
  var f = I(W, d);
  if(f ? I(X, d.left) : f) {
    return new W(d.left.key, d.left.t, new X(a, b, c, d.left.left, k), Ne(d.key, d.t, d.left.right, d.right.gb()), k)
  }
  e(Error("red-black tree invariant violation"))
}
function Pe(a, b, c, d) {
  if(I(W, d)) {
    return new W(a, b, c, d.ta(), k)
  }
  if(I(X, c)) {
    return Me(a, b, c.gb(), d)
  }
  var f = I(W, c);
  if(f ? I(X, c.right) : f) {
    return new W(c.right.key, c.right.t, Me(c.key, c.t, c.left.gb(), c.right.left), new X(a, b, c.right.right, d, k), k)
  }
  e(Error("red-black tree invariant violation"))
}
function X(a, b, c, d, f) {
  this.key = a;
  this.t = b;
  this.left = c;
  this.right = d;
  this.p = f;
  this.B = 0;
  this.o = 32402207
}
o = X.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.J = function(a, b) {
  return a.V(a, b, k)
};
o.A = function(a, b, c) {
  return a.V(a, b, c)
};
o.T = function(a, b, c) {
  return Ub.h(U([this.key, this.t]), b, c)
};
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.M = function(a, b) {
  return U([this.key, this.t, b])
};
o.lb = n("key");
o.mb = n("t");
o.Rb = function(a) {
  return a.Tb(this)
};
o.gb = function() {
  return new W(this.key, this.t, this.left, this.right, k)
};
o.replace = function(a, b, c, d) {
  return new X(a, b, c, d, k)
};
o.Qb = function(a) {
  return a.Sb(this)
};
o.Sb = function(a) {
  return new X(a.key, a.t, this, a.right, k)
};
o.toString = function() {
  return function() {
    switch(arguments.length) {
      case 0:
        return L.j(D([this], 0))
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.Tb = function(a) {
  return new X(a.key, a.t, a.left, this, k)
};
o.ta = function() {
  return this
};
o.va = function(a, b) {
  return Hb.g(a, b)
};
o.wa = function(a, b, c) {
  return Hb.h(a, b, c)
};
o.F = function() {
  return Eb.g(this.key, this.t)
};
o.K = ca(2);
o.xa = n("t");
o.Ta = function(a, b, c) {
  return Za(U([this.key, this.t]), b, c)
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return Wb(U([this.key, this.t]), b)
};
o.N = ca(k);
o.aa = function(a, b) {
  return 0 === b ? this.key : 1 === b ? this.t : k
};
o.V = function(a, b, c) {
  return 0 === b ? this.key : 1 === b ? this.t : c
};
o.U = function() {
  return Od
};
X;
function W(a, b, c, d, f) {
  this.key = a;
  this.t = b;
  this.left = c;
  this.right = d;
  this.p = f;
  this.B = 0;
  this.o = 32402207
}
o = W.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.J = function(a, b) {
  return a.V(a, b, k)
};
o.A = function(a, b, c) {
  return a.V(a, b, c)
};
o.T = function(a, b, c) {
  return Ub.h(U([this.key, this.t]), b, c)
};
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.M = function(a, b) {
  return U([this.key, this.t, b])
};
o.lb = n("key");
o.mb = n("t");
o.Rb = function(a) {
  return new W(this.key, this.t, this.left, a, k)
};
o.gb = function() {
  e(Error("red-black tree invariant violation"))
};
o.replace = function(a, b, c, d) {
  return new W(a, b, c, d, k)
};
o.Qb = function(a) {
  return new W(this.key, this.t, a, this.right, k)
};
o.Sb = function(a) {
  return I(W, this.left) ? new W(this.key, this.t, this.left.ta(), new X(a.key, a.t, this.right, a.right, k), k) : I(W, this.right) ? new W(this.right.key, this.right.t, new X(this.key, this.t, this.left, this.right.left, k), new X(a.key, a.t, this.right.right, a.right, k), k) : new X(a.key, a.t, this, a.right, k)
};
o.toString = function() {
  return function() {
    switch(arguments.length) {
      case 0:
        return L.j(D([this], 0))
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.Tb = function(a) {
  return I(W, this.right) ? new W(this.key, this.t, new X(a.key, a.t, a.left, this.left, k), this.right.ta(), k) : I(W, this.left) ? new W(this.left.key, this.left.t, new X(a.key, a.t, a.left, this.left.left, k), new X(this.key, this.t, this.left.right, this.right, k), k) : new X(a.key, a.t, a.left, this, k)
};
o.ta = function() {
  return new X(this.key, this.t, this.left, this.right, k)
};
o.va = function(a, b) {
  return Hb.g(a, b)
};
o.wa = function(a, b, c) {
  return Hb.h(a, b, c)
};
o.F = function() {
  return Eb.g(this.key, this.t)
};
o.K = ca(2);
o.xa = n("t");
o.Ta = function(a, b, c) {
  return Za(U([this.key, this.t]), b, c)
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return Wb(U([this.key, this.t]), b)
};
o.N = ca(k);
o.aa = function(a, b) {
  return 0 === b ? this.key : 1 === b ? this.t : k
};
o.V = function(a, b, c) {
  return 0 === b ? this.key : 1 === b ? this.t : c
};
o.U = function() {
  return Od
};
W;
var Re = function Qe(b, c, d, f, h) {
  if(c == k) {
    return new W(d, f, k, k, k)
  }
  var i = b.g ? b.g(d, c.key) : b.call(k, d, c.key);
  if(0 === i) {
    return h[0] = c, k
  }
  if(0 > i) {
    return b = Qe(b, c.left, d, f, h), b != k ? c.Qb(b) : k
  }
  b = Qe(b, c.right, d, f, h);
  return b != k ? c.Rb(b) : k
}, Te = function Se(b, c) {
  if(b == k) {
    return c
  }
  if(c == k) {
    return b
  }
  if(I(W, b)) {
    if(I(W, c)) {
      var d = Se(b.right, c.left);
      return I(W, d) ? new W(d.key, d.t, new W(b.key, b.t, b.left, d.left, k), new W(c.key, c.t, d.right, c.right, k), k) : new W(b.key, b.t, b.left, new W(c.key, c.t, d, c.right, k), k)
    }
    return new W(b.key, b.t, b.left, Se(b.right, c), k)
  }
  if(I(W, c)) {
    return new W(c.key, c.t, Se(b, c.left), c.right, k)
  }
  d = Se(b.right, c.left);
  return I(W, d) ? new W(d.key, d.t, new X(b.key, b.t, b.left, d.left, k), new X(c.key, c.t, d.right, c.right, k), k) : Oe(b.key, b.t, b.left, new X(c.key, c.t, d, c.right, k))
}, Ve = function Ue(b, c, d, f) {
  if(c != k) {
    var h = b.g ? b.g(d, c.key) : b.call(k, d, c.key);
    if(0 === h) {
      return f[0] = c, Te(c.left, c.right)
    }
    if(0 > h) {
      var i = Ue(b, c.left, d, f);
      return function() {
        var b = i != k;
        return b ? b : f[0] != k
      }() ? I(X, c.left) ? Oe(c.key, c.t, i, c.right) : new W(c.key, c.t, i, c.right, k) : k
    }
    var j = Ue(b, c.right, d, f);
    return function() {
      var b = j != k;
      return b ? b : f[0] != k
    }() ? I(X, c.right) ? Pe(c.key, c.t, c.left, j) : new W(c.key, c.t, c.left, j, k) : k
  }
  return k
}, Xe = function We(b, c, d, f) {
  var h = c.key, i = b.g ? b.g(d, h) : b.call(k, d, h);
  return 0 === i ? c.replace(h, f, c.left, c.right) : 0 > i ? c.replace(h, c.t, We(b, c.left, d, f), c.right) : c.replace(h, c.t, c.left, We(b, c.right, d, f))
};
function Ye(a, b, c, d, f) {
  this.oa = a;
  this.La = b;
  this.n = c;
  this.m = d;
  this.p = f;
  this.B = 0;
  this.o = 418776847
}
o = Ye.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Cc(a)
};
o.J = function(a, b) {
  return a.A(a, b, k)
};
o.A = function(a, b, c) {
  a = Ze(a, b);
  return a != k ? a.t : c
};
o.T = function(a, b, c) {
  var d = [k], f = Re(this.oa, this.La, b, c, d);
  return f == k ? (d = P.g(d, 0), H.g(c, d.t) ? a : new Ye(this.oa, Xe(this.oa, this.La, b, c), this.n, this.m, k)) : new Ye(this.oa, f.ta(), this.n + 1, this.m, k)
};
o.Oa = function(a, b) {
  return Ze(a, b) != k
};
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.M = function(a, b) {
  return dc(b) ? a.T(a, w.g(b, 0), w.g(b, 1)) : tc.h(Ia, a, b)
};
o.$a = function() {
  return 0 < this.n ? new Le(k, Ke(this.La, k, m), m, this.n, k) : k
};
o.toString = function() {
  return L.j(D([this], 0))
};
function Ze(a, b) {
  for(var c = a.La;;) {
    if(c != k) {
      var d = a.oa.g ? a.oa.g(b, c.key) : a.oa.call(k, b, c.key);
      if(0 === d) {
        return c
      }
      c = 0 > d ? c.left : c.right
    }else {
      return k
    }
  }
}
o.F = function() {
  return 0 < this.n ? new Le(k, Ke(this.La, k, g), g, this.n, k) : k
};
o.K = n("n");
o.D = function(a, b) {
  return ae(a, b)
};
o.O = function(a, b) {
  return new Ye(this.oa, this.La, this.n, b, this.p)
};
o.N = n("m");
o.U = function() {
  return cb($e, this.m)
};
o.Ca = function(a, b) {
  var c = [k], d = Ve(this.oa, this.La, b, c);
  return d == k ? P.g(c, 0) == k ? a : new Ye(this.oa, k, 0, this.m, k) : new Ye(this.oa, d.ta(), this.n - 1, this.m, k)
};
Ye;
var $e = new Ye(oc, k, 0, k, 0), Db = function() {
  function a(a) {
    var d = k;
    q(a) && (d = D(Array.prototype.slice.call(arguments, 0), 0));
    return b.call(this, d)
  }
  function b(a) {
    for(var a = M(a), b = tb(fe);;) {
      if(a) {
        var f = E(E(a)), b = Xc(b, F(a), Ob(a)), a = f
      }else {
        return vb(b)
      }
    }
  }
  a.v = 0;
  a.q = function(a) {
    a = M(a);
    return b(a)
  };
  a.j = b;
  return a
}(), af = function() {
  function a(a) {
    var d = k;
    q(a) && (d = D(Array.prototype.slice.call(arguments, 0), 0));
    return b.call(this, d)
  }
  function b(a) {
    for(var a = M(a), b = $e;;) {
      if(a) {
        var f = E(E(a)), b = Ub.h(b, F(a), Ob(a)), a = f
      }else {
        return b
      }
    }
  }
  a.v = 0;
  a.q = function(a) {
    a = M(a);
    return b(a)
  };
  a.j = b;
  return a
}();
function bf(a) {
  return M(hd.g(F, a))
}
function cf(a) {
  return Ua(a)
}
var df = function() {
  function a(a) {
    var d = k;
    q(a) && (d = D(Array.prototype.slice.call(arguments, 0), 0));
    return b.call(this, d)
  }
  function b(a) {
    return s(bd(a)) ? tc.g(function(a, b) {
      return Qb.g(s(a) ? a : je, b)
    }, a) : k
  }
  a.v = 0;
  a.q = function(a) {
    a = M(a);
    return b(a)
  };
  a.j = b;
  return a
}();
function ef(a, b, c) {
  this.m = a;
  this.cb = b;
  this.p = c;
  this.B = 1;
  this.o = 15077647
}
o = ef.prototype;
o.Qa = function() {
  return new ff(tb(this.cb))
};
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Dc(a)
};
o.J = function(a, b) {
  return a.A(a, b, k)
};
o.A = function(a, b, c) {
  return s(Pa(this.cb, b)) ? b : c
};
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.M = function(a, b) {
  return new ef(this.m, Ub.h(this.cb, b, k), k)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = function() {
  return bf(this.cb)
};
o.K = function(a) {
  return N(M(a))
};
o.D = function(a, b) {
  var c = bc(b);
  return c ? (c = N(a) === N(b)) ? ad(function(b) {
    return nc(a, b)
  }, b) : c : c
};
o.O = function(a, b) {
  return new ef(b, this.cb, this.p)
};
o.N = n("m");
o.U = function() {
  return cb(gf, this.m)
};
ef;
var gf = new ef(k, Db(), 0);
function hf(a) {
  for(var b = N(a), c = 0, d = tb(gf);;) {
    if(c < b) {
      var f = c + 1, d = ub(d, a[c]), c = f
    }else {
      return vb(d)
    }
  }
}
function ff(a) {
  this.Ka = a;
  this.o = 259;
  this.B = 34
}
o = ff.prototype;
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return A.h(this.Ka, c, hc) === hc ? k : c;
      case 3:
        return A.h(this.Ka, c, hc) === hc ? d : c
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.J = function(a, b) {
  return a.A(a, b, k)
};
o.A = function(a, b, c) {
  return A.h(this.Ka, b, hc) === hc ? c : b
};
o.K = function() {
  return N(this.Ka)
};
o.Sa = function(a, b) {
  this.Ka = wb(this.Ka, b, k);
  return a
};
o.ab = function() {
  return new ef(k, vb(this.Ka), k)
};
ff;
function jf(a, b, c) {
  this.m = a;
  this.Za = b;
  this.p = c;
  this.B = 0;
  this.o = 417730831
}
o = jf.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Dc(a)
};
o.J = function(a, b) {
  return a.A(a, b, k)
};
o.A = function(a, b, c) {
  return s(Pa(this.Za, b)) ? b : c
};
o.call = function() {
  var a = k;
  return a = function(a, c, d) {
    switch(arguments.length) {
      case 2:
        return this.J(this, c);
      case 3:
        return this.A(this, c, d)
    }
    e("Invalid arity: " + arguments.length)
  }
}();
o.apply = function(a, b) {
  return a.call.apply(a, [a].concat(b.slice()))
};
o.M = function(a, b) {
  return new jf(this.m, Ub.h(this.Za, b, k), k)
};
o.$a = function() {
  return hd.g(cf, mb(this.Za))
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.F = function() {
  return bf(this.Za)
};
o.K = function() {
  return N(this.Za)
};
o.D = function(a, b) {
  var c = bc(b);
  return c ? (c = N(a) === N(b)) ? ad(function(b) {
    return nc(a, b)
  }, b) : c : c
};
o.O = function(a, b) {
  return new jf(b, this.Za, this.p)
};
o.N = n("m");
o.U = function() {
  return cb(kf, this.m)
};
jf;
var kf = new jf(k, af(), 0), lf = function() {
  var a = k, b = function() {
    function a(c) {
      var h = k;
      q(c) && (h = D(Array.prototype.slice.call(arguments, 0), 0));
      return b.call(this, h)
    }
    function b(a) {
      for(var c = M(a), d = tb(gf);;) {
        if(M(c)) {
          a = E(c), c = F(c), d = ub(d, c), c = a
        }else {
          return vb(d)
        }
      }
    }
    a.v = 0;
    a.q = function(a) {
      a = M(a);
      return b(a)
    };
    a.j = b;
    return a
  }(), a = function(a) {
    switch(arguments.length) {
      case 0:
        return gf;
      default:
        return b.j(D(arguments, 0))
    }
    e("Invalid arity: " + arguments.length)
  };
  a.v = 0;
  a.q = b.q;
  a.S = function() {
    return gf
  };
  a.j = b.j;
  return a
}();
function mf(a) {
  return T.g(lf, a)
}
function nf(a) {
  if(kc(a)) {
    return a
  }
  var b = lc(a);
  if(b ? b : mc(a)) {
    return b = a.lastIndexOf("/"), 0 > b ? zc.g(a, 2) : zc.g(a, b + 1)
  }
  e(Error([R("Doesn't support name: "), R(a)].join("")))
}
function of(a) {
  var b = lc(a);
  if(b ? b : mc(a)) {
    return b = a.lastIndexOf("/"), -1 < b ? zc.h(a, 2, b) : k
  }
  e(Error([R("Doesn't support namespace: "), R(a)].join("")))
}
var pf = function() {
  function a(a, b, c) {
    return(a.k ? a.k(b) : a.call(k, b)) > (a.k ? a.k(c) : a.call(k, c)) ? b : c
  }
  var b = k, c = function() {
    function a(b, d, j, l) {
      var r = k;
      q(l) && (r = D(Array.prototype.slice.call(arguments, 3), 0));
      return c.call(this, b, d, j, r)
    }
    function c(a, d, f, l) {
      return tc.h(function(c, d) {
        return b.h(a, c, d)
      }, b.h(a, d, f), l)
    }
    a.v = 3;
    a.q = function(a) {
      var b = F(a), d = F(E(a)), l = F(E(E(a))), a = G(E(E(a)));
      return c(b, d, l, a)
    };
    a.j = c;
    return a
  }(), b = function(b, f, h, i) {
    switch(arguments.length) {
      case 2:
        return f;
      case 3:
        return a.call(this, b, f, h);
      default:
        return c.j(b, f, h, D(arguments, 3))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.v = 3;
  b.q = c.q;
  b.g = function(a, b) {
    return b
  };
  b.h = a;
  b.j = c.j;
  return b
}(), rf = function qf(b, c) {
  return new S(k, m, function() {
    var d = M(c);
    return d ? s(b.k ? b.k(F(d)) : b.call(k, F(d))) ? J(F(d), qf(b, G(d))) : k : k
  }, k)
};
function sf(a, b, c, d, f) {
  this.m = a;
  this.start = b;
  this.end = c;
  this.step = d;
  this.p = f;
  this.B = 0;
  this.o = 32375006
}
o = sf.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Jb(a)
};
o.Da = function() {
  return 0 < this.step ? this.start + this.step < this.end ? new sf(this.m, this.start + this.step, this.end, this.step, k) : k : this.start + this.step > this.end ? new sf(this.m, this.start + this.step, this.end, this.step, k) : k
};
o.M = function(a, b) {
  return J(b, a)
};
o.toString = function() {
  return L.j(D([this], 0))
};
o.va = function(a, b) {
  return Hb.g(a, b)
};
o.wa = function(a, b, c) {
  return Hb.h(a, b, c)
};
o.F = function(a) {
  return 0 < this.step ? this.start < this.end ? a : k : this.start > this.end ? a : k
};
o.K = function(a) {
  return Pb(a.F(a)) ? 0 : Math.ceil((this.end - this.start) / this.step)
};
o.ba = n("start");
o.Y = function(a) {
  return a.F(a) != k ? new sf(this.m, this.start + this.step, this.end, this.step, k) : K
};
o.D = function(a, b) {
  return Mb(a, b)
};
o.O = function(a, b) {
  return new sf(b, this.start, this.end, this.step, this.p)
};
o.N = n("m");
o.aa = function(a, b) {
  if(b < a.K(a)) {
    return this.start + b * this.step
  }
  var c = this.start > this.end;
  if(c ? 0 === this.step : c) {
    return this.start
  }
  e(Error("Index out of bounds"))
};
o.V = function(a, b, c) {
  c = b < a.K(a) ? this.start + b * this.step : ((a = this.start > this.end) ? 0 === this.step : a) ? this.start : c;
  return c
};
o.U = function() {
  return cb(K, this.m)
};
sf;
var tf = function() {
  function a(a, b, c) {
    return new sf(k, a, b, c, k)
  }
  function b(a, b) {
    return f.h(a, b, 1)
  }
  function c(a) {
    return f.h(0, a, 1)
  }
  function d() {
    return f.h(0, Number.MAX_VALUE, 1)
  }
  var f = k, f = function(f, i, j) {
    switch(arguments.length) {
      case 0:
        return d.call(this);
      case 1:
        return c.call(this, f);
      case 2:
        return b.call(this, f, i);
      case 3:
        return a.call(this, f, i, j)
    }
    e("Invalid arity: " + arguments.length)
  };
  f.S = d;
  f.k = c;
  f.g = b;
  f.h = a;
  return f
}();
function uf(a, b) {
  var c = a.exec(b);
  return H.g(F(c), b) ? 1 === N(c) ? F(c) : Qd(c) : k
}
function vf(a, b) {
  var c = a.exec(b);
  return c == k ? k : 1 === N(c) ? F(c) : Qd(c)
}
var xf = function wf(b, c) {
  var d = vf(b, c), f = c.search(b), h = ac(d) ? F(d) : d, i = zc.g(c, f + N(h));
  return s(d) ? new S(k, m, function() {
    return J(d, wf(b, i))
  }, k) : k
};
function yf(a) {
  var b = vf(/^(?:\(\?([idmsux]*)\))?(.*)/, a);
  P.h(b, 0, k);
  a = P.h(b, 1, k);
  b = P.h(b, 2, k);
  return RegExp(b, a)
}
function Y(a, b, c, d, f, h) {
  return Tc.j(U([b]), rd(qd(U([c]), hd.g(function(b) {
    return a.g ? a.g(b, f) : a.call(k, b, f)
  }, h))), D([U([d])], 0))
}
var Z = function zf(b, c) {
  return b == k ? Eb.k("nil") : aa === b ? Eb.k("#<undefined>") : Tc.g(s(function() {
    var d = A.h(c, "\ufdd0'meta", k);
    return s(d) ? (d = b ? ((d = b.o & 131072) ? d : b.hc) ? g : b.o ? m : u($a, b) : u($a, b), s(d) ? Xb(b) : d) : d
  }()) ? Tc.j(U(["^"]), zf(Xb(b), c), D([U([" "])], 0)) : k, function() {
    var c = b != k;
    return c ? b.Bc : c
  }() ? b.Ac(b) : function() {
    var c;
    c = b ? ((c = b.o & 536870912) ? c : b.R) ? g : b.o ? m : u(nb, b) : u(nb, b);
    return c
  }() ? ob(b, c) : s(b instanceof RegExp) ? Eb.h('#"', b.source, '"') : Eb.h("#<", "" + R(b), ">"))
};
function Af(a, b) {
  var c = new Da, d = M(Z(F(a), b));
  if(d) {
    for(var f = F(d);;) {
      if(c.append(f), f = E(d)) {
        d = f, f = F(d)
      }else {
        break
      }
    }
  }
  if(f = M(E(a))) {
    for(d = F(f);;) {
      c.append(" ");
      var h = M(Z(d, b));
      if(h) {
        for(d = F(h);;) {
          if(c.append(d), d = E(h)) {
            h = d, d = F(h)
          }else {
            break
          }
        }
      }
      if(f = E(f)) {
        d = f, f = F(d), h = d, d = f, f = h
      }else {
        break
      }
    }
  }
  return c
}
function Bf() {
  return ke(["\ufdd0'flush-on-newline", "\ufdd0'readably", "\ufdd0'meta", "\ufdd0'dup"], {"\ufdd0'flush-on-newline":g, "\ufdd0'readably":g, "\ufdd0'meta":m, "\ufdd0'dup":m})
}
var L = function() {
  function a(a) {
    var d = k;
    q(a) && (d = D(Array.prototype.slice.call(arguments, 0), 0));
    return b.call(this, d)
  }
  function b(a) {
    return"" + R(Af(a, Bf()))
  }
  a.v = 0;
  a.q = function(a) {
    a = M(a);
    return b(a)
  };
  a.j = b;
  return a
}(), Cf = function() {
  function a(a) {
    var d = k;
    q(a) && (d = D(Array.prototype.slice.call(arguments, 0), 0));
    return b.call(this, d)
  }
  function b(a) {
    var b = Ub.h(Bf(), "\ufdd0'readably", m);
    return"" + R(Af(a, b))
  }
  a.v = 0;
  a.q = function(a) {
    a = M(a);
    return b(a)
  };
  a.j = b;
  return a
}();
le.prototype.R = g;
le.prototype.L = function(a, b) {
  return Y(function(a) {
    return Y(Z, "", " ", "", b, a)
  }, "{", ", ", "}", b, a)
};
nb.number = g;
ob.number = function(a) {
  return Eb.k("" + R(a))
};
Ib.prototype.R = g;
Ib.prototype.L = function(a, b) {
  return Y(Z, "(", " ", ")", b, a)
};
Sd.prototype.R = g;
Sd.prototype.L = function(a, b) {
  return Y(Z, "[", " ", "]", b, a)
};
Nc.prototype.R = g;
Nc.prototype.L = function(a, b) {
  return Y(Z, "(", " ", ")", b, a)
};
Ye.prototype.R = g;
Ye.prototype.L = function(a, b) {
  return Y(function(a) {
    return Y(Z, "", " ", "", b, a)
  }, "{", ", ", "}", b, a)
};
oe.prototype.R = g;
oe.prototype.L = function(a, b) {
  return Y(function(a) {
    return Y(Z, "", " ", "", b, a)
  }, "{", ", ", "}", b, a)
};
Xd.prototype.R = g;
Xd.prototype.L = function(a, b) {
  return Y(Z, "#queue [", " ", "]", b, M(a))
};
S.prototype.R = g;
S.prototype.L = function(a, b) {
  return Y(Z, "(", " ", ")", b, a)
};
Kb.prototype.R = g;
Kb.prototype.L = function(a, b) {
  return Y(Z, "(", " ", ")", b, a)
};
jf.prototype.R = g;
jf.prototype.L = function(a, b) {
  return Y(Z, "#{", " ", "}", b, a)
};
nb["boolean"] = g;
ob["boolean"] = function(a) {
  return Eb.k("" + R(a))
};
nb.string = g;
ob.string = function(a, b) {
  return lc(a) ? Eb.k([R(":"), R(function() {
    var b = of(a);
    return s(b) ? [R(b), R("/")].join("") : k
  }()), R(nf(a))].join("")) : mc(a) ? Eb.k([R(function() {
    var b = of(a);
    return s(b) ? [R(b), R("/")].join("") : k
  }()), R(nf(a))].join("")) : Eb.k(s((new Ic("\ufdd0'readably")).call(k, b)) ? ka(a) : a)
};
Fe.prototype.R = g;
Fe.prototype.L = function(a, b) {
  return Y(Z, "(", " ", ")", b, a)
};
W.prototype.R = g;
W.prototype.L = function(a, b) {
  return Y(Z, "[", " ", "]", b, a)
};
Rd.prototype.R = g;
Rd.prototype.L = function(a, b) {
  return Y(Z, "(", " ", ")", b, a)
};
He.prototype.R = g;
He.prototype.L = function(a, b) {
  return Y(function(a) {
    return Y(Z, "", " ", "", b, a)
  }, "{", ", ", "}", b, a)
};
Bd.prototype.R = g;
Bd.prototype.L = function(a, b) {
  return Y(Z, "[", " ", "]", b, a)
};
ef.prototype.R = g;
ef.prototype.L = function(a, b) {
  return Y(Z, "#{", " ", "}", b, a)
};
Ld.prototype.R = g;
Ld.prototype.L = function(a, b) {
  return Y(Z, "[", " ", "]", b, a)
};
Ec.prototype.R = g;
Ec.prototype.L = function(a, b) {
  return Y(Z, "(", " ", ")", b, a)
};
nb.array = g;
ob.array = function(a, b) {
  return Y(Z, "#<Array [", ", ", "]>", b, a)
};
nb["function"] = g;
ob["function"] = function(a) {
  return Eb.h("#<", "" + R(a), ">")
};
Fc.prototype.R = g;
Fc.prototype.L = function() {
  return Eb.k("()")
};
X.prototype.R = g;
X.prototype.L = function(a, b) {
  return Y(Z, "[", " ", "]", b, a)
};
Date.prototype.R = g;
Date.prototype.L = function(a) {
  function b(a, b) {
    for(var f = "" + R(a);;) {
      if(N(f) < b) {
        f = [R("0"), R(f)].join("")
      }else {
        return f
      }
    }
  }
  return Eb.k([R('#inst "'), R(a.getUTCFullYear()), R("-"), R(b.g ? b.g(a.getUTCMonth() + 1, 2) : b.call(k, a.getUTCMonth() + 1, 2)), R("-"), R(b.g ? b.g(a.getUTCDate(), 2) : b.call(k, a.getUTCDate(), 2)), R("T"), R(b.g ? b.g(a.getUTCHours(), 2) : b.call(k, a.getUTCHours(), 2)), R(":"), R(b.g ? b.g(a.getUTCMinutes(), 2) : b.call(k, a.getUTCMinutes(), 2)), R(":"), R(b.g ? b.g(a.getUTCSeconds(), 2) : b.call(k, a.getUTCSeconds(), 2)), R("."), R(b.g ? b.g(a.getUTCMilliseconds(), 3) : b.call(k, a.getUTCMilliseconds(), 
  3)), R("-"), R('00:00"')].join(""))
};
Hc.prototype.R = g;
Hc.prototype.L = function(a, b) {
  return Y(Z, "(", " ", ")", b, a)
};
sf.prototype.R = g;
sf.prototype.L = function(a, b) {
  return Y(Z, "(", " ", ")", b, a)
};
Ge.prototype.R = g;
Ge.prototype.L = function(a, b) {
  return Y(Z, "(", " ", ")", b, a)
};
he.prototype.R = g;
he.prototype.L = function(a, b) {
  return Y(function(a) {
    return Y(Z, "", " ", "", b, a)
  }, "{", ", ", "}", b, a)
};
Le.prototype.R = g;
Le.prototype.L = function(a, b) {
  return Y(Z, "(", " ", ")", b, a)
};
Ld.prototype.fc = g;
Ld.prototype.Xb = function(a, b) {
  return pc.g(a, b)
};
function Df(a, b, c, d) {
  this.state = a;
  this.m = b;
  this.nc = c;
  this.W = d;
  this.B = 0;
  this.o = 2690809856
}
o = Df.prototype;
o.I = function(a) {
  return a[ga] || (a[ga] = ++ha)
};
o.nb = function(a, b, c) {
  var d = M(this.W);
  if(d) {
    var f = F(d);
    P.h(f, 0, k);
    for(P.h(f, 1, k);;) {
      var h = f, f = P.h(h, 0, k), h = P.h(h, 1, k);
      h.w ? h.w(f, a, b, c) : h.call(k, f, a, b, c);
      if(d = E(d)) {
        f = d, d = F(f), h = f, f = d, d = h
      }else {
        return k
      }
    }
  }else {
    return k
  }
};
o.ub = function(a, b, c) {
  return a.W = Ub.h(this.W, b, c)
};
o.vb = function(a, b) {
  return a.W = Vb.g(this.W, b)
};
o.L = function(a, b) {
  return Tc.j(U(["#<Atom: "]), ob(this.state, b), D([">"], 0))
};
o.N = n("m");
o.Pa = n("state");
o.D = function(a, b) {
  return a === b
};
Df;
var Ef = function() {
  function a(a) {
    return new Df(a, k, k, k)
  }
  var b = k, c = function() {
    function a(c, d) {
      var j = k;
      q(d) && (j = D(Array.prototype.slice.call(arguments, 1), 0));
      return b.call(this, c, j)
    }
    function b(a, c) {
      var d = ic(c) ? T.g(Db, c) : c, f = A.h(d, "\ufdd0'validator", k), d = A.h(d, "\ufdd0'meta", k);
      return new Df(a, d, f, k)
    }
    a.v = 1;
    a.q = function(a) {
      var c = F(a), a = G(a);
      return b(c, a)
    };
    a.j = b;
    return a
  }(), b = function(b, f) {
    switch(arguments.length) {
      case 1:
        return a.call(this, b);
      default:
        return c.j(b, D(arguments, 1))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.v = 1;
  b.q = c.q;
  b.k = a;
  b.j = c.j;
  return b
}();
function Ff(a, b) {
  var c = a.nc;
  s(c) && !s(c.k ? c.k(b) : c.call(k, b)) && e(Error([R("Assert failed: "), R("Validator rejected reference state"), R("\n"), R(L.j(D([Wb(Eb("\ufdd1'validate", "\ufdd1'new-value"), Db("\ufdd0'line", 6440))], 0)))].join("")));
  c = a.state;
  a.state = b;
  pb(a, c, b);
  return b
}
var Gf = function() {
  function a(a, b, c, d, f) {
    return Ff(a, b.w ? b.w(a.state, c, d, f) : b.call(k, a.state, c, d, f))
  }
  function b(a, b, c, d) {
    return Ff(a, b.h ? b.h(a.state, c, d) : b.call(k, a.state, c, d))
  }
  function c(a, b, c) {
    return Ff(a, b.g ? b.g(a.state, c) : b.call(k, a.state, c))
  }
  function d(a, b) {
    return Ff(a, b.k ? b.k(a.state) : b.call(k, a.state))
  }
  var f = k, h = function() {
    function a(c, d, f, h, i, Q) {
      var O = k;
      q(Q) && (O = D(Array.prototype.slice.call(arguments, 5), 0));
      return b.call(this, c, d, f, h, i, O)
    }
    function b(a, c, d, f, h, i) {
      return Ff(a, T.j(c, a.state, d, f, h, D([i], 0)))
    }
    a.v = 5;
    a.q = function(a) {
      var c = F(a), d = F(E(a)), f = F(E(E(a))), h = F(E(E(E(a)))), i = F(E(E(E(E(a))))), a = G(E(E(E(E(a)))));
      return b(c, d, f, h, i, a)
    };
    a.j = b;
    return a
  }(), f = function(f, j, l, r, t, x) {
    switch(arguments.length) {
      case 2:
        return d.call(this, f, j);
      case 3:
        return c.call(this, f, j, l);
      case 4:
        return b.call(this, f, j, l, r);
      case 5:
        return a.call(this, f, j, l, r, t);
      default:
        return h.j(f, j, l, r, t, D(arguments, 5))
    }
    e("Invalid arity: " + arguments.length)
  };
  f.v = 5;
  f.q = h.q;
  f.g = d;
  f.h = c;
  f.w = b;
  f.ca = a;
  f.j = h.j;
  return f
}();
function Hf(a, b) {
  this.state = a;
  this.f = b;
  this.B = 0;
  this.o = 1073774592
}
Hf.prototype.Pa = function() {
  var a = this;
  return(new Ic("\ufdd0'value")).call(k, Gf.g(a.state, function(b) {
    var b = ic(b) ? T.g(Db, b) : b, c = A.h(b, "\ufdd0'done", k);
    return s(c) ? b : ke(["\ufdd0'done", "\ufdd0'value"], {"\ufdd0'done":g, "\ufdd0'value":a.f.S ? a.f.S() : a.f.call(k)})
  }))
};
Hf;
var If = Ef.k(ke(["\ufdd0'parents", "\ufdd0'descendants", "\ufdd0'ancestors"], {"\ufdd0'parents":je, "\ufdd0'descendants":je, "\ufdd0'ancestors":je})), Jf = function() {
  function a(a, b, h) {
    var i = H.g(b, h);
    if(!i && !(i = nc((new Ic("\ufdd0'ancestors")).call(k, a).call(k, b), h)) && (i = dc(h))) {
      if(i = dc(b)) {
        if(i = N(h) === N(b)) {
          for(var i = g, j = 0;;) {
            var l = Pb(i);
            if(l ? l : j === N(h)) {
              return i
            }
            i = c.h(a, b.k ? b.k(j) : b.call(k, j), h.k ? h.k(j) : h.call(k, j));
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
    return c.h(B(If), a, b)
  }
  var c = k, c = function(c, f, h) {
    switch(arguments.length) {
      case 2:
        return b.call(this, c, f);
      case 3:
        return a.call(this, c, f, h)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.g = b;
  c.h = a;
  return c
}(), Kf = function() {
  function a(a, b) {
    return $c(A.h((new Ic("\ufdd0'parents")).call(k, a), b, k))
  }
  function b(a) {
    return c.g(B(If), a)
  }
  var c = k, c = function(c, f) {
    switch(arguments.length) {
      case 1:
        return b.call(this, c);
      case 2:
        return a.call(this, c, f)
    }
    e("Invalid arity: " + arguments.length)
  };
  c.k = b;
  c.g = a;
  return c
}();
function Lf(a, b, c, d) {
  Gf.g(a, function() {
    return B(b)
  });
  Gf.g(c, function() {
    return B(d)
  })
}
var Nf = function Mf(b, c, d) {
  var f = B(d).call(k, b), f = s(s(f) ? f.k ? f.k(c) : f.call(k, c) : f) ? g : k;
  if(s(f)) {
    return f
  }
  f = function() {
    for(var f = Kf.k(c);;) {
      if(0 < N(f)) {
        Mf(b, F(f), d), f = G(f)
      }else {
        return k
      }
    }
  }();
  if(s(f)) {
    return f
  }
  f = function() {
    for(var f = Kf.k(b);;) {
      if(0 < N(f)) {
        Mf(F(f), c, d), f = G(f)
      }else {
        return k
      }
    }
  }();
  return s(f) ? f : m
};
function Of(a, b, c) {
  c = Nf(a, b, c);
  return s(c) ? c : Jf.g(a, b)
}
var Qf = function Pf(b, c, d, f, h, i, j) {
  var l = tc.h(function(d, f) {
    var i = P.h(f, 0, k);
    P.h(f, 1, k);
    if(Jf.g(c, i)) {
      var j;
      j = (j = d == k) ? j : Of(i, F(d), h);
      j = s(j) ? f : d;
      s(Of(F(j), i, h)) || e(Error([R("Multiple methods in multimethod '"), R(b), R("' match dispatch value: "), R(c), R(" -> "), R(i), R(" and "), R(F(j)), R(", and neither is preferred")].join("")));
      return j
    }
    return d
  }, k, B(f));
  if(s(l)) {
    if(H.g(B(j), B(d))) {
      return Gf.w(i, Ub, c, Ob(l)), Ob(l)
    }
    Lf(i, f, j, d);
    return Pf(b, c, d, f, h, i, j)
  }
  return k
};
function Rf(a, b) {
  if(a ? a.$b : a) {
    return a.$b(0, b)
  }
  var c;
  var d = Rf[p(a == k ? k : a)];
  d ? c = d : (d = Rf._) ? c = d : e(v("IMultiFn.-get-method", a));
  return c.call(k, a, b)
}
function Sf(a, b) {
  if(a ? a.Zb : a) {
    return a.Zb(a, b)
  }
  var c;
  var d = Sf[p(a == k ? k : a)];
  d ? c = d : (d = Sf._) ? c = d : e(v("IMultiFn.-dispatch", a));
  return c.call(k, a, b)
}
function Tf(a, b, c, d, f, h, i, j) {
  this.name = a;
  this.lc = b;
  this.kc = c;
  this.Jb = d;
  this.Mb = f;
  this.mc = h;
  this.Lb = i;
  this.qb = j;
  this.o = 4194304;
  this.B = 64
}
Tf.prototype.I = function(a) {
  return a[ga] || (a[ga] = ++ha)
};
Tf.prototype.$b = function(a, b) {
  H.g(B(this.qb), B(this.Jb)) || Lf(this.Lb, this.Mb, this.qb, this.Jb);
  var c = B(this.Lb).call(k, b);
  if(s(c)) {
    return c
  }
  c = Qf(this.name, b, this.Jb, this.Mb, this.mc, this.Lb, this.qb);
  return s(c) ? c : B(this.Mb).call(k, this.kc)
};
Tf.prototype.Zb = function(a, b) {
  var c = T.g(this.lc, b), d = Rf(a, c);
  s(d) || e(Error([R("No method in multimethod '"), R(nf), R("' for dispatch value: "), R(c)].join("")));
  return T.g(d, b)
};
Tf;
Tf.prototype.call = function() {
  function a(a, b) {
    var f = k;
    q(b) && (f = D(Array.prototype.slice.call(arguments, 1), 0));
    return Sf(this, f)
  }
  function b(a, b) {
    return Sf(this, b)
  }
  a.v = 1;
  a.q = function(a) {
    F(a);
    a = G(a);
    return b(0, a)
  };
  a.j = b;
  return a
}();
Tf.prototype.apply = function(a, b) {
  return Sf(this, b)
};
function Uf(a) {
  this.Ob = a;
  this.B = 0;
  this.o = 543162368
}
Uf.prototype.I = function(a) {
  return pa(L.j(D([a], 0)))
};
Uf.prototype.L = function() {
  return Eb.k([R('#uuid "'), R(this.Ob), R('"')].join(""))
};
Uf.prototype.D = function(a, b) {
  var c = I(Uf, b);
  return c ? this.Ob === b.Ob : c
};
Uf.prototype.toString = function() {
  return L.j(D([this], 0))
};
Uf;
var Vf;
function Wf(a) {
  var b = Vf;
  try {
    Vf = Ef.j(gf, D(["\ufdd0'meta", ke(["\ufdd0'no-deref-monitor"], {"\ufdd0'no-deref-monitor":g})], 0));
    var c = a.S ? a.S() : a.call(k);
    return ke(["\ufdd0'res", "\ufdd0'derefed"], {"\ufdd0'res":c, "\ufdd0'derefed":B(Vf)})
  }finally {
    Vf = b
  }
}
function Xf(a) {
  s(function() {
    var b = Vf;
    return s(b) ? Pb((new Ic("\ufdd0'no-deref-monitor")).call(k, Xb(a))) : b
  }()) && Gf.g(Vf, function(b) {
    return Qb.g(b, a)
  })
}
Df.prototype.Pa = function(a) {
  Xf(a);
  return a.state
};
function Yf(a, b, c, d, f, h, i, j) {
  this.state = a;
  this.da = b;
  this.f = c;
  this.key = d;
  this.ga = f;
  this.W = h;
  this.P = i;
  this.H = j;
  this.B = 0;
  this.o = 2766571274;
  6 < arguments.length ? (this.P = i, this.H = j) : this.H = this.P = k
}
o = Yf.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Cc(a)
};
o.J = function(a, b) {
  return a.A(a, b, k)
};
o.A = function(a, b, c) {
  return"\ufdd0'state" === b ? this.state : "\ufdd0'dirty?" === b ? this.da : "\ufdd0'f" === b ? this.f : "\ufdd0'key" === b ? this.key : "\ufdd0'parent-watchables" === b ? this.ga : "\ufdd0'watches" === b ? this.W : A.h(this.H, b, c)
};
o.T = function(a, b, c) {
  return(C.g ? C.g("\ufdd0'state", b) : C.call(k, "\ufdd0'state", b)) ? new Yf(c, this.da, this.f, this.key, this.ga, this.W, this.P, this.H, k) : (C.g ? C.g("\ufdd0'dirty?", b) : C.call(k, "\ufdd0'dirty?", b)) ? new Yf(this.state, c, this.f, this.key, this.ga, this.W, this.P, this.H, k) : (C.g ? C.g("\ufdd0'f", b) : C.call(k, "\ufdd0'f", b)) ? new Yf(this.state, this.da, c, this.key, this.ga, this.W, this.P, this.H, k) : (C.g ? C.g("\ufdd0'key", b) : C.call(k, "\ufdd0'key", b)) ? new Yf(this.state, 
  this.da, this.f, c, this.ga, this.W, this.P, this.H, k) : (C.g ? C.g("\ufdd0'parent-watchables", b) : C.call(k, "\ufdd0'parent-watchables", b)) ? new Yf(this.state, this.da, this.f, this.key, c, this.W, this.P, this.H, k) : (C.g ? C.g("\ufdd0'watches", b) : C.call(k, "\ufdd0'watches", b)) ? new Yf(this.state, this.da, this.f, this.key, this.ga, c, this.P, this.H, k) : new Yf(this.state, this.da, this.f, this.key, this.ga, this.W, this.P, Ub.h(this.H, b, c), k)
};
o.Pa = function(a) {
  Xf(a);
  if(Pb(this.da)) {
    return a.state
  }
  var b = Wf(this.f), b = ic(b) ? T.g(Db, b) : b, c = A.h(b, "\ufdd0'derefed", k), b = A.h(b, "\ufdd0'res", k), d = M(this.ga);
  if(d) {
    for(var f = F(d);;) {
      if(rb(f, this.key), f = E(d)) {
        d = f, f = F(d)
      }else {
        break
      }
    }
  }
  a.ga = c;
  if(f = M(c)) {
    for(c = F(f);;) {
      if(qb(c, this.key, function() {
        return function() {
          a.da = g;
          return a.nb(a, k, k)
        }
      }(c, f)), c = E(f)) {
        f = c, c = F(f)
      }else {
        break
      }
    }
  }
  a.state = b;
  a.da = m;
  return b
};
o.M = function(a, b) {
  return dc(b) ? a.T(a, w.g(b, 0), w.g(b, 1)) : tc.h(Ia, a, b)
};
o.nb = function() {
  var a = M(this.W);
  if(a) {
    var b = F(a);
    P.h(b, 0, k);
    for(P.h(b, 1, k);;) {
      if(P.h(b, 0, k), b = P.h(b, 1, k), b.S ? b.S() : b.call(k), b = E(a)) {
        a = b, b = F(a)
      }else {
        return k
      }
    }
  }else {
    return k
  }
};
o.ub = function(a, b, c) {
  return a.W = Ub.h(this.W, b, c)
};
o.vb = function(a, b) {
  return a.W = Vb.g(this.W, b)
};
o.F = function() {
  return M(Tc.g(U([V.j(D(["\ufdd0'state", this.state], 0)), V.j(D(["\ufdd0'dirty?", this.da], 0)), V.j(D(["\ufdd0'f", this.f], 0)), V.j(D(["\ufdd0'key", this.key], 0)), V.j(D(["\ufdd0'parent-watchables", this.ga], 0)), V.j(D(["\ufdd0'watches", this.W], 0))]), this.H))
};
o.L = function(a, b) {
  return Y(function(a) {
    return Y(Z, "", " ", "", b, a)
  }, [R("#"), R("ComputedObservable"), R("{")].join(""), ", ", "}", b, Tc.g(U([V.j(D(["\ufdd0'state", this.state], 0)), V.j(D(["\ufdd0'dirty?", this.da], 0)), V.j(D(["\ufdd0'f", this.f], 0)), V.j(D(["\ufdd0'key", this.key], 0)), V.j(D(["\ufdd0'parent-watchables", this.ga], 0)), V.j(D(["\ufdd0'watches", this.W], 0))]), this.H))
};
o.K = function() {
  return 6 + N(this.H)
};
o.D = function(a, b) {
  var c;
  c = s(b) ? (c = a.constructor === b.constructor) ? ae(a, b) : c : b;
  return s(c) ? g : m
};
o.O = function(a, b) {
  return new Yf(this.state, this.da, this.f, this.key, this.ga, this.W, b, this.H, this.p)
};
o.N = n("P");
o.Ca = function(a, b) {
  return nc(hf("\ufdd0'dirty? \ufdd0'state \ufdd0'key \ufdd0'f \ufdd0'watches \ufdd0'parent-watchables".split(" ")), b) ? Vb.g(Wb(vd(je, a), this.P), b) : new Yf(this.state, this.da, this.f, this.key, this.ga, this.W, this.P, $c(Vb.g(this.H, b)), k)
};
Yf;
Yf.prototype.I = function(a) {
  return a.key
};
function Zf(a, b, c, d, f, h, i, j, l) {
  this.data = a;
  this.na = b;
  this.ma = c;
  this.ia = d;
  this.update = f;
  this.ja = h;
  this.ka = i;
  this.P = j;
  this.H = l;
  this.B = 0;
  this.o = 619054858;
  7 < arguments.length ? (this.P = j, this.H = l) : this.H = this.P = k
}
o = Zf.prototype;
o.I = function(a) {
  var b = this.p;
  return b != k ? b : this.p = a = Cc(a)
};
o.J = function(a, b) {
  return a.A(a, b, k)
};
o.A = function(a, b, c) {
  return"\ufdd0'data" === b ? this.data : "\ufdd0'mapping" === b ? this.na : "\ufdd0'key-fn" === b ? this.ma : "\ufdd0'enter" === b ? this.ia : "\ufdd0'update" === b ? this.update : "\ufdd0'exit" === b ? this.ja : "\ufdd0'force-update?" === b ? this.ka : A.h(this.H, b, c)
};
o.T = function(a, b, c) {
  return(C.g ? C.g("\ufdd0'data", b) : C.call(k, "\ufdd0'data", b)) ? new Zf(c, this.na, this.ma, this.ia, this.update, this.ja, this.ka, this.P, this.H, k) : (C.g ? C.g("\ufdd0'mapping", b) : C.call(k, "\ufdd0'mapping", b)) ? new Zf(this.data, c, this.ma, this.ia, this.update, this.ja, this.ka, this.P, this.H, k) : (C.g ? C.g("\ufdd0'key-fn", b) : C.call(k, "\ufdd0'key-fn", b)) ? new Zf(this.data, this.na, c, this.ia, this.update, this.ja, this.ka, this.P, this.H, k) : (C.g ? C.g("\ufdd0'enter", 
  b) : C.call(k, "\ufdd0'enter", b)) ? new Zf(this.data, this.na, this.ma, c, this.update, this.ja, this.ka, this.P, this.H, k) : (C.g ? C.g("\ufdd0'update", b) : C.call(k, "\ufdd0'update", b)) ? new Zf(this.data, this.na, this.ma, this.ia, c, this.ja, this.ka, this.P, this.H, k) : (C.g ? C.g("\ufdd0'exit", b) : C.call(k, "\ufdd0'exit", b)) ? new Zf(this.data, this.na, this.ma, this.ia, this.update, c, this.ka, this.P, this.H, k) : (C.g ? C.g("\ufdd0'force-update?", b) : C.call(k, "\ufdd0'force-update?", 
  b)) ? new Zf(this.data, this.na, this.ma, this.ia, this.update, this.ja, c, this.P, this.H, k) : new Zf(this.data, this.na, this.ma, this.ia, this.update, this.ja, this.ka, this.P, Ub.h(this.H, b, c), k)
};
o.M = function(a, b) {
  return dc(b) ? a.T(a, w.g(b, 0), w.g(b, 1)) : tc.h(Ia, a, b)
};
o.F = function() {
  return M(Tc.g(U([V.j(D(["\ufdd0'data", this.data], 0)), V.j(D(["\ufdd0'mapping", this.na], 0)), V.j(D(["\ufdd0'key-fn", this.ma], 0)), V.j(D(["\ufdd0'enter", this.ia], 0)), V.j(D(["\ufdd0'update", this.update], 0)), V.j(D(["\ufdd0'exit", this.ja], 0)), V.j(D(["\ufdd0'force-update?", this.ka], 0))]), this.H))
};
o.L = function(a, b) {
  return Y(function(a) {
    return Y(Z, "", " ", "", b, a)
  }, [R("#"), R("Unify"), R("{")].join(""), ", ", "}", b, Tc.g(U([V.j(D(["\ufdd0'data", this.data], 0)), V.j(D(["\ufdd0'mapping", this.na], 0)), V.j(D(["\ufdd0'key-fn", this.ma], 0)), V.j(D(["\ufdd0'enter", this.ia], 0)), V.j(D(["\ufdd0'update", this.update], 0)), V.j(D(["\ufdd0'exit", this.ja], 0)), V.j(D(["\ufdd0'force-update?", this.ka], 0))]), this.H))
};
o.K = function() {
  return 7 + N(this.H)
};
o.D = function(a, b) {
  var c;
  c = s(b) ? (c = a.constructor === b.constructor) ? ae(a, b) : c : b;
  return s(c) ? g : m
};
o.O = function(a, b) {
  return new Zf(this.data, this.na, this.ma, this.ia, this.update, this.ja, this.ka, b, this.H, this.p)
};
o.N = n("P");
o.Ca = function(a, b) {
  return nc(hf("\ufdd0'data \ufdd0'force-update? \ufdd0'enter \ufdd0'exit \ufdd0'key-fn \ufdd0'update \ufdd0'mapping".split(" ")), b) ? Vb.g(Wb(vd(je, a), this.P), b) : new Zf(this.data, this.na, this.ma, this.ia, this.update, this.ja, this.ka, this.P, $c(Vb.g(this.H, b)), k)
};
Zf;
function $f() {
  return da.navigator ? da.navigator.userAgent : k
}
Ba = Aa = ya = xa = m;
var ag;
if(ag = $f()) {
  var bg = da.navigator;
  xa = 0 == ag.indexOf("Opera");
  ya = !xa && -1 != ag.indexOf("MSIE");
  Aa = !xa && -1 != ag.indexOf("WebKit");
  Ba = !xa && !Aa && "Gecko" == bg.product
}
var cg = ya, dg = Ba, eg = Aa, oa;
a: {
  var fg = "", gg;
  if(xa && da.opera) {
    var hg = da.opera.version, fg = "function" == typeof hg ? hg() : hg
  }else {
    if(dg ? gg = /rv\:([^\);]+)(\)|;)/ : cg ? gg = /MSIE\s+([^\);]+)(\)|;)/ : eg && (gg = /WebKit\/(\S+)/), gg) {
      var ig = gg.exec($f()), fg = ig ? ig[1] : ""
    }
  }
  if(cg) {
    var jg, kg = da.document;
    jg = kg ? kg.documentMode : aa;
    if(jg > parseFloat(fg)) {
      oa = "" + jg;
      break a
    }
  }
  oa = fg
}
var lg = {}, mg = {};
function ng() {
  return mg[9] || (mg[9] = cg && document.documentMode && 9 <= document.documentMode)
}
;!cg || ng();
!dg && !cg || cg && ng() || dg && (lg["1.9.1"] || (lg["1.9.1"] = 0 <= na("1.9.1")));
cg && !lg["9"] && (lg["9"] = 0 <= na("9"));
NodeList.prototype.F = function(a) {
  return D.g(a, 0)
};
HTMLCollection.prototype.F = function(a) {
  return D.g(a, 0)
};
Node.prototype.I = ba();
var og = Math.PI, pg = 2 * og;
function qg(a) {
  return Math.sin.k ? Math.sin.k(a) : Math.sin.call(k, a)
}
function rg(a) {
  return Math.cos.k ? Math.cos.k(a) : Math.cos.call(k, a)
}
;var sg = pg - 1.0E-7, tg = function() {
  function a(a) {
    var d = k;
    q(a) && (d = D(Array.prototype.slice.call(arguments, 0), 0));
    return b.call(this, d)
  }
  function b(a) {
    var b = ic(a) ? T.g(Db, a) : a, f = A.h(b, "\ufdd0'angle-offset", 0), h = A.h(b, "\ufdd0'end-angle", og), i = A.h(b, "\ufdd0'start-angle", 0), a = A.h(b, "\ufdd0'outer-radius", 1), b = A.h(b, "\ufdd0'inner-radius", 0), f = sc.k(U([f + i, f + h])), j = P.h(f, 0, k), l = P.h(f, 1, k), f = l - j, h = f < og ? "0" : "1", i = qg(j), j = rg(j), r = qg(l), l = rg(l);
    return f >= sg ? [R("M0,"), R(a), R("A"), R(a), R(","), R(a), R(" 0 1,1 0,"), R(-a), R("A"), R(a), R(","), R(a), R(" 0 1,1 0,"), R(a), R(Zc.g(0, b) ? [R("M0,"), R(b), R("A"), R(b), R(","), R(b), R(" 0 1,0 0,"), R(-b), R("A"), R(b), R(","), R(b), R(" 0 1,0 0,"), R(b)].join("") : k), R("Z")].join("") : [R("M"), R(a * j), R(","), R(a * i), R("A"), R(a), R(","), R(a), R(" 0 "), R(h), R(",1 "), R(a * l), R(","), R(a * r), R(Zc.g(0, b) ? [R("L"), R(b * l), R(","), R(b * r), R("A"), R(b), R(","), R(b), 
    R(" 0 "), R(h), R(",0 "), R(b * j), R(","), R(b * i)].join("") : "L0,0"), R("Z")].join("")
  }
  a.v = 0;
  a.q = function(a) {
    a = M(a);
    return b(a)
  };
  a.j = b;
  return a
}();
function ug(a, b) {
  var c = T.h(pf, a, b);
  return J(c, ud(dd(function(a) {
    return c === a
  }), b))
}
var vg = function() {
  function a(a, b) {
    return N(a) < N(b) ? tc.h(Qb, b, a) : tc.h(Qb, a, b)
  }
  var b = k, c = function() {
    function a(c, d, j) {
      var l = k;
      q(j) && (l = D(Array.prototype.slice.call(arguments, 2), 0));
      return b.call(this, c, d, l)
    }
    function b(a, c, d) {
      a = ug(N, Qb.j(d, c, D([a], 0)));
      return tc.h(vd, F(a), G(a))
    }
    a.v = 2;
    a.q = function(a) {
      var c = F(a), d = F(E(a)), a = G(E(a));
      return b(c, d, a)
    };
    a.j = b;
    return a
  }(), b = function(b, f, h) {
    switch(arguments.length) {
      case 0:
        return gf;
      case 1:
        return b;
      case 2:
        return a.call(this, b, f);
      default:
        return c.j(b, f, D(arguments, 2))
    }
    e("Invalid arity: " + arguments.length)
  };
  b.v = 2;
  b.q = c.q;
  b.S = function() {
    return gf
  };
  b.k = ba();
  b.g = a;
  b.j = c.j;
  return b
}();
function wg(a, b, c) {
  this.Ya = a;
  this.id = b;
  this.ec = c
}
wg;
function xg(a, b, c) {
  this.Ya = a;
  this.attributes = b;
  this.children = c
}
xg;
var yg = Ef.k(je), Ag = function zg(b) {
  if(s(b)) {
    var c = P.h(b, 0, k), d = xc(b);
    if(s(d)) {
      var b = P.h(d, 0, k), d = xc(d), f = kc(c);
      return(f ? kc(b) : f) ? zg(J([R(c), R(b)].join(""), d)) : J(c, zg(J(b, d)))
    }
  }
  return b
}, Cg = function Bg(b) {
  return sd.g(function(b) {
    if(dc(b)) {
      var d = P.h(b, 0, k), b = xc(b);
      var f = B(yg).call(k, d);
      if(!s(f)) {
        var h = uf(/^([^.^#]+)(#([^.]+))?(\..+)?/, d);
        P.h(h, 0, k);
        f = P.h(h, 1, k);
        P.h(h, 2, k);
        var i = P.h(h, 3, k), h = P.h(h, 4, k), f = new wg(Bc.k(f), s(i) ? Bc.k(i) : k, s(h) ? hd.g(Ob, xf(/\.([^.]+)/, h)) : k);
        Gf.w(yg, Ub, d, f)
      }
      d = f;
      i = d.ec;
      f = d.id;
      d = d.Ya;
      h = je;
      i = s(i) ? Ub.h(h, "\ufdd0'class", T.g(R, qd(" ", i))) : h;
      f = s(f) ? Ub.h(i, "\ufdd0'id", f) : i;
      i = P.h(b, 0, k);
      h = xc(b);
      f = cc(i) ? U([df.j(D([f, i], 0)), h]) : U([f, b]);
      b = P.h(f, 0, k);
      f = P.h(f, 1, k);
      b = new xg(d, b, Cg(f));
      b = U([b])
    }else {
      b = ((d = ac(b)) ? !kc(b) : d) ? Bg(b) : U([b])
    }
    return b
  }, Ag(b))
};
function Dg(a) {
  return T.g(R, qd(";", function() {
    var b = function d(a) {
      return new S(k, m, function() {
        for(;;) {
          if(M(a)) {
            var b = F(a), i = P.h(b, 0, k), j = P.h(b, 1, k);
            return J([R(nf(i)), R(":"), R(lc(j) ? nf(j) : s(function() {
              var a = fa(j);
              return a ? hf("\ufdd0'bottom \ufdd0'width \ufdd0'top \ufdd0'right \ufdd0'left \ufdd0'line-height \ufdd0'height".split(" ")).call(k, i) : a
            }()) ? [R(j.toFixed(3)), R("px")].join("") : j)].join(""), d(G(a)))
          }
          return k
        }
      }, k)
    };
    return b.k ? b.k(a) : b.call(k, a)
  }()))
}
function Eg(a, b) {
  return lc(b) ? nf(b) : H.g(a, "\ufdd0'data") ? Cf.j(D([b], 0)) : H.g(a, "\ufdd0'style") ? Dg(b) : b
}
function Fg(a) {
  return T.g(R, function() {
    var b = function d(a) {
      return new S(k, m, function() {
        for(;;) {
          if(M(a)) {
            var b = F(a), i = P.h(b, 0, k), b = P.h(b, 1, k);
            return J([R(" "), R(nf(i)), R('="'), R(Eg(i, b)), R('"')].join(""), d(G(a)))
          }
          return k
        }
      }, k)
    };
    return b.k ? b.k(a) : b.call(k, a)
  }())
}
var Hg = function Gg(b) {
  if(I(xg, b)) {
    var c = b.Ya, d = b.attributes, b = b.children;
    s(c) ? (d = s(d) ? Fg(d) : k, b = hd.g(Gg, b), c = s(hf(["\ufdd0'br"]).call(k, c)) ? [R("<"), R(nf(c)), R(d), R(">")].join("") : [R("<"), R(nf(c)), R(d), R(">"), R(T.g(R, b)), R("</"), R(nf(c)), R(">")].join("")) : c = "";
    return c
  }
  return"" + R(b)
}, Jg = function Ig(b, c, d) {
  return H.g(N(b), N(c)) ? (b = hd.h(V, b, c), ad(function(b) {
    var c = P.h(b, 0, k), b = P.h(b, 1, k), d = I(xg, c);
    return(d ? I(xg, b) : d) ? H.g(c.Ya, b.Ya) : H.g(c, b)
  }, b) ? T.g(Tc, gd(function(b, c) {
    var i = P.h(c, 0, k), j = P.h(c, 1, k);
    if(I(xg, i)) {
      var l = i.attributes, i = i.children, r = j.attributes, t = j.children, x = Qb.g(d, b), j = Zc.g(l, r) ? sd.g(function(b) {
        var c = l.k ? l.k(b) : l.call(k, b), d = r.k ? r.k(b) : r.call(k, b);
        return Pb(d) ? U([U(["\ufdd0'rem-att", x, b])]) : Zc.g(c, d) ? U([U(["\ufdd0'att", x, b, d])]) : Od
      }, vg.g(mf(bf(l)), mf(bf(r)))) : k, i = Ig(i, t, x);
      return Tc.g(j, i)
    }
    return k
  }, b)) : U([U(["\ufdd0'html", d, c])])) : U([U(["\ufdd0'html", d, c])])
}, Lg = function Kg(b) {
  var c = kc(b);
  if(c ? c : fa(b)) {
    return b
  }
  c = b.children;
  return Qd(Tc.g(U([b.Ya, b.attributes]), hd.g(Kg, c)))
};
function Mg(a) {
  return kd(3, Gc(function c(a) {
    return new S(k, m, function() {
      return s(a) ? J(N(rf(cd, od(function(a) {
        return a.previousSibling
      }, a))) - 1, c(a.parentNode)) : k
    }, k)
  }.call(k, a)))
}
function Ng(a, b) {
  var c = Mg(b), d;
  a: {
    for(d = a;;) {
      if(c = M(c)) {
        var f = c, c = P.h(f, 0, k), f = xc(f);
        d = P.g(d.children, c);
        c = f
      }else {
        break a
      }
    }
    d = aa
  }
  return Lg(d)
}
;function Og(a) {
  if(a ? a.ac : a) {
    return a.ac()
  }
  var b;
  var c = Og[p(a == k ? k : a)];
  c ? b = c : (c = Og._) ? b = c : e(v("PushbackReader.read-char", a));
  return b.call(k, a)
}
function Pg(a, b) {
  if(a ? a.bc : a) {
    return a.bc(0, b)
  }
  var c;
  var d = Pg[p(a == k ? k : a)];
  d ? c = d : (d = Pg._) ? c = d : e(v("PushbackReader.unread", a));
  return c.call(k, a, b)
}
function Qg(a, b, c) {
  this.ra = a;
  this.cc = b;
  this.jb = c
}
Qg.prototype.ac = function() {
  var a = B(this.jb);
  if(Pb(M(a))) {
    return a = B(this.cc), Gf.g(this.cc, Fb), this.ra[a]
  }
  a = B(this.jb);
  Gf.g(this.jb, G);
  return F(a)
};
Qg.prototype.bc = function(a, b) {
  return Gf.g(this.jb, function(a) {
    return J(b, a)
  })
};
Qg;
function Rg(a) {
  var b = !/[^\t\n\r ]/.test(a);
  return s(b) ? b : "," === a
}
function Sg(a) {
  return!/[^0-9]/.test(a)
}
function Tg(a, b) {
  var c = !/[^0-9]/.test(b);
  if(c) {
    return c
  }
  c = function() {
    var a = "+" === b;
    return a ? a : "-" === b
  }();
  return s(c) ? Sg(function() {
    var b = Og(a);
    Pg(a, b);
    return b
  }()) : c
}
var Ug = function() {
  function a(a, d) {
    var f = k;
    q(d) && (f = D(Array.prototype.slice.call(arguments, 1), 0));
    return b.call(this, 0, f)
  }
  function b(a, b) {
    e(Error(T.g(R, b)))
  }
  a.v = 1;
  a.q = function(a) {
    F(a);
    a = G(a);
    return b(0, a)
  };
  a.j = b;
  return a
}();
function Vg(a, b) {
  for(var c = new Da(b), d = Og(a);;) {
    var f;
    f = d == k;
    if(!f) {
      f = Rg(d);
      var h = aa;
      h = f ? f : (f = "#" !== d) ? (f = "'" !== d) ? (f = ":" !== d) ? Wg(d) : f : f : f;
      f = h
    }
    if(f) {
      return Pg(a, d), c.toString()
    }
    c.append(d);
    d = Og(a)
  }
}
var Xg = yf("([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+)|0[0-9]+)(N)?"), Yg = yf("([-+]?[0-9]+)/([0-9]+)"), Zg = yf("([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?"), $g = yf("[:]?([^0-9/].*/)?([^0-9/][^/]*)");
function ah(a, b) {
  var c = a.exec(b);
  return c == k ? k : 1 === c.length ? c[0] : c
}
function bh(a, b) {
  var c = a.exec(b), d = c != k;
  return(d ? c[0] === b : d) ? 1 === c.length ? c[0] : c : k
}
var ch = yf("[0-9A-Fa-f]{2}"), dh = yf("[0-9A-Fa-f]{4}");
function eh(a, b, c, d) {
  return s(uf(a, d)) ? d : Ug.j(b, D(["Unexpected unicode escape \\", c, d], 0))
}
function fh(a) {
  return String.fromCharCode(parseInt(a, 16))
}
function gh(a) {
  var b = Og(a), c = "t" === b ? "\t" : "r" === b ? "\r" : "n" === b ? "\n" : "\\" === b ? "\\" : '"' === b ? '"' : "b" === b ? "\u0008" : "f" === b ? "\u000c" : k;
  return s(c) ? c : "x" === b ? fh(eh(ch, a, b, (new Da(Og(a), Og(a))).toString())) : "u" === b ? fh(eh(dh, a, b, (new Da(Og(a), Og(a), Og(a), Og(a))).toString())) : !/[^0-9]/.test(b) ? String.fromCharCode(b) : Ug.j(a, D(["Unexpected unicode escape \\", b], 0))
}
function hh(a, b) {
  for(var c = tb(Od);;) {
    var d;
    a: {
      d = Rg;
      for(var f = b, h = Og(f);;) {
        if(s(d.k ? d.k(h) : d.call(k, h))) {
          h = Og(f)
        }else {
          d = h;
          break a
        }
      }
      d = aa
    }
    s(d) || Ug.j(b, D(["EOF"], 0));
    if(a === d) {
      return vb(c)
    }
    f = Wg(d);
    s(f) ? d = f.g ? f.g(b, d) : f.call(k, b, d) : (Pg(b, d), d = ih(b));
    c = d === b ? c : ub(c, d)
  }
}
function jh(a, b) {
  return Ug.j(a, D(["Reader for ", b, " not implemented yet"], 0))
}
function kh(a, b) {
  var c = Og(a), d = "{" === c ? lh : "<" === c ? mh() : '"' === c ? nh : "!" === c ? oh : "_" === c ? ph : k;
  if(s(d)) {
    return d.g ? d.g(a, b) : d.call(k, a, b)
  }
  var d = qh(a, c), f = A.h(B(rh), nf(d), k), d = s(f) ? f.k ? f.k(ih(a)) : f.call(k, ih(a)) : Ug.j(a, D(["Could not find tag parser for ", nf(d), " in ", L.j(D([bf(B(rh))], 0))], 0));
  return s(d) ? d : Ug.j(a, D(["No dispatch macro for ", c], 0))
}
function sh(a, b) {
  return Ug.j(a, D(["Unmached delimiter ", b], 0))
}
function th(a) {
  return T.g(Eb, hh(")", a))
}
function oh(a) {
  for(;;) {
    var b = Og(a);
    var c = "n" === b;
    b = c ? c : (c = "r" === b) ? c : b == k;
    if(b) {
      return a
    }
  }
}
function uh(a) {
  return hh("]", a)
}
function vh(a) {
  var b = hh("}", a);
  var c = N(b), d = fa(c);
  (d ? c == c.toFixed() : d) || e(Error([R("Argument must be an integer: "), R(c)].join("")));
  0 !== (c & 1) && Ug.j(a, D(["Map literal must contain an even number of forms"], 0));
  return T.g(Db, b)
}
function wh(a) {
  for(var b = new Da, c = Og(a);;) {
    if(c == k) {
      return Ug.j(a, D(["EOF while reading string"], 0))
    }
    if("\\" === c) {
      b.append(gh(a))
    }else {
      if('"' === c) {
        return b.toString()
      }
      b.append(c)
    }
    c = Og(a)
  }
}
function qh(a, b) {
  var c = Vg(a, b);
  if(s(-1 != c.indexOf("/"))) {
    c = Ac.g(zc.h(c, 0, c.indexOf("/")), zc.h(c, c.indexOf("/") + 1, c.length))
  }else {
    var d = Ac.k(c), c = "nil" === c ? k : "true" === c ? g : "false" === c ? m : d
  }
  return c
}
function xh(a) {
  var b = Vg(a, Og(a)), b = bh($g, b), c = b[0], d = b[1], f = b[2];
  return s(function() {
    var a;
    a = (a = aa !== d) ? ":/" === d.substring(d.length - 2, d.length) : a;
    return s(a) ? a : (a = ":" === f[f.length - 1]) ? a : -1 !== c.indexOf("::", 1)
  }()) ? Ug.j(a, D(["Invalid token: ", c], 0)) : function() {
    var a = d != k;
    return a ? 0 < d.length : a
  }() ? Bc.g(d.substring(0, d.indexOf("/")), f) : Bc.k(c)
}
function yh(a) {
  return function(b) {
    return Eb.g(a, ih(b))
  }
}
function mh() {
  return function(a) {
    return Ug.j(a, D(["Unreadable form"], 0))
  }
}
function zh(a) {
  var b;
  b = ih(a);
  if(mc(b)) {
    b = ke(["\ufdd0'tag"], {"\ufdd0'tag":b})
  }else {
    if(kc(b)) {
      b = ke(["\ufdd0'tag"], {"\ufdd0'tag":b})
    }else {
      if(lc(b)) {
        a: {
          b = [b];
          for(var c = [g], d = N(b), f = 0, h = tb(re);;) {
            if(f < d) {
              var i = f + 1, h = wb(h, b[f], c[f]), f = i
            }else {
              b = vb(h);
              break a
            }
          }
          b = aa
        }
      }
    }
  }
  cc(b) || Ug.j(a, D(["Metadata must be Symbol,Keyword,String or Map"], 0));
  d = (c = ih(a)) ? ((d = c.o & 262144) ? d : c.zc) ? g : c.o ? m : u(bb, c) : u(bb, c);
  return d ? Wb(c, df.j(D([Xb(c), b], 0))) : Ug.j(a, D(["Metadata can only be applied to IWithMetas"], 0))
}
function lh(a) {
  return mf(hh("}", a))
}
function nh(a) {
  return yf(wh(a))
}
function ph(a) {
  ih(a);
  return a
}
function Wg(a) {
  return'"' === a ? wh : ":" === a ? xh : ";" === a ? jh : "'" === a ? yh("\ufdd1'quote") : "@" === a ? yh("\ufdd1'deref") : "^" === a ? zh : "`" === a ? jh : "~" === a ? jh : "(" === a ? th : ")" === a ? sh : "[" === a ? uh : "]" === a ? sh : "{" === a ? vh : "}" === a ? sh : "\\" === a ? Og : "%" === a ? jh : "#" === a ? kh : k
}
function ih(a) {
  for(var b = g, c = k;;) {
    var d = Og(a);
    if(d == k) {
      return s(b) ? Ug.j(a, D(["EOF"], 0)) : c
    }
    if(!Rg(d)) {
      if(";" === d) {
        a = oh.g ? oh.g(a, d) : oh.call(k, a)
      }else {
        var f = Wg(d);
        if(s(f)) {
          f = f.g ? f.g(a, d) : f.call(k, a, d)
        }else {
          if(Tg(a, d)) {
            a: {
              for(var f = a, d = new Da(d), h = Og(f);;) {
                var i;
                i = h == k;
                i || (i = (i = Rg(h)) ? i : Wg(h));
                if(s(i)) {
                  Pg(f, h);
                  d = d.toString();
                  if(s(bh(Xg, d))) {
                    i = ah(Xg, d);
                    var h = i[2], j = h == k;
                    (j ? j : 1 > h.length) ? (h = "-" === i[1] ? -1 : 1, j = s(i[3]) ? [i[3], 10] : s(i[4]) ? [i[4], 16] : s(i[5]) ? [i[5], 8] : s(i[7]) ? [i[7], parseInt(i[7])] : [k, k], i = j[0], j = j[1], h = i == k ? k : h * parseInt(i, j)) : h = 0
                  }else {
                    s(bh(Yg, d)) ? (h = ah(Yg, d), h = parseInt(h[1]) / parseInt(h[2])) : h = s(bh(Zg, d)) ? parseFloat(d) : k
                  }
                  f = s(h) ? h : Ug.j(f, D(["Invalid number format [", d, "]"], 0));
                  break a
                }
                d.append(h);
                h = Og(f)
              }
              f = aa
            }
          }else {
            f = qh(a, d)
          }
        }
        if(f !== a) {
          return f
        }
      }
    }
  }
}
function Ah(a) {
  a = new Qg(a, Ef.k(0), Ef.k(k));
  return ih(a)
}
function Bh(a) {
  var b = 0 === a % 4;
  return s(b) ? (b = Pb(0 === a % 100), s(b) ? b : 0 === a % 400) : b
}
var Ch = function() {
  var a = U([k, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]), b = U([k, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
  return function(c, d) {
    return A.h(s(d) ? b : a, c, k)
  }
}(), Dh = function() {
  function a(a, b, f, h) {
    var i = a <= b;
    (i ? b <= f : i) || e(Error([R("Assert failed: "), R([R(h), R(" Failed:  "), R(a), R("<="), R(b), R("<="), R(f)].join("")), R("\n"), R(L.j(D([Wb(Eb("\ufdd1'<=", "\ufdd1'low", "\ufdd1'n", "\ufdd1'high"), Db("\ufdd0'line", 474))], 0)))].join("")));
    return b
  }
  var b = /(\d\d\d\d)(?:-(\d\d)(?:-(\d\d)(?:[T](\d\d)(?::(\d\d)(?::(\d\d)(?:[.](\d+))?)?)?)?)?)?(?:[Z]|([-+])(\d\d):(\d\d))?/;
  return function(c) {
    var d = hd.g(Qd, ld(uf(b, c)));
    if(s(d)) {
      var f = P.h(d, 0, k);
      P.h(f, 0, k);
      var c = P.h(f, 1, k), h = P.h(f, 2, k), i = P.h(f, 3, k), j = P.h(f, 4, k), l = P.h(f, 5, k), r = P.h(f, 6, k), f = P.h(f, 7, k), t = P.h(d, 1, k);
      P.h(t, 0, k);
      P.h(t, 1, k);
      P.h(t, 2, k);
      var x = hd.g(function(a) {
        return hd.g(function(a) {
          return parseInt(a, 10)
        }, a)
      }, hd.h(function(a, b) {
        return Ad(b, U([0]), a)
      }, U([ed(k), function(a) {
        return H.g(a, "-") ? "-1" : "1"
      }]), d)), y = P.h(x, 0, k);
      P.h(y, 0, k);
      var d = P.h(y, 1, k), t = P.h(y, 2, k), Q = P.h(y, 3, k), O = P.h(y, 4, k), $ = P.h(y, 5, k), la = P.h(y, 6, k), y = P.h(y, 7, k), ma = P.h(x, 1, k), x = P.h(ma, 0, k), za = P.h(ma, 1, k), ma = P.h(ma, 2, k);
      return U([Pb(c) ? 1970 : d, Pb(h) ? 1 : a.w ? a.w(1, t, 12, "timestamp month field must be in range 1..12") : a.call(k, 1, t, 12, "timestamp month field must be in range 1..12"), Pb(i) ? 1 : a.w ? a.w(1, Q, Ch.g ? Ch.g(t, Bh(d)) : Ch.call(k, t, Bh(d)), "timestamp day field must be in range 1..last day in month") : a.call(k, 1, Q, Ch.g ? Ch.g(t, Bh(d)) : Ch.call(k, t, Bh(d)), "timestamp day field must be in range 1..last day in month"), Pb(j) ? 0 : a.w ? a.w(0, O, 23, "timestamp hour field must be in range 0..23") : 
      a.call(k, 0, O, 23, "timestamp hour field must be in range 0..23"), Pb(l) ? 0 : a.w ? a.w(0, $, 59, "timestamp minute field must be in range 0..59") : a.call(k, 0, $, 59, "timestamp minute field must be in range 0..59"), Pb(r) ? 0 : a.w ? a.w(0, la, H.g($, 59) ? 60 : 59, "timestamp second field must be in range 0..60") : a.call(k, 0, la, H.g($, 59) ? 60 : 59, "timestamp second field must be in range 0..60"), Pb(f) ? 0 : a.w ? a.w(0, y, 999, "timestamp millisecond field must be in range 0..999") : 
      a.call(k, 0, y, 999, "timestamp millisecond field must be in range 0..999"), x * (60 * za + ma)])
    }
    return k
  }
}(), rh = Ef.k(ke(["inst", "uuid", "queue"], {inst:function(a) {
  var b;
  if(kc(a)) {
    if(b = Dh.k ? Dh.k(a) : Dh.call(k, a), s(b)) {
      var a = P.h(b, 0, k), c = P.h(b, 1, k), d = P.h(b, 2, k), f = P.h(b, 3, k), h = P.h(b, 4, k), i = P.h(b, 5, k), j = P.h(b, 6, k);
      b = P.h(b, 7, k);
      b = new Date(Date.UTC(a, c - 1, d, f, h, i, j) - 6E4 * b)
    }else {
      b = Ug.j(k, D([[R("Unrecognized date/time syntax: "), R(a)].join("")], 0))
    }
  }else {
    b = Ug.j(k, D(["Instance literal expects a string for its timestamp."], 0))
  }
  return b
}, uuid:function(a) {
  return kc(a) ? new Uf(a) : Ug.j(k, D(["UUID literal expects a string as its representation."], 0))
}, queue:function(a) {
  return dc(a) ? vd(Yd, a) : Ug.j(k, D(["Queue literal expects a vector for its elements."], 0))
}}));
var Eh = Ef.k(Od);
function Fh(a, b, c, d) {
  if(a ? a.Pb : a) {
    return a.Pb(a, b, c, d)
  }
  var f;
  var h = Fh[p(a == k ? k : a)];
  h ? f = h : (h = Fh._) ? f = h : e(v("Plugin.declare-events", a));
  return f.call(k, a, b, c, d)
}
function Gh(a) {
  if(a ? a.dc : a) {
    return k
  }
  var b;
  var c = Gh[p(a == k ? k : a)];
  c ? b = c : (c = Gh._) ? b = c : e(v("Plugin.fix-dom", a));
  return b.call(k, a)
}
;var Hh, Ih, Jh, Kh = Ef.k(je);
function Lh(a) {
  return hd.g(function(b) {
    return a.item(b)
  }, tf.k(a.length))
}
var Nh = function Mh(b) {
  var c = b.offsetParent;
  if(s(c)) {
    var d = Mh(c), c = P.h(d, 0, k), d = P.h(d, 1, k);
    return U([c + b.offsetLeft, d + b.offsetTop])
  }
  return U([0, 0])
};
function Oh(a) {
  return function c(d) {
    var f = P.h(a, 0, k), h = P.h(a, 1, k), i = sd.g(c, Lh(d.childNodes));
    return s(function() {
      var a = d.getBoundingClientRect;
      if(s(a)) {
        var a = d.getBoundingClientRect(), c = a.left <= f;
        return c && (c = a.top <= h) ? (c = a.right > f) ? a.bottom > h : c : c
      }
      return a
    }()) ? J(d, i) : i
  }.call(k, document.body)
}
function Ph(a) {
  for(var b = k;;) {
    if(s(a)) {
      var c = a, a = P.h(c, 0, k), c = xc(c);
      if(!Pb(a)) {
        if(Pb(b)) {
          b = a
        }else {
          var d = cc(a), b = (d ? cc(b) : d) ? df.j(D([b, a], 0)) : a
        }
      }
      a = c
    }else {
      return b
    }
  }
}
function Qh(a, b) {
  var c = b.target, d = b.type, d = s(hf(["touchstart"]).call(k, d)) ? function() {
    var a = b.touches.item(0);
    return U([a.clientX, a.clientY])
  }() : s(hf(["touchmove"]).call(k, d)) ? function() {
    var a = b.touches.item(0);
    return U([a.clientX, a.clientY])
  }() : H.g("touchend", d) ? function() {
    var a = b.changedTouches.item(0);
    return U([a.clientX, a.clientY])
  }() : U([b.clientX, b.clientY]), f = Oh(d), d = Ph(function() {
    var a = function j(a) {
      return new S(k, m, function() {
        for(;;) {
          if(M(a)) {
            var b = F(a), c = J, b = b.getAttribute("data"), b = s(b) ? Ah(b) : k;
            return c(b, j(G(a)))
          }
          return k
        }
      }, k)
    };
    return a.k ? a.k(f) : a.call(k, f)
  }());
  return U([Ad.j(Ng(B(a), c), U([1]), Ub, D(["\ufdd0'offset", Nh(c), "\ufdd0'data", d], 0)), U([b.pageX, b.pageY])])
}
function Rh(a) {
  var b = Ih;
  return Ad(a, U([1]), function(a) {
    return Ub.j(a, "\ufdd0'offset", Nh(b), D(["\ufdd0'data", function() {
      var d = b.getAttribute("data");
      return s(d) ? Ah(d) : (new Ic("\ufdd0'data")).call(k, a)
    }()], 0))
  })
}
function Sh(a) {
  return B(Kh).call(k, xd.g(a, U([1, "\ufdd0'mouse"])))
}
function Th(a, b) {
  var c = b.target, d = Qh(a, b), f = P.h(d, 0, k), d = P.h(d, 1, k), h = Sh(f);
  return s(h) ? (Hh = f = zd(f, U([1, "\ufdd0'active"]), g), Ih = c, Jh = U([d]), h.h ? h.h(f, f, Jh) : h.call(k, f, f, Jh)) : k
}
function Uh(a, b) {
  b.preventDefault();
  if(s(Hh)) {
    var c = Qh(a, b), d = P.h(c, 0, k), c = P.h(c, 1, k), f = Sh(Hh);
    Jh = Qb.g(Jh, c);
    return f.h ? f.h(Rh(Hh), d, Jh) : f.call(k, Rh(Hh), d, Jh)
  }
  return k
}
function Vh(a, b) {
  var c = Qh(a, b), d = P.h(c, 0, k);
  P.h(c, 1, k);
  if(s(Hh)) {
    var c = Sh(Hh), f = Ad(Hh, U([1]), function(a) {
      return Vb.g(a, "\ufdd0'active")
    });
    c.h ? c.h(Rh(f), d, Jh) : c.call(k, Rh(f), d, Jh);
    Ih = Hh = Jh = k
  }else {
    return k
  }
}
function Wh() {
}
Wh.prototype.Pb = function(a, b, c, d) {
  window.setTimeout(function() {
    return window.scrollTo(0, 1)
  }, 100);
  b.addEventListener("mousedown", fd.g(Th, d));
  b.addEventListener("mousemove", fd.g(Uh, d));
  b.addEventListener("mouseup", fd.g(Vh, d));
  window.addEventListener("touchstart", fd.g(Th, d));
  window.addEventListener("touchmove", fd.g(Uh, d));
  return window.addEventListener("touchend", fd.g(Vh, d))
};
Wh.prototype.dc = ca(k);
Wh;
function Xh(a, b, c, d) {
  a = Jg(c.children, d.children, Od);
  if(b = M(a)) {
    a = F(b);
    P.h(a, 0, k);
    P.h(a, 1, k);
    P.h(a, 2, k);
    P.h(a, 3, k);
    for(d = b;;) {
      var c = a, a = P.h(c, 0, k), f = P.h(c, 1, k), b = P.h(c, 2, k), c = P.h(c, 3, k), h;
      a: {
        for(h = document.body;;) {
          if(f = M(f)) {
            var i = f, f = P.h(i, 0, k), i = xc(i);
            h = h.childNodes.item(f);
            f = i
          }else {
            break a
          }
        }
        h = aa
      }
      f = a;
      H.g("\ufdd0'html", f) ? h.innerHTML = T.g(R, hd.g(Hg, b)) : H.g("\ufdd0'rem-att", f) ? h.removeAttribute(nf(b)) : H.g("\ufdd0'att", f) ? H.g(b, "\ufdd0'value") ? h.value = "" + R(c) : h.setAttribute(nf(b), Eg(b, c)) : e(Error([R("No matching clause: "), R(a)].join("")));
      if(a = E(d)) {
        b = a, a = F(b), d = b
      }else {
        break
      }
    }
  }
  if(b = M(B(Eh))) {
    for(a = F(b);;) {
      if(Gh(a), a = E(b)) {
        b = a, a = F(b)
      }else {
        return k
      }
    }
  }else {
    return k
  }
}
var Yh = Ef.k(new xg("\ufdd0'body", je, k));
function Zh(a) {
  var b = je, c = ic(a);
  c || (c = a ? ((c = a.o & 33554432) ? c : a.sc) ? g : a.o ? m : u(kb, a) : u(kb, a));
  return new xg("\ufdd0'body", b, c ? Cg(a) : Cg(Eb.k(a)))
}
function $h(a, b, c, d) {
  return Gf.g(Yh, fd.g(Zh, d))
}
var ai = Ef.k(je);
function bi(a) {
  var b = M(B(Eh));
  if(b) {
    for(var c = F(b);;) {
      if(Fh(c, document.body, ai, Yh), c = E(b)) {
        b = c, c = F(b)
      }else {
        break
      }
    }
  }
  qb(a, "\ufdd0'dom-watcher", $h);
  qb(Yh, "\ufdd0'parsed-html-watcher", Xh);
  return Gf.g(a, cd)
}
;function ci(a, b, c) {
  var d = c.target, b = Ng(B(b), d), c = P.h(b, 0, k), f = P.h(b, 1, k), a = B(a).call(k, Bc.k((new Ic("\ufdd0'watch")).call(k, f)));
  if(s(s(a) ? nc(hf(["\ufdd0'textarea", "\ufdd0'input"]), c) : a)) {
    var h = d.value, c = Ad(b, U([1, "\ufdd0'value"]), function(a) {
      d.value = a;
      return h
    });
    return a.g ? a.g(b, c) : a.call(k, b, c)
  }
  return k
}
function di() {
}
di.prototype.Pb = function(a, b, c, d) {
  return b.addEventListener("input", fd.h(ci, c, d))
};
di.prototype.dc = ca(k);
di;
function ei(a) {
  s(H.g(document.readyState, "complete")) ? a = bi(a) : (a = fd.g(bi, a), a = window.onload = a);
  return a
}
Gf.h(Eh, Qb, new di);
Gf.h(Eh, Qb, new Wh);
Ef.k(k);
var fi = ke(["\ufdd0'hours", "\ufdd0'minutes", "\ufdd0'seconds", "\ufdd0'millis"], {"\ufdd0'hours":275, "\ufdd0'minutes":200, "\ufdd0'seconds":110, "\ufdd0'millis":30}), gi = Ef.k(ke(["\ufdd0'hours", "\ufdd0'minutes", "\ufdd0'seconds", "\ufdd0'millis"], {"\ufdd0'hours":0, "\ufdd0'minutes":25, "\ufdd0'seconds":50, "\ufdd0'millis":75}));
function hi(a) {
  return U(["\ufdd0'svg", U(["\ufdd0'g", ke(["\ufdd0'transform"], {"\ufdd0'transform":"translate(300,300)rotate(-90)"}), function() {
    var b = function d(b) {
      return new S(k, m, function() {
        for(;;) {
          if(M(b)) {
            var h = F(b), i = J, j = A.h(a, h, k), j = pg * j / 100, l = j + og, r = l + og, t = A.h(fi, h, k), h = U(["\ufdd0'g.slice", U(["\ufdd0'path", ke(["\ufdd0'class", "\ufdd0'd"], {"\ufdd0'class":[R(nf(h)), R("1")].join(""), "\ufdd0'd":tg.j(D(["\ufdd0'outer-radius", t, "\ufdd0'start-angle", j, "\ufdd0'end-angle", l], 0))})]), U(["\ufdd0'path", ke(["\ufdd0'class", "\ufdd0'd"], {"\ufdd0'class":[R(nf(h)), R("2")].join(""), "\ufdd0'd":tg.j(D(["\ufdd0'outer-radius", t, "\ufdd0'start-angle", l, 
            "\ufdd0'end-angle", r], 0))})])]);
            return i(h, d(G(b)))
          }
          return k
        }
      }, k)
    };
    return b.k ? b.k(U(["\ufdd0'hours", "\ufdd0'minutes", "\ufdd0'seconds", "\ufdd0'millis"])) : b.call(k, U(["\ufdd0'hours", "\ufdd0'minutes", "\ufdd0'seconds", "\ufdd0'millis"]))
  }()])])
}
var ii = Ef.k(hi.k ? hi.k(B(gi)) : hi.call(k, B(gi)));
ei.k ? ei.k(ii) : ei.call(k, ii);
var ji = fd.h(function(a, b, c, d, f, h) {
  return Gf.g(a, ed(b.k ? b.k(h) : b.call(k, h)))
}, ii, hi);
qb(gi, "\ufdd0'state-watcher", ji);
(function ki() {
  window.requestAnimationFrame(ki);
  var b = new Date, c = b.getHours(), d = vc(c, 12);
  return Ff(gi, ke(["\ufdd0'hours", "\ufdd0'minutes", "\ufdd0'seconds", "\ufdd0'millis"], {"\ufdd0'hours":100 * (c - 12 * d) / 12, "\ufdd0'minutes":100 * b.getMinutes() / 60, "\ufdd0'seconds":100 * b.getSeconds() / 60, "\ufdd0'millis":100 * b.getMilliseconds() / 1E3}))
}).call(k);
