import { MainChart, MainChartConf } from '@/chart/mainChart'
import { BaseChart, BaseChartConf } from '@/chart/baseChart'
import SimpleKLine from '@/index'
import { Coordinate } from '@/utils/canvasDraw'

export interface ChartMap {
    mainChart?: MainChart
}

export interface ChartConfMap {
    mainChart?: MainChartConf
}

export type ChartNames = keyof ChartMap

/**
 * 创建图表
 * @param name 图表名称
 * @param kLine
 * @param topY
 * @param chartH
 * @constructor
 */
export function createChart<T = BaseChart>(
    name: ChartNames,
    kLine: SimpleKLine,
    topY: number,
    chartH: number
): T {
    switch (name) {
        case 'mainChart':
            return new MainChart(kLine, topY, chartH) as any as T
    }
}
