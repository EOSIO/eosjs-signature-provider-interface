import { EnvelopeDataType, SignatureProviderResponseEnvelope } from './interfaces'
import * as utils from './utils'

describe('Utils', () => {
  let arrayToHexString: string
  let uint8EncodedString: Uint8Array
  let hexEncodedString: string
  let envelope: SignatureProviderResponseEnvelope
  let hexEncodedEnvelope: string

  beforeEach(() => {
    // Encoded text is "Modern major general"
    arrayToHexString = '4d6f6465726e204d616a6f722047656e6572616c'
    uint8EncodedString = Uint8Array.from([
      77, 111, 100, 101, 114, 110, 32, 77, 97, 106, 111, 114, 32, 71, 101, 110, 101, 114, 97, 108,
    ])
    hexEncodedString = '4d6f6465726e206d616a6f722067656e6572616c'
    envelope = {
      id: 'requestId',
      response: {}
    }
    hexEncodedEnvelope = '7b226964223a22726571756573744964222c22726573706f6e7365223a7b7d7d'
  })

  describe('packEnvelope', () => {
    it('returns hex encoded string of the envelope', () => {
      expect(utils.packEnvelope(envelope)).toEqual(hexEncodedEnvelope)
    })
  })

  describe('unpackEnvelope', () => {
    it('returns parsed envelope', () => {
      expect(utils.unpackEnvelope(hexEncodedEnvelope)).toEqual(envelope)
    })
  })

  describe('envelopeDataType', () => {
    it(`returns correct ${EnvelopeDataType.SELECTIVE_DISCLOSURE} type`, () => {
      envelope.response = { selectiveDisclosure: {} }
      expect(utils.envelopeDataType(envelope)).toEqual(EnvelopeDataType.SELECTIVE_DISCLOSURE)
    })

    it(`returns correct ${EnvelopeDataType.TRANSACTION_SIGNATURE} type`, () => {
      envelope.response = { transactionSignature: {} as any }
      expect(utils.envelopeDataType(envelope)).toEqual(EnvelopeDataType.TRANSACTION_SIGNATURE)
    })

    it(`returns 'null' for no type`, () => {
      expect(utils.envelopeDataType(envelope)).toEqual(null)
    })

    it(`returns 'null' for invalid envelope`, () => {
      const invalidEnvelope = { invalid: 'invalid' } as any
      expect(utils.envelopeDataType(invalidEnvelope)).toEqual(null)
    })
  })

  describe('arrayToHex', () => {
    it('returns the uint8array converted to hex', async () => {
      expect(utils.arrayToHex(uint8EncodedString)).toEqual(arrayToHexString)
    })
  })

  describe('hexToArray', () => {
    it('returns the hex string converted to uint8array', async () => {
      expect(utils.hexToArray(arrayToHexString)).toEqual(uint8EncodedString)
    })
  })

  describe('hexEncode', () => {
    it('returns the string encoded to hex', () => {
      expect(utils.hexEncode('Modern major general')).toEqual(hexEncodedString)
    })
  })

  describe('hexDecode', () => {
    it('returns the decoded hex string', () => {
      expect(utils.hexDecode(hexEncodedString)).toEqual('Modern major general')
    })
  })
})
