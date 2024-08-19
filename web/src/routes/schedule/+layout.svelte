<div class="flex flex-col min-h-screen min-w-screen bg-zinc-100">
    <header class="flex flex-row items-center justify-center py-8 w-full">
        <h1 class="font-noto font-black text-stone-800 text-xl">Workerrr..</h1>
    </header>
    <div class="flex-1 w-full">
        <slot />
    </div>
    <footer class="flex flex-row items-center justify-center py-12 w-full">
        <div class="max-w-screen-xl flex-1 flex flex-row items-end justify-center">
            <div class="flex-1 flex flex-col items-start justify-center">
                <p class="font-noto text-stone-800 text-sm">比特反轉計畫#打工人</p>
                <p class="font-noto text-stone-800 text-sm">Copyright © 2024 Workerrr. All rights reserved.</p>
            </div>
        
            <div class="flex flex-row px-14">
                <ul class="flex flex-row gap-8">
                    <li class="font-noto font-bold text-stone-800 text-base">
                        相關連結
                        <ul class="mt-2 flex flex-col gap-1">
                            <li class="font-noto font-normal text-sm"><a href="#">官方網站</a></li>
                            <li class="font-noto font-normal text-sm">官方社群</li>
                            <li class="font-noto font-normal text-sm">APP</li>
                        </ul>
                    </li>
                    <li class="font-noto font-bold text-stone-800 text-base">
                        關於我們
                        <ul class="mt-2 flex flex-col gap-1">
                            <li class="font-noto font-normal text-sm">關於我們</li>
                            <li class="font-noto font-normal text-sm">聯絡我們</li>
                            <li class="font-noto font-normal text-sm">贊助我們</li>
                        </ul>
                    </li>
                    <li class="font-noto font-bold text-stone-800 text-base">
                        其他連結
                        <ul class="mt-2 flex flex-col gap-1">
                            <li class="font-noto font-normal text-sm">使用條款</li>
                            <li class="font-noto font-normal text-sm">隱私權政策</li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
        
    </footer>
</div>

