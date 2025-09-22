import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['app/setCurrentPoll', 'app/addChatMessage', 'app/setChatHistory', 'app/setPollHistory', 'app/endPoll'],
        ignoredPaths: ['app.currentPoll.createdAt', 'app.chatMessages', 'app.pollHistory'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
