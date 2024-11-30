<script lang="ts">
  import type { PageData } from "./$types";
  let { data }: { data: PageData } = $props();
  import EngagementViz from "$lib/components/engagementViz.svelte";
</script>

<div class="flex flex-col items-center justify-center">
  <EngagementViz artistEngagement={data.data} />
</div>
