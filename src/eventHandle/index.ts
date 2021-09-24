import { BaseTool } from '@/tool/baseTool'
import { Coordinate } from '@/utils/canvasDraw'
import SimpleKLine from '@/index'

export class EventHandle {
    // 鼠标在工具上的工具，当 鼠标按下时， hoverTool 将会变为 activeTool
    public hoverTool: BaseTool
    // 激活的 标记
    public activeTool: BaseTool
    // 上一个鼠标 移动时的坐标
    public oldCoordinate: Coordinate
    // 鼠标按下的坐标, 松开为null
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
            // 鼠标按下 并且有 激活的工具，意味着是对工具进行移动，或者点的移动
            if (this.downCoordinate && this.activeTool) {
                this.kLine.showCross = false
                const oldYValue = this.activeTool.chart.YAxis.YGetValue(
                    this.oldCoordinate.y
                )
                const yValue = this.activeTool.chart.YAxis.YGetValue(
                    this.activeTool.chart.getDrawEffectiveY(
                        this.nowCoordinate.y
                    )
                )
                const yDiff = yValue - oldYValue

                const oldXValue = this.kLine.xAxis.xGetValue(
                    this.oldCoordinate.x
                )
                const xValue = this.kLine.xAxis.xGetValue(this.nowCoordinate.x)
                const xDiff = xValue - oldXValue

                const activeDotNumber = this.activeTool.activeDotNumber
                // 点的移动
                if (activeDotNumber > -1) {
                    const activeDotNumberObj =
                        this.activeTool.dotArr[activeDotNumber]
                    this.activeTool.setDot(
                        {
                            date: xValue,
                            value: yValue,
                        },
                        this.activeTool.activeDotNumber
                    )
                } else {
                    // 平移
                    this.activeTool.move(yDiff, xDiff)
                }
            }
            // 没有激活的工具下按下， 然后拖动， 相当于图表的左右拖动
            else if (!this.activeTool && this.downCoordinate) {
                this.kLine.showCross = false
                const oldIndex = this.kLine.xAxis.xGetIndex(
                    this.oldCoordinate.x
                )
                const nowIndex = this.kLine.xAxis.xGetIndex(
                    this.nowCoordinate.x
                )
                const diffIndex = nowIndex - oldIndex
                if (diffIndex !== 0) {
                    this.kLine.eIndex -= diffIndex
                    this.kLine.determineYTxtMaxW()
                    this.kLine.xAxis.getSupplementDataArr()
                    this.kLine.drawAll()
                }
            }
            // 是否有激活的工具
            else if (this.activeTool) {
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
                    // 判断index, ---------------------
                } else {
                    this.activeTool.setDot({ date, value })
                }
            }
            // 没有选中的工具， 鼠标也不是按下的状态， 处理 hoverTool
            else if (!this.activeTool && !this.downCoordinate) {
                // 判断有没有鼠标在工具上 s
                let hasHoverTool = false
                this.kLine.eachShowChart((chart) => {
                    chart.toolList.forEach((item) => {
                        const inLine = item.inLine(this.nowCoordinate)
                        if (inLine) {
                            item.active = true
                            hasHoverTool = true
                            this.hoverTool = item
                        } else {
                            item.active = false
                        }
                    })
                })
                !hasHoverTool && (this.hoverTool = null)
                hasHoverTool && (this.kLine.showCross = false)
                // 判断有没有鼠标在工具上 e
            }
            this.kLine.drawTop()
            this.oldCoordinate = { ...this.nowCoordinate }
        })

        this.kLine.el.addEventListener('mousedown', (e) => {
            this.downCoordinate = {
                x: this.getEffectiveX(e.offsetX),
                y: this.getEffectiveY(e.offsetY),
            }
            if (this.activeTool) {
                this.activeTool.nowDotIndex++
                if (this.activeTool.over) {
                    this.activeTool.chart.toolList.push(this.activeTool)
                    this.activeTool.active = false
                    this.activeTool = null
                    this.kLine.showCross = true
                }
            } else if (this.hoverTool) {
                this.activeTool = this.hoverTool
                // 按下的是点
                const index = this.activeTool.getInDotIndex(this.downCoordinate)
                this.activeTool.activeDotNumber = index
                if (index > -1) {
                    this.kLine.drawTop()
                }
                // 如果不是点的话，就是线
            }
        })

        document.addEventListener('mouseup', (e) => {
            this.downCoordinate = null
            // 表示是对工具进行移动 和 拖动时的处理
            if (this.activeTool && this.activeTool.over) {
                this.activeTool.activeDotNumber = -1
                this.activeTool = null
            }
        })

        // 用于缩放
        this.kLine.el.addEventListener('wheel', (e) => {
            const deltaY = e.deltaY
            if (deltaY > 0) {
                if (this.kLine.useItemWAndSpaceIndex > 0) {
                    this.kLine.useItemWAndSpaceIndex--
                }
            } else {
                if (
                    this.kLine.useItemWAndSpaceIndex <
                    this.kLine.conf.itemWAndSpaceList.length - 1
                ) {
                    this.kLine.useItemWAndSpaceIndex++
                }
            }
            this.kLine.standardizationEIndex()
            this.kLine.determineYTxtMaxW()
            this.kLine.drawAll()
            e.preventDefault()
        })

        this.kLine.el.addEventListener('mouseleave', () => {
            this.kLine.showCross = false
            this.kLine.drawTop()
        })
    }
}
