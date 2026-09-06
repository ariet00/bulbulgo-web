// Persona form definition. Keys mirror backend
// apps/threeds/service/prompt_builder.py:PERSONA_FIELDS (Account.data keys);
// `required` mirrors PERSONA_REQUIRED there — without those the generator refuses to run.
// Each persona kind (THREADS_PERSONA_KINDS) shows its own field set; switching
// kinds keeps the other kind's values in Account.data untouched.
import type { ThreadsPersonaKind } from '@doska/shared'

export interface PersonaField {
  key: string
  label: string
  required?: boolean
  multiline?: boolean
  numeric?: boolean
  placeholder?: string
  hint?: string
}

const LANGUAGES: PersonaField = {
  key: 'persona_languages',
  label: 'Язык постов',
  required: true,
  placeholder: 'русский',
  hint: 'Можно несколько: «русский, кыргызский»',
}
const COUNTRY: PersonaField = { key: 'persona_country', label: 'Страна', placeholder: 'Кыргызстан' }
const CITY: PersonaField = { key: 'persona_city', label: 'Город', placeholder: 'Бишкек' }
const BLACKLIST: PersonaField = {
  key: 'persona_blacklist',
  label: 'О чём не писать',
  multiline: true,
  placeholder: 'политика, религия, конкуренты по имени',
  hint: 'Модель пропустит тему целиком, если она задевает этот список',
}

export const PERSONA_FIELDS_BY_KIND: Record<ThreadsPersonaKind, PersonaField[]> = {
  person: [
    {
      key: 'persona_role',
      label: 'Роль',
      required: true,
      placeholder: 'Владелец кофейни в Бишкеке',
      hint: 'Кто говорит: профессия, амплуа, чем известен',
    },
    {
      key: 'persona_context',
      label: 'Контекст',
      required: true,
      multiline: true,
      placeholder: 'Обжариваю зерно сам с 2019 года, пишу про кофе, город и своих гостей',
      hint: 'Биография и то, о чём этот человек обычно пишет',
    },
    LANGUAGES,
    {
      key: 'persona_tone',
      label: 'Тон',
      required: true,
      placeholder: 'тёплый, с самоиронией, без канцелярита',
    },
    { key: 'persona_gender', label: 'Пол', placeholder: 'мужской' },
    { key: 'persona_age', label: 'Возраст', numeric: true, placeholder: '34' },
    COUNTRY,
    CITY,
    {
      key: 'persona_interests',
      label: 'Интересы',
      placeholder: 'спешелти-кофе, велосипед, локальный бизнес',
    },
    {
      key: 'persona_whitelist',
      label: 'О чём писать',
      multiline: true,
      placeholder: 'кофе, кухня заведения, истории гостей, жизнь района',
    },
    BLACKLIST,
  ],
  brand: [
    {
      key: 'persona_brand',
      label: 'Компания',
      required: true,
      placeholder: 'Кофейня «Зерно»',
      hint: 'Название так, как оно должно звучать в постах',
    },
    { key: 'persona_industry', label: 'Сфера', placeholder: 'спешелти-кофейня и обжарка' },
    {
      key: 'persona_context',
      label: 'О компании',
      required: true,
      multiline: true,
      placeholder: 'Обжариваем сами с 2019 года, две точки в центре Бишкека, свой цех',
      hint: 'Факты, на которые опирается модель. Чего здесь нет, она не выдумывает: ни цен, ни акций',
    },
    {
      key: 'persona_offer',
      label: 'Продукты и услуги',
      multiline: true,
      placeholder: 'зерно свежей обжарки, кофе с собой, обучение бариста',
    },
    {
      key: 'persona_audience',
      label: 'Аудитория',
      placeholder: 'офисные сотрудники 25–40, гости города',
    },
    {
      key: 'persona_tone',
      label: 'Тон бренда',
      required: true,
      placeholder: 'дружелюбный, экспертный, без пафоса',
    },
    LANGUAGES,
    COUNTRY,
    CITY,
    {
      key: 'persona_cta',
      label: 'Призыв к действию и контакты',
      multiline: true,
      placeholder: 'приглашать в гости на Токтогула 120, ссылка в профиле',
      hint: 'Модель вставляет это только там, где уместно, не в каждом посте',
    },
    {
      key: 'persona_whitelist',
      label: 'Рубрики и темы',
      multiline: true,
      placeholder: 'закулисье, новинки меню, советы по кофе, истории гостей',
    },
    BLACKLIST,
  ],
}

export const PERSONA_KIND_HINTS: Record<ThreadsPersonaKind, string> = {
  person: 'Аккаунт живого человека: модель пишет от его лица. Поля со звёздочкой обязательны, без них генерация не запустится.',
  brand:
    'Страница компании: модель ведёт её как SMM-менеджер, говорит «мы» и опирается только на указанные факты. Поля со звёздочкой обязательны.',
}

/** Every Account.data key either kind may write (the form keeps all of them). */
export const PERSONA_FIELD_KEYS: string[] = Array.from(
  new Set(Object.values(PERSONA_FIELDS_BY_KIND).flat().map((f) => f.key)),
)

// Mirror backend PERSONA_TEMPLATE_KEYS / GENERATION_TEMPLATE_KEYS.
export const PERSONA_TEMPLATE_PLACEHOLDERS = [
  'role',
  'brand',
  'industry',
  'offer',
  'audience',
  'cta',
  'context',
  'languages',
  'tone',
  'gender',
  'age',
  'country',
  'city',
  'location',
  'interests',
  'whitelist',
  'blacklist',
] as const

export const GENERATION_TEMPLATE_PLACEHOLDERS = [
  'num_posts',
  'context_summary',
  'languages',
  'role',
  'brand',
] as const
