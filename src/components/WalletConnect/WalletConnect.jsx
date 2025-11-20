import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./WalletConnect.css";

const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        const address = accounts[0].address;
        setWalletAddress(address);
        await getBalance(address);
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setWalletAddress(accounts[0]);
      getBalance(accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const getBalance = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (err) {
      console.error("Error fetching balance:", err);
      setError("Failed to fetch balance");
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed. Please install MetaMask to continue.");
        setIsConnecting(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        await getBalance(address);
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      if (err.code === 4001) {
        setError("Connection request rejected. Please try again.");
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setBalance(null);
    setError(null);
  };

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="wallet-connect-container">
      {error && (
        <div className="wallet-error">
          {error}
        </div>
      )}

      {balance && walletAddress && (
        <div className="wallet-balance">
          Balance: {balance} ETH
        </div>
      )}

      <button
        className={`wallet-connect-button ${walletAddress ? "connected" : ""}`}
        onClick={walletAddress ? disconnectWallet : connectWallet}
        disabled={isConnecting}
      >
        {isConnecting
          ? "Connecting..."
          : walletAddress
          ? formatAddress(walletAddress)
          : "Connect Wallet"}
      </button>
    </div>
  );
};

export default WalletConnect;
