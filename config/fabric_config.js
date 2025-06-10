const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

class FabricConfig {
  constructor() {
    this.ccpPath = path.resolve(__dirname, '..', 'connection-profile.json');
    this.ccp = JSON.parse(fs.readFileSync(this.ccpPath, 'utf8'));
    this.caURL = this.ccp.certificateAuthorities['ca.org1.example.com'].url;
    this.ca = new FabricCAServices(this.caURL);
    this.walletPath = path.join(process.cwd(), 'wallet');
    this.wallet = null;
  }

  async initWallet() {
    this.wallet = await Wallets.newFileSystemWallet(this.walletPath);
  }

  async enrollAdmin() {
    try {
      const identity = await this.wallet.get('admin');
      if (identity) {
        console.log('Admin user already exists in wallet');
        return;
      }

      const enrollment = await this.ca.enroll({
        enrollmentID: 'admin',
        enrollmentSecret: 'adminpw'
      });

      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
      };

      await this.wallet.put('admin', x509Identity);
      console.log('Successfully enrolled admin user');
    } catch (error) {
      console.error(`Failed to enroll admin user: ${error}`);
    }
  }

  async registerUser(userId, userType) {
    try {
      const userIdentity = await this.wallet.get(userId);
      if (userIdentity) {
        console.log(`User ${userId} already exists in wallet`);
        return;
      }

      const adminIdentity = await this.wallet.get('admin');
      if (!adminIdentity) {
        throw new Error('Admin user not found in wallet');
      }

      const provider = this.wallet.getProviderRegistry().getProvider(adminIdentity.type);
      const adminUser = await provider.getUserContext(adminIdentity, 'admin');

      const secret = await this.ca.register({
        affiliation: 'org1.department1',
        enrollmentID: userId,
        role: 'client',
        attrs: [{ name: 'userType', value: userType, ecert: true }]
      }, adminUser);

      const enrollment = await this.ca.enroll({
        enrollmentID: userId,
        enrollmentSecret: secret
      });

      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
      };

      await this.wallet.put(userId, x509Identity);
      console.log(`Successfully registered and enrolled user ${userId}`);
    } catch (error) {
      console.error(`Failed to register user ${userId}: ${error}`);
      throw error;
    }
  }

  async getContract(userId, channelName = 'mychannel', contractName = 'crb-contract') {
    try {
      const gateway = new Gateway();
      await gateway.connect(this.ccp, {
        wallet: this.wallet,
        identity: userId,
        discovery: { enabled: true, asLocalhost: true }
      });

      const network = await gateway.getNetwork(channelName);
      const contract = network.getContract(contractName);

      return { gateway, contract };
    } catch (error) {
      console.error(`Failed to get contract: ${error}`);
      throw error;
    }
  }
}

module.exports = new FabricConfig();