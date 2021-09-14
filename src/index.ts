import { createHDCanvas, getContainerEl, getEleHW, WH } from '@/utils/element'
import { logError, logTag } from '@/utils/log'
import { initConf, KLineConf } from '@/kLineConf'

export default class SimpleKLine {
    // 用户提供的容器
    public userEl: HTMLElement
    // 自己的容器
    public el: HTMLElement
    // 自己的容器 的宽高
    public elWH: WH
    // 分层绘制的 底部canvas 元素
    public bEl: HTMLElement
    // 底部canvas ctx
    public bc: CanvasRenderingContext2D

    // 分层绘制的 顶部canvas 元素
    public tEl: HTMLElement
    // 顶部canvas ctx
    public tc: CanvasRenderingContext2D
    // 配置项
    public conf: KLineConf
    constructor(el: HTMLElement | string = '#k_line', option?: KLineConf) {
        logTag()
        this.conf = initConf(option)
        this.initUseDom(el)
        this.initContainer()
        this.initCanvas()
    }

    // 初始化用户的dom
    initUseDom(el: HTMLElement | string) {
        this.userEl = getContainerEl(el)
        if (!this.userEl) {
            logError('initEl', 'not find element. Please check parameter el')
            throw ''
        }
        this.el = document.createElement('div')
    }

    // 初始化自己的容器
    initContainer() {
        this.elWH = getEleHW(this.userEl)
        this.el = document.createElement('div')
        this.el.style.width = this.elWH.w + 'px'
        this.el.style.height = this.elWH.h + 'px'
        this.el.style.position = 'relative'

        this.userEl.appendChild(this.el)
    }
    // 初始化canvas
    initCanvas() {
        const style: Partial<CSSStyleDeclaration> = {
            position: 'absolute',
            left: '0px',
            top: '0px',
            zIndex: '10',
        }
        const mainCanvasObj = createHDCanvas(this.elWH.w, this.elWH.h, style)

        style.zIndex = '20'
        const floatCanvasObj = createHDCanvas(this.elWH.w, this.elWH.h, style)
        this.bEl = mainCanvasObj.canvas
        this.bc = mainCanvasObj.ctx

        this.tEl = floatCanvasObj.canvas
        this.tc = floatCanvasObj.ctx

        this.el.appendChild(this.bEl)
        this.el.appendChild(this.tEl)
    }
}
