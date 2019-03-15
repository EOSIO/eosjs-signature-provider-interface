import { ApiInterfaces, RpcInterfaces } from 'eosjs'
import { v4 as uuid } from 'uuid'
import {
  instanceOfSelectiveDisclosureResponse,
  instanceOfTransactionSignatureResponse,
} from './instanceOf'
import {
  ErrorCodes,
  ErrorResponse,
  SecurityExclusions,
  SelectiveDisclosureRequest,
  SelectiveDisclosureResponse,
  SelectiveDisclosureType,
  SignatureProviderRequest,
  SignatureProviderRequestEnvelope,
  SignatureProviderResponseEnvelope,
  TransactionSignatureRequest,
  TransactionSignatureResponse,
  Uint8BinaryAbi,
} from './interfaces'
import * as utils from './utils'

export interface SignatureProviderInterfaceParams {
  declaredDomain: string
  returnUrl: string
  callbackUrl?: string
  securityExclusions?: SecurityExclusions
  options?: any
}

export interface CreateRequestEnvelopeParams {
  request: SignatureProviderRequest
}

export interface SignParams {
  chainId: string                     // Chain transaction is for
  requiredKeys: string[]              // Public keys associated with the private keys needed to sign the transaction
  serializedTransaction: Uint8Array   // Transaction to sign
  abis: Uint8BinaryAbi[]              // ABIs for all contracts with actions included in `serializedTransaction`
}

export type HandleRequestReturnType = string[] | RpcInterfaces.PushTransactionArgs

interface PendingRequest {
  resolve: (value?: HandleRequestReturnType | PromiseLike<HandleRequestReturnType>) => void
  reject: (reason?: ErrorResponse) => void
}

// See https://github.com/EOSIO/eosio-authentication-transport-protocol-spec for protocol versions
const AUTH_TRANSPORT_PROTOCOL_VERSION = '0.0.1'
const REJECT_MESSAGE = {
  NEW_REQUEST: 'A new request was received.',
  MANUAL_CANCEL: 'Transaction was manually rejected.',
  UNKNOWN_RESPONSE: 'The signature provider responded with an unknown response.',
}

export abstract class SignatureProviderInterface implements ApiInterfaces.SignatureProvider {
  private declaredDomain: string
  private returnUrl: string
  private callbackUrl?: string
  private securityExclusions?: SecurityExclusions
  private pendingRequest: PendingRequest

  constructor({
    declaredDomain,
    returnUrl,
    callbackUrl = '',
    securityExclusions,
  }: SignatureProviderInterfaceParams) {
    this.declaredDomain = declaredDomain
    this.returnUrl = returnUrl
    this.callbackUrl = callbackUrl
    this.securityExclusions = securityExclusions
  }

  /**
   * SignatureProvider Methods
   */

  public async getAvailableKeys(): Promise<string[]> {
    const cachedKeys = this.getCachedKeys()
    if (cachedKeys && cachedKeys.length > 0) {
      return cachedKeys
    }

    const request = this.createSelectiveDisclosureRequest([ SelectiveDisclosureType.AUTHORIZERS ])
    const requestEnvelope = this.createRequestEnvelope({ request })
    const keys = await this.handleRequest<string[]>(requestEnvelope)
    this.setCachedKeys(keys)
    return keys
  }

  public async sign(params: SignParams): Promise<RpcInterfaces.PushTransactionArgs> {
    const request = this.createTransactionSignatureRequest(params)
    const requestEnvelope = this.createRequestEnvelope({ request })
    return this.handleRequest<RpcInterfaces.PushTransactionArgs>(requestEnvelope)
  }

  /**
   * Request Handlers
   */

  protected abstract sendRequest(requestEnvelope: SignatureProviderRequestEnvelope): void

  private async handleRequest<TReturn extends HandleRequestReturnType>(
    requestEnvelope: SignatureProviderRequestEnvelope
  ): Promise<TReturn> {
    this.cancelPendingRequest({
      reason: REJECT_MESSAGE.NEW_REQUEST,
      errorCode: ErrorCodes.unexpectedError, // TODO: Need an error for already pending request
      contextualInfo: '',
    })

    const promise = new Promise<TReturn>((resolve, reject) => {
      this.pendingRequest = { resolve, reject }
    })

    this.sendRequest(requestEnvelope)

    return promise
  }

