import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import ResidentDetail from './components/ResidentDetail';
import { Resident, DailyLog } from './types';
import { Users, AlertCircle, Calendar } from 'lucide-react';
import { suggestActivities } from './services/geminiService';

// MOCK DATA GENERATORS
const generateMockResidents = (): Resident[] => [
  {
    id: '1',
    name: 'Alberto Santos',
    age: 82,
    roomNumber: '101-A',
    admissionDate: '2023-05-12',
    photoUrl: 'https://picsum.photos/200/200?random=1',
    medicalConditions: ['Hipertensão', 'Diabetes Tipo 2'],
    allergies: ['Penicilina'],
    dietaryRestrictions: 'Hipossódica, Sem açúcar',
    mobilityStatus: 'Cane',
    medications: [
      { id: 'm1', name: 'Losartana', dosage: '50mg', frequency: '12/12h', nextDue: '20:00' },
      { id: 'm2', name: 'Metformina', dosage: '850mg', frequency: '24/24h', nextDue: '08:00' }
    ],
    emergencyContact: { name: 'Maria Santos', phone: '(11) 99999-1234', relation: 'Filha' }
  },
  {
    id: '2',
    name: 'Helena Oliveira',
    age: 91,
    roomNumber: '102-B',
    admissionDate: '2024-01-15',
    photoUrl: 'https://picsum.photos/200/200?random=2',
    medicalConditions: ['Alzheimer (Estágio Inicial)', 'Artrose'],
    allergies: [],
    dietaryRestrictions: 'Pastosa',
    mobilityStatus: 'Wheelchair',
    medications: [
      { id: 'm3', name: 'Donepezila', dosage: '10mg', frequency: '24/24h', nextDue: '21:00' }
    ],
    emergencyContact: { name: 'Roberto Oliveira', phone: '(11) 98888-5678', relation: 'Sobrinho' }
  },
   {
    id: '3',
    name: 'João Pedro Costa',
    age: 78,
    roomNumber: '103-A',
    admissionDate: '2023-11-20',
    photoUrl: 'https://picsum.photos/200/200?random=3',
    medicalConditions: ['DPOC'],
    allergies: ['Frutos do mar'],
    dietaryRestrictions: 'Geral',
    mobilityStatus: 'Independent',
    medications: [],
    emergencyContact: { name: 'Carla Costa', phone: '(11) 97777-4321', relation: 'Filha' }
  }
];

const generateMockLogs = (): DailyLog[] => {
  const logs: DailyLog[] = [];
  const residents = generateMockResidents();
  const types: DailyLog['type'][] = ['VITALS', 'MEAL', 'MEDICATION', 'NOTE'];
  
  // Generate logs for the last 5 days
  residents.forEach(res => {
    for (let i = 0; i < 15; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 5));
        date.setHours(Math.floor(Math.random() * 12) + 8);
        
        let log: DailyLog = {
            id: `${res.id}-${i}`,
            residentId: res.id,
            timestamp: date.toISOString(),
            type,
            description: '',
            staffName: 'Enf. Maria'
        };

        if (type === 'VITALS') {
            log.description = 'Aferição de rotina';
            log.vitals = {
                systolic: 110 + Math.floor(Math.random() * 30),
                diastolic: 70 + Math.floor(Math.random() * 15),
                heartRate: 60 + Math.floor(Math.random() * 20),
                temperature: 36 + Math.random(),
                oxygenSaturation: 94 + Math.floor(Math.random() * 5)
            };
        } else if (type === 'MEAL') {
            log.description = 'Almoço: Aceitou bem a dieta.';
        } else if (type === 'MEDICATION') {
            log.description = 'Medicação matinal administrada.';
        } else {
            log.description = 'Residente tranquilo, interagindo com outros.';
        }
        logs.push(log);
    }
  });
  return logs;
};

// --- COMPONENTS ---

