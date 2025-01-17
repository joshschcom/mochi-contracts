const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const ComptrollerG7 = await hre.ethers.getContractFactory("ComptrollerG7");
  const comptrollerG7 = await ComptrollerG7.deploy(
    "0x507f0F5E58d21f07d133722e038067248fe4ecBE"
  );

  await comptrollerG7.deployed();

  console.log("ComptrollerG7 deployed to:", comptrollerG7.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
