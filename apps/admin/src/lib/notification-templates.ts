import type { AdminBroadcastFilters } from '@/apis/admin'

// Шаблоны уведомлений хранятся в localStorage и общие для всех экранов
// отправки (страница рассылок + вкладка «Уведомление» в карточке пользователя),
// поэтому один похожий текст можно переиспользовать где угодно.
export const TEMPLATE_STORAGE_KEY = 'admin:notification-templates:v1'

export type NotificationTemplate = {
    name: string
    tab: 'user' | 'broadcast'
    title: string
    body: string
    type: string
    category: string
    clickAction: string
    dataJson: string
    isDataOnly: boolean
    filters: AdminBroadcastFilters
}

// Встроенные готовые шаблоны — показываются всегда, отдельным блоком над
// пользовательскими, удалить их нельзя. Текст можно править после применения.
export const BUILT_IN_TEMPLATES: NotificationTemplate[] = [
    {
        name: 'Спасибо за жалобу',
        tab: 'user',
        title: 'Спасибо за обращение 🙏',
        body: 'Мы получили вашу жалобу и уже разбираемся. Такие сигналы помогают делать BulBul Go безопаснее и удобнее для всех. Спасибо за обратную связь!',
        type: 'info',
        category: 'system',
        clickAction: '',
        dataJson: '',
        isDataOnly: false,
        filters: {},
    },
    {
        name: 'Вышло обновление',
        tab: 'user',
        title: 'Доступно обновление 🚀',
        body: 'Мы выпустили новую версию приложения: исправили ошибки и добавили улучшения. Обновите приложение, чтобы всё работало быстро и стабильно.',
        type: 'info',
        category: 'system',
        clickAction: '',
        dataJson: '',
        isDataOnly: false,
        filters: {},
    },
    {
        name: 'Предупреждение о нарушении',
        tab: 'user',
        title: 'Предупреждение ⚠️',
        body: 'Мы заметили в вашем аккаунте действия, которые нарушают правила сервиса. Пожалуйста, не повторяйте их — при повторном нарушении доступ к аккаунту может быть ограничен.',
        type: 'warning',
        category: 'system',
        clickAction: '',
        dataJson: '',
        isDataOnly: false,
        filters: {},
    },
    {
        name: 'Доступ восстановлен',
        tab: 'user',
        title: 'Доступ восстановлен ✅',
        body: 'Проверка завершена — доступ к вашему аккаунту полностью восстановлен. Спасибо за понимание и приятных поездок!',
        type: 'info',
        category: 'system',
        clickAction: '',
        dataJson: '',
        isDataOnly: false,
        filters: {},
    },
    {
        name: 'Заполнить профиль',
        tab: 'user',
        title: 'Заполните профиль 📝',
        body: 'Пользователи охотнее договариваются с теми, у кого заполнен профиль: фото, имя и телефон. Это займёт всего минуту.',
        type: 'info',
        category: 'system',
        clickAction: '/profile',
        dataJson: '',
        isDataOnly: false,
        filters: {},
    },
    {
        name: 'Оценить поездку',
        tab: 'user',
        title: 'Как прошла поездка? ⭐',
        body: 'Поделитесь впечатлениями о недавней поездке — отзывы помогают другим пользователям выбирать надёжных попутчиков.',
        type: 'info',
        category: 'system',
        clickAction: '/rideshare/history',
        dataJson: '',
        isDataOnly: false,
        filters: {},
    },
    {
        name: 'Спасибо, что с нами',
        tab: 'user',
        title: 'Спасибо, что вы с нами 💙',
        body: 'Вы активно пользуетесь BulBul Go — спасибо за доверие! Если есть идеи, как сделать сервис лучше, напишите нам — мы читаем каждое сообщение.',
        type: 'info',
        category: 'system',
        clickAction: '',
        dataJson: '',
        isDataOnly: false,
        filters: {},
    },
]

export function loadTemplates(): NotificationTemplate[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export function saveTemplates(templates: NotificationTemplate[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates))
}
