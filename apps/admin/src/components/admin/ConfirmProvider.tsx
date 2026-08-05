'use client'

import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
    type ReactNode,
} from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Button,
    Input,
    Label,
} from '@doska/ui'

export interface ConfirmOptions {
    title?: string
    description?: ReactNode
    confirmText?: string
    cancelText?: string
    /** 'destructive' (default) paints the confirm button red. */
    tone?: 'default' | 'destructive'
}

/** Ask the user to confirm. Resolves `true` on confirm, `false` on cancel/close. */
export type ConfirmFn = (opts: string | ConfirmOptions) => Promise<boolean>

export interface PromptOptions {
    title?: string
    description?: ReactNode
    /** Label shown above the input. */
    label?: string
    placeholder?: string
    defaultValue?: string
    confirmText?: string
    cancelText?: string
    /** When true, the confirm button is disabled while the input is empty. */
    required?: boolean
}

/** Ask the user for a text value. Resolves the string on confirm, `null` on cancel/close. */
export type PromptFn = (opts: string | PromptOptions) => Promise<string | null>

const ConfirmContext = createContext<ConfirmFn | null>(null)
const PromptContext = createContext<PromptFn | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const [opts, setOpts] = useState<ConfirmOptions>({})
    const resolverRef = useRef<((value: boolean) => void) | null>(null)

    const confirm = useCallback<ConfirmFn>((o) => {
        setOpts(typeof o === 'string' ? { description: o } : o)
        setOpen(true)
        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve
        })
    }, [])

    const settle = useCallback((value: boolean) => {
        setOpen(false)
        resolverRef.current?.(value)
        resolverRef.current = null
    }, [])

    // ── prompt (text input) ──
    const [promptOpen, setPromptOpen] = useState(false)
    const [promptOpts, setPromptOpts] = useState<PromptOptions>({})
    const [promptValue, setPromptValue] = useState('')
    const promptResolverRef = useRef<((value: string | null) => void) | null>(null)

    const prompt = useCallback<PromptFn>((o) => {
        const normalized = typeof o === 'string' ? { title: o } : o
        setPromptOpts(normalized)
        setPromptValue(normalized.defaultValue ?? '')
        setPromptOpen(true)
        return new Promise<string | null>((resolve) => {
            promptResolverRef.current = resolve
        })
    }, [])

    const settlePrompt = useCallback((value: string | null) => {
        setPromptOpen(false)
        promptResolverRef.current?.(value)
        promptResolverRef.current = null
    }, [])

    const tone = opts.tone ?? 'destructive'
    const promptEmpty = promptOpts.required && promptValue.trim() === ''

    return (
        <ConfirmContext.Provider value={confirm}>
            <PromptContext.Provider value={prompt}>
                {children}
                <Dialog open={open} onOpenChange={(next) => !next && settle(false)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{opts.title ?? 'Подтверждение'}</DialogTitle>
                            {opts.description != null && (
                                <DialogDescription className="whitespace-pre-line">
                                    {opts.description}
                                </DialogDescription>
                            )}
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => settle(false)}>
                                {opts.cancelText ?? 'Отмена'}
                            </Button>
                            <Button
                                variant={tone === 'destructive' ? 'destructive' : 'default'}
                                onClick={() => settle(true)}
                            >
                                {opts.confirmText ?? 'Подтвердить'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={promptOpen}
                    onOpenChange={(next) => !next && settlePrompt(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{promptOpts.title ?? 'Ввод'}</DialogTitle>
                            {promptOpts.description != null && (
                                <DialogDescription className="whitespace-pre-line">
                                    {promptOpts.description}
                                </DialogDescription>
                            )}
                        </DialogHeader>
                        <form
                            className="space-y-2"
                            onSubmit={(e) => {
                                e.preventDefault()
                                if (!promptEmpty) settlePrompt(promptValue)
                            }}
                        >
                            {promptOpts.label && (
                                <Label htmlFor="prompt-input">{promptOpts.label}</Label>
                            )}
                            <Input
                                id="prompt-input"
                                autoFocus
                                value={promptValue}
                                placeholder={promptOpts.placeholder}
                                onChange={(e) => setPromptValue(e.target.value)}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => settlePrompt(null)}
                                >
                                    {promptOpts.cancelText ?? 'Отмена'}
                                </Button>
                                <Button type="submit" disabled={promptEmpty}>
                                    {promptOpts.confirmText ?? 'ОК'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </PromptContext.Provider>
        </ConfirmContext.Provider>
    )
}

export function useConfirm(): ConfirmFn {
    const ctx = useContext(ConfirmContext)
    if (!ctx) {
        throw new Error('useConfirm must be used within <ConfirmProvider>')
    }
    return ctx
}

export function usePrompt(): PromptFn {
    const ctx = useContext(PromptContext)
    if (!ctx) {
        throw new Error('usePrompt must be used within <ConfirmProvider>')
    }
    return ctx
}
