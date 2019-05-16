# EOSJS Signature Provider Interface

An abstract class that implements the [EOSJS Signature Provider interface](https://github.com/EOSIO/eosjs/blob/68272dd4a52f6fca51a4ff668d3800eafe5a19e4/src/eosjs-api-interfaces.ts#L61), and provides helper methods for interacting with an authenticator using the [EOSIO Authentication Transport Protocol Specification](https://github.com/EOSIO/eosio-authentication-transport-protocol-spec).

![EOSIO Labs](https://img.shields.io/badge/EOSIO-Labs-5cb3ff.svg)

## About EOSIO Labs

EOSIO Labs repositories are experimental.  Developers in the community are encouraged to use EOSIO Labs repositories as the basis for code and concepts to incorporate into their applications. Community members are also welcome to contribute and further develop these repositories. Since these repositories are not supported by Block.one, we may not provide responses to issue reports, pull requests, updates to functionality, or other requests from the community, and we encourage the community to take responsibility for these.

## Overview

This base class handles creating the request envelopes with the expected data structure specified by the EOSIO Authentication Transport Protocol Specification. Concrete implementations can then create specific SignatureProviders for different platforms and environments by implementing the transport method used. These SignatureProviders can then be plugged into `eosjs` to enable communicating with an external authenticator. Full instructions for `eosjs` can be found [here](https://github.com/EOSIO/eosjs).

## Installation

```bash
yarn add eosjs-signature-provider-interface
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
} from 'eosjs-signature-provider-interface'

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
- [EOSIO Authentication Transport Protocol Specification](https://github.com/EOSIO/eosio-authentication-transport-protocol-spec)

## Contribution
Check out the [Contributing](./CONTRIBUTING.md) guide and please adhere to the [Code of Conduct](./CONTRIBUTING.md#conduct)

## License
[MIT licensed](./LICENSE)

## Important

See LICENSE for copyright and license terms.  Block.one makes its contribution on a voluntary basis as a member of the EOSIO community and is not responsible for ensuring the overall performance of the software or any related applications.  We make no representation, warranty, guarantee or undertaking in respect of the software or any related documentation, whether expressed or implied, including but not limited to the warranties or merchantability, fitness for a particular purpose and noninfringement. In no event shall we be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or documentation or the use or other dealings in the software or documentation.  Any test results or performance figures are indicative and will not reflect performance under all conditions.  Any reference to any third party or third-party product, service or other resource is not an endorsement or recommendation by Block.one.  We are not responsible, and disclaim any and all responsibility and liability, for your use of or reliance on any of these resources. Third-party resources may be updated, changed or terminated at any time, so the information here may be out of date or inaccurate.

Wallets and related components are complex software that require the highest levels of security.  If incorrectly built or used, they may compromise users’ private keys and digital assets. Wallet applications and related components should undergo thorough security evaluations before being used.  Only experienced developers should work with this software.
