import { Triangle } from '@/tool/triangle'
import { BaseChart } from '@/chart/baseChart'
import { LineSegment } from '@/tool/lineSegment'

export interface ToolMap {
    triangle: Triangle
    lineSegment: LineSegment
}

export type ToolTypes = keyof ToolMap

// 创建Shape
export function createTool(name: ToolTypes, chart: BaseChart) {
    switch (name) {
        case 'triangle':
            return new Triangle(chart)
        case 'lineSegment':
            return new LineSegment(chart)
    }
}
