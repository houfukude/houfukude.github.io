const $$ = mdui.$;

let hasMarkdown = false;

let mode = 'AI';

let coverName = 'cover.jpg';

let markdownName = 'index.md';

// 抽屉实例（menuSelect 中需要据此收起抽屉）
let leftDrawer = null;

function init(iput_mode, ...data) {
	if (iput_mode) {
		mode = iput_mode;
	}

	if (mode == `MD`) {
		updateHTMLBody();
		$$('body').addClass(`mdui-drawer-body-left mdui-appbar-with-toolbar`);
		$$('header').addClass(`mdui-appbar-fixed`);
		// 菜单按钮：放在标题前
		$$('#headerName').before(`
		<a href="javascript:;" class="mdui-btn mdui-btn-icon" mdui-drawer="{target: '#left-drawer'}">
			<i class=" mdui-icon material-icons">menu</i>
		</a>
		`);
		$$('#player-open').after(`
			<div class="mdui-float-right" id="player-layout">
				<div id="aplayer"></div>
			</div>
		`);
		$$('#player-open').hide();
		// 容器一并隐藏：它固定占着右上角 300×66，不藏起来会盖住工具栏按钮，
		// 表现为“关了播放器就再也点不开”
		$$('#player-layout').hide();
		if (data[0]) {
			markdownName = data[0];
		}

		// $$("#title").text(markdownName);
		// $$("#headerName").text(markdownName);
		$$(function () {
			if (markdownName.endsWith('/index.md')) {
				$$('#arrow_back').hide();
			} else {
				$$('#drawer-title').hide();
			}
			convertMarkDown();
			if (data[1]) {
				$$('#player-open').attr(
					'onclick',
					`startPlayMusic('` +
						data[1] +
						`','` +
						data[2] +
						`','` +
						data[3] +
						`');`,
				);
				startPlayMusic(data[1], data[2], data[3]);
			}
		});

		// 挂件最后加载，不阻塞正文
		initSakana();
	}

	if (mode == `AI`) {
		if ($$('h1').first().html() == 'no_need_index') {
			return;
		}

		$$('h1').hide();
		$$('hr').hide();
		$$('pre').hide();
		updateHTMLBody();
		// 返回按钮：放在标题前
		$$('#headerName').before(`
		<a href="javascript:;" id="back" class="mdui-btn mdui-btn-icon">
			<i class="mdui-icon material-icons">arrow_back</i>
		</a>
		`);
		$$('.mdui-container').after(`
			<div class="mdui-float-right" id="player-layout">
				<div id="aplayer"></div>
			</div>
		`);
		$$('#player-open').hide();
		$$('#player-layout').hide();
		// 默认隐藏 目录
		$$('#left-drawer').addClass('mdui-drawer-close');
		$$('#headerName').text($$('h1').first().html());
		convertList();
	}
}

