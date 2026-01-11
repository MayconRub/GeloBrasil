
import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Lightbulb, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { Sale, Expense } from '../types';

interface Props {
  data: {
    sales: Sale[];
    expenses: Expense[];
  };
}

const AIInsightsView: React.FC<Props> = ({ data }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsight = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Create a new GoogleGenAI instance right before making an API call.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const salesTotal = data.sales.slice(0, 30).reduce((sum, s) => sum + s.value, 0);
      const expensesTotal = data.expenses.slice(0, 30).reduce((sum, e) => sum + e.value, 0);

      const prompt = `Analise financeiramente os dados deste mês de uma fábrica de gelo: Vendas Totais R$ ${salesTotal}, Despesas Totais R$ ${expensesTotal}. Dê um diagnóstico curto e 3 dicas acionáveis para aumentar o lucro. Responda em Português (Brasil).`;

      // Use ai.models.generateContent to query GenAI.
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      // Directly access the .text property on GenerateContentResponse.
      const text = response.text;
      setInsight(text || "Não foi possível gerar análise no momento.");
    } catch (err: any) {
      console.error(err);
      setError("Erro na conexão AI. Verifique se a chave API está configurada.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Sparkles className="text-indigo-500" /> IA Consultor
        </h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Análise inteligente do seu negócio</p>
      </header>

      {!insight && !isLoading && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">Otimize seu Fluxo</h3>
          <p className="text-xs text-slate-500 mb-6">A IA analisa suas vendas e despesas recentes para sugerir melhorias estratégicas.</p>
          <button 
            onClick={generateInsight}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl text-xs uppercase tracking-widest"
          >
            <BrainCircuit size={18} /> Gerar Análise
          </button>
        </div>
      )}

      {isLoading && (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center shadow-sm">
          <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={40} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Consultando especialista...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl text-rose-600 flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      {insight && (
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 mb-6 text-indigo-600 font-black uppercase text-[10px] tracking-widest">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
            Diagnóstico Gerado
          </div>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
            {insight}
          </div>
          <button 
            onClick={() => setInsight(null)}
            className="mt-8 w-full py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest border-t border-slate-50"
          >
            Nova Consulta
          </button>
        </div>
      )}
    </div>
  );
};

export default AIInsightsView;
