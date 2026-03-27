import * as StellarSdk from '@stellar/stellar-sdk';

export const NETWORKS = {
  testnet: { 
    url: 'https://horizon-testnet.stellar.org', 
    rpcUrl: 'https://soroban-testnet.stellar.org',
    passphrase: StellarSdk.Networks.TESTNET 
  },
  mainnet: { 
    url: 'https://horizon.stellar.org', 
    rpcUrl: 'https://soroban-rpc.stellar.org', // Note: Mainnet Soroban RPC URL depends on provider
    passphrase: StellarSdk.Networks.PUBLIC 
  }
};

export const isValidStellarAddress = (address) => {
  try { StellarSdk.Keypair.fromPublicKey(address); return true; }
  catch { return false; }
};

export const formatXLM = (amount) => `${parseFloat(amount).toFixed(2)} XLM`;

export const getBalance = async (publicKey, network = 'testnet') => {
  const server = new StellarSdk.Horizon.Server(NETWORKS[network].url);
  const account = await server.loadAccount(publicKey);
  const xlm = account.balances.find(b => b.asset_type === 'native');
  return xlm ? xlm.balance : '0';
};

export const getTransactions = async (publicKey, network = 'testnet') => {
  const server = new StellarSdk.Horizon.Server(NETWORKS[network].url);
  const ops = await server.operations().forAccount(publicKey).limit(10).order('desc').call();
  return ops.records;
};

export const sendPayment = async (fromPublicKey, toAddress, amount, memo, network = 'testnet') => {
  const { signTransaction } = await import('@stellar/freighter-api');
  const server = new StellarSdk.Horizon.Server(NETWORKS[network].url);
  const account = await server.loadAccount(fromPublicKey);
  
  let builder = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORKS[network].passphrase
  })
  .addOperation(StellarSdk.Operation.payment({
    destination: toAddress,
    asset: StellarSdk.Asset.native(),
    amount: amount.toString()
  }))
  .setTimeout(30);
  
  if (memo) builder = builder.addMemo(StellarSdk.Memo.text(memo));
  
  const tx = builder.build();
  
  const res = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORKS[network].passphrase, address: fromPublicKey });
  if (res.error) throw new Error(typeof res.error === 'string' ? res.error : Object.values(res.error).join(', ') || 'Failed to sign transaction');
  
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(res.signedTxXdr, NETWORKS[network].passphrase);
  return await server.submitTransaction(signedTx);
};

/**
 * 🚀 Soroban: Split Payment
 * Invokes the 'split' function on our Payment Splitter contract.
 */
export const splitPayment = async (fromPublicKey, contractId, tokenId, amount, network = 'testnet') => {
  const { signTransaction } = await import('@stellar/freighter-api');
  const server = new StellarSdk.Horizon.Server(NETWORKS[network].url); // Horizon can submit XDR
  const account = await server.loadAccount(fromPublicKey);
  
  const contract = new StellarSdk.Contract(contractId);
  
  // Create the transaction to invoke 'split'
  let builder = new StellarSdk.TransactionBuilder(account, {
    fee: (parseInt(StellarSdk.BASE_FEE) * 10).toString(), // Usually higher for Soroban
    networkPassphrase: NETWORKS[network].passphrase
  })
  .addOperation(contract.call('split', 
    new StellarSdk.Address(fromPublicKey).toScVal(),
    new StellarSdk.Address(tokenId).toScVal(),
    StellarSdk.nativeToScVal(amount * 10000000, { type: 'i128' }) // Assuming native 7 decimals
  ))
  .setTimeout(60);
  
  const tx = builder.build();
  
  // Freighter Sign
  const res = await signTransaction(tx.toXDR(), { networkPassphrase: NETWORKS[network].passphrase, address: fromPublicKey });
  if (res.error) throw new Error(res.error);
  
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(res.signedTxXdr, NETWORKS[network].passphrase);
  return await server.submitTransaction(signedTx);
};
