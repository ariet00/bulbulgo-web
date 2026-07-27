// Таб «Карта»: заглушка до фазы 2 (MapLibre поверх self-hosted тайлов —
// ждёт деплоя geo-стека, см. docs/plans/fuel-service.md §6).

export default function FuelMapPage() {
    return (
        <main className="mx-auto flex max-w-lg flex-col items-center px-6 pt-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fl-accent-soft)] text-[var(--fl-accent)]">
                <svg
                    width="26"
                    height="26"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                >
                    <path d="m2.4 4.2 3.6-1.6 4 1.6 3.6-1.6v9.2l-3.6 1.6-4-1.6-3.6 1.6Z" />
                    <path d="M6 2.8v9.2M10 4.4v9.2" opacity="0.5" />
                </svg>
            </div>
            <span className="mb-2 rounded-full bg-[var(--fl-accent-soft)] px-3 py-1 text-[12px] font-semibold text-[var(--fl-accent)]">
                Скоро
            </span>
            <h1 className="text-[18px] font-bold">Карта заправок</h1>
            <p className="mt-1.5 text-[13.5px] leading-snug text-muted-foreground">
                АЗС со статусами наличия прямо на карте города. Пока
                пользуйтесь лентой — она сортирует заправки по удалению от вас.
            </p>
        </main>
    )
}
