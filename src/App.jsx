import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import DepositForm from './components/DepositForm';
import MinerDashboard from './components/MinerDashboard';
import './index.css'; // Assuming you have App.css for basic styling

function App() {
    const [signer, setSigner] = useState(null);
    const [userAddress, setUserAddress] = useState(null);

    return (
        <div className="App" style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'Arial' }}>
            <h1>Hybrid Pulse Miner Staking Interface</h1>
            
            <ConnectWallet 
                setSigner={setSigner} 
                setAddress={setUserAddress} 
            />
            
            {signer && (
                <DepositForm 
                    signer={signer} 
                    userAddress={userAddress} 
                />
            )}
            
            <p style={{ marginTop: '30px', fontSize: '12px' }}>
                *Requires BSC Testnet and Mock USDT allowance.
            </p>
        </div>
    );
}

export default App;
