<script lang="ts">
	let { icon: Icon, href } = $props();
</script>

<a class="rounded-lg p-1 transition-all hover:bg-muted" {href}><Icon size={20} /></a>
