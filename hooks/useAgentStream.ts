
import { useState, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';

interface AgentStreamState {
  messages: string; // The full streaming response
  isStreaming: boolean;
  error: string | null;
  isOnboardingComplete: boolean;
  robotAnimation: string | null;
}

export const useAgentStream = () => {
  const [state, setState] = useState<AgentStreamState>({
    messages: '',
    isStreaming: false,
    error: null,
    isOnboardingComplete: false,
    robotAnimation: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);

  const ensureSession = useCallback(async () => {
    if (sessionId) return sessionId;

    const newSessionId = crypto.randomUUID();
    try {
      // Create session via ADK API
      // Using 'agents' as appName per user configuration
      await fetch(`http://localhost:8000/apps/agents/users/default-user/sessions/${newSessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Empty body usually fine for creating session
      });
      setSessionId(newSessionId);
      return newSessionId;
    } catch (e) {
      console.error("Failed to create session", e);
      // Fallback to local ID if API fails? Or throw?
      // Let's fallback to just using the ID even if creation failed (maybe it auto-creates?)
      setSessionId(newSessionId);
      return newSessionId;
    }
  }, [sessionId]);

  const sendMessage = useCallback(async (text: string) => {
    // Reset previous streaming state
    setState(prev => ({
      ...prev,
      messages: '',
      isStreaming: true,
      error: null,
      robotAnimation: null // Reset animation on new message
    }));

    const currentSessionId = await ensureSession();

    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('http://localhost:8000/run_sse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appName: 'agents',
          agentName: 'life_agent',
          sessionId: currentSessionId,
          userId: 'default-user',
          streaming: true,
          newMessage: {
            role: 'user',
            parts: [{ text: text }]
          }
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No readable stream body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });

        // Parse SSE events if possible, or just append raw text for now
        // Assuming the backend sends "data: <json>\n\n"
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6); // Remove "data: "
              if (jsonStr.trim() === '[DONE]') {
                done = true;
                break;
              }
              const data = JSON.parse(jsonStr);

              // Handle content parts (Gemini/ADK format)
              if (data.content && data.content.parts) {
                const text = data.content.parts.map((p: any) => p.text).join('');

                if (data.partial) {
                  // It's a delta chunk, append it
                  setState(prev => ({
                    ...prev,
                    messages: prev.messages + text
                  }));
                } else {
                  // It's the final complete message (or non-streaming), replace it
                  setState(prev => ({
                    ...prev,
                    messages: text
                  }));
                }
              }

              // Fallback for simple text field if used elsewhere
              if (data.text && !data.content) {
                setState(prev => ({
                  ...prev,
                  messages: prev.messages + data.text
                }));
              }

              // Handle metadata / custom events
              if (data.metadata) {
                if (data.metadata.isOnboardingComplete) {
                  setState(prev => ({ ...prev, isOnboardingComplete: true }));
                }
                if (data.metadata.robotAnimation) {
                  setState(prev => ({ ...prev, robotAnimation: data.metadata.robotAnimation }));
                }
              }

            } catch (e) {
              // If not JSON, treat as raw text (fallback)
              // console.warn("Stream parse error", e);
            }
          }
        }
      }

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setState(prev => ({ ...prev, error: err.message }));
      }
    } finally {
      setState(prev => ({ ...prev, isStreaming: false }));
    }
  }, []);

  return {
    ...state,
    sendMessage,
  };
};
