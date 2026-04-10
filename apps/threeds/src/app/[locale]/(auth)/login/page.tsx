'use client';

import { Button } from "@doska/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@doska/ui"
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Chrome } from "lucide-react";
import { Link } from "@doska/i18n"

export default function LoginPage() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const handleGoogleLogin = () => {
        signIn("google", { callbackUrl });
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Добро пожаловать</CardTitle>
                    <CardDescription>
                        Войдите в свой аккаунт, чтобы продолжить
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full gap-3 cursor-pointer"
                        onClick={handleGoogleLogin}
                    >
                        <Chrome className="h-5 w-5" />
                        Войти через Google
                    </Button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Или
                            </span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                        У вас нет аккаунта?{" "}
                        <Link href="/" className="text-primary hover:underline font-medium">
                            Вернуться на главную
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
