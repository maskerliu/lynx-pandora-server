import { UploadedFile } from 'express-fileupload'
import { Autowired, BizContext, BodyParam, Controller, FileParam, Get, Post, QueryParam } from 'lynx-express-mvc'
import { RemoteAPI, Square, Timeline } from '../models'
import { ChatroomService } from '../service/chatroom/chatroom.service'
import { CommentService, MomentService, PostService } from '../service/square.service'
import UserService from '../service/user.service'


@Controller(RemoteAPI.Square.BasePath)
export class SquareController {

  @Autowired()
  userService: UserService

  @Autowired()
  chatroomService: ChatroomService

  @Autowired()
  momentService: MomentService

  @Autowired()
  postService: PostService


  @Get(RemoteAPI.Square.Recommend)
  async recommend(@QueryParam('page') page: number, context: BizContext) {
    let uid = await this.userService.token2uid(context.token)
    let rooms = await this.chatroomService.recommends(uid, page)
    let roomFeeds = rooms.map(it => {
      return {
        type: Square.FeedType.Room,
        data: it
      } as Square.Feed
    })
    let moments = await this.momentService.recommends(uid, page)
    let momentsFeeds = moments.map(it => {
      return {
        type: Square.FeedType.Moment,
        data: it
      } as Square.Feed
    })

    let recommends = this.sufflue(roomFeeds, momentsFeeds)

    return recommends
  }

  @Get(RemoteAPI.Square.MyCollections)
  async myCollections(context: BizContext) {
    let uid = await this.userService.token2uid(context.token)
    let rooms = await this.chatroomService.getMyCollections(uid)

    let collections = rooms.map(it => {
      return {
        type: Square.FeedType.Room,
        data: it
      } as Square.Feed
    })

    return collections
  }

  private sufflue<T>(arr1: Array<T>, arr2: Array<T>) {
    let length = arr1.length + arr2.length
    let result = new Array<T>(length)

    for (let i = 0; i < length; ++i) {
      let seed = Math.round(Math.random() * 2)
      if (seed == 0) {

      } else if (seed == 1) {

      } else if (seed = 2) {

      }
      if (arr1.length == 0) seed = 1
      if (arr2.length == 0) seed = 0


      let idxR = Math.floor(Math.random() * arr1.length)
      let idxM = Math.floor(Math.random() * arr2.length)

      result[i] = seed == 0 ? arr1.splice(idxR, 1)[0] : arr2.splice(idxM, 1)[0]
    }

    return result
  }
}

@Controller(RemoteAPI.Timeline.BasePath)
export class TimelineController {

  @Autowired()
  postService: PostService

  @Autowired()
  momentService: MomentService

  @Autowired()
  commentService: CommentService

  @Autowired()
  chatroomService: ChatroomService


  @Get(RemoteAPI.Timeline.Posts)
  async getMyPosts(@QueryParam('page') page: number, @QueryParam('uid') uid: string) {
    return await this.postService.getPosts(uid, page)
  }

  @Get(RemoteAPI.Timeline.Moments)
  async myMoments(@QueryParam('page') page: number, @QueryParam('uid') uid: string) {
    return await this.momentService.getMoments(uid, page)
  }

  @Post(RemoteAPI.Timeline.MomentPub)
  async momentPub(@BodyParam('moment') moment: Timeline.Moment,
    @FileParam('image0') image0?: UploadedFile,
    @FileParam('image1') image1?: UploadedFile,
    @FileParam('image2') image2?: UploadedFile,
    @FileParam('image3') image3?: UploadedFile,
    @FileParam('image4') image4?: UploadedFile,
    @FileParam('image5') image5?: UploadedFile,
    @FileParam('image6') image6?: UploadedFile,
    @FileParam('image7') image7?: UploadedFile,
    @FileParam('image8') image8?: UploadedFile) {
    let images: Array<UploadedFile> = []
    if (image0) images.push(image0)
    if (image1) images.push(image1)
    if (image2) images.push(image2)
    if (image3) images.push(image3)
    if (image4) images.push(image4)
    if (image5) images.push(image5)
    if (image6) images.push(image6)
    if (image7) images.push(image7)
    if (image8) images.push(image8)

    return await this.momentService.pubMoment(moment, images)
  }

  @Post(RemoteAPI.Timeline.MomentLike)
  async momentLike(@BodyParam() data: { momentId: string }, context: BizContext) {
    return await this.momentService.like(data.momentId, context.token)
  }

  @Post(RemoteAPI.Timeline.CommentPub)
  async commentPub(@BodyParam() comment: Timeline.Comment, context: BizContext) {
    return await this.commentService.pubComment(comment, context.token)
  }

  @Post(RemoteAPI.Timeline.CommentDel)
  async delComment(@BodyParam() data: { commentId: string }, context: BizContext) {
    return await this.commentService.delComment(data.commentId, context.token)
  }

}

