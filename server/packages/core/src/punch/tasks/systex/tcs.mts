import { CookieJar } from 'tough-cookie'
import { EIP_BASE_URL } from './share.mjs'
import * as requests from '../../../utils/requests.mjs'
import * as cheerio from 'cheerio'
import dayjs from 'dayjs'
import qs from 'qs'
import iconv from 'iconv-lite'

export const loginTCS = async (jar: CookieJar): Promise<{ success: boolean, memo: string, url: string }> => {
	try {
		let homeResponse = await requests.get(jar, `${EIP_BASE_URL}/UOF/Homepage.aspx`, {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
			'Referer': `${EIP_BASE_URL}/UOF/Login.aspx`
		})
		
		if (homeResponse.status === 302) {
			const location = homeResponse.headers.get('location')
			if (location) {
				const target = location.startsWith('http') ? location : `${EIP_BASE_URL}${location}`
				homeResponse = await requests.get(jar, target, {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
					'Referer': `${EIP_BASE_URL}/UOF/Login.aspx`
				})
			}
		}

		const homeContent = await homeResponse.text()
		const $ = cheerio.load(homeContent)
		
		let userGUID = $('#ctl00_userGUID').val() || $('input[name*="userGUID"]').val()
		
		if (!userGUID) {
			// Try to find any hidden field that looks like a GUID
			$('input[type="hidden"]').each((_, el) => {
				const val = $(el).val() as string
				if (val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
					userGUID = val
					return false
				}
			})
		}

		if (!userGUID) {
			const guidMatch = homeContent.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
			if (guidMatch) userGUID = guidMatch[0]
		}

		if (!userGUID) {
			const title = $('title').text().trim()
			const snippet = homeContent.substring(0, 500).replace(/\s+/g, ' ')
			if (homeContent.includes('Login.aspx') || title.includes('Login')) {
				return { success: false, memo: 'EIP 登入失效，請檢查帳號密碼', url: '' }
			}
			return { success: false, memo: `無法取得 userGUID (標題: ${title}, 內容片段: ${snippet})`, url: '' }
		}

		const ssoUrl = `${EIP_BASE_URL}/UOF/System/CustomMenu/LinkUrlNewWindow.aspx?menuID=4e5a0c44-bdb0-431b-ad26-ff0c1c8027d1&userGUID=${userGUID}`

		const ssoResponse = await requests.get(jar, ssoUrl, {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
			'Referer': `${EIP_BASE_URL}/UOF/Homepage.aspx`
		})
		
		const ssoContent = await ssoResponse.text()
		const tcsRedirectMatch = ssoContent.match(/location(?:\.href)?\s*=\s*['"]([^'"]+)['"]/) || ssoContent.match(/href\s*=\s*['"]([^'"]+)['"]/)
		
		if (!tcsRedirectMatch) {
			const snippet = ssoContent.substring(0, 500).replace(/\s+/g, ' ')
			return { success: false, memo: `無法取得 TCS SSO 轉導網址 (內容: ${snippet})`, url: '' }
		}
		
		let tcsBaseUrl = tcsRedirectMatch[1]
		if (!tcsBaseUrl.startsWith('http')) {
			tcsBaseUrl = `http://tcs.systex.com.tw${tcsBaseUrl.startsWith('/') ? '' : '/'}${tcsBaseUrl}`
		}

		const commonHeaders = {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
			'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
			'Connection': 'keep-alive'
		}

		let currentUrl = tcsBaseUrl
		let tcsResponse = await requests.get(jar, currentUrl, {
			...commonHeaders,
			'Referer': ssoUrl
		})
		
		// Follow redirects (max 5)
		for (let i = 0; i < 5 && tcsResponse.status === 302; i++) {
			const location = tcsResponse.headers.get('location')
			if (!location) break
			
			const lastUrl = currentUrl
			currentUrl = new URL(location, lastUrl).href
			
			tcsResponse = await requests.get(jar, currentUrl, {
				...commonHeaders,
				'Referer': lastUrl
			})
		}
		
		if (tcsResponse.status === 200 || tcsResponse.status === 302) {
			return { success: true, memo: 'TCS 登入成功', url: currentUrl }
		}
		
		return { success: false, memo: `TCS 登入異常，狀態碼: ${tcsResponse.status} (URL: ${currentUrl})`, url: '' }
	} catch (e) {
		return { success: false, memo: `TCS 登入過程發生錯誤: ${e instanceof Error ? e.message : String(e)}`, url: '' }
	}
}

