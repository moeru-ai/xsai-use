import { useChat } from '@xsai-use/react'
import { tool } from '@xsai/tool'

import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'

import { description, object, pipe, string } from 'valibot'

import {
  UIMessageTextPart,
  UIMessageToolPart,
  UIMessageUnknownPart,
} from './ui-message-part'

// Inline styles for the component
const styles = {
  chatBubble: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '.5rem',
  },
  chatHeader: {
    backgroundColor: '#f0f2f5',
    borderBottom: '1px solid #ddd',
    padding: '10px 15px',
    textAlign: 'center' as const,
  },
  chatContainer: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: 'Arial, sans-serif',
    height: '90vh',
    overflow: 'hidden',
    width: '600px',
  },
  inputContainer: {
    backgroundColor: '#f0f2f5',
    borderTop: '1px solid #ddd',
    display: 'flex',
    padding: '10px',
    width: '100%',
  },
  messagesContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column' as const,
    gap: '10px',
    overflowY: 'auto' as const,
    padding: '15px',
  },
  errorMessage: {
    fontSize: '12px',
  },
  toolsContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '8px',
    minHeight: '35px',
  },
  toolBadge: {
    backgroundColor: '#e9ecef',
    borderRadius: '16px',
    padding: '6px 12px',
    fontSize: '13px',
    color: '#495057',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid #dee2e6',
  },
  toolIcon: {
    color: '#495057',
    fontSize: '14px',
  },
  toolName: {
    fontSize: '13px',
    color: '#495057',
  },
  chatToolsSection: {
    padding: '10px',
    alignContent: 'center',
    flexShrink: 0,
    borderBottom: '1px solid #ddd',
    backgroundColor: '#f8f9fa',
  },
}

interface ToolMap {
  [key: string]: Awaited<ReturnType<typeof tool>>
}

function ChatMessage({
  message,
  isError = false,
  error,
  reload,
}: {
  message: ReturnType<typeof useChat>['messages'][number]
  isError?: boolean
  error?: Error | null
  reload?: (id: string) => void | Promise<void>
}) {
  return (
    <div className={
      classNames(
        'chat',
        message.role === 'user' ? 'chat-end' : 'chat-start',
      )
    }
    >
      <div
        className={
          classNames(
            'chat-bubble',
            message.role === 'user' ? 'chat-bubble-primary' : '',
          )
        }
        style={{ ...styles.chatBubble }}
      >
        {message.parts.map((part, index) => {
          switch (part.type) {
            case 'text':
              return <UIMessageTextPart key={index} text={part.text} />
            case 'tool-call':
              return <UIMessageToolPart key={part.toolCall.id} part={part} />
            case 'audio':
            case 'image':
            case 'reasoning':
            case 'refusal':
            default:
              return <UIMessageUnknownPart key={index} type={part.type} />
          }
        })}
        {isError && (
          <div style={styles.errorMessage}>
            ❌
            {error?.message}
          </div>
        )}
      </div>
      {
        message.role === 'user' && (
          <div className="chat-footer opacity-50">
            {/* eslint-disable-next-line ts/no-misused-promises,ts/promise-function-async */}
            <button type="button" className="link" onClick={() => reload?.(message.id)}>reload from here</button>
          </div>
        )
      }
    </div>
  )
}

// Simple Chat Component implementation
export function ChatComponent() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoadingTools, setIsLoadingTools] = useState(true)
  const [loadedTools, setLoadedTools] = useState<ToolMap>({})

  // Load tools on component mount
  useEffect(() => {
    const loadTools = async () => {
      setIsLoadingTools(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      try {
        const weatherTool = await tool({
          description: 'Get the weather in a location',
          execute: async ({ location }) => {
            await new Promise(resolve => setTimeout(resolve, 2000))
            if (Math.random() > 0.5) {
              throw new Error('Weather API error')
            }
            return {
              location,
              temperature: 10,
            }
          },
          name: 'weather',
          parameters: object({
            location: pipe(
              string(),
              description('The location to get the weather for'),
            ),
          }),
        })

        const calculatorTool = await tool({
          description: 'Calculate mathematical expression',
          execute: ({ expression }) => ({
            // eslint-disable-next-line no-eval, ts/no-unsafe-assignment
            result: eval(expression),
          }),
          name: 'calculator',
          parameters: object({
            expression: pipe(
              string(),
              description('The mathematical expression to calculate'),
            ),
          }),
        })

        setLoadedTools({
          weather: weatherTool,
          calculator: calculatorTool,
        })
      }
      catch (err) {
        console.error('Error loading tools:', err)
      }
      finally {
        setIsLoadingTools(false)
      }
    }

    // eslint-disable-next-line ts/no-floating-promises
    loadTools()
  }, [])

  const {
    handleSubmit,
    handleInputChange,
    input,
    messages,
    status,
    error,
    reset,
    stop,
    reload,
  } = useChat({
    id: 'simple-chat',
    preventDefault: true,
    initialMessages: [
      {
        role: 'system',
        content: 'you are a helpful assistant.',
      },
    ],
    baseURL: 'http://localhost:11434/v1/',
    model: 'mistral-nemo-instruct-2407',
    maxSteps: 3,
    toolChoice: 'auto',
    tools: Object.values(loadedTools),
  })

  // Handle send button click based on status
  const handleSendButtonClick = (e: React.MouseEvent) => {
    if (status === 'loading') {
      e.preventDefault()
      stop()
    }
    else {
      // Let the form submission handle this case
    }
  }

  // Focus input when status changes to idle
  useEffect(() => {
    if (status === 'idle' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [status])

  return (
    <div style={styles.chatContainer}>
      <div style={styles.chatHeader}>
        <h2>useChat</h2>
      </div>

      <div style={styles.chatToolsSection}>
        <div style={styles.toolsContainer}>
          <span>Available tools:</span>
          {
            isLoadingTools
              ? <span className="loading loading-infinity loading-md"></span>
              : Object.keys(loadedTools).map(toolName => (
                  <div key={toolName} style={styles.toolBadge}>
                    <span style={styles.toolIcon}>🔧</span>
                    <span style={styles.toolName}>{toolName}</span>
                  </div>
                ))
          }
        </div>
      </div>

      <div style={styles.messagesContainer}>
        {/* eslint-disable-next-line ts/strict-boolean-expressions */}
        {messages.map((message, idx) => message
          ? (
              <ChatMessage
                key={message.id}
                message={message}
                isError={idx === messages.length - 1 && status === 'error'}
                error={idx === messages.length - 1 ? error : null}
                reload={reload}
              />
            )
          : 'null')}
      </div>

      {/* eslint-disable-next-line ts/no-misused-promises */}
      <form data-test-id="form" onSubmit={handleSubmit} style={styles.inputContainer}>
        <div className="join" style={{ width: '100%' }}>
          <input
            type="text"
            className="input join-item"
            placeholder="say something..."
            style={{ width: '100%' }}
            onChange={handleInputChange}
            value={input}
            disabled={status !== 'idle'}
            ref={inputRef}
          />
          <button
            className="btn join-item"
            onClick={handleSendButtonClick}
            type={status === 'loading' ? 'button' : 'submit'}
          >
            {status === 'loading'
              ? <span className="loading loading-dots loading-md"></span>
              : 'Send'}
          </button>
          <button
            className="btn join-item"
            onClick={(e) => {
              e.preventDefault()
              reset()
            }}
            type="button"
          >
            {status === 'loading'
              ? <span className="loading loading-dots loading-md"></span>
              : 'Reset'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Usage example
export function App() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <ChatComponent />
    </div>
  )
}
