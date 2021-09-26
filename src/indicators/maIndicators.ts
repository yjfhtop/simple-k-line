/**
 * MA 移动平均线指标
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
import { CloseIndicatorsConf } from '@/indicators/closeIndicators'
import { getTxtW } from '@/utils/element'
import { deepCopy } from '@/utils/dataHandle'
// close的配置项
export interface MAIndicatorsConfItem {
    lineW: number
    color: string
    show?: boolean
    number: number
}

export type MAIndicatorsConf = MAIndicatorsConfItem[]

// 由于有多个指标， 使用的缓存key 为 cacheKey + MAIndicatorsConfItem.number
const cacheKey = '_MA'
export class MAIndicators extends BaseIndicators {
    public name: IndicatorsNames = 'maIndicators'
    public cacheKeyArr: string[] = []

    get conf() {
        return this.chart.conf.indicatorsConfMap[this.name] as MAIndicatorsConf
    }

    calc(item: DataItem, index: number, isMaxValue: boolean) {
        if (!item) return
        this.conf.forEach((itemConf) => {
            if (!itemConf.show) return
            const useCacheKey = cacheKey + itemConf.number
            let useValue = item[useCacheKey]
            // 需要计算
            if (
                useValue === undefined ||
                index === this.chart.kLine.dataArr.length - 1
            ) {
                useValue = this.calcAverage(itemConf.number, index)
                // 不足以计算
                if (useValue === undefined) {
                    return
                } else {
                    // 缓存
                    this.cacheData(
                        useCacheKey,
                        item,
                        useValue,
                        index,
                        isMaxValue
                    )
                    // 尝试计算最大最下值
                    this.itemTryMaxMin(
                        useCacheKey,
                        item,
                        useValue,
                        index,
                        isMaxValue
                    )
                }
            }
        })
    }

    // len 求几个的平均数，  结束的下标（从这个下标往前）
    calcAverage(len: number, index: number): number {
        if (index >= len - 1) {
            const sIndex = index - len + 1
            let sum = 0
            for (let i = sIndex; i <= index; i++) {
                const item = this.chart.kLine.dataArr[i]
                sum += item.close || 0
            }
            return sum / len
        } else {
            return undefined
        }
    }
    drawBottom() {
        const dataArr: {
            key: string
            conf: MAIndicatorsConfItem
            dotArr: Coordinate[]
        }[] = []
        this.conf.forEach((conf) => {
            if (!conf.show) return
            const key = cacheKey + conf.number
            dataArr.push({
                key,
                conf,
                dotArr: [],
            })
        })
        for (
            let i = this.chart.kLine.drawSIndex;
            i <= this.chart.kLine.drawEIndex;
            i++
        ) {
            const item = this.chart.kLine.dataArr[i]
            if (!item) continue
            dataArr.forEach((citem: any) => {
                const key = citem.key
                const v = item[key]
                if (v === undefined) {
                    return
                }
                citem.dotArr.push({
                    x: this.chart.kLine.xAxis.indexGetX(i),
                    y: this.chart.YAxis.valueGetY(v),
                })
            })
        }

        const cxt = this.chart.kLine.bc
        dataArr.forEach((item) => {
            drawBrokenLine(cxt, item.dotArr, {
                lineType: 'sharp',
                drawStyle: {
                    w: item.conf.lineW,
                    style: item.conf.color,
                },
            })
        })
    }
    drawTop() {
        this.drawTopInfoTxt(this.chart.kLine.eventHandle.nowIndex)
    }

    drawTopInfoTxt(index: number) {
        const ctx = this.chart.kLine.tc
        const nowItem = this.chart.kLine.dataArr[index]
        const infoTxtConf = this.chart.conf.infoTxtConf
        const showArr: {
            key: string
            conf: MAIndicatorsConfItem
        }[] = []
        this.conf.forEach((conf) => {
            if (!conf.show) return
            const key = cacheKey + conf.number
            showArr.push({
                key,
                conf,
            })
        })

        if (showArr.length === 0) return

        const txtArr: { txt: string; color?: string }[] = [
            {
                txt: `MA(${showArr.map((item) => item.key).join(',')})`,
            },
        ]

        showArr.forEach((item) => {
            const key = item.key
            const value = nowItem[key]
            if (value === undefined) return

            const txt = `MA(${item.conf.number}): ${value.toFixed(2)}`
            const color = item.conf.color

            txtArr.push({
                txt,
                color,
            })
        })

        txtArr.forEach((item) => {
            const txtLen = getTxtW(
                ctx,
                item.txt,
                infoTxtConf.size,
                infoTxtConf.family
            )
            drawTxt(ctx, {
                coordinate: this.chart.infoTxtCoordinate,
                txt: item.txt,
                drawStyle: {
                    style: item.color || infoTxtConf.color,
                },
                fontFamily: infoTxtConf.family,
                fontSize: infoTxtConf.size,
                textBaseline: 'top',
                textAlign: 'left',
            })
            this.chart.infoTxtCoordinate.x += txtLen + infoTxtConf.xSpace
        })

        this.chart.infoTxtCoordinate.y += infoTxtConf.size + infoTxtConf.ySpace
        this.chart.initInfoTxtCoordinateX()
    }
}
