import * as StellarSdk from 'stellar-sdk';

export const NETWORKS = {
  testnet: { url: 'https://horizon-testnet.stellar.org', passphrase: StellarSdk.Networks.TESTNET },
  mainnet: { url: 'https://horizon.stellar.org', passphrase: StellarSdk.Networks.PUBLIC }
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
  const payments = await server.payments().forAccount(publicKey).limit(10).order('desc').call();
  return payments.records;
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
