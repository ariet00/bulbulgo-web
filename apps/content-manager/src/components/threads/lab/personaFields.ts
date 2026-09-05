// Persona form definition. Keys mirror backend
// apps/threeds/service/prompt_builder.py:PERSONA_FIELDS (Account.data keys);
// `required` mirrors PERSONA_REQUIRED there — without those the generator refuses to run.
export interface PersonaField {
  key: string
  label: string
  required?: boolean
  multiline?: boolean
  numeric?: boolean
  placeholder?: string
  hint?: string
}

export const PERSONA_FIELDS: PersonaField[] = [
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
  {
    key: 'persona_languages',
    label: 'Язык постов',
    required: true,
    placeholder: 'русский',
    hint: 'Можно несколько: «русский, кыргызский»',
  },
  {
    key: 'persona_tone',
    label: 'Тон',
    required: true,
    placeholder: 'тёплый, с самоиронией, без канцелярита',
  },
  { key: 'persona_gender', label: 'Пол', placeholder: 'мужской' },
  { key: 'persona_age', label: 'Возраст', numeric: true, placeholder: '34' },
  { key: 'persona_country', label: 'Страна', placeholder: 'Кыргызстан' },
  { key: 'persona_city', label: 'Город', placeholder: 'Бишкек' },
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
  {
    key: 'persona_blacklist',
    label: 'О чём не писать',
    multiline: true,
    placeholder: 'политика, религия, конкуренты по имени',
    hint: 'Модель пропустит тему целиком, если она задевает этот список',
  },
]

export const PERSONA_TEMPLATE_PLACEHOLDERS = [
  'role',
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
] as const
