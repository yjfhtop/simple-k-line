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
 * @param name
 * @param kLine
 * @param position
 * @constructor
 */
export function CreateChart<T = BaseChart>(
    name: ChartNames,
    kLine: SimpleKLine,
    position: { leftTop: Coordinate; rightBottom: Coordinate }
): T {
    switch (name) {
        case 'mainChart':
            return new MainChart(kLine, position) as any as T
    }
}
