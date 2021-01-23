require('@babel/register');
({
    ignore: /node_modules/
});
require('@babel/polyfill');

const HDWalletProvider = require('@truffle/hdwallet-provider');

let mnemonic = 'grid problem oppose venture stomach response talk comic install civil army gasp'; 
let testAccounts = [
"0x3b9935e7acdde047e8d87791d3417f75b6bbe3e84fa65b4253f164c9981040a5",
"0x492b4e94f9e30b0f347e41cc22c3bb17ba7699d656da0ce35dcaaba78c0739cb",
"0xb53645d9a9e34a4a93bdb0f6fc2de33f0c94966a0aa5c8b2dd36bae9deb7c40e",
"0x6b899ba15f9e19f511b6e3ecd3201bcc51edff2140ce8cc4755b228b047b2027",
"0x800b69a8f04b508db187e5ad98a1ff33189a4b4c03bf0fc9f8f74376734bce2b",
"0x6d5e16adfa7dde202245616310bf1658e69f1a0724b8df391cab310e492a09a6",
"0x0c6e030fa752b442416768ffab69bd467e8a41f2ec7c5b32d5d7058324ff9a87",
"0x8849b6684bb07e377dd5962a0ce12db1a170e0acd72bf9186c3a6c79316c5ceb",
"0xe8b667c0f6c9932a6f878be580b9bd7b933bafd169f622eaf0653716f83a80d5",
"0xd2fbff4dc1cf3bd045fb85ceeb3aa8a8d2a9011e98b358a805f6439aa2feeccd"
]; 
let rpcUri = 'https://rpc-mumbai.matic.today';
let wsUri = 'wss://ws-mumbai.matic.today';

module.exports = {
    testAccounts,
    mnemonic,
    networks: {
        development: {
            uri: rpcUri,
            wsUri: wsUri,
            provider: () => new HDWalletProvider(
                mnemonic,
                rpcUri, // provider url
                0, // address index
                10, // number of addresses
                true, // share nonce
                `m/44'/60'/0'/0/` // wallet HD path
            ),
            gas: 2000000,
            network_id: 80001,
            confirmations: 1,
            timeoutBlocks: 100,
            skipDryRun: true
        }
    },
    compilers: {
        solc: {
            version: '^0.5.11'
        }
    }
};
