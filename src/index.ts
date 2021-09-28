import { createHDCanvas, getContainerEl, getEleHW, WH } from '@/utils/element'
import { logError, logTag } from '@/utils/log'
import { DataItem, initConf, KLineConf } from '@/kLineConf'
import { deepCopy } from '@/utils/dataHandle'
import {
    addTime,
    formDate,
    getMonthAllDayNumber,
    isLastDay,
    isLeapYear,
    timeArrGetTimeUnitAndNumber,
} from '@/utils/timeHandle'
import { ChartMap, createChart } from '@/chart/chartUtils'
import { arrGetAddAndDel } from '@/utils/index'
import { XAxis } from '@/axis/xAxis'
import { EventHandle } from '@/eventHandle/index'
import { Cross } from '@/cross/index'
import { createTool, ToolTypes } from '@/tool/toolUtils'
import { BaseChart } from '@/chart/baseChart'
import { Lang } from '@/lang/utils'
import { drawRect } from '@/utils/canvasDraw'

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
    // 旧的配置项
    public oldConf: KLineConf
    // 需要的数据集合 最后的为最新的数据
    public dataArr: DataItem[]
    // y 轴最大文本长度
    public yTxtMaxW: number = 70
    // 在图表内的绘制结束下标
    private _eIndex: number
    // 偏移下标的数目 在结束坐标的偏移
    public eDeviationNumber = 2
    // 偏移下标的数目 在开始坐标的偏移
    public sDeviationNumber = 2
    public xAxis: XAxis
    public eventHandle: EventHandle
    // 是否显示十字交叉线
    public showCross: boolean = false
    public cross: Cross
    // 使用的语言对象
    public lang: Lang

    private _useItemWAndSpaceIndex: number
    // 当前 item 宽度 下标
    get useItemWAndSpaceIndex() {
        return this._useItemWAndSpaceIndex
    }

    set useItemWAndSpaceIndex(v: number) {
        if (
            v < 0 ||
            v > this.conf.itemWAndSpaceList.length - 1 ||
            v === this.useItemWAndSpaceIndex
        ) {
            return
        }
        this._useItemWAndSpaceIndex = v
        this.standardizationEIndex()
        this.determineYTxtMaxW()
        this.standardizationEIndex()

        this.xAxis.getSupplementDataArr()
        this.xAxis.determineScale()
    }
    get eIndexMax() {
        return (
            this.dataArr.length -
            1 +
            this.itemNumber -
            Math.min(this.conf.minItem, this.dataArr.length)
        )

        // return (
        //     this.dataArr.length -
        //     Math.min(this.conf.minItem, this.dataArr.length) +
        //     this.itemNumber -
        //     1
        // )
    }
    get eIndexMin() {
        return Math.min(this.dataArr.length - 1, this.conf.minItem - 1)
    }
    get eIndex() {
        return this._eIndex
    }
    set eIndex(v) {
        // const max = this.eIndexMax
        // const min = this.eIndexMin
        // // this._eIndex = v
        // if (v > max) {
        //     v = max
        // } else if (v < min) {
        //     v = min
        // }
        this._eIndex = v
        this.standardizationEIndex()
    }

    // 真正的绘制开始下标
    get drawSIndex() {
        return this.sIndex - this.sDeviationNumber
    }
    // 真正的绘制结束下标
    get drawEIndex() {
        return this.eIndex + this.eDeviationNumber
    }

    // 图表的映射
    public chartMap: ChartMap = {}

    // y 轴左右 Padding 的和
    get yPaddingAllLen() {
        return (this.conf.yPadding.left || 0) + (this.conf.yPadding.right || 0)
    }

    // 当前使用的 item
    get useItem() {
        return this.conf.itemWAndSpaceList[this.useItemWAndSpaceIndex]
    }
    // 当前使用的 item 的 宽度（包含空隙）
    get useItemAllW() {
        return this.useItem.w + this.useItem.space
    }
    // y轴的包含 Padding 宽度
    get yW() {
        return this.yTxtMaxW + this.yPaddingAllLen
    }
    // 能够展示的 item 个数
    get itemNumber() {
        const data = Math.floor((this.elWH.w - this.yW) / this.useItemAllW)
        return data
    }
    // 在图表内的绘制的开始下标
    get sIndex() {
        return this.eIndex - this.itemNumber
    }
    // 所有图表的高度
    get allChatH() {
        return this.elWH.h - this.conf.xConf.h
    }
    // 图表开始的y坐标， 第一个图表的y轴
    get chartStartY() {
        return 0
    }
    // 图表最大的 y 坐标的值，不含轴
    get chartMaxY() {
        return this.elWH.h - this.conf.xConf.h
    }
    // 图表最大的 x 坐标的值，不含轴
    get chartMaxX() {
        return this.elWH.w - this.yW
    }
    constructor(
        el: HTMLElement | string,
        dataArr: DataItem[],
        option: KLineConf
    ) {
        this.test()
        // logTag()
        this.dataArr = deepCopy(dataArr)
        if (!this.dataArr) {
            logError('new SimpleKLine', 'dataArr is required')
            return
        }

        initConf(option, this)
        this._eIndex = dataArr.length - 1
        this._useItemWAndSpaceIndex = this.conf.useItemWAndSpaceIndex
        this.initUseDom(el)
        this.initContainer()
        this.initCanvas()
        this.determineChartMap()
        this.determineYTxtMaxW()
        this.xAxis = new XAxis(this)
        this.eventHandle = new EventHandle(this)
        this.cross = new Cross(this)
        this.drawAll()
    }

    // 规范化 EIndex
    standardizationEIndex() {
        const max = this.eIndexMax
        const min = this.eIndexMin
        if (this._eIndex > max) {
            this._eIndex = this.eIndexMax
        } else if (this._eIndex < min) {
            this._eIndex = min
        }
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
    // 确定化图表的映射
    determineChartMap() {
        if (
            !this.oldConf ||
            (this.oldConf &&
                this.oldConf.chartShowArr.join('') !==
                    this.conf.chartShowArr.join(''))
        ) {
            // 副图的高度
            const viceChatH = this.allChatH * 0.2
            // 主图的高度
            const mainCharH =
                (1 - (this.conf.chartShowArr.length - 1) * 0.2) * this.allChatH
            this.conf.chartShowArr.forEach((name, index) => {
                if (index === 0) {
                    // 主图
                    this.chartMap[name] = createChart(
                        name,
                        this,
                        this.chartStartY,
                        mainCharH
                    )
                } else {
                    this.chartMap[name] = createChart(
                        name,
                        this,
                        this.chartMap[this.conf.chartShowArr[index - 1]]
                            .rightBottom.y,
                        viceChatH
                    )
                }
            })
        }
    }
    // 获取 最大的文字宽度
    getMaxTxtWInAllChart() {
        let max = Number.MIN_VALUE
        this.conf.chartShowArr.forEach((name) => {
            const chart = this.chartMap[name]
            const txtW = chart.maxTxtW
            if (txtW > max) {
                max = txtW
            }
        })
        return max
    }
    // 计算所有需要的数据， 主要是计算各个指标的值, 然后计算图表的最大值
    calc() {
        this.conf.chartShowArr.forEach((name) => {
            const chart = this.chartMap[name]
            if (chart) {
                chart.clearMaxMin()
            } else {
                logError('calc', 'chart non-existent')
            }
        })
        for (let i = this.drawSIndex; i <= this.drawEIndex; i++) {
            const item = this.dataArr[i]
            if (item) {
                // 是否在最大最小值的取值范围内
                const isMaxValue = i >= this.drawSIndex && i <= this.drawEIndex
                this.conf.chartShowArr.forEach((name) => {
                    const chart = this.chartMap[name]
                    chart.calcAll(item, i, isMaxValue)
                })
            }
        }
        this.conf.chartShowArr.forEach((name) => {
            const chart = this.chartMap[name]
            chart.calcMaxMin()
        })
    }
    // 确定 YTxtMaxW
    determineYTxtMaxW() {
        const oldYTxtMaxW = this.yTxtMaxW
        this.calc()
        const txtW = this.getMaxTxtWInAllChart()
        const diff = oldYTxtMaxW - txtW
        if (txtW === oldYTxtMaxW || (diff > 0 && Math.abs(diff) <= 2)) {
            this.yTxtMaxW = txtW
        } else {
            this.yTxtMaxW = txtW
            this.determineYTxtMaxW()
        }
    }
    drawAll() {
        this.drawBottom()
        this.drawTop()
    }
    drawBg() {
        drawRect(this.bc, {
            leftTop: { x: 0, y: 0 },
            w: this.elWH.w,
            h: this.elWH.h,
            drawStyle: {
                style: this.conf.bgc,
            },
        })
    }
    // 绘制底部的canvas
    drawBottom() {
        this.clearBc()
        this.drawBg()
        this.xAxis.draw()
        this.conf.chartShowArr.forEach((name) => {
            const chart = this.chartMap[name]
            chart.drawBottom()
        })
    }
    // 绘制顶部的 canvas
    drawTop() {
        this.clearTc()
        this.conf.chartShowArr.forEach((name) => {
            const chart = this.chartMap[name]
            chart.drawTop()
        })
        // 因为没有完成的工具没有添加到图表里面，所以需要手动绘制
        if (this.eventHandle.activeTool && !this.eventHandle.activeTool.over) {
            this.eventHandle.activeTool.draw()
        }
        if (this.showCross) {
            this.cross.draw()
        }
    }
    clearBc() {
        this.bc.clearRect(0, 0, this.elWH.w, this.elWH.h)
    }
    clearTc() {
        this.tc.clearRect(0, 0, this.elWH.w, this.elWH.h)
    }
    addTool(name: ToolTypes) {
        const tool = createTool(name, this.chartMap[this.conf.chartShowArr[0]])
        this.eventHandle.activeTool = tool
    }
    // 便利显示的图表
    eachShowChart(cbk: (c: BaseChart) => void) {
        this.conf.chartShowArr.forEach((name) => {
            const chart = this.chartMap[name]
            if (chart) {
                cbk(chart)
            }
        })
    }
    // 根据item 获取当前的柱子该显示什么颜色
    getItemColor(item: DataItem) {
        if (!item) {
            return null
        } else {
            const type = this.getItemRiseFall(item)
            if (type === 'rise') {
                return this.conf.riseFallColor.riseColor
            } else {
                return this.conf.riseFallColor.fallColor
            }
        }
    }
    // 获取涨跌
    getItemRiseFall(item: DataItem) {
        if (!item) {
            return null
        } else {
            if (item.close >= item.open) {
                return 'rise'
            } else {
                return 'fall'
            }
        }
    }
    // 修改数据
    updateData(
        newData: DataItem | DataItem[],
        type: 'all' | 'lastItem' | 'addNew' | 'addOld' = 'all'
    ) {
        newData = deepCopy(newData)
        switch (type) {
            case 'all':
                this.dataArr = newData as any
                this.eIndex = newData.length - 1
                break
            case 'lastItem':
                this.dataArr[this.dataArr.length - 1] = deepCopy(
                    newData
                ) as DataItem
                break
            case 'addNew':
                this.dataArr.push(...(newData as DataItem[]))
                this.eIndex += newData.length
                break
            case 'addOld':
                // 保证位置不变
                this.dataArr.unshift(...(newData as DataItem[]))
                this.eIndex += newData.length
                break
        }
        this.determineYTxtMaxW()
        this.drawAll()
    }
    // 设置配置项
    setConf(conf: KLineConf) {
        initConf(conf, this)
        this.determineChartMap()
    }
    test() {
        const list = [1, 2, 100, 200]
    }
}
