export default  {
    load: function(url, cb) {
      var urlArr = [];
      if (typeof url == 'string') {
        urlArr.push(url);
      } else {
        urlArr = url;
      }
      var len = urlArr.length,
        callback = function() {
          if (!--len) {
            cb && cb();
          }
        };
      for (var i = 0, url; (url = urlArr[i]); i++) {
        this._load(url, callback);
      }
    },
    _load: function(url, cb) {
      var oldIe = /msie [\w.]+/.test(navigator.userAgent.toLowerCase());
      if (oldIe) {
        this._iframeLoad(url, cb);
      } else {
        this._scriptLoad(url, cb);
      }
    },
    _scriptLoad: function(url, cb) {
      var el = document.createElement('script');
      el.setAttribute('type', 'text/javascript');
      el.setAttribute('src', url + '?max_age=20000000');
      el.setAttribute('async', true);
      el.onerror = function() {
        cb();
        el.onerror = null;
      };
      el.onload = el.onreadystatechange = function() {
        if (
          !this.readyState ||
          this.readyState === 'loaded' ||
          this.readyState === 'complete'
        ) {
          cb();
          el.onload = el.onreadystatechange = null;
        }
      };
      document.getElementsByTagName('head')[0].appendChild(el);
    },
    _iframeLoad: function(url, cb) {
      var iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src =
        'javascript:void(function(){document.open();' +
        'document.domain = "' +
        document.domain +
        '";document.close();}());';

      iframe.callback = function(jsStr) {
        eval(jsStr);
        //                    if (storeMode) {
        //                        try {
        //                            clearLocal(url);
        //                            localStorage[url] = jsStr;
        //                        } catch (e) {}
        //                    }
        cb();
        setTimeout(function() {
          document.body.removeChild(iframe);
          iframe = null;
        }, 1000);
      };
      var iframeLoad = function() {
        var iframeDoc =
          iframe.contentDocument || iframe.contentWindow.document;
        var iframeHtm = [
          '<html><head><meta charset="utf-8"></head><body onload="callback()">',
          '<script type="text/javascript">',
          'var jsStr = "", cb = false;',
          'var define = function (id, factory) {',
          'if (typeof(factory) == "function") {',
          'var factoryStr = factory.toString();',
          'jsStr += "define(\'" + id + "\'," + factoryStr + ");"',
          '}',
          '};<\/script>',
          '<script type="text/javascript" src="' +url +
            '?max_age=20000000' +
            '"><\/script>',
          '<script type="text/javascript">',
          'function callback() {',
          'if (jsStr && !cb) {',
          'frameElement.callback(jsStr);',
          'cb = true;',
          '}',
          '};',
          'callback();',
          '<\/script>',
          '</body></html>'
        ].join('');
        iframeDoc.open();
        iframeDoc.domain = document.domain;
        iframeDoc.write(iframeHtm);
        iframeDoc.close();
      };

      if (iframe.attachEvent) {
        var _ifmLoad = function() {
          iframe.detachEvent('onload', _ifmLoad);
          iframeLoad();
        };
        iframe.attachEvent('onload', _ifmLoad);
      } else {
        iframe.onload = function() {
          iframe.onload = null;
          iframeLoad();
        };
      }

      document.body.appendChild(iframe);
    }
  };