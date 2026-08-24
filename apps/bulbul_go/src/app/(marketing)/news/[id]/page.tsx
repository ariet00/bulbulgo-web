import { redirect } from 'next/navigation'

// Мок-статьи удалены; старые ссылки /news/<id> ведём на список новостей.
export default function NewsDetailPage() {
    redirect('/news')
}
