var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// ../node_modules/@lit/reactive-element/css-tag.js
var t = window.ShadowRoot && (window.ShadyCSS === void 0 || window.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var e = Symbol();
var n = /* @__PURE__ */ new Map();
var s = class {
  constructor(t3, n5) {
    if (this._$cssResult$ = true, n5 !== e)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3;
  }
  get styleSheet() {
    let e5 = n.get(this.cssText);
    return t && e5 === void 0 && (n.set(this.cssText, e5 = new CSSStyleSheet()), e5.replaceSync(this.cssText)), e5;
  }
  toString() {
    return this.cssText;
  }
};
var o = (t3) => new s(typeof t3 == "string" ? t3 : t3 + "", e);
var r = (t3, ...n5) => {
  const o6 = t3.length === 1 ? t3[0] : n5.reduce((e5, n6, s5) => e5 + ((t4) => {
    if (t4._$cssResult$ === true)
      return t4.cssText;
    if (typeof t4 == "number")
      return t4;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n6) + t3[s5 + 1], t3[0]);
  return new s(o6, e);
};
var i = (e5, n5) => {
  t ? e5.adoptedStyleSheets = n5.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet) : n5.forEach((t3) => {
    const n6 = document.createElement("style"), s5 = window.litNonce;
    s5 !== void 0 && n6.setAttribute("nonce", s5), n6.textContent = t3.cssText, e5.appendChild(n6);
  });
};
var S = t ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
  let e5 = "";
  for (const n5 of t4.cssRules)
    e5 += n5.cssText;
  return o(e5);
})(t3) : t3;

