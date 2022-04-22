const $$ = mdui.$;

let hasMarkdown = false

let mode = 'AI'

let coverName = 'cover.jpg'

let markdownName = 'index.md'


function init(iput_mode, ...data) {

	if (iput_mode) {
		mode = iput_mode
	}

	if (mode == `MD`) {

		updateHTMLBody()
		$$('body').addClass(`mdui-drawer-body-left mdui-appbar-with-toolbar`)
		$$('header').addClass(`mdui-appbar-fixed`)
		// 菜单按钮	
		$$('#headerName').before(`
		<a href="javascript:;" class="mdui-btn mdui-btn-icon" mdui-drawer="{target: '#left-drawer'}">
			<i class=" mdui-icon material-icons">menu</i>
		</a>
		`)
		$$("#player-open").after(`
			<div class="mdui-float-right" id="player-layout">
				<div id="aplayer"></div>
			</div>
		`)
		$$('#player-open').hide();
		// $$("#left-drawer").addClass('mdui-drawer-open')
		if (data[0]) {
			markdownName = data[0]
		}

		// $$("#title").text(markdownName);
		// $$("#headerName").text(markdownName);
		$$(function () {
			if (markdownName.endsWith("/index.md")) {
				$$('#arrow_back').hide()
			} else {
				$$('#drawer-title').hide()
			}
			convertMarkDown()
			if (data[1]) {
				$$('#player-open').attr('onclick', `startPlayMusic('` + data[1] + `','` + data[2] + `','` + data[3] + `');`);
				startPlayMusic(data[1], data[2], data[3])
			}
		})
	}


	if (mode == `AI`) {
		if ($$('h1').first().html() == 'no_need_index') {
			return
		}

		$$('h1').hide();
		$$('hr').hide();
		$$('pre').hide();
		updateHTMLBody()
		// 返回按钮
		$$('#headerName').before(`
		<a href="javascript:;" id="back" class="mdui-btn mdui-btn-icon">
			<i class="mdui-icon material-icons">arrow_back</i>
		</a>
		`)
		$$(".mdui-container").after(`
			<div class="mdui-float-right" id="player-layout">
				<div id="aplayer"></div>
			</div>
		`)
		$$('#player-open').hide();
		// 默认隐藏 目录 
		$$("#left-drawer").addClass('mdui-drawer-close')
		$$("#headerName").text($$('h1').first().html());
		convertList()

	}

}

function updateHTMLBody() {

	// $$('body').removeAttr('bgcolor')
	$$('body').addClass('mdui-theme-primary-light-green mdui-theme-accent-yellow mdui-theme-layout-dark')


	$$('head').append(`
		<title id="title"></title>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width">
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta name="description" content="autoindex.js 自动注入"">
		<meta name="google-site-verification" content="EyTM-xT6c_hVlrHBCvSX3osnfGPCLN1zg_mTBgWf0FM" />
	`)

	$$('body').append(`
		<!-- autoindex 注入 -->
		<header class="markdown-header mdui-appbar">
			<div class="mdui-toolbar mdui-color-theme">
				<a href="javascript:;" class="mdui-typo-headline" id="headerName"></a>
				<a href="javascript:;" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '花自飘零水自流，一种相思，两处闲愁'}">
					<i class="mdui-text-color-red mdui-icon material-icons">favorite</i>
				</a>
				<a href="/index.html?p=links" class="mdui-btn" mdui-tooltip="{content: '友情链接'}">
					<i class="mdui-text-color-orange mdui-icon material-icons">collections_bookmark</i>
					友情链接
				</a>
				<div class="mdui-toolbar-spacer"></div>

				<a href="javascript:;" id="player-open" class="mdui-btn mdui-btn-icon" style="margin-right: 8%;">
					<i class="mdui-icon material-icons" >play_arrow</i>
				</a>

			</div>
		</header>

		<drawer class="mdui-drawer" id="left-drawer">
			<a id="arrow_back" style="text-decoration:none;" href="/index.html" mdui-tooltip="{content: '返回首页'}">
				<h1 class="mdui-p-x-2 mdui-ripple">
					回到首页
				</h1>
			</a>
			<h1 id="drawer-title" class="mdui-p-x-2 mdui-ripple">
				目录
			</h1>
		</drawer>

		<div class="mdui-container autoindex-container">
			<ul class="mdui-list mdui-list-dense" id="theList">
			</ul>
			
			<div class="markdown-body markdown-body-custom">
				<div id="markDown" class="mdui-p-x-2"></div>
				<div class="markdown-body-custom mdui-divider-light mdui-m-a-2"></div>
				<div id="copyRight" class="mdui-p-a-2"></div>
			</div>
			<div class="comments-body mdui-p-x-2">
				<div id="gitalk-container"></div>
			</div>
			<div class="markdown-body-custom mdui-divider-light mdui-m-t-2"></div>
			<div id="pv" class="mdui-p-a-2"></div>
		</div>

		<footer class="autoindex-footer mdui-bottom-nav-scroll-hide">
			<!-- 页脚信息 -->
			<a class="mdui-float-left  mdui-p-x-2">© 2022 继续怠惰的侯爷</a>
			<a class="mdui-float-right  mdui-p-x-2">嗯~ o(*￣▽￣*)o</a>
		</footer>
		<!-- autoindex 注入 -->
	`)
}

