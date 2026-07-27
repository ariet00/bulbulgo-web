import { Link } from '@doska/i18n'
import { KeyRound, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@doska/ui'

// Реестр отчётов: новый отчёт = запись здесь + страница в reports/<slug>/.
const REPORTS = [
    {
        slug: 'otp',
        title: 'OTP / SMS-верификация',
        description:
            'Отправка и подтверждение SMS-кодов: конверсия, ошибки и их причины, платформы, подозрительные номера.',
        icon: KeyRound,
    },
]

export default function ReportsPage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-semibold">Отчёты</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Готовые срезы по ключевым процессам продукта.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {REPORTS.map(report => (
                    <Link key={report.slug} href={`/admin/reports/${report.slug}`}>
                        <Card className="h-full transition-colors hover:border-primary/50 hover:bg-muted/50">
                            <CardContent className="flex items-start gap-4 p-5">
                                <div className="rounded-lg bg-muted p-2.5">
                                    <report.icon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium">{report.title}</span>
                                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {report.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
