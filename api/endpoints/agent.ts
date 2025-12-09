import api from '../axios';

interface ChatPayload {
  text: string;
}

interface ChatResponse {
  response: string;
}

export const agentApi = {
  chat: async (payload: ChatPayload) => {
    const { data } = await api.post<ChatResponse>('/agent/chat', payload);
    return data;
  },
};
