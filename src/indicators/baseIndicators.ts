import { DataItem } from '@/kLineConf'
import { BaseChart } from '@/chart/baseChart'
import { IndicatorsNames } from '@/indicators/indicatorsUtils'

/**
 *指标的基础类
 */

export abstract class BaseIndicators {
    // 子类实现
    // 指标的名称
    public abstract name: IndicatorsNames
    public abstract cacheKey: string
    // 用于 顶部文字的绘制
    public abstract topInfoName: string
    // 子类实现

    public cacheKeyArr: string[]

    // 最大最小值的下标
    public maxIndex = -1
    public minIndex = -1

    // 最大最小值对应存储的key
    public maxIndexCacheKey = ''
    public minIndexCacheKey = ''

    constructor(public chart: BaseChart) {
        // this.chart = chart
    }

    abstract get conf(): any

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
        if (value === undefined || value === null) return
        item[cacheKey] = value
    }
    // 子类实现 指标的绘制方法
    abstract drawBottom(): void
    abstract drawTop(): void
    // 子类实现 指标的绘制方法

    drawAll() {
        this.drawBottom()
        this.drawTop()
    }

    // get conf() {
    //     return this.chart.conf.indicatorsConfMap[this.name]
    // }
    // 在每次计算时调用
    clearMaxMin() {
        this.maxIndex = -1
        this.minIndex = -1
        this.maxIndexCacheKey = ''
        this.minIndexCacheKey = ''
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
        if (value === undefined || value === null) return
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

    // len 求几个的平均数，  结束的下标（从这个下标往前）, key 是缓存的key
    calcAverage(len: number, index: number, key: string): number {
        if (index >= len - 1) {
            const sIndex = index - len + 1
            let sum = 0
            for (let i = sIndex; i <= index; i++) {
                const item = this.chart.kLine.dataArr[i]
                sum += item[key] || 0
            }
            return parseFloat(
                (sum / len).toFixed(this.chart.kLine.conf.showDecimalPlaces)
            )
        } else {
            return undefined
        }
    }
}