function updateHTMLBody() {
	// $$('body').removeAttr('bgcolor')
	$$('body').addClass(
		'mdui-theme-primary-light-green mdui-theme-accent-yellow mdui-theme-layout-dark',
	);

	// 元信息按需补齐：页面自带的不要重复注入（重复的 viewport 会互相覆盖）
	if (!$$('head title').length) {
		$$('head').append('<title id="title"></title>');
	} else if (!$$('#title').length) {
		// 已有 <title>：挂上 id，供后续设置文章标题使用
		$$('head title').first().attr('id', 'title');
	}
	if (!$$('head meta[charset]').length) {
		$$('head').append('<meta charset="utf-8">');
	}
	if (!$$('head meta[http-equiv="X-UA-Compatible"]').length) {
		$$('head').append('<meta http-equiv="X-UA-Compatible" content="IE=edge">');
	}
	if (!$$('head meta[name="viewport"]').length) {
		$$('head').append(
			'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
		);
	}
	if (!$$('head meta[name="description"]').length) {
		$$('head').append(
			'<meta name="description" content="autoindex.js 自动注入">',
		);
	}
	if (!$$('head meta[name="google-site-verification"]').length) {
		$$('head').append(
			'<meta name="google-site-verification" content="EyTM-xT6c_hVlrHBCvSX3osnfGPCLN1zg_mTBgWf0FM" />',
		);
	}

	$$('body').append(`
		<!-- 阅读进度条（固定顶部，3px） -->
		<div id="read-progress"><span></span></div>
		<!-- autoindex 注入 -->
		<header class="markdown-header mdui-appbar">
			<div class="mdui-toolbar mdui-color-theme">
				<a href="javascript:;" class="mdui-typo-headline" id="headerName"></a>
				<a href="javascript:;" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '花自飘零水自流，一种相思，两处闲愁'}">
					<i class="mdui-text-color-red mdui-icon material-icons">favorite</i>
				</a>
				<a href="index.html?p=links" class="mdui-btn" id="links-btn" mdui-tooltip="{content: '友情链接'}">
					<i class="mdui-text-color-orange mdui-icon material-icons">collections_bookmark</i>
					<span class="btn-label">友情链接</span>
				</a>
				<div class="mdui-toolbar-spacer"></div>

				<a href="javascript:;" id="player-open" class="mdui-btn mdui-btn-icon">
					<i class="mdui-icon material-icons" >play_arrow</i>
				</a>

				<!-- 顶栏头像：直接用 GitHub 头像源（跟 houfukude.png 走重定向，无需本地图） -->
				<a href="https://github.com/houfukude" class="header-avatar-link" target="_blank"
					rel="noopener noreferrer" title="GitHub · houfukude">
					<img class="header-avatar" src="https://github.com/houfukude.png"
						alt="houfukude" width="30" height="30" loading="lazy" decoding="async">
				</a>

			</div>
		</header>

		<drawer class="mdui-drawer" id="left-drawer">
			<a id="arrow_back" href="index.html" mdui-tooltip="{content: '返回首页'}">
				<i class="mdui-icon material-icons">arrow_back</i>
				<span>回到首页</span>
			</a>
			<h1 id="drawer-title" class="mdui-p-x-2">
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
			<a class="mdui-float-left  mdui-p-x-2">© <span id="year">2022</span> 继续怠惰的侯爷</a>
			<a class="mdui-float-right  mdui-p-x-2">嗯~ o(*￣▽￣*)o</a>
		</footer>
		<!-- 回到顶部 -->
		<button id="back-to-top" type="button" aria-label="回到顶部" title="回到顶部">
			<i class="mdui-icon material-icons">arrow_upward</i>
		</button>
		<div class="sakana-box"></div>
		<!-- autoindex 注入 -->
	`);

	// 阅读进度条 + 回到顶部（纯原生实现，不引入依赖）
	$$('body').append(`
		<div id="read-progress"></div>
		<button id="back-to-top" type="button" class="mdui-btn mdui-btn-icon" title="回到顶部" aria-label="回到顶部">
			<i class="mdui-icon material-icons">keyboard_arrow_up</i>
		</button>
	`);

	setFooterYear();
	initScrollAssist();
}

/**
 * 设置页脚年份
 */
function setFooterYear(){
	const year = new Date().getFullYear();
	// console.log(year); 
	$$('#year').text(year);
}

/* ---------------------------------------------------------
   阅读体验增强：进度条 / 回到顶部 / 顶栏滚动态
   --------------------------------------------------------- */
