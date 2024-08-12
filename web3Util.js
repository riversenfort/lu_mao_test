
const { Web3 } = require('web3');
const { ethers } = require("ethers");
const { CommonUtil } = require('./commonUtil');
const { logger } = require('./logger');

class Web3Util {
    static async get_balance(rpc, address, token_contract_addresses) {
        const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
        const balance = await web3.eth.getBalance(address);
        const human_balance = web3.utils.fromWei(balance, 'ether')
        return human_balance
    }
    static async get_balance2(rpc, address, token_contract_addresses) {
        const mProvider = new ethers.JsonRpcProvider(rpc);
        const balance = await mProvider.getBalance(address);
        const human_balance = ethers.formatEther(balance)
        return human_balance
    }
    static async get_all_balance(rpc, address, token_contract_addresses) {
        let balance_info = {}
        const web3 = new Web3(new Web3.providers.HttpProvider(rpc));
        
        const balance = await web3.eth.getBalance(address);
        const human_balance = web3.utils.fromWei(balance, 'ether')
        balance_info['ETH'] = human_balance
        const erc20Abi = [
            {
                "constant": true,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "symbol",
                "outputs": [{"name": "", "type": "string"}],
                "type": "function"
            }
        ]
        for (const token_k in token_contract_addresses) {
            let token_contract_address = token_contract_addresses[token_k]
            console.log('token_contract_address === ',token_contract_address)
            const mContract = new web3.eth.Contract(erc20Abi, token_contract_address);
            let symbol = await mContract.methods.symbol().call();
            let decimals = Number(await mContract.methods.decimals().call());
            let balance = Number(await mContract.methods.balanceOf(address).call());
            let human_balance = balance / (Math.pow(10, decimals))
            human_balance = CommonUtil.change_num_normal(human_balance)
            balance_info[symbol] = human_balance

        }
        return balance_info
    }
    static async get_all_balance2(rpc, address, token_contract_addresses) {
        let balance_info = {}
        const mProvider = new ethers.JsonRpcProvider(rpc);
        const balance = await mProvider.getBalance(address);
        let eth_human_balance = ethers.formatEther(balance)
        balance_info['ETH'] = Number(eth_human_balance)

        const erc20Abi = [
            {
                "constant": true,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "symbol",
                "outputs": [{"name": "", "type": "string"}],
                "type": "function"
            }
        ];

        for (const token_k in token_contract_addresses) {
            let tokenContractAddress = token_contract_addresses[token_k]
            // console.log('tokenContractAddress === ',tokenContractAddress)
            const mContract = new ethers.Contract(tokenContractAddress, erc20Abi, mProvider);
            const symbol = await mContract.symbol();
            const decimals = Number(await mContract.decimals());
            const balance = Number(await mContract.balanceOf(address));
            let human_balance = balance / (Math.pow(10, decimals))
            human_balance = CommonUtil.change_num_normal(human_balance);
            balance_info[symbol] = human_balance
        }
        return balance_info
    }

    static createWallet() {
        let mnemonic = ethers.Mnemonic.fromEntropy(ethers.randomBytes(16))
        var path = "m/44'/60'/0'/0/0"
        let wallet = ethers.HDNodeWallet.fromMnemonic(mnemonic, path) 
        return wallet
    }

    static mnemonic2privateKey(phrase){
        let mnemonic = ethers.Wallet.fromPhrase(phrase)
        return mnemonic.privateKey
    }
    
    static createWalletByPrikey(private_key,rpc){
        const provider = new ethers.JsonRpcProvider(rpc);
        const wallet = new ethers.Wallet(private_key,provider);
        return wallet
    }
}

module.exports = Web3Util