import { motion, useReducedMotion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

export function PrivacyPage() {
  const reduce = useReducedMotion();

  return (
    <div className="page">
      <div className="container">
        <header className="page-header">
          <h1>Privacy model</h1>
          <p>
            Ghost Economy separates the private income witness from the public
            compliance signal. Fill exact dollars in the prover; the registry
            only ever shows tier and consistency.
          </p>
        </header>

        <section className="panel">
          <div className="privacy-matrix">
            {[
              {
                title: 'Worker',
                items: [
                  'Holds workerSecret and twelve monthlyIncomeCents locally',
                  'Chooses public floor and required months',
                  'Sees full private draft before proving',
                ],
              },
              {
                title: 'Chain observer',
                items: [
                  'Sees profileCommitment and workerCommitment',
                  'Sees incomeTier (0-3) and consistencyMonths',
                  'Cannot recover dollar amounts or platforms',
                ],
              },
              {
                title: 'Lender',
                items: [
                  'Reads the coarse eligibility signal',
                  'Learns the floor argued in the public transcript',
                  'Does not receive Uber, Upwork, or cash splits',
                ],
              },
            ].map((col, i) => (
              <motion.div
                key={col.title}
                className="privacy-col"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.5, delay: i * 0.07, ease }}
              >
                <h3>{col.title}</h3>
                <ul>
                  {col.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section-tight" style={{ paddingBottom: 0 }}>
          <div className="split">
            <div className="copy">
              <h2>Demo claim</h2>
              <p className="lede">
                Enter $3,200 every month and prove against a $2,000 floor for six
                months. After confirmation the registry shows Gold and 12 months,
                never $3,200.
              </p>
            </div>
            <div className="visual">
              <img
                src="/images/privacy-glass.jpg"
                alt="City lights through rain glass"
                width={1200}
                height={900}
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
