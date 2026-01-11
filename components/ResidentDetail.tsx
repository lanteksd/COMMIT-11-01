import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Resident, DailyLog, VitalSigns } from '../types';
import { ArrowLeft, Activity, Plus, FileText, BrainCircuit, AlertTriangle, Pill } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { generateClinicalSummary, checkVitalSignsAnomaly } from '../services/geminiService';

interface ResidentDetailProps {
  residents: Resident[];
  logs: DailyLog[];
  addLog: (log: DailyLog) => void;
}

const ResidentDetail: React.FC<ResidentDetailProps> = ({ residents, logs, addLog }) => {
  const { id } = useParams<{ id: string }>();
  const resident = residents.find(r => r.id === id);
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'logs'>('overview');
  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  // New Log State
  const [showLogForm, setShowLogForm] = useState(false);
  const [logType, setLogType] = useState<DailyLog['type']>('NOTE');
  const [logDesc, setLogDesc] = useState('');
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [hr, setHr] = useState('');

  const residentLogs = useMemo(() => 
    logs.filter(l => l.residentId === id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  [logs, id]);

  const vitalLogs = useMemo(() => 
    residentLogs
      .filter(l => l.type === 'VITALS' && l.vitals)
      .map(l => ({
        date: new Date(l.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        fullDate: new Date(l.timestamp).toLocaleString(),
        ...l.vitals
      }))
      .reverse() // Oldest to newest for chart
  , [residentLogs]);

  const handleGenerateSummary = async () => {
    if (!resident) return;
    setLoadingSummary(true);
    const result = await generateClinicalSummary(resident, residentLogs.slice(0, 10)); // Analyze last 10 logs
    setSummary(result);
    setLoadingSummary(false);
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resident) return;

    let vitals: VitalSigns | undefined = undefined;
    if (logType === 'VITALS') {
      vitals = {
        systolic: Number(sys),
        diastolic: Number(dia),
        heartRate: Number(hr),
        temperature: 36.5, // Default for demo simplicity
        oxygenSaturation: 98 // Default
      };

      // AI Check on Vitals
      const history = vitalLogs.slice(-3); // Last 3
      const warningMessage = await checkVitalSignsAnomaly(vitals, history);
      if (warningMessage) {
        window.alert(`ALERTA AI: ${warningMessage}`);
      }
    }

    const newLog: DailyLog = {
      id: Date.now().toString(),
      residentId: resident.id,
      timestamp: new Date().toISOString(),
      type: logType,
      description: logDesc,
      vitals,
      staffName: 'Enf. Maria Silva'
    };

    addLog(newLog);
    setShowLogForm(false);
    setLogDesc('');
    setSys('');
    setDia('');
    setHr('');
  };

  if (!resident) return <div>Residente não encontrado.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/residents" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{resident.name}</h1>
          <p className="text-slate-500 flex items-center gap-2">
            Quarto {resident.roomNumber} • {resident.age} anos • Admissão: {new Date(resident.admissionDate).toLocaleDateString()}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
            <button 
                onClick={() => setShowLogForm(!showLogForm)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2 shadow-sm transition-all"
            >
                <Plus size={18} /> Novo Registro
            </button>
        </div>
      </div>

      {/* Quick Stats / Warning Banner */}
      {resident.mobilityStatus === 'Bedbound' && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
                <h4 className="font-semibold text-amber-800">Atenção: Risco de Úlcera por Pressão</h4>
                <p className="text-sm text-amber-700">Residente acamado. Realizar mudança de decúbito a cada 2 horas.</p>
            </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'overview' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            Visão Geral
        </button>
        <button 
            onClick={() => setActiveTab('health')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'health' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            Monitoramento de Saúde
        </button>
        <button 
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'logs' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
            Histórico de Logs
        </button>
      </div>

      {/* Add Log Modal (Inline for simplicity) */}
      {showLogForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 mb-6">
            <h3 className="font-semibold text-lg mb-4">Novo Registro</h3>
            <form onSubmit={handleAddLog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                        <select 
                            value={logType} 
                            onChange={(e) => setLogType(e.target.value as any)}
                            className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="NOTE">Anotação Geral</option>
                            <option value="VITALS">Sinais Vitais</option>
                            <option value="MEDICATION">Medicação</option>
                            <option value="MEAL">Refeição</option>
                        </select>
                    </div>
                    {logType === 'VITALS' && (
                        <div className="flex gap-2">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">PAS (Sys)</label>
                                <input required type="number" value={sys} onChange={e => setSys(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="120" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">PAD (Dia)</label>
                                <input required type="number" value={dia} onChange={e => setDia(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="80" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">BPM</label>
                                <input required type="number" value={hr} onChange={e => setHr(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="72" />
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                    <textarea 
                        required 
                        value={logDesc} 
                        onChange={e => setLogDesc(e.target.value)} 
                        className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none h-24"
                        placeholder="Descreva a ocorrência..."
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowLogForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Salvar Registro</button>
                </div>
            </form>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                {/* AI Summary Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-primary-700">
                            <BrainCircuit size={24} />
                            <h3 className="font-semibold text-lg">Resumo Clínico IA</h3>
                        </div>
                        <button 
                            onClick={handleGenerateSummary}
                            disabled={loadingSummary}
                            className="text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full hover:bg-primary-100 disabled:opacity-50"
                        >
                            {loadingSummary ? 'Gerando...' : 'Atualizar Análise'}
                        </button>
                    </div>
                    {summary ? (
                        <div className="prose prose-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                           <p className="whitespace-pre-line">{summary}</p>
                        </div>
                    ) : (
                        <p className="text-slate-400 text-center py-4 italic">Clique em atualizar para gerar um resumo da evolução recente do paciente.</p>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-semibold text-lg mb-4">Informações Médicas</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm text-slate-500 block">Condições</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {resident.medicalConditions.map(c => (
                                    <span key={c} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">{c}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-slate-500 block">Mobilidade</span>
                            <span className="text-slate-800 font-medium">{resident.mobilityStatus}</span>
                        </div>
                        <div>
                            <span className="text-sm text-slate-500 block">Alergias</span>
                            <span className="text-red-600 font-medium">{resident.allergies.join(', ') || 'Nenhuma'}</span>
                        </div>
                        <div>
                            <span className="text-sm text-slate-500 block">Dieta</span>
                            <span className="text-slate-800 font-medium">{resident.dietaryRestrictions}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Medications */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Pill size={20} className="text-purple-500" /> Medicações
                    </h3>
                    <div className="space-y-3">
                        {resident.medications.map(med => (
                            <div key={med.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <p className="font-medium text-slate-800">{med.name}</p>
                                    <p className="text-xs text-slate-500">{med.dosage} • {med.frequency}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Próx: {med.nextDue}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 {/* Emergency Contact */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-semibold text-lg mb-2">Contato de Emergência</h3>
                    <p className="font-medium text-slate-900">{resident.emergencyContact.name} ({resident.emergencyContact.relation})</p>
                    <p className="text-slate-600 text-lg">{resident.emergencyContact.phone}</p>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-lg mb-6">Evolução da Pressão Arterial (Últimos Registros)</h3>
            <div className="h-[400px] w-full">
                {vitalLogs.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitalLogs}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" />
                        <YAxis stroke="#64748b" domain={['auto', 'auto']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            labelStyle={{ color: '#64748b' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="systolic" name="Sistólica (Alta)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="diastolic" name="Diastólica (Baixa)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        Nenhum registro de sinais vitais encontrado.
                    </div>
                )}
            </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Data/Hora</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Tipo</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Descrição</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Responsável</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {residentLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleDateString()} <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full 
                                    ${log.type === 'VITALS' ? 'bg-red-100 text-red-700' : 
                                      log.type === 'MEDICATION' ? 'bg-purple-100 text-purple-700' :
                                      log.type === 'MEAL' ? 'bg-orange-100 text-orange-700' :
                                      'bg-slate-100 text-slate-700'}`}>
                                    {log.type}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-800">
                                {log.description}
                                {log.vitals && (
                                    <div className="text-xs text-slate-500 mt-1">
                                        BP: {log.vitals.systolic}/{log.vitals.diastolic} | BPM: {log.vitals.heartRate}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{log.staffName}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {residentLogs.length === 0 && (
                <div className="p-8 text-center text-slate-500">Nenhum histórico disponível.</div>
            )}
        </div>
      )}
    </div>
  );
};

export default ResidentDetail;