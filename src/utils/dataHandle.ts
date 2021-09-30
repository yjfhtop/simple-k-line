import { getDataType } from '@/utils/index'

/**
 * 数据处理
 */

/**
 * 深度克隆
 * @param data
 */
export function deepCopy<T>(data: T): T {
    // 存储引用数据, 用于判断是否有循环引用
    const reMap = new Map()

    function copy<T>(data: T): T {
        const typeStr = getDataType(data)
        switch (typeStr) {
            case 'Array':
            case 'Object':
                // 处理循环引用 s
                if (reMap.has(data)) {
                    return reMap.get(data)
                }
                // 处理循环引用 e
                const useData: any = data
                let newData: any = []
                if (typeStr === 'Array') {
                    newData = []
                    // 处理循环引用 s
                    reMap.set(data, newData)
                    // 处理循环引用 e
                    for (let i = 0; i < useData.length; i++) {
                        newData[i] = copy(useData[i])
                    }
                } else {
                    newData = {}
                    // 处理循环引用 s
                    reMap.set(data, newData)
                    // 处理循环引用 e
                    Object.keys(useData).forEach((key) => {
                        newData[key] = copy(useData[key])
                    })
                }
                return newData
            case 'Boolean':
            case 'Function':
            case 'Null':
            case 'Number':
            case 'String':
            case 'Undefined':
                return data
        }
    }

    return copy(data)
}

/**
 * 合并数据, 只有新旧数据都是 obj 类型才生效(key 对应的 value 也是这样)， 否则，一直返回新数据
 * @param oldData
 * @param newData
 * @param copy 是否copy数据， 脱离引用
 */
export function mergeData<T>(oldData: T, newData: T, copy = true): T {
    if (copy) {
        oldData = deepCopy(oldData)
        newData = deepCopy(newData)
    }
    function merge<T>(oldData: any, newData: any): T {
        const oldTypeStr = getDataType(oldData)
        const newTypeStr = getDataType(newData)

        if (newTypeStr === 'Object' && oldTypeStr === 'Object') {
            Object.keys(newData).forEach((key: string) => {
                if (newData[key] !== undefined) {
                    oldData[key] = merge(oldData[key], newData[key])
                }
            })
            return oldData
        } else if (newData === undefined) {
            return oldData
        } else {
            return newData
        }
    }
    return merge(oldData, newData)
}

export interface IndexAndVal<T> {
    index: number
    val: T
}

export interface MinMax<T> {
    min: IndexAndVal<T>
    max: IndexAndVal<T>
}

export type CompareType = 'max' | 'min'

function defCompare<T>(item1: T, item2: T, type: CompareType): boolean {
    if (type === 'max') {
        return item1 >= item2
    } else if (type === 'min') {
        return item1 <= item2
    }
}

// 计算刻度
interface CalcTimeConf {
    // 最小刻度的宽度
    minScaleW: number
    // 最小刻度数目
    minNumber: number
}

const CalcTimeConfDef = {
    minScaleW: 70,
    minNumber: 3,
}

/**
 * 计算轴标的个数
 * @param w
 * @param itemW
 * @param conf
 */
