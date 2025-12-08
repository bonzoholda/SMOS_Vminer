import React, { useState } from 'react';
import { ethers } from 'ethers';
import { 
    SMOS_CONTRACT_ADDRESS, 
    USDT_CONTRACT_ADDRESS, 
    SMOS_ABI, 
    USDT_ABI, 
    getContract 
} from '../utils/contractConfig';

function DepositForm({ signer, userAddress }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDeposit = async () => {
        if (!signer || !amount) {
            alert('Please connect wallet and enter an amount.');
            return;
        }

        setLoading(true);
        
        try {
            const amountInWei = ethers.parseUnits(amount, 18);
            
            // --- STEP 1: APPROVE USDT ---
            alert(`1/2: Initiating approval for ${amount} USDT...`);
            
            const usdtContract = getContract(USDT_CONTRACT_ADDRESS, USDT_ABI, signer);
            const approveTx = await usdtContract.approve(SMOS_CONTRACT_ADDRESS, amountInWei);
            await approveTx.wait();
            
            alert('USDT Approved! Proceeding to deposit (2/2)...');

            // --- STEP 2: CALL DEPOSITUSDT ---
            const smosContract = getContract(SMOS_CONTRACT_ADDRESS, SMOS_ABI, signer);
            const depositTx = await smosContract.depositUSDT(amountInWei);
            await depositTx.wait();
            
            alert(`✅ Deposit Successful! Transaction Hash: ${depositTx.hash}`);
            setAmount('');

        } catch (error) {
            console.error("Transaction failed:", error);
            alert(`❌ Transaction Failed: ${error.reason || 'Check console for details.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '10px', border: '1px solid green' }}>
            <h3>Deposit USDT & Stake</h3>
            <p>User Address: {userAddress ? userAddress : 'N/A'}</p>
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount of USDT to deposit"
                disabled={loading || !signer}
                style={{ marginRight: '10px', padding: '8px' }}
            />
            <button onClick={handleDeposit} disabled={loading || !signer}>
                {loading ? 'Processing...' : 'Approve & Deposit'}
            </button>
            {loading && <p>Waiting for transaction confirmations...</p>}
        </div>
    );
}

export default DepositForm;
