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

export const FAQ_ITEMS: FaqItem[] = [
    {
        id: 'find-trip',
        category: 'trips',
        question: {
            ru: 'Как найти поездку?',
            en: 'How do I find a trip?',
            ky: 'Сапарды кантип табам?',
        },
        answer: {
            ru: 'Укажите на главном экране, откуда и куда едете, и дату. Откройте подходящую поездку в списке — там видны время выезда, цена за место и профиль водителя.',
            en: "Set where you're going from and to and the date on the home screen. Open a trip from the list to see the departure time, seat price and the driver's profile.",
            ky: 'Башкы экранда кайдан кайда бараарыңызды жана күндү тандаңыз. Тизмеден ылайыктуу сапарды ачыңыз — чыгуу убактысы, орундун баасы жана айдоочунун профили көрүнөт.',
        },
    },
    {
        id: 'book-seat',
        category: 'trips',
        question: {
            ru: 'Как забронировать место?',
            en: 'How do I book a seat?',
            ky: 'Орунду кантип брондойм?',
        },
        answer: {
            ru: 'Откройте поездку, нажмите «Забронировать» и выберите количество мест. Водитель получит уведомление, а статус брони появится в ваших поездках.',
            en: 'Open a trip, tap "Book" and choose the number of seats. The driver gets notified, and the booking status appears in your trips.',
            ky: 'Сапарды ачып, «Брондоо» баскычын басыңыз да, орун санын тандаңыз. Айдоочуга билдирүү барат, брондун абалы сиздин сапарларыңызда көрүнөт.',
        },
    },
    {
        id: 'pay-trip',
        category: 'trips',
        question: {
            ru: 'Как оплатить поездку?',
            en: 'How do I pay for a trip?',
            ky: 'Сапар үчүн кантип төлөйм?',
        },
        answer: {
            ru: 'Оплата — напрямую водителю, как договоритесь: наличными или переводом. Цена за место указана в поездке заранее.',
            en: 'You pay the driver directly, as agreed: cash or transfer. The seat price is shown in the trip up front.',
            ky: 'Төлөм түз айдоочуга берилет, кантип макулдашсаңыз: накталай же которуу менен. Орундун баасы сапарда алдын ала көрсөтүлгөн.',
        },
    },
    {
        id: 'cancel-booking',
        category: 'trips',
        question: {
            ru: 'Как отменить бронь?',
            en: 'How do I cancel a booking?',
            ky: 'Бронду кантип жокко чыгарам?',
        },
        answer: {
            ru: 'Откройте свою поездку и отмените бронь. Если планы изменились, предупредите водителя заранее — удобнее всего в чате поездки.',
            en: 'Open your trip and cancel the booking. If your plans change, let the driver know in advance — the trip chat is the easiest way.',
            ky: 'Өз сапарыңызды ачып, бронду жокко чыгарыңыз. Пландар өзгөрсө, айдоочуга алдын ала айтыңыз — сапар чатында жазган ыңгайлуу.',
        },
    },
    {
        id: 'publish-trip',
        category: 'trips',
        question: {
            ru: 'Я водитель. Как опубликовать поездку?',
            en: "I'm a driver. How do I publish a trip?",
            ky: 'Мен айдоочумун. Сапарды кантип жарыялайм?',
        },
        answer: {
            ru: 'Создайте поездку, указав маршрут, дату и время выезда, количество мест и цену. После публикации её увидят пассажиры и смогут бронировать места.',
            en: 'Create a trip with the route, date and departure time, number of seats and price. Once published, passengers can find it and book seats.',
            ky: 'Каттамды, күнүн жана чыгуу убактысын, орун санын жана баасын көрсөтүп, сапар түзүңүз. Жарыялангандан кийин жүргүнчүлөр аны таап, орун брондой алышат.',
        },
    },
    {
        id: 'edit-profile',
        category: 'account',
        question: {
            ru: 'Как изменить данные профиля?',
            en: 'How do I edit my profile?',
            ky: 'Профилдин маалыматын кантип өзгөртөм?',
        },
        answer: {
            ru: 'Откройте «Профиль» и перейдите в редактирование: имя, фото и информация об автомобиле (для водителей) меняются там.',
            en: 'Open "Profile" and go to editing: your name, photo and vehicle info (for drivers) are changed there.',
            ky: '«Профилди» ачып, түзөтүүгө өтүңүз: аты-жөнү, сүрөт жана унаа тууралуу маалымат (айдоочулар үчүн) ошол жерде өзгөртүлөт.',
        },
    },
    {
        id: 'delete-account',
        category: 'account',
        question: {
            ru: 'Как удалить аккаунт?',
            en: 'How do I delete my account?',
            ky: 'Аккаунтту кантип өчүрөм?',
        },
        answer: {
            ru: 'В настройках профиля выберите удаление аккаунта. Данные будут удалены; восстановить аккаунт после этого нельзя.',
            en: "Choose account deletion in your profile settings. Your data will be removed; the account can't be restored afterwards.",
            ky: 'Профилдин жөндөөлөрүнөн аккаунтту өчүрүүнү тандаңыз. Маалыматтар өчүрүлөт; андан кийин аккаунтту калыбына келтирүү мүмкүн эмес.',
        },
    },
    {
        id: 'notifications',
        category: 'account',
        question: {
            ru: 'Какие уведомления присылает приложение?',
            en: 'What notifications does the app send?',
            ky: 'Колдонмо кандай билдирүүлөрдү жиберет?',
        },
        answer: {
            ru: 'Пуши о бронированиях, сообщениях в чатах и изменениях по вашим поездкам. Если уведомления не приходят, проверьте разрешения в настройках телефона.',
            en: "Pushes about bookings, chat messages and changes to your trips. If they don't arrive, check permissions in your phone settings.",
            ky: 'Брондоо, чаттагы билдирүүлөр жана сапарларыңыздагы өзгөрүүлөр тууралуу пуштар. Билдирүүлөр келбесе, телефондун жөндөөлөрүндөгү уруксаттарды текшериңиз.',
        },
    },
    {
        id: 'ratings',
        category: 'safety',
        question: {
            ru: 'Как работают отзывы и рейтинг?',
            en: 'How do reviews and ratings work?',
            ky: 'Пикирлер жана рейтинг кантип иштейт?',
        },
        answer: {
            ru: 'После поездки участники могут оценить друг друга и оставить отзыв. Рейтинг виден в профиле и помогает выбирать надёжных попутчиков.',
            en: 'After a trip, participants can rate each other and leave a review. The rating is shown in the profile and helps choose reliable companions.',
            ky: 'Сапардан кийин катышуучулар бири-бирине баа берип, пикир калтыра алышат. Рейтинг профилде көрүнөт жана ишенимдүү жол шериктерин тандоого жардам берет.',
        },
    },
    {
        id: 'report-user',
        category: 'safety',
        question: {
            ru: 'Что делать, если пользователь ведёт себя некорректно?',
            en: 'What if a user behaves inappropriately?',
            ky: 'Колдонуучу орой мамиле кылса эмне кылам?',
        },
        answer: {
            ru: 'Напишите в поддержку — мы разберёмся. Пользователя также можно заблокировать: он больше не сможет вам писать.',
            en: "Contact support — we'll look into it. You can also block the user so they can't message you anymore.",
            ky: 'Колдоо кызматына жазыңыз — биз карап чыгабыз. Ошондой эле колдонуучуну бөгөттөсө болот: ал сизге кайра жаза албайт.',
        },
    },
]

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
