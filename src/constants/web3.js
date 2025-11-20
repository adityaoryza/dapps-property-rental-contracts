/**
 * Configuration Constants
 */

export const WALLET_ERRORS = {
  NO_METAMASK: 'MetaMask is not installed. Please install MetaMask to continue.',
  USER_REJECTED: 'Connection request rejected by user.',
  FETCH_BALANCE_FAILED: 'Failed to fetch balance',
  CONNECTION_FAILED: 'Failed to connect wallet. Please try again.',
};

export const ERROR_CODES = {
  USER_REJECTED_REQUEST: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
};

export const BALANCE_DECIMALS = 4;

export const ADDRESS_DISPLAY_CONFIG = {
  PREFIX_LENGTH: 6,
  SUFFIX_LENGTH: 4,
};

