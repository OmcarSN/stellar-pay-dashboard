#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec, symbol_short, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Payee {
    pub address: Address,
    pub share: u32, // Share in basis points (e.g., 5000 = 50%)
}

#[contract]
pub struct SplitterContract;

const PAYEES: Symbol = symbol_short!("PAYEES");
const INITIALIZED: Symbol = symbol_short!("INIT");

#[contractimpl]
impl SplitterContract {
    /// Initialize the contract with a list of payees and their shares.
    /// Total shares must sum to 10,000 (100%).
    pub fn init(env: Env, payees: Vec<Payee>) {
        if env.storage().instance().has(&INITIALIZED) {
            panic!("Contract already initialized");
        }

        let mut total_shares: u32 = 0;
        for payee in payees.iter() {
            total_shares += payee.share;
        }

        if total_shares != 10000 {
            panic!("Total shares must sum to 10,000 (100%)");
        }

        env.storage().instance().set(&PAYEES, &payees);
        env.storage().instance().set(&INITIALIZED, &true);
    }

    /// Split a given amount of tokens (or XLM) among the payees.
    /// The caller must have authorized the transfer to the contract previously of the `amount`.
    /// 
    /// This function:
    /// 1. Transfers `amount` from `sender` to the contract.
    /// 2. Immediately splits it among the payees.
    pub fn split(env: Env, sender: Address, token_id: Address, amount: i128) {
        sender.require_auth();

        let payees: Vec<Payee> = env.storage().instance().get(&PAYEES).expect("Contract not initialized");
        
        // 1. Transfer the total amount to the contract first
        let token_client = soroban_sdk::token::Client::new(&env, &token_id);
        token_client.transfer(&sender, &env.current_contract_address(), &amount);

        // 2. Distribute the shares
        let mut distributed_amount: i128 = 0;
        let num_payees = payees.len();

        for i in 0..num_payees {
            let payee = payees.get(i).unwrap();
            
            // Calculate share: (amount * share) / 10000
            // Using i128 to avoid overflow during calculation
            let payee_amount = (amount * payee.share as i128) / 10000;
            
            if payee_amount > 0 {
                token_client.transfer(&env.current_contract_address(), &payee.address, &payee_amount);
                distributed_amount += payee_amount;
            }
        }

        // If there's any dust left due to rounding, send it to the first payee
        let dust = amount - distributed_amount;
        if dust > 0 {
            let first_payee = payees.get(0).unwrap();
            token_client.transfer(&env.current_contract_address(), &first_payee.address, &dust);
        }
    }

    /// Get the list of payees.
    pub fn get_payees(env: Env) -> Vec<Payee> {
        env.storage().instance().get(&PAYEES).unwrap_or_else(|| Vec::new(&env))
    }
}
