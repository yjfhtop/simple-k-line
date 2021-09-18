/**
 * 分时图
 */
import { DataItem } from '@/kLineConf'
import { BaseIndicators } from '@/indicators/baseIndicators'
import { IndicatorsNames } from '@/indicators/indicatorsUtils'
import {
    Coordinate,
    drawBrokenLine,
    drawLine,
    drawRect,
    drawTxt,
} from '@/utils/canvasDraw'

// close的配置项
export interface CloseIndicatorsConf {
    lineW?: number
    color?: string
    nowLine?: {
        lineW?: number
        color?: string
        // 本项存在就是虚线
        lineDash?: number[]
    }
    nowHighlight?: {
        bgc?: string
        font?: {
            size?: number
            family?: string
            color?: string
        }
        h?: number
    }
}
const cacheKey = '_close'
export class CloseIndicators extends BaseIndicators {
    public name: IndicatorsNames = 'timeSharing'
    public cacheKeyArr: string[] = []

    calc(item: DataItem, index: number, isMaxValue: boolean) {
        if (!item) return

        this.cacheKeyArr.push(cacheKey)
        let useValue = item[cacheKey]
        if (
            useValue === undefined ||
            index === this.chart.kLine.dataArr.length - 1
        ) {
            useValue = item.close
            this.cacheData(cacheKey, item, useValue, index, isMaxValue)
        }
        this.itemTryMaxMin(cacheKey, item, useValue, index, isMaxValue)
    }
    drawBottom() {
        const dotArr: Coordinate[] = []
        for (
            let i = this.chart.kLine.drawSIndex;
            i <= this.chart.kLine.drawEIndex;
            i++
        ) {
            const item = this.chart.kLine.dataArr[i]
            if (item && item[cacheKey] !== undefined) {
                const x = this.chart.kLine.xAxis.indexGetX(i)
                const y = this.chart.YAxis.valueGetY(item[cacheKey])
                dotArr.push({
                    x,
                    y,
                })
            }
        }
        drawBrokenLine(this.chart.kLine.bc, dotArr, {
            drawStyle: {
                w: this.conf.lineW,
                style: this.conf.color,
            },
        })
    }
    drawTop() {
        const lastItem =
            this.chart.kLine.dataArr[this.chart.kLine.dataArr.length - 1]
        let value = lastItem.close

        const x = this.chart.kLine.xAxis.indexGetX(
            this.chart.kLine.dataArr.length - 1
        )
        const y = this.chart.YAxis.valueGetY(value)

        drawLine(
            this.chart.kLine.tc,
            {
                x: this.chart.drawChartLeftTop.x,
                y,
            },
            {
                x: this.chart.drawChartRightBottom.x,
                y,
            },
            {
                w: this.conf.nowLine.lineW,
                style: this.conf.nowLine.color,
                lineDash: this.conf.nowLine.lineDash,
            }
        )

        drawRect(this.chart.kLine.tc, {
            leftTop: {
                x: this.chart.drawChartRightBottom.x,
                y: y - this.conf.nowHighlight.h / 2,
            },
            w: this.chart.kLine.yW,
            h: this.conf.nowHighlight.h,
            drawType: 'full',
            drawStyle: {
                style: this.conf.nowHighlight.bgc,
            },
        })

        drawTxt(this.chart.kLine.tc, {
            txt: this.chart.formData(value),
            coordinate: {
                x: this.chart.drawChartRightBottom.x + this.chart.kLine.yW / 2,
                y: y,
            },
            textAlign: 'center',
            textBaseline: 'middle',
            drawStyle: {
                style: this.conf.nowHighlight.font.color,
            },
            fontSize: this.conf.nowHighlight.font.size,
            fontFamily: this.conf.nowHighlight.font.family,
        })
    }
}
