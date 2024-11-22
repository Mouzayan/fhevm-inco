import { ethers } from "hardhat";

import type { EncryptedWealthComparator } from "../../types";
import { getSigners } from "../signers";

export async function deployEncryptedWealthComparatorFixture(): Promise<EncryptedWealthComparator> {
  const signers = await getSigners(ethers);

  const EncryptedWealthComparatorFactory = await ethers.getContractFactory("EncryptedWealthComparator");
  const encryptedWealthComparator = await EncryptedWealthComparatorFactory.connect(signers.alice).deploy();
  await encryptedWealthComparator.waitForDeployment();

  return encryptedWealthComparator;
}
