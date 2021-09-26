/**
 * close 指标, 分时？？ 大概
 */
import { DataItem, DefInfoTxtConf } from '@/kLineConf'
import { BaseIndicators } from '@/indicators/baseIndicators'
import { IndicatorsNames } from '@/indicators/indicatorsUtils'
import {
    Coordinate,
    drawBrokenLine,
    drawLine,
    drawRect,
    drawTxt,
} from '@/utils/canvasDraw'
import { formDate } from '@/utils/timeHandle'
import { getTxtW } from '@/utils/element'

// close的配置项
export interface CloseIndicatorsConf {
    lineW?: number
    color?: string
    // 当前价格的线段样式
    nowLine?: {
        lineW?: number
        color?: string
        // 本项存在就是虚线
        lineDash?: number[]
    }
}
const cacheKey = '_close'
export class CloseIndicators extends BaseIndicators {
    public name: IndicatorsNames = 'closeIndicators'
    public cacheKeyArr: string[] = []

    get conf() {
        return this.chart.conf.indicatorsConfMap[
            this.name
        ] as CloseIndicatorsConf
    }

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
            lineType: 'sharp',
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

        // 当前收盘价
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
        // 图表上的信息文字绘制
        this.drawTopInfoTxt(this.chart.kLine.eventHandle.nowIndex)
    }
    // 图表上的信息文字绘制
    drawTopInfoTxt(index: number) {
        // 时间 开 高 低 收 （涨幅 振幅 %）
        const ctx = this.chart.kLine.tc
        const preItem = this.chart.kLine.dataArr[index - 1]
        const nowItem = this.chart.kLine.dataArr[index]
        if (!nowItem) return
        const date = formDate(nowItem.date)
        // 涨幅
        let change: string
        // 振幅
        let ampl: string
        if (preItem) {
            change = (
                ((nowItem.close - preItem.close) / preItem.close) *
                100
            ).toFixed(2)
            ampl = (
                ((nowItem.max - nowItem.min) / preItem.close) *
                100
            ).toFixed(2)
        } else {
            change = '0'
            ampl = '0'
        }
        const infoTxtConf = this.chart.conf.infoTxtConf

        const drawDataTxt = `${this.chart.kLine.lang.date}: ${date}`
        const drawDataTxtWidth = getTxtW(
            ctx,
            drawDataTxt,
            infoTxtConf.size,
            infoTxtConf.family
        )
        drawTxt(ctx, {
            coordinate: this.chart.infoTxtCoordinate,
            txt: drawDataTxt,
            drawStyle: {
                style: infoTxtConf.color,
            },
            fontFamily: infoTxtConf.family,
            fontSize: infoTxtConf.size,
            textBaseline: 'hanging',
            textAlign: 'left',
        })
    }
}
