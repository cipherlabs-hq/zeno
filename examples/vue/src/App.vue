<script setup lang="ts">
// The Lit elements used directly in a Vue template. vite.config.ts tells Vue
// that zeno-* tags are custom elements. The import of @usezeno/vue/elements
// also brings the template types for them.

import '@usezeno/core/web-components';
import { ref, useTemplateRef } from 'vue';
import type { ZenoModal } from '@usezeno/core/web-components';
import { useCheckedModel } from '@usezeno/vue/elements';
import { plans, submission } from '../../shared/plans.js';

const email = ref('');
const plan = ref('free');
const updates = ref(false);
const updatesBinding = useCheckedModel(updates);
const detailsOpen = ref(false);
const modalState = ref('closed');
const submitted = ref('');
const modal = useTemplateRef<ZenoModal>('modal');

function submit(event: Event): void {
  submitted.value = `Submitted: ${submission(event.target as HTMLFormElement)}`;
}

function fill(): void {
  email.value = 'ada@example.com';
  plan.value = 'team';
  updates.value = true;
}

function closed(): void {
  detailsOpen.value = false;
  modalState.value = 'closed';
}
</script>

<template>
  <main class="sign-up">
    <h1>Create an account</h1>
    <form @submit.prevent="submit">
      <!-- v-model on a custom element binds `value` and listens for `input`. -->
      <zeno-input
        v-model="email"
        name="email"
        type="email"
        label="Email"
        required
      />
      <zeno-select v-model="plan" name="plan" label="Plan" :options="plans" />
      <zeno-checkbox
        v-bind="updatesBinding"
        name="updates"
        label="Send me product updates"
      />
      <div class="actions">
        <zeno-button type="submit">Create account</zeno-button>
        <zeno-button
          id="show-details"
          variant="secondary"
          @click="detailsOpen = true"
        >
          Plan details
        </zeno-button>
        <zeno-button id="fill" variant="ghost" @click="fill">
          Fill with an example
        </zeno-button>
      </div>
    </form>
    <p class="readout" data-testid="state">
      email={{ email }} plan={{ plan }} updates={{ updates ? 'yes' : 'no' }}
    </p>
    <p class="readout" data-testid="submitted">{{ submitted }}</p>
    <p class="readout">
      The details are <span data-testid="modal-state">{{ modalState }}</span
      >.
    </p>
    <zeno-modal
      ref="modal"
      heading="Plan details"
      :open="detailsOpen"
      @open="modalState = 'open'"
      @close="closed"
    >
      Free covers one project. Team and Company add shared projects.
      <zeno-button slot="footer" @click="modal?.close()">Close</zeno-button>
    </zeno-modal>
  </main>
</template>