function initScrollAssist() {
	const bar = document.querySelector('#read-progress > span');
	const topBtn = document.getElementById('back-to-top');
	const header = document.querySelector('header.markdown-header');

	if (topBtn && !topBtn.dataset.bound) {
		topBtn.dataset.bound = '1';
		topBtn.addEventListener('click', function () {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	let ticking = false;

	function update() {
		ticking = false;

		const doc = document.documentElement;
		const max = doc.scrollHeight - doc.clientHeight;
		const y = window.pageYOffset || doc.scrollTop;

		// 文档不足一屏时不给误导性的满格进度
		if (bar) {
			bar.style.width = max > 0 ? Math.min(100, (y / max) * 100) + '%' : '0%';
		}

		if (topBtn) {
			topBtn.classList.toggle('is-visible', y > 400);
		}

		if (header) {
			header.classList.toggle('is-scrolled', y > 8);
		}
	}

	// 全局只绑一次，重复调用只重算状态
	if (!window.__scrollAssistBound) {
		window.__scrollAssistBound = true;
		window.addEventListener(
			'scroll',
			function () {
				if (!ticking) {
					ticking = true;
					window.requestAnimationFrame(update);
				}
			},
			{ passive: true },
		);
		window.addEventListener('resize', update, { passive: true });
	}

	update();
}

/* ---------------------------------------------------------
   目录高亮：滑到哪一节，侧栏就标到哪一项
   --------------------------------------------------------- */
function observeHeadings() {
	const drawer = document.getElementById('left-drawer');
	if (!drawer) {
		return;
	}

	// 只处理带 data-target 的跳转项（标题锚点）
	const links = Array.from(drawer.querySelectorAll('a[data-target]'));
	if (!links.length) {
		return;
	}

	const pairs = [];
	links.forEach(function (link) {
		const id = (link.getAttribute('data-target') || '').replace(/^#/, '');
		const el = id ? document.getElementById(id) : null;
		if (el) {
			pairs.push({ link: link, el: el });
		}
	});

	if (!pairs.length) {
		return;
	}

	let lastActive = null;
	const OFFSET = 120; // 与顶栏高度大致对齐

	function sync() {
		let active = pairs[0].link;

		// 标题是按文档顺序排列的：取最后一个已滚过闸线的
		for (let i = 0; i < pairs.length; i++) {
			if (pairs[i].el.getBoundingClientRect().top <= OFFSET) {
				active = pairs[i].link;
			} else {
				break;
			}
		}

		if (active !== lastActive) {
			if (lastActive) {
				lastActive.classList.remove('toc-active');
			}
			active.classList.add('toc-active');
			lastActive = active;
		}
	}

	if (!window.__tocBound) {
		window.__tocBound = true;
		let tocTicking = false;
		window.addEventListener(
			'scroll',
			function () {
				if (!tocTicking) {
					tocTicking = true;
					window.requestAnimationFrame(function () {
						tocTicking = false;
						if (typeof window.__tocSync === 'function') {
							window.__tocSync();
						}
					});
				}
			},
			{ passive: true },
		);
	}

	window.__tocSync = sync;
	sync();
}

/* ---------------------------------------------------------
   直接以 #锚点 打开页面时，也给一次落点提示
   （浏览器只会滚动过去，不会调用 menuSelect，所以原本没有高亮）
   --------------------------------------------------------- */
function flashHashTarget() {
	if (!location.hash || location.hash.length < 2) {
		return;
	}

	const raw = location.hash.slice(1);
	let target = null;

	try {
		target = document.getElementById(decodeURIComponent(raw));
	} catch (err) {
		target = document.getElementById(raw);
	}

	if (!target) {
		return;
	}

	target.classList.add('markdown-selected');
	setTimeout(function () {
		target.classList.remove('markdown-selected');
	}, 3000);
}

/* ---------------------------------------------------------
   按需加载：首屏用不到的大库推迟到真正需要时
   --------------------------------------------------------- */
const CDN = {
	raphael: '//cdnjs.cloudflare.com/ajax/libs/raphael/2.3.0/raphael.min.js',
	flowchart: '//cdnjs.cloudflare.com/ajax/libs/flowchart/1.13.0/flowchart.min.js',
	snap: '//cdnjs.cloudflare.com/ajax/libs/snap.svg/0.5.1/snap.svg-min.js',
	underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js',
	sequence:
		'//cdnjs.cloudflare.com/ajax/libs/js-sequence-diagrams/1.0.6/sequence-diagram-min.js',
	mermaid: '//cdnjs.cloudflare.com/ajax/libs/mermaid/8.13.10/mermaid.min.js',
	aplayer: '//cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.js',
	aplayerCss: '//cdnjs.cloudflare.com/ajax/libs/aplayer/1.10.1/APlayer.min.css',
	sakana: '//cdn.jsdelivr.net/npm/sakana',
};

const scriptQueue = {};

/**
 * 同一个 URL 只真正插入一次 <script>，并发调用排队等 onload
 * @param {string} url 脚本地址
 * @param {function} ready 检测库是否已就绪
 * @param {function} callback 就绪后执行
 */
function loadScriptOnce(url, ready, callback) {
	if (ready()) {
		callback();
		return;
	}

	if (scriptQueue[url]) {
		scriptQueue[url].push(callback);
		return;
	}
	scriptQueue[url] = [callback];

	const el = document.createElement('script');
	el.src = url;
	el.async = true;
	el.onload = function () {
		const queue = scriptQueue[url] || [];
		scriptQueue[url] = null;
		queue.forEach(function (fn) {
			try {
				fn();
			} catch (err) {
				console.error('[autoindex] 回调出错:', url, err);
			}
		});
	};
	el.onerror = function () {
		console.error('[autoindex] 资源加载失败:', url);
		scriptQueue[url] = null;
	};
	document.head.appendChild(el);
}

function loadStyleOnce(url) {
	if (document.querySelector('link[data-dyn="' + url + '"]')) {
		return;
	}
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = url;
	link.setAttribute('data-dyn', url);
	document.head.appendChild(link);
}

function ensureFlowchart(callback) {
	loadScriptOnce(
		CDN.raphael,
		function () {
			return typeof Raphael !== 'undefined';
		},
		function () {
			loadScriptOnce(
				CDN.flowchart,
				function () {
					return typeof flowchart !== 'undefined';
				},
				callback,
			);
		},
	);
}

function ensureSequence(callback) {
	loadScriptOnce(
		CDN.snap,
		function () {
			return typeof Snap !== 'undefined';
		},
		function () {
			loadScriptOnce(
				CDN.underscore,
				function () {
					return typeof _ !== 'undefined';
				},
				function () {
					loadScriptOnce(
						CDN.sequence,
						function () {
							return typeof Diagram !== 'undefined';
						},
						callback,
					);
				},
			);
		},
	);
}

function ensureMermaid(callback) {
	loadScriptOnce(
		CDN.mermaid,
		function () {
			return typeof mermaid !== 'undefined';
		},
		callback,
	);
}

function ensureAPlayer(callback) {
	loadStyleOnce(CDN.aplayerCss);
	loadScriptOnce(
		CDN.aplayer,
		function () {
			return typeof APlayer !== 'undefined';
		},
		callback,
	);
}

/**
 * 挂件与正文无关：等主线程空闲再拉
 */
function initSakana() {
	const start = function () {
		loadScriptOnce(
			CDN.sakana,
			function () {
				return typeof Sakana !== 'undefined';
			},
			function () {
				try {
					Sakana.setMute(false);
					// 缩放必须交给 sakana 自己：它用 transform 做拖拽与惯性，
					// 外部再用 CSS transform 覆盖会直接破坏这套动画。
					const narrow = window.matchMedia('(max-width: 768px)').matches;
					Sakana.init({
						el: '.sakana-box',
						scale: narrow ? 0.34 : 0.5,
						// 官方默认值。旧代码的 0.0001 / 1 是“惯性极小 + 完全无阻尼”，
						// 会一直摆而停不下来，和参考站手感差很多
						inertia: 0.01,
						decay: 0.99,
						canSwitchCharacter: true,
					});
				} catch (err) {
					console.warn('[autoindex] sakana 初始化失败:', err);
				}
			},
		);
	};

	if ('requestIdleCallback' in window) {
		window.requestIdleCallback(start, { timeout: 2500 });
	} else {
		window.setTimeout(start, 1200);
	}
}

/**
 * 阅读进度条 + 回到顶部按钮
 */
function initScrollAssist() {
	const bar = document.getElementById('read-progress');
	const topBtn = document.getElementById('back-to-top');

	const onScroll = () => {
		const doc = document.documentElement;
		const max = doc.scrollHeight - window.innerHeight;
		const ratio = max > 0 ? window.pageYOffset / max : 0;

		if (bar) {
			bar.style.width = Math.min(100, Math.max(0, ratio * 100)) + '%';
		}
		if (topBtn) {
			topBtn.classList.toggle('is-visible', window.pageYOffset > 600);
		}
	};

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll);

	if (topBtn) {
		topBtn.addEventListener('click', function () {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	onScroll();
}

/**
 * 目录当前阅读项高亮
 * @param {Array} headings createMenu 解析出的标题列表
 */
function observeHeadings(headings) {
	if (!('IntersectionObserver' in window) || !headings || !headings.length) {
		return;
	}

	// 只收集菜单里挂在 #xxx 上的条目
	const items = new Map();
	Array.from(document.querySelectorAll('#left-drawer a[onclick]')).forEach(
		function (el) {
			const match = /menuSelect\('#([^']+)'\)/.exec(
				el.getAttribute('onclick') || '',
			);
			if (match) {
				items.set(match[1], el);
			}
		},
	);

	if (!items.size) {
		return;
	}

	const setActive = function (id) {
		items.forEach(function (el) {
			el.classList.remove('toc-active');
		});
		const current = items.get(id);
		if (current) {
			current.classList.add('toc-active');
		}
	};

	// 顶部留出固定顶栏的高度，底部排除大半屏，取“刚进入视口上方”的标题
	const io = new IntersectionObserver(
		function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					setActive(entry.target.id);
				}
			});
		},
		{ rootMargin: '-88px 0px -68% 0px', threshold: 0 },
	);

	headings.forEach(function (heading) {
		if (!heading.id) {
			return;
		}
		const el = document.getElementById(heading.id);
		if (el) {
			io.observe(el);
		}
	});
}

