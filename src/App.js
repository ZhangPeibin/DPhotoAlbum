import Home from "./home3";
import * as React from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import {generateMessageForEntropy, hashPersonalMessage} from "./signMessage";
import {BigNumber, utils} from "ethers";
import {PrivateKey} from "@textile/hub";

function initWeb3(provider: any) {
    const web3: any = new Web3(provider);
    web3.eth.extend({
        methods: [
            {
                name: "chainId",
                call: "eth_chainId",
                outputFormatter: web3.utils.hexToNumber
            }
        ]
    });
    return web3;
}





class App extends React.Component{

     componentDidMount() {
        const web3Modal = new Web3Modal({
            network: "mumbai",
            cacheProvider: true,
        });
        this.setState({
            web3Modal:web3Modal
        })
    }

    subscribeProvider = async (provider: any) => {
        if (!provider.on) {
            return;
        }
        provider.on("close", () => {
            console.log("close")
        });
        provider.on("accountsChanged", async (accounts: string[]) => {
            await this.setState({address: accounts[0]});
            // await this.getAccountAssets();
            console.log("accountsChanged")
        });
        provider.on("chainChanged", async (chainId: number) => {
            // @ts-ignore
            const {web3} = this.state;
            const networkId = await web3.eth.net.getId();
            await this.setState({chainId, networkId});
            // await this.getAccountAssets();
            console.log("chainChanged")
        });

        provider.on("networkChanged", async (networkId: number) => {
            // @ts-ignore
            const {web3} = this.state;
            const chainId = await web3.eth.chainId();
            await this.setState({chainId, networkId});
            // await this.getAccountAssets();
            console.log("networkChanged")
        });
    };

    handleLogin = async () => {
        this.setState({
            loading: true
        })
        const provider = await this.state.web3Modal.connect();
        await this.subscribeProvider(provider);
        const web3: any = initWeb3(provider);
        await this.switchNetworkMumbai(web3);
        const accounts = await web3.eth.getAccounts();
        console.log(accounts)
        const address = accounts[0];
        const networkId = await web3.eth.net.getId();
        const chainId = await web3.eth.chainId()
        console.log(chainId)
        console.log(networkId)
        const secretKey = "Dphoto.io";
        await this.setState({
            web3:web3,
            provider:provider,
            connected: true,
            address:address,
            chainId:chainId,
            networkId:networkId,
            secretKey:secretKey
        });
        console.log(address)
        await this.sign(web3,address,secretKey);
        this.setState({
            loading: false
        })
    }

    switchNetworkMumbai = async (web3) => {
        try {
            await web3.currentProvider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x13881" }],
            });
        } catch (error) {
            if (error.code === 4902) {
                try {
                    await web3.currentProvider.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: "0x13881",
                                chainName: "Mumbai",
                                rpcUrls: ["https://rpc-mumbai.matic.today"],
                                nativeCurrency: {
                                    name: "Matic",
                                    symbol: "Matic",
                                    decimals: 18,
                                },
                                blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com"],
                            },
                        ],
                    });
                } catch (error) {
                    alert(error.message);
                }
            }
        }
    }


    sign = async (web3,address,secretKey) => {
        const message = generateMessageForEntropy(address, "Dphoto", secretKey)
        const hasPersonalMessage = hashPersonalMessage(message)
        const signedText = await web3.eth.sign(hasPersonalMessage, address);
        const hash = utils.keccak256(signedText);
        console.log(hash)
        const array = hash
            // @ts-ignore
            .replace('0x', '')
            // @ts-ignore
            .match(/.{2}/g)
            .map((hexNoPrefix) => BigNumber.from('0x' + hexNoPrefix).toNumber())

        if (array.length !== 32) {
            throw new Error('Hash of signature is not the correct size! Something went wrong!');
        }
        const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(array))
        localStorage.setItem('seed',JSON.stringify(array));
        // @ts-ignore
        localStorage.setItem("identity", identity.toString())
    }

    render() {
        return (
            <div className="App">
                <h1  style={{marginTop:"64px",marginBottom:"0",paddingBottom:"0"}} className="text-center">
                    Build your own decentralized  photo album.</h1>
                <h4  style={{marginBottom:"0",paddingBottom:"0"}} className="text-center">
                    Fully decentralized own photo album.</h4>
                <div className='d-flex justify-content-center' style={{marginTop:"24px"}}>
                    <span onClick={()=>{ this.handleLogin()}} className="btn-main inline lead">Connect with Metamask</span>
                </div>
                <Home />
            </div>
        );
    }


}

export default App;
