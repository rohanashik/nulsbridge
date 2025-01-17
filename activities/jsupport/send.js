
$(function() {
    var dropdown = document.getElementById('assetlist');
    const nuls = window.nulsjs('nuls-sdk-js');
    var chain_id = 2;
    var defaultasset = "NULS";


    // var pagedata = {'request_code': "sendasset", 'data': e.target.id};
    // chrome.storage.local.set({'pagedata': pagedata});

    chrome.storage.local.get('pagedata', function(bucket) {
        if(bucket.pagedata) {
            if(bucket.pagedata['request_code'] === 'sendasset')
                defaultasset = bucket.pagedata['data'];
        }
    });


    chrome.storage.local.get('current', function(bucket) {
        if(bucket.current) {
            var current = bucket.current;
            document.getElementById("sender_address").innerText = current['address'];
            document.getElementById("rev_sender").innerText = current['address'];
            var balance = current['totalBalance']/100000000;
            chain_id = parseInt(current['chain_id']);
            dropdown.innerHTML += '<option value="2" data-assetschainid="'+chain_id+'" data-decimals="100000000" data-dcplace="8" data-type="coin" data-balance="'+balance+'">NULS</option>';
            document.getElementById("send_balance").innerText= balance + " NULS";
            document.getElementById("cryp_balance").value=balance;
            document.getElementById("cryp_sender").value=current['address'];
        }
    });

    chrome.storage.local.get('accounts', function(bucket) {
        var dropdown = document.getElementById('myDropdown');
        var accounts = Object.keys(bucket['accounts']['list']).length;
        console.log(accounts);
        for(var i=0; accounts > i; i++){
            // console.log(bucket.accounts['list'][i]['address']);
            var adrs = bucket.accounts['list'][i]['address'];
            dropdown.innerHTML += '<p class="navmenu" id="'+adrs+'">'+addresstrim(adrs)+'</p>';
        }
    });

    chrome.storage.local.get('current_tokens', function(bucket) {
        if (bucket['current_tokens']) {
            var tokens = Object.keys(bucket['current_tokens']['list']).length;
            for (var i = 0; tokens > i; i++) {
                var assetkey = bucket.current_tokens['list'][i]['key'];
                var symbol = bucket.current_tokens['list'][i]['symbol'];
                var contractAddress = bucket.current_tokens['list'][i]['contractAddress'];
                var dcplace = bucket.current_tokens['list'][i]['decimals'];
                var decimals = decimalConvertor(dcplace);
                var balance = bucket.current_tokens['list'][i]['balance'] / decimals;
                let flagit = "";
                if (defaultasset === assetkey)
                    flagit = "selected";
                dropdown.innerHTML += '<option value="' + contractAddress + '" data-assetschainid="' + chain_id + '" data-dcplace="' + dcplace + '" data-decimals="' + decimals + '" data-type="token" data-balance="' + balance + '" ' + flagit + '>' + symbol + '</option>';
            }
        }
    });

    chrome.storage.local.get('current_cross', function(bucket) {
        if (bucket['current_cross']) {
            var crossassets = Object.keys(bucket['current_cross']['list']).length;
            for (var i = 0; crossassets > i; i++) {
                var assetkey = bucket.current_cross['list'][i]['key'];
                var symbol = bucket.current_cross['list'][i]['symbol'];
                var chainId = bucket.current_cross['list'][i]['chainId'];
                var dcplace = bucket.current_cross['list'][i]['decimals'];
                var decimals = decimalConvertor(dcplace);
                var balance = bucket.current_cross['list'][i]['balance'] / decimals;
                let flagit = "";
                if (defaultasset === assetkey)
                    flagit = "selected";
                dropdown.innerHTML += '<option value="2" data-assetschainid="' + chainId + '" data-dcplace="' + dcplace + '" data-decimals="' + decimals + '" data-type="coin" data-balance="' + balance + '" ' + flagit + '>' + symbol + '</option>';
            }
        }

        assetSelected();
    });



    $('#transaction_review').on('click', async function (e) {
        var receiver = document.getElementById("cryp_receiver").value;
        var cryp_amount = document.getElementById("cryp_amount").value;
        var cryp_balance = document.getElementById("cryp_balance").value;
        var cryp_sender = document.getElementById("cryp_sender").value;
        var e = document.getElementById("assetlist");
        var assettype = e.options[e.selectedIndex];
        var transfertype = assettype.getAttribute('data-type');
        var decimals = assettype.getAttribute('data-decimals');
        var dcplace = assettype.getAttribute('data-dcplace');
        var transfer_error = document.getElementById("transfer_error");
        var transfer_error_message = document.getElementById("transfer_error_message");
        console.log(receiver.length);
        transfer_error.style.display = "none";
        $('#rev_fee').text("Calculating...");
        if(receiver.length < 30) {
            transfer_error.style.display = "block";
            transfer_error_message.innerText = "Receiver Address Invalid";
        }else if(!nuls.verifyAddress(receiver).right) {
            console.log("error address");
            transfer_error.style.display = "block";
            transfer_error_message.innerText = "Receiver Address Invalid";
        }else if(countDecimals(cryp_amount) > dcplace) {
            console.log("Amount Invalid, Decimals Allowed");
            transfer_error.style.display = "block";
            transfer_error_message.innerText = "Amount Invalid, Only "+dcplace+" Decimals Allowed";
        }else if(parseInt(cryp_amount) > parseInt(cryp_balance)) {
            console.log("balance high");
            transfer_error.style.display = "block";
            transfer_error_message.innerText = "Transfer amount is higher than available";
        }else{
            $('#rev_receiver').text(receiver);
            $('#rev_amount').text(cryp_amount+" "+assettype.text);
            if (transfertype === 'coin') {
                $('#rev_fee').text("0.001 NULS");
            }else {
                // feeCalculator(assettype.value, cryp_sender, receiver, cryp_amount, decimals, function (data) {
                //     $('#rev_fee').text(data/10000000 + "NULS");
                // });

                gasCalculator(chain_id, assettype.value, "transfer", 0, cryp_sender, [receiver, cryp_amount * decimals], function (gasresult) {
                    $('#rev_fee').text(gasresult + "NULS");
                })
            }
            $('#view_send_home').fadeIn();
            $('#view_send_home').slideUp();
            $('#view_send_review').slideDown();
        }
    });

    $('#openscan').on('click', function (e) {
        var txhash = document.getElementById("txhash").value;
        var url = "http://beta.nulscan.io/transaction/info?hash="+txhash;
        if (chain_id === 1)
            url = "https://nulscan.io/transaction/info?hash="+txhash;
        chrome.tabs.create({url:url, active: true});
        return false;
    });
    $('#close_send').on('click', function (e) {
        window.location.href = "/activities/home.html";
    });
    $('#transaction_cancel').on('click', function (e) {
        $('#view_send_review').fadeIn();
        $('#view_send_review').slideUp();
        $('#view_send_home').slideDown();
    });

    $('#transaction_confirm').on('click', function (e) {
        var receiver = document.getElementById("cryp_receiver").value;
        var cryp_amount = document.getElementById("cryp_amount").value;
        var cryp_balance = document.getElementById("cryp_balance").value;
        var send_pass = document.getElementById("send_pass").value;
        var send_error = document.getElementById("send_error");
        var send_error_message = document.getElementById("send_error_message");
        var e = document.getElementById("assetlist");
        var assettype = e.options[e.selectedIndex];

        var assetschainidn = assettype.getAttribute('data-assetschainid');
        var decimals = assettype.getAttribute('data-decimals');
        var transfertype = assettype.getAttribute('data-type');
        console.log(assetschainidn);


        send_error.style.display = "none";
        chrome.storage.local.get('current', async function(bucket) {
            if (bucket.current) {
                var current = bucket.current;
                console.log(JSON.stringify(current));
                var privatekey = nuls.decrypteOfAES(current.encryptedPrivateKey, send_pass);
                var account = nuls.importByKey(chain_id, privatekey, send_pass, "");
                if (account.address === current.address) {
                    document.getElementById("trns_ico").src = "/assets/loaderw.gif";
                    document.getElementById("trns_txt").innerText = "PROCESSING...";
                    var response = await chrome.extension.getBackgroundPage().getAccountBalance(chain_id, chain_id, 1, account.address);
                    var balance = response.result;
                    console.log("PublicKey"+account.pub);
                    console.log("privatekey"+privatekey);
                    console.log(JSON.stringify(balance));
                    var publicKey = account.pub;
                    sendTransaction(chain_id, transfertype, parseInt(assetschainidn), assettype.value, account.address, publicKey,  privatekey, receiver, cryp_amount, balance, decimals, function (status, response) {
                        if(status) {
                            $('#view_send_review').hide();
                            $('#view_send_success').show();
                            document.getElementById("txhash").value = response;
                        }else{
                            send_error.style.display = "block";
                            send_error_message.innerHTML="Transaction Failed";
                            document.getElementById("trns_ico").src = "/assets/send.png";
                            document.getElementById("trns_txt").innerText = "TRANSFER";
                        }
                    });
                }else{
                    send_error.style.display = "block";
                    send_error_message.innerHTML="Password Incorrect!";
                    document.getElementById("trns_ico").src = "/assets/send.png";
                    document.getElementById("trns_txt").innerText = "TRANSFER";
                }
            }
        });


    });

    $('#assetlist').on('change', function (e) {
       assetSelected();
    });


    function assetSelected() {

        var selected = $('#assetlist').find('option:selected');
        var balance = selected.data('balance');
        var decimals = selected.data('decimals');
        document.getElementById("cryp_balance").value=balance;
        document.getElementById("send_balance").innerText=balance +" "+ selected.text();
    }


});