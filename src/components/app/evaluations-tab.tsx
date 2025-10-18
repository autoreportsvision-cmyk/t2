
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { Bot, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WhatsAppIcon from '@/components/icons/whatsapp-icon';
import { Textarea } from '../ui/textarea';
import { DEFAULT_AI_PROMPT } from '@/lib/constants';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import ChatInteraction from './chat-interaction';
import { useUser, useFirestore } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useMemoFirebase } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export default function EvaluationsTab() {
  const { calculatedData, aiEvaluations, setAiEvaluations, isCalculated } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_AI_PROMPT);
  const { toast } = useToast();

  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const isAdmin = userProfile?.role === 'admin';

  const handleGenerateEvaluations = async () => {
    if (!calculatedData) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Dados calculados não estão disponíveis. Por favor, preencha o formulário primeiro.",
      });
      return;
    }
    if (!prompt) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'O prompt da IA não pode estar vazio.',
      });
      return;
    }

    setLoading(true);
    setAiEvaluations(null);
    
    try {
        const response = await fetch('/api/ai/evaluations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                effects: calculatedData.effects,
                overallSummary: calculatedData.overallSummary,
                prompt: prompt,
            }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          setAiEvaluations({ generalEvaluation: result.data });
          toast({
            title: "Sucesso",
            description: "Avaliação geral gerada com IA.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro de IA",
            description: result.error,
          });
        }
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Erro de Rede",
            description: "Não foi possível conectar ao servidor de IA.",
        });
    } finally {
        setLoading(false);
    }
  };
  
  const handleShare = (text: string) => {
    if (!text) {
      toast({
        variant: 'destructive',
        title: 'Nenhum relatório para compartilhar',
        description: 'Por favor, gere uma avaliação primeiro.',
      });
      return;
    }
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  
  const generalEvaluation = aiEvaluations?.generalEvaluation;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                  <CardTitle>Avaliação Geral do Processo (IA)</CardTitle>
                  <CardDescription>Análise consolidada do desempenho do sistema de evaporação gerada por IA.</CardDescription>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                   <Button onClick={() => handleShare(generalEvaluation || '')} disabled={!generalEvaluation}>
                      <WhatsAppIcon className="h-4 w-4" />
                      <span>Compartilhar Relatório</span>
                  </Button>
                  <Button onClick={handleGenerateEvaluations} disabled={!isCalculated || loading}>
                      {loading ? <Loader className="animate-spin" /> : <Bot />}
                      <span>{aiEvaluations ? 'Regerar' : 'Gerar Avaliação'}</span>
                  </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isCalculated ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              Preencha o formulário para gerar a avaliação.
            </div>
          ) : loading ? (
             <div className="flex items-center justify-center h-48">
               <Loader className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : generalEvaluation ? (
             <div
                className="whitespace-pre-wrap rounded-md border bg-background p-4 overflow-auto text-sm"
                dangerouslySetInnerHTML={{ __html: generalEvaluation.replace(/\n/g, '<br />') }}
              >
              </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              Clique em "Gerar Avaliação" para ver a análise da IA.
            </div>
          )}
        </CardContent>
      </Card>
      
      <Accordion type="single" collapsible className="w-full">
        {isAdmin && (
            <AccordionItem value="item-1">
            <AccordionTrigger>Editar Prompt da IA</AccordionTrigger>
            <AccordionContent>
                <Card>
                <CardHeader>
                    <CardTitle>Prompt da IA</CardTitle>
                    <CardDescription>
                    Altere o prompt abaixo para customizar a análise gerada pela inteligência artificial. 
                    As variáveis como `'''${'{{{currentDate}}}'}'''`, `'''${'{{{overallSummary}}}'}'''` e `'''${'{{{effectsJson}}}'}'''` serão substituídas pelos dados do processo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="h-96 w-full text-xs"
                    />
                </CardContent>
                </Card>
            </AccordionContent>
            </AccordionItem>
        )}
        <AccordionItem value="item-2">
          <AccordionTrigger>Conversar com a IA sobre os dados</AccordionTrigger>
          <AccordionContent>
            <ChatInteraction />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
