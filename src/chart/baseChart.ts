import { Coordinate, drawLine } from '@/utils/canvasDraw'
import KLine from '@/index'
import { DataItem } from '@/kLineConf'
import {
    IndicatorsConfMap,
    IndicatorsNames,
    IndicatorsMap,
} from '@/indicators/indicatorsUtils'
import { YAxis, YConf } from '@/axis/yAxis'
import { BaseTool } from '@/tool/baseTool'
import { createIndicators } from '@/indicators/indicatorsUtils'
// import { ChartNames } from '@/chart/chartUtils'

/**
 * 图表类
 */

export interface BaseChartConf {
    // 显示那些指标
    indicatorShowArr: IndicatorsNames[]
    // 指标的配置
    indicatorsConfMap?: IndicatorsConfMap
    yConf?: YConf
}

export class BaseChart {
    // 指标 实列的 的映射
    public indicatorsMap: IndicatorsMap = {}
    // public leftTop: Coordinate
    // public rightBottom: Coordinate

    // 标记 集合
    public toolList: BaseTool[] = []

    // 最大最小值的下标
    public maxIndex = -1
    public minIndex = -1

    // 最大最小值对应存储的key
    public maxIndexCacheKey = ''
    public minIndexCacheKey = ''

    public YAxis: YAxis

    // 图表的名称
    // public chartName: ChartNames

    constructor(
        public chartName: string,
        public kLine: KLine,
        public topY: number,
        public chartH: number
    ) {
        this.determineIndicatorsMap()
        this.YAxis = new YAxis(this)
    }
    get leftTop(): Coordinate {
        return {
            x: 0,
            y: this.topY,
        }
    }
    get rightBottom(): Coordinate {
        return {
            x: this.kLine.elWH.w,
            y: this.topY + this.chartH,
        }
    }

    get conf() {
        return this.kLine.conf.chartConfMap[this.chartName]
    }

    get chartW() {
        return this.rightBottom.x - this.leftTop.x
    }
    // get chartH() {
    //     return this.rightBottom.y - this.leftTop.y
    // }
    // 这个地图 Y轴最大的宽度
    get maxTxtW() {
        return this.YAxis.maxTxtW
    }
    // 绘制图表的范围，不包含 Y轴
    get drawChartLeftTop() {
        return this.leftTop
    }
    // 绘制图表的范围，不包含 Y轴
    get drawChartRightBottom() {
        return {
            x: this.rightBottom.x - this.kLine.yW,
            y: this.rightBottom.y,
        }
    }

    // 绘制图表的总高度
    get drawCharH() {
        return this.drawChartRightBottom.y - this.drawChartLeftTop.y
    }

    // 最大值
    get maxValue() {
        return (
            (this.kLine.dataArr[this.maxIndex] &&
                this.kLine.dataArr[this.maxIndex][this.maxIndexCacheKey]) ||
            Number.MIN_VALUE
        )
    }

    // 最小值
    get minValue() {
        return (
            (this.kLine.dataArr[this.minIndex] &&
                this.kLine.dataArr[this.minIndex][this.minIndexCacheKey]) ||
            Number.MAX_VALUE
        )
    }

    // 计算所有指标
    calcAll(item: DataItem, index: number, isMaxValue: boolean) {
        Object.keys(this.indicatorsMap).forEach((key: IndicatorsNames) => {
            const indicator = this.indicatorsMap[key]
            if (indicator) {
                indicator.calc(item, index, isMaxValue)
            }
        })
    }

    // 计算自己的最大最小值
    calcMaxMin() {
        let max = Number.MIN_VALUE
        let min = Number.MAX_VALUE
        Object.keys(this.indicatorsMap).forEach((key: IndicatorsNames) => {
            const indicator = this.indicatorsMap[key]
            const indicatorsMax = indicator.maxValue
            const indicatorsMin = indicator.minValue
            if (indicatorsMax >= max) {
                max = indicatorsMax
                this.maxIndex = indicator.maxIndex
                this.maxIndexCacheKey = indicator.maxIndexCacheKey
            }
            if (indicatorsMin <= min) {
                min = indicatorsMin
                this.minIndex = indicator.minIndex
                this.minIndexCacheKey = indicator.minIndexCacheKey
            }
        })
        // 自己的最大最小值确定后， 开始计算轴标
        this.YAxis.determineScale()
    }

    // 实例化 需要显示的指标 指标
    determineIndicatorsMap() {
        this.conf.indicatorShowArr.forEach((key) => {
            if (!this.indicatorsMap[key]) {
                this.indicatorsMap[key] = createIndicators(key, this)
            }
        })
    }

    valueGetY(v: number) {
        return this.YAxis.valueGetY(v)
    }

    YGetValue(y: number) {
        return this.YAxis.YGetValue(y)
    }
    // 绘制工具
    drawTool() {
        this.toolList.forEach((item) => {
            item.draw()
        })
    }
    drawAll() {
        this.drawBottom()
        this.drawTop()
    }
    drawBottom() {
        const bc = this.kLine.bc
        bc.save()
        bc.rect(
            this.drawChartLeftTop.x,
            this.drawChartLeftTop.y,
            this.chartW,
            this.chartH
        )
        bc.clip()
        this.YAxis.draw()
        this.drawGridLine()
        Object.keys(this.indicatorsMap).forEach((key: IndicatorsNames) => {
            const item = this.indicatorsMap[key]
            item.drawBottom()
        })
        bc.restore()
    }
    drawTop() {
        Object.keys(this.indicatorsMap).forEach((key: IndicatorsNames) => {
            const item = this.indicatorsMap[key]
            item.drawTop()
        })
        this.drawTool()
    }
    // 绘制 图表的网格线
    drawGridLine() {
        this.kLine.xAxis.axisMarkArr.forEach((item) => {
            drawLine(
                this.kLine.bc,
                {
                    x: item.x,
                    y: this.leftTop.y,
                },
                {
                    x: item.x,
                    y: this.rightBottom.y,
                },
                {
                    w: this.kLine.conf.xConf.gridLine.lineW,
                    style: this.kLine.conf.xConf.gridLine.color,
                }
            )
        })
    }
    // 坐标是否在图表中
    inChart(coordinate: Coordinate) {
        return (
            coordinate.x >= this.leftTop.x &&
            coordinate.x <= this.rightBottom.x &&
            coordinate.y >= this.leftTop.y &&
            coordinate.y <= this.rightBottom.y
        )
    }

    formData(v: number) {
        return Math.floor(v) + ''
    }
}
