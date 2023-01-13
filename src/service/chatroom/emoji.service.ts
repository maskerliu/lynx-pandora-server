import { Autowired, Service } from 'lynx-express-mvc'

import ToolEmojis from './data/emoji.tools.json'
import BasicEmojis from './data/emoji.basic.json'
import { EmojiRepo } from '../../repository/chatroom.repo'
import { Chatroom } from '../../models'

@Service()
export class EmojiService {

  @Autowired()
  emojiRepo: EmojiRepo

  async init() {
    let emojis = [...BasicEmojis, ...ToolEmojis] as Array<Chatroom.Emoji>
    // await this.emojiRepo.importData(emojis)
  }

  async getEmojis(roomId: string) {
    let emojis = await this.emojiRepo.getEmojis()

    let tools: Array<Chatroom.Emoji> = []
    let basic: Array<Chatroom.Emoji> = []

    emojis.forEach(it => {
      switch (it.type) {
        case Chatroom.EmojiType.Basic:
          basic.push(it)
          break
        case Chatroom.EmojiType.Tool:
          tools.push(it)
          break
      }
    })

    return [{ name: '工具', emojis: tools }, { name: '常用', emojis: basic }] as Array<Chatroom.EmojiGroup>
  }

  async getBasicEmojis() {
    return BasicEmojis
  }

  async getToolEmojis() {
    return ToolEmojis
  }
}