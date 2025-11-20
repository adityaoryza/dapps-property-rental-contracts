import React, { useState, useEffect, useRef, useCallback } from "react";
import { ethers } from "ethers";
import { 
  WALLET_ERRORS, 
  ERROR_CODES, 
  BALANCE_DECIMALS, 
  ADDRESS_DISPLAY_CONFIG 
} from "../../constants/web3";
import "./WalletConnect.css";

const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  const providerRef = useRef(null);

  /**
   * Fetches and updates the ETH balance for a given address
   * 
   * @param {string} address
   * @returns {Promise<void>}
   */
  const getBalance = useCallback(async (address) => {
    try {
      const provider = providerRef.current;
      if (!provider) return;

      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(parseFloat(balanceEth).toFixed(BALANCE_DECIMALS));
    } catch (err) {
      console.error("Error fetching balance:", err);
      setError(WALLET_ERRORS.FETCH_BALANCE_FAILED);
    }
  }, []);

  /**
   * Handles account changes from the wallet provider
   * 
   * @param {string[]} accounts
   */
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setWalletAddress(accounts[0]);
      getBalance(accounts[0]);
    }
  }, [getBalance]);

  /**
   * Handles network/chain changes from the wallet provider
   */
  const handleChainChanged = useCallback(() => {
    setWalletAddress(null);
    setBalance(null);
    setError(null);
  }, []);

  /**
   * Checks if wallet is already connected on component mount
   * @returns {Promise<void>}
   */
  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      const provider = providerRef.current;
      if (!provider) return;

      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const address = accounts[0].address;
        setWalletAddress(address);
        await getBalance(address);
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err);
    }
  }, [getBalance]);

  /**
   * Initiates wallet connection flow
   * 
   * @returns {Promise<void>}
   */
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.ethereum) {
        setError(WALLET_ERRORS.NO_METAMASK);
        setIsConnecting(false);
        return;
      }

      const provider = providerRef.current;
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      setWalletAddress(address);
      await getBalance(address);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      
      if (err.code === ERROR_CODES.USER_REJECTED_REQUEST) {
        setError(WALLET_ERRORS.USER_REJECTED);
      } else {
        setError(WALLET_ERRORS.CONNECTION_FAILED);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnects wallet and clears all related state
   */
  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setBalance(null);
    setError(null);
  }, []);

  /**
   * Formats Ethereum address to shortened display format
   * 
   * @param {string} address
   * @returns {string}
   */
  const formatAddress = (address) => {
    if (!address) return "";
    const { PREFIX_LENGTH, SUFFIX_LENGTH } = ADDRESS_DISPLAY_CONFIG;
    return `${address.substring(0, PREFIX_LENGTH)}...${address.substring(address.length - SUFFIX_LENGTH)}`;
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      providerRef.current = new ethers.BrowserProvider(window.ethereum);

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      checkIfWalletIsConnected();
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [handleAccountsChanged, handleChainChanged, checkIfWalletIsConnected]);

  return (
    <div className="wallet-connect-container">
      {error && (
        <div className="wallet-error" role="alert">
          {error}
        </div>
      )}

      {balance && walletAddress && (
        <div className="wallet-balance" aria-label="Wallet balance">
          Balance: {balance} ETH
        </div>
      )}

      <button
        className={`wallet-connect-button ${walletAddress ? "connected" : ""}`}
        onClick={walletAddress ? disconnectWallet : connectWallet}
        disabled={isConnecting}
        aria-label={walletAddress ? "Disconnect wallet" : "Connect wallet"}
        type="button"
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
