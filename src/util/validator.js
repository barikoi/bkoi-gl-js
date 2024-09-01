export function isBarikoiStyle(style) {
    if(typeof style === 'string' && style.includes('barikoi.com')) {
        return true
    }

    return false
}