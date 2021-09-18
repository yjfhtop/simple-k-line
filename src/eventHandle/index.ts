import { BaseTool } from '@/tool/baseTool'
import { Coordinate } from '@/utils/canvasDraw'
import SimpleKLine from '@/index'

export class EventHandle {
    // 绘制中的 标记
    public shape: BaseTool
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
            this.nowCoordinate = {
                x: this.getEffectiveX(e.offsetX),
                y: this.getEffectiveY(e.offsetY),
            }
            this.kLine.showCross = true
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
            if (this.shape) {
                this.shape.nowDotIndex++
                if (this.shape.over) {
                    this.shape.chart.toolList.push(this.shape)
                    this.shape.active = false
                    this.shape = null
                    this.kLine.showCross = true
                }
            }
        })

        document.addEventListener('mouseup', (e) => {
            this.leftPressIng = false
        })
    }
}
