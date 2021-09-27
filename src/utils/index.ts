/**
 * 基础工具
 */

// 数据类型
export type DataType =
    | 'Object'
    | 'Array'
    | 'Function'
    | 'Null'
    | 'Number'
    | 'String'
    | 'Boolean'
    | 'Undefined'

/**
 * 是否奇数
 * @param v
 */
export function isOdd(v: number): boolean {
    v = Math.floor(v)
    return v % 2 !== 0
}

/**
 * 获取数据类型
 * @param data
 */
export function getDataType(data: any): DataType {
    const typeStr: string = Object.prototype.toString.call(data)
    let useTypeStr = typeStr.slice(8)
    useTypeStr = useTypeStr.slice(0, useTypeStr.length - 1)
    return useTypeStr as DataType
}

/**
 * 获取一个字符串中 targetStr 出现是次数
 * @param str
 * @param targetStr
 */
export function getStrNumber(str: string, targetStr: string): number {
    return str.split(targetStr).length - 1
}

/**
 * 根据2个数组，返回相对于oldArr 添加的部分 和删除的部分
 * @param oldArr
 * @param newArr
 */
export function arrGetAddAndDel(oldArr: string[], newArr: string[]) {
    const oldOjb: { [key: string]: boolean } = {}
    const newOjb: { [key: string]: boolean } = {}
    const addArr: string[] = []
    const delArr: string[] = []
    oldArr.forEach((item) => {
        oldOjb[item] = true
    })
    newArr.forEach((item) => {
        newOjb[item] = true
        if (!oldOjb[item]) {
            addArr.push(item)
        }
    })

    oldArr.forEach((item) => {
        if (!newOjb[item]) {
            delArr.push(item)
        }
    })
    return {
        addArr,
        delArr,
    }
}

/**
 * 获取近似值 str, 返回： s 代表s靠近
 * @param sData
 * @param eDate
 * @param target
 */
export function getApproximateStr(
    sData: number,
    eDate: number,
    target: number
) {
    const sDiff = Math.abs(sData - target)
    const eDiff = Math.abs(eDate - target)
    if (sDiff <= eDiff) {
        return 's'
    } else {
        return 'e'
    }
}

export function getApproximate(sData: number, eDate: number, target: number) {
    const str = getApproximateStr(sData, eDate, target)
    return str === 's' ? sData : eDate
}

/**
 * 二分发找值， 早不到返回 -1
 * @param list
 * @param value 要找的目标值
 * @param getValue
 * @param approximate 如果找不到，是否取最接近的下标
 */
export function binarySearch<T>(
    list: T[],
    value: number,
    getValue?: (item: T) => number,
    approximate: boolean = true
): number {
    const s = 0
    const e = list.length - 1
    const defGetValue = function (item: T): number {
        return item as any
    }
    getValue = getValue || defGetValue

    if (list.length === 0) {
        return -1
    }
    function useDichotomy(
        list: T[],
        value: number,
        getValue: (item: T) => number,
        s: number,
        e: number
    ): number {
        const center = Math.floor((e - s) / 2) + s
        const sValue = getValue(list[s])
        const cValue = getValue(list[center])
        const eValue = getValue(list[e])
        if (sValue === value) {
            return s
        }
        if (eValue === value) {
            return e
        }
        if (cValue === value) {
            return center
        }

        if (s === e) {
            return approximate ? s : -1
        }

        if (e - s === 1) {
            // 取近似下标
            if (approximate) {
                const diffType = getApproximateStr(sValue, eValue, value)
                return diffType === 's' ? s : e
            } else {
                return -1
            }
        }
        if (cValue < value) {
            return useDichotomy(list, value, getValue, center, e)
        } else {
            return useDichotomy(list, value, getValue, s, center)
        }
    }
    return useDichotomy(list, value, getValue, s, e)
}
