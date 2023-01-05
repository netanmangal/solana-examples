use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
};

use crate::instruction::CounterInstruction;
use crate::state::Counter;

pub struct Processor {}

impl Processor {
    pub fn process_instruction(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = CounterInstruction::try_from_slice(instruction_data)
            .map_err(|_| ProgramError::InvalidInstructionData)?;

        match instruction {
            CounterInstruction::Increment => {
                // read data from the account (data storage)
                let mut account_iter = accounts.iter();
                let account = next_account_info(&mut account_iter)?;
                let mut counter: Counter = Counter::try_from_slice(&account.data.borrow())?;

                // increment the value of counter
                counter.count += 1;

                // save the state to account
                counter.serialize(&mut *account.data.borrow_mut())?;
            }
        }

        Ok(())
    }
}
