import React, { useState, useEffect } from 'react';
import { reportService } from '../services';
import { FileBarChart, Download, Calendar, Filter } from 'lucide-react';
import '../pages/Tickets.css';

export const Reports: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState<any[]>([]);
    const [selectedType, setSelectedType] = useState('tickets');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            const response = await reportService.getAll();
            setReports(response.data);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
        }
    };

    const handleGenerateReport = async () => {
        if (!title.trim()) {
            alert('Por favor, informe um título para o relatório');
            return;
        }

        setLoading(true);
        try {
            await reportService.generate({
                type: selectedType,
                title,
                description,
                format: 'excel'
            });

            alert('Relatório gerado com sucesso!');
            setTitle('');
            setDescription('');
            loadReports();
        } catch (error: any) {
            console.error('Erro ao gerar relatório:', error);
            alert(error.response?.data?.message || 'Erro ao gerar relatório');
        } finally {
            setLoading(false);
        }
    };

    const reportTypes = [
        { value: 'tickets', label: 'Tickets', icon: '🎫' },
        { value: 'assets', label: 'Ativos', icon: '💻' },
        { value: 'certificates', label: 'Certificados', icon: '🔒' },
        { value: 'users', label: 'Usuários', icon: '👥' },
        { value: 'kb', label: 'Base de Conhecimento', icon: '📚' },
        { value: 'boletos', label: 'Boletos', icon: '💰' }
    ];

    return (
        <div className="tickets-page">
            <div className="page-header">
                <div>
                    <h1>Relatórios</h1>
                    <p>Gere relatórios detalhados de todos os módulos do sistema</p>
                </div>
            </div>

            <div className="report-generator" style={{
                background: 'white',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileBarChart size={24} />
                    Gerar Novo Relatório
                </h2>

                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                        <label>Tipo de Relatório *</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            {reportTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Título do Relatório *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Relatório Mensal de Tickets"
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Descrição (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Adicione uma descrição para este relatório..."
                            rows={3}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                </div>

                <button
                    className="btn-primary"
                    onClick={handleGenerateReport}
                    disabled={loading}
                    style={{ marginTop: '16px' }}
                >
                    <Download size={20} />
                    {loading ? 'Gerando...' : 'Gerar e Baixar Relatório'}
                </button>
            </div>

            <div className="reports-history" style={{
                background: 'white',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={24} />
                    Histórico de Relatórios
                </h2>

                {reports.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
                        Nenhum relatório gerado ainda
                    </p>
                ) : (
                    <div className="tickets-table-container">
                        <table className="tickets-table">
                            <thead>
                                <tr>
                                    <th>Título</th>
                                    <th>Tipo</th>
                                    <th>Registros</th>
                                    <th>Status</th>
                                    <th>Criado Por</th>
                                    <th>Data de Criação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report._id}>
                                        <td><strong>{report.title}</strong></td>
                                        <td>
                                            {reportTypes.find(t => t.value === report.type)?.icon}{' '}
                                            {reportTypes.find(t => t.value === report.type)?.label}
                                        </td>
                                        <td>{report.recordCount}</td>
                                        <td>
                                            <span className="status-badge" style={{
                                                backgroundColor:
                                                    report.status === 'completed' ? '#10b981' :
                                                        report.status === 'processing' ? '#f59e0b' :
                                                            report.status === 'failed' ? '#ef4444' : '#64748b'
                                            }}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td>{report.createdBy?.name || 'N/A'}</td>
                                        <td>{new Date(report.createdAt).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
