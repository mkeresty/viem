import { expect, test } from 'vitest'
import {
  accounts,
  publicClient,
  testClient,
  wagmiContractConfig,
  walletClient,
} from '../../_test'
import { simulateContract } from '../public'
import { mine } from '../test'

import { writeContract } from './writeContract'

test('default', async () => {
  expect(
    await writeContract(walletClient, {
      ...wagmiContractConfig,
      from: accounts[0].address,
      functionName: 'mint',
    }),
  ).toBeDefined()
})

test('overloaded function', async () => {
  expect(
    await writeContract(walletClient, {
      ...wagmiContractConfig,
      from: accounts[0].address,
      functionName: 'mint',
      args: [69420n],
    }),
  ).toBeDefined()
})

test('w/ simulateContract', async () => {
  const { request } = await simulateContract(publicClient, {
    ...wagmiContractConfig,
    from: accounts[0].address,
    functionName: 'mint',
  })
  expect(await writeContract(walletClient, request)).toBeDefined()

  await mine(testClient, { blocks: 1 })

  expect(
    await simulateContract(publicClient, {
      ...wagmiContractConfig,
      from: accounts[0].address,
      functionName: 'mint',
    }),
  ).toBeDefined()
})

test('w/ simulateContract (overloaded)', async () => {
  const { request } = await simulateContract(publicClient, {
    ...wagmiContractConfig,
    from: accounts[0].address,
    functionName: 'mint',
    args: [69421n],
  })
  expect(await writeContract(walletClient, request)).toBeDefined()

  await mine(testClient, { blocks: 1 })

  await expect(() =>
    simulateContract(publicClient, {
      ...wagmiContractConfig,
      from: accounts[0].address,
      functionName: 'mint',
      args: [69421n],
    }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(`
    "The contract function \\"mint\\" reverted with the following reason:
    Token ID is taken

    Contract:  0x0000000000000000000000000000000000000000
    Function:  mint(uint256 tokenId)
    Arguments:     (69421)
    Sender:    0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266

    Docs: https://viem.sh/docs/contract/simulateContract
    Version: viem@1.0.2"
  `)
})