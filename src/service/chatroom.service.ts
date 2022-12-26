import { Autowired, Service } from 'lynx-express-mvc'
import { Chatroom } from '../models'
import { ChatRoomRepo, GiftRepo } from '../repository/chatroom.repo'
import Gift from './gifts.data.json'
import MQClient from './mqtt.client'
import UserService from './user.service'


@Service()
export class ChatRoomService {

  @Autowired()
  useService: UserService

  @Autowired()
  mqClient: MQClient

  @Autowired()
  chatroomRepo: ChatRoomRepo

  @Autowired()
  giftRepo: GiftRepo

  async getRoomInfo(rid: string) {
    return this.mockRoomInfo()
  }

  async saveRoom(room: Chatroom.Room) {

  }

  async getMyCollections(token: string) {
    const data: Array<Chatroom.Room> = [
      {
        tags: [
          '电台',
        ],
        cover: 'https://yppphoto.hellobixin.com/upload/0d63c840-796e-11ed-83f1-83d7999600fa.png',
        _id: '27909f54b0304b73be7a66deb54bfd50',
        title: '哈尼播客🎧招募优质NJ',
        owner: '消失的狐狸',
        notice: ''
      },
      {
        tags: [
          '电台',
        ],
        cover: 'https://yppphoto.hellobixin.com/upload/966493d0-6db7-11ed-92d7-9f05510f8fc2.png',
        _id: '8329cb1b01224120adf9fa8452746479',
        title: 'Link播客🎧招聘小可爱',
        owner: '乐园🧸',
        notice: ''
      },
      {
        tags: [
          'vue',
          'webpack',
          'npm'
        ],
        cover: 'https://p6.hellobixin.com/bx-user/7b290d2ba15140ddbb48bb7be420432e.jpg',
        _id: '5d4f9c15910d4cd2b6d00ca38158d28f',
        title: '元气播客🎧清流是烟火的崽崽',
        owner: '小江南rt',
        notice: '01-20 2021'
      },
    ]
    return data
  }

  async getRecommend(token: string) {
    const data: Array<Chatroom.Room> = [
      {
        tags: [
          '电台',
        ],
        cover: 'https://yppphoto.hellobixin.com/upload/0d63c840-796e-11ed-83f1-83d7999600fa.png',
        _id: '27909f54b0304b73be7a66deb54bfd50',
        title: '哈尼播客🎧招募优质NJ',
        notice: ''
      },
      {
        tags: [
          '电台',
        ],
        cover: 'https://yppphoto.hellobixin.com/upload/966493d0-6db7-11ed-92d7-9f05510f8fc2.png',
        _id: '8329cb1b01224120adf9fa8452746479',
        title: 'Link播客🎧招聘小可爱',
        notice: ''
      },
      {
        tags: [
          'vue',
          'webpack',
          'npm'
        ],
        cover: 'https://p6.hellobixin.com/bx-user/7b290d2ba15140ddbb48bb7be420432e.jpg',
        _id: '5d4f9c15910d4cd2b6d00ca38158d28f',
        title: '元气播客🎧清流是烟火的崽崽',
        notice: '01-20 2021'
      },
      {
        tags: [
          '电台',
        ],
        cover: 'https://yppphoto.hellobixin.com/upload/05cfc780-6ec1-11ed-8687-f5e5510c0f89.png',
        _id: '60059f0f0ae17a86a8ca9e12',
        title: '心尼播客🎧招聘优质nj',
        notice: '01-18 2021'
      },
      {
        tags: [
          '点唱',
        ],
        cover: 'https://p6.hellobixin.com/bx-user/a21608165a104426af6407ae3739466a.jpg',
        _id: '93e8d1f87a8545ef9b1276f8f21d13fb',
        title: '[流行&抒情]弦乐-蕊子生日快乐',
      },
      {
        tags: [
          '飞鱼',
        ],
        cover: 'https://p6.hellobixin.com/bx-user/6E42131B-DE8E-4B5E-8150-4119C9A3F97C.jpg',
        _id: '3b64f64c01b249a4a93e2f0fb5b1fdea',
        title: '温柔大貓ι',
        notice: '专属找人房',
      },
      {
        tags: [
          '飞鱼',
        ],
        cover: 'https://p6.hellobixin.com/bx-user/542563a6efb441bf987a46b481d74d0a.jpg',
        _id: '0de1b79fd0a74bdc9ed26560af5c182b',
        title: '回忆QvQ',
        notice: '专属找人房',
      },
      {
        tags: [
          '交友',
        ],
        cover: 'https://p6.hellobixin.com/bx-user/75766e0d28084c1fa07c7c5d48b720b8.jpg',
        outline: '离上篇关于 vue 3.0 的源码学习已经过去老久了，这次要学习的是 reactive.ts 文件，很多东西都看了好几遍，觉得算有点理解了才开始写这个。',
        _id: '2ad392d49d674231a333a419f9d0f5ff',
        title: '惊魂巴士💫',
        notice: '[推理]  招优质DM'
      },
      {
        tags: [
          'demo',
          'test'
        ],
        cover: 'https://t6.hellobixin.com/bx-user/B6475A8B-7871-4015-A6F2-124729606048.jpg',
        outline: '如果图片加载失败，会用默认的错误图片展示。',
        _id: '25f3b11e69ae4960bc710c4e4378eaef',
        title: '星际迷航💫',
        notice: '[海龟汤] 但将行好事,莫要问前程'
      },
      {
        tags: [
          '交友',
        ],
        cover: 'https://p6.hellobixin.com/bx-user/df8e8e92b7354f58a8a8c288415869e7.jpg',
        outline: 'call、apply 方法在实际开发中还是有用到的，学习了它的相关原理，再自己手写一遍来加深自己的理解。',
        _id: 'deb7b56f8f864c9f89420179258da34c',
        title: '快乐星球💫',
        notice: '[海龟汤] 谦忱别臭脸！'
      },
      {
        tags: [
          '交友',
        ],
        cover: 'https://p6.hellobixin.com/bx-user/79cad79f12cc4c25bacd986250ed2d28.jpg',
        outline: '将几个比较有意思的面试题做一个小小的记录。',
        _id: '5e7c35a796575e7d52d442bd',
        title: '梦阁💫',
        notice: '[推理] 林七天天开心'
      }
    ]
    return data
  }

