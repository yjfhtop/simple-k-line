/**
 * 分时图
 */
import { DataItem } from '@/kLineConf'
import { BaseIndicators } from '@/indicators/baseIndicators'
import { IndicatorsNames } from '@/indicators/indicatorsUtils'

// 分时图的配置项
export interface TimeSharingConf {}

export class TimeSharing extends BaseIndicators {
    public name: IndicatorsNames = 'timeSharing'

    calc(item: DataItem, index: number, isMaxValue: boolean) {
        if (!item) return
        const cacheKey = 'timeSharing'
        let useValue = item[cacheKey]
        if (useValue === undefined) {
            useValue = item.close
            this.cacheData(cacheKey, item, useValue, index, isMaxValue)
        }
        this.itemTryMaxMin(cacheKey, item, useValue, index, isMaxValue)
    }
    drawBottom() {}
    drawTop() {}
}
