import { UploadedFile } from 'express-fileupload'
import { Autowired, Service } from 'lynx-express-mvc'
import md5 from 'md5'
import path from 'path'
import { STATIC_DIR } from '../common/env.const'
import { User } from '../models'
import { IM } from '../models/im.model'
import { OfflineMessageRepo, SessionRepo } from '../repository/im.repo'
import MQClient from './mqtt.client'
import UserService from './user.service'


@Service()
export default class IMService {

  @Autowired()
  private sessionRepo: SessionRepo

  @Autowired()
  private messageRepo: OfflineMessageRepo

  @Autowired()
  private userService: UserService

  @Autowired()
  private mqClient: MQClient

  private sessionPool: Map<string, IM.Session> = new Map()

  private messagePool: Map<string, Array<IM.Message>> = new Map()

  init() {
    this.mqClient.onIMMsgArrived = { thiz: this, handler: this.handleMsg }

    setInterval(async () => {
      this.messagePool.forEach((msgs, key) => {
        if (msgs.length > 0) {
          this.mqClient.sendMsg(`_im/${key}`, JSON.stringify(msgs))
          this.messagePool.set(key, [])
        }
      })
    }, 500)
  }

  async getSession(sid: string) {
    let result = await this.sessionRepo.get('sid', sid)
    delete result?._id
    delete result?._rev
    return result
  }

  async getSessions(sids: Array<string>) {
    return await this.sessionRepo.bulkGet(sids)
  }

  async saveSession(session: IM.Session, thumb?: UploadedFile) {
    if (thumb != null) {
      let ext = thumb.name.split('.').pop()
      await thumb.mv(path.join(STATIC_DIR, thumb.md5 + '.' + ext))
      session.thumb = `/_res/${thumb.md5}.${ext}`
    }

    let dbItem = await this.sessionRepo.get('sid', session.sid)
    if (dbItem) {
      session._id = dbItem._id
      await this.sessionRepo.save(session)
    } else {
      let id = await this.sessionRepo.add(session)
      session._id = id
    }
    return session
  }

  async getOfflineMessages(token: string) {
    let uid = await this.userService.token2uid(token)
    let msgs = await this.messageRepo.bulkGet(uid)
    msgs.forEach(it => {
      delete it._id
      delete it._rev
      delete it['to']
    })
    return msgs
  }

  /**
   * 
   * TODO：会话消息截流
   * 
   * 
   * @param message 
   * @param file 
   * @returns 
   */
  async send(message: IM.Message, token: string, file?: UploadedFile) {
    let session: IM.Session = this.sessionPool.get(message.sid)

    let uid = await this.userService.token2uid(token)
    let members = [uid, message.to]
    if (message.to && message.sid == md5(members.sort().join(';'))) {
      session = {
        sid: message.sid,
        members,
        type: IM.SessionType.P2P,
      }
    }

    if (session == null) {
      session = await this.sessionRepo.get('sid', message.sid)
    }

    session.timestamp = message.timestamp
    this.sessionPool.set(message.sid, session)

    if (file != null) {
      let ext = file.name.split('.').pop()
      await file.mv(path.join(STATIC_DIR, file.md5 + '.' + ext))
      message.content = `/_res/${file.md5}.${ext}`
    }

    if (session == null) { throw '当前会话已失效' }

    let offlineMsgs: Array<IM.Message> = []

    for (let i = 0; i < session.members.length; ++i) {
      let it = session.members[i]
      if (it == message.uid && message.type == IM.MessageType.TEXT) continue

      let status = await this.userService.userOnlineStatus(it)
      if (status == User.UserOnlineStatus.Online) {
        let msgs = this.messagePool.has(it) ? this.messagePool.get(it) : new Array()
        msgs.push(message)
        this.messagePool.set(it, msgs)
        // this.mqClient.sendMsg(`_im/${it}`, JSON.stringify([message]))
      } else {
        message.to = it
        offlineMsgs.push(message)
      }
    }
    await this.messageRepo.bulkDocs(offlineMsgs)

    return 'success'
  }

  async handleMsg(topic: string, message: IM.Message) {

  }
}