  async getGiftInfo(rid: string) {
    const mockGifts: Array<Chatroom.Gift> = Gift

    return mockGifts
  }

  async enter(roomId: string, token: string) {
    return this.mockRoomInfo()
  }

  async reward(roomId: string, giftId: string, count: number, receivers: string[], token: string) {
    let from = await this.useService.token2uid(token)
    let messages = receivers.map(it => {
      return {
        type: Chatroom.MsgType.Reward,
        from,
        content: { to: it, giftId, count }
      } as Chatroom.Message
    })
    this.mqClient.sendMsg(`_room/${roomId}`, JSON.stringify(messages))
  }


  private mockRoomInfo() {
    let seats: Array<Chatroom.Seat> = [
      {
        seq: 0,
        type: Chatroom.SeatType.Guest,
        isMute: false,
        isLocked: false,
        userInfo: {
          uid: '4e6434d1-5910-46c3-879d-733c33ded257', name: 'zhangsan', avatar: 'https://p6.hellobixin.com/bx-user/15433e025c5b435db8da4ad9e74efa20.jpg'
        }
      },
      {
        seq: 1,
        type: Chatroom.SeatType.Guest,
        isMute: false,
        isLocked: false,
        userInfo: {
          uid: '8bb7c7bd-18b3-4aa4-be07-2de3caa2e19f', name: '里斯', avatar: 'https://yppphoto.hellobixin.com/image/EF4A344C-3F0C-422D-A9FD-07F9045F9258.jpg'
        }
      },
      {
        seq: 2,
        type: Chatroom.SeatType.Guest,
        isMute: true,
        isLocked: false,
        userInfo: {
          uid: '8f4e7438-4285-4268-910c-3898fb8d6d96', name: 'zhangsan', avatar: 'https://yppphoto.hellobixin.com/yppphoto/0140f013-88b2-43a4-b0ec-51fc0eaa8ec3.png'
        }
      },
      {
        seq: 3,
        type: Chatroom.SeatType.Guest,
        isMute: false,
        isLocked: false,
        userInfo: { uid: '', name: 'zhangsan' }
      },
      {
        seq: 4,
        type: Chatroom.SeatType.Guest,
        isMute: false,
        isLocked: false,
      },
      {
        seq: 5,
        type: Chatroom.SeatType.Guest,
        isMute: false,
        isLocked: false,
      },
      {
        seq: 6,
        type: Chatroom.SeatType.Guest,
        isMute: false,
        isLocked: true,
      },
      {
        seq: 7,
        type: Chatroom.SeatType.Guest,
        isMute: false,
        isLocked: false,
      }
    ]

    let room: Chatroom.Room = {
      _id: '05586a80843f11ed8a1975b7feb9abdf',
      title: '哈尼播客🎧招募优质NJ',
      cover: 'https://yppphoto.hellobixin.com/upload/0d63c840-796e-11ed-83f1-83d7999600fa.png',
      owner: '消失的狐狸',
      notice: '无论我们能活多久，我们能够享受的只有无法分割的此刻，此外别无其他',
      // background: 'https://yppphoto.hibixin.com/yppphoto/75944c2a25c6421c886e4e321e4e79bb.jpg',
      seats,

    }
    return room
  }
}