import Link from 'next/link'
import {
    ArrowRight,
    Bird,
    TrendingUp,
    ShieldCheck,
    Users,
    MapPin,
    Smartphone,
    Download,
} from 'lucide-react'

const features = [
    {
        icon: <TrendingUp className="h-10 w-10 text-green-500" />,
        title: 'Экономия',
        desc: 'Делите стоимость топлива и парковки между всеми участниками поездки.',
    },
    {
        icon: <ShieldCheck className="h-10 w-10 text-blue-500" />,
        title: 'Безопасность',
        desc: 'Проверенные профили пользователей и система рейтингов для вашего спокойствия.',
    },
    {
        icon: <Users className="h-10 w-10 text-purple-500" />,
        title: 'Сообщество',
        desc: 'Найдите единомышленников и сделайте дальние поездки увлекательными.',
    },
]

const steps = [
    { step: '01', title: 'Регистрация', text: 'Создайте профиль и подтвердите свои данные для доступа к сервису.' },
    { step: '02', title: 'Поиск или Публикация', text: 'Найдите маршрут в качестве пассажира или предложите свободные места в авто.' },
    { step: '03', title: 'Бронирование', text: 'Обсудите детали в чате и подтвердите поездку одним кликом.' },
    { step: '04', title: 'Поехали!', text: 'Встречайтесь в назначенном месте и наслаждайтесь путешествием.' },
]

export default function HomePage() {
    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-blue-600 py-20 lg:py-32 overflow-hidden">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-10">
                    <Bird size={400} />
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="lg:w-2/3">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                            Дорога приятнее, когда есть с кем разделить путь
                        </h1>
                        <p className="text-xl text-blue-100 mb-10 max-w-xl">
                            BulBul Go соединяет водителей и пассажиров для
                            совместных поездок по всей стране. Экономьте деньги,
                            время и планету.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/news"
                                className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition shadow-lg flex items-center justify-center"
                            >
                                Узнать новости{' '}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <a
                                href="#download"
                                className="bg-blue-700 bg-opacity-40 border border-blue-400 border-opacity-30 text-white px-8 py-4 rounded-full font-medium text-lg text-center backdrop-blur-sm hover:bg-opacity-60 transition-all flex items-center justify-center"
                            >
                                Скачать приложение 📱
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Почему выбирают BulBul Go?
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Мы создаем сообщество ответственных и дружелюбных
                        путешественников.
                    </p>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="bg-muted/50 p-8 rounded-3xl hover:shadow-xl transition-all duration-300 border border-border group"
                            >
                                <div className="mb-6 transform group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 bg-blue-50 dark:bg-blue-950/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                                Как это работает?
                            </h2>
                            <div className="space-y-8">
                                {steps.map((item, i) => (
                                    <div key={i} className="flex gap-6">
                                        <span className="text-3xl font-black text-blue-200 dark:text-blue-800">
                                            {item.step}
                                        </span>
                                        <div>
                                            <h4 className="text-xl font-bold text-foreground mb-1">
                                                {item.title}
                                            </h4>
                                            <p className="text-muted-foreground">
                                                {item.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="lg:w-1/2 bg-blue-600 rounded-3xl p-8 text-white aspect-video flex items-center justify-center shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
                            <div className="text-center z-10">
                                <MapPin className="h-16 w-16 mx-auto mb-4 animate-bounce" />
                                <p className="text-2xl font-bold italic">
                                    Карта поездок скоро здесь!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* App Download Section */}
            <section
                id="download"
                className="py-20 bg-gray-900 text-white scroll-mt-16"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <h2 className="text-3xl md:text-5xl font-black mb-6">
                                Будьте мобильными с BulBul Go
                            </h2>
                            <p className="text-gray-400 text-lg mb-10">
                                Скачивайте наше приложение для Android и iOS,
                                чтобы планировать поездки в любом месте и в любое
                                время.
                            </p>

                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <a
                                    href="https://play.google.com/store/apps/details?id=com.bakasov.bulbul_go&pcampaignid=web_share"
                                    className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-2xl hover:bg-blue-50 transition"
                                >
                                    <Smartphone className="text-blue-600" />
                                    <div className="text-left leading-tight">
                                        <p className="text-[10px] uppercase font-bold text-gray-500">
                                            Доступно в
                                        </p>
                                        <p className="text-lg font-bold">
                                            Google Play
                                        </p>
                                    </div>
                                </a>
                                <a
                                    href="https://apps.apple.com/kg/app/bulbul-go-%D0%BF%D0%BE%D0%BF%D1%83%D1%82%D0%BA%D0%B0-%D0%BA%D1%8B%D1%80%D0%B3%D1%8B%D0%B7%D1%81%D1%82%D0%B0%D0%BD/id6757710471"
                                    className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-2xl hover:bg-blue-50 transition"
                                >
                                    <Download className="text-blue-600" />
                                    <div className="text-left leading-tight">
                                        <p className="text-[10px] uppercase font-bold text-gray-500">
                                            Скачайте в
                                        </p>
                                        <p className="text-lg font-bold">
                                            App Store
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div className="lg:w-1/3 flex justify-center">
                            <div className="bg-gray-800 w-64 h-[450px] rounded-[3rem] border-8 border-gray-700 shadow-2xl flex items-center justify-center relative">
                                <Bird className="w-20 h-20 text-blue-500 opacity-20" />
                                <div className="absolute top-4 w-12 h-1 bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
