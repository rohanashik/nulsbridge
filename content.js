var manifestData = chrome.runtime.getManifest();

var version = manifestData.version;

console.log(
	`%c NULS Bridge %c Version ${version} %c`,
	'background:#3b3b3b ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
	'background:#7DB43D ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff',
	'background:transparent'
);

var targetOrgin = location.origin;

function injectScript(file, node) {
	try {
		const container = document.head || document.documentElement
		const scriptTag = document.createElement('script')
		scriptTag.setAttribute('async', 'false')
		scriptTag.setAttribute('src', file);
		container.insertBefore(scriptTag, container.children[0])
		container.removeChild(scriptTag)
	} catch (e) {
		console.error('NULS Bridge provider injection failed.', e)
	}
}

injectScript(chrome.extension.getURL('bridge.js'), 'body');


var port_bridge = chrome.runtime.connect({name:"bridge_channel"});

window.addEventListener("message", function(e) {
	var targetOrgin = location.origin;
	if (e.source !== window) return;
	if (e.origin !== targetOrgin) return;

	var data = JSON.parse(JSON.stringify(e.data));

	if (data.method && (data.method === "Authorization")) {
		chrome.storage.local.get('allowedsite', function(bucket) {
			var isallowed = false;
			if(bucket.allowedsite){
				var allowedsite = Object.keys(bucket['allowedsite']).length;
				for (var i = 0; allowedsite > i; i++) {
					if(bucket['allowedsite'][i]['domain'] === targetOrgin){
						isallowed = true;
					}
				}
			}
			if(isallowed){
				e.source.postMessage({'type': data.method, 'status': isallowed}, e.origin);
			}else{
				chrome.runtime.sendMessage({type:'requestAccess', url: targetOrgin});

			}
		});
	}else if (data.method && (data.method === "switchAccount")) {
		chrome.runtime.sendMessage({type:'switchAccount', url: targetOrgin});
		chrome.storage.onChanged.addListener(function(changes, namespace) {
			if(changes.allowedsite && changes.allowedsite.newValue) {
				allowedsitelist = changes.allowedsite.newValue;
				for (var i = 0; Object.keys(allowedsitelist).length > i; i++) {
					if (allowedsitelist[i]['domain'] === targetOrgin) {
						// console.log("Founded at ->" + i);
						// console.log("Switch Success!");
						e.source.postMessage({
							'type': data.method,
							'status': true,
							'address': allowedsitelist[i]['address']
						}, e.origin);
					}
				}
			}
		});
	}else if (data.method && (data.method === "Deauthorization")) {
		chrome.storage.local.get('allowedsite', function(bucket) {
			if(bucket.allowedsite){
				var result_code = "not_available";
				allowedsitelist = bucket.allowedsite;
				var allowedsites = Object.keys(allowedsitelist).length;
				// console.log("Allowedsites --> "+allowedsites);
				for(var i = 0; allowedsites > i; i++) {
					if (allowedsitelist[i]['domain'] === targetOrgin) {
						allowedsitelist.splice(i, 1);
						chrome.storage.local.set({'allowedsite': allowedsitelist});
						result_code = "site_removed";
					}
				}
				e.source.postMessage({'type':'Deauthorization', 'status': true, 'result_code': result_code}, e.origin);
			}
		});
	}else if (data.method && (data.method === "isConnected")) {
		chrome.storage.local.get('allowedsite', function(bucket) {
			var isallowed = false;
			if(bucket.allowedsite){
				var allowedsite = Object.keys(bucket['allowedsite']).length;
				for (var i = 0; allowedsite > i; i++) {
					if(bucket['allowedsite'][i]['domain'] === targetOrgin){
						isallowed = true;
					}
				}
			}else{
				isallowed = false;
			}
			// console.log(isallowed);
			e.source.postMessage({'type': 'isConnected', 'status': true, 'result': isallowed}, e.origin);
		});
	} else if (data.method && (data.method === "getAccountsList")) {
		chrome.storage.local.get('accounts', function(bucket) {
			var accounts = Object.keys(bucket['accounts']['list']).length;
			// for(var i=0; accounts > i; i++){
			// 	console.log(bucket.accounts['list'][i]['address']);
			// 	var adrs = bucket.accounts['list'][i]['address'];
			//
			// }
			e.source.postMessage({'type':'getAccountsList', 'status': bucket['accounts']['list'][0]}, e.origin);
		});

	} else if (data.method && (data.method === "getDefaultWallet")) {
		chrome.storage.local.get('allowedsite', function(bucket) {
			var address = "";
			if (bucket.allowedsite) {
				var allowedsite = Object.keys(bucket['allowedsite']).length;
				for (var i = 0; allowedsite > i; i++) {
					if (bucket['allowedsite'][i]['domain'] === targetOrgin) {
						var wallet = {
							'address': address = bucket['allowedsite'][i]['address'],
							'chain_id': address = bucket['allowedsite'][i]['chain_id']
						}
					}
				}
			}
			e.source.postMessage({'type':data.method, 'status': true, 'result': wallet}, e.origin);
		});
	}else if (data.method &&
		(data.method === "getBalance"
			|| data.method === "getTokenBalance"
			|| data.method === "contractWrite"
			|| data.method === "contractCall"
		)) {
		port_bridge.postMessage({type: data.method, data: data.params, orgin: targetOrgin});
	}


});

chrome.storage.onChanged.addListener(function(changes, namespace) {
	if(changes.allowedsite && changes.allowedsite.newValue) {
		allowedsitelist = changes.allowedsite.newValue;
		for (let i = 0; Object.keys(allowedsitelist).length > i; i++) {
			if (allowedsitelist[i]['domain'] === targetOrgin) {
				// console.log("Founded at ->" + i);
				// console.log("Invoke Success!");
				window.postMessage({
					'type': 'Authorization',
					'status': true,
					'address': allowedsitelist[i]['address']
				}, targetOrgin);

			}
		}
	}else if(changes.txwaitroom && changes.txwaitroom.newValue) {
		txwaitroom = changes.txwaitroom.newValue;
		if (txwaitroom['task']) {
			// console.log("Transaction Success!");
			window.postMessage({
				'type': 'contractWrite',
				'status': true,
				'result': txwaitroom['result']
			}, targetOrgin);
		}
	}
});

port_bridge.onMessage.addListener(function (m) {
	// console.log("In content script, received message from background script: ");
	// current_date = new Date();
	// cms = current_date.getMilliseconds();
	// console.log("received at " + targetOrgin + " - " + cms + " -->" + JSON.stringify(m));
	if (m.type === 'getBalance') {
		window.postMessage({'type': 'getBalance', 'status': true, 'result': m.data}, targetOrgin);
	} else if (m.type === 'getTokenBalance') {
		window.postMessage({'type': 'getTokenBalance', 'status': true, 'result': m.data}, targetOrgin);
	} else if (m.type === 'contractWrite') {
		window.postMessage({'type': 'contractWrite', 'status': m.status, 'result': m.data}, targetOrgin);
	} else if (m.type === 'contractCall') {
		window.postMessage({'type': 'contractCall', 'status': m.status, 'result': m.data}, targetOrgin);
	}
});