$(function(){

	const nuls = window.nulsjs('nuls-sdk-js');


	// GETTING STARTED
	$('#newaccounttype').on('change', function (e) {
		var optionSelected = $("option:selected", this);
		var valueSelected = this.value;
		console.log(valueSelected);
		clear_gts_views();
		if(valueSelected === "new_account"){
			$('#gs_view_createaccount').show();
		}else if(valueSelected === "private_key"){
			$('#gs_view_importpkey').show();
		}else if(valueSelected === "keystore"){
			$('#gs_view_keystore').show();
		}else if(valueSelected === "scan"){
			$('#gs_view_keystore').show();
		}

	});
	// GETTING STARTED

	$('#btn_privatekey').on('click', function () {
		var error = document.getElementById("import_error");
		var error_msg = document.getElementById("import_error_message");
		var import_pri = document.getElementById("import_pri").value;
		var import_newpass = document.getElementById("import_newpass").value;
		var import_confirmpass = document.getElementById("import_confirmpass").value;
		var network = document.getElementById("myonoffswitch").checked;
		error.style.display = "none";
		if(import_newpass !== import_confirmpass){
			error.style.display = "block";
			error_msg.innerText = "Mismatch Passwords!"
		}else if(!validatePassword(import_confirmpass)){
			error.style.display = "block";
			error_msg.innerText = "8-20 alphanumeric password Required!";
		}else if(import_newpass === import_confirmpass && validatePassword(import_confirmpass)){
			document.getElementById("mainlogo").src = "/assets/loader.gif";
			var chainid = 2;
			if(network){chainid = 1;}
			var importaddress = nuls.importByKey(chainid, import_pri, import_confirmpass, "");
			var account = {
				'address': importaddress.address,
				'encryptedPrivateKey': importaddress.aesPri,
				'pubKey': importaddress.pub,
				'chain_id': chainid
			};
			chrome.storage.local.get('accounts', function(bucket){
				var existAccount = false;
				var accounts = "";
				if(bucket.accounts){
					accounts = bucket.accounts;
					var accountslen = Object.keys(bucket['accounts']['list']).length;
					for (var i = 0; accountslen > i; i++) {
						if (bucket.accounts['list'][i]['address'] === account.address) {
							existAccount = true;
						}
					}
				}else{
					accounts = {"list":[]};
				}
				if (!existAccount) {
					accounts['list'].push(account);
					chrome.storage.local.set({'accounts': accounts});
					chrome.storage.local.set({'current': account});
					chrome.storage.local.set({'loggedin': true}, function () {
						window.location.href = "/activities/index.html";
					});
				} else {
					error.style.display = "block";
					error_msg.innerText = "Account Already Exists!";
					document.getElementById("mainlogo").src = "/assets/nuls.png";
				}


			});
		}
	});

	$('#btn_createaccount').on('click', function () {
		var error = document.getElementById("createaccount_error");
		var error_msg = document.getElementById("createaccount_error_message");
		var pass = document.getElementById("createaccount_newpass").value;
		var conpass = document.getElementById("createaccount_confirmpass").value;
		var network = document.getElementById("myonoffswitch").checked;
		error.style.display = "none";
		if(pass !== conpass){
			error.style.display = "block";
			error_msg.innerText = "Mismatch Passwords!"
		}else if(!validatePassword(pass)){
			error.style.display = "block";
			error_msg.innerText = "8-20 alphanumeric password Required!";
		}else if(pass === conpass && validatePassword(pass)){
			document.getElementById("mainlogo").src = "/assets/loader.gif";
			var chainid = 2;
			if(network){
				chainid = 1;
			}
			var newAddress = nuls.newAddress(chainid, pass, "");
			// console.log("New Account Created: "+newAddress);
			// console.log("New Account Created: "+JSON.stringify(newAddress));
			// console.log("New Account AES: "+newAddress.aesPri);
			// console.log("New Account Address: "+newAddress.pub);
			var account = {
				'address': newAddress.address,
				'encryptedPrivateKey': newAddress.aesPri,
				'pubKey': newAddress.pub,
				'chain_id': chainid
			};
			chrome.storage.local.get('accounts', function(bucket){
				var accounts = "";
				if(bucket.accounts){
					accounts = bucket.accounts;
				}else{
					accounts = {"list":[]};
				}
				accounts['list'].push(account);
				chrome.storage.local.set({'accounts': accounts});
				chrome.storage.local.set({'current': account});
				chrome.storage.local.set({'loggedin': true}, function () {
					window.location.href = "/activities/index.html";
				});
			});
		}
	});

	$('#upload_keystore').on('click', function () {
		console.log("Selected");
		$('#upload_keystore_file').click();
	});

	$('#btn_keystore').on('click', function () {
		var keystore_pass = document.getElementById("keystore_pass").value;
		var network = document.getElementById("myonoffswitch").checked;
		$('#keystore_error').hide();
		var reader = new FileReader();
		reader.onload = function (event) {
			var keystore = JSON.parse(event.target.result);
			console.log(keystore.encryptedPrivateKey);
			var chainid = 2;
			if(network){
				chainid = 1;
			}
			var privatekey = nuls.decrypteOfAES(keystore.encryptedPrivateKey, keystore_pass);
			var account = nuls.importByKey(chainid, privatekey, keystore_pass, "");
			console.log( JSON.stringify(account) +"  "+ keystore.address);
			if (account.address === keystore.address) {
				var newaccount = {
					'address': account.address,
					'encryptedPrivateKey': account.aesPri,
					'pubKey': account.pub,
					'chain_id': chainid
				};
				chrome.storage.local.get('accounts', function(bucket){
					var existAccount = false;
					if(bucket.accounts) {
						myaccounts = bucket.accounts;
						var accounts = Object.keys(bucket['accounts']['list']).length;
						for (var i = 0; accounts > i; i++) {
							if (bucket.accounts['list'][i]['address'] === account.address) {
								existAccount = true;
							}
						}
					} else {
						myaccounts = {"list": []};
					}

					if (!existAccount) {
						myaccounts['list'].push(newaccount);
						chrome.storage.local.set({'accounts': myaccounts});
						chrome.storage.local.set({'current': newaccount});
						chrome.storage.local.set({'loggedin': true}, function () {
							window.location.href = "/activities/index.html";
						});
					} else {
						$('#keystore_error').show();
						$('#keystore_error_message').text("Account Already Exists!");
					}

					$('#change_success').show();
				});
			} else {
				$('#keystore_error').show();
				$('#keystore_error_message').text("Authentication Failed, Try again!");
			}
		};
		reader.readAsText($('#upload_keystore_file').prop('files')[0]);
	});

	$('#upload_keystore_file').on('change', function(e){
		var fileName = e.target.files[0].name;
		var reader = new FileReader();
		reader.onload = function(event) {
			try {
				var keystore = JSON.parse(event.target.result);
				console.log(keystore.encryptedPrivateKey);
				console.log(keystore.address);
				$('#keystore_pass_view').slideDown();
				$('#keystore_done').attr("src", "/assets/upload_done.png");
			}catch (e) {
				$('#keystore_done').attr("src", "/assets/upload_fail.png");

			}

		};
		reader.readAsText(event.target.files[0]);
	});



});

function onReaderLoad(event){
	console.log(event.target.result);
	var obj = JSON.parse(event.target.result);
}

function validatePassword(password) {
	var str = password;
	console.log(str.match(/[0-9]/g));
	console.log(str.match(/[^a-zA-Z\d]/g));
	console.log(str.length >= 8);
	console.log(str.length < 20);
	console.log(str.length);
	return !!(str.match(
		/[0-9]/g) && str.match(
		/[a-zA-Z]/g) && str.length >= 8 && str.length < 20);

}

function setchromevault(key, data) {
	chrome.storage.local.set({key: data});
}

function clear_gts_views() {
	document.getElementById("gs_view_createaccount").style.display = "none";
	document.getElementById("gs_view_importpkey").style.display = "none";
	document.getElementById("gs_view_keystore").style.display = "none";
}