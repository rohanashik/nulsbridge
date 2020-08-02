
$(function() {

// MENU ACTION
    $("#showAccounts").on('click', function () {
        console.log("clicked");
        $("#myDropdown").toggleClass("show");
    });

    // $('#nulslogo').on('click', function () {
    //     alert("hi");
    // });

    function setchromevault(key, data) {
        chrome.storage.local.set({key: data});
    }

    $("#gotohome").on('click', function () {
        window.location.href = "/home.html";
    });

// MENU ACTION
});



function addresstrim(address) {
    return address.substring(0, 14)+'.....'+address.substring(38, 24);
}

function countDecimals(value) {
    if (Math.floor(value) !== value)
        if(value.toString().indexOf('.') > -1){
            return value.toString().split(".")[1].length || 0;
        }else {
            return 0
        }
    return 0;
}

function decimalConvertor(decimal) {
    switch(decimal){
        case 0: return 1; break;
        case 1: return 10; break;
        case 2: return 100; break;
        case 3: return 1000; break;
        case 4: return 10000; break;
        case 5: return 100000; break;
        case 6: return 1000000; break;
        case 7: return 10000000; break;
        case 8: return 100000000; break;
        case 9: return 1000000000; break;
        case 10: return 10000000000; break;
        case 11: return 100000000000; break;
        case 12: return 1000000000000; break;
        case 13: return 10000000000000; break;
        case 14: return 100000000000000; break;
        case 15: return 1000000000000000; break;
        case 16: return 10000000000000000; break;
        case 17: return 100000000000000000; break;
        case 18: return 1000000000000000000; break;
        case 19: return 10000000000000000000; break;
        case 20: return 100000000000000000000; break;
        case 21: return 1000000000000000000000; break;
        case 22: return 10000000000000000000000; break;
    }
}
