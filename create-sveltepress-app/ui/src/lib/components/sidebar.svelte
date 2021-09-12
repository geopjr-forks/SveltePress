<script>
	import { SideNav, SideNavItems, SideNavLink } from 'carbon-components-svelte';
	import Dashboard24 from 'carbon-icons-svelte/lib/Dashboard24';
	import Gui24 from 'carbon-icons-svelte/lib/Gui24';

	export let isSideNavOpen;
	export let selectedPage;
</script>

<SideNav bind:isOpen={isSideNavOpen} rail>
	<SideNavItems>
		<SideNavLink
			icon={Dashboard24}
			text="Dashboard"
			href="/dashboard"
			isSelected={selectedPage === '/dashboard'}
		/>
		<SideNavLink
			icon={Gui24}
			text="Features"
			href="/features"
			isSelected={selectedPage === '/features'}
		/>
		<SideNavLink
			icon={Gui24}
			text="Extra"
			href="/extra"
			isSelected={selectedPage === '/extra'}
		/>
	</SideNavItems>
</SideNav>
