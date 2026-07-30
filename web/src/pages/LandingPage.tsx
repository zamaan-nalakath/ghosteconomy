import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

export function LandingPage() {
  const reduce = useReducedMotion();

  return (
    <>
      <section className="hero">
        <div className="hero-media" aria-hidden>
          <img
            src="/images/hero-night.jpg"
            alt=""
            width={1600}
            height={900}
            fetchPriority="high"
          />
          <div className="hero-scrim" />
        </div>
        <div className="hero-content">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            Ghost Economy
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
          >
            Prove gig income stability without exposing amounts, platforms, or
            night shifts.
          </motion.p>
          <motion.div
            className="hero-cta"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease }}
          >
            <Link to="/app" className="btn btn-primary">
              Open prover
            </Link>
            <Link to="/privacy" className="btn btn-ghost">
              Privacy model
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <span key={copy}>
              Private witness · Public tier · Consistency months · No dollar
              amounts · Midnight ZK · Gig night city ·
            </span>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="container split">
          <div className="copy">
            <h2>Income exists. Credit does not.</h2>
            <p className="lede">
              1.5 billion people earn money the ledger cannot politely see.
              Rides, shops, gigs, cash. Banks ask for a clean paystub. Workers
              refuse to hand over every receipt.
            </p>
          </div>
          <div className="visual">
            <img
              src="/images/gig-desk.jpg"
              alt="Late-night gig desk under sodium light"
              width={1200}
              height={800}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <h2>How the ghost proof works</h2>
          <div className="story-rail" style={{ marginTop: '2rem' }}>
            {[
              {
                n: '01',
                title: 'Keep the months private',
                body: 'Twelve monthly totals stay in the browser witness. They never hit the indexer.',
              },
              {
                n: '02',
                title: 'Prove a floor you choose',
                body: 'registerIncomeProfile checks consistency against a public floor without revealing exact cents.',
              },
              {
                n: '03',
                title: 'Publish only the signal',
                body: 'The chain stores a profile commitment, a coarse tier, and a consistency count.',
              },
            ].map((step, i) => (
              <motion.article
                key={step.n}
                className="story-step"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: i * 0.06, ease }}
              >
                <div className="num">{step.n}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>What lenders actually get</h2>
          <div className="bento" style={{ marginTop: '2rem' }}>
            <div className="bento-cell wide photo">
              <img
                src="/images/privacy-glass.jpg"
                alt="Rain on glass with city lights"
                width={1200}
                height={900}
                loading="lazy"
              />
            </div>
            <div className="bento-cell tint">
              <h3>Tier, not salary</h3>
              <p>
                Bronze, Silver, or Gold from consecutive months above the floor.
                No platform names. No raw dollars.
              </p>
            </div>
            <div className="bento-cell">
              <h3>Commitment, not dump</h3>
              <p>
                Observers see profileCommitment and consistencyMonths. The night
                city of invoices stays in shadow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container split split-reverse">
          <div className="copy">
            <h2>Ready when Lace is.</h2>
            <p className="lede">
              Connect Lace or 1AM on the local undeployed network, deploy or join,
              then call registerIncomeProfile from the prover.
            </p>
            <div className="hero-cta">
              <Link to="/app" className="btn btn-primary">
                Start proving
              </Link>
              <Link to="/registry" className="btn btn-ghost">
                View registry
              </Link>
            </div>
          </div>
          <div className="visual">
            <img
              src="/images/hero-night.jpg"
              alt="Night city street for Ghost Economy"
              width={1600}
              height={900}
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
