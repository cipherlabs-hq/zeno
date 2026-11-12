<script lang="ts">
  // An event whose name has a hyphen, and one that can be cancelled.

  import '@usezeno/svelte';

  let asked = $state(0);
</script>

<zeno-modal
  heading="Unsaved changes"
  open
  onrequest-close={event => {
    asked += 1;
    event.preventDefault();
  }}
>
  Asked to close <span data-testid="asked">{asked}</span> times.
</zeno-modal>
