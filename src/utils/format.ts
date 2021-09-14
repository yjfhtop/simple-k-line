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

/**
 * 格式化日期
 * @param date
 * @param formStr
 */
export function formDate(
    date: string | number | Date,
    formStr = 'YYYY-MM-DD HH:mm:ss'
) {
    const useDate = new Date(date)
    const year = useDate.getFullYear() + ''
    const month = useDate.getMonth() + 1 + ''
    const day = useDate.getDate() + ''

    const hour = useDate.getHours() + ''
    const minute = useDate.getMinutes() + ''
    const second = useDate.getSeconds() + ''

    const fillMonth = month.length >= 2 ? month : '0' + month
    const fillDay = day.length >= 2 ? day : '0' + day
    const fillHour = hour.length >= 2 ? hour : '0' + hour
    const fillMinute = minute.length >= 2 ? minute : '0' + minute
    const fillSecond = second.length >= 2 ? second : '0' + second

    const formObj = {
        YYYY: year,
        MM: fillMonth,
        M: month,
        D: day,
        DD: fillDay,
        H: hour,
        HH: fillHour,
        m: minute,
        mm: fillMinute,
        s: second,
        ss: fillSecond,
    }

    let use = formStr
    // 对key 进行长度排序， 防止正则匹配的影响， 比如 D 对 DD的影响
    let keyArr = Object.keys(formObj).sort((a: string, b: string) => {
        if (a.length > b.length) {
            return -1
        } else {
            return 1
        }
    })
    keyArr.forEach((key: keyof typeof formObj) => {
        const v = formObj[key]
        use = use.replace(new RegExp(`(${key}){1,1}`, 'g'), v)
    })
    return use
}

const second = 1000
const minute = second * 60
const hour = minute * 60
const day = hour * 24
const month = day * 28
const year = day * 365

export const TimeDate = {
    second,
    minute,
    hour,
    day,
    month,
    year,
}

/**
 * 根据 时间差来格式阿化时间
 * @param form 要格式化的时间
 * @param contrast 对比的时间
 */
export function dateDiffForm(
    form: string | number | Date,
    contrast?: string | number | Date
) {
    form = new Date(form)
    contrast = new Date(contrast)

    const formDateArr = formDate(form, `YYYY-MM-DD-HH-mm-ss`).split('-')
    const contrastDateArr = formDate(contrast, `YYYY-MM-DD-HH-mm-ss`).split('-')

    const diff = Math.abs(form.getTime() - contrast.getTime())
    let formStr = ''

    if (diff >= year) {
        return formDate(form, 'YYYY')
    } else if (diff >= month) {
        if (formDateArr[0] !== contrastDateArr[0]) {
            return formDate(form, 'YYYY-MM')
        } else {
            return formDate(form, 'MM')
        }
    } else if (diff >= day) {
        if (formDateArr[0] !== contrastDateArr[0]) {
            return formDate(form, 'YYYY-MM-DD')
        } else {
            return formDate(form, 'MM-DD')
        }
    } else {
        // 分钟， 小时 一致
        if (formDateArr[2] !== contrastDateArr[2]) {
            return formDate(form, 'DD HH:mm')
        } else {
            return formDate(form, 'HH:mm')
        }
    }
}

/**
 * 加减时间
 * @param orgDate
 * @param number 加减时间 的数目, 正数+， 负数-
 * @param unit 加减时间的单位： 年，月日等
 */
export function computeTime(
    orgDate: string | number | Date,
    number: number,
    unit: keyof typeof TimeDate
) {
    if (unit === 'year' || unit === 'month') {
        const orgDateArr = formDate(orgDate, 'YYYY-MM-DD-HH-mm-ss')
            .split('-')
            .map((str) => {
                return parseInt(str)
            })
        if (unit === 'year') {
            const dateStr = `${orgDateArr[0] + number}-${orgDateArr[1]}-${
                orgDateArr[2]
            } ${orgDateArr[3]}:${orgDateArr[4]}:${orgDateArr[5]}`
            return new Date(dateStr).getTime()
        }
        if (unit === 'month') {
            const diffYear = parseInt(number / 12 + '', 10)
            const diffMonth = number % 12
            const dateStr = `${orgDateArr[0] + diffYear}-${
                orgDateArr[1] + diffMonth
            }-${orgDateArr[2]} ${orgDateArr[3]}:${orgDateArr[4]}:${
                orgDateArr[5]
            }`
            return new Date(dateStr).getTime()
        }
    }

    const orgTime = new Date(orgDate).getTime()
    const diffTime = TimeDate[unit] * number

    return orgTime + diffTime
}

/**
 * 根据 时间误差（判断时间单位） 和 数目来获取 误差后的时间
 * @param orgDate 初始时间
 * @param dateDiff 时间误差
 * @param diffNumber 多少个时间误差
 */
export function dateDiffGetDate(
    orgDate: string | number | Date,
    dateDiff: number,
    diffNumber: number
) {
    let unit: keyof typeof TimeDate = null
    if (dateDiff >= year) {
        unit = 'year'
    } else if (dateDiff >= month) {
        unit = 'month'
    } else if (dateDiff >= day) {
        unit = 'day'
    } else if (dateDiff >= hour) {
        unit = 'hour'
    } else if (dateDiff >= minute) {
        unit = 'minute'
    } else if (dateDiff >= second) {
        unit = 'second'
    }
    if (!unit) return

    return computeTime(
        orgDate,
        Math.floor(dateDiff / TimeDate[unit]) * diffNumber,
        unit
    )
}