// ../node_modules/@lit/reactive-element/reactive-element.js
var s2;
var e2 = window.trustedTypes;
var r2 = e2 ? e2.emptyScript : "";
var h = window.reactiveElementPolyfillSupport;
var o2 = { toAttribute(t3, i3) {
  switch (i3) {
    case Boolean:
      t3 = t3 ? r2 : null;
      break;
    case Object:
    case Array:
      t3 = t3 == null ? t3 : JSON.stringify(t3);
  }
  return t3;
}, fromAttribute(t3, i3) {
  let s5 = t3;
  switch (i3) {
    case Boolean:
      s5 = t3 !== null;
      break;
    case Number:
      s5 = t3 === null ? null : Number(t3);
      break;
    case Object:
    case Array:
      try {
        s5 = JSON.parse(t3);
      } catch (t4) {
        s5 = null;
      }
  }
  return s5;
} };
var n2 = (t3, i3) => i3 !== t3 && (i3 == i3 || t3 == t3);
var l = { attribute: true, type: String, converter: o2, reflect: false, hasChanged: n2 };
var a = class extends HTMLElement {
  constructor() {
    super(), this._$Et = /* @__PURE__ */ new Map(), this.isUpdatePending = false, this.hasUpdated = false, this._$Ei = null, this.o();
  }
  static addInitializer(t3) {
    var i3;
    (i3 = this.l) !== null && i3 !== void 0 || (this.l = []), this.l.push(t3);
  }
  static get observedAttributes() {
    this.finalize();
    const t3 = [];
    return this.elementProperties.forEach((i3, s5) => {
      const e5 = this._$Eh(s5, i3);
      e5 !== void 0 && (this._$Eu.set(e5, s5), t3.push(e5));
    }), t3;
  }
  static createProperty(t3, i3 = l) {
    if (i3.state && (i3.attribute = false), this.finalize(), this.elementProperties.set(t3, i3), !i3.noAccessor && !this.prototype.hasOwnProperty(t3)) {
      const s5 = typeof t3 == "symbol" ? Symbol() : "__" + t3, e5 = this.getPropertyDescriptor(t3, s5, i3);
      e5 !== void 0 && Object.defineProperty(this.prototype, t3, e5);
    }
  }
  static getPropertyDescriptor(t3, i3, s5) {
    return { get() {
      return this[i3];
    }, set(e5) {
      const r5 = this[t3];
      this[i3] = e5, this.requestUpdate(t3, r5, s5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) || l;
  }
  static finalize() {
    if (this.hasOwnProperty("finalized"))
      return false;
    this.finalized = true;
    const t3 = Object.getPrototypeOf(this);
    if (t3.finalize(), this.elementProperties = new Map(t3.elementProperties), this._$Eu = /* @__PURE__ */ new Map(), this.hasOwnProperty("properties")) {
      const t4 = this.properties, i3 = [...Object.getOwnPropertyNames(t4), ...Object.getOwnPropertySymbols(t4)];
      for (const s5 of i3)
        this.createProperty(s5, t4[s5]);
    }
    return this.elementStyles = this.finalizeStyles(this.styles), true;
  }
  static finalizeStyles(i3) {
    const s5 = [];
    if (Array.isArray(i3)) {
      const e5 = new Set(i3.flat(1 / 0).reverse());
      for (const i4 of e5)
        s5.unshift(S(i4));
    } else
      i3 !== void 0 && s5.push(S(i3));
    return s5;
  }
  static _$Eh(t3, i3) {
    const s5 = i3.attribute;
    return s5 === false ? void 0 : typeof s5 == "string" ? s5 : typeof t3 == "string" ? t3.toLowerCase() : void 0;
  }
  o() {
    var t3;
    this._$Ep = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$Em(), this.requestUpdate(), (t3 = this.constructor.l) === null || t3 === void 0 || t3.forEach((t4) => t4(this));
  }
  addController(t3) {
    var i3, s5;
    ((i3 = this._$Eg) !== null && i3 !== void 0 ? i3 : this._$Eg = []).push(t3), this.renderRoot !== void 0 && this.isConnected && ((s5 = t3.hostConnected) === null || s5 === void 0 || s5.call(t3));
  }
  removeController(t3) {
    var i3;
    (i3 = this._$Eg) === null || i3 === void 0 || i3.splice(this._$Eg.indexOf(t3) >>> 0, 1);
  }
  _$Em() {
    this.constructor.elementProperties.forEach((t3, i3) => {
      this.hasOwnProperty(i3) && (this._$Et.set(i3, this[i3]), delete this[i3]);
    });
  }
  createRenderRoot() {
    var t3;
    const s5 = (t3 = this.shadowRoot) !== null && t3 !== void 0 ? t3 : this.attachShadow(this.constructor.shadowRootOptions);
    return i(s5, this.constructor.elementStyles), s5;
  }
  connectedCallback() {
    var t3;
    this.renderRoot === void 0 && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), (t3 = this._$Eg) === null || t3 === void 0 || t3.forEach((t4) => {
      var i3;
      return (i3 = t4.hostConnected) === null || i3 === void 0 ? void 0 : i3.call(t4);
    });
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    var t3;
    (t3 = this._$Eg) === null || t3 === void 0 || t3.forEach((t4) => {
      var i3;
      return (i3 = t4.hostDisconnected) === null || i3 === void 0 ? void 0 : i3.call(t4);
    });
  }
  attributeChangedCallback(t3, i3, s5) {
    this._$AK(t3, s5);
  }
  _$ES(t3, i3, s5 = l) {
    var e5, r5;
    const h4 = this.constructor._$Eh(t3, s5);
    if (h4 !== void 0 && s5.reflect === true) {
      const n5 = ((r5 = (e5 = s5.converter) === null || e5 === void 0 ? void 0 : e5.toAttribute) !== null && r5 !== void 0 ? r5 : o2.toAttribute)(i3, s5.type);
      this._$Ei = t3, n5 == null ? this.removeAttribute(h4) : this.setAttribute(h4, n5), this._$Ei = null;
    }
  }
  _$AK(t3, i3) {
    var s5, e5, r5;
    const h4 = this.constructor, n5 = h4._$Eu.get(t3);
    if (n5 !== void 0 && this._$Ei !== n5) {
      const t4 = h4.getPropertyOptions(n5), l4 = t4.converter, a3 = (r5 = (e5 = (s5 = l4) === null || s5 === void 0 ? void 0 : s5.fromAttribute) !== null && e5 !== void 0 ? e5 : typeof l4 == "function" ? l4 : null) !== null && r5 !== void 0 ? r5 : o2.fromAttribute;
      this._$Ei = n5, this[n5] = a3(i3, t4.type), this._$Ei = null;
    }
  }
  requestUpdate(t3, i3, s5) {
    let e5 = true;
    t3 !== void 0 && (((s5 = s5 || this.constructor.getPropertyOptions(t3)).hasChanged || n2)(this[t3], i3) ? (this._$AL.has(t3) || this._$AL.set(t3, i3), s5.reflect === true && this._$Ei !== t3 && (this._$E_ === void 0 && (this._$E_ = /* @__PURE__ */ new Map()), this._$E_.set(t3, s5))) : e5 = false), !this.isUpdatePending && e5 && (this._$Ep = this._$EC());
  }
  async _$EC() {
    this.isUpdatePending = true;
    try {
      await this._$Ep;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return t3 != null && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var t3;
    if (!this.isUpdatePending)
      return;
    this.hasUpdated, this._$Et && (this._$Et.forEach((t4, i4) => this[i4] = t4), this._$Et = void 0);
    let i3 = false;
    const s5 = this._$AL;
    try {
      i3 = this.shouldUpdate(s5), i3 ? (this.willUpdate(s5), (t3 = this._$Eg) === null || t3 === void 0 || t3.forEach((t4) => {
        var i4;
        return (i4 = t4.hostUpdate) === null || i4 === void 0 ? void 0 : i4.call(t4);
      }), this.update(s5)) : this._$EU();
    } catch (t4) {
      throw i3 = false, this._$EU(), t4;
    }
    i3 && this._$AE(s5);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    var i3;
    (i3 = this._$Eg) === null || i3 === void 0 || i3.forEach((t4) => {
      var i4;
      return (i4 = t4.hostUpdated) === null || i4 === void 0 ? void 0 : i4.call(t4);
    }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
  }
  _$EU() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$Ep;
  }
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    this._$E_ !== void 0 && (this._$E_.forEach((t4, i3) => this._$ES(i3, this[i3], t4)), this._$E_ = void 0), this._$EU();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
};
a.finalized = true, a.elementProperties = /* @__PURE__ */ new Map(), a.elementStyles = [], a.shadowRootOptions = { mode: "open" }, h == null || h({ ReactiveElement: a }), ((s2 = globalThis.reactiveElementVersions) !== null && s2 !== void 0 ? s2 : globalThis.reactiveElementVersions = []).push("1.0.2");

// ../node_modules/lit-html/lit-html.js
var t2;
var i2 = globalThis.trustedTypes;
var s3 = i2 ? i2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
var e3 = `lit$${(Math.random() + "").slice(9)}$`;
var o3 = "?" + e3;
var n3 = `<${o3}>`;
var l2 = document;
var h2 = (t3 = "") => l2.createComment(t3);
var r3 = (t3) => t3 === null || typeof t3 != "object" && typeof t3 != "function";
var d = Array.isArray;
var u = (t3) => {
  var i3;
  return d(t3) || typeof ((i3 = t3) === null || i3 === void 0 ? void 0 : i3[Symbol.iterator]) == "function";
};
var c = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var v = /-->/g;
var a2 = />/g;
var f = />|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g;
var _ = /'/g;
var m = /"/g;
var g = /^(?:script|style|textarea)$/i;
var $ = (t3) => (i3, ...s5) => ({ _$litType$: t3, strings: i3, values: s5 });
var p = $(1);
var y = $(2);
var b = Symbol.for("lit-noChange");
var T = Symbol.for("lit-nothing");
var x = /* @__PURE__ */ new WeakMap();
var w = (t3, i3, s5) => {
  var e5, o6;
  const n5 = (e5 = s5 == null ? void 0 : s5.renderBefore) !== null && e5 !== void 0 ? e5 : i3;
  let l4 = n5._$litPart$;
  if (l4 === void 0) {
    const t4 = (o6 = s5 == null ? void 0 : s5.renderBefore) !== null && o6 !== void 0 ? o6 : null;
    n5._$litPart$ = l4 = new N(i3.insertBefore(h2(), t4), t4, void 0, s5 != null ? s5 : {});
  }
  return l4._$AI(t3), l4;
};
var A = l2.createTreeWalker(l2, 129, null, false);
var C = (t3, i3) => {
  const o6 = t3.length - 1, l4 = [];
  let h4, r5 = i3 === 2 ? "<svg>" : "", d2 = c;
  for (let i4 = 0; i4 < o6; i4++) {
    const s5 = t3[i4];
    let o7, u3, $2 = -1, p2 = 0;
    for (; p2 < s5.length && (d2.lastIndex = p2, u3 = d2.exec(s5), u3 !== null); )
      p2 = d2.lastIndex, d2 === c ? u3[1] === "!--" ? d2 = v : u3[1] !== void 0 ? d2 = a2 : u3[2] !== void 0 ? (g.test(u3[2]) && (h4 = RegExp("</" + u3[2], "g")), d2 = f) : u3[3] !== void 0 && (d2 = f) : d2 === f ? u3[0] === ">" ? (d2 = h4 != null ? h4 : c, $2 = -1) : u3[1] === void 0 ? $2 = -2 : ($2 = d2.lastIndex - u3[2].length, o7 = u3[1], d2 = u3[3] === void 0 ? f : u3[3] === '"' ? m : _) : d2 === m || d2 === _ ? d2 = f : d2 === v || d2 === a2 ? d2 = c : (d2 = f, h4 = void 0);
    const y2 = d2 === f && t3[i4 + 1].startsWith("/>") ? " " : "";
    r5 += d2 === c ? s5 + n3 : $2 >= 0 ? (l4.push(o7), s5.slice(0, $2) + "$lit$" + s5.slice($2) + e3 + y2) : s5 + e3 + ($2 === -2 ? (l4.push(void 0), i4) : y2);
  }
  const u2 = r5 + (t3[o6] || "<?>") + (i3 === 2 ? "</svg>" : "");
  return [s3 !== void 0 ? s3.createHTML(u2) : u2, l4];
};
var P = class {
  constructor({ strings: t3, _$litType$: s5 }, n5) {
    let l4;
    this.parts = [];
    let r5 = 0, d2 = 0;
    const u2 = t3.length - 1, c2 = this.parts, [v2, a3] = C(t3, s5);
    if (this.el = P.createElement(v2, n5), A.currentNode = this.el.content, s5 === 2) {
      const t4 = this.el.content, i3 = t4.firstChild;
      i3.remove(), t4.append(...i3.childNodes);
    }
    for (; (l4 = A.nextNode()) !== null && c2.length < u2; ) {
      if (l4.nodeType === 1) {
        if (l4.hasAttributes()) {
          const t4 = [];
          for (const i3 of l4.getAttributeNames())
            if (i3.endsWith("$lit$") || i3.startsWith(e3)) {
              const s6 = a3[d2++];
              if (t4.push(i3), s6 !== void 0) {
                const t5 = l4.getAttribute(s6.toLowerCase() + "$lit$").split(e3), i4 = /([.?@])?(.*)/.exec(s6);
                c2.push({ type: 1, index: r5, name: i4[2], strings: t5, ctor: i4[1] === "." ? M : i4[1] === "?" ? H : i4[1] === "@" ? I : S2 });
              } else
                c2.push({ type: 6, index: r5 });
            }
          for (const i3 of t4)
            l4.removeAttribute(i3);
        }
        if (g.test(l4.tagName)) {
          const t4 = l4.textContent.split(e3), s6 = t4.length - 1;
          if (s6 > 0) {
            l4.textContent = i2 ? i2.emptyScript : "";
            for (let i3 = 0; i3 < s6; i3++)
              l4.append(t4[i3], h2()), A.nextNode(), c2.push({ type: 2, index: ++r5 });
            l4.append(t4[s6], h2());
          }
        }
      } else if (l4.nodeType === 8)
        if (l4.data === o3)
          c2.push({ type: 2, index: r5 });
        else {
          let t4 = -1;
          for (; (t4 = l4.data.indexOf(e3, t4 + 1)) !== -1; )
            c2.push({ type: 7, index: r5 }), t4 += e3.length - 1;
        }
      r5++;
    }
  }
  static createElement(t3, i3) {
    const s5 = l2.createElement("template");
    return s5.innerHTML = t3, s5;
  }
};
function V(t3, i3, s5 = t3, e5) {
  var o6, n5, l4, h4;
  if (i3 === b)
    return i3;
  let d2 = e5 !== void 0 ? (o6 = s5._$Cl) === null || o6 === void 0 ? void 0 : o6[e5] : s5._$Cu;
  const u2 = r3(i3) ? void 0 : i3._$litDirective$;
  return (d2 == null ? void 0 : d2.constructor) !== u2 && ((n5 = d2 == null ? void 0 : d2._$AO) === null || n5 === void 0 || n5.call(d2, false), u2 === void 0 ? d2 = void 0 : (d2 = new u2(t3), d2._$AT(t3, s5, e5)), e5 !== void 0 ? ((l4 = (h4 = s5)._$Cl) !== null && l4 !== void 0 ? l4 : h4._$Cl = [])[e5] = d2 : s5._$Cu = d2), d2 !== void 0 && (i3 = V(t3, d2._$AS(t3, i3.values), d2, e5)), i3;
}
var E = class {
  constructor(t3, i3) {
    this.v = [], this._$AN = void 0, this._$AD = t3, this._$AM = i3;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  p(t3) {
    var i3;
    const { el: { content: s5 }, parts: e5 } = this._$AD, o6 = ((i3 = t3 == null ? void 0 : t3.creationScope) !== null && i3 !== void 0 ? i3 : l2).importNode(s5, true);
    A.currentNode = o6;
    let n5 = A.nextNode(), h4 = 0, r5 = 0, d2 = e5[0];
    for (; d2 !== void 0; ) {
      if (h4 === d2.index) {
        let i4;
        d2.type === 2 ? i4 = new N(n5, n5.nextSibling, this, t3) : d2.type === 1 ? i4 = new d2.ctor(n5, d2.name, d2.strings, this, t3) : d2.type === 6 && (i4 = new L(n5, this, t3)), this.v.push(i4), d2 = e5[++r5];
      }
      h4 !== (d2 == null ? void 0 : d2.index) && (n5 = A.nextNode(), h4++);
    }
    return o6;
  }
  m(t3) {
    let i3 = 0;
    for (const s5 of this.v)
      s5 !== void 0 && (s5.strings !== void 0 ? (s5._$AI(t3, s5, i3), i3 += s5.strings.length - 2) : s5._$AI(t3[i3])), i3++;
  }
};
var N = class {
  constructor(t3, i3, s5, e5) {
    var o6;
    this.type = 2, this._$AH = T, this._$AN = void 0, this._$AA = t3, this._$AB = i3, this._$AM = s5, this.options = e5, this._$Cg = (o6 = e5 == null ? void 0 : e5.isConnected) === null || o6 === void 0 || o6;
  }
  get _$AU() {
    var t3, i3;
    return (i3 = (t3 = this._$AM) === null || t3 === void 0 ? void 0 : t3._$AU) !== null && i3 !== void 0 ? i3 : this._$Cg;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i3 = this._$AM;
    return i3 !== void 0 && t3.nodeType === 11 && (t3 = i3.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i3 = this) {
    t3 = V(this, t3, i3), r3(t3) ? t3 === T || t3 == null || t3 === "" ? (this._$AH !== T && this._$AR(), this._$AH = T) : t3 !== this._$AH && t3 !== b && this.$(t3) : t3._$litType$ !== void 0 ? this.T(t3) : t3.nodeType !== void 0 ? this.S(t3) : u(t3) ? this.M(t3) : this.$(t3);
  }
  A(t3, i3 = this._$AB) {
    return this._$AA.parentNode.insertBefore(t3, i3);
  }
  S(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.A(t3));
  }
  $(t3) {
    this._$AH !== T && r3(this._$AH) ? this._$AA.nextSibling.data = t3 : this.S(l2.createTextNode(t3)), this._$AH = t3;
  }
  T(t3) {
    var i3;
    const { values: s5, _$litType$: e5 } = t3, o6 = typeof e5 == "number" ? this._$AC(t3) : (e5.el === void 0 && (e5.el = P.createElement(e5.h, this.options)), e5);
    if (((i3 = this._$AH) === null || i3 === void 0 ? void 0 : i3._$AD) === o6)
      this._$AH.m(s5);
    else {
      const t4 = new E(o6, this), i4 = t4.p(this.options);
      t4.m(s5), this.S(i4), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let i3 = x.get(t3.strings);
    return i3 === void 0 && x.set(t3.strings, i3 = new P(t3)), i3;
  }
  M(t3) {
    d(this._$AH) || (this._$AH = [], this._$AR());
    const i3 = this._$AH;
    let s5, e5 = 0;
    for (const o6 of t3)
      e5 === i3.length ? i3.push(s5 = new N(this.A(h2()), this.A(h2()), this, this.options)) : s5 = i3[e5], s5._$AI(o6), e5++;
    e5 < i3.length && (this._$AR(s5 && s5._$AB.nextSibling, e5), i3.length = e5);
  }
  _$AR(t3 = this._$AA.nextSibling, i3) {
    var s5;
    for ((s5 = this._$AP) === null || s5 === void 0 || s5.call(this, false, true, i3); t3 && t3 !== this._$AB; ) {
      const i4 = t3.nextSibling;
      t3.remove(), t3 = i4;
    }
  }
  setConnected(t3) {
    var i3;
    this._$AM === void 0 && (this._$Cg = t3, (i3 = this._$AP) === null || i3 === void 0 || i3.call(this, t3));
  }
};
var S2 = class {
  constructor(t3, i3, s5, e5, o6) {
    this.type = 1, this._$AH = T, this._$AN = void 0, this.element = t3, this.name = i3, this._$AM = e5, this.options = o6, s5.length > 2 || s5[0] !== "" || s5[1] !== "" ? (this._$AH = Array(s5.length - 1).fill(new String()), this.strings = s5) : this._$AH = T;
  }
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3, i3 = this, s5, e5) {
    const o6 = this.strings;
    let n5 = false;
    if (o6 === void 0)
      t3 = V(this, t3, i3, 0), n5 = !r3(t3) || t3 !== this._$AH && t3 !== b, n5 && (this._$AH = t3);
    else {
      const e6 = t3;
      let l4, h4;
      for (t3 = o6[0], l4 = 0; l4 < o6.length - 1; l4++)
        h4 = V(this, e6[s5 + l4], i3, l4), h4 === b && (h4 = this._$AH[l4]), n5 || (n5 = !r3(h4) || h4 !== this._$AH[l4]), h4 === T ? t3 = T : t3 !== T && (t3 += (h4 != null ? h4 : "") + o6[l4 + 1]), this._$AH[l4] = h4;
    }
    n5 && !e5 && this.k(t3);
  }
  k(t3) {
    t3 === T ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 != null ? t3 : "");
  }
};
var M = class extends S2 {
  constructor() {
    super(...arguments), this.type = 3;
  }
  k(t3) {
    this.element[this.name] = t3 === T ? void 0 : t3;
  }
};
var k = i2 ? i2.emptyScript : "";
var H = class extends S2 {
  constructor() {
    super(...arguments), this.type = 4;
  }
  k(t3) {
    t3 && t3 !== T ? this.element.setAttribute(this.name, k) : this.element.removeAttribute(this.name);
  }
};
var I = class extends S2 {
  constructor(t3, i3, s5, e5, o6) {
    super(t3, i3, s5, e5, o6), this.type = 5;
  }
  _$AI(t3, i3 = this) {
    var s5;
    if ((t3 = (s5 = V(this, t3, i3, 0)) !== null && s5 !== void 0 ? s5 : T) === b)
      return;
    const e5 = this._$AH, o6 = t3 === T && e5 !== T || t3.capture !== e5.capture || t3.once !== e5.once || t3.passive !== e5.passive, n5 = t3 !== T && (e5 === T || o6);
    o6 && this.element.removeEventListener(this.name, this, e5), n5 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    var i3, s5;
    typeof this._$AH == "function" ? this._$AH.call((s5 = (i3 = this.options) === null || i3 === void 0 ? void 0 : i3.host) !== null && s5 !== void 0 ? s5 : this.element, t3) : this._$AH.handleEvent(t3);
  }
};
var L = class {
  constructor(t3, i3, s5) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i3, this.options = s5;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    V(this, t3);
  }
};
var z = window.litHtmlPolyfillSupport;
z == null || z(P, N), ((t2 = globalThis.litHtmlVersions) !== null && t2 !== void 0 ? t2 : globalThis.litHtmlVersions = []).push("2.0.2");

// ../node_modules/lit-element/lit-element.js
var l3;
var o4;
var s4 = class extends a {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Dt = void 0;
  }
  createRenderRoot() {
    var t3, e5;
    const i3 = super.createRenderRoot();
    return (t3 = (e5 = this.renderOptions).renderBefore) !== null && t3 !== void 0 || (e5.renderBefore = i3.firstChild), i3;
  }
  update(t3) {
    const i3 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Dt = w(i3, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var t3;
    super.connectedCallback(), (t3 = this._$Dt) === null || t3 === void 0 || t3.setConnected(true);
  }
  disconnectedCallback() {
    var t3;
    super.disconnectedCallback(), (t3 = this._$Dt) === null || t3 === void 0 || t3.setConnected(false);
  }
  render() {
    return b;
  }
};
s4.finalized = true, s4._$litElement$ = true, (l3 = globalThis.litElementHydrateSupport) === null || l3 === void 0 || l3.call(globalThis, { LitElement: s4 });
var n4 = globalThis.litElementPolyfillSupport;
n4 == null || n4({ LitElement: s4 });
((o4 = globalThis.litElementVersions) !== null && o4 !== void 0 ? o4 : globalThis.litElementVersions = []).push("3.0.2");

// ../node_modules/lit-element/index.js
console.warn("The main 'lit-element' module entrypoint is deprecated. Please update your imports to use the 'lit' package: 'lit' and 'lit/decorators.ts' or import from 'lit-element/lit-element.ts'. See https://lit.dev/msg/deprecated-import-path for more information.");

// sass-plugin-18:D:\Workspace\esbuild-sass-plugin\test\fixture\exclude\src\lit\styles.scss
var styles_default = r`
.message {
  font-family: sans-serif;
  color: white;
  background-color: red;
  border: 2px solid darkred;
  padding: 8px;
}`;

// src/lit/index.js
var _a;
customElements.define("hello-world", (_a = class extends s4 {
  render() {
    return p`<div class="message">Hello World, I have been rendered with Lit!!!</div>`;
  }
}, __publicField(_a, "styles", [styles_default]), _a));

// sass-plugin-19:D:\Workspace\esbuild-sass-plugin\test\fixture\exclude\src\modules\example.module.scss
var css = `._message_kto8s_1 {
  color: yellow;
  background-color: blue;
  border: 2px solid darkblue;
  padding: 8px;
}`;
document.head.appendChild(document.createElement("style")).appendChild(document.createTextNode(css));
var example_module_default = {
  "message": "_message_kto8s_1"
};

// sass-plugin-19:D:\Workspace\esbuild-sass-plugin\test\fixture\exclude\src\modules\common.module.scss
var css2 = `._message_bxgcs_1 {
  font-family: Roboto, sans-serif;
}`;
document.head.appendChild(document.createElement("style")).appendChild(document.createTextNode(css2));
var common_module_default = {
  "message": "_message_bxgcs_1"
};

// src/modules/index.js
document.body.insertAdjacentHTML("afterbegin", `
    <div class="${example_module_default.message} ${common_module_default.message}">Hello World, I have been rendered with CSS Modules!!!</div>
`);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
