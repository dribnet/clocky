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
goog.provide("goog.debug.Error");
goog.debug.Error = function(opt_msg) {
  this.stack = (new Error).stack || "";
  if(opt_msg) {
    this.message = String(opt_msg)
  }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
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
  var x__8300 = x == null ? null : x;
  if(p[goog.typeOf(x__8300)]) {
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
    var G__8301__delegate = function(array, i, idxs) {
      return cljs.core.apply.call(null, aget, aget.call(null, array, i), idxs)
    };
    var G__8301 = function(array, i, var_args) {
      var idxs = null;
      if(goog.isDef(var_args)) {
        idxs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__8301__delegate.call(this, array, i, idxs)
    };
    G__8301.cljs$lang$maxFixedArity = 2;
    G__8301.cljs$lang$applyTo = function(arglist__8302) {
      var array = cljs.core.first(arglist__8302);
      var i = cljs.core.first(cljs.core.next(arglist__8302));
      var idxs = cljs.core.rest(cljs.core.next(arglist__8302));
      return G__8301__delegate(array, i, idxs)
    };
    G__8301.cljs$lang$arity$variadic = G__8301__delegate;
    return G__8301
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
      var and__3822__auto____8387 = this$;
      if(and__3822__auto____8387) {
        return this$.cljs$core$IFn$_invoke$arity$1
      }else {
        return and__3822__auto____8387
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$1(this$)
    }else {
      var x__2363__auto____8388 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8389 = cljs.core._invoke[goog.typeOf(x__2363__auto____8388)];
        if(or__3824__auto____8389) {
          return or__3824__auto____8389
        }else {
          var or__3824__auto____8390 = cljs.core._invoke["_"];
          if(or__3824__auto____8390) {
            return or__3824__auto____8390
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var _invoke__2 = function(this$, a) {
    if(function() {
      var and__3822__auto____8391 = this$;
      if(and__3822__auto____8391) {
        return this$.cljs$core$IFn$_invoke$arity$2
      }else {
        return and__3822__auto____8391
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$2(this$, a)
    }else {
      var x__2363__auto____8392 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8393 = cljs.core._invoke[goog.typeOf(x__2363__auto____8392)];
        if(or__3824__auto____8393) {
          return or__3824__auto____8393
        }else {
          var or__3824__auto____8394 = cljs.core._invoke["_"];
          if(or__3824__auto____8394) {
            return or__3824__auto____8394
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a)
    }
  };
  var _invoke__3 = function(this$, a, b) {
    if(function() {
      var and__3822__auto____8395 = this$;
      if(and__3822__auto____8395) {
        return this$.cljs$core$IFn$_invoke$arity$3
      }else {
        return and__3822__auto____8395
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$3(this$, a, b)
    }else {
      var x__2363__auto____8396 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8397 = cljs.core._invoke[goog.typeOf(x__2363__auto____8396)];
        if(or__3824__auto____8397) {
          return or__3824__auto____8397
        }else {
          var or__3824__auto____8398 = cljs.core._invoke["_"];
          if(or__3824__auto____8398) {
            return or__3824__auto____8398
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b)
    }
  };
  var _invoke__4 = function(this$, a, b, c) {
    if(function() {
      var and__3822__auto____8399 = this$;
      if(and__3822__auto____8399) {
        return this$.cljs$core$IFn$_invoke$arity$4
      }else {
        return and__3822__auto____8399
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$4(this$, a, b, c)
    }else {
      var x__2363__auto____8400 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8401 = cljs.core._invoke[goog.typeOf(x__2363__auto____8400)];
        if(or__3824__auto____8401) {
          return or__3824__auto____8401
        }else {
          var or__3824__auto____8402 = cljs.core._invoke["_"];
          if(or__3824__auto____8402) {
            return or__3824__auto____8402
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c)
    }
  };
  var _invoke__5 = function(this$, a, b, c, d) {
    if(function() {
      var and__3822__auto____8403 = this$;
      if(and__3822__auto____8403) {
        return this$.cljs$core$IFn$_invoke$arity$5
      }else {
        return and__3822__auto____8403
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$5(this$, a, b, c, d)
    }else {
      var x__2363__auto____8404 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8405 = cljs.core._invoke[goog.typeOf(x__2363__auto____8404)];
        if(or__3824__auto____8405) {
          return or__3824__auto____8405
        }else {
          var or__3824__auto____8406 = cljs.core._invoke["_"];
          if(or__3824__auto____8406) {
            return or__3824__auto____8406
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d)
    }
  };
  var _invoke__6 = function(this$, a, b, c, d, e) {
    if(function() {
      var and__3822__auto____8407 = this$;
      if(and__3822__auto____8407) {
        return this$.cljs$core$IFn$_invoke$arity$6
      }else {
        return and__3822__auto____8407
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$6(this$, a, b, c, d, e)
    }else {
      var x__2363__auto____8408 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8409 = cljs.core._invoke[goog.typeOf(x__2363__auto____8408)];
        if(or__3824__auto____8409) {
          return or__3824__auto____8409
        }else {
          var or__3824__auto____8410 = cljs.core._invoke["_"];
          if(or__3824__auto____8410) {
            return or__3824__auto____8410
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e)
    }
  };
  var _invoke__7 = function(this$, a, b, c, d, e, f) {
    if(function() {
      var and__3822__auto____8411 = this$;
      if(and__3822__auto____8411) {
        return this$.cljs$core$IFn$_invoke$arity$7
      }else {
        return and__3822__auto____8411
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$7(this$, a, b, c, d, e, f)
    }else {
      var x__2363__auto____8412 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8413 = cljs.core._invoke[goog.typeOf(x__2363__auto____8412)];
        if(or__3824__auto____8413) {
          return or__3824__auto____8413
        }else {
          var or__3824__auto____8414 = cljs.core._invoke["_"];
          if(or__3824__auto____8414) {
            return or__3824__auto____8414
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f)
    }
  };
  var _invoke__8 = function(this$, a, b, c, d, e, f, g) {
    if(function() {
      var and__3822__auto____8415 = this$;
      if(and__3822__auto____8415) {
        return this$.cljs$core$IFn$_invoke$arity$8
      }else {
        return and__3822__auto____8415
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$8(this$, a, b, c, d, e, f, g)
    }else {
      var x__2363__auto____8416 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8417 = cljs.core._invoke[goog.typeOf(x__2363__auto____8416)];
        if(or__3824__auto____8417) {
          return or__3824__auto____8417
        }else {
          var or__3824__auto____8418 = cljs.core._invoke["_"];
          if(or__3824__auto____8418) {
            return or__3824__auto____8418
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g)
    }
  };
  var _invoke__9 = function(this$, a, b, c, d, e, f, g, h) {
    if(function() {
      var and__3822__auto____8419 = this$;
      if(and__3822__auto____8419) {
        return this$.cljs$core$IFn$_invoke$arity$9
      }else {
        return and__3822__auto____8419
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$9(this$, a, b, c, d, e, f, g, h)
    }else {
      var x__2363__auto____8420 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8421 = cljs.core._invoke[goog.typeOf(x__2363__auto____8420)];
        if(or__3824__auto____8421) {
          return or__3824__auto____8421
        }else {
          var or__3824__auto____8422 = cljs.core._invoke["_"];
          if(or__3824__auto____8422) {
            return or__3824__auto____8422
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h)
    }
  };
  var _invoke__10 = function(this$, a, b, c, d, e, f, g, h, i) {
    if(function() {
      var and__3822__auto____8423 = this$;
      if(and__3822__auto____8423) {
        return this$.cljs$core$IFn$_invoke$arity$10
      }else {
        return and__3822__auto____8423
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$10(this$, a, b, c, d, e, f, g, h, i)
    }else {
      var x__2363__auto____8424 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8425 = cljs.core._invoke[goog.typeOf(x__2363__auto____8424)];
        if(or__3824__auto____8425) {
          return or__3824__auto____8425
        }else {
          var or__3824__auto____8426 = cljs.core._invoke["_"];
          if(or__3824__auto____8426) {
            return or__3824__auto____8426
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i)
    }
  };
  var _invoke__11 = function(this$, a, b, c, d, e, f, g, h, i, j) {
    if(function() {
      var and__3822__auto____8427 = this$;
      if(and__3822__auto____8427) {
        return this$.cljs$core$IFn$_invoke$arity$11
      }else {
        return and__3822__auto____8427
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$11(this$, a, b, c, d, e, f, g, h, i, j)
    }else {
      var x__2363__auto____8428 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8429 = cljs.core._invoke[goog.typeOf(x__2363__auto____8428)];
        if(or__3824__auto____8429) {
          return or__3824__auto____8429
        }else {
          var or__3824__auto____8430 = cljs.core._invoke["_"];
          if(or__3824__auto____8430) {
            return or__3824__auto____8430
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j)
    }
  };
  var _invoke__12 = function(this$, a, b, c, d, e, f, g, h, i, j, k) {
    if(function() {
      var and__3822__auto____8431 = this$;
      if(and__3822__auto____8431) {
        return this$.cljs$core$IFn$_invoke$arity$12
      }else {
        return and__3822__auto____8431
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$12(this$, a, b, c, d, e, f, g, h, i, j, k)
    }else {
      var x__2363__auto____8432 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8433 = cljs.core._invoke[goog.typeOf(x__2363__auto____8432)];
        if(or__3824__auto____8433) {
          return or__3824__auto____8433
        }else {
          var or__3824__auto____8434 = cljs.core._invoke["_"];
          if(or__3824__auto____8434) {
            return or__3824__auto____8434
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k)
    }
  };
  var _invoke__13 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l) {
    if(function() {
      var and__3822__auto____8435 = this$;
      if(and__3822__auto____8435) {
        return this$.cljs$core$IFn$_invoke$arity$13
      }else {
        return and__3822__auto____8435
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$13(this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }else {
      var x__2363__auto____8436 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8437 = cljs.core._invoke[goog.typeOf(x__2363__auto____8436)];
        if(or__3824__auto____8437) {
          return or__3824__auto____8437
        }else {
          var or__3824__auto____8438 = cljs.core._invoke["_"];
          if(or__3824__auto____8438) {
            return or__3824__auto____8438
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }
  };
  var _invoke__14 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m) {
    if(function() {
      var and__3822__auto____8439 = this$;
      if(and__3822__auto____8439) {
        return this$.cljs$core$IFn$_invoke$arity$14
      }else {
        return and__3822__auto____8439
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$14(this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }else {
      var x__2363__auto____8440 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8441 = cljs.core._invoke[goog.typeOf(x__2363__auto____8440)];
        if(or__3824__auto____8441) {
          return or__3824__auto____8441
        }else {
          var or__3824__auto____8442 = cljs.core._invoke["_"];
          if(or__3824__auto____8442) {
            return or__3824__auto____8442
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }
  };
  var _invoke__15 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    if(function() {
      var and__3822__auto____8443 = this$;
      if(and__3822__auto____8443) {
        return this$.cljs$core$IFn$_invoke$arity$15
      }else {
        return and__3822__auto____8443
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$15(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }else {
      var x__2363__auto____8444 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8445 = cljs.core._invoke[goog.typeOf(x__2363__auto____8444)];
        if(or__3824__auto____8445) {
          return or__3824__auto____8445
        }else {
          var or__3824__auto____8446 = cljs.core._invoke["_"];
          if(or__3824__auto____8446) {
            return or__3824__auto____8446
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }
  };
  var _invoke__16 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    if(function() {
      var and__3822__auto____8447 = this$;
      if(and__3822__auto____8447) {
        return this$.cljs$core$IFn$_invoke$arity$16
      }else {
        return and__3822__auto____8447
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$16(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }else {
      var x__2363__auto____8448 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8449 = cljs.core._invoke[goog.typeOf(x__2363__auto____8448)];
        if(or__3824__auto____8449) {
          return or__3824__auto____8449
        }else {
          var or__3824__auto____8450 = cljs.core._invoke["_"];
          if(or__3824__auto____8450) {
            return or__3824__auto____8450
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }
  };
  var _invoke__17 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    if(function() {
      var and__3822__auto____8451 = this$;
      if(and__3822__auto____8451) {
        return this$.cljs$core$IFn$_invoke$arity$17
      }else {
        return and__3822__auto____8451
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$17(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }else {
      var x__2363__auto____8452 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8453 = cljs.core._invoke[goog.typeOf(x__2363__auto____8452)];
        if(or__3824__auto____8453) {
          return or__3824__auto____8453
        }else {
          var or__3824__auto____8454 = cljs.core._invoke["_"];
          if(or__3824__auto____8454) {
            return or__3824__auto____8454
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }
  };
  var _invoke__18 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    if(function() {
      var and__3822__auto____8455 = this$;
      if(and__3822__auto____8455) {
        return this$.cljs$core$IFn$_invoke$arity$18
      }else {
        return and__3822__auto____8455
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$18(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }else {
      var x__2363__auto____8456 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8457 = cljs.core._invoke[goog.typeOf(x__2363__auto____8456)];
        if(or__3824__auto____8457) {
          return or__3824__auto____8457
        }else {
          var or__3824__auto____8458 = cljs.core._invoke["_"];
          if(or__3824__auto____8458) {
            return or__3824__auto____8458
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }
  };
  var _invoke__19 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s) {
    if(function() {
      var and__3822__auto____8459 = this$;
      if(and__3822__auto____8459) {
        return this$.cljs$core$IFn$_invoke$arity$19
      }else {
        return and__3822__auto____8459
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$19(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }else {
      var x__2363__auto____8460 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8461 = cljs.core._invoke[goog.typeOf(x__2363__auto____8460)];
        if(or__3824__auto____8461) {
          return or__3824__auto____8461
        }else {
          var or__3824__auto____8462 = cljs.core._invoke["_"];
          if(or__3824__auto____8462) {
            return or__3824__auto____8462
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }
  };
  var _invoke__20 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t) {
    if(function() {
      var and__3822__auto____8463 = this$;
      if(and__3822__auto____8463) {
        return this$.cljs$core$IFn$_invoke$arity$20
      }else {
        return and__3822__auto____8463
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$20(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }else {
      var x__2363__auto____8464 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8465 = cljs.core._invoke[goog.typeOf(x__2363__auto____8464)];
        if(or__3824__auto____8465) {
          return or__3824__auto____8465
        }else {
          var or__3824__auto____8466 = cljs.core._invoke["_"];
          if(or__3824__auto____8466) {
            return or__3824__auto____8466
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }
  };
  var _invoke__21 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    if(function() {
      var and__3822__auto____8467 = this$;
      if(and__3822__auto____8467) {
        return this$.cljs$core$IFn$_invoke$arity$21
      }else {
        return and__3822__auto____8467
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$21(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }else {
      var x__2363__auto____8468 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____8469 = cljs.core._invoke[goog.typeOf(x__2363__auto____8468)];
        if(or__3824__auto____8469) {
          return or__3824__auto____8469
        }else {
          var or__3824__auto____8470 = cljs.core._invoke["_"];
          if(or__3824__auto____8470) {
            return or__3824__auto____8470
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
    var and__3822__auto____8475 = coll;
    if(and__3822__auto____8475) {
      return coll.cljs$core$ICounted$_count$arity$1
    }else {
      return and__3822__auto____8475
    }
  }()) {
    return coll.cljs$core$ICounted$_count$arity$1(coll)
  }else {
    var x__2363__auto____8476 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8477 = cljs.core._count[goog.typeOf(x__2363__auto____8476)];
      if(or__3824__auto____8477) {
        return or__3824__auto____8477
      }else {
        var or__3824__auto____8478 = cljs.core._count["_"];
        if(or__3824__auto____8478) {
          return or__3824__auto____8478
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
    var and__3822__auto____8483 = coll;
    if(and__3822__auto____8483) {
      return coll.cljs$core$IEmptyableCollection$_empty$arity$1
    }else {
      return and__3822__auto____8483
    }
  }()) {
    return coll.cljs$core$IEmptyableCollection$_empty$arity$1(coll)
  }else {
    var x__2363__auto____8484 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8485 = cljs.core._empty[goog.typeOf(x__2363__auto____8484)];
      if(or__3824__auto____8485) {
        return or__3824__auto____8485
      }else {
        var or__3824__auto____8486 = cljs.core._empty["_"];
        if(or__3824__auto____8486) {
          return or__3824__auto____8486
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
    var and__3822__auto____8491 = coll;
    if(and__3822__auto____8491) {
      return coll.cljs$core$ICollection$_conj$arity$2
    }else {
      return and__3822__auto____8491
    }
  }()) {
    return coll.cljs$core$ICollection$_conj$arity$2(coll, o)
  }else {
    var x__2363__auto____8492 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8493 = cljs.core._conj[goog.typeOf(x__2363__auto____8492)];
      if(or__3824__auto____8493) {
        return or__3824__auto____8493
      }else {
        var or__3824__auto____8494 = cljs.core._conj["_"];
        if(or__3824__auto____8494) {
          return or__3824__auto____8494
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
      var and__3822__auto____8503 = coll;
      if(and__3822__auto____8503) {
        return coll.cljs$core$IIndexed$_nth$arity$2
      }else {
        return and__3822__auto____8503
      }
    }()) {
      return coll.cljs$core$IIndexed$_nth$arity$2(coll, n)
    }else {
      var x__2363__auto____8504 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____8505 = cljs.core._nth[goog.typeOf(x__2363__auto____8504)];
        if(or__3824__auto____8505) {
          return or__3824__auto____8505
        }else {
          var or__3824__auto____8506 = cljs.core._nth["_"];
          if(or__3824__auto____8506) {
            return or__3824__auto____8506
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n)
    }
  };
  var _nth__3 = function(coll, n, not_found) {
    if(function() {
      var and__3822__auto____8507 = coll;
      if(and__3822__auto____8507) {
        return coll.cljs$core$IIndexed$_nth$arity$3
      }else {
        return and__3822__auto____8507
      }
    }()) {
      return coll.cljs$core$IIndexed$_nth$arity$3(coll, n, not_found)
    }else {
      var x__2363__auto____8508 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____8509 = cljs.core._nth[goog.typeOf(x__2363__auto____8508)];
        if(or__3824__auto____8509) {
          return or__3824__auto____8509
        }else {
          var or__3824__auto____8510 = cljs.core._nth["_"];
          if(or__3824__auto____8510) {
            return or__3824__auto____8510
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
    var and__3822__auto____8515 = coll;
    if(and__3822__auto____8515) {
      return coll.cljs$core$ISeq$_first$arity$1
    }else {
      return and__3822__auto____8515
    }
  }()) {
    return coll.cljs$core$ISeq$_first$arity$1(coll)
  }else {
    var x__2363__auto____8516 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8517 = cljs.core._first[goog.typeOf(x__2363__auto____8516)];
      if(or__3824__auto____8517) {
        return or__3824__auto____8517
      }else {
        var or__3824__auto____8518 = cljs.core._first["_"];
        if(or__3824__auto____8518) {
          return or__3824__auto____8518
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._rest = function _rest(coll) {
  if(function() {
    var and__3822__auto____8523 = coll;
    if(and__3822__auto____8523) {
      return coll.cljs$core$ISeq$_rest$arity$1
    }else {
      return and__3822__auto____8523
    }
  }()) {
    return coll.cljs$core$ISeq$_rest$arity$1(coll)
  }else {
    var x__2363__auto____8524 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8525 = cljs.core._rest[goog.typeOf(x__2363__auto____8524)];
      if(or__3824__auto____8525) {
        return or__3824__auto____8525
      }else {
        var or__3824__auto____8526 = cljs.core._rest["_"];
        if(or__3824__auto____8526) {
          return or__3824__auto____8526
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
    var and__3822__auto____8531 = coll;
    if(and__3822__auto____8531) {
      return coll.cljs$core$INext$_next$arity$1
    }else {
      return and__3822__auto____8531
    }
  }()) {
    return coll.cljs$core$INext$_next$arity$1(coll)
  }else {
    var x__2363__auto____8532 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8533 = cljs.core._next[goog.typeOf(x__2363__auto____8532)];
      if(or__3824__auto____8533) {
        return or__3824__auto____8533
      }else {
        var or__3824__auto____8534 = cljs.core._next["_"];
        if(or__3824__auto____8534) {
          return or__3824__auto____8534
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
      var and__3822__auto____8543 = o;
      if(and__3822__auto____8543) {
        return o.cljs$core$ILookup$_lookup$arity$2
      }else {
        return and__3822__auto____8543
      }
    }()) {
      return o.cljs$core$ILookup$_lookup$arity$2(o, k)
    }else {
      var x__2363__auto____8544 = o == null ? null : o;
      return function() {
        var or__3824__auto____8545 = cljs.core._lookup[goog.typeOf(x__2363__auto____8544)];
        if(or__3824__auto____8545) {
          return or__3824__auto____8545
        }else {
          var or__3824__auto____8546 = cljs.core._lookup["_"];
          if(or__3824__auto____8546) {
            return or__3824__auto____8546
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k)
    }
  };
  var _lookup__3 = function(o, k, not_found) {
    if(function() {
      var and__3822__auto____8547 = o;
      if(and__3822__auto____8547) {
        return o.cljs$core$ILookup$_lookup$arity$3
      }else {
        return and__3822__auto____8547
      }
    }()) {
      return o.cljs$core$ILookup$_lookup$arity$3(o, k, not_found)
    }else {
      var x__2363__auto____8548 = o == null ? null : o;
      return function() {
        var or__3824__auto____8549 = cljs.core._lookup[goog.typeOf(x__2363__auto____8548)];
        if(or__3824__auto____8549) {
          return or__3824__auto____8549
        }else {
          var or__3824__auto____8550 = cljs.core._lookup["_"];
          if(or__3824__auto____8550) {
            return or__3824__auto____8550
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
    var and__3822__auto____8555 = coll;
    if(and__3822__auto____8555) {
      return coll.cljs$core$IAssociative$_contains_key_QMARK_$arity$2
    }else {
      return and__3822__auto____8555
    }
  }()) {
    return coll.cljs$core$IAssociative$_contains_key_QMARK_$arity$2(coll, k)
  }else {
    var x__2363__auto____8556 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8557 = cljs.core._contains_key_QMARK_[goog.typeOf(x__2363__auto____8556)];
      if(or__3824__auto____8557) {
        return or__3824__auto____8557
      }else {
        var or__3824__auto____8558 = cljs.core._contains_key_QMARK_["_"];
        if(or__3824__auto____8558) {
          return or__3824__auto____8558
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-contains-key?", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core._assoc = function _assoc(coll, k, v) {
  if(function() {
    var and__3822__auto____8563 = coll;
    if(and__3822__auto____8563) {
      return coll.cljs$core$IAssociative$_assoc$arity$3
    }else {
      return and__3822__auto____8563
    }
  }()) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, k, v)
  }else {
    var x__2363__auto____8564 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8565 = cljs.core._assoc[goog.typeOf(x__2363__auto____8564)];
      if(or__3824__auto____8565) {
        return or__3824__auto____8565
      }else {
        var or__3824__auto____8566 = cljs.core._assoc["_"];
        if(or__3824__auto____8566) {
          return or__3824__auto____8566
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
    var and__3822__auto____8571 = coll;
    if(and__3822__auto____8571) {
      return coll.cljs$core$IMap$_dissoc$arity$2
    }else {
      return and__3822__auto____8571
    }
  }()) {
    return coll.cljs$core$IMap$_dissoc$arity$2(coll, k)
  }else {
    var x__2363__auto____8572 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8573 = cljs.core._dissoc[goog.typeOf(x__2363__auto____8572)];
      if(or__3824__auto____8573) {
        return or__3824__auto____8573
      }else {
        var or__3824__auto____8574 = cljs.core._dissoc["_"];
        if(or__3824__auto____8574) {
          return or__3824__auto____8574
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
    var and__3822__auto____8579 = coll;
    if(and__3822__auto____8579) {
      return coll.cljs$core$IMapEntry$_key$arity$1
    }else {
      return and__3822__auto____8579
    }
  }()) {
    return coll.cljs$core$IMapEntry$_key$arity$1(coll)
  }else {
    var x__2363__auto____8580 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8581 = cljs.core._key[goog.typeOf(x__2363__auto____8580)];
      if(or__3824__auto____8581) {
        return or__3824__auto____8581
      }else {
        var or__3824__auto____8582 = cljs.core._key["_"];
        if(or__3824__auto____8582) {
          return or__3824__auto____8582
        }else {
          throw cljs.core.missing_protocol.call(null, "IMapEntry.-key", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._val = function _val(coll) {
  if(function() {
    var and__3822__auto____8587 = coll;
    if(and__3822__auto____8587) {
      return coll.cljs$core$IMapEntry$_val$arity$1
    }else {
      return and__3822__auto____8587
    }
  }()) {
    return coll.cljs$core$IMapEntry$_val$arity$1(coll)
  }else {
    var x__2363__auto____8588 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8589 = cljs.core._val[goog.typeOf(x__2363__auto____8588)];
      if(or__3824__auto____8589) {
        return or__3824__auto____8589
      }else {
        var or__3824__auto____8590 = cljs.core._val["_"];
        if(or__3824__auto____8590) {
          return or__3824__auto____8590
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
    var and__3822__auto____8595 = coll;
    if(and__3822__auto____8595) {
      return coll.cljs$core$ISet$_disjoin$arity$2
    }else {
      return and__3822__auto____8595
    }
  }()) {
    return coll.cljs$core$ISet$_disjoin$arity$2(coll, v)
  }else {
    var x__2363__auto____8596 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8597 = cljs.core._disjoin[goog.typeOf(x__2363__auto____8596)];
      if(or__3824__auto____8597) {
        return or__3824__auto____8597
      }else {
        var or__3824__auto____8598 = cljs.core._disjoin["_"];
        if(or__3824__auto____8598) {
          return or__3824__auto____8598
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
    var and__3822__auto____8603 = coll;
    if(and__3822__auto____8603) {
      return coll.cljs$core$IStack$_peek$arity$1
    }else {
      return and__3822__auto____8603
    }
  }()) {
    return coll.cljs$core$IStack$_peek$arity$1(coll)
  }else {
    var x__2363__auto____8604 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8605 = cljs.core._peek[goog.typeOf(x__2363__auto____8604)];
      if(or__3824__auto____8605) {
        return or__3824__auto____8605
      }else {
        var or__3824__auto____8606 = cljs.core._peek["_"];
        if(or__3824__auto____8606) {
          return or__3824__auto____8606
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-peek", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._pop = function _pop(coll) {
  if(function() {
    var and__3822__auto____8611 = coll;
    if(and__3822__auto____8611) {
      return coll.cljs$core$IStack$_pop$arity$1
    }else {
      return and__3822__auto____8611
    }
  }()) {
    return coll.cljs$core$IStack$_pop$arity$1(coll)
  }else {
    var x__2363__auto____8612 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8613 = cljs.core._pop[goog.typeOf(x__2363__auto____8612)];
      if(or__3824__auto____8613) {
        return or__3824__auto____8613
      }else {
        var or__3824__auto____8614 = cljs.core._pop["_"];
        if(or__3824__auto____8614) {
          return or__3824__auto____8614
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
    var and__3822__auto____8619 = coll;
    if(and__3822__auto____8619) {
      return coll.cljs$core$IVector$_assoc_n$arity$3
    }else {
      return and__3822__auto____8619
    }
  }()) {
    return coll.cljs$core$IVector$_assoc_n$arity$3(coll, n, val)
  }else {
    var x__2363__auto____8620 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8621 = cljs.core._assoc_n[goog.typeOf(x__2363__auto____8620)];
      if(or__3824__auto____8621) {
        return or__3824__auto____8621
      }else {
        var or__3824__auto____8622 = cljs.core._assoc_n["_"];
        if(or__3824__auto____8622) {
          return or__3824__auto____8622
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
    var and__3822__auto____8627 = o;
    if(and__3822__auto____8627) {
      return o.cljs$core$IDeref$_deref$arity$1
    }else {
      return and__3822__auto____8627
    }
  }()) {
    return o.cljs$core$IDeref$_deref$arity$1(o)
  }else {
    var x__2363__auto____8628 = o == null ? null : o;
    return function() {
      var or__3824__auto____8629 = cljs.core._deref[goog.typeOf(x__2363__auto____8628)];
      if(or__3824__auto____8629) {
        return or__3824__auto____8629
      }else {
        var or__3824__auto____8630 = cljs.core._deref["_"];
        if(or__3824__auto____8630) {
          return or__3824__auto____8630
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
    var and__3822__auto____8635 = o;
    if(and__3822__auto____8635) {
      return o.cljs$core$IDerefWithTimeout$_deref_with_timeout$arity$3
    }else {
      return and__3822__auto____8635
    }
  }()) {
    return o.cljs$core$IDerefWithTimeout$_deref_with_timeout$arity$3(o, msec, timeout_val)
  }else {
    var x__2363__auto____8636 = o == null ? null : o;
    return function() {
      var or__3824__auto____8637 = cljs.core._deref_with_timeout[goog.typeOf(x__2363__auto____8636)];
      if(or__3824__auto____8637) {
        return or__3824__auto____8637
      }else {
        var or__3824__auto____8638 = cljs.core._deref_with_timeout["_"];
        if(or__3824__auto____8638) {
          return or__3824__auto____8638
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
    var and__3822__auto____8643 = o;
    if(and__3822__auto____8643) {
      return o.cljs$core$IMeta$_meta$arity$1
    }else {
      return and__3822__auto____8643
    }
  }()) {
    return o.cljs$core$IMeta$_meta$arity$1(o)
  }else {
    var x__2363__auto____8644 = o == null ? null : o;
    return function() {
      var or__3824__auto____8645 = cljs.core._meta[goog.typeOf(x__2363__auto____8644)];
      if(or__3824__auto____8645) {
        return or__3824__auto____8645
      }else {
        var or__3824__auto____8646 = cljs.core._meta["_"];
        if(or__3824__auto____8646) {
          return or__3824__auto____8646
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
    var and__3822__auto____8651 = o;
    if(and__3822__auto____8651) {
      return o.cljs$core$IWithMeta$_with_meta$arity$2
    }else {
      return and__3822__auto____8651
    }
  }()) {
    return o.cljs$core$IWithMeta$_with_meta$arity$2(o, meta)
  }else {
    var x__2363__auto____8652 = o == null ? null : o;
    return function() {
      var or__3824__auto____8653 = cljs.core._with_meta[goog.typeOf(x__2363__auto____8652)];
      if(or__3824__auto____8653) {
        return or__3824__auto____8653
      }else {
        var or__3824__auto____8654 = cljs.core._with_meta["_"];
        if(or__3824__auto____8654) {
          return or__3824__auto____8654
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
      var and__3822__auto____8663 = coll;
      if(and__3822__auto____8663) {
        return coll.cljs$core$IReduce$_reduce$arity$2
      }else {
        return and__3822__auto____8663
      }
    }()) {
      return coll.cljs$core$IReduce$_reduce$arity$2(coll, f)
    }else {
      var x__2363__auto____8664 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____8665 = cljs.core._reduce[goog.typeOf(x__2363__auto____8664)];
        if(or__3824__auto____8665) {
          return or__3824__auto____8665
        }else {
          var or__3824__auto____8666 = cljs.core._reduce["_"];
          if(or__3824__auto____8666) {
            return or__3824__auto____8666
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f)
    }
  };
  var _reduce__3 = function(coll, f, start) {
    if(function() {
      var and__3822__auto____8667 = coll;
      if(and__3822__auto____8667) {
        return coll.cljs$core$IReduce$_reduce$arity$3
      }else {
        return and__3822__auto____8667
      }
    }()) {
      return coll.cljs$core$IReduce$_reduce$arity$3(coll, f, start)
    }else {
      var x__2363__auto____8668 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____8669 = cljs.core._reduce[goog.typeOf(x__2363__auto____8668)];
        if(or__3824__auto____8669) {
          return or__3824__auto____8669
        }else {
          var or__3824__auto____8670 = cljs.core._reduce["_"];
          if(or__3824__auto____8670) {
            return or__3824__auto____8670
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
    var and__3822__auto____8675 = coll;
    if(and__3822__auto____8675) {
      return coll.cljs$core$IKVReduce$_kv_reduce$arity$3
    }else {
      return and__3822__auto____8675
    }
  }()) {
    return coll.cljs$core$IKVReduce$_kv_reduce$arity$3(coll, f, init)
  }else {
    var x__2363__auto____8676 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8677 = cljs.core._kv_reduce[goog.typeOf(x__2363__auto____8676)];
      if(or__3824__auto____8677) {
        return or__3824__auto____8677
      }else {
        var or__3824__auto____8678 = cljs.core._kv_reduce["_"];
        if(or__3824__auto____8678) {
          return or__3824__auto____8678
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
    var and__3822__auto____8683 = o;
    if(and__3822__auto____8683) {
      return o.cljs$core$IEquiv$_equiv$arity$2
    }else {
      return and__3822__auto____8683
    }
  }()) {
    return o.cljs$core$IEquiv$_equiv$arity$2(o, other)
  }else {
    var x__2363__auto____8684 = o == null ? null : o;
    return function() {
      var or__3824__auto____8685 = cljs.core._equiv[goog.typeOf(x__2363__auto____8684)];
      if(or__3824__auto____8685) {
        return or__3824__auto____8685
      }else {
        var or__3824__auto____8686 = cljs.core._equiv["_"];
        if(or__3824__auto____8686) {
          return or__3824__auto____8686
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
    var and__3822__auto____8691 = o;
    if(and__3822__auto____8691) {
      return o.cljs$core$IHash$_hash$arity$1
    }else {
      return and__3822__auto____8691
    }
  }()) {
    return o.cljs$core$IHash$_hash$arity$1(o)
  }else {
    var x__2363__auto____8692 = o == null ? null : o;
    return function() {
      var or__3824__auto____8693 = cljs.core._hash[goog.typeOf(x__2363__auto____8692)];
      if(or__3824__auto____8693) {
        return or__3824__auto____8693
      }else {
        var or__3824__auto____8694 = cljs.core._hash["_"];
        if(or__3824__auto____8694) {
          return or__3824__auto____8694
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
    var and__3822__auto____8699 = o;
    if(and__3822__auto____8699) {
      return o.cljs$core$ISeqable$_seq$arity$1
    }else {
      return and__3822__auto____8699
    }
  }()) {
    return o.cljs$core$ISeqable$_seq$arity$1(o)
  }else {
    var x__2363__auto____8700 = o == null ? null : o;
    return function() {
      var or__3824__auto____8701 = cljs.core._seq[goog.typeOf(x__2363__auto____8700)];
      if(or__3824__auto____8701) {
        return or__3824__auto____8701
      }else {
        var or__3824__auto____8702 = cljs.core._seq["_"];
        if(or__3824__auto____8702) {
          return or__3824__auto____8702
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
    var and__3822__auto____8707 = coll;
    if(and__3822__auto____8707) {
      return coll.cljs$core$IReversible$_rseq$arity$1
    }else {
      return and__3822__auto____8707
    }
  }()) {
    return coll.cljs$core$IReversible$_rseq$arity$1(coll)
  }else {
    var x__2363__auto____8708 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8709 = cljs.core._rseq[goog.typeOf(x__2363__auto____8708)];
      if(or__3824__auto____8709) {
        return or__3824__auto____8709
      }else {
        var or__3824__auto____8710 = cljs.core._rseq["_"];
        if(or__3824__auto____8710) {
          return or__3824__auto____8710
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
    var and__3822__auto____8715 = coll;
    if(and__3822__auto____8715) {
      return coll.cljs$core$ISorted$_sorted_seq$arity$2
    }else {
      return and__3822__auto____8715
    }
  }()) {
    return coll.cljs$core$ISorted$_sorted_seq$arity$2(coll, ascending_QMARK_)
  }else {
    var x__2363__auto____8716 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8717 = cljs.core._sorted_seq[goog.typeOf(x__2363__auto____8716)];
      if(or__3824__auto____8717) {
        return or__3824__auto____8717
      }else {
        var or__3824__auto____8718 = cljs.core._sorted_seq["_"];
        if(or__3824__auto____8718) {
          return or__3824__auto____8718
        }else {
          throw cljs.core.missing_protocol.call(null, "ISorted.-sorted-seq", coll);
        }
      }
    }().call(null, coll, ascending_QMARK_)
  }
};
cljs.core._sorted_seq_from = function _sorted_seq_from(coll, k, ascending_QMARK_) {
  if(function() {
    var and__3822__auto____8723 = coll;
    if(and__3822__auto____8723) {
      return coll.cljs$core$ISorted$_sorted_seq_from$arity$3
    }else {
      return and__3822__auto____8723
    }
  }()) {
    return coll.cljs$core$ISorted$_sorted_seq_from$arity$3(coll, k, ascending_QMARK_)
  }else {
    var x__2363__auto____8724 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8725 = cljs.core._sorted_seq_from[goog.typeOf(x__2363__auto____8724)];
      if(or__3824__auto____8725) {
        return or__3824__auto____8725
      }else {
        var or__3824__auto____8726 = cljs.core._sorted_seq_from["_"];
        if(or__3824__auto____8726) {
          return or__3824__auto____8726
        }else {
          throw cljs.core.missing_protocol.call(null, "ISorted.-sorted-seq-from", coll);
        }
      }
    }().call(null, coll, k, ascending_QMARK_)
  }
};
cljs.core._entry_key = function _entry_key(coll, entry) {
  if(function() {
    var and__3822__auto____8731 = coll;
    if(and__3822__auto____8731) {
      return coll.cljs$core$ISorted$_entry_key$arity$2
    }else {
      return and__3822__auto____8731
    }
  }()) {
    return coll.cljs$core$ISorted$_entry_key$arity$2(coll, entry)
  }else {
    var x__2363__auto____8732 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8733 = cljs.core._entry_key[goog.typeOf(x__2363__auto____8732)];
      if(or__3824__auto____8733) {
        return or__3824__auto____8733
      }else {
        var or__3824__auto____8734 = cljs.core._entry_key["_"];
        if(or__3824__auto____8734) {
          return or__3824__auto____8734
        }else {
          throw cljs.core.missing_protocol.call(null, "ISorted.-entry-key", coll);
        }
      }
    }().call(null, coll, entry)
  }
};
cljs.core._comparator = function _comparator(coll) {
  if(function() {
    var and__3822__auto____8739 = coll;
    if(and__3822__auto____8739) {
      return coll.cljs$core$ISorted$_comparator$arity$1
    }else {
      return and__3822__auto____8739
    }
  }()) {
    return coll.cljs$core$ISorted$_comparator$arity$1(coll)
  }else {
    var x__2363__auto____8740 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8741 = cljs.core._comparator[goog.typeOf(x__2363__auto____8740)];
      if(or__3824__auto____8741) {
        return or__3824__auto____8741
      }else {
        var or__3824__auto____8742 = cljs.core._comparator["_"];
        if(or__3824__auto____8742) {
          return or__3824__auto____8742
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
    var and__3822__auto____8747 = o;
    if(and__3822__auto____8747) {
      return o.cljs$core$IPrintable$_pr_seq$arity$2
    }else {
      return and__3822__auto____8747
    }
  }()) {
    return o.cljs$core$IPrintable$_pr_seq$arity$2(o, opts)
  }else {
    var x__2363__auto____8748 = o == null ? null : o;
    return function() {
      var or__3824__auto____8749 = cljs.core._pr_seq[goog.typeOf(x__2363__auto____8748)];
      if(or__3824__auto____8749) {
        return or__3824__auto____8749
      }else {
        var or__3824__auto____8750 = cljs.core._pr_seq["_"];
        if(or__3824__auto____8750) {
          return or__3824__auto____8750
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
    var and__3822__auto____8755 = d;
    if(and__3822__auto____8755) {
      return d.cljs$core$IPending$_realized_QMARK_$arity$1
    }else {
      return and__3822__auto____8755
    }
  }()) {
    return d.cljs$core$IPending$_realized_QMARK_$arity$1(d)
  }else {
    var x__2363__auto____8756 = d == null ? null : d;
    return function() {
      var or__3824__auto____8757 = cljs.core._realized_QMARK_[goog.typeOf(x__2363__auto____8756)];
      if(or__3824__auto____8757) {
        return or__3824__auto____8757
      }else {
        var or__3824__auto____8758 = cljs.core._realized_QMARK_["_"];
        if(or__3824__auto____8758) {
          return or__3824__auto____8758
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
    var and__3822__auto____8763 = this$;
    if(and__3822__auto____8763) {
      return this$.cljs$core$IWatchable$_notify_watches$arity$3
    }else {
      return and__3822__auto____8763
    }
  }()) {
    return this$.cljs$core$IWatchable$_notify_watches$arity$3(this$, oldval, newval)
  }else {
    var x__2363__auto____8764 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____8765 = cljs.core._notify_watches[goog.typeOf(x__2363__auto____8764)];
      if(or__3824__auto____8765) {
        return or__3824__auto____8765
      }else {
        var or__3824__auto____8766 = cljs.core._notify_watches["_"];
        if(or__3824__auto____8766) {
          return or__3824__auto____8766
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-notify-watches", this$);
        }
      }
    }().call(null, this$, oldval, newval)
  }
};
cljs.core._add_watch = function _add_watch(this$, key, f) {
  if(function() {
    var and__3822__auto____8771 = this$;
    if(and__3822__auto____8771) {
      return this$.cljs$core$IWatchable$_add_watch$arity$3
    }else {
      return and__3822__auto____8771
    }
  }()) {
    return this$.cljs$core$IWatchable$_add_watch$arity$3(this$, key, f)
  }else {
    var x__2363__auto____8772 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____8773 = cljs.core._add_watch[goog.typeOf(x__2363__auto____8772)];
      if(or__3824__auto____8773) {
        return or__3824__auto____8773
      }else {
        var or__3824__auto____8774 = cljs.core._add_watch["_"];
        if(or__3824__auto____8774) {
          return or__3824__auto____8774
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-add-watch", this$);
        }
      }
    }().call(null, this$, key, f)
  }
};
cljs.core._remove_watch = function _remove_watch(this$, key) {
  if(function() {
    var and__3822__auto____8779 = this$;
    if(and__3822__auto____8779) {
      return this$.cljs$core$IWatchable$_remove_watch$arity$2
    }else {
      return and__3822__auto____8779
    }
  }()) {
    return this$.cljs$core$IWatchable$_remove_watch$arity$2(this$, key)
  }else {
    var x__2363__auto____8780 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____8781 = cljs.core._remove_watch[goog.typeOf(x__2363__auto____8780)];
      if(or__3824__auto____8781) {
        return or__3824__auto____8781
      }else {
        var or__3824__auto____8782 = cljs.core._remove_watch["_"];
        if(or__3824__auto____8782) {
          return or__3824__auto____8782
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
    var and__3822__auto____8787 = coll;
    if(and__3822__auto____8787) {
      return coll.cljs$core$IEditableCollection$_as_transient$arity$1
    }else {
      return and__3822__auto____8787
    }
  }()) {
    return coll.cljs$core$IEditableCollection$_as_transient$arity$1(coll)
  }else {
    var x__2363__auto____8788 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8789 = cljs.core._as_transient[goog.typeOf(x__2363__auto____8788)];
      if(or__3824__auto____8789) {
        return or__3824__auto____8789
      }else {
        var or__3824__auto____8790 = cljs.core._as_transient["_"];
        if(or__3824__auto____8790) {
          return or__3824__auto____8790
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
    var and__3822__auto____8795 = tcoll;
    if(and__3822__auto____8795) {
      return tcoll.cljs$core$ITransientCollection$_conj_BANG_$arity$2
    }else {
      return and__3822__auto____8795
    }
  }()) {
    return tcoll.cljs$core$ITransientCollection$_conj_BANG_$arity$2(tcoll, val)
  }else {
    var x__2363__auto____8796 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8797 = cljs.core._conj_BANG_[goog.typeOf(x__2363__auto____8796)];
      if(or__3824__auto____8797) {
        return or__3824__auto____8797
      }else {
        var or__3824__auto____8798 = cljs.core._conj_BANG_["_"];
        if(or__3824__auto____8798) {
          return or__3824__auto____8798
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientCollection.-conj!", tcoll);
        }
      }
    }().call(null, tcoll, val)
  }
};
cljs.core._persistent_BANG_ = function _persistent_BANG_(tcoll) {
  if(function() {
    var and__3822__auto____8803 = tcoll;
    if(and__3822__auto____8803) {
      return tcoll.cljs$core$ITransientCollection$_persistent_BANG_$arity$1
    }else {
      return and__3822__auto____8803
    }
  }()) {
    return tcoll.cljs$core$ITransientCollection$_persistent_BANG_$arity$1(tcoll)
  }else {
    var x__2363__auto____8804 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8805 = cljs.core._persistent_BANG_[goog.typeOf(x__2363__auto____8804)];
      if(or__3824__auto____8805) {
        return or__3824__auto____8805
      }else {
        var or__3824__auto____8806 = cljs.core._persistent_BANG_["_"];
        if(or__3824__auto____8806) {
          return or__3824__auto____8806
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
    var and__3822__auto____8811 = tcoll;
    if(and__3822__auto____8811) {
      return tcoll.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3
    }else {
      return and__3822__auto____8811
    }
  }()) {
    return tcoll.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3(tcoll, key, val)
  }else {
    var x__2363__auto____8812 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8813 = cljs.core._assoc_BANG_[goog.typeOf(x__2363__auto____8812)];
      if(or__3824__auto____8813) {
        return or__3824__auto____8813
      }else {
        var or__3824__auto____8814 = cljs.core._assoc_BANG_["_"];
        if(or__3824__auto____8814) {
          return or__3824__auto____8814
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
    var and__3822__auto____8819 = tcoll;
    if(and__3822__auto____8819) {
      return tcoll.cljs$core$ITransientMap$_dissoc_BANG_$arity$2
    }else {
      return and__3822__auto____8819
    }
  }()) {
    return tcoll.cljs$core$ITransientMap$_dissoc_BANG_$arity$2(tcoll, key)
  }else {
    var x__2363__auto____8820 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8821 = cljs.core._dissoc_BANG_[goog.typeOf(x__2363__auto____8820)];
      if(or__3824__auto____8821) {
        return or__3824__auto____8821
      }else {
        var or__3824__auto____8822 = cljs.core._dissoc_BANG_["_"];
        if(or__3824__auto____8822) {
          return or__3824__auto____8822
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
    var and__3822__auto____8827 = tcoll;
    if(and__3822__auto____8827) {
      return tcoll.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3
    }else {
      return and__3822__auto____8827
    }
  }()) {
    return tcoll.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3(tcoll, n, val)
  }else {
    var x__2363__auto____8828 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8829 = cljs.core._assoc_n_BANG_[goog.typeOf(x__2363__auto____8828)];
      if(or__3824__auto____8829) {
        return or__3824__auto____8829
      }else {
        var or__3824__auto____8830 = cljs.core._assoc_n_BANG_["_"];
        if(or__3824__auto____8830) {
          return or__3824__auto____8830
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientVector.-assoc-n!", tcoll);
        }
      }
    }().call(null, tcoll, n, val)
  }
};
cljs.core._pop_BANG_ = function _pop_BANG_(tcoll) {
  if(function() {
    var and__3822__auto____8835 = tcoll;
    if(and__3822__auto____8835) {
      return tcoll.cljs$core$ITransientVector$_pop_BANG_$arity$1
    }else {
      return and__3822__auto____8835
    }
  }()) {
    return tcoll.cljs$core$ITransientVector$_pop_BANG_$arity$1(tcoll)
  }else {
    var x__2363__auto____8836 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8837 = cljs.core._pop_BANG_[goog.typeOf(x__2363__auto____8836)];
      if(or__3824__auto____8837) {
        return or__3824__auto____8837
      }else {
        var or__3824__auto____8838 = cljs.core._pop_BANG_["_"];
        if(or__3824__auto____8838) {
          return or__3824__auto____8838
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
    var and__3822__auto____8843 = tcoll;
    if(and__3822__auto____8843) {
      return tcoll.cljs$core$ITransientSet$_disjoin_BANG_$arity$2
    }else {
      return and__3822__auto____8843
    }
  }()) {
    return tcoll.cljs$core$ITransientSet$_disjoin_BANG_$arity$2(tcoll, v)
  }else {
    var x__2363__auto____8844 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____8845 = cljs.core._disjoin_BANG_[goog.typeOf(x__2363__auto____8844)];
      if(or__3824__auto____8845) {
        return or__3824__auto____8845
      }else {
        var or__3824__auto____8846 = cljs.core._disjoin_BANG_["_"];
        if(or__3824__auto____8846) {
          return or__3824__auto____8846
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
    var and__3822__auto____8851 = x;
    if(and__3822__auto____8851) {
      return x.cljs$core$IComparable$_compare$arity$2
    }else {
      return and__3822__auto____8851
    }
  }()) {
    return x.cljs$core$IComparable$_compare$arity$2(x, y)
  }else {
    var x__2363__auto____8852 = x == null ? null : x;
    return function() {
      var or__3824__auto____8853 = cljs.core._compare[goog.typeOf(x__2363__auto____8852)];
      if(or__3824__auto____8853) {
        return or__3824__auto____8853
      }else {
        var or__3824__auto____8854 = cljs.core._compare["_"];
        if(or__3824__auto____8854) {
          return or__3824__auto____8854
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
    var and__3822__auto____8859 = coll;
    if(and__3822__auto____8859) {
      return coll.cljs$core$IChunk$_drop_first$arity$1
    }else {
      return and__3822__auto____8859
    }
  }()) {
    return coll.cljs$core$IChunk$_drop_first$arity$1(coll)
  }else {
    var x__2363__auto____8860 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8861 = cljs.core._drop_first[goog.typeOf(x__2363__auto____8860)];
      if(or__3824__auto____8861) {
        return or__3824__auto____8861
      }else {
        var or__3824__auto____8862 = cljs.core._drop_first["_"];
        if(or__3824__auto____8862) {
          return or__3824__auto____8862
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
    var and__3822__auto____8867 = coll;
    if(and__3822__auto____8867) {
      return coll.cljs$core$IChunkedSeq$_chunked_first$arity$1
    }else {
      return and__3822__auto____8867
    }
  }()) {
    return coll.cljs$core$IChunkedSeq$_chunked_first$arity$1(coll)
  }else {
    var x__2363__auto____8868 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8869 = cljs.core._chunked_first[goog.typeOf(x__2363__auto____8868)];
      if(or__3824__auto____8869) {
        return or__3824__auto____8869
      }else {
        var or__3824__auto____8870 = cljs.core._chunked_first["_"];
        if(or__3824__auto____8870) {
          return or__3824__auto____8870
        }else {
          throw cljs.core.missing_protocol.call(null, "IChunkedSeq.-chunked-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._chunked_rest = function _chunked_rest(coll) {
  if(function() {
    var and__3822__auto____8875 = coll;
    if(and__3822__auto____8875) {
      return coll.cljs$core$IChunkedSeq$_chunked_rest$arity$1
    }else {
      return and__3822__auto____8875
    }
  }()) {
    return coll.cljs$core$IChunkedSeq$_chunked_rest$arity$1(coll)
  }else {
    var x__2363__auto____8876 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8877 = cljs.core._chunked_rest[goog.typeOf(x__2363__auto____8876)];
      if(or__3824__auto____8877) {
        return or__3824__auto____8877
      }else {
        var or__3824__auto____8878 = cljs.core._chunked_rest["_"];
        if(or__3824__auto____8878) {
          return or__3824__auto____8878
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
    var and__3822__auto____8883 = coll;
    if(and__3822__auto____8883) {
      return coll.cljs$core$IChunkedNext$_chunked_next$arity$1
    }else {
      return and__3822__auto____8883
    }
  }()) {
    return coll.cljs$core$IChunkedNext$_chunked_next$arity$1(coll)
  }else {
    var x__2363__auto____8884 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____8885 = cljs.core._chunked_next[goog.typeOf(x__2363__auto____8884)];
      if(or__3824__auto____8885) {
        return or__3824__auto____8885
      }else {
        var or__3824__auto____8886 = cljs.core._chunked_next["_"];
        if(or__3824__auto____8886) {
          return or__3824__auto____8886
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
    var or__3824__auto____8888 = x === y;
    if(or__3824__auto____8888) {
      return or__3824__auto____8888
    }else {
      return cljs.core._equiv.call(null, x, y)
    }
  };
  var _EQ___3 = function() {
    var G__8889__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ_.call(null, x, y))) {
          if(cljs.core.next.call(null, more)) {
            var G__8890 = y;
            var G__8891 = cljs.core.first.call(null, more);
            var G__8892 = cljs.core.next.call(null, more);
            x = G__8890;
            y = G__8891;
            more = G__8892;
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
    var G__8889 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__8889__delegate.call(this, x, y, more)
    };
    G__8889.cljs$lang$maxFixedArity = 2;
    G__8889.cljs$lang$applyTo = function(arglist__8893) {
      var x = cljs.core.first(arglist__8893);
      var y = cljs.core.first(cljs.core.next(arglist__8893));
      var more = cljs.core.rest(cljs.core.next(arglist__8893));
      return G__8889__delegate(x, y, more)
    };
    G__8889.cljs$lang$arity$variadic = G__8889__delegate;
    return G__8889
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
  var G__8894 = null;
  var G__8894__2 = function(o, k) {
    return null
  };
  var G__8894__3 = function(o, k, not_found) {
    return not_found
  };
  G__8894 = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8894__2.call(this, o, k);
      case 3:
        return G__8894__3.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8894
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
  var G__8895 = null;
  var G__8895__2 = function(_, f) {
    return f.call(null)
  };
  var G__8895__3 = function(_, f, start) {
    return start
  };
  G__8895 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__8895__2.call(this, _, f);
      case 3:
        return G__8895__3.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8895
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
  var G__8896 = null;
  var G__8896__2 = function(_, n) {
    return null
  };
  var G__8896__3 = function(_, n, not_found) {
    return not_found
  };
  G__8896 = function(_, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8896__2.call(this, _, n);
      case 3:
        return G__8896__3.call(this, _, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8896
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
  var and__3822__auto____8897 = cljs.core.instance_QMARK_.call(null, Date, other);
  if(and__3822__auto____8897) {
    return o.toString() === other.toString()
  }else {
    return and__3822__auto____8897
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
    var cnt__8910 = cljs.core._count.call(null, cicoll);
    if(cnt__8910 === 0) {
      return f.call(null)
    }else {
      var val__8911 = cljs.core._nth.call(null, cicoll, 0);
      var n__8912 = 1;
      while(true) {
        if(n__8912 < cnt__8910) {
          var nval__8913 = f.call(null, val__8911, cljs.core._nth.call(null, cicoll, n__8912));
          if(cljs.core.reduced_QMARK_.call(null, nval__8913)) {
            return cljs.core.deref.call(null, nval__8913)
          }else {
            var G__8922 = nval__8913;
            var G__8923 = n__8912 + 1;
            val__8911 = G__8922;
            n__8912 = G__8923;
            continue
          }
        }else {
          return val__8911
        }
        break
      }
    }
  };
  var ci_reduce__3 = function(cicoll, f, val) {
    var cnt__8914 = cljs.core._count.call(null, cicoll);
    var val__8915 = val;
    var n__8916 = 0;
    while(true) {
      if(n__8916 < cnt__8914) {
        var nval__8917 = f.call(null, val__8915, cljs.core._nth.call(null, cicoll, n__8916));
        if(cljs.core.reduced_QMARK_.call(null, nval__8917)) {
          return cljs.core.deref.call(null, nval__8917)
        }else {
          var G__8924 = nval__8917;
          var G__8925 = n__8916 + 1;
          val__8915 = G__8924;
          n__8916 = G__8925;
          continue
        }
      }else {
        return val__8915
      }
      break
    }
  };
  var ci_reduce__4 = function(cicoll, f, val, idx) {
    var cnt__8918 = cljs.core._count.call(null, cicoll);
    var val__8919 = val;
    var n__8920 = idx;
    while(true) {
      if(n__8920 < cnt__8918) {
        var nval__8921 = f.call(null, val__8919, cljs.core._nth.call(null, cicoll, n__8920));
        if(cljs.core.reduced_QMARK_.call(null, nval__8921)) {
          return cljs.core.deref.call(null, nval__8921)
        }else {
          var G__8926 = nval__8921;
          var G__8927 = n__8920 + 1;
          val__8919 = G__8926;
          n__8920 = G__8927;
          continue
        }
      }else {
        return val__8919
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
    var cnt__8940 = arr.length;
    if(arr.length === 0) {
      return f.call(null)
    }else {
      var val__8941 = arr[0];
      var n__8942 = 1;
      while(true) {
        if(n__8942 < cnt__8940) {
          var nval__8943 = f.call(null, val__8941, arr[n__8942]);
          if(cljs.core.reduced_QMARK_.call(null, nval__8943)) {
            return cljs.core.deref.call(null, nval__8943)
          }else {
            var G__8952 = nval__8943;
            var G__8953 = n__8942 + 1;
            val__8941 = G__8952;
            n__8942 = G__8953;
            continue
          }
        }else {
          return val__8941
        }
        break
      }
    }
  };
  var array_reduce__3 = function(arr, f, val) {
    var cnt__8944 = arr.length;
    var val__8945 = val;
    var n__8946 = 0;
    while(true) {
      if(n__8946 < cnt__8944) {
        var nval__8947 = f.call(null, val__8945, arr[n__8946]);
        if(cljs.core.reduced_QMARK_.call(null, nval__8947)) {
          return cljs.core.deref.call(null, nval__8947)
        }else {
          var G__8954 = nval__8947;
          var G__8955 = n__8946 + 1;
          val__8945 = G__8954;
          n__8946 = G__8955;
          continue
        }
      }else {
        return val__8945
      }
      break
    }
  };
  var array_reduce__4 = function(arr, f, val, idx) {
    var cnt__8948 = arr.length;
    var val__8949 = val;
    var n__8950 = idx;
    while(true) {
      if(n__8950 < cnt__8948) {
        var nval__8951 = f.call(null, val__8949, arr[n__8950]);
        if(cljs.core.reduced_QMARK_.call(null, nval__8951)) {
          return cljs.core.deref.call(null, nval__8951)
        }else {
          var G__8956 = nval__8951;
          var G__8957 = n__8950 + 1;
          val__8949 = G__8956;
          n__8950 = G__8957;
          continue
        }
      }else {
        return val__8949
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
  var this__8958 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$INext$_next$arity$1 = function(_) {
  var this__8959 = this;
  if(this__8959.i + 1 < this__8959.a.length) {
    return new cljs.core.IndexedSeq(this__8959.a, this__8959.i + 1)
  }else {
    return null
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8960 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__8961 = this;
  var c__8962 = coll.cljs$core$ICounted$_count$arity$1(coll);
  if(c__8962 > 0) {
    return new cljs.core.RSeq(coll, c__8962 - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.IndexedSeq.prototype.toString = function() {
  var this__8963 = this;
  var this__8964 = this;
  return cljs.core.pr_str.call(null, this__8964)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce$arity$2 = function(coll, f) {
  var this__8965 = this;
  if(cljs.core.counted_QMARK_.call(null, this__8965.a)) {
    return cljs.core.ci_reduce.call(null, this__8965.a, f, this__8965.a[this__8965.i], this__8965.i + 1)
  }else {
    return cljs.core.ci_reduce.call(null, coll, f, this__8965.a[this__8965.i], 0)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce$arity$3 = function(coll, f, start) {
  var this__8966 = this;
  if(cljs.core.counted_QMARK_.call(null, this__8966.a)) {
    return cljs.core.ci_reduce.call(null, this__8966.a, f, start, this__8966.i)
  }else {
    return cljs.core.ci_reduce.call(null, coll, f, start, 0)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__8967 = this;
  return this$
};
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count$arity$1 = function(_) {
  var this__8968 = this;
  return this__8968.a.length - this__8968.i
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(_) {
  var this__8969 = this;
  return this__8969.a[this__8969.i]
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(_) {
  var this__8970 = this;
  if(this__8970.i + 1 < this__8970.a.length) {
    return new cljs.core.IndexedSeq(this__8970.a, this__8970.i + 1)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8971 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__8972 = this;
  var i__8973 = n + this__8972.i;
  if(i__8973 < this__8972.a.length) {
    return this__8972.a[i__8973]
  }else {
    return null
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__8974 = this;
  var i__8975 = n + this__8974.i;
  if(i__8975 < this__8974.a.length) {
    return this__8974.a[i__8975]
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
  var G__8976 = null;
  var G__8976__2 = function(array, f) {
    return cljs.core.ci_reduce.call(null, array, f)
  };
  var G__8976__3 = function(array, f, start) {
    return cljs.core.ci_reduce.call(null, array, f, start)
  };
  G__8976 = function(array, f, start) {
    switch(arguments.length) {
      case 2:
        return G__8976__2.call(this, array, f);
      case 3:
        return G__8976__3.call(this, array, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8976
}();
cljs.core.ILookup["array"] = true;
cljs.core._lookup["array"] = function() {
  var G__8977 = null;
  var G__8977__2 = function(array, k) {
    return array[k]
  };
  var G__8977__3 = function(array, k, not_found) {
    return cljs.core._nth.call(null, array, k, not_found)
  };
  G__8977 = function(array, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8977__2.call(this, array, k);
      case 3:
        return G__8977__3.call(this, array, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8977
}();
cljs.core.IIndexed["array"] = true;
cljs.core._nth["array"] = function() {
  var G__8978 = null;
  var G__8978__2 = function(array, n) {
    if(n < array.length) {
      return array[n]
    }else {
      return null
    }
  };
  var G__8978__3 = function(array, n, not_found) {
    if(n < array.length) {
      return array[n]
    }else {
      return not_found
    }
  };
  G__8978 = function(array, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8978__2.call(this, array, n);
      case 3:
        return G__8978__3.call(this, array, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8978
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
  var this__8979 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.RSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8980 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.RSeq.prototype.toString = function() {
  var this__8981 = this;
  var this__8982 = this;
  return cljs.core.pr_str.call(null, this__8982)
};
cljs.core.RSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8983 = this;
  return coll
};
cljs.core.RSeq.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8984 = this;
  return this__8984.i + 1
};
cljs.core.RSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__8985 = this;
  return cljs.core._nth.call(null, this__8985.ci, this__8985.i)
};
cljs.core.RSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__8986 = this;
  if(this__8986.i > 0) {
    return new cljs.core.RSeq(this__8986.ci, this__8986.i - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.RSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8987 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.RSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, new_meta) {
  var this__8988 = this;
  return new cljs.core.RSeq(this__8988.ci, this__8988.i, new_meta)
};
cljs.core.RSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8989 = this;
  return this__8989.meta
};
cljs.core.RSeq;
cljs.core.seq = function seq(coll) {
  if(coll == null) {
    return null
  }else {
    if(function() {
      var G__8993__8994 = coll;
      if(G__8993__8994) {
        if(function() {
          var or__3824__auto____8995 = G__8993__8994.cljs$lang$protocol_mask$partition0$ & 32;
          if(or__3824__auto____8995) {
            return or__3824__auto____8995
          }else {
            return G__8993__8994.cljs$core$ASeq$
          }
        }()) {
          return true
        }else {
          if(!G__8993__8994.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.ASeq, G__8993__8994)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.ASeq, G__8993__8994)
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
      var G__9000__9001 = coll;
      if(G__9000__9001) {
        if(function() {
          var or__3824__auto____9002 = G__9000__9001.cljs$lang$protocol_mask$partition0$ & 64;
          if(or__3824__auto____9002) {
            return or__3824__auto____9002
          }else {
            return G__9000__9001.cljs$core$ISeq$
          }
        }()) {
          return true
        }else {
          if(!G__9000__9001.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__9000__9001)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__9000__9001)
      }
    }()) {
      return cljs.core._first.call(null, coll)
    }else {
      var s__9003 = cljs.core.seq.call(null, coll);
      if(s__9003 == null) {
        return null
      }else {
        return cljs.core._first.call(null, s__9003)
      }
    }
  }
};
cljs.core.rest = function rest(coll) {
  if(!(coll == null)) {
    if(function() {
      var G__9008__9009 = coll;
      if(G__9008__9009) {
        if(function() {
          var or__3824__auto____9010 = G__9008__9009.cljs$lang$protocol_mask$partition0$ & 64;
          if(or__3824__auto____9010) {
            return or__3824__auto____9010
          }else {
            return G__9008__9009.cljs$core$ISeq$
          }
        }()) {
          return true
        }else {
          if(!G__9008__9009.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__9008__9009)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__9008__9009)
      }
    }()) {
      return cljs.core._rest.call(null, coll)
    }else {
      var s__9011 = cljs.core.seq.call(null, coll);
      if(!(s__9011 == null)) {
        return cljs.core._rest.call(null, s__9011)
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
      var G__9015__9016 = coll;
      if(G__9015__9016) {
        if(function() {
          var or__3824__auto____9017 = G__9015__9016.cljs$lang$protocol_mask$partition0$ & 128;
          if(or__3824__auto____9017) {
            return or__3824__auto____9017
          }else {
            return G__9015__9016.cljs$core$INext$
          }
        }()) {
          return true
        }else {
          if(!G__9015__9016.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.INext, G__9015__9016)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.INext, G__9015__9016)
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
    var sn__9019 = cljs.core.next.call(null, s);
    if(!(sn__9019 == null)) {
      var G__9020 = sn__9019;
      s = G__9020;
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
    var G__9021__delegate = function(coll, x, xs) {
      while(true) {
        if(cljs.core.truth_(xs)) {
          var G__9022 = conj.call(null, coll, x);
          var G__9023 = cljs.core.first.call(null, xs);
          var G__9024 = cljs.core.next.call(null, xs);
          coll = G__9022;
          x = G__9023;
          xs = G__9024;
          continue
        }else {
          return conj.call(null, coll, x)
        }
        break
      }
    };
    var G__9021 = function(coll, x, var_args) {
      var xs = null;
      if(goog.isDef(var_args)) {
        xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9021__delegate.call(this, coll, x, xs)
    };
    G__9021.cljs$lang$maxFixedArity = 2;
    G__9021.cljs$lang$applyTo = function(arglist__9025) {
      var coll = cljs.core.first(arglist__9025);
      var x = cljs.core.first(cljs.core.next(arglist__9025));
      var xs = cljs.core.rest(cljs.core.next(arglist__9025));
      return G__9021__delegate(coll, x, xs)
    };
    G__9021.cljs$lang$arity$variadic = G__9021__delegate;
    return G__9021
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
  var s__9028 = cljs.core.seq.call(null, coll);
  var acc__9029 = 0;
  while(true) {
    if(cljs.core.counted_QMARK_.call(null, s__9028)) {
      return acc__9029 + cljs.core._count.call(null, s__9028)
    }else {
      var G__9030 = cljs.core.next.call(null, s__9028);
      var G__9031 = acc__9029 + 1;
      s__9028 = G__9030;
      acc__9029 = G__9031;
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
        var G__9038__9039 = coll;
        if(G__9038__9039) {
          if(function() {
            var or__3824__auto____9040 = G__9038__9039.cljs$lang$protocol_mask$partition0$ & 16;
            if(or__3824__auto____9040) {
              return or__3824__auto____9040
            }else {
              return G__9038__9039.cljs$core$IIndexed$
            }
          }()) {
            return true
          }else {
            if(!G__9038__9039.cljs$lang$protocol_mask$partition0$) {
              return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__9038__9039)
            }else {
              return false
            }
          }
        }else {
          return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__9038__9039)
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
        var G__9041__9042 = coll;
        if(G__9041__9042) {
          if(function() {
            var or__3824__auto____9043 = G__9041__9042.cljs$lang$protocol_mask$partition0$ & 16;
            if(or__3824__auto____9043) {
              return or__3824__auto____9043
            }else {
              return G__9041__9042.cljs$core$IIndexed$
            }
          }()) {
            return true
          }else {
            if(!G__9041__9042.cljs$lang$protocol_mask$partition0$) {
              return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__9041__9042)
            }else {
              return false
            }
          }
        }else {
          return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__9041__9042)
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
    var G__9046__delegate = function(coll, k, v, kvs) {
      while(true) {
        var ret__9045 = assoc.call(null, coll, k, v);
        if(cljs.core.truth_(kvs)) {
          var G__9047 = ret__9045;
          var G__9048 = cljs.core.first.call(null, kvs);
          var G__9049 = cljs.core.second.call(null, kvs);
          var G__9050 = cljs.core.nnext.call(null, kvs);
          coll = G__9047;
          k = G__9048;
          v = G__9049;
          kvs = G__9050;
          continue
        }else {
          return ret__9045
        }
        break
      }
    };
    var G__9046 = function(coll, k, v, var_args) {
      var kvs = null;
      if(goog.isDef(var_args)) {
        kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__9046__delegate.call(this, coll, k, v, kvs)
    };
    G__9046.cljs$lang$maxFixedArity = 3;
    G__9046.cljs$lang$applyTo = function(arglist__9051) {
      var coll = cljs.core.first(arglist__9051);
      var k = cljs.core.first(cljs.core.next(arglist__9051));
      var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9051)));
      var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9051)));
      return G__9046__delegate(coll, k, v, kvs)
    };
    G__9046.cljs$lang$arity$variadic = G__9046__delegate;
    return G__9046
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
    var G__9054__delegate = function(coll, k, ks) {
      while(true) {
        var ret__9053 = dissoc.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__9055 = ret__9053;
          var G__9056 = cljs.core.first.call(null, ks);
          var G__9057 = cljs.core.next.call(null, ks);
          coll = G__9055;
          k = G__9056;
          ks = G__9057;
          continue
        }else {
          return ret__9053
        }
        break
      }
    };
    var G__9054 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9054__delegate.call(this, coll, k, ks)
    };
    G__9054.cljs$lang$maxFixedArity = 2;
    G__9054.cljs$lang$applyTo = function(arglist__9058) {
      var coll = cljs.core.first(arglist__9058);
      var k = cljs.core.first(cljs.core.next(arglist__9058));
      var ks = cljs.core.rest(cljs.core.next(arglist__9058));
      return G__9054__delegate(coll, k, ks)
    };
    G__9054.cljs$lang$arity$variadic = G__9054__delegate;
    return G__9054
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
    var G__9062__9063 = o;
    if(G__9062__9063) {
      if(function() {
        var or__3824__auto____9064 = G__9062__9063.cljs$lang$protocol_mask$partition0$ & 131072;
        if(or__3824__auto____9064) {
          return or__3824__auto____9064
        }else {
          return G__9062__9063.cljs$core$IMeta$
        }
      }()) {
        return true
      }else {
        if(!G__9062__9063.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, G__9062__9063)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, G__9062__9063)
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
    var G__9067__delegate = function(coll, k, ks) {
      while(true) {
        var ret__9066 = disj.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__9068 = ret__9066;
          var G__9069 = cljs.core.first.call(null, ks);
          var G__9070 = cljs.core.next.call(null, ks);
          coll = G__9068;
          k = G__9069;
          ks = G__9070;
          continue
        }else {
          return ret__9066
        }
        break
      }
    };
    var G__9067 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9067__delegate.call(this, coll, k, ks)
    };
    G__9067.cljs$lang$maxFixedArity = 2;
    G__9067.cljs$lang$applyTo = function(arglist__9071) {
      var coll = cljs.core.first(arglist__9071);
      var k = cljs.core.first(cljs.core.next(arglist__9071));
      var ks = cljs.core.rest(cljs.core.next(arglist__9071));
      return G__9067__delegate(coll, k, ks)
    };
    G__9067.cljs$lang$arity$variadic = G__9067__delegate;
    return G__9067
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
  var h__9073 = goog.string.hashCode(k);
  cljs.core.string_hash_cache[k] = h__9073;
  cljs.core.string_hash_cache_count = cljs.core.string_hash_cache_count + 1;
  return h__9073
};
cljs.core.check_string_hash_cache = function check_string_hash_cache(k) {
  if(cljs.core.string_hash_cache_count > 255) {
    cljs.core.string_hash_cache = {};
    cljs.core.string_hash_cache_count = 0
  }else {
  }
  var h__9075 = cljs.core.string_hash_cache[k];
  if(!(h__9075 == null)) {
    return h__9075
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
      var and__3822__auto____9077 = goog.isString(o);
      if(and__3822__auto____9077) {
        return check_cache
      }else {
        return and__3822__auto____9077
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
    var G__9081__9082 = x;
    if(G__9081__9082) {
      if(function() {
        var or__3824__auto____9083 = G__9081__9082.cljs$lang$protocol_mask$partition0$ & 8;
        if(or__3824__auto____9083) {
          return or__3824__auto____9083
        }else {
          return G__9081__9082.cljs$core$ICollection$
        }
      }()) {
        return true
      }else {
        if(!G__9081__9082.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, G__9081__9082)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, G__9081__9082)
    }
  }
};
cljs.core.set_QMARK_ = function set_QMARK_(x) {
  if(x == null) {
    return false
  }else {
    var G__9087__9088 = x;
    if(G__9087__9088) {
      if(function() {
        var or__3824__auto____9089 = G__9087__9088.cljs$lang$protocol_mask$partition0$ & 4096;
        if(or__3824__auto____9089) {
          return or__3824__auto____9089
        }else {
          return G__9087__9088.cljs$core$ISet$
        }
      }()) {
        return true
      }else {
        if(!G__9087__9088.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.ISet, G__9087__9088)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISet, G__9087__9088)
    }
  }
};
cljs.core.associative_QMARK_ = function associative_QMARK_(x) {
  var G__9093__9094 = x;
  if(G__9093__9094) {
    if(function() {
      var or__3824__auto____9095 = G__9093__9094.cljs$lang$protocol_mask$partition0$ & 512;
      if(or__3824__auto____9095) {
        return or__3824__auto____9095
      }else {
        return G__9093__9094.cljs$core$IAssociative$
      }
    }()) {
      return true
    }else {
      if(!G__9093__9094.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, G__9093__9094)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, G__9093__9094)
  }
};
cljs.core.sequential_QMARK_ = function sequential_QMARK_(x) {
  var G__9099__9100 = x;
  if(G__9099__9100) {
    if(function() {
      var or__3824__auto____9101 = G__9099__9100.cljs$lang$protocol_mask$partition0$ & 16777216;
      if(or__3824__auto____9101) {
        return or__3824__auto____9101
      }else {
        return G__9099__9100.cljs$core$ISequential$
      }
    }()) {
      return true
    }else {
      if(!G__9099__9100.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, G__9099__9100)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, G__9099__9100)
  }
};
cljs.core.counted_QMARK_ = function counted_QMARK_(x) {
  var G__9105__9106 = x;
  if(G__9105__9106) {
    if(function() {
      var or__3824__auto____9107 = G__9105__9106.cljs$lang$protocol_mask$partition0$ & 2;
      if(or__3824__auto____9107) {
        return or__3824__auto____9107
      }else {
        return G__9105__9106.cljs$core$ICounted$
      }
    }()) {
      return true
    }else {
      if(!G__9105__9106.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, G__9105__9106)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, G__9105__9106)
  }
};
cljs.core.indexed_QMARK_ = function indexed_QMARK_(x) {
  var G__9111__9112 = x;
  if(G__9111__9112) {
    if(function() {
      var or__3824__auto____9113 = G__9111__9112.cljs$lang$protocol_mask$partition0$ & 16;
      if(or__3824__auto____9113) {
        return or__3824__auto____9113
      }else {
        return G__9111__9112.cljs$core$IIndexed$
      }
    }()) {
      return true
    }else {
      if(!G__9111__9112.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__9111__9112)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__9111__9112)
  }
};
cljs.core.reduceable_QMARK_ = function reduceable_QMARK_(x) {
  var G__9117__9118 = x;
  if(G__9117__9118) {
    if(function() {
      var or__3824__auto____9119 = G__9117__9118.cljs$lang$protocol_mask$partition0$ & 524288;
      if(or__3824__auto____9119) {
        return or__3824__auto____9119
      }else {
        return G__9117__9118.cljs$core$IReduce$
      }
    }()) {
      return true
    }else {
      if(!G__9117__9118.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__9117__9118)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__9117__9118)
  }
};
cljs.core.map_QMARK_ = function map_QMARK_(x) {
  if(x == null) {
    return false
  }else {
    var G__9123__9124 = x;
    if(G__9123__9124) {
      if(function() {
        var or__3824__auto____9125 = G__9123__9124.cljs$lang$protocol_mask$partition0$ & 1024;
        if(or__3824__auto____9125) {
          return or__3824__auto____9125
        }else {
          return G__9123__9124.cljs$core$IMap$
        }
      }()) {
        return true
      }else {
        if(!G__9123__9124.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IMap, G__9123__9124)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMap, G__9123__9124)
    }
  }
};
cljs.core.vector_QMARK_ = function vector_QMARK_(x) {
  var G__9129__9130 = x;
  if(G__9129__9130) {
    if(function() {
      var or__3824__auto____9131 = G__9129__9130.cljs$lang$protocol_mask$partition0$ & 16384;
      if(or__3824__auto____9131) {
        return or__3824__auto____9131
      }else {
        return G__9129__9130.cljs$core$IVector$
      }
    }()) {
      return true
    }else {
      if(!G__9129__9130.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IVector, G__9129__9130)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IVector, G__9129__9130)
  }
};
cljs.core.chunked_seq_QMARK_ = function chunked_seq_QMARK_(x) {
  var G__9135__9136 = x;
  if(G__9135__9136) {
    if(cljs.core.truth_(function() {
      var or__3824__auto____9137 = null;
      if(cljs.core.truth_(or__3824__auto____9137)) {
        return or__3824__auto____9137
      }else {
        return G__9135__9136.cljs$core$IChunkedSeq$
      }
    }())) {
      return true
    }else {
      if(!G__9135__9136.cljs$lang$protocol_mask$partition$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IChunkedSeq, G__9135__9136)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IChunkedSeq, G__9135__9136)
  }
};
cljs.core.js_obj = function() {
  var js_obj = null;
  var js_obj__0 = function() {
    return{}
  };
  var js_obj__1 = function() {
    var G__9138__delegate = function(keyvals) {
      return cljs.core.apply.call(null, goog.object.create, keyvals)
    };
    var G__9138 = function(var_args) {
      var keyvals = null;
      if(goog.isDef(var_args)) {
        keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__9138__delegate.call(this, keyvals)
    };
    G__9138.cljs$lang$maxFixedArity = 0;
    G__9138.cljs$lang$applyTo = function(arglist__9139) {
      var keyvals = cljs.core.seq(arglist__9139);
      return G__9138__delegate(keyvals)
    };
    G__9138.cljs$lang$arity$variadic = G__9138__delegate;
    return G__9138
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
  var keys__9141 = [];
  goog.object.forEach(obj, function(val, key, obj) {
    return keys__9141.push(key)
  });
  return keys__9141
};
cljs.core.js_delete = function js_delete(obj, key) {
  return delete obj[key]
};
cljs.core.array_copy = function array_copy(from, i, to, j, len) {
  var i__9145 = i;
  var j__9146 = j;
  var len__9147 = len;
  while(true) {
    if(len__9147 === 0) {
      return to
    }else {
      to[j__9146] = from[i__9145];
      var G__9148 = i__9145 + 1;
      var G__9149 = j__9146 + 1;
      var G__9150 = len__9147 - 1;
      i__9145 = G__9148;
      j__9146 = G__9149;
      len__9147 = G__9150;
      continue
    }
    break
  }
};
cljs.core.array_copy_downward = function array_copy_downward(from, i, to, j, len) {
  var i__9154 = i + (len - 1);
  var j__9155 = j + (len - 1);
  var len__9156 = len;
  while(true) {
    if(len__9156 === 0) {
      return to
    }else {
      to[j__9155] = from[i__9154];
      var G__9157 = i__9154 - 1;
      var G__9158 = j__9155 - 1;
      var G__9159 = len__9156 - 1;
      i__9154 = G__9157;
      j__9155 = G__9158;
      len__9156 = G__9159;
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
    var G__9163__9164 = s;
    if(G__9163__9164) {
      if(function() {
        var or__3824__auto____9165 = G__9163__9164.cljs$lang$protocol_mask$partition0$ & 64;
        if(or__3824__auto____9165) {
          return or__3824__auto____9165
        }else {
          return G__9163__9164.cljs$core$ISeq$
        }
      }()) {
        return true
      }else {
        if(!G__9163__9164.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__9163__9164)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__9163__9164)
    }
  }
};
cljs.core.seqable_QMARK_ = function seqable_QMARK_(s) {
  var G__9169__9170 = s;
  if(G__9169__9170) {
    if(function() {
      var or__3824__auto____9171 = G__9169__9170.cljs$lang$protocol_mask$partition0$ & 8388608;
      if(or__3824__auto____9171) {
        return or__3824__auto____9171
      }else {
        return G__9169__9170.cljs$core$ISeqable$
      }
    }()) {
      return true
    }else {
      if(!G__9169__9170.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISeqable, G__9169__9170)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISeqable, G__9169__9170)
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
  var and__3822__auto____9174 = goog.isString(x);
  if(and__3822__auto____9174) {
    return!function() {
      var or__3824__auto____9175 = x.charAt(0) === "\ufdd0";
      if(or__3824__auto____9175) {
        return or__3824__auto____9175
      }else {
        return x.charAt(0) === "\ufdd1"
      }
    }()
  }else {
    return and__3822__auto____9174
  }
};
cljs.core.keyword_QMARK_ = function keyword_QMARK_(x) {
  var and__3822__auto____9177 = goog.isString(x);
  if(and__3822__auto____9177) {
    return x.charAt(0) === "\ufdd0"
  }else {
    return and__3822__auto____9177
  }
};
cljs.core.symbol_QMARK_ = function symbol_QMARK_(x) {
  var and__3822__auto____9179 = goog.isString(x);
  if(and__3822__auto____9179) {
    return x.charAt(0) === "\ufdd1"
  }else {
    return and__3822__auto____9179
  }
};
cljs.core.number_QMARK_ = function number_QMARK_(n) {
  return goog.isNumber(n)
};
cljs.core.fn_QMARK_ = function fn_QMARK_(f) {
  return goog.isFunction(f)
};
cljs.core.ifn_QMARK_ = function ifn_QMARK_(f) {
  var or__3824__auto____9184 = cljs.core.fn_QMARK_.call(null, f);
  if(or__3824__auto____9184) {
    return or__3824__auto____9184
  }else {
    var G__9185__9186 = f;
    if(G__9185__9186) {
      if(function() {
        var or__3824__auto____9187 = G__9185__9186.cljs$lang$protocol_mask$partition0$ & 1;
        if(or__3824__auto____9187) {
          return or__3824__auto____9187
        }else {
          return G__9185__9186.cljs$core$IFn$
        }
      }()) {
        return true
      }else {
        if(!G__9185__9186.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IFn, G__9185__9186)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IFn, G__9185__9186)
    }
  }
};
cljs.core.integer_QMARK_ = function integer_QMARK_(n) {
  var and__3822__auto____9189 = cljs.core.number_QMARK_.call(null, n);
  if(and__3822__auto____9189) {
    return n == n.toFixed()
  }else {
    return and__3822__auto____9189
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
    var and__3822__auto____9192 = coll;
    if(cljs.core.truth_(and__3822__auto____9192)) {
      var and__3822__auto____9193 = cljs.core.associative_QMARK_.call(null, coll);
      if(and__3822__auto____9193) {
        return cljs.core.contains_QMARK_.call(null, coll, k)
      }else {
        return and__3822__auto____9193
      }
    }else {
      return and__3822__auto____9192
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
    var G__9202__delegate = function(x, y, more) {
      if(!cljs.core._EQ_.call(null, x, y)) {
        var s__9198 = cljs.core.PersistentHashSet.fromArray([y, x]);
        var xs__9199 = more;
        while(true) {
          var x__9200 = cljs.core.first.call(null, xs__9199);
          var etc__9201 = cljs.core.next.call(null, xs__9199);
          if(cljs.core.truth_(xs__9199)) {
            if(cljs.core.contains_QMARK_.call(null, s__9198, x__9200)) {
              return false
            }else {
              var G__9203 = cljs.core.conj.call(null, s__9198, x__9200);
              var G__9204 = etc__9201;
              s__9198 = G__9203;
              xs__9199 = G__9204;
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
    var G__9202 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9202__delegate.call(this, x, y, more)
    };
    G__9202.cljs$lang$maxFixedArity = 2;
    G__9202.cljs$lang$applyTo = function(arglist__9205) {
      var x = cljs.core.first(arglist__9205);
      var y = cljs.core.first(cljs.core.next(arglist__9205));
      var more = cljs.core.rest(cljs.core.next(arglist__9205));
      return G__9202__delegate(x, y, more)
    };
    G__9202.cljs$lang$arity$variadic = G__9202__delegate;
    return G__9202
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
            var G__9209__9210 = x;
            if(G__9209__9210) {
              if(cljs.core.truth_(function() {
                var or__3824__auto____9211 = null;
                if(cljs.core.truth_(or__3824__auto____9211)) {
                  return or__3824__auto____9211
                }else {
                  return G__9209__9210.cljs$core$IComparable$
                }
              }())) {
                return true
              }else {
                if(!G__9209__9210.cljs$lang$protocol_mask$partition$) {
                  return cljs.core.type_satisfies_.call(null, cljs.core.IComparable, G__9209__9210)
                }else {
                  return false
                }
              }
            }else {
              return cljs.core.type_satisfies_.call(null, cljs.core.IComparable, G__9209__9210)
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
    var xl__9216 = cljs.core.count.call(null, xs);
    var yl__9217 = cljs.core.count.call(null, ys);
    if(xl__9216 < yl__9217) {
      return-1
    }else {
      if(xl__9216 > yl__9217) {
        return 1
      }else {
        if("\ufdd0'else") {
          return compare_indexed.call(null, xs, ys, xl__9216, 0)
        }else {
          return null
        }
      }
    }
  };
  var compare_indexed__4 = function(xs, ys, len, n) {
    while(true) {
      var d__9218 = cljs.core.compare.call(null, cljs.core.nth.call(null, xs, n), cljs.core.nth.call(null, ys, n));
      if(function() {
        var and__3822__auto____9219 = d__9218 === 0;
        if(and__3822__auto____9219) {
          return n + 1 < len
        }else {
          return and__3822__auto____9219
        }
      }()) {
        var G__9220 = xs;
        var G__9221 = ys;
        var G__9222 = len;
        var G__9223 = n + 1;
        xs = G__9220;
        ys = G__9221;
        len = G__9222;
        n = G__9223;
        continue
      }else {
        return d__9218
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
      var r__9225 = f.call(null, x, y);
      if(cljs.core.number_QMARK_.call(null, r__9225)) {
        return r__9225
      }else {
        if(cljs.core.truth_(r__9225)) {
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
      var a__9227 = cljs.core.to_array.call(null, coll);
      goog.array.stableSort(a__9227, cljs.core.fn__GT_comparator.call(null, comp));
      return cljs.core.seq.call(null, a__9227)
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
    var temp__3971__auto____9233 = cljs.core.seq.call(null, coll);
    if(temp__3971__auto____9233) {
      var s__9234 = temp__3971__auto____9233;
      return cljs.core.reduce.call(null, f, cljs.core.first.call(null, s__9234), cljs.core.next.call(null, s__9234))
    }else {
      return f.call(null)
    }
  };
  var seq_reduce__3 = function(f, val, coll) {
    var val__9235 = val;
    var coll__9236 = cljs.core.seq.call(null, coll);
    while(true) {
      if(coll__9236) {
        var nval__9237 = f.call(null, val__9235, cljs.core.first.call(null, coll__9236));
        if(cljs.core.reduced_QMARK_.call(null, nval__9237)) {
          return cljs.core.deref.call(null, nval__9237)
        }else {
          var G__9238 = nval__9237;
          var G__9239 = cljs.core.next.call(null, coll__9236);
          val__9235 = G__9238;
          coll__9236 = G__9239;
          continue
        }
      }else {
        return val__9235
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
  var a__9241 = cljs.core.to_array.call(null, coll);
  goog.array.shuffle(a__9241);
  return cljs.core.vec.call(null, a__9241)
};
cljs.core.reduce = function() {
  var reduce = null;
  var reduce__2 = function(f, coll) {
    if(function() {
      var G__9248__9249 = coll;
      if(G__9248__9249) {
        if(function() {
          var or__3824__auto____9250 = G__9248__9249.cljs$lang$protocol_mask$partition0$ & 524288;
          if(or__3824__auto____9250) {
            return or__3824__auto____9250
          }else {
            return G__9248__9249.cljs$core$IReduce$
          }
        }()) {
          return true
        }else {
          if(!G__9248__9249.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__9248__9249)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__9248__9249)
      }
    }()) {
      return cljs.core._reduce.call(null, coll, f)
    }else {
      return cljs.core.seq_reduce.call(null, f, coll)
    }
  };
  var reduce__3 = function(f, val, coll) {
    if(function() {
      var G__9251__9252 = coll;
      if(G__9251__9252) {
        if(function() {
          var or__3824__auto____9253 = G__9251__9252.cljs$lang$protocol_mask$partition0$ & 524288;
          if(or__3824__auto____9253) {
            return or__3824__auto____9253
          }else {
            return G__9251__9252.cljs$core$IReduce$
          }
        }()) {
          return true
        }else {
          if(!G__9251__9252.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__9251__9252)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__9251__9252)
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
  var this__9254 = this;
  return this__9254.val
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
    var G__9255__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _PLUS_, x + y, more)
    };
    var G__9255 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9255__delegate.call(this, x, y, more)
    };
    G__9255.cljs$lang$maxFixedArity = 2;
    G__9255.cljs$lang$applyTo = function(arglist__9256) {
      var x = cljs.core.first(arglist__9256);
      var y = cljs.core.first(cljs.core.next(arglist__9256));
      var more = cljs.core.rest(cljs.core.next(arglist__9256));
      return G__9255__delegate(x, y, more)
    };
    G__9255.cljs$lang$arity$variadic = G__9255__delegate;
    return G__9255
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
    var G__9257__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _, x - y, more)
    };
    var G__9257 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9257__delegate.call(this, x, y, more)
    };
    G__9257.cljs$lang$maxFixedArity = 2;
    G__9257.cljs$lang$applyTo = function(arglist__9258) {
      var x = cljs.core.first(arglist__9258);
      var y = cljs.core.first(cljs.core.next(arglist__9258));
      var more = cljs.core.rest(cljs.core.next(arglist__9258));
      return G__9257__delegate(x, y, more)
    };
    G__9257.cljs$lang$arity$variadic = G__9257__delegate;
    return G__9257
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
    var G__9259__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _STAR_, x * y, more)
    };
    var G__9259 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9259__delegate.call(this, x, y, more)
    };
    G__9259.cljs$lang$maxFixedArity = 2;
    G__9259.cljs$lang$applyTo = function(arglist__9260) {
      var x = cljs.core.first(arglist__9260);
      var y = cljs.core.first(cljs.core.next(arglist__9260));
      var more = cljs.core.rest(cljs.core.next(arglist__9260));
      return G__9259__delegate(x, y, more)
    };
    G__9259.cljs$lang$arity$variadic = G__9259__delegate;
    return G__9259
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
    var G__9261__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _SLASH_, _SLASH_.call(null, x, y), more)
    };
    var G__9261 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9261__delegate.call(this, x, y, more)
    };
    G__9261.cljs$lang$maxFixedArity = 2;
    G__9261.cljs$lang$applyTo = function(arglist__9262) {
      var x = cljs.core.first(arglist__9262);
      var y = cljs.core.first(cljs.core.next(arglist__9262));
      var more = cljs.core.rest(cljs.core.next(arglist__9262));
      return G__9261__delegate(x, y, more)
    };
    G__9261.cljs$lang$arity$variadic = G__9261__delegate;
    return G__9261
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
    var G__9263__delegate = function(x, y, more) {
      while(true) {
        if(x < y) {
          if(cljs.core.next.call(null, more)) {
            var G__9264 = y;
            var G__9265 = cljs.core.first.call(null, more);
            var G__9266 = cljs.core.next.call(null, more);
            x = G__9264;
            y = G__9265;
            more = G__9266;
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
    var G__9263 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9263__delegate.call(this, x, y, more)
    };
    G__9263.cljs$lang$maxFixedArity = 2;
    G__9263.cljs$lang$applyTo = function(arglist__9267) {
      var x = cljs.core.first(arglist__9267);
      var y = cljs.core.first(cljs.core.next(arglist__9267));
      var more = cljs.core.rest(cljs.core.next(arglist__9267));
      return G__9263__delegate(x, y, more)
    };
    G__9263.cljs$lang$arity$variadic = G__9263__delegate;
    return G__9263
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
    var G__9268__delegate = function(x, y, more) {
      while(true) {
        if(x <= y) {
          if(cljs.core.next.call(null, more)) {
            var G__9269 = y;
            var G__9270 = cljs.core.first.call(null, more);
            var G__9271 = cljs.core.next.call(null, more);
            x = G__9269;
            y = G__9270;
            more = G__9271;
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
    var G__9268 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9268__delegate.call(this, x, y, more)
    };
    G__9268.cljs$lang$maxFixedArity = 2;
    G__9268.cljs$lang$applyTo = function(arglist__9272) {
      var x = cljs.core.first(arglist__9272);
      var y = cljs.core.first(cljs.core.next(arglist__9272));
      var more = cljs.core.rest(cljs.core.next(arglist__9272));
      return G__9268__delegate(x, y, more)
    };
    G__9268.cljs$lang$arity$variadic = G__9268__delegate;
    return G__9268
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
    var G__9273__delegate = function(x, y, more) {
      while(true) {
        if(x > y) {
          if(cljs.core.next.call(null, more)) {
            var G__9274 = y;
            var G__9275 = cljs.core.first.call(null, more);
            var G__9276 = cljs.core.next.call(null, more);
            x = G__9274;
            y = G__9275;
            more = G__9276;
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
    var G__9273 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9273__delegate.call(this, x, y, more)
    };
    G__9273.cljs$lang$maxFixedArity = 2;
    G__9273.cljs$lang$applyTo = function(arglist__9277) {
      var x = cljs.core.first(arglist__9277);
      var y = cljs.core.first(cljs.core.next(arglist__9277));
      var more = cljs.core.rest(cljs.core.next(arglist__9277));
      return G__9273__delegate(x, y, more)
    };
    G__9273.cljs$lang$arity$variadic = G__9273__delegate;
    return G__9273
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
    var G__9278__delegate = function(x, y, more) {
      while(true) {
        if(x >= y) {
          if(cljs.core.next.call(null, more)) {
            var G__9279 = y;
            var G__9280 = cljs.core.first.call(null, more);
            var G__9281 = cljs.core.next.call(null, more);
            x = G__9279;
            y = G__9280;
            more = G__9281;
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
    var G__9278 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9278__delegate.call(this, x, y, more)
    };
    G__9278.cljs$lang$maxFixedArity = 2;
    G__9278.cljs$lang$applyTo = function(arglist__9282) {
      var x = cljs.core.first(arglist__9282);
      var y = cljs.core.first(cljs.core.next(arglist__9282));
      var more = cljs.core.rest(cljs.core.next(arglist__9282));
      return G__9278__delegate(x, y, more)
    };
    G__9278.cljs$lang$arity$variadic = G__9278__delegate;
    return G__9278
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
    var G__9283__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, max, x > y ? x : y, more)
    };
    var G__9283 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9283__delegate.call(this, x, y, more)
    };
    G__9283.cljs$lang$maxFixedArity = 2;
    G__9283.cljs$lang$applyTo = function(arglist__9284) {
      var x = cljs.core.first(arglist__9284);
      var y = cljs.core.first(cljs.core.next(arglist__9284));
      var more = cljs.core.rest(cljs.core.next(arglist__9284));
      return G__9283__delegate(x, y, more)
    };
    G__9283.cljs$lang$arity$variadic = G__9283__delegate;
    return G__9283
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
    var G__9285__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, min, x < y ? x : y, more)
    };
    var G__9285 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9285__delegate.call(this, x, y, more)
    };
    G__9285.cljs$lang$maxFixedArity = 2;
    G__9285.cljs$lang$applyTo = function(arglist__9286) {
      var x = cljs.core.first(arglist__9286);
      var y = cljs.core.first(cljs.core.next(arglist__9286));
      var more = cljs.core.rest(cljs.core.next(arglist__9286));
      return G__9285__delegate(x, y, more)
    };
    G__9285.cljs$lang$arity$variadic = G__9285__delegate;
    return G__9285
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
  var rem__9288 = n % d;
  return cljs.core.fix.call(null, (n - rem__9288) / d)
};
cljs.core.rem = function rem(n, d) {
  var q__9290 = cljs.core.quot.call(null, n, d);
  return n - d * q__9290
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
  var v__9293 = v - (v >> 1 & 1431655765);
  var v__9294 = (v__9293 & 858993459) + (v__9293 >> 2 & 858993459);
  return(v__9294 + (v__9294 >> 4) & 252645135) * 16843009 >> 24
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
    var G__9295__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ__EQ_.call(null, x, y))) {
          if(cljs.core.next.call(null, more)) {
            var G__9296 = y;
            var G__9297 = cljs.core.first.call(null, more);
            var G__9298 = cljs.core.next.call(null, more);
            x = G__9296;
            y = G__9297;
            more = G__9298;
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
    var G__9295 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9295__delegate.call(this, x, y, more)
    };
    G__9295.cljs$lang$maxFixedArity = 2;
    G__9295.cljs$lang$applyTo = function(arglist__9299) {
      var x = cljs.core.first(arglist__9299);
      var y = cljs.core.first(cljs.core.next(arglist__9299));
      var more = cljs.core.rest(cljs.core.next(arglist__9299));
      return G__9295__delegate(x, y, more)
    };
    G__9295.cljs$lang$arity$variadic = G__9295__delegate;
    return G__9295
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
  var n__9303 = n;
  var xs__9304 = cljs.core.seq.call(null, coll);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3822__auto____9305 = xs__9304;
      if(and__3822__auto____9305) {
        return n__9303 > 0
      }else {
        return and__3822__auto____9305
      }
    }())) {
      var G__9306 = n__9303 - 1;
      var G__9307 = cljs.core.next.call(null, xs__9304);
      n__9303 = G__9306;
      xs__9304 = G__9307;
      continue
    }else {
      return xs__9304
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
    var G__9308__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__9309 = sb.append(str_STAR_.call(null, cljs.core.first.call(null, more)));
            var G__9310 = cljs.core.next.call(null, more);
            sb = G__9309;
            more = G__9310;
            continue
          }else {
            return str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str_STAR_.call(null, x)), ys)
    };
    var G__9308 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__9308__delegate.call(this, x, ys)
    };
    G__9308.cljs$lang$maxFixedArity = 1;
    G__9308.cljs$lang$applyTo = function(arglist__9311) {
      var x = cljs.core.first(arglist__9311);
      var ys = cljs.core.rest(arglist__9311);
      return G__9308__delegate(x, ys)
    };
    G__9308.cljs$lang$arity$variadic = G__9308__delegate;
    return G__9308
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
    var G__9312__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__9313 = sb.append(str.call(null, cljs.core.first.call(null, more)));
            var G__9314 = cljs.core.next.call(null, more);
            sb = G__9313;
            more = G__9314;
            continue
          }else {
            return cljs.core.str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str.call(null, x)), ys)
    };
    var G__9312 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__9312__delegate.call(this, x, ys)
    };
    G__9312.cljs$lang$maxFixedArity = 1;
    G__9312.cljs$lang$applyTo = function(arglist__9315) {
      var x = cljs.core.first(arglist__9315);
      var ys = cljs.core.rest(arglist__9315);
      return G__9312__delegate(x, ys)
    };
    G__9312.cljs$lang$arity$variadic = G__9312__delegate;
    return G__9312
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
  format.cljs$lang$applyTo = function(arglist__9316) {
    var fmt = cljs.core.first(arglist__9316);
    var args = cljs.core.rest(arglist__9316);
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
    var xs__9319 = cljs.core.seq.call(null, x);
    var ys__9320 = cljs.core.seq.call(null, y);
    while(true) {
      if(xs__9319 == null) {
        return ys__9320 == null
      }else {
        if(ys__9320 == null) {
          return false
        }else {
          if(cljs.core._EQ_.call(null, cljs.core.first.call(null, xs__9319), cljs.core.first.call(null, ys__9320))) {
            var G__9321 = cljs.core.next.call(null, xs__9319);
            var G__9322 = cljs.core.next.call(null, ys__9320);
            xs__9319 = G__9321;
            ys__9320 = G__9322;
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
  return cljs.core.reduce.call(null, function(p1__9323_SHARP_, p2__9324_SHARP_) {
    return cljs.core.hash_combine.call(null, p1__9323_SHARP_, cljs.core.hash.call(null, p2__9324_SHARP_, false))
  }, cljs.core.hash.call(null, cljs.core.first.call(null, coll), false), cljs.core.next.call(null, coll))
};
cljs.core.hash_imap = function hash_imap(m) {
  var h__9328 = 0;
  var s__9329 = cljs.core.seq.call(null, m);
  while(true) {
    if(s__9329) {
      var e__9330 = cljs.core.first.call(null, s__9329);
      var G__9331 = (h__9328 + (cljs.core.hash.call(null, cljs.core.key.call(null, e__9330)) ^ cljs.core.hash.call(null, cljs.core.val.call(null, e__9330)))) % 4503599627370496;
      var G__9332 = cljs.core.next.call(null, s__9329);
      h__9328 = G__9331;
      s__9329 = G__9332;
      continue
    }else {
      return h__9328
    }
    break
  }
};
cljs.core.hash_iset = function hash_iset(s) {
  var h__9336 = 0;
  var s__9337 = cljs.core.seq.call(null, s);
  while(true) {
    if(s__9337) {
      var e__9338 = cljs.core.first.call(null, s__9337);
      var G__9339 = (h__9336 + cljs.core.hash.call(null, e__9338)) % 4503599627370496;
      var G__9340 = cljs.core.next.call(null, s__9337);
      h__9336 = G__9339;
      s__9337 = G__9340;
      continue
    }else {
      return h__9336
    }
    break
  }
};
cljs.core.extend_object_BANG_ = function extend_object_BANG_(obj, fn_map) {
  var G__9361__9362 = cljs.core.seq.call(null, fn_map);
  if(G__9361__9362) {
    var G__9364__9366 = cljs.core.first.call(null, G__9361__9362);
    var vec__9365__9367 = G__9364__9366;
    var key_name__9368 = cljs.core.nth.call(null, vec__9365__9367, 0, null);
    var f__9369 = cljs.core.nth.call(null, vec__9365__9367, 1, null);
    var G__9361__9370 = G__9361__9362;
    var G__9364__9371 = G__9364__9366;
    var G__9361__9372 = G__9361__9370;
    while(true) {
      var vec__9373__9374 = G__9364__9371;
      var key_name__9375 = cljs.core.nth.call(null, vec__9373__9374, 0, null);
      var f__9376 = cljs.core.nth.call(null, vec__9373__9374, 1, null);
      var G__9361__9377 = G__9361__9372;
      var str_name__9378 = cljs.core.name.call(null, key_name__9375);
      obj[str_name__9378] = f__9376;
      var temp__3974__auto____9379 = cljs.core.next.call(null, G__9361__9377);
      if(temp__3974__auto____9379) {
        var G__9361__9380 = temp__3974__auto____9379;
        var G__9381 = cljs.core.first.call(null, G__9361__9380);
        var G__9382 = G__9361__9380;
        G__9364__9371 = G__9381;
        G__9361__9372 = G__9382;
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
  var this__9383 = this;
  var h__2192__auto____9384 = this__9383.__hash;
  if(!(h__2192__auto____9384 == null)) {
    return h__2192__auto____9384
  }else {
    var h__2192__auto____9385 = cljs.core.hash_coll.call(null, coll);
    this__9383.__hash = h__2192__auto____9385;
    return h__2192__auto____9385
  }
};
cljs.core.List.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__9386 = this;
  if(this__9386.count === 1) {
    return null
  }else {
    return this__9386.rest
  }
};
cljs.core.List.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9387 = this;
  return new cljs.core.List(this__9387.meta, o, coll, this__9387.count + 1, null)
};
cljs.core.List.prototype.toString = function() {
  var this__9388 = this;
  var this__9389 = this;
  return cljs.core.pr_str.call(null, this__9389)
};
cljs.core.List.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9390 = this;
  return coll
};
cljs.core.List.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9391 = this;
  return this__9391.count
};
cljs.core.List.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__9392 = this;
  return this__9392.first
};
cljs.core.List.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__9393 = this;
  return coll.cljs$core$ISeq$_rest$arity$1(coll)
};
cljs.core.List.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9394 = this;
  return this__9394.first
};
cljs.core.List.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9395 = this;
  if(this__9395.count === 1) {
    return cljs.core.List.EMPTY
  }else {
    return this__9395.rest
  }
};
cljs.core.List.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9396 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9397 = this;
  return new cljs.core.List(meta, this__9397.first, this__9397.rest, this__9397.count, this__9397.__hash)
};
cljs.core.List.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9398 = this;
  return this__9398.meta
};
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9399 = this;
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
  var this__9400 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__9401 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9402 = this;
  return new cljs.core.List(this__9402.meta, o, null, 1, null)
};
cljs.core.EmptyList.prototype.toString = function() {
  var this__9403 = this;
  var this__9404 = this;
  return cljs.core.pr_str.call(null, this__9404)
};
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9405 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9406 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__9407 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__9408 = this;
  throw new Error("Can't pop empty list");
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9409 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9410 = this;
  return cljs.core.List.EMPTY
};
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9411 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9412 = this;
  return new cljs.core.EmptyList(meta)
};
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9413 = this;
  return this__9413.meta
};
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9414 = this;
  return coll
};
cljs.core.EmptyList;
cljs.core.List.EMPTY = new cljs.core.EmptyList(null);
cljs.core.reversible_QMARK_ = function reversible_QMARK_(coll) {
  var G__9418__9419 = coll;
  if(G__9418__9419) {
    if(function() {
      var or__3824__auto____9420 = G__9418__9419.cljs$lang$protocol_mask$partition0$ & 134217728;
      if(or__3824__auto____9420) {
        return or__3824__auto____9420
      }else {
        return G__9418__9419.cljs$core$IReversible$
      }
    }()) {
      return true
    }else {
      if(!G__9418__9419.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IReversible, G__9418__9419)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IReversible, G__9418__9419)
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
    var G__9421__delegate = function(x, y, z, items) {
      return cljs.core.conj.call(null, cljs.core.conj.call(null, cljs.core.conj.call(null, cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, cljs.core.reverse.call(null, items)), z), y), x)
    };
    var G__9421 = function(x, y, z, var_args) {
      var items = null;
      if(goog.isDef(var_args)) {
        items = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__9421__delegate.call(this, x, y, z, items)
    };
    G__9421.cljs$lang$maxFixedArity = 3;
    G__9421.cljs$lang$applyTo = function(arglist__9422) {
      var x = cljs.core.first(arglist__9422);
      var y = cljs.core.first(cljs.core.next(arglist__9422));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9422)));
      var items = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9422)));
      return G__9421__delegate(x, y, z, items)
    };
    G__9421.cljs$lang$arity$variadic = G__9421__delegate;
    return G__9421
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
  var this__9423 = this;
  var h__2192__auto____9424 = this__9423.__hash;
  if(!(h__2192__auto____9424 == null)) {
    return h__2192__auto____9424
  }else {
    var h__2192__auto____9425 = cljs.core.hash_coll.call(null, coll);
    this__9423.__hash = h__2192__auto____9425;
    return h__2192__auto____9425
  }
};
cljs.core.Cons.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__9426 = this;
  if(this__9426.rest == null) {
    return null
  }else {
    return cljs.core._seq.call(null, this__9426.rest)
  }
};
cljs.core.Cons.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9427 = this;
  return new cljs.core.Cons(null, o, coll, this__9427.__hash)
};
cljs.core.Cons.prototype.toString = function() {
  var this__9428 = this;
  var this__9429 = this;
  return cljs.core.pr_str.call(null, this__9429)
};
cljs.core.Cons.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9430 = this;
  return coll
};
cljs.core.Cons.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9431 = this;
  return this__9431.first
};
cljs.core.Cons.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9432 = this;
  if(this__9432.rest == null) {
    return cljs.core.List.EMPTY
  }else {
    return this__9432.rest
  }
};
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9433 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9434 = this;
  return new cljs.core.Cons(meta, this__9434.first, this__9434.rest, this__9434.__hash)
};
cljs.core.Cons.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9435 = this;
  return this__9435.meta
};
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9436 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__9436.meta)
};
cljs.core.Cons;
cljs.core.cons = function cons(x, coll) {
  if(function() {
    var or__3824__auto____9441 = coll == null;
    if(or__3824__auto____9441) {
      return or__3824__auto____9441
    }else {
      var G__9442__9443 = coll;
      if(G__9442__9443) {
        if(function() {
          var or__3824__auto____9444 = G__9442__9443.cljs$lang$protocol_mask$partition0$ & 64;
          if(or__3824__auto____9444) {
            return or__3824__auto____9444
          }else {
            return G__9442__9443.cljs$core$ISeq$
          }
        }()) {
          return true
        }else {
          if(!G__9442__9443.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__9442__9443)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__9442__9443)
      }
    }
  }()) {
    return new cljs.core.Cons(null, x, coll, null)
  }else {
    return new cljs.core.Cons(null, x, cljs.core.seq.call(null, coll), null)
  }
};
cljs.core.list_QMARK_ = function list_QMARK_(x) {
  var G__9448__9449 = x;
  if(G__9448__9449) {
    if(function() {
      var or__3824__auto____9450 = G__9448__9449.cljs$lang$protocol_mask$partition0$ & 33554432;
      if(or__3824__auto____9450) {
        return or__3824__auto____9450
      }else {
        return G__9448__9449.cljs$core$IList$
      }
    }()) {
      return true
    }else {
      if(!G__9448__9449.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IList, G__9448__9449)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IList, G__9448__9449)
  }
};
cljs.core.IReduce["string"] = true;
cljs.core._reduce["string"] = function() {
  var G__9451 = null;
  var G__9451__2 = function(string, f) {
    return cljs.core.ci_reduce.call(null, string, f)
  };
  var G__9451__3 = function(string, f, start) {
    return cljs.core.ci_reduce.call(null, string, f, start)
  };
  G__9451 = function(string, f, start) {
    switch(arguments.length) {
      case 2:
        return G__9451__2.call(this, string, f);
      case 3:
        return G__9451__3.call(this, string, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9451
}();
cljs.core.ILookup["string"] = true;
cljs.core._lookup["string"] = function() {
  var G__9452 = null;
  var G__9452__2 = function(string, k) {
    return cljs.core._nth.call(null, string, k)
  };
  var G__9452__3 = function(string, k, not_found) {
    return cljs.core._nth.call(null, string, k, not_found)
  };
  G__9452 = function(string, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9452__2.call(this, string, k);
      case 3:
        return G__9452__3.call(this, string, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9452
}();
cljs.core.IIndexed["string"] = true;
cljs.core._nth["string"] = function() {
  var G__9453 = null;
  var G__9453__2 = function(string, n) {
    if(n < cljs.core._count.call(null, string)) {
      return string.charAt(n)
    }else {
      return null
    }
  };
  var G__9453__3 = function(string, n, not_found) {
    if(n < cljs.core._count.call(null, string)) {
      return string.charAt(n)
    }else {
      return not_found
    }
  };
  G__9453 = function(string, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9453__2.call(this, string, n);
      case 3:
        return G__9453__3.call(this, string, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9453
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
  var G__9465 = null;
  var G__9465__2 = function(this_sym9456, coll) {
    var this__9458 = this;
    var this_sym9456__9459 = this;
    var ___9460 = this_sym9456__9459;
    if(coll == null) {
      return null
    }else {
      var strobj__9461 = coll.strobj;
      if(strobj__9461 == null) {
        return cljs.core._lookup.call(null, coll, this__9458.k, null)
      }else {
        return strobj__9461[this__9458.k]
      }
    }
  };
  var G__9465__3 = function(this_sym9457, coll, not_found) {
    var this__9458 = this;
    var this_sym9457__9462 = this;
    var ___9463 = this_sym9457__9462;
    if(coll == null) {
      return not_found
    }else {
      return cljs.core._lookup.call(null, coll, this__9458.k, not_found)
    }
  };
  G__9465 = function(this_sym9457, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9465__2.call(this, this_sym9457, coll);
      case 3:
        return G__9465__3.call(this, this_sym9457, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9465
}();
cljs.core.Keyword.prototype.apply = function(this_sym9454, args9455) {
  var this__9464 = this;
  return this_sym9454.call.apply(this_sym9454, [this_sym9454].concat(args9455.slice()))
};
cljs.core.Keyword;
String.prototype.cljs$core$IFn$ = true;
String.prototype.call = function() {
  var G__9474 = null;
  var G__9474__2 = function(this_sym9468, coll) {
    var this_sym9468__9470 = this;
    var this__9471 = this_sym9468__9470;
    return cljs.core._lookup.call(null, coll, this__9471.toString(), null)
  };
  var G__9474__3 = function(this_sym9469, coll, not_found) {
    var this_sym9469__9472 = this;
    var this__9473 = this_sym9469__9472;
    return cljs.core._lookup.call(null, coll, this__9473.toString(), not_found)
  };
  G__9474 = function(this_sym9469, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9474__2.call(this, this_sym9469, coll);
      case 3:
        return G__9474__3.call(this, this_sym9469, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9474
}();
String.prototype.apply = function(this_sym9466, args9467) {
  return this_sym9466.call.apply(this_sym9466, [this_sym9466].concat(args9467.slice()))
};
String.prototype.apply = function(s, args) {
  if(cljs.core.count.call(null, args) < 2) {
    return cljs.core._lookup.call(null, args[0], s, null)
  }else {
    return cljs.core._lookup.call(null, args[0], s, args[1])
  }
};
cljs.core.lazy_seq_value = function lazy_seq_value(lazy_seq) {
  var x__9476 = lazy_seq.x;
  if(lazy_seq.realized) {
    return x__9476
  }else {
    lazy_seq.x = x__9476.call(null);
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
  var this__9477 = this;
  var h__2192__auto____9478 = this__9477.__hash;
  if(!(h__2192__auto____9478 == null)) {
    return h__2192__auto____9478
  }else {
    var h__2192__auto____9479 = cljs.core.hash_coll.call(null, coll);
    this__9477.__hash = h__2192__auto____9479;
    return h__2192__auto____9479
  }
};
cljs.core.LazySeq.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__9480 = this;
  return cljs.core._seq.call(null, coll.cljs$core$ISeq$_rest$arity$1(coll))
};
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9481 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.LazySeq.prototype.toString = function() {
  var this__9482 = this;
  var this__9483 = this;
  return cljs.core.pr_str.call(null, this__9483)
};
cljs.core.LazySeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9484 = this;
  return cljs.core.seq.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9485 = this;
  return cljs.core.first.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9486 = this;
  return cljs.core.rest.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9487 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9488 = this;
  return new cljs.core.LazySeq(meta, this__9488.realized, this__9488.x, this__9488.__hash)
};
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9489 = this;
  return this__9489.meta
};
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9490 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__9490.meta)
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
  var this__9491 = this;
  return this__9491.end
};
cljs.core.ChunkBuffer.prototype.add = function(o) {
  var this__9492 = this;
  var ___9493 = this;
  this__9492.buf[this__9492.end] = o;
  return this__9492.end = this__9492.end + 1
};
cljs.core.ChunkBuffer.prototype.chunk = function(o) {
  var this__9494 = this;
  var ___9495 = this;
  var ret__9496 = new cljs.core.ArrayChunk(this__9494.buf, 0, this__9494.end);
  this__9494.buf = null;
  return ret__9496
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
  var this__9497 = this;
  return cljs.core.ci_reduce.call(null, coll, f, this__9497.arr[this__9497.off], this__9497.off + 1)
};
cljs.core.ArrayChunk.prototype.cljs$core$IReduce$_reduce$arity$3 = function(coll, f, start) {
  var this__9498 = this;
  return cljs.core.ci_reduce.call(null, coll, f, start, this__9498.off)
};
cljs.core.ArrayChunk.prototype.cljs$core$IChunk$ = true;
cljs.core.ArrayChunk.prototype.cljs$core$IChunk$_drop_first$arity$1 = function(coll) {
  var this__9499 = this;
  if(this__9499.off === this__9499.end) {
    throw new Error("-drop-first of empty chunk");
  }else {
    return new cljs.core.ArrayChunk(this__9499.arr, this__9499.off + 1, this__9499.end)
  }
};
cljs.core.ArrayChunk.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, i) {
  var this__9500 = this;
  return this__9500.arr[this__9500.off + i]
};
cljs.core.ArrayChunk.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, i, not_found) {
  var this__9501 = this;
  if(function() {
    var and__3822__auto____9502 = i >= 0;
    if(and__3822__auto____9502) {
      return i < this__9501.end - this__9501.off
    }else {
      return and__3822__auto____9502
    }
  }()) {
    return this__9501.arr[this__9501.off + i]
  }else {
    return not_found
  }
};
cljs.core.ArrayChunk.prototype.cljs$core$ICounted$_count$arity$1 = function(_) {
  var this__9503 = this;
  return this__9503.end - this__9503.off
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
  var this__9504 = this;
  return cljs.core.cons.call(null, o, this$)
};
cljs.core.ChunkedCons.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9505 = this;
  return coll
};
cljs.core.ChunkedCons.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9506 = this;
  return cljs.core._nth.call(null, this__9506.chunk, 0)
};
cljs.core.ChunkedCons.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9507 = this;
  if(cljs.core._count.call(null, this__9507.chunk) > 1) {
    return new cljs.core.ChunkedCons(cljs.core._drop_first.call(null, this__9507.chunk), this__9507.more, this__9507.meta)
  }else {
    if(this__9507.more == null) {
      return cljs.core.List.EMPTY
    }else {
      return this__9507.more
    }
  }
};
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedNext$ = true;
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedNext$_chunked_next$arity$1 = function(coll) {
  var this__9508 = this;
  if(this__9508.more == null) {
    return null
  }else {
    return this__9508.more
  }
};
cljs.core.ChunkedCons.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9509 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.ChunkedCons.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, m) {
  var this__9510 = this;
  return new cljs.core.ChunkedCons(this__9510.chunk, this__9510.more, m)
};
cljs.core.ChunkedCons.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9511 = this;
  return this__9511.meta
};
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedSeq$ = true;
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedSeq$_chunked_first$arity$1 = function(coll) {
  var this__9512 = this;
  return this__9512.chunk
};
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedSeq$_chunked_rest$arity$1 = function(coll) {
  var this__9513 = this;
  if(this__9513.more == null) {
    return cljs.core.List.EMPTY
  }else {
    return this__9513.more
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
    var G__9517__9518 = s;
    if(G__9517__9518) {
      if(cljs.core.truth_(function() {
        var or__3824__auto____9519 = null;
        if(cljs.core.truth_(or__3824__auto____9519)) {
          return or__3824__auto____9519
        }else {
          return G__9517__9518.cljs$core$IChunkedNext$
        }
      }())) {
        return true
      }else {
        if(!G__9517__9518.cljs$lang$protocol_mask$partition$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IChunkedNext, G__9517__9518)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IChunkedNext, G__9517__9518)
    }
  }()) {
    return cljs.core._chunked_next.call(null, s)
  }else {
    return cljs.core.seq.call(null, cljs.core._chunked_rest.call(null, s))
  }
};
cljs.core.to_array = function to_array(s) {
  var ary__9522 = [];
  var s__9523 = s;
  while(true) {
    if(cljs.core.seq.call(null, s__9523)) {
      ary__9522.push(cljs.core.first.call(null, s__9523));
      var G__9524 = cljs.core.next.call(null, s__9523);
      s__9523 = G__9524;
      continue
    }else {
      return ary__9522
    }
    break
  }
};
cljs.core.to_array_2d = function to_array_2d(coll) {
  var ret__9528 = cljs.core.make_array.call(null, cljs.core.count.call(null, coll));
  var i__9529 = 0;
  var xs__9530 = cljs.core.seq.call(null, coll);
  while(true) {
    if(xs__9530) {
      ret__9528[i__9529] = cljs.core.to_array.call(null, cljs.core.first.call(null, xs__9530));
      var G__9531 = i__9529 + 1;
      var G__9532 = cljs.core.next.call(null, xs__9530);
      i__9529 = G__9531;
      xs__9530 = G__9532;
      continue
    }else {
    }
    break
  }
  return ret__9528
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
    var a__9540 = cljs.core.make_array.call(null, size);
    if(cljs.core.seq_QMARK_.call(null, init_val_or_seq)) {
      var s__9541 = cljs.core.seq.call(null, init_val_or_seq);
      var i__9542 = 0;
      var s__9543 = s__9541;
      while(true) {
        if(cljs.core.truth_(function() {
          var and__3822__auto____9544 = s__9543;
          if(and__3822__auto____9544) {
            return i__9542 < size
          }else {
            return and__3822__auto____9544
          }
        }())) {
          a__9540[i__9542] = cljs.core.first.call(null, s__9543);
          var G__9547 = i__9542 + 1;
          var G__9548 = cljs.core.next.call(null, s__9543);
          i__9542 = G__9547;
          s__9543 = G__9548;
          continue
        }else {
          return a__9540
        }
        break
      }
    }else {
      var n__2527__auto____9545 = size;
      var i__9546 = 0;
      while(true) {
        if(i__9546 < n__2527__auto____9545) {
          a__9540[i__9546] = init_val_or_seq;
          var G__9549 = i__9546 + 1;
          i__9546 = G__9549;
          continue
        }else {
        }
        break
      }
      return a__9540
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
    var a__9557 = cljs.core.make_array.call(null, size);
    if(cljs.core.seq_QMARK_.call(null, init_val_or_seq)) {
      var s__9558 = cljs.core.seq.call(null, init_val_or_seq);
      var i__9559 = 0;
      var s__9560 = s__9558;
      while(true) {
        if(cljs.core.truth_(function() {
          var and__3822__auto____9561 = s__9560;
          if(and__3822__auto____9561) {
            return i__9559 < size
          }else {
            return and__3822__auto____9561
          }
        }())) {
          a__9557[i__9559] = cljs.core.first.call(null, s__9560);
          var G__9564 = i__9559 + 1;
          var G__9565 = cljs.core.next.call(null, s__9560);
          i__9559 = G__9564;
          s__9560 = G__9565;
          continue
        }else {
          return a__9557
        }
        break
      }
    }else {
      var n__2527__auto____9562 = size;
      var i__9563 = 0;
      while(true) {
        if(i__9563 < n__2527__auto____9562) {
          a__9557[i__9563] = init_val_or_seq;
          var G__9566 = i__9563 + 1;
          i__9563 = G__9566;
          continue
        }else {
        }
        break
      }
      return a__9557
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
    var a__9574 = cljs.core.make_array.call(null, size);
    if(cljs.core.seq_QMARK_.call(null, init_val_or_seq)) {
      var s__9575 = cljs.core.seq.call(null, init_val_or_seq);
      var i__9576 = 0;
      var s__9577 = s__9575;
      while(true) {
        if(cljs.core.truth_(function() {
          var and__3822__auto____9578 = s__9577;
          if(and__3822__auto____9578) {
            return i__9576 < size
          }else {
            return and__3822__auto____9578
          }
        }())) {
          a__9574[i__9576] = cljs.core.first.call(null, s__9577);
          var G__9581 = i__9576 + 1;
          var G__9582 = cljs.core.next.call(null, s__9577);
          i__9576 = G__9581;
          s__9577 = G__9582;
          continue
        }else {
          return a__9574
        }
        break
      }
    }else {
      var n__2527__auto____9579 = size;
      var i__9580 = 0;
      while(true) {
        if(i__9580 < n__2527__auto____9579) {
          a__9574[i__9580] = init_val_or_seq;
          var G__9583 = i__9580 + 1;
          i__9580 = G__9583;
          continue
        }else {
        }
        break
      }
      return a__9574
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
    var s__9588 = s;
    var i__9589 = n;
    var sum__9590 = 0;
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3822__auto____9591 = i__9589 > 0;
        if(and__3822__auto____9591) {
          return cljs.core.seq.call(null, s__9588)
        }else {
          return and__3822__auto____9591
        }
      }())) {
        var G__9592 = cljs.core.next.call(null, s__9588);
        var G__9593 = i__9589 - 1;
        var G__9594 = sum__9590 + 1;
        s__9588 = G__9592;
        i__9589 = G__9593;
        sum__9590 = G__9594;
        continue
      }else {
        return sum__9590
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
      var s__9599 = cljs.core.seq.call(null, x);
      if(s__9599) {
        if(cljs.core.chunked_seq_QMARK_.call(null, s__9599)) {
          return cljs.core.chunk_cons.call(null, cljs.core.chunk_first.call(null, s__9599), concat.call(null, cljs.core.chunk_rest.call(null, s__9599), y))
        }else {
          return cljs.core.cons.call(null, cljs.core.first.call(null, s__9599), concat.call(null, cljs.core.rest.call(null, s__9599), y))
        }
      }else {
        return y
      }
    }, null)
  };
  var concat__3 = function() {
    var G__9603__delegate = function(x, y, zs) {
      var cat__9602 = function cat(xys, zs) {
        return new cljs.core.LazySeq(null, false, function() {
          var xys__9601 = cljs.core.seq.call(null, xys);
          if(xys__9601) {
            if(cljs.core.chunked_seq_QMARK_.call(null, xys__9601)) {
              return cljs.core.chunk_cons.call(null, cljs.core.chunk_first.call(null, xys__9601), cat.call(null, cljs.core.chunk_rest.call(null, xys__9601), zs))
            }else {
              return cljs.core.cons.call(null, cljs.core.first.call(null, xys__9601), cat.call(null, cljs.core.rest.call(null, xys__9601), zs))
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
      return cat__9602.call(null, concat.call(null, x, y), zs)
    };
    var G__9603 = function(x, y, var_args) {
      var zs = null;
      if(goog.isDef(var_args)) {
        zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9603__delegate.call(this, x, y, zs)
    };
    G__9603.cljs$lang$maxFixedArity = 2;
    G__9603.cljs$lang$applyTo = function(arglist__9604) {
      var x = cljs.core.first(arglist__9604);
      var y = cljs.core.first(cljs.core.next(arglist__9604));
      var zs = cljs.core.rest(cljs.core.next(arglist__9604));
      return G__9603__delegate(x, y, zs)
    };
    G__9603.cljs$lang$arity$variadic = G__9603__delegate;
    return G__9603
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
    var G__9605__delegate = function(a, b, c, d, more) {
      return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, more)))))
    };
    var G__9605 = function(a, b, c, d, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__9605__delegate.call(this, a, b, c, d, more)
    };
    G__9605.cljs$lang$maxFixedArity = 4;
    G__9605.cljs$lang$applyTo = function(arglist__9606) {
      var a = cljs.core.first(arglist__9606);
      var b = cljs.core.first(cljs.core.next(arglist__9606));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9606)));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9606))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9606))));
      return G__9605__delegate(a, b, c, d, more)
    };
    G__9605.cljs$lang$arity$variadic = G__9605__delegate;
    return G__9605
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
  var args__9648 = cljs.core.seq.call(null, args);
  if(argc === 0) {
    return f.call(null)
  }else {
    var a__9649 = cljs.core._first.call(null, args__9648);
    var args__9650 = cljs.core._rest.call(null, args__9648);
    if(argc === 1) {
      if(f.cljs$lang$arity$1) {
        return f.cljs$lang$arity$1(a__9649)
      }else {
        return f.call(null, a__9649)
      }
    }else {
      var b__9651 = cljs.core._first.call(null, args__9650);
      var args__9652 = cljs.core._rest.call(null, args__9650);
      if(argc === 2) {
        if(f.cljs$lang$arity$2) {
          return f.cljs$lang$arity$2(a__9649, b__9651)
        }else {
          return f.call(null, a__9649, b__9651)
        }
      }else {
        var c__9653 = cljs.core._first.call(null, args__9652);
        var args__9654 = cljs.core._rest.call(null, args__9652);
        if(argc === 3) {
          if(f.cljs$lang$arity$3) {
            return f.cljs$lang$arity$3(a__9649, b__9651, c__9653)
          }else {
            return f.call(null, a__9649, b__9651, c__9653)
          }
        }else {
          var d__9655 = cljs.core._first.call(null, args__9654);
          var args__9656 = cljs.core._rest.call(null, args__9654);
          if(argc === 4) {
            if(f.cljs$lang$arity$4) {
              return f.cljs$lang$arity$4(a__9649, b__9651, c__9653, d__9655)
            }else {
              return f.call(null, a__9649, b__9651, c__9653, d__9655)
            }
          }else {
            var e__9657 = cljs.core._first.call(null, args__9656);
            var args__9658 = cljs.core._rest.call(null, args__9656);
            if(argc === 5) {
              if(f.cljs$lang$arity$5) {
                return f.cljs$lang$arity$5(a__9649, b__9651, c__9653, d__9655, e__9657)
              }else {
                return f.call(null, a__9649, b__9651, c__9653, d__9655, e__9657)
              }
            }else {
              var f__9659 = cljs.core._first.call(null, args__9658);
              var args__9660 = cljs.core._rest.call(null, args__9658);
              if(argc === 6) {
                if(f__9659.cljs$lang$arity$6) {
                  return f__9659.cljs$lang$arity$6(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659)
                }else {
                  return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659)
                }
              }else {
                var g__9661 = cljs.core._first.call(null, args__9660);
                var args__9662 = cljs.core._rest.call(null, args__9660);
                if(argc === 7) {
                  if(f__9659.cljs$lang$arity$7) {
                    return f__9659.cljs$lang$arity$7(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661)
                  }else {
                    return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661)
                  }
                }else {
                  var h__9663 = cljs.core._first.call(null, args__9662);
                  var args__9664 = cljs.core._rest.call(null, args__9662);
                  if(argc === 8) {
                    if(f__9659.cljs$lang$arity$8) {
                      return f__9659.cljs$lang$arity$8(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663)
                    }else {
                      return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663)
                    }
                  }else {
                    var i__9665 = cljs.core._first.call(null, args__9664);
                    var args__9666 = cljs.core._rest.call(null, args__9664);
                    if(argc === 9) {
                      if(f__9659.cljs$lang$arity$9) {
                        return f__9659.cljs$lang$arity$9(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665)
                      }else {
                        return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665)
                      }
                    }else {
                      var j__9667 = cljs.core._first.call(null, args__9666);
                      var args__9668 = cljs.core._rest.call(null, args__9666);
                      if(argc === 10) {
                        if(f__9659.cljs$lang$arity$10) {
                          return f__9659.cljs$lang$arity$10(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667)
                        }else {
                          return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667)
                        }
                      }else {
                        var k__9669 = cljs.core._first.call(null, args__9668);
                        var args__9670 = cljs.core._rest.call(null, args__9668);
                        if(argc === 11) {
                          if(f__9659.cljs$lang$arity$11) {
                            return f__9659.cljs$lang$arity$11(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669)
                          }else {
                            return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669)
                          }
                        }else {
                          var l__9671 = cljs.core._first.call(null, args__9670);
                          var args__9672 = cljs.core._rest.call(null, args__9670);
                          if(argc === 12) {
                            if(f__9659.cljs$lang$arity$12) {
                              return f__9659.cljs$lang$arity$12(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671)
                            }else {
                              return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671)
                            }
                          }else {
                            var m__9673 = cljs.core._first.call(null, args__9672);
                            var args__9674 = cljs.core._rest.call(null, args__9672);
                            if(argc === 13) {
                              if(f__9659.cljs$lang$arity$13) {
                                return f__9659.cljs$lang$arity$13(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673)
                              }else {
                                return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673)
                              }
                            }else {
                              var n__9675 = cljs.core._first.call(null, args__9674);
                              var args__9676 = cljs.core._rest.call(null, args__9674);
                              if(argc === 14) {
                                if(f__9659.cljs$lang$arity$14) {
                                  return f__9659.cljs$lang$arity$14(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675)
                                }else {
                                  return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675)
                                }
                              }else {
                                var o__9677 = cljs.core._first.call(null, args__9676);
                                var args__9678 = cljs.core._rest.call(null, args__9676);
                                if(argc === 15) {
                                  if(f__9659.cljs$lang$arity$15) {
                                    return f__9659.cljs$lang$arity$15(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675, o__9677)
                                  }else {
                                    return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675, o__9677)
                                  }
                                }else {
                                  var p__9679 = cljs.core._first.call(null, args__9678);
                                  var args__9680 = cljs.core._rest.call(null, args__9678);
                                  if(argc === 16) {
                                    if(f__9659.cljs$lang$arity$16) {
                                      return f__9659.cljs$lang$arity$16(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675, o__9677, p__9679)
                                    }else {
                                      return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675, o__9677, p__9679)
                                    }
                                  }else {
                                    var q__9681 = cljs.core._first.call(null, args__9680);
                                    var args__9682 = cljs.core._rest.call(null, args__9680);
                                    if(argc === 17) {
                                      if(f__9659.cljs$lang$arity$17) {
                                        return f__9659.cljs$lang$arity$17(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675, o__9677, p__9679, q__9681)
                                      }else {
                                        return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675, o__9677, p__9679, q__9681)
                                      }
                                    }else {
                                      var r__9683 = cljs.core._first.call(null, args__9682);
                                      var args__9684 = cljs.core._rest.call(null, args__9682);
                                      if(argc === 18) {
                                        if(f__9659.cljs$lang$arity$18) {
                                          return f__9659.cljs$lang$arity$18(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675, o__9677, p__9679, q__9681, r__9683)
                                        }else {
                                          return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675, o__9677, p__9679, q__9681, r__9683)
                                        }
                                      }else {
                                        var s__9685 = cljs.core._first.call(null, args__9684);
                                        var args__9686 = cljs.core._rest.call(null, args__9684);
                                        if(argc === 19) {
                                          if(f__9659.cljs$lang$arity$19) {
                                            return f__9659.cljs$lang$arity$19(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675, o__9677, p__9679, q__9681, r__9683, s__9685)
                                          }else {
                                            return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675, o__9677, p__9679, q__9681, r__9683, s__9685)
                                          }
                                        }else {
                                          var t__9687 = cljs.core._first.call(null, args__9686);
                                          var args__9688 = cljs.core._rest.call(null, args__9686);
                                          if(argc === 20) {
                                            if(f__9659.cljs$lang$arity$20) {
                                              return f__9659.cljs$lang$arity$20(a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675, o__9677, p__9679, q__9681, r__9683, s__9685, t__9687)
                                            }else {
                                              return f__9659.call(null, a__9649, b__9651, c__9653, d__9655, e__9657, f__9659, g__9661, h__9663, i__9665, j__9667, k__9669, l__9671, m__9673, n__9675, o__9677, p__9679, q__9681, r__9683, s__9685, t__9687)
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
    var fixed_arity__9703 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__9704 = cljs.core.bounded_count.call(null, args, fixed_arity__9703 + 1);
      if(bc__9704 <= fixed_arity__9703) {
        return cljs.core.apply_to.call(null, f, bc__9704, args)
      }else {
        return f.cljs$lang$applyTo(args)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, args))
    }
  };
  var apply__3 = function(f, x, args) {
    var arglist__9705 = cljs.core.list_STAR_.call(null, x, args);
    var fixed_arity__9706 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__9707 = cljs.core.bounded_count.call(null, arglist__9705, fixed_arity__9706 + 1);
      if(bc__9707 <= fixed_arity__9706) {
        return cljs.core.apply_to.call(null, f, bc__9707, arglist__9705)
      }else {
        return f.cljs$lang$applyTo(arglist__9705)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__9705))
    }
  };
  var apply__4 = function(f, x, y, args) {
    var arglist__9708 = cljs.core.list_STAR_.call(null, x, y, args);
    var fixed_arity__9709 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__9710 = cljs.core.bounded_count.call(null, arglist__9708, fixed_arity__9709 + 1);
      if(bc__9710 <= fixed_arity__9709) {
        return cljs.core.apply_to.call(null, f, bc__9710, arglist__9708)
      }else {
        return f.cljs$lang$applyTo(arglist__9708)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__9708))
    }
  };
  var apply__5 = function(f, x, y, z, args) {
    var arglist__9711 = cljs.core.list_STAR_.call(null, x, y, z, args);
    var fixed_arity__9712 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__9713 = cljs.core.bounded_count.call(null, arglist__9711, fixed_arity__9712 + 1);
      if(bc__9713 <= fixed_arity__9712) {
        return cljs.core.apply_to.call(null, f, bc__9713, arglist__9711)
      }else {
        return f.cljs$lang$applyTo(arglist__9711)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__9711))
    }
  };
  var apply__6 = function() {
    var G__9717__delegate = function(f, a, b, c, d, args) {
      var arglist__9714 = cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, args)))));
      var fixed_arity__9715 = f.cljs$lang$maxFixedArity;
      if(cljs.core.truth_(f.cljs$lang$applyTo)) {
        var bc__9716 = cljs.core.bounded_count.call(null, arglist__9714, fixed_arity__9715 + 1);
        if(bc__9716 <= fixed_arity__9715) {
          return cljs.core.apply_to.call(null, f, bc__9716, arglist__9714)
        }else {
          return f.cljs$lang$applyTo(arglist__9714)
        }
      }else {
        return f.apply(f, cljs.core.to_array.call(null, arglist__9714))
      }
    };
    var G__9717 = function(f, a, b, c, d, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__9717__delegate.call(this, f, a, b, c, d, args)
    };
    G__9717.cljs$lang$maxFixedArity = 5;
    G__9717.cljs$lang$applyTo = function(arglist__9718) {
      var f = cljs.core.first(arglist__9718);
      var a = cljs.core.first(cljs.core.next(arglist__9718));
      var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9718)));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9718))));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9718)))));
      var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9718)))));
      return G__9717__delegate(f, a, b, c, d, args)
    };
    G__9717.cljs$lang$arity$variadic = G__9717__delegate;
    return G__9717
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
  vary_meta.cljs$lang$applyTo = function(arglist__9719) {
    var obj = cljs.core.first(arglist__9719);
    var f = cljs.core.first(cljs.core.next(arglist__9719));
    var args = cljs.core.rest(cljs.core.next(arglist__9719));
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
    var G__9720__delegate = function(x, y, more) {
      return cljs.core.not.call(null, cljs.core.apply.call(null, cljs.core._EQ_, x, y, more))
    };
    var G__9720 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9720__delegate.call(this, x, y, more)
    };
    G__9720.cljs$lang$maxFixedArity = 2;
    G__9720.cljs$lang$applyTo = function(arglist__9721) {
      var x = cljs.core.first(arglist__9721);
      var y = cljs.core.first(cljs.core.next(arglist__9721));
      var more = cljs.core.rest(cljs.core.next(arglist__9721));
      return G__9720__delegate(x, y, more)
    };
    G__9720.cljs$lang$arity$variadic = G__9720__delegate;
    return G__9720
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
        var G__9722 = pred;
        var G__9723 = cljs.core.next.call(null, coll);
        pred = G__9722;
        coll = G__9723;
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
      var or__3824__auto____9725 = pred.call(null, cljs.core.first.call(null, coll));
      if(cljs.core.truth_(or__3824__auto____9725)) {
        return or__3824__auto____9725
      }else {
        var G__9726 = pred;
        var G__9727 = cljs.core.next.call(null, coll);
        pred = G__9726;
        coll = G__9727;
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
    var G__9728 = null;
    var G__9728__0 = function() {
      return cljs.core.not.call(null, f.call(null))
    };
    var G__9728__1 = function(x) {
      return cljs.core.not.call(null, f.call(null, x))
    };
    var G__9728__2 = function(x, y) {
      return cljs.core.not.call(null, f.call(null, x, y))
    };
    var G__9728__3 = function() {
      var G__9729__delegate = function(x, y, zs) {
        return cljs.core.not.call(null, cljs.core.apply.call(null, f, x, y, zs))
      };
      var G__9729 = function(x, y, var_args) {
        var zs = null;
        if(goog.isDef(var_args)) {
          zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
        }
        return G__9729__delegate.call(this, x, y, zs)
      };
      G__9729.cljs$lang$maxFixedArity = 2;
      G__9729.cljs$lang$applyTo = function(arglist__9730) {
        var x = cljs.core.first(arglist__9730);
        var y = cljs.core.first(cljs.core.next(arglist__9730));
        var zs = cljs.core.rest(cljs.core.next(arglist__9730));
        return G__9729__delegate(x, y, zs)
      };
      G__9729.cljs$lang$arity$variadic = G__9729__delegate;
      return G__9729
    }();
    G__9728 = function(x, y, var_args) {
      var zs = var_args;
      switch(arguments.length) {
        case 0:
          return G__9728__0.call(this);
        case 1:
          return G__9728__1.call(this, x);
        case 2:
          return G__9728__2.call(this, x, y);
        default:
          return G__9728__3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
      }
      throw"Invalid arity: " + arguments.length;
    };
    G__9728.cljs$lang$maxFixedArity = 2;
    G__9728.cljs$lang$applyTo = G__9728__3.cljs$lang$applyTo;
    return G__9728
  }()
};
cljs.core.constantly = function constantly(x) {
  return function() {
    var G__9731__delegate = function(args) {
      return x
    };
    var G__9731 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__9731__delegate.call(this, args)
    };
    G__9731.cljs$lang$maxFixedArity = 0;
    G__9731.cljs$lang$applyTo = function(arglist__9732) {
      var args = cljs.core.seq(arglist__9732);
      return G__9731__delegate(args)
    };
    G__9731.cljs$lang$arity$variadic = G__9731__delegate;
    return G__9731
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
      var G__9739 = null;
      var G__9739__0 = function() {
        return f.call(null, g.call(null))
      };
      var G__9739__1 = function(x) {
        return f.call(null, g.call(null, x))
      };
      var G__9739__2 = function(x, y) {
        return f.call(null, g.call(null, x, y))
      };
      var G__9739__3 = function(x, y, z) {
        return f.call(null, g.call(null, x, y, z))
      };
      var G__9739__4 = function() {
        var G__9740__delegate = function(x, y, z, args) {
          return f.call(null, cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__9740 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9740__delegate.call(this, x, y, z, args)
        };
        G__9740.cljs$lang$maxFixedArity = 3;
        G__9740.cljs$lang$applyTo = function(arglist__9741) {
          var x = cljs.core.first(arglist__9741);
          var y = cljs.core.first(cljs.core.next(arglist__9741));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9741)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9741)));
          return G__9740__delegate(x, y, z, args)
        };
        G__9740.cljs$lang$arity$variadic = G__9740__delegate;
        return G__9740
      }();
      G__9739 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__9739__0.call(this);
          case 1:
            return G__9739__1.call(this, x);
          case 2:
            return G__9739__2.call(this, x, y);
          case 3:
            return G__9739__3.call(this, x, y, z);
          default:
            return G__9739__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9739.cljs$lang$maxFixedArity = 3;
      G__9739.cljs$lang$applyTo = G__9739__4.cljs$lang$applyTo;
      return G__9739
    }()
  };
  var comp__3 = function(f, g, h) {
    return function() {
      var G__9742 = null;
      var G__9742__0 = function() {
        return f.call(null, g.call(null, h.call(null)))
      };
      var G__9742__1 = function(x) {
        return f.call(null, g.call(null, h.call(null, x)))
      };
      var G__9742__2 = function(x, y) {
        return f.call(null, g.call(null, h.call(null, x, y)))
      };
      var G__9742__3 = function(x, y, z) {
        return f.call(null, g.call(null, h.call(null, x, y, z)))
      };
      var G__9742__4 = function() {
        var G__9743__delegate = function(x, y, z, args) {
          return f.call(null, g.call(null, cljs.core.apply.call(null, h, x, y, z, args)))
        };
        var G__9743 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9743__delegate.call(this, x, y, z, args)
        };
        G__9743.cljs$lang$maxFixedArity = 3;
        G__9743.cljs$lang$applyTo = function(arglist__9744) {
          var x = cljs.core.first(arglist__9744);
          var y = cljs.core.first(cljs.core.next(arglist__9744));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9744)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9744)));
          return G__9743__delegate(x, y, z, args)
        };
        G__9743.cljs$lang$arity$variadic = G__9743__delegate;
        return G__9743
      }();
      G__9742 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__9742__0.call(this);
          case 1:
            return G__9742__1.call(this, x);
          case 2:
            return G__9742__2.call(this, x, y);
          case 3:
            return G__9742__3.call(this, x, y, z);
          default:
            return G__9742__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9742.cljs$lang$maxFixedArity = 3;
      G__9742.cljs$lang$applyTo = G__9742__4.cljs$lang$applyTo;
      return G__9742
    }()
  };
  var comp__4 = function() {
    var G__9745__delegate = function(f1, f2, f3, fs) {
      var fs__9736 = cljs.core.reverse.call(null, cljs.core.list_STAR_.call(null, f1, f2, f3, fs));
      return function() {
        var G__9746__delegate = function(args) {
          var ret__9737 = cljs.core.apply.call(null, cljs.core.first.call(null, fs__9736), args);
          var fs__9738 = cljs.core.next.call(null, fs__9736);
          while(true) {
            if(fs__9738) {
              var G__9747 = cljs.core.first.call(null, fs__9738).call(null, ret__9737);
              var G__9748 = cljs.core.next.call(null, fs__9738);
              ret__9737 = G__9747;
              fs__9738 = G__9748;
              continue
            }else {
              return ret__9737
            }
            break
          }
        };
        var G__9746 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__9746__delegate.call(this, args)
        };
        G__9746.cljs$lang$maxFixedArity = 0;
        G__9746.cljs$lang$applyTo = function(arglist__9749) {
          var args = cljs.core.seq(arglist__9749);
          return G__9746__delegate(args)
        };
        G__9746.cljs$lang$arity$variadic = G__9746__delegate;
        return G__9746
      }()
    };
    var G__9745 = function(f1, f2, f3, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__9745__delegate.call(this, f1, f2, f3, fs)
    };
    G__9745.cljs$lang$maxFixedArity = 3;
    G__9745.cljs$lang$applyTo = function(arglist__9750) {
      var f1 = cljs.core.first(arglist__9750);
      var f2 = cljs.core.first(cljs.core.next(arglist__9750));
      var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9750)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9750)));
      return G__9745__delegate(f1, f2, f3, fs)
    };
    G__9745.cljs$lang$arity$variadic = G__9745__delegate;
    return G__9745
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
      var G__9751__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, args)
      };
      var G__9751 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__9751__delegate.call(this, args)
      };
      G__9751.cljs$lang$maxFixedArity = 0;
      G__9751.cljs$lang$applyTo = function(arglist__9752) {
        var args = cljs.core.seq(arglist__9752);
        return G__9751__delegate(args)
      };
      G__9751.cljs$lang$arity$variadic = G__9751__delegate;
      return G__9751
    }()
  };
  var partial__3 = function(f, arg1, arg2) {
    return function() {
      var G__9753__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, args)
      };
      var G__9753 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__9753__delegate.call(this, args)
      };
      G__9753.cljs$lang$maxFixedArity = 0;
      G__9753.cljs$lang$applyTo = function(arglist__9754) {
        var args = cljs.core.seq(arglist__9754);
        return G__9753__delegate(args)
      };
      G__9753.cljs$lang$arity$variadic = G__9753__delegate;
      return G__9753
    }()
  };
  var partial__4 = function(f, arg1, arg2, arg3) {
    return function() {
      var G__9755__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, arg3, args)
      };
      var G__9755 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__9755__delegate.call(this, args)
      };
      G__9755.cljs$lang$maxFixedArity = 0;
      G__9755.cljs$lang$applyTo = function(arglist__9756) {
        var args = cljs.core.seq(arglist__9756);
        return G__9755__delegate(args)
      };
      G__9755.cljs$lang$arity$variadic = G__9755__delegate;
      return G__9755
    }()
  };
  var partial__5 = function() {
    var G__9757__delegate = function(f, arg1, arg2, arg3, more) {
      return function() {
        var G__9758__delegate = function(args) {
          return cljs.core.apply.call(null, f, arg1, arg2, arg3, cljs.core.concat.call(null, more, args))
        };
        var G__9758 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__9758__delegate.call(this, args)
        };
        G__9758.cljs$lang$maxFixedArity = 0;
        G__9758.cljs$lang$applyTo = function(arglist__9759) {
          var args = cljs.core.seq(arglist__9759);
          return G__9758__delegate(args)
        };
        G__9758.cljs$lang$arity$variadic = G__9758__delegate;
        return G__9758
      }()
    };
    var G__9757 = function(f, arg1, arg2, arg3, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__9757__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    G__9757.cljs$lang$maxFixedArity = 4;
    G__9757.cljs$lang$applyTo = function(arglist__9760) {
      var f = cljs.core.first(arglist__9760);
      var arg1 = cljs.core.first(cljs.core.next(arglist__9760));
      var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9760)));
      var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9760))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__9760))));
      return G__9757__delegate(f, arg1, arg2, arg3, more)
    };
    G__9757.cljs$lang$arity$variadic = G__9757__delegate;
    return G__9757
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
      var G__9761 = null;
      var G__9761__1 = function(a) {
        return f.call(null, a == null ? x : a)
      };
      var G__9761__2 = function(a, b) {
        return f.call(null, a == null ? x : a, b)
      };
      var G__9761__3 = function(a, b, c) {
        return f.call(null, a == null ? x : a, b, c)
      };
      var G__9761__4 = function() {
        var G__9762__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, a == null ? x : a, b, c, ds)
        };
        var G__9762 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9762__delegate.call(this, a, b, c, ds)
        };
        G__9762.cljs$lang$maxFixedArity = 3;
        G__9762.cljs$lang$applyTo = function(arglist__9763) {
          var a = cljs.core.first(arglist__9763);
          var b = cljs.core.first(cljs.core.next(arglist__9763));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9763)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9763)));
          return G__9762__delegate(a, b, c, ds)
        };
        G__9762.cljs$lang$arity$variadic = G__9762__delegate;
        return G__9762
      }();
      G__9761 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 1:
            return G__9761__1.call(this, a);
          case 2:
            return G__9761__2.call(this, a, b);
          case 3:
            return G__9761__3.call(this, a, b, c);
          default:
            return G__9761__4.cljs$lang$arity$variadic(a, b, c, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9761.cljs$lang$maxFixedArity = 3;
      G__9761.cljs$lang$applyTo = G__9761__4.cljs$lang$applyTo;
      return G__9761
    }()
  };
  var fnil__3 = function(f, x, y) {
    return function() {
      var G__9764 = null;
      var G__9764__2 = function(a, b) {
        return f.call(null, a == null ? x : a, b == null ? y : b)
      };
      var G__9764__3 = function(a, b, c) {
        return f.call(null, a == null ? x : a, b == null ? y : b, c)
      };
      var G__9764__4 = function() {
        var G__9765__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, a == null ? x : a, b == null ? y : b, c, ds)
        };
        var G__9765 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9765__delegate.call(this, a, b, c, ds)
        };
        G__9765.cljs$lang$maxFixedArity = 3;
        G__9765.cljs$lang$applyTo = function(arglist__9766) {
          var a = cljs.core.first(arglist__9766);
          var b = cljs.core.first(cljs.core.next(arglist__9766));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9766)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9766)));
          return G__9765__delegate(a, b, c, ds)
        };
        G__9765.cljs$lang$arity$variadic = G__9765__delegate;
        return G__9765
      }();
      G__9764 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__9764__2.call(this, a, b);
          case 3:
            return G__9764__3.call(this, a, b, c);
          default:
            return G__9764__4.cljs$lang$arity$variadic(a, b, c, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9764.cljs$lang$maxFixedArity = 3;
      G__9764.cljs$lang$applyTo = G__9764__4.cljs$lang$applyTo;
      return G__9764
    }()
  };
  var fnil__4 = function(f, x, y, z) {
    return function() {
      var G__9767 = null;
      var G__9767__2 = function(a, b) {
        return f.call(null, a == null ? x : a, b == null ? y : b)
      };
      var G__9767__3 = function(a, b, c) {
        return f.call(null, a == null ? x : a, b == null ? y : b, c == null ? z : c)
      };
      var G__9767__4 = function() {
        var G__9768__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, a == null ? x : a, b == null ? y : b, c == null ? z : c, ds)
        };
        var G__9768 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__9768__delegate.call(this, a, b, c, ds)
        };
        G__9768.cljs$lang$maxFixedArity = 3;
        G__9768.cljs$lang$applyTo = function(arglist__9769) {
          var a = cljs.core.first(arglist__9769);
          var b = cljs.core.first(cljs.core.next(arglist__9769));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9769)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9769)));
          return G__9768__delegate(a, b, c, ds)
        };
        G__9768.cljs$lang$arity$variadic = G__9768__delegate;
        return G__9768
      }();
      G__9767 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__9767__2.call(this, a, b);
          case 3:
            return G__9767__3.call(this, a, b, c);
          default:
            return G__9767__4.cljs$lang$arity$variadic(a, b, c, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__9767.cljs$lang$maxFixedArity = 3;
      G__9767.cljs$lang$applyTo = G__9767__4.cljs$lang$applyTo;
      return G__9767
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
  var mapi__9785 = function mapi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____9793 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____9793) {
        var s__9794 = temp__3974__auto____9793;
        if(cljs.core.chunked_seq_QMARK_.call(null, s__9794)) {
          var c__9795 = cljs.core.chunk_first.call(null, s__9794);
          var size__9796 = cljs.core.count.call(null, c__9795);
          var b__9797 = cljs.core.chunk_buffer.call(null, size__9796);
          var n__2527__auto____9798 = size__9796;
          var i__9799 = 0;
          while(true) {
            if(i__9799 < n__2527__auto____9798) {
              cljs.core.chunk_append.call(null, b__9797, f.call(null, idx + i__9799, cljs.core._nth.call(null, c__9795, i__9799)));
              var G__9800 = i__9799 + 1;
              i__9799 = G__9800;
              continue
            }else {
            }
            break
          }
          return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__9797), mapi.call(null, idx + size__9796, cljs.core.chunk_rest.call(null, s__9794)))
        }else {
          return cljs.core.cons.call(null, f.call(null, idx, cljs.core.first.call(null, s__9794)), mapi.call(null, idx + 1, cljs.core.rest.call(null, s__9794)))
        }
      }else {
        return null
      }
    }, null)
  };
  return mapi__9785.call(null, 0, coll)
};
cljs.core.keep = function keep(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____9810 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____9810) {
      var s__9811 = temp__3974__auto____9810;
      if(cljs.core.chunked_seq_QMARK_.call(null, s__9811)) {
        var c__9812 = cljs.core.chunk_first.call(null, s__9811);
        var size__9813 = cljs.core.count.call(null, c__9812);
        var b__9814 = cljs.core.chunk_buffer.call(null, size__9813);
        var n__2527__auto____9815 = size__9813;
        var i__9816 = 0;
        while(true) {
          if(i__9816 < n__2527__auto____9815) {
            var x__9817 = f.call(null, cljs.core._nth.call(null, c__9812, i__9816));
            if(x__9817 == null) {
            }else {
              cljs.core.chunk_append.call(null, b__9814, x__9817)
            }
            var G__9819 = i__9816 + 1;
            i__9816 = G__9819;
            continue
          }else {
          }
          break
        }
        return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__9814), keep.call(null, f, cljs.core.chunk_rest.call(null, s__9811)))
      }else {
        var x__9818 = f.call(null, cljs.core.first.call(null, s__9811));
        if(x__9818 == null) {
          return keep.call(null, f, cljs.core.rest.call(null, s__9811))
        }else {
          return cljs.core.cons.call(null, x__9818, keep.call(null, f, cljs.core.rest.call(null, s__9811)))
        }
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.keep_indexed = function keep_indexed(f, coll) {
  var keepi__9845 = function keepi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____9855 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____9855) {
        var s__9856 = temp__3974__auto____9855;
        if(cljs.core.chunked_seq_QMARK_.call(null, s__9856)) {
          var c__9857 = cljs.core.chunk_first.call(null, s__9856);
          var size__9858 = cljs.core.count.call(null, c__9857);
          var b__9859 = cljs.core.chunk_buffer.call(null, size__9858);
          var n__2527__auto____9860 = size__9858;
          var i__9861 = 0;
          while(true) {
            if(i__9861 < n__2527__auto____9860) {
              var x__9862 = f.call(null, idx + i__9861, cljs.core._nth.call(null, c__9857, i__9861));
              if(x__9862 == null) {
              }else {
                cljs.core.chunk_append.call(null, b__9859, x__9862)
              }
              var G__9864 = i__9861 + 1;
              i__9861 = G__9864;
              continue
            }else {
            }
            break
          }
          return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__9859), keepi.call(null, idx + size__9858, cljs.core.chunk_rest.call(null, s__9856)))
        }else {
          var x__9863 = f.call(null, idx, cljs.core.first.call(null, s__9856));
          if(x__9863 == null) {
            return keepi.call(null, idx + 1, cljs.core.rest.call(null, s__9856))
          }else {
            return cljs.core.cons.call(null, x__9863, keepi.call(null, idx + 1, cljs.core.rest.call(null, s__9856)))
          }
        }
      }else {
        return null
      }
    }, null)
  };
  return keepi__9845.call(null, 0, coll)
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
          var and__3822__auto____9950 = p.call(null, x);
          if(cljs.core.truth_(and__3822__auto____9950)) {
            return p.call(null, y)
          }else {
            return and__3822__auto____9950
          }
        }())
      };
      var ep1__3 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____9951 = p.call(null, x);
          if(cljs.core.truth_(and__3822__auto____9951)) {
            var and__3822__auto____9952 = p.call(null, y);
            if(cljs.core.truth_(and__3822__auto____9952)) {
              return p.call(null, z)
            }else {
              return and__3822__auto____9952
            }
          }else {
            return and__3822__auto____9951
          }
        }())
      };
      var ep1__4 = function() {
        var G__10021__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3822__auto____9953 = ep1.call(null, x, y, z);
            if(cljs.core.truth_(and__3822__auto____9953)) {
              return cljs.core.every_QMARK_.call(null, p, args)
            }else {
              return and__3822__auto____9953
            }
          }())
        };
        var G__10021 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10021__delegate.call(this, x, y, z, args)
        };
        G__10021.cljs$lang$maxFixedArity = 3;
        G__10021.cljs$lang$applyTo = function(arglist__10022) {
          var x = cljs.core.first(arglist__10022);
          var y = cljs.core.first(cljs.core.next(arglist__10022));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10022)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10022)));
          return G__10021__delegate(x, y, z, args)
        };
        G__10021.cljs$lang$arity$variadic = G__10021__delegate;
        return G__10021
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
          var and__3822__auto____9965 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____9965)) {
            return p2.call(null, x)
          }else {
            return and__3822__auto____9965
          }
        }())
      };
      var ep2__2 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____9966 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____9966)) {
            var and__3822__auto____9967 = p1.call(null, y);
            if(cljs.core.truth_(and__3822__auto____9967)) {
              var and__3822__auto____9968 = p2.call(null, x);
              if(cljs.core.truth_(and__3822__auto____9968)) {
                return p2.call(null, y)
              }else {
                return and__3822__auto____9968
              }
            }else {
              return and__3822__auto____9967
            }
          }else {
            return and__3822__auto____9966
          }
        }())
      };
      var ep2__3 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____9969 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____9969)) {
            var and__3822__auto____9970 = p1.call(null, y);
            if(cljs.core.truth_(and__3822__auto____9970)) {
              var and__3822__auto____9971 = p1.call(null, z);
              if(cljs.core.truth_(and__3822__auto____9971)) {
                var and__3822__auto____9972 = p2.call(null, x);
                if(cljs.core.truth_(and__3822__auto____9972)) {
                  var and__3822__auto____9973 = p2.call(null, y);
                  if(cljs.core.truth_(and__3822__auto____9973)) {
                    return p2.call(null, z)
                  }else {
                    return and__3822__auto____9973
                  }
                }else {
                  return and__3822__auto____9972
                }
              }else {
                return and__3822__auto____9971
              }
            }else {
              return and__3822__auto____9970
            }
          }else {
            return and__3822__auto____9969
          }
        }())
      };
      var ep2__4 = function() {
        var G__10023__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3822__auto____9974 = ep2.call(null, x, y, z);
            if(cljs.core.truth_(and__3822__auto____9974)) {
              return cljs.core.every_QMARK_.call(null, function(p1__9820_SHARP_) {
                var and__3822__auto____9975 = p1.call(null, p1__9820_SHARP_);
                if(cljs.core.truth_(and__3822__auto____9975)) {
                  return p2.call(null, p1__9820_SHARP_)
                }else {
                  return and__3822__auto____9975
                }
              }, args)
            }else {
              return and__3822__auto____9974
            }
          }())
        };
        var G__10023 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10023__delegate.call(this, x, y, z, args)
        };
        G__10023.cljs$lang$maxFixedArity = 3;
        G__10023.cljs$lang$applyTo = function(arglist__10024) {
          var x = cljs.core.first(arglist__10024);
          var y = cljs.core.first(cljs.core.next(arglist__10024));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10024)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10024)));
          return G__10023__delegate(x, y, z, args)
        };
        G__10023.cljs$lang$arity$variadic = G__10023__delegate;
        return G__10023
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
          var and__3822__auto____9994 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____9994)) {
            var and__3822__auto____9995 = p2.call(null, x);
            if(cljs.core.truth_(and__3822__auto____9995)) {
              return p3.call(null, x)
            }else {
              return and__3822__auto____9995
            }
          }else {
            return and__3822__auto____9994
          }
        }())
      };
      var ep3__2 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____9996 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____9996)) {
            var and__3822__auto____9997 = p2.call(null, x);
            if(cljs.core.truth_(and__3822__auto____9997)) {
              var and__3822__auto____9998 = p3.call(null, x);
              if(cljs.core.truth_(and__3822__auto____9998)) {
                var and__3822__auto____9999 = p1.call(null, y);
                if(cljs.core.truth_(and__3822__auto____9999)) {
                  var and__3822__auto____10000 = p2.call(null, y);
                  if(cljs.core.truth_(and__3822__auto____10000)) {
                    return p3.call(null, y)
                  }else {
                    return and__3822__auto____10000
                  }
                }else {
                  return and__3822__auto____9999
                }
              }else {
                return and__3822__auto____9998
              }
            }else {
              return and__3822__auto____9997
            }
          }else {
            return and__3822__auto____9996
          }
        }())
      };
      var ep3__3 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____10001 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____10001)) {
            var and__3822__auto____10002 = p2.call(null, x);
            if(cljs.core.truth_(and__3822__auto____10002)) {
              var and__3822__auto____10003 = p3.call(null, x);
              if(cljs.core.truth_(and__3822__auto____10003)) {
                var and__3822__auto____10004 = p1.call(null, y);
                if(cljs.core.truth_(and__3822__auto____10004)) {
                  var and__3822__auto____10005 = p2.call(null, y);
                  if(cljs.core.truth_(and__3822__auto____10005)) {
                    var and__3822__auto____10006 = p3.call(null, y);
                    if(cljs.core.truth_(and__3822__auto____10006)) {
                      var and__3822__auto____10007 = p1.call(null, z);
                      if(cljs.core.truth_(and__3822__auto____10007)) {
                        var and__3822__auto____10008 = p2.call(null, z);
                        if(cljs.core.truth_(and__3822__auto____10008)) {
                          return p3.call(null, z)
                        }else {
                          return and__3822__auto____10008
                        }
                      }else {
                        return and__3822__auto____10007
                      }
                    }else {
                      return and__3822__auto____10006
                    }
                  }else {
                    return and__3822__auto____10005
                  }
                }else {
                  return and__3822__auto____10004
                }
              }else {
                return and__3822__auto____10003
              }
            }else {
              return and__3822__auto____10002
            }
          }else {
            return and__3822__auto____10001
          }
        }())
      };
      var ep3__4 = function() {
        var G__10025__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3822__auto____10009 = ep3.call(null, x, y, z);
            if(cljs.core.truth_(and__3822__auto____10009)) {
              return cljs.core.every_QMARK_.call(null, function(p1__9821_SHARP_) {
                var and__3822__auto____10010 = p1.call(null, p1__9821_SHARP_);
                if(cljs.core.truth_(and__3822__auto____10010)) {
                  var and__3822__auto____10011 = p2.call(null, p1__9821_SHARP_);
                  if(cljs.core.truth_(and__3822__auto____10011)) {
                    return p3.call(null, p1__9821_SHARP_)
                  }else {
                    return and__3822__auto____10011
                  }
                }else {
                  return and__3822__auto____10010
                }
              }, args)
            }else {
              return and__3822__auto____10009
            }
          }())
        };
        var G__10025 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10025__delegate.call(this, x, y, z, args)
        };
        G__10025.cljs$lang$maxFixedArity = 3;
        G__10025.cljs$lang$applyTo = function(arglist__10026) {
          var x = cljs.core.first(arglist__10026);
          var y = cljs.core.first(cljs.core.next(arglist__10026));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10026)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10026)));
          return G__10025__delegate(x, y, z, args)
        };
        G__10025.cljs$lang$arity$variadic = G__10025__delegate;
        return G__10025
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
    var G__10027__delegate = function(p1, p2, p3, ps) {
      var ps__10012 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var epn = null;
        var epn__0 = function() {
          return true
        };
        var epn__1 = function(x) {
          return cljs.core.every_QMARK_.call(null, function(p1__9822_SHARP_) {
            return p1__9822_SHARP_.call(null, x)
          }, ps__10012)
        };
        var epn__2 = function(x, y) {
          return cljs.core.every_QMARK_.call(null, function(p1__9823_SHARP_) {
            var and__3822__auto____10017 = p1__9823_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3822__auto____10017)) {
              return p1__9823_SHARP_.call(null, y)
            }else {
              return and__3822__auto____10017
            }
          }, ps__10012)
        };
        var epn__3 = function(x, y, z) {
          return cljs.core.every_QMARK_.call(null, function(p1__9824_SHARP_) {
            var and__3822__auto____10018 = p1__9824_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3822__auto____10018)) {
              var and__3822__auto____10019 = p1__9824_SHARP_.call(null, y);
              if(cljs.core.truth_(and__3822__auto____10019)) {
                return p1__9824_SHARP_.call(null, z)
              }else {
                return and__3822__auto____10019
              }
            }else {
              return and__3822__auto____10018
            }
          }, ps__10012)
        };
        var epn__4 = function() {
          var G__10028__delegate = function(x, y, z, args) {
            return cljs.core.boolean$.call(null, function() {
              var and__3822__auto____10020 = epn.call(null, x, y, z);
              if(cljs.core.truth_(and__3822__auto____10020)) {
                return cljs.core.every_QMARK_.call(null, function(p1__9825_SHARP_) {
                  return cljs.core.every_QMARK_.call(null, p1__9825_SHARP_, args)
                }, ps__10012)
              }else {
                return and__3822__auto____10020
              }
            }())
          };
          var G__10028 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__10028__delegate.call(this, x, y, z, args)
          };
          G__10028.cljs$lang$maxFixedArity = 3;
          G__10028.cljs$lang$applyTo = function(arglist__10029) {
            var x = cljs.core.first(arglist__10029);
            var y = cljs.core.first(cljs.core.next(arglist__10029));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10029)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10029)));
            return G__10028__delegate(x, y, z, args)
          };
          G__10028.cljs$lang$arity$variadic = G__10028__delegate;
          return G__10028
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
    var G__10027 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__10027__delegate.call(this, p1, p2, p3, ps)
    };
    G__10027.cljs$lang$maxFixedArity = 3;
    G__10027.cljs$lang$applyTo = function(arglist__10030) {
      var p1 = cljs.core.first(arglist__10030);
      var p2 = cljs.core.first(cljs.core.next(arglist__10030));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10030)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10030)));
      return G__10027__delegate(p1, p2, p3, ps)
    };
    G__10027.cljs$lang$arity$variadic = G__10027__delegate;
    return G__10027
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
        var or__3824__auto____10111 = p.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10111)) {
          return or__3824__auto____10111
        }else {
          return p.call(null, y)
        }
      };
      var sp1__3 = function(x, y, z) {
        var or__3824__auto____10112 = p.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10112)) {
          return or__3824__auto____10112
        }else {
          var or__3824__auto____10113 = p.call(null, y);
          if(cljs.core.truth_(or__3824__auto____10113)) {
            return or__3824__auto____10113
          }else {
            return p.call(null, z)
          }
        }
      };
      var sp1__4 = function() {
        var G__10182__delegate = function(x, y, z, args) {
          var or__3824__auto____10114 = sp1.call(null, x, y, z);
          if(cljs.core.truth_(or__3824__auto____10114)) {
            return or__3824__auto____10114
          }else {
            return cljs.core.some.call(null, p, args)
          }
        };
        var G__10182 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10182__delegate.call(this, x, y, z, args)
        };
        G__10182.cljs$lang$maxFixedArity = 3;
        G__10182.cljs$lang$applyTo = function(arglist__10183) {
          var x = cljs.core.first(arglist__10183);
          var y = cljs.core.first(cljs.core.next(arglist__10183));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10183)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10183)));
          return G__10182__delegate(x, y, z, args)
        };
        G__10182.cljs$lang$arity$variadic = G__10182__delegate;
        return G__10182
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
        var or__3824__auto____10126 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10126)) {
          return or__3824__auto____10126
        }else {
          return p2.call(null, x)
        }
      };
      var sp2__2 = function(x, y) {
        var or__3824__auto____10127 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10127)) {
          return or__3824__auto____10127
        }else {
          var or__3824__auto____10128 = p1.call(null, y);
          if(cljs.core.truth_(or__3824__auto____10128)) {
            return or__3824__auto____10128
          }else {
            var or__3824__auto____10129 = p2.call(null, x);
            if(cljs.core.truth_(or__3824__auto____10129)) {
              return or__3824__auto____10129
            }else {
              return p2.call(null, y)
            }
          }
        }
      };
      var sp2__3 = function(x, y, z) {
        var or__3824__auto____10130 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10130)) {
          return or__3824__auto____10130
        }else {
          var or__3824__auto____10131 = p1.call(null, y);
          if(cljs.core.truth_(or__3824__auto____10131)) {
            return or__3824__auto____10131
          }else {
            var or__3824__auto____10132 = p1.call(null, z);
            if(cljs.core.truth_(or__3824__auto____10132)) {
              return or__3824__auto____10132
            }else {
              var or__3824__auto____10133 = p2.call(null, x);
              if(cljs.core.truth_(or__3824__auto____10133)) {
                return or__3824__auto____10133
              }else {
                var or__3824__auto____10134 = p2.call(null, y);
                if(cljs.core.truth_(or__3824__auto____10134)) {
                  return or__3824__auto____10134
                }else {
                  return p2.call(null, z)
                }
              }
            }
          }
        }
      };
      var sp2__4 = function() {
        var G__10184__delegate = function(x, y, z, args) {
          var or__3824__auto____10135 = sp2.call(null, x, y, z);
          if(cljs.core.truth_(or__3824__auto____10135)) {
            return or__3824__auto____10135
          }else {
            return cljs.core.some.call(null, function(p1__9865_SHARP_) {
              var or__3824__auto____10136 = p1.call(null, p1__9865_SHARP_);
              if(cljs.core.truth_(or__3824__auto____10136)) {
                return or__3824__auto____10136
              }else {
                return p2.call(null, p1__9865_SHARP_)
              }
            }, args)
          }
        };
        var G__10184 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10184__delegate.call(this, x, y, z, args)
        };
        G__10184.cljs$lang$maxFixedArity = 3;
        G__10184.cljs$lang$applyTo = function(arglist__10185) {
          var x = cljs.core.first(arglist__10185);
          var y = cljs.core.first(cljs.core.next(arglist__10185));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10185)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10185)));
          return G__10184__delegate(x, y, z, args)
        };
        G__10184.cljs$lang$arity$variadic = G__10184__delegate;
        return G__10184
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
        var or__3824__auto____10155 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10155)) {
          return or__3824__auto____10155
        }else {
          var or__3824__auto____10156 = p2.call(null, x);
          if(cljs.core.truth_(or__3824__auto____10156)) {
            return or__3824__auto____10156
          }else {
            return p3.call(null, x)
          }
        }
      };
      var sp3__2 = function(x, y) {
        var or__3824__auto____10157 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10157)) {
          return or__3824__auto____10157
        }else {
          var or__3824__auto____10158 = p2.call(null, x);
          if(cljs.core.truth_(or__3824__auto____10158)) {
            return or__3824__auto____10158
          }else {
            var or__3824__auto____10159 = p3.call(null, x);
            if(cljs.core.truth_(or__3824__auto____10159)) {
              return or__3824__auto____10159
            }else {
              var or__3824__auto____10160 = p1.call(null, y);
              if(cljs.core.truth_(or__3824__auto____10160)) {
                return or__3824__auto____10160
              }else {
                var or__3824__auto____10161 = p2.call(null, y);
                if(cljs.core.truth_(or__3824__auto____10161)) {
                  return or__3824__auto____10161
                }else {
                  return p3.call(null, y)
                }
              }
            }
          }
        }
      };
      var sp3__3 = function(x, y, z) {
        var or__3824__auto____10162 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____10162)) {
          return or__3824__auto____10162
        }else {
          var or__3824__auto____10163 = p2.call(null, x);
          if(cljs.core.truth_(or__3824__auto____10163)) {
            return or__3824__auto____10163
          }else {
            var or__3824__auto____10164 = p3.call(null, x);
            if(cljs.core.truth_(or__3824__auto____10164)) {
              return or__3824__auto____10164
            }else {
              var or__3824__auto____10165 = p1.call(null, y);
              if(cljs.core.truth_(or__3824__auto____10165)) {
                return or__3824__auto____10165
              }else {
                var or__3824__auto____10166 = p2.call(null, y);
                if(cljs.core.truth_(or__3824__auto____10166)) {
                  return or__3824__auto____10166
                }else {
                  var or__3824__auto____10167 = p3.call(null, y);
                  if(cljs.core.truth_(or__3824__auto____10167)) {
                    return or__3824__auto____10167
                  }else {
                    var or__3824__auto____10168 = p1.call(null, z);
                    if(cljs.core.truth_(or__3824__auto____10168)) {
                      return or__3824__auto____10168
                    }else {
                      var or__3824__auto____10169 = p2.call(null, z);
                      if(cljs.core.truth_(or__3824__auto____10169)) {
                        return or__3824__auto____10169
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
        var G__10186__delegate = function(x, y, z, args) {
          var or__3824__auto____10170 = sp3.call(null, x, y, z);
          if(cljs.core.truth_(or__3824__auto____10170)) {
            return or__3824__auto____10170
          }else {
            return cljs.core.some.call(null, function(p1__9866_SHARP_) {
              var or__3824__auto____10171 = p1.call(null, p1__9866_SHARP_);
              if(cljs.core.truth_(or__3824__auto____10171)) {
                return or__3824__auto____10171
              }else {
                var or__3824__auto____10172 = p2.call(null, p1__9866_SHARP_);
                if(cljs.core.truth_(or__3824__auto____10172)) {
                  return or__3824__auto____10172
                }else {
                  return p3.call(null, p1__9866_SHARP_)
                }
              }
            }, args)
          }
        };
        var G__10186 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10186__delegate.call(this, x, y, z, args)
        };
        G__10186.cljs$lang$maxFixedArity = 3;
        G__10186.cljs$lang$applyTo = function(arglist__10187) {
          var x = cljs.core.first(arglist__10187);
          var y = cljs.core.first(cljs.core.next(arglist__10187));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10187)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10187)));
          return G__10186__delegate(x, y, z, args)
        };
        G__10186.cljs$lang$arity$variadic = G__10186__delegate;
        return G__10186
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
    var G__10188__delegate = function(p1, p2, p3, ps) {
      var ps__10173 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var spn = null;
        var spn__0 = function() {
          return null
        };
        var spn__1 = function(x) {
          return cljs.core.some.call(null, function(p1__9867_SHARP_) {
            return p1__9867_SHARP_.call(null, x)
          }, ps__10173)
        };
        var spn__2 = function(x, y) {
          return cljs.core.some.call(null, function(p1__9868_SHARP_) {
            var or__3824__auto____10178 = p1__9868_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3824__auto____10178)) {
              return or__3824__auto____10178
            }else {
              return p1__9868_SHARP_.call(null, y)
            }
          }, ps__10173)
        };
        var spn__3 = function(x, y, z) {
          return cljs.core.some.call(null, function(p1__9869_SHARP_) {
            var or__3824__auto____10179 = p1__9869_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3824__auto____10179)) {
              return or__3824__auto____10179
            }else {
              var or__3824__auto____10180 = p1__9869_SHARP_.call(null, y);
              if(cljs.core.truth_(or__3824__auto____10180)) {
                return or__3824__auto____10180
              }else {
                return p1__9869_SHARP_.call(null, z)
              }
            }
          }, ps__10173)
        };
        var spn__4 = function() {
          var G__10189__delegate = function(x, y, z, args) {
            var or__3824__auto____10181 = spn.call(null, x, y, z);
            if(cljs.core.truth_(or__3824__auto____10181)) {
              return or__3824__auto____10181
            }else {
              return cljs.core.some.call(null, function(p1__9870_SHARP_) {
                return cljs.core.some.call(null, p1__9870_SHARP_, args)
              }, ps__10173)
            }
          };
          var G__10189 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__10189__delegate.call(this, x, y, z, args)
          };
          G__10189.cljs$lang$maxFixedArity = 3;
          G__10189.cljs$lang$applyTo = function(arglist__10190) {
            var x = cljs.core.first(arglist__10190);
            var y = cljs.core.first(cljs.core.next(arglist__10190));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10190)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10190)));
            return G__10189__delegate(x, y, z, args)
          };
          G__10189.cljs$lang$arity$variadic = G__10189__delegate;
          return G__10189
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
    var G__10188 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__10188__delegate.call(this, p1, p2, p3, ps)
    };
    G__10188.cljs$lang$maxFixedArity = 3;
    G__10188.cljs$lang$applyTo = function(arglist__10191) {
      var p1 = cljs.core.first(arglist__10191);
      var p2 = cljs.core.first(cljs.core.next(arglist__10191));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10191)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10191)));
      return G__10188__delegate(p1, p2, p3, ps)
    };
    G__10188.cljs$lang$arity$variadic = G__10188__delegate;
    return G__10188
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
      var temp__3974__auto____10210 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____10210) {
        var s__10211 = temp__3974__auto____10210;
        if(cljs.core.chunked_seq_QMARK_.call(null, s__10211)) {
          var c__10212 = cljs.core.chunk_first.call(null, s__10211);
          var size__10213 = cljs.core.count.call(null, c__10212);
          var b__10214 = cljs.core.chunk_buffer.call(null, size__10213);
          var n__2527__auto____10215 = size__10213;
          var i__10216 = 0;
          while(true) {
            if(i__10216 < n__2527__auto____10215) {
              cljs.core.chunk_append.call(null, b__10214, f.call(null, cljs.core._nth.call(null, c__10212, i__10216)));
              var G__10228 = i__10216 + 1;
              i__10216 = G__10228;
              continue
            }else {
            }
            break
          }
          return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__10214), map.call(null, f, cljs.core.chunk_rest.call(null, s__10211)))
        }else {
          return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s__10211)), map.call(null, f, cljs.core.rest.call(null, s__10211)))
        }
      }else {
        return null
      }
    }, null)
  };
  var map__3 = function(f, c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__10217 = cljs.core.seq.call(null, c1);
      var s2__10218 = cljs.core.seq.call(null, c2);
      if(function() {
        var and__3822__auto____10219 = s1__10217;
        if(and__3822__auto____10219) {
          return s2__10218
        }else {
          return and__3822__auto____10219
        }
      }()) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__10217), cljs.core.first.call(null, s2__10218)), map.call(null, f, cljs.core.rest.call(null, s1__10217), cljs.core.rest.call(null, s2__10218)))
      }else {
        return null
      }
    }, null)
  };
  var map__4 = function(f, c1, c2, c3) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__10220 = cljs.core.seq.call(null, c1);
      var s2__10221 = cljs.core.seq.call(null, c2);
      var s3__10222 = cljs.core.seq.call(null, c3);
      if(function() {
        var and__3822__auto____10223 = s1__10220;
        if(and__3822__auto____10223) {
          var and__3822__auto____10224 = s2__10221;
          if(and__3822__auto____10224) {
            return s3__10222
          }else {
            return and__3822__auto____10224
          }
        }else {
          return and__3822__auto____10223
        }
      }()) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__10220), cljs.core.first.call(null, s2__10221), cljs.core.first.call(null, s3__10222)), map.call(null, f, cljs.core.rest.call(null, s1__10220), cljs.core.rest.call(null, s2__10221), cljs.core.rest.call(null, s3__10222)))
      }else {
        return null
      }
    }, null)
  };
  var map__5 = function() {
    var G__10229__delegate = function(f, c1, c2, c3, colls) {
      var step__10227 = function step(cs) {
        return new cljs.core.LazySeq(null, false, function() {
          var ss__10226 = map.call(null, cljs.core.seq, cs);
          if(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__10226)) {
            return cljs.core.cons.call(null, map.call(null, cljs.core.first, ss__10226), step.call(null, map.call(null, cljs.core.rest, ss__10226)))
          }else {
            return null
          }
        }, null)
      };
      return map.call(null, function(p1__10031_SHARP_) {
        return cljs.core.apply.call(null, f, p1__10031_SHARP_)
      }, step__10227.call(null, cljs.core.conj.call(null, colls, c3, c2, c1)))
    };
    var G__10229 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__10229__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__10229.cljs$lang$maxFixedArity = 4;
    G__10229.cljs$lang$applyTo = function(arglist__10230) {
      var f = cljs.core.first(arglist__10230);
      var c1 = cljs.core.first(cljs.core.next(arglist__10230));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10230)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10230))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10230))));
      return G__10229__delegate(f, c1, c2, c3, colls)
    };
    G__10229.cljs$lang$arity$variadic = G__10229__delegate;
    return G__10229
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
      var temp__3974__auto____10233 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____10233) {
        var s__10234 = temp__3974__auto____10233;
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__10234), take.call(null, n - 1, cljs.core.rest.call(null, s__10234)))
      }else {
        return null
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.drop = function drop(n, coll) {
  var step__10240 = function(n, coll) {
    while(true) {
      var s__10238 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3822__auto____10239 = n > 0;
        if(and__3822__auto____10239) {
          return s__10238
        }else {
          return and__3822__auto____10239
        }
      }())) {
        var G__10241 = n - 1;
        var G__10242 = cljs.core.rest.call(null, s__10238);
        n = G__10241;
        coll = G__10242;
        continue
      }else {
        return s__10238
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__10240.call(null, n, coll)
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
  var s__10245 = cljs.core.seq.call(null, coll);
  var lead__10246 = cljs.core.seq.call(null, cljs.core.drop.call(null, n, coll));
  while(true) {
    if(lead__10246) {
      var G__10247 = cljs.core.next.call(null, s__10245);
      var G__10248 = cljs.core.next.call(null, lead__10246);
      s__10245 = G__10247;
      lead__10246 = G__10248;
      continue
    }else {
      return s__10245
    }
    break
  }
};
cljs.core.drop_while = function drop_while(pred, coll) {
  var step__10254 = function(pred, coll) {
    while(true) {
      var s__10252 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3822__auto____10253 = s__10252;
        if(and__3822__auto____10253) {
          return pred.call(null, cljs.core.first.call(null, s__10252))
        }else {
          return and__3822__auto____10253
        }
      }())) {
        var G__10255 = pred;
        var G__10256 = cljs.core.rest.call(null, s__10252);
        pred = G__10255;
        coll = G__10256;
        continue
      }else {
        return s__10252
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__10254.call(null, pred, coll)
  }, null)
};
cljs.core.cycle = function cycle(coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____10259 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____10259) {
      var s__10260 = temp__3974__auto____10259;
      return cljs.core.concat.call(null, s__10260, cycle.call(null, s__10260))
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
      var s1__10265 = cljs.core.seq.call(null, c1);
      var s2__10266 = cljs.core.seq.call(null, c2);
      if(function() {
        var and__3822__auto____10267 = s1__10265;
        if(and__3822__auto____10267) {
          return s2__10266
        }else {
          return and__3822__auto____10267
        }
      }()) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s1__10265), cljs.core.cons.call(null, cljs.core.first.call(null, s2__10266), interleave.call(null, cljs.core.rest.call(null, s1__10265), cljs.core.rest.call(null, s2__10266))))
      }else {
        return null
      }
    }, null)
  };
  var interleave__3 = function() {
    var G__10269__delegate = function(c1, c2, colls) {
      return new cljs.core.LazySeq(null, false, function() {
        var ss__10268 = cljs.core.map.call(null, cljs.core.seq, cljs.core.conj.call(null, colls, c2, c1));
        if(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__10268)) {
          return cljs.core.concat.call(null, cljs.core.map.call(null, cljs.core.first, ss__10268), cljs.core.apply.call(null, interleave, cljs.core.map.call(null, cljs.core.rest, ss__10268)))
        }else {
          return null
        }
      }, null)
    };
    var G__10269 = function(c1, c2, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__10269__delegate.call(this, c1, c2, colls)
    };
    G__10269.cljs$lang$maxFixedArity = 2;
    G__10269.cljs$lang$applyTo = function(arglist__10270) {
      var c1 = cljs.core.first(arglist__10270);
      var c2 = cljs.core.first(cljs.core.next(arglist__10270));
      var colls = cljs.core.rest(cljs.core.next(arglist__10270));
      return G__10269__delegate(c1, c2, colls)
    };
    G__10269.cljs$lang$arity$variadic = G__10269__delegate;
    return G__10269
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
  var cat__10280 = function cat(coll, colls) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3971__auto____10278 = cljs.core.seq.call(null, coll);
      if(temp__3971__auto____10278) {
        var coll__10279 = temp__3971__auto____10278;
        return cljs.core.cons.call(null, cljs.core.first.call(null, coll__10279), cat.call(null, cljs.core.rest.call(null, coll__10279), colls))
      }else {
        if(cljs.core.seq.call(null, colls)) {
          return cat.call(null, cljs.core.first.call(null, colls), cljs.core.rest.call(null, colls))
        }else {
          return null
        }
      }
    }, null)
  };
  return cat__10280.call(null, null, colls)
};
cljs.core.mapcat = function() {
  var mapcat = null;
  var mapcat__2 = function(f, coll) {
    return cljs.core.flatten1.call(null, cljs.core.map.call(null, f, coll))
  };
  var mapcat__3 = function() {
    var G__10281__delegate = function(f, coll, colls) {
      return cljs.core.flatten1.call(null, cljs.core.apply.call(null, cljs.core.map, f, coll, colls))
    };
    var G__10281 = function(f, coll, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__10281__delegate.call(this, f, coll, colls)
    };
    G__10281.cljs$lang$maxFixedArity = 2;
    G__10281.cljs$lang$applyTo = function(arglist__10282) {
      var f = cljs.core.first(arglist__10282);
      var coll = cljs.core.first(cljs.core.next(arglist__10282));
      var colls = cljs.core.rest(cljs.core.next(arglist__10282));
      return G__10281__delegate(f, coll, colls)
    };
    G__10281.cljs$lang$arity$variadic = G__10281__delegate;
    return G__10281
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
    var temp__3974__auto____10292 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____10292) {
      var s__10293 = temp__3974__auto____10292;
      if(cljs.core.chunked_seq_QMARK_.call(null, s__10293)) {
        var c__10294 = cljs.core.chunk_first.call(null, s__10293);
        var size__10295 = cljs.core.count.call(null, c__10294);
        var b__10296 = cljs.core.chunk_buffer.call(null, size__10295);
        var n__2527__auto____10297 = size__10295;
        var i__10298 = 0;
        while(true) {
          if(i__10298 < n__2527__auto____10297) {
            if(cljs.core.truth_(pred.call(null, cljs.core._nth.call(null, c__10294, i__10298)))) {
              cljs.core.chunk_append.call(null, b__10296, cljs.core._nth.call(null, c__10294, i__10298))
            }else {
            }
            var G__10301 = i__10298 + 1;
            i__10298 = G__10301;
            continue
          }else {
          }
          break
        }
        return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__10296), filter.call(null, pred, cljs.core.chunk_rest.call(null, s__10293)))
      }else {
        var f__10299 = cljs.core.first.call(null, s__10293);
        var r__10300 = cljs.core.rest.call(null, s__10293);
        if(cljs.core.truth_(pred.call(null, f__10299))) {
          return cljs.core.cons.call(null, f__10299, filter.call(null, pred, r__10300))
        }else {
          return filter.call(null, pred, r__10300)
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
  var walk__10304 = function walk(node) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, node, cljs.core.truth_(branch_QMARK_.call(null, node)) ? cljs.core.mapcat.call(null, walk, children.call(null, node)) : null)
    }, null)
  };
  return walk__10304.call(null, root)
};
cljs.core.flatten = function flatten(x) {
  return cljs.core.filter.call(null, function(p1__10302_SHARP_) {
    return!cljs.core.sequential_QMARK_.call(null, p1__10302_SHARP_)
  }, cljs.core.rest.call(null, cljs.core.tree_seq.call(null, cljs.core.sequential_QMARK_, cljs.core.seq, x)))
};
cljs.core.into = function into(to, from) {
  if(function() {
    var G__10308__10309 = to;
    if(G__10308__10309) {
      if(function() {
        var or__3824__auto____10310 = G__10308__10309.cljs$lang$protocol_mask$partition1$ & 1;
        if(or__3824__auto____10310) {
          return or__3824__auto____10310
        }else {
          return G__10308__10309.cljs$core$IEditableCollection$
        }
      }()) {
        return true
      }else {
        if(!G__10308__10309.cljs$lang$protocol_mask$partition1$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IEditableCollection, G__10308__10309)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IEditableCollection, G__10308__10309)
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
    var G__10311__delegate = function(f, c1, c2, c3, colls) {
      return cljs.core.into.call(null, cljs.core.PersistentVector.EMPTY, cljs.core.apply.call(null, cljs.core.map, f, c1, c2, c3, colls))
    };
    var G__10311 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__10311__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__10311.cljs$lang$maxFixedArity = 4;
    G__10311.cljs$lang$applyTo = function(arglist__10312) {
      var f = cljs.core.first(arglist__10312);
      var c1 = cljs.core.first(cljs.core.next(arglist__10312));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10312)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10312))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10312))));
      return G__10311__delegate(f, c1, c2, c3, colls)
    };
    G__10311.cljs$lang$arity$variadic = G__10311__delegate;
    return G__10311
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
      var temp__3974__auto____10319 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____10319) {
        var s__10320 = temp__3974__auto____10319;
        var p__10321 = cljs.core.take.call(null, n, s__10320);
        if(n === cljs.core.count.call(null, p__10321)) {
          return cljs.core.cons.call(null, p__10321, partition.call(null, n, step, cljs.core.drop.call(null, step, s__10320)))
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
      var temp__3974__auto____10322 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____10322) {
        var s__10323 = temp__3974__auto____10322;
        var p__10324 = cljs.core.take.call(null, n, s__10323);
        if(n === cljs.core.count.call(null, p__10324)) {
          return cljs.core.cons.call(null, p__10324, partition.call(null, n, step, pad, cljs.core.drop.call(null, step, s__10323)))
        }else {
          return cljs.core.list.call(null, cljs.core.take.call(null, n, cljs.core.concat.call(null, p__10324, pad)))
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
    var sentinel__10329 = cljs.core.lookup_sentinel;
    var m__10330 = m;
    var ks__10331 = cljs.core.seq.call(null, ks);
    while(true) {
      if(ks__10331) {
        var m__10332 = cljs.core._lookup.call(null, m__10330, cljs.core.first.call(null, ks__10331), sentinel__10329);
        if(sentinel__10329 === m__10332) {
          return not_found
        }else {
          var G__10333 = sentinel__10329;
          var G__10334 = m__10332;
          var G__10335 = cljs.core.next.call(null, ks__10331);
          sentinel__10329 = G__10333;
          m__10330 = G__10334;
          ks__10331 = G__10335;
          continue
        }
      }else {
        return m__10330
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
cljs.core.assoc_in = function assoc_in(m, p__10336, v) {
  var vec__10341__10342 = p__10336;
  var k__10343 = cljs.core.nth.call(null, vec__10341__10342, 0, null);
  var ks__10344 = cljs.core.nthnext.call(null, vec__10341__10342, 1);
  if(cljs.core.truth_(ks__10344)) {
    return cljs.core.assoc.call(null, m, k__10343, assoc_in.call(null, cljs.core._lookup.call(null, m, k__10343, null), ks__10344, v))
  }else {
    return cljs.core.assoc.call(null, m, k__10343, v)
  }
};
cljs.core.update_in = function() {
  var update_in__delegate = function(m, p__10345, f, args) {
    var vec__10350__10351 = p__10345;
    var k__10352 = cljs.core.nth.call(null, vec__10350__10351, 0, null);
    var ks__10353 = cljs.core.nthnext.call(null, vec__10350__10351, 1);
    if(cljs.core.truth_(ks__10353)) {
      return cljs.core.assoc.call(null, m, k__10352, cljs.core.apply.call(null, update_in, cljs.core._lookup.call(null, m, k__10352, null), ks__10353, f, args))
    }else {
      return cljs.core.assoc.call(null, m, k__10352, cljs.core.apply.call(null, f, cljs.core._lookup.call(null, m, k__10352, null), args))
    }
  };
  var update_in = function(m, p__10345, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return update_in__delegate.call(this, m, p__10345, f, args)
  };
  update_in.cljs$lang$maxFixedArity = 3;
  update_in.cljs$lang$applyTo = function(arglist__10354) {
    var m = cljs.core.first(arglist__10354);
    var p__10345 = cljs.core.first(cljs.core.next(arglist__10354));
    var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10354)));
    var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10354)));
    return update_in__delegate(m, p__10345, f, args)
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
  var this__10357 = this;
  var h__2192__auto____10358 = this__10357.__hash;
  if(!(h__2192__auto____10358 == null)) {
    return h__2192__auto____10358
  }else {
    var h__2192__auto____10359 = cljs.core.hash_coll.call(null, coll);
    this__10357.__hash = h__2192__auto____10359;
    return h__2192__auto____10359
  }
};
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10360 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10361 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__10362 = this;
  var new_array__10363 = this__10362.array.slice();
  new_array__10363[k] = v;
  return new cljs.core.Vector(this__10362.meta, new_array__10363, null)
};
cljs.core.Vector.prototype.call = function() {
  var G__10394 = null;
  var G__10394__2 = function(this_sym10364, k) {
    var this__10366 = this;
    var this_sym10364__10367 = this;
    var coll__10368 = this_sym10364__10367;
    return coll__10368.cljs$core$ILookup$_lookup$arity$2(coll__10368, k)
  };
  var G__10394__3 = function(this_sym10365, k, not_found) {
    var this__10366 = this;
    var this_sym10365__10369 = this;
    var coll__10370 = this_sym10365__10369;
    return coll__10370.cljs$core$ILookup$_lookup$arity$3(coll__10370, k, not_found)
  };
  G__10394 = function(this_sym10365, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10394__2.call(this, this_sym10365, k);
      case 3:
        return G__10394__3.call(this, this_sym10365, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10394
}();
cljs.core.Vector.prototype.apply = function(this_sym10355, args10356) {
  var this__10371 = this;
  return this_sym10355.call.apply(this_sym10355, [this_sym10355].concat(args10356.slice()))
};
cljs.core.Vector.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__10372 = this;
  var new_array__10373 = this__10372.array.slice();
  new_array__10373.push(o);
  return new cljs.core.Vector(this__10372.meta, new_array__10373, null)
};
cljs.core.Vector.prototype.toString = function() {
  var this__10374 = this;
  var this__10375 = this;
  return cljs.core.pr_str.call(null, this__10375)
};
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce$arity$2 = function(v, f) {
  var this__10376 = this;
  return cljs.core.ci_reduce.call(null, this__10376.array, f)
};
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce$arity$3 = function(v, f, start) {
  var this__10377 = this;
  return cljs.core.ci_reduce.call(null, this__10377.array, f, start)
};
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10378 = this;
  if(this__10378.array.length > 0) {
    var vector_seq__10379 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(i < this__10378.array.length) {
          return cljs.core.cons.call(null, this__10378.array[i], vector_seq.call(null, i + 1))
        }else {
          return null
        }
      }, null)
    };
    return vector_seq__10379.call(null, 0)
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10380 = this;
  return this__10380.array.length
};
cljs.core.Vector.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__10381 = this;
  var count__10382 = this__10381.array.length;
  if(count__10382 > 0) {
    return this__10381.array[count__10382 - 1]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__10383 = this;
  if(this__10383.array.length > 0) {
    var new_array__10384 = this__10383.array.slice();
    new_array__10384.pop();
    return new cljs.core.Vector(this__10383.meta, new_array__10384, null)
  }else {
    throw new Error("Can't pop empty vector");
  }
};
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(coll, n, val) {
  var this__10385 = this;
  return coll.cljs$core$IAssociative$_assoc$arity$3(coll, n, val)
};
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10386 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10387 = this;
  return new cljs.core.Vector(meta, this__10387.array, this__10387.__hash)
};
cljs.core.Vector.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10388 = this;
  return this__10388.meta
};
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__10389 = this;
  if(function() {
    var and__3822__auto____10390 = 0 <= n;
    if(and__3822__auto____10390) {
      return n < this__10389.array.length
    }else {
      return and__3822__auto____10390
    }
  }()) {
    return this__10389.array[n]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__10391 = this;
  if(function() {
    var and__3822__auto____10392 = 0 <= n;
    if(and__3822__auto____10392) {
      return n < this__10391.array.length
    }else {
      return and__3822__auto____10392
    }
  }()) {
    return this__10391.array[n]
  }else {
    return not_found
  }
};
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10393 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__10393.meta)
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
  var cnt__10396 = pv.cnt;
  if(cnt__10396 < 32) {
    return 0
  }else {
    return cnt__10396 - 1 >>> 5 << 5
  }
};
cljs.core.new_path = function new_path(edit, level, node) {
  var ll__10402 = level;
  var ret__10403 = node;
  while(true) {
    if(ll__10402 === 0) {
      return ret__10403
    }else {
      var embed__10404 = ret__10403;
      var r__10405 = cljs.core.pv_fresh_node.call(null, edit);
      var ___10406 = cljs.core.pv_aset.call(null, r__10405, 0, embed__10404);
      var G__10407 = ll__10402 - 5;
      var G__10408 = r__10405;
      ll__10402 = G__10407;
      ret__10403 = G__10408;
      continue
    }
    break
  }
};
cljs.core.push_tail = function push_tail(pv, level, parent, tailnode) {
  var ret__10414 = cljs.core.pv_clone_node.call(null, parent);
  var subidx__10415 = pv.cnt - 1 >>> level & 31;
  if(5 === level) {
    cljs.core.pv_aset.call(null, ret__10414, subidx__10415, tailnode);
    return ret__10414
  }else {
    var child__10416 = cljs.core.pv_aget.call(null, parent, subidx__10415);
    if(!(child__10416 == null)) {
      var node_to_insert__10417 = push_tail.call(null, pv, level - 5, child__10416, tailnode);
      cljs.core.pv_aset.call(null, ret__10414, subidx__10415, node_to_insert__10417);
      return ret__10414
    }else {
      var node_to_insert__10418 = cljs.core.new_path.call(null, null, level - 5, tailnode);
      cljs.core.pv_aset.call(null, ret__10414, subidx__10415, node_to_insert__10418);
      return ret__10414
    }
  }
};
cljs.core.array_for = function array_for(pv, i) {
  if(function() {
    var and__3822__auto____10422 = 0 <= i;
    if(and__3822__auto____10422) {
      return i < pv.cnt
    }else {
      return and__3822__auto____10422
    }
  }()) {
    if(i >= cljs.core.tail_off.call(null, pv)) {
      return pv.tail
    }else {
      var node__10423 = pv.root;
      var level__10424 = pv.shift;
      while(true) {
        if(level__10424 > 0) {
          var G__10425 = cljs.core.pv_aget.call(null, node__10423, i >>> level__10424 & 31);
          var G__10426 = level__10424 - 5;
          node__10423 = G__10425;
          level__10424 = G__10426;
          continue
        }else {
          return node__10423.arr
        }
        break
      }
    }
  }else {
    throw new Error([cljs.core.str("No item "), cljs.core.str(i), cljs.core.str(" in vector of length "), cljs.core.str(pv.cnt)].join(""));
  }
};
cljs.core.do_assoc = function do_assoc(pv, level, node, i, val) {
  var ret__10429 = cljs.core.pv_clone_node.call(null, node);
  if(level === 0) {
    cljs.core.pv_aset.call(null, ret__10429, i & 31, val);
    return ret__10429
  }else {
    var subidx__10430 = i >>> level & 31;
    cljs.core.pv_aset.call(null, ret__10429, subidx__10430, do_assoc.call(null, pv, level - 5, cljs.core.pv_aget.call(null, node, subidx__10430), i, val));
    return ret__10429
  }
};
cljs.core.pop_tail = function pop_tail(pv, level, node) {
  var subidx__10436 = pv.cnt - 2 >>> level & 31;
  if(level > 5) {
    var new_child__10437 = pop_tail.call(null, pv, level - 5, cljs.core.pv_aget.call(null, node, subidx__10436));
    if(function() {
      var and__3822__auto____10438 = new_child__10437 == null;
      if(and__3822__auto____10438) {
        return subidx__10436 === 0
      }else {
        return and__3822__auto____10438
      }
    }()) {
      return null
    }else {
      var ret__10439 = cljs.core.pv_clone_node.call(null, node);
      cljs.core.pv_aset.call(null, ret__10439, subidx__10436, new_child__10437);
      return ret__10439
    }
  }else {
    if(subidx__10436 === 0) {
      return null
    }else {
      if("\ufdd0'else") {
        var ret__10440 = cljs.core.pv_clone_node.call(null, node);
        cljs.core.pv_aset.call(null, ret__10440, subidx__10436, null);
        return ret__10440
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
  var this__10443 = this;
  return new cljs.core.TransientVector(this__10443.cnt, this__10443.shift, cljs.core.tv_editable_root.call(null, this__10443.root), cljs.core.tv_editable_tail.call(null, this__10443.tail))
};
cljs.core.PersistentVector.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__10444 = this;
  var h__2192__auto____10445 = this__10444.__hash;
  if(!(h__2192__auto____10445 == null)) {
    return h__2192__auto____10445
  }else {
    var h__2192__auto____10446 = cljs.core.hash_coll.call(null, coll);
    this__10444.__hash = h__2192__auto____10446;
    return h__2192__auto____10446
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10447 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10448 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__10449 = this;
  if(function() {
    var and__3822__auto____10450 = 0 <= k;
    if(and__3822__auto____10450) {
      return k < this__10449.cnt
    }else {
      return and__3822__auto____10450
    }
  }()) {
    if(cljs.core.tail_off.call(null, coll) <= k) {
      var new_tail__10451 = this__10449.tail.slice();
      new_tail__10451[k & 31] = v;
      return new cljs.core.PersistentVector(this__10449.meta, this__10449.cnt, this__10449.shift, this__10449.root, new_tail__10451, null)
    }else {
      return new cljs.core.PersistentVector(this__10449.meta, this__10449.cnt, this__10449.shift, cljs.core.do_assoc.call(null, coll, this__10449.shift, this__10449.root, k, v), this__10449.tail, null)
    }
  }else {
    if(k === this__10449.cnt) {
      return coll.cljs$core$ICollection$_conj$arity$2(coll, v)
    }else {
      if("\ufdd0'else") {
        throw new Error([cljs.core.str("Index "), cljs.core.str(k), cljs.core.str(" out of bounds  [0,"), cljs.core.str(this__10449.cnt), cljs.core.str("]")].join(""));
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentVector.prototype.call = function() {
  var G__10499 = null;
  var G__10499__2 = function(this_sym10452, k) {
    var this__10454 = this;
    var this_sym10452__10455 = this;
    var coll__10456 = this_sym10452__10455;
    return coll__10456.cljs$core$ILookup$_lookup$arity$2(coll__10456, k)
  };
  var G__10499__3 = function(this_sym10453, k, not_found) {
    var this__10454 = this;
    var this_sym10453__10457 = this;
    var coll__10458 = this_sym10453__10457;
    return coll__10458.cljs$core$ILookup$_lookup$arity$3(coll__10458, k, not_found)
  };
  G__10499 = function(this_sym10453, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10499__2.call(this, this_sym10453, k);
      case 3:
        return G__10499__3.call(this, this_sym10453, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10499
}();
cljs.core.PersistentVector.prototype.apply = function(this_sym10441, args10442) {
  var this__10459 = this;
  return this_sym10441.call.apply(this_sym10441, [this_sym10441].concat(args10442.slice()))
};
cljs.core.PersistentVector.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(v, f, init) {
  var this__10460 = this;
  var step_init__10461 = [0, init];
  var i__10462 = 0;
  while(true) {
    if(i__10462 < this__10460.cnt) {
      var arr__10463 = cljs.core.array_for.call(null, v, i__10462);
      var len__10464 = arr__10463.length;
      var init__10468 = function() {
        var j__10465 = 0;
        var init__10466 = step_init__10461[1];
        while(true) {
          if(j__10465 < len__10464) {
            var init__10467 = f.call(null, init__10466, j__10465 + i__10462, arr__10463[j__10465]);
            if(cljs.core.reduced_QMARK_.call(null, init__10467)) {
              return init__10467
            }else {
              var G__10500 = j__10465 + 1;
              var G__10501 = init__10467;
              j__10465 = G__10500;
              init__10466 = G__10501;
              continue
            }
          }else {
            step_init__10461[0] = len__10464;
            step_init__10461[1] = init__10466;
            return init__10466
          }
          break
        }
      }();
      if(cljs.core.reduced_QMARK_.call(null, init__10468)) {
        return cljs.core.deref.call(null, init__10468)
      }else {
        var G__10502 = i__10462 + step_init__10461[0];
        i__10462 = G__10502;
        continue
      }
    }else {
      return step_init__10461[1]
    }
    break
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__10469 = this;
  if(this__10469.cnt - cljs.core.tail_off.call(null, coll) < 32) {
    var new_tail__10470 = this__10469.tail.slice();
    new_tail__10470.push(o);
    return new cljs.core.PersistentVector(this__10469.meta, this__10469.cnt + 1, this__10469.shift, this__10469.root, new_tail__10470, null)
  }else {
    var root_overflow_QMARK___10471 = this__10469.cnt >>> 5 > 1 << this__10469.shift;
    var new_shift__10472 = root_overflow_QMARK___10471 ? this__10469.shift + 5 : this__10469.shift;
    var new_root__10474 = root_overflow_QMARK___10471 ? function() {
      var n_r__10473 = cljs.core.pv_fresh_node.call(null, null);
      cljs.core.pv_aset.call(null, n_r__10473, 0, this__10469.root);
      cljs.core.pv_aset.call(null, n_r__10473, 1, cljs.core.new_path.call(null, null, this__10469.shift, new cljs.core.VectorNode(null, this__10469.tail)));
      return n_r__10473
    }() : cljs.core.push_tail.call(null, coll, this__10469.shift, this__10469.root, new cljs.core.VectorNode(null, this__10469.tail));
    return new cljs.core.PersistentVector(this__10469.meta, this__10469.cnt + 1, new_shift__10472, new_root__10474, [o], null)
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__10475 = this;
  if(this__10475.cnt > 0) {
    return new cljs.core.RSeq(coll, this__10475.cnt - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IMapEntry$_key$arity$1 = function(coll) {
  var this__10476 = this;
  return coll.cljs$core$IIndexed$_nth$arity$2(coll, 0)
};
cljs.core.PersistentVector.prototype.cljs$core$IMapEntry$_val$arity$1 = function(coll) {
  var this__10477 = this;
  return coll.cljs$core$IIndexed$_nth$arity$2(coll, 1)
};
cljs.core.PersistentVector.prototype.toString = function() {
  var this__10478 = this;
  var this__10479 = this;
  return cljs.core.pr_str.call(null, this__10479)
};
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce$arity$2 = function(v, f) {
  var this__10480 = this;
  return cljs.core.ci_reduce.call(null, v, f)
};
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce$arity$3 = function(v, f, start) {
  var this__10481 = this;
  return cljs.core.ci_reduce.call(null, v, f, start)
};
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10482 = this;
  if(this__10482.cnt === 0) {
    return null
  }else {
    return cljs.core.chunked_seq.call(null, coll, 0, 0)
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10483 = this;
  return this__10483.cnt
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__10484 = this;
  if(this__10484.cnt > 0) {
    return coll.cljs$core$IIndexed$_nth$arity$2(coll, this__10484.cnt - 1)
  }else {
    return null
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__10485 = this;
  if(this__10485.cnt === 0) {
    throw new Error("Can't pop empty vector");
  }else {
    if(1 === this__10485.cnt) {
      return cljs.core._with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__10485.meta)
    }else {
      if(1 < this__10485.cnt - cljs.core.tail_off.call(null, coll)) {
        return new cljs.core.PersistentVector(this__10485.meta, this__10485.cnt - 1, this__10485.shift, this__10485.root, this__10485.tail.slice(0, -1), null)
      }else {
        if("\ufdd0'else") {
          var new_tail__10486 = cljs.core.array_for.call(null, coll, this__10485.cnt - 2);
          var nr__10487 = cljs.core.pop_tail.call(null, coll, this__10485.shift, this__10485.root);
          var new_root__10488 = nr__10487 == null ? cljs.core.PersistentVector.EMPTY_NODE : nr__10487;
          var cnt_1__10489 = this__10485.cnt - 1;
          if(function() {
            var and__3822__auto____10490 = 5 < this__10485.shift;
            if(and__3822__auto____10490) {
              return cljs.core.pv_aget.call(null, new_root__10488, 1) == null
            }else {
              return and__3822__auto____10490
            }
          }()) {
            return new cljs.core.PersistentVector(this__10485.meta, cnt_1__10489, this__10485.shift - 5, cljs.core.pv_aget.call(null, new_root__10488, 0), new_tail__10486, null)
          }else {
            return new cljs.core.PersistentVector(this__10485.meta, cnt_1__10489, this__10485.shift, new_root__10488, new_tail__10486, null)
          }
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(coll, n, val) {
  var this__10491 = this;
  return coll.cljs$core$IAssociative$_assoc$arity$3(coll, n, val)
};
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10492 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10493 = this;
  return new cljs.core.PersistentVector(meta, this__10493.cnt, this__10493.shift, this__10493.root, this__10493.tail, this__10493.__hash)
};
cljs.core.PersistentVector.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10494 = this;
  return this__10494.meta
};
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__10495 = this;
  return cljs.core.array_for.call(null, coll, n)[n & 31]
};
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__10496 = this;
  if(function() {
    var and__3822__auto____10497 = 0 <= n;
    if(and__3822__auto____10497) {
      return n < this__10496.cnt
    }else {
      return and__3822__auto____10497
    }
  }()) {
    return coll.cljs$core$IIndexed$_nth$arity$2(coll, n)
  }else {
    return not_found
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10498 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__10498.meta)
};
cljs.core.PersistentVector;
cljs.core.PersistentVector.EMPTY_NODE = cljs.core.pv_fresh_node.call(null, null);
cljs.core.PersistentVector.EMPTY = new cljs.core.PersistentVector(null, 0, 5, cljs.core.PersistentVector.EMPTY_NODE, [], 0);
cljs.core.PersistentVector.fromArray = function(xs, no_clone) {
  var l__10503 = xs.length;
  var xs__10504 = no_clone === true ? xs : xs.slice();
  if(l__10503 < 32) {
    return new cljs.core.PersistentVector(null, l__10503, 5, cljs.core.PersistentVector.EMPTY_NODE, xs__10504, null)
  }else {
    var node__10505 = xs__10504.slice(0, 32);
    var v__10506 = new cljs.core.PersistentVector(null, 32, 5, cljs.core.PersistentVector.EMPTY_NODE, node__10505, null);
    var i__10507 = 32;
    var out__10508 = cljs.core._as_transient.call(null, v__10506);
    while(true) {
      if(i__10507 < l__10503) {
        var G__10509 = i__10507 + 1;
        var G__10510 = cljs.core.conj_BANG_.call(null, out__10508, xs__10504[i__10507]);
        i__10507 = G__10509;
        out__10508 = G__10510;
        continue
      }else {
        return cljs.core.persistent_BANG_.call(null, out__10508)
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
  vector.cljs$lang$applyTo = function(arglist__10511) {
    var args = cljs.core.seq(arglist__10511);
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
  var this__10512 = this;
  if(this__10512.off + 1 < this__10512.node.length) {
    var s__10513 = cljs.core.chunked_seq.call(null, this__10512.vec, this__10512.node, this__10512.i, this__10512.off + 1);
    if(s__10513 == null) {
      return null
    }else {
      return s__10513
    }
  }else {
    return coll.cljs$core$IChunkedNext$_chunked_next$arity$1(coll)
  }
};
cljs.core.ChunkedSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__10514 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.ChunkedSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10515 = this;
  return coll
};
cljs.core.ChunkedSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__10516 = this;
  return this__10516.node[this__10516.off]
};
cljs.core.ChunkedSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__10517 = this;
  if(this__10517.off + 1 < this__10517.node.length) {
    var s__10518 = cljs.core.chunked_seq.call(null, this__10517.vec, this__10517.node, this__10517.i, this__10517.off + 1);
    if(s__10518 == null) {
      return cljs.core.List.EMPTY
    }else {
      return s__10518
    }
  }else {
    return coll.cljs$core$IChunkedSeq$_chunked_rest$arity$1(coll)
  }
};
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedNext$ = true;
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedNext$_chunked_next$arity$1 = function(coll) {
  var this__10519 = this;
  var l__10520 = this__10519.node.length;
  var s__10521 = this__10519.i + l__10520 < cljs.core._count.call(null, this__10519.vec) ? cljs.core.chunked_seq.call(null, this__10519.vec, this__10519.i + l__10520, 0) : null;
  if(s__10521 == null) {
    return null
  }else {
    return s__10521
  }
};
cljs.core.ChunkedSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10522 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, m) {
  var this__10523 = this;
  return cljs.core.chunked_seq.call(null, this__10523.vec, this__10523.node, this__10523.i, this__10523.off, m)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IWithMeta$_meta$arity$1 = function(coll) {
  var this__10524 = this;
  return this__10524.meta
};
cljs.core.ChunkedSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10525 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__10525.meta)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedSeq$ = true;
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedSeq$_chunked_first$arity$1 = function(coll) {
  var this__10526 = this;
  return cljs.core.array_chunk.call(null, this__10526.node, this__10526.off)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedSeq$_chunked_rest$arity$1 = function(coll) {
  var this__10527 = this;
  var l__10528 = this__10527.node.length;
  var s__10529 = this__10527.i + l__10528 < cljs.core._count.call(null, this__10527.vec) ? cljs.core.chunked_seq.call(null, this__10527.vec, this__10527.i + l__10528, 0) : null;
  if(s__10529 == null) {
    return cljs.core.List.EMPTY
  }else {
    return s__10529
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
  var this__10532 = this;
  var h__2192__auto____10533 = this__10532.__hash;
  if(!(h__2192__auto____10533 == null)) {
    return h__2192__auto____10533
  }else {
    var h__2192__auto____10534 = cljs.core.hash_coll.call(null, coll);
    this__10532.__hash = h__2192__auto____10534;
    return h__2192__auto____10534
  }
};
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10535 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10536 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, key, val) {
  var this__10537 = this;
  var v_pos__10538 = this__10537.start + key;
  return new cljs.core.Subvec(this__10537.meta, cljs.core._assoc.call(null, this__10537.v, v_pos__10538, val), this__10537.start, this__10537.end > v_pos__10538 + 1 ? this__10537.end : v_pos__10538 + 1, null)
};
cljs.core.Subvec.prototype.call = function() {
  var G__10564 = null;
  var G__10564__2 = function(this_sym10539, k) {
    var this__10541 = this;
    var this_sym10539__10542 = this;
    var coll__10543 = this_sym10539__10542;
    return coll__10543.cljs$core$ILookup$_lookup$arity$2(coll__10543, k)
  };
  var G__10564__3 = function(this_sym10540, k, not_found) {
    var this__10541 = this;
    var this_sym10540__10544 = this;
    var coll__10545 = this_sym10540__10544;
    return coll__10545.cljs$core$ILookup$_lookup$arity$3(coll__10545, k, not_found)
  };
  G__10564 = function(this_sym10540, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10564__2.call(this, this_sym10540, k);
      case 3:
        return G__10564__3.call(this, this_sym10540, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10564
}();
cljs.core.Subvec.prototype.apply = function(this_sym10530, args10531) {
  var this__10546 = this;
  return this_sym10530.call.apply(this_sym10530, [this_sym10530].concat(args10531.slice()))
};
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__10547 = this;
  return new cljs.core.Subvec(this__10547.meta, cljs.core._assoc_n.call(null, this__10547.v, this__10547.end, o), this__10547.start, this__10547.end + 1, null)
};
cljs.core.Subvec.prototype.toString = function() {
  var this__10548 = this;
  var this__10549 = this;
  return cljs.core.pr_str.call(null, this__10549)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce$arity$2 = function(coll, f) {
  var this__10550 = this;
  return cljs.core.ci_reduce.call(null, coll, f)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce$arity$3 = function(coll, f, start) {
  var this__10551 = this;
  return cljs.core.ci_reduce.call(null, coll, f, start)
};
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10552 = this;
  var subvec_seq__10553 = function subvec_seq(i) {
    if(i === this__10552.end) {
      return null
    }else {
      return cljs.core.cons.call(null, cljs.core._nth.call(null, this__10552.v, i), new cljs.core.LazySeq(null, false, function() {
        return subvec_seq.call(null, i + 1)
      }, null))
    }
  };
  return subvec_seq__10553.call(null, this__10552.start)
};
cljs.core.Subvec.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10554 = this;
  return this__10554.end - this__10554.start
};
cljs.core.Subvec.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__10555 = this;
  return cljs.core._nth.call(null, this__10555.v, this__10555.end - 1)
};
cljs.core.Subvec.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__10556 = this;
  if(this__10556.start === this__10556.end) {
    throw new Error("Can't pop empty vector");
  }else {
    return new cljs.core.Subvec(this__10556.meta, this__10556.v, this__10556.start, this__10556.end - 1, null)
  }
};
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(coll, n, val) {
  var this__10557 = this;
  return coll.cljs$core$IAssociative$_assoc$arity$3(coll, n, val)
};
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10558 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10559 = this;
  return new cljs.core.Subvec(meta, this__10559.v, this__10559.start, this__10559.end, this__10559.__hash)
};
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10560 = this;
  return this__10560.meta
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__10561 = this;
  return cljs.core._nth.call(null, this__10561.v, this__10561.start + n)
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__10562 = this;
  return cljs.core._nth.call(null, this__10562.v, this__10562.start + n, not_found)
};
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10563 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__10563.meta)
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
  var ret__10566 = cljs.core.make_array.call(null, 32);
  cljs.core.array_copy.call(null, tl, 0, ret__10566, 0, tl.length);
  return ret__10566
};
cljs.core.tv_push_tail = function tv_push_tail(tv, level, parent, tail_node) {
  var ret__10570 = cljs.core.tv_ensure_editable.call(null, tv.root.edit, parent);
  var subidx__10571 = tv.cnt - 1 >>> level & 31;
  cljs.core.pv_aset.call(null, ret__10570, subidx__10571, level === 5 ? tail_node : function() {
    var child__10572 = cljs.core.pv_aget.call(null, ret__10570, subidx__10571);
    if(!(child__10572 == null)) {
      return tv_push_tail.call(null, tv, level - 5, child__10572, tail_node)
    }else {
      return cljs.core.new_path.call(null, tv.root.edit, level - 5, tail_node)
    }
  }());
  return ret__10570
};
cljs.core.tv_pop_tail = function tv_pop_tail(tv, level, node) {
  var node__10577 = cljs.core.tv_ensure_editable.call(null, tv.root.edit, node);
  var subidx__10578 = tv.cnt - 2 >>> level & 31;
  if(level > 5) {
    var new_child__10579 = tv_pop_tail.call(null, tv, level - 5, cljs.core.pv_aget.call(null, node__10577, subidx__10578));
    if(function() {
      var and__3822__auto____10580 = new_child__10579 == null;
      if(and__3822__auto____10580) {
        return subidx__10578 === 0
      }else {
        return and__3822__auto____10580
      }
    }()) {
      return null
    }else {
      cljs.core.pv_aset.call(null, node__10577, subidx__10578, new_child__10579);
      return node__10577
    }
  }else {
    if(subidx__10578 === 0) {
      return null
    }else {
      if("\ufdd0'else") {
        cljs.core.pv_aset.call(null, node__10577, subidx__10578, null);
        return node__10577
      }else {
        return null
      }
    }
  }
};
cljs.core.editable_array_for = function editable_array_for(tv, i) {
  if(function() {
    var and__3822__auto____10585 = 0 <= i;
    if(and__3822__auto____10585) {
      return i < tv.cnt
    }else {
      return and__3822__auto____10585
    }
  }()) {
    if(i >= cljs.core.tail_off.call(null, tv)) {
      return tv.tail
    }else {
      var root__10586 = tv.root;
      var node__10587 = root__10586;
      var level__10588 = tv.shift;
      while(true) {
        if(level__10588 > 0) {
          var G__10589 = cljs.core.tv_ensure_editable.call(null, root__10586.edit, cljs.core.pv_aget.call(null, node__10587, i >>> level__10588 & 31));
          var G__10590 = level__10588 - 5;
          node__10587 = G__10589;
          level__10588 = G__10590;
          continue
        }else {
          return node__10587.arr
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
  var G__10630 = null;
  var G__10630__2 = function(this_sym10593, k) {
    var this__10595 = this;
    var this_sym10593__10596 = this;
    var coll__10597 = this_sym10593__10596;
    return coll__10597.cljs$core$ILookup$_lookup$arity$2(coll__10597, k)
  };
  var G__10630__3 = function(this_sym10594, k, not_found) {
    var this__10595 = this;
    var this_sym10594__10598 = this;
    var coll__10599 = this_sym10594__10598;
    return coll__10599.cljs$core$ILookup$_lookup$arity$3(coll__10599, k, not_found)
  };
  G__10630 = function(this_sym10594, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10630__2.call(this, this_sym10594, k);
      case 3:
        return G__10630__3.call(this, this_sym10594, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10630
}();
cljs.core.TransientVector.prototype.apply = function(this_sym10591, args10592) {
  var this__10600 = this;
  return this_sym10591.call.apply(this_sym10591, [this_sym10591].concat(args10592.slice()))
};
cljs.core.TransientVector.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10601 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.TransientVector.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10602 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.TransientVector.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__10603 = this;
  if(this__10603.root.edit) {
    return cljs.core.array_for.call(null, coll, n)[n & 31]
  }else {
    throw new Error("nth after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__10604 = this;
  if(function() {
    var and__3822__auto____10605 = 0 <= n;
    if(and__3822__auto____10605) {
      return n < this__10604.cnt
    }else {
      return and__3822__auto____10605
    }
  }()) {
    return coll.cljs$core$IIndexed$_nth$arity$2(coll, n)
  }else {
    return not_found
  }
};
cljs.core.TransientVector.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10606 = this;
  if(this__10606.root.edit) {
    return this__10606.cnt
  }else {
    throw new Error("count after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3 = function(tcoll, n, val) {
  var this__10607 = this;
  if(this__10607.root.edit) {
    if(function() {
      var and__3822__auto____10608 = 0 <= n;
      if(and__3822__auto____10608) {
        return n < this__10607.cnt
      }else {
        return and__3822__auto____10608
      }
    }()) {
      if(cljs.core.tail_off.call(null, tcoll) <= n) {
        this__10607.tail[n & 31] = val;
        return tcoll
      }else {
        var new_root__10613 = function go(level, node) {
          var node__10611 = cljs.core.tv_ensure_editable.call(null, this__10607.root.edit, node);
          if(level === 0) {
            cljs.core.pv_aset.call(null, node__10611, n & 31, val);
            return node__10611
          }else {
            var subidx__10612 = n >>> level & 31;
            cljs.core.pv_aset.call(null, node__10611, subidx__10612, go.call(null, level - 5, cljs.core.pv_aget.call(null, node__10611, subidx__10612)));
            return node__10611
          }
        }.call(null, this__10607.shift, this__10607.root);
        this__10607.root = new_root__10613;
        return tcoll
      }
    }else {
      if(n === this__10607.cnt) {
        return tcoll.cljs$core$ITransientCollection$_conj_BANG_$arity$2(tcoll, val)
      }else {
        if("\ufdd0'else") {
          throw new Error([cljs.core.str("Index "), cljs.core.str(n), cljs.core.str(" out of bounds for TransientVector of length"), cljs.core.str(this__10607.cnt)].join(""));
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
  var this__10614 = this;
  if(this__10614.root.edit) {
    if(this__10614.cnt === 0) {
      throw new Error("Can't pop empty vector");
    }else {
      if(1 === this__10614.cnt) {
        this__10614.cnt = 0;
        return tcoll
      }else {
        if((this__10614.cnt - 1 & 31) > 0) {
          this__10614.cnt = this__10614.cnt - 1;
          return tcoll
        }else {
          if("\ufdd0'else") {
            var new_tail__10615 = cljs.core.editable_array_for.call(null, tcoll, this__10614.cnt - 2);
            var new_root__10617 = function() {
              var nr__10616 = cljs.core.tv_pop_tail.call(null, tcoll, this__10614.shift, this__10614.root);
              if(!(nr__10616 == null)) {
                return nr__10616
              }else {
                return new cljs.core.VectorNode(this__10614.root.edit, cljs.core.make_array.call(null, 32))
              }
            }();
            if(function() {
              var and__3822__auto____10618 = 5 < this__10614.shift;
              if(and__3822__auto____10618) {
                return cljs.core.pv_aget.call(null, new_root__10617, 1) == null
              }else {
                return and__3822__auto____10618
              }
            }()) {
              var new_root__10619 = cljs.core.tv_ensure_editable.call(null, this__10614.root.edit, cljs.core.pv_aget.call(null, new_root__10617, 0));
              this__10614.root = new_root__10619;
              this__10614.shift = this__10614.shift - 5;
              this__10614.cnt = this__10614.cnt - 1;
              this__10614.tail = new_tail__10615;
              return tcoll
            }else {
              this__10614.root = new_root__10617;
              this__10614.cnt = this__10614.cnt - 1;
              this__10614.tail = new_tail__10615;
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
  var this__10620 = this;
  return tcoll.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3(tcoll, key, val)
};
cljs.core.TransientVector.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, o) {
  var this__10621 = this;
  if(this__10621.root.edit) {
    if(this__10621.cnt - cljs.core.tail_off.call(null, tcoll) < 32) {
      this__10621.tail[this__10621.cnt & 31] = o;
      this__10621.cnt = this__10621.cnt + 1;
      return tcoll
    }else {
      var tail_node__10622 = new cljs.core.VectorNode(this__10621.root.edit, this__10621.tail);
      var new_tail__10623 = cljs.core.make_array.call(null, 32);
      new_tail__10623[0] = o;
      this__10621.tail = new_tail__10623;
      if(this__10621.cnt >>> 5 > 1 << this__10621.shift) {
        var new_root_array__10624 = cljs.core.make_array.call(null, 32);
        var new_shift__10625 = this__10621.shift + 5;
        new_root_array__10624[0] = this__10621.root;
        new_root_array__10624[1] = cljs.core.new_path.call(null, this__10621.root.edit, this__10621.shift, tail_node__10622);
        this__10621.root = new cljs.core.VectorNode(this__10621.root.edit, new_root_array__10624);
        this__10621.shift = new_shift__10625;
        this__10621.cnt = this__10621.cnt + 1;
        return tcoll
      }else {
        var new_root__10626 = cljs.core.tv_push_tail.call(null, tcoll, this__10621.shift, this__10621.root, tail_node__10622);
        this__10621.root = new_root__10626;
        this__10621.cnt = this__10621.cnt + 1;
        return tcoll
      }
    }
  }else {
    throw new Error("conj! after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__10627 = this;
  if(this__10627.root.edit) {
    this__10627.root.edit = null;
    var len__10628 = this__10627.cnt - cljs.core.tail_off.call(null, tcoll);
    var trimmed_tail__10629 = cljs.core.make_array.call(null, len__10628);
    cljs.core.array_copy.call(null, this__10627.tail, 0, trimmed_tail__10629, 0, len__10628);
    return new cljs.core.PersistentVector(null, this__10627.cnt, this__10627.shift, this__10627.root, trimmed_tail__10629, null)
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
  var this__10631 = this;
  var h__2192__auto____10632 = this__10631.__hash;
  if(!(h__2192__auto____10632 == null)) {
    return h__2192__auto____10632
  }else {
    var h__2192__auto____10633 = cljs.core.hash_coll.call(null, coll);
    this__10631.__hash = h__2192__auto____10633;
    return h__2192__auto____10633
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__10634 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentQueueSeq.prototype.toString = function() {
  var this__10635 = this;
  var this__10636 = this;
  return cljs.core.pr_str.call(null, this__10636)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10637 = this;
  return coll
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__10638 = this;
  return cljs.core._first.call(null, this__10638.front)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__10639 = this;
  var temp__3971__auto____10640 = cljs.core.next.call(null, this__10639.front);
  if(temp__3971__auto____10640) {
    var f1__10641 = temp__3971__auto____10640;
    return new cljs.core.PersistentQueueSeq(this__10639.meta, f1__10641, this__10639.rear, null)
  }else {
    if(this__10639.rear == null) {
      return coll.cljs$core$IEmptyableCollection$_empty$arity$1(coll)
    }else {
      return new cljs.core.PersistentQueueSeq(this__10639.meta, this__10639.rear, null, null)
    }
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10642 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10643 = this;
  return new cljs.core.PersistentQueueSeq(meta, this__10643.front, this__10643.rear, this__10643.__hash)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10644 = this;
  return this__10644.meta
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10645 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__10645.meta)
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
  var this__10646 = this;
  var h__2192__auto____10647 = this__10646.__hash;
  if(!(h__2192__auto____10647 == null)) {
    return h__2192__auto____10647
  }else {
    var h__2192__auto____10648 = cljs.core.hash_coll.call(null, coll);
    this__10646.__hash = h__2192__auto____10648;
    return h__2192__auto____10648
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__10649 = this;
  if(cljs.core.truth_(this__10649.front)) {
    return new cljs.core.PersistentQueue(this__10649.meta, this__10649.count + 1, this__10649.front, cljs.core.conj.call(null, function() {
      var or__3824__auto____10650 = this__10649.rear;
      if(cljs.core.truth_(or__3824__auto____10650)) {
        return or__3824__auto____10650
      }else {
        return cljs.core.PersistentVector.EMPTY
      }
    }(), o), null)
  }else {
    return new cljs.core.PersistentQueue(this__10649.meta, this__10649.count + 1, cljs.core.conj.call(null, this__10649.front, o), cljs.core.PersistentVector.EMPTY, null)
  }
};
cljs.core.PersistentQueue.prototype.toString = function() {
  var this__10651 = this;
  var this__10652 = this;
  return cljs.core.pr_str.call(null, this__10652)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10653 = this;
  var rear__10654 = cljs.core.seq.call(null, this__10653.rear);
  if(cljs.core.truth_(function() {
    var or__3824__auto____10655 = this__10653.front;
    if(cljs.core.truth_(or__3824__auto____10655)) {
      return or__3824__auto____10655
    }else {
      return rear__10654
    }
  }())) {
    return new cljs.core.PersistentQueueSeq(null, this__10653.front, cljs.core.seq.call(null, rear__10654), null)
  }else {
    return null
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10656 = this;
  return this__10656.count
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__10657 = this;
  return cljs.core._first.call(null, this__10657.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__10658 = this;
  if(cljs.core.truth_(this__10658.front)) {
    var temp__3971__auto____10659 = cljs.core.next.call(null, this__10658.front);
    if(temp__3971__auto____10659) {
      var f1__10660 = temp__3971__auto____10659;
      return new cljs.core.PersistentQueue(this__10658.meta, this__10658.count - 1, f1__10660, this__10658.rear, null)
    }else {
      return new cljs.core.PersistentQueue(this__10658.meta, this__10658.count - 1, cljs.core.seq.call(null, this__10658.rear), cljs.core.PersistentVector.EMPTY, null)
    }
  }else {
    return coll
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__10661 = this;
  return cljs.core.first.call(null, this__10661.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__10662 = this;
  return cljs.core.rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10663 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10664 = this;
  return new cljs.core.PersistentQueue(meta, this__10664.count, this__10664.front, this__10664.rear, this__10664.__hash)
};
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10665 = this;
  return this__10665.meta
};
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10666 = this;
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
  var this__10667 = this;
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
  var len__10670 = array.length;
  var i__10671 = 0;
  while(true) {
    if(i__10671 < len__10670) {
      if(k === array[i__10671]) {
        return i__10671
      }else {
        var G__10672 = i__10671 + incr;
        i__10671 = G__10672;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.obj_map_compare_keys = function obj_map_compare_keys(a, b) {
  var a__10675 = cljs.core.hash.call(null, a);
  var b__10676 = cljs.core.hash.call(null, b);
  if(a__10675 < b__10676) {
    return-1
  }else {
    if(a__10675 > b__10676) {
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
  var ks__10684 = m.keys;
  var len__10685 = ks__10684.length;
  var so__10686 = m.strobj;
  var out__10687 = cljs.core.with_meta.call(null, cljs.core.PersistentHashMap.EMPTY, cljs.core.meta.call(null, m));
  var i__10688 = 0;
  var out__10689 = cljs.core.transient$.call(null, out__10687);
  while(true) {
    if(i__10688 < len__10685) {
      var k__10690 = ks__10684[i__10688];
      var G__10691 = i__10688 + 1;
      var G__10692 = cljs.core.assoc_BANG_.call(null, out__10689, k__10690, so__10686[k__10690]);
      i__10688 = G__10691;
      out__10689 = G__10692;
      continue
    }else {
      return cljs.core.persistent_BANG_.call(null, cljs.core.assoc_BANG_.call(null, out__10689, k, v))
    }
    break
  }
};
cljs.core.obj_clone = function obj_clone(obj, ks) {
  var new_obj__10698 = {};
  var l__10699 = ks.length;
  var i__10700 = 0;
  while(true) {
    if(i__10700 < l__10699) {
      var k__10701 = ks[i__10700];
      new_obj__10698[k__10701] = obj[k__10701];
      var G__10702 = i__10700 + 1;
      i__10700 = G__10702;
      continue
    }else {
    }
    break
  }
  return new_obj__10698
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
  var this__10705 = this;
  return cljs.core.transient$.call(null, cljs.core.into.call(null, cljs.core.hash_map.call(null), coll))
};
cljs.core.ObjMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__10706 = this;
  var h__2192__auto____10707 = this__10706.__hash;
  if(!(h__2192__auto____10707 == null)) {
    return h__2192__auto____10707
  }else {
    var h__2192__auto____10708 = cljs.core.hash_imap.call(null, coll);
    this__10706.__hash = h__2192__auto____10708;
    return h__2192__auto____10708
  }
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10709 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10710 = this;
  if(function() {
    var and__3822__auto____10711 = goog.isString(k);
    if(and__3822__auto____10711) {
      return!(cljs.core.scan_array.call(null, 1, k, this__10710.keys) == null)
    }else {
      return and__3822__auto____10711
    }
  }()) {
    return this__10710.strobj[k]
  }else {
    return not_found
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__10712 = this;
  if(goog.isString(k)) {
    if(function() {
      var or__3824__auto____10713 = this__10712.update_count > cljs.core.ObjMap.HASHMAP_THRESHOLD;
      if(or__3824__auto____10713) {
        return or__3824__auto____10713
      }else {
        return this__10712.keys.length >= cljs.core.ObjMap.HASHMAP_THRESHOLD
      }
    }()) {
      return cljs.core.obj_map__GT_hash_map.call(null, coll, k, v)
    }else {
      if(!(cljs.core.scan_array.call(null, 1, k, this__10712.keys) == null)) {
        var new_strobj__10714 = cljs.core.obj_clone.call(null, this__10712.strobj, this__10712.keys);
        new_strobj__10714[k] = v;
        return new cljs.core.ObjMap(this__10712.meta, this__10712.keys, new_strobj__10714, this__10712.update_count + 1, null)
      }else {
        var new_strobj__10715 = cljs.core.obj_clone.call(null, this__10712.strobj, this__10712.keys);
        var new_keys__10716 = this__10712.keys.slice();
        new_strobj__10715[k] = v;
        new_keys__10716.push(k);
        return new cljs.core.ObjMap(this__10712.meta, new_keys__10716, new_strobj__10715, this__10712.update_count + 1, null)
      }
    }
  }else {
    return cljs.core.obj_map__GT_hash_map.call(null, coll, k, v)
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__10717 = this;
  if(function() {
    var and__3822__auto____10718 = goog.isString(k);
    if(and__3822__auto____10718) {
      return!(cljs.core.scan_array.call(null, 1, k, this__10717.keys) == null)
    }else {
      return and__3822__auto____10718
    }
  }()) {
    return true
  }else {
    return false
  }
};
cljs.core.ObjMap.prototype.call = function() {
  var G__10740 = null;
  var G__10740__2 = function(this_sym10719, k) {
    var this__10721 = this;
    var this_sym10719__10722 = this;
    var coll__10723 = this_sym10719__10722;
    return coll__10723.cljs$core$ILookup$_lookup$arity$2(coll__10723, k)
  };
  var G__10740__3 = function(this_sym10720, k, not_found) {
    var this__10721 = this;
    var this_sym10720__10724 = this;
    var coll__10725 = this_sym10720__10724;
    return coll__10725.cljs$core$ILookup$_lookup$arity$3(coll__10725, k, not_found)
  };
  G__10740 = function(this_sym10720, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10740__2.call(this, this_sym10720, k);
      case 3:
        return G__10740__3.call(this, this_sym10720, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10740
}();
cljs.core.ObjMap.prototype.apply = function(this_sym10703, args10704) {
  var this__10726 = this;
  return this_sym10703.call.apply(this_sym10703, [this_sym10703].concat(args10704.slice()))
};
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__10727 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.ObjMap.prototype.toString = function() {
  var this__10728 = this;
  var this__10729 = this;
  return cljs.core.pr_str.call(null, this__10729)
};
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10730 = this;
  if(this__10730.keys.length > 0) {
    return cljs.core.map.call(null, function(p1__10693_SHARP_) {
      return cljs.core.vector.call(null, p1__10693_SHARP_, this__10730.strobj[p1__10693_SHARP_])
    }, this__10730.keys.sort(cljs.core.obj_map_compare_keys))
  }else {
    return null
  }
};
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10731 = this;
  return this__10731.keys.length
};
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10732 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10733 = this;
  return new cljs.core.ObjMap(meta, this__10733.keys, this__10733.strobj, this__10733.update_count, this__10733.__hash)
};
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10734 = this;
  return this__10734.meta
};
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10735 = this;
  return cljs.core.with_meta.call(null, cljs.core.ObjMap.EMPTY, this__10735.meta)
};
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__10736 = this;
  if(function() {
    var and__3822__auto____10737 = goog.isString(k);
    if(and__3822__auto____10737) {
      return!(cljs.core.scan_array.call(null, 1, k, this__10736.keys) == null)
    }else {
      return and__3822__auto____10737
    }
  }()) {
    var new_keys__10738 = this__10736.keys.slice();
    var new_strobj__10739 = cljs.core.obj_clone.call(null, this__10736.strobj, this__10736.keys);
    new_keys__10738.splice(cljs.core.scan_array.call(null, 1, k, new_keys__10738), 1);
    cljs.core.js_delete.call(null, new_strobj__10739, k);
    return new cljs.core.ObjMap(this__10736.meta, new_keys__10738, new_strobj__10739, this__10736.update_count + 1, null)
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
  var this__10744 = this;
  var h__2192__auto____10745 = this__10744.__hash;
  if(!(h__2192__auto____10745 == null)) {
    return h__2192__auto____10745
  }else {
    var h__2192__auto____10746 = cljs.core.hash_imap.call(null, coll);
    this__10744.__hash = h__2192__auto____10746;
    return h__2192__auto____10746
  }
};
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10747 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10748 = this;
  var bucket__10749 = this__10748.hashobj[cljs.core.hash.call(null, k)];
  var i__10750 = cljs.core.truth_(bucket__10749) ? cljs.core.scan_array.call(null, 2, k, bucket__10749) : null;
  if(cljs.core.truth_(i__10750)) {
    return bucket__10749[i__10750 + 1]
  }else {
    return not_found
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__10751 = this;
  var h__10752 = cljs.core.hash.call(null, k);
  var bucket__10753 = this__10751.hashobj[h__10752];
  if(cljs.core.truth_(bucket__10753)) {
    var new_bucket__10754 = bucket__10753.slice();
    var new_hashobj__10755 = goog.object.clone(this__10751.hashobj);
    new_hashobj__10755[h__10752] = new_bucket__10754;
    var temp__3971__auto____10756 = cljs.core.scan_array.call(null, 2, k, new_bucket__10754);
    if(cljs.core.truth_(temp__3971__auto____10756)) {
      var i__10757 = temp__3971__auto____10756;
      new_bucket__10754[i__10757 + 1] = v;
      return new cljs.core.HashMap(this__10751.meta, this__10751.count, new_hashobj__10755, null)
    }else {
      new_bucket__10754.push(k, v);
      return new cljs.core.HashMap(this__10751.meta, this__10751.count + 1, new_hashobj__10755, null)
    }
  }else {
    var new_hashobj__10758 = goog.object.clone(this__10751.hashobj);
    new_hashobj__10758[h__10752] = [k, v];
    return new cljs.core.HashMap(this__10751.meta, this__10751.count + 1, new_hashobj__10758, null)
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__10759 = this;
  var bucket__10760 = this__10759.hashobj[cljs.core.hash.call(null, k)];
  var i__10761 = cljs.core.truth_(bucket__10760) ? cljs.core.scan_array.call(null, 2, k, bucket__10760) : null;
  if(cljs.core.truth_(i__10761)) {
    return true
  }else {
    return false
  }
};
cljs.core.HashMap.prototype.call = function() {
  var G__10786 = null;
  var G__10786__2 = function(this_sym10762, k) {
    var this__10764 = this;
    var this_sym10762__10765 = this;
    var coll__10766 = this_sym10762__10765;
    return coll__10766.cljs$core$ILookup$_lookup$arity$2(coll__10766, k)
  };
  var G__10786__3 = function(this_sym10763, k, not_found) {
    var this__10764 = this;
    var this_sym10763__10767 = this;
    var coll__10768 = this_sym10763__10767;
    return coll__10768.cljs$core$ILookup$_lookup$arity$3(coll__10768, k, not_found)
  };
  G__10786 = function(this_sym10763, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10786__2.call(this, this_sym10763, k);
      case 3:
        return G__10786__3.call(this, this_sym10763, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10786
}();
cljs.core.HashMap.prototype.apply = function(this_sym10742, args10743) {
  var this__10769 = this;
  return this_sym10742.call.apply(this_sym10742, [this_sym10742].concat(args10743.slice()))
};
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__10770 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.HashMap.prototype.toString = function() {
  var this__10771 = this;
  var this__10772 = this;
  return cljs.core.pr_str.call(null, this__10772)
};
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10773 = this;
  if(this__10773.count > 0) {
    var hashes__10774 = cljs.core.js_keys.call(null, this__10773.hashobj).sort();
    return cljs.core.mapcat.call(null, function(p1__10741_SHARP_) {
      return cljs.core.map.call(null, cljs.core.vec, cljs.core.partition.call(null, 2, this__10773.hashobj[p1__10741_SHARP_]))
    }, hashes__10774)
  }else {
    return null
  }
};
cljs.core.HashMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10775 = this;
  return this__10775.count
};
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10776 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10777 = this;
  return new cljs.core.HashMap(meta, this__10777.count, this__10777.hashobj, this__10777.__hash)
};
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10778 = this;
  return this__10778.meta
};
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10779 = this;
  return cljs.core.with_meta.call(null, cljs.core.HashMap.EMPTY, this__10779.meta)
};
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__10780 = this;
  var h__10781 = cljs.core.hash.call(null, k);
  var bucket__10782 = this__10780.hashobj[h__10781];
  var i__10783 = cljs.core.truth_(bucket__10782) ? cljs.core.scan_array.call(null, 2, k, bucket__10782) : null;
  if(cljs.core.not.call(null, i__10783)) {
    return coll
  }else {
    var new_hashobj__10784 = goog.object.clone(this__10780.hashobj);
    if(3 > bucket__10782.length) {
      cljs.core.js_delete.call(null, new_hashobj__10784, h__10781)
    }else {
      var new_bucket__10785 = bucket__10782.slice();
      new_bucket__10785.splice(i__10783, 2);
      new_hashobj__10784[h__10781] = new_bucket__10785
    }
    return new cljs.core.HashMap(this__10780.meta, this__10780.count - 1, new_hashobj__10784, null)
  }
};
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = new cljs.core.HashMap(null, 0, {}, 0);
cljs.core.HashMap.fromArrays = function(ks, vs) {
  var len__10787 = ks.length;
  var i__10788 = 0;
  var out__10789 = cljs.core.HashMap.EMPTY;
  while(true) {
    if(i__10788 < len__10787) {
      var G__10790 = i__10788 + 1;
      var G__10791 = cljs.core.assoc.call(null, out__10789, ks[i__10788], vs[i__10788]);
      i__10788 = G__10790;
      out__10789 = G__10791;
      continue
    }else {
      return out__10789
    }
    break
  }
};
cljs.core.array_map_index_of = function array_map_index_of(m, k) {
  var arr__10795 = m.arr;
  var len__10796 = arr__10795.length;
  var i__10797 = 0;
  while(true) {
    if(len__10796 <= i__10797) {
      return-1
    }else {
      if(cljs.core._EQ_.call(null, arr__10795[i__10797], k)) {
        return i__10797
      }else {
        if("\ufdd0'else") {
          var G__10798 = i__10797 + 2;
          i__10797 = G__10798;
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
  var this__10801 = this;
  return new cljs.core.TransientArrayMap({}, this__10801.arr.length, this__10801.arr.slice())
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__10802 = this;
  var h__2192__auto____10803 = this__10802.__hash;
  if(!(h__2192__auto____10803 == null)) {
    return h__2192__auto____10803
  }else {
    var h__2192__auto____10804 = cljs.core.hash_imap.call(null, coll);
    this__10802.__hash = h__2192__auto____10804;
    return h__2192__auto____10804
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__10805 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__10806 = this;
  var idx__10807 = cljs.core.array_map_index_of.call(null, coll, k);
  if(idx__10807 === -1) {
    return not_found
  }else {
    return this__10806.arr[idx__10807 + 1]
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__10808 = this;
  var idx__10809 = cljs.core.array_map_index_of.call(null, coll, k);
  if(idx__10809 === -1) {
    if(this__10808.cnt < cljs.core.PersistentArrayMap.HASHMAP_THRESHOLD) {
      return new cljs.core.PersistentArrayMap(this__10808.meta, this__10808.cnt + 1, function() {
        var G__10810__10811 = this__10808.arr.slice();
        G__10810__10811.push(k);
        G__10810__10811.push(v);
        return G__10810__10811
      }(), null)
    }else {
      return cljs.core.persistent_BANG_.call(null, cljs.core.assoc_BANG_.call(null, cljs.core.transient$.call(null, cljs.core.into.call(null, cljs.core.PersistentHashMap.EMPTY, coll)), k, v))
    }
  }else {
    if(v === this__10808.arr[idx__10809 + 1]) {
      return coll
    }else {
      if("\ufdd0'else") {
        return new cljs.core.PersistentArrayMap(this__10808.meta, this__10808.cnt, function() {
          var G__10812__10813 = this__10808.arr.slice();
          G__10812__10813[idx__10809 + 1] = v;
          return G__10812__10813
        }(), null)
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__10814 = this;
  return!(cljs.core.array_map_index_of.call(null, coll, k) === -1)
};
cljs.core.PersistentArrayMap.prototype.call = function() {
  var G__10846 = null;
  var G__10846__2 = function(this_sym10815, k) {
    var this__10817 = this;
    var this_sym10815__10818 = this;
    var coll__10819 = this_sym10815__10818;
    return coll__10819.cljs$core$ILookup$_lookup$arity$2(coll__10819, k)
  };
  var G__10846__3 = function(this_sym10816, k, not_found) {
    var this__10817 = this;
    var this_sym10816__10820 = this;
    var coll__10821 = this_sym10816__10820;
    return coll__10821.cljs$core$ILookup$_lookup$arity$3(coll__10821, k, not_found)
  };
  G__10846 = function(this_sym10816, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10846__2.call(this, this_sym10816, k);
      case 3:
        return G__10846__3.call(this, this_sym10816, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10846
}();
cljs.core.PersistentArrayMap.prototype.apply = function(this_sym10799, args10800) {
  var this__10822 = this;
  return this_sym10799.call.apply(this_sym10799, [this_sym10799].concat(args10800.slice()))
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(coll, f, init) {
  var this__10823 = this;
  var len__10824 = this__10823.arr.length;
  var i__10825 = 0;
  var init__10826 = init;
  while(true) {
    if(i__10825 < len__10824) {
      var init__10827 = f.call(null, init__10826, this__10823.arr[i__10825], this__10823.arr[i__10825 + 1]);
      if(cljs.core.reduced_QMARK_.call(null, init__10827)) {
        return cljs.core.deref.call(null, init__10827)
      }else {
        var G__10847 = i__10825 + 2;
        var G__10848 = init__10827;
        i__10825 = G__10847;
        init__10826 = G__10848;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__10828 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.PersistentArrayMap.prototype.toString = function() {
  var this__10829 = this;
  var this__10830 = this;
  return cljs.core.pr_str.call(null, this__10830)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__10831 = this;
  if(this__10831.cnt > 0) {
    var len__10832 = this__10831.arr.length;
    var array_map_seq__10833 = function array_map_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(i < len__10832) {
          return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([this__10831.arr[i], this__10831.arr[i + 1]], true), array_map_seq.call(null, i + 2))
        }else {
          return null
        }
      }, null)
    };
    return array_map_seq__10833.call(null, 0)
  }else {
    return null
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__10834 = this;
  return this__10834.cnt
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__10835 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__10836 = this;
  return new cljs.core.PersistentArrayMap(meta, this__10836.cnt, this__10836.arr, this__10836.__hash)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__10837 = this;
  return this__10837.meta
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__10838 = this;
  return cljs.core._with_meta.call(null, cljs.core.PersistentArrayMap.EMPTY, this__10838.meta)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__10839 = this;
  var idx__10840 = cljs.core.array_map_index_of.call(null, coll, k);
  if(idx__10840 >= 0) {
    var len__10841 = this__10839.arr.length;
    var new_len__10842 = len__10841 - 2;
    if(new_len__10842 === 0) {
      return coll.cljs$core$IEmptyableCollection$_empty$arity$1(coll)
    }else {
      var new_arr__10843 = cljs.core.make_array.call(null, new_len__10842);
      var s__10844 = 0;
      var d__10845 = 0;
      while(true) {
        if(s__10844 >= len__10841) {
          return new cljs.core.PersistentArrayMap(this__10839.meta, this__10839.cnt - 1, new_arr__10843, null)
        }else {
          if(cljs.core._EQ_.call(null, k, this__10839.arr[s__10844])) {
            var G__10849 = s__10844 + 2;
            var G__10850 = d__10845;
            s__10844 = G__10849;
            d__10845 = G__10850;
            continue
          }else {
            if("\ufdd0'else") {
              new_arr__10843[d__10845] = this__10839.arr[s__10844];
              new_arr__10843[d__10845 + 1] = this__10839.arr[s__10844 + 1];
              var G__10851 = s__10844 + 2;
              var G__10852 = d__10845 + 2;
              s__10844 = G__10851;
              d__10845 = G__10852;
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
  var len__10853 = cljs.core.count.call(null, ks);
  var i__10854 = 0;
  var out__10855 = cljs.core.transient$.call(null, cljs.core.PersistentArrayMap.EMPTY);
  while(true) {
    if(i__10854 < len__10853) {
      var G__10856 = i__10854 + 1;
      var G__10857 = cljs.core.assoc_BANG_.call(null, out__10855, ks[i__10854], vs[i__10854]);
      i__10854 = G__10856;
      out__10855 = G__10857;
      continue
    }else {
      return cljs.core.persistent_BANG_.call(null, out__10855)
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
  var this__10858 = this;
  if(cljs.core.truth_(this__10858.editable_QMARK_)) {
    var idx__10859 = cljs.core.array_map_index_of.call(null, tcoll, key);
    if(idx__10859 >= 0) {
      this__10858.arr[idx__10859] = this__10858.arr[this__10858.len - 2];
      this__10858.arr[idx__10859 + 1] = this__10858.arr[this__10858.len - 1];
      var G__10860__10861 = this__10858.arr;
      G__10860__10861.pop();
      G__10860__10861.pop();
      G__10860__10861;
      this__10858.len = this__10858.len - 2
    }else {
    }
    return tcoll
  }else {
    throw new Error("dissoc! after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3 = function(tcoll, key, val) {
  var this__10862 = this;
  if(cljs.core.truth_(this__10862.editable_QMARK_)) {
    var idx__10863 = cljs.core.array_map_index_of.call(null, tcoll, key);
    if(idx__10863 === -1) {
      if(this__10862.len + 2 <= 2 * cljs.core.PersistentArrayMap.HASHMAP_THRESHOLD) {
        this__10862.len = this__10862.len + 2;
        this__10862.arr.push(key);
        this__10862.arr.push(val);
        return tcoll
      }else {
        return cljs.core.assoc_BANG_.call(null, cljs.core.array__GT_transient_hash_map.call(null, this__10862.len, this__10862.arr), key, val)
      }
    }else {
      if(val === this__10862.arr[idx__10863 + 1]) {
        return tcoll
      }else {
        this__10862.arr[idx__10863 + 1] = val;
        return tcoll
      }
    }
  }else {
    throw new Error("assoc! after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, o) {
  var this__10864 = this;
  if(cljs.core.truth_(this__10864.editable_QMARK_)) {
    if(function() {
      var G__10865__10866 = o;
      if(G__10865__10866) {
        if(function() {
          var or__3824__auto____10867 = G__10865__10866.cljs$lang$protocol_mask$partition0$ & 2048;
          if(or__3824__auto____10867) {
            return or__3824__auto____10867
          }else {
            return G__10865__10866.cljs$core$IMapEntry$
          }
        }()) {
          return true
        }else {
          if(!G__10865__10866.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.IMapEntry, G__10865__10866)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.IMapEntry, G__10865__10866)
      }
    }()) {
      return tcoll.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3(tcoll, cljs.core.key.call(null, o), cljs.core.val.call(null, o))
    }else {
      var es__10868 = cljs.core.seq.call(null, o);
      var tcoll__10869 = tcoll;
      while(true) {
        var temp__3971__auto____10870 = cljs.core.first.call(null, es__10868);
        if(cljs.core.truth_(temp__3971__auto____10870)) {
          var e__10871 = temp__3971__auto____10870;
          var G__10877 = cljs.core.next.call(null, es__10868);
          var G__10878 = tcoll__10869.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3(tcoll__10869, cljs.core.key.call(null, e__10871), cljs.core.val.call(null, e__10871));
          es__10868 = G__10877;
          tcoll__10869 = G__10878;
          continue
        }else {
          return tcoll__10869
        }
        break
      }
    }
  }else {
    throw new Error("conj! after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__10872 = this;
  if(cljs.core.truth_(this__10872.editable_QMARK_)) {
    this__10872.editable_QMARK_ = false;
    return new cljs.core.PersistentArrayMap(null, cljs.core.quot.call(null, this__10872.len, 2), this__10872.arr, null)
  }else {
    throw new Error("persistent! called twice");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(tcoll, k) {
  var this__10873 = this;
  return tcoll.cljs$core$ILookup$_lookup$arity$3(tcoll, k, null)
};
cljs.core.TransientArrayMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(tcoll, k, not_found) {
  var this__10874 = this;
  if(cljs.core.truth_(this__10874.editable_QMARK_)) {
    var idx__10875 = cljs.core.array_map_index_of.call(null, tcoll, k);
    if(idx__10875 === -1) {
      return not_found
    }else {
      return this__10874.arr[idx__10875 + 1]
    }
  }else {
    throw new Error("lookup after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ICounted$_count$arity$1 = function(tcoll) {
  var this__10876 = this;
  if(cljs.core.truth_(this__10876.editable_QMARK_)) {
    return cljs.core.quot.call(null, this__10876.len, 2)
  }else {
    throw new Error("count after persistent!");
  }
};
cljs.core.TransientArrayMap;
cljs.core.array__GT_transient_hash_map = function array__GT_transient_hash_map(len, arr) {
  var out__10881 = cljs.core.transient$.call(null, cljs.core.ObjMap.EMPTY);
  var i__10882 = 0;
  while(true) {
    if(i__10882 < len) {
      var G__10883 = cljs.core.assoc_BANG_.call(null, out__10881, arr[i__10882], arr[i__10882 + 1]);
      var G__10884 = i__10882 + 2;
      out__10881 = G__10883;
      i__10882 = G__10884;
      continue
    }else {
      return out__10881
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
    var G__10889__10890 = arr.slice();
    G__10889__10890[i] = a;
    return G__10889__10890
  };
  var clone_and_set__5 = function(arr, i, a, j, b) {
    var G__10891__10892 = arr.slice();
    G__10891__10892[i] = a;
    G__10891__10892[j] = b;
    return G__10891__10892
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
  var new_arr__10894 = cljs.core.make_array.call(null, arr.length - 2);
  cljs.core.array_copy.call(null, arr, 0, new_arr__10894, 0, 2 * i);
  cljs.core.array_copy.call(null, arr, 2 * (i + 1), new_arr__10894, 2 * i, new_arr__10894.length - 2 * i);
  return new_arr__10894
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
    var editable__10897 = inode.ensure_editable(edit);
    editable__10897.arr[i] = a;
    return editable__10897
  };
  var edit_and_set__6 = function(inode, edit, i, a, j, b) {
    var editable__10898 = inode.ensure_editable(edit);
    editable__10898.arr[i] = a;
    editable__10898.arr[j] = b;
    return editable__10898
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
  var len__10905 = arr.length;
  var i__10906 = 0;
  var init__10907 = init;
  while(true) {
    if(i__10906 < len__10905) {
      var init__10910 = function() {
        var k__10908 = arr[i__10906];
        if(!(k__10908 == null)) {
          return f.call(null, init__10907, k__10908, arr[i__10906 + 1])
        }else {
          var node__10909 = arr[i__10906 + 1];
          if(!(node__10909 == null)) {
            return node__10909.kv_reduce(f, init__10907)
          }else {
            return init__10907
          }
        }
      }();
      if(cljs.core.reduced_QMARK_.call(null, init__10910)) {
        return cljs.core.deref.call(null, init__10910)
      }else {
        var G__10911 = i__10906 + 2;
        var G__10912 = init__10910;
        i__10906 = G__10911;
        init__10907 = G__10912;
        continue
      }
    }else {
      return init__10907
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
  var this__10913 = this;
  var inode__10914 = this;
  if(this__10913.bitmap === bit) {
    return null
  }else {
    var editable__10915 = inode__10914.ensure_editable(e);
    var earr__10916 = editable__10915.arr;
    var len__10917 = earr__10916.length;
    editable__10915.bitmap = bit ^ editable__10915.bitmap;
    cljs.core.array_copy.call(null, earr__10916, 2 * (i + 1), earr__10916, 2 * i, len__10917 - 2 * (i + 1));
    earr__10916[len__10917 - 2] = null;
    earr__10916[len__10917 - 1] = null;
    return editable__10915
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_assoc_BANG_ = function(edit, shift, hash, key, val, added_leaf_QMARK_) {
  var this__10918 = this;
  var inode__10919 = this;
  var bit__10920 = 1 << (hash >>> shift & 31);
  var idx__10921 = cljs.core.bitmap_indexed_node_index.call(null, this__10918.bitmap, bit__10920);
  if((this__10918.bitmap & bit__10920) === 0) {
    var n__10922 = cljs.core.bit_count.call(null, this__10918.bitmap);
    if(2 * n__10922 < this__10918.arr.length) {
      var editable__10923 = inode__10919.ensure_editable(edit);
      var earr__10924 = editable__10923.arr;
      added_leaf_QMARK_.val = true;
      cljs.core.array_copy_downward.call(null, earr__10924, 2 * idx__10921, earr__10924, 2 * (idx__10921 + 1), 2 * (n__10922 - idx__10921));
      earr__10924[2 * idx__10921] = key;
      earr__10924[2 * idx__10921 + 1] = val;
      editable__10923.bitmap = editable__10923.bitmap | bit__10920;
      return editable__10923
    }else {
      if(n__10922 >= 16) {
        var nodes__10925 = cljs.core.make_array.call(null, 32);
        var jdx__10926 = hash >>> shift & 31;
        nodes__10925[jdx__10926] = cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_);
        var i__10927 = 0;
        var j__10928 = 0;
        while(true) {
          if(i__10927 < 32) {
            if((this__10918.bitmap >>> i__10927 & 1) === 0) {
              var G__10981 = i__10927 + 1;
              var G__10982 = j__10928;
              i__10927 = G__10981;
              j__10928 = G__10982;
              continue
            }else {
              nodes__10925[i__10927] = !(this__10918.arr[j__10928] == null) ? cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift + 5, cljs.core.hash.call(null, this__10918.arr[j__10928]), this__10918.arr[j__10928], this__10918.arr[j__10928 + 1], added_leaf_QMARK_) : this__10918.arr[j__10928 + 1];
              var G__10983 = i__10927 + 1;
              var G__10984 = j__10928 + 2;
              i__10927 = G__10983;
              j__10928 = G__10984;
              continue
            }
          }else {
          }
          break
        }
        return new cljs.core.ArrayNode(edit, n__10922 + 1, nodes__10925)
      }else {
        if("\ufdd0'else") {
          var new_arr__10929 = cljs.core.make_array.call(null, 2 * (n__10922 + 4));
          cljs.core.array_copy.call(null, this__10918.arr, 0, new_arr__10929, 0, 2 * idx__10921);
          new_arr__10929[2 * idx__10921] = key;
          new_arr__10929[2 * idx__10921 + 1] = val;
          cljs.core.array_copy.call(null, this__10918.arr, 2 * idx__10921, new_arr__10929, 2 * (idx__10921 + 1), 2 * (n__10922 - idx__10921));
          added_leaf_QMARK_.val = true;
          var editable__10930 = inode__10919.ensure_editable(edit);
          editable__10930.arr = new_arr__10929;
          editable__10930.bitmap = editable__10930.bitmap | bit__10920;
          return editable__10930
        }else {
          return null
        }
      }
    }
  }else {
    var key_or_nil__10931 = this__10918.arr[2 * idx__10921];
    var val_or_node__10932 = this__10918.arr[2 * idx__10921 + 1];
    if(key_or_nil__10931 == null) {
      var n__10933 = val_or_node__10932.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_);
      if(n__10933 === val_or_node__10932) {
        return inode__10919
      }else {
        return cljs.core.edit_and_set.call(null, inode__10919, edit, 2 * idx__10921 + 1, n__10933)
      }
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__10931)) {
        if(val === val_or_node__10932) {
          return inode__10919
        }else {
          return cljs.core.edit_and_set.call(null, inode__10919, edit, 2 * idx__10921 + 1, val)
        }
      }else {
        if("\ufdd0'else") {
          added_leaf_QMARK_.val = true;
          return cljs.core.edit_and_set.call(null, inode__10919, edit, 2 * idx__10921, null, 2 * idx__10921 + 1, cljs.core.create_node.call(null, edit, shift + 5, key_or_nil__10931, val_or_node__10932, hash, key, val))
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_seq = function() {
  var this__10934 = this;
  var inode__10935 = this;
  return cljs.core.create_inode_seq.call(null, this__10934.arr)
};
cljs.core.BitmapIndexedNode.prototype.inode_without_BANG_ = function(edit, shift, hash, key, removed_leaf_QMARK_) {
  var this__10936 = this;
  var inode__10937 = this;
  var bit__10938 = 1 << (hash >>> shift & 31);
  if((this__10936.bitmap & bit__10938) === 0) {
    return inode__10937
  }else {
    var idx__10939 = cljs.core.bitmap_indexed_node_index.call(null, this__10936.bitmap, bit__10938);
    var key_or_nil__10940 = this__10936.arr[2 * idx__10939];
    var val_or_node__10941 = this__10936.arr[2 * idx__10939 + 1];
    if(key_or_nil__10940 == null) {
      var n__10942 = val_or_node__10941.inode_without_BANG_(edit, shift + 5, hash, key, removed_leaf_QMARK_);
      if(n__10942 === val_or_node__10941) {
        return inode__10937
      }else {
        if(!(n__10942 == null)) {
          return cljs.core.edit_and_set.call(null, inode__10937, edit, 2 * idx__10939 + 1, n__10942)
        }else {
          if(this__10936.bitmap === bit__10938) {
            return null
          }else {
            if("\ufdd0'else") {
              return inode__10937.edit_and_remove_pair(edit, bit__10938, idx__10939)
            }else {
              return null
            }
          }
        }
      }
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__10940)) {
        removed_leaf_QMARK_[0] = true;
        return inode__10937.edit_and_remove_pair(edit, bit__10938, idx__10939)
      }else {
        if("\ufdd0'else") {
          return inode__10937
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.ensure_editable = function(e) {
  var this__10943 = this;
  var inode__10944 = this;
  if(e === this__10943.edit) {
    return inode__10944
  }else {
    var n__10945 = cljs.core.bit_count.call(null, this__10943.bitmap);
    var new_arr__10946 = cljs.core.make_array.call(null, n__10945 < 0 ? 4 : 2 * (n__10945 + 1));
    cljs.core.array_copy.call(null, this__10943.arr, 0, new_arr__10946, 0, 2 * n__10945);
    return new cljs.core.BitmapIndexedNode(e, this__10943.bitmap, new_arr__10946)
  }
};
cljs.core.BitmapIndexedNode.prototype.kv_reduce = function(f, init) {
  var this__10947 = this;
  var inode__10948 = this;
  return cljs.core.inode_kv_reduce.call(null, this__10947.arr, f, init)
};
cljs.core.BitmapIndexedNode.prototype.inode_find = function(shift, hash, key, not_found) {
  var this__10949 = this;
  var inode__10950 = this;
  var bit__10951 = 1 << (hash >>> shift & 31);
  if((this__10949.bitmap & bit__10951) === 0) {
    return not_found
  }else {
    var idx__10952 = cljs.core.bitmap_indexed_node_index.call(null, this__10949.bitmap, bit__10951);
    var key_or_nil__10953 = this__10949.arr[2 * idx__10952];
    var val_or_node__10954 = this__10949.arr[2 * idx__10952 + 1];
    if(key_or_nil__10953 == null) {
      return val_or_node__10954.inode_find(shift + 5, hash, key, not_found)
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__10953)) {
        return cljs.core.PersistentVector.fromArray([key_or_nil__10953, val_or_node__10954], true)
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
  var this__10955 = this;
  var inode__10956 = this;
  var bit__10957 = 1 << (hash >>> shift & 31);
  if((this__10955.bitmap & bit__10957) === 0) {
    return inode__10956
  }else {
    var idx__10958 = cljs.core.bitmap_indexed_node_index.call(null, this__10955.bitmap, bit__10957);
    var key_or_nil__10959 = this__10955.arr[2 * idx__10958];
    var val_or_node__10960 = this__10955.arr[2 * idx__10958 + 1];
    if(key_or_nil__10959 == null) {
      var n__10961 = val_or_node__10960.inode_without(shift + 5, hash, key);
      if(n__10961 === val_or_node__10960) {
        return inode__10956
      }else {
        if(!(n__10961 == null)) {
          return new cljs.core.BitmapIndexedNode(null, this__10955.bitmap, cljs.core.clone_and_set.call(null, this__10955.arr, 2 * idx__10958 + 1, n__10961))
        }else {
          if(this__10955.bitmap === bit__10957) {
            return null
          }else {
            if("\ufdd0'else") {
              return new cljs.core.BitmapIndexedNode(null, this__10955.bitmap ^ bit__10957, cljs.core.remove_pair.call(null, this__10955.arr, idx__10958))
            }else {
              return null
            }
          }
        }
      }
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__10959)) {
        return new cljs.core.BitmapIndexedNode(null, this__10955.bitmap ^ bit__10957, cljs.core.remove_pair.call(null, this__10955.arr, idx__10958))
      }else {
        if("\ufdd0'else") {
          return inode__10956
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_assoc = function(shift, hash, key, val, added_leaf_QMARK_) {
  var this__10962 = this;
  var inode__10963 = this;
  var bit__10964 = 1 << (hash >>> shift & 31);
  var idx__10965 = cljs.core.bitmap_indexed_node_index.call(null, this__10962.bitmap, bit__10964);
  if((this__10962.bitmap & bit__10964) === 0) {
    var n__10966 = cljs.core.bit_count.call(null, this__10962.bitmap);
    if(n__10966 >= 16) {
      var nodes__10967 = cljs.core.make_array.call(null, 32);
      var jdx__10968 = hash >>> shift & 31;
      nodes__10967[jdx__10968] = cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_);
      var i__10969 = 0;
      var j__10970 = 0;
      while(true) {
        if(i__10969 < 32) {
          if((this__10962.bitmap >>> i__10969 & 1) === 0) {
            var G__10985 = i__10969 + 1;
            var G__10986 = j__10970;
            i__10969 = G__10985;
            j__10970 = G__10986;
            continue
          }else {
            nodes__10967[i__10969] = !(this__10962.arr[j__10970] == null) ? cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift + 5, cljs.core.hash.call(null, this__10962.arr[j__10970]), this__10962.arr[j__10970], this__10962.arr[j__10970 + 1], added_leaf_QMARK_) : this__10962.arr[j__10970 + 1];
            var G__10987 = i__10969 + 1;
            var G__10988 = j__10970 + 2;
            i__10969 = G__10987;
            j__10970 = G__10988;
            continue
          }
        }else {
        }
        break
      }
      return new cljs.core.ArrayNode(null, n__10966 + 1, nodes__10967)
    }else {
      var new_arr__10971 = cljs.core.make_array.call(null, 2 * (n__10966 + 1));
      cljs.core.array_copy.call(null, this__10962.arr, 0, new_arr__10971, 0, 2 * idx__10965);
      new_arr__10971[2 * idx__10965] = key;
      new_arr__10971[2 * idx__10965 + 1] = val;
      cljs.core.array_copy.call(null, this__10962.arr, 2 * idx__10965, new_arr__10971, 2 * (idx__10965 + 1), 2 * (n__10966 - idx__10965));
      added_leaf_QMARK_.val = true;
      return new cljs.core.BitmapIndexedNode(null, this__10962.bitmap | bit__10964, new_arr__10971)
    }
  }else {
    var key_or_nil__10972 = this__10962.arr[2 * idx__10965];
    var val_or_node__10973 = this__10962.arr[2 * idx__10965 + 1];
    if(key_or_nil__10972 == null) {
      var n__10974 = val_or_node__10973.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_);
      if(n__10974 === val_or_node__10973) {
        return inode__10963
      }else {
        return new cljs.core.BitmapIndexedNode(null, this__10962.bitmap, cljs.core.clone_and_set.call(null, this__10962.arr, 2 * idx__10965 + 1, n__10974))
      }
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__10972)) {
        if(val === val_or_node__10973) {
          return inode__10963
        }else {
          return new cljs.core.BitmapIndexedNode(null, this__10962.bitmap, cljs.core.clone_and_set.call(null, this__10962.arr, 2 * idx__10965 + 1, val))
        }
      }else {
        if("\ufdd0'else") {
          added_leaf_QMARK_.val = true;
          return new cljs.core.BitmapIndexedNode(null, this__10962.bitmap, cljs.core.clone_and_set.call(null, this__10962.arr, 2 * idx__10965, null, 2 * idx__10965 + 1, cljs.core.create_node.call(null, shift + 5, key_or_nil__10972, val_or_node__10973, hash, key, val)))
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_lookup = function(shift, hash, key, not_found) {
  var this__10975 = this;
  var inode__10976 = this;
  var bit__10977 = 1 << (hash >>> shift & 31);
  if((this__10975.bitmap & bit__10977) === 0) {
    return not_found
  }else {
    var idx__10978 = cljs.core.bitmap_indexed_node_index.call(null, this__10975.bitmap, bit__10977);
    var key_or_nil__10979 = this__10975.arr[2 * idx__10978];
    var val_or_node__10980 = this__10975.arr[2 * idx__10978 + 1];
    if(key_or_nil__10979 == null) {
      return val_or_node__10980.inode_lookup(shift + 5, hash, key, not_found)
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__10979)) {
        return val_or_node__10980
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
  var arr__10996 = array_node.arr;
  var len__10997 = 2 * (array_node.cnt - 1);
  var new_arr__10998 = cljs.core.make_array.call(null, len__10997);
  var i__10999 = 0;
  var j__11000 = 1;
  var bitmap__11001 = 0;
  while(true) {
    if(i__10999 < len__10997) {
      if(function() {
        var and__3822__auto____11002 = !(i__10999 === idx);
        if(and__3822__auto____11002) {
          return!(arr__10996[i__10999] == null)
        }else {
          return and__3822__auto____11002
        }
      }()) {
        new_arr__10998[j__11000] = arr__10996[i__10999];
        var G__11003 = i__10999 + 1;
        var G__11004 = j__11000 + 2;
        var G__11005 = bitmap__11001 | 1 << i__10999;
        i__10999 = G__11003;
        j__11000 = G__11004;
        bitmap__11001 = G__11005;
        continue
      }else {
        var G__11006 = i__10999 + 1;
        var G__11007 = j__11000;
        var G__11008 = bitmap__11001;
        i__10999 = G__11006;
        j__11000 = G__11007;
        bitmap__11001 = G__11008;
        continue
      }
    }else {
      return new cljs.core.BitmapIndexedNode(edit, bitmap__11001, new_arr__10998)
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
  var this__11009 = this;
  var inode__11010 = this;
  var idx__11011 = hash >>> shift & 31;
  var node__11012 = this__11009.arr[idx__11011];
  if(node__11012 == null) {
    var editable__11013 = cljs.core.edit_and_set.call(null, inode__11010, edit, idx__11011, cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_));
    editable__11013.cnt = editable__11013.cnt + 1;
    return editable__11013
  }else {
    var n__11014 = node__11012.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_);
    if(n__11014 === node__11012) {
      return inode__11010
    }else {
      return cljs.core.edit_and_set.call(null, inode__11010, edit, idx__11011, n__11014)
    }
  }
};
cljs.core.ArrayNode.prototype.inode_seq = function() {
  var this__11015 = this;
  var inode__11016 = this;
  return cljs.core.create_array_node_seq.call(null, this__11015.arr)
};
cljs.core.ArrayNode.prototype.inode_without_BANG_ = function(edit, shift, hash, key, removed_leaf_QMARK_) {
  var this__11017 = this;
  var inode__11018 = this;
  var idx__11019 = hash >>> shift & 31;
  var node__11020 = this__11017.arr[idx__11019];
  if(node__11020 == null) {
    return inode__11018
  }else {
    var n__11021 = node__11020.inode_without_BANG_(edit, shift + 5, hash, key, removed_leaf_QMARK_);
    if(n__11021 === node__11020) {
      return inode__11018
    }else {
      if(n__11021 == null) {
        if(this__11017.cnt <= 8) {
          return cljs.core.pack_array_node.call(null, inode__11018, edit, idx__11019)
        }else {
          var editable__11022 = cljs.core.edit_and_set.call(null, inode__11018, edit, idx__11019, n__11021);
          editable__11022.cnt = editable__11022.cnt - 1;
          return editable__11022
        }
      }else {
        if("\ufdd0'else") {
          return cljs.core.edit_and_set.call(null, inode__11018, edit, idx__11019, n__11021)
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.ArrayNode.prototype.ensure_editable = function(e) {
  var this__11023 = this;
  var inode__11024 = this;
  if(e === this__11023.edit) {
    return inode__11024
  }else {
    return new cljs.core.ArrayNode(e, this__11023.cnt, this__11023.arr.slice())
  }
};
cljs.core.ArrayNode.prototype.kv_reduce = function(f, init) {
  var this__11025 = this;
  var inode__11026 = this;
  var len__11027 = this__11025.arr.length;
  var i__11028 = 0;
  var init__11029 = init;
  while(true) {
    if(i__11028 < len__11027) {
      var node__11030 = this__11025.arr[i__11028];
      if(!(node__11030 == null)) {
        var init__11031 = node__11030.kv_reduce(f, init__11029);
        if(cljs.core.reduced_QMARK_.call(null, init__11031)) {
          return cljs.core.deref.call(null, init__11031)
        }else {
          var G__11050 = i__11028 + 1;
          var G__11051 = init__11031;
          i__11028 = G__11050;
          init__11029 = G__11051;
          continue
        }
      }else {
        return null
      }
    }else {
      return init__11029
    }
    break
  }
};
cljs.core.ArrayNode.prototype.inode_find = function(shift, hash, key, not_found) {
  var this__11032 = this;
  var inode__11033 = this;
  var idx__11034 = hash >>> shift & 31;
  var node__11035 = this__11032.arr[idx__11034];
  if(!(node__11035 == null)) {
    return node__11035.inode_find(shift + 5, hash, key, not_found)
  }else {
    return not_found
  }
};
cljs.core.ArrayNode.prototype.inode_without = function(shift, hash, key) {
  var this__11036 = this;
  var inode__11037 = this;
  var idx__11038 = hash >>> shift & 31;
  var node__11039 = this__11036.arr[idx__11038];
  if(!(node__11039 == null)) {
    var n__11040 = node__11039.inode_without(shift + 5, hash, key);
    if(n__11040 === node__11039) {
      return inode__11037
    }else {
      if(n__11040 == null) {
        if(this__11036.cnt <= 8) {
          return cljs.core.pack_array_node.call(null, inode__11037, null, idx__11038)
        }else {
          return new cljs.core.ArrayNode(null, this__11036.cnt - 1, cljs.core.clone_and_set.call(null, this__11036.arr, idx__11038, n__11040))
        }
      }else {
        if("\ufdd0'else") {
          return new cljs.core.ArrayNode(null, this__11036.cnt, cljs.core.clone_and_set.call(null, this__11036.arr, idx__11038, n__11040))
        }else {
          return null
        }
      }
    }
  }else {
    return inode__11037
  }
};
cljs.core.ArrayNode.prototype.inode_assoc = function(shift, hash, key, val, added_leaf_QMARK_) {
  var this__11041 = this;
  var inode__11042 = this;
  var idx__11043 = hash >>> shift & 31;
  var node__11044 = this__11041.arr[idx__11043];
  if(node__11044 == null) {
    return new cljs.core.ArrayNode(null, this__11041.cnt + 1, cljs.core.clone_and_set.call(null, this__11041.arr, idx__11043, cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_)))
  }else {
    var n__11045 = node__11044.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_);
    if(n__11045 === node__11044) {
      return inode__11042
    }else {
      return new cljs.core.ArrayNode(null, this__11041.cnt, cljs.core.clone_and_set.call(null, this__11041.arr, idx__11043, n__11045))
    }
  }
};
cljs.core.ArrayNode.prototype.inode_lookup = function(shift, hash, key, not_found) {
  var this__11046 = this;
  var inode__11047 = this;
  var idx__11048 = hash >>> shift & 31;
  var node__11049 = this__11046.arr[idx__11048];
  if(!(node__11049 == null)) {
    return node__11049.inode_lookup(shift + 5, hash, key, not_found)
  }else {
    return not_found
  }
};
cljs.core.ArrayNode;
cljs.core.hash_collision_node_find_index = function hash_collision_node_find_index(arr, cnt, key) {
  var lim__11054 = 2 * cnt;
  var i__11055 = 0;
  while(true) {
    if(i__11055 < lim__11054) {
      if(cljs.core.key_test.call(null, key, arr[i__11055])) {
        return i__11055
      }else {
        var G__11056 = i__11055 + 2;
        i__11055 = G__11056;
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
  var this__11057 = this;
  var inode__11058 = this;
  if(hash === this__11057.collision_hash) {
    var idx__11059 = cljs.core.hash_collision_node_find_index.call(null, this__11057.arr, this__11057.cnt, key);
    if(idx__11059 === -1) {
      if(this__11057.arr.length > 2 * this__11057.cnt) {
        var editable__11060 = cljs.core.edit_and_set.call(null, inode__11058, edit, 2 * this__11057.cnt, key, 2 * this__11057.cnt + 1, val);
        added_leaf_QMARK_.val = true;
        editable__11060.cnt = editable__11060.cnt + 1;
        return editable__11060
      }else {
        var len__11061 = this__11057.arr.length;
        var new_arr__11062 = cljs.core.make_array.call(null, len__11061 + 2);
        cljs.core.array_copy.call(null, this__11057.arr, 0, new_arr__11062, 0, len__11061);
        new_arr__11062[len__11061] = key;
        new_arr__11062[len__11061 + 1] = val;
        added_leaf_QMARK_.val = true;
        return inode__11058.ensure_editable_array(edit, this__11057.cnt + 1, new_arr__11062)
      }
    }else {
      if(this__11057.arr[idx__11059 + 1] === val) {
        return inode__11058
      }else {
        return cljs.core.edit_and_set.call(null, inode__11058, edit, idx__11059 + 1, val)
      }
    }
  }else {
    return(new cljs.core.BitmapIndexedNode(edit, 1 << (this__11057.collision_hash >>> shift & 31), [null, inode__11058, null, null])).inode_assoc_BANG_(edit, shift, hash, key, val, added_leaf_QMARK_)
  }
};
cljs.core.HashCollisionNode.prototype.inode_seq = function() {
  var this__11063 = this;
  var inode__11064 = this;
  return cljs.core.create_inode_seq.call(null, this__11063.arr)
};
cljs.core.HashCollisionNode.prototype.inode_without_BANG_ = function(edit, shift, hash, key, removed_leaf_QMARK_) {
  var this__11065 = this;
  var inode__11066 = this;
  var idx__11067 = cljs.core.hash_collision_node_find_index.call(null, this__11065.arr, this__11065.cnt, key);
  if(idx__11067 === -1) {
    return inode__11066
  }else {
    removed_leaf_QMARK_[0] = true;
    if(this__11065.cnt === 1) {
      return null
    }else {
      var editable__11068 = inode__11066.ensure_editable(edit);
      var earr__11069 = editable__11068.arr;
      earr__11069[idx__11067] = earr__11069[2 * this__11065.cnt - 2];
      earr__11069[idx__11067 + 1] = earr__11069[2 * this__11065.cnt - 1];
      earr__11069[2 * this__11065.cnt - 1] = null;
      earr__11069[2 * this__11065.cnt - 2] = null;
      editable__11068.cnt = editable__11068.cnt - 1;
      return editable__11068
    }
  }
};
cljs.core.HashCollisionNode.prototype.ensure_editable = function(e) {
  var this__11070 = this;
  var inode__11071 = this;
  if(e === this__11070.edit) {
    return inode__11071
  }else {
    var new_arr__11072 = cljs.core.make_array.call(null, 2 * (this__11070.cnt + 1));
    cljs.core.array_copy.call(null, this__11070.arr, 0, new_arr__11072, 0, 2 * this__11070.cnt);
    return new cljs.core.HashCollisionNode(e, this__11070.collision_hash, this__11070.cnt, new_arr__11072)
  }
};
cljs.core.HashCollisionNode.prototype.kv_reduce = function(f, init) {
  var this__11073 = this;
  var inode__11074 = this;
  return cljs.core.inode_kv_reduce.call(null, this__11073.arr, f, init)
};
cljs.core.HashCollisionNode.prototype.inode_find = function(shift, hash, key, not_found) {
  var this__11075 = this;
  var inode__11076 = this;
  var idx__11077 = cljs.core.hash_collision_node_find_index.call(null, this__11075.arr, this__11075.cnt, key);
  if(idx__11077 < 0) {
    return not_found
  }else {
    if(cljs.core.key_test.call(null, key, this__11075.arr[idx__11077])) {
      return cljs.core.PersistentVector.fromArray([this__11075.arr[idx__11077], this__11075.arr[idx__11077 + 1]], true)
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
  var this__11078 = this;
  var inode__11079 = this;
  var idx__11080 = cljs.core.hash_collision_node_find_index.call(null, this__11078.arr, this__11078.cnt, key);
  if(idx__11080 === -1) {
    return inode__11079
  }else {
    if(this__11078.cnt === 1) {
      return null
    }else {
      if("\ufdd0'else") {
        return new cljs.core.HashCollisionNode(null, this__11078.collision_hash, this__11078.cnt - 1, cljs.core.remove_pair.call(null, this__11078.arr, cljs.core.quot.call(null, idx__11080, 2)))
      }else {
        return null
      }
    }
  }
};
cljs.core.HashCollisionNode.prototype.inode_assoc = function(shift, hash, key, val, added_leaf_QMARK_) {
  var this__11081 = this;
  var inode__11082 = this;
  if(hash === this__11081.collision_hash) {
    var idx__11083 = cljs.core.hash_collision_node_find_index.call(null, this__11081.arr, this__11081.cnt, key);
    if(idx__11083 === -1) {
      var len__11084 = this__11081.arr.length;
      var new_arr__11085 = cljs.core.make_array.call(null, len__11084 + 2);
      cljs.core.array_copy.call(null, this__11081.arr, 0, new_arr__11085, 0, len__11084);
      new_arr__11085[len__11084] = key;
      new_arr__11085[len__11084 + 1] = val;
      added_leaf_QMARK_.val = true;
      return new cljs.core.HashCollisionNode(null, this__11081.collision_hash, this__11081.cnt + 1, new_arr__11085)
    }else {
      if(cljs.core._EQ_.call(null, this__11081.arr[idx__11083], val)) {
        return inode__11082
      }else {
        return new cljs.core.HashCollisionNode(null, this__11081.collision_hash, this__11081.cnt, cljs.core.clone_and_set.call(null, this__11081.arr, idx__11083 + 1, val))
      }
    }
  }else {
    return(new cljs.core.BitmapIndexedNode(null, 1 << (this__11081.collision_hash >>> shift & 31), [null, inode__11082])).inode_assoc(shift, hash, key, val, added_leaf_QMARK_)
  }
};
cljs.core.HashCollisionNode.prototype.inode_lookup = function(shift, hash, key, not_found) {
  var this__11086 = this;
  var inode__11087 = this;
  var idx__11088 = cljs.core.hash_collision_node_find_index.call(null, this__11086.arr, this__11086.cnt, key);
  if(idx__11088 < 0) {
    return not_found
  }else {
    if(cljs.core.key_test.call(null, key, this__11086.arr[idx__11088])) {
      return this__11086.arr[idx__11088 + 1]
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
  var this__11089 = this;
  var inode__11090 = this;
  if(e === this__11089.edit) {
    this__11089.arr = array;
    this__11089.cnt = count;
    return inode__11090
  }else {
    return new cljs.core.HashCollisionNode(this__11089.edit, this__11089.collision_hash, count, array)
  }
};
cljs.core.HashCollisionNode;
cljs.core.create_node = function() {
  var create_node = null;
  var create_node__6 = function(shift, key1, val1, key2hash, key2, val2) {
    var key1hash__11095 = cljs.core.hash.call(null, key1);
    if(key1hash__11095 === key2hash) {
      return new cljs.core.HashCollisionNode(null, key1hash__11095, 2, [key1, val1, key2, val2])
    }else {
      var added_leaf_QMARK___11096 = new cljs.core.Box(false);
      return cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift, key1hash__11095, key1, val1, added_leaf_QMARK___11096).inode_assoc(shift, key2hash, key2, val2, added_leaf_QMARK___11096)
    }
  };
  var create_node__7 = function(edit, shift, key1, val1, key2hash, key2, val2) {
    var key1hash__11097 = cljs.core.hash.call(null, key1);
    if(key1hash__11097 === key2hash) {
      return new cljs.core.HashCollisionNode(null, key1hash__11097, 2, [key1, val1, key2, val2])
    }else {
      var added_leaf_QMARK___11098 = new cljs.core.Box(false);
      return cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift, key1hash__11097, key1, val1, added_leaf_QMARK___11098).inode_assoc_BANG_(edit, shift, key2hash, key2, val2, added_leaf_QMARK___11098)
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
  var this__11099 = this;
  var h__2192__auto____11100 = this__11099.__hash;
  if(!(h__2192__auto____11100 == null)) {
    return h__2192__auto____11100
  }else {
    var h__2192__auto____11101 = cljs.core.hash_coll.call(null, coll);
    this__11099.__hash = h__2192__auto____11101;
    return h__2192__auto____11101
  }
};
cljs.core.NodeSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__11102 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.NodeSeq.prototype.toString = function() {
  var this__11103 = this;
  var this__11104 = this;
  return cljs.core.pr_str.call(null, this__11104)
};
cljs.core.NodeSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__11105 = this;
  return this$
};
cljs.core.NodeSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__11106 = this;
  if(this__11106.s == null) {
    return cljs.core.PersistentVector.fromArray([this__11106.nodes[this__11106.i], this__11106.nodes[this__11106.i + 1]], true)
  }else {
    return cljs.core.first.call(null, this__11106.s)
  }
};
cljs.core.NodeSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__11107 = this;
  if(this__11107.s == null) {
    return cljs.core.create_inode_seq.call(null, this__11107.nodes, this__11107.i + 2, null)
  }else {
    return cljs.core.create_inode_seq.call(null, this__11107.nodes, this__11107.i, cljs.core.next.call(null, this__11107.s))
  }
};
cljs.core.NodeSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11108 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.NodeSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11109 = this;
  return new cljs.core.NodeSeq(meta, this__11109.nodes, this__11109.i, this__11109.s, this__11109.__hash)
};
cljs.core.NodeSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11110 = this;
  return this__11110.meta
};
cljs.core.NodeSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__11111 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__11111.meta)
};
cljs.core.NodeSeq;
cljs.core.create_inode_seq = function() {
  var create_inode_seq = null;
  var create_inode_seq__1 = function(nodes) {
    return create_inode_seq.call(null, nodes, 0, null)
  };
  var create_inode_seq__3 = function(nodes, i, s) {
    if(s == null) {
      var len__11118 = nodes.length;
      var j__11119 = i;
      while(true) {
        if(j__11119 < len__11118) {
          if(!(nodes[j__11119] == null)) {
            return new cljs.core.NodeSeq(null, nodes, j__11119, null, null)
          }else {
            var temp__3971__auto____11120 = nodes[j__11119 + 1];
            if(cljs.core.truth_(temp__3971__auto____11120)) {
              var node__11121 = temp__3971__auto____11120;
              var temp__3971__auto____11122 = node__11121.inode_seq();
              if(cljs.core.truth_(temp__3971__auto____11122)) {
                var node_seq__11123 = temp__3971__auto____11122;
                return new cljs.core.NodeSeq(null, nodes, j__11119 + 2, node_seq__11123, null)
              }else {
                var G__11124 = j__11119 + 2;
                j__11119 = G__11124;
                continue
              }
            }else {
              var G__11125 = j__11119 + 2;
              j__11119 = G__11125;
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
  var this__11126 = this;
  var h__2192__auto____11127 = this__11126.__hash;
  if(!(h__2192__auto____11127 == null)) {
    return h__2192__auto____11127
  }else {
    var h__2192__auto____11128 = cljs.core.hash_coll.call(null, coll);
    this__11126.__hash = h__2192__auto____11128;
    return h__2192__auto____11128
  }
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__11129 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.ArrayNodeSeq.prototype.toString = function() {
  var this__11130 = this;
  var this__11131 = this;
  return cljs.core.pr_str.call(null, this__11131)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__11132 = this;
  return this$
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__11133 = this;
  return cljs.core.first.call(null, this__11133.s)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__11134 = this;
  return cljs.core.create_array_node_seq.call(null, null, this__11134.nodes, this__11134.i, cljs.core.next.call(null, this__11134.s))
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11135 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11136 = this;
  return new cljs.core.ArrayNodeSeq(meta, this__11136.nodes, this__11136.i, this__11136.s, this__11136.__hash)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11137 = this;
  return this__11137.meta
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__11138 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__11138.meta)
};
cljs.core.ArrayNodeSeq;
cljs.core.create_array_node_seq = function() {
  var create_array_node_seq = null;
  var create_array_node_seq__1 = function(nodes) {
    return create_array_node_seq.call(null, null, nodes, 0, null)
  };
  var create_array_node_seq__4 = function(meta, nodes, i, s) {
    if(s == null) {
      var len__11145 = nodes.length;
      var j__11146 = i;
      while(true) {
        if(j__11146 < len__11145) {
          var temp__3971__auto____11147 = nodes[j__11146];
          if(cljs.core.truth_(temp__3971__auto____11147)) {
            var nj__11148 = temp__3971__auto____11147;
            var temp__3971__auto____11149 = nj__11148.inode_seq();
            if(cljs.core.truth_(temp__3971__auto____11149)) {
              var ns__11150 = temp__3971__auto____11149;
              return new cljs.core.ArrayNodeSeq(meta, nodes, j__11146 + 1, ns__11150, null)
            }else {
              var G__11151 = j__11146 + 1;
              j__11146 = G__11151;
              continue
            }
          }else {
            var G__11152 = j__11146 + 1;
            j__11146 = G__11152;
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
  var this__11155 = this;
  return new cljs.core.TransientHashMap({}, this__11155.root, this__11155.cnt, this__11155.has_nil_QMARK_, this__11155.nil_val)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__11156 = this;
  var h__2192__auto____11157 = this__11156.__hash;
  if(!(h__2192__auto____11157 == null)) {
    return h__2192__auto____11157
  }else {
    var h__2192__auto____11158 = cljs.core.hash_imap.call(null, coll);
    this__11156.__hash = h__2192__auto____11158;
    return h__2192__auto____11158
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__11159 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.PersistentHashMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__11160 = this;
  if(k == null) {
    if(this__11160.has_nil_QMARK_) {
      return this__11160.nil_val
    }else {
      return not_found
    }
  }else {
    if(this__11160.root == null) {
      return not_found
    }else {
      if("\ufdd0'else") {
        return this__11160.root.inode_lookup(0, cljs.core.hash.call(null, k), k, not_found)
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__11161 = this;
  if(k == null) {
    if(function() {
      var and__3822__auto____11162 = this__11161.has_nil_QMARK_;
      if(and__3822__auto____11162) {
        return v === this__11161.nil_val
      }else {
        return and__3822__auto____11162
      }
    }()) {
      return coll
    }else {
      return new cljs.core.PersistentHashMap(this__11161.meta, this__11161.has_nil_QMARK_ ? this__11161.cnt : this__11161.cnt + 1, this__11161.root, true, v, null)
    }
  }else {
    var added_leaf_QMARK___11163 = new cljs.core.Box(false);
    var new_root__11164 = (this__11161.root == null ? cljs.core.BitmapIndexedNode.EMPTY : this__11161.root).inode_assoc(0, cljs.core.hash.call(null, k), k, v, added_leaf_QMARK___11163);
    if(new_root__11164 === this__11161.root) {
      return coll
    }else {
      return new cljs.core.PersistentHashMap(this__11161.meta, added_leaf_QMARK___11163.val ? this__11161.cnt + 1 : this__11161.cnt, new_root__11164, this__11161.has_nil_QMARK_, this__11161.nil_val, null)
    }
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__11165 = this;
  if(k == null) {
    return this__11165.has_nil_QMARK_
  }else {
    if(this__11165.root == null) {
      return false
    }else {
      if("\ufdd0'else") {
        return!(this__11165.root.inode_lookup(0, cljs.core.hash.call(null, k), k, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel)
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap.prototype.call = function() {
  var G__11188 = null;
  var G__11188__2 = function(this_sym11166, k) {
    var this__11168 = this;
    var this_sym11166__11169 = this;
    var coll__11170 = this_sym11166__11169;
    return coll__11170.cljs$core$ILookup$_lookup$arity$2(coll__11170, k)
  };
  var G__11188__3 = function(this_sym11167, k, not_found) {
    var this__11168 = this;
    var this_sym11167__11171 = this;
    var coll__11172 = this_sym11167__11171;
    return coll__11172.cljs$core$ILookup$_lookup$arity$3(coll__11172, k, not_found)
  };
  G__11188 = function(this_sym11167, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11188__2.call(this, this_sym11167, k);
      case 3:
        return G__11188__3.call(this, this_sym11167, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11188
}();
cljs.core.PersistentHashMap.prototype.apply = function(this_sym11153, args11154) {
  var this__11173 = this;
  return this_sym11153.call.apply(this_sym11153, [this_sym11153].concat(args11154.slice()))
};
cljs.core.PersistentHashMap.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(coll, f, init) {
  var this__11174 = this;
  var init__11175 = this__11174.has_nil_QMARK_ ? f.call(null, init, null, this__11174.nil_val) : init;
  if(cljs.core.reduced_QMARK_.call(null, init__11175)) {
    return cljs.core.deref.call(null, init__11175)
  }else {
    if(!(this__11174.root == null)) {
      return this__11174.root.kv_reduce(f, init__11175)
    }else {
      if("\ufdd0'else") {
        return init__11175
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__11176 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.PersistentHashMap.prototype.toString = function() {
  var this__11177 = this;
  var this__11178 = this;
  return cljs.core.pr_str.call(null, this__11178)
};
cljs.core.PersistentHashMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__11179 = this;
  if(this__11179.cnt > 0) {
    var s__11180 = !(this__11179.root == null) ? this__11179.root.inode_seq() : null;
    if(this__11179.has_nil_QMARK_) {
      return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([null, this__11179.nil_val], true), s__11180)
    }else {
      return s__11180
    }
  }else {
    return null
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__11181 = this;
  return this__11181.cnt
};
cljs.core.PersistentHashMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11182 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11183 = this;
  return new cljs.core.PersistentHashMap(meta, this__11183.cnt, this__11183.root, this__11183.has_nil_QMARK_, this__11183.nil_val, this__11183.__hash)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11184 = this;
  return this__11184.meta
};
cljs.core.PersistentHashMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__11185 = this;
  return cljs.core._with_meta.call(null, cljs.core.PersistentHashMap.EMPTY, this__11185.meta)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__11186 = this;
  if(k == null) {
    if(this__11186.has_nil_QMARK_) {
      return new cljs.core.PersistentHashMap(this__11186.meta, this__11186.cnt - 1, this__11186.root, false, null, null)
    }else {
      return coll
    }
  }else {
    if(this__11186.root == null) {
      return coll
    }else {
      if("\ufdd0'else") {
        var new_root__11187 = this__11186.root.inode_without(0, cljs.core.hash.call(null, k), k);
        if(new_root__11187 === this__11186.root) {
          return coll
        }else {
          return new cljs.core.PersistentHashMap(this__11186.meta, this__11186.cnt - 1, new_root__11187, this__11186.has_nil_QMARK_, this__11186.nil_val, null)
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
  var len__11189 = ks.length;
  var i__11190 = 0;
  var out__11191 = cljs.core.transient$.call(null, cljs.core.PersistentHashMap.EMPTY);
  while(true) {
    if(i__11190 < len__11189) {
      var G__11192 = i__11190 + 1;
      var G__11193 = cljs.core.assoc_BANG_.call(null, out__11191, ks[i__11190], vs[i__11190]);
      i__11190 = G__11192;
      out__11191 = G__11193;
      continue
    }else {
      return cljs.core.persistent_BANG_.call(null, out__11191)
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
  var this__11194 = this;
  return tcoll.without_BANG_(key)
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3 = function(tcoll, key, val) {
  var this__11195 = this;
  return tcoll.assoc_BANG_(key, val)
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, val) {
  var this__11196 = this;
  return tcoll.conj_BANG_(val)
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__11197 = this;
  return tcoll.persistent_BANG_()
};
cljs.core.TransientHashMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(tcoll, k) {
  var this__11198 = this;
  if(k == null) {
    if(this__11198.has_nil_QMARK_) {
      return this__11198.nil_val
    }else {
      return null
    }
  }else {
    if(this__11198.root == null) {
      return null
    }else {
      return this__11198.root.inode_lookup(0, cljs.core.hash.call(null, k), k)
    }
  }
};
cljs.core.TransientHashMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(tcoll, k, not_found) {
  var this__11199 = this;
  if(k == null) {
    if(this__11199.has_nil_QMARK_) {
      return this__11199.nil_val
    }else {
      return not_found
    }
  }else {
    if(this__11199.root == null) {
      return not_found
    }else {
      return this__11199.root.inode_lookup(0, cljs.core.hash.call(null, k), k, not_found)
    }
  }
};
cljs.core.TransientHashMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__11200 = this;
  if(this__11200.edit) {
    return this__11200.count
  }else {
    throw new Error("count after persistent!");
  }
};
cljs.core.TransientHashMap.prototype.conj_BANG_ = function(o) {
  var this__11201 = this;
  var tcoll__11202 = this;
  if(this__11201.edit) {
    if(function() {
      var G__11203__11204 = o;
      if(G__11203__11204) {
        if(function() {
          var or__3824__auto____11205 = G__11203__11204.cljs$lang$protocol_mask$partition0$ & 2048;
          if(or__3824__auto____11205) {
            return or__3824__auto____11205
          }else {
            return G__11203__11204.cljs$core$IMapEntry$
          }
        }()) {
          return true
        }else {
          if(!G__11203__11204.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.IMapEntry, G__11203__11204)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.IMapEntry, G__11203__11204)
      }
    }()) {
      return tcoll__11202.assoc_BANG_(cljs.core.key.call(null, o), cljs.core.val.call(null, o))
    }else {
      var es__11206 = cljs.core.seq.call(null, o);
      var tcoll__11207 = tcoll__11202;
      while(true) {
        var temp__3971__auto____11208 = cljs.core.first.call(null, es__11206);
        if(cljs.core.truth_(temp__3971__auto____11208)) {
          var e__11209 = temp__3971__auto____11208;
          var G__11220 = cljs.core.next.call(null, es__11206);
          var G__11221 = tcoll__11207.assoc_BANG_(cljs.core.key.call(null, e__11209), cljs.core.val.call(null, e__11209));
          es__11206 = G__11220;
          tcoll__11207 = G__11221;
          continue
        }else {
          return tcoll__11207
        }
        break
      }
    }
  }else {
    throw new Error("conj! after persistent");
  }
};
cljs.core.TransientHashMap.prototype.assoc_BANG_ = function(k, v) {
  var this__11210 = this;
  var tcoll__11211 = this;
  if(this__11210.edit) {
    if(k == null) {
      if(this__11210.nil_val === v) {
      }else {
        this__11210.nil_val = v
      }
      if(this__11210.has_nil_QMARK_) {
      }else {
        this__11210.count = this__11210.count + 1;
        this__11210.has_nil_QMARK_ = true
      }
      return tcoll__11211
    }else {
      var added_leaf_QMARK___11212 = new cljs.core.Box(false);
      var node__11213 = (this__11210.root == null ? cljs.core.BitmapIndexedNode.EMPTY : this__11210.root).inode_assoc_BANG_(this__11210.edit, 0, cljs.core.hash.call(null, k), k, v, added_leaf_QMARK___11212);
      if(node__11213 === this__11210.root) {
      }else {
        this__11210.root = node__11213
      }
      if(added_leaf_QMARK___11212.val) {
        this__11210.count = this__11210.count + 1
      }else {
      }
      return tcoll__11211
    }
  }else {
    throw new Error("assoc! after persistent!");
  }
};
cljs.core.TransientHashMap.prototype.without_BANG_ = function(k) {
  var this__11214 = this;
  var tcoll__11215 = this;
  if(this__11214.edit) {
    if(k == null) {
      if(this__11214.has_nil_QMARK_) {
        this__11214.has_nil_QMARK_ = false;
        this__11214.nil_val = null;
        this__11214.count = this__11214.count - 1;
        return tcoll__11215
      }else {
        return tcoll__11215
      }
    }else {
      if(this__11214.root == null) {
        return tcoll__11215
      }else {
        var removed_leaf_QMARK___11216 = new cljs.core.Box(false);
        var node__11217 = this__11214.root.inode_without_BANG_(this__11214.edit, 0, cljs.core.hash.call(null, k), k, removed_leaf_QMARK___11216);
        if(node__11217 === this__11214.root) {
        }else {
          this__11214.root = node__11217
        }
        if(cljs.core.truth_(removed_leaf_QMARK___11216[0])) {
          this__11214.count = this__11214.count - 1
        }else {
        }
        return tcoll__11215
      }
    }
  }else {
    throw new Error("dissoc! after persistent!");
  }
};
cljs.core.TransientHashMap.prototype.persistent_BANG_ = function() {
  var this__11218 = this;
  var tcoll__11219 = this;
  if(this__11218.edit) {
    this__11218.edit = null;
    return new cljs.core.PersistentHashMap(null, this__11218.count, this__11218.root, this__11218.has_nil_QMARK_, this__11218.nil_val, null)
  }else {
    throw new Error("persistent! called twice");
  }
};
cljs.core.TransientHashMap;
cljs.core.tree_map_seq_push = function tree_map_seq_push(node, stack, ascending_QMARK_) {
  var t__11224 = node;
  var stack__11225 = stack;
  while(true) {
    if(!(t__11224 == null)) {
      var G__11226 = ascending_QMARK_ ? t__11224.left : t__11224.right;
      var G__11227 = cljs.core.conj.call(null, stack__11225, t__11224);
      t__11224 = G__11226;
      stack__11225 = G__11227;
      continue
    }else {
      return stack__11225
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
  var this__11228 = this;
  var h__2192__auto____11229 = this__11228.__hash;
  if(!(h__2192__auto____11229 == null)) {
    return h__2192__auto____11229
  }else {
    var h__2192__auto____11230 = cljs.core.hash_coll.call(null, coll);
    this__11228.__hash = h__2192__auto____11230;
    return h__2192__auto____11230
  }
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__11231 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentTreeMapSeq.prototype.toString = function() {
  var this__11232 = this;
  var this__11233 = this;
  return cljs.core.pr_str.call(null, this__11233)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__11234 = this;
  return this$
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__11235 = this;
  if(this__11235.cnt < 0) {
    return cljs.core.count.call(null, cljs.core.next.call(null, coll)) + 1
  }else {
    return this__11235.cnt
  }
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(this$) {
  var this__11236 = this;
  return cljs.core.peek.call(null, this__11236.stack)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(this$) {
  var this__11237 = this;
  var t__11238 = cljs.core.first.call(null, this__11237.stack);
  var next_stack__11239 = cljs.core.tree_map_seq_push.call(null, this__11237.ascending_QMARK_ ? t__11238.right : t__11238.left, cljs.core.next.call(null, this__11237.stack), this__11237.ascending_QMARK_);
  if(!(next_stack__11239 == null)) {
    return new cljs.core.PersistentTreeMapSeq(null, next_stack__11239, this__11237.ascending_QMARK_, this__11237.cnt - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11240 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11241 = this;
  return new cljs.core.PersistentTreeMapSeq(meta, this__11241.stack, this__11241.ascending_QMARK_, this__11241.cnt, this__11241.__hash)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11242 = this;
  return this__11242.meta
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
        var and__3822__auto____11244 = cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, right);
        if(and__3822__auto____11244) {
          return cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, right.left)
        }else {
          return and__3822__auto____11244
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
        var and__3822__auto____11246 = cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, left);
        if(and__3822__auto____11246) {
          return cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, left.right)
        }else {
          return and__3822__auto____11246
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
  var init__11250 = f.call(null, init, node.key, node.val);
  if(cljs.core.reduced_QMARK_.call(null, init__11250)) {
    return cljs.core.deref.call(null, init__11250)
  }else {
    var init__11251 = !(node.left == null) ? tree_map_kv_reduce.call(null, node.left, f, init__11250) : init__11250;
    if(cljs.core.reduced_QMARK_.call(null, init__11251)) {
      return cljs.core.deref.call(null, init__11251)
    }else {
      var init__11252 = !(node.right == null) ? tree_map_kv_reduce.call(null, node.right, f, init__11251) : init__11251;
      if(cljs.core.reduced_QMARK_.call(null, init__11252)) {
        return cljs.core.deref.call(null, init__11252)
      }else {
        return init__11252
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
  var this__11255 = this;
  var h__2192__auto____11256 = this__11255.__hash;
  if(!(h__2192__auto____11256 == null)) {
    return h__2192__auto____11256
  }else {
    var h__2192__auto____11257 = cljs.core.hash_coll.call(null, coll);
    this__11255.__hash = h__2192__auto____11257;
    return h__2192__auto____11257
  }
};
cljs.core.BlackNode.prototype.cljs$core$ILookup$_lookup$arity$2 = function(node, k) {
  var this__11258 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, null)
};
cljs.core.BlackNode.prototype.cljs$core$ILookup$_lookup$arity$3 = function(node, k, not_found) {
  var this__11259 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, not_found)
};
cljs.core.BlackNode.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(node, k, v) {
  var this__11260 = this;
  return cljs.core.assoc.call(null, cljs.core.PersistentVector.fromArray([this__11260.key, this__11260.val], true), k, v)
};
cljs.core.BlackNode.prototype.call = function() {
  var G__11308 = null;
  var G__11308__2 = function(this_sym11261, k) {
    var this__11263 = this;
    var this_sym11261__11264 = this;
    var node__11265 = this_sym11261__11264;
    return node__11265.cljs$core$ILookup$_lookup$arity$2(node__11265, k)
  };
  var G__11308__3 = function(this_sym11262, k, not_found) {
    var this__11263 = this;
    var this_sym11262__11266 = this;
    var node__11267 = this_sym11262__11266;
    return node__11267.cljs$core$ILookup$_lookup$arity$3(node__11267, k, not_found)
  };
  G__11308 = function(this_sym11262, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11308__2.call(this, this_sym11262, k);
      case 3:
        return G__11308__3.call(this, this_sym11262, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11308
}();
cljs.core.BlackNode.prototype.apply = function(this_sym11253, args11254) {
  var this__11268 = this;
  return this_sym11253.call.apply(this_sym11253, [this_sym11253].concat(args11254.slice()))
};
cljs.core.BlackNode.prototype.cljs$core$ICollection$_conj$arity$2 = function(node, o) {
  var this__11269 = this;
  return cljs.core.PersistentVector.fromArray([this__11269.key, this__11269.val, o], true)
};
cljs.core.BlackNode.prototype.cljs$core$IMapEntry$_key$arity$1 = function(node) {
  var this__11270 = this;
  return this__11270.key
};
cljs.core.BlackNode.prototype.cljs$core$IMapEntry$_val$arity$1 = function(node) {
  var this__11271 = this;
  return this__11271.val
};
cljs.core.BlackNode.prototype.add_right = function(ins) {
  var this__11272 = this;
  var node__11273 = this;
  return ins.balance_right(node__11273)
};
cljs.core.BlackNode.prototype.redden = function() {
  var this__11274 = this;
  var node__11275 = this;
  return new cljs.core.RedNode(this__11274.key, this__11274.val, this__11274.left, this__11274.right, null)
};
cljs.core.BlackNode.prototype.remove_right = function(del) {
  var this__11276 = this;
  var node__11277 = this;
  return cljs.core.balance_right_del.call(null, this__11276.key, this__11276.val, this__11276.left, del)
};
cljs.core.BlackNode.prototype.replace = function(key, val, left, right) {
  var this__11278 = this;
  var node__11279 = this;
  return new cljs.core.BlackNode(key, val, left, right, null)
};
cljs.core.BlackNode.prototype.kv_reduce = function(f, init) {
  var this__11280 = this;
  var node__11281 = this;
  return cljs.core.tree_map_kv_reduce.call(null, node__11281, f, init)
};
cljs.core.BlackNode.prototype.remove_left = function(del) {
  var this__11282 = this;
  var node__11283 = this;
  return cljs.core.balance_left_del.call(null, this__11282.key, this__11282.val, del, this__11282.right)
};
cljs.core.BlackNode.prototype.add_left = function(ins) {
  var this__11284 = this;
  var node__11285 = this;
  return ins.balance_left(node__11285)
};
cljs.core.BlackNode.prototype.balance_left = function(parent) {
  var this__11286 = this;
  var node__11287 = this;
  return new cljs.core.BlackNode(parent.key, parent.val, node__11287, parent.right, null)
};
cljs.core.BlackNode.prototype.toString = function() {
  var G__11309 = null;
  var G__11309__0 = function() {
    var this__11288 = this;
    var this__11290 = this;
    return cljs.core.pr_str.call(null, this__11290)
  };
  G__11309 = function() {
    switch(arguments.length) {
      case 0:
        return G__11309__0.call(this)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11309
}();
cljs.core.BlackNode.prototype.balance_right = function(parent) {
  var this__11291 = this;
  var node__11292 = this;
  return new cljs.core.BlackNode(parent.key, parent.val, parent.left, node__11292, null)
};
cljs.core.BlackNode.prototype.blacken = function() {
  var this__11293 = this;
  var node__11294 = this;
  return node__11294
};
cljs.core.BlackNode.prototype.cljs$core$IReduce$_reduce$arity$2 = function(node, f) {
  var this__11295 = this;
  return cljs.core.ci_reduce.call(null, node, f)
};
cljs.core.BlackNode.prototype.cljs$core$IReduce$_reduce$arity$3 = function(node, f, start) {
  var this__11296 = this;
  return cljs.core.ci_reduce.call(null, node, f, start)
};
cljs.core.BlackNode.prototype.cljs$core$ISeqable$_seq$arity$1 = function(node) {
  var this__11297 = this;
  return cljs.core.list.call(null, this__11297.key, this__11297.val)
};
cljs.core.BlackNode.prototype.cljs$core$ICounted$_count$arity$1 = function(node) {
  var this__11298 = this;
  return 2
};
cljs.core.BlackNode.prototype.cljs$core$IStack$_peek$arity$1 = function(node) {
  var this__11299 = this;
  return this__11299.val
};
cljs.core.BlackNode.prototype.cljs$core$IStack$_pop$arity$1 = function(node) {
  var this__11300 = this;
  return cljs.core.PersistentVector.fromArray([this__11300.key], true)
};
cljs.core.BlackNode.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(node, n, v) {
  var this__11301 = this;
  return cljs.core._assoc_n.call(null, cljs.core.PersistentVector.fromArray([this__11301.key, this__11301.val], true), n, v)
};
cljs.core.BlackNode.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11302 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.BlackNode.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(node, meta) {
  var this__11303 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.fromArray([this__11303.key, this__11303.val], true), meta)
};
cljs.core.BlackNode.prototype.cljs$core$IMeta$_meta$arity$1 = function(node) {
  var this__11304 = this;
  return null
};
cljs.core.BlackNode.prototype.cljs$core$IIndexed$_nth$arity$2 = function(node, n) {
  var this__11305 = this;
  if(n === 0) {
    return this__11305.key
  }else {
    if(n === 1) {
      return this__11305.val
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
  var this__11306 = this;
  if(n === 0) {
    return this__11306.key
  }else {
    if(n === 1) {
      return this__11306.val
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
  var this__11307 = this;
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
  var this__11312 = this;
  var h__2192__auto____11313 = this__11312.__hash;
  if(!(h__2192__auto____11313 == null)) {
    return h__2192__auto____11313
  }else {
    var h__2192__auto____11314 = cljs.core.hash_coll.call(null, coll);
    this__11312.__hash = h__2192__auto____11314;
    return h__2192__auto____11314
  }
};
cljs.core.RedNode.prototype.cljs$core$ILookup$_lookup$arity$2 = function(node, k) {
  var this__11315 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, null)
};
cljs.core.RedNode.prototype.cljs$core$ILookup$_lookup$arity$3 = function(node, k, not_found) {
  var this__11316 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, not_found)
};
cljs.core.RedNode.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(node, k, v) {
  var this__11317 = this;
  return cljs.core.assoc.call(null, cljs.core.PersistentVector.fromArray([this__11317.key, this__11317.val], true), k, v)
};
cljs.core.RedNode.prototype.call = function() {
  var G__11365 = null;
  var G__11365__2 = function(this_sym11318, k) {
    var this__11320 = this;
    var this_sym11318__11321 = this;
    var node__11322 = this_sym11318__11321;
    return node__11322.cljs$core$ILookup$_lookup$arity$2(node__11322, k)
  };
  var G__11365__3 = function(this_sym11319, k, not_found) {
    var this__11320 = this;
    var this_sym11319__11323 = this;
    var node__11324 = this_sym11319__11323;
    return node__11324.cljs$core$ILookup$_lookup$arity$3(node__11324, k, not_found)
  };
  G__11365 = function(this_sym11319, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11365__2.call(this, this_sym11319, k);
      case 3:
        return G__11365__3.call(this, this_sym11319, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11365
}();
cljs.core.RedNode.prototype.apply = function(this_sym11310, args11311) {
  var this__11325 = this;
  return this_sym11310.call.apply(this_sym11310, [this_sym11310].concat(args11311.slice()))
};
cljs.core.RedNode.prototype.cljs$core$ICollection$_conj$arity$2 = function(node, o) {
  var this__11326 = this;
  return cljs.core.PersistentVector.fromArray([this__11326.key, this__11326.val, o], true)
};
cljs.core.RedNode.prototype.cljs$core$IMapEntry$_key$arity$1 = function(node) {
  var this__11327 = this;
  return this__11327.key
};
cljs.core.RedNode.prototype.cljs$core$IMapEntry$_val$arity$1 = function(node) {
  var this__11328 = this;
  return this__11328.val
};
cljs.core.RedNode.prototype.add_right = function(ins) {
  var this__11329 = this;
  var node__11330 = this;
  return new cljs.core.RedNode(this__11329.key, this__11329.val, this__11329.left, ins, null)
};
cljs.core.RedNode.prototype.redden = function() {
  var this__11331 = this;
  var node__11332 = this;
  throw new Error("red-black tree invariant violation");
};
cljs.core.RedNode.prototype.remove_right = function(del) {
  var this__11333 = this;
  var node__11334 = this;
  return new cljs.core.RedNode(this__11333.key, this__11333.val, this__11333.left, del, null)
};
cljs.core.RedNode.prototype.replace = function(key, val, left, right) {
  var this__11335 = this;
  var node__11336 = this;
  return new cljs.core.RedNode(key, val, left, right, null)
};
cljs.core.RedNode.prototype.kv_reduce = function(f, init) {
  var this__11337 = this;
  var node__11338 = this;
  return cljs.core.tree_map_kv_reduce.call(null, node__11338, f, init)
};
cljs.core.RedNode.prototype.remove_left = function(del) {
  var this__11339 = this;
  var node__11340 = this;
  return new cljs.core.RedNode(this__11339.key, this__11339.val, del, this__11339.right, null)
};
cljs.core.RedNode.prototype.add_left = function(ins) {
  var this__11341 = this;
  var node__11342 = this;
  return new cljs.core.RedNode(this__11341.key, this__11341.val, ins, this__11341.right, null)
};
cljs.core.RedNode.prototype.balance_left = function(parent) {
  var this__11343 = this;
  var node__11344 = this;
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, this__11343.left)) {
    return new cljs.core.RedNode(this__11343.key, this__11343.val, this__11343.left.blacken(), new cljs.core.BlackNode(parent.key, parent.val, this__11343.right, parent.right, null), null)
  }else {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, this__11343.right)) {
      return new cljs.core.RedNode(this__11343.right.key, this__11343.right.val, new cljs.core.BlackNode(this__11343.key, this__11343.val, this__11343.left, this__11343.right.left, null), new cljs.core.BlackNode(parent.key, parent.val, this__11343.right.right, parent.right, null), null)
    }else {
      if("\ufdd0'else") {
        return new cljs.core.BlackNode(parent.key, parent.val, node__11344, parent.right, null)
      }else {
        return null
      }
    }
  }
};
cljs.core.RedNode.prototype.toString = function() {
  var G__11366 = null;
  var G__11366__0 = function() {
    var this__11345 = this;
    var this__11347 = this;
    return cljs.core.pr_str.call(null, this__11347)
  };
  G__11366 = function() {
    switch(arguments.length) {
      case 0:
        return G__11366__0.call(this)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11366
}();
cljs.core.RedNode.prototype.balance_right = function(parent) {
  var this__11348 = this;
  var node__11349 = this;
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, this__11348.right)) {
    return new cljs.core.RedNode(this__11348.key, this__11348.val, new cljs.core.BlackNode(parent.key, parent.val, parent.left, this__11348.left, null), this__11348.right.blacken(), null)
  }else {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, this__11348.left)) {
      return new cljs.core.RedNode(this__11348.left.key, this__11348.left.val, new cljs.core.BlackNode(parent.key, parent.val, parent.left, this__11348.left.left, null), new cljs.core.BlackNode(this__11348.key, this__11348.val, this__11348.left.right, this__11348.right, null), null)
    }else {
      if("\ufdd0'else") {
        return new cljs.core.BlackNode(parent.key, parent.val, parent.left, node__11349, null)
      }else {
        return null
      }
    }
  }
};
cljs.core.RedNode.prototype.blacken = function() {
  var this__11350 = this;
  var node__11351 = this;
  return new cljs.core.BlackNode(this__11350.key, this__11350.val, this__11350.left, this__11350.right, null)
};
cljs.core.RedNode.prototype.cljs$core$IReduce$_reduce$arity$2 = function(node, f) {
  var this__11352 = this;
  return cljs.core.ci_reduce.call(null, node, f)
};
cljs.core.RedNode.prototype.cljs$core$IReduce$_reduce$arity$3 = function(node, f, start) {
  var this__11353 = this;
  return cljs.core.ci_reduce.call(null, node, f, start)
};
cljs.core.RedNode.prototype.cljs$core$ISeqable$_seq$arity$1 = function(node) {
  var this__11354 = this;
  return cljs.core.list.call(null, this__11354.key, this__11354.val)
};
cljs.core.RedNode.prototype.cljs$core$ICounted$_count$arity$1 = function(node) {
  var this__11355 = this;
  return 2
};
cljs.core.RedNode.prototype.cljs$core$IStack$_peek$arity$1 = function(node) {
  var this__11356 = this;
  return this__11356.val
};
cljs.core.RedNode.prototype.cljs$core$IStack$_pop$arity$1 = function(node) {
  var this__11357 = this;
  return cljs.core.PersistentVector.fromArray([this__11357.key], true)
};
cljs.core.RedNode.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(node, n, v) {
  var this__11358 = this;
  return cljs.core._assoc_n.call(null, cljs.core.PersistentVector.fromArray([this__11358.key, this__11358.val], true), n, v)
};
cljs.core.RedNode.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11359 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.RedNode.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(node, meta) {
  var this__11360 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.fromArray([this__11360.key, this__11360.val], true), meta)
};
cljs.core.RedNode.prototype.cljs$core$IMeta$_meta$arity$1 = function(node) {
  var this__11361 = this;
  return null
};
cljs.core.RedNode.prototype.cljs$core$IIndexed$_nth$arity$2 = function(node, n) {
  var this__11362 = this;
  if(n === 0) {
    return this__11362.key
  }else {
    if(n === 1) {
      return this__11362.val
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
  var this__11363 = this;
  if(n === 0) {
    return this__11363.key
  }else {
    if(n === 1) {
      return this__11363.val
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
  var this__11364 = this;
  return cljs.core.PersistentVector.EMPTY
};
cljs.core.RedNode;
cljs.core.tree_map_add = function tree_map_add(comp, tree, k, v, found) {
  if(tree == null) {
    return new cljs.core.RedNode(k, v, null, null, null)
  }else {
    var c__11370 = comp.call(null, k, tree.key);
    if(c__11370 === 0) {
      found[0] = tree;
      return null
    }else {
      if(c__11370 < 0) {
        var ins__11371 = tree_map_add.call(null, comp, tree.left, k, v, found);
        if(!(ins__11371 == null)) {
          return tree.add_left(ins__11371)
        }else {
          return null
        }
      }else {
        if("\ufdd0'else") {
          var ins__11372 = tree_map_add.call(null, comp, tree.right, k, v, found);
          if(!(ins__11372 == null)) {
            return tree.add_right(ins__11372)
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
          var app__11375 = tree_map_append.call(null, left.right, right.left);
          if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, app__11375)) {
            return new cljs.core.RedNode(app__11375.key, app__11375.val, new cljs.core.RedNode(left.key, left.val, left.left, app__11375.left, null), new cljs.core.RedNode(right.key, right.val, app__11375.right, right.right, null), null)
          }else {
            return new cljs.core.RedNode(left.key, left.val, left.left, new cljs.core.RedNode(right.key, right.val, app__11375, right.right, null), null)
          }
        }else {
          return new cljs.core.RedNode(left.key, left.val, left.left, tree_map_append.call(null, left.right, right), null)
        }
      }else {
        if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, right)) {
          return new cljs.core.RedNode(right.key, right.val, tree_map_append.call(null, left, right.left), right.right, null)
        }else {
          if("\ufdd0'else") {
            var app__11376 = tree_map_append.call(null, left.right, right.left);
            if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, app__11376)) {
              return new cljs.core.RedNode(app__11376.key, app__11376.val, new cljs.core.BlackNode(left.key, left.val, left.left, app__11376.left, null), new cljs.core.BlackNode(right.key, right.val, app__11376.right, right.right, null), null)
            }else {
              return cljs.core.balance_left_del.call(null, left.key, left.val, left.left, new cljs.core.BlackNode(right.key, right.val, app__11376, right.right, null))
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
    var c__11382 = comp.call(null, k, tree.key);
    if(c__11382 === 0) {
      found[0] = tree;
      return cljs.core.tree_map_append.call(null, tree.left, tree.right)
    }else {
      if(c__11382 < 0) {
        var del__11383 = tree_map_remove.call(null, comp, tree.left, k, found);
        if(function() {
          var or__3824__auto____11384 = !(del__11383 == null);
          if(or__3824__auto____11384) {
            return or__3824__auto____11384
          }else {
            return!(found[0] == null)
          }
        }()) {
          if(cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, tree.left)) {
            return cljs.core.balance_left_del.call(null, tree.key, tree.val, del__11383, tree.right)
          }else {
            return new cljs.core.RedNode(tree.key, tree.val, del__11383, tree.right, null)
          }
        }else {
          return null
        }
      }else {
        if("\ufdd0'else") {
          var del__11385 = tree_map_remove.call(null, comp, tree.right, k, found);
          if(function() {
            var or__3824__auto____11386 = !(del__11385 == null);
            if(or__3824__auto____11386) {
              return or__3824__auto____11386
            }else {
              return!(found[0] == null)
            }
          }()) {
            if(cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, tree.right)) {
              return cljs.core.balance_right_del.call(null, tree.key, tree.val, tree.left, del__11385)
            }else {
              return new cljs.core.RedNode(tree.key, tree.val, tree.left, del__11385, null)
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
  var tk__11389 = tree.key;
  var c__11390 = comp.call(null, k, tk__11389);
  if(c__11390 === 0) {
    return tree.replace(tk__11389, v, tree.left, tree.right)
  }else {
    if(c__11390 < 0) {
      return tree.replace(tk__11389, tree.val, tree_map_replace.call(null, comp, tree.left, k, v), tree.right)
    }else {
      if("\ufdd0'else") {
        return tree.replace(tk__11389, tree.val, tree.left, tree_map_replace.call(null, comp, tree.right, k, v))
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
  var this__11393 = this;
  var h__2192__auto____11394 = this__11393.__hash;
  if(!(h__2192__auto____11394 == null)) {
    return h__2192__auto____11394
  }else {
    var h__2192__auto____11395 = cljs.core.hash_imap.call(null, coll);
    this__11393.__hash = h__2192__auto____11395;
    return h__2192__auto____11395
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__11396 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__11397 = this;
  var n__11398 = coll.entry_at(k);
  if(!(n__11398 == null)) {
    return n__11398.val
  }else {
    return not_found
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__11399 = this;
  var found__11400 = [null];
  var t__11401 = cljs.core.tree_map_add.call(null, this__11399.comp, this__11399.tree, k, v, found__11400);
  if(t__11401 == null) {
    var found_node__11402 = cljs.core.nth.call(null, found__11400, 0);
    if(cljs.core._EQ_.call(null, v, found_node__11402.val)) {
      return coll
    }else {
      return new cljs.core.PersistentTreeMap(this__11399.comp, cljs.core.tree_map_replace.call(null, this__11399.comp, this__11399.tree, k, v), this__11399.cnt, this__11399.meta, null)
    }
  }else {
    return new cljs.core.PersistentTreeMap(this__11399.comp, t__11401.blacken(), this__11399.cnt + 1, this__11399.meta, null)
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__11403 = this;
  return!(coll.entry_at(k) == null)
};
cljs.core.PersistentTreeMap.prototype.call = function() {
  var G__11437 = null;
  var G__11437__2 = function(this_sym11404, k) {
    var this__11406 = this;
    var this_sym11404__11407 = this;
    var coll__11408 = this_sym11404__11407;
    return coll__11408.cljs$core$ILookup$_lookup$arity$2(coll__11408, k)
  };
  var G__11437__3 = function(this_sym11405, k, not_found) {
    var this__11406 = this;
    var this_sym11405__11409 = this;
    var coll__11410 = this_sym11405__11409;
    return coll__11410.cljs$core$ILookup$_lookup$arity$3(coll__11410, k, not_found)
  };
  G__11437 = function(this_sym11405, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11437__2.call(this, this_sym11405, k);
      case 3:
        return G__11437__3.call(this, this_sym11405, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11437
}();
cljs.core.PersistentTreeMap.prototype.apply = function(this_sym11391, args11392) {
  var this__11411 = this;
  return this_sym11391.call.apply(this_sym11391, [this_sym11391].concat(args11392.slice()))
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(coll, f, init) {
  var this__11412 = this;
  if(!(this__11412.tree == null)) {
    return cljs.core.tree_map_kv_reduce.call(null, this__11412.tree, f, init)
  }else {
    return init
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__11413 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__11414 = this;
  if(this__11414.cnt > 0) {
    return cljs.core.create_tree_map_seq.call(null, this__11414.tree, false, this__11414.cnt)
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.toString = function() {
  var this__11415 = this;
  var this__11416 = this;
  return cljs.core.pr_str.call(null, this__11416)
};
cljs.core.PersistentTreeMap.prototype.entry_at = function(k) {
  var this__11417 = this;
  var coll__11418 = this;
  var t__11419 = this__11417.tree;
  while(true) {
    if(!(t__11419 == null)) {
      var c__11420 = this__11417.comp.call(null, k, t__11419.key);
      if(c__11420 === 0) {
        return t__11419
      }else {
        if(c__11420 < 0) {
          var G__11438 = t__11419.left;
          t__11419 = G__11438;
          continue
        }else {
          if("\ufdd0'else") {
            var G__11439 = t__11419.right;
            t__11419 = G__11439;
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
  var this__11421 = this;
  if(this__11421.cnt > 0) {
    return cljs.core.create_tree_map_seq.call(null, this__11421.tree, ascending_QMARK_, this__11421.cnt)
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISorted$_sorted_seq_from$arity$3 = function(coll, k, ascending_QMARK_) {
  var this__11422 = this;
  if(this__11422.cnt > 0) {
    var stack__11423 = null;
    var t__11424 = this__11422.tree;
    while(true) {
      if(!(t__11424 == null)) {
        var c__11425 = this__11422.comp.call(null, k, t__11424.key);
        if(c__11425 === 0) {
          return new cljs.core.PersistentTreeMapSeq(null, cljs.core.conj.call(null, stack__11423, t__11424), ascending_QMARK_, -1, null)
        }else {
          if(cljs.core.truth_(ascending_QMARK_)) {
            if(c__11425 < 0) {
              var G__11440 = cljs.core.conj.call(null, stack__11423, t__11424);
              var G__11441 = t__11424.left;
              stack__11423 = G__11440;
              t__11424 = G__11441;
              continue
            }else {
              var G__11442 = stack__11423;
              var G__11443 = t__11424.right;
              stack__11423 = G__11442;
              t__11424 = G__11443;
              continue
            }
          }else {
            if("\ufdd0'else") {
              if(c__11425 > 0) {
                var G__11444 = cljs.core.conj.call(null, stack__11423, t__11424);
                var G__11445 = t__11424.right;
                stack__11423 = G__11444;
                t__11424 = G__11445;
                continue
              }else {
                var G__11446 = stack__11423;
                var G__11447 = t__11424.left;
                stack__11423 = G__11446;
                t__11424 = G__11447;
                continue
              }
            }else {
              return null
            }
          }
        }
      }else {
        if(stack__11423 == null) {
          return new cljs.core.PersistentTreeMapSeq(null, stack__11423, ascending_QMARK_, -1, null)
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
  var this__11426 = this;
  return cljs.core.key.call(null, entry)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISorted$_comparator$arity$1 = function(coll) {
  var this__11427 = this;
  return this__11427.comp
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__11428 = this;
  if(this__11428.cnt > 0) {
    return cljs.core.create_tree_map_seq.call(null, this__11428.tree, true, this__11428.cnt)
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__11429 = this;
  return this__11429.cnt
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11430 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11431 = this;
  return new cljs.core.PersistentTreeMap(this__11431.comp, this__11431.tree, this__11431.cnt, meta, this__11431.__hash)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11432 = this;
  return this__11432.meta
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__11433 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentTreeMap.EMPTY, this__11433.meta)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__11434 = this;
  var found__11435 = [null];
  var t__11436 = cljs.core.tree_map_remove.call(null, this__11434.comp, this__11434.tree, k, found__11435);
  if(t__11436 == null) {
    if(cljs.core.nth.call(null, found__11435, 0) == null) {
      return coll
    }else {
      return new cljs.core.PersistentTreeMap(this__11434.comp, null, 0, this__11434.meta, null)
    }
  }else {
    return new cljs.core.PersistentTreeMap(this__11434.comp, t__11436.blacken(), this__11434.cnt - 1, this__11434.meta, null)
  }
};
cljs.core.PersistentTreeMap;
cljs.core.PersistentTreeMap.EMPTY = new cljs.core.PersistentTreeMap(cljs.core.compare, null, 0, null, 0);
cljs.core.hash_map = function() {
  var hash_map__delegate = function(keyvals) {
    var in__11450 = cljs.core.seq.call(null, keyvals);
    var out__11451 = cljs.core.transient$.call(null, cljs.core.PersistentHashMap.EMPTY);
    while(true) {
      if(in__11450) {
        var G__11452 = cljs.core.nnext.call(null, in__11450);
        var G__11453 = cljs.core.assoc_BANG_.call(null, out__11451, cljs.core.first.call(null, in__11450), cljs.core.second.call(null, in__11450));
        in__11450 = G__11452;
        out__11451 = G__11453;
        continue
      }else {
        return cljs.core.persistent_BANG_.call(null, out__11451)
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
  hash_map.cljs$lang$applyTo = function(arglist__11454) {
    var keyvals = cljs.core.seq(arglist__11454);
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
  array_map.cljs$lang$applyTo = function(arglist__11455) {
    var keyvals = cljs.core.seq(arglist__11455);
    return array_map__delegate(keyvals)
  };
  array_map.cljs$lang$arity$variadic = array_map__delegate;
  return array_map
}();
cljs.core.obj_map = function() {
  var obj_map__delegate = function(keyvals) {
    var ks__11459 = [];
    var obj__11460 = {};
    var kvs__11461 = cljs.core.seq.call(null, keyvals);
    while(true) {
      if(kvs__11461) {
        ks__11459.push(cljs.core.first.call(null, kvs__11461));
        obj__11460[cljs.core.first.call(null, kvs__11461)] = cljs.core.second.call(null, kvs__11461);
        var G__11462 = cljs.core.nnext.call(null, kvs__11461);
        kvs__11461 = G__11462;
        continue
      }else {
        return cljs.core.ObjMap.fromObject.call(null, ks__11459, obj__11460)
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
  obj_map.cljs$lang$applyTo = function(arglist__11463) {
    var keyvals = cljs.core.seq(arglist__11463);
    return obj_map__delegate(keyvals)
  };
  obj_map.cljs$lang$arity$variadic = obj_map__delegate;
  return obj_map
}();
cljs.core.sorted_map = function() {
  var sorted_map__delegate = function(keyvals) {
    var in__11466 = cljs.core.seq.call(null, keyvals);
    var out__11467 = cljs.core.PersistentTreeMap.EMPTY;
    while(true) {
      if(in__11466) {
        var G__11468 = cljs.core.nnext.call(null, in__11466);
        var G__11469 = cljs.core.assoc.call(null, out__11467, cljs.core.first.call(null, in__11466), cljs.core.second.call(null, in__11466));
        in__11466 = G__11468;
        out__11467 = G__11469;
        continue
      }else {
        return out__11467
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
  sorted_map.cljs$lang$applyTo = function(arglist__11470) {
    var keyvals = cljs.core.seq(arglist__11470);
    return sorted_map__delegate(keyvals)
  };
  sorted_map.cljs$lang$arity$variadic = sorted_map__delegate;
  return sorted_map
}();
cljs.core.sorted_map_by = function() {
  var sorted_map_by__delegate = function(comparator, keyvals) {
    var in__11473 = cljs.core.seq.call(null, keyvals);
    var out__11474 = new cljs.core.PersistentTreeMap(comparator, null, 0, null, 0);
    while(true) {
      if(in__11473) {
        var G__11475 = cljs.core.nnext.call(null, in__11473);
        var G__11476 = cljs.core.assoc.call(null, out__11474, cljs.core.first.call(null, in__11473), cljs.core.second.call(null, in__11473));
        in__11473 = G__11475;
        out__11474 = G__11476;
        continue
      }else {
        return out__11474
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
  sorted_map_by.cljs$lang$applyTo = function(arglist__11477) {
    var comparator = cljs.core.first(arglist__11477);
    var keyvals = cljs.core.rest(arglist__11477);
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
      return cljs.core.reduce.call(null, function(p1__11478_SHARP_, p2__11479_SHARP_) {
        return cljs.core.conj.call(null, function() {
          var or__3824__auto____11481 = p1__11478_SHARP_;
          if(cljs.core.truth_(or__3824__auto____11481)) {
            return or__3824__auto____11481
          }else {
            return cljs.core.ObjMap.EMPTY
          }
        }(), p2__11479_SHARP_)
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
  merge.cljs$lang$applyTo = function(arglist__11482) {
    var maps = cljs.core.seq(arglist__11482);
    return merge__delegate(maps)
  };
  merge.cljs$lang$arity$variadic = merge__delegate;
  return merge
}();
cljs.core.merge_with = function() {
  var merge_with__delegate = function(f, maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      var merge_entry__11490 = function(m, e) {
        var k__11488 = cljs.core.first.call(null, e);
        var v__11489 = cljs.core.second.call(null, e);
        if(cljs.core.contains_QMARK_.call(null, m, k__11488)) {
          return cljs.core.assoc.call(null, m, k__11488, f.call(null, cljs.core._lookup.call(null, m, k__11488, null), v__11489))
        }else {
          return cljs.core.assoc.call(null, m, k__11488, v__11489)
        }
      };
      var merge2__11492 = function(m1, m2) {
        return cljs.core.reduce.call(null, merge_entry__11490, function() {
          var or__3824__auto____11491 = m1;
          if(cljs.core.truth_(or__3824__auto____11491)) {
            return or__3824__auto____11491
          }else {
            return cljs.core.ObjMap.EMPTY
          }
        }(), cljs.core.seq.call(null, m2))
      };
      return cljs.core.reduce.call(null, merge2__11492, maps)
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
  merge_with.cljs$lang$applyTo = function(arglist__11493) {
    var f = cljs.core.first(arglist__11493);
    var maps = cljs.core.rest(arglist__11493);
    return merge_with__delegate(f, maps)
  };
  merge_with.cljs$lang$arity$variadic = merge_with__delegate;
  return merge_with
}();
cljs.core.select_keys = function select_keys(map, keyseq) {
  var ret__11498 = cljs.core.ObjMap.EMPTY;
  var keys__11499 = cljs.core.seq.call(null, keyseq);
  while(true) {
    if(keys__11499) {
      var key__11500 = cljs.core.first.call(null, keys__11499);
      var entry__11501 = cljs.core._lookup.call(null, map, key__11500, "\ufdd0'cljs.core/not-found");
      var G__11502 = cljs.core.not_EQ_.call(null, entry__11501, "\ufdd0'cljs.core/not-found") ? cljs.core.assoc.call(null, ret__11498, key__11500, entry__11501) : ret__11498;
      var G__11503 = cljs.core.next.call(null, keys__11499);
      ret__11498 = G__11502;
      keys__11499 = G__11503;
      continue
    }else {
      return ret__11498
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
  var this__11507 = this;
  return new cljs.core.TransientHashSet(cljs.core.transient$.call(null, this__11507.hash_map))
};
cljs.core.PersistentHashSet.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__11508 = this;
  var h__2192__auto____11509 = this__11508.__hash;
  if(!(h__2192__auto____11509 == null)) {
    return h__2192__auto____11509
  }else {
    var h__2192__auto____11510 = cljs.core.hash_iset.call(null, coll);
    this__11508.__hash = h__2192__auto____11510;
    return h__2192__auto____11510
  }
};
cljs.core.PersistentHashSet.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, v) {
  var this__11511 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, v, null)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, v, not_found) {
  var this__11512 = this;
  if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__11512.hash_map, v))) {
    return v
  }else {
    return not_found
  }
};
cljs.core.PersistentHashSet.prototype.call = function() {
  var G__11533 = null;
  var G__11533__2 = function(this_sym11513, k) {
    var this__11515 = this;
    var this_sym11513__11516 = this;
    var coll__11517 = this_sym11513__11516;
    return coll__11517.cljs$core$ILookup$_lookup$arity$2(coll__11517, k)
  };
  var G__11533__3 = function(this_sym11514, k, not_found) {
    var this__11515 = this;
    var this_sym11514__11518 = this;
    var coll__11519 = this_sym11514__11518;
    return coll__11519.cljs$core$ILookup$_lookup$arity$3(coll__11519, k, not_found)
  };
  G__11533 = function(this_sym11514, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11533__2.call(this, this_sym11514, k);
      case 3:
        return G__11533__3.call(this, this_sym11514, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11533
}();
cljs.core.PersistentHashSet.prototype.apply = function(this_sym11505, args11506) {
  var this__11520 = this;
  return this_sym11505.call.apply(this_sym11505, [this_sym11505].concat(args11506.slice()))
};
cljs.core.PersistentHashSet.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__11521 = this;
  return new cljs.core.PersistentHashSet(this__11521.meta, cljs.core.assoc.call(null, this__11521.hash_map, o, null), null)
};
cljs.core.PersistentHashSet.prototype.toString = function() {
  var this__11522 = this;
  var this__11523 = this;
  return cljs.core.pr_str.call(null, this__11523)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__11524 = this;
  return cljs.core.keys.call(null, this__11524.hash_map)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ISet$_disjoin$arity$2 = function(coll, v) {
  var this__11525 = this;
  return new cljs.core.PersistentHashSet(this__11525.meta, cljs.core.dissoc.call(null, this__11525.hash_map, v), null)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__11526 = this;
  return cljs.core.count.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentHashSet.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11527 = this;
  var and__3822__auto____11528 = cljs.core.set_QMARK_.call(null, other);
  if(and__3822__auto____11528) {
    var and__3822__auto____11529 = cljs.core.count.call(null, coll) === cljs.core.count.call(null, other);
    if(and__3822__auto____11529) {
      return cljs.core.every_QMARK_.call(null, function(p1__11504_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__11504_SHARP_)
      }, other)
    }else {
      return and__3822__auto____11529
    }
  }else {
    return and__3822__auto____11528
  }
};
cljs.core.PersistentHashSet.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11530 = this;
  return new cljs.core.PersistentHashSet(meta, this__11530.hash_map, this__11530.__hash)
};
cljs.core.PersistentHashSet.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11531 = this;
  return this__11531.meta
};
cljs.core.PersistentHashSet.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__11532 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentHashSet.EMPTY, this__11532.meta)
};
cljs.core.PersistentHashSet;
cljs.core.PersistentHashSet.EMPTY = new cljs.core.PersistentHashSet(null, cljs.core.hash_map.call(null), 0);
cljs.core.PersistentHashSet.fromArray = function(items) {
  var len__11534 = cljs.core.count.call(null, items);
  var i__11535 = 0;
  var out__11536 = cljs.core.transient$.call(null, cljs.core.PersistentHashSet.EMPTY);
  while(true) {
    if(i__11535 < len__11534) {
      var G__11537 = i__11535 + 1;
      var G__11538 = cljs.core.conj_BANG_.call(null, out__11536, items[i__11535]);
      i__11535 = G__11537;
      out__11536 = G__11538;
      continue
    }else {
      return cljs.core.persistent_BANG_.call(null, out__11536)
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
  var G__11556 = null;
  var G__11556__2 = function(this_sym11542, k) {
    var this__11544 = this;
    var this_sym11542__11545 = this;
    var tcoll__11546 = this_sym11542__11545;
    if(cljs.core._lookup.call(null, this__11544.transient_map, k, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
      return null
    }else {
      return k
    }
  };
  var G__11556__3 = function(this_sym11543, k, not_found) {
    var this__11544 = this;
    var this_sym11543__11547 = this;
    var tcoll__11548 = this_sym11543__11547;
    if(cljs.core._lookup.call(null, this__11544.transient_map, k, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
      return not_found
    }else {
      return k
    }
  };
  G__11556 = function(this_sym11543, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11556__2.call(this, this_sym11543, k);
      case 3:
        return G__11556__3.call(this, this_sym11543, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11556
}();
cljs.core.TransientHashSet.prototype.apply = function(this_sym11540, args11541) {
  var this__11549 = this;
  return this_sym11540.call.apply(this_sym11540, [this_sym11540].concat(args11541.slice()))
};
cljs.core.TransientHashSet.prototype.cljs$core$ILookup$_lookup$arity$2 = function(tcoll, v) {
  var this__11550 = this;
  return tcoll.cljs$core$ILookup$_lookup$arity$3(tcoll, v, null)
};
cljs.core.TransientHashSet.prototype.cljs$core$ILookup$_lookup$arity$3 = function(tcoll, v, not_found) {
  var this__11551 = this;
  if(cljs.core._lookup.call(null, this__11551.transient_map, v, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
    return not_found
  }else {
    return v
  }
};
cljs.core.TransientHashSet.prototype.cljs$core$ICounted$_count$arity$1 = function(tcoll) {
  var this__11552 = this;
  return cljs.core.count.call(null, this__11552.transient_map)
};
cljs.core.TransientHashSet.prototype.cljs$core$ITransientSet$_disjoin_BANG_$arity$2 = function(tcoll, v) {
  var this__11553 = this;
  this__11553.transient_map = cljs.core.dissoc_BANG_.call(null, this__11553.transient_map, v);
  return tcoll
};
cljs.core.TransientHashSet.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, o) {
  var this__11554 = this;
  this__11554.transient_map = cljs.core.assoc_BANG_.call(null, this__11554.transient_map, o, null);
  return tcoll
};
cljs.core.TransientHashSet.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__11555 = this;
  return new cljs.core.PersistentHashSet(null, cljs.core.persistent_BANG_.call(null, this__11555.transient_map), null)
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
  var this__11559 = this;
  var h__2192__auto____11560 = this__11559.__hash;
  if(!(h__2192__auto____11560 == null)) {
    return h__2192__auto____11560
  }else {
    var h__2192__auto____11561 = cljs.core.hash_iset.call(null, coll);
    this__11559.__hash = h__2192__auto____11561;
    return h__2192__auto____11561
  }
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, v) {
  var this__11562 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, v, null)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, v, not_found) {
  var this__11563 = this;
  if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__11563.tree_map, v))) {
    return v
  }else {
    return not_found
  }
};
cljs.core.PersistentTreeSet.prototype.call = function() {
  var G__11589 = null;
  var G__11589__2 = function(this_sym11564, k) {
    var this__11566 = this;
    var this_sym11564__11567 = this;
    var coll__11568 = this_sym11564__11567;
    return coll__11568.cljs$core$ILookup$_lookup$arity$2(coll__11568, k)
  };
  var G__11589__3 = function(this_sym11565, k, not_found) {
    var this__11566 = this;
    var this_sym11565__11569 = this;
    var coll__11570 = this_sym11565__11569;
    return coll__11570.cljs$core$ILookup$_lookup$arity$3(coll__11570, k, not_found)
  };
  G__11589 = function(this_sym11565, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__11589__2.call(this, this_sym11565, k);
      case 3:
        return G__11589__3.call(this, this_sym11565, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__11589
}();
cljs.core.PersistentTreeSet.prototype.apply = function(this_sym11557, args11558) {
  var this__11571 = this;
  return this_sym11557.call.apply(this_sym11557, [this_sym11557].concat(args11558.slice()))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__11572 = this;
  return new cljs.core.PersistentTreeSet(this__11572.meta, cljs.core.assoc.call(null, this__11572.tree_map, o, null), null)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__11573 = this;
  return cljs.core.map.call(null, cljs.core.key, cljs.core.rseq.call(null, this__11573.tree_map))
};
cljs.core.PersistentTreeSet.prototype.toString = function() {
  var this__11574 = this;
  var this__11575 = this;
  return cljs.core.pr_str.call(null, this__11575)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_sorted_seq$arity$2 = function(coll, ascending_QMARK_) {
  var this__11576 = this;
  return cljs.core.map.call(null, cljs.core.key, cljs.core._sorted_seq.call(null, this__11576.tree_map, ascending_QMARK_))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_sorted_seq_from$arity$3 = function(coll, k, ascending_QMARK_) {
  var this__11577 = this;
  return cljs.core.map.call(null, cljs.core.key, cljs.core._sorted_seq_from.call(null, this__11577.tree_map, k, ascending_QMARK_))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_entry_key$arity$2 = function(coll, entry) {
  var this__11578 = this;
  return entry
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_comparator$arity$1 = function(coll) {
  var this__11579 = this;
  return cljs.core._comparator.call(null, this__11579.tree_map)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__11580 = this;
  return cljs.core.keys.call(null, this__11580.tree_map)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISet$_disjoin$arity$2 = function(coll, v) {
  var this__11581 = this;
  return new cljs.core.PersistentTreeSet(this__11581.meta, cljs.core.dissoc.call(null, this__11581.tree_map, v), null)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__11582 = this;
  return cljs.core.count.call(null, this__11582.tree_map)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__11583 = this;
  var and__3822__auto____11584 = cljs.core.set_QMARK_.call(null, other);
  if(and__3822__auto____11584) {
    var and__3822__auto____11585 = cljs.core.count.call(null, coll) === cljs.core.count.call(null, other);
    if(and__3822__auto____11585) {
      return cljs.core.every_QMARK_.call(null, function(p1__11539_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__11539_SHARP_)
      }, other)
    }else {
      return and__3822__auto____11585
    }
  }else {
    return and__3822__auto____11584
  }
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__11586 = this;
  return new cljs.core.PersistentTreeSet(meta, this__11586.tree_map, this__11586.__hash)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__11587 = this;
  return this__11587.meta
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__11588 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentTreeSet.EMPTY, this__11588.meta)
};
cljs.core.PersistentTreeSet;
cljs.core.PersistentTreeSet.EMPTY = new cljs.core.PersistentTreeSet(null, cljs.core.sorted_map.call(null), 0);
cljs.core.hash_set = function() {
  var hash_set = null;
  var hash_set__0 = function() {
    return cljs.core.PersistentHashSet.EMPTY
  };
  var hash_set__1 = function() {
    var G__11594__delegate = function(keys) {
      var in__11592 = cljs.core.seq.call(null, keys);
      var out__11593 = cljs.core.transient$.call(null, cljs.core.PersistentHashSet.EMPTY);
      while(true) {
        if(cljs.core.seq.call(null, in__11592)) {
          var G__11595 = cljs.core.next.call(null, in__11592);
          var G__11596 = cljs.core.conj_BANG_.call(null, out__11593, cljs.core.first.call(null, in__11592));
          in__11592 = G__11595;
          out__11593 = G__11596;
          continue
        }else {
          return cljs.core.persistent_BANG_.call(null, out__11593)
        }
        break
      }
    };
    var G__11594 = function(var_args) {
      var keys = null;
      if(goog.isDef(var_args)) {
        keys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__11594__delegate.call(this, keys)
    };
    G__11594.cljs$lang$maxFixedArity = 0;
    G__11594.cljs$lang$applyTo = function(arglist__11597) {
      var keys = cljs.core.seq(arglist__11597);
      return G__11594__delegate(keys)
    };
    G__11594.cljs$lang$arity$variadic = G__11594__delegate;
    return G__11594
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
  sorted_set.cljs$lang$applyTo = function(arglist__11598) {
    var keys = cljs.core.seq(arglist__11598);
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
  sorted_set_by.cljs$lang$applyTo = function(arglist__11600) {
    var comparator = cljs.core.first(arglist__11600);
    var keys = cljs.core.rest(arglist__11600);
    return sorted_set_by__delegate(comparator, keys)
  };
  sorted_set_by.cljs$lang$arity$variadic = sorted_set_by__delegate;
  return sorted_set_by
}();
cljs.core.replace = function replace(smap, coll) {
  if(cljs.core.vector_QMARK_.call(null, coll)) {
    var n__11606 = cljs.core.count.call(null, coll);
    return cljs.core.reduce.call(null, function(v, i) {
      var temp__3971__auto____11607 = cljs.core.find.call(null, smap, cljs.core.nth.call(null, v, i));
      if(cljs.core.truth_(temp__3971__auto____11607)) {
        var e__11608 = temp__3971__auto____11607;
        return cljs.core.assoc.call(null, v, i, cljs.core.second.call(null, e__11608))
      }else {
        return v
      }
    }, coll, cljs.core.take.call(null, n__11606, cljs.core.iterate.call(null, cljs.core.inc, 0)))
  }else {
    return cljs.core.map.call(null, function(p1__11599_SHARP_) {
      var temp__3971__auto____11609 = cljs.core.find.call(null, smap, p1__11599_SHARP_);
      if(cljs.core.truth_(temp__3971__auto____11609)) {
        var e__11610 = temp__3971__auto____11609;
        return cljs.core.second.call(null, e__11610)
      }else {
        return p1__11599_SHARP_
      }
    }, coll)
  }
};
cljs.core.distinct = function distinct(coll) {
  var step__11640 = function step(xs, seen) {
    return new cljs.core.LazySeq(null, false, function() {
      return function(p__11633, seen) {
        while(true) {
          var vec__11634__11635 = p__11633;
          var f__11636 = cljs.core.nth.call(null, vec__11634__11635, 0, null);
          var xs__11637 = vec__11634__11635;
          var temp__3974__auto____11638 = cljs.core.seq.call(null, xs__11637);
          if(temp__3974__auto____11638) {
            var s__11639 = temp__3974__auto____11638;
            if(cljs.core.contains_QMARK_.call(null, seen, f__11636)) {
              var G__11641 = cljs.core.rest.call(null, s__11639);
              var G__11642 = seen;
              p__11633 = G__11641;
              seen = G__11642;
              continue
            }else {
              return cljs.core.cons.call(null, f__11636, step.call(null, cljs.core.rest.call(null, s__11639), cljs.core.conj.call(null, seen, f__11636)))
            }
          }else {
            return null
          }
          break
        }
      }.call(null, xs, seen)
    }, null)
  };
  return step__11640.call(null, coll, cljs.core.PersistentHashSet.EMPTY)
};
cljs.core.butlast = function butlast(s) {
  var ret__11645 = cljs.core.PersistentVector.EMPTY;
  var s__11646 = s;
  while(true) {
    if(cljs.core.next.call(null, s__11646)) {
      var G__11647 = cljs.core.conj.call(null, ret__11645, cljs.core.first.call(null, s__11646));
      var G__11648 = cljs.core.next.call(null, s__11646);
      ret__11645 = G__11647;
      s__11646 = G__11648;
      continue
    }else {
      return cljs.core.seq.call(null, ret__11645)
    }
    break
  }
};
cljs.core.name = function name(x) {
  if(cljs.core.string_QMARK_.call(null, x)) {
    return x
  }else {
    if(function() {
      var or__3824__auto____11651 = cljs.core.keyword_QMARK_.call(null, x);
      if(or__3824__auto____11651) {
        return or__3824__auto____11651
      }else {
        return cljs.core.symbol_QMARK_.call(null, x)
      }
    }()) {
      var i__11652 = x.lastIndexOf("/");
      if(i__11652 < 0) {
        return cljs.core.subs.call(null, x, 2)
      }else {
        return cljs.core.subs.call(null, x, i__11652 + 1)
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
    var or__3824__auto____11655 = cljs.core.keyword_QMARK_.call(null, x);
    if(or__3824__auto____11655) {
      return or__3824__auto____11655
    }else {
      return cljs.core.symbol_QMARK_.call(null, x)
    }
  }()) {
    var i__11656 = x.lastIndexOf("/");
    if(i__11656 > -1) {
      return cljs.core.subs.call(null, x, 2, i__11656)
    }else {
      return null
    }
  }else {
    throw new Error([cljs.core.str("Doesn't support namespace: "), cljs.core.str(x)].join(""));
  }
};
cljs.core.zipmap = function zipmap(keys, vals) {
  var map__11663 = cljs.core.ObjMap.EMPTY;
  var ks__11664 = cljs.core.seq.call(null, keys);
  var vs__11665 = cljs.core.seq.call(null, vals);
  while(true) {
    if(function() {
      var and__3822__auto____11666 = ks__11664;
      if(and__3822__auto____11666) {
        return vs__11665
      }else {
        return and__3822__auto____11666
      }
    }()) {
      var G__11667 = cljs.core.assoc.call(null, map__11663, cljs.core.first.call(null, ks__11664), cljs.core.first.call(null, vs__11665));
      var G__11668 = cljs.core.next.call(null, ks__11664);
      var G__11669 = cljs.core.next.call(null, vs__11665);
      map__11663 = G__11667;
      ks__11664 = G__11668;
      vs__11665 = G__11669;
      continue
    }else {
      return map__11663
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
    var G__11672__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__11657_SHARP_, p2__11658_SHARP_) {
        return max_key.call(null, k, p1__11657_SHARP_, p2__11658_SHARP_)
      }, max_key.call(null, k, x, y), more)
    };
    var G__11672 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__11672__delegate.call(this, k, x, y, more)
    };
    G__11672.cljs$lang$maxFixedArity = 3;
    G__11672.cljs$lang$applyTo = function(arglist__11673) {
      var k = cljs.core.first(arglist__11673);
      var x = cljs.core.first(cljs.core.next(arglist__11673));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11673)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11673)));
      return G__11672__delegate(k, x, y, more)
    };
    G__11672.cljs$lang$arity$variadic = G__11672__delegate;
    return G__11672
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
    var G__11674__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__11670_SHARP_, p2__11671_SHARP_) {
        return min_key.call(null, k, p1__11670_SHARP_, p2__11671_SHARP_)
      }, min_key.call(null, k, x, y), more)
    };
    var G__11674 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__11674__delegate.call(this, k, x, y, more)
    };
    G__11674.cljs$lang$maxFixedArity = 3;
    G__11674.cljs$lang$applyTo = function(arglist__11675) {
      var k = cljs.core.first(arglist__11675);
      var x = cljs.core.first(cljs.core.next(arglist__11675));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11675)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11675)));
      return G__11674__delegate(k, x, y, more)
    };
    G__11674.cljs$lang$arity$variadic = G__11674__delegate;
    return G__11674
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
      var temp__3974__auto____11678 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____11678) {
        var s__11679 = temp__3974__auto____11678;
        return cljs.core.cons.call(null, cljs.core.take.call(null, n, s__11679), partition_all.call(null, n, step, cljs.core.drop.call(null, step, s__11679)))
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
    var temp__3974__auto____11682 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____11682) {
      var s__11683 = temp__3974__auto____11682;
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, s__11683)))) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__11683), take_while.call(null, pred, cljs.core.rest.call(null, s__11683)))
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
    var comp__11685 = cljs.core._comparator.call(null, sc);
    return test.call(null, comp__11685.call(null, cljs.core._entry_key.call(null, sc, e), key), 0)
  }
};
cljs.core.subseq = function() {
  var subseq = null;
  var subseq__3 = function(sc, test, key) {
    var include__11697 = cljs.core.mk_bound_fn.call(null, sc, test, key);
    if(cljs.core.truth_(cljs.core.PersistentHashSet.fromArray([cljs.core._GT_, cljs.core._GT__EQ_]).call(null, test))) {
      var temp__3974__auto____11698 = cljs.core._sorted_seq_from.call(null, sc, key, true);
      if(cljs.core.truth_(temp__3974__auto____11698)) {
        var vec__11699__11700 = temp__3974__auto____11698;
        var e__11701 = cljs.core.nth.call(null, vec__11699__11700, 0, null);
        var s__11702 = vec__11699__11700;
        if(cljs.core.truth_(include__11697.call(null, e__11701))) {
          return s__11702
        }else {
          return cljs.core.next.call(null, s__11702)
        }
      }else {
        return null
      }
    }else {
      return cljs.core.take_while.call(null, include__11697, cljs.core._sorted_seq.call(null, sc, true))
    }
  };
  var subseq__5 = function(sc, start_test, start_key, end_test, end_key) {
    var temp__3974__auto____11703 = cljs.core._sorted_seq_from.call(null, sc, start_key, true);
    if(cljs.core.truth_(temp__3974__auto____11703)) {
      var vec__11704__11705 = temp__3974__auto____11703;
      var e__11706 = cljs.core.nth.call(null, vec__11704__11705, 0, null);
      var s__11707 = vec__11704__11705;
      return cljs.core.take_while.call(null, cljs.core.mk_bound_fn.call(null, sc, end_test, end_key), cljs.core.truth_(cljs.core.mk_bound_fn.call(null, sc, start_test, start_key).call(null, e__11706)) ? s__11707 : cljs.core.next.call(null, s__11707))
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
    var include__11719 = cljs.core.mk_bound_fn.call(null, sc, test, key);
    if(cljs.core.truth_(cljs.core.PersistentHashSet.fromArray([cljs.core._LT_, cljs.core._LT__EQ_]).call(null, test))) {
      var temp__3974__auto____11720 = cljs.core._sorted_seq_from.call(null, sc, key, false);
      if(cljs.core.truth_(temp__3974__auto____11720)) {
        var vec__11721__11722 = temp__3974__auto____11720;
        var e__11723 = cljs.core.nth.call(null, vec__11721__11722, 0, null);
        var s__11724 = vec__11721__11722;
        if(cljs.core.truth_(include__11719.call(null, e__11723))) {
          return s__11724
        }else {
          return cljs.core.next.call(null, s__11724)
        }
      }else {
        return null
      }
    }else {
      return cljs.core.take_while.call(null, include__11719, cljs.core._sorted_seq.call(null, sc, false))
    }
  };
  var rsubseq__5 = function(sc, start_test, start_key, end_test, end_key) {
    var temp__3974__auto____11725 = cljs.core._sorted_seq_from.call(null, sc, end_key, false);
    if(cljs.core.truth_(temp__3974__auto____11725)) {
      var vec__11726__11727 = temp__3974__auto____11725;
      var e__11728 = cljs.core.nth.call(null, vec__11726__11727, 0, null);
      var s__11729 = vec__11726__11727;
      return cljs.core.take_while.call(null, cljs.core.mk_bound_fn.call(null, sc, start_test, start_key), cljs.core.truth_(cljs.core.mk_bound_fn.call(null, sc, end_test, end_key).call(null, e__11728)) ? s__11729 : cljs.core.next.call(null, s__11729))
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
  var this__11730 = this;
  var h__2192__auto____11731 = this__11730.__hash;
  if(!(h__2192__auto____11731 == null)) {
    return h__2192__auto____11731
  }else {
    var h__2192__auto____11732 = cljs.core.hash_coll.call(null, rng);
    this__11730.__hash = h__2192__auto____11732;
    return h__2192__auto____11732
  }
};
cljs.core.Range.prototype.cljs$core$INext$_next$arity$1 = function(rng) {
  var this__11733 = this;
  if(this__11733.step > 0) {
    if(this__11733.start + this__11733.step < this__11733.end) {
      return new cljs.core.Range(this__11733.meta, this__11733.start + this__11733.step, this__11733.end, this__11733.step, null)
    }else {
      return null
    }
  }else {
    if(this__11733.start + this__11733.step > this__11733.end) {
      return new cljs.core.Range(this__11733.meta, this__11733.start + this__11733.step, this__11733.end, this__11733.step, null)
    }else {
      return null
    }
  }
};
cljs.core.Range.prototype.cljs$core$ICollection$_conj$arity$2 = function(rng, o) {
  var this__11734 = this;
  return cljs.core.cons.call(null, o, rng)
};
cljs.core.Range.prototype.toString = function() {
  var this__11735 = this;
  var this__11736 = this;
  return cljs.core.pr_str.call(null, this__11736)
};
cljs.core.Range.prototype.cljs$core$IReduce$_reduce$arity$2 = function(rng, f) {
  var this__11737 = this;
  return cljs.core.ci_reduce.call(null, rng, f)
};
cljs.core.Range.prototype.cljs$core$IReduce$_reduce$arity$3 = function(rng, f, s) {
  var this__11738 = this;
  return cljs.core.ci_reduce.call(null, rng, f, s)
};
cljs.core.Range.prototype.cljs$core$ISeqable$_seq$arity$1 = function(rng) {
  var this__11739 = this;
  if(this__11739.step > 0) {
    if(this__11739.start < this__11739.end) {
      return rng
    }else {
      return null
    }
  }else {
    if(this__11739.start > this__11739.end) {
      return rng
    }else {
      return null
    }
  }
};
cljs.core.Range.prototype.cljs$core$ICounted$_count$arity$1 = function(rng) {
  var this__11740 = this;
  if(cljs.core.not.call(null, rng.cljs$core$ISeqable$_seq$arity$1(rng))) {
    return 0
  }else {
    return Math.ceil((this__11740.end - this__11740.start) / this__11740.step)
  }
};
cljs.core.Range.prototype.cljs$core$ISeq$_first$arity$1 = function(rng) {
  var this__11741 = this;
  return this__11741.start
};
cljs.core.Range.prototype.cljs$core$ISeq$_rest$arity$1 = function(rng) {
  var this__11742 = this;
  if(!(rng.cljs$core$ISeqable$_seq$arity$1(rng) == null)) {
    return new cljs.core.Range(this__11742.meta, this__11742.start + this__11742.step, this__11742.end, this__11742.step, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(rng, other) {
  var this__11743 = this;
  return cljs.core.equiv_sequential.call(null, rng, other)
};
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(rng, meta) {
  var this__11744 = this;
  return new cljs.core.Range(meta, this__11744.start, this__11744.end, this__11744.step, this__11744.__hash)
};
cljs.core.Range.prototype.cljs$core$IMeta$_meta$arity$1 = function(rng) {
  var this__11745 = this;
  return this__11745.meta
};
cljs.core.Range.prototype.cljs$core$IIndexed$_nth$arity$2 = function(rng, n) {
  var this__11746 = this;
  if(n < rng.cljs$core$ICounted$_count$arity$1(rng)) {
    return this__11746.start + n * this__11746.step
  }else {
    if(function() {
      var and__3822__auto____11747 = this__11746.start > this__11746.end;
      if(and__3822__auto____11747) {
        return this__11746.step === 0
      }else {
        return and__3822__auto____11747
      }
    }()) {
      return this__11746.start
    }else {
      throw new Error("Index out of bounds");
    }
  }
};
cljs.core.Range.prototype.cljs$core$IIndexed$_nth$arity$3 = function(rng, n, not_found) {
  var this__11748 = this;
  if(n < rng.cljs$core$ICounted$_count$arity$1(rng)) {
    return this__11748.start + n * this__11748.step
  }else {
    if(function() {
      var and__3822__auto____11749 = this__11748.start > this__11748.end;
      if(and__3822__auto____11749) {
        return this__11748.step === 0
      }else {
        return and__3822__auto____11749
      }
    }()) {
      return this__11748.start
    }else {
      return not_found
    }
  }
};
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(rng) {
  var this__11750 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__11750.meta)
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
    var temp__3974__auto____11753 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____11753) {
      var s__11754 = temp__3974__auto____11753;
      return cljs.core.cons.call(null, cljs.core.first.call(null, s__11754), take_nth.call(null, n, cljs.core.drop.call(null, n, s__11754)))
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
    var temp__3974__auto____11761 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____11761) {
      var s__11762 = temp__3974__auto____11761;
      var fst__11763 = cljs.core.first.call(null, s__11762);
      var fv__11764 = f.call(null, fst__11763);
      var run__11765 = cljs.core.cons.call(null, fst__11763, cljs.core.take_while.call(null, function(p1__11755_SHARP_) {
        return cljs.core._EQ_.call(null, fv__11764, f.call(null, p1__11755_SHARP_))
      }, cljs.core.next.call(null, s__11762)));
      return cljs.core.cons.call(null, run__11765, partition_by.call(null, f, cljs.core.seq.call(null, cljs.core.drop.call(null, cljs.core.count.call(null, run__11765), s__11762))))
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
      var temp__3971__auto____11780 = cljs.core.seq.call(null, coll);
      if(temp__3971__auto____11780) {
        var s__11781 = temp__3971__auto____11780;
        return reductions.call(null, f, cljs.core.first.call(null, s__11781), cljs.core.rest.call(null, s__11781))
      }else {
        return cljs.core.list.call(null, f.call(null))
      }
    }, null)
  };
  var reductions__3 = function(f, init, coll) {
    return cljs.core.cons.call(null, init, new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____11782 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____11782) {
        var s__11783 = temp__3974__auto____11782;
        return reductions.call(null, f, f.call(null, init, cljs.core.first.call(null, s__11783)), cljs.core.rest.call(null, s__11783))
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
      var G__11786 = null;
      var G__11786__0 = function() {
        return cljs.core.vector.call(null, f.call(null))
      };
      var G__11786__1 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x))
      };
      var G__11786__2 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y))
      };
      var G__11786__3 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z))
      };
      var G__11786__4 = function() {
        var G__11787__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args))
        };
        var G__11787 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__11787__delegate.call(this, x, y, z, args)
        };
        G__11787.cljs$lang$maxFixedArity = 3;
        G__11787.cljs$lang$applyTo = function(arglist__11788) {
          var x = cljs.core.first(arglist__11788);
          var y = cljs.core.first(cljs.core.next(arglist__11788));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11788)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11788)));
          return G__11787__delegate(x, y, z, args)
        };
        G__11787.cljs$lang$arity$variadic = G__11787__delegate;
        return G__11787
      }();
      G__11786 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__11786__0.call(this);
          case 1:
            return G__11786__1.call(this, x);
          case 2:
            return G__11786__2.call(this, x, y);
          case 3:
            return G__11786__3.call(this, x, y, z);
          default:
            return G__11786__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__11786.cljs$lang$maxFixedArity = 3;
      G__11786.cljs$lang$applyTo = G__11786__4.cljs$lang$applyTo;
      return G__11786
    }()
  };
  var juxt__2 = function(f, g) {
    return function() {
      var G__11789 = null;
      var G__11789__0 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null))
      };
      var G__11789__1 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x))
      };
      var G__11789__2 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y))
      };
      var G__11789__3 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z))
      };
      var G__11789__4 = function() {
        var G__11790__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__11790 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__11790__delegate.call(this, x, y, z, args)
        };
        G__11790.cljs$lang$maxFixedArity = 3;
        G__11790.cljs$lang$applyTo = function(arglist__11791) {
          var x = cljs.core.first(arglist__11791);
          var y = cljs.core.first(cljs.core.next(arglist__11791));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11791)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11791)));
          return G__11790__delegate(x, y, z, args)
        };
        G__11790.cljs$lang$arity$variadic = G__11790__delegate;
        return G__11790
      }();
      G__11789 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__11789__0.call(this);
          case 1:
            return G__11789__1.call(this, x);
          case 2:
            return G__11789__2.call(this, x, y);
          case 3:
            return G__11789__3.call(this, x, y, z);
          default:
            return G__11789__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__11789.cljs$lang$maxFixedArity = 3;
      G__11789.cljs$lang$applyTo = G__11789__4.cljs$lang$applyTo;
      return G__11789
    }()
  };
  var juxt__3 = function(f, g, h) {
    return function() {
      var G__11792 = null;
      var G__11792__0 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null), h.call(null))
      };
      var G__11792__1 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x), h.call(null, x))
      };
      var G__11792__2 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y), h.call(null, x, y))
      };
      var G__11792__3 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z), h.call(null, x, y, z))
      };
      var G__11792__4 = function() {
        var G__11793__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args), cljs.core.apply.call(null, h, x, y, z, args))
        };
        var G__11793 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__11793__delegate.call(this, x, y, z, args)
        };
        G__11793.cljs$lang$maxFixedArity = 3;
        G__11793.cljs$lang$applyTo = function(arglist__11794) {
          var x = cljs.core.first(arglist__11794);
          var y = cljs.core.first(cljs.core.next(arglist__11794));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11794)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11794)));
          return G__11793__delegate(x, y, z, args)
        };
        G__11793.cljs$lang$arity$variadic = G__11793__delegate;
        return G__11793
      }();
      G__11792 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__11792__0.call(this);
          case 1:
            return G__11792__1.call(this, x);
          case 2:
            return G__11792__2.call(this, x, y);
          case 3:
            return G__11792__3.call(this, x, y, z);
          default:
            return G__11792__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__11792.cljs$lang$maxFixedArity = 3;
      G__11792.cljs$lang$applyTo = G__11792__4.cljs$lang$applyTo;
      return G__11792
    }()
  };
  var juxt__4 = function() {
    var G__11795__delegate = function(f, g, h, fs) {
      var fs__11785 = cljs.core.list_STAR_.call(null, f, g, h, fs);
      return function() {
        var G__11796 = null;
        var G__11796__0 = function() {
          return cljs.core.reduce.call(null, function(p1__11766_SHARP_, p2__11767_SHARP_) {
            return cljs.core.conj.call(null, p1__11766_SHARP_, p2__11767_SHARP_.call(null))
          }, cljs.core.PersistentVector.EMPTY, fs__11785)
        };
        var G__11796__1 = function(x) {
          return cljs.core.reduce.call(null, function(p1__11768_SHARP_, p2__11769_SHARP_) {
            return cljs.core.conj.call(null, p1__11768_SHARP_, p2__11769_SHARP_.call(null, x))
          }, cljs.core.PersistentVector.EMPTY, fs__11785)
        };
        var G__11796__2 = function(x, y) {
          return cljs.core.reduce.call(null, function(p1__11770_SHARP_, p2__11771_SHARP_) {
            return cljs.core.conj.call(null, p1__11770_SHARP_, p2__11771_SHARP_.call(null, x, y))
          }, cljs.core.PersistentVector.EMPTY, fs__11785)
        };
        var G__11796__3 = function(x, y, z) {
          return cljs.core.reduce.call(null, function(p1__11772_SHARP_, p2__11773_SHARP_) {
            return cljs.core.conj.call(null, p1__11772_SHARP_, p2__11773_SHARP_.call(null, x, y, z))
          }, cljs.core.PersistentVector.EMPTY, fs__11785)
        };
        var G__11796__4 = function() {
          var G__11797__delegate = function(x, y, z, args) {
            return cljs.core.reduce.call(null, function(p1__11774_SHARP_, p2__11775_SHARP_) {
              return cljs.core.conj.call(null, p1__11774_SHARP_, cljs.core.apply.call(null, p2__11775_SHARP_, x, y, z, args))
            }, cljs.core.PersistentVector.EMPTY, fs__11785)
          };
          var G__11797 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__11797__delegate.call(this, x, y, z, args)
          };
          G__11797.cljs$lang$maxFixedArity = 3;
          G__11797.cljs$lang$applyTo = function(arglist__11798) {
            var x = cljs.core.first(arglist__11798);
            var y = cljs.core.first(cljs.core.next(arglist__11798));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11798)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11798)));
            return G__11797__delegate(x, y, z, args)
          };
          G__11797.cljs$lang$arity$variadic = G__11797__delegate;
          return G__11797
        }();
        G__11796 = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return G__11796__0.call(this);
            case 1:
              return G__11796__1.call(this, x);
            case 2:
              return G__11796__2.call(this, x, y);
            case 3:
              return G__11796__3.call(this, x, y, z);
            default:
              return G__11796__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
          }
          throw"Invalid arity: " + arguments.length;
        };
        G__11796.cljs$lang$maxFixedArity = 3;
        G__11796.cljs$lang$applyTo = G__11796__4.cljs$lang$applyTo;
        return G__11796
      }()
    };
    var G__11795 = function(f, g, h, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__11795__delegate.call(this, f, g, h, fs)
    };
    G__11795.cljs$lang$maxFixedArity = 3;
    G__11795.cljs$lang$applyTo = function(arglist__11799) {
      var f = cljs.core.first(arglist__11799);
      var g = cljs.core.first(cljs.core.next(arglist__11799));
      var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11799)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11799)));
      return G__11795__delegate(f, g, h, fs)
    };
    G__11795.cljs$lang$arity$variadic = G__11795__delegate;
    return G__11795
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
        var G__11802 = cljs.core.next.call(null, coll);
        coll = G__11802;
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
        var and__3822__auto____11801 = cljs.core.seq.call(null, coll);
        if(and__3822__auto____11801) {
          return n > 0
        }else {
          return and__3822__auto____11801
        }
      }())) {
        var G__11803 = n - 1;
        var G__11804 = cljs.core.next.call(null, coll);
        n = G__11803;
        coll = G__11804;
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
  var matches__11806 = re.exec(s);
  if(cljs.core._EQ_.call(null, cljs.core.first.call(null, matches__11806), s)) {
    if(cljs.core.count.call(null, matches__11806) === 1) {
      return cljs.core.first.call(null, matches__11806)
    }else {
      return cljs.core.vec.call(null, matches__11806)
    }
  }else {
    return null
  }
};
cljs.core.re_find = function re_find(re, s) {
  var matches__11808 = re.exec(s);
  if(matches__11808 == null) {
    return null
  }else {
    if(cljs.core.count.call(null, matches__11808) === 1) {
      return cljs.core.first.call(null, matches__11808)
    }else {
      return cljs.core.vec.call(null, matches__11808)
    }
  }
};
cljs.core.re_seq = function re_seq(re, s) {
  var match_data__11813 = cljs.core.re_find.call(null, re, s);
  var match_idx__11814 = s.search(re);
  var match_str__11815 = cljs.core.coll_QMARK_.call(null, match_data__11813) ? cljs.core.first.call(null, match_data__11813) : match_data__11813;
  var post_match__11816 = cljs.core.subs.call(null, s, match_idx__11814 + cljs.core.count.call(null, match_str__11815));
  if(cljs.core.truth_(match_data__11813)) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, match_data__11813, re_seq.call(null, re, post_match__11816))
    }, null)
  }else {
    return null
  }
};
cljs.core.re_pattern = function re_pattern(s) {
  var vec__11823__11824 = cljs.core.re_find.call(null, /^(?:\(\?([idmsux]*)\))?(.*)/, s);
  var ___11825 = cljs.core.nth.call(null, vec__11823__11824, 0, null);
  var flags__11826 = cljs.core.nth.call(null, vec__11823__11824, 1, null);
  var pattern__11827 = cljs.core.nth.call(null, vec__11823__11824, 2, null);
  return new RegExp(pattern__11827, flags__11826)
};
cljs.core.pr_sequential = function pr_sequential(print_one, begin, sep, end, opts, coll) {
  return cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([begin], true), cljs.core.flatten1.call(null, cljs.core.interpose.call(null, cljs.core.PersistentVector.fromArray([sep], true), cljs.core.map.call(null, function(p1__11817_SHARP_) {
    return print_one.call(null, p1__11817_SHARP_, opts)
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
          var and__3822__auto____11837 = cljs.core._lookup.call(null, opts, "\ufdd0'meta", null);
          if(cljs.core.truth_(and__3822__auto____11837)) {
            var and__3822__auto____11841 = function() {
              var G__11838__11839 = obj;
              if(G__11838__11839) {
                if(function() {
                  var or__3824__auto____11840 = G__11838__11839.cljs$lang$protocol_mask$partition0$ & 131072;
                  if(or__3824__auto____11840) {
                    return or__3824__auto____11840
                  }else {
                    return G__11838__11839.cljs$core$IMeta$
                  }
                }()) {
                  return true
                }else {
                  if(!G__11838__11839.cljs$lang$protocol_mask$partition0$) {
                    return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, G__11838__11839)
                  }else {
                    return false
                  }
                }
              }else {
                return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, G__11838__11839)
              }
            }();
            if(cljs.core.truth_(and__3822__auto____11841)) {
              return cljs.core.meta.call(null, obj)
            }else {
              return and__3822__auto____11841
            }
          }else {
            return and__3822__auto____11837
          }
        }()) ? cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray(["^"], true), pr_seq.call(null, cljs.core.meta.call(null, obj), opts), cljs.core.PersistentVector.fromArray([" "], true)) : null, function() {
          var and__3822__auto____11842 = !(obj == null);
          if(and__3822__auto____11842) {
            return obj.cljs$lang$type
          }else {
            return and__3822__auto____11842
          }
        }() ? obj.cljs$lang$ctorPrSeq(obj) : function() {
          var G__11843__11844 = obj;
          if(G__11843__11844) {
            if(function() {
              var or__3824__auto____11845 = G__11843__11844.cljs$lang$protocol_mask$partition0$ & 536870912;
              if(or__3824__auto____11845) {
                return or__3824__auto____11845
              }else {
                return G__11843__11844.cljs$core$IPrintable$
              }
            }()) {
              return true
            }else {
              if(!G__11843__11844.cljs$lang$protocol_mask$partition0$) {
                return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, G__11843__11844)
              }else {
                return false
              }
            }
          }else {
            return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, G__11843__11844)
          }
        }() ? cljs.core._pr_seq.call(null, obj, opts) : cljs.core.truth_(cljs.core.regexp_QMARK_.call(null, obj)) ? cljs.core.list.call(null, '#"', obj.source, '"') : "\ufdd0'else" ? cljs.core.list.call(null, "#<", [cljs.core.str(obj)].join(""), ">") : null)
      }else {
        return null
      }
    }
  }
};
cljs.core.pr_sb = function pr_sb(objs, opts) {
  var sb__11865 = new goog.string.StringBuffer;
  var G__11866__11867 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, cljs.core.first.call(null, objs), opts));
  if(G__11866__11867) {
    var string__11868 = cljs.core.first.call(null, G__11866__11867);
    var G__11866__11869 = G__11866__11867;
    while(true) {
      sb__11865.append(string__11868);
      var temp__3974__auto____11870 = cljs.core.next.call(null, G__11866__11869);
      if(temp__3974__auto____11870) {
        var G__11866__11871 = temp__3974__auto____11870;
        var G__11884 = cljs.core.first.call(null, G__11866__11871);
        var G__11885 = G__11866__11871;
        string__11868 = G__11884;
        G__11866__11869 = G__11885;
        continue
      }else {
      }
      break
    }
  }else {
  }
  var G__11872__11873 = cljs.core.seq.call(null, cljs.core.next.call(null, objs));
  if(G__11872__11873) {
    var obj__11874 = cljs.core.first.call(null, G__11872__11873);
    var G__11872__11875 = G__11872__11873;
    while(true) {
      sb__11865.append(" ");
      var G__11876__11877 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__11874, opts));
      if(G__11876__11877) {
        var string__11878 = cljs.core.first.call(null, G__11876__11877);
        var G__11876__11879 = G__11876__11877;
        while(true) {
          sb__11865.append(string__11878);
          var temp__3974__auto____11880 = cljs.core.next.call(null, G__11876__11879);
          if(temp__3974__auto____11880) {
            var G__11876__11881 = temp__3974__auto____11880;
            var G__11886 = cljs.core.first.call(null, G__11876__11881);
            var G__11887 = G__11876__11881;
            string__11878 = G__11886;
            G__11876__11879 = G__11887;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3974__auto____11882 = cljs.core.next.call(null, G__11872__11875);
      if(temp__3974__auto____11882) {
        var G__11872__11883 = temp__3974__auto____11882;
        var G__11888 = cljs.core.first.call(null, G__11872__11883);
        var G__11889 = G__11872__11883;
        obj__11874 = G__11888;
        G__11872__11875 = G__11889;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return sb__11865
};
cljs.core.pr_str_with_opts = function pr_str_with_opts(objs, opts) {
  return[cljs.core.str(cljs.core.pr_sb.call(null, objs, opts))].join("")
};
cljs.core.prn_str_with_opts = function prn_str_with_opts(objs, opts) {
  var sb__11891 = cljs.core.pr_sb.call(null, objs, opts);
  sb__11891.append("\n");
  return[cljs.core.str(sb__11891)].join("")
};
cljs.core.pr_with_opts = function pr_with_opts(objs, opts) {
  var G__11910__11911 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, cljs.core.first.call(null, objs), opts));
  if(G__11910__11911) {
    var string__11912 = cljs.core.first.call(null, G__11910__11911);
    var G__11910__11913 = G__11910__11911;
    while(true) {
      cljs.core.string_print.call(null, string__11912);
      var temp__3974__auto____11914 = cljs.core.next.call(null, G__11910__11913);
      if(temp__3974__auto____11914) {
        var G__11910__11915 = temp__3974__auto____11914;
        var G__11928 = cljs.core.first.call(null, G__11910__11915);
        var G__11929 = G__11910__11915;
        string__11912 = G__11928;
        G__11910__11913 = G__11929;
        continue
      }else {
      }
      break
    }
  }else {
  }
  var G__11916__11917 = cljs.core.seq.call(null, cljs.core.next.call(null, objs));
  if(G__11916__11917) {
    var obj__11918 = cljs.core.first.call(null, G__11916__11917);
    var G__11916__11919 = G__11916__11917;
    while(true) {
      cljs.core.string_print.call(null, " ");
      var G__11920__11921 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__11918, opts));
      if(G__11920__11921) {
        var string__11922 = cljs.core.first.call(null, G__11920__11921);
        var G__11920__11923 = G__11920__11921;
        while(true) {
          cljs.core.string_print.call(null, string__11922);
          var temp__3974__auto____11924 = cljs.core.next.call(null, G__11920__11923);
          if(temp__3974__auto____11924) {
            var G__11920__11925 = temp__3974__auto____11924;
            var G__11930 = cljs.core.first.call(null, G__11920__11925);
            var G__11931 = G__11920__11925;
            string__11922 = G__11930;
            G__11920__11923 = G__11931;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3974__auto____11926 = cljs.core.next.call(null, G__11916__11919);
      if(temp__3974__auto____11926) {
        var G__11916__11927 = temp__3974__auto____11926;
        var G__11932 = cljs.core.first.call(null, G__11916__11927);
        var G__11933 = G__11916__11927;
        obj__11918 = G__11932;
        G__11916__11919 = G__11933;
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
  pr_str.cljs$lang$applyTo = function(arglist__11934) {
    var objs = cljs.core.seq(arglist__11934);
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
  prn_str.cljs$lang$applyTo = function(arglist__11935) {
    var objs = cljs.core.seq(arglist__11935);
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
  pr.cljs$lang$applyTo = function(arglist__11936) {
    var objs = cljs.core.seq(arglist__11936);
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
  cljs_core_print.cljs$lang$applyTo = function(arglist__11937) {
    var objs = cljs.core.seq(arglist__11937);
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
  print_str.cljs$lang$applyTo = function(arglist__11938) {
    var objs = cljs.core.seq(arglist__11938);
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
  println.cljs$lang$applyTo = function(arglist__11939) {
    var objs = cljs.core.seq(arglist__11939);
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
  println_str.cljs$lang$applyTo = function(arglist__11940) {
    var objs = cljs.core.seq(arglist__11940);
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
  prn.cljs$lang$applyTo = function(arglist__11941) {
    var objs = cljs.core.seq(arglist__11941);
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
  printf.cljs$lang$applyTo = function(arglist__11942) {
    var fmt = cljs.core.first(arglist__11942);
    var args = cljs.core.rest(arglist__11942);
    return printf__delegate(fmt, args)
  };
  printf.cljs$lang$arity$variadic = printf__delegate;
  return printf
}();
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__11943 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__11943, "{", ", ", "}", opts, coll)
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
  var pr_pair__11944 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__11944, "{", ", ", "}", opts, coll)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentArrayMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__11945 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__11945, "{", ", ", "}", opts, coll)
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
      var temp__3974__auto____11946 = cljs.core.namespace.call(null, obj);
      if(cljs.core.truth_(temp__3974__auto____11946)) {
        var nspc__11947 = temp__3974__auto____11946;
        return[cljs.core.str(nspc__11947), cljs.core.str("/")].join("")
      }else {
        return null
      }
    }()), cljs.core.str(cljs.core.name.call(null, obj))].join(""))
  }else {
    if(cljs.core.symbol_QMARK_.call(null, obj)) {
      return cljs.core.list.call(null, [cljs.core.str(function() {
        var temp__3974__auto____11948 = cljs.core.namespace.call(null, obj);
        if(cljs.core.truth_(temp__3974__auto____11948)) {
          var nspc__11949 = temp__3974__auto____11948;
          return[cljs.core.str(nspc__11949), cljs.core.str("/")].join("")
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
  var pr_pair__11950 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__11950, "{", ", ", "}", opts, coll)
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
  var normalize__11952 = function(n, len) {
    var ns__11951 = [cljs.core.str(n)].join("");
    while(true) {
      if(cljs.core.count.call(null, ns__11951) < len) {
        var G__11954 = [cljs.core.str("0"), cljs.core.str(ns__11951)].join("");
        ns__11951 = G__11954;
        continue
      }else {
        return ns__11951
      }
      break
    }
  };
  return cljs.core.list.call(null, [cljs.core.str('#inst "'), cljs.core.str(d.getUTCFullYear()), cljs.core.str("-"), cljs.core.str(normalize__11952.call(null, d.getUTCMonth() + 1, 2)), cljs.core.str("-"), cljs.core.str(normalize__11952.call(null, d.getUTCDate(), 2)), cljs.core.str("T"), cljs.core.str(normalize__11952.call(null, d.getUTCHours(), 2)), cljs.core.str(":"), cljs.core.str(normalize__11952.call(null, d.getUTCMinutes(), 2)), cljs.core.str(":"), cljs.core.str(normalize__11952.call(null, d.getUTCSeconds(), 
  2)), cljs.core.str("."), cljs.core.str(normalize__11952.call(null, d.getUTCMilliseconds(), 3)), cljs.core.str("-"), cljs.core.str('00:00"')].join(""))
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
  var pr_pair__11953 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__11953, "{", ", ", "}", opts, coll)
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
  var this__11955 = this;
  return goog.getUid(this$)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches$arity$3 = function(this$, oldval, newval) {
  var this__11956 = this;
  var G__11957__11958 = cljs.core.seq.call(null, this__11956.watches);
  if(G__11957__11958) {
    var G__11960__11962 = cljs.core.first.call(null, G__11957__11958);
    var vec__11961__11963 = G__11960__11962;
    var key__11964 = cljs.core.nth.call(null, vec__11961__11963, 0, null);
    var f__11965 = cljs.core.nth.call(null, vec__11961__11963, 1, null);
    var G__11957__11966 = G__11957__11958;
    var G__11960__11967 = G__11960__11962;
    var G__11957__11968 = G__11957__11966;
    while(true) {
      var vec__11969__11970 = G__11960__11967;
      var key__11971 = cljs.core.nth.call(null, vec__11969__11970, 0, null);
      var f__11972 = cljs.core.nth.call(null, vec__11969__11970, 1, null);
      var G__11957__11973 = G__11957__11968;
      f__11972.call(null, key__11971, this$, oldval, newval);
      var temp__3974__auto____11974 = cljs.core.next.call(null, G__11957__11973);
      if(temp__3974__auto____11974) {
        var G__11957__11975 = temp__3974__auto____11974;
        var G__11982 = cljs.core.first.call(null, G__11957__11975);
        var G__11983 = G__11957__11975;
        G__11960__11967 = G__11982;
        G__11957__11968 = G__11983;
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
  var this__11976 = this;
  return this$.watches = cljs.core.assoc.call(null, this__11976.watches, key, f)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch$arity$2 = function(this$, key) {
  var this__11977 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__11977.watches, key)
};
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(a, opts) {
  var this__11978 = this;
  return cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray(["#<Atom: "], true), cljs.core._pr_seq.call(null, this__11978.state, opts), ">")
};
cljs.core.Atom.prototype.cljs$core$IMeta$_meta$arity$1 = function(_) {
  var this__11979 = this;
  return this__11979.meta
};
cljs.core.Atom.prototype.cljs$core$IDeref$_deref$arity$1 = function(_) {
  var this__11980 = this;
  return this__11980.state
};
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(o, other) {
  var this__11981 = this;
  return o === other
};
cljs.core.Atom;
cljs.core.atom = function() {
  var atom = null;
  var atom__1 = function(x) {
    return new cljs.core.Atom(x, null, null, null)
  };
  var atom__2 = function() {
    var G__11995__delegate = function(x, p__11984) {
      var map__11990__11991 = p__11984;
      var map__11990__11992 = cljs.core.seq_QMARK_.call(null, map__11990__11991) ? cljs.core.apply.call(null, cljs.core.hash_map, map__11990__11991) : map__11990__11991;
      var validator__11993 = cljs.core._lookup.call(null, map__11990__11992, "\ufdd0'validator", null);
      var meta__11994 = cljs.core._lookup.call(null, map__11990__11992, "\ufdd0'meta", null);
      return new cljs.core.Atom(x, meta__11994, validator__11993, null)
    };
    var G__11995 = function(x, var_args) {
      var p__11984 = null;
      if(goog.isDef(var_args)) {
        p__11984 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__11995__delegate.call(this, x, p__11984)
    };
    G__11995.cljs$lang$maxFixedArity = 1;
    G__11995.cljs$lang$applyTo = function(arglist__11996) {
      var x = cljs.core.first(arglist__11996);
      var p__11984 = cljs.core.rest(arglist__11996);
      return G__11995__delegate(x, p__11984)
    };
    G__11995.cljs$lang$arity$variadic = G__11995__delegate;
    return G__11995
  }();
  atom = function(x, var_args) {
    var p__11984 = var_args;
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
  var temp__3974__auto____12000 = a.validator;
  if(cljs.core.truth_(temp__3974__auto____12000)) {
    var validate__12001 = temp__3974__auto____12000;
    if(cljs.core.truth_(validate__12001.call(null, new_value))) {
    }else {
      throw new Error([cljs.core.str("Assert failed: "), cljs.core.str("Validator rejected reference state"), cljs.core.str("\n"), cljs.core.str(cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'validate", "\ufdd1'new-value"), cljs.core.hash_map("\ufdd0'line", 6440))))].join(""));
    }
  }else {
  }
  var old_value__12002 = a.state;
  a.state = new_value;
  cljs.core._notify_watches.call(null, a, old_value__12002, new_value);
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
    var G__12003__delegate = function(a, f, x, y, z, more) {
      return cljs.core.reset_BANG_.call(null, a, cljs.core.apply.call(null, f, a.state, x, y, z, more))
    };
    var G__12003 = function(a, f, x, y, z, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__12003__delegate.call(this, a, f, x, y, z, more)
    };
    G__12003.cljs$lang$maxFixedArity = 5;
    G__12003.cljs$lang$applyTo = function(arglist__12004) {
      var a = cljs.core.first(arglist__12004);
      var f = cljs.core.first(cljs.core.next(arglist__12004));
      var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__12004)));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__12004))));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__12004)))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__12004)))));
      return G__12003__delegate(a, f, x, y, z, more)
    };
    G__12003.cljs$lang$arity$variadic = G__12003__delegate;
    return G__12003
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
  alter_meta_BANG_.cljs$lang$applyTo = function(arglist__12005) {
    var iref = cljs.core.first(arglist__12005);
    var f = cljs.core.first(cljs.core.next(arglist__12005));
    var args = cljs.core.rest(cljs.core.next(arglist__12005));
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
  var this__12006 = this;
  return(new cljs.core.Keyword("\ufdd0'done")).call(null, cljs.core.deref.call(null, this__12006.state))
};
cljs.core.Delay.prototype.cljs$core$IDeref$_deref$arity$1 = function(_) {
  var this__12007 = this;
  return(new cljs.core.Keyword("\ufdd0'value")).call(null, cljs.core.swap_BANG_.call(null, this__12007.state, function(p__12008) {
    var map__12009__12010 = p__12008;
    var map__12009__12011 = cljs.core.seq_QMARK_.call(null, map__12009__12010) ? cljs.core.apply.call(null, cljs.core.hash_map, map__12009__12010) : map__12009__12010;
    var curr_state__12012 = map__12009__12011;
    var done__12013 = cljs.core._lookup.call(null, map__12009__12011, "\ufdd0'done", null);
    if(cljs.core.truth_(done__12013)) {
      return curr_state__12012
    }else {
      return cljs.core.ObjMap.fromObject(["\ufdd0'done", "\ufdd0'value"], {"\ufdd0'done":true, "\ufdd0'value":this__12007.f.call(null)})
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
    var map__12034__12035 = options;
    var map__12034__12036 = cljs.core.seq_QMARK_.call(null, map__12034__12035) ? cljs.core.apply.call(null, cljs.core.hash_map, map__12034__12035) : map__12034__12035;
    var keywordize_keys__12037 = cljs.core._lookup.call(null, map__12034__12036, "\ufdd0'keywordize-keys", null);
    var keyfn__12038 = cljs.core.truth_(keywordize_keys__12037) ? cljs.core.keyword : cljs.core.str;
    var f__12053 = function thisfn(x) {
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
                var iter__2462__auto____12052 = function iter__12046(s__12047) {
                  return new cljs.core.LazySeq(null, false, function() {
                    var s__12047__12050 = s__12047;
                    while(true) {
                      if(cljs.core.seq.call(null, s__12047__12050)) {
                        var k__12051 = cljs.core.first.call(null, s__12047__12050);
                        return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([keyfn__12038.call(null, k__12051), thisfn.call(null, x[k__12051])], true), iter__12046.call(null, cljs.core.rest.call(null, s__12047__12050)))
                      }else {
                        return null
                      }
                      break
                    }
                  }, null)
                };
                return iter__2462__auto____12052.call(null, cljs.core.js_keys.call(null, x))
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
    return f__12053.call(null, x)
  };
  var js__GT_clj = function(x, var_args) {
    var options = null;
    if(goog.isDef(var_args)) {
      options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return js__GT_clj__delegate.call(this, x, options)
  };
  js__GT_clj.cljs$lang$maxFixedArity = 1;
  js__GT_clj.cljs$lang$applyTo = function(arglist__12054) {
    var x = cljs.core.first(arglist__12054);
    var options = cljs.core.rest(arglist__12054);
    return js__GT_clj__delegate(x, options)
  };
  js__GT_clj.cljs$lang$arity$variadic = js__GT_clj__delegate;
  return js__GT_clj
}();
cljs.core.memoize = function memoize(f) {
  var mem__12059 = cljs.core.atom.call(null, cljs.core.ObjMap.EMPTY);
  return function() {
    var G__12063__delegate = function(args) {
      var temp__3971__auto____12060 = cljs.core._lookup.call(null, cljs.core.deref.call(null, mem__12059), args, null);
      if(cljs.core.truth_(temp__3971__auto____12060)) {
        var v__12061 = temp__3971__auto____12060;
        return v__12061
      }else {
        var ret__12062 = cljs.core.apply.call(null, f, args);
        cljs.core.swap_BANG_.call(null, mem__12059, cljs.core.assoc, args, ret__12062);
        return ret__12062
      }
    };
    var G__12063 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__12063__delegate.call(this, args)
    };
    G__12063.cljs$lang$maxFixedArity = 0;
    G__12063.cljs$lang$applyTo = function(arglist__12064) {
      var args = cljs.core.seq(arglist__12064);
      return G__12063__delegate(args)
    };
    G__12063.cljs$lang$arity$variadic = G__12063__delegate;
    return G__12063
  }()
};
cljs.core.trampoline = function() {
  var trampoline = null;
  var trampoline__1 = function(f) {
    while(true) {
      var ret__12066 = f.call(null);
      if(cljs.core.fn_QMARK_.call(null, ret__12066)) {
        var G__12067 = ret__12066;
        f = G__12067;
        continue
      }else {
        return ret__12066
      }
      break
    }
  };
  var trampoline__2 = function() {
    var G__12068__delegate = function(f, args) {
      return trampoline.call(null, function() {
        return cljs.core.apply.call(null, f, args)
      })
    };
    var G__12068 = function(f, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__12068__delegate.call(this, f, args)
    };
    G__12068.cljs$lang$maxFixedArity = 1;
    G__12068.cljs$lang$applyTo = function(arglist__12069) {
      var f = cljs.core.first(arglist__12069);
      var args = cljs.core.rest(arglist__12069);
      return G__12068__delegate(f, args)
    };
    G__12068.cljs$lang$arity$variadic = G__12068__delegate;
    return G__12068
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
    var k__12071 = f.call(null, x);
    return cljs.core.assoc.call(null, ret, k__12071, cljs.core.conj.call(null, cljs.core._lookup.call(null, ret, k__12071, cljs.core.PersistentVector.EMPTY), x))
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
    var or__3824__auto____12080 = cljs.core._EQ_.call(null, child, parent);
    if(or__3824__auto____12080) {
      return or__3824__auto____12080
    }else {
      var or__3824__auto____12081 = cljs.core.contains_QMARK_.call(null, (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h).call(null, child), parent);
      if(or__3824__auto____12081) {
        return or__3824__auto____12081
      }else {
        var and__3822__auto____12082 = cljs.core.vector_QMARK_.call(null, parent);
        if(and__3822__auto____12082) {
          var and__3822__auto____12083 = cljs.core.vector_QMARK_.call(null, child);
          if(and__3822__auto____12083) {
            var and__3822__auto____12084 = cljs.core.count.call(null, parent) === cljs.core.count.call(null, child);
            if(and__3822__auto____12084) {
              var ret__12085 = true;
              var i__12086 = 0;
              while(true) {
                if(function() {
                  var or__3824__auto____12087 = cljs.core.not.call(null, ret__12085);
                  if(or__3824__auto____12087) {
                    return or__3824__auto____12087
                  }else {
                    return i__12086 === cljs.core.count.call(null, parent)
                  }
                }()) {
                  return ret__12085
                }else {
                  var G__12088 = isa_QMARK_.call(null, h, child.call(null, i__12086), parent.call(null, i__12086));
                  var G__12089 = i__12086 + 1;
                  ret__12085 = G__12088;
                  i__12086 = G__12089;
                  continue
                }
                break
              }
            }else {
              return and__3822__auto____12084
            }
          }else {
            return and__3822__auto____12083
          }
        }else {
          return and__3822__auto____12082
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
    var tp__12098 = (new cljs.core.Keyword("\ufdd0'parents")).call(null, h);
    var td__12099 = (new cljs.core.Keyword("\ufdd0'descendants")).call(null, h);
    var ta__12100 = (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h);
    var tf__12101 = function(m, source, sources, target, targets) {
      return cljs.core.reduce.call(null, function(ret, k) {
        return cljs.core.assoc.call(null, ret, k, cljs.core.reduce.call(null, cljs.core.conj, cljs.core._lookup.call(null, targets, k, cljs.core.PersistentHashSet.EMPTY), cljs.core.cons.call(null, target, targets.call(null, target))))
      }, m, cljs.core.cons.call(null, source, sources.call(null, source)))
    };
    var or__3824__auto____12102 = cljs.core.contains_QMARK_.call(null, tp__12098.call(null, tag), parent) ? null : function() {
      if(cljs.core.contains_QMARK_.call(null, ta__12100.call(null, tag), parent)) {
        throw new Error([cljs.core.str(tag), cljs.core.str("already has"), cljs.core.str(parent), cljs.core.str("as ancestor")].join(""));
      }else {
      }
      if(cljs.core.contains_QMARK_.call(null, ta__12100.call(null, parent), tag)) {
        throw new Error([cljs.core.str("Cyclic derivation:"), cljs.core.str(parent), cljs.core.str("has"), cljs.core.str(tag), cljs.core.str("as ancestor")].join(""));
      }else {
      }
      return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'ancestors", "\ufdd0'descendants"], {"\ufdd0'parents":cljs.core.assoc.call(null, (new cljs.core.Keyword("\ufdd0'parents")).call(null, h), tag, cljs.core.conj.call(null, cljs.core._lookup.call(null, tp__12098, tag, cljs.core.PersistentHashSet.EMPTY), parent)), "\ufdd0'ancestors":tf__12101.call(null, (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h), tag, td__12099, parent, ta__12100), "\ufdd0'descendants":tf__12101.call(null, 
      (new cljs.core.Keyword("\ufdd0'descendants")).call(null, h), parent, ta__12100, tag, td__12099)})
    }();
    if(cljs.core.truth_(or__3824__auto____12102)) {
      return or__3824__auto____12102
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
    var parentMap__12107 = (new cljs.core.Keyword("\ufdd0'parents")).call(null, h);
    var childsParents__12108 = cljs.core.truth_(parentMap__12107.call(null, tag)) ? cljs.core.disj.call(null, parentMap__12107.call(null, tag), parent) : cljs.core.PersistentHashSet.EMPTY;
    var newParents__12109 = cljs.core.truth_(cljs.core.not_empty.call(null, childsParents__12108)) ? cljs.core.assoc.call(null, parentMap__12107, tag, childsParents__12108) : cljs.core.dissoc.call(null, parentMap__12107, tag);
    var deriv_seq__12110 = cljs.core.flatten.call(null, cljs.core.map.call(null, function(p1__12090_SHARP_) {
      return cljs.core.cons.call(null, cljs.core.first.call(null, p1__12090_SHARP_), cljs.core.interpose.call(null, cljs.core.first.call(null, p1__12090_SHARP_), cljs.core.second.call(null, p1__12090_SHARP_)))
    }, cljs.core.seq.call(null, newParents__12109)));
    if(cljs.core.contains_QMARK_.call(null, parentMap__12107.call(null, tag), parent)) {
      return cljs.core.reduce.call(null, function(p1__12091_SHARP_, p2__12092_SHARP_) {
        return cljs.core.apply.call(null, cljs.core.derive, p1__12091_SHARP_, p2__12092_SHARP_)
      }, cljs.core.make_hierarchy.call(null), cljs.core.partition.call(null, 2, deriv_seq__12110))
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
  var xprefs__12118 = cljs.core.deref.call(null, prefer_table).call(null, x);
  var or__3824__auto____12120 = cljs.core.truth_(function() {
    var and__3822__auto____12119 = xprefs__12118;
    if(cljs.core.truth_(and__3822__auto____12119)) {
      return xprefs__12118.call(null, y)
    }else {
      return and__3822__auto____12119
    }
  }()) ? true : null;
  if(cljs.core.truth_(or__3824__auto____12120)) {
    return or__3824__auto____12120
  }else {
    var or__3824__auto____12122 = function() {
      var ps__12121 = cljs.core.parents.call(null, y);
      while(true) {
        if(cljs.core.count.call(null, ps__12121) > 0) {
          if(cljs.core.truth_(prefers_STAR_.call(null, x, cljs.core.first.call(null, ps__12121), prefer_table))) {
          }else {
          }
          var G__12125 = cljs.core.rest.call(null, ps__12121);
          ps__12121 = G__12125;
          continue
        }else {
          return null
        }
        break
      }
    }();
    if(cljs.core.truth_(or__3824__auto____12122)) {
      return or__3824__auto____12122
    }else {
      var or__3824__auto____12124 = function() {
        var ps__12123 = cljs.core.parents.call(null, x);
        while(true) {
          if(cljs.core.count.call(null, ps__12123) > 0) {
            if(cljs.core.truth_(prefers_STAR_.call(null, cljs.core.first.call(null, ps__12123), y, prefer_table))) {
            }else {
            }
            var G__12126 = cljs.core.rest.call(null, ps__12123);
            ps__12123 = G__12126;
            continue
          }else {
            return null
          }
          break
        }
      }();
      if(cljs.core.truth_(or__3824__auto____12124)) {
        return or__3824__auto____12124
      }else {
        return false
      }
    }
  }
};
cljs.core.dominates = function dominates(x, y, prefer_table) {
  var or__3824__auto____12128 = cljs.core.prefers_STAR_.call(null, x, y, prefer_table);
  if(cljs.core.truth_(or__3824__auto____12128)) {
    return or__3824__auto____12128
  }else {
    return cljs.core.isa_QMARK_.call(null, x, y)
  }
};
cljs.core.find_and_cache_best_method = function find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  var best_entry__12146 = cljs.core.reduce.call(null, function(be, p__12138) {
    var vec__12139__12140 = p__12138;
    var k__12141 = cljs.core.nth.call(null, vec__12139__12140, 0, null);
    var ___12142 = cljs.core.nth.call(null, vec__12139__12140, 1, null);
    var e__12143 = vec__12139__12140;
    if(cljs.core.isa_QMARK_.call(null, dispatch_val, k__12141)) {
      var be2__12145 = cljs.core.truth_(function() {
        var or__3824__auto____12144 = be == null;
        if(or__3824__auto____12144) {
          return or__3824__auto____12144
        }else {
          return cljs.core.dominates.call(null, k__12141, cljs.core.first.call(null, be), prefer_table)
        }
      }()) ? e__12143 : be;
      if(cljs.core.truth_(cljs.core.dominates.call(null, cljs.core.first.call(null, be2__12145), k__12141, prefer_table))) {
      }else {
        throw new Error([cljs.core.str("Multiple methods in multimethod '"), cljs.core.str(name), cljs.core.str("' match dispatch value: "), cljs.core.str(dispatch_val), cljs.core.str(" -> "), cljs.core.str(k__12141), cljs.core.str(" and "), cljs.core.str(cljs.core.first.call(null, be2__12145)), cljs.core.str(", and neither is preferred")].join(""));
      }
      return be2__12145
    }else {
      return be
    }
  }, null, cljs.core.deref.call(null, method_table));
  if(cljs.core.truth_(best_entry__12146)) {
    if(cljs.core._EQ_.call(null, cljs.core.deref.call(null, cached_hierarchy), cljs.core.deref.call(null, hierarchy))) {
      cljs.core.swap_BANG_.call(null, method_cache, cljs.core.assoc, dispatch_val, cljs.core.second.call(null, best_entry__12146));
      return cljs.core.second.call(null, best_entry__12146)
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
    var and__3822__auto____12151 = mf;
    if(and__3822__auto____12151) {
      return mf.cljs$core$IMultiFn$_reset$arity$1
    }else {
      return and__3822__auto____12151
    }
  }()) {
    return mf.cljs$core$IMultiFn$_reset$arity$1(mf)
  }else {
    var x__2363__auto____12152 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12153 = cljs.core._reset[goog.typeOf(x__2363__auto____12152)];
      if(or__3824__auto____12153) {
        return or__3824__auto____12153
      }else {
        var or__3824__auto____12154 = cljs.core._reset["_"];
        if(or__3824__auto____12154) {
          return or__3824__auto____12154
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-reset", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._add_method = function _add_method(mf, dispatch_val, method) {
  if(function() {
    var and__3822__auto____12159 = mf;
    if(and__3822__auto____12159) {
      return mf.cljs$core$IMultiFn$_add_method$arity$3
    }else {
      return and__3822__auto____12159
    }
  }()) {
    return mf.cljs$core$IMultiFn$_add_method$arity$3(mf, dispatch_val, method)
  }else {
    var x__2363__auto____12160 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12161 = cljs.core._add_method[goog.typeOf(x__2363__auto____12160)];
      if(or__3824__auto____12161) {
        return or__3824__auto____12161
      }else {
        var or__3824__auto____12162 = cljs.core._add_method["_"];
        if(or__3824__auto____12162) {
          return or__3824__auto____12162
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-add-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, method)
  }
};
cljs.core._remove_method = function _remove_method(mf, dispatch_val) {
  if(function() {
    var and__3822__auto____12167 = mf;
    if(and__3822__auto____12167) {
      return mf.cljs$core$IMultiFn$_remove_method$arity$2
    }else {
      return and__3822__auto____12167
    }
  }()) {
    return mf.cljs$core$IMultiFn$_remove_method$arity$2(mf, dispatch_val)
  }else {
    var x__2363__auto____12168 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12169 = cljs.core._remove_method[goog.typeOf(x__2363__auto____12168)];
      if(or__3824__auto____12169) {
        return or__3824__auto____12169
      }else {
        var or__3824__auto____12170 = cljs.core._remove_method["_"];
        if(or__3824__auto____12170) {
          return or__3824__auto____12170
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-remove-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._prefer_method = function _prefer_method(mf, dispatch_val, dispatch_val_y) {
  if(function() {
    var and__3822__auto____12175 = mf;
    if(and__3822__auto____12175) {
      return mf.cljs$core$IMultiFn$_prefer_method$arity$3
    }else {
      return and__3822__auto____12175
    }
  }()) {
    return mf.cljs$core$IMultiFn$_prefer_method$arity$3(mf, dispatch_val, dispatch_val_y)
  }else {
    var x__2363__auto____12176 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12177 = cljs.core._prefer_method[goog.typeOf(x__2363__auto____12176)];
      if(or__3824__auto____12177) {
        return or__3824__auto____12177
      }else {
        var or__3824__auto____12178 = cljs.core._prefer_method["_"];
        if(or__3824__auto____12178) {
          return or__3824__auto____12178
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefer-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, dispatch_val_y)
  }
};
cljs.core._get_method = function _get_method(mf, dispatch_val) {
  if(function() {
    var and__3822__auto____12183 = mf;
    if(and__3822__auto____12183) {
      return mf.cljs$core$IMultiFn$_get_method$arity$2
    }else {
      return and__3822__auto____12183
    }
  }()) {
    return mf.cljs$core$IMultiFn$_get_method$arity$2(mf, dispatch_val)
  }else {
    var x__2363__auto____12184 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12185 = cljs.core._get_method[goog.typeOf(x__2363__auto____12184)];
      if(or__3824__auto____12185) {
        return or__3824__auto____12185
      }else {
        var or__3824__auto____12186 = cljs.core._get_method["_"];
        if(or__3824__auto____12186) {
          return or__3824__auto____12186
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-get-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._methods = function _methods(mf) {
  if(function() {
    var and__3822__auto____12191 = mf;
    if(and__3822__auto____12191) {
      return mf.cljs$core$IMultiFn$_methods$arity$1
    }else {
      return and__3822__auto____12191
    }
  }()) {
    return mf.cljs$core$IMultiFn$_methods$arity$1(mf)
  }else {
    var x__2363__auto____12192 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12193 = cljs.core._methods[goog.typeOf(x__2363__auto____12192)];
      if(or__3824__auto____12193) {
        return or__3824__auto____12193
      }else {
        var or__3824__auto____12194 = cljs.core._methods["_"];
        if(or__3824__auto____12194) {
          return or__3824__auto____12194
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-methods", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._prefers = function _prefers(mf) {
  if(function() {
    var and__3822__auto____12199 = mf;
    if(and__3822__auto____12199) {
      return mf.cljs$core$IMultiFn$_prefers$arity$1
    }else {
      return and__3822__auto____12199
    }
  }()) {
    return mf.cljs$core$IMultiFn$_prefers$arity$1(mf)
  }else {
    var x__2363__auto____12200 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12201 = cljs.core._prefers[goog.typeOf(x__2363__auto____12200)];
      if(or__3824__auto____12201) {
        return or__3824__auto____12201
      }else {
        var or__3824__auto____12202 = cljs.core._prefers["_"];
        if(or__3824__auto____12202) {
          return or__3824__auto____12202
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefers", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._dispatch = function _dispatch(mf, args) {
  if(function() {
    var and__3822__auto____12207 = mf;
    if(and__3822__auto____12207) {
      return mf.cljs$core$IMultiFn$_dispatch$arity$2
    }else {
      return and__3822__auto____12207
    }
  }()) {
    return mf.cljs$core$IMultiFn$_dispatch$arity$2(mf, args)
  }else {
    var x__2363__auto____12208 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____12209 = cljs.core._dispatch[goog.typeOf(x__2363__auto____12208)];
      if(or__3824__auto____12209) {
        return or__3824__auto____12209
      }else {
        var or__3824__auto____12210 = cljs.core._dispatch["_"];
        if(or__3824__auto____12210) {
          return or__3824__auto____12210
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-dispatch", mf);
        }
      }
    }().call(null, mf, args)
  }
};
cljs.core.do_dispatch = function do_dispatch(mf, dispatch_fn, args) {
  var dispatch_val__12213 = cljs.core.apply.call(null, dispatch_fn, args);
  var target_fn__12214 = cljs.core._get_method.call(null, mf, dispatch_val__12213);
  if(cljs.core.truth_(target_fn__12214)) {
  }else {
    throw new Error([cljs.core.str("No method in multimethod '"), cljs.core.str(cljs.core.name), cljs.core.str("' for dispatch value: "), cljs.core.str(dispatch_val__12213)].join(""));
  }
  return cljs.core.apply.call(null, target_fn__12214, args)
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
  var this__12215 = this;
  return goog.getUid(this$)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset$arity$1 = function(mf) {
  var this__12216 = this;
  cljs.core.swap_BANG_.call(null, this__12216.method_table, function(mf) {
    return cljs.core.ObjMap.EMPTY
  });
  cljs.core.swap_BANG_.call(null, this__12216.method_cache, function(mf) {
    return cljs.core.ObjMap.EMPTY
  });
  cljs.core.swap_BANG_.call(null, this__12216.prefer_table, function(mf) {
    return cljs.core.ObjMap.EMPTY
  });
  cljs.core.swap_BANG_.call(null, this__12216.cached_hierarchy, function(mf) {
    return null
  });
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method$arity$3 = function(mf, dispatch_val, method) {
  var this__12217 = this;
  cljs.core.swap_BANG_.call(null, this__12217.method_table, cljs.core.assoc, dispatch_val, method);
  cljs.core.reset_cache.call(null, this__12217.method_cache, this__12217.method_table, this__12217.cached_hierarchy, this__12217.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method$arity$2 = function(mf, dispatch_val) {
  var this__12218 = this;
  cljs.core.swap_BANG_.call(null, this__12218.method_table, cljs.core.dissoc, dispatch_val);
  cljs.core.reset_cache.call(null, this__12218.method_cache, this__12218.method_table, this__12218.cached_hierarchy, this__12218.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method$arity$2 = function(mf, dispatch_val) {
  var this__12219 = this;
  if(cljs.core._EQ_.call(null, cljs.core.deref.call(null, this__12219.cached_hierarchy), cljs.core.deref.call(null, this__12219.hierarchy))) {
  }else {
    cljs.core.reset_cache.call(null, this__12219.method_cache, this__12219.method_table, this__12219.cached_hierarchy, this__12219.hierarchy)
  }
  var temp__3971__auto____12220 = cljs.core.deref.call(null, this__12219.method_cache).call(null, dispatch_val);
  if(cljs.core.truth_(temp__3971__auto____12220)) {
    var target_fn__12221 = temp__3971__auto____12220;
    return target_fn__12221
  }else {
    var temp__3971__auto____12222 = cljs.core.find_and_cache_best_method.call(null, this__12219.name, dispatch_val, this__12219.hierarchy, this__12219.method_table, this__12219.prefer_table, this__12219.method_cache, this__12219.cached_hierarchy);
    if(cljs.core.truth_(temp__3971__auto____12222)) {
      var target_fn__12223 = temp__3971__auto____12222;
      return target_fn__12223
    }else {
      return cljs.core.deref.call(null, this__12219.method_table).call(null, this__12219.default_dispatch_val)
    }
  }
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method$arity$3 = function(mf, dispatch_val_x, dispatch_val_y) {
  var this__12224 = this;
  if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null, dispatch_val_x, dispatch_val_y, this__12224.prefer_table))) {
    throw new Error([cljs.core.str("Preference conflict in multimethod '"), cljs.core.str(this__12224.name), cljs.core.str("': "), cljs.core.str(dispatch_val_y), cljs.core.str(" is already preferred to "), cljs.core.str(dispatch_val_x)].join(""));
  }else {
  }
  cljs.core.swap_BANG_.call(null, this__12224.prefer_table, function(old) {
    return cljs.core.assoc.call(null, old, dispatch_val_x, cljs.core.conj.call(null, cljs.core._lookup.call(null, old, dispatch_val_x, cljs.core.PersistentHashSet.EMPTY), dispatch_val_y))
  });
  return cljs.core.reset_cache.call(null, this__12224.method_cache, this__12224.method_table, this__12224.cached_hierarchy, this__12224.hierarchy)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods$arity$1 = function(mf) {
  var this__12225 = this;
  return cljs.core.deref.call(null, this__12225.method_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers$arity$1 = function(mf) {
  var this__12226 = this;
  return cljs.core.deref.call(null, this__12226.prefer_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch$arity$2 = function(mf, args) {
  var this__12227 = this;
  return cljs.core.do_dispatch.call(null, mf, this__12227.dispatch_fn, args)
};
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = function() {
  var G__12229__delegate = function(_, args) {
    var self__12228 = this;
    return cljs.core._dispatch.call(null, self__12228, args)
  };
  var G__12229 = function(_, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return G__12229__delegate.call(this, _, args)
  };
  G__12229.cljs$lang$maxFixedArity = 1;
  G__12229.cljs$lang$applyTo = function(arglist__12230) {
    var _ = cljs.core.first(arglist__12230);
    var args = cljs.core.rest(arglist__12230);
    return G__12229__delegate(_, args)
  };
  G__12229.cljs$lang$arity$variadic = G__12229__delegate;
  return G__12229
}();
cljs.core.MultiFn.prototype.apply = function(_, args) {
  var self__12231 = this;
  return cljs.core._dispatch.call(null, self__12231, args)
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
  var this__12232 = this;
  return goog.string.hashCode(cljs.core.pr_str.call(null, this$))
};
cljs.core.UUID.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(_12234, _) {
  var this__12233 = this;
  return cljs.core.list.call(null, [cljs.core.str('#uuid "'), cljs.core.str(this__12233.uuid), cljs.core.str('"')].join(""))
};
cljs.core.UUID.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(_, other) {
  var this__12235 = this;
  var and__3822__auto____12236 = cljs.core.instance_QMARK_.call(null, cljs.core.UUID, other);
  if(and__3822__auto____12236) {
    return this__12235.uuid === other.uuid
  }else {
    return and__3822__auto____12236
  }
};
cljs.core.UUID.prototype.toString = function() {
  var this__12237 = this;
  var this__12238 = this;
  return cljs.core.pr_str.call(null, this__12238)
};
cljs.core.UUID;
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
  var sorted__8244 = cljs.core.sort.call(null, xs);
  var n__8245 = cljs.core.count.call(null, xs);
  if(cljs.core._EQ_.call(null, n__8245, 1)) {
    return cljs.core.first.call(null, sorted__8244)
  }else {
    if(cljs.core.odd_QMARK_.call(null, n__8245)) {
      return cljs.core.nth.call(null, sorted__8244, (n__8245 + 1) / 2)
    }else {
      if("\ufdd0'else") {
        var mid__8246 = n__8245 / 2;
        return c2.maths.mean.call(null, cljs.core.PersistentVector.fromArray([cljs.core.nth.call(null, sorted__8244, c2.maths.floor.call(null, mid__8246)), cljs.core.nth.call(null, sorted__8244, c2.maths.ceil.call(null, mid__8246))], true))
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
        var and__3822__auto____8251 = cljs.core.number_QMARK_.call(null, A);
        if(and__3822__auto____8251) {
          return cljs.core.number_QMARK_.call(null, B)
        }else {
          return and__3822__auto____8251
        }
      }()) {
        return A + B
      }else {
        if(function() {
          var and__3822__auto____8252 = cljs.core.coll_QMARK_.call(null, A);
          if(and__3822__auto____8252) {
            return cljs.core.coll_QMARK_.call(null, B)
          }else {
            return and__3822__auto____8252
          }
        }()) {
          return cljs.core.map.call(null, cljs.core._PLUS_, A, B)
        }else {
          if(function() {
            var and__3822__auto____8253 = cljs.core.number_QMARK_.call(null, A);
            if(and__3822__auto____8253) {
              return cljs.core.coll_QMARK_.call(null, B)
            }else {
              return and__3822__auto____8253
            }
          }()) {
            return cljs.core.map.call(null, cljs.core._PLUS_, cljs.core.replicate.call(null, cljs.core.count.call(null, B), A), B)
          }else {
            if(function() {
              var and__3822__auto____8254 = cljs.core.coll_QMARK_.call(null, A);
              if(and__3822__auto____8254) {
                return cljs.core.number_QMARK_.call(null, B)
              }else {
                return and__3822__auto____8254
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
  add.cljs$lang$applyTo = function(arglist__8255) {
    var args = cljs.core.seq(arglist__8255);
    return add__delegate(args)
  };
  add.cljs$lang$arity$variadic = add__delegate;
  return add
}();
c2.maths.sub = function() {
  var sub__delegate = function(args) {
    if(cljs.core._EQ_.call(null, cljs.core.count.call(null, args), 1)) {
      if(function() {
        var and__3822__auto____8264 = cljs.core.number_QMARK_.call(null, 0);
        if(and__3822__auto____8264) {
          return cljs.core.number_QMARK_.call(null, cljs.core.first.call(null, args))
        }else {
          return and__3822__auto____8264
        }
      }()) {
        return 0 - cljs.core.first.call(null, args)
      }else {
        if(function() {
          var and__3822__auto____8265 = cljs.core.coll_QMARK_.call(null, 0);
          if(and__3822__auto____8265) {
            return cljs.core.coll_QMARK_.call(null, cljs.core.first.call(null, args))
          }else {
            return and__3822__auto____8265
          }
        }()) {
          return cljs.core.map.call(null, cljs.core._, 0, cljs.core.first.call(null, args))
        }else {
          if(function() {
            var and__3822__auto____8266 = cljs.core.number_QMARK_.call(null, 0);
            if(and__3822__auto____8266) {
              return cljs.core.coll_QMARK_.call(null, cljs.core.first.call(null, args))
            }else {
              return and__3822__auto____8266
            }
          }()) {
            return cljs.core.map.call(null, cljs.core._, cljs.core.replicate.call(null, cljs.core.count.call(null, cljs.core.first.call(null, args)), 0), cljs.core.first.call(null, args))
          }else {
            if(function() {
              var and__3822__auto____8267 = cljs.core.coll_QMARK_.call(null, 0);
              if(and__3822__auto____8267) {
                return cljs.core.number_QMARK_.call(null, cljs.core.first.call(null, args))
              }else {
                return and__3822__auto____8267
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
          var and__3822__auto____8268 = cljs.core.number_QMARK_.call(null, A);
          if(and__3822__auto____8268) {
            return cljs.core.number_QMARK_.call(null, B)
          }else {
            return and__3822__auto____8268
          }
        }()) {
          return A - B
        }else {
          if(function() {
            var and__3822__auto____8269 = cljs.core.coll_QMARK_.call(null, A);
            if(and__3822__auto____8269) {
              return cljs.core.coll_QMARK_.call(null, B)
            }else {
              return and__3822__auto____8269
            }
          }()) {
            return cljs.core.map.call(null, cljs.core._, A, B)
          }else {
            if(function() {
              var and__3822__auto____8270 = cljs.core.number_QMARK_.call(null, A);
              if(and__3822__auto____8270) {
                return cljs.core.coll_QMARK_.call(null, B)
              }else {
                return and__3822__auto____8270
              }
            }()) {
              return cljs.core.map.call(null, cljs.core._, cljs.core.replicate.call(null, cljs.core.count.call(null, B), A), B)
            }else {
              if(function() {
                var and__3822__auto____8271 = cljs.core.coll_QMARK_.call(null, A);
                if(and__3822__auto____8271) {
                  return cljs.core.number_QMARK_.call(null, B)
                }else {
                  return and__3822__auto____8271
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
  sub.cljs$lang$applyTo = function(arglist__8272) {
    var args = cljs.core.seq(arglist__8272);
    return sub__delegate(args)
  };
  sub.cljs$lang$arity$variadic = sub__delegate;
  return sub
}();
c2.maths.mul = function() {
  var mul__delegate = function(args) {
    return cljs.core.reduce.call(null, function(A, B) {
      if(function() {
        var and__3822__auto____8277 = cljs.core.number_QMARK_.call(null, A);
        if(and__3822__auto____8277) {
          return cljs.core.number_QMARK_.call(null, B)
        }else {
          return and__3822__auto____8277
        }
      }()) {
        return A * B
      }else {
        if(function() {
          var and__3822__auto____8278 = cljs.core.coll_QMARK_.call(null, A);
          if(and__3822__auto____8278) {
            return cljs.core.coll_QMARK_.call(null, B)
          }else {
            return and__3822__auto____8278
          }
        }()) {
          return cljs.core.map.call(null, cljs.core._STAR_, A, B)
        }else {
          if(function() {
            var and__3822__auto____8279 = cljs.core.number_QMARK_.call(null, A);
            if(and__3822__auto____8279) {
              return cljs.core.coll_QMARK_.call(null, B)
            }else {
              return and__3822__auto____8279
            }
          }()) {
            return cljs.core.map.call(null, cljs.core._STAR_, cljs.core.replicate.call(null, cljs.core.count.call(null, B), A), B)
          }else {
            if(function() {
              var and__3822__auto____8280 = cljs.core.coll_QMARK_.call(null, A);
              if(and__3822__auto____8280) {
                return cljs.core.number_QMARK_.call(null, B)
              }else {
                return and__3822__auto____8280
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
  mul.cljs$lang$applyTo = function(arglist__8281) {
    var args = cljs.core.seq(arglist__8281);
    return mul__delegate(args)
  };
  mul.cljs$lang$arity$variadic = mul__delegate;
  return mul
}();
c2.maths.div = function() {
  var div__delegate = function(args) {
    if(cljs.core._EQ_.call(null, cljs.core.count.call(null, args), 1)) {
      if(function() {
        var and__3822__auto____8290 = cljs.core.number_QMARK_.call(null, 1);
        if(and__3822__auto____8290) {
          return cljs.core.number_QMARK_.call(null, cljs.core.first.call(null, args))
        }else {
          return and__3822__auto____8290
        }
      }()) {
        return 1 / cljs.core.first.call(null, args)
      }else {
        if(function() {
          var and__3822__auto____8291 = cljs.core.coll_QMARK_.call(null, 1);
          if(and__3822__auto____8291) {
            return cljs.core.coll_QMARK_.call(null, cljs.core.first.call(null, args))
          }else {
            return and__3822__auto____8291
          }
        }()) {
          return cljs.core.map.call(null, cljs.core._SLASH_, 1, cljs.core.first.call(null, args))
        }else {
          if(function() {
            var and__3822__auto____8292 = cljs.core.number_QMARK_.call(null, 1);
            if(and__3822__auto____8292) {
              return cljs.core.coll_QMARK_.call(null, cljs.core.first.call(null, args))
            }else {
              return and__3822__auto____8292
            }
          }()) {
            return cljs.core.map.call(null, cljs.core._SLASH_, cljs.core.replicate.call(null, cljs.core.count.call(null, cljs.core.first.call(null, args)), 1), cljs.core.first.call(null, args))
          }else {
            if(function() {
              var and__3822__auto____8293 = cljs.core.coll_QMARK_.call(null, 1);
              if(and__3822__auto____8293) {
                return cljs.core.number_QMARK_.call(null, cljs.core.first.call(null, args))
              }else {
                return and__3822__auto____8293
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
          var and__3822__auto____8294 = cljs.core.number_QMARK_.call(null, A);
          if(and__3822__auto____8294) {
            return cljs.core.number_QMARK_.call(null, B)
          }else {
            return and__3822__auto____8294
          }
        }()) {
          return A / B
        }else {
          if(function() {
            var and__3822__auto____8295 = cljs.core.coll_QMARK_.call(null, A);
            if(and__3822__auto____8295) {
              return cljs.core.coll_QMARK_.call(null, B)
            }else {
              return and__3822__auto____8295
            }
          }()) {
            return cljs.core.map.call(null, cljs.core._SLASH_, A, B)
          }else {
            if(function() {
              var and__3822__auto____8296 = cljs.core.number_QMARK_.call(null, A);
              if(and__3822__auto____8296) {
                return cljs.core.coll_QMARK_.call(null, B)
              }else {
                return and__3822__auto____8296
              }
            }()) {
              return cljs.core.map.call(null, cljs.core._SLASH_, cljs.core.replicate.call(null, cljs.core.count.call(null, B), A), B)
            }else {
              if(function() {
                var and__3822__auto____8297 = cljs.core.coll_QMARK_.call(null, A);
                if(and__3822__auto____8297) {
                  return cljs.core.number_QMARK_.call(null, B)
                }else {
                  return and__3822__auto____8297
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
  div.cljs$lang$applyTo = function(arglist__8298) {
    var args = cljs.core.seq(arglist__8298);
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
    var and__3822__auto____8135 = scale;
    if(and__3822__auto____8135) {
      return scale.c2$scale$IInvertable$invert$arity$1
    }else {
      return and__3822__auto____8135
    }
  }()) {
    return scale.c2$scale$IInvertable$invert$arity$1(scale)
  }else {
    var x__2363__auto____8136 = scale == null ? null : scale;
    return function() {
      var or__3824__auto____8137 = c2.scale.invert[goog.typeOf(x__2363__auto____8136)];
      if(or__3824__auto____8137) {
        return or__3824__auto____8137
      }else {
        var or__3824__auto____8138 = c2.scale.invert["_"];
        if(or__3824__auto____8138) {
          return or__3824__auto____8138
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
  var this__8144 = this;
  var h__2192__auto____8145 = this__8144.__hash;
  if(!(h__2192__auto____8145 == null)) {
    return h__2192__auto____8145
  }else {
    var h__2192__auto____8146 = cljs.core.hash_imap.call(null, this__2318__auto__);
    this__8144.__hash = h__2192__auto____8146;
    return h__2192__auto____8146
  }
};
c2.scale._linear.prototype.cljs$core$ILookup$_lookup$arity$2 = function(this__2323__auto__, k__2324__auto__) {
  var this__8147 = this;
  return this__2323__auto__.cljs$core$ILookup$_lookup$arity$3(this__2323__auto__, k__2324__auto__, null)
};
c2.scale._linear.prototype.cljs$core$ILookup$_lookup$arity$3 = function(this__2325__auto__, k8140, else__2326__auto__) {
  var this__8148 = this;
  if(k8140 === "\ufdd0'domain") {
    return this__8148.domain
  }else {
    if(k8140 === "\ufdd0'range") {
      return this__8148.range
    }else {
      if("\ufdd0'else") {
        return cljs.core._lookup.call(null, this__8148.__extmap, k8140, else__2326__auto__)
      }else {
        return null
      }
    }
  }
};
c2.scale._linear.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(this__2330__auto__, k__2331__auto__, G__8139) {
  var this__8149 = this;
  var pred__8150__8153 = cljs.core.identical_QMARK_;
  var expr__8151__8154 = k__2331__auto__;
  if(pred__8150__8153.call(null, "\ufdd0'domain", expr__8151__8154)) {
    return new c2.scale._linear(G__8139, this__8149.range, this__8149.__meta, this__8149.__extmap, null)
  }else {
    if(pred__8150__8153.call(null, "\ufdd0'range", expr__8151__8154)) {
      return new c2.scale._linear(this__8149.domain, G__8139, this__8149.__meta, this__8149.__extmap, null)
    }else {
      return new c2.scale._linear(this__8149.domain, this__8149.range, this__8149.__meta, cljs.core.assoc.call(null, this__8149.__extmap, k__2331__auto__, G__8139), null)
    }
  }
};
c2.scale._linear.prototype.call = function(this_sym8155, x) {
  var this__8156 = this;
  var this_sym8155__8157 = this;
  var ___8158 = this_sym8155__8157;
  var domain_length__8159 = cljs.core.last.call(null, this__8156.domain) - cljs.core.first.call(null, this__8156.domain);
  var range_length__8160 = cljs.core.last.call(null, this__8156.range) - cljs.core.first.call(null, this__8156.range);
  return cljs.core.first.call(null, this__8156.range) + range_length__8160 * ((x - cljs.core.first.call(null, this__8156.domain)) / domain_length__8159)
};
c2.scale._linear.prototype.apply = function(this_sym8142, args8143) {
  var this__8161 = this;
  return this_sym8142.call.apply(this_sym8142, [this_sym8142].concat(args8143.slice()))
};
c2.scale._linear.prototype.cljs$core$ICollection$_conj$arity$2 = function(this__2328__auto__, entry__2329__auto__) {
  var this__8162 = this;
  if(cljs.core.vector_QMARK_.call(null, entry__2329__auto__)) {
    return this__2328__auto__.cljs$core$IAssociative$_assoc$arity$3(this__2328__auto__, cljs.core._nth.call(null, entry__2329__auto__, 0), cljs.core._nth.call(null, entry__2329__auto__, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, this__2328__auto__, entry__2329__auto__)
  }
};
c2.scale._linear.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this__2335__auto__) {
  var this__8163 = this;
  return cljs.core.seq.call(null, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'domain", this__8163.domain), cljs.core.vector.call(null, "\ufdd0'range", this__8163.range)], true), this__8163.__extmap))
};
c2.scale._linear.prototype.c2$scale$IInvertable$ = true;
c2.scale._linear.prototype.c2$scale$IInvertable$invert$arity$1 = function(this$) {
  var this__8164 = this;
  return cljs.core.assoc.call(null, this$, "\ufdd0'domain", this__8164.range, "\ufdd0'range", this__8164.domain)
};
c2.scale._linear.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(this__2337__auto__, opts__2338__auto__) {
  var this__8165 = this;
  var pr_pair__2339__auto____8166 = function(keyval__2340__auto__) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts__2338__auto__, keyval__2340__auto__)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__2339__auto____8166, [cljs.core.str("#"), cljs.core.str("_linear"), cljs.core.str("{")].join(""), ", ", "}", opts__2338__auto__, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'domain", this__8165.domain), cljs.core.vector.call(null, "\ufdd0'range", this__8165.range)], true), this__8165.__extmap))
};
c2.scale._linear.prototype.cljs$core$ICounted$_count$arity$1 = function(this__2327__auto__) {
  var this__8167 = this;
  return 2 + cljs.core.count.call(null, this__8167.__extmap)
};
c2.scale._linear.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(this__2319__auto__, other__2320__auto__) {
  var this__8168 = this;
  if(cljs.core.truth_(function() {
    var and__3822__auto____8169 = other__2320__auto__;
    if(cljs.core.truth_(and__3822__auto____8169)) {
      var and__3822__auto____8170 = this__2319__auto__.constructor === other__2320__auto__.constructor;
      if(and__3822__auto____8170) {
        return cljs.core.equiv_map.call(null, this__2319__auto__, other__2320__auto__)
      }else {
        return and__3822__auto____8170
      }
    }else {
      return and__3822__auto____8169
    }
  }())) {
    return true
  }else {
    return false
  }
};
c2.scale._linear.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(this__2322__auto__, G__8139) {
  var this__8171 = this;
  return new c2.scale._linear(this__8171.domain, this__8171.range, G__8139, this__8171.__extmap, this__8171.__hash)
};
c2.scale._linear.prototype.cljs$core$IMeta$_meta$arity$1 = function(this__2321__auto__) {
  var this__8172 = this;
  return this__8172.__meta
};
c2.scale._linear.prototype.cljs$core$IMap$_dissoc$arity$2 = function(this__2332__auto__, k__2333__auto__) {
  var this__8173 = this;
  if(cljs.core.contains_QMARK_.call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'domain", "\ufdd0'range"]), k__2333__auto__)) {
    return cljs.core.dissoc.call(null, cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, this__2332__auto__), this__8173.__meta), k__2333__auto__)
  }else {
    return new c2.scale._linear(this__8173.domain, this__8173.range, this__8173.__meta, cljs.core.not_empty.call(null, cljs.core.dissoc.call(null, this__8173.__extmap, k__2333__auto__)), null)
  }
};
c2.scale._linear.cljs$lang$type = true;
c2.scale._linear.cljs$lang$ctorPrSeq = function(this__2357__auto__) {
  return cljs.core.list.call(null, "c2.scale/_linear")
};
c2.scale.__GT__linear = function __GT__linear(domain, range) {
  return new c2.scale._linear(domain, range)
};
c2.scale.map__GT__linear = function map__GT__linear(G__8141) {
  return new c2.scale._linear((new cljs.core.Keyword("\ufdd0'domain")).call(null, G__8141), (new cljs.core.Keyword("\ufdd0'range")).call(null, G__8141), null, cljs.core.dissoc.call(null, G__8141, "\ufdd0'domain", "\ufdd0'range"))
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
  linear.cljs$lang$applyTo = function(arglist__8174) {
    var kwargs = cljs.core.seq(arglist__8174);
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
  var this__8180 = this;
  var h__2192__auto____8181 = this__8180.__hash;
  if(!(h__2192__auto____8181 == null)) {
    return h__2192__auto____8181
  }else {
    var h__2192__auto____8182 = cljs.core.hash_imap.call(null, this__2318__auto__);
    this__8180.__hash = h__2192__auto____8182;
    return h__2192__auto____8182
  }
};
c2.scale._power.prototype.cljs$core$ILookup$_lookup$arity$2 = function(this__2323__auto__, k__2324__auto__) {
  var this__8183 = this;
  return this__2323__auto__.cljs$core$ILookup$_lookup$arity$3(this__2323__auto__, k__2324__auto__, null)
};
c2.scale._power.prototype.cljs$core$ILookup$_lookup$arity$3 = function(this__2325__auto__, k8176, else__2326__auto__) {
  var this__8184 = this;
  if(k8176 === "\ufdd0'domain") {
    return this__8184.domain
  }else {
    if(k8176 === "\ufdd0'range") {
      return this__8184.range
    }else {
      if("\ufdd0'else") {
        return cljs.core._lookup.call(null, this__8184.__extmap, k8176, else__2326__auto__)
      }else {
        return null
      }
    }
  }
};
c2.scale._power.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(this__2330__auto__, k__2331__auto__, G__8175) {
  var this__8185 = this;
  var pred__8186__8189 = cljs.core.identical_QMARK_;
  var expr__8187__8190 = k__2331__auto__;
  if(pred__8186__8189.call(null, "\ufdd0'domain", expr__8187__8190)) {
    return new c2.scale._power(G__8175, this__8185.range, this__8185.__meta, this__8185.__extmap, null)
  }else {
    if(pred__8186__8189.call(null, "\ufdd0'range", expr__8187__8190)) {
      return new c2.scale._power(this__8185.domain, G__8175, this__8185.__meta, this__8185.__extmap, null)
    }else {
      return new c2.scale._power(this__8185.domain, this__8185.range, this__8185.__meta, cljs.core.assoc.call(null, this__8185.__extmap, k__2331__auto__, G__8175), null)
    }
  }
};
c2.scale._power.prototype.call = function(this_sym8191, x) {
  var this__8192 = this;
  var this_sym8191__8193 = this;
  var ___8194 = this_sym8191__8193;
  return cljs.core.comp.call(null, c2.scale.linear.call(null, "\ufdd0'domain", cljs.core.map.call(null, c2.maths.expt, this__8192.domain), "\ufdd0'range", this__8192.range), c2.maths.expt).call(null, x)
};
c2.scale._power.prototype.apply = function(this_sym8178, args8179) {
  var this__8195 = this;
  return this_sym8178.call.apply(this_sym8178, [this_sym8178].concat(args8179.slice()))
};
c2.scale._power.prototype.cljs$core$ICollection$_conj$arity$2 = function(this__2328__auto__, entry__2329__auto__) {
  var this__8196 = this;
  if(cljs.core.vector_QMARK_.call(null, entry__2329__auto__)) {
    return this__2328__auto__.cljs$core$IAssociative$_assoc$arity$3(this__2328__auto__, cljs.core._nth.call(null, entry__2329__auto__, 0), cljs.core._nth.call(null, entry__2329__auto__, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, this__2328__auto__, entry__2329__auto__)
  }
};
c2.scale._power.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this__2335__auto__) {
  var this__8197 = this;
  return cljs.core.seq.call(null, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'domain", this__8197.domain), cljs.core.vector.call(null, "\ufdd0'range", this__8197.range)], true), this__8197.__extmap))
};
c2.scale._power.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(this__2337__auto__, opts__2338__auto__) {
  var this__8198 = this;
  var pr_pair__2339__auto____8199 = function(keyval__2340__auto__) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts__2338__auto__, keyval__2340__auto__)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__2339__auto____8199, [cljs.core.str("#"), cljs.core.str("_power"), cljs.core.str("{")].join(""), ", ", "}", opts__2338__auto__, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'domain", this__8198.domain), cljs.core.vector.call(null, "\ufdd0'range", this__8198.range)], true), this__8198.__extmap))
};
c2.scale._power.prototype.cljs$core$ICounted$_count$arity$1 = function(this__2327__auto__) {
  var this__8200 = this;
  return 2 + cljs.core.count.call(null, this__8200.__extmap)
};
c2.scale._power.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(this__2319__auto__, other__2320__auto__) {
  var this__8201 = this;
  if(cljs.core.truth_(function() {
    var and__3822__auto____8202 = other__2320__auto__;
    if(cljs.core.truth_(and__3822__auto____8202)) {
      var and__3822__auto____8203 = this__2319__auto__.constructor === other__2320__auto__.constructor;
      if(and__3822__auto____8203) {
        return cljs.core.equiv_map.call(null, this__2319__auto__, other__2320__auto__)
      }else {
        return and__3822__auto____8203
      }
    }else {
      return and__3822__auto____8202
    }
  }())) {
    return true
  }else {
    return false
  }
};
c2.scale._power.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(this__2322__auto__, G__8175) {
  var this__8204 = this;
  return new c2.scale._power(this__8204.domain, this__8204.range, G__8175, this__8204.__extmap, this__8204.__hash)
};
c2.scale._power.prototype.cljs$core$IMeta$_meta$arity$1 = function(this__2321__auto__) {
  var this__8205 = this;
  return this__8205.__meta
};
c2.scale._power.prototype.cljs$core$IMap$_dissoc$arity$2 = function(this__2332__auto__, k__2333__auto__) {
  var this__8206 = this;
  if(cljs.core.contains_QMARK_.call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'domain", "\ufdd0'range"]), k__2333__auto__)) {
    return cljs.core.dissoc.call(null, cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, this__2332__auto__), this__8206.__meta), k__2333__auto__)
  }else {
    return new c2.scale._power(this__8206.domain, this__8206.range, this__8206.__meta, cljs.core.not_empty.call(null, cljs.core.dissoc.call(null, this__8206.__extmap, k__2333__auto__)), null)
  }
};
c2.scale._power.cljs$lang$type = true;
c2.scale._power.cljs$lang$ctorPrSeq = function(this__2357__auto__) {
  return cljs.core.list.call(null, "c2.scale/_power")
};
c2.scale.__GT__power = function __GT__power(domain, range) {
  return new c2.scale._power(domain, range)
};
c2.scale.map__GT__power = function map__GT__power(G__8177) {
  return new c2.scale._power((new cljs.core.Keyword("\ufdd0'domain")).call(null, G__8177), (new cljs.core.Keyword("\ufdd0'range")).call(null, G__8177), null, cljs.core.dissoc.call(null, G__8177, "\ufdd0'domain", "\ufdd0'range"))
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
  power.cljs$lang$applyTo = function(arglist__8207) {
    var kwargs = cljs.core.seq(arglist__8207);
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
  var this__8213 = this;
  var h__2192__auto____8214 = this__8213.__hash;
  if(!(h__2192__auto____8214 == null)) {
    return h__2192__auto____8214
  }else {
    var h__2192__auto____8215 = cljs.core.hash_imap.call(null, this__2318__auto__);
    this__8213.__hash = h__2192__auto____8215;
    return h__2192__auto____8215
  }
};
c2.scale._log.prototype.cljs$core$ILookup$_lookup$arity$2 = function(this__2323__auto__, k__2324__auto__) {
  var this__8216 = this;
  return this__2323__auto__.cljs$core$ILookup$_lookup$arity$3(this__2323__auto__, k__2324__auto__, null)
};
c2.scale._log.prototype.cljs$core$ILookup$_lookup$arity$3 = function(this__2325__auto__, k8209, else__2326__auto__) {
  var this__8217 = this;
  if(k8209 === "\ufdd0'domain") {
    return this__8217.domain
  }else {
    if(k8209 === "\ufdd0'range") {
      return this__8217.range
    }else {
      if("\ufdd0'else") {
        return cljs.core._lookup.call(null, this__8217.__extmap, k8209, else__2326__auto__)
      }else {
        return null
      }
    }
  }
};
c2.scale._log.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(this__2330__auto__, k__2331__auto__, G__8208) {
  var this__8218 = this;
  var pred__8219__8222 = cljs.core.identical_QMARK_;
  var expr__8220__8223 = k__2331__auto__;
  if(pred__8219__8222.call(null, "\ufdd0'domain", expr__8220__8223)) {
    return new c2.scale._log(G__8208, this__8218.range, this__8218.__meta, this__8218.__extmap, null)
  }else {
    if(pred__8219__8222.call(null, "\ufdd0'range", expr__8220__8223)) {
      return new c2.scale._log(this__8218.domain, G__8208, this__8218.__meta, this__8218.__extmap, null)
    }else {
      return new c2.scale._log(this__8218.domain, this__8218.range, this__8218.__meta, cljs.core.assoc.call(null, this__8218.__extmap, k__2331__auto__, G__8208), null)
    }
  }
};
c2.scale._log.prototype.call = function(this_sym8224, x) {
  var this__8225 = this;
  var this_sym8224__8226 = this;
  var ___8227 = this_sym8224__8226;
  return cljs.core.comp.call(null, c2.scale.linear.call(null, "\ufdd0'domain", cljs.core.map.call(null, c2.maths.log, this__8225.domain), "\ufdd0'range", this__8225.range), c2.maths.log).call(null, x)
};
c2.scale._log.prototype.apply = function(this_sym8211, args8212) {
  var this__8228 = this;
  return this_sym8211.call.apply(this_sym8211, [this_sym8211].concat(args8212.slice()))
};
c2.scale._log.prototype.cljs$core$ICollection$_conj$arity$2 = function(this__2328__auto__, entry__2329__auto__) {
  var this__8229 = this;
  if(cljs.core.vector_QMARK_.call(null, entry__2329__auto__)) {
    return this__2328__auto__.cljs$core$IAssociative$_assoc$arity$3(this__2328__auto__, cljs.core._nth.call(null, entry__2329__auto__, 0), cljs.core._nth.call(null, entry__2329__auto__, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, this__2328__auto__, entry__2329__auto__)
  }
};
c2.scale._log.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this__2335__auto__) {
  var this__8230 = this;
  return cljs.core.seq.call(null, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'domain", this__8230.domain), cljs.core.vector.call(null, "\ufdd0'range", this__8230.range)], true), this__8230.__extmap))
};
c2.scale._log.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(this__2337__auto__, opts__2338__auto__) {
  var this__8231 = this;
  var pr_pair__2339__auto____8232 = function(keyval__2340__auto__) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts__2338__auto__, keyval__2340__auto__)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__2339__auto____8232, [cljs.core.str("#"), cljs.core.str("_log"), cljs.core.str("{")].join(""), ", ", "}", opts__2338__auto__, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'domain", this__8231.domain), cljs.core.vector.call(null, "\ufdd0'range", this__8231.range)], true), this__8231.__extmap))
};
c2.scale._log.prototype.cljs$core$ICounted$_count$arity$1 = function(this__2327__auto__) {
  var this__8233 = this;
  return 2 + cljs.core.count.call(null, this__8233.__extmap)
};
c2.scale._log.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(this__2319__auto__, other__2320__auto__) {
  var this__8234 = this;
  if(cljs.core.truth_(function() {
    var and__3822__auto____8235 = other__2320__auto__;
    if(cljs.core.truth_(and__3822__auto____8235)) {
      var and__3822__auto____8236 = this__2319__auto__.constructor === other__2320__auto__.constructor;
      if(and__3822__auto____8236) {
        return cljs.core.equiv_map.call(null, this__2319__auto__, other__2320__auto__)
      }else {
        return and__3822__auto____8236
      }
    }else {
      return and__3822__auto____8235
    }
  }())) {
    return true
  }else {
    return false
  }
};
c2.scale._log.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(this__2322__auto__, G__8208) {
  var this__8237 = this;
  return new c2.scale._log(this__8237.domain, this__8237.range, G__8208, this__8237.__extmap, this__8237.__hash)
};
c2.scale._log.prototype.cljs$core$IMeta$_meta$arity$1 = function(this__2321__auto__) {
  var this__8238 = this;
  return this__8238.__meta
};
c2.scale._log.prototype.cljs$core$IMap$_dissoc$arity$2 = function(this__2332__auto__, k__2333__auto__) {
  var this__8239 = this;
  if(cljs.core.contains_QMARK_.call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'domain", "\ufdd0'range"]), k__2333__auto__)) {
    return cljs.core.dissoc.call(null, cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, this__2332__auto__), this__8239.__meta), k__2333__auto__)
  }else {
    return new c2.scale._log(this__8239.domain, this__8239.range, this__8239.__meta, cljs.core.not_empty.call(null, cljs.core.dissoc.call(null, this__8239.__extmap, k__2333__auto__)), null)
  }
};
c2.scale._log.cljs$lang$type = true;
c2.scale._log.cljs$lang$ctorPrSeq = function(this__2357__auto__) {
  return cljs.core.list.call(null, "c2.scale/_log")
};
c2.scale.__GT__log = function __GT__log(domain, range) {
  return new c2.scale._log(domain, range)
};
c2.scale.map__GT__log = function map__GT__log(G__8210) {
  return new c2.scale._log((new cljs.core.Keyword("\ufdd0'domain")).call(null, G__8210), (new cljs.core.Keyword("\ufdd0'range")).call(null, G__8210), null, cljs.core.dissoc.call(null, G__8210, "\ufdd0'domain", "\ufdd0'range"))
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
  log.cljs$lang$applyTo = function(arglist__8240) {
    var kwargs = cljs.core.seq(arglist__8240);
    return log__delegate(kwargs)
  };
  log.cljs$lang$arity$variadic = log__delegate;
  return log
}();
goog.provide("reflex.core");
goog.require("cljs.core");
reflex.core._BANG_recently_derefed = cljs.core.atom.call(null, cljs.core.PersistentHashSet.EMPTY, "\ufdd0'meta", cljs.core.ObjMap.fromObject(["\ufdd0'no-deref-monitor"], {"\ufdd0'no-deref-monitor":true}));
reflex.core.notify_deref_watcher_BANG_ = function notify_deref_watcher_BANG_(derefable) {
  if(cljs.core.truth_((new cljs.core.Keyword("\ufdd0'no-deref-monitor")).call(null, cljs.core.meta.call(null, derefable)))) {
    return null
  }else {
    return cljs.core.swap_BANG_.call(null, reflex.core._BANG_recently_derefed, function(p1__12564_SHARP_) {
      return cljs.core.conj.call(null, p1__12564_SHARP_, derefable)
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
    var and__3822__auto____12569 = this$;
    if(and__3822__auto____12569) {
      return this$.reflex$core$IDisposable$dispose_BANG_$arity$1
    }else {
      return and__3822__auto____12569
    }
  }()) {
    return this$.reflex$core$IDisposable$dispose_BANG_$arity$1(this$)
  }else {
    var x__2363__auto____12570 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____12571 = reflex.core.dispose_BANG_[goog.typeOf(x__2363__auto____12570)];
      if(or__3824__auto____12571) {
        return or__3824__auto____12571
      }else {
        var or__3824__auto____12572 = reflex.core.dispose_BANG_["_"];
        if(or__3824__auto____12572) {
          return or__3824__auto____12572
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
  var this__12576 = this;
  var h__2192__auto____12577 = this__12576.__hash;
  if(!(h__2192__auto____12577 == null)) {
    return h__2192__auto____12577
  }else {
    var h__2192__auto____12578 = cljs.core.hash_imap.call(null, this__2318__auto__);
    this__12576.__hash = h__2192__auto____12578;
    return h__2192__auto____12578
  }
};
reflex.core.ComputedObservable.prototype.cljs$core$ILookup$_lookup$arity$2 = function(this__2323__auto__, k__2324__auto__) {
  var this__12579 = this;
  return this__2323__auto__.cljs$core$ILookup$_lookup$arity$3(this__2323__auto__, k__2324__auto__, null)
};
reflex.core.ComputedObservable.prototype.cljs$core$ILookup$_lookup$arity$3 = function(this__2325__auto__, k12574, else__2326__auto__) {
  var this__12580 = this;
  if(k12574 === "\ufdd0'state") {
    return this__12580.state
  }else {
    if(k12574 === "\ufdd0'dirty?") {
      return this__12580.dirty_QMARK_
    }else {
      if(k12574 === "\ufdd0'f") {
        return this__12580.f
      }else {
        if(k12574 === "\ufdd0'key") {
          return this__12580.key
        }else {
          if(k12574 === "\ufdd0'parent-watchables") {
            return this__12580.parent_watchables
          }else {
            if(k12574 === "\ufdd0'watches") {
              return this__12580.watches
            }else {
              if("\ufdd0'else") {
                return cljs.core._lookup.call(null, this__12580.__extmap, k12574, else__2326__auto__)
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
reflex.core.ComputedObservable.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(this__2330__auto__, k__2331__auto__, G__12573) {
  var this__12581 = this;
  var pred__12582__12585 = cljs.core.identical_QMARK_;
  var expr__12583__12586 = k__2331__auto__;
  if(pred__12582__12585.call(null, "\ufdd0'state", expr__12583__12586)) {
    return new reflex.core.ComputedObservable(G__12573, this__12581.dirty_QMARK_, this__12581.f, this__12581.key, this__12581.parent_watchables, this__12581.watches, this__12581.__meta, this__12581.__extmap, null)
  }else {
    if(pred__12582__12585.call(null, "\ufdd0'dirty?", expr__12583__12586)) {
      return new reflex.core.ComputedObservable(this__12581.state, G__12573, this__12581.f, this__12581.key, this__12581.parent_watchables, this__12581.watches, this__12581.__meta, this__12581.__extmap, null)
    }else {
      if(pred__12582__12585.call(null, "\ufdd0'f", expr__12583__12586)) {
        return new reflex.core.ComputedObservable(this__12581.state, this__12581.dirty_QMARK_, G__12573, this__12581.key, this__12581.parent_watchables, this__12581.watches, this__12581.__meta, this__12581.__extmap, null)
      }else {
        if(pred__12582__12585.call(null, "\ufdd0'key", expr__12583__12586)) {
          return new reflex.core.ComputedObservable(this__12581.state, this__12581.dirty_QMARK_, this__12581.f, G__12573, this__12581.parent_watchables, this__12581.watches, this__12581.__meta, this__12581.__extmap, null)
        }else {
          if(pred__12582__12585.call(null, "\ufdd0'parent-watchables", expr__12583__12586)) {
            return new reflex.core.ComputedObservable(this__12581.state, this__12581.dirty_QMARK_, this__12581.f, this__12581.key, G__12573, this__12581.watches, this__12581.__meta, this__12581.__extmap, null)
          }else {
            if(pred__12582__12585.call(null, "\ufdd0'watches", expr__12583__12586)) {
              return new reflex.core.ComputedObservable(this__12581.state, this__12581.dirty_QMARK_, this__12581.f, this__12581.key, this__12581.parent_watchables, G__12573, this__12581.__meta, this__12581.__extmap, null)
            }else {
              return new reflex.core.ComputedObservable(this__12581.state, this__12581.dirty_QMARK_, this__12581.f, this__12581.key, this__12581.parent_watchables, this__12581.watches, this__12581.__meta, cljs.core.assoc.call(null, this__12581.__extmap, k__2331__auto__, G__12573), null)
            }
          }
        }
      }
    }
  }
};
reflex.core.ComputedObservable.prototype.cljs$core$IDeref$_deref$arity$1 = function(this$) {
  var this__12587 = this;
  reflex.core.notify_deref_watcher_BANG_.call(null, this$);
  if(cljs.core.not.call(null, this__12587.dirty_QMARK_)) {
    return this$.state
  }else {
    var map__12588__12590 = function() {
      reflex.core.reset_deref_watcher_BANG_.call(null);
      var res__6248__auto____12589 = this__12587.f.call(null);
      return cljs.core.ObjMap.fromObject(["\ufdd0'derefed", "\ufdd0'res"], {"\ufdd0'derefed":reflex.core.recently_derefed.call(null), "\ufdd0'res":res__6248__auto____12589})
    }();
    var map__12588__12591 = cljs.core.seq_QMARK_.call(null, map__12588__12590) ? cljs.core.apply.call(null, cljs.core.hash_map, map__12588__12590) : map__12588__12590;
    var derefed__12592 = cljs.core._lookup.call(null, map__12588__12591, "\ufdd0'derefed", null);
    var res__12593 = cljs.core._lookup.call(null, map__12588__12591, "\ufdd0'res", null);
    var G__12594__12595 = cljs.core.seq.call(null, this__12587.parent_watchables);
    if(G__12594__12595) {
      var w__12596 = cljs.core.first.call(null, G__12594__12595);
      var G__12594__12597 = G__12594__12595;
      while(true) {
        cljs.core.remove_watch.call(null, w__12596, this__12587.key);
        var temp__3974__auto____12598 = cljs.core.next.call(null, G__12594__12597);
        if(temp__3974__auto____12598) {
          var G__12594__12599 = temp__3974__auto____12598;
          var G__12647 = cljs.core.first.call(null, G__12594__12599);
          var G__12648 = G__12594__12599;
          w__12596 = G__12647;
          G__12594__12597 = G__12648;
          continue
        }else {
        }
        break
      }
    }else {
    }
    this$.parent_watchables = derefed__12592;
    var G__12600__12601 = cljs.core.seq.call(null, derefed__12592);
    if(G__12600__12601) {
      var w__12602 = cljs.core.first.call(null, G__12600__12601);
      var G__12600__12603 = G__12600__12601;
      while(true) {
        cljs.core.add_watch.call(null, w__12602, this__12587.key, function(w__12602, G__12600__12603) {
          return function() {
            this$.dirty_QMARK_ = true;
            return cljs.core._notify_watches.call(null, this$, null, null)
          }
        }(w__12602, G__12600__12603));
        var temp__3974__auto____12604 = cljs.core.next.call(null, G__12600__12603);
        if(temp__3974__auto____12604) {
          var G__12600__12605 = temp__3974__auto____12604;
          var G__12649 = cljs.core.first.call(null, G__12600__12605);
          var G__12650 = G__12600__12605;
          w__12602 = G__12649;
          G__12600__12603 = G__12650;
          continue
        }else {
        }
        break
      }
    }else {
    }
    this$.state = res__12593;
    this$.dirty_QMARK_ = false;
    return res__12593
  }
};
reflex.core.ComputedObservable.prototype.cljs$core$ICollection$_conj$arity$2 = function(this__2328__auto__, entry__2329__auto__) {
  var this__12606 = this;
  if(cljs.core.vector_QMARK_.call(null, entry__2329__auto__)) {
    return this__2328__auto__.cljs$core$IAssociative$_assoc$arity$3(this__2328__auto__, cljs.core._nth.call(null, entry__2329__auto__, 0), cljs.core._nth.call(null, entry__2329__auto__, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, this__2328__auto__, entry__2329__auto__)
  }
};
reflex.core.ComputedObservable.prototype.cljs$core$IWatchable$_notify_watches$arity$3 = function(this$, _12608, _) {
  var this__12607 = this;
  var G__12609__12610 = cljs.core.seq.call(null, this__12607.watches);
  if(G__12609__12610) {
    var G__12612__12614 = cljs.core.first.call(null, G__12609__12610);
    var vec__12613__12615 = G__12612__12614;
    var key__12616 = cljs.core.nth.call(null, vec__12613__12615, 0, null);
    var wf__12617 = cljs.core.nth.call(null, vec__12613__12615, 1, null);
    var G__12609__12618 = G__12609__12610;
    var G__12612__12619 = G__12612__12614;
    var G__12609__12620 = G__12609__12618;
    while(true) {
      var vec__12621__12622 = G__12612__12619;
      var key__12623 = cljs.core.nth.call(null, vec__12621__12622, 0, null);
      var wf__12624 = cljs.core.nth.call(null, vec__12621__12622, 1, null);
      var G__12609__12625 = G__12609__12620;
      wf__12624.call(null);
      var temp__3974__auto____12626 = cljs.core.next.call(null, G__12609__12625);
      if(temp__3974__auto____12626) {
        var G__12609__12627 = temp__3974__auto____12626;
        var G__12651 = cljs.core.first.call(null, G__12609__12627);
        var G__12652 = G__12609__12627;
        G__12612__12619 = G__12651;
        G__12609__12620 = G__12652;
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
  var this__12628 = this;
  return this$.watches = cljs.core.assoc.call(null, this__12628.watches, key, wf)
};
reflex.core.ComputedObservable.prototype.cljs$core$IWatchable$_remove_watch$arity$2 = function(this$, key) {
  var this__12629 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__12629.watches, key)
};
reflex.core.ComputedObservable.prototype.reflex$core$IDisposable$ = true;
reflex.core.ComputedObservable.prototype.reflex$core$IDisposable$dispose_BANG_$arity$1 = function(this$) {
  var this__12630 = this;
  var G__12631__12632 = cljs.core.seq.call(null, this__12630.parent_watchables);
  if(G__12631__12632) {
    var w__12633 = cljs.core.first.call(null, G__12631__12632);
    var G__12631__12634 = G__12631__12632;
    while(true) {
      cljs.core.remove_watch.call(null, w__12633, this__12630.key);
      var temp__3974__auto____12635 = cljs.core.next.call(null, G__12631__12634);
      if(temp__3974__auto____12635) {
        var G__12631__12636 = temp__3974__auto____12635;
        var G__12653 = cljs.core.first.call(null, G__12631__12636);
        var G__12654 = G__12631__12636;
        w__12633 = G__12653;
        G__12631__12634 = G__12654;
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
  var this__12637 = this;
  return cljs.core.seq.call(null, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'state", this__12637.state), cljs.core.vector.call(null, "\ufdd0'dirty?", this__12637.dirty_QMARK_), cljs.core.vector.call(null, "\ufdd0'f", this__12637.f), cljs.core.vector.call(null, "\ufdd0'key", this__12637.key), cljs.core.vector.call(null, "\ufdd0'parent-watchables", this__12637.parent_watchables), cljs.core.vector.call(null, "\ufdd0'watches", this__12637.watches)], 
  true), this__12637.__extmap))
};
reflex.core.ComputedObservable.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(this__2337__auto__, opts__2338__auto__) {
  var this__12638 = this;
  var pr_pair__2339__auto____12639 = function(keyval__2340__auto__) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts__2338__auto__, keyval__2340__auto__)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__2339__auto____12639, [cljs.core.str("#"), cljs.core.str("ComputedObservable"), cljs.core.str("{")].join(""), ", ", "}", opts__2338__auto__, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'state", this__12638.state), cljs.core.vector.call(null, "\ufdd0'dirty?", this__12638.dirty_QMARK_), cljs.core.vector.call(null, "\ufdd0'f", this__12638.f), cljs.core.vector.call(null, "\ufdd0'key", this__12638.key), 
  cljs.core.vector.call(null, "\ufdd0'parent-watchables", this__12638.parent_watchables), cljs.core.vector.call(null, "\ufdd0'watches", this__12638.watches)], true), this__12638.__extmap))
};
reflex.core.ComputedObservable.prototype.cljs$core$ICounted$_count$arity$1 = function(this__2327__auto__) {
  var this__12640 = this;
  return 6 + cljs.core.count.call(null, this__12640.__extmap)
};
reflex.core.ComputedObservable.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(this__2319__auto__, other__2320__auto__) {
  var this__12641 = this;
  if(cljs.core.truth_(function() {
    var and__3822__auto____12642 = other__2320__auto__;
    if(cljs.core.truth_(and__3822__auto____12642)) {
      var and__3822__auto____12643 = this__2319__auto__.constructor === other__2320__auto__.constructor;
      if(and__3822__auto____12643) {
        return cljs.core.equiv_map.call(null, this__2319__auto__, other__2320__auto__)
      }else {
        return and__3822__auto____12643
      }
    }else {
      return and__3822__auto____12642
    }
  }())) {
    return true
  }else {
    return false
  }
};
reflex.core.ComputedObservable.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(this__2322__auto__, G__12573) {
  var this__12644 = this;
  return new reflex.core.ComputedObservable(this__12644.state, this__12644.dirty_QMARK_, this__12644.f, this__12644.key, this__12644.parent_watchables, this__12644.watches, G__12573, this__12644.__extmap, this__12644.__hash)
};
reflex.core.ComputedObservable.prototype.cljs$core$IMeta$_meta$arity$1 = function(this__2321__auto__) {
  var this__12645 = this;
  return this__12645.__meta
};
reflex.core.ComputedObservable.prototype.cljs$core$IMap$_dissoc$arity$2 = function(this__2332__auto__, k__2333__auto__) {
  var this__12646 = this;
  if(cljs.core.contains_QMARK_.call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'dirty?", "\ufdd0'state", "\ufdd0'key", "\ufdd0'f", "\ufdd0'watches", "\ufdd0'parent-watchables"]), k__2333__auto__)) {
    return cljs.core.dissoc.call(null, cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, this__2332__auto__), this__12646.__meta), k__2333__auto__)
  }else {
    return new reflex.core.ComputedObservable(this__12646.state, this__12646.dirty_QMARK_, this__12646.f, this__12646.key, this__12646.parent_watchables, this__12646.watches, this__12646.__meta, cljs.core.not_empty.call(null, cljs.core.dissoc.call(null, this__12646.__extmap, k__2333__auto__)), null)
  }
};
reflex.core.ComputedObservable.cljs$lang$type = true;
reflex.core.ComputedObservable.cljs$lang$ctorPrSeq = function(this__2357__auto__) {
  return cljs.core.list.call(null, "reflex.core/ComputedObservable")
};
reflex.core.__GT_ComputedObservable = function __GT_ComputedObservable(state, dirty_QMARK_, f, key, parent_watchables, watches) {
  return new reflex.core.ComputedObservable(state, dirty_QMARK_, f, key, parent_watchables, watches)
};
reflex.core.map__GT_ComputedObservable = function map__GT_ComputedObservable(G__12575) {
  return new reflex.core.ComputedObservable((new cljs.core.Keyword("\ufdd0'state")).call(null, G__12575), (new cljs.core.Keyword("\ufdd0'dirty?")).call(null, G__12575), (new cljs.core.Keyword("\ufdd0'f")).call(null, G__12575), (new cljs.core.Keyword("\ufdd0'key")).call(null, G__12575), (new cljs.core.Keyword("\ufdd0'parent-watchables")).call(null, G__12575), (new cljs.core.Keyword("\ufdd0'watches")).call(null, G__12575), null, cljs.core.dissoc.call(null, G__12575, "\ufdd0'state", "\ufdd0'dirty?", 
  "\ufdd0'f", "\ufdd0'key", "\ufdd0'parent-watchables", "\ufdd0'watches"))
};
reflex.core.ComputedObservable;
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
  var this__12426 = this;
  var h__2192__auto____12427 = this__12426.__hash;
  if(!(h__2192__auto____12427 == null)) {
    return h__2192__auto____12427
  }else {
    var h__2192__auto____12428 = cljs.core.hash_imap.call(null, this__2318__auto__);
    this__12426.__hash = h__2192__auto____12428;
    return h__2192__auto____12428
  }
};
singult.core.Unify.prototype.cljs$core$ILookup$_lookup$arity$2 = function(this__2323__auto__, k__2324__auto__) {
  var this__12429 = this;
  return this__2323__auto__.cljs$core$ILookup$_lookup$arity$3(this__2323__auto__, k__2324__auto__, null)
};
singult.core.Unify.prototype.cljs$core$ILookup$_lookup$arity$3 = function(this__2325__auto__, k12424, else__2326__auto__) {
  var this__12430 = this;
  if(k12424 === "\ufdd0'data") {
    return this__12430.data
  }else {
    if(k12424 === "\ufdd0'mapping") {
      return this__12430.mapping
    }else {
      if(k12424 === "\ufdd0'key-fn") {
        return this__12430.key_fn
      }else {
        if(k12424 === "\ufdd0'enter") {
          return this__12430.enter
        }else {
          if(k12424 === "\ufdd0'update") {
            return this__12430.update
          }else {
            if(k12424 === "\ufdd0'exit") {
              return this__12430.exit
            }else {
              if(k12424 === "\ufdd0'force-update?") {
                return this__12430.force_update_QMARK_
              }else {
                if("\ufdd0'else") {
                  return cljs.core._lookup.call(null, this__12430.__extmap, k12424, else__2326__auto__)
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
singult.core.Unify.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(this__2330__auto__, k__2331__auto__, G__12423) {
  var this__12431 = this;
  var pred__12432__12435 = cljs.core.identical_QMARK_;
  var expr__12433__12436 = k__2331__auto__;
  if(pred__12432__12435.call(null, "\ufdd0'data", expr__12433__12436)) {
    return new singult.core.Unify(G__12423, this__12431.mapping, this__12431.key_fn, this__12431.enter, this__12431.update, this__12431.exit, this__12431.force_update_QMARK_, this__12431.__meta, this__12431.__extmap, null)
  }else {
    if(pred__12432__12435.call(null, "\ufdd0'mapping", expr__12433__12436)) {
      return new singult.core.Unify(this__12431.data, G__12423, this__12431.key_fn, this__12431.enter, this__12431.update, this__12431.exit, this__12431.force_update_QMARK_, this__12431.__meta, this__12431.__extmap, null)
    }else {
      if(pred__12432__12435.call(null, "\ufdd0'key-fn", expr__12433__12436)) {
        return new singult.core.Unify(this__12431.data, this__12431.mapping, G__12423, this__12431.enter, this__12431.update, this__12431.exit, this__12431.force_update_QMARK_, this__12431.__meta, this__12431.__extmap, null)
      }else {
        if(pred__12432__12435.call(null, "\ufdd0'enter", expr__12433__12436)) {
          return new singult.core.Unify(this__12431.data, this__12431.mapping, this__12431.key_fn, G__12423, this__12431.update, this__12431.exit, this__12431.force_update_QMARK_, this__12431.__meta, this__12431.__extmap, null)
        }else {
          if(pred__12432__12435.call(null, "\ufdd0'update", expr__12433__12436)) {
            return new singult.core.Unify(this__12431.data, this__12431.mapping, this__12431.key_fn, this__12431.enter, G__12423, this__12431.exit, this__12431.force_update_QMARK_, this__12431.__meta, this__12431.__extmap, null)
          }else {
            if(pred__12432__12435.call(null, "\ufdd0'exit", expr__12433__12436)) {
              return new singult.core.Unify(this__12431.data, this__12431.mapping, this__12431.key_fn, this__12431.enter, this__12431.update, G__12423, this__12431.force_update_QMARK_, this__12431.__meta, this__12431.__extmap, null)
            }else {
              if(pred__12432__12435.call(null, "\ufdd0'force-update?", expr__12433__12436)) {
                return new singult.core.Unify(this__12431.data, this__12431.mapping, this__12431.key_fn, this__12431.enter, this__12431.update, this__12431.exit, G__12423, this__12431.__meta, this__12431.__extmap, null)
              }else {
                return new singult.core.Unify(this__12431.data, this__12431.mapping, this__12431.key_fn, this__12431.enter, this__12431.update, this__12431.exit, this__12431.force_update_QMARK_, this__12431.__meta, cljs.core.assoc.call(null, this__12431.__extmap, k__2331__auto__, G__12423), null)
              }
            }
          }
        }
      }
    }
  }
};
singult.core.Unify.prototype.cljs$core$ICollection$_conj$arity$2 = function(this__2328__auto__, entry__2329__auto__) {
  var this__12437 = this;
  if(cljs.core.vector_QMARK_.call(null, entry__2329__auto__)) {
    return this__2328__auto__.cljs$core$IAssociative$_assoc$arity$3(this__2328__auto__, cljs.core._nth.call(null, entry__2329__auto__, 0), cljs.core._nth.call(null, entry__2329__auto__, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, this__2328__auto__, entry__2329__auto__)
  }
};
singult.core.Unify.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this__2335__auto__) {
  var this__12438 = this;
  return cljs.core.seq.call(null, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'data", this__12438.data), cljs.core.vector.call(null, "\ufdd0'mapping", this__12438.mapping), cljs.core.vector.call(null, "\ufdd0'key-fn", this__12438.key_fn), cljs.core.vector.call(null, "\ufdd0'enter", this__12438.enter), cljs.core.vector.call(null, "\ufdd0'update", this__12438.update), cljs.core.vector.call(null, "\ufdd0'exit", this__12438.exit), cljs.core.vector.call(null, 
  "\ufdd0'force-update?", this__12438.force_update_QMARK_)], true), this__12438.__extmap))
};
singult.core.Unify.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(this__2337__auto__, opts__2338__auto__) {
  var this__12439 = this;
  var pr_pair__2339__auto____12440 = function(keyval__2340__auto__) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts__2338__auto__, keyval__2340__auto__)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__2339__auto____12440, [cljs.core.str("#"), cljs.core.str("Unify"), cljs.core.str("{")].join(""), ", ", "}", opts__2338__auto__, cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([cljs.core.vector.call(null, "\ufdd0'data", this__12439.data), cljs.core.vector.call(null, "\ufdd0'mapping", this__12439.mapping), cljs.core.vector.call(null, "\ufdd0'key-fn", this__12439.key_fn), cljs.core.vector.call(null, "\ufdd0'enter", this__12439.enter), 
  cljs.core.vector.call(null, "\ufdd0'update", this__12439.update), cljs.core.vector.call(null, "\ufdd0'exit", this__12439.exit), cljs.core.vector.call(null, "\ufdd0'force-update?", this__12439.force_update_QMARK_)], true), this__12439.__extmap))
};
singult.core.Unify.prototype.cljs$core$ICounted$_count$arity$1 = function(this__2327__auto__) {
  var this__12441 = this;
  return 7 + cljs.core.count.call(null, this__12441.__extmap)
};
singult.core.Unify.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(this__2319__auto__, other__2320__auto__) {
  var this__12442 = this;
  if(cljs.core.truth_(function() {
    var and__3822__auto____12443 = other__2320__auto__;
    if(cljs.core.truth_(and__3822__auto____12443)) {
      var and__3822__auto____12444 = this__2319__auto__.constructor === other__2320__auto__.constructor;
      if(and__3822__auto____12444) {
        return cljs.core.equiv_map.call(null, this__2319__auto__, other__2320__auto__)
      }else {
        return and__3822__auto____12444
      }
    }else {
      return and__3822__auto____12443
    }
  }())) {
    return true
  }else {
    return false
  }
};
singult.core.Unify.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(this__2322__auto__, G__12423) {
  var this__12445 = this;
  return new singult.core.Unify(this__12445.data, this__12445.mapping, this__12445.key_fn, this__12445.enter, this__12445.update, this__12445.exit, this__12445.force_update_QMARK_, G__12423, this__12445.__extmap, this__12445.__hash)
};
singult.core.Unify.prototype.cljs$core$IMeta$_meta$arity$1 = function(this__2321__auto__) {
  var this__12446 = this;
  return this__12446.__meta
};
singult.core.Unify.prototype.cljs$core$IMap$_dissoc$arity$2 = function(this__2332__auto__, k__2333__auto__) {
  var this__12447 = this;
  if(cljs.core.contains_QMARK_.call(null, cljs.core.PersistentHashSet.fromArray(["\ufdd0'data", "\ufdd0'force-update?", "\ufdd0'enter", "\ufdd0'exit", "\ufdd0'key-fn", "\ufdd0'update", "\ufdd0'mapping"]), k__2333__auto__)) {
    return cljs.core.dissoc.call(null, cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, this__2332__auto__), this__12447.__meta), k__2333__auto__)
  }else {
    return new singult.core.Unify(this__12447.data, this__12447.mapping, this__12447.key_fn, this__12447.enter, this__12447.update, this__12447.exit, this__12447.force_update_QMARK_, this__12447.__meta, cljs.core.not_empty.call(null, cljs.core.dissoc.call(null, this__12447.__extmap, k__2333__auto__)), null)
  }
};
singult.core.Unify.cljs$lang$type = true;
singult.core.Unify.cljs$lang$ctorPrSeq = function(this__2357__auto__) {
  return cljs.core.list.call(null, "singult.core/Unify")
};
singult.core.__GT_Unify = function __GT_Unify(data, mapping, key_fn, enter, update, exit, force_update_QMARK_) {
  return new singult.core.Unify(data, mapping, key_fn, enter, update, exit, force_update_QMARK_)
};
singult.core.map__GT_Unify = function map__GT_Unify(G__12425) {
  return new singult.core.Unify((new cljs.core.Keyword("\ufdd0'data")).call(null, G__12425), (new cljs.core.Keyword("\ufdd0'mapping")).call(null, G__12425), (new cljs.core.Keyword("\ufdd0'key-fn")).call(null, G__12425), (new cljs.core.Keyword("\ufdd0'enter")).call(null, G__12425), (new cljs.core.Keyword("\ufdd0'update")).call(null, G__12425), (new cljs.core.Keyword("\ufdd0'exit")).call(null, G__12425), (new cljs.core.Keyword("\ufdd0'force-update?")).call(null, G__12425), null, cljs.core.dissoc.call(null, 
  G__12425, "\ufdd0'data", "\ufdd0'mapping", "\ufdd0'key-fn", "\ufdd0'enter", "\ufdd0'update", "\ufdd0'exit", "\ufdd0'force-update?"))
};
singult.core.Unify;
singult.core.clj__GT_js = function clj__GT_js(x) {
  if(cljs.core.instance_QMARK_.call(null, singult.core.Unify, x)) {
    var map__12494__12495 = x;
    var map__12494__12496 = cljs.core.seq_QMARK_.call(null, map__12494__12495) ? cljs.core.apply.call(null, cljs.core.hash_map, map__12494__12495) : map__12494__12495;
    var force_update_QMARK___12497 = cljs.core._lookup.call(null, map__12494__12496, "\ufdd0'force-update?", null);
    var exit__12498 = cljs.core._lookup.call(null, map__12494__12496, "\ufdd0'exit", null);
    var update__12499 = cljs.core._lookup.call(null, map__12494__12496, "\ufdd0'update", null);
    var enter__12500 = cljs.core._lookup.call(null, map__12494__12496, "\ufdd0'enter", null);
    var key_fn__12501 = cljs.core._lookup.call(null, map__12494__12496, "\ufdd0'key-fn", null);
    var mapping__12502 = cljs.core._lookup.call(null, map__12494__12496, "\ufdd0'mapping", null);
    var data__12503 = cljs.core._lookup.call(null, map__12494__12496, "\ufdd0'data", null);
    var data_arr__12511 = function() {
      var a__12504 = [];
      var G__12505__12506 = cljs.core.seq.call(null, data__12503);
      if(G__12505__12506) {
        var d__12507 = cljs.core.first.call(null, G__12505__12506);
        var G__12505__12508 = G__12505__12506;
        while(true) {
          a__12504.push(d__12507);
          var temp__3974__auto____12509 = cljs.core.next.call(null, G__12505__12508);
          if(temp__3974__auto____12509) {
            var G__12505__12510 = temp__3974__auto____12509;
            var G__12540 = cljs.core.first.call(null, G__12505__12510);
            var G__12541 = G__12505__12510;
            d__12507 = G__12540;
            G__12505__12508 = G__12541;
            continue
          }else {
          }
          break
        }
      }else {
      }
      return a__12504
    }();
    return new singult.coffee.Unify(data_arr__12511, function(p1__12422_SHARP_) {
      return clj__GT_js.call(null, mapping__12502.call(null, p1__12422_SHARP_))
    }, key_fn__12501, enter__12500, update__12499, exit__12498, force_update_QMARK___12497)
  }else {
    if(cljs.core.keyword_QMARK_.call(null, x)) {
      return cljs.core.name.call(null, x)
    }else {
      if(cljs.core.map_QMARK_.call(null, x)) {
        var o__12512 = {};
        var G__12513__12514 = cljs.core.seq.call(null, x);
        if(G__12513__12514) {
          var G__12516__12518 = cljs.core.first.call(null, G__12513__12514);
          var vec__12517__12519 = G__12516__12518;
          var k__12520 = cljs.core.nth.call(null, vec__12517__12519, 0, null);
          var v__12521 = cljs.core.nth.call(null, vec__12517__12519, 1, null);
          var G__12513__12522 = G__12513__12514;
          var G__12516__12523 = G__12516__12518;
          var G__12513__12524 = G__12513__12522;
          while(true) {
            var vec__12525__12526 = G__12516__12523;
            var k__12527 = cljs.core.nth.call(null, vec__12525__12526, 0, null);
            var v__12528 = cljs.core.nth.call(null, vec__12525__12526, 1, null);
            var G__12513__12529 = G__12513__12524;
            var key__12530 = clj__GT_js.call(null, k__12527);
            if(cljs.core.string_QMARK_.call(null, key__12530)) {
            }else {
              throw"Cannot convert; JavaScript map keys must be strings";
            }
            o__12512[key__12530] = clj__GT_js.call(null, v__12528);
            var temp__3974__auto____12531 = cljs.core.next.call(null, G__12513__12529);
            if(temp__3974__auto____12531) {
              var G__12513__12532 = temp__3974__auto____12531;
              var G__12542 = cljs.core.first.call(null, G__12513__12532);
              var G__12543 = G__12513__12532;
              G__12516__12523 = G__12542;
              G__12513__12524 = G__12543;
              continue
            }else {
            }
            break
          }
        }else {
        }
        return o__12512
      }else {
        if(cljs.core.coll_QMARK_.call(null, x)) {
          var a__12533 = [];
          var G__12534__12535 = cljs.core.seq.call(null, x);
          if(G__12534__12535) {
            var item__12536 = cljs.core.first.call(null, G__12534__12535);
            var G__12534__12537 = G__12534__12535;
            while(true) {
              a__12533.push(clj__GT_js.call(null, item__12536));
              var temp__3974__auto____12538 = cljs.core.next.call(null, G__12534__12537);
              if(temp__3974__auto____12538) {
                var G__12534__12539 = temp__3974__auto____12538;
                var G__12544 = cljs.core.first.call(null, G__12534__12539);
                var G__12545 = G__12534__12539;
                item__12536 = G__12544;
                G__12534__12537 = G__12545;
                continue
              }else {
              }
              break
            }
          }else {
          }
          return a__12533
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
  var unify__delegate = function(data, mapping, p__12546) {
    var map__12555__12556 = p__12546;
    var map__12555__12557 = cljs.core.seq_QMARK_.call(null, map__12555__12556) ? cljs.core.apply.call(null, cljs.core.hash_map, map__12555__12556) : map__12555__12556;
    var force_update_QMARK___12558 = cljs.core._lookup.call(null, map__12555__12557, "\ufdd0'force-update?", null);
    var exit__12559 = cljs.core._lookup.call(null, map__12555__12557, "\ufdd0'exit", null);
    var update__12560 = cljs.core._lookup.call(null, map__12555__12557, "\ufdd0'update", null);
    var enter__12561 = cljs.core._lookup.call(null, map__12555__12557, "\ufdd0'enter", null);
    var key_fn__12562 = cljs.core._lookup.call(null, map__12555__12557, "\ufdd0'key-fn", null);
    return new singult.core.Unify(data, mapping, key_fn__12562, enter__12561, update__12560, exit__12559, force_update_QMARK___12558)
  };
  var unify = function(data, mapping, var_args) {
    var p__12546 = null;
    if(goog.isDef(var_args)) {
      p__12546 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return unify__delegate.call(this, data, mapping, p__12546)
  };
  unify.cljs$lang$maxFixedArity = 2;
  unify.cljs$lang$applyTo = function(arglist__12563) {
    var data = cljs.core.first(arglist__12563);
    var mapping = cljs.core.first(cljs.core.next(arglist__12563));
    var p__12546 = cljs.core.rest(cljs.core.next(arglist__12563));
    return unify__delegate(data, mapping, p__12546)
  };
  unify.cljs$lang$arity$variadic = unify__delegate;
  return unify
}();
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
      var s__12387 = s;
      var limit__12388 = limit;
      var parts__12389 = cljs.core.PersistentVector.EMPTY;
      while(true) {
        if(cljs.core._EQ_.call(null, limit__12388, 1)) {
          return cljs.core.conj.call(null, parts__12389, s__12387)
        }else {
          var temp__3971__auto____12390 = cljs.core.re_find.call(null, re, s__12387);
          if(cljs.core.truth_(temp__3971__auto____12390)) {
            var m__12391 = temp__3971__auto____12390;
            var index__12392 = s__12387.indexOf(m__12391);
            var G__12393 = s__12387.substring(index__12392 + cljs.core.count.call(null, m__12391));
            var G__12394 = limit__12388 - 1;
            var G__12395 = cljs.core.conj.call(null, parts__12389, s__12387.substring(0, index__12392));
            s__12387 = G__12393;
            limit__12388 = G__12394;
            parts__12389 = G__12395;
            continue
          }else {
            return cljs.core.conj.call(null, parts__12389, s__12387)
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
  var index__12399 = s.length;
  while(true) {
    if(index__12399 === 0) {
      return""
    }else {
      var ch__12400 = cljs.core._lookup.call(null, s, index__12399 - 1, null);
      if(function() {
        var or__3824__auto____12401 = cljs.core._EQ_.call(null, ch__12400, "\n");
        if(or__3824__auto____12401) {
          return or__3824__auto____12401
        }else {
          return cljs.core._EQ_.call(null, ch__12400, "\r")
        }
      }()) {
        var G__12402 = index__12399 - 1;
        index__12399 = G__12402;
        continue
      }else {
        return s.substring(0, index__12399)
      }
    }
    break
  }
};
clojure.string.blank_QMARK_ = function blank_QMARK_(s) {
  var s__12406 = [cljs.core.str(s)].join("");
  if(cljs.core.truth_(function() {
    var or__3824__auto____12407 = cljs.core.not.call(null, s__12406);
    if(or__3824__auto____12407) {
      return or__3824__auto____12407
    }else {
      var or__3824__auto____12408 = cljs.core._EQ_.call(null, "", s__12406);
      if(or__3824__auto____12408) {
        return or__3824__auto____12408
      }else {
        return cljs.core.re_matches.call(null, /\s+/, s__12406)
      }
    }
  }())) {
    return true
  }else {
    return false
  }
};
clojure.string.escape = function escape(s, cmap) {
  var buffer__12415 = new goog.string.StringBuffer;
  var length__12416 = s.length;
  var index__12417 = 0;
  while(true) {
    if(cljs.core._EQ_.call(null, length__12416, index__12417)) {
      return buffer__12415.toString()
    }else {
      var ch__12418 = s.charAt(index__12417);
      var temp__3971__auto____12419 = cljs.core._lookup.call(null, cmap, ch__12418, null);
      if(cljs.core.truth_(temp__3971__auto____12419)) {
        var replacement__12420 = temp__3971__auto____12419;
        buffer__12415.append([cljs.core.str(replacement__12420)].join(""))
      }else {
        buffer__12415.append(ch__12418)
      }
      var G__12421 = index__12417 + 1;
      index__12417 = G__12421;
      continue
    }
    break
  }
};
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
    var and__3822__auto____12244 = x;
    if(and__3822__auto____12244) {
      return x.c2$dom$IDom$__GT_dom$arity$1
    }else {
      return and__3822__auto____12244
    }
  }()) {
    return x.c2$dom$IDom$__GT_dom$arity$1(x)
  }else {
    var x__2363__auto____12245 = x == null ? null : x;
    return function() {
      var or__3824__auto____12246 = c2.dom.__GT_dom[goog.typeOf(x__2363__auto____12245)];
      if(or__3824__auto____12246) {
        return or__3824__auto____12246
      }else {
        var or__3824__auto____12247 = c2.dom.__GT_dom["_"];
        if(or__3824__auto____12247) {
          return or__3824__auto____12247
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
  var el__12249 = c2.dom.__GT_dom.call(null, el);
  goog.dom.appendChild(c2.dom.__GT_dom.call(null, container), el__12249);
  return el__12249
};
c2.dom.prepend_BANG_ = function prepend_BANG_(container, el) {
  var el__12251 = c2.dom.__GT_dom.call(null, el);
  goog.dom.insertChildAt(c2.dom.__GT_dom.call(null, container), el__12251, 0);
  return el__12251
};
c2.dom.remove_BANG_ = function remove_BANG_(el) {
  return goog.dom.removeNode(c2.dom.__GT_dom.call(null, el))
};
c2.dom.replace_BANG_ = function replace_BANG_(old, new$) {
  var new__12253 = c2.dom.__GT_dom.call(null, new$);
  goog.dom.replaceNode(new__12253, c2.dom.__GT_dom.call(null, old));
  return new__12253
};
c2.dom.style = function() {
  var style = null;
  var style__1 = function(el) {
    throw new Error("TODO: return map of element styles");
  };
  var style__2 = function(el, x) {
    var el__12280 = c2.dom.__GT_dom.call(null, el);
    try {
      if(cljs.core.keyword_QMARK_.call(null, x)) {
        var k__12282 = x;
        return goog.style.getComputedStyle(el__12280, cljs.core.name.call(null, k__12282))
      }else {
        if(cljs.core.map_QMARK_.call(null, x)) {
          var m__12283 = x;
          var G__12284__12285 = cljs.core.seq.call(null, m__12283);
          if(G__12284__12285) {
            var G__12287__12289 = cljs.core.first.call(null, G__12284__12285);
            var vec__12288__12290 = G__12287__12289;
            var k__12291 = cljs.core.nth.call(null, vec__12288__12290, 0, null);
            var v__12292 = cljs.core.nth.call(null, vec__12288__12290, 1, null);
            var G__12284__12293 = G__12284__12285;
            var G__12287__12294 = G__12287__12289;
            var G__12284__12295 = G__12284__12293;
            while(true) {
              var vec__12296__12297 = G__12287__12294;
              var k__12298 = cljs.core.nth.call(null, vec__12296__12297, 0, null);
              var v__12299 = cljs.core.nth.call(null, vec__12296__12297, 1, null);
              var G__12284__12300 = G__12284__12295;
              style.call(null, el__12280, k__12298, v__12299);
              var temp__3974__auto____12301 = cljs.core.next.call(null, G__12284__12300);
              if(temp__3974__auto____12301) {
                var G__12284__12302 = temp__3974__auto____12301;
                var G__12306 = cljs.core.first.call(null, G__12284__12302);
                var G__12307 = G__12284__12302;
                G__12287__12294 = G__12306;
                G__12284__12295 = G__12307;
                continue
              }else {
              }
              break
            }
          }else {
          }
          return el__12280
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
          var s__12304 = v;
          return s__12304
        }else {
          if(cljs.core.number_QMARK_.call(null, v)) {
            var n__12305 = v;
            if(cljs.core.truth_(cljs.core.PersistentHashSet.fromArray(["\ufdd0'bottom", "\ufdd0'width", "\ufdd0'top", "\ufdd0'right", "\ufdd0'left", "\ufdd0'height"]).call(null, cljs.core.keyword.call(null, k)))) {
              return[cljs.core.str(n__12305), cljs.core.str("px")].join("")
            }else {
              return n__12305
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
    var attrs__12340 = c2.dom.__GT_dom.call(null, el).attributes;
    return cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, function() {
      var iter__2462__auto____12347 = function iter__12341(s__12342) {
        return new cljs.core.LazySeq(null, false, function() {
          var s__12342__12345 = s__12342;
          while(true) {
            if(cljs.core.seq.call(null, s__12342__12345)) {
              var i__12346 = cljs.core.first.call(null, s__12342__12345);
              return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([cljs.core.keyword.call(null, attrs__12340[i__12346].name), attrs__12340[i__12346].value], true), iter__12341.call(null, cljs.core.rest.call(null, s__12342__12345)))
            }else {
              return null
            }
            break
          }
        }, null)
      };
      return iter__2462__auto____12347.call(null, cljs.core.range.call(null, attrs__12340.length))
    }())
  };
  var attr__2 = function(el, x) {
    var el__12348 = c2.dom.__GT_dom.call(null, el);
    try {
      if(cljs.core.keyword_QMARK_.call(null, x)) {
        var k__12350 = x;
        return el__12348.getAttribute(cljs.core.name.call(null, k__12350))
      }else {
        if(cljs.core.map_QMARK_.call(null, x)) {
          var m__12351 = x;
          var G__12352__12353 = cljs.core.seq.call(null, m__12351);
          if(G__12352__12353) {
            var G__12355__12357 = cljs.core.first.call(null, G__12352__12353);
            var vec__12356__12358 = G__12355__12357;
            var k__12359 = cljs.core.nth.call(null, vec__12356__12358, 0, null);
            var v__12360 = cljs.core.nth.call(null, vec__12356__12358, 1, null);
            var G__12352__12361 = G__12352__12353;
            var G__12355__12362 = G__12355__12357;
            var G__12352__12363 = G__12352__12361;
            while(true) {
              var vec__12364__12365 = G__12355__12362;
              var k__12366 = cljs.core.nth.call(null, vec__12364__12365, 0, null);
              var v__12367 = cljs.core.nth.call(null, vec__12364__12365, 1, null);
              var G__12352__12368 = G__12352__12363;
              attr.call(null, el__12348, k__12366, v__12367);
              var temp__3974__auto____12369 = cljs.core.next.call(null, G__12352__12368);
              if(temp__3974__auto____12369) {
                var G__12352__12370 = temp__3974__auto____12369;
                var G__12372 = cljs.core.first.call(null, G__12352__12370);
                var G__12373 = G__12352__12370;
                G__12355__12362 = G__12372;
                G__12352__12363 = G__12373;
                continue
              }else {
              }
              break
            }
          }else {
          }
          return el__12348
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
    var el__12371 = c2.dom.__GT_dom.call(null, el);
    if(v == null) {
      el__12371.removeAttribute(cljs.core.name.call(null, k))
    }else {
      if(cljs.core._EQ_.call(null, "\ufdd0'style", k)) {
        c2.dom.style.call(null, el__12371, v)
      }else {
        el__12371.setAttribute(cljs.core.name.call(null, k), v)
      }
    }
    return el__12371
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
    var el__12375 = c2.dom.__GT_dom.call(null, el);
    goog.dom.setTextContent(el__12375, v);
    return el__12375
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
    var el__12377 = c2.dom.__GT_dom.call(null, el);
    goog.dom.forms.setValue(el__12377, v);
    return el__12377
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
  var or__3824__auto____12379 = window.requestAnimationFrame;
  if(cljs.core.truth_(or__3824__auto____12379)) {
    return or__3824__auto____12379
  }else {
    var or__3824__auto____12380 = window.webkitRequestAnimationFrame;
    if(cljs.core.truth_(or__3824__auto____12380)) {
      return or__3824__auto____12380
    }else {
      return function(p1__12378_SHARP_) {
        return setTimeout(function() {
          return p1__12378_SHARP_.call(null)
        }, 10)
      }
    }
  }
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
  unify.cljs$lang$applyTo = function(arglist__12239) {
    var data = cljs.core.first(arglist__12239);
    var mapping = cljs.core.first(cljs.core.next(arglist__12239));
    var args = cljs.core.rest(cljs.core.next(arglist__12239));
    return unify__delegate(data, mapping, args)
  };
  unify.cljs$lang$arity$variadic = unify__delegate;
  return unify
}();
goog.provide("hello_bars.core");
goog.require("cljs.core");
goog.require("c2.core");
goog.require("c2.scale");
goog.require("c2.core");
var co__6305__auto____8129 = function() {
  var co__6254__auto____8128 = new reflex.core.ComputedObservable(null, true, function() {
    var width__8119 = 500;
    var bar_height__8120 = 20;
    var data__8121 = cljs.core.ObjMap.fromObject(["A", "B", "C", "D"], {"A":1, "B":2, "C":4, "D":3});
    var s__8122 = c2.scale.linear.call(null, "\ufdd0'domain", cljs.core.PersistentVector.fromArray([0, cljs.core.apply.call(null, cljs.core.max, cljs.core.vals.call(null, data__8121))], true), "\ufdd0'range", cljs.core.PersistentVector.fromArray([0, width__8119], true));
    return cljs.core.PersistentVector.fromArray(["\ufdd0'div", c2.core.unify.call(null, data__8121, function(p__8123) {
      var vec__8124__8125 = p__8123;
      var label__8126 = cljs.core.nth.call(null, vec__8124__8125, 0, null);
      var val__8127 = cljs.core.nth.call(null, vec__8124__8125, 1, null);
      return cljs.core.PersistentVector.fromArray(["\ufdd0'div", cljs.core.ObjMap.fromObject(["\ufdd0'style"], {"\ufdd0'style":cljs.core.ObjMap.fromObject(["\ufdd0'height", "\ufdd0'width", "\ufdd0'background-color"], {"\ufdd0'height":bar_height__8120, "\ufdd0'width":s__8122.call(null, val__8127), "\ufdd0'background-color":"gray"})}), cljs.core.PersistentVector.fromArray(["\ufdd0'span", cljs.core.ObjMap.fromObject(["\ufdd0'style"], {"\ufdd0'style":cljs.core.ObjMap.fromObject(["\ufdd0'color"], {"\ufdd0'color":"white"})}), 
      label__8126], true)], true)
    })], true)
  }, cljs.core.gensym.call(null, "computed-observable"), cljs.core.ObjMap.EMPTY, cljs.core.ObjMap.EMPTY);
  cljs.core.deref.call(null, co__6254__auto____8128);
  return co__6254__auto____8128
}();
var $el__6306__auto____8130 = c2.dom.__GT_dom.call(null, "#bars");
singult.core.merge_BANG_.call(null, $el__6306__auto____8130, cljs.core.deref.call(null, co__6305__auto____8129));
cljs.core.add_watch.call(null, co__6305__auto____8129, "\ufdd0'update-dom", function() {
  return singult.core.merge_BANG_.call(null, $el__6306__auto____8130, cljs.core.deref.call(null, co__6305__auto____8129))
});
co__6305__auto____8129;
