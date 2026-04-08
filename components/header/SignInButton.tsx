'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

// The Cognito modal bundle is fetched from the server only after the
// user clicks "Sign In" — nothing Cognito-related ships in the initial JS.
const CognitoSignInModal = dynamic(
    () =>
        import('@/components/auth/CognitoSignInModal').then(
            (mod) => mod.CognitoSignInModal,
        ),
    {
        ssr: false,   // Auth modal is client-only
        loading: () => null,
    },
);

export function SignInButton() {
    const [modalOpen, setModalOpen] = useState(false);

    const handleOpen = useCallback(() => setModalOpen(true), []);
    const handleClose = useCallback(() => setModalOpen(false), []);

    return (
        <>
            <Button
                size="sm"
                className="bg-slate-900 text-white hover:bg-slate-800"
                onClick={handleOpen}
            >
                Sign In
            </Button>

            {/*
        CognitoSignInModal is only imported (and its bundle downloaded)
        after modalOpen becomes true for the first time.
      */}
            {modalOpen && (
                <CognitoSignInModal isOpen={modalOpen} onClose={handleClose} />
            )}
        </>
    );
}