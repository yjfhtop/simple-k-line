/**
 * VOL 指标
 */
import { DataItem } from '@/kLineConf'
import { IndicatorsNames } from '@/indicators/indicatorsUtils'
import {
    BaseMultipleIndicators,
    BaseMultipleIndicatorsItem,
    CalcShowItem,
    TxtAndColor,
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

    calc(item: DataItem, index: number, isMaxValue: boolean) {
        super.calc(item, index, isMaxValue)

        this.itemTryMaxMin('turnover', item, item.turnover, index, isMaxValue)
    }

    drawBottom() {
        for (
            let i = this.chart.kLine.drawSIndex;
            i <= this.chart.kLine.drawEIndex;
            i++
        ) {
            const item = this.chart.kLine.dataArr[i]
            if (!item) continue
            this.drawBottomColumn(i, 'turnover')
        }
        super.drawBottom()
    }

    drawTopInfoTxtBefore(
        index: number,
        txtArr: TxtAndColor[],
        nowItem: DataItem
    ) {
        const v = nowItem['turnover'].toFixed(
            this.chart.kLine.conf.showDecimalPlaces
        )
        if (!v) return
        txtArr.splice(1, 0, {
            txt: `${this.topInfoName}: ${v}`,
        })
    }
}
