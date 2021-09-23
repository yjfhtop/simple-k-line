import { calcScaleNumber, deepCopy } from '@/utils/dataHandle'
import SimpleKLine from '@/index'
import { DataItem } from '@/kLineConf'

import { Coordinate, drawLine, drawTxt } from '@/utils/canvasDraw'
import {
    addTime,
    dateDiffForm,
    formDate,
    timeArrGetTimeUnitAndNumber,
    TimeDate,
    UnitAndNumber,
} from '@/utils/timeHandle'

// x轴的配置
export interface XConf {
    // x轴的高度
    h: number
    // 轴线
    axisLine?: {
        color?: string
        lineW?: number
    }
    // 轴标
    axisMark?: {
        len?: number
        lineW?: number
        color?: string
    }
    txt?: {
        size?: number
        family?: string
        // Y偏移量， 文字默认是在轴标的尾部绘制 y轴 = 轴线.y + axisMark.len
        deviationY?: number
        color?: string
    }
    // 网格线样式
    gridLine?: {
        color?: string
        lineW?: number
    }
}

/**
 * x轴
 */
export class XAxis {
    // 一个轴标的宽度
    public scaleW = 0
    // 轴标的数量
    public number = 0
    // 一个轴标内 小轴标的数目
    public useScaleInsideItemNumber = 0
    public leftTop: Coordinate
    public rightBottom: Coordinate
    // 对 k线数据的补充，用来补全时间轴的显示
    // public dataList: DataItem[]
    // 轴标上边线段的集合，方便其他图表就行绘制 网格线
    public axisMarkArr: Coordinate[]
    // 小间隔的单位和数目
    public unitAndNumber: UnitAndNumber
    // 绘制时间轴需要的补充数据
    public supplementDataArr: number[] = []
    get conf() {
        return this.kLine.conf.xConf
    }
    constructor(public kLine: SimpleKLine) {
        this.leftTop = {
            x: 0,
            y: this.kLine.elWH.h - this.conf.h,
        }
        this.rightBottom = {
            x: this.kLine.elWH.w,
            y: this.kLine.elWH.h,
        }
        this.determineIntervalUnitAndNumber()
        this.getSupplementDataArr()
        this.determineScale()
    }
    // 确定轴标
    determineScale() {
        const scaleNumberData = calcScaleNumber(
            this.kLine.elWH.w,
            this.kLine.useItemAllW,
            {
                minNumber: 5,
                minScaleW: 70,
            }
        )
        const min = scaleNumberData.minScaleInsideItemNumber
        const max = scaleNumberData.maxScaleInsideItemNumber

        this.scaleW = scaleNumberData.scaleW
        this.number = scaleNumberData.number
        this.useScaleInsideItemNumber = scaleNumberData.useScaleInsideItemNumber
        // 4, 6, 10, 12, 30
    }

    // 确定小间隔单位和数目
    determineIntervalUnitAndNumber() {
        const timeArr = this.kLine.dataArr.slice(0, 4).map((item) => item.date)
        this.unitAndNumber = timeArrGetTimeUnitAndNumber(timeArr)
    }
    // 从起坐标的偏移
    get deviationNumber() {
        return Math.ceil(this.useScaleInsideItemNumber / 2)
    }

    // 偏移长度
    get deviationLength() {
        return this.deviationNumber * this.kLine.useItemAllW
    }
    // 刻度绘制开始的下标
    get drawStartIndex() {
        return this.kLine.eIndex - this.deviationNumber
    }
    // 绘制开始的x坐标
    get drawStartX() {
        const lastItemY =
            this.kLine.elWH.w - this.kLine.yW - this.kLine.useItemAllW / 2
        return lastItemY - this.deviationLength
    }

    // 小刻度时间差
    get scaleDiff() {
        return this.unitAndNumber.number * TimeDate[this.unitAndNumber.unit]
    }
    // 轴标的时间差
    get markDiff() {
        return this.scaleDiff * this.useScaleInsideItemNumber
    }

    // 补充数据, 只有在 起止坐标变化时才需要修改
    getSupplementDataArr() {
        const arr: number[] = []
        // 代表有空白， 需要补齐数据，要不然渲染不了
        if (
            this.kLine.sIndex < 0 ||
            this.kLine.eIndex > this.kLine.dataArr.length - 1
        ) {
            if (this.kLine.sIndex < 0) {
                for (let i = -1; i >= this.kLine.sIndex; i--) {
                    arr[i] = addTime(
                        this.kLine.dataArr[0].date,
                        this.unitAndNumber.number * i,
                        this.unitAndNumber.unit
                    )
                }
            }
            if (this.kLine.eIndex > this.kLine.dataArr.length - 1) {
                for (
                    let i = this.kLine.dataArr.length;
                    i <= this.kLine.eIndex;
                    i++
                ) {
                    arr[i] = addTime(
                        this.kLine.dataArr[this.kLine.dataArr.length - 1].date,
                        this.unitAndNumber.number *
                            (i - this.kLine.dataArr.length + 1),
                        this.unitAndNumber.unit
                    )
                }
            }
        }
        this.supplementDataArr = arr
        return arr
    }

