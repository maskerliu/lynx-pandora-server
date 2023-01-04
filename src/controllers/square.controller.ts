import { UploadedFile } from 'express-fileupload'
import { Autowired, BizContext, BodyParam, Controller, FileParam, Get, Post, QueryParam } from 'lynx-express-mvc'
import { RemoteAPI, Square, Timeline } from '../models'
import { ChatroomService } from '../service/chatroom.service'
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
  async recommend(context: BizContext) {
    let uid = await this.userService.token2uid(context.token)
    let rooms = await this.chatroomService.getRecommend(uid)

    let recommends = rooms.map(it => {
      return {
        type: Square.SquareItemType.Room,
        data: it
      } as Square.SquareItem
    })

    return recommends
  }

  @Get(RemoteAPI.Square.MyCollections)
  async myCollections(context: BizContext) {
    let uid = await this.userService.token2uid(context.token)
    let rooms = await this.chatroomService.getMyCollections(uid)

    let collections = rooms.map(it => {
      return {
        type: Square.SquareItemType.Room,
        data: it
      } as Square.SquareItem
    })

    return collections
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


  @Get(RemoteAPI.Timeline.MyPosts)
  async getMyPosts(@QueryParam('page') page: number, context: BizContext) {
    return await this.postService.getMyPosts(context.token, page)
  }

  @Get(RemoteAPI.Timeline.MyMoments)
  async myMoments(@QueryParam('page') page: number, context: BizContext) {
    return await this.momentService.getMyMoments(context.token, page)
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

