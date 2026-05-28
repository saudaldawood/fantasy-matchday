'use client';

import React, { useState } from 'react';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { CreditPackage, createCreditPurchaseIntent } from '@/services/credits';
import { X, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './PaymentModal.module.css';

interface PaymentModalProps {
    package: CreditPackage;
    onClose: () => void;
    onSuccess: (credits: number) => void;
    isArabic: boolean;
}

// Card element styling
const elementStyle = {
    style: {
        base: {
            color: '#ffffff',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#6b7280',
            },
            backgroundColor: 'transparent',
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    },
};

function CheckoutForm({ package: pkg, onClose, onSuccess, isArabic }: PaymentModalProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [zipCode, setZipCode] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
            setError('Card element not found');
            return;
        }

        if (!zipCode.trim()) {
            setError(isArabic ? 'الرمز البريدي مطلوب' : 'Zip/Postal code is required');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            // Step 1: Create payment intent via Cloud Function
            const result = await createCreditPurchaseIntent(pkg.id);

            if (result.error) {
                setError(result.error);
                setProcessing(false);
                return;
            }

            if (!result.clientSecret) {
                setError('Failed to initialize payment');
                setProcessing(false);
                return;
            }

            // Step 2: Confirm card payment with Stripe
            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
                result.clientSecret,
                {
                    payment_method: {
                        card: cardNumberElement,
                        billing_details: {
                            address: {
                                postal_code: zipCode,
                            },
                        },
                    },
                }
            );

            if (confirmError) {
                setError(confirmError.message || 'Payment failed');
                setProcessing(false);
                return;
            }

            if (paymentIntent?.status === 'succeeded') {
                // Payment successful - webhook will update credits in Firestore
                setSuccess(true);

                // Wait a moment then call success callback
                setTimeout(() => {
                    onSuccess(pkg.credits + pkg.bonus);
                }, 2000);
            } else {
                setError('Payment could not be completed');
                setProcessing(false);
            }

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Payment failed';
            setError(errorMessage);
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div className={styles.successState}>
                <CheckCircle size={64} className={styles.successIcon} />
                <h3>{isArabic ? 'تم الدفع بنجاح!' : 'Payment Successful!'}</h3>
                <p>{isArabic ? `تمت إضافة ${pkg.credits + pkg.bonus} رصيد إلى حسابك` : `${pkg.credits + pkg.bonus} credits added to your account`}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.packageInfo}>
                <h3>{isArabic ? pkg.nameAr : pkg.name}</h3>
                <div className={styles.priceTag}>{pkg.priceDisplay}</div>
            </div>

            <div className={styles.creditsSummary}>
                <span>{pkg.credits.toLocaleString()} {isArabic ? 'رصيد' : 'credits'}</span>
                {pkg.bonus > 0 && (
                    <span className={styles.bonusTag}>+{pkg.bonus} {isArabic ? 'مكافأة' : 'bonus'}</span>
                )}
            </div>

            <div className={styles.cardElementWrapper}>
                <label>{isArabic ? 'رقم البطاقة' : 'Card Number'}</label>
                <div className={styles.cardElement}>
                    <CardNumberElement options={elementStyle} />
                </div>
            </div>

            <div className={styles.cardRow}>
                <div className={styles.cardElementWrapper}>
                    <label>{isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}</label>
                    <div className={styles.cardElement}>
                        <CardExpiryElement options={elementStyle} />
                    </div>
                </div>
                <div className={styles.cardElementWrapper}>
                    <label>{isArabic ? 'رمز الأمان' : 'CVC'}</label>
                    <div className={styles.cardElement}>
                        <CardCvcElement options={elementStyle} />
                    </div>
                </div>
            </div>

            <div className={styles.cardElementWrapper}>
                <label>{isArabic ? 'الرمز البريدي' : 'Zip / Postal Code'}</label>
                <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder={isArabic ? 'الرمز البريدي' : 'Zip code'}
                    className={styles.zipInput}
                    maxLength={10}
                />
            </div>

            {error && (
                <div className={styles.error}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || processing}
                className={styles.payBtn}
            >
                {processing ? (
                    <>
                        <Loader2 size={18} className={styles.spinner} />
                        {isArabic ? 'جاري المعالجة...' : 'Processing...'}
                    </>
                ) : (
                    <>
                        <CreditCard size={18} />
                        {isArabic ? `ادفع ${pkg.priceDisplay}` : `Pay ${pkg.priceDisplay}`}
                    </>
                )}
            </button>

            <p className={styles.secureNote}>
                🔒 {isArabic ? 'الدفع آمن ومشفر' : 'Payments are secure and encrypted'}
            </p>
        </form>
    );
}

export function PaymentModal({ package: pkg, onClose, onSuccess, isArabic }: PaymentModalProps) {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                <h2 className={styles.title}>
                    <CreditCard size={24} />
                    {isArabic ? 'إتمام الشراء' : 'Complete Purchase'}
                </h2>

                <Elements stripe={getStripe()}>
                    <CheckoutForm
                        package={pkg}
                        onClose={onClose}
                        onSuccess={onSuccess}
                        isArabic={isArabic}
                    />
                </Elements>
            </div>
        </div>
    );
}
