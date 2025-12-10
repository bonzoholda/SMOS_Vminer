import React from 'react';

const USDT_ADDRESS = "0xd5210074786CfBE75b66FEC5D72Ae79020514afD";
const SMOS_ADDRESS = "0x2080C3184d1A421D68AEb0901e75e8fdF09D71C1";

const PANCAKESWAP_URL = 
  `https://pancakeswap.finance/swap?chain=bsc-testnet` +
  `&outputCurrency=${SMOS_ADDRESS}` +
  `&inputCurrency=${USDT_ADDRESS}`;

function SwapWidgetPancake() {
  return (
    <div className="glass-panel" style={{ padding: '10px', overflow: 'hidden' }}>
      <h3>Trade SMOS</h3>
      <iframe
        src={PANCAKESWAP_URL}
        title="PancakeSwap SMOS/USDT Swap"
        width="100%"
        height="500px"
        style={{
          border: 'none',
          borderRadius: '8px',
          display: 'block',
        }}
      />
    </div>
  );
}

export default SwapWidgetPancake;
