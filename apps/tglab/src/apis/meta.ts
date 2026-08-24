import { api } from '@/apis/client'
import type { TglabMeta } from '@/types'

/** Value sets + labels of the whole domain, straight from the backend
 *  constants — the UI never hardcodes an enum. */
export async function getMeta() {
  const { data } = await api.get<TglabMeta>('/tglab/meta')
  return data
}
