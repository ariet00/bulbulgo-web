// Контент FAQ — статический, три локали (ru/en/ky). Правки = деплой Vercel.
// Черновой стартовый набор: формулировки общие, без деталей, которых нет в
// продукте; при добавлении вопроса заполняются все три локали.

export type Localized = { ru: string; en: string; ky: string }

export type FaqCategoryId = 'trips' | 'account' | 'safety'

export const FAQ_CATEGORIES: { id: FaqCategoryId; label: Localized }[] = [
    {
        id: 'trips',
        label: {
            ru: 'Поездки и оплата',
            en: 'Trips & payment',
            ky: 'Сапарлар жана төлөм',
        },
    },
    {
        id: 'account',
        label: {
            ru: 'Аккаунт и профиль',
            en: 'Account & profile',
            ky: 'Аккаунт жана профиль',
        },
    },
    {
        id: 'safety',
        label: {
            ru: 'Безопасность',
            en: 'Safety',
            ky: 'Коопсуздук',
        },
    },
]

export type FaqItem = {
    id: string
    category: FaqCategoryId
    question: Localized
    answer: Localized
}

// Пока пусто — страница показывает «Вопросы скоро появятся». Добавить вопрос:
// { id: 'kebab-slug', category: 'trips'|'account'|'safety',
//   question: {ru, en, ky}, answer: {ru, en, ky} }
export const FAQ_ITEMS: FaqItem[] = []

export const FAQ_UI = {
    searchPlaceholder: {
        ru: 'Поиск по вопросам',
        en: 'Search questions',
        ky: 'Суроолордон издөө',
    },
    allChip: {
        ru: 'Все',
        en: 'All',
        ky: 'Баары',
    },
    notFoundTitle: {
        ru: 'Ничего не нашлось',
        en: 'Nothing found',
        ky: 'Эч нерсе табылган жок',
    },
    emptyTitle: {
        ru: 'Вопросы скоро появятся',
        en: 'Questions are coming soon',
        ky: 'Суроолор жакында пайда болот',
    },
    emptyText: {
        ru: 'Мы собираем ответы на частые вопросы. А пока напишите нам — поддержка поможет.',
        en: "We're putting together answers to common questions. Meanwhile, message us — support will help.",
        ky: 'Көп берилүүчү суроолорго жоопторду даярдап жатабыз. Азырынча бизге жазыңыз — колдоо жардам берет.',
    },
    notFoundText: {
        ru: 'Попробуйте изменить запрос или напишите нам в поддержку.',
        en: 'Try a different search or message our support.',
        ky: 'Башка сөз менен издеп көрүңүз же колдоого жазыңыз.',
    },
    ctaTitle: {
        ru: 'Не нашли ответ?',
        en: "Didn't find an answer?",
        ky: 'Жооп таппадыңызбы?',
    },
    ctaText: {
        ru: 'Напишите нам — поддержка отвечает прямо в приложении.',
        en: 'Message us — support replies right in the app.',
        ky: 'Бизге жазыңыз — колдоо түз колдонмодо жооп берет.',
    },
    ctaButton: {
        ru: 'Написать в поддержку',
        en: 'Contact support',
        ky: 'Колдоого жазуу',
    },
} satisfies Record<string, Localized>
