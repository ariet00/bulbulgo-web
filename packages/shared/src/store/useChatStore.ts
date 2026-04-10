import { create } from 'zustand';
import { Chat, Message, SendMessageRequest } from '../types/chat';
import { chatApi } from '../apis/chat';
import { useUserStore } from '../store/useUserStore';

import { queryClient } from '../lib/queryClient';

interface ChatState {
    // chats: Chat[]; // Removed, managed by React Query
    currentChat: Chat | null;
    messages: Message[];
    isLoadingMessages: boolean;
    socket: WebSocket | null;
    isConnecting: boolean;

    // setChats: (chats: Chat[]) => void; // Removed
    selectChat: (chatId: number) => Promise<void>;
    loadMoreMessages: () => Promise<void>;
    sendMessage: (content: string, attachments?: string[], parent_id?: number) => Promise<void>;
    receiveMessage: (message: Message) => void;
    connectSocket: () => void;
    disconnectSocket: () => void;
    clearCurrentChat: () => void;
}


export const useChatStore = create<ChatState>((set, get) => ({
    // chats: [],
    currentChat: null,
    messages: [],
    isLoadingMessages: false,
    socket: null,
    isConnecting: false,
    // setChats: (chats: Chat[]) => {
    //     set({ chats });
    // },

    selectChat: async (chatId: number) => {
        set({ isLoadingMessages: true, currentChat: null, messages: [] });
        try {
            const chat = await chatApi.getChat(chatId);
            const messages = await chatApi.getMessages(chatId);
            // Messages are returned newest first. We want to display them oldest at top usually?
            // Or if we use flex-col-reverse, newest at bottom.
            // Let's store them as is (newest first) and handle display.
            set({ currentChat: chat, messages });

            // Update chats list to mark last message as read for this chat
            // Update chats list to mark last message as read for this chat
            // We need to update React Query cache
            queryClient.setQueryData(['chats'], (oldData: any) => {
                if (!oldData) return oldData;
                // Infinite query data structure: { pages: [Chat[]], pageParams: [...] }
                const newPages = oldData.pages.map((page: Chat[]) =>
                    page.map((c: Chat) =>
                        c.id === chatId && c.last_message
                            ? { ...c, last_message: { ...c.last_message, is_read: true } }
                            : c
                    )
                );
                return { ...oldData, pages: newPages };
            });

        } catch (error) {
            console.error('Failed to fetch chat details', error);
        } finally {
            set({ isLoadingMessages: false });
        }

    },

    loadMoreMessages: async () => {
        const { currentChat, messages, isLoadingMessages } = get();
        if (!currentChat || isLoadingMessages) return;

        set({ isLoadingMessages: true });
        try {
            const skip = messages.length;
            const newMessages = await chatApi.getMessages(currentChat.id, skip);
            if (newMessages.length > 0) {
                set({ messages: [...messages, ...newMessages] });
            }
        } catch (error) {
            console.error('Failed to load more messages', error);
        } finally {
            set({ isLoadingMessages: false });
        }
    },

    sendMessage: async (content: string, attachments?: string[], parent_id?: number) => {
        const { currentChat } = get();
        if (!currentChat) return;

        try {
            // Optimistic update could be done here, but let's wait for server response for now
            // or rely on WS echo if we want to be safe.
            // But usually REST response is faster/reliable for sender.
            const message = await chatApi.sendMessage(currentChat.id, { content, attachments, parent_id });
            // We append it to messages. Since messages are newest first, it goes to the front.
            // Check if already exists (e.g. received via WS while waiting for REST response)
            const exists = get().messages.some(m => m.id === message.id);
            if (!exists) {
                set((state) => ({ messages: [message, ...state.messages] }));
            }

        } catch (error) {
            console.error('Failed to send message', error);
        }
    },

    receiveMessage: (message: Message) => {
        const { currentChat } = get();

        // If message belongs to current chat, add it
        if (currentChat && message.chat_id === currentChat.id) {
            // Check if already exists (e.g. sent by me and added via sendMessage)
            const exists = get().messages.some(m => m.id === message.id);
            if (!exists) {
                set((state) => ({ messages: [message, ...state.messages] }));

                // If we are in the chat, mark as read immediately
                chatApi.markAsRead(currentChat.id);
            }
        }

        // Update last message in chat list via React Query
        queryClient.setQueryData(['chats'], (oldData: any) => {
            if (!oldData) return oldData;

            // We need to find the chat, update its last message, and move it to the top
            // Since it's paginated, this is tricky.
            // Simplified approach: Update if found in any page, and try to move to top of first page.

            let chatToMove: Chat | null = null;
            let found = false;

            // First pass: find and update the chat
            const newPages = oldData.pages.map((page: Chat[]) => {
                const newPage = page.map((c: Chat) => {
                    if (c.id === message.chat_id) {
                        found = true;
                        const isRead = currentChat && currentChat.id === message.chat_id;
                        const messageToStore = isRead ? { ...message, is_read: true } : message;
                        chatToMove = { ...c, last_message: messageToStore };
                        return chatToMove;
                    }
                    return c;
                });
                return newPage;
            });

            if (found && chatToMove) {
                // Remove from where it was
                const pagesWithoutChat = newPages.map((page: Chat[]) => page.filter((c: Chat) => c.id !== message.chat_id));

                // Add to top of first page
                if (pagesWithoutChat.length > 0) {
                    pagesWithoutChat[0].unshift(chatToMove);
                } else {
                    // Should not happen if data exists
                    return oldData;
                }

                return { ...oldData, pages: pagesWithoutChat };

            } else {
                // New chat or not loaded? Invalidate to refetch
                queryClient.invalidateQueries({ queryKey: ['chats'] });
                return oldData;
            }
        });
    },

    connectSocket: () => {
        const { socket, isConnecting } = get();

        // If socket exists and is open or connecting, do nothing
        if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        // If already connecting (race condition check), do nothing
        if (isConnecting) return;

        const token = useUserStore.getState().token;
        if (!token) return;

        set({ isConnecting: true });

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
        const ws = new WebSocket(`${wsUrl}?token=${token}`);

        ws.onopen = () => {
            console.log('Connected to Chat WS');
            set({ isConnecting: false });
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'new_message') {
                    get().receiveMessage(data.message);
                } else if (data.type === 'messages_read') {
                    const { chat_id, message_ids } = data;
                    const { currentChat, messages } = get();

                    // If we are in the chat where messages were read, update them
                    if (currentChat && currentChat.id === chat_id) {
                        const updatedMessages = messages.map(msg =>
                            message_ids.includes(msg.id) ? { ...msg, is_read: true } : msg
                        );
                        set({ messages: updatedMessages });
                    }
                }

            } catch (e) {
                console.error('Error parsing WS message', e);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from Chat WS');
            set({ socket: null, isConnecting: false });
            // Reconnect logic could go here
        };

        set({ socket: ws });
    },


    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.close();
        }
        set({ socket: null, isConnecting: false });
    },

    clearCurrentChat: () => {
        set({ currentChat: null, messages: [] });
    },
}));
