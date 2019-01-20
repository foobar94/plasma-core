const utils = require('plasma-utils')

const DefaultDBProvider = require('./services/db').DefaultDBProvider
const DefaultOperatorProvider = require('./services/operator')
  .DefaultOperatorProvider
const DefaultWalletProvider = require('./services/wallet').DefaultWalletProvider
const JSONRPCService = require('./services/jsonrpc/jsonrpc-service')
const ChainService = require('./services/chain/chain-service')
const RangeManagerService = require('./services/chain/range-manager-service')
const ETHService = require('./services/eth/eth-service')
const SyncService = require('./services/sync-service')

const defaultOptions = {
  logger: new utils.logging.DefaultLogger(),
  dbProvider: DefaultDBProvider,
  operatorProvider: DefaultOperatorProvider,
  walletProvider: DefaultWalletProvider
}

/**
 * Main class that runs and manages all services.
 */
class Plasma {
  constructor (options = {}) {
    this.options = Object.assign({}, defaultOptions, options)
    this.services = {}
    this.logger = options.logger

    this._registerServices()
  }

  /**
   * Registers a single service to the app.
   * @param {*} Service Class of the service to register.
   * @param {*} options Any additional options.
   */
  registerService (Service, options = {}) {
    const appInject = { app: this }
    const service = new Service({ ...options, ...appInject })
    this.services[service.name] = service
  }

  /**
   * Registers all services.
   */
  _registerServices () {
    const services = [
      { type: this.options.dbProvider },
      { type: ChainService },
      { type: RangeManagerService },
      { type: JSONRPCService },
      { type: this.options.operatorProvider },
      { type: this.options.walletProvider },
      { type: ETHService },
      { type: SyncService }
    ]

    for (let service of services) {
      this.registerService(service.type, service.options)
    }
  }

  /**
   * Starts a single service.
   * @param {*} name Name of the service to start.
   */
  startService (name) {
    let service = this.services[name]
    service
      .start()
      .then(() => {
        this.logger.log(`${service.name}: OK`)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  /**
   * Stops a single service.
   * @param {*} name Name of the service to stop.
   */
  stopService (name) {
    let service = this.services[name]
    service
      .stop()
      .then(() => {
        this.logger.log(`${service.name}: OK`)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  /**
   * Starts all available services.
   */
  startServices () {
    for (let service in this.services) {
      this.startService(service)
    }
  }

  /**
   * Stops all available services.
   */
  stopServices () {
    for (let service in this.services) {
      this.stopService(service)
    }
  }
}

module.exports = Plasma
