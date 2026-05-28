import styles from '../help/help.module.css';

export default function TermsPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    Terms & <span className={styles.highlight}>Conditions</span>
                </h1>
                <p className={styles.subtitle}>Last updated: January 2026</p>
            </div>

            <div className={styles.content} style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className={styles.faqItem}>
                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing and using Fantasy Matchday, you agree to be bound by these Terms and Conditions.</p>
                </div>

                <div className={styles.faqItem}>
                    <h3>2. Eligibility</h3>
                    <p>You must be at least 18 years old to participate. Users are responsible for compliance with local laws regarding fantasy sports.</p>
                </div>

                <div className={styles.faqItem}>
                    <h3>3. Account Responsibilities</h3>
                    <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
                </div>

                <div className={styles.faqItem}>
                    <h3>4. Fair Play</h3>
                    <p>Any form of cheating, collusion, or use of automated systems is strictly prohibited and may result in account termination.</p>
                </div>

                <div className={styles.faqItem}>
                    <h3>5. Prizes and Payouts</h3>
                    <p>Prize eligibility and distribution are subject to verification and compliance with these terms. Prizes are non-transferable.</p>
                </div>

                <div className={styles.faqItem}>
                    <h3>6. Intellectual Property</h3>
                    <p>All content, trademarks, and data on this platform are the property of Fantasy Matchday or its licensors.</p>
                </div>

                <div className={styles.faqItem}>
                    <h3>7. Limitation of Liability</h3>
                    <p>Fantasy Matchday is not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
                </div>

                <div className={styles.faqItem}>
                    <h3>8. Changes to Terms</h3>
                    <p>We reserve the right to modify these terms at any time. Continued use constitutes acceptance of modified terms.</p>
                </div>

                <div className={styles.contactBox}>
                    <h2>Questions about our terms?</h2>
                    <p>Contact us at <a href="mailto:legal@fantasymatchday.com">legal@fantasymatchday.com</a></p>
                </div>
            </div>
        </div>
    );
}
