import { UploadedFile } from 'express-fileupload'
import { Autowired, Service } from 'lynx-express-mvc'
import path from 'path'
import { STATIC_DIR } from '../common/env.const'
import { Timeline } from '../models'
import { CommentRepo, MomentRepo, PostRepo } from '../repository/timeline.repo'
import UserService from './user.service'


@Service()
export class CommentService {

  @Autowired()
  userService: UserService

  @Autowired()
  commentRepo: CommentRepo

  async snapComments(type: number, postIds: string) {
    return await this.commentRepo.pagedComments(type, postIds, 0, 5)
  }

  async getComments(type: number, postId: string, page: number) {
    return await this.commentRepo.pagedComments(type, postId, page, 15)
  }

  async pubComment(comment: Timeline.Comment, token: string) {
    let uid = await this.userService.token2uid(token)
    comment.uid = uid
    return await this.commentRepo.saveComment(comment)
  }

  async delComment(commentId: string, token: string) {
    let uid = await this.userService.token2uid(token)
    let comment = await this.commentRepo.get('_id', commentId)
    if (comment != null && comment.uid == uid) {
      return await this.commentRepo.deleteComment({ _id: comment._id, _rev: comment._rev })
    } else {
      throw 'cant delete others comment'
    }
  }
}

@Service()
export class PostService {

  @Autowired()
  userService: UserService

  @Autowired()
  postRepo: PostRepo

  async getMyPosts(token: string, page: number) {
    let uid = await this.userService.token2uid(token)
    return await this.postRepo.getPagedPosts(uid, page, 15)
  }

}

@Service()
export class MomentService {
  
  @Autowired()
  userService: UserService

  @Autowired()
  commentService: CommentService

  @Autowired()
  momentRepo: MomentRepo

  async recommends(uid: string) {
    return []
  }

  async getMyMoments(token: string, page: number) {
    let uid = await this.userService.token2uid(token)
    let resp = await this.momentRepo.getPagedMoments(uid, page, 15)

    for (let post of resp) {
      let snapComments = await this.commentService.snapComments(Timeline.CommentType.Moment, post._id)
      post.comments = snapComments
    }

    return resp
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
    return await this.momentRepo.saveMoment(moment)
  }

  async delMoment(momentId: string, token: string) {
    let uid = await this.userService.token2uid(token)
    let moment = await this.momentRepo.get('_id', momentId)

    if (moment != null && moment.uid == uid) {
      return await this.momentRepo.deleteMoment({ _id: momentId, _rev: moment._rev })
    } else {
      throw 'you cant delete this moment'
    }
  }

  async like(momentId: string, token: string) {
    let profile = await this.userService.getUserInfoByToken(token)
    let moment = await this.momentRepo.get('_id', momentId)

    if (moment != null) {
      if (moment.likes == null) moment.likes = []

      let idx = moment.likes.findIndex(it => { return it.uid == profile.uid })
      if (idx != -1) {
        moment.likes.splice(idx, 1)
      } else {
        moment.likes.push({ uid: profile.uid, name: profile.name })
      }
      
      return await this.momentRepo.updateMoment(moment)
    } else {
      throw 'moment doest existed'
    }
  }
}
