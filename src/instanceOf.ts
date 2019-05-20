import {
  AppManifest,
  AppMetadata,
  ChainInfo,
  ChainManifest,
  Manifest,
  ContractAction,
  EnvelopeDataType,
  SelectiveDisclosureRequest,
  SelectiveDisclosureResponse,
  SignatureProviderRequest,
  SignatureProviderRequestEnvelope,
  SignatureProviderResponse,
  SignatureProviderResponseEnvelope,
  TransactionSignatureRequest,
  TransactionSignatureResponse,
} from './interfaces'

export const instanceOfRequestEnvelope = (data: any): data is SignatureProviderRequestEnvelope => {
  if (!instanceOfObject(data)) { return false }
  const requestEnvelope = data as SignatureProviderRequestEnvelope
  return hasRequiredKeys(requestEnvelope, ['id', 'declaredDomain', 'returnUrl', 'request'])
    && hasAtLeastOneKey(requestEnvelope.request, ['transactionSignature', 'selectiveDisclosure'])
}

// tslint:disable-next-line:max-line-length
export const instanceOfSelectiveDisclosureRequest = (request: SignatureProviderRequest): request is SelectiveDisclosureRequest => {
  return EnvelopeDataType.SELECTIVE_DISCLOSURE in request
}

// tslint:disable-next-line:max-line-length
export const instanceOfTransactionSignatureRequest = (request: SignatureProviderRequest): request is TransactionSignatureRequest => {
  return EnvelopeDataType.TRANSACTION_SIGNATURE in request
}

export const instanceOfResponseEnvelope = (data: any): data is SignatureProviderResponseEnvelope => {
  if (!instanceOfObject(data)) { return false }
  const responseEnvelope = data as SignatureProviderResponseEnvelope
  return hasRequiredKeys(responseEnvelope, ['id', 'response'])
    && hasAtLeastOneKey(responseEnvelope.response, ['transactionSignature', 'selectiveDisclosure'])
}

// tslint:disable-next-line:max-line-length
export const instanceOfSelectiveDisclosureResponse = (response: SignatureProviderResponse): response is SelectiveDisclosureResponse => {
  return EnvelopeDataType.SELECTIVE_DISCLOSURE in response
}

// tslint:disable-next-line:max-line-length
export const instanceOfTransactionSignatureResponse = (response: SignatureProviderResponse): response is TransactionSignatureResponse => {
  return EnvelopeDataType.TRANSACTION_SIGNATURE in response
}

export const instanceOfAppManifest = (object: any): object is AppManifest => {
  const hasValidChainManifests =
    isValidArray(object.manifests)
    ? object.manifests.every((chainManifest: ChainManifest) => instanceOfChainManifest(chainManifest))
    : false

  return hasRequiredKeys(object, ['spec_version', 'manifests'])
    && hasValidChainManifests
}

export const instanceOfChainManifest = (object: any): object is ChainManifest => {
  return hasRequiredKeys(object, ['chainId', 'manifest'])
    && instanceOfManifest(object.manifest)
}

export const instanceOfManifest = (object: any): object is Manifest => {
  const hasValidWhitelist =
    isValidArray(object.whitelist)
    ? object.whitelist.every((contractAction: ContractAction) => instanceOfContractAction(contractAction))
    : false

  return hasRequiredKeys(object, ['account', 'domain', 'appmeta', 'whitelist'])
    && hasValidWhitelist
}

export const instanceOfAppMetadata = (object: any): object is AppMetadata => {
  const hasValidChainInfo =
    isValidArray(object.chains)
    ? object.chains.every((chainInfo: ChainInfo) => instanceOfChainInfo(chainInfo))
    : false

  return hasRequiredKeys(object, ['spec_version', 'name', 'shortname', 'scope', 'apphome', 'icon', 'chains'])
    && hasValidChainInfo
}

const instanceOfChainInfo = (object: any): object is ChainInfo => {
  return hasRequiredKeys(object, ['chainId', 'chainName', 'icon'])
}

const instanceOfContractAction = (object: any): object is ContractAction => {
  return hasRequiredKeys(object, ['contract', 'action'])
}

const instanceOfObject = (data: any): data is object => {
  return typeof data === 'object' && data != null
}

const isValidArray = (array: any[]) => {
  return Array.isArray(array) && array.length
}

const hasRequiredKeys = (object: object, keys: string[]): boolean => {
  return keys.every((key: string) => key in object)
}

const hasAtLeastOneKey = (object: object, keys: string[]): boolean => {
  return keys.reduce((valid: true, key: string) => valid || key in object, false)
}
