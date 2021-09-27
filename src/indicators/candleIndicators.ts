/**
 * 蜡烛图
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
import {
    CloseIndicators,
    CloseIndicatorsConf,
} from '@/indicators/closeIndicators'
import { getTxtW } from '@/utils/element'
import { deepCopy } from '@/utils/dataHandle'

// 用于控制 柱子的形态，现阶段就 一个
export type ColumnType = 'CandleStick'

export interface CandleIndicatorsConf {
    column?: {
        type?: ColumnType
        lineW?: number
        // 跌是否空心
        fallHollow?: boolean
        // 涨是否空心
        riseHollow?: boolean
    }
    // 影线的配置
    hatching?: {
        lineW?: number
    }
    // 当前价格的线段样式
    nowLine?: {
        lineW?: number
        color?: string
        // 本项存在就是虚线
        lineDash?: number[]
    }
}

// 由于有多个指标， 使用的缓存key 为 cacheKey + MAIndicatorsConfItem.number
const cacheKey = '_candle'
export class CandleIndicators extends BaseIndicators {
    public name: IndicatorsNames = 'candleIndicators'
    public cacheKeyArr: string[] = []

    get conf() {
        return this.chart.conf.indicatorsConfMap[
            this.name
        ] as CandleIndicatorsConf
    }

    calc(item: DataItem, index: number, isMaxValue: boolean) {
        if (!item) return
        this.itemTryMaxMin('max', item, item.max, index, isMaxValue)
        this.itemTryMaxMin('min', item, item.min, index, isMaxValue)
    }

    /**
     * 根据type 绘制柱子
     * @param type
     * @param index 数据下标
     */
    drawColumn(type: ColumnType, index: number) {
        const item = this.chart.kLine.dataArr[index]
        if (!item) return

        const ctx = this.chart.kLine.bc
        const itemW = this.chart.kLine.useItem.w
        const itemWHalf = itemW / 2
        const color = this.chart.kLine.getItemColor(item)
        // const riseFall = this.chart.kLine.getItemRiseFall(item)
        const hollow = this.itemGetHollow(item)

        const topX = this.chart.kLine.xAxis.indexGetX(index)
        const topY = this.chart.YAxis.valueGetY(Math.max(item.open, item.close))

        const bottomY = this.chart.YAxis.valueGetY(
            Math.min(item.open, item.close)
        )

        const maxY = this.chart.YAxis.valueGetY(item.max)
        const minY = this.chart.YAxis.valueGetY(item.min)

        const leftTop: Coordinate = {
            x: Math.ceil(topX - itemWHalf),
            y: topY,
        }
        const rightBottom: Coordinate = {
            x: Math.ceil(topX + itemWHalf),
            y: bottomY,
        }
        const maxTop: Coordinate = {
            x: topX,
            y: maxY,
        }
        const maxBottom: Coordinate = {
            x: topX,
            y: topY,
        }
        const minTop: Coordinate = {
            x: topX,
            y: bottomY,
        }
        const minBottom: Coordinate = {
            x: topX,
            y: minY,
        }
        switch (type) {
            case 'CandleStick':
                // 方块
                drawRect(ctx, {
                    leftTop: leftTop,
                    rightBottom: rightBottom,
                    drawType: hollow ? 'stroke' : 'full',
                    drawStyle: {
                        w: this.conf.column.lineW,
                        style: color,
                    },
                })
                // 影线
                drawLine(ctx, maxBottom, maxTop, {
                    w: this.conf.hatching.lineW,
                    style: color,
                })
                drawLine(ctx, minBottom, minTop, {
                    w: this.conf.hatching.lineW,
                    style: color,
                })
        }
    }
    // 获取这个item 是不是空心
    itemGetHollow(item: DataItem) {
        const riseFall = this.chart.kLine.getItemRiseFall(item)
        return (
            (riseFall === 'rise' && this.conf.column.riseHollow) ||
            (riseFall === 'fall' && this.conf.column.fallHollow)
        )
    }
    drawBottom() {
        for (
            let i = this.chart.kLine.drawSIndex;
            i <= this.chart.kLine.drawEIndex;
            i++
        ) {
            this.drawColumn(this.conf.column.type, i)
        }
    }
    drawTop() {
        CloseIndicators.prototype.drawTop.call(this)
    }

    drawTopInfoTxt(index: number) {
        CloseIndicators.prototype.drawTopInfoTxt.call(this, index)
    }
}
