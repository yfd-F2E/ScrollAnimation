class ScrollAnimation {

  constructor(el, option) {
    this.el = /\./.test(el) ? el : '.' + el
    this.options = Object.assign({}, {
      className: '', //动画元素名称
      ratio: 0.25, //元素可见的比例
      perspective: false, //开启3d动画模式 就必须添加动画根父元素
      parentClassName: '', //动画元素的根父元素
      maxDuration: 0.8, //动画持续最大时间
      minDuration: 0.4, //动画持续最小时间
    }, option)
    this.observer = '' //用来观察dom元素个数变化
    this.scroll = '' //用来解绑scroll事件
    this.resize = '' //用来解绑resize事件
    this._init()
  }

  //初始化
  _init() {
    if (this._checkApi()) {
      this._watchers()
    } else {
      this._isView()
      this._scroll()
      this._resize()
    }
  }

  //检测浏览器是否支持IntersectionObserver
  _checkApi() {
    return window.IntersectionObserver !== undefined
  }

  //更新元素监听个数
  _refresh() {
    if (this._checkApi()) {
      this.observer = this._getEl()
      this.observer.forEach(v => {
        window.io.observe(v)
      })
    } else {
      return this.observer = this._getEl()
    }
  }

  //获取监听元素
  _getEl() {
    return Array.from(document.querySelectorAll(this.el))
  }

  //IntersectionObserver 开启交叉观察期监听模式
  _watchers() {
    window.io = new IntersectionObserver(change => {
      change.forEach(v => {
        if (v.intersectionRatio >= this.options.ratio) {
          this._addClassAnimation(v.target)
          io.unobserve(v.target)
        }
      })
    }, {
      threshold: [this.options.ratio]
    })
    this._refresh()
  }

  //核心函数，检查元素是否在视口，在就添加对应的动画名称
  _isView() {
    let wh = document.documentElement.clientHeight || window.innerHeight
    this._refresh().forEach(v => {
      if (v.getBoundingClientRect().top < wh - v.clientHeight * this.options.ratio) {
        if (v.classList.contains(this.options.className)) {
          return
        }
        this._addClassAnimation(v)
      }
    })
    if (this.options.perspective && this.options.parentClassName) {
      setTimeout(() => {
        this._perspY(scrollTop, docH)
      }, 25)
    }
  }

  //添加动画名称
  _addClassAnimation(v) {
    let randDuration = (Math.random() * (this.options.maxDuration - this.options.minDuration) + this.options.minDuration) + 's'
    v.style.WebkitAnimationDuration = randDuration
    v.style.MozAnimationDuration = randDuration
    v.style.animationDuration = randDuration
    v.style.visibility = 'visible'
    v.classList.add(this.options.className)
  }

  //移除动画名称
  _removeClassAnimation() {
    Array.from(this.el).forEach(v => {
      v.classList.remove(this.options.className)
    })
  }

  //滚动绑定
  _scroll() {
    this.scroll = this._throttle(this._isView, 300).bind(this)
    window.addEventListener('scroll', this.scroll, false)
  }

  //窗口大小缩放绑定
  _resize() {
    this.resize = this._throttle(this._isView, 800).bind(this)
    window.addEventListener('resize', this.resize, false)
  }

  //给根父元素添加css3属性 perspectiveOrigin,为3d动画做准备
  _perspY(scrollTop, docH) {
    let perspY = scrollTop + docH / 2,
        el = this.options.parentClassName
    el.style.WebkitPerspectiveOrigin = '50% ' + perspY + 'px'
    el.style.MozPerspectiveOrigin = '50% ' + perspY + 'px'
    el.style.perspectiveOrigin = '50% ' + perspY + 'px'
  }

  //节流函数
  _throttle(fn, delay) {
    let timer = null, preTime
    return function () {
      clearTimeout(timer)
      let curTime = Date.now(), context = this, args = arguments
      if (!preTime) {
        preTime = curTime
      }
      let remaining = delay - (curTime - preTime)
      if (remaining <= 0) {
        fn.apply(context, args)
        preTime = curTime
      } else {
        clearTimeout(timer)
        timer = setTimeout(() => {
          fn.apply(context, args)
          preTime = curTime
        }, remaining)
      }
    }
  }

  //移除滚动事件,移除窗口大小改变事件
  _destroy() {
    if (this._checkApi()){
      console.warn('Method unavailable')
      return
    }
    window.removeEventListener('scroll', this.scroll)
    window.removeEventListener('resize', this.resize)
  }
}