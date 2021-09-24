/**
 * 时间处理
 */
const millisecond = 0
const second = 1000
const minute = second * 60
const hour = minute * 60
const day = hour * 24
// 注意 month 是月的最小值
const month = day * 28
// 注意 year 是年的最小值
const year = day * 365
// 注意 month 是月的最小值,year 是年的最小值(不准确)
export const TimeDate = {
    millisecond,
    second,
    minute,
    hour,
    day,
    month,
    year,
}
// 可能的的年的毫秒数
export const possibleYear = [day * 365, day * 366]
// 可能的月的毫秒数
export const possibleMonth = [day * 28, day * 29, day * 30, day * 31]
/**
 * 是否闰年
 * @param year
 */
export function isLeapYear(year: number) {
    return year % 400 == 0 || (year % 4 == 0 && year % 100 != 0)
}

/**
 * 是否大月
 * @param month
 */
export function isBigMonth(month: number) {
    const bigM: any = {
        '1': true,
        '3': true,
        '5': true,
        '7': true,
        '8': true,
        '10': true,
        '12': true,
    }
    return bigM[month]
}

/**
 * 是否小月
 * @param month
 */
export function isSmallMonth(month: number) {
    return !isBigMonth(month)
}

/**
 * 获取这个月的天数
 * @param date
 */
export function getMonthAllDayNumber(date: string | number | Date): number {
    const d = new Date(date)
    //将当前月份加1，下移到下一个月
    d.setMonth(d.getMonth() + 1)
    //将当前的日期置为0，
    d.setDate(0)
    //再获取天数即取上个月的最后一天的天数
    return d.getDate()
}

/**
 * 判断是否最后一天
 * @param date
 */
export function isLastDay(date: string | number | Date): boolean {
    const d = new Date(date)
    const nowDay = d.getDate()
    const allDay = getMonthAllDayNumber(date)
    return nowDay === allDay
}

/**
 * 格式化日期  单个字母是不补0的返回
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
    const millisecond = useDate.getMilliseconds() + ''

    const fillMonth = month.length >= 2 ? month : '0' + month
    const fillDay = day.length >= 2 ? day : '0' + day
    const fillHour = hour.length >= 2 ? hour : '0' + hour
    const fillMinute = minute.length >= 2 ? minute : '0' + minute
    const fillSecond = second.length >= 2 ? second : '0' + second
    const fillMillisecond = millisecond.padStart(3, '0')

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
        // 毫秒 不补0
        S: millisecond,
        // 毫秒 补0
        SSS: fillMillisecond,
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
export function addTime(
    orgDate: string | number | Date,
    number: number,
    unit: keyof typeof TimeDate
) {
    if (unit === 'year' || unit === 'month') {
        const orgDateArr = formDate(orgDate, 'YYYY-M-D-H-m-s-S')
            .split('-')
            .map((str) => {
                return parseInt(str)
            })
        let useDate: Date
        if (unit === 'year') {
            useDate = new Date(orgDateArr[0] + number, orgDateArr[1])
        } else {
            useDate = new Date(orgDateArr[0], orgDateArr[1] - 1 + number)
        }
        const monthAllDay = getMonthAllDayNumber(useDate)
        let day: number
        // orgDate的天数大于  加减之后当月的天数， 那么需要将加减的日期修改为 当月的最大天数
        if (orgDateArr[2] > monthAllDay) {
            day = monthAllDay
        } else {
            day = orgDateArr[2]
        }
        useDate.setDate(day)
        useDate.setHours(
            orgDateArr[3],
            orgDateArr[4],
            orgDateArr[5],
            orgDateArr[5]
        )
        return useDate.getTime()
    }

    const orgTime = new Date(orgDate).getTime()
    const diffTime = TimeDate[unit] * number

    return orgTime + diffTime
}

export interface UnitAndNumber {
    unit: keyof typeof TimeDate
    number: number
}

/**
 * 连续时间段获取 间隔的单位和数目, 一定要注意，这个只是个简单的判断， 这个只是个简单的判断， 这个只是个简单的判断
 * @param timeArr
 * @param defUnit
 */
export function timeArrGetTimeUnitAndNumber(
    timeArr: number[],
    defUnit: keyof typeof TimeDate = 'year'
): UnitAndNumber {
    if (timeArr.length <= 1) {
        return {
            unit: defUnit,
            number: 1,
        }
    } else {
        const dateDiff = timeArr[1] - timeArr[0]
        const dateDiffAbs = Math.abs(dateDiff)

        // 年月的判断
        if (dateDiffAbs >= month) {
            let unit: keyof typeof TimeDate = null
            if (dateDiffAbs >= year) {
                unit = 'year'
            } else if (dateDiffAbs >= month) {
                unit = 'month'
            }

            // 间隔中最大的
            const diffMax = Math.floor(
                dateDiff /
                    (unit === 'year' ? possibleYear[0] : possibleMonth[0])
            )
            // 间隔中最小的
            const diffMin = Math.ceil(
                dateDiff /
                    (unit === 'year'
                        ? possibleYear[possibleYear.length - 1]
                        : possibleMonth[possibleMonth.length - 1])
            )
            let diffNumber: number = null
            // 确定每个间隔的数目-
            for (let i = diffMin; i <= diffMax; i++) {
                const nextData = addTime(
                    timeArr[0],
                    dateDiff > 0 ? i : -i,
                    unit
                )
                if (nextData === timeArr[1]) {
                    diffNumber = dateDiff > 0 ? i : -i
                    break
                }
            }
            if (diffNumber !== null) {
                // const determine = timeArr.slice(0, 4).every((item, index) => {
                //     const next = timeArr[index + 1]
                //     if (index === 3 || !next) {
                //         return true
                //     } else {
                //         const calcNext = addTime(
                //             timeArr[index],
                //             diffNumber,
                //             unit
                //         )
                //         return calcNext === next
                //     }
                // })
                return {
                    number: diffNumber,
                    unit: unit,
                }
            }
        }

        if (dateDiff % day === 0) {
            return {
                number: dateDiff / day,
                unit: 'day',
            }
        }

        if (dateDiff % hour === 0) {
            return {
                number: dateDiff / hour,
                unit: 'hour',
            }
        }

        if (dateDiff % minute === 0) {
            return {
                number: dateDiff / minute,
                unit: 'minute',
            }
        }
        return {
            number: dateDiff,
            unit: 'millisecond',
        }
    }
}

// /**
//  * 根据 时间误差（判断时间单位） 和 数目来获取 误差后的时间,这个肯定是不准确的
//  * @param orgDate 初始时间
//  * @param dateDiff 时间误差
//  * @param diffNumber 多少个时间误差
//  */
// export function dateDiffGetDate(
//     orgDate: string | number | Date,
//     dateDiff: number,
//     diffNumber: number
// ) {
//     let unit: keyof typeof TimeDate = null
//     if (dateDiff >= year) {
//         unit = 'year'
//     } else if (dateDiff >= month) {
//         unit = 'month'
//     } else if (dateDiff >= day) {
//         unit = 'day'
//     } else if (dateDiff >= hour) {
//         unit = 'hour'
//     } else if (dateDiff >= minute) {
//         unit = 'minute'
//     } else if (dateDiff >= second) {
//         unit = 'second'
//     }
//     if (!unit) return
//
//     return addTime(
//         orgDate,
//         Math.floor(dateDiff / TimeDate[unit]) * diffNumber,
//         unit
//     )
// }
