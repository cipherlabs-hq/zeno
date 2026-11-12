// The elements through @usezeno/react: properties are typed props, and each
// event of an element is an `on…` prop whose event carries a typed detail.

import { useRef, useState } from 'react';
import {
  ZenoButton,
  ZenoCheckbox,
  ZenoInput,
  ZenoModal,
  ZenoSelect,
  type ZenoModalElement,
} from '@usezeno/react';
import { plans, submission } from '../../shared/plans.js';

export function App() {
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('free');
  const [updates, setUpdates] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [modalState, setModalState] = useState('closed');
  const [submitted, setSubmitted] = useState('');
  const modal = useRef<ZenoModalElement>(null);

  return (
    <main className="sign-up">
      <h1>Create an account</h1>
      <form
        onSubmit={event => {
          event.preventDefault();
          setSubmitted(`Submitted: ${submission(event.currentTarget)}`);
        }}
      >
        <ZenoInput
          name="email"
          type="email"
          label="Email"
          required
          value={email}
          onInput={event => setEmail(String(event.detail.value))}
        />
        <ZenoSelect
          name="plan"
          label="Plan"
          options={plans}
          value={plan}
          onChange={event => setPlan(String(event.detail.value))}
        />
        <ZenoCheckbox
          name="updates"
          label="Send me product updates"
          checked={updates}
          onChange={event => setUpdates(event.detail.checked)}
        />
        <div className="actions">
          <ZenoButton type="submit">Create account</ZenoButton>
          <ZenoButton
            id="show-details"
            variant="secondary"
            onClick={() => setDetailsOpen(true)}
          >
            Plan details
          </ZenoButton>
          <ZenoButton
            id="fill"
            variant="ghost"
            onClick={() => {
              setEmail('ada@example.com');
              setPlan('team');
              setUpdates(true);
            }}
          >
            Fill with an example
          </ZenoButton>
        </div>
      </form>
      <p className="readout" data-testid="state">
        email={email} plan={plan} updates={updates ? 'yes' : 'no'}
      </p>
      <p className="readout" data-testid="submitted">
        {submitted}
      </p>
      <p className="readout">
        The details are <span data-testid="modal-state">{modalState}</span>.
      </p>
      <ZenoModal
        ref={modal}
        heading="Plan details"
        open={detailsOpen}
        onOpen={() => setModalState('open')}
        onClose={() => {
          setDetailsOpen(false);
          setModalState('closed');
        }}
      >
        Free covers one project. Team and Company add shared projects.
        <ZenoButton slot="footer" onClick={() => modal.current?.close()}>
          Close
        </ZenoButton>
      </ZenoModal>
    </main>
  );
}
