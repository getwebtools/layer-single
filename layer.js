/*!
 * layer - 通用 Web 弹出层组件
 * MIT Licensed
 */

;!function(window, undefined) {
  "use strict";

  var isLayui = window.layui && layui.define, $, win, ready = {
    getPath: function() {
      var jsPath = document.currentScript ? document.currentScript.src : function() {
        var js = document.scripts
          , last = js.length - 1
          , src;
        for (var i = last; i > 0; i--) {
          if (js[i].readyState === 'interactive') {
            src = js[i].src;
            break;
          }
        }
        return src || js[last].src;
      }()
        , GLOBAL = window.LAYUI_GLOBAL || {};
      return GLOBAL.layer_dir || jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
    }(),

    config: {}, end: {}, minIndex: 0, minLeft: [],
    btn: ['&#x786E;&#x5B9A;', '&#x53D6;&#x6D88;'],

    //五种原始层模式
    type: ['dialog', 'page', 'iframe', 'loading', 'tips'],

    //获取节点的style属性值
    getStyle: function(node, name) {
      var style = node.currentStyle ? node.currentStyle : window.getComputedStyle(node, null);
      return style[style.getPropertyValue ? 'getPropertyValue' : 'getAttribute'](name);
    },

    //载入 CSS 依赖
    link: function(href, fn, cssname) {
      return
    }
  };

//默认内置方法。
  var layer = {
    v: '3.5.1',
    ie: function() { //ie版本
      var agent = navigator.userAgent.toLowerCase();
      return (!!window.ActiveXObject || "ActiveXObject" in window) ? (
        (agent.match(/msie\s(\d+)/) || [])[1] || '11' //由于ie11并没有msie的标识
      ) : false;
    }(),
    index: (window.layer && window.layer.v) ? 100000 : 0,
    path: ready.getPath,
    config: function(options, fn) {
      options = options || {};
      layer.cache = ready.config = $.extend({}, ready.config, options);
      layer.path = ready.config.path || layer.path;
      typeof options.extend === 'string' && (options.extend = [options.extend]);

      //如果设置了路径，则加载样式
      if (ready.config.path) layer.ready();

      if (!options.extend) return this;

      isLayui
        ? layui.addcss('modules/layer/' + options.extend)
        : ready.link('theme/' + options.extend);

      return this;
    },

    //主体CSS等待事件
    ready: function(callback) {
      var cssname = 'layer', ver = ''
        , path = (isLayui ? 'modules/layer/' : 'theme/') + 'default/layer.css?v=' + layer.v + ver;
      isLayui ? layui.addcss(path, callback, cssname) : ready.link(path, callback, cssname);
      return this;
    },

    //各种快捷引用
    alert: function(content, options, yes) {
      var type = typeof options === 'function';
      if (type) yes = options;
      return layer.open($.extend({
        content: content,
        yes: yes
      }, type ? {} : options));
    },

    confirm: function(content, options, yes, cancel) {
      var type = typeof options === 'function';
      if (type) {
        cancel = yes;
        yes = options;
      }
      return layer.open($.extend({
        content: content,
        btn: ready.btn,
        yes: yes,
        btn2: cancel
      }, type ? {} : options));
    },

    msg: function(content, options, end) { //最常用提示层
      var type = typeof options === 'function', rskin = ready.config.skin;
      var skin = (rskin ? rskin + ' ' + rskin + '-msg' : '') || 'layui-layer-msg';
      var anim = doms.anim.length - 1;
      if (type) end = options;
      return layer.open($.extend({
        content: content,
        time: 3000,
        shade: false,
        skin: skin,
        title: false,
        closeBtn: false,
        btn: false,
        resize: false,
        end: end
      }, (type && !ready.config.skin) ? {
        skin: skin + ' layui-layer-hui',
        anim: anim
      } : function() {
        options = options || {};
        if (options.icon === -1 || options.icon === undefined && !ready.config.skin) {
          options.skin = skin + ' ' + (options.skin || 'layui-layer-hui');
        }
        return options;
      }()));
    },

    load: function(icon, options) {
      return layer.open($.extend({
        type: 3,
        icon: icon || 0,
        resize: false,
        shade: 0.01
      }, options));
    },

    tips: function(content, follow, options) {
      return layer.open($.extend({
        type: 4,
        content: [content, follow],
        closeBtn: false,
        time: 3000,
        shade: false,
        resize: false,
        fixed: false,
        maxWidth: 260
      }, options));
    }
  };

  var Class = function(setings) {
    var that = this, creat = function() {
      that.creat();
    };
    that.index = ++layer.index;
    that.config.maxWidth = $(win).width() - 15 * 2; //初始最大宽度：当前屏幕宽，左右留 15px 边距
    that.config = $.extend({}, that.config, ready.config, setings);
    document.body ? creat() : setTimeout(function() {
      creat();
    }, 30);
  };

  Class.pt = Class.prototype;

//缓存常用字符
  var doms = ['layui-layer', '.layui-layer-title', '.layui-layer-main', '.layui-layer-dialog', 'layui-layer-iframe', 'layui-layer-content', 'layui-layer-btn', 'layui-layer-close'];
  doms.anim = ['layer-anim-00', 'layer-anim-01', 'layer-anim-02', 'layer-anim-03', 'layer-anim-04', 'layer-anim-05', 'layer-anim-06'];

  doms.SHADE = 'layui-layer-shade';
  doms.MOVE = 'layui-layer-move';

//默认配置
  Class.pt.config = {
    type: 0,
    shade: 0.3,
    fixed: true,
    move: doms[1],
    title: '&#x4FE1;&#x606F;',
    offset: 'auto',
    area: 'auto',
    closeBtn: 1,
    time: 0, //0表示不自动关闭
    zIndex: 19891014,
    maxWidth: 360,
    anim: 0,
    isOutAnim: true, //退出动画
    minStack: true, //最小化堆叠
    icon: -1,
    moveType: 1,
    resize: true,
    scrollbar: true, //是否允许浏览器滚动条
    tips: 2
  };

//容器
  Class.pt.vessel = function(conType, callback) {
    var that = this, times = that.index, config = that.config;
    var zIndex = config.zIndex + times, titype = typeof config.title === 'object';
    var ismax = config.maxmin && (config.type === 1 || config.type === 2);
    var titleHTML = (config.title ? '<div class="layui-layer-title" style="' + (titype ? config.title[1] : '') + '">'
      + (titype ? config.title[0] : config.title)
      + '</div>' : '');

    config.zIndex = zIndex;
    callback([
      //遮罩
      config.shade ? ('<div class="' + doms.SHADE + '" id="' + doms.SHADE + times + '" times="' + times + '" style="' + ('z-index:' + (zIndex - 1) + '; ') + '"></div>') : '',

      //主体
      '<div class="' + doms[0] + (' layui-layer-' + ready.type[config.type]) + (((config.type == 0 || config.type == 2) && !config.shade) ? ' layui-layer-border' : '') + ' ' + (config.skin || '') + '" id="' + doms[0] + times + '" type="' + ready.type[config.type] + '" times="' + times + '" showtime="' + config.time + '" conType="' + (conType ? 'object' : 'string') + '" style="z-index: ' + zIndex + '; width:' + config.area[0] + ';height:' + config.area[1] + ';position:' + (config.fixed ? 'fixed;' : 'absolute;') + '">'
      + (conType && config.type != 2 ? '' : titleHTML)
      + '<div id="' + (config.id || '') + '" class="layui-layer-content' + ((config.type == 0 && config.icon !== -1) ? ' layui-layer-padding' : '') + (config.type == 3 ? ' layui-layer-loading' + config.icon : '') + '">'
      + (config.type == 0 && config.icon !== -1 ? '<i class="layui-layer-ico layui-layer-ico' + config.icon + '"></i>' : '')
      + (config.type == 1 && conType ? '' : (config.content || ''))
      + '</div>'
      + '<span class="layui-layer-setwin">' + function() {
        var closebtn = ismax ? '<a class="layui-layer-min" href="javascript:;"><cite></cite></a><a class="layui-layer-ico layui-layer-max" href="javascript:;"></a>' : '';
        config.closeBtn && (closebtn += '<a class="layui-layer-ico ' + doms[7] + ' ' + doms[7] + (config.title ? config.closeBtn : (config.type == 4 ? '1' : '2')) + '" href="javascript:;"></a>');
        return closebtn;
      }() + '</span>'
      + (config.btn ? function() {
        var button = '';
        typeof config.btn === 'string' && (config.btn = [config.btn]);
        for (var i = 0, len = config.btn.length; i < len; i++) {
          button += '<a class="' + doms[6] + '' + i + '">' + config.btn[i] + '</a>'
        }
        return '<div class="' + doms[6] + ' layui-layer-btn-' + (config.btnAlign || '') + '">' + button + '</div>'
      }() : '')
      + (config.resize ? '<span class="layui-layer-resize"></span>' : '')
      + '</div>'
    ], titleHTML, $('<div class="' + doms.MOVE + '" id="' + doms.MOVE + '"></div>'));
    return that;
  };

//创建骨架
  Class.pt.creat = function() {
    var that = this
      , config = that.config
      , times = that.index, nodeIndex
      , content = config.content
      , conType = typeof content === 'object'
      , body = $('body');

    if (config.id && $('#' + config.id)[0]) return;

    if (typeof config.area === 'string') {
      config.area = config.area === 'auto' ? ['', ''] : [config.area, ''];
    }

    //anim兼容旧版shift
    if (config.shift) {
      config.anim = config.shift;
    }

    if (layer.ie == 6) {
      config.fixed = false;
    }

    switch (config.type) {
      case 0:
        config.btn = ('btn' in config) ? config.btn : ready.btn[0];
        layer.closeAll('dialog');
        break;
      case 2:
        var content = config.content = conType ? config.content : [config.content || '', 'auto'];
        config.content = '<iframe scrolling="' + (config.content[1] || 'auto') + '" allowtransparency="true" id="' + doms[4] + '' + times + '" name="' + doms[4] + '' + times + '" onload="this.className=\'\';" class="layui-layer-load" frameborder="0" src="' + config.content[0] + '"></iframe>';
        break;
      case 3:
        delete config.title;
        delete config.closeBtn;
        config.icon === -1 && (config.icon === 0);
        layer.closeAll('loading');
        break;
      case 4:
        conType || (config.content = [config.content, 'body']);
        config.follow = config.content[1];
        config.content = config.content[0] + '<i class="layui-layer-TipsG"></i>';
        delete config.title;
        config.tips = typeof config.tips === 'object' ? config.tips : [config.tips, true];
        config.tipsMore || layer.closeAll('tips');
        break;
    }

    //建立容器
    that.vessel(conType, function(html, titleHTML, moveElem) {
      body.append(html[0]);
      conType ? function() {
        (config.type == 2 || config.type == 4) ? function() {
          $('body').append(html[1]);
        }() : function() {
          if (!content.parents('.' + doms[0])[0]) {
            content.data('display', content.css('display')).show().addClass('layui-layer-wrap').wrap(html[1]);
            $('#' + doms[0] + times).find('.' + doms[5]).before(titleHTML);
          }
        }();
      }() : body.append(html[1]);
      $('#' + doms.MOVE)[0] || body.append(ready.moveElem = moveElem);

      that.layero = $('#' + doms[0] + times);
      that.shadeo = $('#' + doms.SHADE + times);

      config.scrollbar || doms.html.css('overflow', 'hidden').attr('layer-full', times);
    }).auto(times);

    //遮罩
    that.shadeo.css({
      'background-color': config.shade[1] || '#000'
      , 'opacity': config.shade[0] || config.shade
    });

    config.type == 2 && layer.ie == 6 && that.layero.find('iframe').attr('src', content[0]);

    //坐标自适应浏览器窗口尺寸
    config.type == 4 ? that.tips() : function() {
      that.offset()
      //首次弹出时，若 css 尚未加载，则等待 css 加载完毕后，重新设定尺寸
      parseInt(ready.getStyle(document.getElementById(doms.MOVE), 'z-index')) || function() {
        that.layero.css('visibility', 'hidden');
        layer.ready(function() {
          that.offset();
          that.layero.css('visibility', 'visible');
        });
      }();
    }();

    //如果是固定定位
    if (config.fixed) {
      win.on('resize', function() {
        that.offset();
        (/^\d+%$/.test(config.area[0]) || /^\d+%$/.test(config.area[1])) && that.auto(times);
        config.type == 4 && that.tips();
      });
    }

    config.time <= 0 || setTimeout(function() {
      layer.close(that.index);
    }, config.time);
    that.move().callback();

    //为兼容jQuery3.0的css动画影响元素尺寸计算
    if (doms.anim[config.anim]) {
      var animClass = 'layer-anim ' + doms.anim[config.anim];
      that.layero.addClass(animClass).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
        $(this).removeClass(animClass);
      });
    }
    ;

    //记录关闭动画
    if (config.isOutAnim) {
      that.layero.data('isOutAnim', true);
    }
  };

