/**
 * VOL 指标
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
import {
    BaseMultipleIndicators,
    BaseMultipleIndicatorsItem,
    CalcShowItem,
} from '@/indicators/baseMultipleIndicators'
export interface VolumeIndicatorsItem extends BaseMultipleIndicatorsItem {}

export type VolumeIndicatorsConf = VolumeIndicatorsItem[]

// 由于有多个指标， 使用的缓存key 为 cacheKey + MAIndicatorsConfItem.number
const cacheKey = ''
export class VolumeIndicators extends BaseMultipleIndicators {
    public name: IndicatorsNames = 'volumeIndicators'
    public cacheKeyArr: string[] = []
    public topInfoName = 'VOLUME'
    public cacheKey = '_VOLUME'

    calcItem(
        calcShowItem: CalcShowItem,
        item: DataItem,
        index: number,
        isMaxValue: boolean
    ): number {
        const data = this.calcAverage(
            calcShowItem.conf.number,
            index,
            'turnover'
        )
        return data
    }
}
