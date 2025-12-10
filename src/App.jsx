import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import DepositForm from './components/DepositForm';
import MinerDashboard from './components/MinerDashboard';
import StakingDashboard from './components/StakingDashboard';
import TradingPanel from './components/Trading/TradingPanel';
import './index.css'; // Assuming you have App.css for basic styling

function App() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [userAddress, setUserAddress] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    return (
        <div className="App" style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'Arial' }}>
            <h1>SPHYGMOS</h1>
            <h3>Hybrid Pulse-Miner Staking Interface</h3>
            
            <ConnectWallet
                setProvider={setProvider}
                setSigner={setSigner} 
                setAddress={setUserAddress} 
            />
            
            {signer && (
                <>
                    <DepositForm 
                        signer={signer} 
                        userAddress={userAddress}
                        setLastUpdated={setLastUpdated}
                    />
                    <MinerDashboard // <--- NEW COMPONENT
                        provider={provider} 
                        signer={signer} // Pass signer for transactions
                        userAddress={userAddress} 
                        setLastUpdated={setLastUpdated} // Pass setter to refresh after claim/deposit
                        lastUpdated={lastUpdated} // Pass state to trigger useEffect
                    />

                    {/* NEW STAKING DASHBOARD */}
                    <StakingDashboard 
                        provider={provider} 
                        signer={signer} 
                        userAddress={userAddress} 
                        setLastUpdated={setLastUpdated} 
                        lastUpdated={lastUpdated} 
                    />

                    {/* Integrate the new Trading Panel */}
                    <TradingPanel />
                    
                </>    
            )}
            
            <p style={{ marginTop: '30px', fontSize: '12px' }}>
                *Requires BSC Testnet and Mock USDT allowance.
            </p>
        </div>
    );
}

export default App;