//自适应
  Class.pt.auto = function(index) {
    var that = this, config = that.config, layero = $('#' + doms[0] + index);

    if (config.area[0] === '' && config.maxWidth > 0) {
      //为了修复IE7下一个让人难以理解的bug
      if (layer.ie && layer.ie < 8 && config.btn) {
        layero.width(layero.innerWidth());
      }
      layero.outerWidth() > config.maxWidth && layero.width(config.maxWidth);
    }

    var area = [layero.innerWidth(), layero.innerHeight()]
      , titHeight = layero.find(doms[1]).outerHeight() || 0
      , btnHeight = layero.find('.' + doms[6]).outerHeight() || 0
      , setHeight = function(elem) {
      elem = layero.find(elem);
      elem.height(area[1] - titHeight - btnHeight - 2 * (parseFloat(elem.css('padding-top')) | 0));
    };

    switch (config.type) {
      case 2:
        setHeight('iframe');
        break;
      default:
        if (config.area[1] === '') {
          if (config.maxHeight > 0 && layero.outerHeight() > config.maxHeight) {
            area[1] = config.maxHeight;
            setHeight('.' + doms[5]);
          } else if (config.fixed && area[1] >= win.height()) {
            area[1] = win.height();
            setHeight('.' + doms[5]);
          }
        } else {
          setHeight('.' + doms[5]);
        }
        break;
    }
    ;

    return that;
  };

//计算坐标
  Class.pt.offset = function() {
    var that = this, config = that.config, layero = that.layero;
    var area = [layero.outerWidth(), layero.outerHeight()];
    var type = typeof config.offset === 'object';
    that.offsetTop = (win.height() - area[1]) / 2;
    that.offsetLeft = (win.width() - area[0]) / 2;

    if (type) {
      that.offsetTop = config.offset[0];
      that.offsetLeft = config.offset[1] || that.offsetLeft;
    } else if (config.offset !== 'auto') {

      if (config.offset === 't') { //上
        that.offsetTop = 0;
      } else if (config.offset === 'r') { //右
        that.offsetLeft = win.width() - area[0];
      } else if (config.offset === 'b') { //下
        that.offsetTop = win.height() - area[1];
      } else if (config.offset === 'l') { //左
        that.offsetLeft = 0;
      } else if (config.offset === 'lt') { //左上角
        that.offsetTop = 0;
        that.offsetLeft = 0;
      } else if (config.offset === 'lb') { //左下角
        that.offsetTop = win.height() - area[1];
        that.offsetLeft = 0;
      } else if (config.offset === 'rt') { //右上角
        that.offsetTop = 0;
        that.offsetLeft = win.width() - area[0];
      } else if (config.offset === 'rb') { //右下角
        that.offsetTop = win.height() - area[1];
        that.offsetLeft = win.width() - area[0];
      } else {
        that.offsetTop = config.offset;
      }

    }

    if (!config.fixed) {
      that.offsetTop = /%$/.test(that.offsetTop) ?
        win.height() * parseFloat(that.offsetTop) / 100
        : parseFloat(that.offsetTop);
      that.offsetLeft = /%$/.test(that.offsetLeft) ?
        win.width() * parseFloat(that.offsetLeft) / 100
        : parseFloat(that.offsetLeft);
      that.offsetTop += win.scrollTop();
      that.offsetLeft += win.scrollLeft();
    }

    if (layero.attr('minLeft')) {
      that.offsetTop = win.height() - (layero.find(doms[1]).outerHeight() || 0);
      that.offsetLeft = layero.css('left');
    }

    layero.css({ top: that.offsetTop, left: that.offsetLeft });
  };

