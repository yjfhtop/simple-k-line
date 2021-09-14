/**
 * 主要是k线的配置相关
 */
import {mergeData} from "@/utils/dataHandle";

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
    close: number
    open: number
    min: number
    max: number
    date: number // 时间戳
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
    yPadding?: PaddingLR
}

export const DefKLineConf: KLineConf = {
    itemWAndSpaceList: DefItemWAndSpaceList,
    useItemWAndSpaceIndex: 5,
    yPadding: { left: 5, right: 5 },
}

export function initConf(conf: KLineConf) {
    return mergeData(DefKLineConf, conf || {})
}
