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
  var x__6102 = x == null ? null : x;
  if(p[goog.typeOf(x__6102)]) {
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
    return make_array.call(null, size)
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
    var G__6103__delegate = function(array, i, idxs) {
      return cljs.core.apply.call(null, aget, aget.call(null, array, i), idxs)
    };
    var G__6103 = function(array, i, var_args) {
      var idxs = null;
      if(goog.isDef(var_args)) {
        idxs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__6103__delegate.call(this, array, i, idxs)
    };
    G__6103.cljs$lang$maxFixedArity = 2;
    G__6103.cljs$lang$applyTo = function(arglist__6104) {
      var array = cljs.core.first(arglist__6104);
      var i = cljs.core.first(cljs.core.next(arglist__6104));
      var idxs = cljs.core.rest(cljs.core.next(arglist__6104));
      return G__6103__delegate(array, i, idxs)
    };
    G__6103.cljs$lang$arity$variadic = G__6103__delegate;
    return G__6103
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
    return into_array.call(null, null, aseq)
  };
  var into_array__2 = function(type, aseq) {
    return cljs.core.reduce.call(null, function(a, x) {
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
      var and__3822__auto____6189 = this$;
      if(and__3822__auto____6189) {
        return this$.cljs$core$IFn$_invoke$arity$1
      }else {
        return and__3822__auto____6189
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$1(this$)
    }else {
      var x__2363__auto____6190 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6191 = cljs.core._invoke[goog.typeOf(x__2363__auto____6190)];
        if(or__3824__auto____6191) {
          return or__3824__auto____6191
        }else {
          var or__3824__auto____6192 = cljs.core._invoke["_"];
          if(or__3824__auto____6192) {
            return or__3824__auto____6192
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var _invoke__2 = function(this$, a) {
    if(function() {
      var and__3822__auto____6193 = this$;
      if(and__3822__auto____6193) {
        return this$.cljs$core$IFn$_invoke$arity$2
      }else {
        return and__3822__auto____6193
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$2(this$, a)
    }else {
      var x__2363__auto____6194 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6195 = cljs.core._invoke[goog.typeOf(x__2363__auto____6194)];
        if(or__3824__auto____6195) {
          return or__3824__auto____6195
        }else {
          var or__3824__auto____6196 = cljs.core._invoke["_"];
          if(or__3824__auto____6196) {
            return or__3824__auto____6196
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a)
    }
  };
  var _invoke__3 = function(this$, a, b) {
    if(function() {
      var and__3822__auto____6197 = this$;
      if(and__3822__auto____6197) {
        return this$.cljs$core$IFn$_invoke$arity$3
      }else {
        return and__3822__auto____6197
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$3(this$, a, b)
    }else {
      var x__2363__auto____6198 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6199 = cljs.core._invoke[goog.typeOf(x__2363__auto____6198)];
        if(or__3824__auto____6199) {
          return or__3824__auto____6199
        }else {
          var or__3824__auto____6200 = cljs.core._invoke["_"];
          if(or__3824__auto____6200) {
            return or__3824__auto____6200
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b)
    }
  };
  var _invoke__4 = function(this$, a, b, c) {
    if(function() {
      var and__3822__auto____6201 = this$;
      if(and__3822__auto____6201) {
        return this$.cljs$core$IFn$_invoke$arity$4
      }else {
        return and__3822__auto____6201
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$4(this$, a, b, c)
    }else {
      var x__2363__auto____6202 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6203 = cljs.core._invoke[goog.typeOf(x__2363__auto____6202)];
        if(or__3824__auto____6203) {
          return or__3824__auto____6203
        }else {
          var or__3824__auto____6204 = cljs.core._invoke["_"];
          if(or__3824__auto____6204) {
            return or__3824__auto____6204
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c)
    }
  };
  var _invoke__5 = function(this$, a, b, c, d) {
    if(function() {
      var and__3822__auto____6205 = this$;
      if(and__3822__auto____6205) {
        return this$.cljs$core$IFn$_invoke$arity$5
      }else {
        return and__3822__auto____6205
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$5(this$, a, b, c, d)
    }else {
      var x__2363__auto____6206 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6207 = cljs.core._invoke[goog.typeOf(x__2363__auto____6206)];
        if(or__3824__auto____6207) {
          return or__3824__auto____6207
        }else {
          var or__3824__auto____6208 = cljs.core._invoke["_"];
          if(or__3824__auto____6208) {
            return or__3824__auto____6208
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d)
    }
  };
  var _invoke__6 = function(this$, a, b, c, d, e) {
    if(function() {
      var and__3822__auto____6209 = this$;
      if(and__3822__auto____6209) {
        return this$.cljs$core$IFn$_invoke$arity$6
      }else {
        return and__3822__auto____6209
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$6(this$, a, b, c, d, e)
    }else {
      var x__2363__auto____6210 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6211 = cljs.core._invoke[goog.typeOf(x__2363__auto____6210)];
        if(or__3824__auto____6211) {
          return or__3824__auto____6211
        }else {
          var or__3824__auto____6212 = cljs.core._invoke["_"];
          if(or__3824__auto____6212) {
            return or__3824__auto____6212
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e)
    }
  };
  var _invoke__7 = function(this$, a, b, c, d, e, f) {
    if(function() {
      var and__3822__auto____6213 = this$;
      if(and__3822__auto____6213) {
        return this$.cljs$core$IFn$_invoke$arity$7
      }else {
        return and__3822__auto____6213
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$7(this$, a, b, c, d, e, f)
    }else {
      var x__2363__auto____6214 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6215 = cljs.core._invoke[goog.typeOf(x__2363__auto____6214)];
        if(or__3824__auto____6215) {
          return or__3824__auto____6215
        }else {
          var or__3824__auto____6216 = cljs.core._invoke["_"];
          if(or__3824__auto____6216) {
            return or__3824__auto____6216
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f)
    }
  };
  var _invoke__8 = function(this$, a, b, c, d, e, f, g) {
    if(function() {
      var and__3822__auto____6217 = this$;
      if(and__3822__auto____6217) {
        return this$.cljs$core$IFn$_invoke$arity$8
      }else {
        return and__3822__auto____6217
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$8(this$, a, b, c, d, e, f, g)
    }else {
      var x__2363__auto____6218 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6219 = cljs.core._invoke[goog.typeOf(x__2363__auto____6218)];
        if(or__3824__auto____6219) {
          return or__3824__auto____6219
        }else {
          var or__3824__auto____6220 = cljs.core._invoke["_"];
          if(or__3824__auto____6220) {
            return or__3824__auto____6220
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g)
    }
  };
  var _invoke__9 = function(this$, a, b, c, d, e, f, g, h) {
    if(function() {
      var and__3822__auto____6221 = this$;
      if(and__3822__auto____6221) {
        return this$.cljs$core$IFn$_invoke$arity$9
      }else {
        return and__3822__auto____6221
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$9(this$, a, b, c, d, e, f, g, h)
    }else {
      var x__2363__auto____6222 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6223 = cljs.core._invoke[goog.typeOf(x__2363__auto____6222)];
        if(or__3824__auto____6223) {
          return or__3824__auto____6223
        }else {
          var or__3824__auto____6224 = cljs.core._invoke["_"];
          if(or__3824__auto____6224) {
            return or__3824__auto____6224
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h)
    }
  };
  var _invoke__10 = function(this$, a, b, c, d, e, f, g, h, i) {
    if(function() {
      var and__3822__auto____6225 = this$;
      if(and__3822__auto____6225) {
        return this$.cljs$core$IFn$_invoke$arity$10
      }else {
        return and__3822__auto____6225
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$10(this$, a, b, c, d, e, f, g, h, i)
    }else {
      var x__2363__auto____6226 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6227 = cljs.core._invoke[goog.typeOf(x__2363__auto____6226)];
        if(or__3824__auto____6227) {
          return or__3824__auto____6227
        }else {
          var or__3824__auto____6228 = cljs.core._invoke["_"];
          if(or__3824__auto____6228) {
            return or__3824__auto____6228
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i)
    }
  };
  var _invoke__11 = function(this$, a, b, c, d, e, f, g, h, i, j) {
    if(function() {
      var and__3822__auto____6229 = this$;
      if(and__3822__auto____6229) {
        return this$.cljs$core$IFn$_invoke$arity$11
      }else {
        return and__3822__auto____6229
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$11(this$, a, b, c, d, e, f, g, h, i, j)
    }else {
      var x__2363__auto____6230 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6231 = cljs.core._invoke[goog.typeOf(x__2363__auto____6230)];
        if(or__3824__auto____6231) {
          return or__3824__auto____6231
        }else {
          var or__3824__auto____6232 = cljs.core._invoke["_"];
          if(or__3824__auto____6232) {
            return or__3824__auto____6232
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j)
    }
  };
  var _invoke__12 = function(this$, a, b, c, d, e, f, g, h, i, j, k) {
    if(function() {
      var and__3822__auto____6233 = this$;
      if(and__3822__auto____6233) {
        return this$.cljs$core$IFn$_invoke$arity$12
      }else {
        return and__3822__auto____6233
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$12(this$, a, b, c, d, e, f, g, h, i, j, k)
    }else {
      var x__2363__auto____6234 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6235 = cljs.core._invoke[goog.typeOf(x__2363__auto____6234)];
        if(or__3824__auto____6235) {
          return or__3824__auto____6235
        }else {
          var or__3824__auto____6236 = cljs.core._invoke["_"];
          if(or__3824__auto____6236) {
            return or__3824__auto____6236
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k)
    }
  };
  var _invoke__13 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l) {
    if(function() {
      var and__3822__auto____6237 = this$;
      if(and__3822__auto____6237) {
        return this$.cljs$core$IFn$_invoke$arity$13
      }else {
        return and__3822__auto____6237
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$13(this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }else {
      var x__2363__auto____6238 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6239 = cljs.core._invoke[goog.typeOf(x__2363__auto____6238)];
        if(or__3824__auto____6239) {
          return or__3824__auto____6239
        }else {
          var or__3824__auto____6240 = cljs.core._invoke["_"];
          if(or__3824__auto____6240) {
            return or__3824__auto____6240
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }
  };
  var _invoke__14 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m) {
    if(function() {
      var and__3822__auto____6241 = this$;
      if(and__3822__auto____6241) {
        return this$.cljs$core$IFn$_invoke$arity$14
      }else {
        return and__3822__auto____6241
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$14(this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }else {
      var x__2363__auto____6242 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6243 = cljs.core._invoke[goog.typeOf(x__2363__auto____6242)];
        if(or__3824__auto____6243) {
          return or__3824__auto____6243
        }else {
          var or__3824__auto____6244 = cljs.core._invoke["_"];
          if(or__3824__auto____6244) {
            return or__3824__auto____6244
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }
  };
  var _invoke__15 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    if(function() {
      var and__3822__auto____6245 = this$;
      if(and__3822__auto____6245) {
        return this$.cljs$core$IFn$_invoke$arity$15
      }else {
        return and__3822__auto____6245
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$15(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }else {
      var x__2363__auto____6246 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6247 = cljs.core._invoke[goog.typeOf(x__2363__auto____6246)];
        if(or__3824__auto____6247) {
          return or__3824__auto____6247
        }else {
          var or__3824__auto____6248 = cljs.core._invoke["_"];
          if(or__3824__auto____6248) {
            return or__3824__auto____6248
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }
  };
  var _invoke__16 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    if(function() {
      var and__3822__auto____6249 = this$;
      if(and__3822__auto____6249) {
        return this$.cljs$core$IFn$_invoke$arity$16
      }else {
        return and__3822__auto____6249
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$16(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }else {
      var x__2363__auto____6250 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6251 = cljs.core._invoke[goog.typeOf(x__2363__auto____6250)];
        if(or__3824__auto____6251) {
          return or__3824__auto____6251
        }else {
          var or__3824__auto____6252 = cljs.core._invoke["_"];
          if(or__3824__auto____6252) {
            return or__3824__auto____6252
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }
  };
  var _invoke__17 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    if(function() {
      var and__3822__auto____6253 = this$;
      if(and__3822__auto____6253) {
        return this$.cljs$core$IFn$_invoke$arity$17
      }else {
        return and__3822__auto____6253
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$17(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }else {
      var x__2363__auto____6254 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6255 = cljs.core._invoke[goog.typeOf(x__2363__auto____6254)];
        if(or__3824__auto____6255) {
          return or__3824__auto____6255
        }else {
          var or__3824__auto____6256 = cljs.core._invoke["_"];
          if(or__3824__auto____6256) {
            return or__3824__auto____6256
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }
  };
  var _invoke__18 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    if(function() {
      var and__3822__auto____6257 = this$;
      if(and__3822__auto____6257) {
        return this$.cljs$core$IFn$_invoke$arity$18
      }else {
        return and__3822__auto____6257
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$18(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }else {
      var x__2363__auto____6258 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6259 = cljs.core._invoke[goog.typeOf(x__2363__auto____6258)];
        if(or__3824__auto____6259) {
          return or__3824__auto____6259
        }else {
          var or__3824__auto____6260 = cljs.core._invoke["_"];
          if(or__3824__auto____6260) {
            return or__3824__auto____6260
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }
  };
  var _invoke__19 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s) {
    if(function() {
      var and__3822__auto____6261 = this$;
      if(and__3822__auto____6261) {
        return this$.cljs$core$IFn$_invoke$arity$19
      }else {
        return and__3822__auto____6261
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$19(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }else {
      var x__2363__auto____6262 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6263 = cljs.core._invoke[goog.typeOf(x__2363__auto____6262)];
        if(or__3824__auto____6263) {
          return or__3824__auto____6263
        }else {
          var or__3824__auto____6264 = cljs.core._invoke["_"];
          if(or__3824__auto____6264) {
            return or__3824__auto____6264
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }
  };
  var _invoke__20 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t) {
    if(function() {
      var and__3822__auto____6265 = this$;
      if(and__3822__auto____6265) {
        return this$.cljs$core$IFn$_invoke$arity$20
      }else {
        return and__3822__auto____6265
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$20(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }else {
      var x__2363__auto____6266 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6267 = cljs.core._invoke[goog.typeOf(x__2363__auto____6266)];
        if(or__3824__auto____6267) {
          return or__3824__auto____6267
        }else {
          var or__3824__auto____6268 = cljs.core._invoke["_"];
          if(or__3824__auto____6268) {
            return or__3824__auto____6268
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }
  };
  var _invoke__21 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    if(function() {
      var and__3822__auto____6269 = this$;
      if(and__3822__auto____6269) {
        return this$.cljs$core$IFn$_invoke$arity$21
      }else {
        return and__3822__auto____6269
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$21(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }else {
      var x__2363__auto____6270 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6271 = cljs.core._invoke[goog.typeOf(x__2363__auto____6270)];
        if(or__3824__auto____6271) {
          return or__3824__auto____6271
        }else {
          var or__3824__auto____6272 = cljs.core._invoke["_"];
          if(or__3824__auto____6272) {
            return or__3824__auto____6272
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
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
    var and__3822__auto____6277 = coll;
    if(and__3822__auto____6277) {
      return coll.cljs$core$ICounted$_count$arity$1
    }else {
      return and__3822__auto____6277
    }
  }()) {
    return coll.cljs$core$ICounted$_count$arity$1(coll)
  }else {
    var x__2363__auto____6278 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6279 = cljs.core._count[goog.typeOf(x__2363__auto____6278)];
      if(or__3824__auto____6279) {
        return or__3824__auto____6279
      }else {
        var or__3824__auto____6280 = cljs.core._count["_"];
        if(or__3824__auto____6280) {
          return or__3824__auto____6280
        }else {
          throw cljs.core.missing_protocol.call(null, "ICounted.-count", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IEmptyableCollection = {};
cljs.core._empty = function _empty(coll) {
  if(function() {
    var and__3822__auto____6285 = coll;
    if(and__3822__auto____6285) {
      return coll.cljs$core$IEmptyableCollection$_empty$arity$1
    }else {
      return and__3822__auto____6285
    }
  }()) {
    return coll.cljs$core$IEmptyableCollection$_empty$arity$1(coll)
  }else {
    var x__2363__auto____6286 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6287 = cljs.core._empty[goog.typeOf(x__2363__auto____6286)];
      if(or__3824__auto____6287) {
        return or__3824__auto____6287
      }else {
        var or__3824__auto____6288 = cljs.core._empty["_"];
        if(or__3824__auto____6288) {
          return or__3824__auto____6288
        }else {
          throw cljs.core.missing_protocol.call(null, "IEmptyableCollection.-empty", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ICollection = {};
cljs.core._conj = function _conj(coll, o) {
  if(function() {
    var and__3822__auto____6293 = coll;
    if(and__3822__auto____6293) {
      return coll.cljs$core$ICollection$_conj$arity$2
    }else {
      return and__3822__auto____6293
    }
  }()) {
    return coll.cljs$core$ICollection$_conj$arity$2(coll, o)
  }else {
    var x__2363__auto____6294 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6295 = cljs.core._conj[goog.typeOf(x__2363__auto____6294)];
      if(or__3824__auto____6295) {
        return or__3824__auto____6295
      }else {
        var or__3824__auto____6296 = cljs.core._conj["_"];
        if(or__3824__auto____6296) {
          return or__3824__auto____6296
        }else {
          throw cljs.core.missing_protocol.call(null, "ICollection.-conj", coll);
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
      var and__3822__auto____6305 = coll;
      if(and__3822__auto____6305) {
        return coll.cljs$core$IIndexed$_nth$arity$2
      }else {
        return and__3822__auto____6305
      }
    }()) {
      return coll.cljs$core$IIndexed$_nth$arity$2(coll, n)
    }else {
      var x__2363__auto____6306 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____6307 = cljs.core._nth[goog.typeOf(x__2363__auto____6306)];
        if(or__3824__auto____6307) {
          return or__3824__auto____6307
        }else {
          var or__3824__auto____6308 = cljs.core._nth["_"];
          if(or__3824__auto____6308) {
            return or__3824__auto____6308
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n)
    }
  };
  var _nth__3 = function(coll, n, not_found) {
    if(function() {
      var and__3822__auto____6309 = coll;
      if(and__3822__auto____6309) {
        return coll.cljs$core$IIndexed$_nth$arity$3
      }else {
        return and__3822__auto____6309
      }
    }()) {
      return coll.cljs$core$IIndexed$_nth$arity$3(coll, n, not_found)
    }else {
      var x__2363__auto____6310 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____6311 = cljs.core._nth[goog.typeOf(x__2363__auto____6310)];
        if(or__3824__auto____6311) {
          return or__3824__auto____6311
        }else {
          var or__3824__auto____6312 = cljs.core._nth["_"];
          if(or__3824__auto____6312) {
            return or__3824__auto____6312
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
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
    var and__3822__auto____6317 = coll;
    if(and__3822__auto____6317) {
      return coll.cljs$core$ISeq$_first$arity$1
    }else {
      return and__3822__auto____6317
    }
  }()) {
    return coll.cljs$core$ISeq$_first$arity$1(coll)
  }else {
    var x__2363__auto____6318 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6319 = cljs.core._first[goog.typeOf(x__2363__auto____6318)];
      if(or__3824__auto____6319) {
        return or__3824__auto____6319
      }else {
        var or__3824__auto____6320 = cljs.core._first["_"];
        if(or__3824__auto____6320) {
          return or__3824__auto____6320
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._rest = function _rest(coll) {
  if(function() {
    var and__3822__auto____6325 = coll;
    if(and__3822__auto____6325) {
      return coll.cljs$core$ISeq$_rest$arity$1
    }else {
      return and__3822__auto____6325
    }
  }()) {
    return coll.cljs$core$ISeq$_rest$arity$1(coll)
  }else {
    var x__2363__auto____6326 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6327 = cljs.core._rest[goog.typeOf(x__2363__auto____6326)];
      if(or__3824__auto____6327) {
        return or__3824__auto____6327
      }else {
        var or__3824__auto____6328 = cljs.core._rest["_"];
        if(or__3824__auto____6328) {
          return or__3824__auto____6328
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-rest", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.INext = {};
cljs.core._next = function _next(coll) {
  if(function() {
    var and__3822__auto____6333 = coll;
    if(and__3822__auto____6333) {
      return coll.cljs$core$INext$_next$arity$1
    }else {
      return and__3822__auto____6333
    }
  }()) {
    return coll.cljs$core$INext$_next$arity$1(coll)
  }else {
    var x__2363__auto____6334 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6335 = cljs.core._next[goog.typeOf(x__2363__auto____6334)];
      if(or__3824__auto____6335) {
        return or__3824__auto____6335
      }else {
        var or__3824__auto____6336 = cljs.core._next["_"];
        if(or__3824__auto____6336) {
          return or__3824__auto____6336
        }else {
          throw cljs.core.missing_protocol.call(null, "INext.-next", coll);
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
      var and__3822__auto____6345 = o;
      if(and__3822__auto____6345) {
        return o.cljs$core$ILookup$_lookup$arity$2
      }else {
        return and__3822__auto____6345
      }
    }()) {
      return o.cljs$core$ILookup$_lookup$arity$2(o, k)
    }else {
      var x__2363__auto____6346 = o == null ? null : o;
      return function() {
        var or__3824__auto____6347 = cljs.core._lookup[goog.typeOf(x__2363__auto____6346)];
        if(or__3824__auto____6347) {
          return or__3824__auto____6347
        }else {
          var or__3824__auto____6348 = cljs.core._lookup["_"];
          if(or__3824__auto____6348) {
            return or__3824__auto____6348
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k)
    }
  };
  var _lookup__3 = function(o, k, not_found) {
    if(function() {
      var and__3822__auto____6349 = o;
      if(and__3822__auto____6349) {
        return o.cljs$core$ILookup$_lookup$arity$3
      }else {
        return and__3822__auto____6349
      }
    }()) {
      return o.cljs$core$ILookup$_lookup$arity$3(o, k, not_found)
    }else {
      var x__2363__auto____6350 = o == null ? null : o;
      return function() {
        var or__3824__auto____6351 = cljs.core._lookup[goog.typeOf(x__2363__auto____6350)];
        if(or__3824__auto____6351) {
          return or__3824__auto____6351
        }else {
          var or__3824__auto____6352 = cljs.core._lookup["_"];
          if(or__3824__auto____6352) {
            return or__3824__auto____6352
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
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
    var and__3822__auto____6357 = coll;
    if(and__3822__auto____6357) {
      return coll.cljs$core$IAssociative$_contains_key_QMARK_$arity$2
    }else {
      return and__3822__auto____6357
    }
  }()) {
    return coll.cljs$core$IAssociative$_contains_key_QMARK_$arity$2(coll, k)
  }else {
    var x__2363__auto____6358 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6359 = cljs.core._contains_key_QMARK_[goog.typeOf(x__2363__auto____6358)];
      if(or__3824__auto____6359) {
        return or__3824__auto____6359
      }else {
        var or__3824__auto____6360 = cljs.core._contains_key_QMARK_["_"];
        if(or__3824__auto____6360) {
          return or__3824__auto____6360
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-contains-key?", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core._assoc = function _assoc(coll, k, v) {
  if(function() {
    var and__3822__auto____6365 = coll;
    if(and__3822__auto____6365) {
      return coll.cljs$core$IAssociative$_assoc$arity$3
    }else {
      return and__3822__auto____6365
    }
  }()) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, k, v)
  }else {
    var x__2363__auto____6366 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6367 = cljs.core._assoc[goog.typeOf(x__2363__auto____6366)];
      if(or__3824__auto____6367) {
        return or__3824__auto____6367
      }else {
        var or__3824__auto____6368 = cljs.core._assoc["_"];
        if(or__3824__auto____6368) {
          return or__3824__auto____6368
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-assoc", coll);
        }
      }
    }().call(null, coll, k, v)
  }
};
cljs.core.IMap = {};
cljs.core._dissoc = function _dissoc(coll, k) {
  if(function() {
    var and__3822__auto____6373 = coll;
    if(and__3822__auto____6373) {
      return coll.cljs$core$IMap$_dissoc$arity$2
    }else {
      return and__3822__auto____6373
    }
  }()) {
    return coll.cljs$core$IMap$_dissoc$arity$2(coll, k)
  }else {
    var x__2363__auto____6374 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6375 = cljs.core._dissoc[goog.typeOf(x__2363__auto____6374)];
      if(or__3824__auto____6375) {
        return or__3824__auto____6375
      }else {
        var or__3824__auto____6376 = cljs.core._dissoc["_"];
        if(or__3824__auto____6376) {
          return or__3824__auto____6376
        }else {
          throw cljs.core.missing_protocol.call(null, "IMap.-dissoc", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core.IMapEntry = {};
cljs.core._key = function _key(coll) {
  if(function() {
    var and__3822__auto____6381 = coll;
    if(and__3822__auto____6381) {
      return coll.cljs$core$IMapEntry$_key$arity$1
    }else {
      return and__3822__auto____6381
    }
  }()) {
    return coll.cljs$core$IMapEntry$_key$arity$1(coll)
  }else {
    var x__2363__auto____6382 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6383 = cljs.core._key[goog.typeOf(x__2363__auto____6382)];
      if(or__3824__auto____6383) {
        return or__3824__auto____6383
      }else {
        var or__3824__auto____6384 = cljs.core._key["_"];
        if(or__3824__auto____6384) {
          return or__3824__auto____6384
        }else {
          throw cljs.core.missing_protocol.call(null, "IMapEntry.-key", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._val = function _val(coll) {
  if(function() {
    var and__3822__auto____6389 = coll;
    if(and__3822__auto____6389) {
      return coll.cljs$core$IMapEntry$_val$arity$1
    }else {
      return and__3822__auto____6389
    }
  }()) {
    return coll.cljs$core$IMapEntry$_val$arity$1(coll)
  }else {
    var x__2363__auto____6390 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6391 = cljs.core._val[goog.typeOf(x__2363__auto____6390)];
      if(or__3824__auto____6391) {
        return or__3824__auto____6391
      }else {
        var or__3824__auto____6392 = cljs.core._val["_"];
        if(or__3824__auto____6392) {
          return or__3824__auto____6392
        }else {
          throw cljs.core.missing_protocol.call(null, "IMapEntry.-val", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ISet = {};
cljs.core._disjoin = function _disjoin(coll, v) {
  if(function() {
    var and__3822__auto____6397 = coll;
    if(and__3822__auto____6397) {
      return coll.cljs$core$ISet$_disjoin$arity$2
    }else {
      return and__3822__auto____6397
    }
  }()) {
    return coll.cljs$core$ISet$_disjoin$arity$2(coll, v)
  }else {
    var x__2363__auto____6398 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6399 = cljs.core._disjoin[goog.typeOf(x__2363__auto____6398)];
      if(or__3824__auto____6399) {
        return or__3824__auto____6399
      }else {
        var or__3824__auto____6400 = cljs.core._disjoin["_"];
        if(or__3824__auto____6400) {
          return or__3824__auto____6400
        }else {
          throw cljs.core.missing_protocol.call(null, "ISet.-disjoin", coll);
        }
      }
    }().call(null, coll, v)
  }
};
cljs.core.IStack = {};
cljs.core._peek = function _peek(coll) {
  if(function() {
    var and__3822__auto____6405 = coll;
    if(and__3822__auto____6405) {
      return coll.cljs$core$IStack$_peek$arity$1
    }else {
      return and__3822__auto____6405
    }
  }()) {
    return coll.cljs$core$IStack$_peek$arity$1(coll)
  }else {
    var x__2363__auto____6406 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6407 = cljs.core._peek[goog.typeOf(x__2363__auto____6406)];
      if(or__3824__auto____6407) {
        return or__3824__auto____6407
      }else {
        var or__3824__auto____6408 = cljs.core._peek["_"];
        if(or__3824__auto____6408) {
          return or__3824__auto____6408
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-peek", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._pop = function _pop(coll) {
  if(function() {
    var and__3822__auto____6413 = coll;
    if(and__3822__auto____6413) {
      return coll.cljs$core$IStack$_pop$arity$1
    }else {
      return and__3822__auto____6413
    }
  }()) {
    return coll.cljs$core$IStack$_pop$arity$1(coll)
  }else {
    var x__2363__auto____6414 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6415 = cljs.core._pop[goog.typeOf(x__2363__auto____6414)];
      if(or__3824__auto____6415) {
        return or__3824__auto____6415
      }else {
        var or__3824__auto____6416 = cljs.core._pop["_"];
        if(or__3824__auto____6416) {
          return or__3824__auto____6416
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-pop", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IVector = {};
cljs.core._assoc_n = function _assoc_n(coll, n, val) {
  if(function() {
    var and__3822__auto____6421 = coll;
    if(and__3822__auto____6421) {
      return coll.cljs$core$IVector$_assoc_n$arity$3
    }else {
      return and__3822__auto____6421
    }
  }()) {
    return coll.cljs$core$IVector$_assoc_n$arity$3(coll, n, val)
  }else {
    var x__2363__auto____6422 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6423 = cljs.core._assoc_n[goog.typeOf(x__2363__auto____6422)];
      if(or__3824__auto____6423) {
        return or__3824__auto____6423
      }else {
        var or__3824__auto____6424 = cljs.core._assoc_n["_"];
        if(or__3824__auto____6424) {
          return or__3824__auto____6424
        }else {
          throw cljs.core.missing_protocol.call(null, "IVector.-assoc-n", coll);
        }
      }
    }().call(null, coll, n, val)
  }
};
cljs.core.IDeref = {};
cljs.core._deref = function _deref(o) {
  if(function() {
    var and__3822__auto____6429 = o;
    if(and__3822__auto____6429) {
      return o.cljs$core$IDeref$_deref$arity$1
    }else {
      return and__3822__auto____6429
    }
  }()) {
    return o.cljs$core$IDeref$_deref$arity$1(o)
  }else {
    var x__2363__auto____6430 = o == null ? null : o;
    return function() {
      var or__3824__auto____6431 = cljs.core._deref[goog.typeOf(x__2363__auto____6430)];
      if(or__3824__auto____6431) {
        return or__3824__auto____6431
      }else {
        var or__3824__auto____6432 = cljs.core._deref["_"];
        if(or__3824__auto____6432) {
          return or__3824__auto____6432
        }else {
          throw cljs.core.missing_protocol.call(null, "IDeref.-deref", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.IDerefWithTimeout = {};
cljs.core._deref_with_timeout = function _deref_with_timeout(o, msec, timeout_val) {
  if(function() {
    var and__3822__auto____6437 = o;
    if(and__3822__auto____6437) {
      return o.cljs$core$IDerefWithTimeout$_deref_with_timeout$arity$3
    }else {
      return and__3822__auto____6437
    }
  }()) {
    return o.cljs$core$IDerefWithTimeout$_deref_with_timeout$arity$3(o, msec, timeout_val)
  }else {
    var x__2363__auto____6438 = o == null ? null : o;
    return function() {
      var or__3824__auto____6439 = cljs.core._deref_with_timeout[goog.typeOf(x__2363__auto____6438)];
      if(or__3824__auto____6439) {
        return or__3824__auto____6439
      }else {
        var or__3824__auto____6440 = cljs.core._deref_with_timeout["_"];
        if(or__3824__auto____6440) {
          return or__3824__auto____6440
        }else {
          throw cljs.core.missing_protocol.call(null, "IDerefWithTimeout.-deref-with-timeout", o);
        }
      }
    }().call(null, o, msec, timeout_val)
  }
};
cljs.core.IMeta = {};
cljs.core._meta = function _meta(o) {
  if(function() {
    var and__3822__auto____6445 = o;
    if(and__3822__auto____6445) {
      return o.cljs$core$IMeta$_meta$arity$1
    }else {
      return and__3822__auto____6445
    }
  }()) {
    return o.cljs$core$IMeta$_meta$arity$1(o)
  }else {
    var x__2363__auto____6446 = o == null ? null : o;
    return function() {
      var or__3824__auto____6447 = cljs.core._meta[goog.typeOf(x__2363__auto____6446)];
      if(or__3824__auto____6447) {
        return or__3824__auto____6447
      }else {
        var or__3824__auto____6448 = cljs.core._meta["_"];
        if(or__3824__auto____6448) {
          return or__3824__auto____6448
        }else {
          throw cljs.core.missing_protocol.call(null, "IMeta.-meta", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.IWithMeta = {};
cljs.core._with_meta = function _with_meta(o, meta) {
  if(function() {
    var and__3822__auto____6453 = o;
    if(and__3822__auto____6453) {
      return o.cljs$core$IWithMeta$_with_meta$arity$2
    }else {
      return and__3822__auto____6453
    }
  }()) {
    return o.cljs$core$IWithMeta$_with_meta$arity$2(o, meta)
  }else {
    var x__2363__auto____6454 = o == null ? null : o;
    return function() {
      var or__3824__auto____6455 = cljs.core._with_meta[goog.typeOf(x__2363__auto____6454)];
      if(or__3824__auto____6455) {
        return or__3824__auto____6455
      }else {
        var or__3824__auto____6456 = cljs.core._with_meta["_"];
        if(or__3824__auto____6456) {
          return or__3824__auto____6456
        }else {
          throw cljs.core.missing_protocol.call(null, "IWithMeta.-with-meta", o);
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
      var and__3822__auto____6465 = coll;
      if(and__3822__auto____6465) {
        return coll.cljs$core$IReduce$_reduce$arity$2
      }else {
        return and__3822__auto____6465
      }
    }()) {
      return coll.cljs$core$IReduce$_reduce$arity$2(coll, f)
    }else {
      var x__2363__auto____6466 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____6467 = cljs.core._reduce[goog.typeOf(x__2363__auto____6466)];
        if(or__3824__auto____6467) {
          return or__3824__auto____6467
        }else {
          var or__3824__auto____6468 = cljs.core._reduce["_"];
          if(or__3824__auto____6468) {
            return or__3824__auto____6468
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f)
    }
  };
  var _reduce__3 = function(coll, f, start) {
    if(function() {
      var and__3822__auto____6469 = coll;
      if(and__3822__auto____6469) {
        return coll.cljs$core$IReduce$_reduce$arity$3
      }else {
        return and__3822__auto____6469
      }
    }()) {
      return coll.cljs$core$IReduce$_reduce$arity$3(coll, f, start)
    }else {
      var x__2363__auto____6470 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____6471 = cljs.core._reduce[goog.typeOf(x__2363__auto____6470)];
        if(or__3824__auto____6471) {
          return or__3824__auto____6471
        }else {
          var or__3824__auto____6472 = cljs.core._reduce["_"];
          if(or__3824__auto____6472) {
            return or__3824__auto____6472
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
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
    var and__3822__auto____6477 = coll;
    if(and__3822__auto____6477) {
      return coll.cljs$core$IKVReduce$_kv_reduce$arity$3
    }else {
      return and__3822__auto____6477
    }
  }()) {
    return coll.cljs$core$IKVReduce$_kv_reduce$arity$3(coll, f, init)
  }else {
    var x__2363__auto____6478 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6479 = cljs.core._kv_reduce[goog.typeOf(x__2363__auto____6478)];
      if(or__3824__auto____6479) {
        return or__3824__auto____6479
      }else {
        var or__3824__auto____6480 = cljs.core._kv_reduce["_"];
        if(or__3824__auto____6480) {
          return or__3824__auto____6480
        }else {
          throw cljs.core.missing_protocol.call(null, "IKVReduce.-kv-reduce", coll);
        }
      }
    }().call(null, coll, f, init)
  }
};
cljs.core.IEquiv = {};
cljs.core._equiv = function _equiv(o, other) {
  if(function() {
    var and__3822__auto____6485 = o;
    if(and__3822__auto____6485) {
      return o.cljs$core$IEquiv$_equiv$arity$2
    }else {
      return and__3822__auto____6485
    }
  }()) {
    return o.cljs$core$IEquiv$_equiv$arity$2(o, other)
  }else {
    var x__2363__auto____6486 = o == null ? null : o;
    return function() {
      var or__3824__auto____6487 = cljs.core._equiv[goog.typeOf(x__2363__auto____6486)];
      if(or__3824__auto____6487) {
        return or__3824__auto____6487
      }else {
        var or__3824__auto____6488 = cljs.core._equiv["_"];
        if(or__3824__auto____6488) {
          return or__3824__auto____6488
        }else {
          throw cljs.core.missing_protocol.call(null, "IEquiv.-equiv", o);
        }
      }
    }().call(null, o, other)
  }
};
cljs.core.IHash = {};
cljs.core._hash = function _hash(o) {
  if(function() {
    var and__3822__auto____6493 = o;
    if(and__3822__auto____6493) {
      return o.cljs$core$IHash$_hash$arity$1
    }else {
      return and__3822__auto____6493
    }
  }()) {
    return o.cljs$core$IHash$_hash$arity$1(o)
  }else {
    var x__2363__auto____6494 = o == null ? null : o;
    return function() {
      var or__3824__auto____6495 = cljs.core._hash[goog.typeOf(x__2363__auto____6494)];
      if(or__3824__auto____6495) {
        return or__3824__auto____6495
      }else {
        var or__3824__auto____6496 = cljs.core._hash["_"];
        if(or__3824__auto____6496) {
          return or__3824__auto____6496
        }else {
          throw cljs.core.missing_protocol.call(null, "IHash.-hash", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.ISeqable = {};
cljs.core._seq = function _seq(o) {
  if(function() {
    var and__3822__auto____6501 = o;
    if(and__3822__auto____6501) {
      return o.cljs$core$ISeqable$_seq$arity$1
    }else {
      return and__3822__auto____6501
    }
  }()) {
    return o.cljs$core$ISeqable$_seq$arity$1(o)
  }else {
    var x__2363__auto____6502 = o == null ? null : o;
    return function() {
      var or__3824__auto____6503 = cljs.core._seq[goog.typeOf(x__2363__auto____6502)];
      if(or__3824__auto____6503) {
        return or__3824__auto____6503
      }else {
        var or__3824__auto____6504 = cljs.core._seq["_"];
        if(or__3824__auto____6504) {
          return or__3824__auto____6504
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeqable.-seq", o);
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
    var and__3822__auto____6509 = coll;
    if(and__3822__auto____6509) {
      return coll.cljs$core$IReversible$_rseq$arity$1
    }else {
      return and__3822__auto____6509
    }
  }()) {
    return coll.cljs$core$IReversible$_rseq$arity$1(coll)
  }else {
    var x__2363__auto____6510 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6511 = cljs.core._rseq[goog.typeOf(x__2363__auto____6510)];
      if(or__3824__auto____6511) {
        return or__3824__auto____6511
      }else {
        var or__3824__auto____6512 = cljs.core._rseq["_"];
        if(or__3824__auto____6512) {
          return or__3824__auto____6512
        }else {
          throw cljs.core.missing_protocol.call(null, "IReversible.-rseq", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ISorted = {};
cljs.core._sorted_seq = function _sorted_seq(coll, ascending_QMARK_) {
  if(function() {
    var and__3822__auto____6517 = coll;
    if(and__3822__auto____6517) {
      return coll.cljs$core$ISorted$_sorted_seq$arity$2
    }else {
      return and__3822__auto____6517
    }
  }()) {
    return coll.cljs$core$ISorted$_sorted_seq$arity$2(coll, ascending_QMARK_)
  }else {
    var x__2363__auto____6518 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6519 = cljs.core._sorted_seq[goog.typeOf(x__2363__auto____6518)];
      if(or__3824__auto____6519) {
        return or__3824__auto____6519
      }else {
        var or__3824__auto____6520 = cljs.core._sorted_seq["_"];
        if(or__3824__auto____6520) {
          return or__3824__auto____6520
        }else {
          throw cljs.core.missing_protocol.call(null, "ISorted.-sorted-seq", coll);
        }
      }
    }().call(null, coll, ascending_QMARK_)
  }
};
cljs.core._sorted_seq_from = function _sorted_seq_from(coll, k, ascending_QMARK_) {
  if(function() {
    var and__3822__auto____6525 = coll;
    if(and__3822__auto____6525) {
      return coll.cljs$core$ISorted$_sorted_seq_from$arity$3
    }else {
      return and__3822__auto____6525
    }
  }()) {
    return coll.cljs$core$ISorted$_sorted_seq_from$arity$3(coll, k, ascending_QMARK_)
  }else {
    var x__2363__auto____6526 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6527 = cljs.core._sorted_seq_from[goog.typeOf(x__2363__auto____6526)];
      if(or__3824__auto____6527) {
        return or__3824__auto____6527
      }else {
        var or__3824__auto____6528 = cljs.core._sorted_seq_from["_"];
        if(or__3824__auto____6528) {
          return or__3824__auto____6528
        }else {
          throw cljs.core.missing_protocol.call(null, "ISorted.-sorted-seq-from", coll);
        }
      }
    }().call(null, coll, k, ascending_QMARK_)
  }
};
cljs.core._entry_key = function _entry_key(coll, entry) {
  if(function() {
    var and__3822__auto____6533 = coll;
    if(and__3822__auto____6533) {
      return coll.cljs$core$ISorted$_entry_key$arity$2
    }else {
      return and__3822__auto____6533
    }
  }()) {
    return coll.cljs$core$ISorted$_entry_key$arity$2(coll, entry)
  }else {
    var x__2363__auto____6534 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6535 = cljs.core._entry_key[goog.typeOf(x__2363__auto____6534)];
      if(or__3824__auto____6535) {
        return or__3824__auto____6535
      }else {
        var or__3824__auto____6536 = cljs.core._entry_key["_"];
        if(or__3824__auto____6536) {
          return or__3824__auto____6536
        }else {
          throw cljs.core.missing_protocol.call(null, "ISorted.-entry-key", coll);
        }
      }
    }().call(null, coll, entry)
  }
};
cljs.core._comparator = function _comparator(coll) {
  if(function() {
    var and__3822__auto____6541 = coll;
    if(and__3822__auto____6541) {
      return coll.cljs$core$ISorted$_comparator$arity$1
    }else {
      return and__3822__auto____6541
    }
  }()) {
    return coll.cljs$core$ISorted$_comparator$arity$1(coll)
  }else {
    var x__2363__auto____6542 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6543 = cljs.core._comparator[goog.typeOf(x__2363__auto____6542)];
      if(or__3824__auto____6543) {
        return or__3824__auto____6543
      }else {
        var or__3824__auto____6544 = cljs.core._comparator["_"];
        if(or__3824__auto____6544) {
          return or__3824__auto____6544
        }else {
          throw cljs.core.missing_protocol.call(null, "ISorted.-comparator", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IPrintable = {};
cljs.core._pr_seq = function _pr_seq(o, opts) {
  if(function() {
    var and__3822__auto____6549 = o;
    if(and__3822__auto____6549) {
      return o.cljs$core$IPrintable$_pr_seq$arity$2
    }else {
      return and__3822__auto____6549
    }
  }()) {
    return o.cljs$core$IPrintable$_pr_seq$arity$2(o, opts)
  }else {
    var x__2363__auto____6550 = o == null ? null : o;
    return function() {
      var or__3824__auto____6551 = cljs.core._pr_seq[goog.typeOf(x__2363__auto____6550)];
      if(or__3824__auto____6551) {
        return or__3824__auto____6551
      }else {
        var or__3824__auto____6552 = cljs.core._pr_seq["_"];
        if(or__3824__auto____6552) {
          return or__3824__auto____6552
        }else {
          throw cljs.core.missing_protocol.call(null, "IPrintable.-pr-seq", o);
        }
      }
    }().call(null, o, opts)
  }
};
cljs.core.IPending = {};
cljs.core._realized_QMARK_ = function _realized_QMARK_(d) {
  if(function() {
    var and__3822__auto____6557 = d;
    if(and__3822__auto____6557) {
      return d.cljs$core$IPending$_realized_QMARK_$arity$1
    }else {
      return and__3822__auto____6557
    }
  }()) {
    return d.cljs$core$IPending$_realized_QMARK_$arity$1(d)
  }else {
    var x__2363__auto____6558 = d == null ? null : d;
    return function() {
      var or__3824__auto____6559 = cljs.core._realized_QMARK_[goog.typeOf(x__2363__auto____6558)];
      if(or__3824__auto____6559) {
        return or__3824__auto____6559
      }else {
        var or__3824__auto____6560 = cljs.core._realized_QMARK_["_"];
        if(or__3824__auto____6560) {
          return or__3824__auto____6560
        }else {
          throw cljs.core.missing_protocol.call(null, "IPending.-realized?", d);
        }
      }
    }().call(null, d)
  }
};
cljs.core.IWatchable = {};
cljs.core._notify_watches = function _notify_watches(this$, oldval, newval) {
  if(function() {
    var and__3822__auto____6565 = this$;
    if(and__3822__auto____6565) {
      return this$.cljs$core$IWatchable$_notify_watches$arity$3
    }else {
      return and__3822__auto____6565
    }
  }()) {
    return this$.cljs$core$IWatchable$_notify_watches$arity$3(this$, oldval, newval)
  }else {
    var x__2363__auto____6566 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____6567 = cljs.core._notify_watches[goog.typeOf(x__2363__auto____6566)];
      if(or__3824__auto____6567) {
        return or__3824__auto____6567
      }else {
        var or__3824__auto____6568 = cljs.core._notify_watches["_"];
        if(or__3824__auto____6568) {
          return or__3824__auto____6568
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-notify-watches", this$);
        }
      }
    }().call(null, this$, oldval, newval)
  }
};
cljs.core._add_watch = function _add_watch(this$, key, f) {
  if(function() {
    var and__3822__auto____6573 = this$;
    if(and__3822__auto____6573) {
      return this$.cljs$core$IWatchable$_add_watch$arity$3
    }else {
      return and__3822__auto____6573
    }
  }()) {
    return this$.cljs$core$IWatchable$_add_watch$arity$3(this$, key, f)
  }else {
    var x__2363__auto____6574 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____6575 = cljs.core._add_watch[goog.typeOf(x__2363__auto____6574)];
      if(or__3824__auto____6575) {
        return or__3824__auto____6575
      }else {
        var or__3824__auto____6576 = cljs.core._add_watch["_"];
        if(or__3824__auto____6576) {
          return or__3824__auto____6576
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-add-watch", this$);
        }
      }
    }().call(null, this$, key, f)
  }
};
cljs.core._remove_watch = function _remove_watch(this$, key) {
  if(function() {
    var and__3822__auto____6581 = this$;
    if(and__3822__auto____6581) {
      return this$.cljs$core$IWatchable$_remove_watch$arity$2
    }else {
      return and__3822__auto____6581
    }
  }()) {
    return this$.cljs$core$IWatchable$_remove_watch$arity$2(this$, key)
  }else {
    var x__2363__auto____6582 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____6583 = cljs.core._remove_watch[goog.typeOf(x__2363__auto____6582)];
      if(or__3824__auto____6583) {
        return or__3824__auto____6583
      }else {
        var or__3824__auto____6584 = cljs.core._remove_watch["_"];
        if(or__3824__auto____6584) {
          return or__3824__auto____6584
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-remove-watch", this$);
        }
      }
    }().call(null, this$, key)
  }
};
cljs.core.IEditableCollection = {};
cljs.core._as_transient = function _as_transient(coll) {
  if(function() {
    var and__3822__auto____6589 = coll;
    if(and__3822__auto____6589) {
      return coll.cljs$core$IEditableCollection$_as_transient$arity$1
    }else {
      return and__3822__auto____6589
    }
  }()) {
    return coll.cljs$core$IEditableCollection$_as_transient$arity$1(coll)
  }else {
    var x__2363__auto____6590 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6591 = cljs.core._as_transient[goog.typeOf(x__2363__auto____6590)];
      if(or__3824__auto____6591) {
        return or__3824__auto____6591
      }else {
        var or__3824__auto____6592 = cljs.core._as_transient["_"];
        if(or__3824__auto____6592) {
          return or__3824__auto____6592
        }else {
          throw cljs.core.missing_protocol.call(null, "IEditableCollection.-as-transient", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ITransientCollection = {};
cljs.core._conj_BANG_ = function _conj_BANG_(tcoll, val) {
  if(function() {
    var and__3822__auto____6597 = tcoll;
    if(and__3822__auto____6597) {
      return tcoll.cljs$core$ITransientCollection$_conj_BANG_$arity$2
    }else {
      return and__3822__auto____6597
    }
  }()) {
    return tcoll.cljs$core$ITransientCollection$_conj_BANG_$arity$2(tcoll, val)
  }else {
    var x__2363__auto____6598 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____6599 = cljs.core._conj_BANG_[goog.typeOf(x__2363__auto____6598)];
      if(or__3824__auto____6599) {
        return or__3824__auto____6599
      }else {
        var or__3824__auto____6600 = cljs.core._conj_BANG_["_"];
        if(or__3824__auto____6600) {
          return or__3824__auto____6600
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientCollection.-conj!", tcoll);
        }
      }
    }().call(null, tcoll, val)
  }
};
cljs.core._persistent_BANG_ = function _persistent_BANG_(tcoll) {
  if(function() {
    var and__3822__auto____6605 = tcoll;
    if(and__3822__auto____6605) {
      return tcoll.cljs$core$ITransientCollection$_persistent_BANG_$arity$1
    }else {
      return and__3822__auto____6605
    }
  }()) {
    return tcoll.cljs$core$ITransientCollection$_persistent_BANG_$arity$1(tcoll)
  }else {
    var x__2363__auto____6606 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____6607 = cljs.core._persistent_BANG_[goog.typeOf(x__2363__auto____6606)];
      if(or__3824__auto____6607) {
        return or__3824__auto____6607
      }else {
        var or__3824__auto____6608 = cljs.core._persistent_BANG_["_"];
        if(or__3824__auto____6608) {
          return or__3824__auto____6608
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientCollection.-persistent!", tcoll);
        }
      }
    }().call(null, tcoll)
  }
};
cljs.core.ITransientAssociative = {};
cljs.core._assoc_BANG_ = function _assoc_BANG_(tcoll, key, val) {
  if(function() {
    var and__3822__auto____6613 = tcoll;
    if(and__3822__auto____6613) {
      return tcoll.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3
    }else {
      return and__3822__auto____6613
    }
  }()) {
    return tcoll.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3(tcoll, key, val)
  }else {
    var x__2363__auto____6614 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____6615 = cljs.core._assoc_BANG_[goog.typeOf(x__2363__auto____6614)];
      if(or__3824__auto____6615) {
        return or__3824__auto____6615
      }else {
        var or__3824__auto____6616 = cljs.core._assoc_BANG_["_"];
        if(or__3824__auto____6616) {
          return or__3824__auto____6616
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientAssociative.-assoc!", tcoll);
        }
      }
    }().call(null, tcoll, key, val)
  }
};
cljs.core.ITransientMap = {};
cljs.core._dissoc_BANG_ = function _dissoc_BANG_(tcoll, key) {
  if(function() {
    var and__3822__auto____6621 = tcoll;
    if(and__3822__auto____6621) {
      return tcoll.cljs$core$ITransientMap$_dissoc_BANG_$arity$2
    }else {
      return and__3822__auto____6621
    }
  }()) {
    return tcoll.cljs$core$ITransientMap$_dissoc_BANG_$arity$2(tcoll, key)
  }else {
    var x__2363__auto____6622 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____6623 = cljs.core._dissoc_BANG_[goog.typeOf(x__2363__auto____6622)];
      if(or__3824__auto____6623) {
        return or__3824__auto____6623
      }else {
        var or__3824__auto____6624 = cljs.core._dissoc_BANG_["_"];
        if(or__3824__auto____6624) {
          return or__3824__auto____6624
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientMap.-dissoc!", tcoll);
        }
      }
    }().call(null, tcoll, key)
  }
};
cljs.core.ITransientVector = {};
cljs.core._assoc_n_BANG_ = function _assoc_n_BANG_(tcoll, n, val) {
  if(function() {
    var and__3822__auto____6629 = tcoll;
    if(and__3822__auto____6629) {
      return tcoll.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3
    }else {
      return and__3822__auto____6629
    }
  }()) {
    return tcoll.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3(tcoll, n, val)
  }else {
    var x__2363__auto____6630 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____6631 = cljs.core._assoc_n_BANG_[goog.typeOf(x__2363__auto____6630)];
      if(or__3824__auto____6631) {
        return or__3824__auto____6631
      }else {
        var or__3824__auto____6632 = cljs.core._assoc_n_BANG_["_"];
        if(or__3824__auto____6632) {
          return or__3824__auto____6632
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientVector.-assoc-n!", tcoll);
        }
      }
    }().call(null, tcoll, n, val)
  }
};
cljs.core._pop_BANG_ = function _pop_BANG_(tcoll) {
  if(function() {
    var and__3822__auto____6637 = tcoll;
    if(and__3822__auto____6637) {
      return tcoll.cljs$core$ITransientVector$_pop_BANG_$arity$1
    }else {
      return and__3822__auto____6637
    }
  }()) {
    return tcoll.cljs$core$ITransientVector$_pop_BANG_$arity$1(tcoll)
  }else {
    var x__2363__auto____6638 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____6639 = cljs.core._pop_BANG_[goog.typeOf(x__2363__auto____6638)];
      if(or__3824__auto____6639) {
        return or__3824__auto____6639
      }else {
        var or__3824__auto____6640 = cljs.core._pop_BANG_["_"];
        if(or__3824__auto____6640) {
          return or__3824__auto____6640
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientVector.-pop!", tcoll);
        }
      }
    }().call(null, tcoll)
  }
};
cljs.core.ITransientSet = {};
cljs.core._disjoin_BANG_ = function _disjoin_BANG_(tcoll, v) {
  if(function() {
    var and__3822__auto____6645 = tcoll;
    if(and__3822__auto____6645) {
      return tcoll.cljs$core$ITransientSet$_disjoin_BANG_$arity$2
    }else {
      return and__3822__auto____6645
    }
  }()) {
    return tcoll.cljs$core$ITransientSet$_disjoin_BANG_$arity$2(tcoll, v)
  }else {
    var x__2363__auto____6646 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____6647 = cljs.core._disjoin_BANG_[goog.typeOf(x__2363__auto____6646)];
      if(or__3824__auto____6647) {
        return or__3824__auto____6647
      }else {
        var or__3824__auto____6648 = cljs.core._disjoin_BANG_["_"];
        if(or__3824__auto____6648) {
          return or__3824__auto____6648
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientSet.-disjoin!", tcoll);
        }
      }
    }().call(null, tcoll, v)
  }
};
cljs.core.IComparable = {};
cljs.core._compare = function _compare(x, y) {
  if(function() {
    var and__3822__auto____6653 = x;
    if(and__3822__auto____6653) {
      return x.cljs$core$IComparable$_compare$arity$2
    }else {
      return and__3822__auto____6653
    }
  }()) {
    return x.cljs$core$IComparable$_compare$arity$2(x, y)
  }else {
    var x__2363__auto____6654 = x == null ? null : x;
    return function() {
      var or__3824__auto____6655 = cljs.core._compare[goog.typeOf(x__2363__auto____6654)];
      if(or__3824__auto____6655) {
        return or__3824__auto____6655
      }else {
        var or__3824__auto____6656 = cljs.core._compare["_"];
        if(or__3824__auto____6656) {
          return or__3824__auto____6656
        }else {
          throw cljs.core.missing_protocol.call(null, "IComparable.-compare", x);
        }
      }
    }().call(null, x, y)
  }
};
cljs.core.IChunk = {};
cljs.core._drop_first = function _drop_first(coll) {
  if(function() {
    var and__3822__auto____6661 = coll;
    if(and__3822__auto____6661) {
      return coll.cljs$core$IChunk$_drop_first$arity$1
    }else {
      return and__3822__auto____6661
    }
  }()) {
    return coll.cljs$core$IChunk$_drop_first$arity$1(coll)
  }else {
    var x__2363__auto____6662 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6663 = cljs.core._drop_first[goog.typeOf(x__2363__auto____6662)];
      if(or__3824__auto____6663) {
        return or__3824__auto____6663
      }else {
        var or__3824__auto____6664 = cljs.core._drop_first["_"];
        if(or__3824__auto____6664) {
          return or__3824__auto____6664
        }else {
          throw cljs.core.missing_protocol.call(null, "IChunk.-drop-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IChunkedSeq = {};
cljs.core._chunked_first = function _chunked_first(coll) {
  if(function() {
    var and__3822__auto____6669 = coll;
    if(and__3822__auto____6669) {
      return coll.cljs$core$IChunkedSeq$_chunked_first$arity$1
    }else {
      return and__3822__auto____6669
    }
  }()) {
    return coll.cljs$core$IChunkedSeq$_chunked_first$arity$1(coll)
  }else {
    var x__2363__auto____6670 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6671 = cljs.core._chunked_first[goog.typeOf(x__2363__auto____6670)];
      if(or__3824__auto____6671) {
        return or__3824__auto____6671
      }else {
        var or__3824__auto____6672 = cljs.core._chunked_first["_"];
        if(or__3824__auto____6672) {
          return or__3824__auto____6672
        }else {
          throw cljs.core.missing_protocol.call(null, "IChunkedSeq.-chunked-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._chunked_rest = function _chunked_rest(coll) {
  if(function() {
    var and__3822__auto____6677 = coll;
    if(and__3822__auto____6677) {
      return coll.cljs$core$IChunkedSeq$_chunked_rest$arity$1
    }else {
      return and__3822__auto____6677
    }
  }()) {
    return coll.cljs$core$IChunkedSeq$_chunked_rest$arity$1(coll)
  }else {
    var x__2363__auto____6678 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6679 = cljs.core._chunked_rest[goog.typeOf(x__2363__auto____6678)];
      if(or__3824__auto____6679) {
        return or__3824__auto____6679
      }else {
        var or__3824__auto____6680 = cljs.core._chunked_rest["_"];
        if(or__3824__auto____6680) {
          return or__3824__auto____6680
        }else {
          throw cljs.core.missing_protocol.call(null, "IChunkedSeq.-chunked-rest", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IChunkedNext = {};
cljs.core._chunked_next = function _chunked_next(coll) {
  if(function() {
    var and__3822__auto____6685 = coll;
    if(and__3822__auto____6685) {
      return coll.cljs$core$IChunkedNext$_chunked_next$arity$1
    }else {
      return and__3822__auto____6685
    }
  }()) {
    return coll.cljs$core$IChunkedNext$_chunked_next$arity$1(coll)
  }else {
    var x__2363__auto____6686 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6687 = cljs.core._chunked_next[goog.typeOf(x__2363__auto____6686)];
      if(or__3824__auto____6687) {
        return or__3824__auto____6687
      }else {
        var or__3824__auto____6688 = cljs.core._chunked_next["_"];
        if(or__3824__auto____6688) {
          return or__3824__auto____6688
        }else {
          throw cljs.core.missing_protocol.call(null, "IChunkedNext.-chunked-next", coll);
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
    var or__3824__auto____6690 = x === y;
    if(or__3824__auto____6690) {
      return or__3824__auto____6690
    }else {
      return cljs.core._equiv.call(null, x, y)
    }
  };
  var _EQ___3 = function() {
    var G__6691__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ_.call(null, x, y))) {
          if(cljs.core.next.call(null, more)) {
            var G__6692 = y;
            var G__6693 = cljs.core.first.call(null, more);
            var G__6694 = cljs.core.next.call(null, more);
            x = G__6692;
            y = G__6693;
            more = G__6694;
            continue
          }else {
            return _EQ_.call(null, y, cljs.core.first.call(null, more))
          }
        }else {
          return false
        }
        break
      }
    };
    var G__6691 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__6691__delegate.call(this, x, y, more)
    };
    G__6691.cljs$lang$maxFixedArity = 2;
    G__6691.cljs$lang$applyTo = function(arglist__6695) {
      var x = cljs.core.first(arglist__6695);
      var y = cljs.core.first(cljs.core.next(arglist__6695));
      var more = cljs.core.rest(cljs.core.next(arglist__6695));
      return G__6691__delegate(x, y, more)
    };
    G__6691.cljs$lang$arity$variadic = G__6691__delegate;
    return G__6691
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
  var G__6696 = null;
  var G__6696__2 = function(o, k) {
    return null
  };
  var G__6696__3 = function(o, k, not_found) {
    return not_found
  };
  G__6696 = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6696__2.call(this, o, k);
      case 3:
        return G__6696__3.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6696
}();
cljs.core.IAssociative["null"] = true;
cljs.core._assoc["null"] = function(_, k, v) {
  return cljs.core.hash_map.call(null, k, v)
};
cljs.core.INext["null"] = true;
cljs.core._next["null"] = function(_) {
  return null
};
cljs.core.ICollection["null"] = true;
cljs.core._conj["null"] = function(_, o) {
  return cljs.core.list.call(null, o)
};
cljs.core.IReduce["null"] = true;
cljs.core._reduce["null"] = function() {
  var G__6697 = null;
  var G__6697__2 = function(_, f) {
    return f.call(null)
  };
  var G__6697__3 = function(_, f, start) {
    return start
  };
  G__6697 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__6697__2.call(this, _, f);
      case 3:
        return G__6697__3.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6697
}();
cljs.core.IPrintable["null"] = true;
cljs.core._pr_seq["null"] = function(o) {
  return cljs.core.list.call(null, "nil")
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
  return cljs.core.list.call(null)
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
  var G__6698 = null;
  var G__6698__2 = function(_, n) {
    return null
  };
  var G__6698__3 = function(_, n, not_found) {
    return not_found
  };
  G__6698 = function(_, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6698__2.call(this, _, n);
      case 3:
        return G__6698__3.call(this, _, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6698
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
  var and__3822__auto____6699 = cljs.core.instance_QMARK_.call(null, Date, other);
  if(and__3822__auto____6699) {
    return o.toString() === other.toString()
  }else {
    return and__3822__auto____6699
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
    var cnt__6712 = cljs.core._count.call(null, cicoll);
    if(cnt__6712 === 0) {
      return f.call(null)
    }else {
      var val__6713 = cljs.core._nth.call(null, cicoll, 0);
      var n__6714 = 1;
      while(true) {
        if(n__6714 < cnt__6712) {
          var nval__6715 = f.call(null, val__6713, cljs.core._nth.call(null, cicoll, n__6714));
          if(cljs.core.reduced_QMARK_.call(null, nval__6715)) {
            return cljs.core.deref.call(null, nval__6715)
          }else {
            var G__6724 = nval__6715;
            var G__6725 = n__6714 + 1;
            val__6713 = G__6724;
            n__6714 = G__6725;
            continue
          }
        }else {
          return val__6713
        }
        break
      }
    }
  };
  var ci_reduce__3 = function(cicoll, f, val) {
    var cnt__6716 = cljs.core._count.call(null, cicoll);
    var val__6717 = val;
    var n__6718 = 0;
    while(true) {
      if(n__6718 < cnt__6716) {
        var nval__6719 = f.call(null, val__6717, cljs.core._nth.call(null, cicoll, n__6718));
        if(cljs.core.reduced_QMARK_.call(null, nval__6719)) {
          return cljs.core.deref.call(null, nval__6719)
        }else {
          var G__6726 = nval__6719;
          var G__6727 = n__6718 + 1;
          val__6717 = G__6726;
          n__6718 = G__6727;
          continue
        }
      }else {
        return val__6717
      }
      break
    }
  };
  var ci_reduce__4 = function(cicoll, f, val, idx) {
    var cnt__6720 = cljs.core._count.call(null, cicoll);
    var val__6721 = val;
    var n__6722 = idx;
    while(true) {
      if(n__6722 < cnt__6720) {
        var nval__6723 = f.call(null, val__6721, cljs.core._nth.call(null, cicoll, n__6722));
        if(cljs.core.reduced_QMARK_.call(null, nval__6723)) {
          return cljs.core.deref.call(null, nval__6723)
        }else {
          var G__6728 = nval__6723;
          var G__6729 = n__6722 + 1;
          val__6721 = G__6728;
          n__6722 = G__6729;
          continue
        }
      }else {
        return val__6721
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
    var cnt__6742 = arr.length;
    if(arr.length === 0) {
      return f.call(null)
    }else {
      var val__6743 = arr[0];
      var n__6744 = 1;
      while(true) {
        if(n__6744 < cnt__6742) {
          var nval__6745 = f.call(null, val__6743, arr[n__6744]);
          if(cljs.core.reduced_QMARK_.call(null, nval__6745)) {
            return cljs.core.deref.call(null, nval__6745)
          }else {
            var G__6754 = nval__6745;
            var G__6755 = n__6744 + 1;
            val__6743 = G__6754;
            n__6744 = G__6755;
            continue
          }
        }else {
          return val__6743
        }
        break
      }
    }
  };
  var array_reduce__3 = function(arr, f, val) {
    var cnt__6746 = arr.length;
    var val__6747 = val;
    var n__6748 = 0;
    while(true) {
      if(n__6748 < cnt__6746) {
        var nval__6749 = f.call(null, val__6747, arr[n__6748]);
        if(cljs.core.reduced_QMARK_.call(null, nval__6749)) {
          return cljs.core.deref.call(null, nval__6749)
        }else {
          var G__6756 = nval__6749;
          var G__6757 = n__6748 + 1;
          val__6747 = G__6756;
          n__6748 = G__6757;
          continue
        }
      }else {
        return val__6747
      }
      break
    }
  };
  var array_reduce__4 = function(arr, f, val, idx) {
    var cnt__6750 = arr.length;
    var val__6751 = val;
    var n__6752 = idx;
    while(true) {
      if(n__6752 < cnt__6750) {
        var nval__6753 = f.call(null, val__6751, arr[n__6752]);
        if(cljs.core.reduced_QMARK_.call(null, nval__6753)) {
          return cljs.core.deref.call(null, nval__6753)
        }else {
          var G__6758 = nval__6753;
          var G__6759 = n__6752 + 1;
          val__6751 = G__6758;
          n__6752 = G__6759;
          continue
        }
      }else {
        return val__6751
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
  return cljs.core.list.call(null, "cljs.core/IndexedSeq")
};
cljs.core.IndexedSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__6760 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$INext$_next$arity$1 = function(_) {
  var this__6761 = this;
  if(this__6761.i + 1 < this__6761.a.length) {
    return new cljs.core.IndexedSeq(this__6761.a, this__6761.i + 1)
  }else {
    return null
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__6762 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__6763 = this;
  var c__6764 = coll.cljs$core$ICounted$_count$arity$1(coll);
  if(c__6764 > 0) {
    return new cljs.core.RSeq(coll, c__6764 - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.IndexedSeq.prototype.toString = function() {
  var this__6765 = this;
  var this__6766 = this;
  return cljs.core.pr_str.call(null, this__6766)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce$arity$2 = function(coll, f) {
  var this__6767 = this;
  if(cljs.core.counted_QMARK_.call(null, this__6767.a)) {
    return cljs.core.ci_reduce.call(null, this__6767.a, f, this__6767.a[this__6767.i], this__6767.i + 1)
  }else {
    return cljs.core.ci_reduce.call(null, coll, f, this__6767.a[this__6767.i], 0)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce$arity$3 = function(coll, f, start) {
  var this__6768 = this;
  if(cljs.core.counted_QMARK_.call(null, this__6768.a)) {
    return cljs.core.ci_reduce.call(null, this__6768.a, f, start, this__6768.i)
  }else {
    return cljs.core.ci_reduce.call(null, coll, f, start, 0)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__6769 = this;
  return this$
};
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count$arity$1 = function(_) {
  var this__6770 = this;
  return this__6770.a.length - this__6770.i
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(_) {
  var this__6771 = this;
  return this__6771.a[this__6771.i]
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(_) {
  var this__6772 = this;
  if(this__6772.i + 1 < this__6772.a.length) {
    return new cljs.core.IndexedSeq(this__6772.a, this__6772.i + 1)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__6773 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__6774 = this;
  var i__6775 = n + this__6774.i;
  if(i__6775 < this__6774.a.length) {
    return this__6774.a[i__6775]
  }else {
    return null
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__6776 = this;
  var i__6777 = n + this__6776.i;
  if(i__6777 < this__6776.a.length) {
    return this__6776.a[i__6777]
  }else {
    return not_found
  }
};
cljs.core.IndexedSeq;
cljs.core.prim_seq = function() {
  var prim_seq = null;
  var prim_seq__1 = function(prim) {
    return prim_seq.call(null, prim, 0)
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
    return cljs.core.prim_seq.call(null, array, 0)
  };
  var array_seq__2 = function(array, i) {
    return cljs.core.prim_seq.call(null, array, i)
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
  var G__6778 = null;
  var G__6778__2 = function(array, f) {
    return cljs.core.ci_reduce.call(null, array, f)
  };
  var G__6778__3 = function(array, f, start) {
    return cljs.core.ci_reduce.call(null, array, f, start)
  };
  G__6778 = function(array, f, start) {
    switch(arguments.length) {
      case 2:
        return G__6778__2.call(this, array, f);
      case 3:
        return G__6778__3.call(this, array, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6778
}();
cljs.core.ILookup["array"] = true;
cljs.core._lookup["array"] = function() {
  var G__6779 = null;
  var G__6779__2 = function(array, k) {
    return array[k]
  };
  var G__6779__3 = function(array, k, not_found) {
    return cljs.core._nth.call(null, array, k, not_found)
  };
  G__6779 = function(array, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6779__2.call(this, array, k);
      case 3:
        return G__6779__3.call(this, array, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6779
}();
cljs.core.IIndexed["array"] = true;
cljs.core._nth["array"] = function() {
  var G__6780 = null;
  var G__6780__2 = function(array, n) {
    if(n < array.length) {
      return array[n]
    }else {
      return null
    }
  };
  var G__6780__3 = function(array, n, not_found) {
    if(n < array.length) {
      return array[n]
    }else {
      return not_found
    }
  };
  G__6780 = function(array, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__6780__2.call(this, array, n);
      case 3:
        return G__6780__3.call(this, array, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__6780
}();
cljs.core.ICounted["array"] = true;
cljs.core._count["array"] = function(a) {
  return a.length
};
cljs.core.ISeqable["array"] = true;
cljs.core._seq["array"] = function(array) {
  return cljs.core.array_seq.call(null, array, 0)
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
  return cljs.core.list.call(null, "cljs.core/RSeq")
};
cljs.core.RSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__6781 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.RSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__6782 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.RSeq.prototype.toString = function() {
  var this__6783 = this;
  var this__6784 = this;
  return cljs.core.pr_str.call(null, this__6784)
};
cljs.core.RSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__6785 = this;
  return coll
};
cljs.core.RSeq.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__6786 = this;
  return this__6786.i + 1
};
cljs.core.RSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__6787 = this;
  return cljs.core._nth.call(null, this__6787.ci, this__6787.i)
};
cljs.core.RSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__6788 = this;
  if(this__6788.i > 0) {
    return new cljs.core.RSeq(this__6788.ci, this__6788.i - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.RSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__6789 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.RSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, new_meta) {
  var this__6790 = this;
  return new cljs.core.RSeq(this__6790.ci, this__6790.i, new_meta)
};
cljs.core.RSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__6791 = this;
  return this__6791.meta
};
cljs.core.RSeq;
cljs.core.seq = function seq(coll) {
  if(coll == null) {
    return null
  }else {
    if(function() {
      var G__6795__6796 = coll;
      if(G__6795__6796) {
        if(function() {
          var or__3824__auto____6797 = G__6795__6796.cljs$lang$protocol_mask$partition0$ & 32;
          if(or__3824__auto____6797) {
            return or__3824__auto____6797
          }else {
            return G__6795__6796.cljs$core$ASeq$
          }
        }()) {
          return true
        }else {
          if(!G__6795__6796.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.ASeq, G__6795__6796)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.ASeq, G__6795__6796)
      }
    }()) {
      return coll
    }else {
      return cljs.core._seq.call(null, coll)
    }
  }
};
cljs.core.first = function first(coll) {
  if(coll == null) {
    return null
  }else {
    if(function() {
      var G__6802__6803 = coll;
      if(G__6802__6803) {
        if(function() {
          var or__3824__auto____6804 = G__6802__6803.cljs$lang$protocol_mask$partition0$ & 64;
          if(or__3824__auto____6804) {
            return or__3824__auto____6804
          }else {
            return G__6802__6803.cljs$core$ISeq$
          }
        }()) {
          return true
        }else {
          if(!G__6802__6803.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__6802__6803)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__6802__6803)
      }
    }()) {
      return cljs.core._first.call(null, coll)
    }else {
      var s__6805 = cljs.core.seq.call(null, coll);
      if(s__6805 == null) {
        return null
      }else {
        return cljs.core._first.call(null, s__6805)
      }
    }
  }
};
cljs.core.rest = function rest(coll) {
  if(!(coll == null)) {
    if(function() {
      var G__6810__6811 = coll;
      if(G__6810__6811) {
        if(function() {
          var or__3824__auto____6812 = G__6810__6811.cljs$lang$protocol_mask$partition0$ & 64;
          if(or__3824__auto____6812) {
            return or__3824__auto____6812
          }else {
            return G__6810__6811.cljs$core$ISeq$
          }
        }()) {
          return true
        }else {
          if(!G__6810__6811.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__6810__6811)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__6810__6811)
      }
    }()) {
      return cljs.core._rest.call(null, coll)
    }else {
      var s__6813 = cljs.core.seq.call(null, coll);
      if(!(s__6813 == null)) {
        return cljs.core._rest.call(null, s__6813)
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
      var G__6817__6818 = coll;
      if(G__6817__6818) {
        if(function() {
          var or__3824__auto____6819 = G__6817__6818.cljs$lang$protocol_mask$partition0$ & 128;
          if(or__3824__auto____6819) {
            return or__3824__auto____6819
          }else {
            return G__6817__6818.cljs$core$INext$
          }
        }()) {
          return true
        }else {
          if(!G__6817__6818.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.INext, G__6817__6818)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.INext, G__6817__6818)
      }
    }()) {
      return cljs.core._next.call(null, coll)
    }else {
      return cljs.core.seq.call(null, cljs.core.rest.call(null, coll))
    }
  }
};
cljs.core.second = function second(coll) {
  return cljs.core.first.call(null, cljs.core.next.call(null, coll))
};
cljs.core.ffirst = function ffirst(coll) {
  return cljs.core.first.call(null, cljs.core.first.call(null, coll))
};
cljs.core.nfirst = function nfirst(coll) {
  return cljs.core.next.call(null, cljs.core.first.call(null, coll))
};
cljs.core.fnext = function fnext(coll) {
  return cljs.core.first.call(null, cljs.core.next.call(null, coll))
};
cljs.core.nnext = function nnext(coll) {
  return cljs.core.next.call(null, cljs.core.next.call(null, coll))
};
cljs.core.last = function last(s) {
  while(true) {
    var sn__6821 = cljs.core.next.call(null, s);
    if(!(sn__6821 == null)) {
      var G__6822 = sn__6821;
      s = G__6822;
      continue
    }else {
      return cljs.core.first.call(null, s)
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
    return cljs.core._conj.call(null, coll, x)
  };
  var conj__3 = function() {
    var G__6823__delegate = function(coll, x, xs) {
      while(true) {
        if(cljs.core.truth_(xs)) {
          var G__6824 = conj.call(null, coll, x);
          var G__6825 = cljs.core.first.call(null, xs);
          var G__6826 = cljs.core.next.call(null, xs);
          coll = G__6824;
          x = G__6825;
          xs = G__6826;
          continue
        }else {
          return conj.call(null, coll, x)
        }
        break
      }
    };
    var G__6823 = function(coll, x, var_args) {
      var xs = null;
      if(goog.isDef(var_args)) {
        xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__6823__delegate.call(this, coll, x, xs)
    };
    G__6823.cljs$lang$maxFixedArity = 2;
    G__6823.cljs$lang$applyTo = function(arglist__6827) {
      var coll = cljs.core.first(arglist__6827);
      var x = cljs.core.first(cljs.core.next(arglist__6827));
      var xs = cljs.core.rest(cljs.core.next(arglist__6827));
      return G__6823__delegate(coll, x, xs)
    };
    G__6823.cljs$lang$arity$variadic = G__6823__delegate;
    return G__6823
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
  return cljs.core._empty.call(null, coll)
};
cljs.core.accumulating_seq_count = function accumulating_seq_count(coll) {
  var s__6830 = cljs.core.seq.call(null, coll);
  var acc__6831 = 0;
  while(true) {
    if(cljs.core.counted_QMARK_.call(null, s__6830)) {
      return acc__6831 + cljs.core._count.call(null, s__6830)
    }else {
      var G__6832 = cljs.core.next.call(null, s__6830);
      var G__6833 = acc__6831 + 1;
      s__6830 = G__6832;
      acc__6831 = G__6833;
      continue
    }
    break
  }
};
cljs.core.count = function count(coll) {
  if(cljs.core.counted_QMARK_.call(null, coll)) {
    return cljs.core._count.call(null, coll)
  }else {
    return cljs.core.accumulating_seq_count.call(null, coll)
  }
};
cljs.core.linear_traversal_nth = function() {
  var linear_traversal_nth = null;
  var linear_traversal_nth__2 = function(coll, n) {
    if(coll == null) {
      throw new Error("Index out of bounds");
    }else {
      if(n === 0) {
        if(cljs.core.seq.call(null, coll)) {
          return cljs.core.first.call(null, coll)
        }else {
          throw new Error("Index out of bounds");
        }
      }else {
        if(cljs.core.indexed_QMARK_.call(null, coll)) {
          return cljs.core._nth.call(null, coll, n)
        }else {
          if(cljs.core.seq.call(null, coll)) {
            return linear_traversal_nth.call(null, cljs.core.next.call(null, coll), n - 1)
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
        if(cljs.core.seq.call(null, coll)) {
          return cljs.core.first.call(null, coll)
        }else {
          return not_found
        }
      }else {
        if(cljs.core.indexed_QMARK_.call(null, coll)) {
          return cljs.core._nth.call(null, coll, n, not_found)
        }else {
          if(cljs.core.seq.call(null, coll)) {
            return linear_traversal_nth.call(null, cljs.core.next.call(null, coll), n - 1, not_found)
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
        var G__6840__6841 = coll;
        if(G__6840__6841) {
          if(function() {
            var or__3824__auto____6842 = G__6840__6841.cljs$lang$protocol_mask$partition0$ & 16;
            if(or__3824__auto____6842) {
              return or__3824__auto____6842
            }else {
              return G__6840__6841.cljs$core$IIndexed$
            }
          }()) {
            return true
          }else {
            if(!G__6840__6841.cljs$lang$protocol_mask$partition0$) {
              return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__6840__6841)
            }else {
              return false
            }
          }
        }else {
          return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__6840__6841)
        }
      }()) {
        return cljs.core._nth.call(null, coll, Math.floor(n))
      }else {
        return cljs.core.linear_traversal_nth.call(null, coll, Math.floor(n))
      }
    }
  };
  var nth__3 = function(coll, n, not_found) {
    if(!(coll == null)) {
      if(function() {
        var G__6843__6844 = coll;
        if(G__6843__6844) {
          if(function() {
            var or__3824__auto____6845 = G__6843__6844.cljs$lang$protocol_mask$partition0$ & 16;
            if(or__3824__auto____6845) {
              return or__3824__auto____6845
            }else {
              return G__6843__6844.cljs$core$IIndexed$
            }
          }()) {
            return true
          }else {
            if(!G__6843__6844.cljs$lang$protocol_mask$partition0$) {
              return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__6843__6844)
            }else {
              return false
            }
          }
        }else {
          return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__6843__6844)
        }
      }()) {
        return cljs.core._nth.call(null, coll, Math.floor(n), not_found)
      }else {
        return cljs.core.linear_traversal_nth.call(null, coll, Math.floor(n), not_found)
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
    return cljs.core._lookup.call(null, o, k)
  };
  var get__3 = function(o, k, not_found) {
    return cljs.core._lookup.call(null, o, k, not_found)
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
    return cljs.core._assoc.call(null, coll, k, v)
  };
  var assoc__4 = function() {
    var G__6848__delegate = function(coll, k, v, kvs) {
      while(true) {
        var ret__6847 = assoc.call(null, coll, k, v);
        if(cljs.core.truth_(kvs)) {
          var G__6849 = ret__6847;
          var G__6850 = cljs.core.first.call(null, kvs);
          var G__6851 = cljs.core.second.call(null, kvs);
          var G__6852 = cljs.core.nnext.call(null, kvs);
          coll = G__6849;
          k = G__6850;
          v = G__6851;
          kvs = G__6852;
          continue
        }else {
          return ret__6847
        }
        break
      }
    };
    var G__6848 = function(coll, k, v, var_args) {
      var kvs = null;
      if(goog.isDef(var_args)) {
        kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__6848__delegate.call(this, coll, k, v, kvs)
    };
    G__6848.cljs$lang$maxFixedArity = 3;
    G__6848.cljs$lang$applyTo = function(arglist__6853) {
      var coll = cljs.core.first(arglist__6853);
      var k = cljs.core.first(cljs.core.next(arglist__6853));
      var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__6853)));
      var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__6853)));
      return G__6848__delegate(coll, k, v, kvs)
    };
    G__6848.cljs$lang$arity$variadic = G__6848__delegate;
    return G__6848
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
    return cljs.core._dissoc.call(null, coll, k)
  };
  var dissoc__3 = function() {
    var G__6856__delegate = function(coll, k, ks) {
      while(true) {
        var ret__6855 = dissoc.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__6857 = ret__6855;
          var G__6858 = cljs.core.first.call(null, ks);
          var G__6859 = cljs.core.next.call(null, ks);
          coll = G__6857;
          k = G__6858;
          ks = G__6859;
          continue
        }else {
          return ret__6855
        }
        break
      }
    };
    var G__6856 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__6856__delegate.call(this, coll, k, ks)
    };
    G__6856.cljs$lang$maxFixedArity = 2;
    G__6856.cljs$lang$applyTo = function(arglist__6860) {
      var coll = cljs.core.first(arglist__6860);
      var k = cljs.core.first(cljs.core.next(arglist__6860));
      var ks = cljs.core.rest(cljs.core.next(arglist__6860));
      return G__6856__delegate(coll, k, ks)
    };
    G__6856.cljs$lang$arity$variadic = G__6856__delegate;
    return G__6856
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
  return cljs.core._with_meta.call(null, o, meta)
};
cljs.core.meta = function meta(o) {
  if(function() {
    var G__6864__6865 = o;
    if(G__6864__6865) {
      if(function() {
        var or__3824__auto____6866 = G__6864__6865.cljs$lang$protocol_mask$partition0$ & 131072;
        if(or__3824__auto____6866) {
          return or__3824__auto____6866
        }else {
          return G__6864__6865.cljs$core$IMeta$
        }
      }()) {
        return true
      }else {
        if(!G__6864__6865.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, G__6864__6865)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, G__6864__6865)
    }
  }()) {
    return cljs.core._meta.call(null, o)
  }else {
    return null
  }
};
cljs.core.peek = function peek(coll) {
  return cljs.core._peek.call(null, coll)
};
cljs.core.pop = function pop(coll) {
  return cljs.core._pop.call(null, coll)
};
cljs.core.disj = function() {
  var disj = null;
  var disj__1 = function(coll) {
    return coll
  };
  var disj__2 = function(coll, k) {
    return cljs.core._disjoin.call(null, coll, k)
  };
  var disj__3 = function() {
    var G__6869__delegate = function(coll, k, ks) {
      while(true) {
        var ret__6868 = disj.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__6870 = ret__6868;
          var G__6871 = cljs.core.first.call(null, ks);
          var G__6872 = cljs.core.next.call(null, ks);
          coll = G__6870;
          k = G__6871;
          ks = G__6872;
          continue
        }else {
          return ret__6868
        }
        break
      }
    };
    var G__6869 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__6869__delegate.call(this, coll, k, ks)
    };
    G__6869.cljs$lang$maxFixedArity = 2;
    G__6869.cljs$lang$applyTo = function(arglist__6873) {
      var coll = cljs.core.first(arglist__6873);
      var k = cljs.core.first(cljs.core.next(arglist__6873));
      var ks = cljs.core.rest(cljs.core.next(arglist__6873));
      return G__6869__delegate(coll, k, ks)
    };
    G__6869.cljs$lang$arity$variadic = G__6869__delegate;
    return G__6869
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
  var h__6875 = goog.string.hashCode(k);
  cljs.core.string_hash_cache[k] = h__6875;
  cljs.core.string_hash_cache_count = cljs.core.string_hash_cache_count + 1;
  return h__6875
};
cljs.core.check_string_hash_cache = function check_string_hash_cache(k) {
  if(cljs.core.string_hash_cache_count > 255) {
    cljs.core.string_hash_cache = {};
    cljs.core.string_hash_cache_count = 0
  }else {
  }
  var h__6877 = cljs.core.string_hash_cache[k];
  if(!(h__6877 == null)) {
    return h__6877
  }else {
    return cljs.core.add_to_string_hash_cache.call(null, k)
  }
};
cljs.core.hash = function() {
  var hash = null;
  var hash__1 = function(o) {
    return hash.call(null, o, true)
  };
  var hash__2 = function(o, check_cache) {
    if(function() {
      var and__3822__auto____6879 = goog.isString(o);
      if(and__3822__auto____6879) {
        return check_cache
      }else {
        return and__3822__auto____6879
      }
    }()) {
      return cljs.core.check_string_hash_cache.call(null, o)
    }else {
      return cljs.core._hash.call(null, o)
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
  return cljs.core.not.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.coll_QMARK_ = function coll_QMARK_(x) {
  if(x == null) {
    return false
  }else {
    var G__6883__6884 = x;
    if(G__6883__6884) {
      if(function() {
        var or__3824__auto____6885 = G__6883__6884.cljs$lang$protocol_mask$partition0$ & 8;
        if(or__3824__auto____6885) {
          return or__3824__auto____6885
        }else {
          return G__6883__6884.cljs$core$ICollection$
        }
      }()) {
        return true
      }else {
        if(!G__6883__6884.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, G__6883__6884)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, G__6883__6884)
    }
  }
};
cljs.core.set_QMARK_ = function set_QMARK_(x) {
  if(x == null) {
    return false
  }else {
    var G__6889__6890 = x;
    if(G__6889__6890) {
      if(function() {
        var or__3824__auto____6891 = G__6889__6890.cljs$lang$protocol_mask$partition0$ & 4096;
        if(or__3824__auto____6891) {
          return or__3824__auto____6891
        }else {
          return G__6889__6890.cljs$core$ISet$
        }
      }()) {
        return true
      }else {
        if(!G__6889__6890.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.ISet, G__6889__6890)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISet, G__6889__6890)
    }
  }
};
cljs.core.associative_QMARK_ = function associative_QMARK_(x) {
  var G__6895__6896 = x;
  if(G__6895__6896) {
    if(function() {
      var or__3824__auto____6897 = G__6895__6896.cljs$lang$protocol_mask$partition0$ & 512;
      if(or__3824__auto____6897) {
        return or__3824__auto____6897
      }else {
        return G__6895__6896.cljs$core$IAssociative$
      }
    }()) {
      return true
    }else {
      if(!G__6895__6896.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, G__6895__6896)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, G__6895__6896)
  }
};
cljs.core.sequential_QMARK_ = function sequential_QMARK_(x) {
  var G__6901__6902 = x;
  if(G__6901__6902) {
    if(function() {
      var or__3824__auto____6903 = G__6901__6902.cljs$lang$protocol_mask$partition0$ & 16777216;
      if(or__3824__auto____6903) {
        return or__3824__auto____6903
      }else {
        return G__6901__6902.cljs$core$ISequential$
      }
    }()) {
      return true
    }else {
      if(!G__6901__6902.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, G__6901__6902)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, G__6901__6902)
  }
};
cljs.core.counted_QMARK_ = function counted_QMARK_(x) {
  var G__6907__6908 = x;
  if(G__6907__6908) {
    if(function() {
      var or__3824__auto____6909 = G__6907__6908.cljs$lang$protocol_mask$partition0$ & 2;
      if(or__3824__auto____6909) {
        return or__3824__auto____6909
      }else {
        return G__6907__6908.cljs$core$ICounted$
      }
    }()) {
      return true
    }else {
      if(!G__6907__6908.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, G__6907__6908)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, G__6907__6908)
  }
};
cljs.core.indexed_QMARK_ = function indexed_QMARK_(x) {
  var G__6913__6914 = x;
  if(G__6913__6914) {
    if(function() {
      var or__3824__auto____6915 = G__6913__6914.cljs$lang$protocol_mask$partition0$ & 16;
      if(or__3824__auto____6915) {
        return or__3824__auto____6915
      }else {
        return G__6913__6914.cljs$core$IIndexed$
      }
    }()) {
      return true
    }else {
      if(!G__6913__6914.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__6913__6914)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__6913__6914)
  }
};
cljs.core.reduceable_QMARK_ = function reduceable_QMARK_(x) {
  var G__6919__6920 = x;
  if(G__6919__6920) {
    if(function() {
      var or__3824__auto____6921 = G__6919__6920.cljs$lang$protocol_mask$partition0$ & 524288;
      if(or__3824__auto____6921) {
        return or__3824__auto____6921
      }else {
        return G__6919__6920.cljs$core$IReduce$
      }
    }()) {
      return true
    }else {
      if(!G__6919__6920.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__6919__6920)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__6919__6920)
  }
};
cljs.core.map_QMARK_ = function map_QMARK_(x) {
  if(x == null) {
    return false
  }else {
    var G__6925__6926 = x;
    if(G__6925__6926) {
      if(function() {
        var or__3824__auto____6927 = G__6925__6926.cljs$lang$protocol_mask$partition0$ & 1024;
        if(or__3824__auto____6927) {
          return or__3824__auto____6927
        }else {
          return G__6925__6926.cljs$core$IMap$
        }
      }()) {
        return true
      }else {
        if(!G__6925__6926.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IMap, G__6925__6926)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMap, G__6925__6926)
    }
  }
};
cljs.core.vector_QMARK_ = function vector_QMARK_(x) {
  var G__6931__6932 = x;
  if(G__6931__6932) {
    if(function() {
      var or__3824__auto____6933 = G__6931__6932.cljs$lang$protocol_mask$partition0$ & 16384;
      if(or__3824__auto____6933) {
        return or__3824__auto____6933
      }else {
        return G__6931__6932.cljs$core$IVector$
      }
    }()) {
      return true
    }else {
      if(!G__6931__6932.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IVector, G__6931__6932)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IVector, G__6931__6932)
  }
};
cljs.core.chunked_seq_QMARK_ = function chunked_seq_QMARK_(x) {
  var G__6937__6938 = x;
  if(G__6937__6938) {
    if(cljs.core.truth_(function() {
      var or__3824__auto____6939 = null;
      if(cljs.core.truth_(or__3824__auto____6939)) {
        return or__3824__auto____6939
      }else {
        return G__6937__6938.cljs$core$IChunkedSeq$
      }
    }())) {
      return true
    }else {
      if(!G__6937__6938.cljs$lang$protocol_mask$partition$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IChunkedSeq, G__6937__6938)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IChunkedSeq, G__6937__6938)
  }
};
cljs.core.js_obj = function() {
  var js_obj = null;
  var js_obj__0 = function() {
    return{}
  };
  var js_obj__1 = function() {
    var G__6940__delegate = function(keyvals) {
      return cljs.core.apply.call(null, goog.object.create, keyvals)
    };
    var G__6940 = function(var_args) {
      var keyvals = null;
      if(goog.isDef(var_args)) {
        keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__6940__delegate.call(this, keyvals)
    };
    G__6940.cljs$lang$maxFixedArity = 0;
    G__6940.cljs$lang$applyTo = function(arglist__6941) {
      var keyvals = cljs.core.seq(arglist__6941);
      return G__6940__delegate(keyvals)
    };
    G__6940.cljs$lang$arity$variadic = G__6940__delegate;
    return G__6940
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
  var keys__6943 = [];
  goog.object.forEach(obj, function(val, key, obj) {
    return keys__6943.push(key)
  });
  return keys__6943
};
cljs.core.js_delete = function js_delete(obj, key) {
  return delete obj[key]
};
cljs.core.array_copy = function array_copy(from, i, to, j, len) {
  var i__6947 = i;
  var j__6948 = j;
  var len__6949 = len;
  while(true) {
    if(len__6949 === 0) {
      return to
    }else {
      to[j__6948] = from[i__6947];
      var G__6950 = i__6947 + 1;
      var G__6951 = j__6948 + 1;
      var G__6952 = len__6949 - 1;
      i__6947 = G__6950;
      j__6948 = G__6951;
      len__6949 = G__6952;
      continue
    }
    break
  }
};
cljs.core.array_copy_downward = function array_copy_downward(from, i, to, j, len) {
  var i__6956 = i + (len - 1);
  var j__6957 = j + (len - 1);
  var len__6958 = len;
  while(true) {
    if(len__6958 === 0) {
      return to
    }else {
      to[j__6957] = from[i__6956];
      var G__6959 = i__6956 - 1;
      var G__6960 = j__6957 - 1;
      var G__6961 = len__6958 - 1;
      i__6956 = G__6959;
      j__6957 = G__6960;
      len__6958 = G__6961;
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
    var G__6965__6966 = s;
    if(G__6965__6966) {
      if(function() {
        var or__3824__auto____6967 = G__6965__6966.cljs$lang$protocol_mask$partition0$ & 64;
        if(or__3824__auto____6967) {
          return or__3824__auto____6967
        }else {
          return G__6965__6966.cljs$core$ISeq$
        }
      }()) {
        return true
      }else {
        if(!G__6965__6966.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__6965__6966)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__6965__6966)
    }
  }
};
cljs.core.seqable_QMARK_ = function seqable_QMARK_(s) {
  var G__6971__6972 = s;
  if(G__6971__6972) {
    if(function() {
      var or__3824__auto____6973 = G__6971__6972.cljs$lang$protocol_mask$partition0$ & 8388608;
      if(or__3824__auto____6973) {
        return or__3824__auto____6973
      }else {
        return G__6971__6972.cljs$core$ISeqable$
      }
    }()) {
      return true
    }else {
      if(!G__6971__6972.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISeqable, G__6971__6972)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISeqable, G__6971__6972)
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
  var and__3822__auto____6976 = goog.isString(x);
  if(and__3822__auto____6976) {
    return!function() {
      var or__3824__auto____6977 = x.charAt(0) === "\ufdd0";
      if(or__3824__auto____6977) {
        return or__3824__auto____6977
      }else {
        return x.charAt(0) === "\ufdd1"
      }
    }()
  }else {
    return and__3822__auto____6976
  }
};
cljs.core.keyword_QMARK_ = function keyword_QMARK_(x) {
  var and__3822__auto____6979 = goog.isString(x);
  if(and__3822__auto____6979) {
    return x.charAt(0) === "\ufdd0"
  }else {
    return and__3822__auto____6979
  }
};
cljs.core.symbol_QMARK_ = function symbol_QMARK_(x) {
  var and__3822__auto____6981 = goog.isString(x);
  if(and__3822__auto____6981) {
    return x.charAt(0) === "\ufdd1"
  }else {
    return and__3822__auto____6981
  }
};
cljs.core.number_QMARK_ = function number_QMARK_(n) {
  return goog.isNumber(n)
};
cljs.core.fn_QMARK_ = function fn_QMARK_(f) {
  return goog.isFunction(f)
};
cljs.core.ifn_QMARK_ = function ifn_QMARK_(f) {
  var or__3824__auto____6986 = cljs.core.fn_QMARK_.call(null, f);
  if(or__3824__auto____6986) {
    return or__3824__auto____6986
  }else {
    var G__6987__6988 = f;
    if(G__6987__6988) {
      if(function() {
        var or__3824__auto____6989 = G__6987__6988.cljs$lang$protocol_mask$partition0$ & 1;
        if(or__3824__auto____6989) {
          return or__3824__auto____6989
        }else {
          return G__6987__6988.cljs$core$IFn$
        }
      }()) {
        return true
      }else {
        if(!G__6987__6988.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IFn, G__6987__6988)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IFn, G__6987__6988)
    }
  }
};
cljs.core.integer_QMARK_ = function integer_QMARK_(n) {
  var and__3822__auto____6991 = cljs.core.number_QMARK_.call(null, n);
  if(and__3822__auto____6991) {
    return n == n.toFixed()
  }else {
    return and__3822__auto____6991
  }
};
cljs.core.contains_QMARK_ = function contains_QMARK_(coll, v) {
  if(cljs.core._lookup.call(null, coll, v, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
    return false
  }else {
    return true
  }
};
cljs.core.find = function find(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3822__auto____6994 = coll;
    if(cljs.core.truth_(and__3822__auto____6994)) {
      var and__3822__auto____6995 = cljs.core.associative_QMARK_.call(null, coll);
      if(and__3822__auto____6995) {
        return cljs.core.contains_QMARK_.call(null, coll, k)
      }else {
        return and__3822__auto____6995
      }
    }else {
      return and__3822__auto____6994
    }
  }())) {
    return cljs.core.PersistentVector.fromArray([k, cljs.core._lookup.call(null, coll, k)], true)
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
    return!cljs.core._EQ_.call(null, x, y)
  };
  var distinct_QMARK___3 = function() {
    var G__7004__delegate = function(x, y, more) {
      if(!cljs.core._EQ_.call(null, x, y)) {
        var s__7000 = cljs.core.PersistentHashSet.fromArray([y, x]);
        var xs__7001 = more;
        while(true) {
          var x__7002 = cljs.core.first.call(null, xs__7001);
          var etc__7003 = cljs.core.next.call(null, xs__7001);
          if(cljs.core.truth_(xs__7001)) {
            if(cljs.core.contains_QMARK_.call(null, s__7000, x__7002)) {
              return false
            }else {
              var G__7005 = cljs.core.conj.call(null, s__7000, x__7002);
              var G__7006 = etc__7003;
              s__7000 = G__7005;
              xs__7001 = G__7006;
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
    var G__7004 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7004__delegate.call(this, x, y, more)
    };
    G__7004.cljs$lang$maxFixedArity = 2;
    G__7004.cljs$lang$applyTo = function(arglist__7007) {
      var x = cljs.core.first(arglist__7007);
      var y = cljs.core.first(cljs.core.next(arglist__7007));
      var more = cljs.core.rest(cljs.core.next(arglist__7007));
      return G__7004__delegate(x, y, more)
    };
    G__7004.cljs$lang$arity$variadic = G__7004__delegate;
    return G__7004
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
        if(cljs.core.type.call(null, x) === cljs.core.type.call(null, y)) {
          if(function() {
            var G__7011__7012 = x;
            if(G__7011__7012) {
              if(cljs.core.truth_(function() {
                var or__3824__auto____7013 = null;
                if(cljs.core.truth_(or__3824__auto____7013)) {
                  return or__3824__auto____7013
                }else {
                  return G__7011__7012.cljs$core$IComparable$
                }
              }())) {
                return true
              }else {
                if(!G__7011__7012.cljs$lang$protocol_mask$partition$) {
                  return cljs.core.type_satisfies_.call(null, cljs.core.IComparable, G__7011__7012)
                }else {
                  return false
                }
              }
            }else {
              return cljs.core.type_satisfies_.call(null, cljs.core.IComparable, G__7011__7012)
            }
          }()) {
            return cljs.core._compare.call(null, x, y)
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
    var xl__7018 = cljs.core.count.call(null, xs);
    var yl__7019 = cljs.core.count.call(null, ys);
    if(xl__7018 < yl__7019) {
      return-1
    }else {
      if(xl__7018 > yl__7019) {
        return 1
      }else {
        if("\ufdd0'else") {
          return compare_indexed.call(null, xs, ys, xl__7018, 0)
        }else {
          return null
        }
      }
    }
  };
  var compare_indexed__4 = function(xs, ys, len, n) {
    while(true) {
      var d__7020 = cljs.core.compare.call(null, cljs.core.nth.call(null, xs, n), cljs.core.nth.call(null, ys, n));
      if(function() {
        var and__3822__auto____7021 = d__7020 === 0;
        if(and__3822__auto____7021) {
          return n + 1 < len
        }else {
          return and__3822__auto____7021
        }
      }()) {
        var G__7022 = xs;
        var G__7023 = ys;
        var G__7024 = len;
        var G__7025 = n + 1;
        xs = G__7022;
        ys = G__7023;
        len = G__7024;
        n = G__7025;
        continue
      }else {
        return d__7020
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
  if(cljs.core._EQ_.call(null, f, cljs.core.compare)) {
    return cljs.core.compare
  }else {
    return function(x, y) {
      var r__7027 = f.call(null, x, y);
      if(cljs.core.number_QMARK_.call(null, r__7027)) {
        return r__7027
      }else {
        if(cljs.core.truth_(r__7027)) {
          return-1
        }else {
          if(cljs.core.truth_(f.call(null, y, x))) {
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
    return sort.call(null, cljs.core.compare, coll)
  };
  var sort__2 = function(comp, coll) {
    if(cljs.core.seq.call(null, coll)) {
      var a__7029 = cljs.core.to_array.call(null, coll);
      goog.array.stableSort(a__7029, cljs.core.fn__GT_comparator.call(null, comp));
      return cljs.core.seq.call(null, a__7029)
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
    return sort_by.call(null, keyfn, cljs.core.compare, coll)
  };
  var sort_by__3 = function(keyfn, comp, coll) {
    return cljs.core.sort.call(null, function(x, y) {
      return cljs.core.fn__GT_comparator.call(null, comp).call(null, keyfn.call(null, x), keyfn.call(null, y))
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
    var temp__3971__auto____7035 = cljs.core.seq.call(null, coll);
    if(temp__3971__auto____7035) {
      var s__7036 = temp__3971__auto____7035;
      return cljs.core.reduce.call(null, f, cljs.core.first.call(null, s__7036), cljs.core.next.call(null, s__7036))
    }else {
      return f.call(null)
    }
  };
  var seq_reduce__3 = function(f, val, coll) {
    var val__7037 = val;
    var coll__7038 = cljs.core.seq.call(null, coll);
    while(true) {
      if(coll__7038) {
        var nval__7039 = f.call(null, val__7037, cljs.core.first.call(null, coll__7038));
        if(cljs.core.reduced_QMARK_.call(null, nval__7039)) {
          return cljs.core.deref.call(null, nval__7039)
        }else {
          var G__7040 = nval__7039;
          var G__7041 = cljs.core.next.call(null, coll__7038);
          val__7037 = G__7040;
          coll__7038 = G__7041;
          continue
        }
      }else {
        return val__7037
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
  var a__7043 = cljs.core.to_array.call(null, coll);
  goog.array.shuffle(a__7043);
  return cljs.core.vec.call(null, a__7043)
};
cljs.core.reduce = function() {
  var reduce = null;
  var reduce__2 = function(f, coll) {
    if(function() {
      var G__7050__7051 = coll;
      if(G__7050__7051) {
        if(function() {
          var or__3824__auto____7052 = G__7050__7051.cljs$lang$protocol_mask$partition0$ & 524288;
          if(or__3824__auto____7052) {
            return or__3824__auto____7052
          }else {
            return G__7050__7051.cljs$core$IReduce$
          }
        }()) {
          return true
        }else {
          if(!G__7050__7051.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__7050__7051)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__7050__7051)
      }
    }()) {
      return cljs.core._reduce.call(null, coll, f)
    }else {
      return cljs.core.seq_reduce.call(null, f, coll)
    }
  };
  var reduce__3 = function(f, val, coll) {
    if(function() {
      var G__7053__7054 = coll;
      if(G__7053__7054) {
        if(function() {
          var or__3824__auto____7055 = G__7053__7054.cljs$lang$protocol_mask$partition0$ & 524288;
          if(or__3824__auto____7055) {
            return or__3824__auto____7055
          }else {
            return G__7053__7054.cljs$core$IReduce$
          }
        }()) {
          return true
        }else {
          if(!G__7053__7054.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__7053__7054)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__7053__7054)
      }
    }()) {
      return cljs.core._reduce.call(null, coll, f, val)
    }else {
      return cljs.core.seq_reduce.call(null, f, val, coll)
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
  return cljs.core._kv_reduce.call(null, coll, f, init)
};
cljs.core.Reduced = function(val) {
  this.val = val;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32768
};
cljs.core.Reduced.cljs$lang$type = true;
cljs.core.Reduced.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/Reduced")
};
cljs.core.Reduced.prototype.cljs$core$IDeref$_deref$arity$1 = function(o) {
  var this__7056 = this;
  return this__7056.val
};
cljs.core.Reduced;
cljs.core.reduced_QMARK_ = function reduced_QMARK_(r) {
  return cljs.core.instance_QMARK_.call(null, cljs.core.Reduced, r)
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
    var G__7057__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _PLUS_, x + y, more)
    };
    var G__7057 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7057__delegate.call(this, x, y, more)
    };
    G__7057.cljs$lang$maxFixedArity = 2;
    G__7057.cljs$lang$applyTo = function(arglist__7058) {
      var x = cljs.core.first(arglist__7058);
      var y = cljs.core.first(cljs.core.next(arglist__7058));
      var more = cljs.core.rest(cljs.core.next(arglist__7058));
      return G__7057__delegate(x, y, more)
    };
    G__7057.cljs$lang$arity$variadic = G__7057__delegate;
    return G__7057
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
    var G__7059__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _, x - y, more)
    };
    var G__7059 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7059__delegate.call(this, x, y, more)
    };
    G__7059.cljs$lang$maxFixedArity = 2;
    G__7059.cljs$lang$applyTo = function(arglist__7060) {
      var x = cljs.core.first(arglist__7060);
      var y = cljs.core.first(cljs.core.next(arglist__7060));
      var more = cljs.core.rest(cljs.core.next(arglist__7060));
      return G__7059__delegate(x, y, more)
    };
    G__7059.cljs$lang$arity$variadic = G__7059__delegate;
    return G__7059
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
    var G__7061__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _STAR_, x * y, more)
    };
    var G__7061 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7061__delegate.call(this, x, y, more)
    };
    G__7061.cljs$lang$maxFixedArity = 2;
    G__7061.cljs$lang$applyTo = function(arglist__7062) {
      var x = cljs.core.first(arglist__7062);
      var y = cljs.core.first(cljs.core.next(arglist__7062));
      var more = cljs.core.rest(cljs.core.next(arglist__7062));
      return G__7061__delegate(x, y, more)
    };
    G__7061.cljs$lang$arity$variadic = G__7061__delegate;
    return G__7061
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
    return _SLASH_.call(null, 1, x)
  };
  var _SLASH___2 = function(x, y) {
    return x / y
  };
  var _SLASH___3 = function() {
    var G__7063__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _SLASH_, _SLASH_.call(null, x, y), more)
    };
    var G__7063 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7063__delegate.call(this, x, y, more)
    };
    G__7063.cljs$lang$maxFixedArity = 2;
    G__7063.cljs$lang$applyTo = function(arglist__7064) {
      var x = cljs.core.first(arglist__7064);
      var y = cljs.core.first(cljs.core.next(arglist__7064));
      var more = cljs.core.rest(cljs.core.next(arglist__7064));
      return G__7063__delegate(x, y, more)
    };
    G__7063.cljs$lang$arity$variadic = G__7063__delegate;
    return G__7063
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
    var G__7065__delegate = function(x, y, more) {
      while(true) {
        if(x < y) {
          if(cljs.core.next.call(null, more)) {
            var G__7066 = y;
            var G__7067 = cljs.core.first.call(null, more);
            var G__7068 = cljs.core.next.call(null, more);
            x = G__7066;
            y = G__7067;
            more = G__7068;
            continue
          }else {
            return y < cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__7065 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7065__delegate.call(this, x, y, more)
    };
    G__7065.cljs$lang$maxFixedArity = 2;
    G__7065.cljs$lang$applyTo = function(arglist__7069) {
      var x = cljs.core.first(arglist__7069);
      var y = cljs.core.first(cljs.core.next(arglist__7069));
      var more = cljs.core.rest(cljs.core.next(arglist__7069));
      return G__7065__delegate(x, y, more)
    };
    G__7065.cljs$lang$arity$variadic = G__7065__delegate;
    return G__7065
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
    var G__7070__delegate = function(x, y, more) {
      while(true) {
        if(x <= y) {
          if(cljs.core.next.call(null, more)) {
            var G__7071 = y;
            var G__7072 = cljs.core.first.call(null, more);
            var G__7073 = cljs.core.next.call(null, more);
            x = G__7071;
            y = G__7072;
            more = G__7073;
            continue
          }else {
            return y <= cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__7070 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7070__delegate.call(this, x, y, more)
    };
    G__7070.cljs$lang$maxFixedArity = 2;
    G__7070.cljs$lang$applyTo = function(arglist__7074) {
      var x = cljs.core.first(arglist__7074);
      var y = cljs.core.first(cljs.core.next(arglist__7074));
      var more = cljs.core.rest(cljs.core.next(arglist__7074));
      return G__7070__delegate(x, y, more)
    };
    G__7070.cljs$lang$arity$variadic = G__7070__delegate;
    return G__7070
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
    var G__7075__delegate = function(x, y, more) {
      while(true) {
        if(x > y) {
          if(cljs.core.next.call(null, more)) {
            var G__7076 = y;
            var G__7077 = cljs.core.first.call(null, more);
            var G__7078 = cljs.core.next.call(null, more);
            x = G__7076;
            y = G__7077;
            more = G__7078;
            continue
          }else {
            return y > cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__7075 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7075__delegate.call(this, x, y, more)
    };
    G__7075.cljs$lang$maxFixedArity = 2;
    G__7075.cljs$lang$applyTo = function(arglist__7079) {
      var x = cljs.core.first(arglist__7079);
      var y = cljs.core.first(cljs.core.next(arglist__7079));
      var more = cljs.core.rest(cljs.core.next(arglist__7079));
      return G__7075__delegate(x, y, more)
    };
    G__7075.cljs$lang$arity$variadic = G__7075__delegate;
    return G__7075
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
    var G__7080__delegate = function(x, y, more) {
      while(true) {
        if(x >= y) {
          if(cljs.core.next.call(null, more)) {
            var G__7081 = y;
            var G__7082 = cljs.core.first.call(null, more);
            var G__7083 = cljs.core.next.call(null, more);
            x = G__7081;
            y = G__7082;
            more = G__7083;
            continue
          }else {
            return y >= cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__7080 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7080__delegate.call(this, x, y, more)
    };
    G__7080.cljs$lang$maxFixedArity = 2;
    G__7080.cljs$lang$applyTo = function(arglist__7084) {
      var x = cljs.core.first(arglist__7084);
      var y = cljs.core.first(cljs.core.next(arglist__7084));
      var more = cljs.core.rest(cljs.core.next(arglist__7084));
      return G__7080__delegate(x, y, more)
    };
    G__7080.cljs$lang$arity$variadic = G__7080__delegate;
    return G__7080
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
    var G__7085__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, max, x > y ? x : y, more)
    };
    var G__7085 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7085__delegate.call(this, x, y, more)
    };
    G__7085.cljs$lang$maxFixedArity = 2;
    G__7085.cljs$lang$applyTo = function(arglist__7086) {
      var x = cljs.core.first(arglist__7086);
      var y = cljs.core.first(cljs.core.next(arglist__7086));
      var more = cljs.core.rest(cljs.core.next(arglist__7086));
      return G__7085__delegate(x, y, more)
    };
    G__7085.cljs$lang$arity$variadic = G__7085__delegate;
    return G__7085
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
    var G__7087__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, min, x < y ? x : y, more)
    };
    var G__7087 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7087__delegate.call(this, x, y, more)
    };
    G__7087.cljs$lang$maxFixedArity = 2;
    G__7087.cljs$lang$applyTo = function(arglist__7088) {
      var x = cljs.core.first(arglist__7088);
      var y = cljs.core.first(cljs.core.next(arglist__7088));
      var more = cljs.core.rest(cljs.core.next(arglist__7088));
      return G__7087__delegate(x, y, more)
    };
    G__7087.cljs$lang$arity$variadic = G__7087__delegate;
    return G__7087
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
    return Math.floor.call(null, q)
  }else {
    return Math.ceil.call(null, q)
  }
};
cljs.core.int$ = function int$(x) {
  return cljs.core.fix.call(null, x)
};
cljs.core.long$ = function long$(x) {
  return cljs.core.fix.call(null, x)
};
cljs.core.mod = function mod(n, d) {
  return n % d
};
cljs.core.quot = function quot(n, d) {
  var rem__7090 = n % d;
  return cljs.core.fix.call(null, (n - rem__7090) / d)
};
cljs.core.rem = function rem(n, d) {
  var q__7092 = cljs.core.quot.call(null, n, d);
  return n - d * q__7092
};
cljs.core.rand = function() {
  var rand = null;
  var rand__0 = function() {
    return Math.random.call(null)
  };
  var rand__1 = function(n) {
    return n * rand.call(null)
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
  return cljs.core.fix.call(null, cljs.core.rand.call(null, n))
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
  var v__7095 = v - (v >> 1 & 1431655765);
  var v__7096 = (v__7095 & 858993459) + (v__7095 >> 2 & 858993459);
  return(v__7096 + (v__7096 >> 4) & 252645135) * 16843009 >> 24
};
cljs.core._EQ__EQ_ = function() {
  var _EQ__EQ_ = null;
  var _EQ__EQ___1 = function(x) {
    return true
  };
  var _EQ__EQ___2 = function(x, y) {
    return cljs.core._equiv.call(null, x, y)
  };
  var _EQ__EQ___3 = function() {
    var G__7097__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ__EQ_.call(null, x, y))) {
          if(cljs.core.next.call(null, more)) {
            var G__7098 = y;
            var G__7099 = cljs.core.first.call(null, more);
            var G__7100 = cljs.core.next.call(null, more);
            x = G__7098;
            y = G__7099;
            more = G__7100;
            continue
          }else {
            return _EQ__EQ_.call(null, y, cljs.core.first.call(null, more))
          }
        }else {
          return false
        }
        break
      }
    };
    var G__7097 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7097__delegate.call(this, x, y, more)
    };
    G__7097.cljs$lang$maxFixedArity = 2;
    G__7097.cljs$lang$applyTo = function(arglist__7101) {
      var x = cljs.core.first(arglist__7101);
      var y = cljs.core.first(cljs.core.next(arglist__7101));
      var more = cljs.core.rest(cljs.core.next(arglist__7101));
      return G__7097__delegate(x, y, more)
    };
    G__7097.cljs$lang$arity$variadic = G__7097__delegate;
    return G__7097
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
  var n__7105 = n;
  var xs__7106 = cljs.core.seq.call(null, coll);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3822__auto____7107 = xs__7106;
      if(and__3822__auto____7107) {
        return n__7105 > 0
      }else {
        return and__3822__auto____7107
      }
    }())) {
      var G__7108 = n__7105 - 1;
      var G__7109 = cljs.core.next.call(null, xs__7106);
      n__7105 = G__7108;
      xs__7106 = G__7109;
      continue
    }else {
      return xs__7106
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
    var G__7110__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__7111 = sb.append(str_STAR_.call(null, cljs.core.first.call(null, more)));
            var G__7112 = cljs.core.next.call(null, more);
            sb = G__7111;
            more = G__7112;
            continue
          }else {
            return str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str_STAR_.call(null, x)), ys)
    };
    var G__7110 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__7110__delegate.call(this, x, ys)
    };
    G__7110.cljs$lang$maxFixedArity = 1;
    G__7110.cljs$lang$applyTo = function(arglist__7113) {
      var x = cljs.core.first(arglist__7113);
      var ys = cljs.core.rest(arglist__7113);
      return G__7110__delegate(x, ys)
    };
    G__7110.cljs$lang$arity$variadic = G__7110__delegate;
    return G__7110
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
    if(cljs.core.symbol_QMARK_.call(null, x)) {
      return x.substring(2, x.length)
    }else {
      if(cljs.core.keyword_QMARK_.call(null, x)) {
        return cljs.core.str_STAR_.call(null, ":", x.substring(2, x.length))
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
    var G__7114__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__7115 = sb.append(str.call(null, cljs.core.first.call(null, more)));
            var G__7116 = cljs.core.next.call(null, more);
            sb = G__7115;
            more = G__7116;
            continue
          }else {
            return cljs.core.str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str.call(null, x)), ys)
    };
    var G__7114 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__7114__delegate.call(this, x, ys)
    };
    G__7114.cljs$lang$maxFixedArity = 1;
    G__7114.cljs$lang$applyTo = function(arglist__7117) {
      var x = cljs.core.first(arglist__7117);
      var ys = cljs.core.rest(arglist__7117);
      return G__7114__delegate(x, ys)
    };
    G__7114.cljs$lang$arity$variadic = G__7114__delegate;
    return G__7114
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
    return cljs.core.apply.call(null, goog.string.format, fmt, args)
  };
  var format = function(fmt, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return format__delegate.call(this, fmt, args)
  };
  format.cljs$lang$maxFixedArity = 1;
  format.cljs$lang$applyTo = function(arglist__7118) {
    var fmt = cljs.core.first(arglist__7118);
    var args = cljs.core.rest(arglist__7118);
    return format__delegate(fmt, args)
  };
  format.cljs$lang$arity$variadic = format__delegate;
  return format
}();
cljs.core.symbol = function() {
  var symbol = null;
  var symbol__1 = function(name) {
    if(cljs.core.symbol_QMARK_.call(null, name)) {
      name
    }else {
      if(cljs.core.keyword_QMARK_.call(null, name)) {
        cljs.core.str_STAR_.call(null, "\ufdd1", "'", cljs.core.subs.call(null, name, 2))
      }else {
      }
    }
    return cljs.core.str_STAR_.call(null, "\ufdd1", "'", name)
  };
  var symbol__2 = function(ns, name) {
    return symbol.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
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
    if(cljs.core.keyword_QMARK_.call(null, name)) {
      return name
    }else {
      if(cljs.core.symbol_QMARK_.call(null, name)) {
        return cljs.core.str_STAR_.call(null, "\ufdd0", "'", cljs.core.subs.call(null, name, 2))
      }else {
        if("\ufdd0'else") {
          return cljs.core.str_STAR_.call(null, "\ufdd0", "'", name)
        }else {
          return null
        }
      }
    }
  };
  var keyword__2 = function(ns, name) {
    return keyword.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
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
  return cljs.core.boolean$.call(null, cljs.core.sequential_QMARK_.call(null, y) ? function() {
    var xs__7121 = cljs.core.seq.call(null, x);
    var ys__7122 = cljs.core.seq.call(null, y);
    while(true) {
      if(xs__7121 == null) {
        return ys__7122 == null
      }else {
        if(ys__7122 == null) {
          return false
        }else {
          if(cljs.core._EQ_.call(null, cljs.core.first.call(null, xs__7121), cljs.core.first.call(null, ys__7122))) {
            var G__7123 = cljs.core.next.call(null, xs__7121);
            var G__7124 = cljs.core.next.call(null, ys__7122);
            xs__7121 = G__7123;
            ys__7122 = G__7124;
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
  return cljs.core.reduce.call(null, function(p1__7125_SHARP_, p2__7126_SHARP_) {
    return cljs.core.hash_combine.call(null, p1__7125_SHARP_, cljs.core.hash.call(null, p2__7126_SHARP_, false))
  }, cljs.core.hash.call(null, cljs.core.first.call(null, coll), false), cljs.core.next.call(null, coll))
};
cljs.core.hash_imap = function hash_imap(m) {
  var h__7130 = 0;
  var s__7131 = cljs.core.seq.call(null, m);
  while(true) {
    if(s__7131) {
      var e__7132 = cljs.core.first.call(null, s__7131);
      var G__7133 = (h__7130 + (cljs.core.hash.call(null, cljs.core.key.call(null, e__7132)) ^ cljs.core.hash.call(null, cljs.core.val.call(null, e__7132)))) % 4503599627370496;
      var G__7134 = cljs.core.next.call(null, s__7131);
      h__7130 = G__7133;
      s__7131 = G__7134;
      continue
    }else {
      return h__7130
    }
    break
  }
};
cljs.core.hash_iset = function hash_iset(s) {
  var h__7138 = 0;
  var s__7139 = cljs.core.seq.call(null, s);
  while(true) {
    if(s__7139) {
      var e__7140 = cljs.core.first.call(null, s__7139);
      var G__7141 = (h__7138 + cljs.core.hash.call(null, e__7140)) % 4503599627370496;
      var G__7142 = cljs.core.next.call(null, s__7139);
      h__7138 = G__7141;
      s__7139 = G__7142;
      continue
    }else {
      return h__7138
    }
    break
  }
};
cljs.core.extend_object_BANG_ = function extend_object_BANG_(obj, fn_map) {
  var G__7163__7164 = cljs.core.seq.call(null, fn_map);
  if(G__7163__7164) {
    var G__7166__7168 = cljs.core.first.call(null, G__7163__7164);
    var vec__7167__7169 = G__7166__7168;
    var key_name__7170 = cljs.core.nth.call(null, vec__7167__7169, 0, null);
    var f__7171 = cljs.core.nth.call(null, vec__7167__7169, 1, null);
    var G__7163__7172 = G__7163__7164;
    var G__7166__7173 = G__7166__7168;
    var G__7163__7174 = G__7163__7172;
    while(true) {
      var vec__7175__7176 = G__7166__7173;
      var key_name__7177 = cljs.core.nth.call(null, vec__7175__7176, 0, null);
      var f__7178 = cljs.core.nth.call(null, vec__7175__7176, 1, null);
      var G__7163__7179 = G__7163__7174;
      var str_name__7180 = cljs.core.name.call(null, key_name__7177);
      obj[str_name__7180] = f__7178;
      var temp__3974__auto____7181 = cljs.core.next.call(null, G__7163__7179);
      if(temp__3974__auto____7181) {
        var G__7163__7182 = temp__3974__auto____7181;
        var G__7183 = cljs.core.first.call(null, G__7163__7182);
        var G__7184 = G__7163__7182;
        G__7166__7173 = G__7183;
        G__7163__7174 = G__7184;
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
  return cljs.core.list.call(null, "cljs.core/List")
};
cljs.core.List.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__7185 = this;
  var h__2192__auto____7186 = this__7185.__hash;
  if(!(h__2192__auto____7186 == null)) {
    return h__2192__auto____7186
  }else {
    var h__2192__auto____7187 = cljs.core.hash_coll.call(null, coll);
    this__7185.__hash = h__2192__auto____7187;
    return h__2192__auto____7187
  }
};
cljs.core.List.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__7188 = this;
  if(this__7188.count === 1) {
    return null
  }else {
    return this__7188.rest
  }
};
cljs.core.List.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__7189 = this;
  return new cljs.core.List(this__7189.meta, o, coll, this__7189.count + 1, null)
};
cljs.core.List.prototype.toString = function() {
  var this__7190 = this;
  var this__7191 = this;
  return cljs.core.pr_str.call(null, this__7191)
};
cljs.core.List.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__7192 = this;
  return coll
};
cljs.core.List.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__7193 = this;
  return this__7193.count
};
cljs.core.List.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__7194 = this;
  return this__7194.first
};
cljs.core.List.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__7195 = this;
  return coll.cljs$core$ISeq$_rest$arity$1(coll)
};
cljs.core.List.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__7196 = this;
  return this__7196.first
};
cljs.core.List.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__7197 = this;
  if(this__7197.count === 1) {
    return cljs.core.List.EMPTY
  }else {
    return this__7197.rest
  }
};
cljs.core.List.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__7198 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__7199 = this;
  return new cljs.core.List(meta, this__7199.first, this__7199.rest, this__7199.count, this__7199.__hash)
};
cljs.core.List.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__7200 = this;
  return this__7200.meta
};
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__7201 = this;
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
  return cljs.core.list.call(null, "cljs.core/EmptyList")
};
cljs.core.EmptyList.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__7202 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__7203 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__7204 = this;
  return new cljs.core.List(this__7204.meta, o, null, 1, null)
};
cljs.core.EmptyList.prototype.toString = function() {
  var this__7205 = this;
  var this__7206 = this;
  return cljs.core.pr_str.call(null, this__7206)
};
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__7207 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__7208 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__7209 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__7210 = this;
  throw new Error("Can't pop empty list");
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__7211 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__7212 = this;
  return cljs.core.List.EMPTY
};
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__7213 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__7214 = this;
  return new cljs.core.EmptyList(meta)
};
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__7215 = this;
  return this__7215.meta
};
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__7216 = this;
  return coll
};
cljs.core.EmptyList;
cljs.core.List.EMPTY = new cljs.core.EmptyList(null);
cljs.core.reversible_QMARK_ = function reversible_QMARK_(coll) {
  var G__7220__7221 = coll;
  if(G__7220__7221) {
    if(function() {
      var or__3824__auto____7222 = G__7220__7221.cljs$lang$protocol_mask$partition0$ & 134217728;
      if(or__3824__auto____7222) {
        return or__3824__auto____7222
      }else {
        return G__7220__7221.cljs$core$IReversible$
      }
    }()) {
      return true
    }else {
      if(!G__7220__7221.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IReversible, G__7220__7221)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IReversible, G__7220__7221)
  }
};
cljs.core.rseq = function rseq(coll) {
  return cljs.core._rseq.call(null, coll)
};
cljs.core.reverse = function reverse(coll) {
  if(cljs.core.reversible_QMARK_.call(null, coll)) {
    return cljs.core.rseq.call(null, coll)
  }else {
    return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, coll)
  }
};
cljs.core.list = function() {
  var list = null;
  var list__0 = function() {
    return cljs.core.List.EMPTY
  };
  var list__1 = function(x) {
    return cljs.core.conj.call(null, cljs.core.List.EMPTY, x)
  };
  var list__2 = function(x, y) {
    return cljs.core.conj.call(null, list.call(null, y), x)
  };
  var list__3 = function(x, y, z) {
    return cljs.core.conj.call(null, list.call(null, y, z), x)
  };
  var list__4 = function() {
    var G__7223__delegate = function(x, y, z, items) {
      return cljs.core.conj.call(null, cljs.core.conj.call(null, cljs.core.conj.call(null, cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, cljs.core.reverse.call(null, items)), z), y), x)
    };
    var G__7223 = function(x, y, z, var_args) {
      var items = null;
      if(goog.isDef(var_args)) {
        items = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__7223__delegate.call(this, x, y, z, items)
    };
    G__7223.cljs$lang$maxFixedArity = 3;
    G__7223.cljs$lang$applyTo = function(arglist__7224) {
      var x = cljs.core.first(arglist__7224);
      var y = cljs.core.first(cljs.core.next(arglist__7224));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7224)));
      var items = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7224)));
      return G__7223__delegate(x, y, z, items)
    };
    G__7223.cljs$lang$arity$variadic = G__7223__delegate;
    return G__7223
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
  return cljs.core.list.call(null, "cljs.core/Cons")
};
cljs.core.Cons.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__7225 = this;
  var h__2192__auto____7226 = this__7225.__hash;
  if(!(h__2192__auto____7226 == null)) {
    return h__2192__auto____7226
  }else {
    var h__2192__auto____7227 = cljs.core.hash_coll.call(null, coll);
    this__7225.__hash = h__2192__auto____7227;
    return h__2192__auto____7227
  }
};
cljs.core.Cons.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__7228 = this;
  if(this__7228.rest == null) {
    return null
  }else {
    return cljs.core._seq.call(null, this__7228.rest)
  }
};
cljs.core.Cons.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__7229 = this;
  return new cljs.core.Cons(null, o, coll, this__7229.__hash)
};
cljs.core.Cons.prototype.toString = function() {
  var this__7230 = this;
  var this__7231 = this;
  return cljs.core.pr_str.call(null, this__7231)
};
cljs.core.Cons.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__7232 = this;
  return coll
};
cljs.core.Cons.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__7233 = this;
  return this__7233.first
};
cljs.core.Cons.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__7234 = this;
  if(this__7234.rest == null) {
    return cljs.core.List.EMPTY
  }else {
    return this__7234.rest
  }
};
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__7235 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__7236 = this;
  return new cljs.core.Cons(meta, this__7236.first, this__7236.rest, this__7236.__hash)
};
cljs.core.Cons.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__7237 = this;
  return this__7237.meta
};
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__7238 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__7238.meta)
};
cljs.core.Cons;
cljs.core.cons = function cons(x, coll) {
  if(function() {
    var or__3824__auto____7243 = coll == null;
    if(or__3824__auto____7243) {
      return or__3824__auto____7243
    }else {
      var G__7244__7245 = coll;
      if(G__7244__7245) {
        if(function() {
          var or__3824__auto____7246 = G__7244__7245.cljs$lang$protocol_mask$partition0$ & 64;
          if(or__3824__auto____7246) {
            return or__3824__auto____7246
          }else {
            return G__7244__7245.cljs$core$ISeq$
          }
        }()) {
          return true
        }else {
          if(!G__7244__7245.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__7244__7245)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__7244__7245)
      }
    }
  }()) {
    return new cljs.core.Cons(null, x, coll, null)
  }else {
    return new cljs.core.Cons(null, x, cljs.core.seq.call(null, coll), null)
  }
};
cljs.core.list_QMARK_ = function list_QMARK_(x) {
  var G__7250__7251 = x;
  if(G__7250__7251) {
    if(function() {
      var or__3824__auto____7252 = G__7250__7251.cljs$lang$protocol_mask$partition0$ & 33554432;
      if(or__3824__auto____7252) {
        return or__3824__auto____7252
      }else {
        return G__7250__7251.cljs$core$IList$
      }
    }()) {
      return true
    }else {
      if(!G__7250__7251.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IList, G__7250__7251)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IList, G__7250__7251)
  }
};
cljs.core.IReduce["string"] = true;
cljs.core._reduce["string"] = function() {
  var G__7253 = null;
  var G__7253__2 = function(string, f) {
    return cljs.core.ci_reduce.call(null, string, f)
  };
  var G__7253__3 = function(string, f, start) {
    return cljs.core.ci_reduce.call(null, string, f, start)
  };
  G__7253 = function(string, f, start) {
    switch(arguments.length) {
      case 2:
        return G__7253__2.call(this, string, f);
      case 3:
        return G__7253__3.call(this, string, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7253
}();
cljs.core.ILookup["string"] = true;
cljs.core._lookup["string"] = function() {
  var G__7254 = null;
  var G__7254__2 = function(string, k) {
    return cljs.core._nth.call(null, string, k)
  };
  var G__7254__3 = function(string, k, not_found) {
    return cljs.core._nth.call(null, string, k, not_found)
  };
  G__7254 = function(string, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__7254__2.call(this, string, k);
      case 3:
        return G__7254__3.call(this, string, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7254
}();
cljs.core.IIndexed["string"] = true;
cljs.core._nth["string"] = function() {
  var G__7255 = null;
  var G__7255__2 = function(string, n) {
    if(n < cljs.core._count.call(null, string)) {
      return string.charAt(n)
    }else {
      return null
    }
  };
  var G__7255__3 = function(string, n, not_found) {
    if(n < cljs.core._count.call(null, string)) {
      return string.charAt(n)
    }else {
      return not_found
    }
  };
  G__7255 = function(string, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__7255__2.call(this, string, n);
      case 3:
        return G__7255__3.call(this, string, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7255
}();
cljs.core.ICounted["string"] = true;
cljs.core._count["string"] = function(s) {
  return s.length
};
cljs.core.ISeqable["string"] = true;
cljs.core._seq["string"] = function(string) {
  return cljs.core.prim_seq.call(null, string, 0)
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
  return cljs.core.list.call(null, "cljs.core/Keyword")
};
cljs.core.Keyword.prototype.call = function() {
  var G__7267 = null;
  var G__7267__2 = function(this_sym7258, coll) {
    var this__7260 = this;
    var this_sym7258__7261 = this;
    var ___7262 = this_sym7258__7261;
    if(coll == null) {
      return null
    }else {
      var strobj__7263 = coll.strobj;
      if(strobj__7263 == null) {
        return cljs.core._lookup.call(null, coll, this__7260.k, null)
      }else {
        return strobj__7263[this__7260.k]
      }
    }
  };
  var G__7267__3 = function(this_sym7259, coll, not_found) {
    var this__7260 = this;
    var this_sym7259__7264 = this;
    var ___7265 = this_sym7259__7264;
    if(coll == null) {
      return not_found
    }else {
      return cljs.core._lookup.call(null, coll, this__7260.k, not_found)
    }
  };
  G__7267 = function(this_sym7259, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__7267__2.call(this, this_sym7259, coll);
      case 3:
        return G__7267__3.call(this, this_sym7259, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7267
}();
cljs.core.Keyword.prototype.apply = function(this_sym7256, args7257) {
  var this__7266 = this;
  return this_sym7256.call.apply(this_sym7256, [this_sym7256].concat(args7257.slice()))
};
cljs.core.Keyword;
String.prototype.cljs$core$IFn$ = true;
String.prototype.call = function() {
  var G__7276 = null;
  var G__7276__2 = function(this_sym7270, coll) {
    var this_sym7270__7272 = this;
    var this__7273 = this_sym7270__7272;
    return cljs.core._lookup.call(null, coll, this__7273.toString(), null)
  };
  var G__7276__3 = function(this_sym7271, coll, not_found) {
    var this_sym7271__7274 = this;
    var this__7275 = this_sym7271__7274;
    return cljs.core._lookup.call(null, coll, this__7275.toString(), not_found)
  };
  G__7276 = function(this_sym7271, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__7276__2.call(this, this_sym7271, coll);
      case 3:
        return G__7276__3.call(this, this_sym7271, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7276
}();
String.prototype.apply = function(this_sym7268, args7269) {
  return this_sym7268.call.apply(this_sym7268, [this_sym7268].concat(args7269.slice()))
};
String.prototype.apply = function(s, args) {
  if(cljs.core.count.call(null, args) < 2) {
    return cljs.core._lookup.call(null, args[0], s, null)
  }else {
    return cljs.core._lookup.call(null, args[0], s, args[1])
  }
};
cljs.core.lazy_seq_value = function lazy_seq_value(lazy_seq) {
  var x__7278 = lazy_seq.x;
  if(lazy_seq.realized) {
    return x__7278
  }else {
    lazy_seq.x = x__7278.call(null);
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
  return cljs.core.list.call(null, "cljs.core/LazySeq")
};
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__7279 = this;
  var h__2192__auto____7280 = this__7279.__hash;
  if(!(h__2192__auto____7280 == null)) {
    return h__2192__auto____7280
  }else {
    var h__2192__auto____7281 = cljs.core.hash_coll.call(null, coll);
    this__7279.__hash = h__2192__auto____7281;
    return h__2192__auto____7281
  }
};
cljs.core.LazySeq.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__7282 = this;
  return cljs.core._seq.call(null, coll.cljs$core$ISeq$_rest$arity$1(coll))
};
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__7283 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.LazySeq.prototype.toString = function() {
  var this__7284 = this;
  var this__7285 = this;
  return cljs.core.pr_str.call(null, this__7285)
};
cljs.core.LazySeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__7286 = this;
  return cljs.core.seq.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__7287 = this;
  return cljs.core.first.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__7288 = this;
  return cljs.core.rest.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__7289 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__7290 = this;
  return new cljs.core.LazySeq(meta, this__7290.realized, this__7290.x, this__7290.__hash)
};
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__7291 = this;
  return this__7291.meta
};
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__7292 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__7292.meta)
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
  return cljs.core.list.call(null, "cljs.core/ChunkBuffer")
};
cljs.core.ChunkBuffer.prototype.cljs$core$ICounted$_count$arity$1 = function(_) {
  var this__7293 = this;
  return this__7293.end
};
cljs.core.ChunkBuffer.prototype.add = function(o) {
  var this__7294 = this;
  var ___7295 = this;
  this__7294.buf[this__7294.end] = o;
  return this__7294.end = this__7294.end + 1
};
cljs.core.ChunkBuffer.prototype.chunk = function(o) {
  var this__7296 = this;
  var ___7297 = this;
  var ret__7298 = new cljs.core.ArrayChunk(this__7296.buf, 0, this__7296.end);
  this__7296.buf = null;
  return ret__7298
};
cljs.core.ChunkBuffer;
cljs.core.chunk_buffer = function chunk_buffer(capacity) {
  return new cljs.core.ChunkBuffer(cljs.core.make_array.call(null, capacity), 0)
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
  return cljs.core.list.call(null, "cljs.core/ArrayChunk")
};
cljs.core.ArrayChunk.prototype.cljs$core$IReduce$_reduce$arity$2 = function(coll, f) {
  var this__7299 = this;
  return cljs.core.ci_reduce.call(null, coll, f, this__7299.arr[this__7299.off], this__7299.off + 1)
};
cljs.core.ArrayChunk.prototype.cljs$core$IReduce$_reduce$arity$3 = function(coll, f, start) {
  var this__7300 = this;
  return cljs.core.ci_reduce.call(null, coll, f, start, this__7300.off)
};
cljs.core.ArrayChunk.prototype.cljs$core$IChunk$ = true;
cljs.core.ArrayChunk.prototype.cljs$core$IChunk$_drop_first$arity$1 = function(coll) {
  var this__7301 = this;
  if(this__7301.off === this__7301.end) {
    throw new Error("-drop-first of empty chunk");
  }else {
    return new cljs.core.ArrayChunk(this__7301.arr, this__7301.off + 1, this__7301.end)
  }
};
cljs.core.ArrayChunk.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, i) {
  var this__7302 = this;
  return this__7302.arr[this__7302.off + i]
};
cljs.core.ArrayChunk.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, i, not_found) {
  var this__7303 = this;
  if(function() {
    var and__3822__auto____7304 = i >= 0;
    if(and__3822__auto____7304) {
      return i < this__7303.end - this__7303.off
    }else {
      return and__3822__auto____7304
    }
  }()) {
    return this__7303.arr[this__7303.off + i]
  }else {
    return not_found
  }
};
cljs.core.ArrayChunk.prototype.cljs$core$ICounted$_count$arity$1 = function(_) {
  var this__7305 = this;
  return this__7305.end - this__7305.off
};
cljs.core.ArrayChunk;
cljs.core.array_chunk = function() {
  var array_chunk = null;
  var array_chunk__1 = function(arr) {
    return array_chunk.call(null, arr, 0, arr.length)
  };
  var array_chunk__2 = function(arr, off) {
    return array_chunk.call(null, arr, off, arr.length)
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
  return cljs.core.list.call(null, "cljs.core/ChunkedCons")
};
cljs.core.ChunkedCons.prototype.cljs$core$ICollection$_conj$arity$2 = function(this$, o) {
  var this__7306 = this;
  return cljs.core.cons.call(null, o, this$)
};
cljs.core.ChunkedCons.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__7307 = this;
  return coll
};
cljs.core.ChunkedCons.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__7308 = this;
  return cljs.core._nth.call(null, this__7308.chunk, 0)
};
cljs.core.ChunkedCons.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__7309 = this;
  if(cljs.core._count.call(null, this__7309.chunk) > 1) {
    return new cljs.core.ChunkedCons(cljs.core._drop_first.call(null, this__7309.chunk), this__7309.more, this__7309.meta)
  }else {
    if(this__7309.more == null) {
      return cljs.core.List.EMPTY
    }else {
      return this__7309.more
    }
  }
};
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedNext$ = true;
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedNext$_chunked_next$arity$1 = function(coll) {
  var this__7310 = this;
  if(this__7310.more == null) {
    return null
  }else {
    return this__7310.more
  }
};
cljs.core.ChunkedCons.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__7311 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.ChunkedCons.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, m) {
  var this__7312 = this;
  return new cljs.core.ChunkedCons(this__7312.chunk, this__7312.more, m)
};
cljs.core.ChunkedCons.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__7313 = this;
  return this__7313.meta
};
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedSeq$ = true;
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedSeq$_chunked_first$arity$1 = function(coll) {
  var this__7314 = this;
  return this__7314.chunk
};
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedSeq$_chunked_rest$arity$1 = function(coll) {
  var this__7315 = this;
  if(this__7315.more == null) {
    return cljs.core.List.EMPTY
  }else {
    return this__7315.more
  }
};
cljs.core.ChunkedCons;
cljs.core.chunk_cons = function chunk_cons(chunk, rest) {
  if(cljs.core._count.call(null, chunk) === 0) {
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
  return cljs.core._chunked_first.call(null, s)
};
cljs.core.chunk_rest = function chunk_rest(s) {
  return cljs.core._chunked_rest.call(null, s)
};
cljs.core.chunk_next = function chunk_next(s) {
  if(function() {
    var G__7319__7320 = s;
    if(G__7319__7320) {
      if(cljs.core.truth_(function() {
        var or__3824__auto____7321 = null;
        if(cljs.core.truth_(or__3824__auto____7321)) {
          return or__3824__auto____7321
        }else {
          return G__7319__7320.cljs$core$IChunkedNext$
        }
      }())) {
        return true
      }else {
        if(!G__7319__7320.cljs$lang$protocol_mask$partition$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IChunkedNext, G__7319__7320)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IChunkedNext, G__7319__7320)
    }
  }()) {
    return cljs.core._chunked_next.call(null, s)
  }else {
    return cljs.core.seq.call(null, cljs.core._chunked_rest.call(null, s))
  }
};
cljs.core.to_array = function to_array(s) {
  var ary__7324 = [];
  var s__7325 = s;
  while(true) {
    if(cljs.core.seq.call(null, s__7325)) {
      ary__7324.push(cljs.core.first.call(null, s__7325));
      var G__7326 = cljs.core.next.call(null, s__7325);
      s__7325 = G__7326;
      continue
    }else {
      return ary__7324
    }
    break
  }
};
cljs.core.to_array_2d = function to_array_2d(coll) {
  var ret__7330 = cljs.core.make_array.call(null, cljs.core.count.call(null, coll));
  var i__7331 = 0;
  var xs__7332 = cljs.core.seq.call(null, coll);
  while(true) {
    if(xs__7332) {
      ret__7330[i__7331] = cljs.core.to_array.call(null, cljs.core.first.call(null, xs__7332));
      var G__7333 = i__7331 + 1;
      var G__7334 = cljs.core.next.call(null, xs__7332);
      i__7331 = G__7333;
      xs__7332 = G__7334;
      continue
    }else {
    }
    break
  }
  return ret__7330
};
cljs.core.long_array = function() {
  var long_array = null;
  var long_array__1 = function(size_or_seq) {
    if(cljs.core.number_QMARK_.call(null, size_or_seq)) {
      return long_array.call(null, size_or_seq, null)
    }else {
      if(cljs.core.seq_QMARK_.call(null, size_or_seq)) {
        return cljs.core.into_array.call(null, size_or_seq)
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
    var a__7342 = cljs.core.make_array.call(null, size);
    if(cljs.core.seq_QMARK_.call(null, init_val_or_seq)) {
      var s__7343 = cljs.core.seq.call(null, init_val_or_seq);
      var i__7344 = 0;
      var s__7345 = s__7343;
      while(true) {
        if(cljs.core.truth_(function() {
          var and__3822__auto____7346 = s__7345;
          if(and__3822__auto____7346) {
            return i__7344 < size
          }else {
            return and__3822__auto____7346
          }
        }())) {
          a__7342[i__7344] = cljs.core.first.call(null, s__7345);
          var G__7349 = i__7344 + 1;
          var G__7350 = cljs.core.next.call(null, s__7345);
          i__7344 = G__7349;
          s__7345 = G__7350;
          continue
        }else {
          return a__7342
        }
        break
      }
    }else {
      var n__2527__auto____7347 = size;
      var i__7348 = 0;
      while(true) {
        if(i__7348 < n__2527__auto____7347) {
          a__7342[i__7348] = init_val_or_seq;
          var G__7351 = i__7348 + 1;
          i__7348 = G__7351;
          continue
        }else {
        }
        break
      }
      return a__7342
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
    if(cljs.core.number_QMARK_.call(null, size_or_seq)) {
      return double_array.call(null, size_or_seq, null)
    }else {
      if(cljs.core.seq_QMARK_.call(null, size_or_seq)) {
        return cljs.core.into_array.call(null, size_or_seq)
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
    var a__7359 = cljs.core.make_array.call(null, size);
    if(cljs.core.seq_QMARK_.call(null, init_val_or_seq)) {
      var s__7360 = cljs.core.seq.call(null, init_val_or_seq);
      var i__7361 = 0;
      var s__7362 = s__7360;
      while(true) {
        if(cljs.core.truth_(function() {
          var and__3822__auto____7363 = s__7362;
          if(and__3822__auto____7363) {
            return i__7361 < size
          }else {
            return and__3822__auto____7363
          }
        }())) {
          a__7359[i__7361] = cljs.core.first.call(null, s__7362);
          var G__7366 = i__7361 + 1;
          var G__7367 = cljs.core.next.call(null, s__7362);
          i__7361 = G__7366;
          s__7362 = G__7367;
          continue
        }else {
          return a__7359
        }
        break
      }
    }else {
      var n__2527__auto____7364 = size;
      var i__7365 = 0;
      while(true) {
        if(i__7365 < n__2527__auto____7364) {
          a__7359[i__7365] = init_val_or_seq;
          var G__7368 = i__7365 + 1;
          i__7365 = G__7368;
          continue
        }else {
        }
        break
      }
      return a__7359
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
    if(cljs.core.number_QMARK_.call(null, size_or_seq)) {
      return object_array.call(null, size_or_seq, null)
    }else {
      if(cljs.core.seq_QMARK_.call(null, size_or_seq)) {
        return cljs.core.into_array.call(null, size_or_seq)
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
    var a__7376 = cljs.core.make_array.call(null, size);
    if(cljs.core.seq_QMARK_.call(null, init_val_or_seq)) {
      var s__7377 = cljs.core.seq.call(null, init_val_or_seq);
      var i__7378 = 0;
      var s__7379 = s__7377;
      while(true) {
        if(cljs.core.truth_(function() {
          var and__3822__auto____7380 = s__7379;
          if(and__3822__auto____7380) {
            return i__7378 < size
          }else {
            return and__3822__auto____7380
          }
        }())) {
          a__7376[i__7378] = cljs.core.first.call(null, s__7379);
          var G__7383 = i__7378 + 1;
          var G__7384 = cljs.core.next.call(null, s__7379);
          i__7378 = G__7383;
          s__7379 = G__7384;
          continue
        }else {
          return a__7376
        }
        break
      }
    }else {
      var n__2527__auto____7381 = size;
      var i__7382 = 0;
      while(true) {
        if(i__7382 < n__2527__auto____7381) {
          a__7376[i__7382] = init_val_or_seq;
          var G__7385 = i__7382 + 1;
          i__7382 = G__7385;
          continue
        }else {
        }
        break
      }
      return a__7376
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
  if(cljs.core.counted_QMARK_.call(null, s)) {
    return cljs.core.count.call(null, s)
  }else {
    var s__7390 = s;
    var i__7391 = n;
    var sum__7392 = 0;
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3822__auto____7393 = i__7391 > 0;
        if(and__3822__auto____7393) {
          return cljs.core.seq.call(null, s__7390)
        }else {
          return and__3822__auto____7393
        }
      }())) {
        var G__7394 = cljs.core.next.call(null, s__7390);
        var G__7395 = i__7391 - 1;
        var G__7396 = sum__7392 + 1;
        s__7390 = G__7394;
        i__7391 = G__7395;
        sum__7392 = G__7396;
        continue
      }else {
        return sum__7392
      }
      break
    }
  }
};
cljs.core.spread = function spread(arglist) {
  if(arglist == null) {
    return null
  }else {
    if(cljs.core.next.call(null, arglist) == null) {
      return cljs.core.seq.call(null, cljs.core.first.call(null, arglist))
    }else {
      if("\ufdd0'else") {
        return cljs.core.cons.call(null, cljs.core.first.call(null, arglist), spread.call(null, cljs.core.next.call(null, arglist)))
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
      var s__7401 = cljs.core.seq.call(null, x);
      if(s__7401) {
        if(cljs.core.chunked_seq_QMARK_.call(null, s__7401)) {
          return cljs.core.chunk_cons.call(null, cljs.core.chunk_first.call(null, s__7401), concat.call(null, cljs.core.chunk_rest.call(null, s__7401), y))
        }else {
          return cljs.core.cons.call(null, cljs.core.first.call(null, s__7401), concat.call(null, cljs.core.rest.call(null, s__7401), y))
        }
      }else {
        return y
      }
    }, null)
  };
  var concat__3 = function() {
    var G__7405__delegate = function(x, y, zs) {
      var cat__7404 = function cat(xys, zs) {
        return new cljs.core.LazySeq(null, false, function() {
          var xys__7403 = cljs.core.seq.call(null, xys);
          if(xys__7403) {
            if(cljs.core.chunked_seq_QMARK_.call(null, xys__7403)) {
              return cljs.core.chunk_cons.call(null, cljs.core.chunk_first.call(null, xys__7403), cat.call(null, cljs.core.chunk_rest.call(null, xys__7403), zs))
            }else {
              return cljs.core.cons.call(null, cljs.core.first.call(null, xys__7403), cat.call(null, cljs.core.rest.call(null, xys__7403), zs))
            }
          }else {
            if(cljs.core.truth_(zs)) {
              return cat.call(null, cljs.core.first.call(null, zs), cljs.core.next.call(null, zs))
            }else {
              return null
            }
          }
        }, null)
      };
      return cat__7404.call(null, concat.call(null, x, y), zs)
    };
    var G__7405 = function(x, y, var_args) {
      var zs = null;
      if(goog.isDef(var_args)) {
        zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7405__delegate.call(this, x, y, zs)
    };
    G__7405.cljs$lang$maxFixedArity = 2;
    G__7405.cljs$lang$applyTo = function(arglist__7406) {
      var x = cljs.core.first(arglist__7406);
      var y = cljs.core.first(cljs.core.next(arglist__7406));
      var zs = cljs.core.rest(cljs.core.next(arglist__7406));
      return G__7405__delegate(x, y, zs)
    };
    G__7405.cljs$lang$arity$variadic = G__7405__delegate;
    return G__7405
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
    return cljs.core.seq.call(null, args)
  };
  var list_STAR___2 = function(a, args) {
    return cljs.core.cons.call(null, a, args)
  };
  var list_STAR___3 = function(a, b, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, args))
  };
  var list_STAR___4 = function(a, b, c, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, args)))
  };
  var list_STAR___5 = function() {
    var G__7407__delegate = function(a, b, c, d, more) {
      return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, more)))))
    };
    var G__7407 = function(a, b, c, d, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__7407__delegate.call(this, a, b, c, d, more)
    };
    G__7407.cljs$lang$maxFixedArity = 4;
    G__7407.cljs$lang$applyTo = function(arglist__7408) {
      var a = cljs.core.first(arglist__7408);
      var b = cljs.core.first(cljs.core.next(arglist__7408));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7408)));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7408))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7408))));
      return G__7407__delegate(a, b, c, d, more)
    };
    G__7407.cljs$lang$arity$variadic = G__7407__delegate;
    return G__7407
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
  return cljs.core._as_transient.call(null, coll)
};
cljs.core.persistent_BANG_ = function persistent_BANG_(tcoll) {
  return cljs.core._persistent_BANG_.call(null, tcoll)
};
cljs.core.conj_BANG_ = function conj_BANG_(tcoll, val) {
  return cljs.core._conj_BANG_.call(null, tcoll, val)
};
cljs.core.assoc_BANG_ = function assoc_BANG_(tcoll, key, val) {
  return cljs.core._assoc_BANG_.call(null, tcoll, key, val)
};
cljs.core.dissoc_BANG_ = function dissoc_BANG_(tcoll, key) {
  return cljs.core._dissoc_BANG_.call(null, tcoll, key)
};
cljs.core.pop_BANG_ = function pop_BANG_(tcoll) {
  return cljs.core._pop_BANG_.call(null, tcoll)
};
cljs.core.disj_BANG_ = function disj_BANG_(tcoll, val) {
  return cljs.core._disjoin_BANG_.call(null, tcoll, val)
};
cljs.core.apply_to = function apply_to(f, argc, args) {
  var args__7450 = cljs.core.seq.call(null, args);
  if(argc === 0) {
    return f.call(null)
  }else {
    var a__7451 = cljs.core._first.call(null, args__7450);
    var args__7452 = cljs.core._rest.call(null, args__7450);
    if(argc === 1) {
      if(f.cljs$lang$arity$1) {
        return f.cljs$lang$arity$1(a__7451)
      }else {
        return f.call(null, a__7451)
      }
    }else {
      var b__7453 = cljs.core._first.call(null, args__7452);
      var args__7454 = cljs.core._rest.call(null, args__7452);
      if(argc === 2) {
        if(f.cljs$lang$arity$2) {
          return f.cljs$lang$arity$2(a__7451, b__7453)
        }else {
          return f.call(null, a__7451, b__7453)
        }
      }else {
        var c__7455 = cljs.core._first.call(null, args__7454);
        var args__7456 = cljs.core._rest.call(null, args__7454);
        if(argc === 3) {
          if(f.cljs$lang$arity$3) {
            return f.cljs$lang$arity$3(a__7451, b__7453, c__7455)
          }else {
            return f.call(null, a__7451, b__7453, c__7455)
          }
        }else {
          var d__7457 = cljs.core._first.call(null, args__7456);
          var args__7458 = cljs.core._rest.call(null, args__7456);
          if(argc === 4) {
            if(f.cljs$lang$arity$4) {
              return f.cljs$lang$arity$4(a__7451, b__7453, c__7455, d__7457)
            }else {
              return f.call(null, a__7451, b__7453, c__7455, d__7457)
            }
          }else {
            var e__7459 = cljs.core._first.call(null, args__7458);
            var args__7460 = cljs.core._rest.call(null, args__7458);
            if(argc === 5) {
              if(f.cljs$lang$arity$5) {
                return f.cljs$lang$arity$5(a__7451, b__7453, c__7455, d__7457, e__7459)
              }else {
                return f.call(null, a__7451, b__7453, c__7455, d__7457, e__7459)
              }
            }else {
              var f__7461 = cljs.core._first.call(null, args__7460);
              var args__7462 = cljs.core._rest.call(null, args__7460);
              if(argc === 6) {
                if(f__7461.cljs$lang$arity$6) {
                  return f__7461.cljs$lang$arity$6(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461)
                }else {
                  return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461)
                }
              }else {
                var g__7463 = cljs.core._first.call(null, args__7462);
                var args__7464 = cljs.core._rest.call(null, args__7462);
                if(argc === 7) {
                  if(f__7461.cljs$lang$arity$7) {
                    return f__7461.cljs$lang$arity$7(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463)
                  }else {
                    return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463)
                  }
                }else {
                  var h__7465 = cljs.core._first.call(null, args__7464);
                  var args__7466 = cljs.core._rest.call(null, args__7464);
                  if(argc === 8) {
                    if(f__7461.cljs$lang$arity$8) {
                      return f__7461.cljs$lang$arity$8(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465)
                    }else {
                      return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465)
                    }
                  }else {
                    var i__7467 = cljs.core._first.call(null, args__7466);
                    var args__7468 = cljs.core._rest.call(null, args__7466);
                    if(argc === 9) {
                      if(f__7461.cljs$lang$arity$9) {
                        return f__7461.cljs$lang$arity$9(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467)
                      }else {
                        return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467)
                      }
                    }else {
                      var j__7469 = cljs.core._first.call(null, args__7468);
                      var args__7470 = cljs.core._rest.call(null, args__7468);
                      if(argc === 10) {
                        if(f__7461.cljs$lang$arity$10) {
                          return f__7461.cljs$lang$arity$10(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469)
                        }else {
                          return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469)
                        }
                      }else {
                        var k__7471 = cljs.core._first.call(null, args__7470);
                        var args__7472 = cljs.core._rest.call(null, args__7470);
                        if(argc === 11) {
                          if(f__7461.cljs$lang$arity$11) {
                            return f__7461.cljs$lang$arity$11(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471)
                          }else {
                            return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471)
                          }
                        }else {
                          var l__7473 = cljs.core._first.call(null, args__7472);
                          var args__7474 = cljs.core._rest.call(null, args__7472);
                          if(argc === 12) {
                            if(f__7461.cljs$lang$arity$12) {
                              return f__7461.cljs$lang$arity$12(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473)
                            }else {
                              return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473)
                            }
                          }else {
                            var m__7475 = cljs.core._first.call(null, args__7474);
                            var args__7476 = cljs.core._rest.call(null, args__7474);
                            if(argc === 13) {
                              if(f__7461.cljs$lang$arity$13) {
                                return f__7461.cljs$lang$arity$13(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475)
                              }else {
                                return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475)
                              }
                            }else {
                              var n__7477 = cljs.core._first.call(null, args__7476);
                              var args__7478 = cljs.core._rest.call(null, args__7476);
                              if(argc === 14) {
                                if(f__7461.cljs$lang$arity$14) {
                                  return f__7461.cljs$lang$arity$14(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477)
                                }else {
                                  return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477)
                                }
                              }else {
                                var o__7479 = cljs.core._first.call(null, args__7478);
                                var args__7480 = cljs.core._rest.call(null, args__7478);
                                if(argc === 15) {
                                  if(f__7461.cljs$lang$arity$15) {
                                    return f__7461.cljs$lang$arity$15(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477, o__7479)
                                  }else {
                                    return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477, o__7479)
                                  }
                                }else {
                                  var p__7481 = cljs.core._first.call(null, args__7480);
                                  var args__7482 = cljs.core._rest.call(null, args__7480);
                                  if(argc === 16) {
                                    if(f__7461.cljs$lang$arity$16) {
                                      return f__7461.cljs$lang$arity$16(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477, o__7479, p__7481)
                                    }else {
                                      return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477, o__7479, p__7481)
                                    }
                                  }else {
                                    var q__7483 = cljs.core._first.call(null, args__7482);
                                    var args__7484 = cljs.core._rest.call(null, args__7482);
                                    if(argc === 17) {
                                      if(f__7461.cljs$lang$arity$17) {
                                        return f__7461.cljs$lang$arity$17(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477, o__7479, p__7481, q__7483)
                                      }else {
                                        return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477, o__7479, p__7481, q__7483)
                                      }
                                    }else {
                                      var r__7485 = cljs.core._first.call(null, args__7484);
                                      var args__7486 = cljs.core._rest.call(null, args__7484);
                                      if(argc === 18) {
                                        if(f__7461.cljs$lang$arity$18) {
                                          return f__7461.cljs$lang$arity$18(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477, o__7479, p__7481, q__7483, r__7485)
                                        }else {
                                          return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477, o__7479, p__7481, q__7483, r__7485)
                                        }
                                      }else {
                                        var s__7487 = cljs.core._first.call(null, args__7486);
                                        var args__7488 = cljs.core._rest.call(null, args__7486);
                                        if(argc === 19) {
                                          if(f__7461.cljs$lang$arity$19) {
                                            return f__7461.cljs$lang$arity$19(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477, o__7479, p__7481, q__7483, r__7485, s__7487)
                                          }else {
                                            return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477, o__7479, p__7481, q__7483, r__7485, s__7487)
                                          }
                                        }else {
                                          var t__7489 = cljs.core._first.call(null, args__7488);
                                          var args__7490 = cljs.core._rest.call(null, args__7488);
                                          if(argc === 20) {
                                            if(f__7461.cljs$lang$arity$20) {
                                              return f__7461.cljs$lang$arity$20(a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477, o__7479, p__7481, q__7483, r__7485, s__7487, t__7489)
                                            }else {
                                              return f__7461.call(null, a__7451, b__7453, c__7455, d__7457, e__7459, f__7461, g__7463, h__7465, i__7467, j__7469, k__7471, l__7473, m__7475, n__7477, o__7479, p__7481, q__7483, r__7485, s__7487, t__7489)
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
    var fixed_arity__7505 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__7506 = cljs.core.bounded_count.call(null, args, fixed_arity__7505 + 1);
      if(bc__7506 <= fixed_arity__7505) {
        return cljs.core.apply_to.call(null, f, bc__7506, args)
      }else {
        return f.cljs$lang$applyTo(args)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, args))
    }
  };
  var apply__3 = function(f, x, args) {
    var arglist__7507 = cljs.core.list_STAR_.call(null, x, args);
    var fixed_arity__7508 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__7509 = cljs.core.bounded_count.call(null, arglist__7507, fixed_arity__7508 + 1);
      if(bc__7509 <= fixed_arity__7508) {
        return cljs.core.apply_to.call(null, f, bc__7509, arglist__7507)
      }else {
        return f.cljs$lang$applyTo(arglist__7507)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__7507))
    }
  };
  var apply__4 = function(f, x, y, args) {
    var arglist__7510 = cljs.core.list_STAR_.call(null, x, y, args);
    var fixed_arity__7511 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__7512 = cljs.core.bounded_count.call(null, arglist__7510, fixed_arity__7511 + 1);
      if(bc__7512 <= fixed_arity__7511) {
        return cljs.core.apply_to.call(null, f, bc__7512, arglist__7510)
      }else {
        return f.cljs$lang$applyTo(arglist__7510)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__7510))
    }
  };
  var apply__5 = function(f, x, y, z, args) {
    var arglist__7513 = cljs.core.list_STAR_.call(null, x, y, z, args);
    var fixed_arity__7514 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__7515 = cljs.core.bounded_count.call(null, arglist__7513, fixed_arity__7514 + 1);
      if(bc__7515 <= fixed_arity__7514) {
        return cljs.core.apply_to.call(null, f, bc__7515, arglist__7513)
      }else {
        return f.cljs$lang$applyTo(arglist__7513)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__7513))
    }
  };
  var apply__6 = function() {
    var G__7519__delegate = function(f, a, b, c, d, args) {
      var arglist__7516 = cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, args)))));
      var fixed_arity__7517 = f.cljs$lang$maxFixedArity;
      if(cljs.core.truth_(f.cljs$lang$applyTo)) {
        var bc__7518 = cljs.core.bounded_count.call(null, arglist__7516, fixed_arity__7517 + 1);
        if(bc__7518 <= fixed_arity__7517) {
          return cljs.core.apply_to.call(null, f, bc__7518, arglist__7516)
        }else {
          return f.cljs$lang$applyTo(arglist__7516)
        }
      }else {
        return f.apply(f, cljs.core.to_array.call(null, arglist__7516))
      }
    };
    var G__7519 = function(f, a, b, c, d, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__7519__delegate.call(this, f, a, b, c, d, args)
    };
    G__7519.cljs$lang$maxFixedArity = 5;
    G__7519.cljs$lang$applyTo = function(arglist__7520) {
      var f = cljs.core.first(arglist__7520);
      var a = cljs.core.first(cljs.core.next(arglist__7520));
      var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7520)));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7520))));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7520)))));
      var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7520)))));
      return G__7519__delegate(f, a, b, c, d, args)
    };
    G__7519.cljs$lang$arity$variadic = G__7519__delegate;
    return G__7519
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
    return cljs.core.with_meta.call(null, obj, cljs.core.apply.call(null, f, cljs.core.meta.call(null, obj), args))
  };
  var vary_meta = function(obj, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return vary_meta__delegate.call(this, obj, f, args)
  };
  vary_meta.cljs$lang$maxFixedArity = 2;
  vary_meta.cljs$lang$applyTo = function(arglist__7521) {
    var obj = cljs.core.first(arglist__7521);
    var f = cljs.core.first(cljs.core.next(arglist__7521));
    var args = cljs.core.rest(cljs.core.next(arglist__7521));
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
    return!cljs.core._EQ_.call(null, x, y)
  };
  var not_EQ___3 = function() {
    var G__7522__delegate = function(x, y, more) {
      return cljs.core.not.call(null, cljs.core.apply.call(null, cljs.core._EQ_, x, y, more))
    };
    var G__7522 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7522__delegate.call(this, x, y, more)
    };
    G__7522.cljs$lang$maxFixedArity = 2;
    G__7522.cljs$lang$applyTo = function(arglist__7523) {
      var x = cljs.core.first(arglist__7523);
      var y = cljs.core.first(cljs.core.next(arglist__7523));
      var more = cljs.core.rest(cljs.core.next(arglist__7523));
      return G__7522__delegate(x, y, more)
    };
    G__7522.cljs$lang$arity$variadic = G__7522__delegate;
    return G__7522
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
  if(cljs.core.seq.call(null, coll)) {
    return coll
  }else {
    return null
  }
};
cljs.core.every_QMARK_ = function every_QMARK_(pred, coll) {
  while(true) {
    if(cljs.core.seq.call(null, coll) == null) {
      return true
    }else {
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, coll)))) {
        var G__7524 = pred;
        var G__7525 = cljs.core.next.call(null, coll);
        pred = G__7524;
        coll = G__7525;
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
  return!cljs.core.every_QMARK_.call(null, pred, coll)
};
cljs.core.some = function some(pred, coll) {
  while(true) {
    if(cljs.core.seq.call(null, coll)) {
      var or__3824__auto____7527 = pred.call(null, cljs.core.first.call(null, coll));
      if(cljs.core.truth_(or__3824__auto____7527)) {
        return or__3824__auto____7527
      }else {
        var G__7528 = pred;
        var G__7529 = cljs.core.next.call(null, coll);
        pred = G__7528;
        coll = G__7529;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.not_any_QMARK_ = function not_any_QMARK_(pred, coll) {
  return cljs.core.not.call(null, cljs.core.some.call(null, pred, coll))
};
cljs.core.even_QMARK_ = function even_QMARK_(n) {
  if(cljs.core.integer_QMARK_.call(null, n)) {
    return(n & 1) === 0
  }else {
    throw new Error([cljs.core.str("Argument must be an integer: "), cljs.core.str(n)].join(""));
  }
};
cljs.core.odd_QMARK_ = function odd_QMARK_(n) {
  return!cljs.core.even_QMARK_.call(null, n)
};
cljs.core.identity = function identity(x) {
  return x
};
cljs.core.complement = function complement(f) {
  return function() {
    var G__7530 = null;
    var G__7530__0 = function() {
      return cljs.core.not.call(null, f.call(null))
    };
    var G__7530__1 = function(x) {
      return cljs.core.not.call(null, f.call(null, x))
    };
    var G__7530__2 = function(x, y) {
      return cljs.core.not.call(null, f.call(null, x, y))
    };
    var G__7530__3 = function() {
      var G__7531__delegate = function(x, y, zs) {
        return cljs.core.not.call(null, cljs.core.apply.call(null, f, x, y, zs))
      };
      var G__7531 = function(x, y, var_args) {
        var zs = null;
        if(goog.isDef(var_args)) {
          zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
        }
        return G__7531__delegate.call(this, x, y, zs)
      };
      G__7531.cljs$lang$maxFixedArity = 2;
      G__7531.cljs$lang$applyTo = function(arglist__7532) {
        var x = cljs.core.first(arglist__7532);
        var y = cljs.core.first(cljs.core.next(arglist__7532));
        var zs = cljs.core.rest(cljs.core.next(arglist__7532));
        return G__7531__delegate(x, y, zs)
      };
      G__7531.cljs$lang$arity$variadic = G__7531__delegate;
      return G__7531
    }();
    G__7530 = function(x, y, var_args) {
      var zs = var_args;
      switch(arguments.length) {
        case 0:
          return G__7530__0.call(this);
        case 1:
          return G__7530__1.call(this, x);
        case 2:
          return G__7530__2.call(this, x, y);
        default:
          return G__7530__3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
      }
      throw"Invalid arity: " + arguments.length;
    };
    G__7530.cljs$lang$maxFixedArity = 2;
    G__7530.cljs$lang$applyTo = G__7530__3.cljs$lang$applyTo;
    return G__7530
  }()
};
cljs.core.constantly = function constantly(x) {
  return function() {
    var G__7533__delegate = function(args) {
      return x
    };
    var G__7533 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__7533__delegate.call(this, args)
    };
    G__7533.cljs$lang$maxFixedArity = 0;
    G__7533.cljs$lang$applyTo = function(arglist__7534) {
      var args = cljs.core.seq(arglist__7534);
      return G__7533__delegate(args)
    };
    G__7533.cljs$lang$arity$variadic = G__7533__delegate;
    return G__7533
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
      var G__7541 = null;
      var G__7541__0 = function() {
        return f.call(null, g.call(null))
      };
      var G__7541__1 = function(x) {
        return f.call(null, g.call(null, x))
      };
      var G__7541__2 = function(x, y) {
        return f.call(null, g.call(null, x, y))
      };
      var G__7541__3 = function(x, y, z) {
        return f.call(null, g.call(null, x, y, z))
      };
      var G__7541__4 = function() {
        var G__7542__delegate = function(x, y, z, args) {
          return f.call(null, cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__7542 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7542__delegate.call(this, x, y, z, args)
        };
        G__7542.cljs$lang$maxFixedArity = 3;
        G__7542.cljs$lang$applyTo = function(arglist__7543) {
          var x = cljs.core.first(arglist__7543);
          var y = cljs.core.first(cljs.core.next(arglist__7543));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7543)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7543)));
          return G__7542__delegate(x, y, z, args)
        };
        G__7542.cljs$lang$arity$variadic = G__7542__delegate;
        return G__7542
      }();
      G__7541 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__7541__0.call(this);
          case 1:
            return G__7541__1.call(this, x);
          case 2:
            return G__7541__2.call(this, x, y);
          case 3:
            return G__7541__3.call(this, x, y, z);
          default:
            return G__7541__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__7541.cljs$lang$maxFixedArity = 3;
      G__7541.cljs$lang$applyTo = G__7541__4.cljs$lang$applyTo;
      return G__7541
    }()
  };
  var comp__3 = function(f, g, h) {
    return function() {
      var G__7544 = null;
      var G__7544__0 = function() {
        return f.call(null, g.call(null, h.call(null)))
      };
      var G__7544__1 = function(x) {
        return f.call(null, g.call(null, h.call(null, x)))
      };
      var G__7544__2 = function(x, y) {
        return f.call(null, g.call(null, h.call(null, x, y)))
      };
      var G__7544__3 = function(x, y, z) {
        return f.call(null, g.call(null, h.call(null, x, y, z)))
      };
      var G__7544__4 = function() {
        var G__7545__delegate = function(x, y, z, args) {
          return f.call(null, g.call(null, cljs.core.apply.call(null, h, x, y, z, args)))
        };
        var G__7545 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7545__delegate.call(this, x, y, z, args)
        };
        G__7545.cljs$lang$maxFixedArity = 3;
        G__7545.cljs$lang$applyTo = function(arglist__7546) {
          var x = cljs.core.first(arglist__7546);
          var y = cljs.core.first(cljs.core.next(arglist__7546));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7546)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7546)));
          return G__7545__delegate(x, y, z, args)
        };
        G__7545.cljs$lang$arity$variadic = G__7545__delegate;
        return G__7545
      }();
      G__7544 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__7544__0.call(this);
          case 1:
            return G__7544__1.call(this, x);
          case 2:
            return G__7544__2.call(this, x, y);
          case 3:
            return G__7544__3.call(this, x, y, z);
          default:
            return G__7544__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__7544.cljs$lang$maxFixedArity = 3;
      G__7544.cljs$lang$applyTo = G__7544__4.cljs$lang$applyTo;
      return G__7544
    }()
  };
  var comp__4 = function() {
    var G__7547__delegate = function(f1, f2, f3, fs) {
      var fs__7538 = cljs.core.reverse.call(null, cljs.core.list_STAR_.call(null, f1, f2, f3, fs));
      return function() {
        var G__7548__delegate = function(args) {
          var ret__7539 = cljs.core.apply.call(null, cljs.core.first.call(null, fs__7538), args);
          var fs__7540 = cljs.core.next.call(null, fs__7538);
          while(true) {
            if(fs__7540) {
              var G__7549 = cljs.core.first.call(null, fs__7540).call(null, ret__7539);
              var G__7550 = cljs.core.next.call(null, fs__7540);
              ret__7539 = G__7549;
              fs__7540 = G__7550;
              continue
            }else {
              return ret__7539
            }
            break
          }
        };
        var G__7548 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__7548__delegate.call(this, args)
        };
        G__7548.cljs$lang$maxFixedArity = 0;
        G__7548.cljs$lang$applyTo = function(arglist__7551) {
          var args = cljs.core.seq(arglist__7551);
          return G__7548__delegate(args)
        };
        G__7548.cljs$lang$arity$variadic = G__7548__delegate;
        return G__7548
      }()
    };
    var G__7547 = function(f1, f2, f3, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__7547__delegate.call(this, f1, f2, f3, fs)
    };
    G__7547.cljs$lang$maxFixedArity = 3;
    G__7547.cljs$lang$applyTo = function(arglist__7552) {
      var f1 = cljs.core.first(arglist__7552);
      var f2 = cljs.core.first(cljs.core.next(arglist__7552));
      var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7552)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7552)));
      return G__7547__delegate(f1, f2, f3, fs)
    };
    G__7547.cljs$lang$arity$variadic = G__7547__delegate;
    return G__7547
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
      var G__7553__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, args)
      };
      var G__7553 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__7553__delegate.call(this, args)
      };
      G__7553.cljs$lang$maxFixedArity = 0;
      G__7553.cljs$lang$applyTo = function(arglist__7554) {
        var args = cljs.core.seq(arglist__7554);
        return G__7553__delegate(args)
      };
      G__7553.cljs$lang$arity$variadic = G__7553__delegate;
      return G__7553
    }()
  };
  var partial__3 = function(f, arg1, arg2) {
    return function() {
      var G__7555__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, args)
      };
      var G__7555 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__7555__delegate.call(this, args)
      };
      G__7555.cljs$lang$maxFixedArity = 0;
      G__7555.cljs$lang$applyTo = function(arglist__7556) {
        var args = cljs.core.seq(arglist__7556);
        return G__7555__delegate(args)
      };
      G__7555.cljs$lang$arity$variadic = G__7555__delegate;
      return G__7555
    }()
  };
  var partial__4 = function(f, arg1, arg2, arg3) {
    return function() {
      var G__7557__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, arg3, args)
      };
      var G__7557 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__7557__delegate.call(this, args)
      };
      G__7557.cljs$lang$maxFixedArity = 0;
      G__7557.cljs$lang$applyTo = function(arglist__7558) {
        var args = cljs.core.seq(arglist__7558);
        return G__7557__delegate(args)
      };
      G__7557.cljs$lang$arity$variadic = G__7557__delegate;
      return G__7557
    }()
  };
  var partial__5 = function() {
    var G__7559__delegate = function(f, arg1, arg2, arg3, more) {
      return function() {
        var G__7560__delegate = function(args) {
          return cljs.core.apply.call(null, f, arg1, arg2, arg3, cljs.core.concat.call(null, more, args))
        };
        var G__7560 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__7560__delegate.call(this, args)
        };
        G__7560.cljs$lang$maxFixedArity = 0;
        G__7560.cljs$lang$applyTo = function(arglist__7561) {
          var args = cljs.core.seq(arglist__7561);
          return G__7560__delegate(args)
        };
        G__7560.cljs$lang$arity$variadic = G__7560__delegate;
        return G__7560
      }()
    };
    var G__7559 = function(f, arg1, arg2, arg3, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__7559__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    G__7559.cljs$lang$maxFixedArity = 4;
    G__7559.cljs$lang$applyTo = function(arglist__7562) {
      var f = cljs.core.first(arglist__7562);
      var arg1 = cljs.core.first(cljs.core.next(arglist__7562));
      var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7562)));
      var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7562))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7562))));
      return G__7559__delegate(f, arg1, arg2, arg3, more)
    };
    G__7559.cljs$lang$arity$variadic = G__7559__delegate;
    return G__7559
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
      var G__7563 = null;
      var G__7563__1 = function(a) {
        return f.call(null, a == null ? x : a)
      };
      var G__7563__2 = function(a, b) {
        return f.call(null, a == null ? x : a, b)
      };
      var G__7563__3 = function(a, b, c) {
        return f.call(null, a == null ? x : a, b, c)
      };
      var G__7563__4 = function() {
        var G__7564__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, a == null ? x : a, b, c, ds)
        };
        var G__7564 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7564__delegate.call(this, a, b, c, ds)
        };
        G__7564.cljs$lang$maxFixedArity = 3;
        G__7564.cljs$lang$applyTo = function(arglist__7565) {
          var a = cljs.core.first(arglist__7565);
          var b = cljs.core.first(cljs.core.next(arglist__7565));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7565)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7565)));
          return G__7564__delegate(a, b, c, ds)
        };
        G__7564.cljs$lang$arity$variadic = G__7564__delegate;
        return G__7564
      }();
      G__7563 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 1:
            return G__7563__1.call(this, a);
          case 2:
            return G__7563__2.call(this, a, b);
          case 3:
            return G__7563__3.call(this, a, b, c);
          default:
            return G__7563__4.cljs$lang$arity$variadic(a, b, c, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__7563.cljs$lang$maxFixedArity = 3;
      G__7563.cljs$lang$applyTo = G__7563__4.cljs$lang$applyTo;
      return G__7563
    }()
  };
  var fnil__3 = function(f, x, y) {
    return function() {
      var G__7566 = null;
      var G__7566__2 = function(a, b) {
        return f.call(null, a == null ? x : a, b == null ? y : b)
      };
      var G__7566__3 = function(a, b, c) {
        return f.call(null, a == null ? x : a, b == null ? y : b, c)
      };
      var G__7566__4 = function() {
        var G__7567__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, a == null ? x : a, b == null ? y : b, c, ds)
        };
        var G__7567 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7567__delegate.call(this, a, b, c, ds)
        };
        G__7567.cljs$lang$maxFixedArity = 3;
        G__7567.cljs$lang$applyTo = function(arglist__7568) {
          var a = cljs.core.first(arglist__7568);
          var b = cljs.core.first(cljs.core.next(arglist__7568));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7568)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7568)));
          return G__7567__delegate(a, b, c, ds)
        };
        G__7567.cljs$lang$arity$variadic = G__7567__delegate;
        return G__7567
      }();
      G__7566 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__7566__2.call(this, a, b);
          case 3:
            return G__7566__3.call(this, a, b, c);
          default:
            return G__7566__4.cljs$lang$arity$variadic(a, b, c, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__7566.cljs$lang$maxFixedArity = 3;
      G__7566.cljs$lang$applyTo = G__7566__4.cljs$lang$applyTo;
      return G__7566
    }()
  };
  var fnil__4 = function(f, x, y, z) {
    return function() {
      var G__7569 = null;
      var G__7569__2 = function(a, b) {
        return f.call(null, a == null ? x : a, b == null ? y : b)
      };
      var G__7569__3 = function(a, b, c) {
        return f.call(null, a == null ? x : a, b == null ? y : b, c == null ? z : c)
      };
      var G__7569__4 = function() {
        var G__7570__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, a == null ? x : a, b == null ? y : b, c == null ? z : c, ds)
        };
        var G__7570 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7570__delegate.call(this, a, b, c, ds)
        };
        G__7570.cljs$lang$maxFixedArity = 3;
        G__7570.cljs$lang$applyTo = function(arglist__7571) {
          var a = cljs.core.first(arglist__7571);
          var b = cljs.core.first(cljs.core.next(arglist__7571));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7571)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7571)));
          return G__7570__delegate(a, b, c, ds)
        };
        G__7570.cljs$lang$arity$variadic = G__7570__delegate;
        return G__7570
      }();
      G__7569 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__7569__2.call(this, a, b);
          case 3:
            return G__7569__3.call(this, a, b, c);
          default:
            return G__7569__4.cljs$lang$arity$variadic(a, b, c, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__7569.cljs$lang$maxFixedArity = 3;
      G__7569.cljs$lang$applyTo = G__7569__4.cljs$lang$applyTo;
      return G__7569
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
  var mapi__7587 = function mapi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____7595 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____7595) {
        var s__7596 = temp__3974__auto____7595;
        if(cljs.core.chunked_seq_QMARK_.call(null, s__7596)) {
          var c__7597 = cljs.core.chunk_first.call(null, s__7596);
          var size__7598 = cljs.core.count.call(null, c__7597);
          var b__7599 = cljs.core.chunk_buffer.call(null, size__7598);
          var n__2527__auto____7600 = size__7598;
          var i__7601 = 0;
          while(true) {
            if(i__7601 < n__2527__auto____7600) {
              cljs.core.chunk_append.call(null, b__7599, f.call(null, idx + i__7601, cljs.core._nth.call(null, c__7597, i__7601)));
              var G__7602 = i__7601 + 1;
              i__7601 = G__7602;
              continue
            }else {
            }
            break
          }
          return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__7599), mapi.call(null, idx + size__7598, cljs.core.chunk_rest.call(null, s__7596)))
        }else {
          return cljs.core.cons.call(null, f.call(null, idx, cljs.core.first.call(null, s__7596)), mapi.call(null, idx + 1, cljs.core.rest.call(null, s__7596)))
        }
      }else {
        return null
      }
    }, null)
  };
  return mapi__7587.call(null, 0, coll)
};
cljs.core.keep = function keep(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____7612 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____7612) {
      var s__7613 = temp__3974__auto____7612;
      if(cljs.core.chunked_seq_QMARK_.call(null, s__7613)) {
        var c__7614 = cljs.core.chunk_first.call(null, s__7613);
        var size__7615 = cljs.core.count.call(null, c__7614);
        var b__7616 = cljs.core.chunk_buffer.call(null, size__7615);
        var n__2527__auto____7617 = size__7615;
        var i__7618 = 0;
        while(true) {
          if(i__7618 < n__2527__auto____7617) {
            var x__7619 = f.call(null, cljs.core._nth.call(null, c__7614, i__7618));
            if(x__7619 == null) {
            }else {
              cljs.core.chunk_append.call(null, b__7616, x__7619)
            }
            var G__7621 = i__7618 + 1;
            i__7618 = G__7621;
            continue
          }else {
          }
          break
        }
        return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__7616), keep.call(null, f, cljs.core.chunk_rest.call(null, s__7613)))
      }else {
        var x__7620 = f.call(null, cljs.core.first.call(null, s__7613));
        if(x__7620 == null) {
          return keep.call(null, f, cljs.core.rest.call(null, s__7613))
        }else {
          return cljs.core.cons.call(null, x__7620, keep.call(null, f, cljs.core.rest.call(null, s__7613)))
        }
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.keep_indexed = function keep_indexed(f, coll) {
  var keepi__7647 = function keepi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____7657 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____7657) {
        var s__7658 = temp__3974__auto____7657;
        if(cljs.core.chunked_seq_QMARK_.call(null, s__7658)) {
          var c__7659 = cljs.core.chunk_first.call(null, s__7658);
          var size__7660 = cljs.core.count.call(null, c__7659);
          var b__7661 = cljs.core.chunk_buffer.call(null, size__7660);
          var n__2527__auto____7662 = size__7660;
          var i__7663 = 0;
          while(true) {
            if(i__7663 < n__2527__auto____7662) {
              var x__7664 = f.call(null, idx + i__7663, cljs.core._nth.call(null, c__7659, i__7663));
              if(x__7664 == null) {
              }else {
                cljs.core.chunk_append.call(null, b__7661, x__7664)
              }
              var G__7666 = i__7663 + 1;
              i__7663 = G__7666;
              continue
            }else {
            }
            break
          }
          return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__7661), keepi.call(null, idx + size__7660, cljs.core.chunk_rest.call(null, s__7658)))
        }else {
          var x__7665 = f.call(null, idx, cljs.core.first.call(null, s__7658));
          if(x__7665 == null) {
            return keepi.call(null, idx + 1, cljs.core.rest.call(null, s__7658))
          }else {
            return cljs.core.cons.call(null, x__7665, keepi.call(null, idx + 1, cljs.core.rest.call(null, s__7658)))
          }
        }
      }else {
        return null
      }
    }, null)
  };
  return keepi__7647.call(null, 0, coll)
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
        return cljs.core.boolean$.call(null, p.call(null, x))
      };
      var ep1__2 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____7752 = p.call(null, x);
          if(cljs.core.truth_(and__3822__auto____7752)) {
            return p.call(null, y)
          }else {
            return and__3822__auto____7752
          }
        }())
      };
      var ep1__3 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____7753 = p.call(null, x);
          if(cljs.core.truth_(and__3822__auto____7753)) {
            var and__3822__auto____7754 = p.call(null, y);
            if(cljs.core.truth_(and__3822__auto____7754)) {
              return p.call(null, z)
            }else {
              return and__3822__auto____7754
            }
          }else {
            return and__3822__auto____7753
          }
        }())
      };
      var ep1__4 = function() {
        var G__7823__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3822__auto____7755 = ep1.call(null, x, y, z);
            if(cljs.core.truth_(and__3822__auto____7755)) {
              return cljs.core.every_QMARK_.call(null, p, args)
            }else {
              return and__3822__auto____7755
            }
          }())
        };
        var G__7823 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7823__delegate.call(this, x, y, z, args)
        };
        G__7823.cljs$lang$maxFixedArity = 3;
        G__7823.cljs$lang$applyTo = function(arglist__7824) {
          var x = cljs.core.first(arglist__7824);
          var y = cljs.core.first(cljs.core.next(arglist__7824));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7824)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7824)));
          return G__7823__delegate(x, y, z, args)
        };
        G__7823.cljs$lang$arity$variadic = G__7823__delegate;
        return G__7823
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
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____7767 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____7767)) {
            return p2.call(null, x)
          }else {
            return and__3822__auto____7767
          }
        }())
      };
      var ep2__2 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____7768 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____7768)) {
            var and__3822__auto____7769 = p1.call(null, y);
            if(cljs.core.truth_(and__3822__auto____7769)) {
              var and__3822__auto____7770 = p2.call(null, x);
              if(cljs.core.truth_(and__3822__auto____7770)) {
                return p2.call(null, y)
              }else {
                return and__3822__auto____7770
              }
            }else {
              return and__3822__auto____7769
            }
          }else {
            return and__3822__auto____7768
          }
        }())
      };
      var ep2__3 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____7771 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____7771)) {
            var and__3822__auto____7772 = p1.call(null, y);
            if(cljs.core.truth_(and__3822__auto____7772)) {
              var and__3822__auto____7773 = p1.call(null, z);
              if(cljs.core.truth_(and__3822__auto____7773)) {
                var and__3822__auto____7774 = p2.call(null, x);
                if(cljs.core.truth_(and__3822__auto____7774)) {
                  var and__3822__auto____7775 = p2.call(null, y);
                  if(cljs.core.truth_(and__3822__auto____7775)) {
                    return p2.call(null, z)
                  }else {
                    return and__3822__auto____7775
                  }
                }else {
                  return and__3822__auto____7774
                }
              }else {
                return and__3822__auto____7773
              }
            }else {
              return and__3822__auto____7772
            }
          }else {
            return and__3822__auto____7771
          }
        }())
      };
      var ep2__4 = function() {
        var G__7825__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3822__auto____7776 = ep2.call(null, x, y, z);
            if(cljs.core.truth_(and__3822__auto____7776)) {
              return cljs.core.every_QMARK_.call(null, function(p1__7622_SHARP_) {
                var and__3822__auto____7777 = p1.call(null, p1__7622_SHARP_);
                if(cljs.core.truth_(and__3822__auto____7777)) {
                  return p2.call(null, p1__7622_SHARP_)
                }else {
                  return and__3822__auto____7777
                }
              }, args)
            }else {
              return and__3822__auto____7776
            }
          }())
        };
        var G__7825 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7825__delegate.call(this, x, y, z, args)
        };
        G__7825.cljs$lang$maxFixedArity = 3;
        G__7825.cljs$lang$applyTo = function(arglist__7826) {
          var x = cljs.core.first(arglist__7826);
          var y = cljs.core.first(cljs.core.next(arglist__7826));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7826)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7826)));
          return G__7825__delegate(x, y, z, args)
        };
        G__7825.cljs$lang$arity$variadic = G__7825__delegate;
        return G__7825
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
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____7796 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____7796)) {
            var and__3822__auto____7797 = p2.call(null, x);
            if(cljs.core.truth_(and__3822__auto____7797)) {
              return p3.call(null, x)
            }else {
              return and__3822__auto____7797
            }
          }else {
            return and__3822__auto____7796
          }
        }())
      };
      var ep3__2 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____7798 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____7798)) {
            var and__3822__auto____7799 = p2.call(null, x);
            if(cljs.core.truth_(and__3822__auto____7799)) {
              var and__3822__auto____7800 = p3.call(null, x);
              if(cljs.core.truth_(and__3822__auto____7800)) {
                var and__3822__auto____7801 = p1.call(null, y);
                if(cljs.core.truth_(and__3822__auto____7801)) {
                  var and__3822__auto____7802 = p2.call(null, y);
                  if(cljs.core.truth_(and__3822__auto____7802)) {
                    return p3.call(null, y)
                  }else {
                    return and__3822__auto____7802
                  }
                }else {
                  return and__3822__auto____7801
                }
              }else {
                return and__3822__auto____7800
              }
            }else {
              return and__3822__auto____7799
            }
          }else {
            return and__3822__auto____7798
          }
        }())
      };
      var ep3__3 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____7803 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____7803)) {
            var and__3822__auto____7804 = p2.call(null, x);
            if(cljs.core.truth_(and__3822__auto____7804)) {
              var and__3822__auto____7805 = p3.call(null, x);
              if(cljs.core.truth_(and__3822__auto____7805)) {
                var and__3822__auto____7806 = p1.call(null, y);
                if(cljs.core.truth_(and__3822__auto____7806)) {
                  var and__3822__auto____7807 = p2.call(null, y);
                  if(cljs.core.truth_(and__3822__auto____7807)) {
                    var and__3822__auto____7808 = p3.call(null, y);
                    if(cljs.core.truth_(and__3822__auto____7808)) {
                      var and__3822__auto____7809 = p1.call(null, z);
                      if(cljs.core.truth_(and__3822__auto____7809)) {
                        var and__3822__auto____7810 = p2.call(null, z);
                        if(cljs.core.truth_(and__3822__auto____7810)) {
                          return p3.call(null, z)
                        }else {
                          return and__3822__auto____7810
                        }
                      }else {
                        return and__3822__auto____7809
                      }
                    }else {
                      return and__3822__auto____7808
                    }
                  }else {
                    return and__3822__auto____7807
                  }
                }else {
                  return and__3822__auto____7806
                }
              }else {
                return and__3822__auto____7805
              }
            }else {
              return and__3822__auto____7804
            }
          }else {
            return and__3822__auto____7803
          }
        }())
      };
      var ep3__4 = function() {
        var G__7827__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3822__auto____7811 = ep3.call(null, x, y, z);
            if(cljs.core.truth_(and__3822__auto____7811)) {
              return cljs.core.every_QMARK_.call(null, function(p1__7623_SHARP_) {
                var and__3822__auto____7812 = p1.call(null, p1__7623_SHARP_);
                if(cljs.core.truth_(and__3822__auto____7812)) {
                  var and__3822__auto____7813 = p2.call(null, p1__7623_SHARP_);
                  if(cljs.core.truth_(and__3822__auto____7813)) {
                    return p3.call(null, p1__7623_SHARP_)
                  }else {
                    return and__3822__auto____7813
                  }
                }else {
                  return and__3822__auto____7812
                }
              }, args)
            }else {
              return and__3822__auto____7811
            }
          }())
        };
        var G__7827 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7827__delegate.call(this, x, y, z, args)
        };
        G__7827.cljs$lang$maxFixedArity = 3;
        G__7827.cljs$lang$applyTo = function(arglist__7828) {
          var x = cljs.core.first(arglist__7828);
          var y = cljs.core.first(cljs.core.next(arglist__7828));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7828)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7828)));
          return G__7827__delegate(x, y, z, args)
        };
        G__7827.cljs$lang$arity$variadic = G__7827__delegate;
        return G__7827
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
    var G__7829__delegate = function(p1, p2, p3, ps) {
      var ps__7814 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var epn = null;
        var epn__0 = function() {
          return true
        };
        var epn__1 = function(x) {
          return cljs.core.every_QMARK_.call(null, function(p1__7624_SHARP_) {
            return p1__7624_SHARP_.call(null, x)
          }, ps__7814)
        };
        var epn__2 = function(x, y) {
          return cljs.core.every_QMARK_.call(null, function(p1__7625_SHARP_) {
            var and__3822__auto____7819 = p1__7625_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3822__auto____7819)) {
              return p1__7625_SHARP_.call(null, y)
            }else {
              return and__3822__auto____7819
            }
          }, ps__7814)
        };
        var epn__3 = function(x, y, z) {
          return cljs.core.every_QMARK_.call(null, function(p1__7626_SHARP_) {
            var and__3822__auto____7820 = p1__7626_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3822__auto____7820)) {
              var and__3822__auto____7821 = p1__7626_SHARP_.call(null, y);
              if(cljs.core.truth_(and__3822__auto____7821)) {
                return p1__7626_SHARP_.call(null, z)
              }else {
                return and__3822__auto____7821
              }
            }else {
              return and__3822__auto____7820
            }
          }, ps__7814)
        };
        var epn__4 = function() {
          var G__7830__delegate = function(x, y, z, args) {
            return cljs.core.boolean$.call(null, function() {
              var and__3822__auto____7822 = epn.call(null, x, y, z);
              if(cljs.core.truth_(and__3822__auto____7822)) {
                return cljs.core.every_QMARK_.call(null, function(p1__7627_SHARP_) {
                  return cljs.core.every_QMARK_.call(null, p1__7627_SHARP_, args)
                }, ps__7814)
              }else {
                return and__3822__auto____7822
              }
            }())
          };
          var G__7830 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__7830__delegate.call(this, x, y, z, args)
          };
          G__7830.cljs$lang$maxFixedArity = 3;
          G__7830.cljs$lang$applyTo = function(arglist__7831) {
            var x = cljs.core.first(arglist__7831);
            var y = cljs.core.first(cljs.core.next(arglist__7831));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7831)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7831)));
            return G__7830__delegate(x, y, z, args)
          };
          G__7830.cljs$lang$arity$variadic = G__7830__delegate;
          return G__7830
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
    var G__7829 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__7829__delegate.call(this, p1, p2, p3, ps)
    };
    G__7829.cljs$lang$maxFixedArity = 3;
    G__7829.cljs$lang$applyTo = function(arglist__7832) {
      var p1 = cljs.core.first(arglist__7832);
      var p2 = cljs.core.first(cljs.core.next(arglist__7832));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7832)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7832)));
      return G__7829__delegate(p1, p2, p3, ps)
    };
    G__7829.cljs$lang$arity$variadic = G__7829__delegate;
    return G__7829
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
        return p.call(null, x)
      };
      var sp1__2 = function(x, y) {
        var or__3824__auto____7913 = p.call(null, x);
        if(cljs.core.truth_(or__3824__auto____7913)) {
          return or__3824__auto____7913
        }else {
          return p.call(null, y)
        }
      };
      var sp1__3 = function(x, y, z) {
        var or__3824__auto____7914 = p.call(null, x);
        if(cljs.core.truth_(or__3824__auto____7914)) {
          return or__3824__auto____7914
        }else {
          var or__3824__auto____7915 = p.call(null, y);
          if(cljs.core.truth_(or__3824__auto____7915)) {
            return or__3824__auto____7915
          }else {
            return p.call(null, z)
          }
        }
      };
      var sp1__4 = function() {
        var G__7984__delegate = function(x, y, z, args) {
          var or__3824__auto____7916 = sp1.call(null, x, y, z);
          if(cljs.core.truth_(or__3824__auto____7916)) {
            return or__3824__auto____7916
          }else {
            return cljs.core.some.call(null, p, args)
          }
        };
        var G__7984 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7984__delegate.call(this, x, y, z, args)
        };
        G__7984.cljs$lang$maxFixedArity = 3;
        G__7984.cljs$lang$applyTo = function(arglist__7985) {
          var x = cljs.core.first(arglist__7985);
          var y = cljs.core.first(cljs.core.next(arglist__7985));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7985)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7985)));
          return G__7984__delegate(x, y, z, args)
        };
        G__7984.cljs$lang$arity$variadic = G__7984__delegate;
        return G__7984
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
        var or__3824__auto____7928 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____7928)) {
          return or__3824__auto____7928
        }else {
          return p2.call(null, x)
        }
      };
      var sp2__2 = function(x, y) {
        var or__3824__auto____7929 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____7929)) {
          return or__3824__auto____7929
        }else {
          var or__3824__auto____7930 = p1.call(null, y);
          if(cljs.core.truth_(or__3824__auto____7930)) {
            return or__3824__auto____7930
          }else {
            var or__3824__auto____7931 = p2.call(null, x);
            if(cljs.core.truth_(or__3824__auto____7931)) {
              return or__3824__auto____7931
            }else {
              return p2.call(null, y)
            }
          }
        }
      };
      var sp2__3 = function(x, y, z) {
        var or__3824__auto____7932 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____7932)) {
          return or__3824__auto____7932
        }else {
          var or__3824__auto____7933 = p1.call(null, y);
          if(cljs.core.truth_(or__3824__auto____7933)) {
            return or__3824__auto____7933
          }else {
            var or__3824__auto____7934 = p1.call(null, z);
            if(cljs.core.truth_(or__3824__auto____7934)) {
              return or__3824__auto____7934
            }else {
              var or__3824__auto____7935 = p2.call(null, x);
              if(cljs.core.truth_(or__3824__auto____7935)) {
                return or__3824__auto____7935
              }else {
                var or__3824__auto____7936 = p2.call(null, y);
                if(cljs.core.truth_(or__3824__auto____7936)) {
                  return or__3824__auto____7936
                }else {
                  return p2.call(null, z)
                }
              }
            }
          }
        }
      };
      var sp2__4 = function() {
        var G__7986__delegate = function(x, y, z, args) {
          var or__3824__auto____7937 = sp2.call(null, x, y, z);
          if(cljs.core.truth_(or__3824__auto____7937)) {
            return or__3824__auto____7937
          }else {
            return cljs.core.some.call(null, function(p1__7667_SHARP_) {
              var or__3824__auto____7938 = p1.call(null, p1__7667_SHARP_);
              if(cljs.core.truth_(or__3824__auto____7938)) {
                return or__3824__auto____7938
              }else {
                return p2.call(null, p1__7667_SHARP_)
              }
            }, args)
          }
        };
        var G__7986 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7986__delegate.call(this, x, y, z, args)
        };
        G__7986.cljs$lang$maxFixedArity = 3;
        G__7986.cljs$lang$applyTo = function(arglist__7987) {
          var x = cljs.core.first(arglist__7987);
          var y = cljs.core.first(cljs.core.next(arglist__7987));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7987)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7987)));
          return G__7986__delegate(x, y, z, args)
        };
        G__7986.cljs$lang$arity$variadic = G__7986__delegate;
        return G__7986
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
        var or__3824__auto____7957 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____7957)) {
          return or__3824__auto____7957
        }else {
          var or__3824__auto____7958 = p2.call(null, x);
          if(cljs.core.truth_(or__3824__auto____7958)) {
            return or__3824__auto____7958
          }else {
            return p3.call(null, x)
          }
        }
      };
      var sp3__2 = function(x, y) {
        var or__3824__auto____7959 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____7959)) {
          return or__3824__auto____7959
        }else {
          var or__3824__auto____7960 = p2.call(null, x);
          if(cljs.core.truth_(or__3824__auto____7960)) {
            return or__3824__auto____7960
          }else {
            var or__3824__auto____7961 = p3.call(null, x);
            if(cljs.core.truth_(or__3824__auto____7961)) {
              return or__3824__auto____7961
            }else {
              var or__3824__auto____7962 = p1.call(null, y);
              if(cljs.core.truth_(or__3824__auto____7962)) {
                return or__3824__auto____7962
              }else {
                var or__3824__auto____7963 = p2.call(null, y);
                if(cljs.core.truth_(or__3824__auto____7963)) {
                  return or__3824__auto____7963
                }else {
                  return p3.call(null, y)
                }
              }
            }
          }
        }
      };
      var sp3__3 = function(x, y, z) {
        var or__3824__auto____7964 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____7964)) {
          return or__3824__auto____7964
        }else {
          var or__3824__auto____7965 = p2.call(null, x);
          if(cljs.core.truth_(or__3824__auto____7965)) {
            return or__3824__auto____7965
          }else {
            var or__3824__auto____7966 = p3.call(null, x);
            if(cljs.core.truth_(or__3824__auto____7966)) {
              return or__3824__auto____7966
            }else {
              var or__3824__auto____7967 = p1.call(null, y);
              if(cljs.core.truth_(or__3824__auto____7967)) {
                return or__3824__auto____7967
              }else {
                var or__3824__auto____7968 = p2.call(null, y);
                if(cljs.core.truth_(or__3824__auto____7968)) {
                  return or__3824__auto____7968
                }else {
                  var or__3824__auto____7969 = p3.call(null, y);
                  if(cljs.core.truth_(or__3824__auto____7969)) {
                    return or__3824__auto____7969
                  }else {
                    var or__3824__auto____7970 = p1.call(null, z);
                    if(cljs.core.truth_(or__3824__auto____7970)) {
                      return or__3824__auto____7970
                    }else {
                      var or__3824__auto____7971 = p2.call(null, z);
                      if(cljs.core.truth_(or__3824__auto____7971)) {
                        return or__3824__auto____7971
                      }else {
                        return p3.call(null, z)
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
        var G__7988__delegate = function(x, y, z, args) {
          var or__3824__auto____7972 = sp3.call(null, x, y, z);
          if(cljs.core.truth_(or__3824__auto____7972)) {
            return or__3824__auto____7972
          }else {
            return cljs.core.some.call(null, function(p1__7668_SHARP_) {
              var or__3824__auto____7973 = p1.call(null, p1__7668_SHARP_);
              if(cljs.core.truth_(or__3824__auto____7973)) {
                return or__3824__auto____7973
              }else {
                var or__3824__auto____7974 = p2.call(null, p1__7668_SHARP_);
                if(cljs.core.truth_(or__3824__auto____7974)) {
                  return or__3824__auto____7974
                }else {
                  return p3.call(null, p1__7668_SHARP_)
                }
              }
            }, args)
          }
        };
        var G__7988 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7988__delegate.call(this, x, y, z, args)
        };
        G__7988.cljs$lang$maxFixedArity = 3;
        G__7988.cljs$lang$applyTo = function(arglist__7989) {
          var x = cljs.core.first(arglist__7989);
          var y = cljs.core.first(cljs.core.next(arglist__7989));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7989)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7989)));
          return G__7988__delegate(x, y, z, args)
        };
        G__7988.cljs$lang$arity$variadic = G__7988__delegate;
        return G__7988
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
    var G__7990__delegate = function(p1, p2, p3, ps) {
      var ps__7975 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var spn = null;
        var spn__0 = function() {
          return null
        };
        var spn__1 = function(x) {
          return cljs.core.some.call(null, function(p1__7669_SHARP_) {
            return p1__7669_SHARP_.call(null, x)
          }, ps__7975)
        };
        var spn__2 = function(x, y) {
          return cljs.core.some.call(null, function(p1__7670_SHARP_) {
            var or__3824__auto____7980 = p1__7670_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3824__auto____7980)) {
              return or__3824__auto____7980
            }else {
              return p1__7670_SHARP_.call(null, y)
            }
          }, ps__7975)
        };
        var spn__3 = function(x, y, z) {
          return cljs.core.some.call(null, function(p1__7671_SHARP_) {
            var or__3824__auto____7981 = p1__7671_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3824__auto____7981)) {
              return or__3824__auto____7981
            }else {
              var or__3824__auto____7982 = p1__7671_SHARP_.call(null, y);
              if(cljs.core.truth_(or__3824__auto____7982)) {
                return or__3824__auto____7982
              }else {
                return p1__7671_SHARP_.call(null, z)
              }
            }
          }, ps__7975)
        };
        var spn__4 = function() {
          var G__7991__delegate = function(x, y, z, args) {
            var or__3824__auto____7983 = spn.call(null, x, y, z);
            if(cljs.core.truth_(or__3824__auto____7983)) {
              return or__3824__auto____7983
            }else {
              return cljs.core.some.call(null, function(p1__7672_SHARP_) {
                return cljs.core.some.call(null, p1__7672_SHARP_, args)
              }, ps__7975)
            }
          };
          var G__7991 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__7991__delegate.call(this, x, y, z, args)
          };
          G__7991.cljs$lang$maxFixedArity = 3;
          G__7991.cljs$lang$applyTo = function(arglist__7992) {
            var x = cljs.core.first(arglist__7992);
            var y = cljs.core.first(cljs.core.next(arglist__7992));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7992)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7992)));
            return G__7991__delegate(x, y, z, args)
          };
          G__7991.cljs$lang$arity$variadic = G__7991__delegate;
          return G__7991
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
    var G__7990 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__7990__delegate.call(this, p1, p2, p3, ps)
    };
    G__7990.cljs$lang$maxFixedArity = 3;
    G__7990.cljs$lang$applyTo = function(arglist__7993) {
      var p1 = cljs.core.first(arglist__7993);
      var p2 = cljs.core.first(cljs.core.next(arglist__7993));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7993)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7993)));
      return G__7990__delegate(p1, p2, p3, ps)
    };
    G__7990.cljs$lang$arity$variadic = G__7990__delegate;
    return G__7990
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
      var temp__3974__auto____8012 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____8012) {
        var s__8013 = temp__3974__auto____8012;
        if(cljs.core.chunked_seq_QMARK_.call(null, s__8013)) {
          var c__8014 = cljs.core.chunk_first.call(null, s__8013);
          var size__8015 = cljs.core.count.call(null, c__8014);
          var b__8016 = cljs.core.chunk_buffer.call(null, size__8015);
          var n__2527__auto____8017 = size__8015;
          var i__8018 = 0;
          while(true) {
            if(i__8018 < n__2527__auto____8017) {
              cljs.core.chunk_append.call(null, b__8016, f.call(null, cljs.core._nth.call(null, c__8014, i__8018)));
              var G__8030 = i__8018 + 1;
              i__8018 = G__8030;
              continue
            }else {
            }
            break
          }
          return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__8016), map.call(null, f, cljs.core.chunk_rest.call(null, s__8013)))
        }else {
          return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s__8013)), map.call(null, f, cljs.core.rest.call(null, s__8013)))
        }
      }else {
        return null
      }
    }, null)
  };
  var map__3 = function(f, c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__8019 = cljs.core.seq.call(null, c1);
      var s2__8020 = cljs.core.seq.call(null, c2);
      if(function() {
        var and__3822__auto____8021 = s1__8019;
        if(and__3822__auto____8021) {
          return s2__8020
        }else {
          return and__3822__auto____8021
        }
      }()) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__8019), cljs.core.first.call(null, s2__8020)), map.call(null, f, cljs.core.rest.call(null, s1__8019), cljs.core.rest.call(null, s2__8020)))
      }else {
        return null
      }
    }, null)
  };
  var map__4 = function(f, c1, c2, c3) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__8022 = cljs.core.seq.call(null, c1);
      var s2__8023 = cljs.core.seq.call(null, c2);
      var s3__8024 = cljs.core.seq.call(null, c3);
      if(function() {
        var and__3822__auto____8025 = s1__8022;
        if(and__3822__auto____8025) {
          var and__3822__auto____8026 = s2__8023;
          if(and__3822__auto____8026) {
            return s3__8024
          }else {
            return and__3822__auto____8026
          }
        }else {
          return and__3822__auto____8025
        }
      }()) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__8022), cljs.core.first.call(null, s2__8023), cljs.core.first.call(null, s3__8024)), map.call(null, f, cljs.core.rest.call(null, s1__8022), cljs.core.rest.call(null, s2__8023), cljs.core.rest.call(null, s3__8024)))
      }else {
        return null
      }
    }, null)
  };
  var map__5 = function() {
    var G__8031__delegate = function(f, c1, c2, c3, colls) {
      var step__8029 = function step(cs) {
        return new cljs.core.LazySeq(null, false, function() {
          var ss__8028 = map.call(null, cljs.core.seq, cs);
          if(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__8028)) {
            return cljs.core.cons.call(null, map.call(null, cljs.core.first, ss__8028), step.call(null, map.call(null, cljs.core.rest, ss__8028)))
          }else {
            return null
          }
        }, null)
      };
      return map.call(null, function(p1__7833_SHARP_) {
        return cljs.core.apply.call(null, f, p1__7833_SHARP_)
      }, step__8029.call(null, cljs.core.conj.call(null, colls, c3, c2, c1)))
    };
    var G__8031 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__8031__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__8031.cljs$lang$maxFixedArity = 4;
    G__8031.cljs$lang$applyTo = function(arglist__8032) {
      var f = cljs.core.first(arglist__8032);
      var c1 = cljs.core.first(cljs.core.next(arglist__8032));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8032)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__8032))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__8032))));
      return G__8031__delegate(f, c1, c2, c3, colls)
    };
    G__8031.cljs$lang$arity$variadic = G__8031__delegate;
    return G__8031
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
      var temp__3974__auto____8035 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____8035) {
        var s__8036 = temp__3974__auto____8035;
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__8036), take.call(null, n - 1, cljs.core.rest.call(null, s__8036)))
      }else {
        return null
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.drop = function drop(n, coll) {
  var step__8042 = function(n, coll) {
    while(true) {
      var s__8040 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3822__auto____8041 = n > 0;
        if(and__3822__auto____8041) {
          return s__8040
        }else {
          return and__3822__auto____8041
        }
      }())) {
        var G__8043 = n - 1;
        var G__8044 = cljs.core.rest.call(null, s__8040);
        n = G__8043;
        coll = G__8044;
        continue
      }else {
        return s__8040
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__8042.call(null, n, coll)
  }, null)
};
cljs.core.drop_last = function() {
  var drop_last = null;
  var drop_last__1 = function(s) {
    return drop_last.call(null, 1, s)
  };
  var drop_last__2 = function(n, s) {
    return cljs.core.map.call(null, function(x, _) {
      return x
    }, s, cljs.core.drop.call(null, n, s))
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
  var s__8047 = cljs.core.seq.call(null, coll);
  var lead__8048 = cljs.core.seq.call(null, cljs.core.drop.call(null, n, coll));
  while(true) {
    if(lead__8048) {
      var G__8049 = cljs.core.next.call(null, s__8047);
      var G__8050 = cljs.core.next.call(null, lead__8048);
      s__8047 = G__8049;
      lead__8048 = G__8050;
      continue
    }else {
      return s__8047
    }
    break
  }
};
cljs.core.drop_while = function drop_while(pred, coll) {
  var step__8056 = function(pred, coll) {
    while(true) {
      var s__8054 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3822__auto____8055 = s__8054;
        if(and__3822__auto____8055) {
          return pred.call(null, cljs.core.first.call(null, s__8054))
        }else {
          return and__3822__auto____8055
        }
      }())) {
        var G__8057 = pred;
        var G__8058 = cljs.core.rest.call(null, s__8054);
        pred = G__8057;
        coll = G__8058;
        continue
      }else {
        return s__8054
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__8056.call(null, pred, coll)
  }, null)
};
cljs.core.cycle = function cycle(coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____8061 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____8061) {
      var s__8062 = temp__3974__auto____8061;
      return cljs.core.concat.call(null, s__8062, cycle.call(null, s__8062))
    }else {
      return null
    }
  }, null)
};
cljs.core.split_at = function split_at(n, coll) {
  return cljs.core.PersistentVector.fromArray([cljs.core.take.call(null, n, coll), cljs.core.drop.call(null, n, coll)], true)
};
cljs.core.repeat = function() {
  var repeat = null;
  var repeat__1 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, x, repeat.call(null, x))
    }, null)
  };
  var repeat__2 = function(n, x) {
    return cljs.core.take.call(null, n, repeat.call(null, x))
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
  return cljs.core.take.call(null, n, cljs.core.repeat.call(null, x))
};
cljs.core.repeatedly = function() {
  var repeatedly = null;
  var repeatedly__1 = function(f) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, f.call(null), repeatedly.call(null, f))
    }, null)
  };
  var repeatedly__2 = function(n, f) {
    return cljs.core.take.call(null, n, repeatedly.call(null, f))
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
  return cljs.core.cons.call(null, x, new cljs.core.LazySeq(null, false, function() {
    return iterate.call(null, f, f.call(null, x))
  }, null))
};
cljs.core.interleave = function() {
  var interleave = null;
  var interleave__2 = function(c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__8067 = cljs.core.seq.call(null, c1);
      var s2__8068 = cljs.core.seq.call(null, c2);
      if(function() {
        var and__3822__auto____8069 = s1__8067;
        if(and__3822__auto____8069) {
          return s2__8068
        }else {
          return and__3822__auto____8069
        }
      }()) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s1__8067), cljs.core.cons.call(null, cljs.core.first.call(null, s2__8068), interleave.call(null, cljs.core.rest.call(null, s1__8067), cljs.core.rest.call(null, s2__8068))))
      }else {
        return null
      }
    }, null)
  };
  var interleave__3 = function() {
    var G__8071__delegate = function(c1, c2, colls) {
      return new cljs.core.LazySeq(null, false, function() {
        var ss__8070 = cljs.core.map.call(null, cljs.core.seq, cljs.core.conj.call(null, colls, c2, c1));
        if(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__8070)) {
          return cljs.core.concat.call(null, cljs.core.map.call(null, cljs.core.first, ss__8070), cljs.core.apply.call(null, interleave, cljs.core.map.call(null, cljs.core.rest, ss__8070)))
        }else {
          return null
        }
      }, null)
    };
    var G__8071 = function(c1, c2, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__8071__delegate.call(this, c1, c2, colls)
    };
    G__8071.cljs$lang$maxFixedArity = 2;
    G__8071.cljs$lang$applyTo = function(arglist__8072) {
      var c1 = cljs.core.first(arglist__8072);
      var c2 = cljs.core.first(cljs.core.next(arglist__8072));
      var colls = cljs.core.rest(cljs.core.next(arglist__8072));
      return G__8071__delegate(c1, c2, colls)
    };
    G__8071.cljs$lang$arity$variadic = G__8071__delegate;
    return G__8071
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
  return cljs.core.drop.call(null, 1, cljs.core.interleave.call(null, cljs.core.repeat.call(null, sep), coll))
};
cljs.core.flatten1 = function flatten1(colls) {
  var cat__8082 = function cat(coll, colls) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3971__auto____8080 = cljs.core.seq.call(null, coll);
      if(temp__3971__auto____8080) {
        var coll__8081 = temp__3971__auto____8080;
        return cljs.core.cons.call(null, cljs.core.first.call(null, coll__8081), cat.call(null, cljs.core.rest.call(null, coll__8081), colls))
      }else {
        if(cljs.core.seq.call(null, colls)) {
          return cat.call(null, cljs.core.first.call(null, colls), cljs.core.rest.call(null, colls))
        }else {
          return null
        }
      }
    }, null)
  };
  return cat__8082.call(null, null, colls)
};
cljs.core.mapcat = function() {
  var mapcat = null;
  var mapcat__2 = function(f, coll) {
    return cljs.core.flatten1.call(null, cljs.core.map.call(null, f, coll))
  };
  var mapcat__3 = function() {
    var G__8083__delegate = function(f, coll, colls) {
      return cljs.core.flatten1.call(null, cljs.core.apply.call(null, cljs.core.map, f, coll, colls))
    };
    var G__8083 = function(f, coll, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__8083__delegate.call(this, f, coll, colls)
    };
    G__8083.cljs$lang$maxFixedArity = 2;
    G__8083.cljs$lang$applyTo = function(arglist__8084) {
      var f = cljs.core.first(arglist__8084);
      var coll = cljs.core.first(cljs.core.next(arglist__8084));
      var colls = cljs.core.rest(cljs.core.next(arglist__8084));
      return G__8083__delegate(f, coll, colls)
    };
    G__8083.cljs$lang$arity$variadic = G__8083__delegate;
    return G__8083
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
    var temp__3974__auto____8094 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____8094) {
      var s__8095 = temp__3974__auto____8094;
      if(cljs.core.chunked_seq_QMARK_.call(null, s__8095)) {
        var c__8096 = cljs.core.chunk_first.call(null, s__8095);
        var size__8097 = cljs.core.count.call(null, c__8096);
        var b__8098 = cljs.core.chunk_buffer.call(null, size__8097);
        var n__2527__auto____8099 = size__8097;
        var i__8100 = 0;
        while(true) {
          if(i__8100 < n__2527__auto____8099) {
            if(cljs.core.truth_(pred.call(null, cljs.core._nth.call(null, c__8096, i__8100)))) {
              cljs.core.chunk_append.call(null, b__8098, cljs.core._nth.call(null, c__8096, i__8100))
            }else {
            }
            var G__8103 = i__8100 + 1;
            i__8100 = G__8103;
            continue
          }else {
          }
          break
        }
        return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__8098), filter.call(null, pred, cljs.core.chunk_rest.call(null, s__8095)))
      }else {
        var f__8101 = cljs.core.first.call(null, s__8095);
        var r__8102 = cljs.core.rest.call(null, s__8095);
        if(cljs.core.truth_(pred.call(null, f__8101))) {
          return cljs.core.cons.call(null, f__8101, filter.call(null, pred, r__8102))
        }else {
          return filter.call(null, pred, r__8102)
        }
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.remove = function remove(pred, coll) {
  return cljs.core.filter.call(null, cljs.core.complement.call(null, pred), coll)
};
cljs.core.tree_seq = function tree_seq(branch_QMARK_, children, root) {
  var walk__8106 = function walk(node) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, node, cljs.core.truth_(branch_QMARK_.call(null, node)) ? cljs.core.mapcat.call(null, walk, children.call(null, node)) : null)
    }, null)
  };
  return walk__8106.call(null, root)
};
cljs.core.flatten = function flatten(x) {
  return cljs.core.filter.call(null, function(p1__8104_SHARP_) {
    return!cljs.core.sequential_QMARK_.call(null, p1__8104_SHARP_)
  }, cljs.core.rest.call(null, cljs.core.tree_seq.call(null, cljs.core.sequential_QMARK_, cljs.core.seq, x)))
};
cljs.core.into = function into(to, from) {
  if(function() {
    var G__8110__8111 = to;
    if(G__8110__8111) {
      if(function() {
        var or__3824__auto____8112 = G__8110__8111.cljs$lang$protocol_mask$partition1$ & 1;
        if(or__3824__auto____8112) {
          return or__3824__auto____8112
        }else {
          return G__8110__8111.cljs$core$IEditableCollection$
        }
      }()) {
        return true
      }else {
        if(!G__8110__8111.cljs$lang$protocol_mask$partition1$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IEditableCollection, G__8110__8111)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IEditableCollection, G__8110__8111)
    }
  }()) {
    return cljs.core.persistent_BANG_.call(null, cljs.core.reduce.call(null, cljs.core._conj_BANG_, cljs.core.transient$.call(null, to), from))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, to, from)
  }
};
cljs.core.mapv = function() {
  var mapv = null;
  var mapv__2 = function(f, coll) {
    return cljs.core.persistent_BANG_.call(null, cljs.core.reduce.call(null, function(v, o) {
      return cljs.core.conj_BANG_.call(null, v, f.call(null, o))
    }, cljs.core.transient$.call(null, cljs.core.PersistentVector.EMPTY), coll))
  };
  var mapv__3 = function(f, c1, c2) {
    return cljs.core.into.call(null, cljs.core.PersistentVector.EMPTY, cljs.core.map.call(null, f, c1, c2))
  };
  var mapv__4 = function(f, c1, c2, c3) {
    return cljs.core.into.call(null, cljs.core.PersistentVector.EMPTY, cljs.core.map.call(null, f, c1, c2, c3))
  };
  var mapv__5 = function() {
    var G__8113__delegate = function(f, c1, c2, c3, colls) {
      return cljs.core.into.call(null, cljs.core.PersistentVector.EMPTY, cljs.core.apply.call(null, cljs.core.map, f, c1, c2, c3, colls))
    };
    var G__8113 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__8113__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__8113.cljs$lang$maxFixedArity = 4;
    G__8113.cljs$lang$applyTo = function(arglist__8114) {
      var f = cljs.core.first(arglist__8114);
      var c1 = cljs.core.first(cljs.core.next(arglist__8114));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8114)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__8114))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__8114))));
      return G__8113__delegate(f, c1, c2, c3, colls)
    };
    G__8113.cljs$lang$arity$variadic = G__8113__delegate;
    return G__8113
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
  return cljs.core.persistent_BANG_.call(null, cljs.core.reduce.call(null, function(v, o) {
    if(cljs.core.truth_(pred.call(null, o))) {
      return cljs.core.conj_BANG_.call(null, v, o)
    }else {
      return v
    }
  }, cljs.core.transient$.call(null, cljs.core.PersistentVector.EMPTY), coll))
};
cljs.core.partition = function() {
  var partition = null;
  var partition__2 = function(n, coll) {
    return partition.call(null, n, n, coll)
  };
  var partition__3 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____8121 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____8121) {
        var s__8122 = temp__3974__auto____8121;
        var p__8123 = cljs.core.take.call(null, n, s__8122);
        if(n === cljs.core.count.call(null, p__8123)) {
          return cljs.core.cons.call(null, p__8123, partition.call(null, n, step, cljs.core.drop.call(null, step, s__8122)))
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
      var temp__3974__auto____8124 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____8124) {
        var s__8125 = temp__3974__auto____8124;
        var p__8126 = cljs.core.take.call(null, n, s__8125);
        if(n === cljs.core.count.call(null, p__8126)) {
          return cljs.core.cons.call(null, p__8126, partition.call(null, n, step, pad, cljs.core.drop.call(null, step, s__8125)))
        }else {
          return cljs.core.list.call(null, cljs.core.take.call(null, n, cljs.core.concat.call(null, p__8126, pad)))
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
    return cljs.core.reduce.call(null, cljs.core.get, m, ks)
  };
  var get_in__3 = function(m, ks, not_found) {
    var sentinel__8131 = cljs.core.lookup_sentinel;
    var m__8132 = m;
    var ks__8133 = cljs.core.seq.call(null, ks);
    while(true) {
      if(ks__8133) {
        var m__8134 = cljs.core._lookup.call(null, m__8132, cljs.core.first.call(null, ks__8133), sentinel__8131);
        if(sentinel__8131 === m__8134) {
          return not_found
        }else {
          var G__8135 = sentinel__8131;
          var G__8136 = m__8134;
          var G__8137 = cljs.core.next.call(null, ks__8133);
          sentinel__8131 = G__8135;
          m__8132 = G__8136;
          ks__8133 = G__8137;
          continue
        }
      }else {
        return m__8132
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
cljs.core.assoc_in = function assoc_in(m, p__8138, v) {
  var vec__8143__8144 = p__8138;
  var k__8145 = cljs.core.nth.call(null, vec__8143__8144, 0, null);
  var ks__8146 = cljs.core.nthnext.call(null, vec__8143__8144, 1);
  if(cljs.core.truth_(ks__8146)) {
    return cljs.core.assoc.call(null, m, k__8145, assoc_in.call(null, cljs.core._lookup.call(null, m, k__8145, null), ks__8146, v))
  }else {
    return cljs.core.assoc.call(null, m, k__8145, v)
  }
};
cljs.core.update_in = function() {
  var update_in__delegate = function(m, p__8147, f, args) {
    var vec__8152__8153 = p__8147;
    var k__8154 = cljs.core.nth.call(null, vec__8152__8153, 0, null);
    var ks__8155 = cljs.core.nthnext.call(null, vec__8152__8153, 1);
    if(cljs.core.truth_(ks__8155)) {
      return cljs.core.assoc.call(null, m, k__8154, cljs.core.apply.call(null, update_in, cljs.core._lookup.call(null, m, k__8154, null), ks__8155, f, args))
    }else {
      return cljs.core.assoc.call(null, m, k__8154, cljs.core.apply.call(null, f, cljs.core._lookup.call(null, m, k__8154, null), args))
    }
  };
  var update_in = function(m, p__8147, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return update_in__delegate.call(this, m, p__8147, f, args)
  };
  update_in.cljs$lang$maxFixedArity = 3;
  update_in.cljs$lang$applyTo = function(arglist__8156) {
    var m = cljs.core.first(arglist__8156);
    var p__8147 = cljs.core.first(cljs.core.next(arglist__8156));
    var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8156)));
    var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8156)));
    return update_in__delegate(m, p__8147, f, args)
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
  return cljs.core.list.call(null, "cljs.core/Vector")
};
cljs.core.Vector.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8159 = this;
  var h__2192__auto____8160 = this__8159.__hash;
  if(!(h__2192__auto____8160 == null)) {
    return h__2192__auto____8160
  }else {
    var h__2192__auto____8161 = cljs.core.hash_coll.call(null, coll);
    this__8159.__hash = h__2192__auto____8161;
    return h__2192__auto____8161
  }
};
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8162 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8163 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__8164 = this;
  var new_array__8165 = this__8164.array.slice();
  new_array__8165[k] = v;
  return new cljs.core.Vector(this__8164.meta, new_array__8165, null)
};
cljs.core.Vector.prototype.call = function() {
  var G__8196 = null;
  var G__8196__2 = function(this_sym8166, k) {
    var this__8168 = this;
    var this_sym8166__8169 = this;
    var coll__8170 = this_sym8166__8169;
    return coll__8170.cljs$core$ILookup$_lookup$arity$2(coll__8170, k)
  };
  var G__8196__3 = function(this_sym8167, k, not_found) {
    var this__8168 = this;
    var this_sym8167__8171 = this;
    var coll__8172 = this_sym8167__8171;
    return coll__8172.cljs$core$ILookup$_lookup$arity$3(coll__8172, k, not_found)
  };
  G__8196 = function(this_sym8167, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8196__2.call(this, this_sym8167, k);
      case 3:
        return G__8196__3.call(this, this_sym8167, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8196
}();
cljs.core.Vector.prototype.apply = function(this_sym8157, args8158) {
  var this__8173 = this;
  return this_sym8157.call.apply(this_sym8157, [this_sym8157].concat(args8158.slice()))
};
cljs.core.Vector.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8174 = this;
  var new_array__8175 = this__8174.array.slice();
  new_array__8175.push(o);
  return new cljs.core.Vector(this__8174.meta, new_array__8175, null)
};
cljs.core.Vector.prototype.toString = function() {
  var this__8176 = this;
  var this__8177 = this;
  return cljs.core.pr_str.call(null, this__8177)
};
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce$arity$2 = function(v, f) {
  var this__8178 = this;
  return cljs.core.ci_reduce.call(null, this__8178.array, f)
};
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce$arity$3 = function(v, f, start) {
  var this__8179 = this;
  return cljs.core.ci_reduce.call(null, this__8179.array, f, start)
};
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8180 = this;
  if(this__8180.array.length > 0) {
    var vector_seq__8181 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(i < this__8180.array.length) {
          return cljs.core.cons.call(null, this__8180.array[i], vector_seq.call(null, i + 1))
        }else {
          return null
        }
      }, null)
    };
    return vector_seq__8181.call(null, 0)
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8182 = this;
  return this__8182.array.length
};
cljs.core.Vector.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__8183 = this;
  var count__8184 = this__8183.array.length;
  if(count__8184 > 0) {
    return this__8183.array[count__8184 - 1]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__8185 = this;
  if(this__8185.array.length > 0) {
    var new_array__8186 = this__8185.array.slice();
    new_array__8186.pop();
    return new cljs.core.Vector(this__8185.meta, new_array__8186, null)
  }else {
    throw new Error("Can't pop empty vector");
  }
};
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(coll, n, val) {
  var this__8187 = this;
  return coll.cljs$core$IAssociative$_assoc$arity$3(coll, n, val)
};
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8188 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8189 = this;
  return new cljs.core.Vector(meta, this__8189.array, this__8189.__hash)
};
cljs.core.Vector.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8190 = this;
  return this__8190.meta
};
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__8191 = this;
  if(function() {
    var and__3822__auto____8192 = 0 <= n;
    if(and__3822__auto____8192) {
      return n < this__8191.array.length
    }else {
      return and__3822__auto____8192
    }
  }()) {
    return this__8191.array[n]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__8193 = this;
  if(function() {
    var and__3822__auto____8194 = 0 <= n;
    if(and__3822__auto____8194) {
      return n < this__8193.array.length
    }else {
      return and__3822__auto____8194
    }
  }()) {
    return this__8193.array[n]
  }else {
    return not_found
  }
};
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8195 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__8195.meta)
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
  return cljs.core.list.call(null, "cljs.core/VectorNode")
};
cljs.core.VectorNode;
cljs.core.pv_fresh_node = function pv_fresh_node(edit) {
  return new cljs.core.VectorNode(edit, cljs.core.make_array.call(null, 32))
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
  var cnt__8198 = pv.cnt;
  if(cnt__8198 < 32) {
    return 0
  }else {
    return cnt__8198 - 1 >>> 5 << 5
  }
};
cljs.core.new_path = function new_path(edit, level, node) {
  var ll__8204 = level;
  var ret__8205 = node;
  while(true) {
    if(ll__8204 === 0) {
      return ret__8205
    }else {
      var embed__8206 = ret__8205;
      var r__8207 = cljs.core.pv_fresh_node.call(null, edit);
      var ___8208 = cljs.core.pv_aset.call(null, r__8207, 0, embed__8206);
      var G__8209 = ll__8204 - 5;
      var G__8210 = r__8207;
      ll__8204 = G__8209;
      ret__8205 = G__8210;
      continue
    }
    break
  }
};
cljs.core.push_tail = function push_tail(pv, level, parent, tailnode) {
  var ret__8216 = cljs.core.pv_clone_node.call(null, parent);
  var subidx__8217 = pv.cnt - 1 >>> level & 31;
  if(5 === level) {
    cljs.core.pv_aset.call(null, ret__8216, subidx__8217, tailnode);
    return ret__8216
  }else {
    var child__8218 = cljs.core.pv_aget.call(null, parent, subidx__8217);
    if(!(child__8218 == null)) {
      var node_to_insert__8219 = push_tail.call(null, pv, level - 5, child__8218, tailnode);
      cljs.core.pv_aset.call(null, ret__8216, subidx__8217, node_to_insert__8219);
      return ret__8216
    }else {
      var node_to_insert__8220 = cljs.core.new_path.call(null, null, level - 5, tailnode);
      cljs.core.pv_aset.call(null, ret__8216, subidx__8217, node_to_insert__8220);
      return ret__8216
    }
  }
};
cljs.core.array_for = function array_for(pv, i) {
  if(function() {
    var and__3822__auto____8224 = 0 <= i;
    if(and__3822__auto____8224) {
      return i < pv.cnt
    }else {
      return and__3822__auto____8224
    }
  }()) {
    if(i >= cljs.core.tail_off.call(null, pv)) {
      return pv.tail
    }else {
      var node__8225 = pv.root;
      var level__8226 = pv.shift;
      while(true) {
        if(level__8226 > 0) {
          var G__8227 = cljs.core.pv_aget.call(null, node__8225, i >>> level__8226 & 31);
          var G__8228 = level__8226 - 5;
          node__8225 = G__8227;
          level__8226 = G__8228;
          continue
        }else {
          return node__8225.arr
        }
        break
      }
    }
  }else {
    throw new Error([cljs.core.str("No item "), cljs.core.str(i), cljs.core.str(" in vector of length "), cljs.core.str(pv.cnt)].join(""));
  }
};
cljs.core.do_assoc = function do_assoc(pv, level, node, i, val) {
  var ret__8231 = cljs.core.pv_clone_node.call(null, node);
  if(level === 0) {
    cljs.core.pv_aset.call(null, ret__8231, i & 31, val);
    return ret__8231
  }else {
    var subidx__8232 = i >>> level & 31;
    cljs.core.pv_aset.call(null, ret__8231, subidx__8232, do_assoc.call(null, pv, level - 5, cljs.core.pv_aget.call(null, node, subidx__8232), i, val));
    return ret__8231
  }
};
cljs.core.pop_tail = function pop_tail(pv, level, node) {
  var subidx__8238 = pv.cnt - 2 >>> level & 31;
  if(level > 5) {
    var new_child__8239 = pop_tail.call(null, pv, level - 5, cljs.core.pv_aget.call(null, node, subidx__8238));
    if(function() {
      var and__3822__auto____8240 = new_child__8239 == null;
      if(and__3822__auto____8240) {
        return subidx__8238 === 0
      }else {
        return and__3822__auto____8240
      }
    }()) {
      return null
    }else {
      var ret__8241 = cljs.core.pv_clone_node.call(null, node);
      cljs.core.pv_aset.call(null, ret__8241, subidx__8238, new_child__8239);
      return ret__8241
    }
  }else {
    if(subidx__8238 === 0) {
      return null
    }else {
      if("\ufdd0'else") {
        var ret__8242 = cljs.core.pv_clone_node.call(null, node);
        cljs.core.pv_aset.call(null, ret__8242, subidx__8238, null);
        return ret__8242
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
  return cljs.core.list.call(null, "cljs.core/PersistentVector")
};
cljs.core.PersistentVector.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__8245 = this;
  return new cljs.core.TransientVector(this__8245.cnt, this__8245.shift, cljs.core.tv_editable_root.call(null, this__8245.root), cljs.core.tv_editable_tail.call(null, this__8245.tail))
};
cljs.core.PersistentVector.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8246 = this;
  var h__2192__auto____8247 = this__8246.__hash;
  if(!(h__2192__auto____8247 == null)) {
    return h__2192__auto____8247
  }else {
    var h__2192__auto____8248 = cljs.core.hash_coll.call(null, coll);
    this__8246.__hash = h__2192__auto____8248;
    return h__2192__auto____8248
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8249 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8250 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__8251 = this;
  if(function() {
    var and__3822__auto____8252 = 0 <= k;
    if(and__3822__auto____8252) {
      return k < this__8251.cnt
    }else {
      return and__3822__auto____8252
    }
  }()) {
    if(cljs.core.tail_off.call(null, coll) <= k) {
      var new_tail__8253 = this__8251.tail.slice();
      new_tail__8253[k & 31] = v;
      return new cljs.core.PersistentVector(this__8251.meta, this__8251.cnt, this__8251.shift, this__8251.root, new_tail__8253, null)
    }else {
      return new cljs.core.PersistentVector(this__8251.meta, this__8251.cnt, this__8251.shift, cljs.core.do_assoc.call(null, coll, this__8251.shift, this__8251.root, k, v), this__8251.tail, null)
    }
  }else {
    if(k === this__8251.cnt) {
      return coll.cljs$core$ICollection$_conj$arity$2(coll, v)
    }else {
      if("\ufdd0'else") {
        throw new Error([cljs.core.str("Index "), cljs.core.str(k), cljs.core.str(" out of bounds  [0,"), cljs.core.str(this__8251.cnt), cljs.core.str("]")].join(""));
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentVector.prototype.call = function() {
  var G__8301 = null;
  var G__8301__2 = function(this_sym8254, k) {
    var this__8256 = this;
    var this_sym8254__8257 = this;
    var coll__8258 = this_sym8254__8257;
    return coll__8258.cljs$core$ILookup$_lookup$arity$2(coll__8258, k)
  };
  var G__8301__3 = function(this_sym8255, k, not_found) {
    var this__8256 = this;
    var this_sym8255__8259 = this;
    var coll__8260 = this_sym8255__8259;
    return coll__8260.cljs$core$ILookup$_lookup$arity$3(coll__8260, k, not_found)
  };
  G__8301 = function(this_sym8255, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8301__2.call(this, this_sym8255, k);
      case 3:
        return G__8301__3.call(this, this_sym8255, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8301
}();
cljs.core.PersistentVector.prototype.apply = function(this_sym8243, args8244) {
  var this__8261 = this;
  return this_sym8243.call.apply(this_sym8243, [this_sym8243].concat(args8244.slice()))
};
cljs.core.PersistentVector.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(v, f, init) {
  var this__8262 = this;
  var step_init__8263 = [0, init];
  var i__8264 = 0;
  while(true) {
    if(i__8264 < this__8262.cnt) {
      var arr__8265 = cljs.core.array_for.call(null, v, i__8264);
      var len__8266 = arr__8265.length;
      var init__8270 = function() {
        var j__8267 = 0;
        var init__8268 = step_init__8263[1];
        while(true) {
          if(j__8267 < len__8266) {
            var init__8269 = f.call(null, init__8268, j__8267 + i__8264, arr__8265[j__8267]);
            if(cljs.core.reduced_QMARK_.call(null, init__8269)) {
              return init__8269
            }else {
              var G__8302 = j__8267 + 1;
              var G__8303 = init__8269;
              j__8267 = G__8302;
              init__8268 = G__8303;
              continue
            }
          }else {
            step_init__8263[0] = len__8266;
            step_init__8263[1] = init__8268;
            return init__8268
          }
          break
        }
      }();
      if(cljs.core.reduced_QMARK_.call(null, init__8270)) {
        return cljs.core.deref.call(null, init__8270)
      }else {
        var G__8304 = i__8264 + step_init__8263[0];
        i__8264 = G__8304;
        continue
      }
    }else {
      return step_init__8263[1]
    }
    break
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8271 = this;
  if(this__8271.cnt - cljs.core.tail_off.call(null, coll) < 32) {
    var new_tail__8272 = this__8271.tail.slice();
    new_tail__8272.push(o);
    return new cljs.core.PersistentVector(this__8271.meta, this__8271.cnt + 1, this__8271.shift, this__8271.root, new_tail__8272, null)
  }else {
    var root_overflow_QMARK___8273 = this__8271.cnt >>> 5 > 1 << this__8271.shift;
    var new_shift__8274 = root_overflow_QMARK___8273 ? this__8271.shift + 5 : this__8271.shift;
    var new_root__8276 = root_overflow_QMARK___8273 ? function() {
      var n_r__8275 = cljs.core.pv_fresh_node.call(null, null);
      cljs.core.pv_aset.call(null, n_r__8275, 0, this__8271.root);
      cljs.core.pv_aset.call(null, n_r__8275, 1, cljs.core.new_path.call(null, null, this__8271.shift, new cljs.core.VectorNode(null, this__8271.tail)));
      return n_r__8275
    }() : cljs.core.push_tail.call(null, coll, this__8271.shift, this__8271.root, new cljs.core.VectorNode(null, this__8271.tail));
    return new cljs.core.PersistentVector(this__8271.meta, this__8271.cnt + 1, new_shift__8274, new_root__8276, [o], null)
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__8277 = this;
  if(this__8277.cnt > 0) {
    return new cljs.core.RSeq(coll, this__8277.cnt - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IMapEntry$_key$arity$1 = function(coll) {
  var this__8278 = this;
  return coll.cljs$core$IIndexed$_nth$arity$2(coll, 0)
};
cljs.core.PersistentVector.prototype.cljs$core$IMapEntry$_val$arity$1 = function(coll) {
  var this__8279 = this;
  return coll.cljs$core$IIndexed$_nth$arity$2(coll, 1)
};
cljs.core.PersistentVector.prototype.toString = function() {
  var this__8280 = this;
  var this__8281 = this;
  return cljs.core.pr_str.call(null, this__8281)
};
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce$arity$2 = function(v, f) {
  var this__8282 = this;
  return cljs.core.ci_reduce.call(null, v, f)
};
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce$arity$3 = function(v, f, start) {
  var this__8283 = this;
  return cljs.core.ci_reduce.call(null, v, f, start)
};
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8284 = this;
  if(this__8284.cnt === 0) {
    return null
  }else {
    return cljs.core.chunked_seq.call(null, coll, 0, 0)
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8285 = this;
  return this__8285.cnt
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__8286 = this;
  if(this__8286.cnt > 0) {
    return coll.cljs$core$IIndexed$_nth$arity$2(coll, this__8286.cnt - 1)
  }else {
    return null
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__8287 = this;
  if(this__8287.cnt === 0) {
    throw new Error("Can't pop empty vector");
  }else {
    if(1 === this__8287.cnt) {
      return cljs.core._with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__8287.meta)
    }else {
      if(1 < this__8287.cnt - cljs.core.tail_off.call(null, coll)) {
        return new cljs.core.PersistentVector(this__8287.meta, this__8287.cnt - 1, this__8287.shift, this__8287.root, this__8287.tail.slice(0, -1), null)
      }else {
        if("\ufdd0'else") {
          var new_tail__8288 = cljs.core.array_for.call(null, coll, this__8287.cnt - 2);
          var nr__8289 = cljs.core.pop_tail.call(null, coll, this__8287.shift, this__8287.root);
          var new_root__8290 = nr__8289 == null ? cljs.core.PersistentVector.EMPTY_NODE : nr__8289;
          var cnt_1__8291 = this__8287.cnt - 1;
          if(function() {
            var and__3822__auto____8292 = 5 < this__8287.shift;
            if(and__3822__auto____8292) {
              return cljs.core.pv_aget.call(null, new_root__8290, 1) == null
            }else {
              return and__3822__auto____8292
            }
          }()) {
            return new cljs.core.PersistentVector(this__8287.meta, cnt_1__8291, this__8287.shift - 5, cljs.core.pv_aget.call(null, new_root__8290, 0), new_tail__8288, null)
          }else {
            return new cljs.core.PersistentVector(this__8287.meta, cnt_1__8291, this__8287.shift, new_root__8290, new_tail__8288, null)
          }
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(coll, n, val) {
  var this__8293 = this;
  return coll.cljs$core$IAssociative$_assoc$arity$3(coll, n, val)
};
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8294 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8295 = this;
  return new cljs.core.PersistentVector(meta, this__8295.cnt, this__8295.shift, this__8295.root, this__8295.tail, this__8295.__hash)
};
cljs.core.PersistentVector.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8296 = this;
  return this__8296.meta
};
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__8297 = this;
  return cljs.core.array_for.call(null, coll, n)[n & 31]
};
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__8298 = this;
  if(function() {
    var and__3822__auto____8299 = 0 <= n;
    if(and__3822__auto____8299) {
      return n < this__8298.cnt
    }else {
      return and__3822__auto____8299
    }
  }()) {
    return coll.cljs$core$IIndexed$_nth$arity$2(coll, n)
  }else {
    return not_found
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8300 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__8300.meta)
};
cljs.core.PersistentVector;
cljs.core.PersistentVector.EMPTY_NODE = cljs.core.pv_fresh_node.call(null, null);
cljs.core.PersistentVector.EMPTY = new cljs.core.PersistentVector(null, 0, 5, cljs.core.PersistentVector.EMPTY_NODE, [], 0);
cljs.core.PersistentVector.fromArray = function(xs, no_clone) {
  var l__8305 = xs.length;
  var xs__8306 = no_clone === true ? xs : xs.slice();
  if(l__8305 < 32) {
    return new cljs.core.PersistentVector(null, l__8305, 5, cljs.core.PersistentVector.EMPTY_NODE, xs__8306, null)
  }else {
    var node__8307 = xs__8306.slice(0, 32);
    var v__8308 = new cljs.core.PersistentVector(null, 32, 5, cljs.core.PersistentVector.EMPTY_NODE, node__8307, null);
    var i__8309 = 32;
    var out__8310 = cljs.core._as_transient.call(null, v__8308);
    while(true) {
      if(i__8309 < l__8305) {
        var G__8311 = i__8309 + 1;
        var G__8312 = cljs.core.conj_BANG_.call(null, out__8310, xs__8306[i__8309]);
        i__8309 = G__8311;
        out__8310 = G__8312;
        continue
      }else {
        return cljs.core.persistent_BANG_.call(null, out__8310)
      }
      break
    }
  }
};
cljs.core.vec = function vec(coll) {
  return cljs.core._persistent_BANG_.call(null, cljs.core.reduce.call(null, cljs.core._conj_BANG_, cljs.core._as_transient.call(null, cljs.core.PersistentVector.EMPTY), coll))
};
cljs.core.vector = function() {
  var vector__delegate = function(args) {
    return cljs.core.vec.call(null, args)
  };
  var vector = function(var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return vector__delegate.call(this, args)
  };
  vector.cljs$lang$maxFixedArity = 0;
  vector.cljs$lang$applyTo = function(arglist__8313) {
    var args = cljs.core.seq(arglist__8313);
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
  return cljs.core.list.call(null, "cljs.core/ChunkedSeq")
};
cljs.core.ChunkedSeq.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__8314 = this;
  if(this__8314.off + 1 < this__8314.node.length) {
    var s__8315 = cljs.core.chunked_seq.call(null, this__8314.vec, this__8314.node, this__8314.i, this__8314.off + 1);
    if(s__8315 == null) {
      return null
    }else {
      return s__8315
    }
  }else {
    return coll.cljs$core$IChunkedNext$_chunked_next$arity$1(coll)
  }
};
cljs.core.ChunkedSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8316 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.ChunkedSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8317 = this;
  return coll
};
cljs.core.ChunkedSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__8318 = this;
  return this__8318.node[this__8318.off]
};
cljs.core.ChunkedSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__8319 = this;
  if(this__8319.off + 1 < this__8319.node.length) {
    var s__8320 = cljs.core.chunked_seq.call(null, this__8319.vec, this__8319.node, this__8319.i, this__8319.off + 1);
    if(s__8320 == null) {
      return cljs.core.List.EMPTY
    }else {
      return s__8320
    }
  }else {
    return coll.cljs$core$IChunkedSeq$_chunked_rest$arity$1(coll)
  }
};
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedNext$ = true;
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedNext$_chunked_next$arity$1 = function(coll) {
  var this__8321 = this;
  var l__8322 = this__8321.node.length;
  var s__8323 = this__8321.i + l__8322 < cljs.core._count.call(null, this__8321.vec) ? cljs.core.chunked_seq.call(null, this__8321.vec, this__8321.i + l__8322, 0) : null;
  if(s__8323 == null) {
    return null
  }else {
    return s__8323
  }
};
cljs.core.ChunkedSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8324 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, m) {
  var this__8325 = this;
  return cljs.core.chunked_seq.call(null, this__8325.vec, this__8325.node, this__8325.i, this__8325.off, m)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IWithMeta$_meta$arity$1 = function(coll) {
  var this__8326 = this;
  return this__8326.meta
};
cljs.core.ChunkedSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8327 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__8327.meta)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedSeq$ = true;
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedSeq$_chunked_first$arity$1 = function(coll) {
  var this__8328 = this;
  return cljs.core.array_chunk.call(null, this__8328.node, this__8328.off)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedSeq$_chunked_rest$arity$1 = function(coll) {
  var this__8329 = this;
  var l__8330 = this__8329.node.length;
  var s__8331 = this__8329.i + l__8330 < cljs.core._count.call(null, this__8329.vec) ? cljs.core.chunked_seq.call(null, this__8329.vec, this__8329.i + l__8330, 0) : null;
  if(s__8331 == null) {
    return cljs.core.List.EMPTY
  }else {
    return s__8331
  }
};
cljs.core.ChunkedSeq;
cljs.core.chunked_seq = function() {
  var chunked_seq = null;
  var chunked_seq__3 = function(vec, i, off) {
    return chunked_seq.call(null, vec, cljs.core.array_for.call(null, vec, i), i, off, null)
  };
  var chunked_seq__4 = function(vec, node, i, off) {
    return chunked_seq.call(null, vec, node, i, off, null)
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
  return cljs.core.list.call(null, "cljs.core/Subvec")
};
cljs.core.Subvec.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8334 = this;
  var h__2192__auto____8335 = this__8334.__hash;
  if(!(h__2192__auto____8335 == null)) {
    return h__2192__auto____8335
  }else {
    var h__2192__auto____8336 = cljs.core.hash_coll.call(null, coll);
    this__8334.__hash = h__2192__auto____8336;
    return h__2192__auto____8336
  }
};
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8337 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8338 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, key, val) {
  var this__8339 = this;
  var v_pos__8340 = this__8339.start + key;
  return new cljs.core.Subvec(this__8339.meta, cljs.core._assoc.call(null, this__8339.v, v_pos__8340, val), this__8339.start, this__8339.end > v_pos__8340 + 1 ? this__8339.end : v_pos__8340 + 1, null)
};
cljs.core.Subvec.prototype.call = function() {
  var G__8366 = null;
  var G__8366__2 = function(this_sym8341, k) {
    var this__8343 = this;
    var this_sym8341__8344 = this;
    var coll__8345 = this_sym8341__8344;
    return coll__8345.cljs$core$ILookup$_lookup$arity$2(coll__8345, k)
  };
  var G__8366__3 = function(this_sym8342, k, not_found) {
    var this__8343 = this;
    var this_sym8342__8346 = this;
    var coll__8347 = this_sym8342__8346;
    return coll__8347.cljs$core$ILookup$_lookup$arity$3(coll__8347, k, not_found)
  };
  G__8366 = function(this_sym8342, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8366__2.call(this, this_sym8342, k);
      case 3:
        return G__8366__3.call(this, this_sym8342, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8366
}();
cljs.core.Subvec.prototype.apply = function(this_sym8332, args8333) {
  var this__8348 = this;
  return this_sym8332.call.apply(this_sym8332, [this_sym8332].concat(args8333.slice()))
};
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8349 = this;
  return new cljs.core.Subvec(this__8349.meta, cljs.core._assoc_n.call(null, this__8349.v, this__8349.end, o), this__8349.start, this__8349.end + 1, null)
};
cljs.core.Subvec.prototype.toString = function() {
  var this__8350 = this;
  var this__8351 = this;
  return cljs.core.pr_str.call(null, this__8351)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce$arity$2 = function(coll, f) {
  var this__8352 = this;
  return cljs.core.ci_reduce.call(null, coll, f)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce$arity$3 = function(coll, f, start) {
  var this__8353 = this;
  return cljs.core.ci_reduce.call(null, coll, f, start)
};
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8354 = this;
  var subvec_seq__8355 = function subvec_seq(i) {
    if(i === this__8354.end) {
      return null
    }else {
      return cljs.core.cons.call(null, cljs.core._nth.call(null, this__8354.v, i), new cljs.core.LazySeq(null, false, function() {
        return subvec_seq.call(null, i + 1)
      }, null))
    }
  };
  return subvec_seq__8355.call(null, this__8354.start)
};
cljs.core.Subvec.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8356 = this;
  return this__8356.end - this__8356.start
};
cljs.core.Subvec.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__8357 = this;
  return cljs.core._nth.call(null, this__8357.v, this__8357.end - 1)
};
cljs.core.Subvec.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__8358 = this;
  if(this__8358.start === this__8358.end) {
    throw new Error("Can't pop empty vector");
  }else {
    return new cljs.core.Subvec(this__8358.meta, this__8358.v, this__8358.start, this__8358.end - 1, null)
  }
};
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(coll, n, val) {
  var this__8359 = this;
  return coll.cljs$core$IAssociative$_assoc$arity$3(coll, n, val)
};
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8360 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8361 = this;
  return new cljs.core.Subvec(meta, this__8361.v, this__8361.start, this__8361.end, this__8361.__hash)
};
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8362 = this;
  return this__8362.meta
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__8363 = this;
  return cljs.core._nth.call(null, this__8363.v, this__8363.start + n)
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__8364 = this;
  return cljs.core._nth.call(null, this__8364.v, this__8364.start + n, not_found)
};
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8365 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__8365.meta)
};
cljs.core.Subvec;
cljs.core.subvec = function() {
  var subvec = null;
  var subvec__2 = function(v, start) {
    return subvec.call(null, v, start, cljs.core.count.call(null, v))
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
  var ret__8368 = cljs.core.make_array.call(null, 32);
  cljs.core.array_copy.call(null, tl, 0, ret__8368, 0, tl.length);
  return ret__8368
};
cljs.core.tv_push_tail = function tv_push_tail(tv, level, parent, tail_node) {
  var ret__8372 = cljs.core.tv_ensure_editable.call(null, tv.root.edit, parent);
  var subidx__8373 = tv.cnt - 1 >>> level & 31;
  cljs.core.pv_aset.call(null, ret__8372, subidx__8373, level === 5 ? tail_node : function() {
    var child__8374 = cljs.core.pv_aget.call(null, ret__8372, subidx__8373);
    if(!(child__8374 == null)) {
      return tv_push_tail.call(null, tv, level - 5, child__8374, tail_node)
    }else {
      return cljs.core.new_path.call(null, tv.root.edit, level - 5, tail_node)
    }
  }());
  return ret__8372
};
cljs.core.tv_pop_tail = function tv_pop_tail(tv, level, node) {
  var node__8379 = cljs.core.tv_ensure_editable.call(null, tv.root.edit, node);
  var subidx__8380 = tv.cnt - 2 >>> level & 31;
  if(level > 5) {
    var new_child__8381 = tv_pop_tail.call(null, tv, level - 5, cljs.core.pv_aget.call(null, node__8379, subidx__8380));
    if(function() {
      var and__3822__auto____8382 = new_child__8381 == null;
      if(and__3822__auto____8382) {
        return subidx__8380 === 0
      }else {
        return and__3822__auto____8382
      }
    }()) {
      return null
    }else {
      cljs.core.pv_aset.call(null, node__8379, subidx__8380, new_child__8381);
      return node__8379
    }
  }else {
    if(subidx__8380 === 0) {
      return null
    }else {
      if("\ufdd0'else") {
        cljs.core.pv_aset.call(null, node__8379, subidx__8380, null);
        return node__8379
      }else {
        return null
      }
    }
  }
};
cljs.core.editable_array_for = function editable_array_for(tv, i) {
  if(function() {
    var and__3822__auto____8387 = 0 <= i;
    if(and__3822__auto____8387) {
      return i < tv.cnt
    }else {
      return and__3822__auto____8387
    }
  }()) {
    if(i >= cljs.core.tail_off.call(null, tv)) {
      return tv.tail
    }else {
      var root__8388 = tv.root;
      var node__8389 = root__8388;
      var level__8390 = tv.shift;
      while(true) {
        if(level__8390 > 0) {
          var G__8391 = cljs.core.tv_ensure_editable.call(null, root__8388.edit, cljs.core.pv_aget.call(null, node__8389, i >>> level__8390 & 31));
          var G__8392 = level__8390 - 5;
          node__8389 = G__8391;
          level__8390 = G__8392;
          continue
        }else {
          return node__8389.arr
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
  return cljs.core.list.call(null, "cljs.core/TransientVector")
};
cljs.core.TransientVector.prototype.call = function() {
  var G__8432 = null;
  var G__8432__2 = function(this_sym8395, k) {
    var this__8397 = this;
    var this_sym8395__8398 = this;
    var coll__8399 = this_sym8395__8398;
    return coll__8399.cljs$core$ILookup$_lookup$arity$2(coll__8399, k)
  };
  var G__8432__3 = function(this_sym8396, k, not_found) {
    var this__8397 = this;
    var this_sym8396__8400 = this;
    var coll__8401 = this_sym8396__8400;
    return coll__8401.cljs$core$ILookup$_lookup$arity$3(coll__8401, k, not_found)
  };
  G__8432 = function(this_sym8396, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8432__2.call(this, this_sym8396, k);
      case 3:
        return G__8432__3.call(this, this_sym8396, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8432
}();
cljs.core.TransientVector.prototype.apply = function(this_sym8393, args8394) {
  var this__8402 = this;
  return this_sym8393.call.apply(this_sym8393, [this_sym8393].concat(args8394.slice()))
};
cljs.core.TransientVector.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8403 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.TransientVector.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8404 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.TransientVector.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__8405 = this;
  if(this__8405.root.edit) {
    return cljs.core.array_for.call(null, coll, n)[n & 31]
  }else {
    throw new Error("nth after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__8406 = this;
  if(function() {
    var and__3822__auto____8407 = 0 <= n;
    if(and__3822__auto____8407) {
      return n < this__8406.cnt
    }else {
      return and__3822__auto____8407
    }
  }()) {
    return coll.cljs$core$IIndexed$_nth$arity$2(coll, n)
  }else {
    return not_found
  }
};
cljs.core.TransientVector.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8408 = this;
  if(this__8408.root.edit) {
    return this__8408.cnt
  }else {
    throw new Error("count after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3 = function(tcoll, n, val) {
  var this__8409 = this;
  if(this__8409.root.edit) {
    if(function() {
      var and__3822__auto____8410 = 0 <= n;
      if(and__3822__auto____8410) {
        return n < this__8409.cnt
      }else {
        return and__3822__auto____8410
      }
    }()) {
      if(cljs.core.tail_off.call(null, tcoll) <= n) {
        this__8409.tail[n & 31] = val;
        return tcoll
      }else {
        var new_root__8415 = function go(level, node) {
          var node__8413 = cljs.core.tv_ensure_editable.call(null, this__8409.root.edit, node);
          if(level === 0) {
            cljs.core.pv_aset.call(null, node__8413, n & 31, val);
            return node__8413
          }else {
            var subidx__8414 = n >>> level & 31;
            cljs.core.pv_aset.call(null, node__8413, subidx__8414, go.call(null, level - 5, cljs.core.pv_aget.call(null, node__8413, subidx__8414)));
            return node__8413
          }
        }.call(null, this__8409.shift, this__8409.root);
        this__8409.root = new_root__8415;
        return tcoll
      }
    }else {
      if(n === this__8409.cnt) {
        return tcoll.cljs$core$ITransientCollection$_conj_BANG_$arity$2(tcoll, val)
      }else {
        if("\ufdd0'else") {
          throw new Error([cljs.core.str("Index "), cljs.core.str(n), cljs.core.str(" out of bounds for TransientVector of length"), cljs.core.str(this__8409.cnt)].join(""));
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
  var this__8416 = this;
  if(this__8416.root.edit) {
    if(this__8416.cnt === 0) {
      throw new Error("Can't pop empty vector");
    }else {
      if(1 === this__8416.cnt) {
        this__8416.cnt = 0;
        return tcoll
      }else {
        if((this__8416.cnt - 1 & 31) > 0) {
          this__8416.cnt = this__8416.cnt - 1;
          return tcoll
        }else {
          if("\ufdd0'else") {
            var new_tail__8417 = cljs.core.editable_array_for.call(null, tcoll, this__8416.cnt - 2);
            var new_root__8419 = function() {
              var nr__8418 = cljs.core.tv_pop_tail.call(null, tcoll, this__8416.shift, this__8416.root);
              if(!(nr__8418 == null)) {
                return nr__8418
              }else {
                return new cljs.core.VectorNode(this__8416.root.edit, cljs.core.make_array.call(null, 32))
              }
            }();
            if(function() {
              var and__3822__auto____8420 = 5 < this__8416.shift;
              if(and__3822__auto____8420) {
                return cljs.core.pv_aget.call(null, new_root__8419, 1) == null
              }else {
                return and__3822__auto____8420
              }
            }()) {
              var new_root__8421 = cljs.core.tv_ensure_editable.call(null, this__8416.root.edit, cljs.core.pv_aget.call(null, new_root__8419, 0));
              this__8416.root = new_root__8421;
              this__8416.shift = this__8416.shift - 5;
              this__8416.cnt = this__8416.cnt - 1;
              this__8416.tail = new_tail__8417;
              return tcoll
            }else {
              this__8416.root = new_root__8419;
              this__8416.cnt = this__8416.cnt - 1;
              this__8416.tail = new_tail__8417;
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
  var this__8422 = this;
  return tcoll.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3(tcoll, key, val)
};
cljs.core.TransientVector.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, o) {
  var this__8423 = this;
  if(this__8423.root.edit) {
    if(this__8423.cnt - cljs.core.tail_off.call(null, tcoll) < 32) {
      this__8423.tail[this__8423.cnt & 31] = o;
      this__8423.cnt = this__8423.cnt + 1;
      return tcoll
    }else {
      var tail_node__8424 = new cljs.core.VectorNode(this__8423.root.edit, this__8423.tail);
      var new_tail__8425 = cljs.core.make_array.call(null, 32);
      new_tail__8425[0] = o;
      this__8423.tail = new_tail__8425;
      if(this__8423.cnt >>> 5 > 1 << this__8423.shift) {
        var new_root_array__8426 = cljs.core.make_array.call(null, 32);
        var new_shift__8427 = this__8423.shift + 5;
        new_root_array__8426[0] = this__8423.root;
        new_root_array__8426[1] = cljs.core.new_path.call(null, this__8423.root.edit, this__8423.shift, tail_node__8424);
        this__8423.root = new cljs.core.VectorNode(this__8423.root.edit, new_root_array__8426);
        this__8423.shift = new_shift__8427;
        this__8423.cnt = this__8423.cnt + 1;
        return tcoll
      }else {
        var new_root__8428 = cljs.core.tv_push_tail.call(null, tcoll, this__8423.shift, this__8423.root, tail_node__8424);
        this__8423.root = new_root__8428;
        this__8423.cnt = this__8423.cnt + 1;
        return tcoll
      }
    }
  }else {
    throw new Error("conj! after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__8429 = this;
  if(this__8429.root.edit) {
    this__8429.root.edit = null;
    var len__8430 = this__8429.cnt - cljs.core.tail_off.call(null, tcoll);
    var trimmed_tail__8431 = cljs.core.make_array.call(null, len__8430);
    cljs.core.array_copy.call(null, this__8429.tail, 0, trimmed_tail__8431, 0, len__8430);
    return new cljs.core.PersistentVector(null, this__8429.cnt, this__8429.shift, this__8429.root, trimmed_tail__8431, null)
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
  return cljs.core.list.call(null, "cljs.core/PersistentQueueSeq")
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8433 = this;
  var h__2192__auto____8434 = this__8433.__hash;
  if(!(h__2192__auto____8434 == null)) {
    return h__2192__auto____8434
  }else {
    var h__2192__auto____8435 = cljs.core.hash_coll.call(null, coll);
    this__8433.__hash = h__2192__auto____8435;
    return h__2192__auto____8435
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8436 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentQueueSeq.prototype.toString = function() {
  var this__8437 = this;
  var this__8438 = this;
  return cljs.core.pr_str.call(null, this__8438)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8439 = this;
  return coll
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__8440 = this;
  return cljs.core._first.call(null, this__8440.front)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__8441 = this;
  var temp__3971__auto____8442 = cljs.core.next.call(null, this__8441.front);
  if(temp__3971__auto____8442) {
    var f1__8443 = temp__3971__auto____8442;
    return new cljs.core.PersistentQueueSeq(this__8441.meta, f1__8443, this__8441.rear, null)
  }else {
    if(this__8441.rear == null) {
      return coll.cljs$core$IEmptyableCollection$_empty$arity$1(coll)
    }else {
      return new cljs.core.PersistentQueueSeq(this__8441.meta, this__8441.rear, null, null)
    }
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8444 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8445 = this;
  return new cljs.core.PersistentQueueSeq(meta, this__8445.front, this__8445.rear, this__8445.__hash)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8446 = this;
  return this__8446.meta
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8447 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__8447.meta)
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
  return cljs.core.list.call(null, "cljs.core/PersistentQueue")
};
cljs.core.PersistentQueue.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8448 = this;
  var h__2192__auto____8449 = this__8448.__hash;
  if(!(h__2192__auto____8449 == null)) {
    return h__2192__auto____8449
  }else {
    var h__2192__auto____8450 = cljs.core.hash_coll.call(null, coll);
    this__8448.__hash = h__2192__auto____8450;
    return h__2192__auto____8450
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8451 = this;
  if(cljs.core.truth_(this__8451.front)) {
    return new cljs.core.PersistentQueue(this__8451.meta, this__8451.count + 1, this__8451.front, cljs.core.conj.call(null, function() {
      var or__3824__auto____8452 = this__8451.rear;
      if(cljs.core.truth_(or__3824__auto____8452)) {
        return or__3824__auto____8452
      }else {
        return cljs.core.PersistentVector.EMPTY
      }
    }(), o), null)
  }else {
    return new cljs.core.PersistentQueue(this__8451.meta, this__8451.count + 1, cljs.core.conj.call(null, this__8451.front, o), cljs.core.PersistentVector.EMPTY, null)
  }
};
cljs.core.PersistentQueue.prototype.toString = function() {
  var this__8453 = this;
  var this__8454 = this;
  return cljs.core.pr_str.call(null, this__8454)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8455 = this;
  var rear__8456 = cljs.core.seq.call(null, this__8455.rear);
  if(cljs.core.truth_(function() {
    var or__3824__auto____8457 = this__8455.front;
    if(cljs.core.truth_(or__3824__auto____8457)) {
      return or__3824__auto____8457
    }else {
      return rear__8456
    }
  }())) {
    return new cljs.core.PersistentQueueSeq(null, this__8455.front, cljs.core.seq.call(null, rear__8456), null)
  }else {
    return null
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8458 = this;
  return this__8458.count
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__8459 = this;
  return cljs.core._first.call(null, this__8459.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__8460 = this;
  if(cljs.core.truth_(this__8460.front)) {
    var temp__3971__auto____8461 = cljs.core.next.call(null, this__8460.front);
    if(temp__3971__auto____8461) {
      var f1__8462 = temp__3971__auto____8461;
      return new cljs.core.PersistentQueue(this__8460.meta, this__8460.count - 1, f1__8462, this__8460.rear, null)
    }else {
      return new cljs.core.PersistentQueue(this__8460.meta, this__8460.count - 1, cljs.core.seq.call(null, this__8460.rear), cljs.core.PersistentVector.EMPTY, null)
    }
  }else {
    return coll
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__8463 = this;
  return cljs.core.first.call(null, this__8463.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__8464 = this;
  return cljs.core.rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8465 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8466 = this;
  return new cljs.core.PersistentQueue(meta, this__8466.count, this__8466.front, this__8466.rear, this__8466.__hash)
};
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8467 = this;
  return this__8467.meta
};
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8468 = this;
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
  return cljs.core.list.call(null, "cljs.core/NeverEquiv")
};
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(o, other) {
  var this__8469 = this;
  return false
};
cljs.core.NeverEquiv;
cljs.core.never_equiv = new cljs.core.NeverEquiv;
cljs.core.equiv_map = function equiv_map(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.map_QMARK_.call(null, y) ? cljs.core.count.call(null, x) === cljs.core.count.call(null, y) ? cljs.core.every_QMARK_.call(null, cljs.core.identity, cljs.core.map.call(null, function(xkv) {
    return cljs.core._EQ_.call(null, cljs.core._lookup.call(null, y, cljs.core.first.call(null, xkv), cljs.core.never_equiv), cljs.core.second.call(null, xkv))
  }, x)) : null : null)
};
cljs.core.scan_array = function scan_array(incr, k, array) {
  var len__8472 = array.length;
  var i__8473 = 0;
  while(true) {
    if(i__8473 < len__8472) {
      if(k === array[i__8473]) {
        return i__8473
      }else {
        var G__8474 = i__8473 + incr;
        i__8473 = G__8474;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.obj_map_compare_keys = function obj_map_compare_keys(a, b) {
  var a__8477 = cljs.core.hash.call(null, a);
  var b__8478 = cljs.core.hash.call(null, b);
  if(a__8477 < b__8478) {
    return-1
  }else {
    if(a__8477 > b__8478) {
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
  var ks__8486 = m.keys;
  var len__8487 = ks__8486.length;
  var so__8488 = m.strobj;
  var out__8489 = cljs.core.with_meta.call(null, cljs.core.PersistentHashMap.EMPTY, cljs.core.meta.call(null, m));
  var i__8490 = 0;
  var out__8491 = cljs.core.transient$.call(null, out__8489);
  while(true) {
    if(i__8490 < len__8487) {
      var k__8492 = ks__8486[i__8490];
      var G__8493 = i__8490 + 1;
      var G__8494 = cljs.core.assoc_BANG_.call(null, out__8491, k__8492, so__8488[k__8492]);
      i__8490 = G__8493;
      out__8491 = G__8494;
      continue
    }else {
      return cljs.core.persistent_BANG_.call(null, cljs.core.assoc_BANG_.call(null, out__8491, k, v))
    }
    break
  }
};
cljs.core.obj_clone = function obj_clone(obj, ks) {
  var new_obj__8500 = {};
  var l__8501 = ks.length;
  var i__8502 = 0;
  while(true) {
    if(i__8502 < l__8501) {
      var k__8503 = ks[i__8502];
      new_obj__8500[k__8503] = obj[k__8503];
      var G__8504 = i__8502 + 1;
      i__8502 = G__8504;
      continue
    }else {
    }
    break
  }
  return new_obj__8500
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
  return cljs.core.list.call(null, "cljs.core/ObjMap")
};
cljs.core.ObjMap.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__8507 = this;
  return cljs.core.transient$.call(null, cljs.core.into.call(null, cljs.core.hash_map.call(null), coll))
};
cljs.core.ObjMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8508 = this;
  var h__2192__auto____8509 = this__8508.__hash;
  if(!(h__2192__auto____8509 == null)) {
    return h__2192__auto____8509
  }else {
    var h__2192__auto____8510 = cljs.core.hash_imap.call(null, coll);
    this__8508.__hash = h__2192__auto____8510;
    return h__2192__auto____8510
  }
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8511 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8512 = this;
  if(function() {
    var and__3822__auto____8513 = goog.isString(k);
    if(and__3822__auto____8513) {
      return!(cljs.core.scan_array.call(null, 1, k, this__8512.keys) == null)
    }else {
      return and__3822__auto____8513
    }
  }()) {
    return this__8512.strobj[k]
  }else {
    return not_found
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__8514 = this;
  if(goog.isString(k)) {
    if(function() {
      var or__3824__auto____8515 = this__8514.update_count > cljs.core.ObjMap.HASHMAP_THRESHOLD;
      if(or__3824__auto____8515) {
        return or__3824__auto____8515
      }else {
        return this__8514.keys.length >= cljs.core.ObjMap.HASHMAP_THRESHOLD
      }
    }()) {
      return cljs.core.obj_map__GT_hash_map.call(null, coll, k, v)
    }else {
      if(!(cljs.core.scan_array.call(null, 1, k, this__8514.keys) == null)) {
        var new_strobj__8516 = cljs.core.obj_clone.call(null, this__8514.strobj, this__8514.keys);
        new_strobj__8516[k] = v;
        return new cljs.core.ObjMap(this__8514.meta, this__8514.keys, new_strobj__8516, this__8514.update_count + 1, null)
      }else {
        var new_strobj__8517 = cljs.core.obj_clone.call(null, this__8514.strobj, this__8514.keys);
        var new_keys__8518 = this__8514.keys.slice();
        new_strobj__8517[k] = v;
        new_keys__8518.push(k);
        return new cljs.core.ObjMap(this__8514.meta, new_keys__8518, new_strobj__8517, this__8514.update_count + 1, null)
      }
    }
  }else {
    return cljs.core.obj_map__GT_hash_map.call(null, coll, k, v)
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__8519 = this;
  if(function() {
    var and__3822__auto____8520 = goog.isString(k);
    if(and__3822__auto____8520) {
      return!(cljs.core.scan_array.call(null, 1, k, this__8519.keys) == null)
    }else {
      return and__3822__auto____8520
    }
  }()) {
    return true
  }else {
    return false
  }
};
cljs.core.ObjMap.prototype.call = function() {
  var G__8542 = null;
  var G__8542__2 = function(this_sym8521, k) {
    var this__8523 = this;
    var this_sym8521__8524 = this;
    var coll__8525 = this_sym8521__8524;
    return coll__8525.cljs$core$ILookup$_lookup$arity$2(coll__8525, k)
  };
  var G__8542__3 = function(this_sym8522, k, not_found) {
    var this__8523 = this;
    var this_sym8522__8526 = this;
    var coll__8527 = this_sym8522__8526;
    return coll__8527.cljs$core$ILookup$_lookup$arity$3(coll__8527, k, not_found)
  };
  G__8542 = function(this_sym8522, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8542__2.call(this, this_sym8522, k);
      case 3:
        return G__8542__3.call(this, this_sym8522, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8542
}();
cljs.core.ObjMap.prototype.apply = function(this_sym8505, args8506) {
  var this__8528 = this;
  return this_sym8505.call.apply(this_sym8505, [this_sym8505].concat(args8506.slice()))
};
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__8529 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.ObjMap.prototype.toString = function() {
  var this__8530 = this;
  var this__8531 = this;
  return cljs.core.pr_str.call(null, this__8531)
};
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8532 = this;
  if(this__8532.keys.length > 0) {
    return cljs.core.map.call(null, function(p1__8495_SHARP_) {
      return cljs.core.vector.call(null, p1__8495_SHARP_, this__8532.strobj[p1__8495_SHARP_])
    }, this__8532.keys.sort(cljs.core.obj_map_compare_keys))
  }else {
    return null
  }
};
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8533 = this;
  return this__8533.keys.length
};
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8534 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8535 = this;
  return new cljs.core.ObjMap(meta, this__8535.keys, this__8535.strobj, this__8535.update_count, this__8535.__hash)
};
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8536 = this;
  return this__8536.meta
};
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8537 = this;
  return cljs.core.with_meta.call(null, cljs.core.ObjMap.EMPTY, this__8537.meta)
};
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__8538 = this;
  if(function() {
    var and__3822__auto____8539 = goog.isString(k);
    if(and__3822__auto____8539) {
      return!(cljs.core.scan_array.call(null, 1, k, this__8538.keys) == null)
    }else {
      return and__3822__auto____8539
    }
  }()) {
    var new_keys__8540 = this__8538.keys.slice();
    var new_strobj__8541 = cljs.core.obj_clone.call(null, this__8538.strobj, this__8538.keys);
    new_keys__8540.splice(cljs.core.scan_array.call(null, 1, k, new_keys__8540), 1);
    cljs.core.js_delete.call(null, new_strobj__8541, k);
    return new cljs.core.ObjMap(this__8538.meta, new_keys__8540, new_strobj__8541, this__8538.update_count + 1, null)
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
  return cljs.core.list.call(null, "cljs.core/HashMap")
};
cljs.core.HashMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8546 = this;
  var h__2192__auto____8547 = this__8546.__hash;
  if(!(h__2192__auto____8547 == null)) {
    return h__2192__auto____8547
  }else {
    var h__2192__auto____8548 = cljs.core.hash_imap.call(null, coll);
    this__8546.__hash = h__2192__auto____8548;
    return h__2192__auto____8548
  }
};
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8549 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8550 = this;
  var bucket__8551 = this__8550.hashobj[cljs.core.hash.call(null, k)];
  var i__8552 = cljs.core.truth_(bucket__8551) ? cljs.core.scan_array.call(null, 2, k, bucket__8551) : null;
  if(cljs.core.truth_(i__8552)) {
    return bucket__8551[i__8552 + 1]
  }else {
    return not_found
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__8553 = this;
  var h__8554 = cljs.core.hash.call(null, k);
  var bucket__8555 = this__8553.hashobj[h__8554];
  if(cljs.core.truth_(bucket__8555)) {
    var new_bucket__8556 = bucket__8555.slice();
    var new_hashobj__8557 = goog.object.clone(this__8553.hashobj);
    new_hashobj__8557[h__8554] = new_bucket__8556;
    var temp__3971__auto____8558 = cljs.core.scan_array.call(null, 2, k, new_bucket__8556);
    if(cljs.core.truth_(temp__3971__auto____8558)) {
      var i__8559 = temp__3971__auto____8558;
      new_bucket__8556[i__8559 + 1] = v;
      return new cljs.core.HashMap(this__8553.meta, this__8553.count, new_hashobj__8557, null)
    }else {
      new_bucket__8556.push(k, v);
      return new cljs.core.HashMap(this__8553.meta, this__8553.count + 1, new_hashobj__8557, null)
    }
  }else {
    var new_hashobj__8560 = goog.object.clone(this__8553.hashobj);
    new_hashobj__8560[h__8554] = [k, v];
    return new cljs.core.HashMap(this__8553.meta, this__8553.count + 1, new_hashobj__8560, null)
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__8561 = this;
  var bucket__8562 = this__8561.hashobj[cljs.core.hash.call(null, k)];
  var i__8563 = cljs.core.truth_(bucket__8562) ? cljs.core.scan_array.call(null, 2, k, bucket__8562) : null;
  if(cljs.core.truth_(i__8563)) {
    return true
  }else {
    return false
  }
};
cljs.core.HashMap.prototype.call = function() {
  var G__8588 = null;
  var G__8588__2 = function(this_sym8564, k) {
    var this__8566 = this;
    var this_sym8564__8567 = this;
    var coll__8568 = this_sym8564__8567;
    return coll__8568.cljs$core$ILookup$_lookup$arity$2(coll__8568, k)
  };
  var G__8588__3 = function(this_sym8565, k, not_found) {
    var this__8566 = this;
    var this_sym8565__8569 = this;
    var coll__8570 = this_sym8565__8569;
    return coll__8570.cljs$core$ILookup$_lookup$arity$3(coll__8570, k, not_found)
  };
  G__8588 = function(this_sym8565, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8588__2.call(this, this_sym8565, k);
      case 3:
        return G__8588__3.call(this, this_sym8565, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8588
}();
cljs.core.HashMap.prototype.apply = function(this_sym8544, args8545) {
  var this__8571 = this;
  return this_sym8544.call.apply(this_sym8544, [this_sym8544].concat(args8545.slice()))
};
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__8572 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.HashMap.prototype.toString = function() {
  var this__8573 = this;
  var this__8574 = this;
  return cljs.core.pr_str.call(null, this__8574)
};
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8575 = this;
  if(this__8575.count > 0) {
    var hashes__8576 = cljs.core.js_keys.call(null, this__8575.hashobj).sort();
    return cljs.core.mapcat.call(null, function(p1__8543_SHARP_) {
      return cljs.core.map.call(null, cljs.core.vec, cljs.core.partition.call(null, 2, this__8575.hashobj[p1__8543_SHARP_]))
    }, hashes__8576)
  }else {
    return null
  }
};
cljs.core.HashMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8577 = this;
  return this__8577.count
};
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8578 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8579 = this;
  return new cljs.core.HashMap(meta, this__8579.count, this__8579.hashobj, this__8579.__hash)
};
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8580 = this;
  return this__8580.meta
};
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8581 = this;
  return cljs.core.with_meta.call(null, cljs.core.HashMap.EMPTY, this__8581.meta)
};
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__8582 = this;
  var h__8583 = cljs.core.hash.call(null, k);
  var bucket__8584 = this__8582.hashobj[h__8583];
  var i__8585 = cljs.core.truth_(bucket__8584) ? cljs.core.scan_array.call(null, 2, k, bucket__8584) : null;
  if(cljs.core.not.call(null, i__8585)) {
    return coll
  }else {
    var new_hashobj__8586 = goog.object.clone(this__8582.hashobj);
    if(3 > bucket__8584.length) {
      cljs.core.js_delete.call(null, new_hashobj__8586, h__8583)
    }else {
      var new_bucket__8587 = bucket__8584.slice();
      new_bucket__8587.splice(i__8585, 2);
      new_hashobj__8586[h__8583] = new_bucket__8587
    }
    return new cljs.core.HashMap(this__8582.meta, this__8582.count - 1, new_hashobj__8586, null)
  }
};
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = new cljs.core.HashMap(null, 0, {}, 0);
cljs.core.HashMap.fromArrays = function(ks, vs) {
  var len__8589 = ks.length;
  var i__8590 = 0;
  var out__8591 = cljs.core.HashMap.EMPTY;
  while(true) {
    if(i__8590 < len__8589) {
      var G__8592 = i__8590 + 1;
      var G__8593 = cljs.core.assoc.call(null, out__8591, ks[i__8590], vs[i__8590]);
      i__8590 = G__8592;
      out__8591 = G__8593;
      continue
    }else {
      return out__8591
    }
    break
  }
};
cljs.core.array_map_index_of = function array_map_index_of(m, k) {
  var arr__8597 = m.arr;
  var len__8598 = arr__8597.length;
  var i__8599 = 0;
  while(true) {
    if(len__8598 <= i__8599) {
      return-1
    }else {
      if(cljs.core._EQ_.call(null, arr__8597[i__8599], k)) {
        return i__8599
      }else {
        if("\ufdd0'else") {
          var G__8600 = i__8599 + 2;
          i__8599 = G__8600;
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
  return cljs.core.list.call(null, "cljs.core/PersistentArrayMap")
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__8603 = this;
  return new cljs.core.TransientArrayMap({}, this__8603.arr.length, this__8603.arr.slice())
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8604 = this;
  var h__2192__auto____8605 = this__8604.__hash;
  if(!(h__2192__auto____8605 == null)) {
    return h__2192__auto____8605
  }else {
    var h__2192__auto____8606 = cljs.core.hash_imap.call(null, coll);
    this__8604.__hash = h__2192__auto____8606;
    return h__2192__auto____8606
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8607 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8608 = this;
  var idx__8609 = cljs.core.array_map_index_of.call(null, coll, k);
  if(idx__8609 === -1) {
    return not_found
  }else {
    return this__8608.arr[idx__8609 + 1]
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__8610 = this;
  var idx__8611 = cljs.core.array_map_index_of.call(null, coll, k);
  if(idx__8611 === -1) {
    if(this__8610.cnt < cljs.core.PersistentArrayMap.HASHMAP_THRESHOLD) {
      return new cljs.core.PersistentArrayMap(this__8610.meta, this__8610.cnt + 1, function() {
        var G__8612__8613 = this__8610.arr.slice();
        G__8612__8613.push(k);
        G__8612__8613.push(v);
        return G__8612__8613
      }(), null)
    }else {
      return cljs.core.persistent_BANG_.call(null, cljs.core.assoc_BANG_.call(null, cljs.core.transient$.call(null, cljs.core.into.call(null, cljs.core.PersistentHashMap.EMPTY, coll)), k, v))
    }
  }else {
    if(v === this__8610.arr[idx__8611 + 1]) {
      return coll
    }else {
      if("\ufdd0'else") {
        return new cljs.core.PersistentArrayMap(this__8610.meta, this__8610.cnt, function() {
          var G__8614__8615 = this__8610.arr.slice();
          G__8614__8615[idx__8611 + 1] = v;
          return G__8614__8615
        }(), null)
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__8616 = this;
  return!(cljs.core.array_map_index_of.call(null, coll, k) === -1)
};
cljs.core.PersistentArrayMap.prototype.call = function() {
  var G__8648 = null;
  var G__8648__2 = function(this_sym8617, k) {
    var this__8619 = this;
    var this_sym8617__8620 = this;
    var coll__8621 = this_sym8617__8620;
    return coll__8621.cljs$core$ILookup$_lookup$arity$2(coll__8621, k)
  };
  var G__8648__3 = function(this_sym8618, k, not_found) {
    var this__8619 = this;
    var this_sym8618__8622 = this;
    var coll__8623 = this_sym8618__8622;
    return coll__8623.cljs$core$ILookup$_lookup$arity$3(coll__8623, k, not_found)
  };
  G__8648 = function(this_sym8618, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8648__2.call(this, this_sym8618, k);
      case 3:
        return G__8648__3.call(this, this_sym8618, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8648
}();
cljs.core.PersistentArrayMap.prototype.apply = function(this_sym8601, args8602) {
  var this__8624 = this;
  return this_sym8601.call.apply(this_sym8601, [this_sym8601].concat(args8602.slice()))
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(coll, f, init) {
  var this__8625 = this;
  var len__8626 = this__8625.arr.length;
  var i__8627 = 0;
  var init__8628 = init;
  while(true) {
    if(i__8627 < len__8626) {
      var init__8629 = f.call(null, init__8628, this__8625.arr[i__8627], this__8625.arr[i__8627 + 1]);
      if(cljs.core.reduced_QMARK_.call(null, init__8629)) {
        return cljs.core.deref.call(null, init__8629)
      }else {
        var G__8649 = i__8627 + 2;
        var G__8650 = init__8629;
        i__8627 = G__8649;
        init__8628 = G__8650;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__8630 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.PersistentArrayMap.prototype.toString = function() {
  var this__8631 = this;
  var this__8632 = this;
  return cljs.core.pr_str.call(null, this__8632)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8633 = this;
  if(this__8633.cnt > 0) {
    var len__8634 = this__8633.arr.length;
    var array_map_seq__8635 = function array_map_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(i < len__8634) {
          return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([this__8633.arr[i], this__8633.arr[i + 1]], true), array_map_seq.call(null, i + 2))
        }else {
          return null
        }
      }, null)
    };
    return array_map_seq__8635.call(null, 0)
  }else {
    return null
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8636 = this;
  return this__8636.cnt
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8637 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8638 = this;
  return new cljs.core.PersistentArrayMap(meta, this__8638.cnt, this__8638.arr, this__8638.__hash)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8639 = this;
  return this__8639.meta
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8640 = this;
  return cljs.core._with_meta.call(null, cljs.core.PersistentArrayMap.EMPTY, this__8640.meta)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__8641 = this;
  var idx__8642 = cljs.core.array_map_index_of.call(null, coll, k);
  if(idx__8642 >= 0) {
    var len__8643 = this__8641.arr.length;
    var new_len__8644 = len__8643 - 2;
    if(new_len__8644 === 0) {
      return coll.cljs$core$IEmptyableCollection$_empty$arity$1(coll)
    }else {
      var new_arr__8645 = cljs.core.make_array.call(null, new_len__8644);
      var s__8646 = 0;
      var d__8647 = 0;
      while(true) {
        if(s__8646 >= len__8643) {
          return new cljs.core.PersistentArrayMap(this__8641.meta, this__8641.cnt - 1, new_arr__8645, null)
        }else {
          if(cljs.core._EQ_.call(null, k, this__8641.arr[s__8646])) {
            var G__8651 = s__8646 + 2;
            var G__8652 = d__8647;
            s__8646 = G__8651;
            d__8647 = G__8652;
            continue
          }else {
            if("\ufdd0'else") {
              new_arr__8645[d__8647] = this__8641.arr[s__8646];
              new_arr__8645[d__8647 + 1] = this__8641.arr[s__8646 + 1];
              var G__8653 = s__8646 + 2;
              var G__8654 = d__8647 + 2;
              s__8646 = G__8653;
              d__8647 = G__8654;
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
  var len__8655 = cljs.core.count.call(null, ks);
  var i__8656 = 0;
  var out__8657 = cljs.core.transient$.call(null, cljs.core.PersistentArrayMap.EMPTY);
  while(true) {
    if(i__8656 < len__8655) {
      var G__8658 = i__8656 + 1;
      var G__8659 = cljs.core.assoc_BANG_.call(null, out__8657, ks[i__8656], vs[i__8656]);
      i__8656 = G__8658;
      out__8657 = G__8659;
      continue
    }else {
      return cljs.core.persistent_BANG_.call(null, out__8657)
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
  return cljs.core.list.call(null, "cljs.core/TransientArrayMap")
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientMap$_dissoc_BANG_$arity$2 = function(tcoll, key) {
  var this__8660 = this;
  if(cljs.core.truth_(this__8660.editable_QMARK_)) {
    var idx__8661 = cljs.core.array_map_index_of.call(null, tcoll, key);
    if(idx__8661 >= 0) {
      this__8660.arr[idx__8661] = this__8660.arr[this__8660.len - 2];
      this__8660.arr[idx__8661 + 1] = this__8660.arr[this__8660.len - 1];
      var G__8662__8663 = this__8660.arr;
      G__8662__8663.pop();
      G__8662__8663.pop();
      G__8662__8663;
      this__8660.len = this__8660.len - 2
    }else {
    }
    return tcoll
  }else {
    throw new Error("dissoc! after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3 = function(tcoll, key, val) {
  var this__8664 = this;
  if(cljs.core.truth_(this__8664.editable_QMARK_)) {
    var idx__8665 = cljs.core.array_map_index_of.call(null, tcoll, key);
    if(idx__8665 === -1) {
      if(this__8664.len + 2 <= 2 * cljs.core.PersistentArrayMap.HASHMAP_THRESHOLD) {
        this__8664.len = this__8664.len + 2;
        this__8664.arr.push(key);
        this__8664.arr.push(val);
        return tcoll
      }else {
        return cljs.core.assoc_BANG_.call(null, cljs.core.array__GT_transient_hash_map.call(null, this__8664.len, this__8664.arr), key, val)
      }
    }else {
      if(val === this__8664.arr[idx__8665 + 1]) {
        return tcoll
      }else {
        this__8664.arr[idx__8665 + 1] = val;
        return tcoll
      }
    }
  }else {
    throw new Error("assoc! after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, o) {
  var this__8666 = this;
  if(cljs.core.truth_(this__8666.editable_QMARK_)) {
    if(function() {
      var G__8667__8668 = o;
      if(G__8667__8668) {
        if(function() {
          var or__3824__auto____8669 = G__8667__8668.cljs$lang$protocol_mask$partition0$ & 2048;
          if(or__3824__auto____8669) {
            return or__3824__auto____8669
          }else {
            return G__8667__8668.cljs$core$IMapEntry$
          }
        }()) {
          return true
        }else {
          if(!G__8667__8668.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.IMapEntry, G__8667__8668)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.IMapEntry, G__8667__8668)
      }
    }()) {
      return tcoll.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3(tcoll, cljs.core.key.call(null, o), cljs.core.val.call(null, o))
    }else {
      var es__8670 = cljs.core.seq.call(null, o);
      var tcoll__8671 = tcoll;
      while(true) {
        var temp__3971__auto____8672 = cljs.core.first.call(null, es__8670);
        if(cljs.core.truth_(temp__3971__auto____8672)) {
          var e__8673 = temp__3971__auto____8672;
          var G__8679 = cljs.core.next.call(null, es__8670);
          var G__8680 = tcoll__8671.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3(tcoll__8671, cljs.core.key.call(null, e__8673), cljs.core.val.call(null, e__8673));
          es__8670 = G__8679;
          tcoll__8671 = G__8680;
          continue
        }else {
          return tcoll__8671
        }
        break
      }
    }
  }else {
    throw new Error("conj! after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__8674 = this;
  if(cljs.core.truth_(this__8674.editable_QMARK_)) {
    this__8674.editable_QMARK_ = false;
    return new cljs.core.PersistentArrayMap(null, cljs.core.quot.call(null, this__8674.len, 2), this__8674.arr, null)
  }else {
    throw new Error("persistent! called twice");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(tcoll, k) {
  var this__8675 = this;
  return tcoll.cljs$core$ILookup$_lookup$arity$3(tcoll, k, null)
};
cljs.core.TransientArrayMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(tcoll, k, not_found) {
  var this__8676 = this;
  if(cljs.core.truth_(this__8676.editable_QMARK_)) {
    var idx__8677 = cljs.core.array_map_index_of.call(null, tcoll, k);
    if(idx__8677 === -1) {
      return not_found
    }else {
      return this__8676.arr[idx__8677 + 1]
    }
  }else {
    throw new Error("lookup after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ICounted$_count$arity$1 = function(tcoll) {
  var this__8678 = this;
  if(cljs.core.truth_(this__8678.editable_QMARK_)) {
    return cljs.core.quot.call(null, this__8678.len, 2)
  }else {
    throw new Error("count after persistent!");
  }
};
cljs.core.TransientArrayMap;
cljs.core.array__GT_transient_hash_map = function array__GT_transient_hash_map(len, arr) {
  var out__8683 = cljs.core.transient$.call(null, cljs.core.ObjMap.EMPTY);
  var i__8684 = 0;
  while(true) {
    if(i__8684 < len) {
      var G__8685 = cljs.core.assoc_BANG_.call(null, out__8683, arr[i__8684], arr[i__8684 + 1]);
      var G__8686 = i__8684 + 2;
      out__8683 = G__8685;
      i__8684 = G__8686;
      continue
    }else {
      return out__8683
    }
    break
  }
};
cljs.core.Box = function(val) {
  this.val = val
};
cljs.core.Box.cljs$lang$type = true;
cljs.core.Box.cljs$lang$ctorPrSeq = function(this__2310__auto__) {
  return cljs.core.list.call(null, "cljs.core/Box")
};
cljs.core.Box;
cljs.core.key_test = function key_test(key, other) {
  if(goog.isString(key)) {
    return key === other
  }else {
    return cljs.core._EQ_.call(null, key, other)
  }
};
cljs.core.mask = function mask(hash, shift) {
  return hash >>> shift & 31
};
cljs.core.clone_and_set = function() {
  var clone_and_set = null;
  var clone_and_set__3 = function(arr, i, a) {
    var G__8691__8692 = arr.slice();
    G__8691__8692[i] = a;
    return G__8691__8692
  };
  var clone_and_set__5 = function(arr, i, a, j, b) {
    var G__8693__8694 = arr.slice();
    G__8693__8694[i] = a;
    G__8693__8694[j] = b;
    return G__8693__8694
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
  var new_arr__8696 = cljs.core.make_array.call(null, arr.length - 2);
  cljs.core.array_copy.call(null, arr, 0, new_arr__8696, 0, 2 * i);
  cljs.core.array_copy.call(null, arr, 2 * (i + 1), new_arr__8696, 2 * i, new_arr__8696.length - 2 * i);
  return new_arr__8696
};
cljs.core.bitmap_indexed_node_index = function bitmap_indexed_node_index(bitmap, bit) {
  return cljs.core.bit_count.call(null, bitmap & bit - 1)
};
cljs.core.bitpos = function bitpos(hash, shift) {
  return 1 << (hash >>> shift & 31)
};
cljs.core.edit_and_set = function() {
  var edit_and_set = null;
  var edit_and_set__4 = function(inode, edit, i, a) {
    var editable__8699 = inode.ensure_editable(edit);
    editable__8699.arr[i] = a;
    return editable__8699
  };
  var edit_and_set__6 = function(inode, edit, i, a, j, b) {
    var editable__8700 = inode.ensure_editable(edit);
    editable__8700.arr[i] = a;
    editable__8700.arr[j] = b;
    return editable__8700
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
  var len__8707 = arr.length;
  var i__8708 = 0;
  var init__8709 = init;
  while(true) {
    if(i__8708 < len__8707) {
      var init__8712 = function() {
        var k__8710 = arr[i__8708];
        if(!(k__8710 == null)) {
          return f.call(null, init__8709, k__8710, arr[i__8708 + 1])
        }else {
          var node__8711 = arr[i__8708 + 1];
          if(!(node__8711 == null)) {
            return node__8711.kv_reduce(f, init__8709)
          }else {
            return init__8709
          }
        }
      }();
      if(cljs.core.reduced_QMARK_.call(null, init__8712)) {
        return cljs.core.deref.call(null, init__8712)
      }else {
        var G__8713 = i__8708 + 2;
        var G__8714 = init__8712;
        i__8708 = G__8713;
        init__8709 = G__8714;
        continue
      }
    }else {
      return init__8709
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
  return cljs.core.list.call(null, "cljs.core/BitmapIndexedNode")
};
cljs.core.BitmapIndexedNode.prototype.edit_and_remove_pair = function(e, bit, i) {
  var this__8715 = this;
  var inode__8716 = this;
  if(this__8715.bitmap === bit) {
    return null
  }else {
    var editable__8717 = inode__8716.ensure_editable(e);
    var earr__8718 = editable__8717.arr;
    var len__8719 = earr__8718.length;
    editable__8717.bitmap = bit ^ editable__8717.bitmap;
    cljs.core.array_copy.call(null, earr__8718, 2 * (i + 1), earr__8718, 2 * i, len__8719 - 2 * (i + 1));
    earr__8718[len__8719 - 2] = null;
    earr__8718[len__8719 - 1] = null;
    return editable__8717
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_assoc_BANG_ = function(edit, shift, hash, key, val, added_leaf_QMARK_) {
  var this__8720 = this;
  var inode__8721 = this;
  var bit__8722 = 1 << (hash >>> shift & 31);
  var idx__8723 = cljs.core.bitmap_indexed_node_index.call(null, this__8720.bitmap, bit__8722);
  if((this__8720.bitmap & bit__8722) === 0) {
    var n__8724 = cljs.core.bit_count.call(null, this__8720.bitmap);
    if(2 * n__8724 < this__8720.arr.length) {
      var editable__8725 = inode__8721.ensure_editable(edit);
      var earr__8726 = editable__8725.arr;
      added_leaf_QMARK_.val = true;
      cljs.core.array_copy_downward.call(null, earr__8726, 2 * idx__8723, earr__8726, 2 * (idx__8723 + 1), 2 * (n__8724 - idx__8723));
      earr__8726[2 * idx__8723] = key;
      earr__8726[2 * idx__8723 + 1] = val;
      editable__8725.bitmap = editable__8725.bitmap | bit__8722;
      return editable__8725
    }else {
      if(n__8724 >= 16) {
        var nodes__8727 = cljs.core.make_array.call(null, 32);
        var jdx__8728 = hash >>> shift & 31;
        nodes__8727[jdx__8728] = cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_);
        var i__8729 = 0;
        var j__8730 = 0;
        while(true) {
          if(i__8729 < 32) {
            if((this__8720.bitmap >>> i__8729 & 1) === 0) {
              var G__8783 = i__8729 + 1;
              var G__8784 = j__8730;
              i__8729 = G__8783;
              j__8730 = G__8784;
              continue
            }else {
              nodes__8727[i__8729] = !(this__8720.arr[j__8730] == null) ? cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift + 5, cljs.core.hash.call(null, this__8720.arr[j__8730]), this__8720.arr[j__8730], this__8720.arr[j__8730 + 1], added_leaf_QMARK_) : this__8720.arr[j__8730 + 1];
              var G__8785 = i__8729 + 1;
              var G__8786 = j__8730 + 2;
              i__8729 = G__8785;
              j__8730 = G__8786;
              continue
            }
          }else {
          }
          break
        }
        return new cljs.core.ArrayNode(edit, n__8724 + 1, nodes__8727)
      }else {
        if("\ufdd0'else") {
          var new_arr__8731 = cljs.core.make_array.call(null, 2 * (n__8724 + 4));
          cljs.core.array_copy.call(null, this__8720.arr, 0, new_arr__8731, 0, 2 * idx__8723);
          new_arr__8731[2 * idx__8723] = key;
          new_arr__8731[2 * idx__8723 + 1] = val;
          cljs.core.array_copy.call(null, this__8720.arr, 2 * idx__8723, new_arr__8731, 2 * (idx__8723 + 1), 2 * (n__8724 - idx__8723));
          added_leaf_QMARK_.val = true;
          var editable__8732 = inode__8721.ensure_editable(edit);
          editable__8732.arr = new_arr__8731;
          editable__8732.bitmap = editable__8732.bitmap | bit__8722;
          return editable__8732
        }else {
          return null
        }
      }
    }
  }else {
    var key_or_nil__8733 = this__8720.arr[2 * idx__8723];
    var val_or_node__8734 = this__8720.arr[2 * idx__8723 + 1];
    if(key_or_nil__8733 == null) {
      var n__8735 = val_or_node__8734.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_);
      if(n__8735 === val_or_node__8734) {
        return inode__8721
      }else {
        return cljs.core.edit_and_set.call(null, inode__8721, edit, 2 * idx__8723 + 1, n__8735)
      }
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__8733)) {
        if(val === val_or_node__8734) {
          return inode__8721
        }else {
          return cljs.core.edit_and_set.call(null, inode__8721, edit, 2 * idx__8723 + 1, val)
        }
      }else {
        if("\ufdd0'else") {
          added_leaf_QMARK_.val = true;
          return cljs.core.edit_and_set.call(null, inode__8721, edit, 2 * idx__8723, null, 2 * idx__8723 + 1, cljs.core.create_node.call(null, edit, shift + 5, key_or_nil__8733, val_or_node__8734, hash, key, val))
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_seq = function() {
  var this__8736 = this;
  var inode__8737 = this;
  return cljs.core.create_inode_seq.call(null, this__8736.arr)
};
cljs.core.BitmapIndexedNode.prototype.inode_without_BANG_ = function(edit, shift, hash, key, removed_leaf_QMARK_) {
  var this__8738 = this;
  var inode__8739 = this;
  var bit__8740 = 1 << (hash >>> shift & 31);
  if((this__8738.bitmap & bit__8740) === 0) {
    return inode__8739
  }else {
    var idx__8741 = cljs.core.bitmap_indexed_node_index.call(null, this__8738.bitmap, bit__8740);
    var key_or_nil__8742 = this__8738.arr[2 * idx__8741];
    var val_or_node__8743 = this__8738.arr[2 * idx__8741 + 1];
    if(key_or_nil__8742 == null) {
      var n__8744 = val_or_node__8743.inode_without_BANG_(edit, shift + 5, hash, key, removed_leaf_QMARK_);
      if(n__8744 === val_or_node__8743) {
        return inode__8739
      }else {
        if(!(n__8744 == null)) {
          return cljs.core.edit_and_set.call(null, inode__8739, edit, 2 * idx__8741 + 1, n__8744)
        }else {
          if(this__8738.bitmap === bit__8740) {
            return null
          }else {
            if("\ufdd0'else") {
              return inode__8739.edit_and_remove_pair(edit, bit__8740, idx__8741)
            }else {
              return null
            }
          }
        }
      }
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__8742)) {
        removed_leaf_QMARK_[0] = true;
        return inode__8739.edit_and_remove_pair(edit, bit__8740, idx__8741)
      }else {
        if("\ufdd0'else") {
          return inode__8739
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.ensure_editable = function(e) {
  var this__8745 = this;
  var inode__8746 = this;
  if(e === this__8745.edit) {
    return inode__8746
  }else {
    var n__8747 = cljs.core.bit_count.call(null, this__8745.bitmap);
    var new_arr__8748 = cljs.core.make_array.call(null, n__8747 < 0 ? 4 : 2 * (n__8747 + 1));
    cljs.core.array_copy.call(null, this__8745.arr, 0, new_arr__8748, 0, 2 * n__8747);
    return new cljs.core.BitmapIndexedNode(e, this__8745.bitmap, new_arr__8748)
  }
};
cljs.core.BitmapIndexedNode.prototype.kv_reduce = function(f, init) {
  var this__8749 = this;
  var inode__8750 = this;
  return cljs.core.inode_kv_reduce.call(null, this__8749.arr, f, init)
};
cljs.core.BitmapIndexedNode.prototype.inode_find = function(shift, hash, key, not_found) {
  var this__8751 = this;
  var inode__8752 = this;
  var bit__8753 = 1 << (hash >>> shift & 31);
  if((this__8751.bitmap & bit__8753) === 0) {
    return not_found
  }else {
    var idx__8754 = cljs.core.bitmap_indexed_node_index.call(null, this__8751.bitmap, bit__8753);
    var key_or_nil__8755 = this__8751.arr[2 * idx__8754];
    var val_or_node__8756 = this__8751.arr[2 * idx__8754 + 1];
    if(key_or_nil__8755 == null) {
      return val_or_node__8756.inode_find(shift + 5, hash, key, not_found)
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__8755)) {
        return cljs.core.PersistentVector.fromArray([key_or_nil__8755, val_or_node__8756], true)
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
  var this__8757 = this;
  var inode__8758 = this;
  var bit__8759 = 1 << (hash >>> shift & 31);
  if((this__8757.bitmap & bit__8759) === 0) {
    return inode__8758
  }else {
    var idx__8760 = cljs.core.bitmap_indexed_node_index.call(null, this__8757.bitmap, bit__8759);
    var key_or_nil__8761 = this__8757.arr[2 * idx__8760];
    var val_or_node__8762 = this__8757.arr[2 * idx__8760 + 1];
    if(key_or_nil__8761 == null) {
      var n__8763 = val_or_node__8762.inode_without(shift + 5, hash, key);
      if(n__8763 === val_or_node__8762) {
        return inode__8758
      }else {
        if(!(n__8763 == null)) {
          return new cljs.core.BitmapIndexedNode(null, this__8757.bitmap, cljs.core.clone_and_set.call(null, this__8757.arr, 2 * idx__8760 + 1, n__8763))
        }else {
          if(this__8757.bitmap === bit__8759) {
            return null
          }else {
            if("\ufdd0'else") {
              return new cljs.core.BitmapIndexedNode(null, this__8757.bitmap ^ bit__8759, cljs.core.remove_pair.call(null, this__8757.arr, idx__8760))
            }else {
              return null
            }
          }
        }
      }
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__8761)) {
        return new cljs.core.BitmapIndexedNode(null, this__8757.bitmap ^ bit__8759, cljs.core.remove_pair.call(null, this__8757.arr, idx__8760))
      }else {
        if("\ufdd0'else") {
          return inode__8758
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_assoc = function(shift, hash, key, val, added_leaf_QMARK_) {
  var this__8764 = this;
  var inode__8765 = this;
  var bit__8766 = 1 << (hash >>> shift & 31);
  var idx__8767 = cljs.core.bitmap_indexed_node_index.call(null, this__8764.bitmap, bit__8766);
  if((this__8764.bitmap & bit__8766) === 0) {
    var n__8768 = cljs.core.bit_count.call(null, this__8764.bitmap);
    if(n__8768 >= 16) {
      var nodes__8769 = cljs.core.make_array.call(null, 32);
      var jdx__8770 = hash >>> shift & 31;
      nodes__8769[jdx__8770] = cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_);
      var i__8771 = 0;
      var j__8772 = 0;
      while(true) {
        if(i__8771 < 32) {
          if((this__8764.bitmap >>> i__8771 & 1) === 0) {
            var G__8787 = i__8771 + 1;
            var G__8788 = j__8772;
            i__8771 = G__8787;
            j__8772 = G__8788;
            continue
          }else {
            nodes__8769[i__8771] = !(this__8764.arr[j__8772] == null) ? cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift + 5, cljs.core.hash.call(null, this__8764.arr[j__8772]), this__8764.arr[j__8772], this__8764.arr[j__8772 + 1], added_leaf_QMARK_) : this__8764.arr[j__8772 + 1];
            var G__8789 = i__8771 + 1;
            var G__8790 = j__8772 + 2;
            i__8771 = G__8789;
            j__8772 = G__8790;
            continue
          }
        }else {
        }
        break
      }
      return new cljs.core.ArrayNode(null, n__8768 + 1, nodes__8769)
    }else {
      var new_arr__8773 = cljs.core.make_array.call(null, 2 * (n__8768 + 1));
      cljs.core.array_copy.call(null, this__8764.arr, 0, new_arr__8773, 0, 2 * idx__8767);
      new_arr__8773[2 * idx__8767] = key;
      new_arr__8773[2 * idx__8767 + 1] = val;
      cljs.core.array_copy.call(null, this__8764.arr, 2 * idx__8767, new_arr__8773, 2 * (idx__8767 + 1), 2 * (n__8768 - idx__8767));
      added_leaf_QMARK_.val = true;
      return new cljs.core.BitmapIndexedNode(null, this__8764.bitmap | bit__8766, new_arr__8773)
    }
  }else {
    var key_or_nil__8774 = this__8764.arr[2 * idx__8767];
    var val_or_node__8775 = this__8764.arr[2 * idx__8767 + 1];
    if(key_or_nil__8774 == null) {
      var n__8776 = val_or_node__8775.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_);
      if(n__8776 === val_or_node__8775) {
        return inode__8765
      }else {
        return new cljs.core.BitmapIndexedNode(null, this__8764.bitmap, cljs.core.clone_and_set.call(null, this__8764.arr, 2 * idx__8767 + 1, n__8776))
      }
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__8774)) {
        if(val === val_or_node__8775) {
          return inode__8765
        }else {
          return new cljs.core.BitmapIndexedNode(null, this__8764.bitmap, cljs.core.clone_and_set.call(null, this__8764.arr, 2 * idx__8767 + 1, val))
        }
      }else {
        if("\ufdd0'else") {
          added_leaf_QMARK_.val = true;
          return new cljs.core.BitmapIndexedNode(null, this__8764.bitmap, cljs.core.clone_and_set.call(null, this__8764.arr, 2 * idx__8767, null, 2 * idx__8767 + 1, cljs.core.create_node.call(null, shift + 5, key_or_nil__8774, val_or_node__8775, hash, key, val)))
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_lookup = function(shift, hash, key, not_found) {
  var this__8777 = this;
  var inode__8778 = this;
  var bit__8779 = 1 << (hash >>> shift & 31);
  if((this__8777.bitmap & bit__8779) === 0) {
    return not_found
  }else {
    var idx__8780 = cljs.core.bitmap_indexed_node_index.call(null, this__8777.bitmap, bit__8779);
    var key_or_nil__8781 = this__8777.arr[2 * idx__8780];
    var val_or_node__8782 = this__8777.arr[2 * idx__8780 + 1];
    if(key_or_nil__8781 == null) {
      return val_or_node__8782.inode_lookup(shift + 5, hash, key, not_found)
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__8781)) {
        return val_or_node__8782
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
cljs.core.BitmapIndexedNode.EMPTY = new cljs.core.BitmapIndexedNode(null, 0, cljs.core.make_array.call(null, 0));
cljs.core.pack_array_node = function pack_array_node(array_node, edit, idx) {
  var arr__8798 = array_node.arr;
  var len__8799 = 2 * (array_node.cnt - 1);
  var new_arr__8800 = cljs.core.make_array.call(null, len__8799);
  var i__8801 = 0;
  var j__8802 = 1;
  var bitmap__8803 = 0;
  while(true) {
    if(i__8801 < len__8799) {
      if(function() {
        var and__3822__auto____8804 = !(i__8801 === idx);
        if(and__3822__auto____8804) {
          return!(arr__8798[i__8801] == null)
        }else {
          return and__3822__auto____8804
        }
      }()) {
        new_arr__8800[j__8802] = arr__8798[i__8801];
        var G__8805 = i__8801 + 1;
        var G__8806 = j__8802 + 2;
        var G__8807 = bitmap__8803 | 1 << i__8801;
        i__8801 = G__8805;
        j__8802 = G__8806;
        bitmap__8803 = G__8807;
        continue
      }else {
        var G__8808 = i__8801 + 1;
        var G__8809 = j__8802;
        var G__8810 = bitmap__8803;
        i__8801 = G__8808;
        j__8802 = G__8809;
        bitmap__8803 = G__8810;
        continue
      }
    }else {
      return new cljs.core.BitmapIndexedNode(edit, bitmap__8803, new_arr__8800)
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
  return cljs.core.list.call(null, "cljs.core/ArrayNode")
};
cljs.core.ArrayNode.prototype.inode_assoc_BANG_ = function(edit, shift, hash, key, val, added_leaf_QMARK_) {
  var this__8811 = this;
  var inode__8812 = this;
  var idx__8813 = hash >>> shift & 31;
  var node__8814 = this__8811.arr[idx__8813];
  if(node__8814 == null) {
    var editable__8815 = cljs.core.edit_and_set.call(null, inode__8812, edit, idx__8813, cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_));
    editable__8815.cnt = editable__8815.cnt + 1;
    return editable__8815
  }else {
    var n__8816 = node__8814.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_);
    if(n__8816 === node__8814) {
      return inode__8812
    }else {
      return cljs.core.edit_and_set.call(null, inode__8812, edit, idx__8813, n__8816)
    }
  }
};
cljs.core.ArrayNode.prototype.inode_seq = function() {
  var this__8817 = this;
  var inode__8818 = this;
  return cljs.core.create_array_node_seq.call(null, this__8817.arr)
};
cljs.core.ArrayNode.prototype.inode_without_BANG_ = function(edit, shift, hash, key, removed_leaf_QMARK_) {
  var this__8819 = this;
  var inode__8820 = this;
  var idx__8821 = hash >>> shift & 31;
  var node__8822 = this__8819.arr[idx__8821];
  if(node__8822 == null) {
    return inode__8820
  }else {
    var n__8823 = node__8822.inode_without_BANG_(edit, shift + 5, hash, key, removed_leaf_QMARK_);
    if(n__8823 === node__8822) {
      return inode__8820
    }else {
      if(n__8823 == null) {
        if(this__8819.cnt <= 8) {
          return cljs.core.pack_array_node.call(null, inode__8820, edit, idx__8821)
        }else {
          var editable__8824 = cljs.core.edit_and_set.call(null, inode__8820, edit, idx__8821, n__8823);
          editable__8824.cnt = editable__8824.cnt - 1;
          return editable__8824
        }
      }else {
        if("\ufdd0'else") {
          return cljs.core.edit_and_set.call(null, inode__8820, edit, idx__8821, n__8823)
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.ArrayNode.prototype.ensure_editable = function(e) {
  var this__8825 = this;
  var inode__8826 = this;
  if(e === this__8825.edit) {
    return inode__8826
  }else {
    return new cljs.core.ArrayNode(e, this__8825.cnt, this__8825.arr.slice())
  }
};
cljs.core.ArrayNode.prototype.kv_reduce = function(f, init) {
  var this__8827 = this;
  var inode__8828 = this;
  var len__8829 = this__8827.arr.length;
  var i__8830 = 0;
  var init__8831 = init;
  while(true) {
    if(i__8830 < len__8829) {
      var node__8832 = this__8827.arr[i__8830];
      if(!(node__8832 == null)) {
        var init__8833 = node__8832.kv_reduce(f, init__8831);
        if(cljs.core.reduced_QMARK_.call(null, init__8833)) {
          return cljs.core.deref.call(null, init__8833)
        }else {
          var G__8852 = i__8830 + 1;
          var G__8853 = init__8833;
          i__8830 = G__8852;
          init__8831 = G__8853;
          continue
        }
      }else {
        return null
      }
    }else {
      return init__8831
    }
    break
  }
};
cljs.core.ArrayNode.prototype.inode_find = function(shift, hash, key, not_found) {
  var this__8834 = this;
  var inode__8835 = this;
  var idx__8836 = hash >>> shift & 31;
  var node__8837 = this__8834.arr[idx__8836];
  if(!(node__8837 == null)) {
    return node__8837.inode_find(shift + 5, hash, key, not_found)
  }else {
    return not_found
  }
};
cljs.core.ArrayNode.prototype.inode_without = function(shift, hash, key) {
  var this__8838 = this;
  var inode__8839 = this;
  var idx__8840 = hash >>> shift & 31;
  var node__8841 = this__8838.arr[idx__8840];
  if(!(node__8841 == null)) {
    var n__8842 = node__8841.inode_without(shift + 5, hash, key);
    if(n__8842 === node__8841) {
      return inode__8839
    }else {
      if(n__8842 == null) {
        if(this__8838.cnt <= 8) {
          return cljs.core.pack_array_node.call(null, inode__8839, null, idx__8840)
        }else {
          return new cljs.core.ArrayNode(null, this__8838.cnt - 1, cljs.core.clone_and_set.call(null, this__8838.arr, idx__8840, n__8842))
        }
      }else {
        if("\ufdd0'else") {
          return new cljs.core.ArrayNode(null, this__8838.cnt, cljs.core.clone_and_set.call(null, this__8838.arr, idx__8840, n__8842))
        }else {
          return null
        }
      }
    }
  }else {
    return inode__8839
  }
};
cljs.core.ArrayNode.prototype.inode_assoc = function(shift, hash, key, val, added_leaf_QMARK_) {
  var this__8843 = this;
  var inode__8844 = this;
  var idx__8845 = hash >>> shift & 31;
  var node__8846 = this__8843.arr[idx__8845];
  if(node__8846 == null) {
    return new cljs.core.ArrayNode(null, this__8843.cnt + 1, cljs.core.clone_and_set.call(null, this__8843.arr, idx__8845, cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_)))
  }else {
    var n__8847 = node__8846.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_);
    if(n__8847 === node__8846) {
      return inode__8844
    }else {
      return new cljs.core.ArrayNode(null, this__8843.cnt, cljs.core.clone_and_set.call(null, this__8843.arr, idx__8845, n__8847))
    }
  }
};
cljs.core.ArrayNode.prototype.inode_lookup = function(shift, hash, key, not_found) {
  var this__8848 = this;
  var inode__8849 = this;
  var idx__8850 = hash >>> shift & 31;
  var node__8851 = this__8848.arr[idx__8850];
  if(!(node__8851 == null)) {
    return node__8851.inode_lookup(shift + 5, hash, key, not_found)
  }else {
    return not_found
  }
};
cljs.core.ArrayNode;
cljs.core.hash_collision_node_find_index = function hash_collision_node_find_index(arr, cnt, key) {
  var lim__8856 = 2 * cnt;
  var i__8857 = 0;
  while(true) {
    if(i__8857 < lim__8856) {
      if(cljs.core.key_test.call(null, key, arr[i__8857])) {
        return i__8857
      }else {
        var G__8858 = i__8857 + 2;
        i__8857 = G__8858;
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
  return cljs.core.list.call(null, "cljs.core/HashCollisionNode")
};
cljs.core.HashCollisionNode.prototype.inode_assoc_BANG_ = function(edit, shift, hash, key, val, added_leaf_QMARK_) {
  var this__8859 = this;
  var inode__8860 = this;
  if(hash === this__8859.collision_hash) {
    var idx__8861 = cljs.core.hash_collision_node_find_index.call(null, this__8859.arr, this__8859.cnt, key);
    if(idx__8861 === -1) {
      if(this__8859.arr.length > 2 * this__8859.cnt) {
        var editable__8862 = cljs.core.edit_and_set.call(null, inode__8860, edit, 2 * this__8859.cnt, key, 2 * this__8859.cnt + 1, val);
        added_leaf_QMARK_.val = true;
        editable__8862.cnt = editable__8862.cnt + 1;
        return editable__8862
      }else {
        var len__8863 = this__8859.arr.length;
        var new_arr__8864 = cljs.core.make_array.call(null, len__8863 + 2);
        cljs.core.array_copy.call(null, this__8859.arr, 0, new_arr__8864, 0, len__8863);
        new_arr__8864[len__8863] = key;
        new_arr__8864[len__8863 + 1] = val;
        added_leaf_QMARK_.val = true;
        return inode__8860.ensure_editable_array(edit, this__8859.cnt + 1, new_arr__8864)
      }
    }else {
      if(this__8859.arr[idx__8861 + 1] === val) {
        return inode__8860
      }else {
        return cljs.core.edit_and_set.call(null, inode__8860, edit, idx__8861 + 1, val)
      }
    }
  }else {
    return(new cljs.core.BitmapIndexedNode(edit, 1 << (this__8859.collision_hash >>> shift & 31), [null, inode__8860, null, null])).inode_assoc_BANG_(edit, shift, hash, key, val, added_leaf_QMARK_)
  }
};
cljs.core.HashCollisionNode.prototype.inode_seq = function() {
  var this__8865 = this;
  var inode__8866 = this;
  return cljs.core.create_inode_seq.call(null, this__8865.arr)
};
cljs.core.HashCollisionNode.prototype.inode_without_BANG_ = function(edit, shift, hash, key, removed_leaf_QMARK_) {
  var this__8867 = this;
  var inode__8868 = this;
  var idx__8869 = cljs.core.hash_collision_node_find_index.call(null, this__8867.arr, this__8867.cnt, key);
  if(idx__8869 === -1) {
    return inode__8868
  }else {
    removed_leaf_QMARK_[0] = true;
    if(this__8867.cnt === 1) {
      return null
    }else {
      var editable__8870 = inode__8868.ensure_editable(edit);
      var earr__8871 = editable__8870.arr;
      earr__8871[idx__8869] = earr__8871[2 * this__8867.cnt - 2];
      earr__8871[idx__8869 + 1] = earr__8871[2 * this__8867.cnt - 1];
      earr__8871[2 * this__8867.cnt - 1] = null;
      earr__8871[2 * this__8867.cnt - 2] = null;
      editable__8870.cnt = editable__8870.cnt - 1;
      return editable__8870
    }
  }
};
cljs.core.HashCollisionNode.prototype.ensure_editable = function(e) {
  var this__8872 = this;
  var inode__8873 = this;
  if(e === this__8872.edit) {
    return inode__8873
  }else {
    var new_arr__8874 = cljs.core.make_array.call(null, 2 * (this__8872.cnt + 1));
    cljs.core.array_copy.call(null, this__8872.arr, 0, new_arr__8874, 0, 2 * this__8872.cnt);
    return new cljs.core.HashCollisionNode(e, this__8872.collision_hash, this__8872.cnt, new_arr__8874)
  }
};
cljs.core.HashCollisionNode.prototype.kv_reduce = function(f, init) {
  var this__8875 = this;
  var inode__8876 = this;
  return cljs.core.inode_kv_reduce.call(null, this__8875.arr, f, init)
};
cljs.core.HashCollisionNode.prototype.inode_find = function(shift, hash, key, not_found) {
  var this__8877 = this;
  var inode__8878 = this;
  var idx__8879 = cljs.core.hash_collision_node_find_index.call(null, this__8877.arr, this__8877.cnt, key);
  if(idx__8879 < 0) {
    return not_found
  }else {
    if(cljs.core.key_test.call(null, key, this__8877.arr[idx__8879])) {
      return cljs.core.PersistentVector.fromArray([this__8877.arr[idx__8879], this__8877.arr[idx__8879 + 1]], true)
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
  var this__8880 = this;
  var inode__8881 = this;
  var idx__8882 = cljs.core.hash_collision_node_find_index.call(null, this__8880.arr, this__8880.cnt, key);
  if(idx__8882 === -1) {
    return inode__8881
  }else {
    if(this__8880.cnt === 1) {
      return null
    }else {
      if("\ufdd0'else") {
        return new cljs.core.HashCollisionNode(null, this__8880.collision_hash, this__8880.cnt - 1, cljs.core.remove_pair.call(null, this__8880.arr, cljs.core.quot.call(null, idx__8882, 2)))
      }else {
        return null
      }
    }
  }
};
cljs.core.HashCollisionNode.prototype.inode_assoc = function(shift, hash, key, val, added_leaf_QMARK_) {
  var this__8883 = this;
  var inode__8884 = this;
  if(hash === this__8883.collision_hash) {
    var idx__8885 = cljs.core.hash_collision_node_find_index.call(null, this__8883.arr, this__8883.cnt, key);
    if(idx__8885 === -1) {
      var len__8886 = this__8883.arr.length;
      var new_arr__8887 = cljs.core.make_array.call(null, len__8886 + 2);
      cljs.core.array_copy.call(null, this__8883.arr, 0, new_arr__8887, 0, len__8886);
      new_arr__8887[len__8886] = key;
      new_arr__8887[len__8886 + 1] = val;
      added_leaf_QMARK_.val = true;
      return new cljs.core.HashCollisionNode(null, this__8883.collision_hash, this__8883.cnt + 1, new_arr__8887)
    }else {
      if(cljs.core._EQ_.call(null, this__8883.arr[idx__8885], val)) {
        return inode__8884
      }else {
        return new cljs.core.HashCollisionNode(null, this__8883.collision_hash, this__8883.cnt, cljs.core.clone_and_set.call(null, this__8883.arr, idx__8885 + 1, val))
      }
    }
  }else {
    return(new cljs.core.BitmapIndexedNode(null, 1 << (this__8883.collision_hash >>> shift & 31), [null, inode__8884])).inode_assoc(shift, hash, key, val, added_leaf_QMARK_)
  }
};
cljs.core.HashCollisionNode.prototype.inode_lookup = function(shift, hash, key, not_found) {
  var this__8888 = this;
  var inode__8889 = this;
  var idx__8890 = cljs.core.hash_collision_node_find_index.call(null, this__8888.arr, this__8888.cnt, key);
  if(idx__8890 < 0) {
    return not_found
  }else {
    if(cljs.core.key_test.call(null, key, this__8888.arr[idx__8890])) {
      return this__8888.arr[idx__8890 + 1]
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
  var this__8891 = this;
  var inode__8892 = this;
  if(e === this__8891.edit) {
    this__8891.arr = array;
    this__8891.cnt = count;
    return inode__8892
  }else {
    return new cljs.core.HashCollisionNode(this__8891.edit, this__8891.collision_hash, count, array)
  }
};
cljs.core.HashCollisionNode;
cljs.core.create_node = function() {
  var create_node = null;
  var create_node__6 = function(shift, key1, val1, key2hash, key2, val2) {
    var key1hash__8897 = cljs.core.hash.call(null, key1);
    if(key1hash__8897 === key2hash) {
      return new cljs.core.HashCollisionNode(null, key1hash__8897, 2, [key1, val1, key2, val2])
    }else {
      var added_leaf_QMARK___8898 = new cljs.core.Box(false);
      return cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift, key1hash__8897, key1, val1, added_leaf_QMARK___8898).inode_assoc(shift, key2hash, key2, val2, added_leaf_QMARK___8898)
    }
  };
  var create_node__7 = function(edit, shift, key1, val1, key2hash, key2, val2) {
    var key1hash__8899 = cljs.core.hash.call(null, key1);
    if(key1hash__8899 === key2hash) {
      return new cljs.core.HashCollisionNode(null, key1hash__8899, 2, [key1, val1, key2, val2])
    }else {
      var added_leaf_QMARK___8900 = new cljs.core.Box(false);
      return cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift, key1hash__8899, key1, val1, added_leaf_QMARK___8900).inode_assoc_BANG_(edit, shift, key2hash, key2, val2, added_leaf_QMARK___8900)
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
  return cljs.core.list.call(null, "cljs.core/NodeSeq")
};
cljs.core.NodeSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8901 = this;
  var h__2192__auto____8902 = this__8901.__hash;
  if(!(h__2192__auto____8902 == null)) {
    return h__2192__auto____8902
  }else {
    var h__2192__auto____8903 = cljs.core.hash_coll.call(null, coll);
    this__8901.__hash = h__2192__auto____8903;
    return h__2192__auto____8903
  }
};
cljs.core.NodeSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8904 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.NodeSeq.prototype.toString = function() {
  var this__8905 = this;
  var this__8906 = this;
  return cljs.core.pr_str.call(null, this__8906)
};
cljs.core.NodeSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__8907 = this;
  return this$
};
cljs.core.NodeSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__8908 = this;
  if(this__8908.s == null) {
    return cljs.core.PersistentVector.fromArray([this__8908.nodes[this__8908.i], this__8908.nodes[this__8908.i + 1]], true)
  }else {
    return cljs.core.first.call(null, this__8908.s)
  }
};
cljs.core.NodeSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__8909 = this;
  if(this__8909.s == null) {
    return cljs.core.create_inode_seq.call(null, this__8909.nodes, this__8909.i + 2, null)
  }else {
    return cljs.core.create_inode_seq.call(null, this__8909.nodes, this__8909.i, cljs.core.next.call(null, this__8909.s))
  }
};
cljs.core.NodeSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8910 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.NodeSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8911 = this;
  return new cljs.core.NodeSeq(meta, this__8911.nodes, this__8911.i, this__8911.s, this__8911.__hash)
};
cljs.core.NodeSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8912 = this;
  return this__8912.meta
};
cljs.core.NodeSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8913 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__8913.meta)
};
cljs.core.NodeSeq;
cljs.core.create_inode_seq = function() {
  var create_inode_seq = null;
  var create_inode_seq__1 = function(nodes) {
    return create_inode_seq.call(null, nodes, 0, null)
  };
  var create_inode_seq__3 = function(nodes, i, s) {
    if(s == null) {
      var len__8920 = nodes.length;
      var j__8921 = i;
      while(true) {
        if(j__8921 < len__8920) {
          if(!(nodes[j__8921] == null)) {
            return new cljs.core.NodeSeq(null, nodes, j__8921, null, null)
          }else {
            var temp__3971__auto____8922 = nodes[j__8921 + 1];
            if(cljs.core.truth_(temp__3971__auto____8922)) {
              var node__8923 = temp__3971__auto____8922;
              var temp__3971__auto____8924 = node__8923.inode_seq();
              if(cljs.core.truth_(temp__3971__auto____8924)) {
                var node_seq__8925 = temp__3971__auto____8924;
                return new cljs.core.NodeSeq(null, nodes, j__8921 + 2, node_seq__8925, null)
              }else {
                var G__8926 = j__8921 + 2;
                j__8921 = G__8926;
                continue
              }
            }else {
              var G__8927 = j__8921 + 2;
              j__8921 = G__8927;
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
  return cljs.core.list.call(null, "cljs.core/ArrayNodeSeq")
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8928 = this;
  var h__2192__auto____8929 = this__8928.__hash;
  if(!(h__2192__auto____8929 == null)) {
    return h__2192__auto____8929
  }else {
    var h__2192__auto____8930 = cljs.core.hash_coll.call(null, coll);
    this__8928.__hash = h__2192__auto____8930;
    return h__2192__auto____8930
  }
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8931 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.ArrayNodeSeq.prototype.toString = function() {
  var this__8932 = this;
  var this__8933 = this;
  return cljs.core.pr_str.call(null, this__8933)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__8934 = this;
  return this$
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__8935 = this;
  return cljs.core.first.call(null, this__8935.s)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__8936 = this;
  return cljs.core.create_array_node_seq.call(null, null, this__8936.nodes, this__8936.i, cljs.core.next.call(null, this__8936.s))
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8937 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8938 = this;
  return new cljs.core.ArrayNodeSeq(meta, this__8938.nodes, this__8938.i, this__8938.s, this__8938.__hash)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8939 = this;
  return this__8939.meta
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8940 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__8940.meta)
};
cljs.core.ArrayNodeSeq;
cljs.core.create_array_node_seq = function() {
  var create_array_node_seq = null;
  var create_array_node_seq__1 = function(nodes) {
    return create_array_node_seq.call(null, null, nodes, 0, null)
  };
  var create_array_node_seq__4 = function(meta, nodes, i, s) {
    if(s == null) {
      var len__8947 = nodes.length;
      var j__8948 = i;
      while(true) {
        if(j__8948 < len__8947) {
          var temp__3971__auto____8949 = nodes[j__8948];
          if(cljs.core.truth_(temp__3971__auto____8949)) {
            var nj__8950 = temp__3971__auto____8949;
            var temp__3971__auto____8951 = nj__8950.inode_seq();
            if(cljs.core.truth_(temp__3971__auto____8951)) {
              var ns__8952 = temp__3971__auto____8951;
              return new cljs.core.ArrayNodeSeq(meta, nodes, j__8948 + 1, ns__8952, null)
            }else {
              var G__8953 = j__8948 + 1;
              j__8948 = G__8953;
              continue
            }
          }else {
            var G__8954 = j__8948 + 1;
            j__8948 = G__8954;
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
  return cljs.core.list.call(null, "cljs.core/PersistentHashMap")
};
cljs.core.PersistentHashMap.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__8957 = this;
  return new cljs.core.TransientHashMap({}, this__8957.root, this__8957.cnt, this__8957.has_nil_QMARK_, this__8957.nil_val)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8958 = this;
  var h__2192__auto____8959 = this__8958.__hash;
  if(!(h__2192__auto____8959 == null)) {
    return h__2192__auto____8959
  }else {
    var h__2192__auto____8960 = cljs.core.hash_imap.call(null, coll);
    this__8958.__hash = h__2192__auto____8960;
    return h__2192__auto____8960
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8961 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.PersistentHashMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8962 = this;
  if(k == null) {
    if(this__8962.has_nil_QMARK_) {
      return this__8962.nil_val
    }else {
      return not_found
    }
  }else {
    if(this__8962.root == null) {
      return not_found
    }else {
      if("\ufdd0'else") {
        return this__8962.root.inode_lookup(0, cljs.core.hash.call(null, k), k, not_found)
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__8963 = this;
  if(k == null) {
    if(function() {
      var and__3822__auto____8964 = this__8963.has_nil_QMARK_;
      if(and__3822__auto____8964) {
        return v === this__8963.nil_val
      }else {
        return and__3822__auto____8964
      }
    }()) {
      return coll
    }else {
      return new cljs.core.PersistentHashMap(this__8963.meta, this__8963.has_nil_QMARK_ ? this__8963.cnt : this__8963.cnt + 1, this__8963.root, true, v, null)
    }
  }else {
    var added_leaf_QMARK___8965 = new cljs.core.Box(false);
    var new_root__8966 = (this__8963.root == null ? cljs.core.BitmapIndexedNode.EMPTY : this__8963.root).inode_assoc(0, cljs.core.hash.call(null, k), k, v, added_leaf_QMARK___8965);
    if(new_root__8966 === this__8963.root) {
      return coll
    }else {
      return new cljs.core.PersistentHashMap(this__8963.meta, added_leaf_QMARK___8965.val ? this__8963.cnt + 1 : this__8963.cnt, new_root__8966, this__8963.has_nil_QMARK_, this__8963.nil_val, null)
    }
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__8967 = this;
  if(k == null) {
    return this__8967.has_nil_QMARK_
  }else {
    if(this__8967.root == null) {
      return false
    }else {
      if("\ufdd0'else") {
        return!(this__8967.root.inode_lookup(0, cljs.core.hash.call(null, k), k, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel)
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap.prototype.call = function() {
  var G__8990 = null;
  var G__8990__2 = function(this_sym8968, k) {
    var this__8970 = this;
    var this_sym8968__8971 = this;
    var coll__8972 = this_sym8968__8971;
    return coll__8972.cljs$core$ILookup$_lookup$arity$2(coll__8972, k)
  };
  var G__8990__3 = function(this_sym8969, k, not_found) {
    var this__8970 = this;
    var this_sym8969__8973 = this;
    var coll__8974 = this_sym8969__8973;
    return coll__8974.cljs$core$ILookup$_lookup$arity$3(coll__8974, k, not_found)
  };
  G__8990 = function(this_sym8969, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8990__2.call(this, this_sym8969, k);
      case 3:
        return G__8990__3.call(this, this_sym8969, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8990
}();
cljs.core.PersistentHashMap.prototype.apply = function(this_sym8955, args8956) {
  var this__8975 = this;
  return this_sym8955.call.apply(this_sym8955, [this_sym8955].concat(args8956.slice()))
};
cljs.core.PersistentHashMap.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(coll, f, init) {
  var this__8976 = this;
  var init__8977 = this__8976.has_nil_QMARK_ ? f.call(null, init, null, this__8976.nil_val) : init;
  if(cljs.core.reduced_QMARK_.call(null, init__8977)) {
    return cljs.core.deref.call(null, init__8977)
  }else {
    if(!(this__8976.root == null)) {
      return this__8976.root.kv_reduce(f, init__8977)
    }else {
      if("\ufdd0'else") {
        return init__8977
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__8978 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.PersistentHashMap.prototype.toString = function() {
  var this__8979 = this;
  var this__8980 = this;
  return cljs.core.pr_str.call(null, this__8980)
};
cljs.core.PersistentHashMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8981 = this;
  if(this__8981.cnt > 0) {
    var s__8982 = !(this__8981.root == null) ? this__8981.root.inode_seq() : null;
    if(this__8981.has_nil_QMARK_) {
      return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([null, this__8981.nil_val], true), s__8982)
    }else {
      return s__8982
    }
  }else {
    return null
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8983 = this;
  return this__8983.cnt
};
cljs.core.PersistentHashMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8984 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8985 = this;
  return new cljs.core.PersistentHashMap(meta, this__8985.cnt, this__8985.root, this__8985.has_nil_QMARK_, this__8985.nil_val, this__8985.__hash)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8986 = this;
  return this__8986.meta
};
cljs.core.PersistentHashMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8987 = this;
  return cljs.core._with_meta.call(null, cljs.core.PersistentHashMap.EMPTY, this__8987.meta)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__8988 = this;
  if(k == null) {
    if(this__8988.has_nil_QMARK_) {
      return new cljs.core.PersistentHashMap(this__8988.meta, this__8988.cnt - 1, this__8988.root, false, null, null)
    }else {
      return coll
    }
  }else {
    if(this__8988.root == null) {
      return coll
    }else {
      if("\ufdd0'else") {
        var new_root__8989 = this__8988.root.inode_without(0, cljs.core.hash.call(null, k), k);
        if(new_root__8989 === this__8988.root) {
          return coll
        }else {
          return new cljs.core.PersistentHashMap(this__8988.meta, this__8988.cnt - 1, new_root__8989, this__8988.has_nil_QMARK_, this__8988.nil_val, null)
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
  var len__8991 = ks.length;
  var i__8992 = 0;
  var out__8993 = cljs.core.transient$.call(null, cljs.core.PersistentHashMap.EMPTY);
  while(true) {
    if(i__8992 < len__8991) {
      var G__8994 = i__8992 + 1;
      var G__8995 = cljs.core.assoc_BANG_.call(null, out__8993, ks[i__8992], vs[i__8992]);
      i__8992 = G__8994;
      out__8993 = G__8995;
      continue
    }else {
      return cljs.core.persistent_BANG_.call(null, out__8993)
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
  return cljs.core.list.call(null, "cljs.core/TransientHashMap")
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientMap$_dissoc_BANG_$arity$2 = function(tcoll, key) {
  var this__8996 = this;
  return tcoll.without_BANG_(key)
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3 = function(tcoll, key, val) {
  var this__8997 = this;
  return tcoll.assoc_BANG_(key, val)
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, val) {
  var this__8998 = this;
  return tcoll.conj_BANG_(val)
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__8999 = this;
  return tcoll.persistent_BANG_()
};
cljs.core.TransientHashMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(tcoll, k) {
  var this__9000 = this;
  if(k == null) {
    if(this__9000.has_nil_QMARK_) {
      return this__9000.nil_val
    }else {
      return null
    }
  }else {
    if(this__9000.root == null) {
      return null
    }else {
      return this__9000.root.inode_lookup(0, cljs.core.hash.call(null, k), k)
    }
  }
};
cljs.core.TransientHashMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(tcoll, k, not_found) {
  var this__9001 = this;
  if(k == null) {
    if(this__9001.has_nil_QMARK_) {
      return this__9001.nil_val
    }else {
      return not_found
    }
  }else {
    if(this__9001.root == null) {
      return not_found
    }else {
      return this__9001.root.inode_lookup(0, cljs.core.hash.call(null, k), k, not_found)
    }
  }
};
cljs.core.TransientHashMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9002 = this;
  if(this__9002.edit) {
    return this__9002.count
  }else {
    throw new Error("count after persistent!");
  }
};
cljs.core.TransientHashMap.prototype.conj_BANG_ = function(o) {
  var this__9003 = this;
  var tcoll__9004 = this;
  if(this__9003.edit) {
    if(function() {
      var G__9005__9006 = o;
      if(G__9005__9006) {
        if(function() {
          var or__3824__auto____9007 = G__9005__9006.cljs$lang$protocol_mask$partition0$ & 2048;
          if(or__3824__auto____9007) {
            return or__3824__auto____9007
          }else {
            return G__9005__9006.cljs$core$IMapEntry$
          }
        }()) {
          return true
        }else {
          if(!G__9005__9006.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.IMapEntry, G__9005__9006)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.IMapEntry, G__9005__9006)
      }
    }()) {
      return tcoll__9004.assoc_BANG_(cljs.core.key.call(null, o), cljs.core.val.call(null, o))
    }else {
      var es__9008 = cljs.core.seq.call(null, o);
      var tcoll__9009 = tcoll__9004;
      while(true) {
        var temp__3971__auto____9010 = cljs.core.first.call(null, es__9008);
        if(cljs.core.truth_(temp__3971__auto____9010)) {
          var e__9011 = temp__3971__auto____9010;
          var G__9022 = cljs.core.next.call(null, es__9008);
          var G__9023 = tcoll__9009.assoc_BANG_(cljs.core.key.call(null, e__9011), cljs.core.val.call(null, e__9011));
          es__9008 = G__9022;
          tcoll__9009 = G__9023;
          continue
        }else {
          return tcoll__9009
        }
        break
      }
    }
  }else {
    throw new Error("conj! after persistent");
  }
};
cljs.core.TransientHashMap.prototype.assoc_BANG_ = function(k, v) {
  var this__9012 = this;
  var tcoll__9013 = this;
  if(this__9012.edit) {
    if(k == null) {
      if(this__9012.nil_val === v) {
      }else {
        this__9012.nil_val = v
      }
      if(this__9012.has_nil_QMARK_) {
      }else {
        this__9012.count = this__9012.count + 1;
        this__9012.has_nil_QMARK_ = true
      }
      return tcoll__9013
    }else {
      var added_leaf_QMARK___9014 = new cljs.core.Box(false);
      var node__9015 = (this__9012.root == null ? cljs.core.BitmapIndexedNode.EMPTY : this__9012.root).inode_assoc_BANG_(this__9012.edit, 0, cljs.core.hash.call(null, k), k, v, added_leaf_QMARK___9014);
      if(node__9015 === this__9012.root) {
      }else {
        this__9012.root = node__9015
      }
      if(added_leaf_QMARK___9014.val) {
        this__9012.count = this__9012.count + 1
      }else {
      }
      return tcoll__9013
    }
  }else {
    throw new Error("assoc! after persistent!");
  }
};
cljs.core.TransientHashMap.prototype.without_BANG_ = function(k) {
  var this__9016 = this;
  var tcoll__9017 = this;
  if(this__9016.edit) {
    if(k == null) {
      if(this__9016.has_nil_QMARK_) {
        this__9016.has_nil_QMARK_ = false;
        this__9016.nil_val = null;
        this__9016.count = this__9016.count - 1;
        return tcoll__9017
      }else {
        return tcoll__9017
      }
    }else {
      if(this__9016.root == null) {
        return tcoll__9017
      }else {
        var removed_leaf_QMARK___9018 = new cljs.core.Box(false);
        var node__9019 = this__9016.root.inode_without_BANG_(this__9016.edit, 0, cljs.core.hash.call(null, k), k, removed_leaf_QMARK___9018);
        if(node__9019 === this__9016.root) {
        }else {
          this__9016.root = node__9019
        }
        if(cljs.core.truth_(removed_leaf_QMARK___9018[0])) {
          this__9016.count = this__9016.count - 1
        }else {
        }
        return tcoll__9017
      }
    }
  }else {
    throw new Error("dissoc! after persistent!");
  }
};
cljs.core.TransientHashMap.prototype.persistent_BANG_ = function() {
  var this__9020 = this;
  var tcoll__9021 = this;
  if(this__9020.edit) {
    this__9020.edit = null;
    return new cljs.core.PersistentHashMap(null, this__9020.count, this__9020.root, this__9020.has_nil_QMARK_, this__9020.nil_val, null)
  }else {
    throw new Error("persistent! called twice");
  }
};
cljs.core.TransientHashMap;
cljs.core.tree_map_seq_push = function tree_map_seq_push(node, stack, ascending_QMARK_) {
  var t__9026 = node;
  var stack__9027 = stack;
  while(true) {
    if(!(t__9026 == null)) {
      var G__9028 = ascending_QMARK_ ? t__9026.left : t__9026.right;
      var G__9029 = cljs.core.conj.call(null, stack__9027, t__9026);
      t__9026 = G__9028;
      stack__9027 = G__9029;
      continue
    }else {
      return stack__9027
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
  return cljs.core.list.call(null, "cljs.core/PersistentTreeMapSeq")
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9030 = this;
  var h__2192__auto____9031 = this__9030.__hash;
  if(!(h__2192__auto____9031 == null)) {
    return h__2192__auto____9031
  }else {
    var h__2192__auto____9032 = cljs.core.hash_coll.call(null, coll);
    this__9030.__hash = h__2192__auto____9032;
    return h__2192__auto____9032
  }
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9033 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentTreeMapSeq.prototype.toString = function() {
  var this__9034 = this;
  var this__9035 = this;
  return cljs.core.pr_str.call(null, this__9035)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__9036 = this;
  return this$
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9037 = this;
  if(this__9037.cnt < 0) {
    return cljs.core.count.call(null, cljs.core.next.call(null, coll)) + 1
  }else {
    return this__9037.cnt
  }
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(this$) {
  var this__9038 = this;
  return cljs.core.peek.call(null, this__9038.stack)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(this$) {
  var this__9039 = this;
  var t__9040 = cljs.core.first.call(null, this__9039.stack);
  var next_stack__9041 = cljs.core.tree_map_seq_push.call(null, this__9039.ascending_QMARK_ ? t__9040.right : t__9040.left, cljs.core.next.call(null, this__9039.stack), this__9039.ascending_QMARK_);
  if(!(next_stack__9041 == null)) {
    return new cljs.core.PersistentTreeMapSeq(null, next_stack__9041, this__9039.ascending_QMARK_, this__9039.cnt - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9042 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9043 = this;
  return new cljs.core.PersistentTreeMapSeq(meta, this__9043.stack, this__9043.ascending_QMARK_, this__9043.cnt, this__9043.__hash)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9044 = this;
  return this__9044.meta
};
cljs.core.PersistentTreeMapSeq;
cljs.core.create_tree_map_seq = function create_tree_map_seq(tree, ascending_QMARK_, cnt) {
  return new cljs.core.PersistentTreeMapSeq(null, cljs.core.tree_map_seq_push.call(null, tree, null, ascending_QMARK_), ascending_QMARK_, cnt, null)
};
cljs.core.balance_left = function balance_left(key, val, ins, right) {
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, ins)) {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, ins.left)) {
      return new cljs.core.RedNode(ins.key, ins.val, ins.left.blacken(), new cljs.core.BlackNode(key, val, ins.right, right, null), null)
    }else {
      if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, ins.right)) {
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
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, ins)) {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, ins.right)) {
      return new cljs.core.RedNode(ins.key, ins.val, new cljs.core.BlackNode(key, val, left, ins.left, null), ins.right.blacken(), null)
    }else {
      if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, ins.left)) {
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
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, del)) {
    return new cljs.core.RedNode(key, val, del.blacken(), right, null)
  }else {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, right)) {
      return cljs.core.balance_right.call(null, key, val, del, right.redden())
    }else {
      if(function() {
        var and__3822__auto____9046 = cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, right);
        if(and__3822__auto____9046) {
          return cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, right.left)
        }else {
          return and__3822__auto____9046
        }
      }()) {
        return new cljs.core.RedNode(right.left.key, right.left.val, new cljs.core.BlackNode(key, val, del, right.left.left, null), cljs.core.balance_right.call(null, right.key, right.val, right.left.right, right.right.redden()), null)
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
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, del)) {
    return new cljs.core.RedNode(key, val, left, del.blacken(), null)
  }else {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, left)) {
      return cljs.core.balance_left.call(null, key, val, left.redden(), del)
    }else {
      if(function() {
        var and__3822__auto____9048 = cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, left);
        if(and__3822__auto____9048) {
          return cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, left.right)
        }else {
          return and__3822__auto____9048
        }
      }()) {
        return new cljs.core.RedNode(left.right.key, left.right.val, cljs.core.balance_left.call(null, left.key, left.val, left.left.redden(), left.right.left), new cljs.core.BlackNode(key, val, left.right.right, del, null), null)
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
  var init__9052 = f.call(null, init, node.key, node.val);
  if(cljs.core.reduced_QMARK_.call(null, init__9052)) {
    return cljs.core.deref.call(null, init__9052)
  }else {
    var init__9053 = !(node.left == null) ? tree_map_kv_reduce.call(null, node.left, f, init__9052) : init__9052;
    if(cljs.core.reduced_QMARK_.call(null, init__9053)) {
      return cljs.core.deref.call(null, init__9053)
    }else {
      var init__9054 = !(node.right == null) ? tree_map_kv_reduce.call(null, node.right, f, init__9053) : init__9053;
      if(cljs.core.reduced_QMARK_.call(null, init__9054)) {
        return cljs.core.deref.call(null, init__9054)
      }else {
        return init__9054
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
  return cljs.core.list.call(null, "cljs.core/BlackNode")
};
cljs.core.BlackNode.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9057 = this;
  var h__2192__auto____9058 = this__9057.__hash;
  if(!(h__2192__auto____9058 == null)) {
    return h__2192__auto____9058
  }else {
    var h__2192__auto____9059 = cljs.core.hash_coll.call(null, coll);
    this__9057.__hash = h__2192__auto____9059;
    return h__2192__auto____9059
  }
};
cljs.core.BlackNode.prototype.cljs$core$ILookup$_lookup$arity$2 = function(node, k) {
  var this__9060 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, null)
};
cljs.core.BlackNode.prototype.cljs$core$ILookup$_lookup$arity$3 = function(node, k, not_found) {
  var this__9061 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, not_found)
};
cljs.core.BlackNode.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(node, k, v) {
  var this__9062 = this;
  return cljs.core.assoc.call(null, cljs.core.PersistentVector.fromArray([this__9062.key, this__9062.val], true), k, v)
};
cljs.core.BlackNode.prototype.call = function() {
  var G__9110 = null;
  var G__9110__2 = function(this_sym9063, k) {
    var this__9065 = this;
    var this_sym9063__9066 = this;
    var node__9067 = this_sym9063__9066;
    return node__9067.cljs$core$ILookup$_lookup$arity$2(node__9067, k)
  };
  var G__9110__3 = function(this_sym9064, k, not_found) {
    var this__9065 = this;
    var this_sym9064__9068 = this;
    var node__9069 = this_sym9064__9068;
    return node__9069.cljs$core$ILookup$_lookup$arity$3(node__9069, k, not_found)
  };
  G__9110 = function(this_sym9064, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9110__2.call(this, this_sym9064, k);
      case 3:
        return G__9110__3.call(this, this_sym9064, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9110
}();
cljs.core.BlackNode.prototype.apply = function(this_sym9055, args9056) {
  var this__9070 = this;
  return this_sym9055.call.apply(this_sym9055, [this_sym9055].concat(args9056.slice()))
};
cljs.core.BlackNode.prototype.cljs$core$ICollection$_conj$arity$2 = function(node, o) {
  var this__9071 = this;
  return cljs.core.PersistentVector.fromArray([this__9071.key, this__9071.val, o], true)
};
cljs.core.BlackNode.prototype.cljs$core$IMapEntry$_key$arity$1 = function(node) {
  var this__9072 = this;
  return this__9072.key
};
cljs.core.BlackNode.prototype.cljs$core$IMapEntry$_val$arity$1 = function(node) {
  var this__9073 = this;
  return this__9073.val
};
cljs.core.BlackNode.prototype.add_right = function(ins) {
  var this__9074 = this;
  var node__9075 = this;
  return ins.balance_right(node__9075)
};
cljs.core.BlackNode.prototype.redden = function() {
  var this__9076 = this;
  var node__9077 = this;
  return new cljs.core.RedNode(this__9076.key, this__9076.val, this__9076.left, this__9076.right, null)
};
cljs.core.BlackNode.prototype.remove_right = function(del) {
  var this__9078 = this;
  var node__9079 = this;
  return cljs.core.balance_right_del.call(null, this__9078.key, this__9078.val, this__9078.left, del)
};
cljs.core.BlackNode.prototype.replace = function(key, val, left, right) {
  var this__9080 = this;
  var node__9081 = this;
  return new cljs.core.BlackNode(key, val, left, right, null)
};
cljs.core.BlackNode.prototype.kv_reduce = function(f, init) {
  var this__9082 = this;
  var node__9083 = this;
  return cljs.core.tree_map_kv_reduce.call(null, node__9083, f, init)
};
cljs.core.BlackNode.prototype.remove_left = function(del) {
  var this__9084 = this;
  var node__9085 = this;
  return cljs.core.balance_left_del.call(null, this__9084.key, this__9084.val, del, this__9084.right)
};
cljs.core.BlackNode.prototype.add_left = function(ins) {
  var this__9086 = this;
  var node__9087 = this;
  return ins.balance_left(node__9087)
};
cljs.core.BlackNode.prototype.balance_left = function(parent) {
  var this__9088 = this;
  var node__9089 = this;
  return new cljs.core.BlackNode(parent.key, parent.val, node__9089, parent.right, null)
};
cljs.core.BlackNode.prototype.toString = function() {
  var G__9111 = null;
  var G__9111__0 = function() {
    var this__9090 = this;
    var this__9092 = this;
    return cljs.core.pr_str.call(null, this__9092)
  };
  G__9111 = function() {
    switch(arguments.length) {
      case 0:
        return G__9111__0.call(this)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9111
}();
cljs.core.BlackNode.prototype.balance_right = function(parent) {
  var this__9093 = this;
  var node__9094 = this;
  return new cljs.core.BlackNode(parent.key, parent.val, parent.left, node__9094, null)
};
cljs.core.BlackNode.prototype.blacken = function() {
  var this__9095 = this;
  var node__9096 = this;
  return node__9096
};
cljs.core.BlackNode.prototype.cljs$core$IReduce$_reduce$arity$2 = function(node, f) {
  var this__9097 = this;
  return cljs.core.ci_reduce.call(null, node, f)
};
cljs.core.BlackNode.prototype.cljs$core$IReduce$_reduce$arity$3 = function(node, f, start) {
  var this__9098 = this;
  return cljs.core.ci_reduce.call(null, node, f, start)
};
cljs.core.BlackNode.prototype.cljs$core$ISeqable$_seq$arity$1 = function(node) {
  var this__9099 = this;
  return cljs.core.list.call(null, this__9099.key, this__9099.val)
};
cljs.core.BlackNode.prototype.cljs$core$ICounted$_count$arity$1 = function(node) {
  var this__9100 = this;
  return 2
};
cljs.core.BlackNode.prototype.cljs$core$IStack$_peek$arity$1 = function(node) {
  var this__9101 = this;
  return this__9101.val
};
cljs.core.BlackNode.prototype.cljs$core$IStack$_pop$arity$1 = function(node) {
  var this__9102 = this;
  return cljs.core.PersistentVector.fromArray([this__9102.key], true)
};
cljs.core.BlackNode.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(node, n, v) {
  var this__9103 = this;
  return cljs.core._assoc_n.call(null, cljs.core.PersistentVector.fromArray([this__9103.key, this__9103.val], true), n, v)
};
cljs.core.BlackNode.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9104 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.BlackNode.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(node, meta) {
  var this__9105 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.fromArray([this__9105.key, this__9105.val], true), meta)
};
cljs.core.BlackNode.prototype.cljs$core$IMeta$_meta$arity$1 = function(node) {
  var this__9106 = this;
  return null
};
cljs.core.BlackNode.prototype.cljs$core$IIndexed$_nth$arity$2 = function(node, n) {
  var this__9107 = this;
  if(n === 0) {
    return this__9107.key
  }else {
    if(n === 1) {
      return this__9107.val
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
  var this__9108 = this;
  if(n === 0) {
    return this__9108.key
  }else {
    if(n === 1) {
      return this__9108.val
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
  var this__9109 = this;
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
  return cljs.core.list.call(null, "cljs.core/RedNode")
};
cljs.core.RedNode.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9114 = this;
  var h__2192__auto____9115 = this__9114.__hash;
  if(!(h__2192__auto____9115 == null)) {
    return h__2192__auto____9115
  }else {
    var h__2192__auto____9116 = cljs.core.hash_coll.call(null, coll);
    this__9114.__hash = h__2192__auto____9116;
    return h__2192__auto____9116
  }
};
cljs.core.RedNode.prototype.cljs$core$ILookup$_lookup$arity$2 = function(node, k) {
  var this__9117 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, null)
};
cljs.core.RedNode.prototype.cljs$core$ILookup$_lookup$arity$3 = function(node, k, not_found) {
  var this__9118 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, not_found)
};
cljs.core.RedNode.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(node, k, v) {
  var this__9119 = this;
  return cljs.core.assoc.call(null, cljs.core.PersistentVector.fromArray([this__9119.key, this__9119.val], true), k, v)
};
cljs.core.RedNode.prototype.call = function() {
  var G__9167 = null;
  var G__9167__2 = function(this_sym9120, k) {
    var this__9122 = this;
    var this_sym9120__9123 = this;
    var node__9124 = this_sym9120__9123;
    return node__9124.cljs$core$ILookup$_lookup$arity$2(node__9124, k)
  };
  var G__9167__3 = function(this_sym9121, k, not_found) {
    var this__9122 = this;
    var this_sym9121__9125 = this;
    var node__9126 = this_sym9121__9125;
    return node__9126.cljs$core$ILookup$_lookup$arity$3(node__9126, k, not_found)
  };
  G__9167 = function(this_sym9121, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9167__2.call(this, this_sym9121, k);
      case 3:
        return G__9167__3.call(this, this_sym9121, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9167
}();
cljs.core.RedNode.prototype.apply = function(this_sym9112, args9113) {
  var this__9127 = this;
  return this_sym9112.call.apply(this_sym9112, [this_sym9112].concat(args9113.slice()))
};
cljs.core.RedNode.prototype.cljs$core$ICollection$_conj$arity$2 = function(node, o) {
  var this__9128 = this;
  return cljs.core.PersistentVector.fromArray([this__9128.key, this__9128.val, o], true)
};
cljs.core.RedNode.prototype.cljs$core$IMapEntry$_key$arity$1 = function(node) {
  var this__9129 = this;
  return this__9129.key
};
cljs.core.RedNode.prototype.cljs$core$IMapEntry$_val$arity$1 = function(node) {
  var this__9130 = this;
  return this__9130.val
};
cljs.core.RedNode.prototype.add_right = function(ins) {
  var this__9131 = this;
  var node__9132 = this;
  return new cljs.core.RedNode(this__9131.key, this__9131.val, this__9131.left, ins, null)
};
cljs.core.RedNode.prototype.redden = function() {
  var this__9133 = this;
  var node__9134 = this;
  throw new Error("red-black tree invariant violation");
};
cljs.core.RedNode.prototype.remove_right = function(del) {
  var this__9135 = this;
  var node__9136 = this;
  return new cljs.core.RedNode(this__9135.key, this__9135.val, this__9135.left, del, null)
};
cljs.core.RedNode.prototype.replace = function(key, val, left, right) {
  var this__9137 = this;
  var node__9138 = this;
  return new cljs.core.RedNode(key, val, left, right, null)
};
cljs.core.RedNode.prototype.kv_reduce = function(f, init) {
  var this__9139 = this;
  var node__9140 = this;
  return cljs.core.tree_map_kv_reduce.call(null, node__9140, f, init)
};
cljs.core.RedNode.prototype.remove_left = function(del) {
  var this__9141 = this;
  var node__9142 = this;
  return new cljs.core.RedNode(this__9141.key, this__9141.val, del, this__9141.right, null)
};
cljs.core.RedNode.prototype.add_left = function(ins) {
  var this__9143 = this;
  var node__9144 = this;
  return new cljs.core.RedNode(this__9143.key, this__9143.val, ins, this__9143.right, null)
};
cljs.core.RedNode.prototype.balance_left = function(parent) {
  var this__9145 = this;
  var node__9146 = this;
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, this__9145.left)) {
    return new cljs.core.RedNode(this__9145.key, this__9145.val, this__9145.left.blacken(), new cljs.core.BlackNode(parent.key, parent.val, this__9145.right, parent.right, null), null)
  }else {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, this__9145.right)) {
      return new cljs.core.RedNode(this__9145.right.key, this__9145.right.val, new cljs.core.BlackNode(this__9145.key, this__9145.val, this__9145.left, this__9145.right.left, null), new cljs.core.BlackNode(parent.key, parent.val, this__9145.right.right, parent.right, null), null)
    }else {
      if("\ufdd0'else") {
        return new cljs.core.BlackNode(parent.key, parent.val, node__9146, parent.right, null)
      }else {
        return null
      }
    }
  }
};
cljs.core.RedNode.prototype.toString = function() {
  var G__9168 = null;
  var G__9168__0 = function() {
    var this__9147 = this;
    var this__9149 = this;
    return cljs.core.pr_str.call(null, this__9149)
  };
  G__9168 = function() {
    switch(arguments.length) {
      case 0:
        return G__9168__0.call(this)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9168
}();
cljs.core.RedNode.prototype.balance_right = function(parent) {
  var this__9150 = this;
  var node__9151 = this;
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, this__9150.right)) {
    return new cljs.core.RedNode(this__9150.key, this__9150.val, new cljs.core.BlackNode(parent.key, parent.val, parent.left, this__9150.left, null), this__9150.right.blacken(), null)
  }else {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, this__9150.left)) {
      return new cljs.core.RedNode(this__9150.left.key, this__9150.left.val, new cljs.core.BlackNode(parent.key, parent.val, parent.left, this__9150.left.left, null), new cljs.core.BlackNode(this__9150.key, this__9150.val, this__9150.left.right, this__9150.right, null), null)
    }else {
      if("\ufdd0'else") {
        return new cljs.core.BlackNode(parent.key, parent.val, parent.left, node__9151, null)
      }else {
        return null
      }
    }
  }
};
cljs.core.RedNode.prototype.blacken = function() {
  var this__9152 = this;
  var node__9153 = this;
  return new cljs.core.BlackNode(this__9152.key, this__9152.val, this__9152.left, this__9152.right, null)
};
cljs.core.RedNode.prototype.cljs$core$IReduce$_reduce$arity$2 = function(node, f) {
  var this__9154 = this;
  return cljs.core.ci_reduce.call(null, node, f)
};
cljs.core.RedNode.prototype.cljs$core$IReduce$_reduce$arity$3 = function(node, f, start) {
  var this__9155 = this;
  return cljs.core.ci_reduce.call(null, node, f, start)
};
cljs.core.RedNode.prototype.cljs$core$ISeqable$_seq$arity$1 = function(node) {
  var this__9156 = this;
  return cljs.core.list.call(null, this__9156.key, this__9156.val)
};
cljs.core.RedNode.prototype.cljs$core$ICounted$_count$arity$1 = function(node) {
  var this__9157 = this;
  return 2
};
cljs.core.RedNode.prototype.cljs$core$IStack$_peek$arity$1 = function(node) {
  var this__9158 = this;
  return this__9158.val
};
cljs.core.RedNode.prototype.cljs$core$IStack$_pop$arity$1 = function(node) {
  var this__9159 = this;
  return cljs.core.PersistentVector.fromArray([this__9159.key], true)
};
cljs.core.RedNode.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(node, n, v) {
  var this__9160 = this;
  return cljs.core._assoc_n.call(null, cljs.core.PersistentVector.fromArray([this__9160.key, this__9160.val], true), n, v)
};
cljs.core.RedNode.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9161 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.RedNode.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(node, meta) {
  var this__9162 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.fromArray([this__9162.key, this__9162.val], true), meta)
};
cljs.core.RedNode.prototype.cljs$core$IMeta$_meta$arity$1 = function(node) {
  var this__9163 = this;
  return null
};
cljs.core.RedNode.prototype.cljs$core$IIndexed$_nth$arity$2 = function(node, n) {
  var this__9164 = this;
  if(n === 0) {
    return this__9164.key
  }else {
    if(n === 1) {
      return this__9164.val
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
  var this__9165 = this;
  if(n === 0) {
    return this__9165.key
  }else {
    if(n === 1) {
      return this__9165.val
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
  var this__9166 = this;
  return cljs.core.PersistentVector.EMPTY
};
cljs.core.RedNode;
cljs.core.tree_map_add = function tree_map_add(comp, tree, k, v, found) {
  if(tree == null) {
    return new cljs.core.RedNode(k, v, null, null, null)
  }else {
    var c__9172 = comp.call(null, k, tree.key);
    if(c__9172 === 0) {
      found[0] = tree;
      return null
    }else {
      if(c__9172 < 0) {
        var ins__9173 = tree_map_add.call(null, comp, tree.left, k, v, found);
        if(!(ins__9173 == null)) {
          return tree.add_left(ins__9173)
        }else {
          return null
        }
      }else {
        if("\ufdd0'else") {
          var ins__9174 = tree_map_add.call(null, comp, tree.right, k, v, found);
          if(!(ins__9174 == null)) {
            return tree.add_right(ins__9174)
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
      if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, left)) {
        if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, right)) {
          var app__9177 = tree_map_append.call(null, left.right, right.left);
          if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, app__9177)) {
            return new cljs.core.RedNode(app__9177.key, app__9177.val, new cljs.core.RedNode(left.key, left.val, left.left, app__9177.left, null), new cljs.core.RedNode(right.key, right.val, app__9177.right, right.right, null), null)
          }else {
            return new cljs.core.RedNode(left.key, left.val, left.left, new cljs.core.RedNode(right.key, right.val, app__9177, right.right, null), null)
          }
        }else {
          return new cljs.core.RedNode(left.key, left.val, left.left, tree_map_append.call(null, left.right, right), null)
        }
      }else {
        if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, right)) {
          return new cljs.core.RedNode(right.key, right.val, tree_map_append.call(null, left, right.left), right.right, null)
        }else {
          if("\ufdd0'else") {
            var app__9178 = tree_map_append.call(null, left.right, right.left);
            if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, app__9178)) {
              return new cljs.core.RedNode(app__9178.key, app__9178.val, new cljs.core.BlackNode(left.key, left.val, left.left, app__9178.left, null), new cljs.core.BlackNode(right.key, right.val, app__9178.right, right.right, null), null)
            }else {
              return cljs.core.balance_left_del.call(null, left.key, left.val, left.left, new cljs.core.BlackNode(right.key, right.val, app__9178, right.right, null))
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
    var c__9184 = comp.call(null, k, tree.key);
    if(c__9184 === 0) {
      found[0] = tree;
      return cljs.core.tree_map_append.call(null, tree.left, tree.right)
    }else {
      if(c__9184 < 0) {
        var del__9185 = tree_map_remove.call(null, comp, tree.left, k, found);
        if(function() {
          var or__3824__auto____9186 = !(del__9185 == null);
          if(or__3824__auto____9186) {
            return or__3824__auto____9186
          }else {
            return!(found[0] == null)
          }
        }()) {
          if(cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, tree.left)) {
            return cljs.core.balance_left_del.call(null, tree.key, tree.val, del__9185, tree.right)
          }else {
            return new cljs.core.RedNode(tree.key, tree.val, del__9185, tree.right, null)
          }
        }else {
          return null
        }
      }else {
        if("\ufdd0'else") {
          var del__9187 = tree_map_remove.call(null, comp, tree.right, k, found);
          if(function() {
            var or__3824__auto____9188 = !(del__9187 == null);
            if(or__3824__auto____9188) {
              return or__3824__auto____9188
            }else {
              return!(found[0] == null)
            }
          }()) {
            if(cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, tree.right)) {
              return cljs.core.balance_right_del.call(null, tree.key, tree.val, tree.left, del__9187)
            }else {
              return new cljs.core.RedNode(tree.key, tree.val, tree.left, del__9187, null)
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
  var tk__9191 = tree.key;
  var c__9192 = comp.call(null, k, tk__9191);
  if(c__9192 === 0) {
    return tree.replace(tk__9191, v, tree.left, tree.right)
  }else {
    if(c__9192 < 0) {
      return tree.replace(tk__9191, tree.val, tree_map_replace.call(null, comp, tree.left, k, v), tree.right)
    }else {
      if("\ufdd0'else") {
        return tree.replace(tk__9191, tree.val, tree.left, tree_map_replace.call(null, comp, tree.right, k, v))
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
  return cljs.core.list.call(null, "cljs.core/PersistentTreeMap")
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9195 = this;
  var h__2192__auto____9196 = this__9195.__hash;
  if(!(h__2192__auto____9196 == null)) {
    return h__2192__auto____9196
  }else {
    var h__2192__auto____9197 = cljs.core.hash_imap.call(null, coll);
    this__9195.__hash = h__2192__auto____9197;
    return h__2192__auto____9197
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__9198 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__9199 = this;
  var n__9200 = coll.entry_at(k);
  if(!(n__9200 == null)) {
    return n__9200.val
  }else {
    return not_found
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__9201 = this;
  var found__9202 = [null];
  var t__9203 = cljs.core.tree_map_add.call(null, this__9201.comp, this__9201.tree, k, v, found__9202);
  if(t__9203 == null) {
    var found_node__9204 = cljs.core.nth.call(null, found__9202, 0);
    if(cljs.core._EQ_.call(null, v, found_node__9204.val)) {
      return coll
    }else {
      return new cljs.core.PersistentTreeMap(this__9201.comp, cljs.core.tree_map_replace.call(null, this__9201.comp, this__9201.tree, k, v), this__9201.cnt, this__9201.meta, null)
    }
  }else {
    return new cljs.core.PersistentTreeMap(this__9201.comp, t__9203.blacken(), this__9201.cnt + 1, this__9201.meta, null)
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__9205 = this;
  return!(coll.entry_at(k) == null)
};
cljs.core.PersistentTreeMap.prototype.call = function() {
  var G__9239 = null;
  var G__9239__2 = function(this_sym9206, k) {
    var this__9208 = this;
    var this_sym9206__9209 = this;
    var coll__9210 = this_sym9206__9209;
    return coll__9210.cljs$core$ILookup$_lookup$arity$2(coll__9210, k)
  };
  var G__9239__3 = function(this_sym9207, k, not_found) {
    var this__9208 = this;
    var this_sym9207__9211 = this;
    var coll__9212 = this_sym9207__9211;
    return coll__9212.cljs$core$ILookup$_lookup$arity$3(coll__9212, k, not_found)
  };
  G__9239 = function(this_sym9207, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9239__2.call(this, this_sym9207, k);
      case 3:
        return G__9239__3.call(this, this_sym9207, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9239
}();
cljs.core.PersistentTreeMap.prototype.apply = function(this_sym9193, args9194) {
  var this__9213 = this;
  return this_sym9193.call.apply(this_sym9193, [this_sym9193].concat(args9194.slice()))
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(coll, f, init) {
  var this__9214 = this;
  if(!(this__9214.tree == null)) {
    return cljs.core.tree_map_kv_reduce.call(null, this__9214.tree, f, init)
  }else {
    return init
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__9215 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__9216 = this;
  if(this__9216.cnt > 0) {
    return cljs.core.create_tree_map_seq.call(null, this__9216.tree, false, this__9216.cnt)
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.toString = function() {
  var this__9217 = this;
  var this__9218 = this;
  return cljs.core.pr_str.call(null, this__9218)
};
cljs.core.PersistentTreeMap.prototype.entry_at = function(k) {
  var this__9219 = this;
  var coll__9220 = this;
  var t__9221 = this__9219.tree;
  while(true) {
    if(!(t__9221 == null)) {
      var c__9222 = this__9219.comp.call(null, k, t__9221.key);
      if(c__9222 === 0) {
        return t__9221
      }else {
        if(c__9222 < 0) {
          var G__9240 = t__9221.left;
          t__9221 = G__9240;
          continue
        }else {
          if("\ufdd0'else") {
            var G__9241 = t__9221.right;
            t__9221 = G__9241;
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
  var this__9223 = this;
  if(this__9223.cnt > 0) {
    return cljs.core.create_tree_map_seq.call(null, this__9223.tree, ascending_QMARK_, this__9223.cnt)
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISorted$_sorted_seq_from$arity$3 = function(coll, k, ascending_QMARK_) {
  var this__9224 = this;
  if(this__9224.cnt > 0) {
    var stack__9225 = null;
    var t__9226 = this__9224.tree;
    while(true) {
      if(!(t__9226 == null)) {
        var c__9227 = this__9224.comp.call(null, k, t__9226.key);
        if(c__9227 === 0) {
          return new cljs.core.PersistentTreeMapSeq(null, cljs.core.conj.call(null, stack__9225, t__9226), ascending_QMARK_, -1, null)
        }else {
          if(cljs.core.truth_(ascending_QMARK_)) {
            if(c__9227 < 0) {
              var G__9242 = cljs.core.conj.call(null, stack__9225, t__9226);
              var G__9243 = t__9226.left;
              stack__9225 = G__9242;
              t__9226 = G__9243;
              continue
            }else {
              var G__9244 = stack__9225;
              var G__9245 = t__9226.right;
              stack__9225 = G__9244;
              t__9226 = G__9245;
              continue
            }
          }else {
            if("\ufdd0'else") {
              if(c__9227 > 0) {
                var G__9246 = cljs.core.conj.call(null, stack__9225, t__9226);
                var G__9247 = t__9226.right;
                stack__9225 = G__9246;
                t__9226 = G__9247;
                continue
              }else {
                var G__9248 = stack__9225;
                var G__9249 = t__9226.left;
                stack__9225 = G__9248;
                t__9226 = G__9249;
                continue
              }
            }else {
              return null
            }
          }
        }
      }else {
        if(stack__9225 == null) {
          return new cljs.core.PersistentTreeMapSeq(null, stack__9225, ascending_QMARK_, -1, null)
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
  var this__9228 = this;
  return cljs.core.key.call(null, entry)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISorted$_comparator$arity$1 = function(coll) {
  var this__9229 = this;
  return this__9229.comp
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9230 = this;
  if(this__9230.cnt > 0) {
    return cljs.core.create_tree_map_seq.call(null, this__9230.tree, true, this__9230.cnt)
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9231 = this;
  return this__9231.cnt
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9232 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9233 = this;
  return new cljs.core.PersistentTreeMap(this__9233.comp, this__9233.tree, this__9233.cnt, meta, this__9233.__hash)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9234 = this;
  return this__9234.meta
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9235 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentTreeMap.EMPTY, this__9235.meta)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__9236 = this;
  var found__9237 = [null];
  var t__9238 = cljs.core.tree_map_remove.call(null, this__9236.comp, this__9236.tree, k, found__9237);
  if(t__9238 == null) {
    if(cljs.core.nth.call(null, found__9237, 0) == null) {
      return coll
    }else {
      return new cljs.core.PersistentTreeMap(this__9236.comp, null, 0, this__9236.meta, null)
    }
  }else {
    return new cljs.core.PersistentTreeMap(this__9236.comp, t__9238.blacken(), this__9236.cnt - 1, this__9236.meta, null)
  }
};
cljs.core.PersistentTreeMap;
cljs.core.PersistentTreeMap.EMPTY = new cljs.core.PersistentTreeMap(cljs.core.compare, null, 0, null, 0);
cljs.core.hash_map = function() {
  var hash_map__delegate = function(keyvals) {
    var in__9252 = cljs.core.seq.call(null, keyvals);
    var out__9253 = cljs.core.transient$.call(null, cljs.core.PersistentHashMap.EMPTY);
    while(true) {
      if(in__9252) {
        var G__9254 = cljs.core.nnext.call(null, in__9252);
        var G__9255 = cljs.core.assoc_BANG_.call(null, out__9253, cljs.core.first.call(null, in__9252), cljs.core.second.call(null, in__9252));
        in__9252 = G__9254;
        out__9253 = G__9255;
        continue
      }else {
        return cljs.core.persistent_BANG_.call(null, out__9253)
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
  hash_map.cljs$lang$applyTo = function(arglist__9256) {
    var keyvals = cljs.core.seq(arglist__9256);
    return hash_map__delegate(keyvals)
  };
  hash_map.cljs$lang$arity$variadic = hash_map__delegate;
  return hash_map
}();
cljs.core.array_map = function() {
  var array_map__delegate = function(keyvals) {
    return new cljs.core.PersistentArrayMap(null, cljs.core.quot.call(null, cljs.core.count.call(null, keyvals), 2), cljs.core.apply.call(null, cljs.core.array, keyvals), null)
  };
  var array_map = function(var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return array_map__delegate.call(this, keyvals)
  };
  array_map.cljs$lang$maxFixedArity = 0;
  array_map.cljs$lang$applyTo = function(arglist__9257) {
    var keyvals = cljs.core.seq(arglist__9257);
    return array_map__delegate(keyvals)
  };
  array_map.cljs$lang$arity$variadic = array_map__delegate;
  return array_map
}();
cljs.core.obj_map = function() {
  var obj_map__delegate = function(keyvals) {
    var ks__9261 = [];
    var obj__9262 = {};
    var kvs__9263 = cljs.core.seq.call(null, keyvals);
    while(true) {
      if(kvs__9263) {
        ks__9261.push(cljs.core.first.call(null, kvs__9263));
        obj__9262[cljs.core.first.call(null, kvs__9263)] = cljs.core.second.call(null, kvs__9263);
        var G__9264 = cljs.core.nnext.call(null, kvs__9263);
        kvs__9263 = G__9264;
        continue
      }else {
        return cljs.core.ObjMap.fromObject.call(null, ks__9261, obj__9262)
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
  obj_map.cljs$lang$applyTo = function(arglist__9265) {
    var keyvals = cljs.core.seq(arglist__9265);
    return obj_map__delegate(keyvals)
  };
  obj_map.cljs$lang$arity$variadic = obj_map__delegate;
  return obj_map
}();
cljs.core.sorted_map = function() {
  var sorted_map__delegate = function(keyvals) {
    var in__9268 = cljs.core.seq.call(null, keyvals);
    var out__9269 = cljs.core.PersistentTreeMap.EMPTY;
    while(true) {
      if(in__9268) {
        var G__9270 = cljs.core.nnext.call(null, in__9268);
        var G__9271 = cljs.core.assoc.call(null, out__9269, cljs.core.first.call(null, in__9268), cljs.core.second.call(null, in__9268));
        in__9268 = G__9270;
        out__9269 = G__9271;
        continue
      }else {
        return out__9269
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
  sorted_map.cljs$lang$applyTo = function(arglist__9272) {
    var keyvals = cljs.core.seq(arglist__9272);
    return sorted_map__delegate(keyvals)
  };
  sorted_map.cljs$lang$arity$variadic = sorted_map__delegate;
  return sorted_map
}();
cljs.core.sorted_map_by = function() {
  var sorted_map_by__delegate = function(comparator, keyvals) {
    var in__9275 = cljs.core.seq.call(null, keyvals);
    var out__9276 = new cljs.core.PersistentTreeMap(comparator, null, 0, null, 0);
    while(true) {
      if(in__9275) {
        var G__9277 = cljs.core.nnext.call(null, in__9275);
        var G__9278 = cljs.core.assoc.call(null, out__9276, cljs.core.first.call(null, in__9275), cljs.core.second.call(null, in__9275));
        in__9275 = G__9277;
        out__9276 = G__9278;
        continue
      }else {
        return out__9276
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
  sorted_map_by.cljs$lang$applyTo = function(arglist__9279) {
    var comparator = cljs.core.first(arglist__9279);
    var keyvals = cljs.core.rest(arglist__9279);
    return sorted_map_by__delegate(comparator, keyvals)
  };
  sorted_map_by.cljs$lang$arity$variadic = sorted_map_by__delegate;
  return sorted_map_by
}();
cljs.core.keys = function keys(hash_map) {
  return cljs.core.seq.call(null, cljs.core.map.call(null, cljs.core.first, hash_map))
};
cljs.core.key = function key(map_entry) {
  return cljs.core._key.call(null, map_entry)
};
cljs.core.vals = function vals(hash_map) {
  return cljs.core.seq.call(null, cljs.core.map.call(null, cljs.core.second, hash_map))
};
cljs.core.val = function val(map_entry) {
  return cljs.core._val.call(null, map_entry)
};
cljs.core.merge = function() {
  var merge__delegate = function(maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      return cljs.core.reduce.call(null, function(p1__9280_SHARP_, p2__9281_SHARP_) {
        return cljs.core.conj.call(null, function() {
          var or__3824__auto____9283 = p1__9280_SHARP_;
          if(cljs.core.truth_(or__3824__auto____9283)) {
            return or__3824__auto____9283
          }else {
            return cljs.core.ObjMap.EMPTY
          }
        }(), p2__9281_SHARP_)
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
  merge.cljs$lang$applyTo = function(arglist__9284) {
    var maps = cljs.core.seq(arglist__9284);
    return merge__delegate(maps)
  };
  merge.cljs$lang$arity$variadic = merge__delegate;
  return merge
}();
cljs.core.merge_with = function() {
  var merge_with__delegate = function(f, maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      var merge_entry__9292 = function(m, e) {
        var k__9290 = cljs.core.first.call(null, e);
        var v__9291 = cljs.core.second.call(null, e);
        if(cljs.core.contains_QMARK_.call(null, m, k__9290)) {
          return cljs.core.assoc.call(null, m, k__9290, f.call(null, cljs.core._lookup.call(null, m, k__9290, null), v__9291))
        }else {
          return cljs.core.assoc.call(null, m, k__9290, v__9291)
        }
      };
      var merge2__9294 = function(m1, m2) {
        return cljs.core.reduce.call(null, merge_entry__9292, function() {
          var or__3824__auto____9293 = m1;
          if(cljs.core.truth_(or__3824__auto____9293)) {
            return or__3824__auto____9293
          }else {
            return cljs.core.ObjMap.EMPTY
          }
        }(), cljs.core.seq.call(null, m2))
      };
      return cljs.core.reduce.call(null, merge2__9294, maps)
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
  merge_with.cljs$lang$applyTo = function(arglist__9295) {
    var f = cljs.core.first(arglist__9295);
    var maps = cljs.core.rest(arglist__9295);
    return merge_with__delegate(f, maps)
  };
  merge_with.cljs$lang$arity$variadic = merge_with__delegate;
  return merge_with
}();
cljs.core.select_keys = function select_keys(map, keyseq) {
  var ret__9300 = cljs.core.ObjMap.EMPTY;
  var keys__9301 = cljs.core.seq.call(null, keyseq);
  while(true) {
    if(keys__9301) {
      var key__9302 = cljs.core.first.call(null, keys__9301);
      var entry__9303 = cljs.core._lookup.call(null, map, key__9302, "\ufdd0'cljs.core/not-found");
      var G__9304 = cljs.core.not_EQ_.call(null, entry__9303, "\ufdd0'cljs.core/not-found") ? cljs.core.assoc.call(null, ret__9300, key__9302, entry__9303) : ret__9300;
      var G__9305 = cljs.core.next.call(null, keys__9301);
      ret__9300 = G__9304;
      keys__9301 = G__9305;
      continue
    }else {
      return ret__9300
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
  return cljs.core.list.call(null, "cljs.core/PersistentHashSet")
};
cljs.core.PersistentHashSet.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__9309 = this;
  return new cljs.core.TransientHashSet(cljs.core.transient$.call(null, this__9309.hash_map))
};
cljs.core.PersistentHashSet.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9310 = this;
  var h__2192__auto____9311 = this__9310.__hash;
  if(!(h__2192__auto____9311 == null)) {
    return h__2192__auto____9311
  }else {
    var h__2192__auto____9312 = cljs.core.hash_iset.call(null, coll);
    this__9310.__hash = h__2192__auto____9312;
    return h__2192__auto____9312
  }
};
cljs.core.PersistentHashSet.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, v) {
  var this__9313 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, v, null)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, v, not_found) {
  var this__9314 = this;
  if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__9314.hash_map, v))) {
    return v
  }else {
    return not_found
  }
};
cljs.core.PersistentHashSet.prototype.call = function() {
  var G__9335 = null;
  var G__9335__2 = function(this_sym9315, k) {
    var this__9317 = this;
    var this_sym9315__9318 = this;
    var coll__9319 = this_sym9315__9318;
    return coll__9319.cljs$core$ILookup$_lookup$arity$2(coll__9319, k)
  };
  var G__9335__3 = function(this_sym9316, k, not_found) {
    var this__9317 = this;
    var this_sym9316__9320 = this;
    var coll__9321 = this_sym9316__9320;
    return coll__9321.cljs$core$ILookup$_lookup$arity$3(coll__9321, k, not_found)
  };
  G__9335 = function(this_sym9316, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9335__2.call(this, this_sym9316, k);
      case 3:
        return G__9335__3.call(this, this_sym9316, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9335
}();
cljs.core.PersistentHashSet.prototype.apply = function(this_sym9307, args9308) {
  var this__9322 = this;
  return this_sym9307.call.apply(this_sym9307, [this_sym9307].concat(args9308.slice()))
};
cljs.core.PersistentHashSet.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9323 = this;
  return new cljs.core.PersistentHashSet(this__9323.meta, cljs.core.assoc.call(null, this__9323.hash_map, o, null), null)
};
cljs.core.PersistentHashSet.prototype.toString = function() {
  var this__9324 = this;
  var this__9325 = this;
  return cljs.core.pr_str.call(null, this__9325)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9326 = this;
  return cljs.core.keys.call(null, this__9326.hash_map)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ISet$_disjoin$arity$2 = function(coll, v) {
  var this__9327 = this;
  return new cljs.core.PersistentHashSet(this__9327.meta, cljs.core.dissoc.call(null, this__9327.hash_map, v), null)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9328 = this;
  return cljs.core.count.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentHashSet.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9329 = this;
  var and__3822__auto____9330 = cljs.core.set_QMARK_.call(null, other);
  if(and__3822__auto____9330) {
    var and__3822__auto____9331 = cljs.core.count.call(null, coll) === cljs.core.count.call(null, other);
    if(and__3822__auto____9331) {
      return cljs.core.every_QMARK_.call(null, function(p1__9306_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__9306_SHARP_)
      }, other)
    }else {
      return and__3822__auto____9331
    }
  }else {
    return and__3822__auto____9330
  }
};
cljs.core.PersistentHashSet.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9332 = this;
  return new cljs.core.PersistentHashSet(meta, this__9332.hash_map, this__9332.__hash)
};
cljs.core.PersistentHashSet.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9333 = this;
  return this__9333.meta
};
cljs.core.PersistentHashSet.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9334 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentHashSet.EMPTY, this__9334.meta)
};
cljs.core.PersistentHashSet;
cljs.core.PersistentHashSet.EMPTY = new cljs.core.PersistentHashSet(null, cljs.core.hash_map.call(null), 0);
cljs.core.PersistentHashSet.fromArray = function(items) {
  var len__9336 = cljs.core.count.call(null, items);
  var i__9337 = 0;
  var out__9338 = cljs.core.transient$.call(null, cljs.core.PersistentHashSet.EMPTY);
  while(true) {
    if(i__9337 < len__9336) {
      var G__9339 = i__9337 + 1;
      var G__9340 = cljs.core.conj_BANG_.call(null, out__9338, items[i__9337]);
      i__9337 = G__9339;
      out__9338 = G__9340;
      continue
    }else {
      return cljs.core.persistent_BANG_.call(null, out__9338)
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
  return cljs.core.list.call(null, "cljs.core/TransientHashSet")
};
cljs.core.TransientHashSet.prototype.call = function() {
  var G__9358 = null;
  var G__9358__2 = function(this_sym9344, k) {
    var this__9346 = this;
    var this_sym9344__9347 = this;
    var tcoll__9348 = this_sym9344__9347;
    if(cljs.core._lookup.call(null, this__9346.transient_map, k, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
      return null
    }else {
      return k
    }
  };
  var G__9358__3 = function(this_sym9345, k, not_found) {
    var this__9346 = this;
    var this_sym9345__9349 = this;
    var tcoll__9350 = this_sym9345__9349;
    if(cljs.core._lookup.call(null, this__9346.transient_map, k, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
      return not_found
    }else {
      return k
    }
  };
  G__9358 = function(this_sym9345, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9358__2.call(this, this_sym9345, k);
      case 3:
        return G__9358__3.call(this, this_sym9345, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9358
}();
cljs.core.TransientHashSet.prototype.apply = function(this_sym9342, args9343) {
  var this__9351 = this;
  return this_sym9342.call.apply(this_sym9342, [this_sym9342].concat(args9343.slice()))
};
cljs.core.TransientHashSet.prototype.cljs$core$ILookup$_lookup$arity$2 = function(tcoll, v) {
  var this__9352 = this;
  return tcoll.cljs$core$ILookup$_lookup$arity$3(tcoll, v, null)
};
cljs.core.TransientHashSet.prototype.cljs$core$ILookup$_lookup$arity$3 = function(tcoll, v, not_found) {
  var this__9353 = this;
  if(cljs.core._lookup.call(null, this__9353.transient_map, v, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
    return not_found
  }else {
    return v
  }
};
cljs.core.TransientHashSet.prototype.cljs$core$ICounted$_count$arity$1 = function(tcoll) {
  var this__9354 = this;
  return cljs.core.count.call(null, this__9354.transient_map)
};
cljs.core.TransientHashSet.prototype.cljs$core$ITransientSet$_disjoin_BANG_$arity$2 = function(tcoll, v) {
  var this__9355 = this;
  this__9355.transient_map = cljs.core.dissoc_BANG_.call(null, this__9355.transient_map, v);
  return tcoll
};
cljs.core.TransientHashSet.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, o) {
  var this__9356 = this;
  this__9356.transient_map = cljs.core.assoc_BANG_.call(null, this__9356.transient_map, o, null);
  return tcoll
};
cljs.core.TransientHashSet.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__9357 = this;
  return new cljs.core.PersistentHashSet(null, cljs.core.persistent_BANG_.call(null, this__9357.transient_map), null)
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
  return cljs.core.list.call(null, "cljs.core/PersistentTreeSet")
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9361 = this;
  var h__2192__auto____9362 = this__9361.__hash;
  if(!(h__2192__auto____9362 == null)) {
    return h__2192__auto____9362
  }else {
    var h__2192__auto____9363 = cljs.core.hash_iset.call(null, coll);
    this__9361.__hash = h__2192__auto____9363;
    return h__2192__auto____9363
  }
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, v) {
  var this__9364 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, v, null)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, v, not_found) {
  var this__9365 = this;
  if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__9365.tree_map, v))) {
    return v
  }else {
    return not_found
  }
};
cljs.core.PersistentTreeSet.prototype.call = function() {
  var G__9391 = null;
  var G__9391__2 = function(this_sym9366, k) {
    var this__9368 = this;
    var this_sym9366__9369 = this;
    var coll__9370 = this_sym9366__9369;
    return coll__9370.cljs$core$ILookup$_lookup$arity$2(coll__9370, k)
  };
  var G__9391__3 = function(this_sym9367, k, not_found) {
    var this__9368 = this;
    var this_sym9367__9371 = this;
    var coll__9372 = this_sym9367__9371;
    return coll__9372.cljs$core$ILookup$_lookup$arity$3(coll__9372, k, not_found)
  };
  G__9391 = function(this_sym9367, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9391__2.call(this, this_sym9367, k);
      case 3:
        return G__9391__3.call(this, this_sym9367, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9391
}();
cljs.core.PersistentTreeSet.prototype.apply = function(this_sym9359, args9360) {
  var this__9373 = this;
  return this_sym9359.call.apply(this_sym9359, [this_sym9359].concat(args9360.slice()))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9374 = this;
  return new cljs.core.PersistentTreeSet(this__9374.meta, cljs.core.assoc.call(null, this__9374.tree_map, o, null), null)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__9375 = this;
  return cljs.core.map.call(null, cljs.core.key, cljs.core.rseq.call(null, this__9375.tree_map))
};
cljs.core.PersistentTreeSet.prototype.toString = function() {
  var this__9376 = this;
  var this__9377 = this;
  return cljs.core.pr_str.call(null, this__9377)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_sorted_seq$arity$2 = function(coll, ascending_QMARK_) {
  var this__9378 = this;
  return cljs.core.map.call(null, cljs.core.key, cljs.core._sorted_seq.call(null, this__9378.tree_map, ascending_QMARK_))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_sorted_seq_from$arity$3 = function(coll, k, ascending_QMARK_) {
  var this__9379 = this;
  return cljs.core.map.call(null, cljs.core.key, cljs.core._sorted_seq_from.call(null, this__9379.tree_map, k, ascending_QMARK_))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_entry_key$arity$2 = function(coll, entry) {
  var this__9380 = this;
  return entry
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_comparator$arity$1 = function(coll) {
  var this__9381 = this;
  return cljs.core._comparator.call(null, this__9381.tree_map)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9382 = this;
  return cljs.core.keys.call(null, this__9382.tree_map)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISet$_disjoin$arity$2 = function(coll, v) {
  var this__9383 = this;
  return new cljs.core.PersistentTreeSet(this__9383.meta, cljs.core.dissoc.call(null, this__9383.tree_map, v), null)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9384 = this;
  return cljs.core.count.call(null, this__9384.tree_map)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9385 = this;
  var and__3822__auto____9386 = cljs.core.set_QMARK_.call(null, other);
  if(and__3822__auto____9386) {
    var and__3822__auto____9387 = cljs.core.count.call(null, coll) === cljs.core.count.call(null, other);
    if(and__3822__auto____9387) {
      return cljs.core.every_QMARK_.call(null, function(p1__9341_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__9341_SHARP_)
      }, other)
    }else {
      return and__3822__auto____9387
    }
  }else {
    return and__3822__auto____9386
  }
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9388 = this;
  return new cljs.core.PersistentTreeSet(meta, this__9388.tree_map, this__9388.__hash)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9389 = this;
  return this__9389.meta
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9390 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentTreeSet.EMPTY, this__9390.meta)
};
cljs.core.PersistentTreeSet;
cljs.core.PersistentTreeSet.EMPTY = new cljs.core.PersistentTreeSet(null, cljs.core.sorted_map.call(null), 0);
cljs.core.hash_set = function() {
  var hash_set = null;
  var hash_set__0 = function() {
    return cljs.core.PersistentHashSet.EMPTY
  };
  var hash_set__1 = function() {
    var G__9396__delegate = function(keys) {
      var in__9394 = cljs.core.seq.call(null, keys);
      var out__9395 = cljs.core.transient$.call(null, cljs.core.PersistentHashSet.EMPTY);
      while(true) {
        if(cljs.core.seq.call(null, in__9394)) {
          var G__9397 = cljs.core.next.call(null, in__9394);
          var G__9398 = cljs.core.conj_BANG_.call(null, out__9395, cljs.core.first.call(null, in__9394));
          in__9394 = G__9397;
          out__9395 = G__9398;
          continue
        }else {
          return cljs.core.persistent_BANG_.call(null, out__9395)
        }
        break
      }
    };
    var G__9396 = function(var_args) {
      var keys = null;
      if(goog.isDef(var_args)) {
        keys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__9396__delegate.call(this, keys)
    };
    G__9396.cljs$lang$maxFixedArity = 0;
    G__9396.cljs$lang$applyTo = function(arglist__9399) {
      var keys = cljs.core.seq(arglist__9399);
      return G__9396__delegate(keys)
    };
    G__9396.cljs$lang$arity$variadic = G__9396__delegate;
    return G__9396
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
  return cljs.core.apply.call(null, cljs.core.hash_set, coll)
};
cljs.core.sorted_set = function() {
  var sorted_set__delegate = function(keys) {
    return cljs.core.reduce.call(null, cljs.core._conj, cljs.core.PersistentTreeSet.EMPTY, keys)
  };
  var sorted_set = function(var_args) {
    var keys = null;
    if(goog.isDef(var_args)) {
      keys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return sorted_set__delegate.call(this, keys)
  };
  sorted_set.cljs$lang$maxFixedArity = 0;
  sorted_set.cljs$lang$applyTo = function(arglist__9400) {
    var keys = cljs.core.seq(arglist__9400);
    return sorted_set__delegate(keys)
  };
  sorted_set.cljs$lang$arity$variadic = sorted_set__delegate;
  return sorted_set
}();
cljs.core.sorted_set_by = function() {
  var sorted_set_by__delegate = function(comparator, keys) {
    return cljs.core.reduce.call(null, cljs.core._conj, new cljs.core.PersistentTreeSet(null, cljs.core.sorted_map_by.call(null, comparator), 0), keys)
  };
  var sorted_set_by = function(comparator, var_args) {
    var keys = null;
    if(goog.isDef(var_args)) {
      keys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return sorted_set_by__delegate.call(this, comparator, keys)
  };
  sorted_set_by.cljs$lang$maxFixedArity = 1;
  sorted_set_by.cljs$lang$applyTo = function(arglist__9402) {
    var comparator = cljs.core.first(arglist__9402);
    var keys = cljs.core.rest(arglist__9402);
    return sorted_set_by__delegate(comparator, keys)
  };
  sorted_set_by.cljs$lang$arity$variadic = sorted_set_by__delegate;
  return sorted_set_by
}();
cljs.core.replace = function replace(smap, coll) {
  if(cljs.core.vector_QMARK_.call(null, coll)) {
    var n__9408 = cljs.core.count.call(null, coll);
    return cljs.core.reduce.call(null, function(v, i) {
      var temp__3971__auto____9409 = cljs.core.find.call(null, smap, cljs.core.nth.call(null, v, i));
      if(cljs.core.truth_(temp__3971__auto____9409)) {
        var e__9410 = temp__3971__auto____9409;
        return cljs.core.assoc.call(null, v, i, cljs.core.second.call(null, e__9410))
      }else {
        return v
      }
    }, coll, cljs.core.take.call(null, n__9408, cljs.core.iterate.call(null, cljs.core.inc, 0)))
  }else {
    return cljs.core.map.call(null, function(p1__9401_SHARP_) {
      var temp__3971__auto____9411 = cljs.core.find.call(null, smap, p1__9401_SHARP_);
      if(cljs.core.truth_(temp__3971__auto____9411)) {
        var e__9412 = temp__3971__auto____9411;
        return cljs.core.second.call(null, e__9412)
      }else {
        return p1__9401_SHARP_
      }
    }, coll)
  }
};
cljs.core.distinct = function distinct(coll) {
  var step__9442 = function step(xs, seen) {
    return new cljs.core.LazySeq(null, false, function() {
      return function(p__9435, seen) {
        while(true) {
          var vec__9436__9437 = p__9435;
          var f__9438 = cljs.core.nth.call(null, vec__9436__9437, 0, null);
          var xs__9439 = vec__9436__9437;
          var temp__3974__auto____9440 = cljs.core.seq.call(null, xs__9439);
          if(temp__3974__auto____9440) {
            var s__9441 = temp__3974__auto____9440;
            if(cljs.core.contains_QMARK_.call(null, seen, f__9438)) {
              var G__9443 = cljs.core.rest.call(null, s__9441);
              var G__9444 = seen;
              p__9435 = G__9443;
              seen = G__9444;
              continue
            }else {
              return cljs.core.cons.call(null, f__9438, step.call(null, cljs.core.rest.call(null, s__9441), cljs.core.conj.call(null, seen, f__9438)))
            }
          }else {
            return null
          }
          break
        }
      }.call(null, xs, seen)
    }, null)
  };
  return step__9442.call(null, coll, cljs.core.PersistentHashSet.EMPTY)
};
cljs.core.butlast = function butlast(s) {
  var ret__9447 = cljs.core.PersistentVector.EMPTY;
  var s__9448 = s;
  while(true) {
    if(cljs.core.next.call(null, s__9448)) {
      var G__9449 = cljs.core.conj.call(null, ret__9447, cljs.core.first.call(null, s__9448));
      var G__9450 = cljs.core.next.call(null, s__9448);
      ret__9447 = G__9449;
      s__9448 = G__9450;
      continue
    }else {
      return cljs.core.seq.call(null, ret__9447)
    }
    break
  }
};
cljs.core.name = function name(x) {
  if(cljs.core.string_QMARK_.call(null, x)) {
    return x
  }else {
    if(function() {
      var or__3824__auto____9453 = cljs.core.keyword_QMARK_.call(null, x);
      if(or__3824__auto____9453) {
        return or__3824__auto____9453
      }else {
        return cljs.core.symbol_QMARK_.call(null, x)
      }
    }()) {
      var i__9454 = x.lastIndexOf("/");
      if(i__9454 < 0) {
        return cljs.core.subs.call(null, x, 2)
      }else {
        return cljs.core.subs.call(null, x, i__9454 + 1)
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
    var or__3824__auto____9457 = cljs.core.keyword_QMARK_.call(null, x);
    if(or__3824__auto____9457) {
      return or__3824__auto____9457
    }else {
      return cljs.core.symbol_QMARK_.call(null, x)
    }
  }()) {
    var i__9458 = x.lastIndexOf("/");
    if(i__9458 > -1) {
      return cljs.core.subs.call(null, x, 2, i__9458)
    }else {
      return null
    }
  }else {
    throw new Error([cljs.core.str("Doesn't support namespace: "), cljs.core.str(x)].join(""));
  }
};
cljs.core.zipmap = function zipmap(keys, vals) {
  var map__9465 = cljs.core.ObjMap.EMPTY;
  var ks__9466 = cljs.core.seq.call(null, keys);
  var vs__9467 = cljs.core.seq.call(null, vals);
  while(true) {
    if(function() {
      var and__3822__auto____9468 = ks__9466;
      if(and__3822__auto____9468) {
        return vs__9467
      }else {
        return and__3822__auto____9468
      }
    }()) {
      var G__9469 = cljs.core.assoc.call(null, map__9465, cljs.core.first.call(null, ks__9466), cljs.core.first.call(null, vs__9467));
      var G__9470 = cljs.core.next.call(null, ks__9466);
      var G__9471 = cljs.core.next.call(null, vs__9467);
      map__9465 = G__9469;
      ks__9466 = G__9470;
      vs__9467 = G__9471;
      continue
    }else {
      return map__9465
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
    if(k.call(null, x) > k.call(null, y)) {
      return x
    }else {
      return y
    }
  };
  var max_key__4 = function() {
    var G__9474__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__9459_SHARP_, p2__9460_SHARP_) {
        return max_key.call(null, k, p1__9459_SHARP_, p2__9460_SHARP_)
      }, max_key.call(null, k, x, y), more)
    };
    var G__9474 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__9474__delegate.call(this, k, x, y, more)
    };
    G__9474.cljs$lang$maxFixedArity = 3;
    G__9474.cljs$lang$applyTo = function(arglist__9475) {
      var k = cljs.core.first(arglist__9475);
      var x = cljs.core.first(cljs.core.next(arglist__9475));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9475)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9475)));
      return G__9474__delegate(k, x, y, more)
    };
    G__9474.cljs$lang$arity$variadic = G__9474__delegate;
    return G__9474
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
    if(k.call(null, x) < k.call(null, y)) {
      return x
    }else {
      return y
    }
  };
  var min_key__4 = function() {
    var G__9476__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__9472_SHARP_, p2__9473_SHARP_) {
        return min_key.call(null, k, p1__9472_SHARP_, p2__9473_SHARP_)
      }, min_key.call(null, k, x, y), more)
    };
    var G__9476 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__9476__delegate.call(this, k, x, y, more)
    };
    G__9476.cljs$lang$maxFixedArity = 3;
    G__9476.cljs$lang$applyTo = function(arglist__9477) {
      var k = cljs.core.first(arglist__9477);
      var x = cljs.core.first(cljs.core.next(arglist__9477));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9477)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9477)));
      return G__9476__delegate(k, x, y, more)
    };
    G__9476.cljs$lang$arity$variadic = G__9476__delegate;
    return G__9476
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
    return partition_all.call(null, n, n, coll)
  };
  var partition_all__3 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____9480 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____9480) {
        var s__9481 = temp__3974__auto____9480;
        return cljs.core.cons.call(null, cljs.core.take.call(null, n, s__9481), partition_all.call(null, n, step, cljs.core.drop.call(null, step, s__9481)))
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
    var temp__3974__auto____9484 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____9484) {
      var s__9485 = temp__3974__auto____9484;
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, s__9485)))) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__9485), take_while.call(null, pred, cljs.core.rest.call(null, s__9485)))
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
    var comp__9487 = cljs.core._comparator.call(null, sc);
    return test.call(null, comp__9487.call(null, cljs.core._entry_key.call(null, sc, e), key), 0)
  }
};
cljs.core.subseq = function() {
  var subseq = null;
  var subseq__3 = function(sc, test, key) {
    var include__9499 = cljs.core.mk_bound_fn.call(null, sc, test, key);
    if(cljs.core.truth_(cljs.core.PersistentHashSet.fromArray([cljs.core._GT_, cljs.core._GT__EQ_]).call(null, test))) {
      var temp__3974__auto____9500 = cljs.core._sorted_seq_from.call(null, sc, key, true);
      if(cljs.core.truth_(temp__3974__auto____9500)) {
        var vec__9501__9502 = temp__3974__auto____9500;
        var e__9503 = cljs.core.nth.call(null, vec__9501__9502, 0, null);
        var s__9504 = vec__9501__9502;
        if(cljs.core.truth_(include__9499.call(null, e__9503))) {
          return s__9504
        }else {
          return cljs.core.next.call(null, s__9504)
        }
      }else {
        return null
      }
    }else {
      return cljs.core.take_while.call(null, include__9499, cljs.core._sorted_seq.call(null, sc, true))
    }
  };
  var subseq__5 = function(sc, start_test, start_key, end_test, end_key) {
    var temp__3974__auto____9505 = cljs.core._sorted_seq_from.call(null, sc, start_key, true);
    if(cljs.core.truth_(temp__3974__auto____9505)) {
      var vec__9506__9507 = temp__3974__auto____9505;
      var e__9508 = cljs.core.nth.call(null, vec__9506__9507, 0, null);
      var s__9509 = vec__9506__9507;
      return cljs.core.take_while.call(null, cljs.core.mk_bound_fn.call(null, sc, end_test, end_key), cljs.core.truth_(cljs.core.mk_bound_fn.call(null, sc, start_test, start_key).call(null, e__9508)) ? s__9509 : cljs.core.next.call(null, s__9509))
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
    var include__9521 = cljs.core.mk_bound_fn.call(null, sc, test, key);
    if(cljs.core.truth_(cljs.core.PersistentHashSet.fromArray([cljs.core._LT_, cljs.core._LT__EQ_]).call(null, test))) {
      var temp__3974__auto____9522 = cljs.core._sorted_seq_from.call(null, sc, key, false);
      if(cljs.core.truth_(temp__3974__auto____9522)) {
        var vec__9523__9524 = temp__3974__auto____9522;
        var e__9525 = cljs.core.nth.call(null, vec__9523__9524, 0, null);
        var s__9526 = vec__9523__9524;
        if(cljs.core.truth_(include__9521.call(null, e__9525))) {
          return s__9526
        }else {
          return cljs.core.next.call(null, s__9526)
        }
      }else {
        return null
      }
    }else {
      return cljs.core.take_while.call(null, include__9521, cljs.core._sorted_seq.call(null, sc, false))
    }
  };
  var rsubseq__5 = function(sc, start_test, start_key, end_test, end_key) {
    var temp__3974__auto____9527 = cljs.core._sorted_seq_from.call(null, sc, end_key, false);
    if(cljs.core.truth_(temp__3974__auto____9527)) {
      var vec__9528__9529 = temp__3974__auto____9527;
      var e__9530 = cljs.core.nth.call(null, vec__9528__9529, 0, null);
      var s__9531 = vec__9528__9529;
      return cljs.core.take_while.call(null, cljs.core.mk_bound_fn.call(null, sc, start_test, start_key), cljs.core.truth_(cljs.core.mk_bound_fn.call(null, sc, end_test, end_key).call(null, e__9530)) ? s__9531 : cljs.core.next.call(null, s__9531))
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
  return cljs.core.list.call(null, "cljs.core/Range")
};
cljs.core.Range.prototype.cljs$core$IHash$_hash$arity$1 = function(rng) {
  var this__9532 = this;
  var h__2192__auto____9533 = this__9532.__hash;
  if(!(h__2192__auto____9533 == null)) {
    return h__2192__auto____9533
  }else {
    var h__2192__auto____9534 = cljs.core.hash_coll.call(null, rng);
    this__9532.__hash = h__2192__auto____9534;
    return h__2192__auto____9534
  }
};
cljs.core.Range.prototype.cljs$core$INext$_next$arity$1 = function(rng) {
  var this__9535 = this;
  if(this__9535.step > 0) {
    if(this__9535.start + this__9535.step < this__9535.end) {
      return new cljs.core.Range(this__9535.meta, this__9535.start + this__9535.step, this__9535.end, this__9535.step, null)
    }else {
      return null
    }
  }else {
    if(this__9535.start + this__9535.step > this__9535.end) {
      return new cljs.core.Range(this__9535.meta, this__9535.start + this__9535.step, this__9535.end, this__9535.step, null)
    }else {
      return null
    }
  }
};
cljs.core.Range.prototype.cljs$core$ICollection$_conj$arity$2 = function(rng, o) {
  var this__9536 = this;
  return cljs.core.cons.call(null, o, rng)
};
cljs.core.Range.prototype.toString = function() {
  var this__9537 = this;
  var this__9538 = this;
  return cljs.core.pr_str.call(null, this__9538)
};
cljs.core.Range.prototype.cljs$core$IReduce$_reduce$arity$2 = function(rng, f) {
  var this__9539 = this;
  return cljs.core.ci_reduce.call(null, rng, f)
};
cljs.core.Range.prototype.cljs$core$IReduce$_reduce$arity$3 = function(rng, f, s) {
  var this__9540 = this;
  return cljs.core.ci_reduce.call(null, rng, f, s)
};
cljs.core.Range.prototype.cljs$core$ISeqable$_seq$arity$1 = function(rng) {
  var this__9541 = this;
  if(this__9541.step > 0) {
    if(this__9541.start < this__9541.end) {
      return rng
    }else {
      return null
    }
  }else {
    if(this__9541.start > this__9541.end) {
      return rng
    }else {
      return null
    }
  }
};
cljs.core.Range.prototype.cljs$core$ICounted$_count$arity$1 = function(rng) {
  var this__9542 = this;
  if(cljs.core.not.call(null, rng.cljs$core$ISeqable$_seq$arity$1(rng))) {
    return 0
  }else {
    return Math.ceil((this__9542.end - this__9542.start) / this__9542.step)
  }
};
cljs.core.Range.prototype.cljs$core$ISeq$_first$arity$1 = function(rng) {
  var this__9543 = this;
  return this__9543.start
};
cljs.core.Range.prototype.cljs$core$ISeq$_rest$arity$1 = function(rng) {
  var this__9544 = this;
  if(!(rng.cljs$core$ISeqable$_seq$arity$1(rng) == null)) {
    return new cljs.core.Range(this__9544.meta, this__9544.start + this__9544.step, this__9544.end, this__9544.step, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(rng, other) {
  var this__9545 = this;
  return cljs.core.equiv_sequential.call(null, rng, other)
};
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(rng, meta) {
  var this__9546 = this;
  return new cljs.core.Range(meta, this__9546.start, this__9546.end, this__9546.step, this__9546.__hash)
};
cljs.core.Range.prototype.cljs$core$IMeta$_meta$arity$1 = function(rng) {
  var this__9547 = this;
  return this__9547.meta
};
cljs.core.Range.prototype.cljs$core$IIndexed$_nth$arity$2 = function(rng, n) {
  var this__9548 = this;
  if(n < rng.cljs$core$ICounted$_count$arity$1(rng)) {
    return this__9548.start + n * this__9548.step
  }else {
    if(function() {
      var and__3822__auto____9549 = this__9548.start > this__9548.end;
      if(and__3822__auto____9549) {
        return this__9548.step === 0
      }else {
        return and__3822__auto____9549
      }
    }()) {
      return this__9548.start
    }else {
      throw new Error("Index out of bounds");
    }
  }
};
cljs.core.Range.prototype.cljs$core$IIndexed$_nth$arity$3 = function(rng, n, not_found) {
  var this__9550 = this;
  if(n < rng.cljs$core$ICounted$_count$arity$1(rng)) {
    return this__9550.start + n * this__9550.step
  }else {
    if(function() {
      var and__3822__auto____9551 = this__9550.start > this__9550.end;
      if(and__3822__auto____9551) {
        return this__9550.step === 0
      }else {
        return and__3822__auto____9551
      }
    }()) {
      return this__9550.start
    }else {
      return not_found
    }
  }
};
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(rng) {
  var this__9552 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__9552.meta)
};
cljs.core.Range;
cljs.core.range = function() {
  var range = null;
  var range__0 = function() {
    return range.call(null, 0, Number.MAX_VALUE, 1)
  };
  var range__1 = function(end) {
    return range.call(null, 0, end, 1)
  };
  var range__2 = function(start, end) {
    return range.call(null, start, end, 1)
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
    var temp__3974__auto____9555 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____9555) {
      var s__9556 = temp__3974__auto____9555;
      return cljs.core.cons.call(null, cljs.core.first.call(null, s__9556), take_nth.call(null, n, cljs.core.drop.call(null, n, s__9556)))
    }else {
      return null
    }
  }, null)
};
cljs.core.split_with = function split_with(pred, coll) {
  return cljs.core.PersistentVector.fromArray([cljs.core.take_while.call(null, pred, coll), cljs.core.drop_while.call(null, pred, coll)], true)
};
cljs.core.partition_by = function partition_by(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____9563 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____9563) {
      var s__9564 = temp__3974__auto____9563;
      var fst__9565 = cljs.core.first.call(null, s__9564);
      var fv__9566 = f.call(null, fst__9565);
      var run__9567 = cljs.core.cons.call(null, fst__9565, cljs.core.take_while.call(null, function(p1__9557_SHARP_) {
        return cljs.core._EQ_.call(null, fv__9566, f.call(null, p1__9557_SHARP_))
      }, cljs.core.next.call(null, s__9564)));
      return cljs.core.cons.call(null, run__9567, partition_by.call(null, f, cljs.core.seq.call(null, cljs.core.drop.call(null, cljs.core.count.call(null, run__9567), s__9564))))
    }else {
      return null
    }
  }, null)
};
cljs.core.frequencies = function frequencies(coll) {
  return cljs.core.persistent_BANG_.call(null, cljs.core.reduce.call(null, function(counts, x) {
    return cljs.core.assoc_BANG_.call(null, counts, x, cljs.core._lookup.call(null, counts, x, 0) + 1)
  }, cljs.core.transient$.call(null, cljs.core.ObjMap.EMPTY), coll))
};
cljs.core.reductions = function() {
  var reductions = null;
  var reductions__2 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3971__auto____9582 = cljs.core.seq.call(null, coll);
      if(temp__3971__auto____9582) {
        var s__9583 = temp__3971__auto____9582;
        return reductions.call(null, f, cljs.core.first.call(null, s__9583), cljs.core.rest.call(null, s__9583))
      }else {
        return cljs.core.list.call(null, f.call(null))
      }
    }, null)
  };
  var reductions__3 = function(f, init, coll) {
    return cljs.core.cons.call(null, init, new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____9584 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____9584) {
        var s__9585 = temp__3974__auto____9584;
        return reductions.call(null, f, f.call(null, init, cljs.core.first.call(null, s__9585)), cljs.core.rest.call(null, s__9585))
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
      var G__9588 = null;
      var G__9588__0 = function() {
        return cljs.core.vector.call(null, f.call(null))
      };
      var G__9588__1 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x))
      };
      var G__9588__2 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y))
      };
      var G__9588__3 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z))
      };
      var G__9588__4 = function() {
        var G__9589__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args))
        };
        var G__9589 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9589__delegate.call(this, x, y, z, args)
        };
        G__9589.cljs$lang$maxFixedArity = 3;
        G__9589.cljs$lang$applyTo = function(arglist__9590) {
          var x = cljs.core.first(arglist__9590);
          var y = cljs.core.first(cljs.core.next(arglist__9590));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9590)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9590)));
          return G__9589__delegate(x, y, z, args)
        };
        G__9589.cljs$lang$arity$variadic = G__9589__delegate;
        return G__9589
      }();
      G__9588 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__9588__0.call(this);
          case 1:
            return G__9588__1.call(this, x);
          case 2:
            return G__9588__2.call(this, x, y);
          case 3:
            return G__9588__3.call(this, x, y, z);
          default:
            return G__9588__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9588.cljs$lang$maxFixedArity = 3;
      G__9588.cljs$lang$applyTo = G__9588__4.cljs$lang$applyTo;
      return G__9588
    }()
  };
  var juxt__2 = function(f, g) {
    return function() {
      var G__9591 = null;
      var G__9591__0 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null))
      };
      var G__9591__1 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x))
      };
      var G__9591__2 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y))
      };
      var G__9591__3 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z))
      };
      var G__9591__4 = function() {
        var G__9592__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__9592 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9592__delegate.call(this, x, y, z, args)
        };
        G__9592.cljs$lang$maxFixedArity = 3;
        G__9592.cljs$lang$applyTo = function(arglist__9593) {
          var x = cljs.core.first(arglist__9593);
          var y = cljs.core.first(cljs.core.next(arglist__9593));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9593)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9593)));
          return G__9592__delegate(x, y, z, args)
        };
        G__9592.cljs$lang$arity$variadic = G__9592__delegate;
        return G__9592
      }();
      G__9591 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__9591__0.call(this);
          case 1:
            return G__9591__1.call(this, x);
          case 2:
            return G__9591__2.call(this, x, y);
          case 3:
            return G__9591__3.call(this, x, y, z);
          default:
            return G__9591__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9591.cljs$lang$maxFixedArity = 3;
      G__9591.cljs$lang$applyTo = G__9591__4.cljs$lang$applyTo;
      return G__9591
    }()
  };
  var juxt__3 = function(f, g, h) {
    return function() {
      var G__9594 = null;
      var G__9594__0 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null), h.call(null))
      };
      var G__9594__1 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x), h.call(null, x))
      };
      var G__9594__2 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y), h.call(null, x, y))
      };
      var G__9594__3 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z), h.call(null, x, y, z))
      };
      var G__9594__4 = function() {
        var G__9595__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args), cljs.core.apply.call(null, h, x, y, z, args))
        };
        var G__9595 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9595__delegate.call(this, x, y, z, args)
        };
        G__9595.cljs$lang$maxFixedArity = 3;
        G__9595.cljs$lang$applyTo = function(arglist__9596) {
          var x = cljs.core.first(arglist__9596);
          var y = cljs.core.first(cljs.core.next(arglist__9596));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9596)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9596)));
          return G__9595__delegate(x, y, z, args)
        };
        G__9595.cljs$lang$arity$variadic = G__9595__delegate;
        return G__9595
      }();
      G__9594 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__9594__0.call(this);
          case 1:
            return G__9594__1.call(this, x);
          case 2:
            return G__9594__2.call(this, x, y);
          case 3:
            return G__9594__3.call(this, x, y, z);
          default:
            return G__9594__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9594.cljs$lang$maxFixedArity = 3;
      G__9594.cljs$lang$applyTo = G__9594__4.cljs$lang$applyTo;
      return G__9594
    }()
  };
  var juxt__4 = function() {
    var G__9597__delegate = function(f, g, h, fs) {
      var fs__9587 = cljs.core.list_STAR_.call(null, f, g, h, fs);
      return function() {
        var G__9598 = null;
        var G__9598__0 = function() {
          return cljs.core.reduce.call(null, function(p1__9568_SHARP_, p2__9569_SHARP_) {
            return cljs.core.conj.call(null, p1__9568_SHARP_, p2__9569_SHARP_.call(null))
          }, cljs.core.PersistentVector.EMPTY, fs__9587)
        };
        var G__9598__1 = function(x) {
          return cljs.core.reduce.call(null, function(p1__9570_SHARP_, p2__9571_SHARP_) {
            return cljs.core.conj.call(null, p1__9570_SHARP_, p2__9571_SHARP_.call(null, x))
          }, cljs.core.PersistentVector.EMPTY, fs__9587)
        };
        var G__9598__2 = function(x, y) {
          return cljs.core.reduce.call(null, function(p1__9572_SHARP_, p2__9573_SHARP_) {
            return cljs.core.conj.call(null, p1__9572_SHARP_, p2__9573_SHARP_.call(null, x, y))
          }, cljs.core.PersistentVector.EMPTY, fs__9587)
        };
        var G__9598__3 = function(x, y, z) {
          return cljs.core.reduce.call(null, function(p1__9574_SHARP_, p2__9575_SHARP_) {
            return cljs.core.conj.call(null, p1__9574_SHARP_, p2__9575_SHARP_.call(null, x, y, z))
          }, cljs.core.PersistentVector.EMPTY, fs__9587)
        };
        var G__9598__4 = function() {
          var G__9599__delegate = function(x, y, z, args) {
            return cljs.core.reduce.call(null, function(p1__9576_SHARP_, p2__9577_SHARP_) {
              return cljs.core.conj.call(null, p1__9576_SHARP_, cljs.core.apply.call(null, p2__9577_SHARP_, x, y, z, args))
            }, cljs.core.PersistentVector.EMPTY, fs__9587)
          };
          var G__9599 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__9599__delegate.call(this, x, y, z, args)
          };
          G__9599.cljs$lang$maxFixedArity = 3;
          G__9599.cljs$lang$applyTo = function(arglist__9600) {
            var x = cljs.core.first(arglist__9600);
            var y = cljs.core.first(cljs.core.next(arglist__9600));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9600)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9600)));
            return G__9599__delegate(x, y, z, args)
          };
          G__9599.cljs$lang$arity$variadic = G__9599__delegate;
          return G__9599
        }();
        G__9598 = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return G__9598__0.call(this);
            case 1:
              return G__9598__1.call(this, x);
            case 2:
              return G__9598__2.call(this, x, y);
            case 3:
              return G__9598__3.call(this, x, y, z);
            default:
              return G__9598__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
          }
          throw"Invalid arity: " + arguments.length;
        };
        G__9598.cljs$lang$maxFixedArity = 3;
        G__9598.cljs$lang$applyTo = G__9598__4.cljs$lang$applyTo;
        return G__9598
      }()
    };
    var G__9597 = function(f, g, h, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__9597__delegate.call(this, f, g, h, fs)
    };
    G__9597.cljs$lang$maxFixedArity = 3;
    G__9597.cljs$lang$applyTo = function(arglist__9601) {
      var f = cljs.core.first(arglist__9601);
      var g = cljs.core.first(cljs.core.next(arglist__9601));
      var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9601)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9601)));
      return G__9597__delegate(f, g, h, fs)
    };
    G__9597.cljs$lang$arity$variadic = G__9597__delegate;
    return G__9597
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
      if(cljs.core.seq.call(null, coll)) {
        var G__9604 = cljs.core.next.call(null, coll);
        coll = G__9604;
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
        var and__3822__auto____9603 = cljs.core.seq.call(null, coll);
        if(and__3822__auto____9603) {
          return n > 0
        }else {
          return and__3822__auto____9603
        }
      }())) {
        var G__9605 = n - 1;
        var G__9606 = cljs.core.next.call(null, coll);
        n = G__9605;
        coll = G__9606;
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
    cljs.core.dorun.call(null, coll);
    return coll
  };
  var doall__2 = function(n, coll) {
    cljs.core.dorun.call(null, n, coll);
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
  var matches__9608 = re.exec(s);
  if(cljs.core._EQ_.call(null, cljs.core.first.call(null, matches__9608), s)) {
    if(cljs.core.count.call(null, matches__9608) === 1) {
      return cljs.core.first.call(null, matches__9608)
    }else {
      return cljs.core.vec.call(null, matches__9608)
    }
  }else {
    return null
  }
};
cljs.core.re_find = function re_find(re, s) {
  var matches__9610 = re.exec(s);
  if(matches__9610 == null) {
    return null
  }else {
    if(cljs.core.count.call(null, matches__9610) === 1) {
      return cljs.core.first.call(null, matches__9610)
    }else {
      return cljs.core.vec.call(null, matches__9610)
    }
  }
};
cljs.core.re_seq = function re_seq(re, s) {
  var match_data__9615 = cljs.core.re_find.call(null, re, s);
  var match_idx__9616 = s.search(re);
  var match_str__9617 = cljs.core.coll_QMARK_.call(null, match_data__9615) ? cljs.core.first.call(null, match_data__9615) : match_data__9615;
  var post_match__9618 = cljs.core.subs.call(null, s, match_idx__9616 + cljs.core.count.call(null, match_str__9617));
  if(cljs.core.truth_(match_data__9615)) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, match_data__9615, re_seq.call(null, re, post_match__9618))
    }, null)
  }else {
    return null
  }
};
cljs.core.re_pattern = function re_pattern(s) {
  var vec__9625__9626 = cljs.core.re_find.call(null, /^(?:\(\?([idmsux]*)\))?(.*)/, s);
  var ___9627 = cljs.core.nth.call(null, vec__9625__9626, 0, null);
  var flags__9628 = cljs.core.nth.call(null, vec__9625__9626, 1, null);
  var pattern__9629 = cljs.core.nth.call(null, vec__9625__9626, 2, null);
  return new RegExp(pattern__9629, flags__9628)
};
cljs.core.pr_sequential = function pr_sequential(print_one, begin, sep, end, opts, coll) {
  return cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([begin], true), cljs.core.flatten1.call(null, cljs.core.interpose.call(null, cljs.core.PersistentVector.fromArray([sep], true), cljs.core.map.call(null, function(p1__9619_SHARP_) {
    return print_one.call(null, p1__9619_SHARP_, opts)
  }, coll))), cljs.core.PersistentVector.fromArray([end], true))
};
cljs.core.string_print = function string_print(x) {
  cljs.core._STAR_print_fn_STAR_.call(null, x);
  return null
};
cljs.core.flush = function flush() {
  return null
};
cljs.core.pr_seq = function pr_seq(obj, opts) {
  if(obj == null) {
    return cljs.core.list.call(null, "nil")
  }else {
    if(void 0 === obj) {
      return cljs.core.list.call(null, "#<undefined>")
    }else {
      if("\ufdd0'else") {
        return cljs.core.concat.call(null, cljs.core.truth_(function() {
          var and__3822__auto____9639 = cljs.core._lookup.call(null, opts, "\ufdd0'meta", null);
          if(cljs.core.truth_(and__3822__auto____9639)) {
            var and__3822__auto____9643 = function() {
              var G__9640__9641 = obj;
              if(G__9640__9641) {
                if(function() {
                  var or__3824__auto____9642 = G__9640__9641.cljs$lang$protocol_mask$partition0$ & 131072;
                  if(or__3824__auto____9642) {
                    return or__3824__auto____9642
                  }else {
                    return G__9640__9641.cljs$core$IMeta$
                  }
                }()) {
                  return true
                }else {
                  if(!G__9640__9641.cljs$lang$protocol_mask$partition0$) {
                    return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, G__9640__9641)
                  }else {
                    return false
                  }
                }
              }else {
                return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, G__9640__9641)
              }
            }();
            if(cljs.core.truth_(and__3822__auto____9643)) {
              return cljs.core.meta.call(null, obj)
            }else {
              return and__3822__auto____9643
            }
          }else {
            return and__3822__auto____9639
          }
        }()) ? cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray(["^"], true), pr_seq.call(null, cljs.core.meta.call(null, obj), opts), cljs.core.PersistentVector.fromArray([" "], true)) : null, function() {
          var and__3822__auto____9644 = !(obj == null);
          if(and__3822__auto____9644) {
            return obj.cljs$lang$type
          }else {
            return and__3822__auto____9644
          }
        }() ? obj.cljs$lang$ctorPrSeq(obj) : function() {
          var G__9645__9646 = obj;
          if(G__9645__9646) {
            if(function() {
              var or__3824__auto____9647 = G__9645__9646.cljs$lang$protocol_mask$partition0$ & 536870912;
              if(or__3824__auto____9647) {
                return or__3824__auto____9647
              }else {
                return G__9645__9646.cljs$core$IPrintable$
              }
            }()) {
              return true
            }else {
              if(!G__9645__9646.cljs$lang$protocol_mask$partition0$) {
                return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, G__9645__9646)
              }else {
                return false
              }
            }
          }else {
            return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, G__9645__9646)
          }
        }() ? cljs.core._pr_seq.call(null, obj, opts) : cljs.core.truth_(cljs.core.regexp_QMARK_.call(null, obj)) ? cljs.core.list.call(null, '#"', obj.source, '"') : "\ufdd0'else" ? cljs.core.list.call(null, "#<", [cljs.core.str(obj)].join(""), ">") : null)
      }else {
        return null
      }
    }
  }
};
cljs.core.pr_sb = function pr_sb(objs, opts) {
  var sb__9667 = new goog.string.StringBuffer;
  var G__9668__9669 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, cljs.core.first.call(null, objs), opts));
  if(G__9668__9669) {
    var string__9670 = cljs.core.first.call(null, G__9668__9669);
    var G__9668__9671 = G__9668__9669;
    while(true) {
      sb__9667.append(string__9670);
      var temp__3974__auto____9672 = cljs.core.next.call(null, G__9668__9671);
      if(temp__3974__auto____9672) {
        var G__9668__9673 = temp__3974__auto____9672;
        var G__9686 = cljs.core.first.call(null, G__9668__9673);
        var G__9687 = G__9668__9673;
        string__9670 = G__9686;
        G__9668__9671 = G__9687;
        continue
      }else {
      }
      break
    }
  }else {
  }
  var G__9674__9675 = cljs.core.seq.call(null, cljs.core.next.call(null, objs));
  if(G__9674__9675) {
    var obj__9676 = cljs.core.first.call(null, G__9674__9675);
    var G__9674__9677 = G__9674__9675;
    while(true) {
      sb__9667.append(" ");
      var G__9678__9679 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__9676, opts));
      if(G__9678__9679) {
        var string__9680 = cljs.core.first.call(null, G__9678__9679);
        var G__9678__9681 = G__9678__9679;
        while(true) {
          sb__9667.append(string__9680);
          var temp__3974__auto____9682 = cljs.core.next.call(null, G__9678__9681);
          if(temp__3974__auto____9682) {
            var G__9678__9683 = temp__3974__auto____9682;
            var G__9688 = cljs.core.first.call(null, G__9678__9683);
            var G__9689 = G__9678__9683;
            string__9680 = G__9688;
            G__9678__9681 = G__9689;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3974__auto____9684 = cljs.core.next.call(null, G__9674__9677);
      if(temp__3974__auto____9684) {
        var G__9674__9685 = temp__3974__auto____9684;
        var G__9690 = cljs.core.first.call(null, G__9674__9685);
        var G__9691 = G__9674__9685;
        obj__9676 = G__9690;
        G__9674__9677 = G__9691;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return sb__9667
};
cljs.core.pr_str_with_opts = function pr_str_with_opts(objs, opts) {
  return[cljs.core.str(cljs.core.pr_sb.call(null, objs, opts))].join("")
};
cljs.core.prn_str_with_opts = function prn_str_with_opts(objs, opts) {
  var sb__9693 = cljs.core.pr_sb.call(null, objs, opts);
  sb__9693.append("\n");
  return[cljs.core.str(sb__9693)].join("")
};
cljs.core.pr_with_opts = function pr_with_opts(objs, opts) {
  var G__9712__9713 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, cljs.core.first.call(null, objs), opts));
  if(G__9712__9713) {
    var string__9714 = cljs.core.first.call(null, G__9712__9713);
    var G__9712__9715 = G__9712__9713;
    while(true) {
      cljs.core.string_print.call(null, string__9714);
      var temp__3974__auto____9716 = cljs.core.next.call(null, G__9712__9715);
      if(temp__3974__auto____9716) {
        var G__9712__9717 = temp__3974__auto____9716;
        var G__9730 = cljs.core.first.call(null, G__9712__9717);
        var G__9731 = G__9712__9717;
        string__9714 = G__9730;
        G__9712__9715 = G__9731;
        continue
      }else {
      }
      break
    }
  }else {
  }
  var G__9718__9719 = cljs.core.seq.call(null, cljs.core.next.call(null, objs));
  if(G__9718__9719) {
    var obj__9720 = cljs.core.first.call(null, G__9718__9719);
    var G__9718__9721 = G__9718__9719;
    while(true) {
      cljs.core.string_print.call(null, " ");
      var G__9722__9723 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__9720, opts));
      if(G__9722__9723) {
        var string__9724 = cljs.core.first.call(null, G__9722__9723);
        var G__9722__9725 = G__9722__9723;
        while(true) {
          cljs.core.string_print.call(null, string__9724);
          var temp__3974__auto____9726 = cljs.core.next.call(null, G__9722__9725);
          if(temp__3974__auto____9726) {
            var G__9722__9727 = temp__3974__auto____9726;
            var G__9732 = cljs.core.first.call(null, G__9722__9727);
            var G__9733 = G__9722__9727;
            string__9724 = G__9732;
            G__9722__9725 = G__9733;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3974__auto____9728 = cljs.core.next.call(null, G__9718__9721);
      if(temp__3974__auto____9728) {
        var G__9718__9729 = temp__3974__auto____9728;
        var G__9734 = cljs.core.first.call(null, G__9718__9729);
        var G__9735 = G__9718__9729;
        obj__9720 = G__9734;
        G__9718__9721 = G__9735;
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
  cljs.core.string_print.call(null, "\n");
  if(cljs.core.truth_(cljs.core._lookup.call(null, opts, "\ufdd0'flush-on-newline", null))) {
    return cljs.core.flush.call(null)
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
    return cljs.core.pr_str_with_opts.call(null, objs, cljs.core.pr_opts.call(null))
  };
  var pr_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return pr_str__delegate.call(this, objs)
  };
  pr_str.cljs$lang$maxFixedArity = 0;
  pr_str.cljs$lang$applyTo = function(arglist__9736) {
    var objs = cljs.core.seq(arglist__9736);
    return pr_str__delegate(objs)
  };
  pr_str.cljs$lang$arity$variadic = pr_str__delegate;
  return pr_str
}();
cljs.core.prn_str = function() {
  var prn_str__delegate = function(objs) {
    return cljs.core.prn_str_with_opts.call(null, objs, cljs.core.pr_opts.call(null))
  };
  var prn_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return prn_str__delegate.call(this, objs)
  };
  prn_str.cljs$lang$maxFixedArity = 0;
  prn_str.cljs$lang$applyTo = function(arglist__9737) {
    var objs = cljs.core.seq(arglist__9737);
    return prn_str__delegate(objs)
  };
  prn_str.cljs$lang$arity$variadic = prn_str__delegate;
  return prn_str
}();
cljs.core.pr = function() {
  var pr__delegate = function(objs) {
    return cljs.core.pr_with_opts.call(null, objs, cljs.core.pr_opts.call(null))
  };
  var pr = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return pr__delegate.call(this, objs)
  };
  pr.cljs$lang$maxFixedArity = 0;
  pr.cljs$lang$applyTo = function(arglist__9738) {
    var objs = cljs.core.seq(arglist__9738);
    return pr__delegate(objs)
  };
  pr.cljs$lang$arity$variadic = pr__delegate;
  return pr
}();
cljs.core.print = function() {
  var cljs_core_print__delegate = function(objs) {
    return cljs.core.pr_with_opts.call(null, objs, cljs.core.assoc.call(null, cljs.core.pr_opts.call(null), "\ufdd0'readably", false))
  };
  var cljs_core_print = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return cljs_core_print__delegate.call(this, objs)
  };
  cljs_core_print.cljs$lang$maxFixedArity = 0;
  cljs_core_print.cljs$lang$applyTo = function(arglist__9739) {
    var objs = cljs.core.seq(arglist__9739);
    return cljs_core_print__delegate(objs)
  };
  cljs_core_print.cljs$lang$arity$variadic = cljs_core_print__delegate;
  return cljs_core_print
}();
cljs.core.print_str = function() {
  var print_str__delegate = function(objs) {
    return cljs.core.pr_str_with_opts.call(null, objs, cljs.core.assoc.call(null, cljs.core.pr_opts.call(null), "\ufdd0'readably", false))
  };
  var print_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return print_str__delegate.call(this, objs)
  };
  print_str.cljs$lang$maxFixedArity = 0;
  print_str.cljs$lang$applyTo = function(arglist__9740) {
    var objs = cljs.core.seq(arglist__9740);
    return print_str__delegate(objs)
  };
  print_str.cljs$lang$arity$variadic = print_str__delegate;
  return print_str
}();
cljs.core.println = function() {
  var println__delegate = function(objs) {
    cljs.core.pr_with_opts.call(null, objs, cljs.core.assoc.call(null, cljs.core.pr_opts.call(null), "\ufdd0'readably", false));
    return cljs.core.newline.call(null, cljs.core.pr_opts.call(null))
  };
  var println = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return println__delegate.call(this, objs)
  };
  println.cljs$lang$maxFixedArity = 0;
  println.cljs$lang$applyTo = function(arglist__9741) {
    var objs = cljs.core.seq(arglist__9741);
    return println__delegate(objs)
  };
  println.cljs$lang$arity$variadic = println__delegate;
  return println
}();
cljs.core.println_str = function() {
  var println_str__delegate = function(objs) {
    return cljs.core.prn_str_with_opts.call(null, objs, cljs.core.assoc.call(null, cljs.core.pr_opts.call(null), "\ufdd0'readably", false))
  };
  var println_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return println_str__delegate.call(this, objs)
  };
  println_str.cljs$lang$maxFixedArity = 0;
  println_str.cljs$lang$applyTo = function(arglist__9742) {
    var objs = cljs.core.seq(arglist__9742);
    return println_str__delegate(objs)
  };
  println_str.cljs$lang$arity$variadic = println_str__delegate;
  return println_str
}();
cljs.core.prn = function() {
  var prn__delegate = function(objs) {
    cljs.core.pr_with_opts.call(null, objs, cljs.core.pr_opts.call(null));
    return cljs.core.newline.call(null, cljs.core.pr_opts.call(null))
  };
  var prn = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return prn__delegate.call(this, objs)
  };
  prn.cljs$lang$maxFixedArity = 0;
  prn.cljs$lang$applyTo = function(arglist__9743) {
    var objs = cljs.core.seq(arglist__9743);
    return prn__delegate(objs)
  };
  prn.cljs$lang$arity$variadic = prn__delegate;
  return prn
}();
cljs.core.printf = function() {
  var printf__delegate = function(fmt, args) {
    return cljs.core.print.call(null, cljs.core.apply.call(null, cljs.core.format, fmt, args))
  };
  var printf = function(fmt, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return printf__delegate.call(this, fmt, args)
  };
  printf.cljs$lang$maxFixedArity = 1;
  printf.cljs$lang$applyTo = function(arglist__9744) {
    var fmt = cljs.core.first(arglist__9744);
    var args = cljs.core.rest(arglist__9744);
    return printf__delegate(fmt, args)
  };
  printf.cljs$lang$arity$variadic = printf__delegate;
  return printf
}();
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__9745 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__9745, "{", ", ", "}", opts, coll)
};
cljs.core.IPrintable["number"] = true;
cljs.core._pr_seq["number"] = function(n, opts) {
  return cljs.core.list.call(null, [cljs.core.str(n)].join(""))
};
cljs.core.IndexedSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.Subvec.prototype.cljs$core$IPrintable$ = true;
cljs.core.Subvec.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.ChunkedCons.prototype.cljs$core$IPrintable$ = true;
cljs.core.ChunkedCons.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentTreeMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__9746 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__9746, "{", ", ", "}", opts, coll)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentArrayMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__9747 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__9747, "{", ", ", "}", opts, coll)
};
cljs.core.PersistentQueue.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "#queue [", " ", "]", opts, cljs.core.seq.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.LazySeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.RSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.RSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentTreeSet.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "#{", " ", "}", opts, coll)
};
cljs.core.IPrintable["boolean"] = true;
cljs.core._pr_seq["boolean"] = function(bool, opts) {
  return cljs.core.list.call(null, [cljs.core.str(bool)].join(""))
};
cljs.core.IPrintable["string"] = true;
cljs.core._pr_seq["string"] = function(obj, opts) {
  if(cljs.core.keyword_QMARK_.call(null, obj)) {
    return cljs.core.list.call(null, [cljs.core.str(":"), cljs.core.str(function() {
      var temp__3974__auto____9748 = cljs.core.namespace.call(null, obj);
      if(cljs.core.truth_(temp__3974__auto____9748)) {
        var nspc__9749 = temp__3974__auto____9748;
        return[cljs.core.str(nspc__9749), cljs.core.str("/")].join("")
      }else {
        return null
      }
    }()), cljs.core.str(cljs.core.name.call(null, obj))].join(""))
  }else {
    if(cljs.core.symbol_QMARK_.call(null, obj)) {
      return cljs.core.list.call(null, [cljs.core.str(function() {
        var temp__3974__auto____9750 = cljs.core.namespace.call(null, obj);
        if(cljs.core.truth_(temp__3974__auto____9750)) {
          var nspc__9751 = temp__3974__auto____9750;
          return[cljs.core.str(nspc__9751), cljs.core.str("/")].join("")
        }else {
          return null
        }
      }()), cljs.core.str(cljs.core.name.call(null, obj))].join(""))
    }else {
      if("\ufdd0'else") {
        return cljs.core.list.call(null, cljs.core.truth_((new cljs.core.Keyword("\ufdd0'readably")).call(null, opts)) ? goog.string.quote(obj) : obj)
      }else {
        return null
      }
    }
  }
};
cljs.core.NodeSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.NodeSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.RedNode.prototype.cljs$core$IPrintable$ = true;
cljs.core.RedNode.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.ChunkedSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentHashMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__9752 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__9752, "{", ", ", "}", opts, coll)
};
cljs.core.Vector.prototype.cljs$core$IPrintable$ = true;
cljs.core.Vector.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.PersistentHashSet.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentHashSet.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "#{", " ", "}", opts, coll)
};
cljs.core.PersistentVector.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.List.prototype.cljs$core$IPrintable$ = true;
cljs.core.List.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.IPrintable["array"] = true;
cljs.core._pr_seq["array"] = function(a, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "#<Array [", ", ", "]>", opts, a)
};
cljs.core.IPrintable["function"] = true;
cljs.core._pr_seq["function"] = function(this$) {
  return cljs.core.list.call(null, "#<", [cljs.core.str(this$)].join(""), ">")
};
cljs.core.EmptyList.prototype.cljs$core$IPrintable$ = true;
cljs.core.EmptyList.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.list.call(null, "()")
};
cljs.core.BlackNode.prototype.cljs$core$IPrintable$ = true;
cljs.core.BlackNode.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
Date.prototype.cljs$core$IPrintable$ = true;
Date.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(d, _) {
  var normalize__9754 = function(n, len) {
    var ns__9753 = [cljs.core.str(n)].join("");
    while(true) {
      if(cljs.core.count.call(null, ns__9753) < len) {
        var G__9756 = [cljs.core.str("0"), cljs.core.str(ns__9753)].join("");
        ns__9753 = G__9756;
        continue
      }else {
        return ns__9753
      }
      break
    }
  };
  return cljs.core.list.call(null, [cljs.core.str('#inst "'), cljs.core.str(d.getUTCFullYear()), cljs.core.str("-"), cljs.core.str(normalize__9754.call(null, d.getUTCMonth() + 1, 2)), cljs.core.str("-"), cljs.core.str(normalize__9754.call(null, d.getUTCDate(), 2)), cljs.core.str("T"), cljs.core.str(normalize__9754.call(null, d.getUTCHours(), 2)), cljs.core.str(":"), cljs.core.str(normalize__9754.call(null, d.getUTCMinutes(), 2)), cljs.core.str(":"), cljs.core.str(normalize__9754.call(null, d.getUTCSeconds(), 
  2)), cljs.core.str("."), cljs.core.str(normalize__9754.call(null, d.getUTCMilliseconds(), 3)), cljs.core.str("-"), cljs.core.str('00:00"')].join(""))
};
cljs.core.Cons.prototype.cljs$core$IPrintable$ = true;
cljs.core.Cons.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.Range.prototype.cljs$core$IPrintable$ = true;
cljs.core.Range.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.ArrayNodeSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.ObjMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.ObjMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__9755 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__9755, "{", ", ", "}", opts, coll)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.PersistentVector.prototype.cljs$core$IComparable$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IComparable$_compare$arity$2 = function(x, y) {
  return cljs.core.compare_indexed.call(null, x, y)
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
  return cljs.core.list.call(null, "cljs.core/Atom")
};
cljs.core.Atom.prototype.cljs$core$IHash$_hash$arity$1 = function(this$) {
  var this__9757 = this;
  return goog.getUid(this$)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches$arity$3 = function(this$, oldval, newval) {
  var this__9758 = this;
  var G__9759__9760 = cljs.core.seq.call(null, this__9758.watches);
  if(G__9759__9760) {
    var G__9762__9764 = cljs.core.first.call(null, G__9759__9760);
    var vec__9763__9765 = G__9762__9764;
    var key__9766 = cljs.core.nth.call(null, vec__9763__9765, 0, null);
    var f__9767 = cljs.core.nth.call(null, vec__9763__9765, 1, null);
    var G__9759__9768 = G__9759__9760;
    var G__9762__9769 = G__9762__9764;
    var G__9759__9770 = G__9759__9768;
    while(true) {
      var vec__9771__9772 = G__9762__9769;
      var key__9773 = cljs.core.nth.call(null, vec__9771__9772, 0, null);
      var f__9774 = cljs.core.nth.call(null, vec__9771__9772, 1, null);
      var G__9759__9775 = G__9759__9770;
      f__9774.call(null, key__9773, this$, oldval, newval);
      var temp__3974__auto____9776 = cljs.core.next.call(null, G__9759__9775);
      if(temp__3974__auto____9776) {
        var G__9759__9777 = temp__3974__auto____9776;
        var G__9784 = cljs.core.first.call(null, G__9759__9777);
        var G__9785 = G__9759__9777;
        G__9762__9769 = G__9784;
        G__9759__9770 = G__9785;
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
  var this__9778 = this;
  return this$.watches = cljs.core.assoc.call(null, this__9778.watches, key, f)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch$arity$2 = function(this$, key) {
  var this__9779 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__9779.watches, key)
};
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(a, opts) {
  var this__9780 = this;
  return cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray(["#<Atom: "], true), cljs.core._pr_seq.call(null, this__9780.state, opts), ">")
};
cljs.core.Atom.prototype.cljs$core$IMeta$_meta$arity$1 = function(_) {
  var this__9781 = this;
  return this__9781.meta
};
cljs.core.Atom.prototype.cljs$core$IDeref$_deref$arity$1 = function(_) {
  var this__9782 = this;
  return this__9782.state
};
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(o, other) {
  var this__9783 = this;
  return o === other
};
cljs.core.Atom;
cljs.core.atom = function() {
  var atom = null;
  var atom__1 = function(x) {
    return new cljs.core.Atom(x, null, null, null)
  };
  var atom__2 = function() {
    var G__9797__delegate = function(x, p__9786) {
      var map__9792__9793 = p__9786;
      var map__9792__9794 = cljs.core.seq_QMARK_.call(null, map__9792__9793) ? cljs.core.apply.call(null, cljs.core.hash_map, map__9792__9793) : map__9792__9793;
      var validator__9795 = cljs.core._lookup.call(null, map__9792__9794, "\ufdd0'validator", null);
      var meta__9796 = cljs.core._lookup.call(null, map__9792__9794, "\ufdd0'meta", null);
      return new cljs.core.Atom(x, meta__9796, validator__9795, null)
    };
    var G__9797 = function(x, var_args) {
      var p__9786 = null;
      if(goog.isDef(var_args)) {
        p__9786 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__9797__delegate.call(this, x, p__9786)
    };
    G__9797.cljs$lang$maxFixedArity = 1;
    G__9797.cljs$lang$applyTo = function(arglist__9798) {
      var x = cljs.core.first(arglist__9798);
      var p__9786 = cljs.core.rest(arglist__9798);
      return G__9797__delegate(x, p__9786)
    };
    G__9797.cljs$lang$arity$variadic = G__9797__delegate;
    return G__9797
  }();
  atom = function(x, var_args) {
    var p__9786 = var_args;
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
  var temp__3974__auto____9802 = a.validator;
  if(cljs.core.truth_(temp__3974__auto____9802)) {
    var validate__9803 = temp__3974__auto____9802;
    if(cljs.core.truth_(validate__9803.call(null, new_value))) {
    }else {
      throw new Error([cljs.core.str("Assert failed: "), cljs.core.str("Validator rejected reference state"), cljs.core.str("\n"), cljs.core.str(cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'validate", "\ufdd1'new-value"), cljs.core.hash_map("\ufdd0'line", 6440))))].join(""));
    }
  }else {
  }
  var old_value__9804 = a.state;
  a.state = new_value;
  cljs.core._notify_watches.call(null, a, old_value__9804, new_value);
  return new_value
};
cljs.core.swap_BANG_ = function() {
  var swap_BANG_ = null;
  var swap_BANG___2 = function(a, f) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state))
  };
  var swap_BANG___3 = function(a, f, x) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x))
  };
  var swap_BANG___4 = function(a, f, x, y) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y))
  };
  var swap_BANG___5 = function(a, f, x, y, z) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y, z))
  };
  var swap_BANG___6 = function() {
    var G__9805__delegate = function(a, f, x, y, z, more) {
      return cljs.core.reset_BANG_.call(null, a, cljs.core.apply.call(null, f, a.state, x, y, z, more))
    };
    var G__9805 = function(a, f, x, y, z, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__9805__delegate.call(this, a, f, x, y, z, more)
    };
    G__9805.cljs$lang$maxFixedArity = 5;
    G__9805.cljs$lang$applyTo = function(arglist__9806) {
      var a = cljs.core.first(arglist__9806);
      var f = cljs.core.first(cljs.core.next(arglist__9806));
      var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9806)));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9806))));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9806)))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9806)))));
      return G__9805__delegate(a, f, x, y, z, more)
    };
    G__9805.cljs$lang$arity$variadic = G__9805__delegate;
    return G__9805
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
  if(cljs.core._EQ_.call(null, a.state, oldval)) {
    cljs.core.reset_BANG_.call(null, a, newval);
    return true
  }else {
    return false
  }
};
cljs.core.deref = function deref(o) {
  return cljs.core._deref.call(null, o)
};
cljs.core.set_validator_BANG_ = function set_validator_BANG_(iref, val) {
  return iref.validator = val
};
cljs.core.get_validator = function get_validator(iref) {
  return iref.validator
};
cljs.core.alter_meta_BANG_ = function() {
  var alter_meta_BANG___delegate = function(iref, f, args) {
    return iref.meta = cljs.core.apply.call(null, f, iref.meta, args)
  };
  var alter_meta_BANG_ = function(iref, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return alter_meta_BANG___delegate.call(this, iref, f, args)
  };
  alter_meta_BANG_.cljs$lang$maxFixedArity = 2;
  alter_meta_BANG_.cljs$lang$applyTo = function(arglist__9807) {
    var iref = cljs.core.first(arglist__9807);
    var f = cljs.core.first(cljs.core.next(arglist__9807));
    var args = cljs.core.rest(cljs.core.next(arglist__9807));
    return alter_meta_BANG___delegate(iref, f, args)
  };
  alter_meta_BANG_.cljs$lang$arity$variadic = alter_meta_BANG___delegate;
  return alter_meta_BANG_
}();
cljs.core.reset_meta_BANG_ = function reset_meta_BANG_(iref, m) {
  return iref.meta = m
};
cljs.core.add_watch = function add_watch(iref, key, f) {
  return cljs.core._add_watch.call(null, iref, key, f)
};
cljs.core.remove_watch = function remove_watch(iref, key) {
  return cljs.core._remove_watch.call(null, iref, key)
};
cljs.core.gensym_counter = null;
cljs.core.gensym = function() {
  var gensym = null;
  var gensym__0 = function() {
    return gensym.call(null, "G__")
  };
  var gensym__1 = function(prefix_string) {
    if(cljs.core.gensym_counter == null) {
      cljs.core.gensym_counter = cljs.core.atom.call(null, 0)
    }else {
    }
    return cljs.core.symbol.call(null, [cljs.core.str(prefix_string), cljs.core.str(cljs.core.swap_BANG_.call(null, cljs.core.gensym_counter, cljs.core.inc))].join(""))
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
  return cljs.core.list.call(null, "cljs.core/Delay")
};
cljs.core.Delay.prototype.cljs$core$IPending$_realized_QMARK_$arity$1 = function(d) {
  var this__9808 = this;
  return(new cljs.core.Keyword("\ufdd0'done")).call(null, cljs.core.deref.call(null, this__9808.state))
};
cljs.core.Delay.prototype.cljs$core$IDeref$_deref$arity$1 = function(_) {
  var this__9809 = this;
  return(new cljs.core.Keyword("\ufdd0'value")).call(null, cljs.core.swap_BANG_.call(null, this__9809.state, function(p__9810) {
    var map__9811__9812 = p__9810;
    var map__9811__9813 = cljs.core.seq_QMARK_.call(null, map__9811__9812) ? cljs.core.apply.call(null, cljs.core.hash_map, map__9811__9812) : map__9811__9812;
    var curr_state__9814 = map__9811__9813;
    var done__9815 = cljs.core._lookup.call(null, map__9811__9813, "\ufdd0'done", null);
    if(cljs.core.truth_(done__9815)) {
      return curr_state__9814
    }else {
      return cljs.core.ObjMap.fromObject(["\ufdd0'done", "\ufdd0'value"], {"\ufdd0'done":true, "\ufdd0'value":this__9809.f.call(null)})
    }
  }))
};
cljs.core.Delay;
cljs.core.delay_QMARK_ = function delay_QMARK_(x) {
  return cljs.core.instance_QMARK_.call(null, cljs.core.Delay, x)
};
cljs.core.force = function force(x) {
  if(cljs.core.delay_QMARK_.call(null, x)) {
    return cljs.core.deref.call(null, x)
  }else {
    return x
  }
};
cljs.core.realized_QMARK_ = function realized_QMARK_(d) {
  return cljs.core._realized_QMARK_.call(null, d)
};
cljs.core.js__GT_clj = function() {
  var js__GT_clj__delegate = function(x, options) {
    var map__9836__9837 = options;
    var map__9836__9838 = cljs.core.seq_QMARK_.call(null, map__9836__9837) ? cljs.core.apply.call(null, cljs.core.hash_map, map__9836__9837) : map__9836__9837;
    var keywordize_keys__9839 = cljs.core._lookup.call(null, map__9836__9838, "\ufdd0'keywordize-keys", null);
    var keyfn__9840 = cljs.core.truth_(keywordize_keys__9839) ? cljs.core.keyword : cljs.core.str;
    var f__9855 = function thisfn(x) {
      if(cljs.core.seq_QMARK_.call(null, x)) {
        return cljs.core.doall.call(null, cljs.core.map.call(null, thisfn, x))
      }else {
        if(cljs.core.coll_QMARK_.call(null, x)) {
          return cljs.core.into.call(null, cljs.core.empty.call(null, x), cljs.core.map.call(null, thisfn, x))
        }else {
          if(cljs.core.truth_(goog.isArray(x))) {
            return cljs.core.vec.call(null, cljs.core.map.call(null, thisfn, x))
          }else {
            if(cljs.core.type.call(null, x) === Object) {
              return cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, function() {
                var iter__2462__auto____9854 = function iter__9848(s__9849) {
                  return new cljs.core.LazySeq(null, false, function() {
                    var s__9849__9852 = s__9849;
                    while(true) {
                      if(cljs.core.seq.call(null, s__9849__9852)) {
                        var k__9853 = cljs.core.first.call(null, s__9849__9852);
                        return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([keyfn__9840.call(null, k__9853), thisfn.call(null, x[k__9853])], true), iter__9848.call(null, cljs.core.rest.call(null, s__9849__9852)))
                      }else {
                        return null
                      }
                      break
                    }
                  }, null)
                };
                return iter__2462__auto____9854.call(null, cljs.core.js_keys.call(null, x))
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
    return f__9855.call(null, x)
  };
  var js__GT_clj = function(x, var_args) {
    var options = null;
    if(goog.isDef(var_args)) {
      options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return js__GT_clj__delegate.call(this, x, options)
  };
  js__GT_clj.cljs$lang$maxFixedArity = 1;
  js__GT_clj.cljs$lang$applyTo = function(arglist__9856) {
    var x = cljs.core.first(arglist__9856);
    var options = cljs.core.rest(arglist__9856);
    return js__GT_clj__delegate(x, options)
  };
  js__GT_clj.cljs$lang$arity$variadic = js__GT_clj__delegate;
  return js__GT_clj
}();
cljs.core.memoize = function memoize(f) {
  var mem__9861 = cljs.core.atom.call(null, cljs.core.ObjMap.EMPTY);
  return function() {
    var G__9865__delegate = function(args) {
      var temp__3971__auto____9862 = cljs.core._lookup.call(null, cljs.core.deref.call(null, mem__9861), args, null);
      if(cljs.core.truth_(temp__3971__auto____9862)) {
        var v__9863 = temp__3971__auto____9862;
        return v__9863
      }else {
        var ret__9864 = cljs.core.apply.call(null, f, args);
        cljs.core.swap_BANG_.call(null, mem__9861, cljs.core.assoc, args, ret__9864);
        return ret__9864
      }
    };
    var G__9865 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__9865__delegate.call(this, args)
    };
    G__9865.cljs$lang$maxFixedArity = 0;
    G__9865.cljs$lang$applyTo = function(arglist__9866) {
      var args = cljs.core.seq(arglist__9866);
      return G__9865__delegate(args)
    };
    G__9865.cljs$lang$arity$variadic = G__9865__delegate;
    return G__9865
  }()
};
cljs.core.trampoline = function() {
  var trampoline = null;
  var trampoline__1 = function(f) {
    while(true) {
      var ret__9868 = f.call(null);
      if(cljs.core.fn_QMARK_.call(null, ret__9868)) {
        var G__9869 = ret__9868;
        f = G__9869;
        continue
      }else {
        return ret__9868
      }
      break
    }
  };
  var trampoline__2 = function() {
    var G__9870__delegate = function(f, args) {
      return trampoline.call(null, function() {
        return cljs.core.apply.call(null, f, args)
      })
    };
    var G__9870 = function(f, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__9870__delegate.call(this, f, args)
    };
    G__9870.cljs$lang$maxFixedArity = 1;
    G__9870.cljs$lang$applyTo = function(arglist__9871) {
      var f = cljs.core.first(arglist__9871);
      var args = cljs.core.rest(arglist__9871);
      return G__9870__delegate(f, args)
    };
    G__9870.cljs$lang$arity$variadic = G__9870__delegate;
    return G__9870
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
    return rand.call(null, 1)
  };
  var rand__1 = function(n) {
    return Math.random.call(null) * n
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
  return Math.floor.call(null, Math.random.call(null) * n)
};
cljs.core.rand_nth = function rand_nth(coll) {
  return cljs.core.nth.call(null, coll, cljs.core.rand_int.call(null, cljs.core.count.call(null, coll)))
};
cljs.core.group_by = function group_by(f, coll) {
  return cljs.core.reduce.call(null, function(ret, x) {
    var k__9873 = f.call(null, x);
    return cljs.core.assoc.call(null, ret, k__9873, cljs.core.conj.call(null, cljs.core._lookup.call(null, ret, k__9873, cljs.core.PersistentVector.EMPTY), x))
  }, cljs.core.ObjMap.EMPTY, coll)
};
cljs.core.make_hierarchy = function make_hierarchy() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'descendants", "\ufdd0'ancestors"], {"\ufdd0'parents":cljs.core.ObjMap.EMPTY, "\ufdd0'descendants":cljs.core.ObjMap.EMPTY, "\ufdd0'ancestors":cljs.core.ObjMap.EMPTY})
};
cljs.core.global_hierarchy = cljs.core.atom.call(null, cljs.core.make_hierarchy.call(null));
cljs.core.isa_QMARK_ = function() {
  var isa_QMARK_ = null;
  var isa_QMARK___2 = function(child, parent) {
    return isa_QMARK_.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), child, parent)
  };
  var isa_QMARK___3 = function(h, child, parent) {
    var or__3824__auto____9882 = cljs.core._EQ_.call(null, child, parent);
    if(or__3824__auto____9882) {
      return or__3824__auto____9882
    }else {
      var or__3824__auto____9883 = cljs.core.contains_QMARK_.call(null, (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h).call(null, child), parent);
      if(or__3824__auto____9883) {
        return or__3824__auto____9883
      }else {
        var and__3822__auto____9884 = cljs.core.vector_QMARK_.call(null, parent);
        if(and__3822__auto____9884) {
          var and__3822__auto____9885 = cljs.core.vector_QMARK_.call(null, child);
          if(and__3822__auto____9885) {
            var and__3822__auto____9886 = cljs.core.count.call(null, parent) === cljs.core.count.call(null, child);
            if(and__3822__auto____9886) {
              var ret__9887 = true;
              var i__9888 = 0;
              while(true) {
                if(function() {
                  var or__3824__auto____9889 = cljs.core.not.call(null, ret__9887);
                  if(or__3824__auto____9889) {
                    return or__3824__auto____9889
                  }else {
                    return i__9888 === cljs.core.count.call(null, parent)
                  }
                }()) {
                  return ret__9887
                }else {
                  var G__9890 = isa_QMARK_.call(null, h, child.call(null, i__9888), parent.call(null, i__9888));
                  var G__9891 = i__9888 + 1;
                  ret__9887 = G__9890;
                  i__9888 = G__9891;
                  continue
                }
                break
              }
            }else {
              return and__3822__auto____9886
            }
          }else {
            return and__3822__auto____9885
          }
        }else {
          return and__3822__auto____9884
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
    return parents.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var parents__2 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core._lookup.call(null, (new cljs.core.Keyword("\ufdd0'parents")).call(null, h), tag, null))
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
    return ancestors.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var ancestors__2 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core._lookup.call(null, (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h), tag, null))
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
    return descendants.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var descendants__2 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core._lookup.call(null, (new cljs.core.Keyword("\ufdd0'descendants")).call(null, h), tag, null))
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
    if(cljs.core.truth_(cljs.core.namespace.call(null, parent))) {
    }else {
      throw new Error([cljs.core.str("Assert failed: "), cljs.core.str(cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'namespace", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 6724))))].join(""));
    }
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, derive, tag, parent);
    return null
  };
  var derive__3 = function(h, tag, parent) {
    if(cljs.core.not_EQ_.call(null, tag, parent)) {
    }else {
      throw new Error([cljs.core.str("Assert failed: "), cljs.core.str(cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'not=", "\ufdd1'tag", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 6728))))].join(""));
    }
    var tp__9900 = (new cljs.core.Keyword("\ufdd0'parents")).call(null, h);
    var td__9901 = (new cljs.core.Keyword("\ufdd0'descendants")).call(null, h);
    var ta__9902 = (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h);
    var tf__9903 = function(m, source, sources, target, targets) {
      return cljs.core.reduce.call(null, function(ret, k) {
        return cljs.core.assoc.call(null, ret, k, cljs.core.reduce.call(null, cljs.core.conj, cljs.core._lookup.call(null, targets, k, cljs.core.PersistentHashSet.EMPTY), cljs.core.cons.call(null, target, targets.call(null, target))))
      }, m, cljs.core.cons.call(null, source, sources.call(null, source)))
    };
    var or__3824__auto____9904 = cljs.core.contains_QMARK_.call(null, tp__9900.call(null, tag), parent) ? null : function() {
      if(cljs.core.contains_QMARK_.call(null, ta__9902.call(null, tag), parent)) {
        throw new Error([cljs.core.str(tag), cljs.core.str("already has"), cljs.core.str(parent), cljs.core.str("as ancestor")].join(""));
      }else {
      }
      if(cljs.core.contains_QMARK_.call(null, ta__9902.call(null, parent), tag)) {
        throw new Error([cljs.core.str("Cyclic derivation:"), cljs.core.str(parent), cljs.core.str("has"), cljs.core.str(tag), cljs.core.str("as ancestor")].join(""));
      }else {
      }
      return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'ancestors", "\ufdd0'descendants"], {"\ufdd0'parents":cljs.core.assoc.call(null, (new cljs.core.Keyword("\ufdd0'parents")).call(null, h), tag, cljs.core.conj.call(null, cljs.core._lookup.call(null, tp__9900, tag, cljs.core.PersistentHashSet.EMPTY), parent)), "\ufdd0'ancestors":tf__9903.call(null, (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h), tag, td__9901, parent, ta__9902), "\ufdd0'descendants":tf__9903.call(null, (new cljs.core.Keyword("\ufdd0'descendants")).call(null, 
      h), parent, ta__9902, tag, td__9901)})
    }();
    if(cljs.core.truth_(or__3824__auto____9904)) {
      return or__3824__auto____9904
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
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, underive, tag, parent);
    return null
  };
  var underive__3 = function(h, tag, parent) {
    var parentMap__9909 = (new cljs.core.Keyword("\ufdd0'parents")).call(null, h);
    var childsParents__9910 = cljs.core.truth_(parentMap__9909.call(null, tag)) ? cljs.core.disj.call(null, parentMap__9909.call(null, tag), parent) : cljs.core.PersistentHashSet.EMPTY;
    var newParents__9911 = cljs.core.truth_(cljs.core.not_empty.call(null, childsParents__9910)) ? cljs.core.assoc.call(null, parentMap__9909, tag, childsParents__9910) : cljs.core.dissoc.call(null, parentMap__9909, tag);
    var deriv_seq__9912 = cljs.core.flatten.call(null, cljs.core.map.call(null, function(p1__9892_SHARP_) {
      return cljs.core.cons.call(null, cljs.core.first.call(null, p1__9892_SHARP_), cljs.core.interpose.call(null, cljs.core.first.call(null, p1__9892_SHARP_), cljs.core.second.call(null, p1__9892_SHARP_)))
    }, cljs.core.seq.call(null, newParents__9911)));
    if(cljs.core.contains_QMARK_.call(null, parentMap__9909.call(null, tag), parent)) {
      return cljs.core.reduce.call(null, function(p1__9893_SHARP_, p2__9894_SHARP_) {
        return cljs.core.apply.call(null, cljs.core.derive, p1__9893_SHARP_, p2__9894_SHARP_)
      }, cljs.core.make_hierarchy.call(null), cljs.core.partition.call(null, 2, deriv_seq__9912))
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
  cljs.core.swap_BANG_.call(null, method_cache, function(_) {
    return cljs.core.deref.call(null, method_table)
  });
  return cljs.core.swap_BANG_.call(null, cached_hierarchy, function(_) {
    return cljs.core.deref.call(null, hierarchy)
  })
};
cljs.core.prefers_STAR_ = function prefers_STAR_(x, y, prefer_table) {
  var xprefs__9920 = cljs.core.deref.call(null, prefer_table).call(null, x);
  var or__3824__auto____9922 = cljs.core.truth_(function() {
    var and__3822__auto____9921 = xprefs__9920;
    if(cljs.core.truth_(and__3822__auto____9921)) {
      return xprefs__9920.call(null, y)
    }else {
      return and__3822__auto____9921
    }
  }()) ? true : null;
  if(cljs.core.truth_(or__3824__auto____9922)) {
    return or__3824__auto____9922
  }else {
    var or__3824__auto____9924 = function() {
      var ps__9923 = cljs.core.parents.call(null, y);
      while(true) {
        if(cljs.core.count.call(null, ps__9923) > 0) {
          if(cljs.core.truth_(prefers_STAR_.call(null, x, cljs.core.first.call(null, ps__9923), prefer_table))) {
          }else {
          }
          var G__9927 = cljs.core.rest.call(null, ps__9923);
          ps__9923 = G__9927;
          continue
        }else {
          return null
        }
        break
      }
    }();
    if(cljs.core.truth_(or__3824__auto____9924)) {
      return or__3824__auto____9924
    }else {
      var or__3824__auto____9926 = function() {
        var ps__9925 = cljs.core.parents.call(null, x);
        while(true) {
          if(cljs.core.count.call(null, ps__9925) > 0) {
            if(cljs.core.truth_(prefers_STAR_.call(null, cljs.core.first.call(null, ps__9925), y, prefer_table))) {
            }else {
            }
            var G__9928 = cljs.core.rest.call(null, ps__9925);
            ps__9925 = G__9928;
            continue
          }else {
            return null
          }
          break
        }
      }();
      if(cljs.core.truth_(or__3824__auto____9926)) {
        return or__3824__auto____9926
      }else {
        return false
      }
    }
  }
};
cljs.core.dominates = function dominates(x, y, prefer_table) {
  var or__3824__auto____9930 = cljs.core.prefers_STAR_.call(null, x, y, prefer_table);
  if(cljs.core.truth_(or__3824__auto____9930)) {
    return or__3824__auto____9930
  }else {
    return cljs.core.isa_QMARK_.call(null, x, y)
  }
};
cljs.core.find_and_cache_best_method = function find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  var best_entry__9948 = cljs.core.reduce.call(null, function(be, p__9940) {
    var vec__9941__9942 = p__9940;
    var k__9943 = cljs.core.nth.call(null, vec__9941__9942, 0, null);
    var ___9944 = cljs.core.nth.call(null, vec__9941__9942, 1, null);
    var e__9945 = vec__9941__9942;
    if(cljs.core.isa_QMARK_.call(null, dispatch_val, k__9943)) {
      var be2__9947 = cljs.core.truth_(function() {
        var or__3824__auto____9946 = be == null;
        if(or__3824__auto____9946) {
          return or__3824__auto____9946
        }else {
          return cljs.core.dominates.call(null, k__9943, cljs.core.first.call(null, be), prefer_table)
        }
      }()) ? e__9945 : be;
      if(cljs.core.truth_(cljs.core.dominates.call(null, cljs.core.first.call(null, be2__9947), k__9943, prefer_table))) {
      }else {
        throw new Error([cljs.core.str("Multiple methods in multimethod '"), cljs.core.str(name), cljs.core.str("' match dispatch value: "), cljs.core.str(dispatch_val), cljs.core.str(" -> "), cljs.core.str(k__9943), cljs.core.str(" and "), cljs.core.str(cljs.core.first.call(null, be2__9947)), cljs.core.str(", and neither is preferred")].join(""));
      }
      return be2__9947
    }else {
      return be
    }
  }, null, cljs.core.deref.call(null, method_table));
  if(cljs.core.truth_(best_entry__9948)) {
    if(cljs.core._EQ_.call(null, cljs.core.deref.call(null, cached_hierarchy), cljs.core.deref.call(null, hierarchy))) {
      cljs.core.swap_BANG_.call(null, method_cache, cljs.core.assoc, dispatch_val, cljs.core.second.call(null, best_entry__9948));
      return cljs.core.second.call(null, best_entry__9948)
    }else {
      cljs.core.reset_cache.call(null, method_cache, method_table, cached_hierarchy, hierarchy);
      return find_and_cache_best_method.call(null, name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy)
    }
  }else {
    return null
  }
};
cljs.core.IMultiFn = {};
cljs.core._reset = function _reset(mf) {
  if(function() {
    var and__3822__auto____9953 = mf;
    if(and__3822__auto____9953) {
      return mf.cljs$core$IMultiFn$_reset$arity$1
    }else {
      return and__3822__auto____9953
    }
  }()) {
    return mf.cljs$core$IMultiFn$_reset$arity$1(mf)
  }else {
    var x__2363__auto____9954 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____9955 = cljs.core._reset[goog.typeOf(x__2363__auto____9954)];
      if(or__3824__auto____9955) {
        return or__3824__auto____9955
      }else {
        var or__3824__auto____9956 = cljs.core._reset["_"];
        if(or__3824__auto____9956) {
          return or__3824__auto____9956
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-reset", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._add_method = function _add_method(mf, dispatch_val, method) {
  if(function() {
    var and__3822__auto____9961 = mf;
    if(and__3822__auto____9961) {
      return mf.cljs$core$IMultiFn$_add_method$arity$3
    }else {
      return and__3822__auto____9961
    }
  }()) {
    return mf.cljs$core$IMultiFn$_add_method$arity$3(mf, dispatch_val, method)
  }else {
    var x__2363__auto____9962 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____9963 = cljs.core._add_method[goog.typeOf(x__2363__auto____9962)];
      if(or__3824__auto____9963) {
        return or__3824__auto____9963
      }else {
        var or__3824__auto____9964 = cljs.core._add_method["_"];
        if(or__3824__auto____9964) {
          return or__3824__auto____9964
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-add-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, method)
  }
};
cljs.core._remove_method = function _remove_method(mf, dispatch_val) {
  if(function() {
    var and__3822__auto____9969 = mf;
    if(and__3822__auto____9969) {
      return mf.cljs$core$IMultiFn$_remove_method$arity$2
    }else {
      return and__3822__auto____9969
    }
  }()) {
    return mf.cljs$core$IMultiFn$_remove_method$arity$2(mf, dispatch_val)
  }else {
    var x__2363__auto____9970 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____9971 = cljs.core._remove_method[goog.typeOf(x__2363__auto____9970)];
      if(or__3824__auto____9971) {
        return or__3824__auto____9971
      }else {
        var or__3824__auto____9972 = cljs.core._remove_method["_"];
        if(or__3824__auto____9972) {
          return or__3824__auto____9972
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-remove-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._prefer_method = function _prefer_method(mf, dispatch_val, dispatch_val_y) {
  if(function() {
    var and__3822__auto____9977 = mf;
    if(and__3822__auto____9977) {
      return mf.cljs$core$IMultiFn$_prefer_method$arity$3
    }else {
      return and__3822__auto____9977
    }
  }()) {
    return mf.cljs$core$IMultiFn$_prefer_method$arity$3(mf, dispatch_val, dispatch_val_y)
  }else {
    var x__2363__auto____9978 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____9979 = cljs.core._prefer_method[goog.typeOf(x__2363__auto____9978)];
      if(or__3824__auto____9979) {
        return or__3824__auto____9979
      }else {
        var or__3824__auto____9980 = cljs.core._prefer_method["_"];
        if(or__3824__auto____9980) {
          return or__3824__auto____9980
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefer-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, dispatch_val_y)
  }
};
cljs.core._get_method = function _get_method(mf, dispatch_val) {
  if(function() {
    var and__3822__auto____9985 = mf;
    if(and__3822__auto____9985) {
      return mf.cljs$core$IMultiFn$_get_method$arity$2
    }else {
      return and__3822__auto____9985
    }
  }()) {
    return mf.cljs$core$IMultiFn$_get_method$arity$2(mf, dispatch_val)
  }else {
    var x__2363__auto____9986 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____9987 = cljs.core._get_method[goog.typeOf(x__2363__auto____9986)];
      if(or__3824__auto____9987) {
        return or__3824__auto____9987
      }else {
        var or__3824__auto____9988 = cljs.core._get_method["_"];
        if(or__3824__auto____9988) {
          return or__3824__auto____9988
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-get-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._methods = function _methods(mf) {
  if(function() {
    var and__3822__auto____9993 = mf;
    if(and__3822__auto____9993) {
      return mf.cljs$core$IMultiFn$_methods$arity$1
    }else {
      return and__3822__auto____9993
    }
  }()) {
    return mf.cljs$core$IMultiFn$_methods$arity$1(mf)
  }else {
    var x__2363__auto____9994 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____9995 = cljs.core._methods[goog.typeOf(x__2363__auto____9994)];
      if(or__3824__auto____9995) {
        return or__3824__auto____9995
      }else {
        var or__3824__auto____9996 = cljs.core._methods["_"];
        if(or__3824__auto____9996) {
          return or__3824__auto____9996
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-methods", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._prefers = function _prefers(mf) {
  if(function() {
    var and__3822__auto____10001 = mf;
    if(and__3822__auto____10001) {
      return mf.cljs$core$IMultiFn$_prefers$arity$1
    }else {
      return and__3822__auto____10001
    }
  }()) {
    return mf.cljs$core$IMultiFn$_prefers$arity$1(mf)
  }else {
    var x__2363__auto____10002 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____10003 = cljs.core._prefers[goog.typeOf(x__2363__auto____10002)];
      if(or__3824__auto____10003) {
        return or__3824__auto____10003
      }else {
        var or__3824__auto____10004 = cljs.core._prefers["_"];
        if(or__3824__auto____10004) {
          return or__3824__auto____10004
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefers", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._dispatch = function _dispatch(mf, args) {
  if(function() {
    var and__3822__auto____10009 = mf;
    if(and__3822__auto____10009) {
      return mf.cljs$core$IMultiFn$_dispatch$arity$2
    }else {
      return and__3822__auto____10009
    }
  }()) {
    return mf.cljs$core$IMultiFn$_dispatch$arity$2(mf, args)
  }else {
    var x__2363__auto____10010 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____10011 = cljs.core._dispatch[goog.typeOf(x__2363__auto____10010)];
      if(or__3824__auto____10011) {
        return or__3824__auto____10011
      }else {
        var or__3824__auto____10012 = cljs.core._dispatch["_"];
        if(or__3824__auto____10012) {
          return or__3824__auto____10012
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-dispatch", mf);
        }
      }
    }().call(null, mf, args)
  }
};
cljs.core.do_dispatch = function do_dispatch(mf, dispatch_fn, args) {
  var dispatch_val__10015 = cljs.core.apply.call(null, dispatch_fn, args);
  var target_fn__10016 = cljs.core._get_method.call(null, mf, dispatch_val__10015);
  if(cljs.core.truth_(target_fn__10016)) {
  }else {
    throw new Error([cljs.core.str("No method in multimethod '"), cljs.core.str(cljs.core.name), cljs.core.str("' for dispatch value: "), cljs.core.str(dispatch_val__10015)].join(""));
  }
  return cljs.core.apply.call(null, target_fn__10016, args)
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
  return cljs.core.list.call(null, "cljs.core/MultiFn")
};
cljs.core.MultiFn.prototype.cljs$core$IHash$_hash$arity$1 = function(this$) {
  var this__10017 = this;
  return goog.getUid(this$)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset$arity$1 = function(mf) {
  var this__10018 = this;
  cljs.core.swap_BANG_.call(null, this__10018.method_table, function(mf) {
    return cljs.core.ObjMap.EMPTY
  });
  cljs.core.swap_BANG_.call(null, this__10018.method_cache, function(mf) {
    return cljs.core.ObjMap.EMPTY
  });
  cljs.core.swap_BANG_.call(null, this__10018.prefer_table, function(mf) {
    return cljs.core.ObjMap.EMPTY
  });
  cljs.core.swap_BANG_.call(null, this__10018.cached_hierarchy, function(mf) {
    return null
  });
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method$arity$3 = function(mf, dispatch_val, method) {
  var this__10019 = this;
  cljs.core.swap_BANG_.call(null, this__10019.method_table, cljs.core.assoc, dispatch_val, method);
  cljs.core.reset_cache.call(null, this__10019.method_cache, this__10019.method_table, this__10019.cached_hierarchy, this__10019.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method$arity$2 = function(mf, dispatch_val) {
  var this__10020 = this;
  cljs.core.swap_BANG_.call(null, this__10020.method_table, cljs.core.dissoc, dispatch_val);
  cljs.core.reset_cache.call(null, this__10020.method_cache, this__10020.method_table, this__10020.cached_hierarchy, this__10020.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method$arity$2 = function(mf, dispatch_val) {
  var this__10021 = this;
  if(cljs.core._EQ_.call(null, cljs.core.deref.call(null, this__10021.cached_hierarchy), cljs.core.deref.call(null, this__10021.hierarchy))) {
  }else {
    cljs.core.reset_cache.call(null, this__10021.method_cache, this__10021.method_table, this__10021.cached_hierarchy, this__10021.hierarchy)
  }
  var temp__3971__auto____10022 = cljs.core.deref.call(null, this__10021.method_cache).call(null, dispatch_val);
  if(cljs.core.truth_(temp__3971__auto____10022)) {
    var target_fn__10023 = temp__3971__auto____10022;
    return target_fn__10023
  }else {
    var temp__3971__auto____10024 = cljs.core.find_and_cache_best_method.call(null, this__10021.name, dispatch_val, this__10021.hierarchy, this__10021.method_table, this__10021.prefer_table, this__10021.method_cache, this__10021.cached_hierarchy);
    if(cljs.core.truth_(temp__3971__auto____10024)) {
      var target_fn__10025 = temp__3971__auto____10024;
      return target_fn__10025
    }else {
      return cljs.core.deref.call(null, this__10021.method_table).call(null, this__10021.default_dispatch_val)
    }
  }
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method$arity$3 = function(mf, dispatch_val_x, dispatch_val_y) {
  var this__10026 = this;
  if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null, dispatch_val_x, dispatch_val_y, this__10026.prefer_table))) {
    throw new Error([cljs.core.str("Preference conflict in multimethod '"), cljs.core.str(this__10026.name), cljs.core.str("': "), cljs.core.str(dispatch_val_y), cljs.core.str(" is already preferred to "), cljs.core.str(dispatch_val_x)].join(""));
  }else {
  }
  cljs.core.swap_BANG_.call(null, this__10026.prefer_table, function(old) {
    return cljs.core.assoc.call(null, old, dispatch_val_x, cljs.core.conj.call(null, cljs.core._lookup.call(null, old, dispatch_val_x, cljs.core.PersistentHashSet.EMPTY), dispatch_val_y))
  });
  return cljs.core.reset_cache.call(null, this__10026.method_cache, this__10026.method_table, this__10026.cached_hierarchy, this__10026.hierarchy)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods$arity$1 = function(mf) {
  var this__10027 = this;
  return cljs.core.deref.call(null, this__10027.method_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers$arity$1 = function(mf) {
  var this__10028 = this;
  return cljs.core.deref.call(null, this__10028.prefer_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch$arity$2 = function(mf, args) {
  var this__10029 = this;
  return cljs.core.do_dispatch.call(null, mf, this__10029.dispatch_fn, args)
};
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = function() {
  var G__10031__delegate = function(_, args) {
    var self__10030 = this;
    return cljs.core._dispatch.call(null, self__10030, args)
  };
  var G__10031 = function(_, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return G__10031__delegate.call(this, _, args)
  };
  G__10031.cljs$lang$maxFixedArity = 1;
  G__10031.cljs$lang$applyTo = function(arglist__10032) {
    var _ = cljs.core.first(arglist__10032);
    var args = cljs.core.rest(arglist__10032);
    return G__10031__delegate(_, args)
  };
  G__10031.cljs$lang$arity$variadic = G__10031__delegate;
  return G__10031
}();
cljs.core.MultiFn.prototype.apply = function(_, args) {
  var self__10033 = this;
  return cljs.core._dispatch.call(null, self__10033, args)
};
cljs.core.remove_all_methods = function remove_all_methods(multifn) {
  return cljs.core._reset.call(null, multifn)
};
cljs.core.remove_method = function remove_method(multifn, dispatch_val) {
  return cljs.core._remove_method.call(null, multifn, dispatch_val)
};
cljs.core.prefer_method = function prefer_method(multifn, dispatch_val_x, dispatch_val_y) {
  return cljs.core._prefer_method.call(null, multifn, dispatch_val_x, dispatch_val_y)
};
cljs.core.methods$ = function methods$(multifn) {
  return cljs.core._methods.call(null, multifn)
};
cljs.core.get_method = function get_method(multifn, dispatch_val) {
  return cljs.core._get_method.call(null, multifn, dispatch_val)
};
cljs.core.prefers = function prefers(multifn) {
  return cljs.core._prefers.call(null, multifn)
};
cljs.core.UUID = function(uuid) {
  this.uuid = uuid;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 543162368
};
cljs.core.UUID.cljs$lang$type = true;
cljs.core.UUID.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/UUID")
};
cljs.core.UUID.prototype.cljs$core$IHash$_hash$arity$1 = function(this$) {
  var this__10034 = this;
  return goog.string.hashCode(cljs.core.pr_str.call(null, this$))
};
cljs.core.UUID.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(_10036, _) {
  var this__10035 = this;
  return cljs.core.list.call(null, [cljs.core.str('#uuid "'), cljs.core.str(this__10035.uuid), cljs.core.str('"')].join(""))
};
cljs.core.UUID.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(_, other) {
  var this__10037 = this;
  var and__3822__auto____10038 = cljs.core.instance_QMARK_.call(null, cljs.core.UUID, other);
  if(and__3822__auto____10038) {
    return this__10037.uuid === other.uuid
  }else {
    return and__3822__auto____10038
  }
};
cljs.core.UUID.prototype.toString = function() {
  var this__10039 = this;
  var this__10040 = this;
  return cljs.core.pr_str.call(null, this__10040)
};
cljs.core.UUID;
goog.provide("dixon.ui");
goog.require("cljs.core");
dixon.ui.uistate = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'play-state", "\ufdd0'zoom-state"], {"\ufdd0'play-state":"\ufdd0'step-awaiting", "\ufdd0'zoom-state":0}));
dixon.ui.step_button = function step_button() {
  return cljs.core.swap_BANG_.call(null, dixon.ui.uistate, cljs.core.assoc, "\ufdd0'play-state", "\ufdd0'step-awaiting")
};
goog.exportSymbol("dixon.ui.step_button", dixon.ui.step_button);
dixon.ui.play_button = function play_button() {
  return cljs.core.swap_BANG_.call(null, dixon.ui.uistate, cljs.core.assoc, "\ufdd0'play-state", "\ufdd0'play")
};
goog.exportSymbol("dixon.ui.play_button", dixon.ui.play_button);
dixon.ui.pause_button = function pause_button() {
  return cljs.core.swap_BANG_.call(null, dixon.ui.uistate, cljs.core.assoc, "\ufdd0'play-state", "\ufdd0'pause")
};
goog.exportSymbol("dixon.ui.pause_button", dixon.ui.pause_button);
dixon.ui.stop_button = function stop_button() {
  return cljs.core.swap_BANG_.call(null, dixon.ui.uistate, cljs.core.assoc, "\ufdd0'play-state", "\ufdd0'stop-awaiting")
};
goog.exportSymbol("dixon.ui.stop_button", dixon.ui.stop_button);
dixon.ui.zoom_in_button = function zoom_in_button() {
  return cljs.core.swap_BANG_.call(null, dixon.ui.uistate, cljs.core.update_in, cljs.core.PersistentVector.fromArray(["\ufdd0'zoom-state"], true), cljs.core.inc)
};
goog.exportSymbol("dixon.ui.zoom_in_button", dixon.ui.zoom_in_button);
dixon.ui.zoom_out_button = function zoom_out_button() {
  return cljs.core.swap_BANG_.call(null, dixon.ui.uistate, cljs.core.update_in, cljs.core.PersistentVector.fromArray(["\ufdd0'zoom-state"], true), cljs.core.dec)
};
goog.exportSymbol("dixon.ui.zoom_out_button", dixon.ui.zoom_out_button);
var array_p, explode_p, key_prefix, map_p, namespace_tag, number_p, p, re_svg_tags, re_tag, re_whitespace, string_p, unify_p, whitespace_node_p, xmlns, __hasProp = {}.hasOwnProperty;
goog.require("goog.string");
goog.provide("singult.coffee");
goog.provide("singult.coffee.Unify");
p = function(x) {
  console.log(x);
  return x
};
re_tag = /([^\s\.#]+)(?:#([^\s\.#]+))?(?:\.([^\s#]+))?/;
re_svg_tags = /(svg|g|rect|circle|clipPath|path|line|polygon|polyline|text|textPath)/;
re_whitespace = /^\s+$/;
key_prefix = "\x00";
xmlns = {xhtml:"http://www.w3.org/1999/xhtml", svg:"http://www.w3.org/2000/svg"};
namespace_tag = function(tag_str) {
  var nsp, tag, _ref;
  _ref = tag_str.split(":"), nsp = _ref[0], tag = _ref[1];
  if(tag != null) {
    return[xmlns[nsp] || nsp, tag]
  }else {
    if(tag_str.match(re_svg_tags)) {
      return[xmlns.svg, tag_str]
    }else {
      return[xmlns.xhtml, tag_str]
    }
  }
};
explode_p = function(v) {
  return v[0] === ":*:"
};
unify_p = function(x) {
  return x != null && x instanceof singult.coffee.Unify
};
array_p = function(x) {
  return x != null && x.forEach != null
};
map_p = function(x) {
  return x != null && !array_p(x) && !unify_p(x) && x instanceof Object
};
string_p = function(x) {
  return x != null && x.substring != null
};
number_p = function(x) {
  return x != null && x.toFixed != null
};
whitespace_node_p = function($n) {
  return $n.nodeType === 8 || $n.nodeType === 3 && $n.textContent.match(re_whitespace)
};
singult.coffee.style = function($e, m) {
  var k, v, _results;
  _results = [];
  for(k in m) {
    if(!__hasProp.call(m, k)) {
      continue
    }
    v = m[k];
    _results.push($e.style[goog.string.toCamelCase(k)] = v)
  }
  return _results
};
singult.coffee.properties = function($e, m) {
  var prop, v, _results;
  _results = [];
  for(prop in m) {
    if(!__hasProp.call(m, prop)) {
      continue
    }
    v = m[prop];
    _results.push($e[prop] = v)
  }
  return _results
};
singult.coffee.attr = function($e, attr_map) {
  var k, v, _results;
  if(attr_map["style"] != null) {
    singult.coffee.style($e, attr_map["style"]);
    delete attr_map["style"]
  }
  if(attr_map["properties"] != null) {
    singult.coffee.properties($e, attr_map["properties"]);
    delete attr_map["properties"]
  }
  _results = [];
  for(k in attr_map) {
    if(!__hasProp.call(attr_map, k)) {
      continue
    }
    v = attr_map[k];
    if(v != null) {
      _results.push($e.setAttribute(k, v))
    }else {
      _results.push($e.removeAttribute(k))
    }
  }
  return _results
};
singult.coffee.node_data = function($e, d) {
  if(d != null) {
    return $e["__singult_data__"] = d
  }else {
    return $e["__singult_data__"]
  }
};
singult.coffee.canonicalize = function(x) {
  if(number_p(x)) {
    return x.toString()
  }else {
    if(array_p(x)) {
      return singult.coffee.canonicalize_hiccup(x)
    }else {
      return x
    }
  }
};
singult.coffee.canonicalize_hiccup = function(v) {
  var attr, canonical, canonical_children, children, cls_str, id, nsp, tag, tag_str, _, _ref, _ref1, _ref2;
  tag = v[0];
  _ref = map_p(v[1]) ? [v[1], v.slice(2)] : [{}, v.slice(1)], attr = _ref[0], children = _ref[1];
  _ref1 = tag.match(re_tag), _ = _ref1[0], tag_str = _ref1[1], id = _ref1[2], cls_str = _ref1[3];
  if(id != null) {
    attr["id"] = id
  }
  if(cls_str != null) {
    attr["class"] = cls_str.replace(".", " ") + (attr["class"] != null ? " " + attr["class"] : "")
  }
  _ref2 = namespace_tag(tag_str), nsp = _ref2[0], tag = _ref2[1];
  canonical_children = [];
  children.forEach(function(v) {
    if(v != null) {
      if(explode_p(v)) {
        return v.slice(1).forEach(function(v) {
          return canonical_children.push(singult.coffee.canonicalize(v))
        })
      }else {
        return canonical_children.push(singult.coffee.canonicalize(v))
      }
    }
  });
  canonical = {nsp:nsp, tag:tag, attr:attr, children:canonical_children};
  return canonical
};
singult.coffee.render = function(m) {
  var $e, c;
  if(string_p(m)) {
    return document.createTextNode(m)
  }else {
    $e = document.createElementNS(m.nsp, m.tag);
    singult.coffee.attr($e, m.attr);
    if(unify_p(c = m.children[0])) {
      if(c.enter != null) {
        c.data.forEach(function(d) {
          var $el;
          $el = c.enter(d);
          singult.coffee.node_data($el, d);
          return $e.appendChild($el)
        })
      }else {
        c.data.forEach(function(d) {
          var $el;
          $el = singult.coffee.render(singult.coffee.canonicalize(c.mapping(d)));
          singult.coffee.node_data($el, d);
          return $e.appendChild($el)
        })
      }
    }else {
      m.children.forEach(function($c) {
        return $e.appendChild(singult.coffee.render($c))
      })
    }
    return $e
  }
};
singult.coffee.Unify = function(data, mapping, key_fn, enter, update, exit, force_update_p) {
  this.data = data;
  this.mapping = mapping;
  this.key_fn = key_fn;
  this.enter = enter;
  this.update = update;
  this.exit = exit;
  this.force_update_p = force_update_p;
  return this
};
singult.coffee.unify_ = function($container, u) {
  var $n, $nodes, enter, exit, i, key, key_fn, nodes_by_key, update, _;
  enter = u.enter || function(d) {
    var $el;
    $el = singult.coffee.render(singult.coffee.canonicalize(u.mapping(d)));
    $container.appendChild($el);
    return $el
  };
  update = u.update || function($n, d) {
    return singult.coffee.merge($n, singult.coffee.canonicalize(u.mapping(d)))
  };
  exit = u.exit || function($n) {
    return $container.removeChild($n)
  };
  key_fn = u.key_fn || function(d, idx) {
    return idx
  };
  $nodes = $container.childNodes;
  nodes_by_key = {};
  i = 0;
  while(i < $nodes.length) {
    key = key_prefix + key_fn(singult.coffee.node_data($nodes[i]), i);
    nodes_by_key[key] = $nodes[i];
    i += 1
  }
  u.data.forEach(function(d, i) {
    var $el, $n, identical_data_p, old_data;
    key = key_prefix + key_fn(d, i);
    if($n = nodes_by_key[key]) {
      if(u.force_update_p) {
        $el = update($n, d);
        singult.coffee.node_data($el, d)
      }else {
        old_data = singult.coffee.node_data($n);
        identical_data_p = old_data.cljs$core$IEquiv$_equiv$arity$2 != null ? old_data.cljs$core$IEquiv$_equiv$arity$2(old_data, d) : old_data === d;
        if(!identical_data_p) {
          $el = update($n, d);
          singult.coffee.node_data($el, d)
        }
      }
      return delete nodes_by_key[key]
    }else {
      $el = enter(d);
      return singult.coffee.node_data($el, d)
    }
  });
  for(_ in nodes_by_key) {
    $n = nodes_by_key[_];
    exit($n)
  }
  return null
};
singult.coffee.merge = function($e, m) {
  var $c, c, i, _i, _ref;
  if(unify_p(m)) {
    singult.coffee.unify_($e, m)
  }else {
    if($e.nodeName.toLowerCase() !== m.tag.toLowerCase()) {
      p($e);
      p(m);
      throw"Cannot merge $e into node of different type";
    }
    singult.coffee.attr($e, m.attr);
    if($e.hasChildNodes()) {
      for(i = _i = _ref = $e.childNodes.length - 1;_ref <= 0 ? _i <= 0 : _i >= 0;i = _ref <= 0 ? ++_i : --_i) {
        $c = $e.childNodes[i];
        if(whitespace_node_p($c)) {
          $e.removeChild($c)
        }
      }
    }
    if(unify_p(m.children[0])) {
      singult.coffee.merge($e, m.children[0])
    }else {
      if($e.childNodes.length > m.children.length) {
        throw"Removing DOM nodes in singult.core#merge! not yet implemented = (";
      }
      i = 0;
      while(i < m.children.length) {
        c = m.children[i] || "";
        $c = $e.childNodes[i];
        if(string_p(c)) {
          if($c != null) {
            $c.textContent = c
          }else {
            $e.appendChild(document.createTextNode(c))
          }
        }else {
          if(map_p(c)) {
            if($c != null) {
              singult.coffee.merge($c, c)
            }else {
              $e.appendChild(singult.coffee.render(c))
            }
          }else {
            p($c);
            p(c);
            throw"Cannot merge children";
          }
        }
        i += 1
      }
    }
  }
  return $e
};
goog.provide("reflex.core");
goog.require("cljs.core");
reflex.core._BANG_recently_derefed = cljs.core.atom.call(null, cljs.core.PersistentHashSet.EMPTY, "\ufdd0'meta", cljs.core.ObjMap.fromObject(["\ufdd0'no-deref-monitor"], {"\ufdd0'no-deref-monitor":true}));
reflex.core.notify_deref_watcher_BANG_ = function notify_deref_watcher_BANG_(derefable) {
  if(cljs.core.truth_((new cljs.core.Keyword("\ufdd0'no-deref-monitor")).call(null, cljs.core.meta.call(null, derefable)))) {
    return null
  }else {
    return cljs.core.swap_BANG_.call(null, reflex.core._BANG_recently_derefed, function(p1__8621_SHARP_) {
      return cljs.core.conj.call(null, p1__8621_SHARP_, derefable)
    })
  }
};
reflex.core.reset_deref_watcher_BANG_ = function reset_deref_watcher_BANG_() {
  return cljs.core.reset_BANG_.call(null, reflex.core._BANG_recently_derefed, cljs.core.PersistentHashSet.EMPTY)
};
reflex.core.recently_derefed = function recently_derefed() {
  return cljs.core.deref.call(null, reflex.core._BANG_recently_derefed)
};
cljs.core.Atom.prototype.cljs$core$IDeref$ = true;
cljs.core.Atom.prototype.cljs$core$IDeref$_deref$arity$1 = function(this$) {
  reflex.core.notify_deref_watcher_BANG_.call(null, this$);
  return this$.state
};
reflex.core.IDisposable = {};
reflex.core.dispose_BANG_ = function dispose_BANG_(this$) {
  if(function() {
    var and__3822__auto____8626 = this$;
    if(and__3822__auto____8626) {
      return this$.reflex$core$IDisposable$dispose_BANG_$arity$1
    }else {
      return and__3822__auto____8626
    }
  }()) {
    return this$.reflex$core$IDisposable$dispose_BANG_$arity$1(this$)
  }else {
    var x__2363__auto____8627 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____8628 = reflex.core.dispose_BANG_[goog.typeOf(x__2363__auto____8627)];
      if(or__3824__auto____8628) {
        return or__3824__auto____8628
      }else {
        var or__3824__auto____8629 = reflex.core.dispose_BANG_["_"];
        if(or__3824__auto____8629) {
          return or__3824__auto____8629
        }else {
          throw cljs.core.missing_protocol.call(null, "IDisposable.dispose!", this$);
        }
      }
    }().call(null, this$)
  }
};
reflex.core.ComputedObservable = function(state, dirty_QMARK_, f, key, parent_watchables, watches, __meta, __extmap) {
  this.state = state;
  this.dirty_QMARK_ = dirty_QMARK_;
  this.f = f;
  this.key = key;
  this.parent_watchables = parent_watchables;
  this.watches = watches;
  this.__meta = __meta;
  this.__extmap = __extmap;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 2766571274;
  if(arguments.length > 6) {
    this.__meta = __meta;
    this.__extmap = __extmap
  }else {
    this.__meta = null;
    this.__extmap = null
  }
};
reflex.core.ComputedObservable.prototype.cljs$core$IHash$_hash$arity$1 = function(this__2318__auto__) {
  var this__8633 = this;
  var h__2192__auto____8634 = this__8633.__hash;
  if(!(h__2192__auto____8634 == null)) {
    return h__2192__auto____8634
  }else {
    var h__2192__auto____8635 = cljs.core.hash_imap.call(null, this__2318__auto__);
    this__8633.__hash = h__2192__auto____8635;
    return h__2192__auto____8635
  }
};
reflex.core.ComputedObservable.prototype.cljs$core$ILookup$_lookup$arity$2 = function(this__2323__auto__, k__2324__auto__) {
  var this__8636 = this;
  return this__2323__auto__.cljs$core$ILookup$_lookup$arity$3(this__2323__auto__, k__2324__auto__, null)
};
reflex.core.ComputedObservable.prototype.cljs$core$ILookup$_lookup$arity$3 = function(this__2325__auto__, k8631, else__2326__auto__) {
  var this__8637 = this;
  if(k8631 === "\ufdd0'state") {
    return this__8637.state
  }else {
    if(k8631 === "\ufdd0'dirty?") {
      return this__8637.dirty_QMARK_
    }else {
      if(k8631 === "\ufdd0'f") {
        return this__8637.f
      }else {
        if(k8631 === "\ufdd0'key") {
          return this__8637.key
        }else {
          if(k8631 === "\ufdd0'parent-watchables") {
            return this__8637.parent_watchables
          }else {
            if(k8631 === "\ufdd0'watches") {
              return this__8637.watches
            }else {
              if("\ufdd0'else") {
                return cljs.core._lookup.call(null, this__8637.__extmap, k8631, else__2326__auto__)
              }else {
                return null
              }
            }
          }
        }
      }
    }
  }
};
reflex.core.ComputedObservable.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(this__2330__auto__, k__2331__auto__, G__8630) {
  var this__8638 = this;
  var pred__8639__8642 = cljs.core.identical_QMARK_;
  var expr__8640__8643 = k__2331__auto__;
  if(pred__8639__8642.call(null, "\ufdd0'state", expr__8640__8643)) {
    return new reflex.core.ComputedObservable(G__8630, this__8638.dirty_QMARK_, this__8638.f, this__8638.key, this__8638.parent_watchables, this__8638.watches, this__8638.__meta, this__8638.__extmap, null)
  }else {
    if(pred__8639__8642.call(null, "\ufdd0'dirty?", expr__8640__8643)) {
      return new reflex.core.ComputedObservable(this__8638.state, G__8630, this__8638.f, this__8638.key, this__8638.parent_watchables, this__8638.watches, this__8638.__meta, this__8638.__extmap, null)
    }else {
      if(pred__8639__8642.call(null, "\ufdd0'f", expr__8640__8643)) {
        return new reflex.core.ComputedObservable(this__8638.state, this__8638.dirty_QMARK_, G__8630, this__8638.key, this__8638.parent_watchables, this__8638.watches, this__8638.__meta, this__8638.__extmap, null)
      }else {
        if(pred__8639__8642.call(null, "\ufdd0'key", expr__8640__8643)) {
          return new reflex.core.ComputedObservable(this__8638.state, this__8638.dirty_QMARK_, this__8638.f, G__8630, this__8638.parent_watchables, this__8638.watches, this__8638.__meta, this__8638.__extmap, null)
        }else {
          if(pred__8639__8642.call(null, "\ufdd0'parent-watchables", expr__8640__8643)) {
            return new reflex.core.ComputedObservable(this__8638.state, this__8638.dirty_QMARK_, this__8638.f, this__8638.key, G__8630, this__8638.watches, this__8638.__meta, this__8638.__extmap, null)
          }else {
            if(pred__8639__8642.call(null, "\ufdd0'watches", expr__8640__8643)) {
              return new reflex.core.ComputedObservable(this__8638.state, this__8638.dirty_QMARK_, this__8638.f, this__8638.key, this__8638.parent_watchables, G__8630, this__8638.__meta, this__8638.__extmap, null)
            }else {
              return new reflex.core.ComputedObservable(this__8638.state, this__8638.dirty_QMARK_, this__8638.f, this__8638.key, this__8638.parent_watchables, this__8638.watches, this__8638.__meta, cljs.core.assoc.call(null, this__8638.__extmap, k__2331__auto__, G__8630), null)
            }
          }
        }
      }
    }
  }
};
reflex.core.ComputedObservable.prototype.cljs$core$IDeref$_deref$arity$1 = function(this$) {
  var this__8644 = this;
  reflex.core.notify_deref_watcher_BANG_.call(null, this$);
  if(cljs.core.not.call(null, this__8644.dirty_QMARK_)) {
    return this$.state
  }else {
    var map__8645__8647 = function() {
      reflex.core.reset_deref_watcher_BANG_.call(null);
      var res__6248__auto____8646 = this__8644.f.call(null);
      return cljs.core.ObjMap.fromObject(["\ufdd0'derefed", "\ufdd0'res"], {"\ufdd0'derefed":reflex.core.recently_derefed.call(null), "\ufdd0'res":res__6248__auto____8646})
    }();
    var map__8645__8648 = cljs.core.seq_QMARK_.call(null, map__8645__8647) ? cljs.core.apply.call(null, cljs.core.hash_map, map__8645__8647) : map__8645__8647;
    var derefed__8649 = cljs.core._lookup.call(null, map__8645__8648, "\ufdd0'derefed", null);
    var res__8650 = cljs.core._lookup.call(null, map__8645__8648, "\ufdd0'res", null);
    var G__8651__8652 = cljs.core.seq.call(null, this__8644.parent_watchables);
    if(G__8651__8652) {
      var w__8653 = cljs.core.first.call(null, G__8651__8652);
      var G__8651__8654 = G__8651__8652;
      while(true) {
        cljs.core.remove_watch.call(null, w__8653, this__8644.key);
        var temp__3974__auto____8655 = cljs.core.next.call(null, G__8651__8654);
        if(temp__3974__auto____8655) {
          var G__8651__8656 = temp__3974__auto____8655;
          var G__8704 = cljs.core.first.call(null, G__8651__8656);
          var G__8705 = G__8651__8656;
          w__8653 = G__8704;
          G__8651__8654 = G__8705;
          continue
        }else {
        }
        break
      }
    }else {
    }
    this$.parent_watchables = derefed__8649;
    var G__8657__8658 = cljs.core.seq.call(null, derefed__8649);
    if(G__8657__8658) {
      var w__8659 = cljs.core.first.call(null, G__8657__8658);
      var G__8657__8660 = G__8657__8658;
      while(true) {
        cljs.core.add_watch.call(null, w__8659, this__8644.key, function(w__8659, G__8657__8660) {
          return function() {
            this$.dirty_QMARK_ = true;
            return cljs.core._notify_watches.call(null, this$, null, null)
          }
        }(w__8659, G__8657__8660));
        var temp__3974__auto____8661 = cljs.core.next.call(null, G__8657__8660);
        if(temp__3974__auto____8661) {
          var G__8657__8662 = temp__3974__auto____8661;
          var G__8706 = cljs.core.first.call(null, G__8657__8662);
          var G__8707 = G__8657__8662;
          w__8659 = G__8706;
          G__8657__8660 = G__8707;
          continue
        }else {
        }
        break
      }
    }else {
    }
    this$.state = res__8650;
    this$.dirty_QMARK_ = false;
    return res__8650
  }
};
reflex.core.ComputedObservable.prototype.cljs$core$ICollection$_conj$arity$2 = function(this__2328__auto__, entry__2329__auto__) {
  var this__8663 = this;
  if(cljs.core.vector_QMARK_.call(null, entry__2329__auto__)) {
    return this__2328__auto__.cljs$core$IAssociative$_assoc$arity$3(this__2328__auto__, cljs.core._nth.call(null, entry__2329__auto__, 0), cljs.core._nth.call(null, entry__2329__auto__, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, this__2328__auto__, entry__2329__auto__)
  }
};
reflex.core.ComputedObservable.prototype.cljs$core$IWatchable$_notify_watches$arity$3 = function(this$, _8665, _) {
  var this__8664 = this;
  var G__8666__8667 = cljs.core.seq.call(null, this__8664.watches);
  if(G__8666__8667) {
    var G__8669__8671 = cljs.core.first.call(null, G__8666__8667);
    var vec__8670__8672 = G__8669__8671;
    var key__8673 = cljs.core.nth.call(null, vec__8670__8672, 0, null);
    var wf__8674 = cljs.core.nth.call(null, vec__8670__8672, 1, null);
    var G__8666__8675 = G__8666__8667;
    var G__8669__8676 = G__8669__8671;
    var G__8666__8677 = G__8666__8675;
    while(true) {
      var vec__8678__8679 = G__8669__8676;
      var key__8680 = cljs.core.nth.call(null, vec__8678__8679, 0, null);
      var wf__8681 = cljs.core.nth.call(null, vec__8678__8679, 1, null);
      var G__8666__8682 = G__8666__8677;
      wf__8681.call(null);
      var temp__3974__auto____8683 = cljs.core.next.call(null, G__8666__8682);
      if(temp__3974__auto____8683) {
        var G__8666__8684 = temp__3974__auto____8683;
        var G__8708 = cljs.core.first.call(null, G__8666__8684);
        var G__8709 = G__8666__8684;
        G__8669__8676 = G__8708;
        G__8666__8677 = G__8709;
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
reflex.core.ComputedObservable.prototype.cljs$core$IWatchable$_add_watch$arity$3 = function(this$, key, wf) {
  var this__8685 = this;
  return this$.watches = cljs.core.assoc.call(null, this__8685.watches, key, wf)
};
reflex.core.ComputedObservable.prototype.cljs$core$IWatchable$_remove_watch$arity$2 = function(this$, key) {
  var this__8686 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__8686.watches, key)
};
reflex.core.ComputedObservable.prototype.reflex$core$IDisposable$ = true;
reflex.core.ComputedObservable.prototype.reflex$core$IDisposable$dispose_BANG_$arity$1 = function(this$) {
  var this__8687 = this;
  var G__8688__8689 = cljs.core.seq.call(null, this__8687.parent_watchables);
  if(G__8688__8689) {
    var w__8690 = cljs.core.first.call(null, G__8688__8689);
    var G__8688__8691 = G__8688__8689;
    while(true) {
      cljs.core.remove_watch.call(null, w__8690, this__8687.key);
      var temp__3974__auto____8692 = cljs.core.next.call(null, G__8688__8691);
      if(temp__3974__auto____8692) {
        var G__8688__8693 = temp__3974__auto____8692;
        var G__8710 = cljs.core.first.call(null, G__8688__8693);
        var G__8711 = G__8688__8693;
        w__8690 = G__8710;
        G__8688__8691 = G__8711;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return this$.watches = null
};
reflex.core.ComputedObservable.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this__2335__auto__) {
  var this__8694 = this;
  return cljs.core.seq.call(null, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'state", this__8694.state), cljs.core.vector.call(null, "\ufdd0'dirty?", this__8694.dirty_QMARK_), cljs.core.vector.call(null, "\ufdd0'f", this__8694.f), cljs.core.vector.call(null, "\ufdd0'key", this__8694.key), cljs.core.vector.call(null, "\ufdd0'parent-watchables", this__8694.parent_watchables), cljs.core.vector.call(null, "\ufdd0'watches", this__8694.watches)], 
  true), this__8694.__extmap))
};
reflex.core.ComputedObservable.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(this__2337__auto__, opts__2338__auto__) {
  var this__8695 = this;
  var pr_pair__2339__auto____8696 = function(keyval__2340__auto__) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts__2338__auto__, keyval__2340__auto__)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__2339__auto____8696, [cljs.core.str("#"), cljs.core.str("ComputedObservable"), cljs.core.str("{")].join(""), ", ", "}", opts__2338__auto__, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'state", this__8695.state), cljs.core.vector.call(null, "\ufdd0'dirty?", this__8695.dirty_QMARK_), cljs.core.vector.call(null, "\ufdd0'f", this__8695.f), cljs.core.vector.call(null, "\ufdd0'key", this__8695.key), 
  cljs.core.vector.call(null, "\ufdd0'parent-watchables", this__8695.parent_watchables), cljs.core.vector.call(null, "\ufdd0'watches", this__8695.watches)], true), this__8695.__extmap))
};
reflex.core.ComputedObservable.prototype.cljs$core$ICounted$_count$arity$1 = function(this__2327__auto__) {
  var this__8697 = this;
  return 6 + cljs.core.count.call(null, this__8697.__extmap)
};
reflex.core.ComputedObservable.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(this__2319__auto__, other__2320__auto__) {
  var this__8698 = this;
  if(cljs.core.truth_(function() {
    var and__3822__auto____8699 = other__2320__auto__;
    if(cljs.core.truth_(and__3822__auto____8699)) {
      var and__3822__auto____8700 = this__2319__auto__.constructor === other__2320__auto__.constructor;
      if(and__3822__auto____8700) {
        return cljs.core.equiv_map.call(null, this__2319__auto__, other__2320__auto__)
      }else {
        return and__3822__auto____8700
      }
    }else {
      return and__3822__auto____8699
    }
  }())) {
    return true
  }else {
    return false
  }
};
reflex.core.ComputedObservable.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(this__2322__auto__, G__8630) {
  var this__8701 = this;
  return new reflex.core.ComputedObservable(this__8701.state, this__8701.dirty_QMARK_, this__8701.f, this__8701.key, this__8701.parent_watchables, this__8701.watches, G__8630, this__8701.__extmap, this__8701.__hash)
};
reflex.core.ComputedObservable.prototype.cljs$core$IMeta$_meta$arity$1 = function(this__2321__auto__) {
  var this__8702 = this;
  return this__8702.__meta
};
reflex.core.ComputedObservable.prototype.cljs$core$IMap$_dissoc$arity$2 = function(this__2332__auto__, k__2333__auto__) {
  var this__8703 = this;
  if(cljs.core.contains_QMARK_.call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'dirty?", "\ufdd0'state", "\ufdd0'key", "\ufdd0'f", "\ufdd0'watches", "\ufdd0'parent-watchables"]), k__2333__auto__)) {
    return cljs.core.dissoc.call(null, cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, this__2332__auto__), this__8703.__meta), k__2333__auto__)
  }else {
    return new reflex.core.ComputedObservable(this__8703.state, this__8703.dirty_QMARK_, this__8703.f, this__8703.key, this__8703.parent_watchables, this__8703.watches, this__8703.__meta, cljs.core.not_empty.call(null, cljs.core.dissoc.call(null, this__8703.__extmap, k__2333__auto__)), null)
  }
};
reflex.core.ComputedObservable.cljs$lang$type = true;
reflex.core.ComputedObservable.cljs$lang$ctorPrSeq = function(this__2357__auto__) {
  return cljs.core.list.call(null, "reflex.core/ComputedObservable")
};
reflex.core.__GT_ComputedObservable = function __GT_ComputedObservable(state, dirty_QMARK_, f, key, parent_watchables, watches) {
  return new reflex.core.ComputedObservable(state, dirty_QMARK_, f, key, parent_watchables, watches)
};
reflex.core.map__GT_ComputedObservable = function map__GT_ComputedObservable(G__8632) {
  return new reflex.core.ComputedObservable((new cljs.core.Keyword("\ufdd0'state")).call(null, G__8632), (new cljs.core.Keyword("\ufdd0'dirty?")).call(null, G__8632), (new cljs.core.Keyword("\ufdd0'f")).call(null, G__8632), (new cljs.core.Keyword("\ufdd0'key")).call(null, G__8632), (new cljs.core.Keyword("\ufdd0'parent-watchables")).call(null, G__8632), (new cljs.core.Keyword("\ufdd0'watches")).call(null, G__8632), null, cljs.core.dissoc.call(null, G__8632, "\ufdd0'state", "\ufdd0'dirty?", "\ufdd0'f", 
  "\ufdd0'key", "\ufdd0'parent-watchables", "\ufdd0'watches"))
};
reflex.core.ComputedObservable;
goog.provide("dixon.grid");
goog.require("cljs.core");
dixon.grid.grid_window = function() {
  var grid_window = null;
  var grid_window__1 = function(coll) {
    return grid_window.call(null, null, coll)
  };
  var grid_window__2 = function(pad, coll) {
    return cljs.core.partition.call(null, 3, 1, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([pad], true), coll, cljs.core.PersistentVector.fromArray([pad], true)))
  };
  grid_window = function(pad, coll) {
    switch(arguments.length) {
      case 1:
        return grid_window__1.call(this, pad);
      case 2:
        return grid_window__2.call(this, pad, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  grid_window.cljs$lang$arity$1 = grid_window__1;
  grid_window.cljs$lang$arity$2 = grid_window__2;
  return grid_window
}();
dixon.grid.cell_block = function cell_block(p__6101) {
  var vec__6107__6108 = p__6101;
  var left__6109 = cljs.core.nth.call(null, vec__6107__6108, 0, null);
  var mid__6110 = cljs.core.nth.call(null, vec__6107__6108, 1, null);
  var right__6111 = cljs.core.nth.call(null, vec__6107__6108, 2, null);
  return dixon.grid.grid_window.call(null, cljs.core.map.call(null, cljs.core.vector, left__6109, mid__6110, right__6111))
};
dixon.grid.gol_liveness = function gol_liveness(block) {
  var vec__6123__6125 = block;
  var ___6126 = cljs.core.nth.call(null, vec__6123__6125, 0, null);
  var vec__6124__6127 = cljs.core.nth.call(null, vec__6123__6125, 1, null);
  var ___6128 = cljs.core.nth.call(null, vec__6124__6127, 0, null);
  var center__6129 = cljs.core.nth.call(null, vec__6124__6127, 1, null);
  var ___6130 = cljs.core.nth.call(null, vec__6124__6127, 2, null);
  var ___6131 = cljs.core.nth.call(null, vec__6123__6125, 2, null);
  var G__6132__6133 = cljs.core.count.call(null, cljs.core.filter.call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'on"]), cljs.core.apply.call(null, cljs.core.concat, block))) - (cljs.core._EQ_.call(null, "\ufdd0'on", center__6129) ? 1 : 0);
  if(cljs.core._EQ_.call(null, 3, G__6132__6133)) {
    return"\ufdd0'on"
  }else {
    if(cljs.core._EQ_.call(null, 2, G__6132__6133)) {
      return center__6129
    }else {
      if("\ufdd0'else") {
        return null
      }else {
        return null
      }
    }
  }
};
dixon.grid.step_row = function step_row(rows_triple) {
  return cljs.core.vec.call(null, cljs.core.map.call(null, dixon.grid.gol_liveness, dixon.grid.cell_block.call(null, rows_triple)))
};
dixon.grid.grid_step = function grid_step(grid) {
  return cljs.core.vec.call(null, cljs.core.map.call(null, dixon.grid.step_row, dixon.grid.grid_window.call(null, cljs.core.repeat.call(null, null), grid)))
};
dixon.grid.empty_grid = function empty_grid(w, h) {
  return cljs.core.vec.call(null, cljs.core.repeat.call(null, w, cljs.core.vec.call(null, cljs.core.repeat.call(null, h, null))))
};
dixon.grid.populate_grid = function populate_grid(grid, living_cells) {
  return cljs.core.reduce.call(null, function(grid, coordinates) {
    return cljs.core.assoc_in.call(null, grid, coordinates, "\ufdd0'on")
  }, grid, living_cells)
};
dixon.grid.glider = dixon.grid.populate_grid.call(null, dixon.grid.empty_grid.call(null, 6, 6), cljs.core.PersistentHashSet.fromArray([cljs.core.PersistentVector.fromArray([2, 1], true), cljs.core.PersistentVector.fromArray([2, 2], true), cljs.core.PersistentVector.fromArray([0, 1], true), cljs.core.PersistentVector.fromArray([1, 2], true), cljs.core.PersistentVector.fromArray([2, 0], true)]));
goog.provide("goog.userAgent");
goog.require("goog.string");
goog.userAgent.ASSUME_IE = false;
goog.userAgent.ASSUME_GECKO = false;
goog.userAgent.ASSUME_WEBKIT = false;
goog.userAgent.ASSUME_MOBILE_WEBKIT = false;
goog.userAgent.ASSUME_OPERA = false;
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
goog.userAgent.getUserAgentString = function() {
  return goog.global["navigator"] ? goog.global["navigator"].userAgent : null
};
goog.userAgent.getNavigator = function() {
  return goog.global["navigator"]
};
goog.userAgent.init_ = function() {
  goog.userAgent.detectedOpera_ = false;
  goog.userAgent.detectedIe_ = false;
  goog.userAgent.detectedWebkit_ = false;
  goog.userAgent.detectedMobile_ = false;
  goog.userAgent.detectedGecko_ = false;
  var ua;
  if(!goog.userAgent.BROWSER_KNOWN_ && (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = ua.indexOf("Opera") == 0;
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ && ua.indexOf("MSIE") != -1;
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ && ua.indexOf("WebKit") != -1;
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ && ua.indexOf("Mobile") != -1;
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ && !goog.userAgent.detectedWebkit_ && navigator.product == "Gecko"
  }
};
if(!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_()
}
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.userAgent.detectedGecko_;
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.userAgent.detectedWebkit_;
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.detectedMobile_;
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || ""
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.userAgent.ASSUME_MAC = false;
goog.userAgent.ASSUME_WINDOWS = false;
goog.userAgent.ASSUME_LINUX = false;
goog.userAgent.ASSUME_X11 = false;
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11;
goog.userAgent.initPlatform_ = function() {
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM, "Mac");
  goog.userAgent.detectedWindows_ = goog.string.contains(goog.userAgent.PLATFORM, "Win");
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM, "Linux");
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() && goog.string.contains(goog.userAgent.getNavigator()["appVersion"] || "", "X11")
};
if(!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_()
}
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;
goog.userAgent.determineVersion_ = function() {
  var version = "", re;
  if(goog.userAgent.OPERA && goog.global["opera"]) {
    var operaVersion = goog.global["opera"].version;
    version = typeof operaVersion == "function" ? operaVersion() : operaVersion
  }else {
    if(goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/
    }else {
      if(goog.userAgent.IE) {
        re = /MSIE\s+([^\);]+)(\)|;)/
      }else {
        if(goog.userAgent.WEBKIT) {
          re = /WebKit\/(\S+)/
        }
      }
    }
    if(re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : ""
    }
  }
  if(goog.userAgent.IE) {
    var docMode = goog.userAgent.getDocumentMode_();
    if(docMode > parseFloat(version)) {
      return String(docMode)
    }
  }
  return version
};
goog.userAgent.getDocumentMode_ = function() {
  var doc = goog.global["document"];
  return doc ? doc["documentMode"] : undefined
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2)
};
goog.userAgent.isVersionCache_ = {};
goog.userAgent.isVersion = function(version) {
  return goog.userAgent.isVersionCache_[version] || (goog.userAgent.isVersionCache_[version] = goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0)
};
goog.userAgent.isDocumentModeCache_ = {};
goog.userAgent.isDocumentMode = function(documentMode) {
  return goog.userAgent.isDocumentModeCache_[documentMode] || (goog.userAgent.isDocumentModeCache_[documentMode] = goog.userAgent.IE && document.documentMode && document.documentMode >= documentMode)
};
goog.provide("goog.dom.BrowserFeature");
goog.require("goog.userAgent");
goog.dom.BrowserFeature = {CAN_ADD_NAME_OR_TYPE_ATTRIBUTES:!goog.userAgent.IE || goog.userAgent.isDocumentMode(9), CAN_USE_CHILDREN_ATTRIBUTE:!goog.userAgent.GECKO && !goog.userAgent.IE || goog.userAgent.IE && goog.userAgent.isDocumentMode(9) || goog.userAgent.GECKO && goog.userAgent.isVersion("1.9.1"), CAN_USE_INNER_TEXT:goog.userAgent.IE && !goog.userAgent.isVersion("9"), INNER_HTML_NEEDS_SCOPED_ELEMENT:goog.userAgent.IE};
goog.provide("goog.dom.TagName");
goog.dom.TagName = {A:"A", ABBR:"ABBR", ACRONYM:"ACRONYM", ADDRESS:"ADDRESS", APPLET:"APPLET", AREA:"AREA", B:"B", BASE:"BASE", BASEFONT:"BASEFONT", BDO:"BDO", BIG:"BIG", BLOCKQUOTE:"BLOCKQUOTE", BODY:"BODY", BR:"BR", BUTTON:"BUTTON", CANVAS:"CANVAS", CAPTION:"CAPTION", CENTER:"CENTER", CITE:"CITE", CODE:"CODE", COL:"COL", COLGROUP:"COLGROUP", DD:"DD", DEL:"DEL", DFN:"DFN", DIR:"DIR", DIV:"DIV", DL:"DL", DT:"DT", EM:"EM", FIELDSET:"FIELDSET", FONT:"FONT", FORM:"FORM", FRAME:"FRAME", FRAMESET:"FRAMESET", 
H1:"H1", H2:"H2", H3:"H3", H4:"H4", H5:"H5", H6:"H6", HEAD:"HEAD", HR:"HR", HTML:"HTML", I:"I", IFRAME:"IFRAME", IMG:"IMG", INPUT:"INPUT", INS:"INS", ISINDEX:"ISINDEX", KBD:"KBD", LABEL:"LABEL", LEGEND:"LEGEND", LI:"LI", LINK:"LINK", MAP:"MAP", MENU:"MENU", META:"META", NOFRAMES:"NOFRAMES", NOSCRIPT:"NOSCRIPT", OBJECT:"OBJECT", OL:"OL", OPTGROUP:"OPTGROUP", OPTION:"OPTION", P:"P", PARAM:"PARAM", PRE:"PRE", Q:"Q", S:"S", SAMP:"SAMP", SCRIPT:"SCRIPT", SELECT:"SELECT", SMALL:"SMALL", SPAN:"SPAN", STRIKE:"STRIKE", 
STRONG:"STRONG", STYLE:"STYLE", SUB:"SUB", SUP:"SUP", TABLE:"TABLE", TBODY:"TBODY", TD:"TD", TEXTAREA:"TEXTAREA", TFOOT:"TFOOT", TH:"TH", THEAD:"THEAD", TITLE:"TITLE", TR:"TR", TT:"TT", U:"U", UL:"UL", VAR:"VAR"};
goog.provide("goog.dom.classes");
goog.require("goog.array");
goog.dom.classes.set = function(element, className) {
  element.className = className
};
goog.dom.classes.get = function(element) {
  var className = element.className;
  return className && typeof className.split == "function" ? className.split(/\s+/) : []
};
goog.dom.classes.add = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var b = goog.dom.classes.add_(classes, args);
  element.className = classes.join(" ");
  return b
};
goog.dom.classes.remove = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var b = goog.dom.classes.remove_(classes, args);
  element.className = classes.join(" ");
  return b
};
goog.dom.classes.add_ = function(classes, args) {
  var rv = 0;
  for(var i = 0;i < args.length;i++) {
    if(!goog.array.contains(classes, args[i])) {
      classes.push(args[i]);
      rv++
    }
  }
  return rv == args.length
};
goog.dom.classes.remove_ = function(classes, args) {
  var rv = 0;
  for(var i = 0;i < classes.length;i++) {
    if(goog.array.contains(args, classes[i])) {
      goog.array.splice(classes, i--, 1);
      rv++
    }
  }
  return rv == args.length
};
goog.dom.classes.swap = function(element, fromClass, toClass) {
  var classes = goog.dom.classes.get(element);
  var removed = false;
  for(var i = 0;i < classes.length;i++) {
    if(classes[i] == fromClass) {
      goog.array.splice(classes, i--, 1);
      removed = true
    }
  }
  if(removed) {
    classes.push(toClass);
    element.className = classes.join(" ")
  }
  return removed
};
goog.dom.classes.addRemove = function(element, classesToRemove, classesToAdd) {
  var classes = goog.dom.classes.get(element);
  if(goog.isString(classesToRemove)) {
    goog.array.remove(classes, classesToRemove)
  }else {
    if(goog.isArray(classesToRemove)) {
      goog.dom.classes.remove_(classes, classesToRemove)
    }
  }
  if(goog.isString(classesToAdd) && !goog.array.contains(classes, classesToAdd)) {
    classes.push(classesToAdd)
  }else {
    if(goog.isArray(classesToAdd)) {
      goog.dom.classes.add_(classes, classesToAdd)
    }
  }
  element.className = classes.join(" ")
};
goog.dom.classes.has = function(element, className) {
  return goog.array.contains(goog.dom.classes.get(element), className)
};
goog.dom.classes.enable = function(element, className, enabled) {
  if(enabled) {
    goog.dom.classes.add(element, className)
  }else {
    goog.dom.classes.remove(element, className)
  }
};
goog.dom.classes.toggle = function(element, className) {
  var add = !goog.dom.classes.has(element, className);
  goog.dom.classes.enable(element, className, add);
  return add
};
goog.provide("goog.math.Coordinate");
goog.math.Coordinate = function(opt_x, opt_y) {
  this.x = goog.isDef(opt_x) ? opt_x : 0;
  this.y = goog.isDef(opt_y) ? opt_y : 0
};
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y)
};
if(goog.DEBUG) {
  goog.math.Coordinate.prototype.toString = function() {
    return"(" + this.x + ", " + this.y + ")"
  }
}
goog.math.Coordinate.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.x == b.x && a.y == b.y
};
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy)
};
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy
};
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y)
};
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y)
};
goog.provide("goog.math.Size");
goog.math.Size = function(width, height) {
  this.width = width;
  this.height = height
};
goog.math.Size.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.width == b.width && a.height == b.height
};
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height)
};
if(goog.DEBUG) {
  goog.math.Size.prototype.toString = function() {
    return"(" + this.width + " x " + this.height + ")"
  }
}
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height)
};
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height)
};
goog.math.Size.prototype.area = function() {
  return this.width * this.height
};
goog.math.Size.prototype.perimeter = function() {
  return(this.width + this.height) * 2
};
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height
};
goog.math.Size.prototype.isEmpty = function() {
  return!this.area()
};
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this
};
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height
};
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this
};
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this
};
goog.math.Size.prototype.scale = function(s) {
  this.width *= s;
  this.height *= s;
  return this
};
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ? target.width / this.width : target.height / this.height;
  return this.scale(s)
};
goog.provide("goog.dom");
goog.provide("goog.dom.DomHelper");
goog.provide("goog.dom.NodeType");
goog.require("goog.array");
goog.require("goog.dom.BrowserFeature");
goog.require("goog.dom.TagName");
goog.require("goog.dom.classes");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.dom.ASSUME_QUIRKS_MODE = false;
goog.dom.ASSUME_STANDARDS_MODE = false;
goog.dom.COMPAT_MODE_KNOWN_ = goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;
goog.dom.NodeType = {ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, ENTITY_REFERENCE:5, ENTITY:6, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9, DOCUMENT_TYPE:10, DOCUMENT_FRAGMENT:11, NOTATION:12};
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ? new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) : goog.dom.defaultDomHelper_ || (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper)
};
goog.dom.defaultDomHelper_;
goog.dom.getDocument = function() {
  return document
};
goog.dom.getElement = function(element) {
  return goog.isString(element) ? document.getElementById(element) : element
};
goog.dom.$ = goog.dom.getElement;
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class, opt_el)
};
goog.dom.getElementsByClass = function(className, opt_el) {
  var parent = opt_el || document;
  if(goog.dom.canUseQuerySelector_(parent)) {
    return parent.querySelectorAll("." + className)
  }else {
    if(parent.getElementsByClassName) {
      return parent.getElementsByClassName(className)
    }
  }
  return goog.dom.getElementsByTagNameAndClass_(document, "*", className, opt_el)
};
goog.dom.getElementByClass = function(className, opt_el) {
  var parent = opt_el || document;
  var retVal = null;
  if(goog.dom.canUseQuerySelector_(parent)) {
    retVal = parent.querySelector("." + className)
  }else {
    retVal = goog.dom.getElementsByClass(className, opt_el)[0]
  }
  return retVal || null
};
goog.dom.canUseQuerySelector_ = function(parent) {
  return parent.querySelectorAll && parent.querySelector && (!goog.userAgent.WEBKIT || goog.dom.isCss1CompatMode_(document) || goog.userAgent.isVersion("528"))
};
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class, opt_el) {
  var parent = opt_el || doc;
  var tagName = opt_tag && opt_tag != "*" ? opt_tag.toUpperCase() : "";
  if(goog.dom.canUseQuerySelector_(parent) && (tagName || opt_class)) {
    var query = tagName + (opt_class ? "." + opt_class : "");
    return parent.querySelectorAll(query)
  }
  if(opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);
    if(tagName) {
      var arrayLike = {};
      var len = 0;
      for(var i = 0, el;el = els[i];i++) {
        if(tagName == el.nodeName) {
          arrayLike[len++] = el
        }
      }
      arrayLike.length = len;
      return arrayLike
    }else {
      return els
    }
  }
  var els = parent.getElementsByTagName(tagName || "*");
  if(opt_class) {
    var arrayLike = {};
    var len = 0;
    for(var i = 0, el;el = els[i];i++) {
      var className = el.className;
      if(typeof className.split == "function" && goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el
      }
    }
    arrayLike.length = len;
    return arrayLike
  }else {
    return els
  }
};
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if(key == "style") {
      element.style.cssText = val
    }else {
      if(key == "class") {
        element.className = val
      }else {
        if(key == "for") {
          element.htmlFor = val
        }else {
          if(key in goog.dom.DIRECT_ATTRIBUTE_MAP_) {
            element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val)
          }else {
            if(goog.string.startsWith(key, "aria-")) {
              element.setAttribute(key, val)
            }else {
              element[key] = val
            }
          }
        }
      }
    }
  })
};
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {"cellpadding":"cellPadding", "cellspacing":"cellSpacing", "colspan":"colSpan", "rowspan":"rowSpan", "valign":"vAlign", "height":"height", "width":"width", "usemap":"useMap", "frameborder":"frameBorder", "maxlength":"maxLength", "type":"type"};
goog.dom.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize_(opt_window || window)
};
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;
  if(goog.userAgent.WEBKIT && !goog.userAgent.isVersion("500") && !goog.userAgent.MOBILE) {
    if(typeof win.innerHeight == "undefined") {
      win = window
    }
    var innerHeight = win.innerHeight;
    var scrollHeight = win.document.documentElement.scrollHeight;
    if(win == win.top) {
      if(scrollHeight < innerHeight) {
        innerHeight -= 15
      }
    }
    return new goog.math.Size(win.innerWidth, innerHeight)
  }
  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;
  return new goog.math.Size(el.clientWidth, el.clientHeight)
};
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window)
};
goog.dom.getDocumentHeight_ = function(win) {
  var doc = win.document;
  var height = 0;
  if(doc) {
    var vh = goog.dom.getViewportSize_(win).height;
    var body = doc.body;
    var docEl = doc.documentElement;
    if(goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
      height = docEl.scrollHeight != vh ? docEl.scrollHeight : docEl.offsetHeight
    }else {
      var sh = docEl.scrollHeight;
      var oh = docEl.offsetHeight;
      if(docEl.clientHeight != oh) {
        sh = body.scrollHeight;
        oh = body.offsetHeight
      }
      if(sh > vh) {
        height = sh > oh ? sh : oh
      }else {
        height = sh < oh ? sh : oh
      }
    }
  }
  return height
};
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || goog.global || window;
  return goog.dom.getDomHelper(win.document).getDocumentScroll()
};
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document)
};
goog.dom.getDocumentScroll_ = function(doc) {
  var el = goog.dom.getDocumentScrollElement_(doc);
  var win = goog.dom.getWindow_(doc);
  return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft, win.pageYOffset || el.scrollTop)
};
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document)
};
goog.dom.getDocumentScrollElement_ = function(doc) {
  return!goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body
};
goog.dom.getWindow = function(opt_doc) {
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window
};
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView
};
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments)
};
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];
  if(!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && attributes && (attributes.name || attributes.type)) {
    var tagNameArr = ["<", tagName];
    if(attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name), '"')
    }
    if(attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type), '"');
      var clone = {};
      goog.object.extend(clone, attributes);
      attributes = clone;
      delete attributes.type
    }
    tagNameArr.push(">");
    tagName = tagNameArr.join("")
  }
  var element = doc.createElement(tagName);
  if(attributes) {
    if(goog.isString(attributes)) {
      element.className = attributes
    }else {
      if(goog.isArray(attributes)) {
        goog.dom.classes.add.apply(null, [element].concat(attributes))
      }else {
        goog.dom.setProperties(element, attributes)
      }
    }
  }
  if(args.length > 2) {
    goog.dom.append_(doc, element, args, 2)
  }
  return element
};
goog.dom.append_ = function(doc, parent, args, startIndex) {
  function childHandler(child) {
    if(child) {
      parent.appendChild(goog.isString(child) ? doc.createTextNode(child) : child)
    }
  }
  for(var i = startIndex;i < args.length;i++) {
    var arg = args[i];
    if(goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
      goog.array.forEach(goog.dom.isNodeList(arg) ? goog.array.clone(arg) : arg, childHandler)
    }else {
      childHandler(arg)
    }
  }
};
goog.dom.$dom = goog.dom.createDom;
goog.dom.createElement = function(name) {
  return document.createElement(name)
};
goog.dom.createTextNode = function(content) {
  return document.createTextNode(content)
};
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp)
};
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
  var rowHtml = ["<tr>"];
  for(var i = 0;i < columns;i++) {
    rowHtml.push(fillWithNbsp ? "<td>&nbsp;</td>" : "<td></td>")
  }
  rowHtml.push("</tr>");
  rowHtml = rowHtml.join("");
  var totalHtml = ["<table>"];
  for(i = 0;i < rows;i++) {
    totalHtml.push(rowHtml)
  }
  totalHtml.push("</table>");
  var elem = doc.createElement(goog.dom.TagName.DIV);
  elem.innerHTML = totalHtml.join("");
  return elem.removeChild(elem.firstChild)
};
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(document, htmlString)
};
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
  var tempDiv = doc.createElement("div");
  if(goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    tempDiv.innerHTML = "<br>" + htmlString;
    tempDiv.removeChild(tempDiv.firstChild)
  }else {
    tempDiv.innerHTML = htmlString
  }
  if(tempDiv.childNodes.length == 1) {
    return tempDiv.removeChild(tempDiv.firstChild)
  }else {
    var fragment = doc.createDocumentFragment();
    while(tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild)
    }
    return fragment
  }
};
goog.dom.getCompatMode = function() {
  return goog.dom.isCss1CompatMode() ? "CSS1Compat" : "BackCompat"
};
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document)
};
goog.dom.isCss1CompatMode_ = function(doc) {
  if(goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE
  }
  return doc.compatMode == "CSS1Compat"
};
goog.dom.canHaveChildren = function(node) {
  if(node.nodeType != goog.dom.NodeType.ELEMENT) {
    return false
  }
  switch(node.tagName) {
    case goog.dom.TagName.APPLET:
    ;
    case goog.dom.TagName.AREA:
    ;
    case goog.dom.TagName.BASE:
    ;
    case goog.dom.TagName.BR:
    ;
    case goog.dom.TagName.COL:
    ;
    case goog.dom.TagName.FRAME:
    ;
    case goog.dom.TagName.HR:
    ;
    case goog.dom.TagName.IMG:
    ;
    case goog.dom.TagName.INPUT:
    ;
    case goog.dom.TagName.IFRAME:
    ;
    case goog.dom.TagName.ISINDEX:
    ;
    case goog.dom.TagName.LINK:
    ;
    case goog.dom.TagName.NOFRAMES:
    ;
    case goog.dom.TagName.NOSCRIPT:
    ;
    case goog.dom.TagName.META:
    ;
    case goog.dom.TagName.OBJECT:
    ;
    case goog.dom.TagName.PARAM:
    ;
    case goog.dom.TagName.SCRIPT:
    ;
    case goog.dom.TagName.STYLE:
      return false
  }
  return true
};
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child)
};
goog.dom.append = function(parent, var_args) {
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1)
};
goog.dom.removeChildren = function(node) {
  var child;
  while(child = node.firstChild) {
    node.removeChild(child)
  }
};
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if(refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode)
  }
};
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if(refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling)
  }
};
goog.dom.insertChildAt = function(parent, child, index) {
  parent.insertBefore(child, parent.childNodes[index] || null)
};
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null
};
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if(parent) {
    parent.replaceChild(newNode, oldNode)
  }
};
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if(parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    if(element.removeNode) {
      return element.removeNode(false)
    }else {
      while(child = element.firstChild) {
        parent.insertBefore(child, element)
      }
      return goog.dom.removeNode(element)
    }
  }
};
goog.dom.getChildren = function(element) {
  if(goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE && element.children != undefined) {
    return element.children
  }
  return goog.array.filter(element.childNodes, function(node) {
    return node.nodeType == goog.dom.NodeType.ELEMENT
  })
};
goog.dom.getFirstElementChild = function(node) {
  if(node.firstElementChild != undefined) {
    return node.firstElementChild
  }
  return goog.dom.getNextElementNode_(node.firstChild, true)
};
goog.dom.getLastElementChild = function(node) {
  if(node.lastElementChild != undefined) {
    return node.lastElementChild
  }
  return goog.dom.getNextElementNode_(node.lastChild, false)
};
goog.dom.getNextElementSibling = function(node) {
  if(node.nextElementSibling != undefined) {
    return node.nextElementSibling
  }
  return goog.dom.getNextElementNode_(node.nextSibling, true)
};
goog.dom.getPreviousElementSibling = function(node) {
  if(node.previousElementSibling != undefined) {
    return node.previousElementSibling
  }
  return goog.dom.getNextElementNode_(node.previousSibling, false)
};
goog.dom.getNextElementNode_ = function(node, forward) {
  while(node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling
  }
  return node
};
goog.dom.getNextNode = function(node) {
  if(!node) {
    return null
  }
  if(node.firstChild) {
    return node.firstChild
  }
  while(node && !node.nextSibling) {
    node = node.parentNode
  }
  return node ? node.nextSibling : null
};
goog.dom.getPreviousNode = function(node) {
  if(!node) {
    return null
  }
  if(!node.previousSibling) {
    return node.parentNode
  }
  node = node.previousSibling;
  while(node && node.lastChild) {
    node = node.lastChild
  }
  return node
};
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0
};
goog.dom.isElement = function(obj) {
  return goog.isObject(obj) && obj.nodeType == goog.dom.NodeType.ELEMENT
};
goog.dom.isWindow = function(obj) {
  return goog.isObject(obj) && obj["window"] == obj
};
goog.dom.contains = function(parent, descendant) {
  if(parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant)
  }
  if(typeof parent.compareDocumentPosition != "undefined") {
    return parent == descendant || Boolean(parent.compareDocumentPosition(descendant) & 16)
  }
  while(descendant && parent != descendant) {
    descendant = descendant.parentNode
  }
  return descendant == parent
};
goog.dom.compareNodeOrder = function(node1, node2) {
  if(node1 == node2) {
    return 0
  }
  if(node1.compareDocumentPosition) {
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1
  }
  if("sourceIndex" in node1 || node1.parentNode && "sourceIndex" in node1.parentNode) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;
    if(isElement1 && isElement2) {
      return node1.sourceIndex - node2.sourceIndex
    }else {
      var parent1 = node1.parentNode;
      var parent2 = node2.parentNode;
      if(parent1 == parent2) {
        return goog.dom.compareSiblingOrder_(node1, node2)
      }
      if(!isElement1 && goog.dom.contains(parent1, node2)) {
        return-1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2)
      }
      if(!isElement2 && goog.dom.contains(parent2, node1)) {
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1)
      }
      return(isElement1 ? node1.sourceIndex : parent1.sourceIndex) - (isElement2 ? node2.sourceIndex : parent2.sourceIndex)
    }
  }
  var doc = goog.dom.getOwnerDocument(node1);
  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);
  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);
  return range1.compareBoundaryPoints(goog.global["Range"].START_TO_END, range2)
};
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if(parent == node) {
    return-1
  }
  var sibling = node;
  while(sibling.parentNode != parent) {
    sibling = sibling.parentNode
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode)
};
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while(s = s.previousSibling) {
    if(s == node1) {
      return-1
    }
  }
  return 1
};
goog.dom.findCommonAncestor = function(var_args) {
  var i, count = arguments.length;
  if(!count) {
    return null
  }else {
    if(count == 1) {
      return arguments[0]
    }
  }
  var paths = [];
  var minLength = Infinity;
  for(i = 0;i < count;i++) {
    var ancestors = [];
    var node = arguments[i];
    while(node) {
      ancestors.unshift(node);
      node = node.parentNode
    }
    paths.push(ancestors);
    minLength = Math.min(minLength, ancestors.length)
  }
  var output = null;
  for(i = 0;i < minLength;i++) {
    var first = paths[0][i];
    for(var j = 1;j < count;j++) {
      if(first != paths[j][i]) {
        return output
      }
    }
    output = first
  }
  return output
};
goog.dom.getOwnerDocument = function(node) {
  return node.nodeType == goog.dom.NodeType.DOCUMENT ? node : node.ownerDocument || node.document
};
goog.dom.getFrameContentDocument = function(frame) {
  var doc = frame.contentDocument || frame.contentWindow.document;
  return doc
};
goog.dom.getFrameContentWindow = function(frame) {
  return frame.contentWindow || goog.dom.getWindow_(goog.dom.getFrameContentDocument(frame))
};
goog.dom.setTextContent = function(element, text) {
  if("textContent" in element) {
    element.textContent = text
  }else {
    if(element.firstChild && element.firstChild.nodeType == goog.dom.NodeType.TEXT) {
      while(element.lastChild != element.firstChild) {
        element.removeChild(element.lastChild)
      }
      element.firstChild.data = text
    }else {
      goog.dom.removeChildren(element);
      var doc = goog.dom.getOwnerDocument(element);
      element.appendChild(doc.createTextNode(text))
    }
  }
};
goog.dom.getOuterHtml = function(element) {
  if("outerHTML" in element) {
    return element.outerHTML
  }else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement("div");
    div.appendChild(element.cloneNode(true));
    return div.innerHTML
  }
};
goog.dom.findNode = function(root, p) {
  var rv = [];
  var found = goog.dom.findNodes_(root, p, rv, true);
  return found ? rv[0] : undefined
};
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv
};
goog.dom.findNodes_ = function(root, p, rv, findOne) {
  if(root != null) {
    var child = root.firstChild;
    while(child) {
      if(p(child)) {
        rv.push(child);
        if(findOne) {
          return true
        }
      }
      if(goog.dom.findNodes_(child, p, rv, findOne)) {
        return true
      }
      child = child.nextSibling
    }
  }
  return false
};
goog.dom.TAGS_TO_IGNORE_ = {"SCRIPT":1, "STYLE":1, "HEAD":1, "IFRAME":1, "OBJECT":1};
goog.dom.PREDEFINED_TAG_VALUES_ = {"IMG":" ", "BR":"\n"};
goog.dom.isFocusableTabIndex = function(element) {
  var attrNode = element.getAttributeNode("tabindex");
  if(attrNode && attrNode.specified) {
    var index = element.tabIndex;
    return goog.isNumber(index) && index >= 0 && index < 32768
  }
  return false
};
goog.dom.setFocusableTabIndex = function(element, enable) {
  if(enable) {
    element.tabIndex = 0
  }else {
    element.tabIndex = -1;
    element.removeAttribute("tabIndex")
  }
};
goog.dom.getTextContent = function(node) {
  var textContent;
  if(goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && "innerText" in node) {
    textContent = goog.string.canonicalizeNewlines(node.innerText)
  }else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, true);
    textContent = buf.join("")
  }
  textContent = textContent.replace(/ \xAD /g, " ").replace(/\xAD/g, "");
  textContent = textContent.replace(/\u200B/g, "");
  if(!goog.dom.BrowserFeature.CAN_USE_INNER_TEXT) {
    textContent = textContent.replace(/ +/g, " ")
  }
  if(textContent != " ") {
    textContent = textContent.replace(/^\s*/, "")
  }
  return textContent
};
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, false);
  return buf.join("")
};
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if(node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
  }else {
    if(node.nodeType == goog.dom.NodeType.TEXT) {
      if(normalizeWhitespace) {
        buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ""))
      }else {
        buf.push(node.nodeValue)
      }
    }else {
      if(node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
        buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName])
      }else {
        var child = node.firstChild;
        while(child) {
          goog.dom.getTextContent_(child, buf, normalizeWhitespace);
          child = child.nextSibling
        }
      }
    }
  }
};
goog.dom.getNodeTextLength = function(node) {
  return goog.dom.getTextContent(node).length
};
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
  var buf = [];
  while(node && node != root) {
    var cur = node;
    while(cur = cur.previousSibling) {
      buf.unshift(goog.dom.getTextContent(cur))
    }
    node = node.parentNode
  }
  return goog.string.trimLeft(buf.join("")).replace(/ +/g, " ").length
};
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
  var stack = [parent], pos = 0, cur;
  while(stack.length > 0 && pos < offset) {
    cur = stack.pop();
    if(cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    }else {
      if(cur.nodeType == goog.dom.NodeType.TEXT) {
        var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, "").replace(/ +/g, " ");
        pos += text.length
      }else {
        if(cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
          pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length
        }else {
          for(var i = cur.childNodes.length - 1;i >= 0;i--) {
            stack.push(cur.childNodes[i])
          }
        }
      }
    }
  }
  if(goog.isObject(opt_result)) {
    opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1 : 0;
    opt_result.node = cur
  }
  return cur
};
goog.dom.isNodeList = function(val) {
  if(val && typeof val.length == "number") {
    if(goog.isObject(val)) {
      return typeof val.item == "function" || typeof val.item == "string"
    }else {
      if(goog.isFunction(val)) {
        return typeof val.item == "function"
      }
    }
  }
  return false
};
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class) {
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return goog.dom.getAncestor(element, function(node) {
    return(!tagName || node.nodeName == tagName) && (!opt_class || goog.dom.classes.has(node, opt_class))
  }, true)
};
goog.dom.getAncestorByClass = function(element, opt_class) {
  return goog.dom.getAncestorByTagNameAndClass(element, null, opt_class)
};
goog.dom.getAncestor = function(element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if(!opt_includeNode) {
    element = element.parentNode
  }
  var ignoreSearchSteps = opt_maxSearchSteps == null;
  var steps = 0;
  while(element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
    if(matcher(element)) {
      return element
    }
    element = element.parentNode;
    steps++
  }
  return null
};
goog.dom.getActiveElement = function(doc) {
  try {
    return doc && doc.activeElement
  }catch(e) {
  }
  return null
};
goog.dom.DomHelper = function(opt_document) {
  this.document_ = opt_document || goog.global.document || document
};
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document
};
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_
};
goog.dom.DomHelper.prototype.getElement = function(element) {
  if(goog.isString(element)) {
    return this.document_.getElementById(element)
  }else {
    return element
  }
};
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag, opt_class, opt_el)
};
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementsByClass(className, doc)
};
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementByClass(className, doc)
};
goog.dom.DomHelper.prototype.$$ = goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize(opt_window || this.getWindow())
};
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow())
};
goog.dom.Appendable;
goog.dom.DomHelper.prototype.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(this.document_, arguments)
};
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name)
};
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(content)
};
goog.dom.DomHelper.prototype.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(this.document_, rows, columns, !!opt_fillWithNbsp)
};
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString)
};
goog.dom.DomHelper.prototype.getCompatMode = function() {
  return this.isCss1CompatMode() ? "CSS1Compat" : "BackCompat"
};
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_)
};
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_)
};
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_)
};
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_)
};
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;
goog.dom.DomHelper.prototype.append = goog.dom.append;
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;
goog.dom.DomHelper.prototype.getFirstElementChild = goog.dom.getFirstElementChild;
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;
goog.dom.DomHelper.prototype.getNextElementSibling = goog.dom.getNextElementSibling;
goog.dom.DomHelper.prototype.getPreviousElementSibling = goog.dom.getPreviousElementSibling;
goog.dom.DomHelper.prototype.getNextNode = goog.dom.getNextNode;
goog.dom.DomHelper.prototype.getPreviousNode = goog.dom.getPreviousNode;
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;
goog.dom.DomHelper.prototype.contains = goog.dom.contains;
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;
goog.dom.DomHelper.prototype.getFrameContentDocument = goog.dom.getFrameContentDocument;
goog.dom.DomHelper.prototype.getFrameContentWindow = goog.dom.getFrameContentWindow;
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass = goog.dom.getAncestorByTagNameAndClass;
goog.dom.DomHelper.prototype.getAncestorByClass = goog.dom.getAncestorByClass;
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;
goog.provide("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.math.Box = function(top, right, bottom, left) {
  this.top = top;
  this.right = right;
  this.bottom = bottom;
  this.left = left
};
goog.math.Box.boundingBox = function(var_args) {
  var box = new goog.math.Box(arguments[0].y, arguments[0].x, arguments[0].y, arguments[0].x);
  for(var i = 1;i < arguments.length;i++) {
    var coord = arguments[i];
    box.top = Math.min(box.top, coord.y);
    box.right = Math.max(box.right, coord.x);
    box.bottom = Math.max(box.bottom, coord.y);
    box.left = Math.min(box.left, coord.x)
  }
  return box
};
goog.math.Box.prototype.clone = function() {
  return new goog.math.Box(this.top, this.right, this.bottom, this.left)
};
if(goog.DEBUG) {
  goog.math.Box.prototype.toString = function() {
    return"(" + this.top + "t, " + this.right + "r, " + this.bottom + "b, " + this.left + "l)"
  }
}
goog.math.Box.prototype.contains = function(other) {
  return goog.math.Box.contains(this, other)
};
goog.math.Box.prototype.expand = function(top, opt_right, opt_bottom, opt_left) {
  if(goog.isObject(top)) {
    this.top -= top.top;
    this.right += top.right;
    this.bottom += top.bottom;
    this.left -= top.left
  }else {
    this.top -= top;
    this.right += opt_right;
    this.bottom += opt_bottom;
    this.left -= opt_left
  }
  return this
};
goog.math.Box.prototype.expandToInclude = function(box) {
  this.left = Math.min(this.left, box.left);
  this.top = Math.min(this.top, box.top);
  this.right = Math.max(this.right, box.right);
  this.bottom = Math.max(this.bottom, box.bottom)
};
goog.math.Box.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.top == b.top && a.right == b.right && a.bottom == b.bottom && a.left == b.left
};
goog.math.Box.contains = function(box, other) {
  if(!box || !other) {
    return false
  }
  if(other instanceof goog.math.Box) {
    return other.left >= box.left && other.right <= box.right && other.top >= box.top && other.bottom <= box.bottom
  }
  return other.x >= box.left && other.x <= box.right && other.y >= box.top && other.y <= box.bottom
};
goog.math.Box.distance = function(box, coord) {
  if(coord.x >= box.left && coord.x <= box.right) {
    if(coord.y >= box.top && coord.y <= box.bottom) {
      return 0
    }
    return coord.y < box.top ? box.top - coord.y : coord.y - box.bottom
  }
  if(coord.y >= box.top && coord.y <= box.bottom) {
    return coord.x < box.left ? box.left - coord.x : coord.x - box.right
  }
  return goog.math.Coordinate.distance(coord, new goog.math.Coordinate(coord.x < box.left ? box.left : box.right, coord.y < box.top ? box.top : box.bottom))
};
goog.math.Box.intersects = function(a, b) {
  return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom
};
goog.math.Box.intersectsWithPadding = function(a, b, padding) {
  return a.left <= b.right + padding && b.left <= a.right + padding && a.top <= b.bottom + padding && b.top <= a.bottom + padding
};
goog.provide("goog.math.Rect");
goog.require("goog.math.Box");
goog.require("goog.math.Size");
goog.math.Rect = function(x, y, w, h) {
  this.left = x;
  this.top = y;
  this.width = w;
  this.height = h
};
goog.math.Rect.prototype.clone = function() {
  return new goog.math.Rect(this.left, this.top, this.width, this.height)
};
goog.math.Rect.prototype.toBox = function() {
  var right = this.left + this.width;
  var bottom = this.top + this.height;
  return new goog.math.Box(this.top, right, bottom, this.left)
};
goog.math.Rect.createFromBox = function(box) {
  return new goog.math.Rect(box.left, box.top, box.right - box.left, box.bottom - box.top)
};
if(goog.DEBUG) {
  goog.math.Rect.prototype.toString = function() {
    return"(" + this.left + ", " + this.top + " - " + this.width + "w x " + this.height + "h)"
  }
}
goog.math.Rect.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.left == b.left && a.width == b.width && a.top == b.top && a.height == b.height
};
goog.math.Rect.prototype.intersection = function(rect) {
  var x0 = Math.max(this.left, rect.left);
  var x1 = Math.min(this.left + this.width, rect.left + rect.width);
  if(x0 <= x1) {
    var y0 = Math.max(this.top, rect.top);
    var y1 = Math.min(this.top + this.height, rect.top + rect.height);
    if(y0 <= y1) {
      this.left = x0;
      this.top = y0;
      this.width = x1 - x0;
      this.height = y1 - y0;
      return true
    }
  }
  return false
};
goog.math.Rect.intersection = function(a, b) {
  var x0 = Math.max(a.left, b.left);
  var x1 = Math.min(a.left + a.width, b.left + b.width);
  if(x0 <= x1) {
    var y0 = Math.max(a.top, b.top);
    var y1 = Math.min(a.top + a.height, b.top + b.height);
    if(y0 <= y1) {
      return new goog.math.Rect(x0, y0, x1 - x0, y1 - y0)
    }
  }
  return null
};
goog.math.Rect.intersects = function(a, b) {
  return a.left <= b.left + b.width && b.left <= a.left + a.width && a.top <= b.top + b.height && b.top <= a.top + a.height
};
goog.math.Rect.prototype.intersects = function(rect) {
  return goog.math.Rect.intersects(this, rect)
};
goog.math.Rect.difference = function(a, b) {
  var intersection = goog.math.Rect.intersection(a, b);
  if(!intersection || !intersection.height || !intersection.width) {
    return[a.clone()]
  }
  var result = [];
  var top = a.top;
  var height = a.height;
  var ar = a.left + a.width;
  var ab = a.top + a.height;
  var br = b.left + b.width;
  var bb = b.top + b.height;
  if(b.top > a.top) {
    result.push(new goog.math.Rect(a.left, a.top, a.width, b.top - a.top));
    top = b.top;
    height -= b.top - a.top
  }
  if(bb < ab) {
    result.push(new goog.math.Rect(a.left, bb, a.width, ab - bb));
    height = bb - top
  }
  if(b.left > a.left) {
    result.push(new goog.math.Rect(a.left, top, b.left - a.left, height))
  }
  if(br < ar) {
    result.push(new goog.math.Rect(br, top, ar - br, height))
  }
  return result
};
goog.math.Rect.prototype.difference = function(rect) {
  return goog.math.Rect.difference(this, rect)
};
goog.math.Rect.prototype.boundingRect = function(rect) {
  var right = Math.max(this.left + this.width, rect.left + rect.width);
  var bottom = Math.max(this.top + this.height, rect.top + rect.height);
  this.left = Math.min(this.left, rect.left);
  this.top = Math.min(this.top, rect.top);
  this.width = right - this.left;
  this.height = bottom - this.top
};
goog.math.Rect.boundingRect = function(a, b) {
  if(!a || !b) {
    return null
  }
  var clone = a.clone();
  clone.boundingRect(b);
  return clone
};
goog.math.Rect.prototype.contains = function(another) {
  if(another instanceof goog.math.Rect) {
    return this.left <= another.left && this.left + this.width >= another.left + another.width && this.top <= another.top && this.top + this.height >= another.top + another.height
  }else {
    return another.x >= this.left && another.x <= this.left + this.width && another.y >= this.top && another.y <= this.top + this.height
  }
};
goog.math.Rect.prototype.getSize = function() {
  return new goog.math.Size(this.width, this.height)
};
goog.provide("goog.style");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Rect");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.style.setStyle = function(element, style, opt_value) {
  if(goog.isString(style)) {
    goog.style.setStyle_(element, opt_value, style)
  }else {
    goog.object.forEach(style, goog.partial(goog.style.setStyle_, element))
  }
};
goog.style.setStyle_ = function(element, value, style) {
  element.style[goog.string.toCamelCase(style)] = value
};
goog.style.getStyle = function(element, property) {
  return element.style[goog.string.toCamelCase(property)] || ""
};
goog.style.getComputedStyle = function(element, property) {
  var doc = goog.dom.getOwnerDocument(element);
  if(doc.defaultView && doc.defaultView.getComputedStyle) {
    var styles = doc.defaultView.getComputedStyle(element, null);
    if(styles) {
      return styles[property] || styles.getPropertyValue(property)
    }
  }
  return""
};
goog.style.getCascadedStyle = function(element, style) {
  return element.currentStyle ? element.currentStyle[style] : null
};
goog.style.getStyle_ = function(element, style) {
  return goog.style.getComputedStyle(element, style) || goog.style.getCascadedStyle(element, style) || element.style[style]
};
goog.style.getComputedPosition = function(element) {
  return goog.style.getStyle_(element, "position")
};
goog.style.getBackgroundColor = function(element) {
  return goog.style.getStyle_(element, "backgroundColor")
};
goog.style.getComputedOverflowX = function(element) {
  return goog.style.getStyle_(element, "overflowX")
};
goog.style.getComputedOverflowY = function(element) {
  return goog.style.getStyle_(element, "overflowY")
};
goog.style.getComputedZIndex = function(element) {
  return goog.style.getStyle_(element, "zIndex")
};
goog.style.getComputedTextAlign = function(element) {
  return goog.style.getStyle_(element, "textAlign")
};
goog.style.getComputedCursor = function(element) {
  return goog.style.getStyle_(element, "cursor")
};
goog.style.setPosition = function(el, arg1, opt_arg2) {
  var x, y;
  var buggyGeckoSubPixelPos = goog.userAgent.GECKO && (goog.userAgent.MAC || goog.userAgent.X11) && goog.userAgent.isVersion("1.9");
  if(arg1 instanceof goog.math.Coordinate) {
    x = arg1.x;
    y = arg1.y
  }else {
    x = arg1;
    y = opt_arg2
  }
  el.style.left = goog.style.getPixelStyleValue_(x, buggyGeckoSubPixelPos);
  el.style.top = goog.style.getPixelStyleValue_(y, buggyGeckoSubPixelPos)
};
goog.style.getPosition = function(element) {
  return new goog.math.Coordinate(element.offsetLeft, element.offsetTop)
};
goog.style.getClientViewportElement = function(opt_node) {
  var doc;
  if(opt_node) {
    if(opt_node.nodeType == goog.dom.NodeType.DOCUMENT) {
      doc = opt_node
    }else {
      doc = goog.dom.getOwnerDocument(opt_node)
    }
  }else {
    doc = goog.dom.getDocument()
  }
  if(goog.userAgent.IE && !goog.userAgent.isDocumentMode(9) && !goog.dom.getDomHelper(doc).isCss1CompatMode()) {
    return doc.body
  }
  return doc.documentElement
};
goog.style.getBoundingClientRect_ = function(el) {
  var rect = el.getBoundingClientRect();
  if(goog.userAgent.IE) {
    var doc = el.ownerDocument;
    rect.left -= doc.documentElement.clientLeft + doc.body.clientLeft;
    rect.top -= doc.documentElement.clientTop + doc.body.clientTop
  }
  return rect
};
goog.style.getOffsetParent = function(element) {
  if(goog.userAgent.IE) {
    return element.offsetParent
  }
  var doc = goog.dom.getOwnerDocument(element);
  var positionStyle = goog.style.getStyle_(element, "position");
  var skipStatic = positionStyle == "fixed" || positionStyle == "absolute";
  for(var parent = element.parentNode;parent && parent != doc;parent = parent.parentNode) {
    positionStyle = goog.style.getStyle_(parent, "position");
    skipStatic = skipStatic && positionStyle == "static" && parent != doc.documentElement && parent != doc.body;
    if(!skipStatic && (parent.scrollWidth > parent.clientWidth || parent.scrollHeight > parent.clientHeight || positionStyle == "fixed" || positionStyle == "absolute" || positionStyle == "relative")) {
      return parent
    }
  }
  return null
};
goog.style.getVisibleRectForElement = function(element) {
  var visibleRect = new goog.math.Box(0, Infinity, Infinity, 0);
  var dom = goog.dom.getDomHelper(element);
  var body = dom.getDocument().body;
  var documentElement = dom.getDocument().documentElement;
  var scrollEl = dom.getDocumentScrollElement();
  for(var el = element;el = goog.style.getOffsetParent(el);) {
    if((!goog.userAgent.IE || el.clientWidth != 0) && (!goog.userAgent.WEBKIT || el.clientHeight != 0 || el != body) && el != body && el != documentElement && goog.style.getStyle_(el, "overflow") != "visible") {
      var pos = goog.style.getPageOffset(el);
      var client = goog.style.getClientLeftTop(el);
      pos.x += client.x;
      pos.y += client.y;
      visibleRect.top = Math.max(visibleRect.top, pos.y);
      visibleRect.right = Math.min(visibleRect.right, pos.x + el.clientWidth);
      visibleRect.bottom = Math.min(visibleRect.bottom, pos.y + el.clientHeight);
      visibleRect.left = Math.max(visibleRect.left, pos.x)
    }
  }
  var scrollX = scrollEl.scrollLeft, scrollY = scrollEl.scrollTop;
  visibleRect.left = Math.max(visibleRect.left, scrollX);
  visibleRect.top = Math.max(visibleRect.top, scrollY);
  var winSize = dom.getViewportSize();
  visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
  visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
  return visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left ? visibleRect : null
};
goog.style.scrollIntoContainerView = function(element, container, opt_center) {
  var elementPos = goog.style.getPageOffset(element);
  var containerPos = goog.style.getPageOffset(container);
  var containerBorder = goog.style.getBorderBox(container);
  var relX = elementPos.x - containerPos.x - containerBorder.left;
  var relY = elementPos.y - containerPos.y - containerBorder.top;
  var spaceX = container.clientWidth - element.offsetWidth;
  var spaceY = container.clientHeight - element.offsetHeight;
  if(opt_center) {
    container.scrollLeft += relX - spaceX / 2;
    container.scrollTop += relY - spaceY / 2
  }else {
    container.scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0));
    container.scrollTop += Math.min(relY, Math.max(relY - spaceY, 0))
  }
};
goog.style.getClientLeftTop = function(el) {
  if(goog.userAgent.GECKO && !goog.userAgent.isVersion("1.9")) {
    var left = parseFloat(goog.style.getComputedStyle(el, "borderLeftWidth"));
    if(goog.style.isRightToLeft(el)) {
      var scrollbarWidth = el.offsetWidth - el.clientWidth - left - parseFloat(goog.style.getComputedStyle(el, "borderRightWidth"));
      left += scrollbarWidth
    }
    return new goog.math.Coordinate(left, parseFloat(goog.style.getComputedStyle(el, "borderTopWidth")))
  }
  return new goog.math.Coordinate(el.clientLeft, el.clientTop)
};
goog.style.getPageOffset = function(el) {
  var box, doc = goog.dom.getOwnerDocument(el);
  var positionStyle = goog.style.getStyle_(el, "position");
  var BUGGY_GECKO_BOX_OBJECT = goog.userAgent.GECKO && doc.getBoxObjectFor && !el.getBoundingClientRect && positionStyle == "absolute" && (box = doc.getBoxObjectFor(el)) && (box.screenX < 0 || box.screenY < 0);
  var pos = new goog.math.Coordinate(0, 0);
  var viewportElement = goog.style.getClientViewportElement(doc);
  if(el == viewportElement) {
    return pos
  }
  if(el.getBoundingClientRect) {
    box = goog.style.getBoundingClientRect_(el);
    var scrollCoord = goog.dom.getDomHelper(doc).getDocumentScroll();
    pos.x = box.left + scrollCoord.x;
    pos.y = box.top + scrollCoord.y
  }else {
    if(doc.getBoxObjectFor && !BUGGY_GECKO_BOX_OBJECT) {
      box = doc.getBoxObjectFor(el);
      var vpBox = doc.getBoxObjectFor(viewportElement);
      pos.x = box.screenX - vpBox.screenX;
      pos.y = box.screenY - vpBox.screenY
    }else {
      var parent = el;
      do {
        pos.x += parent.offsetLeft;
        pos.y += parent.offsetTop;
        if(parent != el) {
          pos.x += parent.clientLeft || 0;
          pos.y += parent.clientTop || 0
        }
        if(goog.userAgent.WEBKIT && goog.style.getComputedPosition(parent) == "fixed") {
          pos.x += doc.body.scrollLeft;
          pos.y += doc.body.scrollTop;
          break
        }
        parent = parent.offsetParent
      }while(parent && parent != el);
      if(goog.userAgent.OPERA || goog.userAgent.WEBKIT && positionStyle == "absolute") {
        pos.y -= doc.body.offsetTop
      }
      for(parent = el;(parent = goog.style.getOffsetParent(parent)) && parent != doc.body && parent != viewportElement;) {
        pos.x -= parent.scrollLeft;
        if(!goog.userAgent.OPERA || parent.tagName != "TR") {
          pos.y -= parent.scrollTop
        }
      }
    }
  }
  return pos
};
goog.style.getPageOffsetLeft = function(el) {
  return goog.style.getPageOffset(el).x
};
goog.style.getPageOffsetTop = function(el) {
  return goog.style.getPageOffset(el).y
};
goog.style.getFramedPageOffset = function(el, relativeWin) {
  var position = new goog.math.Coordinate(0, 0);
  var currentWin = goog.dom.getWindow(goog.dom.getOwnerDocument(el));
  var currentEl = el;
  do {
    var offset = currentWin == relativeWin ? goog.style.getPageOffset(currentEl) : goog.style.getClientPosition(currentEl);
    position.x += offset.x;
    position.y += offset.y
  }while(currentWin && currentWin != relativeWin && (currentEl = currentWin.frameElement) && (currentWin = currentWin.parent));
  return position
};
goog.style.translateRectForAnotherFrame = function(rect, origBase, newBase) {
  if(origBase.getDocument() != newBase.getDocument()) {
    var body = origBase.getDocument().body;
    var pos = goog.style.getFramedPageOffset(body, newBase.getWindow());
    pos = goog.math.Coordinate.difference(pos, goog.style.getPageOffset(body));
    if(goog.userAgent.IE && !origBase.isCss1CompatMode()) {
      pos = goog.math.Coordinate.difference(pos, origBase.getDocumentScroll())
    }
    rect.left += pos.x;
    rect.top += pos.y
  }
};
goog.style.getRelativePosition = function(a, b) {
  var ap = goog.style.getClientPosition(a);
  var bp = goog.style.getClientPosition(b);
  return new goog.math.Coordinate(ap.x - bp.x, ap.y - bp.y)
};
goog.style.getClientPosition = function(el) {
  var pos = new goog.math.Coordinate;
  if(el.nodeType == goog.dom.NodeType.ELEMENT) {
    if(el.getBoundingClientRect) {
      var box = goog.style.getBoundingClientRect_(el);
      pos.x = box.left;
      pos.y = box.top
    }else {
      var scrollCoord = goog.dom.getDomHelper(el).getDocumentScroll();
      var pageCoord = goog.style.getPageOffset(el);
      pos.x = pageCoord.x - scrollCoord.x;
      pos.y = pageCoord.y - scrollCoord.y
    }
  }else {
    var isAbstractedEvent = goog.isFunction(el.getBrowserEvent);
    var targetEvent = el;
    if(el.targetTouches) {
      targetEvent = el.targetTouches[0]
    }else {
      if(isAbstractedEvent && el.getBrowserEvent().targetTouches) {
        targetEvent = el.getBrowserEvent().targetTouches[0]
      }
    }
    pos.x = targetEvent.clientX;
    pos.y = targetEvent.clientY
  }
  return pos
};
goog.style.setPageOffset = function(el, x, opt_y) {
  var cur = goog.style.getPageOffset(el);
  if(x instanceof goog.math.Coordinate) {
    opt_y = x.y;
    x = x.x
  }
  var dx = x - cur.x;
  var dy = opt_y - cur.y;
  goog.style.setPosition(el, el.offsetLeft + dx, el.offsetTop + dy)
};
goog.style.setSize = function(element, w, opt_h) {
  var h;
  if(w instanceof goog.math.Size) {
    h = w.height;
    w = w.width
  }else {
    if(opt_h == undefined) {
      throw Error("missing height argument");
    }
    h = opt_h
  }
  goog.style.setWidth(element, w);
  goog.style.setHeight(element, h)
};
goog.style.getPixelStyleValue_ = function(value, round) {
  if(typeof value == "number") {
    value = (round ? Math.round(value) : value) + "px"
  }
  return value
};
goog.style.setHeight = function(element, height) {
  element.style.height = goog.style.getPixelStyleValue_(height, true)
};
goog.style.setWidth = function(element, width) {
  element.style.width = goog.style.getPixelStyleValue_(width, true)
};
goog.style.getSize = function(element) {
  if(goog.style.getStyle_(element, "display") != "none") {
    return goog.style.getSizeWithDisplay_(element)
  }
  var style = element.style;
  var originalDisplay = style.display;
  var originalVisibility = style.visibility;
  var originalPosition = style.position;
  style.visibility = "hidden";
  style.position = "absolute";
  style.display = "inline";
  var size = goog.style.getSizeWithDisplay_(element);
  style.display = originalDisplay;
  style.position = originalPosition;
  style.visibility = originalVisibility;
  return size
};
goog.style.getSizeWithDisplay_ = function(element) {
  var offsetWidth = element.offsetWidth;
  var offsetHeight = element.offsetHeight;
  var webkitOffsetsZero = goog.userAgent.WEBKIT && !offsetWidth && !offsetHeight;
  if((!goog.isDef(offsetWidth) || webkitOffsetsZero) && element.getBoundingClientRect) {
    var clientRect = goog.style.getBoundingClientRect_(element);
    return new goog.math.Size(clientRect.right - clientRect.left, clientRect.bottom - clientRect.top)
  }
  return new goog.math.Size(offsetWidth, offsetHeight)
};
goog.style.getBounds = function(element) {
  var o = goog.style.getPageOffset(element);
  var s = goog.style.getSize(element);
  return new goog.math.Rect(o.x, o.y, s.width, s.height)
};
goog.style.toCamelCase = function(selector) {
  return goog.string.toCamelCase(String(selector))
};
goog.style.toSelectorCase = function(selector) {
  return goog.string.toSelectorCase(selector)
};
goog.style.getOpacity = function(el) {
  var style = el.style;
  var result = "";
  if("opacity" in style) {
    result = style.opacity
  }else {
    if("MozOpacity" in style) {
      result = style.MozOpacity
    }else {
      if("filter" in style) {
        var match = style.filter.match(/alpha\(opacity=([\d.]+)\)/);
        if(match) {
          result = String(match[1] / 100)
        }
      }
    }
  }
  return result == "" ? result : Number(result)
};
goog.style.setOpacity = function(el, alpha) {
  var style = el.style;
  if("opacity" in style) {
    style.opacity = alpha
  }else {
    if("MozOpacity" in style) {
      style.MozOpacity = alpha
    }else {
      if("filter" in style) {
        if(alpha === "") {
          style.filter = ""
        }else {
          style.filter = "alpha(opacity=" + alpha * 100 + ")"
        }
      }
    }
  }
};
goog.style.setTransparentBackgroundImage = function(el, src) {
  var style = el.style;
  if(goog.userAgent.IE && !goog.userAgent.isVersion("8")) {
    style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(" + 'src="' + src + '", sizingMethod="crop")'
  }else {
    style.backgroundImage = "url(" + src + ")";
    style.backgroundPosition = "top left";
    style.backgroundRepeat = "no-repeat"
  }
};
goog.style.clearTransparentBackgroundImage = function(el) {
  var style = el.style;
  if("filter" in style) {
    style.filter = ""
  }else {
    style.backgroundImage = "none"
  }
};
goog.style.showElement = function(el, display) {
  el.style.display = display ? "" : "none"
};
goog.style.isElementShown = function(el) {
  return el.style.display != "none"
};
goog.style.installStyles = function(stylesString, opt_node) {
  var dh = goog.dom.getDomHelper(opt_node);
  var styleSheet = null;
  if(goog.userAgent.IE) {
    styleSheet = dh.getDocument().createStyleSheet();
    goog.style.setStyles(styleSheet, stylesString)
  }else {
    var head = dh.getElementsByTagNameAndClass("head")[0];
    if(!head) {
      var body = dh.getElementsByTagNameAndClass("body")[0];
      head = dh.createDom("head");
      body.parentNode.insertBefore(head, body)
    }
    styleSheet = dh.createDom("style");
    goog.style.setStyles(styleSheet, stylesString);
    dh.appendChild(head, styleSheet)
  }
  return styleSheet
};
goog.style.uninstallStyles = function(styleSheet) {
  var node = styleSheet.ownerNode || styleSheet.owningElement || styleSheet;
  goog.dom.removeNode(node)
};
goog.style.setStyles = function(element, stylesString) {
  if(goog.userAgent.IE) {
    element.cssText = stylesString
  }else {
    var propToSet = goog.userAgent.WEBKIT ? "innerText" : "innerHTML";
    element[propToSet] = stylesString
  }
};
goog.style.setPreWrap = function(el) {
  var style = el.style;
  if(goog.userAgent.IE && !goog.userAgent.isVersion("8")) {
    style.whiteSpace = "pre";
    style.wordWrap = "break-word"
  }else {
    if(goog.userAgent.GECKO) {
      style.whiteSpace = "-moz-pre-wrap"
    }else {
      style.whiteSpace = "pre-wrap"
    }
  }
};
goog.style.setInlineBlock = function(el) {
  var style = el.style;
  style.position = "relative";
  if(goog.userAgent.IE && !goog.userAgent.isVersion("8")) {
    style.zoom = "1";
    style.display = "inline"
  }else {
    if(goog.userAgent.GECKO) {
      style.display = goog.userAgent.isVersion("1.9a") ? "inline-block" : "-moz-inline-box"
    }else {
      style.display = "inline-block"
    }
  }
};
goog.style.isRightToLeft = function(el) {
  return"rtl" == goog.style.getStyle_(el, "direction")
};
goog.style.unselectableStyle_ = goog.userAgent.GECKO ? "MozUserSelect" : goog.userAgent.WEBKIT ? "WebkitUserSelect" : null;
goog.style.isUnselectable = function(el) {
  if(goog.style.unselectableStyle_) {
    return el.style[goog.style.unselectableStyle_].toLowerCase() == "none"
  }else {
    if(goog.userAgent.IE || goog.userAgent.OPERA) {
      return el.getAttribute("unselectable") == "on"
    }
  }
  return false
};
goog.style.setUnselectable = function(el, unselectable, opt_noRecurse) {
  var descendants = !opt_noRecurse ? el.getElementsByTagName("*") : null;
  var name = goog.style.unselectableStyle_;
  if(name) {
    var value = unselectable ? "none" : "";
    el.style[name] = value;
    if(descendants) {
      for(var i = 0, descendant;descendant = descendants[i];i++) {
        descendant.style[name] = value
      }
    }
  }else {
    if(goog.userAgent.IE || goog.userAgent.OPERA) {
      var value = unselectable ? "on" : "";
      el.setAttribute("unselectable", value);
      if(descendants) {
        for(var i = 0, descendant;descendant = descendants[i];i++) {
          descendant.setAttribute("unselectable", value)
        }
      }
    }
  }
};
goog.style.getBorderBoxSize = function(element) {
  return new goog.math.Size(element.offsetWidth, element.offsetHeight)
};
goog.style.setBorderBoxSize = function(element, size) {
  var doc = goog.dom.getOwnerDocument(element);
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode();
  if(goog.userAgent.IE && (!isCss1CompatMode || !goog.userAgent.isVersion("8"))) {
    var style = element.style;
    if(isCss1CompatMode) {
      var paddingBox = goog.style.getPaddingBox(element);
      var borderBox = goog.style.getBorderBox(element);
      style.pixelWidth = size.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right;
      style.pixelHeight = size.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom
    }else {
      style.pixelWidth = size.width;
      style.pixelHeight = size.height
    }
  }else {
    goog.style.setBoxSizingSize_(element, size, "border-box")
  }
};
goog.style.getContentBoxSize = function(element) {
  var doc = goog.dom.getOwnerDocument(element);
  var ieCurrentStyle = goog.userAgent.IE && element.currentStyle;
  if(ieCurrentStyle && goog.dom.getDomHelper(doc).isCss1CompatMode() && ieCurrentStyle.width != "auto" && ieCurrentStyle.height != "auto" && !ieCurrentStyle.boxSizing) {
    var width = goog.style.getIePixelValue_(element, ieCurrentStyle.width, "width", "pixelWidth");
    var height = goog.style.getIePixelValue_(element, ieCurrentStyle.height, "height", "pixelHeight");
    return new goog.math.Size(width, height)
  }else {
    var borderBoxSize = goog.style.getBorderBoxSize(element);
    var paddingBox = goog.style.getPaddingBox(element);
    var borderBox = goog.style.getBorderBox(element);
    return new goog.math.Size(borderBoxSize.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right, borderBoxSize.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom)
  }
};
goog.style.setContentBoxSize = function(element, size) {
  var doc = goog.dom.getOwnerDocument(element);
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode();
  if(goog.userAgent.IE && (!isCss1CompatMode || !goog.userAgent.isVersion("8"))) {
    var style = element.style;
    if(isCss1CompatMode) {
      style.pixelWidth = size.width;
      style.pixelHeight = size.height
    }else {
      var paddingBox = goog.style.getPaddingBox(element);
      var borderBox = goog.style.getBorderBox(element);
      style.pixelWidth = size.width + borderBox.left + paddingBox.left + paddingBox.right + borderBox.right;
      style.pixelHeight = size.height + borderBox.top + paddingBox.top + paddingBox.bottom + borderBox.bottom
    }
  }else {
    goog.style.setBoxSizingSize_(element, size, "content-box")
  }
};
goog.style.setBoxSizingSize_ = function(element, size, boxSizing) {
  var style = element.style;
  if(goog.userAgent.GECKO) {
    style.MozBoxSizing = boxSizing
  }else {
    if(goog.userAgent.WEBKIT) {
      style.WebkitBoxSizing = boxSizing
    }else {
      style.boxSizing = boxSizing
    }
  }
  style.width = size.width + "px";
  style.height = size.height + "px"
};
goog.style.getIePixelValue_ = function(element, value, name, pixelName) {
  if(/^\d+px?$/.test(value)) {
    return parseInt(value, 10)
  }else {
    var oldStyleValue = element.style[name];
    var oldRuntimeValue = element.runtimeStyle[name];
    element.runtimeStyle[name] = element.currentStyle[name];
    element.style[name] = value;
    var pixelValue = element.style[pixelName];
    element.style[name] = oldStyleValue;
    element.runtimeStyle[name] = oldRuntimeValue;
    return pixelValue
  }
};
goog.style.getIePixelDistance_ = function(element, propName) {
  return goog.style.getIePixelValue_(element, goog.style.getCascadedStyle(element, propName), "left", "pixelLeft")
};
goog.style.getBox_ = function(element, stylePrefix) {
  if(goog.userAgent.IE) {
    var left = goog.style.getIePixelDistance_(element, stylePrefix + "Left");
    var right = goog.style.getIePixelDistance_(element, stylePrefix + "Right");
    var top = goog.style.getIePixelDistance_(element, stylePrefix + "Top");
    var bottom = goog.style.getIePixelDistance_(element, stylePrefix + "Bottom");
    return new goog.math.Box(top, right, bottom, left)
  }else {
    var left = goog.style.getComputedStyle(element, stylePrefix + "Left");
    var right = goog.style.getComputedStyle(element, stylePrefix + "Right");
    var top = goog.style.getComputedStyle(element, stylePrefix + "Top");
    var bottom = goog.style.getComputedStyle(element, stylePrefix + "Bottom");
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left))
  }
};
goog.style.getPaddingBox = function(element) {
  return goog.style.getBox_(element, "padding")
};
goog.style.getMarginBox = function(element) {
  return goog.style.getBox_(element, "margin")
};
goog.style.ieBorderWidthKeywords_ = {"thin":2, "medium":4, "thick":6};
goog.style.getIePixelBorder_ = function(element, prop) {
  if(goog.style.getCascadedStyle(element, prop + "Style") == "none") {
    return 0
  }
  var width = goog.style.getCascadedStyle(element, prop + "Width");
  if(width in goog.style.ieBorderWidthKeywords_) {
    return goog.style.ieBorderWidthKeywords_[width]
  }
  return goog.style.getIePixelValue_(element, width, "left", "pixelLeft")
};
goog.style.getBorderBox = function(element) {
  if(goog.userAgent.IE) {
    var left = goog.style.getIePixelBorder_(element, "borderLeft");
    var right = goog.style.getIePixelBorder_(element, "borderRight");
    var top = goog.style.getIePixelBorder_(element, "borderTop");
    var bottom = goog.style.getIePixelBorder_(element, "borderBottom");
    return new goog.math.Box(top, right, bottom, left)
  }else {
    var left = goog.style.getComputedStyle(element, "borderLeftWidth");
    var right = goog.style.getComputedStyle(element, "borderRightWidth");
    var top = goog.style.getComputedStyle(element, "borderTopWidth");
    var bottom = goog.style.getComputedStyle(element, "borderBottomWidth");
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left))
  }
};
goog.style.getFontFamily = function(el) {
  var doc = goog.dom.getOwnerDocument(el);
  var font = "";
  if(doc.body.createTextRange) {
    var range = doc.body.createTextRange();
    range.moveToElementText(el);
    try {
      font = range.queryCommandValue("FontName")
    }catch(e) {
      font = ""
    }
  }
  if(!font) {
    font = goog.style.getStyle_(el, "fontFamily")
  }
  var fontsArray = font.split(",");
  if(fontsArray.length > 1) {
    font = fontsArray[0]
  }
  return goog.string.stripQuotes(font, "\"'")
};
goog.style.lengthUnitRegex_ = /[^\d]+$/;
goog.style.getLengthUnits = function(value) {
  var units = value.match(goog.style.lengthUnitRegex_);
  return units && units[0] || null
};
goog.style.ABSOLUTE_CSS_LENGTH_UNITS_ = {"cm":1, "in":1, "mm":1, "pc":1, "pt":1};
goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_ = {"em":1, "ex":1};
goog.style.getFontSize = function(el) {
  var fontSize = goog.style.getStyle_(el, "fontSize");
  var sizeUnits = goog.style.getLengthUnits(fontSize);
  if(fontSize && "px" == sizeUnits) {
    return parseInt(fontSize, 10)
  }
  if(goog.userAgent.IE) {
    if(sizeUnits in goog.style.ABSOLUTE_CSS_LENGTH_UNITS_) {
      return goog.style.getIePixelValue_(el, fontSize, "left", "pixelLeft")
    }else {
      if(el.parentNode && el.parentNode.nodeType == goog.dom.NodeType.ELEMENT && sizeUnits in goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_) {
        var parentElement = el.parentNode;
        var parentSize = goog.style.getStyle_(parentElement, "fontSize");
        return goog.style.getIePixelValue_(parentElement, fontSize == parentSize ? "1em" : fontSize, "left", "pixelLeft")
      }
    }
  }
  var sizeElement = goog.dom.createDom("span", {"style":"visibility:hidden;position:absolute;" + "line-height:0;padding:0;margin:0;border:0;height:1em;"});
  goog.dom.appendChild(el, sizeElement);
  fontSize = sizeElement.offsetHeight;
  goog.dom.removeNode(sizeElement);
  return fontSize
};
goog.style.parseStyleAttribute = function(value) {
  var result = {};
  goog.array.forEach(value.split(/\s*;\s*/), function(pair) {
    var keyValue = pair.split(/\s*:\s*/);
    if(keyValue.length == 2) {
      result[goog.string.toCamelCase(keyValue[0].toLowerCase())] = keyValue[1]
    }
  });
  return result
};
goog.style.toStyleAttribute = function(obj) {
  var buffer = [];
  goog.object.forEach(obj, function(value, key) {
    buffer.push(goog.string.toSelectorCase(key), ":", value, ";")
  });
  return buffer.join("")
};
goog.style.setFloat = function(el, value) {
  el.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] = value
};
goog.style.getFloat = function(el) {
  return el.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] || ""
};
goog.style.getScrollbarWidth = function(opt_className) {
  var outerDiv = goog.dom.createElement("div");
  if(opt_className) {
    outerDiv.className = opt_className
  }
  outerDiv.style.cssText = "visiblity:hidden;overflow:auto;" + "position:absolute;top:0;width:100px;height:100px";
  var innerDiv = goog.dom.createElement("div");
  goog.style.setSize(innerDiv, "200px", "200px");
  outerDiv.appendChild(innerDiv);
  goog.dom.appendChild(goog.dom.getDocument().body, outerDiv);
  var width = outerDiv.offsetWidth - outerDiv.clientWidth;
  goog.dom.removeNode(outerDiv);
  return width
};
goog.provide("goog.iter");
goog.provide("goog.iter.Iterator");
goog.provide("goog.iter.StopIteration");
goog.require("goog.array");
goog.require("goog.asserts");
goog.iter.Iterable;
if("StopIteration" in goog.global) {
  goog.iter.StopIteration = goog.global["StopIteration"]
}else {
  goog.iter.StopIteration = Error("StopIteration")
}
goog.iter.Iterator = function() {
};
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this
};
goog.iter.toIterator = function(iterable) {
  if(iterable instanceof goog.iter.Iterator) {
    return iterable
  }
  if(typeof iterable.__iterator__ == "function") {
    return iterable.__iterator__(false)
  }
  if(goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while(true) {
        if(i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        if(!(i in iterable)) {
          i++;
          continue
        }
        return iterable[i++]
      }
    };
    return newIter
  }
  throw Error("Not implemented");
};
goog.iter.forEach = function(iterable, f, opt_obj) {
  if(goog.isArrayLike(iterable)) {
    try {
      goog.array.forEach(iterable, f, opt_obj)
    }catch(ex) {
      if(ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }else {
    iterable = goog.iter.toIterator(iterable);
    try {
      while(true) {
        f.call(opt_obj, iterable.next(), undefined, iterable)
      }
    }catch(ex) {
      if(ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }
};
goog.iter.filter = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      var val = iterable.next();
      if(f.call(opt_obj, val, undefined, iterable)) {
        return val
      }
    }
  };
  return newIter
};
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0;
  var stop = startOrStop;
  var step = opt_step || 1;
  if(arguments.length > 1) {
    start = startOrStop;
    stop = opt_stop
  }
  if(step == 0) {
    throw Error("Range step argument must not be zero");
  }
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if(step > 0 && start >= stop || step < 0 && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv
  };
  return newIter
};
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator)
};
goog.iter.map = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      var val = iterable.next();
      return f.call(opt_obj, val, undefined, iterable)
    }
  };
  return newIter
};
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  var rval = val;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val)
  });
  return rval
};
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while(true) {
      if(f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return true
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return false
};
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while(true) {
      if(!f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return false
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return true
};
goog.iter.chain = function(var_args) {
  var args = arguments;
  var length = args.length;
  var i = 0;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    try {
      if(i >= length) {
        throw goog.iter.StopIteration;
      }
      var current = goog.iter.toIterator(args[i]);
      return current.next()
    }catch(ex) {
      if(ex !== goog.iter.StopIteration || i >= length) {
        throw ex;
      }else {
        i++;
        return this.next()
      }
    }
  };
  return newIter
};
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var dropping = true;
  newIter.next = function() {
    while(true) {
      var val = iterable.next();
      if(dropping && f.call(opt_obj, val, undefined, iterable)) {
        continue
      }else {
        dropping = false
      }
      return val
    }
  };
  return newIter
};
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var taking = true;
  newIter.next = function() {
    while(true) {
      if(taking) {
        var val = iterable.next();
        if(f.call(opt_obj, val, undefined, iterable)) {
          return val
        }else {
          taking = false
        }
      }else {
        throw goog.iter.StopIteration;
      }
    }
  };
  return newIter
};
goog.iter.toArray = function(iterable) {
  if(goog.isArrayLike(iterable)) {
    return goog.array.toArray(iterable)
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val)
  });
  return array
};
goog.iter.equals = function(iterable1, iterable2) {
  iterable1 = goog.iter.toIterator(iterable1);
  iterable2 = goog.iter.toIterator(iterable2);
  var b1, b2;
  try {
    while(true) {
      b1 = b2 = false;
      var val1 = iterable1.next();
      b1 = true;
      var val2 = iterable2.next();
      b2 = true;
      if(val1 != val2) {
        return false
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }else {
      if(b1 && !b2) {
        return false
      }
      if(!b2) {
        try {
          val2 = iterable2.next();
          return false
        }catch(ex1) {
          if(ex1 !== goog.iter.StopIteration) {
            throw ex1;
          }
          return true
        }
      }
    }
  }
  return false
};
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next()
  }catch(e) {
    if(e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue
  }
};
goog.iter.product = function(var_args) {
  var someArrayEmpty = goog.array.some(arguments, function(arr) {
    return!arr.length
  });
  if(someArrayEmpty || !arguments.length) {
    return new goog.iter.Iterator
  }
  var iter = new goog.iter.Iterator;
  var arrays = arguments;
  var indicies = goog.array.repeat(0, arrays.length);
  iter.next = function() {
    if(indicies) {
      var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) {
        return arrays[arrayIndex][valueIndex]
      });
      for(var i = indicies.length - 1;i >= 0;i--) {
        goog.asserts.assert(indicies);
        if(indicies[i] < arrays[i].length - 1) {
          indicies[i]++;
          break
        }
        if(i == 0) {
          indicies = null;
          break
        }
        indicies[i] = 0
      }
      return retVal
    }
    throw goog.iter.StopIteration;
  };
  return iter
};
goog.iter.cycle = function(iterable) {
  var baseIterator = goog.iter.toIterator(iterable);
  var cache = [];
  var cacheIndex = 0;
  var iter = new goog.iter.Iterator;
  var useCache = false;
  iter.next = function() {
    var returnElement = null;
    if(!useCache) {
      try {
        returnElement = baseIterator.next();
        cache.push(returnElement);
        return returnElement
      }catch(e) {
        if(e != goog.iter.StopIteration || goog.array.isEmpty(cache)) {
          throw e;
        }
        useCache = true
      }
    }
    returnElement = cache[cacheIndex];
    cacheIndex = (cacheIndex + 1) % cache.length;
    return returnElement
  };
  return iter
};
goog.provide("goog.structs");
goog.require("goog.array");
goog.require("goog.object");
goog.structs.getCount = function(col) {
  if(typeof col.getCount == "function") {
    return col.getCount()
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return col.length
  }
  return goog.object.getCount(col)
};
goog.structs.getValues = function(col) {
  if(typeof col.getValues == "function") {
    return col.getValues()
  }
  if(goog.isString(col)) {
    return col.split("")
  }
  if(goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for(var i = 0;i < l;i++) {
      rv.push(col[i])
    }
    return rv
  }
  return goog.object.getValues(col)
};
goog.structs.getKeys = function(col) {
  if(typeof col.getKeys == "function") {
    return col.getKeys()
  }
  if(typeof col.getValues == "function") {
    return undefined
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for(var i = 0;i < l;i++) {
      rv.push(i)
    }
    return rv
  }
  return goog.object.getKeys(col)
};
goog.structs.contains = function(col, val) {
  if(typeof col.contains == "function") {
    return col.contains(val)
  }
  if(typeof col.containsValue == "function") {
    return col.containsValue(val)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains(col, val)
  }
  return goog.object.containsValue(col, val)
};
goog.structs.isEmpty = function(col) {
  if(typeof col.isEmpty == "function") {
    return col.isEmpty()
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty(col)
  }
  return goog.object.isEmpty(col)
};
goog.structs.clear = function(col) {
  if(typeof col.clear == "function") {
    col.clear()
  }else {
    if(goog.isArrayLike(col)) {
      goog.array.clear(col)
    }else {
      goog.object.clear(col)
    }
  }
};
goog.structs.forEach = function(col, f, opt_obj) {
  if(typeof col.forEach == "function") {
    col.forEach(f, opt_obj)
  }else {
    if(goog.isArrayLike(col) || goog.isString(col)) {
      goog.array.forEach(col, f, opt_obj)
    }else {
      var keys = goog.structs.getKeys(col);
      var values = goog.structs.getValues(col);
      var l = values.length;
      for(var i = 0;i < l;i++) {
        f.call(opt_obj, values[i], keys && keys[i], col)
      }
    }
  }
};
goog.structs.filter = function(col, f, opt_obj) {
  if(typeof col.filter == "function") {
    return col.filter(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter(col, f, opt_obj)
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if(keys) {
    rv = {};
    for(var i = 0;i < l;i++) {
      if(f.call(opt_obj, values[i], keys[i], col)) {
        rv[keys[i]] = values[i]
      }
    }
  }else {
    rv = [];
    for(var i = 0;i < l;i++) {
      if(f.call(opt_obj, values[i], undefined, col)) {
        rv.push(values[i])
      }
    }
  }
  return rv
};
goog.structs.map = function(col, f, opt_obj) {
  if(typeof col.map == "function") {
    return col.map(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map(col, f, opt_obj)
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if(keys) {
    rv = {};
    for(var i = 0;i < l;i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col)
    }
  }else {
    rv = [];
    for(var i = 0;i < l;i++) {
      rv[i] = f.call(opt_obj, values[i], undefined, col)
    }
  }
  return rv
};
goog.structs.some = function(col, f, opt_obj) {
  if(typeof col.some == "function") {
    return col.some(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some(col, f, opt_obj)
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    if(f.call(opt_obj, values[i], keys && keys[i], col)) {
      return true
    }
  }
  return false
};
goog.structs.every = function(col, f, opt_obj) {
  if(typeof col.every == "function") {
    return col.every(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every(col, f, opt_obj)
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    if(!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return false
    }
  }
  return true
};
goog.provide("goog.structs.Map");
goog.require("goog.iter.Iterator");
goog.require("goog.iter.StopIteration");
goog.require("goog.object");
goog.require("goog.structs");
goog.structs.Map = function(opt_map, var_args) {
  this.map_ = {};
  this.keys_ = [];
  var argLength = arguments.length;
  if(argLength > 1) {
    if(argLength % 2) {
      throw Error("Uneven number of arguments");
    }
    for(var i = 0;i < argLength;i += 2) {
      this.set(arguments[i], arguments[i + 1])
    }
  }else {
    if(opt_map) {
      this.addAll(opt_map)
    }
  }
};
goog.structs.Map.prototype.count_ = 0;
goog.structs.Map.prototype.version_ = 0;
goog.structs.Map.prototype.getCount = function() {
  return this.count_
};
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();
  var rv = [];
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key])
  }
  return rv
};
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return this.keys_.concat()
};
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key)
};
goog.structs.Map.prototype.containsValue = function(val) {
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    if(goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true
    }
  }
  return false
};
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if(this === otherMap) {
    return true
  }
  if(this.count_ != otherMap.getCount()) {
    return false
  }
  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;
  this.cleanupKeysArray_();
  for(var key, i = 0;key = this.keys_[i];i++) {
    if(!equalityFn(this.get(key), otherMap.get(key))) {
      return false
    }
  }
  return true
};
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b
};
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0
};
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0
};
goog.structs.Map.prototype.remove = function(key) {
  if(goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;
    if(this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_()
    }
    return true
  }
  return false
};
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if(this.count_ != this.keys_.length) {
    var srcIndex = 0;
    var destIndex = 0;
    while(srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if(goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key
      }
      srcIndex++
    }
    this.keys_.length = destIndex
  }
  if(this.count_ != this.keys_.length) {
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while(srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if(!goog.structs.Map.hasKey_(seen, key)) {
        this.keys_[destIndex++] = key;
        seen[key] = 1
      }
      srcIndex++
    }
    this.keys_.length = destIndex
  }
};
goog.structs.Map.prototype.get = function(key, opt_val) {
  if(goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key]
  }
  return opt_val
};
goog.structs.Map.prototype.set = function(key, value) {
  if(!goog.structs.Map.hasKey_(this.map_, key)) {
    this.count_++;
    this.keys_.push(key);
    this.version_++
  }
  this.map_[key] = value
};
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if(map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues()
  }else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map)
  }
  for(var i = 0;i < keys.length;i++) {
    this.set(keys[i], values[i])
  }
};
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this)
};
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map;
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key)
  }
  return transposed
};
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  var obj = {};
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key]
  }
  return obj
};
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true)
};
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false)
};
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  this.cleanupKeysArray_();
  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      if(version != selfObj.version_) {
        throw Error("The map has changed since the iterator was created");
      }
      if(i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key]
    }
  };
  return newIter
};
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
};
goog.provide("goog.dom.forms");
goog.require("goog.structs.Map");
goog.dom.forms.getFormDataMap = function(form) {
  var map = new goog.structs.Map;
  goog.dom.forms.getFormDataHelper_(form, map, goog.dom.forms.addFormDataToMap_);
  return map
};
goog.dom.forms.getFormDataString = function(form) {
  var sb = [];
  goog.dom.forms.getFormDataHelper_(form, sb, goog.dom.forms.addFormDataToStringBuffer_);
  return sb.join("&")
};
goog.dom.forms.getFormDataHelper_ = function(form, result, fnAppend) {
  var els = form.elements;
  for(var el, i = 0;el = els[i];i++) {
    if(el.disabled || el.tagName.toLowerCase() == "fieldset") {
      continue
    }
    var name = el.name;
    var type = el.type.toLowerCase();
    switch(type) {
      case "file":
      ;
      case "submit":
      ;
      case "reset":
      ;
      case "button":
        break;
      case "select-multiple":
        var values = goog.dom.forms.getValue(el);
        if(values != null) {
          for(var value, j = 0;value = values[j];j++) {
            fnAppend(result, name, value)
          }
        }
        break;
      default:
        var value = goog.dom.forms.getValue(el);
        if(value != null) {
          fnAppend(result, name, value)
        }
    }
  }
  var inputs = form.getElementsByTagName("input");
  for(var input, i = 0;input = inputs[i];i++) {
    if(input.form == form && input.type.toLowerCase() == "image") {
      name = input.name;
      fnAppend(result, name, input.value);
      fnAppend(result, name + ".x", "0");
      fnAppend(result, name + ".y", "0")
    }
  }
};
goog.dom.forms.addFormDataToMap_ = function(map, name, value) {
  var array = map.get(name);
  if(!array) {
    array = [];
    map.set(name, array)
  }
  array.push(value)
};
goog.dom.forms.addFormDataToStringBuffer_ = function(sb, name, value) {
  sb.push(encodeURIComponent(name) + "=" + encodeURIComponent(value))
};
goog.dom.forms.hasFileInput = function(form) {
  var els = form.elements;
  for(var el, i = 0;el = els[i];i++) {
    if(!el.disabled && el.type && el.type.toLowerCase() == "file") {
      return true
    }
  }
  return false
};
goog.dom.forms.setDisabled = function(el, disabled) {
  if(el.tagName == "FORM") {
    var els = el.elements;
    for(var i = 0;el = els[i];i++) {
      goog.dom.forms.setDisabled(el, disabled)
    }
  }else {
    if(disabled == true) {
      el.blur()
    }
    el.disabled = disabled
  }
};
goog.dom.forms.focusAndSelect = function(el) {
  el.focus();
  if(el.select) {
    el.select()
  }
};
goog.dom.forms.hasValue = function(el) {
  var value = goog.dom.forms.getValue(el);
  return!!value
};
goog.dom.forms.hasValueByName = function(form, name) {
  var value = goog.dom.forms.getValueByName(form, name);
  return!!value
};
goog.dom.forms.getValue = function(el) {
  var type = el.type;
  if(!goog.isDef(type)) {
    return null
  }
  switch(type.toLowerCase()) {
    case "checkbox":
    ;
    case "radio":
      return goog.dom.forms.getInputChecked_(el);
    case "select-one":
      return goog.dom.forms.getSelectSingle_(el);
    case "select-multiple":
      return goog.dom.forms.getSelectMultiple_(el);
    default:
      return goog.isDef(el.value) ? el.value : null
  }
};
goog.dom.$F = goog.dom.forms.getValue;
goog.dom.forms.getValueByName = function(form, name) {
  var els = form.elements[name];
  if(els.type) {
    return goog.dom.forms.getValue(els)
  }else {
    for(var i = 0;i < els.length;i++) {
      var val = goog.dom.forms.getValue(els[i]);
      if(val) {
        return val
      }
    }
    return null
  }
};
goog.dom.forms.getInputChecked_ = function(el) {
  return el.checked ? el.value : null
};
goog.dom.forms.getSelectSingle_ = function(el) {
  var selectedIndex = el.selectedIndex;
  return selectedIndex >= 0 ? el.options[selectedIndex].value : null
};
goog.dom.forms.getSelectMultiple_ = function(el) {
  var values = [];
  for(var option, i = 0;option = el.options[i];i++) {
    if(option.selected) {
      values.push(option.value)
    }
  }
  return values.length ? values : null
};
goog.dom.forms.setValue = function(el, opt_value) {
  var type = el.type;
  if(goog.isDef(type)) {
    switch(type.toLowerCase()) {
      case "checkbox":
      ;
      case "radio":
        goog.dom.forms.setInputChecked_(el, opt_value);
        break;
      case "select-one":
        goog.dom.forms.setSelectSingle_(el, opt_value);
        break;
      case "select-multiple":
        goog.dom.forms.setSelectMultiple_(el, opt_value);
        break;
      default:
        el.value = goog.isDefAndNotNull(opt_value) ? opt_value : ""
    }
  }
};
goog.dom.forms.setInputChecked_ = function(el, opt_value) {
  el.checked = opt_value ? "checked" : null
};
goog.dom.forms.setSelectSingle_ = function(el, opt_value) {
  el.selectedIndex = -1;
  if(goog.isString(opt_value)) {
    for(var option, i = 0;option = el.options[i];i++) {
      if(option.value == opt_value) {
        option.selected = true;
        break
      }
    }
  }
};
goog.dom.forms.setSelectMultiple_ = function(el, opt_value) {
  if(goog.isString(opt_value)) {
    opt_value = [opt_value]
  }
  for(var option, i = 0;option = el.options[i];i++) {
    option.selected = false;
    if(opt_value) {
      for(var value, j = 0;value = opt_value[j];j++) {
        if(option.value == value) {
          option.selected = true
        }
      }
    }
  }
};
goog.provide("singult.core");
goog.require("cljs.core");
goog.require("singult.coffee");
singult.core.Unify = function(data, mapping, key_fn, enter, update, exit, force_update_QMARK_, __meta, __extmap) {
  this.data = data;
  this.mapping = mapping;
  this.key_fn = key_fn;
  this.enter = enter;
  this.update = update;
  this.exit = exit;
  this.force_update_QMARK_ = force_update_QMARK_;
  this.__meta = __meta;
  this.__extmap = __extmap;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 619054858;
  if(arguments.length > 7) {
    this.__meta = __meta;
    this.__extmap = __extmap
  }else {
    this.__meta = null;
    this.__extmap = null
  }
};
singult.core.Unify.prototype.cljs$core$IHash$_hash$arity$1 = function(this__2318__auto__) {
  var this__8483 = this;
  var h__2192__auto____8484 = this__8483.__hash;
  if(!(h__2192__auto____8484 == null)) {
    return h__2192__auto____8484
  }else {
    var h__2192__auto____8485 = cljs.core.hash_imap.call(null, this__2318__auto__);
    this__8483.__hash = h__2192__auto____8485;
    return h__2192__auto____8485
  }
};
singult.core.Unify.prototype.cljs$core$ILookup$_lookup$arity$2 = function(this__2323__auto__, k__2324__auto__) {
  var this__8486 = this;
  return this__2323__auto__.cljs$core$ILookup$_lookup$arity$3(this__2323__auto__, k__2324__auto__, null)
};
singult.core.Unify.prototype.cljs$core$ILookup$_lookup$arity$3 = function(this__2325__auto__, k8481, else__2326__auto__) {
  var this__8487 = this;
  if(k8481 === "\ufdd0'data") {
    return this__8487.data
  }else {
    if(k8481 === "\ufdd0'mapping") {
      return this__8487.mapping
    }else {
      if(k8481 === "\ufdd0'key-fn") {
        return this__8487.key_fn
      }else {
        if(k8481 === "\ufdd0'enter") {
          return this__8487.enter
        }else {
          if(k8481 === "\ufdd0'update") {
            return this__8487.update
          }else {
            if(k8481 === "\ufdd0'exit") {
              return this__8487.exit
            }else {
              if(k8481 === "\ufdd0'force-update?") {
                return this__8487.force_update_QMARK_
              }else {
                if("\ufdd0'else") {
                  return cljs.core._lookup.call(null, this__8487.__extmap, k8481, else__2326__auto__)
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
singult.core.Unify.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(this__2330__auto__, k__2331__auto__, G__8480) {
  var this__8488 = this;
  var pred__8489__8492 = cljs.core.identical_QMARK_;
  var expr__8490__8493 = k__2331__auto__;
  if(pred__8489__8492.call(null, "\ufdd0'data", expr__8490__8493)) {
    return new singult.core.Unify(G__8480, this__8488.mapping, this__8488.key_fn, this__8488.enter, this__8488.update, this__8488.exit, this__8488.force_update_QMARK_, this__8488.__meta, this__8488.__extmap, null)
  }else {
    if(pred__8489__8492.call(null, "\ufdd0'mapping", expr__8490__8493)) {
      return new singult.core.Unify(this__8488.data, G__8480, this__8488.key_fn, this__8488.enter, this__8488.update, this__8488.exit, this__8488.force_update_QMARK_, this__8488.__meta, this__8488.__extmap, null)
    }else {
      if(pred__8489__8492.call(null, "\ufdd0'key-fn", expr__8490__8493)) {
        return new singult.core.Unify(this__8488.data, this__8488.mapping, G__8480, this__8488.enter, this__8488.update, this__8488.exit, this__8488.force_update_QMARK_, this__8488.__meta, this__8488.__extmap, null)
      }else {
        if(pred__8489__8492.call(null, "\ufdd0'enter", expr__8490__8493)) {
          return new singult.core.Unify(this__8488.data, this__8488.mapping, this__8488.key_fn, G__8480, this__8488.update, this__8488.exit, this__8488.force_update_QMARK_, this__8488.__meta, this__8488.__extmap, null)
        }else {
          if(pred__8489__8492.call(null, "\ufdd0'update", expr__8490__8493)) {
            return new singult.core.Unify(this__8488.data, this__8488.mapping, this__8488.key_fn, this__8488.enter, G__8480, this__8488.exit, this__8488.force_update_QMARK_, this__8488.__meta, this__8488.__extmap, null)
          }else {
            if(pred__8489__8492.call(null, "\ufdd0'exit", expr__8490__8493)) {
              return new singult.core.Unify(this__8488.data, this__8488.mapping, this__8488.key_fn, this__8488.enter, this__8488.update, G__8480, this__8488.force_update_QMARK_, this__8488.__meta, this__8488.__extmap, null)
            }else {
              if(pred__8489__8492.call(null, "\ufdd0'force-update?", expr__8490__8493)) {
                return new singult.core.Unify(this__8488.data, this__8488.mapping, this__8488.key_fn, this__8488.enter, this__8488.update, this__8488.exit, G__8480, this__8488.__meta, this__8488.__extmap, null)
              }else {
                return new singult.core.Unify(this__8488.data, this__8488.mapping, this__8488.key_fn, this__8488.enter, this__8488.update, this__8488.exit, this__8488.force_update_QMARK_, this__8488.__meta, cljs.core.assoc.call(null, this__8488.__extmap, k__2331__auto__, G__8480), null)
              }
            }
          }
        }
      }
    }
  }
};
singult.core.Unify.prototype.cljs$core$ICollection$_conj$arity$2 = function(this__2328__auto__, entry__2329__auto__) {
  var this__8494 = this;
  if(cljs.core.vector_QMARK_.call(null, entry__2329__auto__)) {
    return this__2328__auto__.cljs$core$IAssociative$_assoc$arity$3(this__2328__auto__, cljs.core._nth.call(null, entry__2329__auto__, 0), cljs.core._nth.call(null, entry__2329__auto__, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, this__2328__auto__, entry__2329__auto__)
  }
};
singult.core.Unify.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this__2335__auto__) {
  var this__8495 = this;
  return cljs.core.seq.call(null, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'data", this__8495.data), cljs.core.vector.call(null, "\ufdd0'mapping", this__8495.mapping), cljs.core.vector.call(null, "\ufdd0'key-fn", this__8495.key_fn), cljs.core.vector.call(null, "\ufdd0'enter", this__8495.enter), cljs.core.vector.call(null, "\ufdd0'update", this__8495.update), cljs.core.vector.call(null, "\ufdd0'exit", this__8495.exit), cljs.core.vector.call(null, 
  "\ufdd0'force-update?", this__8495.force_update_QMARK_)], true), this__8495.__extmap))
};
singult.core.Unify.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(this__2337__auto__, opts__2338__auto__) {
  var this__8496 = this;
  var pr_pair__2339__auto____8497 = function(keyval__2340__auto__) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts__2338__auto__, keyval__2340__auto__)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__2339__auto____8497, [cljs.core.str("#"), cljs.core.str("Unify"), cljs.core.str("{")].join(""), ", ", "}", opts__2338__auto__, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'data", this__8496.data), cljs.core.vector.call(null, "\ufdd0'mapping", this__8496.mapping), cljs.core.vector.call(null, "\ufdd0'key-fn", this__8496.key_fn), cljs.core.vector.call(null, "\ufdd0'enter", this__8496.enter), 
  cljs.core.vector.call(null, "\ufdd0'update", this__8496.update), cljs.core.vector.call(null, "\ufdd0'exit", this__8496.exit), cljs.core.vector.call(null, "\ufdd0'force-update?", this__8496.force_update_QMARK_)], true), this__8496.__extmap))
};
singult.core.Unify.prototype.cljs$core$ICounted$_count$arity$1 = function(this__2327__auto__) {
  var this__8498 = this;
  return 7 + cljs.core.count.call(null, this__8498.__extmap)
};
singult.core.Unify.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(this__2319__auto__, other__2320__auto__) {
  var this__8499 = this;
  if(cljs.core.truth_(function() {
    var and__3822__auto____8500 = other__2320__auto__;
    if(cljs.core.truth_(and__3822__auto____8500)) {
      var and__3822__auto____8501 = this__2319__auto__.constructor === other__2320__auto__.constructor;
      if(and__3822__auto____8501) {
        return cljs.core.equiv_map.call(null, this__2319__auto__, other__2320__auto__)
      }else {
        return and__3822__auto____8501
      }
    }else {
      return and__3822__auto____8500
    }
  }())) {
    return true
  }else {
    return false
  }
};
singult.core.Unify.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(this__2322__auto__, G__8480) {
  var this__8502 = this;
  return new singult.core.Unify(this__8502.data, this__8502.mapping, this__8502.key_fn, this__8502.enter, this__8502.update, this__8502.exit, this__8502.force_update_QMARK_, G__8480, this__8502.__extmap, this__8502.__hash)
};
singult.core.Unify.prototype.cljs$core$IMeta$_meta$arity$1 = function(this__2321__auto__) {
  var this__8503 = this;
  return this__8503.__meta
};
singult.core.Unify.prototype.cljs$core$IMap$_dissoc$arity$2 = function(this__2332__auto__, k__2333__auto__) {
  var this__8504 = this;
  if(cljs.core.contains_QMARK_.call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'data", "\ufdd0'force-update?", "\ufdd0'enter", "\ufdd0'exit", "\ufdd0'key-fn", "\ufdd0'update", "\ufdd0'mapping"]), k__2333__auto__)) {
    return cljs.core.dissoc.call(null, cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, this__2332__auto__), this__8504.__meta), k__2333__auto__)
  }else {
    return new singult.core.Unify(this__8504.data, this__8504.mapping, this__8504.key_fn, this__8504.enter, this__8504.update, this__8504.exit, this__8504.force_update_QMARK_, this__8504.__meta, cljs.core.not_empty.call(null, cljs.core.dissoc.call(null, this__8504.__extmap, k__2333__auto__)), null)
  }
};
singult.core.Unify.cljs$lang$type = true;
singult.core.Unify.cljs$lang$ctorPrSeq = function(this__2357__auto__) {
  return cljs.core.list.call(null, "singult.core/Unify")
};
singult.core.__GT_Unify = function __GT_Unify(data, mapping, key_fn, enter, update, exit, force_update_QMARK_) {
  return new singult.core.Unify(data, mapping, key_fn, enter, update, exit, force_update_QMARK_)
};
singult.core.map__GT_Unify = function map__GT_Unify(G__8482) {
  return new singult.core.Unify((new cljs.core.Keyword("\ufdd0'data")).call(null, G__8482), (new cljs.core.Keyword("\ufdd0'mapping")).call(null, G__8482), (new cljs.core.Keyword("\ufdd0'key-fn")).call(null, G__8482), (new cljs.core.Keyword("\ufdd0'enter")).call(null, G__8482), (new cljs.core.Keyword("\ufdd0'update")).call(null, G__8482), (new cljs.core.Keyword("\ufdd0'exit")).call(null, G__8482), (new cljs.core.Keyword("\ufdd0'force-update?")).call(null, G__8482), null, cljs.core.dissoc.call(null, 
  G__8482, "\ufdd0'data", "\ufdd0'mapping", "\ufdd0'key-fn", "\ufdd0'enter", "\ufdd0'update", "\ufdd0'exit", "\ufdd0'force-update?"))
};
singult.core.Unify;
singult.core.clj__GT_js = function clj__GT_js(x) {
  if(cljs.core.instance_QMARK_.call(null, singult.core.Unify, x)) {
    var map__8551__8552 = x;
    var map__8551__8553 = cljs.core.seq_QMARK_.call(null, map__8551__8552) ? cljs.core.apply.call(null, cljs.core.hash_map, map__8551__8552) : map__8551__8552;
    var force_update_QMARK___8554 = cljs.core._lookup.call(null, map__8551__8553, "\ufdd0'force-update?", null);
    var exit__8555 = cljs.core._lookup.call(null, map__8551__8553, "\ufdd0'exit", null);
    var update__8556 = cljs.core._lookup.call(null, map__8551__8553, "\ufdd0'update", null);
    var enter__8557 = cljs.core._lookup.call(null, map__8551__8553, "\ufdd0'enter", null);
    var key_fn__8558 = cljs.core._lookup.call(null, map__8551__8553, "\ufdd0'key-fn", null);
    var mapping__8559 = cljs.core._lookup.call(null, map__8551__8553, "\ufdd0'mapping", null);
    var data__8560 = cljs.core._lookup.call(null, map__8551__8553, "\ufdd0'data", null);
    var data_arr__8568 = function() {
      var a__8561 = [];
      var G__8562__8563 = cljs.core.seq.call(null, data__8560);
      if(G__8562__8563) {
        var d__8564 = cljs.core.first.call(null, G__8562__8563);
        var G__8562__8565 = G__8562__8563;
        while(true) {
          a__8561.push(d__8564);
          var temp__3974__auto____8566 = cljs.core.next.call(null, G__8562__8565);
          if(temp__3974__auto____8566) {
            var G__8562__8567 = temp__3974__auto____8566;
            var G__8597 = cljs.core.first.call(null, G__8562__8567);
            var G__8598 = G__8562__8567;
            d__8564 = G__8597;
            G__8562__8565 = G__8598;
            continue
          }else {
          }
          break
        }
      }else {
      }
      return a__8561
    }();
    return new singult.coffee.Unify(data_arr__8568, function(p1__8479_SHARP_) {
      return clj__GT_js.call(null, mapping__8559.call(null, p1__8479_SHARP_))
    }, key_fn__8558, enter__8557, update__8556, exit__8555, force_update_QMARK___8554)
  }else {
    if(cljs.core.keyword_QMARK_.call(null, x)) {
      return cljs.core.name.call(null, x)
    }else {
      if(cljs.core.map_QMARK_.call(null, x)) {
        var o__8569 = {};
        var G__8570__8571 = cljs.core.seq.call(null, x);
        if(G__8570__8571) {
          var G__8573__8575 = cljs.core.first.call(null, G__8570__8571);
          var vec__8574__8576 = G__8573__8575;
          var k__8577 = cljs.core.nth.call(null, vec__8574__8576, 0, null);
          var v__8578 = cljs.core.nth.call(null, vec__8574__8576, 1, null);
          var G__8570__8579 = G__8570__8571;
          var G__8573__8580 = G__8573__8575;
          var G__8570__8581 = G__8570__8579;
          while(true) {
            var vec__8582__8583 = G__8573__8580;
            var k__8584 = cljs.core.nth.call(null, vec__8582__8583, 0, null);
            var v__8585 = cljs.core.nth.call(null, vec__8582__8583, 1, null);
            var G__8570__8586 = G__8570__8581;
            var key__8587 = clj__GT_js.call(null, k__8584);
            if(cljs.core.string_QMARK_.call(null, key__8587)) {
            }else {
              throw"Cannot convert; JavaScript map keys must be strings";
            }
            o__8569[key__8587] = clj__GT_js.call(null, v__8585);
            var temp__3974__auto____8588 = cljs.core.next.call(null, G__8570__8586);
            if(temp__3974__auto____8588) {
              var G__8570__8589 = temp__3974__auto____8588;
              var G__8599 = cljs.core.first.call(null, G__8570__8589);
              var G__8600 = G__8570__8589;
              G__8573__8580 = G__8599;
              G__8570__8581 = G__8600;
              continue
            }else {
            }
            break
          }
        }else {
        }
        return o__8569
      }else {
        if(cljs.core.coll_QMARK_.call(null, x)) {
          var a__8590 = [];
          var G__8591__8592 = cljs.core.seq.call(null, x);
          if(G__8591__8592) {
            var item__8593 = cljs.core.first.call(null, G__8591__8592);
            var G__8591__8594 = G__8591__8592;
            while(true) {
              a__8590.push(clj__GT_js.call(null, item__8593));
              var temp__3974__auto____8595 = cljs.core.next.call(null, G__8591__8594);
              if(temp__3974__auto____8595) {
                var G__8591__8596 = temp__3974__auto____8595;
                var G__8601 = cljs.core.first.call(null, G__8591__8596);
                var G__8602 = G__8591__8596;
                item__8593 = G__8601;
                G__8591__8594 = G__8602;
                continue
              }else {
              }
              break
            }
          }else {
          }
          return a__8590
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
singult.core.node_data = singult.coffee.node_data;
singult.core.attr = function attr($n, m) {
  return singult.coffee.attr.call(null, $n, singult.core.clj__GT_js.call(null, m))
};
singult.core.render = function render(v) {
  return singult.coffee.render.call(null, singult.coffee.canonicalize.call(null, singult.core.clj__GT_js.call(null, v)))
};
singult.core.merge_BANG_ = function merge_BANG_($n, v) {
  if(v == null) {
    return null
  }else {
    return singult.coffee.merge.call(null, $n, singult.coffee.canonicalize.call(null, singult.core.clj__GT_js.call(null, v)))
  }
};
singult.core.unify = function() {
  var unify__delegate = function(data, mapping, p__8603) {
    var map__8612__8613 = p__8603;
    var map__8612__8614 = cljs.core.seq_QMARK_.call(null, map__8612__8613) ? cljs.core.apply.call(null, cljs.core.hash_map, map__8612__8613) : map__8612__8613;
    var force_update_QMARK___8615 = cljs.core._lookup.call(null, map__8612__8614, "\ufdd0'force-update?", null);
    var exit__8616 = cljs.core._lookup.call(null, map__8612__8614, "\ufdd0'exit", null);
    var update__8617 = cljs.core._lookup.call(null, map__8612__8614, "\ufdd0'update", null);
    var enter__8618 = cljs.core._lookup.call(null, map__8612__8614, "\ufdd0'enter", null);
    var key_fn__8619 = cljs.core._lookup.call(null, map__8612__8614, "\ufdd0'key-fn", null);
    return new singult.core.Unify(data, mapping, key_fn__8619, enter__8618, update__8617, exit__8616, force_update_QMARK___8615)
  };
  var unify = function(data, mapping, var_args) {
    var p__8603 = null;
    if(goog.isDef(var_args)) {
      p__8603 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return unify__delegate.call(this, data, mapping, p__8603)
  };
  unify.cljs$lang$maxFixedArity = 2;
  unify.cljs$lang$applyTo = function(arglist__8620) {
    var data = cljs.core.first(arglist__8620);
    var mapping = cljs.core.first(cljs.core.next(arglist__8620));
    var p__8603 = cljs.core.rest(cljs.core.next(arglist__8620));
    return unify__delegate(data, mapping, p__8603)
  };
  unify.cljs$lang$arity$variadic = unify__delegate;
  return unify
}();
goog.provide("clojure.string");
goog.require("cljs.core");
goog.require("goog.string.StringBuffer");
goog.require("goog.string");
clojure.string.seq_reverse = function seq_reverse(coll) {
  return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, coll)
};
clojure.string.reverse = function reverse(s) {
  return s.split("").reverse().join("")
};
clojure.string.replace = function replace(s, match, replacement) {
  if(cljs.core.string_QMARK_.call(null, match)) {
    return s.replace(new RegExp(goog.string.regExpEscape(match), "g"), replacement)
  }else {
    if(cljs.core.truth_(match.hasOwnProperty("source"))) {
      return s.replace(new RegExp(match.source, "g"), replacement)
    }else {
      if("\ufdd0'else") {
        throw[cljs.core.str("Invalid match arg: "), cljs.core.str(match)].join("");
      }else {
        return null
      }
    }
  }
};
clojure.string.replace_first = function replace_first(s, match, replacement) {
  return s.replace(match, replacement)
};
clojure.string.join = function() {
  var join = null;
  var join__1 = function(coll) {
    return cljs.core.apply.call(null, cljs.core.str, coll)
  };
  var join__2 = function(separator, coll) {
    return cljs.core.apply.call(null, cljs.core.str, cljs.core.interpose.call(null, separator, coll))
  };
  join = function(separator, coll) {
    switch(arguments.length) {
      case 1:
        return join__1.call(this, separator);
      case 2:
        return join__2.call(this, separator, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  join.cljs$lang$arity$1 = join__1;
  join.cljs$lang$arity$2 = join__2;
  return join
}();
clojure.string.upper_case = function upper_case(s) {
  return s.toUpperCase()
};
clojure.string.lower_case = function lower_case(s) {
  return s.toLowerCase()
};
clojure.string.capitalize = function capitalize(s) {
  if(cljs.core.count.call(null, s) < 2) {
    return clojure.string.upper_case.call(null, s)
  }else {
    return[cljs.core.str(clojure.string.upper_case.call(null, cljs.core.subs.call(null, s, 0, 1))), cljs.core.str(clojure.string.lower_case.call(null, cljs.core.subs.call(null, s, 1)))].join("")
  }
};
clojure.string.split = function() {
  var split = null;
  var split__2 = function(s, re) {
    return cljs.core.vec.call(null, [cljs.core.str(s)].join("").split(re))
  };
  var split__3 = function(s, re, limit) {
    if(limit < 1) {
      return cljs.core.vec.call(null, [cljs.core.str(s)].join("").split(re))
    }else {
      var s__8444 = s;
      var limit__8445 = limit;
      var parts__8446 = cljs.core.PersistentVector.EMPTY;
      while(true) {
        if(cljs.core._EQ_.call(null, limit__8445, 1)) {
          return cljs.core.conj.call(null, parts__8446, s__8444)
        }else {
          var temp__3971__auto____8447 = cljs.core.re_find.call(null, re, s__8444);
          if(cljs.core.truth_(temp__3971__auto____8447)) {
            var m__8448 = temp__3971__auto____8447;
            var index__8449 = s__8444.indexOf(m__8448);
            var G__8450 = s__8444.substring(index__8449 + cljs.core.count.call(null, m__8448));
            var G__8451 = limit__8445 - 1;
            var G__8452 = cljs.core.conj.call(null, parts__8446, s__8444.substring(0, index__8449));
            s__8444 = G__8450;
            limit__8445 = G__8451;
            parts__8446 = G__8452;
            continue
          }else {
            return cljs.core.conj.call(null, parts__8446, s__8444)
          }
        }
        break
      }
    }
  };
  split = function(s, re, limit) {
    switch(arguments.length) {
      case 2:
        return split__2.call(this, s, re);
      case 3:
        return split__3.call(this, s, re, limit)
    }
    throw"Invalid arity: " + arguments.length;
  };
  split.cljs$lang$arity$2 = split__2;
  split.cljs$lang$arity$3 = split__3;
  return split
}();
clojure.string.split_lines = function split_lines(s) {
  return clojure.string.split.call(null, s, /\n|\r\n/)
};
clojure.string.trim = function trim(s) {
  return goog.string.trim(s)
};
clojure.string.triml = function triml(s) {
  return goog.string.trimLeft(s)
};
clojure.string.trimr = function trimr(s) {
  return goog.string.trimRight(s)
};
clojure.string.trim_newline = function trim_newline(s) {
  var index__8456 = s.length;
  while(true) {
    if(index__8456 === 0) {
      return""
    }else {
      var ch__8457 = cljs.core._lookup.call(null, s, index__8456 - 1, null);
      if(function() {
        var or__3824__auto____8458 = cljs.core._EQ_.call(null, ch__8457, "\n");
        if(or__3824__auto____8458) {
          return or__3824__auto____8458
        }else {
          return cljs.core._EQ_.call(null, ch__8457, "\r")
        }
      }()) {
        var G__8459 = index__8456 - 1;
        index__8456 = G__8459;
        continue
      }else {
        return s.substring(0, index__8456)
      }
    }
    break
  }
};
clojure.string.blank_QMARK_ = function blank_QMARK_(s) {
  var s__8463 = [cljs.core.str(s)].join("");
  if(cljs.core.truth_(function() {
    var or__3824__auto____8464 = cljs.core.not.call(null, s__8463);
    if(or__3824__auto____8464) {
      return or__3824__auto____8464
    }else {
      var or__3824__auto____8465 = cljs.core._EQ_.call(null, "", s__8463);
      if(or__3824__auto____8465) {
        return or__3824__auto____8465
      }else {
        return cljs.core.re_matches.call(null, /\s+/, s__8463)
      }
    }
  }())) {
    return true
  }else {
    return false
  }
};
clojure.string.escape = function escape(s, cmap) {
  var buffer__8472 = new goog.string.StringBuffer;
  var length__8473 = s.length;
  var index__8474 = 0;
  while(true) {
    if(cljs.core._EQ_.call(null, length__8473, index__8474)) {
      return buffer__8472.toString()
    }else {
      var ch__8475 = s.charAt(index__8474);
      var temp__3971__auto____8476 = cljs.core._lookup.call(null, cmap, ch__8475, null);
      if(cljs.core.truth_(temp__3971__auto____8476)) {
        var replacement__8477 = temp__3971__auto____8476;
        buffer__8472.append([cljs.core.str(replacement__8477)].join(""))
      }else {
        buffer__8472.append(ch__8475)
      }
      var G__8478 = index__8474 + 1;
      index__8474 = G__8478;
      continue
    }
    break
  }
};
goog.provide("c2.dom");
goog.require("cljs.core");
goog.require("goog.style");
goog.require("goog.dom.classes");
goog.require("goog.dom.forms");
goog.require("goog.dom");
goog.require("singult.core");
goog.require("clojure.string");
NodeList.prototype.cljs$core$ISeqable$ = true;
NodeList.prototype.cljs$core$ISeqable$_seq$arity$1 = function(array) {
  return cljs.core.array_seq.call(null, array, 0)
};
HTMLCollection.prototype.cljs$core$ISeqable$ = true;
HTMLCollection.prototype.cljs$core$ISeqable$_seq$arity$1 = function(array) {
  return cljs.core.array_seq.call(null, array, 0)
};
Node.prototype.cljs$core$IHash$ = true;
Node.prototype.cljs$core$IHash$_hash$arity$1 = function(x) {
  return x
};
c2.dom.IDom = {};
c2.dom.__GT_dom = function __GT_dom(x) {
  if(function() {
    var and__3822__auto____8301 = x;
    if(and__3822__auto____8301) {
      return x.c2$dom$IDom$__GT_dom$arity$1
    }else {
      return and__3822__auto____8301
    }
  }()) {
    return x.c2$dom$IDom$__GT_dom$arity$1(x)
  }else {
    var x__2363__auto____8302 = x == null ? null : x;
    return function() {
      var or__3824__auto____8303 = c2.dom.__GT_dom[goog.typeOf(x__2363__auto____8302)];
      if(or__3824__auto____8303) {
        return or__3824__auto____8303
      }else {
        var or__3824__auto____8304 = c2.dom.__GT_dom["_"];
        if(or__3824__auto____8304) {
          return or__3824__auto____8304
        }else {
          throw cljs.core.missing_protocol.call(null, "IDom.->dom", x);
        }
      }
    }().call(null, x)
  }
};
cljs.core.PersistentVector.prototype.c2$dom$IDom$ = true;
cljs.core.PersistentVector.prototype.c2$dom$IDom$__GT_dom$arity$1 = function(v) {
  return singult.core.render.call(null, v)
};
Node.prototype.c2$dom$IDom$ = true;
Node.prototype.c2$dom$IDom$__GT_dom$arity$1 = function(node) {
  return node
};
c2.dom.IDom["string"] = true;
c2.dom.__GT_dom["string"] = function(selector) {
  return c2.dom.select.call(null, selector)
};
c2.dom.select = function() {
  var select = null;
  var select__1 = function(selector) {
    return document.querySelector(selector)
  };
  var select__2 = function(selector, container) {
    return c2.dom.__GT_dom.call(null, container).querySelector(selector)
  };
  select = function(selector, container) {
    switch(arguments.length) {
      case 1:
        return select__1.call(this, selector);
      case 2:
        return select__2.call(this, selector, container)
    }
    throw"Invalid arity: " + arguments.length;
  };
  select.cljs$lang$arity$1 = select__1;
  select.cljs$lang$arity$2 = select__2;
  return select
}();
c2.dom.select_all = function() {
  var select_all = null;
  var select_all__1 = function(selector) {
    return document.querySelectorAll(selector)
  };
  var select_all__2 = function(selector, container) {
    return c2.dom.__GT_dom.call(null, container).querySelectorAll(selector)
  };
  select_all = function(selector, container) {
    switch(arguments.length) {
      case 1:
        return select_all__1.call(this, selector);
      case 2:
        return select_all__2.call(this, selector, container)
    }
    throw"Invalid arity: " + arguments.length;
  };
  select_all.cljs$lang$arity$1 = select_all__1;
  select_all.cljs$lang$arity$2 = select_all__2;
  return select_all
}();
c2.dom.matches_selector_QMARK_ = function matches_selector_QMARK_(node, selector) {
  return node.webkitMatchesSelector(selector)
};
c2.dom.children = function children(node) {
  return c2.dom.__GT_dom.call(null, node).children()
};
c2.dom.parent = function parent(node) {
  return c2.dom.__GT_dom.call(null, node).parentNode
};
c2.dom.append_BANG_ = function append_BANG_(container, el) {
  var el__8306 = c2.dom.__GT_dom.call(null, el);
  goog.dom.appendChild(c2.dom.__GT_dom.call(null, container), el__8306);
  return el__8306
};
c2.dom.prepend_BANG_ = function prepend_BANG_(container, el) {
  var el__8308 = c2.dom.__GT_dom.call(null, el);
  goog.dom.insertChildAt(c2.dom.__GT_dom.call(null, container), el__8308, 0);
  return el__8308
};
c2.dom.remove_BANG_ = function remove_BANG_(el) {
  return goog.dom.removeNode(c2.dom.__GT_dom.call(null, el))
};
c2.dom.replace_BANG_ = function replace_BANG_(old, new$) {
  var new__8310 = c2.dom.__GT_dom.call(null, new$);
  goog.dom.replaceNode(new__8310, c2.dom.__GT_dom.call(null, old));
  return new__8310
};
c2.dom.style = function() {
  var style = null;
  var style__1 = function(el) {
    throw new Error("TODO: return map of element styles");
  };
  var style__2 = function(el, x) {
    var el__8337 = c2.dom.__GT_dom.call(null, el);
    try {
      if(cljs.core.keyword_QMARK_.call(null, x)) {
        var k__8339 = x;
        return goog.style.getComputedStyle(el__8337, cljs.core.name.call(null, k__8339))
      }else {
        if(cljs.core.map_QMARK_.call(null, x)) {
          var m__8340 = x;
          var G__8341__8342 = cljs.core.seq.call(null, m__8340);
          if(G__8341__8342) {
            var G__8344__8346 = cljs.core.first.call(null, G__8341__8342);
            var vec__8345__8347 = G__8344__8346;
            var k__8348 = cljs.core.nth.call(null, vec__8345__8347, 0, null);
            var v__8349 = cljs.core.nth.call(null, vec__8345__8347, 1, null);
            var G__8341__8350 = G__8341__8342;
            var G__8344__8351 = G__8344__8346;
            var G__8341__8352 = G__8341__8350;
            while(true) {
              var vec__8353__8354 = G__8344__8351;
              var k__8355 = cljs.core.nth.call(null, vec__8353__8354, 0, null);
              var v__8356 = cljs.core.nth.call(null, vec__8353__8354, 1, null);
              var G__8341__8357 = G__8341__8352;
              style.call(null, el__8337, k__8355, v__8356);
              var temp__3974__auto____8358 = cljs.core.next.call(null, G__8341__8357);
              if(temp__3974__auto____8358) {
                var G__8341__8359 = temp__3974__auto____8358;
                var G__8363 = cljs.core.first.call(null, G__8341__8359);
                var G__8364 = G__8341__8359;
                G__8344__8351 = G__8363;
                G__8341__8352 = G__8364;
                continue
              }else {
              }
              break
            }
          }else {
          }
          return el__8337
        }else {
          if("\ufdd0'else") {
            throw 0;
          }else {
            return null
          }
        }
      }
    }catch(e__7152__auto__) {
      if(e__7152__auto__ === 0) {
        return null
      }else {
        throw e__7152__auto__;
      }
    }
  };
  var style__3 = function(el, k, v) {
    goog.style.setStyle(c2.dom.__GT_dom.call(null, el), cljs.core.name.call(null, k), function() {
      try {
        if(cljs.core.string_QMARK_.call(null, v)) {
          var s__8361 = v;
          return s__8361
        }else {
          if(cljs.core.number_QMARK_.call(null, v)) {
            var n__8362 = v;
            if(cljs.core.truth_(cljs.core.PersistentHashSet.fromArray(["\ufdd0'bottom", "\ufdd0'width", "\ufdd0'top", "\ufdd0'right", "\ufdd0'left", "\ufdd0'height"]).call(null, cljs.core.keyword.call(null, k)))) {
              return[cljs.core.str(n__8362), cljs.core.str("px")].join("")
            }else {
              return n__8362
            }
          }else {
            if("\ufdd0'else") {
              throw 0;
            }else {
              return null
            }
          }
        }
      }catch(e__7152__auto__) {
        if(e__7152__auto__ === 0) {
          return null
        }else {
          throw e__7152__auto__;
        }
      }
    }());
    return el
  };
  style = function(el, k, v) {
    switch(arguments.length) {
      case 1:
        return style__1.call(this, el);
      case 2:
        return style__2.call(this, el, k);
      case 3:
        return style__3.call(this, el, k, v)
    }
    throw"Invalid arity: " + arguments.length;
  };
  style.cljs$lang$arity$1 = style__1;
  style.cljs$lang$arity$2 = style__2;
  style.cljs$lang$arity$3 = style__3;
  return style
}();
c2.dom.attr = function() {
  var attr = null;
  var attr__1 = function(el) {
    var attrs__8397 = c2.dom.__GT_dom.call(null, el).attributes;
    return cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, function() {
      var iter__2462__auto____8404 = function iter__8398(s__8399) {
        return new cljs.core.LazySeq(null, false, function() {
          var s__8399__8402 = s__8399;
          while(true) {
            if(cljs.core.seq.call(null, s__8399__8402)) {
              var i__8403 = cljs.core.first.call(null, s__8399__8402);
              return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([cljs.core.keyword.call(null, attrs__8397[i__8403].name), attrs__8397[i__8403].value], true), iter__8398.call(null, cljs.core.rest.call(null, s__8399__8402)))
            }else {
              return null
            }
            break
          }
        }, null)
      };
      return iter__2462__auto____8404.call(null, cljs.core.range.call(null, attrs__8397.length))
    }())
  };
  var attr__2 = function(el, x) {
    var el__8405 = c2.dom.__GT_dom.call(null, el);
    try {
      if(cljs.core.keyword_QMARK_.call(null, x)) {
        var k__8407 = x;
        return el__8405.getAttribute(cljs.core.name.call(null, k__8407))
      }else {
        if(cljs.core.map_QMARK_.call(null, x)) {
          var m__8408 = x;
          var G__8409__8410 = cljs.core.seq.call(null, m__8408);
          if(G__8409__8410) {
            var G__8412__8414 = cljs.core.first.call(null, G__8409__8410);
            var vec__8413__8415 = G__8412__8414;
            var k__8416 = cljs.core.nth.call(null, vec__8413__8415, 0, null);
            var v__8417 = cljs.core.nth.call(null, vec__8413__8415, 1, null);
            var G__8409__8418 = G__8409__8410;
            var G__8412__8419 = G__8412__8414;
            var G__8409__8420 = G__8409__8418;
            while(true) {
              var vec__8421__8422 = G__8412__8419;
              var k__8423 = cljs.core.nth.call(null, vec__8421__8422, 0, null);
              var v__8424 = cljs.core.nth.call(null, vec__8421__8422, 1, null);
              var G__8409__8425 = G__8409__8420;
              attr.call(null, el__8405, k__8423, v__8424);
              var temp__3974__auto____8426 = cljs.core.next.call(null, G__8409__8425);
              if(temp__3974__auto____8426) {
                var G__8409__8427 = temp__3974__auto____8426;
                var G__8429 = cljs.core.first.call(null, G__8409__8427);
                var G__8430 = G__8409__8427;
                G__8412__8419 = G__8429;
                G__8409__8420 = G__8430;
                continue
              }else {
              }
              break
            }
          }else {
          }
          return el__8405
        }else {
          if("\ufdd0'else") {
            throw 0;
          }else {
            return null
          }
        }
      }
    }catch(e__7152__auto__) {
      if(e__7152__auto__ === 0) {
        return null
      }else {
        throw e__7152__auto__;
      }
    }
  };
  var attr__3 = function(el, k, v) {
    var el__8428 = c2.dom.__GT_dom.call(null, el);
    if(v == null) {
      el__8428.removeAttribute(cljs.core.name.call(null, k))
    }else {
      if(cljs.core._EQ_.call(null, "\ufdd0'style", k)) {
        c2.dom.style.call(null, el__8428, v)
      }else {
        el__8428.setAttribute(cljs.core.name.call(null, k), v)
      }
    }
    return el__8428
  };
  attr = function(el, k, v) {
    switch(arguments.length) {
      case 1:
        return attr__1.call(this, el);
      case 2:
        return attr__2.call(this, el, k);
      case 3:
        return attr__3.call(this, el, k, v)
    }
    throw"Invalid arity: " + arguments.length;
  };
  attr.cljs$lang$arity$1 = attr__1;
  attr.cljs$lang$arity$2 = attr__2;
  attr.cljs$lang$arity$3 = attr__3;
  return attr
}();
c2.dom.text = function() {
  var text = null;
  var text__1 = function(el) {
    return goog.dom.getTextContent(c2.dom.__GT_dom.call(null, el))
  };
  var text__2 = function(el, v) {
    var el__8432 = c2.dom.__GT_dom.call(null, el);
    goog.dom.setTextContent(el__8432, v);
    return el__8432
  };
  text = function(el, v) {
    switch(arguments.length) {
      case 1:
        return text__1.call(this, el);
      case 2:
        return text__2.call(this, el, v)
    }
    throw"Invalid arity: " + arguments.length;
  };
  text.cljs$lang$arity$1 = text__1;
  text.cljs$lang$arity$2 = text__2;
  return text
}();
c2.dom.val = function() {
  var val = null;
  var val__1 = function(el) {
    return goog.dom.forms.getValue(c2.dom.__GT_dom.call(null, el))
  };
  var val__2 = function(el, v) {
    var el__8434 = c2.dom.__GT_dom.call(null, el);
    goog.dom.forms.setValue(el__8434, v);
    return el__8434
  };
  val = function(el, v) {
    switch(arguments.length) {
      case 1:
        return val__1.call(this, el);
      case 2:
        return val__2.call(this, el, v)
    }
    throw"Invalid arity: " + arguments.length;
  };
  val.cljs$lang$arity$1 = val__1;
  val.cljs$lang$arity$2 = val__2;
  return val
}();
c2.dom.classed_BANG_ = function classed_BANG_(el, class$, classed_QMARK_) {
  return goog.dom.classes.enable(c2.dom.__GT_dom.call(null, el), cljs.core.name.call(null, class$), classed_QMARK_)
};
c2.dom.add_class_BANG_ = function add_class_BANG_(el, class$) {
  return c2.dom.classed_BANG_.call(null, el, class$, true)
};
c2.dom.remove_class_BANG_ = function remove_class_BANG_(el, class$) {
  return c2.dom.classed_BANG_.call(null, el, class$, false)
};
c2.dom.request_animation_frame = function() {
  var or__3824__auto____8436 = window.requestAnimationFrame;
  if(cljs.core.truth_(or__3824__auto____8436)) {
    return or__3824__auto____8436
  }else {
    var or__3824__auto____8437 = window.webkitRequestAnimationFrame;
    if(cljs.core.truth_(or__3824__auto____8437)) {
      return or__3824__auto____8437
    }else {
      return function(p1__8435_SHARP_) {
        return setTimeout(function() {
          return p1__8435_SHARP_.call(null)
        }, 10)
      }
    }
  }
}();
goog.provide("c2.maths");
goog.require("cljs.core");
c2.maths.Pi = Math.PI;
c2.maths.Tau = 2 * c2.maths.Pi;
c2.maths.e = Math.E;
c2.maths.radians_per_degree = c2.maths.Pi / 180;
c2.maths.rad = function rad(x) {
  return c2.maths.radians_per_degree * x
};
c2.maths.sin = function sin(x) {
  return Math.sin.call(null, x)
};
c2.maths.asin = function asin(x) {
  return Math.asin.call(null, x)
};
c2.maths.cos = function cos(x) {
  return Math.cos.call(null, x)
};
c2.maths.acos = function acos(x) {
  return Math.acos.call(null, x)
};
c2.maths.tan = function tan(x) {
  return Math.tan.call(null, x)
};
c2.maths.atan = function atan(x) {
  return Math.atan.call(null, x)
};
c2.maths.expt = function() {
  var expt = null;
  var expt__1 = function(x) {
    return Math.exp.call(null, x)
  };
  var expt__2 = function(x, y) {
    return Math.pow.call(null, x, y)
  };
  expt = function(x, y) {
    switch(arguments.length) {
      case 1:
        return expt__1.call(this, x);
      case 2:
        return expt__2.call(this, x, y)
    }
    throw"Invalid arity: " + arguments.length;
  };
  expt.cljs$lang$arity$1 = expt__1;
  expt.cljs$lang$arity$2 = expt__2;
  return expt
}();
c2.maths.sq = function sq(x) {
  return c2.maths.expt.call(null, x, 2)
};
c2.maths.sqrt = function sqrt(x) {
  return Math.sqrt.call(null, x)
};
c2.maths.floor = function floor(x) {
  return Math.floor.call(null, x)
};
c2.maths.ceil = function ceil(x) {
  return Math.ceil.call(null, x)
};
c2.maths.abs = function abs(x) {
  return Math.abs.call(null, x)
};
c2.maths.log = function() {
  var log = null;
  var log__1 = function(x) {
    return Math.log.call(null, x)
  };
  var log__2 = function(base, x) {
    return Math.log.call(null, x) / Math.log.call(null, base)
  };
  log = function(base, x) {
    switch(arguments.length) {
      case 1:
        return log__1.call(this, base);
      case 2:
        return log__2.call(this, base, x)
    }
    throw"Invalid arity: " + arguments.length;
  };
  log.cljs$lang$arity$1 = log__1;
  log.cljs$lang$arity$2 = log__2;
  return log
}();
c2.maths.log10 = function log10(x) {
  return Math.log(x) / Math.LN10
};
c2.maths.extent = function extent(xs) {
  return cljs.core.PersistentVector.fromArray([cljs.core.apply.call(null, cljs.core.min, xs), cljs.core.apply.call(null, cljs.core.max, xs)], true)
};
c2.maths.mean = function mean(xs) {
  return cljs.core.reduce.call(null, cljs.core._PLUS_, xs) / cljs.core.count.call(null, xs)
};
c2.maths.median = function median(xs) {
  var sorted__8241 = cljs.core.sort.call(null, xs);
  var n__8242 = cljs.core.count.call(null, xs);
  if(cljs.core._EQ_.call(null, n__8242, 1)) {
    return cljs.core.first.call(null, sorted__8241)
  }else {
    if(cljs.core.odd_QMARK_.call(null, n__8242)) {
      return cljs.core.nth.call(null, sorted__8241, (n__8242 + 1) / 2)
    }else {
      if("\ufdd0'else") {
        var mid__8243 = n__8242 / 2;
        return c2.maths.mean.call(null, cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null, sorted__8241, c2.maths.floor.call(null, mid__8243)), cljs.core.nth.call(null, sorted__8241, c2.maths.ceil.call(null, mid__8243))], true))
      }else {
        return null
      }
    }
  }
};
c2.maths.irange = function() {
  var irange = null;
  var irange__1 = function(start) {
    return cljs.core.range.call(null, start)
  };
  var irange__2 = function(start, end) {
    return cljs.core.concat.call(null, cljs.core.range.call(null, start, end), cljs.core.PersistentVector.fromArray([end], true))
  };
  var irange__3 = function(start, end, step) {
    return cljs.core.concat.call(null, cljs.core.range.call(null, start, end, step), cljs.core.PersistentVector.fromArray([end], true))
  };
  irange = function(start, end, step) {
    switch(arguments.length) {
      case 1:
        return irange__1.call(this, start);
      case 2:
        return irange__2.call(this, start, end);
      case 3:
        return irange__3.call(this, start, end, step)
    }
    throw"Invalid arity: " + arguments.length;
  };
  irange.cljs$lang$arity$1 = irange__1;
  irange.cljs$lang$arity$2 = irange__2;
  irange.cljs$lang$arity$3 = irange__3;
  return irange
}();
c2.maths.add = function() {
  var add__delegate = function(args) {
    return cljs.core.reduce.call(null, function(A, B) {
      if(function() {
        var and__3822__auto____8248 = cljs.core.number_QMARK_.call(null, A);
        if(and__3822__auto____8248) {
          return cljs.core.number_QMARK_.call(null, B)
        }else {
          return and__3822__auto____8248
        }
      }()) {
        return A + B
      }else {
        if(function() {
          var and__3822__auto____8249 = cljs.core.coll_QMARK_.call(null, A);
          if(and__3822__auto____8249) {
            return cljs.core.coll_QMARK_.call(null, B)
          }else {
            return and__3822__auto____8249
          }
        }()) {
          return cljs.core.map.call(null, cljs.core._PLUS_, A, B)
        }else {
          if(function() {
            var and__3822__auto____8250 = cljs.core.number_QMARK_.call(null, A);
            if(and__3822__auto____8250) {
              return cljs.core.coll_QMARK_.call(null, B)
            }else {
              return and__3822__auto____8250
            }
          }()) {
            return cljs.core.map.call(null, cljs.core._PLUS_, cljs.core.replicate.call(null, cljs.core.count.call(null, B), A), B)
          }else {
            if(function() {
              var and__3822__auto____8251 = cljs.core.coll_QMARK_.call(null, A);
              if(and__3822__auto____8251) {
                return cljs.core.number_QMARK_.call(null, B)
              }else {
                return and__3822__auto____8251
              }
            }()) {
              return cljs.core.map.call(null, cljs.core._PLUS_, A, cljs.core.replicate.call(null, cljs.core.count.call(null, A), B))
            }else {
              return null
            }
          }
        }
      }
    }, args)
  };
  var add = function(var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return add__delegate.call(this, args)
  };
  add.cljs$lang$maxFixedArity = 0;
  add.cljs$lang$applyTo = function(arglist__8252) {
    var args = cljs.core.seq(arglist__8252);
    return add__delegate(args)
  };
  add.cljs$lang$arity$variadic = add__delegate;
  return add
}();
c2.maths.sub = function() {
  var sub__delegate = function(args) {
    if(cljs.core._EQ_.call(null, cljs.core.count.call(null, args), 1)) {
      if(function() {
        var and__3822__auto____8261 = cljs.core.number_QMARK_.call(null, 0);
        if(and__3822__auto____8261) {
          return cljs.core.number_QMARK_.call(null, cljs.core.first.call(null, args))
        }else {
          return and__3822__auto____8261
        }
      }()) {
        return 0 - cljs.core.first.call(null, args)
      }else {
        if(function() {
          var and__3822__auto____8262 = cljs.core.coll_QMARK_.call(null, 0);
          if(and__3822__auto____8262) {
            return cljs.core.coll_QMARK_.call(null, cljs.core.first.call(null, args))
          }else {
            return and__3822__auto____8262
          }
        }()) {
          return cljs.core.map.call(null, cljs.core._, 0, cljs.core.first.call(null, args))
        }else {
          if(function() {
            var and__3822__auto____8263 = cljs.core.number_QMARK_.call(null, 0);
            if(and__3822__auto____8263) {
              return cljs.core.coll_QMARK_.call(null, cljs.core.first.call(null, args))
            }else {
              return and__3822__auto____8263
            }
          }()) {
            return cljs.core.map.call(null, cljs.core._, cljs.core.replicate.call(null, cljs.core.count.call(null, cljs.core.first.call(null, args)), 0), cljs.core.first.call(null, args))
          }else {
            if(function() {
              var and__3822__auto____8264 = cljs.core.coll_QMARK_.call(null, 0);
              if(and__3822__auto____8264) {
                return cljs.core.number_QMARK_.call(null, cljs.core.first.call(null, args))
              }else {
                return and__3822__auto____8264
              }
            }()) {
              return cljs.core.map.call(null, cljs.core._, 0, cljs.core.replicate.call(null, cljs.core.count.call(null, 0), cljs.core.first.call(null, args)))
            }else {
              return null
            }
          }
        }
      }
    }else {
      return cljs.core.reduce.call(null, function(A, B) {
        if(function() {
          var and__3822__auto____8265 = cljs.core.number_QMARK_.call(null, A);
          if(and__3822__auto____8265) {
            return cljs.core.number_QMARK_.call(null, B)
          }else {
            return and__3822__auto____8265
          }
        }()) {
          return A - B
        }else {
          if(function() {
            var and__3822__auto____8266 = cljs.core.coll_QMARK_.call(null, A);
            if(and__3822__auto____8266) {
              return cljs.core.coll_QMARK_.call(null, B)
            }else {
              return and__3822__auto____8266
            }
          }()) {
            return cljs.core.map.call(null, cljs.core._, A, B)
          }else {
            if(function() {
              var and__3822__auto____8267 = cljs.core.number_QMARK_.call(null, A);
              if(and__3822__auto____8267) {
                return cljs.core.coll_QMARK_.call(null, B)
              }else {
                return and__3822__auto____8267
              }
            }()) {
              return cljs.core.map.call(null, cljs.core._, cljs.core.replicate.call(null, cljs.core.count.call(null, B), A), B)
            }else {
              if(function() {
                var and__3822__auto____8268 = cljs.core.coll_QMARK_.call(null, A);
                if(and__3822__auto____8268) {
                  return cljs.core.number_QMARK_.call(null, B)
                }else {
                  return and__3822__auto____8268
                }
              }()) {
                return cljs.core.map.call(null, cljs.core._, A, cljs.core.replicate.call(null, cljs.core.count.call(null, A), B))
              }else {
                return null
              }
            }
          }
        }
      }, args)
    }
  };
  var sub = function(var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return sub__delegate.call(this, args)
  };
  sub.cljs$lang$maxFixedArity = 0;
  sub.cljs$lang$applyTo = function(arglist__8269) {
    var args = cljs.core.seq(arglist__8269);
    return sub__delegate(args)
  };
  sub.cljs$lang$arity$variadic = sub__delegate;
  return sub
}();
c2.maths.mul = function() {
  var mul__delegate = function(args) {
    return cljs.core.reduce.call(null, function(A, B) {
      if(function() {
        var and__3822__auto____8274 = cljs.core.number_QMARK_.call(null, A);
        if(and__3822__auto____8274) {
          return cljs.core.number_QMARK_.call(null, B)
        }else {
          return and__3822__auto____8274
        }
      }()) {
        return A * B
      }else {
        if(function() {
          var and__3822__auto____8275 = cljs.core.coll_QMARK_.call(null, A);
          if(and__3822__auto____8275) {
            return cljs.core.coll_QMARK_.call(null, B)
          }else {
            return and__3822__auto____8275
          }
        }()) {
          return cljs.core.map.call(null, cljs.core._STAR_, A, B)
        }else {
          if(function() {
            var and__3822__auto____8276 = cljs.core.number_QMARK_.call(null, A);
            if(and__3822__auto____8276) {
              return cljs.core.coll_QMARK_.call(null, B)
            }else {
              return and__3822__auto____8276
            }
          }()) {
            return cljs.core.map.call(null, cljs.core._STAR_, cljs.core.replicate.call(null, cljs.core.count.call(null, B), A), B)
          }else {
            if(function() {
              var and__3822__auto____8277 = cljs.core.coll_QMARK_.call(null, A);
              if(and__3822__auto____8277) {
                return cljs.core.number_QMARK_.call(null, B)
              }else {
                return and__3822__auto____8277
              }
            }()) {
              return cljs.core.map.call(null, cljs.core._STAR_, A, cljs.core.replicate.call(null, cljs.core.count.call(null, A), B))
            }else {
              return null
            }
          }
        }
      }
    }, args)
  };
  var mul = function(var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return mul__delegate.call(this, args)
  };
  mul.cljs$lang$maxFixedArity = 0;
  mul.cljs$lang$applyTo = function(arglist__8278) {
    var args = cljs.core.seq(arglist__8278);
    return mul__delegate(args)
  };
  mul.cljs$lang$arity$variadic = mul__delegate;
  return mul
}();
c2.maths.div = function() {
  var div__delegate = function(args) {
    if(cljs.core._EQ_.call(null, cljs.core.count.call(null, args), 1)) {
      if(function() {
        var and__3822__auto____8287 = cljs.core.number_QMARK_.call(null, 1);
        if(and__3822__auto____8287) {
          return cljs.core.number_QMARK_.call(null, cljs.core.first.call(null, args))
        }else {
          return and__3822__auto____8287
        }
      }()) {
        return 1 / cljs.core.first.call(null, args)
      }else {
        if(function() {
          var and__3822__auto____8288 = cljs.core.coll_QMARK_.call(null, 1);
          if(and__3822__auto____8288) {
            return cljs.core.coll_QMARK_.call(null, cljs.core.first.call(null, args))
          }else {
            return and__3822__auto____8288
          }
        }()) {
          return cljs.core.map.call(null, cljs.core._SLASH_, 1, cljs.core.first.call(null, args))
        }else {
          if(function() {
            var and__3822__auto____8289 = cljs.core.number_QMARK_.call(null, 1);
            if(and__3822__auto____8289) {
              return cljs.core.coll_QMARK_.call(null, cljs.core.first.call(null, args))
            }else {
              return and__3822__auto____8289
            }
          }()) {
            return cljs.core.map.call(null, cljs.core._SLASH_, cljs.core.replicate.call(null, cljs.core.count.call(null, cljs.core.first.call(null, args)), 1), cljs.core.first.call(null, args))
          }else {
            if(function() {
              var and__3822__auto____8290 = cljs.core.coll_QMARK_.call(null, 1);
              if(and__3822__auto____8290) {
                return cljs.core.number_QMARK_.call(null, cljs.core.first.call(null, args))
              }else {
                return and__3822__auto____8290
              }
            }()) {
              return cljs.core.map.call(null, cljs.core._SLASH_, 1, cljs.core.replicate.call(null, cljs.core.count.call(null, 1), cljs.core.first.call(null, args)))
            }else {
              return null
            }
          }
        }
      }
    }else {
      return cljs.core.reduce.call(null, function(A, B) {
        if(function() {
          var and__3822__auto____8291 = cljs.core.number_QMARK_.call(null, A);
          if(and__3822__auto____8291) {
            return cljs.core.number_QMARK_.call(null, B)
          }else {
            return and__3822__auto____8291
          }
        }()) {
          return A / B
        }else {
          if(function() {
            var and__3822__auto____8292 = cljs.core.coll_QMARK_.call(null, A);
            if(and__3822__auto____8292) {
              return cljs.core.coll_QMARK_.call(null, B)
            }else {
              return and__3822__auto____8292
            }
          }()) {
            return cljs.core.map.call(null, cljs.core._SLASH_, A, B)
          }else {
            if(function() {
              var and__3822__auto____8293 = cljs.core.number_QMARK_.call(null, A);
              if(and__3822__auto____8293) {
                return cljs.core.coll_QMARK_.call(null, B)
              }else {
                return and__3822__auto____8293
              }
            }()) {
              return cljs.core.map.call(null, cljs.core._SLASH_, cljs.core.replicate.call(null, cljs.core.count.call(null, B), A), B)
            }else {
              if(function() {
                var and__3822__auto____8294 = cljs.core.coll_QMARK_.call(null, A);
                if(and__3822__auto____8294) {
                  return cljs.core.number_QMARK_.call(null, B)
                }else {
                  return and__3822__auto____8294
                }
              }()) {
                return cljs.core.map.call(null, cljs.core._SLASH_, A, cljs.core.replicate.call(null, cljs.core.count.call(null, A), B))
              }else {
                return null
              }
            }
          }
        }
      }, args)
    }
  };
  var div = function(var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return div__delegate.call(this, args)
  };
  div.cljs$lang$maxFixedArity = 0;
  div.cljs$lang$applyTo = function(arglist__8295) {
    var args = cljs.core.seq(arglist__8295);
    return div__delegate(args)
  };
  div.cljs$lang$arity$variadic = div__delegate;
  return div
}();
goog.provide("c2.scale");
goog.require("cljs.core");
goog.require("c2.maths");
goog.require("c2.maths");
goog.require("c2.maths");
c2.scale.IInvertable = {};
c2.scale.invert = function invert(scale) {
  if(function() {
    var and__3822__auto____8132 = scale;
    if(and__3822__auto____8132) {
      return scale.c2$scale$IInvertable$invert$arity$1
    }else {
      return and__3822__auto____8132
    }
  }()) {
    return scale.c2$scale$IInvertable$invert$arity$1(scale)
  }else {
    var x__2363__auto____8133 = scale == null ? null : scale;
    return function() {
      var or__3824__auto____8134 = c2.scale.invert[goog.typeOf(x__2363__auto____8133)];
      if(or__3824__auto____8134) {
        return or__3824__auto____8134
      }else {
        var or__3824__auto____8135 = c2.scale.invert["_"];
        if(or__3824__auto____8135) {
          return or__3824__auto____8135
        }else {
          throw cljs.core.missing_protocol.call(null, "IInvertable.invert", scale);
        }
      }
    }().call(null, scale)
  }
};
c2.scale._linear = function(domain, range, __meta, __extmap) {
  this.domain = domain;
  this.range = range;
  this.__meta = __meta;
  this.__extmap = __extmap;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 619054859;
  if(arguments.length > 2) {
    this.__meta = __meta;
    this.__extmap = __extmap
  }else {
    this.__meta = null;
    this.__extmap = null
  }
};
c2.scale._linear.prototype.cljs$core$IHash$_hash$arity$1 = function(this__2318__auto__) {
  var this__8141 = this;
  var h__2192__auto____8142 = this__8141.__hash;
  if(!(h__2192__auto____8142 == null)) {
    return h__2192__auto____8142
  }else {
    var h__2192__auto____8143 = cljs.core.hash_imap.call(null, this__2318__auto__);
    this__8141.__hash = h__2192__auto____8143;
    return h__2192__auto____8143
  }
};
c2.scale._linear.prototype.cljs$core$ILookup$_lookup$arity$2 = function(this__2323__auto__, k__2324__auto__) {
  var this__8144 = this;
  return this__2323__auto__.cljs$core$ILookup$_lookup$arity$3(this__2323__auto__, k__2324__auto__, null)
};
c2.scale._linear.prototype.cljs$core$ILookup$_lookup$arity$3 = function(this__2325__auto__, k8137, else__2326__auto__) {
  var this__8145 = this;
  if(k8137 === "\ufdd0'domain") {
    return this__8145.domain
  }else {
    if(k8137 === "\ufdd0'range") {
      return this__8145.range
    }else {
      if("\ufdd0'else") {
        return cljs.core._lookup.call(null, this__8145.__extmap, k8137, else__2326__auto__)
      }else {
        return null
      }
    }
  }
};
c2.scale._linear.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(this__2330__auto__, k__2331__auto__, G__8136) {
  var this__8146 = this;
  var pred__8147__8150 = cljs.core.identical_QMARK_;
  var expr__8148__8151 = k__2331__auto__;
  if(pred__8147__8150.call(null, "\ufdd0'domain", expr__8148__8151)) {
    return new c2.scale._linear(G__8136, this__8146.range, this__8146.__meta, this__8146.__extmap, null)
  }else {
    if(pred__8147__8150.call(null, "\ufdd0'range", expr__8148__8151)) {
      return new c2.scale._linear(this__8146.domain, G__8136, this__8146.__meta, this__8146.__extmap, null)
    }else {
      return new c2.scale._linear(this__8146.domain, this__8146.range, this__8146.__meta, cljs.core.assoc.call(null, this__8146.__extmap, k__2331__auto__, G__8136), null)
    }
  }
};
c2.scale._linear.prototype.call = function(this_sym8152, x) {
  var this__8153 = this;
  var this_sym8152__8154 = this;
  var ___8155 = this_sym8152__8154;
  var domain_length__8156 = cljs.core.last.call(null, this__8153.domain) - cljs.core.first.call(null, this__8153.domain);
  var range_length__8157 = cljs.core.last.call(null, this__8153.range) - cljs.core.first.call(null, this__8153.range);
  return cljs.core.first.call(null, this__8153.range) + range_length__8157 * ((x - cljs.core.first.call(null, this__8153.domain)) / domain_length__8156)
};
c2.scale._linear.prototype.apply = function(this_sym8139, args8140) {
  var this__8158 = this;
  return this_sym8139.call.apply(this_sym8139, [this_sym8139].concat(args8140.slice()))
};
c2.scale._linear.prototype.cljs$core$ICollection$_conj$arity$2 = function(this__2328__auto__, entry__2329__auto__) {
  var this__8159 = this;
  if(cljs.core.vector_QMARK_.call(null, entry__2329__auto__)) {
    return this__2328__auto__.cljs$core$IAssociative$_assoc$arity$3(this__2328__auto__, cljs.core._nth.call(null, entry__2329__auto__, 0), cljs.core._nth.call(null, entry__2329__auto__, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, this__2328__auto__, entry__2329__auto__)
  }
};
c2.scale._linear.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this__2335__auto__) {
  var this__8160 = this;
  return cljs.core.seq.call(null, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'domain", this__8160.domain), cljs.core.vector.call(null, "\ufdd0'range", this__8160.range)], true), this__8160.__extmap))
};
c2.scale._linear.prototype.c2$scale$IInvertable$ = true;
c2.scale._linear.prototype.c2$scale$IInvertable$invert$arity$1 = function(this$) {
  var this__8161 = this;
  return cljs.core.assoc.call(null, this$, "\ufdd0'domain", this__8161.range, "\ufdd0'range", this__8161.domain)
};
c2.scale._linear.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(this__2337__auto__, opts__2338__auto__) {
  var this__8162 = this;
  var pr_pair__2339__auto____8163 = function(keyval__2340__auto__) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts__2338__auto__, keyval__2340__auto__)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__2339__auto____8163, [cljs.core.str("#"), cljs.core.str("_linear"), cljs.core.str("{")].join(""), ", ", "}", opts__2338__auto__, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'domain", this__8162.domain), cljs.core.vector.call(null, "\ufdd0'range", this__8162.range)], true), this__8162.__extmap))
};
c2.scale._linear.prototype.cljs$core$ICounted$_count$arity$1 = function(this__2327__auto__) {
  var this__8164 = this;
  return 2 + cljs.core.count.call(null, this__8164.__extmap)
};
c2.scale._linear.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(this__2319__auto__, other__2320__auto__) {
  var this__8165 = this;
  if(cljs.core.truth_(function() {
    var and__3822__auto____8166 = other__2320__auto__;
    if(cljs.core.truth_(and__3822__auto____8166)) {
      var and__3822__auto____8167 = this__2319__auto__.constructor === other__2320__auto__.constructor;
      if(and__3822__auto____8167) {
        return cljs.core.equiv_map.call(null, this__2319__auto__, other__2320__auto__)
      }else {
        return and__3822__auto____8167
      }
    }else {
      return and__3822__auto____8166
    }
  }())) {
    return true
  }else {
    return false
  }
};
c2.scale._linear.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(this__2322__auto__, G__8136) {
  var this__8168 = this;
  return new c2.scale._linear(this__8168.domain, this__8168.range, G__8136, this__8168.__extmap, this__8168.__hash)
};
c2.scale._linear.prototype.cljs$core$IMeta$_meta$arity$1 = function(this__2321__auto__) {
  var this__8169 = this;
  return this__8169.__meta
};
c2.scale._linear.prototype.cljs$core$IMap$_dissoc$arity$2 = function(this__2332__auto__, k__2333__auto__) {
  var this__8170 = this;
  if(cljs.core.contains_QMARK_.call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'domain", "\ufdd0'range"]), k__2333__auto__)) {
    return cljs.core.dissoc.call(null, cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, this__2332__auto__), this__8170.__meta), k__2333__auto__)
  }else {
    return new c2.scale._linear(this__8170.domain, this__8170.range, this__8170.__meta, cljs.core.not_empty.call(null, cljs.core.dissoc.call(null, this__8170.__extmap, k__2333__auto__)), null)
  }
};
c2.scale._linear.cljs$lang$type = true;
c2.scale._linear.cljs$lang$ctorPrSeq = function(this__2357__auto__) {
  return cljs.core.list.call(null, "c2.scale/_linear")
};
c2.scale.__GT__linear = function __GT__linear(domain, range) {
  return new c2.scale._linear(domain, range)
};
c2.scale.map__GT__linear = function map__GT__linear(G__8138) {
  return new c2.scale._linear((new cljs.core.Keyword("\ufdd0'domain")).call(null, G__8138), (new cljs.core.Keyword("\ufdd0'range")).call(null, G__8138), null, cljs.core.dissoc.call(null, G__8138, "\ufdd0'domain", "\ufdd0'range"))
};
c2.scale._linear;
c2.scale.linear = function() {
  var linear__delegate = function(kwargs) {
    return c2.scale.map__GT__linear.call(null, cljs.core.merge.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'domain", "\ufdd0'range"], {"\ufdd0'domain":cljs.core.PersistentVector.fromArray([0, 1], true), "\ufdd0'range":cljs.core.PersistentVector.fromArray([0, 1], true)}), cljs.core.apply.call(null, cljs.core.hash_map, kwargs)))
  };
  var linear = function(var_args) {
    var kwargs = null;
    if(goog.isDef(var_args)) {
      kwargs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return linear__delegate.call(this, kwargs)
  };
  linear.cljs$lang$maxFixedArity = 0;
  linear.cljs$lang$applyTo = function(arglist__8171) {
    var kwargs = cljs.core.seq(arglist__8171);
    return linear__delegate(kwargs)
  };
  linear.cljs$lang$arity$variadic = linear__delegate;
  return linear
}();
c2.scale._power = function(domain, range, __meta, __extmap) {
  this.domain = domain;
  this.range = range;
  this.__meta = __meta;
  this.__extmap = __extmap;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 619054859;
  if(arguments.length > 2) {
    this.__meta = __meta;
    this.__extmap = __extmap
  }else {
    this.__meta = null;
    this.__extmap = null
  }
};
c2.scale._power.prototype.cljs$core$IHash$_hash$arity$1 = function(this__2318__auto__) {
  var this__8177 = this;
  var h__2192__auto____8178 = this__8177.__hash;
  if(!(h__2192__auto____8178 == null)) {
    return h__2192__auto____8178
  }else {
    var h__2192__auto____8179 = cljs.core.hash_imap.call(null, this__2318__auto__);
    this__8177.__hash = h__2192__auto____8179;
    return h__2192__auto____8179
  }
};
c2.scale._power.prototype.cljs$core$ILookup$_lookup$arity$2 = function(this__2323__auto__, k__2324__auto__) {
  var this__8180 = this;
  return this__2323__auto__.cljs$core$ILookup$_lookup$arity$3(this__2323__auto__, k__2324__auto__, null)
};
c2.scale._power.prototype.cljs$core$ILookup$_lookup$arity$3 = function(this__2325__auto__, k8173, else__2326__auto__) {
  var this__8181 = this;
  if(k8173 === "\ufdd0'domain") {
    return this__8181.domain
  }else {
    if(k8173 === "\ufdd0'range") {
      return this__8181.range
    }else {
      if("\ufdd0'else") {
        return cljs.core._lookup.call(null, this__8181.__extmap, k8173, else__2326__auto__)
      }else {
        return null
      }
    }
  }
};
c2.scale._power.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(this__2330__auto__, k__2331__auto__, G__8172) {
  var this__8182 = this;
  var pred__8183__8186 = cljs.core.identical_QMARK_;
  var expr__8184__8187 = k__2331__auto__;
  if(pred__8183__8186.call(null, "\ufdd0'domain", expr__8184__8187)) {
    return new c2.scale._power(G__8172, this__8182.range, this__8182.__meta, this__8182.__extmap, null)
  }else {
    if(pred__8183__8186.call(null, "\ufdd0'range", expr__8184__8187)) {
      return new c2.scale._power(this__8182.domain, G__8172, this__8182.__meta, this__8182.__extmap, null)
    }else {
      return new c2.scale._power(this__8182.domain, this__8182.range, this__8182.__meta, cljs.core.assoc.call(null, this__8182.__extmap, k__2331__auto__, G__8172), null)
    }
  }
};
c2.scale._power.prototype.call = function(this_sym8188, x) {
  var this__8189 = this;
  var this_sym8188__8190 = this;
  var ___8191 = this_sym8188__8190;
  return cljs.core.comp.call(null, c2.scale.linear.call(null, "\ufdd0'domain", cljs.core.map.call(null, c2.maths.expt, this__8189.domain), "\ufdd0'range", this__8189.range), c2.maths.expt).call(null, x)
};
c2.scale._power.prototype.apply = function(this_sym8175, args8176) {
  var this__8192 = this;
  return this_sym8175.call.apply(this_sym8175, [this_sym8175].concat(args8176.slice()))
};
c2.scale._power.prototype.cljs$core$ICollection$_conj$arity$2 = function(this__2328__auto__, entry__2329__auto__) {
  var this__8193 = this;
  if(cljs.core.vector_QMARK_.call(null, entry__2329__auto__)) {
    return this__2328__auto__.cljs$core$IAssociative$_assoc$arity$3(this__2328__auto__, cljs.core._nth.call(null, entry__2329__auto__, 0), cljs.core._nth.call(null, entry__2329__auto__, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, this__2328__auto__, entry__2329__auto__)
  }
};
c2.scale._power.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this__2335__auto__) {
  var this__8194 = this;
  return cljs.core.seq.call(null, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'domain", this__8194.domain), cljs.core.vector.call(null, "\ufdd0'range", this__8194.range)], true), this__8194.__extmap))
};
c2.scale._power.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(this__2337__auto__, opts__2338__auto__) {
  var this__8195 = this;
  var pr_pair__2339__auto____8196 = function(keyval__2340__auto__) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts__2338__auto__, keyval__2340__auto__)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__2339__auto____8196, [cljs.core.str("#"), cljs.core.str("_power"), cljs.core.str("{")].join(""), ", ", "}", opts__2338__auto__, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'domain", this__8195.domain), cljs.core.vector.call(null, "\ufdd0'range", this__8195.range)], true), this__8195.__extmap))
};
c2.scale._power.prototype.cljs$core$ICounted$_count$arity$1 = function(this__2327__auto__) {
  var this__8197 = this;
  return 2 + cljs.core.count.call(null, this__8197.__extmap)
};
c2.scale._power.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(this__2319__auto__, other__2320__auto__) {
  var this__8198 = this;
  if(cljs.core.truth_(function() {
    var and__3822__auto____8199 = other__2320__auto__;
    if(cljs.core.truth_(and__3822__auto____8199)) {
      var and__3822__auto____8200 = this__2319__auto__.constructor === other__2320__auto__.constructor;
      if(and__3822__auto____8200) {
        return cljs.core.equiv_map.call(null, this__2319__auto__, other__2320__auto__)
      }else {
        return and__3822__auto____8200
      }
    }else {
      return and__3822__auto____8199
    }
  }())) {
    return true
  }else {
    return false
  }
};
c2.scale._power.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(this__2322__auto__, G__8172) {
  var this__8201 = this;
  return new c2.scale._power(this__8201.domain, this__8201.range, G__8172, this__8201.__extmap, this__8201.__hash)
};
c2.scale._power.prototype.cljs$core$IMeta$_meta$arity$1 = function(this__2321__auto__) {
  var this__8202 = this;
  return this__8202.__meta
};
c2.scale._power.prototype.cljs$core$IMap$_dissoc$arity$2 = function(this__2332__auto__, k__2333__auto__) {
  var this__8203 = this;
  if(cljs.core.contains_QMARK_.call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'domain", "\ufdd0'range"]), k__2333__auto__)) {
    return cljs.core.dissoc.call(null, cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, this__2332__auto__), this__8203.__meta), k__2333__auto__)
  }else {
    return new c2.scale._power(this__8203.domain, this__8203.range, this__8203.__meta, cljs.core.not_empty.call(null, cljs.core.dissoc.call(null, this__8203.__extmap, k__2333__auto__)), null)
  }
};
c2.scale._power.cljs$lang$type = true;
c2.scale._power.cljs$lang$ctorPrSeq = function(this__2357__auto__) {
  return cljs.core.list.call(null, "c2.scale/_power")
};
c2.scale.__GT__power = function __GT__power(domain, range) {
  return new c2.scale._power(domain, range)
};
c2.scale.map__GT__power = function map__GT__power(G__8174) {
  return new c2.scale._power((new cljs.core.Keyword("\ufdd0'domain")).call(null, G__8174), (new cljs.core.Keyword("\ufdd0'range")).call(null, G__8174), null, cljs.core.dissoc.call(null, G__8174, "\ufdd0'domain", "\ufdd0'range"))
};
c2.scale._power;
c2.scale.power = function() {
  var power__delegate = function(kwargs) {
    return c2.scale.map__GT__power.call(null, cljs.core.merge.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'domain", "\ufdd0'range"], {"\ufdd0'domain":cljs.core.PersistentVector.fromArray([0, 1], true), "\ufdd0'range":cljs.core.PersistentVector.fromArray([0, 1], true)}), cljs.core.apply.call(null, cljs.core.hash_map, kwargs)))
  };
  var power = function(var_args) {
    var kwargs = null;
    if(goog.isDef(var_args)) {
      kwargs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return power__delegate.call(this, kwargs)
  };
  power.cljs$lang$maxFixedArity = 0;
  power.cljs$lang$applyTo = function(arglist__8204) {
    var kwargs = cljs.core.seq(arglist__8204);
    return power__delegate(kwargs)
  };
  power.cljs$lang$arity$variadic = power__delegate;
  return power
}();
c2.scale._log = function(domain, range, __meta, __extmap) {
  this.domain = domain;
  this.range = range;
  this.__meta = __meta;
  this.__extmap = __extmap;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 619054859;
  if(arguments.length > 2) {
    this.__meta = __meta;
    this.__extmap = __extmap
  }else {
    this.__meta = null;
    this.__extmap = null
  }
};
c2.scale._log.prototype.cljs$core$IHash$_hash$arity$1 = function(this__2318__auto__) {
  var this__8210 = this;
  var h__2192__auto____8211 = this__8210.__hash;
  if(!(h__2192__auto____8211 == null)) {
    return h__2192__auto____8211
  }else {
    var h__2192__auto____8212 = cljs.core.hash_imap.call(null, this__2318__auto__);
    this__8210.__hash = h__2192__auto____8212;
    return h__2192__auto____8212
  }
};
c2.scale._log.prototype.cljs$core$ILookup$_lookup$arity$2 = function(this__2323__auto__, k__2324__auto__) {
  var this__8213 = this;
  return this__2323__auto__.cljs$core$ILookup$_lookup$arity$3(this__2323__auto__, k__2324__auto__, null)
};
c2.scale._log.prototype.cljs$core$ILookup$_lookup$arity$3 = function(this__2325__auto__, k8206, else__2326__auto__) {
  var this__8214 = this;
  if(k8206 === "\ufdd0'domain") {
    return this__8214.domain
  }else {
    if(k8206 === "\ufdd0'range") {
      return this__8214.range
    }else {
      if("\ufdd0'else") {
        return cljs.core._lookup.call(null, this__8214.__extmap, k8206, else__2326__auto__)
      }else {
        return null
      }
    }
  }
};
c2.scale._log.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(this__2330__auto__, k__2331__auto__, G__8205) {
  var this__8215 = this;
  var pred__8216__8219 = cljs.core.identical_QMARK_;
  var expr__8217__8220 = k__2331__auto__;
  if(pred__8216__8219.call(null, "\ufdd0'domain", expr__8217__8220)) {
    return new c2.scale._log(G__8205, this__8215.range, this__8215.__meta, this__8215.__extmap, null)
  }else {
    if(pred__8216__8219.call(null, "\ufdd0'range", expr__8217__8220)) {
      return new c2.scale._log(this__8215.domain, G__8205, this__8215.__meta, this__8215.__extmap, null)
    }else {
      return new c2.scale._log(this__8215.domain, this__8215.range, this__8215.__meta, cljs.core.assoc.call(null, this__8215.__extmap, k__2331__auto__, G__8205), null)
    }
  }
};
c2.scale._log.prototype.call = function(this_sym8221, x) {
  var this__8222 = this;
  var this_sym8221__8223 = this;
  var ___8224 = this_sym8221__8223;
  return cljs.core.comp.call(null, c2.scale.linear.call(null, "\ufdd0'domain", cljs.core.map.call(null, c2.maths.log, this__8222.domain), "\ufdd0'range", this__8222.range), c2.maths.log).call(null, x)
};
c2.scale._log.prototype.apply = function(this_sym8208, args8209) {
  var this__8225 = this;
  return this_sym8208.call.apply(this_sym8208, [this_sym8208].concat(args8209.slice()))
};
c2.scale._log.prototype.cljs$core$ICollection$_conj$arity$2 = function(this__2328__auto__, entry__2329__auto__) {
  var this__8226 = this;
  if(cljs.core.vector_QMARK_.call(null, entry__2329__auto__)) {
    return this__2328__auto__.cljs$core$IAssociative$_assoc$arity$3(this__2328__auto__, cljs.core._nth.call(null, entry__2329__auto__, 0), cljs.core._nth.call(null, entry__2329__auto__, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, this__2328__auto__, entry__2329__auto__)
  }
};
c2.scale._log.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this__2335__auto__) {
  var this__8227 = this;
  return cljs.core.seq.call(null, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'domain", this__8227.domain), cljs.core.vector.call(null, "\ufdd0'range", this__8227.range)], true), this__8227.__extmap))
};
c2.scale._log.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(this__2337__auto__, opts__2338__auto__) {
  var this__8228 = this;
  var pr_pair__2339__auto____8229 = function(keyval__2340__auto__) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts__2338__auto__, keyval__2340__auto__)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__2339__auto____8229, [cljs.core.str("#"), cljs.core.str("_log"), cljs.core.str("{")].join(""), ", ", "}", opts__2338__auto__, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'domain", this__8228.domain), cljs.core.vector.call(null, "\ufdd0'range", this__8228.range)], true), this__8228.__extmap))
};
c2.scale._log.prototype.cljs$core$ICounted$_count$arity$1 = function(this__2327__auto__) {
  var this__8230 = this;
  return 2 + cljs.core.count.call(null, this__8230.__extmap)
};
c2.scale._log.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(this__2319__auto__, other__2320__auto__) {
  var this__8231 = this;
  if(cljs.core.truth_(function() {
    var and__3822__auto____8232 = other__2320__auto__;
    if(cljs.core.truth_(and__3822__auto____8232)) {
      var and__3822__auto____8233 = this__2319__auto__.constructor === other__2320__auto__.constructor;
      if(and__3822__auto____8233) {
        return cljs.core.equiv_map.call(null, this__2319__auto__, other__2320__auto__)
      }else {
        return and__3822__auto____8233
      }
    }else {
      return and__3822__auto____8232
    }
  }())) {
    return true
  }else {
    return false
  }
};
c2.scale._log.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(this__2322__auto__, G__8205) {
  var this__8234 = this;
  return new c2.scale._log(this__8234.domain, this__8234.range, G__8205, this__8234.__extmap, this__8234.__hash)
};
c2.scale._log.prototype.cljs$core$IMeta$_meta$arity$1 = function(this__2321__auto__) {
  var this__8235 = this;
  return this__8235.__meta
};
c2.scale._log.prototype.cljs$core$IMap$_dissoc$arity$2 = function(this__2332__auto__, k__2333__auto__) {
  var this__8236 = this;
  if(cljs.core.contains_QMARK_.call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'domain", "\ufdd0'range"]), k__2333__auto__)) {
    return cljs.core.dissoc.call(null, cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, this__2332__auto__), this__8236.__meta), k__2333__auto__)
  }else {
    return new c2.scale._log(this__8236.domain, this__8236.range, this__8236.__meta, cljs.core.not_empty.call(null, cljs.core.dissoc.call(null, this__8236.__extmap, k__2333__auto__)), null)
  }
};
c2.scale._log.cljs$lang$type = true;
c2.scale._log.cljs$lang$ctorPrSeq = function(this__2357__auto__) {
  return cljs.core.list.call(null, "c2.scale/_log")
};
c2.scale.__GT__log = function __GT__log(domain, range) {
  return new c2.scale._log(domain, range)
};
c2.scale.map__GT__log = function map__GT__log(G__8207) {
  return new c2.scale._log((new cljs.core.Keyword("\ufdd0'domain")).call(null, G__8207), (new cljs.core.Keyword("\ufdd0'range")).call(null, G__8207), null, cljs.core.dissoc.call(null, G__8207, "\ufdd0'domain", "\ufdd0'range"))
};
c2.scale._log;
c2.scale.log = function() {
  var log__delegate = function(kwargs) {
    return c2.scale.map__GT__log.call(null, cljs.core.merge.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'domain", "\ufdd0'range"], {"\ufdd0'domain":cljs.core.PersistentVector.fromArray([1, 10], true), "\ufdd0'range":cljs.core.PersistentVector.fromArray([0, 1], true)}), cljs.core.apply.call(null, cljs.core.hash_map, kwargs)))
  };
  var log = function(var_args) {
    var kwargs = null;
    if(goog.isDef(var_args)) {
      kwargs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return log__delegate.call(this, kwargs)
  };
  log.cljs$lang$maxFixedArity = 0;
  log.cljs$lang$applyTo = function(arglist__8237) {
    var kwargs = cljs.core.seq(arglist__8237);
    return log__delegate(kwargs)
  };
  log.cljs$lang$arity$variadic = log__delegate;
  return log
}();
goog.provide("c2.core");
goog.require("cljs.core");
goog.require("reflex.core");
goog.require("c2.dom");
goog.require("singult.core");
c2.core.node_data = singult.core.node_data;
c2.core.unify = function() {
  var unify__delegate = function(data, mapping, args) {
    if(cljs.core.seq.call(null, data)) {
      mapping.call(null, cljs.core.first.call(null, data))
    }else {
    }
    return cljs.core.apply.call(null, singult.core.unify, data, mapping, args)
  };
  var unify = function(data, mapping, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return unify__delegate.call(this, data, mapping, args)
  };
  unify.cljs$lang$maxFixedArity = 2;
  unify.cljs$lang$applyTo = function(arglist__8296) {
    var data = cljs.core.first(arglist__8296);
    var mapping = cljs.core.first(cljs.core.next(arglist__8296));
    var args = cljs.core.rest(cljs.core.next(arglist__8296));
    return unify__delegate(data, mapping, args)
  };
  unify.cljs$lang$arity$variadic = unify__delegate;
  return unify
}();
goog.provide("dixon.core");
goog.require("cljs.core");
goog.require("c2.core");
goog.require("dixon.ui");
goog.require("dixon.grid");
goog.require("goog.dom");
goog.require("c2.scale");
goog.require("dixon.ui");
goog.require("dixon.grid");
goog.require("c2.core");
dixon.core.grid_width = 40;
dixon.core.grid_height = 30;
dixon.core.display_atom = cljs.core.atom.call(null, cljs.core.ObjMap.EMPTY);
dixon.core.sim_state = cljs.core.atom.call(null, cljs.core.ObjMap.EMPTY);
dixon.core.viz_state = cljs.core.atom.call(null, cljs.core.ObjMap.EMPTY);
dixon.core.docycle = function docycle(grid, w, h, onfunc) {
  var co__6305__auto____332866 = function() {
    var co__6254__auto____332865 = new reflex.core.ComputedObservable(null, true, function() {
      var cell_size__332854 = (new cljs.core.Keyword("\ufdd0'zoom")).call(null, cljs.core.deref.call(null, dixon.core.viz_state), 5);
      var sq_size__332855 = cell_size__332854 > 8 ? cell_size__332854 - 4 : cell_size__332854;
      var curv_size__332856 = cell_size__332854 > 8 ? 3 : 0;
      return cljs.core.PersistentVector.fromArray(["\ufdd0'svg#board", cljs.core.ObjMap.fromObject(["\ufdd0'width", "\ufdd0'height"], {"\ufdd0'width":820, "\ufdd0'height":620}), c2.core.unify.call(null, cljs.core.deref.call(null, dixon.core.display_atom), function(p__332857) {
        var map__332858__332859 = p__332857;
        var map__332858__332860 = cljs.core.seq_QMARK_.call(null, map__332858__332859) ? cljs.core.apply.call(null, cljs.core.hash_map, map__332858__332859) : map__332858__332859;
        var state__332861 = cljs.core._lookup.call(null, map__332858__332860, "\ufdd0'state", null);
        var y__332862 = cljs.core._lookup.call(null, map__332858__332860, "\ufdd0'y", null);
        var x__332863 = cljs.core._lookup.call(null, map__332858__332860, "\ufdd0'x", null);
        var css_class__332864 = cljs.core.truth_(state__332861) ? "box-on" : "box-off";
        return cljs.core.PersistentVector.fromArray(["\ufdd0'rect", cljs.core.ObjMap.fromObject(["\ufdd0'x", "\ufdd0'y", "\ufdd0'height", "\ufdd0'width", "\ufdd0'class", "\ufdd0'rx"], {"\ufdd0'x":sq_size__332855 * x__332863, "\ufdd0'y":sq_size__332855 * y__332862, "\ufdd0'height":cell_size__332854, "\ufdd0'width":cell_size__332854, "\ufdd0'class":css_class__332864, "\ufdd0'rx":curv_size__332856})], true)
      })], true)
    }, cljs.core.gensym.call(null, "computed-observable"), cljs.core.ObjMap.EMPTY, cljs.core.ObjMap.EMPTY);
    cljs.core.deref.call(null, co__6254__auto____332865);
    return co__6254__auto____332865
  }();
  var $el__6306__auto____332867 = c2.dom.__GT_dom.call(null, "#board");
  singult.core.merge_BANG_.call(null, $el__6306__auto____332867, cljs.core.deref.call(null, co__6305__auto____332866));
  cljs.core.add_watch.call(null, co__6305__auto____332866, "\ufdd0'update-dom", function() {
    return singult.core.merge_BANG_.call(null, $el__6306__auto____332867, cljs.core.deref.call(null, co__6305__auto____332866))
  });
  return co__6305__auto____332866
};
var co__6305__auto____332874 = function() {
  var co__6254__auto____332873 = new reflex.core.ComputedObservable(null, true, function() {
    return cljs.core.PersistentVector.fromArray(["\ufdd0'div#stepnum", c2.core.unify.call(null, cljs.core.deref.call(null, dixon.core.sim_state), function(p__332868) {
      var vec__332869__332870 = p__332868;
      var label__332871 = cljs.core.nth.call(null, vec__332869__332870, 0, null);
      var val__332872 = cljs.core.nth.call(null, vec__332869__332870, 1, null);
      return cljs.core.PersistentVector.fromArray(["\ufdd0'div", [cljs.core.str(label__332871), cljs.core.str(" = "), cljs.core.str(val__332872)].join("")], true)
    })], true)
  }, cljs.core.gensym.call(null, "computed-observable"), cljs.core.ObjMap.EMPTY, cljs.core.ObjMap.EMPTY);
  cljs.core.deref.call(null, co__6254__auto____332873);
  return co__6254__auto____332873
}();
var $el__6306__auto____332875 = c2.dom.__GT_dom.call(null, "#stepnum");
singult.core.merge_BANG_.call(null, $el__6306__auto____332875, cljs.core.deref.call(null, co__6305__auto____332874));
cljs.core.add_watch.call(null, co__6305__auto____332874, "\ufdd0'update-dom", function() {
  return singult.core.merge_BANG_.call(null, $el__6306__auto____332875, cljs.core.deref.call(null, co__6305__auto____332874))
});
co__6305__auto____332874;
var co__6305__auto____332882 = function() {
  var co__6254__auto____332881 = new reflex.core.ComputedObservable(null, true, function() {
    return cljs.core.PersistentVector.fromArray(["\ufdd0'div#vizstate", c2.core.unify.call(null, cljs.core.deref.call(null, dixon.core.viz_state), function(p__332876) {
      var vec__332877__332878 = p__332876;
      var label__332879 = cljs.core.nth.call(null, vec__332877__332878, 0, null);
      var val__332880 = cljs.core.nth.call(null, vec__332877__332878, 1, null);
      return cljs.core.PersistentVector.fromArray(["\ufdd0'div", [cljs.core.str(label__332879), cljs.core.str(" = "), cljs.core.str(val__332880)].join("")], true)
    })], true)
  }, cljs.core.gensym.call(null, "computed-observable"), cljs.core.ObjMap.EMPTY, cljs.core.ObjMap.EMPTY);
  cljs.core.deref.call(null, co__6254__auto____332881);
  return co__6254__auto____332881
}();
var $el__6306__auto____332883 = c2.dom.__GT_dom.call(null, "#vizstate");
singult.core.merge_BANG_.call(null, $el__6306__auto____332883, cljs.core.deref.call(null, co__6305__auto____332882));
cljs.core.add_watch.call(null, co__6305__auto____332882, "\ufdd0'update-dom", function() {
  return singult.core.merge_BANG_.call(null, $el__6306__auto____332883, cljs.core.deref.call(null, co__6305__auto____332882))
});
co__6305__auto____332882;
dixon.core.grid_atom = cljs.core.atom.call(null, cljs.core.PersistentVector.fromArray([cljs.core.PersistentVector.EMPTY], true));
dixon.core.init_sim = function init_sim() {
  cljs.core.reset_BANG_.call(null, dixon.core.grid_atom, dixon.grid.populate_grid.call(null, dixon.grid.empty_grid.call(null, dixon.core.grid_width, dixon.core.grid_height), cljs.core.PersistentHashSet.fromArray([cljs.core.PersistentVector.fromArray([2, 1], true), cljs.core.PersistentVector.fromArray([2, 2], true), cljs.core.PersistentVector.fromArray([0, 1], true), cljs.core.PersistentVector.fromArray([1, 2], true), cljs.core.PersistentVector.fromArray([2, 0], true)])));
  cljs.core.swap_BANG_.call(null, dixon.core.sim_state, cljs.core.assoc, "\ufdd0'step-num", 0);
  var n__2527__auto____332888 = 1E3;
  var ___332889 = 0;
  while(true) {
    if(___332889 < n__2527__auto____332888) {
      var x__332890 = cljs.core.rand_int.call(null, dixon.core.grid_width);
      var y__332891 = cljs.core.rand_int.call(null, dixon.core.grid_height);
      cljs.core.reset_BANG_.call(null, dixon.core.grid_atom, dixon.grid.populate_grid.call(null, cljs.core.deref.call(null, dixon.core.grid_atom), cljs.core.PersistentHashSet.fromArray([cljs.core.PersistentVector.fromArray([x__332890, y__332891], true)])));
      var G__332892 = ___332889 + 1;
      ___332889 = G__332892;
      continue
    }else {
      return null
    }
    break
  }
};
dixon.core.grid_is_on = function grid_is_on(grid, y, x) {
  return cljs.core.nth.call(null, cljs.core.nth.call(null, cljs.core.deref.call(null, dixon.core.grid_atom), y), x)
};
dixon.core.update_display_atom = function update_display_atom() {
  var iter__2462__auto____332934 = function iter__332914(s__332915) {
    return new cljs.core.LazySeq(null, false, function() {
      var s__332915__332926 = s__332915;
      while(true) {
        if(cljs.core.seq.call(null, s__332915__332926)) {
          var x__332927 = cljs.core.first.call(null, s__332915__332926);
          var iterys__2460__auto____332932 = function(s__332915__332926, x__332927) {
            return function iter__332916(s__332917) {
              return new cljs.core.LazySeq(null, false, function(s__332915__332926, x__332927) {
                return function() {
                  var s__332917__332930 = s__332917;
                  while(true) {
                    if(cljs.core.seq.call(null, s__332917__332930)) {
                      var y__332931 = cljs.core.first.call(null, s__332917__332930);
                      return cljs.core.cons.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'x", "\ufdd0'y", "\ufdd0'state"], {"\ufdd0'x":x__332927, "\ufdd0'y":y__332931, "\ufdd0'state":dixon.core.grid_is_on.call(null, cljs.core.deref.call(null, dixon.core.grid_atom), x__332927, y__332931)}), iter__332916.call(null, cljs.core.rest.call(null, s__332917__332930)))
                    }else {
                      return null
                    }
                    break
                  }
                }
              }(s__332915__332926, x__332927), null)
            }
          }(s__332915__332926, x__332927);
          var fs__2461__auto____332933 = cljs.core.seq.call(null, iterys__2460__auto____332932.call(null, cljs.core.range.call(null, dixon.core.grid_height)));
          if(fs__2461__auto____332933) {
            return cljs.core.concat.call(null, fs__2461__auto____332933, iter__332914.call(null, cljs.core.rest.call(null, s__332915__332926)))
          }else {
            var G__332935 = cljs.core.rest.call(null, s__332915__332926);
            s__332915__332926 = G__332935;
            continue
          }
        }else {
          return null
        }
        break
      }
    }, null)
  };
  return iter__2462__auto____332934.call(null, cljs.core.range.call(null, dixon.core.grid_width))
};
cljs.core.swap_BANG_.call(null, dixon.core.viz_state, cljs.core.assoc, "\ufdd0'zoom", 24);
dixon.core.docycle.call(null, dixon.core.grid_atom, dixon.core.grid_width, dixon.core.grid_height, dixon.core.grid_is_on);
dixon.core.update_viz = function update_viz() {
  if((new cljs.core.Keyword("\ufdd0'zoom-state")).call(null, cljs.core.deref.call(null, dixon.ui.uistate)) < 0) {
    cljs.core.swap_BANG_.call(null, dixon.core.viz_state, cljs.core.update_in, cljs.core.PersistentVector.fromArray(["\ufdd0'zoom"], true), function(p1__332936_SHARP_) {
      return p1__332936_SHARP_ / 2
    });
    var old_val__332940 = cljs.core.deref.call(null, dixon.core.display_atom);
    cljs.core.reset_BANG_.call(null, dixon.core.display_atom, cljs.core.ObjMap.EMPTY);
    cljs.core.reset_BANG_.call(null, dixon.core.display_atom, old_val__332940);
    dixon.core.docycle.call(null, dixon.core.grid_atom, dixon.core.grid_width, dixon.core.grid_height, dixon.core.grid_is_on)
  }else {
  }
  if((new cljs.core.Keyword("\ufdd0'zoom-state")).call(null, cljs.core.deref.call(null, dixon.ui.uistate)) > 0) {
    cljs.core.swap_BANG_.call(null, dixon.core.viz_state, cljs.core.update_in, cljs.core.PersistentVector.fromArray(["\ufdd0'zoom"], true), function(p1__332937_SHARP_) {
      return p1__332937_SHARP_ * 2
    });
    var old_val__332941 = cljs.core.deref.call(null, dixon.core.display_atom);
    cljs.core.reset_BANG_.call(null, dixon.core.display_atom, cljs.core.ObjMap.EMPTY);
    cljs.core.reset_BANG_.call(null, dixon.core.display_atom, old_val__332941)
  }else {
  }
  return cljs.core.swap_BANG_.call(null, dixon.ui.uistate, cljs.core.assoc, "\ufdd0'zoom-state", 0)
};
dixon.core.update_sim = function update_sim() {
  if(cljs.core.truth_((new cljs.core.Keyword("\ufdd0'play-state")).call(null, cljs.core.deref.call(null, dixon.ui.uistate)).call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'stop-awaiting"])))) {
    cljs.core.swap_BANG_.call(null, dixon.core.sim_state, cljs.core.dissoc, "\ufdd0'initialized");
    cljs.core.swap_BANG_.call(null, dixon.ui.uistate, cljs.core.assoc, "\ufdd0'play-state", "\ufdd0'stop-complete")
  }else {
  }
  if(cljs.core.truth_((new cljs.core.Keyword("\ufdd0'play-state")).call(null, cljs.core.deref.call(null, dixon.ui.uistate)).call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'step-awaiting", "\ufdd0'play"])))) {
    if(cljs.core.not.call(null, (new cljs.core.Keyword("\ufdd0'initialized")).call(null, cljs.core.deref.call(null, dixon.core.sim_state)))) {
      dixon.core.init_sim.call(null);
      cljs.core.swap_BANG_.call(null, dixon.core.sim_state, cljs.core.assoc, "\ufdd0'initialized", true)
    }else {
    }
    if(cljs.core._EQ_.call(null, (new cljs.core.Keyword("\ufdd0'play-state")).call(null, cljs.core.deref.call(null, dixon.ui.uistate)), "\ufdd0'step-awaiting")) {
      cljs.core.swap_BANG_.call(null, dixon.ui.uistate, cljs.core.assoc, "\ufdd0'play-state", "\ufdd0'step-complete")
    }else {
    }
    cljs.core.swap_BANG_.call(null, dixon.core.grid_atom, dixon.grid.grid_step);
    cljs.core.swap_BANG_.call(null, dixon.core.sim_state, cljs.core.update_in, cljs.core.PersistentVector.fromArray(["\ufdd0'step-num"], true), cljs.core.inc);
    return cljs.core.reset_BANG_.call(null, dixon.core.display_atom, dixon.core.update_display_atom.call(null))
  }else {
    return null
  }
};
dixon.core.nextloop = function nextloop() {
  dixon.core.update_sim.call(null);
  return dixon.core.update_viz.call(null)
};
dixon.core.animation_loop = function animation_loop() {
  goog.dom.getWindow().requestAnimationFrame(animation_loop);
  return dixon.core.nextloop.call(null)
};
dixon.core.animation_loop.call(null);
