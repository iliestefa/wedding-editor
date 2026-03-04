import {
  ATTENDANCE_OPTIONS,
  FORM_FIELD_NAMES,
  FORM_LABELS,
  FORM_PLACEHOLDERS,
  FORM_STATUS,
} from '../../../constants/formConstants';
import { useWeddingData } from '../../../context/EditorContext';
import useRsvpForm from '../../../hooks/useRsvpForm';
import useIntersectionObserver from '../../../hooks/useIntersectionObserver';

import SectionHeader from '../shared/SectionHeader/SectionHeader';
import FormField from './FormField/FormField';
import FormStatus from './FormStatus/FormStatus';

import './RsvpForm.scss';

const attendanceOptions = ATTENDANCE_OPTIONS.map(({ id, value, label }) => (
  <option key={id} value={value}>{label}</option>
));

const RsvpForm = () => {
  const { rsvpDeadline } = useWeddingData();
  const { formState, errors, status, handleFieldChange, handleSubmit } = useRsvpForm();
  const revealRef = useIntersectionObserver();

  const isSubmitting = status === FORM_STATUS.LOADING;
  const isSuccess    = status === FORM_STATUS.SUCCESS;

  return (
    <section className="rsvp" id="rsvp">
      <div className="rsvp__inner">
        <SectionHeader eyebrow={`Confirmar antes del ${rsvpDeadline}`} title="¿Nos acompañas?" />

        <form
          ref={revealRef}
          className="rsvp__form"
          onSubmit={handleSubmit}
          noValidate
        >
          <FormField
            label={FORM_LABELS.GUEST_NAME}
            htmlFor={FORM_FIELD_NAMES.GUEST_NAME}
            error={errors[FORM_FIELD_NAMES.GUEST_NAME]}
          >
            <input
              id={FORM_FIELD_NAMES.GUEST_NAME}
              type="text"
              placeholder={FORM_PLACEHOLDERS.GUEST_NAME}
              value={formState[FORM_FIELD_NAMES.GUEST_NAME]}
              onChange={(e) => handleFieldChange(FORM_FIELD_NAMES.GUEST_NAME, e.target.value)}
              disabled={isSubmitting}
              autoComplete="name"
            />
          </FormField>

          <FormField
            label={FORM_LABELS.ATTENDANCE}
            htmlFor={FORM_FIELD_NAMES.ATTENDANCE}
            error={errors[FORM_FIELD_NAMES.ATTENDANCE]}
          >
            <select
              id={FORM_FIELD_NAMES.ATTENDANCE}
              value={formState[FORM_FIELD_NAMES.ATTENDANCE]}
              onChange={(e) => handleFieldChange(FORM_FIELD_NAMES.ATTENDANCE, e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">Selecciona una opción</option>
              {attendanceOptions}
            </select>
          </FormField>

          <FormField
            label={FORM_LABELS.GUEST_COUNT}
            htmlFor={FORM_FIELD_NAMES.GUEST_COUNT}
          >
            <input
              id={FORM_FIELD_NAMES.GUEST_COUNT}
              type="number"
              min="1"
              max="10"
              placeholder={FORM_PLACEHOLDERS.GUEST_COUNT}
              value={formState[FORM_FIELD_NAMES.GUEST_COUNT]}
              onChange={(e) => handleFieldChange(FORM_FIELD_NAMES.GUEST_COUNT, e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label={FORM_LABELS.DIETARY}
            htmlFor={FORM_FIELD_NAMES.DIETARY}
          >
            <input
              id={FORM_FIELD_NAMES.DIETARY}
              type="text"
              placeholder={FORM_PLACEHOLDERS.DIETARY}
              value={formState[FORM_FIELD_NAMES.DIETARY]}
              onChange={(e) => handleFieldChange(FORM_FIELD_NAMES.DIETARY, e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label={FORM_LABELS.SONG_REQUEST}
            htmlFor={FORM_FIELD_NAMES.SONG_REQUEST}
          >
            <input
              id={FORM_FIELD_NAMES.SONG_REQUEST}
              type="text"
              placeholder={FORM_PLACEHOLDERS.SONG_REQUEST}
              value={formState[FORM_FIELD_NAMES.SONG_REQUEST]}
              onChange={(e) => handleFieldChange(FORM_FIELD_NAMES.SONG_REQUEST, e.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label={FORM_LABELS.MESSAGE}
            htmlFor={FORM_FIELD_NAMES.MESSAGE}
          >
            <textarea
              id={FORM_FIELD_NAMES.MESSAGE}
              placeholder={FORM_PLACEHOLDERS.MESSAGE}
              value={formState[FORM_FIELD_NAMES.MESSAGE]}
              onChange={(e) => handleFieldChange(FORM_FIELD_NAMES.MESSAGE, e.target.value)}
              disabled={isSubmitting}
              rows="4"
            />
          </FormField>

          <div className="rsvp__submit-row">
            <button
              type="submit"
              className="rsvp__submit"
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? 'Enviando…' : FORM_LABELS.SUBMIT}
            </button>
          </div>

          <FormStatus status={status} />
        </form>
      </div>
    </section>
  );
};

export default RsvpForm;
