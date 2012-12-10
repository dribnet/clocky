var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.DEBUG = true;
goog.LOCALE = "en";
goog.provide = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while(namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if(goog.getObjectByName(namespace)) {
        break
      }
      goog.implicitNamespaces_[namespace] = true
    }
  }
  goog.exportPath_(name)
};
goog.setTestOnly = function(opt_message) {
  if(COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
if(!COMPILED) {
  goog.isProvided_ = function(name) {
    return!goog.implicitNamespaces_[name] && !!goog.getObjectByName(name)
  };
  goog.implicitNamespaces_ = {}
}
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if(!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0])
  }
  for(var part;parts.length && (part = parts.shift());) {
    if(!parts.length && goog.isDef(opt_object)) {
      cur[part] = opt_object
    }else {
      if(cur[part]) {
        cur = cur[part]
      }else {
        cur = cur[part] = {}
      }
    }
  }
};
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for(var part;part = parts.shift();) {
    if(goog.isDefAndNotNull(cur[part])) {
      cur = cur[part]
    }else {
      return null
    }
  }
  return cur
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for(var x in obj) {
    global[x] = obj[x]
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if(!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for(var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if(!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {}
      }
      deps.pathToNames[path][provide] = true
    }
    for(var j = 0;require = requires[j];j++) {
      if(!(path in deps.requires)) {
        deps.requires[path] = {}
      }
      deps.requires[path][require] = true
    }
  }
};
goog.ENABLE_DEBUG_LOADER = true;
goog.require = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      return
    }
    if(goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if(path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    if(goog.global.console) {
      goog.global.console["error"](errorMessage)
    }
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(var_args) {
  return arguments[0]
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    return ctor.instance_ || (ctor.instance_ = new ctor)
  }
};
if(!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc
  };
  goog.findBasePath_ = function() {
    if(goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return
    }else {
      if(!goog.inHtmlDocument_()) {
        return
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for(var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if(src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if(!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true
    }
  };
  goog.writeScriptTag_ = function(src) {
    if(goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true
    }else {
      return false
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if(path in deps.written) {
        return
      }
      if(path in deps.visited) {
        if(!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path)
        }
        return
      }
      deps.visited[path] = true;
      if(path in deps.requires) {
        for(var requireName in deps.requires[path]) {
          if(!goog.isProvided_(requireName)) {
            if(requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName])
            }else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if(!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path)
      }
    }
    for(var path in goog.included_) {
      if(!deps.written[path]) {
        visitNode(path)
      }
    }
    for(var i = 0;i < scripts.length;i++) {
      if(scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i])
      }else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if(rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule]
    }else {
      return null
    }
  };
  goog.findBasePath_();
  if(!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js")
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if(s == "object") {
    if(value) {
      if(value instanceof Array) {
        return"array"
      }else {
        if(value instanceof Object) {
          return s
        }
      }
      var className = Object.prototype.toString.call(value);
      if(className == "[object Window]") {
        return"object"
      }
      if(className == "[object Array]" || typeof value.length == "number" && typeof value.splice != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")) {
        return"array"
      }
      if(className == "[object Function]" || typeof value.call != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if(s == "function" && typeof value.call == "undefined") {
      return"object"
    }
  }
  return s
};
goog.propertyIsEnumerableCustom_ = function(object, propName) {
  if(propName in object) {
    for(var key in object) {
      if(key == propName && Object.prototype.hasOwnProperty.call(object, propName)) {
        return true
      }
    }
  }
  return false
};
goog.propertyIsEnumerable_ = function(object, propName) {
  if(object instanceof Object) {
    return Object.prototype.propertyIsEnumerable.call(object, propName)
  }else {
    return goog.propertyIsEnumerableCustom_(object, propName)
  }
};
goog.isDef = function(val) {
  return val !== undefined
};
goog.isNull = function(val) {
  return val === null
};
goog.isDefAndNotNull = function(val) {
  return val != null
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array"
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number"
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function"
};
goog.isString = function(val) {
  return typeof val == "string"
};
goog.isBoolean = function(val) {
  return typeof val == "boolean"
};
goog.isNumber = function(val) {
  return typeof val == "number"
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function"
};
goog.isObject = function(val) {
  var type = goog.typeOf(val);
  return type == "object" || type == "array" || type == "function"
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.removeUid = function(obj) {
  if("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_)
  }
  try {
    delete obj[goog.UID_PROPERTY_]
  }catch(ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + Math.floor(Math.random() * 2147483648).toString(36);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.cloneObject(obj[key])
    }
    return clone
  }
  return obj
};
Object.prototype.clone;
goog.bindNative_ = function(fn, selfObj, var_args) {
  return fn.call.apply(fn.bind, arguments)
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if(!fn) {
    throw new Error;
  }
  if(arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs)
    }
  }else {
    return function() {
      return fn.apply(selfObj, arguments)
    }
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if(Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_
  }else {
    goog.bind = goog.bindJs_
  }
  return goog.bind.apply(null, arguments)
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs)
  }
};
goog.mixin = function(target, source) {
  for(var x in source) {
    target[x] = source[x]
  }
};
goog.now = Date.now || function() {
  return+new Date
};
goog.globalEval = function(script) {
  if(goog.global.execScript) {
    goog.global.execScript(script, "JavaScript")
  }else {
    if(goog.global.eval) {
      if(goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if(typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true
        }else {
          goog.evalWorksForGlobals_ = false
        }
      }
      if(goog.evalWorksForGlobals_) {
        goog.global.eval(script)
      }else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt)
      }
    }else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for(var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]))
    }
    return mapped.join("-")
  };
  var rename;
  if(goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts
  }else {
    rename = function(a) {
      return a
    }
  }
  if(opt_modifier) {
    return className + "-" + rename(opt_modifier)
  }else {
    return rename(className)
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if(!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for(var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value)
  }
  return str
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo)
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if(caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1))
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for(var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if(ctor.prototype[opt_methodName] === caller) {
      foundCaller = true
    }else {
      if(foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args)
      }
    }
  }
  if(me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args)
  }else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global)
};
goog.provide("goog.debug.Error");
goog.debug.Error = function(opt_msg) {
  this.stack = (new Error).stack || "";
  if(opt_msg) {
    this.message = String(opt_msg)
  }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.provide("goog.string");
goog.provide("goog.string.Unicode");
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0
};
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l
};
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0
};
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0
};
goog.string.subs = function(str, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var replacement = String(arguments[i]).replace(/\$/g, "$$$$");
    str = str.replace(/\%s/, replacement)
  }
  return str
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function(str) {
  return/^[\s\xa0]*$/.test(str)
};
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str))
};
goog.string.isBreakingWhitespace = function(str) {
  return!/[^\t\n\r ]/.test(str)
};
goog.string.isAlpha = function(str) {
  return!/[^a-zA-Z]/.test(str)
};
goog.string.isNumeric = function(str) {
  return!/[^0-9]/.test(str)
};
goog.string.isAlphaNumeric = function(str) {
  return!/[^a-zA-Z0-9]/.test(str)
};
goog.string.isSpace = function(ch) {
  return ch == " "
};
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= " " && ch <= "~" || ch >= "\u0080" && ch <= "\ufffd"
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "")
};
goog.string.trim = function(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();
  if(test1 < test2) {
    return-1
  }else {
    if(test1 == test2) {
      return 0
    }else {
      return 1
    }
  }
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(str1, str2) {
  if(str1 == str2) {
    return 0
  }
  if(!str1) {
    return-1
  }
  if(!str2) {
    return 1
  }
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var count = Math.min(tokens1.length, tokens2.length);
  for(var i = 0;i < count;i++) {
    var a = tokens1[i];
    var b = tokens2[i];
    if(a != b) {
      var num1 = parseInt(a, 10);
      if(!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if(!isNaN(num2) && num1 - num2) {
          return num1 - num2
        }
      }
      return a < b ? -1 : 1
    }
  }
  if(tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length
  }
  return str1 < str2 ? -1 : 1
};
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;
goog.string.urlEncode = function(str) {
  str = String(str);
  if(!goog.string.encodeUriRegExp_.test(str)) {
    return encodeURIComponent(str)
  }
  return str
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, " "))
};
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>")
};
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if(opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;")
  }else {
    if(!goog.string.allRe_.test(str)) {
      return str
    }
    if(str.indexOf("&") != -1) {
      str = str.replace(goog.string.amperRe_, "&amp;")
    }
    if(str.indexOf("<") != -1) {
      str = str.replace(goog.string.ltRe_, "&lt;")
    }
    if(str.indexOf(">") != -1) {
      str = str.replace(goog.string.gtRe_, "&gt;")
    }
    if(str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, "&quot;")
    }
    return str
  }
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /\"/g;
goog.string.allRe_ = /[&<>\"]/;
goog.string.unescapeEntities = function(str) {
  if(goog.string.contains(str, "&")) {
    if("document" in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str)
    }else {
      return goog.string.unescapePureXmlEntities_(str)
    }
  }
  return str
};
goog.string.unescapeEntitiesUsingDom_ = function(str) {
  var seen = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'};
  var div = document.createElement("div");
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    var value = seen[s];
    if(value) {
      return value
    }
    if(entity.charAt(0) == "#") {
      var n = Number("0" + entity.substr(1));
      if(!isNaN(n)) {
        value = String.fromCharCode(n)
      }
    }
    if(!value) {
      div.innerHTML = s + " ";
      value = div.firstChild.nodeValue.slice(0, -1)
    }
    return seen[s] = value
  })
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch(entity) {
      case "amp":
        return"&";
      case "lt":
        return"<";
      case "gt":
        return">";
      case "quot":
        return'"';
      default:
        if(entity.charAt(0) == "#") {
          var n = Number("0" + entity.substr(1));
          if(!isNaN(n)) {
            return String.fromCharCode(n)
          }
        }
        return s
    }
  })
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml)
};
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for(var i = 0;i < length;i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if(str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1)
    }
  }
  return str
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(str.length > chars) {
    str = str.substring(0, chars - 3) + "..."
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(opt_trailingChars && str.length > chars) {
    if(opt_trailingChars > chars) {
      opt_trailingChars = chars
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + "..." + str.substring(endPoint)
  }else {
    if(str.length > chars) {
      var half = Math.floor(chars / 2);
      var endPos = str.length - half;
      half += chars % 2;
      str = str.substring(0, half) + "..." + str.substring(endPos)
    }
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\u0008":"\\b", "\u000c":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(s) {
  s = String(s);
  if(s.quote) {
    return s.quote()
  }else {
    var sb = ['"'];
    for(var i = 0;i < s.length;i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] || (cc > 31 && cc < 127 ? ch : goog.string.escapeChar(ch))
    }
    sb.push('"');
    return sb.join("")
  }
};
goog.string.escapeString = function(str) {
  var sb = [];
  for(var i = 0;i < str.length;i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i))
  }
  return sb.join("")
};
goog.string.escapeChar = function(c) {
  if(c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c]
  }
  if(c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c]
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if(cc > 31 && cc < 127) {
    rv = c
  }else {
    if(cc < 256) {
      rv = "\\x";
      if(cc < 16 || cc > 256) {
        rv += "0"
      }
    }else {
      rv = "\\u";
      if(cc < 4096) {
        rv += "0"
      }
    }
    rv += cc.toString(16).toUpperCase()
  }
  return goog.string.jsEscapeCache_[c] = rv
};
goog.string.toMap = function(s) {
  var rv = {};
  for(var i = 0;i < s.length;i++) {
    rv[s.charAt(i)] = true
  }
  return rv
};
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  if(index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength)
  }
  return resultStr
};
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "");
  return s.replace(re, "")
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, "")
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function(string, length) {
  return(new Array(length + 1)).join(string)
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf(".");
  if(index == -1) {
    index = s.length
  }
  return goog.string.repeat("0", Math.max(0, length - index)) + s
};
goog.string.makeSafe = function(obj) {
  return obj == null ? "" : String(obj)
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36)
};
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  var v1Subs = goog.string.trim(String(version1)).split(".");
  var v2Subs = goog.string.trim(String(version2)).split(".");
  var subCount = Math.max(v1Subs.length, v2Subs.length);
  for(var subIdx = 0;order == 0 && subIdx < subCount;subIdx++) {
    var v1Sub = v1Subs[subIdx] || "";
    var v2Sub = v2Subs[subIdx] || "";
    var v1CompParser = new RegExp("(\\d*)(\\D*)", "g");
    var v2CompParser = new RegExp("(\\d*)(\\D*)", "g");
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ["", "", ""];
      var v2Comp = v2CompParser.exec(v2Sub) || ["", "", ""];
      if(v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break
      }
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
      order = goog.string.compareElements_(v1CompNum, v2CompNum) || goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2])
    }while(order == 0)
  }
  return order
};
goog.string.compareElements_ = function(left, right) {
  if(left < right) {
    return-1
  }else {
    if(left > right) {
      return 1
    }
  }
  return 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(str) {
  var result = 0;
  for(var i = 0;i < str.length;++i) {
    result = 31 * result + str.charCodeAt(i);
    result %= goog.string.HASHCODE_MAX_
  }
  return result
};
goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;
goog.string.createUniqueString = function() {
  return"goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  if(num == 0 && goog.string.isEmpty(str)) {
    return NaN
  }
  return num
};
goog.string.toCamelCaseCache_ = {};
goog.string.toCamelCase = function(str) {
  return goog.string.toCamelCaseCache_[str] || (goog.string.toCamelCaseCache_[str] = String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase()
  }))
};
goog.string.toSelectorCaseCache_ = {};
goog.string.toSelectorCase = function(str) {
  return goog.string.toSelectorCaseCache_[str] || (goog.string.toSelectorCaseCache_[str] = String(str).replace(/([A-Z])/g, "-$1").toLowerCase())
};
goog.provide("goog.asserts");
goog.provide("goog.asserts.AssertionError");
goog.require("goog.debug.Error");
goog.require("goog.string");
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  messageArgs.shift();
  this.messagePattern = messagePattern
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = "Assertion failed";
  if(givenMessage) {
    message += ": " + givenMessage;
    var args = givenArgs
  }else {
    if(defaultMessage) {
      message += ": " + defaultMessage;
      args = defaultArgs
    }
  }
  throw new goog.asserts.AssertionError("" + message, args || []);
};
goog.asserts.assert = function(condition, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_("", null, opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return condition
};
goog.asserts.fail = function(opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError("Failure" + (opt_message ? ": " + opt_message : ""), Array.prototype.slice.call(arguments, 1));
  }
};
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertString = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_("instanceof check failed.", null, opt_message, Array.prototype.slice.call(arguments, 3))
  }
};
goog.provide("goog.array");
goog.provide("goog.array.ArrayLike");
goog.require("goog.asserts");
goog.NATIVE_ARRAY_PROTOTYPES = true;
goog.array.ArrayLike;
goog.array.peek = function(array) {
  return array[array.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.indexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? 0 : opt_fromIndex < 0 ? Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex;
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.indexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i < arr.length;i++) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  if(fromIndex < 0) {
    fromIndex = Math.max(0, arr.length + fromIndex)
  }
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.lastIndexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i >= 0;i--) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.forEach ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;--i) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.filter ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = [];
  var resLength = 0;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      var val = arr2[i];
      if(f.call(opt_obj, val, i, arr)) {
        res[resLength++] = val
      }
    }
  }
  return res
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.map ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = new Array(l);
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      res[i] = f.call(opt_obj, arr2[i], i, arr)
    }
  }
  return res
};
goog.array.reduce = function(arr, f, val, opt_obj) {
  if(arr.reduce) {
    if(opt_obj) {
      return arr.reduce(goog.bind(f, opt_obj), val)
    }else {
      return arr.reduce(f, val)
    }
  }
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.reduceRight = function(arr, f, val, opt_obj) {
  if(arr.reduceRight) {
    if(opt_obj) {
      return arr.reduceRight(goog.bind(f, opt_obj), val)
    }else {
      return arr.reduceRight(f, val)
    }
  }
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.some ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return true
    }
  }
  return false
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.every ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
      return false
    }
  }
  return true
};
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;i--) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0
};
goog.array.isEmpty = function(arr) {
  return arr.length == 0
};
goog.array.clear = function(arr) {
  if(!goog.isArray(arr)) {
    for(var i = arr.length - 1;i >= 0;i--) {
      delete arr[i]
    }
  }
  arr.length = 0
};
goog.array.insert = function(arr, obj) {
  if(!goog.array.contains(arr, obj)) {
    arr.push(obj)
  }
};
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj)
};
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd)
};
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if(arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj)
  }else {
    goog.array.insertAt(arr, obj, i)
  }
};
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if(rv = i >= 0) {
    goog.array.removeAt(arr, i)
  }
  return rv
};
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1
};
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if(i >= 0) {
    goog.array.removeAt(arr, i);
    return true
  }
  return false
};
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.clone = function(arr) {
  if(goog.isArray(arr)) {
    return goog.array.concat(arr)
  }else {
    var rv = [];
    for(var i = 0, len = arr.length;i < len;i++) {
      rv[i] = arr[i]
    }
    return rv
  }
};
goog.array.toArray = function(object) {
  if(goog.isArray(object)) {
    return goog.array.concat(object)
  }
  return goog.array.clone(object)
};
goog.array.extend = function(arr1, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var arr2 = arguments[i];
    var isArrayLike;
    if(goog.isArray(arr2) || (isArrayLike = goog.isArrayLike(arr2)) && arr2.hasOwnProperty("callee")) {
      arr1.push.apply(arr1, arr2)
    }else {
      if(isArrayLike) {
        var len1 = arr1.length;
        var len2 = arr2.length;
        for(var j = 0;j < len2;j++) {
          arr1[len1 + j] = arr2[j]
        }
      }else {
        arr1.push(arr2)
      }
    }
  }
};
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(arr, goog.array.slice(arguments, 1))
};
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);
  if(arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start)
  }else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end)
  }
};
goog.array.removeDuplicates = function(arr, opt_rv) {
  var returnArray = opt_rv || arr;
  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while(cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = goog.isObject(current) ? "o" + goog.getUid(current) : (typeof current).charAt(0) + current;
    if(!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current
    }
  }
  returnArray.length = cursorInsert
};
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, false, target)
};
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true, undefined, opt_obj)
};
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) {
  var left = 0;
  var right = arr.length;
  var found;
  while(left < right) {
    var middle = left + right >> 1;
    var compareResult;
    if(isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr)
    }else {
      compareResult = compareFn(opt_target, arr[middle])
    }
    if(compareResult > 0) {
      left = middle + 1
    }else {
      right = middle;
      found = !compareResult
    }
  }
  return found ? left : ~left
};
goog.array.sort = function(arr, opt_compareFn) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.sort.call(arr, opt_compareFn || goog.array.defaultCompare)
};
goog.array.stableSort = function(arr, opt_compareFn) {
  for(var i = 0;i < arr.length;i++) {
    arr[i] = {index:i, value:arr[i]}
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index
  }
  goog.array.sort(arr, stableCompareFn);
  for(var i = 0;i < arr.length;i++) {
    arr[i] = arr[i].value
  }
};
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key])
  })
};
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for(var i = 1;i < arr.length;i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if(compareResult > 0 || compareResult == 0 && opt_strict) {
      return false
    }
  }
  return true
};
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if(!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) || arr1.length != arr2.length) {
    return false
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for(var i = 0;i < l;i++) {
    if(!equalsFn(arr1[i], arr2[i])) {
      return false
    }
  }
  return true
};
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn)
};
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for(var i = 0;i < l;i++) {
    var result = compare(arr1[i], arr2[i]);
    if(result != 0) {
      return result
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length)
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b
};
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if(index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true
  }
  return false
};
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return index >= 0 ? goog.array.removeAt(array, index) : false
};
goog.array.bucket = function(array, sorter) {
  var buckets = {};
  for(var i = 0;i < array.length;i++) {
    var value = array[i];
    var key = sorter(value, i, array);
    if(goog.isDef(key)) {
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value)
    }
  }
  return buckets
};
goog.array.repeat = function(value, n) {
  var array = [];
  for(var i = 0;i < n;i++) {
    array[i] = value
  }
  return array
};
goog.array.flatten = function(var_args) {
  var result = [];
  for(var i = 0;i < arguments.length;i++) {
    var element = arguments[i];
    if(goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element))
    }else {
      result.push(element)
    }
  }
  return result
};
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);
  if(array.length) {
    n %= array.length;
    if(n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n))
    }else {
      if(n < 0) {
        goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n))
      }
    }
  }
  return array
};
goog.array.zip = function(var_args) {
  if(!arguments.length) {
    return[]
  }
  var result = [];
  for(var i = 0;true;i++) {
    var value = [];
    for(var j = 0;j < arguments.length;j++) {
      var arr = arguments[j];
      if(i >= arr.length) {
        return result
      }
      value.push(arr[i])
    }
    result.push(value)
  }
};
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;
  for(var i = arr.length - 1;i > 0;i--) {
    var j = Math.floor(randFn() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp
  }
};
goog.provide("goog.object");
goog.object.forEach = function(obj, f, opt_obj) {
  for(var key in obj) {
    f.call(opt_obj, obj[key], key, obj)
  }
};
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key]
    }
  }
  return res
};
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj)
  }
  return res
};
goog.object.some = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      return true
    }
  }
  return false
};
goog.object.every = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(!f.call(opt_obj, obj[key], key, obj)) {
      return false
    }
  }
  return true
};
goog.object.getCount = function(obj) {
  var rv = 0;
  for(var key in obj) {
    rv++
  }
  return rv
};
goog.object.getAnyKey = function(obj) {
  for(var key in obj) {
    return key
  }
};
goog.object.getAnyValue = function(obj) {
  for(var key in obj) {
    return obj[key]
  }
};
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val)
};
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = obj[key]
  }
  return res
};
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = key
  }
  return res
};
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;
  for(var i = isArrayLike ? 0 : 1;i < keys.length;i++) {
    obj = obj[keys[i]];
    if(!goog.isDef(obj)) {
      break
    }
  }
  return obj
};
goog.object.containsKey = function(obj, key) {
  return key in obj
};
goog.object.containsValue = function(obj, val) {
  for(var key in obj) {
    if(obj[key] == val) {
      return true
    }
  }
  return false
};
goog.object.findKey = function(obj, f, opt_this) {
  for(var key in obj) {
    if(f.call(opt_this, obj[key], key, obj)) {
      return key
    }
  }
  return undefined
};
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key]
};
goog.object.isEmpty = function(obj) {
  for(var key in obj) {
    return false
  }
  return true
};
goog.object.clear = function(obj) {
  for(var i in obj) {
    delete obj[i]
  }
};
goog.object.remove = function(obj, key) {
  var rv;
  if(rv = key in obj) {
    delete obj[key]
  }
  return rv
};
goog.object.add = function(obj, key, val) {
  if(key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val)
};
goog.object.get = function(obj, key, opt_val) {
  if(key in obj) {
    return obj[key]
  }
  return opt_val
};
goog.object.set = function(obj, key, value) {
  obj[key] = value
};
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : obj[key] = value
};
goog.object.clone = function(obj) {
  var res = {};
  for(var key in obj) {
    res[key] = obj[key]
  }
  return res
};
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key])
    }
    return clone
  }
  return obj
};
goog.object.transpose = function(obj) {
  var transposed = {};
  for(var key in obj) {
    transposed[obj[key]] = key
  }
  return transposed
};
goog.object.PROTOTYPE_FIELDS_ = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
goog.object.extend = function(target, var_args) {
  var key, source;
  for(var i = 1;i < arguments.length;i++) {
    source = arguments[i];
    for(key in source) {
      target[key] = source[key]
    }
    for(var j = 0;j < goog.object.PROTOTYPE_FIELDS_.length;j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if(Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key]
      }
    }
  }
};
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0])
  }
  if(argLength % 2) {
    throw Error("Uneven number of arguments");
  }
  var rv = {};
  for(var i = 0;i < argLength;i += 2) {
    rv[arguments[i]] = arguments[i + 1]
  }
  return rv
};
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0])
  }
  var rv = {};
  for(var i = 0;i < argLength;i++) {
    rv[arguments[i]] = true
  }
  return rv
};
goog.provide("goog.string.format");
goog.require("goog.string");
goog.string.format = function(formatString, var_args) {
  var args = Array.prototype.slice.call(arguments);
  var template = args.shift();
  if(typeof template == "undefined") {
    throw Error("[goog.string.format] Template required");
  }
  var formatRe = /%([0\-\ \+]*)(\d+)?(\.(\d+))?([%sfdiu])/g;
  function replacerDemuxer(match, flags, width, dotp, precision, type, offset, wholeString) {
    if(type == "%") {
      return"%"
    }
    var value = args.shift();
    if(typeof value == "undefined") {
      throw Error("[goog.string.format] Not enough arguments");
    }
    arguments[0] = value;
    return goog.string.format.demuxes_[type].apply(null, arguments)
  }
  return template.replace(formatRe, replacerDemuxer)
};
goog.string.format.demuxes_ = {};
goog.string.format.demuxes_["s"] = function(value, flags, width, dotp, precision, type, offset, wholeString) {
  var replacement = value;
  if(isNaN(width) || width == "" || replacement.length >= width) {
    return replacement
  }
  if(flags.indexOf("-", 0) > -1) {
    replacement = replacement + goog.string.repeat(" ", width - replacement.length)
  }else {
    replacement = goog.string.repeat(" ", width - replacement.length) + replacement
  }
  return replacement
};
goog.string.format.demuxes_["f"] = function(value, flags, width, dotp, precision, type, offset, wholeString) {
  var replacement = value.toString();
  if(!(isNaN(precision) || precision == "")) {
    replacement = value.toFixed(precision)
  }
  var sign;
  if(value < 0) {
    sign = "-"
  }else {
    if(flags.indexOf("+") >= 0) {
      sign = "+"
    }else {
      if(flags.indexOf(" ") >= 0) {
        sign = " "
      }else {
        sign = ""
      }
    }
  }
  if(value >= 0) {
    replacement = sign + replacement
  }
  if(isNaN(width) || replacement.length >= width) {
    return replacement
  }
  replacement = isNaN(precision) ? Math.abs(value).toString() : Math.abs(value).toFixed(precision);
  var padCount = width - replacement.length - sign.length;
  if(flags.indexOf("-", 0) >= 0) {
    replacement = sign + replacement + goog.string.repeat(" ", padCount)
  }else {
    var paddingChar = flags.indexOf("0", 0) >= 0 ? "0" : " ";
    replacement = sign + goog.string.repeat(paddingChar, padCount) + replacement
  }
  return replacement
};
goog.string.format.demuxes_["d"] = function(value, flags, width, dotp, precision, type, offset, wholeString) {
  return goog.string.format.demuxes_["f"](parseInt(value, 10), flags, width, dotp, 0, type, offset, wholeString)
};
goog.string.format.demuxes_["i"] = goog.string.format.demuxes_["d"];
goog.string.format.demuxes_["u"] = goog.string.format.demuxes_["d"];
goog.provide("goog.userAgent.jscript");
goog.require("goog.string");
goog.userAgent.jscript.ASSUME_NO_JSCRIPT = false;
goog.userAgent.jscript.init_ = function() {
  var hasScriptEngine = "ScriptEngine" in goog.global;
  goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ = hasScriptEngine && goog.global["ScriptEngine"]() == "JScript";
  goog.userAgent.jscript.DETECTED_VERSION_ = goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ ? goog.global["ScriptEngineMajorVersion"]() + "." + goog.global["ScriptEngineMinorVersion"]() + "." + goog.global["ScriptEngineBuildVersion"]() : "0"
};
if(!goog.userAgent.jscript.ASSUME_NO_JSCRIPT) {
  goog.userAgent.jscript.init_()
}
goog.userAgent.jscript.HAS_JSCRIPT = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? false : goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_;
goog.userAgent.jscript.VERSION = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? "0" : goog.userAgent.jscript.DETECTED_VERSION_;
goog.userAgent.jscript.isVersion = function(version) {
  return goog.string.compareVersions(goog.userAgent.jscript.VERSION, version) >= 0
};
goog.provide("goog.string.StringBuffer");
goog.require("goog.userAgent.jscript");
goog.string.StringBuffer = function(opt_a1, var_args) {
  this.buffer_ = goog.userAgent.jscript.HAS_JSCRIPT ? [] : "";
  if(opt_a1 != null) {
    this.append.apply(this, arguments)
  }
};
goog.string.StringBuffer.prototype.set = function(s) {
  this.clear();
  this.append(s)
};
if(goog.userAgent.jscript.HAS_JSCRIPT) {
  goog.string.StringBuffer.prototype.bufferLength_ = 0;
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    if(opt_a2 == null) {
      this.buffer_[this.bufferLength_++] = a1
    }else {
      this.buffer_.push.apply(this.buffer_, arguments);
      this.bufferLength_ = this.buffer_.length
    }
    return this
  }
}else {
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    this.buffer_ += a1;
    if(opt_a2 != null) {
      for(var i = 1;i < arguments.length;i++) {
        this.buffer_ += arguments[i]
      }
    }
    return this
  }
}
goog.string.StringBuffer.prototype.clear = function() {
  if(goog.userAgent.jscript.HAS_JSCRIPT) {
    this.buffer_.length = 0;
    this.bufferLength_ = 0
  }else {
    this.buffer_ = ""
  }
};
goog.string.StringBuffer.prototype.getLength = function() {
  return this.toString().length
};
goog.string.StringBuffer.prototype.toString = function() {
  if(goog.userAgent.jscript.HAS_JSCRIPT) {
    var str = this.buffer_.join("");
    this.clear();
    if(str) {
      this.append(str)
    }
    return str
  }else {
    return this.buffer_
  }
};
goog.provide("cljs.core");
goog.require("goog.array");
goog.require("goog.object");
goog.require("goog.string.format");
goog.require("goog.string.StringBuffer");
goog.require("goog.string");
cljs.core._STAR_unchecked_if_STAR_ = false;
cljs.core._STAR_print_fn_STAR_ = function _STAR_print_fn_STAR_(_) {
  throw new Error("No *print-fn* fn set for evaluation environment");
};
cljs.core.truth_ = function truth_(x) {
  return x != null && x !== false
};
cljs.core.type_satisfies_ = function type_satisfies_(p, x) {
  var x__8385 = x == null ? null : x;
  if(p[goog.typeOf(x__8385)]) {
    return true
  }else {
    if(p["_"]) {
      return true
    }else {
      if("\ufdd0'else") {
        return false
      }else {
        return null
      }
    }
  }
};
cljs.core.is_proto_ = function is_proto_(x) {
  return x.constructor.prototype === x
};
cljs.core._STAR_main_cli_fn_STAR_ = null;
cljs.core.missing_protocol = function missing_protocol(proto, obj) {
  return Error(["No protocol method ", proto, " defined for type ", goog.typeOf(obj), ": ", obj].join(""))
};
cljs.core.aclone = function aclone(array_like) {
  return array_like.slice()
};
cljs.core.array = function array(var_args) {
  return Array.prototype.slice.call(arguments)
};
cljs.core.make_array = function() {
  var make_array = null;
  var make_array__1 = function(size) {
    return new Array(size)
  };
  var make_array__2 = function(type, size) {
    return make_array.cljs$lang$arity$1(size)
  };
  make_array = function(type, size) {
    switch(arguments.length) {
      case 1:
        return make_array__1.call(this, type);
      case 2:
        return make_array__2.call(this, type, size)
    }
    throw"Invalid arity: " + arguments.length;
  };
  make_array.cljs$lang$arity$1 = make_array__1;
  make_array.cljs$lang$arity$2 = make_array__2;
  return make_array
}();
cljs.core.aget = function() {
  var aget = null;
  var aget__2 = function(array, i) {
    return array[i]
  };
  var aget__3 = function() {
    var G__8386__delegate = function(array, i, idxs) {
      return cljs.core.apply.cljs$lang$arity$3(aget, aget.cljs$lang$arity$2(array, i), idxs)
    };
    var G__8386 = function(array, i, var_args) {
      var idxs = null;
      if(goog.isDef(var_args)) {
        idxs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__8386__delegate.call(this, array, i, idxs)
    };
    G__8386.cljs$lang$maxFixedArity = 2;
    G__8386.cljs$lang$applyTo = function(arglist__8387) {
      var array = cljs.core.first(arglist__8387);
      var i = cljs.core.first(cljs.core.next(arglist__8387));
      var idxs = cljs.core.rest(cljs.core.next(arglist__8387));
      return G__8386__delegate(array, i, idxs)
    };
    G__8386.cljs$lang$arity$variadic = G__8386__delegate;
    return G__8386
  }();
  aget = function(array, i, var_args) {
    var idxs = var_args;
    switch(arguments.length) {
      case 2:
        return aget__2.call(this, array, i);
      default:
        return aget__3.cljs$lang$arity$variadic(array, i, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  aget.cljs$lang$maxFixedArity = 2;
  aget.cljs$lang$applyTo = aget__3.cljs$lang$applyTo;
  aget.cljs$lang$arity$2 = aget__2;
  aget.cljs$lang$arity$variadic = aget__3.cljs$lang$arity$variadic;
  return aget
}();
cljs.core.aset = function aset(array, i, val) {
  return array[i] = val
};
cljs.core.alength = function alength(array) {
  return array.length
};
cljs.core.into_array = function() {
  var into_array = null;
  var into_array__1 = function(aseq) {
    return into_array.cljs$lang$arity$2(null, aseq)
  };
  var into_array__2 = function(type, aseq) {
    return cljs.core.reduce.cljs$lang$arity$3(function(a, x) {
      a.push(x);
      return a
    }, [], aseq)
  };
  into_array = function(type, aseq) {
    switch(arguments.length) {
      case 1:
        return into_array__1.call(this, type);
      case 2:
        return into_array__2.call(this, type, aseq)
    }
    throw"Invalid arity: " + arguments.length;
  };
  into_array.cljs$lang$arity$1 = into_array__1;
  into_array.cljs$lang$arity$2 = into_array__2;
  return into_array
}();
cljs.core.IFn = {};
cljs.core._invoke = function() {
  var _invoke = null;
  var _invoke__1 = function(this$) {
    if(function() {
      var and__3822__auto____8472 = this$;
      if(and__3822__auto____8472) {
        return this$.cljs$core$IFn$_invoke$arity$1
      }else {
        return and__3822__auto____8472
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$1(this$)
    }else {
      var x__2363__auto____8473 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8474 = cljs.core._invoke[goog.typeOf(x__2363__auto____8473)];
        if(or__3824__auto____8474) {
          return or__3824__auto____8474
        }else {
          var or__3824__auto____8475 = cljs.core._invoke["_"];
          if(or__3824__auto____8475) {
            return or__3824__auto____8475
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var _invoke__2 = function(this$, a) {
    if(function() {
      var and__3822__auto____8476 = this$;
      if(and__3822__auto____8476) {
        return this$.cljs$core$IFn$_invoke$arity$2
      }else {
        return and__3822__auto____8476
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$2(this$, a)
    }else {
      var x__2363__auto____8477 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8478 = cljs.core._invoke[goog.typeOf(x__2363__auto____8477)];
        if(or__3824__auto____8478) {
          return or__3824__auto____8478
        }else {
          var or__3824__auto____8479 = cljs.core._invoke["_"];
          if(or__3824__auto____8479) {
            return or__3824__auto____8479
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a)
    }
  };
  var _invoke__3 = function(this$, a, b) {
    if(function() {
      var and__3822__auto____8480 = this$;
      if(and__3822__auto____8480) {
        return this$.cljs$core$IFn$_invoke$arity$3
      }else {
        return and__3822__auto____8480
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$3(this$, a, b)
    }else {
      var x__2363__auto____8481 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8482 = cljs.core._invoke[goog.typeOf(x__2363__auto____8481)];
        if(or__3824__auto____8482) {
          return or__3824__auto____8482
        }else {
          var or__3824__auto____8483 = cljs.core._invoke["_"];
          if(or__3824__auto____8483) {
            return or__3824__auto____8483
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b)
    }
  };
  var _invoke__4 = function(this$, a, b, c) {
    if(function() {
      var and__3822__auto____8484 = this$;
      if(and__3822__auto____8484) {
        return this$.cljs$core$IFn$_invoke$arity$4
      }else {
        return and__3822__auto____8484
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$4(this$, a, b, c)
    }else {
      var x__2363__auto____8485 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8486 = cljs.core._invoke[goog.typeOf(x__2363__auto____8485)];
        if(or__3824__auto____8486) {
          return or__3824__auto____8486
        }else {
          var or__3824__auto____8487 = cljs.core._invoke["_"];
          if(or__3824__auto____8487) {
            return or__3824__auto____8487
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c)
    }
  };
  var _invoke__5 = function(this$, a, b, c, d) {
    if(function() {
      var and__3822__auto____8488 = this$;
      if(and__3822__auto____8488) {
        return this$.cljs$core$IFn$_invoke$arity$5
      }else {
        return and__3822__auto____8488
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$5(this$, a, b, c, d)
    }else {
      var x__2363__auto____8489 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8490 = cljs.core._invoke[goog.typeOf(x__2363__auto____8489)];
        if(or__3824__auto____8490) {
          return or__3824__auto____8490
        }else {
          var or__3824__auto____8491 = cljs.core._invoke["_"];
          if(or__3824__auto____8491) {
            return or__3824__auto____8491
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d)
    }
  };
  var _invoke__6 = function(this$, a, b, c, d, e) {
    if(function() {
      var and__3822__auto____8492 = this$;
      if(and__3822__auto____8492) {
        return this$.cljs$core$IFn$_invoke$arity$6
      }else {
        return and__3822__auto____8492
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$6(this$, a, b, c, d, e)
    }else {
      var x__2363__auto____8493 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8494 = cljs.core._invoke[goog.typeOf(x__2363__auto____8493)];
        if(or__3824__auto____8494) {
          return or__3824__auto____8494
        }else {
          var or__3824__auto____8495 = cljs.core._invoke["_"];
          if(or__3824__auto____8495) {
            return or__3824__auto____8495
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e)
    }
  };
  var _invoke__7 = function(this$, a, b, c, d, e, f) {
    if(function() {
      var and__3822__auto____8496 = this$;
      if(and__3822__auto____8496) {
        return this$.cljs$core$IFn$_invoke$arity$7
      }else {
        return and__3822__auto____8496
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$7(this$, a, b, c, d, e, f)
    }else {
      var x__2363__auto____8497 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8498 = cljs.core._invoke[goog.typeOf(x__2363__auto____8497)];
        if(or__3824__auto____8498) {
          return or__3824__auto____8498
        }else {
          var or__3824__auto____8499 = cljs.core._invoke["_"];
          if(or__3824__auto____8499) {
            return or__3824__auto____8499
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f)
    }
  };
  var _invoke__8 = function(this$, a, b, c, d, e, f, g) {
    if(function() {
      var and__3822__auto____8500 = this$;
      if(and__3822__auto____8500) {
        return this$.cljs$core$IFn$_invoke$arity$8
      }else {
        return and__3822__auto____8500
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$8(this$, a, b, c, d, e, f, g)
    }else {
      var x__2363__auto____8501 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8502 = cljs.core._invoke[goog.typeOf(x__2363__auto____8501)];
        if(or__3824__auto____8502) {
          return or__3824__auto____8502
        }else {
          var or__3824__auto____8503 = cljs.core._invoke["_"];
          if(or__3824__auto____8503) {
            return or__3824__auto____8503
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g)
    }
  };
  var _invoke__9 = function(this$, a, b, c, d, e, f, g, h) {
    if(function() {
      var and__3822__auto____8504 = this$;
      if(and__3822__auto____8504) {
        return this$.cljs$core$IFn$_invoke$arity$9
      }else {
        return and__3822__auto____8504
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$9(this$, a, b, c, d, e, f, g, h)
    }else {
      var x__2363__auto____8505 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8506 = cljs.core._invoke[goog.typeOf(x__2363__auto____8505)];
        if(or__3824__auto____8506) {
          return or__3824__auto____8506
        }else {
          var or__3824__auto____8507 = cljs.core._invoke["_"];
          if(or__3824__auto____8507) {
            return or__3824__auto____8507
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h)
    }
  };
  var _invoke__10 = function(this$, a, b, c, d, e, f, g, h, i) {
    if(function() {
      var and__3822__auto____8508 = this$;
      if(and__3822__auto____8508) {
        return this$.cljs$core$IFn$_invoke$arity$10
      }else {
        return and__3822__auto____8508
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$10(this$, a, b, c, d, e, f, g, h, i)
    }else {
      var x__2363__auto____8509 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8510 = cljs.core._invoke[goog.typeOf(x__2363__auto____8509)];
        if(or__3824__auto____8510) {
          return or__3824__auto____8510
        }else {
          var or__3824__auto____8511 = cljs.core._invoke["_"];
          if(or__3824__auto____8511) {
            return or__3824__auto____8511
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i)
    }
  };
  var _invoke__11 = function(this$, a, b, c, d, e, f, g, h, i, j) {
    if(function() {
      var and__3822__auto____8512 = this$;
      if(and__3822__auto____8512) {
        return this$.cljs$core$IFn$_invoke$arity$11
      }else {
        return and__3822__auto____8512
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$11(this$, a, b, c, d, e, f, g, h, i, j)
    }else {
      var x__2363__auto____8513 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8514 = cljs.core._invoke[goog.typeOf(x__2363__auto____8513)];
        if(or__3824__auto____8514) {
          return or__3824__auto____8514
        }else {
          var or__3824__auto____8515 = cljs.core._invoke["_"];
          if(or__3824__auto____8515) {
            return or__3824__auto____8515
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j)
    }
  };
  var _invoke__12 = function(this$, a, b, c, d, e, f, g, h, i, j, k) {
    if(function() {
      var and__3822__auto____8516 = this$;
      if(and__3822__auto____8516) {
        return this$.cljs$core$IFn$_invoke$arity$12
      }else {
        return and__3822__auto____8516
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$12(this$, a, b, c, d, e, f, g, h, i, j, k)
    }else {
      var x__2363__auto____8517 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8518 = cljs.core._invoke[goog.typeOf(x__2363__auto____8517)];
        if(or__3824__auto____8518) {
          return or__3824__auto____8518
        }else {
          var or__3824__auto____8519 = cljs.core._invoke["_"];
          if(or__3824__auto____8519) {
            return or__3824__auto____8519
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k)
    }
  };
  var _invoke__13 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l) {
    if(function() {
      var and__3822__auto____8520 = this$;
      if(and__3822__auto____8520) {
        return this$.cljs$core$IFn$_invoke$arity$13
      }else {
        return and__3822__auto____8520
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$13(this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }else {
      var x__2363__auto____8521 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8522 = cljs.core._invoke[goog.typeOf(x__2363__auto____8521)];
        if(or__3824__auto____8522) {
          return or__3824__auto____8522
        }else {
          var or__3824__auto____8523 = cljs.core._invoke["_"];
          if(or__3824__auto____8523) {
            return or__3824__auto____8523
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }
  };
  var _invoke__14 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m) {
    if(function() {
      var and__3822__auto____8524 = this$;
      if(and__3822__auto____8524) {
        return this$.cljs$core$IFn$_invoke$arity$14
      }else {
        return and__3822__auto____8524
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$14(this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }else {
      var x__2363__auto____8525 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8526 = cljs.core._invoke[goog.typeOf(x__2363__auto____8525)];
        if(or__3824__auto____8526) {
          return or__3824__auto____8526
        }else {
          var or__3824__auto____8527 = cljs.core._invoke["_"];
          if(or__3824__auto____8527) {
            return or__3824__auto____8527
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }
  };
  var _invoke__15 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    if(function() {
      var and__3822__auto____8528 = this$;
      if(and__3822__auto____8528) {
        return this$.cljs$core$IFn$_invoke$arity$15
      }else {
        return and__3822__auto____8528
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$15(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }else {
      var x__2363__auto____8529 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8530 = cljs.core._invoke[goog.typeOf(x__2363__auto____8529)];
        if(or__3824__auto____8530) {
          return or__3824__auto____8530
        }else {
          var or__3824__auto____8531 = cljs.core._invoke["_"];
          if(or__3824__auto____8531) {
            return or__3824__auto____8531
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }
  };
  var _invoke__16 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    if(function() {
      var and__3822__auto____8532 = this$;
      if(and__3822__auto____8532) {
        return this$.cljs$core$IFn$_invoke$arity$16
      }else {
        return and__3822__auto____8532
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$16(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }else {
      var x__2363__auto____8533 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8534 = cljs.core._invoke[goog.typeOf(x__2363__auto____8533)];
        if(or__3824__auto____8534) {
          return or__3824__auto____8534
        }else {
          var or__3824__auto____8535 = cljs.core._invoke["_"];
          if(or__3824__auto____8535) {
            return or__3824__auto____8535
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }
  };
  var _invoke__17 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    if(function() {
      var and__3822__auto____8536 = this$;
      if(and__3822__auto____8536) {
        return this$.cljs$core$IFn$_invoke$arity$17
      }else {
        return and__3822__auto____8536
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$17(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }else {
      var x__2363__auto____8537 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8538 = cljs.core._invoke[goog.typeOf(x__2363__auto____8537)];
        if(or__3824__auto____8538) {
          return or__3824__auto____8538
        }else {
          var or__3824__auto____8539 = cljs.core._invoke["_"];
          if(or__3824__auto____8539) {
            return or__3824__auto____8539
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }
  };
  var _invoke__18 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    if(function() {
      var and__3822__auto____8540 = this$;
      if(and__3822__auto____8540) {
        return this$.cljs$core$IFn$_invoke$arity$18
      }else {
        return and__3822__auto____8540
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$18(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }else {
      var x__2363__auto____8541 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8542 = cljs.core._invoke[goog.typeOf(x__2363__auto____8541)];
        if(or__3824__auto____8542) {
          return or__3824__auto____8542
        }else {
          var or__3824__auto____8543 = cljs.core._invoke["_"];
          if(or__3824__auto____8543) {
            return or__3824__auto____8543
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }
  };
  var _invoke__19 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s) {
    if(function() {
      var and__3822__auto____8544 = this$;
      if(and__3822__auto____8544) {
        return this$.cljs$core$IFn$_invoke$arity$19
      }else {
        return and__3822__auto____8544
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$19(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }else {
      var x__2363__auto____8545 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8546 = cljs.core._invoke[goog.typeOf(x__2363__auto____8545)];
        if(or__3824__auto____8546) {
          return or__3824__auto____8546
        }else {
          var or__3824__auto____8547 = cljs.core._invoke["_"];
          if(or__3824__auto____8547) {
            return or__3824__auto____8547
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }
  };
  var _invoke__20 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t) {
    if(function() {
      var and__3822__auto____8548 = this$;
      if(and__3822__auto____8548) {
        return this$.cljs$core$IFn$_invoke$arity$20
      }else {
        return and__3822__auto____8548
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$20(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }else {
      var x__2363__auto____8549 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8550 = cljs.core._invoke[goog.typeOf(x__2363__auto____8549)];
        if(or__3824__auto____8550) {
          return or__3824__auto____8550
        }else {
          var or__3824__auto____8551 = cljs.core._invoke["_"];
          if(or__3824__auto____8551) {
            return or__3824__auto____8551
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }
  };
  var _invoke__21 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    if(function() {
      var and__3822__auto____8552 = this$;
      if(and__3822__auto____8552) {
        return this$.cljs$core$IFn$_invoke$arity$21
      }else {
        return and__3822__auto____8552
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$21(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }else {
      var x__2363__auto____8553 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8554 = cljs.core._invoke[goog.typeOf(x__2363__auto____8553)];
        if(or__3824__auto____8554) {
          return or__3824__auto____8554
        }else {
          var or__3824__auto____8555 = cljs.core._invoke["_"];
          if(or__3824__auto____8555) {
            return or__3824__auto____8555
          }else {
            throw cljs.core.missing_protocol("IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
  };
  _invoke = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    switch(arguments.length) {
      case 1:
        return _invoke__1.call(this, this$);
      case 2:
        return _invoke__2.call(this, this$, a);
      case 3:
        return _invoke__3.call(this, this$, a, b);
      case 4:
        return _invoke__4.call(this, this$, a, b, c);
      case 5:
        return _invoke__5.call(this, this$, a, b, c, d);
      case 6:
        return _invoke__6.call(this, this$, a, b, c, d, e);
      case 7:
        return _invoke__7.call(this, this$, a, b, c, d, e, f);
      case 8:
        return _invoke__8.call(this, this$, a, b, c, d, e, f, g);
      case 9:
        return _invoke__9.call(this, this$, a, b, c, d, e, f, g, h);
      case 10:
        return _invoke__10.call(this, this$, a, b, c, d, e, f, g, h, i);
      case 11:
        return _invoke__11.call(this, this$, a, b, c, d, e, f, g, h, i, j);
      case 12:
        return _invoke__12.call(this, this$, a, b, c, d, e, f, g, h, i, j, k);
      case 13:
        return _invoke__13.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l);
      case 14:
        return _invoke__14.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m);
      case 15:
        return _invoke__15.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n);
      case 16:
        return _invoke__16.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
      case 17:
        return _invoke__17.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
      case 18:
        return _invoke__18.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q);
      case 19:
        return _invoke__19.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s);
      case 20:
        return _invoke__20.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t);
      case 21:
        return _invoke__21.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _invoke.cljs$lang$arity$1 = _invoke__1;
  _invoke.cljs$lang$arity$2 = _invoke__2;
  _invoke.cljs$lang$arity$3 = _invoke__3;
  _invoke.cljs$lang$arity$4 = _invoke__4;
  _invoke.cljs$lang$arity$5 = _invoke__5;
  _invoke.cljs$lang$arity$6 = _invoke__6;
  _invoke.cljs$lang$arity$7 = _invoke__7;
  _invoke.cljs$lang$arity$8 = _invoke__8;
  _invoke.cljs$lang$arity$9 = _invoke__9;
  _invoke.cljs$lang$arity$10 = _invoke__10;
  _invoke.cljs$lang$arity$11 = _invoke__11;
  _invoke.cljs$lang$arity$12 = _invoke__12;
  _invoke.cljs$lang$arity$13 = _invoke__13;
  _invoke.cljs$lang$arity$14 = _invoke__14;
  _invoke.cljs$lang$arity$15 = _invoke__15;
  _invoke.cljs$lang$arity$16 = _invoke__16;
  _invoke.cljs$lang$arity$17 = _invoke__17;
  _invoke.cljs$lang$arity$18 = _invoke__18;
  _invoke.cljs$lang$arity$19 = _invoke__19;
  _invoke.cljs$lang$arity$20 = _invoke__20;
  _invoke.cljs$lang$arity$21 = _invoke__21;
  return _invoke
}();
cljs.core.ICounted = {};
cljs.core._count = function _count(coll) {
  if(function() {
    var and__3822__auto____8560 = coll;
    if(and__3822__auto____8560) {
      return coll.cljs$core$ICounted$_count$arity$1
    }else {
      return and__3822__auto____8560
    }
  }()) {
    return coll.cljs$core$ICounted$_count$arity$1(coll)
  }else {
    var x__2363__auto____8561 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8562 = cljs.core._count[goog.typeOf(x__2363__auto____8561)];
      if(or__3824__auto____8562) {
        return or__3824__auto____8562
      }else {
        var or__3824__auto____8563 = cljs.core._count["_"];
        if(or__3824__auto____8563) {
          return or__3824__auto____8563
        }else {
          throw cljs.core.missing_protocol("ICounted.-count", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IEmptyableCollection = {};
cljs.core._empty = function _empty(coll) {
  if(function() {
    var and__3822__auto____8568 = coll;
    if(and__3822__auto____8568) {
      return coll.cljs$core$IEmptyableCollection$_empty$arity$1
    }else {
      return and__3822__auto____8568
    }
  }()) {
    return coll.cljs$core$IEmptyableCollection$_empty$arity$1(coll)
  }else {
    var x__2363__auto____8569 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8570 = cljs.core._empty[goog.typeOf(x__2363__auto____8569)];
      if(or__3824__auto____8570) {
        return or__3824__auto____8570
      }else {
        var or__3824__auto____8571 = cljs.core._empty["_"];
        if(or__3824__auto____8571) {
          return or__3824__auto____8571
        }else {
          throw cljs.core.missing_protocol("IEmptyableCollection.-empty", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ICollection = {};
cljs.core._conj = function _conj(coll, o) {
  if(function() {
    var and__3822__auto____8576 = coll;
    if(and__3822__auto____8576) {
      return coll.cljs$core$ICollection$_conj$arity$2
    }else {
      return and__3822__auto____8576
    }
  }()) {
    return coll.cljs$core$ICollection$_conj$arity$2(coll, o)
  }else {
    var x__2363__auto____8577 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8578 = cljs.core._conj[goog.typeOf(x__2363__auto____8577)];
      if(or__3824__auto____8578) {
        return or__3824__auto____8578
      }else {
        var or__3824__auto____8579 = cljs.core._conj["_"];
        if(or__3824__auto____8579) {
          return or__3824__auto____8579
        }else {
          throw cljs.core.missing_protocol("ICollection.-conj", coll);
        }
      }
    }().call(null, coll, o)
  }
};
cljs.core.IIndexed = {};
cljs.core._nth = function() {
  var _nth = null;
  var _nth__2 = function(coll, n) {
    if(function() {
      var and__3822__auto____8588 = coll;
      if(and__3822__auto____8588) {
        return coll.cljs$core$IIndexed$_nth$arity$2
      }else {
        return and__3822__auto____8588
      }
    }()) {
      return coll.cljs$core$IIndexed$_nth$arity$2(coll, n)
    }else {
      var x__2363__auto____8589 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____8590 = cljs.core._nth[goog.typeOf(x__2363__auto____8589)];
        if(or__3824__auto____8590) {
          return or__3824__auto____8590
        }else {
          var or__3824__auto____8591 = cljs.core._nth["_"];
          if(or__3824__auto____8591) {
            return or__3824__auto____8591
          }else {
            throw cljs.core.missing_protocol("IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n)
    }
  };
  var _nth__3 = function(coll, n, not_found) {
    if(function() {
      var and__3822__auto____8592 = coll;
      if(and__3822__auto____8592) {
        return coll.cljs$core$IIndexed$_nth$arity$3
      }else {
        return and__3822__auto____8592
      }
    }()) {
      return coll.cljs$core$IIndexed$_nth$arity$3(coll, n, not_found)
    }else {
      var x__2363__auto____8593 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____8594 = cljs.core._nth[goog.typeOf(x__2363__auto____8593)];
        if(or__3824__auto____8594) {
          return or__3824__auto____8594
        }else {
          var or__3824__auto____8595 = cljs.core._nth["_"];
          if(or__3824__auto____8595) {
            return or__3824__auto____8595
          }else {
            throw cljs.core.missing_protocol("IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n, not_found)
    }
  };
  _nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return _nth__2.call(this, coll, n);
      case 3:
        return _nth__3.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _nth.cljs$lang$arity$2 = _nth__2;
  _nth.cljs$lang$arity$3 = _nth__3;
  return _nth
}();
cljs.core.ASeq = {};
cljs.core.ISeq = {};
cljs.core._first = function _first(coll) {
  if(function() {
    var and__3822__auto____8600 = coll;
    if(and__3822__auto____8600) {
      return coll.cljs$core$ISeq$_first$arity$1
    }else {
      return and__3822__auto____8600
    }
  }()) {
    return coll.cljs$core$ISeq$_first$arity$1(coll)
  }else {
    var x__2363__auto____8601 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8602 = cljs.core._first[goog.typeOf(x__2363__auto____8601)];
      if(or__3824__auto____8602) {
        return or__3824__auto____8602
      }else {
        var or__3824__auto____8603 = cljs.core._first["_"];
        if(or__3824__auto____8603) {
          return or__3824__auto____8603
        }else {
          throw cljs.core.missing_protocol("ISeq.-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._rest = function _rest(coll) {
  if(function() {
    var and__3822__auto____8608 = coll;
    if(and__3822__auto____8608) {
      return coll.cljs$core$ISeq$_rest$arity$1
    }else {
      return and__3822__auto____8608
    }
  }()) {
    return coll.cljs$core$ISeq$_rest$arity$1(coll)
  }else {
    var x__2363__auto____8609 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8610 = cljs.core._rest[goog.typeOf(x__2363__auto____8609)];
      if(or__3824__auto____8610) {
        return or__3824__auto____8610
      }else {
        var or__3824__auto____8611 = cljs.core._rest["_"];
        if(or__3824__auto____8611) {
          return or__3824__auto____8611
        }else {
          throw cljs.core.missing_protocol("ISeq.-rest", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.INext = {};
cljs.core._next = function _next(coll) {
  if(function() {
    var and__3822__auto____8616 = coll;
    if(and__3822__auto____8616) {
      return coll.cljs$core$INext$_next$arity$1
    }else {
      return and__3822__auto____8616
    }
  }()) {
    return coll.cljs$core$INext$_next$arity$1(coll)
  }else {
    var x__2363__auto____8617 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8618 = cljs.core._next[goog.typeOf(x__2363__auto____8617)];
      if(or__3824__auto____8618) {
        return or__3824__auto____8618
      }else {
        var or__3824__auto____8619 = cljs.core._next["_"];
        if(or__3824__auto____8619) {
          return or__3824__auto____8619
        }else {
          throw cljs.core.missing_protocol("INext.-next", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ILookup = {};
cljs.core._lookup = function() {
  var _lookup = null;
  var _lookup__2 = function(o, k) {
    if(function() {
      var and__3822__auto____8628 = o;
      if(and__3822__auto____8628) {
        return o.cljs$core$ILookup$_lookup$arity$2
      }else {
        return and__3822__auto____8628
      }
    }()) {
      return o.cljs$core$ILookup$_lookup$arity$2(o, k)
    }else {
      var x__2363__auto____8629 = o == null ? null : o;
      return function() {
        var or__3824__auto____8630 = cljs.core._lookup[goog.typeOf(x__2363__auto____8629)];
        if(or__3824__auto____8630) {
          return or__3824__auto____8630
        }else {
          var or__3824__auto____8631 = cljs.core._lookup["_"];
          if(or__3824__auto____8631) {
            return or__3824__auto____8631
          }else {
            throw cljs.core.missing_protocol("ILookup.-lookup", o);
          }
        }
      }().call(null, o, k)
    }
  };
  var _lookup__3 = function(o, k, not_found) {
    if(function() {
      var and__3822__auto____8632 = o;
      if(and__3822__auto____8632) {
        return o.cljs$core$ILookup$_lookup$arity$3
      }else {
        return and__3822__auto____8632
      }
    }()) {
      return o.cljs$core$ILookup$_lookup$arity$3(o, k, not_found)
    }else {
      var x__2363__auto____8633 = o == null ? null : o;
      return function() {
        var or__3824__auto____8634 = cljs.core._lookup[goog.typeOf(x__2363__auto____8633)];
        if(or__3824__auto____8634) {
          return or__3824__auto____8634
        }else {
          var or__3824__auto____8635 = cljs.core._lookup["_"];
          if(or__3824__auto____8635) {
            return or__3824__auto____8635
          }else {
            throw cljs.core.missing_protocol("ILookup.-lookup", o);
          }
        }
      }().call(null, o, k, not_found)
    }
  };
  _lookup = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return _lookup__2.call(this, o, k);
      case 3:
        return _lookup__3.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _lookup.cljs$lang$arity$2 = _lookup__2;
  _lookup.cljs$lang$arity$3 = _lookup__3;
  return _lookup
}();
cljs.core.IAssociative = {};
cljs.core._contains_key_QMARK_ = function _contains_key_QMARK_(coll, k) {
  if(function() {
    var and__3822__auto____8640 = coll;
    if(and__3822__auto____8640) {
      return coll.cljs$core$IAssociative$_contains_key_QMARK_$arity$2
    }else {
      return and__3822__auto____8640
    }
  }()) {
    return coll.cljs$core$IAssociative$_contains_key_QMARK_$arity$2(coll, k)
  }else {
    var x__2363__auto____8641 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8642 = cljs.core._contains_key_QMARK_[goog.typeOf(x__2363__auto____8641)];
      if(or__3824__auto____8642) {
        return or__3824__auto____8642
      }else {
        var or__3824__auto____8643 = cljs.core._contains_key_QMARK_["_"];
        if(or__3824__auto____8643) {
          return or__3824__auto____8643
        }else {
          throw cljs.core.missing_protocol("IAssociative.-contains-key?", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core._assoc = function _assoc(coll, k, v) {
  if(function() {
    var and__3822__auto____8648 = coll;
    if(and__3822__auto____8648) {
      return coll.cljs$core$IAssociative$_assoc$arity$3
    }else {
      return and__3822__auto____8648
    }
  }()) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, k, v)
  }else {
    var x__2363__auto____8649 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8650 = cljs.core._assoc[goog.typeOf(x__2363__auto____8649)];
      if(or__3824__auto____8650) {
        return or__3824__auto____8650
      }else {
        var or__3824__auto____8651 = cljs.core._assoc["_"];
        if(or__3824__auto____8651) {
          return or__3824__auto____8651
        }else {
          throw cljs.core.missing_protocol("IAssociative.-assoc", coll);
        }
      }
    }().call(null, coll, k, v)
  }
};
cljs.core.IMap = {};
cljs.core._dissoc = function _dissoc(coll, k) {
  if(function() {
    var and__3822__auto____8656 = coll;
    if(and__3822__auto____8656) {
      return coll.cljs$core$IMap$_dissoc$arity$2
    }else {
      return and__3822__auto____8656
    }
  }()) {
    return coll.cljs$core$IMap$_dissoc$arity$2(coll, k)
  }else {
    var x__2363__auto____8657 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8658 = cljs.core._dissoc[goog.typeOf(x__2363__auto____8657)];
      if(or__3824__auto____8658) {
        return or__3824__auto____8658
      }else {
        var or__3824__auto____8659 = cljs.core._dissoc["_"];
        if(or__3824__auto____8659) {
          return or__3824__auto____8659
        }else {
          throw cljs.core.missing_protocol("IMap.-dissoc", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core.IMapEntry = {};
cljs.core._key = function _key(coll) {
  if(function() {
    var and__3822__auto____8664 = coll;
    if(and__3822__auto____8664) {
      return coll.cljs$core$IMapEntry$_key$arity$1
    }else {
      return and__3822__auto____8664
    }
  }()) {
    return coll.cljs$core$IMapEntry$_key$arity$1(coll)
  }else {
    var x__2363__auto____8665 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8666 = cljs.core._key[goog.typeOf(x__2363__auto____8665)];
      if(or__3824__auto____8666) {
        return or__3824__auto____8666
      }else {
        var or__3824__auto____8667 = cljs.core._key["_"];
        if(or__3824__auto____8667) {
          return or__3824__auto____8667
        }else {
          throw cljs.core.missing_protocol("IMapEntry.-key", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._val = function _val(coll) {
  if(function() {
    var and__3822__auto____8672 = coll;
    if(and__3822__auto____8672) {
      return coll.cljs$core$IMapEntry$_val$arity$1
    }else {
      return and__3822__auto____8672
    }
  }()) {
    return coll.cljs$core$IMapEntry$_val$arity$1(coll)
  }else {
    var x__2363__auto____8673 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8674 = cljs.core._val[goog.typeOf(x__2363__auto____8673)];
      if(or__3824__auto____8674) {
        return or__3824__auto____8674
      }else {
        var or__3824__auto____8675 = cljs.core._val["_"];
        if(or__3824__auto____8675) {
          return or__3824__auto____8675
        }else {
          throw cljs.core.missing_protocol("IMapEntry.-val", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ISet = {};
cljs.core._disjoin = function _disjoin(coll, v) {
  if(function() {
    var and__3822__auto____8680 = coll;
    if(and__3822__auto____8680) {
      return coll.cljs$core$ISet$_disjoin$arity$2
    }else {
      return and__3822__auto____8680
    }
  }()) {
    return coll.cljs$core$ISet$_disjoin$arity$2(coll, v)
  }else {
    var x__2363__auto____8681 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8682 = cljs.core._disjoin[goog.typeOf(x__2363__auto____8681)];
      if(or__3824__auto____8682) {
        return or__3824__auto____8682
      }else {
        var or__3824__auto____8683 = cljs.core._disjoin["_"];
        if(or__3824__auto____8683) {
          return or__3824__auto____8683
        }else {
          throw cljs.core.missing_protocol("ISet.-disjoin", coll);
        }
      }
    }().call(null, coll, v)
  }
};
cljs.core.IStack = {};
cljs.core._peek = function _peek(coll) {
  if(function() {
    var and__3822__auto____8688 = coll;
    if(and__3822__auto____8688) {
      return coll.cljs$core$IStack$_peek$arity$1
    }else {
      return and__3822__auto____8688
    }
  }()) {
    return coll.cljs$core$IStack$_peek$arity$1(coll)
  }else {
    var x__2363__auto____8689 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8690 = cljs.core._peek[goog.typeOf(x__2363__auto____8689)];
      if(or__3824__auto____8690) {
        return or__3824__auto____8690
      }else {
        var or__3824__auto____8691 = cljs.core._peek["_"];
        if(or__3824__auto____8691) {
          return or__3824__auto____8691
        }else {
          throw cljs.core.missing_protocol("IStack.-peek", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._pop = function _pop(coll) {
  if(function() {
    var and__3822__auto____8696 = coll;
    if(and__3822__auto____8696) {
      return coll.cljs$core$IStack$_pop$arity$1
    }else {
      return and__3822__auto____8696
    }
  }()) {
    return coll.cljs$core$IStack$_pop$arity$1(coll)
  }else {
    var x__2363__auto____8697 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8698 = cljs.core._pop[goog.typeOf(x__2363__auto____8697)];
      if(or__3824__auto____8698) {
        return or__3824__auto____8698
      }else {
        var or__3824__auto____8699 = cljs.core._pop["_"];
        if(or__3824__auto____8699) {
          return or__3824__auto____8699
        }else {
          throw cljs.core.missing_protocol("IStack.-pop", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IVector = {};
cljs.core._assoc_n = function _assoc_n(coll, n, val) {
  if(function() {
    var and__3822__auto____8704 = coll;
    if(and__3822__auto____8704) {
      return coll.cljs$core$IVector$_assoc_n$arity$3
    }else {
      return and__3822__auto____8704
    }
  }()) {
    return coll.cljs$core$IVector$_assoc_n$arity$3(coll, n, val)
  }else {
    var x__2363__auto____8705 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8706 = cljs.core._assoc_n[goog.typeOf(x__2363__auto____8705)];
      if(or__3824__auto____8706) {
        return or__3824__auto____8706
      }else {
        var or__3824__auto____8707 = cljs.core._assoc_n["_"];
        if(or__3824__auto____8707) {
          return or__3824__auto____8707
        }else {
          throw cljs.core.missing_protocol("IVector.-assoc-n", coll);
        }
      }
    }().call(null, coll, n, val)
  }
};
cljs.core.IDeref = {};
cljs.core._deref = function _deref(o) {
  if(function() {
    var and__3822__auto____8712 = o;
    if(and__3822__auto____8712) {
      return o.cljs$core$IDeref$_deref$arity$1
    }else {
      return and__3822__auto____8712
    }
  }()) {
    return o.cljs$core$IDeref$_deref$arity$1(o)
  }else {
    var x__2363__auto____8713 = o == null ? null : o;
    return function() {
      var or__3824__auto____8714 = cljs.core._deref[goog.typeOf(x__2363__auto____8713)];
      if(or__3824__auto____8714) {
        return or__3824__auto____8714
      }else {
        var or__3824__auto____8715 = cljs.core._deref["_"];
        if(or__3824__auto____8715) {
          return or__3824__auto____8715
        }else {
          throw cljs.core.missing_protocol("IDeref.-deref", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.IDerefWithTimeout = {};
cljs.core._deref_with_timeout = function _deref_with_timeout(o, msec, timeout_val) {
  if(function() {
    var and__3822__auto____8720 = o;
    if(and__3822__auto____8720) {
      return o.cljs$core$IDerefWithTimeout$_deref_with_timeout$arity$3
    }else {
      return and__3822__auto____8720
    }
  }()) {
    return o.cljs$core$IDerefWithTimeout$_deref_with_timeout$arity$3(o, msec, timeout_val)
  }else {
    var x__2363__auto____8721 = o == null ? null : o;
    return function() {
      var or__3824__auto____8722 = cljs.core._deref_with_timeout[goog.typeOf(x__2363__auto____8721)];
      if(or__3824__auto____8722) {
        return or__3824__auto____8722
      }else {
        var or__3824__auto____8723 = cljs.core._deref_with_timeout["_"];
        if(or__3824__auto____8723) {
          return or__3824__auto____8723
        }else {
          throw cljs.core.missing_protocol("IDerefWithTimeout.-deref-with-timeout", o);
        }
      }
    }().call(null, o, msec, timeout_val)
  }
};
cljs.core.IMeta = {};
cljs.core._meta = function _meta(o) {
  if(function() {
    var and__3822__auto____8728 = o;
    if(and__3822__auto____8728) {
      return o.cljs$core$IMeta$_meta$arity$1
    }else {
      return and__3822__auto____8728
    }
  }()) {
    return o.cljs$core$IMeta$_meta$arity$1(o)
  }else {
    var x__2363__auto____8729 = o == null ? null : o;
    return function() {
      var or__3824__auto____8730 = cljs.core._meta[goog.typeOf(x__2363__auto____8729)];
      if(or__3824__auto____8730) {
        return or__3824__auto____8730
      }else {
        var or__3824__auto____8731 = cljs.core._meta["_"];
        if(or__3824__auto____8731) {
          return or__3824__auto____8731
        }else {
          throw cljs.core.missing_protocol("IMeta.-meta", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.IWithMeta = {};
cljs.core._with_meta = function _with_meta(o, meta) {
  if(function() {
    var and__3822__auto____8736 = o;
    if(and__3822__auto____8736) {
      return o.cljs$core$IWithMeta$_with_meta$arity$2
    }else {
      return and__3822__auto____8736
    }
  }()) {
    return o.cljs$core$IWithMeta$_with_meta$arity$2(o, meta)
  }else {
    var x__2363__auto____8737 = o == null ? null : o;
    return function() {
      var or__3824__auto____8738 = cljs.core._with_meta[goog.typeOf(x__2363__auto____8737)];
      if(or__3824__auto____8738) {
        return or__3824__auto____8738
      }else {
        var or__3824__auto____8739 = cljs.core._with_meta["_"];
        if(or__3824__auto____8739) {
          return or__3824__auto____8739
        }else {
          throw cljs.core.missing_protocol("IWithMeta.-with-meta", o);
        }
      }
    }().call(null, o, meta)
  }
};
cljs.core.IReduce = {};
cljs.core._reduce = function() {
  var _reduce = null;
  var _reduce__2 = function(coll, f) {
    if(function() {
      var and__3822__auto____8748 = coll;
      if(and__3822__auto____8748) {
        return coll.cljs$core$IReduce$_reduce$arity$2
      }else {
        return and__3822__auto____8748
      }
    }()) {
      return coll.cljs$core$IReduce$_reduce$arity$2(coll, f)
    }else {
      var x__2363__auto____8749 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____8750 = cljs.core._reduce[goog.typeOf(x__2363__auto____8749)];
        if(or__3824__auto____8750) {
          return or__3824__auto____8750
        }else {
          var or__3824__auto____8751 = cljs.core._reduce["_"];
          if(or__3824__auto____8751) {
            return or__3824__auto____8751
          }else {
            throw cljs.core.missing_protocol("IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f)
    }
  };
  var _reduce__3 = function(coll, f, start) {
    if(function() {
      var and__3822__auto____8752 = coll;
      if(and__3822__auto____8752) {
        return coll.cljs$core$IReduce$_reduce$arity$3
      }else {
        return and__3822__auto____8752
      }
    }()) {
      return coll.cljs$core$IReduce$_reduce$arity$3(coll, f, start)
    }else {
      var x__2363__auto____8753 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____8754 = cljs.core._reduce[goog.typeOf(x__2363__auto____8753)];
        if(or__3824__auto____8754) {
          return or__3824__auto____8754
        }else {
          var or__3824__auto____8755 = cljs.core._reduce["_"];
          if(or__3824__auto____8755) {
            return or__3824__auto____8755
          }else {
            throw cljs.core.missing_protocol("IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f, start)
    }
  };
  _reduce = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return _reduce__2.call(this, coll, f);
      case 3:
        return _reduce__3.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _reduce.cljs$lang$arity$2 = _reduce__2;
  _reduce.cljs$lang$arity$3 = _reduce__3;
  return _reduce
}();
cljs.core.IKVReduce = {};
cljs.core._kv_reduce = function _kv_reduce(coll, f, init) {
  if(function() {
    var and__3822__auto____8760 = coll;
    if(and__3822__auto____8760) {
      return coll.cljs$core$IKVReduce$_kv_reduce$arity$3
    }else {
      return and__3822__auto____8760
    }
  }()) {
    return coll.cljs$core$IKVReduce$_kv_reduce$arity$3(coll, f, init)
  }else {
    var x__2363__auto____8761 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8762 = cljs.core._kv_reduce[goog.typeOf(x__2363__auto____8761)];
      if(or__3824__auto____8762) {
        return or__3824__auto____8762
      }else {
        var or__3824__auto____8763 = cljs.core._kv_reduce["_"];
        if(or__3824__auto____8763) {
          return or__3824__auto____8763
        }else {
          throw cljs.core.missing_protocol("IKVReduce.-kv-reduce", coll);
        }
      }
    }().call(null, coll, f, init)
  }
};
cljs.core.IEquiv = {};
cljs.core._equiv = function _equiv(o, other) {
  if(function() {
    var and__3822__auto____8768 = o;
    if(and__3822__auto____8768) {
      return o.cljs$core$IEquiv$_equiv$arity$2
    }else {
      return and__3822__auto____8768
    }
  }()) {
    return o.cljs$core$IEquiv$_equiv$arity$2(o, other)
  }else {
    var x__2363__auto____8769 = o == null ? null : o;
    return function() {
      var or__3824__auto____8770 = cljs.core._equiv[goog.typeOf(x__2363__auto____8769)];
      if(or__3824__auto____8770) {
        return or__3824__auto____8770
      }else {
        var or__3824__auto____8771 = cljs.core._equiv["_"];
        if(or__3824__auto____8771) {
          return or__3824__auto____8771
        }else {
          throw cljs.core.missing_protocol("IEquiv.-equiv", o);
        }
      }
    }().call(null, o, other)
  }
};
cljs.core.IHash = {};
cljs.core._hash = function _hash(o) {
  if(function() {
    var and__3822__auto____8776 = o;
    if(and__3822__auto____8776) {
      return o.cljs$core$IHash$_hash$arity$1
    }else {
      return and__3822__auto____8776
    }
  }()) {
    return o.cljs$core$IHash$_hash$arity$1(o)
  }else {
    var x__2363__auto____8777 = o == null ? null : o;
    return function() {
      var or__3824__auto____8778 = cljs.core._hash[goog.typeOf(x__2363__auto____8777)];
      if(or__3824__auto____8778) {
        return or__3824__auto____8778
      }else {
        var or__3824__auto____8779 = cljs.core._hash["_"];
        if(or__3824__auto____8779) {
          return or__3824__auto____8779
        }else {
          throw cljs.core.missing_protocol("IHash.-hash", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.ISeqable = {};
cljs.core._seq = function _seq(o) {
  if(function() {
    var and__3822__auto____8784 = o;
    if(and__3822__auto____8784) {
      return o.cljs$core$ISeqable$_seq$arity$1
    }else {
      return and__3822__auto____8784
    }
  }()) {
    return o.cljs$core$ISeqable$_seq$arity$1(o)
  }else {
    var x__2363__auto____8785 = o == null ? null : o;
    return function() {
      var or__3824__auto____8786 = cljs.core._seq[goog.typeOf(x__2363__auto____8785)];
      if(or__3824__auto____8786) {
        return or__3824__auto____8786
      }else {
        var or__3824__auto____8787 = cljs.core._seq["_"];
        if(or__3824__auto____8787) {
          return or__3824__auto____8787
        }else {
          throw cljs.core.missing_protocol("ISeqable.-seq", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.ISequential = {};
cljs.core.IList = {};
cljs.core.IRecord = {};
cljs.core.IReversible = {};
cljs.core._rseq = function _rseq(coll) {
  if(function() {
    var and__3822__auto____8792 = coll;
    if(and__3822__auto____8792) {
      return coll.cljs$core$IReversible$_rseq$arity$1
    }else {
      return and__3822__auto____8792
    }
  }()) {
    return coll.cljs$core$IReversible$_rseq$arity$1(coll)
  }else {
    var x__2363__auto____8793 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8794 = cljs.core._rseq[goog.typeOf(x__2363__auto____8793)];
      if(or__3824__auto____8794) {
        return or__3824__auto____8794
      }else {
        var or__3824__auto____8795 = cljs.core._rseq["_"];
        if(or__3824__auto____8795) {
          return or__3824__auto____8795
        }else {
          throw cljs.core.missing_protocol("IReversible.-rseq", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ISorted = {};
cljs.core._sorted_seq = function _sorted_seq(coll, ascending_QMARK_) {
  if(function() {
    var and__3822__auto____8800 = coll;
    if(and__3822__auto____8800) {
      return coll.cljs$core$ISorted$_sorted_seq$arity$2
    }else {
      return and__3822__auto____8800
    }
  }()) {
    return coll.cljs$core$ISorted$_sorted_seq$arity$2(coll, ascending_QMARK_)
  }else {
    var x__2363__auto____8801 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8802 = cljs.core._sorted_seq[goog.typeOf(x__2363__auto____8801)];
      if(or__3824__auto____8802) {
        return or__3824__auto____8802
      }else {
        var or__3824__auto____8803 = cljs.core._sorted_seq["_"];
        if(or__3824__auto____8803) {
          return or__3824__auto____8803
        }else {
          throw cljs.core.missing_protocol("ISorted.-sorted-seq", coll);
        }
      }
    }().call(null, coll, ascending_QMARK_)
  }
};
cljs.core._sorted_seq_from = function _sorted_seq_from(coll, k, ascending_QMARK_) {
  if(function() {
    var and__3822__auto____8808 = coll;
    if(and__3822__auto____8808) {
      return coll.cljs$core$ISorted$_sorted_seq_from$arity$3
    }else {
      return and__3822__auto____8808
    }
  }()) {
    return coll.cljs$core$ISorted$_sorted_seq_from$arity$3(coll, k, ascending_QMARK_)
  }else {
    var x__2363__auto____8809 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8810 = cljs.core._sorted_seq_from[goog.typeOf(x__2363__auto____8809)];
      if(or__3824__auto____8810) {
        return or__3824__auto____8810
      }else {
        var or__3824__auto____8811 = cljs.core._sorted_seq_from["_"];
        if(or__3824__auto____8811) {
          return or__3824__auto____8811
        }else {
          throw cljs.core.missing_protocol("ISorted.-sorted-seq-from", coll);
        }
      }
    }().call(null, coll, k, ascending_QMARK_)
  }
};
cljs.core._entry_key = function _entry_key(coll, entry) {
  if(function() {
    var and__3822__auto____8816 = coll;
    if(and__3822__auto____8816) {
      return coll.cljs$core$ISorted$_entry_key$arity$2
    }else {
      return and__3822__auto____8816
    }
  }()) {
    return coll.cljs$core$ISorted$_entry_key$arity$2(coll, entry)
  }else {
    var x__2363__auto____8817 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8818 = cljs.core._entry_key[goog.typeOf(x__2363__auto____8817)];
      if(or__3824__auto____8818) {
        return or__3824__auto____8818
      }else {
        var or__3824__auto____8819 = cljs.core._entry_key["_"];
        if(or__3824__auto____8819) {
          return or__3824__auto____8819
        }else {
          throw cljs.core.missing_protocol("ISorted.-entry-key", coll);
        }
      }
    }().call(null, coll, entry)
  }
};
cljs.core._comparator = function _comparator(coll) {
  if(function() {
    var and__3822__auto____8824 = coll;
    if(and__3822__auto____8824) {
      return coll.cljs$core$ISorted$_comparator$arity$1
    }else {
      return and__3822__auto____8824
    }
  }()) {
    return coll.cljs$core$ISorted$_comparator$arity$1(coll)
  }else {
    var x__2363__auto____8825 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8826 = cljs.core._comparator[goog.typeOf(x__2363__auto____8825)];
      if(or__3824__auto____8826) {
        return or__3824__auto____8826
      }else {
        var or__3824__auto____8827 = cljs.core._comparator["_"];
        if(or__3824__auto____8827) {
          return or__3824__auto____8827
        }else {
          throw cljs.core.missing_protocol("ISorted.-comparator", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IPrintable = {};
cljs.core._pr_seq = function _pr_seq(o, opts) {
  if(function() {
    var and__3822__auto____8832 = o;
    if(and__3822__auto____8832) {
      return o.cljs$core$IPrintable$_pr_seq$arity$2
    }else {
      return and__3822__auto____8832
    }
  }()) {
    return o.cljs$core$IPrintable$_pr_seq$arity$2(o, opts)
  }else {
    var x__2363__auto____8833 = o == null ? null : o;
    return function() {
      var or__3824__auto____8834 = cljs.core._pr_seq[goog.typeOf(x__2363__auto____8833)];
      if(or__3824__auto____8834) {
        return or__3824__auto____8834
      }else {
        var or__3824__auto____8835 = cljs.core._pr_seq["_"];
        if(or__3824__auto____8835) {
          return or__3824__auto____8835
        }else {
          throw cljs.core.missing_protocol("IPrintable.-pr-seq", o);
        }
      }
    }().call(null, o, opts)
  }
};
cljs.core.IPending = {};
cljs.core._realized_QMARK_ = function _realized_QMARK_(d) {
  if(function() {
    var and__3822__auto____8840 = d;
    if(and__3822__auto____8840) {
      return d.cljs$core$IPending$_realized_QMARK_$arity$1
    }else {
      return and__3822__auto____8840
    }
  }()) {
    return d.cljs$core$IPending$_realized_QMARK_$arity$1(d)
  }else {
    var x__2363__auto____8841 = d == null ? null : d;
    return function() {
      var or__3824__auto____8842 = cljs.core._realized_QMARK_[goog.typeOf(x__2363__auto____8841)];
      if(or__3824__auto____8842) {
        return or__3824__auto____8842
      }else {
        var or__3824__auto____8843 = cljs.core._realized_QMARK_["_"];
        if(or__3824__auto____8843) {
          return or__3824__auto____8843
        }else {
          throw cljs.core.missing_protocol("IPending.-realized?", d);
        }
      }
    }().call(null, d)
  }
};
cljs.core.IWatchable = {};
cljs.core._notify_watches = function _notify_watches(this$, oldval, newval) {
  if(function() {
    var and__3822__auto____8848 = this$;
    if(and__3822__auto____8848) {
      return this$.cljs$core$IWatchable$_notify_watches$arity$3
    }else {
      return and__3822__auto____8848
    }
  }()) {
    return this$.cljs$core$IWatchable$_notify_watches$arity$3(this$, oldval, newval)
  }else {
    var x__2363__auto____8849 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____8850 = cljs.core._notify_watches[goog.typeOf(x__2363__auto____8849)];
      if(or__3824__auto____8850) {
        return or__3824__auto____8850
      }else {
        var or__3824__auto____8851 = cljs.core._notify_watches["_"];
        if(or__3824__auto____8851) {
          return or__3824__auto____8851
        }else {
          throw cljs.core.missing_protocol("IWatchable.-notify-watches", this$);
        }
      }
    }().call(null, this$, oldval, newval)
  }
};
cljs.core._add_watch = function _add_watch(this$, key, f) {
  if(function() {
    var and__3822__auto____8856 = this$;
    if(and__3822__auto____8856) {
      return this$.cljs$core$IWatchable$_add_watch$arity$3
    }else {
      return and__3822__auto____8856
    }
  }()) {
    return this$.cljs$core$IWatchable$_add_watch$arity$3(this$, key, f)
  }else {
    var x__2363__auto____8857 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____8858 = cljs.core._add_watch[goog.typeOf(x__2363__auto____8857)];
      if(or__3824__auto____8858) {
        return or__3824__auto____8858
      }else {
        var or__3824__auto____8859 = cljs.core._add_watch["_"];
        if(or__3824__auto____8859) {
          return or__3824__auto____8859
        }else {
          throw cljs.core.missing_protocol("IWatchable.-add-watch", this$);
        }
      }
    }().call(null, this$, key, f)
  }
};
cljs.core._remove_watch = function _remove_watch(this$, key) {
  if(function() {
    var and__3822__auto____8864 = this$;
    if(and__3822__auto____8864) {
      return this$.cljs$core$IWatchable$_remove_watch$arity$2
    }else {
      return and__3822__auto____8864
    }
  }()) {
    return this$.cljs$core$IWatchable$_remove_watch$arity$2(this$, key)
  }else {
    var x__2363__auto____8865 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____8866 = cljs.core._remove_watch[goog.typeOf(x__2363__auto____8865)];
      if(or__3824__auto____8866) {
        return or__3824__auto____8866
      }else {
        var or__3824__auto____8867 = cljs.core._remove_watch["_"];
        if(or__3824__auto____8867) {
          return or__3824__auto____8867
        }else {
          throw cljs.core.missing_protocol("IWatchable.-remove-watch", this$);
        }
      }
    }().call(null, this$, key)
  }
};
cljs.core.IEditableCollection = {};
cljs.core._as_transient = function _as_transient(coll) {
  if(function() {
    var and__3822__auto____8872 = coll;
    if(and__3822__auto____8872) {
      return coll.cljs$core$IEditableCollection$_as_transient$arity$1
    }else {
      return and__3822__auto____8872
    }
  }()) {
    return coll.cljs$core$IEditableCollection$_as_transient$arity$1(coll)
  }else {
    var x__2363__auto____8873 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8874 = cljs.core._as_transient[goog.typeOf(x__2363__auto____8873)];
      if(or__3824__auto____8874) {
        return or__3824__auto____8874
      }else {
        var or__3824__auto____8875 = cljs.core._as_transient["_"];
        if(or__3824__auto____8875) {
          return or__3824__auto____8875
        }else {
          throw cljs.core.missing_protocol("IEditableCollection.-as-transient", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ITransientCollection = {};
cljs.core._conj_BANG_ = function _conj_BANG_(tcoll, val) {
  if(function() {
    var and__3822__auto____8880 = tcoll;
    if(and__3822__auto____8880) {
      return tcoll.cljs$core$ITransientCollection$_conj_BANG_$arity$2
    }else {
      return and__3822__auto____8880
    }
  }()) {
    return tcoll.cljs$core$ITransientCollection$_conj_BANG_$arity$2(tcoll, val)
  }else {
    var x__2363__auto____8881 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8882 = cljs.core._conj_BANG_[goog.typeOf(x__2363__auto____8881)];
      if(or__3824__auto____8882) {
        return or__3824__auto____8882
      }else {
        var or__3824__auto____8883 = cljs.core._conj_BANG_["_"];
        if(or__3824__auto____8883) {
          return or__3824__auto____8883
        }else {
          throw cljs.core.missing_protocol("ITransientCollection.-conj!", tcoll);
        }
      }
    }().call(null, tcoll, val)
  }
};
cljs.core._persistent_BANG_ = function _persistent_BANG_(tcoll) {
  if(function() {
    var and__3822__auto____8888 = tcoll;
    if(and__3822__auto____8888) {
      return tcoll.cljs$core$ITransientCollection$_persistent_BANG_$arity$1
    }else {
      return and__3822__auto____8888
    }
  }()) {
    return tcoll.cljs$core$ITransientCollection$_persistent_BANG_$arity$1(tcoll)
  }else {
    var x__2363__auto____8889 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8890 = cljs.core._persistent_BANG_[goog.typeOf(x__2363__auto____8889)];
      if(or__3824__auto____8890) {
        return or__3824__auto____8890
      }else {
        var or__3824__auto____8891 = cljs.core._persistent_BANG_["_"];
        if(or__3824__auto____8891) {
          return or__3824__auto____8891
        }else {
          throw cljs.core.missing_protocol("ITransientCollection.-persistent!", tcoll);
        }
      }
    }().call(null, tcoll)
  }
};
cljs.core.ITransientAssociative = {};
cljs.core._assoc_BANG_ = function _assoc_BANG_(tcoll, key, val) {
  if(function() {
    var and__3822__auto____8896 = tcoll;
    if(and__3822__auto____8896) {
      return tcoll.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3
    }else {
      return and__3822__auto____8896
    }
  }()) {
    return tcoll.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3(tcoll, key, val)
  }else {
    var x__2363__auto____8897 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8898 = cljs.core._assoc_BANG_[goog.typeOf(x__2363__auto____8897)];
      if(or__3824__auto____8898) {
        return or__3824__auto____8898
      }else {
        var or__3824__auto____8899 = cljs.core._assoc_BANG_["_"];
        if(or__3824__auto____8899) {
          return or__3824__auto____8899
        }else {
          throw cljs.core.missing_protocol("ITransientAssociative.-assoc!", tcoll);
        }
      }
    }().call(null, tcoll, key, val)
  }
};
cljs.core.ITransientMap = {};
cljs.core._dissoc_BANG_ = function _dissoc_BANG_(tcoll, key) {
  if(function() {
    var and__3822__auto____8904 = tcoll;
    if(and__3822__auto____8904) {
      return tcoll.cljs$core$ITransientMap$_dissoc_BANG_$arity$2
    }else {
      return and__3822__auto____8904
    }
  }()) {
    return tcoll.cljs$core$ITransientMap$_dissoc_BANG_$arity$2(tcoll, key)
  }else {
    var x__2363__auto____8905 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8906 = cljs.core._dissoc_BANG_[goog.typeOf(x__2363__auto____8905)];
      if(or__3824__auto____8906) {
        return or__3824__auto____8906
      }else {
        var or__3824__auto____8907 = cljs.core._dissoc_BANG_["_"];
        if(or__3824__auto____8907) {
          return or__3824__auto____8907
        }else {
          throw cljs.core.missing_protocol("ITransientMap.-dissoc!", tcoll);
        }
      }
    }().call(null, tcoll, key)
  }
};
cljs.core.ITransientVector = {};
cljs.core._assoc_n_BANG_ = function _assoc_n_BANG_(tcoll, n, val) {
  if(function() {
    var and__3822__auto____8912 = tcoll;
    if(and__3822__auto____8912) {
      return tcoll.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3
    }else {
      return and__3822__auto____8912
    }
  }()) {
    return tcoll.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3(tcoll, n, val)
  }else {
    var x__2363__auto____8913 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8914 = cljs.core._assoc_n_BANG_[goog.typeOf(x__2363__auto____8913)];
      if(or__3824__auto____8914) {
        return or__3824__auto____8914
      }else {
        var or__3824__auto____8915 = cljs.core._assoc_n_BANG_["_"];
        if(or__3824__auto____8915) {
          return or__3824__auto____8915
        }else {
          throw cljs.core.missing_protocol("ITransientVector.-assoc-n!", tcoll);
        }
      }
    }().call(null, tcoll, n, val)
  }
};
cljs.core._pop_BANG_ = function _pop_BANG_(tcoll) {
  if(function() {
    var and__3822__auto____8920 = tcoll;
    if(and__3822__auto____8920) {
      return tcoll.cljs$core$ITransientVector$_pop_BANG_$arity$1
    }else {
      return and__3822__auto____8920
    }
  }()) {
    return tcoll.cljs$core$ITransientVector$_pop_BANG_$arity$1(tcoll)
  }else {
    var x__2363__auto____8921 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8922 = cljs.core._pop_BANG_[goog.typeOf(x__2363__auto____8921)];
      if(or__3824__auto____8922) {
        return or__3824__auto____8922
      }else {
        var or__3824__auto____8923 = cljs.core._pop_BANG_["_"];
        if(or__3824__auto____8923) {
          return or__3824__auto____8923
        }else {
          throw cljs.core.missing_protocol("ITransientVector.-pop!", tcoll);
        }
      }
    }().call(null, tcoll)
  }
};
cljs.core.ITransientSet = {};
cljs.core._disjoin_BANG_ = function _disjoin_BANG_(tcoll, v) {
  if(function() {
    var and__3822__auto____8928 = tcoll;
    if(and__3822__auto____8928) {
      return tcoll.cljs$core$ITransientSet$_disjoin_BANG_$arity$2
    }else {
      return and__3822__auto____8928
    }
  }()) {
    return tcoll.cljs$core$ITransientSet$_disjoin_BANG_$arity$2(tcoll, v)
  }else {
    var x__2363__auto____8929 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8930 = cljs.core._disjoin_BANG_[goog.typeOf(x__2363__auto____8929)];
      if(or__3824__auto____8930) {
        return or__3824__auto____8930
      }else {
        var or__3824__auto____8931 = cljs.core._disjoin_BANG_["_"];
        if(or__3824__auto____8931) {
          return or__3824__auto____8931
        }else {
          throw cljs.core.missing_protocol("ITransientSet.-disjoin!", tcoll);
        }
      }
    }().call(null, tcoll, v)
  }
};
cljs.core.IComparable = {};
cljs.core._compare = function _compare(x, y) {
  if(function() {
    var and__3822__auto____8936 = x;
    if(and__3822__auto____8936) {
      return x.cljs$core$IComparable$_compare$arity$2
    }else {
      return and__3822__auto____8936
    }
  }()) {
    return x.cljs$core$IComparable$_compare$arity$2(x, y)
  }else {
    var x__2363__auto____8937 = x == null ? null : x;
    return function() {
      var or__3824__auto____8938 = cljs.core._compare[goog.typeOf(x__2363__auto____8937)];
      if(or__3824__auto____8938) {
        return or__3824__auto____8938
      }else {
        var or__3824__auto____8939 = cljs.core._compare["_"];
        if(or__3824__auto____8939) {
          return or__3824__auto____8939
        }else {
          throw cljs.core.missing_protocol("IComparable.-compare", x);
        }
      }
    }().call(null, x, y)
  }
};
cljs.core.IChunk = {};
cljs.core._drop_first = function _drop_first(coll) {
  if(function() {
    var and__3822__auto____8944 = coll;
    if(and__3822__auto____8944) {
      return coll.cljs$core$IChunk$_drop_first$arity$1
    }else {
      return and__3822__auto____8944
    }
  }()) {
    return coll.cljs$core$IChunk$_drop_first$arity$1(coll)
  }else {
    var x__2363__auto____8945 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8946 = cljs.core._drop_first[goog.typeOf(x__2363__auto____8945)];
      if(or__3824__auto____8946) {
        return or__3824__auto____8946
      }else {
        var or__3824__auto____8947 = cljs.core._drop_first["_"];
        if(or__3824__auto____8947) {
          return or__3824__auto____8947
        }else {
          throw cljs.core.missing_protocol("IChunk.-drop-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IChunkedSeq = {};
cljs.core._chunked_first = function _chunked_first(coll) {
  if(function() {
    var and__3822__auto____8952 = coll;
    if(and__3822__auto____8952) {
      return coll.cljs$core$IChunkedSeq$_chunked_first$arity$1
    }else {
      return and__3822__auto____8952
    }
  }()) {
    return coll.cljs$core$IChunkedSeq$_chunked_first$arity$1(coll)
  }else {
    var x__2363__auto____8953 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8954 = cljs.core._chunked_first[goog.typeOf(x__2363__auto____8953)];
      if(or__3824__auto____8954) {
        return or__3824__auto____8954
      }else {
        var or__3824__auto____8955 = cljs.core._chunked_first["_"];
        if(or__3824__auto____8955) {
          return or__3824__auto____8955
        }else {
          throw cljs.core.missing_protocol("IChunkedSeq.-chunked-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._chunked_rest = function _chunked_rest(coll) {
  if(function() {
    var and__3822__auto____8960 = coll;
    if(and__3822__auto____8960) {
      return coll.cljs$core$IChunkedSeq$_chunked_rest$arity$1
    }else {
      return and__3822__auto____8960
    }
  }()) {
    return coll.cljs$core$IChunkedSeq$_chunked_rest$arity$1(coll)
  }else {
    var x__2363__auto____8961 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8962 = cljs.core._chunked_rest[goog.typeOf(x__2363__auto____8961)];
      if(or__3824__auto____8962) {
        return or__3824__auto____8962
      }else {
        var or__3824__auto____8963 = cljs.core._chunked_rest["_"];
        if(or__3824__auto____8963) {
          return or__3824__auto____8963
        }else {
          throw cljs.core.missing_protocol("IChunkedSeq.-chunked-rest", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IChunkedNext = {};
cljs.core._chunked_next = function _chunked_next(coll) {
  if(function() {
    var and__3822__auto____8968 = coll;
    if(and__3822__auto____8968) {
      return coll.cljs$core$IChunkedNext$_chunked_next$arity$1
    }else {
      return and__3822__auto____8968
    }
  }()) {
    return coll.cljs$core$IChunkedNext$_chunked_next$arity$1(coll)
  }else {
    var x__2363__auto____8969 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8970 = cljs.core._chunked_next[goog.typeOf(x__2363__auto____8969)];
      if(or__3824__auto____8970) {
        return or__3824__auto____8970
      }else {
        var or__3824__auto____8971 = cljs.core._chunked_next["_"];
        if(or__3824__auto____8971) {
          return or__3824__auto____8971
        }else {
          throw cljs.core.missing_protocol("IChunkedNext.-chunked-next", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.identical_QMARK_ = function identical_QMARK_(x, y) {
  return x === y
};
cljs.core._EQ_ = function() {
  var _EQ_ = null;
  var _EQ___1 = function(x) {
    return true
  };
  var _EQ___2 = function(x, y) {
    var or__3824__auto____8973 = x === y;
    if(or__3824__auto____8973) {
      return or__3824__auto____8973
    }else {
      return cljs.core._equiv(x, y)
    }
  };
  var _EQ___3 = function() {
    var G__8974__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ_.cljs$lang$arity$2(x, y))) {
          if(cljs.core.next(more)) {
            var G__8975 = y;
            var G__8976 = cljs.core.first(more);
            var G__8977 = cljs.core.next(more);
            x = G__8975;
            y = G__8976;
            more = G__8977;
            continue
          }else {
            return _EQ_.cljs$lang$arity$2(y, cljs.core.first(more))
          }
        }else {
          return false
        }
        break
      }
    };
    var G__8974 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__8974__delegate.call(this, x, y, more)
    };
    G__8974.cljs$lang$maxFixedArity = 2;
    G__8974.cljs$lang$applyTo = function(arglist__8978) {
      var x = cljs.core.first(arglist__8978);
      var y = cljs.core.first(cljs.core.next(arglist__8978));
      var more = cljs.core.rest(cljs.core.next(arglist__8978));
      return G__8974__delegate(x, y, more)
    };
    G__8974.cljs$lang$arity$variadic = G__8974__delegate;
    return G__8974
  }();
  _EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _EQ___1.call(this, x);
      case 2:
        return _EQ___2.call(this, x, y);
      default:
        return _EQ___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _EQ_.cljs$lang$maxFixedArity = 2;
  _EQ_.cljs$lang$applyTo = _EQ___3.cljs$lang$applyTo;
  _EQ_.cljs$lang$arity$1 = _EQ___1;
  _EQ_.cljs$lang$arity$2 = _EQ___2;
  _EQ_.cljs$lang$arity$variadic = _EQ___3.cljs$lang$arity$variadic;
  return _EQ_
}();
cljs.core.nil_QMARK_ = function nil_QMARK_(x) {
  return x == null
};
cljs.core.type = function type(x) {
  if(x == null) {
    return null
  }else {
    return x.constructor
  }
};
cljs.core.instance_QMARK_ = function instance_QMARK_(t, o) {
  return o instanceof t
};
cljs.core.IHash["null"] = true;
cljs.core._hash["null"] = function(o) {
  return 0
};
cljs.core.ILookup["null"] = true;
cljs.core._lookup["null"] = function() {
  var G__8979 = null;
  var G__8979__2 = function(o, k) {
    return null
  };
  var G__8979__3 = function(o, k, not_found) {
    return not_found
  };
  G__8979 = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8979__2.call(this, o, k);
      case 3:
        return G__8979__3.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8979
}();
cljs.core.IAssociative["null"] = true;
cljs.core._assoc["null"] = function(_, k, v) {
  return cljs.core.hash_map.cljs$lang$arity$variadic(cljs.core.array_seq([k, v], 0))
};
cljs.core.INext["null"] = true;
cljs.core._next["null"] = function(_) {
  return null
};
cljs.core.ICollection["null"] = true;
cljs.core._conj["null"] = function(_, o) {
  return cljs.core.list.cljs$lang$arity$1(o)
};
cljs.core.IReduce["null"] = true;
cljs.core._reduce["null"] = function() {
  var G__8980 = null;
  var G__8980__2 = function(_, f) {
    return f.cljs$lang$arity$0 ? f.cljs$lang$arity$0() : f.call(null)
  };
  var G__8980__3 = function(_, f, start) {
    return start
  };
  G__8980 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__8980__2.call(this, _, f);
      case 3:
        return G__8980__3.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8980
}();
cljs.core.IPrintable["null"] = true;
cljs.core._pr_seq["null"] = function(o) {
  return cljs.core.list.cljs$lang$arity$1("nil")
};
cljs.core.ISet["null"] = true;
cljs.core._disjoin["null"] = function(_, v) {
  return null
};
cljs.core.ICounted["null"] = true;
cljs.core._count["null"] = function(_) {
  return 0
};
cljs.core.IStack["null"] = true;
cljs.core._peek["null"] = function(_) {
  return null
};
cljs.core._pop["null"] = function(_) {
  return null
};
cljs.core.ISeq["null"] = true;
cljs.core._first["null"] = function(_) {
  return null
};
cljs.core._rest["null"] = function(_) {
  return cljs.core.list.cljs$lang$arity$0()
};
cljs.core.IEquiv["null"] = true;
cljs.core._equiv["null"] = function(_, o) {
  return o == null
};
cljs.core.IWithMeta["null"] = true;
cljs.core._with_meta["null"] = function(_, meta) {
  return null
};
cljs.core.IMeta["null"] = true;
cljs.core._meta["null"] = function(_) {
  return null
};
cljs.core.IIndexed["null"] = true;
cljs.core._nth["null"] = function() {
  var G__8981 = null;
  var G__8981__2 = function(_, n) {
    return null
  };
  var G__8981__3 = function(_, n, not_found) {
    return not_found
  };
  G__8981 = function(_, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8981__2.call(this, _, n);
      case 3:
        return G__8981__3.call(this, _, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8981
}();
cljs.core.IEmptyableCollection["null"] = true;
cljs.core._empty["null"] = function(_) {
  return null
};
cljs.core.IMap["null"] = true;
cljs.core._dissoc["null"] = function(_, k) {
  return null
};
Date.prototype.cljs$core$IEquiv$ = true;
Date.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(o, other) {
  var and__3822__auto____8982 = cljs.core.instance_QMARK_(Date, other);
  if(and__3822__auto____8982) {
    return o.toString() === other.toString()
  }else {
    return and__3822__auto____8982
  }
};
cljs.core.IHash["number"] = true;
cljs.core._hash["number"] = function(o) {
  return o
};
cljs.core.IEquiv["number"] = true;
cljs.core._equiv["number"] = function(x, o) {
  return x === o
};
cljs.core.IHash["boolean"] = true;
cljs.core._hash["boolean"] = function(o) {
  if(o === true) {
    return 1
  }else {
    return 0
  }
};
cljs.core.IHash["_"] = true;
cljs.core._hash["_"] = function(o) {
  return goog.getUid(o)
};
cljs.core.inc = function inc(x) {
  return x + 1
};
cljs.core.ci_reduce = function() {
  var ci_reduce = null;
  var ci_reduce__2 = function(cicoll, f) {
    var cnt__8995 = cljs.core._count(cicoll);
    if(cnt__8995 === 0) {
      return f.cljs$lang$arity$0 ? f.cljs$lang$arity$0() : f.call(null)
    }else {
      var val__8996 = cljs.core._nth.cljs$lang$arity$2(cicoll, 0);
      var n__8997 = 1;
      while(true) {
        if(n__8997 < cnt__8995) {
          var nval__8998 = f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(val__8996, cljs.core._nth.cljs$lang$arity$2(cicoll, n__8997)) : f.call(null, val__8996, cljs.core._nth.cljs$lang$arity$2(cicoll, n__8997));
          if(cljs.core.reduced_QMARK_(nval__8998)) {
            return cljs.core.deref(nval__8998)
          }else {
            var G__9007 = nval__8998;
            var G__9008 = n__8997 + 1;
            val__8996 = G__9007;
            n__8997 = G__9008;
            continue
          }
        }else {
          return val__8996
        }
        break
      }
    }
  };
  var ci_reduce__3 = function(cicoll, f, val) {
    var cnt__8999 = cljs.core._count(cicoll);
    var val__9000 = val;
    var n__9001 = 0;
    while(true) {
      if(n__9001 < cnt__8999) {
        var nval__9002 = f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(val__9000, cljs.core._nth.cljs$lang$arity$2(cicoll, n__9001)) : f.call(null, val__9000, cljs.core._nth.cljs$lang$arity$2(cicoll, n__9001));
        if(cljs.core.reduced_QMARK_(nval__9002)) {
          return cljs.core.deref(nval__9002)
        }else {
          var G__9009 = nval__9002;
          var G__9010 = n__9001 + 1;
          val__9000 = G__9009;
          n__9001 = G__9010;
          continue
        }
      }else {
        return val__9000
      }
      break
    }
  };
  var ci_reduce__4 = function(cicoll, f, val, idx) {
    var cnt__9003 = cljs.core._count(cicoll);
    var val__9004 = val;
    var n__9005 = idx;
    while(true) {
      if(n__9005 < cnt__9003) {
        var nval__9006 = f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(val__9004, cljs.core._nth.cljs$lang$arity$2(cicoll, n__9005)) : f.call(null, val__9004, cljs.core._nth.cljs$lang$arity$2(cicoll, n__9005));
        if(cljs.core.reduced_QMARK_(nval__9006)) {
          return cljs.core.deref(nval__9006)
        }else {
          var G__9011 = nval__9006;
          var G__9012 = n__9005 + 1;
          val__9004 = G__9011;
          n__9005 = G__9012;
          continue
        }
      }else {
        return val__9004
      }
      break
    }
  };
  ci_reduce = function(cicoll, f, val, idx) {
    switch(arguments.length) {
      case 2:
        return ci_reduce__2.call(this, cicoll, f);
      case 3:
        return ci_reduce__3.call(this, cicoll, f, val);
      case 4:
        return ci_reduce__4.call(this, cicoll, f, val, idx)
    }
    throw"Invalid arity: " + arguments.length;
  };
  ci_reduce.cljs$lang$arity$2 = ci_reduce__2;
  ci_reduce.cljs$lang$arity$3 = ci_reduce__3;
  ci_reduce.cljs$lang$arity$4 = ci_reduce__4;
  return ci_reduce
}();
cljs.core.array_reduce = function() {
  var array_reduce = null;
  var array_reduce__2 = function(arr, f) {
    var cnt__9025 = arr.length;
    if(arr.length === 0) {
      return f.cljs$lang$arity$0 ? f.cljs$lang$arity$0() : f.call(null)
    }else {
      var val__9026 = arr[0];
      var n__9027 = 1;
      while(true) {
        if(n__9027 < cnt__9025) {
          var nval__9028 = f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(val__9026, arr[n__9027]) : f.call(null, val__9026, arr[n__9027]);
          if(cljs.core.reduced_QMARK_(nval__9028)) {
            return cljs.core.deref(nval__9028)
          }else {
            var G__9037 = nval__9028;
            var G__9038 = n__9027 + 1;
            val__9026 = G__9037;
            n__9027 = G__9038;
            continue
          }
        }else {
          return val__9026
        }
        break
      }
    }
  };
  var array_reduce__3 = function(arr, f, val) {
    var cnt__9029 = arr.length;
    var val__9030 = val;
    var n__9031 = 0;
    while(true) {
      if(n__9031 < cnt__9029) {
        var nval__9032 = f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(val__9030, arr[n__9031]) : f.call(null, val__9030, arr[n__9031]);
        if(cljs.core.reduced_QMARK_(nval__9032)) {
          return cljs.core.deref(nval__9032)
        }else {
          var G__9039 = nval__9032;
          var G__9040 = n__9031 + 1;
          val__9030 = G__9039;
          n__9031 = G__9040;
          continue
        }
      }else {
        return val__9030
      }
      break
    }
  };
  var array_reduce__4 = function(arr, f, val, idx) {
    var cnt__9033 = arr.length;
    var val__9034 = val;
    var n__9035 = idx;
    while(true) {
      if(n__9035 < cnt__9033) {
        var nval__9036 = f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(val__9034, arr[n__9035]) : f.call(null, val__9034, arr[n__9035]);
        if(cljs.core.reduced_QMARK_(nval__9036)) {
          return cljs.core.deref(nval__9036)
        }else {
          var G__9041 = nval__9036;
          var G__9042 = n__9035 + 1;
          val__9034 = G__9041;
          n__9035 = G__9042;
          continue
        }
      }else {
        return val__9034
      }
      break
    }
  };
  array_reduce = function(arr, f, val, idx) {
    switch(arguments.length) {
      case 2:
        return array_reduce__2.call(this, arr, f);
      case 3:
        return array_reduce__3.call(this, arr, f, val);
      case 4:
        return array_reduce__4.call(this, arr, f, val, idx)
    }
    throw"Invalid arity: " + arguments.length;
  };
  array_reduce.cljs$lang$arity$2 = array_reduce__2;
  array_reduce.cljs$lang$arity$3 = array_reduce__3;
  array_reduce.cljs$lang$arity$4 = array_reduce__4;
  return array_reduce
}();
cljs.core.IndexedSeq = function(a, i) {
  this.a = a;
  this.i = i;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 166199546
};
cljs.core.IndexedSeq.cljs$lang$type = true;
cljs.core.IndexedSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/IndexedSeq")
};
cljs.core.IndexedSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9043 = this;
  return cljs.core.hash_coll(coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$INext$_next$arity$1 = function(_) {
  var this__9044 = this;
  if(this__9044.i + 1 < this__9044.a.length) {
    return new cljs.core.IndexedSeq(this__9044.a, this__9044.i + 1)
  }else {
    return null
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9045 = this;
  return cljs.core.cons(o, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__9046 = this;
  var c__9047 = coll.cljs$core$ICounted$_count$arity$1(coll);
  if(c__9047 > 0) {
    return new cljs.core.RSeq(coll, c__9047 - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.IndexedSeq.prototype.toString = function() {
  var this__9048 = this;
  var this__9049 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__9049], 0))
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce$arity$2 = function(coll, f) {
  var this__9050 = this;
  if(cljs.core.counted_QMARK_(this__9050.a)) {
    return cljs.core.ci_reduce.cljs$lang$arity$4(this__9050.a, f, this__9050.a[this__9050.i], this__9050.i + 1)
  }else {
    return cljs.core.ci_reduce.cljs$lang$arity$4(coll, f, this__9050.a[this__9050.i], 0)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce$arity$3 = function(coll, f, start) {
  var this__9051 = this;
  if(cljs.core.counted_QMARK_(this__9051.a)) {
    return cljs.core.ci_reduce.cljs$lang$arity$4(this__9051.a, f, start, this__9051.i)
  }else {
    return cljs.core.ci_reduce.cljs$lang$arity$4(coll, f, start, 0)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__9052 = this;
  return this$
};
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count$arity$1 = function(_) {
  var this__9053 = this;
  return this__9053.a.length - this__9053.i
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(_) {
  var this__9054 = this;
  return this__9054.a[this__9054.i]
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(_) {
  var this__9055 = this;
  if(this__9055.i + 1 < this__9055.a.length) {
    return new cljs.core.IndexedSeq(this__9055.a, this__9055.i + 1)
  }else {
    return cljs.core.list.cljs$lang$arity$0()
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9056 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__9057 = this;
  var i__9058 = n + this__9057.i;
  if(i__9058 < this__9057.a.length) {
    return this__9057.a[i__9058]
  }else {
    return null
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__9059 = this;
  var i__9060 = n + this__9059.i;
  if(i__9060 < this__9059.a.length) {
    return this__9059.a[i__9060]
  }else {
    return not_found
  }
};
cljs.core.IndexedSeq;
cljs.core.prim_seq = function() {
  var prim_seq = null;
  var prim_seq__1 = function(prim) {
    return prim_seq.cljs$lang$arity$2(prim, 0)
  };
  var prim_seq__2 = function(prim, i) {
    if(prim.length === 0) {
      return null
    }else {
      return new cljs.core.IndexedSeq(prim, i)
    }
  };
  prim_seq = function(prim, i) {
    switch(arguments.length) {
      case 1:
        return prim_seq__1.call(this, prim);
      case 2:
        return prim_seq__2.call(this, prim, i)
    }
    throw"Invalid arity: " + arguments.length;
  };
  prim_seq.cljs$lang$arity$1 = prim_seq__1;
  prim_seq.cljs$lang$arity$2 = prim_seq__2;
  return prim_seq
}();
cljs.core.array_seq = function() {
  var array_seq = null;
  var array_seq__1 = function(array) {
    return cljs.core.prim_seq.cljs$lang$arity$2(array, 0)
  };
  var array_seq__2 = function(array, i) {
    return cljs.core.prim_seq.cljs$lang$arity$2(array, i)
  };
  array_seq = function(array, i) {
    switch(arguments.length) {
      case 1:
        return array_seq__1.call(this, array);
      case 2:
        return array_seq__2.call(this, array, i)
    }
    throw"Invalid arity: " + arguments.length;
  };
  array_seq.cljs$lang$arity$1 = array_seq__1;
  array_seq.cljs$lang$arity$2 = array_seq__2;
  return array_seq
}();
cljs.core.IReduce["array"] = true;
cljs.core._reduce["array"] = function() {
  var G__9061 = null;
  var G__9061__2 = function(array, f) {
    return cljs.core.ci_reduce.cljs$lang$arity$2(array, f)
  };
  var G__9061__3 = function(array, f, start) {
    return cljs.core.ci_reduce.cljs$lang$arity$3(array, f, start)
  };
  G__9061 = function(array, f, start) {
    switch(arguments.length) {
      case 2:
        return G__9061__2.call(this, array, f);
      case 3:
        return G__9061__3.call(this, array, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9061
}();
cljs.core.ILookup["array"] = true;
cljs.core._lookup["array"] = function() {
  var G__9062 = null;
  var G__9062__2 = function(array, k) {
    return array[k]
  };
  var G__9062__3 = function(array, k, not_found) {
    return cljs.core._nth.cljs$lang$arity$3(array, k, not_found)
  };
  G__9062 = function(array, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9062__2.call(this, array, k);
      case 3:
        return G__9062__3.call(this, array, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9062
}();
cljs.core.IIndexed["array"] = true;
cljs.core._nth["array"] = function() {
  var G__9063 = null;
  var G__9063__2 = function(array, n) {
    if(n < array.length) {
      return array[n]
    }else {
      return null
    }
  };
  var G__9063__3 = function(array, n, not_found) {
    if(n < array.length) {
      return array[n]
    }else {
      return not_found
    }
  };
  G__9063 = function(array, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9063__2.call(this, array, n);
      case 3:
        return G__9063__3.call(this, array, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9063
}();
cljs.core.ICounted["array"] = true;
cljs.core._count["array"] = function(a) {
  return a.length
};
cljs.core.ISeqable["array"] = true;
cljs.core._seq["array"] = function(array) {
  return cljs.core.array_seq.cljs$lang$arity$2(array, 0)
};
cljs.core.RSeq = function(ci, i, meta) {
  this.ci = ci;
  this.i = i;
  this.meta = meta;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31850570
};
cljs.core.RSeq.cljs$lang$type = true;
cljs.core.RSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/RSeq")
};
cljs.core.RSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9064 = this;
  return cljs.core.hash_coll(coll)
};
cljs.core.RSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9065 = this;
  return cljs.core.cons(o, coll)
};
cljs.core.RSeq.prototype.toString = function() {
  var this__9066 = this;
  var this__9067 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__9067], 0))
};
cljs.core.RSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9068 = this;
  return coll
};
cljs.core.RSeq.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9069 = this;
  return this__9069.i + 1
};
cljs.core.RSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9070 = this;
  return cljs.core._nth.cljs$lang$arity$2(this__9070.ci, this__9070.i)
};
cljs.core.RSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9071 = this;
  if(this__9071.i > 0) {
    return new cljs.core.RSeq(this__9071.ci, this__9071.i - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.RSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9072 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.RSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, new_meta) {
  var this__9073 = this;
  return new cljs.core.RSeq(this__9073.ci, this__9073.i, new_meta)
};
cljs.core.RSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9074 = this;
  return this__9074.meta
};
cljs.core.RSeq;
cljs.core.seq = function seq(coll) {
  if(coll == null) {
    return null
  }else {
    if(function() {
      var G__9078__9079 = coll;
      if(G__9078__9079) {
        if(function() {
          var or__3824__auto____9080 = G__9078__9079.cljs$lang$protocol_mask$partition0$ & 32;
          if(or__3824__auto____9080) {
            return or__3824__auto____9080
          }else {
            return G__9078__9079.cljs$core$ASeq$
          }
        }()) {
          return true
        }else {
          if(!G__9078__9079.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_(cljs.core.ASeq, G__9078__9079)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_(cljs.core.ASeq, G__9078__9079)
      }
    }()) {
      return coll
    }else {
      return cljs.core._seq(coll)
    }
  }
};
cljs.core.first = function first(coll) {
  if(coll == null) {
    return null
  }else {
    if(function() {
      var G__9085__9086 = coll;
      if(G__9085__9086) {
        if(function() {
          var or__3824__auto____9087 = G__9085__9086.cljs$lang$protocol_mask$partition0$ & 64;
          if(or__3824__auto____9087) {
            return or__3824__auto____9087
          }else {
            return G__9085__9086.cljs$core$ISeq$
          }
        }()) {
          return true
        }else {
          if(!G__9085__9086.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_(cljs.core.ISeq, G__9085__9086)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_(cljs.core.ISeq, G__9085__9086)
      }
    }()) {
      return cljs.core._first(coll)
    }else {
      var s__9088 = cljs.core.seq(coll);
      if(s__9088 == null) {
        return null
      }else {
        return cljs.core._first(s__9088)
      }
    }
  }
};
cljs.core.rest = function rest(coll) {
  if(!(coll == null)) {
    if(function() {
      var G__9093__9094 = coll;
      if(G__9093__9094) {
        if(function() {
          var or__3824__auto____9095 = G__9093__9094.cljs$lang$protocol_mask$partition0$ & 64;
          if(or__3824__auto____9095) {
            return or__3824__auto____9095
          }else {
            return G__9093__9094.cljs$core$ISeq$
          }
        }()) {
          return true
        }else {
          if(!G__9093__9094.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_(cljs.core.ISeq, G__9093__9094)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_(cljs.core.ISeq, G__9093__9094)
      }
    }()) {
      return cljs.core._rest(coll)
    }else {
      var s__9096 = cljs.core.seq(coll);
      if(!(s__9096 == null)) {
        return cljs.core._rest(s__9096)
      }else {
        return cljs.core.List.EMPTY
      }
    }
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.next = function next(coll) {
  if(coll == null) {
    return null
  }else {
    if(function() {
      var G__9100__9101 = coll;
      if(G__9100__9101) {
        if(function() {
          var or__3824__auto____9102 = G__9100__9101.cljs$lang$protocol_mask$partition0$ & 128;
          if(or__3824__auto____9102) {
            return or__3824__auto____9102
          }else {
            return G__9100__9101.cljs$core$INext$
          }
        }()) {
          return true
        }else {
          if(!G__9100__9101.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_(cljs.core.INext, G__9100__9101)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_(cljs.core.INext, G__9100__9101)
      }
    }()) {
      return cljs.core._next(coll)
    }else {
      return cljs.core.seq(cljs.core.rest(coll))
    }
  }
};
cljs.core.second = function second(coll) {
  return cljs.core.first(cljs.core.next(coll))
};
cljs.core.ffirst = function ffirst(coll) {
  return cljs.core.first(cljs.core.first(coll))
};
cljs.core.nfirst = function nfirst(coll) {
  return cljs.core.next(cljs.core.first(coll))
};
cljs.core.fnext = function fnext(coll) {
  return cljs.core.first(cljs.core.next(coll))
};
cljs.core.nnext = function nnext(coll) {
  return cljs.core.next(cljs.core.next(coll))
};
cljs.core.last = function last(s) {
  while(true) {
    var sn__9104 = cljs.core.next(s);
    if(!(sn__9104 == null)) {
      var G__9105 = sn__9104;
      s = G__9105;
      continue
    }else {
      return cljs.core.first(s)
    }
    break
  }
};
cljs.core.IEquiv["_"] = true;
cljs.core._equiv["_"] = function(x, o) {
  return x === o
};
cljs.core.not = function not(x) {
  if(cljs.core.truth_(x)) {
    return false
  }else {
    return true
  }
};
cljs.core.conj = function() {
  var conj = null;
  var conj__2 = function(coll, x) {
    return cljs.core._conj(coll, x)
  };
  var conj__3 = function() {
    var G__9106__delegate = function(coll, x, xs) {
      while(true) {
        if(cljs.core.truth_(xs)) {
          var G__9107 = conj.cljs$lang$arity$2(coll, x);
          var G__9108 = cljs.core.first(xs);
          var G__9109 = cljs.core.next(xs);
          coll = G__9107;
          x = G__9108;
          xs = G__9109;
          continue
        }else {
          return conj.cljs$lang$arity$2(coll, x)
        }
        break
      }
    };
    var G__9106 = function(coll, x, var_args) {
      var xs = null;
      if(goog.isDef(var_args)) {
        xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9106__delegate.call(this, coll, x, xs)
    };
    G__9106.cljs$lang$maxFixedArity = 2;
    G__9106.cljs$lang$applyTo = function(arglist__9110) {
      var coll = cljs.core.first(arglist__9110);
      var x = cljs.core.first(cljs.core.next(arglist__9110));
      var xs = cljs.core.rest(cljs.core.next(arglist__9110));
      return G__9106__delegate(coll, x, xs)
    };
    G__9106.cljs$lang$arity$variadic = G__9106__delegate;
    return G__9106
  }();
  conj = function(coll, x, var_args) {
    var xs = var_args;
    switch(arguments.length) {
      case 2:
        return conj__2.call(this, coll, x);
      default:
        return conj__3.cljs$lang$arity$variadic(coll, x, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  conj.cljs$lang$maxFixedArity = 2;
  conj.cljs$lang$applyTo = conj__3.cljs$lang$applyTo;
  conj.cljs$lang$arity$2 = conj__2;
  conj.cljs$lang$arity$variadic = conj__3.cljs$lang$arity$variadic;
  return conj
}();
cljs.core.empty = function empty(coll) {
  return cljs.core._empty(coll)
};
cljs.core.accumulating_seq_count = function accumulating_seq_count(coll) {
  var s__9113 = cljs.core.seq(coll);
  var acc__9114 = 0;
  while(true) {
    if(cljs.core.counted_QMARK_(s__9113)) {
      return acc__9114 + cljs.core._count(s__9113)
    }else {
      var G__9115 = cljs.core.next(s__9113);
      var G__9116 = acc__9114 + 1;
      s__9113 = G__9115;
      acc__9114 = G__9116;
      continue
    }
    break
  }
};
cljs.core.count = function count(coll) {
  if(cljs.core.counted_QMARK_(coll)) {
    return cljs.core._count(coll)
  }else {
    return cljs.core.accumulating_seq_count(coll)
  }
};
cljs.core.linear_traversal_nth = function() {
  var linear_traversal_nth = null;
  var linear_traversal_nth__2 = function(coll, n) {
    if(coll == null) {
      throw new Error("Index out of bounds");
    }else {
      if(n === 0) {
        if(cljs.core.seq(coll)) {
          return cljs.core.first(coll)
        }else {
          throw new Error("Index out of bounds");
        }
      }else {
        if(cljs.core.indexed_QMARK_(coll)) {
          return cljs.core._nth.cljs$lang$arity$2(coll, n)
        }else {
          if(cljs.core.seq(coll)) {
            return linear_traversal_nth.cljs$lang$arity$2(cljs.core.next(coll), n - 1)
          }else {
            if("\ufdd0'else") {
              throw new Error("Index out of bounds");
            }else {
              return null
            }
          }
        }
      }
    }
  };
  var linear_traversal_nth__3 = function(coll, n, not_found) {
    if(coll == null) {
      return not_found
    }else {
      if(n === 0) {
        if(cljs.core.seq(coll)) {
          return cljs.core.first(coll)
        }else {
          return not_found
        }
      }else {
        if(cljs.core.indexed_QMARK_(coll)) {
          return cljs.core._nth.cljs$lang$arity$3(coll, n, not_found)
        }else {
          if(cljs.core.seq(coll)) {
            return linear_traversal_nth.cljs$lang$arity$3(cljs.core.next(coll), n - 1, not_found)
          }else {
            if("\ufdd0'else") {
              return not_found
            }else {
              return null
            }
          }
        }
      }
    }
  };
  linear_traversal_nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return linear_traversal_nth__2.call(this, coll, n);
      case 3:
        return linear_traversal_nth__3.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  linear_traversal_nth.cljs$lang$arity$2 = linear_traversal_nth__2;
  linear_traversal_nth.cljs$lang$arity$3 = linear_traversal_nth__3;
  return linear_traversal_nth
}();
cljs.core.nth = function() {
  var nth = null;
  var nth__2 = function(coll, n) {
    if(coll == null) {
      return null
    }else {
      if(function() {
        var G__9123__9124 = coll;
        if(G__9123__9124) {
          if(function() {
            var or__3824__auto____9125 = G__9123__9124.cljs$lang$protocol_mask$partition0$ & 16;
            if(or__3824__auto____9125) {
              return or__3824__auto____9125
            }else {
              return G__9123__9124.cljs$core$IIndexed$
            }
          }()) {
            return true
          }else {
            if(!G__9123__9124.cljs$lang$protocol_mask$partition0$) {
              return cljs.core.type_satisfies_(cljs.core.IIndexed, G__9123__9124)
            }else {
              return false
            }
          }
        }else {
          return cljs.core.type_satisfies_(cljs.core.IIndexed, G__9123__9124)
        }
      }()) {
        return cljs.core._nth.cljs$lang$arity$2(coll, Math.floor(n))
      }else {
        return cljs.core.linear_traversal_nth.cljs$lang$arity$2(coll, Math.floor(n))
      }
    }
  };
  var nth__3 = function(coll, n, not_found) {
    if(!(coll == null)) {
      if(function() {
        var G__9126__9127 = coll;
        if(G__9126__9127) {
          if(function() {
            var or__3824__auto____9128 = G__9126__9127.cljs$lang$protocol_mask$partition0$ & 16;
            if(or__3824__auto____9128) {
              return or__3824__auto____9128
            }else {
              return G__9126__9127.cljs$core$IIndexed$
            }
          }()) {
            return true
          }else {
            if(!G__9126__9127.cljs$lang$protocol_mask$partition0$) {
              return cljs.core.type_satisfies_(cljs.core.IIndexed, G__9126__9127)
            }else {
              return false
            }
          }
        }else {
          return cljs.core.type_satisfies_(cljs.core.IIndexed, G__9126__9127)
        }
      }()) {
        return cljs.core._nth.cljs$lang$arity$3(coll, Math.floor(n), not_found)
      }else {
        return cljs.core.linear_traversal_nth.cljs$lang$arity$3(coll, Math.floor(n), not_found)
      }
    }else {
      return not_found
    }
  };
  nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return nth__2.call(this, coll, n);
      case 3:
        return nth__3.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  nth.cljs$lang$arity$2 = nth__2;
  nth.cljs$lang$arity$3 = nth__3;
  return nth
}();
cljs.core.get = function() {
  var get = null;
  var get__2 = function(o, k) {
    return cljs.core._lookup.cljs$lang$arity$2(o, k)
  };
  var get__3 = function(o, k, not_found) {
    return cljs.core._lookup.cljs$lang$arity$3(o, k, not_found)
  };
  get = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return get__2.call(this, o, k);
      case 3:
        return get__3.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  get.cljs$lang$arity$2 = get__2;
  get.cljs$lang$arity$3 = get__3;
  return get
}();
cljs.core.assoc = function() {
  var assoc = null;
  var assoc__3 = function(coll, k, v) {
    return cljs.core._assoc(coll, k, v)
  };
  var assoc__4 = function() {
    var G__9131__delegate = function(coll, k, v, kvs) {
      while(true) {
        var ret__9130 = assoc.cljs$lang$arity$3(coll, k, v);
        if(cljs.core.truth_(kvs)) {
          var G__9132 = ret__9130;
          var G__9133 = cljs.core.first(kvs);
          var G__9134 = cljs.core.second(kvs);
          var G__9135 = cljs.core.nnext(kvs);
          coll = G__9132;
          k = G__9133;
          v = G__9134;
          kvs = G__9135;
          continue
        }else {
          return ret__9130
        }
        break
      }
    };
    var G__9131 = function(coll, k, v, var_args) {
      var kvs = null;
      if(goog.isDef(var_args)) {
        kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__9131__delegate.call(this, coll, k, v, kvs)
    };
    G__9131.cljs$lang$maxFixedArity = 3;
    G__9131.cljs$lang$applyTo = function(arglist__9136) {
      var coll = cljs.core.first(arglist__9136);
      var k = cljs.core.first(cljs.core.next(arglist__9136));
      var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9136)));
      var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9136)));
      return G__9131__delegate(coll, k, v, kvs)
    };
    G__9131.cljs$lang$arity$variadic = G__9131__delegate;
    return G__9131
  }();
  assoc = function(coll, k, v, var_args) {
    var kvs = var_args;
    switch(arguments.length) {
      case 3:
        return assoc__3.call(this, coll, k, v);
      default:
        return assoc__4.cljs$lang$arity$variadic(coll, k, v, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  assoc.cljs$lang$maxFixedArity = 3;
  assoc.cljs$lang$applyTo = assoc__4.cljs$lang$applyTo;
  assoc.cljs$lang$arity$3 = assoc__3;
  assoc.cljs$lang$arity$variadic = assoc__4.cljs$lang$arity$variadic;
  return assoc
}();
cljs.core.dissoc = function() {
  var dissoc = null;
  var dissoc__1 = function(coll) {
    return coll
  };
  var dissoc__2 = function(coll, k) {
    return cljs.core._dissoc(coll, k)
  };
  var dissoc__3 = function() {
    var G__9139__delegate = function(coll, k, ks) {
      while(true) {
        var ret__9138 = dissoc.cljs$lang$arity$2(coll, k);
        if(cljs.core.truth_(ks)) {
          var G__9140 = ret__9138;
          var G__9141 = cljs.core.first(ks);
          var G__9142 = cljs.core.next(ks);
          coll = G__9140;
          k = G__9141;
          ks = G__9142;
          continue
        }else {
          return ret__9138
        }
        break
      }
    };
    var G__9139 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9139__delegate.call(this, coll, k, ks)
    };
    G__9139.cljs$lang$maxFixedArity = 2;
    G__9139.cljs$lang$applyTo = function(arglist__9143) {
      var coll = cljs.core.first(arglist__9143);
      var k = cljs.core.first(cljs.core.next(arglist__9143));
      var ks = cljs.core.rest(cljs.core.next(arglist__9143));
      return G__9139__delegate(coll, k, ks)
    };
    G__9139.cljs$lang$arity$variadic = G__9139__delegate;
    return G__9139
  }();
  dissoc = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return dissoc__1.call(this, coll);
      case 2:
        return dissoc__2.call(this, coll, k);
      default:
        return dissoc__3.cljs$lang$arity$variadic(coll, k, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  dissoc.cljs$lang$maxFixedArity = 2;
  dissoc.cljs$lang$applyTo = dissoc__3.cljs$lang$applyTo;
  dissoc.cljs$lang$arity$1 = dissoc__1;
  dissoc.cljs$lang$arity$2 = dissoc__2;
  dissoc.cljs$lang$arity$variadic = dissoc__3.cljs$lang$arity$variadic;
  return dissoc
}();
cljs.core.with_meta = function with_meta(o, meta) {
  return cljs.core._with_meta(o, meta)
};
cljs.core.meta = function meta(o) {
  if(function() {
    var G__9147__9148 = o;
    if(G__9147__9148) {
      if(function() {
        var or__3824__auto____9149 = G__9147__9148.cljs$lang$protocol_mask$partition0$ & 131072;
        if(or__3824__auto____9149) {
          return or__3824__auto____9149
        }else {
          return G__9147__9148.cljs$core$IMeta$
        }
      }()) {
        return true
      }else {
        if(!G__9147__9148.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_(cljs.core.IMeta, G__9147__9148)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_(cljs.core.IMeta, G__9147__9148)
    }
  }()) {
    return cljs.core._meta(o)
  }else {
    return null
  }
};
cljs.core.peek = function peek(coll) {
  return cljs.core._peek(coll)
};
cljs.core.pop = function pop(coll) {
  return cljs.core._pop(coll)
};
cljs.core.disj = function() {
  var disj = null;
  var disj__1 = function(coll) {
    return coll
  };
  var disj__2 = function(coll, k) {
    return cljs.core._disjoin(coll, k)
  };
  var disj__3 = function() {
    var G__9152__delegate = function(coll, k, ks) {
      while(true) {
        var ret__9151 = disj.cljs$lang$arity$2(coll, k);
        if(cljs.core.truth_(ks)) {
          var G__9153 = ret__9151;
          var G__9154 = cljs.core.first(ks);
          var G__9155 = cljs.core.next(ks);
          coll = G__9153;
          k = G__9154;
          ks = G__9155;
          continue
        }else {
          return ret__9151
        }
        break
      }
    };
    var G__9152 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9152__delegate.call(this, coll, k, ks)
    };
    G__9152.cljs$lang$maxFixedArity = 2;
    G__9152.cljs$lang$applyTo = function(arglist__9156) {
      var coll = cljs.core.first(arglist__9156);
      var k = cljs.core.first(cljs.core.next(arglist__9156));
      var ks = cljs.core.rest(cljs.core.next(arglist__9156));
      return G__9152__delegate(coll, k, ks)
    };
    G__9152.cljs$lang$arity$variadic = G__9152__delegate;
    return G__9152
  }();
  disj = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return disj__1.call(this, coll);
      case 2:
        return disj__2.call(this, coll, k);
      default:
        return disj__3.cljs$lang$arity$variadic(coll, k, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  disj.cljs$lang$maxFixedArity = 2;
  disj.cljs$lang$applyTo = disj__3.cljs$lang$applyTo;
  disj.cljs$lang$arity$1 = disj__1;
  disj.cljs$lang$arity$2 = disj__2;
  disj.cljs$lang$arity$variadic = disj__3.cljs$lang$arity$variadic;
  return disj
}();
cljs.core.string_hash_cache = {};
cljs.core.string_hash_cache_count = 0;
cljs.core.add_to_string_hash_cache = function add_to_string_hash_cache(k) {
  var h__9158 = goog.string.hashCode(k);
  cljs.core.string_hash_cache[k] = h__9158;
  cljs.core.string_hash_cache_count = cljs.core.string_hash_cache_count + 1;
  return h__9158
};
cljs.core.check_string_hash_cache = function check_string_hash_cache(k) {
  if(cljs.core.string_hash_cache_count > 255) {
    cljs.core.string_hash_cache = {};
    cljs.core.string_hash_cache_count = 0
  }else {
  }
  var h__9160 = cljs.core.string_hash_cache[k];
  if(!(h__9160 == null)) {
    return h__9160
  }else {
    return cljs.core.add_to_string_hash_cache(k)
  }
};
cljs.core.hash = function() {
  var hash = null;
  var hash__1 = function(o) {
    return hash.cljs$lang$arity$2(o, true)
  };
  var hash__2 = function(o, check_cache) {
    if(function() {
      var and__3822__auto____9162 = goog.isString(o);
      if(and__3822__auto____9162) {
        return check_cache
      }else {
        return and__3822__auto____9162
      }
    }()) {
      return cljs.core.check_string_hash_cache(o)
    }else {
      return cljs.core._hash(o)
    }
  };
  hash = function(o, check_cache) {
    switch(arguments.length) {
      case 1:
        return hash__1.call(this, o);
      case 2:
        return hash__2.call(this, o, check_cache)
    }
    throw"Invalid arity: " + arguments.length;
  };
  hash.cljs$lang$arity$1 = hash__1;
  hash.cljs$lang$arity$2 = hash__2;
  return hash
}();
cljs.core.empty_QMARK_ = function empty_QMARK_(coll) {
  return cljs.core.not(cljs.core.seq(coll))
};
cljs.core.coll_QMARK_ = function coll_QMARK_(x) {
  if(x == null) {
    return false
  }else {
    var G__9166__9167 = x;
    if(G__9166__9167) {
      if(function() {
        var or__3824__auto____9168 = G__9166__9167.cljs$lang$protocol_mask$partition0$ & 8;
        if(or__3824__auto____9168) {
          return or__3824__auto____9168
        }else {
          return G__9166__9167.cljs$core$ICollection$
        }
      }()) {
        return true
      }else {
        if(!G__9166__9167.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_(cljs.core.ICollection, G__9166__9167)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_(cljs.core.ICollection, G__9166__9167)
    }
  }
};
cljs.core.set_QMARK_ = function set_QMARK_(x) {
  if(x == null) {
    return false
  }else {
    var G__9172__9173 = x;
    if(G__9172__9173) {
      if(function() {
        var or__3824__auto____9174 = G__9172__9173.cljs$lang$protocol_mask$partition0$ & 4096;
        if(or__3824__auto____9174) {
          return or__3824__auto____9174
        }else {
          return G__9172__9173.cljs$core$ISet$
        }
      }()) {
        return true
      }else {
        if(!G__9172__9173.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_(cljs.core.ISet, G__9172__9173)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_(cljs.core.ISet, G__9172__9173)
    }
  }
};
cljs.core.associative_QMARK_ = function associative_QMARK_(x) {
  var G__9178__9179 = x;
  if(G__9178__9179) {
    if(function() {
      var or__3824__auto____9180 = G__9178__9179.cljs$lang$protocol_mask$partition0$ & 512;
      if(or__3824__auto____9180) {
        return or__3824__auto____9180
      }else {
        return G__9178__9179.cljs$core$IAssociative$
      }
    }()) {
      return true
    }else {
      if(!G__9178__9179.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_(cljs.core.IAssociative, G__9178__9179)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_(cljs.core.IAssociative, G__9178__9179)
  }
};
cljs.core.sequential_QMARK_ = function sequential_QMARK_(x) {
  var G__9184__9185 = x;
  if(G__9184__9185) {
    if(function() {
      var or__3824__auto____9186 = G__9184__9185.cljs$lang$protocol_mask$partition0$ & 16777216;
      if(or__3824__auto____9186) {
        return or__3824__auto____9186
      }else {
        return G__9184__9185.cljs$core$ISequential$
      }
    }()) {
      return true
    }else {
      if(!G__9184__9185.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_(cljs.core.ISequential, G__9184__9185)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_(cljs.core.ISequential, G__9184__9185)
  }
};
cljs.core.counted_QMARK_ = function counted_QMARK_(x) {
  var G__9190__9191 = x;
  if(G__9190__9191) {
    if(function() {
      var or__3824__auto____9192 = G__9190__9191.cljs$lang$protocol_mask$partition0$ & 2;
      if(or__3824__auto____9192) {
        return or__3824__auto____9192
      }else {
        return G__9190__9191.cljs$core$ICounted$
      }
    }()) {
      return true
    }else {
      if(!G__9190__9191.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_(cljs.core.ICounted, G__9190__9191)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_(cljs.core.ICounted, G__9190__9191)
  }
};
cljs.core.indexed_QMARK_ = function indexed_QMARK_(x) {
  var G__9196__9197 = x;
  if(G__9196__9197) {
    if(function() {
      var or__3824__auto____9198 = G__9196__9197.cljs$lang$protocol_mask$partition0$ & 16;
      if(or__3824__auto____9198) {
        return or__3824__auto____9198
      }else {
        return G__9196__9197.cljs$core$IIndexed$
      }
    }()) {
      return true
    }else {
      if(!G__9196__9197.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_(cljs.core.IIndexed, G__9196__9197)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_(cljs.core.IIndexed, G__9196__9197)
  }
};
cljs.core.reduceable_QMARK_ = function reduceable_QMARK_(x) {
  var G__9202__9203 = x;
  if(G__9202__9203) {
    if(function() {
      var or__3824__auto____9204 = G__9202__9203.cljs$lang$protocol_mask$partition0$ & 524288;
      if(or__3824__auto____9204) {
        return or__3824__auto____9204
      }else {
        return G__9202__9203.cljs$core$IReduce$
      }
    }()) {
      return true
    }else {
      if(!G__9202__9203.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_(cljs.core.IReduce, G__9202__9203)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_(cljs.core.IReduce, G__9202__9203)
  }
};
cljs.core.map_QMARK_ = function map_QMARK_(x) {
  if(x == null) {
    return false
  }else {
    var G__9208__9209 = x;
    if(G__9208__9209) {
      if(function() {
        var or__3824__auto____9210 = G__9208__9209.cljs$lang$protocol_mask$partition0$ & 1024;
        if(or__3824__auto____9210) {
          return or__3824__auto____9210
        }else {
          return G__9208__9209.cljs$core$IMap$
        }
      }()) {
        return true
      }else {
        if(!G__9208__9209.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_(cljs.core.IMap, G__9208__9209)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_(cljs.core.IMap, G__9208__9209)
    }
  }
};
cljs.core.vector_QMARK_ = function vector_QMARK_(x) {
  var G__9214__9215 = x;
  if(G__9214__9215) {
    if(function() {
      var or__3824__auto____9216 = G__9214__9215.cljs$lang$protocol_mask$partition0$ & 16384;
      if(or__3824__auto____9216) {
        return or__3824__auto____9216
      }else {
        return G__9214__9215.cljs$core$IVector$
      }
    }()) {
      return true
    }else {
      if(!G__9214__9215.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_(cljs.core.IVector, G__9214__9215)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_(cljs.core.IVector, G__9214__9215)
  }
};
cljs.core.chunked_seq_QMARK_ = function chunked_seq_QMARK_(x) {
  var G__9220__9221 = x;
  if(G__9220__9221) {
    if(cljs.core.truth_(function() {
      var or__3824__auto____9222 = null;
      if(cljs.core.truth_(or__3824__auto____9222)) {
        return or__3824__auto____9222
      }else {
        return G__9220__9221.cljs$core$IChunkedSeq$
      }
    }())) {
      return true
    }else {
      if(!G__9220__9221.cljs$lang$protocol_mask$partition$) {
        return cljs.core.type_satisfies_(cljs.core.IChunkedSeq, G__9220__9221)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_(cljs.core.IChunkedSeq, G__9220__9221)
  }
};
cljs.core.js_obj = function() {
  var js_obj = null;
  var js_obj__0 = function() {
    return{}
  };
  var js_obj__1 = function() {
    var G__9223__delegate = function(keyvals) {
      return cljs.core.apply.cljs$lang$arity$2(goog.object.create, keyvals)
    };
    var G__9223 = function(var_args) {
      var keyvals = null;
      if(goog.isDef(var_args)) {
        keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__9223__delegate.call(this, keyvals)
    };
    G__9223.cljs$lang$maxFixedArity = 0;
    G__9223.cljs$lang$applyTo = function(arglist__9224) {
      var keyvals = cljs.core.seq(arglist__9224);
      return G__9223__delegate(keyvals)
    };
    G__9223.cljs$lang$arity$variadic = G__9223__delegate;
    return G__9223
  }();
  js_obj = function(var_args) {
    var keyvals = var_args;
    switch(arguments.length) {
      case 0:
        return js_obj__0.call(this);
      default:
        return js_obj__1.cljs$lang$arity$variadic(cljs.core.array_seq(arguments, 0))
    }
    throw"Invalid arity: " + arguments.length;
  };
  js_obj.cljs$lang$maxFixedArity = 0;
  js_obj.cljs$lang$applyTo = js_obj__1.cljs$lang$applyTo;
  js_obj.cljs$lang$arity$0 = js_obj__0;
  js_obj.cljs$lang$arity$variadic = js_obj__1.cljs$lang$arity$variadic;
  return js_obj
}();
cljs.core.js_keys = function js_keys(obj) {
  var keys__9226 = [];
  goog.object.forEach(obj, function(val, key, obj) {
    return keys__9226.push(key)
  });
  return keys__9226
};
cljs.core.js_delete = function js_delete(obj, key) {
  return delete obj[key]
};
cljs.core.array_copy = function array_copy(from, i, to, j, len) {
  var i__9230 = i;
  var j__9231 = j;
  var len__9232 = len;
  while(true) {
    if(len__9232 === 0) {
      return to
    }else {
      to[j__9231] = from[i__9230];
      var G__9233 = i__9230 + 1;
      var G__9234 = j__9231 + 1;
      var G__9235 = len__9232 - 1;
      i__9230 = G__9233;
      j__9231 = G__9234;
      len__9232 = G__9235;
      continue
    }
    break
  }
};
cljs.core.array_copy_downward = function array_copy_downward(from, i, to, j, len) {
  var i__9239 = i + (len - 1);
  var j__9240 = j + (len - 1);
  var len__9241 = len;
  while(true) {
    if(len__9241 === 0) {
      return to
    }else {
      to[j__9240] = from[i__9239];
      var G__9242 = i__9239 - 1;
      var G__9243 = j__9240 - 1;
      var G__9244 = len__9241 - 1;
      i__9239 = G__9242;
      j__9240 = G__9243;
      len__9241 = G__9244;
      continue
    }
    break
  }
};
cljs.core.lookup_sentinel = {};
cljs.core.false_QMARK_ = function false_QMARK_(x) {
  return x === false
};
cljs.core.true_QMARK_ = function true_QMARK_(x) {
  return x === true
};
cljs.core.undefined_QMARK_ = function undefined_QMARK_(x) {
  return void 0 === x
};
cljs.core.seq_QMARK_ = function seq_QMARK_(s) {
  if(s == null) {
    return false
  }else {
    var G__9248__9249 = s;
    if(G__9248__9249) {
      if(function() {
        var or__3824__auto____9250 = G__9248__9249.cljs$lang$protocol_mask$partition0$ & 64;
        if(or__3824__auto____9250) {
          return or__3824__auto____9250
        }else {
          return G__9248__9249.cljs$core$ISeq$
        }
      }()) {
        return true
      }else {
        if(!G__9248__9249.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_(cljs.core.ISeq, G__9248__9249)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_(cljs.core.ISeq, G__9248__9249)
    }
  }
};
cljs.core.seqable_QMARK_ = function seqable_QMARK_(s) {
  var G__9254__9255 = s;
  if(G__9254__9255) {
    if(function() {
      var or__3824__auto____9256 = G__9254__9255.cljs$lang$protocol_mask$partition0$ & 8388608;
      if(or__3824__auto____9256) {
        return or__3824__auto____9256
      }else {
        return G__9254__9255.cljs$core$ISeqable$
      }
    }()) {
      return true
    }else {
      if(!G__9254__9255.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_(cljs.core.ISeqable, G__9254__9255)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_(cljs.core.ISeqable, G__9254__9255)
  }
};
cljs.core.boolean$ = function boolean$(x) {
  if(cljs.core.truth_(x)) {
    return true
  }else {
    return false
  }
};
cljs.core.string_QMARK_ = function string_QMARK_(x) {
  var and__3822__auto____9259 = goog.isString(x);
  if(and__3822__auto____9259) {
    return!function() {
      var or__3824__auto____9260 = x.charAt(0) === "\ufdd0";
      if(or__3824__auto____9260) {
        return or__3824__auto____9260
      }else {
        return x.charAt(0) === "\ufdd1"
      }
    }()
  }else {
    return and__3822__auto____9259
  }
};
cljs.core.keyword_QMARK_ = function keyword_QMARK_(x) {
  var and__3822__auto____9262 = goog.isString(x);
  if(and__3822__auto____9262) {
    return x.charAt(0) === "\ufdd0"
  }else {
    return and__3822__auto____9262
  }
};
cljs.core.symbol_QMARK_ = function symbol_QMARK_(x) {
  var and__3822__auto____9264 = goog.isString(x);
  if(and__3822__auto____9264) {
    return x.charAt(0) === "\ufdd1"
  }else {
    return and__3822__auto____9264
  }
};
cljs.core.number_QMARK_ = function number_QMARK_(n) {
  return goog.isNumber(n)
};
cljs.core.fn_QMARK_ = function fn_QMARK_(f) {
  return goog.isFunction(f)
};
cljs.core.ifn_QMARK_ = function ifn_QMARK_(f) {
  var or__3824__auto____9269 = cljs.core.fn_QMARK_(f);
  if(or__3824__auto____9269) {
    return or__3824__auto____9269
  }else {
    var G__9270__9271 = f;
    if(G__9270__9271) {
      if(function() {
        var or__3824__auto____9272 = G__9270__9271.cljs$lang$protocol_mask$partition0$ & 1;
        if(or__3824__auto____9272) {
          return or__3824__auto____9272
        }else {
          return G__9270__9271.cljs$core$IFn$
        }
      }()) {
        return true
      }else {
        if(!G__9270__9271.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_(cljs.core.IFn, G__9270__9271)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_(cljs.core.IFn, G__9270__9271)
    }
  }
};
cljs.core.integer_QMARK_ = function integer_QMARK_(n) {
  var and__3822__auto____9274 = cljs.core.number_QMARK_(n);
  if(and__3822__auto____9274) {
    return n == n.toFixed()
  }else {
    return and__3822__auto____9274
  }
};
cljs.core.contains_QMARK_ = function contains_QMARK_(coll, v) {
  if(cljs.core._lookup.cljs$lang$arity$3(coll, v, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
    return false
  }else {
    return true
  }
};
cljs.core.find = function find(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3822__auto____9277 = coll;
    if(cljs.core.truth_(and__3822__auto____9277)) {
      var and__3822__auto____9278 = cljs.core.associative_QMARK_(coll);
      if(and__3822__auto____9278) {
        return cljs.core.contains_QMARK_(coll, k)
      }else {
        return and__3822__auto____9278
      }
    }else {
      return and__3822__auto____9277
    }
  }())) {
    return cljs.core.PersistentVector.fromArray([k, cljs.core._lookup.cljs$lang$arity$2(coll, k)], true)
  }else {
    return null
  }
};
cljs.core.distinct_QMARK_ = function() {
  var distinct_QMARK_ = null;
  var distinct_QMARK___1 = function(x) {
    return true
  };
  var distinct_QMARK___2 = function(x, y) {
    return!cljs.core._EQ_.cljs$lang$arity$2(x, y)
  };
  var distinct_QMARK___3 = function() {
    var G__9287__delegate = function(x, y, more) {
      if(!cljs.core._EQ_.cljs$lang$arity$2(x, y)) {
        var s__9283 = cljs.core.PersistentHashSet.fromArray([y, x]);
        var xs__9284 = more;
        while(true) {
          var x__9285 = cljs.core.first(xs__9284);
          var etc__9286 = cljs.core.next(xs__9284);
          if(cljs.core.truth_(xs__9284)) {
            if(cljs.core.contains_QMARK_(s__9283, x__9285)) {
              return false
            }else {
              var G__9288 = cljs.core.conj.cljs$lang$arity$2(s__9283, x__9285);
              var G__9289 = etc__9286;
              s__9283 = G__9288;
              xs__9284 = G__9289;
              continue
            }
          }else {
            return true
          }
          break
        }
      }else {
        return false
      }
    };
    var G__9287 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9287__delegate.call(this, x, y, more)
    };
    G__9287.cljs$lang$maxFixedArity = 2;
    G__9287.cljs$lang$applyTo = function(arglist__9290) {
      var x = cljs.core.first(arglist__9290);
      var y = cljs.core.first(cljs.core.next(arglist__9290));
      var more = cljs.core.rest(cljs.core.next(arglist__9290));
      return G__9287__delegate(x, y, more)
    };
    G__9287.cljs$lang$arity$variadic = G__9287__delegate;
    return G__9287
  }();
  distinct_QMARK_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return distinct_QMARK___1.call(this, x);
      case 2:
        return distinct_QMARK___2.call(this, x, y);
      default:
        return distinct_QMARK___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  distinct_QMARK_.cljs$lang$maxFixedArity = 2;
  distinct_QMARK_.cljs$lang$applyTo = distinct_QMARK___3.cljs$lang$applyTo;
  distinct_QMARK_.cljs$lang$arity$1 = distinct_QMARK___1;
  distinct_QMARK_.cljs$lang$arity$2 = distinct_QMARK___2;
  distinct_QMARK_.cljs$lang$arity$variadic = distinct_QMARK___3.cljs$lang$arity$variadic;
  return distinct_QMARK_
}();
cljs.core.compare = function compare(x, y) {
  if(x === y) {
    return 0
  }else {
    if(x == null) {
      return-1
    }else {
      if(y == null) {
        return 1
      }else {
        if(cljs.core.type(x) === cljs.core.type(y)) {
          if(function() {
            var G__9294__9295 = x;
            if(G__9294__9295) {
              if(cljs.core.truth_(function() {
                var or__3824__auto____9296 = null;
                if(cljs.core.truth_(or__3824__auto____9296)) {
                  return or__3824__auto____9296
                }else {
                  return G__9294__9295.cljs$core$IComparable$
                }
              }())) {
                return true
              }else {
                if(!G__9294__9295.cljs$lang$protocol_mask$partition$) {
                  return cljs.core.type_satisfies_(cljs.core.IComparable, G__9294__9295)
                }else {
                  return false
                }
              }
            }else {
              return cljs.core.type_satisfies_(cljs.core.IComparable, G__9294__9295)
            }
          }()) {
            return cljs.core._compare(x, y)
          }else {
            return goog.array.defaultCompare(x, y)
          }
        }else {
          if("\ufdd0'else") {
            throw new Error("compare on non-nil objects of different types");
          }else {
            return null
          }
        }
      }
    }
  }
};
cljs.core.compare_indexed = function() {
  var compare_indexed = null;
  var compare_indexed__2 = function(xs, ys) {
    var xl__9301 = cljs.core.count(xs);
    var yl__9302 = cljs.core.count(ys);
    if(xl__9301 < yl__9302) {
      return-1
    }else {
      if(xl__9301 > yl__9302) {
        return 1
      }else {
        if("\ufdd0'else") {
          return compare_indexed.cljs$lang$arity$4(xs, ys, xl__9301, 0)
        }else {
          return null
        }
      }
    }
  };
  var compare_indexed__4 = function(xs, ys, len, n) {
    while(true) {
      var d__9303 = cljs.core.compare(cljs.core.nth.cljs$lang$arity$2(xs, n), cljs.core.nth.cljs$lang$arity$2(ys, n));
      if(function() {
        var and__3822__auto____9304 = d__9303 === 0;
        if(and__3822__auto____9304) {
          return n + 1 < len
        }else {
          return and__3822__auto____9304
        }
      }()) {
        var G__9305 = xs;
        var G__9306 = ys;
        var G__9307 = len;
        var G__9308 = n + 1;
        xs = G__9305;
        ys = G__9306;
        len = G__9307;
        n = G__9308;
        continue
      }else {
        return d__9303
      }
      break
    }
  };
  compare_indexed = function(xs, ys, len, n) {
    switch(arguments.length) {
      case 2:
        return compare_indexed__2.call(this, xs, ys);
      case 4:
        return compare_indexed__4.call(this, xs, ys, len, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  compare_indexed.cljs$lang$arity$2 = compare_indexed__2;
  compare_indexed.cljs$lang$arity$4 = compare_indexed__4;
  return compare_indexed
}();
cljs.core.fn__GT_comparator = function fn__GT_comparator(f) {
  if(cljs.core._EQ_.cljs$lang$arity$2(f, cljs.core.compare)) {
    return cljs.core.compare
  }else {
    return function(x, y) {
      var r__9310 = f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(x, y) : f.call(null, x, y);
      if(cljs.core.number_QMARK_(r__9310)) {
        return r__9310
      }else {
        if(cljs.core.truth_(r__9310)) {
          return-1
        }else {
          if(cljs.core.truth_(f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(y, x) : f.call(null, y, x))) {
            return 1
          }else {
            return 0
          }
        }
      }
    }
  }
};
cljs.core.sort = function() {
  var sort = null;
  var sort__1 = function(coll) {
    return sort.cljs$lang$arity$2(cljs.core.compare, coll)
  };
  var sort__2 = function(comp, coll) {
    if(cljs.core.seq(coll)) {
      var a__9312 = cljs.core.to_array(coll);
      goog.array.stableSort(a__9312, cljs.core.fn__GT_comparator(comp));
      return cljs.core.seq(a__9312)
    }else {
      return cljs.core.List.EMPTY
    }
  };
  sort = function(comp, coll) {
    switch(arguments.length) {
      case 1:
        return sort__1.call(this, comp);
      case 2:
        return sort__2.call(this, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  sort.cljs$lang$arity$1 = sort__1;
  sort.cljs$lang$arity$2 = sort__2;
  return sort
}();
cljs.core.sort_by = function() {
  var sort_by = null;
  var sort_by__2 = function(keyfn, coll) {
    return sort_by.cljs$lang$arity$3(keyfn, cljs.core.compare, coll)
  };
  var sort_by__3 = function(keyfn, comp, coll) {
    return cljs.core.sort.cljs$lang$arity$2(function(x, y) {
      return cljs.core.fn__GT_comparator(comp).call(null, keyfn.cljs$lang$arity$1 ? keyfn.cljs$lang$arity$1(x) : keyfn.call(null, x), keyfn.cljs$lang$arity$1 ? keyfn.cljs$lang$arity$1(y) : keyfn.call(null, y))
    }, coll)
  };
  sort_by = function(keyfn, comp, coll) {
    switch(arguments.length) {
      case 2:
        return sort_by__2.call(this, keyfn, comp);
      case 3:
        return sort_by__3.call(this, keyfn, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  sort_by.cljs$lang$arity$2 = sort_by__2;
  sort_by.cljs$lang$arity$3 = sort_by__3;
  return sort_by
}();
cljs.core.seq_reduce = function() {
  var seq_reduce = null;
  var seq_reduce__2 = function(f, coll) {
    var temp__3971__auto____9318 = cljs.core.seq(coll);
    if(temp__3971__auto____9318) {
      var s__9319 = temp__3971__auto____9318;
      return cljs.core.reduce.cljs$lang$arity$3(f, cljs.core.first(s__9319), cljs.core.next(s__9319))
    }else {
      return f.cljs$lang$arity$0 ? f.cljs$lang$arity$0() : f.call(null)
    }
  };
  var seq_reduce__3 = function(f, val, coll) {
    var val__9320 = val;
    var coll__9321 = cljs.core.seq(coll);
    while(true) {
      if(coll__9321) {
        var nval__9322 = f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(val__9320, cljs.core.first(coll__9321)) : f.call(null, val__9320, cljs.core.first(coll__9321));
        if(cljs.core.reduced_QMARK_(nval__9322)) {
          return cljs.core.deref(nval__9322)
        }else {
          var G__9323 = nval__9322;
          var G__9324 = cljs.core.next(coll__9321);
          val__9320 = G__9323;
          coll__9321 = G__9324;
          continue
        }
      }else {
        return val__9320
      }
      break
    }
  };
  seq_reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return seq_reduce__2.call(this, f, val);
      case 3:
        return seq_reduce__3.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  seq_reduce.cljs$lang$arity$2 = seq_reduce__2;
  seq_reduce.cljs$lang$arity$3 = seq_reduce__3;
  return seq_reduce
}();
cljs.core.shuffle = function shuffle(coll) {
  var a__9326 = cljs.core.to_array(coll);
  goog.array.shuffle(a__9326);
  return cljs.core.vec(a__9326)
};
cljs.core.reduce = function() {
  var reduce = null;
  var reduce__2 = function(f, coll) {
    if(function() {
      var G__9333__9334 = coll;
      if(G__9333__9334) {
        if(function() {
          var or__3824__auto____9335 = G__9333__9334.cljs$lang$protocol_mask$partition0$ & 524288;
          if(or__3824__auto____9335) {
            return or__3824__auto____9335
          }else {
            return G__9333__9334.cljs$core$IReduce$
          }
        }()) {
          return true
        }else {
          if(!G__9333__9334.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_(cljs.core.IReduce, G__9333__9334)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_(cljs.core.IReduce, G__9333__9334)
      }
    }()) {
      return cljs.core._reduce.cljs$lang$arity$2(coll, f)
    }else {
      return cljs.core.seq_reduce.cljs$lang$arity$2(f, coll)
    }
  };
  var reduce__3 = function(f, val, coll) {
    if(function() {
      var G__9336__9337 = coll;
      if(G__9336__9337) {
        if(function() {
          var or__3824__auto____9338 = G__9336__9337.cljs$lang$protocol_mask$partition0$ & 524288;
          if(or__3824__auto____9338) {
            return or__3824__auto____9338
          }else {
            return G__9336__9337.cljs$core$IReduce$
          }
        }()) {
          return true
        }else {
          if(!G__9336__9337.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_(cljs.core.IReduce, G__9336__9337)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_(cljs.core.IReduce, G__9336__9337)
      }
    }()) {
      return cljs.core._reduce.cljs$lang$arity$3(coll, f, val)
    }else {
      return cljs.core.seq_reduce.cljs$lang$arity$3(f, val, coll)
    }
  };
  reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return reduce__2.call(this, f, val);
      case 3:
        return reduce__3.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  reduce.cljs$lang$arity$2 = reduce__2;
  reduce.cljs$lang$arity$3 = reduce__3;
  return reduce
}();
cljs.core.reduce_kv = function reduce_kv(f, init, coll) {
  return cljs.core._kv_reduce(coll, f, init)
};
cljs.core.Reduced = function(val) {
  this.val = val;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32768
};
cljs.core.Reduced.cljs$lang$type = true;
cljs.core.Reduced.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/Reduced")
};
cljs.core.Reduced.prototype.cljs$core$IDeref$_deref$arity$1 = function(o) {
  var this__9339 = this;
  return this__9339.val
};
cljs.core.Reduced;
cljs.core.reduced_QMARK_ = function reduced_QMARK_(r) {
  return cljs.core.instance_QMARK_(cljs.core.Reduced, r)
};
cljs.core.reduced = function reduced(x) {
  return new cljs.core.Reduced(x)
};
cljs.core._PLUS_ = function() {
  var _PLUS_ = null;
  var _PLUS___0 = function() {
    return 0
  };
  var _PLUS___1 = function(x) {
    return x
  };
  var _PLUS___2 = function(x, y) {
    return x + y
  };
  var _PLUS___3 = function() {
    var G__9340__delegate = function(x, y, more) {
      return cljs.core.reduce.cljs$lang$arity$3(_PLUS_, x + y, more)
    };
    var G__9340 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9340__delegate.call(this, x, y, more)
    };
    G__9340.cljs$lang$maxFixedArity = 2;
    G__9340.cljs$lang$applyTo = function(arglist__9341) {
      var x = cljs.core.first(arglist__9341);
      var y = cljs.core.first(cljs.core.next(arglist__9341));
      var more = cljs.core.rest(cljs.core.next(arglist__9341));
      return G__9340__delegate(x, y, more)
    };
    G__9340.cljs$lang$arity$variadic = G__9340__delegate;
    return G__9340
  }();
  _PLUS_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _PLUS___0.call(this);
      case 1:
        return _PLUS___1.call(this, x);
      case 2:
        return _PLUS___2.call(this, x, y);
      default:
        return _PLUS___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _PLUS_.cljs$lang$maxFixedArity = 2;
  _PLUS_.cljs$lang$applyTo = _PLUS___3.cljs$lang$applyTo;
  _PLUS_.cljs$lang$arity$0 = _PLUS___0;
  _PLUS_.cljs$lang$arity$1 = _PLUS___1;
  _PLUS_.cljs$lang$arity$2 = _PLUS___2;
  _PLUS_.cljs$lang$arity$variadic = _PLUS___3.cljs$lang$arity$variadic;
  return _PLUS_
}();
cljs.core._ = function() {
  var _ = null;
  var ___1 = function(x) {
    return-x
  };
  var ___2 = function(x, y) {
    return x - y
  };
  var ___3 = function() {
    var G__9342__delegate = function(x, y, more) {
      return cljs.core.reduce.cljs$lang$arity$3(_, x - y, more)
    };
    var G__9342 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9342__delegate.call(this, x, y, more)
    };
    G__9342.cljs$lang$maxFixedArity = 2;
    G__9342.cljs$lang$applyTo = function(arglist__9343) {
      var x = cljs.core.first(arglist__9343);
      var y = cljs.core.first(cljs.core.next(arglist__9343));
      var more = cljs.core.rest(cljs.core.next(arglist__9343));
      return G__9342__delegate(x, y, more)
    };
    G__9342.cljs$lang$arity$variadic = G__9342__delegate;
    return G__9342
  }();
  _ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return ___1.call(this, x);
      case 2:
        return ___2.call(this, x, y);
      default:
        return ___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _.cljs$lang$maxFixedArity = 2;
  _.cljs$lang$applyTo = ___3.cljs$lang$applyTo;
  _.cljs$lang$arity$1 = ___1;
  _.cljs$lang$arity$2 = ___2;
  _.cljs$lang$arity$variadic = ___3.cljs$lang$arity$variadic;
  return _
}();
cljs.core._STAR_ = function() {
  var _STAR_ = null;
  var _STAR___0 = function() {
    return 1
  };
  var _STAR___1 = function(x) {
    return x
  };
  var _STAR___2 = function(x, y) {
    return x * y
  };
  var _STAR___3 = function() {
    var G__9344__delegate = function(x, y, more) {
      return cljs.core.reduce.cljs$lang$arity$3(_STAR_, x * y, more)
    };
    var G__9344 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9344__delegate.call(this, x, y, more)
    };
    G__9344.cljs$lang$maxFixedArity = 2;
    G__9344.cljs$lang$applyTo = function(arglist__9345) {
      var x = cljs.core.first(arglist__9345);
      var y = cljs.core.first(cljs.core.next(arglist__9345));
      var more = cljs.core.rest(cljs.core.next(arglist__9345));
      return G__9344__delegate(x, y, more)
    };
    G__9344.cljs$lang$arity$variadic = G__9344__delegate;
    return G__9344
  }();
  _STAR_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _STAR___0.call(this);
      case 1:
        return _STAR___1.call(this, x);
      case 2:
        return _STAR___2.call(this, x, y);
      default:
        return _STAR___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _STAR_.cljs$lang$maxFixedArity = 2;
  _STAR_.cljs$lang$applyTo = _STAR___3.cljs$lang$applyTo;
  _STAR_.cljs$lang$arity$0 = _STAR___0;
  _STAR_.cljs$lang$arity$1 = _STAR___1;
  _STAR_.cljs$lang$arity$2 = _STAR___2;
  _STAR_.cljs$lang$arity$variadic = _STAR___3.cljs$lang$arity$variadic;
  return _STAR_
}();
cljs.core._SLASH_ = function() {
  var _SLASH_ = null;
  var _SLASH___1 = function(x) {
    return _SLASH_.cljs$lang$arity$2(1, x)
  };
  var _SLASH___2 = function(x, y) {
    return x / y
  };
  var _SLASH___3 = function() {
    var G__9346__delegate = function(x, y, more) {
      return cljs.core.reduce.cljs$lang$arity$3(_SLASH_, _SLASH_.cljs$lang$arity$2(x, y), more)
    };
    var G__9346 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9346__delegate.call(this, x, y, more)
    };
    G__9346.cljs$lang$maxFixedArity = 2;
    G__9346.cljs$lang$applyTo = function(arglist__9347) {
      var x = cljs.core.first(arglist__9347);
      var y = cljs.core.first(cljs.core.next(arglist__9347));
      var more = cljs.core.rest(cljs.core.next(arglist__9347));
      return G__9346__delegate(x, y, more)
    };
    G__9346.cljs$lang$arity$variadic = G__9346__delegate;
    return G__9346
  }();
  _SLASH_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _SLASH___1.call(this, x);
      case 2:
        return _SLASH___2.call(this, x, y);
      default:
        return _SLASH___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _SLASH_.cljs$lang$maxFixedArity = 2;
  _SLASH_.cljs$lang$applyTo = _SLASH___3.cljs$lang$applyTo;
  _SLASH_.cljs$lang$arity$1 = _SLASH___1;
  _SLASH_.cljs$lang$arity$2 = _SLASH___2;
  _SLASH_.cljs$lang$arity$variadic = _SLASH___3.cljs$lang$arity$variadic;
  return _SLASH_
}();
cljs.core._LT_ = function() {
  var _LT_ = null;
  var _LT___1 = function(x) {
    return true
  };
  var _LT___2 = function(x, y) {
    return x < y
  };
  var _LT___3 = function() {
    var G__9348__delegate = function(x, y, more) {
      while(true) {
        if(x < y) {
          if(cljs.core.next(more)) {
            var G__9349 = y;
            var G__9350 = cljs.core.first(more);
            var G__9351 = cljs.core.next(more);
            x = G__9349;
            y = G__9350;
            more = G__9351;
            continue
          }else {
            return y < cljs.core.first(more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__9348 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9348__delegate.call(this, x, y, more)
    };
    G__9348.cljs$lang$maxFixedArity = 2;
    G__9348.cljs$lang$applyTo = function(arglist__9352) {
      var x = cljs.core.first(arglist__9352);
      var y = cljs.core.first(cljs.core.next(arglist__9352));
      var more = cljs.core.rest(cljs.core.next(arglist__9352));
      return G__9348__delegate(x, y, more)
    };
    G__9348.cljs$lang$arity$variadic = G__9348__delegate;
    return G__9348
  }();
  _LT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT___1.call(this, x);
      case 2:
        return _LT___2.call(this, x, y);
      default:
        return _LT___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT_.cljs$lang$maxFixedArity = 2;
  _LT_.cljs$lang$applyTo = _LT___3.cljs$lang$applyTo;
  _LT_.cljs$lang$arity$1 = _LT___1;
  _LT_.cljs$lang$arity$2 = _LT___2;
  _LT_.cljs$lang$arity$variadic = _LT___3.cljs$lang$arity$variadic;
  return _LT_
}();
cljs.core._LT__EQ_ = function() {
  var _LT__EQ_ = null;
  var _LT__EQ___1 = function(x) {
    return true
  };
  var _LT__EQ___2 = function(x, y) {
    return x <= y
  };
  var _LT__EQ___3 = function() {
    var G__9353__delegate = function(x, y, more) {
      while(true) {
        if(x <= y) {
          if(cljs.core.next(more)) {
            var G__9354 = y;
            var G__9355 = cljs.core.first(more);
            var G__9356 = cljs.core.next(more);
            x = G__9354;
            y = G__9355;
            more = G__9356;
            continue
          }else {
            return y <= cljs.core.first(more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__9353 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9353__delegate.call(this, x, y, more)
    };
    G__9353.cljs$lang$maxFixedArity = 2;
    G__9353.cljs$lang$applyTo = function(arglist__9357) {
      var x = cljs.core.first(arglist__9357);
      var y = cljs.core.first(cljs.core.next(arglist__9357));
      var more = cljs.core.rest(cljs.core.next(arglist__9357));
      return G__9353__delegate(x, y, more)
    };
    G__9353.cljs$lang$arity$variadic = G__9353__delegate;
    return G__9353
  }();
  _LT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT__EQ___1.call(this, x);
      case 2:
        return _LT__EQ___2.call(this, x, y);
      default:
        return _LT__EQ___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT__EQ_.cljs$lang$maxFixedArity = 2;
  _LT__EQ_.cljs$lang$applyTo = _LT__EQ___3.cljs$lang$applyTo;
  _LT__EQ_.cljs$lang$arity$1 = _LT__EQ___1;
  _LT__EQ_.cljs$lang$arity$2 = _LT__EQ___2;
  _LT__EQ_.cljs$lang$arity$variadic = _LT__EQ___3.cljs$lang$arity$variadic;
  return _LT__EQ_
}();
cljs.core._GT_ = function() {
  var _GT_ = null;
  var _GT___1 = function(x) {
    return true
  };
  var _GT___2 = function(x, y) {
    return x > y
  };
  var _GT___3 = function() {
    var G__9358__delegate = function(x, y, more) {
      while(true) {
        if(x > y) {
          if(cljs.core.next(more)) {
            var G__9359 = y;
            var G__9360 = cljs.core.first(more);
            var G__9361 = cljs.core.next(more);
            x = G__9359;
            y = G__9360;
            more = G__9361;
            continue
          }else {
            return y > cljs.core.first(more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__9358 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9358__delegate.call(this, x, y, more)
    };
    G__9358.cljs$lang$maxFixedArity = 2;
    G__9358.cljs$lang$applyTo = function(arglist__9362) {
      var x = cljs.core.first(arglist__9362);
      var y = cljs.core.first(cljs.core.next(arglist__9362));
      var more = cljs.core.rest(cljs.core.next(arglist__9362));
      return G__9358__delegate(x, y, more)
    };
    G__9358.cljs$lang$arity$variadic = G__9358__delegate;
    return G__9358
  }();
  _GT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT___1.call(this, x);
      case 2:
        return _GT___2.call(this, x, y);
      default:
        return _GT___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT_.cljs$lang$maxFixedArity = 2;
  _GT_.cljs$lang$applyTo = _GT___3.cljs$lang$applyTo;
  _GT_.cljs$lang$arity$1 = _GT___1;
  _GT_.cljs$lang$arity$2 = _GT___2;
  _GT_.cljs$lang$arity$variadic = _GT___3.cljs$lang$arity$variadic;
  return _GT_
}();
cljs.core._GT__EQ_ = function() {
  var _GT__EQ_ = null;
  var _GT__EQ___1 = function(x) {
    return true
  };
  var _GT__EQ___2 = function(x, y) {
    return x >= y
  };
  var _GT__EQ___3 = function() {
    var G__9363__delegate = function(x, y, more) {
      while(true) {
        if(x >= y) {
          if(cljs.core.next(more)) {
            var G__9364 = y;
            var G__9365 = cljs.core.first(more);
            var G__9366 = cljs.core.next(more);
            x = G__9364;
            y = G__9365;
            more = G__9366;
            continue
          }else {
            return y >= cljs.core.first(more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__9363 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9363__delegate.call(this, x, y, more)
    };
    G__9363.cljs$lang$maxFixedArity = 2;
    G__9363.cljs$lang$applyTo = function(arglist__9367) {
      var x = cljs.core.first(arglist__9367);
      var y = cljs.core.first(cljs.core.next(arglist__9367));
      var more = cljs.core.rest(cljs.core.next(arglist__9367));
      return G__9363__delegate(x, y, more)
    };
    G__9363.cljs$lang$arity$variadic = G__9363__delegate;
    return G__9363
  }();
  _GT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT__EQ___1.call(this, x);
      case 2:
        return _GT__EQ___2.call(this, x, y);
      default:
        return _GT__EQ___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT__EQ_.cljs$lang$maxFixedArity = 2;
  _GT__EQ_.cljs$lang$applyTo = _GT__EQ___3.cljs$lang$applyTo;
  _GT__EQ_.cljs$lang$arity$1 = _GT__EQ___1;
  _GT__EQ_.cljs$lang$arity$2 = _GT__EQ___2;
  _GT__EQ_.cljs$lang$arity$variadic = _GT__EQ___3.cljs$lang$arity$variadic;
  return _GT__EQ_
}();
cljs.core.dec = function dec(x) {
  return x - 1
};
cljs.core.max = function() {
  var max = null;
  var max__1 = function(x) {
    return x
  };
  var max__2 = function(x, y) {
    return x > y ? x : y
  };
  var max__3 = function() {
    var G__9368__delegate = function(x, y, more) {
      return cljs.core.reduce.cljs$lang$arity$3(max, x > y ? x : y, more)
    };
    var G__9368 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9368__delegate.call(this, x, y, more)
    };
    G__9368.cljs$lang$maxFixedArity = 2;
    G__9368.cljs$lang$applyTo = function(arglist__9369) {
      var x = cljs.core.first(arglist__9369);
      var y = cljs.core.first(cljs.core.next(arglist__9369));
      var more = cljs.core.rest(cljs.core.next(arglist__9369));
      return G__9368__delegate(x, y, more)
    };
    G__9368.cljs$lang$arity$variadic = G__9368__delegate;
    return G__9368
  }();
  max = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return max__1.call(this, x);
      case 2:
        return max__2.call(this, x, y);
      default:
        return max__3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  max.cljs$lang$maxFixedArity = 2;
  max.cljs$lang$applyTo = max__3.cljs$lang$applyTo;
  max.cljs$lang$arity$1 = max__1;
  max.cljs$lang$arity$2 = max__2;
  max.cljs$lang$arity$variadic = max__3.cljs$lang$arity$variadic;
  return max
}();
cljs.core.min = function() {
  var min = null;
  var min__1 = function(x) {
    return x
  };
  var min__2 = function(x, y) {
    return x < y ? x : y
  };
  var min__3 = function() {
    var G__9370__delegate = function(x, y, more) {
      return cljs.core.reduce.cljs$lang$arity$3(min, x < y ? x : y, more)
    };
    var G__9370 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9370__delegate.call(this, x, y, more)
    };
    G__9370.cljs$lang$maxFixedArity = 2;
    G__9370.cljs$lang$applyTo = function(arglist__9371) {
      var x = cljs.core.first(arglist__9371);
      var y = cljs.core.first(cljs.core.next(arglist__9371));
      var more = cljs.core.rest(cljs.core.next(arglist__9371));
      return G__9370__delegate(x, y, more)
    };
    G__9370.cljs$lang$arity$variadic = G__9370__delegate;
    return G__9370
  }();
  min = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return min__1.call(this, x);
      case 2:
        return min__2.call(this, x, y);
      default:
        return min__3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  min.cljs$lang$maxFixedArity = 2;
  min.cljs$lang$applyTo = min__3.cljs$lang$applyTo;
  min.cljs$lang$arity$1 = min__1;
  min.cljs$lang$arity$2 = min__2;
  min.cljs$lang$arity$variadic = min__3.cljs$lang$arity$variadic;
  return min
}();
cljs.core.fix = function fix(q) {
  if(q >= 0) {
    return Math.floor.cljs$lang$arity$1 ? Math.floor.cljs$lang$arity$1(q) : Math.floor.call(null, q)
  }else {
    return Math.ceil.cljs$lang$arity$1 ? Math.ceil.cljs$lang$arity$1(q) : Math.ceil.call(null, q)
  }
};
cljs.core.int$ = function int$(x) {
  return cljs.core.fix(x)
};
cljs.core.long$ = function long$(x) {
  return cljs.core.fix(x)
};
cljs.core.mod = function mod(n, d) {
  return n % d
};
cljs.core.quot = function quot(n, d) {
  var rem__9373 = n % d;
  return cljs.core.fix((n - rem__9373) / d)
};
cljs.core.rem = function rem(n, d) {
  var q__9375 = cljs.core.quot(n, d);
  return n - d * q__9375
};
cljs.core.rand = function() {
  var rand = null;
  var rand__0 = function() {
    return Math.random.cljs$lang$arity$0 ? Math.random.cljs$lang$arity$0() : Math.random.call(null)
  };
  var rand__1 = function(n) {
    return n * rand.cljs$lang$arity$0()
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__0.call(this);
      case 1:
        return rand__1.call(this, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  rand.cljs$lang$arity$0 = rand__0;
  rand.cljs$lang$arity$1 = rand__1;
  return rand
}();
cljs.core.rand_int = function rand_int(n) {
  return cljs.core.fix(cljs.core.rand.cljs$lang$arity$1(n))
};
cljs.core.bit_xor = function bit_xor(x, y) {
  return x ^ y
};
cljs.core.bit_and = function bit_and(x, y) {
  return x & y
};
cljs.core.bit_or = function bit_or(x, y) {
  return x | y
};
cljs.core.bit_and_not = function bit_and_not(x, y) {
  return x & ~y
};
cljs.core.bit_clear = function bit_clear(x, n) {
  return x & ~(1 << n)
};
cljs.core.bit_flip = function bit_flip(x, n) {
  return x ^ 1 << n
};
cljs.core.bit_not = function bit_not(x) {
  return~x
};
cljs.core.bit_set = function bit_set(x, n) {
  return x | 1 << n
};
cljs.core.bit_test = function bit_test(x, n) {
  return(x & 1 << n) != 0
};
cljs.core.bit_shift_left = function bit_shift_left(x, n) {
  return x << n
};
cljs.core.bit_shift_right = function bit_shift_right(x, n) {
  return x >> n
};
cljs.core.bit_shift_right_zero_fill = function bit_shift_right_zero_fill(x, n) {
  return x >>> n
};
cljs.core.bit_count = function bit_count(v) {
  var v__9378 = v - (v >> 1 & 1431655765);
  var v__9379 = (v__9378 & 858993459) + (v__9378 >> 2 & 858993459);
  return(v__9379 + (v__9379 >> 4) & 252645135) * 16843009 >> 24
};
cljs.core._EQ__EQ_ = function() {
  var _EQ__EQ_ = null;
  var _EQ__EQ___1 = function(x) {
    return true
  };
  var _EQ__EQ___2 = function(x, y) {
    return cljs.core._equiv(x, y)
  };
  var _EQ__EQ___3 = function() {
    var G__9380__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ__EQ_.cljs$lang$arity$2(x, y))) {
          if(cljs.core.next(more)) {
            var G__9381 = y;
            var G__9382 = cljs.core.first(more);
            var G__9383 = cljs.core.next(more);
            x = G__9381;
            y = G__9382;
            more = G__9383;
            continue
          }else {
            return _EQ__EQ_.cljs$lang$arity$2(y, cljs.core.first(more))
          }
        }else {
          return false
        }
        break
      }
    };
    var G__9380 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9380__delegate.call(this, x, y, more)
    };
    G__9380.cljs$lang$maxFixedArity = 2;
    G__9380.cljs$lang$applyTo = function(arglist__9384) {
      var x = cljs.core.first(arglist__9384);
      var y = cljs.core.first(cljs.core.next(arglist__9384));
      var more = cljs.core.rest(cljs.core.next(arglist__9384));
      return G__9380__delegate(x, y, more)
    };
    G__9380.cljs$lang$arity$variadic = G__9380__delegate;
    return G__9380
  }();
  _EQ__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _EQ__EQ___1.call(this, x);
      case 2:
        return _EQ__EQ___2.call(this, x, y);
      default:
        return _EQ__EQ___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _EQ__EQ_.cljs$lang$maxFixedArity = 2;
  _EQ__EQ_.cljs$lang$applyTo = _EQ__EQ___3.cljs$lang$applyTo;
  _EQ__EQ_.cljs$lang$arity$1 = _EQ__EQ___1;
  _EQ__EQ_.cljs$lang$arity$2 = _EQ__EQ___2;
  _EQ__EQ_.cljs$lang$arity$variadic = _EQ__EQ___3.cljs$lang$arity$variadic;
  return _EQ__EQ_
}();
cljs.core.pos_QMARK_ = function pos_QMARK_(n) {
  return n > 0
};
cljs.core.zero_QMARK_ = function zero_QMARK_(n) {
  return n === 0
};
cljs.core.neg_QMARK_ = function neg_QMARK_(x) {
  return x < 0
};
cljs.core.nthnext = function nthnext(coll, n) {
  var n__9388 = n;
  var xs__9389 = cljs.core.seq(coll);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3822__auto____9390 = xs__9389;
      if(and__3822__auto____9390) {
        return n__9388 > 0
      }else {
        return and__3822__auto____9390
      }
    }())) {
      var G__9391 = n__9388 - 1;
      var G__9392 = cljs.core.next(xs__9389);
      n__9388 = G__9391;
      xs__9389 = G__9392;
      continue
    }else {
      return xs__9389
    }
    break
  }
};
cljs.core.str_STAR_ = function() {
  var str_STAR_ = null;
  var str_STAR___0 = function() {
    return""
  };
  var str_STAR___1 = function(x) {
    if(x == null) {
      return""
    }else {
      if("\ufdd0'else") {
        return x.toString()
      }else {
        return null
      }
    }
  };
  var str_STAR___2 = function() {
    var G__9393__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__9394 = sb.append(str_STAR_.cljs$lang$arity$1(cljs.core.first(more)));
            var G__9395 = cljs.core.next(more);
            sb = G__9394;
            more = G__9395;
            continue
          }else {
            return str_STAR_.cljs$lang$arity$1(sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str_STAR_.cljs$lang$arity$1(x)), ys)
    };
    var G__9393 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__9393__delegate.call(this, x, ys)
    };
    G__9393.cljs$lang$maxFixedArity = 1;
    G__9393.cljs$lang$applyTo = function(arglist__9396) {
      var x = cljs.core.first(arglist__9396);
      var ys = cljs.core.rest(arglist__9396);
      return G__9393__delegate(x, ys)
    };
    G__9393.cljs$lang$arity$variadic = G__9393__delegate;
    return G__9393
  }();
  str_STAR_ = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str_STAR___0.call(this);
      case 1:
        return str_STAR___1.call(this, x);
      default:
        return str_STAR___2.cljs$lang$arity$variadic(x, cljs.core.array_seq(arguments, 1))
    }
    throw"Invalid arity: " + arguments.length;
  };
  str_STAR_.cljs$lang$maxFixedArity = 1;
  str_STAR_.cljs$lang$applyTo = str_STAR___2.cljs$lang$applyTo;
  str_STAR_.cljs$lang$arity$0 = str_STAR___0;
  str_STAR_.cljs$lang$arity$1 = str_STAR___1;
  str_STAR_.cljs$lang$arity$variadic = str_STAR___2.cljs$lang$arity$variadic;
  return str_STAR_
}();
cljs.core.str = function() {
  var str = null;
  var str__0 = function() {
    return""
  };
  var str__1 = function(x) {
    if(cljs.core.symbol_QMARK_(x)) {
      return x.substring(2, x.length)
    }else {
      if(cljs.core.keyword_QMARK_(x)) {
        return cljs.core.str_STAR_.cljs$lang$arity$variadic(":", cljs.core.array_seq([x.substring(2, x.length)], 0))
      }else {
        if(x == null) {
          return""
        }else {
          if("\ufdd0'else") {
            return x.toString()
          }else {
            return null
          }
        }
      }
    }
  };
  var str__2 = function() {
    var G__9397__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__9398 = sb.append(str.cljs$lang$arity$1(cljs.core.first(more)));
            var G__9399 = cljs.core.next(more);
            sb = G__9398;
            more = G__9399;
            continue
          }else {
            return cljs.core.str_STAR_.cljs$lang$arity$1(sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str.cljs$lang$arity$1(x)), ys)
    };
    var G__9397 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__9397__delegate.call(this, x, ys)
    };
    G__9397.cljs$lang$maxFixedArity = 1;
    G__9397.cljs$lang$applyTo = function(arglist__9400) {
      var x = cljs.core.first(arglist__9400);
      var ys = cljs.core.rest(arglist__9400);
      return G__9397__delegate(x, ys)
    };
    G__9397.cljs$lang$arity$variadic = G__9397__delegate;
    return G__9397
  }();
  str = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str__0.call(this);
      case 1:
        return str__1.call(this, x);
      default:
        return str__2.cljs$lang$arity$variadic(x, cljs.core.array_seq(arguments, 1))
    }
    throw"Invalid arity: " + arguments.length;
  };
  str.cljs$lang$maxFixedArity = 1;
  str.cljs$lang$applyTo = str__2.cljs$lang$applyTo;
  str.cljs$lang$arity$0 = str__0;
  str.cljs$lang$arity$1 = str__1;
  str.cljs$lang$arity$variadic = str__2.cljs$lang$arity$variadic;
  return str
}();
cljs.core.subs = function() {
  var subs = null;
  var subs__2 = function(s, start) {
    return s.substring(start)
  };
  var subs__3 = function(s, start, end) {
    return s.substring(start, end)
  };
  subs = function(s, start, end) {
    switch(arguments.length) {
      case 2:
        return subs__2.call(this, s, start);
      case 3:
        return subs__3.call(this, s, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  subs.cljs$lang$arity$2 = subs__2;
  subs.cljs$lang$arity$3 = subs__3;
  return subs
}();
cljs.core.format = function() {
  var format__delegate = function(fmt, args) {
    return cljs.core.apply.cljs$lang$arity$3(goog.string.format, fmt, args)
  };
  var format = function(fmt, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return format__delegate.call(this, fmt, args)
  };
  format.cljs$lang$maxFixedArity = 1;
  format.cljs$lang$applyTo = function(arglist__9401) {
    var fmt = cljs.core.first(arglist__9401);
    var args = cljs.core.rest(arglist__9401);
    return format__delegate(fmt, args)
  };
  format.cljs$lang$arity$variadic = format__delegate;
  return format
}();
cljs.core.symbol = function() {
  var symbol = null;
  var symbol__1 = function(name) {
    if(cljs.core.symbol_QMARK_(name)) {
      name
    }else {
      if(cljs.core.keyword_QMARK_(name)) {
        cljs.core.str_STAR_.cljs$lang$arity$variadic("\ufdd1", cljs.core.array_seq(["'", cljs.core.subs.cljs$lang$arity$2(name, 2)], 0))
      }else {
      }
    }
    return cljs.core.str_STAR_.cljs$lang$arity$variadic("\ufdd1", cljs.core.array_seq(["'", name], 0))
  };
  var symbol__2 = function(ns, name) {
    return symbol.cljs$lang$arity$1(cljs.core.str_STAR_.cljs$lang$arity$variadic(ns, cljs.core.array_seq(["/", name], 0)))
  };
  symbol = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return symbol__1.call(this, ns);
      case 2:
        return symbol__2.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  symbol.cljs$lang$arity$1 = symbol__1;
  symbol.cljs$lang$arity$2 = symbol__2;
  return symbol
}();
cljs.core.keyword = function() {
  var keyword = null;
  var keyword__1 = function(name) {
    if(cljs.core.keyword_QMARK_(name)) {
      return name
    }else {
      if(cljs.core.symbol_QMARK_(name)) {
        return cljs.core.str_STAR_.cljs$lang$arity$variadic("\ufdd0", cljs.core.array_seq(["'", cljs.core.subs.cljs$lang$arity$2(name, 2)], 0))
      }else {
        if("\ufdd0'else") {
          return cljs.core.str_STAR_.cljs$lang$arity$variadic("\ufdd0", cljs.core.array_seq(["'", name], 0))
        }else {
          return null
        }
      }
    }
  };
  var keyword__2 = function(ns, name) {
    return keyword.cljs$lang$arity$1(cljs.core.str_STAR_.cljs$lang$arity$variadic(ns, cljs.core.array_seq(["/", name], 0)))
  };
  keyword = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return keyword__1.call(this, ns);
      case 2:
        return keyword__2.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  keyword.cljs$lang$arity$1 = keyword__1;
  keyword.cljs$lang$arity$2 = keyword__2;
  return keyword
}();
cljs.core.equiv_sequential = function equiv_sequential(x, y) {
  return cljs.core.boolean$(cljs.core.sequential_QMARK_(y) ? function() {
    var xs__9404 = cljs.core.seq(x);
    var ys__9405 = cljs.core.seq(y);
    while(true) {
      if(xs__9404 == null) {
        return ys__9405 == null
      }else {
        if(ys__9405 == null) {
          return false
        }else {
          if(cljs.core._EQ_.cljs$lang$arity$2(cljs.core.first(xs__9404), cljs.core.first(ys__9405))) {
            var G__9406 = cljs.core.next(xs__9404);
            var G__9407 = cljs.core.next(ys__9405);
            xs__9404 = G__9406;
            ys__9405 = G__9407;
            continue
          }else {
            if("\ufdd0'else") {
              return false
            }else {
              return null
            }
          }
        }
      }
      break
    }
  }() : null)
};
cljs.core.hash_combine = function hash_combine(seed, hash) {
  return seed ^ hash + 2654435769 + (seed << 6) + (seed >> 2)
};
cljs.core.hash_coll = function hash_coll(coll) {
  return cljs.core.reduce.cljs$lang$arity$3(function(p1__9408_SHARP_, p2__9409_SHARP_) {
    return cljs.core.hash_combine(p1__9408_SHARP_, cljs.core.hash.cljs$lang$arity$2(p2__9409_SHARP_, false))
  }, cljs.core.hash.cljs$lang$arity$2(cljs.core.first(coll), false), cljs.core.next(coll))
};
cljs.core.hash_imap = function hash_imap(m) {
  var h__9413 = 0;
  var s__9414 = cljs.core.seq(m);
  while(true) {
    if(s__9414) {
      var e__9415 = cljs.core.first(s__9414);
      var G__9416 = (h__9413 + (cljs.core.hash.cljs$lang$arity$1(cljs.core.key(e__9415)) ^ cljs.core.hash.cljs$lang$arity$1(cljs.core.val(e__9415)))) % 4503599627370496;
      var G__9417 = cljs.core.next(s__9414);
      h__9413 = G__9416;
      s__9414 = G__9417;
      continue
    }else {
      return h__9413
    }
    break
  }
};
cljs.core.hash_iset = function hash_iset(s) {
  var h__9421 = 0;
  var s__9422 = cljs.core.seq(s);
  while(true) {
    if(s__9422) {
      var e__9423 = cljs.core.first(s__9422);
      var G__9424 = (h__9421 + cljs.core.hash.cljs$lang$arity$1(e__9423)) % 4503599627370496;
      var G__9425 = cljs.core.next(s__9422);
      h__9421 = G__9424;
      s__9422 = G__9425;
      continue
    }else {
      return h__9421
    }
    break
  }
};
cljs.core.extend_object_BANG_ = function extend_object_BANG_(obj, fn_map) {
  var G__9446__9447 = cljs.core.seq(fn_map);
  if(G__9446__9447) {
    var G__9449__9451 = cljs.core.first(G__9446__9447);
    var vec__9450__9452 = G__9449__9451;
    var key_name__9453 = cljs.core.nth.cljs$lang$arity$3(vec__9450__9452, 0, null);
    var f__9454 = cljs.core.nth.cljs$lang$arity$3(vec__9450__9452, 1, null);
    var G__9446__9455 = G__9446__9447;
    var G__9449__9456 = G__9449__9451;
    var G__9446__9457 = G__9446__9455;
    while(true) {
      var vec__9458__9459 = G__9449__9456;
      var key_name__9460 = cljs.core.nth.cljs$lang$arity$3(vec__9458__9459, 0, null);
      var f__9461 = cljs.core.nth.cljs$lang$arity$3(vec__9458__9459, 1, null);
      var G__9446__9462 = G__9446__9457;
      var str_name__9463 = cljs.core.name(key_name__9460);
      obj[str_name__9463] = f__9461;
      var temp__3974__auto____9464 = cljs.core.next(G__9446__9462);
      if(temp__3974__auto____9464) {
        var G__9446__9465 = temp__3974__auto____9464;
        var G__9466 = cljs.core.first(G__9446__9465);
        var G__9467 = G__9446__9465;
        G__9449__9456 = G__9466;
        G__9446__9457 = G__9467;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return obj
};
cljs.core.List = function(meta, first, rest, count, __hash) {
  this.meta = meta;
  this.first = first;
  this.rest = rest;
  this.count = count;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 65413358
};
cljs.core.List.cljs$lang$type = true;
cljs.core.List.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/List")
};
cljs.core.List.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9468 = this;
  var h__2192__auto____9469 = this__9468.__hash;
  if(!(h__2192__auto____9469 == null)) {
    return h__2192__auto____9469
  }else {
    var h__2192__auto____9470 = cljs.core.hash_coll(coll);
    this__9468.__hash = h__2192__auto____9470;
    return h__2192__auto____9470
  }
};
cljs.core.List.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__9471 = this;
  if(this__9471.count === 1) {
    return null
  }else {
    return this__9471.rest
  }
};
cljs.core.List.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9472 = this;
  return new cljs.core.List(this__9472.meta, o, coll, this__9472.count + 1, null)
};
cljs.core.List.prototype.toString = function() {
  var this__9473 = this;
  var this__9474 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__9474], 0))
};
cljs.core.List.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9475 = this;
  return coll
};
cljs.core.List.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9476 = this;
  return this__9476.count
};
cljs.core.List.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__9477 = this;
  return this__9477.first
};
cljs.core.List.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__9478 = this;
  return coll.cljs$core$ISeq$_rest$arity$1(coll)
};
cljs.core.List.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9479 = this;
  return this__9479.first
};
cljs.core.List.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9480 = this;
  if(this__9480.count === 1) {
    return cljs.core.List.EMPTY
  }else {
    return this__9480.rest
  }
};
cljs.core.List.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9481 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9482 = this;
  return new cljs.core.List(meta, this__9482.first, this__9482.rest, this__9482.count, this__9482.__hash)
};
cljs.core.List.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9483 = this;
  return this__9483.meta
};
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9484 = this;
  return cljs.core.List.EMPTY
};
cljs.core.List;
cljs.core.EmptyList = function(meta) {
  this.meta = meta;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 65413326
};
cljs.core.EmptyList.cljs$lang$type = true;
cljs.core.EmptyList.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/EmptyList")
};
cljs.core.EmptyList.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9485 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__9486 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9487 = this;
  return new cljs.core.List(this__9487.meta, o, null, 1, null)
};
cljs.core.EmptyList.prototype.toString = function() {
  var this__9488 = this;
  var this__9489 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__9489], 0))
};
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9490 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9491 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__9492 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__9493 = this;
  throw new Error("Can't pop empty list");
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9494 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9495 = this;
  return cljs.core.List.EMPTY
};
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9496 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9497 = this;
  return new cljs.core.EmptyList(meta)
};
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9498 = this;
  return this__9498.meta
};
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9499 = this;
  return coll
};
cljs.core.EmptyList;
cljs.core.List.EMPTY = new cljs.core.EmptyList(null);
cljs.core.reversible_QMARK_ = function reversible_QMARK_(coll) {
  var G__9503__9504 = coll;
  if(G__9503__9504) {
    if(function() {
      var or__3824__auto____9505 = G__9503__9504.cljs$lang$protocol_mask$partition0$ & 134217728;
      if(or__3824__auto____9505) {
        return or__3824__auto____9505
      }else {
        return G__9503__9504.cljs$core$IReversible$
      }
    }()) {
      return true
    }else {
      if(!G__9503__9504.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_(cljs.core.IReversible, G__9503__9504)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_(cljs.core.IReversible, G__9503__9504)
  }
};
cljs.core.rseq = function rseq(coll) {
  return cljs.core._rseq(coll)
};
cljs.core.reverse = function reverse(coll) {
  if(cljs.core.reversible_QMARK_(coll)) {
    return cljs.core.rseq(coll)
  }else {
    return cljs.core.reduce.cljs$lang$arity$3(cljs.core.conj, cljs.core.List.EMPTY, coll)
  }
};
cljs.core.list = function() {
  var list = null;
  var list__0 = function() {
    return cljs.core.List.EMPTY
  };
  var list__1 = function(x) {
    return cljs.core.conj.cljs$lang$arity$2(cljs.core.List.EMPTY, x)
  };
  var list__2 = function(x, y) {
    return cljs.core.conj.cljs$lang$arity$2(list.cljs$lang$arity$1(y), x)
  };
  var list__3 = function(x, y, z) {
    return cljs.core.conj.cljs$lang$arity$2(list.cljs$lang$arity$2(y, z), x)
  };
  var list__4 = function() {
    var G__9506__delegate = function(x, y, z, items) {
      return cljs.core.conj.cljs$lang$arity$2(cljs.core.conj.cljs$lang$arity$2(cljs.core.conj.cljs$lang$arity$2(cljs.core.reduce.cljs$lang$arity$3(cljs.core.conj, cljs.core.List.EMPTY, cljs.core.reverse(items)), z), y), x)
    };
    var G__9506 = function(x, y, z, var_args) {
      var items = null;
      if(goog.isDef(var_args)) {
        items = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__9506__delegate.call(this, x, y, z, items)
    };
    G__9506.cljs$lang$maxFixedArity = 3;
    G__9506.cljs$lang$applyTo = function(arglist__9507) {
      var x = cljs.core.first(arglist__9507);
      var y = cljs.core.first(cljs.core.next(arglist__9507));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9507)));
      var items = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9507)));
      return G__9506__delegate(x, y, z, items)
    };
    G__9506.cljs$lang$arity$variadic = G__9506__delegate;
    return G__9506
  }();
  list = function(x, y, z, var_args) {
    var items = var_args;
    switch(arguments.length) {
      case 0:
        return list__0.call(this);
      case 1:
        return list__1.call(this, x);
      case 2:
        return list__2.call(this, x, y);
      case 3:
        return list__3.call(this, x, y, z);
      default:
        return list__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  list.cljs$lang$maxFixedArity = 3;
  list.cljs$lang$applyTo = list__4.cljs$lang$applyTo;
  list.cljs$lang$arity$0 = list__0;
  list.cljs$lang$arity$1 = list__1;
  list.cljs$lang$arity$2 = list__2;
  list.cljs$lang$arity$3 = list__3;
  list.cljs$lang$arity$variadic = list__4.cljs$lang$arity$variadic;
  return list
}();
cljs.core.Cons = function(meta, first, rest, __hash) {
  this.meta = meta;
  this.first = first;
  this.rest = rest;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 65405164
};
cljs.core.Cons.cljs$lang$type = true;
cljs.core.Cons.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/Cons")
};
cljs.core.Cons.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9508 = this;
  var h__2192__auto____9509 = this__9508.__hash;
  if(!(h__2192__auto____9509 == null)) {
    return h__2192__auto____9509
  }else {
    var h__2192__auto____9510 = cljs.core.hash_coll(coll);
    this__9508.__hash = h__2192__auto____9510;
    return h__2192__auto____9510
  }
};
cljs.core.Cons.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__9511 = this;
  if(this__9511.rest == null) {
    return null
  }else {
    return cljs.core._seq(this__9511.rest)
  }
};
cljs.core.Cons.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9512 = this;
  return new cljs.core.Cons(null, o, coll, this__9512.__hash)
};
cljs.core.Cons.prototype.toString = function() {
  var this__9513 = this;
  var this__9514 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__9514], 0))
};
cljs.core.Cons.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9515 = this;
  return coll
};
cljs.core.Cons.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9516 = this;
  return this__9516.first
};
cljs.core.Cons.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9517 = this;
  if(this__9517.rest == null) {
    return cljs.core.List.EMPTY
  }else {
    return this__9517.rest
  }
};
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9518 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9519 = this;
  return new cljs.core.Cons(meta, this__9519.first, this__9519.rest, this__9519.__hash)
};
cljs.core.Cons.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9520 = this;
  return this__9520.meta
};
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9521 = this;
  return cljs.core.with_meta(cljs.core.List.EMPTY, this__9521.meta)
};
cljs.core.Cons;
cljs.core.cons = function cons(x, coll) {
  if(function() {
    var or__3824__auto____9526 = coll == null;
    if(or__3824__auto____9526) {
      return or__3824__auto____9526
    }else {
      var G__9527__9528 = coll;
      if(G__9527__9528) {
        if(function() {
          var or__3824__auto____9529 = G__9527__9528.cljs$lang$protocol_mask$partition0$ & 64;
          if(or__3824__auto____9529) {
            return or__3824__auto____9529
          }else {
            return G__9527__9528.cljs$core$ISeq$
          }
        }()) {
          return true
        }else {
          if(!G__9527__9528.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_(cljs.core.ISeq, G__9527__9528)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_(cljs.core.ISeq, G__9527__9528)
      }
    }
  }()) {
    return new cljs.core.Cons(null, x, coll, null)
  }else {
    return new cljs.core.Cons(null, x, cljs.core.seq(coll), null)
  }
};
cljs.core.list_QMARK_ = function list_QMARK_(x) {
  var G__9533__9534 = x;
  if(G__9533__9534) {
    if(function() {
      var or__3824__auto____9535 = G__9533__9534.cljs$lang$protocol_mask$partition0$ & 33554432;
      if(or__3824__auto____9535) {
        return or__3824__auto____9535
      }else {
        return G__9533__9534.cljs$core$IList$
      }
    }()) {
      return true
    }else {
      if(!G__9533__9534.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_(cljs.core.IList, G__9533__9534)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_(cljs.core.IList, G__9533__9534)
  }
};
cljs.core.IReduce["string"] = true;
cljs.core._reduce["string"] = function() {
  var G__9536 = null;
  var G__9536__2 = function(string, f) {
    return cljs.core.ci_reduce.cljs$lang$arity$2(string, f)
  };
  var G__9536__3 = function(string, f, start) {
    return cljs.core.ci_reduce.cljs$lang$arity$3(string, f, start)
  };
  G__9536 = function(string, f, start) {
    switch(arguments.length) {
      case 2:
        return G__9536__2.call(this, string, f);
      case 3:
        return G__9536__3.call(this, string, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9536
}();
cljs.core.ILookup["string"] = true;
cljs.core._lookup["string"] = function() {
  var G__9537 = null;
  var G__9537__2 = function(string, k) {
    return cljs.core._nth.cljs$lang$arity$2(string, k)
  };
  var G__9537__3 = function(string, k, not_found) {
    return cljs.core._nth.cljs$lang$arity$3(string, k, not_found)
  };
  G__9537 = function(string, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9537__2.call(this, string, k);
      case 3:
        return G__9537__3.call(this, string, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9537
}();
cljs.core.IIndexed["string"] = true;
cljs.core._nth["string"] = function() {
  var G__9538 = null;
  var G__9538__2 = function(string, n) {
    if(n < cljs.core._count(string)) {
      return string.charAt(n)
    }else {
      return null
    }
  };
  var G__9538__3 = function(string, n, not_found) {
    if(n < cljs.core._count(string)) {
      return string.charAt(n)
    }else {
      return not_found
    }
  };
  G__9538 = function(string, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9538__2.call(this, string, n);
      case 3:
        return G__9538__3.call(this, string, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9538
}();
cljs.core.ICounted["string"] = true;
cljs.core._count["string"] = function(s) {
  return s.length
};
cljs.core.ISeqable["string"] = true;
cljs.core._seq["string"] = function(string) {
  return cljs.core.prim_seq.cljs$lang$arity$2(string, 0)
};
cljs.core.IHash["string"] = true;
cljs.core._hash["string"] = function(o) {
  return goog.string.hashCode(o)
};
cljs.core.Keyword = function(k) {
  this.k = k;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 1
};
cljs.core.Keyword.cljs$lang$type = true;
cljs.core.Keyword.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/Keyword")
};
cljs.core.Keyword.prototype.call = function() {
  var G__9550 = null;
  var G__9550__2 = function(this_sym9541, coll) {
    var this__9543 = this;
    var this_sym9541__9544 = this;
    var ___9545 = this_sym9541__9544;
    if(coll == null) {
      return null
    }else {
      var strobj__9546 = coll.strobj;
      if(strobj__9546 == null) {
        return cljs.core._lookup.cljs$lang$arity$3(coll, this__9543.k, null)
      }else {
        return strobj__9546[this__9543.k]
      }
    }
  };
  var G__9550__3 = function(this_sym9542, coll, not_found) {
    var this__9543 = this;
    var this_sym9542__9547 = this;
    var ___9548 = this_sym9542__9547;
    if(coll == null) {
      return not_found
    }else {
      return cljs.core._lookup.cljs$lang$arity$3(coll, this__9543.k, not_found)
    }
  };
  G__9550 = function(this_sym9542, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9550__2.call(this, this_sym9542, coll);
      case 3:
        return G__9550__3.call(this, this_sym9542, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9550
}();
cljs.core.Keyword.prototype.apply = function(this_sym9539, args9540) {
  var this__9549 = this;
  return this_sym9539.call.apply(this_sym9539, [this_sym9539].concat(args9540.slice()))
};
cljs.core.Keyword;
String.prototype.cljs$core$IFn$ = true;
String.prototype.call = function() {
  var G__9559 = null;
  var G__9559__2 = function(this_sym9553, coll) {
    var this_sym9553__9555 = this;
    var this__9556 = this_sym9553__9555;
    return cljs.core._lookup.cljs$lang$arity$3(coll, this__9556.toString(), null)
  };
  var G__9559__3 = function(this_sym9554, coll, not_found) {
    var this_sym9554__9557 = this;
    var this__9558 = this_sym9554__9557;
    return cljs.core._lookup.cljs$lang$arity$3(coll, this__9558.toString(), not_found)
  };
  G__9559 = function(this_sym9554, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9559__2.call(this, this_sym9554, coll);
      case 3:
        return G__9559__3.call(this, this_sym9554, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9559
}();
String.prototype.apply = function(this_sym9551, args9552) {
  return this_sym9551.call.apply(this_sym9551, [this_sym9551].concat(args9552.slice()))
};
String.prototype.apply = function(s, args) {
  if(cljs.core.count(args) < 2) {
    return cljs.core._lookup.cljs$lang$arity$3(args[0], s, null)
  }else {
    return cljs.core._lookup.cljs$lang$arity$3(args[0], s, args[1])
  }
};
cljs.core.lazy_seq_value = function lazy_seq_value(lazy_seq) {
  var x__9561 = lazy_seq.x;
  if(lazy_seq.realized) {
    return x__9561
  }else {
    lazy_seq.x = x__9561.cljs$lang$arity$0 ? x__9561.cljs$lang$arity$0() : x__9561.call(null);
    lazy_seq.realized = true;
    return lazy_seq.x
  }
};
cljs.core.LazySeq = function(meta, realized, x, __hash) {
  this.meta = meta;
  this.realized = realized;
  this.x = x;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31850700
};
cljs.core.LazySeq.cljs$lang$type = true;
cljs.core.LazySeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/LazySeq")
};
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9562 = this;
  var h__2192__auto____9563 = this__9562.__hash;
  if(!(h__2192__auto____9563 == null)) {
    return h__2192__auto____9563
  }else {
    var h__2192__auto____9564 = cljs.core.hash_coll(coll);
    this__9562.__hash = h__2192__auto____9564;
    return h__2192__auto____9564
  }
};
cljs.core.LazySeq.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__9565 = this;
  return cljs.core._seq(coll.cljs$core$ISeq$_rest$arity$1(coll))
};
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9566 = this;
  return cljs.core.cons(o, coll)
};
cljs.core.LazySeq.prototype.toString = function() {
  var this__9567 = this;
  var this__9568 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__9568], 0))
};
cljs.core.LazySeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9569 = this;
  return cljs.core.seq(cljs.core.lazy_seq_value(coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9570 = this;
  return cljs.core.first(cljs.core.lazy_seq_value(coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9571 = this;
  return cljs.core.rest(cljs.core.lazy_seq_value(coll))
};
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9572 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9573 = this;
  return new cljs.core.LazySeq(meta, this__9573.realized, this__9573.x, this__9573.__hash)
};
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9574 = this;
  return this__9574.meta
};
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9575 = this;
  return cljs.core.with_meta(cljs.core.List.EMPTY, this__9575.meta)
};
cljs.core.LazySeq;
cljs.core.ChunkBuffer = function(buf, end) {
  this.buf = buf;
  this.end = end;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 2
};
cljs.core.ChunkBuffer.cljs$lang$type = true;
cljs.core.ChunkBuffer.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/ChunkBuffer")
};
cljs.core.ChunkBuffer.prototype.cljs$core$ICounted$_count$arity$1 = function(_) {
  var this__9576 = this;
  return this__9576.end
};
cljs.core.ChunkBuffer.prototype.add = function(o) {
  var this__9577 = this;
  var ___9578 = this;
  this__9577.buf[this__9577.end] = o;
  return this__9577.end = this__9577.end + 1
};
cljs.core.ChunkBuffer.prototype.chunk = function(o) {
  var this__9579 = this;
  var ___9580 = this;
  var ret__9581 = new cljs.core.ArrayChunk(this__9579.buf, 0, this__9579.end);
  this__9579.buf = null;
  return ret__9581
};
cljs.core.ChunkBuffer;
cljs.core.chunk_buffer = function chunk_buffer(capacity) {
  return new cljs.core.ChunkBuffer(cljs.core.make_array.cljs$lang$arity$1(capacity), 0)
};
cljs.core.ArrayChunk = function(arr, off, end) {
  this.arr = arr;
  this.off = off;
  this.end = end;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 524306
};
cljs.core.ArrayChunk.cljs$lang$type = true;
cljs.core.ArrayChunk.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/ArrayChunk")
};
cljs.core.ArrayChunk.prototype.cljs$core$IReduce$_reduce$arity$2 = function(coll, f) {
  var this__9582 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$4(coll, f, this__9582.arr[this__9582.off], this__9582.off + 1)
};
cljs.core.ArrayChunk.prototype.cljs$core$IReduce$_reduce$arity$3 = function(coll, f, start) {
  var this__9583 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$4(coll, f, start, this__9583.off)
};
cljs.core.ArrayChunk.prototype.cljs$core$IChunk$ = true;
cljs.core.ArrayChunk.prototype.cljs$core$IChunk$_drop_first$arity$1 = function(coll) {
  var this__9584 = this;
  if(this__9584.off === this__9584.end) {
    throw new Error("-drop-first of empty chunk");
  }else {
    return new cljs.core.ArrayChunk(this__9584.arr, this__9584.off + 1, this__9584.end)
  }
};
cljs.core.ArrayChunk.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, i) {
  var this__9585 = this;
  return this__9585.arr[this__9585.off + i]
};
cljs.core.ArrayChunk.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, i, not_found) {
  var this__9586 = this;
  if(function() {
    var and__3822__auto____9587 = i >= 0;
    if(and__3822__auto____9587) {
      return i < this__9586.end - this__9586.off
    }else {
      return and__3822__auto____9587
    }
  }()) {
    return this__9586.arr[this__9586.off + i]
  }else {
    return not_found
  }
};
cljs.core.ArrayChunk.prototype.cljs$core$ICounted$_count$arity$1 = function(_) {
  var this__9588 = this;
  return this__9588.end - this__9588.off
};
cljs.core.ArrayChunk;
cljs.core.array_chunk = function() {
  var array_chunk = null;
  var array_chunk__1 = function(arr) {
    return array_chunk.cljs$lang$arity$3(arr, 0, arr.length)
  };
  var array_chunk__2 = function(arr, off) {
    return array_chunk.cljs$lang$arity$3(arr, off, arr.length)
  };
  var array_chunk__3 = function(arr, off, end) {
    return new cljs.core.ArrayChunk(arr, off, end)
  };
  array_chunk = function(arr, off, end) {
    switch(arguments.length) {
      case 1:
        return array_chunk__1.call(this, arr);
      case 2:
        return array_chunk__2.call(this, arr, off);
      case 3:
        return array_chunk__3.call(this, arr, off, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  array_chunk.cljs$lang$arity$1 = array_chunk__1;
  array_chunk.cljs$lang$arity$2 = array_chunk__2;
  array_chunk.cljs$lang$arity$3 = array_chunk__3;
  return array_chunk
}();
cljs.core.ChunkedCons = function(chunk, more, meta) {
  this.chunk = chunk;
  this.more = more;
  this.meta = meta;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 27656296
};
cljs.core.ChunkedCons.cljs$lang$type = true;
cljs.core.ChunkedCons.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/ChunkedCons")
};
cljs.core.ChunkedCons.prototype.cljs$core$ICollection$_conj$arity$2 = function(this$, o) {
  var this__9589 = this;
  return cljs.core.cons(o, this$)
};
cljs.core.ChunkedCons.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9590 = this;
  return coll
};
cljs.core.ChunkedCons.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9591 = this;
  return cljs.core._nth.cljs$lang$arity$2(this__9591.chunk, 0)
};
cljs.core.ChunkedCons.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9592 = this;
  if(cljs.core._count(this__9592.chunk) > 1) {
    return new cljs.core.ChunkedCons(cljs.core._drop_first(this__9592.chunk), this__9592.more, this__9592.meta)
  }else {
    if(this__9592.more == null) {
      return cljs.core.List.EMPTY
    }else {
      return this__9592.more
    }
  }
};
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedNext$ = true;
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedNext$_chunked_next$arity$1 = function(coll) {
  var this__9593 = this;
  if(this__9593.more == null) {
    return null
  }else {
    return this__9593.more
  }
};
cljs.core.ChunkedCons.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9594 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.ChunkedCons.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, m) {
  var this__9595 = this;
  return new cljs.core.ChunkedCons(this__9595.chunk, this__9595.more, m)
};
cljs.core.ChunkedCons.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9596 = this;
  return this__9596.meta
};
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedSeq$ = true;
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedSeq$_chunked_first$arity$1 = function(coll) {
  var this__9597 = this;
  return this__9597.chunk
};
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedSeq$_chunked_rest$arity$1 = function(coll) {
  var this__9598 = this;
  if(this__9598.more == null) {
    return cljs.core.List.EMPTY
  }else {
    return this__9598.more
  }
};
cljs.core.ChunkedCons;
cljs.core.chunk_cons = function chunk_cons(chunk, rest) {
  if(cljs.core._count(chunk) === 0) {
    return rest
  }else {
    return new cljs.core.ChunkedCons(chunk, rest, null)
  }
};
cljs.core.chunk_append = function chunk_append(b, x) {
  return b.add(x)
};
cljs.core.chunk = function chunk(b) {
  return b.chunk()
};
cljs.core.chunk_first = function chunk_first(s) {
  return cljs.core._chunked_first(s)
};
cljs.core.chunk_rest = function chunk_rest(s) {
  return cljs.core._chunked_rest(s)
};
cljs.core.chunk_next = function chunk_next(s) {
  if(function() {
    var G__9602__9603 = s;
    if(G__9602__9603) {
      if(cljs.core.truth_(function() {
        var or__3824__auto____9604 = null;
        if(cljs.core.truth_(or__3824__auto____9604)) {
          return or__3824__auto____9604
        }else {
          return G__9602__9603.cljs$core$IChunkedNext$
        }
      }())) {
        return true
      }else {
        if(!G__9602__9603.cljs$lang$protocol_mask$partition$) {
          return cljs.core.type_satisfies_(cljs.core.IChunkedNext, G__9602__9603)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_(cljs.core.IChunkedNext, G__9602__9603)
    }
  }()) {
    return cljs.core._chunked_next(s)
  }else {
    return cljs.core.seq(cljs.core._chunked_rest(s))
  }
};
cljs.core.to_array = function to_array(s) {
  var ary__9607 = [];
  var s__9608 = s;
  while(true) {
    if(cljs.core.seq(s__9608)) {
      ary__9607.push(cljs.core.first(s__9608));
      var G__9609 = cljs.core.next(s__9608);
      s__9608 = G__9609;
      continue
    }else {
      return ary__9607
    }
    break
  }
};
cljs.core.to_array_2d = function to_array_2d(coll) {
  var ret__9613 = cljs.core.make_array.cljs$lang$arity$1(cljs.core.count(coll));
  var i__9614 = 0;
  var xs__9615 = cljs.core.seq(coll);
  while(true) {
    if(xs__9615) {
      ret__9613[i__9614] = cljs.core.to_array(cljs.core.first(xs__9615));
      var G__9616 = i__9614 + 1;
      var G__9617 = cljs.core.next(xs__9615);
      i__9614 = G__9616;
      xs__9615 = G__9617;
      continue
    }else {
    }
    break
  }
  return ret__9613
};
cljs.core.long_array = function() {
  var long_array = null;
  var long_array__1 = function(size_or_seq) {
    if(cljs.core.number_QMARK_(size_or_seq)) {
      return long_array.cljs$lang$arity$2(size_or_seq, null)
    }else {
      if(cljs.core.seq_QMARK_(size_or_seq)) {
        return cljs.core.into_array.cljs$lang$arity$1(size_or_seq)
      }else {
        if("\ufdd0'else") {
          throw new Error("long-array called with something other than size or ISeq");
        }else {
          return null
        }
      }
    }
  };
  var long_array__2 = function(size, init_val_or_seq) {
    var a__9625 = cljs.core.make_array.cljs$lang$arity$1(size);
    if(cljs.core.seq_QMARK_(init_val_or_seq)) {
      var s__9626 = cljs.core.seq(init_val_or_seq);
      var i__9627 = 0;
      var s__9628 = s__9626;
      while(true) {
        if(cljs.core.truth_(function() {
          var and__3822__auto____9629 = s__9628;
          if(and__3822__auto____9629) {
            return i__9627 < size
          }else {
            return and__3822__auto____9629
          }
        }())) {
          a__9625[i__9627] = cljs.core.first(s__9628);
          var G__9632 = i__9627 + 1;
          var G__9633 = cljs.core.next(s__9628);
          i__9627 = G__9632;
          s__9628 = G__9633;
          continue
        }else {
          return a__9625
        }
        break
      }
    }else {
      var n__2527__auto____9630 = size;
      var i__9631 = 0;
      while(true) {
        if(i__9631 < n__2527__auto____9630) {
          a__9625[i__9631] = init_val_or_seq;
          var G__9634 = i__9631 + 1;
          i__9631 = G__9634;
          continue
        }else {
        }
        break
      }
      return a__9625
    }
  };
  long_array = function(size, init_val_or_seq) {
    switch(arguments.length) {
      case 1:
        return long_array__1.call(this, size);
      case 2:
        return long_array__2.call(this, size, init_val_or_seq)
    }
    throw"Invalid arity: " + arguments.length;
  };
  long_array.cljs$lang$arity$1 = long_array__1;
  long_array.cljs$lang$arity$2 = long_array__2;
  return long_array
}();
cljs.core.double_array = function() {
  var double_array = null;
  var double_array__1 = function(size_or_seq) {
    if(cljs.core.number_QMARK_(size_or_seq)) {
      return double_array.cljs$lang$arity$2(size_or_seq, null)
    }else {
      if(cljs.core.seq_QMARK_(size_or_seq)) {
        return cljs.core.into_array.cljs$lang$arity$1(size_or_seq)
      }else {
        if("\ufdd0'else") {
          throw new Error("double-array called with something other than size or ISeq");
        }else {
          return null
        }
      }
    }
  };
  var double_array__2 = function(size, init_val_or_seq) {
    var a__9642 = cljs.core.make_array.cljs$lang$arity$1(size);
    if(cljs.core.seq_QMARK_(init_val_or_seq)) {
      var s__9643 = cljs.core.seq(init_val_or_seq);
      var i__9644 = 0;
      var s__9645 = s__9643;
      while(true) {
        if(cljs.core.truth_(function() {
          var and__3822__auto____9646 = s__9645;
          if(and__3822__auto____9646) {
            return i__9644 < size
          }else {
            return and__3822__auto____9646
          }
        }())) {
          a__9642[i__9644] = cljs.core.first(s__9645);
          var G__9649 = i__9644 + 1;
          var G__9650 = cljs.core.next(s__9645);
          i__9644 = G__9649;
          s__9645 = G__9650;
          continue
        }else {
          return a__9642
        }
        break
      }
    }else {
      var n__2527__auto____9647 = size;
      var i__9648 = 0;
      while(true) {
        if(i__9648 < n__2527__auto____9647) {
          a__9642[i__9648] = init_val_or_seq;
          var G__9651 = i__9648 + 1;
          i__9648 = G__9651;
          continue
        }else {
        }
        break
      }
      return a__9642
    }
  };
  double_array = function(size, init_val_or_seq) {
    switch(arguments.length) {
      case 1:
        return double_array__1.call(this, size);
      case 2:
        return double_array__2.call(this, size, init_val_or_seq)
    }
    throw"Invalid arity: " + arguments.length;
  };
  double_array.cljs$lang$arity$1 = double_array__1;
  double_array.cljs$lang$arity$2 = double_array__2;
  return double_array
}();
cljs.core.object_array = function() {
  var object_array = null;
  var object_array__1 = function(size_or_seq) {
    if(cljs.core.number_QMARK_(size_or_seq)) {
      return object_array.cljs$lang$arity$2(size_or_seq, null)
    }else {
      if(cljs.core.seq_QMARK_(size_or_seq)) {
        return cljs.core.into_array.cljs$lang$arity$1(size_or_seq)
      }else {
        if("\ufdd0'else") {
          throw new Error("object-array called with something other than size or ISeq");
        }else {
          return null
        }
      }
    }
  };
  var object_array__2 = function(size, init_val_or_seq) {
    var a__9659 = cljs.core.make_array.cljs$lang$arity$1(size);
    if(cljs.core.seq_QMARK_(init_val_or_seq)) {
      var s__9660 = cljs.core.seq(init_val_or_seq);
      var i__9661 = 0;
      var s__9662 = s__9660;
      while(true) {
        if(cljs.core.truth_(function() {
          var and__3822__auto____9663 = s__9662;
          if(and__3822__auto____9663) {
            return i__9661 < size
          }else {
            return and__3822__auto____9663
          }
        }())) {
          a__9659[i__9661] = cljs.core.first(s__9662);
          var G__9666 = i__9661 + 1;
          var G__9667 = cljs.core.next(s__9662);
          i__9661 = G__9666;
          s__9662 = G__9667;
          continue
        }else {
          return a__9659
        }
        break
      }
    }else {
      var n__2527__auto____9664 = size;
      var i__9665 = 0;
      while(true) {
        if(i__9665 < n__2527__auto____9664) {
          a__9659[i__9665] = init_val_or_seq;
          var G__9668 = i__9665 + 1;
          i__9665 = G__9668;
          continue
        }else {
        }
        break
      }
      return a__9659
    }
  };
  object_array = function(size, init_val_or_seq) {
    switch(arguments.length) {
      case 1:
        return object_array__1.call(this, size);
      case 2:
        return object_array__2.call(this, size, init_val_or_seq)
    }
    throw"Invalid arity: " + arguments.length;
  };
  object_array.cljs$lang$arity$1 = object_array__1;
  object_array.cljs$lang$arity$2 = object_array__2;
  return object_array
}();
cljs.core.bounded_count = function bounded_count(s, n) {
  if(cljs.core.counted_QMARK_(s)) {
    return cljs.core.count(s)
  }else {
    var s__9673 = s;
    var i__9674 = n;
    var sum__9675 = 0;
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3822__auto____9676 = i__9674 > 0;
        if(and__3822__auto____9676) {
          return cljs.core.seq(s__9673)
        }else {
          return and__3822__auto____9676
        }
      }())) {
        var G__9677 = cljs.core.next(s__9673);
        var G__9678 = i__9674 - 1;
        var G__9679 = sum__9675 + 1;
        s__9673 = G__9677;
        i__9674 = G__9678;
        sum__9675 = G__9679;
        continue
      }else {
        return sum__9675
      }
      break
    }
  }
};
cljs.core.spread = function spread(arglist) {
  if(arglist == null) {
    return null
  }else {
    if(cljs.core.next(arglist) == null) {
      return cljs.core.seq(cljs.core.first(arglist))
    }else {
      if("\ufdd0'else") {
        return cljs.core.cons(cljs.core.first(arglist), spread(cljs.core.next(arglist)))
      }else {
        return null
      }
    }
  }
};
cljs.core.concat = function() {
  var concat = null;
  var concat__0 = function() {
    return new cljs.core.LazySeq(null, false, function() {
      return null
    }, null)
  };
  var concat__1 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return x
    }, null)
  };
  var concat__2 = function(x, y) {
    return new cljs.core.LazySeq(null, false, function() {
      var s__9684 = cljs.core.seq(x);
      if(s__9684) {
        if(cljs.core.chunked_seq_QMARK_(s__9684)) {
          return cljs.core.chunk_cons(cljs.core.chunk_first(s__9684), concat.cljs$lang$arity$2(cljs.core.chunk_rest(s__9684), y))
        }else {
          return cljs.core.cons(cljs.core.first(s__9684), concat.cljs$lang$arity$2(cljs.core.rest(s__9684), y))
        }
      }else {
        return y
      }
    }, null)
  };
  var concat__3 = function() {
    var G__9688__delegate = function(x, y, zs) {
      var cat__9687 = function cat(xys, zs) {
        return new cljs.core.LazySeq(null, false, function() {
          var xys__9686 = cljs.core.seq(xys);
          if(xys__9686) {
            if(cljs.core.chunked_seq_QMARK_(xys__9686)) {
              return cljs.core.chunk_cons(cljs.core.chunk_first(xys__9686), cat(cljs.core.chunk_rest(xys__9686), zs))
            }else {
              return cljs.core.cons(cljs.core.first(xys__9686), cat(cljs.core.rest(xys__9686), zs))
            }
          }else {
            if(cljs.core.truth_(zs)) {
              return cat(cljs.core.first(zs), cljs.core.next(zs))
            }else {
              return null
            }
          }
        }, null)
      };
      return cat__9687.cljs$lang$arity$2 ? cat__9687.cljs$lang$arity$2(concat.cljs$lang$arity$2(x, y), zs) : cat__9687.call(null, concat.cljs$lang$arity$2(x, y), zs)
    };
    var G__9688 = function(x, y, var_args) {
      var zs = null;
      if(goog.isDef(var_args)) {
        zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9688__delegate.call(this, x, y, zs)
    };
    G__9688.cljs$lang$maxFixedArity = 2;
    G__9688.cljs$lang$applyTo = function(arglist__9689) {
      var x = cljs.core.first(arglist__9689);
      var y = cljs.core.first(cljs.core.next(arglist__9689));
      var zs = cljs.core.rest(cljs.core.next(arglist__9689));
      return G__9688__delegate(x, y, zs)
    };
    G__9688.cljs$lang$arity$variadic = G__9688__delegate;
    return G__9688
  }();
  concat = function(x, y, var_args) {
    var zs = var_args;
    switch(arguments.length) {
      case 0:
        return concat__0.call(this);
      case 1:
        return concat__1.call(this, x);
      case 2:
        return concat__2.call(this, x, y);
      default:
        return concat__3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  concat.cljs$lang$maxFixedArity = 2;
  concat.cljs$lang$applyTo = concat__3.cljs$lang$applyTo;
  concat.cljs$lang$arity$0 = concat__0;
  concat.cljs$lang$arity$1 = concat__1;
  concat.cljs$lang$arity$2 = concat__2;
  concat.cljs$lang$arity$variadic = concat__3.cljs$lang$arity$variadic;
  return concat
}();
cljs.core.list_STAR_ = function() {
  var list_STAR_ = null;
  var list_STAR___1 = function(args) {
    return cljs.core.seq(args)
  };
  var list_STAR___2 = function(a, args) {
    return cljs.core.cons(a, args)
  };
  var list_STAR___3 = function(a, b, args) {
    return cljs.core.cons(a, cljs.core.cons(b, args))
  };
  var list_STAR___4 = function(a, b, c, args) {
    return cljs.core.cons(a, cljs.core.cons(b, cljs.core.cons(c, args)))
  };
  var list_STAR___5 = function() {
    var G__9690__delegate = function(a, b, c, d, more) {
      return cljs.core.cons(a, cljs.core.cons(b, cljs.core.cons(c, cljs.core.cons(d, cljs.core.spread(more)))))
    };
    var G__9690 = function(a, b, c, d, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__9690__delegate.call(this, a, b, c, d, more)
    };
    G__9690.cljs$lang$maxFixedArity = 4;
    G__9690.cljs$lang$applyTo = function(arglist__9691) {
      var a = cljs.core.first(arglist__9691);
      var b = cljs.core.first(cljs.core.next(arglist__9691));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9691)));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9691))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9691))));
      return G__9690__delegate(a, b, c, d, more)
    };
    G__9690.cljs$lang$arity$variadic = G__9690__delegate;
    return G__9690
  }();
  list_STAR_ = function(a, b, c, d, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return list_STAR___1.call(this, a);
      case 2:
        return list_STAR___2.call(this, a, b);
      case 3:
        return list_STAR___3.call(this, a, b, c);
      case 4:
        return list_STAR___4.call(this, a, b, c, d);
      default:
        return list_STAR___5.cljs$lang$arity$variadic(a, b, c, d, cljs.core.array_seq(arguments, 4))
    }
    throw"Invalid arity: " + arguments.length;
  };
  list_STAR_.cljs$lang$maxFixedArity = 4;
  list_STAR_.cljs$lang$applyTo = list_STAR___5.cljs$lang$applyTo;
  list_STAR_.cljs$lang$arity$1 = list_STAR___1;
  list_STAR_.cljs$lang$arity$2 = list_STAR___2;
  list_STAR_.cljs$lang$arity$3 = list_STAR___3;
  list_STAR_.cljs$lang$arity$4 = list_STAR___4;
  list_STAR_.cljs$lang$arity$variadic = list_STAR___5.cljs$lang$arity$variadic;
  return list_STAR_
}();
cljs.core.transient$ = function transient$(coll) {
  return cljs.core._as_transient(coll)
};
cljs.core.persistent_BANG_ = function persistent_BANG_(tcoll) {
  return cljs.core._persistent_BANG_(tcoll)
};
cljs.core.conj_BANG_ = function conj_BANG_(tcoll, val) {
  return cljs.core._conj_BANG_(tcoll, val)
};
cljs.core.assoc_BANG_ = function assoc_BANG_(tcoll, key, val) {
  return cljs.core._assoc_BANG_(tcoll, key, val)
};
cljs.core.dissoc_BANG_ = function dissoc_BANG_(tcoll, key) {
  return cljs.core._dissoc_BANG_(tcoll, key)
};
cljs.core.pop_BANG_ = function pop_BANG_(tcoll) {
  return cljs.core._pop_BANG_(tcoll)
};
cljs.core.disj_BANG_ = function disj_BANG_(tcoll, val) {
  return cljs.core._disjoin_BANG_(tcoll, val)
};
cljs.core.apply_to = function apply_to(f, argc, args) {
  var args__9733 = cljs.core.seq(args);
  if(argc === 0) {
    return f.cljs$lang$arity$0 ? f.cljs$lang$arity$0() : f.call(null)
  }else {
    var a__9734 = cljs.core._first(args__9733);
    var args__9735 = cljs.core._rest(args__9733);
    if(argc === 1) {
      if(f.cljs$lang$arity$1) {
        return f.cljs$lang$arity$1(a__9734)
      }else {
        return f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(a__9734) : f.call(null, a__9734)
      }
    }else {
      var b__9736 = cljs.core._first(args__9735);
      var args__9737 = cljs.core._rest(args__9735);
      if(argc === 2) {
        if(f.cljs$lang$arity$2) {
          return f.cljs$lang$arity$2(a__9734, b__9736)
        }else {
          return f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(a__9734, b__9736) : f.call(null, a__9734, b__9736)
        }
      }else {
        var c__9738 = cljs.core._first(args__9737);
        var args__9739 = cljs.core._rest(args__9737);
        if(argc === 3) {
          if(f.cljs$lang$arity$3) {
            return f.cljs$lang$arity$3(a__9734, b__9736, c__9738)
          }else {
            return f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(a__9734, b__9736, c__9738) : f.call(null, a__9734, b__9736, c__9738)
          }
        }else {
          var d__9740 = cljs.core._first(args__9739);
          var args__9741 = cljs.core._rest(args__9739);
          if(argc === 4) {
            if(f.cljs$lang$arity$4) {
              return f.cljs$lang$arity$4(a__9734, b__9736, c__9738, d__9740)
            }else {
              return f.cljs$lang$arity$4 ? f.cljs$lang$arity$4(a__9734, b__9736, c__9738, d__9740) : f.call(null, a__9734, b__9736, c__9738, d__9740)
            }
          }else {
            var e__9742 = cljs.core._first(args__9741);
            var args__9743 = cljs.core._rest(args__9741);
            if(argc === 5) {
              if(f.cljs$lang$arity$5) {
                return f.cljs$lang$arity$5(a__9734, b__9736, c__9738, d__9740, e__9742)
              }else {
                return f.cljs$lang$arity$5 ? f.cljs$lang$arity$5(a__9734, b__9736, c__9738, d__9740, e__9742) : f.call(null, a__9734, b__9736, c__9738, d__9740, e__9742)
              }
            }else {
              var f__9744 = cljs.core._first(args__9743);
              var args__9745 = cljs.core._rest(args__9743);
              if(argc === 6) {
                if(f__9744.cljs$lang$arity$6) {
                  return f__9744.cljs$lang$arity$6(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744)
                }else {
                  return f__9744.cljs$lang$arity$6 ? f__9744.cljs$lang$arity$6(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744)
                }
              }else {
                var g__9746 = cljs.core._first(args__9745);
                var args__9747 = cljs.core._rest(args__9745);
                if(argc === 7) {
                  if(f__9744.cljs$lang$arity$7) {
                    return f__9744.cljs$lang$arity$7(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746)
                  }else {
                    return f__9744.cljs$lang$arity$7 ? f__9744.cljs$lang$arity$7(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746)
                  }
                }else {
                  var h__9748 = cljs.core._first(args__9747);
                  var args__9749 = cljs.core._rest(args__9747);
                  if(argc === 8) {
                    if(f__9744.cljs$lang$arity$8) {
                      return f__9744.cljs$lang$arity$8(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748)
                    }else {
                      return f__9744.cljs$lang$arity$8 ? f__9744.cljs$lang$arity$8(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748)
                    }
                  }else {
                    var i__9750 = cljs.core._first(args__9749);
                    var args__9751 = cljs.core._rest(args__9749);
                    if(argc === 9) {
                      if(f__9744.cljs$lang$arity$9) {
                        return f__9744.cljs$lang$arity$9(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750)
                      }else {
                        return f__9744.cljs$lang$arity$9 ? f__9744.cljs$lang$arity$9(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750)
                      }
                    }else {
                      var j__9752 = cljs.core._first(args__9751);
                      var args__9753 = cljs.core._rest(args__9751);
                      if(argc === 10) {
                        if(f__9744.cljs$lang$arity$10) {
                          return f__9744.cljs$lang$arity$10(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752)
                        }else {
                          return f__9744.cljs$lang$arity$10 ? f__9744.cljs$lang$arity$10(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752)
                        }
                      }else {
                        var k__9754 = cljs.core._first(args__9753);
                        var args__9755 = cljs.core._rest(args__9753);
                        if(argc === 11) {
                          if(f__9744.cljs$lang$arity$11) {
                            return f__9744.cljs$lang$arity$11(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754)
                          }else {
                            return f__9744.cljs$lang$arity$11 ? f__9744.cljs$lang$arity$11(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754)
                          }
                        }else {
                          var l__9756 = cljs.core._first(args__9755);
                          var args__9757 = cljs.core._rest(args__9755);
                          if(argc === 12) {
                            if(f__9744.cljs$lang$arity$12) {
                              return f__9744.cljs$lang$arity$12(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756)
                            }else {
                              return f__9744.cljs$lang$arity$12 ? f__9744.cljs$lang$arity$12(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756)
                            }
                          }else {
                            var m__9758 = cljs.core._first(args__9757);
                            var args__9759 = cljs.core._rest(args__9757);
                            if(argc === 13) {
                              if(f__9744.cljs$lang$arity$13) {
                                return f__9744.cljs$lang$arity$13(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758)
                              }else {
                                return f__9744.cljs$lang$arity$13 ? f__9744.cljs$lang$arity$13(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758)
                              }
                            }else {
                              var n__9760 = cljs.core._first(args__9759);
                              var args__9761 = cljs.core._rest(args__9759);
                              if(argc === 14) {
                                if(f__9744.cljs$lang$arity$14) {
                                  return f__9744.cljs$lang$arity$14(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760)
                                }else {
                                  return f__9744.cljs$lang$arity$14 ? f__9744.cljs$lang$arity$14(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760)
                                }
                              }else {
                                var o__9762 = cljs.core._first(args__9761);
                                var args__9763 = cljs.core._rest(args__9761);
                                if(argc === 15) {
                                  if(f__9744.cljs$lang$arity$15) {
                                    return f__9744.cljs$lang$arity$15(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762)
                                  }else {
                                    return f__9744.cljs$lang$arity$15 ? f__9744.cljs$lang$arity$15(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762)
                                  }
                                }else {
                                  var p__9764 = cljs.core._first(args__9763);
                                  var args__9765 = cljs.core._rest(args__9763);
                                  if(argc === 16) {
                                    if(f__9744.cljs$lang$arity$16) {
                                      return f__9744.cljs$lang$arity$16(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764)
                                    }else {
                                      return f__9744.cljs$lang$arity$16 ? f__9744.cljs$lang$arity$16(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764)
                                    }
                                  }else {
                                    var q__9766 = cljs.core._first(args__9765);
                                    var args__9767 = cljs.core._rest(args__9765);
                                    if(argc === 17) {
                                      if(f__9744.cljs$lang$arity$17) {
                                        return f__9744.cljs$lang$arity$17(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764, q__9766)
                                      }else {
                                        return f__9744.cljs$lang$arity$17 ? f__9744.cljs$lang$arity$17(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764, q__9766) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764, q__9766)
                                      }
                                    }else {
                                      var r__9768 = cljs.core._first(args__9767);
                                      var args__9769 = cljs.core._rest(args__9767);
                                      if(argc === 18) {
                                        if(f__9744.cljs$lang$arity$18) {
                                          return f__9744.cljs$lang$arity$18(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764, q__9766, r__9768)
                                        }else {
                                          return f__9744.cljs$lang$arity$18 ? f__9744.cljs$lang$arity$18(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764, q__9766, r__9768) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764, q__9766, r__9768)
                                        }
                                      }else {
                                        var s__9770 = cljs.core._first(args__9769);
                                        var args__9771 = cljs.core._rest(args__9769);
                                        if(argc === 19) {
                                          if(f__9744.cljs$lang$arity$19) {
                                            return f__9744.cljs$lang$arity$19(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764, q__9766, r__9768, s__9770)
                                          }else {
                                            return f__9744.cljs$lang$arity$19 ? f__9744.cljs$lang$arity$19(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764, q__9766, r__9768, s__9770) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764, q__9766, r__9768, s__9770)
                                          }
                                        }else {
                                          var t__9772 = cljs.core._first(args__9771);
                                          var args__9773 = cljs.core._rest(args__9771);
                                          if(argc === 20) {
                                            if(f__9744.cljs$lang$arity$20) {
                                              return f__9744.cljs$lang$arity$20(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764, q__9766, r__9768, s__9770, t__9772)
                                            }else {
                                              return f__9744.cljs$lang$arity$20 ? f__9744.cljs$lang$arity$20(a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764, q__9766, r__9768, s__9770, t__9772) : f__9744.call(null, a__9734, b__9736, c__9738, d__9740, e__9742, f__9744, g__9746, h__9748, i__9750, j__9752, k__9754, l__9756, m__9758, n__9760, o__9762, p__9764, q__9766, r__9768, s__9770, t__9772)
                                            }
                                          }else {
                                            throw new Error("Only up to 20 arguments supported on functions");
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
cljs.core.apply = function() {
  var apply = null;
  var apply__2 = function(f, args) {
    var fixed_arity__9788 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__9789 = cljs.core.bounded_count(args, fixed_arity__9788 + 1);
      if(bc__9789 <= fixed_arity__9788) {
        return cljs.core.apply_to(f, bc__9789, args)
      }else {
        return f.cljs$lang$applyTo(args)
      }
    }else {
      return f.apply(f, cljs.core.to_array(args))
    }
  };
  var apply__3 = function(f, x, args) {
    var arglist__9790 = cljs.core.list_STAR_.cljs$lang$arity$2(x, args);
    var fixed_arity__9791 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__9792 = cljs.core.bounded_count(arglist__9790, fixed_arity__9791 + 1);
      if(bc__9792 <= fixed_arity__9791) {
        return cljs.core.apply_to(f, bc__9792, arglist__9790)
      }else {
        return f.cljs$lang$applyTo(arglist__9790)
      }
    }else {
      return f.apply(f, cljs.core.to_array(arglist__9790))
    }
  };
  var apply__4 = function(f, x, y, args) {
    var arglist__9793 = cljs.core.list_STAR_.cljs$lang$arity$3(x, y, args);
    var fixed_arity__9794 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__9795 = cljs.core.bounded_count(arglist__9793, fixed_arity__9794 + 1);
      if(bc__9795 <= fixed_arity__9794) {
        return cljs.core.apply_to(f, bc__9795, arglist__9793)
      }else {
        return f.cljs$lang$applyTo(arglist__9793)
      }
    }else {
      return f.apply(f, cljs.core.to_array(arglist__9793))
    }
  };
  var apply__5 = function(f, x, y, z, args) {
    var arglist__9796 = cljs.core.list_STAR_.cljs$lang$arity$4(x, y, z, args);
    var fixed_arity__9797 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__9798 = cljs.core.bounded_count(arglist__9796, fixed_arity__9797 + 1);
      if(bc__9798 <= fixed_arity__9797) {
        return cljs.core.apply_to(f, bc__9798, arglist__9796)
      }else {
        return f.cljs$lang$applyTo(arglist__9796)
      }
    }else {
      return f.apply(f, cljs.core.to_array(arglist__9796))
    }
  };
  var apply__6 = function() {
    var G__9802__delegate = function(f, a, b, c, d, args) {
      var arglist__9799 = cljs.core.cons(a, cljs.core.cons(b, cljs.core.cons(c, cljs.core.cons(d, cljs.core.spread(args)))));
      var fixed_arity__9800 = f.cljs$lang$maxFixedArity;
      if(cljs.core.truth_(f.cljs$lang$applyTo)) {
        var bc__9801 = cljs.core.bounded_count(arglist__9799, fixed_arity__9800 + 1);
        if(bc__9801 <= fixed_arity__9800) {
          return cljs.core.apply_to(f, bc__9801, arglist__9799)
        }else {
          return f.cljs$lang$applyTo(arglist__9799)
        }
      }else {
        return f.apply(f, cljs.core.to_array(arglist__9799))
      }
    };
    var G__9802 = function(f, a, b, c, d, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__9802__delegate.call(this, f, a, b, c, d, args)
    };
    G__9802.cljs$lang$maxFixedArity = 5;
    G__9802.cljs$lang$applyTo = function(arglist__9803) {
      var f = cljs.core.first(arglist__9803);
      var a = cljs.core.first(cljs.core.next(arglist__9803));
      var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9803)));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9803))));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9803)))));
      var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9803)))));
      return G__9802__delegate(f, a, b, c, d, args)
    };
    G__9802.cljs$lang$arity$variadic = G__9802__delegate;
    return G__9802
  }();
  apply = function(f, a, b, c, d, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 2:
        return apply__2.call(this, f, a);
      case 3:
        return apply__3.call(this, f, a, b);
      case 4:
        return apply__4.call(this, f, a, b, c);
      case 5:
        return apply__5.call(this, f, a, b, c, d);
      default:
        return apply__6.cljs$lang$arity$variadic(f, a, b, c, d, cljs.core.array_seq(arguments, 5))
    }
    throw"Invalid arity: " + arguments.length;
  };
  apply.cljs$lang$maxFixedArity = 5;
  apply.cljs$lang$applyTo = apply__6.cljs$lang$applyTo;
  apply.cljs$lang$arity$2 = apply__2;
  apply.cljs$lang$arity$3 = apply__3;
  apply.cljs$lang$arity$4 = apply__4;
  apply.cljs$lang$arity$5 = apply__5;
  apply.cljs$lang$arity$variadic = apply__6.cljs$lang$arity$variadic;
  return apply
}();
cljs.core.vary_meta = function() {
  var vary_meta__delegate = function(obj, f, args) {
    return cljs.core.with_meta(obj, cljs.core.apply.cljs$lang$arity$3(f, cljs.core.meta(obj), args))
  };
  var vary_meta = function(obj, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return vary_meta__delegate.call(this, obj, f, args)
  };
  vary_meta.cljs$lang$maxFixedArity = 2;
  vary_meta.cljs$lang$applyTo = function(arglist__9804) {
    var obj = cljs.core.first(arglist__9804);
    var f = cljs.core.first(cljs.core.next(arglist__9804));
    var args = cljs.core.rest(cljs.core.next(arglist__9804));
    return vary_meta__delegate(obj, f, args)
  };
  vary_meta.cljs$lang$arity$variadic = vary_meta__delegate;
  return vary_meta
}();
cljs.core.not_EQ_ = function() {
  var not_EQ_ = null;
  var not_EQ___1 = function(x) {
    return false
  };
  var not_EQ___2 = function(x, y) {
    return!cljs.core._EQ_.cljs$lang$arity$2(x, y)
  };
  var not_EQ___3 = function() {
    var G__9805__delegate = function(x, y, more) {
      return cljs.core.not(cljs.core.apply.cljs$lang$arity$4(cljs.core._EQ_, x, y, more))
    };
    var G__9805 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9805__delegate.call(this, x, y, more)
    };
    G__9805.cljs$lang$maxFixedArity = 2;
    G__9805.cljs$lang$applyTo = function(arglist__9806) {
      var x = cljs.core.first(arglist__9806);
      var y = cljs.core.first(cljs.core.next(arglist__9806));
      var more = cljs.core.rest(cljs.core.next(arglist__9806));
      return G__9805__delegate(x, y, more)
    };
    G__9805.cljs$lang$arity$variadic = G__9805__delegate;
    return G__9805
  }();
  not_EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return not_EQ___1.call(this, x);
      case 2:
        return not_EQ___2.call(this, x, y);
      default:
        return not_EQ___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  not_EQ_.cljs$lang$maxFixedArity = 2;
  not_EQ_.cljs$lang$applyTo = not_EQ___3.cljs$lang$applyTo;
  not_EQ_.cljs$lang$arity$1 = not_EQ___1;
  not_EQ_.cljs$lang$arity$2 = not_EQ___2;
  not_EQ_.cljs$lang$arity$variadic = not_EQ___3.cljs$lang$arity$variadic;
  return not_EQ_
}();
cljs.core.not_empty = function not_empty(coll) {
  if(cljs.core.seq(coll)) {
    return coll
  }else {
    return null
  }
};
cljs.core.every_QMARK_ = function every_QMARK_(pred, coll) {
  while(true) {
    if(cljs.core.seq(coll) == null) {
      return true
    }else {
      if(cljs.core.truth_(pred.cljs$lang$arity$1 ? pred.cljs$lang$arity$1(cljs.core.first(coll)) : pred.call(null, cljs.core.first(coll)))) {
        var G__9807 = pred;
        var G__9808 = cljs.core.next(coll);
        pred = G__9807;
        coll = G__9808;
        continue
      }else {
        if("\ufdd0'else") {
          return false
        }else {
          return null
        }
      }
    }
    break
  }
};
cljs.core.not_every_QMARK_ = function not_every_QMARK_(pred, coll) {
  return!cljs.core.every_QMARK_(pred, coll)
};
cljs.core.some = function some(pred, coll) {
  while(true) {
    if(cljs.core.seq(coll)) {
      var or__3824__auto____9810 = pred.cljs$lang$arity$1 ? pred.cljs$lang$arity$1(cljs.core.first(coll)) : pred.call(null, cljs.core.first(coll));
      if(cljs.core.truth_(or__3824__auto____9810)) {
        return or__3824__auto____9810
      }else {
        var G__9811 = pred;
        var G__9812 = cljs.core.next(coll);
        pred = G__9811;
        coll = G__9812;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.not_any_QMARK_ = function not_any_QMARK_(pred, coll) {
  return cljs.core.not(cljs.core.some(pred, coll))
};
cljs.core.even_QMARK_ = function even_QMARK_(n) {
  if(cljs.core.integer_QMARK_(n)) {
    return(n & 1) === 0
  }else {
    throw new Error([cljs.core.str("Argument must be an integer: "), cljs.core.str(n)].join(""));
  }
};
cljs.core.odd_QMARK_ = function odd_QMARK_(n) {
  return!cljs.core.even_QMARK_(n)
};
cljs.core.identity = function identity(x) {
  return x
};
cljs.core.complement = function complement(f) {
  return function() {
    var G__9813 = null;
    var G__9813__0 = function() {
      return cljs.core.not(f.cljs$lang$arity$0 ? f.cljs$lang$arity$0() : f.call(null))
    };
    var G__9813__1 = function(x) {
      return cljs.core.not(f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(x) : f.call(null, x))
    };
    var G__9813__2 = function(x, y) {
      return cljs.core.not(f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(x, y) : f.call(null, x, y))
    };
    var G__9813__3 = function() {
      var G__9814__delegate = function(x, y, zs) {
        return cljs.core.not(cljs.core.apply.cljs$lang$arity$4(f, x, y, zs))
      };
      var G__9814 = function(x, y, var_args) {
        var zs = null;
        if(goog.isDef(var_args)) {
          zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
        }
        return G__9814__delegate.call(this, x, y, zs)
      };
      G__9814.cljs$lang$maxFixedArity = 2;
      G__9814.cljs$lang$applyTo = function(arglist__9815) {
        var x = cljs.core.first(arglist__9815);
        var y = cljs.core.first(cljs.core.next(arglist__9815));
        var zs = cljs.core.rest(cljs.core.next(arglist__9815));
        return G__9814__delegate(x, y, zs)
      };
      G__9814.cljs$lang$arity$variadic = G__9814__delegate;
      return G__9814
    }();
    G__9813 = function(x, y, var_args) {
      var zs = var_args;
      switch(arguments.length) {
        case 0:
          return G__9813__0.call(this);
        case 1:
          return G__9813__1.call(this, x);
        case 2:
          return G__9813__2.call(this, x, y);
        default:
          return G__9813__3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
      }
      throw"Invalid arity: " + arguments.length;
    };
    G__9813.cljs$lang$maxFixedArity = 2;
    G__9813.cljs$lang$applyTo = G__9813__3.cljs$lang$applyTo;
    return G__9813
  }()
};
cljs.core.constantly = function constantly(x) {
  return function() {
    var G__9816__delegate = function(args) {
      return x
    };
    var G__9816 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__9816__delegate.call(this, args)
    };
    G__9816.cljs$lang$maxFixedArity = 0;
    G__9816.cljs$lang$applyTo = function(arglist__9817) {
      var args = cljs.core.seq(arglist__9817);
      return G__9816__delegate(args)
    };
    G__9816.cljs$lang$arity$variadic = G__9816__delegate;
    return G__9816
  }()
};
cljs.core.comp = function() {
  var comp = null;
  var comp__0 = function() {
    return cljs.core.identity
  };
  var comp__1 = function(f) {
    return f
  };
  var comp__2 = function(f, g) {
    return function() {
      var G__9824 = null;
      var G__9824__0 = function() {
        return f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(g.cljs$lang$arity$0 ? g.cljs$lang$arity$0() : g.call(null)) : f.call(null, g.cljs$lang$arity$0 ? g.cljs$lang$arity$0() : g.call(null))
      };
      var G__9824__1 = function(x) {
        return f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(x) : g.call(null, x)) : f.call(null, g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(x) : g.call(null, x))
      };
      var G__9824__2 = function(x, y) {
        return f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(g.cljs$lang$arity$2 ? g.cljs$lang$arity$2(x, y) : g.call(null, x, y)) : f.call(null, g.cljs$lang$arity$2 ? g.cljs$lang$arity$2(x, y) : g.call(null, x, y))
      };
      var G__9824__3 = function(x, y, z) {
        return f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(g.cljs$lang$arity$3 ? g.cljs$lang$arity$3(x, y, z) : g.call(null, x, y, z)) : f.call(null, g.cljs$lang$arity$3 ? g.cljs$lang$arity$3(x, y, z) : g.call(null, x, y, z))
      };
      var G__9824__4 = function() {
        var G__9825__delegate = function(x, y, z, args) {
          return f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(cljs.core.apply.cljs$lang$arity$5(g, x, y, z, args)) : f.call(null, cljs.core.apply.cljs$lang$arity$5(g, x, y, z, args))
        };
        var G__9825 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9825__delegate.call(this, x, y, z, args)
        };
        G__9825.cljs$lang$maxFixedArity = 3;
        G__9825.cljs$lang$applyTo = function(arglist__9826) {
          var x = cljs.core.first(arglist__9826);
          var y = cljs.core.first(cljs.core.next(arglist__9826));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9826)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9826)));
          return G__9825__delegate(x, y, z, args)
        };
        G__9825.cljs$lang$arity$variadic = G__9825__delegate;
        return G__9825
      }();
      G__9824 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__9824__0.call(this);
          case 1:
            return G__9824__1.call(this, x);
          case 2:
            return G__9824__2.call(this, x, y);
          case 3:
            return G__9824__3.call(this, x, y, z);
          default:
            return G__9824__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9824.cljs$lang$maxFixedArity = 3;
      G__9824.cljs$lang$applyTo = G__9824__4.cljs$lang$applyTo;
      return G__9824
    }()
  };
  var comp__3 = function(f, g, h) {
    return function() {
      var G__9827 = null;
      var G__9827__0 = function() {
        return f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(h.cljs$lang$arity$0 ? h.cljs$lang$arity$0() : h.call(null)) : g.call(null, h.cljs$lang$arity$0 ? h.cljs$lang$arity$0() : h.call(null))) : f.call(null, g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(h.cljs$lang$arity$0 ? h.cljs$lang$arity$0() : h.call(null)) : g.call(null, h.cljs$lang$arity$0 ? h.cljs$lang$arity$0() : h.call(null)))
      };
      var G__9827__1 = function(x) {
        return f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(h.cljs$lang$arity$1 ? h.cljs$lang$arity$1(x) : h.call(null, x)) : g.call(null, h.cljs$lang$arity$1 ? h.cljs$lang$arity$1(x) : h.call(null, x))) : f.call(null, g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(h.cljs$lang$arity$1 ? h.cljs$lang$arity$1(x) : h.call(null, x)) : g.call(null, h.cljs$lang$arity$1 ? h.cljs$lang$arity$1(x) : h.call(null, x)))
      };
      var G__9827__2 = function(x, y) {
        return f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(h.cljs$lang$arity$2 ? h.cljs$lang$arity$2(x, y) : h.call(null, x, y)) : g.call(null, h.cljs$lang$arity$2 ? h.cljs$lang$arity$2(x, y) : h.call(null, x, y))) : f.call(null, g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(h.cljs$lang$arity$2 ? h.cljs$lang$arity$2(x, y) : h.call(null, x, y)) : g.call(null, h.cljs$lang$arity$2 ? h.cljs$lang$arity$2(x, y) : h.call(null, x, y)))
      };
      var G__9827__3 = function(x, y, z) {
        return f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(h.cljs$lang$arity$3 ? h.cljs$lang$arity$3(x, y, z) : h.call(null, x, y, z)) : g.call(null, h.cljs$lang$arity$3 ? h.cljs$lang$arity$3(x, y, z) : h.call(null, x, y, z))) : f.call(null, g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(h.cljs$lang$arity$3 ? h.cljs$lang$arity$3(x, y, z) : h.call(null, x, y, z)) : g.call(null, h.cljs$lang$arity$3 ? h.cljs$lang$arity$3(x, y, z) : h.call(null, x, y, z)))
      };
      var G__9827__4 = function() {
        var G__9828__delegate = function(x, y, z, args) {
          return f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(cljs.core.apply.cljs$lang$arity$5(h, x, y, z, args)) : g.call(null, cljs.core.apply.cljs$lang$arity$5(h, x, y, z, args))) : f.call(null, g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(cljs.core.apply.cljs$lang$arity$5(h, x, y, z, args)) : g.call(null, cljs.core.apply.cljs$lang$arity$5(h, x, y, z, args)))
        };
        var G__9828 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9828__delegate.call(this, x, y, z, args)
        };
        G__9828.cljs$lang$maxFixedArity = 3;
        G__9828.cljs$lang$applyTo = function(arglist__9829) {
          var x = cljs.core.first(arglist__9829);
          var y = cljs.core.first(cljs.core.next(arglist__9829));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9829)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9829)));
          return G__9828__delegate(x, y, z, args)
        };
        G__9828.cljs$lang$arity$variadic = G__9828__delegate;
        return G__9828
      }();
      G__9827 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__9827__0.call(this);
          case 1:
            return G__9827__1.call(this, x);
          case 2:
            return G__9827__2.call(this, x, y);
          case 3:
            return G__9827__3.call(this, x, y, z);
          default:
            return G__9827__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9827.cljs$lang$maxFixedArity = 3;
      G__9827.cljs$lang$applyTo = G__9827__4.cljs$lang$applyTo;
      return G__9827
    }()
  };
  var comp__4 = function() {
    var G__9830__delegate = function(f1, f2, f3, fs) {
      var fs__9821 = cljs.core.reverse(cljs.core.list_STAR_.cljs$lang$arity$4(f1, f2, f3, fs));
      return function() {
        var G__9831__delegate = function(args) {
          var ret__9822 = cljs.core.apply.cljs$lang$arity$2(cljs.core.first(fs__9821), args);
          var fs__9823 = cljs.core.next(fs__9821);
          while(true) {
            if(fs__9823) {
              var G__9832 = cljs.core.first(fs__9823).call(null, ret__9822);
              var G__9833 = cljs.core.next(fs__9823);
              ret__9822 = G__9832;
              fs__9823 = G__9833;
              continue
            }else {
              return ret__9822
            }
            break
          }
        };
        var G__9831 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__9831__delegate.call(this, args)
        };
        G__9831.cljs$lang$maxFixedArity = 0;
        G__9831.cljs$lang$applyTo = function(arglist__9834) {
          var args = cljs.core.seq(arglist__9834);
          return G__9831__delegate(args)
        };
        G__9831.cljs$lang$arity$variadic = G__9831__delegate;
        return G__9831
      }()
    };
    var G__9830 = function(f1, f2, f3, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__9830__delegate.call(this, f1, f2, f3, fs)
    };
    G__9830.cljs$lang$maxFixedArity = 3;
    G__9830.cljs$lang$applyTo = function(arglist__9835) {
      var f1 = cljs.core.first(arglist__9835);
      var f2 = cljs.core.first(cljs.core.next(arglist__9835));
      var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9835)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9835)));
      return G__9830__delegate(f1, f2, f3, fs)
    };
    G__9830.cljs$lang$arity$variadic = G__9830__delegate;
    return G__9830
  }();
  comp = function(f1, f2, f3, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 0:
        return comp__0.call(this);
      case 1:
        return comp__1.call(this, f1);
      case 2:
        return comp__2.call(this, f1, f2);
      case 3:
        return comp__3.call(this, f1, f2, f3);
      default:
        return comp__4.cljs$lang$arity$variadic(f1, f2, f3, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  comp.cljs$lang$maxFixedArity = 3;
  comp.cljs$lang$applyTo = comp__4.cljs$lang$applyTo;
  comp.cljs$lang$arity$0 = comp__0;
  comp.cljs$lang$arity$1 = comp__1;
  comp.cljs$lang$arity$2 = comp__2;
  comp.cljs$lang$arity$3 = comp__3;
  comp.cljs$lang$arity$variadic = comp__4.cljs$lang$arity$variadic;
  return comp
}();
cljs.core.partial = function() {
  var partial = null;
  var partial__2 = function(f, arg1) {
    return function() {
      var G__9836__delegate = function(args) {
        return cljs.core.apply.cljs$lang$arity$3(f, arg1, args)
      };
      var G__9836 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__9836__delegate.call(this, args)
      };
      G__9836.cljs$lang$maxFixedArity = 0;
      G__9836.cljs$lang$applyTo = function(arglist__9837) {
        var args = cljs.core.seq(arglist__9837);
        return G__9836__delegate(args)
      };
      G__9836.cljs$lang$arity$variadic = G__9836__delegate;
      return G__9836
    }()
  };
  var partial__3 = function(f, arg1, arg2) {
    return function() {
      var G__9838__delegate = function(args) {
        return cljs.core.apply.cljs$lang$arity$4(f, arg1, arg2, args)
      };
      var G__9838 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__9838__delegate.call(this, args)
      };
      G__9838.cljs$lang$maxFixedArity = 0;
      G__9838.cljs$lang$applyTo = function(arglist__9839) {
        var args = cljs.core.seq(arglist__9839);
        return G__9838__delegate(args)
      };
      G__9838.cljs$lang$arity$variadic = G__9838__delegate;
      return G__9838
    }()
  };
  var partial__4 = function(f, arg1, arg2, arg3) {
    return function() {
      var G__9840__delegate = function(args) {
        return cljs.core.apply.cljs$lang$arity$5(f, arg1, arg2, arg3, args)
      };
      var G__9840 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__9840__delegate.call(this, args)
      };
      G__9840.cljs$lang$maxFixedArity = 0;
      G__9840.cljs$lang$applyTo = function(arglist__9841) {
        var args = cljs.core.seq(arglist__9841);
        return G__9840__delegate(args)
      };
      G__9840.cljs$lang$arity$variadic = G__9840__delegate;
      return G__9840
    }()
  };
  var partial__5 = function() {
    var G__9842__delegate = function(f, arg1, arg2, arg3, more) {
      return function() {
        var G__9843__delegate = function(args) {
          return cljs.core.apply.cljs$lang$arity$5(f, arg1, arg2, arg3, cljs.core.concat.cljs$lang$arity$2(more, args))
        };
        var G__9843 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__9843__delegate.call(this, args)
        };
        G__9843.cljs$lang$maxFixedArity = 0;
        G__9843.cljs$lang$applyTo = function(arglist__9844) {
          var args = cljs.core.seq(arglist__9844);
          return G__9843__delegate(args)
        };
        G__9843.cljs$lang$arity$variadic = G__9843__delegate;
        return G__9843
      }()
    };
    var G__9842 = function(f, arg1, arg2, arg3, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__9842__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    G__9842.cljs$lang$maxFixedArity = 4;
    G__9842.cljs$lang$applyTo = function(arglist__9845) {
      var f = cljs.core.first(arglist__9845);
      var arg1 = cljs.core.first(cljs.core.next(arglist__9845));
      var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9845)));
      var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9845))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9845))));
      return G__9842__delegate(f, arg1, arg2, arg3, more)
    };
    G__9842.cljs$lang$arity$variadic = G__9842__delegate;
    return G__9842
  }();
  partial = function(f, arg1, arg2, arg3, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return partial__2.call(this, f, arg1);
      case 3:
        return partial__3.call(this, f, arg1, arg2);
      case 4:
        return partial__4.call(this, f, arg1, arg2, arg3);
      default:
        return partial__5.cljs$lang$arity$variadic(f, arg1, arg2, arg3, cljs.core.array_seq(arguments, 4))
    }
    throw"Invalid arity: " + arguments.length;
  };
  partial.cljs$lang$maxFixedArity = 4;
  partial.cljs$lang$applyTo = partial__5.cljs$lang$applyTo;
  partial.cljs$lang$arity$2 = partial__2;
  partial.cljs$lang$arity$3 = partial__3;
  partial.cljs$lang$arity$4 = partial__4;
  partial.cljs$lang$arity$variadic = partial__5.cljs$lang$arity$variadic;
  return partial
}();
cljs.core.fnil = function() {
  var fnil = null;
  var fnil__2 = function(f, x) {
    return function() {
      var G__9846 = null;
      var G__9846__1 = function(a) {
        return f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(a == null ? x : a) : f.call(null, a == null ? x : a)
      };
      var G__9846__2 = function(a, b) {
        return f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(a == null ? x : a, b) : f.call(null, a == null ? x : a, b)
      };
      var G__9846__3 = function(a, b, c) {
        return f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(a == null ? x : a, b, c) : f.call(null, a == null ? x : a, b, c)
      };
      var G__9846__4 = function() {
        var G__9847__delegate = function(a, b, c, ds) {
          return cljs.core.apply.cljs$lang$arity$5(f, a == null ? x : a, b, c, ds)
        };
        var G__9847 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9847__delegate.call(this, a, b, c, ds)
        };
        G__9847.cljs$lang$maxFixedArity = 3;
        G__9847.cljs$lang$applyTo = function(arglist__9848) {
          var a = cljs.core.first(arglist__9848);
          var b = cljs.core.first(cljs.core.next(arglist__9848));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9848)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9848)));
          return G__9847__delegate(a, b, c, ds)
        };
        G__9847.cljs$lang$arity$variadic = G__9847__delegate;
        return G__9847
      }();
      G__9846 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 1:
            return G__9846__1.call(this, a);
          case 2:
            return G__9846__2.call(this, a, b);
          case 3:
            return G__9846__3.call(this, a, b, c);
          default:
            return G__9846__4.cljs$lang$arity$variadic(a, b, c, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9846.cljs$lang$maxFixedArity = 3;
      G__9846.cljs$lang$applyTo = G__9846__4.cljs$lang$applyTo;
      return G__9846
    }()
  };
  var fnil__3 = function(f, x, y) {
    return function() {
      var G__9849 = null;
      var G__9849__2 = function(a, b) {
        return f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(a == null ? x : a, b == null ? y : b) : f.call(null, a == null ? x : a, b == null ? y : b)
      };
      var G__9849__3 = function(a, b, c) {
        return f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(a == null ? x : a, b == null ? y : b, c) : f.call(null, a == null ? x : a, b == null ? y : b, c)
      };
      var G__9849__4 = function() {
        var G__9850__delegate = function(a, b, c, ds) {
          return cljs.core.apply.cljs$lang$arity$5(f, a == null ? x : a, b == null ? y : b, c, ds)
        };
        var G__9850 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9850__delegate.call(this, a, b, c, ds)
        };
        G__9850.cljs$lang$maxFixedArity = 3;
        G__9850.cljs$lang$applyTo = function(arglist__9851) {
          var a = cljs.core.first(arglist__9851);
          var b = cljs.core.first(cljs.core.next(arglist__9851));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9851)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9851)));
          return G__9850__delegate(a, b, c, ds)
        };
        G__9850.cljs$lang$arity$variadic = G__9850__delegate;
        return G__9850
      }();
      G__9849 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__9849__2.call(this, a, b);
          case 3:
            return G__9849__3.call(this, a, b, c);
          default:
            return G__9849__4.cljs$lang$arity$variadic(a, b, c, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9849.cljs$lang$maxFixedArity = 3;
      G__9849.cljs$lang$applyTo = G__9849__4.cljs$lang$applyTo;
      return G__9849
    }()
  };
  var fnil__4 = function(f, x, y, z) {
    return function() {
      var G__9852 = null;
      var G__9852__2 = function(a, b) {
        return f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(a == null ? x : a, b == null ? y : b) : f.call(null, a == null ? x : a, b == null ? y : b)
      };
      var G__9852__3 = function(a, b, c) {
        return f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(a == null ? x : a, b == null ? y : b, c == null ? z : c) : f.call(null, a == null ? x : a, b == null ? y : b, c == null ? z : c)
      };
      var G__9852__4 = function() {
        var G__9853__delegate = function(a, b, c, ds) {
          return cljs.core.apply.cljs$lang$arity$5(f, a == null ? x : a, b == null ? y : b, c == null ? z : c, ds)
        };
        var G__9853 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9853__delegate.call(this, a, b, c, ds)
        };
        G__9853.cljs$lang$maxFixedArity = 3;
        G__9853.cljs$lang$applyTo = function(arglist__9854) {
          var a = cljs.core.first(arglist__9854);
          var b = cljs.core.first(cljs.core.next(arglist__9854));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9854)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9854)));
          return G__9853__delegate(a, b, c, ds)
        };
        G__9853.cljs$lang$arity$variadic = G__9853__delegate;
        return G__9853
      }();
      G__9852 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__9852__2.call(this, a, b);
          case 3:
            return G__9852__3.call(this, a, b, c);
          default:
            return G__9852__4.cljs$lang$arity$variadic(a, b, c, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9852.cljs$lang$maxFixedArity = 3;
      G__9852.cljs$lang$applyTo = G__9852__4.cljs$lang$applyTo;
      return G__9852
    }()
  };
  fnil = function(f, x, y, z) {
    switch(arguments.length) {
      case 2:
        return fnil__2.call(this, f, x);
      case 3:
        return fnil__3.call(this, f, x, y);
      case 4:
        return fnil__4.call(this, f, x, y, z)
    }
    throw"Invalid arity: " + arguments.length;
  };
  fnil.cljs$lang$arity$2 = fnil__2;
  fnil.cljs$lang$arity$3 = fnil__3;
  fnil.cljs$lang$arity$4 = fnil__4;
  return fnil
}();
cljs.core.map_indexed = function map_indexed(f, coll) {
  var mapi__9870 = function mapi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____9878 = cljs.core.seq(coll);
      if(temp__3974__auto____9878) {
        var s__9879 = temp__3974__auto____9878;
        if(cljs.core.chunked_seq_QMARK_(s__9879)) {
          var c__9880 = cljs.core.chunk_first(s__9879);
          var size__9881 = cljs.core.count(c__9880);
          var b__9882 = cljs.core.chunk_buffer(size__9881);
          var n__2527__auto____9883 = size__9881;
          var i__9884 = 0;
          while(true) {
            if(i__9884 < n__2527__auto____9883) {
              cljs.core.chunk_append(b__9882, f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(idx + i__9884, cljs.core._nth.cljs$lang$arity$2(c__9880, i__9884)) : f.call(null, idx + i__9884, cljs.core._nth.cljs$lang$arity$2(c__9880, i__9884)));
              var G__9885 = i__9884 + 1;
              i__9884 = G__9885;
              continue
            }else {
            }
            break
          }
          return cljs.core.chunk_cons(cljs.core.chunk(b__9882), mapi(idx + size__9881, cljs.core.chunk_rest(s__9879)))
        }else {
          return cljs.core.cons(f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(idx, cljs.core.first(s__9879)) : f.call(null, idx, cljs.core.first(s__9879)), mapi(idx + 1, cljs.core.rest(s__9879)))
        }
      }else {
        return null
      }
    }, null)
  };
  return mapi__9870.cljs$lang$arity$2 ? mapi__9870.cljs$lang$arity$2(0, coll) : mapi__9870.call(null, 0, coll)
};
cljs.core.keep = function keep(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____9895 = cljs.core.seq(coll);
    if(temp__3974__auto____9895) {
      var s__9896 = temp__3974__auto____9895;
      if(cljs.core.chunked_seq_QMARK_(s__9896)) {
        var c__9897 = cljs.core.chunk_first(s__9896);
        var size__9898 = cljs.core.count(c__9897);
        var b__9899 = cljs.core.chunk_buffer(size__9898);
        var n__2527__auto____9900 = size__9898;
        var i__9901 = 0;
        while(true) {
          if(i__9901 < n__2527__auto____9900) {
            var x__9902 = f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(cljs.core._nth.cljs$lang$arity$2(c__9897, i__9901)) : f.call(null, cljs.core._nth.cljs$lang$arity$2(c__9897, i__9901));
            if(x__9902 == null) {
            }else {
              cljs.core.chunk_append(b__9899, x__9902)
            }
            var G__9904 = i__9901 + 1;
            i__9901 = G__9904;
            continue
          }else {
          }
          break
        }
        return cljs.core.chunk_cons(cljs.core.chunk(b__9899), keep(f, cljs.core.chunk_rest(s__9896)))
      }else {
        var x__9903 = f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(cljs.core.first(s__9896)) : f.call(null, cljs.core.first(s__9896));
        if(x__9903 == null) {
          return keep(f, cljs.core.rest(s__9896))
        }else {
          return cljs.core.cons(x__9903, keep(f, cljs.core.rest(s__9896)))
        }
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.keep_indexed = function keep_indexed(f, coll) {
  var keepi__9930 = function keepi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____9940 = cljs.core.seq(coll);
      if(temp__3974__auto____9940) {
        var s__9941 = temp__3974__auto____9940;
        if(cljs.core.chunked_seq_QMARK_(s__9941)) {
          var c__9942 = cljs.core.chunk_first(s__9941);
          var size__9943 = cljs.core.count(c__9942);
          var b__9944 = cljs.core.chunk_buffer(size__9943);
          var n__2527__auto____9945 = size__9943;
          var i__9946 = 0;
          while(true) {
            if(i__9946 < n__2527__auto____9945) {
              var x__9947 = f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(idx + i__9946, cljs.core._nth.cljs$lang$arity$2(c__9942, i__9946)) : f.call(null, idx + i__9946, cljs.core._nth.cljs$lang$arity$2(c__9942, i__9946));
              if(x__9947 == null) {
              }else {
                cljs.core.chunk_append(b__9944, x__9947)
              }
              var G__9949 = i__9946 + 1;
              i__9946 = G__9949;
              continue
            }else {
            }
            break
          }
          return cljs.core.chunk_cons(cljs.core.chunk(b__9944), keepi(idx + size__9943, cljs.core.chunk_rest(s__9941)))
        }else {
          var x__9948 = f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(idx, cljs.core.first(s__9941)) : f.call(null, idx, cljs.core.first(s__9941));
          if(x__9948 == null) {
            return keepi(idx + 1, cljs.core.rest(s__9941))
          }else {
            return cljs.core.cons(x__9948, keepi(idx + 1, cljs.core.rest(s__9941)))
          }
        }
      }else {
        return null
      }
    }, null)
  };
  return keepi__9930.cljs$lang$arity$2 ? keepi__9930.cljs$lang$arity$2(0, coll) : keepi__9930.call(null, 0, coll)
};
cljs.core.every_pred = function() {
  var every_pred = null;
  var every_pred__1 = function(p) {
    return function() {
      var ep1 = null;
      var ep1__0 = function() {
        return true
      };
      var ep1__1 = function(x) {
        return cljs.core.boolean$(p.cljs$lang$arity$1 ? p.cljs$lang$arity$1(x) : p.call(null, x))
      };
      var ep1__2 = function(x, y) {
        return cljs.core.boolean$(function() {
          var and__3822__auto____10035 = p.cljs$lang$arity$1 ? p.cljs$lang$arity$1(x) : p.call(null, x);
          if(cljs.core.truth_(and__3822__auto____10035)) {
            return p.cljs$lang$arity$1 ? p.cljs$lang$arity$1(y) : p.call(null, y)
          }else {
            return and__3822__auto____10035
          }
        }())
      };
      var ep1__3 = function(x, y, z) {
        return cljs.core.boolean$(function() {
          var and__3822__auto____10036 = p.cljs$lang$arity$1 ? p.cljs$lang$arity$1(x) : p.call(null, x);
          if(cljs.core.truth_(and__3822__auto____10036)) {
            var and__3822__auto____10037 = p.cljs$lang$arity$1 ? p.cljs$lang$arity$1(y) : p.call(null, y);
            if(cljs.core.truth_(and__3822__auto____10037)) {
              return p.cljs$lang$arity$1 ? p.cljs$lang$arity$1(z) : p.call(null, z)
            }else {
              return and__3822__auto____10037
            }
          }else {
            return and__3822__auto____10036
          }
        }())
      };
      var ep1__4 = function() {
        var G__10106__delegate = function(x, y, z, args) {
          return cljs.core.boolean$(function() {
            var and__3822__auto____10038 = ep1.cljs$lang$arity$3(x, y, z);
            if(cljs.core.truth_(and__3822__auto____10038)) {
              return cljs.core.every_QMARK_(p, args)
            }else {
              return and__3822__auto____10038
            }
          }())
        };
        var G__10106 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10106__delegate.call(this, x, y, z, args)
        };
        G__10106.cljs$lang$maxFixedArity = 3;
        G__10106.cljs$lang$applyTo = function(arglist__10107) {
          var x = cljs.core.first(arglist__10107);
          var y = cljs.core.first(cljs.core.next(arglist__10107));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10107)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10107)));
          return G__10106__delegate(x, y, z, args)
        };
        G__10106.cljs$lang$arity$variadic = G__10106__delegate;
        return G__10106
      }();
      ep1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep1__0.call(this);
          case 1:
            return ep1__1.call(this, x);
          case 2:
            return ep1__2.call(this, x, y);
          case 3:
            return ep1__3.call(this, x, y, z);
          default:
            return ep1__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep1.cljs$lang$maxFixedArity = 3;
      ep1.cljs$lang$applyTo = ep1__4.cljs$lang$applyTo;
      ep1.cljs$lang$arity$0 = ep1__0;
      ep1.cljs$lang$arity$1 = ep1__1;
      ep1.cljs$lang$arity$2 = ep1__2;
      ep1.cljs$lang$arity$3 = ep1__3;
      ep1.cljs$lang$arity$variadic = ep1__4.cljs$lang$arity$variadic;
      return ep1
    }()
  };
  var every_pred__2 = function(p1, p2) {
    return function() {
      var ep2 = null;
      var ep2__0 = function() {
        return true
      };
      var ep2__1 = function(x) {
        return cljs.core.boolean$(function() {
          var and__3822__auto____10050 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(x) : p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____10050)) {
            return p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(x) : p2.call(null, x)
          }else {
            return and__3822__auto____10050
          }
        }())
      };
      var ep2__2 = function(x, y) {
        return cljs.core.boolean$(function() {
          var and__3822__auto____10051 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(x) : p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____10051)) {
            var and__3822__auto____10052 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(y) : p1.call(null, y);
            if(cljs.core.truth_(and__3822__auto____10052)) {
              var and__3822__auto____10053 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(x) : p2.call(null, x);
              if(cljs.core.truth_(and__3822__auto____10053)) {
                return p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(y) : p2.call(null, y)
              }else {
                return and__3822__auto____10053
              }
            }else {
              return and__3822__auto____10052
            }
          }else {
            return and__3822__auto____10051
          }
        }())
      };
      var ep2__3 = function(x, y, z) {
        return cljs.core.boolean$(function() {
          var and__3822__auto____10054 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(x) : p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____10054)) {
            var and__3822__auto____10055 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(y) : p1.call(null, y);
            if(cljs.core.truth_(and__3822__auto____10055)) {
              var and__3822__auto____10056 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(z) : p1.call(null, z);
              if(cljs.core.truth_(and__3822__auto____10056)) {
                var and__3822__auto____10057 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(x) : p2.call(null, x);
                if(cljs.core.truth_(and__3822__auto____10057)) {
                  var and__3822__auto____10058 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(y) : p2.call(null, y);
                  if(cljs.core.truth_(and__3822__auto____10058)) {
                    return p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(z) : p2.call(null, z)
                  }else {
                    return and__3822__auto____10058
                  }
                }else {
                  return and__3822__auto____10057
                }
              }else {
                return and__3822__auto____10056
              }
            }else {
              return and__3822__auto____10055
            }
          }else {
            return and__3822__auto____10054
          }
        }())
      };
      var ep2__4 = function() {
        var G__10108__delegate = function(x, y, z, args) {
          return cljs.core.boolean$(function() {
            var and__3822__auto____10059 = ep2.cljs$lang$arity$3(x, y, z);
            if(cljs.core.truth_(and__3822__auto____10059)) {
              return cljs.core.every_QMARK_(function(p1__9905_SHARP_) {
                var and__3822__auto____10060 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(p1__9905_SHARP_) : p1.call(null, p1__9905_SHARP_);
                if(cljs.core.truth_(and__3822__auto____10060)) {
                  return p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(p1__9905_SHARP_) : p2.call(null, p1__9905_SHARP_)
                }else {
                  return and__3822__auto____10060
                }
              }, args)
            }else {
              return and__3822__auto____10059
            }
          }())
        };
        var G__10108 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10108__delegate.call(this, x, y, z, args)
        };
        G__10108.cljs$lang$maxFixedArity = 3;
        G__10108.cljs$lang$applyTo = function(arglist__10109) {
          var x = cljs.core.first(arglist__10109);
          var y = cljs.core.first(cljs.core.next(arglist__10109));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10109)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10109)));
          return G__10108__delegate(x, y, z, args)
        };
        G__10108.cljs$lang$arity$variadic = G__10108__delegate;
        return G__10108
      }();
      ep2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep2__0.call(this);
          case 1:
            return ep2__1.call(this, x);
          case 2:
            return ep2__2.call(this, x, y);
          case 3:
            return ep2__3.call(this, x, y, z);
          default:
            return ep2__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep2.cljs$lang$maxFixedArity = 3;
      ep2.cljs$lang$applyTo = ep2__4.cljs$lang$applyTo;
      ep2.cljs$lang$arity$0 = ep2__0;
      ep2.cljs$lang$arity$1 = ep2__1;
      ep2.cljs$lang$arity$2 = ep2__2;
      ep2.cljs$lang$arity$3 = ep2__3;
      ep2.cljs$lang$arity$variadic = ep2__4.cljs$lang$arity$variadic;
      return ep2
    }()
  };
  var every_pred__3 = function(p1, p2, p3) {
    return function() {
      var ep3 = null;
      var ep3__0 = function() {
        return true
      };
      var ep3__1 = function(x) {
        return cljs.core.boolean$(function() {
          var and__3822__auto____10079 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(x) : p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____10079)) {
            var and__3822__auto____10080 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(x) : p2.call(null, x);
            if(cljs.core.truth_(and__3822__auto____10080)) {
              return p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(x) : p3.call(null, x)
            }else {
              return and__3822__auto____10080
            }
          }else {
            return and__3822__auto____10079
          }
        }())
      };
      var ep3__2 = function(x, y) {
        return cljs.core.boolean$(function() {
          var and__3822__auto____10081 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(x) : p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____10081)) {
            var and__3822__auto____10082 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(x) : p2.call(null, x);
            if(cljs.core.truth_(and__3822__auto____10082)) {
              var and__3822__auto____10083 = p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(x) : p3.call(null, x);
              if(cljs.core.truth_(and__3822__auto____10083)) {
                var and__3822__auto____10084 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(y) : p1.call(null, y);
                if(cljs.core.truth_(and__3822__auto____10084)) {
                  var and__3822__auto____10085 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(y) : p2.call(null, y);
                  if(cljs.core.truth_(and__3822__auto____10085)) {
                    return p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(y) : p3.call(null, y)
                  }else {
                    return and__3822__auto____10085
                  }
                }else {
                  return and__3822__auto____10084
                }
              }else {
                return and__3822__auto____10083
              }
            }else {
              return and__3822__auto____10082
            }
          }else {
            return and__3822__auto____10081
          }
        }())
      };
      var ep3__3 = function(x, y, z) {
        return cljs.core.boolean$(function() {
          var and__3822__auto____10086 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(x) : p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____10086)) {
            var and__3822__auto____10087 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(x) : p2.call(null, x);
            if(cljs.core.truth_(and__3822__auto____10087)) {
              var and__3822__auto____10088 = p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(x) : p3.call(null, x);
              if(cljs.core.truth_(and__3822__auto____10088)) {
                var and__3822__auto____10089 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(y) : p1.call(null, y);
                if(cljs.core.truth_(and__3822__auto____10089)) {
                  var and__3822__auto____10090 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(y) : p2.call(null, y);
                  if(cljs.core.truth_(and__3822__auto____10090)) {
                    var and__3822__auto____10091 = p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(y) : p3.call(null, y);
                    if(cljs.core.truth_(and__3822__auto____10091)) {
                      var and__3822__auto____10092 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(z) : p1.call(null, z);
                      if(cljs.core.truth_(and__3822__auto____10092)) {
                        var and__3822__auto____10093 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(z) : p2.call(null, z);
                        if(cljs.core.truth_(and__3822__auto____10093)) {
                          return p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(z) : p3.call(null, z)
                        }else {
                          return and__3822__auto____10093
                        }
                      }else {
                        return and__3822__auto____10092
                      }
                    }else {
                      return and__3822__auto____10091
                    }
                  }else {
                    return and__3822__auto____10090
                  }
                }else {
                  return and__3822__auto____10089
                }
              }else {
                return and__3822__auto____10088
              }
            }else {
              return and__3822__auto____10087
            }
          }else {
            return and__3822__auto____10086
          }
        }())
      };
      var ep3__4 = function() {
        var G__10110__delegate = function(x, y, z, args) {
          return cljs.core.boolean$(function() {
            var and__3822__auto____10094 = ep3.cljs$lang$arity$3(x, y, z);
            if(cljs.core.truth_(and__3822__auto____10094)) {
              return cljs.core.every_QMARK_(function(p1__9906_SHARP_) {
                var and__3822__auto____10095 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(p1__9906_SHARP_) : p1.call(null, p1__9906_SHARP_);
                if(cljs.core.truth_(and__3822__auto____10095)) {
                  var and__3822__auto____10096 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(p1__9906_SHARP_) : p2.call(null, p1__9906_SHARP_);
                  if(cljs.core.truth_(and__3822__auto____10096)) {
                    return p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(p1__9906_SHARP_) : p3.call(null, p1__9906_SHARP_)
                  }else {
                    return and__3822__auto____10096
                  }
                }else {
                  return and__3822__auto____10095
                }
              }, args)
            }else {
              return and__3822__auto____10094
            }
          }())
        };
        var G__10110 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10110__delegate.call(this, x, y, z, args)
        };
        G__10110.cljs$lang$maxFixedArity = 3;
        G__10110.cljs$lang$applyTo = function(arglist__10111) {
          var x = cljs.core.first(arglist__10111);
          var y = cljs.core.first(cljs.core.next(arglist__10111));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10111)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10111)));
          return G__10110__delegate(x, y, z, args)
        };
        G__10110.cljs$lang$arity$variadic = G__10110__delegate;
        return G__10110
      }();
      ep3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep3__0.call(this);
          case 1:
            return ep3__1.call(this, x);
          case 2:
            return ep3__2.call(this, x, y);
          case 3:
            return ep3__3.call(this, x, y, z);
          default:
            return ep3__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep3.cljs$lang$maxFixedArity = 3;
      ep3.cljs$lang$applyTo = ep3__4.cljs$lang$applyTo;
      ep3.cljs$lang$arity$0 = ep3__0;
      ep3.cljs$lang$arity$1 = ep3__1;
      ep3.cljs$lang$arity$2 = ep3__2;
      ep3.cljs$lang$arity$3 = ep3__3;
      ep3.cljs$lang$arity$variadic = ep3__4.cljs$lang$arity$variadic;
      return ep3
    }()
  };
  var every_pred__4 = function() {
    var G__10112__delegate = function(p1, p2, p3, ps) {
      var ps__10097 = cljs.core.list_STAR_.cljs$lang$arity$4(p1, p2, p3, ps);
      return function() {
        var epn = null;
        var epn__0 = function() {
          return true
        };
        var epn__1 = function(x) {
          return cljs.core.every_QMARK_(function(p1__9907_SHARP_) {
            return p1__9907_SHARP_.cljs$lang$arity$1 ? p1__9907_SHARP_.cljs$lang$arity$1(x) : p1__9907_SHARP_.call(null, x)
          }, ps__10097)
        };
        var epn__2 = function(x, y) {
          return cljs.core.every_QMARK_(function(p1__9908_SHARP_) {
            var and__3822__auto____10102 = p1__9908_SHARP_.cljs$lang$arity$1 ? p1__9908_SHARP_.cljs$lang$arity$1(x) : p1__9908_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3822__auto____10102)) {
              return p1__9908_SHARP_.cljs$lang$arity$1 ? p1__9908_SHARP_.cljs$lang$arity$1(y) : p1__9908_SHARP_.call(null, y)
            }else {
              return and__3822__auto____10102
            }
          }, ps__10097)
        };
        var epn__3 = function(x, y, z) {
          return cljs.core.every_QMARK_(function(p1__9909_SHARP_) {
            var and__3822__auto____10103 = p1__9909_SHARP_.cljs$lang$arity$1 ? p1__9909_SHARP_.cljs$lang$arity$1(x) : p1__9909_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3822__auto____10103)) {
              var and__3822__auto____10104 = p1__9909_SHARP_.cljs$lang$arity$1 ? p1__9909_SHARP_.cljs$lang$arity$1(y) : p1__9909_SHARP_.call(null, y);
              if(cljs.core.truth_(and__3822__auto____10104)) {
                return p1__9909_SHARP_.cljs$lang$arity$1 ? p1__9909_SHARP_.cljs$lang$arity$1(z) : p1__9909_SHARP_.call(null, z)
              }else {
                return and__3822__auto____10104
              }
            }else {
              return and__3822__auto____10103
            }
          }, ps__10097)
        };
        var epn__4 = function() {
          var G__10113__delegate = function(x, y, z, args) {
            return cljs.core.boolean$(function() {
              var and__3822__auto____10105 = epn.cljs$lang$arity$3(x, y, z);
              if(cljs.core.truth_(and__3822__auto____10105)) {
                return cljs.core.every_QMARK_(function(p1__9910_SHARP_) {
                  return cljs.core.every_QMARK_(p1__9910_SHARP_, args)
                }, ps__10097)
              }else {
                return and__3822__auto____10105
              }
            }())
          };
          var G__10113 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__10113__delegate.call(this, x, y, z, args)
          };
          G__10113.cljs$lang$maxFixedArity = 3;
          G__10113.cljs$lang$applyTo = function(arglist__10114) {
            var x = cljs.core.first(arglist__10114);
            var y = cljs.core.first(cljs.core.next(arglist__10114));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10114)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10114)));
            return G__10113__delegate(x, y, z, args)
          };
          G__10113.cljs$lang$arity$variadic = G__10113__delegate;
          return G__10113
        }();
        epn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return epn__0.call(this);
            case 1:
              return epn__1.call(this, x);
            case 2:
              return epn__2.call(this, x, y);
            case 3:
              return epn__3.call(this, x, y, z);
            default:
              return epn__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
          }
          throw"Invalid arity: " + arguments.length;
        };
        epn.cljs$lang$maxFixedArity = 3;
        epn.cljs$lang$applyTo = epn__4.cljs$lang$applyTo;
        epn.cljs$lang$arity$0 = epn__0;
        epn.cljs$lang$arity$1 = epn__1;
        epn.cljs$lang$arity$2 = epn__2;
        epn.cljs$lang$arity$3 = epn__3;
        epn.cljs$lang$arity$variadic = epn__4.cljs$lang$arity$variadic;
        return epn
      }()
    };
    var G__10112 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__10112__delegate.call(this, p1, p2, p3, ps)
    };
    G__10112.cljs$lang$maxFixedArity = 3;
    G__10112.cljs$lang$applyTo = function(arglist__10115) {
      var p1 = cljs.core.first(arglist__10115);
      var p2 = cljs.core.first(cljs.core.next(arglist__10115));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10115)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10115)));
      return G__10112__delegate(p1, p2, p3, ps)
    };
    G__10112.cljs$lang$arity$variadic = G__10112__delegate;
    return G__10112
  }();
  every_pred = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return every_pred__1.call(this, p1);
      case 2:
        return every_pred__2.call(this, p1, p2);
      case 3:
        return every_pred__3.call(this, p1, p2, p3);
      default:
        return every_pred__4.cljs$lang$arity$variadic(p1, p2, p3, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  every_pred.cljs$lang$maxFixedArity = 3;
  every_pred.cljs$lang$applyTo = every_pred__4.cljs$lang$applyTo;
  every_pred.cljs$lang$arity$1 = every_pred__1;
  every_pred.cljs$lang$arity$2 = every_pred__2;
  every_pred.cljs$lang$arity$3 = every_pred__3;
  every_pred.cljs$lang$arity$variadic = every_pred__4.cljs$lang$arity$variadic;
  return every_pred
}();
cljs.core.some_fn = function() {
  var some_fn = null;
  var some_fn__1 = function(p) {
    return function() {
      var sp1 = null;
      var sp1__0 = function() {
        return null
      };
      var sp1__1 = function(x) {
        return p.cljs$lang$arity$1 ? p.cljs$lang$arity$1(x) : p.call(null, x)
      };
      var sp1__2 = function(x, y) {
        var or__3824__auto____10196 = p.cljs$lang$arity$1 ? p.cljs$lang$arity$1(x) : p.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10196)) {
          return or__3824__auto____10196
        }else {
          return p.cljs$lang$arity$1 ? p.cljs$lang$arity$1(y) : p.call(null, y)
        }
      };
      var sp1__3 = function(x, y, z) {
        var or__3824__auto____10197 = p.cljs$lang$arity$1 ? p.cljs$lang$arity$1(x) : p.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10197)) {
          return or__3824__auto____10197
        }else {
          var or__3824__auto____10198 = p.cljs$lang$arity$1 ? p.cljs$lang$arity$1(y) : p.call(null, y);
          if(cljs.core.truth_(or__3824__auto____10198)) {
            return or__3824__auto____10198
          }else {
            return p.cljs$lang$arity$1 ? p.cljs$lang$arity$1(z) : p.call(null, z)
          }
        }
      };
      var sp1__4 = function() {
        var G__10267__delegate = function(x, y, z, args) {
          var or__3824__auto____10199 = sp1.cljs$lang$arity$3(x, y, z);
          if(cljs.core.truth_(or__3824__auto____10199)) {
            return or__3824__auto____10199
          }else {
            return cljs.core.some(p, args)
          }
        };
        var G__10267 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10267__delegate.call(this, x, y, z, args)
        };
        G__10267.cljs$lang$maxFixedArity = 3;
        G__10267.cljs$lang$applyTo = function(arglist__10268) {
          var x = cljs.core.first(arglist__10268);
          var y = cljs.core.first(cljs.core.next(arglist__10268));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10268)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10268)));
          return G__10267__delegate(x, y, z, args)
        };
        G__10267.cljs$lang$arity$variadic = G__10267__delegate;
        return G__10267
      }();
      sp1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp1__0.call(this);
          case 1:
            return sp1__1.call(this, x);
          case 2:
            return sp1__2.call(this, x, y);
          case 3:
            return sp1__3.call(this, x, y, z);
          default:
            return sp1__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp1.cljs$lang$maxFixedArity = 3;
      sp1.cljs$lang$applyTo = sp1__4.cljs$lang$applyTo;
      sp1.cljs$lang$arity$0 = sp1__0;
      sp1.cljs$lang$arity$1 = sp1__1;
      sp1.cljs$lang$arity$2 = sp1__2;
      sp1.cljs$lang$arity$3 = sp1__3;
      sp1.cljs$lang$arity$variadic = sp1__4.cljs$lang$arity$variadic;
      return sp1
    }()
  };
  var some_fn__2 = function(p1, p2) {
    return function() {
      var sp2 = null;
      var sp2__0 = function() {
        return null
      };
      var sp2__1 = function(x) {
        var or__3824__auto____10211 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(x) : p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10211)) {
          return or__3824__auto____10211
        }else {
          return p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(x) : p2.call(null, x)
        }
      };
      var sp2__2 = function(x, y) {
        var or__3824__auto____10212 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(x) : p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10212)) {
          return or__3824__auto____10212
        }else {
          var or__3824__auto____10213 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(y) : p1.call(null, y);
          if(cljs.core.truth_(or__3824__auto____10213)) {
            return or__3824__auto____10213
          }else {
            var or__3824__auto____10214 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(x) : p2.call(null, x);
            if(cljs.core.truth_(or__3824__auto____10214)) {
              return or__3824__auto____10214
            }else {
              return p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(y) : p2.call(null, y)
            }
          }
        }
      };
      var sp2__3 = function(x, y, z) {
        var or__3824__auto____10215 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(x) : p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10215)) {
          return or__3824__auto____10215
        }else {
          var or__3824__auto____10216 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(y) : p1.call(null, y);
          if(cljs.core.truth_(or__3824__auto____10216)) {
            return or__3824__auto____10216
          }else {
            var or__3824__auto____10217 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(z) : p1.call(null, z);
            if(cljs.core.truth_(or__3824__auto____10217)) {
              return or__3824__auto____10217
            }else {
              var or__3824__auto____10218 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(x) : p2.call(null, x);
              if(cljs.core.truth_(or__3824__auto____10218)) {
                return or__3824__auto____10218
              }else {
                var or__3824__auto____10219 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(y) : p2.call(null, y);
                if(cljs.core.truth_(or__3824__auto____10219)) {
                  return or__3824__auto____10219
                }else {
                  return p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(z) : p2.call(null, z)
                }
              }
            }
          }
        }
      };
      var sp2__4 = function() {
        var G__10269__delegate = function(x, y, z, args) {
          var or__3824__auto____10220 = sp2.cljs$lang$arity$3(x, y, z);
          if(cljs.core.truth_(or__3824__auto____10220)) {
            return or__3824__auto____10220
          }else {
            return cljs.core.some(function(p1__9950_SHARP_) {
              var or__3824__auto____10221 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(p1__9950_SHARP_) : p1.call(null, p1__9950_SHARP_);
              if(cljs.core.truth_(or__3824__auto____10221)) {
                return or__3824__auto____10221
              }else {
                return p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(p1__9950_SHARP_) : p2.call(null, p1__9950_SHARP_)
              }
            }, args)
          }
        };
        var G__10269 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10269__delegate.call(this, x, y, z, args)
        };
        G__10269.cljs$lang$maxFixedArity = 3;
        G__10269.cljs$lang$applyTo = function(arglist__10270) {
          var x = cljs.core.first(arglist__10270);
          var y = cljs.core.first(cljs.core.next(arglist__10270));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10270)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10270)));
          return G__10269__delegate(x, y, z, args)
        };
        G__10269.cljs$lang$arity$variadic = G__10269__delegate;
        return G__10269
      }();
      sp2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp2__0.call(this);
          case 1:
            return sp2__1.call(this, x);
          case 2:
            return sp2__2.call(this, x, y);
          case 3:
            return sp2__3.call(this, x, y, z);
          default:
            return sp2__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp2.cljs$lang$maxFixedArity = 3;
      sp2.cljs$lang$applyTo = sp2__4.cljs$lang$applyTo;
      sp2.cljs$lang$arity$0 = sp2__0;
      sp2.cljs$lang$arity$1 = sp2__1;
      sp2.cljs$lang$arity$2 = sp2__2;
      sp2.cljs$lang$arity$3 = sp2__3;
      sp2.cljs$lang$arity$variadic = sp2__4.cljs$lang$arity$variadic;
      return sp2
    }()
  };
  var some_fn__3 = function(p1, p2, p3) {
    return function() {
      var sp3 = null;
      var sp3__0 = function() {
        return null
      };
      var sp3__1 = function(x) {
        var or__3824__auto____10240 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(x) : p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10240)) {
          return or__3824__auto____10240
        }else {
          var or__3824__auto____10241 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(x) : p2.call(null, x);
          if(cljs.core.truth_(or__3824__auto____10241)) {
            return or__3824__auto____10241
          }else {
            return p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(x) : p3.call(null, x)
          }
        }
      };
      var sp3__2 = function(x, y) {
        var or__3824__auto____10242 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(x) : p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10242)) {
          return or__3824__auto____10242
        }else {
          var or__3824__auto____10243 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(x) : p2.call(null, x);
          if(cljs.core.truth_(or__3824__auto____10243)) {
            return or__3824__auto____10243
          }else {
            var or__3824__auto____10244 = p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(x) : p3.call(null, x);
            if(cljs.core.truth_(or__3824__auto____10244)) {
              return or__3824__auto____10244
            }else {
              var or__3824__auto____10245 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(y) : p1.call(null, y);
              if(cljs.core.truth_(or__3824__auto____10245)) {
                return or__3824__auto____10245
              }else {
                var or__3824__auto____10246 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(y) : p2.call(null, y);
                if(cljs.core.truth_(or__3824__auto____10246)) {
                  return or__3824__auto____10246
                }else {
                  return p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(y) : p3.call(null, y)
                }
              }
            }
          }
        }
      };
      var sp3__3 = function(x, y, z) {
        var or__3824__auto____10247 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(x) : p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10247)) {
          return or__3824__auto____10247
        }else {
          var or__3824__auto____10248 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(x) : p2.call(null, x);
          if(cljs.core.truth_(or__3824__auto____10248)) {
            return or__3824__auto____10248
          }else {
            var or__3824__auto____10249 = p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(x) : p3.call(null, x);
            if(cljs.core.truth_(or__3824__auto____10249)) {
              return or__3824__auto____10249
            }else {
              var or__3824__auto____10250 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(y) : p1.call(null, y);
              if(cljs.core.truth_(or__3824__auto____10250)) {
                return or__3824__auto____10250
              }else {
                var or__3824__auto____10251 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(y) : p2.call(null, y);
                if(cljs.core.truth_(or__3824__auto____10251)) {
                  return or__3824__auto____10251
                }else {
                  var or__3824__auto____10252 = p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(y) : p3.call(null, y);
                  if(cljs.core.truth_(or__3824__auto____10252)) {
                    return or__3824__auto____10252
                  }else {
                    var or__3824__auto____10253 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(z) : p1.call(null, z);
                    if(cljs.core.truth_(or__3824__auto____10253)) {
                      return or__3824__auto____10253
                    }else {
                      var or__3824__auto____10254 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(z) : p2.call(null, z);
                      if(cljs.core.truth_(or__3824__auto____10254)) {
                        return or__3824__auto____10254
                      }else {
                        return p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(z) : p3.call(null, z)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      var sp3__4 = function() {
        var G__10271__delegate = function(x, y, z, args) {
          var or__3824__auto____10255 = sp3.cljs$lang$arity$3(x, y, z);
          if(cljs.core.truth_(or__3824__auto____10255)) {
            return or__3824__auto____10255
          }else {
            return cljs.core.some(function(p1__9951_SHARP_) {
              var or__3824__auto____10256 = p1.cljs$lang$arity$1 ? p1.cljs$lang$arity$1(p1__9951_SHARP_) : p1.call(null, p1__9951_SHARP_);
              if(cljs.core.truth_(or__3824__auto____10256)) {
                return or__3824__auto____10256
              }else {
                var or__3824__auto____10257 = p2.cljs$lang$arity$1 ? p2.cljs$lang$arity$1(p1__9951_SHARP_) : p2.call(null, p1__9951_SHARP_);
                if(cljs.core.truth_(or__3824__auto____10257)) {
                  return or__3824__auto____10257
                }else {
                  return p3.cljs$lang$arity$1 ? p3.cljs$lang$arity$1(p1__9951_SHARP_) : p3.call(null, p1__9951_SHARP_)
                }
              }
            }, args)
          }
        };
        var G__10271 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10271__delegate.call(this, x, y, z, args)
        };
        G__10271.cljs$lang$maxFixedArity = 3;
        G__10271.cljs$lang$applyTo = function(arglist__10272) {
          var x = cljs.core.first(arglist__10272);
          var y = cljs.core.first(cljs.core.next(arglist__10272));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10272)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10272)));
          return G__10271__delegate(x, y, z, args)
        };
        G__10271.cljs$lang$arity$variadic = G__10271__delegate;
        return G__10271
      }();
      sp3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp3__0.call(this);
          case 1:
            return sp3__1.call(this, x);
          case 2:
            return sp3__2.call(this, x, y);
          case 3:
            return sp3__3.call(this, x, y, z);
          default:
            return sp3__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp3.cljs$lang$maxFixedArity = 3;
      sp3.cljs$lang$applyTo = sp3__4.cljs$lang$applyTo;
      sp3.cljs$lang$arity$0 = sp3__0;
      sp3.cljs$lang$arity$1 = sp3__1;
      sp3.cljs$lang$arity$2 = sp3__2;
      sp3.cljs$lang$arity$3 = sp3__3;
      sp3.cljs$lang$arity$variadic = sp3__4.cljs$lang$arity$variadic;
      return sp3
    }()
  };
  var some_fn__4 = function() {
    var G__10273__delegate = function(p1, p2, p3, ps) {
      var ps__10258 = cljs.core.list_STAR_.cljs$lang$arity$4(p1, p2, p3, ps);
      return function() {
        var spn = null;
        var spn__0 = function() {
          return null
        };
        var spn__1 = function(x) {
          return cljs.core.some(function(p1__9952_SHARP_) {
            return p1__9952_SHARP_.cljs$lang$arity$1 ? p1__9952_SHARP_.cljs$lang$arity$1(x) : p1__9952_SHARP_.call(null, x)
          }, ps__10258)
        };
        var spn__2 = function(x, y) {
          return cljs.core.some(function(p1__9953_SHARP_) {
            var or__3824__auto____10263 = p1__9953_SHARP_.cljs$lang$arity$1 ? p1__9953_SHARP_.cljs$lang$arity$1(x) : p1__9953_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3824__auto____10263)) {
              return or__3824__auto____10263
            }else {
              return p1__9953_SHARP_.cljs$lang$arity$1 ? p1__9953_SHARP_.cljs$lang$arity$1(y) : p1__9953_SHARP_.call(null, y)
            }
          }, ps__10258)
        };
        var spn__3 = function(x, y, z) {
          return cljs.core.some(function(p1__9954_SHARP_) {
            var or__3824__auto____10264 = p1__9954_SHARP_.cljs$lang$arity$1 ? p1__9954_SHARP_.cljs$lang$arity$1(x) : p1__9954_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3824__auto____10264)) {
              return or__3824__auto____10264
            }else {
              var or__3824__auto____10265 = p1__9954_SHARP_.cljs$lang$arity$1 ? p1__9954_SHARP_.cljs$lang$arity$1(y) : p1__9954_SHARP_.call(null, y);
              if(cljs.core.truth_(or__3824__auto____10265)) {
                return or__3824__auto____10265
              }else {
                return p1__9954_SHARP_.cljs$lang$arity$1 ? p1__9954_SHARP_.cljs$lang$arity$1(z) : p1__9954_SHARP_.call(null, z)
              }
            }
          }, ps__10258)
        };
        var spn__4 = function() {
          var G__10274__delegate = function(x, y, z, args) {
            var or__3824__auto____10266 = spn.cljs$lang$arity$3(x, y, z);
            if(cljs.core.truth_(or__3824__auto____10266)) {
              return or__3824__auto____10266
            }else {
              return cljs.core.some(function(p1__9955_SHARP_) {
                return cljs.core.some(p1__9955_SHARP_, args)
              }, ps__10258)
            }
          };
          var G__10274 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__10274__delegate.call(this, x, y, z, args)
          };
          G__10274.cljs$lang$maxFixedArity = 3;
          G__10274.cljs$lang$applyTo = function(arglist__10275) {
            var x = cljs.core.first(arglist__10275);
            var y = cljs.core.first(cljs.core.next(arglist__10275));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10275)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10275)));
            return G__10274__delegate(x, y, z, args)
          };
          G__10274.cljs$lang$arity$variadic = G__10274__delegate;
          return G__10274
        }();
        spn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return spn__0.call(this);
            case 1:
              return spn__1.call(this, x);
            case 2:
              return spn__2.call(this, x, y);
            case 3:
              return spn__3.call(this, x, y, z);
            default:
              return spn__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
          }
          throw"Invalid arity: " + arguments.length;
        };
        spn.cljs$lang$maxFixedArity = 3;
        spn.cljs$lang$applyTo = spn__4.cljs$lang$applyTo;
        spn.cljs$lang$arity$0 = spn__0;
        spn.cljs$lang$arity$1 = spn__1;
        spn.cljs$lang$arity$2 = spn__2;
        spn.cljs$lang$arity$3 = spn__3;
        spn.cljs$lang$arity$variadic = spn__4.cljs$lang$arity$variadic;
        return spn
      }()
    };
    var G__10273 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__10273__delegate.call(this, p1, p2, p3, ps)
    };
    G__10273.cljs$lang$maxFixedArity = 3;
    G__10273.cljs$lang$applyTo = function(arglist__10276) {
      var p1 = cljs.core.first(arglist__10276);
      var p2 = cljs.core.first(cljs.core.next(arglist__10276));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10276)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10276)));
      return G__10273__delegate(p1, p2, p3, ps)
    };
    G__10273.cljs$lang$arity$variadic = G__10273__delegate;
    return G__10273
  }();
  some_fn = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return some_fn__1.call(this, p1);
      case 2:
        return some_fn__2.call(this, p1, p2);
      case 3:
        return some_fn__3.call(this, p1, p2, p3);
      default:
        return some_fn__4.cljs$lang$arity$variadic(p1, p2, p3, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  some_fn.cljs$lang$maxFixedArity = 3;
  some_fn.cljs$lang$applyTo = some_fn__4.cljs$lang$applyTo;
  some_fn.cljs$lang$arity$1 = some_fn__1;
  some_fn.cljs$lang$arity$2 = some_fn__2;
  some_fn.cljs$lang$arity$3 = some_fn__3;
  some_fn.cljs$lang$arity$variadic = some_fn__4.cljs$lang$arity$variadic;
  return some_fn
}();
cljs.core.map = function() {
  var map = null;
  var map__2 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____10295 = cljs.core.seq(coll);
      if(temp__3974__auto____10295) {
        var s__10296 = temp__3974__auto____10295;
        if(cljs.core.chunked_seq_QMARK_(s__10296)) {
          var c__10297 = cljs.core.chunk_first(s__10296);
          var size__10298 = cljs.core.count(c__10297);
          var b__10299 = cljs.core.chunk_buffer(size__10298);
          var n__2527__auto____10300 = size__10298;
          var i__10301 = 0;
          while(true) {
            if(i__10301 < n__2527__auto____10300) {
              cljs.core.chunk_append(b__10299, f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(cljs.core._nth.cljs$lang$arity$2(c__10297, i__10301)) : f.call(null, cljs.core._nth.cljs$lang$arity$2(c__10297, i__10301)));
              var G__10313 = i__10301 + 1;
              i__10301 = G__10313;
              continue
            }else {
            }
            break
          }
          return cljs.core.chunk_cons(cljs.core.chunk(b__10299), map.cljs$lang$arity$2(f, cljs.core.chunk_rest(s__10296)))
        }else {
          return cljs.core.cons(f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(cljs.core.first(s__10296)) : f.call(null, cljs.core.first(s__10296)), map.cljs$lang$arity$2(f, cljs.core.rest(s__10296)))
        }
      }else {
        return null
      }
    }, null)
  };
  var map__3 = function(f, c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__10302 = cljs.core.seq(c1);
      var s2__10303 = cljs.core.seq(c2);
      if(function() {
        var and__3822__auto____10304 = s1__10302;
        if(and__3822__auto____10304) {
          return s2__10303
        }else {
          return and__3822__auto____10304
        }
      }()) {
        return cljs.core.cons(f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(cljs.core.first(s1__10302), cljs.core.first(s2__10303)) : f.call(null, cljs.core.first(s1__10302), cljs.core.first(s2__10303)), map.cljs$lang$arity$3(f, cljs.core.rest(s1__10302), cljs.core.rest(s2__10303)))
      }else {
        return null
      }
    }, null)
  };
  var map__4 = function(f, c1, c2, c3) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__10305 = cljs.core.seq(c1);
      var s2__10306 = cljs.core.seq(c2);
      var s3__10307 = cljs.core.seq(c3);
      if(function() {
        var and__3822__auto____10308 = s1__10305;
        if(and__3822__auto____10308) {
          var and__3822__auto____10309 = s2__10306;
          if(and__3822__auto____10309) {
            return s3__10307
          }else {
            return and__3822__auto____10309
          }
        }else {
          return and__3822__auto____10308
        }
      }()) {
        return cljs.core.cons(f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(cljs.core.first(s1__10305), cljs.core.first(s2__10306), cljs.core.first(s3__10307)) : f.call(null, cljs.core.first(s1__10305), cljs.core.first(s2__10306), cljs.core.first(s3__10307)), map.cljs$lang$arity$4(f, cljs.core.rest(s1__10305), cljs.core.rest(s2__10306), cljs.core.rest(s3__10307)))
      }else {
        return null
      }
    }, null)
  };
  var map__5 = function() {
    var G__10314__delegate = function(f, c1, c2, c3, colls) {
      var step__10312 = function step(cs) {
        return new cljs.core.LazySeq(null, false, function() {
          var ss__10311 = map.cljs$lang$arity$2(cljs.core.seq, cs);
          if(cljs.core.every_QMARK_(cljs.core.identity, ss__10311)) {
            return cljs.core.cons(map.cljs$lang$arity$2(cljs.core.first, ss__10311), step(map.cljs$lang$arity$2(cljs.core.rest, ss__10311)))
          }else {
            return null
          }
        }, null)
      };
      return map.cljs$lang$arity$2(function(p1__10116_SHARP_) {
        return cljs.core.apply.cljs$lang$arity$2(f, p1__10116_SHARP_)
      }, step__10312.cljs$lang$arity$1 ? step__10312.cljs$lang$arity$1(cljs.core.conj.cljs$lang$arity$variadic(colls, c3, cljs.core.array_seq([c2, c1], 0))) : step__10312.call(null, cljs.core.conj.cljs$lang$arity$variadic(colls, c3, cljs.core.array_seq([c2, c1], 0))))
    };
    var G__10314 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__10314__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__10314.cljs$lang$maxFixedArity = 4;
    G__10314.cljs$lang$applyTo = function(arglist__10315) {
      var f = cljs.core.first(arglist__10315);
      var c1 = cljs.core.first(cljs.core.next(arglist__10315));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10315)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10315))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10315))));
      return G__10314__delegate(f, c1, c2, c3, colls)
    };
    G__10314.cljs$lang$arity$variadic = G__10314__delegate;
    return G__10314
  }();
  map = function(f, c1, c2, c3, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return map__2.call(this, f, c1);
      case 3:
        return map__3.call(this, f, c1, c2);
      case 4:
        return map__4.call(this, f, c1, c2, c3);
      default:
        return map__5.cljs$lang$arity$variadic(f, c1, c2, c3, cljs.core.array_seq(arguments, 4))
    }
    throw"Invalid arity: " + arguments.length;
  };
  map.cljs$lang$maxFixedArity = 4;
  map.cljs$lang$applyTo = map__5.cljs$lang$applyTo;
  map.cljs$lang$arity$2 = map__2;
  map.cljs$lang$arity$3 = map__3;
  map.cljs$lang$arity$4 = map__4;
  map.cljs$lang$arity$variadic = map__5.cljs$lang$arity$variadic;
  return map
}();
cljs.core.take = function take(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    if(n > 0) {
      var temp__3974__auto____10318 = cljs.core.seq(coll);
      if(temp__3974__auto____10318) {
        var s__10319 = temp__3974__auto____10318;
        return cljs.core.cons(cljs.core.first(s__10319), take(n - 1, cljs.core.rest(s__10319)))
      }else {
        return null
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.drop = function drop(n, coll) {
  var step__10325 = function(n, coll) {
    while(true) {
      var s__10323 = cljs.core.seq(coll);
      if(cljs.core.truth_(function() {
        var and__3822__auto____10324 = n > 0;
        if(and__3822__auto____10324) {
          return s__10323
        }else {
          return and__3822__auto____10324
        }
      }())) {
        var G__10326 = n - 1;
        var G__10327 = cljs.core.rest(s__10323);
        n = G__10326;
        coll = G__10327;
        continue
      }else {
        return s__10323
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__10325.cljs$lang$arity$2 ? step__10325.cljs$lang$arity$2(n, coll) : step__10325.call(null, n, coll)
  }, null)
};
cljs.core.drop_last = function() {
  var drop_last = null;
  var drop_last__1 = function(s) {
    return drop_last.cljs$lang$arity$2(1, s)
  };
  var drop_last__2 = function(n, s) {
    return cljs.core.map.cljs$lang$arity$3(function(x, _) {
      return x
    }, s, cljs.core.drop(n, s))
  };
  drop_last = function(n, s) {
    switch(arguments.length) {
      case 1:
        return drop_last__1.call(this, n);
      case 2:
        return drop_last__2.call(this, n, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  drop_last.cljs$lang$arity$1 = drop_last__1;
  drop_last.cljs$lang$arity$2 = drop_last__2;
  return drop_last
}();
cljs.core.take_last = function take_last(n, coll) {
  var s__10330 = cljs.core.seq(coll);
  var lead__10331 = cljs.core.seq(cljs.core.drop(n, coll));
  while(true) {
    if(lead__10331) {
      var G__10332 = cljs.core.next(s__10330);
      var G__10333 = cljs.core.next(lead__10331);
      s__10330 = G__10332;
      lead__10331 = G__10333;
      continue
    }else {
      return s__10330
    }
    break
  }
};
cljs.core.drop_while = function drop_while(pred, coll) {
  var step__10339 = function(pred, coll) {
    while(true) {
      var s__10337 = cljs.core.seq(coll);
      if(cljs.core.truth_(function() {
        var and__3822__auto____10338 = s__10337;
        if(and__3822__auto____10338) {
          return pred.cljs$lang$arity$1 ? pred.cljs$lang$arity$1(cljs.core.first(s__10337)) : pred.call(null, cljs.core.first(s__10337))
        }else {
          return and__3822__auto____10338
        }
      }())) {
        var G__10340 = pred;
        var G__10341 = cljs.core.rest(s__10337);
        pred = G__10340;
        coll = G__10341;
        continue
      }else {
        return s__10337
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__10339.cljs$lang$arity$2 ? step__10339.cljs$lang$arity$2(pred, coll) : step__10339.call(null, pred, coll)
  }, null)
};
cljs.core.cycle = function cycle(coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____10344 = cljs.core.seq(coll);
    if(temp__3974__auto____10344) {
      var s__10345 = temp__3974__auto____10344;
      return cljs.core.concat.cljs$lang$arity$2(s__10345, cycle(s__10345))
    }else {
      return null
    }
  }, null)
};
cljs.core.split_at = function split_at(n, coll) {
  return cljs.core.PersistentVector.fromArray([cljs.core.take(n, coll), cljs.core.drop(n, coll)], true)
};
cljs.core.repeat = function() {
  var repeat = null;
  var repeat__1 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons(x, repeat.cljs$lang$arity$1(x))
    }, null)
  };
  var repeat__2 = function(n, x) {
    return cljs.core.take(n, repeat.cljs$lang$arity$1(x))
  };
  repeat = function(n, x) {
    switch(arguments.length) {
      case 1:
        return repeat__1.call(this, n);
      case 2:
        return repeat__2.call(this, n, x)
    }
    throw"Invalid arity: " + arguments.length;
  };
  repeat.cljs$lang$arity$1 = repeat__1;
  repeat.cljs$lang$arity$2 = repeat__2;
  return repeat
}();
cljs.core.replicate = function replicate(n, x) {
  return cljs.core.take(n, cljs.core.repeat.cljs$lang$arity$1(x))
};
cljs.core.repeatedly = function() {
  var repeatedly = null;
  var repeatedly__1 = function(f) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons(f.cljs$lang$arity$0 ? f.cljs$lang$arity$0() : f.call(null), repeatedly.cljs$lang$arity$1(f))
    }, null)
  };
  var repeatedly__2 = function(n, f) {
    return cljs.core.take(n, repeatedly.cljs$lang$arity$1(f))
  };
  repeatedly = function(n, f) {
    switch(arguments.length) {
      case 1:
        return repeatedly__1.call(this, n);
      case 2:
        return repeatedly__2.call(this, n, f)
    }
    throw"Invalid arity: " + arguments.length;
  };
  repeatedly.cljs$lang$arity$1 = repeatedly__1;
  repeatedly.cljs$lang$arity$2 = repeatedly__2;
  return repeatedly
}();
cljs.core.iterate = function iterate(f, x) {
  return cljs.core.cons(x, new cljs.core.LazySeq(null, false, function() {
    return iterate(f, f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(x) : f.call(null, x))
  }, null))
};
cljs.core.interleave = function() {
  var interleave = null;
  var interleave__2 = function(c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__10350 = cljs.core.seq(c1);
      var s2__10351 = cljs.core.seq(c2);
      if(function() {
        var and__3822__auto____10352 = s1__10350;
        if(and__3822__auto____10352) {
          return s2__10351
        }else {
          return and__3822__auto____10352
        }
      }()) {
        return cljs.core.cons(cljs.core.first(s1__10350), cljs.core.cons(cljs.core.first(s2__10351), interleave.cljs$lang$arity$2(cljs.core.rest(s1__10350), cljs.core.rest(s2__10351))))
      }else {
        return null
      }
    }, null)
  };
  var interleave__3 = function() {
    var G__10354__delegate = function(c1, c2, colls) {
      return new cljs.core.LazySeq(null, false, function() {
        var ss__10353 = cljs.core.map.cljs$lang$arity$2(cljs.core.seq, cljs.core.conj.cljs$lang$arity$variadic(colls, c2, cljs.core.array_seq([c1], 0)));
        if(cljs.core.every_QMARK_(cljs.core.identity, ss__10353)) {
          return cljs.core.concat.cljs$lang$arity$2(cljs.core.map.cljs$lang$arity$2(cljs.core.first, ss__10353), cljs.core.apply.cljs$lang$arity$2(interleave, cljs.core.map.cljs$lang$arity$2(cljs.core.rest, ss__10353)))
        }else {
          return null
        }
      }, null)
    };
    var G__10354 = function(c1, c2, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__10354__delegate.call(this, c1, c2, colls)
    };
    G__10354.cljs$lang$maxFixedArity = 2;
    G__10354.cljs$lang$applyTo = function(arglist__10355) {
      var c1 = cljs.core.first(arglist__10355);
      var c2 = cljs.core.first(cljs.core.next(arglist__10355));
      var colls = cljs.core.rest(cljs.core.next(arglist__10355));
      return G__10354__delegate(c1, c2, colls)
    };
    G__10354.cljs$lang$arity$variadic = G__10354__delegate;
    return G__10354
  }();
  interleave = function(c1, c2, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return interleave__2.call(this, c1, c2);
      default:
        return interleave__3.cljs$lang$arity$variadic(c1, c2, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  interleave.cljs$lang$maxFixedArity = 2;
  interleave.cljs$lang$applyTo = interleave__3.cljs$lang$applyTo;
  interleave.cljs$lang$arity$2 = interleave__2;
  interleave.cljs$lang$arity$variadic = interleave__3.cljs$lang$arity$variadic;
  return interleave
}();
cljs.core.interpose = function interpose(sep, coll) {
  return cljs.core.drop(1, cljs.core.interleave.cljs$lang$arity$2(cljs.core.repeat.cljs$lang$arity$1(sep), coll))
};
cljs.core.flatten1 = function flatten1(colls) {
  var cat__10365 = function cat(coll, colls) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3971__auto____10363 = cljs.core.seq(coll);
      if(temp__3971__auto____10363) {
        var coll__10364 = temp__3971__auto____10363;
        return cljs.core.cons(cljs.core.first(coll__10364), cat(cljs.core.rest(coll__10364), colls))
      }else {
        if(cljs.core.seq(colls)) {
          return cat(cljs.core.first(colls), cljs.core.rest(colls))
        }else {
          return null
        }
      }
    }, null)
  };
  return cat__10365.cljs$lang$arity$2 ? cat__10365.cljs$lang$arity$2(null, colls) : cat__10365.call(null, null, colls)
};
cljs.core.mapcat = function() {
  var mapcat = null;
  var mapcat__2 = function(f, coll) {
    return cljs.core.flatten1(cljs.core.map.cljs$lang$arity$2(f, coll))
  };
  var mapcat__3 = function() {
    var G__10366__delegate = function(f, coll, colls) {
      return cljs.core.flatten1(cljs.core.apply.cljs$lang$arity$4(cljs.core.map, f, coll, colls))
    };
    var G__10366 = function(f, coll, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__10366__delegate.call(this, f, coll, colls)
    };
    G__10366.cljs$lang$maxFixedArity = 2;
    G__10366.cljs$lang$applyTo = function(arglist__10367) {
      var f = cljs.core.first(arglist__10367);
      var coll = cljs.core.first(cljs.core.next(arglist__10367));
      var colls = cljs.core.rest(cljs.core.next(arglist__10367));
      return G__10366__delegate(f, coll, colls)
    };
    G__10366.cljs$lang$arity$variadic = G__10366__delegate;
    return G__10366
  }();
  mapcat = function(f, coll, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return mapcat__2.call(this, f, coll);
      default:
        return mapcat__3.cljs$lang$arity$variadic(f, coll, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  mapcat.cljs$lang$maxFixedArity = 2;
  mapcat.cljs$lang$applyTo = mapcat__3.cljs$lang$applyTo;
  mapcat.cljs$lang$arity$2 = mapcat__2;
  mapcat.cljs$lang$arity$variadic = mapcat__3.cljs$lang$arity$variadic;
  return mapcat
}();
cljs.core.filter = function filter(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____10377 = cljs.core.seq(coll);
    if(temp__3974__auto____10377) {
      var s__10378 = temp__3974__auto____10377;
      if(cljs.core.chunked_seq_QMARK_(s__10378)) {
        var c__10379 = cljs.core.chunk_first(s__10378);
        var size__10380 = cljs.core.count(c__10379);
        var b__10381 = cljs.core.chunk_buffer(size__10380);
        var n__2527__auto____10382 = size__10380;
        var i__10383 = 0;
        while(true) {
          if(i__10383 < n__2527__auto____10382) {
            if(cljs.core.truth_(pred.cljs$lang$arity$1 ? pred.cljs$lang$arity$1(cljs.core._nth.cljs$lang$arity$2(c__10379, i__10383)) : pred.call(null, cljs.core._nth.cljs$lang$arity$2(c__10379, i__10383)))) {
              cljs.core.chunk_append(b__10381, cljs.core._nth.cljs$lang$arity$2(c__10379, i__10383))
            }else {
            }
            var G__10386 = i__10383 + 1;
            i__10383 = G__10386;
            continue
          }else {
          }
          break
        }
        return cljs.core.chunk_cons(cljs.core.chunk(b__10381), filter(pred, cljs.core.chunk_rest(s__10378)))
      }else {
        var f__10384 = cljs.core.first(s__10378);
        var r__10385 = cljs.core.rest(s__10378);
        if(cljs.core.truth_(pred.cljs$lang$arity$1 ? pred.cljs$lang$arity$1(f__10384) : pred.call(null, f__10384))) {
          return cljs.core.cons(f__10384, filter(pred, r__10385))
        }else {
          return filter(pred, r__10385)
        }
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.remove = function remove(pred, coll) {
  return cljs.core.filter(cljs.core.complement(pred), coll)
};
cljs.core.tree_seq = function tree_seq(branch_QMARK_, children, root) {
  var walk__10389 = function walk(node) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons(node, cljs.core.truth_(branch_QMARK_.cljs$lang$arity$1 ? branch_QMARK_.cljs$lang$arity$1(node) : branch_QMARK_.call(null, node)) ? cljs.core.mapcat.cljs$lang$arity$2(walk, children.cljs$lang$arity$1 ? children.cljs$lang$arity$1(node) : children.call(null, node)) : null)
    }, null)
  };
  return walk__10389.cljs$lang$arity$1 ? walk__10389.cljs$lang$arity$1(root) : walk__10389.call(null, root)
};
cljs.core.flatten = function flatten(x) {
  return cljs.core.filter(function(p1__10387_SHARP_) {
    return!cljs.core.sequential_QMARK_(p1__10387_SHARP_)
  }, cljs.core.rest(cljs.core.tree_seq(cljs.core.sequential_QMARK_, cljs.core.seq, x)))
};
cljs.core.into = function into(to, from) {
  if(function() {
    var G__10393__10394 = to;
    if(G__10393__10394) {
      if(function() {
        var or__3824__auto____10395 = G__10393__10394.cljs$lang$protocol_mask$partition1$ & 1;
        if(or__3824__auto____10395) {
          return or__3824__auto____10395
        }else {
          return G__10393__10394.cljs$core$IEditableCollection$
        }
      }()) {
        return true
      }else {
        if(!G__10393__10394.cljs$lang$protocol_mask$partition1$) {
          return cljs.core.type_satisfies_(cljs.core.IEditableCollection, G__10393__10394)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_(cljs.core.IEditableCollection, G__10393__10394)
    }
  }()) {
    return cljs.core.persistent_BANG_(cljs.core.reduce.cljs$lang$arity$3(cljs.core._conj_BANG_, cljs.core.transient$(to), from))
  }else {
    return cljs.core.reduce.cljs$lang$arity$3(cljs.core._conj, to, from)
  }
};
cljs.core.mapv = function() {
  var mapv = null;
  var mapv__2 = function(f, coll) {
    return cljs.core.persistent_BANG_(cljs.core.reduce.cljs$lang$arity$3(function(v, o) {
      return cljs.core.conj_BANG_(v, f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(o) : f.call(null, o))
    }, cljs.core.transient$(cljs.core.PersistentVector.EMPTY), coll))
  };
  var mapv__3 = function(f, c1, c2) {
    return cljs.core.into(cljs.core.PersistentVector.EMPTY, cljs.core.map.cljs$lang$arity$3(f, c1, c2))
  };
  var mapv__4 = function(f, c1, c2, c3) {
    return cljs.core.into(cljs.core.PersistentVector.EMPTY, cljs.core.map.cljs$lang$arity$4(f, c1, c2, c3))
  };
  var mapv__5 = function() {
    var G__10396__delegate = function(f, c1, c2, c3, colls) {
      return cljs.core.into(cljs.core.PersistentVector.EMPTY, cljs.core.apply.cljs$lang$arity$variadic(cljs.core.map, f, c1, c2, c3, cljs.core.array_seq([colls], 0)))
    };
    var G__10396 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__10396__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__10396.cljs$lang$maxFixedArity = 4;
    G__10396.cljs$lang$applyTo = function(arglist__10397) {
      var f = cljs.core.first(arglist__10397);
      var c1 = cljs.core.first(cljs.core.next(arglist__10397));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10397)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10397))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10397))));
      return G__10396__delegate(f, c1, c2, c3, colls)
    };
    G__10396.cljs$lang$arity$variadic = G__10396__delegate;
    return G__10396
  }();
  mapv = function(f, c1, c2, c3, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return mapv__2.call(this, f, c1);
      case 3:
        return mapv__3.call(this, f, c1, c2);
      case 4:
        return mapv__4.call(this, f, c1, c2, c3);
      default:
        return mapv__5.cljs$lang$arity$variadic(f, c1, c2, c3, cljs.core.array_seq(arguments, 4))
    }
    throw"Invalid arity: " + arguments.length;
  };
  mapv.cljs$lang$maxFixedArity = 4;
  mapv.cljs$lang$applyTo = mapv__5.cljs$lang$applyTo;
  mapv.cljs$lang$arity$2 = mapv__2;
  mapv.cljs$lang$arity$3 = mapv__3;
  mapv.cljs$lang$arity$4 = mapv__4;
  mapv.cljs$lang$arity$variadic = mapv__5.cljs$lang$arity$variadic;
  return mapv
}();
cljs.core.filterv = function filterv(pred, coll) {
  return cljs.core.persistent_BANG_(cljs.core.reduce.cljs$lang$arity$3(function(v, o) {
    if(cljs.core.truth_(pred.cljs$lang$arity$1 ? pred.cljs$lang$arity$1(o) : pred.call(null, o))) {
      return cljs.core.conj_BANG_(v, o)
    }else {
      return v
    }
  }, cljs.core.transient$(cljs.core.PersistentVector.EMPTY), coll))
};
cljs.core.partition = function() {
  var partition = null;
  var partition__2 = function(n, coll) {
    return partition.cljs$lang$arity$3(n, n, coll)
  };
  var partition__3 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____10404 = cljs.core.seq(coll);
      if(temp__3974__auto____10404) {
        var s__10405 = temp__3974__auto____10404;
        var p__10406 = cljs.core.take(n, s__10405);
        if(n === cljs.core.count(p__10406)) {
          return cljs.core.cons(p__10406, partition.cljs$lang$arity$3(n, step, cljs.core.drop(step, s__10405)))
        }else {
          return null
        }
      }else {
        return null
      }
    }, null)
  };
  var partition__4 = function(n, step, pad, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____10407 = cljs.core.seq(coll);
      if(temp__3974__auto____10407) {
        var s__10408 = temp__3974__auto____10407;
        var p__10409 = cljs.core.take(n, s__10408);
        if(n === cljs.core.count(p__10409)) {
          return cljs.core.cons(p__10409, partition.cljs$lang$arity$4(n, step, pad, cljs.core.drop(step, s__10408)))
        }else {
          return cljs.core.list.cljs$lang$arity$1(cljs.core.take(n, cljs.core.concat.cljs$lang$arity$2(p__10409, pad)))
        }
      }else {
        return null
      }
    }, null)
  };
  partition = function(n, step, pad, coll) {
    switch(arguments.length) {
      case 2:
        return partition__2.call(this, n, step);
      case 3:
        return partition__3.call(this, n, step, pad);
      case 4:
        return partition__4.call(this, n, step, pad, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  partition.cljs$lang$arity$2 = partition__2;
  partition.cljs$lang$arity$3 = partition__3;
  partition.cljs$lang$arity$4 = partition__4;
  return partition
}();
cljs.core.get_in = function() {
  var get_in = null;
  var get_in__2 = function(m, ks) {
    return cljs.core.reduce.cljs$lang$arity$3(cljs.core.get, m, ks)
  };
  var get_in__3 = function(m, ks, not_found) {
    var sentinel__10414 = cljs.core.lookup_sentinel;
    var m__10415 = m;
    var ks__10416 = cljs.core.seq(ks);
    while(true) {
      if(ks__10416) {
        var m__10417 = cljs.core._lookup.cljs$lang$arity$3(m__10415, cljs.core.first(ks__10416), sentinel__10414);
        if(sentinel__10414 === m__10417) {
          return not_found
        }else {
          var G__10418 = sentinel__10414;
          var G__10419 = m__10417;
          var G__10420 = cljs.core.next(ks__10416);
          sentinel__10414 = G__10418;
          m__10415 = G__10419;
          ks__10416 = G__10420;
          continue
        }
      }else {
        return m__10415
      }
      break
    }
  };
  get_in = function(m, ks, not_found) {
    switch(arguments.length) {
      case 2:
        return get_in__2.call(this, m, ks);
      case 3:
        return get_in__3.call(this, m, ks, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  get_in.cljs$lang$arity$2 = get_in__2;
  get_in.cljs$lang$arity$3 = get_in__3;
  return get_in
}();
cljs.core.assoc_in = function assoc_in(m, p__10421, v) {
  var vec__10426__10427 = p__10421;
  var k__10428 = cljs.core.nth.cljs$lang$arity$3(vec__10426__10427, 0, null);
  var ks__10429 = cljs.core.nthnext(vec__10426__10427, 1);
  if(cljs.core.truth_(ks__10429)) {
    return cljs.core.assoc.cljs$lang$arity$3(m, k__10428, assoc_in(cljs.core._lookup.cljs$lang$arity$3(m, k__10428, null), ks__10429, v))
  }else {
    return cljs.core.assoc.cljs$lang$arity$3(m, k__10428, v)
  }
};
cljs.core.update_in = function() {
  var update_in__delegate = function(m, p__10430, f, args) {
    var vec__10435__10436 = p__10430;
    var k__10437 = cljs.core.nth.cljs$lang$arity$3(vec__10435__10436, 0, null);
    var ks__10438 = cljs.core.nthnext(vec__10435__10436, 1);
    if(cljs.core.truth_(ks__10438)) {
      return cljs.core.assoc.cljs$lang$arity$3(m, k__10437, cljs.core.apply.cljs$lang$arity$5(update_in, cljs.core._lookup.cljs$lang$arity$3(m, k__10437, null), ks__10438, f, args))
    }else {
      return cljs.core.assoc.cljs$lang$arity$3(m, k__10437, cljs.core.apply.cljs$lang$arity$3(f, cljs.core._lookup.cljs$lang$arity$3(m, k__10437, null), args))
    }
  };
  var update_in = function(m, p__10430, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return update_in__delegate.call(this, m, p__10430, f, args)
  };
  update_in.cljs$lang$maxFixedArity = 3;
  update_in.cljs$lang$applyTo = function(arglist__10439) {
    var m = cljs.core.first(arglist__10439);
    var p__10430 = cljs.core.first(cljs.core.next(arglist__10439));
    var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10439)));
    var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10439)));
    return update_in__delegate(m, p__10430, f, args)
  };
  update_in.cljs$lang$arity$variadic = update_in__delegate;
  return update_in
}();
cljs.core.Vector = function(meta, array, __hash) {
  this.meta = meta;
  this.array = array;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32400159
};
cljs.core.Vector.cljs$lang$type = true;
cljs.core.Vector.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/Vector")
};
cljs.core.Vector.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__10442 = this;
  var h__2192__auto____10443 = this__10442.__hash;
  if(!(h__2192__auto____10443 == null)) {
    return h__2192__auto____10443
  }else {
    var h__2192__auto____10444 = cljs.core.hash_coll(coll);
    this__10442.__hash = h__2192__auto____10444;
    return h__2192__auto____10444
  }
};
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10445 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10446 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__10447 = this;
  var new_array__10448 = this__10447.array.slice();
  new_array__10448[k] = v;
  return new cljs.core.Vector(this__10447.meta, new_array__10448, null)
};
cljs.core.Vector.prototype.call = function() {
  var G__10479 = null;
  var G__10479__2 = function(this_sym10449, k) {
    var this__10451 = this;
    var this_sym10449__10452 = this;
    var coll__10453 = this_sym10449__10452;
    return coll__10453.cljs$core$ILookup$_lookup$arity$2(coll__10453, k)
  };
  var G__10479__3 = function(this_sym10450, k, not_found) {
    var this__10451 = this;
    var this_sym10450__10454 = this;
    var coll__10455 = this_sym10450__10454;
    return coll__10455.cljs$core$ILookup$_lookup$arity$3(coll__10455, k, not_found)
  };
  G__10479 = function(this_sym10450, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10479__2.call(this, this_sym10450, k);
      case 3:
        return G__10479__3.call(this, this_sym10450, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10479
}();
cljs.core.Vector.prototype.apply = function(this_sym10440, args10441) {
  var this__10456 = this;
  return this_sym10440.call.apply(this_sym10440, [this_sym10440].concat(args10441.slice()))
};
cljs.core.Vector.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__10457 = this;
  var new_array__10458 = this__10457.array.slice();
  new_array__10458.push(o);
  return new cljs.core.Vector(this__10457.meta, new_array__10458, null)
};
cljs.core.Vector.prototype.toString = function() {
  var this__10459 = this;
  var this__10460 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__10460], 0))
};
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce$arity$2 = function(v, f) {
  var this__10461 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$2(this__10461.array, f)
};
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce$arity$3 = function(v, f, start) {
  var this__10462 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$3(this__10462.array, f, start)
};
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10463 = this;
  if(this__10463.array.length > 0) {
    var vector_seq__10464 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(i < this__10463.array.length) {
          return cljs.core.cons(this__10463.array[i], vector_seq(i + 1))
        }else {
          return null
        }
      }, null)
    };
    return vector_seq__10464.cljs$lang$arity$1 ? vector_seq__10464.cljs$lang$arity$1(0) : vector_seq__10464.call(null, 0)
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10465 = this;
  return this__10465.array.length
};
cljs.core.Vector.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__10466 = this;
  var count__10467 = this__10466.array.length;
  if(count__10467 > 0) {
    return this__10466.array[count__10467 - 1]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__10468 = this;
  if(this__10468.array.length > 0) {
    var new_array__10469 = this__10468.array.slice();
    new_array__10469.pop();
    return new cljs.core.Vector(this__10468.meta, new_array__10469, null)
  }else {
    throw new Error("Can't pop empty vector");
  }
};
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(coll, n, val) {
  var this__10470 = this;
  return coll.cljs$core$IAssociative$_assoc$arity$3(coll, n, val)
};
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10471 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10472 = this;
  return new cljs.core.Vector(meta, this__10472.array, this__10472.__hash)
};
cljs.core.Vector.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10473 = this;
  return this__10473.meta
};
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__10474 = this;
  if(function() {
    var and__3822__auto____10475 = 0 <= n;
    if(and__3822__auto____10475) {
      return n < this__10474.array.length
    }else {
      return and__3822__auto____10475
    }
  }()) {
    return this__10474.array[n]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__10476 = this;
  if(function() {
    var and__3822__auto____10477 = 0 <= n;
    if(and__3822__auto____10477) {
      return n < this__10476.array.length
    }else {
      return and__3822__auto____10477
    }
  }()) {
    return this__10476.array[n]
  }else {
    return not_found
  }
};
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10478 = this;
  return cljs.core.with_meta(cljs.core.Vector.EMPTY, this__10478.meta)
};
cljs.core.Vector;
cljs.core.Vector.EMPTY = new cljs.core.Vector(null, [], 0);
cljs.core.Vector.fromArray = function(xs) {
  return new cljs.core.Vector(null, xs, null)
};
cljs.core.VectorNode = function(edit, arr) {
  this.edit = edit;
  this.arr = arr
};
cljs.core.VectorNode.cljs$lang$type = true;
cljs.core.VectorNode.cljs$lang$ctorPrSeq = function(this__2310__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/VectorNode")
};
cljs.core.VectorNode;
cljs.core.pv_fresh_node = function pv_fresh_node(edit) {
  return new cljs.core.VectorNode(edit, cljs.core.make_array.cljs$lang$arity$1(32))
};
cljs.core.pv_aget = function pv_aget(node, idx) {
  return node.arr[idx]
};
cljs.core.pv_aset = function pv_aset(node, idx, val) {
  return node.arr[idx] = val
};
cljs.core.pv_clone_node = function pv_clone_node(node) {
  return new cljs.core.VectorNode(node.edit, node.arr.slice())
};
cljs.core.tail_off = function tail_off(pv) {
  var cnt__10481 = pv.cnt;
  if(cnt__10481 < 32) {
    return 0
  }else {
    return cnt__10481 - 1 >>> 5 << 5
  }
};
cljs.core.new_path = function new_path(edit, level, node) {
  var ll__10487 = level;
  var ret__10488 = node;
  while(true) {
    if(ll__10487 === 0) {
      return ret__10488
    }else {
      var embed__10489 = ret__10488;
      var r__10490 = cljs.core.pv_fresh_node(edit);
      var ___10491 = cljs.core.pv_aset(r__10490, 0, embed__10489);
      var G__10492 = ll__10487 - 5;
      var G__10493 = r__10490;
      ll__10487 = G__10492;
      ret__10488 = G__10493;
      continue
    }
    break
  }
};
cljs.core.push_tail = function push_tail(pv, level, parent, tailnode) {
  var ret__10499 = cljs.core.pv_clone_node(parent);
  var subidx__10500 = pv.cnt - 1 >>> level & 31;
  if(5 === level) {
    cljs.core.pv_aset(ret__10499, subidx__10500, tailnode);
    return ret__10499
  }else {
    var child__10501 = cljs.core.pv_aget(parent, subidx__10500);
    if(!(child__10501 == null)) {
      var node_to_insert__10502 = push_tail(pv, level - 5, child__10501, tailnode);
      cljs.core.pv_aset(ret__10499, subidx__10500, node_to_insert__10502);
      return ret__10499
    }else {
      var node_to_insert__10503 = cljs.core.new_path(null, level - 5, tailnode);
      cljs.core.pv_aset(ret__10499, subidx__10500, node_to_insert__10503);
      return ret__10499
    }
  }
};
cljs.core.array_for = function array_for(pv, i) {
  if(function() {
    var and__3822__auto____10507 = 0 <= i;
    if(and__3822__auto____10507) {
      return i < pv.cnt
    }else {
      return and__3822__auto____10507
    }
  }()) {
    if(i >= cljs.core.tail_off(pv)) {
      return pv.tail
    }else {
      var node__10508 = pv.root;
      var level__10509 = pv.shift;
      while(true) {
        if(level__10509 > 0) {
          var G__10510 = cljs.core.pv_aget(node__10508, i >>> level__10509 & 31);
          var G__10511 = level__10509 - 5;
          node__10508 = G__10510;
          level__10509 = G__10511;
          continue
        }else {
          return node__10508.arr
        }
        break
      }
    }
  }else {
    throw new Error([cljs.core.str("No item "), cljs.core.str(i), cljs.core.str(" in vector of length "), cljs.core.str(pv.cnt)].join(""));
  }
};
cljs.core.do_assoc = function do_assoc(pv, level, node, i, val) {
  var ret__10514 = cljs.core.pv_clone_node(node);
  if(level === 0) {
    cljs.core.pv_aset(ret__10514, i & 31, val);
    return ret__10514
  }else {
    var subidx__10515 = i >>> level & 31;
    cljs.core.pv_aset(ret__10514, subidx__10515, do_assoc(pv, level - 5, cljs.core.pv_aget(node, subidx__10515), i, val));
    return ret__10514
  }
};
cljs.core.pop_tail = function pop_tail(pv, level, node) {
  var subidx__10521 = pv.cnt - 2 >>> level & 31;
  if(level > 5) {
    var new_child__10522 = pop_tail(pv, level - 5, cljs.core.pv_aget(node, subidx__10521));
    if(function() {
      var and__3822__auto____10523 = new_child__10522 == null;
      if(and__3822__auto____10523) {
        return subidx__10521 === 0
      }else {
        return and__3822__auto____10523
      }
    }()) {
      return null
    }else {
      var ret__10524 = cljs.core.pv_clone_node(node);
      cljs.core.pv_aset(ret__10524, subidx__10521, new_child__10522);
      return ret__10524
    }
  }else {
    if(subidx__10521 === 0) {
      return null
    }else {
      if("\ufdd0'else") {
        var ret__10525 = cljs.core.pv_clone_node(node);
        cljs.core.pv_aset(ret__10525, subidx__10521, null);
        return ret__10525
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentVector = function(meta, cnt, shift, root, tail, __hash) {
  this.meta = meta;
  this.cnt = cnt;
  this.shift = shift;
  this.root = root;
  this.tail = tail;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 1;
  this.cljs$lang$protocol_mask$partition0$ = 167668511
};
cljs.core.PersistentVector.cljs$lang$type = true;
cljs.core.PersistentVector.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/PersistentVector")
};
cljs.core.PersistentVector.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__10528 = this;
  return new cljs.core.TransientVector(this__10528.cnt, this__10528.shift, cljs.core.tv_editable_root(this__10528.root), cljs.core.tv_editable_tail(this__10528.tail))
};
cljs.core.PersistentVector.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__10529 = this;
  var h__2192__auto____10530 = this__10529.__hash;
  if(!(h__2192__auto____10530 == null)) {
    return h__2192__auto____10530
  }else {
    var h__2192__auto____10531 = cljs.core.hash_coll(coll);
    this__10529.__hash = h__2192__auto____10531;
    return h__2192__auto____10531
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10532 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10533 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__10534 = this;
  if(function() {
    var and__3822__auto____10535 = 0 <= k;
    if(and__3822__auto____10535) {
      return k < this__10534.cnt
    }else {
      return and__3822__auto____10535
    }
  }()) {
    if(cljs.core.tail_off(coll) <= k) {
      var new_tail__10536 = this__10534.tail.slice();
      new_tail__10536[k & 31] = v;
      return new cljs.core.PersistentVector(this__10534.meta, this__10534.cnt, this__10534.shift, this__10534.root, new_tail__10536, null)
    }else {
      return new cljs.core.PersistentVector(this__10534.meta, this__10534.cnt, this__10534.shift, cljs.core.do_assoc(coll, this__10534.shift, this__10534.root, k, v), this__10534.tail, null)
    }
  }else {
    if(k === this__10534.cnt) {
      return coll.cljs$core$ICollection$_conj$arity$2(coll, v)
    }else {
      if("\ufdd0'else") {
        throw new Error([cljs.core.str("Index "), cljs.core.str(k), cljs.core.str(" out of bounds  [0,"), cljs.core.str(this__10534.cnt), cljs.core.str("]")].join(""));
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentVector.prototype.call = function() {
  var G__10584 = null;
  var G__10584__2 = function(this_sym10537, k) {
    var this__10539 = this;
    var this_sym10537__10540 = this;
    var coll__10541 = this_sym10537__10540;
    return coll__10541.cljs$core$ILookup$_lookup$arity$2(coll__10541, k)
  };
  var G__10584__3 = function(this_sym10538, k, not_found) {
    var this__10539 = this;
    var this_sym10538__10542 = this;
    var coll__10543 = this_sym10538__10542;
    return coll__10543.cljs$core$ILookup$_lookup$arity$3(coll__10543, k, not_found)
  };
  G__10584 = function(this_sym10538, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10584__2.call(this, this_sym10538, k);
      case 3:
        return G__10584__3.call(this, this_sym10538, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10584
}();
cljs.core.PersistentVector.prototype.apply = function(this_sym10526, args10527) {
  var this__10544 = this;
  return this_sym10526.call.apply(this_sym10526, [this_sym10526].concat(args10527.slice()))
};
cljs.core.PersistentVector.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(v, f, init) {
  var this__10545 = this;
  var step_init__10546 = [0, init];
  var i__10547 = 0;
  while(true) {
    if(i__10547 < this__10545.cnt) {
      var arr__10548 = cljs.core.array_for(v, i__10547);
      var len__10549 = arr__10548.length;
      var init__10553 = function() {
        var j__10550 = 0;
        var init__10551 = step_init__10546[1];
        while(true) {
          if(j__10550 < len__10549) {
            var init__10552 = f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(init__10551, j__10550 + i__10547, arr__10548[j__10550]) : f.call(null, init__10551, j__10550 + i__10547, arr__10548[j__10550]);
            if(cljs.core.reduced_QMARK_(init__10552)) {
              return init__10552
            }else {
              var G__10585 = j__10550 + 1;
              var G__10586 = init__10552;
              j__10550 = G__10585;
              init__10551 = G__10586;
              continue
            }
          }else {
            step_init__10546[0] = len__10549;
            step_init__10546[1] = init__10551;
            return init__10551
          }
          break
        }
      }();
      if(cljs.core.reduced_QMARK_(init__10553)) {
        return cljs.core.deref(init__10553)
      }else {
        var G__10587 = i__10547 + step_init__10546[0];
        i__10547 = G__10587;
        continue
      }
    }else {
      return step_init__10546[1]
    }
    break
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__10554 = this;
  if(this__10554.cnt - cljs.core.tail_off(coll) < 32) {
    var new_tail__10555 = this__10554.tail.slice();
    new_tail__10555.push(o);
    return new cljs.core.PersistentVector(this__10554.meta, this__10554.cnt + 1, this__10554.shift, this__10554.root, new_tail__10555, null)
  }else {
    var root_overflow_QMARK___10556 = this__10554.cnt >>> 5 > 1 << this__10554.shift;
    var new_shift__10557 = root_overflow_QMARK___10556 ? this__10554.shift + 5 : this__10554.shift;
    var new_root__10559 = root_overflow_QMARK___10556 ? function() {
      var n_r__10558 = cljs.core.pv_fresh_node(null);
      cljs.core.pv_aset(n_r__10558, 0, this__10554.root);
      cljs.core.pv_aset(n_r__10558, 1, cljs.core.new_path(null, this__10554.shift, new cljs.core.VectorNode(null, this__10554.tail)));
      return n_r__10558
    }() : cljs.core.push_tail(coll, this__10554.shift, this__10554.root, new cljs.core.VectorNode(null, this__10554.tail));
    return new cljs.core.PersistentVector(this__10554.meta, this__10554.cnt + 1, new_shift__10557, new_root__10559, [o], null)
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__10560 = this;
  if(this__10560.cnt > 0) {
    return new cljs.core.RSeq(coll, this__10560.cnt - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IMapEntry$_key$arity$1 = function(coll) {
  var this__10561 = this;
  return coll.cljs$core$IIndexed$_nth$arity$2(coll, 0)
};
cljs.core.PersistentVector.prototype.cljs$core$IMapEntry$_val$arity$1 = function(coll) {
  var this__10562 = this;
  return coll.cljs$core$IIndexed$_nth$arity$2(coll, 1)
};
cljs.core.PersistentVector.prototype.toString = function() {
  var this__10563 = this;
  var this__10564 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__10564], 0))
};
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce$arity$2 = function(v, f) {
  var this__10565 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$2(v, f)
};
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce$arity$3 = function(v, f, start) {
  var this__10566 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$3(v, f, start)
};
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10567 = this;
  if(this__10567.cnt === 0) {
    return null
  }else {
    return cljs.core.chunked_seq.cljs$lang$arity$3(coll, 0, 0)
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10568 = this;
  return this__10568.cnt
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__10569 = this;
  if(this__10569.cnt > 0) {
    return coll.cljs$core$IIndexed$_nth$arity$2(coll, this__10569.cnt - 1)
  }else {
    return null
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__10570 = this;
  if(this__10570.cnt === 0) {
    throw new Error("Can't pop empty vector");
  }else {
    if(1 === this__10570.cnt) {
      return cljs.core._with_meta(cljs.core.PersistentVector.EMPTY, this__10570.meta)
    }else {
      if(1 < this__10570.cnt - cljs.core.tail_off(coll)) {
        return new cljs.core.PersistentVector(this__10570.meta, this__10570.cnt - 1, this__10570.shift, this__10570.root, this__10570.tail.slice(0, -1), null)
      }else {
        if("\ufdd0'else") {
          var new_tail__10571 = cljs.core.array_for(coll, this__10570.cnt - 2);
          var nr__10572 = cljs.core.pop_tail(coll, this__10570.shift, this__10570.root);
          var new_root__10573 = nr__10572 == null ? cljs.core.PersistentVector.EMPTY_NODE : nr__10572;
          var cnt_1__10574 = this__10570.cnt - 1;
          if(function() {
            var and__3822__auto____10575 = 5 < this__10570.shift;
            if(and__3822__auto____10575) {
              return cljs.core.pv_aget(new_root__10573, 1) == null
            }else {
              return and__3822__auto____10575
            }
          }()) {
            return new cljs.core.PersistentVector(this__10570.meta, cnt_1__10574, this__10570.shift - 5, cljs.core.pv_aget(new_root__10573, 0), new_tail__10571, null)
          }else {
            return new cljs.core.PersistentVector(this__10570.meta, cnt_1__10574, this__10570.shift, new_root__10573, new_tail__10571, null)
          }
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(coll, n, val) {
  var this__10576 = this;
  return coll.cljs$core$IAssociative$_assoc$arity$3(coll, n, val)
};
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10577 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10578 = this;
  return new cljs.core.PersistentVector(meta, this__10578.cnt, this__10578.shift, this__10578.root, this__10578.tail, this__10578.__hash)
};
cljs.core.PersistentVector.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10579 = this;
  return this__10579.meta
};
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__10580 = this;
  return cljs.core.array_for(coll, n)[n & 31]
};
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__10581 = this;
  if(function() {
    var and__3822__auto____10582 = 0 <= n;
    if(and__3822__auto____10582) {
      return n < this__10581.cnt
    }else {
      return and__3822__auto____10582
    }
  }()) {
    return coll.cljs$core$IIndexed$_nth$arity$2(coll, n)
  }else {
    return not_found
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10583 = this;
  return cljs.core.with_meta(cljs.core.PersistentVector.EMPTY, this__10583.meta)
};
cljs.core.PersistentVector;
cljs.core.PersistentVector.EMPTY_NODE = cljs.core.pv_fresh_node(null);
cljs.core.PersistentVector.EMPTY = new cljs.core.PersistentVector(null, 0, 5, cljs.core.PersistentVector.EMPTY_NODE, [], 0);
cljs.core.PersistentVector.fromArray = function(xs, no_clone) {
  var l__10588 = xs.length;
  var xs__10589 = no_clone === true ? xs : xs.slice();
  if(l__10588 < 32) {
    return new cljs.core.PersistentVector(null, l__10588, 5, cljs.core.PersistentVector.EMPTY_NODE, xs__10589, null)
  }else {
    var node__10590 = xs__10589.slice(0, 32);
    var v__10591 = new cljs.core.PersistentVector(null, 32, 5, cljs.core.PersistentVector.EMPTY_NODE, node__10590, null);
    var i__10592 = 32;
    var out__10593 = cljs.core._as_transient(v__10591);
    while(true) {
      if(i__10592 < l__10588) {
        var G__10594 = i__10592 + 1;
        var G__10595 = cljs.core.conj_BANG_(out__10593, xs__10589[i__10592]);
        i__10592 = G__10594;
        out__10593 = G__10595;
        continue
      }else {
        return cljs.core.persistent_BANG_(out__10593)
      }
      break
    }
  }
};
cljs.core.vec = function vec(coll) {
  return cljs.core._persistent_BANG_(cljs.core.reduce.cljs$lang$arity$3(cljs.core._conj_BANG_, cljs.core._as_transient(cljs.core.PersistentVector.EMPTY), coll))
};
cljs.core.vector = function() {
  var vector__delegate = function(args) {
    return cljs.core.vec(args)
  };
  var vector = function(var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return vector__delegate.call(this, args)
  };
  vector.cljs$lang$maxFixedArity = 0;
  vector.cljs$lang$applyTo = function(arglist__10596) {
    var args = cljs.core.seq(arglist__10596);
    return vector__delegate(args)
  };
  vector.cljs$lang$arity$variadic = vector__delegate;
  return vector
}();
cljs.core.ChunkedSeq = function(vec, node, i, off, meta) {
  this.vec = vec;
  this.node = node;
  this.i = i;
  this.off = off;
  this.meta = meta;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 27525356
};
cljs.core.ChunkedSeq.cljs$lang$type = true;
cljs.core.ChunkedSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/ChunkedSeq")
};
cljs.core.ChunkedSeq.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__10597 = this;
  if(this__10597.off + 1 < this__10597.node.length) {
    var s__10598 = cljs.core.chunked_seq.cljs$lang$arity$4(this__10597.vec, this__10597.node, this__10597.i, this__10597.off + 1);
    if(s__10598 == null) {
      return null
    }else {
      return s__10598
    }
  }else {
    return coll.cljs$core$IChunkedNext$_chunked_next$arity$1(coll)
  }
};
cljs.core.ChunkedSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__10599 = this;
  return cljs.core.cons(o, coll)
};
cljs.core.ChunkedSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10600 = this;
  return coll
};
cljs.core.ChunkedSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__10601 = this;
  return this__10601.node[this__10601.off]
};
cljs.core.ChunkedSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__10602 = this;
  if(this__10602.off + 1 < this__10602.node.length) {
    var s__10603 = cljs.core.chunked_seq.cljs$lang$arity$4(this__10602.vec, this__10602.node, this__10602.i, this__10602.off + 1);
    if(s__10603 == null) {
      return cljs.core.List.EMPTY
    }else {
      return s__10603
    }
  }else {
    return coll.cljs$core$IChunkedSeq$_chunked_rest$arity$1(coll)
  }
};
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedNext$ = true;
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedNext$_chunked_next$arity$1 = function(coll) {
  var this__10604 = this;
  var l__10605 = this__10604.node.length;
  var s__10606 = this__10604.i + l__10605 < cljs.core._count(this__10604.vec) ? cljs.core.chunked_seq.cljs$lang$arity$3(this__10604.vec, this__10604.i + l__10605, 0) : null;
  if(s__10606 == null) {
    return null
  }else {
    return s__10606
  }
};
cljs.core.ChunkedSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10607 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, m) {
  var this__10608 = this;
  return cljs.core.chunked_seq.cljs$lang$arity$5(this__10608.vec, this__10608.node, this__10608.i, this__10608.off, m)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IWithMeta$_meta$arity$1 = function(coll) {
  var this__10609 = this;
  return this__10609.meta
};
cljs.core.ChunkedSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10610 = this;
  return cljs.core.with_meta(cljs.core.PersistentVector.EMPTY, this__10610.meta)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedSeq$ = true;
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedSeq$_chunked_first$arity$1 = function(coll) {
  var this__10611 = this;
  return cljs.core.array_chunk.cljs$lang$arity$2(this__10611.node, this__10611.off)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedSeq$_chunked_rest$arity$1 = function(coll) {
  var this__10612 = this;
  var l__10613 = this__10612.node.length;
  var s__10614 = this__10612.i + l__10613 < cljs.core._count(this__10612.vec) ? cljs.core.chunked_seq.cljs$lang$arity$3(this__10612.vec, this__10612.i + l__10613, 0) : null;
  if(s__10614 == null) {
    return cljs.core.List.EMPTY
  }else {
    return s__10614
  }
};
cljs.core.ChunkedSeq;
cljs.core.chunked_seq = function() {
  var chunked_seq = null;
  var chunked_seq__3 = function(vec, i, off) {
    return chunked_seq.cljs$lang$arity$5(vec, cljs.core.array_for(vec, i), i, off, null)
  };
  var chunked_seq__4 = function(vec, node, i, off) {
    return chunked_seq.cljs$lang$arity$5(vec, node, i, off, null)
  };
  var chunked_seq__5 = function(vec, node, i, off, meta) {
    return new cljs.core.ChunkedSeq(vec, node, i, off, meta)
  };
  chunked_seq = function(vec, node, i, off, meta) {
    switch(arguments.length) {
      case 3:
        return chunked_seq__3.call(this, vec, node, i);
      case 4:
        return chunked_seq__4.call(this, vec, node, i, off);
      case 5:
        return chunked_seq__5.call(this, vec, node, i, off, meta)
    }
    throw"Invalid arity: " + arguments.length;
  };
  chunked_seq.cljs$lang$arity$3 = chunked_seq__3;
  chunked_seq.cljs$lang$arity$4 = chunked_seq__4;
  chunked_seq.cljs$lang$arity$5 = chunked_seq__5;
  return chunked_seq
}();
cljs.core.Subvec = function(meta, v, start, end, __hash) {
  this.meta = meta;
  this.v = v;
  this.start = start;
  this.end = end;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32400159
};
cljs.core.Subvec.cljs$lang$type = true;
cljs.core.Subvec.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/Subvec")
};
cljs.core.Subvec.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__10617 = this;
  var h__2192__auto____10618 = this__10617.__hash;
  if(!(h__2192__auto____10618 == null)) {
    return h__2192__auto____10618
  }else {
    var h__2192__auto____10619 = cljs.core.hash_coll(coll);
    this__10617.__hash = h__2192__auto____10619;
    return h__2192__auto____10619
  }
};
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10620 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10621 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, key, val) {
  var this__10622 = this;
  var v_pos__10623 = this__10622.start + key;
  return new cljs.core.Subvec(this__10622.meta, cljs.core._assoc(this__10622.v, v_pos__10623, val), this__10622.start, this__10622.end > v_pos__10623 + 1 ? this__10622.end : v_pos__10623 + 1, null)
};
cljs.core.Subvec.prototype.call = function() {
  var G__10649 = null;
  var G__10649__2 = function(this_sym10624, k) {
    var this__10626 = this;
    var this_sym10624__10627 = this;
    var coll__10628 = this_sym10624__10627;
    return coll__10628.cljs$core$ILookup$_lookup$arity$2(coll__10628, k)
  };
  var G__10649__3 = function(this_sym10625, k, not_found) {
    var this__10626 = this;
    var this_sym10625__10629 = this;
    var coll__10630 = this_sym10625__10629;
    return coll__10630.cljs$core$ILookup$_lookup$arity$3(coll__10630, k, not_found)
  };
  G__10649 = function(this_sym10625, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10649__2.call(this, this_sym10625, k);
      case 3:
        return G__10649__3.call(this, this_sym10625, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10649
}();
cljs.core.Subvec.prototype.apply = function(this_sym10615, args10616) {
  var this__10631 = this;
  return this_sym10615.call.apply(this_sym10615, [this_sym10615].concat(args10616.slice()))
};
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__10632 = this;
  return new cljs.core.Subvec(this__10632.meta, cljs.core._assoc_n(this__10632.v, this__10632.end, o), this__10632.start, this__10632.end + 1, null)
};
cljs.core.Subvec.prototype.toString = function() {
  var this__10633 = this;
  var this__10634 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__10634], 0))
};
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce$arity$2 = function(coll, f) {
  var this__10635 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$2(coll, f)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce$arity$3 = function(coll, f, start) {
  var this__10636 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$3(coll, f, start)
};
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10637 = this;
  var subvec_seq__10638 = function subvec_seq(i) {
    if(i === this__10637.end) {
      return null
    }else {
      return cljs.core.cons(cljs.core._nth.cljs$lang$arity$2(this__10637.v, i), new cljs.core.LazySeq(null, false, function() {
        return subvec_seq(i + 1)
      }, null))
    }
  };
  return subvec_seq__10638.cljs$lang$arity$1 ? subvec_seq__10638.cljs$lang$arity$1(this__10637.start) : subvec_seq__10638.call(null, this__10637.start)
};
cljs.core.Subvec.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10639 = this;
  return this__10639.end - this__10639.start
};
cljs.core.Subvec.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__10640 = this;
  return cljs.core._nth.cljs$lang$arity$2(this__10640.v, this__10640.end - 1)
};
cljs.core.Subvec.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__10641 = this;
  if(this__10641.start === this__10641.end) {
    throw new Error("Can't pop empty vector");
  }else {
    return new cljs.core.Subvec(this__10641.meta, this__10641.v, this__10641.start, this__10641.end - 1, null)
  }
};
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(coll, n, val) {
  var this__10642 = this;
  return coll.cljs$core$IAssociative$_assoc$arity$3(coll, n, val)
};
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10643 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10644 = this;
  return new cljs.core.Subvec(meta, this__10644.v, this__10644.start, this__10644.end, this__10644.__hash)
};
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10645 = this;
  return this__10645.meta
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__10646 = this;
  return cljs.core._nth.cljs$lang$arity$2(this__10646.v, this__10646.start + n)
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__10647 = this;
  return cljs.core._nth.cljs$lang$arity$3(this__10647.v, this__10647.start + n, not_found)
};
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10648 = this;
  return cljs.core.with_meta(cljs.core.Vector.EMPTY, this__10648.meta)
};
cljs.core.Subvec;
cljs.core.subvec = function() {
  var subvec = null;
  var subvec__2 = function(v, start) {
    return subvec.cljs$lang$arity$3(v, start, cljs.core.count(v))
  };
  var subvec__3 = function(v, start, end) {
    return new cljs.core.Subvec(null, v, start, end, null)
  };
  subvec = function(v, start, end) {
    switch(arguments.length) {
      case 2:
        return subvec__2.call(this, v, start);
      case 3:
        return subvec__3.call(this, v, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  subvec.cljs$lang$arity$2 = subvec__2;
  subvec.cljs$lang$arity$3 = subvec__3;
  return subvec
}();
cljs.core.tv_ensure_editable = function tv_ensure_editable(edit, node) {
  if(edit === node.edit) {
    return node
  }else {
    return new cljs.core.VectorNode(edit, node.arr.slice())
  }
};
cljs.core.tv_editable_root = function tv_editable_root(node) {
  return new cljs.core.VectorNode({}, node.arr.slice())
};
cljs.core.tv_editable_tail = function tv_editable_tail(tl) {
  var ret__10651 = cljs.core.make_array.cljs$lang$arity$1(32);
  cljs.core.array_copy(tl, 0, ret__10651, 0, tl.length);
  return ret__10651
};
cljs.core.tv_push_tail = function tv_push_tail(tv, level, parent, tail_node) {
  var ret__10655 = cljs.core.tv_ensure_editable(tv.root.edit, parent);
  var subidx__10656 = tv.cnt - 1 >>> level & 31;
  cljs.core.pv_aset(ret__10655, subidx__10656, level === 5 ? tail_node : function() {
    var child__10657 = cljs.core.pv_aget(ret__10655, subidx__10656);
    if(!(child__10657 == null)) {
      return tv_push_tail(tv, level - 5, child__10657, tail_node)
    }else {
      return cljs.core.new_path(tv.root.edit, level - 5, tail_node)
    }
  }());
  return ret__10655
};
cljs.core.tv_pop_tail = function tv_pop_tail(tv, level, node) {
  var node__10662 = cljs.core.tv_ensure_editable(tv.root.edit, node);
  var subidx__10663 = tv.cnt - 2 >>> level & 31;
  if(level > 5) {
    var new_child__10664 = tv_pop_tail(tv, level - 5, cljs.core.pv_aget(node__10662, subidx__10663));
    if(function() {
      var and__3822__auto____10665 = new_child__10664 == null;
      if(and__3822__auto____10665) {
        return subidx__10663 === 0
      }else {
        return and__3822__auto____10665
      }
    }()) {
      return null
    }else {
      cljs.core.pv_aset(node__10662, subidx__10663, new_child__10664);
      return node__10662
    }
  }else {
    if(subidx__10663 === 0) {
      return null
    }else {
      if("\ufdd0'else") {
        cljs.core.pv_aset(node__10662, subidx__10663, null);
        return node__10662
      }else {
        return null
      }
    }
  }
};
cljs.core.editable_array_for = function editable_array_for(tv, i) {
  if(function() {
    var and__3822__auto____10670 = 0 <= i;
    if(and__3822__auto____10670) {
      return i < tv.cnt
    }else {
      return and__3822__auto____10670
    }
  }()) {
    if(i >= cljs.core.tail_off(tv)) {
      return tv.tail
    }else {
      var root__10671 = tv.root;
      var node__10672 = root__10671;
      var level__10673 = tv.shift;
      while(true) {
        if(level__10673 > 0) {
          var G__10674 = cljs.core.tv_ensure_editable(root__10671.edit, cljs.core.pv_aget(node__10672, i >>> level__10673 & 31));
          var G__10675 = level__10673 - 5;
          node__10672 = G__10674;
          level__10673 = G__10675;
          continue
        }else {
          return node__10672.arr
        }
        break
      }
    }
  }else {
    throw new Error([cljs.core.str("No item "), cljs.core.str(i), cljs.core.str(" in transient vector of length "), cljs.core.str(tv.cnt)].join(""));
  }
};
cljs.core.TransientVector = function(cnt, shift, root, tail) {
  this.cnt = cnt;
  this.shift = shift;
  this.root = root;
  this.tail = tail;
  this.cljs$lang$protocol_mask$partition0$ = 275;
  this.cljs$lang$protocol_mask$partition1$ = 22
};
cljs.core.TransientVector.cljs$lang$type = true;
cljs.core.TransientVector.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/TransientVector")
};
cljs.core.TransientVector.prototype.call = function() {
  var G__10715 = null;
  var G__10715__2 = function(this_sym10678, k) {
    var this__10680 = this;
    var this_sym10678__10681 = this;
    var coll__10682 = this_sym10678__10681;
    return coll__10682.cljs$core$ILookup$_lookup$arity$2(coll__10682, k)
  };
  var G__10715__3 = function(this_sym10679, k, not_found) {
    var this__10680 = this;
    var this_sym10679__10683 = this;
    var coll__10684 = this_sym10679__10683;
    return coll__10684.cljs$core$ILookup$_lookup$arity$3(coll__10684, k, not_found)
  };
  G__10715 = function(this_sym10679, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10715__2.call(this, this_sym10679, k);
      case 3:
        return G__10715__3.call(this, this_sym10679, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10715
}();
cljs.core.TransientVector.prototype.apply = function(this_sym10676, args10677) {
  var this__10685 = this;
  return this_sym10676.call.apply(this_sym10676, [this_sym10676].concat(args10677.slice()))
};
cljs.core.TransientVector.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10686 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.TransientVector.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10687 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.TransientVector.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__10688 = this;
  if(this__10688.root.edit) {
    return cljs.core.array_for(coll, n)[n & 31]
  }else {
    throw new Error("nth after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__10689 = this;
  if(function() {
    var and__3822__auto____10690 = 0 <= n;
    if(and__3822__auto____10690) {
      return n < this__10689.cnt
    }else {
      return and__3822__auto____10690
    }
  }()) {
    return coll.cljs$core$IIndexed$_nth$arity$2(coll, n)
  }else {
    return not_found
  }
};
cljs.core.TransientVector.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10691 = this;
  if(this__10691.root.edit) {
    return this__10691.cnt
  }else {
    throw new Error("count after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3 = function(tcoll, n, val) {
  var this__10692 = this;
  if(this__10692.root.edit) {
    if(function() {
      var and__3822__auto____10693 = 0 <= n;
      if(and__3822__auto____10693) {
        return n < this__10692.cnt
      }else {
        return and__3822__auto____10693
      }
    }()) {
      if(cljs.core.tail_off(tcoll) <= n) {
        this__10692.tail[n & 31] = val;
        return tcoll
      }else {
        var new_root__10698 = function go(level, node) {
          var node__10696 = cljs.core.tv_ensure_editable(this__10692.root.edit, node);
          if(level === 0) {
            cljs.core.pv_aset(node__10696, n & 31, val);
            return node__10696
          }else {
            var subidx__10697 = n >>> level & 31;
            cljs.core.pv_aset(node__10696, subidx__10697, go(level - 5, cljs.core.pv_aget(node__10696, subidx__10697)));
            return node__10696
          }
        }.call(null, this__10692.shift, this__10692.root);
        this__10692.root = new_root__10698;
        return tcoll
      }
    }else {
      if(n === this__10692.cnt) {
        return tcoll.cljs$core$ITransientCollection$_conj_BANG_$arity$2(tcoll, val)
      }else {
        if("\ufdd0'else") {
          throw new Error([cljs.core.str("Index "), cljs.core.str(n), cljs.core.str(" out of bounds for TransientVector of length"), cljs.core.str(this__10692.cnt)].join(""));
        }else {
          return null
        }
      }
    }
  }else {
    throw new Error("assoc! after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$ITransientVector$_pop_BANG_$arity$1 = function(tcoll) {
  var this__10699 = this;
  if(this__10699.root.edit) {
    if(this__10699.cnt === 0) {
      throw new Error("Can't pop empty vector");
    }else {
      if(1 === this__10699.cnt) {
        this__10699.cnt = 0;
        return tcoll
      }else {
        if((this__10699.cnt - 1 & 31) > 0) {
          this__10699.cnt = this__10699.cnt - 1;
          return tcoll
        }else {
          if("\ufdd0'else") {
            var new_tail__10700 = cljs.core.editable_array_for(tcoll, this__10699.cnt - 2);
            var new_root__10702 = function() {
              var nr__10701 = cljs.core.tv_pop_tail(tcoll, this__10699.shift, this__10699.root);
              if(!(nr__10701 == null)) {
                return nr__10701
              }else {
                return new cljs.core.VectorNode(this__10699.root.edit, cljs.core.make_array.cljs$lang$arity$1(32))
              }
            }();
            if(function() {
              var and__3822__auto____10703 = 5 < this__10699.shift;
              if(and__3822__auto____10703) {
                return cljs.core.pv_aget(new_root__10702, 1) == null
              }else {
                return and__3822__auto____10703
              }
            }()) {
              var new_root__10704 = cljs.core.tv_ensure_editable(this__10699.root.edit, cljs.core.pv_aget(new_root__10702, 0));
              this__10699.root = new_root__10704;
              this__10699.shift = this__10699.shift - 5;
              this__10699.cnt = this__10699.cnt - 1;
              this__10699.tail = new_tail__10700;
              return tcoll
            }else {
              this__10699.root = new_root__10702;
              this__10699.cnt = this__10699.cnt - 1;
              this__10699.tail = new_tail__10700;
              return tcoll
            }
          }else {
            return null
          }
        }
      }
    }
  }else {
    throw new Error("pop! after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3 = function(tcoll, key, val) {
  var this__10705 = this;
  return tcoll.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3(tcoll, key, val)
};
cljs.core.TransientVector.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, o) {
  var this__10706 = this;
  if(this__10706.root.edit) {
    if(this__10706.cnt - cljs.core.tail_off(tcoll) < 32) {
      this__10706.tail[this__10706.cnt & 31] = o;
      this__10706.cnt = this__10706.cnt + 1;
      return tcoll
    }else {
      var tail_node__10707 = new cljs.core.VectorNode(this__10706.root.edit, this__10706.tail);
      var new_tail__10708 = cljs.core.make_array.cljs$lang$arity$1(32);
      new_tail__10708[0] = o;
      this__10706.tail = new_tail__10708;
      if(this__10706.cnt >>> 5 > 1 << this__10706.shift) {
        var new_root_array__10709 = cljs.core.make_array.cljs$lang$arity$1(32);
        var new_shift__10710 = this__10706.shift + 5;
        new_root_array__10709[0] = this__10706.root;
        new_root_array__10709[1] = cljs.core.new_path(this__10706.root.edit, this__10706.shift, tail_node__10707);
        this__10706.root = new cljs.core.VectorNode(this__10706.root.edit, new_root_array__10709);
        this__10706.shift = new_shift__10710;
        this__10706.cnt = this__10706.cnt + 1;
        return tcoll
      }else {
        var new_root__10711 = cljs.core.tv_push_tail(tcoll, this__10706.shift, this__10706.root, tail_node__10707);
        this__10706.root = new_root__10711;
        this__10706.cnt = this__10706.cnt + 1;
        return tcoll
      }
    }
  }else {
    throw new Error("conj! after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__10712 = this;
  if(this__10712.root.edit) {
    this__10712.root.edit = null;
    var len__10713 = this__10712.cnt - cljs.core.tail_off(tcoll);
    var trimmed_tail__10714 = cljs.core.make_array.cljs$lang$arity$1(len__10713);
    cljs.core.array_copy(this__10712.tail, 0, trimmed_tail__10714, 0, len__10713);
    return new cljs.core.PersistentVector(null, this__10712.cnt, this__10712.shift, this__10712.root, trimmed_tail__10714, null)
  }else {
    throw new Error("persistent! called twice");
  }
};
cljs.core.TransientVector;
cljs.core.PersistentQueueSeq = function(meta, front, rear, __hash) {
  this.meta = meta;
  this.front = front;
  this.rear = rear;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31850572
};
cljs.core.PersistentQueueSeq.cljs$lang$type = true;
cljs.core.PersistentQueueSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/PersistentQueueSeq")
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__10716 = this;
  var h__2192__auto____10717 = this__10716.__hash;
  if(!(h__2192__auto____10717 == null)) {
    return h__2192__auto____10717
  }else {
    var h__2192__auto____10718 = cljs.core.hash_coll(coll);
    this__10716.__hash = h__2192__auto____10718;
    return h__2192__auto____10718
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__10719 = this;
  return cljs.core.cons(o, coll)
};
cljs.core.PersistentQueueSeq.prototype.toString = function() {
  var this__10720 = this;
  var this__10721 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__10721], 0))
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10722 = this;
  return coll
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__10723 = this;
  return cljs.core._first(this__10723.front)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__10724 = this;
  var temp__3971__auto____10725 = cljs.core.next(this__10724.front);
  if(temp__3971__auto____10725) {
    var f1__10726 = temp__3971__auto____10725;
    return new cljs.core.PersistentQueueSeq(this__10724.meta, f1__10726, this__10724.rear, null)
  }else {
    if(this__10724.rear == null) {
      return coll.cljs$core$IEmptyableCollection$_empty$arity$1(coll)
    }else {
      return new cljs.core.PersistentQueueSeq(this__10724.meta, this__10724.rear, null, null)
    }
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10727 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10728 = this;
  return new cljs.core.PersistentQueueSeq(meta, this__10728.front, this__10728.rear, this__10728.__hash)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10729 = this;
  return this__10729.meta
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10730 = this;
  return cljs.core.with_meta(cljs.core.List.EMPTY, this__10730.meta)
};
cljs.core.PersistentQueueSeq;
cljs.core.PersistentQueue = function(meta, count, front, rear, __hash) {
  this.meta = meta;
  this.count = count;
  this.front = front;
  this.rear = rear;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31858766
};
cljs.core.PersistentQueue.cljs$lang$type = true;
cljs.core.PersistentQueue.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/PersistentQueue")
};
cljs.core.PersistentQueue.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__10731 = this;
  var h__2192__auto____10732 = this__10731.__hash;
  if(!(h__2192__auto____10732 == null)) {
    return h__2192__auto____10732
  }else {
    var h__2192__auto____10733 = cljs.core.hash_coll(coll);
    this__10731.__hash = h__2192__auto____10733;
    return h__2192__auto____10733
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__10734 = this;
  if(cljs.core.truth_(this__10734.front)) {
    return new cljs.core.PersistentQueue(this__10734.meta, this__10734.count + 1, this__10734.front, cljs.core.conj.cljs$lang$arity$2(function() {
      var or__3824__auto____10735 = this__10734.rear;
      if(cljs.core.truth_(or__3824__auto____10735)) {
        return or__3824__auto____10735
      }else {
        return cljs.core.PersistentVector.EMPTY
      }
    }(), o), null)
  }else {
    return new cljs.core.PersistentQueue(this__10734.meta, this__10734.count + 1, cljs.core.conj.cljs$lang$arity$2(this__10734.front, o), cljs.core.PersistentVector.EMPTY, null)
  }
};
cljs.core.PersistentQueue.prototype.toString = function() {
  var this__10736 = this;
  var this__10737 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__10737], 0))
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10738 = this;
  var rear__10739 = cljs.core.seq(this__10738.rear);
  if(cljs.core.truth_(function() {
    var or__3824__auto____10740 = this__10738.front;
    if(cljs.core.truth_(or__3824__auto____10740)) {
      return or__3824__auto____10740
    }else {
      return rear__10739
    }
  }())) {
    return new cljs.core.PersistentQueueSeq(null, this__10738.front, cljs.core.seq(rear__10739), null)
  }else {
    return null
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10741 = this;
  return this__10741.count
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__10742 = this;
  return cljs.core._first(this__10742.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__10743 = this;
  if(cljs.core.truth_(this__10743.front)) {
    var temp__3971__auto____10744 = cljs.core.next(this__10743.front);
    if(temp__3971__auto____10744) {
      var f1__10745 = temp__3971__auto____10744;
      return new cljs.core.PersistentQueue(this__10743.meta, this__10743.count - 1, f1__10745, this__10743.rear, null)
    }else {
      return new cljs.core.PersistentQueue(this__10743.meta, this__10743.count - 1, cljs.core.seq(this__10743.rear), cljs.core.PersistentVector.EMPTY, null)
    }
  }else {
    return coll
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__10746 = this;
  return cljs.core.first(this__10746.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__10747 = this;
  return cljs.core.rest(cljs.core.seq(coll))
};
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10748 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10749 = this;
  return new cljs.core.PersistentQueue(meta, this__10749.count, this__10749.front, this__10749.rear, this__10749.__hash)
};
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10750 = this;
  return this__10750.meta
};
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10751 = this;
  return cljs.core.PersistentQueue.EMPTY
};
cljs.core.PersistentQueue;
cljs.core.PersistentQueue.EMPTY = new cljs.core.PersistentQueue(null, 0, null, cljs.core.PersistentVector.EMPTY, 0);
cljs.core.NeverEquiv = function() {
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 2097152
};
cljs.core.NeverEquiv.cljs$lang$type = true;
cljs.core.NeverEquiv.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/NeverEquiv")
};
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(o, other) {
  var this__10752 = this;
  return false
};
cljs.core.NeverEquiv;
cljs.core.never_equiv = new cljs.core.NeverEquiv;
cljs.core.equiv_map = function equiv_map(x, y) {
  return cljs.core.boolean$(cljs.core.map_QMARK_(y) ? cljs.core.count(x) === cljs.core.count(y) ? cljs.core.every_QMARK_(cljs.core.identity, cljs.core.map.cljs$lang$arity$2(function(xkv) {
    return cljs.core._EQ_.cljs$lang$arity$2(cljs.core._lookup.cljs$lang$arity$3(y, cljs.core.first(xkv), cljs.core.never_equiv), cljs.core.second(xkv))
  }, x)) : null : null)
};
cljs.core.scan_array = function scan_array(incr, k, array) {
  var len__10755 = array.length;
  var i__10756 = 0;
  while(true) {
    if(i__10756 < len__10755) {
      if(k === array[i__10756]) {
        return i__10756
      }else {
        var G__10757 = i__10756 + incr;
        i__10756 = G__10757;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.obj_map_compare_keys = function obj_map_compare_keys(a, b) {
  var a__10760 = cljs.core.hash.cljs$lang$arity$1(a);
  var b__10761 = cljs.core.hash.cljs$lang$arity$1(b);
  if(a__10760 < b__10761) {
    return-1
  }else {
    if(a__10760 > b__10761) {
      return 1
    }else {
      if("\ufdd0'else") {
        return 0
      }else {
        return null
      }
    }
  }
};
cljs.core.obj_map__GT_hash_map = function obj_map__GT_hash_map(m, k, v) {
  var ks__10769 = m.keys;
  var len__10770 = ks__10769.length;
  var so__10771 = m.strobj;
  var out__10772 = cljs.core.with_meta(cljs.core.PersistentHashMap.EMPTY, cljs.core.meta(m));
  var i__10773 = 0;
  var out__10774 = cljs.core.transient$(out__10772);
  while(true) {
    if(i__10773 < len__10770) {
      var k__10775 = ks__10769[i__10773];
      var G__10776 = i__10773 + 1;
      var G__10777 = cljs.core.assoc_BANG_(out__10774, k__10775, so__10771[k__10775]);
      i__10773 = G__10776;
      out__10774 = G__10777;
      continue
    }else {
      return cljs.core.persistent_BANG_(cljs.core.assoc_BANG_(out__10774, k, v))
    }
    break
  }
};
cljs.core.obj_clone = function obj_clone(obj, ks) {
  var new_obj__10783 = {};
  var l__10784 = ks.length;
  var i__10785 = 0;
  while(true) {
    if(i__10785 < l__10784) {
      var k__10786 = ks[i__10785];
      new_obj__10783[k__10786] = obj[k__10786];
      var G__10787 = i__10785 + 1;
      i__10785 = G__10787;
      continue
    }else {
    }
    break
  }
  return new_obj__10783
};
cljs.core.ObjMap = function(meta, keys, strobj, update_count, __hash) {
  this.meta = meta;
  this.keys = keys;
  this.strobj = strobj;
  this.update_count = update_count;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 1;
  this.cljs$lang$protocol_mask$partition0$ = 15075087
};
cljs.core.ObjMap.cljs$lang$type = true;
cljs.core.ObjMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/ObjMap")
};
cljs.core.ObjMap.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__10790 = this;
  return cljs.core.transient$(cljs.core.into(cljs.core.hash_map(), coll))
};
cljs.core.ObjMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__10791 = this;
  var h__2192__auto____10792 = this__10791.__hash;
  if(!(h__2192__auto____10792 == null)) {
    return h__2192__auto____10792
  }else {
    var h__2192__auto____10793 = cljs.core.hash_imap(coll);
    this__10791.__hash = h__2192__auto____10793;
    return h__2192__auto____10793
  }
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10794 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10795 = this;
  if(function() {
    var and__3822__auto____10796 = goog.isString(k);
    if(and__3822__auto____10796) {
      return!(cljs.core.scan_array(1, k, this__10795.keys) == null)
    }else {
      return and__3822__auto____10796
    }
  }()) {
    return this__10795.strobj[k]
  }else {
    return not_found
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__10797 = this;
  if(goog.isString(k)) {
    if(function() {
      var or__3824__auto____10798 = this__10797.update_count > cljs.core.ObjMap.HASHMAP_THRESHOLD;
      if(or__3824__auto____10798) {
        return or__3824__auto____10798
      }else {
        return this__10797.keys.length >= cljs.core.ObjMap.HASHMAP_THRESHOLD
      }
    }()) {
      return cljs.core.obj_map__GT_hash_map(coll, k, v)
    }else {
      if(!(cljs.core.scan_array(1, k, this__10797.keys) == null)) {
        var new_strobj__10799 = cljs.core.obj_clone(this__10797.strobj, this__10797.keys);
        new_strobj__10799[k] = v;
        return new cljs.core.ObjMap(this__10797.meta, this__10797.keys, new_strobj__10799, this__10797.update_count + 1, null)
      }else {
        var new_strobj__10800 = cljs.core.obj_clone(this__10797.strobj, this__10797.keys);
        var new_keys__10801 = this__10797.keys.slice();
        new_strobj__10800[k] = v;
        new_keys__10801.push(k);
        return new cljs.core.ObjMap(this__10797.meta, new_keys__10801, new_strobj__10800, this__10797.update_count + 1, null)
      }
    }
  }else {
    return cljs.core.obj_map__GT_hash_map(coll, k, v)
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__10802 = this;
  if(function() {
    var and__3822__auto____10803 = goog.isString(k);
    if(and__3822__auto____10803) {
      return!(cljs.core.scan_array(1, k, this__10802.keys) == null)
    }else {
      return and__3822__auto____10803
    }
  }()) {
    return true
  }else {
    return false
  }
};
cljs.core.ObjMap.prototype.call = function() {
  var G__10825 = null;
  var G__10825__2 = function(this_sym10804, k) {
    var this__10806 = this;
    var this_sym10804__10807 = this;
    var coll__10808 = this_sym10804__10807;
    return coll__10808.cljs$core$ILookup$_lookup$arity$2(coll__10808, k)
  };
  var G__10825__3 = function(this_sym10805, k, not_found) {
    var this__10806 = this;
    var this_sym10805__10809 = this;
    var coll__10810 = this_sym10805__10809;
    return coll__10810.cljs$core$ILookup$_lookup$arity$3(coll__10810, k, not_found)
  };
  G__10825 = function(this_sym10805, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10825__2.call(this, this_sym10805, k);
      case 3:
        return G__10825__3.call(this, this_sym10805, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10825
}();
cljs.core.ObjMap.prototype.apply = function(this_sym10788, args10789) {
  var this__10811 = this;
  return this_sym10788.call.apply(this_sym10788, [this_sym10788].concat(args10789.slice()))
};
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__10812 = this;
  if(cljs.core.vector_QMARK_(entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.cljs$lang$arity$2(entry, 0), cljs.core._nth.cljs$lang$arity$2(entry, 1))
  }else {
    return cljs.core.reduce.cljs$lang$arity$3(cljs.core._conj, coll, entry)
  }
};
cljs.core.ObjMap.prototype.toString = function() {
  var this__10813 = this;
  var this__10814 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__10814], 0))
};
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10815 = this;
  if(this__10815.keys.length > 0) {
    return cljs.core.map.cljs$lang$arity$2(function(p1__10778_SHARP_) {
      return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([p1__10778_SHARP_, this__10815.strobj[p1__10778_SHARP_]], 0))
    }, this__10815.keys.sort(cljs.core.obj_map_compare_keys))
  }else {
    return null
  }
};
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10816 = this;
  return this__10816.keys.length
};
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10817 = this;
  return cljs.core.equiv_map(coll, other)
};
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10818 = this;
  return new cljs.core.ObjMap(meta, this__10818.keys, this__10818.strobj, this__10818.update_count, this__10818.__hash)
};
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10819 = this;
  return this__10819.meta
};
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10820 = this;
  return cljs.core.with_meta(cljs.core.ObjMap.EMPTY, this__10820.meta)
};
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__10821 = this;
  if(function() {
    var and__3822__auto____10822 = goog.isString(k);
    if(and__3822__auto____10822) {
      return!(cljs.core.scan_array(1, k, this__10821.keys) == null)
    }else {
      return and__3822__auto____10822
    }
  }()) {
    var new_keys__10823 = this__10821.keys.slice();
    var new_strobj__10824 = cljs.core.obj_clone(this__10821.strobj, this__10821.keys);
    new_keys__10823.splice(cljs.core.scan_array(1, k, new_keys__10823), 1);
    cljs.core.js_delete(new_strobj__10824, k);
    return new cljs.core.ObjMap(this__10821.meta, new_keys__10823, new_strobj__10824, this__10821.update_count + 1, null)
  }else {
    return coll
  }
};
cljs.core.ObjMap;
cljs.core.ObjMap.EMPTY = new cljs.core.ObjMap(null, [], {}, 0, 0);
cljs.core.ObjMap.HASHMAP_THRESHOLD = 32;
cljs.core.ObjMap.fromObject = function(ks, obj) {
  return new cljs.core.ObjMap(null, ks, obj, 0, null)
};
cljs.core.HashMap = function(meta, count, hashobj, __hash) {
  this.meta = meta;
  this.count = count;
  this.hashobj = hashobj;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 15075087
};
cljs.core.HashMap.cljs$lang$type = true;
cljs.core.HashMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/HashMap")
};
cljs.core.HashMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__10829 = this;
  var h__2192__auto____10830 = this__10829.__hash;
  if(!(h__2192__auto____10830 == null)) {
    return h__2192__auto____10830
  }else {
    var h__2192__auto____10831 = cljs.core.hash_imap(coll);
    this__10829.__hash = h__2192__auto____10831;
    return h__2192__auto____10831
  }
};
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10832 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10833 = this;
  var bucket__10834 = this__10833.hashobj[cljs.core.hash.cljs$lang$arity$1(k)];
  var i__10835 = cljs.core.truth_(bucket__10834) ? cljs.core.scan_array(2, k, bucket__10834) : null;
  if(cljs.core.truth_(i__10835)) {
    return bucket__10834[i__10835 + 1]
  }else {
    return not_found
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__10836 = this;
  var h__10837 = cljs.core.hash.cljs$lang$arity$1(k);
  var bucket__10838 = this__10836.hashobj[h__10837];
  if(cljs.core.truth_(bucket__10838)) {
    var new_bucket__10839 = bucket__10838.slice();
    var new_hashobj__10840 = goog.object.clone(this__10836.hashobj);
    new_hashobj__10840[h__10837] = new_bucket__10839;
    var temp__3971__auto____10841 = cljs.core.scan_array(2, k, new_bucket__10839);
    if(cljs.core.truth_(temp__3971__auto____10841)) {
      var i__10842 = temp__3971__auto____10841;
      new_bucket__10839[i__10842 + 1] = v;
      return new cljs.core.HashMap(this__10836.meta, this__10836.count, new_hashobj__10840, null)
    }else {
      new_bucket__10839.push(k, v);
      return new cljs.core.HashMap(this__10836.meta, this__10836.count + 1, new_hashobj__10840, null)
    }
  }else {
    var new_hashobj__10843 = goog.object.clone(this__10836.hashobj);
    new_hashobj__10843[h__10837] = [k, v];
    return new cljs.core.HashMap(this__10836.meta, this__10836.count + 1, new_hashobj__10843, null)
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__10844 = this;
  var bucket__10845 = this__10844.hashobj[cljs.core.hash.cljs$lang$arity$1(k)];
  var i__10846 = cljs.core.truth_(bucket__10845) ? cljs.core.scan_array(2, k, bucket__10845) : null;
  if(cljs.core.truth_(i__10846)) {
    return true
  }else {
    return false
  }
};
cljs.core.HashMap.prototype.call = function() {
  var G__10871 = null;
  var G__10871__2 = function(this_sym10847, k) {
    var this__10849 = this;
    var this_sym10847__10850 = this;
    var coll__10851 = this_sym10847__10850;
    return coll__10851.cljs$core$ILookup$_lookup$arity$2(coll__10851, k)
  };
  var G__10871__3 = function(this_sym10848, k, not_found) {
    var this__10849 = this;
    var this_sym10848__10852 = this;
    var coll__10853 = this_sym10848__10852;
    return coll__10853.cljs$core$ILookup$_lookup$arity$3(coll__10853, k, not_found)
  };
  G__10871 = function(this_sym10848, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10871__2.call(this, this_sym10848, k);
      case 3:
        return G__10871__3.call(this, this_sym10848, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10871
}();
cljs.core.HashMap.prototype.apply = function(this_sym10827, args10828) {
  var this__10854 = this;
  return this_sym10827.call.apply(this_sym10827, [this_sym10827].concat(args10828.slice()))
};
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__10855 = this;
  if(cljs.core.vector_QMARK_(entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.cljs$lang$arity$2(entry, 0), cljs.core._nth.cljs$lang$arity$2(entry, 1))
  }else {
    return cljs.core.reduce.cljs$lang$arity$3(cljs.core._conj, coll, entry)
  }
};
cljs.core.HashMap.prototype.toString = function() {
  var this__10856 = this;
  var this__10857 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__10857], 0))
};
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10858 = this;
  if(this__10858.count > 0) {
    var hashes__10859 = cljs.core.js_keys(this__10858.hashobj).sort();
    return cljs.core.mapcat.cljs$lang$arity$2(function(p1__10826_SHARP_) {
      return cljs.core.map.cljs$lang$arity$2(cljs.core.vec, cljs.core.partition.cljs$lang$arity$2(2, this__10858.hashobj[p1__10826_SHARP_]))
    }, hashes__10859)
  }else {
    return null
  }
};
cljs.core.HashMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10860 = this;
  return this__10860.count
};
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10861 = this;
  return cljs.core.equiv_map(coll, other)
};
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10862 = this;
  return new cljs.core.HashMap(meta, this__10862.count, this__10862.hashobj, this__10862.__hash)
};
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10863 = this;
  return this__10863.meta
};
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10864 = this;
  return cljs.core.with_meta(cljs.core.HashMap.EMPTY, this__10864.meta)
};
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__10865 = this;
  var h__10866 = cljs.core.hash.cljs$lang$arity$1(k);
  var bucket__10867 = this__10865.hashobj[h__10866];
  var i__10868 = cljs.core.truth_(bucket__10867) ? cljs.core.scan_array(2, k, bucket__10867) : null;
  if(cljs.core.not(i__10868)) {
    return coll
  }else {
    var new_hashobj__10869 = goog.object.clone(this__10865.hashobj);
    if(3 > bucket__10867.length) {
      cljs.core.js_delete(new_hashobj__10869, h__10866)
    }else {
      var new_bucket__10870 = bucket__10867.slice();
      new_bucket__10870.splice(i__10868, 2);
      new_hashobj__10869[h__10866] = new_bucket__10870
    }
    return new cljs.core.HashMap(this__10865.meta, this__10865.count - 1, new_hashobj__10869, null)
  }
};
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = new cljs.core.HashMap(null, 0, {}, 0);
cljs.core.HashMap.fromArrays = function(ks, vs) {
  var len__10872 = ks.length;
  var i__10873 = 0;
  var out__10874 = cljs.core.HashMap.EMPTY;
  while(true) {
    if(i__10873 < len__10872) {
      var G__10875 = i__10873 + 1;
      var G__10876 = cljs.core.assoc.cljs$lang$arity$3(out__10874, ks[i__10873], vs[i__10873]);
      i__10873 = G__10875;
      out__10874 = G__10876;
      continue
    }else {
      return out__10874
    }
    break
  }
};
cljs.core.array_map_index_of = function array_map_index_of(m, k) {
  var arr__10880 = m.arr;
  var len__10881 = arr__10880.length;
  var i__10882 = 0;
  while(true) {
    if(len__10881 <= i__10882) {
      return-1
    }else {
      if(cljs.core._EQ_.cljs$lang$arity$2(arr__10880[i__10882], k)) {
        return i__10882
      }else {
        if("\ufdd0'else") {
          var G__10883 = i__10882 + 2;
          i__10882 = G__10883;
          continue
        }else {
          return null
        }
      }
    }
    break
  }
};
cljs.core.PersistentArrayMap = function(meta, cnt, arr, __hash) {
  this.meta = meta;
  this.cnt = cnt;
  this.arr = arr;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 1;
  this.cljs$lang$protocol_mask$partition0$ = 16123663
};
cljs.core.PersistentArrayMap.cljs$lang$type = true;
cljs.core.PersistentArrayMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/PersistentArrayMap")
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__10886 = this;
  return new cljs.core.TransientArrayMap({}, this__10886.arr.length, this__10886.arr.slice())
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__10887 = this;
  var h__2192__auto____10888 = this__10887.__hash;
  if(!(h__2192__auto____10888 == null)) {
    return h__2192__auto____10888
  }else {
    var h__2192__auto____10889 = cljs.core.hash_imap(coll);
    this__10887.__hash = h__2192__auto____10889;
    return h__2192__auto____10889
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10890 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10891 = this;
  var idx__10892 = cljs.core.array_map_index_of(coll, k);
  if(idx__10892 === -1) {
    return not_found
  }else {
    return this__10891.arr[idx__10892 + 1]
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__10893 = this;
  var idx__10894 = cljs.core.array_map_index_of(coll, k);
  if(idx__10894 === -1) {
    if(this__10893.cnt < cljs.core.PersistentArrayMap.HASHMAP_THRESHOLD) {
      return new cljs.core.PersistentArrayMap(this__10893.meta, this__10893.cnt + 1, function() {
        var G__10895__10896 = this__10893.arr.slice();
        G__10895__10896.push(k);
        G__10895__10896.push(v);
        return G__10895__10896
      }(), null)
    }else {
      return cljs.core.persistent_BANG_(cljs.core.assoc_BANG_(cljs.core.transient$(cljs.core.into(cljs.core.PersistentHashMap.EMPTY, coll)), k, v))
    }
  }else {
    if(v === this__10893.arr[idx__10894 + 1]) {
      return coll
    }else {
      if("\ufdd0'else") {
        return new cljs.core.PersistentArrayMap(this__10893.meta, this__10893.cnt, function() {
          var G__10897__10898 = this__10893.arr.slice();
          G__10897__10898[idx__10894 + 1] = v;
          return G__10897__10898
        }(), null)
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__10899 = this;
  return!(cljs.core.array_map_index_of(coll, k) === -1)
};
cljs.core.PersistentArrayMap.prototype.call = function() {
  var G__10931 = null;
  var G__10931__2 = function(this_sym10900, k) {
    var this__10902 = this;
    var this_sym10900__10903 = this;
    var coll__10904 = this_sym10900__10903;
    return coll__10904.cljs$core$ILookup$_lookup$arity$2(coll__10904, k)
  };
  var G__10931__3 = function(this_sym10901, k, not_found) {
    var this__10902 = this;
    var this_sym10901__10905 = this;
    var coll__10906 = this_sym10901__10905;
    return coll__10906.cljs$core$ILookup$_lookup$arity$3(coll__10906, k, not_found)
  };
  G__10931 = function(this_sym10901, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10931__2.call(this, this_sym10901, k);
      case 3:
        return G__10931__3.call(this, this_sym10901, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10931
}();
cljs.core.PersistentArrayMap.prototype.apply = function(this_sym10884, args10885) {
  var this__10907 = this;
  return this_sym10884.call.apply(this_sym10884, [this_sym10884].concat(args10885.slice()))
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(coll, f, init) {
  var this__10908 = this;
  var len__10909 = this__10908.arr.length;
  var i__10910 = 0;
  var init__10911 = init;
  while(true) {
    if(i__10910 < len__10909) {
      var init__10912 = f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(init__10911, this__10908.arr[i__10910], this__10908.arr[i__10910 + 1]) : f.call(null, init__10911, this__10908.arr[i__10910], this__10908.arr[i__10910 + 1]);
      if(cljs.core.reduced_QMARK_(init__10912)) {
        return cljs.core.deref(init__10912)
      }else {
        var G__10932 = i__10910 + 2;
        var G__10933 = init__10912;
        i__10910 = G__10932;
        init__10911 = G__10933;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__10913 = this;
  if(cljs.core.vector_QMARK_(entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.cljs$lang$arity$2(entry, 0), cljs.core._nth.cljs$lang$arity$2(entry, 1))
  }else {
    return cljs.core.reduce.cljs$lang$arity$3(cljs.core._conj, coll, entry)
  }
};
cljs.core.PersistentArrayMap.prototype.toString = function() {
  var this__10914 = this;
  var this__10915 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__10915], 0))
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10916 = this;
  if(this__10916.cnt > 0) {
    var len__10917 = this__10916.arr.length;
    var array_map_seq__10918 = function array_map_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(i < len__10917) {
          return cljs.core.cons(cljs.core.PersistentVector.fromArray([this__10916.arr[i], this__10916.arr[i + 1]], true), array_map_seq(i + 2))
        }else {
          return null
        }
      }, null)
    };
    return array_map_seq__10918.cljs$lang$arity$1 ? array_map_seq__10918.cljs$lang$arity$1(0) : array_map_seq__10918.call(null, 0)
  }else {
    return null
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10919 = this;
  return this__10919.cnt
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10920 = this;
  return cljs.core.equiv_map(coll, other)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10921 = this;
  return new cljs.core.PersistentArrayMap(meta, this__10921.cnt, this__10921.arr, this__10921.__hash)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10922 = this;
  return this__10922.meta
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10923 = this;
  return cljs.core._with_meta(cljs.core.PersistentArrayMap.EMPTY, this__10923.meta)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__10924 = this;
  var idx__10925 = cljs.core.array_map_index_of(coll, k);
  if(idx__10925 >= 0) {
    var len__10926 = this__10924.arr.length;
    var new_len__10927 = len__10926 - 2;
    if(new_len__10927 === 0) {
      return coll.cljs$core$IEmptyableCollection$_empty$arity$1(coll)
    }else {
      var new_arr__10928 = cljs.core.make_array.cljs$lang$arity$1(new_len__10927);
      var s__10929 = 0;
      var d__10930 = 0;
      while(true) {
        if(s__10929 >= len__10926) {
          return new cljs.core.PersistentArrayMap(this__10924.meta, this__10924.cnt - 1, new_arr__10928, null)
        }else {
          if(cljs.core._EQ_.cljs$lang$arity$2(k, this__10924.arr[s__10929])) {
            var G__10934 = s__10929 + 2;
            var G__10935 = d__10930;
            s__10929 = G__10934;
            d__10930 = G__10935;
            continue
          }else {
            if("\ufdd0'else") {
              new_arr__10928[d__10930] = this__10924.arr[s__10929];
              new_arr__10928[d__10930 + 1] = this__10924.arr[s__10929 + 1];
              var G__10936 = s__10929 + 2;
              var G__10937 = d__10930 + 2;
              s__10929 = G__10936;
              d__10930 = G__10937;
              continue
            }else {
              return null
            }
          }
        }
        break
      }
    }
  }else {
    return coll
  }
};
cljs.core.PersistentArrayMap;
cljs.core.PersistentArrayMap.EMPTY = new cljs.core.PersistentArrayMap(null, 0, [], null);
cljs.core.PersistentArrayMap.HASHMAP_THRESHOLD = 16;
cljs.core.PersistentArrayMap.fromArrays = function(ks, vs) {
  var len__10938 = cljs.core.count(ks);
  var i__10939 = 0;
  var out__10940 = cljs.core.transient$(cljs.core.PersistentArrayMap.EMPTY);
  while(true) {
    if(i__10939 < len__10938) {
      var G__10941 = i__10939 + 1;
      var G__10942 = cljs.core.assoc_BANG_(out__10940, ks[i__10939], vs[i__10939]);
      i__10939 = G__10941;
      out__10940 = G__10942;
      continue
    }else {
      return cljs.core.persistent_BANG_(out__10940)
    }
    break
  }
};
cljs.core.TransientArrayMap = function(editable_QMARK_, len, arr) {
  this.editable_QMARK_ = editable_QMARK_;
  this.len = len;
  this.arr = arr;
  this.cljs$lang$protocol_mask$partition1$ = 14;
  this.cljs$lang$protocol_mask$partition0$ = 258
};
cljs.core.TransientArrayMap.cljs$lang$type = true;
cljs.core.TransientArrayMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/TransientArrayMap")
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientMap$_dissoc_BANG_$arity$2 = function(tcoll, key) {
  var this__10943 = this;
  if(cljs.core.truth_(this__10943.editable_QMARK_)) {
    var idx__10944 = cljs.core.array_map_index_of(tcoll, key);
    if(idx__10944 >= 0) {
      this__10943.arr[idx__10944] = this__10943.arr[this__10943.len - 2];
      this__10943.arr[idx__10944 + 1] = this__10943.arr[this__10943.len - 1];
      var G__10945__10946 = this__10943.arr;
      G__10945__10946.pop();
      G__10945__10946.pop();
      G__10945__10946;
      this__10943.len = this__10943.len - 2
    }else {
    }
    return tcoll
  }else {
    throw new Error("dissoc! after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3 = function(tcoll, key, val) {
  var this__10947 = this;
  if(cljs.core.truth_(this__10947.editable_QMARK_)) {
    var idx__10948 = cljs.core.array_map_index_of(tcoll, key);
    if(idx__10948 === -1) {
      if(this__10947.len + 2 <= 2 * cljs.core.PersistentArrayMap.HASHMAP_THRESHOLD) {
        this__10947.len = this__10947.len + 2;
        this__10947.arr.push(key);
        this__10947.arr.push(val);
        return tcoll
      }else {
        return cljs.core.assoc_BANG_(cljs.core.array__GT_transient_hash_map(this__10947.len, this__10947.arr), key, val)
      }
    }else {
      if(val === this__10947.arr[idx__10948 + 1]) {
        return tcoll
      }else {
        this__10947.arr[idx__10948 + 1] = val;
        return tcoll
      }
    }
  }else {
    throw new Error("assoc! after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, o) {
  var this__10949 = this;
  if(cljs.core.truth_(this__10949.editable_QMARK_)) {
    if(function() {
      var G__10950__10951 = o;
      if(G__10950__10951) {
        if(function() {
          var or__3824__auto____10952 = G__10950__10951.cljs$lang$protocol_mask$partition0$ & 2048;
          if(or__3824__auto____10952) {
            return or__3824__auto____10952
          }else {
            return G__10950__10951.cljs$core$IMapEntry$
          }
        }()) {
          return true
        }else {
          if(!G__10950__10951.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_(cljs.core.IMapEntry, G__10950__10951)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_(cljs.core.IMapEntry, G__10950__10951)
      }
    }()) {
      return tcoll.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3(tcoll, cljs.core.key(o), cljs.core.val(o))
    }else {
      var es__10953 = cljs.core.seq(o);
      var tcoll__10954 = tcoll;
      while(true) {
        var temp__3971__auto____10955 = cljs.core.first(es__10953);
        if(cljs.core.truth_(temp__3971__auto____10955)) {
          var e__10956 = temp__3971__auto____10955;
          var G__10962 = cljs.core.next(es__10953);
          var G__10963 = tcoll__10954.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3(tcoll__10954, cljs.core.key(e__10956), cljs.core.val(e__10956));
          es__10953 = G__10962;
          tcoll__10954 = G__10963;
          continue
        }else {
          return tcoll__10954
        }
        break
      }
    }
  }else {
    throw new Error("conj! after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__10957 = this;
  if(cljs.core.truth_(this__10957.editable_QMARK_)) {
    this__10957.editable_QMARK_ = false;
    return new cljs.core.PersistentArrayMap(null, cljs.core.quot(this__10957.len, 2), this__10957.arr, null)
  }else {
    throw new Error("persistent! called twice");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(tcoll, k) {
  var this__10958 = this;
  return tcoll.cljs$core$ILookup$_lookup$arity$3(tcoll, k, null)
};
cljs.core.TransientArrayMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(tcoll, k, not_found) {
  var this__10959 = this;
  if(cljs.core.truth_(this__10959.editable_QMARK_)) {
    var idx__10960 = cljs.core.array_map_index_of(tcoll, k);
    if(idx__10960 === -1) {
      return not_found
    }else {
      return this__10959.arr[idx__10960 + 1]
    }
  }else {
    throw new Error("lookup after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ICounted$_count$arity$1 = function(tcoll) {
  var this__10961 = this;
  if(cljs.core.truth_(this__10961.editable_QMARK_)) {
    return cljs.core.quot(this__10961.len, 2)
  }else {
    throw new Error("count after persistent!");
  }
};
cljs.core.TransientArrayMap;
cljs.core.array__GT_transient_hash_map = function array__GT_transient_hash_map(len, arr) {
  var out__10966 = cljs.core.transient$(cljs.core.ObjMap.EMPTY);
  var i__10967 = 0;
  while(true) {
    if(i__10967 < len) {
      var G__10968 = cljs.core.assoc_BANG_(out__10966, arr[i__10967], arr[i__10967 + 1]);
      var G__10969 = i__10967 + 2;
      out__10966 = G__10968;
      i__10967 = G__10969;
      continue
    }else {
      return out__10966
    }
    break
  }
};
cljs.core.Box = function(val) {
  this.val = val
};
cljs.core.Box.cljs$lang$type = true;
cljs.core.Box.cljs$lang$ctorPrSeq = function(this__2310__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/Box")
};
cljs.core.Box;
cljs.core.key_test = function key_test(key, other) {
  if(goog.isString(key)) {
    return key === other
  }else {
    return cljs.core._EQ_.cljs$lang$arity$2(key, other)
  }
};
cljs.core.mask = function mask(hash, shift) {
  return hash >>> shift & 31
};
cljs.core.clone_and_set = function() {
  var clone_and_set = null;
  var clone_and_set__3 = function(arr, i, a) {
    var G__10974__10975 = arr.slice();
    G__10974__10975[i] = a;
    return G__10974__10975
  };
  var clone_and_set__5 = function(arr, i, a, j, b) {
    var G__10976__10977 = arr.slice();
    G__10976__10977[i] = a;
    G__10976__10977[j] = b;
    return G__10976__10977
  };
  clone_and_set = function(arr, i, a, j, b) {
    switch(arguments.length) {
      case 3:
        return clone_and_set__3.call(this, arr, i, a);
      case 5:
        return clone_and_set__5.call(this, arr, i, a, j, b)
    }
    throw"Invalid arity: " + arguments.length;
  };
  clone_and_set.cljs$lang$arity$3 = clone_and_set__3;
  clone_and_set.cljs$lang$arity$5 = clone_and_set__5;
  return clone_and_set
}();
cljs.core.remove_pair = function remove_pair(arr, i) {
  var new_arr__10979 = cljs.core.make_array.cljs$lang$arity$1(arr.length - 2);
  cljs.core.array_copy(arr, 0, new_arr__10979, 0, 2 * i);
  cljs.core.array_copy(arr, 2 * (i + 1), new_arr__10979, 2 * i, new_arr__10979.length - 2 * i);
  return new_arr__10979
};
cljs.core.bitmap_indexed_node_index = function bitmap_indexed_node_index(bitmap, bit) {
  return cljs.core.bit_count(bitmap & bit - 1)
};
cljs.core.bitpos = function bitpos(hash, shift) {
  return 1 << (hash >>> shift & 31)
};
cljs.core.edit_and_set = function() {
  var edit_and_set = null;
  var edit_and_set__4 = function(inode, edit, i, a) {
    var editable__10982 = inode.ensure_editable(edit);
    editable__10982.arr[i] = a;
    return editable__10982
  };
  var edit_and_set__6 = function(inode, edit, i, a, j, b) {
    var editable__10983 = inode.ensure_editable(edit);
    editable__10983.arr[i] = a;
    editable__10983.arr[j] = b;
    return editable__10983
  };
  edit_and_set = function(inode, edit, i, a, j, b) {
    switch(arguments.length) {
      case 4:
        return edit_and_set__4.call(this, inode, edit, i, a);
      case 6:
        return edit_and_set__6.call(this, inode, edit, i, a, j, b)
    }
    throw"Invalid arity: " + arguments.length;
  };
  edit_and_set.cljs$lang$arity$4 = edit_and_set__4;
  edit_and_set.cljs$lang$arity$6 = edit_and_set__6;
  return edit_and_set
}();
cljs.core.inode_kv_reduce = function inode_kv_reduce(arr, f, init) {
  var len__10990 = arr.length;
  var i__10991 = 0;
  var init__10992 = init;
  while(true) {
    if(i__10991 < len__10990) {
      var init__10995 = function() {
        var k__10993 = arr[i__10991];
        if(!(k__10993 == null)) {
          return f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(init__10992, k__10993, arr[i__10991 + 1]) : f.call(null, init__10992, k__10993, arr[i__10991 + 1])
        }else {
          var node__10994 = arr[i__10991 + 1];
          if(!(node__10994 == null)) {
            return node__10994.kv_reduce(f, init__10992)
          }else {
            return init__10992
          }
        }
      }();
      if(cljs.core.reduced_QMARK_(init__10995)) {
        return cljs.core.deref(init__10995)
      }else {
        var G__10996 = i__10991 + 2;
        var G__10997 = init__10995;
        i__10991 = G__10996;
        init__10992 = G__10997;
        continue
      }
    }else {
      return init__10992
    }
    break
  }
};
cljs.core.BitmapIndexedNode = function(edit, bitmap, arr) {
  this.edit = edit;
  this.bitmap = bitmap;
  this.arr = arr
};
cljs.core.BitmapIndexedNode.cljs$lang$type = true;
cljs.core.BitmapIndexedNode.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/BitmapIndexedNode")
};
cljs.core.BitmapIndexedNode.prototype.edit_and_remove_pair = function(e, bit, i) {
  var this__10998 = this;
  var inode__10999 = this;
  if(this__10998.bitmap === bit) {
    return null
  }else {
    var editable__11000 = inode__10999.ensure_editable(e);
    var earr__11001 = editable__11000.arr;
    var len__11002 = earr__11001.length;
    editable__11000.bitmap = bit ^ editable__11000.bitmap;
    cljs.core.array_copy(earr__11001, 2 * (i + 1), earr__11001, 2 * i, len__11002 - 2 * (i + 1));
    earr__11001[len__11002 - 2] = null;
    earr__11001[len__11002 - 1] = null;
    return editable__11000
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_assoc_BANG_ = function(edit, shift, hash, key, val, added_leaf_QMARK_) {
  var this__11003 = this;
  var inode__11004 = this;
  var bit__11005 = 1 << (hash >>> shift & 31);
  var idx__11006 = cljs.core.bitmap_indexed_node_index(this__11003.bitmap, bit__11005);
  if((this__11003.bitmap & bit__11005) === 0) {
    var n__11007 = cljs.core.bit_count(this__11003.bitmap);
    if(2 * n__11007 < this__11003.arr.length) {
      var editable__11008 = inode__11004.ensure_editable(edit);
      var earr__11009 = editable__11008.arr;
      added_leaf_QMARK_.val = true;
      cljs.core.array_copy_downward(earr__11009, 2 * idx__11006, earr__11009, 2 * (idx__11006 + 1), 2 * (n__11007 - idx__11006));
      earr__11009[2 * idx__11006] = key;
      earr__11009[2 * idx__11006 + 1] = val;
      editable__11008.bitmap = editable__11008.bitmap | bit__11005;
      return editable__11008
    }else {
      if(n__11007 >= 16) {
        var nodes__11010 = cljs.core.make_array.cljs$lang$arity$1(32);
        var jdx__11011 = hash >>> shift & 31;
        nodes__11010[jdx__11011] = cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_);
        var i__11012 = 0;
        var j__11013 = 0;
        while(true) {
          if(i__11012 < 32) {
            if((this__11003.bitmap >>> i__11012 & 1) === 0) {
              var G__11066 = i__11012 + 1;
              var G__11067 = j__11013;
              i__11012 = G__11066;
              j__11013 = G__11067;
              continue
            }else {
              nodes__11010[i__11012] = !(this__11003.arr[j__11013] == null) ? cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift + 5, cljs.core.hash.cljs$lang$arity$1(this__11003.arr[j__11013]), this__11003.arr[j__11013], this__11003.arr[j__11013 + 1], added_leaf_QMARK_) : this__11003.arr[j__11013 + 1];
              var G__11068 = i__11012 + 1;
              var G__11069 = j__11013 + 2;
              i__11012 = G__11068;
              j__11013 = G__11069;
              continue
            }
          }else {
          }
          break
        }
        return new cljs.core.ArrayNode(edit, n__11007 + 1, nodes__11010)
      }else {
        if("\ufdd0'else") {
          var new_arr__11014 = cljs.core.make_array.cljs$lang$arity$1(2 * (n__11007 + 4));
          cljs.core.array_copy(this__11003.arr, 0, new_arr__11014, 0, 2 * idx__11006);
          new_arr__11014[2 * idx__11006] = key;
          new_arr__11014[2 * idx__11006 + 1] = val;
          cljs.core.array_copy(this__11003.arr, 2 * idx__11006, new_arr__11014, 2 * (idx__11006 + 1), 2 * (n__11007 - idx__11006));
          added_leaf_QMARK_.val = true;
          var editable__11015 = inode__11004.ensure_editable(edit);
          editable__11015.arr = new_arr__11014;
          editable__11015.bitmap = editable__11015.bitmap | bit__11005;
          return editable__11015
        }else {
          return null
        }
      }
    }
  }else {
    var key_or_nil__11016 = this__11003.arr[2 * idx__11006];
    var val_or_node__11017 = this__11003.arr[2 * idx__11006 + 1];
    if(key_or_nil__11016 == null) {
      var n__11018 = val_or_node__11017.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_);
      if(n__11018 === val_or_node__11017) {
        return inode__11004
      }else {
        return cljs.core.edit_and_set.cljs$lang$arity$4(inode__11004, edit, 2 * idx__11006 + 1, n__11018)
      }
    }else {
      if(cljs.core.key_test(key, key_or_nil__11016)) {
        if(val === val_or_node__11017) {
          return inode__11004
        }else {
          return cljs.core.edit_and_set.cljs$lang$arity$4(inode__11004, edit, 2 * idx__11006 + 1, val)
        }
      }else {
        if("\ufdd0'else") {
          added_leaf_QMARK_.val = true;
          return cljs.core.edit_and_set.cljs$lang$arity$6(inode__11004, edit, 2 * idx__11006, null, 2 * idx__11006 + 1, cljs.core.create_node.cljs$lang$arity$7(edit, shift + 5, key_or_nil__11016, val_or_node__11017, hash, key, val))
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_seq = function() {
  var this__11019 = this;
  var inode__11020 = this;
  return cljs.core.create_inode_seq.cljs$lang$arity$1(this__11019.arr)
};
cljs.core.BitmapIndexedNode.prototype.inode_without_BANG_ = function(edit, shift, hash, key, removed_leaf_QMARK_) {
  var this__11021 = this;
  var inode__11022 = this;
  var bit__11023 = 1 << (hash >>> shift & 31);
  if((this__11021.bitmap & bit__11023) === 0) {
    return inode__11022
  }else {
    var idx__11024 = cljs.core.bitmap_indexed_node_index(this__11021.bitmap, bit__11023);
    var key_or_nil__11025 = this__11021.arr[2 * idx__11024];
    var val_or_node__11026 = this__11021.arr[2 * idx__11024 + 1];
    if(key_or_nil__11025 == null) {
      var n__11027 = val_or_node__11026.inode_without_BANG_(edit, shift + 5, hash, key, removed_leaf_QMARK_);
      if(n__11027 === val_or_node__11026) {
        return inode__11022
      }else {
        if(!(n__11027 == null)) {
          return cljs.core.edit_and_set.cljs$lang$arity$4(inode__11022, edit, 2 * idx__11024 + 1, n__11027)
        }else {
          if(this__11021.bitmap === bit__11023) {
            return null
          }else {
            if("\ufdd0'else") {
              return inode__11022.edit_and_remove_pair(edit, bit__11023, idx__11024)
            }else {
              return null
            }
          }
        }
      }
    }else {
      if(cljs.core.key_test(key, key_or_nil__11025)) {
        removed_leaf_QMARK_[0] = true;
        return inode__11022.edit_and_remove_pair(edit, bit__11023, idx__11024)
      }else {
        if("\ufdd0'else") {
          return inode__11022
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.ensure_editable = function(e) {
  var this__11028 = this;
  var inode__11029 = this;
  if(e === this__11028.edit) {
    return inode__11029
  }else {
    var n__11030 = cljs.core.bit_count(this__11028.bitmap);
    var new_arr__11031 = cljs.core.make_array.cljs$lang$arity$1(n__11030 < 0 ? 4 : 2 * (n__11030 + 1));
    cljs.core.array_copy(this__11028.arr, 0, new_arr__11031, 0, 2 * n__11030);
    return new cljs.core.BitmapIndexedNode(e, this__11028.bitmap, new_arr__11031)
  }
};
cljs.core.BitmapIndexedNode.prototype.kv_reduce = function(f, init) {
  var this__11032 = this;
  var inode__11033 = this;
  return cljs.core.inode_kv_reduce(this__11032.arr, f, init)
};
cljs.core.BitmapIndexedNode.prototype.inode_find = function(shift, hash, key, not_found) {
  var this__11034 = this;
  var inode__11035 = this;
  var bit__11036 = 1 << (hash >>> shift & 31);
  if((this__11034.bitmap & bit__11036) === 0) {
    return not_found
  }else {
    var idx__11037 = cljs.core.bitmap_indexed_node_index(this__11034.bitmap, bit__11036);
    var key_or_nil__11038 = this__11034.arr[2 * idx__11037];
    var val_or_node__11039 = this__11034.arr[2 * idx__11037 + 1];
    if(key_or_nil__11038 == null) {
      return val_or_node__11039.inode_find(shift + 5, hash, key, not_found)
    }else {
      if(cljs.core.key_test(key, key_or_nil__11038)) {
        return cljs.core.PersistentVector.fromArray([key_or_nil__11038, val_or_node__11039], true)
      }else {
        if("\ufdd0'else") {
          return not_found
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_without = function(shift, hash, key) {
  var this__11040 = this;
  var inode__11041 = this;
  var bit__11042 = 1 << (hash >>> shift & 31);
  if((this__11040.bitmap & bit__11042) === 0) {
    return inode__11041
  }else {
    var idx__11043 = cljs.core.bitmap_indexed_node_index(this__11040.bitmap, bit__11042);
    var key_or_nil__11044 = this__11040.arr[2 * idx__11043];
    var val_or_node__11045 = this__11040.arr[2 * idx__11043 + 1];
    if(key_or_nil__11044 == null) {
      var n__11046 = val_or_node__11045.inode_without(shift + 5, hash, key);
      if(n__11046 === val_or_node__11045) {
        return inode__11041
      }else {
        if(!(n__11046 == null)) {
          return new cljs.core.BitmapIndexedNode(null, this__11040.bitmap, cljs.core.clone_and_set.cljs$lang$arity$3(this__11040.arr, 2 * idx__11043 + 1, n__11046))
        }else {
          if(this__11040.bitmap === bit__11042) {
            return null
          }else {
            if("\ufdd0'else") {
              return new cljs.core.BitmapIndexedNode(null, this__11040.bitmap ^ bit__11042, cljs.core.remove_pair(this__11040.arr, idx__11043))
            }else {
              return null
            }
          }
        }
      }
    }else {
      if(cljs.core.key_test(key, key_or_nil__11044)) {
        return new cljs.core.BitmapIndexedNode(null, this__11040.bitmap ^ bit__11042, cljs.core.remove_pair(this__11040.arr, idx__11043))
      }else {
        if("\ufdd0'else") {
          return inode__11041
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_assoc = function(shift, hash, key, val, added_leaf_QMARK_) {
  var this__11047 = this;
  var inode__11048 = this;
  var bit__11049 = 1 << (hash >>> shift & 31);
  var idx__11050 = cljs.core.bitmap_indexed_node_index(this__11047.bitmap, bit__11049);
  if((this__11047.bitmap & bit__11049) === 0) {
    var n__11051 = cljs.core.bit_count(this__11047.bitmap);
    if(n__11051 >= 16) {
      var nodes__11052 = cljs.core.make_array.cljs$lang$arity$1(32);
      var jdx__11053 = hash >>> shift & 31;
      nodes__11052[jdx__11053] = cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_);
      var i__11054 = 0;
      var j__11055 = 0;
      while(true) {
        if(i__11054 < 32) {
          if((this__11047.bitmap >>> i__11054 & 1) === 0) {
            var G__11070 = i__11054 + 1;
            var G__11071 = j__11055;
            i__11054 = G__11070;
            j__11055 = G__11071;
            continue
          }else {
            nodes__11052[i__11054] = !(this__11047.arr[j__11055] == null) ? cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift + 5, cljs.core.hash.cljs$lang$arity$1(this__11047.arr[j__11055]), this__11047.arr[j__11055], this__11047.arr[j__11055 + 1], added_leaf_QMARK_) : this__11047.arr[j__11055 + 1];
            var G__11072 = i__11054 + 1;
            var G__11073 = j__11055 + 2;
            i__11054 = G__11072;
            j__11055 = G__11073;
            continue
          }
        }else {
        }
        break
      }
      return new cljs.core.ArrayNode(null, n__11051 + 1, nodes__11052)
    }else {
      var new_arr__11056 = cljs.core.make_array.cljs$lang$arity$1(2 * (n__11051 + 1));
      cljs.core.array_copy(this__11047.arr, 0, new_arr__11056, 0, 2 * idx__11050);
      new_arr__11056[2 * idx__11050] = key;
      new_arr__11056[2 * idx__11050 + 1] = val;
      cljs.core.array_copy(this__11047.arr, 2 * idx__11050, new_arr__11056, 2 * (idx__11050 + 1), 2 * (n__11051 - idx__11050));
      added_leaf_QMARK_.val = true;
      return new cljs.core.BitmapIndexedNode(null, this__11047.bitmap | bit__11049, new_arr__11056)
    }
  }else {
    var key_or_nil__11057 = this__11047.arr[2 * idx__11050];
    var val_or_node__11058 = this__11047.arr[2 * idx__11050 + 1];
    if(key_or_nil__11057 == null) {
      var n__11059 = val_or_node__11058.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_);
      if(n__11059 === val_or_node__11058) {
        return inode__11048
      }else {
        return new cljs.core.BitmapIndexedNode(null, this__11047.bitmap, cljs.core.clone_and_set.cljs$lang$arity$3(this__11047.arr, 2 * idx__11050 + 1, n__11059))
      }
    }else {
      if(cljs.core.key_test(key, key_or_nil__11057)) {
        if(val === val_or_node__11058) {
          return inode__11048
        }else {
          return new cljs.core.BitmapIndexedNode(null, this__11047.bitmap, cljs.core.clone_and_set.cljs$lang$arity$3(this__11047.arr, 2 * idx__11050 + 1, val))
        }
      }else {
        if("\ufdd0'else") {
          added_leaf_QMARK_.val = true;
          return new cljs.core.BitmapIndexedNode(null, this__11047.bitmap, cljs.core.clone_and_set.cljs$lang$arity$5(this__11047.arr, 2 * idx__11050, null, 2 * idx__11050 + 1, cljs.core.create_node.cljs$lang$arity$6(shift + 5, key_or_nil__11057, val_or_node__11058, hash, key, val)))
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_lookup = function(shift, hash, key, not_found) {
  var this__11060 = this;
  var inode__11061 = this;
  var bit__11062 = 1 << (hash >>> shift & 31);
  if((this__11060.bitmap & bit__11062) === 0) {
    return not_found
  }else {
    var idx__11063 = cljs.core.bitmap_indexed_node_index(this__11060.bitmap, bit__11062);
    var key_or_nil__11064 = this__11060.arr[2 * idx__11063];
    var val_or_node__11065 = this__11060.arr[2 * idx__11063 + 1];
    if(key_or_nil__11064 == null) {
      return val_or_node__11065.inode_lookup(shift + 5, hash, key, not_found)
    }else {
      if(cljs.core.key_test(key, key_or_nil__11064)) {
        return val_or_node__11065
      }else {
        if("\ufdd0'else") {
          return not_found
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode;
cljs.core.BitmapIndexedNode.EMPTY = new cljs.core.BitmapIndexedNode(null, 0, cljs.core.make_array.cljs$lang$arity$1(0));
cljs.core.pack_array_node = function pack_array_node(array_node, edit, idx) {
  var arr__11081 = array_node.arr;
  var len__11082 = 2 * (array_node.cnt - 1);
  var new_arr__11083 = cljs.core.make_array.cljs$lang$arity$1(len__11082);
  var i__11084 = 0;
  var j__11085 = 1;
  var bitmap__11086 = 0;
  while(true) {
    if(i__11084 < len__11082) {
      if(function() {
        var and__3822__auto____11087 = !(i__11084 === idx);
        if(and__3822__auto____11087) {
          return!(arr__11081[i__11084] == null)
        }else {
          return and__3822__auto____11087
        }
      }()) {
        new_arr__11083[j__11085] = arr__11081[i__11084];
        var G__11088 = i__11084 + 1;
        var G__11089 = j__11085 + 2;
        var G__11090 = bitmap__11086 | 1 << i__11084;
        i__11084 = G__11088;
        j__11085 = G__11089;
        bitmap__11086 = G__11090;
        continue
      }else {
        var G__11091 = i__11084 + 1;
        var G__11092 = j__11085;
        var G__11093 = bitmap__11086;
        i__11084 = G__11091;
        j__11085 = G__11092;
        bitmap__11086 = G__11093;
        continue
      }
    }else {
      return new cljs.core.BitmapIndexedNode(edit, bitmap__11086, new_arr__11083)
    }
    break
  }
};
cljs.core.ArrayNode = function(edit, cnt, arr) {
  this.edit = edit;
  this.cnt = cnt;
  this.arr = arr
};
cljs.core.ArrayNode.cljs$lang$type = true;
cljs.core.ArrayNode.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/ArrayNode")
};
cljs.core.ArrayNode.prototype.inode_assoc_BANG_ = function(edit, shift, hash, key, val, added_leaf_QMARK_) {
  var this__11094 = this;
  var inode__11095 = this;
  var idx__11096 = hash >>> shift & 31;
  var node__11097 = this__11094.arr[idx__11096];
  if(node__11097 == null) {
    var editable__11098 = cljs.core.edit_and_set.cljs$lang$arity$4(inode__11095, edit, idx__11096, cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_));
    editable__11098.cnt = editable__11098.cnt + 1;
    return editable__11098
  }else {
    var n__11099 = node__11097.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_);
    if(n__11099 === node__11097) {
      return inode__11095
    }else {
      return cljs.core.edit_and_set.cljs$lang$arity$4(inode__11095, edit, idx__11096, n__11099)
    }
  }
};
cljs.core.ArrayNode.prototype.inode_seq = function() {
  var this__11100 = this;
  var inode__11101 = this;
  return cljs.core.create_array_node_seq.cljs$lang$arity$1(this__11100.arr)
};
cljs.core.ArrayNode.prototype.inode_without_BANG_ = function(edit, shift, hash, key, removed_leaf_QMARK_) {
  var this__11102 = this;
  var inode__11103 = this;
  var idx__11104 = hash >>> shift & 31;
  var node__11105 = this__11102.arr[idx__11104];
  if(node__11105 == null) {
    return inode__11103
  }else {
    var n__11106 = node__11105.inode_without_BANG_(edit, shift + 5, hash, key, removed_leaf_QMARK_);
    if(n__11106 === node__11105) {
      return inode__11103
    }else {
      if(n__11106 == null) {
        if(this__11102.cnt <= 8) {
          return cljs.core.pack_array_node(inode__11103, edit, idx__11104)
        }else {
          var editable__11107 = cljs.core.edit_and_set.cljs$lang$arity$4(inode__11103, edit, idx__11104, n__11106);
          editable__11107.cnt = editable__11107.cnt - 1;
          return editable__11107
        }
      }else {
        if("\ufdd0'else") {
          return cljs.core.edit_and_set.cljs$lang$arity$4(inode__11103, edit, idx__11104, n__11106)
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.ArrayNode.prototype.ensure_editable = function(e) {
  var this__11108 = this;
  var inode__11109 = this;
  if(e === this__11108.edit) {
    return inode__11109
  }else {
    return new cljs.core.ArrayNode(e, this__11108.cnt, this__11108.arr.slice())
  }
};
cljs.core.ArrayNode.prototype.kv_reduce = function(f, init) {
  var this__11110 = this;
  var inode__11111 = this;
  var len__11112 = this__11110.arr.length;
  var i__11113 = 0;
  var init__11114 = init;
  while(true) {
    if(i__11113 < len__11112) {
      var node__11115 = this__11110.arr[i__11113];
      if(!(node__11115 == null)) {
        var init__11116 = node__11115.kv_reduce(f, init__11114);
        if(cljs.core.reduced_QMARK_(init__11116)) {
          return cljs.core.deref(init__11116)
        }else {
          var G__11135 = i__11113 + 1;
          var G__11136 = init__11116;
          i__11113 = G__11135;
          init__11114 = G__11136;
          continue
        }
      }else {
        return null
      }
    }else {
      return init__11114
    }
    break
  }
};
cljs.core.ArrayNode.prototype.inode_find = function(shift, hash, key, not_found) {
  var this__11117 = this;
  var inode__11118 = this;
  var idx__11119 = hash >>> shift & 31;
  var node__11120 = this__11117.arr[idx__11119];
  if(!(node__11120 == null)) {
    return node__11120.inode_find(shift + 5, hash, key, not_found)
  }else {
    return not_found
  }
};
cljs.core.ArrayNode.prototype.inode_without = function(shift, hash, key) {
  var this__11121 = this;
  var inode__11122 = this;
  var idx__11123 = hash >>> shift & 31;
  var node__11124 = this__11121.arr[idx__11123];
  if(!(node__11124 == null)) {
    var n__11125 = node__11124.inode_without(shift + 5, hash, key);
    if(n__11125 === node__11124) {
      return inode__11122
    }else {
      if(n__11125 == null) {
        if(this__11121.cnt <= 8) {
          return cljs.core.pack_array_node(inode__11122, null, idx__11123)
        }else {
          return new cljs.core.ArrayNode(null, this__11121.cnt - 1, cljs.core.clone_and_set.cljs$lang$arity$3(this__11121.arr, idx__11123, n__11125))
        }
      }else {
        if("\ufdd0'else") {
          return new cljs.core.ArrayNode(null, this__11121.cnt, cljs.core.clone_and_set.cljs$lang$arity$3(this__11121.arr, idx__11123, n__11125))
        }else {
          return null
        }
      }
    }
  }else {
    return inode__11122
  }
};
cljs.core.ArrayNode.prototype.inode_assoc = function(shift, hash, key, val, added_leaf_QMARK_) {
  var this__11126 = this;
  var inode__11127 = this;
  var idx__11128 = hash >>> shift & 31;
  var node__11129 = this__11126.arr[idx__11128];
  if(node__11129 == null) {
    return new cljs.core.ArrayNode(null, this__11126.cnt + 1, cljs.core.clone_and_set.cljs$lang$arity$3(this__11126.arr, idx__11128, cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_)))
  }else {
    var n__11130 = node__11129.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_);
    if(n__11130 === node__11129) {
      return inode__11127
    }else {
      return new cljs.core.ArrayNode(null, this__11126.cnt, cljs.core.clone_and_set.cljs$lang$arity$3(this__11126.arr, idx__11128, n__11130))
    }
  }
};
cljs.core.ArrayNode.prototype.inode_lookup = function(shift, hash, key, not_found) {
  var this__11131 = this;
  var inode__11132 = this;
  var idx__11133 = hash >>> shift & 31;
  var node__11134 = this__11131.arr[idx__11133];
  if(!(node__11134 == null)) {
    return node__11134.inode_lookup(shift + 5, hash, key, not_found)
  }else {
    return not_found
  }
};
cljs.core.ArrayNode;
cljs.core.hash_collision_node_find_index = function hash_collision_node_find_index(arr, cnt, key) {
  var lim__11139 = 2 * cnt;
  var i__11140 = 0;
  while(true) {
    if(i__11140 < lim__11139) {
      if(cljs.core.key_test(key, arr[i__11140])) {
        return i__11140
      }else {
        var G__11141 = i__11140 + 2;
        i__11140 = G__11141;
        continue
      }
    }else {
      return-1
    }
    break
  }
};
cljs.core.HashCollisionNode = function(edit, collision_hash, cnt, arr) {
  this.edit = edit;
  this.collision_hash = collision_hash;
  this.cnt = cnt;
  this.arr = arr
};
cljs.core.HashCollisionNode.cljs$lang$type = true;
cljs.core.HashCollisionNode.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/HashCollisionNode")
};
cljs.core.HashCollisionNode.prototype.inode_assoc_BANG_ = function(edit, shift, hash, key, val, added_leaf_QMARK_) {
  var this__11142 = this;
  var inode__11143 = this;
  if(hash === this__11142.collision_hash) {
    var idx__11144 = cljs.core.hash_collision_node_find_index(this__11142.arr, this__11142.cnt, key);
    if(idx__11144 === -1) {
      if(this__11142.arr.length > 2 * this__11142.cnt) {
        var editable__11145 = cljs.core.edit_and_set.cljs$lang$arity$6(inode__11143, edit, 2 * this__11142.cnt, key, 2 * this__11142.cnt + 1, val);
        added_leaf_QMARK_.val = true;
        editable__11145.cnt = editable__11145.cnt + 1;
        return editable__11145
      }else {
        var len__11146 = this__11142.arr.length;
        var new_arr__11147 = cljs.core.make_array.cljs$lang$arity$1(len__11146 + 2);
        cljs.core.array_copy(this__11142.arr, 0, new_arr__11147, 0, len__11146);
        new_arr__11147[len__11146] = key;
        new_arr__11147[len__11146 + 1] = val;
        added_leaf_QMARK_.val = true;
        return inode__11143.ensure_editable_array(edit, this__11142.cnt + 1, new_arr__11147)
      }
    }else {
      if(this__11142.arr[idx__11144 + 1] === val) {
        return inode__11143
      }else {
        return cljs.core.edit_and_set.cljs$lang$arity$4(inode__11143, edit, idx__11144 + 1, val)
      }
    }
  }else {
    return(new cljs.core.BitmapIndexedNode(edit, 1 << (this__11142.collision_hash >>> shift & 31), [null, inode__11143, null, null])).inode_assoc_BANG_(edit, shift, hash, key, val, added_leaf_QMARK_)
  }
};
cljs.core.HashCollisionNode.prototype.inode_seq = function() {
  var this__11148 = this;
  var inode__11149 = this;
  return cljs.core.create_inode_seq.cljs$lang$arity$1(this__11148.arr)
};
cljs.core.HashCollisionNode.prototype.inode_without_BANG_ = function(edit, shift, hash, key, removed_leaf_QMARK_) {
  var this__11150 = this;
  var inode__11151 = this;
  var idx__11152 = cljs.core.hash_collision_node_find_index(this__11150.arr, this__11150.cnt, key);
  if(idx__11152 === -1) {
    return inode__11151
  }else {
    removed_leaf_QMARK_[0] = true;
    if(this__11150.cnt === 1) {
      return null
    }else {
      var editable__11153 = inode__11151.ensure_editable(edit);
      var earr__11154 = editable__11153.arr;
      earr__11154[idx__11152] = earr__11154[2 * this__11150.cnt - 2];
      earr__11154[idx__11152 + 1] = earr__11154[2 * this__11150.cnt - 1];
      earr__11154[2 * this__11150.cnt - 1] = null;
      earr__11154[2 * this__11150.cnt - 2] = null;
      editable__11153.cnt = editable__11153.cnt - 1;
      return editable__11153
    }
  }
};
cljs.core.HashCollisionNode.prototype.ensure_editable = function(e) {
  var this__11155 = this;
  var inode__11156 = this;
  if(e === this__11155.edit) {
    return inode__11156
  }else {
    var new_arr__11157 = cljs.core.make_array.cljs$lang$arity$1(2 * (this__11155.cnt + 1));
    cljs.core.array_copy(this__11155.arr, 0, new_arr__11157, 0, 2 * this__11155.cnt);
    return new cljs.core.HashCollisionNode(e, this__11155.collision_hash, this__11155.cnt, new_arr__11157)
  }
};
cljs.core.HashCollisionNode.prototype.kv_reduce = function(f, init) {
  var this__11158 = this;
  var inode__11159 = this;
  return cljs.core.inode_kv_reduce(this__11158.arr, f, init)
};
cljs.core.HashCollisionNode.prototype.inode_find = function(shift, hash, key, not_found) {
  var this__11160 = this;
  var inode__11161 = this;
  var idx__11162 = cljs.core.hash_collision_node_find_index(this__11160.arr, this__11160.cnt, key);
  if(idx__11162 < 0) {
    return not_found
  }else {
    if(cljs.core.key_test(key, this__11160.arr[idx__11162])) {
      return cljs.core.PersistentVector.fromArray([this__11160.arr[idx__11162], this__11160.arr[idx__11162 + 1]], true)
    }else {
      if("\ufdd0'else") {
        return not_found
      }else {
        return null
      }
    }
  }
};
cljs.core.HashCollisionNode.prototype.inode_without = function(shift, hash, key) {
  var this__11163 = this;
  var inode__11164 = this;
  var idx__11165 = cljs.core.hash_collision_node_find_index(this__11163.arr, this__11163.cnt, key);
  if(idx__11165 === -1) {
    return inode__11164
  }else {
    if(this__11163.cnt === 1) {
      return null
    }else {
      if("\ufdd0'else") {
        return new cljs.core.HashCollisionNode(null, this__11163.collision_hash, this__11163.cnt - 1, cljs.core.remove_pair(this__11163.arr, cljs.core.quot(idx__11165, 2)))
      }else {
        return null
      }
    }
  }
};
cljs.core.HashCollisionNode.prototype.inode_assoc = function(shift, hash, key, val, added_leaf_QMARK_) {
  var this__11166 = this;
  var inode__11167 = this;
  if(hash === this__11166.collision_hash) {
    var idx__11168 = cljs.core.hash_collision_node_find_index(this__11166.arr, this__11166.cnt, key);
    if(idx__11168 === -1) {
      var len__11169 = this__11166.arr.length;
      var new_arr__11170 = cljs.core.make_array.cljs$lang$arity$1(len__11169 + 2);
      cljs.core.array_copy(this__11166.arr, 0, new_arr__11170, 0, len__11169);
      new_arr__11170[len__11169] = key;
      new_arr__11170[len__11169 + 1] = val;
      added_leaf_QMARK_.val = true;
      return new cljs.core.HashCollisionNode(null, this__11166.collision_hash, this__11166.cnt + 1, new_arr__11170)
    }else {
      if(cljs.core._EQ_.cljs$lang$arity$2(this__11166.arr[idx__11168], val)) {
        return inode__11167
      }else {
        return new cljs.core.HashCollisionNode(null, this__11166.collision_hash, this__11166.cnt, cljs.core.clone_and_set.cljs$lang$arity$3(this__11166.arr, idx__11168 + 1, val))
      }
    }
  }else {
    return(new cljs.core.BitmapIndexedNode(null, 1 << (this__11166.collision_hash >>> shift & 31), [null, inode__11167])).inode_assoc(shift, hash, key, val, added_leaf_QMARK_)
  }
};
cljs.core.HashCollisionNode.prototype.inode_lookup = function(shift, hash, key, not_found) {
  var this__11171 = this;
  var inode__11172 = this;
  var idx__11173 = cljs.core.hash_collision_node_find_index(this__11171.arr, this__11171.cnt, key);
  if(idx__11173 < 0) {
    return not_found
  }else {
    if(cljs.core.key_test(key, this__11171.arr[idx__11173])) {
      return this__11171.arr[idx__11173 + 1]
    }else {
      if("\ufdd0'else") {
        return not_found
      }else {
        return null
      }
    }
  }
};
cljs.core.HashCollisionNode.prototype.ensure_editable_array = function(e, count, array) {
  var this__11174 = this;
  var inode__11175 = this;
  if(e === this__11174.edit) {
    this__11174.arr = array;
    this__11174.cnt = count;
    return inode__11175
  }else {
    return new cljs.core.HashCollisionNode(this__11174.edit, this__11174.collision_hash, count, array)
  }
};
cljs.core.HashCollisionNode;
cljs.core.create_node = function() {
  var create_node = null;
  var create_node__6 = function(shift, key1, val1, key2hash, key2, val2) {
    var key1hash__11180 = cljs.core.hash.cljs$lang$arity$1(key1);
    if(key1hash__11180 === key2hash) {
      return new cljs.core.HashCollisionNode(null, key1hash__11180, 2, [key1, val1, key2, val2])
    }else {
      var added_leaf_QMARK___11181 = new cljs.core.Box(false);
      return cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift, key1hash__11180, key1, val1, added_leaf_QMARK___11181).inode_assoc(shift, key2hash, key2, val2, added_leaf_QMARK___11181)
    }
  };
  var create_node__7 = function(edit, shift, key1, val1, key2hash, key2, val2) {
    var key1hash__11182 = cljs.core.hash.cljs$lang$arity$1(key1);
    if(key1hash__11182 === key2hash) {
      return new cljs.core.HashCollisionNode(null, key1hash__11182, 2, [key1, val1, key2, val2])
    }else {
      var added_leaf_QMARK___11183 = new cljs.core.Box(false);
      return cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift, key1hash__11182, key1, val1, added_leaf_QMARK___11183).inode_assoc_BANG_(edit, shift, key2hash, key2, val2, added_leaf_QMARK___11183)
    }
  };
  create_node = function(edit, shift, key1, val1, key2hash, key2, val2) {
    switch(arguments.length) {
      case 6:
        return create_node__6.call(this, edit, shift, key1, val1, key2hash, key2);
      case 7:
        return create_node__7.call(this, edit, shift, key1, val1, key2hash, key2, val2)
    }
    throw"Invalid arity: " + arguments.length;
  };
  create_node.cljs$lang$arity$6 = create_node__6;
  create_node.cljs$lang$arity$7 = create_node__7;
  return create_node
}();
cljs.core.NodeSeq = function(meta, nodes, i, s, __hash) {
  this.meta = meta;
  this.nodes = nodes;
  this.i = i;
  this.s = s;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31850572
};
cljs.core.NodeSeq.cljs$lang$type = true;
cljs.core.NodeSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/NodeSeq")
};
cljs.core.NodeSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__11184 = this;
  var h__2192__auto____11185 = this__11184.__hash;
  if(!(h__2192__auto____11185 == null)) {
    return h__2192__auto____11185
  }else {
    var h__2192__auto____11186 = cljs.core.hash_coll(coll);
    this__11184.__hash = h__2192__auto____11186;
    return h__2192__auto____11186
  }
};
cljs.core.NodeSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__11187 = this;
  return cljs.core.cons(o, coll)
};
cljs.core.NodeSeq.prototype.toString = function() {
  var this__11188 = this;
  var this__11189 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__11189], 0))
};
cljs.core.NodeSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__11190 = this;
  return this$
};
cljs.core.NodeSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__11191 = this;
  if(this__11191.s == null) {
    return cljs.core.PersistentVector.fromArray([this__11191.nodes[this__11191.i], this__11191.nodes[this__11191.i + 1]], true)
  }else {
    return cljs.core.first(this__11191.s)
  }
};
cljs.core.NodeSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__11192 = this;
  if(this__11192.s == null) {
    return cljs.core.create_inode_seq.cljs$lang$arity$3(this__11192.nodes, this__11192.i + 2, null)
  }else {
    return cljs.core.create_inode_seq.cljs$lang$arity$3(this__11192.nodes, this__11192.i, cljs.core.next(this__11192.s))
  }
};
cljs.core.NodeSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11193 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.NodeSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11194 = this;
  return new cljs.core.NodeSeq(meta, this__11194.nodes, this__11194.i, this__11194.s, this__11194.__hash)
};
cljs.core.NodeSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11195 = this;
  return this__11195.meta
};
cljs.core.NodeSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__11196 = this;
  return cljs.core.with_meta(cljs.core.List.EMPTY, this__11196.meta)
};
cljs.core.NodeSeq;
cljs.core.create_inode_seq = function() {
  var create_inode_seq = null;
  var create_inode_seq__1 = function(nodes) {
    return create_inode_seq.cljs$lang$arity$3(nodes, 0, null)
  };
  var create_inode_seq__3 = function(nodes, i, s) {
    if(s == null) {
      var len__11203 = nodes.length;
      var j__11204 = i;
      while(true) {
        if(j__11204 < len__11203) {
          if(!(nodes[j__11204] == null)) {
            return new cljs.core.NodeSeq(null, nodes, j__11204, null, null)
          }else {
            var temp__3971__auto____11205 = nodes[j__11204 + 1];
            if(cljs.core.truth_(temp__3971__auto____11205)) {
              var node__11206 = temp__3971__auto____11205;
              var temp__3971__auto____11207 = node__11206.inode_seq();
              if(cljs.core.truth_(temp__3971__auto____11207)) {
                var node_seq__11208 = temp__3971__auto____11207;
                return new cljs.core.NodeSeq(null, nodes, j__11204 + 2, node_seq__11208, null)
              }else {
                var G__11209 = j__11204 + 2;
                j__11204 = G__11209;
                continue
              }
            }else {
              var G__11210 = j__11204 + 2;
              j__11204 = G__11210;
              continue
            }
          }
        }else {
          return null
        }
        break
      }
    }else {
      return new cljs.core.NodeSeq(null, nodes, i, s, null)
    }
  };
  create_inode_seq = function(nodes, i, s) {
    switch(arguments.length) {
      case 1:
        return create_inode_seq__1.call(this, nodes);
      case 3:
        return create_inode_seq__3.call(this, nodes, i, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  create_inode_seq.cljs$lang$arity$1 = create_inode_seq__1;
  create_inode_seq.cljs$lang$arity$3 = create_inode_seq__3;
  return create_inode_seq
}();
cljs.core.ArrayNodeSeq = function(meta, nodes, i, s, __hash) {
  this.meta = meta;
  this.nodes = nodes;
  this.i = i;
  this.s = s;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31850572
};
cljs.core.ArrayNodeSeq.cljs$lang$type = true;
cljs.core.ArrayNodeSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/ArrayNodeSeq")
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__11211 = this;
  var h__2192__auto____11212 = this__11211.__hash;
  if(!(h__2192__auto____11212 == null)) {
    return h__2192__auto____11212
  }else {
    var h__2192__auto____11213 = cljs.core.hash_coll(coll);
    this__11211.__hash = h__2192__auto____11213;
    return h__2192__auto____11213
  }
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__11214 = this;
  return cljs.core.cons(o, coll)
};
cljs.core.ArrayNodeSeq.prototype.toString = function() {
  var this__11215 = this;
  var this__11216 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__11216], 0))
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__11217 = this;
  return this$
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__11218 = this;
  return cljs.core.first(this__11218.s)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__11219 = this;
  return cljs.core.create_array_node_seq.cljs$lang$arity$4(null, this__11219.nodes, this__11219.i, cljs.core.next(this__11219.s))
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11220 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11221 = this;
  return new cljs.core.ArrayNodeSeq(meta, this__11221.nodes, this__11221.i, this__11221.s, this__11221.__hash)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11222 = this;
  return this__11222.meta
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__11223 = this;
  return cljs.core.with_meta(cljs.core.List.EMPTY, this__11223.meta)
};
cljs.core.ArrayNodeSeq;
cljs.core.create_array_node_seq = function() {
  var create_array_node_seq = null;
  var create_array_node_seq__1 = function(nodes) {
    return create_array_node_seq.cljs$lang$arity$4(null, nodes, 0, null)
  };
  var create_array_node_seq__4 = function(meta, nodes, i, s) {
    if(s == null) {
      var len__11230 = nodes.length;
      var j__11231 = i;
      while(true) {
        if(j__11231 < len__11230) {
          var temp__3971__auto____11232 = nodes[j__11231];
          if(cljs.core.truth_(temp__3971__auto____11232)) {
            var nj__11233 = temp__3971__auto____11232;
            var temp__3971__auto____11234 = nj__11233.inode_seq();
            if(cljs.core.truth_(temp__3971__auto____11234)) {
              var ns__11235 = temp__3971__auto____11234;
              return new cljs.core.ArrayNodeSeq(meta, nodes, j__11231 + 1, ns__11235, null)
            }else {
              var G__11236 = j__11231 + 1;
              j__11231 = G__11236;
              continue
            }
          }else {
            var G__11237 = j__11231 + 1;
            j__11231 = G__11237;
            continue
          }
        }else {
          return null
        }
        break
      }
    }else {
      return new cljs.core.ArrayNodeSeq(meta, nodes, i, s, null)
    }
  };
  create_array_node_seq = function(meta, nodes, i, s) {
    switch(arguments.length) {
      case 1:
        return create_array_node_seq__1.call(this, meta);
      case 4:
        return create_array_node_seq__4.call(this, meta, nodes, i, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  create_array_node_seq.cljs$lang$arity$1 = create_array_node_seq__1;
  create_array_node_seq.cljs$lang$arity$4 = create_array_node_seq__4;
  return create_array_node_seq
}();
cljs.core.PersistentHashMap = function(meta, cnt, root, has_nil_QMARK_, nil_val, __hash) {
  this.meta = meta;
  this.cnt = cnt;
  this.root = root;
  this.has_nil_QMARK_ = has_nil_QMARK_;
  this.nil_val = nil_val;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 1;
  this.cljs$lang$protocol_mask$partition0$ = 16123663
};
cljs.core.PersistentHashMap.cljs$lang$type = true;
cljs.core.PersistentHashMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/PersistentHashMap")
};
cljs.core.PersistentHashMap.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__11240 = this;
  return new cljs.core.TransientHashMap({}, this__11240.root, this__11240.cnt, this__11240.has_nil_QMARK_, this__11240.nil_val)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__11241 = this;
  var h__2192__auto____11242 = this__11241.__hash;
  if(!(h__2192__auto____11242 == null)) {
    return h__2192__auto____11242
  }else {
    var h__2192__auto____11243 = cljs.core.hash_imap(coll);
    this__11241.__hash = h__2192__auto____11243;
    return h__2192__auto____11243
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__11244 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.PersistentHashMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__11245 = this;
  if(k == null) {
    if(this__11245.has_nil_QMARK_) {
      return this__11245.nil_val
    }else {
      return not_found
    }
  }else {
    if(this__11245.root == null) {
      return not_found
    }else {
      if("\ufdd0'else") {
        return this__11245.root.inode_lookup(0, cljs.core.hash.cljs$lang$arity$1(k), k, not_found)
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__11246 = this;
  if(k == null) {
    if(function() {
      var and__3822__auto____11247 = this__11246.has_nil_QMARK_;
      if(and__3822__auto____11247) {
        return v === this__11246.nil_val
      }else {
        return and__3822__auto____11247
      }
    }()) {
      return coll
    }else {
      return new cljs.core.PersistentHashMap(this__11246.meta, this__11246.has_nil_QMARK_ ? this__11246.cnt : this__11246.cnt + 1, this__11246.root, true, v, null)
    }
  }else {
    var added_leaf_QMARK___11248 = new cljs.core.Box(false);
    var new_root__11249 = (this__11246.root == null ? cljs.core.BitmapIndexedNode.EMPTY : this__11246.root).inode_assoc(0, cljs.core.hash.cljs$lang$arity$1(k), k, v, added_leaf_QMARK___11248);
    if(new_root__11249 === this__11246.root) {
      return coll
    }else {
      return new cljs.core.PersistentHashMap(this__11246.meta, added_leaf_QMARK___11248.val ? this__11246.cnt + 1 : this__11246.cnt, new_root__11249, this__11246.has_nil_QMARK_, this__11246.nil_val, null)
    }
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__11250 = this;
  if(k == null) {
    return this__11250.has_nil_QMARK_
  }else {
    if(this__11250.root == null) {
      return false
    }else {
      if("\ufdd0'else") {
        return!(this__11250.root.inode_lookup(0, cljs.core.hash.cljs$lang$arity$1(k), k, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel)
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap.prototype.call = function() {
  var G__11273 = null;
  var G__11273__2 = function(this_sym11251, k) {
    var this__11253 = this;
    var this_sym11251__11254 = this;
    var coll__11255 = this_sym11251__11254;
    return coll__11255.cljs$core$ILookup$_lookup$arity$2(coll__11255, k)
  };
  var G__11273__3 = function(this_sym11252, k, not_found) {
    var this__11253 = this;
    var this_sym11252__11256 = this;
    var coll__11257 = this_sym11252__11256;
    return coll__11257.cljs$core$ILookup$_lookup$arity$3(coll__11257, k, not_found)
  };
  G__11273 = function(this_sym11252, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11273__2.call(this, this_sym11252, k);
      case 3:
        return G__11273__3.call(this, this_sym11252, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11273
}();
cljs.core.PersistentHashMap.prototype.apply = function(this_sym11238, args11239) {
  var this__11258 = this;
  return this_sym11238.call.apply(this_sym11238, [this_sym11238].concat(args11239.slice()))
};
cljs.core.PersistentHashMap.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(coll, f, init) {
  var this__11259 = this;
  var init__11260 = this__11259.has_nil_QMARK_ ? f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(init, null, this__11259.nil_val) : f.call(null, init, null, this__11259.nil_val) : init;
  if(cljs.core.reduced_QMARK_(init__11260)) {
    return cljs.core.deref(init__11260)
  }else {
    if(!(this__11259.root == null)) {
      return this__11259.root.kv_reduce(f, init__11260)
    }else {
      if("\ufdd0'else") {
        return init__11260
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__11261 = this;
  if(cljs.core.vector_QMARK_(entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.cljs$lang$arity$2(entry, 0), cljs.core._nth.cljs$lang$arity$2(entry, 1))
  }else {
    return cljs.core.reduce.cljs$lang$arity$3(cljs.core._conj, coll, entry)
  }
};
cljs.core.PersistentHashMap.prototype.toString = function() {
  var this__11262 = this;
  var this__11263 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__11263], 0))
};
cljs.core.PersistentHashMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__11264 = this;
  if(this__11264.cnt > 0) {
    var s__11265 = !(this__11264.root == null) ? this__11264.root.inode_seq() : null;
    if(this__11264.has_nil_QMARK_) {
      return cljs.core.cons(cljs.core.PersistentVector.fromArray([null, this__11264.nil_val], true), s__11265)
    }else {
      return s__11265
    }
  }else {
    return null
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__11266 = this;
  return this__11266.cnt
};
cljs.core.PersistentHashMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11267 = this;
  return cljs.core.equiv_map(coll, other)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11268 = this;
  return new cljs.core.PersistentHashMap(meta, this__11268.cnt, this__11268.root, this__11268.has_nil_QMARK_, this__11268.nil_val, this__11268.__hash)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11269 = this;
  return this__11269.meta
};
cljs.core.PersistentHashMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__11270 = this;
  return cljs.core._with_meta(cljs.core.PersistentHashMap.EMPTY, this__11270.meta)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__11271 = this;
  if(k == null) {
    if(this__11271.has_nil_QMARK_) {
      return new cljs.core.PersistentHashMap(this__11271.meta, this__11271.cnt - 1, this__11271.root, false, null, null)
    }else {
      return coll
    }
  }else {
    if(this__11271.root == null) {
      return coll
    }else {
      if("\ufdd0'else") {
        var new_root__11272 = this__11271.root.inode_without(0, cljs.core.hash.cljs$lang$arity$1(k), k);
        if(new_root__11272 === this__11271.root) {
          return coll
        }else {
          return new cljs.core.PersistentHashMap(this__11271.meta, this__11271.cnt - 1, new_root__11272, this__11271.has_nil_QMARK_, this__11271.nil_val, null)
        }
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap;
cljs.core.PersistentHashMap.EMPTY = new cljs.core.PersistentHashMap(null, 0, null, false, null, 0);
cljs.core.PersistentHashMap.fromArrays = function(ks, vs) {
  var len__11274 = ks.length;
  var i__11275 = 0;
  var out__11276 = cljs.core.transient$(cljs.core.PersistentHashMap.EMPTY);
  while(true) {
    if(i__11275 < len__11274) {
      var G__11277 = i__11275 + 1;
      var G__11278 = cljs.core.assoc_BANG_(out__11276, ks[i__11275], vs[i__11275]);
      i__11275 = G__11277;
      out__11276 = G__11278;
      continue
    }else {
      return cljs.core.persistent_BANG_(out__11276)
    }
    break
  }
};
cljs.core.TransientHashMap = function(edit, root, count, has_nil_QMARK_, nil_val) {
  this.edit = edit;
  this.root = root;
  this.count = count;
  this.has_nil_QMARK_ = has_nil_QMARK_;
  this.nil_val = nil_val;
  this.cljs$lang$protocol_mask$partition1$ = 14;
  this.cljs$lang$protocol_mask$partition0$ = 258
};
cljs.core.TransientHashMap.cljs$lang$type = true;
cljs.core.TransientHashMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/TransientHashMap")
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientMap$_dissoc_BANG_$arity$2 = function(tcoll, key) {
  var this__11279 = this;
  return tcoll.without_BANG_(key)
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3 = function(tcoll, key, val) {
  var this__11280 = this;
  return tcoll.assoc_BANG_(key, val)
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, val) {
  var this__11281 = this;
  return tcoll.conj_BANG_(val)
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__11282 = this;
  return tcoll.persistent_BANG_()
};
cljs.core.TransientHashMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(tcoll, k) {
  var this__11283 = this;
  if(k == null) {
    if(this__11283.has_nil_QMARK_) {
      return this__11283.nil_val
    }else {
      return null
    }
  }else {
    if(this__11283.root == null) {
      return null
    }else {
      return this__11283.root.inode_lookup(0, cljs.core.hash.cljs$lang$arity$1(k), k)
    }
  }
};
cljs.core.TransientHashMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(tcoll, k, not_found) {
  var this__11284 = this;
  if(k == null) {
    if(this__11284.has_nil_QMARK_) {
      return this__11284.nil_val
    }else {
      return not_found
    }
  }else {
    if(this__11284.root == null) {
      return not_found
    }else {
      return this__11284.root.inode_lookup(0, cljs.core.hash.cljs$lang$arity$1(k), k, not_found)
    }
  }
};
cljs.core.TransientHashMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__11285 = this;
  if(this__11285.edit) {
    return this__11285.count
  }else {
    throw new Error("count after persistent!");
  }
};
cljs.core.TransientHashMap.prototype.conj_BANG_ = function(o) {
  var this__11286 = this;
  var tcoll__11287 = this;
  if(this__11286.edit) {
    if(function() {
      var G__11288__11289 = o;
      if(G__11288__11289) {
        if(function() {
          var or__3824__auto____11290 = G__11288__11289.cljs$lang$protocol_mask$partition0$ & 2048;
          if(or__3824__auto____11290) {
            return or__3824__auto____11290
          }else {
            return G__11288__11289.cljs$core$IMapEntry$
          }
        }()) {
          return true
        }else {
          if(!G__11288__11289.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_(cljs.core.IMapEntry, G__11288__11289)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_(cljs.core.IMapEntry, G__11288__11289)
      }
    }()) {
      return tcoll__11287.assoc_BANG_(cljs.core.key(o), cljs.core.val(o))
    }else {
      var es__11291 = cljs.core.seq(o);
      var tcoll__11292 = tcoll__11287;
      while(true) {
        var temp__3971__auto____11293 = cljs.core.first(es__11291);
        if(cljs.core.truth_(temp__3971__auto____11293)) {
          var e__11294 = temp__3971__auto____11293;
          var G__11305 = cljs.core.next(es__11291);
          var G__11306 = tcoll__11292.assoc_BANG_(cljs.core.key(e__11294), cljs.core.val(e__11294));
          es__11291 = G__11305;
          tcoll__11292 = G__11306;
          continue
        }else {
          return tcoll__11292
        }
        break
      }
    }
  }else {
    throw new Error("conj! after persistent");
  }
};
cljs.core.TransientHashMap.prototype.assoc_BANG_ = function(k, v) {
  var this__11295 = this;
  var tcoll__11296 = this;
  if(this__11295.edit) {
    if(k == null) {
      if(this__11295.nil_val === v) {
      }else {
        this__11295.nil_val = v
      }
      if(this__11295.has_nil_QMARK_) {
      }else {
        this__11295.count = this__11295.count + 1;
        this__11295.has_nil_QMARK_ = true
      }
      return tcoll__11296
    }else {
      var added_leaf_QMARK___11297 = new cljs.core.Box(false);
      var node__11298 = (this__11295.root == null ? cljs.core.BitmapIndexedNode.EMPTY : this__11295.root).inode_assoc_BANG_(this__11295.edit, 0, cljs.core.hash.cljs$lang$arity$1(k), k, v, added_leaf_QMARK___11297);
      if(node__11298 === this__11295.root) {
      }else {
        this__11295.root = node__11298
      }
      if(added_leaf_QMARK___11297.val) {
        this__11295.count = this__11295.count + 1
      }else {
      }
      return tcoll__11296
    }
  }else {
    throw new Error("assoc! after persistent!");
  }
};
cljs.core.TransientHashMap.prototype.without_BANG_ = function(k) {
  var this__11299 = this;
  var tcoll__11300 = this;
  if(this__11299.edit) {
    if(k == null) {
      if(this__11299.has_nil_QMARK_) {
        this__11299.has_nil_QMARK_ = false;
        this__11299.nil_val = null;
        this__11299.count = this__11299.count - 1;
        return tcoll__11300
      }else {
        return tcoll__11300
      }
    }else {
      if(this__11299.root == null) {
        return tcoll__11300
      }else {
        var removed_leaf_QMARK___11301 = new cljs.core.Box(false);
        var node__11302 = this__11299.root.inode_without_BANG_(this__11299.edit, 0, cljs.core.hash.cljs$lang$arity$1(k), k, removed_leaf_QMARK___11301);
        if(node__11302 === this__11299.root) {
        }else {
          this__11299.root = node__11302
        }
        if(cljs.core.truth_(removed_leaf_QMARK___11301[0])) {
          this__11299.count = this__11299.count - 1
        }else {
        }
        return tcoll__11300
      }
    }
  }else {
    throw new Error("dissoc! after persistent!");
  }
};
cljs.core.TransientHashMap.prototype.persistent_BANG_ = function() {
  var this__11303 = this;
  var tcoll__11304 = this;
  if(this__11303.edit) {
    this__11303.edit = null;
    return new cljs.core.PersistentHashMap(null, this__11303.count, this__11303.root, this__11303.has_nil_QMARK_, this__11303.nil_val, null)
  }else {
    throw new Error("persistent! called twice");
  }
};
cljs.core.TransientHashMap;
cljs.core.tree_map_seq_push = function tree_map_seq_push(node, stack, ascending_QMARK_) {
  var t__11309 = node;
  var stack__11310 = stack;
  while(true) {
    if(!(t__11309 == null)) {
      var G__11311 = ascending_QMARK_ ? t__11309.left : t__11309.right;
      var G__11312 = cljs.core.conj.cljs$lang$arity$2(stack__11310, t__11309);
      t__11309 = G__11311;
      stack__11310 = G__11312;
      continue
    }else {
      return stack__11310
    }
    break
  }
};
cljs.core.PersistentTreeMapSeq = function(meta, stack, ascending_QMARK_, cnt, __hash) {
  this.meta = meta;
  this.stack = stack;
  this.ascending_QMARK_ = ascending_QMARK_;
  this.cnt = cnt;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31850570
};
cljs.core.PersistentTreeMapSeq.cljs$lang$type = true;
cljs.core.PersistentTreeMapSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/PersistentTreeMapSeq")
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__11313 = this;
  var h__2192__auto____11314 = this__11313.__hash;
  if(!(h__2192__auto____11314 == null)) {
    return h__2192__auto____11314
  }else {
    var h__2192__auto____11315 = cljs.core.hash_coll(coll);
    this__11313.__hash = h__2192__auto____11315;
    return h__2192__auto____11315
  }
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__11316 = this;
  return cljs.core.cons(o, coll)
};
cljs.core.PersistentTreeMapSeq.prototype.toString = function() {
  var this__11317 = this;
  var this__11318 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__11318], 0))
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__11319 = this;
  return this$
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__11320 = this;
  if(this__11320.cnt < 0) {
    return cljs.core.count(cljs.core.next(coll)) + 1
  }else {
    return this__11320.cnt
  }
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(this$) {
  var this__11321 = this;
  return cljs.core.peek(this__11321.stack)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(this$) {
  var this__11322 = this;
  var t__11323 = cljs.core.first(this__11322.stack);
  var next_stack__11324 = cljs.core.tree_map_seq_push(this__11322.ascending_QMARK_ ? t__11323.right : t__11323.left, cljs.core.next(this__11322.stack), this__11322.ascending_QMARK_);
  if(!(next_stack__11324 == null)) {
    return new cljs.core.PersistentTreeMapSeq(null, next_stack__11324, this__11322.ascending_QMARK_, this__11322.cnt - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11325 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11326 = this;
  return new cljs.core.PersistentTreeMapSeq(meta, this__11326.stack, this__11326.ascending_QMARK_, this__11326.cnt, this__11326.__hash)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11327 = this;
  return this__11327.meta
};
cljs.core.PersistentTreeMapSeq;
cljs.core.create_tree_map_seq = function create_tree_map_seq(tree, ascending_QMARK_, cnt) {
  return new cljs.core.PersistentTreeMapSeq(null, cljs.core.tree_map_seq_push(tree, null, ascending_QMARK_), ascending_QMARK_, cnt, null)
};
cljs.core.balance_left = function balance_left(key, val, ins, right) {
  if(cljs.core.instance_QMARK_(cljs.core.RedNode, ins)) {
    if(cljs.core.instance_QMARK_(cljs.core.RedNode, ins.left)) {
      return new cljs.core.RedNode(ins.key, ins.val, ins.left.blacken(), new cljs.core.BlackNode(key, val, ins.right, right, null), null)
    }else {
      if(cljs.core.instance_QMARK_(cljs.core.RedNode, ins.right)) {
        return new cljs.core.RedNode(ins.right.key, ins.right.val, new cljs.core.BlackNode(ins.key, ins.val, ins.left, ins.right.left, null), new cljs.core.BlackNode(key, val, ins.right.right, right, null), null)
      }else {
        if("\ufdd0'else") {
          return new cljs.core.BlackNode(key, val, ins, right, null)
        }else {
          return null
        }
      }
    }
  }else {
    return new cljs.core.BlackNode(key, val, ins, right, null)
  }
};
cljs.core.balance_right = function balance_right(key, val, left, ins) {
  if(cljs.core.instance_QMARK_(cljs.core.RedNode, ins)) {
    if(cljs.core.instance_QMARK_(cljs.core.RedNode, ins.right)) {
      return new cljs.core.RedNode(ins.key, ins.val, new cljs.core.BlackNode(key, val, left, ins.left, null), ins.right.blacken(), null)
    }else {
      if(cljs.core.instance_QMARK_(cljs.core.RedNode, ins.left)) {
        return new cljs.core.RedNode(ins.left.key, ins.left.val, new cljs.core.BlackNode(key, val, left, ins.left.left, null), new cljs.core.BlackNode(ins.key, ins.val, ins.left.right, ins.right, null), null)
      }else {
        if("\ufdd0'else") {
          return new cljs.core.BlackNode(key, val, left, ins, null)
        }else {
          return null
        }
      }
    }
  }else {
    return new cljs.core.BlackNode(key, val, left, ins, null)
  }
};
cljs.core.balance_left_del = function balance_left_del(key, val, del, right) {
  if(cljs.core.instance_QMARK_(cljs.core.RedNode, del)) {
    return new cljs.core.RedNode(key, val, del.blacken(), right, null)
  }else {
    if(cljs.core.instance_QMARK_(cljs.core.BlackNode, right)) {
      return cljs.core.balance_right(key, val, del, right.redden())
    }else {
      if(function() {
        var and__3822__auto____11329 = cljs.core.instance_QMARK_(cljs.core.RedNode, right);
        if(and__3822__auto____11329) {
          return cljs.core.instance_QMARK_(cljs.core.BlackNode, right.left)
        }else {
          return and__3822__auto____11329
        }
      }()) {
        return new cljs.core.RedNode(right.left.key, right.left.val, new cljs.core.BlackNode(key, val, del, right.left.left, null), cljs.core.balance_right(right.key, right.val, right.left.right, right.right.redden()), null)
      }else {
        if("\ufdd0'else") {
          throw new Error("red-black tree invariant violation");
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.balance_right_del = function balance_right_del(key, val, left, del) {
  if(cljs.core.instance_QMARK_(cljs.core.RedNode, del)) {
    return new cljs.core.RedNode(key, val, left, del.blacken(), null)
  }else {
    if(cljs.core.instance_QMARK_(cljs.core.BlackNode, left)) {
      return cljs.core.balance_left(key, val, left.redden(), del)
    }else {
      if(function() {
        var and__3822__auto____11331 = cljs.core.instance_QMARK_(cljs.core.RedNode, left);
        if(and__3822__auto____11331) {
          return cljs.core.instance_QMARK_(cljs.core.BlackNode, left.right)
        }else {
          return and__3822__auto____11331
        }
      }()) {
        return new cljs.core.RedNode(left.right.key, left.right.val, cljs.core.balance_left(left.key, left.val, left.left.redden(), left.right.left), new cljs.core.BlackNode(key, val, left.right.right, del, null), null)
      }else {
        if("\ufdd0'else") {
          throw new Error("red-black tree invariant violation");
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.tree_map_kv_reduce = function tree_map_kv_reduce(node, f, init) {
  var init__11335 = f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(init, node.key, node.val) : f.call(null, init, node.key, node.val);
  if(cljs.core.reduced_QMARK_(init__11335)) {
    return cljs.core.deref(init__11335)
  }else {
    var init__11336 = !(node.left == null) ? tree_map_kv_reduce(node.left, f, init__11335) : init__11335;
    if(cljs.core.reduced_QMARK_(init__11336)) {
      return cljs.core.deref(init__11336)
    }else {
      var init__11337 = !(node.right == null) ? tree_map_kv_reduce(node.right, f, init__11336) : init__11336;
      if(cljs.core.reduced_QMARK_(init__11337)) {
        return cljs.core.deref(init__11337)
      }else {
        return init__11337
      }
    }
  }
};
cljs.core.BlackNode = function(key, val, left, right, __hash) {
  this.key = key;
  this.val = val;
  this.left = left;
  this.right = right;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32402207
};
cljs.core.BlackNode.cljs$lang$type = true;
cljs.core.BlackNode.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/BlackNode")
};
cljs.core.BlackNode.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__11340 = this;
  var h__2192__auto____11341 = this__11340.__hash;
  if(!(h__2192__auto____11341 == null)) {
    return h__2192__auto____11341
  }else {
    var h__2192__auto____11342 = cljs.core.hash_coll(coll);
    this__11340.__hash = h__2192__auto____11342;
    return h__2192__auto____11342
  }
};
cljs.core.BlackNode.prototype.cljs$core$ILookup$_lookup$arity$2 = function(node, k) {
  var this__11343 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, null)
};
cljs.core.BlackNode.prototype.cljs$core$ILookup$_lookup$arity$3 = function(node, k, not_found) {
  var this__11344 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, not_found)
};
cljs.core.BlackNode.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(node, k, v) {
  var this__11345 = this;
  return cljs.core.assoc.cljs$lang$arity$3(cljs.core.PersistentVector.fromArray([this__11345.key, this__11345.val], true), k, v)
};
cljs.core.BlackNode.prototype.call = function() {
  var G__11393 = null;
  var G__11393__2 = function(this_sym11346, k) {
    var this__11348 = this;
    var this_sym11346__11349 = this;
    var node__11350 = this_sym11346__11349;
    return node__11350.cljs$core$ILookup$_lookup$arity$2(node__11350, k)
  };
  var G__11393__3 = function(this_sym11347, k, not_found) {
    var this__11348 = this;
    var this_sym11347__11351 = this;
    var node__11352 = this_sym11347__11351;
    return node__11352.cljs$core$ILookup$_lookup$arity$3(node__11352, k, not_found)
  };
  G__11393 = function(this_sym11347, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11393__2.call(this, this_sym11347, k);
      case 3:
        return G__11393__3.call(this, this_sym11347, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11393
}();
cljs.core.BlackNode.prototype.apply = function(this_sym11338, args11339) {
  var this__11353 = this;
  return this_sym11338.call.apply(this_sym11338, [this_sym11338].concat(args11339.slice()))
};
cljs.core.BlackNode.prototype.cljs$core$ICollection$_conj$arity$2 = function(node, o) {
  var this__11354 = this;
  return cljs.core.PersistentVector.fromArray([this__11354.key, this__11354.val, o], true)
};
cljs.core.BlackNode.prototype.cljs$core$IMapEntry$_key$arity$1 = function(node) {
  var this__11355 = this;
  return this__11355.key
};
cljs.core.BlackNode.prototype.cljs$core$IMapEntry$_val$arity$1 = function(node) {
  var this__11356 = this;
  return this__11356.val
};
cljs.core.BlackNode.prototype.add_right = function(ins) {
  var this__11357 = this;
  var node__11358 = this;
  return ins.balance_right(node__11358)
};
cljs.core.BlackNode.prototype.redden = function() {
  var this__11359 = this;
  var node__11360 = this;
  return new cljs.core.RedNode(this__11359.key, this__11359.val, this__11359.left, this__11359.right, null)
};
cljs.core.BlackNode.prototype.remove_right = function(del) {
  var this__11361 = this;
  var node__11362 = this;
  return cljs.core.balance_right_del(this__11361.key, this__11361.val, this__11361.left, del)
};
cljs.core.BlackNode.prototype.replace = function(key, val, left, right) {
  var this__11363 = this;
  var node__11364 = this;
  return new cljs.core.BlackNode(key, val, left, right, null)
};
cljs.core.BlackNode.prototype.kv_reduce = function(f, init) {
  var this__11365 = this;
  var node__11366 = this;
  return cljs.core.tree_map_kv_reduce(node__11366, f, init)
};
cljs.core.BlackNode.prototype.remove_left = function(del) {
  var this__11367 = this;
  var node__11368 = this;
  return cljs.core.balance_left_del(this__11367.key, this__11367.val, del, this__11367.right)
};
cljs.core.BlackNode.prototype.add_left = function(ins) {
  var this__11369 = this;
  var node__11370 = this;
  return ins.balance_left(node__11370)
};
cljs.core.BlackNode.prototype.balance_left = function(parent) {
  var this__11371 = this;
  var node__11372 = this;
  return new cljs.core.BlackNode(parent.key, parent.val, node__11372, parent.right, null)
};
cljs.core.BlackNode.prototype.toString = function() {
  var G__11394 = null;
  var G__11394__0 = function() {
    var this__11373 = this;
    var this__11375 = this;
    return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__11375], 0))
  };
  G__11394 = function() {
    switch(arguments.length) {
      case 0:
        return G__11394__0.call(this)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11394
}();
cljs.core.BlackNode.prototype.balance_right = function(parent) {
  var this__11376 = this;
  var node__11377 = this;
  return new cljs.core.BlackNode(parent.key, parent.val, parent.left, node__11377, null)
};
cljs.core.BlackNode.prototype.blacken = function() {
  var this__11378 = this;
  var node__11379 = this;
  return node__11379
};
cljs.core.BlackNode.prototype.cljs$core$IReduce$_reduce$arity$2 = function(node, f) {
  var this__11380 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$2(node, f)
};
cljs.core.BlackNode.prototype.cljs$core$IReduce$_reduce$arity$3 = function(node, f, start) {
  var this__11381 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$3(node, f, start)
};
cljs.core.BlackNode.prototype.cljs$core$ISeqable$_seq$arity$1 = function(node) {
  var this__11382 = this;
  return cljs.core.list.cljs$lang$arity$2(this__11382.key, this__11382.val)
};
cljs.core.BlackNode.prototype.cljs$core$ICounted$_count$arity$1 = function(node) {
  var this__11383 = this;
  return 2
};
cljs.core.BlackNode.prototype.cljs$core$IStack$_peek$arity$1 = function(node) {
  var this__11384 = this;
  return this__11384.val
};
cljs.core.BlackNode.prototype.cljs$core$IStack$_pop$arity$1 = function(node) {
  var this__11385 = this;
  return cljs.core.PersistentVector.fromArray([this__11385.key], true)
};
cljs.core.BlackNode.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(node, n, v) {
  var this__11386 = this;
  return cljs.core._assoc_n(cljs.core.PersistentVector.fromArray([this__11386.key, this__11386.val], true), n, v)
};
cljs.core.BlackNode.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11387 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.BlackNode.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(node, meta) {
  var this__11388 = this;
  return cljs.core.with_meta(cljs.core.PersistentVector.fromArray([this__11388.key, this__11388.val], true), meta)
};
cljs.core.BlackNode.prototype.cljs$core$IMeta$_meta$arity$1 = function(node) {
  var this__11389 = this;
  return null
};
cljs.core.BlackNode.prototype.cljs$core$IIndexed$_nth$arity$2 = function(node, n) {
  var this__11390 = this;
  if(n === 0) {
    return this__11390.key
  }else {
    if(n === 1) {
      return this__11390.val
    }else {
      if("\ufdd0'else") {
        return null
      }else {
        return null
      }
    }
  }
};
cljs.core.BlackNode.prototype.cljs$core$IIndexed$_nth$arity$3 = function(node, n, not_found) {
  var this__11391 = this;
  if(n === 0) {
    return this__11391.key
  }else {
    if(n === 1) {
      return this__11391.val
    }else {
      if("\ufdd0'else") {
        return not_found
      }else {
        return null
      }
    }
  }
};
cljs.core.BlackNode.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(node) {
  var this__11392 = this;
  return cljs.core.PersistentVector.EMPTY
};
cljs.core.BlackNode;
cljs.core.RedNode = function(key, val, left, right, __hash) {
  this.key = key;
  this.val = val;
  this.left = left;
  this.right = right;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32402207
};
cljs.core.RedNode.cljs$lang$type = true;
cljs.core.RedNode.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/RedNode")
};
cljs.core.RedNode.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__11397 = this;
  var h__2192__auto____11398 = this__11397.__hash;
  if(!(h__2192__auto____11398 == null)) {
    return h__2192__auto____11398
  }else {
    var h__2192__auto____11399 = cljs.core.hash_coll(coll);
    this__11397.__hash = h__2192__auto____11399;
    return h__2192__auto____11399
  }
};
cljs.core.RedNode.prototype.cljs$core$ILookup$_lookup$arity$2 = function(node, k) {
  var this__11400 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, null)
};
cljs.core.RedNode.prototype.cljs$core$ILookup$_lookup$arity$3 = function(node, k, not_found) {
  var this__11401 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, not_found)
};
cljs.core.RedNode.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(node, k, v) {
  var this__11402 = this;
  return cljs.core.assoc.cljs$lang$arity$3(cljs.core.PersistentVector.fromArray([this__11402.key, this__11402.val], true), k, v)
};
cljs.core.RedNode.prototype.call = function() {
  var G__11450 = null;
  var G__11450__2 = function(this_sym11403, k) {
    var this__11405 = this;
    var this_sym11403__11406 = this;
    var node__11407 = this_sym11403__11406;
    return node__11407.cljs$core$ILookup$_lookup$arity$2(node__11407, k)
  };
  var G__11450__3 = function(this_sym11404, k, not_found) {
    var this__11405 = this;
    var this_sym11404__11408 = this;
    var node__11409 = this_sym11404__11408;
    return node__11409.cljs$core$ILookup$_lookup$arity$3(node__11409, k, not_found)
  };
  G__11450 = function(this_sym11404, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11450__2.call(this, this_sym11404, k);
      case 3:
        return G__11450__3.call(this, this_sym11404, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11450
}();
cljs.core.RedNode.prototype.apply = function(this_sym11395, args11396) {
  var this__11410 = this;
  return this_sym11395.call.apply(this_sym11395, [this_sym11395].concat(args11396.slice()))
};
cljs.core.RedNode.prototype.cljs$core$ICollection$_conj$arity$2 = function(node, o) {
  var this__11411 = this;
  return cljs.core.PersistentVector.fromArray([this__11411.key, this__11411.val, o], true)
};
cljs.core.RedNode.prototype.cljs$core$IMapEntry$_key$arity$1 = function(node) {
  var this__11412 = this;
  return this__11412.key
};
cljs.core.RedNode.prototype.cljs$core$IMapEntry$_val$arity$1 = function(node) {
  var this__11413 = this;
  return this__11413.val
};
cljs.core.RedNode.prototype.add_right = function(ins) {
  var this__11414 = this;
  var node__11415 = this;
  return new cljs.core.RedNode(this__11414.key, this__11414.val, this__11414.left, ins, null)
};
cljs.core.RedNode.prototype.redden = function() {
  var this__11416 = this;
  var node__11417 = this;
  throw new Error("red-black tree invariant violation");
};
cljs.core.RedNode.prototype.remove_right = function(del) {
  var this__11418 = this;
  var node__11419 = this;
  return new cljs.core.RedNode(this__11418.key, this__11418.val, this__11418.left, del, null)
};
cljs.core.RedNode.prototype.replace = function(key, val, left, right) {
  var this__11420 = this;
  var node__11421 = this;
  return new cljs.core.RedNode(key, val, left, right, null)
};
cljs.core.RedNode.prototype.kv_reduce = function(f, init) {
  var this__11422 = this;
  var node__11423 = this;
  return cljs.core.tree_map_kv_reduce(node__11423, f, init)
};
cljs.core.RedNode.prototype.remove_left = function(del) {
  var this__11424 = this;
  var node__11425 = this;
  return new cljs.core.RedNode(this__11424.key, this__11424.val, del, this__11424.right, null)
};
cljs.core.RedNode.prototype.add_left = function(ins) {
  var this__11426 = this;
  var node__11427 = this;
  return new cljs.core.RedNode(this__11426.key, this__11426.val, ins, this__11426.right, null)
};
cljs.core.RedNode.prototype.balance_left = function(parent) {
  var this__11428 = this;
  var node__11429 = this;
  if(cljs.core.instance_QMARK_(cljs.core.RedNode, this__11428.left)) {
    return new cljs.core.RedNode(this__11428.key, this__11428.val, this__11428.left.blacken(), new cljs.core.BlackNode(parent.key, parent.val, this__11428.right, parent.right, null), null)
  }else {
    if(cljs.core.instance_QMARK_(cljs.core.RedNode, this__11428.right)) {
      return new cljs.core.RedNode(this__11428.right.key, this__11428.right.val, new cljs.core.BlackNode(this__11428.key, this__11428.val, this__11428.left, this__11428.right.left, null), new cljs.core.BlackNode(parent.key, parent.val, this__11428.right.right, parent.right, null), null)
    }else {
      if("\ufdd0'else") {
        return new cljs.core.BlackNode(parent.key, parent.val, node__11429, parent.right, null)
      }else {
        return null
      }
    }
  }
};
cljs.core.RedNode.prototype.toString = function() {
  var G__11451 = null;
  var G__11451__0 = function() {
    var this__11430 = this;
    var this__11432 = this;
    return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__11432], 0))
  };
  G__11451 = function() {
    switch(arguments.length) {
      case 0:
        return G__11451__0.call(this)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11451
}();
cljs.core.RedNode.prototype.balance_right = function(parent) {
  var this__11433 = this;
  var node__11434 = this;
  if(cljs.core.instance_QMARK_(cljs.core.RedNode, this__11433.right)) {
    return new cljs.core.RedNode(this__11433.key, this__11433.val, new cljs.core.BlackNode(parent.key, parent.val, parent.left, this__11433.left, null), this__11433.right.blacken(), null)
  }else {
    if(cljs.core.instance_QMARK_(cljs.core.RedNode, this__11433.left)) {
      return new cljs.core.RedNode(this__11433.left.key, this__11433.left.val, new cljs.core.BlackNode(parent.key, parent.val, parent.left, this__11433.left.left, null), new cljs.core.BlackNode(this__11433.key, this__11433.val, this__11433.left.right, this__11433.right, null), null)
    }else {
      if("\ufdd0'else") {
        return new cljs.core.BlackNode(parent.key, parent.val, parent.left, node__11434, null)
      }else {
        return null
      }
    }
  }
};
cljs.core.RedNode.prototype.blacken = function() {
  var this__11435 = this;
  var node__11436 = this;
  return new cljs.core.BlackNode(this__11435.key, this__11435.val, this__11435.left, this__11435.right, null)
};
cljs.core.RedNode.prototype.cljs$core$IReduce$_reduce$arity$2 = function(node, f) {
  var this__11437 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$2(node, f)
};
cljs.core.RedNode.prototype.cljs$core$IReduce$_reduce$arity$3 = function(node, f, start) {
  var this__11438 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$3(node, f, start)
};
cljs.core.RedNode.prototype.cljs$core$ISeqable$_seq$arity$1 = function(node) {
  var this__11439 = this;
  return cljs.core.list.cljs$lang$arity$2(this__11439.key, this__11439.val)
};
cljs.core.RedNode.prototype.cljs$core$ICounted$_count$arity$1 = function(node) {
  var this__11440 = this;
  return 2
};
cljs.core.RedNode.prototype.cljs$core$IStack$_peek$arity$1 = function(node) {
  var this__11441 = this;
  return this__11441.val
};
cljs.core.RedNode.prototype.cljs$core$IStack$_pop$arity$1 = function(node) {
  var this__11442 = this;
  return cljs.core.PersistentVector.fromArray([this__11442.key], true)
};
cljs.core.RedNode.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(node, n, v) {
  var this__11443 = this;
  return cljs.core._assoc_n(cljs.core.PersistentVector.fromArray([this__11443.key, this__11443.val], true), n, v)
};
cljs.core.RedNode.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11444 = this;
  return cljs.core.equiv_sequential(coll, other)
};
cljs.core.RedNode.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(node, meta) {
  var this__11445 = this;
  return cljs.core.with_meta(cljs.core.PersistentVector.fromArray([this__11445.key, this__11445.val], true), meta)
};
cljs.core.RedNode.prototype.cljs$core$IMeta$_meta$arity$1 = function(node) {
  var this__11446 = this;
  return null
};
cljs.core.RedNode.prototype.cljs$core$IIndexed$_nth$arity$2 = function(node, n) {
  var this__11447 = this;
  if(n === 0) {
    return this__11447.key
  }else {
    if(n === 1) {
      return this__11447.val
    }else {
      if("\ufdd0'else") {
        return null
      }else {
        return null
      }
    }
  }
};
cljs.core.RedNode.prototype.cljs$core$IIndexed$_nth$arity$3 = function(node, n, not_found) {
  var this__11448 = this;
  if(n === 0) {
    return this__11448.key
  }else {
    if(n === 1) {
      return this__11448.val
    }else {
      if("\ufdd0'else") {
        return not_found
      }else {
        return null
      }
    }
  }
};
cljs.core.RedNode.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(node) {
  var this__11449 = this;
  return cljs.core.PersistentVector.EMPTY
};
cljs.core.RedNode;
cljs.core.tree_map_add = function tree_map_add(comp, tree, k, v, found) {
  if(tree == null) {
    return new cljs.core.RedNode(k, v, null, null, null)
  }else {
    var c__11455 = comp.cljs$lang$arity$2 ? comp.cljs$lang$arity$2(k, tree.key) : comp.call(null, k, tree.key);
    if(c__11455 === 0) {
      found[0] = tree;
      return null
    }else {
      if(c__11455 < 0) {
        var ins__11456 = tree_map_add(comp, tree.left, k, v, found);
        if(!(ins__11456 == null)) {
          return tree.add_left(ins__11456)
        }else {
          return null
        }
      }else {
        if("\ufdd0'else") {
          var ins__11457 = tree_map_add(comp, tree.right, k, v, found);
          if(!(ins__11457 == null)) {
            return tree.add_right(ins__11457)
          }else {
            return null
          }
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.tree_map_append = function tree_map_append(left, right) {
  if(left == null) {
    return right
  }else {
    if(right == null) {
      return left
    }else {
      if(cljs.core.instance_QMARK_(cljs.core.RedNode, left)) {
        if(cljs.core.instance_QMARK_(cljs.core.RedNode, right)) {
          var app__11460 = tree_map_append(left.right, right.left);
          if(cljs.core.instance_QMARK_(cljs.core.RedNode, app__11460)) {
            return new cljs.core.RedNode(app__11460.key, app__11460.val, new cljs.core.RedNode(left.key, left.val, left.left, app__11460.left, null), new cljs.core.RedNode(right.key, right.val, app__11460.right, right.right, null), null)
          }else {
            return new cljs.core.RedNode(left.key, left.val, left.left, new cljs.core.RedNode(right.key, right.val, app__11460, right.right, null), null)
          }
        }else {
          return new cljs.core.RedNode(left.key, left.val, left.left, tree_map_append(left.right, right), null)
        }
      }else {
        if(cljs.core.instance_QMARK_(cljs.core.RedNode, right)) {
          return new cljs.core.RedNode(right.key, right.val, tree_map_append(left, right.left), right.right, null)
        }else {
          if("\ufdd0'else") {
            var app__11461 = tree_map_append(left.right, right.left);
            if(cljs.core.instance_QMARK_(cljs.core.RedNode, app__11461)) {
              return new cljs.core.RedNode(app__11461.key, app__11461.val, new cljs.core.BlackNode(left.key, left.val, left.left, app__11461.left, null), new cljs.core.BlackNode(right.key, right.val, app__11461.right, right.right, null), null)
            }else {
              return cljs.core.balance_left_del(left.key, left.val, left.left, new cljs.core.BlackNode(right.key, right.val, app__11461, right.right, null))
            }
          }else {
            return null
          }
        }
      }
    }
  }
};
cljs.core.tree_map_remove = function tree_map_remove(comp, tree, k, found) {
  if(!(tree == null)) {
    var c__11467 = comp.cljs$lang$arity$2 ? comp.cljs$lang$arity$2(k, tree.key) : comp.call(null, k, tree.key);
    if(c__11467 === 0) {
      found[0] = tree;
      return cljs.core.tree_map_append(tree.left, tree.right)
    }else {
      if(c__11467 < 0) {
        var del__11468 = tree_map_remove(comp, tree.left, k, found);
        if(function() {
          var or__3824__auto____11469 = !(del__11468 == null);
          if(or__3824__auto____11469) {
            return or__3824__auto____11469
          }else {
            return!(found[0] == null)
          }
        }()) {
          if(cljs.core.instance_QMARK_(cljs.core.BlackNode, tree.left)) {
            return cljs.core.balance_left_del(tree.key, tree.val, del__11468, tree.right)
          }else {
            return new cljs.core.RedNode(tree.key, tree.val, del__11468, tree.right, null)
          }
        }else {
          return null
        }
      }else {
        if("\ufdd0'else") {
          var del__11470 = tree_map_remove(comp, tree.right, k, found);
          if(function() {
            var or__3824__auto____11471 = !(del__11470 == null);
            if(or__3824__auto____11471) {
              return or__3824__auto____11471
            }else {
              return!(found[0] == null)
            }
          }()) {
            if(cljs.core.instance_QMARK_(cljs.core.BlackNode, tree.right)) {
              return cljs.core.balance_right_del(tree.key, tree.val, tree.left, del__11470)
            }else {
              return new cljs.core.RedNode(tree.key, tree.val, tree.left, del__11470, null)
            }
          }else {
            return null
          }
        }else {
          return null
        }
      }
    }
  }else {
    return null
  }
};
cljs.core.tree_map_replace = function tree_map_replace(comp, tree, k, v) {
  var tk__11474 = tree.key;
  var c__11475 = comp.cljs$lang$arity$2 ? comp.cljs$lang$arity$2(k, tk__11474) : comp.call(null, k, tk__11474);
  if(c__11475 === 0) {
    return tree.replace(tk__11474, v, tree.left, tree.right)
  }else {
    if(c__11475 < 0) {
      return tree.replace(tk__11474, tree.val, tree_map_replace(comp, tree.left, k, v), tree.right)
    }else {
      if("\ufdd0'else") {
        return tree.replace(tk__11474, tree.val, tree.left, tree_map_replace(comp, tree.right, k, v))
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentTreeMap = function(comp, tree, cnt, meta, __hash) {
  this.comp = comp;
  this.tree = tree;
  this.cnt = cnt;
  this.meta = meta;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 418776847
};
cljs.core.PersistentTreeMap.cljs$lang$type = true;
cljs.core.PersistentTreeMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/PersistentTreeMap")
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__11478 = this;
  var h__2192__auto____11479 = this__11478.__hash;
  if(!(h__2192__auto____11479 == null)) {
    return h__2192__auto____11479
  }else {
    var h__2192__auto____11480 = cljs.core.hash_imap(coll);
    this__11478.__hash = h__2192__auto____11480;
    return h__2192__auto____11480
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__11481 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__11482 = this;
  var n__11483 = coll.entry_at(k);
  if(!(n__11483 == null)) {
    return n__11483.val
  }else {
    return not_found
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__11484 = this;
  var found__11485 = [null];
  var t__11486 = cljs.core.tree_map_add(this__11484.comp, this__11484.tree, k, v, found__11485);
  if(t__11486 == null) {
    var found_node__11487 = cljs.core.nth.cljs$lang$arity$2(found__11485, 0);
    if(cljs.core._EQ_.cljs$lang$arity$2(v, found_node__11487.val)) {
      return coll
    }else {
      return new cljs.core.PersistentTreeMap(this__11484.comp, cljs.core.tree_map_replace(this__11484.comp, this__11484.tree, k, v), this__11484.cnt, this__11484.meta, null)
    }
  }else {
    return new cljs.core.PersistentTreeMap(this__11484.comp, t__11486.blacken(), this__11484.cnt + 1, this__11484.meta, null)
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__11488 = this;
  return!(coll.entry_at(k) == null)
};
cljs.core.PersistentTreeMap.prototype.call = function() {
  var G__11522 = null;
  var G__11522__2 = function(this_sym11489, k) {
    var this__11491 = this;
    var this_sym11489__11492 = this;
    var coll__11493 = this_sym11489__11492;
    return coll__11493.cljs$core$ILookup$_lookup$arity$2(coll__11493, k)
  };
  var G__11522__3 = function(this_sym11490, k, not_found) {
    var this__11491 = this;
    var this_sym11490__11494 = this;
    var coll__11495 = this_sym11490__11494;
    return coll__11495.cljs$core$ILookup$_lookup$arity$3(coll__11495, k, not_found)
  };
  G__11522 = function(this_sym11490, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11522__2.call(this, this_sym11490, k);
      case 3:
        return G__11522__3.call(this, this_sym11490, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11522
}();
cljs.core.PersistentTreeMap.prototype.apply = function(this_sym11476, args11477) {
  var this__11496 = this;
  return this_sym11476.call.apply(this_sym11476, [this_sym11476].concat(args11477.slice()))
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(coll, f, init) {
  var this__11497 = this;
  if(!(this__11497.tree == null)) {
    return cljs.core.tree_map_kv_reduce(this__11497.tree, f, init)
  }else {
    return init
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__11498 = this;
  if(cljs.core.vector_QMARK_(entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.cljs$lang$arity$2(entry, 0), cljs.core._nth.cljs$lang$arity$2(entry, 1))
  }else {
    return cljs.core.reduce.cljs$lang$arity$3(cljs.core._conj, coll, entry)
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__11499 = this;
  if(this__11499.cnt > 0) {
    return cljs.core.create_tree_map_seq(this__11499.tree, false, this__11499.cnt)
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.toString = function() {
  var this__11500 = this;
  var this__11501 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__11501], 0))
};
cljs.core.PersistentTreeMap.prototype.entry_at = function(k) {
  var this__11502 = this;
  var coll__11503 = this;
  var t__11504 = this__11502.tree;
  while(true) {
    if(!(t__11504 == null)) {
      var c__11505 = this__11502.comp.cljs$lang$arity$2 ? this__11502.comp.cljs$lang$arity$2(k, t__11504.key) : this__11502.comp.call(null, k, t__11504.key);
      if(c__11505 === 0) {
        return t__11504
      }else {
        if(c__11505 < 0) {
          var G__11523 = t__11504.left;
          t__11504 = G__11523;
          continue
        }else {
          if("\ufdd0'else") {
            var G__11524 = t__11504.right;
            t__11504 = G__11524;
            continue
          }else {
            return null
          }
        }
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISorted$_sorted_seq$arity$2 = function(coll, ascending_QMARK_) {
  var this__11506 = this;
  if(this__11506.cnt > 0) {
    return cljs.core.create_tree_map_seq(this__11506.tree, ascending_QMARK_, this__11506.cnt)
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISorted$_sorted_seq_from$arity$3 = function(coll, k, ascending_QMARK_) {
  var this__11507 = this;
  if(this__11507.cnt > 0) {
    var stack__11508 = null;
    var t__11509 = this__11507.tree;
    while(true) {
      if(!(t__11509 == null)) {
        var c__11510 = this__11507.comp.cljs$lang$arity$2 ? this__11507.comp.cljs$lang$arity$2(k, t__11509.key) : this__11507.comp.call(null, k, t__11509.key);
        if(c__11510 === 0) {
          return new cljs.core.PersistentTreeMapSeq(null, cljs.core.conj.cljs$lang$arity$2(stack__11508, t__11509), ascending_QMARK_, -1, null)
        }else {
          if(cljs.core.truth_(ascending_QMARK_)) {
            if(c__11510 < 0) {
              var G__11525 = cljs.core.conj.cljs$lang$arity$2(stack__11508, t__11509);
              var G__11526 = t__11509.left;
              stack__11508 = G__11525;
              t__11509 = G__11526;
              continue
            }else {
              var G__11527 = stack__11508;
              var G__11528 = t__11509.right;
              stack__11508 = G__11527;
              t__11509 = G__11528;
              continue
            }
          }else {
            if("\ufdd0'else") {
              if(c__11510 > 0) {
                var G__11529 = cljs.core.conj.cljs$lang$arity$2(stack__11508, t__11509);
                var G__11530 = t__11509.right;
                stack__11508 = G__11529;
                t__11509 = G__11530;
                continue
              }else {
                var G__11531 = stack__11508;
                var G__11532 = t__11509.left;
                stack__11508 = G__11531;
                t__11509 = G__11532;
                continue
              }
            }else {
              return null
            }
          }
        }
      }else {
        if(stack__11508 == null) {
          return new cljs.core.PersistentTreeMapSeq(null, stack__11508, ascending_QMARK_, -1, null)
        }else {
          return null
        }
      }
      break
    }
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISorted$_entry_key$arity$2 = function(coll, entry) {
  var this__11511 = this;
  return cljs.core.key(entry)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISorted$_comparator$arity$1 = function(coll) {
  var this__11512 = this;
  return this__11512.comp
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__11513 = this;
  if(this__11513.cnt > 0) {
    return cljs.core.create_tree_map_seq(this__11513.tree, true, this__11513.cnt)
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__11514 = this;
  return this__11514.cnt
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11515 = this;
  return cljs.core.equiv_map(coll, other)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11516 = this;
  return new cljs.core.PersistentTreeMap(this__11516.comp, this__11516.tree, this__11516.cnt, meta, this__11516.__hash)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11517 = this;
  return this__11517.meta
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__11518 = this;
  return cljs.core.with_meta(cljs.core.PersistentTreeMap.EMPTY, this__11518.meta)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__11519 = this;
  var found__11520 = [null];
  var t__11521 = cljs.core.tree_map_remove(this__11519.comp, this__11519.tree, k, found__11520);
  if(t__11521 == null) {
    if(cljs.core.nth.cljs$lang$arity$2(found__11520, 0) == null) {
      return coll
    }else {
      return new cljs.core.PersistentTreeMap(this__11519.comp, null, 0, this__11519.meta, null)
    }
  }else {
    return new cljs.core.PersistentTreeMap(this__11519.comp, t__11521.blacken(), this__11519.cnt - 1, this__11519.meta, null)
  }
};
cljs.core.PersistentTreeMap;
cljs.core.PersistentTreeMap.EMPTY = new cljs.core.PersistentTreeMap(cljs.core.compare, null, 0, null, 0);
cljs.core.hash_map = function() {
  var hash_map__delegate = function(keyvals) {
    var in__11535 = cljs.core.seq(keyvals);
    var out__11536 = cljs.core.transient$(cljs.core.PersistentHashMap.EMPTY);
    while(true) {
      if(in__11535) {
        var G__11537 = cljs.core.nnext(in__11535);
        var G__11538 = cljs.core.assoc_BANG_(out__11536, cljs.core.first(in__11535), cljs.core.second(in__11535));
        in__11535 = G__11537;
        out__11536 = G__11538;
        continue
      }else {
        return cljs.core.persistent_BANG_(out__11536)
      }
      break
    }
  };
  var hash_map = function(var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return hash_map__delegate.call(this, keyvals)
  };
  hash_map.cljs$lang$maxFixedArity = 0;
  hash_map.cljs$lang$applyTo = function(arglist__11539) {
    var keyvals = cljs.core.seq(arglist__11539);
    return hash_map__delegate(keyvals)
  };
  hash_map.cljs$lang$arity$variadic = hash_map__delegate;
  return hash_map
}();
cljs.core.array_map = function() {
  var array_map__delegate = function(keyvals) {
    return new cljs.core.PersistentArrayMap(null, cljs.core.quot(cljs.core.count(keyvals), 2), cljs.core.apply.cljs$lang$arity$2(cljs.core.array, keyvals), null)
  };
  var array_map = function(var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return array_map__delegate.call(this, keyvals)
  };
  array_map.cljs$lang$maxFixedArity = 0;
  array_map.cljs$lang$applyTo = function(arglist__11540) {
    var keyvals = cljs.core.seq(arglist__11540);
    return array_map__delegate(keyvals)
  };
  array_map.cljs$lang$arity$variadic = array_map__delegate;
  return array_map
}();
cljs.core.obj_map = function() {
  var obj_map__delegate = function(keyvals) {
    var ks__11544 = [];
    var obj__11545 = {};
    var kvs__11546 = cljs.core.seq(keyvals);
    while(true) {
      if(kvs__11546) {
        ks__11544.push(cljs.core.first(kvs__11546));
        obj__11545[cljs.core.first(kvs__11546)] = cljs.core.second(kvs__11546);
        var G__11547 = cljs.core.nnext(kvs__11546);
        kvs__11546 = G__11547;
        continue
      }else {
        return cljs.core.ObjMap.fromObject.cljs$lang$arity$2 ? cljs.core.ObjMap.fromObject.cljs$lang$arity$2(ks__11544, obj__11545) : cljs.core.ObjMap.fromObject.call(null, ks__11544, obj__11545)
      }
      break
    }
  };
  var obj_map = function(var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return obj_map__delegate.call(this, keyvals)
  };
  obj_map.cljs$lang$maxFixedArity = 0;
  obj_map.cljs$lang$applyTo = function(arglist__11548) {
    var keyvals = cljs.core.seq(arglist__11548);
    return obj_map__delegate(keyvals)
  };
  obj_map.cljs$lang$arity$variadic = obj_map__delegate;
  return obj_map
}();
cljs.core.sorted_map = function() {
  var sorted_map__delegate = function(keyvals) {
    var in__11551 = cljs.core.seq(keyvals);
    var out__11552 = cljs.core.PersistentTreeMap.EMPTY;
    while(true) {
      if(in__11551) {
        var G__11553 = cljs.core.nnext(in__11551);
        var G__11554 = cljs.core.assoc.cljs$lang$arity$3(out__11552, cljs.core.first(in__11551), cljs.core.second(in__11551));
        in__11551 = G__11553;
        out__11552 = G__11554;
        continue
      }else {
        return out__11552
      }
      break
    }
  };
  var sorted_map = function(var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return sorted_map__delegate.call(this, keyvals)
  };
  sorted_map.cljs$lang$maxFixedArity = 0;
  sorted_map.cljs$lang$applyTo = function(arglist__11555) {
    var keyvals = cljs.core.seq(arglist__11555);
    return sorted_map__delegate(keyvals)
  };
  sorted_map.cljs$lang$arity$variadic = sorted_map__delegate;
  return sorted_map
}();
cljs.core.sorted_map_by = function() {
  var sorted_map_by__delegate = function(comparator, keyvals) {
    var in__11558 = cljs.core.seq(keyvals);
    var out__11559 = new cljs.core.PersistentTreeMap(comparator, null, 0, null, 0);
    while(true) {
      if(in__11558) {
        var G__11560 = cljs.core.nnext(in__11558);
        var G__11561 = cljs.core.assoc.cljs$lang$arity$3(out__11559, cljs.core.first(in__11558), cljs.core.second(in__11558));
        in__11558 = G__11560;
        out__11559 = G__11561;
        continue
      }else {
        return out__11559
      }
      break
    }
  };
  var sorted_map_by = function(comparator, var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return sorted_map_by__delegate.call(this, comparator, keyvals)
  };
  sorted_map_by.cljs$lang$maxFixedArity = 1;
  sorted_map_by.cljs$lang$applyTo = function(arglist__11562) {
    var comparator = cljs.core.first(arglist__11562);
    var keyvals = cljs.core.rest(arglist__11562);
    return sorted_map_by__delegate(comparator, keyvals)
  };
  sorted_map_by.cljs$lang$arity$variadic = sorted_map_by__delegate;
  return sorted_map_by
}();
cljs.core.keys = function keys(hash_map) {
  return cljs.core.seq(cljs.core.map.cljs$lang$arity$2(cljs.core.first, hash_map))
};
cljs.core.key = function key(map_entry) {
  return cljs.core._key(map_entry)
};
cljs.core.vals = function vals(hash_map) {
  return cljs.core.seq(cljs.core.map.cljs$lang$arity$2(cljs.core.second, hash_map))
};
cljs.core.val = function val(map_entry) {
  return cljs.core._val(map_entry)
};
cljs.core.merge = function() {
  var merge__delegate = function(maps) {
    if(cljs.core.truth_(cljs.core.some(cljs.core.identity, maps))) {
      return cljs.core.reduce.cljs$lang$arity$2(function(p1__11563_SHARP_, p2__11564_SHARP_) {
        return cljs.core.conj.cljs$lang$arity$2(function() {
          var or__3824__auto____11566 = p1__11563_SHARP_;
          if(cljs.core.truth_(or__3824__auto____11566)) {
            return or__3824__auto____11566
          }else {
            return cljs.core.ObjMap.EMPTY
          }
        }(), p2__11564_SHARP_)
      }, maps)
    }else {
      return null
    }
  };
  var merge = function(var_args) {
    var maps = null;
    if(goog.isDef(var_args)) {
      maps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return merge__delegate.call(this, maps)
  };
  merge.cljs$lang$maxFixedArity = 0;
  merge.cljs$lang$applyTo = function(arglist__11567) {
    var maps = cljs.core.seq(arglist__11567);
    return merge__delegate(maps)
  };
  merge.cljs$lang$arity$variadic = merge__delegate;
  return merge
}();
cljs.core.merge_with = function() {
  var merge_with__delegate = function(f, maps) {
    if(cljs.core.truth_(cljs.core.some(cljs.core.identity, maps))) {
      var merge_entry__11575 = function(m, e) {
        var k__11573 = cljs.core.first(e);
        var v__11574 = cljs.core.second(e);
        if(cljs.core.contains_QMARK_(m, k__11573)) {
          return cljs.core.assoc.cljs$lang$arity$3(m, k__11573, f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(cljs.core._lookup.cljs$lang$arity$3(m, k__11573, null), v__11574) : f.call(null, cljs.core._lookup.cljs$lang$arity$3(m, k__11573, null), v__11574))
        }else {
          return cljs.core.assoc.cljs$lang$arity$3(m, k__11573, v__11574)
        }
      };
      var merge2__11577 = function(m1, m2) {
        return cljs.core.reduce.cljs$lang$arity$3(merge_entry__11575, function() {
          var or__3824__auto____11576 = m1;
          if(cljs.core.truth_(or__3824__auto____11576)) {
            return or__3824__auto____11576
          }else {
            return cljs.core.ObjMap.EMPTY
          }
        }(), cljs.core.seq(m2))
      };
      return cljs.core.reduce.cljs$lang$arity$2(merge2__11577, maps)
    }else {
      return null
    }
  };
  var merge_with = function(f, var_args) {
    var maps = null;
    if(goog.isDef(var_args)) {
      maps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return merge_with__delegate.call(this, f, maps)
  };
  merge_with.cljs$lang$maxFixedArity = 1;
  merge_with.cljs$lang$applyTo = function(arglist__11578) {
    var f = cljs.core.first(arglist__11578);
    var maps = cljs.core.rest(arglist__11578);
    return merge_with__delegate(f, maps)
  };
  merge_with.cljs$lang$arity$variadic = merge_with__delegate;
  return merge_with
}();
cljs.core.select_keys = function select_keys(map, keyseq) {
  var ret__11583 = cljs.core.ObjMap.EMPTY;
  var keys__11584 = cljs.core.seq(keyseq);
  while(true) {
    if(keys__11584) {
      var key__11585 = cljs.core.first(keys__11584);
      var entry__11586 = cljs.core._lookup.cljs$lang$arity$3(map, key__11585, "\ufdd0'cljs.core/not-found");
      var G__11587 = cljs.core.not_EQ_.cljs$lang$arity$2(entry__11586, "\ufdd0'cljs.core/not-found") ? cljs.core.assoc.cljs$lang$arity$3(ret__11583, key__11585, entry__11586) : ret__11583;
      var G__11588 = cljs.core.next(keys__11584);
      ret__11583 = G__11587;
      keys__11584 = G__11588;
      continue
    }else {
      return ret__11583
    }
    break
  }
};
cljs.core.PersistentHashSet = function(meta, hash_map, __hash) {
  this.meta = meta;
  this.hash_map = hash_map;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 1;
  this.cljs$lang$protocol_mask$partition0$ = 15077647
};
cljs.core.PersistentHashSet.cljs$lang$type = true;
cljs.core.PersistentHashSet.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/PersistentHashSet")
};
cljs.core.PersistentHashSet.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__11592 = this;
  return new cljs.core.TransientHashSet(cljs.core.transient$(this__11592.hash_map))
};
cljs.core.PersistentHashSet.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__11593 = this;
  var h__2192__auto____11594 = this__11593.__hash;
  if(!(h__2192__auto____11594 == null)) {
    return h__2192__auto____11594
  }else {
    var h__2192__auto____11595 = cljs.core.hash_iset(coll);
    this__11593.__hash = h__2192__auto____11595;
    return h__2192__auto____11595
  }
};
cljs.core.PersistentHashSet.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, v) {
  var this__11596 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, v, null)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, v, not_found) {
  var this__11597 = this;
  if(cljs.core.truth_(cljs.core._contains_key_QMARK_(this__11597.hash_map, v))) {
    return v
  }else {
    return not_found
  }
};
cljs.core.PersistentHashSet.prototype.call = function() {
  var G__11618 = null;
  var G__11618__2 = function(this_sym11598, k) {
    var this__11600 = this;
    var this_sym11598__11601 = this;
    var coll__11602 = this_sym11598__11601;
    return coll__11602.cljs$core$ILookup$_lookup$arity$2(coll__11602, k)
  };
  var G__11618__3 = function(this_sym11599, k, not_found) {
    var this__11600 = this;
    var this_sym11599__11603 = this;
    var coll__11604 = this_sym11599__11603;
    return coll__11604.cljs$core$ILookup$_lookup$arity$3(coll__11604, k, not_found)
  };
  G__11618 = function(this_sym11599, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11618__2.call(this, this_sym11599, k);
      case 3:
        return G__11618__3.call(this, this_sym11599, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11618
}();
cljs.core.PersistentHashSet.prototype.apply = function(this_sym11590, args11591) {
  var this__11605 = this;
  return this_sym11590.call.apply(this_sym11590, [this_sym11590].concat(args11591.slice()))
};
cljs.core.PersistentHashSet.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__11606 = this;
  return new cljs.core.PersistentHashSet(this__11606.meta, cljs.core.assoc.cljs$lang$arity$3(this__11606.hash_map, o, null), null)
};
cljs.core.PersistentHashSet.prototype.toString = function() {
  var this__11607 = this;
  var this__11608 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__11608], 0))
};
cljs.core.PersistentHashSet.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__11609 = this;
  return cljs.core.keys(this__11609.hash_map)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ISet$_disjoin$arity$2 = function(coll, v) {
  var this__11610 = this;
  return new cljs.core.PersistentHashSet(this__11610.meta, cljs.core.dissoc.cljs$lang$arity$2(this__11610.hash_map, v), null)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__11611 = this;
  return cljs.core.count(cljs.core.seq(coll))
};
cljs.core.PersistentHashSet.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11612 = this;
  var and__3822__auto____11613 = cljs.core.set_QMARK_(other);
  if(and__3822__auto____11613) {
    var and__3822__auto____11614 = cljs.core.count(coll) === cljs.core.count(other);
    if(and__3822__auto____11614) {
      return cljs.core.every_QMARK_(function(p1__11589_SHARP_) {
        return cljs.core.contains_QMARK_(coll, p1__11589_SHARP_)
      }, other)
    }else {
      return and__3822__auto____11614
    }
  }else {
    return and__3822__auto____11613
  }
};
cljs.core.PersistentHashSet.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11615 = this;
  return new cljs.core.PersistentHashSet(meta, this__11615.hash_map, this__11615.__hash)
};
cljs.core.PersistentHashSet.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11616 = this;
  return this__11616.meta
};
cljs.core.PersistentHashSet.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__11617 = this;
  return cljs.core.with_meta(cljs.core.PersistentHashSet.EMPTY, this__11617.meta)
};
cljs.core.PersistentHashSet;
cljs.core.PersistentHashSet.EMPTY = new cljs.core.PersistentHashSet(null, cljs.core.hash_map(), 0);
cljs.core.PersistentHashSet.fromArray = function(items) {
  var len__11619 = cljs.core.count(items);
  var i__11620 = 0;
  var out__11621 = cljs.core.transient$(cljs.core.PersistentHashSet.EMPTY);
  while(true) {
    if(i__11620 < len__11619) {
      var G__11622 = i__11620 + 1;
      var G__11623 = cljs.core.conj_BANG_(out__11621, items[i__11620]);
      i__11620 = G__11622;
      out__11621 = G__11623;
      continue
    }else {
      return cljs.core.persistent_BANG_(out__11621)
    }
    break
  }
};
cljs.core.TransientHashSet = function(transient_map) {
  this.transient_map = transient_map;
  this.cljs$lang$protocol_mask$partition0$ = 259;
  this.cljs$lang$protocol_mask$partition1$ = 34
};
cljs.core.TransientHashSet.cljs$lang$type = true;
cljs.core.TransientHashSet.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/TransientHashSet")
};
cljs.core.TransientHashSet.prototype.call = function() {
  var G__11641 = null;
  var G__11641__2 = function(this_sym11627, k) {
    var this__11629 = this;
    var this_sym11627__11630 = this;
    var tcoll__11631 = this_sym11627__11630;
    if(cljs.core._lookup.cljs$lang$arity$3(this__11629.transient_map, k, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
      return null
    }else {
      return k
    }
  };
  var G__11641__3 = function(this_sym11628, k, not_found) {
    var this__11629 = this;
    var this_sym11628__11632 = this;
    var tcoll__11633 = this_sym11628__11632;
    if(cljs.core._lookup.cljs$lang$arity$3(this__11629.transient_map, k, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
      return not_found
    }else {
      return k
    }
  };
  G__11641 = function(this_sym11628, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11641__2.call(this, this_sym11628, k);
      case 3:
        return G__11641__3.call(this, this_sym11628, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11641
}();
cljs.core.TransientHashSet.prototype.apply = function(this_sym11625, args11626) {
  var this__11634 = this;
  return this_sym11625.call.apply(this_sym11625, [this_sym11625].concat(args11626.slice()))
};
cljs.core.TransientHashSet.prototype.cljs$core$ILookup$_lookup$arity$2 = function(tcoll, v) {
  var this__11635 = this;
  return tcoll.cljs$core$ILookup$_lookup$arity$3(tcoll, v, null)
};
cljs.core.TransientHashSet.prototype.cljs$core$ILookup$_lookup$arity$3 = function(tcoll, v, not_found) {
  var this__11636 = this;
  if(cljs.core._lookup.cljs$lang$arity$3(this__11636.transient_map, v, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
    return not_found
  }else {
    return v
  }
};
cljs.core.TransientHashSet.prototype.cljs$core$ICounted$_count$arity$1 = function(tcoll) {
  var this__11637 = this;
  return cljs.core.count(this__11637.transient_map)
};
cljs.core.TransientHashSet.prototype.cljs$core$ITransientSet$_disjoin_BANG_$arity$2 = function(tcoll, v) {
  var this__11638 = this;
  this__11638.transient_map = cljs.core.dissoc_BANG_(this__11638.transient_map, v);
  return tcoll
};
cljs.core.TransientHashSet.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, o) {
  var this__11639 = this;
  this__11639.transient_map = cljs.core.assoc_BANG_(this__11639.transient_map, o, null);
  return tcoll
};
cljs.core.TransientHashSet.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__11640 = this;
  return new cljs.core.PersistentHashSet(null, cljs.core.persistent_BANG_(this__11640.transient_map), null)
};
cljs.core.TransientHashSet;
cljs.core.PersistentTreeSet = function(meta, tree_map, __hash) {
  this.meta = meta;
  this.tree_map = tree_map;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 417730831
};
cljs.core.PersistentTreeSet.cljs$lang$type = true;
cljs.core.PersistentTreeSet.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/PersistentTreeSet")
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__11644 = this;
  var h__2192__auto____11645 = this__11644.__hash;
  if(!(h__2192__auto____11645 == null)) {
    return h__2192__auto____11645
  }else {
    var h__2192__auto____11646 = cljs.core.hash_iset(coll);
    this__11644.__hash = h__2192__auto____11646;
    return h__2192__auto____11646
  }
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, v) {
  var this__11647 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, v, null)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, v, not_found) {
  var this__11648 = this;
  if(cljs.core.truth_(cljs.core._contains_key_QMARK_(this__11648.tree_map, v))) {
    return v
  }else {
    return not_found
  }
};
cljs.core.PersistentTreeSet.prototype.call = function() {
  var G__11674 = null;
  var G__11674__2 = function(this_sym11649, k) {
    var this__11651 = this;
    var this_sym11649__11652 = this;
    var coll__11653 = this_sym11649__11652;
    return coll__11653.cljs$core$ILookup$_lookup$arity$2(coll__11653, k)
  };
  var G__11674__3 = function(this_sym11650, k, not_found) {
    var this__11651 = this;
    var this_sym11650__11654 = this;
    var coll__11655 = this_sym11650__11654;
    return coll__11655.cljs$core$ILookup$_lookup$arity$3(coll__11655, k, not_found)
  };
  G__11674 = function(this_sym11650, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11674__2.call(this, this_sym11650, k);
      case 3:
        return G__11674__3.call(this, this_sym11650, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11674
}();
cljs.core.PersistentTreeSet.prototype.apply = function(this_sym11642, args11643) {
  var this__11656 = this;
  return this_sym11642.call.apply(this_sym11642, [this_sym11642].concat(args11643.slice()))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__11657 = this;
  return new cljs.core.PersistentTreeSet(this__11657.meta, cljs.core.assoc.cljs$lang$arity$3(this__11657.tree_map, o, null), null)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__11658 = this;
  return cljs.core.map.cljs$lang$arity$2(cljs.core.key, cljs.core.rseq(this__11658.tree_map))
};
cljs.core.PersistentTreeSet.prototype.toString = function() {
  var this__11659 = this;
  var this__11660 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__11660], 0))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_sorted_seq$arity$2 = function(coll, ascending_QMARK_) {
  var this__11661 = this;
  return cljs.core.map.cljs$lang$arity$2(cljs.core.key, cljs.core._sorted_seq(this__11661.tree_map, ascending_QMARK_))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_sorted_seq_from$arity$3 = function(coll, k, ascending_QMARK_) {
  var this__11662 = this;
  return cljs.core.map.cljs$lang$arity$2(cljs.core.key, cljs.core._sorted_seq_from(this__11662.tree_map, k, ascending_QMARK_))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_entry_key$arity$2 = function(coll, entry) {
  var this__11663 = this;
  return entry
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_comparator$arity$1 = function(coll) {
  var this__11664 = this;
  return cljs.core._comparator(this__11664.tree_map)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__11665 = this;
  return cljs.core.keys(this__11665.tree_map)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISet$_disjoin$arity$2 = function(coll, v) {
  var this__11666 = this;
  return new cljs.core.PersistentTreeSet(this__11666.meta, cljs.core.dissoc.cljs$lang$arity$2(this__11666.tree_map, v), null)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__11667 = this;
  return cljs.core.count(this__11667.tree_map)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11668 = this;
  var and__3822__auto____11669 = cljs.core.set_QMARK_(other);
  if(and__3822__auto____11669) {
    var and__3822__auto____11670 = cljs.core.count(coll) === cljs.core.count(other);
    if(and__3822__auto____11670) {
      return cljs.core.every_QMARK_(function(p1__11624_SHARP_) {
        return cljs.core.contains_QMARK_(coll, p1__11624_SHARP_)
      }, other)
    }else {
      return and__3822__auto____11670
    }
  }else {
    return and__3822__auto____11669
  }
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11671 = this;
  return new cljs.core.PersistentTreeSet(meta, this__11671.tree_map, this__11671.__hash)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11672 = this;
  return this__11672.meta
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__11673 = this;
  return cljs.core.with_meta(cljs.core.PersistentTreeSet.EMPTY, this__11673.meta)
};
cljs.core.PersistentTreeSet;
cljs.core.PersistentTreeSet.EMPTY = new cljs.core.PersistentTreeSet(null, cljs.core.sorted_map(), 0);
cljs.core.hash_set = function() {
  var hash_set = null;
  var hash_set__0 = function() {
    return cljs.core.PersistentHashSet.EMPTY
  };
  var hash_set__1 = function() {
    var G__11679__delegate = function(keys) {
      var in__11677 = cljs.core.seq(keys);
      var out__11678 = cljs.core.transient$(cljs.core.PersistentHashSet.EMPTY);
      while(true) {
        if(cljs.core.seq(in__11677)) {
          var G__11680 = cljs.core.next(in__11677);
          var G__11681 = cljs.core.conj_BANG_(out__11678, cljs.core.first(in__11677));
          in__11677 = G__11680;
          out__11678 = G__11681;
          continue
        }else {
          return cljs.core.persistent_BANG_(out__11678)
        }
        break
      }
    };
    var G__11679 = function(var_args) {
      var keys = null;
      if(goog.isDef(var_args)) {
        keys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__11679__delegate.call(this, keys)
    };
    G__11679.cljs$lang$maxFixedArity = 0;
    G__11679.cljs$lang$applyTo = function(arglist__11682) {
      var keys = cljs.core.seq(arglist__11682);
      return G__11679__delegate(keys)
    };
    G__11679.cljs$lang$arity$variadic = G__11679__delegate;
    return G__11679
  }();
  hash_set = function(var_args) {
    var keys = var_args;
    switch(arguments.length) {
      case 0:
        return hash_set__0.call(this);
      default:
        return hash_set__1.cljs$lang$arity$variadic(cljs.core.array_seq(arguments, 0))
    }
    throw"Invalid arity: " + arguments.length;
  };
  hash_set.cljs$lang$maxFixedArity = 0;
  hash_set.cljs$lang$applyTo = hash_set__1.cljs$lang$applyTo;
  hash_set.cljs$lang$arity$0 = hash_set__0;
  hash_set.cljs$lang$arity$variadic = hash_set__1.cljs$lang$arity$variadic;
  return hash_set
}();
cljs.core.set = function set(coll) {
  return cljs.core.apply.cljs$lang$arity$2(cljs.core.hash_set, coll)
};
cljs.core.sorted_set = function() {
  var sorted_set__delegate = function(keys) {
    return cljs.core.reduce.cljs$lang$arity$3(cljs.core._conj, cljs.core.PersistentTreeSet.EMPTY, keys)
  };
  var sorted_set = function(var_args) {
    var keys = null;
    if(goog.isDef(var_args)) {
      keys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return sorted_set__delegate.call(this, keys)
  };
  sorted_set.cljs$lang$maxFixedArity = 0;
  sorted_set.cljs$lang$applyTo = function(arglist__11683) {
    var keys = cljs.core.seq(arglist__11683);
    return sorted_set__delegate(keys)
  };
  sorted_set.cljs$lang$arity$variadic = sorted_set__delegate;
  return sorted_set
}();
cljs.core.sorted_set_by = function() {
  var sorted_set_by__delegate = function(comparator, keys) {
    return cljs.core.reduce.cljs$lang$arity$3(cljs.core._conj, new cljs.core.PersistentTreeSet(null, cljs.core.sorted_map_by(comparator), 0), keys)
  };
  var sorted_set_by = function(comparator, var_args) {
    var keys = null;
    if(goog.isDef(var_args)) {
      keys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return sorted_set_by__delegate.call(this, comparator, keys)
  };
  sorted_set_by.cljs$lang$maxFixedArity = 1;
  sorted_set_by.cljs$lang$applyTo = function(arglist__11685) {
    var comparator = cljs.core.first(arglist__11685);
    var keys = cljs.core.rest(arglist__11685);
    return sorted_set_by__delegate(comparator, keys)
  };
  sorted_set_by.cljs$lang$arity$variadic = sorted_set_by__delegate;
  return sorted_set_by
}();
cljs.core.replace = function replace(smap, coll) {
  if(cljs.core.vector_QMARK_(coll)) {
    var n__11691 = cljs.core.count(coll);
    return cljs.core.reduce.cljs$lang$arity$3(function(v, i) {
      var temp__3971__auto____11692 = cljs.core.find(smap, cljs.core.nth.cljs$lang$arity$2(v, i));
      if(cljs.core.truth_(temp__3971__auto____11692)) {
        var e__11693 = temp__3971__auto____11692;
        return cljs.core.assoc.cljs$lang$arity$3(v, i, cljs.core.second(e__11693))
      }else {
        return v
      }
    }, coll, cljs.core.take(n__11691, cljs.core.iterate(cljs.core.inc, 0)))
  }else {
    return cljs.core.map.cljs$lang$arity$2(function(p1__11684_SHARP_) {
      var temp__3971__auto____11694 = cljs.core.find(smap, p1__11684_SHARP_);
      if(cljs.core.truth_(temp__3971__auto____11694)) {
        var e__11695 = temp__3971__auto____11694;
        return cljs.core.second(e__11695)
      }else {
        return p1__11684_SHARP_
      }
    }, coll)
  }
};
cljs.core.distinct = function distinct(coll) {
  var step__11725 = function step(xs, seen) {
    return new cljs.core.LazySeq(null, false, function() {
      return function(p__11718, seen) {
        while(true) {
          var vec__11719__11720 = p__11718;
          var f__11721 = cljs.core.nth.cljs$lang$arity$3(vec__11719__11720, 0, null);
          var xs__11722 = vec__11719__11720;
          var temp__3974__auto____11723 = cljs.core.seq(xs__11722);
          if(temp__3974__auto____11723) {
            var s__11724 = temp__3974__auto____11723;
            if(cljs.core.contains_QMARK_(seen, f__11721)) {
              var G__11726 = cljs.core.rest(s__11724);
              var G__11727 = seen;
              p__11718 = G__11726;
              seen = G__11727;
              continue
            }else {
              return cljs.core.cons(f__11721, step(cljs.core.rest(s__11724), cljs.core.conj.cljs$lang$arity$2(seen, f__11721)))
            }
          }else {
            return null
          }
          break
        }
      }.call(null, xs, seen)
    }, null)
  };
  return step__11725.cljs$lang$arity$2 ? step__11725.cljs$lang$arity$2(coll, cljs.core.PersistentHashSet.EMPTY) : step__11725.call(null, coll, cljs.core.PersistentHashSet.EMPTY)
};
cljs.core.butlast = function butlast(s) {
  var ret__11730 = cljs.core.PersistentVector.EMPTY;
  var s__11731 = s;
  while(true) {
    if(cljs.core.next(s__11731)) {
      var G__11732 = cljs.core.conj.cljs$lang$arity$2(ret__11730, cljs.core.first(s__11731));
      var G__11733 = cljs.core.next(s__11731);
      ret__11730 = G__11732;
      s__11731 = G__11733;
      continue
    }else {
      return cljs.core.seq(ret__11730)
    }
    break
  }
};
cljs.core.name = function name(x) {
  if(cljs.core.string_QMARK_(x)) {
    return x
  }else {
    if(function() {
      var or__3824__auto____11736 = cljs.core.keyword_QMARK_(x);
      if(or__3824__auto____11736) {
        return or__3824__auto____11736
      }else {
        return cljs.core.symbol_QMARK_(x)
      }
    }()) {
      var i__11737 = x.lastIndexOf("/");
      if(i__11737 < 0) {
        return cljs.core.subs.cljs$lang$arity$2(x, 2)
      }else {
        return cljs.core.subs.cljs$lang$arity$2(x, i__11737 + 1)
      }
    }else {
      if("\ufdd0'else") {
        throw new Error([cljs.core.str("Doesn't support name: "), cljs.core.str(x)].join(""));
      }else {
        return null
      }
    }
  }
};
cljs.core.namespace = function namespace(x) {
  if(function() {
    var or__3824__auto____11740 = cljs.core.keyword_QMARK_(x);
    if(or__3824__auto____11740) {
      return or__3824__auto____11740
    }else {
      return cljs.core.symbol_QMARK_(x)
    }
  }()) {
    var i__11741 = x.lastIndexOf("/");
    if(i__11741 > -1) {
      return cljs.core.subs.cljs$lang$arity$3(x, 2, i__11741)
    }else {
      return null
    }
  }else {
    throw new Error([cljs.core.str("Doesn't support namespace: "), cljs.core.str(x)].join(""));
  }
};
cljs.core.zipmap = function zipmap(keys, vals) {
  var map__11748 = cljs.core.ObjMap.EMPTY;
  var ks__11749 = cljs.core.seq(keys);
  var vs__11750 = cljs.core.seq(vals);
  while(true) {
    if(function() {
      var and__3822__auto____11751 = ks__11749;
      if(and__3822__auto____11751) {
        return vs__11750
      }else {
        return and__3822__auto____11751
      }
    }()) {
      var G__11752 = cljs.core.assoc.cljs$lang$arity$3(map__11748, cljs.core.first(ks__11749), cljs.core.first(vs__11750));
      var G__11753 = cljs.core.next(ks__11749);
      var G__11754 = cljs.core.next(vs__11750);
      map__11748 = G__11752;
      ks__11749 = G__11753;
      vs__11750 = G__11754;
      continue
    }else {
      return map__11748
    }
    break
  }
};
cljs.core.max_key = function() {
  var max_key = null;
  var max_key__2 = function(k, x) {
    return x
  };
  var max_key__3 = function(k, x, y) {
    if((k.cljs$lang$arity$1 ? k.cljs$lang$arity$1(x) : k.call(null, x)) > (k.cljs$lang$arity$1 ? k.cljs$lang$arity$1(y) : k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var max_key__4 = function() {
    var G__11757__delegate = function(k, x, y, more) {
      return cljs.core.reduce.cljs$lang$arity$3(function(p1__11742_SHARP_, p2__11743_SHARP_) {
        return max_key.cljs$lang$arity$3(k, p1__11742_SHARP_, p2__11743_SHARP_)
      }, max_key.cljs$lang$arity$3(k, x, y), more)
    };
    var G__11757 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__11757__delegate.call(this, k, x, y, more)
    };
    G__11757.cljs$lang$maxFixedArity = 3;
    G__11757.cljs$lang$applyTo = function(arglist__11758) {
      var k = cljs.core.first(arglist__11758);
      var x = cljs.core.first(cljs.core.next(arglist__11758));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11758)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11758)));
      return G__11757__delegate(k, x, y, more)
    };
    G__11757.cljs$lang$arity$variadic = G__11757__delegate;
    return G__11757
  }();
  max_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return max_key__2.call(this, k, x);
      case 3:
        return max_key__3.call(this, k, x, y);
      default:
        return max_key__4.cljs$lang$arity$variadic(k, x, y, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  max_key.cljs$lang$maxFixedArity = 3;
  max_key.cljs$lang$applyTo = max_key__4.cljs$lang$applyTo;
  max_key.cljs$lang$arity$2 = max_key__2;
  max_key.cljs$lang$arity$3 = max_key__3;
  max_key.cljs$lang$arity$variadic = max_key__4.cljs$lang$arity$variadic;
  return max_key
}();
cljs.core.min_key = function() {
  var min_key = null;
  var min_key__2 = function(k, x) {
    return x
  };
  var min_key__3 = function(k, x, y) {
    if((k.cljs$lang$arity$1 ? k.cljs$lang$arity$1(x) : k.call(null, x)) < (k.cljs$lang$arity$1 ? k.cljs$lang$arity$1(y) : k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var min_key__4 = function() {
    var G__11759__delegate = function(k, x, y, more) {
      return cljs.core.reduce.cljs$lang$arity$3(function(p1__11755_SHARP_, p2__11756_SHARP_) {
        return min_key.cljs$lang$arity$3(k, p1__11755_SHARP_, p2__11756_SHARP_)
      }, min_key.cljs$lang$arity$3(k, x, y), more)
    };
    var G__11759 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__11759__delegate.call(this, k, x, y, more)
    };
    G__11759.cljs$lang$maxFixedArity = 3;
    G__11759.cljs$lang$applyTo = function(arglist__11760) {
      var k = cljs.core.first(arglist__11760);
      var x = cljs.core.first(cljs.core.next(arglist__11760));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11760)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11760)));
      return G__11759__delegate(k, x, y, more)
    };
    G__11759.cljs$lang$arity$variadic = G__11759__delegate;
    return G__11759
  }();
  min_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return min_key__2.call(this, k, x);
      case 3:
        return min_key__3.call(this, k, x, y);
      default:
        return min_key__4.cljs$lang$arity$variadic(k, x, y, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  min_key.cljs$lang$maxFixedArity = 3;
  min_key.cljs$lang$applyTo = min_key__4.cljs$lang$applyTo;
  min_key.cljs$lang$arity$2 = min_key__2;
  min_key.cljs$lang$arity$3 = min_key__3;
  min_key.cljs$lang$arity$variadic = min_key__4.cljs$lang$arity$variadic;
  return min_key
}();
cljs.core.partition_all = function() {
  var partition_all = null;
  var partition_all__2 = function(n, coll) {
    return partition_all.cljs$lang$arity$3(n, n, coll)
  };
  var partition_all__3 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____11763 = cljs.core.seq(coll);
      if(temp__3974__auto____11763) {
        var s__11764 = temp__3974__auto____11763;
        return cljs.core.cons(cljs.core.take(n, s__11764), partition_all.cljs$lang$arity$3(n, step, cljs.core.drop(step, s__11764)))
      }else {
        return null
      }
    }, null)
  };
  partition_all = function(n, step, coll) {
    switch(arguments.length) {
      case 2:
        return partition_all__2.call(this, n, step);
      case 3:
        return partition_all__3.call(this, n, step, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  partition_all.cljs$lang$arity$2 = partition_all__2;
  partition_all.cljs$lang$arity$3 = partition_all__3;
  return partition_all
}();
cljs.core.take_while = function take_while(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____11767 = cljs.core.seq(coll);
    if(temp__3974__auto____11767) {
      var s__11768 = temp__3974__auto____11767;
      if(cljs.core.truth_(pred.cljs$lang$arity$1 ? pred.cljs$lang$arity$1(cljs.core.first(s__11768)) : pred.call(null, cljs.core.first(s__11768)))) {
        return cljs.core.cons(cljs.core.first(s__11768), take_while(pred, cljs.core.rest(s__11768)))
      }else {
        return null
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.mk_bound_fn = function mk_bound_fn(sc, test, key) {
  return function(e) {
    var comp__11770 = cljs.core._comparator(sc);
    return test.cljs$lang$arity$2 ? test.cljs$lang$arity$2(comp__11770.cljs$lang$arity$2 ? comp__11770.cljs$lang$arity$2(cljs.core._entry_key(sc, e), key) : comp__11770.call(null, cljs.core._entry_key(sc, e), key), 0) : test.call(null, comp__11770.cljs$lang$arity$2 ? comp__11770.cljs$lang$arity$2(cljs.core._entry_key(sc, e), key) : comp__11770.call(null, cljs.core._entry_key(sc, e), key), 0)
  }
};
cljs.core.subseq = function() {
  var subseq = null;
  var subseq__3 = function(sc, test, key) {
    var include__11782 = cljs.core.mk_bound_fn(sc, test, key);
    if(cljs.core.truth_(cljs.core.PersistentHashSet.fromArray([cljs.core._GT_, cljs.core._GT__EQ_]).call(null, test))) {
      var temp__3974__auto____11783 = cljs.core._sorted_seq_from(sc, key, true);
      if(cljs.core.truth_(temp__3974__auto____11783)) {
        var vec__11784__11785 = temp__3974__auto____11783;
        var e__11786 = cljs.core.nth.cljs$lang$arity$3(vec__11784__11785, 0, null);
        var s__11787 = vec__11784__11785;
        if(cljs.core.truth_(include__11782.cljs$lang$arity$1 ? include__11782.cljs$lang$arity$1(e__11786) : include__11782.call(null, e__11786))) {
          return s__11787
        }else {
          return cljs.core.next(s__11787)
        }
      }else {
        return null
      }
    }else {
      return cljs.core.take_while(include__11782, cljs.core._sorted_seq(sc, true))
    }
  };
  var subseq__5 = function(sc, start_test, start_key, end_test, end_key) {
    var temp__3974__auto____11788 = cljs.core._sorted_seq_from(sc, start_key, true);
    if(cljs.core.truth_(temp__3974__auto____11788)) {
      var vec__11789__11790 = temp__3974__auto____11788;
      var e__11791 = cljs.core.nth.cljs$lang$arity$3(vec__11789__11790, 0, null);
      var s__11792 = vec__11789__11790;
      return cljs.core.take_while(cljs.core.mk_bound_fn(sc, end_test, end_key), cljs.core.truth_(cljs.core.mk_bound_fn(sc, start_test, start_key).call(null, e__11791)) ? s__11792 : cljs.core.next(s__11792))
    }else {
      return null
    }
  };
  subseq = function(sc, start_test, start_key, end_test, end_key) {
    switch(arguments.length) {
      case 3:
        return subseq__3.call(this, sc, start_test, start_key);
      case 5:
        return subseq__5.call(this, sc, start_test, start_key, end_test, end_key)
    }
    throw"Invalid arity: " + arguments.length;
  };
  subseq.cljs$lang$arity$3 = subseq__3;
  subseq.cljs$lang$arity$5 = subseq__5;
  return subseq
}();
cljs.core.rsubseq = function() {
  var rsubseq = null;
  var rsubseq__3 = function(sc, test, key) {
    var include__11804 = cljs.core.mk_bound_fn(sc, test, key);
    if(cljs.core.truth_(cljs.core.PersistentHashSet.fromArray([cljs.core._LT_, cljs.core._LT__EQ_]).call(null, test))) {
      var temp__3974__auto____11805 = cljs.core._sorted_seq_from(sc, key, false);
      if(cljs.core.truth_(temp__3974__auto____11805)) {
        var vec__11806__11807 = temp__3974__auto____11805;
        var e__11808 = cljs.core.nth.cljs$lang$arity$3(vec__11806__11807, 0, null);
        var s__11809 = vec__11806__11807;
        if(cljs.core.truth_(include__11804.cljs$lang$arity$1 ? include__11804.cljs$lang$arity$1(e__11808) : include__11804.call(null, e__11808))) {
          return s__11809
        }else {
          return cljs.core.next(s__11809)
        }
      }else {
        return null
      }
    }else {
      return cljs.core.take_while(include__11804, cljs.core._sorted_seq(sc, false))
    }
  };
  var rsubseq__5 = function(sc, start_test, start_key, end_test, end_key) {
    var temp__3974__auto____11810 = cljs.core._sorted_seq_from(sc, end_key, false);
    if(cljs.core.truth_(temp__3974__auto____11810)) {
      var vec__11811__11812 = temp__3974__auto____11810;
      var e__11813 = cljs.core.nth.cljs$lang$arity$3(vec__11811__11812, 0, null);
      var s__11814 = vec__11811__11812;
      return cljs.core.take_while(cljs.core.mk_bound_fn(sc, start_test, start_key), cljs.core.truth_(cljs.core.mk_bound_fn(sc, end_test, end_key).call(null, e__11813)) ? s__11814 : cljs.core.next(s__11814))
    }else {
      return null
    }
  };
  rsubseq = function(sc, start_test, start_key, end_test, end_key) {
    switch(arguments.length) {
      case 3:
        return rsubseq__3.call(this, sc, start_test, start_key);
      case 5:
        return rsubseq__5.call(this, sc, start_test, start_key, end_test, end_key)
    }
    throw"Invalid arity: " + arguments.length;
  };
  rsubseq.cljs$lang$arity$3 = rsubseq__3;
  rsubseq.cljs$lang$arity$5 = rsubseq__5;
  return rsubseq
}();
cljs.core.Range = function(meta, start, end, step, __hash) {
  this.meta = meta;
  this.start = start;
  this.end = end;
  this.step = step;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32375006
};
cljs.core.Range.cljs$lang$type = true;
cljs.core.Range.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/Range")
};
cljs.core.Range.prototype.cljs$core$IHash$_hash$arity$1 = function(rng) {
  var this__11815 = this;
  var h__2192__auto____11816 = this__11815.__hash;
  if(!(h__2192__auto____11816 == null)) {
    return h__2192__auto____11816
  }else {
    var h__2192__auto____11817 = cljs.core.hash_coll(rng);
    this__11815.__hash = h__2192__auto____11817;
    return h__2192__auto____11817
  }
};
cljs.core.Range.prototype.cljs$core$INext$_next$arity$1 = function(rng) {
  var this__11818 = this;
  if(this__11818.step > 0) {
    if(this__11818.start + this__11818.step < this__11818.end) {
      return new cljs.core.Range(this__11818.meta, this__11818.start + this__11818.step, this__11818.end, this__11818.step, null)
    }else {
      return null
    }
  }else {
    if(this__11818.start + this__11818.step > this__11818.end) {
      return new cljs.core.Range(this__11818.meta, this__11818.start + this__11818.step, this__11818.end, this__11818.step, null)
    }else {
      return null
    }
  }
};
cljs.core.Range.prototype.cljs$core$ICollection$_conj$arity$2 = function(rng, o) {
  var this__11819 = this;
  return cljs.core.cons(o, rng)
};
cljs.core.Range.prototype.toString = function() {
  var this__11820 = this;
  var this__11821 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__11821], 0))
};
cljs.core.Range.prototype.cljs$core$IReduce$_reduce$arity$2 = function(rng, f) {
  var this__11822 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$2(rng, f)
};
cljs.core.Range.prototype.cljs$core$IReduce$_reduce$arity$3 = function(rng, f, s) {
  var this__11823 = this;
  return cljs.core.ci_reduce.cljs$lang$arity$3(rng, f, s)
};
cljs.core.Range.prototype.cljs$core$ISeqable$_seq$arity$1 = function(rng) {
  var this__11824 = this;
  if(this__11824.step > 0) {
    if(this__11824.start < this__11824.end) {
      return rng
    }else {
      return null
    }
  }else {
    if(this__11824.start > this__11824.end) {
      return rng
    }else {
      return null
    }
  }
};
cljs.core.Range.prototype.cljs$core$ICounted$_count$arity$1 = function(rng) {
  var this__11825 = this;
  if(cljs.core.not(rng.cljs$core$ISeqable$_seq$arity$1(rng))) {
    return 0
  }else {
    return Math.ceil((this__11825.end - this__11825.start) / this__11825.step)
  }
};
cljs.core.Range.prototype.cljs$core$ISeq$_first$arity$1 = function(rng) {
  var this__11826 = this;
  return this__11826.start
};
cljs.core.Range.prototype.cljs$core$ISeq$_rest$arity$1 = function(rng) {
  var this__11827 = this;
  if(!(rng.cljs$core$ISeqable$_seq$arity$1(rng) == null)) {
    return new cljs.core.Range(this__11827.meta, this__11827.start + this__11827.step, this__11827.end, this__11827.step, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(rng, other) {
  var this__11828 = this;
  return cljs.core.equiv_sequential(rng, other)
};
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(rng, meta) {
  var this__11829 = this;
  return new cljs.core.Range(meta, this__11829.start, this__11829.end, this__11829.step, this__11829.__hash)
};
cljs.core.Range.prototype.cljs$core$IMeta$_meta$arity$1 = function(rng) {
  var this__11830 = this;
  return this__11830.meta
};
cljs.core.Range.prototype.cljs$core$IIndexed$_nth$arity$2 = function(rng, n) {
  var this__11831 = this;
  if(n < rng.cljs$core$ICounted$_count$arity$1(rng)) {
    return this__11831.start + n * this__11831.step
  }else {
    if(function() {
      var and__3822__auto____11832 = this__11831.start > this__11831.end;
      if(and__3822__auto____11832) {
        return this__11831.step === 0
      }else {
        return and__3822__auto____11832
      }
    }()) {
      return this__11831.start
    }else {
      throw new Error("Index out of bounds");
    }
  }
};
cljs.core.Range.prototype.cljs$core$IIndexed$_nth$arity$3 = function(rng, n, not_found) {
  var this__11833 = this;
  if(n < rng.cljs$core$ICounted$_count$arity$1(rng)) {
    return this__11833.start + n * this__11833.step
  }else {
    if(function() {
      var and__3822__auto____11834 = this__11833.start > this__11833.end;
      if(and__3822__auto____11834) {
        return this__11833.step === 0
      }else {
        return and__3822__auto____11834
      }
    }()) {
      return this__11833.start
    }else {
      return not_found
    }
  }
};
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(rng) {
  var this__11835 = this;
  return cljs.core.with_meta(cljs.core.List.EMPTY, this__11835.meta)
};
cljs.core.Range;
cljs.core.range = function() {
  var range = null;
  var range__0 = function() {
    return range.cljs$lang$arity$3(0, Number.MAX_VALUE, 1)
  };
  var range__1 = function(end) {
    return range.cljs$lang$arity$3(0, end, 1)
  };
  var range__2 = function(start, end) {
    return range.cljs$lang$arity$3(start, end, 1)
  };
  var range__3 = function(start, end, step) {
    return new cljs.core.Range(null, start, end, step, null)
  };
  range = function(start, end, step) {
    switch(arguments.length) {
      case 0:
        return range__0.call(this);
      case 1:
        return range__1.call(this, start);
      case 2:
        return range__2.call(this, start, end);
      case 3:
        return range__3.call(this, start, end, step)
    }
    throw"Invalid arity: " + arguments.length;
  };
  range.cljs$lang$arity$0 = range__0;
  range.cljs$lang$arity$1 = range__1;
  range.cljs$lang$arity$2 = range__2;
  range.cljs$lang$arity$3 = range__3;
  return range
}();
cljs.core.take_nth = function take_nth(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____11838 = cljs.core.seq(coll);
    if(temp__3974__auto____11838) {
      var s__11839 = temp__3974__auto____11838;
      return cljs.core.cons(cljs.core.first(s__11839), take_nth(n, cljs.core.drop(n, s__11839)))
    }else {
      return null
    }
  }, null)
};
cljs.core.split_with = function split_with(pred, coll) {
  return cljs.core.PersistentVector.fromArray([cljs.core.take_while(pred, coll), cljs.core.drop_while(pred, coll)], true)
};
cljs.core.partition_by = function partition_by(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____11846 = cljs.core.seq(coll);
    if(temp__3974__auto____11846) {
      var s__11847 = temp__3974__auto____11846;
      var fst__11848 = cljs.core.first(s__11847);
      var fv__11849 = f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(fst__11848) : f.call(null, fst__11848);
      var run__11850 = cljs.core.cons(fst__11848, cljs.core.take_while(function(p1__11840_SHARP_) {
        return cljs.core._EQ_.cljs$lang$arity$2(fv__11849, f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(p1__11840_SHARP_) : f.call(null, p1__11840_SHARP_))
      }, cljs.core.next(s__11847)));
      return cljs.core.cons(run__11850, partition_by(f, cljs.core.seq(cljs.core.drop(cljs.core.count(run__11850), s__11847))))
    }else {
      return null
    }
  }, null)
};
cljs.core.frequencies = function frequencies(coll) {
  return cljs.core.persistent_BANG_(cljs.core.reduce.cljs$lang$arity$3(function(counts, x) {
    return cljs.core.assoc_BANG_(counts, x, cljs.core._lookup.cljs$lang$arity$3(counts, x, 0) + 1)
  }, cljs.core.transient$(cljs.core.ObjMap.EMPTY), coll))
};
cljs.core.reductions = function() {
  var reductions = null;
  var reductions__2 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3971__auto____11865 = cljs.core.seq(coll);
      if(temp__3971__auto____11865) {
        var s__11866 = temp__3971__auto____11865;
        return reductions.cljs$lang$arity$3(f, cljs.core.first(s__11866), cljs.core.rest(s__11866))
      }else {
        return cljs.core.list.cljs$lang$arity$1(f.cljs$lang$arity$0 ? f.cljs$lang$arity$0() : f.call(null))
      }
    }, null)
  };
  var reductions__3 = function(f, init, coll) {
    return cljs.core.cons(init, new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____11867 = cljs.core.seq(coll);
      if(temp__3974__auto____11867) {
        var s__11868 = temp__3974__auto____11867;
        return reductions.cljs$lang$arity$3(f, f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(init, cljs.core.first(s__11868)) : f.call(null, init, cljs.core.first(s__11868)), cljs.core.rest(s__11868))
      }else {
        return null
      }
    }, null))
  };
  reductions = function(f, init, coll) {
    switch(arguments.length) {
      case 2:
        return reductions__2.call(this, f, init);
      case 3:
        return reductions__3.call(this, f, init, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  reductions.cljs$lang$arity$2 = reductions__2;
  reductions.cljs$lang$arity$3 = reductions__3;
  return reductions
}();
cljs.core.juxt = function() {
  var juxt = null;
  var juxt__1 = function(f) {
    return function() {
      var G__11871 = null;
      var G__11871__0 = function() {
        return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([f.cljs$lang$arity$0 ? f.cljs$lang$arity$0() : f.call(null)], 0))
      };
      var G__11871__1 = function(x) {
        return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(x) : f.call(null, x)], 0))
      };
      var G__11871__2 = function(x, y) {
        return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(x, y) : f.call(null, x, y)], 0))
      };
      var G__11871__3 = function(x, y, z) {
        return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(x, y, z) : f.call(null, x, y, z)], 0))
      };
      var G__11871__4 = function() {
        var G__11872__delegate = function(x, y, z, args) {
          return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([cljs.core.apply.cljs$lang$arity$5(f, x, y, z, args)], 0))
        };
        var G__11872 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__11872__delegate.call(this, x, y, z, args)
        };
        G__11872.cljs$lang$maxFixedArity = 3;
        G__11872.cljs$lang$applyTo = function(arglist__11873) {
          var x = cljs.core.first(arglist__11873);
          var y = cljs.core.first(cljs.core.next(arglist__11873));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11873)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11873)));
          return G__11872__delegate(x, y, z, args)
        };
        G__11872.cljs$lang$arity$variadic = G__11872__delegate;
        return G__11872
      }();
      G__11871 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__11871__0.call(this);
          case 1:
            return G__11871__1.call(this, x);
          case 2:
            return G__11871__2.call(this, x, y);
          case 3:
            return G__11871__3.call(this, x, y, z);
          default:
            return G__11871__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__11871.cljs$lang$maxFixedArity = 3;
      G__11871.cljs$lang$applyTo = G__11871__4.cljs$lang$applyTo;
      return G__11871
    }()
  };
  var juxt__2 = function(f, g) {
    return function() {
      var G__11874 = null;
      var G__11874__0 = function() {
        return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([f.cljs$lang$arity$0 ? f.cljs$lang$arity$0() : f.call(null), g.cljs$lang$arity$0 ? g.cljs$lang$arity$0() : g.call(null)], 0))
      };
      var G__11874__1 = function(x) {
        return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(x) : f.call(null, x), g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(x) : g.call(null, x)], 0))
      };
      var G__11874__2 = function(x, y) {
        return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(x, y) : f.call(null, x, y), g.cljs$lang$arity$2 ? g.cljs$lang$arity$2(x, y) : g.call(null, x, y)], 0))
      };
      var G__11874__3 = function(x, y, z) {
        return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(x, y, z) : f.call(null, x, y, z), g.cljs$lang$arity$3 ? g.cljs$lang$arity$3(x, y, z) : g.call(null, x, y, z)], 0))
      };
      var G__11874__4 = function() {
        var G__11875__delegate = function(x, y, z, args) {
          return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([cljs.core.apply.cljs$lang$arity$5(f, x, y, z, args), cljs.core.apply.cljs$lang$arity$5(g, x, y, z, args)], 0))
        };
        var G__11875 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__11875__delegate.call(this, x, y, z, args)
        };
        G__11875.cljs$lang$maxFixedArity = 3;
        G__11875.cljs$lang$applyTo = function(arglist__11876) {
          var x = cljs.core.first(arglist__11876);
          var y = cljs.core.first(cljs.core.next(arglist__11876));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11876)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11876)));
          return G__11875__delegate(x, y, z, args)
        };
        G__11875.cljs$lang$arity$variadic = G__11875__delegate;
        return G__11875
      }();
      G__11874 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__11874__0.call(this);
          case 1:
            return G__11874__1.call(this, x);
          case 2:
            return G__11874__2.call(this, x, y);
          case 3:
            return G__11874__3.call(this, x, y, z);
          default:
            return G__11874__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__11874.cljs$lang$maxFixedArity = 3;
      G__11874.cljs$lang$applyTo = G__11874__4.cljs$lang$applyTo;
      return G__11874
    }()
  };
  var juxt__3 = function(f, g, h) {
    return function() {
      var G__11877 = null;
      var G__11877__0 = function() {
        return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([f.cljs$lang$arity$0 ? f.cljs$lang$arity$0() : f.call(null), g.cljs$lang$arity$0 ? g.cljs$lang$arity$0() : g.call(null), h.cljs$lang$arity$0 ? h.cljs$lang$arity$0() : h.call(null)], 0))
      };
      var G__11877__1 = function(x) {
        return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(x) : f.call(null, x), g.cljs$lang$arity$1 ? g.cljs$lang$arity$1(x) : g.call(null, x), h.cljs$lang$arity$1 ? h.cljs$lang$arity$1(x) : h.call(null, x)], 0))
      };
      var G__11877__2 = function(x, y) {
        return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(x, y) : f.call(null, x, y), g.cljs$lang$arity$2 ? g.cljs$lang$arity$2(x, y) : g.call(null, x, y), h.cljs$lang$arity$2 ? h.cljs$lang$arity$2(x, y) : h.call(null, x, y)], 0))
      };
      var G__11877__3 = function(x, y, z) {
        return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(x, y, z) : f.call(null, x, y, z), g.cljs$lang$arity$3 ? g.cljs$lang$arity$3(x, y, z) : g.call(null, x, y, z), h.cljs$lang$arity$3 ? h.cljs$lang$arity$3(x, y, z) : h.call(null, x, y, z)], 0))
      };
      var G__11877__4 = function() {
        var G__11878__delegate = function(x, y, z, args) {
          return cljs.core.vector.cljs$lang$arity$variadic(cljs.core.array_seq([cljs.core.apply.cljs$lang$arity$5(f, x, y, z, args), cljs.core.apply.cljs$lang$arity$5(g, x, y, z, args), cljs.core.apply.cljs$lang$arity$5(h, x, y, z, args)], 0))
        };
        var G__11878 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__11878__delegate.call(this, x, y, z, args)
        };
        G__11878.cljs$lang$maxFixedArity = 3;
        G__11878.cljs$lang$applyTo = function(arglist__11879) {
          var x = cljs.core.first(arglist__11879);
          var y = cljs.core.first(cljs.core.next(arglist__11879));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11879)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11879)));
          return G__11878__delegate(x, y, z, args)
        };
        G__11878.cljs$lang$arity$variadic = G__11878__delegate;
        return G__11878
      }();
      G__11877 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__11877__0.call(this);
          case 1:
            return G__11877__1.call(this, x);
          case 2:
            return G__11877__2.call(this, x, y);
          case 3:
            return G__11877__3.call(this, x, y, z);
          default:
            return G__11877__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__11877.cljs$lang$maxFixedArity = 3;
      G__11877.cljs$lang$applyTo = G__11877__4.cljs$lang$applyTo;
      return G__11877
    }()
  };
  var juxt__4 = function() {
    var G__11880__delegate = function(f, g, h, fs) {
      var fs__11870 = cljs.core.list_STAR_.cljs$lang$arity$4(f, g, h, fs);
      return function() {
        var G__11881 = null;
        var G__11881__0 = function() {
          return cljs.core.reduce.cljs$lang$arity$3(function(p1__11851_SHARP_, p2__11852_SHARP_) {
            return cljs.core.conj.cljs$lang$arity$2(p1__11851_SHARP_, p2__11852_SHARP_.cljs$lang$arity$0 ? p2__11852_SHARP_.cljs$lang$arity$0() : p2__11852_SHARP_.call(null))
          }, cljs.core.PersistentVector.EMPTY, fs__11870)
        };
        var G__11881__1 = function(x) {
          return cljs.core.reduce.cljs$lang$arity$3(function(p1__11853_SHARP_, p2__11854_SHARP_) {
            return cljs.core.conj.cljs$lang$arity$2(p1__11853_SHARP_, p2__11854_SHARP_.cljs$lang$arity$1 ? p2__11854_SHARP_.cljs$lang$arity$1(x) : p2__11854_SHARP_.call(null, x))
          }, cljs.core.PersistentVector.EMPTY, fs__11870)
        };
        var G__11881__2 = function(x, y) {
          return cljs.core.reduce.cljs$lang$arity$3(function(p1__11855_SHARP_, p2__11856_SHARP_) {
            return cljs.core.conj.cljs$lang$arity$2(p1__11855_SHARP_, p2__11856_SHARP_.cljs$lang$arity$2 ? p2__11856_SHARP_.cljs$lang$arity$2(x, y) : p2__11856_SHARP_.call(null, x, y))
          }, cljs.core.PersistentVector.EMPTY, fs__11870)
        };
        var G__11881__3 = function(x, y, z) {
          return cljs.core.reduce.cljs$lang$arity$3(function(p1__11857_SHARP_, p2__11858_SHARP_) {
            return cljs.core.conj.cljs$lang$arity$2(p1__11857_SHARP_, p2__11858_SHARP_.cljs$lang$arity$3 ? p2__11858_SHARP_.cljs$lang$arity$3(x, y, z) : p2__11858_SHARP_.call(null, x, y, z))
          }, cljs.core.PersistentVector.EMPTY, fs__11870)
        };
        var G__11881__4 = function() {
          var G__11882__delegate = function(x, y, z, args) {
            return cljs.core.reduce.cljs$lang$arity$3(function(p1__11859_SHARP_, p2__11860_SHARP_) {
              return cljs.core.conj.cljs$lang$arity$2(p1__11859_SHARP_, cljs.core.apply.cljs$lang$arity$5(p2__11860_SHARP_, x, y, z, args))
            }, cljs.core.PersistentVector.EMPTY, fs__11870)
          };
          var G__11882 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__11882__delegate.call(this, x, y, z, args)
          };
          G__11882.cljs$lang$maxFixedArity = 3;
          G__11882.cljs$lang$applyTo = function(arglist__11883) {
            var x = cljs.core.first(arglist__11883);
            var y = cljs.core.first(cljs.core.next(arglist__11883));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11883)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11883)));
            return G__11882__delegate(x, y, z, args)
          };
          G__11882.cljs$lang$arity$variadic = G__11882__delegate;
          return G__11882
        }();
        G__11881 = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return G__11881__0.call(this);
            case 1:
              return G__11881__1.call(this, x);
            case 2:
              return G__11881__2.call(this, x, y);
            case 3:
              return G__11881__3.call(this, x, y, z);
            default:
              return G__11881__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
          }
          throw"Invalid arity: " + arguments.length;
        };
        G__11881.cljs$lang$maxFixedArity = 3;
        G__11881.cljs$lang$applyTo = G__11881__4.cljs$lang$applyTo;
        return G__11881
      }()
    };
    var G__11880 = function(f, g, h, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__11880__delegate.call(this, f, g, h, fs)
    };
    G__11880.cljs$lang$maxFixedArity = 3;
    G__11880.cljs$lang$applyTo = function(arglist__11884) {
      var f = cljs.core.first(arglist__11884);
      var g = cljs.core.first(cljs.core.next(arglist__11884));
      var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11884)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11884)));
      return G__11880__delegate(f, g, h, fs)
    };
    G__11880.cljs$lang$arity$variadic = G__11880__delegate;
    return G__11880
  }();
  juxt = function(f, g, h, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 1:
        return juxt__1.call(this, f);
      case 2:
        return juxt__2.call(this, f, g);
      case 3:
        return juxt__3.call(this, f, g, h);
      default:
        return juxt__4.cljs$lang$arity$variadic(f, g, h, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  juxt.cljs$lang$maxFixedArity = 3;
  juxt.cljs$lang$applyTo = juxt__4.cljs$lang$applyTo;
  juxt.cljs$lang$arity$1 = juxt__1;
  juxt.cljs$lang$arity$2 = juxt__2;
  juxt.cljs$lang$arity$3 = juxt__3;
  juxt.cljs$lang$arity$variadic = juxt__4.cljs$lang$arity$variadic;
  return juxt
}();
cljs.core.dorun = function() {
  var dorun = null;
  var dorun__1 = function(coll) {
    while(true) {
      if(cljs.core.seq(coll)) {
        var G__11887 = cljs.core.next(coll);
        coll = G__11887;
        continue
      }else {
        return null
      }
      break
    }
  };
  var dorun__2 = function(n, coll) {
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3822__auto____11886 = cljs.core.seq(coll);
        if(and__3822__auto____11886) {
          return n > 0
        }else {
          return and__3822__auto____11886
        }
      }())) {
        var G__11888 = n - 1;
        var G__11889 = cljs.core.next(coll);
        n = G__11888;
        coll = G__11889;
        continue
      }else {
        return null
      }
      break
    }
  };
  dorun = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return dorun__1.call(this, n);
      case 2:
        return dorun__2.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  dorun.cljs$lang$arity$1 = dorun__1;
  dorun.cljs$lang$arity$2 = dorun__2;
  return dorun
}();
cljs.core.doall = function() {
  var doall = null;
  var doall__1 = function(coll) {
    cljs.core.dorun.cljs$lang$arity$1(coll);
    return coll
  };
  var doall__2 = function(n, coll) {
    cljs.core.dorun.cljs$lang$arity$2(n, coll);
    return coll
  };
  doall = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return doall__1.call(this, n);
      case 2:
        return doall__2.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  doall.cljs$lang$arity$1 = doall__1;
  doall.cljs$lang$arity$2 = doall__2;
  return doall
}();
cljs.core.regexp_QMARK_ = function regexp_QMARK_(o) {
  return o instanceof RegExp
};
cljs.core.re_matches = function re_matches(re, s) {
  var matches__11891 = re.exec(s);
  if(cljs.core._EQ_.cljs$lang$arity$2(cljs.core.first(matches__11891), s)) {
    if(cljs.core.count(matches__11891) === 1) {
      return cljs.core.first(matches__11891)
    }else {
      return cljs.core.vec(matches__11891)
    }
  }else {
    return null
  }
};
cljs.core.re_find = function re_find(re, s) {
  var matches__11893 = re.exec(s);
  if(matches__11893 == null) {
    return null
  }else {
    if(cljs.core.count(matches__11893) === 1) {
      return cljs.core.first(matches__11893)
    }else {
      return cljs.core.vec(matches__11893)
    }
  }
};
cljs.core.re_seq = function re_seq(re, s) {
  var match_data__11898 = cljs.core.re_find(re, s);
  var match_idx__11899 = s.search(re);
  var match_str__11900 = cljs.core.coll_QMARK_(match_data__11898) ? cljs.core.first(match_data__11898) : match_data__11898;
  var post_match__11901 = cljs.core.subs.cljs$lang$arity$2(s, match_idx__11899 + cljs.core.count(match_str__11900));
  if(cljs.core.truth_(match_data__11898)) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons(match_data__11898, re_seq(re, post_match__11901))
    }, null)
  }else {
    return null
  }
};
cljs.core.re_pattern = function re_pattern(s) {
  var vec__11908__11909 = cljs.core.re_find(/^(?:\(\?([idmsux]*)\))?(.*)/, s);
  var ___11910 = cljs.core.nth.cljs$lang$arity$3(vec__11908__11909, 0, null);
  var flags__11911 = cljs.core.nth.cljs$lang$arity$3(vec__11908__11909, 1, null);
  var pattern__11912 = cljs.core.nth.cljs$lang$arity$3(vec__11908__11909, 2, null);
  return new RegExp(pattern__11912, flags__11911)
};
cljs.core.pr_sequential = function pr_sequential(print_one, begin, sep, end, opts, coll) {
  return cljs.core.concat.cljs$lang$arity$variadic(cljs.core.PersistentVector.fromArray([begin], true), cljs.core.flatten1(cljs.core.interpose(cljs.core.PersistentVector.fromArray([sep], true), cljs.core.map.cljs$lang$arity$2(function(p1__11902_SHARP_) {
    return print_one.cljs$lang$arity$2 ? print_one.cljs$lang$arity$2(p1__11902_SHARP_, opts) : print_one.call(null, p1__11902_SHARP_, opts)
  }, coll))), cljs.core.array_seq([cljs.core.PersistentVector.fromArray([end], true)], 0))
};
cljs.core.string_print = function string_print(x) {
  cljs.core._STAR_print_fn_STAR_(x);
  return null
};
cljs.core.flush = function flush() {
  return null
};
cljs.core.pr_seq = function pr_seq(obj, opts) {
  if(obj == null) {
    return cljs.core.list.cljs$lang$arity$1("nil")
  }else {
    if(void 0 === obj) {
      return cljs.core.list.cljs$lang$arity$1("#<undefined>")
    }else {
      if("\ufdd0'else") {
        return cljs.core.concat.cljs$lang$arity$2(cljs.core.truth_(function() {
          var and__3822__auto____11922 = cljs.core._lookup.cljs$lang$arity$3(opts, "\ufdd0'meta", null);
          if(cljs.core.truth_(and__3822__auto____11922)) {
            var and__3822__auto____11926 = function() {
              var G__11923__11924 = obj;
              if(G__11923__11924) {
                if(function() {
                  var or__3824__auto____11925 = G__11923__11924.cljs$lang$protocol_mask$partition0$ & 131072;
                  if(or__3824__auto____11925) {
                    return or__3824__auto____11925
                  }else {
                    return G__11923__11924.cljs$core$IMeta$
                  }
                }()) {
                  return true
                }else {
                  if(!G__11923__11924.cljs$lang$protocol_mask$partition0$) {
                    return cljs.core.type_satisfies_(cljs.core.IMeta, G__11923__11924)
                  }else {
                    return false
                  }
                }
              }else {
                return cljs.core.type_satisfies_(cljs.core.IMeta, G__11923__11924)
              }
            }();
            if(cljs.core.truth_(and__3822__auto____11926)) {
              return cljs.core.meta(obj)
            }else {
              return and__3822__auto____11926
            }
          }else {
            return and__3822__auto____11922
          }
        }()) ? cljs.core.concat.cljs$lang$arity$variadic(cljs.core.PersistentVector.fromArray(["^"], true), pr_seq(cljs.core.meta(obj), opts), cljs.core.array_seq([cljs.core.PersistentVector.fromArray([" "], true)], 0)) : null, function() {
          var and__3822__auto____11927 = !(obj == null);
          if(and__3822__auto____11927) {
            return obj.cljs$lang$type
          }else {
            return and__3822__auto____11927
          }
        }() ? obj.cljs$lang$ctorPrSeq(obj) : function() {
          var G__11928__11929 = obj;
          if(G__11928__11929) {
            if(function() {
              var or__3824__auto____11930 = G__11928__11929.cljs$lang$protocol_mask$partition0$ & 536870912;
              if(or__3824__auto____11930) {
                return or__3824__auto____11930
              }else {
                return G__11928__11929.cljs$core$IPrintable$
              }
            }()) {
              return true
            }else {
              if(!G__11928__11929.cljs$lang$protocol_mask$partition0$) {
                return cljs.core.type_satisfies_(cljs.core.IPrintable, G__11928__11929)
              }else {
                return false
              }
            }
          }else {
            return cljs.core.type_satisfies_(cljs.core.IPrintable, G__11928__11929)
          }
        }() ? cljs.core._pr_seq(obj, opts) : cljs.core.truth_(cljs.core.regexp_QMARK_(obj)) ? cljs.core.list.cljs$lang$arity$3('#"', obj.source, '"') : "\ufdd0'else" ? cljs.core.list.cljs$lang$arity$3("#<", [cljs.core.str(obj)].join(""), ">") : null)
      }else {
        return null
      }
    }
  }
};
cljs.core.pr_sb = function pr_sb(objs, opts) {
  var sb__11950 = new goog.string.StringBuffer;
  var G__11951__11952 = cljs.core.seq(cljs.core.pr_seq(cljs.core.first(objs), opts));
  if(G__11951__11952) {
    var string__11953 = cljs.core.first(G__11951__11952);
    var G__11951__11954 = G__11951__11952;
    while(true) {
      sb__11950.append(string__11953);
      var temp__3974__auto____11955 = cljs.core.next(G__11951__11954);
      if(temp__3974__auto____11955) {
        var G__11951__11956 = temp__3974__auto____11955;
        var G__11969 = cljs.core.first(G__11951__11956);
        var G__11970 = G__11951__11956;
        string__11953 = G__11969;
        G__11951__11954 = G__11970;
        continue
      }else {
      }
      break
    }
  }else {
  }
  var G__11957__11958 = cljs.core.seq(cljs.core.next(objs));
  if(G__11957__11958) {
    var obj__11959 = cljs.core.first(G__11957__11958);
    var G__11957__11960 = G__11957__11958;
    while(true) {
      sb__11950.append(" ");
      var G__11961__11962 = cljs.core.seq(cljs.core.pr_seq(obj__11959, opts));
      if(G__11961__11962) {
        var string__11963 = cljs.core.first(G__11961__11962);
        var G__11961__11964 = G__11961__11962;
        while(true) {
          sb__11950.append(string__11963);
          var temp__3974__auto____11965 = cljs.core.next(G__11961__11964);
          if(temp__3974__auto____11965) {
            var G__11961__11966 = temp__3974__auto____11965;
            var G__11971 = cljs.core.first(G__11961__11966);
            var G__11972 = G__11961__11966;
            string__11963 = G__11971;
            G__11961__11964 = G__11972;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3974__auto____11967 = cljs.core.next(G__11957__11960);
      if(temp__3974__auto____11967) {
        var G__11957__11968 = temp__3974__auto____11967;
        var G__11973 = cljs.core.first(G__11957__11968);
        var G__11974 = G__11957__11968;
        obj__11959 = G__11973;
        G__11957__11960 = G__11974;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return sb__11950
};
cljs.core.pr_str_with_opts = function pr_str_with_opts(objs, opts) {
  return[cljs.core.str(cljs.core.pr_sb(objs, opts))].join("")
};
cljs.core.prn_str_with_opts = function prn_str_with_opts(objs, opts) {
  var sb__11976 = cljs.core.pr_sb(objs, opts);
  sb__11976.append("\n");
  return[cljs.core.str(sb__11976)].join("")
};
cljs.core.pr_with_opts = function pr_with_opts(objs, opts) {
  var G__11995__11996 = cljs.core.seq(cljs.core.pr_seq(cljs.core.first(objs), opts));
  if(G__11995__11996) {
    var string__11997 = cljs.core.first(G__11995__11996);
    var G__11995__11998 = G__11995__11996;
    while(true) {
      cljs.core.string_print(string__11997);
      var temp__3974__auto____11999 = cljs.core.next(G__11995__11998);
      if(temp__3974__auto____11999) {
        var G__11995__12000 = temp__3974__auto____11999;
        var G__12013 = cljs.core.first(G__11995__12000);
        var G__12014 = G__11995__12000;
        string__11997 = G__12013;
        G__11995__11998 = G__12014;
        continue
      }else {
      }
      break
    }
  }else {
  }
  var G__12001__12002 = cljs.core.seq(cljs.core.next(objs));
  if(G__12001__12002) {
    var obj__12003 = cljs.core.first(G__12001__12002);
    var G__12001__12004 = G__12001__12002;
    while(true) {
      cljs.core.string_print(" ");
      var G__12005__12006 = cljs.core.seq(cljs.core.pr_seq(obj__12003, opts));
      if(G__12005__12006) {
        var string__12007 = cljs.core.first(G__12005__12006);
        var G__12005__12008 = G__12005__12006;
        while(true) {
          cljs.core.string_print(string__12007);
          var temp__3974__auto____12009 = cljs.core.next(G__12005__12008);
          if(temp__3974__auto____12009) {
            var G__12005__12010 = temp__3974__auto____12009;
            var G__12015 = cljs.core.first(G__12005__12010);
            var G__12016 = G__12005__12010;
            string__12007 = G__12015;
            G__12005__12008 = G__12016;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3974__auto____12011 = cljs.core.next(G__12001__12004);
      if(temp__3974__auto____12011) {
        var G__12001__12012 = temp__3974__auto____12011;
        var G__12017 = cljs.core.first(G__12001__12012);
        var G__12018 = G__12001__12012;
        obj__12003 = G__12017;
        G__12001__12004 = G__12018;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
};
cljs.core.newline = function newline(opts) {
  cljs.core.string_print("\n");
  if(cljs.core.truth_(cljs.core._lookup.cljs$lang$arity$3(opts, "\ufdd0'flush-on-newline", null))) {
    return cljs.core.flush()
  }else {
    return null
  }
};
cljs.core._STAR_flush_on_newline_STAR_ = true;
cljs.core._STAR_print_readably_STAR_ = true;
cljs.core._STAR_print_meta_STAR_ = false;
cljs.core._STAR_print_dup_STAR_ = false;
cljs.core.pr_opts = function pr_opts() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'flush-on-newline", "\ufdd0'readably", "\ufdd0'meta", "\ufdd0'dup"], {"\ufdd0'flush-on-newline":cljs.core._STAR_flush_on_newline_STAR_, "\ufdd0'readably":cljs.core._STAR_print_readably_STAR_, "\ufdd0'meta":cljs.core._STAR_print_meta_STAR_, "\ufdd0'dup":cljs.core._STAR_print_dup_STAR_})
};
cljs.core.pr_str = function() {
  var pr_str__delegate = function(objs) {
    return cljs.core.pr_str_with_opts(objs, cljs.core.pr_opts())
  };
  var pr_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return pr_str__delegate.call(this, objs)
  };
  pr_str.cljs$lang$maxFixedArity = 0;
  pr_str.cljs$lang$applyTo = function(arglist__12019) {
    var objs = cljs.core.seq(arglist__12019);
    return pr_str__delegate(objs)
  };
  pr_str.cljs$lang$arity$variadic = pr_str__delegate;
  return pr_str
}();
cljs.core.prn_str = function() {
  var prn_str__delegate = function(objs) {
    return cljs.core.prn_str_with_opts(objs, cljs.core.pr_opts())
  };
  var prn_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return prn_str__delegate.call(this, objs)
  };
  prn_str.cljs$lang$maxFixedArity = 0;
  prn_str.cljs$lang$applyTo = function(arglist__12020) {
    var objs = cljs.core.seq(arglist__12020);
    return prn_str__delegate(objs)
  };
  prn_str.cljs$lang$arity$variadic = prn_str__delegate;
  return prn_str
}();
cljs.core.pr = function() {
  var pr__delegate = function(objs) {
    return cljs.core.pr_with_opts(objs, cljs.core.pr_opts())
  };
  var pr = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return pr__delegate.call(this, objs)
  };
  pr.cljs$lang$maxFixedArity = 0;
  pr.cljs$lang$applyTo = function(arglist__12021) {
    var objs = cljs.core.seq(arglist__12021);
    return pr__delegate(objs)
  };
  pr.cljs$lang$arity$variadic = pr__delegate;
  return pr
}();
cljs.core.print = function() {
  var cljs_core_print__delegate = function(objs) {
    return cljs.core.pr_with_opts(objs, cljs.core.assoc.cljs$lang$arity$3(cljs.core.pr_opts(), "\ufdd0'readably", false))
  };
  var cljs_core_print = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return cljs_core_print__delegate.call(this, objs)
  };
  cljs_core_print.cljs$lang$maxFixedArity = 0;
  cljs_core_print.cljs$lang$applyTo = function(arglist__12022) {
    var objs = cljs.core.seq(arglist__12022);
    return cljs_core_print__delegate(objs)
  };
  cljs_core_print.cljs$lang$arity$variadic = cljs_core_print__delegate;
  return cljs_core_print
}();
cljs.core.print_str = function() {
  var print_str__delegate = function(objs) {
    return cljs.core.pr_str_with_opts(objs, cljs.core.assoc.cljs$lang$arity$3(cljs.core.pr_opts(), "\ufdd0'readably", false))
  };
  var print_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return print_str__delegate.call(this, objs)
  };
  print_str.cljs$lang$maxFixedArity = 0;
  print_str.cljs$lang$applyTo = function(arglist__12023) {
    var objs = cljs.core.seq(arglist__12023);
    return print_str__delegate(objs)
  };
  print_str.cljs$lang$arity$variadic = print_str__delegate;
  return print_str
}();
cljs.core.println = function() {
  var println__delegate = function(objs) {
    cljs.core.pr_with_opts(objs, cljs.core.assoc.cljs$lang$arity$3(cljs.core.pr_opts(), "\ufdd0'readably", false));
    return cljs.core.newline(cljs.core.pr_opts())
  };
  var println = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return println__delegate.call(this, objs)
  };
  println.cljs$lang$maxFixedArity = 0;
  println.cljs$lang$applyTo = function(arglist__12024) {
    var objs = cljs.core.seq(arglist__12024);
    return println__delegate(objs)
  };
  println.cljs$lang$arity$variadic = println__delegate;
  return println
}();
cljs.core.println_str = function() {
  var println_str__delegate = function(objs) {
    return cljs.core.prn_str_with_opts(objs, cljs.core.assoc.cljs$lang$arity$3(cljs.core.pr_opts(), "\ufdd0'readably", false))
  };
  var println_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return println_str__delegate.call(this, objs)
  };
  println_str.cljs$lang$maxFixedArity = 0;
  println_str.cljs$lang$applyTo = function(arglist__12025) {
    var objs = cljs.core.seq(arglist__12025);
    return println_str__delegate(objs)
  };
  println_str.cljs$lang$arity$variadic = println_str__delegate;
  return println_str
}();
cljs.core.prn = function() {
  var prn__delegate = function(objs) {
    cljs.core.pr_with_opts(objs, cljs.core.pr_opts());
    return cljs.core.newline(cljs.core.pr_opts())
  };
  var prn = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return prn__delegate.call(this, objs)
  };
  prn.cljs$lang$maxFixedArity = 0;
  prn.cljs$lang$applyTo = function(arglist__12026) {
    var objs = cljs.core.seq(arglist__12026);
    return prn__delegate(objs)
  };
  prn.cljs$lang$arity$variadic = prn__delegate;
  return prn
}();
cljs.core.printf = function() {
  var printf__delegate = function(fmt, args) {
    return cljs.core.print.cljs$lang$arity$variadic(cljs.core.array_seq([cljs.core.apply.cljs$lang$arity$3(cljs.core.format, fmt, args)], 0))
  };
  var printf = function(fmt, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return printf__delegate.call(this, fmt, args)
  };
  printf.cljs$lang$maxFixedArity = 1;
  printf.cljs$lang$applyTo = function(arglist__12027) {
    var fmt = cljs.core.first(arglist__12027);
    var args = cljs.core.rest(arglist__12027);
    return printf__delegate(fmt, args)
  };
  printf.cljs$lang$arity$variadic = printf__delegate;
  return printf
}();
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__12028 = function(keyval) {
    return cljs.core.pr_sequential(cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential(pr_pair__12028, "{", ", ", "}", opts, coll)
};
cljs.core.IPrintable["number"] = true;
cljs.core._pr_seq["number"] = function(n, opts) {
  return cljs.core.list.cljs$lang$arity$1([cljs.core.str(n)].join(""))
};
cljs.core.IndexedSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.Subvec.prototype.cljs$core$IPrintable$ = true;
cljs.core.Subvec.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.ChunkedCons.prototype.cljs$core$IPrintable$ = true;
cljs.core.ChunkedCons.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentTreeMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__12029 = function(keyval) {
    return cljs.core.pr_sequential(cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential(pr_pair__12029, "{", ", ", "}", opts, coll)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentArrayMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__12030 = function(keyval) {
    return cljs.core.pr_sequential(cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential(pr_pair__12030, "{", ", ", "}", opts, coll)
};
cljs.core.PersistentQueue.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "#queue [", " ", "]", opts, cljs.core.seq(coll))
};
cljs.core.LazySeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.LazySeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.RSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.RSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentTreeSet.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "#{", " ", "}", opts, coll)
};
cljs.core.IPrintable["boolean"] = true;
cljs.core._pr_seq["boolean"] = function(bool, opts) {
  return cljs.core.list.cljs$lang$arity$1([cljs.core.str(bool)].join(""))
};
cljs.core.IPrintable["string"] = true;
cljs.core._pr_seq["string"] = function(obj, opts) {
  if(cljs.core.keyword_QMARK_(obj)) {
    return cljs.core.list.cljs$lang$arity$1([cljs.core.str(":"), cljs.core.str(function() {
      var temp__3974__auto____12031 = cljs.core.namespace(obj);
      if(cljs.core.truth_(temp__3974__auto____12031)) {
        var nspc__12032 = temp__3974__auto____12031;
        return[cljs.core.str(nspc__12032), cljs.core.str("/")].join("")
      }else {
        return null
      }
    }()), cljs.core.str(cljs.core.name(obj))].join(""))
  }else {
    if(cljs.core.symbol_QMARK_(obj)) {
      return cljs.core.list.cljs$lang$arity$1([cljs.core.str(function() {
        var temp__3974__auto____12033 = cljs.core.namespace(obj);
        if(cljs.core.truth_(temp__3974__auto____12033)) {
          var nspc__12034 = temp__3974__auto____12033;
          return[cljs.core.str(nspc__12034), cljs.core.str("/")].join("")
        }else {
          return null
        }
      }()), cljs.core.str(cljs.core.name(obj))].join(""))
    }else {
      if("\ufdd0'else") {
        return cljs.core.list.cljs$lang$arity$1(cljs.core.truth_((new cljs.core.Keyword("\ufdd0'readably")).call(null, opts)) ? goog.string.quote(obj) : obj)
      }else {
        return null
      }
    }
  }
};
cljs.core.NodeSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.NodeSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.RedNode.prototype.cljs$core$IPrintable$ = true;
cljs.core.RedNode.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.ChunkedSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentHashMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__12035 = function(keyval) {
    return cljs.core.pr_sequential(cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential(pr_pair__12035, "{", ", ", "}", opts, coll)
};
cljs.core.Vector.prototype.cljs$core$IPrintable$ = true;
cljs.core.Vector.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.PersistentHashSet.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentHashSet.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "#{", " ", "}", opts, coll)
};
cljs.core.PersistentVector.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.List.prototype.cljs$core$IPrintable$ = true;
cljs.core.List.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.IPrintable["array"] = true;
cljs.core._pr_seq["array"] = function(a, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "#<Array [", ", ", "]>", opts, a)
};
cljs.core.IPrintable["function"] = true;
cljs.core._pr_seq["function"] = function(this$) {
  return cljs.core.list.cljs$lang$arity$3("#<", [cljs.core.str(this$)].join(""), ">")
};
cljs.core.EmptyList.prototype.cljs$core$IPrintable$ = true;
cljs.core.EmptyList.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.list.cljs$lang$arity$1("()")
};
cljs.core.BlackNode.prototype.cljs$core$IPrintable$ = true;
cljs.core.BlackNode.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
Date.prototype.cljs$core$IPrintable$ = true;
Date.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(d, _) {
  var normalize__12037 = function(n, len) {
    var ns__12036 = [cljs.core.str(n)].join("");
    while(true) {
      if(cljs.core.count(ns__12036) < len) {
        var G__12039 = [cljs.core.str("0"), cljs.core.str(ns__12036)].join("");
        ns__12036 = G__12039;
        continue
      }else {
        return ns__12036
      }
      break
    }
  };
  return cljs.core.list.cljs$lang$arity$1([cljs.core.str('#inst "'), cljs.core.str(d.getUTCFullYear()), cljs.core.str("-"), cljs.core.str(normalize__12037.cljs$lang$arity$2 ? normalize__12037.cljs$lang$arity$2(d.getUTCMonth() + 1, 2) : normalize__12037.call(null, d.getUTCMonth() + 1, 2)), cljs.core.str("-"), cljs.core.str(normalize__12037.cljs$lang$arity$2 ? normalize__12037.cljs$lang$arity$2(d.getUTCDate(), 2) : normalize__12037.call(null, d.getUTCDate(), 2)), cljs.core.str("T"), cljs.core.str(normalize__12037.cljs$lang$arity$2 ? 
  normalize__12037.cljs$lang$arity$2(d.getUTCHours(), 2) : normalize__12037.call(null, d.getUTCHours(), 2)), cljs.core.str(":"), cljs.core.str(normalize__12037.cljs$lang$arity$2 ? normalize__12037.cljs$lang$arity$2(d.getUTCMinutes(), 2) : normalize__12037.call(null, d.getUTCMinutes(), 2)), cljs.core.str(":"), cljs.core.str(normalize__12037.cljs$lang$arity$2 ? normalize__12037.cljs$lang$arity$2(d.getUTCSeconds(), 2) : normalize__12037.call(null, d.getUTCSeconds(), 2)), cljs.core.str("."), cljs.core.str(normalize__12037.cljs$lang$arity$2 ? 
  normalize__12037.cljs$lang$arity$2(d.getUTCMilliseconds(), 3) : normalize__12037.call(null, d.getUTCMilliseconds(), 3)), cljs.core.str("-"), cljs.core.str('00:00"')].join(""))
};
cljs.core.Cons.prototype.cljs$core$IPrintable$ = true;
cljs.core.Cons.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.Range.prototype.cljs$core$IPrintable$ = true;
cljs.core.Range.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.ArrayNodeSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.ObjMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.ObjMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__12038 = function(keyval) {
    return cljs.core.pr_sequential(cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential(pr_pair__12038, "{", ", ", "}", opts, coll)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential(cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.PersistentVector.prototype.cljs$core$IComparable$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IComparable$_compare$arity$2 = function(x, y) {
  return cljs.core.compare_indexed.cljs$lang$arity$2(x, y)
};
cljs.core.Atom = function(state, meta, validator, watches) {
  this.state = state;
  this.meta = meta;
  this.validator = validator;
  this.watches = watches;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 2690809856
};
cljs.core.Atom.cljs$lang$type = true;
cljs.core.Atom.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/Atom")
};
cljs.core.Atom.prototype.cljs$core$IHash$_hash$arity$1 = function(this$) {
  var this__12040 = this;
  return goog.getUid(this$)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches$arity$3 = function(this$, oldval, newval) {
  var this__12041 = this;
  var G__12042__12043 = cljs.core.seq(this__12041.watches);
  if(G__12042__12043) {
    var G__12045__12047 = cljs.core.first(G__12042__12043);
    var vec__12046__12048 = G__12045__12047;
    var key__12049 = cljs.core.nth.cljs$lang$arity$3(vec__12046__12048, 0, null);
    var f__12050 = cljs.core.nth.cljs$lang$arity$3(vec__12046__12048, 1, null);
    var G__12042__12051 = G__12042__12043;
    var G__12045__12052 = G__12045__12047;
    var G__12042__12053 = G__12042__12051;
    while(true) {
      var vec__12054__12055 = G__12045__12052;
      var key__12056 = cljs.core.nth.cljs$lang$arity$3(vec__12054__12055, 0, null);
      var f__12057 = cljs.core.nth.cljs$lang$arity$3(vec__12054__12055, 1, null);
      var G__12042__12058 = G__12042__12053;
      f__12057.cljs$lang$arity$4 ? f__12057.cljs$lang$arity$4(key__12056, this$, oldval, newval) : f__12057.call(null, key__12056, this$, oldval, newval);
      var temp__3974__auto____12059 = cljs.core.next(G__12042__12058);
      if(temp__3974__auto____12059) {
        var G__12042__12060 = temp__3974__auto____12059;
        var G__12067 = cljs.core.first(G__12042__12060);
        var G__12068 = G__12042__12060;
        G__12045__12052 = G__12067;
        G__12042__12053 = G__12068;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_add_watch$arity$3 = function(this$, key, f) {
  var this__12061 = this;
  return this$.watches = cljs.core.assoc.cljs$lang$arity$3(this__12061.watches, key, f)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch$arity$2 = function(this$, key) {
  var this__12062 = this;
  return this$.watches = cljs.core.dissoc.cljs$lang$arity$2(this__12062.watches, key)
};
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(a, opts) {
  var this__12063 = this;
  return cljs.core.concat.cljs$lang$arity$variadic(cljs.core.PersistentVector.fromArray(["#<Atom: "], true), cljs.core._pr_seq(this__12063.state, opts), cljs.core.array_seq([">"], 0))
};
cljs.core.Atom.prototype.cljs$core$IMeta$_meta$arity$1 = function(_) {
  var this__12064 = this;
  return this__12064.meta
};
cljs.core.Atom.prototype.cljs$core$IDeref$_deref$arity$1 = function(_) {
  var this__12065 = this;
  return this__12065.state
};
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(o, other) {
  var this__12066 = this;
  return o === other
};
cljs.core.Atom;
cljs.core.atom = function() {
  var atom = null;
  var atom__1 = function(x) {
    return new cljs.core.Atom(x, null, null, null)
  };
  var atom__2 = function() {
    var G__12080__delegate = function(x, p__12069) {
      var map__12075__12076 = p__12069;
      var map__12075__12077 = cljs.core.seq_QMARK_(map__12075__12076) ? cljs.core.apply.cljs$lang$arity$2(cljs.core.hash_map, map__12075__12076) : map__12075__12076;
      var validator__12078 = cljs.core._lookup.cljs$lang$arity$3(map__12075__12077, "\ufdd0'validator", null);
      var meta__12079 = cljs.core._lookup.cljs$lang$arity$3(map__12075__12077, "\ufdd0'meta", null);
      return new cljs.core.Atom(x, meta__12079, validator__12078, null)
    };
    var G__12080 = function(x, var_args) {
      var p__12069 = null;
      if(goog.isDef(var_args)) {
        p__12069 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__12080__delegate.call(this, x, p__12069)
    };
    G__12080.cljs$lang$maxFixedArity = 1;
    G__12080.cljs$lang$applyTo = function(arglist__12081) {
      var x = cljs.core.first(arglist__12081);
      var p__12069 = cljs.core.rest(arglist__12081);
      return G__12080__delegate(x, p__12069)
    };
    G__12080.cljs$lang$arity$variadic = G__12080__delegate;
    return G__12080
  }();
  atom = function(x, var_args) {
    var p__12069 = var_args;
    switch(arguments.length) {
      case 1:
        return atom__1.call(this, x);
      default:
        return atom__2.cljs$lang$arity$variadic(x, cljs.core.array_seq(arguments, 1))
    }
    throw"Invalid arity: " + arguments.length;
  };
  atom.cljs$lang$maxFixedArity = 1;
  atom.cljs$lang$applyTo = atom__2.cljs$lang$applyTo;
  atom.cljs$lang$arity$1 = atom__1;
  atom.cljs$lang$arity$variadic = atom__2.cljs$lang$arity$variadic;
  return atom
}();
cljs.core.reset_BANG_ = function reset_BANG_(a, new_value) {
  var temp__3974__auto____12085 = a.validator;
  if(cljs.core.truth_(temp__3974__auto____12085)) {
    var validate__12086 = temp__3974__auto____12085;
    if(cljs.core.truth_(validate__12086.cljs$lang$arity$1 ? validate__12086.cljs$lang$arity$1(new_value) : validate__12086.call(null, new_value))) {
    }else {
      throw new Error([cljs.core.str("Assert failed: "), cljs.core.str("Validator rejected reference state"), cljs.core.str("\n"), cljs.core.str(cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([cljs.core.with_meta(cljs.core.list("\ufdd1'validate", "\ufdd1'new-value"), cljs.core.hash_map("\ufdd0'line", 6440))], 0)))].join(""));
    }
  }else {
  }
  var old_value__12087 = a.state;
  a.state = new_value;
  cljs.core._notify_watches(a, old_value__12087, new_value);
  return new_value
};
cljs.core.swap_BANG_ = function() {
  var swap_BANG_ = null;
  var swap_BANG___2 = function(a, f) {
    return cljs.core.reset_BANG_(a, f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(a.state) : f.call(null, a.state))
  };
  var swap_BANG___3 = function(a, f, x) {
    return cljs.core.reset_BANG_(a, f.cljs$lang$arity$2 ? f.cljs$lang$arity$2(a.state, x) : f.call(null, a.state, x))
  };
  var swap_BANG___4 = function(a, f, x, y) {
    return cljs.core.reset_BANG_(a, f.cljs$lang$arity$3 ? f.cljs$lang$arity$3(a.state, x, y) : f.call(null, a.state, x, y))
  };
  var swap_BANG___5 = function(a, f, x, y, z) {
    return cljs.core.reset_BANG_(a, f.cljs$lang$arity$4 ? f.cljs$lang$arity$4(a.state, x, y, z) : f.call(null, a.state, x, y, z))
  };
  var swap_BANG___6 = function() {
    var G__12088__delegate = function(a, f, x, y, z, more) {
      return cljs.core.reset_BANG_(a, cljs.core.apply.cljs$lang$arity$variadic(f, a.state, x, y, z, cljs.core.array_seq([more], 0)))
    };
    var G__12088 = function(a, f, x, y, z, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__12088__delegate.call(this, a, f, x, y, z, more)
    };
    G__12088.cljs$lang$maxFixedArity = 5;
    G__12088.cljs$lang$applyTo = function(arglist__12089) {
      var a = cljs.core.first(arglist__12089);
      var f = cljs.core.first(cljs.core.next(arglist__12089));
      var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__12089)));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__12089))));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__12089)))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__12089)))));
      return G__12088__delegate(a, f, x, y, z, more)
    };
    G__12088.cljs$lang$arity$variadic = G__12088__delegate;
    return G__12088
  }();
  swap_BANG_ = function(a, f, x, y, z, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return swap_BANG___2.call(this, a, f);
      case 3:
        return swap_BANG___3.call(this, a, f, x);
      case 4:
        return swap_BANG___4.call(this, a, f, x, y);
      case 5:
        return swap_BANG___5.call(this, a, f, x, y, z);
      default:
        return swap_BANG___6.cljs$lang$arity$variadic(a, f, x, y, z, cljs.core.array_seq(arguments, 5))
    }
    throw"Invalid arity: " + arguments.length;
  };
  swap_BANG_.cljs$lang$maxFixedArity = 5;
  swap_BANG_.cljs$lang$applyTo = swap_BANG___6.cljs$lang$applyTo;
  swap_BANG_.cljs$lang$arity$2 = swap_BANG___2;
  swap_BANG_.cljs$lang$arity$3 = swap_BANG___3;
  swap_BANG_.cljs$lang$arity$4 = swap_BANG___4;
  swap_BANG_.cljs$lang$arity$5 = swap_BANG___5;
  swap_BANG_.cljs$lang$arity$variadic = swap_BANG___6.cljs$lang$arity$variadic;
  return swap_BANG_
}();
cljs.core.compare_and_set_BANG_ = function compare_and_set_BANG_(a, oldval, newval) {
  if(cljs.core._EQ_.cljs$lang$arity$2(a.state, oldval)) {
    cljs.core.reset_BANG_(a, newval);
    return true
  }else {
    return false
  }
};
cljs.core.deref = function deref(o) {
  return cljs.core._deref(o)
};
cljs.core.set_validator_BANG_ = function set_validator_BANG_(iref, val) {
  return iref.validator = val
};
cljs.core.get_validator = function get_validator(iref) {
  return iref.validator
};
cljs.core.alter_meta_BANG_ = function() {
  var alter_meta_BANG___delegate = function(iref, f, args) {
    return iref.meta = cljs.core.apply.cljs$lang$arity$3(f, iref.meta, args)
  };
  var alter_meta_BANG_ = function(iref, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return alter_meta_BANG___delegate.call(this, iref, f, args)
  };
  alter_meta_BANG_.cljs$lang$maxFixedArity = 2;
  alter_meta_BANG_.cljs$lang$applyTo = function(arglist__12090) {
    var iref = cljs.core.first(arglist__12090);
    var f = cljs.core.first(cljs.core.next(arglist__12090));
    var args = cljs.core.rest(cljs.core.next(arglist__12090));
    return alter_meta_BANG___delegate(iref, f, args)
  };
  alter_meta_BANG_.cljs$lang$arity$variadic = alter_meta_BANG___delegate;
  return alter_meta_BANG_
}();
cljs.core.reset_meta_BANG_ = function reset_meta_BANG_(iref, m) {
  return iref.meta = m
};
cljs.core.add_watch = function add_watch(iref, key, f) {
  return cljs.core._add_watch(iref, key, f)
};
cljs.core.remove_watch = function remove_watch(iref, key) {
  return cljs.core._remove_watch(iref, key)
};
cljs.core.gensym_counter = null;
cljs.core.gensym = function() {
  var gensym = null;
  var gensym__0 = function() {
    return gensym.cljs$lang$arity$1("G__")
  };
  var gensym__1 = function(prefix_string) {
    if(cljs.core.gensym_counter == null) {
      cljs.core.gensym_counter = cljs.core.atom.cljs$lang$arity$1(0)
    }else {
    }
    return cljs.core.symbol.cljs$lang$arity$1([cljs.core.str(prefix_string), cljs.core.str(cljs.core.swap_BANG_.cljs$lang$arity$2(cljs.core.gensym_counter, cljs.core.inc))].join(""))
  };
  gensym = function(prefix_string) {
    switch(arguments.length) {
      case 0:
        return gensym__0.call(this);
      case 1:
        return gensym__1.call(this, prefix_string)
    }
    throw"Invalid arity: " + arguments.length;
  };
  gensym.cljs$lang$arity$0 = gensym__0;
  gensym.cljs$lang$arity$1 = gensym__1;
  return gensym
}();
cljs.core.fixture1 = 1;
cljs.core.fixture2 = 2;
cljs.core.Delay = function(state, f) {
  this.state = state;
  this.f = f;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 1073774592
};
cljs.core.Delay.cljs$lang$type = true;
cljs.core.Delay.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/Delay")
};
cljs.core.Delay.prototype.cljs$core$IPending$_realized_QMARK_$arity$1 = function(d) {
  var this__12091 = this;
  return(new cljs.core.Keyword("\ufdd0'done")).call(null, cljs.core.deref(this__12091.state))
};
cljs.core.Delay.prototype.cljs$core$IDeref$_deref$arity$1 = function(_) {
  var this__12092 = this;
  return(new cljs.core.Keyword("\ufdd0'value")).call(null, cljs.core.swap_BANG_.cljs$lang$arity$2(this__12092.state, function(p__12093) {
    var map__12094__12095 = p__12093;
    var map__12094__12096 = cljs.core.seq_QMARK_(map__12094__12095) ? cljs.core.apply.cljs$lang$arity$2(cljs.core.hash_map, map__12094__12095) : map__12094__12095;
    var curr_state__12097 = map__12094__12096;
    var done__12098 = cljs.core._lookup.cljs$lang$arity$3(map__12094__12096, "\ufdd0'done", null);
    if(cljs.core.truth_(done__12098)) {
      return curr_state__12097
    }else {
      return cljs.core.ObjMap.fromObject(["\ufdd0'done", "\ufdd0'value"], {"\ufdd0'done":true, "\ufdd0'value":this__12092.f.cljs$lang$arity$0 ? this__12092.f.cljs$lang$arity$0() : this__12092.f.call(null)})
    }
  }))
};
cljs.core.Delay;
cljs.core.delay_QMARK_ = function delay_QMARK_(x) {
  return cljs.core.instance_QMARK_(cljs.core.Delay, x)
};
cljs.core.force = function force(x) {
  if(cljs.core.delay_QMARK_(x)) {
    return cljs.core.deref(x)
  }else {
    return x
  }
};
cljs.core.realized_QMARK_ = function realized_QMARK_(d) {
  return cljs.core._realized_QMARK_(d)
};
cljs.core.js__GT_clj = function() {
  var js__GT_clj__delegate = function(x, options) {
    var map__12119__12120 = options;
    var map__12119__12121 = cljs.core.seq_QMARK_(map__12119__12120) ? cljs.core.apply.cljs$lang$arity$2(cljs.core.hash_map, map__12119__12120) : map__12119__12120;
    var keywordize_keys__12122 = cljs.core._lookup.cljs$lang$arity$3(map__12119__12121, "\ufdd0'keywordize-keys", null);
    var keyfn__12123 = cljs.core.truth_(keywordize_keys__12122) ? cljs.core.keyword : cljs.core.str;
    var f__12138 = function thisfn(x) {
      if(cljs.core.seq_QMARK_(x)) {
        return cljs.core.doall.cljs$lang$arity$1(cljs.core.map.cljs$lang$arity$2(thisfn, x))
      }else {
        if(cljs.core.coll_QMARK_(x)) {
          return cljs.core.into(cljs.core.empty(x), cljs.core.map.cljs$lang$arity$2(thisfn, x))
        }else {
          if(cljs.core.truth_(goog.isArray(x))) {
            return cljs.core.vec(cljs.core.map.cljs$lang$arity$2(thisfn, x))
          }else {
            if(cljs.core.type(x) === Object) {
              return cljs.core.into(cljs.core.ObjMap.EMPTY, function() {
                var iter__2462__auto____12137 = function iter__12131(s__12132) {
                  return new cljs.core.LazySeq(null, false, function() {
                    var s__12132__12135 = s__12132;
                    while(true) {
                      if(cljs.core.seq(s__12132__12135)) {
                        var k__12136 = cljs.core.first(s__12132__12135);
                        return cljs.core.cons(cljs.core.PersistentVector.fromArray([keyfn__12123.cljs$lang$arity$1 ? keyfn__12123.cljs$lang$arity$1(k__12136) : keyfn__12123.call(null, k__12136), thisfn(x[k__12136])], true), iter__12131(cljs.core.rest(s__12132__12135)))
                      }else {
                        return null
                      }
                      break
                    }
                  }, null)
                };
                return iter__2462__auto____12137.cljs$lang$arity$1 ? iter__2462__auto____12137.cljs$lang$arity$1(cljs.core.js_keys(x)) : iter__2462__auto____12137.call(null, cljs.core.js_keys(x))
              }())
            }else {
              if("\ufdd0'else") {
                return x
              }else {
                return null
              }
            }
          }
        }
      }
    };
    return f__12138.cljs$lang$arity$1 ? f__12138.cljs$lang$arity$1(x) : f__12138.call(null, x)
  };
  var js__GT_clj = function(x, var_args) {
    var options = null;
    if(goog.isDef(var_args)) {
      options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return js__GT_clj__delegate.call(this, x, options)
  };
  js__GT_clj.cljs$lang$maxFixedArity = 1;
  js__GT_clj.cljs$lang$applyTo = function(arglist__12139) {
    var x = cljs.core.first(arglist__12139);
    var options = cljs.core.rest(arglist__12139);
    return js__GT_clj__delegate(x, options)
  };
  js__GT_clj.cljs$lang$arity$variadic = js__GT_clj__delegate;
  return js__GT_clj
}();
cljs.core.memoize = function memoize(f) {
  var mem__12144 = cljs.core.atom.cljs$lang$arity$1(cljs.core.ObjMap.EMPTY);
  return function() {
    var G__12148__delegate = function(args) {
      var temp__3971__auto____12145 = cljs.core._lookup.cljs$lang$arity$3(cljs.core.deref(mem__12144), args, null);
      if(cljs.core.truth_(temp__3971__auto____12145)) {
        var v__12146 = temp__3971__auto____12145;
        return v__12146
      }else {
        var ret__12147 = cljs.core.apply.cljs$lang$arity$2(f, args);
        cljs.core.swap_BANG_.cljs$lang$arity$4(mem__12144, cljs.core.assoc, args, ret__12147);
        return ret__12147
      }
    };
    var G__12148 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__12148__delegate.call(this, args)
    };
    G__12148.cljs$lang$maxFixedArity = 0;
    G__12148.cljs$lang$applyTo = function(arglist__12149) {
      var args = cljs.core.seq(arglist__12149);
      return G__12148__delegate(args)
    };
    G__12148.cljs$lang$arity$variadic = G__12148__delegate;
    return G__12148
  }()
};
cljs.core.trampoline = function() {
  var trampoline = null;
  var trampoline__1 = function(f) {
    while(true) {
      var ret__12151 = f.cljs$lang$arity$0 ? f.cljs$lang$arity$0() : f.call(null);
      if(cljs.core.fn_QMARK_(ret__12151)) {
        var G__12152 = ret__12151;
        f = G__12152;
        continue
      }else {
        return ret__12151
      }
      break
    }
  };
  var trampoline__2 = function() {
    var G__12153__delegate = function(f, args) {
      return trampoline.cljs$lang$arity$1(function() {
        return cljs.core.apply.cljs$lang$arity$2(f, args)
      })
    };
    var G__12153 = function(f, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__12153__delegate.call(this, f, args)
    };
    G__12153.cljs$lang$maxFixedArity = 1;
    G__12153.cljs$lang$applyTo = function(arglist__12154) {
      var f = cljs.core.first(arglist__12154);
      var args = cljs.core.rest(arglist__12154);
      return G__12153__delegate(f, args)
    };
    G__12153.cljs$lang$arity$variadic = G__12153__delegate;
    return G__12153
  }();
  trampoline = function(f, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 1:
        return trampoline__1.call(this, f);
      default:
        return trampoline__2.cljs$lang$arity$variadic(f, cljs.core.array_seq(arguments, 1))
    }
    throw"Invalid arity: " + arguments.length;
  };
  trampoline.cljs$lang$maxFixedArity = 1;
  trampoline.cljs$lang$applyTo = trampoline__2.cljs$lang$applyTo;
  trampoline.cljs$lang$arity$1 = trampoline__1;
  trampoline.cljs$lang$arity$variadic = trampoline__2.cljs$lang$arity$variadic;
  return trampoline
}();
cljs.core.rand = function() {
  var rand = null;
  var rand__0 = function() {
    return rand.cljs$lang$arity$1(1)
  };
  var rand__1 = function(n) {
    return(Math.random.cljs$lang$arity$0 ? Math.random.cljs$lang$arity$0() : Math.random.call(null)) * n
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__0.call(this);
      case 1:
        return rand__1.call(this, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  rand.cljs$lang$arity$0 = rand__0;
  rand.cljs$lang$arity$1 = rand__1;
  return rand
}();
cljs.core.rand_int = function rand_int(n) {
  return Math.floor.cljs$lang$arity$1 ? Math.floor.cljs$lang$arity$1((Math.random.cljs$lang$arity$0 ? Math.random.cljs$lang$arity$0() : Math.random.call(null)) * n) : Math.floor.call(null, (Math.random.cljs$lang$arity$0 ? Math.random.cljs$lang$arity$0() : Math.random.call(null)) * n)
};
cljs.core.rand_nth = function rand_nth(coll) {
  return cljs.core.nth.cljs$lang$arity$2(coll, cljs.core.rand_int(cljs.core.count(coll)))
};
cljs.core.group_by = function group_by(f, coll) {
  return cljs.core.reduce.cljs$lang$arity$3(function(ret, x) {
    var k__12156 = f.cljs$lang$arity$1 ? f.cljs$lang$arity$1(x) : f.call(null, x);
    return cljs.core.assoc.cljs$lang$arity$3(ret, k__12156, cljs.core.conj.cljs$lang$arity$2(cljs.core._lookup.cljs$lang$arity$3(ret, k__12156, cljs.core.PersistentVector.EMPTY), x))
  }, cljs.core.ObjMap.EMPTY, coll)
};
cljs.core.make_hierarchy = function make_hierarchy() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'descendants", "\ufdd0'ancestors"], {"\ufdd0'parents":cljs.core.ObjMap.EMPTY, "\ufdd0'descendants":cljs.core.ObjMap.EMPTY, "\ufdd0'ancestors":cljs.core.ObjMap.EMPTY})
};
cljs.core.global_hierarchy = cljs.core.atom.cljs$lang$arity$1(cljs.core.make_hierarchy());
cljs.core.isa_QMARK_ = function() {
  var isa_QMARK_ = null;
  var isa_QMARK___2 = function(child, parent) {
    return isa_QMARK_.cljs$lang$arity$3(cljs.core.deref(cljs.core.global_hierarchy), child, parent)
  };
  var isa_QMARK___3 = function(h, child, parent) {
    var or__3824__auto____12165 = cljs.core._EQ_.cljs$lang$arity$2(child, parent);
    if(or__3824__auto____12165) {
      return or__3824__auto____12165
    }else {
      var or__3824__auto____12166 = cljs.core.contains_QMARK_((new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h).call(null, child), parent);
      if(or__3824__auto____12166) {
        return or__3824__auto____12166
      }else {
        var and__3822__auto____12167 = cljs.core.vector_QMARK_(parent);
        if(and__3822__auto____12167) {
          var and__3822__auto____12168 = cljs.core.vector_QMARK_(child);
          if(and__3822__auto____12168) {
            var and__3822__auto____12169 = cljs.core.count(parent) === cljs.core.count(child);
            if(and__3822__auto____12169) {
              var ret__12170 = true;
              var i__12171 = 0;
              while(true) {
                if(function() {
                  var or__3824__auto____12172 = cljs.core.not(ret__12170);
                  if(or__3824__auto____12172) {
                    return or__3824__auto____12172
                  }else {
                    return i__12171 === cljs.core.count(parent)
                  }
                }()) {
                  return ret__12170
                }else {
                  var G__12173 = isa_QMARK_.cljs$lang$arity$3(h, child.cljs$lang$arity$1 ? child.cljs$lang$arity$1(i__12171) : child.call(null, i__12171), parent.cljs$lang$arity$1 ? parent.cljs$lang$arity$1(i__12171) : parent.call(null, i__12171));
                  var G__12174 = i__12171 + 1;
                  ret__12170 = G__12173;
                  i__12171 = G__12174;
                  continue
                }
                break
              }
            }else {
              return and__3822__auto____12169
            }
          }else {
            return and__3822__auto____12168
          }
        }else {
          return and__3822__auto____12167
        }
      }
    }
  };
  isa_QMARK_ = function(h, child, parent) {
    switch(arguments.length) {
      case 2:
        return isa_QMARK___2.call(this, h, child);
      case 3:
        return isa_QMARK___3.call(this, h, child, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  isa_QMARK_.cljs$lang$arity$2 = isa_QMARK___2;
  isa_QMARK_.cljs$lang$arity$3 = isa_QMARK___3;
  return isa_QMARK_
}();
cljs.core.parents = function() {
  var parents = null;
  var parents__1 = function(tag) {
    return parents.cljs$lang$arity$2(cljs.core.deref(cljs.core.global_hierarchy), tag)
  };
  var parents__2 = function(h, tag) {
    return cljs.core.not_empty(cljs.core._lookup.cljs$lang$arity$3((new cljs.core.Keyword("\ufdd0'parents")).call(null, h), tag, null))
  };
  parents = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return parents__1.call(this, h);
      case 2:
        return parents__2.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  parents.cljs$lang$arity$1 = parents__1;
  parents.cljs$lang$arity$2 = parents__2;
  return parents
}();
cljs.core.ancestors = function() {
  var ancestors = null;
  var ancestors__1 = function(tag) {
    return ancestors.cljs$lang$arity$2(cljs.core.deref(cljs.core.global_hierarchy), tag)
  };
  var ancestors__2 = function(h, tag) {
    return cljs.core.not_empty(cljs.core._lookup.cljs$lang$arity$3((new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h), tag, null))
  };
  ancestors = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return ancestors__1.call(this, h);
      case 2:
        return ancestors__2.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  ancestors.cljs$lang$arity$1 = ancestors__1;
  ancestors.cljs$lang$arity$2 = ancestors__2;
  return ancestors
}();
cljs.core.descendants = function() {
  var descendants = null;
  var descendants__1 = function(tag) {
    return descendants.cljs$lang$arity$2(cljs.core.deref(cljs.core.global_hierarchy), tag)
  };
  var descendants__2 = function(h, tag) {
    return cljs.core.not_empty(cljs.core._lookup.cljs$lang$arity$3((new cljs.core.Keyword("\ufdd0'descendants")).call(null, h), tag, null))
  };
  descendants = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return descendants__1.call(this, h);
      case 2:
        return descendants__2.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  descendants.cljs$lang$arity$1 = descendants__1;
  descendants.cljs$lang$arity$2 = descendants__2;
  return descendants
}();
cljs.core.derive = function() {
  var derive = null;
  var derive__2 = function(tag, parent) {
    if(cljs.core.truth_(cljs.core.namespace(parent))) {
    }else {
      throw new Error([cljs.core.str("Assert failed: "), cljs.core.str(cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([cljs.core.with_meta(cljs.core.list("\ufdd1'namespace", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 6724))], 0)))].join(""));
    }
    cljs.core.swap_BANG_.cljs$lang$arity$4(cljs.core.global_hierarchy, derive, tag, parent);
    return null
  };
  var derive__3 = function(h, tag, parent) {
    if(cljs.core.not_EQ_.cljs$lang$arity$2(tag, parent)) {
    }else {
      throw new Error([cljs.core.str("Assert failed: "), cljs.core.str(cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([cljs.core.with_meta(cljs.core.list("\ufdd1'not=", "\ufdd1'tag", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 6728))], 0)))].join(""));
    }
    var tp__12183 = (new cljs.core.Keyword("\ufdd0'parents")).call(null, h);
    var td__12184 = (new cljs.core.Keyword("\ufdd0'descendants")).call(null, h);
    var ta__12185 = (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h);
    var tf__12186 = function(m, source, sources, target, targets) {
      return cljs.core.reduce.cljs$lang$arity$3(function(ret, k) {
        return cljs.core.assoc.cljs$lang$arity$3(ret, k, cljs.core.reduce.cljs$lang$arity$3(cljs.core.conj, cljs.core._lookup.cljs$lang$arity$3(targets, k, cljs.core.PersistentHashSet.EMPTY), cljs.core.cons(target, targets.cljs$lang$arity$1 ? targets.cljs$lang$arity$1(target) : targets.call(null, target))))
      }, m, cljs.core.cons(source, sources.cljs$lang$arity$1 ? sources.cljs$lang$arity$1(source) : sources.call(null, source)))
    };
    var or__3824__auto____12187 = cljs.core.contains_QMARK_(tp__12183.cljs$lang$arity$1 ? tp__12183.cljs$lang$arity$1(tag) : tp__12183.call(null, tag), parent) ? null : function() {
      if(cljs.core.contains_QMARK_(ta__12185.cljs$lang$arity$1 ? ta__12185.cljs$lang$arity$1(tag) : ta__12185.call(null, tag), parent)) {
        throw new Error([cljs.core.str(tag), cljs.core.str("already has"), cljs.core.str(parent), cljs.core.str("as ancestor")].join(""));
      }else {
      }
      if(cljs.core.contains_QMARK_(ta__12185.cljs$lang$arity$1 ? ta__12185.cljs$lang$arity$1(parent) : ta__12185.call(null, parent), tag)) {
        throw new Error([cljs.core.str("Cyclic derivation:"), cljs.core.str(parent), cljs.core.str("has"), cljs.core.str(tag), cljs.core.str("as ancestor")].join(""));
      }else {
      }
      return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'ancestors", "\ufdd0'descendants"], {"\ufdd0'parents":cljs.core.assoc.cljs$lang$arity$3((new cljs.core.Keyword("\ufdd0'parents")).call(null, h), tag, cljs.core.conj.cljs$lang$arity$2(cljs.core._lookup.cljs$lang$arity$3(tp__12183, tag, cljs.core.PersistentHashSet.EMPTY), parent)), "\ufdd0'ancestors":tf__12186.cljs$lang$arity$5 ? tf__12186.cljs$lang$arity$5((new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h), tag, td__12184, parent, 
      ta__12185) : tf__12186.call(null, (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h), tag, td__12184, parent, ta__12185), "\ufdd0'descendants":tf__12186.cljs$lang$arity$5 ? tf__12186.cljs$lang$arity$5((new cljs.core.Keyword("\ufdd0'descendants")).call(null, h), parent, ta__12185, tag, td__12184) : tf__12186.call(null, (new cljs.core.Keyword("\ufdd0'descendants")).call(null, h), parent, ta__12185, tag, td__12184)})
    }();
    if(cljs.core.truth_(or__3824__auto____12187)) {
      return or__3824__auto____12187
    }else {
      return h
    }
  };
  derive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return derive__2.call(this, h, tag);
      case 3:
        return derive__3.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  derive.cljs$lang$arity$2 = derive__2;
  derive.cljs$lang$arity$3 = derive__3;
  return derive
}();
cljs.core.underive = function() {
  var underive = null;
  var underive__2 = function(tag, parent) {
    cljs.core.swap_BANG_.cljs$lang$arity$4(cljs.core.global_hierarchy, underive, tag, parent);
    return null
  };
  var underive__3 = function(h, tag, parent) {
    var parentMap__12192 = (new cljs.core.Keyword("\ufdd0'parents")).call(null, h);
    var childsParents__12193 = cljs.core.truth_(parentMap__12192.cljs$lang$arity$1 ? parentMap__12192.cljs$lang$arity$1(tag) : parentMap__12192.call(null, tag)) ? cljs.core.disj.cljs$lang$arity$2(parentMap__12192.cljs$lang$arity$1 ? parentMap__12192.cljs$lang$arity$1(tag) : parentMap__12192.call(null, tag), parent) : cljs.core.PersistentHashSet.EMPTY;
    var newParents__12194 = cljs.core.truth_(cljs.core.not_empty(childsParents__12193)) ? cljs.core.assoc.cljs$lang$arity$3(parentMap__12192, tag, childsParents__12193) : cljs.core.dissoc.cljs$lang$arity$2(parentMap__12192, tag);
    var deriv_seq__12195 = cljs.core.flatten(cljs.core.map.cljs$lang$arity$2(function(p1__12175_SHARP_) {
      return cljs.core.cons(cljs.core.first(p1__12175_SHARP_), cljs.core.interpose(cljs.core.first(p1__12175_SHARP_), cljs.core.second(p1__12175_SHARP_)))
    }, cljs.core.seq(newParents__12194)));
    if(cljs.core.contains_QMARK_(parentMap__12192.cljs$lang$arity$1 ? parentMap__12192.cljs$lang$arity$1(tag) : parentMap__12192.call(null, tag), parent)) {
      return cljs.core.reduce.cljs$lang$arity$3(function(p1__12176_SHARP_, p2__12177_SHARP_) {
        return cljs.core.apply.cljs$lang$arity$3(cljs.core.derive, p1__12176_SHARP_, p2__12177_SHARP_)
      }, cljs.core.make_hierarchy(), cljs.core.partition.cljs$lang$arity$2(2, deriv_seq__12195))
    }else {
      return h
    }
  };
  underive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return underive__2.call(this, h, tag);
      case 3:
        return underive__3.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  underive.cljs$lang$arity$2 = underive__2;
  underive.cljs$lang$arity$3 = underive__3;
  return underive
}();
cljs.core.reset_cache = function reset_cache(method_cache, method_table, cached_hierarchy, hierarchy) {
  cljs.core.swap_BANG_.cljs$lang$arity$2(method_cache, function(_) {
    return cljs.core.deref(method_table)
  });
  return cljs.core.swap_BANG_.cljs$lang$arity$2(cached_hierarchy, function(_) {
    return cljs.core.deref(hierarchy)
  })
};
cljs.core.prefers_STAR_ = function prefers_STAR_(x, y, prefer_table) {
  var xprefs__12203 = cljs.core.deref(prefer_table).call(null, x);
  var or__3824__auto____12205 = cljs.core.truth_(function() {
    var and__3822__auto____12204 = xprefs__12203;
    if(cljs.core.truth_(and__3822__auto____12204)) {
      return xprefs__12203.cljs$lang$arity$1 ? xprefs__12203.cljs$lang$arity$1(y) : xprefs__12203.call(null, y)
    }else {
      return and__3822__auto____12204
    }
  }()) ? true : null;
  if(cljs.core.truth_(or__3824__auto____12205)) {
    return or__3824__auto____12205
  }else {
    var or__3824__auto____12207 = function() {
      var ps__12206 = cljs.core.parents.cljs$lang$arity$1(y);
      while(true) {
        if(cljs.core.count(ps__12206) > 0) {
          if(cljs.core.truth_(prefers_STAR_(x, cljs.core.first(ps__12206), prefer_table))) {
          }else {
          }
          var G__12210 = cljs.core.rest(ps__12206);
          ps__12206 = G__12210;
          continue
        }else {
          return null
        }
        break
      }
    }();
    if(cljs.core.truth_(or__3824__auto____12207)) {
      return or__3824__auto____12207
    }else {
      var or__3824__auto____12209 = function() {
        var ps__12208 = cljs.core.parents.cljs$lang$arity$1(x);
        while(true) {
          if(cljs.core.count(ps__12208) > 0) {
            if(cljs.core.truth_(prefers_STAR_(cljs.core.first(ps__12208), y, prefer_table))) {
            }else {
            }
            var G__12211 = cljs.core.rest(ps__12208);
            ps__12208 = G__12211;
            continue
          }else {
            return null
          }
          break
        }
      }();
      if(cljs.core.truth_(or__3824__auto____12209)) {
        return or__3824__auto____12209
      }else {
        return false
      }
    }
  }
};
cljs.core.dominates = function dominates(x, y, prefer_table) {
  var or__3824__auto____12213 = cljs.core.prefers_STAR_(x, y, prefer_table);
  if(cljs.core.truth_(or__3824__auto____12213)) {
    return or__3824__auto____12213
  }else {
    return cljs.core.isa_QMARK_.cljs$lang$arity$2(x, y)
  }
};
cljs.core.find_and_cache_best_method = function find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  var best_entry__12231 = cljs.core.reduce.cljs$lang$arity$3(function(be, p__12223) {
    var vec__12224__12225 = p__12223;
    var k__12226 = cljs.core.nth.cljs$lang$arity$3(vec__12224__12225, 0, null);
    var ___12227 = cljs.core.nth.cljs$lang$arity$3(vec__12224__12225, 1, null);
    var e__12228 = vec__12224__12225;
    if(cljs.core.isa_QMARK_.cljs$lang$arity$2(dispatch_val, k__12226)) {
      var be2__12230 = cljs.core.truth_(function() {
        var or__3824__auto____12229 = be == null;
        if(or__3824__auto____12229) {
          return or__3824__auto____12229
        }else {
          return cljs.core.dominates(k__12226, cljs.core.first(be), prefer_table)
        }
      }()) ? e__12228 : be;
      if(cljs.core.truth_(cljs.core.dominates(cljs.core.first(be2__12230), k__12226, prefer_table))) {
      }else {
        throw new Error([cljs.core.str("Multiple methods in multimethod '"), cljs.core.str(name), cljs.core.str("' match dispatch value: "), cljs.core.str(dispatch_val), cljs.core.str(" -> "), cljs.core.str(k__12226), cljs.core.str(" and "), cljs.core.str(cljs.core.first(be2__12230)), cljs.core.str(", and neither is preferred")].join(""));
      }
      return be2__12230
    }else {
      return be
    }
  }, null, cljs.core.deref(method_table));
  if(cljs.core.truth_(best_entry__12231)) {
    if(cljs.core._EQ_.cljs$lang$arity$2(cljs.core.deref(cached_hierarchy), cljs.core.deref(hierarchy))) {
      cljs.core.swap_BANG_.cljs$lang$arity$4(method_cache, cljs.core.assoc, dispatch_val, cljs.core.second(best_entry__12231));
      return cljs.core.second(best_entry__12231)
    }else {
      cljs.core.reset_cache(method_cache, method_table, cached_hierarchy, hierarchy);
      return find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy)
    }
  }else {
    return null
  }
};
cljs.core.IMultiFn = {};
cljs.core._reset = function _reset(mf) {
  if(function() {
    var and__3822__auto____12236 = mf;
    if(and__3822__auto____12236) {
      return mf.cljs$core$IMultiFn$_reset$arity$1
    }else {
      return and__3822__auto____12236
    }
  }()) {
    return mf.cljs$core$IMultiFn$_reset$arity$1(mf)
  }else {
    var x__2363__auto____12237 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12238 = cljs.core._reset[goog.typeOf(x__2363__auto____12237)];
      if(or__3824__auto____12238) {
        return or__3824__auto____12238
      }else {
        var or__3824__auto____12239 = cljs.core._reset["_"];
        if(or__3824__auto____12239) {
          return or__3824__auto____12239
        }else {
          throw cljs.core.missing_protocol("IMultiFn.-reset", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._add_method = function _add_method(mf, dispatch_val, method) {
  if(function() {
    var and__3822__auto____12244 = mf;
    if(and__3822__auto____12244) {
      return mf.cljs$core$IMultiFn$_add_method$arity$3
    }else {
      return and__3822__auto____12244
    }
  }()) {
    return mf.cljs$core$IMultiFn$_add_method$arity$3(mf, dispatch_val, method)
  }else {
    var x__2363__auto____12245 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12246 = cljs.core._add_method[goog.typeOf(x__2363__auto____12245)];
      if(or__3824__auto____12246) {
        return or__3824__auto____12246
      }else {
        var or__3824__auto____12247 = cljs.core._add_method["_"];
        if(or__3824__auto____12247) {
          return or__3824__auto____12247
        }else {
          throw cljs.core.missing_protocol("IMultiFn.-add-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, method)
  }
};
cljs.core._remove_method = function _remove_method(mf, dispatch_val) {
  if(function() {
    var and__3822__auto____12252 = mf;
    if(and__3822__auto____12252) {
      return mf.cljs$core$IMultiFn$_remove_method$arity$2
    }else {
      return and__3822__auto____12252
    }
  }()) {
    return mf.cljs$core$IMultiFn$_remove_method$arity$2(mf, dispatch_val)
  }else {
    var x__2363__auto____12253 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12254 = cljs.core._remove_method[goog.typeOf(x__2363__auto____12253)];
      if(or__3824__auto____12254) {
        return or__3824__auto____12254
      }else {
        var or__3824__auto____12255 = cljs.core._remove_method["_"];
        if(or__3824__auto____12255) {
          return or__3824__auto____12255
        }else {
          throw cljs.core.missing_protocol("IMultiFn.-remove-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._prefer_method = function _prefer_method(mf, dispatch_val, dispatch_val_y) {
  if(function() {
    var and__3822__auto____12260 = mf;
    if(and__3822__auto____12260) {
      return mf.cljs$core$IMultiFn$_prefer_method$arity$3
    }else {
      return and__3822__auto____12260
    }
  }()) {
    return mf.cljs$core$IMultiFn$_prefer_method$arity$3(mf, dispatch_val, dispatch_val_y)
  }else {
    var x__2363__auto____12261 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12262 = cljs.core._prefer_method[goog.typeOf(x__2363__auto____12261)];
      if(or__3824__auto____12262) {
        return or__3824__auto____12262
      }else {
        var or__3824__auto____12263 = cljs.core._prefer_method["_"];
        if(or__3824__auto____12263) {
          return or__3824__auto____12263
        }else {
          throw cljs.core.missing_protocol("IMultiFn.-prefer-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, dispatch_val_y)
  }
};
cljs.core._get_method = function _get_method(mf, dispatch_val) {
  if(function() {
    var and__3822__auto____12268 = mf;
    if(and__3822__auto____12268) {
      return mf.cljs$core$IMultiFn$_get_method$arity$2
    }else {
      return and__3822__auto____12268
    }
  }()) {
    return mf.cljs$core$IMultiFn$_get_method$arity$2(mf, dispatch_val)
  }else {
    var x__2363__auto____12269 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12270 = cljs.core._get_method[goog.typeOf(x__2363__auto____12269)];
      if(or__3824__auto____12270) {
        return or__3824__auto____12270
      }else {
        var or__3824__auto____12271 = cljs.core._get_method["_"];
        if(or__3824__auto____12271) {
          return or__3824__auto____12271
        }else {
          throw cljs.core.missing_protocol("IMultiFn.-get-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._methods = function _methods(mf) {
  if(function() {
    var and__3822__auto____12276 = mf;
    if(and__3822__auto____12276) {
      return mf.cljs$core$IMultiFn$_methods$arity$1
    }else {
      return and__3822__auto____12276
    }
  }()) {
    return mf.cljs$core$IMultiFn$_methods$arity$1(mf)
  }else {
    var x__2363__auto____12277 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12278 = cljs.core._methods[goog.typeOf(x__2363__auto____12277)];
      if(or__3824__auto____12278) {
        return or__3824__auto____12278
      }else {
        var or__3824__auto____12279 = cljs.core._methods["_"];
        if(or__3824__auto____12279) {
          return or__3824__auto____12279
        }else {
          throw cljs.core.missing_protocol("IMultiFn.-methods", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._prefers = function _prefers(mf) {
  if(function() {
    var and__3822__auto____12284 = mf;
    if(and__3822__auto____12284) {
      return mf.cljs$core$IMultiFn$_prefers$arity$1
    }else {
      return and__3822__auto____12284
    }
  }()) {
    return mf.cljs$core$IMultiFn$_prefers$arity$1(mf)
  }else {
    var x__2363__auto____12285 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12286 = cljs.core._prefers[goog.typeOf(x__2363__auto____12285)];
      if(or__3824__auto____12286) {
        return or__3824__auto____12286
      }else {
        var or__3824__auto____12287 = cljs.core._prefers["_"];
        if(or__3824__auto____12287) {
          return or__3824__auto____12287
        }else {
          throw cljs.core.missing_protocol("IMultiFn.-prefers", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._dispatch = function _dispatch(mf, args) {
  if(function() {
    var and__3822__auto____12292 = mf;
    if(and__3822__auto____12292) {
      return mf.cljs$core$IMultiFn$_dispatch$arity$2
    }else {
      return and__3822__auto____12292
    }
  }()) {
    return mf.cljs$core$IMultiFn$_dispatch$arity$2(mf, args)
  }else {
    var x__2363__auto____12293 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12294 = cljs.core._dispatch[goog.typeOf(x__2363__auto____12293)];
      if(or__3824__auto____12294) {
        return or__3824__auto____12294
      }else {
        var or__3824__auto____12295 = cljs.core._dispatch["_"];
        if(or__3824__auto____12295) {
          return or__3824__auto____12295
        }else {
          throw cljs.core.missing_protocol("IMultiFn.-dispatch", mf);
        }
      }
    }().call(null, mf, args)
  }
};
cljs.core.do_dispatch = function do_dispatch(mf, dispatch_fn, args) {
  var dispatch_val__12298 = cljs.core.apply.cljs$lang$arity$2(dispatch_fn, args);
  var target_fn__12299 = cljs.core._get_method(mf, dispatch_val__12298);
  if(cljs.core.truth_(target_fn__12299)) {
  }else {
    throw new Error([cljs.core.str("No method in multimethod '"), cljs.core.str(cljs.core.name), cljs.core.str("' for dispatch value: "), cljs.core.str(dispatch_val__12298)].join(""));
  }
  return cljs.core.apply.cljs$lang$arity$2(target_fn__12299, args)
};
cljs.core.MultiFn = function(name, dispatch_fn, default_dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  this.name = name;
  this.dispatch_fn = dispatch_fn;
  this.default_dispatch_val = default_dispatch_val;
  this.hierarchy = hierarchy;
  this.method_table = method_table;
  this.prefer_table = prefer_table;
  this.method_cache = method_cache;
  this.cached_hierarchy = cached_hierarchy;
  this.cljs$lang$protocol_mask$partition0$ = 4194304;
  this.cljs$lang$protocol_mask$partition1$ = 64
};
cljs.core.MultiFn.cljs$lang$type = true;
cljs.core.MultiFn.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/MultiFn")
};
cljs.core.MultiFn.prototype.cljs$core$IHash$_hash$arity$1 = function(this$) {
  var this__12300 = this;
  return goog.getUid(this$)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset$arity$1 = function(mf) {
  var this__12301 = this;
  cljs.core.swap_BANG_.cljs$lang$arity$2(this__12301.method_table, function(mf) {
    return cljs.core.ObjMap.EMPTY
  });
  cljs.core.swap_BANG_.cljs$lang$arity$2(this__12301.method_cache, function(mf) {
    return cljs.core.ObjMap.EMPTY
  });
  cljs.core.swap_BANG_.cljs$lang$arity$2(this__12301.prefer_table, function(mf) {
    return cljs.core.ObjMap.EMPTY
  });
  cljs.core.swap_BANG_.cljs$lang$arity$2(this__12301.cached_hierarchy, function(mf) {
    return null
  });
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method$arity$3 = function(mf, dispatch_val, method) {
  var this__12302 = this;
  cljs.core.swap_BANG_.cljs$lang$arity$4(this__12302.method_table, cljs.core.assoc, dispatch_val, method);
  cljs.core.reset_cache(this__12302.method_cache, this__12302.method_table, this__12302.cached_hierarchy, this__12302.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method$arity$2 = function(mf, dispatch_val) {
  var this__12303 = this;
  cljs.core.swap_BANG_.cljs$lang$arity$3(this__12303.method_table, cljs.core.dissoc, dispatch_val);
  cljs.core.reset_cache(this__12303.method_cache, this__12303.method_table, this__12303.cached_hierarchy, this__12303.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method$arity$2 = function(mf, dispatch_val) {
  var this__12304 = this;
  if(cljs.core._EQ_.cljs$lang$arity$2(cljs.core.deref(this__12304.cached_hierarchy), cljs.core.deref(this__12304.hierarchy))) {
  }else {
    cljs.core.reset_cache(this__12304.method_cache, this__12304.method_table, this__12304.cached_hierarchy, this__12304.hierarchy)
  }
  var temp__3971__auto____12305 = cljs.core.deref(this__12304.method_cache).call(null, dispatch_val);
  if(cljs.core.truth_(temp__3971__auto____12305)) {
    var target_fn__12306 = temp__3971__auto____12305;
    return target_fn__12306
  }else {
    var temp__3971__auto____12307 = cljs.core.find_and_cache_best_method(this__12304.name, dispatch_val, this__12304.hierarchy, this__12304.method_table, this__12304.prefer_table, this__12304.method_cache, this__12304.cached_hierarchy);
    if(cljs.core.truth_(temp__3971__auto____12307)) {
      var target_fn__12308 = temp__3971__auto____12307;
      return target_fn__12308
    }else {
      return cljs.core.deref(this__12304.method_table).call(null, this__12304.default_dispatch_val)
    }
  }
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method$arity$3 = function(mf, dispatch_val_x, dispatch_val_y) {
  var this__12309 = this;
  if(cljs.core.truth_(cljs.core.prefers_STAR_(dispatch_val_x, dispatch_val_y, this__12309.prefer_table))) {
    throw new Error([cljs.core.str("Preference conflict in multimethod '"), cljs.core.str(this__12309.name), cljs.core.str("': "), cljs.core.str(dispatch_val_y), cljs.core.str(" is already preferred to "), cljs.core.str(dispatch_val_x)].join(""));
  }else {
  }
  cljs.core.swap_BANG_.cljs$lang$arity$2(this__12309.prefer_table, function(old) {
    return cljs.core.assoc.cljs$lang$arity$3(old, dispatch_val_x, cljs.core.conj.cljs$lang$arity$2(cljs.core._lookup.cljs$lang$arity$3(old, dispatch_val_x, cljs.core.PersistentHashSet.EMPTY), dispatch_val_y))
  });
  return cljs.core.reset_cache(this__12309.method_cache, this__12309.method_table, this__12309.cached_hierarchy, this__12309.hierarchy)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods$arity$1 = function(mf) {
  var this__12310 = this;
  return cljs.core.deref(this__12310.method_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers$arity$1 = function(mf) {
  var this__12311 = this;
  return cljs.core.deref(this__12311.prefer_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch$arity$2 = function(mf, args) {
  var this__12312 = this;
  return cljs.core.do_dispatch(mf, this__12312.dispatch_fn, args)
};
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = function() {
  var G__12314__delegate = function(_, args) {
    var self__12313 = this;
    return cljs.core._dispatch(self__12313, args)
  };
  var G__12314 = function(_, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return G__12314__delegate.call(this, _, args)
  };
  G__12314.cljs$lang$maxFixedArity = 1;
  G__12314.cljs$lang$applyTo = function(arglist__12315) {
    var _ = cljs.core.first(arglist__12315);
    var args = cljs.core.rest(arglist__12315);
    return G__12314__delegate(_, args)
  };
  G__12314.cljs$lang$arity$variadic = G__12314__delegate;
  return G__12314
}();
cljs.core.MultiFn.prototype.apply = function(_, args) {
  var self__12316 = this;
  return cljs.core._dispatch(self__12316, args)
};
cljs.core.remove_all_methods = function remove_all_methods(multifn) {
  return cljs.core._reset(multifn)
};
cljs.core.remove_method = function remove_method(multifn, dispatch_val) {
  return cljs.core._remove_method(multifn, dispatch_val)
};
cljs.core.prefer_method = function prefer_method(multifn, dispatch_val_x, dispatch_val_y) {
  return cljs.core._prefer_method(multifn, dispatch_val_x, dispatch_val_y)
};
cljs.core.methods$ = function methods$(multifn) {
  return cljs.core._methods(multifn)
};
cljs.core.get_method = function get_method(multifn, dispatch_val) {
  return cljs.core._get_method(multifn, dispatch_val)
};
cljs.core.prefers = function prefers(multifn) {
  return cljs.core._prefers(multifn)
};
cljs.core.UUID = function(uuid) {
  this.uuid = uuid;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 543162368
};
cljs.core.UUID.cljs$lang$type = true;
cljs.core.UUID.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.cljs$lang$arity$1("cljs.core/UUID")
};
cljs.core.UUID.prototype.cljs$core$IHash$_hash$arity$1 = function(this$) {
  var this__12317 = this;
  return goog.string.hashCode(cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this$], 0)))
};
cljs.core.UUID.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(_12319, _) {
  var this__12318 = this;
  return cljs.core.list.cljs$lang$arity$1([cljs.core.str('#uuid "'), cljs.core.str(this__12318.uuid), cljs.core.str('"')].join(""))
};
cljs.core.UUID.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(_, other) {
  var this__12320 = this;
  var and__3822__auto____12321 = cljs.core.instance_QMARK_(cljs.core.UUID, other);
  if(and__3822__auto____12321) {
    return this__12320.uuid === other.uuid
  }else {
    return and__3822__auto____12321
  }
};
cljs.core.UUID.prototype.toString = function() {
  var this__12322 = this;
  var this__12323 = this;
  return cljs.core.pr_str.cljs$lang$arity$variadic(cljs.core.array_seq([this__12323], 0))
};
cljs.core.UUID;
goog.provide("cljs.reader");
goog.require("cljs.core");
goog.require("goog.string");
cljs.reader.PushbackReader = {};
cljs.reader.read_char = function read_char(reader) {
  if(function() {
    var and__3822__auto____179294 = reader;
    if(and__3822__auto____179294) {
      return reader.cljs$reader$PushbackReader$read_char$arity$1
    }else {
      return and__3822__auto____179294
    }
  }()) {
    return reader.cljs$reader$PushbackReader$read_char$arity$1(reader)
  }else {
    var x__2363__auto____179295 = reader == null ? null : reader;
    return function() {
      var or__3824__auto____179296 = cljs.reader.read_char[goog.typeOf(x__2363__auto____179295)];
      if(or__3824__auto____179296) {
        return or__3824__auto____179296
      }else {
        var or__3824__auto____179297 = cljs.reader.read_char["_"];
        if(or__3824__auto____179297) {
          return or__3824__auto____179297
        }else {
          throw cljs.core.missing_protocol.call(null, "PushbackReader.read-char", reader);
        }
      }
    }().call(null, reader)
  }
};
cljs.reader.unread = function unread(reader, ch) {
  if(function() {
    var and__3822__auto____179302 = reader;
    if(and__3822__auto____179302) {
      return reader.cljs$reader$PushbackReader$unread$arity$2
    }else {
      return and__3822__auto____179302
    }
  }()) {
    return reader.cljs$reader$PushbackReader$unread$arity$2(reader, ch)
  }else {
    var x__2363__auto____179303 = reader == null ? null : reader;
    return function() {
      var or__3824__auto____179304 = cljs.reader.unread[goog.typeOf(x__2363__auto____179303)];
      if(or__3824__auto____179304) {
        return or__3824__auto____179304
      }else {
        var or__3824__auto____179305 = cljs.reader.unread["_"];
        if(or__3824__auto____179305) {
          return or__3824__auto____179305
        }else {
          throw cljs.core.missing_protocol.call(null, "PushbackReader.unread", reader);
        }
      }
    }().call(null, reader, ch)
  }
};
cljs.reader.StringPushbackReader = function(s, index_atom, buffer_atom) {
  this.s = s;
  this.index_atom = index_atom;
  this.buffer_atom = buffer_atom
};
cljs.reader.StringPushbackReader.cljs$lang$type = true;
cljs.reader.StringPushbackReader.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.reader/StringPushbackReader")
};
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$ = true;
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$read_char$arity$1 = function(reader) {
  var this__179306 = this;
  if(cljs.core.empty_QMARK_.call(null, cljs.core.deref.call(null, this__179306.buffer_atom))) {
    var idx__179307 = cljs.core.deref.call(null, this__179306.index_atom);
    cljs.core.swap_BANG_.call(null, this__179306.index_atom, cljs.core.inc);
    return this__179306.s[idx__179307]
  }else {
    var buf__179308 = cljs.core.deref.call(null, this__179306.buffer_atom);
    cljs.core.swap_BANG_.call(null, this__179306.buffer_atom, cljs.core.rest);
    return cljs.core.first.call(null, buf__179308)
  }
};
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$unread$arity$2 = function(reader, ch) {
  var this__179309 = this;
  return cljs.core.swap_BANG_.call(null, this__179309.buffer_atom, function(p1__179289_SHARP_) {
    return cljs.core.cons.call(null, ch, p1__179289_SHARP_)
  })
};
cljs.reader.StringPushbackReader;
cljs.reader.push_back_reader = function push_back_reader(s) {
  return new cljs.reader.StringPushbackReader(s, cljs.core.atom.call(null, 0), cljs.core.atom.call(null, null))
};
cljs.reader.whitespace_QMARK_ = function whitespace_QMARK_(ch) {
  var or__3824__auto____179311 = goog.string.isBreakingWhitespace(ch);
  if(cljs.core.truth_(or__3824__auto____179311)) {
    return or__3824__auto____179311
  }else {
    return"," === ch
  }
};
cljs.reader.numeric_QMARK_ = function numeric_QMARK_(ch) {
  return goog.string.isNumeric(ch)
};
cljs.reader.comment_prefix_QMARK_ = function comment_prefix_QMARK_(ch) {
  return";" === ch
};
cljs.reader.number_literal_QMARK_ = function number_literal_QMARK_(reader, initch) {
  var or__3824__auto____179316 = cljs.reader.numeric_QMARK_.call(null, initch);
  if(or__3824__auto____179316) {
    return or__3824__auto____179316
  }else {
    var and__3822__auto____179318 = function() {
      var or__3824__auto____179317 = "+" === initch;
      if(or__3824__auto____179317) {
        return or__3824__auto____179317
      }else {
        return"-" === initch
      }
    }();
    if(cljs.core.truth_(and__3822__auto____179318)) {
      return cljs.reader.numeric_QMARK_.call(null, function() {
        var next_ch__179319 = cljs.reader.read_char.call(null, reader);
        cljs.reader.unread.call(null, reader, next_ch__179319);
        return next_ch__179319
      }())
    }else {
      return and__3822__auto____179318
    }
  }
};
cljs.reader.reader_error = function() {
  var reader_error__delegate = function(rdr, msg) {
    throw new Error(cljs.core.apply.call(null, cljs.core.str, msg));
  };
  var reader_error = function(rdr, var_args) {
    var msg = null;
    if(goog.isDef(var_args)) {
      msg = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return reader_error__delegate.call(this, rdr, msg)
  };
  reader_error.cljs$lang$maxFixedArity = 1;
  reader_error.cljs$lang$applyTo = function(arglist__179320) {
    var rdr = cljs.core.first(arglist__179320);
    var msg = cljs.core.rest(arglist__179320);
    return reader_error__delegate(rdr, msg)
  };
  reader_error.cljs$lang$arity$variadic = reader_error__delegate;
  return reader_error
}();
cljs.reader.macro_terminating_QMARK_ = function macro_terminating_QMARK_(ch) {
  var and__3822__auto____179324 = !(ch === "#");
  if(and__3822__auto____179324) {
    var and__3822__auto____179325 = !(ch === "'");
    if(and__3822__auto____179325) {
      var and__3822__auto____179326 = !(ch === ":");
      if(and__3822__auto____179326) {
        return cljs.reader.macros.call(null, ch)
      }else {
        return and__3822__auto____179326
      }
    }else {
      return and__3822__auto____179325
    }
  }else {
    return and__3822__auto____179324
  }
};
cljs.reader.read_token = function read_token(rdr, initch) {
  var sb__179331 = new goog.string.StringBuffer(initch);
  var ch__179332 = cljs.reader.read_char.call(null, rdr);
  while(true) {
    if(function() {
      var or__3824__auto____179333 = ch__179332 == null;
      if(or__3824__auto____179333) {
        return or__3824__auto____179333
      }else {
        var or__3824__auto____179334 = cljs.reader.whitespace_QMARK_.call(null, ch__179332);
        if(or__3824__auto____179334) {
          return or__3824__auto____179334
        }else {
          return cljs.reader.macro_terminating_QMARK_.call(null, ch__179332)
        }
      }
    }()) {
      cljs.reader.unread.call(null, rdr, ch__179332);
      return sb__179331.toString()
    }else {
      var G__179335 = function() {
        sb__179331.append(ch__179332);
        return sb__179331
      }();
      var G__179336 = cljs.reader.read_char.call(null, rdr);
      sb__179331 = G__179335;
      ch__179332 = G__179336;
      continue
    }
    break
  }
};
cljs.reader.skip_line = function skip_line(reader, _) {
  while(true) {
    var ch__179340 = cljs.reader.read_char.call(null, reader);
    if(function() {
      var or__3824__auto____179341 = ch__179340 === "n";
      if(or__3824__auto____179341) {
        return or__3824__auto____179341
      }else {
        var or__3824__auto____179342 = ch__179340 === "r";
        if(or__3824__auto____179342) {
          return or__3824__auto____179342
        }else {
          return ch__179340 == null
        }
      }
    }()) {
      return reader
    }else {
      continue
    }
    break
  }
};
cljs.reader.int_pattern = cljs.core.re_pattern.call(null, "([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+)|0[0-9]+)(N)?");
cljs.reader.ratio_pattern = cljs.core.re_pattern.call(null, "([-+]?[0-9]+)/([0-9]+)");
cljs.reader.float_pattern = cljs.core.re_pattern.call(null, "([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?");
cljs.reader.symbol_pattern = cljs.core.re_pattern.call(null, "[:]?([^0-9/].*/)?([^0-9/][^/]*)");
cljs.reader.re_find_STAR_ = function re_find_STAR_(re, s) {
  var matches__179344 = re.exec(s);
  if(matches__179344 == null) {
    return null
  }else {
    if(matches__179344.length === 1) {
      return matches__179344[0]
    }else {
      return matches__179344
    }
  }
};
cljs.reader.match_int = function match_int(s) {
  var groups__179352 = cljs.reader.re_find_STAR_.call(null, cljs.reader.int_pattern, s);
  var group3__179353 = groups__179352[2];
  if(!function() {
    var or__3824__auto____179354 = group3__179353 == null;
    if(or__3824__auto____179354) {
      return or__3824__auto____179354
    }else {
      return group3__179353.length < 1
    }
  }()) {
    return 0
  }else {
    var negate__179355 = "-" === groups__179352[1] ? -1 : 1;
    var a__179356 = cljs.core.truth_(groups__179352[3]) ? [groups__179352[3], 10] : cljs.core.truth_(groups__179352[4]) ? [groups__179352[4], 16] : cljs.core.truth_(groups__179352[5]) ? [groups__179352[5], 8] : cljs.core.truth_(groups__179352[7]) ? [groups__179352[7], parseInt(groups__179352[7])] : "\ufdd0'default" ? [null, null] : null;
    var n__179357 = a__179356[0];
    var radix__179358 = a__179356[1];
    if(n__179357 == null) {
      return null
    }else {
      return negate__179355 * parseInt(n__179357, radix__179358)
    }
  }
};
cljs.reader.match_ratio = function match_ratio(s) {
  var groups__179362 = cljs.reader.re_find_STAR_.call(null, cljs.reader.ratio_pattern, s);
  var numinator__179363 = groups__179362[1];
  var denominator__179364 = groups__179362[2];
  return parseInt(numinator__179363) / parseInt(denominator__179364)
};
cljs.reader.match_float = function match_float(s) {
  return parseFloat(s)
};
cljs.reader.re_matches_STAR_ = function re_matches_STAR_(re, s) {
  var matches__179367 = re.exec(s);
  if(function() {
    var and__3822__auto____179368 = !(matches__179367 == null);
    if(and__3822__auto____179368) {
      return matches__179367[0] === s
    }else {
      return and__3822__auto____179368
    }
  }()) {
    if(matches__179367.length === 1) {
      return matches__179367[0]
    }else {
      return matches__179367
    }
  }else {
    return null
  }
};
cljs.reader.match_number = function match_number(s) {
  if(cljs.core.truth_(cljs.reader.re_matches_STAR_.call(null, cljs.reader.int_pattern, s))) {
    return cljs.reader.match_int.call(null, s)
  }else {
    if(cljs.core.truth_(cljs.reader.re_matches_STAR_.call(null, cljs.reader.ratio_pattern, s))) {
      return cljs.reader.match_ratio.call(null, s)
    }else {
      if(cljs.core.truth_(cljs.reader.re_matches_STAR_.call(null, cljs.reader.float_pattern, s))) {
        return cljs.reader.match_float.call(null, s)
      }else {
        return null
      }
    }
  }
};
cljs.reader.escape_char_map = function escape_char_map(c) {
  if(c === "t") {
    return"\t"
  }else {
    if(c === "r") {
      return"\r"
    }else {
      if(c === "n") {
        return"\n"
      }else {
        if(c === "\\") {
          return"\\"
        }else {
          if(c === '"') {
            return'"'
          }else {
            if(c === "b") {
              return"\u0008"
            }else {
              if(c === "f") {
                return"\u000c"
              }else {
                if("\ufdd0'else") {
                  return null
                }else {
                  return null
                }
              }
            }
          }
        }
      }
    }
  }
};
cljs.reader.read_2_chars = function read_2_chars(reader) {
  return(new goog.string.StringBuffer(cljs.reader.read_char.call(null, reader), cljs.reader.read_char.call(null, reader))).toString()
};
cljs.reader.read_4_chars = function read_4_chars(reader) {
  return(new goog.string.StringBuffer(cljs.reader.read_char.call(null, reader), cljs.reader.read_char.call(null, reader), cljs.reader.read_char.call(null, reader), cljs.reader.read_char.call(null, reader))).toString()
};
cljs.reader.unicode_2_pattern = cljs.core.re_pattern.call(null, "[0-9A-Fa-f]{2}");
cljs.reader.unicode_4_pattern = cljs.core.re_pattern.call(null, "[0-9A-Fa-f]{4}");
cljs.reader.validate_unicode_escape = function validate_unicode_escape(unicode_pattern, reader, escape_char, unicode_str) {
  if(cljs.core.truth_(cljs.core.re_matches.call(null, unicode_pattern, unicode_str))) {
    return unicode_str
  }else {
    return cljs.reader.reader_error.call(null, reader, "Unexpected unicode escape \\", escape_char, unicode_str)
  }
};
cljs.reader.make_unicode_char = function make_unicode_char(code_str) {
  var code__179370 = parseInt(code_str, 16);
  return String.fromCharCode(code__179370)
};
cljs.reader.escape_char = function escape_char(buffer, reader) {
  var ch__179373 = cljs.reader.read_char.call(null, reader);
  var mapresult__179374 = cljs.reader.escape_char_map.call(null, ch__179373);
  if(cljs.core.truth_(mapresult__179374)) {
    return mapresult__179374
  }else {
    if(ch__179373 === "x") {
      return cljs.reader.make_unicode_char.call(null, cljs.reader.validate_unicode_escape.call(null, cljs.reader.unicode_2_pattern, reader, ch__179373, cljs.reader.read_2_chars.call(null, reader)))
    }else {
      if(ch__179373 === "u") {
        return cljs.reader.make_unicode_char.call(null, cljs.reader.validate_unicode_escape.call(null, cljs.reader.unicode_4_pattern, reader, ch__179373, cljs.reader.read_4_chars.call(null, reader)))
      }else {
        if(cljs.reader.numeric_QMARK_.call(null, ch__179373)) {
          return String.fromCharCode(ch__179373)
        }else {
          if("\ufdd0'else") {
            return cljs.reader.reader_error.call(null, reader, "Unexpected unicode escape \\", ch__179373)
          }else {
            return null
          }
        }
      }
    }
  }
};
cljs.reader.read_past = function read_past(pred, rdr) {
  var ch__179376 = cljs.reader.read_char.call(null, rdr);
  while(true) {
    if(cljs.core.truth_(pred.call(null, ch__179376))) {
      var G__179377 = cljs.reader.read_char.call(null, rdr);
      ch__179376 = G__179377;
      continue
    }else {
      return ch__179376
    }
    break
  }
};
cljs.reader.read_delimited_list = function read_delimited_list(delim, rdr, recursive_QMARK_) {
  var a__179384 = cljs.core.transient$.call(null, cljs.core.PersistentVector.EMPTY);
  while(true) {
    var ch__179385 = cljs.reader.read_past.call(null, cljs.reader.whitespace_QMARK_, rdr);
    if(cljs.core.truth_(ch__179385)) {
    }else {
      cljs.reader.reader_error.call(null, rdr, "EOF")
    }
    if(delim === ch__179385) {
      return cljs.core.persistent_BANG_.call(null, a__179384)
    }else {
      var temp__3971__auto____179386 = cljs.reader.macros.call(null, ch__179385);
      if(cljs.core.truth_(temp__3971__auto____179386)) {
        var macrofn__179387 = temp__3971__auto____179386;
        var mret__179388 = macrofn__179387.call(null, rdr, ch__179385);
        var G__179390 = mret__179388 === rdr ? a__179384 : cljs.core.conj_BANG_.call(null, a__179384, mret__179388);
        a__179384 = G__179390;
        continue
      }else {
        cljs.reader.unread.call(null, rdr, ch__179385);
        var o__179389 = cljs.reader.read.call(null, rdr, true, null, recursive_QMARK_);
        var G__179391 = o__179389 === rdr ? a__179384 : cljs.core.conj_BANG_.call(null, a__179384, o__179389);
        a__179384 = G__179391;
        continue
      }
    }
    break
  }
};
cljs.reader.not_implemented = function not_implemented(rdr, ch) {
  return cljs.reader.reader_error.call(null, rdr, "Reader for ", ch, " not implemented yet")
};
cljs.reader.read_dispatch = function read_dispatch(rdr, _) {
  var ch__179396 = cljs.reader.read_char.call(null, rdr);
  var dm__179397 = cljs.reader.dispatch_macros.call(null, ch__179396);
  if(cljs.core.truth_(dm__179397)) {
    return dm__179397.call(null, rdr, _)
  }else {
    var temp__3971__auto____179398 = cljs.reader.maybe_read_tagged_type.call(null, rdr, ch__179396);
    if(cljs.core.truth_(temp__3971__auto____179398)) {
      var obj__179399 = temp__3971__auto____179398;
      return obj__179399
    }else {
      return cljs.reader.reader_error.call(null, rdr, "No dispatch macro for ", ch__179396)
    }
  }
};
cljs.reader.read_unmatched_delimiter = function read_unmatched_delimiter(rdr, ch) {
  return cljs.reader.reader_error.call(null, rdr, "Unmached delimiter ", ch)
};
cljs.reader.read_list = function read_list(rdr, _) {
  return cljs.core.apply.call(null, cljs.core.list, cljs.reader.read_delimited_list.call(null, ")", rdr, true))
};
cljs.reader.read_comment = cljs.reader.skip_line;
cljs.reader.read_vector = function read_vector(rdr, _) {
  return cljs.reader.read_delimited_list.call(null, "]", rdr, true)
};
cljs.reader.read_map = function read_map(rdr, _) {
  var l__179401 = cljs.reader.read_delimited_list.call(null, "}", rdr, true);
  if(cljs.core.odd_QMARK_.call(null, cljs.core.count.call(null, l__179401))) {
    cljs.reader.reader_error.call(null, rdr, "Map literal must contain an even number of forms")
  }else {
  }
  return cljs.core.apply.call(null, cljs.core.hash_map, l__179401)
};
cljs.reader.read_number = function read_number(reader, initch) {
  var buffer__179408 = new goog.string.StringBuffer(initch);
  var ch__179409 = cljs.reader.read_char.call(null, reader);
  while(true) {
    if(cljs.core.truth_(function() {
      var or__3824__auto____179410 = ch__179409 == null;
      if(or__3824__auto____179410) {
        return or__3824__auto____179410
      }else {
        var or__3824__auto____179411 = cljs.reader.whitespace_QMARK_.call(null, ch__179409);
        if(or__3824__auto____179411) {
          return or__3824__auto____179411
        }else {
          return cljs.reader.macros.call(null, ch__179409)
        }
      }
    }())) {
      cljs.reader.unread.call(null, reader, ch__179409);
      var s__179412 = buffer__179408.toString();
      var or__3824__auto____179413 = cljs.reader.match_number.call(null, s__179412);
      if(cljs.core.truth_(or__3824__auto____179413)) {
        return or__3824__auto____179413
      }else {
        return cljs.reader.reader_error.call(null, reader, "Invalid number format [", s__179412, "]")
      }
    }else {
      var G__179414 = function() {
        buffer__179408.append(ch__179409);
        return buffer__179408
      }();
      var G__179415 = cljs.reader.read_char.call(null, reader);
      buffer__179408 = G__179414;
      ch__179409 = G__179415;
      continue
    }
    break
  }
};
cljs.reader.read_string_STAR_ = function read_string_STAR_(reader, _) {
  var buffer__179418 = new goog.string.StringBuffer;
  var ch__179419 = cljs.reader.read_char.call(null, reader);
  while(true) {
    if(ch__179419 == null) {
      return cljs.reader.reader_error.call(null, reader, "EOF while reading string")
    }else {
      if("\\" === ch__179419) {
        var G__179420 = function() {
          buffer__179418.append(cljs.reader.escape_char.call(null, buffer__179418, reader));
          return buffer__179418
        }();
        var G__179421 = cljs.reader.read_char.call(null, reader);
        buffer__179418 = G__179420;
        ch__179419 = G__179421;
        continue
      }else {
        if('"' === ch__179419) {
          return buffer__179418.toString()
        }else {
          if("\ufdd0'default") {
            var G__179422 = function() {
              buffer__179418.append(ch__179419);
              return buffer__179418
            }();
            var G__179423 = cljs.reader.read_char.call(null, reader);
            buffer__179418 = G__179422;
            ch__179419 = G__179423;
            continue
          }else {
            return null
          }
        }
      }
    }
    break
  }
};
cljs.reader.special_symbols = function special_symbols(t, not_found) {
  if(t === "nil") {
    return null
  }else {
    if(t === "true") {
      return true
    }else {
      if(t === "false") {
        return false
      }else {
        if("\ufdd0'else") {
          return not_found
        }else {
          return null
        }
      }
    }
  }
};
cljs.reader.read_symbol = function read_symbol(reader, initch) {
  var token__179425 = cljs.reader.read_token.call(null, reader, initch);
  if(cljs.core.truth_(goog.string.contains(token__179425, "/"))) {
    return cljs.core.symbol.call(null, cljs.core.subs.call(null, token__179425, 0, token__179425.indexOf("/")), cljs.core.subs.call(null, token__179425, token__179425.indexOf("/") + 1, token__179425.length))
  }else {
    return cljs.reader.special_symbols.call(null, token__179425, cljs.core.symbol.call(null, token__179425))
  }
};
cljs.reader.read_keyword = function read_keyword(reader, initch) {
  var token__179435 = cljs.reader.read_token.call(null, reader, cljs.reader.read_char.call(null, reader));
  var a__179436 = cljs.reader.re_matches_STAR_.call(null, cljs.reader.symbol_pattern, token__179435);
  var token__179437 = a__179436[0];
  var ns__179438 = a__179436[1];
  var name__179439 = a__179436[2];
  if(cljs.core.truth_(function() {
    var or__3824__auto____179441 = function() {
      var and__3822__auto____179440 = !(void 0 === ns__179438);
      if(and__3822__auto____179440) {
        return ns__179438.substring(ns__179438.length - 2, ns__179438.length) === ":/"
      }else {
        return and__3822__auto____179440
      }
    }();
    if(cljs.core.truth_(or__3824__auto____179441)) {
      return or__3824__auto____179441
    }else {
      var or__3824__auto____179442 = name__179439[name__179439.length - 1] === ":";
      if(or__3824__auto____179442) {
        return or__3824__auto____179442
      }else {
        return!(token__179437.indexOf("::", 1) === -1)
      }
    }
  }())) {
    return cljs.reader.reader_error.call(null, reader, "Invalid token: ", token__179437)
  }else {
    if(function() {
      var and__3822__auto____179443 = !(ns__179438 == null);
      if(and__3822__auto____179443) {
        return ns__179438.length > 0
      }else {
        return and__3822__auto____179443
      }
    }()) {
      return cljs.core.keyword.call(null, ns__179438.substring(0, ns__179438.indexOf("/")), name__179439)
    }else {
      return cljs.core.keyword.call(null, token__179437)
    }
  }
};
cljs.reader.desugar_meta = function desugar_meta(f) {
  if(cljs.core.symbol_QMARK_.call(null, f)) {
    return cljs.core.ObjMap.fromObject(["\ufdd0'tag"], {"\ufdd0'tag":f})
  }else {
    if(cljs.core.string_QMARK_.call(null, f)) {
      return cljs.core.ObjMap.fromObject(["\ufdd0'tag"], {"\ufdd0'tag":f})
    }else {
      if(cljs.core.keyword_QMARK_.call(null, f)) {
        return cljs.core.PersistentArrayMap.fromArrays([f], [true])
      }else {
        if("\ufdd0'else") {
          return f
        }else {
          return null
        }
      }
    }
  }
};
cljs.reader.wrapping_reader = function wrapping_reader(sym) {
  return function(rdr, _) {
    return cljs.core.list.call(null, sym, cljs.reader.read.call(null, rdr, true, null, true))
  }
};
cljs.reader.throwing_reader = function throwing_reader(msg) {
  return function(rdr, _) {
    return cljs.reader.reader_error.call(null, rdr, msg)
  }
};
cljs.reader.read_meta = function read_meta(rdr, _) {
  var m__179449 = cljs.reader.desugar_meta.call(null, cljs.reader.read.call(null, rdr, true, null, true));
  if(cljs.core.map_QMARK_.call(null, m__179449)) {
  }else {
    cljs.reader.reader_error.call(null, rdr, "Metadata must be Symbol,Keyword,String or Map")
  }
  var o__179450 = cljs.reader.read.call(null, rdr, true, null, true);
  if(function() {
    var G__179451__179452 = o__179450;
    if(G__179451__179452) {
      if(function() {
        var or__3824__auto____179453 = G__179451__179452.cljs$lang$protocol_mask$partition0$ & 262144;
        if(or__3824__auto____179453) {
          return or__3824__auto____179453
        }else {
          return G__179451__179452.cljs$core$IWithMeta$
        }
      }()) {
        return true
      }else {
        if(!G__179451__179452.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IWithMeta, G__179451__179452)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IWithMeta, G__179451__179452)
    }
  }()) {
    return cljs.core.with_meta.call(null, o__179450, cljs.core.merge.call(null, cljs.core.meta.call(null, o__179450), m__179449))
  }else {
    return cljs.reader.reader_error.call(null, rdr, "Metadata can only be applied to IWithMetas")
  }
};
cljs.reader.read_set = function read_set(rdr, _) {
  return cljs.core.set.call(null, cljs.reader.read_delimited_list.call(null, "}", rdr, true))
};
cljs.reader.read_regex = function read_regex(rdr, ch) {
  return cljs.core.re_pattern.call(null, cljs.reader.read_string_STAR_.call(null, rdr, ch))
};
cljs.reader.read_discard = function read_discard(rdr, _) {
  cljs.reader.read.call(null, rdr, true, null, true);
  return rdr
};
cljs.reader.macros = function macros(c) {
  if(c === '"') {
    return cljs.reader.read_string_STAR_
  }else {
    if(c === ":") {
      return cljs.reader.read_keyword
    }else {
      if(c === ";") {
        return cljs.reader.not_implemented
      }else {
        if(c === "'") {
          return cljs.reader.wrapping_reader.call(null, "\ufdd1'quote")
        }else {
          if(c === "@") {
            return cljs.reader.wrapping_reader.call(null, "\ufdd1'deref")
          }else {
            if(c === "^") {
              return cljs.reader.read_meta
            }else {
              if(c === "`") {
                return cljs.reader.not_implemented
              }else {
                if(c === "~") {
                  return cljs.reader.not_implemented
                }else {
                  if(c === "(") {
                    return cljs.reader.read_list
                  }else {
                    if(c === ")") {
                      return cljs.reader.read_unmatched_delimiter
                    }else {
                      if(c === "[") {
                        return cljs.reader.read_vector
                      }else {
                        if(c === "]") {
                          return cljs.reader.read_unmatched_delimiter
                        }else {
                          if(c === "{") {
                            return cljs.reader.read_map
                          }else {
                            if(c === "}") {
                              return cljs.reader.read_unmatched_delimiter
                            }else {
                              if(c === "\\") {
                                return cljs.reader.read_char
                              }else {
                                if(c === "%") {
                                  return cljs.reader.not_implemented
                                }else {
                                  if(c === "#") {
                                    return cljs.reader.read_dispatch
                                  }else {
                                    if("\ufdd0'else") {
                                      return null
                                    }else {
                                      return null
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
cljs.reader.dispatch_macros = function dispatch_macros(s) {
  if(s === "{") {
    return cljs.reader.read_set
  }else {
    if(s === "<") {
      return cljs.reader.throwing_reader.call(null, "Unreadable form")
    }else {
      if(s === '"') {
        return cljs.reader.read_regex
      }else {
        if(s === "!") {
          return cljs.reader.read_comment
        }else {
          if(s === "_") {
            return cljs.reader.read_discard
          }else {
            if("\ufdd0'else") {
              return null
            }else {
              return null
            }
          }
        }
      }
    }
  }
};
cljs.reader.read = function read(reader, eof_is_error, sentinel, is_recursive) {
  while(true) {
    var ch__179457 = cljs.reader.read_char.call(null, reader);
    if(ch__179457 == null) {
      if(cljs.core.truth_(eof_is_error)) {
        return cljs.reader.reader_error.call(null, reader, "EOF")
      }else {
        return sentinel
      }
    }else {
      if(cljs.reader.whitespace_QMARK_.call(null, ch__179457)) {
        var G__179460 = reader;
        var G__179461 = eof_is_error;
        var G__179462 = sentinel;
        var G__179463 = is_recursive;
        reader = G__179460;
        eof_is_error = G__179461;
        sentinel = G__179462;
        is_recursive = G__179463;
        continue
      }else {
        if(cljs.reader.comment_prefix_QMARK_.call(null, ch__179457)) {
          var G__179464 = cljs.reader.read_comment.call(null, reader, ch__179457);
          var G__179465 = eof_is_error;
          var G__179466 = sentinel;
          var G__179467 = is_recursive;
          reader = G__179464;
          eof_is_error = G__179465;
          sentinel = G__179466;
          is_recursive = G__179467;
          continue
        }else {
          if("\ufdd0'else") {
            var f__179458 = cljs.reader.macros.call(null, ch__179457);
            var res__179459 = cljs.core.truth_(f__179458) ? f__179458.call(null, reader, ch__179457) : cljs.reader.number_literal_QMARK_.call(null, reader, ch__179457) ? cljs.reader.read_number.call(null, reader, ch__179457) : "\ufdd0'else" ? cljs.reader.read_symbol.call(null, reader, ch__179457) : null;
            if(res__179459 === reader) {
              var G__179468 = reader;
              var G__179469 = eof_is_error;
              var G__179470 = sentinel;
              var G__179471 = is_recursive;
              reader = G__179468;
              eof_is_error = G__179469;
              sentinel = G__179470;
              is_recursive = G__179471;
              continue
            }else {
              return res__179459
            }
          }else {
            return null
          }
        }
      }
    }
    break
  }
};
cljs.reader.read_string = function read_string(s) {
  var r__179473 = cljs.reader.push_back_reader.call(null, s);
  return cljs.reader.read.call(null, r__179473, true, null, false)
};
cljs.reader.zero_fill_right = function zero_fill_right(s, width) {
  if(cljs.core._EQ_.call(null, width, cljs.core.count.call(null, s))) {
    return s
  }else {
    if(width < cljs.core.count.call(null, s)) {
      return s.substring(0, width)
    }else {
      if("\ufdd0'else") {
        var b__179475 = new goog.string.StringBuffer(s);
        while(true) {
          if(b__179475.getLength() < width) {
            var G__179476 = b__179475.append("0");
            b__179475 = G__179476;
            continue
          }else {
            return b__179475.toString()
          }
          break
        }
      }else {
        return null
      }
    }
  }
};
cljs.reader.divisible_QMARK_ = function divisible_QMARK_(num, div) {
  return num % div === 0
};
cljs.reader.indivisible_QMARK_ = function indivisible_QMARK_(num, div) {
  return cljs.core.not.call(null, cljs.reader.divisible_QMARK_.call(null, num, div))
};
cljs.reader.leap_year_QMARK_ = function leap_year_QMARK_(year) {
  var and__3822__auto____179479 = cljs.reader.divisible_QMARK_.call(null, year, 4);
  if(cljs.core.truth_(and__3822__auto____179479)) {
    var or__3824__auto____179480 = cljs.reader.indivisible_QMARK_.call(null, year, 100);
    if(cljs.core.truth_(or__3824__auto____179480)) {
      return or__3824__auto____179480
    }else {
      return cljs.reader.divisible_QMARK_.call(null, year, 400)
    }
  }else {
    return and__3822__auto____179479
  }
};
cljs.reader.days_in_month = function() {
  var dim_norm__179485 = cljs.core.PersistentVector.fromArray([null, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], true);
  var dim_leap__179486 = cljs.core.PersistentVector.fromArray([null, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], true);
  return function(month, leap_year_QMARK_) {
    return cljs.core._lookup.call(null, cljs.core.truth_(leap_year_QMARK_) ? dim_leap__179486 : dim_norm__179485, month, null)
  }
}();
cljs.reader.parse_and_validate_timestamp = function() {
  var timestamp__179487 = /(\d\d\d\d)(?:-(\d\d)(?:-(\d\d)(?:[T](\d\d)(?::(\d\d)(?::(\d\d)(?:[.](\d+))?)?)?)?)?)?(?:[Z]|([-+])(\d\d):(\d\d))?/;
  var check__179489 = function(low, n, high, msg) {
    if(function() {
      var and__3822__auto____179488 = low <= n;
      if(and__3822__auto____179488) {
        return n <= high
      }else {
        return and__3822__auto____179488
      }
    }()) {
    }else {
      throw new Error([cljs.core.str("Assert failed: "), cljs.core.str([cljs.core.str(msg), cljs.core.str(" Failed:  "), cljs.core.str(low), cljs.core.str("<="), cljs.core.str(n), cljs.core.str("<="), cljs.core.str(high)].join("")), cljs.core.str("\n"), cljs.core.str(cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'<=", "\ufdd1'low", "\ufdd1'n", "\ufdd1'high"), cljs.core.hash_map("\ufdd0'line", 474))))].join(""));
    }
    return n
  };
  return function(ts) {
    var temp__3974__auto____179490 = cljs.core.map.call(null, cljs.core.vec, cljs.core.split_at.call(null, 8, cljs.core.re_matches.call(null, timestamp__179487, ts)));
    if(cljs.core.truth_(temp__3974__auto____179490)) {
      var vec__179491__179494 = temp__3974__auto____179490;
      var vec__179492__179495 = cljs.core.nth.call(null, vec__179491__179494, 0, null);
      var ___179496 = cljs.core.nth.call(null, vec__179492__179495, 0, null);
      var years__179497 = cljs.core.nth.call(null, vec__179492__179495, 1, null);
      var months__179498 = cljs.core.nth.call(null, vec__179492__179495, 2, null);
      var days__179499 = cljs.core.nth.call(null, vec__179492__179495, 3, null);
      var hours__179500 = cljs.core.nth.call(null, vec__179492__179495, 4, null);
      var minutes__179501 = cljs.core.nth.call(null, vec__179492__179495, 5, null);
      var seconds__179502 = cljs.core.nth.call(null, vec__179492__179495, 6, null);
      var milliseconds__179503 = cljs.core.nth.call(null, vec__179492__179495, 7, null);
      var vec__179493__179504 = cljs.core.nth.call(null, vec__179491__179494, 1, null);
      var ___179505 = cljs.core.nth.call(null, vec__179493__179504, 0, null);
      var ___179506 = cljs.core.nth.call(null, vec__179493__179504, 1, null);
      var ___179507 = cljs.core.nth.call(null, vec__179493__179504, 2, null);
      var V__179508 = vec__179491__179494;
      var vec__179509__179512 = cljs.core.map.call(null, function(v) {
        return cljs.core.map.call(null, function(p1__179484_SHARP_) {
          return parseInt(p1__179484_SHARP_, 10)
        }, v)
      }, cljs.core.map.call(null, function(p1__179482_SHARP_, p2__179481_SHARP_) {
        return cljs.core.update_in.call(null, p2__179481_SHARP_, cljs.core.PersistentVector.fromArray([0], true), p1__179482_SHARP_)
      }, cljs.core.PersistentVector.fromArray([cljs.core.constantly.call(null, null), function(p1__179483_SHARP_) {
        if(cljs.core._EQ_.call(null, p1__179483_SHARP_, "-")) {
          return"-1"
        }else {
          return"1"
        }
      }], true), V__179508));
      var vec__179510__179513 = cljs.core.nth.call(null, vec__179509__179512, 0, null);
      var ___179514 = cljs.core.nth.call(null, vec__179510__179513, 0, null);
      var y__179515 = cljs.core.nth.call(null, vec__179510__179513, 1, null);
      var mo__179516 = cljs.core.nth.call(null, vec__179510__179513, 2, null);
      var d__179517 = cljs.core.nth.call(null, vec__179510__179513, 3, null);
      var h__179518 = cljs.core.nth.call(null, vec__179510__179513, 4, null);
      var m__179519 = cljs.core.nth.call(null, vec__179510__179513, 5, null);
      var s__179520 = cljs.core.nth.call(null, vec__179510__179513, 6, null);
      var ms__179521 = cljs.core.nth.call(null, vec__179510__179513, 7, null);
      var vec__179511__179522 = cljs.core.nth.call(null, vec__179509__179512, 1, null);
      var offset_sign__179523 = cljs.core.nth.call(null, vec__179511__179522, 0, null);
      var offset_hours__179524 = cljs.core.nth.call(null, vec__179511__179522, 1, null);
      var offset_minutes__179525 = cljs.core.nth.call(null, vec__179511__179522, 2, null);
      var offset__179526 = offset_sign__179523 * (offset_hours__179524 * 60 + offset_minutes__179525);
      return cljs.core.PersistentVector.fromArray([cljs.core.not.call(null, years__179497) ? 1970 : y__179515, cljs.core.not.call(null, months__179498) ? 1 : check__179489.call(null, 1, mo__179516, 12, "timestamp month field must be in range 1..12"), cljs.core.not.call(null, days__179499) ? 1 : check__179489.call(null, 1, d__179517, cljs.reader.days_in_month.call(null, mo__179516, cljs.reader.leap_year_QMARK_.call(null, y__179515)), "timestamp day field must be in range 1..last day in month"), cljs.core.not.call(null, 
      hours__179500) ? 0 : check__179489.call(null, 0, h__179518, 23, "timestamp hour field must be in range 0..23"), cljs.core.not.call(null, minutes__179501) ? 0 : check__179489.call(null, 0, m__179519, 59, "timestamp minute field must be in range 0..59"), cljs.core.not.call(null, seconds__179502) ? 0 : check__179489.call(null, 0, s__179520, cljs.core._EQ_.call(null, m__179519, 59) ? 60 : 59, "timestamp second field must be in range 0..60"), cljs.core.not.call(null, milliseconds__179503) ? 0 : 
      check__179489.call(null, 0, ms__179521, 999, "timestamp millisecond field must be in range 0..999"), offset__179526], true)
    }else {
      return null
    }
  }
}();
cljs.reader.parse_timestamp = function parse_timestamp(ts) {
  var temp__3971__auto____179538 = cljs.reader.parse_and_validate_timestamp.call(null, ts);
  if(cljs.core.truth_(temp__3971__auto____179538)) {
    var vec__179539__179540 = temp__3971__auto____179538;
    var years__179541 = cljs.core.nth.call(null, vec__179539__179540, 0, null);
    var months__179542 = cljs.core.nth.call(null, vec__179539__179540, 1, null);
    var days__179543 = cljs.core.nth.call(null, vec__179539__179540, 2, null);
    var hours__179544 = cljs.core.nth.call(null, vec__179539__179540, 3, null);
    var minutes__179545 = cljs.core.nth.call(null, vec__179539__179540, 4, null);
    var seconds__179546 = cljs.core.nth.call(null, vec__179539__179540, 5, null);
    var ms__179547 = cljs.core.nth.call(null, vec__179539__179540, 6, null);
    var offset__179548 = cljs.core.nth.call(null, vec__179539__179540, 7, null);
    return new Date(Date.UTC(years__179541, months__179542 - 1, days__179543, hours__179544, minutes__179545, seconds__179546, ms__179547) - offset__179548 * 60 * 1E3)
  }else {
    return cljs.reader.reader_error.call(null, null, [cljs.core.str("Unrecognized date/time syntax: "), cljs.core.str(ts)].join(""))
  }
};
cljs.reader.read_date = function read_date(s) {
  if(cljs.core.string_QMARK_.call(null, s)) {
    return cljs.reader.parse_timestamp.call(null, s)
  }else {
    return cljs.reader.reader_error.call(null, null, "Instance literal expects a string for its timestamp.")
  }
};
cljs.reader.read_queue = function read_queue(elems) {
  if(cljs.core.vector_QMARK_.call(null, elems)) {
    return cljs.core.into.call(null, cljs.core.PersistentQueue.EMPTY, elems)
  }else {
    return cljs.reader.reader_error.call(null, null, "Queue literal expects a vector for its elements.")
  }
};
cljs.reader.read_uuid = function read_uuid(uuid) {
  if(cljs.core.string_QMARK_.call(null, uuid)) {
    return new cljs.core.UUID(uuid)
  }else {
    return cljs.reader.reader_error.call(null, null, "UUID literal expects a string as its representation.")
  }
};
cljs.reader._STAR_tag_table_STAR_ = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject(["inst", "uuid", "queue"], {"inst":cljs.reader.read_date, "uuid":cljs.reader.read_uuid, "queue":cljs.reader.read_queue}));
cljs.reader.maybe_read_tagged_type = function maybe_read_tagged_type(rdr, initch) {
  var tag__179552 = cljs.reader.read_symbol.call(null, rdr, initch);
  var temp__3971__auto____179553 = cljs.core._lookup.call(null, cljs.core.deref.call(null, cljs.reader._STAR_tag_table_STAR_), cljs.core.name.call(null, tag__179552), null);
  if(cljs.core.truth_(temp__3971__auto____179553)) {
    var pfn__179554 = temp__3971__auto____179553;
    return pfn__179554.call(null, cljs.reader.read.call(null, rdr, true, null, false))
  }else {
    return cljs.reader.reader_error.call(null, rdr, "Could not find tag parser for ", cljs.core.name.call(null, tag__179552), " in ", cljs.core.pr_str.call(null, cljs.core.keys.call(null, cljs.core.deref.call(null, cljs.reader._STAR_tag_table_STAR_))))
  }
};
cljs.reader.register_tag_parser_BANG_ = function register_tag_parser_BANG_(tag, f) {
  var tag__179557 = cljs.core.name.call(null, tag);
  var old_parser__179558 = cljs.core._lookup.call(null, cljs.core.deref.call(null, cljs.reader._STAR_tag_table_STAR_), tag__179557, null);
  cljs.core.swap_BANG_.call(null, cljs.reader._STAR_tag_table_STAR_, cljs.core.assoc, tag__179557, f);
  return old_parser__179558
};
cljs.reader.deregister_tag_parser_BANG_ = function deregister_tag_parser_BANG_(tag) {
  var tag__179561 = cljs.core.name.call(null, tag);
  var old_parser__179562 = cljs.core._lookup.call(null, cljs.core.deref.call(null, cljs.reader._STAR_tag_table_STAR_), tag__179561, null);
  cljs.core.swap_BANG_.call(null, cljs.reader._STAR_tag_table_STAR_, cljs.core.dissoc, tag__179561);
  return old_parser__179562
};
goog.provide("d3.core");
goog.require("cljs.core");
goog.require("cljs.reader");
goog.require("cljs.reader");
d3.core.d3 = d3;
d3.core.Tau = 2 * Math.PI;
d3.core.datafilter = function datafilter(x) {
  if(cljs.core.truth_(function() {
    var and__3822__auto____6373 = cljs.core.re_find.call(null, /^function/, cljs.core.type.call(null, x));
    if(cljs.core.truth_(and__3822__auto____6373)) {
      return cljs.core.not.call(null, cljs.core.re_find.call(null, /^function Array()/, cljs.core.type.call(null, x)))
    }else {
      return and__3822__auto____6373
    }
  }())) {
    return function() {
      return cljs.core.apply.call(null, cljs.core.array, x.call(null))
    }
  }else {
    return cljs.core.apply.call(null, cljs.core.array, x)
  }
};
d3.core.d3.selection.prototype.dataToArray = d3.core.datafilter;
d3.core.d3_edn = function() {
  var d3_edn = null;
  var d3_edn__2 = function(url, callback) {
    return d3_edn.call(null, url, null, callback)
  };
  var d3_edn__3 = function(url, mime, callback) {
    var ready__6375 = function ready(req) {
      return callback.call(null, cljs.core.truth_(req) ? cljs.reader.read_string.call(null, req.responseText) : req)
    };
    console.log([cljs.core.str("loading: "), cljs.core.str(url)].join(""));
    return d3.core.d3.xhr(url, mime, ready__6375)
  };
  d3_edn = function(url, mime, callback) {
    switch(arguments.length) {
      case 2:
        return d3_edn__2.call(this, url, mime);
      case 3:
        return d3_edn__3.call(this, url, mime, callback)
    }
    throw"Invalid arity: " + arguments.length;
  };
  d3_edn.cljs$lang$arity$2 = d3_edn__2;
  d3_edn.cljs$lang$arity$3 = d3_edn__3;
  return d3_edn
}();
d3.core.d3.edn = d3.core.d3_edn;
goog.provide("clocky.core");
goog.require("cljs.core");
goog.require("d3.core");
goog.require("d3.core");
clocky.core.radii = cljs.core.ObjMap.fromObject(["\ufdd0'hours", "\ufdd0'minutes", "\ufdd0'seconds", "\ufdd0'millis"], {"\ufdd0'hours":275, "\ufdd0'minutes":200, "\ufdd0'seconds":110, "\ufdd0'millis":30});
clocky.core.arc = d3.core.d3.svg.arc().startAngle(function(p1__6354_SHARP_) {
  return(new cljs.core.Keyword("\ufdd0'value")).call(null, p1__6354_SHARP_) * d3.core.Tau / 100
}).endAngle(function(p1__6355_SHARP_) {
  return(50 + (new cljs.core.Keyword("\ufdd0'value")).call(null, p1__6355_SHARP_)) * d3.core.Tau / 100
}).innerRadius(0).outerRadius(function(p1__6356_SHARP_) {
  return cljs.core.keyword.call(null, (new cljs.core.Keyword("\ufdd0'key")).call(null, p1__6356_SHARP_)).call(null, clocky.core.radii)
});
clocky.core.curClockData = function curClockData() {
  var d__6363 = new Date;
  var hours__6364 = cljs.core.rem.call(null, d__6363.getHours(), 12) * 100 / 12;
  var minutes__6365 = d__6363.getMinutes() * 100 / 60;
  var seconds__6366 = d__6363.getSeconds() * 100 / 60;
  var millis__6367 = d__6363.getMilliseconds() * 100 / 1E3;
  return cljs.core.PersistentVector.fromArray([cljs.core.ObjMap.fromObject(["\ufdd0'value", "\ufdd0'key", "\ufdd0'which"], {"\ufdd0'value":hours__6364, "\ufdd0'key":"hours", "\ufdd0'which":1}), cljs.core.ObjMap.fromObject(["\ufdd0'value", "\ufdd0'key", "\ufdd0'which"], {"\ufdd0'value":hours__6364 + 50, "\ufdd0'key":"hours", "\ufdd0'which":2}), cljs.core.ObjMap.fromObject(["\ufdd0'value", "\ufdd0'key", "\ufdd0'which"], {"\ufdd0'value":minutes__6365, "\ufdd0'key":"minutes", "\ufdd0'which":1}), cljs.core.ObjMap.fromObject(["\ufdd0'value", 
  "\ufdd0'key", "\ufdd0'which"], {"\ufdd0'value":minutes__6365 + 50, "\ufdd0'key":"minutes", "\ufdd0'which":2}), cljs.core.ObjMap.fromObject(["\ufdd0'value", "\ufdd0'key", "\ufdd0'which"], {"\ufdd0'value":seconds__6366, "\ufdd0'key":"seconds", "\ufdd0'which":1}), cljs.core.ObjMap.fromObject(["\ufdd0'value", "\ufdd0'key", "\ufdd0'which"], {"\ufdd0'value":seconds__6366 + 50, "\ufdd0'key":"seconds", "\ufdd0'which":2}), cljs.core.ObjMap.fromObject(["\ufdd0'value", "\ufdd0'key", "\ufdd0'which"], {"\ufdd0'value":millis__6367, 
  "\ufdd0'key":"millis", "\ufdd0'which":1}), cljs.core.ObjMap.fromObject(["\ufdd0'value", "\ufdd0'key", "\ufdd0'which"], {"\ufdd0'value":millis__6367 + 50, "\ufdd0'key":"millis", "\ufdd0'which":2})], true)
};
clocky.core.launch = function launch() {
  var root__6370 = d3.core.d3.select("#clocky").append("svg").attr("width", 600).attr("height", 600).append("g").attr("transform", "translate(300,300)");
  var rings__6371 = root__6370.selectAll("g").data(clocky.core.curClockData);
  rings__6371.enter().append("g").append("path");
  return d3.core.d3.timer(function() {
    root__6370.selectAll("g").data(clocky.core.curClockData).select("path").attr("class", function(p1__6357_SHARP_) {
      return[cljs.core.str((new cljs.core.Keyword("\ufdd0'key")).call(null, p1__6357_SHARP_)), cljs.core.str((new cljs.core.Keyword("\ufdd0'which")).call(null, p1__6357_SHARP_))].join("")
    }).attr("d", clocky.core.arc);
    return false
  })
};
goog.exportSymbol("clocky.core.launch", clocky.core.launch);
