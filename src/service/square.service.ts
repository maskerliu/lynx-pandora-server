import { UploadedFile } from 'express-fileupload'
import { Autowired, BizCode, BizFail, Service } from 'lynx-express-mvc'
import path from 'path'
import { STATIC_DIR } from '../common/env.const'
import { Timeline } from '../models'
import { CommentRepo, MomentRepo, PostRepo } from '../repository/square.repo'
import UserService from './user.service'


@Service()
export class CommentService {

  @Autowired()
  private userService: UserService

  @Autowired()
  private commentRepo: CommentRepo

  async snapComments(type: number, postIds: string) {
    return await this.commentRepo.pagedGet(type, postIds, 0, 5)
  }

  async bulkComments(type: number, postIds: Array<string>) {
    let comments = new Map<string, Array<Timeline.Comment>>()

    for (let postId of postIds) {
      let result = await this.commentRepo.pagedGet(type, postId, 0, 5)
      comments.set(postId, result)
    }

    return comments
  }

  async getComments(type: number, postId: string, page: number) {
    return await this.commentRepo.pagedGet(type, postId, page, 15)
  }

  async pubComment(comment: Timeline.Comment, token: string) {
    let uid = await this.userService.token2uid(token)
    comment.uid = uid
    return await this.commentRepo.add(comment)
  }

  async delComment(commentId: string, token: string) {
    let uid = await this.userService.token2uid(token)
    let comment = await this.commentRepo.get('_id', commentId)
    if (comment != null && comment.uid == uid) {
      return await this.commentRepo.remove(comment._id, comment._rev)
    } else {
      throw new BizFail(BizCode.FAIL, 'cant delete others comment')
    }
  }
}

@Service()
export class PostService {

  @Autowired()
  private postRepo: PostRepo

  async recomends(uid: string, page: number) {
    return await this.postRepo.getPagedLastPosts(uid, page, 5)
  }

  async getPosts(uid: string, page: number) {
    return await this.postRepo.pagedGet(uid, page, 15)
  }

}

@Service()
export class MomentService {

  @Autowired()
  private userService: UserService

  @Autowired()
  private commentService: CommentService

  @Autowired()
  private momentRepo: MomentRepo

  async recommends(uid: string, page: number) {
    let result = await this.momentRepo.getPagedLastMoments(uid, page, 5)
    let mIds = result.map(it => { return it._id })
    let snapComments = await this.commentService.bulkComments(Timeline.CommentType.Moment, mIds)
    let uids = result.map(it => { return it.uid })

    let profiles = await this.userService.bulkUsers(uids)

    result.forEach(moment => {
      let profile = profiles.find(it => { return it.uid == moment.uid })
      moment.name = profile.name
      moment.avatar = profile.avatar
      moment.comments = snapComments.get(moment._id)
      if (moment.likes == null) moment.likes = []
    })
    return result
  }

  async getMoments(uid: string, page: number) {
    let profile = await this.userService.getUserInfo(uid)
    let result = await this.momentRepo.pagedGet(uid, page, 15)
    let mIds = result.map(it => { return it._id })
    let snapComments = await this.commentService.bulkComments(Timeline.CommentType.Moment, mIds)
    result.forEach(it => {
      it.name = profile.name
      it.avatar = profile.avatar
      it.comments = snapComments.get(it._id)
      if (it.likes == null) it.likes = []
    })

    return result
  }

  async pubMoment(moment: Timeline.Moment, images: Array<UploadedFile>) {
    if (images?.length > 0) {
      moment.images = []
      for (let file of images) {
        let ext = file.name.split('.').pop()
        await file.mv(path.join(STATIC_DIR, file.md5 + '.' + ext))
        moment.images.push(`/_res/${file.md5}.${ext}`)
      }
    }
    moment.timestamp = new Date().getTime()
    return await this.momentRepo.add(moment)
  }

  async delMoment(momentId: string, token: string) {
    let uid = await this.userService.token2uid(token)
    let moment = await this.momentRepo.get('_id', momentId)

    if (moment != null && moment.uid == uid) {
      return await this.momentRepo.remove(momentId, moment._rev)
    } else {
      throw 'you cant delete this moment'
    }
  }

  async like(momentId: string, token: string) {
    let uid = await this.userService.token2uid(token)
    let profile = await this.userService.getUserInfo(uid)
    let moment = await this.momentRepo.get('_id', momentId)

    if (moment != null) {
      if (moment.likes == null) moment.likes = []

      let idx = moment.likes.findIndex(it => { return it.uid == profile.uid })
      if (idx != -1) {
        moment.likes.splice(idx, 1)
      } else {
        moment.likes.push({ uid: profile.uid, name: profile.name })
      }

      return await this.momentRepo.save(moment)
    } else {
      throw 'moment doest existed'
    }
  }
}