/**
 * 对列表信息进行转换
 * @param {*} raw
 */
function getInfo(raw) {
	// TODO 待优化 raw.data 可以显示得更漂亮
	//console.log(raw);

	raw = raw.textContent ? raw.textContent : raw.innerText;
	// 原为隐式全局变量 info，补声明
	const info = raw.replace(' ', '');

	// console.log(info);

	return info;
}

/**
 * 对列表名称获取其类型
 * @param {*} URL
 */
function getType(URL) {
	// console.log(fileName);
	if (/\/$/.test(URL)) {
		return 'folder';
	}
	// 原为隐式全局变量，补声明；无扩展名时 lastIndexOf 为 -1，substring 会返回整串
	const hasExt = URL.lastIndexOf('.') > URL.lastIndexOf('/');
	const fileExt = hasExt
		? URL.substring(URL.lastIndexOf('.') + 1).toLowerCase()
		: '';
	// TODO 配合 openItem 实现各类文件当前目录打开
	// 尤其是一些 媒体文件 比如 mp3
	// 原用 String.includes 判族，'p'/'k' 这类子串会误命中，改为精确匹配
	if (fileExt === 'apk') {
		return 'android';
	}
	if ('zip|7z|bz2|gz|tar|tgz|tbz2|xz|cab|rar|r00'.split('|').includes(fileExt)) {
		return 'archive';
	}
	if (
		'py|js|php|pl|rb|sh|bash|lua|sql|go|rs|java|c|h|cpp|cxx|hpp'
			.split('|')
			.includes(fileExt)
	) {
		// 原返回 "'code'"（多一层引号），图标名带引号渲染成文字
		return 'code';
	}
	if ('log|ini'.split('|').includes(fileExt)) {
		return 'text_file';
	}
	if ('jpg|png|bmp|gif|ico|webp'.split('|').includes(fileExt)) {
		return 'image';
	}
	if (
		'acc|ape|aiff|arm|flac|m4a|midi|mp3|ogg|wav|wma'.split('|').includes(fileExt)
	) {
		return 'music_note';
	}
	if ('flv|wmv|mp4|mkv|avi|vp9'.split('|').includes(fileExt)) {
		return 'movie';
	}
	return 'insert_drive_file';
}

