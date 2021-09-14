import { createHDCanvas, getContainerEl, getEleHW, WH } from '@/utils/element'
import { logError, logTag } from '@/utils/log'
import { DataItem, initConf, KLineConf } from '@/kLineConf'
import { deepCopy } from '@/utils/dataHandle'

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
    // 需要的数据集合 最后的为最新的数据
    public dataArr: DataItem[]
    // y 轴最大文本长度
    public yTxtMaxW: number
    // 在图表内的绘制结束下标
    public eIndex: number

    // y 轴左右 Padding 的和
    get yPaddingAllLen() {
        return (this.conf.yPadding.left || 0) + (this.conf.yPadding.right || 0)
    }

    // 当前使用的 item
    get useItem() {
        return this.conf.itemWAndSpaceList[this.conf.useItemWAndSpaceIndex]
    }
    // 当前使用的 item 的 宽度
    get useItemAllW() {
        return this.useItem.w + this.useItem.space
    }
    // 能够展示的 item 个数
    get itemNumber() {
        return Math.floor(
            (this.elWH.w - this.yPaddingAllLen) / this.useItemAllW
        )
    }
    // 在图表内的绘制的开始下标
    get sIndex() {
        return this.eIndex - this.itemNumber
    }
    constructor(
        el: HTMLElement | string,
        dataArr: DataItem[],
        option: KLineConf
    ) {
        // logTag()
        this.dataArr = deepCopy(dataArr)
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

    // 计算所有需要的数据， 主要是计算各个指标的值，同时处理最大最小值
    calc() {}
}
