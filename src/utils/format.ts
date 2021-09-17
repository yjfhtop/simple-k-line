/**
 * 格式化相关
 */
// 数量级类型
interface MagnitudeType {
    K: number
    M: number
    G: number
    T: number
}
export const Magnitude: MagnitudeType = {
    K: 10 ** 3,
    M: 10 ** 6,
    G: 10 ** 9,
    T: 10 ** 12,
}
/**
 * 获取数量级， 小于 K 返回为空
 * @param val
 */
export function getMagnitude(val: number): keyof MagnitudeType {
    if (typeof val !== 'number') {
        console.error('getMagnitudeNumber: val 不是数字')
    }
    let absVal = Math.abs(val)
    let magnitudeTxt: keyof MagnitudeType
    if (val >= Magnitude.K && val < Magnitude.M) {
        magnitudeTxt = 'K'
    } else if (val >= Magnitude.M && val < Magnitude.G) {
        magnitudeTxt = 'M'
    } else if (val >= Magnitude.G && val < Magnitude.T) {
        magnitudeTxt = 'G'
    } else if (val >= Magnitude.T) {
        magnitudeTxt = 'T'
    }
    return magnitudeTxt
}

/**
 * 获取带数量级的单位
 * @param val
 * @param number 小数位
 */
export function getMagnitudeNumber(val: number, number: number = 2): string {
    if (typeof val !== 'number') {
        console.error('getMagnitudeNumber: val 不是数字')
        return
    }
    const magnitude = getMagnitude(val)
    let newVal = val

    if (magnitude) {
        newVal = val / Magnitude[magnitude]
    }
    return magnitude ? newVal.toFixed(number) + magnitude : val + ''
}
