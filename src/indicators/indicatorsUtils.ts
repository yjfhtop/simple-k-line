import { TimeSharing, TimeSharingConf } from '@/indicators/timeSharing'
import { BaseIndicators } from '@/indicators/baseIndicators'
import { BaseChart } from '@/chart/baseChart'

// 指标的映射
export interface IndicatorsMap {
    timeSharing?: TimeSharing
}

// 指标的配置项
export interface IndicatorsConfMap {
    timeSharing?: TimeSharingConf
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
        case 'timeSharing':
            return new TimeSharing(chart) as any as T
    }
}
