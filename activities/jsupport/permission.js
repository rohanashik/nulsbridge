
$(function() {

    chrome.storage.local.get('invokable', function(bucket) {
        if(bucket.invokable.type === 'switchAccount'){
            console.log("Switch Account Page");
            document.getElementById("permission_title").innerHTML="Bridge Connection<br>Account Switch";
            document.getElementById("permission_desc").innerHTML="Select Account to Switch";
        }
        $('#invokedDomain').text(bucket.invokable.url);
        $('#invokedDomain2').text(bucket.invokable.url);
        $('#invokingDomain').val(bucket.invokable.url);
    });


    chrome.storage.local.get('accounts', function(bucket) {
        var myDropdown = document.getElementById('selectAccount');
        var accounts = Object.keys(bucket['accounts']['list']).length;
        for(var i=0; accounts > i; i++){
            var adrs = bucket.accounts['list'][i]['address'];
            myDropdown.innerHTML += '<option value="'+adrs+'">'+addresstrim(adrs)+'</option>';
        }
    });


    $("#close_window").on('click', function () {
        window.close();
    });

    $("#invoke_confirm").on('click', function () {
        var invoking_pass = document.getElementById("invoking_pass").value;
        var e = document.getElementById("selectAccount");
        var selectedAccount = e.options[e.selectedIndex].value;
        console.log(invoking_pass+selectedAccount);
        $('#auth_error').hide();
        chrome.storage.local.get('accounts', function(bucket) {
            var accounts = Object.keys(bucket['accounts']['list']).length;
            for (var i = 0; accounts > i; i++) {
                if (bucket.accounts['list'][i]['address'] === selectedAccount){
                    var privatekey = nuls.decrypteOfAES(bucket.accounts['list'][i]['encryptedPrivateKey'], invoking_pass);
                    var account = nuls.importByKey(2, privatekey, invoking_pass, "");
                    if (account.address === selectedAccount) {
                        console.log("Success");
                        $('#view_invoke_home').hide();
                        // var invokable = {'url': document.getElementById("invokingDomain").value, 'status': true};
                        chrome.storage.local.set({'invokable': {}});
                        chrome.runtime.getBackgroundPage(function(bgWindow) {
                            bgWindow.allowsite(document.getElementById("invokingDomain").value, selectedAccount);
                        });
                        $('#view_invoke_success').show();
                    }else{
                        $('#auth_error').show();
                    }
                }
            }
        });


    });

});