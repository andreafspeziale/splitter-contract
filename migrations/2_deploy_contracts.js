var Splitter = artifacts.require("./Splitter.sol");

module.exports = deployer => {
  deployer.deploy(Splitter, false);
};