/**
 * 播放音乐
 * @param {*} url 音乐路径
 * @param {*} name 音乐名称
 * @param {*} cover 音乐封面
 */
function startPlayMusic(url, name, cover) {
	// 播放器同样按需加载（仅带 <media> 的页面或点到音频文件时才需要）
	if (typeof APlayer === 'undefined') {
		ensureAPlayer(function () {
			startPlayMusic(url, name, cover);
		});
		return;
	}

	if (!name) {
		name = getName(url);
	}
	if (!cover) {
		cover = url.replace(/[^/]+$/, '') + coverName;
	}
	$$('#player-layout').show();
	$$('#player-open').hide();
	// TODO 不要重复初始化
	const musicPlayer = new APlayer({
		container: document.getElementById('aplayer'),
		theme: '#000000',
		// fixed: true,
		audio: [
			{
				name: name,
				url: url,
				cover: cover,
			},
		],
	});

	musicPlayer.play();

	$$('#player-layout').append(`
	<button id="player-close" class="mdui-btn mdui-btn-icon mdui-float-right">
		<i class="mdui-icon material-icons">
		close
		</i>
	</button>`);

	$$('#player-close').on('click', function (e) {
		musicPlayer.destroy();
		$$('#player-close').remove();
		// 只隐藏按钮不够：空容器仍在右上角拦截点击，音符图标就点不到了
		$$('#player-layout').hide();
		$$('#player-open').show();
	});
}

/**
 * 查看文本文件
 * @param {*} url 音乐路径
 */
