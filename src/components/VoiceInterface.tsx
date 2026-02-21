import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { VoiceVisualizer } from './VoiceVisualizer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceInterfaceProps {
  onMessageSend?: (message: string) => void;
  isConnected?: boolean;
  messages?: Message[];
}

export const VoiceInterface = ({
  onMessageSend,
  isConnected = true,
  messages = []
}: VoiceInterfaceProps) => {
  const [interfaceState, setInterfaceState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isRecording,
    recordingState,
    audioLevel,
    transcript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    resetRecording
  } = useVoiceRecorder();

  useEffect(() => {
    if (messages.length > 0) {
      setLocalMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const handleMicrophoneClick = async () => {
    if (!isSupported) {
      alert('Voice recording is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      setInterfaceState('processing');
      const audioBlob = await stopRecording();

      if (audioBlob && transcript) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: transcript,
          timestamp: new Date()
        };

        setLocalMessages(prev => [...prev, userMessage]);

        if (onMessageSend) {
          onMessageSend(transcript);
        }

        setTimeout(() => {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Hello Mama! I\'m MIMI, your maternal health companion. How are you feeling today?',
            timestamp: new Date()
          };
          setLocalMessages(prev => [...prev, aiMessage]);
          setInterfaceState('speaking');

          setTimeout(() => {
            setInterfaceState('idle');
          }, 3000);
        }, 1500);
      }

      resetRecording();
    } else {
      setInterfaceState('listening');
      await startRecording();
    }
  };

  const getButtonContent = () => {
    switch (interfaceState) {
      case 'listening':
        return {
          icon: <Mic className="w-12 h-12" />,
          text: 'Listening...',
          color: 'bg-pink-500 hover:bg-pink-600'
        };
      case 'processing':
        return {
          icon: <Loader2 className="w-12 h-12 animate-spin" />,
          text: 'Thinking...',
          color: 'bg-purple-500'
        };
      case 'speaking':
        return {
          icon: <Volume2 className="w-12 h-12" />,
          text: 'MIMI is responding...',
          color: 'bg-pink-600'
        };
      default:
        return {
          icon: <MicOff className="w-12 h-12" />,
          text: 'Tap to speak to MIMI',
          color: 'bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
        };
    }
  };

  const buttonContent = getButtonContent();
  const isPulsing = interfaceState === 'listening';

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {!isConnected && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
            <p className="font-medium">Connection Status</p>
            <p className="text-sm">Reconnecting to MIMI...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {localMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <Mic className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to MIMI</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Your caring maternal health companion. I'm here to check on you, answer questions, and make sure you and your baby are doing well.
            </p>
          </div>
        )}

        {localMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-800 shadow-md'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-pink-100' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        {interfaceState === 'listening' && (
          <div className="px-4 py-3">
            <VoiceVisualizer
              isRecording={isRecording}
              audioLevel={audioLevel}
              width={window.innerWidth - 32}
              height={60}
            />
            {transcript && (
              <div className="mt-2 p-3 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-700 italic">"{transcript}"</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-8 px-4">
          <button
            onClick={handleMicrophoneClick}
            disabled={interfaceState === 'processing' || !isConnected}
            className={`${buttonContent.color} ${isPulsing ? 'animate-pulse' : ''}
              w-32 h-32 rounded-full shadow-2xl flex items-center justify-center
              text-white transition-all duration-300 transform hover:scale-105
              active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {buttonContent.icon}
          </button>
          <p className="mt-4 text-sm font-medium text-gray-700">{buttonContent.text}</p>
          {recordingState === 'recording' && (
            <p className="mt-1 text-xs text-gray-500">Tap again to send</p>
          )}
        </div>
      </div>
    </div>
  );
};
