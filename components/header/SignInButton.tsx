'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';

const CognitoSignInModal = dynamic(
    () => import('@/components/auth/CognitoSignInModal'),
    {
        ssr: false,
        loading: () => null,
    },
);

interface SignInButtonProps {
    fullWidth?: boolean;
    onBeforeOpen?: () => void;
}

export function SignInButton({ fullWidth, onBeforeOpen }: SignInButtonProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const handleOpen = useCallback(() => {
        onBeforeOpen?.();
        setModalOpen(true);
    }, [onBeforeOpen]);

    const handleClose = useCallback(() => setModalOpen(false), []);

    return (
        <>
            <button
                onClick={handleOpen}
                className={[
                    'rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-700',
                    fullWidth ? 'w-full py-2' : 'py-1.5',
                ].join(' ')}
            >
                Sign In
            </button>

            {modalOpen && (
                <CognitoSignInModal isOpen={modalOpen} onClose={handleClose} />
            )}
        </>
    );
}