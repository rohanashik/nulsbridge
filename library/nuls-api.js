
const nuls = window.nulsjs('nuls-sdk-js');
const Bufferr = window.bufferjs('buffer/').Buffer;

var baseurl = "http://beta.api.nuls.io";
var clienturl = "http://beta.api.nuls.io/jsonrpc";
var publicurl = 'http://beta.public1.nuls.io/jsonrpc';

var chainID = 2;
var assetChainId = 2;

var CONTRACT_MAX_GASLIMIT= 10000000;
var CONTRACT_MINIMUM_PRICE= 25;


async function feeCalculator(contractAddress, fromAddress, toAddress, amount, decimals, handledata) {
    var contractCall = {
        chainId: 2,
        sender: fromAddress,
        contractAddress: contractAddress.toString(),
        value: 0, //
        methodName: "transfer",
        methodDesc: "",
        args: [toAddress, amount * decimals]
    };
    var value = Number(contractCall.value);
    var newValue = new BigNumber(contractCall.value);
    var gasLimit = new BigNumber(await imputedCallGas(contractCall.chainId, fromAddress, value, contractAddress, contractCall.methodName, contractCall.methodDesc, contractCall.args));

    var gasFee = Number(gasLimit.times(CONTRACT_MINIMUM_PRICE));

    console.log("gasLimit - " + gasLimit.toString());
    var newamount = Number(newValue + gasFee);
    console.log("value - " + value);
    console.log("newValue - " + newValue);
    console.log("amount - " + newamount);
    console.log("gasFee - " + gasFee);
    handledata(newamount);
}

async function gasCalculator(contractAddress, methodName, cvalue, sender, args, handledata) {
    var contractCall = {
        chainId: 2,
        sender: sender,
        contractAddress: contractAddress.toString(),
        value: cvalue,
        methodName: methodName,
        methodDesc: "",
        args: args
    };
    var value = Number(contractCall.value);
    var newValue = new BigNumber(contractCall.value);
    var gasLimit = new BigNumber(await imputedCallGas(contractCall.chainId, sender, cvalue, contractAddress, contractCall.methodName, contractCall.methodDesc, contractCall.args));

    var gasFee = Number(gasLimit.times(CONTRACT_MINIMUM_PRICE));

    console.log("gasLimit - " + gasLimit.toString());
    var newamount = Number(newValue + gasFee);
    console.log("value - " + value);
    console.log("newValue - " + newValue);
    console.log("amount - " + newamount);
    console.log("gasFee - " + gasFee);

    handledata(Number(newamount/100000000));
}