  /**
   * Response Handlers
   */

  protected handleResponse = (responseEnvelope: SignatureProviderResponseEnvelope) => {
    const response = responseEnvelope.response

    if (instanceOfSelectiveDisclosureResponse(response)) {
      this.handleSelectiveDisclosureResponse(response)
    } else if (instanceOfTransactionSignatureResponse(response)) {
      this.handleTransactionSignatureResponse(response)
    } else {
      this.pendingRequest.reject({
        reason: REJECT_MESSAGE.UNKNOWN_RESPONSE,
        errorCode: ErrorCodes.unexpectedError,
        contextualInfo: '',
      })
    }

    this.pendingRequest = null
  }

  private handleSelectiveDisclosureResponse(response: SelectiveDisclosureResponse) {
    if (response.selectiveDisclosure.error) {
      this.pendingRequest.reject(response.selectiveDisclosure.error)
      return
    }
    const authorizers = response.selectiveDisclosure.authorizers
    const keys = authorizers.reduce((result: string[], athorizers: any) => result.concat(athorizers.publicKey), [])
    this.pendingRequest.resolve(keys)
  }

  private handleTransactionSignatureResponse(response: TransactionSignatureResponse) {
    if (response.transactionSignature.error) {
      this.pendingRequest.reject(response.transactionSignature.error)
      return
    }

    const pushTransactionArgs: RpcInterfaces.PushTransactionArgs = {
      signatures: response.transactionSignature.signedTransaction.signatures,
      serializedTransaction: utils.hexToArray(response.transactionSignature.signedTransaction.packedTrx)
    }

    this.pendingRequest.resolve(pushTransactionArgs)
  }

  /**
   * Caching
   */

  protected abstract getCachedKeys(): string[] // If caching is not desired, return falsy
  protected abstract setCachedKeys(keys: string[]): void // If caching is not desired, implement as a noop
  public abstract clearCachedKeys(): void // If caching is not desired, implement as a noop

  /**
   * Cancelling
   */

  private cancelPendingRequest(reason: ErrorResponse): void {
    if (this.pendingRequest) {
      this.pendingRequest.reject(reason)
      this.pendingRequest = null
    }
  }

  public cancelRequest(): void {
    this.cancelPendingRequest({
      reason: REJECT_MESSAGE.MANUAL_CANCEL,
      errorCode: ErrorCodes.unexpectedError, // TODO: Need an error type for user rejected
      contextualInfo: '',
    })
  }

  /**
   * Life Cycle
   */

  // Should be called when throwing away a SignatureProvider.
  // Implement to cleanup things like event listeners.
  public abstract cleanUp(): void

  /**
   * Struct Creation
   */

  private createRequestEnvelope({ request }: CreateRequestEnvelopeParams): SignatureProviderRequestEnvelope {
    return {
      version: AUTH_TRANSPORT_PROTOCOL_VERSION,
      id: uuid(),
      declaredDomain: this.declaredDomain,
      returnUrl: this.returnUrl,
      request,
      callbackUrl: this.callbackUrl,
      ...(this.securityExclusions && { securityExclusions: this.securityExclusions }),
    }
  }

  private createSelectiveDisclosureRequest(disclosures: SelectiveDisclosureType[]): SelectiveDisclosureRequest {
    return {
      selectiveDisclosure: {
        disclosures: disclosures.map((disclosure) => ({
          type: disclosure
        }))
      }
    }
  }

  private createTransactionSignatureRequest({
    chainId,
    requiredKeys,
    serializedTransaction,
    abis
  }: SignParams): TransactionSignatureRequest {
    const packedTrx = utils.arrayToHex(serializedTransaction)
    const hexAbis = abis.map((abiObject: any) => ({
      accountName: abiObject.accountName,
      abi: utils.arrayToHex(abiObject.abi),
    }))

    return {
      transactionSignature: {
        chainId,
        publicKeys: requiredKeys,
        abis: hexAbis,
        transaction: {
          signatures: [] as string[],
          compression: 0,
          packedContextFreeData: '',
          packedTrx,
        },
      },
    }
  }
}
