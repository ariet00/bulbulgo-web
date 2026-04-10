'use client';

import { useState } from 'react';
import { terminateSession } from '@doska/shared';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@doska/ui';
import { useToastStore } from '@doska/shared';

interface TerminateSessionButtonProps {
    sessionId: number;
}

export default function TerminateSessionButton({ sessionId }: TerminateSessionButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const addMessage = useToastStore((state) => state.addMessage);

    const handleTerminate = async () => {
        try {
            setLoading(true);
            await terminateSession(sessionId);
            addMessage({
                type: 'success',
                message: 'Session terminated successfully',
                duration: 3000,
            });
            router.refresh();
        } catch (error) {
            console.error('Failed to terminate session', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleTerminate}
            disabled={loading}
            className="flex items-center gap-2"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Terminate
        </Button>
    );
}