//Tips
  Class.pt.tips = function() {
    var that = this, config = that.config, layero = that.layero;
    var layArea = [layero.outerWidth(), layero.outerHeight()], follow = $(config.follow);
    if (!follow[0]) follow = $('body');
    var goal = {
      width: follow.outerWidth(),
      height: follow.outerHeight(),
      top: follow.offset().top,
      left: follow.offset().left
    }, tipsG = layero.find('.layui-layer-TipsG');

    var guide = config.tips[0];
    config.tips[1] || tipsG.remove();

    goal.autoLeft = function() {
      if (goal.left + layArea[0] - win.width() > 0) {
        goal.tipLeft = goal.left + goal.width - layArea[0];
        tipsG.css({ right: 12, left: 'auto' });
      } else {
        goal.tipLeft = goal.left;
      }
      ;
    };

    //辨别tips的方位
    goal.where = [function() { //上
      goal.autoLeft();
      goal.tipTop = goal.top - layArea[1] - 10;
      tipsG.removeClass('layui-layer-TipsB').addClass('layui-layer-TipsT').css('border-right-color', config.tips[1]);
    }, function() { //右
      goal.tipLeft = goal.left + goal.width + 10;
      goal.tipTop = goal.top;
      tipsG.removeClass('layui-layer-TipsL').addClass('layui-layer-TipsR').css('border-bottom-color', config.tips[1]);
    }, function() { //下
      goal.autoLeft();
      goal.tipTop = goal.top + goal.height + 10;
      tipsG.removeClass('layui-layer-TipsT').addClass('layui-layer-TipsB').css('border-right-color', config.tips[1]);
    }, function() { //左
      goal.tipLeft = goal.left - layArea[0] - 10;
      goal.tipTop = goal.top;
      tipsG.removeClass('layui-layer-TipsR').addClass('layui-layer-TipsL').css('border-bottom-color', config.tips[1]);
    }];
    goal.where[guide - 1]();

    /* 8*2为小三角形占据的空间 */
    if (guide === 1) {
      goal.top - (win.scrollTop() + layArea[1] + 8 * 2) < 0 && goal.where[2]();
    } else if (guide === 2) {
      win.width() - (goal.left + goal.width + layArea[0] + 8 * 2) > 0 || goal.where[3]()
    } else if (guide === 3) {
      (goal.top - win.scrollTop() + goal.height + layArea[1] + 8 * 2) - win.height() > 0 && goal.where[0]();
    } else if (guide === 4) {
      layArea[0] + 8 * 2 - goal.left > 0 && goal.where[1]()
    }

    layero.find('.' + doms[5]).css({
      'background-color': config.tips[1],
      'padding-right': (config.closeBtn ? '30px' : '')
    });
    layero.css({
      left: goal.tipLeft - (config.fixed ? win.scrollLeft() : 0),
      top: goal.tipTop - (config.fixed ? win.scrollTop() : 0)
    });
  }

//拖拽层
  Class.pt.move = function() {
    var that = this
      , config = that.config
      , _DOC = $(document)
      , layero = that.layero
      , moveElem = layero.find(config.move)
      , resizeElem = layero.find('.layui-layer-resize')
      , dict = {};

    if (config.move) {
      moveElem.css('cursor', 'move');
    }

    moveElem.on('mousedown', function(e) {
      e.preventDefault();
      if (config.move) {
        dict.moveStart = true;
        dict.offset = [
          e.clientX - parseFloat(layero.css('left'))
          , e.clientY - parseFloat(layero.css('top'))
        ];
        ready.moveElem.css('cursor', 'move').show();
      }
    });

    resizeElem.on('mousedown', function(e) {
      e.preventDefault();
      dict.resizeStart = true;
      dict.offset = [e.clientX, e.clientY];
      dict.area = [
        layero.outerWidth()
        , layero.outerHeight()
      ];
      ready.moveElem.css('cursor', 'se-resize').show();
    });

    _DOC.on('mousemove', function(e) {

      //拖拽移动
      if (dict.moveStart) {
        var X = e.clientX - dict.offset[0]
          , Y = e.clientY - dict.offset[1]
          , fixed = layero.css('position') === 'fixed';

        e.preventDefault();

        dict.stX = fixed ? 0 : win.scrollLeft();
        dict.stY = fixed ? 0 : win.scrollTop();

        //控制元素不被拖出窗口外
        if (!config.moveOut) {
          var setRig = win.width() - layero.outerWidth() + dict.stX
            , setBot = win.height() - layero.outerHeight() + dict.stY;
          X < dict.stX && (X = dict.stX);
          X > setRig && (X = setRig);
          Y < dict.stY && (Y = dict.stY);
          Y > setBot && (Y = setBot);
        }

        layero.css({
          left: X
          , top: Y
        });
      }

      //Resize
      if (config.resize && dict.resizeStart) {
        var X = e.clientX - dict.offset[0]
          , Y = e.clientY - dict.offset[1];

        e.preventDefault();

        layer.style(that.index, {
          width: dict.area[0] + X
          , height: dict.area[1] + Y
        })
        dict.isResize = true;
        config.resizing && config.resizing(layero);
      }
    }).on('mouseup', function(e) {
      if (dict.moveStart) {
        delete dict.moveStart;
        ready.moveElem.hide();
        config.moveEnd && config.moveEnd(layero);
      }
      if (dict.resizeStart) {
        delete dict.resizeStart;
        ready.moveElem.hide();
      }
    });

    return that;
  };

  Class.pt.callback = function() {
    var that = this, layero = that.layero, config = that.config;
    that.openLayer();
    if (config.success) {
      if (config.type == 2) {
        layero.find('iframe').on('load', function() {
          config.success(layero, that.index);
        });
      } else {
        config.success(layero, that.index);
      }
    }
    layer.ie == 6 && that.IE6(layero);

    //按钮
    layero.find('.' + doms[6]).children('a').on('click', function() {
      var index = $(this).index();
      if (index === 0) {
        if (config.yes) {
          config.yes(that.index, layero)
        } else if (config['btn1']) {
          config['btn1'](that.index, layero)
        } else {
          layer.close(that.index);
        }
      } else {
        var close = config['btn' + (index + 1)] && config['btn' + (index + 1)](that.index, layero);
        close === false || layer.close(that.index);
      }
    });

    //取消
    function cancel() {
      var close = config.cancel && config.cancel(that.index, layero);
      close === false || layer.close(that.index);
    }

    //右上角关闭回调
    layero.find('.' + doms[7]).on('click', cancel);

    //点遮罩关闭
    if (config.shadeClose) {
      that.shadeo.on('click', function() {
        layer.close(that.index);
      });
    }

    //最小化
    layero.find('.layui-layer-min').on('click', function() {
      var min = config.min && config.min(layero, that.index);
      min === false || layer.min(that.index, config);
    });

    //全屏/还原
    layero.find('.layui-layer-max').on('click', function() {
      if ($(this).hasClass('layui-layer-maxmin')) {
        layer.restore(that.index);
        config.restore && config.restore(layero, that.index);
      } else {
        layer.full(that.index, config);
        setTimeout(function() {
          config.full && config.full(layero, that.index);
        }, 100);
      }
    });

    config.end && (ready.end[that.index] = config.end);
  };

//for ie6 恢复select
  ready.reselect = function() {
    $.each($('select'), function(index, value) {
      var sthis = $(this);
      if (!sthis.parents('.' + doms[0])[0]) {
        (sthis.attr('layer') == 1 && $('.' + doms[0]).length < 1) && sthis.removeAttr('layer').show();
      }
      sthis = null;
    });
  };

  Class.pt.IE6 = function(layero) {
    //隐藏select
    $('select').each(function(index, value) {
      var sthis = $(this);
      if (!sthis.parents('.' + doms[0])[0]) {
        sthis.css('display') === 'none' || sthis.attr({ 'layer': '1' }).hide();
      }
      sthis = null;
    });
  };

//需依赖原型的对外方法
  Class.pt.openLayer = function() {
    var that = this;

    //置顶当前窗口
    layer.zIndex = that.config.zIndex;
    layer.setTop = function(layero) {
      var setZindex = function() {
        layer.zIndex++;
        layero.css('z-index', layer.zIndex + 1);
      };
      layer.zIndex = parseInt(layero[0].style.zIndex);
      layero.on('mousedown', setZindex);
      return layer.zIndex;
    };
  };

