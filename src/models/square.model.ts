import { Chatroom, Common } from '.'

export namespace Square {

  export enum FeedType {
    Post,
    Moment,
    Room
  }

  export interface Feed {
    type: FeedType
    data: Timeline.Post | Timeline.Moment | Chatroom.Room
  }
}

export namespace Timeline {

  export interface Post extends Common.DBDoc {
    title: string
    uid: string
    timestamp: number
    content: any
    likes?: Array<{ uid: string, name: string }>
    comments?: Array<Comment>
  }

  export interface Moment extends Common.DBDoc {
    uid: string
    name?: string
    avatar?: string
    timestamp: number
    desc?: string
    images?: Array<string>
    likes?: Array<{ uid: string, name: string }>
    comments?: Array<Comment>
  }

  export enum CommentType {
    Post,
    Moment,
  }

  export interface Comment extends Common.DBDoc {
    type: CommentType
    postId: string
    uid: string
    name: string
    mention?: string // @user's id
    mentionName?: string
    content: string
    timestamp: number
  }
}