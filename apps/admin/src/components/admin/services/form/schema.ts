import { z } from 'zod'
import type { AdminService, AdminServiceCreate, FeedTemplate } from '@/apis/admin'
import { canHaveTab, HOME_FEED_PARENT_SLUG } from '@/apis/admin'

// Заглушки для Select: пустая строка в Radix-селекте запрещена, а «не задано»
// выбирать надо.
export const NO_BADGE = '__none__'
export const NO_GROUP = '__ungrouped__'
export const NO_PARENT = '__root__'
export const NO_TEMPLATE = '__builtin__'
export const NO_FEED_SERVICE = '__none__'

const localized = z.record(z.string(), z.string())

const httpUrl = /^https?:\/\/.+/i
// Повторяет _COLOR_RE и _SLUG_RE в backend/apps/services/schemas.py — чтобы
// 422 прилетало разве что на гонке, а не на каждой опечатке.
const colorRe = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
const slugRe = /^[a-z][a-z0-9_]*$/

const navItemSchema = z.object({
    label: localized,
    icon: z.string(),
    kind: z.enum(['url', 'route']),
    value: z.string(),
})

export const serviceFormSchema = z
    .object({
        slug: z.string().regex(slugRe, 'Латиница, цифры и «_», начиная с буквы'),
        type: z.enum(['native', 'webview']),
        label: localized,
        description: localized,
        icon: z.string(),
        color: z.string(),
        badge: z.string(),
        show_in_tabs: z.boolean(),
        hidden: z.boolean(),
        url: z.string(),
        auth: z.boolean(),
        app_bar: z.boolean(),
        nav_items: z.array(navItemSchema),
        marketplace_root: z.string(),
        enabled: z.boolean(),
        position: z.number().int(),
        group: z.string(),
        parent: z.string(),
        feed_service: z.string(),
        template: z.string(),
    })
    .superRefine((v, ctx) => {
        if (v.type === 'webview' && !httpUrl.test(v.url.trim())) {
            ctx.addIssue({
                code: 'custom',
                path: ['url'],
                message: 'Webview-сервису нужен адрес, начиная с http(s)://',
            })
        }
        if (v.color.trim() && !colorRe.test(v.color.trim())) {
            ctx.addIssue({
                code: 'custom',
                path: ['color'],
                message: 'HEX-цвет вида #RRGGBB или #RGB',
            })
        }
        if (v.icon.trim().startsWith('/')) {
            ctx.addIssue({
                code: 'custom',
                path: ['icon'],
                message: 'Либо имя значка из набора, либо полный http(s)-адрес',
            })
        }
        v.nav_items.forEach((item, i) => {
            const value = item.value.trim()
            if (!value) return
            if (item.kind === 'url' && !httpUrl.test(value)) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['nav_items', i, 'value'],
                    message: 'Страница — адрес, начиная с http(s)://',
                })
            }
            if (item.kind === 'route' && !value.startsWith('/')) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['nav_items', i, 'value'],
                    message: 'Экран — роут приложения, начиная с «/»',
                })
            }
        })
    })

export type ServiceFormValues = z.infer<typeof serviceFormSchema>

export const defaultValues = (initial?: AdminService): ServiceFormValues => ({
    slug: initial?.slug ?? '',
    type: initial?.type ?? 'webview',
    label: initial?.label ?? {},
    description: initial?.description ?? {},
    icon: initial?.icon ?? '',
    color: initial?.color ?? '',
    badge: initial?.badge ?? NO_BADGE,
    show_in_tabs: initial?.show_in_tabs ?? true,
    hidden: initial?.hidden ?? false,
    url: initial?.url ?? '',
    auth: initial?.auth ?? false,
    app_bar: initial?.app_bar ?? true,
    nav_items: initial?.nav_items?.map((i) => ({ ...i })) ?? [],
    marketplace_root: initial?.marketplace_root ?? '',
    enabled: initial?.enabled ?? true,
    position: initial?.position ?? 0,
    group: initial?.group ?? NO_GROUP,
    parent: initial?.parent_slug ?? NO_PARENT,
    feed_service: initial?.service ?? NO_FEED_SERVICE,
    template: initial?.template ?? NO_TEMPLATE,
})

/** Дочерний сервис — плитка внутри раздела родителя, а не карточка «Главной». */
export const isChildValues = (v: ServiceFormValues) => v.parent !== NO_PARENT

/** Чип ленты «Главной» — ребёнок home_feed; только у него есть блок и шаблон. */
export const isFeedChipValues = (v: ServiceFormValues) =>
    v.parent === HOME_FEED_PARENT_SLUG

/**
 * Может ли этот сервис попасть в таб-бар. Клиент рисует таб только для
 * native-сервиса с известным ему слагом (см. canHaveTab), поэтому у остальных
 * переключателя нет — и в базу уходит false, чтобы список не врал.
 */
export const canHaveTabValues = (v: ServiceFormValues) =>
    canHaveTab({
        type: v.type,
        slug: v.slug,
        parent_slug: isChildValues(v) ? v.parent : null,
    })

/** Значения формы → тело запроса. Поля, не значащие ничего для текущего типа
 *  и размещения, обнуляются здесь, а не копятся мусором в data JSONB. */
export const toBody = (v: ServiceFormValues): AdminServiceCreate => {
    const child = isChildValues(v)
    const feedChip = isFeedChipValues(v)
    const webview = v.type === 'webview'
    return {
        slug: v.slug.trim(),
        type: v.type,
        label: v.label,
        description: v.description,
        icon: v.icon.trim() || null,
        color: v.color.trim() || null,
        badge:
            v.badge === NO_BADGE ? null : (v.badge as 'new' | 'soon' | 'hit'),
        show_in_tabs: canHaveTabValues(v) ? v.show_in_tabs : false,
        hidden: v.hidden,
        url: webview ? v.url.trim() : null,
        auth: webview ? v.auth : false,
        app_bar: webview ? v.app_bar : true,
        nav_items: webview ? v.nav_items.filter((i) => i.value.trim()) : [],
        // скоуп каталога не зависит от типа: webview-авторынок тоже шлёт
        // X-Service-Slug, null здесь ломает ему категории (400 на бэке)
        marketplace_root: v.marketplace_root.trim() || null,
        enabled: v.enabled,
        position: v.position,
        // у дочернего сервиса группы «Главной» не бывает
        group: child || v.group === NO_GROUP ? null : v.group,
        parent_slug: child ? v.parent : null,
        service:
            feedChip && v.feed_service !== NO_FEED_SERVICE
                ? v.feed_service
                : null,
        template:
            feedChip && v.template !== NO_TEMPLATE
                ? (v.template as FeedTemplate)
                : null,
    }
}

/** Значения формы → карточка в форме ответа API: превью и чипы размещения
 *  разбирают ровно то же, что потом придёт списку. */
export const toPreview = (v: ServiceFormValues): AdminService =>
    ({ id: 0, created_at: null, ...toBody(v) }) as AdminService
