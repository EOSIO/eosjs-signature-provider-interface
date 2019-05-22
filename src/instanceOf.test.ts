import * as data from './__mocks__/data.mock'

import * as instanceOf from './instanceOf'
import {
  AppManifest,
  AppMetadata,
  ChainManifest,
  Manifest,
  SignatureProviderRequest,
  SignatureProviderRequestEnvelope,
  SignatureProviderResponse,
  SignatureProviderResponseEnvelope,
} from './interfaces'

const clone = (obj: any) => JSON.parse(JSON.stringify(obj))

describe('instanceOf', () => {
  describe('instanceOfRequestEnvelope', () => {
    let requestEnvelope: SignatureProviderRequestEnvelope

    beforeEach(() => {
      jest.resetAllMocks()

      requestEnvelope = clone(data.transactionSignatureRequestEnvelope)
    })

    it('returns true for a valid transactionSignature RequestEnvelope configuration', () => {
      expect(instanceOf.instanceOfRequestEnvelope(requestEnvelope)).toBe(true)
    })

    it('returns true for a valid selectiveDisclosure RequestEnvelope configuration', () => {
      delete requestEnvelope.request.transactionSignature
      requestEnvelope.request.selectiveDisclosure = {} as any
      expect(instanceOf.instanceOfRequestEnvelope(requestEnvelope)).toBe(true)
    })

    it('returns false for an invalid RequestEnvelope configuration that is not an object', () => {
      expect(instanceOf.instanceOfRequestEnvelope('not an object')).toBe(false)
    })

    it('returns false for an invalid RequestEnvelope configuration with missing id', () => {
      delete requestEnvelope.id
      expect(instanceOf.instanceOfRequestEnvelope(requestEnvelope)).toBe(false)
    })

    it('returns false for an invalid RequestEnvelope configuration with missing declaredDomain', () => {
      delete requestEnvelope.declaredDomain
      expect(instanceOf.instanceOfRequestEnvelope(requestEnvelope)).toBe(false)
    })

    it('returns false for an invalid RequestEnvelope configuration with missing returnUrl', () => {
      delete requestEnvelope.returnUrl
      expect(instanceOf.instanceOfRequestEnvelope(requestEnvelope)).toBe(false)
    })

    it('returns false for an invalid RequestEnvelope configuration with missing request', () => {
      delete requestEnvelope.request
      expect(instanceOf.instanceOfRequestEnvelope(requestEnvelope)).toBe(false)
    })

    it('returns false for an invalid RequestEnvelope configuration with missing request type', () => {
      delete requestEnvelope.request.transactionSignature
      expect(instanceOf.instanceOfRequestEnvelope(requestEnvelope)).toBe(false)
    })
  })

  describe('instanceOfTransactionSignatureRequest', () => {
    let request: SignatureProviderRequest

    beforeEach(() => {
      request = clone(data.transactionSignatureRequestEnvelope).request
    })

    it('returns true for a valid transactionSignature request', () => {
      expect(instanceOf.instanceOfTransactionSignatureRequest(request)).toBe(true)
    })

    it('returns false for a request that is not a transactionSignature type', () => {
      delete request.transactionSignature
      request.selectiveDisclosure = {} as any
      expect(instanceOf.instanceOfTransactionSignatureRequest(request)).toBe(false)
    })
  })

  describe('instanceOfTransactionSignatureRequest', () => {
    let request: SignatureProviderRequest

    beforeEach(() => {
      request = clone(data.transactionSignatureRequestEnvelope).request
      delete request.transactionSignature
      request.selectiveDisclosure = {} as any
    })

    it('returns true for a valid selectiveDisclosure request', () => {
      expect(instanceOf.instanceOfSelectiveDisclosureRequest(request)).toBe(true)
    })

    it('returns false for a request that is not a selectiveDisclosure type', () => {
      delete request.selectiveDisclosure
      request.transactionSignature = {} as any
      expect(instanceOf.instanceOfSelectiveDisclosureRequest(request)).toBe(false)
    })
  })

  describe('instanceOfResponseEnvelope', () => {
    let responseEnvelope: SignatureProviderResponseEnvelope

    beforeEach(() => {
      responseEnvelope = clone(data.transactionSignatureResponseEnvelope)
    })

    it('returns true for a valid transactionSignature ResponseEnvelope configuration', () => {
      expect(instanceOf.instanceOfResponseEnvelope(responseEnvelope)).toBe(true)
    })

    it('returns true for a valid selectiveDisclosure ResponseEnvelope configuration', () => {
      delete responseEnvelope.response.transactionSignature
      responseEnvelope.response.selectiveDisclosure = {} as any
      expect(instanceOf.instanceOfResponseEnvelope(responseEnvelope)).toBe(true)
    })

    it('returns false for an invalid ResponseEnvelope configuration that is not an object', () => {
      expect(instanceOf.instanceOfResponseEnvelope('not an object')).toBe(false)
    })

    it('returns false for an invalid ResponseEnvelope configuration with missing id', () => {
      delete responseEnvelope.id
      expect(instanceOf.instanceOfResponseEnvelope(responseEnvelope)).toBe(false)
    })

    it('returns false for an invalid ResponseEnvelope configuration with missing response', () => {
      delete responseEnvelope.response
      expect(instanceOf.instanceOfResponseEnvelope(responseEnvelope)).toBe(false)
    })

    it('returns false for an invalid ResponseEnvelope configuration with missing response type', () => {
      delete responseEnvelope.response.transactionSignature
      expect(instanceOf.instanceOfResponseEnvelope(responseEnvelope)).toBe(false)
    })
  })

  describe('instanceOfSelectiveDisclosureResponse', () => {
    let response: SignatureProviderResponse

    beforeEach(() => {
      response = clone(data.transactionSignatureResponseEnvelope).response
      delete response.transactionSignature
      response.selectiveDisclosure = {} as any
    })

    it('returns true for a valid transactionSignature response', () => {
      expect(instanceOf.instanceOfSelectiveDisclosureResponse(response)).toBe(true)
    })

    it('returns false for a response that is not a transactionSignature type', () => {
      delete response.selectiveDisclosure
      response.transactionSignature = {} as any
      expect(instanceOf.instanceOfSelectiveDisclosureResponse(response)).toBe(false)
    })
  })

  describe('instanceOfTransactionSignatureResponse', () => {
    let response: SignatureProviderResponse

    beforeEach(() => {
      response = clone(data.transactionSignatureResponseEnvelope).response
    })

    it('returns true for a valid selectiveDisclosure response', () => {
      expect(instanceOf.instanceOfTransactionSignatureResponse(response)).toBe(true)
    })

    it('returns false for a response that is not a selectiveDisclosure type', () => {
      delete response.transactionSignature
      response.selectiveDisclosure = {} as any
      expect(instanceOf.instanceOfTransactionSignatureResponse(response)).toBe(false)
    })
  })

  describe('instanceOfAppManifest', () => {
    let appManifest: AppManifest

    beforeEach(() => {
      appManifest = clone(data.appManifest)
    })

    it('returns true for a valid AppManifest configuration', () => {
      expect(instanceOf.instanceOfAppManifest(appManifest)).toBe(true)
    })

    it('returns false for a valid AppManifest configuration with missing spec_version', () => {
      delete appManifest.spec_version
      expect(instanceOf.instanceOfAppManifest(appManifest)).toBe(false)
    })

    it('returns false for a valid AppManifest configuration with missing manifests', () => {
      delete appManifest.manifests
      expect(instanceOf.instanceOfAppManifest(appManifest)).toBe(false)
    })

    it('checks if chain manifests are valid', () => {
      const spy = jest.spyOn(instanceOf, 'instanceOfChainManifest')
      instanceOf.instanceOfAppManifest(appManifest)
      expect(spy).toHaveBeenCalledTimes(appManifest.manifests.length)
      expect(spy).toHaveBeenCalledWith(appManifest.manifests[0])
      expect(spy).toHaveBeenCalledWith(appManifest.manifests[1])
    })
  })

  describe('instanceOfChainManifest', () => {
    let chainManifest: ChainManifest

    beforeEach(() => {
      chainManifest = clone(data.appManifest.manifests[0])
    })

    it('returns true for a valid ChainManifest configuration', () => {
      expect(instanceOf.instanceOfChainManifest(chainManifest)).toBe(true)
    })

    it('returns false for an invalid ChainManifest configuration with missing required chainId', () => {
      delete chainManifest.chainId
      expect(instanceOf.instanceOfChainManifest(chainManifest)).toBe(false)
    })

    it('returns false for an invalid AppManifest configuration with missing required manifest', () => {
      delete chainManifest.manifest
      expect(instanceOf.instanceOfChainManifest(chainManifest)).toBe(false)
    })

    it('checks if manifest is valid', () => {
      const spy = jest.spyOn(instanceOf, 'instanceOfManifest')
      instanceOf.instanceOfChainManifest(chainManifest)
      expect(spy).toHaveBeenCalledWith(chainManifest.manifest)
    })
  })

  describe('instanceOfManifest', () => {
    let manifest: Manifest

    beforeEach(() => {
      manifest = clone(data.appManifest.manifests[0].manifest)
    })

    it('returns true for a valid Manifest configuration', () => {
      expect(instanceOf.instanceOfManifest(manifest)).toBe(true)
    })

    it('returns false for an invalid Manifest configuration with missing required account', () => {
      delete manifest.account
      expect(instanceOf.instanceOfManifest(manifest)).toBe(false)
    })

    it('returns false for an invalid Manifest configuration with missing required domain', () => {
      delete manifest.domain
      expect(instanceOf.instanceOfManifest(manifest)).toBe(false)
    })

    it('returns false for an invalid Manifest configuration with missing required appmeta', () => {
      delete manifest.appmeta
      expect(instanceOf.instanceOfManifest(manifest)).toBe(false)
    })

    it('returns false for an invalid Manifest configuration with missing required whitelist', () => {
      delete manifest.whitelist
      expect(instanceOf.instanceOfManifest(manifest)).toBe(false)
    })

    it('returns false for an invalid Manifest configuration with invalid whitelist object', () => {
      manifest.whitelist[0] = { invalid: 'invalid' } as any
      expect(instanceOf.instanceOfManifest(manifest)).toBe(false)
    })
  })

  describe('instanceOfAppMetadata', () => {
    let appMetadata: AppMetadata

    beforeEach(() => {
      appMetadata = clone(data.appMetadata)
    })

    it('returns true for a valid AppMetadata configuration', () => {
      expect(instanceOf.instanceOfAppMetadata(appMetadata)).toBe(true)
    })

    it('returns false for a valid AppManifest configuration with missing spec_version', () => {
      delete appMetadata.spec_version
      expect(instanceOf.instanceOfAppMetadata(appMetadata)).toBe(false)
    })

    it('returns false for an invalid AppMetadata configuration with missing required name', () => {
      delete appMetadata.name
      expect(instanceOf.instanceOfAppMetadata(appMetadata)).toBe(false)
    })

    it('returns false for an invalid AppMetadata configuration with missing required shortname', () => {
      delete appMetadata.shortname
      expect(instanceOf.instanceOfAppMetadata(appMetadata)).toBe(false)
    })

    it('returns false for an invalid AppMetadata configuration with missing required scope', () => {
      delete appMetadata.scope
      expect(instanceOf.instanceOfAppMetadata(appMetadata)).toBe(false)
    })

    it('returns false for an invalid AppMetadata configuration with missing required apphome', () => {
      delete appMetadata.apphome
      expect(instanceOf.instanceOfAppMetadata(appMetadata)).toBe(false)
    })

    it('returns false for an invalid AppMetadata configuration with missing required icon', () => {
      delete appMetadata.icon
      expect(instanceOf.instanceOfAppMetadata(appMetadata)).toBe(false)
    })

    it('returns false for an invalid AppMetadata configuration with missing required chains', () => {
      delete appMetadata.chains
      expect(instanceOf.instanceOfAppMetadata(appMetadata)).toBe(false)
    })

    it('returns false for an invalid AppMetadata configuration with an invalid empty chains array', () => {
      appMetadata.chains = []
      expect(instanceOf.instanceOfAppMetadata(appMetadata)).toBe(false)
    })

    it('returns false for an invalid AppMetadata configuration with an invalid chain info missing chainId', () => {
      delete appMetadata.chains[0].chainId
      expect(instanceOf.instanceOfAppMetadata(appMetadata)).toBe(false)
    })

    it('returns false for an invalid AppMetadata configuration with an invalid chain info missing chainName', () => {
      delete appMetadata.chains[0].chainName
      expect(instanceOf.instanceOfAppMetadata(appMetadata)).toBe(false)
    })

    it('returns false for an invalid AppMetadata configuration with an invalid chain info missing icon', () => {
      delete appMetadata.chains[0].icon
      expect(instanceOf.instanceOfAppMetadata(appMetadata)).toBe(false)
    })
  })
})
