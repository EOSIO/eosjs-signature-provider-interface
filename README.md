# EOSJS Signature Provider Interface

An abstract class that implements the [EOSJS Signature Provider interface](https://github.com/EOSIO/eosjs/blob/68272dd4a52f6fca51a4ff668d3800eafe5a19e4/src/eosjs-api-interfaces.ts#L61), and provides helper methods for interacting with an authenticator using the [EOSIO Authentication Transport Protocol Specification](https://github.com/EOSIO/eosio-authentication-transport-protocol-spec).

## Overview

This base class handles creating the request envelopes with the expected data structure specified by the EOSIO Authentication Transport Protocol Specification. Concrete implementations can then create specific SignatureProviders for different platforms and environments by implementing the transport method used. These SignatureProviders can then be plugged into `eosjs` to enable communicating with an external authenticator. Full instructions for `eosjs` can be found [here](https://github.com/EOSIO/eosjs).

## Installation

```bash
yarn add @blockone/eosjs-signature-provider-interface
```

## Usage

### Example Concrete Implementation

The following rough example uses deep linking as the transport method:

```javascript
import {
  SignatureProviderInterface,
  SignatureProviderInterfaceParams,
  SignatureProviderRequestEnvelope,
  instanceOfResponseEnvelope,
  packEnvelope,
  unpackEnvelope,
} from '@blockone/eosjs-signature-provider-interface'

export class SignatureProvider extends SignatureProviderInterface {
  private cachedKeys: string[]

  constructor(params: SignatureProviderInterfaceParams) {
    super(params)
    window.onhashchange = this.onWindowHashChange
  }

  /**
   * An abstract method to be implemented by a subclass.
   * Here is where you send off a request on your transport method of choice.
   * This is a quick and dirty example of deep linking.
   */
  protected sendRequest(requestEnvelope: SignatureProviderRequestEnvelope): void {
    const packedRequestEnvelope = packEnvelope(requestEnvelope)
    const url = `example://request?payload=${packedRequestEnvelope}`
    window.open(url, 'system')
  }

  /**
   * An abstract method to be implemented by a subclass.
   * The base class will call this method to look for cached keys before calling `sendRequest`.
   * Return an empty array, null, or undefined if caching is not desired.
   */
  protected getCachedKeys(): string[] {
    return this.cachedKeys
  }

  /**
   * An abstract method to be implemented by a subclass.
   * The base class will call this method when it wants to cache keys.
   * Implement as a noop if caching is not desired.
   */
  protected setCachedKeys(keys: string[]): void {
    this.cachedKeys = keys
  }

  /**
   * An abstract method to be implemented by a subclass.
   * The base class will call this method when it wants to clear out cached keys.
   * Implement as a noop if caching is not desired.
   */
  public clearCachedKeys(): void {
    this.cachedKeys = null
  }

  private onWindowHashChange = () => {
    const response = window.location.hash.replace('#', '')
    const responseEnvelope = unpackEnvelope(response)

    if (!instanceOfResponseEnvelope(responseEnvelope)) { return }

    /**
     * `handleResponse` is implemented by the base class.
     * Call it to finish a pending request
     */
    this.handleResponse(responseEnvelope)
  }
}
```

## Links
- Implementations
  - [React Native](https://github.com/EOSIO/eosjs-react-native-signature-provider-interface)
  - [iOS Safari](https://github.com/EOSIO/eosjs-ios-browser-signature-provider-interface)
  - [Desktop Browser Extensions](https://github.com/EOSIO/eosjs-window-message-signature-provider-interface)
- [API Documentation](https://github.com/EOSIO/eosjs-signature-provider-interface/blob/develop/docs)
- [EOSIO Authentication Transport Protocol Specification](https://github.com/EOSIO/eosio-authentication-transport-protocol-spec)

## Contribution
Check out the [Contributing](https://github.com/EOSIO/eosjs-signature-provider-interface/blob/develop/CONTRIBUTING.md) guide and please adhere to the [Code of Conduct](https://github.com/EOSIO/eosjs-signature-provider-interface/blob/develop/CONTRIBUTING.md#conduct)

## License
[MIT licensed](https://github.com/EOSIO/eosjs-signature-provider-interface/blob/develop/LICENSE)
