import Taro, { SelectorQuery } from '@tarojs/taro'

const { getEnv, ENV_TYPE } = Taro
const ENV = Taro.getEnv()

type ENVS = {
    isWEAPP: boolean,
    isALIPAY: boolean,
    isWEB: boolean,
}

const getEnvs = (): ENVS => {
    const env = getEnv()

    return {
        isWEAPP: env === ENV_TYPE.WEAPP,
        isALIPAY: env === ENV_TYPE.ALIPAY,
        isWEB: env === ENV_TYPE.WEB,
    }
}

function pxTransform(size: number): string {
    if (!size) return ''

    const designWidth = 750
    const deviceRatio = {
        640: 2.34 / 2,
        750: 1,
        828: 1.81 / 2,
    }

    return `${size / deviceRatio[designWidth]}rpx`
}

function delay(delayTime = 500): Promise<null> {
    return new Promise((resolve) => {
        if ([Taro.ENV_TYPE.WEB, Taro.ENV_TYPE.SWAN, Taro.ENV_TYPE.WEAPP].includes(ENV)) {
            setTimeout(() => {
                resolve()
            }, delayTime)
            return
        }
        resolve()
    })
}

function delayQuerySelector(_, selectorStr: string, delayTime = 500): Promise<[]> {
    false && console.log(_)
    const selector: SelectorQuery = Taro.createSelectorQuery()

    return new Promise((resolve) => {
        delay(delayTime).then(() => {
            selector
                .select(selectorStr)
                .boundingClientRect()
                .exec((res: []) => {
                    resolve(res)
                })
        })
    })
}

const objectToString = (style: object | string): string => {
    if (style && typeof style === 'object') {
        let styleStr = ''
        Object.keys(style).forEach((key) => {
            const lowerCaseKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
            styleStr += `${lowerCaseKey}:${style[key]};`
        })
        return styleStr
    } else if (style && typeof style === 'string') {
        return style
    }
    return ''
}

function mergeStyle(style1: object | string, style2: object | string): object | string {
    if (style1 && typeof style1 === 'object' && style2 && typeof style2 === 'object') {
        return Object.assign({}, style1, style2)
    }
    return objectToString(style1) + objectToString(style2)
}

let scrollTop = 0
function handleTouchScroll(flag: any): void {
    if (ENV !== Taro.ENV_TYPE.WEB) {
        return
    }
    if (flag) {
        scrollTop = document.documentElement.scrollTop

        // 使body脱离文档流
        document.body.classList.add('at-frozen')

        // 把脱离文档流的body拉上去！否则页面会回到顶部！
        document.body.style.top = `${-scrollTop}px`
    } else {
        document.body.style.top = ''
        document.body.classList.remove('at-frozen')

        document.documentElement.scrollTop = scrollTop
    }
}

function uuid(len = 8, radix = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    const value: string[] = []
    let i = 0
    radix = radix || chars.length

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) value[i] = chars[0 | (Math.random() * radix)]
    } else {
        // rfc4122, version 4 form
        let r

        // rfc4122 requires these characters
        /* eslint-disable-next-line */
        value[8] = value[13] = value[18] = value[23] = '-'
        value[14] = '4'

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!value[i]) {
                r = 0 | (Math.random() * 16)
                value[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r]
            }
        }
    }

    return value.join('')
}

export {
    pxTransform,
    getEnvs,
    delayQuerySelector,
    mergeStyle,
    handleTouchScroll,
    uuid,
}