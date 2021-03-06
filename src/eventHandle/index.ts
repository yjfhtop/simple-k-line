import { BaseTool } from '@/tool/baseTool'
import { Coordinate } from '@/utils/canvasDraw'
import SimpleKLine from '@/index'
import { deepCopy } from '@/utils/dataHandle'
import { BaseChart } from '@/chart/baseChart'

export interface CanDragChartMap {
    topChart: BaseChart
    bottomChart: BaseChart
}

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
    // 当前的下标, 主要为提示文字使用
    public nowIndex: number
    public canDragChartMap: CanDragChartMap
    constructor(public kLine: SimpleKLine) {
        this.initEnv()
        this.nowIndex = this.kLine.dataArr.length - 1
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

    // get nowIndex =

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

    getEffectiveNowIndex(index: number) {
        if (index > this.kLine.dataArr.length - 1) {
            return this.kLine.dataArr.length - 1
        } else if (index < 0) {
            return 0
        }
        return index
    }

    // 判断是否能够拖拽图表, 能够拖拽返回上下图表
    canDragChart(y: number, saveOld = false) {
        const dragChartNumber = this.kLine.conf.dragChartNumber
        for (
            let index = 0;
            index < this.kLine.conf.chartShowArr.length;
            index++
        ) {
            const topChart =
                this.kLine.chartMap[this.kLine.conf.chartShowArr[index]]
            const bottomChart =
                this.kLine.chartMap[this.kLine.conf.chartShowArr[index + 1]]
            if (!topChart || !bottomChart) continue
            if (index && index >= this.kLine.conf.chartShowArr.length - 1) {
            } else {
                const min = topChart.rightBottom.y - dragChartNumber
                const max = topChart.rightBottom.y + dragChartNumber
                if (y >= min && y <= max) {
                    topChart.saveOld()
                    bottomChart.saveOld()
                    return {
                        topChart: topChart,
                        bottomChart: bottomChart,
                    }
                }
            }
        }
        return null
    }

    initEnv() {
        this.kLine.el.addEventListener('mousemove', (e) => {
            e.stopPropagation()
            this.kLine.showCross = true
            this.nowCoordinate = {
                x: this.getEffectiveX(e.offsetX),
                y: this.getEffectiveY(e.offsetY),
            }
            const nowChart = this.nowChart
            // 鼠标按下 并且有 激活的工具，意味着是对工具进行移动，或者点的移动
            if (
                this.downCoordinate &&
                this.activeTool &&
                this.activeTool.over
            ) {
                this.kLine.showCross = false
                const yValue = this.activeTool.chart.YAxis.YGetValue(
                    this.activeTool.chart.getDrawEffectiveY(
                        this.nowCoordinate.y
                    )
                )
                const xValue = this.kLine.xAxis.xGetValue(this.nowCoordinate.x)
                const yDiff = this.nowCoordinate.y - this.downCoordinate.y
                const xDiff = this.nowCoordinate.x - this.downCoordinate.x

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
            // 鼠标按下，可拖动图表
            else if (this.downCoordinate && this.canDragChartMap) {
                this.kLine.showCross = false
                const diff = Math.floor(
                    this.nowCoordinate.y - this.downCoordinate.y
                )
                const { topChart, bottomChart } = this.canDragChartMap
                const minH = this.kLine.conf.chartMinH

                const nextTopChartH = topChart.oldChartH + diff
                const nextBottomChartH = bottomChart.oldChartH - diff

                if (nextBottomChartH < minH || nextTopChartH < minH) {
                    return
                }

                topChart.chartH = topChart.oldChartH + diff
                bottomChart.topY = bottomChart.oldTopY + diff
                bottomChart.chartH = bottomChart.oldChartH - diff
                topChart.YAxis.determineScale()
                bottomChart.YAxis.determineScale()
                this.kLine.drawBottom()
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

                    this.kLine.callEvent('loadNew')
                    this.kLine.callEvent('loadOld')
                }
            }
            // 是否有激活的工具, 主要是工具的绘制相关
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
            // 没有选中的工具， 鼠标也不是按下的状态， 处理 hoverTool 和 nowIndex, 和 图表拖拽的鼠标样式
            else if (!this.activeTool && !this.downCoordinate) {
                // 判断有没有鼠标在工具上 s
                let hasHoverTool = false
                this.kLine.eachShowChart((chart) => {
                    chart.toolList.forEach((item) => {
                        const inLine = item.inLine(this.nowCoordinate)
                        if (inLine) {
                            // 保证只有一个
                            this.hoverTool && (this.hoverTool.active = false)
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

                // nowIndex s
                this.nowIndex = this.getEffectiveNowIndex(
                    this.kLine.xAxis.xGetIndex(this.nowCoordinate.x)
                )
                // nowIndex e

                if (this.canDragChart(this.nowCoordinate.y)) {
                    this.kLine.el.style.cursor = 'row-resize'
                } else {
                    this.kLine.el.style.cursor = 'default'
                }
            }
            this.kLine.drawTop()
            this.oldCoordinate = { ...this.nowCoordinate }
        })

        this.kLine.el.addEventListener('mousedown', (e) => {
            e.stopPropagation()
            this.downCoordinate = {
                x: this.getEffectiveX(e.offsetX),
                y: this.getEffectiveY(e.offsetY),
            }
            if (this.activeTool && !this.activeTool.over) {
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
                // 保存旧的， 方便平移
                this.activeTool.oldDotArr = deepCopy(this.activeTool.dotArr)
                if (index > -1) {
                    this.kLine.drawTop()
                }
                // 如果不是点的话，就是线
            } else {
                // 为表格拖拽准备
                this.canDragChartMap = this.canDragChart(
                    this.downCoordinate.y,
                    true
                )
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
            e.preventDefault()
            e.stopPropagation()
            // 如果有工具在使用，不应该缩放
            if (this.activeTool) return
            const deltaY = e.deltaY
            let nextIndex =
                this.kLine.useItemWAndSpaceIndex + (deltaY > 0 ? -1 : 1)
            this.kLine.useItemWAndSpaceIndex = nextIndex
            this.kLine.drawAll()
            this.kLine.callEvent('loadNew')
            this.kLine.callEvent('loadOld')
        })

        this.kLine.el.addEventListener('mouseleave', () => {
            this.kLine.showCross = false
            this.kLine.drawTop()
        })
    }
}
