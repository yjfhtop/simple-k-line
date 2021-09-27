import {
    CloseIndicators,
    CloseIndicatorsConf,
} from '@/indicators/closeIndicators'
import { BaseIndicators } from '@/indicators/baseIndicators'
import { BaseChart } from '@/chart/baseChart'
import { MAIndicators, MAIndicatorsConf } from '@/indicators/maIndicators'
import {
    CandleIndicators,
    CandleIndicatorsConf,
} from '@/indicators/candleIndicators'

// 指标的映射
export interface IndicatorsMap {
    closeIndicators?: CloseIndicators
    maIndicators?: MAIndicators
    candleIndicators?: CloseIndicators
}

// 指标的配置项
export interface IndicatorsConfMap {
    closeIndicators?: CloseIndicatorsConf
    maIndicators?: MAIndicatorsConf
    candleIndicators?: CandleIndicatorsConf
}

export type IndicatorsNames = keyof IndicatorsMap

/**
 * 创建 指标
 * @param name
 * @param chart
 */
export function createIndicators<T = BaseIndicators>(
    name: IndicatorsNames,
    chart: BaseChart
): T {
    switch (name) {
        case 'closeIndicators':
            return new CloseIndicators(chart) as any as T
        case 'maIndicators':
            return new MAIndicators(chart) as any as T
        case 'candleIndicators':
            return new CandleIndicators(chart) as any as T
    }
}
