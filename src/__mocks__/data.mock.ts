import {
  AppManifest,
  AppMetadata,
  SecurityExclusions,
  SignatureProviderRequestEnvelope,
  SignatureProviderResponseEnvelope,
} from '../interfaces'

export const appMetadata: AppMetadata = {
  spec_version: '0.0.7',
  name: 'App Name',
  shortname: 'App Short Name',
  scope: '/',
  apphome: '/',
  icon: 'http://example.com/app-icon.png#SHA256Hash',
  description: 'App description',
  sslfingerprint: 'SLL Fingerprint',
  chains: [
    {
      chainId: 'chainId1',
      chainName: 'Chain One',
      icon: 'http://example.com/chain-icon1.png#SHA256Hash',
    },
    {
      chainId: 'chainId2',
      chainName: 'Chain Two',
      icon: 'http://example.com/chain-icon2.png#SHA256Hash',
    },
  ],
}

export const appManifest: AppManifest = {
  spec_version: '0.0.7',
  manifests: [
    {
      chainId: 'chainId1',
      manifest: {
        account: 'account',
        domain: 'http://example.com',
        appmeta: 'http://example.com/app-metadata.json#SHA256Hash',
        whitelist: [
          {
            contract: 'account.one',
            action: 'action1',
          },
          {
            contract: 'account.one',
            action: 'action2',
          },
          {
            contract: 'account.one',
            action: 'action3',
          }
        ],
      },
    },
    {
      chainId: 'chainId2',
      manifest: {
        account: 'account',
        domain: 'http://example.com',
        appmeta: 'http://example.com/app-metadata.json#SHA256Hash',
        whitelist: [
          {
            contract: 'account.one',
            action: 'action4',
          },
          {
            contract: 'account.one',
            action: 'action5',
          },
          {
            contract: 'account.one',
            action: 'action6',
          }
        ],
      },
    }
  ]
}

export const securityExclusions: SecurityExclusions = {
  addAssertToTransactions: false,
  appMetadataIntegrity: false,
  domainMatch: false,
  whitelistedActions: false,
  iconIntegrity: false,
  relaxedContractParsing: false,
}

export const transactionSignatureRequestEnvelope: SignatureProviderRequestEnvelope = {
  version: 'version',
  id: 'requestId',
  declaredDomain: 'http://example.com',
  returnUrl: '',
  securityExclusions,
  request: {
    transactionSignature: {
      chainId: 'chainId1',
      abis: [{
        abi: 'hex',
        accountName: 'account.one',
      }, {
        abi: 'hex2',
        accountName: 'account.one',
      }],
      publicKeys: [
        'publicKey1',
        'publicKey2',
      ],
      transaction: {
        signatures: [],
        compression: 0,
        packedContextFreeData: '',
        packedTrx: '',
      },
    },
  },
}

export const transactionSignatureResponseEnvelope: SignatureProviderResponseEnvelope = {
  id: 'requestId',
  response: {
    transactionSignature: {
      signedTransaction: {
        signatures: [],
        compression: 0,
        packedContextFreeData: '',
        packedTrx: '',
      },
    },
  },
}