async function sendTransaction(transfertype, assetsChainId, assettype, fromAddress, publicKey, privateKey, toAddress, amount, balanceInfo, decimals, handledata) {
    console.log(transfertype);

    var assetsId = 1;

    if (transfertype === 'coin') {
            var transferInfo = {
                fromAddress: fromAddress,
                toAddress: toAddress,
                assetsChainId: assetsChainId,
                assetsId: assetsId,
                amount: amount * decimals,
                fee: 100000
            };
        if (assetsChainId === 2) {
            //NULS COIN
            var type = 2;
            await transact(privateKey, publicKey, transferInfo, balanceInfo, type, "", "", handledata);
        }else {
            type = 10;
            transactCross(privateKey, publicKey, transferInfo, balanceInfo, type, "", "", handledata);
        }
        // }else{
        //     CROSS COIN
        //     transferInfo = {
        //         fromAddress: fromAddress,
        //         toAddress: toAddress,
        //         assetsChainId: assetsChainId,
        //         assetsId: 1,
        //         amount: amount * decimals,
        //         remark: "",
        //         fee: 1000000
        //     };
        //
        //     transferCrossTransaction(privateKey, publicKey, 2, transferInfo, balanceInfo);
        // }
    }else{
        //TOKEN
        var contractCall = {
            chainId: assetsChainId,
            sender: fromAddress,
            contractAddress: assettype.toString(),
            value: 0, //
            methodName: "transfer",
            methodDesc: "",
            args: [toAddress, amount*decimals]
        };

        await callContract(privateKey, publicKey, fromAddress, assetsChainId, assetsId, contractCall, balanceInfo, '', handledata);

    }

    async function transferCrossTransaction(pri, pub, chainId, transferInfo, balanceInfo) {

        console.log(transferInfo.assetsChainId);

        let inputs = [];
        let outputs = [{
            address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
            assetsChainId: transferInfo.assetsChainId,
            assetsId: transferInfo.assetsId,
            amount: transferInfo.amount,
            lockTime: 0
        }];

        var mainNetBalance = await getAccountBalance(2, 2, 1, transferInfo.fromAddress);
        var mainNetBalanceInfo = mainNetBalance.result;
        // let mainNetBalanceInfo = await getBalance(8, 2, 1, transferInfo.fromAddress);
        var localBalanceInfo;
        //If it is not the main network, a NULS fee will be charged
        if (!isMainNet(chainId)) {
            if (mainNetBalanceInfo.balance < transferInfo.fee) {
                console.log("Insufficient balance");
                return;
            }
        }

        // If the transferred asset is the main asset of the chain, the handling fee is directly added to the transferred amount
        if (chainId === transferInfo.assetsChainId && transferInfo.assetsId === 1) {
            let newAmount = transferInfo.amount + transferInfo.fee;
            if (balanceInfo.balance < transferInfo.amount + transferInfo.fee) {
                console.log("Insufficient balance");
                return;
            }
            //Transfer-out local chain assets = transfer-out asset amount + local chain handling fee
            inputs.push({
                address: transferInfo.fromAddress,
                assetsChainId: transferInfo.assetsChainId,
                assetsId: transferInfo.assetsId,
                amount: newAmount,
                locked: 0,
                nonce: balanceInfo.nonce
            });
            //If it is not the main network, the main network NULS fee will be charged
            if (!isMainNet(chainId)) {
                inputs.push({
                    address: transferInfo.fromAddress,
                    assetsChainId: 2,
                    assetsId: 1,
                    amount: transferInfo.fee,
                    locked: 0,
                    nonce: mainNetBalanceInfo.nonce
                });
            }
        } else {
            var localBalance = await getAccountBalance(2, chainId, 1, transferInfo.fromAddress);
            var localBalanceInfo = localBalance.result;
            if (localBalanceInfo.balance < transferInfo.fee) {
                console.log("The main chain assets of this account are not enough to pay the handling fee！");
                return;
            }
            //If the transfer is NULS, you need to add the NULS handling fee to the transfer amount
            if (transferInfo.assetsChainId === 2 && transferInfo.assetsId === 1) {
                let newAmount = transferInfo.amount + transferInfo.fee;
                if (mainNetBalanceInfo.balance < newAmount) {
                    console.log("Insufficient balance");
                    return;
                }
                inputs.push({
                    address: transferInfo.fromAddress,
                    assetsChainId: transferInfo.assetsChainId,
                    assetsId: transferInfo.assetsId,
                    amount: newAmount,
                    locked: 0,
                    nonce: mainNetBalanceInfo.nonce
                });
            } else {
                inputs.push({
                    address: transferInfo.fromAddress,
                    assetsChainId: transferInfo.assetsChainId,
                    assetsId: transferInfo.assetsId,
                    amount: transferInfo.amount,
                    locked: 0,
                    nonce: balanceInfo.nonce
                });
                inputs.push({
                    address: transferInfo.fromAddress,
                    assetsChainId: 2,
                    assetsId: 1,
                    amount: transferInfo.fee,
                    locked: 0,
                    nonce: mainNetBalanceInfo.nonce
                });
            }
            //Main asset handling fee of this chain
            // if (!isMainNet(chainId)) {
            //     inputs.push({
            //         address: transferInfo.fromAddress,
            //         assetsChainId: chainId,
            //         assetsId: 1,
            //         amount: transferInfo.fee,
            //         locked: 0,
            //         nonce: localBalanceInfo.nonce
            //     });
            // }
        }
        let tAssemble = await nuls.transactionAssemble(inputs, outputs, transferInfo.remark, 10);//交易组装
        let ctxSign = "";//本链协议交易签名
        let mainCtxSign = "";//主网协议交易签名
        // let bw = new Serializers();
        // let mainCtx = new txs.CrossChainTransaction();
        let pubHex = Bufferr.from(pub, 'hex');
        console.log(pubHex);
        let newFee = 0;
        if (isMainNet(chainId)) {
            newFee = countCtxFee(tAssemble, 1)
        }
        // If the handling fee changes, reassemble CoinData
        if (transferInfo.fee !== newFee) {
            if (chainId === transferInfo.assetsChainId && transferInfo.assetsId === 1) {
                if (balanceInfo.balance < transferInfo.amount + newFee) {
                    console.log("Insufficient balance");
                    return;
                }
                inputs[0].amount = transferInfo.amount + newFee;
                if (!isMainNet(chainId)) {
                    inputs[1].amount = newFee;
                }
            } else {
                if (localBalanceInfo.balance < transferInfo.fee) {
                    console.log("The main chain assets of this account are not enough to pay the handling fee!");
                    return;
                }
                if (transferInfo.assetsChainId === 2 && transferInfo.assetsId === 1) {
                    if (mainNetBalanceInfo.balance < transferInfo.amount + newFee) {
                        console.log("余额不足");
                        return;
                    }
                    inputs[0].amount = transferInfo.amount + newFee;
                    inputs[1].amount = newFee;
                } else {
                    inputs[1].amount = newFee;
                    inputs[2].amount = newFee;
                }
            }
            tAssemble = await nuls.transactionAssemble(inputs, outputs, transferInfo.remark, 10);
            ctxSign = nuls.transactionSignature(pri, tAssemble);
        } else {
            ctxSign = nuls.transactionSignature(pri, tAssemble);
        }
        window.bw.writeBytesWithLength(pubHex);
        window.bw.writeBytesWithLength(ctxSign);
        tAssemble.signatures = window.bw.getBufWriter().toBuffer();
        var txHex2 = tAssemble.txSerialize().toString('hex');


        // let result = await sendCrossTx(txHex);
        // var localBalanceInfo = localBalance.result;
        // let result = await sendCrossTx(txHex);
        // console.log(result);
        // if (result.success) {
        //     console.log(result.data.value);
            let results = await broadcastTx(txHex2);
            console.log(results);
            // let results = await broadcastTx(txHex);
            if (results && results.value) {
                console.log("Transaction complete")
            } else {
                console.log("Broadcast transaction failed")
            }
        // } else {
        //     console.log("Verify transaction failed:" + result.error)
        // }


    }

}

