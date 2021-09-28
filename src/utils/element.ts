/**
 * dom元素相关
 */

/**
 * 查找容器元素， 如果是字符串则查找元素
 * @param el
 */
export function getContainerEl(
    el: HTMLElement | string = '#k_line'
): HTMLElement {
    if (typeof el === 'string') {
        return document.querySelector(el)
    } else {
        return el
    }
}

/**
 * 获取文本的宽度
 * @param ctx
 * @param txt
 * @param fontSize
 * @param fontFamily
 * @param ceil
 */
export function getTxtW(
    ctx: CanvasRenderingContext2D,
    txt: string,
    fontSize?: number,
    fontFamily = '',
    ceil = true
) {
    let w: number
    ctx.save()
    // font && (ctx.font = font)
    if (fontSize || fontFamily) {
        ctx.font = `${fontSize} ${fontFamily}`
    }
    w = ctx.measureText(txt).width
    ctx.restore()
    w = ceil ? Math.ceil(w) : w
    return w
}

/**
 * 获取屏幕比
 */
export function getPixelRatio() {
    return window.devicePixelRatio || 1
}

export interface CanvasElCtx {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
}

/**
 * 创建高清canvas
 * @param w
 * @param h
 * @param style
 */
export function createHDCanvas(
    w: number,
    h: number,
    style?: Partial<CSSStyleDeclaration>
): CanvasElCtx {
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')

    let pxRatio = getPixelRatio()

    canvas.width = w * pxRatio
    canvas.height = h * pxRatio

    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'

    ctx.scale(pxRatio, pxRatio)

    if (style) {
        Object.keys(style).forEach((key) => {
            canvas.style[key as any] = style[key as any]
        })
    }

    return {
        canvas,
        ctx,
    }
}

export interface WH {
    w: number
    h: number
}
/**
 * 获取容器的宽高， 不包含 padding
 * @param el
 * @param floor 是否向下取整
 */
export function getEleHW(el: HTMLElement, floor = true): WH {
    const elData = window.getComputedStyle && window.getComputedStyle(el)
    const H = parseFloat(elData.height)
    const W = parseFloat(elData.width)
    return {
        w: floor ? Math.floor(W) : W,
        h: floor ? Math.floor(H) : H,
    }
}
