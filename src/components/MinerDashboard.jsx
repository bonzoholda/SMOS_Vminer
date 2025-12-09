import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
    SMOS_CONTRACT_ADDRESS, 
    SMOS_ABI, 
    getContract 
} from '../utils/contractConfig';

// Utility function to format timestamps and BigInts
const formatBigInt = (value, decimals = 18, fixed = 4) => {
    if (!value) return '0.00';
    return ethers.formatUnits(value, decimals).slice(0, fixed + 1);
};

function MinerDashboard({ provider, signer, userAddress, lastUpdated, setLastUpdated }) {
    const [stats, setStats] = useState({
        shares: '0',
        rewards: '0',
        lockTime: 'N/A',
        smosBalance: '0',
    });
    
    // State to force data refresh after a deposit or claim
    //const [lastUpdated, setLastUpdated] = useState(Date.now());


    const fetchStats = async () => {
        if (!provider || !userAddress) return;

        try {
            // Get a read-only contract instance (using provider, not signer)
            const contract = getContract(SMOS_CONTRACT_ADDRESS, SMOS_ABI, provider);

            const [
                userShares, 
                pendingRewards,                 
                smosBal
            ] = await Promise.all([
                contract.userShares(userAddress),
                contract.pendingReward(userAddress),                
                contract.balanceOf(userAddress) // ERC20 balance
            ]);
            
            setStats({
                shares: formatBigInt(userShares),
                rewards: formatBigInt(pendingRewards),                
                smosBalance: formatBigInt(smosBal),
            });

        } catch (error) {
            console.error("Error fetching miner stats:", error);
        }
    };
    
    // Fetch stats immediately, and then poll every 10 seconds for rewards
    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Poll every 10s
        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [userAddress, lastUpdated]); // Rerun when user changes or we force update

    const handleClaim = async () => {
            if (!signer) {
                alert("Wallet not connected or signer missing.");
                return;
            }
    
            try {
                const contract = getContract(SMOS_CONTRACT_ADDRESS, SMOS_ABI, signer);
                
                // Execute the claim transaction
                const claimTx = await contract.claimPulseRewards();
                alert("Claim initiated. Confirm in MetaMask.");
                
                await claimTx.wait();
                alert("✅ Rewards successfully claimed!");
                
                // Force a dashboard refresh
                setLastUpdated(Date.now()); 
                
            } catch (error) {
                console.error("Claim failed:", error);
                alert(`❌ Claim failed: ${error.reason || 'Check console for details.'}`);
            }
        };
    
    return (
        <div className="glass-panel" style={{ marginTop: '30px' }}>
            <h3>Pulse Generator Dashboard Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', textAlign: 'left' }}>
                <p><strong>SMOS Balance:</strong> {stats.smosBalance} SMOS</p>
                <p><strong>Pulse Rates:</strong> {stats.shares} Beats</p>
                <p><strong>Pending Reward:</strong> {stats.rewards} SMOS</p>
                
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'center' }}>
                <button onClick={() => setLastUpdated(Date.now())}>
                    Refresh Data
                </button>
                        
                {/* NEW CLAIM BUTTON */}
                <button onClick={handleClaim} style={{ backgroundColor: '#4CAF50' }}>
                    Claim {stats.rewards} SMOS
                </button>
            </div>
        </div>
    );
}

export default MinerDashboard;
