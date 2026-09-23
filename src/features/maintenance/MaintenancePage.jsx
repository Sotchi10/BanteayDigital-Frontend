import './maintenance.css'

const ShieldMark = () => (
  <svg viewBox="0 0 72 82" aria-hidden="true">
    <path
      d="M36 3.5 65 14v22.4c0 19.7-11.8 35.8-29 42.1C18.8 72.2 7 56.1 7 36.4V14L36 3.5Z"
      fill="currentColor"
      opacity=".14"
    />
    <path
      d="M36 3.5 65 14v22.4c0 19.7-11.8 35.8-29 42.1C18.8 72.2 7 56.1 7 36.4V14L36 3.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
    />
    <path
      d="M26.5 37.5 33 44l13.5-14"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.4"
    />
  </svg>
)

const Spark = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 1.8c.5 6.6 3.6 9.7 10.2 10.2-6.6.5-9.7 3.6-10.2 10.2C11.5 15.6 8.4 12.5 1.8 12 8.4 11.5 11.5 8.4 12 1.8Z" fill="currentColor" />
  </svg>
)

export function MaintenancePage() {
  return (
    <main className="maintenance-page">
      <div className="maintenance-grid" aria-hidden="true" />
      <div className="maintenance-orb maintenance-orb--one" aria-hidden="true" />
      <div className="maintenance-orb maintenance-orb--two" aria-hidden="true" />

      <header className="maintenance-header">
        <a className="maintenance-brand" href="/" aria-label="Banteay Digital home">
          <img src="/BanteayDigitalLogo.svg" alt="" />
          <span>
            Banteay <strong>Digital</strong>
          </span>
        </a>
        <div className="maintenance-status" role="status">
          <span className="maintenance-status__dot" />
          Temporarily offline
        </div>
      </header>

      <section className="maintenance-content">
        <div className="maintenance-copy">
          <div className="maintenance-eyebrow">
            <span>Scheduled pause</span>
            <span className="maintenance-eyebrow__line" />
            <span>ការផ្អាកជាបណ្ដោះអាសន្ន</span>
          </div>

          <h1>
            Our digital fortress is <span>resting.</span>
          </h1>

          <p className="maintenance-lead">
            Banteay Digital is taking a short break while our systems are offline.
            We’ll be back—safer, sharper, and ready to protect your digital world.
          </p>
          <p className="maintenance-khmer" lang="km">
            បន្ទាយឌីជីថលកំពុងសម្រាកជាបណ្ដោះអាសន្ន។ យើងនឹងត្រឡប់មកវិញក្នុងពេលឆាប់ៗនេះ
            ដើម្បីបន្តការពារពិភពឌីជីថលរបស់អ្នក។
          </p>

          <div className="maintenance-note">
            <span className="maintenance-note__icon" aria-hidden="true">i</span>
            <p>
              <strong>No action is needed.</strong>
              <span>Please check back again later.</span>
            </p>
          </div>
        </div>

        <div className="maintenance-visual" aria-hidden="true">
          <Spark className="maintenance-spark maintenance-spark--one" />
          <Spark className="maintenance-spark maintenance-spark--two" />
          <div className="maintenance-radar maintenance-radar--outer" />
          <div className="maintenance-radar maintenance-radar--middle" />
          <div className="maintenance-radar maintenance-radar--inner" />
          <div className="maintenance-shield">
            <div className="maintenance-shield__glow" />
            <ShieldMark />
          </div>
          <div className="maintenance-float-card maintenance-float-card--top">
            <span className="maintenance-float-card__signal" />
            <div>
              <strong>Systems secured</strong>
              <span>Safe while offline</span>
            </div>
          </div>
          <div className="maintenance-float-card maintenance-float-card--bottom">
            <span className="maintenance-float-card__clock">•••</span>
            <div>
              <strong>Back soon</strong>
              <span>Thanks for your patience</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="maintenance-footer">
        <span>© {new Date().getFullYear()} Banteay Digital</span>
        <span className="maintenance-footer__divider" />
        <span>Protecting Cambodia online</span>
      </footer>
    </main>
  )
}
