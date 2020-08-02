class bridgeConnect {

    isConnected() {
        return new Promise((resolve, reject) =>{
            this.sendData("isConnected", "", function (responsedata) {
                if (responsedata.type === "isConnected") {
                    console.log(responsedata.result);
                    resolve(responsedata.result);
                }
            });
        });
    }

    enable() {
        return new Promise((resolve, reject) => {
            this.sendData("Authorization", "", function (responsedata) {
                if (responsedata.type === "Authorization") {
                    if (responsedata.status) {
                        resolve(responsedata.address);
                    }
                }
            });
        });
    }

    disable() {
        return new Promise((resolve, reject) => {
            this.sendData("Deauthorization", "", function (responsedata) {
                if (responsedata.type === "Deauthorization") {
                    if (responsedata.status) {
                        resolve(responsedata.result_code);
                    }
                }
            });
        });
    }

    getWalletAddress() {
        return new Promise((resolve, reject) => {
            this.sendData("getWalletAddress", "", function (responsedata) {
                if (responsedata.type === "getWalletAddress") {
                    // console.log(JSON.stringify(responsedata));
                    resolve(responsedata.result);
                }
            })
        })
    }

    switchAccount() {
        return new Promise((resolve, reject) => {
            this.sendData("switchAccount", "", function (responsedata) {
                if (responsedata.type === "switchAccount") {
                    // console.log(JSON.stringify(responsedata));
                    resolve(responsedata.address);
                }
            })
        })
    }


    getBalance(address) {
        return new Promise((resolve, reject) => {
            this.sendData("getBalance", address, function (responsedata) {
                if (responsedata.type === "getBalance") {
                    // console.log(JSON.stringify(responsedata));
                    resolve(responsedata.result.result);
                }
            })
        })
    }

    getTokenBalance(address, contractAddress) {
        return new Promise((resolve, reject) => {
            this.sendData("getTokenBalance", {address: address, contract: contractAddress}, function (responsedata) {
                if (responsedata.type === "getTokenBalance") {
                    // console.log(JSON.stringify(responsedata));
                    resolve(responsedata.result.result);
                }
            })
        })
    }

    contractWrite(inputs){

        return new Promise((resolve, reject) => {
            this.sendData("contractWrite", inputs, function (responsedata) {
                if (responsedata.type === "contractWrite") {
                    let result = { // Filtering out other values
                        success: responsedata.status,
                        result: responsedata.result
                    };
                    // console.log(JSON.stringify(responsedata));
                    resolve(result);
                }
            })
        })

    }

    contractCall(callargs){
        return new Promise((resolve, reject) => {
            this.sendData("contractCall", callargs, function (responsedata) {
                if (responsedata.type === "contractCall") {
                    let result = { // Filtering out other values
                        success: responsedata.status,
                        result: responsedata.result
                    };
                    // console.log(JSON.stringify(responsedata));
                    resolve(result);
                }
            })
        })
    }


    sendData(data, params, responsedata) {
        window.postMessage({method: data, params: params}, location.origin);
        window.addEventListener('message', function (event) {
            // console.log(event.data);
            if(event.origin === location.origin){
                if (event.data.status){
                    responsedata(event.data);
                }
            // }else if(event.data.type && (event.data.type === "invokeConnection")){
            //     responsedata(event.data);
            }
        });
    }

}

bridge = new bridgeConnect();
