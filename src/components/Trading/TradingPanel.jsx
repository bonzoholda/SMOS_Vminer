import React from 'react';
import PriceChartWidget from './PriceChartWidget';
import SwapWidgetPancake from './SwapWidgetPancake';

function TradingPanel() {
  return (
    <div className="trading-panel-container">
      {/* Chart is placed above the swap interface */}
      <PriceChartWidget />
      
      {/* Swap interface */}
      <SwapWidgetPancake />
    </div>
  );
}

export default TradingPanel;
