'use client';

import { useState } from 'react';
import { useRouter } from '@doska/i18n';
import { useCreateCompany } from '@doska/shared';
import {
    Button, Input, Label, Textarea,
    Card, CardContent, CardHeader, CardTitle,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@doska/ui';

const TRANSLIT: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
    у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
    э: 'e', ю: 'yu', я: 'ya',
};

const slugify = (s: string) =>
    s.toLowerCase().trim()
        .split('').map((ch) => TRANSLIT[ch] ?? ch).join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40);

export default function CreateCompanyPage() {
    const router = useRouter();
    const createM = useCreateCompany();

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [slugEdited, setSlugEdited] = useState(false);
    const [legalForm, setLegalForm] = useState('legal');
    const [description, setDescription] = useState('');

    const onName = (v: string) => {
        setName(v);
        if (!slugEdited) setSlug(slugify(v));
    };

    const submit = async () => {
        const company = await createM.mutateAsync({
            name,
            slug,
            type: 'transport',
            legal_form: legalForm,
            description: description || undefined,
        });
        router.push(`/dashboard/${company.slug}`);
    };

    return (
        <div className="container mx-auto max-w-xl px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Новая компания-перевозчик</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label>Название</Label>
                        <Input value={name} onChange={(e) => onName(e.target.value)} placeholder="Моя транспортная компания" />
                    </div>
                    <div className="space-y-1">
                        <Label>Slug (адрес)</Label>
                        <Input
                            value={slug}
                            onChange={(e) => { setSlugEdited(true); setSlug(slugify(e.target.value)); }}
                            placeholder="my-company"
                        />
                        <p className="text-xs text-muted-foreground">Панель будет доступна по адресу /dashboard/{slug || '...'}</p>
                    </div>
                    <div className="space-y-1">
                        <Label>Форма</Label>
                        <Select value={legalForm} onValueChange={setLegalForm}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="legal">Компания (с сотрудниками)</SelectItem>
                                <SelectItem value="ip">ИП</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Описание</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => router.push('/my-companies')}>Отмена</Button>
                        <Button onClick={submit} disabled={!name || !slug || createM.isPending}>Создать</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
