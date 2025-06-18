const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy MockSToken ($S)
  const MockSToken = await ethers.getContractFactory("MockSToken");
  const mockSToken = await MockSToken.deploy();
  await mockSToken.waitForDeployment();
  console.log("MockSToken deployed to:", await mockSToken.getAddress());

  // 2. Deploy MockfNFT
  const MockfNFT = await ethers.getContractFactory("MockfNFT");
  const mockfNFT = await MockfNFT.deploy();
  await mockfNFT.waitForDeployment();
  console.log("MockfNFT deployed to:", await mockfNFT.getAddress());

  // 3. Deploy VSToken
  const VSToken = await ethers.getContractFactory("VSToken");
  const vsToken = await VSToken.deploy();
  await vsToken.waitForDeployment();
  console.log("VSToken deployed to:", await vsToken.getAddress());

  // 4. Deploy Vault
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(
    await mockSToken.getAddress(),
    await vsToken.getAddress(),
    await mockfNFT.getAddress()
  );
  await vault.waitForDeployment();
  console.log("Vault deployed to:", await vault.getAddress());

  // 5. Set the vault address in VSToken
  console.log("Setting vault in VSToken...");
  const tx = await vsToken.setVault(await vault.getAddress());
  await tx.wait();
  console.log("Vault has been set in VSToken.");

  // 6. Mint a test NFT for the deployer
  console.log("Minting a test fNFT for the deployer...");
  const mintTx = await mockfNFT.mint(deployer.address);
  await mintTx.wait();
  console.log("Minted fNFT with ID 0 to deployer account.");

  console.log("\n--- Deployment Summary ---");
  console.log("MockSToken ($S):    ", await mockSToken.getAddress());
  console.log("MockfNFT:         ", await mockfNFT.getAddress());
  console.log("VSToken:          ", await vsToken.getAddress());
  console.log("Vault:            ", await vault.getAddress());
  console.log("--------------------------\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 