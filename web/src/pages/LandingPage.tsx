import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, EyeSlash, Medal, Briefcase } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';

export function LandingPage() {
  const reduce = useReducedMotion();
  const { state } = useProgress();
  const enterTo = state.onboarded ? '/home' : '/onboarding';

  return (
    <div>
      <section className="relative min-h-[100dvh] overflow-hidden">
        <img
          src="/images/hero-night.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 anim-sodium-haze"
          style={{
            background:
              'linear-gradient(105deg, rgba(9,11,16,0.94) 0%, rgba(9,11,16,0.82) 42%, rgba(9,11,16,0.5) 70%, rgba(9,11,16,0.62) 100%), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(240,163,94,0.16), transparent 55%)',
          }}
        />

        <div className="relative mx-auto flex min-h-[100dvh] max-w-[1400px] flex-col justify-end px-4 pb-20 pt-28 md:justify-center md:px-8 md:pb-24 md:pt-20">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="font-display text-5xl font-extrabold tracking-tight text-paper md:text-7xl lg:text-8xl"
          >
            Ghost<span className="text-accent">Economy</span>
          </motion.p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.06 }}
            className="mt-6 max-w-[20ch] font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-paper md:text-5xl"
          >
            Prove income. Keep the night shift private.
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-5 max-w-[42ch] text-base leading-relaxed text-paper/80 md:text-lg"
          >
            Earn a public badge from private months. Lenders see consistency — not every receipt.
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              to={enterTo}
              className="inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:bg-accent-dim active:scale-[0.98]"
            >
              Get started
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              to="/registry"
              className="inline-flex items-center gap-2 border border-paper/25 px-5 py-3 text-sm font-medium text-paper transition hover:border-paper/50 active:scale-[0.98]"
            >
              See public badges
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-line py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-5xl">
            A passport, not a paystub dump.
          </h2>
          <p className="mt-4 max-w-[48ch] text-mist">
            Built for gig earners who need credit signals — not a lecture on zero-knowledge circuits.
          </p>
          <div className="mt-14 grid grid-cols-1 gap-px bg-line md:grid-cols-3">
            {[
              {
                icon: EyeSlash,
                title: 'Months stay private',
                body: 'Twelve totals live in this browser. They never hit the board as plain dollars.',
              },
              {
                icon: Briefcase,
                title: 'Floor you choose',
                body: 'Pick a public minimum and prove you cleared it — without naming platforms or tips.',
              },
              {
                icon: Medal,
                title: 'Badge lenders read',
                body: 'Bronze, Silver, or Gold from consecutive months above your floor.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-ink p-8 md:p-10 anim-fog-in"
              >
                <item.icon size={28} weight="duotone" className="text-accent" />
                <h3 className="mt-6 font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-mist">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-b border-line bg-ink-elevated py-20">
        <motion.div
          className="flex whitespace-nowrap font-display text-5xl font-extrabold tracking-tight text-paper/15 md:text-7xl"
          animate={reduce ? undefined : { x: ['0%', '-50%'] }}
          transition={reduce ? undefined : { duration: 32, ease: 'linear', repeat: Infinity }}
        >
          <span className="px-8">PROVE / BADGE / BOARD / STREAK / NIGHT CITY / RETURN / </span>
          <span className="px-8">PROVE / BADGE / BOARD / STREAK / NIGHT CITY / RETURN / </span>
        </motion.div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-end gap-12 px-4 md:grid-cols-2 md:px-8">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Ready when Lace is.
            </h2>
            <p className="mt-4 max-w-[48ch] leading-relaxed text-mist">
              Connect Lace or 1AM on Midnight Preview, enter your months privately, and publish only
              the badge lenders need.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              to={state.onboarded ? '/prove' : '/onboarding'}
              className="inline-flex items-center gap-2 border border-accent px-5 py-3 text-sm font-bold text-accent transition hover:bg-accent hover:text-ink active:scale-[0.98]"
            >
              Start proving
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
