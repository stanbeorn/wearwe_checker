import React, { useState, useEffect } from 'react';
import './App.css';
import { NFTDisplay } from './components/NFTDisplay';
import Papa from 'papaparse';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [whitelistStatus, setWhitelistStatus] = useState('');
  const [connected, setConnected] = useState(false);
  const [whitelists, setWhitelists] = useState({
    arIoOg: [],
    fcfs: [],
    og: []
  });

  useEffect(() => {
    // Check if ArConnect is available
    window.addEventListener('arweaveWalletLoaded', () => {
      console.log('ArConnect is available');
    });

    // Load CSV files
    const loadCsvData = async (filename) => {
      const response = await fetch(filename);
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csv = decoder.decode(result.value);
      return new Promise((resolve) => {
        Papa.parse(csv, {
          complete: (results) => {
            resolve(results.data.map(row => row[0]?.toLowerCase().trim()).filter(Boolean));
          }
        });
      });
    };

    Promise.all([
      loadCsvData('/ar-io-gateway-og.csv'),
      loadCsvData('/fcfs_whitelist.csv'),
      loadCsvData('/og_whitelist.csv')
    ]).then(([arIoOg, fcfs, og]) => {
      setWhitelists({
        arIoOg,
        fcfs,
        og
      });
    });
  }, []);

  const connectWallet = async () => {
    try {
      // Check if ArConnect is installed
      if (window.arweaveWallet) {
        await window.arweaveWallet.connect(['ACCESS_ADDRESS']);
        const address = await window.arweaveWallet.getActiveAddress();
        setWalletAddress(address);
        setConnected(true);
        // Automatically check eligibility after successful connection
        const normalizedWallet = address.toLowerCase().trim();
        let status = '';

        if (whitelists.og.includes(normalizedWallet)) {
          status = 'Congratulations! You are OG whitelisted! 🎉';
        } else if (whitelists.fcfs.includes(normalizedWallet)) {
          status = 'Congratulations! You are FCFS whitelisted! 🎉';
        } else if (whitelists.arIoOg.includes(normalizedWallet)) {
          status = 'Congratulations! You are AR.IO Gateway whitelisted! 🎉';
        } else {
          status = 'Sorry, this wallet is not whitelisted.';
        }

        setWhitelistStatus(status);
        setShowResult(true);
      } else {
        alert('Please install ArConnect to continue');
        window.open('https://arconnect.io', '_blank');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    }
  };

  const disconnectWallet = async () => {
    if (window.arweaveWallet) {
      await window.arweaveWallet.disconnect();
      setWalletAddress('');
      setConnected(false);
      setShowResult(false);
    }
  };

  const handleCheck = () => {
    const normalizedWallet = walletAddress.toLowerCase().trim();
    let status = '';

    if (whitelists.og.includes(normalizedWallet)) {
      status = 'Congratulations! You are OG whitelisted! 🎉';
    } else if (whitelists.fcfs.includes(normalizedWallet)) {
      status = 'Congratulations! You are FCFS whitelisted! 🎉';
    } else if (whitelists.arIoOg.includes(normalizedWallet)) {
      status = 'Congratulations! You are AR.IO Gateway whitelisted! 🎉';
    } else {
      status = 'Sorry, this wallet is not whitelisted.';
    }

    setWhitelistStatus(status);
    setShowResult(true);
  };

  return (
    <div className="app-container" style={{ 
      background: 'url("/background.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      width: '100%'
    }}>
      <div className="wallet-connect" style={{
        position: 'relative',
        top: '20px',
        right: '20px',
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        {!connected ? (
          <button onClick={connectWallet} className="connect-button">
            Connect Wallet
          </button>
        ) : (
          <button onClick={disconnectWallet} className="connect-button">
            Disconnect {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </button>
        )}
      </div>
      <main>
        {/* Checker Section */}
        <section className="checker-section" style={{
          position: 'relative',
          zIndex: 10000
        }}>
          <div className="checker-container container mx-auto px-4 py-4">
            <div className="max-w-2xl mx-auto p-4" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="input-group">
                {!showResult ? (
                  <>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter your wallet address"
                      style={{
                        width: '100%',
                        padding: '6px 16px',
                        border: '2px solid #96bc73',
                        borderRadius: '8px',
                        backgroundColor: 'transparent',
                        color: '#558f6d',
                        outline: 'none'
                      }}
                    />
                    <button 
                      style={{
                        width: '100%',
                        padding: '6px 16px',
                        backgroundColor: '#558f6d',
                        color: '#fdfefe',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        marginTop: '12px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#96bc73'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#558f6d'}
                      onClick={handleCheck}
                    >
                      CHECK ELIGIBILITY
                    </button>
                  </>
                ) : (
                  <div className="result-container p-2 rounded-lg"
                    style={{
                      border: '2px solid #b0dae7',
                      backgroundColor: '#fff',
                      outline: 'none'
                    }}>
                    <div className="result-content" style={{ textAlign: 'center' }}>
                      <h3 className="text-lg font-semibold" 
                        style={{ 
                          color: '#558f6d', 
                          margin: '0 0 8px 0',
                          borderBottom: '1px solid #96bc73',
                          paddingBottom: '4px'
                        }}>
                        Wallet Status
                      </h3>
                      <p style={{ 
                        color: whitelistStatus.includes('Congratulations') ? '#558f6d' : '#ff6b6b',
                        margin: '0 0 12px 0',
                        fontSize: '15px'
                      }}>
                        {whitelistStatus || 'Your wallet eligibility status will appear here.'}
                      </p>
                      <button 
                        style={{
                          width: '100%',
                          padding: '6px 16px',
                          backgroundColor: '#558f6d',
                          color: '#fdfefe',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 'bold',
                          marginTop: '8px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#96bc73'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#558f6d'}
                        onClick={() => {
                          setShowResult(false);
                          setWalletAddress('');
                        }}
                      >
                        CHECK ANOTHER WALLET
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <img src="/weARwe-logo.png" alt="WearWe Logo" className="wearwe-logo" />
        {/* NFT Display Section */}
        <section className="nft-section" style={{ 
          marginTop: '40px',
          background: 'transparent'
        }}>
          <div className="container mx-auto">
            <NFTDisplay />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
