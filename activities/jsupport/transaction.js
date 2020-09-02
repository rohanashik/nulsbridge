$(function () {

    var contractCall = {};
    chrome.storage.local.get('txwaitroom', async function (bucket) {
        if (bucket.txwaitroom) {
            $('#invokedDomain').text(bucket.txwaitroom.url);
            $('#method_name').text(bucket.txwaitroom.data.methodName);
        }
        var txroom = bucket.txwaitroom.data;
        var adrs = "";
        chrome.storage.local.get('accounts', async function (buckt) {
            var accounts = Object.keys(buckt['accounts']['list']).length;
            for (var i = 0; accounts > i; i++) {
                if (buckt.accounts['list'][i]['address'] === bucket.txwaitroom.data.sender) {
                    var adrs = buckt.accounts['list'][i]['address'];
                    $('#sender_address').text(adrs);
                    $('#selectedAccount').val(adrs);
                    gasCalculator(txroom.chainid, txroom.contractAddress, txroom.methodName, txroom.value, adrs, txroom.args, function (gasresult) {
                        console.log(gasresult);
                        $('#tx_fee').text(gasresult + " NULS");
                    });
                }
            }
        });

        contractCall = {
            chainId: txroom.chainid,
            sender: adrs,
            contractAddress: txroom.contractAddress,
            value: txroom.value, //
            methodName: txroom.methodName,
            methodDesc: "",
            args: txroom.args
        };

    });

    $("#tx_cancel").on('click', function () {
        chrome.storage.local.get('txwaitroom', function (bucket) {
            if (bucket.txwaitroom) {
                let txwaitroom = bucket.txwaitroom;
                txwaitroom.status = false;
                txwaitroom.task = true;
                txwaitroom.result = "tx_cancelled";
                chrome.storage.local.set({'txwaitroom': txwaitroom});
                window.close();
            }
        });
    });

    $("#close_window").on('click', function () {
        window.close();
    });


    $("#tx_confirm").on('click', function () {
        console.log("Clicked tx_confirm");
        var wallet_pass = document.getElementById("tx_pass").value;
        var selectedAccount = document.getElementById("selectedAccount").value;

        $('#auth_error').hide();
        chrome.storage.local.get('accounts', async function (bucket) {
            var accounts = Object.keys(bucket['accounts']['list']).length;
            for (var i = 0; accounts > i; i++) {
                if (bucket.accounts['list'][i]['address'] === selectedAccount) {
                    var chain_id = bucket.accounts['list'][i]['chain_id'];
                    document.getElementById("trns_ico").src = "/assets/loaderw.gif";
                    document.getElementById("trns_txt").innerText = "PROCESSING...";
                    var privatekey = nuls.decrypteOfAES(bucket.accounts['list'][i]['encryptedPrivateKey'], wallet_pass);
                    var account = nuls.importByKey(chain_id, privatekey, wallet_pass, "");
                    if (account.address === selectedAccount) {
                        console.log("Success");
                        chrome.storage.local.set({'txwaitroom': {}});
                        var assetsChainId = chain_id;
                        var response = await getAccountBalance(chain_id, assetsChainId, 1, account.address);
                        var balance = response.result;
                        try {
                            // console.log("Printing Records --> "+privatekey+" "+account.pub+" "+account.address+" "+assetsChainId+" "+contractCall+" "+balance)
                            await callContract(privatekey, account.pub, account.address, assetsChainId, 1, contractCall, balance, '', function (status, response) {
                                console.log(response);
                                if(status) {
                                    $('#view_tx_home').hide();
                                    $('#view_tx_success').show();
                                    $('#txhash').val(response);
                                    $('#txchain').val(chain_id);
                                }else{
                                    $('#auth_error_message').text(response);
                                    $('#auth_error').show();
                                    document.getElementById("trns_ico").src = "/assets/forward.png";
                                    document.getElementById("trns_txt").innerText = "CONFIRM";
                                }
                                chrome.storage.local.get('txwaitroom', function (bucket) {
                                    if (bucket.txwaitroom) {
                                        let txwaitroom = bucket.txwaitroom;
                                        txwaitroom.task = true;
                                        txwaitroom.success = status;
                                        txwaitroom.result = response;
                                        chrome.storage.local.set({'txwaitroom': txwaitroom});
                                    }
                                });
                            });
                        } catch(e) {
                            console.log(e);
                            chrome.storage.local.get('txwaitroom', function (bucket) {
                                if (bucket.txwaitroom) {
                                    let txwaitroom = bucket.txwaitroom;
                                    txwaitroom.task = true;
                                    txwaitroom.status = false;
                                    txwaitroom.result = e;
                                    chrome.storage.local.set({'txwaitroom': txwaitroom});
                                }
                            });
                        }
                    } else {
                        document.getElementById("trns_ico").src = "/assets/forward.png";
                        document.getElementById("trns_txt").innerText = "CONFIRM";
                        $('#auth_error').show();
                        $('#auth_error_message').text("Password Wrong!");
                    }
                }
            }
        });
    });


    $('#openscan').on('click', function (e) {
        var txhash = document.getElementById("txhash").value;
        var txchain = document.getElementById("txchain").value;
        var url = "http://beta.nulscan.io/transaction/info?hash="+txhash;
        if(parseInt(txchain) === 1){
            url = "https://nulscan.io/transaction/info?hash="+txhash;
        }
        chrome.tabs.create({url:url, active: true});
        return false;
    });

});