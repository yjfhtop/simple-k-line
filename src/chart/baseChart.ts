import { Coordinate, drawLine } from '@/utils/canvasDraw'
import KLine from '@/index'
import { DataItem } from '@/kLineConf'
import {
    IndicatorsConfMap,
    IndicatorsNames,
    IndicatorsMap,
} from '@/indicators/indicatorsUtils'
import { YAxis, YConf } from '@/axis/YAxis'
import { BaseTool } from '@/tool/baseTool'
import { createIndicators } from '@/indicators/indicatorsUtils'
import { ChartNames } from '@/chart/chartUtils'

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

export abstract class BaseChart {
    // 指标 实列的 的映射
    public indicatorsMap: IndicatorsMap = {}
    public leftTop: Coordinate
    public rightBottom: Coordinate

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
    abstract name: ChartNames

    constructor(
        public kLine: KLine,
        position: { leftTop: Coordinate; rightBottom: Coordinate }
    ) {
        this.leftTop = position.leftTop
        this.rightBottom = position.rightBottom
        this.determineIndicatorsMap()
        this.YAxis = new YAxis(this)
    }

    get conf() {
        return this.kLine.conf.chartConfMap[this.name]
    }

    get chartW() {
        return this.rightBottom.x - this.leftTop.x
    }
    get chartH() {
        return this.rightBottom.y - this.leftTop.y
    }
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
            x: this.rightBottom.x - this.kLine.yPaddingAllLen,
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

    draw() {
        this.YAxis.draw()
        this.drawGridLine()
        Object.keys(this.indicatorsMap).forEach((key: IndicatorsNames) => {
            const item = this.indicatorsMap[key]
            item.draw()
        })
    }
    // 绘制 图表的网格线
    drawGridLine() {
        // this.kLine.xAxis.axisMarkArr.forEach((item) => {
        //     drawLine(
        //         this.kLine.mainCtx,
        //         {
        //             x: item.x,
        //             y: this.leftTop.y,
        //         },
        //         {
        //             x: item.x,
        //             y: this.rightBottom.y,
        //         },
        //         {
        //             w: this.kLine.theme.gridStyle.w,
        //             style: this.kLine.theme.gridStyle.color,
        //         }
        //     )
        // })
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

    drawFloat() {
        this.toolList.forEach((item) => {
            item.draw()
        })
    }

    formData(v: number) {
        return Math.floor(v) + ''
    }
}
