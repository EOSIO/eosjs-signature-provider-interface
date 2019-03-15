import { ErrorCodes, SecurityExclusions, SignatureProviderRequestEnvelope } from './interfaces'
import { SignatureProviderInterface, SignParams } from './SignatureProviderInterface'
import { arrayToHex, hexToArray } from './utils'

declare var global: any

describe('SignatureProviderInterface', () => {
  let signatureProviderInterface: SignatureProviderInterface
  let declaredDomain: string
  let returnUrl: string
  let callbackUrl: string
  let securityExclusions: SecurityExclusions
  let mockSendRequest: jest.Mock
  let mockGetCachedKeys: jest.Mock
  let mockCacheKeys: jest.Mock
  let mockClearCachedKeys: jest.Mock

  beforeEach(() => {
    declaredDomain = 'example.com'
    returnUrl = 'example.com'
    callbackUrl = 'example.com'
    securityExclusions = {
      domainMatch: true,
    }

    mockSendRequest = jest.fn()
    mockGetCachedKeys = jest.fn()
    mockCacheKeys = jest.fn()
    mockClearCachedKeys = jest.fn()
  })

  describe('getAvailableKeys', () => {
    beforeEach(() => {
      mockSendRequest.mockImplementation((requestEnvelope: SignatureProviderRequestEnvelope, handleResponse: any) => {
        handleResponse({
          id: requestEnvelope.id,
          response: {
            selectiveDisclosure: {
              authorizers: [{
                publicKey: 'publicKey',
              }]
            }
          }
        })
      })
    })

    describe('if there are cached keys', () => {
      it('returns cached keys', async () => {
        mockGetCachedKeys.mockReturnValue(['cachedKey'])
        signatureProviderInterface = createSignatureProvider()
        const result = await signatureProviderInterface.getAvailableKeys()
        expect(result).toEqual(['cachedKey'])
      })
    })

    describe('if cached keys are empty', () => {
      it('does not returns cached keys', async () => {
        mockGetCachedKeys.mockReturnValue([])
        signatureProviderInterface = createSignatureProvider()
        const result = await signatureProviderInterface.getAvailableKeys()
        expect(result).toEqual(['publicKey'])
      })
    })

    describe('if cached keys is null', () => {
      it('does not returns cached keys', async () => {
        mockGetCachedKeys.mockReturnValue(null)
        signatureProviderInterface = createSignatureProvider()
        const result = await signatureProviderInterface.getAvailableKeys()
        expect(result).toEqual(['publicKey'])
      })
    })

    describe('if cached keys is undefined', () => {
      it('does not returns cached keys', async () => {
        mockGetCachedKeys.mockReturnValue(undefined)
        signatureProviderInterface = createSignatureProvider()
        const result = await signatureProviderInterface.getAvailableKeys()
        expect(result).toEqual(['publicKey'])
      })
    })

    it('sends the correct SelectiveDisclosureRequest', async () => {
      signatureProviderInterface = createSignatureProvider()
      await signatureProviderInterface.getAvailableKeys()

      expect(mockSendRequest).toHaveBeenCalledWith({
        version: expect.any(String),
        id: expect.any(String),
        declaredDomain: 'example.com',
        returnUrl: 'example.com',
        callbackUrl: 'example.com',
        request: {
          selectiveDisclosure: {
            disclosures: [{ type: 'authorizers' }]
          },
        },
        securityExclusions: {
          domainMatch: true,
        },
      }, expect.any(Function))
    })

    it('gets the correct keys', async () => {
      signatureProviderInterface = createSignatureProvider()
      const result = await signatureProviderInterface.getAvailableKeys()
      expect(result).toEqual(['publicKey'])
    })

    it('caches the keys', async () => {
      signatureProviderInterface = createSignatureProvider()
      await signatureProviderInterface.getAvailableKeys()
      expect(mockCacheKeys).toHaveBeenCalledWith(['publicKey'])
    })

    it('rejects an already pending request', (done) => {
      mockSendRequest = jest.fn()

      signatureProviderInterface = createSignatureProvider()
      signatureProviderInterface.getAvailableKeys().catch((error) => {
        expect(error).toEqual({
          contextualInfo: '',
          errorCode: ErrorCodes.unexpectedError,
          reason: expect.any(String)
        })
        done()
      })

      signatureProviderInterface.getAvailableKeys()
    })

    describe('if response has error', () => {
      beforeEach(() => {
        mockSendRequest.mockImplementation((requestEnvelope: SignatureProviderRequestEnvelope, handleResponse: any) => {
          handleResponse({
            id: requestEnvelope.id,
            response: {
              selectiveDisclosure: {
                error: {
                  reason: 'error',
                  contextualInfo: '',
                  errorCode: 'errorCode',
                }
              }
            }
          })
        })
      })

      it('rejects the promise', async () => {
        mockGetCachedKeys.mockReturnValue([])
        signatureProviderInterface = createSignatureProvider()
        let didThrow = true

        try {
          await signatureProviderInterface.getAvailableKeys()
          didThrow = false
        } catch (error) {
          expect(error).toEqual({
            reason: 'error',
            contextualInfo: '',
            errorCode: 'errorCode',
          })
        }

        expect(didThrow).toBe(true)
      })
    })
  })

  describe('sign', () => {
    let serializedTransaction: Uint8Array
    let abi: Uint8Array
    let signParams: SignParams

    beforeEach(() => {
      serializedTransaction = new Uint8Array([10, 10])
      abi = new Uint8Array([20, 20])

      signParams = {
        chainId: 'chainId1',
        requiredKeys: ['publicKey'],
        serializedTransaction,
        abis: [{
          accountName: 'account1',
          abi,
        }],
      }

      mockSendRequest.mockImplementation((requestEnvelope: SignatureProviderRequestEnvelope, handleResponse: any) => {
        handleResponse({
          id: requestEnvelope.id,
          response: {
            transactionSignature: {
              signedTransaction: {
                signatures: ['signature'],
                packedTrx: 'packedTrx',
                compression: 0,
                packedContextFreeData: '',
              },
            },
          },
        })
      })
    })

    it('sends the correct SignatureTransactionRequest', async () => {
      signatureProviderInterface = createSignatureProvider()
      await signatureProviderInterface.sign(signParams)

      expect(mockSendRequest).toHaveBeenCalledWith({
        version: expect.any(String),
        id: expect.any(String),
        declaredDomain: 'example.com',
        returnUrl: 'example.com',
        callbackUrl: 'example.com',
        request: {
          transactionSignature: {
            chainId: 'chainId1',
            publicKeys: ['publicKey'],
            abis: [{
              accountName: 'account1',
              abi: arrayToHex(abi),
            }],
            transaction: {
              signatures: [],
              compression: 0,
              packedContextFreeData: '',
              packedTrx: arrayToHex(serializedTransaction),
            },
          },
        },
        securityExclusions: {
          domainMatch: true,
        },
      }, expect.any(Function))
    })

    it('gets the correct transaction signatures', async () => {
      signatureProviderInterface = createSignatureProvider()
      const result = await signatureProviderInterface.sign(signParams)

      expect(result).toEqual({
        signatures: ['signature'],
        serializedTransaction: hexToArray('packedTrx'),
      })
    })

    it('rejects an already pending request', (done) => {
      mockSendRequest = jest.fn()

      signatureProviderInterface = createSignatureProvider()
      signatureProviderInterface.sign(signParams).catch((error) => {
        expect(error).toEqual({
          contextualInfo: '',
          errorCode: ErrorCodes.unexpectedError,
          reason: expect.any(String)
        })
        done()
      })

      signatureProviderInterface.sign(signParams)
    })

    describe('if response has error', () => {
      beforeEach(() => {
        mockSendRequest.mockImplementation((requestEnvelope: SignatureProviderRequestEnvelope, handleResponse: any) => {
          handleResponse({
            id: requestEnvelope.id,
            response: {
              transactionSignature: {
                error: {
                  reason: 'error',
                  contextualInfo: '',
                  errorCode: 'errorCode',
                }
              },
            },
          })
        })
      })

      it('rejects the promise', async () => {
        mockGetCachedKeys.mockReturnValue([])
        signatureProviderInterface = createSignatureProvider()
        let didThrow = true

        try {
          await signatureProviderInterface.getAvailableKeys()
          didThrow = false
        } catch (error) {
          expect(error).toEqual({
            reason: 'error',
            contextualInfo: '',
            errorCode: 'errorCode',
          })
        }

        expect(didThrow).toBe(true)
      })
    })
  })

  describe('an unknown response', () => {
    it('rejects the pending request', async () => {
      mockSendRequest.mockImplementation((requestEnvelope: SignatureProviderRequestEnvelope, handleResponse: any) => {
        handleResponse({
          id: requestEnvelope.id,
          response: {
            unknownResponse: 'Unknown response'
          },
        })
      })
      signatureProviderInterface = createSignatureProvider()
      let didThrow = true

      try {
        await signatureProviderInterface.getAvailableKeys()
        didThrow = false
      } catch (error) {
        expect(error).toEqual({
          contextualInfo: '',
          errorCode: ErrorCodes.unexpectedError,
          reason: expect.any(String)
        })
      }

      expect(didThrow).toBe(true)
    })
  })

  // Set up

  const createSignatureProvider = () => {
    const TestSignatureProviderInterface = createTestClass()

    return new TestSignatureProviderInterface({
      declaredDomain,
      returnUrl,
      callbackUrl,
      securityExclusions,
    })
  }

  const createTestClass = () => {
    return class extends SignatureProviderInterface {
      protected sendRequest(requestEnvelope: SignatureProviderRequestEnvelope): void {
        mockSendRequest(requestEnvelope, this.handleResponse)
      }

      protected getCachedKeys(): string[] {
        return mockGetCachedKeys()
      }

      protected setCachedKeys(keys: string[]): void {
        mockCacheKeys(keys)
      }

      public clearCachedKeys(): void {
        mockClearCachedKeys()
      }

      public cleanUp(): void {
        // This is here to make the linter happy
      }
    }
  }

})
