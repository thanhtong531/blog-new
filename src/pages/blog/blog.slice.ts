import { createSlice, createAsyncThunk, PayloadAction, AsyncThunk } from '@reduxjs/toolkit'
import { Post } from '../../types/post'
import http from '../../utils/http'

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>

type PendingAction = ReturnType<GenericAsyncThunk['pending']>
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>

interface PostType {
  postList: Post[]
  // isDelete: string
  isEditing: Post | null
  loading: boolean
  currentRequestId: undefined | string
}

const initialState: PostType = {
  postList: [],
  // isDelete: ''
  isEditing: null,
  loading: false,
  currentRequestId: undefined
}

export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkAPI) => {
  const res = await http.get<Post[]>('posts', {
    signal: thunkAPI.signal
  })
  return res.data
})

export const deletePost = createAsyncThunk('blog/deletePost', async (postId, thunkAPI) => {
  const res = await http.delete(`posts/${postId}`, {
    signal: thunkAPI.signal
  })
  thunkAPI.dispatch(getPostList())
  return res.data
})

export const addPost = createAsyncThunk('blog/addPost', async (data: Omit<Post, 'id'>, thunkAPI) => {
  const res = await http.post<Post>('posts', data, {
    signal: thunkAPI.signal
  })
  return res.data
})

export const updatePost = createAsyncThunk(
  'blog/Update',
  async ({ postId, data }: { postId: string; data: Post }, thunkAPI) => {
    const res = await http.put(`posts/${postId}`, data, {
      signal: thunkAPI.signal
    })
    return res.data
  }
)

const blogSlice = createSlice({
  name: 'Blog',
  initialState,
  reducers: {
    startEditing: (state, action) => {
      const postEdit = state.postList.find((post) => post.id === action.payload) || null
      state.isEditing = postEdit
    },
    cancleUpdate: (state) => {
      state.isEditing = null
    }
    // getDelete: (state, action: any) => {
    //   state.isDelete = String(state.postList.findIndex((post) => post.id === action.payload))
    // }
  },
  extraReducers(builder) {
    builder
      .addCase(getPostList.fulfilled, (state, action) => {
        state.postList = action.payload
      })
      .addCase(addPost.fulfilled, (state, action: any) => {
        state.postList.push(action.payload)
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = state.postList.findIndex((post) => post.id === action.payload)
        if (postId > -1) {
          state.postList.splice(postId, 1)
        }
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.postList.find((post, idx) => {
          if (post.id === action.payload.id) {
            state.postList[idx] = action.payload
            return true
          }
          return false
        })

        state.isEditing = null
      })
      .addMatcher<PendingAction>(
        (action) => action.type.endsWith('/pending'),
        (state, action) => {
          state.loading = true
          state.currentRequestId = action.meta.requestId
        }
      )
      .addMatcher<RejectedAction>(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          if (state.loading && action.meta.requestId === state.currentRequestId) {
            state.loading = false
            state.currentRequestId = undefined
          }
        }
      )
      .addMatcher<FulfilledAction>(
        (action) => action.type.endsWith('/fulfilled'),
        (state, action) => {
          if (state.loading && action.meta.requestId === state.currentRequestId) {
            state.loading = false
            state.currentRequestId = undefined
          }
        }
      )
  }
})
export const { startEditing, cancleUpdate } = blogSlice.actions
export default blogSlice.reducer
