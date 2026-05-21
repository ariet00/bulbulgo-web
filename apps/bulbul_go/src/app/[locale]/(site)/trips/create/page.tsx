'use client';

import * as React from 'react';
import { Button } from '@doska/ui';
import { Construction, ArrowLeft, Send } from 'lucide-react';
import { Link, useRouter } from '@doska/i18n';
import BackButton from '@/components/BackButton';

export default function CreateTripPlaceholder() {
    const router = useRouter();

    return (
        <div className="container mx-auto px-4 py-20 max-w-2xl flex flex-col items-center text-center">
            <div className="bg-primary/5 p-10 rounded-[3rem] mb-10 ring-1 ring-primary/10">
                <Construction className="h-24 w-24 text-primary animate-bounce-slow" />
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Создание поездки
            </h1>

            <p className="text-xl text-muted-foreground font-medium mb-10 leading-relaxed max-w-lg">
                Мы активно работаем над тем, чтобы вы могли легко планировать свои поездки.
                Совсем скоро здесь появится удобная форма создания объявлений!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 h-14 rounded-2xl font-black text-lg gap-2"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5" />
                    Вернуться назад
                </Button>
                <Button
                    size="lg"
                    className="flex-1 h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20"
                    asChild
                >
                    <Link href="/">
                        <Send className="h-5 w-5" />
                        На главную
                    </Link>
                </Button>
            </div>

            <div className="mt-20 p-6 bg-secondary/30 rounded-[2rem] border border-dashed border-muted-foreground/20 w-full">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    В разработке:
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {['Маршруты', 'Графики', 'Бронирование', 'Посылки'].map((tag) => (
                        <span key={tag} className="bg-background px-4 py-1.5 rounded-full text-xs font-black text-primary/70 shadow-sm">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Add some animation to global css or inline
const style = `
@keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}
.animate-bounce-slow {
    animation: bounce-slow 3s ease-in-out infinite;
}
`;
