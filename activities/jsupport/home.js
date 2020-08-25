$(function() {


    // function getAcceptLanguages() {
    //     chrome.i18n.getAcceptLanguages(function(languageList) {
    //         var languages = languageList.join(",");
    //         console.log(languages);
    //         console.log(chrome.i18n.getUILanguage());
    //     });
    // }

    chrome.storage.local.get('current', async function(bucket) {
        if(bucket.current) {
            var current = bucket.current;
            document.getElementById("crnt_acc_address").innerText = addresstrim(current['address']);
            document.getElementById("fulladdress").value = current['address'];
            if(current['totalBalance']) {
                document.getElementById("coinbalance").innerText = (current['totalBalance'] / 100000000).toFixed(3);
            }
            loadOtherAssets(current);
            await updateFromBlockchain(current);
        }
    });

    async function updateFromBlockchain(current) {
        var balanceresult = await chrome.extension.getBackgroundPage().getAccountBalance(current['chain_id'], current['chain_id'], 1, current['address']);
        console.log(balanceresult)
        var balance = balanceresult.result.totalBalance;
        current.totalBalance = balance;
        document.getElementById("coinbalance").innerText = (balance / 100000000).toFixed(3);
        chrome.storage.local.set({'current': current});

        var tokenresult = await chrome.extension.getBackgroundPage().getTokensList(current['chain_id'], current['address']);
        var crossresult = await chrome.extension.getBackgroundPage().getCrossAssetsList(current['chain_id'], current['address']);

        currentTokens = {'address': current['address'], 'list':[]};
        currentCross = {'address': current['address'], 'list':[]};
        var tokenslength = Object.keys(tokenresult['result']['list']).length;
        var crosslength = Object.keys(crossresult['result']).length;

        if (tokenslength > 0) {
            for (var i = 0; tokenslength > i; i++) {
                if (tokenresult['result']['list'][i]['status'] !== 3) {
                    currentTokens['list'].push({
                        'name': tokenresult['result']['list'][i]['tokenName'],
                        'symbol': tokenresult['result']['list'][i]['tokenSymbol'],
                        'contractAddress': tokenresult['result']['list'][i]['contractAddress'],
                        'balance': tokenresult['result']['list'][i]['balance'],
                        'decimals': tokenresult['result']['list'][i]['decimals'],
                        'status': tokenresult['result']['list'][i]['status'],
                    });
                }
            }
        }

        if (crosslength > 0) {
            for (var j = 0; crosslength > j; j++) {
                currentCross['list'].push({
                    'assetKey': crossresult['result'][j]['assetKey'],
                    'chainId': crossresult['result'][j]['chainId'],
                    'assetId': crossresult['result'][j]['assetId'],
                    'symbol': crossresult['result'][j]['symbol'],
                    'balance': crossresult['result'][j]['balance'],
                    'decimals': crossresult['result'][j]['decimals'],
                });
            }
        }
        chrome.storage.local.set({'current_tokens': currentTokens});
        chrome.storage.local.set({'current_cross': currentCross});
        loadOtherAssets(current);
    }

    function loadOtherAssets(current) {

        chrome.storage.local.get('current_tokens', function (bucket) {
            if (bucket.current_tokens) {
                if (current['address'] === bucket.current_tokens['address']) {
                    $("#loader_token").hide();
                    var tokenslist = bucket.current_tokens;
                    var tokenslength = Object.keys(tokenslist['list']).length;
                    document.getElementById("tokenslist").innerHTML = "";

                    if (tokenslength > 0) {
                        for (var i = 0; tokenslength > i; i++) {
                            if (tokenslist['list'][i]['status'] !== 3) {
                                document.getElementById("tokenslist").innerHTML +=
                                    '<table class="token_list asset_send pointer" cellpadding="10" id="' + tokenslist['list'][i]['symbol'] + '">' +
                                    '<tr>' +
                                    '<td>' + tokenslist['list'][i]['symbol'] + '</td>' +
                                    '<td class="align-right">' + tokenslist['list'][i]['balance'] / decimalConvertor(tokenslist['list'][i]['decimals']) + '</td>' +
                                    '<td width="1%">' +
                                    '<img src="/assets/extend.png" class="btn_ico" width="7px"></td>' +
                                    '</tr>' +
                                    '</table>';
                            }
                        }
                    } else {
                        document.getElementById("tokenslist").innerHTML = '<p class="phead op5">No Tokens Available</p>'
                    }
                }
            }
        })

        chrome.storage.local.get('current_cross', function (bucket) {
            if (bucket.current_cross) {
                if (current['address'] === bucket.current_cross['address']) {
                    $("#loader_crosschain").hide();
                    var crosslist = bucket.current_cross;
                    var crosslength = Object.keys(crosslist['list']).length;
                    document.getElementById("crosschainlist").innerHTML = "";

                    if (crosslength > 0) {
                        for (var j = 0; crosslength > j; j++) {
                            document.getElementById("crosschainlist").innerHTML +=
                                '<table class="token_list asset_send pointer" cellpadding="10" id="' + crosslist['list'][j]['symbol'] + '">' +
                                '<tr>' +
                                '<td>' + crosslist['list'][j]['symbol'] + '</td>' +
                                '<td class="align-right">' + crosslist['list'][j]['balance'] / decimalConvertor(crosslist['list'][j]['decimals']) + '</td>' +
                                '<td width="1%">' +
                                '<img src="/assets/extend.png" class="btn_ico" width="7px"></td>' +
                                '</tr>' +
                                '</table>';
                        }
                    } else {
                        document.getElementById("crosschainlist").innerHTML = '<p class="phead op5">No Cross Assets Available</p>'
                    }
                }
            }
        })

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
        // } else if (e.target.closest('.asset_send')) {
        //     // console.log("Asset Selected for sending");
        //     // console.log(e.target.id);
        //     var pagedata = {'request_code': "sendasset", 'data': e.target.id};
        //     chrome.storage.local.set({'pagedata': pagedata});
        //     window.location.href = "/activities/send.html";

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

    $("#assets_container").on('click', '.asset_send', function () {
        // console.log(this.id);
        var pagedata = {'request_code': "sendasset", 'data': this.id};
        chrome.storage.local.set({'pagedata': pagedata});
        window.location.href = "/activities/send.html";
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
                tooltip.innerHTML = chrome.i18n.getMessage("copied");
            })
            .catch(err => {
                var tooltip = document.getElementById("myTooltip");
                tooltip.innerHTML = chrome.i18n.getMessage("permissionDenied");
            });
    });
    $("#copyAddress").mouseout(function() {
        var message = chrome.i18n.getMessage("copyAddress");
        console.log("Mouse Out "+message);
        document.getElementById("myTooltip").innerHTML = message;
    });




});