//记录宽高坐标，用于还原
  ready.record = function(layero) {
    var area = [
      layero.width(),
      layero.height(),
      layero.position().top,
      layero.position().left + parseFloat(layero.css('margin-left'))
    ];
    layero.find('.layui-layer-max').addClass('layui-layer-maxmin');
    layero.attr({ area: area });
  };

  ready.rescollbar = function(index) {
    if (doms.html.attr('layer-full') == index) {
      if (doms.html[0].style.removeProperty) {
        doms.html[0].style.removeProperty('overflow');
      } else {
        doms.html[0].style.removeAttribute('overflow');
      }
      doms.html.removeAttr('layer-full');
    }
  };

  /** 内置成员 */

  window.layer = layer;

//获取子iframe的DOM
  layer.getChildFrame = function(selector, index) {
    index = index || $('.' + doms[4]).attr('times');
    return $('#' + doms[0] + index).find('iframe').contents().find(selector);
  };

//得到当前iframe层的索引，子iframe时使用
  layer.getFrameIndex = function(name) {
    return $('#' + name).parents('.' + doms[4]).attr('times');
  };

//iframe层自适应宽高
  layer.iframeAuto = function(index) {
    if (!index) return;
    var heg = layer.getChildFrame('html', index).outerHeight();
    var layero = $('#' + doms[0] + index);
    var titHeight = layero.find(doms[1]).outerHeight() || 0;
    var btnHeight = layero.find('.' + doms[6]).outerHeight() || 0;
    layero.css({ height: heg + titHeight + btnHeight });
    layero.find('iframe').css({ height: heg });
  };

//重置iframe url
  layer.iframeSrc = function(index, url) {
    $('#' + doms[0] + index).find('iframe').attr('src', url);
  };

//设定层的样式
  layer.style = function(index, options, limit) {
    var layero = $('#' + doms[0] + index)
      , contElem = layero.find('.layui-layer-content')
      , type = layero.attr('type')
      , titHeight = layero.find(doms[1]).outerHeight() || 0
      , btnHeight = layero.find('.' + doms[6]).outerHeight() || 0
      , minLeft = layero.attr('minLeft');

    if (type === ready.type[3] || type === ready.type[4]) {
      return;
    }

    if (!limit) {
      if (parseFloat(options.width) <= 260) {
        options.width = 260;
      }
      ;

      if (parseFloat(options.height) - titHeight - btnHeight <= 64) {
        options.height = 64 + titHeight + btnHeight;
      }
      ;
    }

    layero.css(options);
    btnHeight = layero.find('.' + doms[6]).outerHeight();

    if (type === ready.type[2]) {
      layero.find('iframe').css({
        height: parseFloat(options.height) - titHeight - btnHeight
      });
    } else {
      contElem.css({
        height: parseFloat(options.height) - titHeight - btnHeight
          - parseFloat(contElem.css('padding-top'))
          - parseFloat(contElem.css('padding-bottom'))
      })
    }
  };

//最小化
  layer.min = function(index, options) {
    options = options || {};
    var layero = $('#' + doms[0] + index)
      , shadeo = $('#' + doms.SHADE + index)
      , titHeight = layero.find(doms[1]).outerHeight() || 0
      , left = layero.attr('minLeft') || (181 * ready.minIndex) + 'px'
      , position = layero.css('position')
      , settings = {
      width: 180
      , height: titHeight
      , position: 'fixed'
      , overflow: 'hidden'
    };

    //记录宽高坐标，用于还原
    ready.record(layero);

    if (ready.minLeft[0]) {
      left = ready.minLeft[0];
      ready.minLeft.shift();
    }

    //是否堆叠在左下角
    if (options.minStack) {
      settings.left = left;
      settings.top = win.height() - titHeight;
      layero.attr('minLeft') || ready.minIndex++; //初次执行，最小化操作索引自增
      layero.attr('minLeft', left);
    }

    layero.attr('position', position);
    layer.style(index, settings, true);

    layero.find('.layui-layer-min').hide();
    layero.attr('type') === 'page' && layero.find(doms[4]).hide();
    ready.rescollbar(index);

    //隐藏遮罩
    shadeo.hide();
  };

//还原
  layer.restore = function(index) {
    var layero = $('#' + doms[0] + index)
      , shadeo = $('#' + doms.SHADE + index)
      , area = layero.attr('area').split(',')
      , type = layero.attr('type');

    //恢复原来尺寸
    layer.style(index, {
      width: parseFloat(area[0]),
      height: parseFloat(area[1]),
      top: parseFloat(area[2]),
      left: parseFloat(area[3]),
      position: layero.attr('position'),
      overflow: 'visible'
    }, true);

    layero.find('.layui-layer-max').removeClass('layui-layer-maxmin');
    layero.find('.layui-layer-min').show();
    layero.attr('type') === 'page' && layero.find(doms[4]).show();
    ready.rescollbar(index);

    //恢复遮罩
    shadeo.show();
  };

//全屏
  layer.full = function(index) {
    var layero = $('#' + doms[0] + index), timer;
    ready.record(layero);
    if (!doms.html.attr('layer-full')) {
      doms.html.css('overflow', 'hidden').attr('layer-full', index);
    }
    clearTimeout(timer);
    timer = setTimeout(function() {
      var isfix = layero.css('position') === 'fixed';
      layer.style(index, {
        top: isfix ? 0 : win.scrollTop(),
        left: isfix ? 0 : win.scrollLeft(),
        width: win.width(),
        height: win.height()
      }, true);
      layero.find('.layui-layer-min').hide();
    }, 100);
  };

//改变title
  layer.title = function(name, index) {
    var title = $('#' + doms[0] + (index || layer.index)).find(doms[1]);
    title.html(name);
  };

//关闭layer总方法
  layer.close = function(index, callback) {
    var layero = $('#' + doms[0] + index), type = layero.attr('type'), closeAnim = 'layer-anim-close';
    if (!layero[0]) return;
    var WRAP = 'layui-layer-wrap', remove = function() {
      if (type === ready.type[1] && layero.attr('conType') === 'object') {
        layero.children(':not(.' + doms[5] + ')').remove();
        var wrap = layero.find('.' + WRAP);
        for (var i = 0; i < 2; i++) {
          wrap.unwrap();
        }
        wrap.css('display', wrap.data('display')).removeClass(WRAP);
      } else {
        //低版本IE 回收 iframe
        if (type === ready.type[2]) {
          try {
            var iframe = $('#' + doms[4] + index)[0];
            iframe.contentWindow.document.write('');
            iframe.contentWindow.close();
            layero.find('.' + doms[5])[0].removeChild(iframe);
          } catch (e) {
          }
        }
        layero[0].innerHTML = '';
        layero.remove();
      }
      typeof ready.end[index] === 'function' && ready.end[index]();
      delete ready.end[index];
      typeof callback === 'function' && callback();
    };

    if (layero.data('isOutAnim')) {
      layero.addClass('layer-anim ' + closeAnim);
    }

    $('#layui-layer-moves, #' + doms.SHADE + index).remove();
    layer.ie == 6 && ready.reselect();
    ready.rescollbar(index);
    if (layero.attr('minLeft')) {
      ready.minIndex--;
      ready.minLeft.push(layero.attr('minLeft'));
    }

    if ((layer.ie && layer.ie < 10) || !layero.data('isOutAnim')) {
      remove()
    } else {
      setTimeout(function() {
        remove();
      }, 200);
    }
  };

//关闭所有层
  layer.closeAll = function(type, callback) {
    if (typeof type === 'function') {
      callback = type;
      type = null;
    }
    ;
    var domsElem = $('.' + doms[0]);
    $.each(domsElem, function(_index) {
      var othis = $(this);
      var is = type ? (othis.attr('type') === type) : 1;
      is && layer.close(othis.attr('times'), _index === domsElem.length - 1 ? callback : null);
      is = null;
    });
    if (domsElem.length === 0) typeof callback === 'function' && callback();
  };

  /**

   拓展模块，layui 开始合并在一起

   */

  var cache = layer.cache || {}, skin = function(type) {
    return (cache.skin ? (' ' + cache.skin + ' ' + cache.skin + '-' + type) : '');
  };

