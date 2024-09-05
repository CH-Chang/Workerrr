import mustache from 'mustache'

const template = `
<!DOCTYPE html>
<html lang="zh-Hant">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: '微軟正黑體', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        .container {
            width: 100%;
        }

        .header,
        .footer {
            background-color: #ffffff;
            text-align: center;
            padding: 1rem;
        }

        .logo {
            color: #1c1917;
            font-weight: 900;
            font-size: 1.875rem;
        }

        .content {
            background-color: #1c1917;
            color: #e2e8f0;
            border-radius: 1rem;
            margin: 1rem auto;
            max-width: 600px;
        }

        .content-inner {
            padding: 4rem 2rem;
        }

        .title-box {
            padding-bottom: 1rem;
        }

        .title {
            font-size: 1.25rem;
            font-weight: 900;
            margin: 0;
            text-align: left;
        }

        .greeting {
            font-size: 1.125rem;
            font-weight: 700;
            margin: 0;
        }

        .message-box {
            padding-top: 1rem;
            padding-bottom: 1rem;
        }

        .message-box p {
            font-size: 0.85rem;
            margin: 0;
        }

		.message-box .message-mt {
			margin-top: 1.2rem;
		}

        .signature-box p {
            font-size: 0.85rem;
            margin: 0;
            text-align: right;
        }

        .link-box {
            text-align: center;
        }

        .link {
            margin: 0 0.5rem;
            color: #1c1917;
            font-size: 0.85rem;
            text-decoration: none;
        }

        .copyright {
            font-size: 0.85rem;
            margin: 0;
            color: #1c1917;
        }
    </style>
</head>

<body>
    <table class="container" cellpadding="0" cellspacing="0">
        <tr>
            <td class="header" style="padding: 1rem;">
                <div class="logo">Workerrr..</div>
            </td>
        </tr>
        <tr>
            <td>
                <table class="content" cellpadding="0" cellspacing="0" align="center">
                    <tr>
                        <td class="content-inner">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td class="title-box">
                                        <h2 class="title">👷打工人系統服務通知👷</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="greeting-box">
                                        <p class="greeting">親愛的用戶您好，</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="message-box">
                                        <p>感謝您使用打工人系統服務，</p>
                                        <p class="message-mt">您申請的打卡帳號密碼變更，，</p>
                                        <p>驗證碼為『{{ otp }}』，</p>
										<p>請於五分鐘內完成變更程序。</p>
                                        <p class="message-mt">如果您有任何問題，</p>
                                        <p>請隨時聯繫我們的客服團隊。</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="signature-box">
                                        <p>此致，</p>
                                        <p>打工人系統。</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class="footer">
                <div class="link-box">
                    <a class="link" href="#">打工人官網</a>
                    <a class="link" href="#">打工人APP</a>
                    <a class="link" href="#">關於打工人</a>
                </div>
                <div class="copyright-box">
                    <p class="copyright">Copyright © 2024 Workerrr. All rights reserved.</p>
                </div>
            </td>
        </tr>
    </table>
</body>

</html>
`

export const render = (data: Record<string, any>): string => {
	return mustache.render(
		template,
		data
	)
}
