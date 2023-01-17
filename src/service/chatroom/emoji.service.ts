import { Autowired, Service } from 'lynx-express-mvc'

import ToolEmojis from './data/emoji.tools.json'
import BasicEmojis from './data/emoji.basic.json'
import VipEmojis from './data/emoji.vip.json'
import { EmojiRepo } from '../../repository/chatroom.repo'
import { Chatroom } from '../../models'

@Service()
export class EmojiService {

  @Autowired()
  emojiRepo: EmojiRepo

  async init() {
    // let emojis = [...BasicEmojis, ...ToolEmojis] as Array<Chatroom.Emoji>
    // let vipEmojis = VipEmojis as Array<Chatroom.Emoji>
    // await this.emojiRepo.importData(vipEmojis)
  }

  async getEmojis(roomId: string) {
    let emojis = await this.emojiRepo.getEmojis()

    let tools: Array<Chatroom.Emoji> = []
    let basic: Array<Chatroom.Emoji> = []
    let vips: Array<Chatroom.Emoji> = []

    emojis.forEach(it => {
      switch (it.type) {
        case Chatroom.EmojiType.Basic:
          basic.push(it)
          break
        case Chatroom.EmojiType.Tool:
          tools.push(it)
          break
        case Chatroom.EmojiType.VIP:
          vips.push(it)
          break
      }
    })

    tools.sort((a, b) => { return a.name < b.name ? -1 : 1 })

    return [
      { name: '工具', emojis: tools },
      { name: '常用', emojis: basic },
      { name: '会员专属', emojis: vips }
    ] as Array<Chatroom.EmojiGroup>
  }

  async getBasicEmojis() {
    return BasicEmojis
  }

  async getToolEmojis() {
    return ToolEmojis
  }
}