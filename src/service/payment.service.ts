import { Autowired, Service } from 'lynx-express-mvc'
import { Payment } from '../models/payment.model'
import { PayRecordRepo, PurseRecordRepo, WalletRepo } from '../repository/payment.repo'
import UserService from './user.service'


const RechargePurchases: Array<Payment.PurchaseItem> = []
const PayChannels: Array<Payment.PayChannel> = []
const ExchangePurchases: Array<Payment.PurchaseItem> = []

@Service()
export class PaymentService {

  @Autowired()
  private userService: UserService

  @Autowired()
  private walletRepo: WalletRepo

  @Autowired()
  private payRepo: PayRecordRepo

  @Autowired()
  private purseRepo: PurseRecordRepo


  async init() {
    RechargePurchases.push({ _id: 'd1111', diamonds: 1000, discount: 10, price: 10 })
    RechargePurchases.push({ _id: 'd1112', diamonds: 2000, discount: 20, price: 20 })
    RechargePurchases.push({ _id: 'd1113', diamonds: 3000, discount: 30, price: 30 })
    RechargePurchases.push({ _id: 'd1114', diamonds: 5000, discount: 48, price: 50 })
    RechargePurchases.push({ _id: 'd1115', diamonds: 10000, discount: 90, price: 100 })

    ExchangePurchases.push({ _id: 'e1111', diamonds: 700, discount: 1000, price: 1000 })
    ExchangePurchases.push({ _id: 'e1112', diamonds: 2100, discount: 3000, price: 3000 })
    ExchangePurchases.push({ _id: 'e1113', diamonds: 3500, discount: 5000, price: 5000 })
    ExchangePurchases.push({ _id: 'e1114', diamonds: 7000, discount: 10000, price: 10000 })
    ExchangePurchases.push({ _id: 'e1115', diamonds: 21000, discount: 29000, price: 30000 })
    ExchangePurchases.push({ _id: 'e1116', diamonds: 35000, discount: 48000, price: 50000 })

    PayChannels.push({ _id: 'pc_1', name: '微信支付', icon: 'icon-weixinzhifu', color: '#4cd137' })
    PayChannels.push({ _id: 'pc_2', name: '支付宝', icon: 'icon-zhifubao', color: '#3498db' })
  }


  async myWallet(token: string) {
    let uid = await this.userService.token2uid(token)
    let wallet = await this.walletRepo.get('uid', uid)

    if (wallet == null) {
      wallet = { diamonds: 0, purse: 0, uid }
      await this.walletRepo.createWallet(wallet)
      wallet = await this.walletRepo.get('uid', uid)
    }

    return wallet
  }

  async rechargeConfig(token: string) {
    return { channels: PayChannels, purchases: RechargePurchases }
  }

  async recharge(purchaseId: string, channel: string, token: string) {

    let uid = await this.userService.token2uid(token)
    let purchase = RechargePurchases.find(it => { return it._id == purchaseId })
    let wallet = await this.walletRepo.get('uid', uid)

    if (uid == null || purchase == null) throw 'user or purchase info error!'

    // TODO add third part pay check
    // currently mock success

    let newWallet = Object.assign({}, wallet)
    newWallet.diamonds += purchase.diamonds
    await this.walletRepo.updateWallet(newWallet)

    delete wallet._id
    delete wallet._rev
    let payRecord: Payment.PayRecord = {
      uid, channel,
      diamonds: purchase.diamonds,
      timestamp: new Date().getTime(),
      snap: wallet
    }
    await this.payRepo.saveRecord(payRecord)
    delete newWallet._rev
    return newWallet
  }

  async consume(diamonds: number, uid: string) {
    let wallet = await this.walletRepo.get('uid', uid)
    if (uid == null || wallet == null) throw 'user or purchase info error!'
    if (wallet.diamonds - diamonds < 0) throw '钻石不足，请充值'
    let newWallet = Object.assign({}, wallet)
    newWallet.diamonds -= diamonds
    await this.walletRepo.updateWallet(newWallet)

    delete wallet._id
    delete wallet._rev
    let payRecord: Payment.PayRecord = {
      uid, channel: null,
      diamonds: -diamonds,
      timestamp: new Date().getTime(),
      snap: wallet
    }
    return await this.payRepo.saveRecord(payRecord)
  }


  async exchangeConfig(token: string) {
    return { purchases: ExchangePurchases }
  }

  async exchange(purchaseId: string, token: string) {
    let uid = await this.userService.token2uid(token)
    let purchase = ExchangePurchases.find(it => { return it._id == purchaseId })
    let wallet = await this.walletRepo.get('uid', uid)
    if (uid == null || purchase == null) throw 'user or purchase info error!'

    if (wallet.purse - purchase.discount < 0) throw '魅力值不够，请选择适当兑换项'

    let timestamp = new Date().getTime()
    let newWallet = Object.assign({}, wallet)
    newWallet.diamonds += purchase.diamonds
    newWallet.purse -= purchase.discount
    await this.walletRepo.updateWallet(newWallet)
    delete wallet._id
    delete wallet._rev
    let payRecord: Payment.PayRecord = {
      uid, timestamp,
      channel: 'exchange',
      diamonds: purchase.diamonds,
      snap: wallet
    }
    await this.payRepo.saveRecord(payRecord)

    let pusreRecord: Payment.PurseRecord = {
      uid, timestamp,
      purse: -purchase.discount,
      snap: wallet
    }
    await this.purseRepo.addRecords([pusreRecord])
    delete newWallet._rev
    return newWallet
  }

  async bulkUpdatePurse(records: Array<{ uid: string, purse: number }>) {

    let uids = records.map(it => { return it.uid })
    let wallets = await this.walletRepo.bulkGet(uids)

    let purseRecords: Array<Payment.PurseRecord> = []
    records.forEach(it => {
      let wallet = wallets.find(wallet => { return it.uid == wallet.uid })
      let record: Payment.PurseRecord = {
        uid: wallet.uid,
        purse: it.purse,
        timestamp: new Date().getTime(),
        snap: wallet
      }
      wallet.purse += it.purse
      purseRecords.push(record)
    })

    await this.walletRepo.bulkUpdate(wallets)
    let resp = await this.purseRepo.addRecords(purseRecords)
    return resp.map(it => {
      return it.id
    })
  }

  async getPagedOrders(page: number, token: string) {
    let uid = await this.userService.token2uid(token)
    return await this.purseRepo.getPagedRecords(uid, page, 15)
  }

}