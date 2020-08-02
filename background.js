console.log("Nuls Chrome Background Plugin");
// const nuls = window.nulsjs('nuls-sdk-js');

// var arrinfo = nuls.newAddress(2, "", "");
// console.log(arrinfo);

var baseurl = "http://beta.api.nuls.io";
var clienturl = "http://beta.api.nuls.io/jsonrpc";
var publicurl = 'http://beta.public1.nuls.io/jsonrpc';


chrome.runtime.onMessage.addListener(function(request) {
	if (request.type === 'requestAccess' || request.type === 'switchAccount') {
		chrome.tabs.create({ url: chrome.extension.getURL('/activities/permission.html'), active: false }, function (tab) {
			var invokable = {'url': request.url, 'type': request.type, 'status': false};
			chrome.storage.local.set({'invokable': invokable});
			chrome.windows.create({
				tabId: tab.id, type: 'popup', focused: true,
				height: 500, width: 330, left: (screen.width / 4) + (screen.width / 2), top: 70
			});
		});
	}
});

function allowsite(domain, address) {
	var newsite = {
		'domain': domain,
		'address': address
	};
	chrome.storage.local.get('allowedsite', function(bucket){
		var sites = "";
		if(bucket.allowedsite){
			var allowedsites = Object.keys(bucket.allowedsite).length;
			sites = bucket.allowedsite;
			for(var i = 0; allowedsites > i; i++) {
				if (sites[i]['domain'] === domain) {
					sites.splice(i, 1);
				}
			}
		}else{
			sites = [];
		}
		sites.push(newsite);
		chrome.storage.local.set({'allowedsite': sites}, function () {
			console.log("Domain Saved");
		});
	});
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
	console.log("Changes Detected --> "+JSON.stringify(changes));
});

chrome.runtime.onConnect.addListener(portConnected);

function portConnected(port){
	if(port.name === 'bridge_channel') {
		port.onMessage.addListener(async function (m) {
			console.log("In background script, received message from content script");
			console.log(JSON.stringify(m));
			if(m.type === 'getBalance'){
				let output = await getAccountBalance(2, 2, 1, m.data);
				port.postMessage({type: "getBalance", data: output});
			}else if(m.type === 'getTokenBalance'){
				let output = await getTokenBalance(m.data.address, m.data.contract);
				current_date = new Date();
				cms = current_date.getMilliseconds();
				console.log("sending.."+cms);
				port.postMessage({type: m.type, data: output});
			}else if(m.type === 'contractWrite'){
				if(hasAllProperties(m.data,["contractAddress", "methodName", "value", "args", "sender"])) {
					chrome.tabs.create({
						url: chrome.extension.getURL('/activities/transaction.html'),
						active: false
					}, function (tab) {
						var txwaitroom = {'url': m.orgin, 'data': m.data, 'success': false, 'task': false};
						chrome.storage.local.set({'txwaitroom': txwaitroom});
						chrome.windows.create({
							tabId: tab.id, type: 'popup', focused: true,
							height: 520, width: 330, left: (screen.width / 4) + (screen.width / 2), top: 70
						});
					});
				}else{
					port.postMessage({type: m.type, status: true, data: "Invalid Inputs"});
				}

			}
		});
	}
}

function hasAllProperties(obj, props) {
	for (var i = 0; i < props.length; i++) {
		if (!obj.hasOwnProperty(props[i]))
			return false;
	}
	return true;
}
