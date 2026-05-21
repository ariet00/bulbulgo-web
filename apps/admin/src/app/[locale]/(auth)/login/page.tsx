'use client';

import { Button } from "@doska/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@doska/ui"
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Chrome } from "lucide-react";

export default function LoginPage() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const isForbidden = searchParams.get("error") === "forbidden";

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
                    {isForbidden && (
                        <p className="rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                            Доступ только для администраторов
                        </p>
                    )}
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full gap-3 cursor-pointer"
                        onClick={handleGoogleLogin}
                    >
                        <Chrome className="h-5 w-5" />
                        Войти через Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
