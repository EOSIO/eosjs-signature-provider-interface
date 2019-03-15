/**
 * EOSIO Interfaces
 * TODO: These should be moved somewhere else. Most are duplicated in other repos
 */

export interface Uint8BinaryAbi {
  accountName: string
  abi: Uint8Array
}

export interface HexAbi {
  accountName: string
  abi: string
}

export interface ContractAction {
  contract: string
  action: string
}

export interface AppMetadata {
  name: string,
  shortname: string,
  scope: string,
  apphome: string,
  icon: string,
  description?: string,
  sslfingerprint?: string,
  chains: ChainInfo[],
}

export interface ChainInfo {
  chainId: string,
  chainName: string,
  icon: string,
}

export interface AppManifest {
  account: string
  domain: string
  appmeta: string
  whitelist: ContractAction[]
}

export interface ChainManifest {
  chainId: string
  manifest: AppManifest
}

export interface Transaction {
  signatures: string[]
  compression: number
  packedContextFreeData: string
  packedTrx: string
}

export interface SecurityExclusions {
  addAssertToTransactions?: boolean
  appMetadataIntegrity?: boolean
  domainMatch?: boolean
  whitelistedActions?: boolean
  iconIntegrity?: boolean
  relaxedContractParsing?: boolean
}

/**
 * EOSIO Authentication Transport Protocol Specifications interfaces
 */

export enum EnvelopeDataType {
   SELECTIVE_DISCLOSURE = 'selectiveDisclosure',
   TRANSACTION_SIGNATURE = 'transactionSignature',
 }

export enum SelectiveDisclosureType {
  AUTHORIZERS = 'authorizers'
  // tslint:disable-next-line
  // TODO: Documentation says "availableKeys" instead of "authorizers"... but "authorizers" works with the EOSIO iOS app?
}

export interface Authorizer {
  publicKey: string
}

// Request Interfaces

export interface SelectiveDisclosureRequest {
  selectiveDisclosure: {
    disclosures: Array<{
      type: SelectiveDisclosureType
    }>
  }
}

export interface TransactionSignatureRequest {
  transactionSignature: {
    chainId: string
    publicKeys: string[]
    abis: HexAbi[]
    transaction: Transaction
  }
}

export interface SignatureProviderRequest extends
  Partial<SelectiveDisclosureRequest>,
  Partial<TransactionSignatureRequest> {}

// Response Interfaces

export interface SignatureProviderRequestEnvelope {
  version: string
  id: string
  declaredDomain: string
  returnUrl: string
  callbackUrl?: string
  responseKey?: string
  securityExclusions?: SecurityExclusions
  manifest?: AppManifest
  request: SignatureProviderRequest
}

export interface SelectiveDisclosureResponse {
  selectiveDisclosure: {
    authorizers?: Authorizer[]
    error?: ErrorResponse
  }
}

export interface TransactionSignatureResponse {
  transactionSignature: {
    signedTransaction: Transaction
    error?: ErrorResponse
  }
}

export interface SignatureProviderResponse extends
  Partial<SelectiveDisclosureResponse>,
  Partial<TransactionSignatureResponse> {}

export interface SignatureProviderResponseEnvelope {
  id: string
  deviceKey?: string
  response: SignatureProviderResponse
}

export interface ErrorResponse {
  errorCode: ErrorCodes
  reason: string
  contextualInfo: string
}

export enum ErrorCodes {
  biometricsDisabled,
  keychainError,
  manifestError,
  metadataError,
  networkError,
  parsingError,
  resourceIntegrityError,
  resourceRetrievalError,
  signingError,
  transactionError,
  vaultError,
  whitelistingError,
  unexpectedError,
}
