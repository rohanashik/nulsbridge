$(function() {
    chrome.storage.local.get('loggedin', function (lbucket) {
        console.log(lbucket.loggedinloggedin);
        if (lbucket.loggedin) {
            console.log("loggedin");
            chrome.storage.local.get('current', function(cbucket) {
                if (!cbucket.current) {
                    chrome.storage.local.get('accounts', function(bucket) {
                        if (!bucket.accounts) {
                            accounts = bucket.accounts;
                            chrome.storage.local.set({'current': bucket.accounts['list'][0]});
                        }else{
                            window.location.href = "/activities/gettingstarted.html";
                        }
                    });
                }
            });
            window.location.href = "/activities/home.html";
        } else {
            console.log("loggedout");
            window.location.href = "/activities/gettingstarted.html";
        }
    });
});