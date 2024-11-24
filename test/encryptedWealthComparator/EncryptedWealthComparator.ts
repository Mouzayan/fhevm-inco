import { expect } from "chai";
import { ethers } from "hardhat";



import { createInstances } from "../instance";
import { getSigners } from "../signers";
import { createTransaction } from "../utils";
import { deployEncryptedWealthComparatorFixture } from "./EncryptedWealthComparator.fixture";


// to run: npx hardhat test test/encryptedWealthComparator/EncryptedWealthComparator.ts --network rivest
describe("EncryptedWealthComparator", function () {
  before(async function () {
    this.signers = await getSigners(ethers);
  });

  beforeEach(async function () {
    // deploy the contract
    const encryptedWealthComparator = await deployEncryptedWealthComparatorFixture();
    this.encryptedWealthComparatorAddress = await encryptedWealthComparator.getAddress();
    this.wealthComparator = encryptedWealthComparator;

    // create FHE instances
    this.instances = await createInstances(this.encryptedWealthComparatorAddress, ethers, this.signers);
  });

  it("should compare wealth", async function () {
    // encrypt wealth values
    const aliceWealth = this.instances.alice.encrypt32(1000);
    const bobWealth = this.instances.bob.encrypt32(500);
    const carolWealth = this.instances.carol.encrypt32(750);

    // submit encrypted wealth values
    const aliceTx = await createTransaction(this.wealthComparator["submitWealth(bytes)"], aliceWealth);
    await aliceTx.wait();

    const bobTx = await createTransaction(this.wealthComparator["submitWealth(bytes)"], bobWealth);
    await bobTx.wait();

    const carolTx = await createTransaction(this.wealthComparator["submitWealth(bytes)"], carolWealth);
    await carolTx.wait();

    // verify submissions
    expect(await this.wealthComparator.hasSubmitted(this.signers.alice.address)).to.be.true;
    expect(await this.wealthComparator.hasSubmitted(this.signers.bob.address)).to.be.true;
    expect(await this.wealthComparator.hasSubmitted(this.signers.carol.address)).to.be.true;

    // find the richest participant
    const findRichestTx = await this.wealthComparator.findRichest(
      this.signers.alice.address,
      this.signers.bob.address,
      this.signers.carol.address,
    );
    await findRichestTx.wait();

    // alice should be the richest
    expect(await this.wealthComparator.richest()).to.equal(this.signers.alice.address);
  });
});