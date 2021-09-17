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
