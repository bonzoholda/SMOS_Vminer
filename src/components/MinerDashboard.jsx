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

function MinerDashboard({ provider, userAddress }) {
    const [stats, setStats] = useState({
        shares: '0',
        rewards: '0',
        lockTime: 'N/A',
        smosBalance: '0',
    });
    
    // State to force data refresh after a deposit or claim
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    // Helper to format Unix timestamp to readable date/time
    const formatLockTime = (timestamp) => {
        if (timestamp === 0n) return 'Not Locked';
        const now = Date.now() / 1000;
        const diff = Number(timestamp) - now;
        
        if (diff <= 0) return 'Unlocked';
        
        // Simple display: remaining days/hours
        const days = Math.floor(diff / (60 * 60 * 24));
        const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
        
        return `Locked: ${days}d ${hours}h`;
    };

    const fetchStats = async () => {
        if (!provider || !userAddress) return;

        try {
            // Get a read-only contract instance (using provider, not signer)
            const contract = getContract(SMOS_CONTRACT_ADDRESS, SMOS_ABI, provider);

            const [
                userShares, 
                pendingRewards, 
                lockEndTime,
                smosBal
            ] = await Promise.all([
                contract.userShares(userAddress),
                contract.pendingReward(userAddress),
                contract.lockEndTime(userAddress),
                contract.balanceOf(userAddress) // ERC20 balance
            ]);
            
            setStats({
                shares: formatBigInt(userShares),
                rewards: formatBigInt(pendingRewards),
                lockTime: formatLockTime(lockEndTime),
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

    return (
        <div style={{ padding: '20px', border: '2px solid #646cff', borderRadius: '10px', marginTop: '30px' }}>
            <h3>Miner Dashboard Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', textAlign: 'left' }}>
                <p><strong>SMOS Balance:</strong> {stats.smosBalance} SMOS</p>
                <p><strong>Staking Shares:</strong> {stats.shares} Shares</p>
                <p><strong>Pending Reward:</strong> {stats.rewards} SMOS</p>
                <p><strong>Lock Status:</strong> {stats.lockTime}</p>
            </div>
            {/* Optional: Add a button to manually refresh data */}
            <button onClick={() => setLastUpdated(Date.now())} style={{ marginTop: '10px' }}>
                Refresh Data
            </button>
        </div>
    );
}

export default MinerDashboard;