//仿系统prompt
  layer.prompt = function(options, yes) {
    var style = '';
    options = options || {};

    if (typeof options === 'function') yes = options;

    if (options.area) {
      var area = options.area;
      style = 'style="width: ' + area[0] + '; height: ' + area[1] + ';"';
      delete options.area;
    }
    var prompt,
      content = options.formType == 2 ? '<textarea class="layui-layer-input"' + style + '></textarea>' : function() {
        return '<input type="' + (options.formType == 1 ? 'password' : 'text') + '" class="layui-layer-input">';
      }();

    var success = options.success;
    delete options.success;

    return layer.open($.extend({
      type: 1
      , btn: ['&#x786E;&#x5B9A;', '&#x53D6;&#x6D88;']
      , content: content
      , skin: 'layui-layer-prompt' + skin('prompt')
      , maxWidth: win.width()
      , success: function(layero) {
        prompt = layero.find('.layui-layer-input');
        prompt.val(options.value || '').focus();
        typeof success === 'function' && success(layero);
      }
      , resize: false
      , yes: function(index) {
        var value = prompt.val();
        if (value === '') {
          prompt.focus();
        } else if (value.length > (options.maxlength || 500)) {
          layer.tips('&#x6700;&#x591A;&#x8F93;&#x5165;' + (options.maxlength || 500) + '&#x4E2A;&#x5B57;&#x6570;', prompt, { tips: 1 });
        } else {
          yes && yes(value, index, prompt);
        }
      }
    }, options));
  };

//tab层
  layer.tab = function(options) {
    options = options || {};

    var tab = options.tab || {}
      , THIS = 'layui-this'
      , success = options.success;

    delete options.success;

    return layer.open($.extend({
      type: 1,
      skin: 'layui-layer-tab' + skin('tab'),
      resize: false,
      title: function() {
        var len = tab.length, ii = 1, str = '';
        if (len > 0) {
          str = '<span class="' + THIS + '">' + tab[0].title + '</span>';
          for (; ii < len; ii++) {
            str += '<span>' + tab[ii].title + '</span>';
          }
        }
        return str;
      }(),
      content: '<ul class="layui-layer-tabmain">' + function() {
        var len = tab.length, ii = 1, str = '';
        if (len > 0) {
          str = '<li class="layui-layer-tabli ' + THIS + '">' + (tab[0].content || 'no content') + '</li>';
          for (; ii < len; ii++) {
            str += '<li class="layui-layer-tabli">' + (tab[ii].content || 'no  content') + '</li>';
          }
        }
        return str;
      }() + '</ul>',
      success: function(layero) {
        var btn = layero.find('.layui-layer-title').children();
        var main = layero.find('.layui-layer-tabmain').children();
        btn.on('mousedown', function(e) {
          e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
          var othis = $(this), index = othis.index();
          othis.addClass(THIS).siblings().removeClass(THIS);
          main.eq(index).show().siblings().hide();
          typeof options.change === 'function' && options.change(index);
        });
        typeof success === 'function' && success(layero);
      }
    }, options));
  };

//相册层
  layer.photos = function(options, loop, key) {
    var dict = {};
    options = options || {};
    if (!options.photos) return;

    //若 photos 并非选择器或 jQuery 对象，则为普通 object
    var isObject = !(typeof options.photos === 'string' || options.photos instanceof $)
      , photos = isObject ? options.photos : {}
      , data = photos.data || []
      , start = photos.start || 0;

    dict.imgIndex = (start | 0) + 1;
    options.img = options.img || 'img';

    var success = options.success;
    delete options.success;

    //如果 options.photos 不是一个对象
    if (!isObject) { //页面直接获取
      var parent = $(options.photos), pushData = function() {
        data = [];
        parent.find(options.img).each(function(index) {
          var othis = $(this);
          othis.attr('layer-index', index);
          data.push({
            alt: othis.attr('alt'),
            pid: othis.attr('layer-pid'),
            src: othis.attr('layer-src') || othis.attr('src'),
            thumb: othis.attr('src')
          });
        });
      };

      pushData();

      if (data.length === 0) return;

      loop || parent.on('click', options.img, function() {
        pushData();
        var othis = $(this), index = othis.attr('layer-index');
        layer.photos($.extend(options, {
          photos: {
            start: index,
            data: data,
            tab: options.tab
          },
          full: options.full
        }), true);
      });

      //不直接弹出
      if (!loop) return;

    } else if (data.length === 0) {
      return layer.msg('&#x6CA1;&#x6709;&#x56FE;&#x7247;');
    }

    //上一张
    dict.imgprev = function(key) {
      dict.imgIndex--;
      if (dict.imgIndex < 1) {
        dict.imgIndex = data.length;
      }
      dict.tabimg(key);
    };

    //下一张
    dict.imgnext = function(key, errorMsg) {
      dict.imgIndex++;
      if (dict.imgIndex > data.length) {
        dict.imgIndex = 1;
        if (errorMsg) {
          return
        }
        ;
      }
      dict.tabimg(key)
    };

    //方向键
    dict.keyup = function(event) {
      if (!dict.end) {
        var code = event.keyCode;
        event.preventDefault();
        if (code === 37) {
          dict.imgprev(true);
        } else if (code === 39) {
          dict.imgnext(true);
        } else if (code === 27) {
          layer.close(dict.index);
        }
      }
    }

    //切换
    dict.tabimg = function(key) {
      if (data.length <= 1) return;
      photos.start = dict.imgIndex - 1;
      layer.close(dict.index);
      return layer.photos(options, true, key);
      setTimeout(function() {
        layer.photos(options, true, key);
      }, 200);
    }

    //一些动作
    dict.event = function() {
      /*
      dict.bigimg.hover(function(){
        dict.imgsee.show();
      }, function(){
        dict.imgsee.hide();
      });
      */

      dict.bigimg.find('.layui-layer-imgprev').on('click', function(event) {
        event.preventDefault();
        dict.imgprev(true);
      });

      dict.bigimg.find('.layui-layer-imgnext').on('click', function(event) {
        event.preventDefault();
        dict.imgnext(true);
      });

      $(document).on('keyup', dict.keyup);
    };

    //图片预加载
    function loadImage(url, callback, error) {
      var img = new Image();
      img.src = url;
      if (img.complete) {
        return callback(img);
      }
      img.onload = function() {
        img.onload = null;
        callback(img);
      };
      img.onerror = function(e) {
        img.onerror = null;
        error(e);
      };
    };

    dict.loadi = layer.load(1, {
      shade: 'shade' in options ? false : 0.9,
      scrollbar: false
    });

    loadImage(data[start].src, function(img) {
      layer.close(dict.loadi);

      //切换图片时不出现动画
      if (key) options.anim = -1;

      //弹出图片层
      dict.index = layer.open($.extend({
        type: 1,
        id: 'layui-layer-photos',
        area: function() {
          var imgarea = [img.width, img.height];
          var winarea = [$(window).width() - 100, $(window).height() - 100];

          //如果 实际图片的宽或者高比 屏幕大（那么进行缩放）
          if (!options.full && (imgarea[0] > winarea[0] || imgarea[1] > winarea[1])) {
            var wh = [imgarea[0] / winarea[0], imgarea[1] / winarea[1]];//取宽度缩放比例、高度缩放比例
            if (wh[0] > wh[1]) {//取缩放比例最大的进行缩放
              imgarea[0] = imgarea[0] / wh[0];
              imgarea[1] = imgarea[1] / wh[0];
            } else if (wh[0] < wh[1]) {
              imgarea[0] = imgarea[0] / wh[1];
              imgarea[1] = imgarea[1] / wh[1];
            }
          }

          return [imgarea[0] + 'px', imgarea[1] + 'px'];
        }(),
        title: false,
        shade: 0.9,
        shadeClose: true,
        closeBtn: false,
        move: '.layui-layer-phimg img',
        moveType: 1,
        scrollbar: false,
        moveOut: true,
        anim: 5,
        isOutAnim: false,
        skin: 'layui-layer-photos' + skin('photos'),
        content: '<div class="layui-layer-phimg">'
          + '<img src="' + data[start].src + '" alt="' + (data[start].alt || '') + '" layer-pid="' + data[start].pid + '">'
          + function() {
            if (data.length > 1) {
              return '<div class="layui-layer-imgsee">'
                + '<span class="layui-layer-imguide"><a href="javascript:;" class="layui-layer-iconext layui-layer-imgprev"></a><a href="javascript:;" class="layui-layer-iconext layui-layer-imgnext"></a></span>'
                + '<div class="layui-layer-imgbar" style="display:' + (key ? 'block' : '') + '"><span class="layui-layer-imgtit"><a href="javascript:;">' + (data[start].alt || '') + '</a><em>' + dict.imgIndex + ' / ' + data.length + '</em></span></div>'
                + '</div>'
            }
            return '';
          }()
          + '</div>',
        success: function(layero, index) {
          dict.bigimg = layero.find('.layui-layer-phimg');
          dict.imgsee = layero.find('.layui-layer-imgbar');
          dict.event(layero);
          options.tab && options.tab(data[start], layero);
          typeof success === 'function' && success(layero);
        }, end: function() {
          dict.end = true;
          $(document).off('keyup', dict.keyup);
        }
      }, options));
    }, function() {
      layer.close(dict.loadi);
      layer.msg('&#x5F53;&#x524D;&#x56FE;&#x7247;&#x5730;&#x5740;&#x5F02;&#x5E38;<br>&#x662F;&#x5426;&#x7EE7;&#x7EED;&#x67E5;&#x770B;&#x4E0B;&#x4E00;&#x5F20;&#xFF1F;', {
        time: 30000,
        btn: ['&#x4E0B;&#x4E00;&#x5F20;', '&#x4E0D;&#x770B;&#x4E86;'],
        yes: function() {
          data.length > 1 && dict.imgnext(true, true);
        }
      });
    });
  };

