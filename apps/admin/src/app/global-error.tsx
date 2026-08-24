'use client'

// Last-resort boundary: catches errors thrown by the root layout itself (where
// per-segment error.tsx can't reach). Must render its own <html>/<body>.
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="ru">
            <body
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                    padding: 24,
                    textAlign: 'center',
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>
                    Что-то пошло не так
                </h2>
                <p style={{ fontSize: 14, color: '#666', maxWidth: 420 }}>
                    {error?.message || 'Непредвиденная ошибка приложения.'}
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={() => reset()}
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: 6,
                            padding: '8px 16px',
                            fontSize: 14,
                        }}
                    >
                        Повторить
                    </button>
                    <button
                        onClick={() => {
                            window.location.href = '/login'
                        }}
                        style={{
                            background: '#111',
                            color: '#fff',
                            borderRadius: 6,
                            padding: '8px 16px',
                            fontSize: 14,
                        }}
                    >
                        Войти заново
                    </button>
                </div>
            </body>
        </html>
    )
}
