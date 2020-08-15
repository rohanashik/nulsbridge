$(function() {


    // function getAcceptLanguages() {
    //     chrome.i18n.getAcceptLanguages(function(languageList) {
    //         var languages = languageList.join(",");
    //         console.log(languages);
    //         console.log(chrome.i18n.getUILanguage());
    //     });
    // }

    chrome.storage.local.get('current', function(bucket) {
        if(bucket.current) {
            var current = bucket.current;
            document.getElementById("crnt_acc_address").innerText = addresstrim(current['address']);
            document.getElementById("fulladdress").value = current['address'];
            if(current['totalBalance']) {
                document.getElementById("coinbalance").innerText = (current['totalBalance'] / 100000000).toFixed(3);
            }
            initiatplugin(current);
        }
    });

    async function initiatplugin(current) {
        var balanceresult = await chrome.extension.getBackgroundPage().getAccountBalance(current['chain_id'], current['chain_id'], 1, current['address']);
        console.log(balanceresult)
        var balance = balanceresult.result.totalBalance;
        current.totalBalance = balance;
        document.getElementById("coinbalance").innerText = (balance / 100000000).toFixed(3);
        chrome.storage.local.set({'current': current});

        var tokenresult = await chrome.extension.getBackgroundPage().getTokensList(current['chain_id'], current['address']);
        var crossresult = await chrome.extension.getBackgroundPage().getCrossAssetsList(current['chain_id'], current['address']);
        // console.log("Cross Assets ---> "+JSON.stringify(crossresult));
        console.log("Token Assets ---> "+JSON.stringify(tokenresult));

        document.getElementById("loader_token").style.display = "none";
        document.getElementById("loader_crosschain").style.display = "none";
        currentTokens = [];
        currentCross = [];
        var tokenslength = Object.keys(tokenresult['result']['list']).length;
        var crosslength = Object.keys(crossresult['result']).length;

        // console.log("Tokens ---> "+JSON.stringify(crossresult));
        // console.log("Total Tokens ---> "+tokenslength);
        // console.log("Total Cross Assets ---> "+crosslength);
        if (tokenslength > 0) {
            for (var i = 0; tokenslength > i; i++) {
                if(tokenresult['result']['list'][i]['status'] !== 3) {
                    currentTokens.push({
                        'name': tokenresult['result']['list'][i]['tokenName'],
                        'symbol': tokenresult['result']['list'][i]['tokenSymbol'],
                        'contractAddress': tokenresult['result']['list'][i]['contractAddress'],
                        'balance': tokenresult['result']['list'][i]['balance'],
                        'decimals': tokenresult['result']['list'][i]['decimals'],
                    });
                    document.getElementById("tokenslist").innerHTML +=
                        '<table class="token_list" width="100%" cellpadding="10">' +
                        '<tr>' +
                        '<td>' + tokenresult['result']['list'][i]['tokenName'] + '</td>' +
                        '<td class="align-right">' + tokenresult['result']['list'][i]['balance'] / decimalConvertor(tokenresult['result']['list'][i]['decimals']) + '</td>' +
                        '<td width="1%"><img src="/assets/extend.png" class="btn_ico" width="7px"></td>' +
                        '</tr>' +
                        '</table>';
                }
            }
        } else {
            document.getElementById("tokenslist").innerHTML = '<p class="phead op5">No Tokens Available</p>'
        }

        if (crosslength > 0) {
            for (var j = 0; crosslength > j; j++) {
                currentCross.push({
                    'assetKey': crossresult['result'][j]['assetKey'],
                    'chainId': crossresult['result'][j]['chainId'],
                    'assetId': crossresult['result'][j]['assetId'],
                    'symbol': crossresult['result'][j]['symbol'],
                    'balance': crossresult['result'][j]['balance'],
                    'decimals': crossresult['result'][j]['decimals'],
                });
                document.getElementById("crosschainlist").innerHTML +=
                    '<table class="token_list" width="100%" cellpadding="10">' +
                    '<tr>' +
                    '<td>' + crossresult['result'][j]['symbol'] + '</td>' +
                    '<td class="align-right">' + crossresult['result'][j]['balance'] / decimalConvertor(crossresult['result'][j]['decimals']) + '</td>' +
                    '<td width="1%"><img src="/assets/extend.png" class="btn_ico" width="7px"></td>' +
                    '</tr>' +
                    '</table>';
            }
        } else {
            document.getElementById("crosschainlist").innerHTML = '<p class="phead op5">No Cross Assets Available</p>'
        }

        console.log(currentTokens);
        chrome.storage.local.set({'current_tokens': currentTokens});

        console.log(currentCross);
        chrome.storage.local.set({'current_cross': currentCross});

    }

    chrome.storage.local.get('accounts', function(bucket) {
        var menuview_testnet = document.getElementById('menuview_testnet');
        var menuview_mainnet = document.getElementById('menuview_mainnet');
        var menuview_all = document.getElementById('menuview_all');
        var myDropdown = document.getElementById('myDropdown');
        var accounts = Object.keys(bucket['accounts']['list']).length;
        // console.log(JSON.stringify(bucket['accounts']['list']));
        for(var i=0; accounts > i; i++){
            // console.log(bucket.accounts['list'][i]['address']);
            var adrs = bucket.accounts['list'][i]['address'];
            if(bucket.accounts['list'][i]['chain_id'] === 1){
                $('#def_main_wallet').hide();
                menuview_mainnet.innerHTML += '<p class="navmenu" id="'+adrs+'">'+addresstrim(adrs)+'</p>';
            }else if(bucket.accounts['list'][i]['chain_id'] === 2){
                $('#def_test_wallet').hide();
                menuview_testnet.innerHTML += '<p class="navmenu" id="'+adrs+'">'+addresstrim(adrs)+'</p>';
            }
        }
        menuview_all.innerHTML += '<p class="navmenu" id="new_acc">Create/Import Wallet</p>';
        menuview_all.innerHTML += '<p class="navmenu" id="acc_manage">Manage Wallets</p>';
        menuview_all.innerHTML += '<p class="navmenu" id="settings">Settings</p>';
    });




    $(window).click(function (e) {
        if (e.target.matches('.navmenu')) {
            if(e.target.id === 'acc_manage'){
                window.location.href = "/activities/management.html";
            }else if(e.target.id === 'settings') {
                window.location.href = "/activities/settings.html";
            }else if(e.target.id === 'new_acc') {
                window.location.href = "/activities/gettingstarted.html";
            }else {
                var account = e.target.id;
                chrome.storage.local.get('accounts', function(bucket) {
                    var accounts = Object.keys(bucket['accounts']['list']).length;
                    for(var i = 0; accounts > i; i++) {
                        if(bucket.accounts['list'][i]['address'] === account) {
                            console.log((bucket.accounts['list'][i]));
                            var selected_account = bucket.accounts['list'][i];
                            // console.log(selected_account);
                            chrome.storage.local.set({'current': selected_account});
                            window.location.href = "/activities/home.html";
                        }
                    }
                });
            }
        } else if (!e.target.matches('.dropbtn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    });


    $('.assetsview').click(function() {
        console.log(this.id);
        if(this.id === 'crosschain'){
            console.log("crosschain");
            $('#list_crosschain').show();
            // $("#loader_crosschain").toggle( "slide", options, 500 );
            $('#list_token').hide();
            $('#crosschain').removeClass('op5');
            $('#tokens').addClass('op5');
        }else if(this.id === 'tokens'){
            console.log("tokens");
            $('#list_crosschain').hide();
            $('#list_token').show();
            // $("#loader_token").toggle( "slide", options, 500 );
            $('#tokens').removeClass('op5');
            $('#crosschain').addClass('op5');
        }
    });

    $("#buynuls").on('click', function () {
        var url = "https://www.binance.com/en/trade/NULS_BTC";
        chrome.tabs.create({url:url, active: true});
    });

    $("#copyAddress").on('click', function () {
        var copyText = document.getElementById('fulladdress').value;
        navigator.clipboard.writeText(copyText)
            .then(() => {
                var tooltip = document.getElementById("myTooltip");
                tooltip.innerHTML = chrome.i18n.getMessage("Copied");
            })
            .catch(err => {
                var tooltip = document.getElementById("myTooltip");
                tooltip.innerHTML = chrome.i18n.getMessage("Permission Denied");
            });
    });
    $("#copyAddress").mouseout(function() {
        document.getElementById("myTooltip").innerHTML = chrome.i18n.getMessage("Copy Address");
    });




});