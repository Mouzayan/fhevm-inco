import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

import { getSigners } from "../test/signers";

task("task:deploy").setAction(async function (taskArguments: TaskArguments, { ethers }) {
  const signers = await getSigners(ethers);

  const Erc20Factory = await ethers.getContractFactory("EncryptedERC20");
  const encryptedERC20 = await Erc20Factory.connect(signers.alice).deploy();
  await encryptedERC20.waitForDeployment();
  console.log("EncryptedERC20 deployed to: ", await encryptedERC20.getAddress());

  // deploy EncryptedWealthComparator
  const EncryptedWealthComparator = await ethers.getContractFactory("EncryptedWealthComparator");
  const encryptedWealthComparator = await EncryptedWealthComparator.connect(signers.alice).deploy();
  await encryptedWealthComparator.waitForDeployment();
  console.log("EncryptedWealthComparator deployed to: ", await encryptedWealthComparator.getAddress());
});
