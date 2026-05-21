
import { Button } from "@doska/ui"
import { getTranslations } from 'next-intl/server';

export default async function Footer() {
    const t = await getTranslations('Footer');

    return (
        <footer className="border-t bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Doska. {t('allRightsReserved')}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="link" className="text-muted-foreground hover:text-foreground" asChild>
                            <a href="#">{t('privacyPolicy')}</a>
                        </Button>
                        <Button variant="link" className="text-muted-foreground hover:text-foreground" asChild>
                            <a href="#">{t('termsOfService')}</a>
                        </Button>
                        <Button variant="link" className="text-muted-foreground hover:text-foreground" asChild>
                            <a href="#">{t('contact')}</a>
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
