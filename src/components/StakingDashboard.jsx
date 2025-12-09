import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
    SMOS_CONTRACT_ADDRESS, 
    SMOS_ABI, 
    getContract,
    // Assuming you use the SMOS contract for approval too, if not, add another one.
} from '../utils/contractConfig'; 

// Utility function to format timestamps and BigInts
const formatBigInt = (value, decimals = 18, fixed = 4) => {
    if (!value) return '0.00';
    return ethers.formatUnits(value, decimals).slice(0, fixed + 1);
};

// Helper to format Unix timestamp to readable status
const formatLockTime = (timestamp) => {
    if (timestamp === 0n) return { status: 'Not Staked', locked: false };
    const now = Date.now() / 1000;
    const diff = Number(timestamp) - now;
    
    if (diff <= 0) return { status: 'UNLOCKED - Ready to Unstake!', locked: false };
    
    const days = Math.floor(diff / (60 * 60 * 24));
    const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
    
    return { status: `Locked: ${days}d ${hours}h`, locked: true };
};

function StakingDashboard({ provider, signer, userAddress, lastUpdated, setLastUpdated }) {
    const [stakeAmount, setStakeAmount] = useState('');
    const [stats, setStats] = useState({
        totalStaked: '0',
        pendingTax: '0',
        lockStatus: { status: 'Loading...', locked: true },
    });
    const [loading, setLoading] = useState(false);

    // Function to fetch staking stats
    const fetchStats = async () => {
        if (!provider || !userAddress) return;
        try {
            const contract = getContract(SMOS_CONTRACT_ADDRESS, SMOS_ABI, provider);

            const [
                totalStakedRaw, 
                rewardDebtRaw, 
                lockEndTime,
                accRewardPerShareRaw
            ] = await Promise.all([
                contract.userLockedTokens(userAddress), // <-- MUST CALL userLockedTokens
                contract.userRewardDebt(userAddress),   // <-- MUST CALL userRewardDebt
                contract.lockEndTime(userAddress),
                contract.accRewardPerShare()
            ]);

            // --- REWARD CALCULATION ---
            
            const stakedAmountBN = totalStakedRaw;
            const rewardDebtBN = rewardDebtRaw;
            const accRewardPerShareBN = accRewardPerShareRaw;
            
            // Assuming a common scaling factor of 1e12 for the accumulator. 
            // NOTE: This SCALING_FACTOR MUST match how your Solidity contract scaled accRewardPerShare.
            const SCALING_FACTOR = 10n ** 12n; 
            
            // Total accrued = (Staked * Accumulator) / Scale
            const totalAccrued = (stakedAmountBN * accRewardPerShareBN) / SCALING_FACTOR;
            
            // Pending Reward = Total Accrued - Reward Debt Checkpoint
            const pendingReward = totalAccrued - rewardDebtBN;
    
            const finalPendingReward = (pendingReward < 0n) ? 0n : pendingReward;
            
            // --- END REWARD CALCULATION ---
            
            setStats({
                totalStaked: formatBigInt(stakedAmountBN),
                pendingTax: formatBigInt(finalPendingReward),
                lockStatus: formatLockTime(lockEndTime),
            });

        } catch (error) {
            console.error("Error fetching staking stats:", error);
        }
    };
    
    // Fetch stats on component mount and whenever the parent state changes
    useEffect(() => {
        fetchStats();
    }, [userAddress, lastUpdated]);

    // Transaction Handlers
    
    const handleStake = async () => {
        if (!signer || !stakeAmount || parseFloat(stakeAmount) <= 0) {
            alert('Please connect wallet and enter a valid amount.');
            return;
        }
        setLoading(true);
        try {
            const amountInWei = ethers.parseUnits(stakeAmount, 18);
            
            // NOTE: Approval for the SMOS contract to spend its own token (SMOS) is required.
            // If you already added a generic approval in DepositForm, you might skip this.
            // If the staking requires a separate SMOS token approval, include it here.

            const smosContract = getContract(SMOS_CONTRACT_ADDRESS, SMOS_ABI, signer);
            
            // The function for staking and locking is likely lockTokens(amount)
            const stakeTx = await smosContract.lockTokens(amountInWei); 
            alert("Stake initiated. Confirm in MetaMask for locking.");
            
            await stakeTx.wait();
            alert("✅ SMOS Staked and Locked for 7 days!");
            
            setStakeAmount('');
            setLastUpdated(Date.now()); // Trigger refresh

        } catch (error) {
            console.error("Staking failed:", error);
            alert(`❌ Staking failed: ${error.reason || 'Check console for details.'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUnstake = async () => {
        if (!signer) return;
        if (stats.lockStatus.locked) {
            alert("Cannot unstake yet. Tokens are still locked.");
            return;
        }

        setLoading(true);
        try {
            const smosContract = getContract(SMOS_CONTRACT_ADDRESS, SMOS_ABI, signer);
            
            // The function to unstake/unlock all tokens
            const unstakeTx = await smosContract.unlockTokens(); 
            alert("Unstake initiated. Confirm in MetaMask.");
            
            await unstakeTx.wait();
            alert("✅ Tokens successfully unlocked and returned!");
            
            setLastUpdated(Date.now()); // Trigger refresh

        } catch (error) {
            console.error("Unstake failed:", error);
            alert(`❌ Unstake failed: ${error.reason || 'Check console for details.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ marginTop: '20px' }}>
            <h3>SMOS Token Staking</h3>
            
            {/* Input and STAKE Button */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Amount of SMOS to stake"
                    disabled={loading || !signer}
                    style={{ padding: '8px', width: '200px' }}
                />
                <button onClick={handleStake} disabled={loading || !signer}>
                    {loading ? 'Processing...' : 'Stake SMOS'}
                </button>
            </div>

            {/* Stats Display */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px' }}>
                <p><strong>Total Staked:</strong> {stats.totalStaked} SMOS</p>
                <p><strong>Pending Dividend Rewards:</strong> {stats.pendingTax} SMOS</p>
                <p style={{ gridColumn: 'span 2' }}>
                    <strong>Token Lock Status:</strong> <span style={{ color: stats.lockStatus.locked ? 'red' : 'lightgreen', fontWeight: 'bold' }}>{stats.lockStatus.status}</span>
                </p>
            </div>
            
            {/* UNSTAKE Button */}
            <div style={{ marginTop: '20px' }}>
                <button 
                    onClick={handleUnstake} 
                    disabled={loading || !signer || stats.lockStatus.locked}
                    style={{ backgroundColor: stats.lockStatus.locked ? '#555' : '#FFC107' }}
                >
                    Unstake SMOS
                </button>
            </div>
        </div>
    );
}

export default StakingDashboard;