export const getUnsubmittedReports = async (jar: CookieJar, tcsBaseUrl: string, startDate?: string, endDate?: string) => {
	const baseUrl = tcsBaseUrl.endsWith('/') ? tcsBaseUrl : tcsBaseUrl.substring(0, tcsBaseUrl.lastIndexOf('/') + 1)
	const queryPageUrl = `${baseUrl}workreport/dayqform.asp`
	
	const queryPageResponse = await requests.get(jar, queryPageUrl, {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
	})
	
	const queryPageBuffer = await queryPageResponse.arrayBuffer()
	const queryPageContent = iconv.decode(Buffer.from(queryPageBuffer), 'big5')
	const $q = cheerio.load(queryPageContent)
	
	let depid = $q('select[name="depdescs"] option:selected').val() as string
	let empid = $q('select[name="empnames"] option:selected').val() as string
	
	if (!depid || !empid) {
		const empScript = queryPageContent.match(/GetEmp\('([^']+)'\)/)
		if (empScript) {
			const getEmpUrl = `${baseUrl}workreport/GetEmp.asp?depid=${empScript[1]}`
			const empResponse = await requests.get(jar, getEmpUrl)
			const empBuffer = await empResponse.arrayBuffer()
			const empContent = iconv.decode(Buffer.from(empBuffer), 'big5')
			const $e = cheerio.load(empContent)
			depid = empScript[1]
			empid = $e('option').first().val() as string
		}
	}

	const sDate = startDate || dayjs().startOf('month').format('YYYY/M/D')
	const eDate = endDate || dayjs().format('YYYY/M/D')
	
	const queryUrl = `${baseUrl}workreport/DayLost.asp?depdescs=${depid}&empnames=${empid}&workdts=${sDate}&workdte=${eDate}&emplist=${empid}`
	const response = await requests.get(jar, queryUrl, {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
	})
	
	const buffer = await response.arrayBuffer()
	const content = iconv.decode(Buffer.from(buffer), 'big5')
	const $ = cheerio.load(content)
	
	const unsubmittedDates: string[] = []
	$('tr').each((_, el) => {
		const dateText = $(el).find('td').first().text().trim()
		if (dateText && /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(dateText)) {
			unsubmittedDates.push(dateText)
		}
	})
	
	return { dates: unsubmittedDates, depid, empid }
}

