const DappStateContract = require("../../build/contracts/DappState.json");
const DappContract = require("../../build/contracts/Dapp.json");
const Web3 = require("web3");
const ethTx = require('ethereumjs-tx');

// Ethereum
module.exports = class Blockchain {

    static async _init(config) {
        let web3Obj = { 
            http: new Web3(new Web3.providers.HttpProvider(config.httpUri)),
            ws: new Web3(new Web3.providers.WebsocketProvider(config.wsUri))
        }

        let accounts = config.accounts || await web3Obj.http.eth.getAccounts();

        return {
            dappStateContract: new web3Obj.http.eth.Contract(DappStateContract.abi, config.dappStateContractAddress),
            dappContract: new web3Obj.http.eth.Contract(DappContract.abi, config.dappContractAddress),
            dappStateContractWs: new web3Obj.ws.eth.Contract(DappStateContract.abi, config.dappStateContractAddress),
            dappContractWs: new web3Obj.ws.eth.Contract(DappContract.abi, config.dappContractAddress),
            accounts: accounts,
            wallets: config.wallets,
            lastBlock: await web3Obj.http.eth.getBlockNumber(),
            web3Obj: web3Obj
        }
    }

    /**
     * @dev Calls a read-only smart contract function
     */
    static async get(env, action, ...data) {
        let blockchain = await Blockchain._init(env.config);
        env.params.from = typeof env.params.from === 'string' ? env.params.from : blockchain.accounts[0];
        return {
            callAccount: env.params.from,
            callData: await blockchain[env.contract]
                                .methods[action](...data)
                                .call(env.params)
        }
    }

    /**
     * @dev Calls a writeable smart contract function
     */
    static async post(env, action, ...data) {
        let blockchain = await Blockchain._init(env.config);
        env.params.from = typeof env.params.from === 'string' ? env.params.from : blockchain.accounts[0];
        env.params.privateKey =  typeof env.params.privateKey === 'string' ? env.params.privateKey : blockchain.wallets[0].privateKey;

        let txInfo = {
            nonce: await blockchain.web3Obj.http.eth.getTransactionCount(env.params.from),
            from: env.params.from,
            to: blockchain[env.contract].options.address,
            gasLimit: Web3.utils.toHex(env.params.gas || 2000000),
            gasPrice: Web3.utils.toHex(await blockchain.web3Obj.http.eth.getGasPrice()),
            data: blockchain[env.contract].methods[action](...data).encodeABI()
        }

        let tx = new ethTx(txInfo);
        tx.sign(Buffer.from(env.params.privateKey.substr(2), 'hex'));
        let serializedTx = tx.serialize();
        let rawTxHex = '0x' + serializedTx.toString('hex');
        
        const hash = await new Promise(async (resolve) => {
            await blockchain.web3Obj.http.eth.sendSignedTransaction(rawTxHex)
              .once('transactionHash', (hash) => {
                resolve(hash)
              })
          })
          return {
                callAccount: env.params.from,
                callData: hash
          }
      
    }

    static async handleEvent(env, event, callback) {
        let blockchain = await Blockchain._init(env.config);
        env.params.fromBlock = typeof env.params.fromBlock === 'number' ? env.params.fromBlock : blockchain.lastBlock + 1;
        if (blockchain[env.contract].events[event]) {
            blockchain[env.contract].events[event](env.params, (error, result) => {
                let eventInfo = Object.assign({
                                                id: result.id,
                                                blockNumber: result.blockNumber
                                            }, result.returnValues);

                callback(error, eventInfo);
            });
        } else {
            throw(`Contract "${env.contract}" does not contain event "${event}"`);
        }
    }

}