async function callContract(privateKey, publicKey, fromAddress, assetsChainId, assetsId, contractCall, balanceInfo, remark, handledata){
    var type = 16;
    var contractAddress = contractCall.contractAddress;
    var value = Number(contractCall.value);
    var newValue = new BigNumber(contractCall.value);
    var contractCallTxData = {};
    contractCallTxData = await makeCallData(contractCall.chainId, fromAddress, value, contractAddress, contractCall.methodName, contractCall.methodDesc, contractCall.args);
    // contractCallTxData = data;
    var gasLimit = new BigNumber(contractCallTxData.gasLimit);
    console.log("gasLimit - " + gasLimit.toString());
    var gasFee = Number(gasLimit.times(contractCallTxData.price));
    var amount = Number(newValue + gasFee);
    console.log("value - " + value);
    console.log("newValue - " + newValue);
    console.log("amount - " + amount);
    console.log("gasFee - " + gasFee);
    var transferInfo = {
        fromAddress: fromAddress,
        assetsChainId: assetsChainId,
        assetsId: assetsId,
        amount: amount,
        fee: 100000
    };
    if (value > 0) {
        transferInfo.toAddress = contractAddress;
        transferInfo.value = contractCall.value;
    }
    await transact(privateKey, publicKey, transferInfo, balanceInfo, type, contractCallTxData, remark,  handledata);
}

async function transact(privateKey, publicKey, transferInfo, balanceInfo, type, info, remark, handledata) {

    console.log("Type ---> "+type);
    let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, type);
    console.log(JSON.stringify(inOrOutputs));
    if (inOrOutputs.success) {
        tAssemble = nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, type, info);
        console.log(JSON.stringify(tAssemble));
        let newFee = countFee(tAssemble, 1);
        console.log(transferInfo.fee +" "+newFee);
        if (transferInfo.fee !== newFee) {
            transferInfo.fee = newFee;
            inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, type);
            tAssemble = nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, type, info);
            txhex = nuls.transactionSerialize(privateKey, publicKey, tAssemble);
        } else {
            txhex = nuls.transactionSerialize(privateKey, publicKey, tAssemble);
        }
    }

    var validatetxresult = await validateTx(txhex);
    console.log(JSON.stringify(validatetxresult));
    if (validatetxresult.success) {
        // console.log(result.data.value);
        var broadcasttx = await broadcastTx(txhex);
        if (broadcasttx && broadcasttx.value) {
            console.log("Tx Success");
            handledata(true, broadcasttx.hash);
        } else {
            console.log("Broadcast Failed");
            // console.log(JSON.stringify(broadcasttx));
            handledata(false, broadcasttx.data);
        }
    } else {
        console.log("Verify transaction failed:" + validatetxresult.error);
        handledata(false, validatetxresult.error);
    }

}

