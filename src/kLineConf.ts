/**
 * 主要是k线的配置相关
 */
import { deepCopy, DefScaleCalcConfig, mergeData } from '@/utils/dataHandle'
import { YConf } from '@/axis/YAxis'
import { DefSectorConfig } from '@/utils/canvasDraw'
import { ChartConfMap, ChartNames } from '@/chart/chartUtils'
import { TimeSharingConf } from '@/indicators/timeSharing'
import { BaseChartConf } from '@/chart/baseChart'
import {
    IndicatorsConfMap,
    IndicatorsNames,
} from '@/indicators/indicatorsUtils'

// item 的宽度 和 空隙
export interface ItemWAndSpace {
    w: number
    space: number
}

// 默认柱子宽度和间隔
const DefItemWAndSpaceList: ItemWAndSpace[] = [
    { w: 2, space: 1 },
    { w: 3, space: 1 },
    { w: 5, space: 2 },
    { w: 7, space: 2 },
    { w: 8, space: 4 },
    { w: 10, space: 4 },
    { w: 12, space: 5 },
    { w: 14, space: 5 },
    { w: 16, space: 6 },
    { w: 18, space: 6 },
]

// 需要的数据格式
export interface DataItem {
    // 收盘价
    close: number
    // 开盘
    open: number
    // 最低
    min: number
    // 最高
    max: number
    // 时间戳
    date: number
    // 成交额
    turnover: number
    [key: string]: any // 由于存储 指标计算出来的值
}

export interface PaddingLR {
    left: number
    right: number
}

export interface PaddingTB {
    top: number
    bottom: number
}

// k线的配置类型
export interface KLineConf {
    itemWAndSpaceList?: ItemWAndSpace[]
    // 柱子宽度和间隔 使用哪一个宽度的下标
    useItemWAndSpaceIndex?: number
    yPadding?: Partial<PaddingLR>
    yConf?: Partial<YConf>
    // 需要显示的图表
    chartShowArr?: ChartNames[]
    // 图表的配置项
    chartConfMap?: Partial<ChartConfMap>
}

// y轴默认配置
const DefYConf: YConf = {
    axisLine: {
        color: '#fff',
        lineW: 1,
    },
    axisMark: {
        lineW: 1,
        len: 4,
    },
    txt: {
        size: 12,
        family: 'Microsoft YaHei',
        color: '#fff',
        deviationY: 2,
    },
    gridLine: {
        color: '#666',
        lineW: 1,
    },
    scaleCalcConfig: DefScaleCalcConfig,
}

// 默认分时图的配置
const DefTimeSharingConf: TimeSharingConf = {}

// 所有指标配置项的集合
const DefIndicatorsConfMap: IndicatorsConfMap = {
    timeSharing: DefTimeSharingConf,
}

// 图表的基础配置
const DefBaseChartConf: BaseChartConf = {
    // 显示那些指标
    indicatorShowArr: undefined,
    // 指标的配置
    indicatorsConfMap: DefIndicatorsConfMap,
    yConf: DefYConf,
}

// 所有图表的配置
const DefChartConfMap: ChartConfMap = {
    mainChart: deepCopy(DefBaseChartConf),
}

export const DefKLineConf: KLineConf = {
    itemWAndSpaceList: DefItemWAndSpaceList,
    useItemWAndSpaceIndex: 5,
    yPadding: { left: 5, right: 5 },
    yConf: DefYConf,
    chartShowArr: ['mainChart'],
    chartConfMap: DefChartConfMap,
}

export function initConf(conf: KLineConf) {
    return mergeData(DefKLineConf, conf || {})
}
