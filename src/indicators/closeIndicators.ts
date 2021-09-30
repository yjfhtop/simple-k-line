/**
 * close 指标, 分时？？ 大概
 */
import { DataItem } from '@/kLineConf'
import { BaseIndicators } from '@/indicators/baseIndicators'
import { IndicatorsNames } from '@/indicators/indicatorsUtils'
import {
    Coordinate,
    drawBrokenLine,
    drawLine,
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

// const this.cacheKey = '_close'
export class CloseIndicators extends BaseIndicators {
    public name: IndicatorsNames = 'closeIndicators'
    public cacheKeyArr: string[] = []
    public cacheKey = '_close'

    get conf() {
        return this.chart.conf.indicatorsConfMap[
            this.name
        ] as CloseIndicatorsConf
    }

    calc(item: DataItem, index: number, isMaxValue: boolean) {
        // 这个是示列
        if (!item) return

        this.cacheKeyArr.push(this.cacheKey)
        let useValue = item[this.cacheKey]
        if (
            useValue === undefined ||
            index === this.chart.kLine.dataArr.length - 1
        ) {
            useValue = item.close
            this.cacheData(this.cacheKey, item, useValue, index, isMaxValue)
        }
        this.itemTryMaxMin(this.cacheKey, item, useValue, index, isMaxValue)
    }
    drawBottom() {
        const dotArr: Coordinate[] = []
        for (
            let i = this.chart.kLine.drawSIndex;
            i <= this.chart.kLine.drawEIndex;
            i++
        ) {
            const item = this.chart.kLine.dataArr[i]
            if (item && item[this.cacheKey] !== undefined) {
                const x = this.chart.kLine.xAxis.indexGetX(i)
                const y = this.chart.YAxis.valueGetY(item[this.cacheKey])
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
        const nowItem = this.chart.kLine.dataArr[index]
        const preItem = this.chart.kLine.dataArr[index - 1] || nowItem
        const showDecimalPlaces = this.chart.kLine.conf.showDecimalPlaces
        if (!nowItem) return
        const date = formDate(nowItem.date)
        // 涨幅
        let change: string
        // 振幅
        let ampl: string
        change = (
            ((nowItem.close - preItem.close) / preItem.close) *
            100
        ).toFixed(showDecimalPlaces)
        ampl = (((nowItem.max - nowItem.min) / preItem.close) * 100).toFixed(
            showDecimalPlaces
        )
        const infoTxtConf = this.chart.conf.infoTxtConf

        const drawDataTxt = `${this.chart.kLine.lang.date}: ${date}`

        const riseFallColor = this.chart.kLine.conf.riseFallColor
        const lang = this.chart.kLine.lang
        const color: string = this.chart.kLine.getItemColor(nowItem)
        // 时间 开 高 低 收 （涨幅 振幅 %）
        const afterStr = ': '
        const txtArr: { txt: string; color?: string }[][] = [
            [
                {
                    txt: drawDataTxt,
                },
            ],
            [
                {
                    txt: lang.open + afterStr,
                },
                {
                    txt: nowItem.open.toFixed(showDecimalPlaces),
                    color,
                },
            ],
            [
                {
                    txt: lang.height + afterStr,
                },
                {
                    txt: nowItem.max.toFixed(showDecimalPlaces),
                    color,
                },
            ],
            [
                {
                    txt: lang.low + afterStr,
                },
                {
                    txt: nowItem.min.toFixed(showDecimalPlaces),
                    color,
                },
            ],
            [
                {
                    txt: lang.close + afterStr,
                },
                {
                    txt: nowItem.close.toFixed(showDecimalPlaces),
                    color,
                },
            ],
            [
                {
                    txt: lang.change + afterStr,
                },
                {
                    txt: change + '%',
                    color,
                },
            ],
            [
                {
                    txt: lang.ampl + afterStr,
                },
                {
                    txt: ampl + '%',
                    color,
                },
            ],
        ]

        txtArr.forEach((item) => {
            item.forEach((cItem) => {
                const txtLen = getTxtW(
                    ctx,
                    cItem.txt,
                    infoTxtConf.size,
                    infoTxtConf.family
                )
                drawTxt(ctx, {
                    coordinate: this.chart.infoTxtCoordinate,
                    txt: cItem.txt,
                    drawStyle: {
                        style: cItem.color || infoTxtConf.color,
                    },
                    fontFamily: infoTxtConf.family,
                    fontSize: infoTxtConf.size,
                    textBaseline: 'top',
                    textAlign: 'left',
                })
                this.chart.infoTxtCoordinate.x += txtLen
            })

            this.chart.infoTxtCoordinate.x += infoTxtConf.xSpace
        })
        this.chart.infoTxtCoordinate.y += infoTxtConf.size + infoTxtConf.ySpace
        this.chart.initInfoTxtCoordinateX()
    }
}