async function transactCross(privateKey, publicKey, transferInfo, balanceInfo, type, info, remark, handledata) {

    console.log("Type ---> " + type);
    let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, type);

    console.log(inOrOutputs);

    var createTransferTx = await createTransferTxOffline(inOrOutputs);

    console.log(createTransferTx);
    console.log(createTransferTx.txHex);
    console.log(createTransferTx.hash);

    txHex = createTransferTx.txHex;

    // if (inOrOutputs.success) {
    //     tAssemble = nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, type, info);
    //     console.log(JSON.stringify(tAssemble));
    //     let newFee = countFee(tAssemble, 1);
    //     console.log(transferInfo.fee +" "+newFee);
    //     if (transferInfo.fee !== newFee) {
    //         transferInfo.fee = newFee;
    //         inOrOutputs = inputsOrOutputs(transferInfo, balanceInfo, type);
    //         tAssemble = nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, type, info);
    //         txhex = nuls.transactionSerialize(privateKey, publicKey, tAssemble);
    //     } else {
    //         txhex = nuls.transactionSerialize(privateKey, publicKey, tAssemble);
    //     }
    // }

    // txhex = nuls.transactionSignature(privateKey, tAssemble);

    var prisign = await priKeySign(2, txHex, transferInfo.fromAddress, privateKey);


    console.log(prisign.txHex);


    // var validatetxresult = await validateTx(txhex);
    // console.log(JSON.stringify(validatetxresult));
    // if (validatetxresult.success) {
    // console.log(result.data.value);
    var broadcasttx = await broadcastTx(prisign.txHex);
    console.log(JSON.stringify(broadcasttx));
    if (broadcasttx && broadcasttx.value) {
        console.log("Tx Success");
        handledata(true, broadcasttx.hash);
    } else {
        console.log("Broadcast Failed");
        handledata(false, "Broadcast Failed");
        // handledata(false, validatetxresult.error);
    }
    // } else {
    //     console.log("Verify transaction failed:" + validatetxresult.error);
    //     handledata(false, validatetxresult.error);
    // }

}


function isMainNet(chainId) {
    return chainId === 2;
}

function countCtxFee(tx, signatrueCount) {
    let txSize = tx.txSerialize().length;
    txSize += signatrueCount * 110;
    return 1000000 * Math.ceil(txSize / 1024);
}

function countFee(tx, signatrueCount) {
    let txSize = tx.txSerialize().length;
    txSize += signatrueCount * 110;
    return 100000 * Math.ceil(txSize / 1024);
}

async function inputsOrOutputs(transferInfo, balanceInfo, type) {
    let newAmount = transferInfo.amount + transferInfo.fee;
    let newLocked = 0;
    let newNonce = balanceInfo.nonce;
    let newoutputAmount = transferInfo.amount;
    let newLockTime = 0;
    if (balanceInfo.balance < transferInfo.amount + transferInfo.fee) {
        return {success: false, data: "Your balance is not enough."}
    }

    if (type === 10) {
        var response = await getAccountBalance(2, transferInfo.assetsChainId, 1, transferInfo.fromAddress);

        console.log(JSON.stringify(response));
        var inputs = [{
            address: transferInfo.fromAddress,
            assetChainId: transferInfo.assetsChainId,
            assetId: transferInfo.assetsId,
            amount: transferInfo.amount,
            nonce: response.result.nonce
        }, {
            address: transferInfo.fromAddress,
            assetChainId: 2,
            assetId: transferInfo.assetsId,
            amount: transferInfo.fee,
            nonce: newNonce
        }];
    }else{
        var inputs = [{
            address: transferInfo.fromAddress,
            assetsChainId: transferInfo.assetsChainId,
            assetsId: transferInfo.assetsId,
            amount: newAmount,
            locked: newLocked,
            nonce: newNonce
        }];
    }
    let outputs = [];
    if (type === 15 || type === 17) {
        return {success: true, data: {inputs: inputs, outputs: outputs}};
    }
    if (type === 16) {
        if (!transferInfo.toAddress) {
            return {success: true, data: {inputs: inputs, outputs: outputs}};
        } else {
            newoutputAmount = transferInfo.value;
        }
    }

    if (type !== 10) {
        outputs = [{
            address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
            assetsChainId: transferInfo.assetsChainId,
            assetsId: transferInfo.assetsId,
            amount: newoutputAmount,
            lockTime: newLockTime
        }];
    }else {
        outputs = [{
            address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
            assetChainId: transferInfo.assetsChainId,
            assetId: transferInfo.assetsId,
            amount: newoutputAmount,
            lockTime: newLockTime
        }];
    }

    return {success: true, data: {inputs: inputs, outputs: outputs}};
}

