/**
 * MA 移动平均线指标
 */
import { DataItem } from '@/kLineConf'
import { IndicatorsNames } from '@/indicators/indicatorsUtils'
import {
    BaseMultipleIndicators,
    BaseMultipleIndicatorsItem,
    CalcShowItem,
} from '@/indicators/baseMultipleIndicators'

// close的配置项
export interface MAIndicatorsConfItem extends BaseMultipleIndicatorsItem {}

export type MAIndicatorsConf = MAIndicatorsConfItem[]

// 由于有多个指标， 使用的缓存key 为 this.cacheKey + MAIndicatorsConfItem.number
export class MAIndicators extends BaseMultipleIndicators {
    public name: IndicatorsNames = 'maIndicators'
    public cacheKeyArr: string[] = []
    public cacheKey = '_MA'
    public topInfoName = 'MA'

    get conf() {
        return this.chart.conf.indicatorsConfMap[this.name] as MAIndicatorsConf
    }

    calcItem(
        calcShowItem: CalcShowItem,
        item: DataItem,
        index: number,
        isMaxValue: boolean
    ): number {
        const data = this.calcAverage(calcShowItem.conf.number, index, 'close')
        return data
    }
}
