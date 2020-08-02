
$(function() {

    $('.settings_menu').click(function() {
        console.log(this.id);
        if (this.id === 'goSetConnections') {
            $('#settitle').text('Connections');
            $('#view_settings_container').slideUp();
            $('#view_connections').slideDown();
            loadconnectionslist();
        }else if (this.id === 'goSetFeedback'){

        }else if (this.id === 'goSetLogout'){
            chrome.storage.local.clear(function() {
                var error = chrome.runtime.lastError;
                if (error) {
                    console.error(error);
                }
                window.location.href = "/activities/index.html";
            });
        }
    });

    $(document.body).on('click', '.removecon' ,function(){
    // $('.removecon').click(function() {
        var selectedDomain = this.id;
        console.log(this.id);
        document.getElementById(selectedDomain).src = "/assets/loader.gif";
        chrome.storage.local.get('allowedsite', function(bucket) {
            var allowedsites = Object.keys(bucket['allowedsite']).length;
            var allowedsiteslist = bucket['allowedsite'];
            for(var i=0; allowedsites > i; i++){
                // console.log(bucket['allowedsite'][i]['domain']);
                var domain = bucket['allowedsite'][i]['domain'];
                if(domain === selectedDomain){
                    allowedsiteslist.splice(i, 1);
                    chrome.storage.local.set({'allowedsite': allowedsiteslist}, function(bucket){
                        loadconnectionslist();
                    });
                    break;
                }
            }
        });
    });


    $("#settingsback").on('click', function () {
        if ($('#view_settings_container').css('display') !== 'none') {
            window.location.href = '/activities/home.html';
        }else{
            $('#settitle').text('Settings');
            $('#view_connections').hide();
            $('#view_settings_container').show();
        }
    });



    function loadconnectionslist() {
        var connectionlist = document.getElementById('connectionlist');
        connectionlist.innerHTML = "";
        chrome.storage.local.get('allowedsite', function(bucket) {
            var allowedsites = Object.keys(bucket['allowedsite']).length;
            for(var i=0; allowedsites > i; i++){
                // console.log(bucket.accounts['list'][i]['address']);
                var domain = bucket['allowedsite'][i]['domain'];
                connectionlist.innerHTML +=
                    '<div class="nom_list" data-domain="'+domain+'">' +
                    '<table width="100%">' +
                    '<tr>' +
                    '<td><p>'+domain+'</p></td>' +
                    '<td class="align-right">' +
                    '<img src="/assets/cross.png" width="8" id="'+domain+'" class="removecon pointer"></td>' +
                    '</tr>' +
                    '</table>' +
                    '</div>';
            }
        });
    }


});