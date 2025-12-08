import React, { useState } from 'react';
import { ethers } from 'ethers';

function ConnectWallet({ setProvider, setSigner, setAddress }) {
    const [connected, setConnected] = useState(false);
    const [status, setStatus] = useState('Connect Wallet');
    
    // BSC Testnet Chain ID
    const BSC_TESTNET_CHAIN_ID = 97n; 

    const connect = async () => {
        if (!window.ethereum) {
            setStatus('MetaMask not installed!');
            return;
        }

        try {
            // Request accounts and create provider/signer
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []); 
            const signer = await provider.getSigner();
            const accounts = await signer.getAddress();
            
            // Check network ID
            const network = await provider.getNetwork();
            
            if (network.chainId !== BSC_TESTNET_CHAIN_ID) {
                setStatus('Please connect to BSC Testnet (ID 97)');
                // Optionally add code here to prompt switching networks
            } else {
                setProvider(provider);
                setSigner(signer);
                setAddress(accounts);
                setConnected(true);
                setStatus(`Connected: ${accounts.substring(0, 6)}...`);
            }

        } catch (error) {
            console.error("Wallet connection failed:", error);
            setStatus('Connection Failed');
        }
    };

    return (
        <div className="glass-panel" style={{ marginBottom: '20px' }}>
            <h3>Wallet Connection</h3>
            <button onClick={connect} disabled={connected}>
                {status}
            </button>
            {!connected && <p style={{ color: 'red' }}>Connect to interact.</p>}
        </div>
    );
}

export default ConnectWallet;
