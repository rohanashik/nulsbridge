
$(function() {
    const nuls = window.nulsjs('nuls-sdk-js');

    chrome.storage.local.get('current', function(bucket) {
        if(bucket.current) {
            var current = bucket.current;
            document.getElementById("crnt_acc_address").innerText = addresstrim(current['address']);
        }
    });


    $('.wlt_edit').on('click', function(){
        if($(this).attr('id') === 'wlt_keystore'){
            document.getElementById("edit_auth_title").innerText = "Export Wallet Keystore";
            document.getElementById("manage_action").value = "keystore";
        }else if($(this).attr('id') === 'wlt_prikey'){
            document.getElementById("edit_auth_title").innerText = "Export Private Key";
            document.getElementById("manage_action").value = "privatekey";
        }else if($(this).attr('id') === 'wlt_delete'){
            document.getElementById("edit_auth_title").innerText = "Remove Wallet";
            document.getElementById("manage_action").value = "remove";
        }
        $('#view_edwlt_home').hide();
        $('#view_edwlt_auth').show();
    });

    $('#wlt_pass').on('click', function() {
        $('#view_edwlt_home').hide();
        $('#view_edwlt_changepass').show();
    });


    $('#passchange_confirm').on('click', function(){
       var change_current = document.getElementById("change_current").value;
       var change_new = document.getElementById("change_new").value;
       var change_confirm = document.getElementById("change_confirm").value;

        $('#change_error').hide();
        $('#change_success').hide();
       if(change_new === change_confirm){
           chrome.storage.local.get('current', function(cbucket) {
               if (cbucket.current) {
                   var current = cbucket.current;
                   var privatekey = nuls.decrypteOfAES(current.encryptedPrivateKey, change_current);
                   var account = nuls.importByKey(current.chain_id, privatekey, change_confirm, "");
                   if (account.address === current.address) {
                       console.log("Matched");
                       var updatedaccount = {
                           'address': account.address,
                           'chain_id': current.chain_id,
                           'encryptedPrivateKey': account.aesPri,
                           'pubKey': account.pub,
                       };
                       chrome.storage.local.set({'current': updatedaccount});
                       chrome.storage.local.get('accounts', function(bucket){
                           accounts_list = bucket.accounts;
                           // console.log("Before Update ---> "+JSON.stringify(accounts_list));
                           var accounts = Object.keys(bucket['accounts']['list']).length;
                           for(var i = 0; accounts > i; i++) {
                               if (bucket.accounts['list'][i]['address'] === account.address) {
                                   accounts_list['list'][i] = updatedaccount;
                               }
                           }
                           // console.log("After Update ---> "+JSON.stringify(accounts_list));

                           $('#change_current').val("");
                           $('#change_new').val("");
                           $('#change_confirm').val("");
                           $('#change_success').show();

                           chrome.storage.local.set({'accounts': accounts_list}, function (e) {
                                window.location.href = "/activities/management.html"
                           });
                       });
                   } else {
                       $('#change_error').show();
                       $('#chagne_error_message').text('Current Password Invalid!');
                   }
               }
           });
       }else{
            $('#change_error').show();
            $('#chagne_error_message').text('New Password Mismatch!');
       }

    });

    $('.closeview').on('click', function(){
        $('#view_edwlt_changepass').hide();
        $('#view_privatekey').hide();
        $('#view_edwlt_auth').hide();
        $('#view_edwlt_home').show();
    });

    $('#transaction_confirm').on('click', function(){
        var edwlt_pass = document.getElementById("edwlt_pass").value;
        var manage_action = document.getElementById("manage_action").value;
        $('#auth_error').hide();
        chrome.storage.local.get('current', function(cbucket) {
            if(cbucket.current) {
                var current = cbucket.current;
                var privatekey = nuls.decrypteOfAES(current.encryptedPrivateKey, edwlt_pass);
                var account = nuls.importByKey(current.chain_id, privatekey, "", "");

                if(account.address === current.address){
                    console.log("Matched");
                    if(manage_action === 'keystore'){
                        downloadObjectAsJson(current, current.address)
                    }else if(manage_action === 'privatekey'){
                        $('#view_privatekey').slideDown();
                        document.getElementById("edwlt_prikey").value = privatekey;
                    }else if(manage_action === 'remove'){
                        chrome.storage.local.get('accounts', function(bucket){
                            accountslist = bucket.accounts;
                            var accounts = Object.keys(accountslist['list']).length;
                            for(var i = 0; accounts > i; i++) {
                                if (accountslist['list'][i]['address'] === account.address) {
                                    // delete accountslist['list'][i];
                                    accountslist['list'].splice(i, 1);
                                    chrome.storage.local.set({'accounts': accountslist}, function(bucket){
                                        window.location.href = '/activities/index.html';
                                    });
                                    break;
                                }
                            }

                            $('#change_success').show();
                        });
                    }
                }else{
                    $('#auth_error').show();
                }
            }
        });

    });

    function downloadObjectAsJson(exportObj, exportName){
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".keystore");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }



});