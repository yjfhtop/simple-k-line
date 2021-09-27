/**
 * 主要是k线的配置相关
 */
import { deepCopy, DefScaleCalcConfig, mergeData } from '@/utils/dataHandle'
import { YConf } from '@/axis/yAxis'
import { DefSectorConfig } from '@/utils/canvasDraw'
import { ChartConfMap } from '@/chart/chartUtils'
import {
    CloseIndicators,
    CloseIndicatorsConf,
} from '@/indicators/closeIndicators'
import { BaseChartConf } from '@/chart/baseChart'
import {
    IndicatorsConfMap,
    IndicatorsNames,
} from '@/indicators/indicatorsUtils'
import { XConf } from '@/axis/xAxis'
import { CrossConf } from '@/cross/index'
import { BaseToolConf } from '@/tool/baseTool'
import { MAIndicatorsConf } from '@/indicators/maIndicators'
import SimpleKLine from '@/index'
import { determineLang, LangType } from '@/lang/utils'
import { CandleIndicatorsConf } from '@/indicators/candleIndicators'
// import { MainChartConf } from '@/chart/mainChart'

// item 的宽度 和 空隙
export interface ItemWAndSpace {
    w: number
    space: number
}

// 默认柱子宽度和间隔
const DefItemWAndSpaceList: ItemWAndSpace[] = [
    { w: 1, space: 1 },
    { w: 3, space: 2 },
    { w: 5, space: 2 },
    { w: 7, space: 2 },
    { w: 9, space: 4 },
    { w: 11, space: 4 },
    { w: 13, space: 5 },
    { w: 15, space: 5 },
    { w: 17, space: 6 },
    { w: 19, space: 6 },
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

// 涨跌颜色
export interface RiseFallColor {
    riseColor?: string
    fallColor?: string
}
export const DefRiseFallColor: RiseFallColor = {
    riseColor: 'rgba(235, 73, 89, 1)',
    fallColor: 'rgba(80, 186, 133, 1)',
}

// 图表上的文字信息， 比如 时间， 涨幅...
export interface InfoTxtConf {
    // 绘制开始x偏移
    deviationX?: number
    // 绘制开始Y偏移
    deviationY?: number
    size?: number
    family?: string
    color?: string
    // 同一行 不同文字段的间隔
    xSpace?: number
    // 不同行的间隔
    ySpace?: number
}

export const DefInfoTxtConf: InfoTxtConf = {
    deviationX: 5,
    deviationY: 5,
    size: 12,
    color: '#ccc',
    xSpace: 4,
    ySpace: 4,
}

// k线的配置类型-------------------------------------------------------------
export interface KLineConf {
    // 显示的小数位
    showDecimalPlaces?: number
    lang?: LangType
    bgc?: string
    infoTxtConf?: InfoTxtConf
    minItem?: number
    riseFallColor?: RiseFallColor
    itemWAndSpaceList?: ItemWAndSpace[]
    // 柱子宽度和间隔 使用哪一个宽度的下标, 仅在实例化时有效
    useItemWAndSpaceIndex?: number
    yPadding?: Partial<PaddingLR>
    yConf?: YConf
    xConf?: XConf
    // 需要显示的图表
    chartShowArr?: string[]
    // 图表的配置项
    chartConfMap?: Partial<ChartConfMap>
    crossConf?: CrossConf
    // 工具的基础配置
    toolConf?: BaseToolConf
}

const DefToolConf: BaseToolConf = {
    dot: {
        bigR: 5,
        smallR: 3,
        color: '#fff',
        activeColor: '#1661ab',
    },
    line: {
        lineW: 1,
        color: '#fff',
        inLineW: 8,
        activeLineDash: [2, 2],
    },
}

const DefCrossConf: CrossConf = {
    line: {
        lineW: 1,
        color: '#ccc',
        lineDash: [3, 1],
    },
    nowHighlight: {
        bgc: '#ccc',
        font: {
            size: 12,
            color: '#000',
        },
        yH: 24,
        xW: 120,
    },
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
        color: '#fff',
    },
    txt: {
        size: 12,
        family: 'Microsoft YaHei',
        color: '#fff',
        deviationX: 4,
    },
    gridLine: {
        color: '#2c2c2c',
        lineW: 1,
    },
    scaleCalcConfig: DefScaleCalcConfig,
}