async function makeCallData(chainId, sender, value, contractAddress, methodName, methodDesc, args, handledata) {
    var contractCall = {};
    var contractConstructorArgsTypes;
    contractCall.chainId = chainId;
    contractCall.sender = sender;
    contractCall.contractAddress = contractAddress;
    contractCall.value = value;
    contractCall.gasLimit = await imputedCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args);
    // contractCall.gasLimit = imputedata;

    contractCall.price = CONTRACT_MINIMUM_PRICE;
    contractCall.methodName = methodName;
    contractCall.methodDesc = methodDesc;
    var argsTypesResult = await getContractMethodArgsTypes(contractAddress, methodName, methodDesc);
    // var argsTypesResult = contractarg;
    // console.log(data);
    if (argsTypesResult.success) {
        contractConstructorArgsTypes = argsTypesResult.data;
    } else {
        console.log("Failed to get parameter array\n", argsTypesResult.data);
        throw "query data failed";
    }
    // console.log("RNA -->"+args);
    // console.log("RNA -->"+contractConstructorArgsTypes);
    contractCall.args = twoDimensionalArray(args, contractConstructorArgsTypes);
    // console.log("RNA -->"+JSON.stringify(contractCall));
    return contractCall;
}

async function imputedCallGas(chainId, sender, value, contractAddress, methodName, methodDesc, args) {
    var result = await validateContractCall(sender, value, CONTRACT_MAX_GASLIMIT, CONTRACT_MINIMUM_PRICE, contractAddress, methodName, methodDesc, args)
    if (result.success) {
        var gasResult = await imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args)
        return Number(gasResult.data.gasLimit);
    } else {
        console.log("Call contract verification failed\n", result)
    }
}


function valueOfstring(obj) {
    return obj === null ? null : obj.toString();
}

function isBlank(str) {
    return null === str || str.trim().length === 0;
}


function twoDimensionalArray(args, types) {
    if (args.length === 0) {
        return null;
    } else if (args.length !== types.length) {
        throw "args number error";
    } else {
        let length = args.length;
        let two = new Array(length);
        let arg = void 0;
        for (let i = 0; i < length; i++) {
            arg = args[i];
            if (arg == null) {
                two[i] = [];
                continue;
            }
            if (typeof arg === 'string') {
                let argStr = arg;
                // 非String类型参数，若传参是空字符串，则赋值为空一维数组，避免数字类型转化异常 -> 空字符串转化为数字
                if (types != null && isBlank(argStr) && 'String' !== types[i]) {
                    two[i] = [];
                } else if (types != null && !isBlank(argStr) && types[i].indexOf('[]') >= 0) {
                    let arrayArg = eval(argStr);
                    if (Array.isArray(arrayArg)) {
                        let len = arrayArg.length;
                        let result = new Array(len);
                        for (let k = 0; k < len; k++) {
                            result[k] = valueOfstring(arrayArg[k]);
                        }
                        two[i] = result;
                    } else {
                        throw "array arg error";
                    }
                } else {
                    two[i] = [argStr];
                }
            } else if (Array.isArray(arg)) {
                let len = arg.length;
                let result = new Array(len);
                for (let k = 0; k < len; k++) {
                    result[k] = valueOfstring(arg[k]);
                }
                two[i] = result;
            } else {
                two[i] = [valueOfstring(arg)];
            }
        }
        return two;
    }
}








// async function getAccountBalance(address) {
async function getAccountBalance(chainIdn, assetChainIdn = 2, assetId = 1, address) {
    var request = {
        jsonrpc: "2.0",
        method: "getAccountBalance",
        params: [chainIdn, assetChainIdn, assetId, address],
        id: 1234
    };
    let githubResponse = await fetch(clienturl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });
    return await githubResponse.json();
}

