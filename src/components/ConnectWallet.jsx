import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Added useEffect to check initial connection status on load
function ConnectWallet({ setProvider, setSigner, setAddress }) {
    const [connected, setConnected] = useState(false);
    const [status, setStatus] = useState('Connect Wallet');
    const BSC_TESTNET_CHAIN_ID = 97n; 

    // Function to handle the actual connection logic
    const connect = async () => {
        if (!window.ethereum) {
            setStatus('MetaMask not installed! Install and refresh.');
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []); 
            const signer = await provider.getSigner();
            const accounts = await signer.getAddress();
            
            const network = await provider.getNetwork();
            
            if (network.chainId !== BSC_TESTNET_CHAIN_ID) {
                setStatus('Please connect to BSC Testnet (ID 97)');
                // Do NOT set state if network is wrong, prevents rendering dashboard
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
    
    // NEW: Function to handle disconnection (clears state)
    const disconnect = () => {
        setProvider(null);
        setSigner(null);
        setAddress(null);
        setConnected(false);
        setStatus('Connect Wallet');
    };

    return (
        <div className="glass-panel" style={{ marginBottom: '20px' }}>
            <h3>Wallet Connection</h3>
            
            {/* Logic to choose between Connect and Disconnect */}
            {connected ? (
                <button onClick={disconnect}>
                    {status} (Disconnect)
                </button>
            ) : (
                <button onClick={connect}>
                    {status}
                </button>
            )}
            
        </div>
    );
}

export default ConnectWallet;
