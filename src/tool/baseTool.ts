/**
 * 工具绘制
 */
import { BaseChart } from '@/chart/baseChart'
import { Coordinate } from '@/utils/canvasDraw'

interface ShapeDot {
    date: number
    value: number
}

export abstract class BaseTool {
    // 完整绘制需要的 点 的个数
    public abstract dotNumber: number
    public nowDotIndex = 0
    // 点的集合, 不应该是坐标集合， 应该是时间戳 和 value 的集合
    public dotArr: ShapeDot[] = []
    // 是否选中状态
    public active: boolean = false
    constructor(public chart: BaseChart) {}

    abstract draw(): void

    addDot(dot: ShapeDot) {
        this.dotArr.push(dot)
    }
    setDot(dot: ShapeDot, index?: number) {
        this.dotArr[index || this.nowDotIndex] = dot
    }
    // 代表是否绘制完成
    get over() {
        return this.nowDotIndex >= this.dotNumber
    }
    // 点的坐标集合
    get dotCoordinateArr(): Coordinate[] {
        // return this.dotArr.map((item: ShapeDot) => {
        //     return {
        //         x: this.chart.kLine.xAxis.valueGetX(item.date),
        //         y: this.chart.YAxis.valueGetY(item.value),
        //     }
        // })
        return []
    }
}