/**
 * 对列表信息进行转换
 * @param {*} raw 
 */
function getInfo(raw) {
	// TODO 待优化 raw.data 可以显示得更漂亮
	//console.log(raw);

	raw = raw.textContent ? raw.textContent : raw.innerText;
	info = raw.replace(" ", "")

	// console.log(info);

	return info
}

/**
 * 对列表名称获取其类型
 * @param {*} URL 
 */
function getType(URL) {
	// console.log(fileName);
	if (/\/$/.test(URL)) {
		return 'folder'
	}
	fileExt = URL.substring(URL.lastIndexOf('.') + 1).toLowerCase();
	// console.log(fileExt);
	icon = 'insert_drive_file'
	// TODO 配合 openItem 实现各类文件当前目录打开
	// 尤其是一些 媒体文件 比如 mp3 
	if ('apk'.includes(fileExt)) {
		return "android"
	}
	if ('zip|7z|bz2|gz|tar|tgz|tbz2|xz|cab|rar|r00'.includes(fileExt)) {
		return "archive"
	}
	if ('py|js|php|pl|rb|sh|bash|lua|sql|go|rs|java|c|h|cpp|cxx|hpp'.includes(fileExt)) {
		return "'code'"
	}
	if ('jpg|png|bmp|gif|ico|webp'.includes(fileExt)) {
		return "image"
	}
	if ('acc|ape|aiff|arm|flac|m4a|midi|mp3|ogg|wav|wma|'.includes(fileExt)) {
		return 'music_note'
	}
	if ('flv|wmv|mp4|mkv|avi|mkv|vp9'.includes(fileExt)) {
		return 'movie'
	}
	return 'insert_drive_file'
}

/**
 * 播放音乐 
 * @param {*} url 音乐路径
 * @param {*} name 音乐名称
 * @param {*} cover 音乐封面
 */
function startPlayMusic(url, name, cover) {

	if (!name) {
		name = getName(url)
	}
	if (!cover) {
		cover = url.replace(/[^/]+$/, '') + coverName
	}
	$$('#player-open').hide();
	// console.log("[MUSIC]: ", url, name, cover);
	// TODO 不要重复初始化
	const musicPlayer = new APlayer({
		container: document.getElementById('aplayer'),
		theme: '#000000',
		// fixed: true,
		audio: [
			{
				name: name,
				url: url,
				cover: cover
			}
		]
	});

	musicPlayer.play()

	$$("#player-layout").append(`
	<button id="player-close" class="mdui-btn mdui-btn-icon mdui-float-right">
		<i class="mdui-icon material-icons">
		close
		</i>
	</button>`)

	$$("#player-close").on('click', function (e) {
		musicPlayer.destroy()
		$$('#player-close').remove();
		$$('#player-open').show();
	});
}

/**
 * 判断是否在当前页面就处理了 不进行跳转
 * @param {*} event 
 * @param {*} URL 
 */
function openItem(event, URL) {
	// event.preventDefault();
	let dataType = getType(URL);
	// TODO 其他类型文件打开支持
	if (dataType == 'music_note') {
		$$('#player-open').attr('onclick', `startPlayMusic('` + URL + `');`);
		startPlayMusic(URL);
		// 决定留下来了 不走了
		return false
	}
	return true
}

/**
 * 通过链接获取文件的名字
 * @param {*} URL 
 */
function getName(URL) {
	return decodeURI(URL.substring(URL.lastIndexOf('/') + 1));
}

/**
 * 用于 createMenu#reduce 内部的 HTML 组装方法
 * @param {*} current 
 */
