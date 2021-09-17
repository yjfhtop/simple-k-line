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
    const useTypeStr = typeStr.replace('[object ', '').replace(']', '')
    return useTypeStr as DataType
}

/**
 * 获取一个字符串中
 * @param str
 * @param targetStr
 */
export function getStrNumber(str: string, targetStr: string): number {
    return str.split(targetStr).length - 1
}
