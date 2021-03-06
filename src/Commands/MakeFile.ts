import Command from "../Command";
import { prompt } from "enquirer";
import fs from "fs";
import { Logger } from "@discord-architect/core";
import path from "path";
import { ClientEvents } from 'discord.js'
import Events from '../Settings/Events'
import Middlewares from '../Settings/Middlewares'

type Actions = {
  Event: () => Promise<void>,
  Command: () => Promise<void>,
  Middleware: () => Promise<void>
  Prerequisite: () => Promise<void>
}

export default class MakeFile<K extends keyof ClientEvents> extends Command {
  constructor () {
    super('make:file');
  }

  public async run (): Promise<void> {
    try {
      const type = (await this.choiceType()).type
      await this.dispatchType(type)
    } catch {
    }
  }

  private async dispatchType (eventType: string) {
    const actions: Actions = {
      Event: async () => this.initializeEvent(),
      Command: async () => this.initializeCommand(),
      Middleware: async () => this.initializeMiddleware(),
      Prerequisite: async () => this.initializePrerequisite()
    }

    // @ts-ignore
    actions[eventType]()
  }

  private async choiceType (): Promise<{ type: string }> {
    return await prompt([
      {
        name: 'type',
        message: 'What type of file do you want ?',
        type: 'select',
        choices: [
          'Command',
          'Event',
          'Prerequisite',
          'Middleware'
        ]
      }
    ])
  }

  private async choiceFilename (): Promise<{ filename: string } | undefined> {
    try {
      return await prompt({
        name: 'filename',
        message: 'What do you want to name it ?',
        type: 'input',
        validate (value: string): boolean | Promise<boolean> | string | Promise<string> {
          return !/^\w+(\/\w+)*$/gm.test(value)
            ? 'Please format like MyFile or Folder/MyFile'
            : true
        }
      })
    } catch {
    }
  }

  private async choiceEvent (): Promise<{ event: K } | undefined> {
    try {
      return await prompt({
        name: 'event',
        message: 'Which discord.js event do you want to use ?',
        type: 'autocomplete',
        choices: Events,
      })
    } catch {
    }
  }

  private async choiceMiddleware (): Promise<{ middleware: string } | undefined> {
    try {
      return await prompt({
        name: 'middleware',
        message: 'Which middleware do you want to use ?',
        type: 'autocomplete',
        choices: Middlewares,
      })
    } catch {
    }
  }

  private async choicePrerequisite (): Promise<{ prerequisite: string } | undefined> {
    try {
      return await prompt({
        name: 'prerequisite',
        message: 'Define the validation rule for this prerequisite',
        type: 'input'
      })
    } catch {
    }
  }

  private async initializeEvent (): Promise<void> {
    const event = (await this.choiceEvent())!.event
    const filename = (await this.choiceFilename())!.filename

    if (event && filename) {
      await this.makeFile('Event', filename, { event })
    }
  }

  private async initializeCommand (): Promise<void> {
    const filename = (await this.choiceFilename())!.filename

    if (filename) {
      await this.makeFile('Command', filename)
    }

  }

  private async initializeMiddleware (): Promise<void> {
    const middleware = (await this.choiceMiddleware())!.middleware
    const filename = (await this.choiceFilename())!.filename

    if (middleware && filename) {
      await this.makeFile('Middleware', filename, { middleware })
    }
  }

  private async initializePrerequisite (): Promise<void> {
    const prerequisite = (await this.choicePrerequisite())!.prerequisite
    const filename = (await this.choiceFilename())!.filename

    if (prerequisite && filename) {
      await this.makeFile('Prerequisite', filename, { prerequisite })
    }
  }

  private async makeFile (type: string, targetLocation: string, fileOptions?: { event?: K, middleware?: string, prerequisite?: string }): Promise<void> {
    const location = path.parse(targetLocation)
    const templateDir = path.join(__dirname, '..', '..', 'templates', type)
    const templateFile = await fs.promises.readFile(templateDir, { encoding: 'utf-8' })
    const targetFile = path.join(process.cwd(), 'src', location.dir, `${location.name}.ts`)
    const filenameUpper = location.name.charAt(0).toUpperCase() + location.name.slice(1)

    await fs.promises.mkdir(path.join(process.cwd(), 'src', location.dir), { recursive: true })

    const fileData = templateFile
      .replace(/\$className/g, filenameUpper)
      .replace('$tag', location.name.toLowerCase())
      .replace('$event', fileOptions?.event!)
      .replace('$middleware', fileOptions?.middleware!)
      .replace('$prerequisite', fileOptions?.prerequisite!)

    await fs.promises.writeFile(targetFile, fileData)

    Logger.sendCustom('success', `File was created : ${targetFile.replace(/\\/g, '\\\\')}`)
  }
}