function getLink(current) {
	if (current.title.length > 22) {
		current.title = current.title.substring(0, 22) + '<br />' + current.title.substring(22);
	}
	if (current.href) {
		return `<a class="mdui-list-item mdui-ripple" `
			+ `href="` + current.href + `" `
			+ `>` + current.title + `</a>`
	} else {
		return `<a class="mdui-list-item mdui-ripple" `
			+ ` onclick="menuSelect('#` + current.id + `');"`
			+ `>` + current.title + `</a>`
	}
}

/**
 * 目录 对象的点击跳转
 * @param {*} id 目录项ID
 */
function menuSelect(id) {
	if (window.innerWidth <= 1024) {
		leftDrawer.close();
	}

	console.log(location.pathname + window.location.search + id);

	location.href = location.pathname + window.location.search + id

	window.scrollBy(0, - 100);

	$$(id).addClass('markdown-selected');

	setTimeout(() => {
		$$(id).removeClass('markdown-selected');
	}, 3000);

}

/**
 * MarkdownMenu 主方法
 * 读取 markdown 中的 H1-H6 生成目录
 */
function createMenu() {
	let titleListDOM =
		Array
			.from($$('#markDown')[0].childNodes)
			.filter((node) => /h[1-6]/i.test(node.tagName))
			.map((node) => ({
				href: node.childNodes[0].href,
				id: node.getAttribute('id'),
				level: parseInt(node.tagName.replace('H', '')),
				title: node.innerText
			}))
			.reduce(
				/*
				result: 必需。初始值, 或者计算结束后的返回值。
				current 必需。当前元素。
				index   可选。当前元素的索引；                     
				list    可选。当前元素所属的数组对象。
				*/
				(result, current, index, list) => {
					// 如果 index > 0 获取前一个元素
					if (index) { var prev = list[index - 1] }
					if (!index || prev.level === current.level) {
						// index = 0 或者 emm 没有其他情况了
						result += getLink(current)
					} else if (prev.level > current.level) {
						// ??
						while (prev.level-- > current.level) {
							result += '</div>'
						}
						result += getLink(current)
					} else if (prev.level < current.level) {
						// ??
						while (prev.level++ < current.level) {
							result += '<div class="mdui-list mdui-p-l-2">'
						}
						result += getLink(current)
					}
					return result
				},
				// initialValue: 可选。传递给函数的初始值，相当于 result 的初始值。
				`<ul class="mdui-list">`
			) + `</ul>`; // 最后再拼接尾部

	$$('#left-drawer').append(titleListDOM)
	leftDrawer = new mdui.Drawer('#left-drawer');
}

/**
 * AutoIndex 的主方法
 * 对 文件列表 进行操作
 */
function convertList() {
	let dataList = $$('pre').children()

	// console.log(dataList);
	// console.log(dataList.length);
	let nodes = $$('pre')[0].childNodes

	for (let i = 0; i < dataList.length; i++) {

		let each = dataList[i]
		let eachURL = each.href

		// let eachName = each.innerHTML
		let eachName = getName(eachURL)
		if (!eachName) {
			eachName = each.innerHTML
		}

		// TODO 如果只有一个文件 且为markdown的时候 是否直接切换为 Markdown 阅读模式
		if (eachName == markdownName) {
			$$('#theList').after(`
			<h1>
				<button class="mdui-fab mdui-fab-mini mdui-ripple" style="margin-left: 15px;" mdui-drawer="{target: '#left-drawer'}">
					<i class="mdui-icon material-icons">menu</i>
				</button>
			<span id="markdown-name" class="mdui-m-x-2">目录</span>
			</h1>
			`)
			hasMarkdown = true;
		}

		let eachType = getType(eachURL);
		let eachInfo = nodes[i * 2 + 1];
		eachInfo = getInfo(eachInfo)

		if (i == 0) {
			$$('#back').attr('href', eachURL);
			continue
		}

		listItemDOM =
			`
			<a href="`+ eachURL + `" onclick="return openItem(event,'` + eachURL + `');">
			<li class="mdui-list-item mdui-ripple">
				<i class="mdui-list-item-avatar mdui-color-grey-900 mdui-icon material-icons" >
					`+ eachType + `
				</i>
				<div class="mdui-list-item-content mdui-p-x-2">
					<div class="mdui-list-item-title">
						`+ eachName + `
					</div>
					<div class="mdui-list-item-text mdui-list-item-one-line">
						`+ eachInfo + `
					</div>
				</div>
			</li>
			</a>
			`
		$$('#theList').append(listItemDOM)

	}

	if (hasMarkdown) {
		// 在 DOM 加载完毕后会调用
		$$(function () { convertMarkDown() })
	}
}

