import { BaseTool } from '@/tool/baseTool'
import { Coordinate } from '@/utils/canvasDraw'
import SimpleKLine from '@/index'

export class EventHandle {
    // 激活的 标记
    public activeTool: BaseTool
    // 鼠标左键是否在按下状态中
    public leftPressIng: boolean
    // 上一个鼠标 移动时的坐标
    public oldCoordinate: Coordinate
    // 鼠标按下的坐标
    public downCoordinate: Coordinate
    // 当前鼠标的坐标
    public nowCoordinate: Coordinate
    constructor(public kLine: SimpleKLine) {
        this.initEnv()
    }

    get nowChart() {
        for (let i = 0; i < this.kLine.conf.chartShowArr.length; i++) {
            const key = this.kLine.conf.chartShowArr[i]
            const chart = this.kLine.chartMap[key]

            if (chart.inChart(this.nowCoordinate)) {
                return chart
            }
        }
    }

    getEffectiveX(x: number) {
        if (x > this.kLine.chartMaxX) {
            return this.kLine.chartMaxX
        }
        if (x < 0) {
            return 0
        }
        return x
    }
    getEffectiveY(y: number) {
        if (y > this.kLine.chartMaxY) {
            return this.kLine.chartMaxY
        }
        if (y < 0) {
            return 0
        }
        return y
    }

    initEnv() {
        this.kLine.el.addEventListener('mousemove', (e) => {
            this.kLine.showCross = true
            this.nowCoordinate = {
                x: this.getEffectiveX(e.offsetX),
                y: this.getEffectiveY(e.offsetY),
            }
            const nowChart = this.nowChart
            // 是否有激活的工具
            if (this.activeTool) {
                this.kLine.showCross = false
                // 还没有确定点的 工具是可切换所在的图表的 s
                if (this.activeTool.nowDotIndex === 0) {
                    this.activeTool.chart = nowChart
                }
                // 还没有确定点的 工具是可切换所在的图表的 e

                // 获取date 和 value s
                const date = this.kLine.xAxis.xGetValue(this.nowCoordinate.x)
                const value = this.activeTool.chart.YGetValue(
                    // 这里需要处理一下y轴
                    this.activeTool.chart.getDrawEffectiveY(
                        this.nowCoordinate.y
                    )
                )
                // 获取date 和 value e
                if (this.activeTool.over) {
                    // pass
                } else {
                    this.activeTool.setDot({ date, value })
                }
            }
            this.kLine.drawTop()
            this.oldCoordinate = { ...this.nowCoordinate }
        })

        this.kLine.el.addEventListener('mousedown', (e) => {
            this.downCoordinate = {
                x: e.offsetX,
                y: e.offsetY,
            }
            this.leftPressIng = true
        })

        this.kLine.el.addEventListener('click', (e) => {
            if (this.activeTool) {
                this.activeTool.nowDotIndex++
                if (this.activeTool.over) {
                    this.activeTool.chart.toolList.push(this.activeTool)
                    this.activeTool.active = false
                    this.activeTool = null
                    this.kLine.showCross = true
                }
            }
        })

        document.addEventListener('mouseup', (e) => {
            this.leftPressIng = false
        })
    }
}
