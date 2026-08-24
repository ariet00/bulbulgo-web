import { notFound } from 'next/navigation'

// Catch-all для несуществующих URL: любой путь, не совпавший с реальным
// роутом, рендерит (site)/not-found.tsx внутри сайтового хрома.
export default function CatchAllPage() {
    notFound()
}