export const getProjectMenus = async (jar: CookieJar, tcsBaseUrl: string, depid: string, empid: string, workdt: string): Promise<Record<string, any>> => {
	const baseUrl = tcsBaseUrl.endsWith('/') ? tcsBaseUrl : tcsBaseUrl.substring(0, tcsBaseUrl.lastIndexOf('/') + 1)
	const projectMap: Record<string, any> = {}
	const types = ['L', 'P', 'A']
	
	for (const typeStr of types) {
		const ajaxUrl = `${baseUrl}workreport/SelprojAjax.asp`
		const postData = qs.stringify({ proj: '', empid, workdt, typeStr })

		const ajaxResponse = await requests.post(jar, ajaxUrl, postData, {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
			'Content-Type': 'application/x-www-form-urlencoded'
		})

		if (ajaxResponse.status !== 200) continue

		const buffer = await ajaxResponse.arrayBuffer()
		const decodeStr = (buf: ArrayBuffer, enc: string) => new TextDecoder(enc).decode(buf)
		let content = decodeStr(buffer, 'big5')
		const utf8Content = decodeStr(buffer, 'utf-8')
		const hasChinese = (s: string) => /[\u4e00-\u9fa5]/.test(s)
		
		if (content.includes('') || (!hasChinese(content) && hasChinese(utf8Content))) {
			content = utf8Content
		}

		const $ = cheerio.load(content)
		const currentProjects: Array<{ name: string, id: string }> = []

		$('input.btnProj1').each((_, el) => {
			const id = $(el).val() as string
			let name = $(el).attr('name') || id
			const onclick = $(el).attr('onclick') || ''
			const matches = [...onclick.matchAll(/['"]([^'"]*)['"]/g)].map(m => m[1])
			
			if (!hasChinese(name)) {
				const foundName = matches.find(hasChinese)
				if (foundName) name = foundName
			}

			if (id && !projectMap[id] && !currentProjects.find(p => p.id === id)) {
				currentProjects.push({ name, id })
			}
		})

		for (const project of currentProjects) {
			const subUrl = `${baseUrl}workreport/getSubProjectList.asp?proj=${project.id}&worktypeid=&sno=${Math.random()}`
			const subResponse = await requests.get(jar, subUrl)
			const subBuffer = await subResponse.arrayBuffer()
			let subContent = new TextDecoder('big5').decode(subBuffer)
			if (subContent.includes('')) subContent = new TextDecoder('utf-8').decode(subBuffer)
			
			const subProjects: any[] = []
			if (subContent !== '0' && subContent.trim() !== '') {
				const $sub = cheerio.load(subContent)
				$sub('input.btnSubProj').each((__, subEl) => {
					const sName = $(subEl).val() as string
					const sOnclick = $(subEl).attr('onclick') || ''
					const sMatches = [...sOnclick.matchAll(/['"]([^'"]*)['"]/g)].map(m => m[1])
					
					let sId = sMatches[1] || sName
					let sLabel = sMatches[2] || sName
					
					if (hasChinese(sMatches[1])) {
						sLabel = sMatches[1]
						sId = sName
					} else if (hasChinese(sName)) {
						sLabel = sName
						sId = sMatches[1] || sMatches[0]
					}

					const subObj: any = {}
					subObj[sId] = { subProjectName: sLabel }
					subProjects.push(subObj)
				})
			}
			
			if (subProjects.length === 0) {
				subProjects.push({ "None": { subProjectName: "無子系統" } })
			}
			
			projectMap[project.id] = { projectName: project.name, subProjects }
		}
	}
	return projectMap
}

export const getWorkTypeMenus = async (jar: CookieJar, tcsBaseUrl: string, projectId: string): Promise<Record<string, any>> => {
	const baseUrl = tcsBaseUrl.endsWith('/') ? tcsBaseUrl : tcsBaseUrl.substring(0, tcsBaseUrl.lastIndexOf('/') + 1)
	const ajaxUrl = `${baseUrl}workreport/SelcontAjax.asp`
	const postData = qs.stringify({ proj: projectId })

	const response = await requests.post(jar, ajaxUrl, postData, {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
		'Content-Type': 'application/x-www-form-urlencoded'
	})

	const buffer = await response.arrayBuffer()
	let content = new TextDecoder('big5').decode(buffer)
	if (content.includes('')) content = new TextDecoder('utf-8').decode(buffer)

	const $ = cheerio.load(content)
	const workTypeMap: Record<string, any> = {}

	$('input[onclick*="toggleDisplayById"]').each((_, el) => {
		const workTypeId = $(el).val() as string
		if (!workTypeId) return

		let workTypeName = $(el).closest('td').text().trim() || workTypeId
		const subWorkTypes: any[] = []
		const $container = $(`#${workTypeId}`)
		
		if ($container.length > 0) {
			$container.find('input[onclick*="SelCont"]').each((__, subEl) => {
				const subWorkTypeId = $(subEl).val() as string
				const subWorkTypeName = $(subEl).attr('name') || subWorkTypeId
				if (subWorkTypeId) {
					const subObj: any = {}
					subObj[subWorkTypeId] = { subWorkTypeName }
					subWorkTypes.push(subObj)
				}
			})
		}

		workTypeMap[workTypeId] = { workTypeName, subWorkTypes }
	})

	return workTypeMap
}

export interface DailyReportEntry {
	projectId: string;
	subProjectId: string;
	workTypeId: string;
	subWorkTypeId: string;
	workingHours: number;
	overtimeHours: number;
	memo: string;
}

