import { ZH_CN } from '@/lang/zh-CN'
import { EN } from '@/lang/en'

export type Lang = typeof ZH_CN
export type LangType = 'zh-CN' | 'en'
export function determineLang(lang: LangType) {
    switch (lang) {
        case 'en':
            return EN
        case 'zh-CN':
            return ZH_CN
        default:
            return ZH_CN
    }
}