const Dashboard: React.FC<{ residents: Resident[] }> = ({ residents }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-800">Painel Geral</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <Users size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 font-medium">Total de Residentes</p>
                        <p className="text-3xl font-bold text-slate-800">{residents.length}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 font-medium">Atenção Necessária</p>
                        <p className="text-3xl font-bold text-slate-800">1</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <Calendar size={32} />
                    </div>
                    <div>
                        <p className="text-slate-500 font-medium">Atividades Hoje</p>
                        <p className="text-3xl font-bold text-slate-800">3</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-semibold text-lg text-slate-800 mb-4">Próximas Tarefas</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border-l-4 border-blue-500 transition-colors">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5" />
                            <div>
                                <p className="font-medium text-slate-800">Medicação das 14:00</p>
                                <p className="text-xs text-slate-500">3 Residentes</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border-l-4 border-green-500 transition-colors">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5" />
                            <div>
                                <p className="font-medium text-slate-800">Lanche da Tarde</p>
                                <p className="text-xs text-slate-500">Refeitório Principal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border-l-4 border-purple-500 transition-colors">
                            <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500 h-5 w-5" />
                            <div>
                                <p className="font-medium text-slate-800">Troca de Curativo (Sr. Alberto)</p>
                                <p className="text-xs text-slate-500">Quarto 101-A</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 rounded-xl shadow-md text-white">
                    <h3 className="font-bold text-xl mb-2">Lembrete do Turno</h3>
                    <p className="opacity-90 mb-4">Lembre-se de registrar todos os sinais vitais antes da troca de turno às 19:00.</p>
                    <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                        <p className="text-sm font-semibold">Aviso da Nutrição</p>
                        <p className="text-sm opacity-80">Sra. Helena está com dieta pastosa restrita hoje devido à dificuldade de deglutição observada ontem.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResidentList: React.FC<{ residents: Resident[] }> = ({ residents }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Residentes</h1>
                <input 
                    type="text" 
                    placeholder="Buscar residente..." 
                    className="border border-slate-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {residents.map(res => (
                    <Link to={`/residents/${res.id}`} key={res.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-200">
                                <img src={res.photoUrl} alt={res.name} className="h-full w-full object-cover" />
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                res.mobilityStatus === 'Independent' ? 'bg-green-100 text-green-700' :
                                res.mobilityStatus === 'Bedbound' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {res.mobilityStatus === 'Independent' ? 'Independente' : 
                                 res.mobilityStatus === 'Bedbound' ? 'Acamado' : 'Mobilidade Reduzida'}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary-600 transition-colors">{res.name}</h3>
                        <p className="text-slate-500 text-sm mb-4">{res.age} Anos • Quarto {res.roomNumber}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                            {res.medicalConditions.slice(0, 2).map(c => (
                                <span key={c} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">{c}</span>
                            ))}
                            {res.medicalConditions.length > 2 && <span className="text-xs text-slate-400 py-1">+{res.medicalConditions.length - 2}</span>}
                        </div>
                        
                        <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-500">Próxima medicação</span>
                            <span className="text-xs font-bold text-primary-600">{res.medications[0]?.nextDue || '-'}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

const Activities: React.FC<{ residents: Resident[] }> = ({ residents }) => {
    const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const handleGetSuggestion = async (resident: Resident) => {
        setLoading(prev => ({...prev, [resident.id]: true}));
        const activities = await suggestActivities(resident);
        setSuggestions(prev => ({...prev, [resident.id]: activities}));
        setLoading(prev => ({...prev, [resident.id]: false}));
    };

    return (
        <div className="space-y-6 animate-fade-in">
             <h1 className="text-2xl font-bold text-slate-800">Planejamento de Atividades (IA)</h1>
             <p className="text-slate-600">Utilize a inteligência artificial para sugerir atividades personalizadas baseadas no perfil cognitivo e físico de cada residente.</p>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {residents.map(res => (
                    <div key={res.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{res.name}</h3>
                                <p className="text-sm text-slate-500">{res.mobilityStatus}</p>
                            </div>
                            <button 
                                onClick={() => handleGetSuggestion(res)}
                                disabled={loading[res.id]}
                                className="text-sm bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg font-medium hover:bg-primary-100 disabled:opacity-50"
                            >
                                {loading[res.id] ? 'Gerando...' : 'Sugerir Atividades'}
                            </button>
                        </div>

                        {suggestions[res.id] ? (
                            <ul className="space-y-2">
                                {suggestions[res.id].map((act, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded">
                                        <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                                        {act}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-6 text-center text-slate-400 text-sm">
                                Nenhuma sugestão gerada ainda.
                            </div>
                        )}
                    </div>
                ))}
             </div>
        </div>
    )
}

function App() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);

  // Initialize Data
  useEffect(() => {
    setResidents(generateMockResidents());
    setLogs(generateMockLogs());
  }, []);

  const addLog = (newLog: DailyLog) => {
    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard residents={residents} />} />
          <Route path="/residents" element={<ResidentList residents={residents} />} />
          <Route path="/residents/:id" element={<ResidentDetail residents={residents} logs={logs} addLog={addLog} />} />
          <Route path="/activities" element={<Activities residents={residents} />} />
          <Route path="/health" element={<div className="text-center text-slate-500 mt-20">Módulo de análise global de saúde em desenvolvimento.</div>} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;