function viewText(url) {
	// 编码 URL 参数，防止特殊字符报错
	const encodedFile = encodeURIComponent(url);

	// 构建完整的日志查看页面 URL
	const logReaderUrl = `/textReader.html?file=${encodedFile}`;

	// 在新标签页打开
	window.open(logReaderUrl, '_blank');
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
		return false;
	}
	if (dataType == 'text_file') {
		viewText(URL);
		return false;
	}
	return true;
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
		current.title =
			current.title.substring(0, 22) +
			'<br />' +
			current.title.substring(22);
	}
	if (current.href) {
		return (
			`<a class="mdui-list-item mdui-ripple" ` +
			`href="` +
			current.href +
			`" ` +
			`>` +
			current.title +
			`</a>`
		);
	} else {
		return (
			`<a class="mdui-list-item mdui-ripple" ` +
			`data-target="#` +
			current.id +
			`" ` +
			` onclick="menuSelect('#` +
			current.id +
			`');"` +
			`>` +
			current.title +
			`</a>`
		);
	}
}

/**
 * 目录 对象的点击跳转
 * @param {*} id 目录项ID
 */
function menuSelect(id) {
	// 手机/窄屏下先收起抽屉
	if (window.innerWidth <= 1024 && leftDrawer) {
		leftDrawer.close();
	}

	const target = document.getElementById(id.replace(/^#/, ''));

	// 用 replaceState 更新地址标锚点：可分享、不触发整页重载、不堆历史
	if (window.history && history.replaceState) {
		history.replaceState(null, '', location.pathname + location.search + id);
	}

	if (target) {
		// 顶栏高度随断点变化（桌面 64px、手机 56px），从 CSS 变量读，不写死
		const headerH =
			parseInt(
				getComputedStyle(document.documentElement).getPropertyValue(
					'--header-h',
				),
				10,
			) || 64;
		window.scrollTo({
			top:
				target.getBoundingClientRect().top +
				window.pageYOffset -
				(headerH + 20),
			behavior: 'smooth',
		});

		if ($$(target).length) {
			$$(target).addClass('markdown-selected');
			setTimeout(() => {
				$$(target).removeClass('markdown-selected');
			}, 3000);
		}
	} else {
		// 找不到目标（toC 与标题不同步等）时退回原生跳转
		location.hash = id;
	}
}

/**
 * MarkdownMenu 主方法
 * 读取 markdown 中的 H1-H6 生成目录
 */
function createMenu() {
	const headings = Array.from($$('#markDown')[0].childNodes)
		.filter((node) => /h[1-6]/i.test(node.tagName))
		.map((node) => ({
			href: node.childNodes[0].href,
			id: node.getAttribute('id'),
			level: parseInt(node.tagName.replace('H', ''), 10),
			title: node.innerText,
		}));

	// 逐级构建嵌套目录。
	// 原实现用 reduce + prev.level-- 递减前一个元素的 level，会污染后续比较，
	// 连续跳级时缩进层级错乱；改为单遍循环，跨级状态只保存在 prevLevel 里。
	let html = '<ul class="mdui-list">';
	let prevLevel = null;

	for (let i = 0; i < headings.length; i++) {
		const current = headings[i];

		if (prevLevel === null) {
			html += getLink(current);
		} else if (current.level > prevLevel) {
			for (let level = prevLevel; level < current.level; level++) {
				html += '<div class="mdui-list mdui-p-l-2">';
			}
			html += getLink(current);
		} else if (current.level < prevLevel) {
			for (let level = prevLevel; level > current.level; level--) {
				html += '</div>';
			}
			html += getLink(current);
		} else {
			html += getLink(current);
		}

		prevLevel = current.level;
	}

	html += '</ul>';

	$$('#left-drawer').append(html);
	leftDrawer = new mdui.Drawer('#left-drawer');

	// 阅读位置高亮
	observeHeadings(headings);
}

/**
 * AutoIndex 的主方法
 * 对 文件列表 进行操作
 */
function convertList() {
	let dataList = $$('pre').children();

	// console.log(dataList);
	// console.log(dataList.length);
	let nodes = $$('pre')[0].childNodes;

	for (let i = 0; i < dataList.length; i++) {
		let each = dataList[i];
		let eachURL = each.href;

		// let eachName = each.innerHTML
		let eachName = getName(eachURL);
		if (!eachName) {
			eachName = each.innerHTML;
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
			`);
			hasMarkdown = true;
		}

		let eachType = getType(eachURL);
		let eachInfo = nodes[i * 2 + 1];
		eachInfo = getInfo(eachInfo);

		if (i == 0) {
			$$('#back').attr('href', eachURL);
			continue;
		}

		const listItemDOM =
			`
			<a href="` +
			eachURL +
			`" onclick="return openItem(event,'` +
			eachURL +
			`');">
			<li class="mdui-list-item mdui-ripple">
				<i class="mdui-list-item-avatar mdui-color-grey-900 mdui-icon material-icons" >
					` +
			eachType +
			`
				</i>
				<div class="mdui-list-item-content mdui-p-x-2">
					<div class="mdui-list-item-title">
						` +
			eachName +
			`
					</div>
					<div class="mdui-list-item-text mdui-list-item-one-line">
						` +
			eachInfo +
			`
					</div>
				</div>
			</li>
			</a>
			`;
		$$('#theList').append(listItemDOM);
	}

	if (hasMarkdown) {
		// 在 DOM 加载完毕后会调用
		$$(function () {
			convertMarkDown();
		});
	}
}

function sanitize(str) {
	return str.replace(/&<"/g, function (m) {
		if (m === '&') return '&amp;';
		if (m === '<') return '&lt;';
		return '&quot;';
	});
}
/**
 * MarkDownReader 的主方法
 * 读取 markdown 文件并转换成 HTML
 */
function convertMarkDown() {
	let docURL = location.pathname.replace(/[^/]+$/, '') + markdownName;

	const renderer = new marked.Renderer();

	// 读取 markdown 中 image 的size
	renderer.image = function (src, title, alt) {
		const exec =
			/=\s*(\d*(?:px|em|ex|ch|rem|vw|vh|vmin|vmax|%))\s*,*\s*(\d*(?:px|em|ex|ch|rem|vw|vh|vmin|vmax|%))*\s*$/.exec(
				title,
			);
		let size = '';
		if (exec && exec[1]) size += ' height="' + exec[1] + '"';
		if (exec && exec[2]) size += ' width="' + exec[2] + '"';
		// 固定长文里的图片占了相当比例的请求与布局开销：延后加载 + 异步解码
		return (
			'<img src="' +
			sanitize(src) +
			'" alt="' +
			sanitize(alt) +
			'"' +
			size +
			' loading="lazy" decoding="async">'
		);
	};
	// 代码高亮
	// hljs 里的 shell 是「Shell Session」（只认 $ 提示符），不是 shell 脚本，
	// 而仓库里的 ```shell 都是脚本片段，映射到 bash 才有颜色。
	const HLJS_ALIAS = { shell: 'bash' };
	marked.setOptions({
		renderer: renderer,
		// 只对明确标注、且 hljs 认识的语言着色。未标语言时原样返回
		// （marked 会自行转义）—— 之前无条件用 highlightAuto，它会拿中文正文瞎猜：
		// 四段中文被猜成 makefile，行首「xxx:」当成 target，
		// 被套上 .hljs-section 就凭空变粗了。
		highlight: function (code, language) {
			if (!language) {
				return code;
			}
			const lang = HLJS_ALIAS[language] || language;
			if (hljs.getLanguage(lang)) {
				return hljs.highlight(code, { language: lang }).value;
			}
			return code;
		},
		pedantic: false,
		gfm: true,
		tables: true,
		breaks: false,
		sanitize: false,
		smartLists: true,
		smartypants: false,
		xhtml: false,
	});

	$$.ajax({
		url: docURL,
		success: function (data, textStatus, xhr) {
			// console.log(data);
			// console.log(marked(data));
			$$('#markDown').append(marked(data));

			// 首页与文章页的视觉区分（卡片列表只作用于首页）
			const isHome = markdownName.endsWith('/index.md');
			$$('body').toggleClass('home', isHome);
			$$('body').toggleClass('article', !isHome);

			convertFlow();
			convertSequence();
			convertMermaid();
			createMenu();
			initScrollAssist();
			observeHeadings();
			flashHashTarget();
			if (mode == 'AI') {
				$$('#drawer-title').text(markdownName);
				$$('#markdown-name').text(markdownName);
			} else {
				$$('#headerName').text(
					$$('#markDown').children().first().text(),
				);
				$$('#title').text($$('#markDown').children().first().text());
				addExtraHtml();
			}
		},
		error: function () {
			// md 文件不存在（?p= 拼错或文章被删）时给出提示，避免白屏
			$$('#markDown').html(
				'<p style="padding:24px 0;color:#ff8a80">文章加载失败：' +
					sanitize(markdownName) +
					'</p><p><a href="index.html">← 返回首页</a></p>',
			);
		},
	});
}

function addExtraHtml() {
	const copyRight = `
	<span style="color: darkcyan;">
	版权声明： 本博客所有文章除特别声明外，均采用 
	<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" rel="noopener" target="_blank">
		BY-NC-SA 4.0
	</a> 
	许可协议。转载请注明出处！
	</span>
	`;
	const pvHtml = `
	<span id="busuanzi_container_site_pv" class="pv-body">本站总访问量: <span id="busuanzi_value_site_pv"></span> 次</span>
	`;
	$$('#copyRight').append(copyRight);
	$$('#pv').append(pvHtml);

	// 自定义的 media 进行播放器初始化
	const medias = $$('media');
	if (medias.length > 0) {
		const mediaUrl = medias[0].attributes.src.value;
		// console.log(mediaUrl)
		$$('#player-open').attr(
			'onclick',
			`startPlayMusic('` + mediaUrl + `');`,
		);
		startPlayMusic(mediaUrl);
	}
}

/**
 * 读取 HTML 中的 flow 代码块转换成 svg 图
 */
function convertFlow() {
	// 读取 markdown 中的 flow 生成流程图
	let flowList = $$('code.language-flow');
	if (!flowList.length) {
		return;
	}

	// 图库不再随首屏加载：真正需要时才拉，就绪后重跑一次
	if (typeof flowchart === 'undefined') {
		ensureFlowchart(function () {
			convertFlow();
		});
		return;
	}

	for (let index = 0; index < flowList.length; index++) {
		let code = flowList[index].outerText;
		// console.log(code);

		if (!code) {
			continue;
		}
		try {
			let chart = flowchart.parse(code);
			// console.log(chart);

			flowList[index].innerHTML =
				"<div id='canvas-flow-" + index + "'></div>";

			chart.drawSVG('canvas-flow-' + index, {
				x: 0,
				y: 0,
				'line-width': 2,
				'line-length': 32,
				'text-margin': 8,
				'font-size': 14,
				fill: 'white',
				'yes-text': '是',
				'no-text': '否',
				// style symbol types
				symbols: {
					start: {
						'element-color': 'green',
					},
					condition: {
						'element-color': 'brown',
					},
					end: {
						'element-color': 'red',
					},
				},
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
	let mermaidList = $$('code.language-mermaid');
	if (!mermaidList.length) {
		return;
	}

	// mermaid 体积最大（~1MB），用到才拉
	if (typeof mermaid === 'undefined') {
		ensureMermaid(function () {
			convertMermaid();
		});
		return;
	}

	let config = {
		startOnLoad: true,
		flowchart: {
			useMaxWidth: false,
			htmlLabels: true,
		},
		sequence: {
			useMaxHeight: false,
		},
	};
	mermaid.initialize(config);

	// 读取 markdown 中的 mermaid 生成各种图
	for (let index = 0; index < mermaidList.length; index++) {
		let code = mermaidList[index].outerText;
		if (!code) {
			continue;
		}
		try {
			let svg = mermaid.render('mermaid_' + index, code);
			mermaidList[index].innerHTML = svg;
		} catch (error) {
			console.log(error);
		}
	}
}

/**
 * 读取 HTML 中的 sequence 代码块转换成 svg 图
 */
function convertSequence() {
	let sequenceList = $$('code.language-sequence');
	if (!sequenceList.length) {
		return;
	}

	// 同 convertFlow：图库按需加载
	if (typeof Diagram === 'undefined' || typeof Snap === 'undefined') {
		ensureSequence(function () {
			convertSequence();
		});
		return;
	}

	// 读取 markdown 中的 sequence 生成流程图
	for (let index = 0; index < sequenceList.length; index++) {
		let code = sequenceList[index].outerText;
		if (!code) {
			continue;
		}
		try {
			let chart = Diagram.parse(code);
			sequenceList[index].innerHTML =
				"<div id='canvas-sequence-" + index + "'></div>";
			chart.drawSVG('canvas-sequence-' + index, {
				theme: 'simple',
			});
		} catch (error) {
			console.log(error);
		}
	}
}