    draw() {
        drawLine(
            this.kLine.bc,
            this.leftTop,
            {
                x: this.rightBottom.x,
                y: this.leftTop.y,
            },
            {
                w: this.conf.axisLine.lineW,
                style: this.conf.axisLine.color,
            }
        )

        this.axisMarkArr = []
        // 轴标和文字 s
        for (let i = 0; i < this.number * this.useScaleInsideItemNumber; i++) {
            const nowDrawIndex = this.drawStartIndex - i
            const date = this.getIndexTime(nowDrawIndex)
            if (i % this.useScaleInsideItemNumber === 0 && date) {
                const x = this.drawStartX - this.kLine.useItemAllW * i
                const y1 = this.leftTop.y
                const y2 = this.leftTop.y + this.conf.axisMark.len

                // 边际不绘制
                if (x < this.scaleW / 2) continue
                this.axisMarkArr.push({
                    x,
                    y: y1,
                })
                drawLine(
                    this.kLine.bc,
                    { x, y: y1 },
                    { x, y: y2 },
                    {
                        w: this.conf.axisMark.lineW,
                        style: this.conf.axisMark.color,
                    }
                )
                // txt 绘制 s
                const txt = dateDiffForm(date, date - this.markDiff)
                drawTxt(this.kLine.bc, {
                    txt: txt,
                    coordinate: { x, y: y2 + this.conf.txt.deviationY },
                    drawType: 'full',
                    drawStyle: {
                        style: this.conf.txt.color,
                    },
                    fontSize: this.conf.txt.size,
                    fontFamily: this.conf.txt.family,
                    textBaseline: 'top',
                    textAlign: 'center',
                })
                // txt 绘制 e
            }
        }
        // 轴标和文字 s
    }

    getIndexTime(index: number) {
        return this.kLine.dataArr[index]
            ? this.kLine.dataArr[index].date
            : this.supplementDataArr[index]
    }

    // 时间获取 x 轴, 带吸附
    valueGetX(value: number) {
        const sTime = this.getIndexTime(this.kLine.sIndex)
        const eTime = this.getIndexTime(this.kLine.eIndex)
        if (value >= sTime && value <= eTime) {
            for (let i = this.kLine.sIndex; i <= this.kLine.eIndex; i++) {
                const nowTime = this.getIndexTime(i)
                const nextTime = this.getIndexTime(i + 1)
                if (value === nowTime) {
                    return this.indexGetX(i)
                }
                if (nextTime) {
                    if (value === nowTime) {
                        return this.indexGetX(i + 1)
                    }
                    if (value < nowTime && value < nextTime) {
                        const diffNow = Math.abs(value - nowTime)
                        const diffNext = Math.abs(nextTime - value)
                        if (diffNext < diffNow) {
                            return this.indexGetX(i + 1)
                        } else {
                            return this.indexGetX(i)
                        }
                    }
                }
            }
        } else {
            if (value < eTime) {
                const diff = eTime - value
                const eX = this.indexGetX(this.kLine.eIndex)
                const diffNumber = Math.round(diff / this.scaleDiff)
                return eX - diffNumber * this.kLine.useItemAllW
            } else {
                const diff = value - sTime
                const eX = this.indexGetX(this.kLine.sIndex)
                const diffNumber = Math.round(diff / this.scaleDiff)
                return eX + diffNumber * this.kLine.useItemAllW
            }
        }
    }
    // x 轴获取 x 轴，带吸附
    xGetX(x: number) {
        const nowIndex = this.xGetIndex(x)
        return (
            this.drawStartX +
            (nowIndex - this.drawStartIndex) * this.kLine.useItemAllW
        )
    }
    // x轴获取下标 带吸附
    xGetIndex(x: number) {
        const diff = x - this.drawStartX
        let diffNumber = Math.floor(Math.abs(diff / this.kLine.useItemAllW))
        const remainder = Math.abs(diff % this.kLine.useItemAllW)

        if (remainder !== 0) {
            if (remainder > this.kLine.useItemAllW / 2) {
                diffNumber++
            }
        }

        if (diff > 0) {
            return this.drawStartIndex + diffNumber
        } else {
            return this.drawStartIndex - diffNumber
        }
    }
    xGetValue(x: number) {
        const nowIndex = this.xGetIndex(x)
        return this.kLine.dataArr[nowIndex]
            ? this.kLine.dataArr[nowIndex].date
            : this.supplementDataArr[nowIndex]
    }
    indexGetX(index: number) {
        return (
            this.drawStartX +
            (index - this.drawStartIndex) * this.kLine.useItemAllW
        )
    }
}
