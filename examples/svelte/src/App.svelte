<script lang="ts">
  // The Lit elements used directly in Svelte markup. Importing @usezeno/svelte
  // registers them and brings the markup types.
  //
  // Svelte only allows bind:value on <input>, <textarea> and <select>, so a
  // two-way binding is written as its two halves: the property and the event.

  import '@usezeno/svelte';
  import type { ZenoModal } from '@usezeno/svelte';
  import { plans, submission } from '../../shared/plans.js';

  let email = $state('');
  let plan = $state('free');
  let updates = $state(false);
  let detailsOpen = $state(false);
  let modalState = $state('closed');
  let submitted = $state('');
  let modal: ZenoModal | undefined = $state();

  function fill(): void {
    email = 'ada@example.com';
    plan = 'team';
    updates = true;
  }
</script>

<main class="sign-up">
  <h1>Create an account</h1>
  <form
    onsubmit={event => {
      event.preventDefault();
      submitted = `Submitted: ${submission(event.currentTarget)}`;
    }}
  >
    <zeno-input
      name="email"
      type="email"
      label="Email"
      required
      value={email}
      oninput={event => (email = String(event.detail.value))}
    ></zeno-input>
    <zeno-select
      name="plan"
      label="Plan"
      options={plans}
      value={plan}
      onchange={event => (plan = String(event.detail.value))}
    ></zeno-select>
    <zeno-checkbox
      name="updates"
      label="Send me product updates"
      checked={updates}
      onchange={event => (updates = event.detail.checked)}
    ></zeno-checkbox>
    <div class="actions">
      <zeno-button type="submit">Create account</zeno-button>
      <zeno-button
        id="show-details"
        variant="secondary"
        onclick={() => (detailsOpen = true)}
      >
        Plan details
      </zeno-button>
      <zeno-button id="fill" variant="ghost" onclick={fill}>
        Fill with an example
      </zeno-button>
    </div>
  </form>
  <p class="readout" data-testid="state">
    email={email} plan={plan} updates={updates ? 'yes' : 'no'}
  </p>
  <p class="readout" data-testid="submitted">{submitted}</p>
  <p class="readout">
    The details are <span data-testid="modal-state">{modalState}</span>.
  </p>
  <zeno-modal
    bind:this={modal}
    heading="Plan details"
    open={detailsOpen}
    onopen={() => (modalState = 'open')}
    onclose={() => {
      detailsOpen = false;
      modalState = 'closed';
    }}
  >
    Free covers one project. Team and Company add shared projects.
    <zeno-button slot="footer" onclick={() => modal?.close()}>Close</zeno-button>
  </zeno-modal>
</main>