export const searchProjects = async (jar: CookieJar, tcsBaseUrl: string, depno: string, workdt: string, keyword: string): Promise<Record<string, any>> => {
	const baseUrl = tcsBaseUrl.endsWith('/') ? tcsBaseUrl : tcsBaseUrl.substring(0, tcsBaseUrl.lastIndexOf('/') + 1)
	const searchUrl = `${baseUrl}workreport/getProjectList.asp`
	
	const shortDepNo = depno.length > 4 ? depno.substring(depno.length - 4) : depno
	
	// Legacy ASP expects Unicode escape for keywords
	const escapeUnicode = (str: string) => {
		return str.split('').map(c => {
			const code = c.charCodeAt(0)
			return code > 127 ? '%u' + code.toString(16).toUpperCase().padStart(4, '0') : encodeURIComponent(c)
		}).join('')
	}

	const params = `keyword=${escapeUnicode(keyword)}&depno=${shortDepNo}&workdt=${workdt}`

	const response = await requests.get(jar, `${searchUrl}?${params}`, {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
	})

	const buffer = await response.arrayBuffer()
	const buf = Buffer.from(buffer)
	
	// Force UTF-8 for this specific API as confirmed by browser inspection
	let content = iconv.decode(buf, 'utf-8')
	
	// If the result is clearly not UTF-8 (e.g., contains too many replacement chars or doesn't have common terms)
	// but for getProjectList.asp, we should trust the browser's E6 96 B0 finding.
	if (content.includes('\uFFFD') && !content.includes('專案')) {
		content = iconv.decode(buf, 'big5')
	}
	
	const $ = cheerio.load(content)
	
	const results: Record<string, any> = {}
	
	$('input[type="button"]').each((_, el) => {
		const projectId = $(el).val() as string
		const projectName = $(el).attr('name') || projectId
		if (!projectId) return

		// Parse subproject from onclick: SelProj2(this, 'subProjectId', 'subProjectName', '...')
		const onclick = $(el).attr('onclick') || ''
		const match = onclick.match(/SelProj2\s*\(\s*this\s*,\s*'([^']*)'\s*,\s*'([^']*)'/i)
		
		const subProjectId = match ? match[1] : 'None'
		const subProjectName = match ? match[2] : '無子系統'

		if (!results[projectId]) {
			results[projectId] = {
				projectName,
				subProjects: []
			}
		}

		// Avoid duplicate subprojects for the same project
		const exists = results[projectId].subProjects.some((s: any) => s[subProjectId])
		if (!exists) {
			const subObj: any = {}
			subObj[subProjectId] = { subProjectName }
			results[projectId].subProjects.push(subObj)
		}
	})

	return results
}

export const submitDailyReports = async (jar: CookieJar, tcsBaseUrl: string, depid: string, empid: string, date: string, entries: DailyReportEntry[], account?: string, password?: string): Promise<{ success: boolean, memo: string }> => {
	const baseUrl = tcsBaseUrl.endsWith('/') ? tcsBaseUrl : tcsBaseUrl.substring(0, tcsBaseUrl.lastIndexOf('/') + 1)
	const submitUrl = `${baseUrl}workreport/DayUpdate.asp`
	
	// Fetch menus to get names for IDs
	const projects = await getProjectMenus(jar, tcsBaseUrl, depid, empid, date)
	
	const entriesWithNames = await Promise.all(entries.map(async (entry) => {
		const projectInfo = projects[entry.projectId]
		const projectName = projectInfo?.projectName || ''
		let subProjectName = ''
		if (projectInfo?.subProjects) {
			for (const sub of projectInfo.subProjects) {
				if (sub[entry.subProjectId]) {
					subProjectName = sub[entry.subProjectId].subProjectName
					break
				}
			}
		}

		const workTypes = await getWorkTypeMenus(jar, tcsBaseUrl, entry.projectId)
		const workTypeInfo = workTypes[entry.workTypeId]
		let subWorkTypeName = ''
		if (workTypeInfo?.subWorkTypes) {
			for (const sub of workTypeInfo.subWorkTypes) {
				if (sub[entry.subWorkTypeId]) {
					subWorkTypeName = sub[entry.subWorkTypeId].subWorkTypeName
					break
				}
			}
		}

		return {
			...entry,
			projectName,
			subProjectName,
			subWorkTypeName: subWorkTypeName || entry.subWorkTypeId
		}
	}))

	const formData: any = {
		depdescs: depid,
		empnames: empid,
		workdt: date,
		workmax: entries.length.toString(),
		proj: entriesWithNames.map(e => e.projectId),
		projname: entriesWithNames.map(e => e.projectName),
		subsys: entriesWithNames.map(e => e.subProjectId),
		subsysname: entriesWithNames.map(e => e.subProjectName),
		contid: entriesWithNames.map(e => e.subWorkTypeId),
		contdesc: entriesWithNames.map(e => e.workTypeId),
		contnames: entriesWithNames.map(e => e.subWorkTypeName),
		workhr: entriesWithNames.map(e => (e.workingHours ?? 0).toString()),
		outhr: entriesWithNames.map(e => (e.overtimeHours ?? 0).toString()),
		remark: entriesWithNames.map(e => e.memo || ''),
		isChargeable: entriesWithNames.map(() => 'on'),
		del: entriesWithNames.map(() => 'A'),
		delme: entriesWithNames.map(() => 'A'),
		GetWorkno: entriesWithNames.map((_, i) => (i * 2).toString()),
		GetOutno: entriesWithNames.map((_, i) => (i * 2 + 1).toString()),
		workno: entriesWithNames.map(() => ''),
		IsInvolve: entriesWithNames.map(() => 'Y'),
		BeClosed: entriesWithNames.map(() => 'N'),
		PMCHK: entriesWithNames.map(() => 'N'),
		musr: entriesWithNames.map(() => empid),
		tracker: entriesWithNames.map(() => ''),
		OriginWorkType: entriesWithNames.map(() => '0'),
		WorkType: entriesWithNames.map(() => ''),
		PMISDESC: entriesWithNames.map(() => ''),
		PMISSIHR: entriesWithNames.map(() => ''),
		PMISSCDT: entriesWithNames.map(() => ''),
		callhr1: entriesWithNames.map(() => ''),
		callmin1: entriesWithNames.map(() => ''),
		overday1: entriesWithNames.map(() => '0'),
		callehr1: entriesWithNames.map(() => ''),
		callemin1: entriesWithNames.map(() => ''),
		calltype1: entriesWithNames.map(() => ''),
		Getcalltype1: entriesWithNames.map(() => ''),
		callcost1: entriesWithNames.map(() => '0'),
		calltext1: entriesWithNames.map(() => ''),
		PPT1: entriesWithNames.map(() => ''),
		CALLRoad1: entriesWithNames.map(() => ''),
		callhr2: entriesWithNames.map(() => ''),
		callmin2: entriesWithNames.map(() => ''),
		overday2: entriesWithNames.map(() => '0'),
		callehr2: entriesWithNames.map(() => ''),
		callemin2: entriesWithNames.map(() => ''),
		calltype2: entriesWithNames.map(() => ''),
		Getcalltype2: entriesWithNames.map(() => ''),
		callcost2: entriesWithNames.map(() => '0'),
		calltext2: entriesWithNames.map(() => ''),
		PPT2: entriesWithNames.map(() => ''),
		CALLRoad2: entriesWithNames.map(() => ''),
		PMISACTC: entriesWithNames.map(() => ''),
		ProjComplete: 'Y',
		HtmlCode: 'BIG5'
	}

	const body = qs.stringify(formData, {
		arrayFormat: 'repeat',
		encoder: (str) => {
			const buf = iconv.encode(str, 'big5')
			let encoded = ''
			for (const byte of buf) encoded += '%' + byte.toString(16).toUpperCase().padStart(2, '0')
			return encoded
		}
	})

	const response = await requests.post(jar, submitUrl, body, {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
		'Content-Type': 'application/x-www-form-urlencoded'
	})

	if (response.status === 302 || response.status === 200) {
		const resultBuffer = await response.arrayBuffer()
		const resultText = iconv.decode(Buffer.from(resultBuffer), 'big5')
		
		if (resultText.includes('更新成功') || resultText.includes('填寫完畢') || resultText.includes('DayLost.asp')) {
			return { success: true, memo: '日報提交成功' }
		}

		if (resultText.includes('錯誤') || resultText.includes('失敗')) {
			return { success: false, memo: `提交失敗: ${resultText.substring(0, 500).trim()}` }
		}

		// If no clear error/success, log snippet for debugging
		const snippet = resultText.substring(0, 500).replace(/\s+/g, ' ')
		return { success: true, memo: `提交完成 (回傳內容預覽: ${snippet})` }
	}

	return { success: false, memo: `提交異常，狀態碼: ${response.status}` }
}
