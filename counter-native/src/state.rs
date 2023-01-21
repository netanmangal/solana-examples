use borsh::{BorshSerialize, BorshDeserialize};

#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct Counter {
    pub count: u64
}