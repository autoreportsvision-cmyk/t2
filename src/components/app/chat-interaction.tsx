
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader, Send } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import type { Message } from '@/lib/types';


export default function ChatInteraction() {
  const { calculatedData, isCalculated } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
        return;
    }
    if (!calculatedData) {
        toast({
            variant: 'destructive',
            title: 'Dados não encontrados',
            description: 'Por favor, calcule os dados no formulário primeiro.'
        });
        return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: currentInput,
                processData: JSON.stringify(calculatedData, null, 2),
            }),
        });

        const result = await response.json();

        if (result.success && result.data) {
            setMessages(prev => [...prev, { role: 'model', content: result.data }]);
        } else {
            toast({
                variant: 'destructive',
                title: 'Erro na IA',
                description: result.error || 'Não foi possível obter uma resposta.',
            });
            // If the call fails, remove the user's message to allow them to try again
            setMessages(prev => prev.slice(0, -1));
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erro de Rede',
            description: 'Não foi possível conectar ao servidor de IA.',
        });
         setMessages(prev => prev.slice(0, -1));
    } finally {
        setLoading(false);
    }
  };

  if (!isCalculated) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    Preencha o formulário e clique em "Calcular" para iniciar o chat com a IA.
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[60vh]">
      <CardHeader>
        <CardTitle>Chat com IA</CardTitle>
        <CardDescription>Faça perguntas sobre os dados do processo de evaporação.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'model' && <Bot className="h-6 w-6 flex-shrink-0" />}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
             {loading && (
              <div className="flex justify-start gap-2">
                <Bot className="h-6 w-6 flex-shrink-0" />
                <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                    <Loader className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Qual a sua dúvida sobre o processo?"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
