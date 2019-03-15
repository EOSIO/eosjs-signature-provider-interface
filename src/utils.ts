import { instanceOfRequestEnvelope, instanceOfResponseEnvelope } from './instanceOf'
import {
  EnvelopeDataType,
  SignatureProviderRequestEnvelope,
  SignatureProviderResponseEnvelope,
} from './interfaces'

export type SignatureProviderEnvelope = SignatureProviderRequestEnvelope | SignatureProviderResponseEnvelope

export const packEnvelope = (envelope: SignatureProviderEnvelope): string => {
  return hexEncode(JSON.stringify(envelope))
}

export const unpackEnvelope = <TEnvelope extends SignatureProviderEnvelope>(packedEnvelope: string): TEnvelope => {
  return JSON.parse(hexDecode(packedEnvelope))
}

export const envelopeDataType = (envelope: SignatureProviderEnvelope): EnvelopeDataType => {
  if (!instanceOfRequestEnvelope(envelope) && !instanceOfResponseEnvelope(envelope)) { return null }

  const data = instanceOfRequestEnvelope(envelope) ? envelope.request : envelope.response
  if (EnvelopeDataType.SELECTIVE_DISCLOSURE in data) {
    return EnvelopeDataType.SELECTIVE_DISCLOSURE
  } else if (EnvelopeDataType.TRANSACTION_SIGNATURE in data) {
    return EnvelopeDataType.TRANSACTION_SIGNATURE
  }
  return null
}

export const arrayToHex = (data: Uint8Array): string => {
  return data.reduce((result, x) => result + (`00${x.toString(16)}`).slice(-2), '')
}

export const hexToArray = (hex: string): Uint8Array => {
  const l = hex.length / 2
  const result = new Uint8Array(l)
  for (let i = 0; i < l; i++) {
    result[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return result
}

export const hexEncode = (str: string) => {
  if (typeof str !== 'string') { return null }
  return Buffer.from(str).toString('hex')
}

export const hexDecode = (hex: string) => {
  if (typeof hex !== 'string') { return null }
  return Buffer.from(hex, 'hex').toString()
}
