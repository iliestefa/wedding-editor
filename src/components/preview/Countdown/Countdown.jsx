import useCountdown from '../../../hooks/useCountdown';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';

import SectionHeader from '../shared/SectionHeader/SectionHeader';
import CountdownUnit from './CountdownUnit/CountdownUnit';

import './Countdown.scss';

const COUNTDOWN_UNITS = [
  { key: 'days',    label: 'Días' },
  { key: 'hours',   label: 'Horas' },
  { key: 'minutes', label: 'Minutos' },
  { key: 'seconds', label: 'Segundos' },
];

const Countdown = () => {
  const timeLeft  = useCountdown();
  const revealRef = useIntersectionObserver();

  const countdownItems = COUNTDOWN_UNITS.map(({ key, label }) => ({
    id: key,
    value: timeLeft[key],
    label,
  }));

  return (
    <section className="countdown" id="countdown">
      <div className="countdown__inner" ref={revealRef}>
        <SectionHeader
          eyebrow="Cuenta Regresiva"
          title="El gran día se acerca"
          centered
          light
        />

        <div className="countdown__grid">
          {countdownItems.map(({ id, value, label }) => (
            <CountdownUnit key={id} value={value} label={label} />
          ))}
        </div>

        {timeLeft.isExpired && (
          <p className="countdown__expired">¡El gran día ha llegado!</p>
        )}
      </div>
    </section>
  );
};

export default Countdown;
