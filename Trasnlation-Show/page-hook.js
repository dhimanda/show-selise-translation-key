(() => {
  const MSG_TYPE = "UILM_KEYS_TOGGLE";

  let enabled = null;
  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data?.type !== MSG_TYPE) return;
    if (typeof event.data.enabled !== "boolean") return;
    enabled = event.data.enabled;
    resolveReady();
  });

  function isUilmUrl(url) {
    if (!url) return false;
    const s = String(url);
    return (
      /\/api\/uilm\/v[0-9]+\/LanguageManager\/Query\/GetUilmFile/i.test(s) ||
      /\/uilm\/v[0-9]+\/Key\/GetUilmFile/i.test(s) ||
      /BlocksConfiguration\/UILM\/GetUilmFile/i.test(s)
    );
  }

  function requestUrl(input) {
    if (typeof input === "string") return input;
    if (input instanceof URL) return input.href;
    if (input && typeof input.url === "string") return input.url;
    return "";
  }

  function transform(value) {
    if (Array.isArray(value)) return value.map(transform);
    if (value && typeof value === "object") {
      const out = {};
      for (const [key, nested] of Object.entries(value)) {
        if (typeof nested === "string" && key.includes(".")) out[key] = key;
        else out[key] = transform(nested);
      }
      return out;
    }
    return value;
  }

  function rewriteJsonText(text) {
    const json = JSON.parse(text);
    return JSON.stringify(transform(json));
  }

  const origFetch = window.fetch;
  window.fetch = async function (...args) {
    const url = requestUrl(args[0]);
    if (!isUilmUrl(url)) return origFetch.apply(this, args);

    await ready;
    const res = await origFetch.apply(this, args);
    if (!enabled) return res;

    try {
      const modified = rewriteJsonText(await res.clone().text());
      return new Response(modified, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers
      });
    } catch {
      return res;
    }
  };

  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  const responseTextDesc = Object.getOwnPropertyDescriptor(
    XMLHttpRequest.prototype,
    "responseText"
  );
  const responseDesc = Object.getOwnPropertyDescriptor(
    XMLHttpRequest.prototype,
    "response"
  );

  Object.defineProperty(XMLHttpRequest.prototype, "responseText", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (this.__uilmModifiedText !== undefined) return this.__uilmModifiedText;
      return responseTextDesc.get.call(this);
    }
  });

  Object.defineProperty(XMLHttpRequest.prototype, "response", {
    configurable: true,
    enumerable: true,
    get: function () {
      if (this.__uilmModifiedJson !== undefined && this.responseType === "json") {
        return this.__uilmModifiedJson;
      }
      if (this.__uilmModifiedText !== undefined) {
        if (this.responseType === "" || this.responseType === "text") {
          return this.__uilmModifiedText;
        }
      }
      return responseDesc.get.call(this);
    }
  });

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__uilmUrl = url;
    return origOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    if (!isUilmUrl(this.__uilmUrl)) return origSend.apply(this, args);

    const xhr = this;
    const proceed = () => {
      if (enabled) {
        xhr.addEventListener("readystatechange", () => {
          if (xhr.readyState !== 4) return;
          try {
            const modified = rewriteJsonText(responseTextDesc.get.call(xhr));
            xhr.__uilmModifiedText = modified;
            try {
              xhr.__uilmModifiedJson = JSON.parse(modified);
            } catch {
              xhr.__uilmModifiedJson = undefined;
            }
          } catch {
            /* leave original response */
          }
        });
      }
      origSend.apply(xhr, args);
    };

    if (enabled !== null) proceed();
    else ready.then(proceed);
  };
})();
