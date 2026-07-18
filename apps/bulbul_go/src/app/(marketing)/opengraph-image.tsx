import { ogAlt, ogSize, ogContentType, renderBrandOgImage } from '../_og/banner'

export const alt = ogAlt
export const size = ogSize
export const contentType = ogContentType

export default function Image() {
    return renderBrandOgImage()
}
