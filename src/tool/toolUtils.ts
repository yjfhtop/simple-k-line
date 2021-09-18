import { Triangle } from '@/tool/triangle'
import { BaseChart } from '@/chart/baseChart'

export interface ToolMap {
    triangle: Triangle
}

export type ToolTypes = keyof ToolMap

// 创建Shape
export function createTool(name: ToolTypes, chart: BaseChart) {
    switch (name) {
        case 'triangle':
            return new Triangle(chart)
    }
}
