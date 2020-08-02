
$(function() {

    chrome.storage.local.get('accounts', function(bucket) {
        var dropdown = document.getElementById('wallet_list_container');
        var accounts = Object.keys(bucket['accounts']['list']).length;
        console.log(accounts);
        for(var i=0; accounts > i; i++){
            // console.log(bucket.accounts['list'][i]['address']);
            var adrs = bucket.accounts['list'][i]['address'];
            dropdown.innerHTML +=
                '<div class="wallet_list" id="select_wallet" data-address="'+adrs+'">' +
                '<table width="100%">' +
                '<tr>' +
                '<td><p>'+ addresstrim(adrs)+'</p></td>' +
                '<td class="align-right"><img src="/assets/extend.png" width="8"></td>' +
                '</tr>' +
                '</table>' +
                '</div>';
        }
    });

    $(document.body).on('click', '.wallet_list' ,function(){
        var address = $(this).data('address');
        chrome.storage.local.get('accounts', function(bucket) {
            var accounts = Object.keys(bucket['accounts']['list']).length;
            for(var i = 0; accounts > i; i++) {
                if(bucket.accounts['list'][i]['address'] === address) {
                    console.log((bucket.accounts['list'][i]));
                    var selected_account = bucket.accounts['list'][i];
                    // console.log(selected_account);
                    chrome.storage.local.set({'current': selected_account});
                    window.location.href = "/activities/editwallet.html";
                }
            }
        });
    });



});