// 默认 close 配置
const DefCloseIndicatorsConf: CloseIndicatorsConf = {
    lineW: 1,
    color: 'rgb(32, 145, 234)',
    nowLine: {
        lineW: 1,
        color: 'rgb(32, 145, 234)',
        lineDash: [2, 2],
    },
    // nowHighlight: {
    //     bgc: 'rgb(32, 145, 234)',
    //     font: {
    //         size: 12,
    //         color: '#fff',
    //     },
    //     h: 24,
    // },
}

const DefMAIndicatorsConf: MAIndicatorsConf = [
    {
        lineW: 1,
        color: '#F8E71C',
        show: true,
        number: 7,
    },
    {
        lineW: 1,
        color: '#50E3C2',
        show: false,
        number: 30,
    },
    {
        lineW: 1,
        color: '#F600FF',
        show: false,
        number: 60,
    },
]

const DefCandleIndicatorsConf: CandleIndicatorsConf = {
    column: {
        type: 'CandleStick',
        lineW: 1,
        fallHollow: false,
        riseHollow: false,
    },
    hatching: {
        lineW: 1,
    },
}

// 所有指标配置项的集合---------------------------------------------
const DefIndicatorsConfMap: IndicatorsConfMap = {
    closeIndicators: DefCloseIndicatorsConf,
    maIndicators: DefMAIndicatorsConf,
    candleIndicators: DefCandleIndicatorsConf,
}

// 图表的基础配置
const DefBaseChartConf: BaseChartConf = {
    // 显示那些指标
    indicatorShowArr: undefined,
    // 指标的配置
    indicatorsConfMap: DefIndicatorsConfMap,
    yConf: DefYConf,
    infoTxtConf: DefInfoTxtConf,
}

const DefMainChartConf: BaseChartConf = deepCopy(DefBaseChartConf)
// DefMainChartConf.indicatorShowArr = ['closeIndicators', 'maIndicators']
DefMainChartConf.indicatorShowArr = ['candleIndicators']

// 所有图表的配置
const DefChartConfMap: ChartConfMap = {
    mainChart: DefMainChartConf,
}

// 默认 x轴的配置项
const DefXConf: XConf = {
    h: 24,
    axisLine: {
        color: '#fff',
        lineW: 1,
    },
    axisMark: {
        lineW: 1,
        len: 4,
        color: '#fff',
    },
    txt: {
        size: 12,
        family: 'Microsoft YaHei',
        color: '#fff',
        deviationY: 2,
    },
    gridLine: {
        color: '#2c2c2c',
        lineW: 1,
    },
}

export const DefKLineConf: KLineConf = {
    showDecimalPlaces: 2,
    lang: 'zh-CN',
    bgc: '#000',
    minItem: 5,
    infoTxtConf: DefInfoTxtConf,
    riseFallColor: DefRiseFallColor,
    itemWAndSpaceList: DefItemWAndSpaceList,
    useItemWAndSpaceIndex: 5,
    yPadding: { left: 10, right: 10 },
    yConf: DefYConf,
    chartShowArr: ['mainChart'],
    chartConfMap: DefChartConfMap,
    xConf: DefXConf,
    crossConf: DefCrossConf,
    toolConf: DefToolConf,
}

export function initConf(conf: KLineConf, kLine: SimpleKLine) {
    const c = mergeData(DefKLineConf, conf || {})
    // 保证主图是第一个 s
    const mainChartIndex = c.chartShowArr.indexOf('mainChart')
    if (mainChartIndex < 0) {
        c.chartShowArr.unshift('mainChart')
    }
    if (mainChartIndex > 0) {
        c.chartShowArr.splice(mainChartIndex, 1)
        c.chartShowArr.unshift('mainChart')
    }
    // 保证主图是第一个 e

    // infoTxtConf 映射到 图表的配置 s
    Object.keys(c.chartConfMap).forEach((key) => {
        const charConf = c.chartConfMap[key]
        charConf.infoTxtConf = mergeData(c.infoTxtConf, charConf.infoTxtConf)
    })
    // infoTxtConf 映射到 图表的配置 e

    kLine.conf = c
    kLine.lang = determineLang(c.lang)
    return c
}
