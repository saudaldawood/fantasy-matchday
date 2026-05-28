import styles from '../help/help.module.css';

export default function PrivacyPage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    Privacy <span className={styles.highlight}>Policy</span>
                </h1>
                <p className={styles.subtitle}>Last updated: January 2026</p>
            </div>

            <div className={styles.content} style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className={styles.faqItem}>
                    <h3>Information We Collect</h3>
                    <p>We collect information you provide when creating an account, including your name, email address, and team preferences.</p>
                </div>

                <div className={styles.faqItem}>
                    <h3>How We Use Your Information</h3>
                    <p>Your data is used to provide and improve our services, personalize your experience, and communicate important updates about the platform.</p>
                </div>

                <div className={styles.faqItem}>
                    <h3>Data Security</h3>
                    <p>We implement industry-standard security measures to protect your personal information from unauthorized access or disclosure.</p>
                </div>

                <div className={styles.faqItem}>
                    <h3>Cookies</h3>
                    <p>We use cookies to enhance your browsing experience and analyze site traffic. You can manage cookie preferences in your browser settings.</p>
                </div>

                <div className={styles.faqItem}>
                    <h3>Your Rights</h3>
                    <p>You have the right to access, update, or delete your personal information at any time. Contact us to exercise these rights.</p>
                </div>

                <div className={styles.faqItem}>
                    <h3>Third-Party Services</h3>
                    <p>We may share data with trusted partners for analytics and payment processing. These partners are bound by strict confidentiality agreements.</p>
                </div>

                <div className={styles.contactBox}>
                    <h2>Questions about privacy?</h2>
                    <p>Contact us at <a href="mailto:privacy@fantasymatchday.com">privacy@fantasymatchday.com</a></p>
                </div>
            </div>
        </div>
    );
}