//主入口
  ready.run = function(_$) {
    $ = _$;
    win = $(window);
    doms.html = $('html');
    layer.open = function(deliver) {
      var o = new Class(deliver);
      return o.index;
    };
  };

//加载方式
  window.layui && layui.define ? (
    layer.ready()
      , layui.define('jquery', function(exports) { //layui 加载
      layer.path = layui.cache.dir;
      ready.run(layui.$);

      //暴露模块
      window.layer = layer;
      exports('layer', layer);
    })
  ) : (
    (typeof define === 'function' && define.amd) ? define(['jquery'], function() { //requirejs 加载
      ready.run(window.jQuery);
      return layer;
    }) : function() { //普通 script 标签加载
      layer.ready();
      ready.run(window.jQuery);
    }()
  );

}(window);

var style=document.createElement("style");
var theHead=document.head||document.getElementsByTagName('head')[0];
style.appendChild(document.createTextNode('html #layuicss-layer{display:none;position:absolute;width:1989px}.layui-layer-shade,.layui-layer{position:fixed;_position:absolute;pointer-events:auto}.layui-layer-shade{top:0;left:0;width:100%;height:100%;_height:expression(document.body.offsetHeight+"px")}.layui-layer{-webkit-overflow-scrolling:touch}.layui-layer{top:150px;left:0;margin:0;padding:0;background-color:#fff;-webkit-background-clip:content;border-radius:2px;box-shadow:1px 1px 50px rgba(0,0,0,.3)}.layui-layer-close{position:absolute}.layui-layer-content{position:relative}.layui-layer-border{border:1px solid #b2b2b2;border:1px solid rgba(0,0,0,.1);box-shadow:1px 1px 5px rgba(0,0,0,.2)}.layui-layer-load{background:url(data:image/gif;base64,R0lGODlhJQAlAJECAL3L2AYrTv///wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgACACwAAAAAJQAlAAACi5SPqcvtDyGYIFpF690i8xUw3qJBwUlSadmcLqYmGQu6KDIeM13beGzYWWy3DlB4IYaMk+Dso2RWkFCfLPcRvFbZxFLUDTt21BW56TyjRep1e20+i+eYMR145W2eefj+6VFmgTQi+ECVY8iGxcg35phGo/iDFwlTyXWphwlm1imGRdcnuqhHeop6UAAAIfkEBQoAAgAsEAACAAQACwAAAgWMj6nLXAAh+QQFCgACACwVAAUACgALAAACFZQvgRi92dyJcVJlLobUdi8x4bIhBQAh+QQFCgACACwXABEADAADAAACBYyPqcsFACH5BAUKAAIALBUAFQAKAAsAAAITlGKZwWoMHYxqtmplxlNT7ixGAQAh+QQFCgACACwQABgABAALAAACBYyPqctcACH5BAUKAAIALAUAFQAKAAsAAAIVlC+BGL3Z3IlxUmUuhtR2LzHhsiEFACH5BAUKAAIALAEAEQAMAAMAAAIFjI+pywUAIfkEBQoAAgAsBQAFAAoACwAAAhOUYJnAagwdjGq2amXGU1PuLEYBACH5BAUKAAIALBAAAgAEAAsAAAIFhI+py1wAIfkEBQoAAgAsFQAFAAoACwAAAhWUL4AIvdnciXFSZS6G1HYvMeGyIQUAIfkEBQoAAgAsFwARAAwAAwAAAgWEj6nLBQAh+QQFCgACACwVABUACgALAAACE5RgmcBqDB2MarZqZcZTU+4sRgEAIfkEBQoAAgAsEAAYAAQACwAAAgWEj6nLXAAh+QQFCgACACwFABUACgALAAACFZQvgAi92dyJcVJlLobUdi8x4bIhBQAh+QQFCgACACwBABEADAADAAACBYSPqcsFADs=) #eee center center no-repeat}.layui-layer-ico{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANIAAAA9CAMAAADvVccnAAAC8VBMVEUAAABUqeQmJTQjIzNUqeQsKzr9/v7+/v5TqeEsKzooKDM9ZJRVqeMlJDRUqeQlJDX+/v7////////////////////+/v4kJDT+/v5UquMlJTT///9VquQlJDT+/v7+/v5UqeT+/v4rKjpVqeQlJTVVqeT+/v7+/v7+/v7+/v7+/v7////+/v7+/v4lIzX+/v7///9TqORUqeRUqeMoJTb+/v7+/v7+/v7+/v7+/v5UquQlJDUhIS7///93d3cuje1VquQmJTXoVEXzmxL0xQAAupsRzW3//v3nSzv97uyRkZHsb2OMjIzraVuurq7s9P3t+/aGhobpWkv86Ob74d4pxqynp6f98vA1ke7++ua7u7vi4uLNzc1x4qh8fHz53mfy8vLX9+fb29to18T3wr32urR75K70rabyoJgYz3PteGz1rz/o+vHx8fHo6Oim6N0yya/0qaH54HHqYVP5/f3m+fb19fVQoPDU9O/+9+v74+D99tSJ57ezs7PzpJzxk4otLDuA3s/ym5I41ob4yXvvgnftdGf1yQv+++3+9eX98NvHx8f1ta760ZF5eXn2zR73vrhO2pP65oxA14os03/20Cr//Pnh+e3+9+CW5NfBwcGU6b4NvqD76Z2amprxmZDoUkL20jL++Pf98O7u7u7K8erO9eGc5dnQ0ND99MoIvJ70nxn+9fT62tat78750s5Ezrb1sav87KfwjIL3tlHg9/P63NmL4NL61dH96s6j7MilpaWdnZ376JbynJP31ULO5PvI4fqCu/RGmu/86uj97tdw2cj5zcj73awewqf62aShoaH6153xlYz5zYf54n7vh3z4w3L0py6WxvZzs/TQ8+1y2smd68P88Lr4xHT1+/q42PhmrPLH9N2WlpaKior65IT1qzfL4/tcp/H97tZW3JiBgYHe7Pumz/e68dYh0Xf421342E7Z9fD4w3HT5/uNwfXq6urB7+in7coYwaVm36LufHGh68X88sNc1L/3v2dQq8i/AAAAPXRSTlMAz88uL3f+mxeAFwff37e3rkQ8M/IfSUPu5+fAjY2IgUEp+56eKOjixpN+eHJfVVQSeFhIH8OQjYR7aGgUvP+afAAADRVJREFUaN7cmFlT01AUgHniX6UPaZqmLe1A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) no-repeat}.layui-layer-dialog .layui-layer-ico,.layui-layer-setwin a,.layui-layer-btn a{display:inline-block;*display:inline;*zoom:1;vertical-align:top}.layui-layer-move{display:none;position:fixed;*position:absolute;left:0;top:0;width:100%;height:100%;cursor:move;opacity:0;filter:alpha(opacity=0);background-color:#fff;z-index:2147483647}.layui-layer-resize{position:absolute;width:15px;height:15px;right:0;bottom:0;cursor:se-resize}.layer-anim{-webkit-animation-fill-mode:both;animation-fill-mode:both;-webkit-animation-duration:.3s;animation-duration:.3s}@-webkit-keyframes layer-bounceIn{0{opacity:0;-webkit-transform:scale(.5);transform:scale(.5)}100%{opacity:1;-webkit-transform:scale(1);transform:scale(1)}}@keyframes layer-bounceIn{0{opacity:0;-webkit-transform:scale(.5);-ms-transform:scale(.5);transform:scale(.5)}100%{opacity:1;-webkit-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}}.layer-anim-00{-webkit-animation-name:layer-bounceIn;animation-name:layer-bounceIn}@-webkit-keyframes layer-zoomInDown{0{opacity:0;-webkit-transform:scale(.1) translateY(-2000px);transform:scale(.1) translateY(-2000px);-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}60%{opacity:1;-webkit-transform:scale(.475) translateY(60px);transform:scale(.475) translateY(60px);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}}@keyframes layer-zoomInDown{0{opacity:0;-webkit-transform:scale(.1) translateY(-2000px);-ms-transform:scale(.1) translateY(-2000px);transform:scale(.1) translateY(-2000px);-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}60%{opacity:1;-webkit-transform:scale(.475) translateY(60px);-ms-transform:scale(.475) translateY(60px);transform:scale(.475) translateY(60px);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}}.layer-anim-01{-webkit-animation-name:layer-zoomInDown;animation-name:layer-zoomInDown}@-webkit-keyframes layer-fadeInUpBig{0{opacity:0;-webkit-transform:translateY(2000px);transform:translateY(2000px)}100%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes layer-fadeInUpBig{0{opacity:0;-webkit-transform:translateY(2000px);-ms-transform:translateY(2000px);transform:translateY(2000px)}100%{opacity:1;-webkit-transform:translateY(0);-ms-transform:translateY(0);transform:translateY(0)}}.layer-anim-02{-webkit-animation-name:layer-fadeInUpBig;animation-name:layer-fadeInUpBig}@-webkit-keyframes layer-zoomInLeft{0{opacity:0;-webkit-transform:scale(.1) translateX(-2000px);transform:scale(.1) translateX(-2000px);-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}60%{opacity:1;-webkit-transform:scale(.475) translateX(48px);transform:scale(.475) translateX(48px);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}}@keyframes layer-zoomInLeft{0{opacity:0;-webkit-transform:scale(.1) translateX(-2000px);-ms-transform:scale(.1) translateX(-2000px);transform:scale(.1) translateX(-2000px);-webkit-animation-timing-function:ease-in-out;animation-timing-function:ease-in-out}60%{opacity:1;-webkit-transform:scale(.475) translateX(48px);-ms-transform:scale(.475) translateX(48px);transform:scale(.475) translateX(48px);-webkit-animation-timing-function:ease-out;animation-timing-function:ease-out}}.layer-anim-03{-webkit-animation-name:layer-zoomInLeft;animation-name:layer-zoomInLeft}@-webkit-keyframes layer-rollIn{0{opacity:0;-webkit-transform:translateX(-100%) rotate(-120deg);transform:translateX(-100%) rotate(-120deg)}100%{opacity:1;-webkit-transform:translateX(0) rotate(0);transform:translateX(0) rotate(0)}}@keyframes layer-rollIn{0{opacity:0;-webkit-transform:translateX(-100%) rotate(-120deg);-ms-transform:translateX(-100%) rotate(-120deg);transform:translateX(-100%) rotate(-120deg)}100%{opacity:1;-webkit-transform:translateX(0) rotate(0);-ms-transform:translateX(0) rotate(0);transform:translateX(0) rotate(0)}}.layer-anim-04{-webkit-animation-name:layer-rollIn;animation-name:layer-rollIn}@keyframes layer-fadeIn{0{opacity:0}100%{opacity:1}}.layer-anim-05{-webkit-animation-name:layer-fadeIn;animation-name:layer-fadeIn}@-webkit-keyframes layer-shake{0,100%{-webkit-transform:translateX(0);transform:translateX(0)}10%,30%,50%,70%,90%{-webkit-transform:translateX(-10px);transform:translateX(-10px)}20%,40%,60%,80%{-webkit-transform:translateX(10px);transform:translateX(10px)}}@keyframes layer-shake{0,100%{-webkit-transform:translateX(0);-ms-transform:translateX(0);transform:translateX(0)}10%,30%,50%,70%,90%{-webkit-transform:translateX(-10px);-ms-transform:translateX(-10px);transform:translateX(-10px)}20%,40%,60%,80%{-webkit-transform:translateX(10px);-ms-transform:translateX(10px);transform:translateX(10px)}}.layer-anim-06{-webkit-animation-name:layer-shake;animation-name:layer-shake}@-webkit-keyframes fadeIn{0{opacity:0}100%{opacity:1}}.layui-layer-title{padding:0 80px 0 20px;height:50px;line-height:50px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-radius:2px 2px 0 0}.layui-layer-setwin{position:absolute;right:15px;*right:0;top:17px;font-size:0;line-height:initial}.layui-layer-setwin a{position:relative;width:16px;height:16px;margin-left:10px;font-size:12px;_overflow:hidden}.layui-layer-setwin .layui-layer-min cite{position:absolute;width:14px;height:2px;left:0;top:50%;margin-top:-1px;background-color:#2e2d3c;cursor:pointer;_overflow:hidden}.layui-layer-setwin .layui-layer-min:hover cite{background-color:#2d93ca}.layui-layer-setwin .layui-layer-max{background-position:-32px -40px}.layui-layer-setwin .layui-layer-max:hover{background-position:-16px -40px}.layui-layer-setwin .layui-layer-maxmin{background-position:-65px -40px}.layui-layer-setwin .layui-layer-maxmin:hover{background-position:-49px -40px}.layui-layer-setwin .layui-layer-close1{background-position:1px -40px;cursor:pointer}.layui-layer-setwin .layui-layer-close1:hover{opacity:.7}.layui-layer-setwin .layui-layer-close2{position:absolute;right:-28px;top:-28px;width:30px;height:30px;margin-left:0;background-position:-149px -31px;*right:-18px;_display:none}.layui-layer-setwin .layui-layer-close2:hover{background-position:-180px -31px}.layui-layer-btn{text-align:right;padding:0 15px 12px;pointer-events:auto;user-select:none;-webkit-user-select:none}.layui-layer-btn a{height:28px;line-height:28px;margin:5px 5px 0;padding:0 15px;border:1px solid #dedede;background-color:#fff;color:#333;border-radius:2px;font-weight:400;cursor:pointer;text-decoration:none}.layui-layer-btn a:hover{opacity:.9;text-decoration:none}.layui-layer-btn a:active{opacity:.8}.layui-layer-btn .layui-layer-btn0{border-color:#1e9fff;background-color:#1e9fff;color:#fff}.layui-layer-btn-l{text-align:left}.layui-layer-btn-c{text-align:center}.layui-layer-dialog{min-width:300px}.layui-layer-dialog .layui-layer-content{position:relative;padding:20px;line-height:24px;word-break:break-all;overflow:hidden;font-size:14px;overflow-x:hidden;overflow-y:auto}.layui-layer-dialog .layui-layer-content .layui-layer-ico{position:absolute;top:16px;left:15px;_left:-40px;width:30px;height:30px}.layui-layer-ico1{background-position:-30px 0}.layui-layer-ico2{background-position:-60px 0}.layui-layer-ico3{background-position:-90px 0}.layui-layer-ico4{background-position:-120px 0}.layui-layer-ico5{background-position:-150px 0}.layui-layer-ico6{background-position:-180px 0}.layui-layer-rim{border:6px solid #8d8d8d;border:6px solid rgba(0,0,0,.3);border-radius:5px;box-shadow:none}.layui-layer-msg{min-width:180px;border:1px solid #d3d4d3;box-shadow:none}.layui-layer-hui{min-width:100px;background-color:#000;filter:alpha(opacity=60);background-color:rgba(0,0,0,0.6);color:#fff;border:0}.layui-layer-hui .layui-layer-content{padding:12px 25px;text-align:center}.layui-layer-dialog .layui-layer-padding{padding:20px 20px 20px 55px;text-align:left}.layui-layer-page .layui-layer-content{position:relative;overflow:auto}.layui-layer-page .layui-layer-btn,.layui-layer-iframe .layui-layer-btn{padding-top:10px}.layui-layer-nobg{background:0}.layui-layer-iframe iframe{display:block;width:100%}.layui-layer-loading{border-radius:100%;background:0;box-shadow:none;border:0}.layui-layer-loading .layui-layer-content{width:60px;height:24px;background:url(data:image/gif;base64,R0lGODlhPAAYALMPAPPJp/HYxfSwkf50Df5TD/+HAPe5bvqHR/twOviZavyrMu/m3f9EAP9mAP+ZAO7u7iH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcFJpZ2h0czpNYXJrZWQ9IkZhbHNlIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6QUNDRERBRjMxRTIwNjgxMTg4QzZERjVGQ0I0MDI1NDkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTlDMEI5MzU5RTY2MTFFMTkxRDY5NkVCMDBGOTBFRUYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTlDMEI5MzQ5RTY2MTFFMTkxRDY5NkVCMDBGOTBFRUYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpENzU2N0YwMTMyMjA2ODExODhDNkRGNUZDQjQwMjU0OSIgc3RS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) no-repeat}.layui-layer-loading .layui-layer-loading1{width:37px;height:37px;background:url(data:image/gif;base64,R0lGODlhJQAlAJECAL3L2AYrTv///wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgACACwAAAAAJQAlAAACi5SPqcvtDyGYIFpF690i8xUw3qJBwUlSadmcLqYmGQu6KDIeM13beGzYWWy3DlB4IYaMk+Dso2RWkFCfLPcRvFbZxFLUDTt21BW56TyjRep1e20+i+eYMR145W2eefj+6VFmgTQi+ECVY8iGxcg35phGo/iDFwlTyXWphwlm1imGRdcnuqhHeop6UAAAIfkEBQoAAgAsEAACAAQACwAAAgWMj6nLXAAh+QQFCgACACwVAAUACgALAAACFZQvgRi92dyJcVJlLobUdi8x4bIhBQAh+QQFCgACACwXABEADAADAAACBYyPqcsFACH5BAUKAAIALBUAFQAKAAsAAAITlGKZwWoMHYxqtmplxlNT7ixGAQAh+QQFCgACACwQABgABAALAAACBYyPqctcACH5BAUKAAIALAUAFQAKAAsAAAIVlC+BGL3Z3IlxUmUuhtR2LzHhsiEFACH5BAUKAAIALAEAEQAMAAMAAAIFjI+pywUAIfkEBQoAAgAsBQAFAAoACwAAAhOUYJnAagwdjGq2amXGU1PuLEYBACH5BAUKAAIALBAAAgAEAAsAAAIFhI+py1wAIfkEBQoAAgAsFQAFAAoACwAAAhWUL4AIvdnciXFSZS6G1HYvMeGyIQUAIfkEBQoAAgAsFwARAAwAAwAAAgWEj6nLBQAh+QQFCgACACwVABUACgALAAACE5RgmcBqDB2MarZqZcZTU+4sRgEAIfkEBQoAAgAsEAAYAAQACwAAAgWEj6nLXAAh+QQFCgACACwFABUACgALAAACFZQvgAi92dyJcVJlLobUdi8x4bIhBQAh+QQFCgACACwBABEADAADAAACBYSPqcsFADs=) no-repeat}.layui-layer-loading .layui-layer-loading2,.layui-layer-ico16{width:32px;height:32px;background:url(data:image/gif;base64,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) no-repeat}.layui-layer-tips{background:0;box-shadow:none;border:0}.layui-layer-tips .layui-layer-content{position:relative;line-height:22px;min-width:12px;padding:8px 15px;font-size:12px;_float:left;border-radius:2px;box-shadow:1px 1px 3px rgba(0,0,0,.2);background-color:#000;color:#fff}.layui-layer-tips .layui-layer-close{right:-2px;top:-1px}.layui-layer-tips i.layui-layer-TipsG{position:absolute;width:0;height:0;border-width:8px;border-color:transparent;border-style:dashed;*overflow:hidden}.layui-layer-tips i.layui-layer-TipsT,.layui-layer-tips i.layui-layer-TipsB{left:5px;border-right-style:solid;border-right-color:#000}.layui-layer-tips i.layui-layer-TipsT{bottom:-8px}.layui-layer-tips i.layui-layer-TipsB{top:-8px}.layui-layer-tips i.layui-layer-TipsR,.layui-layer-tips i.layui-layer-TipsL{top:5px;border-bottom-style:solid;border-bottom-color:#000}.layui-layer-tips i.layui-layer-TipsR{left:-8px}.layui-layer-tips i.layui-layer-TipsL{right:-8px}.layui-layer-lan[type="dialog"]{min-width:280px}.layui-layer-lan .layui-layer-title{background:#4476a7;color:#fff;border:0}.layui-layer-lan .layui-layer-btn{padding:5px 10px 10px;text-align:right;border-top:1px solid #e9e7e7}.layui-layer-lan .layui-layer-btn a{background:#fff;border-color:#e9e7e7;color:#333}.layui-layer-lan .layui-layer-btn .layui-layer-btn1{background:#c9c5c5}.layui-layer-molv .layui-layer-title{background:#009f95;color:#fff;border:0}.layui-layer-molv .layui-layer-btn a{background:#009f95;border-color:#009f95}.layui-layer-molv .layui-layer-btn .layui-layer-btn1{background:#92b8b1}.layui-layer-iconext{background:url(data:image/png;base64,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) no-repeat}.layui-layer-prompt .layui-layer-input{display:block;width:260px;height:36px;margin:0 auto;line-height:30px;padding-left:10px;border:1px solid #e6e6e6;color:#333}.layui-layer-prompt textarea.layui-layer-input{width:300px;height:100px;line-height:20px;padding:6px 10px}.layui-layer-prompt .layui-layer-content{padding:20px}.layui-layer-prompt .layui-layer-btn{padding-top:0}.layui-layer-tab{box-shadow:1px 1px 50px rgba(0,0,0,.4)}.layui-layer-tab .layui-layer-title{padding-left:0;overflow:visible}.layui-layer-tab .layui-layer-title span{position:relative;float:left;min-width:80px;max-width:300px;padding:0 20px;text-align:center;cursor:default;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;cursor:pointer}.layui-layer-tab .layui-layer-title span.layui-this{height:51px;border-left:1px solid #eee;border-right:1px solid #eee;background-color:#fff;z-index:10}.layui-layer-tab .layui-layer-title span:first-child{border-left:0}.layui-layer-tabmain{line-height:24px;clear:both}.layui-layer-tabmain .layui-layer-tabli{display:none}.layui-layer-tabmain .layui-layer-tabli.layui-this{display:block}.layui-layer-photos{background:0;box-shadow:none}.layui-layer-photos .layui-layer-content{overflow:hidden;text-align:center}.layui-layer-photos .layui-layer-phimg img{position:relative;width:100%;display:inline-block;*display:inline;*zoom:1;vertical-align:top}.layui-layer-imgprev,.layui-layer-imgnext{position:fixed;top:50%;width:27px;_width:44px;height:44px;margin-top:-22px;outline:0;blr:expression(this.onFocus=this.blur())}.layui-layer-imgprev{left:30px;background-position:-5px -5px;_background-position:-70px -5px}.layui-layer-imgprev:hover{background-position:-33px -5px;_background-position:-120px -5px}.layui-layer-imgnext{right:30px;_right:8px;background-position:-5px -50px;_background-position:-70px -50px}.layui-layer-imgnext:hover{background-position:-33px -50px;_background-position:-120px -50px}.layui-layer-imgbar{position:fixed;left:0;right:0;bottom:0;width:100%;height:40px;line-height:40px;background-color:#000\\9;filter:Alpha(opacity=60);background-color:rgba(2,0,0,.35);color:#fff;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;font-size:0}.layui-layer-imgtit *{display:inline-block;*display:inline;*zoom:1;vertical-align:top;font-size:12px}.layui-layer-imgtit a{max-width:65%;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;color:#fff}.layui-layer-imgtit a:hover{color:#fff;text-decoration:underline}.layui-layer-imgtit em{padding-left:10px;font-style:normal}@-webkit-keyframes layer-bounceOut{100%{opacity:0;-webkit-transform:scale(.7);transform:scale(.7)}30%{-webkit-transform:scale(1.05);transform:scale(1.05)}0{-webkit-transform:scale(1);transform:scale(1)}}@keyframes layer-bounceOut{100%{opacity:0;-webkit-transform:scale(.7);-ms-transform:scale(.7);transform:scale(.7)}30%{-webkit-transform:scale(1.05);-ms-transform:scale(1.05);transform:scale(1.05)}0{-webkit-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}}.layer-anim-close{-webkit-animation-name:layer-bounceOut;animation-name:layer-bounceOut;-webkit-animation-fill-mode:both;animation-fill-mode:both;-webkit-animation-duration:.2s;animation-duration:.2s}@media screen and (max-width:1100px){.layui-layer-iframe{overflow-y:auto;-webkit-overflow-scrolling:touch}}'));
theHead.appendChild(style);



