/**
 * 分时图
 */
import { DataItem } from '@/kLineConf'
import { BaseIndicators } from '@/indicators/baseIndicators'

export class TimeSharing extends BaseIndicators {
    public name: string = 'TimeSharing'

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
    draw() {}
}
