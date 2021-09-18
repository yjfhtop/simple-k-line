import {
    calcScaleNumber,
    DefScaleCalcConfig,
    mergeData,
    scaleCalc,
    ScaleCalcConfig,
} from '@/utils/dataHandle'
import { BaseChart } from '@/chart/baseChart'
import { getMagnitudeNumber } from '@/utils/format'
import { getTxtW } from '@/utils/element'
import { drawLine, drawTxt } from '@/utils/canvasDraw'

export interface YConf {
    // 轴线
    axisLine?: {
        color?: string
        lineW?: number
    }
    // 轴标
    axisMark?: {
        len?: number
        lineW?: number
        color?: string
    }
    txt?: {
        size?: number
        family?: string
        // X偏移量， 文字默认是在轴标的尾部绘制 x轴 = 轴线.x + axisMark.len
        deviationX?: number
        color?: string
    }
    // 网格线样式
    gridLine?: {
        color?: string
        lineW?: number
    }
    // 轴标配置
    scaleCalcConfig?: ScaleCalcConfig
}

/**
 * Y轴的轴标
 */
export class YAxis {
    public maxValue: number
    public minValue: number
    public step: number
    // 轴标的值
    public scaleValueArr: number[]
    // 轴标上显示的值
    public scaleShowValueArr: string[]
    // 最大的轴标刻度的宽度
    public maxTxtW: number = Number.MIN_VALUE
    constructor(public chart: BaseChart) {
        // this.determineScale()
    }

    get conf() {
        return mergeData(this.chart.conf.yConf, this.chart.kLine.conf.yConf)
    }
    // 确定轴标
    determineScale() {
        const scaleNumberData = calcScaleNumber(this.chart.chartH, 20, {
            minNumber: 5,
            minScaleW: 40,
        })

        const scaleData = scaleCalc(
            this.chart.maxValue,
            this.chart.minValue,
            scaleNumberData.number
        )
        this.maxValue = scaleData.max
        this.minValue = scaleData.min
        this.step = scaleData.step

        this.scaleValueArr = []
        this.scaleShowValueArr = []
        for (let i = this.minValue; i <= this.maxValue; i += this.step) {
            // const showTxt = getMagnitudeNumber(i)
            const showTxt = this.chart.formData(i)
            const showTxtW = getTxtW(
                this.chart.kLine.bc,
                showTxt,
                this.conf.txt.size,
                this.conf.txt.family
            )
            this.scaleValueArr.push(i)
            this.scaleShowValueArr.push(showTxt)
            this.maxTxtW = Math.max(this.maxTxtW, showTxtW)
        }
    }

    // value 获取 对应canvas的y轴的值
    valueGetY(value: number) {
        return (
            this.chart.drawChartRightBottom.y -
            ((value - this.minValue) * this.chart.drawCharH) /
                (this.maxValue - this.minValue)
        )
    }

    YGetValue(y: number) {
        return (
            (-(y - this.chart.drawChartRightBottom.y) *
                (this.maxValue - this.minValue)) /
                this.chart.drawCharH +
            this.minValue
        )
    }
    draw() {
        // 轴绘制 s
        drawLine(
            this.chart.kLine.bc,
            {
                x: this.chart.drawChartRightBottom.x,
                y: this.chart.drawChartLeftTop.y,
            },
            {
                x: this.chart.drawChartRightBottom.x,
                y: this.chart.drawChartRightBottom.y,
            },
            {
                w: this.conf.axisLine.lineW,
                style: this.conf.axisLine.color,
            }
        )
        // 轴绘制 e

        // 坐标绘制 s
        for (let i = 0; i < this.scaleShowValueArr.length; i++) {
            const y = this.valueGetY(this.scaleValueArr[i])
            if (i === 0 || i === this.scaleShowValueArr.length - 1) {
                continue
            }
            // 绘制轴标线 s
            drawLine(
                this.chart.kLine.bc,
                {
                    x: this.chart.drawChartRightBottom.x,
                    y,
                },
                {
                    x:
                        this.chart.drawChartRightBottom.x +
                        this.conf.axisMark.len,
                    y,
                },
                {
                    w: this.conf.axisMark.lineW,
                    style: this.conf.axisMark.color,
                }
            )
            // 绘制轴标线 e

            // 网格线 s
            drawLine(
                this.chart.kLine.bc,
                {
                    x: this.chart.drawChartLeftTop.x,
                    y,
                },
                {
                    x: this.chart.drawChartRightBottom.x,
                    y,
                },
                {
                    w: this.conf.gridLine.lineW,
                    style: this.conf.gridLine.color,
                }
            )
            // 网格线 e

            drawTxt(this.chart.kLine.bc, {
                coordinate: {
                    x:
                        this.chart.drawChartRightBottom.x +
                        this.conf.axisMark.len +
                        this.conf.txt.deviationX,
                    y: y - this.conf.txt.size / 2,
                },
                txt: this.scaleShowValueArr[i],
                drawType: 'full',
                drawStyle: {
                    style: this.conf.txt.color,
                },
                fontSize: this.conf.txt.size,
                fontFamily: this.conf.txt.family,
                textBaseline: 'hanging',
                textAlign: 'left',
            })
        }
        // 坐标绘制 e
    }
}
