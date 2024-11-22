import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const encryptedERC20 = await deploy("EncryptedERC20", {
    from: deployer,
    args: [],
    log: true,
  });
  console.log(`EncryptedERC20 contract: `, encryptedERC20.address);

  const encryptedWealthComparator = await deploy("EncryptedWealthComparator", {
    from: deployer,
    args: [],
    log: true,
  });
  console.log(`EncryptedWealthComparator contract: `, encryptedWealthComparator.address);
};
export default func;
func.id = "deploy_encryptedERC20"; // id required to prevent reexecution
func.tags = ["EncryptedERC20", "EncryptedWealthComparator"];