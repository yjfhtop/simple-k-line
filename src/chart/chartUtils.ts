import { BaseChart, BaseChartConf } from '@/chart/baseChart'
import SimpleKLine from '@/index'

export interface ChartMap {
    [key: string]: BaseChart
}

export interface ChartConfMap {
    [key: string]: BaseChartConf
}

// export type ChartNames = keyof ChartMap

/**
 * 创建图表
 * @param name 图表名称
 * @param kLine
 * @param topY
 * @param chartH
 * @constructor
 */
export function createChart(
    name: string,
    kLine: SimpleKLine,
    topY: number,
    chartH: number
) {
    return new BaseChart(name, kLine, topY, chartH)
}
