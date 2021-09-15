/**
 * 主图
 */
import { BaseChart, BaseChartConf } from '@/chart/baseChart'
import KLine from '@/index'
import { Coordinate, drawRect } from '@/utils/canvasDraw'
import { ChartNames } from '@/chart/chartUtils'

export interface MainChartConf extends BaseChartConf {}

export class MainChart extends BaseChart {
    public name: ChartNames = 'mainChart'
    constructor(
        public kLine: KLine,
        position: { leftTop: Coordinate; rightBottom: Coordinate }
    ) {
        super(kLine, position)
    }
}
