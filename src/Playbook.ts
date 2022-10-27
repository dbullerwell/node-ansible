import {
  AbstractAnsibleCommand,
  AbstractAnsibleCommandConfig,
} from './AbstractAnsibleCommand'

interface PlaybookConfig extends AbstractAnsibleCommandConfig {
  askPass?: boolean
  askSudoPass?: boolean
  playbook?: string
  variables?: string
  tags?: string[]
  skipTags?: string[]
}

export class Playbook extends AbstractAnsibleCommand {
  config: PlaybookConfig = {}

  commandName(): string {
    return 'ansible-playbook'
  }

  askPass() {
    this.config.askPass = true
    return this
  }

  askSudoPass() {
    this.config.askSudoPass = true
    return this
  }

  playbook(playbook: string) {
    this.config.playbook = playbook
    return this
  }

  variables(variables: string) {
    this.config.variables = variables
    return this
  }

  tags(tags: string[]) {
    this.config.tags = tags
    return this
  }

  skipTags(skipTags: string[]) {
    this.config.skipTags = skipTags
    return this
  }

  addTags(tags: string[]) {
    return '--tags=' + tags.join(',')
  }

  addSkipTags(skipTags: string[]) {
    return '--skip-tags=' + skipTags.join(',')
  }

  validate() {
    // Playbook is mandatory
    if (this.config.playbook === undefined || this.config.playbook === null) {
      throw new Error(
        `Playbook validation failed due to: 'playbook' must be specified`
      )
    }
  }

  compileParams() {
    let result = [this.config.playbook + '.yml']

    if (this.config.variables) {
      const args = JSON.stringify(this.config.variables)
      result = result.concat('-e', args)
    }

    if (this.config.askPass) {
      result = result.concat('--ask-pass')
    }

    if (this.config.askSudoPass) {
      result = result.concat('--ask-sudo-pass')
    }

    if (this.config.tags) {
      const tags = this.addTags(this.config.tags)
      result = result.concat(tags)
    }

    if (this.config.skipTags) {
      const skipTags = this.addSkipTags(this.config.skipTags)
      result = result.concat(skipTags)
    }

    result = this.commonCompileParams(result)

    return result
  }
}
