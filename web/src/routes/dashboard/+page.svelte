<script lang='ts'>
	import UserInfo from './UserInfo.svelte'
	import PunchIn from './PunchIn.svelte'
	import PunchInLog from './PunchInLog.svelte'
</script>

<div class="flex flex-col w-full max-w-screen-xl m-auto">
	<UserInfo />
	<div class="rounded-2xl mt-8 px-6 py-6 flex flex-col">
		<PunchIn />
		<PunchInLog />
	</div>
</div>
