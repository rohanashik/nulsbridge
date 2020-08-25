
$(function() {

    $('.settings_menu_grp').click(function() {
        console.log(this.id);
        if (this.id === 'goSetConnections') {
            $('#settitle').text('Connections');
            $('#view_settings_container').slideUp();
            $('#view_connections').slideDown();
            loadconnectionslist();
        }else if (this.id === 'goOpenAbout'){
            $('#settitle').text('About');
            $('#view_settings_container').slideUp();
            $('#view_version').slideDown();
            $('#appversion').text("v"+chrome.runtime.getManifest().version);

        }else if (this.id === 'goSetFeedback'){
            var url = "https://github.com/rohanashik/nulsbridge/issues";
            chrome.tabs.create({url:url, active: true});
        }else if (this.id === 'goViewGithub'){
            var url = "https://github.com/rohanashik/nulsbridge";
            chrome.tabs.create({url:url, active: true});
        }else if (this.id === 'goSetLogout'){

            document.getElementById("confirmView").style.display = "block";

        }else if (this.id === 'goConfirmLogout'){
            // console.log("confirm_logout");
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
            if(bucket.allowedsite) {
                var allowedsites = Object.keys(bucket['allowedsite']).length;
                var allowedsiteslist = bucket['allowedsite'];
                for (var i = 0; allowedsites > i; i++) {
                    // console.log(bucket['allowedsite'][i]['domain']);
                    var domain = bucket['allowedsite'][i]['domain'];
                    if (domain === selectedDomain) {
                        allowedsiteslist.splice(i, 1);
                        chrome.storage.local.set({'allowedsite': allowedsiteslist}, function (bucket) {
                            loadconnectionslist();
                        });
                        break;
                    }
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
            $('#view_version').hide();
            $('#view_settings_container').show();
        }
    });

    function loadconnectionslist() {
        var connectionlist = document.getElementById('connectionlist');
        connectionlist.innerHTML = "";
        chrome.storage.local.get('allowedsite', function(bucket) {
            if(bucket.allowedsite) {
                var allowedsites = Object.keys(bucket['allowedsite']).length;
                console.log(allowedsites);
                if(parseInt(allowedsites) !== 0) {
                    for (var i = 0; allowedsites > i; i++) {
                        // console.log(bucket.accounts['list'][i]['address']);
                        var domain = bucket['allowedsite'][i]['domain'];
                        connectionlist.innerHTML +=
                            '<div class="nom_list" data-domain="' + domain + '">' +
                            '<table width="100%">' +
                            '<tr>' +
                            '<td><p>' + domain + '</p></td>' +
                            '<td class="align-right">' +
                            '<img src="/assets/cross.png" width="8" id="' + domain + '" class="removecon pointer"></td>' +
                            '</tr>' +
                            '</table>' +
                            '</div>';
                    }
                }else{
                    connectionlist.innerHTML = "<p class='phead'>No Sites Connected!</p>";
                }
            }else{
                connectionlist.innerHTML = "<p class='phead'>No Sites Connected!</p>";
            }

        });
    }



    window.onclick = function(event) {
        if (event.target === document.getElementById("confirmView")) {
            document.getElementById("confirmView").style.display = "none";
        }
    }

});