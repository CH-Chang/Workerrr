import mustache from 'mustache'

const template = `
<!DOCTYPE html>
<html lang="zh-Hant">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>打工人系統服務通知</title>
</head>

<body>
    <div class="flex flex-col h-screen w-screen">
        <div class="flex justify-center items-center pt-5 pb-5">
            <h1 class="pl-8 pr-8 pt-5 pb-5 rounded-xl text-stone-800 font-black text-3xl">Workerrr..</h1>
        </div>
        <div class="flex flex-col flex-1 justify-center pt-10 pb-10 pr-5 pl-5 mr-5 ml-5 bg-stone-800 rounded-3xl">
            <div class="flex justify-start items-center">
                <h1 class="text-xl font-black text-slate-200">👷打工人系統服務通知👷</h1>
            </div>
            <div class="flex flex-col mt-10">
                <p class="text-lg font-medium text-slate-200 text-base">親愛的用戶您好，</p>
                <p class="mt-10 text-slate-200 text-sm">感謝您使用打工人系統服務，</p>
                <p class="text-slate-200 text-sm">我們的系統通知您，</p>
                <p class="text-slate-200 text-sm">您的 {{ type }} 帳號 {{ account }}，</p>
                {{#status}}
					<p class="text-slate-200 text-sm">自動打卡已成功完成。</p>
				{{/status}}
				{{^status}}
					<p class="text-slate-200 text-sm">自動打卡由於 {{ reason }}</p>
					<p class="text-slate-200 text-sm">未執行成功！</p>
				{{/status}}
                <p class="mt-10 text-slate-200 text-sm">如果您有任何問題，</p>
				<p class="text-slate-200 text-sm">請隨時聯繫我們的客服團隊。</p>
            </div>
            <div class="flex flex-col mt-10 items-end">
                <p class="text-right text-slate-200 text-base">此致，</p>
				<p class="text-right text-slate-200 text-base">打工人系統。</p>
            </div>
        </div>
        <div class="flex flex-col pt-10 pb-10">
            <div class="flex flex-row justify-center items-center">
                <a class="pl-2 pr-2" href="#">打工人官網</a>
                <a class="pl-2 pr-2" href="#">打工人APP</a>
                <a class="pl-2 pr-2" href="#">關於打工人</a>
            </div>
            <div class="flex flex-row justify-center items-center">
                <p>Copyright © 2024 Workerrr. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>

</html>
`

export const render = (data: Record<string, any>): string => {
	return mustache.render(
		template,
		data
	)
}
