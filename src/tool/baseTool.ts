/**
 * 工具绘制
 */
import { BaseChart } from '@/chart/baseChart'
import { Coordinate } from '@/utils/canvasDraw'

interface ToolDot {
    date: number
    value: number
}

export interface BaseToolConf {
    // 点
    dot?: {
        // 半径
        bigR?: number
        smallR?: number
        color?: string
        // 选中的颜色
        activeColor?: string
    }
    // 线
    line?: {
        lineW?: number
        color?: string
        // 用于判断是否在线上的 用， 如果lineW太小，用户很难将鼠标放在线上
        inLineW?: number
        // 选中时线的样式
        activeLineDash?: number[]
    }
}

export abstract class BaseTool {
    // 完整绘制需要的 点 的个数
    public abstract dotNumber: number
    public nowDotIndex = 0
    // 点的集合, 不应该是坐标集合， 应该是时间戳 和 value 的集合
    public dotArr: ToolDot[] = []
    // 是否选中状态
    public active: boolean = true
    constructor(public chart: BaseChart) {}

    // 绘制方法
    abstract draw(): void
    // 判断是否在绘制线上
    abstract inLine(dot: Coordinate): boolean

    addDot(dot: ToolDot) {
        this.dotArr.push(dot)
    }
    setDot(dot: ToolDot, index?: number) {
        this.dotArr[index || this.nowDotIndex] = dot
    }
    get conf() {
        return this.chart.kLine.conf.toolConf
    }
    // 代表是否绘制完成
    get over() {
        return this.nowDotIndex >= this.dotNumber
    }
    // 点的坐标集合
    get dotCoordinateArr(): Coordinate[] {
        return this.dotArr.map((item: ToolDot) => {
            return {
                x: this.chart.kLine.xAxis.valueGetX(item.date),
                y: this.chart.YAxis.valueGetY(item.value),
            }
        })
    }
    // 判断坐标是否在点上，并且返回点的下标
    getInDotIndex(dot: Coordinate): number {
        let targetIndex = -1
        this.dotCoordinateArr.some((item, index) => {
            if (item) {
                const nowR = Math.sqrt(
                    (dot.x - item.x) ** 2 + (dot.y - item.y) ** 2
                )
                if (nowR <= this.conf.dot.bigR) {
                    targetIndex = index
                    return true
                }
            }
        })
        return targetIndex
    }

    // // 判断是否在线上
    // inLine(dot: Coordinate) {
    //     const dotCoordinateArr = this.dotCoordinateArr
    //     dotCoordinateArr.forEach()
    // }
}
