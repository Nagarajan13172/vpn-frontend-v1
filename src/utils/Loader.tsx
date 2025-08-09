import React from 'react';

const WifiLoader: React.FC = () => {
    return (
        <div className="wifi-loader-container">
            <div className="wifi-loader">
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
            </div>
            <div className="loading-text">Loading...</div> {/* Added loading text */}
        </div>
    );
};

export default WifiLoader;