/**
 * MarkDownReader 的主方法
 * 读取 markdown 文件并转换成 HTML
 */
function convertMarkDown() {
	let docURL = location.pathname.replace(/[^/]+$/, '') + markdownName

	// 代码高亮
	marked.setOptions({
		renderer: new marked.Renderer(),
		highlight: function (code) {
			return hljs.highlightAuto(code).value;
		},
		pedantic: false,
		gfm: true,
		tables: true,
		breaks: false,
		sanitize: false,
		smartLists: true,
		smartypants: false,
		xhtml: false
	});

	$$.ajax({
		url: docURL,
		success: function (data, textStatus, xhr) {
			// console.log(data);
			// console.log(marked(data));
			$$('#markDown').append(marked(data));

			convertFlow()
			convertSequence()
			convertMermaid()
			createMenu()
			if (mode == 'AI') {
				$$("#drawer-title").text(markdownName);
				$$("#markdown-name").text(markdownName);
			} else {
				$$("#headerName").text($$('#markDown').children().first().text());
				$$("#title").text($$('#markDown').children().first().text());
				addExtraHtml()
			}

		}
	})
}

function addExtraHtml() {
	copyRight =
		`
	<span style="color: darkcyan;">
	版权声明： 本博客所有文章除特别声明外，均采用 
	<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" rel="noopener" target="_blank">
		BY-NC-SA 4.0
	</a> 
	许可协议。转载请注明出处！
	</span>
	`
	pvHtml =
		`
	<span id="busuanzi_container_site_pv" class="pv-body">本站总访问量: <span id="busuanzi_value_site_pv"></span> 次</span>
	`
	$$('#copyRight').append(copyRight)
	$$('#pv').append(pvHtml)

	// 自定义的 media 进行播放器初始化
	let medias = $$('media')
	if (medias.length > 0) {
		url = medias[0].attributes.src.value
		// console.log(url)
		$$('#player-open').attr('onclick', `startPlayMusic('` + url + `');`);
		startPlayMusic(url)
	}

}

/**
 * 读取 HTML 中的 flow 代码块转换成 svg 图
 */
function convertFlow() {
	// 读取 markdown 中的 flow 生成流程图
	let flowList = $$('code.language-flow')
	for (let index = 0; index < flowList.length; index++) {
		let code = flowList[index].outerText;
		// console.log(code);

		if (!code) {
			continue;
		}
		try {
			let chart = flowchart.parse(code);
			// console.log(chart);

			flowList[index].innerHTML = "<div id='canvas-flow-" + index + "'></div>"

			chart.drawSVG('canvas-flow-' + index, {
				'x': 0,
				'y': 0,
				'line-width': 2,
				'line-length': 32,
				'text-margin': 8,
				'font-size': 14,
				'fill': 'white',
				'yes-text': '是',
				'no-text': '否',
				// style symbol types
				'symbols': {
					'start': {
						'element-color': 'green',
					},
					'condition': {
						'element-color': 'brown',
					},
					'end': {
						'element-color': 'red',
					}
				}
			});
		} catch (error) {
			console.log(error);
		}
	}
}

/**
 * 读取 HTML 中的 mermaid 代码块转换成 svg 图
 */
function convertMermaid() {
	let config = {
		startOnLoad: true,
		flowchart: {
			useMaxWidth: false,
			htmlLabels: true
		},
		sequence: {
			useMaxHeight: false
		}
	};
	mermaid.initialize(config);

	let mermaidList = $$('code.language-mermaid')

	// 读取 markdown 中的 mermaid 生成各种图
	for (let index = 0; index < mermaidList.length; index++) {
		let code = mermaidList[index].outerText;
		if (!code) {
			continue;
		}
		try {
			let svg = mermaid.render('mermaid_' + index, code);
			mermaidList[index].innerHTML = svg
		} catch (error) {
			console.log(error);
		}
	}
}

/**
 * 读取 HTML 中的 sequence 代码块转换成 svg 图
 */
function convertSequence() {
	let sequenceList = $$('code.language-sequence')
	// 读取 markdown 中的 sequence 生成流程图
	for (let index = 0; index < sequenceList.length; index++) {
		let code = sequenceList[index].outerText;
		if (!code) {
			continue;
		}
		try {
			let chart = Diagram.parse(code);
			sequenceList[index].innerHTML = "<div id='canvas-sequence-" + index + "'></div>"
			chart.drawSVG('canvas-sequence-' + index, { theme: 'simple' });
		} catch (error) {
			console.log(error);
		}
	}
}

