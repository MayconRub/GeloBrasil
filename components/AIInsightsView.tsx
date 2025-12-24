
import React, { useState, useEffect } from 'react';
// Fix: Added missing AlertCircle icon to imports
import { Sparkles, BrainCircuit, Lightbulb, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
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
      // Fix: Follow @google/genai initialization guidelines strictly using process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const salesSummary = data.sales.slice(0, 50).map(s => `Venda: ${s.value} em ${s.date}`).join('; ');
      const expensesSummary = data.expenses.slice(0, 50).map(e => `Despesa: ${e.description}, ${e.value}, vence ${e.dueDate}, status ${e.status}`).join('; ');

      const prompt = `
        Aja como um consultor financeiro sênior. Analise os seguintes dados reais da empresa:
        Vendas Recentes: ${salesSummary || 'Nenhuma registrada ainda.'}
        Despesas Recentes: ${expensesSummary || 'Nenhuma registrada ainda.'}

        Com base nesses dados:
        1. Dê um diagnóstico rápido do fluxo de caixa.
        2. Aponte despesas críticas ou padrões de gastos.
        3. Dê 3 conselhos práticos para aumentar o lucro ou reduzir custos.
        
        Responda em Português do Brasil, use Markdown para formatação e seja direto e profissional.
      `;

      // Fix: Use gemini-3-pro-preview for complex reasoning tasks as per guidelines
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });

      // Fix: Use the .text property directly as per guidelines
      setInsight(response.text || "Não foi possível gerar insights no momento.");
    } catch (err: any) {
      console.error(err);
      setError("Erro ao conectar com o Gemini AI. Verifique se o sistema possui permissões de rede.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-indigo-500" /> Consultoria AI
          </h2>
          <p className="text-slate-500">Inteligência artificial analisando seus números reais.</p>
        </div>
        <button 
          onClick={generateInsight}
          disabled={isLoading}
          className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
          {insight ? 'Atualizar Análise' : 'Gerar Insights Agora'}
        </button>
      </header>

      {!insight && !isLoading && !error && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Pronto para otimizar seu negócio?</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Clique no botão acima para que o Gemini AI analise seus lançamentos de vendas e despesas. Você receberá um diagnóstico completo e conselhos personalizados.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={48} />
          <p className="text-slate-600 font-medium animate-pulse">O cérebro digital está processando seus dados financeiros...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-xl text-rose-700 flex items-start gap-4">
          {/* Fix: AlertCircle is now imported */}
          <AlertCircle className="shrink-0" />
          <div>
            <h4 className="font-bold">Ops! Algo deu errado.</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {insight && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm prose prose-indigo max-w-none">
          <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold uppercase tracking-widest text-xs">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
            Relatório de Performance Gerado
          </div>
          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
            {insight}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightsView;