async function getTokenBalance(address, tokenContract) {
    var request = {
        jsonrpc: "2.0",
        method: "getTokenBalance",
        params: [chainID, tokenContract, address],
        id: 1234
    };
    let githubResponse = await fetch(clienturl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });
    return await githubResponse.json();
}


async function getTokensList(address) {
    var request = {
        jsonrpc: "2.0",
        method: "getAccountTokens",
        params: [chainID, 1, 100, address],
        id: 1234
    };

    let githubResponse = await fetch(publicurl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });
    return await githubResponse.json();
}

async function getCrossAssetsList(address) {
    var request = {
        jsonrpc: "2.0",
        method: "getAccountCrossLedgerList",
        params: [chainID, address],
        id: 1234
    };

    let githubResponse = await fetch(publicurl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });
    return await githubResponse.json();
}

async function validateTx(txhex) {
    var request = {
        jsonrpc: "2.0",
        method: "validateTx",
        params: [chainID, txhex],
        id: 1234
    };

    let githubResponse = await fetch(clienturl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });

    response = await githubResponse.json();
    if (response.hasOwnProperty("result")) {
        return {success: true, data: response.result};
    } else {
        return {success: false, error: response.error};
    }

}

async function createTransferTxOffline(inOrOutputs) {
    var params = [inOrOutputs.data.inputs, inOrOutputs.data.outputs, ""];
    console.log(JSON.stringify(params));
    var request = {
        jsonrpc: "2.0",
        method: "createTransferTxOffline",
        params: params,
        id: 1234
    };

    let githubResponse = await fetch(clienturl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });

    response = await githubResponse.json();
    if (response.hasOwnProperty("result")) {
        return response.result;
    } else {
        return {success: false, data: response.error};
    }

}

async function priKeySign(chainID, txHex, account, accountPriKey) {

    var request = {
        jsonrpc: "2.0",
        method: "priKeySign",
        params: [chainID, txHex, account, accountPriKey],
        id: 1234
    };

    let githubResponse = await fetch(clienturl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });

    response = await githubResponse.json();
    if (response.hasOwnProperty("result")) {
        return response.result;
    } else {
        return {success: false, data: response.error};
    }

}

async function sendCrossTx(txhex) {
    var request = {
        jsonrpc: "2.0",
        method: "sendCrossTx",
        params: [chainID, txhex],
        id: 1234
    };

    let githubResponse = await fetch(clienturl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });

    response = await githubResponse.json();
    if (response.hasOwnProperty("result")) {
        return response.result;
    } else {
        return {success: false, data: response.error};
    }

}

async function broadcastTx(txhex) {
    var request = {
        jsonrpc: "2.0",
        method: "broadcastTx",
        params: [chainID, txhex],
        id: 1234
    };

    let githubResponse = await fetch(clienturl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });

    response = await githubResponse.json();
    if (response.hasOwnProperty("result")) {
        return response.result;
    } else {
        return response.error;
    }
}

async function validateContractCall(sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args) {
    var request = {
        jsonrpc: "2.0",
        method: "validateContractCall",
        params: [chainID, sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args],
        id: 1234
    };

    let githubResponse = await fetch(clienturl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });

    response = await githubResponse.json();
    if (response.hasOwnProperty("result")) {
        return {success: true, data: response.result};
    } else {
        return {success: false, data: response.error};
    }
}

async function imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args) {
    var request = {
        jsonrpc: "2.0",
        method: "imputedContractCallGas",
        params: [chainID, sender, value, contractAddress, methodName, methodDesc, args],
        id: 1234
    };

    let githubResponse = await fetch(clienturl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });

    response = await githubResponse.json();
    if (response.hasOwnProperty("result")) {
        return {success: true, data: response.result};
    } else {
        return {success: false, data: response.error};
    }
}

async function getContractMethodArgsTypes(contractAddress, methodName, methodDesc) {
    var request = {
        jsonrpc: "2.0",
        method: "getContractMethodArgsTypes",
        params: [2, contractAddress, methodName, methodDesc],
        id: 1234
    };

    let githubResponse = await fetch(clienturl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
    });

    response = await githubResponse.json();
    if (response.hasOwnProperty("result")) {
        return {success: true, data: response.result};
    } else {
        return {success: false, data: response.error};
    }
}


