import { redirect } from 'next/navigation'

export default function ParserIndexPage({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/admin/parser/settings`)
}
