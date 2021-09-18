import { DataItem } from '@/kLineConf'
import { BaseChart } from '@/chart/baseChart'
import { IndicatorsNames } from '@/indicators/indicatorsUtils'

/**
 *指标的基础类
 */

export abstract class BaseIndicators {
    // 指标的名称
    public abstract name: IndicatorsNames

    // 最大最小值的下标
    public maxIndex = -1
    public minIndex = -1

    // 最大最小值对应存储的key
    public maxIndexCacheKey = ''
    public minIndexCacheKey = ''
    constructor(public chart: BaseChart) {
        // this.chart = chart
    }

    // 计算指标需要的数据, 可能这个指标有多条（数据），那么就应该便利循环
    abstract calc(item: DataItem, index: number, isMaxValue: boolean): void

    // 缓存指标
    cacheData(
        cacheKey: string,
        item: DataItem,
        value: number,
        index: number,
        isMaxValue: boolean
    ) {
        item[cacheKey] = value
    }
    // 指标的绘制方法
    abstract drawBottom(): void
    abstract drawTop(): void

    drawAll() {
        this.drawBottom()
        this.drawTop()
    }

    get conf() {
        return this.chart.conf.indicatorsConfMap[this.name]
    }

    // 最大值
    get maxValue() {
        return (
            (this.chart.kLine.dataArr[this.maxIndex] &&
                this.chart.kLine.dataArr[this.maxIndex][
                    this.maxIndexCacheKey
                ]) ||
            Number.MIN_VALUE
        )
    }

    // 最小值
    get minValue() {
        return (
            (this.chart.kLine.dataArr[this.minIndex] &&
                this.chart.kLine.dataArr[this.minIndex][
                    this.minIndexCacheKey
                ]) ||
            Number.MAX_VALUE
        )
    }

    // 当前的 item  尝试是否为最大值或者最小值
    itemTryMaxMin(
        cacheKey: string,
        item: DataItem,
        value: number,
        index: number,
        isMaxValue: boolean
    ) {
        if (isMaxValue) {
            // 最大值变化
            if (value >= this.maxValue) {
                this.maxIndex = index
                this.maxIndexCacheKey = cacheKey
            }

            if (value <= this.minValue) {
                // 最小值变化
                this.minIndex = index
                this.minIndexCacheKey = cacheKey
            }
        }
    }
}
