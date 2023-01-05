use borsh::{BorshSerialize, BorshDeserialize};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum CounterInstruction {
    Increment
}