import {
  AbstractAnsibleCommand,
  AbstractAnsibleCommandConfig,
} from './AbstractAnsibleCommand'
import { formatArgs } from './utils'

interface AdHocConfig extends AbstractAnsibleCommandConfig {
  module?: string
  args?: Record<string, string>
  freeform?: string
  hosts?: string
}

export class AdHoc extends AbstractAnsibleCommand {
  config: AdHocConfig = {}
  commandName() {
    return 'ansible'
  }

  module(module: string) {
    this.config.module = module
    return this
  }

  args(args: string | Record<string, string>, freeform?: string) {
    if (typeof args === 'string') {
      this.config.freeform = args
    } else {
      this.config.args = args
      this.config.freeform = freeform
    }

    return this
  }

  hosts(hosts: string) {
    this.config.hosts = hosts
    return this
  }

  validate() {
    const errors = []
    const config = this.config

    // Hosts are mandatory
    if (config.hosts === undefined || config.hosts === null) {
      errors.push('"hosts" must be specified')
    }

    // Module is mandatory
    if (config.module === undefined || config.module === null) {
      errors.push('"module" must be specified')
    }

    if (errors.length > 0) {
      throw new Error(`AdHoc validation failed due to: ${errors}`)
    }
  }

  compileParams() {
    let result = [this.config.hosts!, '-m', this.config.module!]

    if (this.config.args !== undefined || this.config.freeform !== undefined) {
      const args = formatArgs(this.config.args, this.config.freeform)
      if (args !== null) {
        result = result.concat('-a', args)
      }
    }

    result = this.commonCompileParams(result)

    return result
  }
}
