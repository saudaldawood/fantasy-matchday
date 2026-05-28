"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const toggleLanguage = () => {
        const nextLocale = locale === 'en' ? 'ar' : 'en';
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <button
            onClick={toggleLanguage}
            className={styles.switcher}
            disabled={isPending}
            aria-label="Switch Language"
        >
            <Globe size={20} />
            <span className={styles.langCode}>{locale === 'en' ? 'AR' : 'EN'}</span>
        </button>
    );
}
