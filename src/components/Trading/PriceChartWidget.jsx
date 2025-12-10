import React from 'react';

// NOTE: You MUST replace this with the actual LP address on BSC Testnet once created
const LP_ADDRESS = '0x83A8235887CDD552af6F644868FeC47a85E7D6a6'; // PLACEHOLDER: Find your SMOS/USDT LP address on BSC Testnet

const CHART_WIDGET_URL = 
  `https://www.dextools.io/widget-chart/en/bnb/pair-explorer/${LP_ADDRESS}` +
  `?theme=dark&chartType=2&trades=true&metrics=true`; 

function PriceChartWidget() {
  if (LP_ADDRESS === '0x...') {
    return (
      <div className="glass-panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>⚠️ **CHART WIDGET PENDING** ⚠️</p>
        <p>Please replace the LP_ADDRESS placeholder with your actual SMOS/USDT LP address on BSC Testnet.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
      <iframe
        id="dextools-chart"
        title="SMOS/USDT Chart"
        width="100%"
        height="400px"
        src={CHART_WIDGET_URL}
        style={{
          border: 'none',
          borderRadius: '12px', // Match the parent container radius
          display: 'block',
        }}
      />
    </div>
  );
}

export default PriceChartWidget;
