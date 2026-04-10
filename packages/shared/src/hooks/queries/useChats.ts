import { useInfiniteQuery } from '@tanstack/react-query';
import { chatApi } from '../../apis/chat';
import { Chat } from '../../types/chat';

export const useInfiniteChats = (category?: string) => {
    return useInfiniteQuery<Chat[], Error>({
        queryKey: ['chats', { category }],
        queryFn: async ({ pageParam = 0 }) => {
            // pageParam is the skip value
            const chats = await chatApi.getChats(pageParam as number, 20, category);
            return chats;
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            // If the last page has fewer items than the limit (default 20), there are no more pages
            if (lastPage.length < 20) {
                return undefined;
            }
            // The next skip value is the total number of items fetched so far
            return allPages.flat().length;
        },
    });
};