export function calcScaleNumber(
    w: number,
    itemW: number,
    conf: CalcTimeConf = { ...CalcTimeConfDef }
) {
    conf = mergeData(CalcTimeConfDef, conf)
    // 不包含首尾， 3个空隙只有2个刻度
    conf.minNumber++
    // 一个刻度内 最小的item 个数
    const minScaleInsideItemNumber = Math.ceil(conf.minScaleW / itemW)
    // 一个刻度内 最多 的item 个数
    let maxScaleInsideItemNumber = minScaleInsideItemNumber
    // 最多的刻度数目
    const maxNumber = Math.floor(w / (minScaleInsideItemNumber * itemW))

    // 刻度的实际数目
    let useNumber = maxNumber
    // 一个刻度内 实际 的item 个数
    let useScaleInsideItemNumber = maxScaleInsideItemNumber

    if (maxNumber > conf.minNumber) {
        for (
            maxScaleInsideItemNumber;
            w / (maxScaleInsideItemNumber * itemW) > conf.minNumber;
            maxScaleInsideItemNumber++
        ) {
            // pass
        }
        maxScaleInsideItemNumber--
        useScaleInsideItemNumber = Math.floor(
            maxScaleInsideItemNumber * 0.3 + minScaleInsideItemNumber * 0.7
        )

        useNumber = Math.floor(w / (itemW * useScaleInsideItemNumber))
    }

    return {
        // 一个轴标的宽度
        scaleW: itemW * useScaleInsideItemNumber,
        // 轴标的数量
        number: useNumber,
        // 一个轴标内 小轴标的数目
        useScaleInsideItemNumber,
        // 一个轴标内 最大的个数
        maxScaleInsideItemNumber,
        // 一个轴标内，最小的个数
        minScaleInsideItemNumber,
    }
}

// 是否正负对称的枚举 null 不需要处理  auto如果为本项 且最大 为正， 最小为负 则会出现对称   force无论如何，都需要对称
export type SymmetricalType = 'null' | 'auto' | 'force'

export interface ScaleCalcConfig {
    // 是否正负对称
    symmetrical?: SymmetricalType
    // 是否必须出现 0 刻度， 这个比较适合 柱状图
    zeroMust?: boolean
    magicArr?: number[]
}
// 默认值
export const DefScaleCalcConfig: ScaleCalcConfig = {
    symmetrical: 'null',
    zeroMust: false,
    // 最大值必须大于100, 魔术数组用于生成刻度间隙
    magicArr: [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100],
}

// 刻度数据
export interface ScaleData {
    max: number
    min: number
    step: number
}

/**
 * 刻度计算, 用于规范刻度之间的差值
 * @param max 最大值
 * @param min 最小值
 * @param scaleNumber 轴线数目 尽量靠近（不是绝对）
 * @param config
 */
export function scaleCalc(
    max: number,
    min: number,
    scaleNumber: number,
    config?: ScaleCalcConfig
): ScaleData {
    const scaleDate: ScaleData = {
        max: 0,
        min: 0,
        step: 0,
    }
    const newConfig: ScaleCalcConfig = { ...DefScaleCalcConfig }
    Object.assign(newConfig, config)

    // 处理 max min 错误
    if (max < min) {
        let temporary = max
        max = min
        min = temporary
    }

    // 如果需要 正负对称，先处理对称
    if (newConfig.symmetrical !== 'null') {
        let can = newConfig.symmetrical === 'force' || max * min < 0
        if (can) {
            if (Math.abs(max) > Math.abs(min)) {
                min = -max
            } else {
                max = -min
            }
        }
    }

    // 如果 需要0刻度
    // 同正 或者 同负的情况下，此参数才有意义。 如果是一正一负，按照下面的 算法 必定包含0刻度
    if (newConfig.zeroMust && max * min > 0) {
        if (max > 0) {
            min = 0
        } else {
            max = 0
        }
    }

    const difference = max - min
    // 初始刻度
    let step = difference / scaleNumber
    // minStep 值在 step / 10 ~ step / 100
    let minStep = Math.pow(10, Math.floor(Math.log10(step) - 1))
    // multiple 在 10 ~ 100
    const multiple = step / minStep

    // 确定 step
    for (let i = 0; i < newConfig.magicArr.length; i++) {
        const v = newConfig.magicArr[i]
        if (v >= multiple) {
            step = minStep * v
            break
        }
    }
    scaleDate.step = step

    // 开始计算最大最小值
    // scaleDate.max = parseInt(String(max / step + 1)) * step
    // scaleDate.min = parseInt(String(min / step - 1)) * step

    scaleDate.max = Math.ceil(max / step + 1) * step
    scaleDate.min = parseInt(String(min / step - 1)) * step

    if (max === 0) {
        scaleDate.max = 0
    }
    if (min === 0) {
        scaleDate.min = 0
    }

    return scaleDate
}
