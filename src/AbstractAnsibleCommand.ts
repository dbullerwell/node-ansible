import { spawn } from 'child_process'
import { EventEmitter } from 'events'

interface CommandOptions {
  cwd?: string | URL
}

export interface AbstractAnsibleCommandConfig {
  forks?: string
  verbose?: string
  user?: string
  inventory?: string
  privateKey?: string
  limit?: string
  su?: string
  sudo?: boolean
}

interface ExecPromise {
  code: number | null
  output: string
}

export type AbstractAnsibleCommandConfigKeys =
  keyof AbstractAnsibleCommandConfig

export abstract class AbstractAnsibleCommand extends EventEmitter {
  abstract commandName(): string
  abstract compileParams(): string[]
  abstract validate(): void
  abstract config: AbstractAnsibleCommandConfig

  async exec({ cwd }: CommandOptions = {}) {
    // Validate execution configuration
    this.validate()

    const processOptions = {
      ...(cwd !== undefined && { cwd }),
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
      },
    }

    // Make Ansible output unbuffered so the stdout and stderr `data` events
    // pickup output up more regularly
    let output = ''

    const returnedPromise = new Promise<ExecPromise>((resolve, reject) => {
      const child = spawn(
        this.commandName(),
        this.compileParams(),
        processOptions
      )

      child.stdout.on('data', (data) => {
        output += data.toString()
        this.emit('stdout', data)
      })

      child.stderr.on('data', (data) => {
        output += data.toString()
        this.emit('stderr', data)
      })

      child.on('close', (code) => {
        this.emit('close', code)
        resolve({ code: code, output: output })
      })

      child.on('exit', function (code) {
        if (code !== 0) {
          reject(new Error(output))
        }
      })
    })

    return returnedPromise
  }

  forks(forks: string) {
    this.config.forks = forks
    return this
  }

  verbose(level: string) {
    this.config.verbose = level
    return this
  }

  user(user: string) {
    this.config.user = user
    return this
  }

  inventory(inventory: string) {
    this.config.inventory = inventory
    return this
  }

  privateKey(privateKey: string) {
    this.config.privateKey = privateKey
    return this
  }

  limit(limit: string) {
    this.config.limit = limit
    return this
  }

  su(su: string) {
    this.config.su = su
    return this
  }

  asSudo() {
    this.config.sudo = true
    return this
  }

  addParam(
    commandParams: string[],
    param: AbstractAnsibleCommandConfigKeys,
    flag: string
  ) {
    if (this.config[param]) {
      return this.addParamValue(commandParams, this.config[param]!, flag)
    }
    return commandParams
  }

  addParamValue(
    commandParams: string[],
    value: string | boolean,
    flag: string
  ) {
    commandParams = commandParams.concat('-' + flag, String(value))
    return commandParams
  }

  addPathParam(
    commandParams: string[],
    param: AbstractAnsibleCommandConfigKeys,
    flag: string
  ) {
    if (this.config[param]) {
      return this.addParamValue(
        commandParams,
        '"' + this.config[param] + '"',
        flag
      )
    }
    return commandParams
  }

  addVerbose(commandParams: string[]) {
    if (this.config.verbose) {
      commandParams = commandParams.concat('-' + this.config.verbose)
    }
    return commandParams
  }

  addSudo(commandParams: string[]) {
    if (this.config.sudo) {
      commandParams = commandParams.concat('-s')
    }
    return commandParams
  }

  commonCompileParams(commandParams: string[]) {
    commandParams = this.addParam(commandParams, 'forks', 'f')
    commandParams = this.addParam(commandParams, 'user', 'u')
    commandParams = this.addParam(commandParams, 'inventory', 'i')
    commandParams = this.addParam(commandParams, 'limit', 'l')
    commandParams = this.addParam(commandParams, 'su', 'U')
    commandParams = this.addPathParam(
      commandParams,
      'privateKey',
      '-private-key'
    )
    commandParams = this.addVerbose(commandParams)
    commandParams = this.addSudo(commandParams)

    return commandParams
  }
}
